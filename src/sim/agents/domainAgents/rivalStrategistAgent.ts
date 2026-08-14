// ===================================================================
// RIVAL STRATEGIST AGENT — Market Intelligence & Competitor Tracking
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const RIVAL_IDENTITY: AgentIdentity = {
  id: "agent_rival_strategist",
  name: "AI Rival Market Intelligence Agent",
  domain: "rival_strategy",
  icon: "👁️",
  color: "#ec4899",
  priority: 6,
  description: "Monitors competitor companies (Apex Motors, Volta EV, Meridian), tech levels, and market launch tactics.",
  capabilities: ["Competitor Benchmarking", "Tech Level Tracking", "Market Share Analysis", "Rival Strategy"],
};

export class RivalStrategistAgent extends BaseAgent {
  constructor() {
    super(RIVAL_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const playerPower = simState?.power || 400;

    // Benchmark against Volta EV and Apex Motors
    if (playerPower < 350) {
      findings.push({
        id: `rival_power_deficit_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "info",
        category: "Rival Benchmarking",
        title: "Power Deficit vs Apex Motors & Thunder Auto Rivals",
        detail: "Rival Apex Motors Raptor GT-R outputs 520 HP in this segment. Consider turbo or displacement upgrade.",
        metrics: { playerPowerHp: playerPower, rivalPowerHp: 520 },
        recommendation: {
          id: "rec_boost_power_output",
          agentId: this.identity.id,
          title: "Increase Turbo Charger Boost Pressure to Match Rival Output",
          description: "Advance boost pressure to +1.4 bar to reach 480 HP and close performance gap.",
          impact: [{ metric: "Horsepower Output", currentValue: playerPower, projectedValue: 480, unit: "HP" }],
          tradeoffs: ["Requires checking cooling margin and fuel octane RON"],
          confidence: 0.88,
          changes: { boostPressure: 1.4 },
          autoApplyable: false,
        },
        relatedAgents: ["agent_chief_powertrain", "agent_economy"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}
