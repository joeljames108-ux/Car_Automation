// ===================================================================
// ECONOMY & COST AGENT — BOM Costing, Target Markets & Margins
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const ECONOMY_IDENTITY: AgentIdentity = {
  id: "agent_economy",
  name: "Economy & Cost Analyst",
  domain: "economy",
  icon: "💵",
  color: "#10b981",
  priority: 7,
  description: "Tracks bill-of-materials cost, production pricing targets, market segment profitability, and value metrics.",
  capabilities: ["BOM Cost Tracking", "Margin Calculation", "Market Positioning", "Budget Target Alerts"],
};

export class EconomyCostAgent extends BaseAgent {
  constructor() {
    super(ECONOMY_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const totalCost = simState?.totalCost || 45000;
    const targetSegment = designState?.carConcept || "sport";

    const budgetCeilings: Record<string, number> = {
      budget: 28000,
      sport: 65000,
      track: 95000,
      luxury: 120000,
      hypercar: 1500000,
    };

    const maxBudget = budgetCeilings[targetSegment] || 75000;

    // 1. Production Cost Target Violation
    if (totalCost > maxBudget) {
      findings.push({
        id: `cost_target_violation_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "critical",
        category: "Production Cost",
        title: `Production Cost ($${totalCost.toLocaleString()}) Exceeds Target Ceiling ($${maxBudget.toLocaleString()})`,
        detail: `Current Bill-of-Materials ($${totalCost.toLocaleString()}) is $${(totalCost - maxBudget).toLocaleString()} over the target budget for the ${targetSegment} category.`,
        metrics: { totalCost, maxBudget, deltaCost: totalCost - maxBudget },
        recommendation: {
          id: "rec_optimize_bom_cost",
          agentId: this.identity.id,
          title: "Optimize Material Selection & Substitute Composite Component Options",
          description: "Substitute exotic titanium exhaust and carbon bodywork with high-strength aluminum alloys to trim $12,000 BOM cost.",
          impact: [{ metric: "BOM Cost", currentValue: totalCost, projectedValue: totalCost - 12000, unit: "USD" }],
          tradeoffs: ["Minor weight increase (+22 kg)"],
          confidence: 0.94,
          changes: { bodyMaterial: "aluminum" },
          autoApplyable: false,
        },
        relatedAgents: ["agent_manufacturing", "agent_rival_strategist"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}
