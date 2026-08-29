// ===================================================================
// APEX ENGINEER — INTERNAL AUTOMOTIVE AI AGENTS ENGINE
// Multi-Agent System: Chief Powertrain Agent, Assembly QA Agent, Race Strategy Agent
// Upgraded with full BaseAgent lifecycle integration
// ===================================================================

import { EngineConfig } from "../types";
import { ComponentId, AssemblyPhase } from "../assemblyTypes";
import { BaseAgent, AgentFinding, AgentIdentity } from "./agentFramework";

export type AgentMode = "powertrain" | "assembly_qa" | "race_strategy" | "chat";
export type TuningPreset =
  | "v12_hybrid_valkyrie"
  | "sprint_race"
  | "high_downforce"
  | "fuel_efficient"
  | "balanced_sport"
  | "gt3_spec_r"
  | "track_attack"
  | "qualifying_max"
  | "endurance_reliability"
  | "eco_lean";

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

const CHIEF_POWERTRAIN_IDENTITY: AgentIdentity = {
  id: "agent_chief_powertrain",
  name: "Chief Powertrain Engineer",
  domain: "powertrain",
  icon: "🏎️",
  color: "#ef4444",
  priority: 10,
  description: "Monitors internal combustion stress, knock thresholds, turbo boost, and power output.",
  capabilities: ["ECU Tuning", "Boost Management", "Knock Prevention", "Fuel Map Optimization"],
};

// ── 1. CHIEF POWERTRAIN TUNING AGENT ──
export class ChiefPowertrainAgent extends BaseAgent {
  constructor() {
    super(CHIEF_POWERTRAIN_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const config = designState?.engine || {};
    const knockRisk = simState?.knockRisk || 0.1;
    const boost = simState?.boostPressure || config.boostPressure || 0;
    const afr = config.afr || 14.0;
    const powerHp = simState?.peakPower || 400;

    // 1. High Knock Risk Alert
    if (knockRisk > 0.55 || (boost > 2.0 && afr > 13.0)) {
      findings.push({
        id: `powertrain_knock_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "critical",
        category: "Engine Detonation",
        title: "High Knock & Detonation Risk Detected",
        detail: `Boost pressure (${boost.toFixed(1)} bar) with lean AFR (${afr.toFixed(1)}) increases detonation & piston crown melt risk.`,
        metrics: { knockRisk, boostPressure: boost, afr },
        recommendation: {
          id: "rec_enrich_afr",
          agentId: this.identity.id,
          title: "Enrich Air-Fuel Ratio (12.2:1) & Retard Ignition Timing 3°",
          description: "Enriches fuel charge to cool cylinder temperatures and eliminate pre-ignition knock.",
          impact: [{ metric: "Knock Risk Level", currentValue: Math.round(knockRisk * 100), projectedValue: 12, unit: "%" }],
          tradeoffs: ["Minor increase in fuel consumption (+0.4 L/lap)"],
          confidence: 0.98,
          changes: { afr: 12.2, ignitionTiming: Math.max(16, (config.ignitionTiming || 24) - 3) },
          autoApplyable: true,
        },
        relatedAgents: ["agent_thermal", "agent_race_strategy"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }

  /**
   * Static helper for backward compatibility with UI components
   */
  static getTuningPreset(preset: TuningPreset, current: Partial<EngineConfig>): TuningRecommendation {
    const isForced = current.intake && current.intake !== "na";

    switch (preset) {
      case "v12_hybrid_valkyrie":
        return {
          preset: "v12_hybrid_valkyrie",
          title: "🔥 1,000 HP V12 Hybrid Valkyrie",
          summary: "Atmospheric 6.4L V12 screaming to 9,200 RPM coupled with 180kW Solid-State P2 PHEV electric motor for instantaneous torque fill.",
          expectedPowerDeltaHp: 350,
          expectedEfficiencyDelta: 0.5,
          knockRiskLevel: "safe",
          changes: {
            layout: "v12",
            bore: 92,
            stroke: 80,
            redline: 9200,
            rpmLimiter: 9200,
            valvetrain: "dohc_vvl",
            crank: "forged_steel",
            pistons: "forged",
            intake: "na",
            fuelSystem: "direct",
            hybridArchitecture: "phev",
            hybridMotorPower: 180,
            batteryCapacity: 16,
            batteryChemistry: "solid_state",
            motorPlacement: "p2",
            powerElectronicsType: "silicon_carbide_sic",
            voltageArchitecture: 800,
            ecuMapMode: "race",
            afr: 12.5,
            ignitionTiming: 32,
            coolingRadiator: 1.0,
            coolingOilCooler: 1.0,
          },
        };

      case "sprint_race":
        return {
          preset: "sprint_race",
          title: "🏁 Sprint Race Attack Spec",
          summary: "9000 RPM Twin-Turbo V8 pushing 1.6 bar boost with aggressive cam profile and high knock resistance for sprint dominance.",
          expectedPowerDeltaHp: 220,
          expectedEfficiencyDelta: -0.8,
          knockRiskLevel: "moderate",
          changes: {
            layout: "v8",
            bore: 88,
            stroke: 82,
            redline: 9000,
            rpmLimiter: 9000,
            intake: "twin_turbo",
            boostPressure: 1.6,
            ecuMapMode: "race",
            afr: 12.0,
            ignitionTiming: 30,
            camDuration: 305,
            camLift: 13.8,
            intercoolerEff: 0.95,
            coolingRadiator: 1.0,
          },
        };

      case "high_downforce":
        return {
          preset: "high_downforce",
          title: "🌪️ Monaco High Downforce Spec",
          summary: "High-response twin-turbo V6 tuned for instantaneous low-end punch to capitalize on massive aerodynamic ground-effect cornering grip.",
          expectedPowerDeltaHp: 120,
          expectedEfficiencyDelta: -0.2,
          knockRiskLevel: "safe",
          changes: {
            layout: "v6",
            redline: 8500,
            rpmLimiter: 8500,
            intake: "twin_turbo",
            boostPressure: 1.4,
            ecuMapMode: "sport",
            afr: 12.3,
            ignitionTiming: 28,
            intercoolerEff: 0.92,
            coolingRadiator: 0.95,
          },
        };

      case "fuel_efficient":
        return {
          preset: "fuel_efficient",
          title: "🌱 EcoStream Hybrid Endurance",
          summary: "Atkinson cycle I4 with 80kW electric motor and 14 kWh battery, running lean AFR 14.7:1 for 43%+ thermal efficiency.",
          expectedPowerDeltaHp: -60,
          expectedEfficiencyDelta: 2.4,
          knockRiskLevel: "safe",
          changes: {
            layout: "i4",
            hybridArchitecture: "phev",
            hybridMotorPower: 80,
            batteryCapacity: 14,
            ecuMapMode: "economy",
            afr: 14.7,
            ignitionTiming: 20,
            hasStartStop: true,
            boostPressure: 0,
            coolingRadiator: 0.8,
          },
        };

      case "balanced_sport":
        return {
          preset: "balanced_sport",
          title: "⚖️ Balanced Sport GT Spec",
          summary: "Smooth 3.0L Twin-Turbo V6 (460 HP) delivering wide powerband, compliant NVH, and high thermal margins.",
          expectedPowerDeltaHp: 60,
          expectedEfficiencyDelta: 0.2,
          knockRiskLevel: "safe",
          changes: {
            layout: "v6",
            redline: 7500,
            rpmLimiter: 7500,
            intake: "twin_turbo",
            boostPressure: 1.1,
            ecuMapMode: "sport",
            afr: 12.8,
            ignitionTiming: 26,
            coolingRadiator: 0.9,
          },
        };

      case "gt3_spec_r":
        return {
          preset: "gt3_spec_r",
          title: "🏎️ Apex GT3 Spec-R Motorsport",
          summary: "FIA GT3 Homologated flat-plane V8 (620 HP @ 8,500 RPM) with direct fuel injection and titanium valvetrain.",
          expectedPowerDeltaHp: 160,
          expectedEfficiencyDelta: -0.5,
          knockRiskLevel: "safe",
          changes: {
            layout: "v8",
            redline: 8500,
            rpmLimiter: 8500,
            valvetrain: "dohc_vvl",
            crank: "forged_steel",
            pistons: "forged",
            intake: "na",
            fuelSystem: "direct",
            ecuMapMode: "race",
            afr: 12.4,
            ignitionTiming: 32,
            camDuration: 300,
            camLift: 13.5,
            coolingRadiator: 1.0,
            coolingOilCooler: 1.0,
          },
        };

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

const ASSEMBLY_QA_IDENTITY: AgentIdentity = {
  id: "agent_assembly_qa",
  name: "Robotic Assembly Inspector",
  domain: "assembly_qa",
  icon: "🤖",
  color: "#d97706",
  priority: 9,
  description: "Verifies modular assembly component torque specs, deck clearances, gasket seating, and sequence lock.",
  capabilities: ["Torque Verification", "Deck Clearance Check", "Missing Component Detection", "Assembly QA"],
};

// ── 2. ROBOTIC ASSEMBLY QA INSPECTION AGENT ──
export class RoboticAssemblyQAAgent extends BaseAgent {
  constructor() {
    super(ASSEMBLY_QA_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const installedCount = simState?.installedComponentsCount || 8;

    if (installedCount < 12) {
      findings.push({
        id: `qa_incomplete_assembly_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Assembly QA",
        title: "Modular Vehicle Subsystem Assembly Incomplete",
        detail: `Only ${installedCount}/12 required core vehicle components are installed on chassis hardpoints.`,
        metrics: { installedCount, totalComponents: 12 },
        recommendation: undefined,
        relatedAgents: ["agent_manufacturing", "agent_chassis"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }

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

// ── 3. MOTORSPORT RACE STRATEGY AGENT ──
export class RaceStrategyAgent extends BaseAgent {
  constructor() {
    super(RACE_STRATEGY_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
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
