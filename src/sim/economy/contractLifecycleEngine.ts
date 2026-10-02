/**
 * ═══════════════════════════════════════════════════════════════════════
 * CONTRACT LIFECYCLE ENGINE — ADVANCEMENT, SIMULATION & VALIDATION
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Manages the full progression lifecycle of 3-Tier automotive contracts:
 * - Era & reputation catalog gating
 * - Feasibility pre-flight validation (capacity, materials, R&D)
 * - Daily simulation ticking (R&D design, prototype testing, production runs)
 * - Quality outcome simulation (PPM defect calculation)
 * - Financial payouts, bonuses, and penalties
 * - Tier 3 -> Tier 1 "Design-to-Production" follow-up contract generation
 */

import {
  ActiveTieredContract,
  ContractTier,
  TieredContractTemplate,
  TierFeasibilityCheck,
} from "./contractTierTypes";
import { CONTRACT_CATALOG } from "./contractCatalogData";
import { DimensionScores, ReputationDimensionKey } from "../../state/reputationEngine";
import { FactoryTier } from "../types";
import { RDEra } from "../rdTreeTypes";

// Plant annual production capacities by factory tier
const PLANT_CAPACITIES_ANNUAL: Record<FactoryTier, number> = {
  boutique: 500,
  small_batch: 3000,
  mid_volume: 15000,
  high_volume: 50000,
  mega: 150000,
};

// Era order index for comparison
const RD_ERA_ORDER: Record<RDEra, number> = {
  classic_1970: 1,
  turbo_wedge_1980: 2,
  electronic_1990: 3,
  hybrid_2000: 4,
  modern_2015: 5,
  hyper_2026: 6,
};

/**
 * Filter contract catalog by era, year, and reputation gating
 */
export function getAvailableTieredContracts(
  year: number,
  dimensionScores: DimensionScores,
  currentRDEra: RDEra = "classic_1970",
  unlockedTechs: string[] = []
): TieredContractTemplate[] {
  const playerEraRank = RD_ERA_ORDER[currentRDEra] ?? 1;

  return CONTRACT_CATALOG.filter((contract) => {
    const gate = contract.eraGate;

    // 1. Year limits
    if (year < gate.availableFromYear) return false;
    if (gate.availableUntilYear && year > gate.availableUntilYear) return false;

    // 2. R&D Era minimum check
    if (gate.requiredRDEra) {
      const requiredRank = RD_ERA_ORDER[gate.requiredRDEra] ?? 1;
      if (playerEraRank < requiredRank) return false;
    }

    // 3. Reputation minimum check
    if (gate.requiredReputation) {
      for (const [key, minScore] of Object.entries(gate.requiredReputation)) {
        const playerScore = dimensionScores[key as ReputationDimensionKey]?.score ?? 0;
        if (playerScore < (minScore ?? 0)) {
          return false;
        }
      }
    }

    // Contracts pass gating!
    return true;
  });
}

/**
 * Pre-flight feasibility assessment for accepting a contract
 */
export function evaluateTierFeasibility(
  contract: TieredContractTemplate,
  playerState: {
    factoryTier: FactoryTier;
    shiftCount: number;
    dimensionScores: DimensionScores;
    unlockedTechs: string[];
    warehouseInventory: Array<{ itemType: string; unitsOnHand: number }>;
    activeInboundSuppliers: string[];
    cashAvailable: number;
  }
): TierFeasibilityCheck {
  const reasons: string[] = [];
  let isFeasible = true;

  // ── 1. Capacity Check (All tiers that produce) ──
  const annualPlantCap = PLANT_CAPACITIES_ANNUAL[playerState.factoryTier] || 3000;
  const shiftMultiplier = playerState.shiftCount === 1 ? 0.45 : playerState.shiftCount === 2 ? 0.8 : 1.0;
  const effectiveMonthlyCapacity = Math.round((annualPlantCap * shiftMultiplier) / 12);
  const requiredMonthly = Math.ceil(contract.deliverables.annualVolume / 12);

  const capacityPassed = effectiveMonthlyCapacity >= requiredMonthly * 0.7; // allow 30% surge
  if (!capacityPassed) {
    isFeasible = false;
    reasons.push(
      `Insufficient plant capacity: needs ${requiredMonthly.toLocaleString()}/mo, factory supports ${effectiveMonthlyCapacity.toLocaleString()}/mo.`
    );
  }

  // ── 2. Materials & Process Check (Tier 2 & 3) ──
  const missingMaterials: string[] = [];
  let materialPassed = true;
  if (contract.tier === "BLUEPRINT" && contract.blueprintSpec) {
    for (const req of contract.blueprintSpec.bomRequirements) {
      const invItem = playerState.warehouseInventory.find((i) => i.itemType === req.itemType);
      const hasSupplier = playerState.activeInboundSuppliers.some((s) => s.toLowerCase().includes(req.itemType.toLowerCase()));
      if ((!invItem || invItem.unitsOnHand <= 0) && !hasSupplier) {
        missingMaterials.push(req.name);
      }
    }
    if (missingMaterials.length > 0) {
      isFeasible = false;
      materialPassed = false;
      reasons.push(`Missing material supply contracts or warehouse stock for: ${missingMaterials.join(", ")}.`);
    }
  }

  // ── 3. R&D Prerequisites Check (Tier 3) ──
  const missingTechNodes: string[] = [];
  let rdPassed = true;
  if (contract.tier === "ENGINEERING") {
    const requiredNodes = contract.eraGate.requiredTechNodes || [];
    for (const node of requiredNodes) {
      if (!playerState.unlockedTechs.includes(node)) {
        missingTechNodes.push(node);
      }
    }
    if (missingTechNodes.length > 0) {
      isFeasible = false;
      rdPassed = false;
      reasons.push(`Missing R&D technology unlocks: ${missingTechNodes.join(", ")}.`);
    }
  }

  // ── 4. Reputation Check ──
  let repPassed = true;
  if (contract.eraGate.requiredReputation) {
    for (const [key, minScore] of Object.entries(contract.eraGate.requiredReputation)) {
      const playerScore = playerState.dimensionScores[key as ReputationDimensionKey]?.score ?? 0;
      if (playerScore < (minScore ?? 0)) {
        repPassed = false;
        isFeasible = false;
        reasons.push(`Requires ${key} reputation ≥ ${minScore} (Current: ${Math.round(playerScore)}).`);
      }
    }
  }

  return {
    isFeasible,
    tier: contract.tier,
    reasons,
    capacityCheck: {
      passed: capacityPassed,
      requiredMonthly,
      availableMonthly: effectiveMonthlyCapacity,
      message: capacityPassed
        ? `Capacity cleared (${effectiveMonthlyCapacity} available vs ${requiredMonthly} required/mo)`
        : `Plant capacity bottleneck (${effectiveMonthlyCapacity} < ${requiredMonthly}/mo)`,
    },
    materialCheck: {
      passed: materialPassed,
      missingMaterials,
      message: materialPassed ? "Material sourcing verified" : `Shortage on: ${missingMaterials.join(", ")}`,
    },
    rdCheck: {
      passed: rdPassed,
      missingTechNodes,
      message: rdPassed ? "R&D prerequisites satisfied" : `Requires R&D: ${missingTechNodes.join(", ")}`,
    },
    reputationCheck: {
      passed: repPassed,
      message: repPassed ? "Reputation requirements met" : "Reputation threshold not reached",
    },
  };
}

/**
 * Instantiate an active contract execution from a template
 */
export function createActiveTieredContract(
  template: TieredContractTemplate,
  currentYear: number,
  currentMonth: number
): ActiveTieredContract {
  const isTier3 = template.tier === "ENGINEERING";
  const designMonths = isTier3 ? Math.max(6, Math.floor(template.durationMonths * 0.6)) : 0;

  return {
    id: `contract_run_${Date.now()}_${template.id}`,
    templateId: template.id,
    template,
    status: isTier3 ? "IN_DEVELOPMENT" : "IN_PRODUCTION",
    startedAtYear: currentYear,
    startedAtMonth: currentMonth,
    durationMonthsTotal: template.durationMonths,
    monthsRemaining: template.durationMonths,
    rdProgress: {
      designDaysTotal: designMonths * 30,
      designDaysElapsed: 0,
      prototypeStatus: isTier3 ? "IN_PROGRESS" : "NOT_STARTED",
      prototypeTestAttempts: 0,
      prototypeScore: 0,
    },
    production: {
      targetUnits: template.deliverables.annualVolume,
      producedUnits: 0,
      deliveredUnits: 0,
      defectiveUnits: 0,
      currentPpm: 0,
    },
    financials: {
      totalRevenueEarned: 0,
      totalPenaltiesIncurred: 0,
      netProfitEarned: 0,
    },
  };
}

/**
 * Outcome simulator calculating PPM defects based on manufacturing quality and factory tier
 */
export function simulateDefectPpm(
  targetPpmMax: number,
  playerMfgQualityScore: number,
  factoryTier: FactoryTier,
  difficulty: "ROUTINE" | "DEMANDING" | "ELITE"
): number {
  // Base defect rate scales with difficulty
  const difficultyMultiplier = difficulty === "ROUTINE" ? 0.8 : difficulty === "DEMANDING" ? 1.0 : 1.35;
  
  // Factory tier dampener
  const tierDiscounts: Record<FactoryTier, number> = {
    boutique: 1.1,      // Handcraft can have variance
    small_batch: 0.95,
    mid_volume: 0.85,
    high_volume: 0.75,
    mega: 0.65,
  };
  const tierFactor = tierDiscounts[factoryTier] || 1.0;

  // Manufacturing reputation (0 to 100) reduces defects significantly
  // Score of 50 = neutral (1.0x), Score 100 = 0.3x defects, Score 20 = 1.6x defects
  const skillFactor = Math.max(0.25, 1.5 - (playerMfgQualityScore / 100) * 1.2);

  // Deterministic seed with slight probabilistic jitter (0.85 to 1.15)
  const jitter = 0.85 + Math.random() * 0.3;

  const calculatedPpm = Math.round(
    targetPpmMax * 0.6 * difficultyMultiplier * tierFactor * skillFactor * jitter
  );

  return Math.max(10, calculatedPpm);
}

/**
 * Evaluate prototype testing for Tier 3 contracts
 */
export function evaluatePrototypeTest(
  contract: ActiveTieredContract,
  playerEngScore: number
): { passed: boolean; score: number; feedback: string } {
  const difficultyThreshold =
    contract.template.difficulty === "ROUTINE" ? 60 : contract.template.difficulty === "DEMANDING" ? 70 : 80;

  // Base score driven by engineering score + small variance
  const baseRoll = playerEngScore * 0.85 + Math.random() * 25;
  const score = Math.min(100, Math.round(baseRoll));
  const passed = score >= difficultyThreshold;

  let feedback = "";
  if (passed) {
    feedback = `Prototype passed all bench benchmarks (Score: ${score}/100)! Dynamic specs cleared for production tooling.`;
  } else {
    feedback = `Prototype failed durability/performance threshold (${score}/${difficultyThreshold}). Engineering iteration required.`;
  }

  return { passed, score, feedback };
}

/**
 * Generate a follow-up Tier 1 Production Contract when a Tier 3 Engineering Contract completes
 * This completes the "Design it -> Manufacture it" loop!
 */
export function generateFollowUpProductionContract(
  completedTier3: ActiveTieredContract,
  currentYear: number
): TieredContractTemplate {
  const t3 = completedTier3.template;
  const expandedVolume = Math.round(t3.deliverables.annualVolume * 3.5);

  return {
    id: `followup_prod_${t3.id}_${Date.now()}`,
    tier: "PRODUCTION",
    difficulty: "DEMANDING",
    title: `Series Production: ${t3.title.replace(/^Design |^Engineer |^Develop |^Create /, "")}`,
    npcName: t3.npcName,
    npcCountry: t3.npcCountry,
    npcCountryFlag: t3.npcCountryFlag,
    npcPersonality: t3.npcPersonality,
    category: "PRODUCTION_MFG",
    eraGate: {
      availableFromYear: currentYear,
      availableUntilYear: currentYear + 5,
    },
    npcProvides: {
      completeDesign: true,
      toolingFixtures: true,
    },
    deliverables: {
      componentType: t3.deliverables.componentType,
      specificPart: t3.deliverables.specificPart,
      annualVolume: expandedVolume,
      qualityPpmMax: t3.deliverables.qualityPpmMax,
    },
    responsibility: {
      designOwnership: false,
      blueprintInterpretation: false,
      manufacturingExecution: true,
      qualityAssurance: true,
      prototypeTesting: false,
      materialSourcing: false,
    },
    basePaymentPerUnit: Math.round(t3.basePaymentPerUnit * 0.75), // series volume discount
    completionBonus: Math.round(t3.completionBonus * 0.4),
    reputationReward: {
      manufacturingQuality: 8,
      commercialTrust: 8,
      contracts: 6,
    },
    durationMonths: 24,
    penaltyPerDefectUSD: Math.round(t3.penaltyPerDefectUSD * 0.8),
    lateDeliveryPenaltyPct: 15,
    contractBreachCostUSD: Math.round(t3.contractBreachCostUSD * 0.6),
    description: `Official series volume production contract awarded by ${t3.npcName} following successful R&D prototype sign-off of the ${t3.deliverables.specificPart}.`,
    flavorText: `Your engineering department delivered an outstanding prototype. We now want your factory floor to supply ${expandedVolume.toLocaleString()} units over the next two years.`,
  };
}

export interface ContractTickContext {
  playerMfgQualityScore: number;
  playerEngScore: number;
  factoryTier: FactoryTier;
  cashAvailable: number;
  addCash: (amount: number, reason: string) => void;
  deductCash: (amount: number, reason: string) => void;
  addReputation: (rewards: Partial<Record<ReputationDimensionKey, number>>) => void;
  currentYear: number;
}

export interface ContractTickResult {
  updatedContract: ActiveTieredContract;
  eventMessages: string[];
  followUpTemplate?: TieredContractTemplate;
}

/**
 * Advance an active tiered contract by elapsed simulation days
 */
export function tickTieredContract(
  contract: ActiveTieredContract,
  elapsedDays: number,
  ctx: ContractTickContext
): ContractTickResult {
  const updated: ActiveTieredContract = {
    ...contract,
    rdProgress: { ...contract.rdProgress },
    production: { ...contract.production },
    financials: { ...contract.financials },
  };
  const eventMessages: string[] = [];
  let followUpTemplate: TieredContractTemplate | undefined;

  // If already finished, return immediately
  if (updated.status === "COMPLETED" || updated.status === "BREACHED") {
    return { updatedContract: updated, eventMessages };
  }

  // Monthly countdown tick
  const monthsAdvanced = elapsedDays / 30;
  updated.monthsRemaining = Math.max(0, updated.monthsRemaining - monthsAdvanced);

  // ── 1. TIER 3 DEVELOPMENT PHASE ──
  if (updated.status === "IN_DEVELOPMENT") {
    updated.rdProgress.designDaysElapsed += elapsedDays;
    
    if (updated.rdProgress.designDaysElapsed >= updated.rdProgress.designDaysTotal) {
      updated.status = "PROTOTYPE_TESTING";
      eventMessages.push(
        `🧪 R&D Complete: Prototype ready for dynamic bench validation (${contract.template.title})`
      );
    }
  } else if (updated.status === "PROTOTYPE_TESTING") {
    // ── 2. PROTOTYPE TESTING PHASE (Tier 3) ──
    updated.rdProgress.prototypeTestAttempts += 1;
    const testResult = evaluatePrototypeTest(updated, ctx.playerEngScore);
    updated.rdProgress.prototypeScore = testResult.score;
    updated.rdProgress.prototypeFeedback = testResult.feedback;

    if (testResult.passed) {
      updated.rdProgress.prototypeStatus = "PASSED";
      updated.status = "IN_PRODUCTION";
      eventMessages.push(`✅ Prototype Certified: ${testResult.feedback}`);
      // Engineering milestone reward
      ctx.addReputation({ engineering: 5, innovation: 4 });
    } else {
      updated.rdProgress.prototypeStatus = "FAILED";
      // Iterate: extend design days slightly to fix defects
      updated.rdProgress.designDaysTotal += 20;
      updated.status = "IN_DEVELOPMENT";
      eventMessages.push(`⚠️ Prototype Bench Failure: ${testResult.feedback}. Rework in progress.`);
    }
  } else {
    // ── 3. PRODUCTION & MANUFACTURING PHASE ──
    if (updated.status === "IN_PRODUCTION") {
      const totalDays = updated.durationMonthsTotal * 30;
      const targetUnits = updated.production.targetUnits;
      const dailyRate = Math.max(1, Math.ceil(targetUnits / Math.max(30, totalDays)));

      const unitsThisTick = Math.min(
        targetUnits - updated.production.producedUnits,
        Math.round(dailyRate * elapsedDays)
      );

      if (unitsThisTick > 0) {
        updated.production.producedUnits += unitsThisTick;
      }

      // Check if total production quota reached or contract timeline expired
      if (updated.production.producedUnits >= targetUnits || updated.monthsRemaining <= 0) {
        updated.status = "QUALITY_REVIEW";
        eventMessages.push(
          `🔍 Production Run Finished: Batch sent to final Quality Control review (${contract.template.title})`
        );
      }
    }

    // ── 4. QUALITY REVIEW & DELIVERY PHASE ──
    if (updated.status === "QUALITY_REVIEW") {
    const totalProduced = updated.production.producedUnits;
    const targetPpm = updated.template.deliverables.qualityPpmMax;

    // Simulate actual PPM
    const actualPpm = simulateDefectPpm(
      targetPpm,
      ctx.playerMfgQualityScore,
      ctx.factoryTier,
      updated.template.difficulty
    );
    updated.production.currentPpm = actualPpm;

    const defectCount = Math.round((totalProduced * actualPpm) / 1000000);
    updated.production.defectiveUnits = defectCount;
    updated.production.deliveredUnits = Math.max(0, totalProduced - defectCount);

    const passedQc = actualPpm <= targetPpm;

    if (passedQc) {
      updated.status = "COMPLETED";
      const unitPayment = updated.production.deliveredUnits * updated.template.basePaymentPerUnit;
      const totalPayout = unitPayment + updated.template.completionBonus;

      updated.financials.totalRevenueEarned += totalPayout;
      updated.financials.netProfitEarned += totalPayout;

      ctx.addCash(totalPayout, `Contract Delivered: ${updated.template.title}`);
      ctx.addReputation(updated.template.reputationReward);

      eventMessages.push(
        `🏆 Contract Completed! ${updated.template.title}: Delivered ${updated.production.deliveredUnits.toLocaleString()} units with ${actualPpm} PPM (Target: ${targetPpm} PPM). Earned $${totalPayout.toLocaleString()}.`
      );

      // Tier 3 -> Tier 1 Follow-Up Contract Loop!
      if (updated.template.tier === "ENGINEERING") {
        followUpTemplate = generateFollowUpProductionContract(updated, ctx.currentYear);
        updated.followUpOffered = true;
        updated.followUpTemplateId = followUpTemplate.id;
        eventMessages.push(
          `🌟 Production Contract Unlocked! ${updated.template.npcName} has offered a multi-year series production contract for your design!`
        );
      }
    } else {
      // Failed PPM threshold
      const penaltyCost = defectCount * updated.template.penaltyPerDefectUSD;
      const unitPayment = updated.production.deliveredUnits * updated.template.basePaymentPerUnit;
      const netPayout = unitPayment - penaltyCost;

      updated.financials.totalPenaltiesIncurred += penaltyCost;
      updated.financials.totalRevenueEarned += Math.max(0, netPayout);
      updated.financials.netProfitEarned += netPayout;

      if (penaltyCost > unitPayment) {
        ctx.deductCash(penaltyCost - unitPayment, `Contract Defect Penalties: ${updated.template.title}`);
      } else {
        ctx.addCash(netPayout, `Contract Payment (Net of Penalties): ${updated.template.title}`);
      }

      // Small reputation penalty
      ctx.addReputation({ manufacturingQuality: -3, commercialTrust: -2 });

      if (actualPpm > targetPpm * 1.8) {
        updated.status = "BREACHED";
        eventMessages.push(
          `❌ Contract Breached! Defect rate (${actualPpm} PPM) severely exceeded tolerance (${targetPpm} PPM). Penalty: $${penaltyCost.toLocaleString()}.`
        );
      } else {
        updated.status = "COMPLETED"; // settled with penalty
        eventMessages.push(
          `⚠️ Contract Settled with Quality Penalties: ${actualPpm} PPM exceeded target of ${targetPpm} PPM. Penalty: $${penaltyCost.toLocaleString()}. Net earned: $${netPayout.toLocaleString()}.`
        );
      }
    }
  }
  }

  return {
    updatedContract: updated,
    eventMessages,
    followUpTemplate,
  };
}
