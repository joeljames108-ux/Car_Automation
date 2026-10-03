// ===================================================================
// COMPANY CONTEXT — Manages all new game mechanics state
// ===================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { initialEconomyState, advanceEconomy } from "../sim/economyEngine";
import { initialAICompetitors, advanceCompetitors } from "../sim/aiCompetitors";
import { clockListeners } from "./gameClockEngine";
import { useSimulationClockStore } from "./simulationClockStore";
import { useMotorsportStore } from "./motorsportStore";
import type {
  CompanyState, GarageVehicle, VehicleDesign, SimResult,
  VehicleVariantType, TwinEvent,
  VehicleDevelopmentLifecycle, VehicleDevelopmentStep, VehicleDevelopmentLifecycleStage,
  WorkflowPipeline, WorkflowStep, WorkflowStage,
  CustomerFeedback, SalesConfig, SalesResult,
  SafetyConfig, SafetySimResult,
  MotorsportCategory, RaceDriver, TeamStrategy,
} from "../sim/types";

// ---------- Safety Domain (Extracted to safetyStore.ts) ----------
export { simulateSafety, defaultSafetyConfig, useSafetyStore } from "./safetyStore";
import { useSafetyStore } from "./safetyStore";


// ---------- Vehicle Development Lifecycle ----------
// Product-development lifecycle: Where is this vehicle in its development and market lifecycle?
// Distinct from EngineeringPipeline ("What am I configuring in the studio?")

const DEVELOPMENT_LIFECYCLE_STAGES: { stage: VehicleDevelopmentLifecycleStage; monthsRequired: number; skipPenalty: number }[] = [
  { stage: "research", monthsRequired: 2, skipPenalty: 0.15 },
  { stage: "concept", monthsRequired: 1, skipPenalty: 0.10 },
  { stage: "design", monthsRequired: 3, skipPenalty: 0.20 },
  { stage: "simulation", monthsRequired: 1, skipPenalty: 0.12 },
  { stage: "prototype", monthsRequired: 2, skipPenalty: 0.18 },
  { stage: "testing", monthsRequired: 2, skipPenalty: 0.25 },
  { stage: "redesign", monthsRequired: 1, skipPenalty: 0.08 },
  { stage: "manufacturing", monthsRequired: 3, skipPenalty: 0.20 },
  { stage: "sales", monthsRequired: 1, skipPenalty: 0.10 },
  { stage: "feedback", monthsRequired: 2, skipPenalty: 0.05 },
  { stage: "next_gen", monthsRequired: 1, skipPenalty: 0.0 },
];

/** @deprecated Use DEVELOPMENT_LIFECYCLE_STAGES to distinguish from EngineeringPipeline */
const WORKFLOW_STAGES = DEVELOPMENT_LIFECYCLE_STAGES;

function createVehicleLifecycle(vehicleId: string): VehicleDevelopmentLifecycle {
  const steps: VehicleDevelopmentStep[] = DEVELOPMENT_LIFECYCLE_STAGES.map((ws, i) => ({
    stage: ws.stage,
    status: i === 0 ? "available" : "locked",
    startedMonth: null,
    completedMonth: null,
    qualityScore: 0,
    skipPenalty: ws.skipPenalty,
    monthsRequired: ws.monthsRequired,
    monthsSpent: 0,
  }));
  return { vehicleId, steps, currentStage: "research", overallProgress: 0, qualityMultiplier: 1.0 };
}

/** @deprecated Use createVehicleLifecycle */
const createWorkflow = createVehicleLifecycle;

// ---------- Initial company state ----------

function initialCompanyState(): CompanyState {
  return {
    garage: [],
    economy: initialEconomyState(),
    motorsport: useMotorsportStore.getState().getMotorsportState(),
    digitalTwins: {},
    aiCompetitors: initialAICompetitors(),
    competitorActions: [],
    salesData: {},
    customerFeedback: {},
    workflows: {},
    companyName: "My Automotive Co.",
    companyFounded: 0,
    totalRevenue: 0,
    totalProfit: 0,
    reputation: 50,
    employeeCount: 25,
  };
}

// ---------- Context ----------

interface CompanyContextValue {
  company: CompanyState;
  // Garage
  saveToGarage: (design: VehicleDesign, sim: SimResult, modelName: string, variantName: string, variantType: VehicleVariantType, parentId: string | null) => string;
  removeFromGarage: (id: string) => void;
  duplicateVehicle: (id: string, newName: string) => string | null;
  // Economy
  advanceEconomyMonth: () => void;
  // Motorsport
  createMotorsportTeam: (name: string, category: MotorsportCategory, budget: number, baseVehicleId: string | null) => void;
  assignMotorsportDriver: (teamId: string, driverIdx: number) => void;
  simulateMotorsportSeason: (power: number, weight: number, aeroScore: number, reliability: number) => void;
  transferMotorsportTech: (teamId: string, direction: "race_to_production" | "production_to_race", points: number) => void;
  availableDrivers: (RaceDriver & { id: string })[];
  scoutNewDriver: () => void;
  signScouted: (driverId: string, teamId: string) => void;
  upgradeFacility: (teamId: string) => void;
  updateStrategy: (teamId: string, strategy: Partial<TeamStrategy>) => void;
  releaseMotorsportDriver: (teamId: string, driverId: string) => void;
  renewMotorsportContract: (teamId: string, driverId: string, seasons: number) => void;
  attractMotorsportSponsor: (teamId: string, sponsorId: string) => void;
  refreshSponsorMarket: () => void;
  // Digital Twin
  addTwinEvent: (vehicleId: string, event: Omit<TwinEvent, "id">) => void;
  // Safety
  safetyConfig: SafetyConfig;
  safetySim: SafetySimResult;
  updateSafety: (patch: Partial<SafetyConfig>) => void;
  // Vehicle Development Lifecycle (Product-Development Lifecycle)
  startVehicleLifecycle: (vehicleId: string) => void;
  advanceVehicleLifecycleStep: (vehicleId: string) => void;
  skipVehicleLifecycleStep: (vehicleId: string) => void;
  /** @deprecated Use startVehicleLifecycle */
  startWorkflow: (vehicleId: string) => void;
  /** @deprecated Use advanceVehicleLifecycleStep */
  advanceWorkflowStep: (vehicleId: string) => void;
  /** @deprecated Use skipVehicleLifecycleStep */
  skipWorkflowStep: (vehicleId: string) => void;
  // Sales
  launchVehicle: (vehicleId: string, salesConfig: SalesConfig) => void;
  // Company
  setCompanyName: (name: string) => void;
  // Full advance (economy + competitors)
  advanceAllSystems: () => void;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<CompanyState>(() => initialCompanyState());
  const { safetyConfig, safetySim, updateSafety } = useSafetyStore();

  const motorsportStore = useMotorsportStore();
  const motorsportState = useMemo(() => motorsportStore.getMotorsportState(), [
    motorsportStore.teams,
    motorsportStore.currentSeason,
    motorsportStore.techTransferHistory,
    motorsportStore.totalTechTransferred,
    motorsportStore.scoutedDrivers,
    motorsportStore.sponsorMarket,
  ]);

  const effectiveCompany = useMemo(() => ({
    ...company,
    motorsport: motorsportState,
  }), [company, motorsportState]);

  // --- Garage ---
  const saveToGarage = useCallback((
    design: VehicleDesign, sim: SimResult, modelName: string, variantName: string,
    variantType: VehicleVariantType, parentId: string | null,
  ): string => {
    const id = `gv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const parent = parentId ? company.garage.find(v => v.id === parentId) : null;
    const gen = parent ? (variantType === "generation" ? parent.generation + 1 : parent.generation) : 1;
    const vehicle: GarageVehicle = {
      id, name: `${modelName} ${variantName}`, modelName, variantName, variantType, generation: gen,
      design: JSON.parse(JSON.stringify(design)), sim: JSON.parse(JSON.stringify(sim)),
      parentId, childIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      tags: [], notes: "", isLaunched: false, launchMonth: null, discontinuedMonth: null, totalUnitsSold: 0,
      peakPower: sim.peakPower, weight: sim.weight, topSpeed: sim.topSpeed,
      price: sim.targetPrice, overallRating: Math.round(sim.marketRating * 100),
    };
    setCompany(s => {
      const garage = [...s.garage, vehicle];
      // Update parent's childIds
      if (parentId) {
        const pi = garage.findIndex(v => v.id === parentId);
        if (pi >= 0) garage[pi] = { ...garage[pi], childIds: [...garage[pi].childIds, id] };
      }
      return { ...s, garage };
    });
    return id;
  }, [company.garage]);

  const removeFromGarage = useCallback((id: string) => {
    setCompany(s => ({ ...s, garage: s.garage.filter(v => v.id !== id) }));
  }, []);

  const duplicateVehicle = useCallback((id: string, newName: string): string | null => {
    const source = company.garage.find(v => v.id === id);
    if (!source) return null;
    return saveToGarage(source.design, source.sim, source.modelName, newName, "trim", id);
  }, [company.garage, saveToGarage]);

  // --- Economy (Master Clock Authority) ---
  const advanceEconomyMonth = useCallback(() => {
    useSimulationClockStore.getState().advanceMonths(1);
  }, []);

  // --- Motorsport (Delegated to independent motorsportStore) ---
  const createMotorsportTeam = useCallback((name: string, category: MotorsportCategory, budget: number, baseVehicleId: string | null) => {
    useMotorsportStore.getState().createMotorsportTeam(name, category, budget, baseVehicleId);
  }, []);

  const assignMotorsportDriver = useCallback((teamId: string, driverIdx: number) => {
    useMotorsportStore.getState().assignMotorsportDriver(teamId, driverIdx);
  }, []);

  const simulateMotorsportSeason = useCallback((power: number, weight: number, aeroScore: number, reliability: number) => {
    useMotorsportStore.getState().simulateMotorsportSeason(power, weight, aeroScore, reliability);
  }, []);

  const transferMotorsportTech = useCallback((teamId: string, direction: "race_to_production" | "production_to_race", points: number) => {
    useMotorsportStore.getState().transferMotorsportTech(teamId, direction, points);
  }, []);

  const availableDrivers = useMemo(() => useMotorsportStore.getState().getAvailableDrivers(), [motorsportStore.teams]);

  const scoutNewDriver = useCallback(() => {
    useMotorsportStore.getState().scoutNewDriver();
  }, []);

  const signScouted = useCallback((driverId: string, teamId: string) => {
    useMotorsportStore.getState().signScouted(driverId, teamId);
  }, []);

  const upgradeFacility = useCallback((teamId: string) => {
    useMotorsportStore.getState().upgradeFacility(teamId);
  }, []);

  const updateStrategyFn = useCallback((teamId: string, strategy: Partial<TeamStrategy>) => {
    useMotorsportStore.getState().updateStrategy(teamId, strategy);
  }, []);

  const releaseMotorsportDriver = useCallback((teamId: string, driverId: string) => {
    useMotorsportStore.getState().releaseMotorsportDriver(teamId, driverId);
  }, []);

  const renewMotorsportContract = useCallback((teamId: string, driverId: string, seasons: number) => {
    useMotorsportStore.getState().renewMotorsportContract(teamId, driverId, seasons);
  }, []);

  const attractMotorsportSponsor = useCallback((teamId: string, sponsorId: string) => {
    useMotorsportStore.getState().attractMotorsportSponsor(teamId, sponsorId);
  }, []);

  const refreshSponsorMarket = useCallback(() => {
    useMotorsportStore.getState().refreshSponsorMarket();
  }, []);

  // --- Digital Twin ---
  const addTwinEvent = useCallback((vehicleId: string, event: Omit<TwinEvent, "id">) => {
    setCompany(s => {
      const twins = { ...s.digitalTwins };
      if (!twins[vehicleId]) {
        twins[vehicleId] = { vehicleId, events: [], metricsOverTime: [], totalWarrantyClaims: 0, totalUnitsProduced: 0, totalRevenue: 0, lifetimeRating: 50 };
      }
      const id = `te_${Date.now()}_${Math.random().toString(36).slice(2, 4)}`;
      twins[vehicleId] = { ...twins[vehicleId], events: [...twins[vehicleId].events, { ...event, id }] };
      return { ...s, digitalTwins: twins };
    });
  }, []);

  // --- Workflow ---
  const startWorkflow = useCallback((vehicleId: string) => {
    setCompany(s => ({ ...s, workflows: { ...s.workflows, [vehicleId]: createWorkflow(vehicleId) } }));
  }, []);

  const advanceWorkflowStep = useCallback((vehicleId: string) => {
    setCompany(s => {
      const wf = s.workflows[vehicleId];
      if (!wf) return s;
      const steps = [...wf.steps];
      const currentIdx = steps.findIndex(st => st.status === "in_progress" || st.status === "available");
      if (currentIdx < 0) return s;
      steps[currentIdx] = { ...steps[currentIdx], status: "completed", completedMonth: s.economy.month, qualityScore: 85 };
      if (currentIdx + 1 < steps.length) {
        steps[currentIdx + 1] = { ...steps[currentIdx + 1], status: "available" };
      }
      const completed = steps.filter(st => st.status === "completed").length;
      const quality = steps.filter(st => st.status === "completed").reduce((p, st) => p * (st.qualityScore / 100), 1);
      return {
        ...s,
        workflows: {
          ...s.workflows,
          [vehicleId]: { ...wf, steps, currentStage: steps[currentIdx + 1]?.stage || "next_gen", overallProgress: completed / steps.length, qualityMultiplier: quality },
        },
      };
    });
  }, []);

  const skipWorkflowStep = useCallback((vehicleId: string) => {
    setCompany(s => {
      const wf = s.workflows[vehicleId];
      if (!wf) return s;
      const steps = [...wf.steps];
      const currentIdx = steps.findIndex(st => st.status === "available");
      if (currentIdx < 0) return s;
      steps[currentIdx] = { ...steps[currentIdx], status: "skipped", qualityScore: Math.round((1 - steps[currentIdx].skipPenalty) * 100) };
      if (currentIdx + 1 < steps.length) {
        steps[currentIdx + 1] = { ...steps[currentIdx + 1], status: "available" };
      }
      const completed = steps.filter(st => st.status === "completed" || st.status === "skipped").length;
      const quality = steps.filter(st => st.status === "completed" || st.status === "skipped").reduce((p, st) => p * (st.qualityScore / 100), 1);
      return {
        ...s,
        workflows: {
          ...s.workflows,
          [vehicleId]: { ...wf, steps, currentStage: steps[currentIdx + 1]?.stage || "next_gen", overallProgress: completed / steps.length, qualityMultiplier: quality },
        },
      };
    });
  }, []);

  // --- Sales ---
  const launchVehicle = useCallback((vehicleId: string, salesConfig: SalesConfig) => {
    setCompany(s => {
      const gi = s.garage.findIndex(v => v.id === vehicleId);
      if (gi < 0) return s;
      const garage = [...s.garage];
      garage[gi] = { ...garage[gi], isLaunched: true, launchMonth: s.economy.month };

      // Generate initial sales
      const monthlyUnits = Math.round(salesConfig.targetVolume / 12 * (0.7 + Math.random() * 0.6));
      const revenue = monthlyUnits * salesConfig.targetPrice;
      const profit = revenue * (1 - salesConfig.dealerMargin) - garage[gi].sim.totalCost * monthlyUnits;

      const salesResult: SalesResult = {
        vehicleId, month: s.economy.month, unitsSold: monthlyUnits, revenue, profit,
        marketShare: 0.02, customerAcquisitionCost: salesConfig.marketingBudget / Math.max(monthlyUnits, 1),
        breakEvenMonth: null, cumulativeUnits: monthlyUnits, cumulativeRevenue: revenue, cumulativeProfit: profit,
        regionBreakdown: Object.fromEntries(salesConfig.regions.map(r => [r, Math.round(monthlyUnits / salesConfig.regions.length)])),
      };

      const salesData = { ...s.salesData };
      salesData[vehicleId] = [...(salesData[vehicleId] || []), salesResult];

      return { ...s, garage, salesData, totalRevenue: s.totalRevenue + revenue, totalProfit: s.totalProfit + profit };
    });
  }, []);

  // --- Company ---
  const setCompanyName = useCallback((name: string) => {
    setCompany(s => ({ ...s, companyName: name }));
  }, []);

  // --- Advance all systems (Master Clock Authority) ---
  const advanceAllSystems = useCallback(() => {
    useSimulationClockStore.getState().advanceMonths(1);
  }, []);

  // ── Unified Master Game Clock monthly subscription ──
  useEffect(() => {
    return clockListeners.subscribe("month", "companyContextMonthlyTick", (payload) => {
      setCompany(s => {
        const gameMonth = (payload.current.year - 1970) * 12 + (payload.current.month - 1);
        // Macro economy updates on Jan/Jul biannual schedule (months 1 & 7)
        const isBiannualEconomyTick = payload.current.month === 1 || payload.current.month === 7;
        const nextEconomy = isBiannualEconomyTick ? advanceEconomy(s.economy) : { ...s.economy };
        nextEconomy.month = gameMonth;

        const { companies, actions } = advanceCompetitors(s.aiCompetitors, gameMonth, nextEconomy, s.reputation, 0.1);

        // Generate customer feedback for launched vehicles
        const newFeedback = { ...s.customerFeedback };
        for (const v of s.garage.filter(g => g.isLaunched)) {
          const fb: CustomerFeedback = {
            vehicleId: v.id, month: gameMonth,
            satisfaction: Math.round(50 + v.overallRating * 0.4 + (Math.random() - 0.3) * 15),
            reliability: Math.round(60 + v.sim.reliability * 30 + (Math.random() - 0.5) * 10),
            valueForMoney: Math.round(50 + (1 - v.price / 200000) * 30 + (Math.random() - 0.5) * 15),
            performance: Math.round(v.sim.peakPower / 15 + (Math.random() - 0.5) * 10),
            comfort: Math.round(v.sim.comfortRating * 100),
            technology: Math.round(v.sim.infotainment.technologyScore * 100),
            design: Math.round(50 + v.overallRating * 0.3 + (Math.random() - 0.5) * 20),
            complaints: [], praises: [],
            recommendRate: Math.min(0.9, 0.3 + v.overallRating / 200),
            warrantyClaims: Math.round(Math.max(0, (1 - v.sim.reliability) * 5)),
            totalReviews: Math.round(10 + Math.random() * 40),
          };
          newFeedback[v.id] = [...(newFeedback[v.id] || []), fb];
        }

        return {
          ...s,
          economy: nextEconomy,
          aiCompetitors: companies,
          competitorActions: [...s.competitorActions, ...actions].slice(-200),
          customerFeedback: newFeedback,
        };
      });
    });
  }, []);

  const value: CompanyContextValue = useMemo(() => ({
    company: effectiveCompany, saveToGarage, removeFromGarage, duplicateVehicle,
    advanceEconomyMonth, createMotorsportTeam, assignMotorsportDriver,
    simulateMotorsportSeason, transferMotorsportTech, availableDrivers,
    scoutNewDriver, signScouted, upgradeFacility, updateStrategy: updateStrategyFn,
    releaseMotorsportDriver, renewMotorsportContract, attractMotorsportSponsor, refreshSponsorMarket,
    addTwinEvent, safetyConfig, safetySim, updateSafety,
    startVehicleLifecycle: startWorkflow,
    advanceVehicleLifecycleStep: advanceWorkflowStep,
    skipVehicleLifecycleStep: skipWorkflowStep,
    startWorkflow, advanceWorkflowStep, skipWorkflowStep,
    launchVehicle, setCompanyName, advanceAllSystems,
  }), [
    effectiveCompany, saveToGarage, removeFromGarage, duplicateVehicle,
    advanceEconomyMonth, createMotorsportTeam, assignMotorsportDriver,
    simulateMotorsportSeason, transferMotorsportTech, availableDrivers,
    scoutNewDriver, signScouted, upgradeFacility, updateStrategyFn,
    releaseMotorsportDriver, renewMotorsportContract, attractMotorsportSponsor, refreshSponsorMarket,
    addTwinEvent, safetyConfig, safetySim, updateSafety,
    startWorkflow, advanceWorkflowStep, skipWorkflowStep,
    launchVehicle, setCompanyName, advanceAllSystems,
  ]);

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}
