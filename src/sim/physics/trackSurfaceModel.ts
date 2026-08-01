// ===================================================================
// ROAD SURFACE, KERB & TRACK EVOLUTION MODEL
// ===================================================================
// Phase 18: Track rubber lay-down evolution, asphalt solar thermal absorption,
// kerb strike vertical shock loading, and off-line marble rubber debris.

export interface TrackSurfaceParams {
  baseAsphaltGrip: number; // e.g. 0.90 to 1.05
  solarRadiationFactor: number; // 0.0 (night/overcast) to 1.0 (bright sun)
  ambientTempC: number;
}

export interface TrackSurfaceState {
  trackTempC: number;
  rubberLevelFraction: number; // 0.0 (green track) to 1.0 (fully rubbered in)
  racingLineGripMultiplier: number;
  offLineGripMultiplier: number;
}

/**
 * Initializes track surface state
 */
export function createTrackSurfaceState(ambientTempC: number = 25): TrackSurfaceState {
  return {
    trackTempC: Math.max(20, ambientTempC + 8),
    rubberLevelFraction: 0.1,
    racingLineGripMultiplier: 0.95,
    offLineGripMultiplier: 0.92,
  };
}

/**
 * Updates track surface conditions over completed laps
 */
export function updateTrackSurface(
  currentState: TrackSurfaceState,
  completedLapsTotal: number, // Total laps by all cars on track
  params: TrackSurfaceParams
): TrackSurfaceState {
  const { baseAsphaltGrip, solarRadiationFactor, ambientTempC } = params;

  // 1. Asphalt temperature calculation (solar heat gain + ambient)
  const trackTempC = ambientTempC + solarRadiationFactor * 18 + 5;

  // 2. Rubber buildup on racing line (diminishing returns log curve)
  const rubberLevelFraction = Math.min(1.0, 0.1 + 0.9 * (1 - Math.exp(-completedLapsTotal / 120)));

  // 3. Racing line grip bonus (rubbered-in track provides up to +8% grip)
  // Asphalt temp effect: peak grip around 35-45°C track temp
  let tempGripFactor = 1.0;
  if (trackTempC > 50) tempGripFactor = 1.0 - (trackTempC - 50) * 0.004; // slippery hot asphalt
  else if (trackTempC < 20) tempGripFactor = 1.0 - (20 - trackTempC) * 0.005; // cold asphalt

  const racingLineGripMultiplier = baseAsphaltGrip * (1.0 + rubberLevelFraction * 0.07) * tempGripFactor;

  // 4. Off-line grip penalty (marbles accumulation late in race)
  const marbleDebrisPenalty = rubberLevelFraction * 0.06;
  const offLineGripMultiplier = baseAsphaltGrip * (1.0 - marbleDebrisPenalty);

  return {
    trackTempC: Math.round(trackTempC * 10) / 10,
    rubberLevelFraction: Math.round(rubberLevelFraction * 100) / 100,
    racingLineGripMultiplier: Math.round(racingLineGripMultiplier * 1000) / 1000,
    offLineGripMultiplier: Math.round(offLineGripMultiplier * 1000) / 1000,
  };
}

/**
 * Calculates Kerb Strike Shock Load
 * Returns grip loss fraction (0.0 to 0.4) during kerb impact
 */
export function calculateKerbImpactGripLoss(
  kerbAggressiveness: number, // 0.0 (smooth flat kerb) to 1.0 (sausage kerb)
  suspensionStiffness: number // 0.0 (soft compliance) to 1.0 (stiff race setup)
): number {
  if (kerbAggressiveness <= 0) return 0;
  const verticalUnloadFraction = (kerbAggressiveness * 0.25) * (0.6 + suspensionStiffness * 0.4);
  return Math.min(0.40, verticalUnloadFraction);
}
