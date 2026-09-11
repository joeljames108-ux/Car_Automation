import { describe, it, expect } from "vitest";
import { getVehicleArchitecture, getAllVehicleArchitectures } from "../vehicleArchitectureRegistry";
import { VehicleAssetValidator } from "../vehicleAssetValidator";
import { getExteriorPresetById } from "../../../state/exteriorAssemblyPresets";

describe("Bus Architecture & Asset Validation Suite", () => {
  it("retrieves the Bus vehicle architecture correctly", () => {
    const busArch = getVehicleArchitecture("bus");
    expect(busArch).toBeDefined();
    expect(busArch.id).toBe("bus");
    expect(busArch.category).toBe("bus");
    expect(busArch.architectureClass).toBe("heavy_duty_transit_bus");
    expect(busArch.overallLengthMm).toBe(10800);
    expect(busArch.wheelbaseMm).toBe(5850);
    expect(busArch.overallWidthMm).toBe(2550);
    expect(busArch.overallHeightMm).toBe(3250);
  });

  it("validates Bus architectural hardpoints against physical proportions", () => {
    const busArch = getVehicleArchitecture("bus");
    const validation = VehicleAssetValidator.validateConfigContracts(busArch);
    expect(validation.isValid).toBe(true);
    expect(validation.issues.filter(i => i.severity === "error")).toHaveLength(0);
  });

  it("retrieves the bus exterior preset from the preset library", () => {
    const preset = getExteriorPresetById("bus_transit_ev");
    expect(preset).toBeDefined();
    expect(preset?.name).toBe("Apex Metro e-Transit Bus 10.8m");
    expect(preset?.exteriorConfig.overallLength).toBe(10800);
    expect(preset?.paintConfig.finishType).toBe("liquid_metallic");
  });

  it("lists bus within all registered architectures", () => {
    const all = getAllVehicleArchitectures();
    const bus = all.find(a => a.id === "bus");
    expect(bus).toBeDefined();
    expect(bus?.assets.chassisAsset).toBe("/vehicles/bus/chassis.glb");
    expect(bus?.assets.bodyFrameworkAsset).toBe("/vehicles/bus/body-framework.glb");
  });
});
