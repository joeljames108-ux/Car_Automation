// ==============================================================================
// COMPANY REPUTATION STORE — ZUSTAND STATE MANAGEMENT
// Master corporate perception state, 17 specialized tracks, 10 audiences,
// 6 contract tiers, emergent design language, live economic calculators,
// Level 1–3 hierarchy, crisis mitigation room, and simulation clock synchronization.
// ==============================================================================

import { create } from "zustand";
import {
  ReputationDimensionKey,
  DimensionScores,
  ComponentReputationRecord,
  VehicleLegacyRecord,
  StakeholderCategoryMap,
  BrandIdentity,
  MarketOpportunity,
  ReputationEventItem,
  AudienceSentiment,
  ContractTierDefinition,
  EmergentDesignLanguage,
  ReputationLevelInfo,
  HiringCostModel,
  ConstructionCostModel,
  SupplierCostModel,
  INITIAL_DIMENSION_SCORES,
  INITIAL_COMPONENT_ACCLAIMS,
  INITIAL_VEHICLE_LEGACIES,
  evaluateStakeholderSentiments,
  deriveBrandIdentity,
  evaluateMarketOpportunities,
  advanceReputationClock,
  calculateOverallReputation,
  getReputationLevel,
  evaluateAudienceSentiments,
  evaluateContractTiers,
  deriveEmergentDesignLanguage,
  calculateHiringEconomics,
  calculateConstructionEconomics,
  calculateSupplierEconomics,
} from "./reputationEngine";
import { useSimulationClockStore } from "./simulationClockStore";
import { clockListeners } from "./gameClockEngine";

export interface ReputationState {
  // 17 Specialized Dimensions Matrix
  dimensions: DimensionScores;

  // Master Overall Corporate Reputation & Level
  overallReputation: number;
  overallLevel: ReputationLevelInfo;

  // 10 Key Audiences Sentiment
  audiences: AudienceSentiment[];

  // 6 Contract Tiers Progression
  contractTiers: ContractTierDefinition[];

  // Emergent Design Language & Aesthetic DNA
  designLanguage: EmergentDesignLanguage;

  // Level 1: Components Acclaim
  components: ComponentReputationRecord[];

  // Level 2: Vehicles Legacy
  vehicles: VehicleLegacyRecord[];

  // Level 3: Emergent Corporate Identity & Stakeholder Sentiments
  stakeholders: StakeholderCategoryMap;
  identity: BrandIdentity;
  opportunities: MarketOpportunity[];

  // Press & Event History
  events: ReputationEventItem[];

  // Economic Model Queries
  getHiringModel: (role?: string, tier?: "Junior" | "Senior" | "Lead" | "Principal" | "Chief Specialist") => HiringCostModel;
  getConstructionModel: (baseQuote?: number) => ConstructionCostModel;
  getSupplierModel: () => SupplierCostModel;

  // Actions
  modifyDimension: (dimension: ReputationDimensionKey, delta: number, reason?: string) => void;
  registerComponentAcclaim: (comp: Omit<ComponentReputationRecord, "id">) => void;
  registerVehicleLegacy: (veh: Omit<VehicleLegacyRecord, "id">) => void;
  triggerReputationShock: (shock: {
    title: string;
    category: ReputationDimensionKey;
    impactType: "positive" | "negative" | "milestone";
    deltas: Partial<Record<ReputationDimensionKey, number>>;
    pressHeadline: string;
    mediaOutlet: string;
  }) => void;
  resolveCrisis: (actionType: "recall_and_warranty" | "quality_taskforce" | "press_rebuttal") => void;
  advanceReputationTime: (days: number) => void;
  resetReputation: () => void;
}

const initialOverall = calculateOverallReputation(INITIAL_DIMENSION_SCORES);
const initialLevel = getReputationLevel(initialOverall);
const initialAudiences = evaluateAudienceSentiments(INITIAL_DIMENSION_SCORES);
const initialContractTiers = evaluateContractTiers(INITIAL_DIMENSION_SCORES, initialOverall);
const initialDesignLanguage = deriveEmergentDesignLanguage(INITIAL_DIMENSION_SCORES);
const initialStakeholders = evaluateStakeholderSentiments(INITIAL_DIMENSION_SCORES);
const initialIdentity = deriveBrandIdentity(INITIAL_DIMENSION_SCORES, 1, 1);
const initialOpportunities = evaluateMarketOpportunities(INITIAL_DIMENSION_SCORES);

const INITIAL_EVENTS: ReputationEventItem[] = [
  {
    id: "evt_founding_1970",
    timestamp: "1 Jan 1970",
    title: "Apex Automotive Founded",
    category: "commercialTrust",
    impactType: "milestone",
    deltas: { commercialTrust: +5, engineering: +5 },
    pressHeadline: "New Independent Manufacturer Apex Automotive Establishes Headquarters",
    mediaOutlet: "Automotive Industry Chronicle",
  },
  {
    id: "evt_first_dyno_1970",
    timestamp: "15 Jan 1970",
    title: "3.2L V8 Engine Fires on Dyno Cell",
    category: "engineering",
    impactType: "positive",
    deltas: { engineering: +3, performance: +2 },
    pressHeadline: "Apex Breathes Fire: Debut V8 Engine Clears 280 HP In High-Stress Proving",
    mediaOutlet: "Motorsport & Engine Technology",
  },
];

export const useReputationStore = create<ReputationState>((set, get) => ({
  dimensions: INITIAL_DIMENSION_SCORES,
  overallReputation: initialOverall,
  overallLevel: initialLevel,
  audiences: initialAudiences,
  contractTiers: initialContractTiers,
  designLanguage: initialDesignLanguage,
  components: INITIAL_COMPONENT_ACCLAIMS,
  vehicles: INITIAL_VEHICLE_LEGACIES,
  stakeholders: initialStakeholders,
  identity: initialIdentity,
  opportunities: initialOpportunities,
  events: INITIAL_EVENTS,

  getHiringModel: (role = "Powertrain Development Engineer", tier = "Lead") => {
    return calculateHiringEconomics(get().dimensions, role, tier);
  },

  getConstructionModel: (baseQuote = 100000000) => {
    return calculateConstructionEconomics(get().dimensions, baseQuote);
  },

  getSupplierModel: () => {
    return calculateSupplierEconomics(get().dimensions);
  },

  modifyDimension: (dimension, delta, reason) => {
    set((state) => {
      const current = state.dimensions[dimension] || { score: 30, trendQuarterly: 0.2, historicalPeak: 30 };
      const newScore = Math.min(100, Math.max(5, Number((current.score + delta).toFixed(1))));
      const newTrend = Number((current.trendQuarterly + delta * 0.1).toFixed(2));
      const newPeak = Math.max(current.historicalPeak, newScore);

      const updatedDimensions: DimensionScores = {
        ...state.dimensions,
        [dimension]: {
          score: newScore,
          trendQuarterly: newTrend,
          historicalPeak: newPeak,
        },
      };

      const overallReputation = calculateOverallReputation(updatedDimensions);
      const overallLevel = getReputationLevel(overallReputation);
      const audiences = evaluateAudienceSentiments(updatedDimensions);
      const contractTiers = evaluateContractTiers(updatedDimensions, overallReputation);
      const designLanguage = deriveEmergentDesignLanguage(updatedDimensions);
      const updatedStakeholders = evaluateStakeholderSentiments(updatedDimensions);
      const updatedIdentity = deriveBrandIdentity(
        updatedDimensions,
        state.vehicles.length,
        Math.max(1, (useSimulationClockStore.getState().year || 1970) - 1970 + 1)
      );
      const updatedOpportunities = evaluateMarketOpportunities(updatedDimensions);



      return {
        dimensions: updatedDimensions,
        overallReputation,
        overallLevel,
        audiences,
        contractTiers,
        designLanguage,
        stakeholders: updatedStakeholders,
        identity: updatedIdentity,
        opportunities: updatedOpportunities,
      };
    });
  },

  registerComponentAcclaim: (compData) => {
    set((state) => {
      const newRecord: ComponentReputationRecord = {
        ...compData,
        id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };

      const dimKey = compData.primaryDimension;
      const currentDim = state.dimensions[dimKey] || { score: 30, trendQuarterly: 0.2, historicalPeak: 30 };
      const boost = compData.tier === "Legendary" ? 4.5 : compData.tier === "Iconic" ? 3.0 : 1.5;
      const newScore = Math.min(100, Number((currentDim.score + boost).toFixed(1)));

      const updatedDimensions: DimensionScores = {
        ...state.dimensions,
        [dimKey]: {
          ...currentDim,
          score: newScore,
          historicalPeak: Math.max(currentDim.historicalPeak, newScore),
        },
      };

      const overallReputation = calculateOverallReputation(updatedDimensions);
      const overallLevel = getReputationLevel(overallReputation);
      const audiences = evaluateAudienceSentiments(updatedDimensions);
      const contractTiers = evaluateContractTiers(updatedDimensions, overallReputation);
      const designLanguage = deriveEmergentDesignLanguage(updatedDimensions);
      const updatedStakeholders = evaluateStakeholderSentiments(updatedDimensions);
      const updatedIdentity = deriveBrandIdentity(
        updatedDimensions,
        state.vehicles.length,
        Math.max(1, (useSimulationClockStore.getState().year || 1970) - 1970 + 1)
      );



      return {
        components: [newRecord, ...state.components],
        dimensions: updatedDimensions,
        overallReputation,
        overallLevel,
        audiences,
        contractTiers,
        designLanguage,
        stakeholders: updatedStakeholders,
        identity: updatedIdentity,
        opportunities: evaluateMarketOpportunities(updatedDimensions),
      };
    });
  },

  registerVehicleLegacy: (vehData) => {
    set((state) => {
      const newRecord: VehicleLegacyRecord = {
        ...vehData,
        id: `veh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };

      const updatedDimensions = { ...state.dimensions };
      const keys: (keyof typeof vehData.scores)[] = ["performance", "reliability", "safety", "luxury", "value"];
      for (const k of keys) {
        const dim = updatedDimensions[k];
        if (dim && vehData.scores[k] !== undefined) {
          const delta = (vehData.scores[k] - 50) * 0.05;
          const newScore = Math.min(100, Math.max(5, Number((dim.score + delta).toFixed(1))));
          updatedDimensions[k] = {
            ...dim,
            score: newScore,
            historicalPeak: Math.max(dim.historicalPeak, newScore),
          };
        }
      }

      const overallReputation = calculateOverallReputation(updatedDimensions);
      const overallLevel = getReputationLevel(overallReputation);
      const audiences = evaluateAudienceSentiments(updatedDimensions);
      const contractTiers = evaluateContractTiers(updatedDimensions, overallReputation);
      const designLanguage = deriveEmergentDesignLanguage(updatedDimensions);
      const updatedStakeholders = evaluateStakeholderSentiments(updatedDimensions);
      const updatedIdentity = deriveBrandIdentity(
        updatedDimensions,
        state.vehicles.length + 1,
        Math.max(1, (useSimulationClockStore.getState().year || 1970) - 1970 + 1)
      );



      return {
        vehicles: [newRecord, ...state.vehicles],
        dimensions: updatedDimensions,
        overallReputation,
        overallLevel,
        audiences,
        contractTiers,
        designLanguage,
        stakeholders: updatedStakeholders,
        identity: updatedIdentity,
        opportunities: evaluateMarketOpportunities(updatedDimensions),
      };
    });
  },

  triggerReputationShock: (shock) => {
    set((state) => {
      const updatedDimensions = { ...state.dimensions };
      for (const [key, delta] of Object.entries(shock.deltas)) {
        const dimKey = key as ReputationDimensionKey;
        const cur = updatedDimensions[dimKey];
        if (cur && delta !== undefined) {
          const newScore = Math.min(100, Math.max(5, Number((cur.score + delta).toFixed(1))));
          updatedDimensions[dimKey] = {
            ...cur,
            score: newScore,
            historicalPeak: Math.max(cur.historicalPeak, newScore),
          };
        }
      }

      const clock = useSimulationClockStore.getState();
      const timestamp = `${clock.day} ${clock.month} ${clock.year}`;

      const eventItem: ReputationEventItem = {
        id: `shock_${Date.now()}`,
        timestamp,
        title: shock.title,
        category: shock.category,
        impactType: shock.impactType,
        deltas: shock.deltas,
        pressHeadline: shock.pressHeadline,
        mediaOutlet: shock.mediaOutlet,
      };

      const overallReputation = calculateOverallReputation(updatedDimensions);
      const overallLevel = getReputationLevel(overallReputation);
      const audiences = evaluateAudienceSentiments(updatedDimensions);
      const contractTiers = evaluateContractTiers(updatedDimensions, overallReputation);
      const designLanguage = deriveEmergentDesignLanguage(updatedDimensions);
      const updatedStakeholders = evaluateStakeholderSentiments(updatedDimensions);
      const updatedIdentity = deriveBrandIdentity(
        updatedDimensions,
        state.vehicles.length,
        Math.max(1, (clock.year || 1970) - 1970 + 1)
      );



      return {
        dimensions: updatedDimensions,
        overallReputation,
        overallLevel,
        audiences,
        contractTiers,
        designLanguage,
        events: [eventItem, ...state.events.slice(0, 49)],
        stakeholders: updatedStakeholders,
        identity: updatedIdentity,
        opportunities: evaluateMarketOpportunities(updatedDimensions),
      };
    });
  },

  resolveCrisis: (actionType) => {
    set((state) => {
      const clock = useSimulationClockStore.getState();
      const timestamp = `${clock.day} ${clock.month} ${clock.year}`;

      let title = "";
      let headline = "";
      const deltas: Partial<Record<ReputationDimensionKey, number>> = {};

      if (actionType === "recall_and_warranty") {
        title = "Global Free Recall & 10-Year Warranty Enacted";
        headline = "Apex Sets Industry Standard with Unprecedented 100% Free Customer Recall";
        deltas.reliability = +12;
        deltas.customerService = +15;
        deltas.commercialTrust = +8;
        deltas.contracts = +6;
      } else if (actionType === "quality_taskforce") {
        title = "Emergency Factory Quality Taskforce Deployed";
        headline = "Apex Halts Assembly for 100% Robotic Calibration and Defect Audit";
        deltas.manufacturingQuality = +10;
        deltas.commercialTrust = +8;
        deltas.industrial = +6;
        deltas.supplier = +5;
      } else if (actionType === "press_rebuttal") {
        title = "Public Telemetry & Proving Ground Briefing";
        headline = "Apex Releases Raw Dyno Benchmarks & Engineering Telemetry to Press";
        deltas.engineering = +6;
        deltas.commercialTrust = +6;
        deltas.employer = +5;
      }

      const updatedDimensions = { ...state.dimensions };
      for (const [k, d] of Object.entries(deltas)) {
        const dimKey = k as ReputationDimensionKey;
        const cur = updatedDimensions[dimKey];
        if (cur && d !== undefined) {
          const newScore = Math.min(100, Math.max(5, Number((cur.score + d).toFixed(1))));
          updatedDimensions[dimKey] = {
            ...cur,
            score: newScore,
            historicalPeak: Math.max(cur.historicalPeak, newScore),
          };
        }
      }

      const eventItem: ReputationEventItem = {
        id: `crisis_res_${Date.now()}`,
        timestamp,
        title,
        category: "customerService",
        impactType: "positive",
        deltas,
        pressHeadline: headline,
        mediaOutlet: "Global Automotive Wire",
      };

      const overallReputation = calculateOverallReputation(updatedDimensions);
      const overallLevel = getReputationLevel(overallReputation);
      const audiences = evaluateAudienceSentiments(updatedDimensions);
      const contractTiers = evaluateContractTiers(updatedDimensions, overallReputation);
      const designLanguage = deriveEmergentDesignLanguage(updatedDimensions);
      const updatedStakeholders = evaluateStakeholderSentiments(updatedDimensions);
      const updatedIdentity = deriveBrandIdentity(
        updatedDimensions,
        state.vehicles.length,
        Math.max(1, (clock.year || 1970) - 1970 + 1)
      );



      return {
        dimensions: updatedDimensions,
        overallReputation,
        overallLevel,
        audiences,
        contractTiers,
        designLanguage,
        events: [eventItem, ...state.events],
        stakeholders: updatedStakeholders,
        identity: updatedIdentity,
        opportunities: evaluateMarketOpportunities(updatedDimensions),
      };
    });
  },

  advanceReputationTime: (days) => {
    if (days <= 0) return;
    set((state) => {
      const clock = useSimulationClockStore.getState();
      const updatedDimensions = advanceReputationClock(state.dimensions, days);
      const overallReputation = calculateOverallReputation(updatedDimensions);
      const overallLevel = getReputationLevel(overallReputation);
      const audiences = evaluateAudienceSentiments(updatedDimensions);
      const contractTiers = evaluateContractTiers(updatedDimensions, overallReputation);
      const designLanguage = deriveEmergentDesignLanguage(updatedDimensions);
      const updatedStakeholders = evaluateStakeholderSentiments(updatedDimensions);
      const updatedIdentity = deriveBrandIdentity(
        updatedDimensions,
        state.vehicles.length,
        Math.max(1, (clock.year || 1970) - 1970 + 1)
      );
      const updatedOpportunities = evaluateMarketOpportunities(updatedDimensions);



      return {
        dimensions: updatedDimensions,
        overallReputation,
        overallLevel,
        audiences,
        contractTiers,
        designLanguage,
        stakeholders: updatedStakeholders,
        identity: updatedIdentity,
        opportunities: updatedOpportunities,
      };
    });
  },

  resetReputation: () => {
    const ov = calculateOverallReputation(INITIAL_DIMENSION_SCORES);
    const lvl = getReputationLevel(ov);
    const aud = evaluateAudienceSentiments(INITIAL_DIMENSION_SCORES);
    const cTiers = evaluateContractTiers(INITIAL_DIMENSION_SCORES, ov);
    const dLang = deriveEmergentDesignLanguage(INITIAL_DIMENSION_SCORES);
    const st = evaluateStakeholderSentiments(INITIAL_DIMENSION_SCORES);
    const id = deriveBrandIdentity(INITIAL_DIMENSION_SCORES, 1, 1);
    const opp = evaluateMarketOpportunities(INITIAL_DIMENSION_SCORES);
    set({
      dimensions: INITIAL_DIMENSION_SCORES,
      overallReputation: ov,
      overallLevel: lvl,
      audiences: aud,
      contractTiers: cTiers,
      designLanguage: dLang,
      components: INITIAL_COMPONENT_ACCLAIMS,
      vehicles: INITIAL_VEHICLE_LEGACIES,
      stakeholders: st,
      identity: id,
      opportunities: opp,
      events: INITIAL_EVENTS,
    });
  },
}));

// Automatic reactive synchronization with Simulation Clock (Daily Cadence)
if (typeof window !== "undefined") {
  clockListeners.subscribe("day", "reputationDailyTick", (payload) => {
    const diff = payload.elapsedDays || 1;
    useReputationStore.getState().advanceReputationTime(diff);
  });
}
