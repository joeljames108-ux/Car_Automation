// ===================================================================
// V2X COOPERATIVE PLATOONING & SWARM STABILITY SOLVER
// ===================================================================
// Solves V2X wireless CACC string stability, inter-vehicle spacing,
// aerodynamic drafting slipstream energy reduction, and latency.
// ===================================================================

export interface V2xPlatoonVehicleState {
  positionIndexInPlatoon: number; // 0 = Lead, 1 = Follower 1, 2 = Follower 2...
  interVehicleDistanceMeters: number;
  timeHeadwaySeconds: number;
  aerodynamicDragReductionPct: number;
  fuelEnergySavingsPct: number;
  wirelessSidelinkLatencyMs: number;
  stringStabilityStatus: "STABLE_CONVERGED" | "MARGINAL" | "UNSTABLE_AMPLIFYING";
}

export class V2xPlatooningSolver {
  /**
   * Calculates aerodynamic slipstream drafting savings and string stability for a V2X vehicle convoy.
   */
  public static solvePlatoonDynamics(params: {
    platoonSize: number;
    cruiseSpeedKmH: number;
    targetInterVehicleGapMeters: number;
    sidelinkLatencyMs: number;
  }): V2xPlatoonVehicleState[] {
    const { platoonSize, cruiseSpeedKmH, targetInterVehicleGapMeters, sidelinkLatencyMs } = params;

    const vMs = cruiseSpeedKmH / 3.6;
    const timeHeadwaySeconds = Number((targetInterVehicleGapMeters / vMs).toFixed(2));

    const results: V2xPlatoonVehicleState[] = [];

    // String stability criterion: transfer function H(s) <= 1. Requires latency < 20ms and headway > 0.5s
    const isStringStable = sidelinkLatencyMs <= 20 && timeHeadwaySeconds >= 0.5;
    const stringStabilityStatus = isStringStable ? "STABLE_CONVERGED" : sidelinkLatencyMs <= 35 ? "MARGINAL" : "UNSTABLE_AMPLIFYING";

    for (let i = 0; i < platoonSize; i++) {
      let dragReductionPct = 0;
      let fuelSavingsPct = 0;

      if (i === 0) {
        // Lead vehicle gets ~5% rear pressure push drafting benefit
        dragReductionPct = 5.0;
        fuelSavingsPct = 3.5;
      } else {
        // Follower vehicles in slipstream get massive drag reduction (up to 40% at 5m gap)
        const gapFactor = Math.max(0, 1.0 - targetInterVehicleGapMeters / 25.0);
        dragReductionPct = Number((10.0 + gapFactor * 32.0).toFixed(1));
        fuelSavingsPct = Number((dragReductionPct * 0.75).toFixed(1));
      }

      results.push({
        positionIndexInPlatoon: i,
        interVehicleDistanceMeters: i === 0 ? 0 : targetInterVehicleGapMeters,
        timeHeadwaySeconds: i === 0 ? 0 : timeHeadwaySeconds,
        aerodynamicDragReductionPct: dragReductionPct,
        fuelEnergySavingsPct: fuelSavingsPct,
        wirelessSidelinkLatencyMs: sidelinkLatencyMs + i * 0.5,
        stringStabilityStatus,
      });
    }

    return results;
  }
}
