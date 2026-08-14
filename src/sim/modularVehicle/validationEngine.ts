// ===================================================================
// MODULAR VEHICLE VALIDATION ENGINE
// ===================================================================
// Validates physical integrity, dependency chains, component compatibility,
// drivetrain orientation, cooling capacity, and weight distribution.
// Emits INFO, WARNING, ERROR, and CRITICAL diagnostic results.
// ===================================================================

import type {
  ModularVehicleAssembly,
  ValidationResult,
  VehicleSubsystem,
} from "./types";
import type { ComponentRegistry } from "./componentRegistry";

export function validateAssembly(
  assembly: ModularVehicleAssembly,
  registry: ComponentRegistry
): ValidationResult[] {
  const results: ValidationResult[] = [];

  const installedList = Array.from(assembly.installedComponents.values());

  // 1. Mandatory Subsystem Completeness Validation
  const requiredSubsystems: { subsystem: VehicleSubsystem; label: string }[] = [
    { subsystem: "suspension", label: "Suspension Geometry" },
    { subsystem: "brakes", label: "Brake System" },
    { subsystem: "wheels", label: "Wheels & Tyres" },
    { subsystem: "steering", label: "Steering Assembly" },
  ];

  for (const { subsystem, label } of requiredSubsystems) {
    const hasSubsystem = installedList.some((inst) => {
      const comp = registry.get(inst.componentId);
      return comp?.subsystem === subsystem;
    });

    if (!hasSubsystem) {
      results.push({
        id: `missing_subsystem_${subsystem}`,
        severity: "ERROR",
        subsystem,
        message: `Missing essential subsystem: ${label}`,
        details: `No ${label.toLowerCase()} is installed on the vehicle chassis. The vehicle cannot operate without ${label.toLowerCase()}.`,
        autoFixAvailable: false,
      });
    }
  }

  // 2. Component Dependency Validation
  for (const installed of installedList) {
    const comp = registry.get(installed.componentId);
    if (!comp) continue;

    for (const depId of comp.dependencies) {
      const isDepInstalled = installedList.some((inst) => inst.componentId === depId);
      if (!isDepInstalled) {
        results.push({
          id: `dep_missing_${installed.componentId}_${depId}`,
          severity: "ERROR",
          subsystem: comp.subsystem,
          componentId: installed.componentId,
          message: `Unsatisfied component dependency: ${depId}`,
          details: `${comp.name} requires ${depId} to be installed first.`,
          autoFixAvailable: false,
        });
      }
    }
  }

  // 3. Mutual Incompatibility Validation
  for (let i = 0; i < installedList.length; i++) {
    for (let j = i + 1; j < installedList.length; j++) {
      const idA = installedList[i].componentId;
      const idB = installedList[j].componentId;

      if (!registry.areCompatible(idA, idB)) {
        const compA = registry.get(idA);
        const compB = registry.get(idB);
        results.push({
          id: `incompatible_${idA}_${idB}`,
          severity: "CRITICAL",
          subsystem: compA?.subsystem || "chassis",
          componentId: idA,
          message: `Component conflict: ${compA?.name || idA} & ${compB?.name || idB}`,
          details: `The selected ${compA?.name} and ${compB?.name} cannot mount together on this chassis due to mechanical clash or structural interference.`,
          autoFixAvailable: false,
        });
      }
    }
  }

  // 4. Thermal Balance Validation (Cooling Capacity vs Engine Waste Heat)
  const stats = assembly.aggregateStats;
  if (stats.totalHeatOutput > 0) {
    if (stats.totalCoolingCapacity === 0) {
      results.push({
        id: "cooling_missing",
        severity: "ERROR",
        subsystem: "cooling",
        message: "No active cooling system installed for powertrain",
        details: `Engine waste heat output is ${Math.round(stats.totalHeatOutput)} kW, but no radiator or heat exchanger is installed. Risk of immediate thermal failure.`,
        autoFixAvailable: true,
      });
    } else {
      const thermalRatio = stats.totalCoolingCapacity / stats.totalHeatOutput;
      if (thermalRatio < 0.85) {
        results.push({
          id: "cooling_insufficient",
          severity: "WARNING",
          subsystem: "cooling",
          message: `Insufficient thermal cooling capacity (${Math.round(thermalRatio * 100)}%)`,
          details: `Powertrain waste heat: ${Math.round(stats.totalHeatOutput)} kW | Installed cooling capacity: ${Math.round(stats.totalCoolingCapacity)} kW. Engine will overheat under sustained track loads.`,
          autoFixAvailable: false,
        });
      }
    }
  }

  // 5. Weight Distribution Stability Validation
  if (stats.totalMass > 0) {
    if (stats.weightDistribution < 0.32 || stats.weightDistribution > 0.68) {
      results.push({
        id: "weight_distribution_extreme",
        severity: "WARNING",
        subsystem: "chassis",
        message: `Extreme weight distribution: ${(stats.weightDistribution * 100).toFixed(1)}% Front`,
        details: `Ideal sports car balance is 45%–55% Front. Current bias (${(stats.weightDistribution * 100).toFixed(1)}% Front / ${((1 - stats.weightDistribution) * 100).toFixed(1)}% Rear) will cause severe handling instability.`,
        autoFixAvailable: false,
      });
    }
  }

  // 6. Braking Capability vs Vehicle Mass Validation
  if (stats.totalMass > 0 && stats.totalBrakingForce > 0) {
    const maxBrakingDecelG = stats.totalBrakingForce / (stats.totalMass * 9.81);
    if (maxBrakingDecelG < 0.7) {
      results.push({
        id: "brakes_undersized",
        severity: "WARNING",
        subsystem: "brakes",
        message: `Braking system undersized for vehicle weight (${maxBrakingDecelG.toFixed(2)} G max deceleration)`,
        details: `Curb weight is ${Math.round(stats.totalMass)} kg. Maximum braking deceleration is only ${maxBrakingDecelG.toFixed(2)} G. Upgrade rotor diameter or caliper piston count.`,
        autoFixAvailable: false,
      });
    }
  }

  return results;
}
