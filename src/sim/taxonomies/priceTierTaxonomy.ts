// ===================================================================
// FULL AUTOMOTIVE PRICE TIER TAXONOMY & COST CALIBRATION
// ===================================================================
// Defines 9 distinct Price Tiers ($12k to $3.0M+) with targeted
// engineering specifications, BOM cost caps, and target profit margins.
// ===================================================================

export type PriceTierId =
  | "BUDGET_ECONOMY"
  | "LOWER_MIDRANGE"
  | "UPPER_MIDRANGE"
  | "PREMIUM_EXECUTIVE"
  | "LUXURY_GRAND"
  | "ULTRA_LUXURY_COACHBUILT"
  | "EXOTIC_SPORTS"
  | "SUPERCAR_TRACK"
  | "HYPERCAR_MEGAWATT";

export interface PriceTierSpecification {
  id: PriceTierId;
  displayName: string;
  minMsrpUSD: number;
  maxMsrpUSD: number;
  targetBuyerDemographic: string;
  bomCostCapUSD: number;
  targetGrossMarginPct: number; // e.g. 18% - 45%
  typicalEngineLayouts: string[];
  maxPowerHp: number;
  targetWeightKg: number;
  standardInfotainmentTier: "BASIC_RADIO" | "DIGITAL_SCREEN_10INCH" | "TRIPLE_OLED_CINEMA" | "BESPOKE_HEAD_UP_HUD";
  chassisMaterials: string[];
  warrantyYears: number;
  badgePrestigeMultiplier: number;
}

export const MASTER_PRICE_TIERS: Record<PriceTierId, PriceTierSpecification> = {
  BUDGET_ECONOMY: {
    id: "BUDGET_ECONOMY",
    displayName: "Budget / Economy Tier",
    minMsrpUSD: 12000,
    maxMsrpUSD: 18000,
    targetBuyerDemographic: "First-time buyers, urban commuters & budget-conscious fleet",
    bomCostCapUSD: 9500,
    targetGrossMarginPct: 15.0,
    typicalEngineLayouts: ["I3", "I4"],
    maxPowerHp: 130,
    targetWeightKg: 1050,
    standardInfotainmentTier: "BASIC_RADIO",
    chassisMaterials: ["Stamped High-Strength Steel"],
    warrantyYears: 3,
    badgePrestigeMultiplier: 0.70,
  },
  LOWER_MIDRANGE: {
    id: "LOWER_MIDRANGE",
    displayName: "Lower Mid-Range",
    minMsrpUSD: 18000,
    maxMsrpUSD: 26000,
    targetBuyerDemographic: "Young families, rideshare drivers & mainstream commuters",
    bomCostCapUSD: 14500,
    targetGrossMarginPct: 18.0,
    typicalEngineLayouts: ["I4", "I4_TURBO"],
    maxPowerHp: 200,
    targetWeightKg: 1350,
    standardInfotainmentTier: "DIGITAL_SCREEN_10INCH",
    chassisMaterials: ["Unibody High-Strength Steel & Aluminum Hood"],
    warrantyYears: 5,
    badgePrestigeMultiplier: 0.85,
  },
  UPPER_MIDRANGE: {
    id: "UPPER_MIDRANGE",
    displayName: "Upper Mid-Range",
    minMsrpUSD: 26000,
    maxMsrpUSD: 40000,
    targetBuyerDemographic: "Suburban families, professionals & crossover buyers",
    bomCostCapUSD: 21500,
    targetGrossMarginPct: 22.0,
    typicalEngineLayouts: ["I4_TURBO", "V6", "HEV_HYBRID"],
    maxPowerHp: 300,
    targetWeightKg: 1600,
    standardInfotainmentTier: "DIGITAL_SCREEN_10INCH",
    chassisMaterials: ["High-Strength Steel & Die-Cast Aluminum Shock Towers"],
    warrantyYears: 5,
    badgePrestigeMultiplier: 1.00,
  },
  PREMIUM_EXECUTIVE: {
    id: "PREMIUM_EXECUTIVE",
    displayName: "Premium Executive",
    minMsrpUSD: 40000,
    maxMsrpUSD: 65000,
    targetBuyerDemographic: "Corporate executives, tech professionals & sport sedan buyers",
    bomCostCapUSD: 31000,
    targetGrossMarginPct: 28.0,
    typicalEngineLayouts: ["I6_TURBO", "V6_TWINTURBO", "DUAL_MOTOR_EV"],
    maxPowerHp: 450,
    targetWeightKg: 1750,
    standardInfotainmentTier: "TRIPLE_OLED_CINEMA",
    chassisMaterials: ["Aluminum Spaceframe & Ultra-High Strength Boron Steel"],
    warrantyYears: 4,
    badgePrestigeMultiplier: 1.25,
  },
  LUXURY_GRAND: {
    id: "LUXURY_GRAND",
    displayName: "Luxury / Full-Size Grand",
    minMsrpUSD: 65000,
    maxMsrpUSD: 120000,
    targetBuyerDemographic: "High net worth individuals, C-suite executives & luxury connoisseurs",
    bomCostCapUSD: 52000,
    targetGrossMarginPct: 35.0,
    typicalEngineLayouts: ["V8_TWINTURBO", "V10", "TRI_MOTOR_EV"],
    maxPowerHp: 650,
    targetWeightKg: 2100,
    standardInfotainmentTier: "TRIPLE_OLED_CINEMA",
    chassisMaterials: ["Full Aluminum Spaceframe & Air Suspension"],
    warrantyYears: 4,
    badgePrestigeMultiplier: 1.60,
  },
  ULTRA_LUXURY_COACHBUILT: {
    id: "ULTRA_LUXURY_COACHBUILT",
    displayName: "Ultra Luxury Coachbuilt",
    minMsrpUSD: 120000,
    maxMsrpUSD: 250000,
    targetBuyerDemographic: "Ultra high net worth collectors, VIPs & heads of state",
    bomCostCapUSD: 95000,
    targetGrossMarginPct: 42.0,
    typicalEngineLayouts: ["V12_TWINTURBO", "W12_QUADTURBO"],
    maxPowerHp: 750,
    targetWeightKg: 2450,
    standardInfotainmentTier: "BESPOKE_HEAD_UP_HUD",
    chassisMaterials: ["Hand-Finished Aluminum Monocoque & Executive Rear Lounge"],
    warrantyYears: 5,
    badgePrestigeMultiplier: 2.20,
  },
  EXOTIC_SPORTS: {
    id: "EXOTIC_SPORTS",
    displayName: "Exotic Sports",
    minMsrpUSD: 150000,
    maxMsrpUSD: 250000,
    targetBuyerDemographic: "Sports car enthusiasts, weekend track drivers & collectors",
    bomCostCapUSD: 105000,
    targetGrossMarginPct: 38.0,
    typicalEngineLayouts: ["MID_V8_TURBO", "MID_V10_NA", "FLAT_6_TURBO"],
    maxPowerHp: 700,
    targetWeightKg: 1450,
    standardInfotainmentTier: "TRIPLE_OLED_CINEMA",
    chassisMaterials: ["Aluminum-Carbon Hybrid Spaceframe"],
    warrantyYears: 3,
    badgePrestigeMultiplier: 2.00,
  },
  SUPERCAR_TRACK: {
    id: "SUPERCAR_TRACK",
    displayName: "Supercar Track Spec",
    minMsrpUSD: 250000,
    maxMsrpUSD: 600000,
    targetBuyerDemographic: "Motorsport collectors, track day purists & exotic supercar buyers",
    bomCostCapUSD: 175000,
    targetGrossMarginPct: 45.0,
    typicalEngineLayouts: ["MID_V10_NA", "MID_V12_NA", "PHEV_V8_TWINTURBO"],
    maxPowerHp: 850,
    targetWeightKg: 1350,
    standardInfotainmentTier: "BESPOKE_HEAD_UP_HUD",
    chassisMaterials: ["Prepreg Carbon Fiber Monocoque & Titanium Subframes"],
    warrantyYears: 3,
    badgePrestigeMultiplier: 2.80,
  },
  HYPERCAR_MEGAWATT: {
    id: "HYPERCAR_MEGAWATT",
    displayName: "Megawatt Hypercar",
    minMsrpUSD: 600000,
    maxMsrpUSD: 3000000,
    targetBuyerDemographic: "Billionaire collectors, hypercar investors & halo museum curators",
    bomCostCapUSD: 650000,
    targetGrossMarginPct: 50.0,
    typicalEngineLayouts: ["W16_QUADTURBO", "QUAD_MOTOR_EV_1500HP", "V12_HYBRID_FORMULA"],
    maxPowerHp: 1600,
    targetWeightKg: 1480,
    standardInfotainmentTier: "BESPOKE_HEAD_UP_HUD",
    chassisMaterials: ["Autoclave Carbon-Titanium (Carbo-Titanium) Monocoque"],
    warrantyYears: 5,
    badgePrestigeMultiplier: 4.50,
  },
};
