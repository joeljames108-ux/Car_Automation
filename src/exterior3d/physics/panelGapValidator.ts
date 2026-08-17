// ===================================================================
// SHUT-LINE GAP & TOLERANCE VALIDATOR (3D METRIC ENGINE)
// ===================================================================

import { SHUT_LINE_SPECIFICATION_STANDARDS } from "../../sim/constants/exteriorConstants";

export interface GapCheckEntry {
  pairKey: string;
  nominalMm: number;
  measuredMm: number;
  deviationMm: number;
  isValid: boolean;
}

export function validateAllPanelGaps(
  gapDeltasMm: number | Record<string, number> = 0,
  flushDeltaMm = 0.0
): {
  overallPass: boolean;
  entries: GapCheckEntry[];
  averageDeviationMm: number;
} {
  const entries: GapCheckEntry[] = Object.entries(SHUT_LINE_SPECIFICATION_STANDARDS).map(
    ([key, rule]) => {
      const delta = typeof gapDeltasMm === "number" ? gapDeltasMm : (gapDeltasMm[key] || 0);
      const measured = rule.nominalGapMm + delta;
      const deviation = Math.abs(measured - rule.nominalGapMm);
      const isValid = deviation <= rule.tolerancePlusMm;

      return {
        pairKey: key,
        nominalMm: rule.nominalGapMm,
        measuredMm: Math.round(measured * 10) / 10,
        deviationMm: Math.round(deviation * 100) / 100,
        isValid,
      };
    }
  );

  const overallPass = entries.every((e) => e.isValid);
  const avgDev =
    entries.reduce((sum, e) => sum + e.deviationMm, 0) / (entries.length || 1);

  return {
    overallPass,
    entries,
    averageDeviationMm: Math.round(avgDev * 100) / 100,
  };
}
