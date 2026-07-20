// ===================================================================
// AI COMPETITORS ENGINE — Living autonomous companies
// ===================================================================

import type {
  AICompanyProfile, AICompetitorVehicle, AICompetitorAction,
  CompetitorStrategy, PlatformType, EconomyState,
} from "./types";

// ---------- Company templates ----------

const COMPANY_TEMPLATES: Omit<AICompanyProfile, "vehicles" | "patents">[] = [
  { id: "apex_motors", name: "Apex Motors", logo: "🔺", color: "#ef4444", strategy: "performance", founded: 0, cash: 500_000_000, brandValue: 65, techLevel: 60, marketShare: 0.12, specialties: ["engine", "aerodynamics"], aggressiveness: 0.7, reactionSpeed: 0.6 },
  { id: "volta_ev", name: "Volta EV", logo: "⚡", color: "#22d3ee", strategy: "innovation", founded: 0, cash: 800_000_000, brandValue: 55, techLevel: 75, marketShare: 0.08, specialties: ["battery", "electronics"], aggressiveness: 0.5, reactionSpeed: 0.8 },
  { id: "meridian_luxury", name: "Meridian", logo: "👑", color: "#d4af37", strategy: "luxury", founded: 0, cash: 1_200_000_000, brandValue: 85, techLevel: 50, marketShare: 0.15, specialties: ["interior", "safety"], aggressiveness: 0.3, reactionSpeed: 0.4 },
  { id: "thunder_auto", name: "Thunder Auto", logo: "🌩️", color: "#f97316", strategy: "performance", founded: 0, cash: 350_000_000, brandValue: 50, techLevel: 55, marketShare: 0.07, specialties: ["engine", "chassis"], aggressiveness: 0.8, reactionSpeed: 0.7 },
  { id: "greenpath", name: "GreenPath", logo: "🌿", color: "#22c55e", strategy: "value", founded: 0, cash: 600_000_000, brandValue: 40, techLevel: 45, marketShare: 0.18, specialties: ["manufacturing", "battery"], aggressiveness: 0.4, reactionSpeed: 0.5 },
  { id: "pinnacle_gt", name: "Pinnacle GT", logo: "🏔️", color: "#8b5cf6", strategy: "balanced", founded: 0, cash: 450_000_000, brandValue: 58, techLevel: 58, marketShare: 0.10, specialties: ["aerodynamics", "chassis"], aggressiveness: 0.6, reactionSpeed: 0.6 },
];

const VEHICLE_NAME_PARTS = {
  performance: { prefix: ["Raptor", "Venom", "Storm", "Blaze", "Fury", "Strike"], suffix: ["RS", "GT-R", "SVR", "Track", "Competition", "EVO"] },
  innovation: { prefix: ["Ion", "Pulse", "Nexus", "Flux", "Arc", "Photon"], suffix: ["E", "EV", "X", "Pro", "Ultra", "Max"] },
  luxury: { prefix: ["Imperial", "Sovereign", "Prestige", "Celestial", "Regalia", "Aurora"], suffix: ["S", "L", "Excellence", "Signature", "Black", "First"] },
  value: { prefix: ["Civic", "Atlas", "Venture", "Terra", "Metro", "Cruise"], suffix: ["SE", "LX", "Plus", "Prime", "Active", "Core"] },
  balanced: { prefix: ["Zenith", "Horizon", "Summit", "Voyager", "Eclipse", "Apex"], suffix: ["Sport", "Touring", "Dynamic", "Elite", "Select", "Premium"] },
};

function seededRandom(month: number, salt: number): number {
  const x = Math.sin(month * 9301 + salt * 49297) * 49297;
  return x - Math.floor(x);
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function generateVehicleName(strategy: CompetitorStrategy, seed: number): string {
  const names = VEHICLE_NAME_PARTS[strategy];
  const pIdx = Math.floor(seededRandom(seed, 1) * names.prefix.length);
  const sIdx = Math.floor(seededRandom(seed, 2) * names.suffix.length);
  return `${names.prefix[pIdx]} ${names.suffix[sIdx]}`;
}

function generateVehicle(company: AICompanyProfile, month: number, seed: number): AICompetitorVehicle {
  const strategy = company.strategy;
  const techMod = company.techLevel / 100;
  const brandMod = company.brandValue / 100;

  const segments: PlatformType[] = ["street_sport", "gt", "supercar", "hypercar"];
  const segIdx = Math.floor(seededRandom(seed, 3) * Math.min(segments.length, 2 + Math.floor(techMod * 3)));
  const segment = segments[segIdx];

  const basePrice: Record<PlatformType, number> = {
    street_sport: 45000, gt: 85000, supercar: 250000, hypercar: 1500000, prototype: 3000000, rally: 55000,
  };

  const basePower: Record<PlatformType, number> = {
    street_sport: 350, gt: 500, supercar: 700, hypercar: 1000, prototype: 1200, rally: 380,
  };

  const price = basePrice[segment] * (0.8 + seededRandom(seed, 4) * 0.4) * (strategy === "luxury" ? 1.3 : strategy === "value" ? 0.8 : 1.0);
  const power = basePower[segment] * (0.85 + techMod * 0.3 + seededRandom(seed, 5) * 0.15);
  const weight = 1200 + (segment === "hypercar" ? 200 : segment === "supercar" ? 400 : 600) + (strategy === "luxury" ? 200 : 0) - techMod * 100;

  return {
    id: `${company.id}_v${month}_${seed}`,
    name: generateVehicleName(strategy, seed + month),
    segment,
    price: Math.round(price),
    power: Math.round(power),
    weight: Math.round(weight),
    topSpeed: Math.round(200 + power * 0.15 - weight * 0.01),
    accel0_100: Math.round((5.5 - power * 0.002 + weight * 0.001) * 100) / 100,
    safetyRating: Math.round(60 + brandMod * 20 + seededRandom(seed, 6) * 20),
    techScore: Math.round(40 + techMod * 40 + seededRandom(seed, 7) * 20),
    customerRating: Math.round(50 + brandMod * 30 + seededRandom(seed, 8) * 20),
    launchMonth: month,
    salesPerMonth: Math.round(50 + brandMod * 200 + seededRandom(seed, 9) * 100),
    isActive: true,
  };
}

// ---------- Initialize ----------

export function initialAICompetitors(): AICompanyProfile[] {
  return COMPANY_TEMPLATES.map((template, i) => {
    const company: AICompanyProfile = { ...template, vehicles: [], patents: [] };
    // Each company starts with 1-2 vehicles
    const count = 1 + Math.floor(seededRandom(0, i * 100) * 2);
    for (let v = 0; v < count; v++) {
      company.vehicles.push(generateVehicle(company, 0, i * 1000 + v));
    }
    return company;
  });
}

// ---------- Monthly tick ----------

export function advanceCompetitors(
  companies: AICompanyProfile[],
  month: number,
  _economy: EconomyState,
  _playerReputation: number,
  playerMarketShare: number,
): { companies: AICompanyProfile[]; actions: AICompetitorAction[] } {
  const actions: AICompetitorAction[] = [];
  const updated = companies.map((company, ci) => {
    const c = { ...company, vehicles: [...company.vehicles], patents: [...company.patents] };

    // Revenue from active vehicles
    const monthlyRevenue = c.vehicles.filter(v => v.isActive).reduce((sum, v) => sum + v.salesPerMonth * v.price * 0.05, 0);
    c.cash += monthlyRevenue;

    // Tech level growth
    c.techLevel = clamp(c.techLevel + seededRandom(month, ci * 10 + 1) * 0.3, 0, 100);

    // Brand value adjusts
    c.brandValue = clamp(c.brandValue + (seededRandom(month, ci * 10 + 2) - 0.48) * 0.5, 10, 100);

    // --- Decision: Launch new vehicle? ---
    const launchChance = 0.04 + c.aggressiveness * 0.03;
    if (seededRandom(month, ci * 100 + 10) < launchChance && c.vehicles.filter(v => v.isActive).length < 5) {
      const newVehicle = generateVehicle(c, month, ci * 1000 + month);
      c.vehicles.push(newVehicle);
      c.cash -= newVehicle.price * 50; // development cost
      actions.push({
        month, companyId: c.id, companyName: c.name,
        type: "launch",
        title: `${c.name} launches ${newVehicle.name}`,
        description: `A new ${newVehicle.segment.replace("_", " ")} with ${Math.round(newVehicle.power)} hp at $${(newVehicle.price / 1000).toFixed(0)}K`,
        impact: `Competing in the ${newVehicle.segment.replace("_", " ")} segment`,
      });
    }

    // --- Decision: Patent something? ---
    if (seededRandom(month, ci * 100 + 20) < 0.02 && c.techLevel > 50) {
      const patentNames = ["Active Suspension Control", "Battery Thermal Management", "AI Driver Assist v2", "Carbon Fiber Process", "Aero Efficiency System", "Smart Manufacturing", "Regenerative Boost", "Predictive Cooling"];
      const patentIdx = Math.floor(seededRandom(month, ci * 100 + 21) * patentNames.length);
      const patentName = patentNames[patentIdx];
      if (!c.patents.includes(patentName)) {
        c.patents.push(patentName);
        c.techLevel = clamp(c.techLevel + 2, 0, 100);
        actions.push({
          month, companyId: c.id, companyName: c.name,
          type: "patent",
          title: `${c.name} patents "${patentName}"`,
          description: `New intellectual property strengthens their technology portfolio`,
          impact: `Tech level increased to ${Math.round(c.techLevel)}`,
        });
      }
    }

    // --- Decision: React to player? ---
    if (playerMarketShare > c.marketShare && seededRandom(month, ci * 100 + 30) < c.reactionSpeed * 0.05) {
      // Price cut on weakest vehicle
      const activeVehicles = c.vehicles.filter(v => v.isActive);
      if (activeVehicles.length > 0) {
        const weakest = activeVehicles.reduce((a, b) => a.salesPerMonth < b.salesPerMonth ? a : b);
        const idx = c.vehicles.findIndex(v => v.id === weakest.id);
        if (idx >= 0) {
          c.vehicles[idx] = { ...weakest, price: Math.round(weakest.price * 0.92), salesPerMonth: Math.round(weakest.salesPerMonth * 1.15) };
          actions.push({
            month, companyId: c.id, companyName: c.name,
            type: "price_cut",
            title: `${c.name} cuts ${weakest.name} price by 8%`,
            description: `Responding to competitive pressure in the market`,
            impact: `Price now $${(c.vehicles[idx].price / 1000).toFixed(0)}K`,
          });
        }
      }
    }

    // --- Decision: Breakthrough? (rare) ---
    if (seededRandom(month, ci * 100 + 40) < 0.008) {
      c.techLevel = clamp(c.techLevel + 5, 0, 100);
      c.brandValue = clamp(c.brandValue + 3, 0, 100);
      const breakthroughs = ["lightweight monocoque design", "next-gen battery cells", "AI-optimized aero package", "revolutionary turbo technology", "adaptive suspension breakthrough"];
      const btIdx = Math.floor(seededRandom(month, ci * 100 + 41) * breakthroughs.length);
      actions.push({
        month, companyId: c.id, companyName: c.name,
        type: "breakthrough",
        title: `${c.name} achieves ${breakthroughs[btIdx]}`,
        description: `Major R&D breakthrough advances their technology significantly`,
        impact: `Tech level now ${Math.round(c.techLevel)}, brand value ${Math.round(c.brandValue)}`,
      });
    }

    // --- Retire old vehicles ---
    c.vehicles = c.vehicles.map(v => {
      if (v.isActive && month - v.launchMonth > 48 + Math.floor(seededRandom(v.launchMonth, ci) * 24)) {
        return { ...v, isActive: false };
      }
      return v;
    });

    // --- Market share calculation ---
    c.marketShare = clamp(
      c.vehicles.filter(v => v.isActive).reduce((s, v) => s + v.salesPerMonth, 0) / 5000,
      0.01, 0.35
    );

    return c;
  });

  return { companies: updated, actions };
}

export function getCompetitorSummary(companies: AICompanyProfile[]): { totalVehicles: number; avgTechLevel: number; totalMarketShare: number; topCompany: string } {
  const active = companies.flatMap(c => c.vehicles.filter(v => v.isActive));
  return {
    totalVehicles: active.length,
    avgTechLevel: Math.round(companies.reduce((s, c) => s + c.techLevel, 0) / companies.length),
    totalMarketShare: companies.reduce((s, c) => s + c.marketShare, 0),
    topCompany: companies.reduce((a, b) => a.marketShare > b.marketShare ? a : b).name,
  };
}
