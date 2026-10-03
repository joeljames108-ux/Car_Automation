/**
 * APEX AUTOMOTIVE — STATE SNAPSHOT & DIFF SYSTEM
 * 
 * Provides instantaneous high-fidelity snapshots of all game state stores,
 * stored in IndexedDB for zero quota limitations, with deep JSON diffing.
 */

import { useDeveloperModeStore } from "./developerModeStore";
import { useSimulationClockStore } from "./simulationClockStore";
import { useRDTreeStore } from "./rdTreeStore";
import { useCompanyFinanceStore } from "./companyFinanceStore";
import { useTradeStore, selectTotalMaterialsTonnes } from "./tradeStore";
import { useReputationStore } from "./reputationStore";

export interface StateSnapshotMeta {
  id: string;
  name: string;
  description?: string;
  timestamp: number;
  year: number;
  cash: number;
  scenario: string | null;
  activeOverridesCount: number;
  approxSizeKb: number;
}

export interface StateSnapshot extends StateSnapshotMeta {
  stores: {
    clock: any;
    developerMode: any;
    rdTree: any;
  };
}

export interface DiffChange {
  path: string;
  oldValue: any;
  newValue: any;
  type: "added" | "removed" | "changed";
}

export interface StateDiffResult {
  snapshotA: { id: string; name: string; timestamp: number };
  snapshotB: { id: string; name: string; timestamp: number };
  changes: DiffChange[];
  summary: string;
}

const DB_NAME = "apex_dev_snapshots_db";
const DB_VERSION = 1;
const STORE_NAME = "snapshots";

// In-memory fallback if IndexedDB is unavailable
const memoryFallback = new Map<string, StateSnapshot>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not available"));
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e: any) => {
      const db: IDBDatabase = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Capture a complete snapshot of all active stores.
 */
export async function takeSnapshot(name: string, description: string = ""): Promise<StateSnapshot> {
  const clock = useSimulationClockStore.getState();
  const dev = useDeveloperModeStore.getState();
  const rd = useRDTreeStore.getState();
  const currentCash = useCompanyFinanceStore.getState().cash;
  const currentMaterials = selectTotalMaterialsTonnes(useTradeStore.getState());
  const currentReputation = useReputationStore.getState().overallReputation;

  const id = `snap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const overridesCount = Object.values(dev.overrides).filter(Boolean).length;

  const stores = {
    clock: {
      year: clock.year,
      month: clock.month,
      day: clock.day,
      hour: clock.hour,
      minute: clock.minute,
      speed: clock.speed,
    },
    finance: {
      cash: currentCash,
    },
    trade: {
      materialsTonnes: currentMaterials,
    },
    reputation: {
      overallReputation: currentReputation,
    },
    developerMode: {
      devMode: dev.devMode,
      overrides: { ...dev.overrides },
      activeScenario: dev.activeScenario,
    },
    rdTree: {
      unlockedTechs: [...rd.unlockedTechs],
      branchHours: { ...rd.branchHours },
      activeDivisionId: rd.activeDivisionId,
      activeDepartmentId: rd.activeDepartmentId,
    },
  };

  const jsonStr = JSON.stringify(stores);
  const approxSizeKb = Math.round((jsonStr.length * 2) / 1024);

  const snapshot: StateSnapshot = {
    id,
    name: name.trim() || `Snapshot ${new Date().toLocaleTimeString()}`,
    description,
    timestamp: Date.now(),
    year: clock.year,
    cash: currentCash,
    scenario: dev.activeScenario,
    activeOverridesCount: overridesCount,
    approxSizeKb,
    stores,
  };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(snapshot);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    // Fallback to memory
    memoryFallback.set(snapshot.id, snapshot);
  }

  return snapshot;
}

/**
 * List all available snapshots (sorted newest to oldest)
 */
export async function listSnapshots(): Promise<StateSnapshotMeta[]> {
  try {
    const db = await openDB();
    const all = await new Promise<StateSnapshot[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    const metas: StateSnapshotMeta[] = all.map(({ stores, ...meta }) => meta);
    return metas.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    const metas: StateSnapshotMeta[] = Array.from(memoryFallback.values()).map(({ stores, ...meta }) => meta);
    return metas.sort((a, b) => b.timestamp - a.timestamp);
  }
}

/**
 * Retrieve a full snapshot by id or name
 */
export async function getSnapshot(idOrName: string): Promise<StateSnapshot | null> {
  try {
    const db = await openDB();
    const all = await new Promise<StateSnapshot[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    const found = all.find((s) => s.id === idOrName || s.name.toLowerCase() === idOrName.toLowerCase());
    return found || null;
  } catch {
    const found = Array.from(memoryFallback.values()).find(
      (s) => s.id === idOrName || s.name.toLowerCase() === idOrName.toLowerCase()
    );
    return found || null;
  }
}

/**
 * Restore game state to a snapshot
 */
export async function restoreSnapshot(idOrName: string): Promise<{ success: boolean; snapshot?: StateSnapshot; error?: string }> {
  const snapshot = await getSnapshot(idOrName);
  if (!snapshot) {
    return { success: false, error: `Snapshot "${idOrName}" not found.` };
  }

  try {
    // Restore Clock
    if (snapshot.stores.clock) {
      const c = snapshot.stores.clock;
      useSimulationClockStore.getState().setDate(c.year, c.month, c.day);
      useSimulationClockStore.setState({
        hour: c.hour,
        minute: c.minute,
        ...(c.speed ? { speed: c.speed } : {}),
      });

      // Restore Finance (legacy clock fallback supported)
      const cashVal = (snapshot.stores as any).finance?.cash ?? c.cash;
      if (cashVal !== undefined) {
        useCompanyFinanceStore.setState({ cash: cashVal });
      }

      // Restore Trade Materials (legacy clock fallback supported)
      const matsVal = (snapshot.stores as any).trade?.materialsTonnes ?? c.materialsTonnes;
      if (matsVal !== undefined) {
        const curTonnes = selectTotalMaterialsTonnes(useTradeStore.getState());
        useTradeStore.getState().addRawMaterialsTonnes(matsVal - curTonnes);
      }

      // Restore Reputation (legacy clock fallback supported)
      const repVal = (snapshot.stores as any).reputation?.overallReputation ?? c.reputation;
      if (repVal !== undefined) {
        useReputationStore.setState({ overallReputation: repVal });
      }
    }

    // Restore Developer Mode
    if (snapshot.stores.developerMode) {
      const d = snapshot.stores.developerMode;
      useDeveloperModeStore.setState({
        devMode: d.devMode,
        overrides: d.overrides,
        activeScenario: d.activeScenario,
      });
    }

    // Restore R&D Tree
    if (snapshot.stores.rdTree) {
      const r = snapshot.stores.rdTree;
      useRDTreeStore.setState({
        unlockedTechs: r.unlockedTechs || [],
        branchHours: r.branchHours || {},
        ...(r.activeDivisionId ? { activeDivisionId: r.activeDivisionId } : {}),
        ...(r.activeDepartmentId ? { activeDepartmentId: r.activeDepartmentId } : {}),
      });
    }

    return { success: true, snapshot };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Delete a snapshot by id or name
 */
export async function deleteSnapshot(idOrName: string): Promise<boolean> {
  const snap = await getSnapshot(idOrName);
  if (!snap) return false;

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(snap.id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch {
    return memoryFallback.delete(snap.id);
  }
}

/**
 * Deep JSON diff between two objects
 */
function findDiffs(objA: any, objB: any, prefix: string = ""): DiffChange[] {
  const changes: DiffChange[] = [];

  if (objA === objB) return changes;

  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    changes.push({
      path: prefix,
      oldValue: objA,
      newValue: objB,
      type: "changed",
    });
    return changes;
  }

  const allKeys = Array.from(new Set([...Object.keys(objA), ...Object.keys(objB)]));

  for (const k of allKeys) {
    const currentPath = prefix ? `${prefix}.${k}` : k;
    if (!(k in objA)) {
      changes.push({
        path: currentPath,
        oldValue: undefined,
        newValue: objB[k],
        type: "added",
      });
    } else if (!(k in objB)) {
      changes.push({
        path: currentPath,
        oldValue: objA[k],
        newValue: undefined,
        type: "removed",
      });
    } else if (typeof objA[k] === "object" && objA[k] !== null && typeof objB[k] === "object" && objB[k] !== null) {
      changes.push(...findDiffs(objA[k], objB[k], currentPath));
    } else if (objA[k] !== objB[k]) {
      changes.push({
        path: currentPath,
        oldValue: objA[k],
        newValue: objB[k],
        type: "changed",
      });
    }
  }

  return changes;
}

/**
 * Compare two snapshots and generate structured differences
 */
export async function diffSnapshots(
  idOrNameA: string,
  idOrNameB: string
): Promise<{ success: boolean; diff?: StateDiffResult; error?: string }> {
  const snapA = await getSnapshot(idOrNameA);
  const snapB = await getSnapshot(idOrNameB);

  if (!snapA) return { success: false, error: `Snapshot A "${idOrNameA}" not found.` };
  if (!snapB) return { success: false, error: `Snapshot B "${idOrNameB}" not found.` };

  const changes = findDiffs(snapA.stores, snapB.stores);

  return {
    success: true,
    diff: {
      snapshotA: { id: snapA.id, name: snapA.name, timestamp: snapA.timestamp },
      snapshotB: { id: snapB.id, name: snapB.name, timestamp: snapB.timestamp },
      changes,
      summary: `${changes.length} properties modified between "${snapA.name}" and "${snapB.name}"`,
    },
  };
}

/**
 * Export complete game state across all stores as formatted JSON string
 */
export function dumpFullStateJSON(): string {
  const clock = useSimulationClockStore.getState();
  const dev = useDeveloperModeStore.getState();
  const rd = useRDTreeStore.getState();
  const cash = useCompanyFinanceStore.getState().cash;
  const materialsTonnes = selectTotalMaterialsTonnes(useTradeStore.getState());
  const reputation = useReputationStore.getState().overallReputation;

  const fullDump = {
    exportedAt: new Date().toISOString(),
    simulationClock: {
      dateTime: clock.getGameDateTime ? clock.getGameDateTime() : { year: clock.year, month: clock.month, day: clock.day },
      speed: clock.speed,
      isPlaying: clock.isPlaying,
    },
    finance: {
      cash,
    },
    trade: {
      materialsTonnes,
    },
    reputation: {
      overallReputation: reputation,
    },
    developerMode: {
      devMode: dev.devMode,
      overrides: dev.overrides,
      activeScenario: dev.activeScenario,
    },
    rdTree: {
      unlockedTechsCount: rd.unlockedTechs.length,
      unlockedTechs: rd.unlockedTechs,
      branchHours: rd.branchHours,
    },
  };

  return JSON.stringify(fullDump, null, 2);
}
