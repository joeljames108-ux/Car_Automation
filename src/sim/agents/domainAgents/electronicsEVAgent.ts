// ===================================================================
// ELECTRONICS & EV AGENT — 800V Architecture, Battery & Regen Tuning
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const ELECTRONICS_IDENTITY: AgentIdentity = {
  id: "agent_electronics",
  name: "Electronics & EV Systems Agent",
  domain: "electronics",
  icon: "⚡",
  color: "#0284c7",
  priority: 7,
  description: "Supervises 800V inverter efficiency, battery cell thermal balancing, motor placement, and EV regen curves.",
  capabilities: ["Battery Management", "Inverter Efficiency", "Regen Curve Tuning", "Infotainment Power Load"],
};

export class ElectronicsEVAgent extends BaseAgent {
  constructor() {
    super(ELECTRONICS_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const engine = designState?.engine || {};
    const isHybridOrEV = engine.layout === "electric" || engine.layout === "hybrid" || engine.hybridArchitecture !== "none";
    const batteryCapacity = simState?.batteryCapacity || engine.batteryCapacity || 0;
    const regenEfficiency = simState?.regenEfficiency || 0.65;

    if (isHybridOrEV && batteryCapacity > 0) {
      // 1. Low Regenerative Brake Energy Recovery Efficiency
      if (regenEfficiency < 0.78) {
        findings.push({
          id: `ev_low_regen_${Date.now()}`,
          agentId: this.identity.id,
          domain: this.identity.domain,
          severity: "warning",
          category: "Regen Energy Recovery",
          title: "Suboptimal Regenerative Brake Energy Recovery",
          detail: `Regen efficiency is ${Math.round(regenEfficiency * 100)}%. Upgrading to Silicon Carbide (SiC) Inverters boosts recovery efficiency to 88%.`,
          metrics: { regenEfficiency, batteryCapacityKwh: batteryCapacity },
          recommendation: {
            id: "rec_upgrade_sic_inverter",
            agentId: this.identity.id,
            title: "Upgrade to 800V SiC (Silicon Carbide) Dual Inverter Module",
            description: "Reduces switching thermal losses by 60% and increases electric driving range by +18 km per charge.",
            impact: [
              { metric: "Regen Efficiency", currentValue: Math.round(regenEfficiency * 100), projectedValue: 88, unit: "%" },
              { metric: "EV Range Delta", currentValue: 0, projectedValue: 18, unit: "km" },
            ],
            tradeoffs: ["+$1,800 inverter component cost"],
            confidence: 0.95,
            changes: { inverterType: "sic_800v", regenLevel: 0.88 },
            autoApplyable: true,
          },
          relatedAgents: ["agent_brakes", "agent_thermal"],
          timestamp: Date.now(),
        });
      }
    }

    return findings;
  }
}
