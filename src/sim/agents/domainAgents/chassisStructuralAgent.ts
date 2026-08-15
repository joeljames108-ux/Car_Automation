// ===================================================================
// CHASSIS STRUCTURAL AGENT — Torsional Rigidity, FEA Stress & Yield
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const CHASSIS_IDENTITY: AgentIdentity = {
  id: "agent_chassis",
  name: "Chassis Structural Agent",
  domain: "chassis",
  icon: "🏗️",
  color: "#64748b",
  priority: 8,
  description: "Verifies chassis torsional rigidity, FEA Von Mises stress concentrations, mounting hardpoint loads, and material yield safety margins.",
  capabilities: ["FEA Stress Distribution", "Torsional Rigidity Analysis", "Von Mises Yield Margin", "Weight Bias Calculation", "Material Selection"],
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
    const corneringG = simState?.corneringG || 1.15;
    const brakingG = simState?.brakingG || 1.1;

    // ── 1. Calculate FEA Von Mises Peak Stress & Safety Margin ──
    const combinedG = Math.sqrt(corneringG ** 2 + brakingG ** 2);
    const estimatedPeakStressMpa = Math.round(combinedG * 180 * 1.75); // Peak at suspension towers / subframes

    // Material Yield Strengths (MPa)
    const yieldStrengthMap: Record<string, number> = {
      steel_ladder: 350,
      steel_unibody: 480,
      tubular_spaceframe: 600,
      aluminum_spaceframe: 420,
      carbon_tub: 850,
      titanium_tub: 920,
    };
    const materialYieldMpa = yieldStrengthMap[chassisType] || 480;
    const safetyFactor = Math.round((materialYieldMpa / Math.max(1, estimatedPeakStressMpa)) * 100) / 100;

    // ── 2. Low Torsional Rigidity Warning ──
    if (rigidity < 22 && corneringG > 1.15) {
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

    // ── 3. High FEA Von Mises Yield Stress Warning ──
    if (safetyFactor < 1.35) {
      findings.push({
        id: `chassis_fea_yield_risk_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: safetyFactor < 1.1 ? "critical" : "warning",
        category: "FEA Structural Stress",
        title: `Low Structural Safety Factor (SF = ${safetyFactor}) Under Peak Dynamic Loads`,
        detail: `Peak Von Mises stress reaches ${estimatedPeakStressMpa} MPa against material yield limit of ${materialYieldMpa} MPa at suspension bulkheads.`,
        metrics: { peakVonMisesMpa: estimatedPeakStressMpa, safetyFactor, materialYieldMpa },
        recommendation: {
          id: "rec_reinforce_chassis_bulkhead",
          agentId: this.identity.id,
          title: "Upgrade Chassis Frame or Spaceframe Bracing",
          description: "Select an Aluminum Spaceframe or Carbon Monocoque Tub to increase structural yield threshold.",
          impact: [
            { metric: "Safety Factor", currentValue: safetyFactor, projectedValue: 1.85, unit: "SF" },
            { metric: "Yield Limit", currentValue: materialYieldMpa, projectedValue: 850, unit: "MPa" },
          ],
          tradeoffs: ["Chassis upgrade cost"],
          confidence: 0.95,
          changes: { chassis: "carbon_tub" },
          autoApplyable: false,
        },
        relatedAgents: ["agent_suspension", "agent_safety"],
        timestamp: Date.now(),
      });
    }

    // ── 4. Heavy Front Mass Bias Warning (Front Heavy > 62%) ──
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
