/**
 * ═══════════════════════════════════════════════════════════════════════
 * MOTORSPORT INCOME ENGINE — PRIZE MONEY, SPONSORS & RACING REVENUE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 7: Racing Economics.
 *
 * Motorsport begins as a heavy investment / money-pit, but over years of
 * championship performance becomes self-funding through commercial
 * title sponsorships, race prize money, customer car sales, and
 * privateer racing engine supply.
 */

export type MotorsportTier =
  | "CLUB_RACING"
  | "GT3_ENDURANCE"
  | "PROTOTYPE_LMP"
  | "FORMULA_GRAND_PRIX";

export interface MotorsportSponsor {
  id: string;
  sponsorName: string;
  sector: "ENERGY" | "LUXURY_WATCHES" | "FINANCIAL" | "TECH" | "TELECOM";
  monthlyPayout: number;
  minimumStandingRequired: number; // e.g. must be top 5
  contractMonthsRemaining: number;
}

export interface MotorsportDivisionState {
  tier: MotorsportTier;
  isActive: boolean;
  monthlyOperatingCost: number;     // Fixed racing department overhead
  driverSalariesMonthly: number;
  racesEnteredThisYear: number;
  currentChampionshipPoints: number;
  currentChampionshipStanding: number; // 1 = 1st place
  sponsors: MotorsportSponsor[];
  customerTeamsCount: number;         // Privateer teams buying race cars/engines
  customerTeamMonthlyFeePerTeam: number;
  annualPrizeMoneyAccrued: number;
}

export interface MotorsportMonthlyReport {
  monthlyExpenses: number;
  monthlySponsorshipRevenue: number;
  monthlyCustomerRacingRevenue: number;
  racePrizeMoneyThisMonth: number;
  totalMonthlyRevenue: number;
  netMotorsportCashFlow: number;      // positive or negative
  performanceReputationGain: number;  // Feedback into reputation engine
  motorsportReputationGain: number;
}

export const INITIAL_1970_MOTORSPORT: MotorsportDivisionState = {
  tier: "CLUB_RACING",
  isActive: false, // Starts inactive for seed startup
  monthlyOperatingCost: 150000, // ₹150k/mo if active
  driverSalariesMonthly: 40000,
  racesEnteredThisYear: 0,
  currentChampionshipPoints: 0,
  currentChampionshipStanding: 12,
  sponsors: [],
  customerTeamsCount: 0,
  customerTeamMonthlyFeePerTeam: 0,
  annualPrizeMoneyAccrued: 0,
};

/**
 * Process monthly motorsport finances and race results
 */
export function processMotorsportMonth(
  state: MotorsportDivisionState,
  isRaceMonth: boolean,
  performanceScore: number,
  motorsportReputation: number
): {
  updatedState: MotorsportDivisionState;
  report: MotorsportMonthlyReport;
} {
  if (!state.isActive) {
    return {
      updatedState: state,
      report: {
        monthlyExpenses: 0,
        monthlySponsorshipRevenue: 0,
        monthlyCustomerRacingRevenue: 0,
        racePrizeMoneyThisMonth: 0,
        totalMonthlyRevenue: 0,
        netMotorsportCashFlow: 0,
        performanceReputationGain: 0,
        motorsportReputationGain: 0,
      },
    };
  }

  // 1. Operating Expenses
  const monthlyExpenses = state.monthlyOperatingCost + state.driverSalariesMonthly;

  // 2. Sponsorship Revenue
  let sponsorshipRevenue = 0;
  const updatedSponsors: MotorsportSponsor[] = [];
  for (const s of state.sponsors) {
    if (s.contractMonthsRemaining > 0) {
      // Full payout if within standing requirement, 70% if underperforming
      const standingBonus = state.currentChampionshipStanding <= s.minimumStandingRequired ? 1.0 : 0.7;
      sponsorshipRevenue += Math.round(s.monthlyPayout * standingBonus);
      updatedSponsors.push({
        ...s,
        contractMonthsRemaining: s.contractMonthsRemaining - 1,
      });
    }
  }

  // 3. Customer Racing Team Fees
  const customerRacingRevenue = state.customerTeamsCount * state.customerTeamMonthlyFeePerTeam;

  // 4. Race Prize Money (if race occurred this month)
  let racePrizeMoney = 0;
  let standingChange = 0;
  let perfRepDelta = 0;
  let motorsportRepDelta = 0;

  if (isRaceMonth) {
    // Probability of top finish depends on car performance & motorsport rep
    const compositePace = performanceScore * 0.65 + motorsportReputation * 0.35;
    let finishPosition = 15;
    if (compositePace >= 85) finishPosition = Math.floor(1 + Math.random() * 3); // 1st - 3rd
    else if (compositePace >= 70) finishPosition = Math.floor(3 + Math.random() * 5); // 3rd - 7th
    else if (compositePace >= 50) finishPosition = Math.floor(6 + Math.random() * 6); // 6th - 11th
    else finishPosition = Math.floor(10 + Math.random() * 8); // 10th - 18th

    // Prize money based on tier and finish
    const tierPrizes: Record<MotorsportTier, number[]> = {
      CLUB_RACING: [120000, 80000, 50000, 25000, 15000, 10000, 8000, 6000, 4000, 2500],
      GT3_ENDURANCE: [850000, 500000, 300000, 150000, 100000, 75000, 50000, 35000, 25000, 15000],
      PROTOTYPE_LMP: [2500000, 1500000, 900000, 450000, 300000, 200000, 150000, 100000, 75000, 50000],
      FORMULA_GRAND_PRIX: [8000000, 5000000, 3200000, 1800000, 1200000, 900000, 700000, 500000, 350000, 200000],
    };
    const prizeTable = tierPrizes[state.tier];
    racePrizeMoney = finishPosition <= prizeTable.length ? prizeTable[finishPosition - 1] : 0;

    // Standing and reputation updates
    if (finishPosition <= 3) {
      perfRepDelta = finishPosition === 1 ? 1.5 : 0.8;
      motorsportRepDelta = finishPosition === 1 ? 2.5 : 1.2;
      standingChange = -1; // improve standing
    } else if (finishPosition <= 6) {
      perfRepDelta = 0.3;
      motorsportRepDelta = 0.5;
    } else {
      perfRepDelta = -0.1;
      standingChange = 1;
    }
  }

  const totalMonthlyRevenue = sponsorshipRevenue + customerRacingRevenue + racePrizeMoney;
  const netMotorsportCashFlow = totalMonthlyRevenue - monthlyExpenses;

  const newStanding = Math.max(1, Math.min(20, state.currentChampionshipStanding + standingChange));

  const updatedState: MotorsportDivisionState = {
    ...state,
    sponsors: updatedSponsors,
    currentChampionshipStanding: newStanding,
    racesEnteredThisYear: isRaceMonth ? state.racesEnteredThisYear + 1 : state.racesEnteredThisYear,
    annualPrizeMoneyAccrued: state.annualPrizeMoneyAccrued + racePrizeMoney,
  };

  return {
    updatedState,
    report: {
      monthlyExpenses,
      monthlySponsorshipRevenue: sponsorshipRevenue,
      monthlyCustomerRacingRevenue: customerRacingRevenue,
      racePrizeMoneyThisMonth: racePrizeMoney,
      totalMonthlyRevenue,
      netMotorsportCashFlow,
      performanceReputationGain: perfRepDelta,
      motorsportReputationGain: motorsportRepDelta,
    },
  };
}
