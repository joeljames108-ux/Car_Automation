/**
 * ═══════════════════════════════════════════════════════════════════════
 * FACTORY WORKFORCE SKILL & EXPERIENCE PROGRESSION ENGINE (PHASE 2)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements technician skill tiers, assembly takt-time speedups,
 * defect reductions, training academies, and turnover mechanics.
 *
 * Tiers:
 * 1. TRAINEE     (0–90 days)    : Baseline speed (+0%), baseline defect (+0%)
 * 2. JOURNEYMAN  (91–360 days)  : Faster cycle (-3%), lower defects (-0.4%)
 * 3. SENIOR      (361–720 days) : High precision (-6% cycle), (-0.8% defect)
 * 4. MASTER      (721+ days)    : Master craftsman (-10% cycle), (-1.2% defect)
 */

export type WorkerSkillTier = "TRAINEE" | "JOURNEYMAN" | "SENIOR" | "MASTER";

export interface LineWorkforceSkill {
  lineId: string;
  totalWorkers: number;
  traineeCount: number;
  journeymanCount: number;
  seniorCount: number;
  masterCount: number;
  averageDaysExperience: number;
  effectiveCycleMultiplier: number; // e.g. 0.94 (6% faster)
  effectiveDefectModifier: number;  // e.g. -0.8 (-0.8% defects)
  trainingProgramActive: boolean;
  trainingDaysRemaining?: number;
}

export const TIER_NORMS = {
  TRAINEE: {
    minDays: 0,
    maxDays: 90,
    cycleMultiplier: 1.0,
    defectModifierPct: 0.0,
  },
  JOURNEYMAN: {
    minDays: 91,
    maxDays: 360,
    cycleMultiplier: 0.97,
    defectModifierPct: -0.4,
  },
  SENIOR: {
    minDays: 361,
    maxDays: 720,
    cycleMultiplier: 0.94,
    defectModifierPct: -0.8,
  },
  MASTER: {
    minDays: 721,
    maxDays: Infinity,
    cycleMultiplier: 0.90,
    defectModifierPct: -1.2,
  },
};

export const TRAINING_PROGRAM_COST_USD = 15000;
export const TRAINING_PROGRAM_DURATION_DAYS = 30;
export const TRAINING_XP_ACCELERATION_FACTOR = 2.5;

/**
 * Computes weighted line cycle and defect modifiers based on skill distribution.
 */
export function calculateSkillMultipliers(
  traineeCount: number,
  journeymanCount: number,
  seniorCount: number,
  masterCount: number
): { effectiveCycleMultiplier: number; effectiveDefectModifier: number } {
  const total = traineeCount + journeymanCount + seniorCount + masterCount;
  if (total <= 0) {
    return { effectiveCycleMultiplier: 1.0, effectiveDefectModifier: 0.0 };
  }

  const weightedCycle =
    (traineeCount * TIER_NORMS.TRAINEE.cycleMultiplier +
      journeymanCount * TIER_NORMS.JOURNEYMAN.cycleMultiplier +
      seniorCount * TIER_NORMS.SENIOR.cycleMultiplier +
      masterCount * TIER_NORMS.MASTER.cycleMultiplier) /
    total;

  const weightedDefect =
    (traineeCount * TIER_NORMS.TRAINEE.defectModifierPct +
      journeymanCount * TIER_NORMS.JOURNEYMAN.defectModifierPct +
      seniorCount * TIER_NORMS.SENIOR.defectModifierPct +
      masterCount * TIER_NORMS.MASTER.defectModifierPct) /
    total;

  return {
    effectiveCycleMultiplier: Math.round(weightedCycle * 1000) / 1000,
    effectiveDefectModifier: Math.round(weightedDefect * 100) / 100,
  };
}

/**
 * Initializes workforce skill profile for a newly built or existing line.
 */
export function initializeLineSkill(
  lineId: string,
  totalWorkers: number,
  experienceTier: "NEW_CREW" | "BALANCED" | "VETERAN" = "BALANCED"
): LineWorkforceSkill {
  const count = Math.max(1, totalWorkers);
  let trainee = 0;
  let journeyman = 0;
  let senior = 0;
  let master = 0;
  let avgDays = 0;

  if (experienceTier === "NEW_CREW") {
    trainee = Math.round(count * 0.8);
    journeyman = count - trainee;
    avgDays = 45;
  } else if (experienceTier === "VETERAN") {
    master = Math.round(count * 0.25);
    senior = Math.round(count * 0.45);
    journeyman = count - (master + senior);
    avgDays = 600;
  } else {
    // BALANCED
    trainee = Math.round(count * 0.35);
    journeyman = Math.round(count * 0.45);
    senior = Math.round(count * 0.15);
    master = count - (trainee + journeyman + senior);
    avgDays = 220;
  }

  const mults = calculateSkillMultipliers(trainee, journeyman, senior, master);

  return {
    lineId,
    totalWorkers: count,
    traineeCount: trainee,
    journeymanCount: journeyman,
    seniorCount: senior,
    masterCount: master,
    averageDaysExperience: avgDays,
    effectiveCycleMultiplier: mults.effectiveCycleMultiplier,
    effectiveDefectModifier: mults.effectiveDefectModifier,
    trainingProgramActive: false,
  };
}

export interface SkillTickResult {
  updatedSkill: LineWorkforceSkill;
  promotions: { fromTier: WorkerSkillTier; toTier: WorkerSkillTier; count: number }[];
  trainingCompleted: boolean;
}

/**
 * Ticks experience and handles promotions when a line is operating.
 */
export function tickWorkerExperience(
  skill: LineWorkforceSkill,
  elapsedDays = 1,
  isProducing = true
): SkillTickResult {
  if (elapsedDays <= 0) {
    return { updatedSkill: skill, promotions: [], trainingCompleted: false };
  }

  let trainingActive = skill.trainingProgramActive;
  let trainingDaysRemaining = skill.trainingDaysRemaining;
  let trainingCompleted = false;

  // Process training countdown
  if (trainingActive && trainingDaysRemaining !== undefined) {
    trainingDaysRemaining = Math.max(0, trainingDaysRemaining - elapsedDays);
    if (trainingDaysRemaining === 0) {
      trainingActive = false;
      trainingCompleted = true;
    }
  }

  // If line is idle, workers don't gain production experience
  if (!isProducing) {
    return {
      updatedSkill: {
        ...skill,
        trainingProgramActive: trainingActive,
        trainingDaysRemaining,
      },
      promotions: [],
      trainingCompleted,
    };
  }

  // Calculate experience gain with optional training accelerator
  const xpGainMultiplier = trainingActive ? TRAINING_XP_ACCELERATION_FACTOR : 1.0;
  const daysGained = elapsedDays * xpGainMultiplier;
  const nextAvgDays = Math.round((skill.averageDaysExperience + daysGained) * 10) / 10;

  let trainee = skill.traineeCount;
  let journeyman = skill.journeymanCount;
  let senior = skill.seniorCount;
  let master = skill.masterCount;
  const promotions: SkillTickResult["promotions"] = [];

  // Graduation probability per day:
  // Trainees graduate to Journeyman over ~90 days (1 / 90 ~ 1.1% per day per trainee)
  const traineePromoRate = (0.011 * daysGained);
  const eligibleTrainees = Math.min(trainee, Math.floor(trainee * traineePromoRate) || (Math.random() < trainee * traineePromoRate ? 1 : 0));
  if (eligibleTrainees > 0) {
    trainee -= eligibleTrainees;
    journeyman += eligibleTrainees;
    promotions.push({ fromTier: "TRAINEE", toTier: "JOURNEYMAN", count: eligibleTrainees });
  }

  // Journeymen graduate to Senior over ~270 days (1 / 270 ~ 0.37% per day)
  const journeymanPromoRate = (0.0037 * daysGained);
  const eligibleJourneymen = Math.min(journeyman, Math.floor(journeyman * journeymanPromoRate) || (Math.random() < journeyman * journeymanPromoRate ? 1 : 0));
  if (eligibleJourneymen > 0) {
    journeyman -= eligibleJourneymen;
    senior += eligibleJourneymen;
    promotions.push({ fromTier: "JOURNEYMAN", toTier: "SENIOR", count: eligibleJourneymen });
  }

  // Seniors graduate to Master over ~360 days (1 / 360 ~ 0.28% per day)
  const seniorPromoRate = (0.0028 * daysGained);
  const eligibleSeniors = Math.min(senior, Math.floor(senior * seniorPromoRate) || (Math.random() < senior * seniorPromoRate ? 1 : 0));
  if (eligibleSeniors > 0) {
    senior -= eligibleSeniors;
    master += eligibleSeniors;
    promotions.push({ fromTier: "SENIOR", toTier: "MASTER", count: eligibleSeniors });
  }

  const mults = calculateSkillMultipliers(trainee, journeyman, senior, master);

  return {
    updatedSkill: {
      ...skill,
      traineeCount: trainee,
      journeymanCount: journeyman,
      seniorCount: senior,
      masterCount: master,
      averageDaysExperience: nextAvgDays,
      effectiveCycleMultiplier: mults.effectiveCycleMultiplier,
      effectiveDefectModifier: mults.effectiveDefectModifier,
      trainingProgramActive: trainingActive,
      trainingDaysRemaining,
    },
    promotions,
    trainingCompleted,
  };
}

/**
 * Activates a specialized 30-day technical training program on the line.
 */
export function startTrainingProgram(skill: LineWorkforceSkill): LineWorkforceSkill {
  return {
    ...skill,
    trainingProgramActive: true,
    trainingDaysRemaining: TRAINING_PROGRAM_DURATION_DAYS,
  };
}

/**
 * Adjusts skill tiers proportionally when the line's assigned headcount changes.
 */
export function applyWorkerHeadcountChange(
  skill: LineWorkforceSkill,
  newHeadcount: number
): LineWorkforceSkill {
  const target = Math.max(1, newHeadcount);
  const oldTotal = skill.totalWorkers;

  if (target === oldTotal) return skill;

  if (target > oldTotal) {
    // Added workers start as Trainees
    const added = target - oldTotal;
    const trainee = skill.traineeCount + added;
    const mults = calculateSkillMultipliers(trainee, skill.journeymanCount, skill.seniorCount, skill.masterCount);
    return {
      ...skill,
      totalWorkers: target,
      traineeCount: trainee,
      effectiveCycleMultiplier: mults.effectiveCycleMultiplier,
      effectiveDefectModifier: mults.effectiveDefectModifier,
    };
  }

  // Reduced workers: downscale proportionally
  const ratio = target / oldTotal;
  let master = Math.max(0, Math.round(skill.masterCount * ratio));
  let senior = Math.max(0, Math.round(skill.seniorCount * ratio));
  let journeyman = Math.max(0, Math.round(skill.journeymanCount * ratio));
  let trainee = target - (master + senior + journeyman);

  if (trainee < 0) {
    trainee = 0;
    journeyman = target - (master + senior);
  }

  const mults = calculateSkillMultipliers(trainee, journeyman, senior, master);

  return {
    ...skill,
    totalWorkers: target,
    traineeCount: trainee,
    journeymanCount: journeyman,
    seniorCount: senior,
    masterCount: master,
    effectiveCycleMultiplier: mults.effectiveCycleMultiplier,
    effectiveDefectModifier: mults.effectiveDefectModifier,
  };
}

/**
 * Evaluates turnover risk for overworked or severely understaffed lines.
 */
export function evaluateTurnoverRisk(
  skill: LineWorkforceSkill,
  staffingHealthPct: number
): { updatedSkill: LineWorkforceSkill; turnoverDeparturesCount: number } {
  // Healthy lines have virtually 0 turnover
  if (staffingHealthPct >= 85) {
    return { updatedSkill: skill, turnoverDeparturesCount: 0 };
  }

  // Understaffing generates frustration (e.g. 50% health -> 2.5% daily quit roll)
  const quitRiskPct = (100 - staffingHealthPct) * 0.05;
  const roll = Math.random() * 100;

  if (roll > quitRiskPct) {
    return { updatedSkill: skill, turnoverDeparturesCount: 0 };
  }

  // One worker departs (prefer senior or master) and is replaced by a raw trainee
  let senior = skill.seniorCount;
  let master = skill.masterCount;
  let journeyman = skill.journeymanCount;
  let trainee = skill.traineeCount;

  if (senior > 0) {
    senior--;
    trainee++;
  } else if (master > 0) {
    master--;
    trainee++;
  } else if (journeyman > 0) {
    journeyman--;
    trainee++;
  } else {
    return { updatedSkill: skill, turnoverDeparturesCount: 0 };
  }

  const mults = calculateSkillMultipliers(trainee, journeyman, senior, master);

  return {
    updatedSkill: {
      ...skill,
      traineeCount: trainee,
      journeymanCount: journeyman,
      seniorCount: senior,
      masterCount: master,
      effectiveCycleMultiplier: mults.effectiveCycleMultiplier,
      effectiveDefectModifier: mults.effectiveDefectModifier,
    },
    turnoverDeparturesCount: 1,
  };
}
