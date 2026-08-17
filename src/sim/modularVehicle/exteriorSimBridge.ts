// ===================================================================
// EXTERIOR VEHICLE SIMULATION AGGREGATE BRIDGE
// ===================================================================
// Computes live vehicle mass, downforce, drag, and torsional metrics
// directly from the exterior assembly configuration.
// ===================================================================

import type {
  ExteriorEngineeringConfig,
  PaintSystemConfig,
  AeroSurfaceConfig,
} from "../types/exterior";
import type { MaterialGrade } from "../assemblyTypes";
import { calculateChassisTorsionalRigidity } from "./chassisTorsionModel";
import { calculateAeroForces } from "../../exterior3d/physics/aeroForceCalculator";
import { calculateBrakeThermalState } from "./thermalBrakeModel";

export interface ExteriorSimAggregate {
  curbWeightKg: number;
  dragCoeffCd: number;
  peakDownforceKgAt200Kmh: number;
  torsionalRigidityKNmPerDeg: number;
  brakeStoppingDist100_0M: number;
}

export function computeExteriorSimAggregates(
  installedTypes: string[],
  variantMap: Record<string, MaterialGrade>,
  extConfig: ExteriorEngineeringConfig,
  paintConfig: PaintSystemConfig,
  aeroConfig: AeroSurfaceConfig
): ExteriorSimAggregate {
  const baseWeight = 420;
  const aeroResult = calculateAeroForces(aeroConfig);
  const torsionResult = calculateChassisTorsionalRigidity(
    variantMap["chassis_frame"] || "forged",
    installedTypes.includes("roll_cage_safety")
  );
  const brakeResult = calculateBrakeThermalState(
    variantMap["brake_rotors_calipers"] === "forged"
  );

  const downforceAt200 = aeroResult.speedSweep.find((s) => s.speedKmh === 200)?.downforceKg || 120;

  return {
    curbWeightKg: baseWeight + installedTypes.length * 14,
    dragCoeffCd: aeroResult.totalCd,
    peakDownforceKgAt200Kmh: downforceAt200,
    torsionalRigidityKNmPerDeg: torsionResult.effectiveRigidityKNmPerDeg,
    brakeStoppingDist100_0M: brakeResult.stoppingDistance100_0M,
  };
}
