import { describe, it, expect, beforeEach } from "vitest";
import { AccessManager } from "../accessManager";
import { useDeveloperModeStore } from "../../../state/developerModeStore";
import { useSimulationClockStore } from "../../../state/simulationClockStore";
import { useRDTreeStore } from "../../../state/rdTreeStore";

describe("AccessManager Unified Progression & Override Authority", () => {
  beforeEach(() => {
    useDeveloperModeStore.getState().resetToPlayerMode();
    useSimulationClockStore.setState({
      year: 1970,
      month: 1,
      day: 1,
    });
    useRDTreeStore.setState({
      unlockedTechs: [],
    });
  });

  describe("Player Mode (Authentic Era Progression)", () => {
    it("locks 1985 Turbo & Established era in 1970", () => {
      const eraCheck = AccessManager.canAccessEra("ERA_1985_ESTABLISHED");
      expect(eraCheck.allowed).toBe(false);
      expect(eraCheck.requiredYear).toBe(1985);
    });

    it("locks turbocharging and electric powertrains in 1970", () => {
      const turboCheck = AccessManager.canAccessEngine({ isSuperchargedOrTurbo: true });
      expect(turboCheck.allowed).toBe(false);
      expect(turboCheck.requiredYear).toBe(1978);

      const evCheck = AccessManager.canAccessEngine({ isHybridOrElectric: true });
      expect(evCheck.allowed).toBe(false);
      expect(evCheck.requiredYear).toBe(2010);
    });

    it("locks carbon monocoque chassis in 1970", () => {
      const carbonCheck = AccessManager.canAccessVehicleArchitecture({ requiresCarbonMonocoque: true });
      expect(carbonCheck.allowed).toBe(false);
      expect(carbonCheck.requiredYear).toBe(1992);
    });

    it("locks advanced materials before their commercial era", () => {
      const titaniumCheck = AccessManager.canAccessMaterial("TITANIUM_GRADE_5");
      expect(titaniumCheck.allowed).toBe(false);
      expect(titaniumCheck.requiredYear).toBe(2000);

      const steelCheck = AccessManager.canAccessMaterial("BASIC_CARBON_STEEL");
      expect(steelCheck.allowed).toBe(true);
    });

    it("unlocks features naturally when game clock advances to the era", () => {
      useSimulationClockStore.setState({ year: 1995 });

      const turboCheck = AccessManager.canAccessEngine({ isSuperchargedOrTurbo: true });
      expect(turboCheck.allowed).toBe(true);

      const carbonCheck = AccessManager.canAccessVehicleArchitecture({ requiresCarbonMonocoque: true });
      expect(carbonCheck.allowed).toBe(true);

      const titaniumCheck = AccessManager.canAccessMaterial("TITANIUM_GRADE_5");
      expect(titaniumCheck.allowed).toBe(false); // 2000 still in future
    });
  });

  describe("Developer Mode (Override Bypasses)", () => {
    it("bypasses engine locks when ignoreEngineLocks override is active", () => {
      useDeveloperModeStore.setState({
        devMode: true,
        overrides: {
          ...useDeveloperModeStore.getState().overrides,
          ignoreEngineLocks: true,
        },
      });

      const evCheck = AccessManager.canAccessEngine({ isHybridOrElectric: true });
      expect(evCheck.allowed).toBe(true);
      expect(evCheck.bypassedByDevMode).toBe(true);
    });

    it("bypasses vehicle platform locks when ignoreVehicleLocks is active", () => {
      useDeveloperModeStore.setState({
        devMode: true,
        overrides: {
          ...useDeveloperModeStore.getState().overrides,
          ignoreVehicleLocks: true,
        },
      });

      const carbonCheck = AccessManager.canAccessVehicleArchitecture({ requiresCarbonMonocoque: true });
      expect(carbonCheck.allowed).toBe(true);
      expect(carbonCheck.bypassedByDevMode).toBe(true);
    });

    it("bypasses all gates when unlockAll scenario is selected", () => {
      useDeveloperModeStore.getState().unlockAll();

      expect(AccessManager.canAccessEra("ERA_2015_TECH_LEADER").allowed).toBe(true);
      expect(AccessManager.canAccessEngine({ isHybridOrElectric: true }).allowed).toBe(true);
      expect(AccessManager.canAccessVehicleArchitecture({ requiresCarbonMonocoque: true }).allowed).toBe(true);
      expect(AccessManager.canAccessAero({ requiresActiveAero: true }).allowed).toBe(true);
      expect(AccessManager.canAccessInterior({ requiresARHUD: true }).allowed).toBe(true);
    });
  });
});
