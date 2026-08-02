// ===================================================================
// APEX ENGINEER — INTERNAL AUTOMOTIVE AI AGENTS ENGINE
// Multi-Agent System: Chief Powertrain Agent, Assembly QA Agent, Race Strategy Agent
// ===================================================================

import { EngineConfig } from "../types";
import { ComponentId, AssemblyPhase } from "../assemblyTypes";

export type AgentMode = "powertrain" | "assembly_qa" | "race_strategy" | "chat";
export type TuningPreset = "track_attack" | "qualifying_max" | "endurance_reliability" | "eco_lean";

export interface TuningRecommendation {
  preset: TuningPreset;
  title: string;
  summary: string;
  expectedPowerDeltaHp: number;
  expectedEfficiencyDelta: number;
  knockRiskLevel: "safe" | "moderate" | "high";
  changes: Partial<EngineConfig>;
}

export interface AssemblyQAReport {
  installedCount: number;
  totalComponents: 12;
  qualityScore: number; // 0 - 100%
  torqueVerification: "verified" | "pending" | "warning";
  deckClearanceMm: number;
  thermalExpansionRisk: "low" | "medium" | "critical";
  insights: string[];
}

export interface TrackCircuitPrediction {
  circuitName: string;
  lapTimeFormatted: string;
  topSpeedKmh: number;
  tireDegradationPercentPerLap: number;
  fuelBurnLitersPerLap: number;
  optimalPitLap: number;
}

// ── 1. CHIEF POWERTRAIN TUNING AGENT ──
export class ChiefPowertrainAgent {
  /**
   * Generates tailored auto-tuning recommendations and parameter sets for 4 presets
   */
  static getTuningPreset(preset: TuningPreset, current: Partial<EngineConfig>): TuningRecommendation {
    const isForced = current.intake && current.intake !== "na";

    switch (preset) {
      case "track_attack":
        return {
          preset: "track_attack",
          title: "🏎️ Track Attack (Balanced Performance)",
          summary: "Optimized boost pressure, AFR 12.2:1, and advance ignition timing for maximum thermal endurance on circuit sessions.",
          expectedPowerDeltaHp: isForced ? 85 : 35,
          expectedEfficiencyDelta: -0.4,
          knockRiskLevel: "safe",
          changes: {
            ecuMapMode: "sport",
            afr: 12.2,
            ignitionTiming: 28,
            boostPressure: isForced ? Math.min(2.4, (current.boostPressure || 1.2) + 0.4) : 0,
            intercoolerEff: 0.9,
            coolingRadiator: 0.95,
            coolingOilCooler: 0.9,
            camDuration: 290,
            camLift: 12.5,
          },
        };

      case "qualifying_max":
        return {
          preset: "qualifying_max",
          title: "⚡ Qualifying 100% Boost (Maximum Output)",
          summary: "Pushes maximum allowable turbo boost pressure, high RPM ceiling, and aggressive ignition timing for single flying laps.",
          expectedPowerDeltaHp: isForced ? 160 : 65,
          expectedEfficiencyDelta: -1.2,
          knockRiskLevel: "moderate",
          changes: {
            ecuMapMode: "race",
            afr: 11.8,
            ignitionTiming: 34,
            boostPressure: isForced ? Math.min(3.8, (current.boostPressure || 1.2) + 1.2) : 0,
            intercoolerEff: 0.95,
            rpmLimiter: Math.min(10500, (current.rpmLimiter || 8000) + 1200),
            coolingRadiator: 1.0,
            camDuration: 310,
            camLift: 14.5,
          },
        };

      case "endurance_reliability":
        return {
          preset: "endurance_reliability",
          title: "🛡️ Endurance Reliability (24h Safety)",
          summary: "Enriches AFR slightly, reduces thermal peak stress, and activates maximum cooling pump flow to guarantee 100% reliability.",
          expectedPowerDeltaHp: -15,
          expectedEfficiencyDelta: 0.8,
          knockRiskLevel: "safe",
          changes: {
            ecuMapMode: "balanced",
            afr: 12.8,
            ignitionTiming: 24,
            boostPressure: isForced ? Math.max(0.8, (current.boostPressure || 1.2) - 0.2) : 0,
            coolingRadiator: 1.0,
            coolingOilCooler: 1.0,
            coolingWaterPump: 1.0,
            intercoolerEff: 0.85,
          },
        };

      case "eco_lean":
      default:
        return {
          preset: "eco_lean",
          title: "🍃 Eco Lean-Burn (High Efficiency)",
          summary: "Sets 14.7:1 stoichiometric AFR, enables Start-Stop tech, and optimizes BSFC for minimal fuel consumption.",
          expectedPowerDeltaHp: -40,
          expectedEfficiencyDelta: 1.8,
          knockRiskLevel: "safe",
          changes: {
            ecuMapMode: "economy",
            afr: 14.5,
            ignitionTiming: 22,
            hasStartStop: true,
            boostPressure: isForced ? 0.6 : 0,
            coolingFanSpeed: 0.5,
          },
        };
    }
  }

  /**
   * Generates live tuning diagnostics based on current engine parameters
   */
  static diagnose(config: Partial<EngineConfig>): string[] {
    const insights: string[] = [];
    const afr = config.afr || 14.0;
    const boost = config.boostPressure || 0;
    const timing = config.ignitionTiming || 20;

    if (boost > 2.0 && afr > 13.0) {
      insights.push("⚠️ CRITICAL: High boost pressure (>2.0 bar) with lean AFR (>13.0) increases detonation & piston melt risk.");
    } else if (boost > 1.2 && afr <= 12.5) {
      insights.push("✅ EXCELLENT: Rich fuel mixture protects piston crowns under forced induction boost.");
    }

    if (timing > 32) {
      insights.push("⚡ ADVANCED TIMING: High ignition advance (>32° BTDC) boosts high-RPM horsepower but requires 98+ RON fuel.");
    }

    if ((config.rpmLimiter || 7000) > 9000 && config.pistons !== "forged" && config.pistons !== "billet") {
      insights.push("💡 RECOMMENDATION: Upgrade to Forged Billet Pistons for high-RPM operation above 9,000 RPM.");
    }

    return insights;
  }
}

// ── 2. ROBOTIC ASSEMBLY QA INSPECTION AGENT ──
export class RoboticAssemblyQAAgent {
  static inspectAssembly(installed: ComponentId[], activeId: ComponentId | null, phase: AssemblyPhase): AssemblyQAReport {
    const installedCount = installed.length;
    const qualityScore = Math.min(100, Math.round((installedCount / 12) * 95 + (installed.includes("head_gasket") ? 5 : 0)));

    const insights: string[] = [];

    if (installed.includes("block") && installed.includes("crankshaft")) {
      insights.push("✅ MAIN BEARINGS VERIFIED: Journal clearances within 0.035mm OEM specification.");
    }

    if (installed.includes("head_gasket")) {
      insights.push("✅ HEAD GASKET SEALED: MLS copper stopper beads seated against deck flange.");
    } else if (installed.includes("cylinder_head") && !installed.includes("head_gasket")) {
      insights.push("⚠️ WARNING: Cylinder head installed without head gasket! Compression leak risk.");
    }

    if (phase === "inserting" || phase === "locking") {
      insights.push("🔧 TORQUE SEQUENCE ACTIVE: Applying 85 Nm cross-pattern hex bolt torque.");
    }

    if (installed.includes("turbocharger")) {
      insights.push("🌀 TURBOCHARGER ALIGNED: Oil feed lines and exhaust manifold collector flange pressure tested.");
    }

    return {
      installedCount,
      totalComponents: 12,
      qualityScore,
      torqueVerification: phase === "locking" || installedCount > 6 ? "verified" : "pending",
      deckClearanceMm: 0.85,
      thermalExpansionRisk: installedCount > 8 ? "low" : "medium",
      insights,
    };
  }
}

// ── 3. MOTORSPORT RACE STRATEGY AGENT ──
export class RaceStrategyAgent {
  static predictCircuits(powerHp: number, weightKg: number, downforceLevel: number = 0.5): TrackCircuitPrediction[] {
    const p2w = powerHp / Math.max(400, weightKg);

    // Nürburgring Nordschleife
    const nurburgringSecs = Math.max(380, 520 - p2w * 180 - downforceLevel * 15);
    const nurbMins = Math.floor(nurburgringSecs / 60);
    const nurbRemainderSecs = (nurburgringSecs % 60).toFixed(2);
    const nurbFormatted = `${nurbMins}:${Number(nurbRemainderSecs) < 10 ? "0" : ""}${nurbRemainderSecs}`;

    // Spa-Francorchamps
    const spaSecs = Math.max(122, 175 - p2w * 52);
    const spaMins = Math.floor(spaSecs / 60);
    const spaRemainderSecs = (spaSecs % 60).toFixed(2);
    const spaFormatted = `${spaMins}:${Number(spaRemainderSecs) < 10 ? "0" : ""}${spaRemainderSecs}`;

    // Circuit de la Sarthe (Le Mans)
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
