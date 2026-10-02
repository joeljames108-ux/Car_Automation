import { describe, it, expect, beforeEach } from "vitest";

const storage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, val: string) => { storage[key] = String(val); },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};
(globalThis as any).localStorage = mockLocalStorage;

import { useLiveStatsRailStore } from "../../state/liveStatsRailStore";

describe("Live Stats Rail Collapsible to Right Side Store", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    useLiveStatsRailStore.getState().setIsCollapsedToRight(false);
  });

  it("initializes with default uncollapsed state", () => {
    const state = useLiveStatsRailStore.getState();
    expect(state.isCollapsedToRight).toBe(false);
  });

  it("updates collapsed to right state and syncs to localStorage", () => {
    const store = useLiveStatsRailStore.getState();
    store.setIsCollapsedToRight(true);

    expect(useLiveStatsRailStore.getState().isCollapsedToRight).toBe(true);
    expect(localStorage.getItem("apex_live_stats_collapsed_right")).toBe("true");

    store.setIsCollapsedToRight(false);
    expect(useLiveStatsRailStore.getState().isCollapsedToRight).toBe(false);
    expect(localStorage.getItem("apex_live_stats_collapsed_right")).toBe("false");
  });

  it("toggles collapse to right state back and forth", () => {
    const store = useLiveStatsRailStore.getState();
    expect(store.isCollapsedToRight).toBe(false);

    store.toggleCollapseToRight();
    expect(useLiveStatsRailStore.getState().isCollapsedToRight).toBe(true);
    expect(localStorage.getItem("apex_live_stats_collapsed_right")).toBe("true");

    store.toggleCollapseToRight();
    expect(useLiveStatsRailStore.getState().isCollapsedToRight).toBe(false);
    expect(localStorage.getItem("apex_live_stats_collapsed_right")).toBe("false");
  });

  it("gates live stats rail when on powertrain select and enables it when architecture is chosen", async () => {
    const { useGuidedEngineeringStore } = await import("../../state/guidedEngineeringStore");

    // Initially in selecting state
    useGuidedEngineeringStore.getState().setPowertrainSelecting(true);
    expect(useGuidedEngineeringStore.getState().isPowertrainSelecting).toBe(true);

    // Gating check for stage === "engine"
    const stage = "engine";
    let isSelectingPowertrain = stage === "engine" && useGuidedEngineeringStore.getState().isPowertrainSelecting;
    expect(isSelectingPowertrain).toBe(true);

    // Selecting an engine architecture clears selecting state
    useGuidedEngineeringStore.getState().setPowertrainSelecting(false);

    // Should now ungate live stats
    expect(useGuidedEngineeringStore.getState().isPowertrainSelecting).toBe(false);
    isSelectingPowertrain = stage === "engine" && useGuidedEngineeringStore.getState().isPowertrainSelecting;
    expect(isSelectingPowertrain).toBe(false);
  });
});

