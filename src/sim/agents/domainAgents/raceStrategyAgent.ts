// ===================================================================
// RACE STRATEGY AGENT — Circuit Lap Time & Pit Strategy Prediction
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

export interface TrackCircuitPrediction {
  circuitName: string;
  lapTimeFormatted: string;
  topSpeedKmh: number;
  tireDegradationPercentPerLap: number;
  fuelBurnLitersPerLap: number;
  optimalPitLap: number;
}

const RACE_STRATEGY_IDENTITY: AgentIdentity = {
  id: "agent_race_strategy",
  name: "Race Operations Strategist",
  domain: "race_strategy",
  icon: "🏁",
  color: "#f43f5e",
  priority: 9,
  description: "Simulates circuit lap times (Nürburgring, Spa, Le Mans), fuel burn rates, optimal pit windows, and pace.",
  capabilities: ["Circuit Lap Prediction", "Pit Strategy", "Fuel Burn Rate", "Pace Optimization"],
};

export class RaceStrategyAgent extends BaseAgent {
  constructor() {
    super(RACE_STRATEGY_IDENTITY);
  }

  public analyze(_designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const power = simState?.power || 400;
    const weight = simState?.weight || 1500;

    const predictions = RaceStrategyAgent.predictCircuits(power, weight);
    const nurb = predictions[0];

    findings.push({
      id: `race_nurburgring_predict_${Date.now()}`,
      agentId: this.identity.id,
      domain: this.identity.domain,
      severity: "info",
      category: "Circuit Telemetry",
      title: `Nürburgring Lap Time Target: ${nurb.lapTimeFormatted}`,
      detail: `Predicted top speed ${nurb.topSpeedKmh} km/h on Döttinger Höhe straight. Optimal pit window: lap ${nurb.optimalPitLap}.`,
      metrics: { topSpeedKmh: nurb.topSpeedKmh, optimalPitLap: nurb.optimalPitLap },
      relatedAgents: ["agent_tyres", "agent_aerodynamics"],
      timestamp: Date.now(),
    });

    return findings;
  }

  static predictCircuits(powerHp: number, weightKg: number, downforceLevel: number = 0.5): TrackCircuitPrediction[] {
    const p2w = powerHp / Math.max(400, weightKg);

    const nurburgringSecs = Math.max(380, 520 - p2w * 180 - downforceLevel * 15);
    const nurbMins = Math.floor(nurburgringSecs / 60);
    const nurbRemainderSecs = (nurburgringSecs % 60).toFixed(2);
    const nurbFormatted = `${nurbMins}:${Number(nurbRemainderSecs) < 10 ? "0" : ""}${nurbRemainderSecs}`;

    const spaSecs = Math.max(122, 175 - p2w * 52);
    const spaMins = Math.floor(spaSecs / 60);
    const spaRemainderSecs = (spaSecs % 60).toFixed(2);
    const spaFormatted = `${spaMins}:${Number(spaRemainderSecs) < 10 ? "0" : ""}${spaRemainderSecs}`;

    const leMansSecs = Math.max(200, 260 - p2w * 80);
    const leMansMins = Math.floor(leMansSecs / 60);
    const leMansRemainderSecs = (leMansSecs % 60).toFixed(2);
    const leMansFormatted = `${leMansMins}:${Number(leMansRemainderSecs) < 10 ? "0" : ""}${leMansRemainderSecs}`;

    return [
      {
        circuitName: "Nürburgring Nordschleife (20.8 km)",
        lapTimeFormatted: nurbFormatted,
        topSpeedKmh: Math.min(380, Math.round(240 + p2w * 110)),
        tireDegradationPercentPerLap: 3.4,
        fuelBurnLitersPerLap: Math.round(4.2 + (powerHp / 300) * 1.5),
        optimalPitLap: 4,
      },
      {
        circuitName: "Spa-Francorchamps (7.0 km)",
        lapTimeFormatted: spaFormatted,
        topSpeedKmh: Math.min(360, Math.round(230 + p2w * 95)),
        tireDegradationPercentPerLap: 1.8,
        fuelBurnLitersPerLap: Math.round(2.1 + (powerHp / 300) * 0.8),
        optimalPitLap: 12,
      },
      {
        circuitName: "Circuit de la Sarthe / Le Mans (13.6 km)",
        lapTimeFormatted: leMansFormatted,
        topSpeedKmh: Math.min(410, Math.round(260 + p2w * 130)),
        tireDegradationPercentPerLap: 2.6,
        fuelBurnLitersPerLap: Math.round(3.8 + (powerHp / 300) * 1.2),
        optimalPitLap: 8,
      },
    ];
  }
}
