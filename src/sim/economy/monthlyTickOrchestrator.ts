/**
 * ═══════════════════════════════════════════════════════════════════════
 * MONTHLY TICK ORCHESTRATOR — MASTER CALENDAR SIMULATION SEQUENCE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 1: Strict Monthly Financial Cycle (14-Step Pipeline)
 *
 * The unifying heartbeat of the entire automotive economic simulation.
 * Driven by the simulation calendar clock every month.
 *
 * Execution Order:
 * Step 1:  PRODUCTION_PLANNING    → Read active models, calculate planned output vs capacity
 * Step 2:  RD_SPENDING            → Track R&D budget burn & capability projects
 * Step 3:  EMPLOYEE_SALARIES      → Calculate workforce payroll with reputation modifiers
 * Step 4:  FACILITY_COSTS         → Factory + HQ + insurance + dealership + debt service
 * Step 5:  PRODUCTION             → Execute manufacturing with dynamic commodity prices
 * Step 6:  VEHICLE_SALES          → Process demand + sales for EACH model individually
 * Step 7:  CONTRACT_DELIVERIES    → Fulfill B2B component supply contracts
 * Step 8:  PARTS_TECH_SERVICE     → Tech licensing royalties + after-sales fleet service
 * Step 9:  OTHER_INCOME_EXPENSES  → Motorsport (income/expense) & marketing campaigns
 * Step 10: MONTHLY_CALCULATION    → Aggregate all transactions → P&L snapshot
 * Step 11: CASH_BALANCE_UPDATE    → Close the month, update liquid cash, runway & valuation
 * Step 12: REPUTATION_UPDATE      → Performance-based reputation adjustments
 * Step 13: EVENT_GENERATION       → Generate contextual monthly financial events
 * Step 14: NEXT_MONTH_PREP        → 12-month forward forecast & annual report compilation
 */

import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useReputationStore } from "../../state/reputationStore";
import { useContractsStore } from "../../state/contractsStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useWorkforceStore } from "../../state/workforceStore";
import { useCampusStore } from "../../state/campusStore";
import { clockListeners } from "../../state/gameClockEngine";
import { calculateReputationFinancialModifiers } from "./reputationEconomicBridge";
import { calculateWorkforceEconomics, INITIAL_1970_WORKFORCE } from "./employeeEconomicsEngine";
import { calculateMonthlyFixedExpenses } from "./fixedExpenseEngine";
import { calculateVehicleSales, VehicleSalesInput } from "./vehicleSalesEngine";
import { calculateMonthlyVariableExpenses } from "./variableExpenseEngine";
import { processMonthlyTechLicenses, TechLicenseAgreement } from "./techLicensingEngine";
import { processMotorsportMonth, MotorsportDivisionState } from "./motorsportIncomeEngine";
import { calculateMonthlyAfterSales } from "./afterSalesEngine";
import { evaluateFinancialHealth, FinancialHealthAssessment } from "./financialDangerDetector";
import { calculateCompanyValuation, ValuationBreakdown } from "./companyValuation";
import { compileAnnualReport, AnnualReport } from "./annualReportEngine";
import { useVehicleProductionStore, VehicleProductionLine, INITIAL_1970_PRODUCTION_LINES } from "./vehicleProductionRegistry";
import { getAllCommodityPrices, calculateDynamicRawMaterialsCost } from "./commodityMarketEngine";
import { useDealershipStore } from "./dealershipNetworkEngine";
import { useMarketingStore } from "./marketingEngine";
import { processMonthlyLoans, ActiveLoan } from "./loanFinancingEngine";
import { generate12MonthFinancialForecast, ForecastMonth } from "./financialForecastEngine";
import { generateMonthlyFinancialEvents, MonthlyFinancialEvent } from "./monthlyEventGenerator";
import { applyMonthlyReputationUpdates, DimensionDeltaReport } from "./monthlyReputationUpdate";
import { getEraForYear } from "./eraProgressionEngine";
import { calculateShipmentCost, LogisticsFleetState } from "./logisticsCostEngine";
import {
  PipelineStepSummary,
  ModelSalesItem,
  ContractIncomeItem,
  TechLicenseItem,
  LogisticsModeSubtotal,
  MonthlyTickResult,
} from "./monthlyTickTypes";
import { useTradeStore } from "../../state/tradeStore";
import {
  isSemiAnnualRevisionDate,
  getRevisionPeriodForMonth,
  executeSemiAnnualPriceRevision,
  recordExecutedRevision,
  getLatestExecutedRevision,
} from "./semiAnnualPriceRevisionEngine";
import {
  isAdvanceWarningDate,
  generateAdvanceForecastAlert,
} from "./economicForecastEngine";

export type {
  PipelineStepSummary,
  ModelSalesItem,
  ContractIncomeItem,
  TechLicenseItem,
  LogisticsModeSubtotal,
  MonthlyTickResult,
};

// In-memory persistent state for year-end tracking
let accumulatedAnnualVehiclesBuilt = 0;
let accumulatedAnnualVehiclesSold = 0;
let lastAnnualReport: AnnualReport | null = null;

export function getLastAnnualReport(): AnnualReport | null {
  return lastAnnualReport;
}

/**
 * Execute the complete monthly economic simulation cycle
 */
export function runMonthlyEconomicTick(month: number, year: number): MonthlyTickResult {
  const financeStore = useCompanyFinanceStore.getState();
  const repStore = useReputationStore.getState();
  const contractsStore = useContractsStore.getState();
  const vehicleStore = useVehicleProductionStore.getState();
  const dealershipStore = useDealershipStore.getState();
  const marketingStore = useMarketingStore.getState();

  const summaryLog: string[] = [];
  const pipelineSteps: PipelineStepSummary[] = [];
  const modelSalesDetails: ModelSalesItem[] = [];
  const contractIncomeDetails: ContractIncomeItem[] = [];
  const techLicenseDetails: TechLicenseItem[] = [];

  const transactionsToRecord: Array<{
    month: number;
    year: number;
    category: any;
    amount: number;
    description: string;
    relatedEntityId?: string;
    isRecurring?: boolean;
  }> = [];

  // Read Reputation & Calculate Modifiers
  const dimensionScores = repStore.dimensions;
  const overallReputation = repStore.overallReputation;
  const repModifiers = calculateReputationFinancialModifiers(dimensionScores, {
    annualPayrollEstimate: financeStore.monthlyExpenses * 12 * 0.45,
    annualBOMSpendEstimate: financeStore.monthlyExpenses * 12 * 0.35,
    activeConstructionBudget: 15000000,
    annualVehicleSalesRevenue: financeStore.monthlyRevenue * 12,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 0: BIANNUAL SEMI-ANNUAL PRICE REVISION & ADVANCE FORECASTS
  // ─────────────────────────────────────────────────────────────
  if (isSemiAnnualRevisionDate(month, 1)) {
    const period = getRevisionPeriodForMonth(month);
    const prevRevision = getLatestExecutedRevision() ?? undefined;
    const revisionSummary = executeSemiAnnualPriceRevision(year, period, prevRevision);
    recordExecutedRevision(revisionSummary);

    const revisionNotice = `Biannual Price Revision executed for ${revisionSummary.dateStr}: ${revisionSummary.headline}`;
    summaryLog.push(revisionNotice);

    useSimulationClockStore.getState().addFeedItem({
      type: "market",
      title: `Biannual Price Revision: ${revisionSummary.dateStr}`,
      description: `${revisionSummary.headline}. ${revisionSummary.guidance}`,
      timestamp: revisionSummary.dateStr,
    });
  }

  // Advance strategic stockpiling warning bulletins (T-60 on 1 May/1 Nov, T-30 on 1 Jun/1 Dec)
  if (isAdvanceWarningDate(month, 1)) {
    const forecast = generateAdvanceForecastAlert(year, month, 1);
    if (forecast) {
      useSimulationClockStore.getState().addFeedItem({
        type: "market",
        title: forecast.title,
        description: forecast.summaryMessage,
        timestamp: `${month}/1/${year}`,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 1: PRODUCTION PLANNING & RAW MATERIALS INVENTORY CHECK
  // ─────────────────────────────────────────────────────────────
  let activeProductionLines = vehicleStore.getActiveLines(year, month);
  if (activeProductionLines.length === 0) {
    activeProductionLines = [...INITIAL_1970_PRODUCTION_LINES];
  }
  const totalPlannedOutput = activeProductionLines.reduce((sum, l) => sum + l.monthlyCapacity, 0);

  // Execute continuous raw materials, inventory, and supply chain trade tick
  const supplyChainSummary = useTradeStore.getState().processMonthlyTradeTick(month, year, totalPlannedOutput);

  const bottleneckText = supplyChainSummary.stockoutsEncountered.length > 0
    ? ` (⚠️ Production bottleneck: ${supplyChainSummary.stockoutsEncountered[0].itemType} capped line)`
    : ` (BOM materials verified on-hand)`;

  pipelineSteps.push({
    step: 1,
    name: "PRODUCTION_PLANNING",
    transactionsGenerated: 0,
    netImpact: 0,
    description: `Planned output of ${totalPlannedOutput} units across ${activeProductionLines.length} active model lines${bottleneckText}.`,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 2: R&D SPENDING
  // ─────────────────────────────────────────────────────────────
  const plannedRDBudget = financeStore.rdBudget.totalMonthlyBudget;
  let rdTxs = 0;
  if (plannedRDBudget > 0) {
    transactionsToRecord.push({
      month,
      year,
      category: "RD_INVESTMENT",
      amount: plannedRDBudget,
      description: `R&D engineering capability burn distributed across active research programs`,
      isRecurring: true,
    });
    rdTxs = 1;
  }
  pipelineSteps.push({
    step: 2,
    name: "RD_SPENDING",
    transactionsGenerated: rdTxs,
    netImpact: -plannedRDBudget,
    description: `R&D allocation of ₹${Math.round(plannedRDBudget / 1000)}k distributed across engineering programs.`,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 3: EMPLOYEE SALARIES & WORKFORCE HEARTBEAT PROGRESSION
  // ─────────────────────────────────────────────────────────────
  // Advance workforce monthly tenure, career milestones & experience curves
  useWorkforceStore.getState().tickMonthlySimulation(year, month);
  const workforceMetrics = useWorkforceStore.getState().get12KeyMetrics();

  const workforce = calculateWorkforceEconomics(
    INITIAL_1970_WORKFORCE,
    dimensionScores.employer?.score ?? 30,
    dimensionScores.engineering?.score ?? 30,
    year,
    month
  );

  const totalPayrollToDisburse = workforceMetrics.estimatedMonthlyPayroll || workforce.totalMonthlyPayroll;

  transactionsToRecord.push({
    month,
    year,
    category: "EMPLOYEE_SALARIES",
    amount: totalPayrollToDisburse,
    description: `Corporate monthly payroll for ${workforceMetrics.totalEmployees} employees across 23 departments (${workforce.hiringPremiumPct <= 0 ? `${Math.abs(workforce.hiringPremiumPct)}% prestige discount` : `+${workforce.hiringPremiumPct}% hiring premium`})`,
    isRecurring: true,
  });

  pipelineSteps.push({
    step: 3,
    name: "EMPLOYEE_SALARIES",
    transactionsGenerated: 1,
    netImpact: -totalPayrollToDisburse,
    description: `Disbursed ₹${Math.round(totalPayrollToDisburse / 1000)}k across ${workforceMetrics.totalEmployees} staff in 23 departments.`,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 4: FACILITY & OVERHEAD COSTS (HQ, FACTORY, DEALERSHIP, DEBT)
  // ─────────────────────────────────────────────────────────────
  const fixedExpenses = calculateMonthlyFixedExpenses({
    monthlyPayrollTotal: workforce.totalMonthlyPayroll,
    assets: financeStore.assets,
    dealershipCount: dealershipStore.dealerships.filter((d) => d.isActive).length,
    commercialTrustScore: dimensionScores.commercialTrust?.score ?? 30,
    companyTotalAssetValue: financeStore.balanceSheet.totalPhysicalAssets,
    year,
    month,
  });

  let facilityTxs = 0;
  let facilityOutflow = 0;

  if (fixedExpenses.hqMaintenance > 0) {
    transactionsToRecord.push({
      month,
      year,
      category: "HQ_MAINTENANCE",
      amount: fixedExpenses.hqMaintenance,
      description: "Headquarters, executive office & administrative facilities upkeep",
      isRecurring: true,
    });
    facilityTxs++;
    facilityOutflow += fixedExpenses.hqMaintenance;
  }

  if (fixedExpenses.factoryMaintenance > 0) {
    transactionsToRecord.push({
      month,
      year,
      category: "FACTORY_MAINTENANCE",
      amount: fixedExpenses.factoryMaintenance,
      description: "Plant baseload upkeep, tooling preservation & facility climate systems",
      isRecurring: true,
    });
    facilityTxs++;
    facilityOutflow += fixedExpenses.factoryMaintenance;
  }

  if (fixedExpenses.corporateInsurance > 0) {
    transactionsToRecord.push({
      month,
      year,
      category: "INSURANCE",
      amount: fixedExpenses.corporateInsurance,
      description: "Corporate asset property & product liability commercial insurance",
      isRecurring: true,
    });
    facilityTxs++;
    facilityOutflow += fixedExpenses.corporateInsurance;
  }

  // Dealership network overhead
  const dealerSummary = dealershipStore.getNetworkSummary(dimensionScores.commercialTrust?.score ?? 30);
  if (dealerSummary.totalMonthlyOverhead > 0) {
    transactionsToRecord.push({
      month,
      year,
      category: "DEALER_OVERHEAD",
      amount: dealerSummary.totalMonthlyOverhead,
      description: `Retail showroom overhead across ${dealerSummary.totalLocations} dealer locations`,
      isRecurring: true,
    });
    facilityTxs++;
    facilityOutflow += dealerSummary.totalMonthlyOverhead;
  }

  // Debt service on active corporate loans
  const loanResults = processMonthlyLoans(financeStore.activeLoans);
  if (loanResults.totalMonthlyPayment > 0) {
    transactionsToRecord.push({
      month,
      year,
      category: "LOAN_PAYMENT",
      amount: loanResults.totalMonthlyPayment,
      description: `Corporate loan debt service (Principal ₹${Math.round(loanResults.totalPrincipalRepaid / 1000)}k, Interest ₹${Math.round(loanResults.totalInterestPaid / 1000)}k)`,
    });
    financeStore.updateLoans(loanResults.updatedLoans);
    facilityTxs++;
    facilityOutflow += loanResults.totalMonthlyPayment;
  }

  // HQ Cargo Railway Terminal facility upkeep & 3rd-party competitor lease income
  let railTerminalExpense = 0;
  let railLeaseIncome = 0;
  try {
    const campusStore = useCampusStore.getState();
    if (campusStore?.railwayTerminalState && campusStore.railwayTerminalState.level > 0) {
      const railEcon = campusStore.getRailwayEconomics();
      railTerminalExpense = railEcon.totalFacilityExpenseUSD;
      railLeaseIncome = railEcon.thirdPartyLeaseIncomeUSD;

      if (railTerminalExpense > 0) {
        transactionsToRecord.push({
          month,
          year,
          category: "FACTORY_MAINTENANCE",
          amount: railTerminalExpense,
          description: `HQ Cargo Railway Terminal L${campusStore.railwayTerminalState.level} maintenance`,
          isRecurring: true,
        });
        facilityTxs++;
        facilityOutflow += railTerminalExpense;
      }
    }
  } catch {
    // Fallback if campusStore is not active
  }

  pipelineSteps.push({
    step: 4,
    name: "FACILITY_COSTS",
    transactionsGenerated: facilityTxs,
    netImpact: -facilityOutflow,
    description: `Fixed facilities, dealer network & debt service totaled ₹${Math.round(facilityOutflow / 1000)}k.`,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 5: PRODUCTION & STEP 6: VEHICLE SALES (PER MODEL LOOP)
  // ─────────────────────────────────────────────────────────────
  const commodityPrices = getAllCommodityPrices(
    year,
    month,
    "STEADY_GROWTH",
    repModifiers.supplierNegotiationAdvantagePct
  );

  let productionTxs = 0;
  let productionOutflow = 0;
  let salesTxs = 0;
  let salesNetInflow = 0;

  // Marketing awareness boosts sales demand
  const currentAwareness = marketingStore.currentAwareness;
  const marketingDemandFactor = 0.75 + (currentAwareness / 100) * 0.60;
  const territoryCoverage = dealerSummary.territoryCoveragePct;

  for (const model of activeProductionLines) {
    const unitsToProduce = model.monthlyCapacity;

    // Direct Variable Production Costs
    const dynamicRawCosts = calculateDynamicRawMaterialsCost(model.bomProfile, commodityPrices);
    const varExpenses = calculateMonthlyVariableExpenses(
      unitsToProduce,
      model.bomProfile,
      repModifiers.supplierNegotiationAdvantagePct
    );

    const modelVariableCostsTotal =
      dynamicRawCosts.totalRawMaterialsCost * unitsToProduce +
      varExpenses.totalPurchasedComponentsExpense +
      varExpenses.totalAssemblyLaborExpense +
      varExpenses.totalElectricityExpense +
      varExpenses.totalLogisticsExpense;

    if (unitsToProduce > 0) {
      transactionsToRecord.push({
        month,
        year,
        category: "RAW_MATERIALS",
        amount: dynamicRawCosts.totalRawMaterialsCost * unitsToProduce,
        description: `Raw materials procurement for ${unitsToProduce} units of ${model.modelName}`,
        relatedEntityId: model.modelId,
      });

      transactionsToRecord.push({
        month,
        year,
        category: "COMPONENT_PURCHASES",
        amount: varExpenses.totalPurchasedComponentsExpense,
        description: `Tier-1 component purchases for ${model.modelName} (${repModifiers.supplierNegotiationAdvantagePct}% supplier discount)`,
        relatedEntityId: model.modelId,
      });

      transactionsToRecord.push({
        month,
        year,
        category: "ASSEMBLY_LABOR",
        amount: varExpenses.totalAssemblyLaborExpense,
        description: `Direct assembly labor for ${unitsToProduce} units of ${model.modelName}`,
        relatedEntityId: model.modelId,
      });

      transactionsToRecord.push({
        month,
        year,
        category: "LOGISTICS",
        amount: varExpenses.totalLogisticsExpense,
        description: `Outbound carrier logistics distribution for ${model.modelName}`,
        relatedEntityId: model.modelId,
      });

      productionTxs += 4;
      productionOutflow += modelVariableCostsTotal;
    }

    // Step 6: Vehicle Sales
    const salesInput: VehicleSalesInput = {
      vehicleId: model.modelId,
      modelName: model.modelName,
      segment: model.segment,
      listPrice: model.listPrice,
      monthlyProductionCapacity: unitsToProduce,
      currentInventory: model.currentInventory,
      baseMarketMonthlyDemand: Math.round(model.baseMarketMonthlyDemand * marketingDemandFactor),
      competitivenessScore: model.competitivenessScore,
      overallReputation,
      segmentSpecialistReputation: dimensionScores.design?.score ?? 35,
      dealerCoveragePct: territoryCoverage,
      customerLoyaltyScore: model.customerLoyaltyScore,
      year,
      month,
    };

    const salesResult = calculateVehicleSales(salesInput);
    accumulatedAnnualVehiclesBuilt += unitsToProduce;
    accumulatedAnnualVehiclesSold += salesResult.unitsSold;

    // Update model inventory
    vehicleStore.updateInventory(model.modelId, unitsToProduce - salesResult.unitsSold);

    if (salesResult.unitsSold > 0) {
      transactionsToRecord.push({
        month,
        year,
        category: "VEHICLE_SALES",
        amount: salesResult.netRevenueToCompany,
        description: `Deliveries of ${salesResult.unitsSold} units of ${salesResult.modelName} (Realized ₹${Math.round(salesResult.realizedPricePerUnit / 1000)}k/unit)`,
        relatedEntityId: salesResult.vehicleId,
      });

      if (salesResult.dealerCommissionsTotal > 0) {
        transactionsToRecord.push({
          month,
          year,
          category: "DEALER_COMMISSION",
          amount: salesResult.dealerCommissionsTotal,
          description: `Retail network commissions on ${salesResult.unitsSold} vehicles delivered`,
          relatedEntityId: salesResult.vehicleId,
        });
      }

      salesTxs += salesResult.dealerCommissionsTotal > 0 ? 2 : 1;
      salesNetInflow += salesResult.netRevenueToCompany;
    }

    const grossProfit = salesResult.netRevenueToCompany - modelVariableCostsTotal;
    modelSalesDetails.push({
      modelId: model.modelId,
      modelName: model.modelName,
      segment: model.segment,
      unitsProduced: unitsToProduce,
      unitsDemanded: salesResult.unitsDemanded,
      unitsSold: salesResult.unitsSold,
      remainingInventory: salesResult.remainingInventory,
      listPrice: salesResult.listPrice,
      realizedPrice: salesResult.realizedPricePerUnit,
      grossRevenue: salesResult.grossRevenue,
      netRevenue: salesResult.netRevenueToCompany,
      dealerCommissions: salesResult.dealerCommissionsTotal,
      variableCostsTotal: modelVariableCostsTotal,
      grossProfit,
    });
  }

  pipelineSteps.push({
    step: 5,
    name: "PRODUCTION",
    transactionsGenerated: productionTxs,
    netImpact: -productionOutflow,
    description: `Produced ${totalPlannedOutput} vehicles with ₹${Math.round(productionOutflow / 1000)}k total variable manufacturing costs.`,
  });

  pipelineSteps.push({
    step: 6,
    name: "VEHICLE_SALES",
    transactionsGenerated: salesTxs,
    netImpact: salesNetInflow,
    description: `Sold ${modelSalesDetails.reduce((sum, m) => sum + m.unitsSold, 0)} vehicles generating ₹${Math.round(salesNetInflow / 1000)}k net vehicle revenue.`,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 7: CONTRACT DELIVERIES
  // ─────────────────────────────────────────────────────────────
  let contractNet = 0;
  let contractTxs = 0;

  for (const contract of contractsStore.contracts) {
    if (contract.status === "ACTIVE" && contract.monthlyCashflow !== 0) {
      if (contract.monthlyCashflow > 0) {
        transactionsToRecord.push({
          month,
          year,
          category: "CONTRACT_INCOME",
          amount: contract.monthlyCashflow,
          description: `Contract fulfillment revenue: ${contract.title} (${contract.partnerName})`,
          relatedEntityId: contract.id,
        });
        contractNet += contract.monthlyCashflow;
      } else {
        transactionsToRecord.push({
          month,
          year,
          category: "COMPONENT_PURCHASES",
          amount: Math.abs(contract.monthlyCashflow),
          description: `Contract procurement fulfillment: ${contract.title} (${contract.partnerName})`,
          relatedEntityId: contract.id,
        });
        contractNet -= Math.abs(contract.monthlyCashflow);
      }
      contractTxs++;
      contractIncomeDetails.push({
        contractId: contract.id,
        customerName: contract.partnerName,
        contractType: contract.title,
        monthlyCashflow: contract.monthlyCashflow,
      });
    }
  }

  pipelineSteps.push({
    step: 7,
    name: "CONTRACT_DELIVERIES",
    transactionsGenerated: contractTxs,
    netImpact: contractNet,
    description: `Processed ${contractIncomeDetails.length} commercial B2B supply agreements (Net ₹${Math.round(contractNet / 1000)}k).`,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 8: PARTS, TECH & AFTER-SALES SERVICE
  // ─────────────────────────────────────────────────────────────
  let partsTechNet = 0;
  let partsTechTxs = 0;

  // Active Tech Licensing Royalties & Support Fees
  const techResult = processMonthlyTechLicenses(financeStore.techLicenses);
  financeStore.setTechLicenses(techResult.updatedLicenses);

  if (techResult.summary.totalMonthlyRevenue > 0) {
    transactionsToRecord.push({
      month,
      year,
      category: "TECH_LICENSING",
      amount: techResult.summary.totalMonthlyRevenue,
      description: `Patent royalties & engineering support fees across ${techResult.summary.activeLicensesCount} agreements`,
    });
    partsTechNet += techResult.summary.totalMonthlyRevenue;
    partsTechTxs++;

    for (const lic of techResult.summary.licenseDetails) {
      techLicenseDetails.push(lic);
    }
  }

  // After-sales service & warranty
  const totalFleetOnRoad = accumulatedAnnualVehiclesSold + 45;
  const afterSales = calculateMonthlyAfterSales({
    totalActiveVehiclesOnRoad: totalFleetOnRoad,
    averageAgeMonths: 10,
    officialDealerRetentionPct: 88,
    customerSatisfactionScore: 80,
    reliabilityReputationScore: dimensionScores.reliability?.score ?? 35,
  });

  if (afterSales.totalGrossAfterSalesRevenue > 0) {
    transactionsToRecord.push({
      month,
      year,
      category: "AFTER_SALES",
      amount: afterSales.totalGrossAfterSalesRevenue,
      description: `Workshop scheduled servicing, spare parts & accessories from installed fleet (${totalFleetOnRoad} vehicles)`,
    });
    partsTechNet += afterSales.totalGrossAfterSalesRevenue;
    partsTechTxs++;

    if (afterSales.warrantyClaimsPaidOut > 0) {
      transactionsToRecord.push({
        month,
        year,
        category: "WARRANTY_RECALL",
        amount: afterSales.warrantyClaimsPaidOut,
        description: "Actuarial warranty repair claims honored across customer fleet",
      });
      partsTechNet -= afterSales.warrantyClaimsPaidOut;
      partsTechTxs++;
    }
  }

  pipelineSteps.push({
    step: 8,
    name: "PARTS_TECH_SERVICE",
    transactionsGenerated: partsTechTxs,
    netImpact: partsTechNet,
    description: `Collected ₹${Math.round(partsTechNet / 1000)}k from patent licensing, fleet service & spare parts.`,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 9: OTHER INCOME & EXPENSES (MOTORSPORT & MARKETING)
  // ─────────────────────────────────────────────────────────────
  let otherNet = 0;
  let otherTxs = 0;

  // Motorsport Division
  const isRaceMonth = [3, 5, 6, 7, 9, 10].includes(month);
  const motorsportResult = processMotorsportMonth(
    financeStore.motorsportState,
    isRaceMonth,
    dimensionScores.performance?.score ?? 40,
    dimensionScores.motorsport?.score ?? 30
  );
  financeStore.updateMotorsportState(motorsportResult.updatedState);

  if (motorsportResult.report.totalMonthlyRevenue > 0) {
    transactionsToRecord.push({
      month,
      year,
      category: "MOTORSPORT_INCOME",
      amount: motorsportResult.report.totalMonthlyRevenue,
      description: `Motorsport commercial title sponsorships & prize money`,
    });
    otherNet += motorsportResult.report.totalMonthlyRevenue;
    otherTxs++;
  }

  if (motorsportResult.report.monthlyExpenses > 0) {
    transactionsToRecord.push({
      month,
      year,
      category: "MOTORSPORT_EXPENSE",
      amount: motorsportResult.report.monthlyExpenses,
      description: `Racing division operational overhead & team logistics`,
    });
    otherNet -= motorsportResult.report.monthlyExpenses;
    otherTxs++;
  }

  const motorsportNetCost =
    motorsportResult.report.monthlyExpenses - motorsportResult.report.totalMonthlyRevenue;

  // Marketing & Brand Campaigns
  const marketingReport = marketingStore.processMonthlyMarketing(
    month,
    year,
    financeStore.motorsportState.isActive
  );
  if (marketingReport.totalSpend > 0) {
    transactionsToRecord.push({
      month,
      year,
      category: "MARKETING",
      amount: marketingReport.totalSpend,
      description: `Marketing & advertising campaigns across media channels (Awareness: ${marketingReport.endingAwareness})`,
    });
    otherNet -= marketingReport.totalSpend;
    otherTxs++;
  }

  // 3rd-Party Railway Terminal Capacity Leasing Income
  if (railLeaseIncome > 0) {
    transactionsToRecord.push({
      month,
      year,
      category: "OTHER_INCOME",
      amount: railLeaseIncome,
      description: "B2B Railway Terminal logistics & container slot leasing to competitor automakers",
      isRecurring: true,
    });
    otherNet += railLeaseIncome;
    otherTxs++;
  }

  pipelineSteps.push({
    step: 9,
    name: "OTHER_INCOME_EXPENSES",
    transactionsGenerated: otherTxs,
    netImpact: otherNet,
    description: `Motorsport (Net: -₹${Math.round(motorsportNetCost / 1000)}k), Marketing (-₹${Math.round(marketingReport.totalSpend / 1000)}k)${railLeaseIncome > 0 ? `, and Rail Leasing (+₹${Math.round(railLeaseIncome / 1000)}k)` : ""}.`,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 10: MONTHLY CALCULATION & STEP 11: CASH BALANCE UPDATE
  // ─────────────────────────────────────────────────────────────
  // Record all double-entry ledger transactions in master finance store
  financeStore.recordMultipleTransactions(transactionsToRecord);

  // Advance finance store master ledger & balance sheet tick
  const snapshot = financeStore.processMonthlyTick(month, year);

  pipelineSteps.push({
    step: 10,
    name: "MONTHLY_CALCULATION",
    transactionsGenerated: transactionsToRecord.length,
    netImpact: snapshot.operatingProfit,
    description: `Compiled monthly financial statement. Operating Profit: ₹${Math.round(snapshot.operatingProfit / 1000)}k.`,
  });

  // Compute master enterprise valuation & credit rating
  const valuation = calculateCompanyValuation(
    financeStore.balanceSheet,
    snapshot.operatingProfit * 12,
    overallReputation,
    dimensionScores.commercialTrust?.score ?? 30,
    financeStore.rdBudget.activeProjects.filter((p) => p.status === "COMPLETED").length + 2
  );

  financeStore.recalculateValuation(
    valuation.intellectualPropertyValuation,
    valuation.brandGoodwillValuation
  );

  // Assess liquidity danger status
  const cashHealth = evaluateFinancialHealth(
    snapshot.closingCash,
    snapshot.operatingExpenses,
    financeStore.balanceSheet.liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0),
    financeStore.rdBudget.totalMonthlyBudget,
    modelSalesDetails.reduce((sum, m) => sum + m.remainingInventory, 0),
    activeProductionLines[0]?.listPrice ?? 1250000
  );

  // Sync back to simulationClockStore so UI headers reflect accurate liquid cash
  useSimulationClockStore.getState().addResources(
    snapshot.closingCash - useSimulationClockStore.getState().cash,
    0
  );

  pipelineSteps.push({
    step: 11,
    name: "CASH_BALANCE_UPDATE",
    transactionsGenerated: 0,
    netImpact: snapshot.cashFlow,
    description: `Closing liquid cash updated to ₹${Math.round(snapshot.closingCash / 1000)}k (Net Cash Flow: ₹${Math.round(snapshot.cashFlow / 1000)}k).`,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 12: REPUTATION UPDATE
  // ─────────────────────────────────────────────────────────────
  const reputationDeltas = applyMonthlyReputationUpdates({
    month,
    year,
    contractsFulfillmentRatePct: 100,
    warrantyClaimRatio:
      salesNetInflow > 0 ? afterSales.warrantyClaimsPaidOut / salesNetInflow : 0.01,
    vehicleSalesCapacityUtilizationPct:
      totalPlannedOutput > 0
        ? (modelSalesDetails.reduce((sum, m) => sum + m.unitsSold, 0) / totalPlannedOutput) * 100
        : 100,
    motorsportActive: financeStore.motorsportState.isActive,
    motorsportStanding: financeStore.motorsportState.currentChampionshipStanding,
    cashHealthStatus: financeStore.cashHealth,
    marketingAwareness: marketingStore.currentAwareness,
  });

  pipelineSteps.push({
    step: 12,
    name: "REPUTATION_UPDATE",
    transactionsGenerated: 0,
    netImpact: 0,
    description: `Applied ${reputationDeltas.length} operational feedback adjustments to corporate perception.`,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 13: EVENT GENERATION
  // ─────────────────────────────────────────────────────────────
  const completedProjects = financeStore.rdBudget.activeProjects
    .filter((p) => p.status === "COMPLETED")
    .map((p) => p.name);

  const maturedLoans = loanResults.maturedLoans.map((l) => l.name);

  const eventsGenerated = generateMonthlyFinancialEvents({
    month,
    year,
    revenue: snapshot.revenue,
    operatingExpenses: snapshot.operatingExpenses,
    operatingProfit: snapshot.operatingProfit,
    closingCash: snapshot.closingCash,
    monthsOfRunway: financeStore.monthsOfRunway,
    warrantyClaimsPaid: afterSales.warrantyClaimsPaidOut,
    completedRDProjectNames: completedProjects,
    maturedLoanNames: maturedLoans,
    expiringContractTitles: [],
  });

  financeStore.addFinancialEvents(eventsGenerated);

  // Post top warning to simulationClockStore feed
  const criticalEvent = eventsGenerated.find((e) => e.severity === "CRITICAL" || e.severity === "WARNING");
  if (criticalEvent) {
    useSimulationClockStore.getState().addFeedItem({
      type: "market",
      title: criticalEvent.title,
      description: criticalEvent.description,
      timestamp: `${month}/${year}`,
    });
  }

  pipelineSteps.push({
    step: 13,
    name: "EVENT_GENERATION",
    transactionsGenerated: 0,
    netImpact: 0,
    description: `Generated ${eventsGenerated.length} contextual corporate financial notifications.`,
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 14: NEXT MONTH PREPARATION & FORWARD FORECAST
  // ─────────────────────────────────────────────────────────────
  const forecast12Months = generate12MonthFinancialForecast({
    currentCash: snapshot.closingCash,
    currentYear: year,
    currentMonth: month,
    recentSnapshots: financeStore.monthlySnapshots,
    productionLines: activeProductionLines,
    activeContractsCashflowTotal: contractNet,
    activeLoans: financeStore.activeLoans,
    monthlyRDBudget: plannedRDBudget,
    monthlyMarketingSpend: marketingStore.budgetPlan.totalMonthlySpend,
  });

  // Year-End Annual Report Compilation (Month 12)
  let annualReport: AnnualReport | undefined = undefined;
  if (month === 12) {
    annualReport = compileAnnualReport(
      year,
      financeStore.monthlySnapshots,
      valuation,
      dimensionScores,
      dimensionScores,
      {
        totalVehiclesBuilt: accumulatedAnnualVehiclesBuilt,
        totalVehiclesSold: accumulatedAnnualVehiclesSold,
        rdCapEx: financeStore.rdBudget.totalMonthlyBudget * 12,
        factoryCapEx: 8500000,
        motorsportCapEx: motorsportResult.report.monthlyExpenses * 12,
        headcount: workforce.totalHeadcount,
        assetsCount: financeStore.assets.length,
        exportCountries: 3,
        unlockedTechsCount: 4,
      }
    );
    lastAnnualReport = annualReport;
    accumulatedAnnualVehiclesBuilt = 0;
    accumulatedAnnualVehiclesSold = 0;
    summaryLog.push(
      `Fiscal Year ${year} complete. Official Annual Report ratified for executive board.`
    );
  }

  pipelineSteps.push({
    step: 14,
    name: "NEXT_MONTH_PREP",
    transactionsGenerated: 0,
    netImpact: 0,
    description: `12-month forward forecast updated. ${month === 12 ? "Official Annual Report compiled." : "Ready for next calendar month."}`,
  });

  const currentEra = getEraForYear(year);

  // Multi-modal outbound logistics subtotal
  const logisticsFleet: LogisticsFleetState = {
    hasOwnedRailSpur: financeStore.assets.some((a) => a.type === "RAIL"),
    hasDedicatedCarrierFleet: financeStore.assets.some(
      (a) => a.type === "EQUIPMENT" && a.name.toLowerCase().includes("fleet")
    ),
    monthlyCarrierLeaseOverhead: 15000,
    logisticsReputationScore: dimensionScores.commercialTrust?.score ?? 35,
  };

  const totalUnitsShipped = activeProductionLines.reduce((s, m) => s + m.monthlyCapacity, 0);
  const roadVehicles = Math.round(totalUnitsShipped * 0.70);
  const railVehicles = Math.round(totalUnitsShipped * 0.25);
  const roroVehicles = Math.max(0, totalUnitsShipped - roadVehicles - railVehicles);

  const roadCost = calculateShipmentCost("ROAD_TRUCK", 350, roadVehicles, logisticsFleet, year, month);
  const railCost = calculateShipmentCost("HEAVY_RAIL", 650, railVehicles, logisticsFleet, year, month);
  const roroCost = calculateShipmentCost("MARITIME_RORO", 1800, roroVehicles, logisticsFleet, year, month);

  const logisticsModeBreakdown: LogisticsModeSubtotal[] = [
    { mode: "ROAD_TRUCK", vehiclesShipped: roadVehicles, totalCost: roadCost.totalCost, costPerVehicle: roadCost.costPerVehicle },
    { mode: "HEAVY_RAIL", vehiclesShipped: railVehicles, totalCost: railCost.totalCost, costPerVehicle: railCost.costPerVehicle },
    { mode: "MARITIME_RORO", vehiclesShipped: roroVehicles, totalCost: roroCost.totalCost, costPerVehicle: roroCost.costPerVehicle },
  ];

  summaryLog.push(
    `Month ${month}/${year} (${currentEra.title}): Revenue ₹${Math.round(snapshot.revenue / 1000)}k | Expenses ₹${Math.round(snapshot.operatingExpenses / 1000)}k | Operating Profit ₹${Math.round(snapshot.operatingProfit / 1000)}k | Closing Cash ₹${Math.round(snapshot.closingCash / 1000)}k | Rating: ${valuation.creditRating}`
  );

  const tickResult: MonthlyTickResult = {
    month,
    year,
    totalMonthlyRevenue: snapshot.revenue,
    totalMonthlyExpenses: snapshot.operatingExpenses,
    operatingProfit: snapshot.operatingProfit,
    netIncome: snapshot.netIncome,
    cashFlow: snapshot.cashFlow,
    closingCash: snapshot.closingCash,
    cashHealth,
    enterpriseValuation: valuation,
    currentEra,
    pipelineSteps,
    modelSalesDetails,
    contractIncomeDetails,
    techLicenseDetails,
    logisticsModeBreakdown,
    motorsportNetCost,
    motorsportRevenue: motorsportResult.report.totalMonthlyRevenue,
    motorsportExpense: motorsportResult.report.monthlyExpenses,
    forecast12Months,
    eventsGenerated,
    reputationDeltas,
    annualReportCompiled: annualReport,
    supplyChainSummary,
    summaryLog,
  };

  // Persist result into store so UI tabs immediately reflect updated state
  financeStore.setLastTickResult(tickResult);

  return tickResult;
}

// ─────────────────────────────────────────────────────────────
// Automatic Monthly Simulation Clock Listener Subscription
// ─────────────────────────────────────────────────────────────
if (typeof window !== "undefined") {
  clockListeners.subscribe("month", "financeMonthlyTickOrchestrator", (payload) => {
    try {
      runMonthlyEconomicTick(payload.current.month, payload.current.year);
    } catch (e) {
      console.error("[FinanceOrchestrator] Error during monthly economic tick:", e);
    }
  });
}
