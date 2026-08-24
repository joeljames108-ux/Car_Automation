// ============================================================================
// GLB PBR POST-PROCESSOR & MATERIAL ENHANCER (Node-side, @gltf-transform based)
// ============================================================================
// Reads any .glb binary, upgrades materials with Khronos PBR extensions for
// photoreal rendering (clearcoat automotive paint, real transmission glass,
// boosted emissive lighting elements), tunes rubber/metal response curves,
// and writes the result back. Fully idempotent and texture-preserving.
// Used by the hood export pipeline and the enhance-existing-glbs CLI.
// ============================================================================

import * as fs from "fs";
import * as path from "path";
import { NodeIO } from "@gltf-transform/core";
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
  clearcoatApplied: number;
  transmissionApplied: number;
  emissiveBoosted: number;
  rubberTuned: number;
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
  "carpet", "plastic", "trim_a", "detail", "base_material", "base_", "manufacturer",
];
const SCAN_WINDOW_KEYWORDS = ["window", "windshield", "windscreen", "backlite"];
const SCAN_LAMP_KEYWORDS = ["emis", "red_glass", "lightemissive", "lamp"];

function matchesAny(name: string, keywords: string[]): boolean {
  const n = name.toLowerCase();
  return keywords.some((k) => n.includes(k));
}

/**
 * Enhances a single binary GLB buffer with PBR extensions and material tuning.
 */
export async function enhanceGlbBuffer(inputBuffer: Buffer): Promise<Buffer> {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.readBinary(inputBuffer);

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

    // ── Scan-correction stage: repair broken PBR on imported car scans ──
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
export async function enhanceGlbFile(filePath: string): Promise<GlbEnhanceReport> {
  const bytesBefore = fs.statSync(filePath).size;
  const inputBuffer = fs.readFileSync(filePath);

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.readBinary(inputBuffer);
  const root = doc.getRoot();
  const nodes = root.listNodes().length;
  const meshes = root.listMeshes().length;
  const materials = root.listMaterials().length;

  const enhanced = await enhanceGlbBuffer(inputBuffer);
  fs.writeFileSync(filePath, enhanced);

  return {
    file: filePath,
    bytesBefore,
    bytesAfter: enhanced.byteLength,
    nodes,
    meshes,
    materials,
    clearcoatApplied: -1,
    transmissionApplied: -1,
    emissiveBoosted: -1,
    rubberTuned: -1,
  };
}

/**
 * Recursively walks a directory tree and enhances every .glb file found.
 */
export async function enhanceAllGlbsInTree(
  rootDir: string,
  onFile?: (report: GlbEnhanceReport) => void
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
          const report = await enhanceGlbFile(full);
          results.push(report);
          if (onFile) onFile(report);
        } catch (err) {
          console.warn(`  ⚠ Skipped (unreadable): ${full}`, err instanceof Error ? err.message : err);
        }
      }
    }
  };

  await walk(rootDir);
  return results;
}
