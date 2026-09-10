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
    expect(frontView.paths.length).toBeGreaterThan(0);
  });
});
