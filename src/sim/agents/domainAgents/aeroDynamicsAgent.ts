// ===================================================================
// AERODYNAMICS AGENT — Downforce, Drag & Stability Analysis
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const AERO_IDENTITY: AgentIdentity = {
  id: "agent_aerodynamics",
  name: "Aerodynamics Specialist",
  domain: "aerodynamics",
  icon: "🌀",
  color: "#06b6d4",
  priority: 9,
  description: "Optimizes downforce balance, drag coefficient (Cd), diffuser angle, and high-speed stability.",
  capabilities: ["Cd Calculation", "Aero Balance", "Downforce Tuning", "Flow Separation Warnings"],
};

export class AeroDynamicsAgent extends BaseAgent {
  constructor() {
    super(AERO_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const aero = designState?.vehicle?.aero || {};
    const cd = simState?.dragCoeff || aero.dragCoeff || 0.35;
    const balance = simState?.aeroBalance || 0.5; // 0-1 (0 = rear, 1 = front)
    const separationRisk = simState?.separationRisk || 0.2;
    const topSpeed = simState?.topSpeed || 250;

    // 1. High Drag Warning
    if (cd > 0.42) {
      findings.push({
        id: `aero_high_drag_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Drag Penalty",
        title: "High Aerodynamic Drag Penalty",
        detail: `Drag coefficient (${cd.toFixed(2)} Cd) is excessive, reducing top speed by approx ~18 km/h.`,
        metrics: { dragCoeff: cd, topSpeedKmh: topSpeed },
        recommendation: {
          id: "rec_reduce_wing_angle",
          agentId: this.identity.id,
          title: "Reduce Rear Wing Angle & Flush Underbody",
          description: "Decrease wing angle of attack by 3° to lower Cd to ~0.36 without losing high-speed stability.",
          impact: [{ metric: "Top Speed", currentValue: topSpeed, projectedValue: topSpeed + 14, unit: "km/h" }],
          tradeoffs: ["Minor loss in high-speed cornering downforce (-45 N)"],
          confidence: 0.92,
          changes: { rearWingAngle: Math.max(2, (aero.rearWingAngle || 12) - 3) },
          autoApplyable: false,
        },
        relatedAgents: ["agent_race_strategy", "agent_chief_powertrain"],
        timestamp: Date.now(),
      });
    }

    // 2. Severe Aero Imbalance
    if (balance < 0.40 || balance > 0.62) {
      const isRearBiased = balance < 0.40;
      findings.push({
        id: `aero_imbalance_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "critical",
        category: "Handling Instability",
        title: isRearBiased ? "Critical Front Aero Lift (Understeer)" : "Critical Rear Aero Lift (Oversteer Snap)",
        detail: `Aero balance is ${(balance * 100).toFixed(0)}% rear. Ideal balance for high-speed stability is 45% - 55%.`,
        metrics: { aeroBalancePercent: balance * 100 },
        recommendation: {
          id: "rec_rebalance_aero",
          agentId: this.identity.id,
          title: isRearBiased ? "Increase Front Splitter Extension" : "Increase Rear Wing Angle",
          description: "Re-align aerodynamic centre of pressure with vehicle centre of mass.",
          impact: [{ metric: "Aero Balance", currentValue: Math.round(balance * 100), projectedValue: 50, unit: "%" }],
          tradeoffs: ["Slight change in total aerodynamic drag"],
          confidence: 0.95,
          changes: isRearBiased
            ? { frontSplitterExtension: (aero.frontSplitterExtension || 50) + 15 }
            : { rearWingAngle: (aero.rearWingAngle || 10) + 4 },
          autoApplyable: true,
        },
        relatedAgents: ["agent_suspension", "agent_race_strategy"],
        timestamp: Date.now(),
      });
    }

    // 3. Flow Separation Risk
    if (separationRisk > 0.55) {
      findings.push({
        id: `aero_flow_separation_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "critical",
        category: "Diffuser Stall",
        title: "Underbody Diffuser Flow Separation Stall",
        detail: "Airflow under the rear diffuser is detaching, causing sudden downforce loss at speed.",
        metrics: { separationRisk },
        recommendation: {
          id: "rec_reduce_diffuser_angle",
          agentId: this.identity.id,
          title: "Reduce Rear Diffuser Expansion Angle",
          description: "Decrease diffuser expansion angle from steep rake to smooth 7° ramp to maintain attached laminar flow.",
          impact: [{ metric: "Separation Risk", currentValue: Math.round(separationRisk * 100), projectedValue: 18, unit: "%" }],
          tradeoffs: ["Requires slightly higher rear ride height"],
          confidence: 0.88,
          changes: { diffuserRakeAngle: 7 },
          autoApplyable: true,
        },
        relatedAgents: ["agent_suspension", "agent_chassis"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}
