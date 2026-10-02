/**
 * ═══════════════════════════════════════════════════════════════════════
 * MONTHLY TICK TYPES — SHARED SIMULATION REPORT & SUMMARY SCHEMAS
 * ═══════════════════════════════════════════════════════════════════════
 */

import { FinancialHealthAssessment } from "./financialDangerDetector";
import { ValuationBreakdown } from "./companyValuation";
import { AnnualReport } from "./annualReportEngine";
import { ForecastMonth } from "./financialForecastEngine";
import { MonthlyFinancialEvent } from "./monthlyEventGenerator";
import { DimensionDeltaReport } from "./monthlyReputationUpdate";
import { EraSpecification } from "./eraProgressionEngine";
import { FreightTransportMode } from "./logisticsCostEngine";
import { MonthlySupplyChainSummary } from "../trade/tradeTypes";

export interface PipelineStepSummary {
  step: number;
  name: string;
  transactionsGenerated: number;
  netImpact: number; // positive = income, negative = expense
  description: string;
}

export interface ModelSalesItem {
  modelId: string;
  modelName: string;
  segment: string;
  unitsProduced: number;
  unitsDemanded: number;
  unitsSold: number;
  remainingInventory: number;
  listPrice: number;
  realizedPrice: number;
  grossRevenue: number;
  netRevenue: number;
  dealerCommissions: number;
  variableCostsTotal: number;
  grossProfit: number;
}

export interface ContractIncomeItem {
  contractId: string;
  customerName: string;
  contractType: string;
  monthlyCashflow: number;
}

export interface TechLicenseItem {
  id: string;
  technologyName: string;
  licenseeName: string;
  monthlyRevenue: number;
  remainingMonths: number;
}

export interface LogisticsModeSubtotal {
  mode: FreightTransportMode;
  vehiclesShipped: number;
  totalCost: number;
  costPerVehicle: number;
}

export interface MonthlyTickResult {
  month: number;
  year: number;
  totalMonthlyRevenue: number;
  totalMonthlyExpenses: number;
  operatingProfit: number;
  netIncome: number;
  cashFlow: number;
  closingCash: number;
  cashHealth: FinancialHealthAssessment;
  enterpriseValuation: ValuationBreakdown;
  currentEra: EraSpecification;
  pipelineSteps: PipelineStepSummary[];
  modelSalesDetails: ModelSalesItem[];
  contractIncomeDetails: ContractIncomeItem[];
  techLicenseDetails: TechLicenseItem[];
  logisticsModeBreakdown: LogisticsModeSubtotal[];
  motorsportNetCost: number;
  motorsportRevenue: number;
  motorsportExpense: number;
  forecast12Months: ForecastMonth[];
  eventsGenerated: MonthlyFinancialEvent[];
  reputationDeltas: DimensionDeltaReport[];
  annualReportCompiled?: AnnualReport;
  supplyChainSummary?: MonthlySupplyChainSummary;
  summaryLog: string[];
}
