// ===================================================================
// CUSTOMER LIFECYCLE & DEALERSHIP NETWORK SIMULATOR (Vision 17 & 18)
// ===================================================================
// End-to-end customer satisfaction, warranty claims, residual value
// depreciation, buyer demographic scoring, and global dealership networks.
// ===================================================================

export type BuyerArchetype =
  | "COMMUTER_MASS_MARKET"     // Prioritizes MSRP, fuel economy, reliability
  | "TRACK_DAY_ENTHUSIAST"     // Prioritizes lateral Gs, brake fade, lap time, power-to-weight
  | "LUXURY_EXECUTIVE"         // Prioritizes NVH quietness, interior refinement, ADAS autonomy
  | "FLEET_COMMERCIAL"         // Prioritizes TCO (Total Cost of Ownership), MTBF, cargo space
  | "ECO_CONSCIOUS_EV";        // Prioritizes EV range, charging speed, environmental footprint

export type DistributionModel =
  | "DIRECT_TO_CONSUMER_AGENCY" // Direct OEM online sales + experience centers (Tesla/Rivian style)
  | "FRANCHISED_DEALER_NETWORK"  // Traditional franchised dealer partner network
  | "REGIONAL_MASTER_IMPORTER";  // Third-party distributor for overseas export markets

export interface DemographicAppealScore {
  archetype: BuyerArchetype;
  appealScorePct: number; // 0 - 100%
  marketFitRating: "POOR" | "COMPETITIVE" | "CLASS_LEADING";
  keyPurchaseDriver: string;
}

export interface ResidualValueCurve {
  year1ResidualPct: number;
  year3ResidualPct: number;
  year5ResidualPct: number;
  year10ResidualPct: number;
  depreciationGrade: "EXCELLENT" | "AVERAGE" | "STEEP";
}

export interface WarrantyClaimReport {
  annualClaimsPerThousandUnits: number;
  averageClaimCostUsd: number;
  totalAnnualWarrantyReserveUsd: number;
  criticalRecallRiskPct: number; // Probability of NHTSA/EuroNCAP mandatory safety recall
}

export interface CustomerSatisfactionMetrics {
  netPromoterScore: number; // -100 to +100
  brandLoyaltyRepeatPurchasePct: number; // 0 - 100%
  customerAdvocacyIndex: number; // 0 - 10
  sentimentSummary: string;
}

export interface DealershipNetworkState {
  distributionModel: DistributionModel;
  activeShowroomsCount: number;
  averageDealerMarginPct: number;
  customerDeliveryLeadTimeDays: number;
  regionalMarketShare: {
    northAmericaPct: number;
    europePct: number;
    asiaPacificPct: number;
    emergingMarketsPct: number;
  };
}

export interface CustomerLifecycleAnalysis {
  vehicleName: string;
  demographicAppeals: DemographicAppealScore[];
  primaryTargetAudience: BuyerArchetype;
  residualValues: ResidualValueCurve;
  warranty: WarrantyClaimReport;
  satisfaction: CustomerSatisfactionMetrics;
  dealership: DealershipNetworkState;
}

export class CustomerLifecycleAndDealerNetwork {
  /**
   * Computes full customer lifecycle dynamics, demographic fit, warranty costs, and dealership metrics.
   */
  public static evaluateVehicleLifecycle(params: {
    vehicleName: string;
    msrp: number;
    reliabilityScorePct: number; // 0 - 100
    performanceScorePct: number; // 0 - 100
    luxuryScorePct: number;      // 0 - 100
    efficiencyScorePct: number;  // 0 - 100
    annualProductionUnits: number;
    distributionModel?: DistributionModel;
  }): CustomerLifecycleAnalysis {
    const {
      vehicleName,
      msrp,
      reliabilityScorePct,
      performanceScorePct,
      luxuryScorePct,
      efficiencyScorePct,
      annualProductionUnits,
      distributionModel = "DIRECT_TO_CONSUMER_AGENCY",
    } = params;

    // ── 1. Buyer Demographic Appeal Calculations ──
    const appeals: DemographicAppealScore[] = [
      {
        archetype: "COMMUTER_MASS_MARKET",
        appealScorePct: Number(Math.min(99, Math.max(10, reliabilityScorePct * 0.45 + efficiencyScorePct * 0.35 + (100 - Math.min(100, msrp / 600)) * 0.20)).toFixed(1)),
        marketFitRating: "COMPETITIVE",
        keyPurchaseDriver: "Low maintenance cost, reliable powertrain, and accessible entry MSRP",
      },
      {
        archetype: "TRACK_DAY_ENTHUSIAST",
        appealScorePct: Number(Math.min(99, Math.max(10, performanceScorePct * 0.65 + reliabilityScorePct * 0.20 + (msrp < 85000 ? 15 : 0))).toFixed(1)),
        marketFitRating: "COMPETITIVE",
        keyPurchaseDriver: "Sharp front-axle bite, high lateral grip, and track endurance cooling",
      },
      {
        archetype: "LUXURY_EXECUTIVE",
        appealScorePct: Number(Math.min(99, Math.max(10, luxuryScorePct * 0.55 + reliabilityScorePct * 0.25 + (msrp >= 70000 ? 20 : 5))).toFixed(1)),
        marketFitRating: "COMPETITIVE",
        keyPurchaseDriver: "Whisper-quiet cabin isolation, premium leather craftsmanship, and active ADAS",
      },
      {
        archetype: "FLEET_COMMERCIAL",
        appealScorePct: Number(Math.min(99, Math.max(10, reliabilityScorePct * 0.60 + efficiencyScorePct * 0.30 + (msrp < 40000 ? 10 : 0))).toFixed(1)),
        marketFitRating: "COMPETITIVE",
        keyPurchaseDriver: "High MTBF uptime, lowest cost-per-mile, and fleet parts availability",
      },
      {
        archetype: "ECO_CONSCIOUS_EV",
        appealScorePct: Number(Math.min(99, Math.max(10, efficiencyScorePct * 0.60 + luxuryScorePct * 0.25 + reliabilityScorePct * 0.15)).toFixed(1)),
        marketFitRating: "COMPETITIVE",
        keyPurchaseDriver: "Zero-tailpipe emissions, high MPGe efficiency, and low carbon lifecycle",
      },
    ];

    appeals.forEach((a) => {
      if (a.appealScorePct >= 80) a.marketFitRating = "CLASS_LEADING";
      else if (a.appealScorePct < 50) a.marketFitRating = "POOR";
      else a.marketFitRating = "COMPETITIVE";
    });

    const primaryTargetAudience = appeals.reduce((prev, curr) =>
      curr.appealScorePct > prev.appealScorePct ? curr : prev
    ).archetype;

    // ── 2. Residual Value & Depreciation (5-Year Curve) ──
    const reliabilityBonus = (reliabilityScorePct - 50) * 0.25;
    const year1ResidualPct = Number(Math.min(92, Math.max(65, 82.0 + reliabilityBonus)).toFixed(1));
    const year3ResidualPct = Number(Math.min(78, Math.max(45, 62.0 + reliabilityBonus * 1.4)).toFixed(1));
    const year5ResidualPct = Number(Math.min(65, Math.max(30, 48.0 + reliabilityBonus * 1.8)).toFixed(1));
    const year10ResidualPct = Number(Math.min(42, Math.max(12, 22.0 + reliabilityBonus * 2.2)).toFixed(1));

    const depreciationGrade = year5ResidualPct >= 52 ? "EXCELLENT" : year5ResidualPct <= 38 ? "STEEP" : "AVERAGE";

    // ── 3. Warranty Claim Frequencies & Reserve Costs ──
    const baseClaimsPerThousand = 85.0;
    const annualClaimsPerThousandUnits = Number(
      Math.max(12, baseClaimsPerThousand * Math.pow(1 - (reliabilityScorePct - 50) / 100, 1.8)).toFixed(1)
    );
    const averageClaimCostUsd = Number((msrp * 0.042).toFixed(2));
    const totalAnnualWarrantyReserveUsd = Number(
      ((annualProductionUnits * (annualClaimsPerThousandUnits / 1000)) * averageClaimCostUsd).toFixed(0)
    );
    const criticalRecallRiskPct = Number(
      Math.min(35.0, Math.max(0.5, (annualClaimsPerThousandUnits / 250) * 12.0)).toFixed(1)
    );

    // ── 4. Customer Satisfaction & Net Promoter Score (NPS) ──
    const rawNps = (reliabilityScorePct * 0.4 + performanceScorePct * 0.2 + luxuryScorePct * 0.2 + efficiencyScorePct * 0.2) * 1.8 - 85;
    const netPromoterScore = Number(Math.min(88, Math.max(-45, rawNps)).toFixed(0));
    const brandLoyaltyRepeatPurchasePct = Number(
      Math.min(92, Math.max(18, 45 + netPromoterScore * 0.45)).toFixed(1)
    );
    const customerAdvocacyIndex = Number(((netPromoterScore + 100) / 20).toFixed(1));

    let sentimentSummary = "Balanced market reception with stable owner loyalty.";
    if (netPromoterScore >= 60) {
      sentimentSummary = "Raving customer advocacy with cult-like brand loyalty and low warranty defect rates.";
    } else if (netPromoterScore <= 0) {
      sentimentSummary = "Customer discontent driven by high service visits and unexpected component failure rates.";
    }

    // ── 5. Dealership & Global Distribution Network ──
    let averageDealerMarginPct = 9.5;
    let customerDeliveryLeadTimeDays = 21;
    let activeShowroomsCount = 140;

    if (distributionModel === "DIRECT_TO_CONSUMER_AGENCY") {
      averageDealerMarginPct = 4.5; // D2C saves on traditional franchise dealer cuts
      customerDeliveryLeadTimeDays = 14;
      activeShowroomsCount = 85;
    } else if (distributionModel === "REGIONAL_MASTER_IMPORTER") {
      averageDealerMarginPct = 16.0;
      customerDeliveryLeadTimeDays = 45;
      activeShowroomsCount = 220;
    }

    return {
      vehicleName,
      demographicAppeals: appeals,
      primaryTargetAudience,
      residualValues: {
        year1ResidualPct,
        year3ResidualPct,
        year5ResidualPct,
        year10ResidualPct,
        depreciationGrade,
      },
      warranty: {
        annualClaimsPerThousandUnits,
        averageClaimCostUsd,
        totalAnnualWarrantyReserveUsd,
        criticalRecallRiskPct,
      },
      satisfaction: {
        netPromoterScore,
        brandLoyaltyRepeatPurchasePct,
        customerAdvocacyIndex,
        sentimentSummary,
      },
      dealership: {
        distributionModel,
        activeShowroomsCount,
        averageDealerMarginPct,
        customerDeliveryLeadTimeDays,
        regionalMarketShare: {
          northAmericaPct: 38.0,
          europePct: 32.0,
          asiaPacificPct: 22.0,
          emergingMarketsPct: 8.0,
        },
      },
    };
  }
}
