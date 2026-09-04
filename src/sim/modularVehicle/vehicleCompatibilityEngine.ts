/**
 * ============================================================================
 * VEHICLE COMPATIBILITY & VALIDATION ENGINE
 * ============================================================================
 * Rigorous engineering compatibility solver validating:
 * - Vehicle category vs engine dimensions & displacement
 * - Chassis architecture vs drivetrain & suspension mounting
 * - Dimensional limits vs packaging requirements
 * - Generates actionable warnings & auto-adaptation fixes.
 */

import { EngineConfig, VehicleConfig, EnginePosition, DriveType, SuspensionType } from "../types";
import {
  VehicleCategoryId,
  getVehicleCategory,
  VEHICLE_CATEGORIES,
  CategoryChassisOption,
} from "./vehicleTypeRegistry";

export interface CompatibilityIssue {
  code: string;
  severity: "warning" | "critical";
  title: string;
  message: string;
  component: "chassis" | "engine" | "drivetrain" | "dimensions" | "suspension" | "body";
  fixLabel: string;
  fixAction: "adapt_chassis" | "choose_platform" | "adjust_dimensions" | "adapt_drivetrain";
  suggestedValue?: any;
}

export interface CompatibilityValidationResult {
  isValid: boolean;
  canBuild: boolean; // false if there are critical issues
  issues: CompatibilityIssue[];
  criticalCount: number;
  warningCount: number;
}

export class VehicleCompatibilityEngine {
  /**
   * Evaluates complete vehicle compatibility and returns all issues.
   */
  public static validate(
    categoryId: VehicleCategoryId,
    engine: EngineConfig,
    chassisArchId: string,
    wheelbaseMm: number,
    enginePosition: EnginePosition,
    driveType: DriveType,
    suspensionFront?: SuspensionType,
    suspensionRear?: SuspensionType
  ): CompatibilityValidationResult {
    const issues: CompatibilityIssue[] = [];
    const cat = getVehicleCategory(categoryId);

    // 1. Engine Cylinder Count & Displacement vs Engine Bay Volume
    const cylinderCount = this.getCylinderCount(engine.layout);
    const displacementL = this.estimateDisplacementL(engine);
    const selectedChassis = cat.compatibleChassis.find((c) => c.id === chassisArchId) || cat.compatibleChassis[0];
    const bayVol = selectedChassis?.engineBayVolumeL || cat.engineBayVolumeL;

    // Check if large multi-cylinder engine in small vehicle bay
    if (cylinderCount >= 10 && bayVol < 300) {
      issues.push({
        code: "ENG_BAY_OVERFLOW",
        severity: "critical",
        title: "Engine Bay Packaging Conflict",
        message: `This ${cat.name} chassis (${bayVol}L bay) cannot physically accommodate the selected ${engine.layout.toUpperCase()} (${displacementL.toFixed(1)}L) without structural bay expansion.`,
        component: "chassis",
        fixLabel: "Adapt Chassis Front Frame",
        fixAction: "adapt_chassis",
        suggestedValue: { minBayVolumeL: 420 },
      });
    } else if (cylinderCount >= 8 && bayVol < 240) {
      issues.push({
        code: "ENG_BAY_TIGHT",
        severity: "warning",
        title: "Extremely Tight Engine Packaging",
        message: `The ${engine.layout.toUpperCase()} block leaves less than 15mm clearance to the firewall and front crash box, increasing NVH and thermal soak.`,
        component: "engine",
        fixLabel: "Lengthen Wheelbase +50mm",
        fixAction: "adjust_dimensions",
        suggestedValue: { wheelbaseDeltaMm: 50 },
      });
    }

    // 2. Engine Position Compatibility
    if (!cat.allowedEnginePositions.includes(enginePosition)) {
      issues.push({
        code: "INVALID_ENGINE_POSITION",
        severity: "critical",
        title: "Incompatible Powertrain Placement",
        message: `${cat.name} architecture does not support a ${enginePosition.toUpperCase()}-mounted engine. Expected: ${cat.allowedEnginePositions.join(" or ").toUpperCase()}.`,
        component: "drivetrain",
        fixLabel: `Switch to ${cat.defaultEnginePosition.toUpperCase()} Engine`,
        fixAction: "adapt_drivetrain",
        suggestedValue: { enginePosition: cat.defaultEnginePosition },
      });
    }

    // 3. Formula Open-Wheel Special Constraints
    if (categoryId === "formula_open_wheel") {
      if (cylinderCount > 8) {
        issues.push({
          code: "FORMULA_ENGINE_HOMOLOGATION",
          severity: "critical",
          title: "Formula Homologation Violation",
          message: "Formula single-seater chassis requires compact V6/turbo hybrid powertrains (max 6 cylinders).",
          component: "engine",
          fixLabel: "Configure 1.6L V6 Turbo Hybrid",
          fixAction: "adapt_drivetrain",
        });
      }
      if (driveType !== "rwd") {
        issues.push({
          code: "FORMULA_AWD_FORBIDDEN",
          severity: "critical",
          title: "Open-Wheel RWD Mandate",
          message: "Formula cars are restricted to rear-wheel drive transaxle layouts.",
          component: "drivetrain",
          fixLabel: "Set Drivetrain to RWD",
          fixAction: "adapt_drivetrain",
          suggestedValue: { driveType: "rwd" },
        });
      }
    }

    // 4. EV Platform Skateboard Constraints
    if (categoryId === "ev_platform") {
      if (engine.layout !== "electric" && !engine.hybridArchitecture.includes("phev")) {
        issues.push({
          code: "EV_SKATEBOARD_ICE_MISMATCH",
          severity: "warning",
          title: "Skateboard Platform Warning",
          message: "EV Skateboard architecture is optimized for electric drive units and floor battery modules. Internal combustion requires custom hybrid subframes.",
          component: "chassis",
          fixLabel: "Switch to Electric Drive",
          fixAction: "adapt_drivetrain",
          suggestedValue: { layout: "electric" },
        });
      }
    }

    // 5. Wheelbase Envelope Check
    if (wheelbaseMm < cat.dimensions.wheelbase.min) {
      issues.push({
        code: "WHEELBASE_TOO_SHORT",
        severity: "critical",
        title: "Wheelbase Below Category Safe Envelope",
        message: `Wheelbase of ${wheelbaseMm}mm is below the physical minimum of ${cat.dimensions.wheelbase.min}mm for a ${cat.name}, causing severe drivetrain and cockpit interference.`,
        component: "dimensions",
        fixLabel: `Set Wheelbase to ${cat.dimensions.wheelbase.min}mm`,
        fixAction: "adjust_dimensions",
        suggestedValue: { wheelbaseMm: cat.dimensions.wheelbase.min },
      });
    } else if (wheelbaseMm > cat.dimensions.wheelbase.max) {
      issues.push({
        code: "WHEELBASE_TOO_LONG",
        severity: "warning",
        title: "Wheelbase Exceeds Recommended Envelope",
        message: `Wheelbase of ${wheelbaseMm}mm exceeds typical ${cat.dimensions.wheelbase.max}mm, reducing turning agility and ramp breakover angle.`,
        component: "dimensions",
        fixLabel: `Reset to ${cat.dimensions.wheelbase.default}mm`,
        fixAction: "adjust_dimensions",
        suggestedValue: { wheelbaseMm: cat.dimensions.wheelbase.default },
      });
    }

    // 6. Drivetrain Layout Validation
    if (!cat.allowedDrivetrains.includes(driveType)) {
      issues.push({
        code: "DRIVETRAIN_UNSUPPORTED",
        severity: "warning",
        title: "Unconventional Drivetrain for Category",
        message: `${cat.name} platform rarely utilizes ${driveType.toUpperCase()} drive. Standard options: ${cat.allowedDrivetrains.join("/").toUpperCase()}.`,
        component: "drivetrain",
        fixLabel: `Change to ${cat.defaultDrivetrain.toUpperCase()}`,
        fixAction: "adapt_drivetrain",
        suggestedValue: { driveType: cat.defaultDrivetrain },
      });
    }

    // 7. Suspension Type Validation
    if (suspensionFront && !cat.allowedSuspensions.includes(suspensionFront)) {
      issues.push({
        code: "SUSPENSION_FRONT_MISMATCH",
        severity: "warning",
        title: "Incompatible Front Suspension Kinematics",
        message: `${suspensionFront.toUpperCase()} is not structurally supported on ${cat.name} front chassis towers.`,
        component: "suspension",
        fixLabel: `Use ${cat.defaultSuspensionFront.toUpperCase()}`,
        fixAction: "adapt_chassis",
        suggestedValue: { suspensionFront: cat.defaultSuspensionFront },
      });
    }

    const criticalCount = issues.filter((i) => i.severity === "critical").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;

    return {
      isValid: criticalCount === 0 && warningCount === 0,
      canBuild: criticalCount === 0,
      issues,
      criticalCount,
      warningCount,
    };
  }

  /**
   * Adapts the chassis and dimensions to automatically resolve compatibility conflicts.
   */
  public static autoAdaptChassis(
    categoryId: VehicleCategoryId,
    engine: EngineConfig
  ): {
    wheelbaseMm: number;
    chassisArchId: string;
    enginePosition: EnginePosition;
    driveType: DriveType;
  } {
    const cat = getVehicleCategory(categoryId);
    const cylinderCount = this.getCylinderCount(engine.layout);

    // Pick chassis option with largest bay if engine is large
    let bestChassis = cat.compatibleChassis[0];
    if (cylinderCount >= 8) {
      const sortedByBay = [...cat.compatibleChassis].sort((a, b) => b.engineBayVolumeL - a.engineBayVolumeL);
      bestChassis = sortedByBay[0] || cat.compatibleChassis[0];
    }

    // Determine safe wheelbase
    let wb = cat.dimensions.wheelbase.default;
    if (cylinderCount >= 10) {
      wb = Math.min(cat.dimensions.wheelbase.max, wb + 80);
    }

    return {
      wheelbaseMm: wb,
      chassisArchId: bestChassis.id,
      enginePosition: cat.defaultEnginePosition,
      driveType: cat.defaultDrivetrain,
    };
  }

  private static getCylinderCount(layout: string): number {
    if (layout.includes("12") || layout === "v12" || layout === "w12") return 12;
    if (layout.includes("10") || layout === "v10") return 10;
    if (layout.includes("8") || layout === "v8") return 8;
    if (layout.includes("6") || layout === "i6" || layout === "v6" || layout === "boxer6") return 6;
    if (layout.includes("4") || layout === "i4" || layout === "boxer4") return 4;
    if (layout.includes("3") || layout === "i3") return 3;
    if (layout.includes("16") || layout === "w16") return 16;
    return 4;
  }

  private static estimateDisplacementL(engine: EngineConfig): number {
    const cyl = this.getCylinderCount(engine.layout);
    const boreCm = (engine.bore || 84) / 10;
    const strokeCm = (engine.stroke || 90) / 10;
    const singleCylCc = Math.PI * Math.pow(boreCm / 2, 2) * strokeCm;
    return (singleCylCc * cyl) / 1000;
  }
}
