/**
 * ═══════════════════════════════════════════════════════════════════════
 * FACTORY QUALITY INSPECTION & DEFECT ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements end-of-line quality validation:
 * 1. Multi-factor defect rate computation (tooling tier, maintenance, staffing)
 * 2. Rework vs scrap economic resolution
 * 3. Monsoon leak testing, chassis dynamometer alignment, and paint thickness
 */

import { AssemblyLine } from "./factoryTypes";

export interface QualityInspectionMetrics {
  lineId: string;
  defectRatePct: number;
  firstTimePassRatePct: number;
  reworkCostPerUnitUSD: number;
  scrapRatePct: number;
  qualityGrade: "A+" | "A" | "B" | "C" | "CRITICAL";
}

export interface BatchQualityReport {
  totalInspectedUnits: number;
  passedFirstTimeUnits: number;
  reworkedUnits: number;
  scrappedUnits: number;
  totalReworkCostUSD: number;
  totalScrapCostUSD: number;
  effectiveYieldPct: number;
}

/**
 * Computes realistic defect rates based on physical tooling and maintenance condition.
 */
export function computeLineQualityMetrics(
  line: AssemblyLine,
  staffingRatio = 1.0
): QualityInspectionMetrics {
  // Base defect rate drops with tooling level (Level 1: 4.8% -> Level 5: 0.9%)
  const baseDefectByLevel = Math.max(0.8, 5.8 - line.level * 1.0);

  // Breakdown risk penalty (worn dies, misaligned fixtures)
  const maintenancePenalty = line.breakdownRiskPct * 0.08;

  // Understaffing penalty (rushed inspections, fatigue)
  const staffingPenalty = staffingRatio < 1.0 ? (1.0 - staffingRatio) * 3.5 : 0;

  // Workforce skill bonus (experienced operators reduce assembly defects)
  const skillDefectMod = line.workforceSkill?.effectiveDefectModifier ?? 0.0;

  const defectRatePct = Math.max(
    0.4,
    Math.round((baseDefectByLevel + maintenancePenalty + staffingPenalty + skillDefectMod) * 10) / 10
  );
  const firstTimePassRatePct = Math.max(50, Math.round((100 - defectRatePct) * 10) / 10);

  // 80% of defects can be reworked on end-of-line bay, 20% are scrapped
  const scrapRatePct = Math.round(defectRatePct * 0.2 * 10) / 10;
  const reworkCostPerUnitUSD = Math.round(line.monthlyOperatingCostUSD * 0.005);

  const qualityGrade =
    defectRatePct <= 1.2
      ? "A+"
      : defectRatePct <= 2.5
      ? "A"
      : defectRatePct <= 4.0
      ? "B"
      : defectRatePct <= 6.0
      ? "C"
      : "CRITICAL";

  return {
    lineId: line.id,
    defectRatePct,
    firstTimePassRatePct,
    reworkCostPerUnitUSD,
    scrapRatePct,
    qualityGrade,
  };
}

/**
 * Simulates quality gate inspection on a manufactured vehicle batch.
 */
export function simulateBatchInspection(
  totalUnits: number,
  defectRatePct: number,
  unitBOMCostUSD = 1500,
  reworkCostUSD = 280
): BatchQualityReport {
  const defectUnits = Math.round(totalUnits * (defectRatePct / 100));
  const scrappedUnits = Math.round(defectUnits * 0.15); // 15% unrecoverable
  const reworkedUnits = defectUnits - scrappedUnits;
  const passedFirstTimeUnits = totalUnits - defectUnits;

  const totalReworkCostUSD = reworkedUnits * reworkCostUSD;
  const totalScrapCostUSD = scrappedUnits * unitBOMCostUSD;
  const effectiveYieldPct =
    totalUnits > 0 ? Math.round(((totalUnits - scrappedUnits) / totalUnits) * 100) : 100;

  return {
    totalInspectedUnits: totalUnits,
    passedFirstTimeUnits,
    reworkedUnits,
    scrappedUnits,
    totalReworkCostUSD,
    totalScrapCostUSD,
    effectiveYieldPct,
  };
}
