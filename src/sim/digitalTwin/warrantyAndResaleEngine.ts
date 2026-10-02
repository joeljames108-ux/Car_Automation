/**
 * WARRANTY CLAIMS, RESALE VALUE & DIGITAL TWIN LIFECYCLE ENGINE
 * 
 * Simulates:
 * 1. Warranty Policy Settings (1-Yr Vintage to 10-Yr Powertrain Guarantee)
 * 2. Monthly Warranty Claims Reserves & Payout Deductions
 * 3. Secondary Market Used Car Resale Depreciation Curve (Residual Value %)
 * 4. Digital Twin Vehicle VIN Immutable Ledger
 */

export type WarrantyPolicyTier = "vintage_1yr_12k" | "standard_3yr_36k" | "premium_5yr_60k" | "guarantee_10yr_100k";

export interface WarrantyPolicyConfig {
  tier: WarrantyPolicyTier;
  coverageYears: number;
  coverageMileageKm: number;
  reserveAccrualPerUnitEur: number;
  customerTrustBonusScore: number;
}

export const WARRANTY_TIERS: Record<WarrantyPolicyTier, WarrantyPolicyConfig> = {
  vintage_1yr_12k: {
    tier: "vintage_1yr_12k",
    coverageYears: 1,
    coverageMileageKm: 20000,
    reserveAccrualPerUnitEur: 95,
    customerTrustBonusScore: 0,
  },
  standard_3yr_36k: {
    tier: "standard_3yr_36k",
    coverageYears: 3,
    coverageMileageKm: 60000,
    reserveAccrualPerUnitEur: 240,
    customerTrustBonusScore: 6,
  },
  premium_5yr_60k: {
    tier: "premium_5yr_60k",
    coverageYears: 5,
    coverageMileageKm: 100000,
    reserveAccrualPerUnitEur: 520,
    customerTrustBonusScore: 14,
  },
  guarantee_10yr_100k: {
    tier: "guarantee_10yr_100k",
    coverageYears: 10,
    coverageMileageKm: 160000,
    reserveAccrualPerUnitEur: 980,
    customerTrustBonusScore: 26,
  },
};

export interface DigitalTwinRecord {
  vin: string;
  modelName: string;
  versionName: string;
  manufacturedYear: number;
  manufacturedMonth: number;
  chassisNumber: number;
  factoryBenchDynoHp: number;
  factoryBenchDynoNm: number;
  windTunnelCd: number;
  windTunnelDownforceKg: number;
  qualityAuditScore: number; // 0-100
  serviceHistoryLog: string[];
  currentMileageKm: number;
  residualMarketValueEur: number;
}

export interface MonthlyWarrantyPayoutResult {
  activeWarrantyFleetUnits: number;
  totalMonthlyClaimsEur: number;
  claimsFrequencyPct: number;
  averageClaimCostEur: number;
  customerSatisfactionScore: number; // 0-100
  summary: string;
}

export class WarrantyAndResaleEngine {
  /**
   * Calculates monthly warranty claim payouts based on active warranty fleet and quality score
   */
  public static calculateMonthlyWarrantyPayout(
    activeFleetUnits: number,
    qualityScore: number, // 0-100
    policyTier: WarrantyPolicyTier
  ): MonthlyWarrantyPayoutResult {
    const policy = WARRANTY_TIERS[policyTier];

    // High quality (e.g. 90+) reduces failure rate to ~0.4%/mo; low quality (40) pushes to 3.2%/mo
    const qualityDampener = Math.max(0.15, (100 - qualityScore) / 100);
    const claimsFrequencyPct = Math.round((0.008 * qualityDampener * (1 + policy.coverageYears * 0.15)) * 10000) / 100;

    const averageClaimCostEur = Math.round(380 + qualityDampener * 420);
    const monthlyClaimCount = Math.round(activeFleetUnits * (claimsFrequencyPct / 100));
    const totalMonthlyClaimsEur = monthlyClaimCount * averageClaimCostEur;

    let customerSatisfactionScore = Math.min(100, Math.round(qualityScore * 0.75 + policy.customerTrustBonusScore));

    return {
      activeWarrantyFleetUnits: activeFleetUnits,
      totalMonthlyClaimsEur,
      claimsFrequencyPct,
      averageClaimCostEur,
      customerSatisfactionScore,
      summary: `Fleet warranty coverage across ${activeFleetUnits.toLocaleString()} units generated ${monthlyClaimCount} claims totaling €${Math.round(totalMonthlyClaimsEur / 1000)}k (Satisfaction: ${customerSatisfactionScore}/100).`,
    };
  }

  /**
   * Evaluates 3-Year & 5-Year residual market value percentage
   */
  public static calculateResidualValuePct(
    qualityScore: number,
    brandReputation: number,
    vehicleAgeYears: number
  ): {
    retainedValuePct: number;
    depreciationGrade: "exceptional" | "strong" | "average" | "poor";
  } {
    // Annual base depreciation: ~15% year 1, 10% subsequent years
    const baseRetention = Math.max(0.20, Math.pow(0.86, vehicleAgeYears));
    
    // Quality & Brand prestige multiplier
    const qualityFactor = 0.50 + (qualityScore / 100) * 0.65;
    const reputationFactor = 0.60 + (brandReputation / 100) * 0.60;

    const retainedValuePct = Math.min(92, Math.round(baseRetention * qualityFactor * reputationFactor * 100));

    let depreciationGrade: "exceptional" | "strong" | "average" | "poor" = "average";
    if (retainedValuePct >= 65) {
      depreciationGrade = "exceptional";
    } else if (retainedValuePct >= 52) {
      depreciationGrade = "strong";
    } else if (retainedValuePct >= 42) {
      depreciationGrade = "average";
    } else {
      depreciationGrade = "poor";
    }

    return {
      retainedValuePct,
      depreciationGrade,
    };
  }

  /**
   * Generates a new immutable Digital Twin vehicle ledger entry
   */
  public static createDigitalTwin(
    modelName: string,
    versionName: string,
    year: number,
    month: number,
    chassisNumber: number,
    dynoHp: number,
    dynoNm: number,
    windTunnelCd: number,
    windTunnelDownforceKg: number,
    qualityAuditScore: number,
    initialMsrpEur: number
  ): DigitalTwinRecord {
    const vin = `APX-${year}-${String(month).padStart(2, "0")}-${String(chassisNumber).padStart(5, "0")}`;

    return {
      vin,
      modelName,
      versionName,
      manufacturedYear: year,
      manufacturedMonth: month,
      chassisNumber,
      factoryBenchDynoHp: dynoHp,
      factoryBenchDynoNm: dynoNm,
      windTunnelCd,
      windTunnelDownforceKg,
      qualityAuditScore,
      serviceHistoryLog: [
        `[${year}-${month}] Pre-delivery factory roll-off audit passed (${qualityAuditScore}/100). Bench dyno logged ${dynoHp} HP.`,
      ],
      currentMileageKm: 0,
      residualMarketValueEur: initialMsrpEur,
    };
  }
}
