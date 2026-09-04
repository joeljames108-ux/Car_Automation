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
import { SculptedBodyPanelsGenerator } from "./sculptedBodyPanelsGenerator";
import { MasterInterior3DStudio } from "./interior/masterInterior3DStudio";
import { generateWheel3DGeometry } from "./wheelGenerator";
import { generateTire3DGeometry } from "./tireGenerator";
import { generateBrakes3DGeometry } from "./brakeCaliperGenerator";
import { generateFrontSuspension3DGeometry } from "./frontSuspensionGenerator";
import { generateRearSuspension3DGeometry } from "./rearSuspensionGenerator";
import { generateFrontSplitter3DGeometry } from "./frontSplitterGenerator";
import { generateRearDiffuser3DGeometry } from "./rearDiffuserGenerator";
import { generateRearWing3DGeometry } from "./rearWingGenerator";

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
    const suspFL = this.buildCornerSuspension(true, w, false);
    const suspFR = this.buildCornerSuspension(false, w, false);
    const suspRL = this.buildCornerSuspension(true, w, true);
    const suspRR = this.buildCornerSuspension(false, w, true);

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

  private buildCornerSuspension(isLeft: boolean, w: MasterVehicleState["wheelsBrakes"], isRear: boolean = false): THREE.Group {
    const group = new THREE.Group();
    const sign = isLeft ? -1 : 1;

    // 1 & 2. High-Fidelity Double Wishbone / Multilink Suspension Rig (Phase 11)
    const suspRig = isRear
      ? generateRearSuspension3DGeometry()
      : generateFrontSuspension3DGeometry();
    suspRig.scale.set(sign, 1, 1);
    group.add(suspRig);

    // 3. High-Fidelity Carbon-Ceramic Drilled Brakes (Phase 10)
    const brakes = generateBrakes3DGeometry({
      caliperColorHex: (w as any)?.caliperColor || "#ef4444",
    });
    brakes.name = `Brakes_Assembly_${isLeft ? "LH" : "RH"}`;
    brakes.rotation.y = isLeft ? -Math.PI / 2 : Math.PI / 2;
    brakes.position.set(sign * 0.31, 0, 0);
    group.add(brakes);

    // 4. High-Fidelity Forged Alloy Wheel Rim (Phase 08)
    const rim = generateWheel3DGeometry({
      finish: ((w as any)?.rimFinish as any) || "silver",
    });
    rim.name = `Wheel_Rim_${isLeft ? "LH" : "RH"}`;
    rim.rotation.y = isLeft ? -Math.PI / 2 : Math.PI / 2;
    rim.position.set(sign * 0.34, 0, 0);
    group.add(rim);

    // 5. High-Fidelity Competition Toroidal Tire (Phase 09)
    const tire = generateTire3DGeometry();
    tire.name = `Tire_${isLeft ? "LH" : "RH"}`;
    tire.rotation.y = isLeft ? -Math.PI / 2 : Math.PI / 2;
    tire.position.set(sign * 0.34, 0, 0);
    group.add(tire);

    return group;
  }

  private buildFrontSplitter(_a: MasterVehicleState["aero"]): THREE.Group {
    const group = new THREE.Group();
    group.name = "Front_Splitter_Subsystem";
    const splitter = generateFrontSplitter3DGeometry();
    group.add(splitter);
    return group;
  }

  private buildRearDiffuser(a: MasterVehicleState["aero"]): THREE.Group {
    const group = new THREE.Group();
    group.name = "Rear_Diffuser_Subsystem";
    const diffuser = generateRearDiffuser3DGeometry({
      diffuserFinCount: a.rearDiffuserStrakeCount || 6,
      diffuserExpansionAngleDeg: a.rearDiffuserAngleDeg || 14,
    });
    group.add(diffuser);
    return group;
  }

  private buildRearWing(_a: MasterVehicleState["aero"]): THREE.Group {
    const group = new THREE.Group();
    group.name = "Rear_Wing_Subsystem";
    const wing = generateRearWing3DGeometry();
    group.add(wing);
    return group;
  }

  private buildBodyPanelsShell(b: MasterVehicleState["bodyPanels"], c: MasterVehicleState["chassis"]): THREE.Group {
    // Use the sculpted body panels generator for realistic curved geometry
    const bodyType = (c.bodyType as any) || "supercar";
    const paintColor = b.paintColorHex || "#ef4444";
    const trackWidthMm = c.frontTrackMm || 1620;
    const wheelbaseMm = c.wheelbaseMm || 2850;
    
    try {
      const sculptedBody = SculptedBodyPanelsGenerator.buildSculptedBody(
        bodyType,
        wheelbaseMm,
        trackWidthMm,
        "forged",
        false,
        parseInt(paintColor.replace("#", "0x"), 16) || 0xef4444
      );
      sculptedBody.name = "Sculpted_Body_Shell";
      return sculptedBody;
    } catch (err) {
      // Fallback to basic geometry if sculpted generator fails
      console.warn("Sculpted body generator failed, using fallback:", err);
      return this.buildBasicBodyFallback(b, c);
    }
  }

  private buildBasicBodyFallback(b: MasterVehicleState["bodyPanels"], c: MasterVehicleState["chassis"]): THREE.Group {
    const group = new THREE.Group();
    group.name = "Basic_Body_Fallback";
    const paintColor = new THREE.Color(b.paintColorHex || "#ef4444");
    const paintMat = new THREE.MeshPhysicalMaterial({ color: paintColor, roughness: 0.15, metalness: 0.65, clearcoat: 1.0, clearcoatRoughness: 0.1 });
    const wbM = c.wheelbaseMm / 1000;
    const trM = c.frontTrackMm / 1000;
    const hoodGeo = new THREE.BoxGeometry(trM * 0.82, 0.06, wbM * 0.42);
    const hoodMesh = new THREE.Mesh(hoodGeo, paintMat);
    hoodMesh.position.set(0, 0.28, -wbM * 0.38);
    group.add(hoodMesh);
    const roofGeo = new THREE.BoxGeometry(trM * 0.72, 0.04, wbM * 0.38);
    const roofMesh = new THREE.Mesh(roofGeo, paintMat);
    roofMesh.position.set(0, 0.64, wbM * 0.08);
    group.add(roofMesh);
    return group;
  }

  /**
   * Frees all GPU buffer geometries and materials in the vehicle hierarchy.
   */
  public dispose(): void {
    this.attachmentGraph.dispose();
    this.rootGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m.dispose());
        }
      }
    });
  }
}
