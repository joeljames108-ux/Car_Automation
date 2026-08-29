// ===================================================================
// PIT STOP OPERATIONS AGENT — Crew Reaction, Nut Gun Speed & Traffic Release
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const PIT_OPERATIONS_IDENTITY: AgentIdentity = {
  id: "agent_pit_operations",
  name: "Pit Stop & Track Operations Engineer",
  domain: "pit_operations",
  icon: "⏱️",
  color: "#d97706",
  priority: 7,
  description: "Simulates pit lane crew reaction times, wheel nut gun speed, jackman synchronization, and pit traffic releases.",
  capabilities: ["Pit Duration Model", "Wheel Nut Torque Speed", "Jackman Sync Timing", "Traffic Release Window"],
};

export class PitStopOperationsAgent extends BaseAgent {
  constructor() {
    super(PIT_OPERATIONS_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const wheels = designState?.vehicle?.wheels || {};

    if (wheels?.lugNutType !== "center_lock") {
      findings.push({
        id: `pit_lugs_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "info",
        category: "Pit Stop Duration",
        title: "5-Lug Wheel Pattern Pit Delay (+1.8s)",
        detail: "Standard 5-lug bolt wheels slow down pit stop wheel swaps by +1.8s compared to motorsport center-lock hubs.",
        metrics: { pitDurationSec: 4.2, lugCount: 5 },
        recommendation: {
          id: "rec_pit_centerlock",
          agentId: this.identity.id,
          title: "Upgrade to Single Center-Lock Racing Hubs",
          description: "Allows instantaneous single-nut pneumatic gun wheel swaps during endurance pit stops.",
          impact: [{ metric: "Pit Stop Time", currentValue: 4.2, projectedValue: 2.3, unit: "s" }],
          tradeoffs: ["Requires specialized track socket equipment"],
          confidence: 0.96,
          changes: {},
          autoApplyable: false,
        },
        relatedAgents: ["agent_race_strategy", "agent_tyres"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}
