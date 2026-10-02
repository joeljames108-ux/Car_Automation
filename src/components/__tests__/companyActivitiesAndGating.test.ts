import { describe, it, expect, beforeEach } from "vitest";
import { useActiveProductionStore } from "../../state/activeProductionStore";
import { useRDTreeStore } from "../../state/rdTreeStore";
import { useCampusStore } from "../../state/campusStore";
import { useGuidedEngineeringStore } from "../../state/guidedEngineeringStore";
import { useDeveloperModeStore } from "../../state/developerModeStore";
import { canAccessStage } from "../../sim/accessManager";
import { formatDurationDays, formatDurationMonths } from "../../hooks/useCompanyActivities";

describe("Active Production Store & Company Activities", () => {
  beforeEach(() => {
    useDeveloperModeStore.setState({ devMode: false });
    useActiveProductionStore.getState().clearAllRuns();
    useRDTreeStore.getState().cancelResearch();
    useCampusStore.setState({ constructionJobs: [] });
    useGuidedEngineeringStore.getState().resetAllStages();
  });

  describe("Duration Formatting Helpers", () => {
    it("formats days correctly", () => {
      expect(formatDurationDays(0)).toBe("Finishing today");
      expect(formatDurationDays(1)).toBe("1 day left");
      expect(formatDurationDays(5)).toBe("5 days left");
      expect(formatDurationDays(21)).toBe("3 weeks left");
      expect(formatDurationDays(90)).toContain("months left");
    });

    it("formats months correctly", () => {
      expect(formatDurationMonths(0)).toBe("Finishing this month");
      expect(formatDurationMonths(0.5)).toContain("days left");
      expect(formatDurationMonths(1.2)).toContain("weeks left");
      expect(formatDurationMonths(3.5)).toBe("3.5 months left");
    });
  });

  describe("Active Production Runs", () => {
    it("starts an in-house car production run and tracks time remaining", () => {
      const run = useActiveProductionStore.getState().startProductionRun({
        vehicleName: "Apex GT-1",
        type: "in_house",
        factoryTier: "workshop_plant",
        totalUnits: 500,
        daysTotal: 25,
        daysRemaining: 25,
        dailyRate: 20,
        unitCostUSD: 14500,
        totalCostUSD: 7250000,
        shiftCount: 2,
        startDateStr: "1970-01-01",
        targetCompletionDateStr: "1970-01-26",
      });

      expect(run.id).toBeDefined();
      expect(run.vehicleName).toBe("Apex GT-1");
      expect(run.status).toBe("IN_PRODUCTION");
      expect(run.producedUnits).toBe(0);

      const activeRuns = useActiveProductionStore.getState().activeRuns;
      expect(activeRuns.length).toBe(1);
      expect(activeRuns[0].daysRemaining).toBe(25);

      // Advance by 10 simulation days
      useActiveProductionStore.getState().tickProduction(10);

      const updated = useActiveProductionStore.getState().activeRuns[0];
      expect(updated.daysRemaining).toBe(15);
      expect(updated.producedUnits).toBe(200); // 10/25 of 500 = 200

      // Advance past completion
      useActiveProductionStore.getState().tickProduction(20);

      const stateAfterCompletion = useActiveProductionStore.getState();
      expect(stateAfterCompletion.activeRuns.length).toBe(0);
      expect(stateAfterCompletion.completedRuns.length).toBe(1);
      expect(stateAfterCompletion.completedRuns[0].producedUnits).toBe(500);
      expect(stateAfterCompletion.completedRuns[0].status).toBe("COMPLETED");
    });

    it("starts a contract manufacturing order and tracks duration", () => {
      const run = useActiveProductionStore.getState().startProductionRun({
        vehicleName: "Series Sedan",
        type: "contract",
        partnerName: "Nordic Engineering Foundries",
        totalUnits: 1200,
        daysTotal: 45,
        daysRemaining: 45,
        dailyRate: 27,
        unitCostUSD: 18000,
        totalCostUSD: 21600000,
        shiftCount: 2,
        startDateStr: "1970-02-01",
        targetCompletionDateStr: "1970-03-18",
      });

      expect(run.type).toBe("contract");
      expect(run.partnerName).toBe("Nordic Engineering Foundries");

      useActiveProductionStore.getState().tickProduction(15);

      const active = useActiveProductionStore.getState().activeRuns[0];
      expect(active.daysRemaining).toBe(30);
      expect(active.producedUnits).toBe(400); // 15/45 of 1200 = 400
    });
  });

  describe("Manufacturing 6-Tab Prerequisite Gating", () => {
    it("locks manufacturing (Tab 7) if upstream tabs are unconfigured", () => {
      const guided = useGuidedEngineeringStore.getState();
      const gate = guided.canEnterStage("manufacturing");
      expect(gate.allowed).toBe(false);
      expect(gate.reason).toContain("You must complete all remaining 6 tabs");
      expect(gate.requiredStage).toBe("engine");
    });

    it("unlocks manufacturing (Tab 7) only when all 6 upstream tabs are configured", () => {
      const guided = useGuidedEngineeringStore.getState();

      // Configure stage 1 to 5
      guided.markStageComplete("engine");
      guided.markStageComplete("vehicle");
      guided.markStageComplete("aero");
      guided.markStageComplete("interior");
      guided.markStageComplete("safety");

      // Simulation is still not configured
      let gate = guided.canEnterStage("manufacturing");
      expect(gate.allowed).toBe(false);
      expect(gate.requiredStage).toBe("simulation");

      // Now configure simulation (stage 6)
      guided.markStageComplete("simulation");

      // All 6 upstream tabs are now configured!
      gate = guided.canEnterStage("manufacturing");
      expect(gate.allowed).toBe(true);
      expect(gate.requiredStage).toBeUndefined();
    });
  });

  describe("useCompanyActivities Aggregation Hook", () => {
    it("reports isIdle = true when no projects are active", async () => {
      const { getCompanyActivitiesSnapshot } = await import("../../hooks/useCompanyActivities");

      const snapshot = getCompanyActivitiesSnapshot();
      expect(snapshot.isIdle).toBe(true);
      expect(snapshot.activities.length).toBe(0);
      expect(snapshot.activeCount).toBe(0);
    });

    it("aggregates active car production with duration left and percentage", async () => {
      const { getCompanyActivitiesSnapshot } = await import("../../hooks/useCompanyActivities");

      useActiveProductionStore.getState().startProductionRun({
        vehicleName: "Apex Hypercar GT",
        type: "in_house",
        factoryTier: "modern_assembly_plant",
        totalUnits: 1000,
        daysTotal: 20,
        daysRemaining: 10,
        dailyRate: 50,
        unitCostUSD: 25000,
        totalCostUSD: 25000000,
        shiftCount: 2,
        startDateStr: "1970-01-01",
        targetCompletionDateStr: "1970-01-21",
      });

      const snapshot = getCompanyActivitiesSnapshot();
      expect(snapshot.isIdle).toBe(false);
      expect(snapshot.activeCount).toBe(1);
      expect(snapshot.carProductionRuns.length).toBe(1);

      const carActivity = snapshot.carProductionRuns[0];
      expect(carActivity.title).toBe("Apex Hypercar GT");
      expect(carActivity.type).toBe("car_production");
      expect(carActivity.durationLeftText).toBe("10 days left");
      expect(carActivity.progressPct).toBe(50);
      expect(carActivity.stageAction).toBe("manufacturing");
      expect(carActivity.metrics.length).toBe(4);
      expect(carActivity.stages.length).toBe(4);
    });

    it("aggregates active R&D research project with duration left and percentage", async () => {
      const { getCompanyActivitiesSnapshot } = await import("../../hooks/useCompanyActivities");

      useRDTreeStore.setState({
        activeProject: {
          nodeId: "mat_hss",
          name: "High-Strength Steel Alloy",
          departmentId: "materials_engineering",
          branchId: "materials_engineering",
          progressMonths: 3,
          totalMonths: 6,
          assignedScientists: 8,
          cost: 120000,
          assignedTeamId: "team_alpha",
        },
      });

      const snapshot = getCompanyActivitiesSnapshot();
      expect(snapshot.isIdle).toBe(false);
      expect(snapshot.rndProjects.length).toBe(1);

      const rndActivity = snapshot.rndProjects[0];
      expect(rndActivity.title).toBe("High-Strength Steel Alloy");
      expect(rndActivity.type).toBe("rnd");
      expect(rndActivity.durationLeftText).toBe("3.0 months left");
      expect(rndActivity.progressPct).toBe(50);
      expect(rndActivity.stageAction).toBe("rd");
      expect(rndActivity.metrics[1].value).toBe("8 Engineers");
    });

    it("aggregates active HQ construction upgrade with duration left and percentage", async () => {
      const { getCompanyActivitiesSnapshot } = await import("../../hooks/useCompanyActivities");

      useCampusStore.setState({
        constructionJobs: [
          {
            jobId: "job_powertrain_l2",
            unitId: "UNIT_01" as any,
            unitName: "Powertrain R&D Center",
            startLevel: 1,
            targetLevel: 2,
            startDateYear: 1970,
            startDateMonth: 1,
            totalMonthsRequired: 4,
            monthsElapsed: 1,
            progressPct: 25,
            totalCost: 1500000,
            resourcesCommitted: [],
            assignedWorkers: 24,
            status: "in_progress",
            statusMessage: "Structural framing ongoing",
            contractorTier: "premium",
          },
        ],
      });

      const snapshot = getCompanyActivitiesSnapshot();
      expect(snapshot.isIdle).toBe(false);
      expect(snapshot.hqUpgrades.length).toBe(1);

      const hqActivity = snapshot.hqUpgrades[0];
      expect(hqActivity.title).toBe("Powertrain R&D Center (Level 2)");
      expect(hqActivity.type).toBe("hq_upgrade");
      expect(hqActivity.durationLeftText).toBe("3.0 months left");
      expect(hqActivity.progressPct).toBe(25);
      expect(hqActivity.stageAction).toBe("hq");
      expect(hqActivity.metrics[1].value).toBe("24 Specialists");
    });

    it("handles multiple concurrent projects across car production, R&D, and HQ upgrades", async () => {
      const { getCompanyActivitiesSnapshot } = await import("../../hooks/useCompanyActivities");

      // 1. Car production
      useActiveProductionStore.getState().startProductionRun({
        vehicleName: "Apex Formula-1",
        type: "in_house",
        factoryTier: "workshop_plant",
        totalUnits: 2,
        daysTotal: 30,
        daysRemaining: 15,
        dailyRate: 1,
        unitCostUSD: 500000,
        totalCostUSD: 1000000,
        shiftCount: 3,
        startDateStr: "1970-01-01",
        targetCompletionDateStr: "1970-01-31",
      });

      // 2. R&D
      useRDTreeStore.setState({
        activeProject: {
          nodeId: "aero_tunnel",
          name: "Ground Effect Underbody",
          departmentId: "race_aero",
          branchId: "race_aero",
          progressMonths: 2,
          totalMonths: 8,
          assignedScientists: 12,
          cost: 250000,
          assignedTeamId: null,
        },
      });

      // 3. HQ Upgrade
      useCampusStore.setState({
        constructionJobs: [
          {
            jobId: "job_tunnel",
            unitId: "UNIT_02" as any,
            unitName: "Supersonic Wind Tunnel",
            startLevel: 1,
            targetLevel: 2,
            startDateYear: 1970,
            startDateMonth: 2,
            totalMonthsRequired: 6,
            monthsElapsed: 3,
            progressPct: 50,
            totalCost: 3200000,
            resourcesCommitted: [],
            assignedWorkers: 40,
            status: "in_progress",
            statusMessage: "Nozzle calibration",
          },
        ],
      });

      const snapshot = getCompanyActivitiesSnapshot();
      expect(snapshot.isIdle).toBe(false);
      expect(snapshot.activeCount).toBe(3);
      expect(snapshot.activities.length).toBe(3);
      expect(snapshot.carProductionRuns.length).toBe(1);
      expect(snapshot.rndProjects.length).toBe(1);
      expect(snapshot.hqUpgrades.length).toBe(1);
    });
  });
});


