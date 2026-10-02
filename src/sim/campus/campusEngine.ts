/**
 * CAMPUS SIMULATION & METRICS ENGINE
 * 
 * Aggregates all 14 Campus Units (13 HQ buildings + 1 Factory).
 * Supports:
 * - 1970 Startup configuration (7 Core Starter Buildings, ~108 staff cap).
 * - Prototype Workshop management (2 slots max).
 * - Construction of locked expansion plots (Aero HQ, Proving Grounds, Crash Hall, etc.).
 * - Cross-department synergies and building tier upgrades.
 */

import {
  CampusUnitDefinition,
  CampusUnitId,
  CampusTelemetrySummary,
  FactoryProgressionState,
  BuildingTier
} from "./campusTypes";
import { FactoryProgressionEngine } from "./factoryProgressionEngine";
import { ConstructionJob, tickConstructionQueue } from "./constructionQueue";
import { CampusEventLogEntry, createCampusEvent } from "./campusEvents";
import { getBuildingLevelDefinition } from "./buildingProgression";
import { getCampusModelPath } from "./campusPlotCoordinates";
import { calculateComprehensivePrestige, evaluateDisasterAndSecurityEvents } from "./campusEconomyEngine";

export class CampusEngine {
  /**
   * Calculates comprehensive telemetry for the entire campus
   */
  public static calculateCampusTelemetry(
    units: Record<CampusUnitId, CampusUnitDefinition>,
    factoryState: FactoryProgressionState
  ): CampusTelemetrySummary {
    let totalStaffCapacity = 0;
    let totalCurrentStaff = 0;
    let totalMonthlyExpenses = 0;
    let operationalUnitsCount = 0;
    let lockedPlotsCount = 0;

    let baseRndBonus = 0;
    let baseStylingBonus = 0;
    let baseSafetyBonus = 0;
    let baseQualityRating = 60; // 1970 early-stage baseline

    let prototypeCapacityTotal = 0;
    let activePrototypesCount = 0;

    Object.values(units).forEach(unit => {
      // If factory, use factory progression status
      if (unit.isFactory) {
        const factoryEcon = FactoryProgressionEngine.getEconomicsSummary(factoryState);
        totalMonthlyExpenses += factoryEcon.monthlyOperatingCost;
        if (!factoryEcon.isOutsourced) {
          totalStaffCapacity += 120 * factoryState.factoryLevel;
          totalCurrentStaff += Math.round((120 * factoryState.factoryLevel) * (factoryState.automationLevelPct / 100));
          operationalUnitsCount += 1;
        } else {
          lockedPlotsCount += 1;
        }
        return;
      }

      if (unit.status === "locked") {
        lockedPlotsCount += 1;
        return;
      }

      if (unit.status === "operational" || unit.status === "upgrading") {
        operationalUnitsCount += 1;
        totalStaffCapacity += unit.staffCapacity;
        totalCurrentStaff += unit.currentStaff;
        totalMonthlyExpenses += unit.monthlyMaintenanceCost;

        // Prototype Workshop metrics
        if (unit.prototypeCapacity) {
          prototypeCapacityTotal += unit.prototypeCapacity;
          if (unit.activePrototypes) {
            activePrototypesCount += unit.activePrototypes.filter(s => s.vehicleName !== undefined).length;
          }
        }

        // Sum sub-department costs and perks
        unit.subDepartments.forEach(dept => {
          if (dept.unlocked) {
            totalMonthlyExpenses += dept.monthlyOperatingCost;
          }
        });

        // Sector specific contributions
        if (unit.id === "POWERTRAIN_EV_HQ") {
          baseRndBonus += unit.level * 8;
        } else if (unit.id === "AERO_HQ") {
          baseRndBonus += unit.level * 6;
        } else if (unit.id === "TESTING_VALIDATION_HQ") {
          baseRndBonus += unit.level * 7;
          baseQualityRating += unit.level * 4;
        } else if (unit.id === "VEHICLE_DESIGN_HQ") {
          baseStylingBonus += unit.level * 8;
        } else if (unit.id === "SAFETY_HQ") {
          baseSafetyBonus += unit.level * 10;
        } else if (unit.id === "QUALITY_RELIABILITY_HQ") {
          baseQualityRating += unit.level * 6;
        } else if (unit.id === "MARKETING_SALES_HQ") {
          baseStylingBonus += unit.level * 4;
        }
      }
    });

    // Cross-department synergies:
    // Aero HQ + Motorsport HQ shared technology synergy
    const aeroUnit = units["AERO_HQ"];
    const motorsportUnit = units["MOTORSPORT_HQ"];
    if (aeroUnit?.status === "operational" && motorsportUnit?.status === "operational") {
      baseRndBonus += 6; // +6% synergy bonus
    }

    const factoryEcon = FactoryProgressionEngine.getEconomicsSummary(factoryState);

    const totalPlots = 14;
    const unlockedPlots = totalPlots - lockedPlotsCount;
    const constructionInProgress = Object.values(units).filter(
      u => u.status === "upgrading" || u.status === "under_construction"
    ).length;
    const operationalUnits = Object.values(units).filter(u => u.status === "operational" || u.status === "upgrading");
    const avgLevel = operationalUnits.length > 0
      ? Math.round((operationalUnits.reduce((acc, u) => acc + u.level, 0) / operationalUnits.length) * 10) / 10
      : 0;
    const campusPrestigeScore = calculateComprehensivePrestige(units, factoryState).score;
    const staffUtilizationPct = totalStaffCapacity > 0 ? Math.round((totalCurrentStaff / totalStaffCapacity) * 100) : 0;
    const departmentCoverageScore = Math.min(100, Math.round((operationalUnitsCount / 14) * 100));

    return {
      totalStaffCapacity,
      totalCurrentStaff,
      totalMonthlyExpenses,
      operationalUnitsCount,
      lockedPlotsCount,
      rndSpeedBonusPct: Math.min(100, baseRndBonus),
      stylingPrestigeBonusPct: Math.min(100, baseStylingBonus),
      safetyComplianceBonusPct: Math.min(100, baseSafetyBonus),
      qualityAssuranceRating: Math.min(99, baseQualityRating),
      factoryOutputCapacityYear: factoryEcon.annualCapacity,
      prototypeCapacityTotal,
      activePrototypesCount,
      totalPlots,
      unlockedPlots,
      constructionInProgress,
      averageBuildingLevel: avgLevel,
      campusPrestigeScore,
      monthlyConstructionBurn: 0,
      staffUtilizationPct,
      departmentCoverageScore,
    };
  }

  /**
   * Constructs an unbuilt / locked expansion plot on campus
   */
  public static constructLockedPlot(
    units: Record<CampusUnitId, CampusUnitDefinition>,
    unitId: CampusUnitId,
    currentCash: number
  ): { success: boolean; nextUnits: Record<CampusUnitId, CampusUnitDefinition>; cost: number; message: string } {
    const unit = units[unitId];
    if (!unit) {
      return { success: false, nextUnits: units, cost: 0, message: "Unit plot not found." };
    }

    if (unit.status !== "locked") {
      return { success: false, nextUnits: units, cost: 0, message: `${unit.name} is already constructed.` };
    }

    const cost = unit.constructionUnlockCost || 3000000;
    if (currentCash < cost) {
      return {
        success: false,
        nextUnits: units,
        cost: 0,
        message: `Insufficient capital. Constructing ${unit.name} requires $${(cost / 1e6).toFixed(1)}M.`,
      };
    }

    const initialStaffCap = 40;
    const initialStaff = 15;
    const initialMaintenance = 28000;

    const constructedUnit: CampusUnitDefinition = {
      ...unit,
      status: "operational",
      level: 1,
      tier: "office",
      glbModelPath: getCampusModelPath(unitId, 1),
      staffCapacity: initialStaffCap,
      currentStaff: initialStaff,
      monthlyMaintenanceCost: initialMaintenance,
      subDepartments: unit.subDepartments.map(d => ({
        ...d,
        unlocked: d.requiredUnitLevel <= 1,
      })),
    };

    return {
      success: true,
      nextUnits: {
        ...units,
        [unitId]: constructedUnit,
      },
      cost,
      message: `🎉 Construction completed: ${unit.name} is now operational on campus! Staff capacity: ${initialStaffCap}.`,
    };
  }

  /**
   * Upgrade an HQ building to the next level
   */
  public static upgradeUnit(
    units: Record<CampusUnitId, CampusUnitDefinition>,
    unitId: CampusUnitId,
    currentCash: number
  ): { success: boolean; nextUnits: Record<CampusUnitId, CampusUnitDefinition>; cost: number; message: string } {
    const unit = units[unitId];
    if (!unit) {
      return { success: false, nextUnits: units, cost: 0, message: `Unit '${unitId}' not found.` };
    }

    if (unit.isFactory) {
      return { success: false, nextUnits: units, cost: 0, message: "Factory has its own dedicated progression system." };
    }

    if (unit.status === "locked") {
      return { success: false, nextUnits: units, cost: 0, message: "Plot must be constructed before upgrading." };
    }

    if (unit.level >= unit.maxLevel) {
      return { success: false, nextUnits: units, cost: 0, message: `${unit.name} is already at maximum campus tier (Level ${unit.maxLevel}).` };
    }

    if (currentCash < unit.upgradeCost) {
      return {
        success: false,
        nextUnits: units,
        cost: 0,
        message: `Insufficient capital. Upgrading ${unit.name} requires $${(unit.upgradeCost / 1e6).toFixed(1)}M.`,
      };
    }

    const nextLevel = unit.level + 1;
    const nextStaffCap = Math.round(unit.staffCapacity * 1.5);
    const nextMaintenance = Math.round(unit.monthlyMaintenanceCost * 1.3);
    const nextUpgradeCost = Math.round(unit.upgradeCost * 1.45);

    const tiers: BuildingTier[] = [
      "empty_plot",
      "office",
      "department",
      "center",
      "advanced_hq",
      "world_class_hq",
      "innovation_campus",
      "hypermodern_campus",
    ];

    // If unit has prototypeCapacity, upgrade it!
    let nextPrototypeCap = unit.prototypeCapacity;
    let nextPrototypes = unit.activePrototypes;
    if (unit.prototypeCapacity) {
      nextPrototypeCap = unit.prototypeCapacity + 1; // 2 -> 3 -> 4
      nextPrototypes = [
        ...(unit.activePrototypes || []),
        { slotId: nextPrototypeCap, vehicleName: undefined, activeTask: "idle", progressPct: 0 },
      ];
    }

    // Unlock any sub-departments that match this new level
    const updatedSubDepts = unit.subDepartments.map(d => ({
      ...d,
      unlocked: d.unlocked || d.requiredUnitLevel <= nextLevel,
    }));

    const upgradedUnit: CampusUnitDefinition = {
      ...unit,
      level: nextLevel,
      tier: tiers[Math.min(nextLevel, tiers.length - 1)],
      staffCapacity: nextStaffCap,
      monthlyMaintenanceCost: nextMaintenance,
      upgradeCost: nextUpgradeCost,
      prototypeCapacity: nextPrototypeCap,
      activePrototypes: nextPrototypes,
      subDepartments: updatedSubDepts,
      glbModelPath: getCampusModelPath(unitId, nextLevel),
    };

    return {
      success: true,
      nextUnits: {
        ...units,
        [unitId]: upgradedUnit,
      },
      cost: unit.upgradeCost,
      message: `${unit.name} successfully upgraded to Level ${nextLevel} (${tiers[nextLevel].toUpperCase()})! Staff capacity expanded to ${nextStaffCap}.`,
    };
  }

  /**
   * Unlock or expand a specific sub-department or lab within an HQ unit
   */
  public static upgradeSubDepartment(
    units: Record<CampusUnitId, CampusUnitDefinition>,
    unitId: CampusUnitId,
    subDeptId: string,
    currentCash: number
  ): { success: boolean; nextUnits: Record<CampusUnitId, CampusUnitDefinition>; cost: number; message: string } {
    const unit = units[unitId];
    if (!unit) {
      return { success: false, nextUnits: units, cost: 0, message: "Unit not found." };
    }

    const dept = unit.subDepartments.find(d => d.id === subDeptId);
    if (!dept) {
      return { success: false, nextUnits: units, cost: 0, message: "Sub-department not found." };
    }

    if (!dept.unlocked) {
      return { success: false, nextUnits: units, cost: 0, message: `Requires ${unit.name} Level ${dept.requiredUnitLevel} to unlock.` };
    }

    if (dept.level >= dept.maxLevel) {
      return { success: false, nextUnits: units, cost: 0, message: `${dept.name} is already at max level.` };
    }

    const cost = dept.level * 350000;
    if (currentCash < cost) {
      return {
        success: false,
        nextUnits: units,
        cost: 0,
        message: `Insufficient capital. Department expansion requires $${(cost / 1e3).toLocaleString()}.`,
      };
    }

    const updatedSubDepts = unit.subDepartments.map(d => {
      if (d.id === subDeptId) {
        return {
          ...d,
          level: d.level + 1,
          maxStaff: Math.round(d.maxStaff * 1.3),
          staffAssigned: Math.round(d.staffAssigned * 1.2),
          monthlyOperatingCost: Math.round(d.monthlyOperatingCost * 1.2),
        };
      }
      return d;
    });

    const updatedUnit: CampusUnitDefinition = {
      ...unit,
      subDepartments: updatedSubDepts,
    };

    return {
      success: true,
      nextUnits: {
        ...units,
        [unitId]: updatedUnit,
      },
      cost,
      message: `${dept.name} expanded to Level ${dept.level + 1}!`,
    };
  }

  /**
   * Assign a vehicle to a Prototype Workshop slot
   */
  public static assignPrototypeSlot(
    units: Record<CampusUnitId, CampusUnitDefinition>,
    slotId: number,
    vehicleName: string,
    task: "engine_swap" | "chassis_rigging" | "prototype_assembly" | "inspection"
  ): { success: boolean; nextUnits: Record<CampusUnitId, CampusUnitDefinition>; message: string } {
    const protoUnit = units["CHASSIS_DYNAMICS_HQ"];
    if (!protoUnit || !protoUnit.activePrototypes) {
      return { success: false, nextUnits: units, message: "Prototype garage not available." };
    }

    const updatedSlots = protoUnit.activePrototypes.map(slot => {
      if (slot.slotId === slotId) {
        return {
          ...slot,
          vehicleName,
          activeTask: task,
          progressPct: 15,
        };
      }
      return slot;
    });

    const updatedUnit: CampusUnitDefinition = {
      ...protoUnit,
      activePrototypes: updatedSlots,
    };

    return {
      success: true,
      nextUnits: {
        ...units,
        CHASSIS_DYNAMICS_HQ: updatedUnit,
      },
      message: `Assigned '${vehicleName}' to Prototype Bay ${slotId} for ${task.replace(/_/g, " ")}.`,
    };
  }

  /**
   * Advances the campus simulation state by deltaMonths (Phase 22)
   */
  public static tickCampus(
    units: Record<CampusUnitId, CampusUnitDefinition>,
    factoryState: FactoryProgressionState,
    constructionJobs: ConstructionJob[],
    deltaMonths: number = 1,
    currentYear: number = 1970,
    currentMonth: number = 1
  ): {
    nextUnits: Record<CampusUnitId, CampusUnitDefinition>;
    nextJobs: ConstructionJob[];
    completedJobs: ConstructionJob[];
    events: CampusEventLogEntry[];
    telemetry: CampusTelemetrySummary;
  } {
    // 1. Advance construction queue
    const { updatedJobs, completedJobs } = tickConstructionQueue(constructionJobs, deltaMonths);
    const nextUnits = { ...units };
    const events: CampusEventLogEntry[] = [];

    // 2. Apply completed construction upgrades to units
    for (const job of completedJobs) {
      const u = nextUnits[job.unitId];
      if (u) {
        const lvlDef = getBuildingLevelDefinition(job.targetLevel);
        const nextStaffCap = Math.round(u.staffCapacity * (lvlDef.staffCapMultiplier || 1.2));
        nextUnits[job.unitId] = {
          ...u,
          level: job.targetLevel,
          tier: (lvlDef.tier as BuildingTier) || u.tier,
          status: "operational",
          staffCapacity: nextStaffCap,
          monthlyMaintenanceCost: Math.round(u.monthlyMaintenanceCost * (lvlDef.monthlyMaintenanceMultiplier || 1.3)),
          subDepartments: u.subDepartments.map(d => ({
            ...d,
            unlocked: d.requiredUnitLevel <= job.targetLevel ? true : d.unlocked,
          })),
        };

        events.push(
          createCampusEvent(
            "CONSTRUCTION_COMPLETED",
            "success",
            `${u.name} Upgrade Complete!`,
            `${u.name} has completed construction and is now operating at Level ${job.targetLevel} (${lvlDef.tierLabel}).`,
            currentYear,
            currentMonth,
            job.unitId
          )
        );
      }
    }

    // 3. Evaluate random minor campus incidents & security anomalies (Phase 251 & 252)
    const disasterCheck = evaluateDisasterAndSecurityEvents(nextUnits, currentYear, currentMonth, 2);
    if (disasterCheck.hasIncident && disasterCheck.event) {
      events.push(disasterCheck.event);
    }

    // 4. Compute telemetry
    const telemetry = CampusEngine.calculateCampusTelemetry(nextUnits, factoryState);

    return {
      nextUnits,
      nextJobs: updatedJobs,
      completedJobs,
      events,
      telemetry,
    };
  }
}

/**
 * Pure selector: Get telemetry summary from campus units and factory state
 */
export function getCampusTelemetry(
  units: Record<CampusUnitId, CampusUnitDefinition>,
  factoryState: FactoryProgressionState
): CampusTelemetrySummary {
  return CampusEngine.calculateCampusTelemetry(units, factoryState);
}

