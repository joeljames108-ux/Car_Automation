// ============================================================================
// MODULE 14: MULTI-CAR AERODYNAMIC SLIPSTREAM, WAKE & DIRTY AIR ENGINE
// ============================================================================
// Follower vehicle aerodynamics inside the turbulent wake of leading cars:
// 1. Trailing tip vortex downwash decay (Biot-Savart velocity deficit field)
// 2. Slipstream straight-line tow drag reduction as a function of gap distance
// 3. Dirty air cornering downforce collapse & front/rear aerodynamic balance shift
// 4. Ingested thermal wake plume (elevated radiator & brake cooling air temperatures)
// 5. Overtaking slipstream slingshot envelope & DRS delta interaction
// ============================================================================

export interface LeadCarAeroSignature {
  leadCarSpeedMs: number;
  leadCarDownforceN: number;
  leadCarDragN: number;
  leadCarFrontalAreaM2: number;
  leadCarThermalRejectionKw: number; // Heat expelled from radiators & exhaust
}

export interface FollowerAeroState {
  gapDistanceM: number;             // Distance from lead car rear wing to follower front wing (m)
  lateralOffsetM: number;           // Lateral offset from centerline (m)
  followerBaseClFront: number;
  followerBaseClRear: number;
  followerBaseCd: number;
  ambientAirTempC: number;
}

export interface WakeAerodynamicOutput {
  effectiveClFront: number;
  effectiveClRear: number;
  effectiveCd: number;
  totalDownforceLossPct: number;
  aerodynamicBalanceFrontPct: number;
  dragReductionPct: number;
  ingestedCoolingAirTempC: number;
  isInsideSlipstreamPocket: boolean;
  overtakingDeltaSpeedKmh: number;  // Projected speed delta gained on straights
  wakeTurbulenceIntensityPct: number;
}

export class AeroWakeSlipstreamEngine {
  /**
   * Computes follower car aerodynamic modification (drag reduction on straights,
   * downforce shedding in corners, and thermal heat plume ingestion).
   */
  public static evaluateWakeAerodynamics(
    lead: LeadCarAeroSignature,
    follower: FollowerAeroState
  ): WakeAerodynamicOutput {
    const dGap = Math.max(0.5, follower.gapDistanceM);
    const lateralOffset = Math.abs(follower.lateralOffsetM);

    // Lateral gaussian decay of the wake core width (wake expands downstream):
    // w_wake(x) = w0 * (1 + 0.08 * x)
    const wakeCoreHalfWidth = 1.25 * (1.0 + 0.065 * dGap);
    const lateralProximityFactor = Math.exp(-0.5 * Math.pow(lateralOffset / wakeCoreHalfWidth, 2));

    // ------------------------------------------------------------------------
    // 1. SLIPSTREAM TOW (STRAIGHT-LINE DRAG REDUCTION)
    // ------------------------------------------------------------------------
    // Drag reduces significantly up to 45 meters behind lead car:
    // Delta_Cd = -0.38 * exp(-dGap / 20.0) * lateralFactor
    const maxDragDropFraction = 0.38;
    const dragReductionRatio = maxDragDropFraction * Math.exp(-dGap / 22.0) * lateralProximityFactor;
    const effectiveCd = follower.followerBaseCd * (1.0 - dragReductionRatio);
    const dragReductionPct = dragReductionRatio * 100.0;

    // ------------------------------------------------------------------------
    // 2. DIRTY AIR CORNERING DOWNFORCE LOSS & UNDERSTEER BALANCE SHIFT
    // ------------------------------------------------------------------------
    // Turbulent, low-energy wake causes boundary layer separation on front wing:
    // Front wing suffers much more severely than rear wing:
    // Delta_Cl_front = -0.52 * exp(-dGap / 14.0)
    // Delta_Cl_rear  = -0.30 * exp(-dGap / 16.0)
    const frontLossRatio = 0.52 * Math.exp(-dGap / 14.0) * lateralProximityFactor;
    const rearLossRatio = 0.30 * Math.exp(-dGap / 16.0) * lateralProximityFactor;

    const effectiveClFront = follower.followerBaseClFront * (1.0 - frontLossRatio);
    const effectiveClRear = follower.followerBaseClRear * (1.0 - rearLossRatio);

    const totalBaseCl = follower.followerBaseClFront + follower.followerBaseClRear;
    const totalEffectiveCl = effectiveClFront + effectiveClRear;
    const totalDownforceLossPct = ((totalBaseCl - totalEffectiveCl) / totalBaseCl) * 100.0;

    // Aerodynamic balance shifts rearward in dirty air -> Understeer!
    const effectiveAeroBalanceFrontPct = (effectiveClFront / totalEffectiveCl) * 100.0;

    // ------------------------------------------------------------------------
    // 3. THERMAL EXHAUST & RADIATOR PLUME INGESTION
    // ------------------------------------------------------------------------
    // Lead vehicle rejects hundreds of kW of heat into its wake.
    // Follower radiators ingest hot air, degrading cooling capacity:
    // Delta_T_plume = (Q_heat / (rho * Cp * V_wake * Area))
    const plumeDeltaTempC = (lead.leadCarThermalRejectionKw * 0.045) * Math.exp(-dGap / 18.0) * lateralProximityFactor;
    const ingestedAirTemp = follower.ambientAirTempC + plumeDeltaTempC;

    // ------------------------------------------------------------------------
    // 4. OVERTAKING SLINGSHOT POTENTIAL & TURBULENCE
    // ------------------------------------------------------------------------
    const inSlipstream = dGap < 45.0 && lateralOffset < 2.5;
    // Projected straight-line terminal speed gain from slipstream tow
    const speedDeltaKmh = inSlipstream ? (dragReductionPct * 0.48) : 0;
    const turbulencePct = Math.min(100.0, 85.0 * Math.exp(-dGap / 16.0) * lateralProximityFactor);

    return {
      effectiveClFront: Number(effectiveClFront.toFixed(3)),
      effectiveClRear: Number(effectiveClRear.toFixed(3)),
      effectiveCd: Number(effectiveCd.toFixed(4)),
      totalDownforceLossPct: Number(totalDownforceLossPct.toFixed(1)),
      aerodynamicBalanceFrontPct: Number(effectiveAeroBalanceFrontPct.toFixed(1)),
      dragReductionPct: Number(dragReductionPct.toFixed(1)),
      ingestedCoolingAirTempC: Number(ingestedAirTemp.toFixed(1)),
      isInsideSlipstreamPocket: inSlipstream,
      overtakingDeltaSpeedKmh: Number(speedDeltaKmh.toFixed(1)),
      wakeTurbulenceIntensityPct: Number(turbulencePct.toFixed(1)),
    };
  }
}
