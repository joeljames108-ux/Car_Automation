/**
 * AUTO TYCOON CAMPUS HQ - CAMPUS ECONOMY & PROGRESSION ENGINE (PHASES 241–254)
 * 
 * Implements core Epoch 6 mechanics:
 * - Phase 241: Dynamic Construction Cost & Regional Inflation
 * - Phase 242: Contractor Quality & Prestige Modifiers
 * - Phase 247: Building Maintenance & Operational Degradation
 * - Phase 248: Campus Passive Revenue Generation (Showroom, Track Rental, Commercial)
 * - Phase 250: Comprehensive Campus Prestige Score (0–100) & Brand Perception
 * - Phase 251: Disaster & Random Events Engine with Mitigations
 * - Phase 252: Security & Risk Containment Tiers
 * - Phase 253: Energy & Utilities Management (Grid -> Microgrid Solar)
 */

import { CampusUnitDefinition, CampusUnitId, FactoryProgressionState } from "./campusTypes";
import { calculateCampusBonuses } from "./campusBonusEngine";
import { CampusEventLogEntry, createCampusEvent } from "./campusEvents";

// ══════════════════════════════════════════════════════════════════════════
// 1. CAMPUS PASSIVE REVENUE & EXPENSE FINANCES (Phase 248 & Phase 247)
// ══════════════════════════════════════════════════════════════════════════

export interface CampusRevenueBreakdown {
  showroomVisitorTickets: number;
  merchandiseAndHospitality: number;
  trackDayPrivateRentals: number;
  commercialFleetTestingContracts: number;
  patentLicensingRevenue: number;
  totalMonthlyRevenue: number;
}

export interface CampusMonthlyFinances {
  facilitiesMaintenance: number;
  engineeringPayroll: number;
  utilitiesAndEnergy: number;
  totalOperatingExpenses: number;
  revenue: CampusRevenueBreakdown;
  netMonthlyOperatingCashflow: number; // positive = net profit from campus, negative = burn
}

export function calculateCampusMonthlyFinances(
  units: Record<CampusUnitId, CampusUnitDefinition>,
  prestigeScore: number = 25,
  year: number = 1970
): CampusMonthlyFinances {
  let maintenanceTotal = 0;
  let totalStaff = 0;

  Object.values(units).forEach((u) => {
    if (u.status !== "locked") {
      maintenanceTotal += u.monthlyMaintenanceCost;
      totalStaff += u.currentStaff;
    }
  });

  // Base engineering payroll: ~$4,500/mo per engineer scaled by inflation
  const inflationDecades = Math.max(0, (year - 1970) / 10);
  const wageInflationMultiplier = Math.pow(1.28, inflationDecades);
  const engineeringPayroll = Math.round(totalStaff * 3800 * wageInflationMultiplier);

  // Utilities & Energy draw: ~$1,200 per active building level
  let totalActiveLevels = 0;
  Object.values(units).forEach((u) => {
    if (u.status === "operational") {
      totalActiveLevels += u.level;
    }
  });
  const utilitiesAndEnergy = Math.round(totalActiveLevels * 1200 * wageInflationMultiplier);

  // ── PASSIVE REVENUE CALCULATIONS (Phase 248) ──
  // 1. Showroom & Visitor Center (Marketing & Sales HQ - UNIT_14)
  const mktUnit = units["MARKETING_SALES_HQ"];
  let showroomVisitorTickets = 0;
  let merchandiseAndHospitality = 0;
  if (mktUnit && mktUnit.status === "operational") {
    // Visitor interest scales with marketing level and campus prestige
    const visitorVolume = mktUnit.level * 450 + prestigeScore * 35;
    showroomVisitorTickets = Math.round(visitorVolume * 15 * wageInflationMultiplier);
    merchandiseAndHospitality = Math.round(visitorVolume * 8 * wageInflationMultiplier);
  }

  // 2. Track Day & Wind Tunnel Private Rentals (Motorsport HQ & Aero HQ)
  const msportUnit = units["MOTORSPORT_HQ"];
  const aeroUnit = units["AERO_HQ"];
  let trackDayPrivateRentals = 0;
  if (msportUnit && msportUnit.status === "operational") {
    const aeroBonus = aeroUnit && aeroUnit.status === "operational" ? aeroUnit.level * 2500 : 0;
    trackDayPrivateRentals = Math.round(
      (msportUnit.level * 7500 + aeroBonus) * wageInflationMultiplier
    );
  }

  // 3. Commercial Fleet Testing & Rigging Contracts (Commercial HQ - UNIT_09)
  const commUnit = units["COMMERCIAL_VEHICLES_HQ"];
  let commercialFleetTestingContracts = 0;
  if (commUnit && commUnit.status === "operational") {
    commercialFleetTestingContracts = Math.round(commUnit.level * 11500 * wageInflationMultiplier);
  }

  // 4. Patent & Tech Licensing (Powertrain & EV HQ L4+)
  const pwrUnit = units["POWERTRAIN_EV_HQ"];
  let patentLicensingRevenue = 0;
  if (pwrUnit && pwrUnit.status === "operational" && pwrUnit.level >= 4) {
    patentLicensingRevenue = Math.round((pwrUnit.level - 3) * 14000 * wageInflationMultiplier);
  }

  const totalMonthlyRevenue =
    showroomVisitorTickets +
    merchandiseAndHospitality +
    trackDayPrivateRentals +
    commercialFleetTestingContracts +
    patentLicensingRevenue;

  const totalOperatingExpenses = maintenanceTotal + engineeringPayroll + utilitiesAndEnergy;
  const netMonthlyOperatingCashflow = totalMonthlyRevenue - totalOperatingExpenses;

  return {
    facilitiesMaintenance: maintenanceTotal,
    engineeringPayroll,
    utilitiesAndEnergy,
    totalOperatingExpenses,
    revenue: {
      showroomVisitorTickets,
      merchandiseAndHospitality,
      trackDayPrivateRentals,
      commercialFleetTestingContracts,
      patentLicensingRevenue,
      totalMonthlyRevenue,
    },
    netMonthlyOperatingCashflow,
  };
}

// ══════════════════════════════════════════════════════════════════════════
// 2. CAMPUS PRESTIGE SYSTEM & BRAND INFLUENCE (Phase 250)
// ══════════════════════════════════════════════════════════════════════════

export type PrestigeTier =
  | "GARAGE_STARTUP"
  | "REGIONAL_CONTENDER"
  | "ESTABLISHED_OEM"
  | "GLOBAL_BENCHMARK"
  | "LEGENDARY_EMPIRE";

export interface CampusPrestigeSummary {
  score: number; // 0 to 100
  tier: PrestigeTier;
  tierLabel: string;
  tierBadgeColor: string;
  brandPerceptionMultiplier: number; // e.g. 1.0x to 1.30x car demand
  pressReviewBonusPoints: number;    // +0 to +15 extra points on media reviews
  recruitmentAppealBonusPct: number; // +0% to +35% engineer hiring speed
}

export function calculateComprehensivePrestige(
  units: Record<CampusUnitId, CampusUnitDefinition>,
  factoryState?: FactoryProgressionState
): CampusPrestigeSummary {
  const bonuses = calculateCampusBonuses(units);
  let rawScore = 15; // 1970 baseline

  // Operational facilities score
  const operationalUnits = Object.values(units).filter((u) => u.status === "operational");
  rawScore += operationalUnits.length * 2.5; // up to 35 pts for all 14 units

  // Building average level bonus
  const sumLevels = operationalUnits.reduce((acc, u) => acc + u.level, 0);
  rawScore += sumLevels * 0.45; // up to ~30 pts for high-level campus

  // Active compound synergies bonus
  rawScore += bonuses.synergiesActive.length * 4.0;

  // Factory state bonus
  if (factoryState && factoryState.ownershipStatus === "operational_owned") {
    rawScore += 10;
  }

  const score = Math.max(5, Math.min(100, Math.round(rawScore)));

  let tier: PrestigeTier = "GARAGE_STARTUP";
  let tierLabel = "Founding Workshop";
  let tierBadgeColor = "text-slate-700 bg-slate-100 border-slate-300";
  let brandPerceptionMultiplier = 1.0;
  let pressReviewBonusPoints = 0;
  let recruitmentAppealBonusPct = 0;

  if (score >= 85) {
    tier = "LEGENDARY_EMPIRE";
    tierLabel = "Legendary Automotive Empire";
    tierBadgeColor = "text-purple-900 bg-purple-100 border-purple-300";
    brandPerceptionMultiplier = 1.35;
    pressReviewBonusPoints = 15;
    recruitmentAppealBonusPct = 40;
  } else if (score >= 65) {
    tier = "GLOBAL_BENCHMARK";
    tierLabel = "Global Benchmark OEM";
    tierBadgeColor = "text-indigo-900 bg-indigo-100 border-indigo-300";
    brandPerceptionMultiplier = 1.22;
    pressReviewBonusPoints = 10;
    recruitmentAppealBonusPct = 25;
  } else if (score >= 45) {
    tier = "ESTABLISHED_OEM";
    tierLabel = "Established Automaker";
    tierBadgeColor = "text-blue-900 bg-blue-100 border-blue-300";
    brandPerceptionMultiplier = 1.12;
    pressReviewBonusPoints = 6;
    recruitmentAppealBonusPct = 15;
  } else if (score >= 25) {
    tier = "REGIONAL_CONTENDER";
    tierLabel = "Regional Contender";
    tierBadgeColor = "text-emerald-900 bg-emerald-100 border-emerald-300";
    brandPerceptionMultiplier = 1.05;
    pressReviewBonusPoints = 3;
    recruitmentAppealBonusPct = 8;
  }

  return {
    score,
    tier,
    tierLabel,
    tierBadgeColor,
    brandPerceptionMultiplier,
    pressReviewBonusPoints,
    recruitmentAppealBonusPct,
  };
}

// ══════════════════════════════════════════════════════════════════════════
// 3. DISASTER & INCIDENT ENGINE WITH MITIGATION (Phase 251 & 252)
// ══════════════════════════════════════════════════════════════════════════

export type SecurityLevel = 1 | 2 | 3 | 4;

export interface CampusDisasterCheckResult {
  hasIncident: boolean;
  event: CampusEventLogEntry | null;
  mitigatedBySecurity: boolean;
}

export function evaluateDisasterAndSecurityEvents(
  units: Record<CampusUnitId, CampusUnitDefinition>,
  year: number,
  month: number,
  securityLevel: SecurityLevel = 1
): CampusDisasterCheckResult {
  const operationalUnits = (Object.values(units) as CampusUnitDefinition[]).filter(
    (u) => u.status === "operational"
  );
  if (operationalUnits.length === 0) {
    return { hasIncident: false, event: null, mitigatedBySecurity: false };
  }

  const roll = Math.random();
  // 1.8% baseline monthly incident chance
  if (roll > 0.018) {
    return { hasIncident: false, event: null, mitigatedBySecurity: false };
  }

  const targetUnit = operationalUnits[Math.floor(Math.random() * operationalUnits.length)];

  // If Security Level >= 3, 50% chance of intercepting/mitigating before damage
  if (securityLevel >= 3 && Math.random() < 0.5) {
    const preventedEvent = createCampusEvent(
      "STAFF_MILESTONE",
      "info",
      "Security System Alert Intercepted",
      `Automated safety protocols at ${targetUnit.name} successfully contained an anomaly before any damage occurred.`,
      year,
      month,
      targetUnit.id,
      0
    );
    return { hasIncident: true, event: preventedEvent, mitigatedBySecurity: true };
  }

  // Generate appropriate incident based on era and season
  if (year >= 2010 && Math.random() < 0.3) {
    // Modern cyber incident
    const event = createCampusEvent(
      "INCIDENT_ELECTRICAL_SHORT",
      "warning",
      "Telemetry Network Cyber Anomaly",
      `CAD servers at ${targetUnit.name} detected unauthorized network telemetry probing. Firewalls isolated internal vehicle blueprints.`,
      year,
      month,
      targetUnit.id,
      12000
    );
    return { hasIncident: true, event, mitigatedBySecurity: false };
  }

  if (month === 12 || month === 1 || month === 2) {
    // Winter pipe burst
    const event = createCampusEvent(
      "INCIDENT_FROZEN_PIPES",
      "warning",
      "Sub-Zero Freeze: Coolant Line Rupture",
      `Severe frost caused a chilled water manifold rupture at ${targetUnit.name}. Plumbing contractor engaged.`,
      year,
      month,
      targetUnit.id,
      6500
    );
    return { hasIncident: true, event, mitigatedBySecurity: false };
  }

  // Electrical / machinery surge
  const event = createCampusEvent(
    "INCIDENT_ELECTRICAL_SHORT",
    "warning",
    "Transformer Substation Failure",
    `A high-voltage transformer surge damaged motor controllers at ${targetUnit.name}. Emergency breakers tripped.`,
    year,
    month,
    targetUnit.id,
    8500
  );
  return { hasIncident: true, event, mitigatedBySecurity: false };
}

// ══════════════════════════════════════════════════════════════════════════
// 4. ENERGY & SUSTAINABILITY MANAGEMENT (Phase 253 & 254)
// ══════════════════════════════════════════════════════════════════════════

export interface CampusEnergyReport {
  monthlyPowerKWh: number;
  greenEnergyPct: number;
  monthlyCarbonTons: number;
  esgRating: "A+" | "A" | "B" | "C" | "D";
}

export function calculateCampusEnergyProfile(
  units: Record<CampusUnitId, CampusUnitDefinition>,
  year: number
): CampusEnergyReport {
  let activeLevels = 0;
  Object.values(units).forEach((u) => {
    if (u.status === "operational") activeLevels += u.level;
  });

  // Base power consumption: ~18,000 kWh per active level
  const monthlyPowerKWh = activeLevels * 18000;

  // Green energy adoption scales with era: 0% in 1970 -> 85%+ in 2020s
  let greenEnergyPct = 0;
  if (year >= 2020) greenEnergyPct = 85;
  else if (year >= 2010) greenEnergyPct = 50;
  else if (year >= 2000) greenEnergyPct = 25;
  else if (year >= 1990) greenEnergyPct = 10;

  // Carbon tons emitted: ~0.45 kg CO2 per non-green kWh
  const nonGreenKWh = monthlyPowerKWh * (1 - greenEnergyPct / 100);
  const monthlyCarbonTons = Math.round((nonGreenKWh * 0.45) / 1000);

  let esgRating: "A+" | "A" | "B" | "C" | "D" = "D";
  if (greenEnergyPct >= 80) esgRating = "A+";
  else if (greenEnergyPct >= 50) esgRating = "A";
  else if (greenEnergyPct >= 25) esgRating = "B";
  else if (greenEnergyPct >= 10) esgRating = "C";

  return {
    monthlyPowerKWh,
    greenEnergyPct,
    monthlyCarbonTons,
    esgRating,
  };
}
