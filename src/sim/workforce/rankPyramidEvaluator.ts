/**
 * ═══════════════════════════════════════════════════════════════════════
 * RANK PYRAMID & SPAN-OF-CONTROL EVALUATOR
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 10 ("Management needs a reason to exist")
 * and Section 12 ("Rank composition matters").
 *
 * Analyzes the structural balance of a department's hierarchy:
 * - Junior to Senior ratios (Mentorship synergies)
 * - Subordinate to Manager ratios (Span of Control)
 * - Force multiplier contribution of Principal Engineers
 * - Structural posture: "JUNIOR_HEAVY_ACADEMY" vs "BALANCED" vs "SENIOR_ELITE"
 */

import { DepartmentAggregation, EmployeeRank } from "./workforceTypes";

export interface RankPyramidAnalysis {
  departmentId: string;
  totalPersonnel: number;
  traineesAndJuniors: number;  // Ranks 1 & 2
  coreEngineers: number;        // Rank 3
  seniorsAndPrincipals: number; // Ranks 4 & 5
  management: number;           // Ranks 6, 7, 8

  mentorshipRatio: number;      // Juniors per Senior (Optimal: 2.0 to 4.0)
  mentorshipHealth: "EXCELLENT" | "BALANCED" | "UNSUPERVISED" | "OVER_SUPERVISED";
  mentorshipBonusPct: number;   // +0% to +20% skill growth boost for juniors

  spanRatio: number;            // Subordinates per Manager
  spanHealth: "HEALTHY" | "OPTIMAL" | "STRAINED" | "CRITICAL_DEFICIT";
  spanPenaltyPct: number;       // 0% to 50% productivity drag

  structuralPosture: "JUNIOR_HEAVY_ACADEMY" | "BALANCED_PYRAMID" | "SENIOR_ELITE" | "TOP_HEAVY";
  strategicSummary: string;
}

/**
 * Evaluate the organizational pyramid of a department
 */
export function evaluateRankPyramid(dept: DepartmentAggregation): RankPyramidAnalysis {
  const r = dept.headcountByRank;
  const traineesAndJuniors = (r[1] || 0) + (r[2] || 0);
  const coreEngineers = r[3] || 0;
  const seniorsAndPrincipals = (r[4] || 0) + (r[5] || 0);
  const management = (r[6] || 0) + (r[7] || 0) + (r[8] || 0) + (r[9] || 0);
  const total = dept.totalHeadcount;

  // 1. Mentorship Ratio: Juniors per Senior
  const mentorshipRatio = seniorsAndPrincipals > 0
    ? Number((traineesAndJuniors / seniorsAndPrincipals).toFixed(1))
    : traineesAndJuniors > 0 ? 99 : 0;

  let mentorshipHealth: RankPyramidAnalysis["mentorshipHealth"] = "BALANCED";
  let mentorshipBonusPct = 5;

  if (mentorshipRatio === 0) {
    mentorshipHealth = "BALANCED";
    mentorshipBonusPct = 0;
  } else if (mentorshipRatio <= 3.0) {
    mentorshipHealth = "EXCELLENT";
    mentorshipBonusPct = 18; // Close 1-on-1 and 1-on-2 mentoring accelerates junior skill growth
  } else if (mentorshipRatio <= 5.0) {
    mentorshipHealth = "BALANCED";
    mentorshipBonusPct = 10;
  } else {
    mentorshipHealth = "UNSUPERVISED";
    mentorshipBonusPct = 0; // Seniors are overwhelmed; juniors receive zero mentorship
  }

  // 2. Span of Control: Subordinates per Manager
  // Technical optimal span: 8-12; Factory floor optimal span: 20-30
  const isFactory = dept.departmentId === "MANUFACTURING";
  const optimalSpanLimit = isFactory ? 28 : 12;

  const subordinates = total - management;
  const spanRatio = management > 0
    ? Number((subordinates / management).toFixed(1))
    : subordinates;

  let spanHealth: RankPyramidAnalysis["spanHealth"] = "OPTIMAL";
  let spanPenaltyPct = 0;

  if (management === 0 && subordinates > 5) {
    spanHealth = "CRITICAL_DEFICIT";
    spanPenaltyPct = Math.min(50, Math.round((subordinates / 5) * 8));
  } else if (spanRatio > optimalSpanLimit * 1.5) {
    spanHealth = "CRITICAL_DEFICIT";
    spanPenaltyPct = Math.min(45, Math.round(((spanRatio - optimalSpanLimit) / optimalSpanLimit) * 35));
  } else if (spanRatio > optimalSpanLimit) {
    spanHealth = "STRAINED";
    spanPenaltyPct = Math.min(20, Math.round(((spanRatio - optimalSpanLimit) / optimalSpanLimit) * 20));
  } else if (spanRatio < 3 && total > 6) {
    spanHealth = "HEALTHY";
    spanPenaltyPct = 0;
  } else {
    spanHealth = "OPTIMAL";
    spanPenaltyPct = 0;
  }

  // 3. Structural Posture Classification
  let structuralPosture: RankPyramidAnalysis["structuralPosture"] = "BALANCED_PYRAMID";
  let strategicSummary = "";

  if (traineesAndJuniors > total * 0.50) {
    structuralPosture = "JUNIOR_HEAVY_ACADEMY";
    strategicSummary = "Cost-effective talent incubator. Lower current capability, but builds high homegrown talent over time.";
  } else if (seniorsAndPrincipals > total * 0.40) {
    structuralPosture = "SENIOR_ELITE";
    strategicSummary = "High-octane technical authority. Expensive payroll, but unlocks rapid breakthrough projects with near-zero error rates.";
  } else if (management > total * 0.25 && total > 8) {
    structuralPosture = "TOP_HEAVY";
    strategicSummary = "Excessive managerial overhead. Too many decision-makers for the number of operational producers.";
  } else {
    structuralPosture = "BALANCED_PYRAMID";
    strategicSummary = "Standard healthy pyramid: sufficient junior pipeline, solid engineering core, and attentive leadership.";
  }

  return {
    departmentId: dept.departmentId,
    totalPersonnel: total,
    traineesAndJuniors,
    coreEngineers,
    seniorsAndPrincipals,
    management,
    mentorshipRatio,
    mentorshipHealth,
    mentorshipBonusPct,
    spanRatio,
    spanHealth,
    spanPenaltyPct,
    structuralPosture,
    strategicSummary,
  };
}
