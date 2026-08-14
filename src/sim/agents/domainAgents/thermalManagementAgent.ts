// ===================================================================
// THERMAL MANAGEMENT AGENT — Radiator, Heat Soak & Brake Cooling Analysis
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const THERMAL_IDENTITY: AgentIdentity = {
  id: "agent_thermal",
  name: "Thermal Management Expert",
  domain: "thermal",
  icon: "🔥",
  color: "#f97316",
  priority: 9,
  description: "Tracks radiator cooling capacity vs engine heat rejection, intercooler heat soak, and brake thermal degradation.",
  capabilities: ["Cooling Balance", "Heat Soak Prediction", "Radiator Sizing", "Brake Temperature Modeling"],
};

export class ThermalManagementAgent extends BaseAgent {
  constructor() {
    super(THERMAL_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const coolingMargin = simState?.coolingMargin || 0.5; // 0-1 (0 = overheating, 1 = cold)
    const heatOutputKw = simState?.heatOutputKw || 120;
    const coolingCapacityKw = simState?.coolingCapacityKw || 140;
    const engine = designState?.engine || {};

    // 1. Critical Overheating Risk
    if (coolingMargin < 0.35 || heatOutputKw > coolingCapacityKw) {
      findings.push({
        id: `thermal_overheat_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "critical",
        category: "Engine Overheating",
        title: "Critical Thermal Overheating Under Circuit Load",
        detail: `Heat rejection (${Math.round(heatOutputKw)} kW) exceeds cooling capacity (${Math.round(coolingCapacityKw)} kW). Radiator boil-over imminent after ~3 laps.`,
        metrics: { heatOutputKw, coolingCapacityKw, coolingMargin },
        recommendation: {
          id: "rec_upgrade_radiator",
          agentId: this.identity.id,
          title: "Upgrade to Dual-Pass High Capacity Aluminum Radiator & Oil Cooler",
          description: "Increase radiator core thickness and water pump flow rate to raise cooling capacity to +45 kW.",
          impact: [
            { metric: "Cooling Capacity", currentValue: Math.round(coolingCapacityKw), projectedValue: Math.round(coolingCapacityKw + 45), unit: "kW" },
            { metric: "Cooling Margin", currentValue: Math.round(coolingMargin * 100), projectedValue: 82, unit: "%" },
          ],
          tradeoffs: ["+4.5 kg weight increase in front nose"],
          confidence: 0.96,
          changes: { coolingRadiator: 1.0, coolingOilCooler: 1.0, coolingWaterPump: 1.0 },
          autoApplyable: false,
        },
        relatedAgents: ["agent_chief_powertrain", "agent_manufacturing"],
        timestamp: Date.now(),
      });
    }

    // 2. Forced Induction Intercooler Heat Soak Warning
    if (engine.intake && engine.intake !== "na" && (engine.intercoolerEff || 0.75) < 0.82) {
      findings.push({
        id: `thermal_intercooler_soak_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Intercooler Efficiency",
        title: "Turbo Charger Intake Air Heat Soak Risk",
        detail: `Intercooler efficiency is set to ${Math.round((engine.intercoolerEff || 0.75) * 100)}%. High IATs reduce oxygen density & trigger timing retardation.`,
        metrics: { intercoolerEfficiency: engine.intercoolerEff || 0.75 },
        recommendation: {
          id: "rec_upgrade_intercooler",
          agentId: this.identity.id,
          title: "Switch to Air-to-Water Charge Air Intercooler",
          description: "Improves thermal efficiency to 92% and keeps charge air under 40°C even under sustained boost.",
          impact: [{ metric: "IAT Reduction", currentValue: 65, projectedValue: 38, unit: "°C" }],
          tradeoffs: ["+6 kg weight and minor electrical pump draw"],
          confidence: 0.90,
          changes: { intercoolerEff: 0.92, intercoolerType: "air_to_water" },
          autoApplyable: true,
        },
        relatedAgents: ["agent_chief_powertrain"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}
