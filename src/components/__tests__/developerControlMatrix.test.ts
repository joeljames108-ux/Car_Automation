import { describe, it, expect, beforeEach } from "vitest";
import { useDeveloperModeStore } from "../../state/developerModeStore";

describe("Developer Control Matrix & Granular Overrides Engine", () => {
  beforeEach(() => {
    useDeveloperModeStore.getState().resetToPlayerMode();
  });

  it("initializes with player mode defaults when reset", () => {
    const store = useDeveloperModeStore.getState();
    expect(store.devMode).toBe(false);
    expect(store.overrides.ignoreEngineLocks).toBe(false);
    expect(store.overrides.ignoreVehicleLocks).toBe(false);
    expect(store.overrides.ignoreAeroLocks).toBe(false);
    expect(store.overrides.ignoreInteriorLocks).toBe(false);
    expect(store.overrides.ignoreResearchRequirements).toBe(false);
    expect(store.overrides.ignoreMotorsportRequirements).toBe(false);
    expect(store.overrides.ignoreFacilityLocks).toBe(false);
    expect(store.overrides.infiniteBudget).toBe(false);
    expect(store.overrides.instantBuild).toBe(false);
  });

  it("toggles master developer mode state correctly", () => {
    const store = useDeveloperModeStore.getState();
    expect(store.devMode).toBe(false);

    store.toggleDevMode();
    expect(useDeveloperModeStore.getState().devMode).toBe(true);

    store.toggleDevMode();
    expect(useDeveloperModeStore.getState().devMode).toBe(false);
  });

  it("allows setting granular individual subsystem overrides", () => {
    const store = useDeveloperModeStore.getState();
    store.setDevMode(true);

    store.setOverride("ignoreEngineLocks", true);
    expect(useDeveloperModeStore.getState().overrides.ignoreEngineLocks).toBe(true);
    expect(useDeveloperModeStore.getState().overrides.ignoreVehicleLocks).toBe(false);

    store.setOverride("ignoreVehicleLocks", true);
    store.setOverride("ignoreAeroLocks", true);
    store.setOverride("ignoreInteriorLocks", true);
    store.setOverride("ignoreWorkflowGating", true);

    const updated = useDeveloperModeStore.getState().overrides;
    expect(updated.ignoreEngineLocks).toBe(true);
    expect(updated.ignoreVehicleLocks).toBe(true);
    expect(updated.ignoreAeroLocks).toBe(true);
    expect(updated.ignoreInteriorLocks).toBe(true);
    expect(updated.ignoreWorkflowGating).toBe(true);
  });

  it("unlockAll engages all 10 subsystem overrides and enables devMode", () => {
    const store = useDeveloperModeStore.getState();
    store.unlockAll();

    const state = useDeveloperModeStore.getState();
    expect(state.devMode).toBe(true);
    expect(state.overrides.ignoreWorkflowGating).toBe(true);
    expect(state.overrides.ignoreEngineLocks).toBe(true);
    expect(state.overrides.ignoreVehicleLocks).toBe(true);
    expect(state.overrides.ignoreAeroLocks).toBe(true);
    expect(state.overrides.ignoreInteriorLocks).toBe(true);
    expect(state.overrides.ignoreResearchRequirements).toBe(true);
    expect(state.overrides.ignoreMotorsportRequirements).toBe(true);
    expect(state.overrides.ignoreFacilityLocks).toBe(true);
    expect(state.overrides.infiniteBudget).toBe(true);
    expect(state.overrides.instantBuild).toBe(true);
    expect(state.activeScenario).toBe("ALL_CONTENT_TEST");
  });

  it("applies pre-configured development scenarios correctly", () => {
    const store = useDeveloperModeStore.getState();

    store.applyScenario("1985_ERA_TEST");
    let state = useDeveloperModeStore.getState();
    expect(state.devMode).toBe(true);
    expect(state.overrides.ignoreEngineLocks).toBe(true);
    expect(state.overrides.ignoreAeroLocks).toBe(false);
    expect(state.activeScenario).toBe("1985_ERA_TEST");

    store.applyScenario("FACTORY_TEST");
    state = useDeveloperModeStore.getState();
    expect(state.overrides.ignoreFacilityLocks).toBe(true);
    expect(state.overrides.instantBuild).toBe(true);
    expect(state.activeScenario).toBe("FACTORY_TEST");
  });
});
