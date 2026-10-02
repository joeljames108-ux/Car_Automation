/**
 * ═══════════════════════════════════════════════════════════════════════
 * HQ WAREHOUSE LEVELING ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements tiered headquarter warehouse facilities that scale with
 * the player's company growth from 1970 onwards:
 *
 * Level 1 — Workshop Yard: Small open-air material staging area
 * Level 2 — Sheet-Metal Warehouse: Enclosed dry storage, covered loading
 * Level 3 — Industrial Logistics Hub: Fork-truck bays, climate sections
 * Level 4 — Automated Distribution Center: Robotic retrieval, barcode WMS
 * Level 5 — Smart Mega-Warehouse: AI-driven AGV fleet, cold chain, 24/7 ops
 *
 * Each level defines:
 * - totalCapacityTonnes (aggregate weight the facility can hold)
 * - slotCount (distinct material/component SKU lines)
 * - monthlyOperatingCostINR (staff, utilities, security, insurance)
 * - holdingCostModifier (multiplier applied to per-item holding rate)
 * - spoilageRiskPct (annual % of perishable/oxidizable goods lost)
 * - upgradeCostINR (CapEx to reach next level)
 * - constructionMonths (time for upgrade to complete)
 * - unlockYear (earliest game year the level becomes available)
 * - unlockReputationMin (minimum industrial reputation score needed)
 *
 * Design rationale: Warehouse is NOT just a number; it's a physical
 * constraint that caps how much the player can stockpile. A beginner
 * with a Level 1 yard cannot hoard 6 months of steel. The player must
 * invest in warehouse infrastructure to enable strategic stockpiling.
 */

import type { WarehouseInventoryRecord } from "./tradeTypes";

// ═══════════════════════════════════════════════════════════════════════
// 1. WAREHOUSE LEVEL DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════

export type HQWarehouseLevel = 1 | 2 | 3 | 4 | 5;

export interface WarehouseLevelSpec {
  level: HQWarehouseLevel;
  name: string;
  description: string;
  totalCapacityTonnes: number;
  slotCount: number;
  monthlyOperatingCostINR: number;
  holdingCostModifier: number;       // 1.0 = baseline, lower = more efficient
  spoilageRiskPctAnnual: number;     // e.g. 3.5 = 3.5% annual loss on perishables
  upgradeCostINR: number;            // CapEx to upgrade FROM this level to next
  constructionMonths: number;        // How long upgrade construction takes
  unlockYear: number;                // Game calendar gate
  unlockReputationMin: number;       // Industrial reputation gate (0-100)
  features: string[];                // Player-visible feature descriptions
  icon: string;                      // UI icon identifier
}

export const WAREHOUSE_LEVEL_SPECS: Record<HQWarehouseLevel, WarehouseLevelSpec> = {
  1: {
    level: 1,
    name: "Workshop Yard",
    description: "Open-air material staging area adjacent to the workshop. Exposed to weather, manual handling only.",
    totalCapacityTonnes: 500,
    slotCount: 6,
    monthlyOperatingCostINR: 25_000,
    holdingCostModifier: 1.35,        // 35% penalty — outdoor exposure, weather damage
    spoilageRiskPctAnnual: 5.0,       // 5% annual spoilage/corrosion
    upgradeCostINR: 8_000_000,        // ₹80 Lakh to build enclosed warehouse
    constructionMonths: 4,
    unlockYear: 1970,
    unlockReputationMin: 0,
    features: [
      "Open-air palette staging",
      "Manual forklift handling",
      "No climate control",
      "Basic lock & key security",
    ],
    icon: "🏗️",
  },
  2: {
    level: 2,
    name: "Sheet-Metal Warehouse",
    description: "Enclosed corrugated-steel warehouse with covered loading dock and basic humidity monitoring.",
    totalCapacityTonnes: 2_000,
    slotCount: 10,
    monthlyOperatingCostINR: 120_000,
    holdingCostModifier: 1.10,        // 10% penalty — basic but enclosed
    spoilageRiskPctAnnual: 2.5,
    upgradeCostINR: 35_000_000,       // ₹3.5 Crore for industrial hub
    constructionMonths: 6,
    unlockYear: 1974,
    unlockReputationMin: 15,
    features: [
      "Enclosed dry storage",
      "Covered loading dock",
      "Basic humidity monitoring",
      "Night security patrol",
      "Inventory clipboard tracking",
    ],
    icon: "🏭",
  },
  3: {
    level: 3,
    name: "Industrial Logistics Hub",
    description: "Multi-bay logistics center with electric forklifts, climate-controlled sections for rubber/polymer, and barcode WMS.",
    totalCapacityTonnes: 8_000,
    slotCount: 16,
    monthlyOperatingCostINR: 450_000,
    holdingCostModifier: 0.90,        // 10% efficiency gain — proper storage
    spoilageRiskPctAnnual: 1.2,
    upgradeCostINR: 120_000_000,      // ₹12 Crore for automated center
    constructionMonths: 10,
    unlockYear: 1982,
    unlockReputationMin: 35,
    features: [
      "Electric forklift fleet (6 units)",
      "Climate-controlled rubber/polymer zone",
      "Barcode WMS inventory management",
      "24/7 CCTV surveillance",
      "Fire suppression system",
      "Dedicated receiving & dispatch docks",
    ],
    icon: "🏢",
  },
  4: {
    level: 4,
    name: "Automated Distribution Center",
    description: "High-bay automated storage & retrieval system (AS/RS) with robotic cranes, RFID tracking, and JIT dispatch scheduling.",
    totalCapacityTonnes: 25_000,
    slotCount: 24,
    monthlyOperatingCostINR: 1_500_000,
    holdingCostModifier: 0.72,        // 28% efficiency gain — automation reduces waste
    spoilageRiskPctAnnual: 0.5,
    upgradeCostINR: 450_000_000,      // ₹45 Crore for mega-warehouse
    constructionMonths: 14,
    unlockYear: 1995,
    unlockReputationMin: 55,
    features: [
      "Automated storage & retrieval (AS/RS)",
      "Robotic crane system (12 bays)",
      "RFID real-time tracking",
      "Integrated JIT dispatch scheduler",
      "Temperature/humidity multi-zone control",
      "Emergency generator backup",
      "Dock-level truck queuing system",
    ],
    icon: "🤖",
  },
  5: {
    level: 5,
    name: "Smart Mega-Warehouse",
    description: "AI-driven automated guided vehicle (AGV) fleet, predictive inventory replenishment, cold chain certification, and 24/7 lights-out operation.",
    totalCapacityTonnes: 80_000,
    slotCount: 32,
    monthlyOperatingCostINR: 4_200_000,
    holdingCostModifier: 0.55,        // 45% efficiency gain — cutting-edge logistics
    spoilageRiskPctAnnual: 0.1,
    upgradeCostINR: 0,                // Max level — no further upgrade
    constructionMonths: 0,
    unlockYear: 2010,
    unlockReputationMin: 75,
    features: [
      "AGV fleet (24 autonomous vehicles)",
      "AI predictive replenishment engine",
      "Cold chain certified zones (-20°C to +40°C)",
      "Lights-out 24/7 operation",
      "Blockchain supply chain audit trail",
      "Inbound/outbound IoT scale bridges",
      "Hazmat containment for battery materials",
      "Cross-dock express lane for JIT parts",
    ],
    icon: "🧠",
  },
};

// ═══════════════════════════════════════════════════════════════════════
// 2. HQ WAREHOUSE STATE
// ═══════════════════════════════════════════════════════════════════════

export interface HQWarehouseState {
  currentLevel: HQWarehouseLevel;
  isUpgrading: boolean;
  upgradeStartMonth: number;
  upgradeStartYear: number;
  upgradeTargetLevel: HQWarehouseLevel | null;
  monthsRemainingOnUpgrade: number;
  totalMaterialStoredTonnes: number;
  totalSKUsUsed: number;
}

export const INITIAL_HQ_WAREHOUSE_STATE: HQWarehouseState = {
  currentLevel: 1,
  isUpgrading: false,
  upgradeStartMonth: 0,
  upgradeStartYear: 0,
  upgradeTargetLevel: null,
  monthsRemainingOnUpgrade: 0,
  totalMaterialStoredTonnes: 0,
  totalSKUsUsed: 0,
};

// ═══════════════════════════════════════════════════════════════════════
// 3. UPGRADE ELIGIBILITY CHECK
// ═══════════════════════════════════════════════════════════════════════

export interface WarehouseUpgradeEligibility {
  canUpgrade: boolean;
  nextLevel: HQWarehouseLevel | null;
  upgradeCostINR: number;
  constructionMonths: number;
  blockedReasons: string[];
}

export function checkWarehouseUpgradeEligibility(
  state: HQWarehouseState,
  currentYear: number,
  industrialReputation: number,
  availableCashINR: number
): WarehouseUpgradeEligibility {
  const currentSpec = WAREHOUSE_LEVEL_SPECS[state.currentLevel];

  // Already max level
  if (state.currentLevel >= 5) {
    return {
      canUpgrade: false,
      nextLevel: null,
      upgradeCostINR: 0,
      constructionMonths: 0,
      blockedReasons: ["Warehouse is already at maximum level (Smart Mega-Warehouse)."],
    };
  }

  // Already upgrading
  if (state.isUpgrading) {
    return {
      canUpgrade: false,
      nextLevel: state.upgradeTargetLevel,
      upgradeCostINR: currentSpec.upgradeCostINR,
      constructionMonths: state.monthsRemainingOnUpgrade,
      blockedReasons: [
        `Upgrade to ${WAREHOUSE_LEVEL_SPECS[state.upgradeTargetLevel!].name} already in progress (${state.monthsRemainingOnUpgrade} months remaining).`,
      ],
    };
  }

  const nextLevel = (state.currentLevel + 1) as HQWarehouseLevel;
  const nextSpec = WAREHOUSE_LEVEL_SPECS[nextLevel];
  const blockedReasons: string[] = [];

  // Year gate
  if (currentYear < nextSpec.unlockYear) {
    blockedReasons.push(
      `Level ${nextLevel} (${nextSpec.name}) requires game year ${nextSpec.unlockYear} — current year is ${currentYear}.`
    );
  }

  // Reputation gate
  if (industrialReputation < nextSpec.unlockReputationMin) {
    blockedReasons.push(
      `Industrial Reputation must be at least ${nextSpec.unlockReputationMin} — currently ${industrialReputation.toFixed(0)}.`
    );
  }

  // Cash gate
  if (availableCashINR < currentSpec.upgradeCostINR) {
    blockedReasons.push(
      `Insufficient funds: Upgrade costs ₹${(currentSpec.upgradeCostINR / 1_000_000).toFixed(1)}M — available cash ₹${(availableCashINR / 1_000_000).toFixed(1)}M.`
    );
  }

  return {
    canUpgrade: blockedReasons.length === 0,
    nextLevel,
    upgradeCostINR: currentSpec.upgradeCostINR,
    constructionMonths: currentSpec.constructionMonths,
    blockedReasons,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// 4. START WAREHOUSE UPGRADE
// ═══════════════════════════════════════════════════════════════════════

export interface WarehouseUpgradeResult {
  success: boolean;
  message: string;
  newState: HQWarehouseState;
  capexDebitINR: number;
}

export function startWarehouseUpgrade(
  state: HQWarehouseState,
  currentMonth: number,
  currentYear: number
): WarehouseUpgradeResult {
  if (state.currentLevel >= 5) {
    return {
      success: false,
      message: "Already at maximum warehouse level.",
      newState: state,
      capexDebitINR: 0,
    };
  }

  if (state.isUpgrading) {
    return {
      success: false,
      message: "Upgrade already in progress.",
      newState: state,
      capexDebitINR: 0,
    };
  }

  const currentSpec = WAREHOUSE_LEVEL_SPECS[state.currentLevel];
  const nextLevel = (state.currentLevel + 1) as HQWarehouseLevel;
  const nextSpec = WAREHOUSE_LEVEL_SPECS[nextLevel];

  return {
    success: true,
    message: `Construction of ${nextSpec.name} has begun! Estimated completion: ${currentSpec.constructionMonths} months.`,
    newState: {
      ...state,
      isUpgrading: true,
      upgradeStartMonth: currentMonth,
      upgradeStartYear: currentYear,
      upgradeTargetLevel: nextLevel,
      monthsRemainingOnUpgrade: currentSpec.constructionMonths,
    },
    capexDebitINR: currentSpec.upgradeCostINR,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// 5. MONTHLY WAREHOUSE TICK — Advance construction, calculate costs
// ═══════════════════════════════════════════════════════════════════════

export interface MonthlyWarehouseResult {
  updatedState: HQWarehouseState;
  monthlyOperatingCost: number;
  holdingCostModifier: number;
  spoilageExpenseINR: number;
  upgradeCompleted: boolean;
  upgradeCompletionMessage: string | null;
  capacityUtilizationPct: number;
  storageWarning: string | null;
}

export function processMonthlyWarehouseTick(
  state: HQWarehouseState,
  inventory: WarehouseInventoryRecord[]
): MonthlyWarehouseResult {
  const spec = WAREHOUSE_LEVEL_SPECS[state.currentLevel];
  let updatedState = { ...state };
  let upgradeCompleted = false;
  let upgradeCompletionMessage: string | null = null;

  // ── Advance construction timer ─────────────────────────────────────
  if (updatedState.isUpgrading && updatedState.monthsRemainingOnUpgrade > 0) {
    updatedState.monthsRemainingOnUpgrade -= 1;

    if (updatedState.monthsRemainingOnUpgrade <= 0) {
      // Upgrade complete!
      const newLevel = updatedState.upgradeTargetLevel!;
      const newSpec = WAREHOUSE_LEVEL_SPECS[newLevel];
      upgradeCompleted = true;
      upgradeCompletionMessage =
        `🎉 Warehouse upgrade complete! ${newSpec.name} (Level ${newLevel}) is now operational. ` +
        `Capacity: ${newSpec.totalCapacityTonnes.toLocaleString()} tonnes, ` +
        `${newSpec.slotCount} SKU slots. ` +
        `Holding cost efficiency improved to ${((1 - newSpec.holdingCostModifier) * 100).toFixed(0)}% savings.`;

      updatedState = {
        ...updatedState,
        currentLevel: newLevel,
        isUpgrading: false,
        upgradeStartMonth: 0,
        upgradeStartYear: 0,
        upgradeTargetLevel: null,
        monthsRemainingOnUpgrade: 0,
      };
    }
  }

  // ── Calculate current storage utilization ───────────────────────────
  const activeSpec = WAREHOUSE_LEVEL_SPECS[updatedState.currentLevel];
  let totalStoredTonnes = 0;
  let totalSKUs = 0;

  for (const item of inventory) {
    // Convert units to approximate tonnes for capacity tracking
    let itemTonnes = 0;
    switch (item.unitOfMeasure) {
      case "tonnes":
        itemTonnes = item.unitsOnHand;
        break;
      case "kg":
        itemTonnes = item.unitsOnHand / 1000;
        break;
      case "units":
        // Assume ~50 kg average per component unit (tyre set, harness, glass pack)
        itemTonnes = (item.unitsOnHand * 50) / 1000;
        break;
    }
    totalStoredTonnes += itemTonnes;
    if (item.unitsOnHand > 0) totalSKUs += 1;
  }

  updatedState.totalMaterialStoredTonnes = Math.round(totalStoredTonnes * 10) / 10;
  updatedState.totalSKUsUsed = totalSKUs;

  const capacityUtilizationPct =
    activeSpec.totalCapacityTonnes > 0
      ? Math.min(100, Math.round((totalStoredTonnes / activeSpec.totalCapacityTonnes) * 100))
      : 0;

  // ── Storage warning ────────────────────────────────────────────────
  let storageWarning: string | null = null;
  if (capacityUtilizationPct >= 95) {
    storageWarning = `⚠️ CRITICAL: Warehouse at ${capacityUtilizationPct}% capacity! Incoming deliveries may be rejected. Upgrade immediately.`;
  } else if (capacityUtilizationPct >= 80) {
    storageWarning = `⚡ WARNING: Warehouse at ${capacityUtilizationPct}% capacity. Consider upgrading to avoid delivery bottlenecks.`;
  } else if (totalSKUs >= activeSpec.slotCount) {
    storageWarning = `📦 SKU LIMIT: All ${activeSpec.slotCount} material slots are occupied. Cannot add new material types without an upgrade.`;
  }

  // ── Spoilage cost (rubber, polymers, battery materials degrade) ─────
  const annualSpoilageRate = activeSpec.spoilageRiskPctAnnual / 100;
  let spoilageExpenseINR = 0;
  for (const item of inventory) {
    // Only perishable materials suffer spoilage
    const isPerishable =
      item.itemType === "VULCANIZED_RUBBER" ||
      item.itemType === "ENGINEERING_POLYMERS" ||
      item.itemType === "BATTERY_CATHODE_NMC" ||
      item.itemType === "BATTERY_ANODE_GRAPHITE" ||
      item.itemType === "CARBON_FIBER_PREPREG";

    if (isPerishable && item.unitsOnHand > 0) {
      const monthlyLoss = (item.unitsOnHand * item.averageUnitCost * annualSpoilageRate) / 12;
      spoilageExpenseINR += monthlyLoss;
    }
  }

  return {
    updatedState,
    monthlyOperatingCost: activeSpec.monthlyOperatingCostINR,
    holdingCostModifier: activeSpec.holdingCostModifier,
    spoilageExpenseINR: Math.round(spoilageExpenseINR),
    upgradeCompleted,
    upgradeCompletionMessage,
    capacityUtilizationPct,
    storageWarning,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// 6. CAPACITY CHECK — Can incoming delivery fit?
// ═══════════════════════════════════════════════════════════════════════

export interface DeliveryCapacityCheck {
  canAccept: boolean;
  currentTonnes: number;
  maxTonnes: number;
  incomingTonnes: number;
  remainingAfterDelivery: number;
  overflowTonnes: number;
}

export function checkDeliveryCapacity(
  warehouseState: HQWarehouseState,
  incomingTonnes: number
): DeliveryCapacityCheck {
  const spec = WAREHOUSE_LEVEL_SPECS[warehouseState.currentLevel];
  const current = warehouseState.totalMaterialStoredTonnes;
  const remaining = spec.totalCapacityTonnes - current;
  const canAccept = incomingTonnes <= remaining;
  const overflow = canAccept ? 0 : incomingTonnes - remaining;

  return {
    canAccept,
    currentTonnes: current,
    maxTonnes: spec.totalCapacityTonnes,
    incomingTonnes,
    remainingAfterDelivery: canAccept ? remaining - incomingTonnes : 0,
    overflowTonnes: Math.round(overflow * 10) / 10,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// 7. WAREHOUSE SUMMARY — For UI display
// ═══════════════════════════════════════════════════════════════════════

export interface WarehouseSummaryForUI {
  level: HQWarehouseLevel;
  levelName: string;
  levelDescription: string;
  icon: string;
  features: string[];
  capacityTonnes: number;
  usedTonnes: number;
  utilizationPct: number;
  skuSlots: number;
  skusUsed: number;
  monthlyOperatingCost: number;
  holdingCostModifier: number;
  spoilageRiskPct: number;
  isUpgrading: boolean;
  upgradeMonthsRemaining: number;
  upgradeTargetName: string | null;
  canUpgrade: boolean;
  nextLevelName: string | null;
  nextLevelCost: number;
  blockedReasons: string[];
}

export function getWarehouseSummary(
  state: HQWarehouseState,
  currentYear: number,
  industrialReputation: number,
  availableCash: number
): WarehouseSummaryForUI {
  const spec = WAREHOUSE_LEVEL_SPECS[state.currentLevel];
  const eligibility = checkWarehouseUpgradeEligibility(
    state,
    currentYear,
    industrialReputation,
    availableCash
  );

  return {
    level: state.currentLevel,
    levelName: spec.name,
    levelDescription: spec.description,
    icon: spec.icon,
    features: spec.features,
    capacityTonnes: spec.totalCapacityTonnes,
    usedTonnes: state.totalMaterialStoredTonnes,
    utilizationPct:
      spec.totalCapacityTonnes > 0
        ? Math.min(100, Math.round((state.totalMaterialStoredTonnes / spec.totalCapacityTonnes) * 100))
        : 0,
    skuSlots: spec.slotCount,
    skusUsed: state.totalSKUsUsed,
    monthlyOperatingCost: spec.monthlyOperatingCostINR,
    holdingCostModifier: spec.holdingCostModifier,
    spoilageRiskPct: spec.spoilageRiskPctAnnual,
    isUpgrading: state.isUpgrading,
    upgradeMonthsRemaining: state.monthsRemainingOnUpgrade,
    upgradeTargetName: state.upgradeTargetLevel
      ? WAREHOUSE_LEVEL_SPECS[state.upgradeTargetLevel].name
      : null,
    canUpgrade: eligibility.canUpgrade,
    nextLevelName: eligibility.nextLevel
      ? WAREHOUSE_LEVEL_SPECS[eligibility.nextLevel].name
      : null,
    nextLevelCost: eligibility.upgradeCostINR,
    blockedReasons: eligibility.blockedReasons,
  };
}
