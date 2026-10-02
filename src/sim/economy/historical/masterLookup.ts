/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MASTER UNIFIED HISTORICAL ECONOMIC UNIVERSE API (1970 – 2026)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Provides a single, authoritative unified gateway to query the entire
 * historical economic database across all 13 integrated operational domains:
 *
 * 1.  Calendar & Biannual Revisions (114 periods, H1_JAN / H2_JUL)
 * 2.  BLS Consumer Price Index & Monetary Regimes (1970-2026)
 * 3.  FRED AHEMAN Manufacturing Wages & 9 Occupational Ranks
 * 4.  World Bank Pink Sheet Raw Commodities (Al, Cu, Fe, Pb, Ni, Sn, Zn, Rubber)
 * 5.  EIA Energy Spot Prices (WTI Crude, Natural Gas, Steam Coal, Electricity)
 * 6.  BLS PPI Industrial Engineering Materials (14 steels, alloys, polymers, CF prepreg)
 * 7.  Automotive Components with BOM + Labor + Machining Energy + Tooling Breakdown
 * 8.  Full 72-Role Corporate Salary Matrix (9 Ranks × 8 Departments + Rep/Scale adjustments)
 * 9.  Manufacturing Plants, Machinery & Capital Equipment (ENR / PPI construction indices)
 * 10. Logistics, Freight & Warehousing (Semi-truck, Intermodal Rail, RoRo, Container FEU, Cold Storage)
 * 11. Corporate Services, Federal Reserve Interest Rates & Proving Grounds
 * 12. Contemporary Vehicle MSRPs & Wholesale Dealer Margins across 7 Market Segments
 * 13. Motorsport Operations Economics (F1, Le Mans, GT3, WRC Rally)
 * 14. NPC Tier-1/Tier-2 Suppliers & Competitor Pricing Intelligence
 * 15. Market-Revision Engine & Stockpile Speculation System
 */

import { EconomicPeriod, EconomicPeriodId, SemiAnnualRevision, CPIRecord, WageRecord } from "./types";
import { getPeriod, getPeriodById, ECONOMIC_PERIODS } from "./economicCalendar";
import { getCPI } from "./cpiBackbone";
import { getWage } from "./wageBackbone";
import { getCommodityRecord, PeriodCommodityRecord } from "./rawCommodities";
import { getEnergyRecord, PeriodEnergyRecord } from "./energyPrices";
import { getIndustrialMaterialRecord, PeriodIndustrialMaterialRecord } from "./industrialMaterials";
import { getComponentRecord, PeriodComponentRecord } from "./automotiveComponents";
import { getSalaryGridRecord, PeriodSalaryGridRecord } from "./salaryHierarchy";
import { getFactoryMachineryRecord, PeriodFactoryMachineryRecord } from "./factoryAndMachinery";
import { getLogisticsRecord, PeriodLogisticsRecord } from "./logistics";
import { getCorporateRecord, PeriodCorporateRecord } from "./rdAndCorporate";
import { getVehiclePriceRecord, PeriodVehiclePriceRecord } from "./historicalVehicleMSRP";
import { getMotorsportRecord, PeriodMotorsportRecord } from "./motorsportEconomics";
import { getNPCSupplierRecord, PeriodNPCSupplierRecord } from "./npcSupplierEconomics";
import { getMarketRevisionNotice, MarketRevisionNotice } from "./revisionEngine";

export interface HistoricalUniverseSnapshot {
  period: EconomicPeriod;
  year: number;
  month: number;
  revision: SemiAnnualRevision;
  displayDate: string;
  cpi: CPIRecord;
  wages: WageRecord;
  commodities: PeriodCommodityRecord;
  energy: PeriodEnergyRecord;
  materials: PeriodIndustrialMaterialRecord;
  components: PeriodComponentRecord;
  salaries: PeriodSalaryGridRecord;
  factories: PeriodFactoryMachineryRecord;
  logistics: PeriodLogisticsRecord;
  corporate: PeriodCorporateRecord;
  vehicles: PeriodVehiclePriceRecord;
  motorsport: PeriodMotorsportRecord;
  suppliers: PeriodNPCSupplierRecord;
  marketNotice: MarketRevisionNotice;
}

export interface EraComparisonResult {
  startPeriodId: EconomicPeriodId;
  endPeriodId: EconomicPeriodId;
  yearsSpan: number;
  cpiInflationFactor: number;
  cpiInflationPct: number;
  wageGrowthFactor: number;
  wageGrowthPct: number;
  crudeOilGrowthFactor: number;
  crudeOilGrowthPct: number;
  aluminumGrowthFactor: number;
  familySedanMSRPGrowthFactor: number;
  familySedanMSRPGrowthPct: number;
  purchasingPowerLossPct: number;
  summary: string;
}

/**
 * Returns the unified economic universe snapshot for any calendar year and month (1970–2026)
 */
export function getHistoricalUniverse(
  year: number,
  month: number = 1,
  day: number = 1
): HistoricalUniverseSnapshot {
  const period = getPeriod(year, month);

  return {
    period,
    year: period.year,
    month,
    revision: period.revision,
    displayDate: period.displayDate,
    cpi: getCPI(year, month),
    wages: getWage(year, month),
    commodities: getCommodityRecord(year, month),
    energy: getEnergyRecord(year, month),
    materials: getIndustrialMaterialRecord(year, month),
    components: getComponentRecord(year, month),
    salaries: getSalaryGridRecord(year, month),
    factories: getFactoryMachineryRecord(year, month),
    logistics: getLogisticsRecord(year, month),
    corporate: getCorporateRecord(year, month),
    vehicles: getVehiclePriceRecord(year, month),
    motorsport: getMotorsportRecord(year, month),
    suppliers: getNPCSupplierRecord(year, month),
    marketNotice: getMarketRevisionNotice(year, month, day),
  };
}

/**
 * Returns the unified economic universe snapshot by period ID (e.g. "1985-H2")
 */
export function getHistoricalUniverseByPeriod(
  periodId: EconomicPeriodId,
  day: number = 1
): HistoricalUniverseSnapshot {
  const period = getPeriodById(periodId) ?? ECONOMIC_PERIODS[0];
  const month = period.revision === "H1_JAN" ? 1 : 7;
  return getHistoricalUniverse(period.year, month, day);
}

/**
 * Compares macroeconomic indicators and automotive purchasing power between two historical eras
 */
export function compareEconomicEras(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): EraComparisonResult {
  const startUniverse = getHistoricalUniverse(startYear, startMonth);
  const endUniverse = getHistoricalUniverse(endYear, endMonth);

  const startCPI = startUniverse.cpi.cpiU.value;
  const endCPI = endUniverse.cpi.cpiU.value;
  const cpiInflationFactor = Number((endCPI / startCPI).toFixed(3));
  const cpiInflationPct = Number((((endCPI - startCPI) / startCPI) * 100).toFixed(2));

  const startWage = startUniverse.wages.productionWorkerHourlyUSD.value;
  const endWage = endUniverse.wages.productionWorkerHourlyUSD.value;
  const wageGrowthFactor = Number((endWage / startWage).toFixed(3));
  const wageGrowthPct = Number((((endWage - startWage) / startWage) * 100).toFixed(2));

  const startOil = startUniverse.energy.energyPrices.CRUDE_OIL_WTI.priceUSD.value;
  const endOil = endUniverse.energy.energyPrices.CRUDE_OIL_WTI.priceUSD.value;
  const crudeOilGrowthFactor = Number((endOil / startOil).toFixed(3));
  const crudeOilGrowthPct = Number((((endOil - startOil) / startOil) * 100).toFixed(2));

  const startAl = startUniverse.commodities.commodities.ALUMINIUM.priceUSD.value;
  const endAl = endUniverse.commodities.commodities.ALUMINIUM.priceUSD.value;
  const aluminumGrowthFactor = Number((endAl / startAl).toFixed(3));

  const startSedan = startUniverse.vehicles.vehicles.FAMILY_SEDAN.msrpUSD.value;
  const endSedan = endUniverse.vehicles.vehicles.FAMILY_SEDAN.msrpUSD.value;
  const familySedanMSRPGrowthFactor = Number((endSedan / startSedan).toFixed(3));
  const familySedanMSRPGrowthPct = Number((((endSedan - startSedan) / startSedan) * 100).toFixed(2));

  const purchasingPowerLossPct = Number(((1 - 1 / cpiInflationFactor) * 100).toFixed(2));
  const yearsSpan = Math.max(0.5, (endYear + (endMonth - 1) / 12) - (startYear + (startMonth - 1) / 12));

  const summary = `Between ${startUniverse.displayDate} and ${endUniverse.displayDate} (${yearsSpan.toFixed(1)} years), general consumer prices rose ${cpiInflationPct}% (${cpiInflationFactor}x), while autoworker manufacturing wages rose ${wageGrowthPct}% (${wageGrowthFactor}x). Family sedan MSRP transitioned from $${startSedan.toLocaleString()} to $${endSedan.toLocaleString()} (${familySedanMSRPGrowthPct}%). Nominal USD lost ${purchasingPowerLossPct}% of its domestic purchasing power.`;

  return {
    startPeriodId: startUniverse.period.periodId,
    endPeriodId: endUniverse.period.periodId,
    yearsSpan,
    cpiInflationFactor,
    cpiInflationPct,
    wageGrowthFactor,
    wageGrowthPct,
    crudeOilGrowthFactor,
    crudeOilGrowthPct,
    aluminumGrowthFactor,
    familySedanMSRPGrowthFactor,
    familySedanMSRPGrowthPct,
    purchasingPowerLossPct,
    summary,
  };
}
