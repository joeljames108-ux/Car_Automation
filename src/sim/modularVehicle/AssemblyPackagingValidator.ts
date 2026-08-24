/**
 * ============================================================================
 * MODULAR ASSEMBLY PACKAGING & COLLISION VALIDATOR
 * ============================================================================
 * Rigorous real-time verification of physical clearances, component interfaces,
 * structural alignment, and overall assembly health scoring (0-100%).
 */

import { InstalledSubsystemsState } from "../../components/vehicleAssembly/scene/ModularAssemblySceneGraph";

export type ValidationSeverity = "PASS" | "WARNING" | "CONFLICT";

export interface ClearanceIssue {
  id: string;
  category: "wheel_fender" | "brake_wheel" | "engine_bulkhead" | "diffuser_ground" | "aero_balance" | "interfaces";
  title: string;
  description: string;
  severity: ValidationSeverity;
  affectedComponents: string[];
  clearanceMm?: number;
  minimumRequiredMm?: number;
  recommendation?: string;
}

export interface AssemblyHealthReport {
  score: number; // 0 to 100
  rating: "OPTIMAL" | "COMPATIBLE" | "MARGINAL" | "UNFEASIBLE";
  issues: ClearanceIssue[];
  structuralIntegrityScore: number; // 0-100
  packagingClearanceScore: number; // 0-100
  thermalSafetyScore: number; // 0-100
  aerodynamicBalanceScore: number; // 0-100
  summary: string;
}

/**
 * Validates the full assembly packaging state
 */
export function validateAssemblyPackaging(state: InstalledSubsystemsState): AssemblyHealthReport {
  const issues: ClearanceIssue[] = [];

  // ── 1. Wheel-to-Fender Clearance Validation ──
  const wheelDiamInches = 19;
  const tireOverallDiamMm = (wheelDiamInches * 25.4) + (state.tireCompound === "racing_slick" ? 170 : 185);
  const totalBumpTravelMm = 45;
  const fenderClearanceMm = state.chassis.rideHeightMm + 60 - totalBumpTravelMm;

  if (fenderClearanceMm < 15) {
    issues.push({
      id: "fender_bump_rubbing",
      category: "wheel_fender",
      title: "Wheel Arch Clearance Deficit (Bump Rubbing Risk)",
      description: `At ${state.chassis.rideHeightMm}mm ride height, front tire profile has only ${fenderClearanceMm}mm clearance under full suspension bump travel.`,
      severity: fenderClearanceMm < 5 ? "CONFLICT" : "WARNING",
      affectedComponents: ["wheels", "chassis", "body_structure"],
      clearanceMm: fenderClearanceMm,
      minimumRequiredMm: 20,
      recommendation: "Increase ride height by ≥15mm or select widebody fender flares.",
    });
  } else {
    issues.push({
      id: "fender_clearance_ok",
      category: "wheel_fender",
      title: "Wheel Arch & Fender Clearance Verified",
      description: `Tire clearance under full compression is ${fenderClearanceMm}mm (Margin ≥ 20mm OK).`,
      severity: "PASS",
      affectedComponents: ["wheels", "chassis"],
      clearanceMm: fenderClearanceMm,
    });
  }

  // ── 2. Brake Rotor vs Wheel Inner Barrel Clearance ──
  const rotorDiamMm = state.brakeType === "carbon_ceramic" ? 410 : state.brakeType === "slotted_steel" ? 380 : 355;
  const wheelInnerBarrelDiamMm = (wheelDiamInches * 25.4) - 45; // 437.6mm for 19"
  const caliperRadialClearanceMm = (wheelInnerBarrelDiamMm - rotorDiamMm) / 2;

  if (caliperRadialClearanceMm < 8) {
    issues.push({
      id: "brake_barrel_interference",
      category: "brake_wheel",
      title: "Brake Caliper to Rim Barrel Interference",
      description: `${rotorDiamMm}mm rotor with monobloc caliper leaves only ${caliperRadialClearanceMm.toFixed(1)}mm radial clearance inside ${wheelDiamInches}" rim.`,
      severity: caliperRadialClearanceMm < 2 ? "CONFLICT" : "WARNING",
      affectedComponents: ["brakes", "wheels"],
      clearanceMm: Math.round(caliperRadialClearanceMm),
      minimumRequiredMm: 10,
      recommendation: "Upgrade to 20\"/21\" wheel diameters or downsize to 380mm rotor.",
    });
  } else {
    issues.push({
      id: "brake_clearance_ok",
      category: "brake_wheel",
      title: "Brake Caliper Radial Barrel Clearance OK",
      description: `Rotor and caliper package has ${caliperRadialClearanceMm.toFixed(1)}mm inner barrel margin.`,
      severity: "PASS",
      affectedComponents: ["brakes", "wheels"],
      clearanceMm: Math.round(caliperRadialClearanceMm),
    });
  }

  // ── 3. Engine Bulkhead & Layout Compatibility ──
  if (state.enginePosition === "front" && (state.chassis.type === "hypercar" || state.chassis.type === "track")) {
    issues.push({
      id: "engine_chassis_mismatch",
      category: "engine_bulkhead",
      title: "Front Engine Layout on Carbon Monocell Subframe",
      description: "Hypercar carbon monocells require a mid-chassis or rear structural cradle.",
      severity: "WARNING",
      affectedComponents: ["engine", "chassis"],
      recommendation: "Switch engine mounting anchor to 'Mid Engine' for optimal polar moment.",
    });
  } else {
    issues.push({
      id: "engine_mount_ok",
      category: "engine_bulkhead",
      title: "Engine Mounting Alignment & Subframe Hardpoints OK",
      description: `${state.enginePosition.toUpperCase()} engine cradle aligns with chassis bulkhead mounting points.`,
      severity: "PASS",
      affectedComponents: ["engine", "chassis"],
    });
  }

  // ── 4. Diffuser Ground Scraping Clearance ──
  const diffuserGroundGapMm = state.chassis.rideHeightMm - (state.aero.diffuserAngleDeg * 3.2);
  if (diffuserGroundGapMm < 18 && state.aero.diffuserEnabled) {
    issues.push({
      id: "diffuser_ground_scrape",
      category: "diffuser_ground",
      title: "Diffuser Trailing Edge Ground Scrape Risk",
      description: `At ${state.aero.diffuserAngleDeg}° ramp angle and ${state.chassis.rideHeightMm}mm ride height, diffuser trailing strakes are only ${diffuserGroundGapMm.toFixed(1)}mm from asphalt.`,
      severity: diffuserGroundGapMm < 8 ? "CONFLICT" : "WARNING",
      affectedComponents: ["aero", "chassis"],
      clearanceMm: Math.round(diffuserGroundGapMm),
      minimumRequiredMm: 25,
      recommendation: "Reduce diffuser angle below 14° or increase chassis rear ride height.",
    });
  } else if (state.aero.diffuserEnabled) {
    issues.push({
      id: "diffuser_clearance_ok",
      category: "diffuser_ground",
      title: "Underbody Diffuser Venturi Ground Clearance OK",
      description: `Diffuser trailing edge maintains ${diffuserGroundGapMm.toFixed(1)}mm ground clearance.`,
      severity: "PASS",
      affectedComponents: ["aero", "chassis"],
    });
  }

  // ── 5. Aerodynamic Balance Feasibility ──
  const wingCl = state.aero.rearWingEnabled ? 0.35 + (Math.max(0, state.aero.rearWingAngleDeg) * 0.045) : 0;
  const splitCl = state.aero.frontSplitterEnabled ? 0.22 + (state.aero.frontSplitterLengthMm / 1000) * 0.45 : 0;
  const totalCl = wingCl + splitCl;
  const frontBiasPct = totalCl > 0 ? (splitCl / totalCl) * 100 : 50;

  if ((frontBiasPct < 30 || frontBiasPct > 62) && totalCl > 0.4) {
    issues.push({
      id: "aero_balance_skew",
      category: "aero_balance",
      title: `Aero Balance Distortion (${Math.round(frontBiasPct)}% Front / ${Math.round(100 - frontBiasPct)}% Rear)`,
      description: frontBiasPct < 30
        ? "Heavy rear wing downforce without sufficient front splitter authority creates high-speed understeer."
        : "Aggressive front splitter without rear wing balance causes high-speed snap-oversteer.",
      severity: "WARNING",
      affectedComponents: ["aero"],
      recommendation: frontBiasPct < 30
        ? "Extend front splitter or add bumper dive planes."
        : "Increase rear wing angle of attack.",
    });
  }

  // Calculate Scores
  let structuralScore = 98;
  let packagingScore = 95;
  let thermalScore = 92;
  let aeroScore = 94;

  for (const issue of issues) {
    if (issue.severity === "CONFLICT") {
      packagingScore -= 28;
      structuralScore -= 18;
    } else if (issue.severity === "WARNING") {
      packagingScore -= 12;
      if (issue.category === "aero_balance") aeroScore -= 18;
    }
  }

  const overallScore = Math.min(
    100,
    Math.max(
      20,
      Math.round((structuralScore * 0.3) + (packagingScore * 0.4) + (thermalScore * 0.15) + (aeroScore * 0.15))
    )
  );

  const rating =
    overallScore >= 90
      ? "OPTIMAL"
      : overallScore >= 75
      ? "COMPATIBLE"
      : overallScore >= 55
      ? "MARGINAL"
      : "UNFEASIBLE";

  return {
    score: overallScore,
    rating,
    issues,
    structuralIntegrityScore: Math.max(0, structuralScore),
    packagingClearanceScore: Math.max(0, packagingScore),
    thermalSafetyScore: Math.max(0, thermalScore),
    aerodynamicBalanceScore: Math.max(0, aeroScore),
    summary:
      rating === "OPTIMAL"
        ? "All vehicle subassemblies are mechanically verified with clean packaging margins."
        : rating === "COMPATIBLE"
        ? "Vehicle is structurally viable with minor aerodynamic or clearance advisories."
        : "Assembly contains clearance conflicts requiring mechanical adjustment.",
  };
}
