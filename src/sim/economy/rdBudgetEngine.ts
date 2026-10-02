/**
 * ═══════════════════════════════════════════════════════════════════════
 * R&D BUDGET ENGINE — CAPITAL ALLOCATION & TECHNOLOGY CAPABILITY
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 10, 11 & 12:
 *
 * "Money alone does NOT automatically create reputation.
 *  It creates technical development.
 *  Successful technology becomes reputation later."
 *
 * Replaces disconnected "free tech points" with real financial R&D burn:
 * 1. Player sets a monthly research budget (e.g. ₹450k/mo in 1970 up to ₹50M/mo in 2026)
 * 2. Allocates percentages across 8 research domains
 * 3. Funds active engineering projects requiring physical facilities & lead scientists
 * 4. Produces real engineering knowledge (EK) and patent-worthy technology assets
 */

import { RDCategory, RDProjectFinancial, RDBudgetAllocation } from "../../state/companyFinanceStore";
import { getInflationRecordForDate } from "./historicalInflationData";

export interface RDCapabilityOutput {
  totalMonthlyBurn: number;
  domainGains: Record<RDCategory, number>;
  unlockedTechMilestones: string[];
  engineeringKnowledgePointsProduced: number;
  completedProjects: RDProjectFinancial[];
  updatedActiveProjects: RDProjectFinancial[];
}

/** Efficiency multiplier derived from facility support (labs, dynos, wind tunnels) */
export function calculateFacilityEfficiencyMultiplier(
  hasDedicatedLab: boolean,
  hasDynoOrTrack: boolean,
  hasWindTunnel: boolean,
  leadEngineersAssigned: number
): number {
  let multiplier = 0.85; // Baseline shed workshop
  if (hasDedicatedLab) multiplier += 0.25;
  if (hasDynoOrTrack) multiplier += 0.20;
  if (hasWindTunnel) multiplier += 0.30;
  // Scientist scaling (diminishing returns above 30 engineers)
  const engineerBonus = Math.min(0.50, Math.sqrt(leadEngineersAssigned) * 0.09);
  return Number((multiplier + engineerBonus).toFixed(2));
}

/**
 * Advance R&D programs for the current month
 */
export function processMonthlyRDBudget(
  budget: RDBudgetAllocation,
  facilityMultiplier: number = 1.0,
  year?: number,
  month?: number
): RDCapabilityOutput {
  const { totalMonthlyBudget, allocations, activeProjects } = budget;

  const cpiMult = (year !== undefined && month !== undefined)
    ? getInflationRecordForDate(year, month).generalCPI
    : 1.0;
  const costPerPoint = 100000 * cpiMult;

  // 1. Calculate spending per category
  const domainSpending: Record<RDCategory, number> = {
    PERFORMANCE: 0,
    RELIABILITY: 0,
    SAFETY: 0,
    DESIGN: 0,
    LUXURY: 0,
    MANUFACTURING: 0,
    ELECTRONICS: 0,
    MOTORSPORT: 0,
  };

  const domainGains: Record<RDCategory, number> = { ...domainSpending };

  let totalSpent = 0;
  for (const cat of Object.keys(allocations) as RDCategory[]) {
    const pct = allocations[cat] || 0;
    const catBudget = (totalMonthlyBudget * pct) / 100;
    domainSpending[cat] = catBudget;
    totalSpent += catBudget;

    // Convert ₹ into capability points (e.g. ₹100,000 * cpiMult * facilityMult = 1.0 point)
    domainGains[cat] = Number(((catBudget / costPerPoint) * facilityMultiplier).toFixed(2));
  }

  // 2. Advance active research projects
  const completedProjects: RDProjectFinancial[] = [];
  const updatedActiveProjects: RDProjectFinancial[] = [];
  const unlockedTechMilestones: string[] = [];

  for (const proj of activeProjects) {
    if (proj.status !== "ACTIVE") {
      updatedActiveProjects.push(proj);
      continue;
    }

    const burn = Math.min(proj.monthlyCost, proj.remaining);
    const newSpent = proj.spent + burn;
    const newRemaining = Math.max(0, proj.totalBudget - newSpent);
    const newMonths = Math.max(0, proj.monthsRemaining - 1);

    if (newRemaining <= 0 || newMonths <= 0) {
      const finished: RDProjectFinancial = {
        ...proj,
        spent: proj.totalBudget,
        remaining: 0,
        monthsRemaining: 0,
        status: "COMPLETED",
      };
      completedProjects.push(finished);
      updatedActiveProjects.push(finished);
      unlockedTechMilestones.push(proj.name);
    } else {
      updatedActiveProjects.push({
        ...proj,
        spent: newSpent,
        remaining: newRemaining,
        monthsRemaining: newMonths,
      });
    }
  }

  const ekProduced = Math.round((totalSpent / 50000) * facilityMultiplier);

  return {
    totalMonthlyBurn: totalSpent,
    domainGains,
    unlockedTechMilestones,
    engineeringKnowledgePointsProduced: ekProduced,
    completedProjects,
    updatedActiveProjects,
  };
}
