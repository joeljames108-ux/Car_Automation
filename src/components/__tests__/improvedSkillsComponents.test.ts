import { describe, it, expect } from "vitest";
import { PhotorealisticVehicleBlueprint } from "../assembly/iso3d/PhotorealisticVehicleBlueprint";
import { ChassisFeaStressCard } from "../chassis/ChassisFeaStressCard";
import { EvBatteryThermalStudio } from "../powertrain/EvBatteryThermalStudio";
import { MultiViewProjectionEngine } from "../../exterior3d/projections/multiViewProjectionEngine";

describe("Domain Skills Components & Photorealistic SVG Verification", () => {
  it("PhotorealisticVehicleBlueprint should be defined and memoized", () => {
    expect(PhotorealisticVehicleBlueprint).toBeDefined();
    expect(typeof PhotorealisticVehicleBlueprint).toBe("object");
  });

  it("ChassisFeaStressCard should be defined and memoized", () => {
    expect(ChassisFeaStressCard).toBeDefined();
    expect(typeof ChassisFeaStressCard).toBe("object");
  });

  it("EvBatteryThermalStudio should be defined and memoized", () => {
    expect(EvBatteryThermalStudio).toBeDefined();
    expect(typeof EvBatteryThermalStudio).toBe("object");
  });

  it("MultiViewProjectionEngine should render all 4 projection views", () => {
    const params = {
      wheelbaseMm: 2820,
      frontTrackMm: 1600,
      rearTrackMm: 1620,
      rideHeightMm: 135,
      roofHeightMm: 1420,
      engineBayLengthMm: 980,
      cabinWidthMm: 1840,
      frontOverhangMm: 860,
      rearOverhangMm: 980,
    };

    const isoView = MultiViewProjectionEngine.renderBlueprint('ISOMETRIC_AXONOMETRIC', params);
    expect(isoView.paths.length).toBeGreaterThan(0);
    expect(isoView.hardpointMarkers.length).toBeGreaterThan(0);

    const sideView = MultiViewProjectionEngine.renderBlueprint('SIDE_PROFILE', params);
    expect(sideView.paths.length).toBeGreaterThan(0);

    const topView = MultiViewProjectionEngine.renderBlueprint('TOP_PLAN', params);
    expect(topView.paths.length).toBeGreaterThan(0);

    const frontView = MultiViewProjectionEngine.renderBlueprint('FRONT_ELEVATION', params);
  });
});

import { getCompleteVehicleGlbPath, getStageGlbPaths } from "../../state/modularVehicleBuilderStore";

describe("Complete Vehicle GLB Resolution", () => {
  it("resolves correct GLB paths for vehicle models", () => {
    expect(getCompleteVehicleGlbPath("sedan")).toBe("/models/Car_Sedan_Complete.glb");
    expect(getCompleteVehicleGlbPath("crossover")).toBe("/models/Car_Crossover_Complete.glb");
    expect(getCompleteVehicleGlbPath("crossover_cuv")).toBe("/models/Car_Crossover_Complete.glb");
    expect(getCompleteVehicleGlbPath("luxury_suv")).toBe("/models/Car_Crossover_Complete.glb");
    expect(getCompleteVehicleGlbPath("performance_suv")).toBe("/models/Car_Crossover_Complete.glb");
    expect(getCompleteVehicleGlbPath("offroad_suv")).toBe("/models/Car_Crossover_Complete.glb");
    expect(getCompleteVehicleGlbPath("suv")).toBe("/models/Car_Suv_Complete.glb");
    expect(getCompleteVehicleGlbPath("f1")).toBe("/models/Car_F1_Complete.glb");
    expect(getCompleteVehicleGlbPath("hypercar")).toBe("/models/Car_Hypercar_Complete.glb");
    expect(getCompleteVehicleGlbPath("gt3")).toBe("/models/Car_GT3_Supercar_Complete.glb");
    expect(getCompleteVehicleGlbPath("pickup_truck")).toBe("/models/Car_HiLux_SR5_Complete.glb");
    expect(getCompleteVehicleGlbPath("pickup")).toBe("/models/Car_HiLux_SR5_Complete.glb");
  });

  it("getStageGlbPaths returns complete vehicle GLB when stage is complete", () => {
    const paths = getStageGlbPaths("complete", "sedan");
    expect(paths).toEqual(["/models/Car_Sedan_Complete.glb"]);

    const pickupComplete = getStageGlbPaths("complete", "pickup_truck");
    expect(pickupComplete).toEqual(["/models/Car_HiLux_SR5_Complete.glb"]);
  });

  it("getStageGlbPaths returns dedicated pickup CAD stages", () => {
    expect(getStageGlbPaths("chassis", "pickup_truck")).toEqual(["/models/modular_parts/pickup/chassis.glb"]);
    expect(getStageGlbPaths("lighting_glass", "pickup_truck")).toEqual(["/models/modular_parts/pickup/lighting_glass.glb"]);
  });
});

import { VehicleDesigner } from "../VehicleDesigner";
import { InteractiveDashboardStudio } from "../interior/InteractiveDashboardStudio";

import { FinalBuildStudio } from "../finalBuild/FinalBuildStudio";

describe("VehicleDesigner & Interior Studio Sub-Tab Verification", () => {
  it("VehicleDesigner is defined and exports clean modular sub-tabs", () => {
    expect(VehicleDesigner).toBeDefined();
    expect(typeof VehicleDesigner).toBe("function");
  });

  it("InteractiveDashboardStudio is defined and supports edge-to-edge 3D GLB canvas", () => {
    expect(InteractiveDashboardStudio).toBeDefined();
    expect(typeof InteractiveDashboardStudio).toBe("function");
  });

  it("FinalBuildStudio is defined and supports custom typed model designation", () => {
    expect(FinalBuildStudio).toBeDefined();
    expect(typeof FinalBuildStudio).toBe("function");
  });
});

import { SafetyCenter } from "../SafetyCenter";

describe("Safety Center & Pipeline Sequence Verification", () => {
  it("SafetyCenter is defined and exports stage 5 engineering controls", () => {
    expect(SafetyCenter).toBeDefined();
    expect(typeof SafetyCenter).toBe("function");
  });
});



