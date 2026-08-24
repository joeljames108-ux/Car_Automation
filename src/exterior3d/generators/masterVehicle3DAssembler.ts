/**
 * ============================================================================
 * MASTER VEHICLE 3D ASSEMBLER
 * ============================================================================
 * Procedurally constructs and orchestrates the complete, photorealistic 3D
 * vehicle model with all 12 modular subassemblies attached to the master
 * scene graph. Supports real-time parameter morphing, exploded views,
 * X-ray ghosting, and component isolation.
 */

import * as THREE from "three";
import { MasterVehicleState } from "../../sim/masterVehicleState/masterVehicleTypes";
import { MasterAttachmentGraph } from "../sockets/masterAttachmentGraph";
import { MasterInterior3DStudio } from "./interior/masterInterior3DStudio";

export class MasterVehicle3DAssembler {
  private attachmentGraph: MasterAttachmentGraph;
  private rootGroup: THREE.Group;
  private currentState: MasterVehicleState | null = null;

  constructor() {
    this.attachmentGraph = new MasterAttachmentGraph();
    this.rootGroup = this.attachmentGraph.getRootGroup();
  }

  public getRootGroup(): THREE.Group {
    return this.rootGroup;
  }

  public getAttachmentGraph(): MasterAttachmentGraph {
    return this.attachmentGraph;
  }

  /**
   * Assembles the complete vehicle 3D scene from the current MasterVehicleState.
   */
  public assembleVehicle(state: MasterVehicleState): THREE.Group {
    this.currentState = state;
    const c = state.chassis;
    const p = state.powertrain;
    const a = state.aero;
    const b = state.bodyPanels;
    const w = state.wheelsBrakes;

    // 1. Update chassis parametric dimensions in the attachment graph
    this.attachmentGraph.updateChassisDimensions(c.wheelbaseMm, c.frontTrackMm);

    // 2. Build and attach Subsystem 1: Chassis Monocoque / Spaceframe
    const chassisMesh = this.buildChassisMesh(c);
    this.attachmentGraph.attachComponent(
      "NODE_CHASSIS",
      "chassis",
      "CHASSIS_CABIN_FLOOR",
      chassisMesh,
      { x: 0, y: -250, z: 0 }
    );

    // 3. Build and attach Subsystem 2: Powertrain & Engine Block
    const engineMesh = this.buildEngineAssembly(p);
    this.attachmentGraph.attachComponent(
      "NODE_ENGINE",
      "powertrain",
      "CHASSIS_ENGINE_BAY",
      engineMesh,
      { x: 0, y: 400, z: 0 }
    );

    // 4. Build and attach Subsystem 3: Transmission & Rear Differential
    const transMesh = this.buildTransmissionAssembly();
    this.attachmentGraph.attachComponent(
      "NODE_TRANSMISSION",
      "transmission",
      "CHASSIS_TRANSMISSION_TUNNEL",
      transMesh,
      { x: 0, y: 250, z: 300 }
    );

    // 5. Build and attach Subsystem 4: Suspension & 4-Corner Assemblies
    const suspFL = this.buildCornerSuspension(true, w);
    const suspFR = this.buildCornerSuspension(false, w);
    const suspRL = this.buildCornerSuspension(true, w);
    const suspRR = this.buildCornerSuspension(false, w);

    this.attachmentGraph.attachComponent("NODE_SUSP_FL", "suspension", "CHASSIS_FRONT_SUSP_L", suspFL, { x: -350, y: 0, z: -250 });
    this.attachmentGraph.attachComponent("NODE_SUSP_FR", "suspension", "CHASSIS_FRONT_SUSP_R", suspFR, { x: 350, y: 0, z: -250 });
    this.attachmentGraph.attachComponent("NODE_SUSP_RL", "suspension", "CHASSIS_REAR_SUSP_L", suspRL, { x: -350, y: 0, z: 250 });
    this.attachmentGraph.attachComponent("NODE_SUSP_RR", "suspension", "CHASSIS_REAR_SUSP_R", suspRR, { x: 350, y: 0, z: 250 });

    // 6. Build and attach Subsystem 5: Aerodynamics (Front Splitter, Diffuser, Rear Wing)
    const splitterMesh = this.buildFrontSplitter(a);
    const diffuserMesh = this.buildRearDiffuser(a);
    const rearWingMesh = this.buildRearWing(a);

    this.attachmentGraph.attachComponent("NODE_AERO_SPLITTER", "aero", "AERO_FRONT_SPLITTER_SOCKET", splitterMesh, { x: 0, y: -200, z: -400 });
    this.attachmentGraph.attachComponent("NODE_AERO_DIFFUSER", "aero", "AERO_UNDERBODY_DIFFUSER", diffuserMesh, { x: 0, y: -150, z: 400 });
    this.attachmentGraph.attachComponent("NODE_AERO_WING", "aero", "AERO_REAR_WING_DECK", rearWingMesh, { x: 0, y: 450, z: 350 });

    // 7. Build and attach Subsystem 6: Body Panels & Outer Shell
    const bodyMesh = this.buildBodyPanelsShell(b, c);
    this.attachmentGraph.attachComponent("NODE_BODY_SHELL", "body_panels", "CHASSIS_CABIN_FLOOR", bodyMesh, { x: 0, y: 600, z: 0 });

    // 8. Build and attach Subsystem 7: 3D Cockpit & Interior
    const interiorMesh = MasterInterior3DStudio.buildCockpitScene(state.interior);
    this.attachmentGraph.attachComponent("NODE_INTERIOR", "interior", "CHASSIS_CABIN_FLOOR", interiorMesh, { x: 0, y: 0, z: 0 });

    return this.rootGroup;
  }

  // ==========================================================================
  // PROCEDURAL 3D BUILDERS
  // ==========================================================================

  private buildChassisMesh(c: MasterVehicleState["chassis"]): THREE.Group {
    const group = new THREE.Group();
    group.name = "ChassisMonocoque";

    const wbM = c.wheelbaseMm / 1000;
    const trM = c.frontTrackMm / 1000;

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x181a1e,
      roughness: 0.35,
      metalness: 0.85,
    });

    const aluMat = new THREE.MeshStandardMaterial({
      color: 0xa0a8b4,
      roughness: 0.25,
      metalness: 0.95,
    });

    // Central Passenger Tub Floor
    const floorGeo = new THREE.BoxGeometry(trM * 0.72, 0.08, wbM * 0.58);
    const floorMesh = new THREE.Mesh(floorGeo, carbonMat);
    floorMesh.position.set(0, 0, 0);
    group.add(floorMesh);

    // Left & Right Sills
    const sillGeo = new THREE.BoxGeometry(0.18, 0.26, wbM * 0.62);
    const sillL = new THREE.Mesh(sillGeo, carbonMat);
    sillL.position.set(-trM * 0.38, 0.1, 0);
    const sillR = new THREE.Mesh(sillGeo, carbonMat);
    sillR.position.set(trM * 0.38, 0.1, 0);
    group.add(sillL, sillR);

    // Front Subframe Cradle (Aluminum)
    const frontSubGeo = new THREE.BoxGeometry(trM * 0.68, 0.14, wbM * 0.32);
    const frontSub = new THREE.Mesh(frontSubGeo, aluMat);
    frontSub.position.set(0, 0.08, -wbM * 0.44);
    group.add(frontSub);

    // Rear Subframe Cradle (Aluminum)
    const rearSubGeo = new THREE.BoxGeometry(trM * 0.68, 0.16, wbM * 0.36);
    const rearSub = new THREE.Mesh(rearSubGeo, aluMat);
    rearSub.position.set(0, 0.08, wbM * 0.44);
    group.add(rearSub);

    // Front & Rear Crash Structures
    const crashConeGeo = new THREE.ConeGeometry(0.08, 0.35, 8);
    const crashL = new THREE.Mesh(crashConeGeo, carbonMat);
    crashL.rotation.x = -Math.PI / 2;
    crashL.position.set(-0.35, 0.1, -wbM * 0.65);
    const crashR = new THREE.Mesh(crashConeGeo, carbonMat);
    crashR.rotation.x = -Math.PI / 2;
    crashR.position.set(0.35, 0.1, -wbM * 0.65);
    group.add(crashL, crashR);

    return group;
  }

  private buildEngineAssembly(p: MasterVehicleState["powertrain"]): THREE.Group {
    const group = new THREE.Group();
    group.name = "PowertrainAssembly";

    const castIronMat = new THREE.MeshStandardMaterial({ color: 0x22262c, roughness: 0.65, metalness: 0.8 });
    const redAluMat = new THREE.MeshStandardMaterial({ color: 0xcc1111, roughness: 0.35, metalness: 0.65 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe8eef5, roughness: 0.15, metalness: 0.98 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.85 });

    // 1. Engine Block V-Configuration
    const blockGeo = new THREE.BoxGeometry(0.48, 0.36, 0.58);
    const blockMesh = new THREE.Mesh(blockGeo, castIronMat);
    group.add(blockMesh);

    // 2. Dual Red Anodized Cylinder Heads (Cylinder Heads)
    const headGeo = new THREE.BoxGeometry(0.24, 0.18, 0.56);
    const headL = new THREE.Mesh(headGeo, redAluMat);
    headL.rotation.z = Math.PI / 6;
    headL.position.set(-0.22, 0.22, 0);

    const headR = new THREE.Mesh(headGeo, redAluMat);
    headR.rotation.z = -Math.PI / 6;
    headR.position.set(0.22, 0.22, 0);
    group.add(headL, headR);

    // 3. Carbon/Alu Intake Plenum & Runners
    const intakePlenumGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.48, 16);
    const intakeMesh = new THREE.Mesh(intakePlenumGeo, chromeMat);
    intakeMesh.rotation.x = Math.PI / 2;
    intakeMesh.position.set(0, 0.32, 0);
    group.add(intakeMesh);

    // 4. Twin Turbochargers (if forced induction)
    if (p.aspiration === "twin_turbo" || p.aspiration === "quad_turbo") {
      const turboGeo = new THREE.TorusGeometry(0.08, 0.04, 12, 24);
      const turboL = new THREE.Mesh(turboGeo, goldMat);
      turboL.rotation.y = Math.PI / 2;
      turboL.position.set(-0.34, 0.05, 0.18);

      const turboR = new THREE.Mesh(turboGeo, goldMat);
      turboR.rotation.y = Math.PI / 2;
      turboR.position.set(0.34, 0.05, 0.18);
      group.add(turboL, turboR);
    }

    // 5. Front Pulley & Belt System
    const pulleyGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.03, 16);
    const pulley = new THREE.Mesh(pulleyGeo, chromeMat);
    pulley.rotation.x = Math.PI / 2;
    pulley.position.set(0, 0, -0.31);
    group.add(pulley);

    return group;
  }

  private buildTransmissionAssembly(): THREE.Group {
    const group = new THREE.Group();
    group.name = "TransmissionAssembly";

    const transMat = new THREE.MeshStandardMaterial({ color: 0x5a6370, roughness: 0.45, metalness: 0.85 });
    const driveShaftMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.95 });

    // Bellhousing & Gearbox Casing
    const bellGeo = new THREE.ConeGeometry(0.24, 0.28, 16);
    const bellMesh = new THREE.Mesh(bellGeo, transMat);
    bellMesh.rotation.x = Math.PI / 2;
    bellMesh.position.set(0, 0, -0.15);
    group.add(bellMesh);

    const casingGeo = new THREE.BoxGeometry(0.28, 0.26, 0.42);
    const casingMesh = new THREE.Mesh(casingGeo, transMat);
    casingMesh.position.set(0, 0, 0.18);
    group.add(casingMesh);

    // Rear Differential Housing
    const diffGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const diffMesh = new THREE.Mesh(diffGeo, transMat);
    diffMesh.position.set(0, 0, 0.44);
    group.add(diffMesh);

    // Left & Right Half-Shafts
    const shaftGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.65, 12);
    const shaftL = new THREE.Mesh(shaftGeo, driveShaftMat);
    shaftL.rotation.z = Math.PI / 2;
    shaftL.position.set(-0.35, 0, 0.44);
    const shaftR = new THREE.Mesh(shaftGeo, driveShaftMat);
    shaftR.rotation.z = Math.PI / 2;
    shaftR.position.set(0.35, 0, 0.44);
    group.add(shaftL, shaftR);

    return group;
  }

  private buildCornerSuspension(isLeft: boolean, w: MasterVehicleState["wheelsBrakes"]): THREE.Group {
    const group = new THREE.Group();
    const sign = isLeft ? -1 : 1;

    const wishboneMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.9 });
    const springMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.7 });
    const discMat = new THREE.MeshStandardMaterial({ color: 0x3a3d45, roughness: 0.3, metalness: 0.95 });
    const caliperMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25, metalness: 0.8 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.9, metalness: 0.1 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd8dee9, roughness: 0.15, metalness: 0.95 });

    // 1. Wishbone Control Arms
    const armGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.34, 8);
    const upperArm = new THREE.Mesh(armGeo, wishboneMat);
    upperArm.rotation.z = sign * (Math.PI / 6);
    upperArm.position.set(sign * 0.16, 0.12, 0);

    const lowerArm = new THREE.Mesh(armGeo, wishboneMat);
    lowerArm.rotation.z = sign * (Math.PI / 10);
    lowerArm.position.set(sign * 0.16, -0.1, 0);
    group.add(upperArm, lowerArm);

    // 2. Coilover Spring & Damper
    const damperGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.28, 12);
    const damper = new THREE.Mesh(damperGeo, wishboneMat);
    damper.rotation.z = sign * (Math.PI / 5);
    damper.position.set(sign * 0.14, 0.04, 0);

    const springGeo = new THREE.TorusGeometry(0.035, 0.008, 8, 24);
    const spring1 = new THREE.Mesh(springGeo, springMat);
    spring1.rotation.x = Math.PI / 2;
    spring1.position.copy(damper.position);
    group.add(damper, spring1);

    // 3. Carbon-Ceramic Brake Disc (Drilled)
    const discRadius = (w.frontDiscDiameterMm / 1000) / 2;
    const discGeo = new THREE.CylinderGeometry(discRadius, discRadius, 0.028, 32);
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.rotation.z = Math.PI / 2;
    discMesh.position.set(sign * 0.32, 0, 0);

    // 4. 8-Piston Monobloc Brake Caliper
    const caliperGeo = new THREE.BoxGeometry(0.06, 0.14, 0.24);
    const caliperMesh = new THREE.Mesh(caliperGeo, caliperMat);
    caliperMesh.position.set(sign * 0.32, 0.08, 0.08);
    group.add(discMesh, caliperMesh);

    // 5. Forged Alloy Wheel & Performance Tire
    const tireRadius = 0.34;
    const tireWidth = 0.28;
    const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, 32);
    const tireMesh = new THREE.Mesh(tireGeo, tireMat);
    tireMesh.rotation.z = Math.PI / 2;
    tireMesh.position.set(sign * 0.34, 0, 0);

    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, tireWidth + 0.01, 24);
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.z = Math.PI / 2;
    rimMesh.position.copy(tireMesh.position);

    group.add(tireMesh, rimMesh);

    return group;
  }

  private buildFrontSplitter(a: MasterVehicleState["aero"]): THREE.Group {
    const group = new THREE.Group();
    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.3, metalness: 0.9 });
    const strutMat = new THREE.MeshStandardMaterial({ color: 0xd8dee9, roughness: 0.2, metalness: 0.95 });

    const lenM = (a.frontSplitterLengthMm + 120) / 1000;
    const splitterGeo = new THREE.BoxGeometry(1.78, 0.02, lenM);
    const splitterMesh = new THREE.Mesh(splitterGeo, carbonMat);
    group.add(splitterMesh);

    // Tie-rod Support Struts
    const strutGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.22, 8);
    const strutL = new THREE.Mesh(strutGeo, strutMat);
    strutL.rotation.x = Math.PI / 6;
    strutL.position.set(-0.38, 0.1, 0.04);

    const strutR = new THREE.Mesh(strutGeo, strutMat);
    strutR.rotation.x = Math.PI / 6;
    strutR.position.set(0.38, 0.1, 0.04);
    group.add(strutL, strutR);

    // Dive Planes / Canards
    if (a.frontCanardsCount >= 2) {
      const canardGeo = new THREE.BoxGeometry(0.22, 0.01, 0.12);
      const canardL = new THREE.Mesh(canardGeo, carbonMat);
      canardL.rotation.z = -Math.PI / 12;
      canardL.position.set(-0.82, 0.18, 0);

      const canardR = new THREE.Mesh(canardGeo, carbonMat);
      canardR.rotation.z = Math.PI / 12;
      canardR.position.set(0.82, 0.18, 0);
      group.add(canardL, canardR);
    }

    return group;
  }

  private buildRearDiffuser(a: MasterVehicleState["aero"]): THREE.Group {
    const group = new THREE.Group();
    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.3, metalness: 0.9 });

    const angleRad = (a.rearDiffuserAngleDeg * Math.PI) / 180;
    const trayGeo = new THREE.BoxGeometry(1.68, 0.025, 0.75);
    const trayMesh = new THREE.Mesh(trayGeo, carbonMat);
    trayMesh.rotation.x = -angleRad;
    group.add(trayMesh);

    // Vertical Aero Strakes
    const strakeCount = a.rearDiffuserStrakeCount || 4;
    const spacing = 1.4 / (strakeCount - 1);
    for (let i = 0; i < strakeCount; i++) {
      const strakeGeo = new THREE.BoxGeometry(0.012, 0.14, 0.72);
      const strake = new THREE.Mesh(strakeGeo, carbonMat);
      strake.rotation.x = -angleRad;
      strake.position.set(-0.7 + i * spacing, -0.06, 0);
      group.add(strake);
    }

    return group;
  }

  private buildRearWing(a: MasterVehicleState["aero"]): THREE.Group {
    const group = new THREE.Group();
    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.3, metalness: 0.9 });
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.25, metalness: 0.95 });

    const spanM = a.rearWingSpanMm / 1000;
    const chordM = a.rearWingChordMm / 1000;
    const angleRad = (a.rearWingAngleDeg * Math.PI) / 180;

    // Main Airfoil Element
    const wingGeo = new THREE.BoxGeometry(spanM, 0.03, chordM);
    const wingMesh = new THREE.Mesh(wingGeo, carbonMat);
    wingMesh.rotation.x = angleRad;
    wingMesh.position.set(0, 0.36, 0);
    group.add(wingMesh);

    // Dual Swan-Neck Mount Pylons
    const pylonGeo = new THREE.BoxGeometry(0.025, 0.42, 0.18);
    const pylonL = new THREE.Mesh(pylonGeo, pylonMat);
    pylonL.position.set(-0.35, 0.18, -0.04);

    const pylonR = new THREE.Mesh(pylonGeo, pylonMat);
    pylonR.position.set(0.35, 0.18, -0.04);
    group.add(pylonL, pylonR);

    // Endplates
    const endplateGeo = new THREE.BoxGeometry(0.012, 0.26, chordM * 1.35);
    const endplateL = new THREE.Mesh(endplateGeo, carbonMat);
    endplateL.position.set(-spanM / 2, 0.36, 0);

    const endplateR = new THREE.Mesh(endplateGeo, carbonMat);
    endplateR.position.set(spanM / 2, 0.36, 0);
    group.add(endplateL, endplateR);

    return group;
  }

  private buildBodyPanelsShell(b: MasterVehicleState["bodyPanels"], c: MasterVehicleState["chassis"]): THREE.Group {
    const group = new THREE.Group();
    group.name = "BodyPanelsShell";

    const paintColor = new THREE.Color(b.paintColorHex || "#ef4444");
    const paintMat = new THREE.MeshPhysicalMaterial({
      color: paintColor,
      roughness: b.paintFinish === "matte" ? 0.6 : 0.15,
      metalness: 0.65,
      clearcoat: b.paintFinish === "matte" ? 0.0 : 1.0,
      clearcoatRoughness: 0.1,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x050810,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.45,
    });

    const wbM = c.wheelbaseMm / 1000;
    const trM = c.frontTrackMm / 1000;

    // 1. Hood with Twin NACA Ducts
    const hoodGeo = new THREE.BoxGeometry(trM * 0.82, 0.06, wbM * 0.42);
    const hoodMesh = new THREE.Mesh(hoodGeo, paintMat);
    hoodMesh.position.set(0, 0.28, -wbM * 0.38);
    group.add(hoodMesh);

    // 2. Curved Windshield & Greenhouse Glass
    const windshieldGeo = new THREE.BoxGeometry(trM * 0.76, 0.03, wbM * 0.35);
    const windshieldMesh = new THREE.Mesh(windshieldGeo, glassMat);
    windshieldMesh.rotation.x = Math.PI / 4;
    windshieldMesh.position.set(0, 0.52, -wbM * 0.12);
    group.add(windshieldMesh);

    // 3. Roof Panel
    const roofGeo = new THREE.BoxGeometry(trM * 0.72, 0.04, wbM * 0.38);
    const roofMesh = new THREE.Mesh(roofGeo, paintMat);
    roofMesh.position.set(0, 0.64, wbM * 0.08);
    group.add(roofMesh);

    // 4. Left & Right Sculpted Fenders & Sidepods
    const fenderGeo = new THREE.BoxGeometry(0.22, 0.34, wbM * 0.95);
    const fenderL = new THREE.Mesh(fenderGeo, paintMat);
    fenderL.position.set(-trM * 0.48, 0.26, 0);

    const fenderR = new THREE.Mesh(fenderGeo, paintMat);
    fenderR.position.set(trM * 0.48, 0.26, 0);
    group.add(fenderL, fenderR);

    // 5. Rear Engine Decklid & Louvres
    const deckGeo = new THREE.BoxGeometry(trM * 0.78, 0.05, wbM * 0.46);
    const deckMesh = new THREE.Mesh(deckGeo, paintMat);
    deckMesh.position.set(0, 0.42, wbM * 0.42);
    group.add(deckMesh);

    return group;
  }
}
