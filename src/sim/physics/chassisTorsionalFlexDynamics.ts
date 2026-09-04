// ============================================================================
// MODULE 18: CHASSIS TORSIONAL STIFFNESS, FLEX & MONOCOQUE DYNAMICS
// ============================================================================
// Structural compliance physics engine for composite monocoque chassis.
// Models series-spring roll stiffness coupling (front ARB vs rear ARB vs
// chassis torsional flex), chassis twist angle under lateral g-forces,
// diagonal jacking loads from asymmetric curb strikes, and aerodynamic
// suction beam bending deflection along the underfloor.
// ============================================================================

export interface ChassisStructuralProperties {
  torsionalStiffnessNmPerDeg: number;  // e.g. 45,000 N*m/deg for LMH/F1 carbon tub
  bendingStiffnessNmM2: number;        // EI beam stiffness (e.g. 1.2e7 N*m^2)
  wheelbaseM: number;                  // Wheelbase L (m)
  trackWidthFrontM: number;            // Front track width (m)
  trackWidthRearM: number;             // Rear track width (m)
  chassisMassKg: number;               // Monocoque mass (kg)
}

export interface SuspensionRollInputs {
  frontSuspensionRollStiffnessNmPerDeg: number; // K_phi_f (springs + ARB)
  rearSuspensionRollStiffnessNmPerDeg: number;  // K_phi_r (springs + ARB)
  lateralAccelG: number;                       // Lateral acceleration in G
  totalSprungMassKg: number;                   // Sprung mass
  rollCenterHeightM: number;                   // Kinematic roll center height
  cgHeightM: number;                           // Center of gravity height
  aeroDownforceTotalN: number;                 // Total aerodynamic downforce
  curbDisplacementFLMm: number;                // Instant curb displacement at FL
  curbDisplacementFRMm: number;                // Instant curb displacement at FR
}

export interface ChassisFlexResult {
  nominalFrontRollDistributionPct: number;    // Ideal rigid front distribution %
  effectiveFrontRollDistributionPct: number;  // Actual flex-coupled front distribution %
  stiffnessDegradationPct: number;            // Authority loss due to chassis compliance
  frontRollAngleDeg: number;                  // Front body roll angle
  rearRollAngleDeg: number;                   // Rear body roll angle
  chassisTwistAngleDeg: number;               // Angular twist between front and rear bulkheads
  chassisTorsionalMomentNm: number;           // Internal shear torque carried by tub
  curbStrikeWarpTorqueNm: number;             // Torque induced by asymmetric curb strike
  diagonalLoadTransferN: number;              // Jacking force on diagonal tire pairs
  aeroSuctionBeamDeflectionMm: number;        // Sag of center underfloor towards track
  isFloorScrapeRisk: boolean;                 // Warning if deflection exceeds critical margin
}

export class ChassisTorsionalFlexDynamics {
  /**
   * Solves multi-body structural flex and roll stiffness redistribution.
   */
  public static evaluate(
    struct: ChassisStructuralProperties,
    inputs: SuspensionRollInputs
  ): ChassisFlexResult {
    // ------------------------------------------------------------------------
    // 1. TOTAL OVERTURNING ROLL MOMENT
    // ------------------------------------------------------------------------
    const g = 9.80665;
    const lateralAccMs2 = inputs.lateralAccelG * g;
    const rollArmM = Math.max(0.05, inputs.cgHeightM - inputs.rollCenterHeightM);
    const totalRollMomentNm = inputs.totalSprungMassKg * lateralAccMs2 * rollArmM;

    // Convert stiffnesses to N*m / radian for exact analytical matrix solver
    const degToRad = Math.PI / 180.0;
    const radToDeg = 180.0 / Math.PI;

    const Kf = inputs.frontSuspensionRollStiffnessNmPerDeg * radToDeg; // N*m/rad
    const Kr = inputs.rearSuspensionRollStiffnessNmPerDeg * radToDeg;  // N*m/rad
    const Kt = struct.torsionalStiffnessNmPerDeg * radToDeg;           // N*m/rad

    // Nominal rigid front roll distribution:
    const nominalFrontPct = (Kf / (Kf + Kr)) * 100.0;

    // ------------------------------------------------------------------------
    // 2. SERIES-SPRING ROLL STIFFNESS COUPLING
    // ------------------------------------------------------------------------
    // Solving coupled equilibrium:
    // M_total = M_f + M_r
    // M_f = Kf * phi_f
    // M_r = Kr * phi_r
    // M_f = Kt * (phi_f - phi_r)
    //
    // Yields exact expressions:
    // phi_f = M_total * (Kr + Kt) / (Kf * Kr + Kt * (Kf + Kr))
    // phi_r = M_total * Kt / (Kf * Kr + Kt * (Kf + Kr))
    const denominator = Kf * Kr + Kt * (Kf + Kr);

    const phiFRad = totalRollMomentNm > 0 ? (totalRollMomentNm * (Kr + Kt)) / denominator : 0;
    const phiRRad = totalRollMomentNm > 0 ? (totalRollMomentNm * Kt) / denominator : 0;
    const twistRad = phiFRad - phiRRad;

    const phiFDeg = phiFRad * radToDeg;
    const phiRDeg = phiRRad * radToDeg;
    const twistDeg = twistRad * radToDeg;

    const frontRollMomentCarried = Kf * phiFRad;
    const effectiveFrontPct = totalRollMomentNm > 0 ? (frontRollMomentCarried / totalRollMomentNm) * 100.0 : nominalFrontPct;
    const stiffnessDegradation = Math.abs(effectiveFrontPct - nominalFrontPct);

    const internalChassisTorque = Kt * Math.abs(twistRad);

    // ------------------------------------------------------------------------
    // 3. ASYMMETRIC CURB STRIKE & DIAGONAL LOAD JACKING
    // ------------------------------------------------------------------------
    const deltaCurbM = (inputs.curbDisplacementFLMm - inputs.curbDisplacementFRMm) / 1000.0;
    const curbRollAngleRad = Math.atan2(deltaCurbM, struct.trackWidthFrontM);
    // Chassis resists instantaneous suspension displacement:
    const curbWarpTorque = Math.abs(Kt * curbRollAngleRad * 0.45); // filtered by tire carcass deflection
    const diagonalLoadTransferN = curbWarpTorque / struct.trackWidthFrontM;

    // ------------------------------------------------------------------------
    // 4. AERODYNAMIC SUCTION UNDERFLOOR BEAM DEFLECTION
    // ------------------------------------------------------------------------
    // Monocoque modeled as Euler-Bernoulli simply supported beam under distributed suction:
    // delta_mid = 5 * F_aero * L^3 / (384 * E * I)
    const L = struct.wheelbaseM;
    const EI = struct.bendingStiffnessNmM2;
    const deflectionM = (5.0 * inputs.aeroDownforceTotalN * Math.pow(L, 3)) / (384.0 * EI);
    const deflectionMm = deflectionM * 1000.0;

    const floorScrapeRisk = deflectionMm > 8.0; // High bottoming/diffuser choke risk

    return {
      nominalFrontRollDistributionPct: Number(nominalFrontPct.toFixed(2)),
      effectiveFrontRollDistributionPct: Number(effectiveFrontPct.toFixed(2)),
      stiffnessDegradationPct: Number(stiffnessDegradation.toFixed(2)),
      frontRollAngleDeg: Number(phiFDeg.toFixed(3)),
      rearRollAngleDeg: Number(phiRDeg.toFixed(3)),
      chassisTwistAngleDeg: Number(twistDeg.toFixed(4)),
      chassisTorsionalMomentNm: Number(internalChassisTorque.toFixed(1)),
      curbStrikeWarpTorqueNm: Number(curbWarpTorque.toFixed(1)),
      diagonalLoadTransferN: Number(diagonalLoadTransferN.toFixed(1)),
      aeroSuctionBeamDeflectionMm: Number(deflectionMm.toFixed(2)),
      isFloorScrapeRisk: floorScrapeRisk,
    };
  }
}
