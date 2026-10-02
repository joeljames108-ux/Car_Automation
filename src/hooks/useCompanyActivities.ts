/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMPANY ACTIVITIES HOOK (LIVE PROJECT AGGREGATOR)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Unifies the three live company streams:
 * 1. Vehicle Production (active batches from activeProductionStore)
 * 2. R&D Projects (active research from rdTreeStore)
 * 3. HQ Upgrades & Construction (active jobs from campusStore)
 *
 * If no activities are active in any domain, reports isIdle = true.
 */

import { useMemo } from "react";
import { useActiveProductionStore, ActiveProductionRun } from "../state/activeProductionStore";
import { useRDTreeStore, ActiveResearch } from "../state/rdTreeStore";
import { useCampusStore } from "../state/campusStore";
import { ConstructionJob } from "../sim/campus/constructionQueue";

export type ActivityType = "car_production" | "rnd" | "hq_upgrade";

export interface ActivityMetric {
  label: string;
  value: string;
  sub: string;
  progressPct: number;
  iconType: "car" | "gauge" | "flask" | "building" | "clock" | "users" | "dollar" | "scale";
  colorTheme: "blue" | "green" | "purple" | "amber";
}

export interface ActivityStageBreakdown {
  name: string;
  pct: number;
  color: string;
  statusLabel: string;
}

export interface CompanyActivity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  badgeLabel: string;
  durationLeftText: string;
  durationTotalText: string;
  progressPct: number;
  stageAction: string;
  actionButtonText: string;
  metrics: ActivityMetric[];
  stages: ActivityStageBreakdown[];
}

export function formatDurationDays(days: number): string {
  if (days <= 0) return "Finishing today";
  if (days === 1) return "1 day left";
  if (days < 14) return `${days} days left`;
  if (days < 60) {
    const weeks = Math.round(days / 7);
    return weeks === 1 ? "1 week left" : `${weeks} weeks left`;
  }
  const months = (days / 30.4).toFixed(1);
  return `${months} months left`;
}

export function formatDurationMonths(months: number): string {
  if (months <= 0) return "Finishing this month";
  if (months < 1) {
    const days = Math.max(1, Math.round(months * 30.4));
    return `${days} days left`;
  }
  if (months < 2) {
    const weeks = Math.round(months * 4.3);
    return `${weeks} weeks left`;
  }
  return `${months.toFixed(1)} months left`;
}

export function computeCompanyActivities(
  activeRuns: ActiveProductionRun[],
  activeResearch: ActiveResearch | null,
  constructionJobs: ConstructionJob[],
  factoryState: ReturnType<typeof useCampusStore.getState>["factoryState"]
): CompanyActivity[] {
  const list: CompanyActivity[] = [];

  // 1. CAR PRODUCTION RUNS
  const inProgressRuns = activeRuns.filter((r) => r.status === "IN_PRODUCTION");
  for (const run of inProgressRuns) {
    const daysElapsed = Math.max(0, run.daysTotal - run.daysRemaining);
      const pct = Math.min(100, Math.max(0, Math.round((daysElapsed / run.daysTotal) * 100)));
      const durationLeft = formatDurationDays(run.daysRemaining);
      const durationTotal = formatDurationDays(run.daysTotal);

      // 4-stage manufacturing progression breakdown
      const stage1 = Math.min(100, Math.round((pct / 25) * 100));
      const stage2 = pct < 25 ? 0 : Math.min(100, Math.round(((pct - 25) / 25) * 100));
      const stage3 = pct < 50 ? 0 : Math.min(100, Math.round(((pct - 50) / 25) * 100));
      const stage4 = pct < 75 ? 0 : Math.min(100, Math.round(((pct - 75) / 25) * 100));

      list.push({
        id: run.id,
        type: "car_production",
        title: run.vehicleName,
        subtitle:
          run.type === "in_house"
            ? `In-House Batch Assembly • ${(run.factoryTier || "Plant").replace(/_/g, " ").toUpperCase()}`
            : `Contract Outsourced Assembly • ${run.partnerName || "Industrial Partner"}`,
        badgeLabel: "CAR PRODUCTION",
        durationLeftText: durationLeft,
        durationTotalText: durationTotal,
        progressPct: pct,
        stageAction: "manufacturing",
        actionButtonText: "VIEW PRODUCTION",
        metrics: [
          {
            label: "UNITS PRODUCED:",
            value: `${run.producedUnits.toLocaleString()} / ${run.totalUnits.toLocaleString()}`,
            sub: "ASSEMBLY IN PROGRESS",
            progressPct: pct,
            iconType: "car",
            colorTheme: "blue",
          },
          {
            label: "DAILY THROUGHPUT:",
            value: `${run.dailyRate} Units / Day`,
            sub: `${run.shiftCount} SHIFTS ACTIVE`,
            progressPct: Math.min(100, Math.round((run.dailyRate / 80) * 100)),
            iconType: "gauge",
            colorTheme: "green",
          },
          {
            label: "TIME REMAINING:",
            value: durationLeft,
            sub: `${daysElapsed} OF ${run.daysTotal} DAYS`,
            progressPct: 100 - pct,
            iconType: "clock",
            colorTheme: "purple",
          },
          {
            label: "BATCH COMMITMENT:",
            value: `$${(run.totalCostUSD || 0).toLocaleString()}`,
            sub: `$${Math.round(run.unitCostUSD || 0)} / UNIT`,
            progressPct: 60,
            iconType: "dollar",
            colorTheme: "amber",
          },
        ],
        stages: [
          {
            name: "Body Stamping & Frame Rig",
            pct: stage1,
            color: "bg-blue-500",
            statusLabel: stage1 === 100 ? "Complete" : `${stage1}%`,
          },
          {
            name: "Powertrain & Suspension Fit",
            pct: stage2,
            color: "bg-emerald-500",
            statusLabel: stage2 === 100 ? "Complete" : `${stage2}%`,
          },
          {
            name: "Paint Shop & Interior Craft",
            pct: stage3,
            color: "bg-purple-500",
            statusLabel: stage3 === 100 ? "Complete" : `${stage3}%`,
          },
          {
            name: "Final Inspection & Dyno Sign-Off",
            pct: stage4,
            color: "bg-amber-500",
            statusLabel: stage4 === 100 ? "Complete" : `${stage4}%`,
          },
        ],
      });
    }

    // 2. ACTIVE R&D RESEARCH
    if (activeResearch) {
      const remainingMonths = Math.max(0, activeResearch.totalMonths - activeResearch.progressMonths);
      const pct = Math.min(
        100,
        Math.max(0, Math.round((activeResearch.progressMonths / activeResearch.totalMonths) * 100))
      );
      const durationLeft = formatDurationMonths(remainingMonths);
      const durationTotal = formatDurationMonths(activeResearch.totalMonths);

      const stage1 = Math.min(100, Math.round((pct / 25) * 100));
      const stage2 = pct < 25 ? 0 : Math.min(100, Math.round(((pct - 25) / 25) * 100));
      const stage3 = pct < 50 ? 0 : Math.min(100, Math.round(((pct - 50) / 25) * 100));
      const stage4 = pct < 75 ? 0 : Math.min(100, Math.round(((pct - 75) / 25) * 100));

      list.push({
        id: `rnd_${activeResearch.nodeId}`,
        type: "rnd",
        title: activeResearch.name,
        subtitle: `${activeResearch.departmentId.toUpperCase().replace(/_/g, " ")} • ${activeResearch.branchId.toUpperCase().replace(/_/g, " ")}`,
        badgeLabel: "R&D PROJECT",
        durationLeftText: durationLeft,
        durationTotalText: durationTotal,
        progressPct: pct,
        stageAction: "rd",
        actionButtonText: "VIEW R&D TREE",
        metrics: [
          {
            label: "RESEARCH PROGRESS:",
            value: `${activeResearch.progressMonths.toFixed(1)} / ${activeResearch.totalMonths} Mos`,
            sub: "LAB TESTING ACTIVE",
            progressPct: pct,
            iconType: "flask",
            colorTheme: "blue",
          },
          {
            label: "ASSIGNED SCIENTISTS:",
            value: `${activeResearch.assignedScientists} Engineers`,
            sub: "DEDICATED RESEARCH TEAM",
            progressPct: Math.min(100, activeResearch.assignedScientists * 10),
            iconType: "users",
            colorTheme: "green",
          },
          {
            label: "TIME REMAINING:",
            value: durationLeft,
            sub: `OUT OF ${activeResearch.totalMonths} MONTHS`,
            progressPct: 100 - pct,
            iconType: "clock",
            colorTheme: "purple",
          },
          {
            label: "RESEARCH BUDGET:",
            value: `€${activeResearch.cost.toLocaleString()}`,
            sub: "CAPITAL COMMITTED",
            progressPct: 70,
            iconType: "dollar",
            colorTheme: "amber",
          },
        ],
        stages: [
          {
            name: "Theoretical Modeling & CAD",
            pct: stage1,
            color: "bg-blue-500",
            statusLabel: stage1 === 100 ? "Complete" : `${stage1}%`,
          },
          {
            name: "Prototype Test Rigging",
            pct: stage2,
            color: "bg-emerald-500",
            statusLabel: stage2 === 100 ? "Complete" : `${stage2}%`,
          },
          {
            name: "Thermal & Stress Validation",
            pct: stage3,
            color: "bg-purple-500",
            statusLabel: stage3 === 100 ? "Complete" : `${stage3}%`,
          },
          {
            name: "Production Tooling Spec",
            pct: stage4,
            color: "bg-amber-500",
            statusLabel: stage4 === 100 ? "Complete" : `${stage4}%`,
          },
        ],
      });
    }

    // 3. HQ UPGRADES & CAMPUS CONSTRUCTION
    const activeJobs = constructionJobs.filter((j) => j.status === "in_progress");
    for (const job of activeJobs) {
      const remainingMonths = Math.max(0, job.totalMonthsRequired - job.monthsElapsed);
      const pct = Math.min(100, Math.max(0, job.progressPct));
      const durationLeft = formatDurationMonths(remainingMonths);
      const durationTotal = formatDurationMonths(job.totalMonthsRequired);

      const stage1 = Math.min(100, Math.round((pct / 25) * 100));
      const stage2 = pct < 25 ? 0 : Math.min(100, Math.round(((pct - 25) / 25) * 100));
      const stage3 = pct < 50 ? 0 : Math.min(100, Math.round(((pct - 50) / 25) * 100));
      const stage4 = pct < 75 ? 0 : Math.min(100, Math.round(((pct - 75) / 25) * 100));

      list.push({
        id: job.jobId,
        type: "hq_upgrade",
        title: `${job.unitName} (Level ${job.targetLevel})`,
        subtitle: `Campus Expansion • ${job.contractorTier || "Standard"} Contractor`,
        badgeLabel: "HQ UPGRADE",
        durationLeftText: durationLeft,
        durationTotalText: durationTotal,
        progressPct: pct,
        stageAction: "hq",
        actionButtonText: "VIEW HQ CAMPUS",
        metrics: [
          {
            label: "CONSTRUCTION PROGRESS:",
            value: `${job.monthsElapsed} / ${job.totalMonthsRequired} Mos`,
            sub: "CIVIL WORKS ONGOING",
            progressPct: pct,
            iconType: "building",
            colorTheme: "blue",
          },
          {
            label: "SITE WORKFORCE:",
            value: `${job.assignedWorkers} Specialists`,
            sub: `${(job.contractorTier || "Standard").toUpperCase()} CREW`,
            progressPct: Math.min(100, job.assignedWorkers * 8),
            iconType: "users",
            colorTheme: "green",
          },
          {
            label: "TIME REMAINING:",
            value: durationLeft,
            sub: `LEVEL ${job.targetLevel} COMMISSIONING`,
            progressPct: 100 - pct,
            iconType: "clock",
            colorTheme: "purple",
          },
          {
            label: "CIVIL CAPEX:",
            value: `$${job.totalCost.toLocaleString()}`,
            sub: "FUNDS DISBURSED",
            progressPct: 80,
            iconType: "dollar",
            colorTheme: "amber",
          },
        ],
        stages: [
          {
            name: "Excavation & Foundations",
            pct: stage1,
            color: "bg-blue-500",
            statusLabel: stage1 === 100 ? "Complete" : `${stage1}%`,
          },
          {
            name: "Superstructure & Shell",
            pct: stage2,
            color: "bg-emerald-500",
            statusLabel: stage2 === 100 ? "Complete" : `${stage2}%`,
          },
          {
            name: "HVAC & Testing Equipment",
            pct: stage3,
            color: "bg-purple-500",
            statusLabel: stage3 === 100 ? "Complete" : `${stage3}%`,
          },
          {
            name: "Commissioning & Safety Sign-Off",
            pct: stage4,
            color: "bg-amber-500",
            statusLabel: stage4 === 100 ? "Complete" : `${stage4}%`,
          },
        ],
      });
    }

    // 4. FACTORY GREENFIELD CONSTRUCTION (if underway via factoryState)
    if (factoryState.ownershipStatus === "under_construction" && factoryState.constructionMonthsRemaining > 0) {
      const totalMos = 12; // Standard factory construction
      const elapsed = Math.max(0, totalMos - factoryState.constructionMonthsRemaining);
      const pct = Math.min(100, Math.max(0, factoryState.constructionProgressPct || Math.round((elapsed / totalMos) * 100)));
      const durationLeft = formatDurationMonths(factoryState.constructionMonthsRemaining);
      const durationTotal = formatDurationMonths(totalMos);

      const stage1 = Math.min(100, Math.round((pct / 25) * 100));
      const stage2 = pct < 25 ? 0 : Math.min(100, Math.round(((pct - 25) / 25) * 100));
      const stage3 = pct < 50 ? 0 : Math.min(100, Math.round(((pct - 50) / 25) * 100));
      const stage4 = pct < 75 ? 0 : Math.min(100, Math.round(((pct - 75) / 25) * 100));

      list.push({
        id: "factory_greenfield_construction",
        type: "hq_upgrade",
        title: factoryState.factoryName || "Automotive Assembly Plant",
        subtitle: `Industrial Greenfield Construction • Tier ${factoryState.factoryLevel || 1}`,
        badgeLabel: "FACTORY CONSTRUCTION",
        durationLeftText: durationLeft,
        durationTotalText: durationTotal,
        progressPct: pct,
        stageAction: "hq",
        actionButtonText: "VIEW HQ CAMPUS",
        metrics: [
          {
            label: "CONSTRUCTION PROGRESS:",
            value: `${elapsed} / ${totalMos} Mos`,
            sub: "STRUCTURAL ERECTION",
            progressPct: pct,
            iconType: "building",
            colorTheme: "blue",
          },
          {
            label: "ANNUAL CAPACITY:",
            value: `${(factoryState.annualCapacity || 5000).toLocaleString()} Units / Yr`,
            sub: "PROJECTED RATED OUTPUT",
            progressPct: 50,
            iconType: "gauge",
            colorTheme: "green",
          },
          {
            label: "TIME REMAINING:",
            value: durationLeft,
            sub: `${factoryState.constructionMonthsRemaining} MOS REMAINING`,
            progressPct: 100 - pct,
            iconType: "clock",
            colorTheme: "purple",
          },
          {
            label: "CAPITAL INVESTED:",
            value: `$${(factoryState.constructionBudgetSpent || 0).toLocaleString()}`,
            sub: `OF $${(factoryState.constructionTotalBudget || 0).toLocaleString()}`,
            progressPct: Math.min(100, Math.round(((factoryState.constructionBudgetSpent || 0) / (factoryState.constructionTotalBudget || 1)) * 100)),
            iconType: "dollar",
            colorTheme: "amber",
          },
        ],
        stages: [
          {
            name: "Site Preparation & Heavy Foundations",
            pct: stage1,
            color: "bg-blue-500",
            statusLabel: stage1 === 100 ? "Complete" : `${stage1}%`,
          },
          {
            name: "Main Stamping & Assembly Bays",
            pct: stage2,
            color: "bg-emerald-500",
            statusLabel: stage2 === 100 ? "Complete" : `${stage2}%`,
          },
          {
            name: "Robotics & Paint Conveyor Installation",
            pct: stage3,
            color: "bg-purple-500",
            statusLabel: stage3 === 100 ? "Complete" : `${stage3}%`,
          },
          {
            name: "Pilot Assembly Run & QA Calibration",
            pct: stage4,
            color: "bg-amber-500",
            statusLabel: stage4 === 100 ? "Complete" : `${stage4}%`,
          },
        ],
      });
    }

    return list;
}

export function getCompanyActivitiesSnapshot() {
  const activeRuns = useActiveProductionStore.getState().activeRuns;
  const activeResearch = useRDTreeStore.getState().activeProject;
  const constructionJobs = useCampusStore.getState().constructionJobs;
  const factoryState = useCampusStore.getState().factoryState;

  const activities = computeCompanyActivities(
    activeRuns,
    activeResearch,
    constructionJobs,
    factoryState
  );

  return {
    activities,
    isIdle: activities.length === 0,
    activeCount: activities.length,
    carProductionRuns: activities.filter((a) => a.type === "car_production"),
    rndProjects: activities.filter((a) => a.type === "rnd"),
    hqUpgrades: activities.filter((a) => a.type === "hq_upgrade"),
  };
}

export function useCompanyActivities() {
  const activeRuns = useActiveProductionStore((s) => s.activeRuns);
  const activeResearch = useRDTreeStore((s) => s.activeProject);
  const constructionJobs = useCampusStore((s) => s.constructionJobs);
  const factoryState = useCampusStore((s) => s.factoryState);

  const activities = useMemo(
    () => computeCompanyActivities(activeRuns, activeResearch, constructionJobs, factoryState),
    [activeRuns, activeResearch, constructionJobs, factoryState]
  );

  return {
    activities,
    isIdle: activities.length === 0,
    activeCount: activities.length,
    carProductionRuns: activities.filter((a) => a.type === "car_production"),
    rndProjects: activities.filter((a) => a.type === "rnd"),
    hqUpgrades: activities.filter((a) => a.type === "hq_upgrade"),
  };
}

