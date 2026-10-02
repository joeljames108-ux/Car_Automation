/**
 * APEX AUTOMOTIVE — SAVE MANAGER & NAMESPACE ISOLATION SYSTEM
 * 
 * Enforces strict isolation between Player Career progression saves and
 * Developer Sandbox / Debug test saves to prevent state corruption.
 * 
 * Namespace Schema (localStorage):
 *  - Player:    `apex_save_player_<slotId>`
 *  - Developer: `apex_save_dev_<slotId>`
 *  - AutoSave:  `apex_save_dev_autosave`
 */

import { useDeveloperModeStore, type DevOverrides } from "./developerModeStore";
import { useSimulationClockStore } from "./simulationClockStore";
import { useRDTreeStore } from "./rdTreeStore";

export type SaveNamespace = "player" | "developer";

export interface SaveGameMetadata {
  slotId: string;
  namespace: SaveNamespace;
  name: string;
  description?: string;
  timestamp: number;
  gameDate: string;
  gameYear: number;
  cash: number;
  reputation: number;
  materialsTonnes: number;
  __devMetadata?: {
    activeScenario: string | null;
    overrides: DevOverrides;
    timestamp: number;
  };
}

export interface ApexSaveGame {
  version: number;
  metadata: SaveGameMetadata;
  state: {
    clock: {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      cash: number;
      materialsTonnes: number;
      reputation: number;
      speed?: number;
    };
    developerMode?: {
      devMode: boolean;
      overrides: DevOverrides;
      activeScenario: string | null;
    };
    rdTree?: {
      unlockedTechs: string[];
      branchHours: Record<string, number>;
    };
  };
}

const PLAYER_PREFIX = "apex_save_player_";
const DEV_PREFIX = "apex_save_dev_";
const CURRENT_SAVE_VERSION = 1;

/**
 * Get the localStorage key corresponding to namespace and slotId
 */
export function getStorageKey(namespace: SaveNamespace, slotId: string): string {
  const prefix = namespace === "developer" ? DEV_PREFIX : PLAYER_PREFIX;
  return `${prefix}${slotId}`;
}

/**
 * Save current game state into the appropriate isolated namespace.
 * Developer mode saves automatically write to `developer` namespace.
 */
export function saveGame(
  slotId: string,
  name: string,
  description: string = ""
): { success: boolean; metadata?: SaveGameMetadata; error?: string } {
  try {
    const isDev = useDeveloperModeStore.getState().devMode;
    const namespace: SaveNamespace = isDev ? "developer" : "player";

    const clock = useSimulationClockStore.getState();
    const devStore = useDeveloperModeStore.getState();
    const rdStore = useRDTreeStore.getState();

    const gameDate = `${clock.year}-${String(clock.month).padStart(2, "0")}-${String(clock.day).padStart(2, "0")}`;

    const metadata: SaveGameMetadata = {
      slotId,
      namespace,
      name,
      description,
      timestamp: Date.now(),
      gameDate,
      gameYear: clock.year,
      cash: clock.cash,
      reputation: clock.reputation,
      materialsTonnes: clock.materialsTonnes,
      ...(isDev && {
        __devMetadata: {
          activeScenario: devStore.activeScenario,
          overrides: { ...devStore.overrides },
          timestamp: Date.now(),
        },
      }),
    };

    const saveData: ApexSaveGame = {
      version: CURRENT_SAVE_VERSION,
      metadata,
      state: {
        clock: {
          year: clock.year,
          month: clock.month,
          day: clock.day,
          hour: clock.hour,
          minute: clock.minute,
          cash: clock.cash,
          materialsTonnes: clock.materialsTonnes,
          reputation: clock.reputation,
          speed: clock.speed,
        },
        developerMode: {
          devMode: devStore.devMode,
          overrides: { ...devStore.overrides },
          activeScenario: devStore.activeScenario,
        },
        rdTree: {
          unlockedTechs: [...rdStore.unlockedTechs],
          branchHours: { ...rdStore.branchHours },
        },
      },
    };

    const key = getStorageKey(namespace, slotId);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(saveData));
    }

    return { success: true, metadata };
  } catch (err: any) {
    console.error("[SaveManager] Save failed:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * List all saved games, optionally filtered by namespace.
 */
export function listSaves(namespaceFilter?: SaveNamespace | "all"): SaveGameMetadata[] {
  if (typeof window === "undefined" || !window.localStorage) return [];

  const results: SaveGameMetadata[] = [];
  const targetFilter = namespaceFilter || "all";

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    let ns: SaveNamespace | null = null;
    if (key.startsWith(PLAYER_PREFIX)) ns = "player";
    else if (key.startsWith(DEV_PREFIX)) ns = "developer";

    if (!ns) continue;
    if (targetFilter !== "all" && ns !== targetFilter) continue;

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed: ApexSaveGame = JSON.parse(raw);
      if (parsed?.metadata) {
        results.push(parsed.metadata);
      }
    } catch {
      // Skip invalid entries
    }
  }

  // Sort descending by timestamp (newest first)
  return results.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Load and rehydrate game state from a specific slot.
 */
export function loadGame(
  slotId: string,
  namespace: SaveNamespace
): { success: boolean; metadata?: SaveGameMetadata; isCrossNamespace?: boolean; error?: string } {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return { success: false, error: "Storage unavailable" };
    }

    const key = getStorageKey(namespace, slotId);
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return { success: false, error: `Save slot "${slotId}" not found in ${namespace} namespace.` };
    }

    const parsed: ApexSaveGame = JSON.parse(raw);
    if (!parsed?.state) {
      return { success: false, error: "Corrupted save data format." };
    }

    const currentDevMode = useDeveloperModeStore.getState().devMode;
    const isCrossNamespace = (namespace === "developer" && !currentDevMode) || (namespace === "player" && currentDevMode);

    // 1. Restore Simulation Clock
    if (parsed.state.clock) {
      const c = parsed.state.clock;
      useSimulationClockStore.getState().setDate(c.year, c.month, c.day);
      useSimulationClockStore.setState({
        hour: c.hour,
        minute: c.minute,
        cash: c.cash,
        materialsTonnes: c.materialsTonnes,
        reputation: c.reputation,
        ...(c.speed ? { speed: c.speed as any } : {}),
      });
    }

    // 2. Restore Developer Mode (if present)
    if (parsed.state.developerMode) {
      const d = parsed.state.developerMode;
      useDeveloperModeStore.setState({
        devMode: d.devMode,
        overrides: d.overrides,
        activeScenario: (d.activeScenario as any) || null,
      });
    } else if (namespace === "player") {
      // If loading player save, ensure developer mode is reset to player progression
      useDeveloperModeStore.getState().resetToPlayerMode();
    }

    // 3. Restore R&D Tree
    if (parsed.state.rdTree) {
      useRDTreeStore.setState({
        unlockedTechs: parsed.state.rdTree.unlockedTechs || [],
        branchHours: parsed.state.rdTree.branchHours || {},
      });
    }

    return { success: true, metadata: parsed.metadata, isCrossNamespace };
  } catch (err: any) {
    console.error("[SaveManager] Load failed:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Delete a save slot
 */
export function deleteSave(slotId: string, namespace: SaveNamespace): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const key = getStorageKey(namespace, slotId);
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Automated 5-minute background save for Developer Sandbox
 */
export function triggerDevAutoSave(): { success: boolean; timestamp: number } {
  const isDev = useDeveloperModeStore.getState().devMode;
  if (!isDev) return { success: false, timestamp: 0 };

  const clock = useSimulationClockStore.getState();
  const res = saveGame("autosave", "Auto-Save Sandbox", `Auto-saved at Year ${clock.year}`);
  return { success: res.success, timestamp: Date.now() };
}

/**
 * Export a save as downloadable JSON string
 */
export function exportSaveToJSON(slotId: string, namespace: SaveNamespace): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  const key = getStorageKey(namespace, slotId);
  return window.localStorage.getItem(key);
}

/**
 * Import a save from raw JSON string
 */
export function importSaveFromJSON(jsonStr: string): { success: boolean; metadata?: SaveGameMetadata; error?: string } {
  try {
    const parsed: ApexSaveGame = JSON.parse(jsonStr);
    if (!parsed?.metadata?.slotId || !parsed?.state) {
      return { success: false, error: "Invalid Apex Save JSON format." };
    }
    const ns = parsed.metadata.namespace || (parsed.state.developerMode?.devMode ? "developer" : "player");
    const key = getStorageKey(ns, parsed.metadata.slotId);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(parsed));
    }
    return { success: true, metadata: parsed.metadata };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}
