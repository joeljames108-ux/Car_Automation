// ===================================================================
// CHASSIS STRUCTURAL AGENT — Torsional Rigidity, Weight Bias & Stress
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const CHASSIS_IDENTITY: AgentIdentity = {
  id: "agent_chassis",
  name: "Chassis Structural Agent",
  domain: "chassis",
  icon: "🏗️",
  color: "#64748b",
  priority: 8,
  description: "Verifies chassis torsional rigidity, mounting hardpoint stress, mass distribution, and structural integrity.",
  capabilities: ["Rigidity Analysis", "Stress Distribution", "Weight Bias Calculation", "Material Selection"],
};

export class ChassisStructuralAgent extends BaseAgent {
  constructor() {
    super(CHASSIS_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const chassisType = designState?.vehicle?.chassis || "steel_unibody";
    const mass = simState?.weight || 1500;
    const rigidity = simState?.torsionalRigidity || 18; // kNm/degree
    const weightBiasFront = simState?.weightBiasFront || 0.58;

    // 1. Low Torsional Rigidity for High-Performance Build
    if (rigidity < 22 && (simState?.corneringG || 1.0) > 1.15) {
      findings.push({
        id: `chassis_low_rigidity_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Structural Rigidity",
        title: "Inadequate Chassis Torsional Rigidity for High Cornering Load",
        detail: `Torsional rigidity (${rigidity} kNm/deg) allows chassis flex, degrading suspension spring/damper isolation.`,
        metrics: { torsionalRigidity: rigidity, curbWeightKg: mass },
        recommendation: {
          id: "rec_upgrade_carbon_monocoque",
          agentId: this.identity.id,
          title: "Upgrade to Carbon Fibre Monocoque Tub Chassis",
          description: "Increases torsional rigidity from 18 to 45 kNm/deg while shedding -120 kg of structural curb mass.",
          impact: [
            { metric: "Torsional Rigidity", currentValue: rigidity, projectedValue: 45, unit: "kNm/deg" },
            { metric: "Curb Weight", currentValue: mass, projectedValue: mass - 120, unit: "kg" },
          ],
          tradeoffs: ["Higher tooling and repair cost ($25,000)"],
          confidence: 0.98,
          changes: { chassis: "carbon_tub" },
          autoApplyable: false,
        },
        relatedAgents: ["agent_suspension", "agent_manufacturing"],
        timestamp: Date.now(),
      });
    }

    // 2. Heavy Front Mass Bias Warning (Front Heavy > 62%)
    if (weightBiasFront > 0.62) {
      findings.push({
        id: `chassis_front_heavy_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Weight Distribution",
        title: "Front-Heavy Longitudinal Weight Bias (>62% Front)",
        detail: `Front axle carries ${(weightBiasFront * 100).toFixed(0)}% of vehicle curb mass. Causes heavy understeer & front tyre thermal degradation.`,
        metrics: { weightBiasFrontPercent: weightBiasFront * 100 },
        recommendation: {
          id: "rec_reposition_powertrain",
          agentId: this.identity.id,
          title: "Shift Powertrain Layout to Mid-Engine Position",
          description: "Relocate engine behind cockpit to achieve 45% front / 55% rear balance for high-speed traction.",
          impact: [{ metric: "Front Weight Bias", currentValue: Math.round(weightBiasFront * 100), projectedValue: 45, unit: "%" }],
          tradeoffs: ["Loss of rear passenger/luggage cabin capacity"],
          confidence: 0.93,
          changes: { enginePosition: "mid" },
          autoApplyable: false,
        },
        relatedAgents: ["agent_chief_powertrain", "agent_suspension"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}
