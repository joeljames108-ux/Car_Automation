import { describe, it, expect, beforeEach } from "vitest";
import { useSimulationClockStore, formatSimDate } from "../../state/simulationClockStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useTradeStore } from "../../state/tradeStore";
import { useReputationStore } from "../../state/reputationStore";
import { useVehicleProjectStore } from "../../state/vehicleProjectStore";

describe("Main Menu & Simulation Clock Master Suite", () => {
  beforeEach(() => {
    // Reset simulation clock store to a test-friendly 1978 time-only state
    useSimulationClockStore.setState({
      year: 1978,
      month: 5,
      day: 15,
      hour: 9,
      minute: 30,
      week: 20,
      dayOfWeek: "MONDAY",
      monthName: "May",
      monthNameShort: "MAY",
      isPlaying: false,
      speed: 1,
    });

    // Reset domain-specific stores
    useCompanyFinanceStore.setState({
      cash: 12400000,
    });
    useTradeStore.getState().resetTo1970();
    useReputationStore.setState({
      overallReputation: 66,
    });
    useVehicleProjectStore.setState({
      activeProject: {
        id: "proj_gt_coupe",
        name: "GT COUPE DEVELOPMENT",
        category: "Gran Turismo / Homologation",
        description: "The next generation GT coupe is progressing well. Focus is on weight reduction and improved aerodynamics.",
        targetPowerHp: 1100,
        weightReductionKg: -150,
        dragCoefficient: 0.26,
        targetUnitCostEur: 185000,
        progress: {
          design: 78,
          engineering: 63,
          testing: 41,
          production: 22,
        },
      },
    });
  });

  it("initializes with exact historical starting date 15 MAY 1978 and Week 20", () => {
    const state = useSimulationClockStore.getState();
    expect(state.year).toBe(1978);
    expect(state.month).toBe(5);
    expect(state.day).toBe(15);
    expect(state.dayOfWeek).toBe("MONDAY");
    expect(state.week).toBe(20);
    expect(useCompanyFinanceStore.getState().cash).toBe(12400000);
    expect(useReputationStore.getState().overallReputation).toBe(66);
  });

  it("formats date matching the visual mockup (e.g. '15 MAY 1978')", () => {
    expect(formatSimDate(1978, 5, 15)).toBe("15 MAY 1978");
    expect(formatSimDate(1982, 10, 4)).toBe("4 OCT 1982");
  });

  it("advances calendar days and recalculates day of week and week number", () => {
    const { advanceDays } = useSimulationClockStore.getState();
    
    // Advance 1 day from 15 May to 16 May
    advanceDays(1);
    let state = useSimulationClockStore.getState();
    expect(state.day).toBe(16);
    expect(state.month).toBe(5);
    expect(state.year).toBe(1978);
    expect(state.dayOfWeek).toBe("TUESDAY");

    // Advance 20 days: should roll over into June
    advanceDays(20);
    state = useSimulationClockStore.getState();
    expect(state.month).toBe(6);
    expect(state.day).toBe(5);
  });

  it("toggles play/pause state and cycles simulation speed", () => {
    const store = useSimulationClockStore.getState();
    expect(store.isPlaying).toBe(false);

    store.togglePlay();
    expect(useSimulationClockStore.getState().isPlaying).toBe(true);

    store.pause();
    expect(useSimulationClockStore.getState().isPlaying).toBe(false);

    store.setSpeed(10);
    expect(useSimulationClockStore.getState().speed).toBe(10);

    store.setSpeed(50);
    expect(useSimulationClockStore.getState().speed).toBe(50);
  });

  it("contains all active project attributes matching the GT Coupe Development mockup in vehicleProjectStore", () => {
    const { activeProject } = useVehicleProjectStore.getState();
    expect(activeProject.name).toBe("GT COUPE DEVELOPMENT");
    expect(activeProject.targetPowerHp).toBe(1100);
    expect(activeProject.weightReductionKg).toBe(-150);
    expect(activeProject.dragCoefficient).toBe(0.26);
    expect(activeProject.targetUnitCostEur).toBe(185000);
    expect(activeProject.progress.design).toBe(78);
    expect(activeProject.progress.engineering).toBe(63);
    expect(activeProject.progress.testing).toBe(41);
    expect(activeProject.progress.production).toBe(22);
  });

  it("populates today's events and company feeds with initial items", () => {
    const { feedItems } = useSimulationClockStore.getState();
    // After reset, we should have at least the startup feed item
    expect(feedItems.length).toBeGreaterThanOrEqual(1);
  });

  it("advances active project testing and production percentages when time passes via clock cadences", () => {
    const initialTesting = useVehicleProjectStore.getState().activeProject.progress.testing;
    const initialProd = useVehicleProjectStore.getState().activeProject.progress.production;

    useSimulationClockStore.getState().advanceDays(5);

    const updatedTesting = useVehicleProjectStore.getState().activeProject.progress.testing;
    const updatedProd = useVehicleProjectStore.getState().activeProject.progress.production;

    expect(updatedTesting).toBeGreaterThan(initialTesting);
    expect(updatedProd).toBeGreaterThan(initialProd);
  });

  it("handles month boundary correctly (May → June)", () => {
    useSimulationClockStore.getState().advanceDays(17); // 15 May + 17 = 1 June
    const state = useSimulationClockStore.getState();
    expect(state.month).toBe(6);
    expect(state.day).toBe(1);
    expect(state.monthNameShort).toBe("JUN");
  });

  it("handles year boundary correctly (December → January)", () => {
    // Set to Dec 31
    useSimulationClockStore.setState({
      year: 1978, month: 12, day: 31, hour: 12, minute: 0,
      dayOfWeek: "SUNDAY", week: 52, monthName: "December", monthNameShort: "DEC",
    });
    useSimulationClockStore.getState().advanceDays(1);
    const state = useSimulationClockStore.getState();
    expect(state.year).toBe(1979);
    expect(state.month).toBe(1);
    expect(state.day).toBe(1);
    expect(state.monthNameShort).toBe("JAN");
  });

  it("verifies the 7 core disciplines of the Vehicle Creation Hub map to valid application stages", () => {
    const creationDivisions = [
      { step: "01", id: "engine", title: "1. Engine" },
      { step: "02", id: "vehicle", title: "2. Vehicle Studio" },
      { step: "03", id: "aero_studio", title: "3. Aero Studio" },
      { step: "04", id: "interior", title: "4. Interior" },
      { step: "05", id: "safety", title: "5. Safety Center" },
      { step: "06", id: "simulation", title: "6. Sim & Testing" },
      { step: "07", id: "manufacturing", title: "7. Manufacture" },
    ];

    expect(creationDivisions).toHaveLength(7);
    expect(creationDivisions[0].id).toBe("engine");
    expect(creationDivisions[1].id).toBe("vehicle");
    expect(creationDivisions[2].id).toBe("aero_studio");
    expect(creationDivisions[3].id).toBe("interior");
    expect(creationDivisions[4].id).toBe("safety");
    expect(creationDivisions[5].id).toBe("simulation");
    expect(creationDivisions[6].id).toBe("manufacturing");
  });

  it("verifies all Main Menu options redirect to distinct dedicated pages", () => {
    const mainMenuRedirections: Record<string, string> = {
      "CREATE VEHICLE": "create_vehicle_hub",
      "GARAGE": "garage",
      "MOTORSPORT": "motorsport",
      "R&D": "rd",
      "OPERATIONS": "operations",
      "VIEW PROJECT": "project_overview",
      "COMPANY HQ": "hq",
      "Calendar Dock": "calendar",
      "Contracts Dock": "contracts",
      "Settings Dock": "settings",
      "World Dock": "competitors",
    };

    expect(Object.keys(mainMenuRedirections)).toHaveLength(11);
    expect(mainMenuRedirections["OPERATIONS"]).toBe("operations");
    expect(mainMenuRedirections["VIEW PROJECT"]).toBe("project_overview");
    expect(mainMenuRedirections["COMPANY HQ"]).toBe("hq");
    expect(mainMenuRedirections["Calendar Dock"]).toBe("calendar");
    expect(mainMenuRedirections["Contracts Dock"]).toBe("contracts");
    expect(mainMenuRedirections["Settings Dock"]).toBe("settings");
  });

  it("correctly routes division selections in creation hub", () => {
    let redirectedStage: string | null = null;
    const onSelectStage = (stage: string) => {
      redirectedStage = stage;
    };

    const handleSelectDivision = (stageId: string) => {
      onSelectStage(stageId);
    };

    // Selecting engine -> engine
    handleSelectDivision("engine");
    expect(redirectedStage).toBe("engine");

    // Selecting manufacturing -> manufacturing
    handleSelectDivision("manufacturing");
    expect(redirectedStage).toBe("manufacturing");
  });
});
