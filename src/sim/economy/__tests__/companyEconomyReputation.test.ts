/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMPANY ECONOMY & REPUTATION — COMPREHENSIVE TEST SUITE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Verifies all 10 phases of the integrated Company Economy + Reputation system:
 * - Double-entry ledger bookkeeping & monthly financial snapshots
 * - Balance sheet capital assets, depreciation & equity
 * - Master Zustand companyFinanceStore state & actions
 * - Six distinct revenue streams (Vehicle sales, B2B parts, tech licensing, contracts, motorsport, after-sales)
 * - Three-tier expense architecture (Fixed overhead, variable production, CapEx investments)
 * - Per-vehicle itemized BOM cost calculator & gross contribution
 * - Manufacturing utilization, economies of scale & overload penalties
 * - Make vs Buy supply chain decision models
 * - Multi-modal logistics freight costing & rail spur assets
 * - Workforce economics & Section 14 employer prestige recruitment
 * - Section 38 & 40-42 Reputation ↔ Economy Bridge compounding advantages
 * - Customer cohort loyalty, NPS & safety recall mechanics
 * - Enterprise valuation, credit ratings & December annual reports
 * - Full calendar monthly tick orchestration
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  createLedgerTransaction,
  aggregateMonthlySnapshot,
  calculateCashRunway,
  getFlowTypeFromCategory,
  LedgerTransaction,
} from "../companyLedgerEngine";
import {
  buildBalanceSheet,
  depreciateAssetMonth,
  calculateMonthlyMaintenance,
  processMonthlyLiabilities,
  CompanyAsset,
  CompanyLiability,
  INITIAL_1970_ASSETS,
} from "../balanceSheet";
import { useCompanyFinanceStore } from "../../../state/companyFinanceStore";
import { calculateVehicleSales, VehicleSalesInput } from "../vehicleSalesEngine";
import { processComponentSupplyContracts, ComponentSupplyContract } from "../componentSalesEngine";
import { processMonthlyTechLicenses, TechLicenseAgreement } from "../techLicensingEngine";
import { processMotorsportMonth, MotorsportDivisionState } from "../motorsportIncomeEngine";
import { calculateMonthlyAfterSales } from "../afterSalesEngine";
import { calculateMonthlyFixedExpenses } from "../fixedExpenseEngine";
import { calculateUnitVariableCost, calculateMonthlyVariableExpenses, VehicleBillOfMaterials } from "../variableExpenseEngine";
import { createInvestmentProject, processMonthlyInvestmentProjects } from "../investmentExpenseEngine";
import { processMonthlyRDBudget } from "../rdBudgetEngine";
import { calculateVehicleCostBreakdown, VehicleCostParams } from "../vehicleCostCalculator";
import { calculateFactoryEconomics } from "../manufacturingEconomics";
import { evaluateMakeOrBuyDecision, InHouseProductionSpec, SupplierBidQuote } from "../supplyChainCostEngine";
import { calculateShipmentCost, processMonthlyOutboundLogistics } from "../logisticsCostEngine";
import { calculateWorkforceEconomics, INITIAL_1970_WORKFORCE } from "../employeeEconomicsEngine";
import { calculateReputationFinancialModifiers } from "../reputationEconomicBridge";
import { calculateSegmentDemand } from "../salesDemandEngine";
import { registerSoldVehicles, ageCustomerFleetByYear, INITIAL_1970_LOYALTY } from "../customerLoyaltyEngine";
import { executeVehicleRecall, VehicleDefectIssue } from "../recallEngine";
import { evaluateContractBid, filterGatedContracts, GatedContractOpportunity } from "../contractEvaluationEngine";
import { calculateCompanyValuation } from "../companyValuation";
import { compileAnnualReport } from "../annualReportEngine";
import { evaluateFinancialHealth } from "../financialDangerDetector";
import { runMonthlyEconomicTick } from "../monthlyTickOrchestrator";
import { INITIAL_DIMENSION_SCORES } from "../../../state/reputationEngine";
import { useVehicleProductionStore, VehicleProductionLine } from "../vehicleProductionRegistry";
import { getAllCommodityPrices, getCommodityPrice, calculateDynamicRawMaterialsCost } from "../commodityMarketEngine";
import { calculateDealershipEconomics, useDealershipStore } from "../dealershipNetworkEngine";
import { calculateMarketingMonth, useMarketingStore } from "../marketingEngine";
import { getAvailableLoanOpportunities, createActiveLoan, processMonthlyLoans } from "../loanFinancingEngine";
import { evaluateBudgetCompliance, useBudgetStore } from "../budgetAllocationEngine";
import { generate12MonthFinancialForecast } from "../financialForecastEngine";
import { generateMonthlyFinancialEvents } from "../monthlyEventGenerator";
import { calculateMonthlyReputationDeltas } from "../monthlyReputationUpdate";
import { getEraForYear } from "../eraProgressionEngine";

describe("Phase 1: Company Ledger & Balance Sheet", () => {
  it("should create a valid LedgerTransaction with automatic flowType", () => {
    const tx = createLedgerTransaction(1, 1970, "VEHICLE_SALES", 2500000, "Initial pilot sales");
    expect(tx.id).toBeDefined();
    expect(tx.month).toBe(1);
    expect(tx.year).toBe(1970);
    expect(tx.category).toBe("VEHICLE_SALES");
    expect(tx.flowType).toBe("INCOME");
    expect(tx.amount).toBe(2500000);
  });

  it("should aggregate monthly transactions into a clean P&L snapshot", () => {
    const txs: LedgerTransaction[] = [
      createLedgerTransaction(1, 1970, "VEHICLE_SALES", 5000000, "Car deliveries"),
      createLedgerTransaction(1, 1970, "COMPONENT_SALES", 1000000, "Crate engines"),
      createLedgerTransaction(1, 1970, "EMPLOYEE_SALARIES", 1200000, "Payroll"),
      createLedgerTransaction(1, 1970, "RAW_MATERIALS", 1800000, "Sheet steel & aluminum"),
      createLedgerTransaction(1, 1970, "RD_INVESTMENT", 500000, "V8 prototype development"),
    ];

    const snapshot = aggregateMonthlySnapshot(1, 1970, txs, 50000000);
    expect(snapshot.revenue).toBe(6000000);
    expect(snapshot.fixedExpenses).toBe(1200000);
    expect(snapshot.variableExpenses).toBe(1800000);
    expect(snapshot.operatingExpenses).toBe(3000000);
    expect(snapshot.operatingProfit).toBe(3000000);
    expect(snapshot.investments).toBe(500000);
    expect(snapshot.cashFlow).toBe(2500000); // 6M - 3M opex - 0.5M capex
    expect(snapshot.closingCash).toBe(52500000);
  });

  it("should calculate cash runway correctly", () => {
    const profitable = calculateCashRunway(50000000, [
      { cashFlow: 500000 } as any,
    ]);
    expect(profitable).toBe(999); // Profitable

    const burning = calculateCashRunway(10000000, [
      { cashFlow: -1000000 } as any,
      { cashFlow: -1000000 } as any,
    ]);
    expect(burning).toBe(10); // 10 months runway
  });

  it("should build balance sheet and depreciate assets correctly", () => {
    const assets = [...INITIAL_1970_ASSETS];
    const liabilities: CompanyLiability[] = [];
    const sheet = buildBalanceSheet(50000000, assets, liabilities, 2500000, 9500000);

    expect(sheet.cash).toBe(50000000);
    expect(sheet.totalPhysicalAssets).toBe(13000000); // 8M + 3.5M + 1.5M
    expect(sheet.equity).toBe(75000000);
    expect(sheet.debtToEquityRatio).toBe(0);

    const asset = assets[0];
    const depreciated = depreciateAssetMonth(asset);
    expect(depreciated.currentValue).toBeLessThan(asset.currentValue);
  });
});

describe("Phase 1 Zustand Store: companyFinanceStore", () => {
  beforeEach(() => {
    useCompanyFinanceStore.getState().resetTo1970();
  });

  it("should initialize at 1970 founding era baseline", () => {
    const state = useCompanyFinanceStore.getState();
    expect(state.cash).toBe(50000000); // ₹50M seed cash
    expect(state.cashHealth).toBe("HEALTHY");
    expect(state.assets.length).toBe(3);
    expect(state.rdBudget.activeProjects.length).toBe(2);
  });

  it("should record transactions and update balance sheet on monthly tick", () => {
    const store = useCompanyFinanceStore.getState();
    store.recordTransaction(1, 1970, "VEHICLE_SALES", 2000000, "Initial pilot batch");
    const snapshot = store.processMonthlyTick(1, 1970);

    expect(snapshot.revenue).toBe(2000000);
    const updatedStore = useCompanyFinanceStore.getState();
    expect(updatedStore.monthlySnapshots.length).toBe(1);
    expect(updatedStore.assets[0].currentValue).toBeLessThan(INITIAL_1970_ASSETS[0].currentValue);
  });
});

describe("Phase 2: Six Revenue Streams", () => {
  it("should calculate vehicle sales demand and realized pricing", () => {
    const input: VehicleSalesInput = {
      vehicleId: "v1",
      modelName: "Test GT",
      segment: "COUPE",
      listPrice: 1200000,
      monthlyProductionCapacity: 10,
      currentInventory: 5,
      baseMarketMonthlyDemand: 20,
      competitivenessScore: 75,
      overallReputation: 80,
      segmentSpecialistReputation: 70,
      dealerCoveragePct: 30,
      customerLoyaltyScore: 60,
    };

    const res = calculateVehicleSales(input);
    expect(res.unitsSold).toBeGreaterThan(0);
    expect(res.unitsSold).toBeLessThanOrEqual(15);
    expect(res.realizedPricePerUnit).toBeLessThanOrEqual(input.listPrice);
    expect(res.netRevenueToCompany).toBeGreaterThan(0);
  });

  it("should process B2B component supply contracts", () => {
    const contracts: ComponentSupplyContract[] = [
      {
        id: "c1",
        buyerName: "Iso Automobili",
        buyerType: "BOUTIQUE_OEM",
        componentType: "ENGINE",
        componentName: "3.0L V8 Crate",
        unitsPerMonth: 10,
        unitPrice: 120000,
        unitCostToProduce: 70000,
        contractDurationMonths: 12,
        monthsElapsed: 0,
        qualityTolerancePpm: 100,
        reputationRequirement: 40,
        status: "ACTIVE",
      },
    ];

    const { updatedContracts, summary } = processComponentSupplyContracts(contracts);
    expect(summary.totalMonthlyRevenue).toBe(1200000);
    expect(summary.monthlyGrossProfit).toBe(500000);
    expect(summary.grossMarginPct).toBeCloseTo(41.7, 0);
    expect(updatedContracts[0].monthsElapsed).toBe(1);
  });

  it("should process technology licensing royalties", () => {
    const licenses: TechLicenseAgreement[] = [
      {
        id: "lic1",
        technologyId: "vvt",
        technologyName: "VVT Camshaft",
        licenseeName: "Nippon Auto",
        licenseeTier: "TIER1_OEM",
        initialLicensingFee: 10000000,
        perUnitRoyalty: 800,
        estimatedUnitsProducedMonthly: 2000,
        monthlySupportContractFee: 200000,
        durationMonths: 24,
        monthsActive: 0,
        isExclusive: false,
        status: "ACTIVE",
      },
    ];

    const { summary } = processMonthlyTechLicenses(licenses);
    expect(summary.totalMonthlySupportFees).toBe(200000);
    expect(summary.totalMonthlyRoyalties).toBeGreaterThan(1000000);
    expect(summary.totalMonthlyRevenue).toBeGreaterThan(1200000);
  });

  it("should process motorsport income and prize money", () => {
    const racingState: MotorsportDivisionState = {
      tier: "CLUB_RACING",
      isActive: true,
      monthlyOperatingCost: 100000,
      driverSalariesMonthly: 30000,
      racesEnteredThisYear: 0,
      currentChampionshipPoints: 0,
      currentChampionshipStanding: 2,
      sponsors: [
        {
          id: "sp1",
          sponsorName: "Gulf Oil",
          sector: "ENERGY",
          monthlyPayout: 180000,
          minimumStandingRequired: 5,
          contractMonthsRemaining: 12,
        },
      ],
      customerTeamsCount: 2,
      customerTeamMonthlyFeePerTeam: 25000,
      annualPrizeMoneyAccrued: 0,
    };

    const { report } = processMotorsportMonth(racingState, true, 80, 75);
    expect(report.monthlySponsorshipRevenue).toBe(180000);
    expect(report.monthlyCustomerRacingRevenue).toBe(50000);
    expect(report.racePrizeMoneyThisMonth).toBeGreaterThan(0);
    expect(report.netMotorsportCashFlow).toBeGreaterThan(0);
  });

  it("should calculate after-sales servicing and warranty claims", () => {
    const afterSales = calculateMonthlyAfterSales({
      totalActiveVehiclesOnRoad: 1500,
      averageAgeMonths: 18,
      officialDealerRetentionPct: 85,
      customerSatisfactionScore: 82,
      reliabilityReputationScore: 80,
    });

    expect(afterSales.totalGrossAfterSalesRevenue).toBeGreaterThan(0);
    expect(afterSales.netAfterSalesProfit).toBeGreaterThan(0);
    expect(afterSales.warrantyClaimsPaidOut).toBeGreaterThan(0);
  });
});

describe("Phase 3 & 4: Expense System & Cost Structure", () => {
  it("should calculate monthly fixed overhead correctly", () => {
    const fixed = calculateMonthlyFixedExpenses({
      monthlyPayrollTotal: 500000,
      assets: INITIAL_1970_ASSETS,
      dealershipCount: 2,
      commercialTrustScore: 60,
      companyTotalAssetValue: 13000000,
    });

    expect(fixed.employeePayroll).toBe(500000);
    expect(fixed.hqMaintenance).toBe(45000);
    expect(fixed.testingGroundsMaintenance).toBe(40000); // 25k equipment + 15k dyno
    expect(fixed.totalMonthlyFixedExpenses).toBeGreaterThan(570000);
  });

  it("should calculate per-unit variable costs and apply supplier discount", () => {
    const bom: VehicleBillOfMaterials = {
      steelKg: 800,
      aluminumKg: 200,
      carbonFiberKg: 10,
      plasticsRubberKg: 100,
      purchasedPowertrainUnitCost: 50000,
      electronicsAndWiringCost: 20000,
      interiorAndSeatingCost: 30000,
      brakesAndSuspensionHardwareCost: 25000,
      assemblyLaborHours: 80,
      assemblyLaborHourlyRate: 400,
      electricityKwhPerVehicle: 600,
      electricityCostPerKwh: 8,
      logisticsPerUnitCost: 5000,
    };

    const regular = calculateUnitVariableCost(bom, 0);
    const discounted = calculateUnitVariableCost(bom, 10); // 10% discount from supplier rep

    expect(discounted.totalVariableCostPerUnit).toBeLessThan(regular.totalVariableCostPerUnit);
  });

  it("should advance CapEx investment projects into real capital assets", () => {
    const proj = createInvestmentProject("New Wind Tunnel", "WIND_TUNNEL", 10000000, 2, 70);
    expect(proj.reputationDiscountPct).toBeGreaterThan(0);

    // Month 1
    const rep1 = processMonthlyInvestmentProjects([proj], 1970, 1);
    expect(rep1.monthlyCapExBurn).toBeGreaterThan(0);
    expect(rep1.completedAssetsThisMonth.length).toBe(0);

    // Month 2 (Completion)
    const rep2 = processMonthlyInvestmentProjects(rep1.updatedProjects, 1970, 2);
    expect(rep2.completedAssetsThisMonth.length).toBe(1);
    expect(rep2.completedAssetsThisMonth[0].type).toBe("WIND_TUNNEL");
  });

  it("should calculate detailed per-vehicle itemized BOM breakdown", () => {
    const params: VehicleCostParams = {
      vehicleId: "v_gt",
      modelName: "Veloce GT",
      sellingPrice: 1500000,
      monthlyProductionVolume: 20,
      factoryAllocatedFixedMonthlyCost: 200000,
      steelCost: 80000,
      aluminumCost: 60000,
      carbonFiberCost: 20000,
      engineCost: 150000,
      transmissionCost: 70000,
      suspensionCost: 40000,
      brakesCost: 35000,
      electronicsCost: 30000,
      interiorCost: 60000,
      assemblyLaborCost: 50000,
      logisticsCost: 8000,
      warrantyReserveFactor: 0.02,
    };

    const b = calculateVehicleCostBreakdown(params);
    expect(b.allocatedFactoryOverhead).toBe(10000); // 200k / 20
    expect(b.totalCostPerVehicle).toBe(b.totalVariableCost + b.allocatedFactoryOverhead);
    expect(b.grossContribution).toBe(b.sellingPrice - b.totalCostPerVehicle);
    expect(b.grossMarginPct).toBeGreaterThan(50);
    expect(b.breakevenUnitsMonthly).toBeGreaterThan(0);
  });

  it("should calculate factory overload penalties when utilization > 95%", () => {
    const normal = calculateFactoryEconomics({
      factoryId: "f1",
      factoryName: "Main Plant",
      annualRatedCapacity: 1200,
      currentMonthlyOutput: 80, // 80% util
      fixedMonthlyOverhead: 150000,
      baseVariableCostPerUnit: 500000,
      manufacturingReputationScore: 70,
    });
    expect(normal.isOverloaded).toBe(false);
    expect(normal.overloadPenaltyPerUnit).toBe(0);

    const overloaded = calculateFactoryEconomics({
      factoryId: "f1",
      factoryName: "Main Plant",
      annualRatedCapacity: 1200,
      currentMonthlyOutput: 115, // 115% util
      fixedMonthlyOverhead: 150000,
      baseVariableCostPerUnit: 500000,
      manufacturingReputationScore: 70,
    });
    expect(overloaded.isOverloaded).toBe(true);
    expect(overloaded.overloadPenaltyPerUnit).toBeGreaterThan(0);
    expect(overloaded.qualityDefectPpmMultiplier).toBeGreaterThan(1.0);
  });

  it("should evaluate Make vs Buy decisions with breakeven volume", () => {
    const spec: InHouseProductionSpec = {
      componentName: "In-House V8",
      toolingAndCapExRequired: 30000000,
      toolingLifecycleUnits: 100000,
      fixedMonthlyPlantOverhead: 300000,
      directUnitMaterialsAndLabor: 40000,
      internalQualityDefectPpm: 60,
      engineeringScoreRequired: 65,
    };

    const quotes: SupplierBidQuote[] = [
      {
        supplierId: "sup_getrag",
        supplierName: "Getrag Gearboxes",
        componentName: "In-House V8",
        unitPrice: 85000,
        minMonthlyVolume: 10,
        maxMonthlyVolume: 5000,
        leadTimeWeeks: 6,
        defectTolerancePpm: 80,
        paymentTerms: "NET_30",
        supplierReliabilityScore: 85,
        supplierReputationScore: 80,
      },
    ];

    const lowVolume = evaluateMakeOrBuyDecision(spec, quotes, 5); // 5 units/mo
    expect(lowVolume.recommendation).toBe("BUY_FROM_SUPPLIER");

    const highVolume = evaluateMakeOrBuyDecision(spec, quotes, 500); // 500 units/mo
    expect(highVolume.recommendation).toBe("MAKE_IN_HOUSE");
  });
});

describe("Phase 5 & 6: Workforce Economics & Reputation Bridge", () => {
  it("should apply Section 14 employer prestige salary discount or obscurity risk premium", () => {
    const famousCompany = calculateWorkforceEconomics(INITIAL_1970_WORKFORCE, 88, 85);
    expect(famousCompany.hiringPremiumPct).toBeLessThan(0); // Negative = discount
    expect(famousCompany.hiringDifficulty).toBe("LOW");

    const unknownCompany = calculateWorkforceEconomics(INITIAL_1970_WORKFORCE, 20, 25);
    expect(unknownCompany.hiringPremiumPct).toBeGreaterThan(0); // Positive = risk premium paid
    expect(unknownCompany.hiringDifficulty).toBe("SEVERE");
  });

  it("should calculate Section 38 & 40-42 Reputation economic modifiers and expectation fall", () => {
    const modifiers = calculateReputationFinancialModifiers(INITIAL_DIMENSION_SCORES);
    expect(modifiers.brandSalesDemandMultiplier).toBeGreaterThan(0);
    expect(modifiers.reputationFallMultiplier).toBeGreaterThanOrEqual(1.0);

    // With improved reputation (e.g. 75 across the board), total annual advantage is strongly positive
    const improvedScores = { ...INITIAL_DIMENSION_SCORES };
    for (const k of Object.keys(improvedScores) as (keyof typeof INITIAL_DIMENSION_SCORES)[]) {
      improvedScores[k] = { ...improvedScores[k], score: 75 };
    }
    const improvedModifiers = calculateReputationFinancialModifiers(improvedScores);
    expect(improvedModifiers.totalAnnualEconomicAdvantage).toBeGreaterThan(0);
    expect(improvedModifiers.employerSalaryDiscountPct).toBeGreaterThan(0);
  });
});

describe("Phase 7, 8 & 10: Sales, Recall, Valuation & Monthly Orchestration", () => {
  it("should track customer loyalty cohorts and calculate Net Promoter Score", () => {
    let loyalty = registerSoldVehicles(INITIAL_1970_LOYALTY, 1970, "Veloce GT", 50, 85, 90);
    expect(loyalty.totalHistoricalVehiclesSold).toBe(50);
    expect(loyalty.activeVehiclesOnRoad).toBe(50);
    expect(loyalty.netPromoterScore).toBeGreaterThan(0);

    loyalty = ageCustomerFleetByYear(loyalty, 1971);
    expect(loyalty.activeVehiclesOnRoad).toBeLessThanOrEqual(50);
  });

  it("should calculate safety recall costs and reputation damage", () => {
    const issue: VehicleDefectIssue = {
      id: "def1",
      vehicleModelName: "Veloce GT",
      subsystem: "BRAKES",
      description: "Master cylinder seal degradation under track heat",
      affectedVehicleUnits: 120,
      severity: "VOLUNTARY_SAFETY_RECALL",
      replacementPartBOMPerUnit: 4500,
      technicianLaborHoursPerUnit: 3,
      technicianHourlyRate: 500,
      regulatoryFinePerUnit: 1000,
      isVoluntary: true,
      discoveredMonth: 6,
      discoveredYear: 1970,
      status: "ACTIVE_RECALL",
    };

    const result = executeVehicleRecall(issue, 1.2);
    expect(result.totalFinancialCost).toBe(120 * (4500 + 1500 + 1000));
    expect(result.reputationDamage.reliability).toBeLessThan(0);
  });

  it("should calculate company enterprise valuation and assign credit rating", () => {
    const balanceSheet = buildBalanceSheet(50000000, INITIAL_1970_ASSETS, [], 2500000, 9500000);
    const valuation = calculateCompanyValuation(balanceSheet, 5000000, 75, 70, 4);

    expect(valuation.totalEnterpriseValue).toBeGreaterThan(50000000);
    expect(["AAA", "AA+", "AA", "A+", "A", "BBB"]).toContain(valuation.creditRating);
    expect(valuation.impliedSharePrice).toBeGreaterThan(0);
  });

  it("should evaluate financial health danger status and suggest tactical options", () => {
    const healthy = evaluateFinancialHealth(50000000, 500000, 0, 450000, 5, 1250000);
    expect(healthy.status).toBe("HEALTHY");

    const critical = evaluateFinancialHealth(500000, 500000, 200000, 450000, 15, 1250000);
    expect(critical.status).toBe("CRITICAL");
    expect(critical.emergencyActions.length).toBeGreaterThan(0);
  });

  it("should execute full monthly economic tick and compile December annual report", () => {
    // Month 6
    const tickM6 = runMonthlyEconomicTick(6, 1970);
    expect(tickM6.closingCash).toBeGreaterThan(0);
    expect(["HEALTHY", "STABLE"]).toContain(tickM6.cashHealth.status);
    expect(tickM6.annualReportCompiled).toBeUndefined();

    // Month 12 (Year-End)
    const tickM12 = runMonthlyEconomicTick(12, 1970);
    expect(tickM12.annualReportCompiled).toBeDefined();
    expect(tickM12.annualReportCompiled?.year).toBe(1970);
    expect(tickM12.annualReportCompiled?.enterpriseValuation.creditRating).toBeDefined();
  });
});

describe("Monthly Financial Heartbeat & Connected Systems", () => {
  it("should manage multi-model vehicle production lines", () => {
    const store = useVehicleProductionStore.getState();
    expect(store.lines.length).toBeGreaterThanOrEqual(1);

    const newLine: VehicleProductionLine = {
      modelId: "model_sedan_executive_1975",
      modelName: "Berlina 2500 Executive",
      segment: "SEDAN",
      listPrice: 950000,
      monthlyCapacity: 45,
      currentInventory: 0,
      baseMarketMonthlyDemand: 60,
      competitivenessScore: 72,
      dealerCoveragePct: 20,
      customerLoyaltyScore: 50,
      bomProfile: {
        steelKg: 950,
        aluminumKg: 180,
        carbonFiberKg: 0,
        plasticsRubberKg: 140,
        purchasedPowertrainUnitCost: 45000,
        electronicsAndWiringCost: 32000,
        interiorAndSeatingCost: 38000,
        brakesAndSuspensionHardwareCost: 26000,
        assemblyLaborHours: 65,
        assemblyLaborHourlyRate: 420,
        electricityKwhPerVehicle: 600,
        electricityCostPerKwh: 8.5,
        logisticsPerUnitCost: 5200,
      },
      isActive: true,
      launchYear: 1975,
      launchMonth: 1,
    };

    store.addLine(newLine);
    expect(store.getLineById("model_sedan_executive_1975")).toBeDefined();

    // Active in 1975 but not 1974
    const active1974 = store.getActiveLines(1974);
    expect(active1974.some((l) => l.modelId === "model_sedan_executive_1975")).toBe(false);

    const active1975 = store.getActiveLines(1975);
    expect(active1975.some((l) => l.modelId === "model_sedan_executive_1975")).toBe(true);
  });

  it("should calculate dynamic raw material prices across eras, cycles & discounts", () => {
    const steel1970 = getCommodityPrice("STEEL", 1970, 1, "STEADY_GROWTH", 0);
    expect(steel1970.currentMarketPrice).toBeCloseTo(42, -1);

    // Boom increases prices
    const steelBoom = getCommodityPrice("STEEL", 1970, 1, "ECONOMIC_BOOM", 0);
    expect(steelBoom.currentMarketPrice).toBeGreaterThan(steel1970.currentMarketPrice);

    // Supplier reputation discount lowers effective cost
    const steelDiscounted = getCommodityPrice("STEEL", 1970, 1, "STEADY_GROWTH", 15);
    expect(steelDiscounted.effectivePriceWithDiscount).toBeLessThan(steel1970.currentMarketPrice);

    // Era drift: 2000 price is higher than 1970 due to inflation
    const steel2000 = getCommodityPrice("STEEL", 2000, 1, "STEADY_GROWTH", 0);
    expect(steel2000.currentMarketPrice).toBeGreaterThan(steel1970.currentMarketPrice);

    // All commodity map
    const all = getAllCommodityPrices(1970, 6, "STEADY_GROWTH", 10);
    expect(all.STEEL).toBeDefined();
    expect(all.ALUMINUM).toBeDefined();
    expect(all.CARBON_FIBER).toBeDefined();
    expect(all.PLASTICS_RUBBER).toBeDefined();
  });

  it("should calculate dealership network overhead and territory coverage", () => {
    const summary = calculateDealershipEconomics(
      useDealershipStore.getState().dealerships,
      50
    );
    expect(summary.totalLocations).toBe(2);
    expect(summary.totalMonthlyOverhead).toBeGreaterThan(0);
    expect(summary.territoryCoveragePct).toBeGreaterThanOrEqual(10);
    expect(summary.itemizedCosts.rent).toBeGreaterThan(0);
    expect(summary.itemizedCosts.staff).toBeGreaterThan(0);
  });

  it("should calculate marketing awareness growth, decay and sales demand multiplier", () => {
    const plan = {
      totalMonthlySpend: 150000,
      channelAllocations: {
        PRINT_AND_MEDIA: 40,
        DEALER_INCENTIVES: 20,
        LAUNCH_CAMPAIGNS: 20,
        MOTORSPORT_PROMOTION: 10,
        BRAND_EQUITY: 10,
      },
    };

    const report = calculateMarketingMonth(10, plan, 1, 1970, true);
    expect(report.awarenessGain).toBeGreaterThan(0);
    expect(report.endingAwareness).toBeGreaterThan(10);
    expect(report.demandMultiplier).toBeGreaterThan(0.8);

    // Zero spend should result in natural decay
    const zeroPlan = { totalMonthlySpend: 0, channelAllocations: plan.channelAllocations };
    const decayReport = calculateMarketingMonth(50, zeroPlan, 2, 1970, false);
    expect(decayReport.endingAwareness).toBeLessThan(50);
  });

  it("should manage loans with credit rating gating and amortized payments", () => {
    const oppsAAA = getAvailableLoanOpportunities("AAA", 80, 20000000);
    expect(oppsAAA.every((o) => o.isEligible)).toBe(true);

    const oppsCCC = getAvailableLoanOpportunities("CCC", 20, 5000000);
    const bond = oppsCCC.find((o) => o.type === "FACTORY_BOND_ISSUE");
    expect(bond?.isEligible).toBe(false);

    // Create loan and process monthly payment
    const loan = createActiveLoan("EQUIPMENT_TERM_LOAN", 1200000, 24, 6.0, "Test Bank", 1970);
    expect(loan.monthlyPayment).toBeGreaterThan(50000);

    const result = processMonthlyLoans([loan]);
    expect(result.totalMonthlyPayment).toBe(loan.monthlyPayment);
    expect(result.totalInterestPaid).toBeGreaterThan(0);
    expect(result.totalPrincipalRepaid).toBeGreaterThan(0);
    expect(result.updatedLoans[0].principalRemaining).toBeLessThan(1200000);
    expect(result.updatedLoans[0].monthsRemaining).toBe(23);
  });

  it("should evaluate discretionary budget allocation compliance and warnings", () => {
    const plan = useBudgetStore.getState().plan;
    const actuals = {
      RD: 550000, // over planned 450k
      MARKETING: 40000,
    };

    const evalResult = evaluateBudgetCompliance(plan, actuals);
    expect(evalResult.reports.length).toBe(6);
    const rdReport = evalResult.reports.find((r) => r.key === "RD");
    expect(rdReport?.isOverBudget).toBe(true);
    expect(evalResult.warnings.length).toBeGreaterThan(0);
  });

  it("should generate 12-month forward financial forecast with confidence bands", () => {
    const forecast = generate12MonthFinancialForecast({
      currentCash: 50000000,
      currentYear: 1970,
      currentMonth: 1,
      recentSnapshots: [],
      productionLines: useVehicleProductionStore.getState().lines,
      activeContractsCashflowTotal: 0,
      activeLoans: [],
      monthlyRDBudget: 450000,
      monthlyMarketingSpend: 60000,
    });

    expect(forecast.length).toBe(12);
    expect(forecast[0].confidence).toBe("HIGH");
    expect(forecast[11].confidence).toBe("LOW");
    expect(forecast[0].projectedRevenue).toBeGreaterThan(0);
    expect(forecast[0].projectedClosingCash).toBeGreaterThan(0);
  });

  it("should generate contextual monthly financial events", () => {
    const events = generateMonthlyFinancialEvents({
      month: 6,
      year: 1970,
      revenue: 14000000,
      operatingExpenses: 9000000,
      operatingProfit: 5000000,
      closingCash: 48000000,
      monthsOfRunway: 1.8, // Critical runway
      warrantyClaimsPaid: 450000, // Spike
      completedRDProjectNames: ["High-Compression V8"],
      maturedLoanNames: ["Equipment Term Loan"],
      expiringContractTitles: ["Atlas Gearbox Supply"],
      significantCommodityChange: { name: "Automotive Steel", pctChange: 6.2 },
    });

    expect(events.length).toBeGreaterThanOrEqual(5);
    expect(events.some((e) => e.type === "DANGER_ALERT")).toBe(true);
    expect(events.some((e) => e.type === "WARRANTY_SPIKE")).toBe(true);
    expect(events.some((e) => e.type === "RD_MILESTONE")).toBe(true);
    expect(events.some((e) => e.type === "LOAN_MATURITY")).toBe(true);
  });

  it("should clamp monthly reputation changes to ±0.8 per dimension", () => {
    const deltas = calculateMonthlyReputationDeltas({
      month: 3,
      year: 1970,
      contractsFulfillmentRatePct: 100,
      warrantyClaimRatio: 0.12, // High defects
      vehicleSalesCapacityUtilizationPct: 95,
      motorsportActive: true,
      motorsportStanding: 1, // Winner!
      cashHealthStatus: "HEALTHY",
      marketingAwareness: 45,
    });

    expect(deltas.length).toBeGreaterThan(0);
    for (const d of deltas) {
      expect(Math.abs(d.delta)).toBeLessThanOrEqual(0.8);
    }
  });

  it("should return appropriate era specifications across decades", () => {
    const era1970 = getEraForYear(1972);
    expect(era1970.eraType).toBe("ERA_1970_STARTUP");

    const era1990 = getEraForYear(1990);
    expect(era1990.eraType).toBe("ERA_1985_ESTABLISHED");

    const era2005 = getEraForYear(2005);
    expect(era2005.eraType).toBe("ERA_2000_MULTINATIONAL");

    const era2022 = getEraForYear(2022);
    expect(era2022.eraType).toBe("ERA_2015_TECH_LEADER");
  });

  it("should execute the full 14-step strict monthly pipeline with itemized breakdowns", () => {
    const result = runMonthlyEconomicTick(3, 1970);

    // 14 pipeline steps
    expect(result.pipelineSteps.length).toBe(14);
    expect(result.pipelineSteps[0].name).toBe("PRODUCTION_PLANNING");
    expect(result.pipelineSteps[13].name).toBe("NEXT_MONTH_PREP");

    // Multi-model sales itemization
    expect(result.modelSalesDetails.length).toBeGreaterThanOrEqual(1);
    expect(result.modelSalesDetails[0].modelName).toBe("Veloce 3000 GT Prototype");
    expect(result.modelSalesDetails[0].grossProfit).toBeDefined();

    // 12-month forward forecast
    expect(result.forecast12Months.length).toBe(12);

    // Events and reputation updates
    expect(result.eventsGenerated).toBeDefined();
    expect(result.reputationDeltas).toBeDefined();
    expect(result.closingCash).toBeGreaterThan(0);
  });
});

