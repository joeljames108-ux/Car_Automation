// ===================================================================
// COMPANY CONTEXT — Manages all new game mechanics state
// ===================================================================

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { initialEconomyState, advanceEconomy } from "../sim/economyEngine";
import { initialAICompetitors, advanceCompetitors } from "../sim/aiCompetitors";
import { initialMotorsportState, createTeam, assignDriver, simulateSeason, transferTech, getAvailableDrivers } from "../sim/motorsportEngine";
import type {
  CompanyState, GarageVehicle, VehicleDesign, SimResult,
  VehicleVariantType, TwinEvent,
  WorkflowPipeline, WorkflowStep, WorkflowStage,
  CustomerFeedback, SalesConfig, SalesResult,
  SafetyConfig, SafetySimResult,
  MotorsportCategory, RaceDriver,
} from "../sim/types";

// ---------- Safety simulation ----------

const CRUMPLE_SCORES: Record<string, number> = { none: 0, basic: 40, progressive: 65, advanced: 85, adaptive: 95 };
const AIRBAG_SCORES: Record<string, number> = { none: 0, front: 30, front_side: 55, full_curtain: 75, full_360: 90, external: 98 };
const CAGE_SCORES: Record<string, number> = { none: 0, reinforced_pillars: 35, safety_cell: 60, carbon_monocoque: 85, full_cage: 95 };
const BELT_SCORES: Record<string, number> = { three_point: 40, pretensioner: 55, load_limiter: 70, active_belt: 85, four_point: 95 };
const PED_SCORES: Record<string, number> = { none: 0, active_hood: 50, bumper_airbag: 75, full_pedestrian: 95 };

export function simulateSafety(config: SafetyConfig): SafetySimResult {
  const frontCrumple = CRUMPLE_SCORES[config.frontCrumple] || 0;
  const rearCrumple = CRUMPLE_SCORES[config.rearCrumple] || 0;
  const sideCrumple = CRUMPLE_SCORES[config.sideCrumple] || 0;
  const airbag = AIRBAG_SCORES[config.airbagType] || 0;
  const cage = CAGE_SCORES[config.safetyCage] || 0;
  const belt = BELT_SCORES[config.seatbeltType] || 0;
  const ped = PED_SCORES[config.pedestrianSafety] || 0;

  const airbagCountBonus = Math.min(config.airbagCount / 12, 1) * 15;
  const doorBeamBonus = config.doorBeams ? 8 : 0;
  const rolloverBonus = config.rolloverProtection ? 10 : 0;
  const steeringBonus = config.energyAbsorbingSteeringColumn ? 5 : 0;
  const fireBonus = config.fireSuppressionSystem ? 5 : 0;
  const batteryBonus = config.postCrashBatteryDisconnect ? 4 : 0;
  const childAnchors = Math.min(config.childSafetyAnchors / 4, 1) * 100;

  const frontalScore = Math.min((frontCrumple * 0.5 + airbag * 0.25 + cage * 0.15 + belt * 0.1 + airbagCountBonus + steeringBonus), 100);
  const sideScore = Math.min((sideCrumple * 0.4 + airbag * 0.3 + cage * 0.2 + doorBeamBonus + airbagCountBonus), 100);
  const rearScore = Math.min((rearCrumple * 0.5 + cage * 0.2 + belt * 0.2 + fireBonus + batteryBonus) + 10, 100);
  const rolloverScore = Math.min((cage * 0.5 + rolloverBonus * 3 + belt * 0.2), 100);
  const pedestrianScore = Math.min(ped + steeringBonus, 100);

  const overallScore = Math.round(frontalScore * 0.3 + sideScore * 0.25 + rearScore * 0.15 + rolloverScore * 0.15 + pedestrianScore * 0.15);
  const ncapStars = overallScore >= 90 ? 5 : overallScore >= 75 ? 4 : overallScore >= 55 ? 3 : overallScore >= 35 ? 2 : 1;

  // Weight: more safety = more weight
  const baseWeight = 15;
  const crumpleWeight = (frontCrumple + rearCrumple + sideCrumple) / 100 * 30;
  const airbagWeight = config.airbagCount * 1.5;
  const cageWeight = cage / 100 * 45;
  const miscWeight = (config.doorBeams ? 8 : 0) + (config.rolloverProtection ? 12 : 0) + (config.fireSuppressionSystem ? 5 : 0);
  const safetyWeight = Math.round(baseWeight + crumpleWeight + airbagWeight + cageWeight + miscWeight);

  // Cost
  const safetyCost = Math.round(overallScore * 80 + config.airbagCount * 150 + cageWeight * 50 + miscWeight * 30);

  return {
    frontalCrashScore: Math.round(frontalScore),
    sideCrashScore: Math.round(sideScore),
    rearCrashScore: Math.round(rearScore),
    rolloverScore: Math.round(rolloverScore),
    pedestrianScore: Math.round(pedestrianScore),
    childSafetyScore: Math.round(childAnchors),
    overallScore,
    ncapStars,
    safetyWeight,
    safetyCost,
    activeFeatureBonus: 0,
  };
}

// ---------- Default safety config ----------

export function defaultSafetyConfig(): SafetyConfig {
  return {
    frontCrumple: "progressive", rearCrumple: "basic", sideCrumple: "basic",
    airbagType: "front_side", airbagCount: 6, safetyCage: "safety_cell",
    seatbeltType: "pretensioner", pedestrianSafety: "active_hood",
    childSafetyAnchors: 2, rolloverProtection: true, doorBeams: true,
    energyAbsorbingSteeringColumn: true, collapsiblePedals: true,
    fireSuppressionSystem: false, eCallSystem: true, postCrashBatteryDisconnect: false,
  };
}

// ---------- Workflow pipeline ----------

const WORKFLOW_STAGES: { stage: WorkflowStage; monthsRequired: number; skipPenalty: number }[] = [
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

function createWorkflow(vehicleId: string): WorkflowPipeline {
  const steps: WorkflowStep[] = WORKFLOW_STAGES.map((ws, i) => ({
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

// ---------- Initial company state ----------

function initialCompanyState(): CompanyState {
  return {
    garage: [],
    economy: initialEconomyState(),
    motorsport: initialMotorsportState(),
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
  // Digital Twin
  addTwinEvent: (vehicleId: string, event: Omit<TwinEvent, "id">) => void;
  // Safety
  safetyConfig: SafetyConfig;
  safetySim: SafetySimResult;
  updateSafety: (patch: Partial<SafetyConfig>) => void;
  // Workflow
  startWorkflow: (vehicleId: string) => void;
  advanceWorkflowStep: (vehicleId: string) => void;
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
  const [safetyConfig, setSafetyConfig] = useState<SafetyConfig>(() => defaultSafetyConfig());

  const safetySim = useMemo(() => simulateSafety(safetyConfig), [safetyConfig]);

  const updateSafety = useCallback((patch: Partial<SafetyConfig>) => {
    setSafetyConfig(s => ({ ...s, ...patch }));
  }, []);

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

  // --- Economy ---
  const advanceEconomyMonth = useCallback(() => {
    setCompany(s => ({ ...s, economy: advanceEconomy(s.economy) }));
  }, []);

  // --- Motorsport ---
  const createMotorsportTeam = useCallback((name: string, category: MotorsportCategory, budget: number, baseVehicleId: string | null) => {
    setCompany(s => ({ ...s, motorsport: createTeam(s.motorsport, name, category, budget, baseVehicleId) }));
  }, []);

  const assignMotorsportDriver = useCallback((teamId: string, driverIdx: number) => {
    setCompany(s => ({ ...s, motorsport: assignDriver(s.motorsport, teamId, driverIdx) }));
  }, []);

  const simulateMotorsportSeason = useCallback((power: number, weight: number, aeroScore: number, reliability: number) => {
    setCompany(s => ({ ...s, motorsport: simulateSeason(s.motorsport, power, weight, aeroScore, reliability) }));
  }, []);

  const transferMotorsportTech = useCallback((teamId: string, direction: "race_to_production" | "production_to_race", points: number) => {
    setCompany(s => ({ ...s, motorsport: transferTech(s.motorsport, teamId, direction, points, s.economy.month) }));
  }, []);

  const availableDrivers = useMemo(() => getAvailableDrivers(company.motorsport.teams), [company.motorsport.teams]);

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

  // --- Advance all systems ---
  const advanceAllSystems = useCallback(() => {
    setCompany(s => {
      const economy = advanceEconomy(s.economy);
      const { companies, actions } = advanceCompetitors(s.aiCompetitors, economy.month, economy, s.reputation, 0.1);

      // Generate customer feedback for launched vehicles
      const newFeedback = { ...s.customerFeedback };
      for (const v of s.garage.filter(g => g.isLaunched)) {
        const fb: CustomerFeedback = {
          vehicleId: v.id, month: economy.month,
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
        economy,
        aiCompetitors: companies,
        competitorActions: [...s.competitorActions, ...actions].slice(-200),
        customerFeedback: newFeedback,
      };
    });
  }, []);

  const value: CompanyContextValue = {
    company, saveToGarage, removeFromGarage, duplicateVehicle,
    advanceEconomyMonth, createMotorsportTeam, assignMotorsportDriver,
    simulateMotorsportSeason, transferMotorsportTech, availableDrivers,
    addTwinEvent, safetyConfig, safetySim, updateSafety,
    startWorkflow, advanceWorkflowStep, skipWorkflowStep,
    launchVehicle, setCompanyName, advanceAllSystems,
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}
