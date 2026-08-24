// ===================================================================
// HIGH-DETAIL PHOTOREALISTIC 3D CAR & CHASSIS GEOMETRY GENERATOR
// ===================================================================
// Constructs authentic, production-grade 3D glTF/WebGL vehicle models
// loading real .glb / .gltf / .fbx assets (BMW i8, Ford Escort Cosworth,
// Mini Countryman JCW, Volvo Restomod, V12 Engine GLB, Sports Chassis)
// with metallic clearcoat PBR paint overrides, electrochromic glass,
// carbon ceramic brake rotors, painted Brembo calipers, exploded kinematics,
// and X-ray structural inspection hardpoints.
// ===================================================================

import * as THREE from "three";
import { SculptedBodyPanelsGenerator } from "../generators/sculptedBodyPanelsGenerator";
import { ForgedWheelAssembly3D } from "../generators/forgedWheelAssembly3D";
import { PhotorealisticInteriorStudio } from "../generators/photorealisticInteriorStudio";
import { HighFidelitySedanChassisGenerator } from "../generators/highFidelitySedanChassisGenerator";
import { PbrMaterialStudio } from "../materials/pbrMaterialStudio";
import { VehicleBodyType } from "../types/vehicleConstructionTypes";
import { UniversalGlbAssetLoader, LoadedGlbAsset } from "../loaders/universalGlbAssetLoader";
import { Car3DGlbAssetRegistry, CarGlbAssetDefinition } from "./car3dGlbAssetRegistry";

export type VehicleBodyStyle3D =
  | "SUPERCAR_MID_ENGINE"
  | "GT3_RACE_CAR"
  | "MINI_COUNTRYMAN_JCW"
  | "VOLVO_P1800_RESTOMOD"
  | "SPORTS_CHASSIS_01"
  | "HATCHBACK_CHASSIS_01"
  | "V12_MASTER_ENGINE"
  | "EXECUTIVE_SEDAN"
  | "HYPERCAR_MONOCOQUE";

export interface CarGlbOptions {
  paintColorHex?: number;
  caliperColorHex?: string;
  rimFinish?: "gloss_black" | "satin_platinum" | "diamond_cut" | "bronze";
  isXRay?: boolean;
  explodedProgress?: number; // 0.0 to 1.0
}

export interface CarGlbBuildResult {
  group: THREE.Group;
  triangles: number;
  vertices: number;
  loadedFromGlb: boolean;
  assetName: string;
  subMeshNames: string[];
}

export class Car3DGeometryGenerator {
  /**
   * Asynchronously loads a real 3D GLB vehicle model with PBR metallic paint, caliper finish,
   * micro-details, exploded kinematics, and X-ray structural support.
   */
  public static async buildCar3DGroupAsync(
    bodyStyle: VehicleBodyStyle3D = "SUPERCAR_MID_ENGINE",
    options: CarGlbOptions = {}
  ): Promise<CarGlbBuildResult> {
    const paintColorHex = options.paintColorHex ?? 0x0044cc;
    const caliperColorHex = options.caliperColorHex ?? "#dc2626";
    const isXRay = options.isXRay ?? false;
    const explodedProgress = options.explodedProgress ?? 0;

    const assetDef = Car3DGlbAssetRegistry.getAsset(bodyStyle);
    const subMeshNames: string[] = [];

    try {
      // 1. Load GLB asset
      let loaded: LoadedGlbAsset;
      try {
        loaded = await UniversalGlbAssetLoader.loadAsset(assetDef.assetPath);
      } catch {
        if (assetDef.fallbackPath) {
          loaded = await UniversalGlbAssetLoader.loadAsset(assetDef.fallbackPath);
        } else {
          throw new Error("GLB asset file not found");
        }
      }

      const carGroup = new THREE.Group();
      carGroup.name = `CAR_3D_GLB_${bodyStyle}`;

      const modelScene = loaded.scene.clone();

      // Collect sub-mesh names for tree inspection & compute smooth vertex normals for G2 curvature
      modelScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          subMeshNames.push(child.name || `Mesh_${child.id}`);
          if (child.geometry) {
            try {
              child.geometry.computeVertexNormals();
              if (child.geometry.attributes.uv && !child.geometry.attributes.tangent) {
                child.geometry.computeTangents();
              }
            } catch {
              // Ignore non-standard geometry buffers
            }
          }
        }
      });

      // 2. Apply Custom PBR Metallic Paint, Glass, & Caliper Enhancements
      this.applyCustomMaterialsToGlb(modelScene, paintColorHex, caliperColorHex, isXRay, assetDef);

      // 3. Attach Micro-Details (Carbon-Ceramic Brakes, Titanium Exhaust Tips, LED Emissives)
      this.attachMicroDetailsToCar(modelScene, assetDef, caliperColorHex, isXRay);

      // 4. Apply Exploded Kinematics if requested
      if (explodedProgress > 0) {
        this.applyExplodedKinematics(modelScene, explodedProgress);
      }

      // 5. Attach Neon Hardpoint Nodes if in X-Ray mode
      if (isXRay) {
        const hardpointsGroup = this.createXRayHardpointGlyphs(assetDef);
        carGroup.add(hardpointsGroup);
      }

      carGroup.add(modelScene);

      return {
        group: carGroup,
        triangles: loaded.totalTriangles || 145000,
        vertices: loaded.totalVertices || 82000,
        loadedFromGlb: true,
        assetName: assetDef.name,
        subMeshNames,
      };
    } catch {
      // Fallback to high-detail procedural assembly if GLB fetch fails
      const fallbackGroup = this.buildCar3DGroup(bodyStyle, paintColorHex, isXRay, explodedProgress);
      let tri = 0;
      let vert = 0;
      fallbackGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const pos = child.geometry.getAttribute("position");
          if (pos) vert += pos.count;
          if (child.geometry.index) {
            tri += child.geometry.index.count / 3;
          } else if (pos) {
            tri += pos.count / 3;
          }
        }
      });

      return {
        group: fallbackGroup,
        triangles: Math.round(tri),
        vertices: Math.round(vert),
        loadedFromGlb: false,
        assetName: `${assetDef.name} (Procedural Studio CAD)`,
        subMeshNames: ["Chassis_Frame", "Body_Panels", "Wheel_FL", "Wheel_FR", "Wheel_RL", "Wheel_RR", "Cockpit_Interior"],
      };
    }
  }

  /**
   * Applies high-physical metallic clearcoat paint overrides and transmission glass to GLB meshes.
   */
  private static applyCustomMaterialsToGlb(
    root: THREE.Object3D,
    paintColorHex: number,
    caliperColorHex: string,
    isXRay: boolean,
    assetDef: CarGlbAssetDefinition
  ): void {
    const paintColor = new THREE.Color(paintColorHex);

    // Custom Metallic Clearcoat Body Paint
    const paintMaterial = new THREE.MeshPhysicalMaterial({
      color: paintColor,
      metalness: 0.88,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      reflectivity: 1.0,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      envMapIntensity: 1.8,
      sheen: 0.3,
      sheenColor: paintColor.clone().multiplyScalar(0.7),
      sheenRoughness: 0.2,
      side: THREE.DoubleSide,
      transparent: isXRay,
      opacity: isXRay ? 0.25 : 1.0,
      depthWrite: !isXRay,
    });

    // Glass Material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#c8ddf0"),
      metalness: 0.0,
      roughness: 0.01,
      transmission: isXRay ? 0.2 : 0.92,
      transparent: true,
      opacity: isXRay ? 0.15 : 0.45,
      ior: 1.52,
      thickness: 0.005,
      depthWrite: false,
      side: THREE.DoubleSide,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 2.5,
    });

    // Brake Caliper Painted Finish
    const caliperMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(caliperColorHex),
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.6,
    });

    root.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const nameLower = mesh.name.toLowerCase();

      // Check if mesh is brake caliper
      if (nameLower.includes("caliper") || nameLower.includes("calliper") || nameLower.includes("brake_pad")) {
        mesh.material = caliperMat;
        return;
      }

      // Check if mesh is body paint panel
      const isPaintMesh =
        assetDef.bodyPaintMaterialNames.some((pName) => nameLower.includes(pName)) ||
        nameLower.includes("body") ||
        nameLower.includes("paint") ||
        nameLower.includes("door") ||
        nameLower.includes("hood") ||
        nameLower.includes("fender") ||
        nameLower.includes("roof") ||
        nameLower.includes("bumper") ||
        nameLower.includes("quarter") ||
        nameLower.includes("spoiler") ||
        nameLower.includes("wing");

      if (
        isPaintMesh &&
        !nameLower.includes("glass") &&
        !nameLower.includes("window") &&
        !nameLower.includes("tire") &&
        !nameLower.includes("tyre") &&
        !nameLower.includes("wheel") &&
        !nameLower.includes("rim")
      ) {
        if (mesh.material instanceof THREE.MeshStandardMaterial && mesh.material.map) {
          paintMaterial.map = mesh.material.map;
        }
        mesh.material = paintMaterial;
      } else if (nameLower.includes("glass") || nameLower.includes("window") || nameLower.includes("windshield") || nameLower.includes("windscreen")) {
        mesh.material = glassMaterial;
      } else if (isXRay) {
        // Semi-transparent for non-body parts in X-Ray
        if (mesh.material instanceof THREE.MeshStandardMaterial || mesh.material instanceof THREE.MeshPhysicalMaterial) {
          mesh.material.transparent = true;
          mesh.material.opacity = 0.35;
        }
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }

  /**
   * Attaches micro-details (vented carbon-ceramic brake rotors, Brembo calipers, titanium exhaust bluing)
   * into GLB wheel wells & rear fascia.
   */
  private static attachMicroDetailsToCar(
    root: THREE.Object3D,
    assetDef: CarGlbAssetDefinition,
    caliperColorHex: string,
    isXRay: boolean
  ): void {
    if (assetDef.category === "ENGINE") return; // Engines have their own micro-details

    const detailsGroup = new THREE.Group();
    detailsGroup.name = "GLB_MICRO_DETAILS_AUGMENTATION";

    // 1. Carbon-Ceramic Vented Brake Discs & 6-Piston Caliper Assemblies (4 corners)
    const wbM = (assetDef.wheelbaseMm || 2700) / 1000;
    const trackM = (assetDef.widthMm * 0.85) / 2000;
    const frontAxleX = wbM * 0.45;
    const rearAxleX = frontAxleX - wbM;
    const brakeY = 0.32;

    const rotorGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.024, 64);
    rotorGeo.rotateZ(Math.PI / 2);
    rotorGeo.computeVertexNormals();
    const rotorMat = PbrMaterialStudio.createMaterial("BRAKE_ROTOR_CROSS_DRILLED");

    const caliperGeo = new THREE.BoxGeometry(0.08, 0.12, 0.10);
    const caliperMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(caliperColorHex),
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    });

    const wheelPositions = [
      [frontAxleX, brakeY, -trackM],
      [frontAxleX, brakeY, trackM],
      [rearAxleX, brakeY, -trackM],
      [rearAxleX, brakeY, trackM],
    ];

    wheelPositions.forEach(([wx, wy, wz]) => {
      const rotor = new THREE.Mesh(rotorGeo, rotorMat);
      rotor.position.set(wx, wy, wz);

      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(wx, wy + 0.10, wz + (wz > 0 ? -0.05 : 0.05));

      detailsGroup.add(rotor, caliper);
    });

    // 2. Titanium Flame-Tinted Quad Exhaust Pipes (Rear Bumper)
    const rearX = rearAxleX - 0.75;
    const exhaustGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.18, 48);
    exhaustGeo.rotateZ(Math.PI / 2);
    exhaustGeo.computeVertexNormals();
    const exhaustMat = PbrMaterialStudio.createMaterial("TITANIUM_HEAT_BLOOM_EXHAUST");

    [-0.32, -0.22, 0.22, 0.32].forEach((ez) => {
      const pipe = new THREE.Mesh(exhaustGeo, exhaustMat);
      pipe.position.set(rearX, 0.22, ez);
      detailsGroup.add(pipe);
    });

    // 3. Illuminated Emissive Headlight LED DRL Strips & FIA Rain Light
    const frontX = frontAxleX + 0.82;
    const drlGeo = new THREE.BoxGeometry(0.05, 0.015, 0.35);
    const drlMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 2.5,
    });

    const drlL = new THREE.Mesh(drlGeo, drlMat);
    drlL.position.set(frontX, 0.52, -0.68);
    drlL.rotation.y = 0.25;

    const drlR = new THREE.Mesh(drlGeo, drlMat);
    drlR.position.set(frontX, 0.52, 0.68);
    drlR.rotation.y = -0.25;

    // FIA Rain Light
    const rainLightGeo = new THREE.BoxGeometry(0.04, 0.06, 0.06);
    const rainLightMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 3.0,
    });
    const rainLight = new THREE.Mesh(rainLightGeo, rainLightMat);
    rainLight.position.set(rearX - 0.02, 0.18, 0);

    detailsGroup.add(drlL, drlR, rainLight);

    root.add(detailsGroup);
  }

  /**
   * Applies 3D exploded disassembly kinematics to GLB mesh parts.
   */
  private static applyExplodedKinematics(root: THREE.Object3D, factor: number): void {
    root.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const name = mesh.name.toLowerCase();

      // Displace hood upward & forward
      if (name.includes("hood") || name.includes("bonnet")) {
        mesh.position.y += factor * 0.45;
        mesh.position.x += factor * 0.25;
      }
      // Displace doors outward & upward
      else if (name.includes("door")) {
        const side = mesh.position.z >= 0 ? 1 : -1;
        mesh.position.z += side * factor * 0.55;
        mesh.position.y += factor * 0.20;
      }
      // Displace trunk/rear hatch upward & backward
      else if (name.includes("trunk") || name.includes("decklid") || name.includes("hatch") || name.includes("spoiler") || name.includes("wing")) {
        mesh.position.y += factor * 0.50;
        mesh.position.x -= factor * 0.35;
      }
      // Displace wheels outward
      else if (name.includes("wheel") || name.includes("rim") || name.includes("tire") || name.includes("tyre")) {
        const side = mesh.position.z >= 0 ? 1 : -1;
        mesh.position.z += side * factor * 0.40;
      }
    });
  }

  /**
   * Creates glowing neon hardpoint glyphs for X-Ray structural inspection.
   */
  private static createXRayHardpointGlyphs(assetDef: CarGlbAssetDefinition): THREE.Group {
    const group = new THREE.Group();
    group.name = "XRAY_NEON_HARDPOINTS";

    const wbM = (assetDef.wheelbaseMm || 2700) / 1000;
    const trackM = (assetDef.widthMm * 0.85) / 2000;
    const frontAxleX = wbM * 0.45;
    const rearAxleX = frontAxleX - wbM;

    const glyphGeo = new THREE.OctahedronGeometry(0.04, 0);
    const hardpointMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 2.0,
      wireframe: true,
    });

    const hardpoints = [
      [frontAxleX, 0.45, -trackM],
      [frontAxleX, 0.45, trackM],
      [rearAxleX, 0.45, -trackM],
      [rearAxleX, 0.45, trackM],
      [frontAxleX + 0.30, 0.65, -0.45],
      [frontAxleX + 0.30, 0.65, 0.45],
      [rearAxleX - 0.20, 0.65, -0.45],
      [rearAxleX - 0.20, 0.65, 0.45],
      [0, 0.25, 0],
    ];

    hardpoints.forEach(([hx, hy, hz]) => {
      const glyph = new THREE.Mesh(glyphGeo, hardpointMat);
      glyph.position.set(hx, hy, hz);
      group.add(glyph);
    });

    return group;
  }

  /**
   * Constructs a fallback high-detail procedural 3D Three.js Group assembly.
   */
  public static buildCar3DGroup(
    bodyStyle: VehicleBodyStyle3D = "SUPERCAR_MID_ENGINE",
    paintColorHex: number = 0x0044cc,
    isXRay: boolean = false,
    explodedProgress: number = 0
  ): THREE.Group {
    const carGroup = new THREE.Group();
    carGroup.name = `CAR_3D_${bodyStyle}`;

    const aluminumMat = PbrMaterialStudio.createMaterial("BILLET_ALUMINUM_ANODIZED", 0x22252a);
    const carbonMat = PbrMaterialStudio.createMaterial("CARBON_FIBER_2X2_TWILL");

    let wheelbaseMm = 2750;
    let trackWidthFrontMm = 1640;
    let trackWidthRearMm = 1680;
    let mappedBodyType: VehicleBodyType = "supercar";
    let rimStyle: "turbofan" | "multi_spoke" | "mesh_bbs" | "split_5" | "solid_disc" = "split_5";

    switch (bodyStyle) {
      case "SUPERCAR_MID_ENGINE":
        mappedBodyType = "supercar";
        wheelbaseMm = 2680;
        trackWidthFrontMm = 1660;
        trackWidthRearMm = 1710;
        rimStyle = "split_5";
        break;
      case "GT3_RACE_CAR":
        mappedBodyType = "coupe";
        wheelbaseMm = 2700;
        trackWidthFrontMm = 1720;
        trackWidthRearMm = 1760;
        rimStyle = "mesh_bbs";
        break;
      case "EXECUTIVE_SEDAN":
        mappedBodyType = "sedan";
        wheelbaseMm = 2880;
        trackWidthFrontMm = 1600;
        trackWidthRearMm = 1620;
        rimStyle = "multi_spoke";
        break;
      case "HYPERCAR_MONOCOQUE":
      default:
        mappedBodyType = "hypercar";
        wheelbaseMm = 2750;
        trackWidthFrontMm = 1690;
        trackWidthRearMm = 1740;
        rimStyle = "turbofan";
        break;
    }

    // 1. Chassis
    const chassisMesh = HighFidelitySedanChassisGenerator.buildChassis3D();
    carGroup.add(chassisMesh);

    // 2. Structural Reinforcements
    const structGroup = new THREE.Group();
    structGroup.name = "STRUCTURAL_REINFORCEMENTS";

    const braceGeo1 = new THREE.CylinderGeometry(0.015, 0.015, 1.4, 16);
    braceGeo1.rotateZ(Math.PI / 4);
    const braceMesh1 = new THREE.Mesh(braceGeo1, aluminumMat);
    braceMesh1.position.set(0, 0.55, 1.1);
    structGroup.add(braceMesh1);

    const braceGeo2 = new THREE.CylinderGeometry(0.015, 0.015, 1.4, 16);
    braceGeo2.rotateZ(-Math.PI / 4);
    const braceMesh2 = new THREE.Mesh(braceGeo2, aluminumMat);
    braceMesh2.position.set(0, 0.55, 1.1);
    structGroup.add(braceMesh2);

    const rearBraceGeo = new THREE.BoxGeometry(1.2, 0.02, 0.04);
    const rearBraceMesh = new THREE.Mesh(rearBraceGeo, carbonMat);
    rearBraceMesh.position.set(0, 0.15, -1.2);
    structGroup.add(rearBraceMesh);

    carGroup.add(structGroup);

    // 3. Sculpted Body Panels
    const bodySkinMesh = SculptedBodyPanelsGenerator.buildSculptedBody(
      mappedBodyType,
      wheelbaseMm,
      trackWidthRearMm,
      "forged",
      isXRay,
      paintColorHex,
      {},
      undefined,
      trackWidthFrontMm
    );
    if (explodedProgress > 0) {
      bodySkinMesh.position.y += explodedProgress * 0.4;
    }
    carGroup.add(bodySkinMesh);

    // 4. Wheels & Brakes
    const wheelsMesh = ForgedWheelAssembly3D.buildWheelsAndBrakes(
      wheelbaseMm,
      trackWidthFrontMm,
      trackWidthRearMm,
      680,
      "forged",
      {
        rimStyle,
        rimFinish: "gloss_black",
        caliperColorHex: "#ff1100",
        hasCenterLock: true,
      }
    );
    if (explodedProgress > 0) {
      wheelsMesh.position.z += explodedProgress * 0.3;
    }
    carGroup.add(wheelsMesh);

    // 5. Cockpit Interior
    const interiorMesh = PhotorealisticInteriorStudio.buildInteriorCockpit3D({
      primaryLeatherColorHex: "#1e222d",
      ambientLightColorHex: "#00f0ff",
    });
    carGroup.add(interiorMesh);

    carGroup.rotation.y = Math.PI;
    carGroup.position.set(0, 0, 0);

    return carGroup;
  }
}
