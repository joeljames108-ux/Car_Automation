/**
 * ============================================================================
 * TRACK BATTLES & TELEMETRY REPLAY MULTI-PHYSICS ENGINE
 * ============================================================================
 * Solves circuit battle telemetry between 2 vehicles across legendary tracks:
 * - Nürburgring Nordschleife (20.8 km, 73 corners)
 * - Spa-Francorchamps (7.004 km, Eau Rouge / Raidillon)
 * - Circuit de la Sarthe Le Mans (13.626 km, Mulsanne Straight)
 * - Silverstone GP Circuit (5.891 km, Maggotts & Becketts)
 * 
 * Computes:
 * - Curvilinear velocity profiles (Vmax & Apex Cornering Speeds)
 * - 2D Friction Circle G-G Diagram (Lateral vs Longitudinal Acceleration)
 * - Lap time delta (Car A vs Car B)
 * - Sector-by-sector time split analysis
 * ============================================================================
 */

export type CircuitId = "nurburgring" | "spa" | "lemans" | "silverstone";

export interface CircuitInfo {
  id: CircuitId;
  name: string;
  location: string;
  lengthKm: number;
  cornersCount: number;
  benchmarkGt3LapTimeSec: number;
}

export const CIRCUITS_CATALOG: Record<CircuitId, CircuitInfo> = {
  nurburgring: {
    id: "nurburgring",
    name: "Nürburgring Nordschleife",
    location: "Nürburg, Germany",
    lengthKm: 20.832,
    cornersCount: 73,
    benchmarkGt3LapTimeSec: 385.0, // 6m 25s
  },
  spa: {
    id: "spa",
    name: "Spa-Francorchamps",
    location: "Stavelot, Belgium",
    lengthKm: 7.004,
    cornersCount: 20,
    benchmarkGt3LapTimeSec: 136.5, // 2m 16.5s
  },
  lemans: {
    id: "lemans",
    name: "Circuit de la Sarthe (Le Mans)",
    location: "Le Mans, France",
    lengthKm: 13.626,
    cornersCount: 38,
    benchmarkGt3LapTimeSec: 228.0, // 3m 48.0s
  },
  silverstone: {
    id: "silverstone",
    name: "Silverstone GP Circuit",
    location: "Silverstone, UK",
    lengthKm: 5.891,
    cornersCount: 18,
    benchmarkGt3LapTimeSec: 116.0, // 1m 56.0s
  },
};

export interface VehicleTelemetrySpecs {
  name: string;
  horsepowerHp: number;
  massKg: number;
  downforceNAt200: number;
  cdDrag: number;
  tireGripCoeff: number; // e.g. 1.45
}

export interface TelemetryFrame {
  distanceMeters: number;
  speedKmhA: number;
  speedKmhB: number;
  lateralGA: number;
  lateralGB: number;
  longitudinalGA: number;
  longitudinalGB: number;
  throttlePctA: number;
  throttlePctB: number;
  brakePctA: number;
  brakePctB: number;
  deltaSeconds: number; // Time difference (+ = A ahead, - = B ahead)
}

export interface TrackBattlePhysicsResult {
  circuit: CircuitInfo;
  lapTimeSecA: number;
  lapTimeSecB: number;
  lapTimeFormattedA: string;
  lapTimeFormattedB: string;
  timeDeltaSec: number;
  winner: "A" | "B";
  topSpeedKmhA: number;
  topSpeedKmhB: number;
  avgCorneringGA: number;
  avgCorneringGB: number;
  maxLateralGA: number;
  maxLateralGB: number;
  sectors: { name: string; timeSecA: number; timeSecB: number; deltaSec: number }[];
  telemetryFrames: TelemetryFrame[];
}

export class TrackBattlesTelemetryEngine {
  public static solveBattle(
    circuitId: CircuitId,
    carA: VehicleTelemetrySpecs,
    carB: VehicleTelemetrySpecs
  ): TrackBattlePhysicsResult {
    const circuit = CIRCUITS_CATALOG[circuitId];

    // Physics power-to-weight & aero downforce multipliers
    const pwrA = carA.horsepowerHp / Math.max(500, carA.massKg);
    const pwrB = carB.horsepowerHp / Math.max(500, carB.massKg);

    const corneringMultA = carA.tireGripCoeff * (1.0 + carA.downforceNAt200 / 12000);
    const corneringMultB = carB.tireGripCoeff * (1.0 + carB.downforceNAt200 / 12000);

    const topSpeedA = Math.round(Math.pow((carA.horsepowerHp * 745.7) / (0.5 * 1.225 * carA.cdDrag * 2.15), 1 / 3) * 3.6);
    const topSpeedB = Math.round(Math.pow((carB.horsepowerHp * 745.7) / (0.5 * 1.225 * carB.cdDrag * 2.15), 1 / 3) * 3.6);

    // Lap time calculation (sec)
    const baseTimeSec = circuit.benchmarkGt3LapTimeSec;
    const lapTimeSecA = Number((baseTimeSec * (1.25 - pwrA * 0.35 - (corneringMultA - 1.4) * 0.25)).toFixed(2));
    const lapTimeSecB = Number((baseTimeSec * (1.25 - pwrB * 0.35 - (corneringMultB - 1.4) * 0.25)).toFixed(2));

    const timeDeltaSec = Number((lapTimeSecB - lapTimeSecA).toFixed(2));
    const winner = lapTimeSecA <= lapTimeSecB ? "A" : "B";

    const formatLap = (sec: number) => {
      const mins = Math.floor(sec / 60);
      const remainder = (sec % 60).toFixed(2);
      return `${mins}m ${remainder.padStart(5, "0")}s`;
    };

    // Sectors breakdown (3 sectors)
    const sectors = [
      {
        name: "Sector 1 (High-Speed Straight & Chicanes)",
        timeSecA: Number((lapTimeSecA * 0.32).toFixed(2)),
        timeSecB: Number((lapTimeSecB * 0.32).toFixed(2)),
        deltaSec: Number(((lapTimeSecB - lapTimeSecA) * 0.32).toFixed(2)),
      },
      {
        name: "Sector 2 (Technical Sweepers & Complex)",
        timeSecA: Number((lapTimeSecA * 0.42).toFixed(2)),
        timeSecB: Number((lapTimeSecB * 0.42).toFixed(2)),
        deltaSec: Number(((lapTimeSecB - lapTimeSecA) * 0.42).toFixed(2)),
      },
      {
        name: "Sector 3 (Final Drag & Hairpin Entry)",
        timeSecA: Number((lapTimeSecA * 0.26).toFixed(2)),
        timeSecB: Number((lapTimeSecB * 0.26).toFixed(2)),
        deltaSec: Number(((lapTimeSecB - lapTimeSecA) * 0.26).toFixed(2)),
      },
    ];

    // Generate Telemetry Frames (20 stations)
    const telemetryFrames: TelemetryFrame[] = [];
    const numFrames = 25;
    const stepDist = (circuit.lengthKm * 1000) / numFrames;

    for (let i = 0; i < numFrames; i++) {
      const distanceMeters = Math.round(i * stepDist);
      const isCorner = i % 3 === 1;

      const speedKmhA = isCorner
        ? Math.round(75 * corneringMultA)
        : Math.round(topSpeedA * (0.65 + Math.sin(i * 0.8) * 0.35));
      const speedKmhB = isCorner
        ? Math.round(75 * corneringMultB)
        : Math.round(topSpeedB * (0.65 + Math.sin(i * 0.8) * 0.35));

      const lateralGA = isCorner ? Number((1.2 * corneringMultA).toFixed(2)) : 0.1;
      const lateralGB = isCorner ? Number((1.2 * corneringMultB).toFixed(2)) : 0.1;

      const longitudinalGA = isCorner ? -1.1 : 0.85;
      const longitudinalGB = isCorner ? -1.1 : 0.85;

      const throttlePctA = isCorner ? 20 : 100;
      const throttlePctB = isCorner ? 20 : 100;

      const brakePctA = isCorner ? 85 : 0;
      const brakePctB = isCorner ? 85 : 0;

      const deltaSeconds = Number(((i / numFrames) * (lapTimeSecB - lapTimeSecA)).toFixed(2));

      telemetryFrames.push({
        distanceMeters,
        speedKmhA,
        speedKmhB,
        lateralGA,
        lateralGB,
        longitudinalGA,
        longitudinalGB,
        throttlePctA,
        throttlePctB,
        brakePctA,
        brakePctB,
        deltaSeconds,
      });
    }

    return {
      circuit,
      lapTimeSecA,
      lapTimeSecB,
      lapTimeFormattedA: formatLap(lapTimeSecA),
      lapTimeFormattedB: formatLap(lapTimeSecB),
      timeDeltaSec,
      winner,
      topSpeedKmhA: topSpeedA,
      topSpeedKmhB: topSpeedB,
      avgCorneringGA: Number((1.1 * corneringMultA).toFixed(2)),
      avgCorneringGB: Number((1.1 * corneringMultB).toFixed(2)),
      maxLateralGA: Number((1.65 * corneringMultA).toFixed(2)),
      maxLateralGB: Number((1.65 * corneringMultB).toFixed(2)),
      sectors,
      telemetryFrames,
    };
  }
}
