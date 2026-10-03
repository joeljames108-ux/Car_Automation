import { describe, it, expect, beforeEach } from "vitest";
import { useMotorsportStore } from "../motorsportStore";
import { clockListeners, fromJSDate } from "../gameClockEngine";

describe("MotorsportStore (Domain Extraction — Bug 6)", () => {
  beforeEach(() => {
    useMotorsportStore.getState().resetMotorsport();
  });

  it("initializes with default multi-category rival teams and season 1", () => {
    const state = useMotorsportStore.getState();
    expect(state.currentSeason).toBe(1);
    expect(state.teams.length).toBeGreaterThanOrEqual(48); // 8 teams * 6 categories
    expect(state.totalTechTransferred).toBe(0);
    expect(state.techTransferHistory).toEqual([]);
    expect(state.scoutedDrivers).toEqual([]);
  });

  it("creates a player motorsport team and auto-selects it", () => {
    const store = useMotorsportStore.getState();
    const initialCount = store.teams.length;

    const teamId = store.createTeam("Apex Hypercar Works", "hypercar", 50_000_000, null);
    expect(teamId).toBeTruthy();

    const updated = useMotorsportStore.getState();
    expect(updated.teams.length).toBe(initialCount + 1);

    const createdTeam = updated.teams.find((t) => t.id === teamId);
    expect(createdTeam).toBeDefined();
    expect(createdTeam?.name).toBe("Apex Hypercar Works");
    expect(createdTeam?.category).toBe("hypercar");
    expect(createdTeam?.budget).toBe(50_000_000);
    expect(updated.selectedTeamId).toBe(teamId);
  });

  it("assigns and releases drivers for a team", () => {
    const store = useMotorsportStore.getState();
    const teamId = store.createTeam("Apex F1", "formula", 80_000_000, null);

    // Assign driver from pool
    store.assignDriver(teamId, 0);
    let team = useMotorsportStore.getState().teams.find((t) => t.id === teamId)!;
    expect(team.drivers.length).toBe(1);
    const assignedDriverId = team.drivers[0].id;

    // Release driver
    store.releaseDriver(teamId, assignedDriverId);
    team = useMotorsportStore.getState().teams.find((t) => t.id === teamId)!;
    expect(team.drivers.length).toBe(0);
  });

  it("scouts young talent and signs them to a team", () => {
    const store = useMotorsportStore.getState();
    const teamId = store.createTeam("Apex GT", "gt", 25_000_000, null);

    store.scoutDriver();
    let state = useMotorsportStore.getState();
    expect(state.scoutedDrivers.length).toBe(1);
    const scouted = state.scoutedDrivers[0];

    store.signScoutedDriver(scouted.id, teamId);
    state = useMotorsportStore.getState();
    expect(state.scoutedDrivers.length).toBe(0);

    const team = state.teams.find((t) => t.id === teamId)!;
    expect(team.drivers.some((d) => d.name === scouted.name)).toBe(true);
  });

  it("upgrades team facilities when budget is sufficient", () => {
    const store = useMotorsportStore.getState();
    const teamId = store.createTeam("Apex Rally", "rally", 60_000_000, null);

    let team = useMotorsportStore.getState().teams.find((t) => t.id === teamId)!;
    expect(team.facilityLevel).toBe("basic");

    store.upgradeFacility(teamId);
    team = useMotorsportStore.getState().teams.find((t) => t.id === teamId)!;
    expect(team.facilityLevel).toBe("standard");
    expect(team.budget).toBeLessThan(60_000_000);
  });

  it("updates race strategy settings", () => {
    const store = useMotorsportStore.getState();
    const teamId = store.createTeam("Apex Endurance", "endurance", 30_000_000, null);

    store.updateStrategy(teamId, {
      deployMode: "qualifying",
      tireStrategy: ["soft", "medium"],
      pitStopCount: 2,
      driverRiskLevel: "push_limits",
    });

    const team = useMotorsportStore.getState().teams.find((t) => t.id === teamId)!;
    expect(team.strategy.deployMode).toBe("qualifying");
    expect(team.strategy.tireStrategy).toEqual(["soft", "medium"]);
    expect(team.strategy.pitStopCount).toBe(2);
    expect(team.strategy.driverRiskLevel).toBe("push_limits");
  });

  it("simulates a season and increments current season", () => {
    const store = useMotorsportStore.getState();
    const initialSeason = store.currentSeason;

    store.simulateSeason(650, 1100, 4.5, 0.95);

    const updated = useMotorsportStore.getState();
    expect(updated.currentSeason).toBe(initialSeason + 1);
  });

  it("transfers tech from race pool and logs history", () => {
    const store = useMotorsportStore.getState();
    const teamId = store.createTeam("Apex F1", "formula", 80_000_000, null);

    // Manually grant tech transfer pool points for testing
    useMotorsportStore.setState((s) => ({
      teams: s.teams.map((t) => (t.id === teamId ? { ...t, techTransferPool: 50 } : t)),
    }));

    store.transferTech(teamId, "race_to_production", 20, 15);

    const updated = useMotorsportStore.getState();
    expect(updated.totalTechTransferred).toBe(20);
    expect(updated.techTransferHistory.length).toBe(1);
    expect(updated.techTransferHistory[0].points).toBe(20);
    expect(updated.techTransferHistory[0].direction).toBe("race_to_production");
  });

  it("ages driver contracts on master clock monthly cadence", () => {
    const store = useMotorsportStore.getState();
    const teamId = store.createTeam("Apex Works", "gt", 20_000_000, null);
    store.assignDriver(teamId, 0);

    const teamBefore = useMotorsportStore.getState().teams.find((t) => t.id === teamId)!;
    const initialContractMonths = teamBefore.drivers[0].contractMonths;
    expect(initialContractMonths).toBeGreaterThan(0);

    // Fire master clock monthly tick
    clockListeners.notify("month", {
      previous: fromJSDate(new Date(Date.UTC(1970, 0, 1))),
      current: fromJSDate(new Date(Date.UTC(1970, 1, 1))),
      elapsedDays: 31,
      todayEvents: [],
    });

    const teamAfter = useMotorsportStore.getState().teams.find((t) => t.id === teamId)!;
    expect(teamAfter.drivers[0].contractMonths).toBe(initialContractMonths - 1);
  });
});
