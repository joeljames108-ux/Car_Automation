// ===================================================================
// VEHICLE AGGREGATOR — LIVE DYNAMICS METRICS COMPUTATION
// ===================================================================
// Aggregates engineering properties across all installed components
// and computes curb mass, centre of mass (CoM), front/rear weight bias,
// power/torque totals, aero balance, thermal capacity, and rigidity.
// ===================================================================

import type {
  ModularChassis,
  InstalledModularComponent,
  AggregateVehicleStats,
} from "./types";
import { globalComponentRegistry } from "./componentRegistry";

export function computeAggregateStats(
  chassis: ModularChassis,
  installedMap: Map<string, InstalledModularComponent>
): AggregateVehicleStats {
  let totalMass = chassis.engineeringData.mass || 650;
  let totalCost = chassis.engineeringData.cost || 8500;
  let totalPower = chassis.engineeringData.power || 0;
  let totalTorque = chassis.engineeringData.torque || 0;
  let totalDownforce = chassis.engineeringData.downforceCoefficient || 0;
  let totalDrag = chassis.engineeringData.dragCoefficient || 0.32;
  let totalBrakingForce = chassis.engineeringData.brakingForce || 0;
  let totalCoolingCapacity = chassis.engineeringData.coolingCapacity || 0;
  let totalHeatOutput = chassis.engineeringData.heatOutput || 0;
  let torsionalRigidity = chassis.engineeringData.torsionalRigidity || 25;

  // Longitudinal moment calculations (mm * kg) for Centre of Mass & Weight Distribution
  const chassisComX = chassis.engineeringData.centreOfMass?.x ?? chassis.wheelbaseMm * 0.5;
  const chassisComZ = chassis.engineeringData.centreOfMass?.z ?? 380;
  let weightedXSum = chassis.engineeringData.mass * chassisComX;
  let weightedYSum = 0; // Centreline symmetric
  let weightedZSum = chassis.engineeringData.mass * chassisComZ;

  let frontAeroDownforce = 0;
  let rearAeroDownforce = 0;

  for (const [, installed] of installedMap) {
    const comp = globalComponentRegistry.get(installed.componentId);
    if (!comp) continue;

    const eng = comp.engineeringData;
    totalMass += eng.mass;
    totalCost += eng.cost;
    totalPower += eng.power || 0;
    totalTorque += eng.torque || 0;
    totalDownforce += eng.downforceCoefficient || 0;
    totalDrag += eng.dragCoefficient || 0;
    totalBrakingForce += eng.brakingForce || 0;
    totalCoolingCapacity += eng.coolingCapacity || 0;
    totalHeatOutput += eng.heatOutput || 0;
    torsionalRigidity += eng.torsionalRigidity || 0;

    // Installed component local CoM position in chassis space
    const compX = instXPosition(installed, comp, chassis);
    const compY = installed.resolvedTransform.translateY || 0;
    const compZ = eng.centreOfMass?.z ?? 350;

    weightedXSum += eng.mass * compX;
    weightedYSum += eng.mass * compY;
    weightedZSum += eng.mass * compZ;

    // Aero balance accumulation
    if (eng.downforceCoefficient && eng.downforceCoefficient > 0) {
      const bias = eng.aeroBalance ?? (compX > chassis.wheelbaseMm * 0.5 ? 0.8 : 0.2);
      frontAeroDownforce += eng.downforceCoefficient * bias;
      rearAeroDownforce += eng.downforceCoefficient * (1 - bias);
    }
  }

  const comX = totalMass > 0 ? weightedXSum / totalMass : chassis.wheelbaseMm * 0.5;
  const comY = totalMass > 0 ? weightedYSum / totalMass : 0;
  const comZ = totalMass > 0 ? weightedZSum / totalMass : 380;

  // Front weight ratio (X = 0 at rear axle, X = wheelbaseMm at front axle)
  const weightDistribution = Math.max(
    0.1,
    Math.min(0.9, comX / chassis.wheelbaseMm)
  );

  const aeroBalance =
    totalDownforce > 0
      ? frontAeroDownforce / (frontAeroDownforce + rearAeroDownforce)
      : 0.45;

  const thermalBalance =
    totalHeatOutput > 0 ? totalCoolingCapacity / totalHeatOutput : 1.0;

  return {
    totalMass: Math.round(totalMass),
    frontAxleMass: Math.round(totalMass * weightDistribution),
    rearAxleMass: Math.round(totalMass * (1 - weightDistribution)),
    weightDistribution: Math.round(weightDistribution * 1000) / 1000,
    centreOfMass: {
      x: Math.round(comX),
      y: Math.round(comY),
      z: Math.round(comZ),
    },
    totalPower: Math.round(totalPower),
    totalTorque: Math.round(totalTorque),
    totalDownforce: Math.round(totalDownforce * 100) / 100,
    totalDrag: Math.round(totalDrag * 1000) / 1000,
    aeroBalance: Math.round(aeroBalance * 1000) / 1000,
    totalBrakingForce: Math.round(totalBrakingForce),
    totalCoolingCapacity: Math.round(totalCoolingCapacity),
    totalHeatOutput: Math.round(totalHeatOutput),
    thermalBalance: Math.round(thermalBalance * 100) / 100,
    totalCost: Math.round(totalCost),
    torsionalRigidity: Math.round(torsionalRigidity * 10) / 10,
  };
}

function instXPosition(
  installed: InstalledModularComponent,
  comp: import("./types").ModularComponent,
  chassis: ModularChassis
): number {
  if (comp.subsystem === "powertrain") return chassis.wheelbaseMm * 0.75;
  if (comp.subsystem === "transmission") return chassis.wheelbaseMm * 0.55;
  if (comp.subsystem === "suspension" && installed.side) {
    return installed.anchorBindings.some((b) => b.chassisAnchorId.includes("FRONT"))
      ? chassis.wheelbaseMm
      : 0;
  }
  return comp.engineeringData.centreOfMass?.x ?? chassis.wheelbaseMm * 0.5;
}
