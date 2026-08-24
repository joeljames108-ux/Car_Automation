// ===================================================================
// DYNAMIC MULTI-SECTOR TRACK RACING & AI DRIVER AGGRESSION ENGINE
// ===================================================================
// Simulates multi-sector circuit racing (Spa, Nordschleife, Silverstone),
// AI driver aggression profiles, tire wear degradation, fuel mass penalty,
// and real-time pit stop undercut/overcut strategy execution.
// ===================================================================

export interface CircuitSectorInfo {
  sectorId: number; // Sector 1, 2, 3
  sectorName: string;
  lengthMeters: number;
  cornerCount: number;
  maxStraightSpeedKmH: number;
  minApexSpeedKmH: number;
  drsZoneActive: boolean;
}

export interface TrackCircuitConfig {
  id: string;
  name: string;
  country: string;
  totalLengthKm: number;
  sectors: CircuitSectorInfo[];
  baseReferenceLapTimeMs: number;
  trackTemperatureC: number;
  asphaltGripFactor: number; // 0.8 (wet) to 1.15 (rubbered-in dry)
}

export type AiDriverAggression =
  | "CONSERVATIVE_TIRE_SAVER"
  | "BALANCED_CALCULATED"
  | "AGGRESSIVE_LATE_BRAKER"
  | "HIGH_RISK_QUALIFYING_ATTACK";

export interface DriverStintTelemetry {
  currentLap: number;
  totalLaps: number;
  sectorTimesMs: number[]; // [S1, S2, S3]
  totalLapTimeMs: number;
  gapToLeaderSeconds: number;
  tireWearPct: number; // 100% -> 0%
  tireSurfaceTempC: number;
  fuelRemainingKg: number;
  isPittingThisLap: boolean;
  pitStopStrategy: "STAY_OUT" | "PIT_FOR_FRESH_SOFT" | "PIT_FOR_HARD_SLICK";
  driverMistakeOccurred: boolean;
  apexSpeedAvgKmH: number;
}

export const MASTER_RACE_TRACKS: TrackCircuitConfig[] = [
  {
    id: "spa_francorchamps",
    name: "Circuit de Spa-Francorchamps",
    country: "Belgium",
    totalLengthKm: 7.004,
    baseReferenceLapTimeMs: 138500, // 2:18.500
    trackTemperatureC: 28,
    asphaltGripFactor: 1.05,
    sectors: [
      {
        sectorId: 1,
        sectorName: "La Source & Kemmel Straight",
        lengthMeters: 2200,
        cornerCount: 3,
        maxStraightSpeedKmH: 335,
        minApexSpeedKmH: 65,
        drsZoneActive: true,
      },
      {
        sectorId: 2,
        sectorName: "Les Combes & Pouhon Sweep",
        lengthMeters: 3100,
        cornerCount: 9,
        maxStraightSpeedKmH: 270,
        minApexSpeedKmH: 140,
        drsZoneActive: false,
      },
      {
        sectorId: 3,
        sectorName: "Blanchimont & Bus Stop Chicane",
        lengthMeters: 1704,
        cornerCount: 4,
        maxStraightSpeedKmH: 315,
        minApexSpeedKmH: 75,
        drsZoneActive: true,
      },
    ],
  },
  {
    id: "nurburgring_nordschleife",
    name: "Nürburgring Nordschleife (24h Layout)",
    country: "Germany",
    totalLengthKm: 20.832,
    baseReferenceLapTimeMs: 385000, // 6:25.000
    trackTemperatureC: 22,
    asphaltGripFactor: 0.98,
    sectors: [
      {
        sectorId: 1,
        sectorName: "Flugplatz & Schwedenkreuz",
        lengthMeters: 6500,
        cornerCount: 22,
        maxStraightSpeedKmH: 295,
        minApexSpeedKmH: 110,
        drsZoneActive: false,
      },
      {
        sectorId: 2,
        sectorName: "Karussell & Hohe Acht",
        lengthMeters: 7500,
        cornerCount: 38,
        maxStraightSpeedKmH: 260,
        minApexSpeedKmH: 55,
        drsZoneActive: false,
      },
      {
        sectorId: 3,
        sectorName: "Pflanzgarten & Döttinger Höhe",
        lengthMeters: 6832,
        cornerCount: 13,
        maxStraightSpeedKmH: 345,
        minApexSpeedKmH: 130,
        drsZoneActive: true,
      },
    ],
  },
];

export class TrackRacingSimulator {
  /**
   * Simulates a single race lap telemetry tick for a driver on a specific circuit.
   */
  public static simulateRaceLap(params: {
    track: TrackCircuitConfig;
    driverAggression: AiDriverAggression;
    vehicleWeightKg: number;
    vehicleDownforceNAt200: number;
    vehicleHorsepower: number;
    currentTelemetry: DriverStintTelemetry;
  }): DriverStintTelemetry {
    const {
      track,
      driverAggression,
      vehicleWeightKg,
      vehicleDownforceNAt200,
      vehicleHorsepower,
      currentTelemetry,
    } = params;

    // Aggression multipliers
    const aggressionMap: Record<AiDriverAggression, { speedMult: number; wearMult: number; riskPct: number }> = {
      CONSERVATIVE_TIRE_SAVER: { speedMult: 0.985, wearMult: 0.70, riskPct: 0.01 },
      BALANCED_CALCULATED: { speedMult: 1.000, wearMult: 1.00, riskPct: 0.03 },
      AGGRESSIVE_LATE_BRAKER: { speedMult: 1.015, wearMult: 1.45, riskPct: 0.08 },
      HIGH_RISK_QUALIFYING_ATTACK: { speedMult: 1.030, wearMult: 2.10, riskPct: 0.18 },
    };

    const profile = aggressionMap[driverAggression];

    // Weight penalty: ~0.03 sec per kg of extra fuel
    const fuelMassPenaltyMs = currentTelemetry.fuelRemainingKg * 30;

    // Power & Downforce advantage
    const powerAdvantageMs = Math.max(-5000, (600 - vehicleHorsepower) * 8);
    const downforceAdvantageMs = Math.max(-4000, (4000 - vehicleDownforceNAt200) * 0.8);

    // Tire degradation penalty
    const tireGripLossMs = ((100 - currentTelemetry.tireWearPct) / 100) * 4500;

    // Calculate sector times
    const baseLapMs = track.baseReferenceLapTimeMs;
    const netLapMs = Math.max(
      60000,
      (baseLapMs + fuelMassPenaltyMs + powerAdvantageMs + downforceAdvantageMs + tireGripLossMs) / profile.speedMult
    );

    const s1Ms = Math.round(netLapMs * 0.32);
    const s2Ms = Math.round(netLapMs * 0.44);
    const s3Ms = Math.round(netLapMs * 0.24);
    const totalLapTimeMs = s1Ms + s2Ms + s3Ms;

    // Driver mistake check
    const driverMistakeOccurred = Math.random() < profile.riskPct;
    const finalLapMs = driverMistakeOccurred ? totalLapTimeMs + 2500 : totalLapTimeMs;

    // Consume tires and fuel
    const lapTireWear = 3.5 * profile.wearMult * (track.asphaltGripFactor / 1.0);
    const newTireWearPct = Math.max(0, currentTelemetry.tireWearPct - lapTireWear);
    const newFuelKg = Math.max(0, currentTelemetry.fuelRemainingKg - 2.8); // 2.8 kg fuel per lap

    // Pit Strategy Recommendation
    let pitStopStrategy: "STAY_OUT" | "PIT_FOR_FRESH_SOFT" | "PIT_FOR_HARD_SLICK" = "STAY_OUT";
    let isPittingThisLap = false;

    if (newTireWearPct < 25.0) {
      pitStopStrategy = "PIT_FOR_FRESH_SOFT";
      isPittingThisLap = true;
    }

    return {
      currentLap: currentTelemetry.currentLap + 1,
      totalLaps: currentTelemetry.totalLaps,
      sectorTimesMs: [s1Ms, s2Ms, s3Ms],
      totalLapTimeMs: finalLapMs,
      gapToLeaderSeconds: currentTelemetry.gapToLeaderSeconds + (finalLapMs - track.baseReferenceLapTimeMs) / 1000,
      tireWearPct: Number(newTireWearPct.toFixed(1)),
      tireSurfaceTempC: Number((95 + profile.wearMult * 18).toFixed(1)),
      fuelRemainingKg: Number(newFuelKg.toFixed(1)),
      isPittingThisLap,
      pitStopStrategy,
      driverMistakeOccurred,
      apexSpeedAvgKmH: Number((135 * profile.speedMult).toFixed(1)),
    };
  }
}
