// ============================================================================
// PHASE 04 — MASTER FASTENER & ATTACHMENT SOCKET STANDARD — FASTENER SPECS
// ============================================================================
// Defines complete ISO metric, DIN, ARP aerospace, and Centerlock fastener
// mechanical engineering specifications, clamping force calculations, and torque limits.
// ============================================================================

export type FastenerThreadStandard = 'ISO_METRIC_COARSE' | 'ISO_METRIC_FINE' | 'UNF_AEROSPACE' | 'CENTERLOCK_ACME';

export type FastenerMaterialGrade =
  | 'GRADE_8_8'
  | 'GRADE_10_9'
  | 'GRADE_12_9'
  | 'ARP_2000_CHROME_MOLY'
  | 'AEROSPACE_TITANIUM_TI_6AL_4V'
  | 'STAINLESS_A4_80'
  | 'ALUMINUM_7075_T6';

export interface FastenerEngineeringSpec {
  id: string;
  nominalDiameterMm: number;
  threadPitchMm: number;
  standard: FastenerThreadStandard;
  materialGrade: FastenerMaterialGrade;
  yieldStrengthMpa: number;
  tensileStrengthMpa: number;
  proofStressMpa: number;
  tensileStressAreaMm2: number;
  recommendedPreloadKn: number;
  nominalTorqueNm: number;
  torqueTolerancePct: number;
  frictionCoefficientK: number; // typically 0.12 - 0.18 for lubricated automotive threads
  headDriveType: 'HEX_FLANGE' | 'TORX_PLUS_INTERNAL' | 'SOCKET_HEAD_CAP' | 'TWELVE_POINT_ARP' | 'CENTERLOCK_OCTAGONAL';
  recommendedSocketSizeMm: number;
  corrosionProtection: 'ZINC_NICKEL_ELECTROPLATE' | 'BLACK_OXIDE' | 'ANODIZED' | 'TITANIUM_NITRIDE_PVD';
}

export class MasterFastenerStandards {
  public static readonly FASTENERS: Record<string, FastenerEngineeringSpec> = {
    // ── M6 LIGHT BRACKET FASTENERS ──
    M6_GRADE_8_8: {
      id: 'M6_GRADE_8_8',
      nominalDiameterMm: 6.0,
      threadPitchMm: 1.0,
      standard: 'ISO_METRIC_COARSE',
      materialGrade: 'GRADE_8_8',
      yieldStrengthMpa: 640,
      tensileStrengthMpa: 800,
      proofStressMpa: 580,
      tensileStressAreaMm2: 20.1,
      recommendedPreloadKn: 10.5,
      nominalTorqueNm: 9.8,
      torqueTolerancePct: 5,
      frictionCoefficientK: 0.15,
      headDriveType: 'HEX_FLANGE',
      recommendedSocketSizeMm: 10,
      corrosionProtection: 'ZINC_NICKEL_ELECTROPLATE',
    },

    // ── M8 INTERIOR & BRACE FASTENERS ──
    M8_GRADE_8_8: {
      id: 'M8_GRADE_8_8',
      nominalDiameterMm: 8.0,
      threadPitchMm: 1.25,
      standard: 'ISO_METRIC_COARSE',
      materialGrade: 'GRADE_8_8',
      yieldStrengthMpa: 640,
      tensileStrengthMpa: 800,
      proofStressMpa: 580,
      tensileStressAreaMm2: 36.6,
      recommendedPreloadKn: 19.1,
      nominalTorqueNm: 24.5,
      torqueTolerancePct: 5,
      frictionCoefficientK: 0.15,
      headDriveType: 'HEX_FLANGE',
      recommendedSocketSizeMm: 13,
      corrosionProtection: 'ZINC_NICKEL_ELECTROPLATE',
    },
    M8_GRADE_10_9: {
      id: 'M8_GRADE_10_9',
      nominalDiameterMm: 8.0,
      threadPitchMm: 1.25,
      standard: 'ISO_METRIC_COARSE',
      materialGrade: 'GRADE_10_9',
      yieldStrengthMpa: 940,
      tensileStrengthMpa: 1040,
      proofStressMpa: 830,
      tensileStressAreaMm2: 36.6,
      recommendedPreloadKn: 27.3,
      nominalTorqueNm: 35.0,
      torqueTolerancePct: 4,
      frictionCoefficientK: 0.14,
      headDriveType: 'TORX_PLUS_INTERNAL',
      recommendedSocketSizeMm: 13,
      corrosionProtection: 'ZINC_NICKEL_ELECTROPLATE',
    },
    M8_AEROSPACE_TITANIUM: {
      id: 'M8_AEROSPACE_TITANIUM',
      nominalDiameterMm: 8.0,
      threadPitchMm: 1.25,
      standard: 'ISO_METRIC_COARSE',
      materialGrade: 'AEROSPACE_TITANIUM_TI_6AL_4V',
      yieldStrengthMpa: 880,
      tensileStrengthMpa: 950,
      proofStressMpa: 800,
      tensileStressAreaMm2: 36.6,
      recommendedPreloadKn: 24.5,
      nominalTorqueNm: 22.0,
      torqueTolerancePct: 3,
      frictionCoefficientK: 0.12,
      headDriveType: 'TWELVE_POINT_ARP',
      recommendedSocketSizeMm: 10,
      corrosionProtection: 'TITANIUM_NITRIDE_PVD',
    },

    // ── M10 CHASSIS & SEAT FASTENERS ──
    M10_GRADE_10_9: {
      id: 'M10_GRADE_10_9',
      nominalDiameterMm: 10.0,
      threadPitchMm: 1.5,
      standard: 'ISO_METRIC_COARSE',
      materialGrade: 'GRADE_10_9',
      yieldStrengthMpa: 940,
      tensileStrengthMpa: 1040,
      proofStressMpa: 830,
      tensileStressAreaMm2: 58.0,
      recommendedPreloadKn: 43.3,
      nominalTorqueNm: 68.0,
      torqueTolerancePct: 4,
      frictionCoefficientK: 0.14,
      headDriveType: 'HEX_FLANGE',
      recommendedSocketSizeMm: 16,
      corrosionProtection: 'ZINC_NICKEL_ELECTROPLATE',
    },
    M10_GRADE_12_9: {
      id: 'M10_GRADE_12_9',
      nominalDiameterMm: 10.0,
      threadPitchMm: 1.25,
      standard: 'ISO_METRIC_FINE',
      materialGrade: 'GRADE_12_9',
      yieldStrengthMpa: 1100,
      tensileStrengthMpa: 1220,
      proofStressMpa: 970,
      tensileStressAreaMm2: 61.2,
      recommendedPreloadKn: 53.4,
      nominalTorqueNm: 82.0,
      torqueTolerancePct: 3,
      frictionCoefficientK: 0.13,
      headDriveType: 'SOCKET_HEAD_CAP',
      recommendedSocketSizeMm: 8,
      corrosionProtection: 'BLACK_OXIDE',
    },

    // ── M12 SUSPENSION & POWERTRAIN FASTENERS ──
    M12_GRADE_10_9: {
      id: 'M12_GRADE_10_9',
      nominalDiameterMm: 12.0,
      threadPitchMm: 1.75,
      standard: 'ISO_METRIC_COARSE',
      materialGrade: 'GRADE_10_9',
      yieldStrengthMpa: 940,
      tensileStrengthMpa: 1040,
      proofStressMpa: 830,
      tensileStressAreaMm2: 84.3,
      recommendedPreloadKn: 63.0,
      nominalTorqueNm: 115.0,
      torqueTolerancePct: 4,
      frictionCoefficientK: 0.14,
      headDriveType: 'HEX_FLANGE',
      recommendedSocketSizeMm: 18,
      corrosionProtection: 'ZINC_NICKEL_ELECTROPLATE',
    },
    M12_GRADE_12_9: {
      id: 'M12_GRADE_12_9',
      nominalDiameterMm: 12.0,
      threadPitchMm: 1.5,
      standard: 'ISO_METRIC_FINE',
      materialGrade: 'GRADE_12_9',
      yieldStrengthMpa: 1100,
      tensileStrengthMpa: 1220,
      proofStressMpa: 970,
      tensileStressAreaMm2: 88.1,
      recommendedPreloadKn: 76.8,
      nominalTorqueNm: 142.0,
      torqueTolerancePct: 3,
      frictionCoefficientK: 0.13,
      headDriveType: 'TORX_PLUS_INTERNAL',
      recommendedSocketSizeMm: 18,
      corrosionProtection: 'BLACK_OXIDE',
    },

    // ── M14 CONTROL ARM & BRAKE CALIPER FASTENERS ──
    M14_GRADE_10_9: {
      id: 'M14_GRADE_10_9',
      nominalDiameterMm: 14.0,
      threadPitchMm: 1.5,
      standard: 'ISO_METRIC_FINE',
      materialGrade: 'GRADE_10_9',
      yieldStrengthMpa: 940,
      tensileStrengthMpa: 1040,
      proofStressMpa: 830,
      tensileStressAreaMm2: 125.0,
      recommendedPreloadKn: 93.4,
      nominalTorqueNm: 185.0,
      torqueTolerancePct: 4,
      frictionCoefficientK: 0.14,
      headDriveType: 'HEX_FLANGE',
      recommendedSocketSizeMm: 21,
      corrosionProtection: 'ZINC_NICKEL_ELECTROPLATE',
    },
    M14_ARP_2000: {
      id: 'M14_ARP_2000',
      nominalDiameterMm: 14.0,
      threadPitchMm: 1.5,
      standard: 'ISO_METRIC_FINE',
      materialGrade: 'ARP_2000_CHROME_MOLY',
      yieldStrengthMpa: 1380,
      tensileStrengthMpa: 1520,
      proofStressMpa: 1240,
      tensileStressAreaMm2: 125.0,
      recommendedPreloadKn: 139.5,
      nominalTorqueNm: 245.0,
      torqueTolerancePct: 2,
      frictionCoefficientK: 0.12,
      headDriveType: 'TWELVE_POINT_ARP',
      recommendedSocketSizeMm: 19,
      corrosionProtection: 'BLACK_OXIDE',
    },

    // ── M16 SUBFRAME ISOLATION BOLTS ──
    M16_GRADE_10_9: {
      id: 'M16_GRADE_10_9',
      nominalDiameterMm: 16.0,
      threadPitchMm: 1.5,
      standard: 'ISO_METRIC_FINE',
      materialGrade: 'GRADE_10_9',
      yieldStrengthMpa: 940,
      tensileStrengthMpa: 1040,
      proofStressMpa: 830,
      tensileStressAreaMm2: 167.0,
      recommendedPreloadKn: 124.8,
      nominalTorqueNm: 280.0,
      torqueTolerancePct: 4,
      frictionCoefficientK: 0.14,
      headDriveType: 'HEX_FLANGE',
      recommendedSocketSizeMm: 24,
      corrosionProtection: 'ZINC_NICKEL_ELECTROPLATE',
    },

    // ── CENTERLOCK MOTORSPORT WHEEL NUT ──
    CENTERLOCK_NUT_AEROSPACE: {
      id: 'CENTERLOCK_NUT_AEROSPACE',
      nominalDiameterMm: 60.0,
      threadPitchMm: 3.0,
      standard: 'CENTERLOCK_ACME',
      materialGrade: 'ALUMINUM_7075_T6',
      yieldStrengthMpa: 503,
      tensileStrengthMpa: 572,
      proofStressMpa: 460,
      tensileStressAreaMm2: 450.0,
      recommendedPreloadKn: 180.0,
      nominalTorqueNm: 600.0,
      torqueTolerancePct: 2,
      frictionCoefficientK: 0.11,
      headDriveType: 'CENTERLOCK_OCTAGONAL',
      recommendedSocketSizeMm: 65,
      corrosionProtection: 'ANODIZED',
    },
  };

  /**
   * Calculates required tightening torque (Nm) using the Motosh equation:
   * T = F_preload * ( (d2 / 2) * tan(psi + rho') + (d_w / 2) * mu_w )
   * Approximated engineering formula: T = K * d * F_preload
   */
  public static calculateTorque(spec: FastenerEngineeringSpec, desiredPreloadKn?: number): number {
    const fKn = desiredPreloadKn ?? spec.recommendedPreloadKn;
    const fN = fKn * 1000.0;
    const dMeters = spec.nominalDiameterMm / 1000.0;
    return Math.round(spec.frictionCoefficientK * dMeters * fN * 10) / 10;
  }

  /**
   * Evaluates fastener safety factor against tensile yield.
   */
  public static evaluateSafetyFactor(spec: FastenerEngineeringSpec, appliedTensionKn: number): number {
    const yieldForceKn = (spec.yieldStrengthMpa * spec.tensileStressAreaMm2) / 1000.0;
    if (appliedTensionKn <= 0) return 999.0;
    return Math.round((yieldForceKn / appliedTensionKn) * 100) / 100;
  }
}
