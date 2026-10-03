// ==============================================================================
// MOTORSPORT STORE — ZUSTAND STATE MANAGEMENT (DOMAIN EXTRACTION)
// Independent domain store for multi-category motorsport racing, teams,
// drivers, season simulation, tech transfer, telemetry, and master clock synchronization.
// ==============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
import {
  initialMotorsportState,
  createTeam as simCreateTeam,
  assignDriver as simAssignDriver,
  simulateSeason as simSimulateSeason,
  transferTech as simTransferTech,
  getAvailableDrivers as simGetAvailableDrivers,
  scoutDriver as simScoutDriver,
  signScoutedDriver as simSignScoutedDriver,
  upgradeTeamFacility as simUpgradeTeamFacility,
  updateTeamStrategy as simUpdateTeamStrategy,
  releaseDriver as simReleaseDriver,
  renewDriverContract as simRenewDriverContract,
  attractSponsor as simAttractSponsor,
  generateSponsorMarket as simGenerateSponsorMarket,
  getMotorsportSummary as simGetMotorsportSummary,
} from "../sim/motorsportEngine";
import type {
  MotorsportState,
  MotorsportTeam,
  MotorsportCategory,
  RaceDriver,
  TeamStrategy,
  Sponsor,
} from "../sim/types";
import { useSimulationClockStore } from "./simulationClockStore";
import { clockListeners } from "./gameClockEngine";

export interface MotorsportStoreState {
  // Master state
  teams: MotorsportTeam[];
  currentSeason: number;
  techTransferHistory: MotorsportState["techTransferHistory"];
  totalTechTransferred: number;
  scoutedDrivers: RaceDriver[];
  sponsorMarket: Sponsor[];
  selectedTeamId: string | null;

  // Actions
  setSelectedTeamId: (teamId: string | null) => void;
  createTeam: (name: string, category: MotorsportCategory, budget: number, baseVehicleId: string | null) => string;
  createMotorsportTeam: (name: string, category: MotorsportCategory, budget: number, baseVehicleId: string | null) => string;
  assignDriver: (teamId: string, driverIdx: number) => void;
  assignMotorsportDriver: (teamId: string, driverIdx: number) => void;
  simulateSeason: (power: number, weight: number, aeroScore: number, reliability: number) => void;
  simulateMotorsportSeason: (power: number, weight: number, aeroScore: number, reliability: number) => void;
  transferTech: (teamId: string, direction: "race_to_production" | "production_to_race", points: number, currentMonth?: number) => void;
  transferMotorsportTech: (teamId: string, direction: "race_to_production" | "production_to_race", points: number, currentMonth?: number) => void;
  scoutDriver: () => void;
  scoutNewDriver: () => void;
  signScoutedDriver: (driverId: string, teamId: string) => void;
  signScouted: (driverId: string, teamId: string) => void;
  upgradeFacility: (teamId: string) => void;
  updateStrategy: (teamId: string, strategy: Partial<TeamStrategy>) => void;
  releaseDriver: (teamId: string, driverId: string) => void;
  releaseMotorsportDriver: (teamId: string, driverId: string) => void;
  renewDriverContract: (teamId: string, driverId: string, seasons: number) => void;
  renewMotorsportContract: (teamId: string, driverId: string, seasons: number) => void;
  attractSponsor: (teamId: string, sponsorId: string) => void;
  attractMotorsportSponsor: (teamId: string, sponsorId: string) => void;
  refreshSponsorMarket: () => void;

  // State conversion & snapshots
  getMotorsportState: () => MotorsportState;
  setMotorsportState: (state: Partial<MotorsportState>) => void;
  resetMotorsport: () => void;

  // Selectors / derived
  getAvailableDrivers: () => (RaceDriver & { id: string })[];
  getSummary: () => { totalTeams: number; totalWins: number; totalChampionships: number; techPoolTotal: number };
}

function extractState(state: MotorsportStoreState): MotorsportState {
  return {
    teams: state.teams,
    currentSeason: state.currentSeason,
    techTransferHistory: state.techTransferHistory,
    totalTechTransferred: state.totalTechTransferred,
    scoutedDrivers: state.scoutedDrivers,
    sponsorMarket: state.sponsorMarket,
  };
}

const initialDefault = initialMotorsportState();

export const useMotorsportStore = create<MotorsportStoreState>()(
  persist(
    (set, get) => ({
      teams: initialDefault.teams,
      currentSeason: initialDefault.currentSeason,
      techTransferHistory: initialDefault.techTransferHistory,
      totalTechTransferred: initialDefault.totalTechTransferred,
      scoutedDrivers: initialDefault.scoutedDrivers,
      sponsorMarket: initialDefault.sponsorMarket,
      selectedTeamId: null,

      setSelectedTeamId: (teamId) => set({ selectedTeamId: teamId }),

      createTeam: (name, category, budget, baseVehicleId) => {
        const current = extractState(get());
        const updated = simCreateTeam(current, name, category, budget, baseVehicleId);
        const newTeam = updated.teams[updated.teams.length - 1];
        set({
          teams: updated.teams,
          sponsorMarket: updated.sponsorMarket,
          selectedTeamId: newTeam?.id ?? get().selectedTeamId,
        });
        return newTeam?.id ?? "";
      },

      createMotorsportTeam: (name, category, budget, baseVehicleId) => {
        return get().createTeam(name, category, budget, baseVehicleId);
      },

      assignDriver: (teamId, driverIdx) => {
        const current = extractState(get());
        const updated = simAssignDriver(current, teamId, driverIdx);
        set({ teams: updated.teams });
      },

      assignMotorsportDriver: (teamId, driverIdx) => {
        get().assignDriver(teamId, driverIdx);
      },

      simulateSeason: (power, weight, aeroScore, reliability) => {
        const current = extractState(get());
        const updated = simSimulateSeason(current, power, weight, aeroScore, reliability);
        set({
          teams: updated.teams,
          currentSeason: updated.currentSeason,
          sponsorMarket: updated.sponsorMarket,
        });
      },

      simulateMotorsportSeason: (power, weight, aeroScore, reliability) => {
        get().simulateSeason(power, weight, aeroScore, reliability);
      },

      transferTech: (teamId, direction, points, currentMonth) => {
        const current = extractState(get());
        const month = currentMonth ?? (() => {
          const clock = useSimulationClockStore.getState();
          return (clock.year - 1970) * 12 + (clock.month - 1);
        })();
        const updated = simTransferTech(current, teamId, direction, points, month);
        set({
          teams: updated.teams,
          techTransferHistory: updated.techTransferHistory,
          totalTechTransferred: updated.totalTechTransferred,
        });
      },

      transferMotorsportTech: (teamId, direction, points, currentMonth) => {
        get().transferTech(teamId, direction, points, currentMonth);
      },

      scoutDriver: () => {
        const current = extractState(get());
        const updated = simScoutDriver(current, get().currentSeason);
        set({ scoutedDrivers: updated.scoutedDrivers });
      },

      scoutNewDriver: () => {
        get().scoutDriver();
      },

      signScoutedDriver: (driverId, teamId) => {
        const current = extractState(get());
        const updated = simSignScoutedDriver(current, driverId, teamId);
        set({
          teams: updated.teams,
          scoutedDrivers: updated.scoutedDrivers,
        });
      },

      signScouted: (driverId, teamId) => {
        get().signScoutedDriver(driverId, teamId);
      },

      upgradeFacility: (teamId) => {
        const current = extractState(get());
        const updated = simUpgradeTeamFacility(current, teamId);
        set({ teams: updated.teams });
      },

      updateStrategy: (teamId, strategy) => {
        const current = extractState(get());
        const updated = simUpdateTeamStrategy(current, teamId, strategy);
        set({ teams: updated.teams });
      },

      releaseDriver: (teamId, driverId) => {
        const current = extractState(get());
        const updated = simReleaseDriver(current, teamId, driverId);
        set({ teams: updated.teams });
      },

      releaseMotorsportDriver: (teamId, driverId) => {
        get().releaseDriver(teamId, driverId);
      },

      renewDriverContract: (teamId, driverId, seasons) => {
        const current = extractState(get());
        const updated = simRenewDriverContract(current, teamId, driverId, seasons);
        set({ teams: updated.teams });
      },

      renewMotorsportContract: (teamId, driverId, seasons) => {
        get().renewDriverContract(teamId, driverId, seasons);
      },

      attractSponsor: (teamId, sponsorId) => {
        const current = extractState(get());
        const updated = simAttractSponsor(current, teamId, sponsorId);
        set({
          teams: updated.teams,
          sponsorMarket: updated.sponsorMarket,
        });
      },

      attractMotorsportSponsor: (teamId, sponsorId) => {
        get().attractSponsor(teamId, sponsorId);
      },

      refreshSponsorMarket: () => {
        const current = extractState(get());
        const updated = simGenerateSponsorMarket(current);
        set({ sponsorMarket: updated.sponsorMarket });
      },

      getMotorsportState: () => {
        return extractState(get());
      },

      setMotorsportState: (patch) => {
        set((state) => ({
          ...state,
          ...patch,
        }));
      },

      resetMotorsport: () => {
        const fresh = initialMotorsportState();
        set({
          teams: fresh.teams,
          currentSeason: fresh.currentSeason,
          techTransferHistory: fresh.techTransferHistory,
          totalTechTransferred: fresh.totalTechTransferred,
          scoutedDrivers: fresh.scoutedDrivers,
          sponsorMarket: fresh.sponsorMarket,
          selectedTeamId: null,
        });
      },

      getAvailableDrivers: () => {
        return simGetAvailableDrivers(get().teams);
      },

      getSummary: () => {
        return simGetMotorsportSummary(extractState(get()));
      },
    }),
    {
      name: "apex_motorsport_store",
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        teams: state.teams,
        currentSeason: state.currentSeason,
        techTransferHistory: state.techTransferHistory,
        totalTechTransferred: state.totalTechTransferred,
        scoutedDrivers: state.scoutedDrivers,
        sponsorMarket: state.sponsorMarket,
        selectedTeamId: state.selectedTeamId,
      }),
    }
  )
);

// ── Master Simulation Clock cadence subscription ──
clockListeners.subscribe("month", "motorsportStoreMonthlyTick", (_payload) => {
  const store = useMotorsportStore.getState();
  // Age driver contract months
  let changed = false;
  const updatedTeams = store.teams.map((t) => {
    let teamChanged = false;
    const updatedDrivers = t.drivers.map((d) => {
      if (d.contractMonths > 0) {
        teamChanged = true;
        return { ...d, contractMonths: d.contractMonths - 1 };
      }
      return d;
    });
    if (teamChanged) {
      changed = true;
      return { ...t, drivers: updatedDrivers };
    }
    return t;
  });

  if (changed) {
    useMotorsportStore.setState({ teams: updatedTeams });
  }
});
