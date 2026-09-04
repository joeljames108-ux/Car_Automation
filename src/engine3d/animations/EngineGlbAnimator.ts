// ============================================================================
// ENGINE GLB ANIMATOR — DEEP KINEMATIC GLB NODE BINDER & MESH SYNCHRONIZER
// ============================================================================
// Traverses the authentic 559-node V12 racing engine GLB and drives:
// - Crankshaft main shaft & 6 counterweights & 6 crankpin journals
// - 12 Forged pistons & ring packs along 60° V-bank bore axes
// - 12 Connecting rods & big-end caps with non-linear angular swing
// - 4 Camshafts & 48 cam lobes at half crankshaft speed (ω/2)
// - 12 ITB throttle butterfly plates & spindles & linkage bar
// - Front accessory damper pulley, alternator pulley, idlers, cooling fan
// - Flywheel mass & starter ring gear
// - Synchronized spark ignition flash & power stroke combustion flame kernels
// - Exhaust header primary heat pulses
// - Real-time Cylinder Cutaway (X-Ray) mode & Exploded View mode
// ============================================================================

import * as THREE from 'three';
import {
  calculatePistonDisplacement,
  calculateConRodAngle,
  solveCylinderCycle,
  V12_FIRING_ORDER_DEGREES,
  V12_PIN_PHASE_DEG,
  getV12CrankpinIndex,
  getV12PistonPhaseDeg,
  PISTON_CONFIGS,
  type CylinderCycleState,
  type EngineType,
} from './engineRuntimeAnimations';
import type { EngineSimulationSnapshot } from '../physics/EngineSimulationState';

export interface EngineGlbAnimatorConfig {
  engineType?: EngineType;
  cutawayEnabled?: boolean;
  explodedFactor?: number; // 0.0 to 1.0
  combustionVfxEnabled?: boolean;
}

interface BoundPiston {
  pistonNode: THREE.Object3D;
  ringPackNode: THREE.Object3D | null;
  cylinderIndex: number;
  initialLocalPos: THREE.Vector3;
  initialLocalRot: THREE.Quaternion;
  bankSide: 'left' | 'right';
  boreDirWorld: THREE.Vector3; // Unit vector along cylinder bore
  strokeOffsetDeg: number;
}

interface BoundConrod {
  rodNode: THREE.Object3D;
  capNode: THREE.Object3D | null;
  cylinderIndex: number;
  crankpinIndex: number;
  initialLocalPos: THREE.Vector3;
  initialLocalRot: THREE.Quaternion;
  bankSide: 'left' | 'right';
  rodLengthM: number;
}

interface BoundCamshaft {
  camNode: THREE.Object3D;
  lobeNodes: THREE.Object3D[];
  name: string;
  bank: 'intake' | 'exhaust';
  side: 'left' | 'right';
  centerAxis: THREE.Vector3;
  initialLocalRot: THREE.Quaternion;
}

interface BoundThrottle {
  butterflyNode: THREE.Object3D;
  spindleNode: THREE.Object3D | null;
  cylinderIndex: number;
  initialLocalRot: THREE.Quaternion;
}

interface BoundPulley {
  node: THREE.Object3D;
  ratio: number;
  initialRot: THREE.Euler;
}

interface BoundInjector {
  injectorNode: THREE.Object3D;
  cylinderIndex: number;
  sprayConeMesh: THREE.Mesh;
  sprayConeMat: THREE.MeshBasicMaterial;
  nozzleLed: THREE.Mesh;
  nozzleLedMat: THREE.MeshBasicMaterial;
}

interface BoundSprocket {
  node: THREE.Object3D;
  toothRingNode: THREE.Object3D | null;
  bank: 'intake' | 'exhaust';
}

export class EngineGlbAnimator {
  private rootModel: THREE.Object3D | null = null;
  private isGlbBound: boolean = false;

  // Bound Mechanical Nodes
  private crankshaftMainShaft: THREE.Object3D | null = null;
  private counterweightNodes: THREE.Object3D[] = [];
  private crankpinJournals: THREE.Object3D[] = [];
  private flywheelNode: THREE.Object3D | null = null;
  private starterRingGear: THREE.Object3D | null = null;
  private clutchDisc1: THREE.Object3D | null = null;
  private clutchDisc2: THREE.Object3D | null = null;
  private clutchDisc1InitPos: THREE.Vector3 = new THREE.Vector3();
  private clutchDisc2InitPos: THREE.Vector3 = new THREE.Vector3();
  private beltTensionerArm: THREE.Object3D | null = null;

  private pistons: BoundPiston[] = [];
  private conrods: BoundConrod[] = [];
  private camshafts: BoundCamshaft[] = [];
  private sprockets: BoundSprocket[] = [];
  private injectors: BoundInjector[] = [];
  private throttleButterflies: BoundThrottle[] = [];
  private throttleLinkageBar: THREE.Object3D | null = null;
  private pulleys: BoundPulley[] = [];
  private fanBlades: THREE.Object3D[] = [];

  // VFX Nodes (Created & Attached to Model)
  private vfxGroup: THREE.Group = new THREE.Group();
  private sparkLights: THREE.PointLight[] = [];
  private combustionSpheres: THREE.Mesh[] = [];
  private combustionMats: THREE.MeshBasicMaterial[] = [];
  private headerPipes: THREE.Mesh[] = [];

  // Cutaway (X-Ray) Caches
  private cutawayMeshes: { mesh: THREE.Mesh; originalMat: THREE.Material | THREE.Material[] }[] = [];
  private cutawayGlassMat: THREE.MeshPhysicalMaterial;
  private isCutawayActive: boolean = false;

  // Exploded View Subsystem Groups
  private explodedGroups: {
    node: THREE.Object3D;
    initialPos: THREE.Vector3;
    vector: THREE.Vector3;
  }[] = [];

  // Kinematics Configuration
  private crankRadiusM: number = 0.038; // 76mm stroke / 2
  private rodLengthM: number = 0.132;   // 132mm rod length
  private crankCenterY: number = 0.0;
  private crankCenterZ: number = 0.05;

  // Live Simulation States
  private latestSnapshot: EngineSimulationSnapshot | null = null;
  private cylinderCycleStates: CylinderCycleState[] = [];

  constructor() {
    this.vfxGroup.name = 'Engine_Combustion_VFX';

    // Premium Scratch-Resistant Quartz Glass for Cutaway X-Ray Mode
    this.cutawayGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xa5b4fc,
      metalness: 0.1,
      roughness: 0.12,
      transmission: 0.82,
      transparent: true,
      opacity: 0.38,
      ior: 1.52,
      reflectivity: 0.6,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
  }

  /**
   * Binds to the loaded Three.js GLB model hierarchy and caches all mechanical nodes.
   */
  public bindModel(model: THREE.Object3D): boolean {
    this.rootModel = model;
    this.pistons = [];
    this.conrods = [];
    this.camshafts = [];
    this.sprockets = [];
    this.injectors = [];
    this.throttleButterflies = [];
    this.pulleys = [];
    this.fanBlades = [];
    this.counterweightNodes = [];
    this.crankpinJournals = [];
    this.cutawayMeshes = [];
    this.explodedGroups = [];
    this.headerPipes = [];

    // Map all nodes by exact name for quick lookup
    const nodeMap = new Map<string, THREE.Object3D>();
    model.traverse((child) => {
      if (child.name) {
        nodeMap.set(child.name, child);
      }
    });

    // 1. Bind Crankshaft Main Shaft & Flywheel
    this.crankshaftMainShaft = nodeMap.get('Crankshaft_Main_Shaft') || null;
    this.flywheelNode = nodeMap.get('Flywheel_Mass') || null;

    // 2. Bind Counterweights (1 to 6) & Crankpin Journals (1 to 6)
    for (let i = 1; i <= 6; i++) {
      const cw = nodeMap.get(`Counterweight_Web_${i}`);
      if (cw) this.counterweightNodes.push(cw);

      const cj = nodeMap.get(`Crankpin_Journal_${i}`);
      if (cj) this.crankpinJournals.push(cj);
    }

    // 3. Bind 12 Pistons & Ring Packs
    // Odd = Left Bank (-30° around X, pointing -Y, +Z)
    // Even = Right Bank (+30° around X, pointing +Y, +Z)
    const sin30 = Math.sin((30 * Math.PI) / 180);
    const cos30 = Math.cos((30 * Math.PI) / 180);

    for (let i = 1; i <= 12; i++) {
      const pNode = nodeMap.get(`Forged_Piston_${i}`);
      const ringNode = nodeMap.get(`Piston_Ring_Pack_${i}`) || null;
      const isOdd = i % 2 === 1;
      const bankSide: 'left' | 'right' = isOdd ? 'left' : 'right';

      if (pNode) {
        const boreDir = isOdd
          ? new THREE.Vector3(0, -sin30, cos30).normalize()
          : new THREE.Vector3(0, +sin30, cos30).normalize();

        this.pistons.push({
          pistonNode: pNode,
          ringPackNode: ringNode,
          cylinderIndex: i - 1,
          initialLocalPos: pNode.position.clone(),
          initialLocalRot: pNode.quaternion.clone(),
          bankSide,
          boreDirWorld: boreDir,
          // Kinematic phase: cylinders sharing a crankpin move in lockstep.
          strokeOffsetDeg: getV12PistonPhaseDeg(i - 1),
        });
      }
    }

    // 4. Bind 12 Connecting Rods & Big-End Caps
    for (let i = 1; i <= 12; i++) {
      const rNode = nodeMap.get(`ConnectingRod_Beam_${i}`);
      const capNode = nodeMap.get(`Rod_BigEnd_Cap_${i}`) || null;
      const isOdd = i % 2 === 1;
      const crankpinIdx = getV12CrankpinIndex(i - 1); // 60° V12 shared-throw mapping

      if (rNode) {
        this.conrods.push({
          rodNode: rNode,
          capNode,
          cylinderIndex: i - 1,
          crankpinIndex: crankpinIdx,
          initialLocalPos: rNode.position.clone(),
          initialLocalRot: rNode.quaternion.clone(),
          bankSide: isOdd ? 'left' : 'right',
          rodLengthM: this.rodLengthM,
        });
      }
    }

    // 5. Bind Camshafts & Lobes
    const camDefs: { name: string; bank: 'intake' | 'exhaust'; side: 'left' | 'right'; center: [number, number, number] }[] = [
      { name: 'Camshaft_Intake_Right', bank: 'intake', side: 'right', center: [0, -0.2146, 0.33] },
      { name: 'Camshaft_Exhaust_Right', bank: 'exhaust', side: 'right', center: [0, -0.1454, 0.37] },
      { name: 'Camshaft_Intake_Left', bank: 'intake', side: 'left', center: [0, 0.1454, 0.37] },
      { name: 'Camshaft_Exhaust_Left', bank: 'exhaust', side: 'left', center: [0, 0.2146, 0.33] },
    ];

    for (const def of camDefs) {
      const camNode = nodeMap.get(def.name);
      if (camNode) {
        const lobes: THREE.Object3D[] = [];
        const prefix = `Cam_Lobe_${def.bank === 'intake' ? 'Intake' : 'Exhaust'}_${def.side === 'right' ? 'Right' : 'Left'}_`;
        for (let l = 1; l <= 12; l++) {
          const lobe = nodeMap.get(`${prefix}${l}`);
          if (lobe) lobes.push(lobe);
        }

        this.camshafts.push({
          camNode,
          lobeNodes: lobes,
          name: def.name,
          bank: def.bank,
          side: def.side,
          centerAxis: new THREE.Vector3(...def.center),
          initialLocalRot: camNode.quaternion.clone(),
        });
      }
    }

    // 6. Bind Throttle Butterflies (1 to 6 Left & Right)
    for (let i = 1; i <= 6; i++) {
      const bfLeft = nodeMap.get(`Butterfly_Plate_Left_${i}`);
      const spLeft = nodeMap.get(`Throttle_Spindle_Left_${i}`) || null;
      if (bfLeft) {
        this.throttleButterflies.push({
          butterflyNode: bfLeft,
          spindleNode: spLeft,
          cylinderIndex: (i - 1) * 2, // Left bank cylinders
          initialLocalRot: bfLeft.quaternion.clone(),
        });
      }

      const bfRight = nodeMap.get(`Butterfly_Plate_Right_${i}`);
      const spRight = nodeMap.get(`Throttle_Spindle_Right_${i}`) || null;
      if (bfRight) {
        this.throttleButterflies.push({
          butterflyNode: bfRight,
          spindleNode: spRight,
          cylinderIndex: (i - 1) * 2 + 1, // Right bank cylinders
          initialLocalRot: bfRight.quaternion.clone(),
        });
      }
    }
    this.throttleLinkageBar = nodeMap.get('ITB_Throttle_Linkage_Bar') || null;

    // 7. Bind Front Accessory Pulleys & Cooling Fan
    const pulleyDefs: { name: string; ratio: number }[] = [
      { name: 'Crank_Nose_Damper_Pulley', ratio: 1.0 },
      { name: 'Alternator_Clutch_Pulley', ratio: 2.2 },
      { name: 'Tensioner_Idler_Pulley', ratio: 1.35 },
      { name: 'Fixed_Idler_Pulley', ratio: 1.35 },
    ];
    for (const p of pulleyDefs) {
      const pNode = nodeMap.get(p.name);
      if (pNode) {
        this.pulleys.push({ node: pNode, ratio: p.ratio, initialRot: pNode.rotation.clone() });
      }
    }

    for (let f = 1; f <= 7; f++) {
      const fan = nodeMap.get(`Cooling_Fan_Blade_Assembly_${f}`);
      if (fan) this.fanBlades.push(fan);
    }

    // 8. Bind Starter Ring Gear, Clutch Discs & Belt Tensioner
    this.starterRingGear = nodeMap.get('Starter_Ring_Gear') || null;
    this.clutchDisc1 = nodeMap.get('TwinPlate_Clutch_Disc_1') || null;
    if (this.clutchDisc1) this.clutchDisc1InitPos.copy(this.clutchDisc1.position);
    this.clutchDisc2 = nodeMap.get('TwinPlate_Clutch_Disc_2') || null;
    if (this.clutchDisc2) this.clutchDisc2InitPos.copy(this.clutchDisc2.position);
    this.beltTensionerArm = nodeMap.get('Belt_Tensioner_Arm') || null;

    // 9. Bind Timing Sprockets (Intake & Exhaust, Left & Right Banks)
    const sprocketDefs: { sp: string; ring: string; bank: 'intake' | 'exhaust' }[] = [
      { sp: 'Timing_Sprocket_Intake_Right', ring: 'Sprocket_ToothRing_Intake_Right', bank: 'intake' },
      { sp: 'Timing_Sprocket_Exhaust_Right', ring: 'Sprocket_ToothRing_Exhaust_Right', bank: 'exhaust' },
      { sp: 'Timing_Sprocket_Intake_Left', ring: 'Sprocket_ToothRing_Intake_Left', bank: 'intake' },
      { sp: 'Timing_Sprocket_Exhaust_Left', ring: 'Sprocket_ToothRing_Exhaust_Left', bank: 'exhaust' },
    ];
    for (const def of sprocketDefs) {
      const spNode = nodeMap.get(def.sp);
      const ringNode = nodeMap.get(def.ring) || null;
      if (spNode) {
        this.sprockets.push({
          node: spNode,
          toothRingNode: ringNode,
          bank: def.bank,
        });
      }
    }

    // 10. Bind 12 Direct Fuel Injectors & Attach Atomized Spray Cones
    const coneGeo = new THREE.ConeGeometry(0.016, 0.05, 10, 1, true);
    coneGeo.rotateX(Math.PI);
    coneGeo.translate(0, -0.025, 0);
    const ledGeo = new THREE.SphereGeometry(0.003, 8, 8);

    for (let i = 1; i <= 6; i++) {
      // Left bank injectors -> Cylinders 1, 3, 5, 7, 9, 11 (0-indexed: 0, 2, 4, 6, 8, 10)
      const leftInj = nodeMap.get(`GDI_Fuel_Injector_Left_${i}`);
      if (leftInj) {
        const sprayMat = new THREE.MeshBasicMaterial({
          color: 0xa5f3fc,
          transparent: true,
          opacity: 0.0,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const sprayCone = new THREE.Mesh(coneGeo, sprayMat);
        sprayCone.position.set(0, -0.015, 0);
        leftInj.add(sprayCone);

        const ledMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.0,
        });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0, -0.002, 0);
        leftInj.add(led);

        this.injectors.push({
          injectorNode: leftInj,
          cylinderIndex: (i - 1) * 2,
          sprayConeMesh: sprayCone,
          sprayConeMat: sprayMat,
          nozzleLed: led,
          nozzleLedMat: ledMat,
        });
      }

      // Right bank injectors -> Cylinders 2, 4, 6, 8, 10, 12 (0-indexed: 1, 3, 5, 7, 9, 11)
      const rightInj = nodeMap.get(`GDI_Fuel_Injector_Right_${i}`);
      if (rightInj) {
        const sprayMat = new THREE.MeshBasicMaterial({
          color: 0xa5f3fc,
          transparent: true,
          opacity: 0.0,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const sprayCone = new THREE.Mesh(coneGeo, sprayMat);
        sprayCone.position.set(0, -0.015, 0);
        rightInj.add(sprayCone);

        const ledMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.0,
        });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0, -0.002, 0);
        rightInj.add(led);

        this.injectors.push({
          injectorNode: rightInj,
          cylinderIndex: (i - 1) * 2 + 1,
          sprayConeMesh: sprayCone,
          sprayConeMat: sprayMat,
          nozzleLed: led,
          nozzleLedMat: ledMat,
        });
      }
    }

    // 11. Bind Header Primary Pipes for Exhaust Wave Glow
    for (let h = 1; h <= 6; h++) {
      const pipe = nodeMap.get(`Header_Primary_Pipe_${h}`) as THREE.Mesh;
      if (pipe && pipe.isMesh) {
        this.headerPipes.push(pipe);
      }
    }

    // 9. Collect Meshes for Cutaway (X-Ray) Mode
    const cutawayNames = [
      '01_Block_Casting_Crankcase',
      'Cylinder_Head_Right',
      'Cylinder_Head_Left',
      'Valve_Cover_Right',
      'Valve_Cover_Left',
    ];
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        for (const name of cutawayNames) {
          if (mesh.name.includes(name) || (mesh.parent && mesh.parent.name.includes(name))) {
            this.cutawayMeshes.push({
              mesh,
              originalMat: Array.isArray(mesh.material) ? [...mesh.material] : mesh.material,
            });
            break;
          }
        }
      }
    });

    // 10. Configure Exploded View Groups
    const explodeDefs: { name: string; vec: [number, number, number] }[] = [
      { name: '04_Cylinder_Heads_Valvetrain', vec: [0, 0, 0.22] },
      { name: '05_Anodized_Valve_Covers', vec: [0, 0, 0.38] },
      { name: '06_ITB_Intake_Velocity_Stacks', vec: [0, 0, 0.45] },
      { name: '07_Titanium_Blued_Exhaust_Headers', vec: [0, 0.32, -0.15] },
      { name: '08_Front_Radiator_Cooling', vec: [-0.45, 0, 0] },
      { name: '09_7Speed_Sequential_Transaxle', vec: [0.55, 0, 0] },
      { name: '11_Front_Accessory_Drive', vec: [-0.35, 0, 0] },
      { name: '12_Ignition_Wiring_Harness', vec: [0, 0, 0.52] },
    ];

    for (const exp of explodeDefs) {
      const grp = nodeMap.get(exp.name);
      if (grp) {
        this.explodedGroups.push({
          node: grp,
          initialPos: grp.position.clone(),
          vector: new THREE.Vector3(...exp.vec),
        });
      }
    }

    // 11. Setup Combustion & Spark VFX Layer
    this.setupCombustionVfx(model);

    this.isGlbBound = true;
    return true;
  }

  /**
   * Initializes real-time combustion chamber fire glow spheres and spark flash lights.
   */
  private setupCombustionVfx(model: THREE.Object3D): void {
    // Clean old VFX if any
    while (this.vfxGroup.children.length > 0) {
      this.vfxGroup.remove(this.vfxGroup.children[0]);
    }
    this.sparkLights = [];
    this.combustionSpheres = [];
    this.combustionMats = [];

    // Create 12 combustion glow kernels positioned in each cylinder head dome
    const sphereGeo = new THREE.SphereGeometry(0.024, 12, 12);

    for (let i = 0; i < 12; i++) {
      const isOdd = i % 2 === 0; // 0-indexed: 0, 2, 4 = Cyl 1, 3, 5
      const throwIdx = Math.floor(i / 2);
      const x = -0.27 + throwIdx * 0.108;
      const y = isOdd ? -0.105 : 0.105;
      const z = 0.22;

      // Emissive combustion fireball mesh
      const mat = new THREE.MeshBasicMaterial({
        color: 0xff3b00,
        transparent: true,
        opacity: 0.0,
      });
      const sphere = new THREE.Mesh(sphereGeo, mat);
      sphere.position.set(x, y, z);
      sphere.scale.set(0.1, 0.1, 0.1);
      sphere.name = `Combustion_Kernel_Cyl_${i + 1}`;

      this.combustionMats.push(mat);
      this.combustionSpheres.push(sphere);
      this.vfxGroup.add(sphere);

      // High-intensity point light for ignition spark flash
      const sparkLight = new THREE.PointLight(0xffffff, 0, 0.25);
      sparkLight.position.set(x, y, z + 0.015);
      sparkLight.name = `Spark_Light_Cyl_${i + 1}`;
      this.sparkLights.push(sparkLight);
      this.vfxGroup.add(sparkLight);
    }

    model.add(this.vfxGroup);
  }

  /**
   * Main Frame Tick: Updates all mechanical transforms, 4-stroke cycle, and VFX.
   */
  public update(snapshot: EngineSimulationSnapshot): void {
    this.latestSnapshot = snapshot;
    if (!this.isGlbBound || !this.rootModel) return;

    const crankAngleDeg = snapshot.crankAngleDeg;
    const crankAngleRad = (crankAngleDeg * Math.PI) / 180;
    const rpm = snapshot.rpm;
    const throttle = snapshot.throttle;
    const isEngineRunning = snapshot.state !== 'OFF';

    // ── 1. Crankshaft Main Shaft Rotation ──
    // Rotating around X axis through (Y=0, Z=0.05)
    if (this.crankshaftMainShaft) {
      this.crankshaftMainShaft.rotation.x = crankAngleRad;
    }

    // ── 2. Flywheel Rotation ──
    if (this.flywheelNode) {
      this.flywheelNode.rotation.x = crankAngleRad;
    }

    // ── 3. Counterweights Rotation ──
    for (let i = 0; i < this.counterweightNodes.length; i++) {
      this.counterweightNodes[i].rotation.x = crankAngleRad;
    }

    // ── 4. Crankpin Journals Orbit ──
    // Orbiting at radius R = 0.038m in YZ plane around (0, 0.05)
    // Throws 1, 3, 5 are in phase; Throws 2, 4, 6 are 180° opposite
    for (let i = 0; i < this.crankpinJournals.length; i++) {
      const throwAngle = crankAngleRad + (V12_PIN_PHASE_DEG[i] ?? 0) * (Math.PI / 180);
      const journalY = -this.crankRadiusM * Math.sin(throwAngle);
      const journalZ = this.crankCenterZ + this.crankRadiusM * Math.cos(throwAngle);

      this.crankpinJournals[i].position.y = journalY;
      this.crankpinJournals[i].position.z = journalZ;
      this.crankpinJournals[i].rotation.x = crankAngleRad;
    }

    // ── 5. 12 Pistons & Ring Packs — Exact Slider-Crank Motion ──
    this.cylinderCycleStates = [];

    for (let i = 0; i < this.pistons.length; i++) {
      const p = this.pistons[i];
      const cycleState = solveCylinderCycle(
        p.cylinderIndex,
        crankAngleDeg,
        V12_FIRING_ORDER_DEGREES[p.cylinderIndex] ?? 0,
        PISTON_CONFIGS.V12,
        undefined,
        p.strokeOffsetDeg
      );
      this.cylinderCycleStates.push(cycleState);

      // Slider-crank displacement (0 at TDC, -0.076m at BDC)
      const dispM = cycleState.pistonDisplacementMm / 1000.0;

      // Move piston along its bore vector
      const targetPos = p.initialLocalPos.clone().addScaledVector(p.boreDirWorld, dispM);
      p.pistonNode.position.copy(targetPos);

      if (p.ringPackNode) {
        p.ringPackNode.position.copy(targetPos);
      }
    }

    // ── 6. 12 Connecting Rods & Big-End Caps ──
    for (let i = 0; i < this.conrods.length; i++) {
      const rod = this.conrods[i];
      const throwAngle = crankAngleRad + (V12_PIN_PHASE_DEG[rod.crankpinIndex] ?? 0) * (Math.PI / 180);

      // Crankpin journal position (Big-end connection)
      const pinY = -this.crankRadiusM * Math.sin(throwAngle);
      const pinZ = this.crankCenterZ + this.crankRadiusM * Math.cos(throwAngle);

      // Corresponding piston wrist pin position (Small-end connection)
      const matchingPiston = this.pistons[rod.cylinderIndex];
      const wristPinPos = matchingPiston
        ? matchingPiston.pistonNode.position
        : rod.initialLocalPos;

      // Position rod base at crankpin journal
      rod.rodNode.position.y = (pinY + wristPinPos.y) * 0.5;
      rod.rodNode.position.z = (pinZ + wristPinPos.z) * 0.5;

      // Calculate rod tilt angle β in YZ plane
      const dy = wristPinPos.y - pinY;
      const dz = wristPinPos.z - pinZ;
      const rodAngle = Math.atan2(dy, dz);
      rod.rodNode.rotation.x = rodAngle;

      if (rod.capNode) {
        rod.capNode.position.y = pinY;
        rod.capNode.position.z = pinZ;
        rod.capNode.rotation.x = rodAngle;
      }
    }

    // ── 7. Camshafts & Lobes & Timing Sprockets at Half Crankshaft Speed (ω/2) ──
    const camAngleRad = crankAngleRad * 0.5;
    for (let i = 0; i < this.camshafts.length; i++) {
      const cam = this.camshafts[i];
      const phaseOffset = cam.bank === 'exhaust' ? Math.PI : 0;
      cam.camNode.rotation.x = camAngleRad + phaseOffset;

      for (let l = 0; l < cam.lobeNodes.length; l++) {
        cam.lobeNodes[l].rotation.x = camAngleRad + phaseOffset + (l * Math.PI) / 6;
      }
    }

    // Cam drive sprockets & tooth rings (half-speed)
    for (let i = 0; i < this.sprockets.length; i++) {
      const sp = this.sprockets[i];
      const phaseOffset = sp.bank === 'exhaust' ? Math.PI : 0;
      sp.node.rotation.x = camAngleRad + phaseOffset;
      if (sp.toothRingNode) {
        sp.toothRingNode.rotation.x = camAngleRad + phaseOffset;
      }
    }

    // ── 8. Throttle Butterflies & Spindles ──
    // Rotates with throttle input: 0° (closed idle) to 82° (WOT)
    const butterflyOpenRad = (throttle * 82.0 * Math.PI) / 180.0;
    for (let i = 0; i < this.throttleButterflies.length; i++) {
      const tb = this.throttleButterflies[i];
      tb.butterflyNode.rotation.y = butterflyOpenRad;
      if (tb.spindleNode) {
        tb.spindleNode.rotation.y = butterflyOpenRad;
      }
    }
    if (this.throttleLinkageBar) {
      this.throttleLinkageBar.position.x = throttle * 0.008;
    }

    // ── 9. Front Accessory Pulleys & Fan Blades & Dual-Plate Clutch ──
    for (let i = 0; i < this.pulleys.length; i++) {
      const p = this.pulleys[i];
      p.node.rotation.x = crankAngleRad * p.ratio;
    }
    for (let f = 0; f < this.fanBlades.length; f++) {
      this.fanBlades[f].rotation.x = crankAngleRad * 0.85;
    }

    // Serpentine belt dynamic tensioner arm micro-vibration
    if (this.beltTensionerArm) {
      this.beltTensionerArm.rotation.x = Math.sin(crankAngleRad * 3.0) * 0.02 * (throttle + 0.15);
    }

    // Starter ring gear spins with flywheel
    if (this.starterRingGear) {
      this.starterRingGear.rotation.x = crankAngleRad;
    }

    // Twin-plate clutch discs with shift disengagement & slip
    if (this.clutchDisc1 && this.clutchDisc2) {
      if (snapshot.isShifting) {
        // Disengaged clutch: slight axial clearance separation and dog-ring slip
        this.clutchDisc1.position.x = this.clutchDisc1InitPos.x - 0.003;
        this.clutchDisc2.position.x = this.clutchDisc2InitPos.x - 0.005;
        this.clutchDisc1.rotation.x = crankAngleRad * 0.92;
        this.clutchDisc2.rotation.x = crankAngleRad * 0.92;
      } else {
        // Engaged clutch: solidly locked to flywheel
        this.clutchDisc1.position.copy(this.clutchDisc1InitPos);
        this.clutchDisc2.position.copy(this.clutchDisc2InitPos);
        this.clutchDisc1.rotation.x = crankAngleRad;
        this.clutchDisc2.rotation.x = crankAngleRad;
      }
    }

    // ── 10. Combustion & Spark Ignition VFX ──
    if (isEngineRunning) {
      for (let i = 0; i < this.cylinderCycleStates.length && i < 12; i++) {
        const state = this.cylinderCycleStates[i];
        const sparkLight = this.sparkLights[i];
        const sphereMesh = this.combustionSpheres[i];
        const sphereMat = this.combustionMats[i];

        if (sparkLight && sphereMesh && sphereMat) {
          // Spark Plug Flash: intense burst at TDC ignition point
          if (state.isSparkFiring) {
            sparkLight.intensity = 2.8;
            sparkLight.color.setHex(0xffffff); // Brilliant electric white
            sphereMat.color.setHex(0xffffff);
            sphereMat.opacity = 0.95;
            sphereMesh.scale.setScalar(1.2);
          }
          // Power Stroke: fireball expanding down cylinder
          else if (state.phase === 'POWER') {
            sparkLight.intensity = state.combustionIntensity * 1.5;
            sparkLight.color.setHex(0xff4400); // Fiery orange
            sphereMat.color.setHex(parseInt(state.glowColorHex.replace('#', '0x'), 16));
            sphereMat.opacity = state.combustionIntensity * 0.85;
            const expansion = 0.4 + (1.0 - state.pistonNormalized01) * 1.4;
            sphereMesh.scale.set(expansion, expansion, expansion * 1.2);
          }
          // Intake & Compression & Exhaust
          else {
            sparkLight.intensity = 0;
            sphereMat.color.setHex(parseInt(state.glowColorHex.replace('#', '0x'), 16));
            sphereMat.opacity = state.combustionIntensity * 0.35;
            sphereMesh.scale.setScalar(0.5);
          }
        }
      }

      // Exhaust Header Thermal Pulse
      for (let h = 0; h < this.headerPipes.length; h++) {
        const pipe = this.headerPipes[h];
        const mat = pipe.material as THREE.MeshStandardMaterial;
        if (mat && mat.emissive) {
          const isOverrun = snapshot.state === 'ENGINE_BRAKING' || snapshot.state === 'REV_LIMITER';
          const headerIntensity = Math.min(1.0, (rpm / 8500) * 0.8 + (isOverrun ? 0.35 : 0.0));
          mat.emissive.setRGB(headerIntensity * 0.95, headerIntensity * 0.28, 0.04);
          mat.emissiveIntensity = headerIntensity * 2.2;
        }
      }
    } else {
      // Engine OFF: extinguish lights
      for (let i = 0; i < this.sparkLights.length; i++) {
        this.sparkLights[i].intensity = 0;
        this.combustionMats[i].opacity = 0;
      }
    }

    // ── 11. Direct Fuel Injector Mist Pulses ──
    if (isEngineRunning) {
      for (let i = 0; i < this.injectors.length; i++) {
        const inj = this.injectors[i];
        const state = this.cylinderCycleStates[inj.cylinderIndex];
        if (!state) continue;

        // Fresh intake charge injection pulse: active between 15° and 135° of 720° cycle
        const cycleAngle = state.cycleAngleDeg;
        const isInjecting = cycleAngle >= 15 && cycleAngle <= 135;

        if (isInjecting) {
          // Bell-curve atomized pulse intensity
          const normTime = (cycleAngle - 15) / 120;
          const pulseShape = Math.sin(normTime * Math.PI);
          const mistAlpha = (0.35 + throttle * 0.55) * pulseShape;

          inj.sprayConeMat.opacity = mistAlpha;
          inj.nozzleLedMat.opacity = Math.min(1.0, mistAlpha * 1.6);

          const sprayScale = 0.85 + pulseShape * 0.65 + throttle * 0.35;
          inj.sprayConeMesh.scale.set(sprayScale, sprayScale * 1.25, sprayScale);
        } else {
          inj.sprayConeMat.opacity = 0;
          inj.nozzleLedMat.opacity = 0;
        }
      }
    } else {
      for (let i = 0; i < this.injectors.length; i++) {
        this.injectors[i].sprayConeMat.opacity = 0;
        this.injectors[i].nozzleLedMat.opacity = 0;
      }
    }
  }

  /**
   * Toggles Cylinder Cutaway (X-Ray) Mode:
   * Replaces engine block and valve covers with crystal quartz glass to reveal internal moving parts.
   */
  public setCutawayMode(enabled: boolean): void {
    if (this.isCutawayActive === enabled) return;
    this.isCutawayActive = enabled;

    for (let i = 0; i < this.cutawayMeshes.length; i++) {
      const entry = this.cutawayMeshes[i];
      if (enabled) {
        entry.mesh.material = this.cutawayGlassMat;
      } else {
        entry.mesh.material = entry.originalMat;
      }
    }
  }

  public getIsCutawayActive(): boolean {
    return this.isCutawayActive;
  }

  /**
   * Sets Exploded View Factor (0.0 to 1.0) while preserving synchronized reciprocation.
   */
  public setExplodedFactor(factor: number): void {
    const f = Math.max(0, Math.min(1, factor));
    for (let i = 0; i < this.explodedGroups.length; i++) {
      const entry = this.explodedGroups[i];
      entry.node.position.copy(entry.initialPos).addScaledVector(entry.vector, f);
    }
  }

  public getCylinderCycleStates(): CylinderCycleState[] {
    return this.cylinderCycleStates;
  }

  public dispose(): void {
    if (this.cutawayGlassMat) this.cutawayGlassMat.dispose();
    for (const m of this.combustionMats) m.dispose();
    for (const inj of this.injectors) {
      inj.sprayConeMat.dispose();
      inj.nozzleLedMat.dispose();
    }
  }
}
