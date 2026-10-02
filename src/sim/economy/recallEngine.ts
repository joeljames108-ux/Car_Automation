/**
 * ═══════════════════════════════════════════════════════════════════════
 * RECALL & FAILURE ENGINE — DEFECT AUDITS & CRISIS DAMAGE MECHANICS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 28:
 *
 * Catastrophic vehicle failures and safety recalls.
 * If engineering was rushed or factories operated in overload (>95%),
 * hidden defects propagate through the fleet.
 *
 * Recall Costs:
 * - Replacement BOM parts (redesigned components)
 * - Dealership dealer technician labor per car
 * - Regulatory certification & customer notifications
 * - Legal settlement reserve
 *
 * Reputation Fallout:
 * Direct negative shock to Reliability, Safety, and Commercial Trust!
 */

import { ReputationDimensionKey } from "../../state/reputationEngine";

export type RecallSeverity = "MINOR_SERVICE_BULLETIN" | "VOLUNTARY_SAFETY_RECALL" | "MANDATORY_FEDERAL_RECALL";

export interface VehicleDefectIssue {
  id: string;
  vehicleModelName: string;
  subsystem: "BRAKES" | "POWERTRAIN" | "ELECTRICAL_FIRE" | "AIRBAG_OR_STEERING" | "SUSPENSION";
  description: string;
  affectedVehicleUnits: number;
  severity: RecallSeverity;
  replacementPartBOMPerUnit: number;
  technicianLaborHoursPerUnit: number;
  technicianHourlyRate: number;      // e.g. ₹600/hr
  regulatoryFinePerUnit: number;
  isVoluntary: boolean;
  discoveredMonth: number;
  discoveredYear: number;
  status: "ACTIVE_RECALL" | "INVESTIGATING" | "RESOLVED";
}

export interface RecallExecutionResult {
  defectId: string;
  vehicleModelName: string;
  totalFinancialCost: number;
  replacementPartsTotalCost: number;
  dealerLaborTotalCost: number;
  regulatoryFinesAndLegalCost: number;
  reputationDamage: Partial<Record<ReputationDimensionKey, number>>;
  customerSatisfactionDrop: number;
  publicScandalLevel: "MODERATE" | "SEVERE" | "CATASTROPHIC";
}

/**
 * Execute a recall campaign and determine financial and reputational fallout
 */
export function executeVehicleRecall(
  issue: VehicleDefectIssue,
  reputationFallMultiplier: number = 1.0 // from Section 42
): RecallExecutionResult {
  const units = Math.max(1, issue.affectedVehicleUnits);

  // 1. Financial Costs
  const partsCost = units * issue.replacementPartBOMPerUnit;
  const laborCost = units * (issue.technicianLaborHoursPerUnit * issue.technicianHourlyRate);
  const legalAndFines = units * issue.regulatoryFinePerUnit;
  const totalCost = partsCost + laborCost + legalAndFines;

  // 2. Reputation Damage
  // Voluntary recalls cut reputation damage by 50% vs government mandatory orders!
  const voluntaryDampener = issue.isVoluntary ? 0.50 : 1.0;
  const effectiveFallMultiplier = reputationFallMultiplier * voluntaryDampener;

  let baseReliabilityDrop = 8;
  let baseSafetyDrop = 4;
  let baseTrustDrop = 5;

  if (issue.severity === "MANDATORY_FEDERAL_RECALL") {
    baseReliabilityDrop = 18;
    baseSafetyDrop = 15;
    baseTrustDrop = 14;
  } else if (issue.severity === "VOLUNTARY_SAFETY_RECALL") {
    baseReliabilityDrop = 10;
    baseSafetyDrop = 8;
    baseTrustDrop = 6;
  }

  const reputationDamage: Partial<Record<ReputationDimensionKey, number>> = {
    reliability: -Number((baseReliabilityDrop * effectiveFallMultiplier).toFixed(1)),
    safety: -Number((baseSafetyDrop * effectiveFallMultiplier).toFixed(1)),
    commercialTrust: -Number((baseTrustDrop * effectiveFallMultiplier).toFixed(1)),
  };

  const satisfactionDrop = Math.round(baseReliabilityDrop * effectiveFallMultiplier * 1.2);

  let publicScandalLevel: RecallExecutionResult["publicScandalLevel"] = "MODERATE";
  if (issue.severity === "MANDATORY_FEDERAL_RECALL" && reputationFallMultiplier > 1.8) {
    publicScandalLevel = "CATASTROPHIC";
  } else if (issue.severity === "MANDATORY_FEDERAL_RECALL" || issue.affectedVehicleUnits > 5000) {
    publicScandalLevel = "SEVERE";
  }

  return {
    defectId: issue.id,
    vehicleModelName: issue.vehicleModelName,
    totalFinancialCost: totalCost,
    replacementPartsTotalCost: partsCost,
    dealerLaborTotalCost: laborCost,
    regulatoryFinesAndLegalCost: legalAndFines,
    reputationDamage,
    customerSatisfactionDrop: satisfactionDrop,
    publicScandalLevel,
  };
}
