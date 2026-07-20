// ===================================================================
// MOTORSPORT ENGINE — Season simulation & tech transfer
// ===================================================================

import type {
  MotorsportState, MotorsportTeam, MotorsportCategory, SeasonResult,
  RaceDriver, TrackId, TeamStatus,
} from "./types";

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function seededRandom(seed: number, salt: number): number {
  const x = Math.sin(seed * 9301 + salt * 49297) * 49297;
  return x - Math.floor(x);
}

// ---------- Driver pool ----------

const DRIVER_POOL: Omit<RaceDriver, "id">[] = [
  { name: "Max Hartley", nationality: "GB", skill: 88, experience: 75, consistency: 82, wetSkill: 78, aggression: 70, salary: 2_000_000, contractMonths: 24 },
  { name: "Carlos Vieira", nationality: "BR", skill: 85, experience: 80, consistency: 85, wetSkill: 90, aggression: 60, salary: 1_800_000, contractMonths: 24 },
  { name: "Yuki Tanaka", nationality: "JP", skill: 82, experience: 60, consistency: 78, wetSkill: 75, aggression: 65, salary: 1_200_000, contractMonths: 12 },
  { name: "Lena Eriksson", nationality: "SE", skill: 90, experience: 85, consistency: 88, wetSkill: 85, aggression: 55, salary: 3_000_000, contractMonths: 36 },
  { name: "Ahmed Rashid", nationality: "AE", skill: 75, experience: 50, consistency: 70, wetSkill: 60, aggression: 80, salary: 800_000, contractMonths: 12 },
  { name: "Pierre Dubois", nationality: "FR", skill: 80, experience: 70, consistency: 80, wetSkill: 82, aggression: 50, salary: 1_500_000, contractMonths: 24 },
  { name: "Sofia Romano", nationality: "IT", skill: 86, experience: 65, consistency: 84, wetSkill: 80, aggression: 68, salary: 1_600_000, contractMonths: 24 },
  { name: "Jin Wei", nationality: "CN", skill: 78, experience: 55, consistency: 75, wetSkill: 70, aggression: 72, salary: 1_000_000, contractMonths: 12 },
  { name: "Oliver Schmidt", nationality: "DE", skill: 83, experience: 78, consistency: 86, wetSkill: 76, aggression: 58, salary: 1_700_000, contractMonths: 24 },
  { name: "Ava Mitchell", nationality: "US", skill: 79, experience: 45, consistency: 73, wetSkill: 68, aggression: 75, salary: 900_000, contractMonths: 12 },
];

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

// ---------- Initial state ----------

export function initialMotorsportState(): MotorsportState {
  return {
    teams: [],
    currentSeason: 1,
    techTransferHistory: [],
    totalTechTransferred: 0,
  };
}

export function getAvailableDrivers(teams: MotorsportTeam[]): (RaceDriver & { id: string })[] {
  const hiredIds = new Set(teams.flatMap(t => t.drivers.map(d => d.id)));
  return DRIVER_POOL.map((d, i) => ({ ...d, id: `driver_${i}` })).filter(d => !hiredIds.has(d.id));
}

// ---------- Create team ----------

export function createTeam(
  state: MotorsportState,
  name: string,
  category: MotorsportCategory,
  budget: number,
  baseVehicleId: string | null,
): MotorsportState {
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
  };
  return { ...state, teams: [...state.teams, team] };
}

// ---------- Assign driver ----------

export function assignDriver(state: MotorsportState, teamId: string, driverIdx: number): MotorsportState {
  const driver = DRIVER_POOL[driverIdx];
  if (!driver) return state;
  const driverObj: RaceDriver = { ...driver, id: `driver_${driverIdx}` };
  return {
    ...state,
    teams: state.teams.map(t =>
      t.id === teamId && t.drivers.length < 2
        ? { ...t, drivers: [...t.drivers, driverObj], status: t.drivers.length === 0 ? "developing" : "competing" as TeamStatus }
        : t
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
    const raceResults: SeasonResult["raceResults"] = [];
    let totalPoints = 0;
    let wins = 0;
    let podiums = 0;
    let dnfs = 0;
    let bestFinish = 20;

    for (let round = 0; round < calendar.rounds; round++) {
      const trackId = calendar.tracks[round % calendar.tracks.length];

      // Performance score based on vehicle + team + driver
      const avgDriverSkill = team.drivers.reduce((s, d) => s + d.skill, 0) / team.drivers.length;
      const avgConsistency = team.drivers.reduce((s, d) => s + d.consistency, 0) / team.drivers.length;
      const vehicleScore = (vehiclePower / 10 - vehicleWeight / 100 + vehicleAeroScore * 50) / 100;
      const teamDevBonus = team.developmentPoints * 0.01;
      const performanceScore = vehicleScore + avgDriverSkill * 0.5 + teamDevBonus;

      // Simulate grid of ~12 AI competitors
      const gridScores: { idx: number; score: number; isPlayer: boolean }[] = [];
      gridScores.push({ idx: -1, score: performanceScore, isPlayer: true });

      for (let ai = 0; ai < 11; ai++) {
        const aiBase = 40 + seededRandom(newState.currentSeason * 100 + round * 20 + ai, ti) * 35;
        const aiVariance = (seededRandom(round * 10 + ai, newState.currentSeason + ti * 50) - 0.5) * 10;
        gridScores.push({ idx: ai, score: aiBase + aiVariance, isPlayer: false });
      }

      // DNF check
      const dnfChance = clamp(0.08 - vehicleReliability * 0.05 - avgConsistency * 0.0003, 0.01, 0.15);
      const didDnf = seededRandom(round * 7 + ti * 3, newState.currentSeason * 17) < dnfChance;

      if (didDnf) {
        dnfs++;
        raceResults.push({ round: round + 1, trackId, position: 0, points: 0 });
        continue;
      }

      // Race variance
      const raceVariance = (seededRandom(round * 13 + ti * 7, newState.currentSeason * 31) - 0.5) * 8;
      gridScores[0].score += raceVariance;

      // Sort by score descending
      gridScores.sort((a, b) => b.score - a.score);
      const position = gridScores.findIndex(g => g.isPlayer) + 1;
      const points = position <= POINTS_SYSTEM.length ? POINTS_SYSTEM[position - 1] : 0;

      totalPoints += points;
      if (position === 1) wins++;
      if (position <= 3) podiums++;
      if (position < bestFinish) bestFinish = position;

      raceResults.push({ round: round + 1, trackId, position, points });
    }

    // Tech points earned from racing
    const techPointsEarned = Math.round(totalPoints * 0.5 + wins * 5 + podiums * 2);

    const seasonResult: SeasonResult = {
      season: newState.currentSeason,
      category: team.category,
      position: 0, // calculated after all teams
      points: totalPoints,
      wins,
      podiums,
      dnfs,
      bestFinish,
      raceResults,
      techPointsEarned,
    };

    team.seasonResults = [...team.seasonResults, seasonResult];
    team.wins += wins;
    team.podiums += podiums;
    team.developmentPoints += techPointsEarned;
    team.techTransferPool += Math.round(techPointsEarned * 0.3);

    // Championship check
    if (totalPoints > 150 && wins >= 3) {
      team.championships++;
      team.status = "champion";
    }

    newState.teams[ti] = team;
  }

  newState.currentSeason++;
  return newState;
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
