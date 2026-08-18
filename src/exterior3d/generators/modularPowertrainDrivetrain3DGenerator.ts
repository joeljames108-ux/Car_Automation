// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — POWERTRAIN & DRIVELINE 3D GENERATOR
// ============================================================================
// Generates ultra-high-fidelity 3D powertrain and drivetrain models matching the
// V12 master standard across all 14 engine layouts:
// - Inline Engines: I3, I4, I6 Turbo / Twin-Cam with DOHC, ITBs, and serpentine drive
// - Vee Engines: V6, V8, V10, V12 with twin turbos, velocity stacks, and tuned headers
// - W-Engines: W12, W16, W18 Quad-Turbo with dual charge coolers and quad exhausts
// - Boxer Engines: Boxer-4, Boxer-6 horizontally opposed with top-mount intercooler
// - Rotary Engine: Twin-Rotor Wankel with epitrochoid housings and eccentric shaft
// - Electrified: Dual Axial-Flux Motor with SiC Inverter and high-voltage orange cables
// ============================================================================

import * as THREE from 'three';
import { MaterialGrade } from '../../sim/assemblyTypes';
import { EngineLayout, EngineConfig } from '../../sim/types';

export class ModularPowertrainDrivetrain3DGenerator {
  public static buildPowertrainDrivetrain(
    wheelbaseMm: number,
    materialGrade: MaterialGrade = 'forged',
    layout: 'front_engine' | 'mid_engine' | 'rear_engine' = 'front_engine',
    engineLayout: EngineLayout = 'v8',
    engineConfig?: Partial<EngineConfig>
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = `PowertrainDrivetrain_${engineLayout}`;

    const wbM = wheelbaseMm / 1000;
    const frontAxleX = 0.45;
    const rearAxleX = frontAxleX - wbM;

    // ── 1. Luxury PBR Metallurgy Materials ──
    const castAluminumMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Sand-cast aluminum block alloy
      metalness: 0.88,
      roughness: 0.28,
    });

    const billetMachinedMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // CNC Milled Billet Aluminum
      metalness: 0.94,
      roughness: 0.16,
    });

    const carbonCompositeMat = new THREE.MeshStandardMaterial({
      color: 0x090d16, // Dry carbon fiber intake plenum
      metalness: 0.90,
      roughness: 0.22,
    });

    const goldAnodizedMat = new THREE.MeshPhysicalMaterial({
      color: 0xd97706, // Gold / Bronze anodized valve covers
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.85,
    });

    const crimsonValveCoverMat = new THREE.MeshPhysicalMaterial({
      color: 0xdc2626, // Racing Red wrinkle-finish valve covers
      metalness: 0.75,
      roughness: 0.35,
      clearcoat: 0.6,
    });

    const inconelExhaustMat = new THREE.MeshPhysicalMaterial({
      color: 0xb45309, // Heat-treated Inconel & Titanium exhaust
      metalness: 0.96,
      roughness: 0.14,
      clearcoat: 0.7,
    });

    const transmissionMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Magnesium transaxle casing
      metalness: 0.84,
      roughness: 0.30,
    });

    const driveshaftMat = new THREE.MeshStandardMaterial({
      color: 0x09090b, // Carbon fiber driveshaft tube
      metalness: 0.88,
      roughness: 0.20,
    });

    const hvOrangeCableMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Shielded High-Voltage Orange Cable
      roughness: 0.5,
      metalness: 0.1,
    });

    const copperBusbarMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Solid Copper Busbar
      metalness: 0.95,
      roughness: 0.15,
    });

    const pulleyRubberMat = new THREE.MeshStandardMaterial({
      color: 0x111827, // Serpentine Belt
      roughness: 0.9,
      metalness: 0.05,
    });

    // ── 2. Engine Placement Along Vehicle Longitudinal Datum ──
    const engineX = layout === 'front_engine'
      ? frontAxleX - 0.05
      : layout === 'mid_engine'
      ? rearAxleX + wbM * 0.45
      : rearAxleX - 0.15;

    // ── 3. Route to Dedicated Bespoke Engine CAD Generator ──
    const isElectric = engineLayout === 'electric' || engineLayout === 'hybrid';
    const isTurbo = engineConfig?.intake ? engineConfig.intake.includes('turbo') : true;

    let engineMesh: THREE.Group;
    switch (engineLayout) {
      case 'i3':
        engineMesh = this.createInlineEngine(3, castAluminumMat, billetMachinedMat, carbonCompositeMat, inconelExhaustMat, pulleyRubberMat, isTurbo);
        break;
      case 'i4':
        engineMesh = this.createInlineEngine(4, castAluminumMat, billetMachinedMat, carbonCompositeMat, inconelExhaustMat, pulleyRubberMat, isTurbo);
        break;
      case 'i6':
        engineMesh = this.createInlineEngine(6, castAluminumMat, billetMachinedMat, carbonCompositeMat, inconelExhaustMat, pulleyRubberMat, isTurbo);
        break;
      case 'v6':
        engineMesh = this.createVeeEngine(6, castAluminumMat, goldAnodizedMat, carbonCompositeMat, inconelExhaustMat, pulleyRubberMat, isTurbo);
        break;
      case 'v8':
        engineMesh = this.createVeeEngine(8, castAluminumMat, crimsonValveCoverMat, carbonCompositeMat, inconelExhaustMat, pulleyRubberMat, isTurbo);
        break;
      case 'v10':
        engineMesh = this.createVeeEngine(10, castAluminumMat, crimsonValveCoverMat, carbonCompositeMat, inconelExhaustMat, pulleyRubberMat, isTurbo);
        break;
      case 'v12':
        engineMesh = this.createVeeEngine(12, castAluminumMat, goldAnodizedMat, carbonCompositeMat, inconelExhaustMat, pulleyRubberMat, isTurbo);
        break;
      case 'w12':
        engineMesh = this.createWEngine(12, castAluminumMat, billetMachinedMat, carbonCompositeMat, inconelExhaustMat, pulleyRubberMat);
        break;
      case 'w16':
      case 'w18':
        engineMesh = this.createWEngine(16, castAluminumMat, billetMachinedMat, carbonCompositeMat, inconelExhaustMat, pulleyRubberMat);
        break;
      case 'boxer4':
        engineMesh = this.createBoxerEngine(4, castAluminumMat, goldAnodizedMat, carbonCompositeMat, inconelExhaustMat, pulleyRubberMat, isTurbo);
        break;
      case 'boxer6':
        engineMesh = this.createBoxerEngine(6, castAluminumMat, crimsonValveCoverMat, carbonCompositeMat, inconelExhaustMat, pulleyRubberMat, isTurbo);
        break;
      case 'rotary':
        engineMesh = this.createRotaryWankelEngine(castAluminumMat, billetMachinedMat, carbonCompositeMat, inconelExhaustMat, pulleyRubberMat);
        break;
      case 'electric':
      case 'hybrid':
        engineMesh = this.createElectricAxialFluxMotor(castAluminumMat, billetMachinedMat, hvOrangeCableMat, copperBusbarMat);
        break;
      default:
        engineMesh = this.createVeeEngine(8, castAluminumMat, crimsonValveCoverMat, carbonCompositeMat, inconelExhaustMat, pulleyRubberMat, isTurbo);
        break;
    }

    engineMesh.position.set(engineX, 0.36, 0);
    group.add(engineMesh);

    // ── 4. High-Performance Dual-Clutch / Sequential / Manual / EV Transmission ──
    const transX = engineX - 0.38;
    const trans = this.createTransmission(transmissionMat, billetMachinedMat, inconelExhaustMat, goldAnodizedMat, isElectric);
    trans.position.set(transX, 0.32, 0);
    group.add(trans);

    // ── 5. Carbon Fiber Driveshaft ──
    if (layout === 'front_engine') {
      const shaftLength = Math.max(0.25, Math.abs(transX - rearAxleX) - 0.2);
      const shaftGeo = new THREE.CylinderGeometry(0.032, 0.032, shaftLength, 16);
      shaftGeo.rotateZ(Math.PI / 2);

      const shaft = new THREE.Mesh(shaftGeo, driveshaftMat);
      shaft.position.set((transX + rearAxleX) / 2, 0.26, 0);
      group.add(shaft);
    }

    // ── 6. Rear Electronic Limited-Slip Differential (e-LSD) ──
    const diff = this.createRearDifferential(transmissionMat, driveshaftMat);
    diff.position.set(rearAxleX, 0.25, 0);
    group.add(diff);

    return group;
  }

  // ==========================================================================
  // 1. INLINE ENGINES (I3, I4, I6)
  // ==========================================================================
  private static createInlineEngine(
    cylinders: 3 | 4 | 6,
    blockMat: THREE.Material,
    headMat: THREE.Material,
    intakeMat: THREE.Material,
    exhaustMat: THREE.Material,
    pulleyMat: THREE.Material,
    isTurbo: boolean
  ): THREE.Group {
    const engine = new THREE.Group();
    engine.name = `Inline${cylinders}_Engine`;

    const length = cylinders === 3 ? 0.34 : cylinders === 4 ? 0.44 : 0.64;
    const borePitch = length / (cylinders + 0.5);

    // 1. Engine Block Crankcase
    const blockGeo = new THREE.BoxGeometry(length, 0.22, 0.24);
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.position.set(0, 0, 0);
    engine.add(block);

    // 2. DOHC Cylinder Head & Valve Cover
    const headGeo = new THREE.BoxGeometry(length * 0.98, 0.12, 0.22);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.17, 0);
    engine.add(head);

    // Individual Coil-on-Plug Units
    const coilGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.04, 12);
    for (let i = 0; i < cylinders; i++) {
      const cX = -length / 2 + (i + 0.75) * borePitch;
      const coil = new THREE.Mesh(coilGeo, intakeMat);
      coil.position.set(cX, 0.24, 0);
      engine.add(coil);
    }

    // 3. Side-Mounted Composite Intake Manifold (Port Side, -Z)
    const runnerGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.12, 12);
    runnerGeo.rotateX(Math.PI / 2);
    for (let i = 0; i < cylinders; i++) {
      const cX = -length / 2 + (i + 0.75) * borePitch;
      const runner = new THREE.Mesh(runnerGeo, intakeMat);
      runner.position.set(cX, 0.15, -0.16);
      engine.add(runner);
    }

    const plenumGeo = new THREE.CylinderGeometry(0.045, 0.045, length * 0.9, 16);
    plenumGeo.rotateZ(Math.PI / 2);
    const plenum = new THREE.Mesh(plenumGeo, intakeMat);
    plenum.position.set(0, 0.15, -0.22);
    engine.add(plenum);

    // 4. Stainless Steel Turbo Exhaust Manifold (Starboard Side, +Z)
    const exhaustRunnerGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.12, 12);
    exhaustRunnerGeo.rotateX(Math.PI / 2);
    for (let i = 0; i < cylinders; i++) {
      const cX = -length / 2 + (i + 0.75) * borePitch;
      const exRunner = new THREE.Mesh(exhaustRunnerGeo, exhaustMat);
      exRunner.position.set(cX, 0.12, 0.16);
      engine.add(exRunner);
    }

    if (isTurbo) {
      const turboGeo = new THREE.TorusGeometry(0.065, 0.026, 12, 24);
      const turbo = new THREE.Mesh(turboGeo, exhaustMat);
      turbo.position.set(0.06, 0.10, 0.24);
      turbo.rotation.y = Math.PI / 2;
      engine.add(turbo);
    }

    // 5. Front Accessory Drive (Serpentine Belt & Pulleys)
    this.addFrontAccessoryDrive(engine, length / 2 + 0.02, pulleyMat, headMat);

    return engine;
  }

  // ==========================================================================
  // 2. VEE ENGINES (V6, V8, V10, V12)
  // ==========================================================================
  private static createVeeEngine(
    cylinders: 6 | 8 | 10 | 12,
    blockMat: THREE.Material,
    headMat: THREE.Material,
    intakeMat: THREE.Material,
    exhaustMat: THREE.Material,
    pulleyMat: THREE.Material,
    isTurbo: boolean
  ): THREE.Group {
    const engine = new THREE.Group();
    engine.name = `V${cylinders}_Engine`;

    const cylPerBank = cylinders / 2;
    const length = cylPerBank === 3 ? 0.42 : cylPerBank === 4 ? 0.52 : cylPerBank === 5 ? 0.62 : 0.72;
    const bankAngle = cylinders === 12 ? Math.PI / 6 : Math.PI / 4; // 60° for V12, 90° for V8

    // 1. Lower Crankcase & Oil Sump Bedplate
    const crankcaseGeo = new THREE.BoxGeometry(length, 0.18, 0.32);
    const crankcase = new THREE.Mesh(crankcaseGeo, blockMat);
    engine.add(crankcase);

    // 2. Left & Right V-Cylinder Banks
    const bankGeo = new THREE.BoxGeometry(length * 0.94, 0.22, 0.18);
    const leftBank = new THREE.Mesh(bankGeo, blockMat);
    leftBank.position.set(0, 0.14, -0.14);
    leftBank.rotation.x = -bankAngle;

    const rightBank = new THREE.Mesh(bankGeo, blockMat);
    rightBank.position.set(0, 0.14, 0.14);
    rightBank.rotation.x = bankAngle;
    engine.add(leftBank, rightBank);

    // Anodized / Wrinkle-Finish Cam Covers
    const coverGeo = new THREE.BoxGeometry(length * 0.92, 0.08, 0.16);
    const leftCover = new THREE.Mesh(coverGeo, headMat);
    leftCover.position.set(0, 0.26, -0.18);
    leftCover.rotation.x = -bankAngle;

    const rightCover = new THREE.Mesh(coverGeo, headMat);
    rightCover.position.set(0, 0.26, 0.18);
    rightCover.rotation.x = bankAngle;
    engine.add(leftCover, rightCover);

    // 3. Central Valley Intake: Carbon Velocity Stacks or Twin Plenums
    const stackGeo = new THREE.CylinderGeometry(0.024, 0.016, 0.08, 16);
    for (let b = 0; b < cylPerBank; b++) {
      const cX = -length / 2 + (b + 0.75) * (length / cylPerBank);

      const stackL = new THREE.Mesh(stackGeo, intakeMat);
      stackL.position.set(cX, 0.32, -0.06);
      stackL.rotation.z = 0.08;

      const stackR = new THREE.Mesh(stackGeo, intakeMat);
      stackR.position.set(cX, 0.32, 0.06);
      stackR.rotation.z = -0.08;

      engine.add(stackL, stackR);
    }

    // Top Airbox / Plenum
    const plenumGeo = new THREE.BoxGeometry(length * 0.88, 0.06, 0.20);
    const plenum = new THREE.Mesh(plenumGeo, intakeMat);
    plenum.position.set(0, 0.38, 0);
    engine.add(plenum);

    // 4. Outboard Tuned Exhaust Headers & Symmetrical Twin Turbos
    if (isTurbo) {
      const turboGeo = new THREE.TorusGeometry(0.065, 0.026, 12, 24);
      const turboL = new THREE.Mesh(turboGeo, exhaustMat);
      turboL.position.set(0.12, 0.12, -0.26);
      turboL.rotation.y = Math.PI / 2;

      const turboR = turboL.clone();
      turboR.position.z = 0.26;
      engine.add(turboL, turboR);
    }

    // 5. Front Serpentine Belt Drive
    this.addFrontAccessoryDrive(engine, length / 2 + 0.02, pulleyMat, headMat);

    return engine;
  }

  // ==========================================================================
  // 3. W-ENGINES (W12, W16 QUAD-TURBO)
  // ==========================================================================
  private static createWEngine(
    cylinders: 12 | 16 | 18,
    blockMat: THREE.Material,
    headMat: THREE.Material,
    intakeMat: THREE.Material,
    exhaustMat: THREE.Material,
    pulleyMat: THREE.Material
  ): THREE.Group {
    const engine = new THREE.Group();
    engine.name = `W${cylinders}_QuadTurbo_Engine`;

    const length = 0.68;

    // 1. Massive W-Configuration Crankcase
    const crankcaseGeo = new THREE.BoxGeometry(length, 0.24, 0.44);
    const crankcase = new THREE.Mesh(crankcaseGeo, blockMat);
    engine.add(crankcase);

    // 2. 4 Staggered VR Cylinder Banks (Double Vee)
    const vrBankGeo = new THREE.BoxGeometry(length * 0.92, 0.22, 0.16);
    const angles = [-0.62, -0.22, 0.22, 0.62];
    const offsetsZ = [-0.20, -0.07, 0.07, 0.20];

    angles.forEach((angle, idx) => {
      const bank = new THREE.Mesh(vrBankGeo, blockMat);
      bank.position.set(0, 0.18, offsetsZ[idx]);
      bank.rotation.x = angle;
      engine.add(bank);
    });

    // 3. Dual Carbon Charge Air Intake Manifolds
    const plenumGeo = new THREE.BoxGeometry(length * 0.85, 0.08, 0.18);
    const plenumL = new THREE.Mesh(plenumGeo, intakeMat);
    plenumL.position.set(0, 0.36, -0.14);

    const plenumR = plenumL.clone();
    plenumR.position.z = 0.14;
    engine.add(plenumL, plenumR);

    // 4. Quad Turbochargers (4 Corner Mounts)
    const turboGeo = new THREE.TorusGeometry(0.055, 0.022, 12, 20);
    const turboPositions = [
      [0.18, 0.16, -0.30],
      [-0.18, 0.16, -0.30],
      [0.18, 0.16, 0.30],
      [-0.18, 0.16, 0.30],
    ];

    turboPositions.forEach((pos) => {
      const turbo = new THREE.Mesh(turboGeo, exhaustMat);
      turbo.position.set(pos[0], pos[1], pos[2]);
      turbo.rotation.y = Math.PI / 2;
      engine.add(turbo);
    });

    // Front Accessory Drive
    this.addFrontAccessoryDrive(engine, length / 2 + 0.02, pulleyMat, headMat);

    return engine;
  }

  // ==========================================================================
  // 4. BOXER FLAT ENGINES (BOXER-4, BOXER-6)
  // ==========================================================================
  private static createBoxerEngine(
    cylinders: 4 | 6,
    blockMat: THREE.Material,
    headMat: THREE.Material,
    intakeMat: THREE.Material,
    exhaustMat: THREE.Material,
    pulleyMat: THREE.Material,
    isTurbo: boolean
  ): THREE.Group {
    const engine = new THREE.Group();
    engine.name = `Boxer${cylinders}_Engine`;

    const length = cylinders === 4 ? 0.38 : 0.52;

    // 1. Central Split Crankcase (Low Center of Gravity)
    const crankcaseGeo = new THREE.BoxGeometry(length, 0.16, 0.28);
    const crankcase = new THREE.Mesh(crankcaseGeo, blockMat);
    crankcase.position.set(0, -0.04, 0);
    engine.add(crankcase);

    // 2. Horizontally Opposed Cylinder Banks (180° Flat Left & Right)
    const bankGeo = new THREE.BoxGeometry(length * 0.92, 0.14, 0.18);
    const leftBank = new THREE.Mesh(bankGeo, blockMat);
    leftBank.position.set(0, 0, -0.22);

    const rightBank = leftBank.clone();
    rightBank.position.z = 0.22;
    engine.add(leftBank, rightBank);

    // Outboard Valve Covers
    const coverGeo = new THREE.BoxGeometry(length * 0.88, 0.12, 0.05);
    const coverL = new THREE.Mesh(coverGeo, headMat);
    coverL.position.set(0, 0, -0.32);

    const coverR = coverL.clone();
    coverR.position.z = 0.32;
    engine.add(coverL, coverR);

    // 3. Top-Mounted Intercooler (TMIC) & Spider Intake Manifold
    const tmicGeo = new THREE.BoxGeometry(length * 0.72, 0.05, 0.32);
    const tmic = new THREE.Mesh(tmicGeo, intakeMat);
    tmic.position.set(-0.04, 0.18, 0);
    engine.add(tmic);

    // 4. Under-Slung Equal-Length Exhaust Manifold
    const exhaustCollectorGeo = new THREE.BoxGeometry(length * 0.75, 0.08, 0.22);
    const exCollector = new THREE.Mesh(exhaustCollectorGeo, exhaustMat);
    exCollector.position.set(0.04, -0.16, 0);
    engine.add(exCollector);

    if (isTurbo) {
      const turboGeo = new THREE.TorusGeometry(0.065, 0.026, 12, 24);
      const turbo = new THREE.Mesh(turboGeo, exhaustMat);
      turbo.position.set(length / 2 + 0.08, -0.08, 0.12);
      turbo.rotation.y = Math.PI / 2;
      engine.add(turbo);
    }

    this.addFrontAccessoryDrive(engine, length / 2 + 0.02, pulleyMat, headMat);
    return engine;
  }

  // ==========================================================================
  // 5. ROTARY WANKEL ENGINE (TWIN-ROTOR)
  // ==========================================================================
  private static createRotaryWankelEngine(
    blockMat: THREE.Material,
    headMat: THREE.Material,
    intakeMat: THREE.Material,
    exhaustMat: THREE.Material,
    pulleyMat: THREE.Material
  ): THREE.Group {
    const engine = new THREE.Group();
    engine.name = 'TwinRotor_Wankel_Engine';

    const length = 0.38;

    // 1. Dual Epitrochoid Rotor Housings & Intermediate Iron Plate
    for (let r = 0; r < 2; r++) {
      const rX = -0.08 + r * 0.16;
      const trochoidGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.075, 24);
      trochoidGeo.rotateZ(Math.PI / 2);
      const housing = new THREE.Mesh(trochoidGeo, blockMat);
      housing.position.set(rX, 0, 0);
      engine.add(housing);
    }

    // Center Intermediate & End Iron Plates
    const plateGeo = new THREE.BoxGeometry(0.035, 0.34, 0.34);
    const plateFront = new THREE.Mesh(plateGeo, headMat);
    plateFront.position.set(length / 2, 0, 0);

    const plateMid = plateFront.clone();
    plateMid.position.x = 0;

    const plateRear = plateFront.clone();
    plateRear.position.x = -length / 2;
    engine.add(plateFront, plateMid, plateRear);

    // 2. High-Mounted Downdraft Intake Manifold
    const intakeGeo = new THREE.BoxGeometry(0.24, 0.12, 0.14);
    const intake = new THREE.Mesh(intakeGeo, intakeMat);
    intake.position.set(0, 0.22, -0.06);
    engine.add(intake);

    // 3. Side-Port Exhaust Header & Turbo
    const exhaustGeo = new THREE.BoxGeometry(0.22, 0.08, 0.12);
    const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaust.position.set(0, -0.12, 0.18);

    const turboGeo = new THREE.TorusGeometry(0.065, 0.026, 12, 24);
    const turbo = new THREE.Mesh(turboGeo, exhaustMat);
    turbo.position.set(0.08, 0.04, 0.24);
    turbo.rotation.y = Math.PI / 2;
    engine.add(exhaust, turbo);

    this.addFrontAccessoryDrive(engine, length / 2 + 0.02, pulleyMat, headMat);
    return engine;
  }

  // ==========================================================================
  // 6. AXIAL-FLUX EV MOTOR & HIGH-VOLTAGE INVERTER
  // ==========================================================================
  private static createElectricAxialFluxMotor(
    motorMat: THREE.Material,
    inverterMat: THREE.Material,
    hvCableMat: THREE.Material,
    busbarMat: THREE.Material
  ): THREE.Group {
    const unit = new THREE.Group();
    unit.name = 'AxialFlux_EV_Motor_Inverter';

    // 1. Dual Axial-Flux Motor Housing (Finned Disc Stator)
    const motorGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.26, 32);
    motorGeo.rotateZ(Math.PI / 2);
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.set(0, 0, 0);
    unit.add(motor);

    // Cooling Ribs around Motor Stator
    for (let r = -2; r <= 2; r++) {
      const ribGeo = new THREE.TorusGeometry(0.185, 0.008, 8, 32);
      ribGeo.rotateY(Math.PI / 2);
      const rib = new THREE.Mesh(ribGeo, inverterMat);
      rib.position.set(r * 0.05, 0, 0);
      unit.add(rib);
    }

    // 2. Top-Mounted SiC Power Inverter with Heatsink
    const inverterGeo = new THREE.BoxGeometry(0.32, 0.14, 0.24);
    const inverter = new THREE.Mesh(inverterGeo, inverterMat);
    inverter.position.set(0, 0.22, 0);
    unit.add(inverter);

    // 3. High-Voltage Shielded Orange Phase Cables (U, V, W)
    for (let c = -1; c <= 1; c++) {
      const cableGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.14, 12);
      const cable = new THREE.Mesh(cableGeo, hvCableMat);
      cable.position.set(c * 0.05, 0.12, 0.12);
      unit.add(cable);
    }

    // Copper Terminal Block
    const terminalGeo = new THREE.BoxGeometry(0.18, 0.04, 0.06);
    const terminal = new THREE.Mesh(terminalGeo, busbarMat);
    terminal.position.set(0, 0.14, 0.12);
    unit.add(terminal);

    return unit;
  }

  // ==========================================================================
  // HELPER: FRONT ACCESSORY DRIVE (SERPENTINE BELT & PULLEYS)
  // ==========================================================================
  private static addFrontAccessoryDrive(
    parent: THREE.Group,
    frontX: number,
    beltMat: THREE.Material,
    pulleyMat: THREE.Material
  ) {
    const driveGroup = new THREE.Group();
    driveGroup.position.set(frontX, 0, 0);

    const castMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.25 });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.95, roughness: 0.15 });
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.2, roughness: 0.4 });
    const redCapMat = new THREE.MeshPhysicalMaterial({ color: 0xdc2626, metalness: 0.9, roughness: 0.15, clearcoat: 0.8 });

    // 1. Harmonic Damper Crank Pulley
    const crankPulleyGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.024, 24);
    crankPulleyGeo.rotateZ(Math.PI / 2);
    const crankPulley = new THREE.Mesh(crankPulleyGeo, pulleyMat);
    crankPulley.position.set(0, -0.04, 0);

    // 2. High-Flow Water Pump Pulley & Cast Housing
    const wpPulleyGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.024, 20);
    wpPulleyGeo.rotateZ(Math.PI / 2);
    const wpPulley = new THREE.Mesh(wpPulleyGeo, pulleyMat);
    wpPulley.position.set(0, 0.10, 0);

    // 3. High-Output 220A Alternator with Vented Casing & Copper Stator Windings
    const altCaseGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.08, 16);
    altCaseGeo.rotateZ(Math.PI / 2);
    const altCase = new THREE.Mesh(altCaseGeo, castMat);
    altCase.position.set(-0.04, 0.12, -0.16);

    const altCopperGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.04, 16);
    altCopperGeo.rotateZ(Math.PI / 2);
    const altCopper = new THREE.Mesh(altCopperGeo, copperMat);
    altCopper.position.set(-0.04, 0.12, -0.16);

    const altPulleyGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.024, 16);
    altPulleyGeo.rotateZ(Math.PI / 2);
    const altPulley = new THREE.Mesh(altPulleyGeo, pulleyMat);
    altPulley.position.set(0, 0.12, -0.16);

    // 4. A/C Compressor with Electromagnetic Clutch Hub
    const acCaseGeo = new THREE.CylinderGeometry(0.050, 0.050, 0.09, 16);
    acCaseGeo.rotateZ(Math.PI / 2);
    const acCase = new THREE.Mesh(acCaseGeo, castMat);
    acCase.position.set(-0.04, -0.06, -0.16);

    const acPulleyGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.024, 16);
    acPulleyGeo.rotateZ(Math.PI / 2);
    const acPulley = new THREE.Mesh(acPulleyGeo, pulleyMat);
    acPulley.position.set(0, -0.06, -0.16);

    // 5. Spring-Loaded Automatic Belt Tensioner Arm & Idler Pulley
    const tensionerGeo = new THREE.BoxGeometry(0.02, 0.06, 0.02);
    const tensioner = new THREE.Mesh(tensionerGeo, castMat);
    tensioner.position.set(0, 0.02, 0.12);

    const idlerGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.020, 16);
    idlerGeo.rotateZ(Math.PI / 2);
    const idler = new THREE.Mesh(idlerGeo, pulleyMat);
    idler.position.set(0, 0.05, 0.12);

    // 6. Multi-Ribbed Serpentine Belt Route
    const beltGeo = new THREE.TorusGeometry(0.14, 0.008, 8, 32);
    beltGeo.rotateY(Math.PI / 2);
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.set(0.005, 0.04, -0.02);

    // 7. Billet Oil Filler Cap on Front Top Cover
    const oilCapGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.016, 12);
    const oilCap = new THREE.Mesh(oilCapGeo, redCapMat);
    oilCap.position.set(-0.08, 0.28, -0.12);

    // 8. Oil Level Dipstick Tube with Bright Yellow Ring Handle
    const dipstickGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.22, 8);
    const dipstick = new THREE.Mesh(dipstickGeo, castMat);
    dipstick.position.set(-0.06, 0.18, 0.18);
    dipstick.rotation.z = -0.22;

    const pullRingGeo = new THREE.TorusGeometry(0.012, 0.003, 8, 16);
    const pullRing = new THREE.Mesh(pullRingGeo, yellowMat);
    pullRing.position.set(-0.08, 0.29, 0.18);
    pullRing.rotation.y = Math.PI / 2;

    driveGroup.add(
      crankPulley, wpPulley, altCase, altCopper, altPulley,
      acCase, acPulley, tensioner, idler, belt,
      oilCap, dipstick, pullRing
    );
    parent.add(driveGroup);
  }

  private static createTransmission(
    casingMat: THREE.Material,
    billetMat: THREE.Material,
    accentMat: THREE.Material,
    goldMat: THREE.Material,
    isElectric: boolean = false
  ): THREE.Group {
    const trans = new THREE.Group();
    trans.name = isElectric ? 'EV_Reduction_Gearbox' : 'DCT_Mechatronic_Transmission';

    if (isElectric) {
      // 1. Compact High-Efficiency e-Axle Helical Reduction Gearbox
      const caseGeo = new THREE.BoxGeometry(0.28, 0.22, 0.22);
      const caseMesh = new THREE.Mesh(caseGeo, casingMat);
      caseMesh.position.set(-0.06, 0, 0);
      trans.add(caseMesh);

      // Helical Reduction Pinion & Park Lock Actuator
      const parkGeo = new THREE.BoxGeometry(0.08, 0.06, 0.08);
      const parkLock = new THREE.Mesh(parkGeo, billetMat);
      parkLock.position.set(-0.06, 0.12, 0.02);
      trans.add(parkLock);

      // Glycol Cooling Ports
      const portGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.025, 12);
      const port1 = new THREE.Mesh(portGeo, goldMat);
      port1.position.set(-0.12, 0.10, 0.06);
      const port2 = port1.clone();
      port2.position.set(-0.12, -0.10, 0.06);
      trans.add(port1, port2);
      return trans;
    }

    // 2. High-Performance Dual-Clutch / Sequential Transaxle
    // Conical Bellhousing with Dual Input Shafts
    const bellGeo = new THREE.CylinderGeometry(0.13, 0.19, 0.18, 24);
    bellGeo.rotateZ(Math.PI / 2);
    const bell = new THREE.Mesh(bellGeo, casingMat);
    bell.position.set(0.08, 0, 0);

    // Multi-Plate Wet Clutch Drum
    const clutchDrumGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.05, 20);
    clutchDrumGeo.rotateZ(Math.PI / 2);
    const clutchDrum = new THREE.Mesh(clutchDrumGeo, billetMat);
    clutchDrum.position.set(0.08, 0, 0);

    // Main Ribbed Gearcase
    const gearGeo = new THREE.BoxGeometry(0.36, 0.22, 0.24);
    const gearbox = new THREE.Mesh(gearGeo, casingMat);
    gearbox.position.set(-0.16, -0.02, 0);

    // Top Hydraulic Mechatronics Valve Body Block
    const mechatronicsGeo = new THREE.BoxGeometry(0.18, 0.12, 0.08);
    const mechatronics = new THREE.Mesh(mechatronicsGeo, billetMat);
    mechatronics.position.set(-0.14, 0, 0.14);

    // 4 High-Speed Shift Solenoids
    for (let s = 0; s < 4; s++) {
      const sx = -0.18 + (s % 2) * 0.07;
      const sy = s < 2 ? -0.03 : 0.03;
      const solGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.025, 12);
      const sol = new THREE.Mesh(solGeo, goldMat);
      sol.position.set(sx, sy, 0.18);
      trans.add(sol);
    }

    // Side Oil-to-Water Transmission Cooler Canister
    const coolerGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.12, 16);
    coolerGeo.rotateZ(Math.PI / 2);
    const cooler = new THREE.Mesh(coolerGeo, billetMat);
    cooler.position.set(-0.16, 0.13, -0.02);

    const fittingGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.018, 8);
    const fitting = new THREE.Mesh(fittingGeo, accentMat);
    fitting.position.set(-0.16, 0.15, -0.02);
    trans.add(cooler, fitting);

    trans.add(bell, clutchDrum, gearbox, mechatronics);
    return trans;
  }

  private static createRearDifferential(diffMat: THREE.Material, shaftMat: THREE.Material): THREE.Group {
    const diff = new THREE.Group();
    diff.name = 'Rear_eLSD_Differential';

    const carrierGeo = new THREE.SphereGeometry(0.11, 16, 12);
    carrierGeo.scale(1.2, 1.0, 1.0);
    const carrier = new THREE.Mesh(carrierGeo, diffMat);
    diff.add(carrier);

    const axleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.38, 12);
    axleGeo.rotateX(Math.PI / 2);

    const leftAxle = new THREE.Mesh(axleGeo, shaftMat);
    leftAxle.position.set(0, 0, -0.28);

    const rightAxle = leftAxle.clone();
    rightAxle.position.z = 0.28;

    diff.add(leftAxle, rightAxle);
    return diff;
  }
}
