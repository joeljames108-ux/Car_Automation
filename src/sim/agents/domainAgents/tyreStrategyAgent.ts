// ===================================================================
// TYRE STRATEGY AGENT — Tyre Compound, Thermal Window & Wear Rate
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const TYRE_IDENTITY: AgentIdentity = {
  id: "agent_tyres",
  name: "Tyre Compound Strategist",
  domain: "tyres",
  icon: "🛞",
  color: "#eab308",
  priority: 8,
  description: "Optimizes tyre compound selection, thermal operating window, wear rate per lap, and contact patch friction.",
  capabilities: ["Compound Matching", "Wear Rate Prediction", "Thermal Window Monitoring", "Grip Coefficient"],
};

export class TyreStrategyAgent extends BaseAgent {
  constructor() {
    super(TYRE_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const tyreType = designState?.vehicle?.tyres || "street_performance";
    const gripCoeff = simState?.gripCoefficient || 1.1;
    const wearRate = simState?.tyreWearPercentPerLap || 2.4;

    if (designState?.carConcept === "track" && tyreType === "budget_allseason") {
      findings.push({
        id: `tyre_mismatch_track_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "critical",
        category: "Tyre Compound Mismatch",
        title: "All-Season Tyre Compound Inadequate for Circuit Track Use",
        detail: "Hard all-season compound overheats and greases over within 2 laps of high-g cornering.",
        metrics: { gripCoefficient: gripCoeff, tyreWearPercentPerLap: wearRate },
        recommendation: {
          id: "rec_upgrade_semi_slick",
          agentId: this.identity.id,
          title: "Switch to Semi-Slick R-Compound Track Tyres (200 Treadwear)",
          description: "Increases lateral grip coefficient from 1.10 to 1.42 with 85°C optimal thermal window.",
          impact: [{ metric: "Peak Lateral Grip", currentValue: gripCoeff, projectedValue: 1.42, unit: "µ" }],
          tradeoffs: ["Reduced wet weather hydroplaning resistance"],
          confidence: 0.96,
          changes: { tyres: "semi_slick_200tw" },
          autoApplyable: true,
        },
        relatedAgents: ["agent_suspension", "agent_race_strategy"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}
