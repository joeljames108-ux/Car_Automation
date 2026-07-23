// ===================================================================
// MOTORSPORT ENGINE — Season simulation, tech transfer, guides, regs
// ===================================================================

import type {
  MotorsportState, MotorsportTeam, MotorsportCategory, SeasonResult,
  RaceDriver, TrackId, TeamStatus, TeamStrategy, MotorsportRegulation,
  CategoryGuide, ComplianceResult, ChampionshipStanding,
  DriverDevelopmentLog, FacilityLevel, TireChoice, Sponsor, SponsorTier,
} from "./types";

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function seededRandom(seed: number, salt: number): number {
  const x = Math.sin(seed * 9301 + salt * 49297) * 49297;
  return x - Math.floor(x);
}

// ---------- Category Regulations ----------

export const CATEGORY_REGULATIONS: Record<MotorsportCategory, MotorsportRegulation> = {
  gt: {
    category: "gt", minWeightKg: 1250, maxPowerHp: 600, maxFuelFlowKgH: 0,
    mandatoryPitStops: 1, tireCompoundsAllowed: ["soft", "medium", "hard"],
    maxTireSetsPerRace: 4, evRequirement: false, minDriversPerTeam: 1,
    maxDriversPerTeam: 2, bopEnabled: true, maxBudgetCap: 0,
    fuelCapacityLiters: 100, restrictorPlate: false,
  },
  formula: {
    category: "formula", minWeightKg: 798, maxPowerHp: 1000, maxFuelFlowKgH: 100,
    mandatoryPitStops: 1, tireCompoundsAllowed: ["soft", "medium", "hard", "intermediate", "wet"],
    maxTireSetsPerRace: 6, evRequirement: true, minDriversPerTeam: 1,
    maxDriversPerTeam: 1, bopEnabled: false, maxBudgetCap: 140_000_000,
    fuelCapacityLiters: 110, restrictorPlate: false,
  },
  hypercar: {
    category: "hypercar", minWeightKg: 1030, maxPowerHp: 700, maxFuelFlowKgH: 80,
    mandatoryPitStops: 2, tireCompoundsAllowed: ["medium", "hard", "wet"],
    maxTireSetsPerRace: 8, evRequirement: true, minDriversPerTeam: 2,
    maxDriversPerTeam: 2, bopEnabled: true, maxBudgetCap: 0,
    fuelCapacityLiters: 90, restrictorPlate: false,
  },
  touring: {
    category: "touring", minWeightKg: 1250, maxPowerHp: 350, maxFuelFlowKgH: 0,
    mandatoryPitStops: 0, tireCompoundsAllowed: ["medium", "hard"],
    maxTireSetsPerRace: 3, evRequirement: false, minDriversPerTeam: 1,
    maxDriversPerTeam: 1, bopEnabled: true, maxBudgetCap: 0,
    fuelCapacityLiters: 60, restrictorPlate: true,
  },
  rally: {
    category: "rally", minWeightKg: 1190, maxPowerHp: 380, maxFuelFlowKgH: 0,
    mandatoryPitStops: 0, tireCompoundsAllowed: ["soft", "medium", "hard", "wet"],
    maxTireSetsPerRace: 6, evRequirement: true, minDriversPerTeam: 1,
    maxDriversPerTeam: 1, bopEnabled: false, maxBudgetCap: 0,
    fuelCapacityLiters: 55, restrictorPlate: false,
  },
  endurance: {
    category: "endurance", minWeightKg: 930, maxPowerHp: 680, maxFuelFlowKgH: 90,
    mandatoryPitStops: 4, tireCompoundsAllowed: ["medium", "hard", "wet"],
    maxTireSetsPerRace: 12, evRequirement: true, minDriversPerTeam: 2,
    maxDriversPerTeam: 2, bopEnabled: true, maxBudgetCap: 0,
    fuelCapacityLiters: 90, restrictorPlate: false,
  },
};

// ---------- Category Guides ----------

export const CATEGORY_GUIDES: Record<MotorsportCategory, CategoryGuide> = {
  gt: {
    category: "gt",
    name: "GT Series",
    description: "Grand Touring races feature production-based sports cars competing on circuits. The cars must retain their road-legal silhouette while being extensively modified for racing. Balance of Performance (BoP) regulations ensure close competition between different manufacturers.",
    iconicRaces: ["Bathurst 12 Hour", "Spa 24 Hours", "Nürburgring 24 Hours"],
    realWorldSeries: ["GT World Challenge", "IMSA GTD", "Super GT"],
    difficulty: 2,
    prestigeTier: 3,
    budgetRange: [10_000_000, 35_000_000],
    keyConsiderations: [
      "BoP adjustments will limit your car's advantages — focus on consistency",
      "Driver skill matters enormously in close GT racing",
      "Endurance variants require strong reliability",
      "Tire management is critical for long stints",
    ],
    recommendedSpecs: {
      powerRange: [450, 600],
      weightRange: [1250, 1400],
      aeroImportance: "medium",
      reliabilityImportance: "high",
    },
    strategyTips: [
      "Prioritize medium-compound tires for consistent lap times",
      "Don't over-invest in raw power — BoP will claw it back",
      "A reliable car finishes races; a fast but fragile one doesn't",
      "Night-racing experience gives significant advantage at 24h events",
    ],
  },
  formula: {
    category: "formula",
    name: "Formula Racing",
    description: "The pinnacle of single-seater racing. Open-wheeled cars with cutting-edge aerodynamics, hybrid powertrains, and extreme performance. Formula racing demands the ultimate in engineering precision, with strict technical regulations governing every component.",
    iconicRaces: ["Monaco Grand Prix", "Monza", "Silverstone Grand Prix"],
    realWorldSeries: ["Formula 1", "Formula 2", "Formula E", "IndyCar"],
    difficulty: 5,
    prestigeTier: 5,
    budgetRange: [50_000_000, 140_000_000],
    keyConsiderations: [
      "Aerodynamics dominate — downforce is everything on most circuits",
      "Hybrid energy deployment strategy can make or break a race",
      "Budget cap forces difficult trade-offs between car and team development",
      "Tire degradation management separates winners from also-rans",
      "Qualifying pace determines strategy options",
    ],
    recommendedSpecs: {
      powerRange: [800, 1000],
      weightRange: [798, 850],
      aeroImportance: "critical",
      reliabilityImportance: "high",
    },
    strategyTips: [
      "Invest heavily in wind tunnel and CFD time",
      "Master DRS zones and overtaking opportunities",
      "One-stop strategies are often optimal on low-degradation tracks",
      "Undercut strategy on fresh tires can gain 2-3 positions",
      "Hybrid deploy mode must adapt to each circuit's characteristics",
    ],
  },
  hypercar: {
    category: "hypercar",
    name: "Hypercar / WEC",
    description: "The World Endurance Championship's top class features bespoke hypercars and Le Mans Daytona hybrid prototypes. These machines blend extreme speed with endurance reliability, racing for up to 24 hours at Le Mans. Hybrid systems are mandatory, adding strategic depth.",
    iconicRaces: ["24 Hours of Le Mans", "6 Hours of Spa", "1000 Miles of Sebring"],
    realWorldSeries: ["WEC Hypercar", "IMSA GTP"],
    difficulty: 4,
    prestigeTier: 5,
    budgetRange: [30_000_000, 80_000_000],
    keyConsiderations: [
      "Le Mans demands a unique balance of straight-line speed and fuel efficiency",
      "Night racing in the rain is common — driver wet skill is crucial",
      "Hybrid energy recovery and deployment is a key differentiator",
      "Reliability over 24 hours is non-negotiable",
      "Pit stop efficiency can decide close races",
    ],
    recommendedSpecs: {
      powerRange: [650, 700],
      weightRange: [1030, 1100],
      aeroImportance: "high",
      reliabilityImportance: "critical",
    },
    strategyTips: [
      "Optimize fuel consumption for fewer pit stops at Le Mans",
      "Hire two drivers with complementary skills (one for wet, one for night)",
      "Invest in pit crew training for faster stops",
      "Balance downforce for Le Mans' long straights vs. technical sections",
      "EV-only mode through pit lane saves fuel and time",
    ],
  },
  touring: {
    category: "touring",
    name: "Touring Car",
    description: "Close-quarters racing with production-based sedans and hatchbacks. Touring cars are heavily restricted for parity, creating incredibly close racing with frequent contact. Door-to-door battles, aggressive overtakes, and drama define this category.",
    iconicRaces: ["Bathurst 1000", "Nürburgring Nordschleife", "Macau Grand Prix"],
    realWorldSeries: ["WTCR", "BTCC", "DTM", "Supercars Championship"],
    difficulty: 2,
    prestigeTier: 2,
    budgetRange: [5_000_000, 20_000_000],
    keyConsiderations: [
      "Restrictor plates limit power — chassis setup and driver aggression matter more",
      "Contact is expected — build a robust car",
      "Success ballast rewards consistency over outright speed",
      "Tight circuits favor nimble, lightweight cars",
    ],
    recommendedSpecs: {
      powerRange: [280, 350],
      weightRange: [1250, 1350],
      aeroImportance: "low",
      reliabilityImportance: "medium",
    },
    strategyTips: [
      "An aggressive driver can exploit close racing for overtakes",
      "Focus on mechanical grip rather than aerodynamic downforce",
      "Protect your car in early laps — points are scored at the finish",
      "Qualifying position is less important than race pace",
    ],
  },
  rally: {
    category: "rally",
    name: "Rally Championship",
    description: "Point-to-point racing on closed public roads through forests, mountains, deserts, and snow. Rally cars must handle every surface from tarmac to gravel to ice. It's the ultimate test of car-driver synergy, with each special stage presenting unique challenges.",
    iconicRaces: ["Rally Monte Carlo", "Safari Rally", "Rally Finland"],
    realWorldSeries: ["WRC", "WRC2", "ERC", "ARA"],
    difficulty: 3,
    prestigeTier: 3,
    budgetRange: [8_000_000, 30_000_000],
    keyConsiderations: [
      "Suspension travel and robustness are critical for survival on rough stages",
      "Hybrid systems are now mandatory in top-tier rally (WRC1)",
      "Co-driver calls (pace notes) directly affect stage times",
      "Each rally surface demands a different setup philosophy",
      "Service park time is limited — plan repairs carefully",
    ],
    recommendedSpecs: {
      powerRange: [350, 380],
      weightRange: [1190, 1300],
      aeroImportance: "low",
      reliabilityImportance: "critical",
    },
    strategyTips: [
      "Build the most reliable car possible — retirement is the biggest enemy",
      "Prioritize driver wet/dirt skill for unpredictable conditions",
      "Lighter cars accelerate faster through technical stages",
      "Don't neglect cooling — engines overheat on desert stages",
      "Hybrid deploy on stage exits for maximum acceleration",
    ],
  },
  endurance: {
    category: "endurance",
    name: "Endurance Racing",
    description: "Multi-hour races that push every component to its limits. From 6-hour sprints to 24-hour marathons, endurance racing demands total package excellence: speed, reliability, fuel efficiency, tire management, and teamwork across multiple driver stints.",
    iconicRaces: ["24 Hours of Le Mans", "24 Hours of Daytona", "12 Hours of Sebring"],
    realWorldSeries: ["WEC", "IMSA WeatherTech", "European Le Mans Series"],
    difficulty: 4,
    prestigeTier: 4,
    budgetRange: [15_000_000, 60_000_000],
    keyConsiderations: [
      "Every component must survive thousands of km of racing",
      "Driver rotation strategy affects lap time consistency",
      "Fuel economy directly translates to fewer stops and more track time",
      "Night and rain conditions will inevitably occur in 24h races",
      "Class traffic management is a skill in itself",
    ],
    recommendedSpecs: {
      powerRange: [500, 680],
      weightRange: [930, 1100],
      aeroImportance: "high",
      reliabilityImportance: "critical",
    },
    strategyTips: [
      "Optimize for fuel per stint — one fewer pit stop wins races",
      "Two strong drivers are better than one superstar and one weak link",
      "Build in reliability margin — pushing limits causes late-race failures",
      "Practice driver changeovers for faster pit stops",
      "Use conservative deploy modes to preserve battery for full distance",
    ],
  },
};

// ---------- Driver pool ----------

const DRIVER_POOL: Omit<RaceDriver, "id">[] = [
  { name: "Max Hartley", nationality: "GB", skill: 88, experience: 75, consistency: 82, wetSkill: 78, aggression: 70, salary: 2_000_000, contractMonths: 24, contractEndSeason: 0 },
  { name: "Carlos Vieira", nationality: "BR", skill: 85, experience: 80, consistency: 85, wetSkill: 90, aggression: 60, salary: 1_800_000, contractMonths: 24, contractEndSeason: 0 },
  { name: "Yuki Tanaka", nationality: "JP", skill: 82, experience: 60, consistency: 78, wetSkill: 75, aggression: 65, salary: 1_200_000, contractMonths: 12, contractEndSeason: 0 },
  { name: "Lena Eriksson", nationality: "SE", skill: 90, experience: 85, consistency: 88, wetSkill: 85, aggression: 55, salary: 3_000_000, contractMonths: 36, contractEndSeason: 0 },
  { name: "Ahmed Rashid", nationality: "AE", skill: 75, experience: 50, consistency: 70, wetSkill: 60, aggression: 80, salary: 800_000, contractMonths: 12, contractEndSeason: 0 },
  { name: "Pierre Dubois", nationality: "FR", skill: 80, experience: 70, consistency: 80, wetSkill: 82, aggression: 50, salary: 1_500_000, contractMonths: 24, contractEndSeason: 0 },
  { name: "Sofia Romano", nationality: "IT", skill: 86, experience: 65, consistency: 84, wetSkill: 80, aggression: 68, salary: 1_600_000, contractMonths: 24, contractEndSeason: 0 },
  { name: "Jin Wei", nationality: "CN", skill: 78, experience: 55, consistency: 75, wetSkill: 70, aggression: 72, salary: 1_000_000, contractMonths: 12, contractEndSeason: 0 },
  { name: "Oliver Schmidt", nationality: "DE", skill: 83, experience: 78, consistency: 86, wetSkill: 76, aggression: 58, salary: 1_700_000, contractMonths: 24, contractEndSeason: 0 },
  { name: "Ava Mitchell", nationality: "US", skill: 79, experience: 45, consistency: 73, wetSkill: 68, aggression: 75, salary: 900_000, contractMonths: 12, contractEndSeason: 0 },
];

// Young talent pool for scouting
const YOUNG_TALENT_NAMES = [
  "Kai Andersen", "Mia Chen", "Lucas Ferreira", "Emma Johansson",
  "Ravi Patel", "Liam O'Brien", "Sakura Yamamoto", "Noah Lefèvre",
  "Zara Al-Mansur", "Tomás Herrera", "Freya Björk", "Arjun Singh",
  "Isla MacDonald", "Felix Baumann", "Amara Okafor", "Hugo Delacroix",
];
const NATIONALITIES = ["GB", "US", "JP", "DE", "BR", "FR", "IT", "SE", "AE", "CN", "IN", "AU", "KR", "NL", "ES", "FI"];

// ---------- Sponsor pool ----------

const SPONSOR_NAMES: Record<SponsorTier, { names: string[]; emojis: string[]; revenueRange: [number, number] }> = {
  title: {
    names: ["Apex Dynamics", "Horizon Corp", "Velocity Global", "Nexus Industries", "Prime Energy", "Titan Motors"],
    emojis: ["🏢", "⚡", "🌐", "💎", "🔥", "🏛️"],
    revenueRange: [8_000_000, 25_000_000],
  },
  major: {
    names: ["TechFlow", "CoreSync", "AirMax Pro", "DataDrive", "SpeedLine", "FuelTech", "GridForce", "NovaChem"],
    emojis: ["💻", "🔧", "🛞", "📊", "⚙️", "⛽", "🔌", "🧪"],
    revenueRange: [3_000_000, 10_000_000],
  },
  minor: {
    names: ["PitLane Gear", "Trackside Apparel", "RaceWear", "GridSnap Media", "MotoFuel", "CircuitBrew"],
    emojis: ["👕", "📸", "🎽", "📱", "🍺", "☕"],
    revenueRange: [500_000, 3_000_000],
  },
  technical: {
    names: ["BrakeTech Solutions", "AeroFlow R&D", "TelemetryPro", "DataLogger Systems", "SimuTech", "DynoWorks"],
    emojis: ["🔩", "🌀", "📡", "💾", "🖥️", "⚗️"],
    revenueRange: [1_000_000, 5_000_000],
  },
};

// ---------- Default strategy ----------

export function defaultStrategy(): TeamStrategy {
  return {
    pitStopCount: 1,
    tireStrategy: ["medium", "hard"],
    fuelLoad: 0.8,
    deployMode: "balanced",
    driverStints: [50, 50],
    wetStrategy: "immediate_pit",
    undercut: false,
    overcut: false,
  };
}

// ---------- Season calendar ----------

const SEASON_CALENDARS: Record<MotorsportCategory, { rounds: number; tracks: TrackId[] }> = {
  gt: { rounds: 8, tracks: ["monza", "spa", "silverstone", "nurburgring", "suzuka", "interlagos", "bathurst", "redbullring"] },
  formula: { rounds: 10, tracks: ["monza", "spa", "silverstone", "suzuka", "interlagos", "monaco", "americas", "hungaroring", "zandvoort", "redbullring"] },
  hypercar: { rounds: 6, tracks: ["lemans", "spa", "monza", "sebring", "fuji", "interlagos"] },
  touring: { rounds: 8, tracks: ["nurburgring", "hungaroring", "zandvoort", "imola", "redbullring", "silverstone", "bathurst", "suzuka"] },
  rally: { rounds: 6, tracks: ["nurburgring", "bathurst", "interlagos", "suzuka", "silverstone", "americas"] },
  endurance: { rounds: 4, tracks: ["lemans", "spa", "sebring", "fuji"] },
};

const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const FACILITY_BONUSES: Record<FacilityLevel, number> = {
  basic: 0, standard: 5, advanced: 12, elite: 22,
};

const FACILITY_UPGRADE_COSTS: Record<FacilityLevel, number> = {
  basic: 0, standard: 5_000_000, advanced: 15_000_000, elite: 40_000_000,
};

const FACILITY_ORDER: FacilityLevel[] = ["basic", "standard", "advanced", "elite"];

const LIVERY_COLORS = [
  "#e63946", "#2196f3", "#4caf50", "#ff9800", "#9c27b0",
  "#00bcd4", "#ff5722", "#3f51b5", "#009688", "#f44336",
  "#1a237e", "#d32f2f", "#00695c", "#e65100", "#4a148c",
];

// ---------- Initial state ----------

export function initialMotorsportState(): MotorsportState {
  return {
    teams: [],
    currentSeason: 1,
    techTransferHistory: [],
    totalTechTransferred: 0,
    scoutedDrivers: [],
    sponsorMarket: [],
  };
}

export function getAvailableDrivers(teams: MotorsportTeam[]): (RaceDriver & { id: string })[] {
  const hiredIds = new Set(teams.flatMap(t => t.drivers.map(d => d.id)));
  return DRIVER_POOL.map((d, i) => ({ ...d, id: `driver_${i}` })).filter(d => !hiredIds.has(d.id));
}

// ---------- Sponsor market generation ----------

export function generateSponsorMarket(state: MotorsportState): MotorsportState {
  const sponsors: Sponsor[] = [];
  const tiers: SponsorTier[] = ["title", "major", "major", "minor", "minor", "minor", "technical", "technical"];
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    const pool = SPONSOR_NAMES[tier];
    const nameIdx = Math.floor(seededRandom(state.currentSeason * 100 + i, 7) * pool.names.length);
    const [minRev, maxRev] = pool.revenueRange;
    const revenue = Math.round(minRev + seededRandom(state.currentSeason * 50 + i, 13) * (maxRev - minRev));
    sponsors.push({
      id: `sponsor_${state.currentSeason}_${i}`,
      name: pool.names[nameIdx],
      tier,
      revenue,
      logoEmoji: pool.emojis[nameIdx % pool.emojis.length],
      reputation: Math.round(40 + seededRandom(i, state.currentSeason) * 55),
      contractSeasons: tier === "title" ? 3 : tier === "major" ? 2 : 1,
      startSeason: 0,
    });
  }
  return { ...state, sponsorMarket: sponsors };
}

export function attractSponsor(state: MotorsportState, teamId: string, sponsorId: string): MotorsportState {
  const sponsor = state.sponsorMarket.find(s => s.id === sponsorId);
  if (!sponsor) return state;
  const teamIdx = state.teams.findIndex(t => t.id === teamId);
  if (teamIdx < 0) return state;

  const team = state.teams[teamIdx];
  // Check tier limits: max 1 title, 2 major, 3 minor, 2 technical
  const tierCount = team.sponsors.filter(s => s.tier === sponsor.tier).length;
  const maxPerTier: Record<SponsorTier, number> = { title: 1, major: 2, minor: 3, technical: 2 };
  if (tierCount >= maxPerTier[sponsor.tier]) return state;

  const signedSponsor: Sponsor = { ...sponsor, startSeason: state.currentSeason };
  const newTeams = [...state.teams];
  newTeams[teamIdx] = {
    ...team,
    sponsors: [...team.sponsors, signedSponsor],
    budget: team.budget + sponsor.revenue,
  };

  return {
    ...state,
    teams: newTeams,
    sponsorMarket: state.sponsorMarket.filter(s => s.id !== sponsorId),
  };
}

// ---------- Compliance check ----------

export function evaluateCompliance(
  vehiclePower: number, vehicleWeight: number,
  isHybrid: boolean, category: MotorsportCategory,
): ComplianceResult {
  const reg = CATEGORY_REGULATIONS[category];
  const checks: ComplianceResult["checks"] = [];

  // Weight check
  if (vehicleWeight >= reg.minWeightKg) {
    checks.push({ label: "Minimum Weight", status: "pass", detail: `${Math.round(vehicleWeight)} kg ≥ ${reg.minWeightKg} kg` });
  } else {
    const deficit = reg.minWeightKg - vehicleWeight;
    checks.push({ label: "Minimum Weight", status: deficit > 50 ? "fail" : "warning", detail: `${Math.round(vehicleWeight)} kg < ${reg.minWeightKg} kg (need +${Math.round(deficit)} kg ballast)` });
  }

  // Power check
  if (vehiclePower <= reg.maxPowerHp) {
    checks.push({ label: "Max Power", status: "pass", detail: `${Math.round(vehiclePower)} hp ≤ ${reg.maxPowerHp} hp` });
  } else {
    checks.push({ label: "Max Power", status: "fail", detail: `${Math.round(vehiclePower)} hp exceeds ${reg.maxPowerHp} hp cap (−${Math.round(vehiclePower - reg.maxPowerHp)} hp)` });
  }

  // EV requirement
  if (reg.evRequirement) {
    if (isHybrid) {
      checks.push({ label: "Hybrid/EV Requirement", status: "pass", detail: "Vehicle has hybrid or EV powertrain" });
    } else {
      checks.push({ label: "Hybrid/EV Requirement", status: "fail", detail: "Category requires hybrid or EV powertrain" });
    }
  } else {
    checks.push({ label: "Hybrid/EV Requirement", status: "pass", detail: "No EV requirement for this category" });
  }

  // Fuel flow
  if (reg.maxFuelFlowKgH > 0) {
    checks.push({ label: "Fuel Flow Limit", status: "pass", detail: `Limited to ${reg.maxFuelFlowKgH} kg/h` });
  } else {
    checks.push({ label: "Fuel Flow Limit", status: "pass", detail: "Unrestricted" });
  }

  // Budget cap
  if (reg.maxBudgetCap > 0) {
    checks.push({ label: "Budget Cap", status: "pass", detail: `Max $${(reg.maxBudgetCap / 1_000_000).toFixed(0)}M per season` });
  }

  // BoP
  if (reg.bopEnabled) {
    checks.push({ label: "Balance of Performance", status: "warning", detail: "BoP adjustments active — advantages will be neutralized" });
  }

  // Restrictor
  if (reg.restrictorPlate) {
    checks.push({ label: "Restrictor Plate", status: "warning", detail: "Restrictor plate required — power output limited" });
  }

  const failCount = checks.filter(c => c.status === "fail").length;
  const warnCount = checks.filter(c => c.status === "warning").length;
  const passed = failCount === 0;
  const overallScore = Math.max(0, 100 - failCount * 30 - warnCount * 5);

  return { category, passed, checks, overallScore };
}

// ---------- Scout driver ----------

export function scoutDriver(state: MotorsportState, season: number): MotorsportState {
  if (state.scoutedDrivers.length >= 4) return state; // max 4 scouted at a time
  const seed = season * 1000 + state.scoutedDrivers.length * 17;
  const nameIdx = Math.floor(seededRandom(seed, 7) * YOUNG_TALENT_NAMES.length);
  const natIdx = Math.floor(seededRandom(seed, 13) * NATIONALITIES.length);
  const baseSkill = 55 + Math.floor(seededRandom(seed, 23) * 30); // 55-84
  const driver: RaceDriver = {
    id: `scout_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    name: YOUNG_TALENT_NAMES[nameIdx],
    nationality: NATIONALITIES[natIdx],
    skill: baseSkill,
    experience: 10 + Math.floor(seededRandom(seed, 31) * 25),
    consistency: 50 + Math.floor(seededRandom(seed, 37) * 30),
    wetSkill: 40 + Math.floor(seededRandom(seed, 41) * 35),
    aggression: 40 + Math.floor(seededRandom(seed, 47) * 45),
    salary: 200_000 + Math.floor(seededRandom(seed, 53) * 500_000),
    contractMonths: 12,
    contractEndSeason: season + 2,
  };
  return { ...state, scoutedDrivers: [...state.scoutedDrivers, driver] };
}

export function signScoutedDriver(state: MotorsportState, driverId: string, teamId: string): MotorsportState {
  const driver = state.scoutedDrivers.find(d => d.id === driverId);
  if (!driver) return state;
  const teamIdx = state.teams.findIndex(t => t.id === teamId);
  if (teamIdx < 0) return state;
  const team = state.teams[teamIdx];
  if (team.drivers.length >= 2) return state;

  const signedDriver = { ...driver, contractEndSeason: state.currentSeason + 2 };
  const newTeams = [...state.teams];
  const newStatus: TeamStatus = team.drivers.length === 0 ? "developing" : "competing";
  newTeams[teamIdx] = { ...team, drivers: [...team.drivers, signedDriver], status: newStatus };
  return {
    ...state,
    teams: newTeams,
    scoutedDrivers: state.scoutedDrivers.filter(d => d.id !== driverId),
  };
}

// ---------- Release driver ----------

export function releaseDriver(state: MotorsportState, teamId: string, driverId: string): MotorsportState {
  const teamIdx = state.teams.findIndex(t => t.id === teamId);
  if (teamIdx < 0) return state;
  const team = state.teams[teamIdx];
  const newDrivers = team.drivers.filter(d => d.id !== driverId);
  const newStatus: TeamStatus = newDrivers.length === 0 ? "developing" : team.status;
  const newTeams = [...state.teams];
  newTeams[teamIdx] = { ...team, drivers: newDrivers, status: newStatus };
  return { ...state, teams: newTeams };
}

// ---------- Renew contract ----------

export function renewDriverContract(state: MotorsportState, teamId: string, driverId: string, seasons: number): MotorsportState {
  const teamIdx = state.teams.findIndex(t => t.id === teamId);
  if (teamIdx < 0) return state;
  const team = state.teams[teamIdx];
  const driverIdx = team.drivers.findIndex(d => d.id === driverId);
  if (driverIdx < 0) return state;

  const newTeams = [...state.teams];
  const newDrivers = [...team.drivers];
  newDrivers[driverIdx] = {
    ...newDrivers[driverIdx],
    contractEndSeason: state.currentSeason + seasons,
    contractMonths: seasons * 12,
  };
  newTeams[teamIdx] = { ...team, drivers: newDrivers };
  return { ...state, teams: newTeams };
}

// ---------- Upgrade facility ----------

export function upgradeTeamFacility(state: MotorsportState, teamId: string): MotorsportState {
  const teamIdx = state.teams.findIndex(t => t.id === teamId);
  if (teamIdx < 0) return state;
  const team = state.teams[teamIdx];
  const currentIdx = FACILITY_ORDER.indexOf(team.facilityLevel);
  if (currentIdx >= FACILITY_ORDER.length - 1) return state; // already elite

  const nextLevel = FACILITY_ORDER[currentIdx + 1];
  const cost = FACILITY_UPGRADE_COSTS[nextLevel];
  if (team.budget < cost) return state;

  const newTeams = [...state.teams];
  newTeams[teamIdx] = { ...team, facilityLevel: nextLevel, budget: team.budget - cost };
  return { ...state, teams: newTeams };
}

export function getFacilityUpgradeCost(level: FacilityLevel): number {
  const idx = FACILITY_ORDER.indexOf(level);
  if (idx >= FACILITY_ORDER.length - 1) return 0;
  return FACILITY_UPGRADE_COSTS[FACILITY_ORDER[idx + 1]];
}

export function getNextFacilityLevel(level: FacilityLevel): FacilityLevel | null {
  const idx = FACILITY_ORDER.indexOf(level);
  if (idx >= FACILITY_ORDER.length - 1) return null;
  return FACILITY_ORDER[idx + 1];
}

// ---------- Create team ----------

export function createTeam(
  state: MotorsportState,
  name: string,
  category: MotorsportCategory,
  budget: number,
  baseVehicleId: string | null,
): MotorsportState {
  const colorIdx = state.teams.length % LIVERY_COLORS.length;
  const team: MotorsportTeam = {
    id: `team_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    category,
    status: "developing",
    baseVehicleId,
    drivers: [],
    budget,
    developmentPoints: 0,
    techTransferPool: 0,
    seasonResults: [],
    currentSeason: state.currentSeason,
    wins: 0,
    podiums: 0,
    championships: 0,
    strategy: defaultStrategy(),
    teamMorale: 60,
    facilityLevel: "basic",
    engineSupplier: "In-house",
    driverDevLogs: [],
    penaltyPoints: 0,
    fastestLaps: 0,
    polePositions: 0,
    sponsors: [],
    liveryColor: LIVERY_COLORS[colorIdx],
  };
  // Also generate sponsor market if empty
  let newState = { ...state, teams: [...state.teams, team] };
  if (newState.sponsorMarket.length === 0) {
    newState = generateSponsorMarket(newState);
  }
  return newState;
}

// ---------- Assign driver ----------

export function assignDriver(state: MotorsportState, teamId: string, driverIdx: number): MotorsportState {
  const driver = DRIVER_POOL[driverIdx];
  if (!driver) return state;
  const driverObj: RaceDriver = { ...driver, id: `driver_${driverIdx}`, contractEndSeason: state.currentSeason + 2 };
  return {
    ...state,
    teams: state.teams.map(t =>
      t.id === teamId && t.drivers.length < 2
        ? { ...t, drivers: [...t.drivers, driverObj], status: t.drivers.length === 0 ? "developing" : "competing" as TeamStatus }
        : t
    ),
  };
}

// ---------- Update strategy ----------

export function updateTeamStrategy(state: MotorsportState, teamId: string, strategy: Partial<TeamStrategy>): MotorsportState {
  return {
    ...state,
    teams: state.teams.map(t =>
      t.id === teamId ? { ...t, strategy: { ...t.strategy, ...strategy } } : t
    ),
  };
}

// ---------- Simulate season ----------

export function simulateSeason(
  state: MotorsportState,
  vehiclePower: number,
  vehicleWeight: number,
  vehicleAeroScore: number,
  vehicleReliability: number,
): MotorsportState {
  const newState = { ...state, teams: [...state.teams] };

  for (let ti = 0; ti < newState.teams.length; ti++) {
    const team = { ...newState.teams[ti] };
    if (team.status !== "competing" || team.drivers.length === 0) continue;

    const calendar = SEASON_CALENDARS[team.category];
    const reg = CATEGORY_REGULATIONS[team.category];
    const facilityBonus = FACILITY_BONUSES[team.facilityLevel];
    const raceResults: SeasonResult["raceResults"] = [];
    let totalPoints = 0;
    let wins = 0;
    let podiums = 0;
    let dnfs = 0;
    let bestFinish = 20;
    let fastestLaps = 0;
    let polePositions = 0;
    let penaltyPoints = 0;

    // Sponsor bonus — higher-tier sponsors give performance boost
    const sponsorBonus = team.sponsors.reduce((s, sp) => {
      const tierValue = sp.tier === "title" ? 4 : sp.tier === "major" ? 2 : sp.tier === "technical" ? 1.5 : 0.5;
      return s + tierValue;
    }, 0);

    // Strategy bonuses — now more meaningful
    const tireStrategyBonus = (() => {
      const tires = team.strategy.tireStrategy;
      if (tires.length === 0) return 0;
      // Mixed strategies are better than single compound
      const uniqueCompounds = new Set(tires).size;
      return uniqueCompounds * 1.5;
    })();

    const fuelLoadBonus = (() => {
      // Lighter fuel = faster but risks running out
      if (team.strategy.fuelLoad < 0.5) return 3; // risky but fast
      if (team.strategy.fuelLoad < 0.7) return 2;
      if (team.strategy.fuelLoad > 0.95) return -1; // heavy
      return 0;
    })();

    const strategyBonus =
      (team.strategy.deployMode === "aggressive" ? 4 : team.strategy.deployMode === "qualifying" ? 6 : team.strategy.deployMode === "conservative" ? -1 : 0) +
      (team.strategy.undercut ? 2.5 : 0) +
      (team.strategy.overcut ? 1.5 : 0) +
      tireStrategyBonus +
      fuelLoadBonus;

    // BoP adjustment — reduce advantages
    const bopFactor = reg.bopEnabled ? 0.7 : 1.0;

    // === AI competitors: generate round-by-round for proper standings ===
    const AI_COUNT = 11;
    const aiSeasonPoints: number[] = new Array(AI_COUNT).fill(0);
    const aiSeasonWins: number[] = new Array(AI_COUNT).fill(0);
    const aiSeasonPodiums: number[] = new Array(AI_COUNT).fill(0);
    const aiSeasonFLs: number[] = new Array(AI_COUNT).fill(0);
    const aiSeasonPoles: number[] = new Array(AI_COUNT).fill(0);

    for (let round = 0; round < calendar.rounds; round++) {
      const trackId = calendar.tracks[round % calendar.tracks.length];

      // Performance score based on vehicle + team + driver + strategy + facility + sponsors
      const avgDriverSkill = team.drivers.reduce((s, d) => s + d.skill, 0) / team.drivers.length;
      const avgConsistency = team.drivers.reduce((s, d) => s + d.consistency, 0) / team.drivers.length;
      const vehicleScore = (vehiclePower / 10 - vehicleWeight / 100 + vehicleAeroScore * 50) / 100;
      const teamDevBonus = team.developmentPoints * 0.01;
      const moraleBonus = (team.teamMorale - 50) * 0.08; // morale above 50 helps, below 50 hurts
      const performanceScore = (vehicleScore * bopFactor) + avgDriverSkill * 0.5 + teamDevBonus +
        facilityBonus * 0.3 + strategyBonus * 0.3 + sponsorBonus * 0.2 + moraleBonus;

      // Grid of AI competitors
      const gridScores: { idx: number; score: number; isPlayer: boolean }[] = [];
      gridScores.push({ idx: -1, score: performanceScore, isPlayer: true });

      for (let ai = 0; ai < AI_COUNT; ai++) {
        const aiBase = 40 + seededRandom(newState.currentSeason * 100 + round * 20 + ai, ti) * 35;
        const aiVariance = (seededRandom(round * 10 + ai, newState.currentSeason + ti * 50) - 0.5) * 10;
        gridScores.push({ idx: ai, score: aiBase + aiVariance, isPlayer: false });
      }

      // DNF check (strategy affects reliability)
      const reliabilityModifier = team.strategy.deployMode === "aggressive" ? -0.03 :
        team.strategy.deployMode === "qualifying" ? -0.04 :
        team.strategy.deployMode === "conservative" ? 0.03 : 0;
      const fuelRiskModifier = team.strategy.fuelLoad < 0.5 ? -0.02 : 0;
      const dnfChance = clamp(0.08 - vehicleReliability * 0.05 - avgConsistency * 0.0003 + reliabilityModifier + fuelRiskModifier, 0.01, 0.18);
      const didDnf = seededRandom(round * 7 + ti * 3, newState.currentSeason * 17) < dnfChance;

      if (didDnf) {
        dnfs++;
        const roundPenalty = seededRandom(round, ti) > 0.7 ? 2 : 0;
        penaltyPoints += roundPenalty;
        raceResults.push({ round: round + 1, trackId, position: 0, points: 0, penaltyPoints: roundPenalty });

        // AI still races — assign points to AI this round
        const aiOnlyGrid = gridScores.filter(g => !g.isPlayer);
        aiOnlyGrid.sort((a, b) => b.score - a.score);
        aiOnlyGrid.forEach((g, pos) => {
          const pts = pos < POINTS_SYSTEM.length ? POINTS_SYSTEM[pos] : 0;
          aiSeasonPoints[g.idx] += pts;
          if (pos === 0) aiSeasonWins[g.idx]++;
          if (pos < 3) aiSeasonPodiums[g.idx]++;
        });
        continue;
      }

      // Race variance
      const raceVariance = (seededRandom(round * 13 + ti * 7, newState.currentSeason * 31) - 0.5) * 8;
      gridScores[0].score += raceVariance;

      // Sort by score descending
      gridScores.sort((a, b) => b.score - a.score);
      const position = gridScores.findIndex(g => g.isPlayer) + 1;
      const points = position <= POINTS_SYSTEM.length ? POINTS_SYSTEM[position - 1] : 0;

      // AI points for this round
      gridScores.forEach((g, pos) => {
        if (!g.isPlayer) {
          const aiPts = pos < POINTS_SYSTEM.length ? POINTS_SYSTEM[pos] : 0;
          aiSeasonPoints[g.idx] += aiPts;
          if (pos === 0) aiSeasonWins[g.idx]++;
          if (pos < 3) aiSeasonPodiums[g.idx]++;
        }
      });

      // Fastest lap and pole
      const gotFastestLap = seededRandom(round * 19 + ti, newState.currentSeason * 43) > 0.75 && position <= 5;
      const gotPole = seededRandom(round * 23 + ti, newState.currentSeason * 53) > 0.7 && position <= 3;
      if (gotFastestLap) fastestLaps++;
      if (gotPole) polePositions++;

      // AI fastest laps
      for (let ai = 0; ai < AI_COUNT; ai++) {
        if (seededRandom(round * 19 + ai + 100, newState.currentSeason * 43) > 0.85) aiSeasonFLs[ai]++;
        if (seededRandom(round * 23 + ai + 100, newState.currentSeason * 53) > 0.85) aiSeasonPoles[ai]++;
      }

      // Penalty check
      const roundPenalty = (team.strategy.deployMode === "aggressive" && seededRandom(round * 29, ti) > 0.85) ? 1 : 0;
      penaltyPoints += roundPenalty;

      totalPoints += points + (gotFastestLap ? 1 : 0);
      if (position === 1) wins++;
      if (position <= 3) podiums++;
      if (position < bestFinish) bestFinish = position;

      raceResults.push({
        round: round + 1, trackId, position, points: points + (gotFastestLap ? 1 : 0),
        fastestLap: gotFastestLap, polePosition: gotPole, penaltyPoints: roundPenalty,
      });
    }

    // Generate championship standings from accumulated AI results
    const AI_TEAM_NAMES = [
      "Scuderia Rosso", "Blitz Racing", "Azure Motorsport", "Titan GP",
      "Eclipse Racing", "Phoenix Dynamics", "Meridian Racing",
      "Storm Racing", "Atlas Engineering", "Zenith Sport", "Vortex Racing",
    ];
    const standings: ChampionshipStanding[] = [];
    standings.push({
      teamId: team.id, teamName: team.name, position: 1, points: totalPoints,
      wins, podiums, fastestLaps, polePositions, gapToLeader: 0, isPlayer: true,
    });
    for (let ai = 0; ai < AI_COUNT; ai++) {
      standings.push({
        teamId: `ai_${ai}`, teamName: AI_TEAM_NAMES[ai % AI_TEAM_NAMES.length],
        position: 0, points: aiSeasonPoints[ai], wins: aiSeasonWins[ai],
        podiums: aiSeasonPodiums[ai], fastestLaps: aiSeasonFLs[ai],
        polePositions: aiSeasonPoles[ai], gapToLeader: 0, isPlayer: false,
      });
    }
    // Sort standings and assign positions + gaps
    standings.sort((a, b) => b.points - a.points || b.wins - a.wins);
    const leaderPts = standings[0].points;
    standings.forEach((s, i) => { s.position = i + 1; s.gapToLeader = leaderPts - s.points; });

    // Tech points earned from racing
    const techPointsEarned = Math.round(totalPoints * 0.5 + wins * 5 + podiums * 2 + facilityBonus);

    // Driver development — improved with minimum development rate
    const devLogs: DriverDevelopmentLog[] = team.drivers.map(d => {
      const baseDev = Math.max(1, (100 - d.skill) * 0.08); // minimum 1 point development
      const skillGain = clamp(Math.round((wins * 0.5 + podiums * 0.3 + baseDev) * (1 + facilityBonus * 0.03)), 1, 5);
      const conGain = clamp(Math.round(podiums * 0.2 + Math.max(0.5, (100 - d.consistency) * 0.04)), 0, 3);
      const wetGain = clamp(Math.round(dnfs * 0.1 + Math.max(0.3, (100 - d.wetSkill) * 0.05)), 0, 3);

      // Morale — streaks matter
      const winStreak = wins >= 3 ? 15 : wins >= 2 ? 8 : 0;
      const lossStreak = wins === 0 && podiums === 0 ? -10 : 0;
      const morale = clamp(50 + wins * 8 + podiums * 4 - dnfs * 6 - penaltyPoints * 3 + winStreak + lossStreak + (team.teamMorale - 50) * 0.3, 10, 100);
      const formRating = clamp(50 + totalPoints * 0.3 + wins * 12 - dnfs * 8 + (podiums * 3), 10, 100);
      const highlights = wins > 3 ? "Dominant champion" : wins > 2 ? "Championship contender" : wins > 0 ? "Race winner" : podiums > 2 ? "Consistent podium finisher" : podiums > 0 ? "Podium finisher" : dnfs > 2 ? "Tough season — reliability issues" : "Solid season";
      return {
        driverId: d.id, season: newState.currentSeason,
        skillBefore: d.skill, skillAfter: Math.min(99, d.skill + skillGain),
        consistencyBefore: d.consistency, consistencyAfter: Math.min(99, d.consistency + conGain),
        wetSkillBefore: d.wetSkill, wetSkillAfter: Math.min(99, d.wetSkill + wetGain),
        morale, formRating, seasonHighlight: highlights,
      };
    });

    // Update morale
    const avgMorale = devLogs.length > 0 ? devLogs.reduce((s, l) => s + l.morale, 0) / devLogs.length : 60;

    const playerStanding = standings.find(s => s.isPlayer);
    const championshipPosition = playerStanding?.position ?? standings.length;

    const seasonResult: SeasonResult = {
      season: newState.currentSeason,
      category: team.category,
      position: championshipPosition,
      points: totalPoints,
      wins, podiums, dnfs, bestFinish, raceResults, techPointsEarned,
      fastestLaps, polePositions, penaltyPoints, standings,
    };

    // Update drivers with development
    const updatedDrivers = team.drivers.map(d => {
      const log = devLogs.find(l => l.driverId === d.id);
      if (!log) return d;
      return { ...d, skill: log.skillAfter, consistency: log.consistencyAfter, wetSkill: log.wetSkillAfter };
    });

    team.seasonResults = [...team.seasonResults, seasonResult];
    team.wins += wins;
    team.podiums += podiums;
    team.fastestLaps += fastestLaps;
    team.polePositions += polePositions;
    team.penaltyPoints += penaltyPoints;
    team.developmentPoints += techPointsEarned;
    team.techTransferPool += Math.round(techPointsEarned * 0.3);
    team.drivers = updatedDrivers;
    team.driverDevLogs = [...team.driverDevLogs, ...devLogs];
    team.teamMorale = Math.round(avgMorale);

    // Championship check — P1 in standings = champion (fixed from arbitrary threshold)
    if (championshipPosition === 1) {
      team.championships++;
      team.status = "champion";
    }

    // Expire sponsors
    team.sponsors = team.sponsors.filter(s =>
      s.startSeason + s.contractSeasons > newState.currentSeason
    );

    newState.teams[ti] = team;
  }

  newState.currentSeason++;
  // Regenerate sponsor market each season
  return generateSponsorMarket(newState);
}

// ---------- Tech transfer ----------

export function transferTech(
  state: MotorsportState,
  teamId: string,
  direction: "race_to_production" | "production_to_race",
  points: number,
  month: number,
): MotorsportState {
  const teamIdx = state.teams.findIndex(t => t.id === teamId);
  if (teamIdx < 0) return state;
  const team = state.teams[teamIdx];
  if (team.techTransferPool < points) return state;

  const categories = ["power", "aero", "weight", "reliability", "cooling", "brakes"];
  const catIdx = Math.floor(seededRandom(month, points) * categories.length);
  const category = categories[catIdx];

  const bonusDescriptions: Record<string, Record<string, string>> = {
    race_to_production: {
      power: "+2% engine efficiency from race data",
      aero: "+3% downforce from race aero development",
      weight: "-1.5% weight from lightweight race materials",
      reliability: "+5% reliability from endurance racing experience",
      cooling: "+4% cooling efficiency from race thermal management",
      brakes: "+3% braking performance from race brake development",
    },
    production_to_race: {
      power: "+1.5% race power from production engine research",
      aero: "+2% race aero from production wind tunnel data",
      weight: "-1% race weight from production materials research",
      reliability: "+3% race reliability from production durability testing",
      cooling: "+2% race cooling from production thermal solutions",
      brakes: "+2% race braking from production brake technology",
    },
  };

  const newTeams = [...state.teams];
  newTeams[teamIdx] = { ...team, techTransferPool: team.techTransferPool - points };

  return {
    ...state,
    teams: newTeams,
    techTransferHistory: [
      ...state.techTransferHistory,
      { month, direction, category, bonus: bonusDescriptions[direction][category], points },
    ],
    totalTechTransferred: state.totalTechTransferred + points,
  };
}

export function getMotorsportSummary(state: MotorsportState): { totalTeams: number; totalWins: number; totalChampionships: number; techPoolTotal: number } {
  return {
    totalTeams: state.teams.length,
    totalWins: state.teams.reduce((s, t) => s + t.wins, 0),
    totalChampionships: state.teams.reduce((s, t) => s + t.championships, 0),
    techPoolTotal: state.teams.reduce((s, t) => s + t.techTransferPool, 0),
  };
}

export function getSeasonCalendar(category: MotorsportCategory) {
  return SEASON_CALENDARS[category];
}
