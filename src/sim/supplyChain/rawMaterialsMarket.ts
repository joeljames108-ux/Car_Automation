// ===================================================================
// RAW MATERIALS & COMMODITY SPOT MARKET ENGINE
// ===================================================================
// Simulates real-time raw commodity pricing, supply elasticity,
// geopolitical tariffs, and financial futures hedging strategies.
// ===================================================================

export type CommodityType =
  | "ALUMINUM_6061_T6"
  | "CARBON_FIBER_T800"
  | "TITANIUM_6AL_4V"
  | "LITHIUM_HYDROXIDE"
  | "NEODYMIUM_N52_RE"
  | "COPPER_C11000"
  | "SYNTHETIC_RUBBER"
  | "SILICON_CARBIDE_WAFER"
  | "STAINLESS_STEEL_316L";

export interface CommodityMarketQuote {
  type: CommodityType;
  name: string;
  unitOfMeasure: "kg" | "tonne" | "wafer" | "lbs";
  spotPriceUSD: number;
  dailyChangePct: number;
  volatilityIndex: number; // 0 - 1.0 (historical price variance)
  geopoliticalTariffPct: number; // % import tariff penalty
  supplyScarcityLevel: "ABUNDANT" | "NORMAL" | "CONSTRAINED" | "CRITICAL_SHORTAGE";
  description: string;
}

export interface CommodityFuturesContract {
  id: string;
  commodityType: CommodityType;
  hedgedVolumeUnits: number;
  lockedPriceUSD: number;
  expirationWeeks: number;
  marginDepositUSD: number;
}

export class RawMaterialsMarketEngine {
  private static marketQuotes: Map<CommodityType, CommodityMarketQuote> = new Map([
    [
      "ALUMINUM_6061_T6",
      {
        type: "ALUMINUM_6061_T6",
        name: "Automotive Grade 6061-T6 Aluminum",
        unitOfMeasure: "kg",
        spotPriceUSD: 2.85,
        dailyChangePct: 0.4,
        volatilityIndex: 0.15,
        geopoliticalTariffPct: 5.0,
        supplyScarcityLevel: "NORMAL",
        description: "Primary aerospace & automotive structural chassis extrusion alloy",
      },
    ],
    [
      "CARBON_FIBER_T800",
      {
        type: "CARBON_FIBER_T800",
        name: "Torayca T800H Aerospace Prepreg Carbon Fiber",
        unitOfMeasure: "kg",
        spotPriceUSD: 68.50,
        dailyChangePct: -0.2,
        volatilityIndex: 0.25,
        geopoliticalTariffPct: 8.5,
        supplyScarcityLevel: "CONSTRAINED",
        description: "High tensile strength (5490 MPa) carbon fiber for monocoque construction",
      },
    ],
    [
      "TITANIUM_6AL_4V",
      {
        type: "TITANIUM_6AL_4V",
        name: "Grade 5 Titanium (Ti-6Al-4V)",
        unitOfMeasure: "kg",
        spotPriceUSD: 38.00,
        dailyChangePct: 1.1,
        volatilityIndex: 0.30,
        geopoliticalTariffPct: 15.0,
        supplyScarcityLevel: "CONSTRAINED",
        description: "High strength-to-weight alloy for connecting rods, valves & exhaust systems",
      },
    ],
    [
      "LITHIUM_HYDROXIDE",
      {
        type: "LITHIUM_HYDROXIDE",
        name: "Battery-Grade Lithium Hydroxide (LiOH 56.5%)",
        unitOfMeasure: "kg",
        spotPriceUSD: 16.80,
        dailyChangePct: -1.5,
        volatilityIndex: 0.55,
        geopoliticalTariffPct: 10.0,
        supplyScarcityLevel: "NORMAL",
        description: "Essential precursor for high-nickel NMC 811 EV battery cathode synthesis",
      },
    ],
    [
      "NEODYMIUM_N52_RE",
      {
        type: "NEODYMIUM_N52_RE",
        name: "Neodymium-Iron-Boron Rare Earth Magnets (NdFeB N52)",
        unitOfMeasure: "kg",
        spotPriceUSD: 145.00,
        dailyChangePct: 2.4,
        volatilityIndex: 0.65,
        geopoliticalTariffPct: 25.0,
        supplyScarcityLevel: "CRITICAL_SHORTAGE",
        description: "Permanent magnet material for high power density PMSM electric traction motors",
      },
    ],
    [
      "COPPER_C11000",
      {
        type: "COPPER_C11000",
        name: "ETP Copper Wire Rod (C11000 99.9%)",
        unitOfMeasure: "kg",
        spotPriceUSD: 9.20,
        dailyChangePct: 0.8,
        volatilityIndex: 0.20,
        geopoliticalTariffPct: 4.0,
        supplyScarcityLevel: "NORMAL",
        description: "High conductivity copper for motor stator hairpin windings & HV wire harnesses",
      },
    ],
    [
      "SYNTHETIC_RUBBER",
      {
        type: "SYNTHETIC_RUBBER",
        name: "Styrene-Butadiene Rubber (SBR High-Silica)",
        unitOfMeasure: "kg",
        spotPriceUSD: 2.40,
        dailyChangePct: 0.1,
        volatilityIndex: 0.12,
        geopoliticalTariffPct: 3.5,
        supplyScarcityLevel: "ABUNDANT",
        description: "Performance tire tread compound base material",
      },
    ],
    [
      "SILICON_CARBIDE_WAFER",
      {
        type: "SILICON_CARBIDE_WAFER",
        name: "150mm Single-Crystal Silicon Carbide Substrate Wafer",
        unitOfMeasure: "wafer",
        spotPriceUSD: 850.00,
        dailyChangePct: -0.5,
        volatilityIndex: 0.40,
        geopoliticalTariffPct: 12.0,
        supplyScarcityLevel: "CONSTRAINED",
        description: "Wide-bandgap semiconductor substrate for 800V EV power electronics inverters",
      },
    ],
    [
      "STAINLESS_STEEL_316L",
      {
        type: "STAINLESS_STEEL_316L",
        name: "Austenitic Stainless Steel 316L Sheet",
        unitOfMeasure: "kg",
        spotPriceUSD: 4.10,
        dailyChangePct: 0.2,
        volatilityIndex: 0.10,
        geopoliticalTariffPct: 2.5,
        supplyScarcityLevel: "ABUNDANT",
        description: "Corrosion-resistant exhaust manifolds & structural fasteners",
      },
    ],
  ]);

  /**
   * Retrieves current market quote for a commodity type.
   */
  public static getQuote(type: CommodityType): CommodityMarketQuote {
    const quote = this.marketQuotes.get(type);
    if (!quote) {
      throw new Error(`Commodity quote for ${type} not found.`);
    }
    return { ...quote };
  }

  /**
   * Simulates market price tick with Brownian motion and geopolitical events.
   */
  public static simulateMarketTick(params: {
    macroInflationRatePct: number;
    geopoliticalRiskFactor: number; // 0.0 - 2.0
    randomSeed?: number;
  }): Map<CommodityType, CommodityMarketQuote> {
    const { macroInflationRatePct, geopoliticalRiskFactor } = params;

    this.marketQuotes.forEach((quote, key) => {
      // Geometric Brownian motion with drift
      const randomNoise = (Math.random() - 0.48) * 0.04;
      const scarcityDrift = quote.supplyScarcityLevel === "CRITICAL_SHORTAGE" ? 0.02 : 0.0;
      const inflationDrift = (macroInflationRatePct / 100) * 0.01;

      let deltaPct = (randomNoise + scarcityDrift + inflationDrift) * quote.volatilityIndex * geopoliticalRiskFactor;
      let newPrice = quote.spotPriceUSD * (1 + deltaPct);

      // Clamp prices
      newPrice = Math.max(0.5, Number(newPrice.toFixed(2)));

      quote.spotPriceUSD = newPrice;
      quote.dailyChangePct = Number((deltaPct * 100).toFixed(2));
    });

    return new Map(this.marketQuotes);
  }

  /**
   * Calculates net procurement cost considering spot price, import tariffs, and futures hedges.
   */
  public static calculateNetProcurementCost(params: {
    commodityType: CommodityType;
    requiredVolumeUnits: number;
    activeHedge?: CommodityFuturesContract;
  }): {
    totalCostUSD: number;
    effectiveUnitPriceUSD: number;
    hedgeSavingsUSD: number;
    tariffCostUSD: number;
  } {
    const { commodityType, requiredVolumeUnits, activeHedge } = params;
    const quote = this.getQuote(commodityType);

    const tariffRate = quote.geopoliticalTariffPct / 100;
    const grossSpotUnitCost = quote.spotPriceUSD * (1 + tariffRate);

    let totalCostUSD = 0;
    let hedgeSavingsUSD = 0;

    if (activeHedge && activeHedge.commodityType === commodityType) {
      const hedgedUnits = Math.min(requiredVolumeUnits, activeHedge.hedgedVolumeUnits);
      const unhedgedUnits = Math.max(0, requiredVolumeUnits - hedgedUnits);

      const hedgedUnitCost = activeHedge.lockedPriceUSD * (1 + tariffRate);
      const hedgedCost = hedgedUnits * hedgedUnitCost;
      const unhedgedCost = unhedgedUnits * grossSpotUnitCost;

      totalCostUSD = hedgedCost + unhedgedCost;
      hedgeSavingsUSD = (grossSpotUnitCost - hedgedUnitCost) * hedgedUnits;
    } else {
      totalCostUSD = requiredVolumeUnits * grossSpotUnitCost;
    }

    const effectiveUnitPriceUSD = Number((totalCostUSD / requiredVolumeUnits).toFixed(2));
    const tariffCostUSD = Number((requiredVolumeUnits * quote.spotPriceUSD * tariffRate).toFixed(2));

    return {
      totalCostUSD: Number(totalCostUSD.toFixed(2)),
      effectiveUnitPriceUSD,
      hedgeSavingsUSD: Number(hedgeSavingsUSD.toFixed(2)),
      tariffCostUSD,
    };
  }
}
