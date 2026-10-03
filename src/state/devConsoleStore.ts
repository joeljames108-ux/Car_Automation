import { create } from "zustand";
import { useDeveloperModeStore, TEST_SCENARIOS, type TestScenarioId } from "./developerModeStore";
import { useSimulationClockStore } from "./simulationClockStore";
import { useCompanyFinanceStore } from "./companyFinanceStore";
import { useTradeStore, selectTotalMaterialsTonnes } from "./tradeStore";
import { formatGameDate } from "./gameClockEngine";
import { saveGame, listSaves, loadGame, type SaveNamespace } from "./saveManager";
import {
  takeSnapshot,
  listSnapshots,
  restoreSnapshot,
  diffSnapshots,
  dumpFullStateJSON,
} from "./stateSnapshotManager";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export type ConsoleEntryType = "input" | "success" | "error" | "info" | "warn" | "system";

export interface ConsoleEntry {
  id: string;
  type: ConsoleEntryType;
  message: string;
  timestamp: number;
}

export interface ConsoleOutput {
  type: ConsoleEntryType;
  message: string;
}

export interface CommandHandler {
  name: string;
  description: string;
  usage: string;
  execute: (args: string[]) => ConsoleOutput | ConsoleOutput[] | Promise<ConsoleOutput | ConsoleOutput[]>;
}

// ─────────────────────────────────────────────────────────────
//  Command Registry
// ─────────────────────────────────────────────────────────────

const COMMAND_REGISTRY = new Map<string, CommandHandler>();

export function registerCommand(handler: CommandHandler) {
  COMMAND_REGISTRY.set(handler.name, handler);
}

export function getCommandRegistry(): Map<string, CommandHandler> {
  return COMMAND_REGISTRY;
}

// ─────────────────────────────────────────────────────────────
//  Built-in Commands
// ─────────────────────────────────────────────────────────────

function registerBuiltinCommands() {
  // ── help ──
  registerCommand({
    name: "help",
    description: "List all available commands",
    usage: "help [command]",
    execute: (args) => {
      if (args[0]) {
        const cmd = COMMAND_REGISTRY.get(args[0]);
        if (!cmd) return { type: "error", message: `Unknown command: ${args[0]}` };
        return [
          { type: "info", message: `📖  ${cmd.name}` },
          { type: "info", message: `    ${cmd.description}` },
          { type: "info", message: `    Usage: ${cmd.usage}` },
        ];
      }
      const grouped: ConsoleOutput[] = [
        { type: "system", message: "═══════════════════════════════════════════" },
        { type: "system", message: "  APEX DEVELOPER CONSOLE — COMMAND INDEX" },
        { type: "system", message: "═══════════════════════════════════════════" },
      ];
      const sorted = Array.from(COMMAND_REGISTRY.values()).sort((a, b) => a.name.localeCompare(b.name));
      for (const cmd of sorted) {
        grouped.push({ type: "info", message: `  ${cmd.name.padEnd(28)} ${cmd.description}` });
      }
      grouped.push({ type: "system", message: `\n  ${sorted.length} commands registered. Type "help <command>" for details.` });
      return grouped;
    },
  });

  // ── clear ──
  registerCommand({
    name: "clear",
    description: "Clear console output",
    usage: "clear",
    execute: () => {
      // Special-cased in executeCommand
      return { type: "success", message: "Console cleared." };
    },
  });

  // ── time.set ──
  registerCommand({
    name: "time.set",
    description: "Jump to a specific date instantly",
    usage: "time.set <year> [month=1] [day=1]",
    execute: (args) => {
      const year = parseInt(args[0]);
      if (isNaN(year) || year < 1900 || year > 2100) {
        return { type: "error", message: "Invalid year. Usage: time.set <year> [month] [day]" };
      }
      const month = Math.max(1, Math.min(12, parseInt(args[1]) || 1));
      const day = Math.max(1, Math.min(31, parseInt(args[2]) || 1));
      useSimulationClockStore.getState().setDate(year, month, day);
      return { type: "success", message: `⏰ Calendar teleported to ${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` };
    },
  });

  // ── time.advance ──
  registerCommand({
    name: "time.advance",
    description: "Advance simulation by N days (runs ticks)",
    usage: "time.advance <days>",
    execute: (args) => {
      const days = parseInt(args[0]);
      if (isNaN(days) || days <= 0) {
        return { type: "error", message: "Invalid day count. Usage: time.advance <days>" };
      }
      useSimulationClockStore.getState().advanceDays(days);
      const clock = useSimulationClockStore.getState();
      return { type: "success", message: `⏩ Advanced ${days} days → Now: ${formatGameDate(clock.getGameDateTime())}` };
    },
  });

  // ── time.now ──
  registerCommand({
    name: "time.now",
    description: "Show current in-game date and time",
    usage: "time.now",
    execute: () => {
      const clock = useSimulationClockStore.getState();
      const cash = useCompanyFinanceStore.getState().cash;
      const materialsTonnes = selectTotalMaterialsTonnes(useTradeStore.getState());
      return [
        { type: "info", message: `📅 Date: ${formatGameDate(clock.getGameDateTime())}` },
        { type: "info", message: `💰 Cash: $${cash.toLocaleString()}` },
        { type: "info", message: `🏗️ Materials: ${materialsTonnes.toLocaleString()} tonnes` },
      ];
    },
  });

  // ── cash.add ──
  registerCommand({
    name: "cash.add",
    description: "Inject cash into the treasury",
    usage: "cash.add <amount>",
    execute: (args) => {
      const amount = parseInt(args[0]?.replace(/[,$]/g, ""));
      if (isNaN(amount) || amount <= 0) {
        return { type: "error", message: "Invalid amount. Usage: cash.add <amount>" };
      }
      const clock = useSimulationClockStore.getState();
      useCompanyFinanceStore.getState().injectCapital(amount, "DevConsole Cash Injection", clock.month, clock.year);
      return { type: "success", message: `💵 Injected $${amount.toLocaleString()} → Balance: $${useCompanyFinanceStore.getState().cash.toLocaleString()}` };
    },
  });

  // ── cash.set ──
  registerCommand({
    name: "cash.set",
    description: "Set exact cash balance",
    usage: "cash.set <amount>",
    execute: (args) => {
      const amount = parseInt(args[0]?.replace(/[,$]/g, ""));
      if (isNaN(amount)) {
        return { type: "error", message: "Invalid amount. Usage: cash.set <amount>" };
      }
      const clock = useSimulationClockStore.getState();
      const currentCash = useCompanyFinanceStore.getState().cash;
      useCompanyFinanceStore.getState().injectCapital(amount - currentCash, "DevConsole Cash Adjustment", clock.month, clock.year);
      return { type: "success", message: `💰 Cash set to $${amount.toLocaleString()}` };
    },
  });

  // ── materials.add ──
  registerCommand({
    name: "materials.add",
    description: "Add raw materials (tonnes)",
    usage: "materials.add <tonnes>",
    execute: (args) => {
      const tonnes = parseInt(args[0]?.replace(/,/g, ""));
      if (isNaN(tonnes) || tonnes <= 0) {
        return { type: "error", message: "Invalid amount. Usage: materials.add <tonnes>" };
      }
      useTradeStore.getState().addRawMaterialsTonnes(tonnes);
      const total = selectTotalMaterialsTonnes(useTradeStore.getState());
      return { type: "success", message: `🏗️ Added ${tonnes.toLocaleString()}t → Total: ${total.toLocaleString()}t` };
    },
  });

  // ── unlock.all ──
  registerCommand({
    name: "unlock.all",
    description: "Unlock all content (full sandbox mode)",
    usage: "unlock.all",
    execute: () => {
      useDeveloperModeStore.getState().unlockAll();
      return { type: "success", message: "🔓 ALL content unlocked! Workflow gating, engines, vehicles, aero, interiors, R&D, motorsport, facilities — everything bypassed." };
    },
  });

  // ── lock.all ──
  registerCommand({
    name: "lock.all",
    description: "Restore authentic player progression mode",
    usage: "lock.all",
    execute: () => {
      useDeveloperModeStore.getState().resetToPlayerMode();
      return { type: "success", message: "🔒 Player progression restored. All dev overrides disabled." };
    },
  });

  // ── unlock.engines ──
  registerCommand({
    name: "unlock.engines",
    description: "Unlock all engine architectures",
    usage: "unlock.engines",
    execute: () => {
      useDeveloperModeStore.getState().setOverride("ignoreEngineLocks", true);
      return { type: "success", message: "🔓 All engine architectures unlocked (V12, W16, Rotary, Twin-Turbo, Hybrid, EV)" };
    },
  });

  // ── unlock.vehicles ──
  registerCommand({
    name: "unlock.vehicles",
    description: "Unlock all vehicle platforms and body types",
    usage: "unlock.vehicles",
    execute: () => {
      useDeveloperModeStore.getState().setOverride("ignoreVehicleLocks", true);
      return { type: "success", message: "🔓 All vehicle platforms unlocked (carbon monocoque, hypercars, mid-engine, SUVs)" };
    },
  });

  // ── unlock.aero ──
  registerCommand({
    name: "unlock.aero",
    description: "Unlock all aerodynamic elements",
    usage: "unlock.aero",
    execute: () => {
      useDeveloperModeStore.getState().setOverride("ignoreAeroLocks", true);
      return { type: "success", message: "🔓 All aero elements unlocked (active DRS, Venturi tunnels, multi-element wings)" };
    },
  });

  // ── unlock.interior ──
  registerCommand({
    name: "unlock.interior",
    description: "Unlock all cabin trims and displays",
    usage: "unlock.interior",
    execute: () => {
      useDeveloperModeStore.getState().setOverride("ignoreInteriorLocks", true);
      return { type: "success", message: "🔓 All interior trims unlocked (OLED, AR HUDs, racing carbon, bespoke leather)" };
    },
  });

  // ── unlock.rd ──
  registerCommand({
    name: "unlock.rd",
    description: "Bypass all R&D requirements",
    usage: "unlock.rd",
    execute: () => {
      useDeveloperModeStore.getState().setOverride("ignoreResearchRequirements", true);
      return { type: "success", message: "🔓 All R&D requirements bypassed" };
    },
  });

  // ── unlock.motorsport ──
  registerCommand({
    name: "unlock.motorsport",
    description: "Unlock all motorsport series and circuits",
    usage: "unlock.motorsport",
    execute: () => {
      useDeveloperModeStore.getState().setOverride("ignoreMotorsportRequirements", true);
      return { type: "success", message: "🔓 All motorsport series and circuits unlocked" };
    },
  });

  // ── unlock.facilities ──
  registerCommand({
    name: "unlock.facilities",
    description: "Unlock all factory lines and tooling tiers",
    usage: "unlock.facilities",
    execute: () => {
      useDeveloperModeStore.getState().setOverride("ignoreFacilityLocks", true);
      return { type: "success", message: "🔓 All facility tiers and tooling unlocked" };
    },
  });

  // ── budget.infinite ──
  registerCommand({
    name: "budget.infinite",
    description: "Toggle infinite capital and materials",
    usage: "budget.infinite",
    execute: () => {
      const current = useDeveloperModeStore.getState().overrides.infiniteBudget;
      useDeveloperModeStore.getState().setOverride("infiniteBudget", !current);
      return { type: "success", message: current ? "💰 Infinite budget DISABLED" : "💰 Infinite budget ENABLED" };
    },
  });

  // ── build.instant ──
  registerCommand({
    name: "build.instant",
    description: "Toggle instant build (zero delay)",
    usage: "build.instant",
    execute: () => {
      const current = useDeveloperModeStore.getState().overrides.instantBuild;
      useDeveloperModeStore.getState().setOverride("instantBuild", !current);
      return { type: "success", message: current ? "⚡ Instant build DISABLED" : "⚡ Instant build ENABLED" };
    },
  });

  // ── scenario.list ──
  registerCommand({
    name: "scenario.list",
    description: "Show available test scenarios",
    usage: "scenario.list",
    execute: () => {
      const entries: ConsoleOutput[] = [
        { type: "system", message: "─── AVAILABLE SCENARIOS ───" },
      ];
      for (const [key, sc] of Object.entries(TEST_SCENARIOS)) {
        entries.push({
          type: "info",
          message: `  ${key.padEnd(24)} Year ${sc.year} • $${((sc.cash || 0) / 1_000_000).toFixed(0)}M • ${sc.badge}`,
        });
      }
      return entries;
    },
  });

  // ── scenario.load ──
  registerCommand({
    name: "scenario.load",
    description: "Load a pre-configured test scenario",
    usage: "scenario.load <SCENARIO_ID>",
    execute: (args) => {
      const id = args[0]?.toUpperCase() as TestScenarioId;
      const scenario = TEST_SCENARIOS[id];
      if (!scenario) {
        const validIds = Object.keys(TEST_SCENARIOS).join(", ");
        return { type: "error", message: `Unknown scenario: "${args[0]}". Valid: ${validIds}` };
      }
      useDeveloperModeStore.getState().applyScenario(id);
      useSimulationClockStore.getState().setDate(scenario.year, 1, 1);
      if (scenario.cash) {
        useCompanyFinanceStore.getState().injectCapital(scenario.cash, "Scenario Setup", 1, scenario.year);
        useTradeStore.getState().addRawMaterialsTonnes(scenario.materialsTonnes || 1000);
      }
      return { type: "success", message: `🎬 Loaded scenario: ${scenario.name} (Year ${scenario.year}, $${((scenario.cash || 0) / 1_000_000).toFixed(0)}M)` };
    },
  });

  // ── stage.go ──
  registerCommand({
    name: "stage.go",
    description: "Navigate to a specific stage/studio",
    usage: "stage.go <stage_id>",
    execute: (args) => {
      const stageId = args[0];
      if (!stageId) {
        return { type: "error", message: "Usage: stage.go <stage_id>  (e.g. engine, vehicle, aero_studio, interior, final_build, main_menu)" };
      }
      // Navigation is handled via the __selectStage global bridge
      if (typeof window !== "undefined" && (window as any).__selectStage) {
        (window as any).__selectStage(stageId);
        return { type: "success", message: `🚀 Navigating to: ${stageId}` };
      }
      return { type: "error", message: "Navigation bridge not available." };
    },
  });

  // ── devmode.status ──
  registerCommand({
    name: "devmode.status",
    description: "Show current developer mode state",
    usage: "devmode.status",
    execute: () => {
      const dev = useDeveloperModeStore.getState();
      const clock = useSimulationClockStore.getState();
      const cash = useCompanyFinanceStore.getState().cash;
      const materials = selectTotalMaterialsTonnes(useTradeStore.getState());
      const activeCount = Object.values(dev.overrides).filter(Boolean).length;
      const totalCount = Object.keys(dev.overrides).length;
      return [
        { type: "system", message: "─── DEVELOPER MODE STATUS ───" },
        { type: "info", message: `  Mode:      ${dev.devMode ? "✅ ACTIVE" : "❌ OFF"}` },
        { type: "info", message: `  Overrides: ${activeCount}/${totalCount} active` },
        { type: "info", message: `  Scenario:  ${dev.activeScenario || "Custom"}` },
        { type: "info", message: `  Year:      ${clock.year}` },
        { type: "info", message: `  Cash:      $${cash.toLocaleString()}` },
        { type: "info", message: `  Materials: ${materials.toLocaleString()}t` },
      ];
    },
  });

  // ── state.dump ──
  registerCommand({
    name: "state.dump",
    description: "Export developer mode state as JSON to clipboard",
    usage: "state.dump",
    execute: () => {
      const dev = useDeveloperModeStore.getState();
      const clock = useSimulationClockStore.getState();
      const dump = {
        devMode: dev.devMode,
        overrides: dev.overrides,
        activeScenario: dev.activeScenario,
        year: clock.year,
        month: clock.month,
        day: clock.day,
        cash: useCompanyFinanceStore.getState().cash,
        materialsTonnes: selectTotalMaterialsTonnes(useTradeStore.getState()),
      };
      const json = dumpFullStateJSON();
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(json).catch(() => {});
      }
      return [
        { type: "success", message: "📋 Complete game state exported (copied to clipboard):" },
        { type: "info", message: json.slice(0, 1500) + (json.length > 1500 ? "\n... (truncated in console, full JSON in clipboard)" : "") },
      ];
    },
  });

  // ── save.list ──
  registerCommand({
    name: "save.list",
    description: "List all save games across player and developer namespaces",
    usage: "save.list [player|developer|all]",
    execute: (args) => {
      const filter = (args[0] as any) || "all";
      const saves = listSaves(filter);
      if (saves.length === 0) {
        return { type: "info", message: `No save slots found (filter: ${filter}).` };
      }
      const out: ConsoleOutput[] = [
        { type: "system", message: `── SAVED GAMES (${saves.length}) ──` },
      ];
      for (const s of saves) {
        const isDev = s.namespace === "developer";
        const tag = isDev ? "⚡[DEV]" : "🎮[PLAYER]";
        const dateStr = new Date(s.timestamp).toLocaleDateString();
        out.push({
          type: isDev ? "warn" : "info",
          message: `${tag} ${s.slotId.padEnd(16)} "${s.name}" | Yr: ${s.gameYear} | $${(s.cash / 1e6).toFixed(1)}M | ${dateStr}`,
        });
      }
      return out;
    },
  });

  // ── save.new ──
  registerCommand({
    name: "save.new",
    description: "Create a save in the current active namespace",
    usage: "save.new <name> [slotId]",
    execute: (args) => {
      if (!args[0]) return { type: "error", message: "Usage: save.new <name> [slotId]" };
      const name = args[0];
      const slotId = args[1] || `slot_${Date.now().toString(36)}`;
      const res = saveGame(slotId, name);
      if (!res.success) return { type: "error", message: `Save failed: ${res.error}` };
      const ns = res.metadata?.namespace;
      return {
        type: "success",
        message: `💾 Game saved to ${ns === "developer" ? "⚡ Developer" : "🎮 Player"} namespace (Slot: ${slotId}, Name: "${name}")`,
      };
    },
  });

  // ── save.load ──
  registerCommand({
    name: "save.load",
    description: "Load a save game by slotId",
    usage: "save.load <slotId> [player|developer]",
    execute: (args) => {
      if (!args[0]) return { type: "error", message: "Usage: save.load <slotId> [namespace]" };
      const slotId = args[0];
      let ns = (args[1] as SaveNamespace) || (useDeveloperModeStore.getState().devMode ? "developer" : "player");
      const res = loadGame(slotId, ns);
      if (!res.success) {
        const altNs: SaveNamespace = ns === "developer" ? "player" : "developer";
        const altRes = loadGame(slotId, altNs);
        if (altRes.success) {
          return {
            type: "warn",
            message: `📂 Loaded slot "${slotId}" from alternate namespace "${altNs}". ${altRes.isCrossNamespace ? "Active devMode updated." : ""}`,
          };
        }
        return { type: "error", message: `Failed to load: ${res.error}` };
      }
      return {
        type: "success",
        message: `📂 Loaded "${res.metadata?.name || slotId}" (${ns} namespace). Year: ${res.metadata?.gameYear}`,
      };
    },
  });

  // ── state.snapshot ──
  registerCommand({
    name: "state.snapshot",
    description: "Take named IndexedDB snapshot of all stores",
    usage: "state.snapshot <name> [description]",
    execute: async (args) => {
      const name = args[0] || `Snapshot_${Date.now().toString(36)}`;
      const desc = args.slice(1).join(" ");
      const snap = await takeSnapshot(name, desc);
      return {
        type: "success",
        message: `📸 Snapshot "${snap.name}" saved! ID: ${snap.id} (${snap.approxSizeKb}KB, Year ${snap.year}, $${(snap.cash / 1e6).toFixed(1)}M, ${snap.activeOverridesCount} overrides)`,
      };
    },
  });

  // ── state.list ──
  registerCommand({
    name: "state.list",
    description: "List all state snapshots in IndexedDB",
    usage: "state.list",
    execute: async () => {
      const snaps = await listSnapshots();
      if (snaps.length === 0) return { type: "info", message: "No snapshots saved yet. Use: state.snapshot <name>" };
      const out: ConsoleOutput[] = [
        { type: "system", message: `── STATE SNAPSHOTS (${snaps.length}) ──` },
      ];
      for (const s of snaps) {
        const timeStr = new Date(s.timestamp).toLocaleTimeString();
        out.push({
          type: "info",
          message: `📸 [${s.id}] "${s.name}" | Yr: ${s.year} | $${(s.cash / 1e6).toFixed(1)}M | ${s.approxSizeKb}KB | ${timeStr}`,
        });
      }
      return out;
    },
  });

  // ── state.restore ──
  registerCommand({
    name: "state.restore",
    description: "Restore game state from a named snapshot",
    usage: "state.restore <nameOrId>",
    execute: async (args) => {
      if (!args[0]) return { type: "error", message: "Usage: state.restore <nameOrId>" };
      const res = await restoreSnapshot(args[0]);
      if (!res.success) return { type: "error", message: res.error || "Restore failed." };
      return {
        type: "success",
        message: `⏪ Restored state from snapshot "${res.snapshot?.name}". Year: ${res.snapshot?.year}, Scenario: ${res.snapshot?.scenario || "None"}`,
      };
    },
  });

  // ── state.diff ──
  registerCommand({
    name: "state.diff",
    description: "Compare two state snapshots and show differences",
    usage: "state.diff <snapshotA> <snapshotB>",
    execute: async (args) => {
      if (!args[0] || !args[1]) return { type: "error", message: "Usage: state.diff <snapshotA> <snapshotB>" };
      const res = await diffSnapshots(args[0], args[1]);
      if (!res.success || !res.diff) return { type: "error", message: res.error || "Diff failed." };
      const d = res.diff;
      const out: ConsoleOutput[] = [
        { type: "system", message: `── DIFF: "${d.snapshotA.name}" vs "${d.snapshotB.name}" ──` },
        { type: "warn", message: d.summary },
      ];
      const maxDisplay = 15;
      for (const c of d.changes.slice(0, maxDisplay)) {
        out.push({
          type: c.type === "added" ? "success" : c.type === "removed" ? "error" : "info",
          message: `  [${c.type.toUpperCase()}] ${c.path}: ${JSON.stringify(c.oldValue)} → ${JSON.stringify(c.newValue)}`,
        });
      }
      if (d.changes.length > maxDisplay) {
        out.push({ type: "system", message: `  ... and ${d.changes.length - maxDisplay} more changes.` });
      }
      return out;
    },
  });

  // ── perf.show / perf.hide ──
  registerCommand({
    name: "perf.show",
    description: "Toggle performance HUD visibility",
    usage: "perf.show",
    execute: () => {
      useDevConsoleStore.getState().setShowPerfHUD(true);
      return { type: "success", message: "📊 Performance HUD: ON" };
    },
  });

  registerCommand({
    name: "perf.hide",
    description: "Hide performance HUD",
    usage: "perf.hide",
    execute: () => {
      useDevConsoleStore.getState().setShowPerfHUD(false);
      return { type: "success", message: "📊 Performance HUD: OFF" };
    },
  });
}

// ─────────────────────────────────────────────────────────────
//  Store
// ─────────────────────────────────────────────────────────────

let _nextId = 1;
function entryId(): string {
  return `ce_${_nextId++}_${Date.now()}`;
}

export interface DevConsoleState {
  isOpen: boolean;
  output: ConsoleEntry[];
  history: string[];
  historyIndex: number;
  showPerfHUD: boolean;

  // Actions
  toggle: () => void;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  executeCommand: (raw: string) => void;
  pushOutput: (type: ConsoleEntryType, message: string) => void;
  clearOutput: () => void;
  navigateHistory: (direction: "up" | "down") => string;
  setShowPerfHUD: (show: boolean) => void;
}

const WELCOME_ENTRIES: ConsoleEntry[] = [
  { id: "welcome_1", type: "system", message: "═══════════════════════════════════════════════════", timestamp: Date.now() },
  { id: "welcome_2", type: "system", message: "   APEX AUTOMOTIVE — DEVELOPER CONSOLE v1.0", timestamp: Date.now() },
  { id: "welcome_3", type: "system", message: "   Type \"help\" for command index  |  F9 to toggle", timestamp: Date.now() },
  { id: "welcome_4", type: "system", message: "═══════════════════════════════════════════════════", timestamp: Date.now() },
];

export const useDevConsoleStore = create<DevConsoleState>((set, get) => {
  // Register all built-in commands on first import
  registerBuiltinCommands();

  return {
    isOpen: false,
    output: [...WELCOME_ENTRIES],
    history: [],
    historyIndex: -1,
    showPerfHUD: false,

    toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    setOpen: (open) => set({ isOpen: open }),

    executeCommand: (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const state = get();

      // Push input echo
      const inputEntry: ConsoleEntry = {
        id: entryId(),
        type: "input",
        message: `> ${trimmed}`,
        timestamp: Date.now(),
      };

      // Update history
      const newHistory = [trimmed, ...state.history.filter((h) => h !== trimmed)].slice(0, 100);

      // Parse command and args
      const parts = trimmed.split(/\s+/);
      const cmdName = parts[0].toLowerCase();
      const args = parts.slice(1);

      // Special: clear
      if (cmdName === "clear") {
        set({ output: [], history: newHistory, historyIndex: -1 });
        return;
      }

      const handler = COMMAND_REGISTRY.get(cmdName);

      if (!handler) {
        // Try fuzzy match
        const suggestions = Array.from(COMMAND_REGISTRY.keys())
          .filter((k) => k.startsWith(cmdName.split(".")[0]))
          .slice(0, 5);

        const errorEntry: ConsoleEntry = {
          id: entryId(),
          type: "error",
          message: `Unknown command: "${cmdName}"${suggestions.length ? `. Did you mean: ${suggestions.join(", ")}?` : ""}`,
          timestamp: Date.now(),
        };
        set({
          output: [...state.output, inputEntry, errorEntry],
          history: newHistory,
          historyIndex: -1,
        });
        return;
      }

      // Execute
      try {
        const rawResult = handler.execute(args);

        const processResult = (result: ConsoleOutput | ConsoleOutput[]) => {
          const results = Array.isArray(result) ? result : [result];
          const outputEntries: ConsoleEntry[] = results.map((r) => ({
            id: entryId(),
            type: r.type,
            message: r.message,
            timestamp: Date.now(),
          }));
          set((s) => ({
            output: [...s.output, ...outputEntries],
          }));
        };

        set({
          output: [...state.output, inputEntry],
          history: newHistory,
          historyIndex: -1,
        });

        if (rawResult instanceof Promise) {
          rawResult
            .then(processResult)
            .catch((err) => {
              set((s) => ({
                output: [
                  ...s.output,
                  {
                    id: entryId(),
                    type: "error",
                    message: `⚠ Execution error: ${err?.message || String(err)}`,
                    timestamp: Date.now(),
                  },
                ],
              }));
            });
        } else {
          processResult(rawResult);
        }
      } catch (err: any) {
        const errorEntry: ConsoleEntry = {
          id: entryId(),
          type: "error",
          message: `⚠ Execution error: ${err?.message || String(err)}`,
          timestamp: Date.now(),
        };
        set({
          output: [...state.output, inputEntry, errorEntry],
          history: newHistory,
          historyIndex: -1,
        });
      }
    },

    pushOutput: (type, message) => {
      set((s) => ({
        output: [...s.output, { id: entryId(), type, message, timestamp: Date.now() }],
      }));
    },

    clearOutput: () => set({ output: [] }),

    navigateHistory: (direction) => {
      const state = get();
      if (state.history.length === 0) return "";
      let newIndex = state.historyIndex;
      if (direction === "up") {
        newIndex = Math.min(state.historyIndex + 1, state.history.length - 1);
      } else {
        newIndex = Math.max(state.historyIndex - 1, -1);
      }
      set({ historyIndex: newIndex });
      return newIndex >= 0 ? state.history[newIndex] : "";
    },

    setShowPerfHUD: (show) => set({ showPerfHUD: show }),
  };
});
