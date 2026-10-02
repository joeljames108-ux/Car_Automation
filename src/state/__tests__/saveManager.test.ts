import { describe, it, expect, beforeEach } from "vitest";
import {
  saveGame,
  listSaves,
  loadGame,
  deleteSave,
  exportSaveToJSON,
  importSaveFromJSON,
  getStorageKey,
} from "../saveManager";
import {
  takeSnapshot,
  listSnapshots,
  restoreSnapshot,
  diffSnapshots,
  dumpFullStateJSON,
} from "../stateSnapshotManager";
import { useDeveloperModeStore } from "../developerModeStore";
import { useSimulationClockStore } from "../simulationClockStore";

const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => {
      store[key] = String(val);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
};

const mockStorage = createStorageMock();
if (typeof (globalThis as any).window === "undefined") {
  (globalThis as any).window = {};
}
(globalThis as any).window.localStorage = mockStorage;
(globalThis as any).localStorage = mockStorage;

describe("saveManager & namespace isolation", () => {
  beforeEach(() => {
    mockStorage.clear();
    useDeveloperModeStore.getState().resetToPlayerMode();
    useSimulationClockStore.getState().setDate(1975, 5, 20);
    useSimulationClockStore.setState({ cash: 10_000_000 });
  });

  it("saves to player namespace when devMode is false", () => {
    useDeveloperModeStore.setState({ devMode: false });
    const res = saveGame("career_slot_1", "My Career");
    expect(res.success).toBe(true);

    const key = getStorageKey("player", "career_slot_1");
    expect(localStorage.getItem(key)).not.toBeNull();

    const devKey = getStorageKey("developer", "career_slot_1");
    expect(localStorage.getItem(devKey)).toBeNull();

    const saves = listSaves("player");
    expect(saves.length).toBe(1);
    expect(saves[0].namespace).toBe("player");
    expect(saves[0].name).toBe("My Career");
    expect(saves[0].__devMetadata).toBeUndefined();
  });

  it("saves to developer namespace when devMode is true with __devMetadata", () => {
    useDeveloperModeStore.getState().unlockAll();
    const res = saveGame("test_slot_dev", "Sandbox Run");
    expect(res.success).toBe(true);

    const devKey = getStorageKey("developer", "test_slot_dev");
    expect(localStorage.getItem(devKey)).not.toBeNull();

    const devSaves = listSaves("developer");
    expect(devSaves.length).toBe(1);
    expect(devSaves[0].namespace).toBe("developer");
    expect(devSaves[0].__devMetadata).toBeDefined();
    expect(devSaves[0].__devMetadata?.overrides.infiniteBudget).toBe(true);
  });

  it("loads save game and rehydrates state", () => {
    useDeveloperModeStore.setState({ devMode: false });
    useSimulationClockStore.getState().setDate(1982, 3, 15);
    useSimulationClockStore.setState({ cash: 45_000_000 });

    saveGame("slot_1982", "Turbo Era Save");

    // Mutate state
    useSimulationClockStore.getState().setDate(2020, 1, 1);
    useSimulationClockStore.setState({ cash: 100 });

    // Load back
    const loadRes = loadGame("slot_1982", "player");
    expect(loadRes.success).toBe(true);
    expect(useSimulationClockStore.getState().year).toBe(1982);
    expect(useSimulationClockStore.getState().cash).toBe(45_000_000);
  });

  it("flags cross-namespace loading correctly", () => {
    useDeveloperModeStore.getState().unlockAll();
    saveGame("dev_cross_test", "Dev Save");

    // Turn devMode off (now in player mode)
    useDeveloperModeStore.getState().resetToPlayerMode();
    expect(useDeveloperModeStore.getState().devMode).toBe(false);

    // Attempt to load dev save while in player mode
    const loadRes = loadGame("dev_cross_test", "developer");
    expect(loadRes.success).toBe(true);
    expect(loadRes.isCrossNamespace).toBe(true);
  });

  it("exports and imports save JSON correctly", () => {
    useDeveloperModeStore.setState({ devMode: false });
    saveGame("export_test", "Exportable Save");

    const json = exportSaveToJSON("export_test", "player");
    expect(json).not.toBeNull();

    mockStorage.clear();
    expect(listSaves("all").length).toBe(0);

    const importRes = importSaveFromJSON(json!);
    expect(importRes.success).toBe(true);
    expect(importRes.metadata?.name).toBe("Exportable Save");
    expect(listSaves("all").length).toBe(1);
  });

  it("deletes a save slot cleanly", () => {
    saveGame("del_test", "To Delete");
    expect(listSaves("all").length).toBe(1);

    deleteSave("del_test", "player");
    expect(listSaves("all").length).toBe(0);
  });
});

describe("stateSnapshotManager & diffing", () => {
  beforeEach(() => {
    useDeveloperModeStore.getState().resetToPlayerMode();
    useSimulationClockStore.getState().setDate(1970, 1, 1);
    useSimulationClockStore.setState({ cash: 5_000_000 });
  });

  it("captures snapshots and lists them", async () => {
    const snap1 = await takeSnapshot("Baseline 1970", "Initial baseline");
    expect(snap1.name).toBe("Baseline 1970");
    expect(snap1.year).toBe(1970);
    expect(snap1.cash).toBe(5_000_000);

    const list = await listSnapshots();
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some((s) => s.id === snap1.id)).toBe(true);
  });

  it("computes diff between two snapshots", async () => {
    const snapA = await takeSnapshot("Snap A");

    // Modify state
    useSimulationClockStore.getState().setDate(1985, 6, 1);
    useSimulationClockStore.setState({ cash: 75_000_000 });
    useDeveloperModeStore.getState().unlockAll();

    const snapB = await takeSnapshot("Snap B");

    const diffRes = await diffSnapshots(snapA.id, snapB.id);
    expect(diffRes.success).toBe(true);
    expect(diffRes.diff).toBeDefined();
    expect(diffRes.diff?.changes.length).toBeGreaterThan(0);

    const cashDiff = diffRes.diff?.changes.find((c) => c.path === "clock.cash");
    expect(cashDiff).toBeDefined();
    expect(cashDiff?.oldValue).toBe(5_000_000);
    expect(cashDiff?.newValue).toBe(75_000_000);
  });

  it("restores state from snapshot", async () => {
    useSimulationClockStore.getState().setDate(1990, 8, 12);
    useSimulationClockStore.setState({ cash: 123_456_789 });
    const snap = await takeSnapshot("Target 1990");

    // Mutate
    useSimulationClockStore.getState().setDate(2025, 1, 1);
    useSimulationClockStore.setState({ cash: 0 });

    const res = await restoreSnapshot(snap.id);
    expect(res.success).toBe(true);
    expect(useSimulationClockStore.getState().year).toBe(1990);
    expect(useSimulationClockStore.getState().cash).toBe(123_456_789);
  });

  it("dumps formatted JSON representation of all stores", () => {
    const json = dumpFullStateJSON();
    expect(json).toContain("simulationClock");
    expect(json).toContain("developerMode");
    expect(json).toContain("rdTree");
    const parsed = JSON.parse(json);
    expect(parsed.simulationClock.cash).toBeDefined();
  });
});
