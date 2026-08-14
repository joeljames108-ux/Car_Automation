// ===================================================================
// MANUFACTURING AGENT — Assembly Line Cycle Time & Defect Rate QA
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const MANUFACTURING_IDENTITY: AgentIdentity = {
  id: "agent_manufacturing",
  name: "Manufacturing Line QA Agent",
  domain: "manufacturing",
  icon: "🏭",
  color: "#d97706",
  priority: 7,
  description: "Predicts assembly cycle time, defect rates, component complexity risk, and tooling requirements.",
  capabilities: ["Defect Rate Scoring", "Assembly Cycle Time", "Tolerance Check", "Tooling Feasibility"],
};

export class ManufacturingAgent extends BaseAgent {
  constructor() {
    super(MANUFACTURING_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const defectRate = simState?.manufacturing?.defectRate || simState?.defectRate || 4.2; // %
    const cycleTimeMins = simState?.manufacturing?.cycleTimeMins || 45;

    // 1. High Defect Rate Alert
    if (defectRate > 7.5) {
      findings.push({
        id: `mfg_high_defect_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Assembly Defect Rate",
        title: "High Assembly Line Defect Rate Warning (>7.5%)",
        detail: `Complex engine & chassis tolerance stack-up is causing a ${defectRate.toFixed(1)}% factory defect rate.`,
        metrics: { defectRatePercent: defectRate, cycleTimeMins },
        recommendation: {
          id: "rec_standardize_fasteners",
          agentId: this.identity.id,
          title: "Implement Robotic Automated Vision Alignment & Standardized Hex Hardware",
          description: "Reduces assembly errors by introducing robotic fixture alignment jigs at Chassis Station 3.",
          impact: [{ metric: "Defect Rate", currentValue: Number(defectRate.toFixed(1)), projectedValue: 2.1, unit: "%" }],
          tradeoffs: ["+$150k one-time factory retooling capex"],
          confidence: 0.92,
          changes: { toolingAutomationLevel: "robotic" },
          autoApplyable: true,
        },
        relatedAgents: ["agent_assembly_qa", "agent_chassis"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}
