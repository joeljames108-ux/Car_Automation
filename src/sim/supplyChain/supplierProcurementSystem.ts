// ===================================================================
// SUPPLY CHAIN & SUPPLIER PROCUREMENT SYSTEM (Vision Phase 2)
// ===================================================================
// Complete global supply chain architecture for automotive OEMs:
// 1. Tier-1 & Tier-2 Specialized Component Suppliers
// 2. In-House vs Outsourced Make-or-Buy Decision Engine
// 3. Just-In-Time (JIT) vs Buffer Stock Resilience Modeling
// 4. Supplier Quality Scorecards, Lead Times, and Disruption Events
// ===================================================================

export type SupplierCategory =
  | "BRAKES"
  | "TIRES"
  | "ECU_ELECTRONICS"
  | "BATTERY_CELLS"
  | "COMPOSITES_CHASSIS"
  | "TURBO_FORCED_INDUCTION";

export interface SupplierProfile {
  id: string;
  name: string;
  category: SupplierCategory;
  country: string;
  reputationScorePct: number; // 0 - 100
  qualityDefectPpm: number; // Parts per million defect rate
  costMultiplier: number; // Multiplier on standard component cost
  leadTimeWeeks: number;
  minimumOrderQuantity: number;
  specialty: string;
  innovationBonus: {
    stat: string;
    multiplier: number;
  };
}

export interface SupplyChainContract {
  supplierId: string;
  category: SupplierCategory;
  procurementModel: "IN_HOUSE_FOUNDRY" | "TIER1_EXCLUSIVE_PARTNER" | "COMMODITY_OUTSOURCE";
  contractTermYears: number;
  annualVolumeUnits: number;
  unitCostDiscountPct: number;
  safetyStockWeeks: number;
  resilienceScorePct: number;
}

export interface DisruptionEvent {
  id: string;
  title: string;
  affectedCategory: SupplierCategory;
  severity: "LOW" | "MEDIUM" | "CRITICAL";
  leadTimeDelayWeeks: number;
  costInflationPct: number;
  description: string;
}

export const MASTER_SUPPLIER_CATALOG: SupplierProfile[] = [
  // ── BRAKES ──
  {
    id: "brembo_italia",
    name: "Brembo S.p.A.",
    category: "BRAKES",
    country: "Italy",
    reputationScorePct: 98.5,
    qualityDefectPpm: 25,
    costMultiplier: 1.45,
    leadTimeWeeks: 4,
    minimumOrderQuantity: 500,
    specialty: "Monobloc forged 6-piston calipers and carbon-ceramic friction",
    innovationBonus: { stat: "brakeFadeResistance", multiplier: 1.25 },
  },
  {
    id: "akebono_japan",
    name: "Akebono Brake Industry",
    category: "BRAKES",
    country: "Japan",
    reputationScorePct: 94.0,
    qualityDefectPpm: 12,
    costMultiplier: 1.15,
    leadTimeWeeks: 6,
    minimumOrderQuantity: 2000,
    specialty: "High-consistency low-dust ceramic pads and endurance calipers",
    innovationBonus: { stat: "padLongevity", multiplier: 1.35 },
  },
  {
    id: "stoptech_usa",
    name: "StopTech Performance",
    category: "BRAKES",
    country: "USA",
    reputationScorePct: 88.0,
    qualityDefectPpm: 95,
    costMultiplier: 0.90,
    leadTimeWeeks: 3,
    minimumOrderQuantity: 200,
    specialty: "Modular slotted aero rotors and cost-effective sport kits",
    innovationBonus: { stat: "costEfficiency", multiplier: 1.20 },
  },

  // ── TIRES ──
  {
    id: "michelin_france",
    name: "Michelin Motorsport & Pilot",
    category: "TIRES",
    country: "France",
    reputationScorePct: 99.0,
    qualityDefectPpm: 8,
    costMultiplier: 1.50,
    leadTimeWeeks: 3,
    minimumOrderQuantity: 1000,
    specialty: "Bi-compound tread technology and variable contact patch 3.0",
    innovationBonus: { stat: "lateralGrip", multiplier: 1.22 },
  },
  {
    id: "pirelli_italia",
    name: "Pirelli & C. S.p.A.",
    category: "TIRES",
    country: "Italy",
    reputationScorePct: 96.0,
    qualityDefectPpm: 32,
    costMultiplier: 1.40,
    leadTimeWeeks: 4,
    minimumOrderQuantity: 800,
    specialty: "P-Zero high-downforce bead construction and F1 compound modeling",
    innovationBonus: { stat: "highSpeedStability", multiplier: 1.18 },
  },
  {
    id: "hankook_korea",
    name: "Hankook Tire & Technology",
    category: "TIRES",
    country: "South Korea",
    reputationScorePct: 89.5,
    qualityDefectPpm: 45,
    costMultiplier: 0.85,
    leadTimeWeeks: 5,
    minimumOrderQuantity: 3000,
    specialty: "Low rolling resistance EV silica compounds and high volume cost savings",
    innovationBonus: { stat: "rollingResistanceEfficiency", multiplier: 1.28 },
  },

  // ── ECU & ELECTRONICS ──
  {
    id: "bosch_germany",
    name: "Robert Bosch GmbH",
    category: "ECU_ELECTRONICS",
    country: "Germany",
    reputationScorePct: 98.0,
    qualityDefectPpm: 15,
    costMultiplier: 1.35,
    leadTimeWeeks: 8,
    minimumOrderQuantity: 2500,
    specialty: "Automotive ASIL-D microcontrollers, ESC 9.3, and direct injection ECUs",
    innovationBonus: { stat: "tractionControlSpeed", multiplier: 1.30 },
  },
  {
    id: "denso_japan",
    name: "Denso Corporation",
    category: "ECU_ELECTRONICS",
    country: "Japan",
    reputationScorePct: 96.5,
    qualityDefectPpm: 6,
    costMultiplier: 1.20,
    leadTimeWeeks: 7,
    minimumOrderQuantity: 5000,
    specialty: "Six Sigma ultra-high reliability electrical harness and silicon gate drivers",
    innovationBonus: { stat: "electronicsReliability", multiplier: 1.40 },
  },

  // ── BATTERY CELLS ──
  {
    id: "catl_china",
    name: "CATL (Contemporary Amperex)",
    category: "BATTERY_CELLS",
    country: "China",
    reputationScorePct: 95.0,
    qualityDefectPpm: 40,
    costMultiplier: 0.88,
    leadTimeWeeks: 10,
    minimumOrderQuantity: 10000,
    specialty: "Qilin CTP 3.0 cell-to-pack high-density prismatic LFP/NMC cells",
    innovationBonus: { stat: "packEnergyDensity", multiplier: 1.20 },
  },
  {
    id: "panasonic_energy",
    name: "Panasonic Energy Corp",
    category: "BATTERY_CELLS",
    country: "Japan",
    reputationScorePct: 97.5,
    qualityDefectPpm: 14,
    costMultiplier: 1.25,
    leadTimeWeeks: 8,
    minimumOrderQuantity: 5000,
    specialty: "High-nickel 4680 cylindrical cells with silicon-carbon anodes",
    innovationBonus: { stat: "fastChargeCrate", multiplier: 1.32 },
  },

  // ── COMPOSITES & CHASSIS ──
  {
    id: "dallara_automobili",
    name: "Dallara Automobili",
    category: "COMPOSITES_CHASSIS",
    country: "Italy",
    reputationScorePct: 99.5,
    qualityDefectPpm: 10,
    costMultiplier: 2.10,
    leadTimeWeeks: 12,
    minimumOrderQuantity: 50,
    specialty: "Autoclave cured prepreg carbon-fiber survival cells and FIA monocoques",
    innovationBonus: { stat: "torsionalRigidityPerKg", multiplier: 1.45 },
  },
];

export class SupplierProcurementSystem {
  /**
   * Calculates effective contract pricing, volume discounts, and supply chain vulnerability.
   */
  public static evaluateContract(params: {
    supplier: SupplierProfile;
    annualVolume: number;
    procurementModel: "IN_HOUSE_FOUNDRY" | "TIER1_EXCLUSIVE_PARTNER" | "COMMODITY_OUTSOURCE";
    safetyStockWeeks: number;
  }): SupplyChainContract {
    const { supplier, annualVolume, procurementModel, safetyStockWeeks } = params;

    // Volume discount curve: 0% at MOQ -> up to 25% at 50,000+ units
    const volumeRatio = Math.min(1.0, Math.max(0, (annualVolume - supplier.minimumOrderQuantity) / 45000));
    let unitCostDiscountPct = Number((volumeRatio * 25.0).toFixed(1));

    if (procurementModel === "TIER1_EXCLUSIVE_PARTNER") {
      unitCostDiscountPct += 5.0;
    } else if (procurementModel === "IN_HOUSE_FOUNDRY") {
      unitCostDiscountPct += 12.0; // Eliminates supplier margin, but requires heavy CapEx
    }

    // Resilience score based on supplier PPM, lead time, and buffer stock
    const leadTimeRisk = Math.max(0, (supplier.leadTimeWeeks - safetyStockWeeks) * 5.0);
    const qualityScore = Math.max(0, 100 - supplier.qualityDefectPpm / 2);
    const resilienceScorePct = Number(Math.min(99.0, Math.max(20.0, (qualityScore * 0.6 + supplier.reputationScorePct * 0.4) - leadTimeRisk)).toFixed(1));

    return {
      supplierId: supplier.id,
      category: supplier.category,
      procurementModel,
      contractTermYears: procurementModel === "TIER1_EXCLUSIVE_PARTNER" ? 3 : 1,
      annualVolumeUnits: annualVolume,
      unitCostDiscountPct,
      safetyStockWeeks,
      resilienceScorePct,
    };
  }

  /**
   * Simulates a global supply disruption event and its impact on manufacturing.
   */
  public static simulateDisruptionImpact(
    contract: SupplyChainContract,
    disruption: DisruptionEvent
  ): {
    isProductionHalted: boolean;
    productionDelayWeeks: number;
    unitCostInflationPct: number;
    mitigationAdvice: string;
  } {
    if (contract.category !== disruption.affectedCategory) {
      return {
        isProductionHalted: false,
        productionDelayWeeks: 0,
        unitCostInflationPct: 0,
        mitigationAdvice: "No impact on active procurement category.",
      };
    }

    const netDelay = Math.max(0, disruption.leadTimeDelayWeeks - contract.safetyStockWeeks);
    const isProductionHalted = netDelay > 0;
    const unitCostInflationPct = isProductionHalted ? disruption.costInflationPct : disruption.costInflationPct * 0.3;

    let mitigationAdvice = "Buffer stock absorbed the lead time shock without factory line stoppage.";
    if (isProductionHalted) {
      mitigationAdvice = `Assembly lines halted for ${netDelay} weeks. Immediate air-freight expediting or dual-sourcing required.`;
    }

    return {
      isProductionHalted,
      productionDelayWeeks: netDelay,
      unitCostInflationPct: Number(unitCostInflationPct.toFixed(1)),
      mitigationAdvice,
    };
  }
}
