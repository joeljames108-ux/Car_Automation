// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — CHAMPIONSHIP & POINTS ENGINE
// ============================================================================

import type { F1CarDesign } from "../types/f1Types";
import type { F1CircuitProfile, F1RivalTeamSpec } from "../types/f1Interfaces";
import { F1_RIVAL_TEAMS } from "./f1RivalTeams";
import { F1_OFFICIAL_CALENDAR } from "./f1Calendar";

export const F1_GRAND_PRIX_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const F1_SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1];

export interface F1DriverStanding {
  driverName: string;
  teamName: string;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;
  isPlayer: boolean;
}

export interface F1ConstructorStanding {
  teamName: string;
  points: number;
  wins: number;
  podiums: number;
  colorHex: string;
  isPlayer: boolean;
}

export interface F1RaceResultEntry {
  position: number;
  driverName: string;
  teamName: string;
  gapToLeaderSec: number;
  bestLapTimeSec: number;
  pointsEarned: number;
  fastestLap: boolean;
  status: "FINISHED" | "DNF_CRASH" | "DNF_ENGINE" | "DNF_BRAKES";
  isPlayer: boolean;
}

export interface F1WeekendSimulationResult {
  circuit: F1CircuitProfile;
  polePositionDriver: string;
  poleLapTimeSec: number;
  fastestLapDriver: string;
  fastestLapTimeSec: number;
  results: F1RaceResultEntry[];
  playerPaceDeltaSec: number;
}

export interface F1DriverTransferNews {
  driverName: string;
  fromTeam: string;
  toTeam: string;
  headline: string;
  reason: string;
}

export class F1ChampionshipEngine {
  /**
   * Simulates end-of-season driver market transfers and inter-season team R&D progression.
   */
  public static simulateSeasonEndTransfers(rivalGrid: F1RivalTeamSpec[]): {
    updatedGrid: F1RivalTeamSpec[];
    news: F1DriverTransferNews[];
  } {
    const grid = rivalGrid.map((team) => ({ ...team }));
    const news: F1DriverTransferNews[] = [];

    // 1. Inter-season R&D Development Progression
    grid.forEach((team) => {
      const rdDelta = Number(((Math.random() * 0.4 - 0.2)).toFixed(2));
      team.estimatedLapTimeOffsetSec = Math.max(0.0, Number((team.estimatedLapTimeOffsetSec + rdDelta).toFixed(2)));
      team.aerodynamicsRating = Math.min(99, Math.max(75, team.aerodynamicsRating + Math.floor(Math.random() * 5 - 2)));
      team.powerUnitRating = Math.min(99, Math.max(75, team.powerUnitRating + Math.floor(Math.random() * 4 - 2)));
    });

    // 2. Dynamic Driver Transfers (swap seat 2 of 2 teams with lowest rating/performance)
    if (grid.length >= 4) {
      const teamA = grid[2]; // e.g. McLaren or Mercedes
      const teamB = grid[6]; // e.g. Haas or Alpine

      const tempDriver = teamA.driver2Name;
      const tempRating = teamA.driver2Rating;

      teamA.driver2Name = teamB.driver2Name;
      teamA.driver2Rating = teamB.driver2Rating;

      teamB.driver2Name = tempDriver;
      teamB.driver2Rating = tempRating;

      news.push({
        driverName: teamA.driver2Name,
        fromTeam: teamB.teamName,
        toTeam: teamA.teamName,
        headline: `${teamA.driver2Name} signs contract with ${teamA.teamName}!`,
        reason: "Contract extension negotiations concluded following strong season performance.",
      });

      news.push({
        driverName: teamB.driver2Name,
        fromTeam: teamA.teamName,
        toTeam: teamB.teamName,
        headline: `${teamB.driver2Name} moves to ${teamB.teamName} for new season.`,
        reason: "Strategic seat swap to bolster constructor standings points.",
      });
    }

    return { updatedGrid: grid, news };
  }

  /**
   * Simulates an entire race weekend on a specified circuit with player's car and 10 rival teams.
   */
  public static simulateRaceWeekend(circuit: F1CircuitProfile, playerCar: F1CarDesign, playerDriverSkill = 95): F1WeekendSimulationResult {
    // 1. Calculate player car baseline lap time at this circuit
    // Base circuit record adjusted for downforce, drag, power, mass, and grip
    const powerBonus = (playerCar.computedTotalPeakHp - 980) * 0.003;
    const massPenalty = (playerCar.computedTotalMassKg - 798) * 0.035;
    const aeroBonus = (playerCar.aero.totalDownforceAt250KmhKg - 1600) * 0.0018;
    const dragPenalty = (playerCar.aero.totalDragAt250KmhKg - 420) * 0.0022;

    const playerPerformanceDelta = (powerBonus + aeroBonus - massPenalty - dragPenalty);
    const driverSkillDelta = (playerDriverSkill - 90) * 0.04;
    const totalPlayerOffset = -(playerPerformanceDelta + driverSkillDelta);

    const baseLap = circuit.baseLapRecordSec;
    const playerBestLap = baseLap + totalPlayerOffset + (Math.random() * 0.2 - 0.1);

    // 2. Generate all 21 drivers (20 AI + 1 Player, representing Team Lead)
    const competitors: { name: string; team: string; bestLap: number; racePaceOffset: number; isPlayer: boolean }[] = [];

    // Player Driver
    competitors.push({
      name: `Player (#${playerCar.livery.carNumber})`,
      team: playerCar.name,
      bestLap: playerBestLap,
      racePaceOffset: totalPlayerOffset,
      isPlayer: true,
    });

    // 10 Rival Teams x 2 Drivers
    for (const rival of F1_RIVAL_TEAMS) {
      const d1Lap = baseLap + rival.estimatedLapTimeOffsetSec + ((99 - rival.driver1Rating) * 0.035) + (Math.random() * 0.15);
      const d2Lap = baseLap + rival.estimatedLapTimeOffsetSec + ((99 - rival.driver2Rating) * 0.035) + (Math.random() * 0.18);

      competitors.push({
        name: rival.driver1Name,
        team: rival.teamName,
        bestLap: d1Lap,
        racePaceOffset: rival.estimatedLapTimeOffsetSec + ((99 - rival.driver1Rating) * 0.03),
        isPlayer: false,
      });

      competitors.push({
        name: rival.driver2Name,
        team: rival.teamName,
        bestLap: d2Lap,
        racePaceOffset: rival.estimatedLapTimeOffsetSec + ((99 - rival.driver2Rating) * 0.03),
        isPlayer: false,
      });
    }

    // Sort by qualifying / race pace
    competitors.sort((a, b) => a.bestLap - b.bestLap);

    const poleDriver = competitors[0].name;
    const poleLap = competitors[0].bestLap;

    let fastestLapDriver = competitors[0].name;
    let fastestLapSec = competitors[0].bestLap;

    const results: F1RaceResultEntry[] = competitors.map((comp, idx) => {
      const position = idx + 1;
      const gapToLeader = idx === 0 ? 0.0 : (comp.bestLap - poleLap) * circuit.raceLapsCount * 0.65 + (Math.random() * 3.5);
      const points = position <= 10 ? F1_GRAND_PRIX_POINTS[position - 1] : 0;

      if (comp.bestLap < fastestLapSec) {
        fastestLapSec = comp.bestLap;
        fastestLapDriver = comp.name;
      }

      return {
        position,
        driverName: comp.name,
        teamName: comp.team,
        gapToLeaderSec: Number(gapToLeader.toFixed(3)),
        bestLapTimeSec: Number(comp.bestLap.toFixed(3)),
        pointsEarned: points,
        fastestLap: comp.name === fastestLapDriver && position <= 10,
        status: "FINISHED",
        isPlayer: comp.isPlayer,
      };
    });

    return {
      circuit,
      polePositionDriver: poleDriver,
      poleLapTimeSec: Number(poleLap.toFixed(3)),
      fastestLapDriver,
      fastestLapTimeSec: Number(fastestLapSec.toFixed(3)),
      results,
      playerPaceDeltaSec: Number(totalPlayerOffset.toFixed(3)),
    };
  }
}
