// ===================================================================
// BRAKE SYSTEM AGENT — Bias, Thermal Capacity & Stopping Distance
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const BRAKE_IDENTITY: AgentIdentity = {
  id: "agent_brakes",
  name: "Brake System Engineer",
  domain: "brakes",
  icon: "🛑",
  color: "#dc2626",
  priority: 8,
  description: "Monitors brake bias balance, rotor thermal capacity, friction coefficients, and stopping distances.",
  capabilities: ["Bias Calculation", "Thermal Capacity Check", "Fade Risk Analysis", "Deceleration Modeling"],
};

export class BrakeDesignAgent extends BaseAgent {
  constructor() {
    super(BRAKE_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const brakeType = designState?.vehicle?.brakes || "solid_disc";
    const weight = simState?.weight || 1500;
    const power = simState?.power || 400;
    const brakeFadeRisk = simState?.brakeFadeRisk || 0.2;
    const stoppingDistance100_0 = simState?.stoppingDistance100_0 || 38.5; // metres

    // 1. Inadequate Brakes for High Power/Weight
    if ((brakeType === "solid_disc" || brakeType === "drum") && (power > 300 || weight > 1600)) {
      findings.push({
        id: `brake_thermal_overload_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "critical",
        category: "Brake Thermal Capacity",
        title: "Brake Rotor Thermal Overload & Fade Hazard",
        detail: `Basic ${brakeType} setup cannot dissipate kinetic energy of ${power} HP / ${weight} kg vehicle during heavy braking.`,
        metrics: { power, weight, stoppingDistanceMetres: stoppingDistance100_0 },
        recommendation: {
          id: "rec_upgrade_carbon_ceramic_brakes",
          agentId: this.identity.id,
          title: "Upgrade to 380mm Carbon Ceramic Vented Disc Brakes",
          description: "Increases thermal ceiling to 900°C and reduces 100-0 km/h stopping distance by ~6.5 metres.",
          impact: [
            { metric: "100-0 km/h Distance", currentValue: Number(stoppingDistance100_0.toFixed(1)), projectedValue: 32.0, unit: "m" },
            { metric: "Unsprung Weight", currentValue: 48, projectedValue: 28, unit: "kg" },
          ],
          tradeoffs: ["High replacement cost ($4,500) and minor squeal when cold"],
          confidence: 0.97,
          changes: { brakes: "carbon_ceramic" },
          autoApplyable: false,
        },
        relatedAgents: ["agent_thermal", "agent_suspension"],
        timestamp: Date.now(),
      });
    }

    // 2. Severe Brake Bias Imbalance
    const brakeBiasFront = simState?.brakeBiasFront || 0.68; // 68% front
    if (brakeBiasFront > 0.74 || brakeBiasFront < 0.52) {
      findings.push({
        id: `brake_bias_imbalance_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Brake Bias",
        title: brakeBiasFront > 0.74 ? "Excessive Front Brake Bias (Front Lockup)" : "Excessive Rear Brake Bias (Rear Spin)",
        detail: `Current brake bias is ${(brakeBiasFront * 100).toFixed(0)}% front. Ideal bias for current weight distribution is ~62%.`,
        metrics: { brakeBiasFrontPercent: brakeBiasFront * 100 },
        recommendation: {
          id: "rec_adjust_brake_bias",
          agentId: this.identity.id,
          title: "Calibrate Dual Master Cylinder Proportional Valve",
          description: "Adjust hydraulic bias balance to 62% front / 38% rear for maximum threshold deceleration.",
          impact: [{ metric: "Brake Bias Front", currentValue: Math.round(brakeBiasFront * 100), projectedValue: 62, unit: "%" }],
          tradeoffs: ["Requires fine-tuning for wet track conditions"],
          confidence: 0.91,
          changes: { brakeBiasFront: 0.62 },
          autoApplyable: true,
        },
        relatedAgents: ["agent_tyres", "agent_race_strategy"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}
