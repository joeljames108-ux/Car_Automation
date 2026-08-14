// ===================================================================
// INFOTAINMENT & COCKPIT UX AGENT — Display Latency & HMI Friction
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const INFOTAINMENT_IDENTITY: AgentIdentity = {
  id: "agent_infotainment_ux",
  name: "Cockpit UX & HMI Systems Engineer",
  domain: "infotainment_ux",
  icon: "🖥️",
  color: "#06b6d4",
  priority: 6,
  description: "Monitors digital cockpit display latency, telemetry widget density, driver UI interaction friction, and OTA updates.",
  capabilities: ["HMI Latency Check", "Widget Density Optimization", "Driver Distraction Index", "OTA Risk Audit"],
};

export class InfotainmentUXAgent extends BaseAgent {
  constructor() {
    super(INFOTAINMENT_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const infotainment = designState?.infotainment || {};
    const displayCount = infotainment?.displayCount || 1;

    if (displayCount > 3) {
      findings.push({
        id: `ux_distraction_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "info",
        category: "Driver Distraction",
        title: "High Screen Area Clutter Warning",
        detail: `Multiple active displays (${displayCount}) increase visual cognitive load. Recommend streamlining primary HUD gauges.`,
        metrics: { displayCount },
        recommendation: {
          id: "rec_ux_streamline",
          agentId: this.identity.id,
          title: "Enable Minimalist Track HUD Mode",
          description: "Hide non-essential infotainment widgets during high-G cornering to focus driver attention on RPM and gear indicators.",
          impact: [{ metric: "Driver Response Time", currentValue: 450, projectedValue: 320, unit: "ms" }],
          tradeoffs: ["Hides secondary media widgets"],
          confidence: 0.88,
          changes: {},
          autoApplyable: true,
        },
        relatedAgents: ["agent_safety", "agent_electronics"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}
