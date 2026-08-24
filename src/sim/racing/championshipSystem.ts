// ============================================================================
// RACE ENGINEERING SUITE — CHAMPIONSHIP SYSTEM
// ============================================================================
// Manages FIA-style championship points, sprint race points, fastest lap
// bonus, driver and constructor standings, and tiebreaker rules.
// ============================================================================

export interface DriverStanding {
  position: number;
  driverId: string;
  driverName: string;
  team: string;
  nationality: string;
  number: number;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;
  dnfs: number;
  bestFinish: number;
  consecutiveScoring: number;
  pointsHistory: number[];
  form: 'rising' | 'stable' | 'falling';
}

export interface ConstructorStanding {
  position: number;
  team: string;
  points: number;
  wins: number;
  podiums: number;
  drivers: string[];
}

export interface RaceResult {
  raceId: string;
  trackName: string;
  date: string;
  results: { driverId: string; position: number; points: number; fastestLap: boolean }[];
}

const RACE_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1];
const FASTEST_LAP_BONUS = 1;
const MAX_HISTORY = 24;

export class ChampionshipSystem {
  private drivers: Map<string, DriverStanding>;
  private constructors: Map<string, ConstructorStanding>;
  private raceResults: RaceResult[];
  private currentRound: number;

  constructor() {
    this.drivers = new Map();
    this.constructors = new Map();
    this.raceResults = [];
    this.currentRound = 0;
  }

  public addDriverStanding(driver: Omit<DriverStanding, 'position' | 'points' | 'wins' | 'podiums' | 'poles' | 'fastestLaps' | 'dnfs' | 'bestFinish' | 'consecutiveScoring' | 'pointsHistory' | 'form'>): void {
    this.drivers.set(driver.driverId, {
      ...driver, position: 0, points: 0, wins: 0, podiums: 0, poles: 0,
      fastestLaps: 0, dnfs: 0, bestFinish: 99, consecutiveScoring: 0,
      pointsHistory: [], form: 'stable',
    });
  }

  public addConstructorStanding(constructor: Omit<ConstructorStanding, 'position' | 'points' | 'wins' | 'podiums'>): void {
    this.constructors.set(constructor.team, { ...constructor, position: 0, points: 0, wins: 0, podiums: 0 });
  }

  public recordRaceResult(result: RaceResult): void {
    this.currentRound++;
    this.raceResults.push(result);

    for (const entry of result.results) {
      const driver = this.drivers.get(entry.driverId);
      if (!driver) continue;

      driver.points += entry.points;
      driver.pointsHistory.push(entry.points);
      if (driver.pointsHistory.length > MAX_HISTORY) driver.pointsHistory.shift();

      if (entry.position === 1) driver.wins++;
      if (entry.position <= 3) driver.podiums++;
      if (entry.fastestLap && entry.position <= 10) {
        driver.points += FASTEST_LAP_BONUS;
        driver.fastestLaps++;
      }
      if (entry.position < driver.bestFinish) driver.bestFinish = entry.position;
      if (entry.points > 0) driver.consecutiveScoring++;
      else driver.consecutiveScoring = 0;

      // Update form
      const recent = driver.pointsHistory.slice(-3);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      driver.form = avg > 12 ? 'rising' : avg < 4 ? 'falling' : 'stable';
    }

    // Update constructors
    for (const entry of result.results) {
      const driver = this.drivers.get(entry.driverId);
      if (!driver) continue;
      const constructor = this.constructors.get(driver.team);
      if (!constructor) continue;
      constructor.points += entry.points;
      if (entry.position === 1) constructor.wins++;
      if (entry.position <= 3) constructor.podiums++;
    }

    this.recalculatePositions();
  }

  private recalculatePositions(): void {
    const sortedDrivers = Array.from(this.drivers.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.podiums !== a.podiums) return b.podiums - a.podiums;
      return b.fastestLaps - a.fastestLaps;
    });
    sortedDrivers.forEach((d, i) => d.position = i + 1);

    const sortedConstructors = Array.from(this.constructors.values()).sort((a, b) => b.points - a.points);
    sortedConstructors.forEach((c, i) => c.position = i + 1);
  }

  public getDriverStandings(): DriverStanding[] {
    return Array.from(this.drivers.values()).sort((a, b) => a.position - b.position);
  }

  public getConstructorStandings(): ConstructorStanding[] {
    return Array.from(this.constructors.values()).sort((a, b) => a.position - b.position);
  }

  public getLeader(): DriverStanding | undefined {
    return this.getDriverStandings()[0];
  }

  public getPointsGap(first: string, second: string): number {
    const a = this.drivers.get(first);
    const b = this.drivers.get(second);
    return (a?.points || 0) - (b?.points || 0);
  }

  public getRound(): number { return this.currentRound; }
  public getMaxRounds(): number { return 24; }
  public getRaceResults(): RaceResult[] { return [...this.raceResults]; }

  public projectChampionship(remainingRounds: number): { driverChampion: string; constructorChampion: string; pointsNeeded: number } {
    const standings = this.getDriverStandings();
    const leader = standings[0];
    const maxPointsPerRound = 26;
    const remaining = remainingRounds * maxPointsPerRound;
    const secondPlace = standings[1];

    return {
      driverChampion: leader?.driverName || 'TBD',
      constructorChampion: this.getConstructorStandings()[0]?.team || 'TBD',
      pointsNeeded: secondPlace ? Math.max(0, Math.ceil((leader.points - secondPlace.points + remaining) / maxPointsPerRound)) : 0,
    };
  }
}
