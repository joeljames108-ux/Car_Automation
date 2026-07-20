// ===================================================================
// DYNAMIC ECONOMY ENGINE — Market simulation
// ===================================================================

import type {
  EconomyState, MarketSegmentDemand, Regulation, MarketEvent,
} from "./types";

// ---------- Initial state ----------

const INITIAL_MATERIAL_COSTS = {
  steel: 0.85, aluminum: 2.20, carbon_fiber: 25.0,
  titanium: 15.0, lithium: 12.0, copper: 8.50,
  rare_earth: 45.0, rubber: 1.80,
};

const INITIAL_SEGMENT_DEMAND: MarketSegmentDemand[] = [
  { segment: "street_sport", demand: 0.65, growthRate: 0.01, averagePrice: 45000, competitorCount: 12 },
  { segment: "gt", demand: 0.55, growthRate: 0.005, averagePrice: 85000, competitorCount: 8 },
  { segment: "supercar", demand: 0.35, growthRate: 0.008, averagePrice: 250000, competitorCount: 6 },
  { segment: "hypercar", demand: 0.15, growthRate: 0.012, averagePrice: 1500000, competitorCount: 3 },
  { segment: "prototype", demand: 0.10, growthRate: 0.003, averagePrice: 3000000, competitorCount: 2 },
  { segment: "rally", demand: 0.20, growthRate: -0.002, averagePrice: 55000, competitorCount: 5 },
];

const UPCOMING_REGULATIONS: Regulation[] = [
  { id: "eu_emissions_2026", type: "emissions", name: "EU Euro 7", description: "Stricter emissions limits across EU", effectiveMonth: 12, severity: 0.7, region: "eu", penalty: 50000 },
  { id: "us_cafe_2028", type: "fuel_economy", name: "US CAFE Standards", description: "Fleet fuel economy requirements tightened", effectiveMonth: 36, severity: 0.5, region: "na", penalty: 25000 },
  { id: "eu_ev_2030", type: "ev_mandate", name: "EU EV Mandate 2030", description: "50% of new sales must be EV", effectiveMonth: 60, severity: 0.9, region: "eu", penalty: 100000 },
  { id: "global_safety_2027", type: "safety", name: "Global NCAP Update", description: "Mandatory AEB and lane keep assist", effectiveMonth: 24, severity: 0.6, region: "global", penalty: 35000 },
  { id: "eu_noise_2029", type: "noise", name: "EU Noise Regulation", description: "Exterior noise limits reduced by 3dB", effectiveMonth: 48, severity: 0.4, region: "eu", penalty: 15000 },
  { id: "global_recycling_2031", type: "recycling", name: "Global Recycling Standards", description: "85% recyclability requirement", effectiveMonth: 72, severity: 0.5, region: "global", penalty: 20000 },
];

const EVENT_TEMPLATES: Omit<MarketEvent, "id" | "startMonth">[] = [
  { type: "oil_crisis", name: "Oil Supply Disruption", description: "Global oil supply shortage drives fuel prices up 40%", durationMonths: 8, effects: { fuelPriceMultiplier: 1.4, evDemandBonus: 0.15 } },
  { type: "ev_boom", name: "EV Breakthrough", description: "Battery costs drop sharply, EV demand surges", durationMonths: 12, effects: { evDemandBonus: 0.25, luxuryDemandBonus: -0.05 } },
  { type: "material_shortage", name: "Semiconductor Shortage", description: "Global chip shortage impacts electronics supply", durationMonths: 10, effects: { materialCostMultiplier: 1.3 } },
  { type: "tech_breakthrough", name: "Solid-State Battery Viable", description: "Solid-state batteries reach commercial viability", durationMonths: 6, effects: { evDemandBonus: 0.20 } },
  { type: "recession", name: "Global Economic Slowdown", description: "Consumer spending contracts, luxury demand drops", durationMonths: 14, effects: { luxuryDemandBonus: -0.20, suvDemandBonus: -0.10 } },
  { type: "luxury_boom", name: "Luxury Market Expansion", description: "Wealth growth in emerging markets boosts luxury demand", durationMonths: 10, effects: { luxuryDemandBonus: 0.25 } },
  { type: "suv_craze", name: "SUV & Crossover Surge", description: "Consumer preference shifts heavily toward SUVs", durationMonths: 18, effects: { suvDemandBonus: 0.30 } },
  { type: "green_mandate", name: "Green New Deal", description: "Government incentives for EVs and strict carbon targets", durationMonths: 24, effects: { evDemandBonus: 0.30, fuelPriceMultiplier: 1.15 } },
];

export function initialEconomyState(): EconomyState {
  return {
    month: 0,
    fuelPrice: 3.50,
    fuelPriceHistory: [{ month: 0, price: 3.50 }],
    materialCosts: { ...INITIAL_MATERIAL_COSTS },
    materialCostHistory: [{ month: 0, costs: { ...INITIAL_MATERIAL_COSTS } }],
    segmentDemand: INITIAL_SEGMENT_DEMAND.map(s => ({ ...s })),
    activeRegulations: [],
    upcomingRegulations: UPCOMING_REGULATIONS.map(r => ({ ...r })),
    activeEvents: [],
    eventHistory: [],
    customerPreferences: {
      evAdoption: 0.15,
      suvPreference: 0.45,
      luxuryDemand: 0.30,
      performanceDemand: 0.40,
      safetyPriority: 0.60,
      techPriority: 0.35,
      ecoFriendly: 0.25,
    },
    inflation: 2.5,
    interestRate: 4.0,
    gdpGrowth: 2.0,
  };
}

// ---------- Monthly tick ----------

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function seededRandom(month: number, salt: number): number {
  const x = Math.sin(month * 9301 + salt * 49297) * 49297;
  return x - Math.floor(x);
}

export function advanceEconomy(state: EconomyState): EconomyState {
  const month = state.month + 1;
  const s = { ...state, month };

  // --- Fuel price oscillation ---
  const fuelNoise = (seededRandom(month, 1) - 0.5) * 0.12;
  const fuelTrend = 0.003; // slow upward trend
  let fuelMultiplier = 1.0;
  for (const ev of s.activeEvents) {
    if (ev.effects.fuelPriceMultiplier) fuelMultiplier *= ev.effects.fuelPriceMultiplier;
  }
  s.fuelPrice = clamp(s.fuelPrice * (1 + fuelNoise + fuelTrend) * (fuelMultiplier > 1 ? 1 + (fuelMultiplier - 1) * 0.1 : 1), 1.50, 8.00);
  s.fuelPriceHistory = [...s.fuelPriceHistory, { month, price: s.fuelPrice }].slice(-120);

  // --- Material cost fluctuation ---
  let matMultiplier = 1.0;
  for (const ev of s.activeEvents) {
    if (ev.effects.materialCostMultiplier) matMultiplier *= ev.effects.materialCostMultiplier;
  }
  const newMats = { ...s.materialCosts };
  for (const key of Object.keys(newMats) as (keyof typeof newMats)[]) {
    const noise = (seededRandom(month, key.length * 7) - 0.5) * 0.05;
    const base = INITIAL_MATERIAL_COSTS[key];
    newMats[key] = clamp(
      newMats[key] * (1 + noise) * (matMultiplier > 1 ? 1 + (matMultiplier - 1) * 0.05 : 1),
      base * 0.5,
      base * 3.0
    );
  }
  s.materialCosts = newMats;
  s.materialCostHistory = [...s.materialCostHistory, { month, costs: { ...newMats } }].slice(-120);

  // --- Customer preference evolution ---
  const prefs = { ...s.customerPreferences };
  prefs.evAdoption = clamp(prefs.evAdoption + 0.002 + (seededRandom(month, 10) - 0.48) * 0.005, 0, 1);
  prefs.suvPreference = clamp(prefs.suvPreference + (seededRandom(month, 20) - 0.5) * 0.008, 0.1, 0.8);
  prefs.luxuryDemand = clamp(prefs.luxuryDemand + (seededRandom(month, 30) - 0.5) * 0.006, 0.1, 0.7);
  prefs.performanceDemand = clamp(prefs.performanceDemand + (seededRandom(month, 40) - 0.5) * 0.004, 0.2, 0.8);
  prefs.safetyPriority = clamp(prefs.safetyPriority + 0.001, 0.3, 0.95);
  prefs.techPriority = clamp(prefs.techPriority + 0.0015, 0.1, 0.9);
  prefs.ecoFriendly = clamp(prefs.ecoFriendly + 0.002, 0.05, 0.9);

  // Apply event effects to preferences
  for (const ev of s.activeEvents) {
    if (ev.effects.evDemandBonus) prefs.evAdoption = clamp(prefs.evAdoption + ev.effects.evDemandBonus * 0.01, 0, 1);
    if (ev.effects.luxuryDemandBonus) prefs.luxuryDemand = clamp(prefs.luxuryDemand + ev.effects.luxuryDemandBonus * 0.01, 0, 1);
    if (ev.effects.suvDemandBonus) prefs.suvPreference = clamp(prefs.suvPreference + ev.effects.suvDemandBonus * 0.01, 0, 1);
  }
  s.customerPreferences = prefs;

  // --- Segment demand updates ---
  s.segmentDemand = s.segmentDemand.map(seg => ({
    ...seg,
    demand: clamp(seg.demand + seg.growthRate * 0.1 + (seededRandom(month, seg.segment.length * 13) - 0.5) * 0.02, 0.05, 1.0),
    averagePrice: seg.averagePrice * (1 + s.inflation / 1200),
  }));

  // --- Regulation phase-in ---
  const nowActive: Regulation[] = [];
  const stillUpcoming: Regulation[] = [];
  for (const reg of s.upcomingRegulations) {
    if (month >= reg.effectiveMonth) {
      nowActive.push(reg);
    } else {
      stillUpcoming.push(reg);
    }
  }
  s.activeRegulations = [...s.activeRegulations, ...nowActive];
  s.upcomingRegulations = stillUpcoming;

  // --- Event lifecycle ---
  const stillActive: MarketEvent[] = [];
  for (const ev of s.activeEvents) {
    if (month < ev.startMonth + ev.durationMonths) {
      stillActive.push(ev);
    } else {
      s.eventHistory = [...s.eventHistory, ev];
    }
  }
  s.activeEvents = stillActive;

  // --- Random new events (low probability) ---
  if (seededRandom(month, 99) < 0.06 && s.activeEvents.length < 3) {
    const templateIdx = Math.floor(seededRandom(month, 77) * EVENT_TEMPLATES.length);
    const template = EVENT_TEMPLATES[templateIdx];
    // Don't repeat same type within 12 months
    const recentTypes = s.activeEvents.map(e => e.type);
    const recentHistory = s.eventHistory.filter(e => month - (e.startMonth + e.durationMonths) < 12).map(e => e.type);
    if (!recentTypes.includes(template.type) && !recentHistory.includes(template.type)) {
      s.activeEvents = [...s.activeEvents, { ...template, id: `ev_${month}_${templateIdx}`, startMonth: month }];
    }
  }

  // --- Macro indicators ---
  s.inflation = clamp(s.inflation + (seededRandom(month, 55) - 0.5) * 0.3, 0.5, 8.0);
  s.interestRate = clamp(s.interestRate + (seededRandom(month, 66) - 0.5) * 0.2, 1.0, 12.0);
  s.gdpGrowth = clamp(s.gdpGrowth + (seededRandom(month, 88) - 0.5) * 0.4, -3.0, 6.0);

  return s;
}

export function getEconomyInsights(state: EconomyState): { title: string; description: string; severity: "info" | "warning" | "success" }[] {
  const insights: { title: string; description: string; severity: "info" | "warning" | "success" }[] = [];

  if (state.fuelPrice > 5.0) insights.push({ title: "High Fuel Prices", description: `Fuel at $${state.fuelPrice.toFixed(2)}/gal — EV demand rising`, severity: "warning" });
  if (state.customerPreferences.evAdoption > 0.5) insights.push({ title: "EV Tipping Point", description: "Over 50% of customers prefer electric vehicles", severity: "info" });
  if (state.inflation > 5) insights.push({ title: "High Inflation", description: `Inflation at ${state.inflation.toFixed(1)}% — material costs rising`, severity: "warning" });
  if (state.gdpGrowth < 0) insights.push({ title: "Recession Warning", description: `GDP growth at ${state.gdpGrowth.toFixed(1)}%`, severity: "warning" });
  if (state.activeRegulations.length > 3) insights.push({ title: "Heavy Regulation", description: `${state.activeRegulations.length} active regulations affecting design`, severity: "warning" });
  if (state.customerPreferences.safetyPriority > 0.8) insights.push({ title: "Safety-First Market", description: "Customers heavily prioritize safety features", severity: "info" });
  if (state.activeEvents.length > 0) insights.push({ title: "Market Events Active", description: state.activeEvents.map(e => e.name).join(", "), severity: "info" });

  return insights;
}
