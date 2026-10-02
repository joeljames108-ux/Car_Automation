// ===================================================================
// CHIEF POWERTRAIN AGENT — ECU Tuning & Boost Management
// ===================================================================

import { EngineConfig } from "../../types";
import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

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

  static getTuningPreset(preset: TuningPreset, current: Partial<EngineConfig>): TuningRecommendation {
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
      default:
        return {
          preset: "gt3_spec_r",
          title: "🏎️ GT3 Spec-R Motorsport",
          summary: "FIA GT3 Homologated flat-plane V8 (620 HP @ 8,500 RPM) with direct fuel injection and titanium valvetrain.",
          expectedPowerDeltaHp: 160,
          expectedEfficiencyDelta: -0.5,
          knockRiskLevel: "safe",
          changes: {
            layout: "v8",
            redline: 8500,
            rpmLimiter: 8500,
            intake: "na",
            ecuMapMode: "race",
            afr: 12.5,
            ignitionTiming: 32,
            coolingRadiator: 1.0,
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
