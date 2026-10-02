/**
 * ═══════════════════════════════════════════════════════════════════════
 * THREE-TIER CONTRACT SYSTEM — TYPE DEFINITIONS & SCHEMAS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements the 3-tier automotive manufacturing and engineering hierarchy:
 * - Tier 1 (Production): "Manufacture This" — Factory capacity & volume assembly.
 * - Tier 2 (Blueprint): "Build Exactly This" — Precision fabrication to tight tolerances.
 * - Tier 3 (Engineering): "You Figure It Out" — R&D design, prototyping, testing & production handoff.
 */

import { RDEra } from "../rdTreeTypes";
import { ReputationDimensionKey } from "../../state/reputationEngine";
import { ContractCategory } from "../../state/contractsStore";
import { FactoryTier, FrameMaterial, ManufacturingProcess } from "../types";

export type ContractTier = "PRODUCTION" | "BLUEPRINT" | "ENGINEERING";

export type ContractDifficulty = "ROUTINE" | "DEMANDING" | "ELITE";

/**
 * Responsibility matrix declaring what the player is accountable for
 */
export interface PlayerResponsibility {
  designOwnership: boolean;         // Tier 3 only
  blueprintInterpretation: boolean;  // Tier 2 & 3
  manufacturingExecution: boolean;   // All tiers
  qualityAssurance: boolean;         // All tiers
  prototypeTesting: boolean;         // Tier 3 only
  materialSourcing: boolean;         // Tier 2 & 3
}

/**
 * Era and technology gating conditions
 */
export interface EraGate {
  availableFromYear: number;        // Contract won't appear before this year
  availableUntilYear?: number;      // Contract expires from catalog after this
  requiredRDEra?: RDEra;            // Minimum R&D era
  requiredTechNodes?: string[];     // Specific R&D unlocks needed
  requiredReputation?: Partial<Record<ReputationDimensionKey, number>>; // Min reputation scores
}

export type BlueprintManufacturingProcess =
  | "casting"
  | "stamping"
  | "forging"
  | "cnc_machining"
  | "composite_autoclave"
  | "hand_built"
  | "semi_automated"
  | "automated"
  | "mass_production"
  | "3d_printed";

/**
 * Blueprint technical specifications for Tier 2 contracts
 */
export interface BlueprintSpec {
  drawingTitle: string;
  drawingCode: string;
  materialType: string;
  requiredProcess: BlueprintManufacturingProcess;
  frameMaterial?: FrameMaterial;
  toleranceClass: "ISO_MEDIUM_m" | "ISO_FINE_f" | "AEROSPACE_PRECISION" | "OPTICAL_GRADE";
  targetToleranceMm: number;        // e.g. ±0.05 mm
  testingGates: string[];           // e.g. ["Non-Destructive X-Ray", "Eddy Current Test", "Coordinate Laser Scan"]
  bomRequirements: Array<{
    itemType: string;
    name: string;
    amountPerUnit: number;
    unit: string;
  }>;
}

/**
 * Performance specifications for Tier 3 engineering contracts
 */
export interface PerformanceSpec {
  componentCategory: "ENGINE" | "POWERTRAIN" | "CHASSIS" | "AERO" | "BRAKES" | "DRIVETRAIN" | "COMPLETE_VEHICLE" | "AUTONOMOUS";
  powerHpMin?: number;
  torqueNmMin?: number;
  weightKgMax?: number;
  maxDisplacementCc?: number;
  redlineRpmMin?: number;
  downforceKgMin?: number;
  dragCdMax?: number;
  brakingDistance100To0M?: number;
  torsionalStiffnessMin?: number;    // Nm/deg
  batteryCapacityKwhMin?: number;
  energyEfficiencyMinPct?: number;
  emissionsStandard?: "EURO_1" | "EURO_3" | "EURO_5" | "EURO_7" | "PERIOD_LEADED";
  targetMetricsSummary: string;
  testCriteria: string[];
}

/**
 * Template definition for a contract catalog item
 */
export interface TieredContractTemplate {
  id: string;
  tier: ContractTier;
  difficulty: ContractDifficulty;
  title: string;
  npcName: string;
  npcCountry: string;
  npcCountryFlag: string;
  npcPersonality: "AGGRESSIVE" | "CONSERVATIVE" | "PRESTIGE_SEEKER";
  eraGate: EraGate;
  category: ContractCategory;

  // What the NPC supplies to the player
  npcProvides: {
    completeDesign?: boolean;      // Tier 1: yes
    blueprints?: boolean;          // Tier 2: yes
    specSheet?: boolean;           // Tier 3: performance spec only
    rawMaterials?: boolean;        // Sometimes provided in Tier 1
    toolingFixtures?: boolean;     // Sometimes provided in Tier 1
  };

  // What the player must manufacture and supply
  deliverables: {
    componentType: "engine" | "chassis" | "vehicle" | "subsystem" | "powertrain" | "electronics";
    specificPart: string;          // e.g. "Cast Iron Cylinder Blocks", "V6 Turbo-Hybrid"
    annualVolume: number;
    qualityPpmMax: number;         // Maximum allowable defect PPM
    targetSpecs?: Record<string, number>;
  };

  responsibility: PlayerResponsibility;

  // Detailed Tier 2 / 3 specs
  blueprintSpec?: BlueprintSpec;
  performanceSpec?: PerformanceSpec;

  // Reward structure
  basePaymentPerUnit: number;      // USD per delivered unit
  completionBonus: number;         // Lump sum upon zero-defect contract completion
  reputationReward: Partial<Record<ReputationDimensionKey, number>>;
  durationMonths: number;

  // Penalty structure
  penaltyPerDefectUSD: number;
  lateDeliveryPenaltyPct: number;
  contractBreachCostUSD: number;

  description: string;
  flavorText: string;              // Lore / NPC quote
}

/**
 * Status of an active or historical contract execution
 */
export type ContractExecutionStatus =
  | "AVAILABLE"
  | "NEGOTIATING"
  | "ACCEPTED"
  | "IN_DEVELOPMENT"     // Tier 3 R&D phase
  | "PROTOTYPE_TESTING"   // Tier 3 prototype validation
  | "IN_PRODUCTION"       // Tier 1, 2, or Tier 3 production run
  | "QUALITY_REVIEW"      // Batch inspection
  | "DELIVERED"           // Batch passed QC
  | "PENALTY"             // Quality issues, fee deducted
  | "REWORK"              // Reworking defects
  | "COMPLETED"           // Successfully fulfilled
  | "BREACHED";           // Canceled or failed

/**
 * Live state of an active contract in progress
 */
export interface ActiveTieredContract {
  id: string;                      // unique instance ID
  templateId: string;              // ID of the catalog template
  template: TieredContractTemplate;
  status: ContractExecutionStatus;
  startedAtYear: number;
  startedAtMonth: number;
  durationMonthsTotal: number;
  monthsRemaining: number;

  // Tier 3 R&D progress (if applicable)
  rdProgress: {
    designDaysTotal: number;
    designDaysElapsed: number;
    prototypeStatus: "NOT_STARTED" | "IN_PROGRESS" | "TESTING" | "PASSED" | "FAILED";
    prototypeTestAttempts: number;
    prototypeScore: number;        // 0 - 100
    prototypeFeedback?: string;
  };

  // Production progress
  production: {
    targetUnits: number;
    producedUnits: number;
    deliveredUnits: number;
    defectiveUnits: number;
    currentPpm: number;
    activeRunId?: string;          // Linked to activeProductionStore
  };

  // Financial tracking
  financials: {
    totalRevenueEarned: number;
    totalPenaltiesIncurred: number;
    netProfitEarned: number;
  };

  // Follow-up opportunity flag (Tier 3 -> Tier 1)
  followUpOffered?: boolean;
  followUpTemplateId?: string;
}

/**
 * Feasibility evaluation result for UI pre-flight checks
 */
export interface TierFeasibilityCheck {
  isFeasible: boolean;
  tier: ContractTier;
  reasons: string[];
  capacityCheck: {
    passed: boolean;
    requiredMonthly: number;
    availableMonthly: number;
    message: string;
  };
  materialCheck: {
    passed: boolean;
    missingMaterials: string[];
    message: string;
  };
  rdCheck: {
    passed: boolean;
    missingTechNodes: string[];
    message: string;
  };
  reputationCheck: {
    passed: boolean;
    message: string;
  };
}
