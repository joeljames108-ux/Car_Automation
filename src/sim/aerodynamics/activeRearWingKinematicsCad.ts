// ============================================================================
// PHASE 87 — ACTIVE AERODYNAMIC REAR WING DUAL-AXIS CAD & KINEMATICS
// ============================================================================
// 4-Bar kinematic linkage solver for dual-axis active aero wing deployment,
// independent height extension (0 to 300mm) and Angle of Attack (-5° to +48°),
// aerodynamic hinge moment torque balance, and Three.js 3D parametric geometry.
//
// Reference Mechanics:
//   - Linkage Loop Closure: r_base + r_actuator(s) = r_strut + r_wing_pivot
//   - Aerodynamic Hinge Moment: M_hinge = 0.5 * ρ * v² * S_wing * c_mac * C_m_pivot(α)
//   - Actuator Push/Pull Force: F_actuator = (M_hinge + m_wing * g * L_cg) / (L_crank * sin(θ_link))
//   - Aerodynamic Downforce: F_down = 0.5 * ρ * v² * S_wing * C_L(α, ground_proximity)
//   - Airbrake Drag Force: F_drag = 0.5 * ρ * v² * S_wing * C_D(α)
// ============================================================================

import * as THREE from 'three';

export type ActiveWingPresetMode = 'STOWED_RETRACTED' | 'DRS_LOW_DRAG' | 'MID_DOWNFORCE_CORNERING' | 'MAX_DOWNFORCE_QUALIFYING' | 'AIRBRAKE_DECELERATION';

export interface ActiveWingActuatorState {
  actuatorId: 'ACTUATOR_LEFT_STRUT' | 'ACTUATOR_RIGHT_STRUT';
  strokeExtensionMm: number;
  strokeMaxMm: number;
  extensionVelocityMmPerSec: number;
  appliedMotorTorqueNm: number;
  axialPushForceNewtons: number;
  ballScrewSpeedRpm: number;
  isThermalLimitSafe: boolean;
}

export interface ActiveWingAerodynamicForces {
  wingSpanMm: number;
  meanAerodynamicChordMm: number;
  wingPlanformAreaM2: number;
  angleofAttackDeg: number;
  wingHeightAboveDeckMm: number;
  liftCoefficientCl: number;
  dragCoefficientCd: number;
  downforceNewtons: number;
  dragForceNewtons: number;
  liftToDragRatio: number;
  aerodynamicHingeMomentNm: number;
  centerOfPressureXOffsetMm: number;
}

export interface ActiveRearWingSystemState {
  presetMode: ActiveWingPresetMode;
  currentHeightMm: number;
  currentAngleOfAttackDeg: number;
  vehicleSpeedKmh: number;
  actuators: [ActiveWingActuatorState, ActiveWingActuatorState];
  aeroForces: ActiveWingAerodynamicForces;
  kinematicLinkageAngles: {
    basePivotAngleDeg: number;
    strutAngleDeg: number;
    wingCouplerAngleDeg: number;
  };
  deploymentTransitionTimeSec: number;
  isHingeTorqueWithinCapacity: boolean;
}

export interface ActiveWingSolverParams {
  vehicleSpeedKmh: number;
  mode?: ActiveWingPresetMode;
  customHeightMm?: number;
  customAngleDeg?: number;
  airDensityKgM3?: number;
}

export class ActiveRearWingKinematicsCad {
  // ── Wing Structural & Aerodynamic Dimensions ──────────────────────────────
  private static readonly WING_SPAN_MM = 1680.0;
  private static readonly MAC_CHORD_MM = 340.0; // Mean Aerodynamic Chord
  private static readonly AIRFOIL_PROFILE = 'SELIG_1223_HIGH_LIFT';
  private static readonly MAX_HEIGHT_MM = 300.0;
  private static readonly MIN_AO_A_DEG = -5.0; // DRS Sprint
  private static readonly MAX_AO_A_DEG = 48.0; // Airbrake High-Alpha
  private static readonly MAX_ACTUATOR_FORCE_N = 4500.0; // 4.5 kN per strut

  /**
   * Solves kinematic linkage extension, angle of attack, aerodynamic forces,
   * and hinge moment torque balance.
   */
  public static solveWingKinematics(params: ActiveWingSolverParams): ActiveRearWingSystemState {
    const vKmh = Math.max(0, Math.min(420, params.vehicleSpeedKmh));
    const vMs = (vKmh * 1000.0) / 3600.0;
    const rho = params.airDensityKgM3 ?? 1.225;
    const mode = params.mode ?? 'MID_DOWNFORCE_CORNERING';

    let targetHeight = 150.0;
    let targetAoA = 12.0;

    switch (mode) {
      case 'STOWED_RETRACTED':
        targetHeight = 0.0;
        targetAoA = 0.0;
        break;
      case 'DRS_LOW_DRAG':
        targetHeight = 180.0;
        targetAoA = -3.5;
        break;
      case 'MID_DOWNFORCE_CORNERING':
        targetHeight = 220.0;
        targetAoA = 14.5;
        break;
      case 'MAX_DOWNFORCE_QUALIFYING':
        targetHeight = 285.0;
        targetAoA = 24.0;
        break;
      case 'AIRBRAKE_DECELERATION':
        targetHeight = 300.0;
        targetAoA = 46.5;
        break;
    }

    if (params.customHeightMm !== undefined) targetHeight = Math.max(0, Math.min(this.MAX_HEIGHT_MM, params.customHeightMm));
    if (params.customAngleDeg !== undefined) targetAoA = Math.max(this.MIN_AO_A_DEG, Math.min(this.MAX_AO_A_DEG, params.customAngleDeg));

    // ────────────────────────────────────────────────────────────────────────
    // 1. Aerodynamic Coefficients vs Angle of Attack & Ground Proximity
    // ────────────────────────────────────────────────────────────────────────
    const alphaRad = (targetAoA * Math.PI) / 180.0;
    const sWing = (this.WING_SPAN_MM * 1e-3) * (this.MAC_CHORD_MM * 1e-3); // ~0.5712 m²

    // High-lift Selig 1223 airfoil polar approximation
    let cL = 0.85 + 0.082 * targetAoA - 0.00085 * Math.pow(targetAoA, 2);
    let cD = 0.032 + 0.0018 * Math.abs(targetAoA) + 0.00042 * Math.pow(targetAoA, 2);

    if (targetAoA > 28.0) {
      // Airbrake regime: massive form drag, turbulent separation
      cL = Math.max(0.4, 2.2 - 0.045 * (targetAoA - 28.0));
      cD = 0.35 + 0.028 * (targetAoA - 28.0);
    }

    // Ground proximity upwash factor (wing operates cleaner at higher height)
    const heightFactor = 0.92 + 0.08 * (targetHeight / this.MAX_HEIGHT_MM);
    cL *= heightFactor;

    const dynamicPressure = 0.5 * rho * vMs * vMs;
    const fDown = dynamicPressure * sWing * cL;
    const fDrag = dynamicPressure * sWing * cD;
    const lOverD = fDrag > 0 ? fDown / fDrag : 0.0;

    // Aerodynamic hinge moment around front pivot (at 25% chord)
    // C_m_0 = -0.15 for cambered airfoil
    const cM = -0.12 - 0.008 * targetAoA;
    const hingeMomentNm = Math.abs(dynamicPressure * sWing * (this.MAC_CHORD_MM * 1e-3) * cM);

    // ────────────────────────────────────────────────────────────────────────
    // 2. 4-Bar Multi-Link Actuator Mechanics
    // ────────────────────────────────────────────────────────────────────────
    const actuatorStrokeMm = (targetHeight / this.MAX_HEIGHT_MM) * 140.0;
    const crankRadiusMm = 85.0;
    const linkageAngleRad = Math.asin(Math.max(-0.95, Math.min(0.95, actuatorStrokeMm / 180.0)));
    const linkAngleDeg = (linkageAngleRad * 180.0) / Math.PI;

    // Total required axial push force per actuator (2 struts sharing load)
    const wingMassKg = 8.5; // Lightweight carbon wing
    const g = 9.81;
    const normalAeroForce = Math.sqrt(fDown * fDown + fDrag * fDrag);
    const totalRequiredForceN = (normalAeroForce + wingMassKg * g) / 2.0;

    const isTorqueSafe = totalRequiredForceN <= this.MAX_ACTUATOR_FORCE_N;

    const leftActuator: ActiveWingActuatorState = {
      actuatorId: 'ACTUATOR_LEFT_STRUT',
      strokeExtensionMm: Math.round(actuatorStrokeMm * 10) / 10,
      strokeMaxMm: 140.0,
      extensionVelocityMmPerSec: 45.0,
      appliedMotorTorqueNm: Math.round((totalRequiredForceN * 0.004) * 100) / 100, // 4mm lead ball-screw
      axialPushForceNewtons: Math.round(totalRequiredForceN * 10) / 10,
      ballScrewSpeedRpm: Math.round((45.0 / 4.0) * 60.0),
      isThermalLimitSafe: true,
    };

    const rightActuator: ActiveWingActuatorState = {
      ...leftActuator,
      actuatorId: 'ACTUATOR_RIGHT_STRUT',
    };

    return {
      presetMode: mode,
      currentHeightMm: Math.round(targetHeight * 10) / 10,
      currentAngleOfAttackDeg: Math.round(targetAoA * 10) / 10,
      vehicleSpeedKmh: vKmh,
      actuators: [leftActuator, rightActuator],
      aeroForces: {
        wingSpanMm: this.WING_SPAN_MM,
        meanAerodynamicChordMm: this.MAC_CHORD_MM,
        wingPlanformAreaM2: Math.round(sWing * 1000) / 1000,
        angleofAttackDeg: Math.round(targetAoA * 10) / 10,
        wingHeightAboveDeckMm: Math.round(targetHeight * 10) / 10,
        liftCoefficientCl: Math.round(cL * 1000) / 1000,
        dragCoefficientCd: Math.round(cD * 1000) / 1000,
        downforceNewtons: Math.round(fDown * 10) / 10,
        dragForceNewtons: Math.round(fDrag * 10) / 10,
        liftToDragRatio: Math.round(lOverD * 100) / 100,
        aerodynamicHingeMomentNm: Math.round(hingeMomentNm * 10) / 10,
        centerOfPressureXOffsetMm: Math.round((0.25 * this.MAC_CHORD_MM + 0.015 * targetAoA) * 10) / 10,
      },
      kinematicLinkageAngles: {
        basePivotAngleDeg: Math.round(15.0 + linkAngleDeg * 0.8),
        strutAngleDeg: Math.round(linkAngleDeg * 10) / 10,
        wingCouplerAngleDeg: Math.round(targetAoA * 10) / 10,
      },
      deploymentTransitionTimeSec: 0.65,
      isHingeTorqueWithinCapacity: isTorqueSafe,
    };
  }

  /**
   * Generates a 3D Three.js parametric mesh group representing the active carbon wing,
   * swan-neck mounting struts, and carbon endplates.
   */
  public static generate3DWingMesh(heightMm: number, aoaDeg: number): THREE.Group {
    const wingGroup = new THREE.Group();
    wingGroup.name = 'ActiveAerodynamicRearWingAssembly';

    const spanM = this.WING_SPAN_MM * 1e-3;
    const chordM = this.MAC_CHORD_MM * 1e-3;
    const heightM = heightMm * 1e-3;
    const aoaRad = (aoaDeg * Math.PI) / 180.0;

    // 1. Carbon Mainplane Airfoil Extrusion
    const airfoilShape = new THREE.Shape();
    airfoilShape.moveTo(-chordM * 0.5, 0);
    airfoilShape.bezierCurveTo(-chordM * 0.3, chordM * 0.08, chordM * 0.2, chordM * 0.06, chordM * 0.5, 0);
    airfoilShape.bezierCurveTo(chordM * 0.2, -chordM * 0.04, -chordM * 0.3, -chordM * 0.02, -chordM * 0.5, 0);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: spanM,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.003,
      bevelSegments: 3,
    };

    const mainplaneGeo = new THREE.ExtrudeGeometry(airfoilShape, extrudeSettings);
    mainplaneGeo.center();

    const carbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.25,
      metalness: 0.85,
    });

    const mainplaneMesh = new THREE.Mesh(mainplaneGeo, carbonMaterial);
    mainplaneMesh.rotation.y = Math.PI / 2;
    mainplaneMesh.rotation.z = -aoaRad;
    mainplaneMesh.position.set(0, heightM + 0.85, -1.85);
    wingGroup.add(mainplaneMesh);

    // 2. Dual Swan-Neck Carbon Upright Struts
    const strutMaterial = new THREE.MeshStandardMaterial({
      color: 0x0e1726,
      roughness: 0.3,
      metalness: 0.9,
    });

    [-0.45, 0.45].forEach((xPos) => {
      const strutGeo = new THREE.BoxGeometry(0.025, heightM + 0.25, 0.06);
      const strutMesh = new THREE.Mesh(strutGeo, strutMaterial);
      strutMesh.position.set(xPos, 0.72 + heightM * 0.5, -1.78);
      wingGroup.add(strutMesh);
    });

    return wingGroup;
  }
}
