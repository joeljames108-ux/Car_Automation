/**
 * AUTOMOTIVE CORPORATE CAMPUS & FACTORY ZUSTAND STORE
 * 
 * Manages runtime state for all 14 Campus Units (13 HQ buildings + 1 Factory),
 * 1970 starter campus with 7 core buildings, prototype workshop slots,
 * locked expansion plot construction, and deep factory progression.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  CampusUnitDefinition,
  CampusUnitId,
  CampusSector,
  FactoryProgressionState,
  CampusTelemetrySummary
} from "../sim/campus/campusTypes";
import {
  CAMPUS_UNITS_REGISTRY,
  INITIAL_FACTORY_STATE
} from "../sim/campus/campusRegistry";
import { CampusEngine } from "../sim/campus/campusEngine";
import { FactoryProgressionEngine } from "../sim/campus/factoryProgressionEngine";
import { useSimulationClockStore } from "./simulationClockStore";
import { useCompanyFinanceStore } from "./companyFinanceStore";
import { clockListeners } from "./gameClockEngine";
import {
  CampusPlotDefinition,
  CAMPUS_PLOTS,
} from "../sim/campus/campusPlotCoordinates";
import {
  ConstructionJob,
  ContractorTier,
  enqueueConstructionJob,
  cancelConstructionJob,
} from "../sim/campus/constructionQueue";
import { MaterialInventory } from "../sim/campus/constructionLogistics";
import { CampusEventLogEntry } from "../sim/campus/campusEvents";
import { calculateCampusMonthlyFinances } from "../sim/campus/campusEconomyEngine";
import {
  CampusBeautificationState,
  computeBeautificationState,
} from "../sim/campus/campusBeautificationEngine";
import { useReputationStore } from "./reputationStore";
import {
  RailwayTerminalEngine,
  RailwayTerminalState,
  SpecializedSidingType,
  RailNetworkTier,
  DailyFreightDispatchInput,
  DailyFreightDispatchResult,
  MonthlyRailEconomics,
} from "../sim/campus/railwayTerminalEngine";

export type CampusViewMode = "3d_isometric" | "top_down_schematic" | "zoning_overlay" | "heat_map";

interface CampusStoreState {
  plots: Record<CampusUnitId, CampusPlotDefinition>;
  units: Record<CampusUnitId, CampusUnitDefinition>;
  factoryState: FactoryProgressionState;
  selectedPlotId: string | null;
  selectedUnitId: CampusUnitId | null;
  activeSectorFilter: "ALL" | CampusSector;
  cameraFocusTarget: [number, number, number] | null;
  lastActionMessage: string | null;
  constructionJobs: ConstructionJob[];
  viewMode: CampusViewMode;
  materialInventory: MaterialInventory;
  eventLog: CampusEventLogEntry[];
  beautificationState: CampusBeautificationState;
  railwayTerminalState: RailwayTerminalState;

  // Railway Terminal Actions
  upgradeRailwayTerminal: (targetLevel: number) => boolean;
  installRailwaySiding: (sidingId: SpecializedSidingType) => boolean;
  upgradeRailwayNetwork: (tier: RailNetworkTier) => boolean;
  setRailwayThirdPartyLease: (tonnesPerDay: number, rateUSDPerTonne?: number) => boolean;
  getRailwayDailyDispatch: (input?: Partial<DailyFreightDispatchInput>) => DailyFreightDispatchResult;
  getRailwayEconomics: () => MonthlyRailEconomics;

  // Actions
  recalculateBeautification: (companyReputation?: number, gameMonth?: number) => void;
  selectPlot: (plotId: string | null) => void;
  selectUnit: (unitId: CampusUnitId | null) => void;
  setSectorFilter: (filter: "ALL" | CampusSector) => void;
  setCameraFocusTarget: (target: [number, number, number] | null) => void;
  setViewMode: (mode: CampusViewMode) => void;
  clearActionMessage: () => void;

  // Events & Notifications
  markEventRead: (eventId: string) => void;
  clearEventLog: () => void;
  addCampusEvent: (event: CampusEventLogEntry) => void;

  // Sandbox & Debug Mode
  setDebugUnitLevel: (unitId: CampusUnitId, level: number) => void;
  unlockAllPlots: () => void;

  // Construction & Upgrades
  constructPlot: (unitId: CampusUnitId) => boolean;
  upgradeUnit: (unitId: CampusUnitId) => boolean;
  upgradeSubDepartment: (unitId: CampusUnitId, subDeptId: string) => boolean;
  startConstruction: (unitId: CampusUnitId, targetLevel: number, contractorTier?: ContractorTier) => boolean;
  cancelConstruction: (jobId: string) => boolean;
  tickCampus: (deltaMonths?: number) => void;

  // Prototype Workshop Management
  assignPrototypeSlot: (
    slotId: number,
    vehicleName: string,
    task: "engine_swap" | "chassis_rigging" | "prototype_assembly" | "inspection"
  ) => void;

  // Factory Progression Lifecycle
  purchaseFactoryLand: () => boolean;
  beginFactoryConstruction: () => boolean;
  advanceFactoryConstructionMonth: () => void;
  selectContractPartner: (partnerId: string) => void;
  upgradeFactoryTier: () => boolean;
  upgradeFactoryShop: (shopKey: keyof FactoryProgressionState["shops"]) => boolean;

  // Computed
  getTelemetrySummary: () => CampusTelemetrySummary;
}

// Safe storage fallback for SSR/Vitest environments
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

const INITIAL_CAMPUS_EVENTS: CampusEventLogEntry[] = [
  {
    id: "EVT_FOUNDING_01",
    type: "STAFF_MILESTONE",
    severity: "success",
    title: "Apex Campus Operational",
    message: "The founding era corporate campus has been established with 7 core engineering pavilions.",
    year: 1970,
    month: 1,
    unitId: "CENTRAL_CORPORATE_HQ",
    isRead: false,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "EVT_FOUNDING_02",
    type: "DEPARTMENT_OPENED",
    severity: "info",
    title: "Vehicle Styling Studio Open",
    message: "Clay modeling studios and 1:1 drafting boards are staffed and ready for production styling.",
    year: 1970,
    month: 1,
    unitId: "VEHICLE_DESIGN_HQ",
    isRead: true,
    createdAt: Date.now() - 86400000,
  }
];

export const useCampusStore = create<CampusStoreState>()(
  persist(
    (set, get) => ({
      plots: CAMPUS_PLOTS,
      units: CAMPUS_UNITS_REGISTRY,
      factoryState: INITIAL_FACTORY_STATE,
      selectedPlotId: "PLOT_01",
      selectedUnitId: "CENTRAL_CORPORATE_HQ",
      activeSectorFilter: "ALL",
      cameraFocusTarget: [0, 0, 0],
      lastActionMessage: null,
      constructionJobs: [],
      viewMode: "3d_isometric",
      materialInventory: {
        STEEL: 500,
        CONCRETE: 2000,
        GLASS: 800,
        TIMBER: 600,
        ELECTRONICS: 50,
        HEAVY_MACHINERY: 1000,
        LABOR_MONTHS: 300,
      },
      eventLog: INITIAL_CAMPUS_EVENTS,
      beautificationState: computeBeautificationState({
        reputation: 15, // 1970 baseline
        gameMonth: 1,
      }),
      railwayTerminalState: RailwayTerminalEngine.createInitialState(),

      recalculateBeautification: (companyReputation, gameMonth) => {
        let rep = companyReputation;
        let specOverrides: any = undefined;
        if (rep === undefined) {
          try {
            const repStore = useReputationStore.getState();
            if (repStore) {
              rep = repStore.overallReputation ?? 15;
              if (repStore.dimensions) {
                specOverrides = {
                  engineering: repStore.dimensions.engineering?.score,
                  motorsport: repStore.dimensions.motorsport?.score,
                  safety: repStore.dimensions.safety?.score,
                  luxury: repStore.dimensions.luxury?.score,
                };
              }
            }
          } catch {
            rep = 15;
          }
        }
        const month = gameMonth ?? useSimulationClockStore.getState().month;
        const nextBeautification = computeBeautificationState({
          reputation: rep ?? 15,
          previousState: get().beautificationState,
          units: get().units,
          specializationOverrides: specOverrides,
          gameMonth: month,
        });
        set({ beautificationState: nextBeautification });
      },

      selectPlot: (plotId) => {
        set({ selectedPlotId: plotId });
        if (plotId) {
          const plot = Object.values(CAMPUS_PLOTS).find(p => p.plotId === plotId);
          if (plot) {
            set({
              selectedUnitId: plot.unitId,
              cameraFocusTarget: [plot.worldPosition.x, plot.worldPosition.y, plot.worldPosition.z],
            });
          }
        }
      },

      selectUnit: (unitId) => {
        if (!unitId) {
          set({ selectedUnitId: null, selectedPlotId: null, cameraFocusTarget: [0, 0, 0] });
          return;
        }
        const unit = get().units[unitId];
        const plot = CAMPUS_PLOTS[unitId];
        if (unit) {
          set({
            selectedUnitId: unitId,
            selectedPlotId: plot ? plot.plotId : null,
            cameraFocusTarget: [unit.mapCoordinates.x, unit.mapCoordinates.y, unit.mapCoordinates.z],
          });
        }
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      setSectorFilter: (filter) => {
        set({ activeSectorFilter: filter });
      },

      setCameraFocusTarget: (target) => {
        set({ cameraFocusTarget: target });
      },

      clearActionMessage: () => {
        set({ lastActionMessage: null });
      },

      markEventRead: (eventId) => {
        set({
          eventLog: get().eventLog.map(e => e.id === eventId ? { ...e, isRead: true } : e),
        });
      },

      clearEventLog: () => {
        set({ eventLog: [] });
      },

      addCampusEvent: (event) => {
        set({
          eventLog: [event, ...get().eventLog].slice(0, 50),
        });
      },

      setDebugUnitLevel: (unitId, level) => {
        const unit = get().units[unitId];
        if (!unit) return;
        const clampedLevel = Math.max(0, Math.min(7, level));
        set({
          units: {
            ...get().units,
            [unitId]: {
              ...unit,
              level: clampedLevel,
              status: clampedLevel === 0 ? "locked" : "operational",
            }
          },
          lastActionMessage: `[Sandbox] Set ${unit.name} to Level ${clampedLevel}`,
        });
      },

      unlockAllPlots: () => {
        const nextUnits = { ...get().units };
        Object.keys(nextUnits).forEach(k => {
          const uId = k as CampusUnitId;
          if (nextUnits[uId].status === "locked" || nextUnits[uId].status === "outsourced") {
            nextUnits[uId] = {
              ...nextUnits[uId],
              status: "operational",
              level: Math.max(1, nextUnits[uId].level),
            };
          }
        });
        set({
          units: nextUnits,
          lastActionMessage: "[Sandbox] Unlocked all 14 campus plots!",
        });
      },

      constructPlot: (unitId) => {
        const cash = useCompanyFinanceStore.getState().cash;
        const result = CampusEngine.constructLockedPlot(get().units, unitId, cash);
        if (result.success) {
          useCompanyFinanceStore.getState().spendDirectCash(
            result.cost,
            "HQ_CONSTRUCTION",
            `Commissioned ${get().units[unitId]?.name} on campus`
          );
          useSimulationClockStore.getState().addFeedItem({
            type: "production",
            title: "Facility Constructed",
            description: `Commissioned ${get().units[unitId]?.name} on campus`,
            timestamp: new Date().toISOString(),
          });
          set({
            units: result.nextUnits,
            lastActionMessage: result.message,
          });
          return true;
        } else {
          set({ lastActionMessage: result.message });
          return false;
        }
      },

      upgradeUnit: (unitId) => {
        const cash = useCompanyFinanceStore.getState().cash;
        const result = CampusEngine.upgradeUnit(get().units, unitId, cash);
        if (result.success) {
          useCompanyFinanceStore.getState().spendDirectCash(
            result.cost,
            "RD_INVESTMENT",
            `Upgraded ${get().units[unitId]?.name} to Level ${result.nextUnits[unitId]?.level}`
          );
          useSimulationClockStore.getState().addFeedItem({
            type: "rnd",
            title: "Campus Pavilion Upgraded",
            description: `Upgraded ${get().units[unitId]?.name} to Level ${result.nextUnits[unitId]?.level}`,
            timestamp: new Date().toISOString(),
          });
          set({
            units: result.nextUnits,
            lastActionMessage: result.message,
          });
          return true;
        } else {
          set({ lastActionMessage: result.message });
          return false;
        }
      },

      upgradeSubDepartment: (unitId, subDeptId) => {
        const cash = useCompanyFinanceStore.getState().cash;
        const result = CampusEngine.upgradeSubDepartment(get().units, unitId, subDeptId, cash);
        if (result.success) {
          useCompanyFinanceStore.getState().spendDirectCash(
            result.cost,
            "RD_INVESTMENT",
            `Expanded ${subDeptId} in ${get().units[unitId]?.name}`
          );
          useSimulationClockStore.getState().addFeedItem({
            type: "rnd",
            title: "Facility Expanded",
            description: `Expanded ${subDeptId} in ${get().units[unitId]?.name}`,
            timestamp: new Date().toISOString(),
          });
          set({
            units: result.nextUnits,
            lastActionMessage: result.message,
          });
          return true;
        } else {
          set({ lastActionMessage: result.message });
          return false;
        }
      },

      startConstruction: (unitId, targetLevel, contractorTier = "standard") => {
        const unit = get().units[unitId];
        if (!unit) return false;
        const clock = useSimulationClockStore.getState();
        const corpHqLevel = get().units["CENTRAL_CORPORATE_HQ"]?.level || 1;
        const result = enqueueConstructionJob(
          get().constructionJobs,
          unitId,
          unit.name,
          unit.level,
          targetLevel,
          clock.year,
          clock.month,
          corpHqLevel,
          contractorTier
        );
        if (result.success && result.createdJob) {
          const financeStore = useCompanyFinanceStore.getState();
          if (financeStore.cash < result.createdJob.totalCost) {
            set({ lastActionMessage: `Insufficient capital ($${result.createdJob.totalCost.toLocaleString()} required).` });
            return false;
          }
          financeStore.injectCapital(-result.createdJob.totalCost, "HQ Construction Job", clock.month, clock.year);
          set({
            constructionJobs: result.updatedJobs,
            units: {
              ...get().units,
              [unitId]: {
                ...unit,
                status: "under_construction",
              },
            },
            lastActionMessage: `Began construction project on ${unit.name} to Tier Level ${targetLevel} (${contractorTier.toUpperCase()} contractor).`,
          });
          return true;
        } else {
          set({ lastActionMessage: result.error || "Cannot start construction." });
          return false;
        }
      },

      cancelConstruction: (jobId) => {
        const result = cancelConstructionJob(get().constructionJobs, jobId);
        if (result.success) {
          set({ constructionJobs: result.updatedJobs, lastActionMessage: "Construction job cancelled." });
          return true;
        }
        return false;
      },

      tickCampus: (deltaMonths = 1) => {
        const clock = useSimulationClockStore.getState();
        const tickResult = CampusEngine.tickCampus(
          get().units,
          get().factoryState,
          get().constructionJobs,
          deltaMonths,
          clock.year,
          clock.month
        );

        // Credit passive monthly campus revenue (Phase 248)
        const campusFinances = calculateCampusMonthlyFinances(
          tickResult.nextUnits,
          tickResult.telemetry.campusPrestigeScore,
          clock.year
        );
        if (campusFinances.revenue.totalMonthlyRevenue > 0) {
          useCompanyFinanceStore.getState().injectCapital(
            campusFinances.revenue.totalMonthlyRevenue * deltaMonths,
            "Campus Passive Revenue",
            clock.month,
            clock.year
          );
        }

        // Automatic HQ visual beautification & prestige evolution driven by company reputation
        let rep = 15;
        let specOverrides: any = undefined;
        try {
          const repStore = useReputationStore.getState();
          if (repStore) {
            rep = repStore.overallReputation ?? 15;
            if (repStore.dimensions) {
              specOverrides = {
                engineering: repStore.dimensions.engineering?.score,
                motorsport: repStore.dimensions.motorsport?.score,
                safety: repStore.dimensions.safety?.score,
                luxury: repStore.dimensions.luxury?.score,
              };
            }
          }
        } catch {
          rep = 15;
        }

        const nextBeautification = computeBeautificationState({
          reputation: rep,
          previousState: get().beautificationState,
          units: tickResult.nextUnits,
          specializationOverrides: specOverrides,
          gameMonth: clock.month,
        });

        set({
          units: tickResult.nextUnits,
          constructionJobs: tickResult.nextJobs,
          eventLog: [...tickResult.events, ...get().eventLog].slice(0, 50),
          beautificationState: nextBeautification,
        });
      },


      assignPrototypeSlot: (slotId, vehicleName, task) => {
        const result = CampusEngine.assignPrototypeSlot(get().units, slotId, vehicleName, task);
        if (result.success) {
          set({
            units: result.nextUnits,
            lastActionMessage: result.message,
          });
        }
      },

      purchaseFactoryLand: () => {
        const cash = useCompanyFinanceStore.getState().cash;
        const result = FactoryProgressionEngine.purchaseLandPlot(get().factoryState, cash);
        if (result.success) {
          useCompanyFinanceStore.getState().spendDirectCash(
            result.cost,
            "FACTORY_CONSTRUCTION",
            `Acquired ${result.state.landLocationName} for Factory Construction`
          );
          useSimulationClockStore.getState().addFeedItem({
            type: "production",
            title: "Industrial Land Acquired",
            description: `Acquired ${result.state.landLocationName} for Factory Construction`,
            timestamp: new Date().toISOString(),
          });
          
          // Also update unit 10 status in units map
          const updatedUnits = { ...get().units };
          if (updatedUnits.FACTORY) {
            updatedUnits.FACTORY = {
              ...updatedUnits.FACTORY,
              status: "operational",
            };
          }

          set({
            factoryState: result.state,
            units: updatedUnits,
            lastActionMessage: result.message,
          });
          return true;
        } else {
          set({ lastActionMessage: result.message });
          return false;
        }
      },

      beginFactoryConstruction: () => {
        const result = FactoryProgressionEngine.beginConstruction(get().factoryState);
        if (result.success) {
          const updatedUnits = { ...get().units };
          if (updatedUnits.FACTORY) {
            updatedUnits.FACTORY = {
              ...updatedUnits.FACTORY,
              status: "under_construction",
            };
          }
          set({
            factoryState: result.state,
            units: updatedUnits,
            lastActionMessage: result.message,
          });
          return true;
        } else {
          set({ lastActionMessage: result.message });
          return false;
        }
      },

      advanceFactoryConstructionMonth: () => {
        const cash = useCompanyFinanceStore.getState().cash;
        const monthlyCost = 1750000;
        if (cash >= monthlyCost) {
          const result = FactoryProgressionEngine.advanceConstructionMonth(get().factoryState, monthlyCost);
          useCompanyFinanceStore.getState().spendDirectCash(
            result.monthCost,
            "FACTORY_CONSTRUCTION",
            "Factory Civil Construction Monthly Draw"
          );
          useSimulationClockStore.getState().addFeedItem({
            type: "production",
            title: "Factory Construction Draw",
            description: "Factory Civil Construction Monthly Draw",
            timestamp: new Date().toISOString(),
          });

          const updatedUnits = { ...get().units };
          if (result.commissioned && updatedUnits.FACTORY) {
            updatedUnits.FACTORY = {
              ...updatedUnits.FACTORY,
              status: "operational",
              level: 1,
              currentStaff: 280,
            };
          }

          set({
            factoryState: result.state,
            units: updatedUnits,
            lastActionMessage: result.commissioned 
              ? "🎉 Factory construction complete! Your owned manufacturing plant is officially COMMISSIONED!"
              : `Construction progress: ${result.state.constructionProgressPct}% (${result.state.constructionMonthsRemaining} months remaining)`,
          });
        }
      },

      selectContractPartner: (partnerId) => {
        const result = FactoryProgressionEngine.selectContractPartner(get().factoryState, partnerId);
        if (result.success) {
          set({
            factoryState: result.state,
            lastActionMessage: result.message,
          });
        }
      },

      upgradeFactoryTier: () => {
        const cash = useCompanyFinanceStore.getState().cash;
        const result = FactoryProgressionEngine.upgradeFactoryTier(get().factoryState, cash);
        if (result.success) {
          useCompanyFinanceStore.getState().spendDirectCash(
            result.cost,
            "FACTORY_CONSTRUCTION",
            `Upgraded factory to Tier ${result.state.factoryLevel}`
          );
          useSimulationClockStore.getState().addFeedItem({
            type: "production",
            title: "Manufacturing Plant Upgraded",
            description: `Upgraded factory to Tier ${result.state.factoryLevel}`,
            timestamp: new Date().toISOString(),
          });
          set({
            factoryState: result.state,
            lastActionMessage: result.message,
          });
          return true;
        } else {
          set({ lastActionMessage: result.message });
          return false;
        }
      },

      upgradeFactoryShop: (shopKey) => {
        const cash = useCompanyFinanceStore.getState().cash;
        const result = FactoryProgressionEngine.upgradeFactoryShop(get().factoryState, shopKey, cash);
        if (result.success) {
          useCompanyFinanceStore.getState().spendDirectCash(
            result.cost,
            "TOOLING",
            `Upgraded ${shopKey} in Manufacturing Plant`
          );
          useSimulationClockStore.getState().addFeedItem({
            type: "production",
            title: "Factory Shop Upgraded",
            description: `Upgraded ${shopKey} in Manufacturing Plant`,
            timestamp: new Date().toISOString(),
          });
          set({
            factoryState: result.state,
            lastActionMessage: result.message,
          });
          return true;
        } else {
          set({ lastActionMessage: result.message });
          return false;
        }
      },

      // ── Railway Terminal Operations & Upgrades ──
      upgradeRailwayTerminal: (targetLevel) => {
        const cash = useCompanyFinanceStore.getState().cash;
        const currentState = get().railwayTerminalState;
        const result = RailwayTerminalEngine.upgradeTerminalTier(currentState, targetLevel, cash);
        if (result.success) {
          const cost = cash - result.remainingCash;
          useCompanyFinanceStore.getState().spendDirectCash(
            cost,
            "RAIL_INFRASTRUCTURE",
            `Upgraded HQ Cargo Railway Terminal to Level ${targetLevel}`
          );
          useSimulationClockStore.getState().addFeedItem({
            type: "production",
            title: "Railway Terminal Upgraded",
            description: `Upgraded HQ Cargo Railway Terminal to Level ${targetLevel}`,
            timestamp: new Date().toISOString(),
          });
          set({
            railwayTerminalState: result.updatedState,
            lastActionMessage: `Cargo Railway Terminal upgraded to Level ${targetLevel}`,
          });
          return true;
        } else {
          set({ lastActionMessage: result.errorReason || "Failed to upgrade railway terminal." });
          return false;
        }
      },

      installRailwaySiding: (sidingId) => {
        const cash = useCompanyFinanceStore.getState().cash;
        const currentState = get().railwayTerminalState;
        const result = RailwayTerminalEngine.installSpecializedSiding(currentState, sidingId, cash);
        if (result.success) {
          const cost = cash - result.remainingCash;
          useCompanyFinanceStore.getState().spendDirectCash(
            cost,
            "RAIL_INFRASTRUCTURE",
            `Installed specialized siding: ${sidingId}`
          );
          useSimulationClockStore.getState().addFeedItem({
            type: "production",
            title: "Rail Siding Installed",
            description: `Installed specialized siding: ${sidingId}`,
            timestamp: new Date().toISOString(),
          });
          set({
            railwayTerminalState: result.updatedState,
            lastActionMessage: `Installed siding: ${sidingId}`,
          });
          return true;
        } else {
          set({ lastActionMessage: result.errorReason || "Failed to install specialized siding." });
          return false;
        }
      },

      upgradeRailwayNetwork: (tier) => {
        const clockStore = useSimulationClockStore.getState();
        const rep = useReputationStore.getState().overallReputation ?? 15;
        const currentState = get().railwayTerminalState;
        const financeStore = useCompanyFinanceStore.getState();
        const result = RailwayTerminalEngine.upgradeNetworkTier(currentState, tier, rep, financeStore.cash);
        if (result.success) {
          const cost = financeStore.cash - result.remainingCash;
          financeStore.injectCapital(-cost, `Rail Network Upgrade (${tier})`, clockStore.month, clockStore.year);
          clockStore.addFeedItem({
            type: "supplier",
            title: "Rail Network Connected",
            description: `Upgraded trunk rail corridor to ${tier}`,
            timestamp: new Date().toISOString(),
          });
          set({
            railwayTerminalState: result.updatedState,
            lastActionMessage: `Connected to rail network tier: ${tier}`,
          });
          return true;
        } else {
          set({ lastActionMessage: result.errorReason || "Failed to upgrade rail network." });
          return false;
        }
      },

      setRailwayThirdPartyLease: (tonnesPerDay, rateUSDPerTonne) => {
        const currentState = get().railwayTerminalState;
        const result = RailwayTerminalEngine.setThirdPartyLease(currentState, tonnesPerDay, rateUSDPerTonne);
        if (result.success) {
          set({
            railwayTerminalState: result.updatedState,
            lastActionMessage: `Third-party lease set to ${tonnesPerDay} t/d at $${rateUSDPerTonne ?? 32}/t`,
          });
          return true;
        } else {
          set({ lastActionMessage: result.errorReason || "Failed to configure lease." });
          return false;
        }
      },

      getRailwayDailyDispatch: (input) => {
        const state = get().railwayTerminalState;
        const fullInput: DailyFreightDispatchInput = {
          inboundMaterialsTonnes: input?.inboundMaterialsTonnes ?? 450,
          outboundComponentsTonnes: input?.outboundComponentsTonnes ?? 200,
          outboundVehiclesCount: input?.outboundVehiclesCount ?? 120,
          averageVehicleWeightTonnes: input?.averageVehicleWeightTonnes ?? 1.6,
          averageDistanceKm: input?.averageDistanceKm ?? 450,
        };
        return RailwayTerminalEngine.processDailyFreightFlow(fullInput, state);
      },

      getRailwayEconomics: () => {
        const state = get().railwayTerminalState;
        const defaultDemand: DailyFreightDispatchInput = {
          inboundMaterialsTonnes: 450,
          outboundComponentsTonnes: 200,
          outboundVehiclesCount: 120,
        };
        return RailwayTerminalEngine.calculateMonthlyEconomics(state, defaultDemand);
      },

      getTelemetrySummary: () => {
        const telemetry = CampusEngine.calculateCampusTelemetry(get().units, get().factoryState);
        const bState = get().beautificationState;
        if (bState) {
          telemetry.beautificationTier = bState.tier;
          telemetry.beautificationBudgetSpent = bState.budgetSpent;
          telemetry.beautificationBudgetTotal = bState.totalBudget;
          telemetry.beautificationActiveAssetsCount = bState.activeAssets.length;
          telemetry.beautificationHeritageAssetsCount = bState.heritageAssets.length;
        }
        return telemetry;
      },
    }),
    {
      name: "apex_campus_store_v1",
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        units: state.units,
        factoryState: state.factoryState,
        selectedUnitId: state.selectedUnitId,
        beautificationState: state.beautificationState,
        railwayTerminalState: state.railwayTerminalState,
      }),
    }
  )
);

// Automatic monthly subscription for factory construction progress and campus beautification
clockListeners.subscribe("month", "campusMonthlyTick", (payload) => {
  const store = useCampusStore.getState();
  const factoryState = store.factoryState;
  if (factoryState && factoryState.constructionMonthsRemaining > 0) {
    store.advanceFactoryConstructionMonth();
  }
  store.recalculateBeautification(undefined, payload.current.month);
});
