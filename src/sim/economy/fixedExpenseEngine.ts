/**
 * ═══════════════════════════════════════════════════════════════════════
 * FIXED EXPENSE ENGINE — RECURRING CORPORATE OVERHEAD
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 9 (Fixed Expenses):
 *
 * Fixed expenses occur EVERY month, regardless of production volume:
 * - Employee salaries across all administrative, engineering & management tiers
 * - Headquarters facilities maintenance & executive office utilities
 * - Factory baseload maintenance (lighting, security, climate, structural upkeep)
 * - R&D laboratory & wind tunnel operational readiness maintenance
 * - Corporate property, product liability & business continuity insurance
 * - Dealership physical showroom baseline support
 *
 * Key mechanic: If a huge factory is built but only produces 100 cars,
 * the full fixed maintenance must still be paid!
 */

import { CompanyAsset } from "./balanceSheet";
import { getInflationRecordForDate } from "./historicalInflationData";

export interface FixedExpenseInputs {
  monthlyPayrollTotal: number;
  assets: CompanyAsset[];
  dealershipCount: number;
  commercialTrustScore: number; // 0-100 (higher score lowers corporate insurance premiums)
  companyTotalAssetValue: number;
  year?: number;
  month?: number;
}

export interface FacilityExpenseItem {
  assetId: string;
  name: string;
  type: string;
  monthlyCost: number;
}

export interface FixedExpenseBreakdown {
  employeePayroll: number;
  hqMaintenance: number;
  factoryMaintenance: number;
  rdFacilityMaintenance: number;
  testingGroundsMaintenance: number;
  dealerNetworkOverhead: number;
  corporateInsurance: number;
  administrativeAndITOverhead: number;
  facilityExpenses: FacilityExpenseItem[];
  totalMonthlyFixedExpenses: number;
}

/**
 * Calculate comprehensive monthly fixed overhead costs
 */
export function calculateMonthlyFixedExpenses(
  inputs: FixedExpenseInputs
): FixedExpenseBreakdown {
  const {
    monthlyPayrollTotal,
    assets,
    dealershipCount,
    commercialTrustScore,
    companyTotalAssetValue,
  } = inputs;

  const cpiMult = (inputs.year !== undefined && inputs.month !== undefined)
    ? getInflationRecordForDate(inputs.year, inputs.month).generalCPI
    : 1.0;

  let hqMaintenance = 0;
  let factoryMaintenance = 0;
  let rdFacilityMaintenance = 0;
  let testingGroundsMaintenance = 0;
  const facilityExpenses: FacilityExpenseItem[] = [];

  for (const asset of assets) {
    const scaledCost = Math.round(asset.monthlyMaintenanceCost * cpiMult);
    facilityExpenses.push({
      assetId: asset.id,
      name: asset.name,
      type: asset.type,
      monthlyCost: scaledCost,
    });

    switch (asset.type) {
      case "HQ":
        hqMaintenance += scaledCost;
        break;
      case "FACTORY":
      case "WAREHOUSE":
      case "RAIL":
        factoryMaintenance += scaledCost;
        break;
      case "RD_LAB":
      case "WIND_TUNNEL":
        rdFacilityMaintenance += scaledCost;
        break;
      case "TESTING_FACILITY":
      case "EQUIPMENT":
      case "TOOLING":
        testingGroundsMaintenance += scaledCost;
        break;
      default:
        break;
    }
  }

  // Dealership overhead: ~₹35,000 per showroom location monthly scaled by CPI
  const dealerNetworkOverhead = Math.round(dealershipCount * 35000 * cpiMult);

  // Corporate Insurance: 0.15% per annum of asset value, discounted by commercial trust
  // High trust (90 score) gives ~25% insurance discount
  const trustDiscount = Math.min(0.30, (commercialTrustScore / 100) * 0.30);
  const annualInsurance = (companyTotalAssetValue * 0.0015) * (1 - trustDiscount);
  const corporateInsurance = Math.max(Math.round(15000 * cpiMult), Math.round(annualInsurance / 12));

  // Administrative / legal / corporate software overhead (~6% of payroll)
  const administrativeAndITOverhead = Math.round(monthlyPayrollTotal * 0.06);

  const totalMonthlyFixedExpenses =
    monthlyPayrollTotal +
    hqMaintenance +
    factoryMaintenance +
    rdFacilityMaintenance +
    testingGroundsMaintenance +
    dealerNetworkOverhead +
    corporateInsurance +
    administrativeAndITOverhead;

  return {
    employeePayroll: monthlyPayrollTotal,
    hqMaintenance,
    factoryMaintenance,
    rdFacilityMaintenance,
    testingGroundsMaintenance,
    dealerNetworkOverhead,
    corporateInsurance,
    administrativeAndITOverhead,
    facilityExpenses,
    totalMonthlyFixedExpenses,
  };
}
