// ===================================================================
// TRANSMISSION & DRIVETRAIN AGENT — Gear Ratios, Shift Speed & LSD Lockup
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const TRANSMISSION_IDENTITY: AgentIdentity = {
  id: "agent_transmission",
  name: "Transmission & Drivetrain Engineer",
  domain: "transmission",
  icon: "⚙️",
  color: "#d97706",
  priority: 8,
  description: "Optimizes dual-clutch shift speed, gear ratio steps, LSD lockup percentage, and gearbox oil cooling.",
  capabilities: ["Gear Ratio Tuning", "LSD Lockup Balancing", "Shift Speed Calibration", "Gearbox Oil Temp Monitoring"],
};

export class TransmissionDrivetrainAgent extends BaseAgent {
  constructor() {
    super(TRANSMISSION_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const transmission = designState?.vehicle?.transmission || "manual_6";
    const powerHp = simState?.peakPower || 400;
    const topSpeedKmh = simState?.topSpeedKmh || 250;

    // 1. High Power Manual Clutch Slip Risk
    if (powerHp > 650 && transmission.includes("manual")) {
      findings.push({
        id: `trans_clutch_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Clutch Torque Capacity",
        title: "High Torque Clutch Slip Risk",
        detail: `Engine power (${powerHp} HP) exceeds standard single-plate manual clutch torque limits. High risk of friction plate overheating during launch.`,
        metrics: { powerHp, topSpeedKmh },
        recommendation: {
          id: "rec_trans_dct",
          agentId: this.identity.id,
          title: "Upgrade to 7-Speed Dual-Clutch Transmission (DCT)",
          description: "Install dual-wet clutch pack with high torque capacity and sub-50ms shift times.",
          impact: [
            { metric: "0-100 km/h", currentValue: 3.8, projectedValue: 3.1, unit: "s" },
            { metric: "Shift Time", currentValue: 250, projectedValue: 45, unit: "ms" },
          ],
          tradeoffs: ["Increases transmission mass by +15 kg"],
          confidence: 0.92,
          changes: { transmission: "dct_7" },
          autoApplyable: false,
        },
        relatedAgents: ["agent_chief_powertrain", "agent_race_strategy"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}
