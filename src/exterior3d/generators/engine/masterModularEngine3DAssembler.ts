/**
 * ============================================================================
 * MODULAR ENGINE STUDIO — PROCEDURAL 3D MODULAR ENGINE ASSEMBLER
 * ============================================================================
 * Generates photorealistic, individual 3D subassemblies for all engine components:
 * - Engine Block with cylinder bores and main bearing webbing
 * - Counterweighted Crankshaft with harmonic damper
 * - Reciprocating Pistons with wrist pins and rings
 * - Articulated Connecting Rods with H-beam profiles
 * - Cylinder Heads with DOHC valvetrain, camshafts, and sprung valves
 * - Carbon Fiber Intake Plenum with velocity stacks
 * - Twin Turbochargers with snail housings and wastegates
 * - Equal-Length Stainless / Inconel Exhaust Headers
 * - Baffled Dry Sump / Wet Sump Oil Pan
 * - Serpentine Accessory Belt Drive
 * - 4-Stroke Combustion Flame burst volumetric glow spheres
 * ============================================================================
 */

import * as THREE from "three";
import { MasterEngineState } from "../../../sim/engine/masterEngineTypes";
import { EngineMountingGraph, solveDynamicEngineGeometry } from "../../sockets/engineMountingGraph";
import { EngineKinematicsAnimator } from "../../animation/engineKinematicsAnimator";
import { buildEngineCoverScene } from "../../../engine3d/generators/engineCoverGenerator";
import { createSingleTurboUnit } from "../../../engine3d/generators/turbochargerGenerator";
import {
  createTwinScrewSuperchargerAssembly,
  createCentrifugalSuperchargerAssembly,
} from "../../../engine3d/generators/superchargerGenerator";
import { EngineMaterialManager } from "../../../engine3d/managers/EngineSceneManager";
import { EngineStagedLoader } from "../../../engine3d/managers/EngineStagedLoader";

export class MasterModularEngine3DAssembler {
  private rootGroup: THREE.Group;
  private mountingGraph: EngineMountingGraph;
  private kinematicsAnimator: EngineKinematicsAnimator;
  private lastStateSummary: string = "";

  // Component Mesh References for Kinematic Animation
  private crankshaftMesh: THREE.Group | null = null;
  private pistonMeshes: { group: THREE.Group; cylinderIndex: number; baseZ: number; angleRad: number; glowMesh?: THREE.Mesh }[] = [];
  private conrodMeshes: { group: THREE.Group; cylinderIndex: number }[] = [];
  private intakeValves: { mesh: THREE.Mesh; cylinderIndex: number }[] = [];
  private exhaustValves: { mesh: THREE.Mesh; cylinderIndex: number }[] = [];
  private combustionGlows: { mesh: THREE.Mesh; cylinderIndex: number }[] = [];
  private activeFlameLight: THREE.PointLight | null = null;
  private camshaftMeshes: THREE.Group[] = [];

  // Live Kinematic Parameter Dimensions
  private currentStrokeM: number = 0.086;
  private currentRodLengthM: number = 0.148;

  // Last Assembly Structural Signature for In-Place Parameter Updates
  private lastArchFamily: string = "";
  private lastCylCount: number = 0;
  private lastTurboType: string = "";
  private lastCoverModel: string = "";
  private lastShowCover: boolean = true;

  // PBR Materials Cache (Singleton managed)
  private matManager = EngineMaterialManager.getInstance();
  private materials: {
    castAluminum: THREE.Material;
    billetAluminum: THREE.Material;
    forgedSteel: THREE.Material;
    nitridedSteel: THREE.Material;
    titaniumAlloy: THREE.Material;
    carbonFiber: THREE.Material;
    forgedCarbonGold: THREE.Material;
    goldAnodized: THREE.Material;
    cobaltAnodized: THREE.Material;
    crimsonAnodized: THREE.Material;
    redCorsaPowdercoat: THREE.Material;
    monacoBluePowdercoat: THREE.Material;
    gialloModenaPowdercoat: THREE.Material;
    britishRacingGreenPowdercoat: THREE.Material;
    stealthBlackCeramic: THREE.Material;
    titaniumBluedExhaust: THREE.Material;
    inconelExhaust: THREE.Material;
    dynoGlowExhaust: THREE.Material;
    ceramicWhiteExhaust: THREE.Material;
    polishedChrome: THREE.Material;
    combustionFlameMat: THREE.Material;
  };

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = "MasterModularEngine3D";
    this.mountingGraph = new EngineMountingGraph();
    this.kinematicsAnimator = new EngineKinematicsAnimator();
    this.materials = this.resolveMaterialsFromManager();
  }

  private resolveMaterialsFromManager() {
    return {
      castAluminum: this.matManager.getMaterial('cast_aluminum'),
      billetAluminum: this.matManager.getMaterial('billet_aluminum'),
      forgedSteel: this.matManager.getMaterial('forged_steel'),
      nitridedSteel: this.matManager.getMaterial('nitrided_steel'),
      titaniumAlloy: this.matManager.getMaterial('titanium'),
      carbonFiber: this.matManager.getMaterial('carbon_fiber'),
      forgedCarbonGold: this.matManager.getMaterial('forged_carbon_gold'),
      goldAnodized: this.matManager.getMaterial('gold_anodized'),
      cobaltAnodized: this.matManager.getMaterial('cobalt_anodized'),
      crimsonAnodized: this.matManager.getMaterial('crimson_anodized'),
      redCorsaPowdercoat: this.matManager.getMaterial('rosso_corsa'),
      monacoBluePowdercoat: this.matManager.getMaterial('monaco_blue'),
      gialloModenaPowdercoat: this.matManager.getMaterial('gold_anodized'),
      britishRacingGreenPowdercoat: this.matManager.getMaterial('cast_aluminum'),
      stealthBlackCeramic: this.matManager.getMaterial('stealth_black'),
      titaniumBluedExhaust: this.matManager.getMaterial('titanium_blued'),
      inconelExhaust: this.matManager.getMaterial('inconel_exhaust'),
      dynoGlowExhaust: this.matManager.getMaterial('combustion_flame'),
      ceramicWhiteExhaust: this.matManager.getMaterial('billet_aluminum'),
      polishedChrome: this.matManager.getMaterial('polished_chrome'),
      combustionFlameMat: this.matManager.getMaterial('combustion_flame'),
    };
  }

  private createPBRMaterials() {
    return {
      castAluminum: new THREE.MeshStandardMaterial({
        color: 0x64748b, // Slate gray casting alloy
        metalness: 0.82,
        roughness: 0.38,
      }),
      billetAluminum: new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0, // CNC machined 6061-T6 aluminum
        metalness: 0.94,
        roughness: 0.12,
        clearcoat: 0.6,
        clearcoatRoughness: 0.08,
      }),
      forgedSteel: new THREE.MeshStandardMaterial({
        color: 0x334155, // 4340 forged steel
        metalness: 0.90,
        roughness: 0.22,
      }),
      nitridedSteel: new THREE.MeshPhysicalMaterial({
        color: 0x1e293b, // Dark nitrided journal steel
        metalness: 0.96,
        roughness: 0.06,
      }),
      titaniumAlloy: new THREE.MeshPhysicalMaterial({
        color: 0x94a3b8, // Titanium Grade 5
        metalness: 0.92,
        roughness: 0.16,
        clearcoat: 0.4,
      }),
      carbonFiber: new THREE.MeshPhysicalMaterial({
        color: 0x090d16, // 3K Twill Prepreg Carbon
        metalness: 0.30,
        roughness: 0.18,
        clearcoat: 0.95,
        clearcoatRoughness: 0.04,
      }),
      forgedCarbonGold: new THREE.MeshPhysicalMaterial({
        color: 0x1c1917, // Forged carbon with gold flake
        metalness: 0.45,
        roughness: 0.22,
        clearcoat: 0.95,
        sheen: 0.4,
        sheenColor: new THREE.Color(0xf59e0b),
      }),
      goldAnodized: new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b, // Anodized gold fittings / pulleys
        metalness: 0.94,
        roughness: 0.14,
        clearcoat: 0.6,
      }),
      cobaltAnodized: new THREE.MeshPhysicalMaterial({
        color: 0xb45309, // Cobalt blue anodized
        metalness: 0.94,
        roughness: 0.14,
        clearcoat: 0.6,
      }),
      crimsonAnodized: new THREE.MeshPhysicalMaterial({
        color: 0xdc2626, // Crimson red anodized
        metalness: 0.94,
        roughness: 0.14,
        clearcoat: 0.6,
      }),
      redCorsaPowdercoat: new THREE.MeshPhysicalMaterial({
        color: 0xdc2626, // Scuderia Red textured cam covers
        metalness: 0.45,
        roughness: 0.28,
        clearcoat: 0.85,
        sheen: 0.25,
        sheenColor: new THREE.Color(0xef4444),
      }),
      monacoBluePowdercoat: new THREE.MeshPhysicalMaterial({
        color: 0x0284c7, // Monaco Blue metallic
        metalness: 0.65,
        roughness: 0.22,
        clearcoat: 0.85,
        sheen: 0.3,
        sheenColor: new THREE.Color(0xfbbf24),
      }),
      gialloModenaPowdercoat: new THREE.MeshPhysicalMaterial({
        color: 0xeab308, // Giallo Modena racing yellow
        metalness: 0.35,
        roughness: 0.25,
        clearcoat: 0.85,
      }),
      britishRacingGreenPowdercoat: new THREE.MeshPhysicalMaterial({
        color: 0x15803d, // British Racing Green metallic
        metalness: 0.55,
        roughness: 0.24,
        clearcoat: 0.9,
      }),
      stealthBlackCeramic: new THREE.MeshPhysicalMaterial({
        color: 0x18181b, // Satin black ceramic
        metalness: 0.30,
        roughness: 0.55,
      }),
      titaniumBluedExhaust: new THREE.MeshPhysicalMaterial({
        color: 0xb45309, // Titanium heat-blued with purple sheen
        metalness: 0.96,
        roughness: 0.16,
        clearcoat: 0.85,
        clearcoatRoughness: 0.06,
        sheen: 0.65,
        sheenColor: new THREE.Color(0xd97706),
      }),
      inconelExhaust: new THREE.MeshPhysicalMaterial({
        color: 0xd97706, // Heat-tempered bronze/gold inconel
        metalness: 0.92,
        roughness: 0.22,
        clearcoat: 0.5,
      }),
      dynoGlowExhaust: new THREE.MeshPhysicalMaterial({
        color: 0xff5722, // Glowing hot headers
        emissive: new THREE.Color(0xff3d00),
        emissiveIntensity: 2.2,
        metalness: 0.85,
        roughness: 0.30,
      }),
      ceramicWhiteExhaust: new THREE.MeshPhysicalMaterial({
        color: 0xf8fafc, // F1 Plasma sprayed white thermal barrier
        metalness: 0.35,
        roughness: 0.38,
      }),
      polishedChrome: new THREE.MeshPhysicalMaterial({
        color: 0xf8fafc, // Mirror polished chrome
        metalness: 0.98,
        roughness: 0.05,
        clearcoat: 1.0,
      }),
      combustionFlameMat: new THREE.MeshBasicMaterial({
        color: 0xff3d00,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      }),
    };
  }

  public updateOrAssemble(state: MasterEngineState): boolean {
    const family = state.architecture.family;
    const cyls = state.architecture.cylinderCount;
    const turbo = state.turboSystem.type;
    const coverModel = state.cosmetics?.coverModel || "";
    const showCover = state.cosmetics?.showEngineCover !== false;

    // Check if structural architecture is unchanged
    if (
      this.lastArchFamily === family &&
      this.lastCylCount === cyls &&
      this.lastTurboType === turbo &&
      this.lastCoverModel === coverModel &&
      this.lastShowCover === showCover &&
      this.rootGroup.children.length > 0
    ) {
      // In-place parameter updates without scene graph destruction
      this.kinematicsAnimator.updateParameters(state);
      this.currentStrokeM = state.block.strokeMm / 1000;
      this.currentRodLengthM = state.connectingRods.rodLengthMm / 1000;
      this.mountingGraph.rebuildSocketsFromState(state);
      this.mountingGraph.applyTransformsToAttachedMeshes();
      return false; // Rebuild skipped
    }

    // Full structural rebuild required
    this.assemble(state);
    return true; // Rebuilt
  }

  public assemble(state: MasterEngineState): THREE.Group {
    // Record current structural parameters
    const arch = state.architecture;
    this.lastArchFamily = arch.family;
    this.lastCylCount = arch.cylinderCount;
    this.lastTurboType = state.turboSystem.type;
    this.lastCoverModel = state.cosmetics?.coverModel || "";
    this.lastShowCover = state.cosmetics?.showEngineCover !== false;
    this.lastStateSummary = `${arch.family}_${arch.cylinderCount}_${arch.bankAngleDeg}_${state.turboSystem.type}_${state.cosmetics?.coverModel}_${state.cosmetics?.showEngineCover}`;

    // Dispose old geometries to prevent VRAM memory leaks
    this.rootGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      }
    });

    // Clear existing children
    while (this.rootGroup.children.length > 0) {
      this.rootGroup.remove(this.rootGroup.children[0]);
    }

    this.pistonMeshes = [];
    this.conrodMeshes = [];
    this.intakeValves = [];
    this.exhaustValves = [];
    this.combustionGlows = [];
    this.camshaftMeshes = [];

    this.mountingGraph.rebuildSocketsFromState(state);
    this.kinematicsAnimator.updateParameters(state);

    const block = state.block;
    const cylCount = arch.cylinderCount;
    const cylindersPerBank = arch.family === "inline" ? cylCount : cylCount / 2;

    // Live parametric geometry — single source of truth shared with the mounting
    // graph so every subassembly tracks bore pitch, deck height & sump depth.
    const dyn = solveDynamicEngineGeometry(state);
    const boreSpacing = dyn.boreSpacingMm;
    const startZ = -((cylindersPerBank - 1) * boreSpacing) / 2;
    const halfBankAngleRad = (arch.bankAngleDeg / 2) * (Math.PI / 180);

    this.currentStrokeM = block.strokeMm / 1000;
    this.currentRodLengthM = state.connectingRods.rodLengthMm / 1000;

    // ------------------------------------------------------------------------
    // 1. ENGINE BLOCK MESH
    // ------------------------------------------------------------------------
    const blockGroup = new THREE.Group();
    blockGroup.name = "EngineBlock_Assembly";
    const blockLengthM = (cylindersPerBank * boreSpacing + 60) / 1000;
    const blockWidthM = arch.family === "inline" ? (0.24 + block.boreMm * 0.001) : (0.34 + block.boreMm * 0.0015);
    const blockHeightM = dyn.deckHeightMm / 1000;

    const blockCasting = new THREE.Mesh(
      new THREE.BoxGeometry(blockWidthM, blockHeightM, blockLengthM),
      state.block.material === "billet_6061_t6" ? this.materials.billetAluminum : this.materials.castAluminum
    );
    blockCasting.position.y = blockHeightM / 2;
    blockCasting.castShadow = true;
    blockCasting.receiveShadow = true;
    blockGroup.add(blockCasting);

    // Cylinder Bore Liners (GPU Instanced Single Draw Call)
    const linerGeo = new THREE.CylinderGeometry(block.boreMm / 2000, block.boreMm / 2000, (block.strokeMm * 1.3) / 1000, 24, 1, true);
    const instancedLiners = new THREE.InstancedMesh(linerGeo, this.materials.nitridedSteel, cylCount);
    instancedLiners.name = "Instanced_Bore_Liners";
    const dummyObj = new THREE.Object3D();

    for (let i = 0; i < cylCount; i++) {
      let bank = 0;
      let bankIndex = i;
      if (arch.family !== "inline") {
        bank = i % 2 === 0 ? -1 : 1;
        bankIndex = Math.floor(i / 2);
      }
      const zM = (startZ + bankIndex * boreSpacing) / 1000;
      const angleRad = bank * halfBankAngleRad;

      dummyObj.position.set(
        Math.sin(angleRad) * (blockHeightM * 0.5),
        Math.cos(angleRad) * (blockHeightM * 0.5),
        zM
      );
      dummyObj.rotation.set(0, 0, angleRad);
      dummyObj.scale.set(1, 1, 1);
      dummyObj.updateMatrix();

      instancedLiners.setMatrixAt(i, dummyObj.matrix);
    }
    instancedLiners.instanceMatrix.needsUpdate = true;
    instancedLiners.castShadow = true;
    instancedLiners.receiveShadow = true;
    blockGroup.add(instancedLiners);
    this.rootGroup.add(blockGroup);

    // ------------------------------------------------------------------------
    // 2. CRANKSHAFT & HARMONIC DAMPER MESH
    // ------------------------------------------------------------------------
    this.crankshaftMesh = new THREE.Group();
    this.crankshaftMesh.name = "Crankshaft_Assembly";
    const crankShaftBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, blockLengthM + 0.08, 20),
      this.materials.nitridedSteel
    );
    crankShaftBar.rotation.x = Math.PI / 2;
    this.crankshaftMesh.add(crankShaftBar);

    // Crank Throws & Knife-edged Counterweights (GPU Instanced)
    const counterweightRadius = dyn.counterweightRadiusMm / 1000;
    const cwGeo = new THREE.CylinderGeometry(counterweightRadius, counterweightRadius, 0.016, 16, 1, false, 0, Math.PI);
    const instancedCounterweights = new THREE.InstancedMesh(cwGeo, this.materials.forgedSteel, cylindersPerBank);
    instancedCounterweights.name = "Instanced_Crank_Counterweights";

    for (let i = 0; i < cylindersPerBank; i++) {
      const zM = (startZ + i * boreSpacing) / 1000;
      dummyObj.position.set(0, 0, zM);
      dummyObj.rotation.set(0, 0, (i * Math.PI) / 2);
      dummyObj.scale.set(1, 1, 1);
      dummyObj.updateMatrix();

      instancedCounterweights.setMatrixAt(i, dummyObj.matrix);
    }
    instancedCounterweights.instanceMatrix.needsUpdate = true;
    instancedCounterweights.castShadow = true;
    instancedCounterweights.receiveShadow = true;
    this.crankshaftMesh.add(instancedCounterweights);

    // Front Crank Pulley Damper
    const harmonicDamper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.025, 32),
      this.materials.billetAluminum
    );
    harmonicDamper.rotation.x = Math.PI / 2;
    harmonicDamper.position.z = startZ / 1000 - 0.06;
    this.crankshaftMesh.add(harmonicDamper);

    this.mountingGraph.attachMesh("ENGINE_CRANKSHAFT_MAIN", this.crankshaftMesh);
    this.rootGroup.add(this.crankshaftMesh);

    // ------------------------------------------------------------------------
    // 3. PISTONS, CONNECTING RODS & COMBUSTION FLAMES (OPTIMIZED SHARED BUFFERS)
    // ------------------------------------------------------------------------
    const pistonRadiusM = block.boreMm / 2000;
    const pistonHeightM = Math.max(0.035, 0.042 * (block.boreMm / 88));
    const rodLengthM = this.currentRodLengthM;

    // Shared prototype geometries (Instantiated once, reused across all cylinders)
    const pistonCrownGeo = new THREE.CylinderGeometry(pistonRadiusM * 0.98, pistonRadiusM * 0.98, pistonHeightM, 24);
    const ringGeo = new THREE.TorusGeometry(pistonRadiusM * 0.985, 0.001, 6, 20);
    ringGeo.rotateX(Math.PI / 2);
    const glowSphereGeo = new THREE.SphereGeometry(pistonRadiusM * 0.85, 12, 12);
    const rodBeamGeo = new THREE.BoxGeometry(0.014 * (block.boreMm / 88), rodLengthM, 0.022 * (block.strokeMm / 82));
    const bigEndGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.024, 16);
    bigEndGeo.rotateX(Math.PI / 2);
    const smallEndGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.020, 14);
    smallEndGeo.rotateX(Math.PI / 2);

    // Single dynamic ignition point light (Follows active firing cylinder at runtime)
    this.activeFlameLight = new THREE.PointLight(0xff4500, 0, 0.6);
    this.activeFlameLight.name = "DynamicIgnitionLight";
    this.rootGroup.add(this.activeFlameLight);

    const rodMaterial = state.connectingRods.style.includes("titanium") ? this.materials.titaniumAlloy : this.materials.forgedSteel;

    for (let i = 0; i < cylCount; i++) {
      let bank = 0;
      let bankIndex = i;
      if (arch.family !== "inline") {
        bank = i % 2 === 0 ? -1 : 1;
        bankIndex = Math.floor(i / 2);
      }
      const zM = (startZ + bankIndex * boreSpacing) / 1000;
      const angleRad = bank * halfBankAngleRad;

      // Piston Crown Mesh
      const pistonGroup = new THREE.Group();
      pistonGroup.name = `Piston_Cyl_${i + 1}`;
      const pistonCrown = new THREE.Mesh(pistonCrownGeo, this.materials.billetAluminum);
      pistonCrown.castShadow = true;
      pistonGroup.add(pistonCrown);

      // Piston Rings
      const ring1 = new THREE.Mesh(ringGeo, this.materials.nitridedSteel);
      ring1.position.y = 0.012;
      pistonGroup.add(ring1);

      // 4-Stroke Combustion Glow Sphere (Per-cylinder lightweight mesh material)
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xff6b00,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const glowSphere = new THREE.Mesh(glowSphereGeo, glowMat);
      glowSphere.position.y = 0.035;
      pistonGroup.add(glowSphere);

      this.combustionGlows.push({
        mesh: glowSphere,
        cylinderIndex: i,
      });

      this.pistonMeshes.push({
        group: pistonGroup,
        cylinderIndex: i,
        baseZ: zM,
        angleRad,
        glowMesh: glowSphere,
      });

      this.rootGroup.add(pistonGroup);

      // Connecting Rod
      const conrodGroup = new THREE.Group();
      conrodGroup.name = `ConnectingRod_Cyl_${i + 1}`;
      const rodBeam = new THREE.Mesh(rodBeamGeo, rodMaterial);
      rodBeam.position.y = rodLengthM / 2;
      rodBeam.castShadow = true;
      conrodGroup.add(rodBeam);

      // Big End Rod Cap & Bronze Small End Bushing
      const bigEnd = new THREE.Mesh(bigEndGeo, this.materials.forgedSteel);
      conrodGroup.add(bigEnd);

      const smallEnd = new THREE.Mesh(smallEndGeo, this.materials.goldAnodized);
      smallEnd.position.y = rodLengthM;
      conrodGroup.add(smallEnd);

      this.conrodMeshes.push({
        group: conrodGroup,
        cylinderIndex: i,
      });
      this.rootGroup.add(conrodGroup);
    }

    // ------------------------------------------------------------------------
    // 4. CYLINDER HEADS & VALVETRAIN (DOHC & VALVES)
    // ------------------------------------------------------------------------
    const headLengthM = blockLengthM;
    const headWidthM = arch.family === "inline" ? (blockWidthM * 0.88) : (blockWidthM * 0.55);
    const headHeightM = 0.11 * Math.sqrt(block.boreMm / 88);

    // Resolve dynamic valve cover material
    const resolveValveCoverMat = () => {
      const col = state.cosmetics?.valveCoverColor;
      if (col === "monaco_blue") return this.materials.monacoBluePowdercoat;
      if (col === "acid_yellow") return this.materials.gialloModenaPowdercoat;
      if (col === "gold_anodized") return this.materials.goldAnodized;
      if (col === "satin_carbon") return this.materials.carbonFiber;
      if (col === "titanium_gray") return this.materials.titaniumAlloy;
      return this.materials.redCorsaPowdercoat;
    };
    const valveCoverMat = resolveValveCoverMat();

    // Resolve dynamic anodizing hardware
    const resolveAnodizedMat = () => {
      const an = state.cosmetics?.anodizingTheme;
      if (an === "cobalt_blue") return this.materials.cobaltAnodized;
      if (an === "crimson_red") return this.materials.crimsonAnodized;
      if (an === "stealth_black") return this.materials.stealthBlackCeramic;
      if (an === "burnt_titanium") return this.materials.titaniumAlloy;
      return this.materials.goldAnodized;
    };
    const anodizedMat = resolveAnodizedMat();

    const buildCylinderHeadAssembly = (name: string, isLeft: boolean) => {
      const headGroup = new THREE.Group();
      headGroup.name = name;

      // Head Casting
      const headMesh = new THREE.Mesh(
        new THREE.BoxGeometry(headWidthM, headHeightM, headLengthM),
        this.materials.billetAluminum
      );
      headMesh.position.y = headHeightM / 2;
      headGroup.add(headMesh);

      // Colorful Powdercoated Cam Cover
      const camCover = new THREE.Mesh(
        new THREE.BoxGeometry(headWidthM * 0.95, 0.045, headLengthM * 0.98),
        valveCoverMat
      );
      camCover.position.y = headHeightM + 0.025;
      headGroup.add(camCover);

      // Dual Overhead Camshafts (Intake & Exhaust)
      const intakeCam = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, headLengthM * 0.92, 16), this.materials.nitridedSteel);
      intakeCam.rotation.x = Math.PI / 2;
      intakeCam.position.set(-0.045, headHeightM + 0.01, 0);
      headGroup.add(intakeCam);

      const exhaustCam = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, headLengthM * 0.92, 16), this.materials.nitridedSteel);
      exhaustCam.rotation.x = Math.PI / 2;
      exhaustCam.position.set(0.045, headHeightM + 0.01, 0);
      headGroup.add(exhaustCam);

      // Cam Timing Gears
      const camGear1 = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.012, 28), anodizedMat);
      camGear1.rotation.x = Math.PI / 2;
      camGear1.position.set(-0.045, headHeightM + 0.01, startZ / 1000 - 0.04);
      headGroup.add(camGear1);

      const camGear2 = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.012, 28), anodizedMat);
      camGear2.rotation.x = Math.PI / 2;
      camGear2.position.set(0.045, headHeightM + 0.01, startZ / 1000 - 0.04);
      headGroup.add(camGear2);

      return headGroup;
    };

    if (arch.family === "inline") {
      const head = buildCylinderHeadAssembly("CylinderHead_Inline", true);
      this.mountingGraph.attachMesh("ENGINE_HEAD_BANK_CENTER", head);
      this.rootGroup.add(head);
    } else {
      const headL = buildCylinderHeadAssembly("CylinderHead_Bank_L", true);
      this.mountingGraph.attachMesh("ENGINE_HEAD_BANK_L", headL);
      this.rootGroup.add(headL);

      const headR = buildCylinderHeadAssembly("CylinderHead_Bank_R", false);
      this.mountingGraph.attachMesh("ENGINE_HEAD_BANK_R", headR);
      this.rootGroup.add(headR);
    }

    // ------------------------------------------------------------------------
    // 5. AIR INTAKE PLENUM / ITBS & FUEL RAILS
    // ------------------------------------------------------------------------
    const intakeGroup = new THREE.Group();
    intakeGroup.name = "AirIntake_Plenum_Assembly";

    const plenum = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.09, headLengthM * 0.85),
      this.materials.carbonFiber
    );
    plenum.castShadow = true;
    intakeGroup.add(plenum);

    // Throttle Body Inlet
    const throttleBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.08, 24),
      this.materials.billetAluminum
    );
    throttleBody.rotation.x = Math.PI / 2;
    throttleBody.position.z = headLengthM * 0.45;
    intakeGroup.add(throttleBody);

    // Fuel Rails & Injectors
    const fuelRailL = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, headLengthM * 0.8, 16), anodizedMat);
    fuelRailL.rotation.x = Math.PI / 2;
    fuelRailL.position.set(-0.09, -0.04, 0);
    intakeGroup.add(fuelRailL);

    const fuelRailR = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, headLengthM * 0.8, 16), anodizedMat);
    fuelRailR.rotation.x = Math.PI / 2;
    fuelRailR.position.set(0.09, -0.04, 0);
    intakeGroup.add(fuelRailR);

    this.mountingGraph.attachMesh("ENGINE_INTAKE_MANIFOLD", intakeGroup);
    this.rootGroup.add(intakeGroup);

    // ------------------------------------------------------------------------
    // 5b. MODULAR ENGINE BEAUTY COVER (12 Models for All Engine Architectures)
    // ------------------------------------------------------------------------
    if (state.cosmetics?.showEngineCover !== false) {
      const defaultBadge =
        arch.family === "rotary_wankel"
          ? "ROTARY 3-ROTOR"
          : arch.family === "boxer"
          ? `FLAT-${arch.cylinderCount} TWIN TURBO`
          : arch.family === "inline"
          ? `I${arch.cylinderCount} TWIN-CAM 24V`
          : arch.family === "w_engine"
          ? `W${arch.cylinderCount} QUAD-TURBO`
          : arch.cylinderCount === 12
          ? "APEX V12 CORSA"
          : `APEX V${arch.cylinderCount} COMPETITION`;

      const coverOpts = {
        model: state.cosmetics?.coverModel || "hypercar_quartz",
        coverColor: state.cosmetics?.coverColor || "dry_carbon",
        bezelColor: state.cosmetics?.coverBezelColor || "billet_gold",
        badgeText: state.cosmetics?.badgeEmblemText || defaultBadge,
        cylsPerBank: cylindersPerBank,
      };
      const coverScene = buildEngineCoverScene(coverOpts);
      const coverSubsystem = new THREE.Group();
      coverSubsystem.name = "ModularEngineCover_Subsystem";
      coverSubsystem.add(coverScene);

      // Parametrically scale and position cover over intake manifold
      const scaleX = arch.family === "inline" ? 0.88 : arch.family === "w_engine" ? 1.05 : 0.94;
      const scaleY = arch.family === "boxer" ? 0.85 : 0.94;
      const scaleZ = Math.min(1.15, Math.max(0.75, cylindersPerBank / 6));
      coverSubsystem.scale.set(scaleX, scaleY, scaleZ);

      this.mountingGraph.attachMesh("ENGINE_COVER", coverSubsystem);
      this.rootGroup.add(coverSubsystem);

      // --- HIDE INTERNAL COMPONENTS FOR OPTIMIZATION ---
      // When engine cover is visible, hide detailed internals to save GPU
      const internalNames = [
        "ENGINE_BLOCK", "ENGINE_VALVE_COVERS",
        "ENGINE_INTAKE_MANIFOLD", "ENGINE_EXHAUST_HEADER_L", "ENGINE_EXHAUST_HEADER_R",
        "ENGINE_EXHAUST_HEADER_INLINE", "ENGINE_PISTONS", "ENGINE_TURBOCHARGERS",
      ];
      internalNames.forEach(name => {
        const child = this.rootGroup.getObjectByName(name);
        if (child && child instanceof THREE.Group) {
          child.visible = false;
          child.traverse(c => { if ((c as any).isMesh) (c as any).visible = false; });
        }
      });
    } else {
      // Cover OFF — show all internals
      const internalNames = [
        "ENGINE_BLOCK", "ENGINE_VALVE_COVERS",
        "ENGINE_INTAKE_MANIFOLD", "ENGINE_EXHAUST_HEADER_L", "ENGINE_EXHAUST_HEADER_R",
        "ENGINE_EXHAUST_HEADER_INLINE", "ENGINE_PISTONS", "ENGINE_TURBOCHARGERS",
      ];
      internalNames.forEach(name => {
        const child = this.rootGroup.getObjectByName(name);
        if (child && child instanceof THREE.Group) {
          child.visible = true;
          child.traverse(c => { if ((c as any).isMesh) (c as any).visible = true; });
        }
      });
    }

    // ------------------------------------------------------------------------
    // 6. EXHAUST HEADERS (Titanium Heat-Blued / Inconel / Dyno Glow)
    // ------------------------------------------------------------------------
    const resolveExhaustMat = () => {
      const ex = state.cosmetics?.exhaustFinish;
      if (ex === "inconel_gold") return this.materials.inconelExhaust;
      if (ex === "ceramic_white") return this.materials.ceramicWhiteExhaust;
      if (ex === "stealth_black") return this.materials.stealthBlackCeramic;
      if (ex === "polished_stainless") return this.materials.polishedChrome;
      if (ex === "dyno_glow") return this.materials.dynoGlowExhaust;
      return this.materials.titaniumBluedExhaust;
    };
    const exhaustHeaderMat = resolveExhaustMat();

    const buildHeaderAssembly = (name: string, isLeft: boolean) => {
      const headerGroup = new THREE.Group();
      headerGroup.name = name;

      for (let i = 0; i < cylindersPerBank; i++) {
        const zM = (startZ + i * boreSpacing) / 1000;
        const tubeCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, zM),
          new THREE.Vector3(isLeft ? -0.08 : 0.08, -0.04, zM),
          new THREE.Vector3(isLeft ? -0.12 : 0.12, -0.14, 0.04),
        ]);
        const tubeGeom = new THREE.TubeGeometry(tubeCurve, 16, 0.022 * (block.boreMm / 88), 12, false);
        const tube = new THREE.Mesh(tubeGeom, exhaustHeaderMat);
        tube.castShadow = true;
        headerGroup.add(tube);

        // Heat Temper Rings / Titanium Pie-cut Welds
        const ringGeo = new THREE.TorusGeometry(0.0225 * (block.boreMm / 88), 0.003, 8, 16);
        ringGeo.rotateY(Math.PI / 2);
        const ringMesh = new THREE.Mesh(ringGeo, this.materials.goldAnodized);
        ringMesh.position.set(isLeft ? -0.06 : 0.06, -0.03, zM);
        headerGroup.add(ringMesh);
      }
      return headerGroup;
    };

    if (arch.family === "inline") {
      const header = buildHeaderAssembly("Exhaust_Header_Inline", false);
      this.mountingGraph.attachMesh("ENGINE_EXHAUST_HEADER", header);
      this.rootGroup.add(header);
    } else {
      const headerL = buildHeaderAssembly("Exhaust_Header_L", true);
      this.mountingGraph.attachMesh("ENGINE_EXHAUST_HEADER_L", headerL);
      this.rootGroup.add(headerL);

      const headerR = buildHeaderAssembly("Exhaust_Header_R", false);
      this.mountingGraph.attachMesh("ENGINE_EXHAUST_HEADER_R", headerR);
      this.rootGroup.add(headerR);
    }

    // ------------------------------------------------------------------------
    // 7. FORCED INDUCTION & SUPERCHARGERS (Parametric Sizing & Custom Finishes)
    // ------------------------------------------------------------------------
    if (state.turboSystem.type !== "naturally_aspirated") {
      const turboOpts = {
        compressorInducerMm: state.turboSystem.compressorInducerMm ?? 68,
        turbineExducerMm: state.turboSystem.turbineExducerMm ?? 64,
        aRatio: state.turboSystem.aRatio ?? 0.85,
        housingFinish: state.turboSystem.turboHousingFinish || state.cosmetics?.exhaustFinish || "inconel",
        compressorWheelColor: state.turboSystem.compressorWheelColor || "billet_gold",
        wastegateCapColor: state.turboSystem.wastegateCapColor || "anodized_purple",
        couplerColor: state.turboSystem.couplerColor || "blue_silicone",
        scale: 0.95,
      };

      if (state.turboSystem.type === "roots_twin_screw_supercharger") {
        // Twin-Screw / Roots Valley-Mounted Supercharger Blower
        const superchargerMesh = createTwinScrewSuperchargerAssembly({
          displacementLiters: state.turboSystem.superchargerDisplacementLiters ?? 3.0,
          pulleyRatio: state.turboSystem.superchargerPulleyRatio ?? 2.4,
          housingFinish: state.turboSystem.turboHousingFinish || "billet_polished",
          pulleyFinish: state.turboSystem.compressorWheelColor || "billet_gold",
          bypassCapColor: state.turboSystem.wastegateCapColor || "anodized_purple",
        });
        this.mountingGraph.attachMesh("ENGINE_SUPERCHARGER_VALLEY", superchargerMesh);
        this.rootGroup.add(superchargerMesh);

      } else if (state.turboSystem.type === "centrifugal_supercharger") {
        // Centrifugal Supercharger with Front Cogged Belt Drive
        const centrifugalMesh = createCentrifugalSuperchargerAssembly({
          housingFinish: state.turboSystem.turboHousingFinish || "billet_polished",
          pulleyFinish: state.turboSystem.compressorWheelColor || "billet_gold",
          couplerColor: state.turboSystem.couplerColor || "blue_silicone",
        });
        this.mountingGraph.attachMesh("ENGINE_SUPERCHARGER_CENTRIFUGAL", centrifugalMesh);
        this.rootGroup.add(centrifugalMesh);

      } else if (state.turboSystem.type === "hot_v_twin_turbo") {
        // Hot-V Valley Mounted Turbochargers
        const turboHotV = createSingleTurboUnit(0, 0.92, { ...turboOpts, layout: "hot_v" });
        turboHotV.name = "Turbocharger_Hot_V";
        this.mountingGraph.attachMesh("ENGINE_TURBO_HOT_V", turboHotV);
        this.rootGroup.add(turboHotV);

      } else if (state.turboSystem.type === "quad_turbo_staged" || state.turboSystem.turboCount === 4) {
        // Quad-Turbo System (FL, RL, FR, RR)
        const tFL = createSingleTurboUnit(-0.16, 0.86, turboOpts);
        tFL.name = "Turbocharger_Quad_FL";
        this.mountingGraph.attachMesh("ENGINE_TURBO_QUAD_FL", tFL);
        this.rootGroup.add(tFL);

        const tRL = createSingleTurboUnit(-0.16, 0.86, turboOpts);
        tRL.name = "Turbocharger_Quad_RL";
        this.mountingGraph.attachMesh("ENGINE_TURBO_QUAD_RL", tRL);
        this.rootGroup.add(tRL);

        const tFR = createSingleTurboUnit(0.16, 0.86, turboOpts);
        tFR.name = "Turbocharger_Quad_FR";
        tFR.rotation.z = Math.PI;
        this.mountingGraph.attachMesh("ENGINE_TURBO_QUAD_FR", tFR);
        this.rootGroup.add(tFR);

        const tRR = createSingleTurboUnit(0.16, 0.86, turboOpts);
        tRR.name = "Turbocharger_Quad_RR";
        tRR.rotation.z = Math.PI;
        this.mountingGraph.attachMesh("ENGINE_TURBO_QUAD_RR", tRR);
        this.rootGroup.add(tRR);

      } else if (state.turboSystem.type === "single_twin_scroll_turbo" || state.turboSystem.turboCount === 1) {
        // Single High-Flow Turbocharger
        const turboSingle = createSingleTurboUnit(0, 1.12, { ...turboOpts, layout: "single" });
        turboSingle.name = "Turbocharger_Single";
        this.mountingGraph.attachMesh("ENGINE_TURBO_SINGLE", turboSingle);
        this.rootGroup.add(turboSingle);

      } else {
        // Twin-Turbochargers (L & R Outboard)
        const turboL = createSingleTurboUnit(-0.18, 0.95, { ...turboOpts, sideOffset: -0.18 });
        turboL.name = "Turbocharger_L";
        this.mountingGraph.attachMesh("ENGINE_TURBO_L", turboL);
        this.rootGroup.add(turboL);

        const turboR = createSingleTurboUnit(0.18, 0.95, { ...turboOpts, sideOffset: 0.18 });
        turboR.name = "Turbocharger_R";
        turboR.rotation.z = Math.PI;
        this.mountingGraph.attachMesh("ENGINE_TURBO_R", turboR);
        this.rootGroup.add(turboR);
      }
    }

    // ------------------------------------------------------------------------
    // 8. OIL PAN (DRY SUMP / BAFFLED WET SUMP)
    // ------------------------------------------------------------------------
    const oilPanGroup = new THREE.Group();
    oilPanGroup.name = "OilPan_Assembly";
    const panDepthM = dyn.oilPanDepthMm / 1000;
    const panMesh = new THREE.Mesh(
      new THREE.BoxGeometry(blockWidthM * 0.85, panDepthM, blockLengthM * 0.95),
      this.materials.billetAluminum
    );
    oilPanGroup.add(panMesh);

    // Billet Oil Filter
    const filter = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.09, 20), this.materials.redCorsaPowdercoat);
    filter.rotation.z = Math.PI / 2;
    filter.position.set(blockWidthM * 0.45, -0.02, startZ / 1000 + 0.05);
    oilPanGroup.add(filter);

    this.mountingGraph.attachMesh("ENGINE_OIL_PAN", oilPanGroup);
    this.rootGroup.add(oilPanGroup);

    // ------------------------------------------------------------------------
    // 9. SERPENTINE ACCESSORY BELT DRIVE
    // ------------------------------------------------------------------------
    const accGroup = new THREE.Group();
    accGroup.name = "AccessoryDrive_Assembly";

    // Alternator
    const alternator = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.075, 20), this.materials.castAluminum);
    alternator.rotation.x = Math.PI / 2;
    alternator.position.set(-0.14, 0.08, 0);
    accGroup.add(alternator);

    // High Flow Water Pump
    const waterPump = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.065, 20), this.materials.billetAluminum);
    waterPump.rotation.x = Math.PI / 2;
    waterPump.position.set(0.12, 0.06, 0);
    accGroup.add(waterPump);

    this.mountingGraph.attachMesh("ENGINE_ACCESSORY_DRIVE", accGroup);
    this.rootGroup.add(accGroup);

    // Apply exploded offsets
    this.mountingGraph.applyTransformsToAttachedMeshes();

    return this.rootGroup;
  }

  /**
   * Kinematic Animation Update (Called every frame during simulation)
   */
  public updateKinematics(deltaTimeSec: number): void {
    this.kinematicsAnimator.update(deltaTimeSec);

    // 1. Rotate Crankshaft
    if (this.crankshaftMesh) {
      this.crankshaftMesh.rotation.z = -THREE.MathUtils.degToRad(this.kinematicsAnimator.getCrankAngleDeg());
    }

    // 2. Reciprocate Pistons & Articulate Conrods
    const crankRadiusM = this.currentStrokeM / 2;
    const rodLengthM = this.currentRodLengthM;

    let maxIntensity = 0;
    let firingX = 0;
    let firingY = 0;
    let firingZ = 0;
    let firingColor = new THREE.Color(0xff4500);
    let hasFiringCyl = false;

    for (let i = 0; i < this.pistonMeshes.length; i++) {
      const p = this.pistonMeshes[i];
      const solved = this.kinematicsAnimator.solveCylinder(p.cylinderIndex);
      // Exact slider-crank pin distance from crank centerline:
      // displacement is measured from BDC where the pin sits at (rodLength - crankRadius)
      const pinDistanceM = rodLengthM - crankRadiusM + solved.pistonDisplacementMm / 1000;
      const angleRad = p.angleRad;

      // Piston position along cylinder bore axis
      const baseX = Math.sin(angleRad) * pinDistanceM;
      const baseY = Math.cos(angleRad) * pinDistanceM;

      p.group.position.set(baseX, baseY, p.baseZ);
      p.group.rotation.z = -angleRad;

      // Update 4-Stroke Combustion Glow (O(1) direct reference)
      if (p.glowMesh) {
        const mat = p.glowMesh.material as THREE.MeshBasicMaterial;
        mat.color.copy(solved.combustionGlowColor);
        mat.opacity = solved.combustionIntensity;
      }

      if (solved.combustionIntensity > maxIntensity) {
        maxIntensity = solved.combustionIntensity;
        firingX = baseX + Math.sin(angleRad) * 0.04;
        firingY = baseY + Math.cos(angleRad) * 0.04;
        firingZ = p.baseZ;
        firingColor = solved.combustionGlowColor;
        hasFiringCyl = true;
      }
    }

    // Direct dynamic ignition point light to firing cylinder
    if (this.activeFlameLight) {
      if (maxIntensity > 0.05 && hasFiringCyl) {
        this.activeFlameLight.position.set(firingX, firingY, firingZ);
        this.activeFlameLight.color.copy(firingColor);
        this.activeFlameLight.intensity = maxIntensity * 3.2;
      } else {
        this.activeFlameLight.intensity = 0;
      }
    }

    // 3. Conrods Articulation
    this.conrodMeshes.forEach((c) => {
      const p = this.pistonMeshes[c.cylinderIndex];
      if (!p) return;
      const solved = this.kinematicsAnimator.solveCylinder(c.cylinderIndex);

      c.group.position.set(0, 0, p.baseZ);
      c.group.rotation.z = THREE.MathUtils.degToRad(solved.conrodAngleDeg) - p.angleRad;
    });
  }

  public setExplodedFactor(factor: number): void {
    this.mountingGraph.setExplodedFactor(factor);
  }

  public getExplodedFactor(): number {
    return this.mountingGraph.getExplodedFactor();
  }

  public setRpm(rpm: number): void {
    this.kinematicsAnimator.setRpm(rpm);
  }

  public getRpm(): number {
    return this.kinematicsAnimator.getRpm();
  }

  public setRunning(running: boolean): void {
    this.kinematicsAnimator.setRunning(running);
  }

  public getIsRunning(): boolean {
    return this.kinematicsAnimator.getIsRunning();
  }

  public setCombustionGlowEnabled(enabled: boolean): void {
    this.kinematicsAnimator.setCombustionGlowEnabled(enabled);
  }

  public updateLiveParameters(state: MasterEngineState): boolean {
    const arch = state.architecture;
    const summaryKey = `${arch.family}_${arch.cylinderCount}_${arch.bankAngleDeg}_${state.turboSystem.type}_${state.cosmetics?.coverModel}_${state.cosmetics?.showEngineCover}`;

    if (this.lastStateSummary && this.lastStateSummary !== summaryKey) {
      return false; // Structural layout changed, requires full assembly
    }
    this.lastStateSummary = summaryKey;

    this.currentStrokeM = state.block.strokeMm / 1000;
    this.currentRodLengthM = state.connectingRods.rodLengthMm / 1000;
    this.kinematicsAnimator.updateParameters(state);

    // Update material properties dynamically if cosmetics changed
    const valveCoverMat = this.resolveValveCoverMaterial(state);
    this.rootGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.parent?.name.includes('CylinderHead') && mesh.geometry.type === 'BoxGeometry') {
          // If it's the cam cover box
          if (mesh.position.y > 0.08) {
            mesh.material = valveCoverMat;
          }
        }
      }
    });

    return true;
  }

  private resolveValveCoverMaterial(state: MasterEngineState): THREE.Material {
    const col = state.cosmetics?.valveCoverColor;
    if (col === "monaco_blue") return this.materials.monacoBluePowdercoat;
    if (col === "acid_yellow") return this.materials.gialloModenaPowdercoat;
    if (col === "gold_anodized") return this.materials.goldAnodized;
    if (col === "satin_carbon") return this.materials.carbonFiber;
    if (col === "titanium_gray") return this.materials.titaniumAlloy;
    return this.materials.redCorsaPowdercoat;
  }

  public dispose(): void {
    this.rootGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
      }
      if ((child as THREE.Light).isLight) {
        (child as THREE.Light).dispose?.();
      }
    });

    while (this.rootGroup.children.length > 0) {
      this.rootGroup.remove(this.rootGroup.children[0]);
    }

    this.pistonMeshes = [];
    this.conrodMeshes = [];
    this.intakeValves = [];
    this.exhaustValves = [];
    this.combustionGlows = [];
    this.camshaftMeshes = [];
  }

  public getRootGroup(): THREE.Group {
    return this.rootGroup;
  }
}
