import { describe, it, expect, beforeEach } from "vitest";
import {
  useDevConsoleStore,
  registerCommand,
  getCommandRegistry,
} from "../devConsoleStore";
import { useDeveloperModeStore } from "../developerModeStore";
import { useSimulationClockStore } from "../simulationClockStore";

describe("devConsoleStore", () => {
  beforeEach(() => {
    useDevConsoleStore.setState({
      isOpen: false,
      output: [],
      history: [],
      historyIndex: -1,
      showPerfHUD: false,
    });
    useDeveloperModeStore.getState().resetToPlayerMode();
  });

  it("toggles, opens, and closes console state", () => {
    const store = useDevConsoleStore.getState();
    expect(store.isOpen).toBe(false);

    store.toggle();
    expect(useDevConsoleStore.getState().isOpen).toBe(true);

    store.close();
    expect(useDevConsoleStore.getState().isOpen).toBe(false);

    store.open();
    expect(useDevConsoleStore.getState().isOpen).toBe(true);
  });

  it("executes help command and registers entries", () => {
    const { executeCommand } = useDevConsoleStore.getState();
    executeCommand("help");

    const entries = useDevConsoleStore.getState().output;
    expect(entries.length).toBeGreaterThan(1);
    expect(entries[0].type).toBe("input");
    expect(entries[0].message).toBe("> help");
    expect(entries.some((e) => e.message.includes("APEX DEVELOPER CONSOLE"))).toBe(true);
  });

  it("executes cash and materials commands", () => {
    const { executeCommand } = useDevConsoleStore.getState();
    const initialCash = useSimulationClockStore.getState().cash;

    executeCommand("cash.add 1000000");
    expect(useSimulationClockStore.getState().cash).toBe(initialCash + 1000000);

    executeCommand("cash.set 5000000");
    expect(useSimulationClockStore.getState().cash).toBe(5000000);

    executeCommand("materials.add 250");
    expect(useSimulationClockStore.getState().materialsTonnes).toBeGreaterThanOrEqual(250);
  });

  it("executes unlock.all and lock.all commands updating developer mode overrides", () => {
    const { executeCommand } = useDevConsoleStore.getState();

    executeCommand("unlock.all");
    const devStore = useDeveloperModeStore.getState();
    expect(devStore.devMode).toBe(true);
    expect(devStore.overrides.ignoreWorkflowGating).toBe(true);
    expect(devStore.overrides.ignoreEngineLocks).toBe(true);
    expect(devStore.overrides.ignoreVehicleLocks).toBe(true);
    expect(devStore.overrides.infiniteBudget).toBe(true);

    executeCommand("lock.all");
    const resetStore = useDeveloperModeStore.getState();
    expect(resetStore.devMode).toBe(false);
    expect(resetStore.overrides.ignoreWorkflowGating).toBe(false);
    expect(resetStore.overrides.ignoreEngineLocks).toBe(false);
  });

  it("supports custom registered commands", () => {
    registerCommand({
      name: "test.custom",
      description: "Custom test command",
      usage: "test.custom <arg>",
      execute: (args) => ({
        type: "success",
        message: `Custom execution with: ${args.join(",")}`,
      }),
    });

    expect(getCommandRegistry().has("test.custom")).toBe(true);

    const { executeCommand } = useDevConsoleStore.getState();
    executeCommand("test.custom alpha beta");

    const entries = useDevConsoleStore.getState().output;
    const lastEntry = entries[entries.length - 1];
    expect(lastEntry.type).toBe("success");
    expect(lastEntry.message).toBe("Custom execution with: alpha,beta");
  });

  it("navigates command history correctly", () => {
    const { executeCommand, navigateHistory } = useDevConsoleStore.getState();

    executeCommand("command_one");
    executeCommand("command_two");

    expect(navigateHistory("up")).toBe("command_two");
    expect(navigateHistory("up")).toBe("command_one");
    expect(navigateHistory("down")).toBe("command_two");
  });
});
