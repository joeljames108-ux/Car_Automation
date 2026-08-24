// ============================================================================
// GLB PBR POST-PROCESSOR & MATERIAL ENHANCER (Node-side, @gltf-transform based)
// ============================================================================
// Reads any .glb binary, upgrades materials with Khronos PBR extensions for
// photoreal rendering (clearcoat automotive paint, real transmission glass,
// boosted emissive lighting elements), tunes rubber/metal response curves,
// repairs broken PBR on imported scan assets, optionally merges triangle
// primitives into per-material draw calls, and writes the result back.
// Fully idempotent and texture-preserving.
// Used by the hood/chassis export pipelines, master exporter, and the
// enhance-existing-glbs CLI.
// ============================================================================

import * as fs from "fs";
import * as path from "path";
import { NodeIO } from "@gltf-transform/core";
import type { Document, Accessor } from "@gltf-transform/core";
import {
  ALL_EXTENSIONS,
  KHRMaterialsClearcoat,
  KHRMaterialsTransmission,
  KHRMaterialsIOR,
  KHRMaterialsEmissiveStrength,
} from "@gltf-transform/extensions";

export interface GlbEnhanceReport {
  file: string;
  bytesBefore: number;
  bytesAfter: number;
  nodes: number;
  meshes: number;
  materials: number;
}

export interface GlbEnhanceOptions {
  /**
   * When a file contains at least this many meshes (typical of imported
   * scan assets), merge all triangle primitives that share a material and
   * attribute layout into single draw calls. Original nodes are preserved
   * as empty name-holders so any runtime name lookups keep working.
   * Leave undefined to disable joining entirely (safe default).
   */
  joinMeshesOver?: number;
}

const CLEARCOAT_KEYWORDS = [
  "paint", "clearcoat", "body", "panel", "hood", "door", "fender", "wing",
  "roof", "bumper", "trunk", "decklid", "quarter",
];
const CARBON_KEYWORDS = ["carbon", "dry_carbon", "twill"];
const GLASS_KEYWORDS = ["glass", "windshield", "windscreen", "backlite", "window", "lens", "quartz"];
const RUBBER_KEYWORDS = ["rubber", "tire", "tyre", "epdm", "elastomer", "gasket", "seal"];
const EMISSIVE_KEYWORDS = ["emissive", "oled", "led", "fia", "light", "glow", "indicator", "strobe"];

// Scan-correction dictionaries: fix Sketchfab-style exports where everything
// is exported fully metallic and/or in unnecessary BLEND alpha mode.
const SCAN_TRUE_METAL_KEYWORDS = [
  "nut", "bolt", "screw", "chrome", "exhaust", "muffler", "tailpipe", "rim",
  "wheel", "mugen", "steel", "brake", "rotor", "caliper", "suspension", "axle",
];
const SCAN_NONMETAL_KEYWORDS = [
  "paint", "body", "textured", "coloured", "colored", "interior", "grille",
  "carbon", "badge", "plate", "dash", "tilling", "trim", "fabric", "seat",
  "carpet", "plastic", "detail", "base_material", "base_", "manufacturer",
  "enginea", "lighta", "lightemissive", "windowa", "windowinside", "window_",
];
const SCAN_WINDOW_KEYWORDS = ["window", "windshield", "windscreen", "backlite"];
const SCAN_LAMP_KEYWORDS = ["emis", "red_glass", "lightemissive", "lamp"];

function matchesAny(name: string, keywords: string[]): boolean {
  const n = name.toLowerCase();
  return keywords.some((k) => n.includes(k));
}

// â”€â”€ Draw-call reducer helpers (column-major mat4, glTF layout) â”€â”€

const MAT4_IDENTITY: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function mat4Multiply(b: number[], a: number[]): number[] {
  const out = new Array<number>(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function transformPoint(m: number[], x: number, y: number, z: number): [number, number, number] {
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
  ];
}

function normalFromMat4(m: number[]): number[] {
  const a = [m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]];
  const det =
    a[0] * (a[4] * a[8] - a[5] * a[7]) -
    a[1] * (a[3] * a[8] - a[5] * a[6]) +
    a[2] * (a[3] * a[7] - a[4] * a[6]);

  if (Math.abs(det) < 1e-10) {
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  const invDet = 1 / det;
  return [
    (a[4] * a[8] - a[5] * a[7]) * invDet,
    (a[2] * a[7] - a[1] * a[8]) * invDet,
    (a[1] * a[5] - a[2] * a[4]) * invDet,
    (a[5] * a[6] - a[3] * a[8]) * invDet,
    (a[0] * a[8] - a[2] * a[6]) * invDet,
    (a[2] * a[3] - a[0] * a[7]) * invDet,
    (a[3] * a[7] - a[4] * a[6]) * invDet,
    (a[1] * a[6] - a[0] * a[8]) * invDet,
    (a[0] * a[4] - a[1] * a[3]) * invDet,
  ];
}

function transformDirection(nm: number[], x: number, y: number, z: number): [number, number, number] {
  const tx = nm[0] * x + nm[3] * y + nm[6] * z;
  const ty = nm[1] * x + nm[4] * y + nm[7] * z;
  const tz = nm[2] * x + nm[5] * y + nm[8] * z;
  const len = Math.hypot(tx, ty, tz) || 1;
  return [tx / len, ty / len, tz / len];
}

function attrToArray(acc: Accessor): number[] {
  const arr = acc.getArray();
  if (!arr) return [];
  return Array.from(arr);
}

/**
 * Merges triangle primitives sharing the same material and attribute layout
 * into one draw call per group. World transforms are baked into vertex data;
 * original nodes remain as named empties so runtime name lookups survive.
 * Skinned primitives (JOINTS/WEIGHTS semantics) stay untouched on their nodes.
 */
function joinMeshesByMaterial(document: Document): number {
  const scenes = document.getRoot().listScenes();
  if (scenes.length === 0) return 0;
  const scene = scenes[0];

  interface JoinGroup {
    material: import("@gltf-transform/core").Material | null;
    positions: number[];
    normals: number[];
    tangents: number[];
    other: Map<string, { data: number[]; size: number }>;
    indices: number[];
  }

  const rootBuffers = document.getRoot().listBuffers();
const buffer = rootBuffers.length > 0 ? rootBuffers[0] : document.createBuffer("JoinedDrawCallGeometry");
  const groups = new Map<string, JoinGroup>();

  const visitNode = (node: any, parentWorld: number[]): void => {
    const worldMatrix = mat4Multiply(node.getMatrix(), parentWorld);
    const mesh = node.getMesh();

    if (mesh && mesh.listPrimitives().length > 0) {
      const allPrimsJoinable = mesh.listPrimitives().every((p: any) => {
        if (p.getMode() !== 4 || p.listTargets().length > 0) return false;
        return !p.listSemantics().some((s: string) => s.startsWith("JOINTS") || s.startsWith("WEIGHTS"));
      });

      if (allPrimsJoinable) {
        for (const prim of mesh.listPrimitives()) {
          const material = prim.getMaterial();
          const semantics: string[] = prim.listSemantics().sort();
          const key = `${material ? material.getName() || "unnamed" : "none"}|${semantics.join(",")}`;

          let g = groups.get(key);
          if (!g) {
            g = { material, positions: [], normals: [], tangents: [], other: new Map(), indices: [] };
            groups.set(key, g);
          }

          const vertexOffset = g.positions.length / 3;
          const posArr = attrToArray(prim.getAttribute("POSITION")!);

          const nm = normalFromMat4(worldMatrix);
          for (let i = 0; i < posArr.length; i += 3) {
            const [tx, ty, tz] = transformPoint(worldMatrix, posArr[i], posArr[i + 1], posArr[i + 2]);
            g.positions.push(tx, ty, tz);
          }

          const normAttr = prim.getAttribute("NORMAL");
          if (normAttr) {
            const arr = attrToArray(normAttr);
            for (let i = 0; i < arr.length; i += 3) {
              const [tx, ty, tz] = transformDirection(nm, arr[i], arr[i + 1], arr[i + 2]);
              g.normals.push(tx, ty, tz);
            }
          }

          const tanAttr = prim.getAttribute("TANGENT");
          if (tanAttr) {
            const arr = attrToArray(tanAttr);
            for (let i = 0; i < arr.length; i += 4) {
              const [tx, ty, tz] = transformDirection(nm, arr[i], arr[i + 1], arr[i + 2]);
              g.tangents.push(tx, ty, tz, arr[i + 3]);
            }
          }

          for (const sem of semantics) {
            if (sem === "POSITION" || sem === "NORMAL" || sem === "TANGENT") continue;
            const srcAcc = prim.getAttribute(sem)!;
            const src = attrToArray(srcAcc);
            const elemCount = src.length / Math.max(1, srcAcc.count);
            let dst = g.other.get(sem);
            if (!dst) {
              dst = { data: [], size: elemCount };
              g.other.set(sem, dst);
            }
            for (let i = 0; i < src.length; i++) dst.data.push(src[i]);
          }

          const indices = prim.getIndices();
          const vertCount = posArr.length / 3;
          if (indices) {
            const idxArr = attrToArray(indices);
            for (let i = 0; i < idxArr.length; i++) g.indices.push(idxArr[i] + vertexOffset);
          } else {
            for (let i = 0; i < vertCount; i++) g.indices.push(vertexOffset + i);
          }
        }

        node.setMesh(null);
        mesh.dispose();
      }
    }

    for (const child of node.listChildren()) visitNode(child, worldMatrix);
  };

  for (const rootChild of scene.listChildren()) visitNode(rootChild, MAT4_IDENTITY.slice());

  let groupIdx = 0;
  for (const [, g] of groups) {
    if (g.indices.length < 3) continue;
    groupIdx++;

    const safeName = (g.material?.getName() || "Default").replace(/\W+/g, "_").slice(0, 40);
    const joinedNode = document.createNode(`Joined_Mesh_${safeName}_${groupIdx}`);
    const joinedMesh = document.createMesh(`JoinedMesh_${safeName}_${groupIdx}`);
    const prim = document.createPrimitive();

    if (g.material) prim.setMaterial(g.material);
    prim.setMode(4);
    prim.setIndices(
      document.createAccessor(`idx_${groupIdx}`, buffer).setArray(new Uint32Array(g.indices))
    );
    prim.setAttribute(
      "POSITION",
      document.createAccessor(`pos_${groupIdx}`, buffer).setArray(new Float32Array(g.positions))
    );

    if (g.normals.length === g.positions.length) {
      prim.setAttribute(
        "NORMAL",
        document.createAccessor(`nrm_${groupIdx}`, buffer).setArray(new Float32Array(g.normals))
      );
    }
    if (g.tangents.length === (g.positions.length / 3) * 4) {
      prim.setAttribute(
        "TANGENT",
        document.createAccessor(`tan_${groupIdx}`, buffer).setArray(new Float32Array(g.tangents))
      );
    }
    for (const [sem, payload] of g.other) {
      const accName = `${sem.replace(/\W+/g, "_")}_${groupIdx}`;
      prim.setAttribute(sem, document.createAccessor(accName, buffer).setArray(new Float32Array(payload.data)));
    }

    joinedMesh.addPrimitive(prim);
    joinedNode.setMesh(joinedMesh);
    scene.addChild(joinedNode);
  }

  return groupIdx;
}


/**
 * Enhances a single binary GLB buffer with PBR extensions and material tuning.
 */
export async function enhanceGlbBuffer(inputBuffer: Buffer, options: GlbEnhanceOptions = {}): Promise<Buffer> {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.readBinary(inputBuffer);

  if (options.joinMeshesOver !== undefined) {
    const meshCount = document.getRoot().listMeshes().length;
    if (meshCount >= options.joinMeshesOver) {
      joinMeshesByMaterial(document);
    }
  }

  const clearcoatExt = document.createExtension(KHRMaterialsClearcoat).setRequired(false);
  const transmissionExt = document.createExtension(KHRMaterialsTransmission).setRequired(false);
  const iorExt = document.createExtension(KHRMaterialsIOR).setRequired(false);
  const emissiveStrengthExt = document.createExtension(KHRMaterialsEmissiveStrength).setRequired(false);

  for (const material of document.getRoot().listMaterials()) {
    const name = material.getName() || "";

    if (matchesAny(name, CLEARCOAT_KEYWORDS)) {
      const clearcoat = clearcoatExt.createClearcoat().setClearcoatFactor(0.9).setClearcoatRoughnessFactor(0.08);
      material.setExtension("KHR_materials_clearcoat", clearcoat);
    } else if (matchesAny(name, CARBON_KEYWORDS)) {
      const clearcoat = clearcoatExt.createClearcoat().setClearcoatFactor(0.6).setClearcoatRoughnessFactor(0.2);
      material.setExtension("KHR_materials_clearcoat", clearcoat);
    }

    const alphaMode = material.getAlphaMode();
    const opacity = material.getAlpha();
    if (matchesAny(name, GLASS_KEYWORDS) || alphaMode === "BLEND" || opacity < 0.55) {
      const transmission = transmissionExt.createTransmission().setTransmissionFactor(0.82);
      material.setExtension("KHR_materials_transmission", transmission);
      const ior = iorExt.createIOR().setIOR(1.52);
      material.setExtension("KHR_materials_ior", ior);
    }

    if (matchesAny(name, EMISSIVE_KEYWORDS)) {
      const emissive = material.getEmissiveFactor();
      const hasEmissive = emissive.some((c) => c > 0.001);
      if (hasEmissive) {
        const strength = emissiveStrengthExt.createEmissiveStrength().setEmissiveStrength(2.8);
        material.setExtension("KHR_materials_emissive_strength", strength);
      }
    }

    if (matchesAny(name, RUBBER_KEYWORDS)) {
      if (material.getRoughnessFactor() < 0.85) {
        material.setRoughnessFactor(0.9);
      }
      if (material.getMetallicFactor() > 0.1) {
        material.setMetallicFactor(0.05);
      }
    }

    // â”€â”€ Scan-correction stage: repair broken PBR on imported car scans â”€â”€
    const metal = material.getMetallicFactor();
    const isTrueMetal = matchesAny(name, SCAN_TRUE_METAL_KEYWORDS);
    const isNonMetal = matchesAny(name, SCAN_NONMETAL_KEYWORDS);

    if (!isTrueMetal && isNonMetal && metal > 0.5) {
      material.setMetallicFactor(0.12);
      if (material.getRoughnessFactor() > 0.7 && !matchesAny(name, ["carbon"])) {
        material.setRoughnessFactor(0.42);
      }
    }

    if (material.getAlphaMode() === "BLEND" && material.getAlpha() >= 0.99 && !matchesAny(name, GLASS_KEYWORDS)) {
      material.setAlphaMode("OPAQUE");
    }

    if (matchesAny(name, SCAN_WINDOW_KEYWORDS)) {
      if (material.getRoughnessFactor() > 0.25) {
        material.setRoughnessFactor(0.18);
      }
      const transmission = transmissionExt.createTransmission().setTransmissionFactor(0.78);
      material.setExtension("KHR_materials_transmission", transmission);
      const ior = iorExt.createIOR().setIOR(1.52);
      material.setExtension("KHR_materials_ior", ior);
    }

    if (matchesAny(name, SCAN_LAMP_KEYWORDS)) {
      const n = name.toLowerCase();
      let emissiveColor: [number, number, number] = [0.9, 0.88, 0.8];
      if (n.includes("red_glass")) emissiveColor = [0.85, 0.06, 0.04];
      else if (n.includes("blue")) emissiveColor = [0.12, 0.38, 0.95];
      else if (n.includes("lightemissive") || n.includes("lamp")) emissiveColor = [0.95, 0.92, 0.82];
      material.setEmissiveFactor(emissiveColor);
      const strength = emissiveStrengthExt.createEmissiveStrength().setEmissiveStrength(1.6);
      material.setExtension("KHR_materials_emissive_strength", strength);
    }
  }

  const outputUint8 = await io.writeBinary(document);
  return Buffer.from(outputUint8);
}

/**
 * Enhances a single .glb file in place and returns a report entry.
 */
export async function enhanceGlbFile(filePath: string, options: GlbEnhanceOptions = {}): Promise<GlbEnhanceReport> {
  const bytesBefore = fs.statSync(filePath).size;
  const inputBuffer = fs.readFileSync(filePath);

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.readBinary(inputBuffer);
  const root = doc.getRoot();
  const nodes = root.listNodes().length;
  const meshes = root.listMeshes().length;
  const materials = root.listMaterials().length;

  const enhanced = await enhanceGlbBuffer(inputBuffer, options);
  fs.writeFileSync(filePath, enhanced);

  return {
    file: filePath,
    bytesBefore,
    bytesAfter: enhanced.byteLength,
    nodes,
    meshes,
    materials,
  };
}

/**
 * Recursively walks a directory tree and enhances every .glb file found.
 */
export async function enhanceAllGlbsInTree(
  rootDir: string,
  options: GlbEnhanceOptions & { onFile?: (report: GlbEnhanceReport) => void } = {}
): Promise<GlbEnhanceReport[]> {
  const results: GlbEnhanceReport[] = [];

  const walk = async (dir: string): Promise<void> => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".glb")) {
        try {
          const report = await enhanceGlbFile(full, options);
          results.push(report);
          if (options.onFile) options.onFile(report);
        } catch (err) {
          console.warn(`  âš  Skipped (unreadable): ${full}`, err instanceof Error ? err.message : err);
        }
      }
    }
  };

  await walk(rootDir);
  return results;
}
