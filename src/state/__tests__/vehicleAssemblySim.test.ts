import { describe, it, expect } from "vitest";
import { computeAssembledVehicleStats } from "../useVehicleAssemblyStore";
import { getVehicleAssemblyComponents } from "../../sim/vehicleAssemblyTypes";
import { defaultDesign } from "../../sim/constants";
import { simulate } from "../../sim/engine";
import { MaterialGrade } from "../../sim/assemblyTypes";

describe("Vehicle Assembly Simulation Canonical Unification (Bug 4)", () => {
  const design = defaultDesign();
  const canonicalSim = simulate(design);
  const componentsList = getVehicleAssemblyComponents(design.vehicle);
  const defaultVariants: Record<string, MaterialGrade> = {
    chassis_frame: "forged",
    engine_bay: "cast",
    transmission: "forged",
    exhaust_system: "forged",
    suspension_front: "forged",
    suspension_rear: "forged",
    brakes: "forged",
    wheels_tires: "forged",
    aero_package: "forged",
    electronics_ecu: "billet",
  };

  it("reports 0 HP when engine bay is not installed", () => {
    const stats = computeAssembledVehicleStats({
      installedComponents: ["chassis_frame"],
      componentsList,
      selectedVariants: defaultVariants,
      canonicalSimResult: canonicalSim,
    });

    expect(stats.hp).toBe(0);
    expect(stats.torque).toBe(0);
    expect(stats.weight).toBeGreaterThan(0);
  });

  it("reports exact canonical engine power and torque once engine bay is installed", () => {
    const stats = computeAssembledVehicleStats({
      installedComponents: ["chassis_frame", "engine_bay"],
      componentsList,
      selectedVariants: defaultVariants,
      canonicalSimResult: canonicalSim,
    });

    expect(stats.hp).toBe(Math.round(canonicalSim.peakPower));
    expect(stats.torque).toBe(Math.round(canonicalSim.peakTorque));
    expect(stats.hp).not.toBe(450); // NEVER hardcoded arbitrary 450 HP!
  });

  it("converges to canonical SimResult metrics with realistic material variant scaling", () => {
    const allInstalled = componentsList.map((c) => c.id);

    const stats = computeAssembledVehicleStats({
      installedComponents: allInstalled,
      componentsList,
      selectedVariants: defaultVariants,
      canonicalSimResult: canonicalSim,
    });

    expect(stats.hp).toBe(Math.round(canonicalSim.peakPower));
    expect(stats.torque).toBe(Math.round(canonicalSim.peakTorque));
    // Weight converges to canonical curb weight within material variance
    expect(stats.weight).toBeGreaterThan(canonicalSim.weight * 0.7);
    expect(stats.weight).toBeLessThan(canonicalSim.weight * 1.3);
    // Cost scales with selected lightweight materials (forged & billet)
    expect(stats.cost).toBeGreaterThan(canonicalSim.totalCost * 0.8);
    expect(stats.cost).toBeLessThan(canonicalSim.totalCost * 2.5);
  });
});
