// ===================================================================
// PLATFORM SHARING & MODULAR ARCHITECTURE ENGINE (Vision Section 14)
// ===================================================================
// Flexible modular vehicle platform architectures and parts commonality
// calculator enabling multi-model derivative cost amortization.
// ===================================================================

export type ModularPlatformArchetype =
  | "MQB_TRANSVERSE_COMPACT"       // FWD/AWD Transverse Hatch/Sedan/CUV (e.g. Golf/A3/Tiguan)
  | "CLAR_LONGITUDINAL_MODULAR"    // RWD/AWD Longitudinal Sedan/Coupe/SUV (e.g. 3-Series/X5)
  | "MEB_DEDICATED_EV_SKATEBOARD"  // Dedicated 400V/800V Flat Floor EV (e.g. ID.4/Ioniq 5)
  | "MSB_SUPERCAR_CARBON_HYBRID"   // Mid-Engine Carbon Monocoque / Exotic GT (e.g. Continental/Panamera)
  | "LADDER_BODY_ON_FRAME_4X4"     // Heavy Duty Truck & Commercial Fleet
  | "MONOPOSTO_FIA_MOTORSPORT";    // Carbon Tub Racing Prototype

export interface SharedSubsystemModule {
  moduleId: string;
  name: string;
  category: "POWERTRAIN" | "CHASSIS_SUSPENSION" | "ELECTRICAL_HVIL" | "CLIMATE_HVAC" | "BRAKE_ACTUATION";
  baseToolingCostUsd: number;
  perUnitManufacturingCostUsd: number;
  weightKg: number;
  compatibilityArchetypes: ModularPlatformArchetype[];
}

export interface PlatformDerivativeModel {
  modelId: string;
  name: string;
  bodyStyle: string;
  targetMSRP: number;
  annualProductionVolume: number;
  sharedModuleIds: string[];
  bespokeComponentCount: number;
}

export interface PlatformSharingAnalysis {
  platformArchetype: ModularPlatformArchetype;
  derivativeModelsCount: number;
  totalPortfolioAnnualVolume: number;
  averagePartsCommonalityPct: number; // 0 - 100%
  amortizedToolingCostPerUnitUsd: number;
  totalCapExSavingsMillionUsd: number;
  brandDifferentiationScorePct: number; // 0 - 100% (High is good; drop below 40% causes 'samey' feel)
  cannibalizationRiskRating: "LOW" | "MODERATE" | "HIGH";
  strategicSummary: string;
}

export const MASTER_SHARED_SUBSYSTEMS: SharedSubsystemModule[] = [
  {
    moduleId: "mod_subframe_front_modular",
    name: "Hydroformed Aluminum Front Subframe Cradle",
    category: "CHASSIS_SUSPENSION",
    baseToolingCostUsd: 18_000_000,
    perUnitManufacturingCostUsd: 420,
    weightKg: 28.5,
    compatibilityArchetypes: ["MQB_TRANSVERSE_COMPACT", "CLAR_LONGITUDINAL_MODULAR", "MEB_DEDICATED_EV_SKATEBOARD"],
  },
  {
    moduleId: "mod_suspension_multilink_rear",
    name: "5-Link Integral Independent Rear Suspension",
    category: "CHASSIS_SUSPENSION",
    baseToolingCostUsd: 24_000_000,
    perUnitManufacturingCostUsd: 580,
    weightKg: 36.0,
    compatibilityArchetypes: ["CLAR_LONGITUDINAL_MODULAR", "MEB_DEDICATED_EV_SKATEBOARD", "MSB_SUPERCAR_CARBON_HYBRID"],
  },
  {
    moduleId: "mod_800v_sic_inverter_pack",
    name: "Modular 800V Silicon-Carbide Dual Inverter Assembly",
    category: "POWERTRAIN",
    baseToolingCostUsd: 35_000_000,
    perUnitManufacturingCostUsd: 1_250,
    weightKg: 14.2,
    compatibilityArchetypes: ["MEB_DEDICATED_EV_SKATEBOARD", "MSB_SUPERCAR_CARBON_HYBRID", "MONOPOSTO_FIA_MOTORSPORT"],
  },
  {
    moduleId: "mod_electric_power_steering_rack",
    name: "Dual-Pinion Variable Ratio EPS Rack & Pinion",
    category: "CHASSIS_SUSPENSION",
    baseToolingCostUsd: 12_000_000,
    perUnitManufacturingCostUsd: 280,
    weightKg: 11.5,
    compatibilityArchetypes: ["MQB_TRANSVERSE_COMPACT", "CLAR_LONGITUDINAL_MODULAR", "MEB_DEDICATED_EV_SKATEBOARD"],
  },
  {
    moduleId: "mod_heat_pump_thermal_core",
    name: "R-1234yf Octovalve Refrigerant Heat Pump Core",
    category: "CLIMATE_HVAC",
    baseToolingCostUsd: 16_000_000,
    perUnitManufacturingCostUsd: 490,
    weightKg: 18.0,
    compatibilityArchetypes: ["MQB_TRANSVERSE_COMPACT", "CLAR_LONGITUDINAL_MODULAR", "MEB_DEDICATED_EV_SKATEBOARD", "MSB_SUPERCAR_CARBON_HYBRID"],
  },
  {
    moduleId: "mod_brake_by_wire_integrated_unit",
    name: "Integrated Electro-Hydraulic Brake-by-Wire Actuator",
    category: "BRAKE_ACTUATION",
    baseToolingCostUsd: 14_000_000,
    perUnitManufacturingCostUsd: 340,
    weightKg: 7.8,
    compatibilityArchetypes: ["MQB_TRANSVERSE_COMPACT", "CLAR_LONGITUDINAL_MODULAR", "MEB_DEDICATED_EV_SKATEBOARD", "MSB_SUPERCAR_CARBON_HYBRID", "MONOPOSTO_FIA_MOTORSPORT"],
  },
];

export class PlatformSharingEngine {
  /**
   * Evaluates parts commonality, tooling CapEx amortization, and brand differentiation for a family of derivative models.
   */
  public static analyzePlatformPortfolio(params: {
    platformArchetype: ModularPlatformArchetype;
    derivatives: PlatformDerivativeModel[];
  }): PlatformSharingAnalysis {
    const { platformArchetype, derivatives } = params;

    if (derivatives.length === 0) {
      return {
        platformArchetype,
        derivativeModelsCount: 0,
        totalPortfolioAnnualVolume: 0,
        averagePartsCommonalityPct: 0,
        amortizedToolingCostPerUnitUsd: 0,
        totalCapExSavingsMillionUsd: 0,
        brandDifferentiationScorePct: 100,
        cannibalizationRiskRating: "LOW",
        strategicSummary: "No derivative models attached to platform.",
      };
    }

    const totalPortfolioAnnualVolume = derivatives.reduce((sum, d) => sum + d.annualProductionVolume, 0);

    // Identify unique shared modules across the portfolio
    const usedModuleIdSet = new Set<string>();
    derivatives.forEach((d) => d.sharedModuleIds.forEach((id) => usedModuleIdSet.add(id)));

    // Calculate total shared tooling CapEx
    const sharedModules = MASTER_SHARED_SUBSYSTEMS.filter((m) => usedModuleIdSet.has(m.moduleId));
    const totalSharedToolingCapExUsd = sharedModules.reduce((sum, m) => sum + m.baseToolingCostUsd, 0);

    // Calculate average parts commonality percentage
    const commonalityPercentages = derivatives.map((d) => {
      const sharedCount = d.sharedModuleIds.length;
      const totalCount = Math.max(1, sharedCount + d.bespokeComponentCount);
      return (sharedCount / totalCount) * 100;
    });

    const averagePartsCommonalityPct = Number(
      (commonalityPercentages.reduce((sum, p) => sum + p, 0) / derivatives.length).toFixed(1)
    );

    // Tooling amortization per unit across 5-year product lifecycle
    const lifecycleUnits = Math.max(1, totalPortfolioAnnualVolume * 5);
    const amortizedToolingCostPerUnitUsd = Number((totalSharedToolingCapExUsd / lifecycleUnits).toFixed(2));

    // CapEx savings vs developing each derivative with standalone bespoke platforms ($65M per standalone vehicle platform)
    const standaloneCapExCostMillion = derivatives.length * 65.0;
    const sharedPlatformCapExCostMillion = (totalSharedToolingCapExUsd / 1_000_000) + 15.0; // Base platform architecture cost
    const totalCapExSavingsMillionUsd = Number(
      Math.max(0, standaloneCapExCostMillion - sharedPlatformCapExCostMillion).toFixed(1)
    );

    // Brand differentiation score: high commonality (>80%) reduces differentiation
    let brandDifferentiationScorePct = Number(Math.max(15.0, 100 - averagePartsCommonalityPct * 0.75).toFixed(1));
    if (derivatives.length > 4 && averagePartsCommonalityPct > 70) {
      brandDifferentiationScorePct = Math.max(20.0, brandDifferentiationScorePct - 12.0);
    }

    let cannibalizationRiskRating: "LOW" | "MODERATE" | "HIGH" = "LOW";
    if (averagePartsCommonalityPct > 80 && derivatives.length >= 3) {
      cannibalizationRiskRating = "HIGH";
    } else if (averagePartsCommonalityPct > 60 || derivatives.length >= 4) {
      cannibalizationRiskRating = "MODERATE";
    }

    let strategicSummary = `Platform delivers $${totalCapExSavingsMillionUsd}M in tooling CapEx savings with ${averagePartsCommonalityPct}% parts commonality.`;
    if (cannibalizationRiskRating === "HIGH") {
      strategicSummary += " High cannibalization risk detected — increase bespoke styling and suspension tuning to restore brand differentiation.";
    } else {
      strategicSummary += " Optimal balance of modular cost efficiency and distinct model character.";
    }

    return {
      platformArchetype,
      derivativeModelsCount: derivatives.length,
      totalPortfolioAnnualVolume,
      averagePartsCommonalityPct,
      amortizedToolingCostPerUnitUsd,
      totalCapExSavingsMillionUsd,
      brandDifferentiationScorePct,
      cannibalizationRiskRating,
      strategicSummary,
    };
  }
}
