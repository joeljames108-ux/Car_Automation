import { describe, it, expect } from "vitest";
import { computeAssembledEngineStats } from "../useAssemblyStore";
import { getAssemblyComponents } from "../../sim/assemblyTypes";
import type { SimResult } from "../../sim/types";

import { defaultDesign } from "../../sim/constants";
import { simulate } from "../../sim/engine";

describe("Engine Assembly Simulation Canonical Unification", () => {
  const componentsList = getAssemblyComponents({ layout: "v8" });
  const canonicalSim = simulate(defaultDesign());

  it("yields 0 HP and 0 torque when engine block is not yet installed", () => {
    const stats = computeAssembledEngineStats({
      installedComponents: [],
      componentsList,
      selectedVariants: {},
      canonicalSim: canonicalSim,
    });

    expect(stats.hp).toBe(0);
    expect(stats.torque).toBe(0);
    expect(stats.weight).toBe(0);
    expect(stats.cost).toBe(0);
  });

  it("scales engine metrics as components are installed", () => {
    const installed = ["block", "crankshaft", "pistons", "rods"] as any;
    const stats = computeAssembledEngineStats({
      installedComponents: installed,
      componentsList,
      selectedVariants: { block: "cast", crankshaft: "forged" },
      canonicalSim: canonicalSim,
    });

    expect(stats.hp).toBeGreaterThan(0);
    expect(stats.torque).toBeGreaterThan(0);
    expect(stats.weight).toBeGreaterThan(0);
    expect(stats.weight).toBeLessThan(canonicalSim.engineWeight);
    expect(stats.cost).toBeGreaterThan(0);
    expect(stats.cost).toBeLessThan(canonicalSim.engineCost);
  });

  it("converges directly on canonical SimResult when all engine components are installed", () => {
    const allIds = componentsList.map((c) => c.id);
    const stats = computeAssembledEngineStats({
      installedComponents: allIds,
      componentsList,
      selectedVariants: {},
      canonicalSim: canonicalSim,
    });

    expect(stats.hp).toBe(canonicalSim.peakPower);
    expect(stats.torque).toBe(canonicalSim.peakTorque);
    expect(stats.weight).toBe(canonicalSim.engineWeight);
    expect(stats.cost).toBe(canonicalSim.engineCost);
    expect(stats.reliability).toBe(Math.round(canonicalSim.reliability * 100));
  });
});
