// ===================================================================
// R&D SYSTEM — ENGINE (progression + bonuses)
// ===================================================================
import type {
  BuildingId, RDBonuses, RDState, ResearchProject, SkunkworksProject,
  TechTreeId, TechnologyId,
} from "./rdTypes";
import {
  BUILDINGS, TECH_BY_ID, TECHNOLOGIES, TREE_TO_BUILDING,
  buildingUpgradeCost, buildingUpgradeMonths,
  ENGINEER_POOL, SKUNKWORKS_TEMPLATES,
} from "./rdData";

// ---------- Validation: can a tech be researched? ----------

export function canResearchTech(state: RDState, techId: TechnologyId): {
  ok: boolean; reasons: string[];
} {
  const reasons: string[] = [];
  const tech = TECH_BY_ID[techId];
  if (!tech) { return { ok: false, reasons: ["Unknown technology"] }; }
  if (state.technologies[techId]?.unlocked) { reasons.push("Already unlocked"); }
  // Prerequisites
  for (const req of tech.requires) {
    if (!state.technologies[req]?.unlocked) reasons.push(`Requires: ${TECH_BY_ID[req]?.name ?? req}`);
  }
  // Building level
  const bId = TREE_TO_BUILDING[tech.tree];
  const b = state.buildings[bId];
  if (b.level < tech.buildingLevel) {
    reasons.push(`Requires ${BUILDINGS.find((x) => x.id === bId)?.name} Lv.${tech.buildingLevel} (current: Lv.${b.level})`);
  }
  // EK
  if (state.engineeringKnowledge < tech.ekCost) {
    reasons.push(`Requires ${tech.ekCost} EK (have ${state.engineeringKnowledge})`);
  }
  // Cash
  if (state.cash < tech.cost) reasons.push(`Requires $${(tech.cost / 1e6).toFixed(0)}M (have $${(state.cash / 1e6).toFixed(0)}M)`);
  // Already active project
  if (state.projects.some((p) => p.techId === techId && p.status === "active")) {
    reasons.push("Already under research");
  }
  return { ok: reasons.length === 0, reasons };
}

// ---------- Start / pause / cancel projects ----------

export function startProject(state: RDState, techId: TechnologyId, scientists: number): RDState {
  const tech = TECH_BY_ID[techId];
  if (!tech) return state;
  const check = canResearchTech(state, techId);
  if (!check.ok) return state;

  const project: ResearchProject = {
    id: `proj_${techId}_${state.month}`,
    techId, tree: tech.tree,
    name: tech.name, description: tech.description,
    cost: tech.cost, monthsTotal: tech.months, monthsElapsed: 0,
    scientistsAssigned: scientists,
    status: "active", phase: "concept",
    failureRisk: tech.failureRisk,
    startedAtMonth: state.month, completedAtMonth: null,
  };

  const log = [...state.log, { month: state.month, text: `Research started: ${tech.name}`, kind: "info" as const }];
  return {
    ...state,
    cash: state.cash - tech.cost,
    engineeringKnowledge: state.engineeringKnowledge - tech.ekCost,
    projects: [...state.projects, project],
    log,
  };
}

export function pauseProject(state: RDState, projectId: string): RDState {
  return { ...state, projects: state.projects.map((p) => p.id === projectId ? { ...p, status: "paused" } : p) };
}
export function resumeProject(state: RDState, projectId: string): RDState {
  return { ...state, projects: state.projects.map((p) => p.id === projectId ? { ...p, status: "active" } : p) };
}
export function cancelProject(state: RDState, projectId: string): RDState {
  const proj = state.projects.find((p) => p.id === projectId);
  if (!proj) return state;
  // Refund 50% of remaining cost
  const remainingMonths = proj.monthsTotal - proj.monthsElapsed;
  const refund = Math.round((proj.cost * remainingMonths / proj.monthsTotal) * 0.5);
  return {
    ...state,
    cash: state.cash + refund,
    projects: state.projects.filter((p) => p.id !== projectId),
    log: [...state.log, { month: state.month, text: `Research cancelled: ${proj.name} (refunded $${(refund / 1e6).toFixed(1)}M)`, kind: "warn" as const }],
  };
}

// ---------- Skunkworks ----------

export function startSkunkworks(state: RDState, templateIdx: number, scientists: number): RDState {
  const tmpl = SKUNKWORKS_TEMPLATES[templateIdx];
  if (!tmpl) return state;
  if (state.cash < tmpl.cost) return state;
  const sw: SkunkworksProject = {
    id: `sw_${templateIdx}_${state.month}`,
    name: tmpl.name, description: tmpl.description, category: tmpl.category,
    cost: tmpl.cost, monthsTotal: tmpl.monthsTotal, monthsElapsed: 0,
    monthsLeft: tmpl.monthsTotal, scientistsAssigned: scientists,
    status: "active", failureRisk: tmpl.failureRisk, startedAtMonth: state.month,
    resultDescription: tmpl.resultDescription,
  };
  return {
    ...state,
    cash: state.cash - tmpl.cost,
    skunkworks: [...state.skunkworks, sw],
    log: [...state.log, { month: state.month, text: `Skunkworks launched: ${tmpl.name}`, kind: "warn" as const }],
  };
}

// ---------- Building upgrades ----------

export function upgradeBuilding(state: RDState, buildingId: BuildingId): RDState {
  const b = state.buildings[buildingId];
  if (b.level >= 10) return state;
  if (b.upgradeMonthsLeft > 0) return state; // already upgrading
  const cost = buildingUpgradeCost(b.level);
  if (state.cash < cost) return state;
  const months = buildingUpgradeMonths(b.level);
  return {
    ...state,
    cash: state.cash - cost,
    buildings: {
      ...state.buildings,
      [buildingId]: { ...b, upgradeMonthsLeft: months, upgradeMonths: months, upgradeCost: buildingUpgradeCost(b.level + 1) },
    },
    log: [...state.log, { month: state.month, text: `Upgrading ${BUILDINGS.find((x) => x.id === buildingId)?.name} to Lv.${b.level + 1}`, kind: "info" as const }],
  };
}

// ---------- Hire / fire engineers ----------

export function hireEngineer(state: RDState, engineerId: string): RDState {
  return {
    ...state,
    engineers: state.engineers.map((e) => e.id === engineerId ? { ...e, hired: true } : e),
    log: [...state.log, { month: state.month, text: `Hired ${state.engineers.find((e) => e.id === engineerId)?.name}`, kind: "success" as const }],
  };
}
export function fireEngineer(state: RDState, engineerId: string): RDState {
  return {
    ...state,
    engineers: state.engineers.map((e) => e.id === engineerId ? { ...e, hired: false } : e),
  };
}

// ---------- Patents ----------

export function patentTech(state: RDState, techId: TechnologyId): RDState {
  const tech = TECH_BY_ID[techId];
  if (!tech) return state;
  if (state.technologies[techId]?.patented) return state;
  const patentCost = Math.round(tech.cost * 0.15);
  if (state.cash < patentCost) return state;
  const royalty = Math.round(tech.cost * 0.005); // per month
  return {
    ...state,
    cash: state.cash - patentCost,
    technologies: { ...state.technologies, [techId]: { ...state.technologies[techId], patented: true } },
    patents: [...state.patents, {
      id: `pat_${techId}_${state.month}`, techId, techName: tech.name,
      filedAtMonth: state.month, yearsActive: 20, royaltyPerMonth: royalty, brandValue: 2,
    }],
    innovationScore: Math.min(100, state.innovationScore + 3),
    brandValue: Math.min(100, state.brandValue + 2),
    log: [...state.log, { month: state.month, text: `Patented: ${tech.name} (+$${royalty}/mo royalty)`, kind: "success" as const }],
  };
}

// ---------- Month advance (the core simulation tick) ----------

function advancePhase(monthsElapsed: number, monthsTotal: number): ResearchProject["phase"] {
  const pct = monthsElapsed / monthsTotal;
  if (pct >= 1) return "production_ready";
  if (pct >= 0.8) return "vehicle_testing";
  if (pct >= 0.6) return "bench_testing";
  if (pct >= 0.35) return "prototype";
  if (pct >= 0.15) return "simulation";
  return "concept";
}

function rand(): number {
  return Math.random();
}

export function advanceMonth(state: RDState): RDState {
  let { cash, engineeringKnowledge, innovationScore, brandValue, month } = state;
  let log = [...state.log];
  month += 1;

  // 1. Monthly income
  const income = state.monthlyRevenue;
  cash += income;

  // 2. Engineer salaries
  const hiredEngineers = state.engineers.filter((e) => e.hired);
  const salaryTotal = hiredEngineers.reduce((s, e) => s + e.salary, 0);
  cash -= salaryTotal;

  // 3. Building upgrades progress
  const buildings = { ...state.buildings };
  for (const bId of Object.keys(buildings) as BuildingId[]) {
    const b = buildings[bId];
    if (b.upgradeMonthsLeft > 0) {
      const left = b.upgradeMonthsLeft - 1;
      if (left <= 0) {
        buildings[bId] = { ...b, level: b.level + 1, upgradeMonthsLeft: 0, upgradeCost: buildingUpgradeCost(b.level + 1), upgradeMonths: buildingUpgradeMonths(b.level + 1) };
        log.push({ month, text: `${BUILDINGS.find((x) => x.id === bId)?.name} upgraded to Lv.${b.level + 1}`, kind: "success" });
        innovationScore = Math.min(100, innovationScore + 1);
      } else {
        buildings[bId] = { ...b, upgradeMonthsLeft: left };
      }
    }
  }

  // 4. Research projects progress
  let projects = state.projects.map((p) => ({ ...p }));
  const techBonus: Record<TechnologyId, number> = {};
  for (const p of projects) {
    if (p.status !== "active") continue;
    // budget bonus: higher budget allocation = faster progress
    const budgetPct = state.budget[p.tree] / 100;
    const speedMult = 0.5 + budgetPct * 2.5; // 0.5x–1.25x roughly
    const tech = TECH_BY_ID[p.techId];
    const scientistRatio = tech ? p.scientistsAssigned / tech.scientists : 1;
    const progress = Math.max(0.5, 1 * speedMult * (0.5 + scientistRatio * 0.5));
    p.monthsElapsed = Math.min(p.monthsTotal, p.monthsElapsed + progress);
    p.phase = advancePhase(p.monthsElapsed, p.monthsElapsed >= p.monthsTotal ? p.monthsTotal : p.monthsTotal);

    if (p.monthsElapsed >= p.monthsTotal) {
      // Completion: roll for failure
      const adjustedRisk = Math.max(0, p.failureRisk - (innovationScore / 100) * 0.1);
      if (rand() < adjustedRisk) {
        p.status = "failed";
        p.completedAtMonth = month;
        engineeringKnowledge += Math.round((TECH_BY_ID[p.techId]?.ekCost ?? 0) * 0.2); // partial EK refund
        log.push({ month, text: `Research FAILED: ${p.name}`, kind: "danger" });
      } else {
        p.status = "complete";
        p.completedAtMonth = month;
        p.resultBonus = 1;
        techBonus[p.techId] = 1;
        engineeringKnowledge += Math.round((TECH_BY_ID[p.techId]?.ekCost ?? 0) * 0.3) + 20;
        innovationScore = Math.min(100, innovationScore + 2);
        log.push({ month, text: `Research COMPLETE: ${p.name} (+${Math.round((TECH_BY_ID[p.techId]?.ekCost ?? 0) * 0.3) + 20} EK)`, kind: "success" });
      }
    }
  }

  // 5. Skunkworks progress
  let skunkworks = state.skunkworks.map((s) => ({ ...s }));
  for (const s of skunkworks) {
    if (s.status !== "active") continue;
    s.monthsElapsed = Math.min(s.monthsTotal, s.monthsElapsed + 1 * (0.5 + (s.scientistsAssigned / 40)));
    s.monthsLeft = Math.max(0, s.monthsTotal - Math.round(s.monthsElapsed));
    if (s.monthsElapsed >= s.monthsTotal) {
      if (rand() < s.failureRisk) {
        s.status = "failed";
        log.push({ month, text: `Skunkworks FAILED: ${s.name}`, kind: "danger" });
        engineeringKnowledge += 50;
      } else {
        s.status = "breakthrough";
        engineeringKnowledge += 200;
        innovationScore = Math.min(100, innovationScore + 8);
        brandValue = Math.min(100, brandValue + 5);
        log.push({ month, text: `BREAKTHROUGH: ${s.name} — ${s.resultDescription}`, kind: "success" });
      }
    }
  }

  // 6. Apply unlocked techs from completed projects
  const technologies = { ...state.technologies };
  for (const p of projects) {
    if (p.status === "complete" && !technologies[p.techId]?.unlocked) {
      technologies[p.techId] = { ...technologies[p.techId], unlocked: true };
    }
  }

  // 7. Patents — collect royalties
  let monthlyRevenue = state.monthlyRevenue;
  const patentRoyalty = state.patents.reduce((s, p) => s + p.royaltyPerMonth, 0);
  cash += patentRoyalty;

  // 8. Brand value drift toward innovation score
  brandValue = Math.round(brandValue * 0.95 + innovationScore * 0.05);

  // keep log bounded
  if (log.length > 200) log = log.slice(-200);

  return {
    ...state,
    month, cash, engineeringKnowledge, innovationScore, brandValue,
    buildings, technologies, projects, skunkworks,
    monthlyRevenue, log,
    lastUpdated: new Date().toISOString(),
  };
}

// ---------- Compute R&D bonuses applied to vehicle simulation ----------

export function computeBonuses(state: RDState): RDBonuses {
  const unlocked: TechnologyId[] = [];
  for (const [id, t] of Object.entries(state.technologies)) {
    if (t.unlocked) unlocked.push(id);
  }

  let powerMult = 1, effMult = 1, reliabilityBonus = 0, weightPct = 0;
  let downforce = 0, drag = 0;
  let costPct = 0, assemblyPct = 0, defectPct = 0;
  let techScore = 0;
  let energyDensity = 1, chargingSpeed = 1;
  let safetyBonus = 0, nvhReduction = 0, predictionAccuracy = 0.5;

  for (const id of unlocked) {
    const tech = TECH_BY_ID[id];
    if (!tech) continue;
    for (const eff of tech.effect) {
      switch (eff.stat) {
        case "power": powerMult *= (1 + eff.magnitude); break;
        case "efficiency": effMult *= (1 + eff.magnitude); break;
        case "reliability": reliabilityBonus += eff.magnitude; break;
        case "weight": weightPct += eff.magnitude; break;
        case "downforce": downforce += eff.magnitude; break;
        case "drag": drag += eff.magnitude; break;
        case "cost": costPct += eff.magnitude; break;
        case "assembly": assemblyPct += eff.magnitude; break;
        case "defect": defectPct += eff.magnitude; break;
        case "techScore": techScore += eff.magnitude; break;
        case "energyDensity": energyDensity *= (1 + eff.magnitude); break;
        case "chargingSpeed": chargingSpeed *= (1 + eff.magnitude); break;
        case "safety": safetyBonus += eff.magnitude; break;
        case "lag": break; // applied in engine UI only
      }
    }
  }

  // Building levels improve prediction accuracy (testing center) and nvh (nvh lab)
  predictionAccuracy = Math.min(0.98, 0.5 + state.buildings.testing_center.level * 0.04);
  nvhReduction = Math.min(0.5, state.buildings.nvh_lab.level * 0.04);

  // Skunkworks breakthroughs
  for (const s of state.skunkworks) {
    if (s.status !== "breakthrough") continue;
    if (s.category === "engine") powerMult *= 1.25;
    if (s.category === "chassis") { weightPct += 0.4; safetyBonus += 0.1; }
    if (s.category === "battery") { energyDensity *= 2; chargingSpeed *= 1.8; }
    if (s.category === "suspension") { safetyBonus += 0.08; }
    if (s.category === "manufacturing") { assemblyPct -= 0.3; costPct -= 0.12; }
  }

  return {
    powerMultiplier: powerMult,
    efficiencyMultiplier: effMult,
    reliabilityBonus: Math.min(0.3, reliabilityBonus),
    weightReductionPct: Math.min(0.6, weightPct),
    downforceBonus: Math.min(1.0, downforce),
    dragReduction: Math.max(-0.3, drag),
    costReductionPct: Math.max(-0.4, costPct),
    assemblyTimeReductionPct: Math.max(-0.5, assemblyPct),
    defectRateReduction: Math.max(-0.8, defectPct),
    techScoreBonus: Math.min(0.5, techScore),
    energyDensityMultiplier: energyDensity,
    chargingSpeedMultiplier: chargingSpeed,
    safetyBonus: Math.min(0.5, safetyBonus),
    nvhReduction,
    predictionAccuracy,
    innovationScore: state.innovationScore,
    brandValue: state.brandValue,
    unlockedTechs: unlocked,
  };
}

// helper to list available (researchable-now) techs by tree
export function techsByTree(tree: TechTreeId): typeof TECHNOLOGIES {
  return TECHNOLOGIES.filter((t) => t.tree === tree);
}

export function projectProgress(p: ResearchProject): number {
  return Math.min(1, p.monthsElapsed / p.monthsTotal);
}

export function monthlySalaryTotal(state: RDState): number {
  return state.engineers.filter((e) => e.hired).reduce((s, e) => s + e.salary, 0);
}

// re-export for convenience
export { ENGINEER_POOL, startSkunkworks as startSkunkworksProject };
