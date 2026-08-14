// ===================================================================
// SUPPLY CHAIN RESILIENCE AGENT — Raw Material Scarcity & Bottlenecks
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const SUPPLY_CHAIN_IDENTITY: AgentIdentity = {
  id: "agent_supply_chain",
  name: "Supply Chain Resilience Strategist",
  domain: "supply_chain",
  icon: "📦",
  color: "#64748b",
  priority: 5,
  description: "Tracks raw material scarcity (Lithium, Neodymium, Carbon tow, Titanium), supplier lead-time bottlenecks, and tariff impacts.",
  capabilities: ["Material Risk Index", "Supplier Lead Time Audit", "Single-Source Vendor Check", "Tariff Exposure Calc"],
};

export class SupplyChainResilienceAgent extends BaseAgent {
  constructor() {
    super(SUPPLY_CHAIN_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const engine = designState?.engine || {};

    if (engine?.crank === "billet_titanium") {
      findings.push({
        id: `sc_titanium_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Material Supply Bottleneck",
        title: "Billet Titanium Lead-Time Delay (16 Weeks)",
        detail: "Aerospace-grade billet titanium stock has a 16-week lead time due to global supply bottlenecks.",
        metrics: { leadTimeWeeks: 16, supplierRiskScore: 9 },
        recommendation: {
          id: "rec_sc_forged",
          agentId: this.identity.id,
          title: "Switch to Forged 4340 Chromoly Steel Crankshaft",
          description: "Reduces component procurement lead time to 2 weeks while maintaining 900+ HP fatigue limit.",
          impact: [{ metric: "Production Lead Time", currentValue: 16, projectedValue: 2, unit: "weeks" }],
          tradeoffs: ["Increases crank mass by +2.4 kg"],
          confidence: 0.91,
          changes: { crank: "forged_steel" },
          autoApplyable: false,
        },
        relatedAgents: ["agent_manufacturing", "agent_economy"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}
