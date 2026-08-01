// ===================================================================
// ENGINE VIBRATION HARMONICS & NVH MODEL
// ===================================================================
// Phase 17: Firing order harmonic breakdown, primary & secondary order
// crankshaft balance forces, acoustic acoustic pressure dB, and refinement scoring.

export interface NVHInput {
  layout: string; // e.g. "i4", "v6", "v8", "v12", "i6", "boxer4"
  displacementCc: number;
  rpm: number;
  redline: number;
  hasBalanceShaft: boolean;
  exhaustValved: boolean;
  cabinSoundProofing: number; // 0.0 to 1.0
}

export interface NVHResult {
  primaryBalanceScore: number; // 0-10 (10 = perfectly balanced)
  secondaryBalanceScore: number; // 0-10
  firingFrequencyHz: number;
  cabinNoiseDb: number; // Decibels inside cabin
  overallNvhScore: number; // 0.0 to 1.0 (1.0 = Rolls-Royce smooth)
}

/**
 * Calculates engine primary/secondary balance and acoustic NVH metrics
 */
export function calculateNVH(input: NVHInput): NVHResult {
  const { layout, displacementCc, rpm, redline, hasBalanceShaft, exhaustValved, cabinSoundProofing } = input;

  // 1. Engine balance characteristics by cylinder layout
  let primaryBalanceScore = 7.0;
  let secondaryBalanceScore = 7.0;
  let cylinders = 4;

  switch (layout) {
    case 'i3':
      primaryBalanceScore = 4.0;
      secondaryBalanceScore = 5.0;
      cylinders = 3;
      break;
    case 'i4':
      primaryBalanceScore = 9.0;
      secondaryBalanceScore = 5.0; // I4 has inherent 2nd-order pitch/heave
      cylinders = 4;
      break;
    case 'v6':
      primaryBalanceScore = 7.5;
      secondaryBalanceScore = 8.0;
      cylinders = 6;
      break;
    case 'i6':
      primaryBalanceScore = 10.0; // Naturally in perfect 1st & 2nd order balance
      secondaryBalanceScore = 10.0;
      cylinders = 6;
      break;
    case 'boxer4':
      primaryBalanceScore = 9.5;
      secondaryBalanceScore = 8.5;
      cylinders = 4;
      break;
    case 'boxer6':
      primaryBalanceScore = 10.0;
      secondaryBalanceScore = 10.0;
      cylinders = 6;
      break;
    case 'v8':
      primaryBalanceScore = 9.0;
      secondaryBalanceScore = 9.0;
      cylinders = 8;
      break;
    case 'v10':
      primaryBalanceScore = 8.0;
      secondaryBalanceScore = 8.0;
      cylinders = 10;
      break;
    case 'v12':
    case 'w12':
    case 'w16':
      primaryBalanceScore = 10.0;
      secondaryBalanceScore = 10.0;
      cylinders = 12;
      break;
  }

  if (hasBalanceShaft && secondaryBalanceScore < 9.0) {
    secondaryBalanceScore = Math.min(9.5, secondaryBalanceScore + 3.0);
  }

  // 2. Firing Frequency Hz = (RPM / 60) * (Cylinders / 2)
  const firingFrequencyHz = (rpm / 60) * (cylinders / 2);

  // 3. Cabin Sound Pressure Level in dB
  // Base engine mechanical noise scales with RPM and displacement
  const speedRatio = rpm / Math.max(1, redline);
  const baseEngineDb = 55 + 25 * speedRatio + (displacementCc / 3000) * 5;

  const exhaustDbBonus = exhaustValved ? 8 : 0;
  const rawNoiseDb = baseEngineDb + exhaustDbBonus;

  // Cabin isolation attenuation (up to 30 dB attenuation with luxury insulation)
  const attenuationDb = 8 + cabinSoundProofing * 25;
  const cabinNoiseDb = Math.max(38, rawNoiseDb - attenuationDb);

  // 4. Overall NVH Refinement Score (0.0 to 1.0)
  const balanceFactor = (primaryBalanceScore * 0.5 + secondaryBalanceScore * 0.5) / 10;
  const noiseFactor = Math.max(0, 1.0 - (cabinNoiseDb - 40) / 50);

  const overallNvhScore = Math.min(0.99, Math.max(0.15, balanceFactor * 0.45 + noiseFactor * 0.55));

  return {
    primaryBalanceScore,
    secondaryBalanceScore,
    firingFrequencyHz: Math.round(firingFrequencyHz * 10) / 10,
    cabinNoiseDb: Math.round(cabinNoiseDb * 10) / 10,
    overallNvhScore: Math.round(overallNvhScore * 100) / 100,
  };
}
