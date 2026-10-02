/**
 * ═══════════════════════════════════════════════════════════════════════
 * FACILITY WORKLOAD, OVERTIME, CAD ERROR PENALTY & BURNOUT ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Phase 6 of the Workforce & Employee Systems Architecture.
 *
 * Governs:
 * 1. Facility-level Workload Intensity (40h Standard vs 52h Crunch vs 65h Death-March)
 * 2. Overtime payroll surcharges (1.0x / 1.30x / 1.70x)
 * 3. Development speed acceleration vs. CAD tolerance / packaging error penalties
 * 4. Morale erosion, chronic fatigue buildup, and resignation/turnover curves
 * 5. Tolerance Stackup & Engineering Change Order (ECO) risk across design units
 * 6. Campus-wide 14-Unit Workload Aggregator
 */

import { CAMPUS_FACILITY_WORKFORCE_MAPPING, CampusFacilityWorkforceProfile } from "./workforceCampusMapping";

export type FacilityWorkloadIntensity = "standard_40h" | "crunch_52h" | "extreme_crunch_65h";

export interface FacilityOvertimePolicy {
  facilityId: string;
  intensity: FacilityWorkloadIntensity;
  consecutiveCrunchMonths: number;
}

export interface FacilityWorkloadReport {
  facilityId: string;
  facilityName: string;
  intensity: FacilityWorkloadIntensity;
  headcount: number;
  monthlyCapacityWU: number;
  monthlyDemandWU: number;
  utilizationPct: number;
  consecutiveCrunchMonths: number;
  
  // Output multipliers & penalties
  speedMultiplier: number;              // 1.0x to 1.50x
  cadErrorRatePenaltyPct: number;       // 0% to 28%
  toleranceStackupRisk: "NONE" | "LOW" | "ELEVATED" | "CRITICAL";
  
  // Human impact
  monthlyMoraleDelta: number;           // e.g. +2 (recovery) or -16 (severe burnout)
  fatigueIndex: number;                 // 0 to 100
  turnoverRiskPct: number;              // Monthly probability of voluntary exit
  projectedResignations: number;        // Staff leaving this month
  
  // Financial impact
  overtimeSurchargeMultiplier: number;  // 1.0x, 1.30x, 1.70x
  estimatedOvertimePayrollEur: number;  // Monthly overtime cost
  
  summary: string;
  diagnostics: string[];
}

export interface CampusWorkloadRollup {
  totalHeadcount: number;
  totalCapacityWU: number;
  totalDemandWU: number;
  averageUtilizationPct: number;
  facilitiesInCrunch: string[];
  totalOvertimePayrollEur: number;
  totalProjectedResignations: number;
  facilityReports: Record<string, FacilityWorkloadReport>;
}

// Base configurations per intensity
const INTENSITY_CONFIG: Record<
  FacilityWorkloadIntensity,
  {
    name: string;
    speedBonus: number;
    baseCadErrorPct: number;
    baseMoraleDelta: number;
    baseTurnoverPct: number;
    overtimeMultiplier: number;
    weeklyHours: number;
  }
> = {
  standard_40h: {
    name: "Standard 40-Hour Week",
    speedBonus: 1.0,
    baseCadErrorPct: 0.0,
    baseMoraleDelta: +2.0,
    baseTurnoverPct: 0.5,
    overtimeMultiplier: 1.0,
    weeklyHours: 40,
  },
  crunch_52h: {
    name: "52-Hour Crunch Overtime",
    speedBonus: 1.25,
    baseCadErrorPct: 8.5,
    baseMoraleDelta: -5.0,
    baseTurnoverPct: 4.5,
    overtimeMultiplier: 1.30,
    weeklyHours: 52,
  },
  extreme_crunch_65h: {
    name: "65-Hour Death-March Overtime",
    speedBonus: 1.50,
    baseCadErrorPct: 24.0,
    baseMoraleDelta: -14.0,
    baseTurnoverPct: 16.0,
    overtimeMultiplier: 1.70,
    weeklyHours: 65,
  },
};

export class FacilityWorkloadAndFatigueEngine {
  /**
   * Evaluates workload, fatigue, CAD error penalties, and turnover for a single facility
   */
  public static evaluateFacilityWorkload(
    facilityId: string,
    intensity: FacilityWorkloadIntensity,
    consecutiveCrunchMonths: number,
    headcount: number,
    monthlyCapacityWU: number,
    monthlyDemandWU: number,
    averageMonthlySalaryEur: number = 4500
  ): FacilityWorkloadReport {
    const profile = CAMPUS_FACILITY_WORKFORCE_MAPPING[facilityId];
    const facilityName = profile ? profile.facilityName : facilityId;
    const config = INTENSITY_CONFIG[intensity];

    // 1. Capacity & Utilization
    const utilizationPct = monthlyCapacityWU > 0 
      ? Math.round((monthlyDemandWU / monthlyCapacityWU) * 100)
      : (headcount > 0 ? 100 : 0);

    // Over-utilization fatigue amplifier
    const overCapacityExcess = Math.max(0, utilizationPct - 100);
    const capacityFatigueMultiplier = 1.0 + (overCapacityExcess / 100) * 0.8;

    // 2. Speed Multiplier
    const speedMultiplier = config.speedBonus;

    // 3. CAD & Tolerance Error Rate Penalty
    // Certain facilities (Powertrain, Design, Chassis, Interior) are highly CAD-sensitive
    const isCadSensitive = ["UNIT_02", "UNIT_04", "UNIT_05", "UNIT_06", "UNIT_03"].includes(facilityId);
    let cadErrorRatePenaltyPct = config.baseCadErrorPct * (isCadSensitive ? 1.0 : 0.6);
    
    // Consecutive crunch compounding
    if (consecutiveCrunchMonths > 1 && intensity !== "standard_40h") {
      cadErrorRatePenaltyPct += Math.min(12.0, (consecutiveCrunchMonths - 1) * 2.2);
    }
    cadErrorRatePenaltyPct = Number(cadErrorRatePenaltyPct.toFixed(1));

    // Tolerance Stackup Risk
    let toleranceStackupRisk: FacilityWorkloadReport["toleranceStackupRisk"] = "NONE";
    if (cadErrorRatePenaltyPct >= 20) {
      toleranceStackupRisk = "CRITICAL";
    } else if (cadErrorRatePenaltyPct >= 10) {
      toleranceStackupRisk = "ELEVATED";
    } else if (cadErrorRatePenaltyPct >= 4) {
      toleranceStackupRisk = "LOW";
    }

    // 4. Morale & Fatigue Calculation
    let monthlyMoraleDelta = config.baseMoraleDelta;
    if (intensity !== "standard_40h") {
      // Compounded morale erosion over months
      monthlyMoraleDelta -= Math.min(10, (consecutiveCrunchMonths - 1) * 2.5);
      monthlyMoraleDelta *= capacityFatigueMultiplier;
    } else {
      // Standard recovery
      monthlyMoraleDelta = Math.max(1, config.baseMoraleDelta - Math.min(1.5, (utilizationPct > 100 ? (utilizationPct - 100) * 0.05 : 0)));
    }
    monthlyMoraleDelta = Number(monthlyMoraleDelta.toFixed(1));

    // Fatigue Index (0-100)
    let fatigueIndex = 15; // baseline fatigue
    if (intensity === "crunch_52h") {
      fatigueIndex = Math.min(85, 45 + consecutiveCrunchMonths * 8);
    } else if (intensity === "extreme_crunch_65h") {
      fatigueIndex = Math.min(100, 70 + consecutiveCrunchMonths * 12);
    } else {
      // Standard 40h allows fatigue dissipation
      fatigueIndex = Math.max(10, 30 - consecutiveCrunchMonths * 5);
    }

    // 5. Turnover & Resignations
    let turnoverRiskPct = config.baseTurnoverPct;
    if (intensity !== "standard_40h") {
      turnoverRiskPct += (consecutiveCrunchMonths - 1) * 3.0;
      if (fatigueIndex > 75) turnoverRiskPct += 5.0;
    }
    turnoverRiskPct = Math.min(45.0, Number(turnoverRiskPct.toFixed(1)));

    const projectedResignations = headcount > 0
      ? Math.round(headcount * (turnoverRiskPct / 100) * 0.5) // ~50% of at-risk staff actually execute exit
      : 0;

    // 6. Overtime Payroll Surcharge
    const basePayroll = headcount * averageMonthlySalaryEur;
    const overtimeSurchargeMultiplier = config.overtimeMultiplier;
    const estimatedOvertimePayrollEur = Math.round(basePayroll * (overtimeSurchargeMultiplier - 1.0));

    // 7. Summary & Diagnostics
    const diagnostics: string[] = [];
    if (utilizationPct > 130) {
      diagnostics.push(`Severe workload bottleneck: demand is ${utilizationPct}% of capacity.`);
    }
    if (toleranceStackupRisk === "CRITICAL") {
      diagnostics.push("High risk of unibody panel mismatches and prototype assembly rework.");
    } else if (toleranceStackupRisk === "ELEVATED") {
      diagnostics.push("Elevated CAD error rate: review engineering release drawings.");
    }
    if (fatigueIndex >= 80) {
      diagnostics.push(`Critical fatigue levels (${fatigueIndex}/100): key personnel are burning out.`);
    }
    if (projectedResignations > 0) {
      diagnostics.push(`Anticipated ${projectedResignations} staff resignation(s) this month.`);
    }

    let summary = `${facilityName} operates on ${config.name} with ${headcount} staff (${utilizationPct}% utilization).`;
    if (intensity === "crunch_52h") {
      summary = `${facilityName} in 52h Crunch: +25% dev speed, +${cadErrorRatePenaltyPct}% CAD errors, morale delta: ${monthlyMoraleDelta} pts.`;
    } else if (intensity === "extreme_crunch_65h") {
      summary = `CRITICAL: ${facilityName} in 65h Death March! +50% dev speed, +${cadErrorRatePenaltyPct}% CAD error rate, ${projectedResignations} burnout resignation(s).`;
    }

    return {
      facilityId,
      facilityName,
      intensity,
      headcount,
      monthlyCapacityWU,
      monthlyDemandWU,
      utilizationPct,
      consecutiveCrunchMonths,
      speedMultiplier,
      cadErrorRatePenaltyPct,
      toleranceStackupRisk,
      monthlyMoraleDelta,
      fatigueIndex,
      turnoverRiskPct,
      projectedResignations,
      overtimeSurchargeMultiplier,
      estimatedOvertimePayrollEur,
      summary,
      diagnostics,
    };
  }

  /**
   * Evaluates workload and overtime across all 14 campus units
   */
  public static evaluateCampusWorkloadRollup(
    policies: Record<string, FacilityOvertimePolicy>,
    headcounts: Record<string, number>,
    capacitiesWU: Record<string, number>,
    demandsWU: Record<string, number>,
    averageSalariesEur: Record<string, number> = {}
  ): CampusWorkloadRollup {
    const facilityReports: Record<string, FacilityWorkloadReport> = {};
    const facilitiesInCrunch: string[] = [];
    let totalHeadcount = 0;
    let totalCapacityWU = 0;
    let totalDemandWU = 0;
    let totalOvertimePayrollEur = 0;
    let totalProjectedResignations = 0;

    const all14UnitKeys = [
      "UNIT_01", "UNIT_02", "UNIT_03", "UNIT_04", "UNIT_05", "UNIT_06", "UNIT_07",
      "UNIT_08", "UNIT_09", "UNIT_10", "UNIT_11", "UNIT_12", "UNIT_13", "UNIT_14"
    ];

    for (const facilityId of all14UnitKeys) {
      const policy = policies[facilityId] || {
        facilityId,
        intensity: "standard_40h",
        consecutiveCrunchMonths: 0,
      };


      const count = headcounts[facilityId] || 0;
      const cap = capacitiesWU[facilityId] || count * 180;
      const dem = demandsWU[facilityId] || 0;
      const salary = averageSalariesEur[facilityId] || 4500;

      const report = this.evaluateFacilityWorkload(
        facilityId,
        policy.intensity,
        policy.consecutiveCrunchMonths,
        count,
        cap,
        dem,
        salary
      );

      facilityReports[facilityId] = report;
      totalHeadcount += count;
      totalCapacityWU += cap;
      totalDemandWU += dem;
      totalOvertimePayrollEur += report.estimatedOvertimePayrollEur;
      totalProjectedResignations += report.projectedResignations;

      if (policy.intensity !== "standard_40h") {
        facilitiesInCrunch.push(facilityId);
      }
    }

    const averageUtilizationPct = totalCapacityWU > 0
      ? Math.round((totalDemandWU / totalCapacityWU) * 100)
      : 0;

    return {
      totalHeadcount,
      totalCapacityWU,
      totalDemandWU,
      averageUtilizationPct,
      facilitiesInCrunch,
      totalOvertimePayrollEur,
      totalProjectedResignations,
      facilityReports,
    };
  }
}
