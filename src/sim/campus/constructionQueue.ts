/**
 * AUTO TYCOON CAMPUS HQ - CONSTRUCTION QUEUE MANAGER (PHASE 5)
 * 
 * Manages active campus civil engineering and building upgrade jobs,
 * tracking monthly construction progress, material allocations, and worker headcount.
 * 
 * Rules:
 * - Simultaneous job limits: Max 2 concurrent projects in 1970.
 * - Expands by +1 concurrent project for every 2 levels of Corporate HQ.
 */

import { CampusUnitId } from "./campusTypes";
import { ConstructionResourceCost } from "./constructionResources";
import { getBuildingLevelRequirements } from "./buildingProgression";

export type ConstructionJobStatus =
  | "queued"
  | "in_progress"
  | "paused_materials"
  | "paused_weather"
  | "completed"
  | "cancelled";

export type ContractorTier = "budget" | "standard" | "premium";

export interface ContractorDetails {
  tier: ContractorTier;
  name: string;
  costMultiplier: number;        // 0.82x for budget, 1.0x standard, 1.35x premium
  durationMultiplier: number;    // 1.25x for budget, 1.0x standard, 0.70x premium
  qualityPrestigeBonus: number;  // 0 for budget, +1 standard, +4 premium
  riskOfDelayPct: number;        // 15% budget, 5% standard, 0% premium
  description: string;
}

export const CONTRACTOR_TIERS: Record<ContractorTier, ContractorDetails> = {
  budget: {
    tier: "budget",
    name: "General Union Subcontractors",
    costMultiplier: 0.82,
    durationMultiplier: 1.25,
    qualityPrestigeBonus: 0,
    riskOfDelayPct: 15,
    description: "Low-cost regional contractors. -18% Capex, but +25% duration and 15% delay risk.",
  },
  standard: {
    tier: "standard",
    name: "Standard Civil Engineering Partners",
    costMultiplier: 1.0,
    durationMultiplier: 1.0,
    qualityPrestigeBonus: 1,
    riskOfDelayPct: 5,
    description: "Experienced regional construction firm with reliable timelines and ISO safety compliance.",
  },
  premium: {
    tier: "premium",
    name: "Apex Masterworks Fast-Track Consortium",
    costMultiplier: 1.35,
    durationMultiplier: 0.7,
    qualityPrestigeBonus: 4,
    riskOfDelayPct: 0,
    description: "Elite expedited construction with modular pre-fabrication, 24/7 shifts, and 30% faster commissioning (+4 Prestige).",
  },
};

export interface ConstructionJob {
  jobId: string;
  unitId: CampusUnitId;
  unitName: string;
  startLevel: number;
  targetLevel: number;
  startDateYear: number;
  startDateMonth: number;
  totalMonthsRequired: number;
  monthsElapsed: number;
  progressPct: number;
  totalCost: number;
  resourcesCommitted: ConstructionResourceCost[];
  assignedWorkers: number;
  status: ConstructionJobStatus;
  statusMessage: string;
  contractorTier?: ContractorTier;
}

export interface ConstructionQueueState {
  jobs: ConstructionJob[];
  maxConcurrentJobs: number;
}

/**
 * Calculate maximum concurrent construction projects permitted based on Corporate HQ level.
 * Level 1: 2 jobs
 * Level 3: 3 jobs
 * Level 5: 4 jobs
 * Level 7: 5 jobs
 */
export function getMaxConcurrentConstructionJobs(corpHqLevel: number = 1): number {
  return 2 + Math.floor(Math.max(1, corpHqLevel) / 2);
}

/**
 * Enqueue a new construction job
 */
export function enqueueConstructionJob(
  currentJobs: ConstructionJob[],
  unitId: CampusUnitId,
  unitName: string,
  currentLevel: number,
  targetLevel: number,
  year: number,
  month: number,
  corpHqLevel: number = 1,
  contractorTier: ContractorTier = "standard"
): { success: boolean; error?: string; updatedJobs: ConstructionJob[]; createdJob?: ConstructionJob } {
  // Check if job for unit already exists
  const existingJob = currentJobs.find(
    (j) => j.unitId === unitId && (j.status === "in_progress" || j.status === "queued")
  );
  if (existingJob) {
    return {
      success: false,
      error: `Unit ${unitName} is already undergoing construction (Job ${existingJob.jobId}).`,
      updatedJobs: currentJobs,
    };
  }

  const activeCount = currentJobs.filter((j) => j.status === "in_progress" || j.status === "queued").length;
  const maxAllowed = getMaxConcurrentConstructionJobs(corpHqLevel);
  if (activeCount >= maxAllowed) {
    return {
      success: false,
      error: `Construction capacity full (${activeCount}/${maxAllowed} active projects). Upgrade Corporate HQ to manage more simultaneous construction.`,
      updatedJobs: currentJobs,
    };
  }

  const req = getBuildingLevelRequirements(unitId, targetLevel, year);
  const contractor = CONTRACTOR_TIERS[contractorTier] || CONTRACTOR_TIERS.standard;
  const adjustedCost = Math.round(req.estimatedCost * contractor.costMultiplier);
  const adjustedMonths = Math.max(1, Math.round(req.constructionMonths * contractor.durationMultiplier));
  const jobId = `JOB_${unitId}_L${targetLevel}_${Date.now()}`;

  const newJob: ConstructionJob = {
    jobId,
    unitId,
    unitName,
    startLevel: currentLevel,
    targetLevel,
    startDateYear: year,
    startDateMonth: month,
    totalMonthsRequired: adjustedMonths,
    monthsElapsed: 0,
    progressPct: 0,
    totalCost: adjustedCost,
    resourcesCommitted: req.requiredMaterials,
    assignedWorkers: Math.max(25, targetLevel * 30),
    status: "in_progress",
    statusMessage: `Contractor: ${contractor.name} (${contractorTier.toUpperCase()}). Foundations and frame underway for Tier ${req.tierLabel}.`,
    contractorTier,
  };

  return {
    success: true,
    updatedJobs: [...currentJobs, newJob],
    createdJob: newJob,
  };
}

export interface TickConstructionResult {
  updatedJobs: ConstructionJob[];
  completedJobs: ConstructionJob[];
}

/**
 * Advance construction progress across all active jobs by deltaMonths.
 */
export function tickConstructionQueue(
  currentJobs: ConstructionJob[],
  deltaMonths: number = 1
): TickConstructionResult {
  const completedJobs: ConstructionJob[] = [];
  const updatedJobs: ConstructionJob[] = [];

  for (const job of currentJobs) {
    if (job.status !== "in_progress") {
      updatedJobs.push(job);
      continue;
    }

    const newElapsed = job.monthsElapsed + deltaMonths;
    const progressPct = Math.min(100, Math.round((newElapsed / job.totalMonthsRequired) * 100));

    if (newElapsed >= job.totalMonthsRequired) {
      const finishedJob: ConstructionJob = {
        ...job,
        monthsElapsed: job.totalMonthsRequired,
        progressPct: 100,
        status: "completed",
        statusMessage: `Construction complete! Upgraded to Level ${job.targetLevel}.`,
      };
      completedJobs.push(finishedJob);
      updatedJobs.push(finishedJob);
    } else {
      updatedJobs.push({
        ...job,
        monthsElapsed: newElapsed,
        progressPct,
        statusMessage: `Construction progressing: ${progressPct}% complete (${job.totalMonthsRequired - newElapsed} months remaining).`,
      });
    }
  }

  return { updatedJobs, completedJobs };
}

/**
 * Cancel an in-progress construction job
 */
export function cancelConstructionJob(
  currentJobs: ConstructionJob[],
  jobId: string
): { success: boolean; updatedJobs: ConstructionJob[] } {
  const target = currentJobs.find((j) => j.jobId === jobId);
  if (!target) {
    return { success: false, updatedJobs: currentJobs };
  }

  const updatedJobs = currentJobs.map((j) => {
    if (j.jobId === jobId) {
      return {
        ...j,
        status: "cancelled" as ConstructionJobStatus,
        statusMessage: "Construction cancelled by management.",
      };
    }
    return j;
  });

  return { success: true, updatedJobs };
}

export function getActiveJobs(jobs: ConstructionJob[]): ConstructionJob[] {
  return jobs.filter((j) => j.status === "in_progress" || j.status === "queued");
}

export function getJobForUnit(jobs: ConstructionJob[], unitId: CampusUnitId): ConstructionJob | undefined {
  return jobs.find((j) => j.unitId === unitId && (j.status === "in_progress" || j.status === "queued"));
}
