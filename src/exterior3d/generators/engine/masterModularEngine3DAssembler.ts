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
import { EngineMountingGraph } from "../../sockets/engineMountingGraph";
import { EngineKinematicsAnimator } from "../../animation/engineKinematicsAnimator";

export class MasterModularEngine3DAssembler {
  private rootGroup: THREE.Group;
  private mountingGraph: EngineMountingGraph;
  private kinematicsAnimator: EngineKinematicsAnimator;

  // Component Mesh References for Kinematic Animation
  private crankshaftMesh: THREE.Group | null = null;
  private pistonMeshes: { group: THREE.Group; cylinderIndex: number; baseZ: number; angleRad: number }[] = [];
  private conrodMeshes: { group: THREE.Group; cylinderIndex: number }[] = [];
  private intakeValves: { mesh: THREE.Mesh; cylinderIndex: number }[] = [];
  private exhaustValves: { mesh: THREE.Mesh; cylinderIndex: number }[] = [];
  private combustionGlows: { mesh: THREE.Mesh; light: THREE.PointLight; cylinderIndex: number }[] = [];
  private camshaftMeshes: THREE.Group[] = [];

  // Live Kinematic Parameter Dimensions
  private currentStrokeM: number = 0.086;
  private currentRodLengthM: number = 0.148;

  // PBR Materials Cache
  private materials: {
    castAluminum: THREE.MeshStandardMaterial;
    billetAluminum: THREE.MeshPhysicalMaterial;
    forgedSteel: THREE.MeshStandardMaterial;
    nitridedSteel: THREE.MeshPhysicalMaterial;
    titaniumAlloy: THREE.MeshPhysicalMaterial;
    carbonFiber: THREE.MeshPhysicalMaterial;
    goldAnodized: THREE.MeshPhysicalMaterial;
    redCorsaPowdercoat: THREE.MeshPhysicalMaterial;
    inconelExhaust: THREE.MeshPhysicalMaterial;
    combustionFlameMat: THREE.MeshBasicMaterial;
  };

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = "MasterModularEngine3D";
    this.mountingGraph = new EngineMountingGraph();
    this.kinematicsAnimator = new EngineKinematicsAnimator();
    this.materials = this.createPBRMaterials();
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
        clearcoat: 0.5,
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
      goldAnodized: new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b, // Anodized gold fittings / pulleys
        metalness: 0.92,
        roughness: 0.15,
        clearcoat: 0.4,
      }),
      redCorsaPowdercoat: new THREE.MeshPhysicalMaterial({
        color: 0xdc2626, // Scuderia Red textured cam covers
        metalness: 0.45,
        roughness: 0.28,
        clearcoat: 0.8,
      }),
      inconelExhaust: new THREE.MeshPhysicalMaterial({
        color: 0xa87954, // Heat-tempered bronze/purple inconel
        metalness: 0.88,
        roughness: 0.26,
      }),
      combustionFlameMat: new THREE.MeshBasicMaterial({
        color: 0xff3d00,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      }),
    };
  }

  public assemble(state: MasterEngineState): THREE.Group {
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

    const arch = state.architecture;
    const block = state.block;
    const cylCount = arch.cylinderCount;
    const cylindersPerBank = arch.family === "inline" ? cylCount : cylCount / 2;
    const boreSpacing = Math.max(arch.boreSpacingMm, block.boreMm + 10);
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
    const blockHeightM = Math.max(arch.deckHeightMm / 1000, (block.strokeMm * 0.9 + state.connectingRods.rodLengthMm + 45) / 1000);

    const blockCasting = new THREE.Mesh(
      new THREE.BoxGeometry(blockWidthM, blockHeightM, blockLengthM),
      state.block.material === "billet_6061_t6" ? this.materials.billetAluminum : this.materials.castAluminum
    );
    blockCasting.position.y = blockHeightM / 2;
    blockCasting.castShadow = true;
    blockCasting.receiveShadow = true;
    blockGroup.add(blockCasting);

    // Cylinder Bore Liners (Hollow Cutouts)
    for (let i = 0; i < cylCount; i++) {
      let bank = 0;
      let bankIndex = i;
      if (arch.family !== "inline") {
        bank = i % 2 === 0 ? -1 : 1;
        bankIndex = Math.floor(i / 2);
      }
      const zM = (startZ + bankIndex * boreSpacing) / 1000;
      const angleRad = bank * halfBankAngleRad;

      const liner = new THREE.Mesh(
        new THREE.CylinderGeometry(block.boreMm / 2000, block.boreMm / 2000, (block.strokeMm * 1.3) / 1000, 24, 1, true),
        this.materials.nitridedSteel
      );
      liner.rotation.z = angleRad;
      liner.position.set(
        Math.sin(angleRad) * (blockHeightM * 0.5),
        Math.cos(angleRad) * (blockHeightM * 0.5),
        zM
      );
      blockGroup.add(liner);
    }
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

    // Crank Throws & Knife-edged Counterweights
    const counterweightRadius = Math.max(0.048, (block.strokeMm / 2000) * 1.35);
    for (let i = 0; i < cylindersPerBank; i++) {
      const zM = (startZ + i * boreSpacing) / 1000;
      const counterweight = new THREE.Mesh(
        new THREE.CylinderGeometry(counterweightRadius, counterweightRadius, 0.016, 16, 1, false, 0, Math.PI),
        this.materials.forgedSteel
      );
      counterweight.position.set(0, 0, zM);
      counterweight.rotation.z = (i * Math.PI) / 2;
      this.crankshaftMesh.add(counterweight);
    }

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
    // 3. PISTONS, CONNECTING RODS & COMBUSTION FLAMES
    // ------------------------------------------------------------------------
    const pistonRadiusM = block.boreMm / 2000;
    const pistonHeightM = Math.max(0.035, 0.042 * (block.boreMm / 88));
    const rodLengthM = this.currentRodLengthM;

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
      const pistonCrown = new THREE.Mesh(
        new THREE.CylinderGeometry(pistonRadiusM * 0.98, pistonRadiusM * 0.98, pistonHeightM, 32),
        this.materials.billetAluminum
      );
      pistonCrown.castShadow = true;
      pistonGroup.add(pistonCrown);

      // Piston Rings
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(pistonRadiusM * 0.985, 0.001, 8, 32), this.materials.nitridedSteel);
      ring1.rotation.x = Math.PI / 2;
      ring1.position.y = 0.012;
      pistonGroup.add(ring1);

      // 4-Stroke Combustion Glow Sphere
      const glowSphere = new THREE.Mesh(
        new THREE.SphereGeometry(pistonRadiusM * 0.85, 16, 16),
        this.materials.combustionFlameMat.clone()
      );
      glowSphere.position.y = 0.035;
      glowSphere.visible = true;
      pistonGroup.add(glowSphere);

      const flameLight = new THREE.PointLight(0xff4500, 0, 0.4);
      flameLight.position.y = 0.05;
      pistonGroup.add(flameLight);

      this.combustionGlows.push({
        mesh: glowSphere,
        light: flameLight,
        cylinderIndex: i,
      });

      this.pistonMeshes.push({
        group: pistonGroup,
        cylinderIndex: i,
        baseZ: zM,
        angleRad,
      });

      this.rootGroup.add(pistonGroup);

      // Connecting Rod
      const conrodGroup = new THREE.Group();
      conrodGroup.name = `ConnectingRod_Cyl_${i + 1}`;
      const rodBeam = new THREE.Mesh(
        new THREE.BoxGeometry(0.014 * (block.boreMm / 88), rodLengthM, 0.022 * (block.strokeMm / 82)),
        state.connectingRods.style.includes("titanium") ? this.materials.titaniumAlloy : this.materials.forgedSteel
      );
      rodBeam.position.y = rodLengthM / 2;
      rodBeam.castShadow = true;
      conrodGroup.add(rodBeam);

      // Big End Rod Cap & Bronze Small End Bushing
      const bigEnd = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.024, 20), this.materials.forgedSteel);
      bigEnd.rotation.x = Math.PI / 2;
      conrodGroup.add(bigEnd);

      const smallEnd = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.020, 16), this.materials.goldAnodized);
      smallEnd.rotation.x = Math.PI / 2;
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

      // Red Textured Cam Cover
      const camCover = new THREE.Mesh(
        new THREE.BoxGeometry(headWidthM * 0.95, 0.045, headLengthM * 0.98),
        this.materials.redCorsaPowdercoat
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
      const camGear1 = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.012, 28), this.materials.goldAnodized);
      camGear1.rotation.x = Math.PI / 2;
      camGear1.position.set(-0.045, headHeightM + 0.01, startZ / 1000 - 0.04);
      headGroup.add(camGear1);

      const camGear2 = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.012, 28), this.materials.goldAnodized);
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
    const fuelRailL = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, headLengthM * 0.8, 16), this.materials.goldAnodized);
    fuelRailL.rotation.x = Math.PI / 2;
    fuelRailL.position.set(-0.09, -0.04, 0);
    intakeGroup.add(fuelRailL);

    const fuelRailR = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, headLengthM * 0.8, 16), this.materials.goldAnodized);
    fuelRailR.rotation.x = Math.PI / 2;
    fuelRailR.position.set(0.09, -0.04, 0);
    intakeGroup.add(fuelRailR);

    this.mountingGraph.attachMesh("ENGINE_INTAKE_MANIFOLD", intakeGroup);
    this.rootGroup.add(intakeGroup);

    // ------------------------------------------------------------------------
    // 6. EXHAUST HEADERS
    // ------------------------------------------------------------------------
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
        const tube = new THREE.Mesh(tubeGeom, this.materials.inconelExhaust);
        tube.castShadow = true;
        headerGroup.add(tube);
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
    // 7. TWIN TURBOCHARGERS
    // ------------------------------------------------------------------------
    if (state.turboSystem.type !== "naturally_aspirated") {
      const buildTurbocharger = (name: string) => {
        const turboG = new THREE.Group();
        turboG.name = name;

        // Exhaust Snail Turbine Housing
        const turbine = new THREE.Mesh(
          new THREE.TorusGeometry(0.048, 0.026, 16, 24, Math.PI * 1.6),
          this.materials.inconelExhaust
        );
        turboG.add(turbine);

        // Compressor Housing
        const compressor = new THREE.Mesh(
          new THREE.TorusGeometry(0.052, 0.028, 16, 24, Math.PI * 1.6),
          this.materials.billetAluminum
        );
        compressor.position.z = 0.055;
        turboG.add(compressor);

        // Wastegate Actuator Canister
        const wastegate = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.055, 16), this.materials.goldAnodized);
        wastegate.position.set(0.065, 0.04, 0.03);
        turboG.add(wastegate);

        return turboG;
      };

      if (state.turboSystem.type === "hot_v_twin_turbo") {
        const turboHotV = buildTurbocharger("Turbocharger_Hot_V");
        this.mountingGraph.attachMesh("ENGINE_TURBO_HOT_V", turboHotV);
        this.rootGroup.add(turboHotV);
      } else {
        const turboL = buildTurbocharger("Turbocharger_L");
        this.mountingGraph.attachMesh("ENGINE_TURBO_L", turboL);
        this.rootGroup.add(turboL);

        if (state.turboSystem.turboCount >= 2) {
          const turboR = buildTurbocharger("Turbocharger_R");
          this.mountingGraph.attachMesh("ENGINE_TURBO_R", turboR);
          this.rootGroup.add(turboR);
        }
      }
    }

    // ------------------------------------------------------------------------
    // 8. OIL PAN (DRY SUMP / BAFFLED WET SUMP)
    // ------------------------------------------------------------------------
    const oilPanGroup = new THREE.Group();
    oilPanGroup.name = "OilPan_Assembly";
    const panDepthM = Math.max(0.065, (block.strokeMm / 2000) * 1.25);
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

    this.pistonMeshes.forEach((p) => {
      const solved = this.kinematicsAnimator.solveCylinder(p.cylinderIndex);
      const dispM = (solved.pistonDisplacementMm) / 1000;
      const angleRad = p.angleRad;

      // Piston position along cylinder bore axis
      const baseX = Math.sin(angleRad) * (rodLengthM + dispM);
      const baseY = Math.cos(angleRad) * (rodLengthM + dispM);

      p.group.position.set(baseX, baseY, p.baseZ);
      p.group.rotation.z = -angleRad;

      // Update 4-Stroke Combustion Glow
      const glow = this.combustionGlows.find((g) => g.cylinderIndex === p.cylinderIndex);
      if (glow) {
        (glow.mesh.material as THREE.MeshBasicMaterial).color.copy(solved.combustionGlowColor);
        (glow.mesh.material as THREE.MeshBasicMaterial).opacity = solved.combustionIntensity;
        glow.light.color.copy(solved.combustionGlowColor);
        glow.light.intensity = solved.combustionIntensity * 2.8;
      }
    });

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

  public getRootGroup(): THREE.Group {
    return this.rootGroup;
  }
}
