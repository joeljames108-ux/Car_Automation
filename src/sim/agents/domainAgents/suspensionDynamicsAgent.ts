// ===================================================================
// SUSPENSION DYNAMICS AGENT — Geometry, Roll Centres & Cornering Grip
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const SUSPENSION_IDENTITY: AgentIdentity = {
  id: "agent_suspension",
  name: "Suspension Dynamics Agent",
  domain: "suspension",
  icon: "📐",
  color: "#f59e0b",
  priority: 8,
  description: "Evaluates spring rates, damping coefficients, camber gain, and roll centre heights for optimal grip.",
  capabilities: ["Geometry Optimization", "Roll Resistance", "Damping Curves", "Ride Height Adjustment"],
};

export class SuspensionDynamicsAgent extends BaseAgent {
  constructor() {
    super(SUSPENSION_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const suspensionType = designState?.vehicle?.suspension || "macpherson";
    const springRate = simState?.springRate || 65; // N/mm
    const rollAngleDeg = simState?.maxRollAngleDeg || 3.8;
    const handlingBalance = simState?.handlingBalance || 0.0; // -1 (understeer) to +1 (oversteer)

    // 1. Soft Roll Resistance Warning
    if (rollAngleDeg > 3.5) {
      findings.push({
        id: `suspension_excessive_roll_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Body Roll",
        title: "Excessive Cornering Body Roll Angle",
        detail: `Vehicle lateral roll angle is ${rollAngleDeg.toFixed(1)}°, causing camber loss and poor transient turn-in response.`,
        metrics: { rollAngleDeg, springRate },
        recommendation: {
          id: "rec_stiffen_anti_roll_bar",
          agentId: this.identity.id,
          title: "Stiffen Front & Rear Anti-Roll Bars + Increase Spring Stiffness",
          description: "Increase anti-roll bar diameter to limit body roll below 2.0° under 1.2g lateral cornering.",
          impact: [{ metric: "Max Body Roll", currentValue: Number(rollAngleDeg.toFixed(1)), projectedValue: 1.8, unit: "°" }],
          tradeoffs: ["Minor decrease in single-wheel bump absorption comfort"],
          confidence: 0.94,
          changes: { springRate: Math.min(120, springRate + 25) },
          autoApplyable: true,
        },
        relatedAgents: ["agent_tyres", "agent_nvh"],
        timestamp: Date.now(),
      });
    }

    // 2. MacPherson Geometry Limitation on Heavy Track Builds
    if (suspensionType === "macpherson" && (simState?.weight || 1500) > 1350 && (simState?.corneringG || 1.1) > 1.2) {
      findings.push({
        id: `suspension_geometry_limit_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Kinematics",
        title: "MacPherson Strut Camber Loss Under Heavy Load",
        detail: "MacPherson strut geometry experiences positive camber deflection under hard cornering compression.",
        metrics: { corneringG: simState?.corneringG || 1.2 },
        recommendation: {
          id: "rec_upgrade_double_wishbone",
          agentId: this.identity.id,
          title: "Upgrade to Double Wishbone Pushrod Geometry",
          description: "Provides negative camber gain under bump compression, keeping tyre tread 100% flat on asphalt.",
          impact: [{ metric: "Peak Lateral Grip", currentValue: 1.2, projectedValue: 1.45, unit: "g" }],
          tradeoffs: ["Higher component cost and wider chassis packaging footprint"],
          confidence: 0.96,
          changes: { suspension: "double_wishbone" },
          autoApplyable: false,
        },
        relatedAgents: ["agent_chassis", "agent_tyres"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}
