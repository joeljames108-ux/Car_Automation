import { describe, it, expect, beforeEach } from "vitest";
import { useCampusStore } from "../../../state/campusStore";
import { CAMPUS_UNITS_REGISTRY, INITIAL_FACTORY_STATE } from "../../../sim/campus/campusRegistry";
import { CAMPUS_PLOTS } from "../../../sim/campus/campusPlotCoordinates";
import { CampusUnitId } from "../../../sim/campus/campusTypes";

describe("Campus UI & State Management Test Suite (Epoch 4)", () => {
  beforeEach(() => {
    // Reset store to known state
    useCampusStore.setState({
      units: { ...CAMPUS_UNITS_REGISTRY },
      factoryState: { ...INITIAL_FACTORY_STATE },
      selectedPlotId: "PLOT_01",
      selectedUnitId: "CENTRAL_CORPORATE_HQ",
      activeSectorFilter: "ALL",
      cameraFocusTarget: [0, 0, 0],
      lastActionMessage: null,
      constructionJobs: [],
      viewMode: "3d_isometric",
      eventLog: [
        {
          id: "EVT_TEST_01",
          type: "STAFF_MILESTONE",
          severity: "success",
          title: "Test Event",
          message: "Test message",
          year: 1970,
          month: 1,
          isRead: false,
          createdAt: Date.now(),
        },
      ],
    });
  });

  describe("Phase 195: Campus Notification & Event System", () => {
    it("reads initial notifications correctly", () => {
      const state = useCampusStore.getState();
      expect(state.eventLog.length).toBeGreaterThan(0);
      expect(state.eventLog[0].isRead).toBe(false);
    });

    it("marks an event as read", () => {
      const { markEventRead } = useCampusStore.getState();
      markEventRead("EVT_TEST_01");

      const updated = useCampusStore.getState().eventLog.find((e) => e.id === "EVT_TEST_01");
      expect(updated?.isRead).toBe(true);
    });

    it("adds a new campus event and maintains chronological order", () => {
      const { addCampusEvent } = useCampusStore.getState();
      addCampusEvent({
        id: "EVT_TEST_02",
        type: "CONSTRUCTION_STARTED",
        severity: "info",
        title: "Wind Tunnel Groundbreaking",
        message: "Construction commenced on Unit 03.",
        year: 1972,
        month: 5,
        unitId: "AERO_HQ",
        isRead: false,
        createdAt: Date.now(),
      });

      const events = useCampusStore.getState().eventLog;
      expect(events.length).toBe(2);
      expect(events[0].id).toBe("EVT_TEST_02");
      expect(events[0].unitId).toBe("AERO_HQ");
    });

    it("clears the event log when requested", () => {
      const { clearEventLog } = useCampusStore.getState();
      clearEventLog();
      expect(useCampusStore.getState().eventLog.length).toBe(0);
    });
  });

  describe("Phases 199, 200, 201, 202: Viewport Controls & Sandbox Mode", () => {
    it("toggles all 4 campus view modes cleanly", () => {
      const { setViewMode } = useCampusStore.getState();

      setViewMode("top_down_schematic");
      expect(useCampusStore.getState().viewMode).toBe("top_down_schematic");

      setViewMode("zoning_overlay");
      expect(useCampusStore.getState().viewMode).toBe("zoning_overlay");

      setViewMode("heat_map");
      expect(useCampusStore.getState().viewMode).toBe("heat_map");

      setViewMode("3d_isometric");
      expect(useCampusStore.getState().viewMode).toBe("3d_isometric");
    });

    it("sets debug level for a unit with boundary clamping (0 to 7)", () => {
      const { setDebugUnitLevel } = useCampusStore.getState();

      // Set to L5
      setDebugUnitLevel("CENTRAL_CORPORATE_HQ", 5);
      expect(useCampusStore.getState().units["CENTRAL_CORPORATE_HQ"].level).toBe(5);
      expect(useCampusStore.getState().units["CENTRAL_CORPORATE_HQ"].status).toBe("operational");

      // Clamping test: level > 7 clamps to 7
      setDebugUnitLevel("CENTRAL_CORPORATE_HQ", 10);
      expect(useCampusStore.getState().units["CENTRAL_CORPORATE_HQ"].level).toBe(7);

      // Level 0 sets status to locked
      setDebugUnitLevel("CENTRAL_CORPORATE_HQ", 0);
      expect(useCampusStore.getState().units["CENTRAL_CORPORATE_HQ"].level).toBe(0);
      expect(useCampusStore.getState().units["CENTRAL_CORPORATE_HQ"].status).toBe("locked");
    });

    it("unlocks all 14 campus plots in sandbox mode", () => {
      const { unlockAllPlots } = useCampusStore.getState();
      unlockAllPlots();

      const allUnits = Object.values(useCampusStore.getState().units);
      expect(allUnits.length).toBe(14);
      allUnits.forEach((u) => {
        expect(u.status).toBe("operational");
        expect(u.level).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("Phase 191 & 193: Telemetry & Fiscal Burn Engine", () => {
    it("computes telemetry summary correctly for 1970 starting campus", () => {
      const { getTelemetrySummary } = useCampusStore.getState();
      const telemetry = getTelemetrySummary();

      expect(telemetry.totalPlots).toBe(14);
      expect(telemetry.operationalUnitsCount).toBe(9); // 9 starting units
      expect(telemetry.lockedPlotsCount).toBe(5); // 5 locked starter plots
      expect(telemetry.totalStaffCapacity).toBe(108); // 108 starter capacity
      expect(telemetry.totalMonthlyExpenses).toBeGreaterThan(0);
    });

    it("updates camera focus target when selecting a unit", () => {
      const { selectUnit } = useCampusStore.getState();
      selectUnit("POWERTRAIN_EV_HQ");

      const state = useCampusStore.getState();
      expect(state.selectedUnitId).toBe("POWERTRAIN_EV_HQ");
      expect(state.selectedPlotId).toBe("PLOT_02");
      expect(state.cameraFocusTarget).toBeDefined();
    });

    it("clears camera target when deselecting", () => {
      const { selectUnit } = useCampusStore.getState();
      selectUnit(null);

      const state = useCampusStore.getState();
      expect(state.selectedUnitId).toBeNull();
      expect(state.selectedPlotId).toBeNull();
      expect(state.cameraFocusTarget).toEqual([0, 0, 0]);
    });
  });

  describe("Phase 211: Era Definition Registry", () => {
    it("registers all 6 historical eras from 1970s to 2030s+", async () => {
      const { CAMPUS_ERAS, getCampusEraByYear, getCampusEraByLevel } = await import(
        "../../../sim/campus/eraDefinitions"
      );

      const eraKeys = Object.keys(CAMPUS_ERAS);
      expect(eraKeys.length).toBe(6);

      // Verify year resolution
      expect(getCampusEraByYear(1975).id).toBe("ERA_1970S");
      expect(getCampusEraByYear(1985).id).toBe("ERA_1980S");
      expect(getCampusEraByYear(1995).id).toBe("ERA_1990S");
      expect(getCampusEraByYear(2005).id).toBe("ERA_2000S");
      expect(getCampusEraByYear(2015).id).toBe("ERA_2010S");
      expect(getCampusEraByYear(2025).id).toBe("ERA_2020S_PLUS");

      // Verify building level resolution
      expect(getCampusEraByLevel(1).id).toBe("ERA_1970S");
      expect(getCampusEraByLevel(2).id).toBe("ERA_1980S");
      expect(getCampusEraByLevel(3).id).toBe("ERA_1990S");
      expect(getCampusEraByLevel(4).id).toBe("ERA_2000S");
      expect(getCampusEraByLevel(5).id).toBe("ERA_2010S");
      expect(getCampusEraByLevel(7).id).toBe("ERA_2020S_PLUS");

      // Verify structure of each era definition
      Object.values(CAMPUS_ERAS).forEach((era) => {
        expect(era.name).toBeTruthy();
        expect(era.decadeLabel).toBeTruthy();
        expect(era.palette.primaryWall).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(era.palette.roadSurface).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(era.lighting.keyLightColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(era.lighting.keyLightIntensity).toBeGreaterThan(0);
        expect(era.signageStyle.label).toBeTruthy();
        expect(era.ambientVehicles.types.length).toBeGreaterThan(0);
        expect(era.keyMilestones.length).toBeGreaterThan(0);
      });
    });
  });
});
