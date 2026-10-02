/**
 * AUTO SHOWS, PRESS FLEET & MOTORING MAGAZINE REVIEWS ENGINE (UNIT_14)
 * 
 * Simulates:
 * 1. Global Auto Show Circuit (Detroit Jan, Geneva Mar, Frankfurt/Paris Sep, Tokyo Oct)
 * 2. Exhibition Stand Investment Tiers & Pre-Order Generation
 * 3. Motoring Magazine Press Fleet Road Tests (Road & Track, Car and Driver, Autocar, Motor Trend)
 * 4. Car of the Year (COTY) Awards & Showroom Foot-Traffic Demand Boosts
 */

export type AutoShowCity = "detroit" | "geneva" | "frankfurt_paris" | "tokyo";
export type ExhibitionStandTier = "corner_booth" | "corporate_stand" | "reveal_rotunda_pavilion";

export interface AutoShowEvent {
  id: string;
  city: AutoShowCity;
  name: string;
  month: number;
  importanceTier: "global_major" | "continental";
  description: string;
}

export interface StandTierCostAndImpact {
  costEur: number;
  preOrdersGenerated: number;
  brandAwarenessDelta: number;
  pressCoverageScore: number; // 0-100
}

export const AUTO_SHOW_CALENDAR: AutoShowEvent[] = [
  {
    id: "auto_show_detroit",
    city: "detroit",
    name: "North American International Auto Show (Detroit)",
    month: 1, // January
    importanceTier: "global_major",
    description: "Cold-winter American reveal stage, heavily focused on domestic horsepower, trucks, and high-volume sedans.",
  },
  {
    id: "auto_show_geneva",
    city: "geneva",
    name: "Geneva International Motor Show (Palexpo)",
    month: 3, // March
    importanceTier: "global_major",
    description: "The crown jewel of supercar, hypercar, and concept reveals held on neutral Swiss ground.",
  },
  {
    id: "auto_show_frankfurt_paris",
    city: "frankfurt_paris",
    name: "IAA Frankfurt / Paris Mondial de l'Automobile",
    month: 9, // September
    importanceTier: "global_major",
    description: "Sprawling European manufacturing showcase highlighting chassis engineering, luxury, and technology.",
  },
  {
    id: "auto_show_tokyo",
    city: "tokyo",
    name: "Tokyo Motor Show (Makuhari Messe / Big Sight)",
    month: 10, // October
    importanceTier: "global_major",
    description: "Futuristic Japanese technology, micro-mobility, sports coupes, and high-efficiency concepts.",
  },
];

export const STAND_TIER_CONFIG: Record<ExhibitionStandTier, StandTierCostAndImpact> = {
  corner_booth: {
    costEur: 45000,
    preOrdersGenerated: 350,
    brandAwarenessDelta: 6,
    pressCoverageScore: 40,
  },
  corporate_stand: {
    costEur: 220000,
    preOrdersGenerated: 1800,
    brandAwarenessDelta: 16,
    pressCoverageScore: 75,
  },
  reveal_rotunda_pavilion: {
    costEur: 1100000,
    preOrdersGenerated: 6200,
    brandAwarenessDelta: 38,
    pressCoverageScore: 98,
  },
};

export interface PressRoadTestResult {
  magazineName: string;
  country: string;
  overallRatingScore: number; // 0-100
  verdictQuote: string;
  accelerationScore: number; // 0-10
  handlingScore: number;     // 0-10
  qualityScore: number;      // 0-10
  valueScore: number;        // 0-10
  isCarOfTheYearNominee: boolean;
  wonCarOfTheYear: boolean;
  marketDemandMultiplier: number; // 0.80 (panned) to 1.45 (COTY winner)
}

export interface AutoShowLaunchResult {
  showName: string;
  standTier: ExhibitionStandTier;
  costEur: number;
  preOrdersReceived: number;
  newBrandAwarenessBonus: number;
  pressScore: number;
  summary: string;
}

export class AutoShowAndPressReviewEngine {
  /**
   * Check if an international auto show takes place in the current month
   */
  public static getActiveShowForMonth(month: number): AutoShowEvent | null {
    return AUTO_SHOW_CALENDAR.find(s => s.month === month) || null;
  }

  /**
   * Execute vehicle unveil at an international auto show
   */
  public static unveilVehicleAtShow(
    show: AutoShowEvent,
    standTier: ExhibitionStandTier,
    vehicleName: string,
    stylingScore: number = 75 // 0-100 from Vehicle Design HQ
  ): AutoShowLaunchResult {
    const tierConfig = STAND_TIER_CONFIG[standTier];
    const stylingMultiplier = 0.5 + (stylingScore / 100);

    const preOrdersReceived = Math.round(tierConfig.preOrdersGenerated * stylingMultiplier);
    const newBrandAwarenessBonus = Math.round(tierConfig.brandAwarenessDelta * (stylingScore > 80 ? 1.25 : 1.0));
    const pressScore = Math.min(100, Math.round(tierConfig.pressCoverageScore * (0.8 + stylingScore / 250)));

    return {
      showName: show.name,
      standTier,
      costEur: tierConfig.costEur,
      preOrdersReceived,
      newBrandAwarenessBonus,
      pressScore,
      summary: `World debut of ${vehicleName} at ${show.name} on ${standTier.replace(/_/g, " ")}. Generated ${preOrdersReceived.toLocaleString()} pre-orders and +${newBrandAwarenessBonus}% global awareness.`,
    };
  }

  /**
   * Dispatches production loaners to motoring press publications and compiles reviews
   */
  public static conductPressFleetReviews(
    vehicle: {
      name: string;
      zeroToSixtySec: number;
      topSpeedKmh: number;
      lateralG: number;
      qualityScore: number; // 0-100
      nvhQuietnessScore: number; // 0-100
      msrpPrice: number;
      year: number;
      campusPrestigeBonus?: number; // Phase 278: Wire campus prestige into press review scoring
    }
  ): {
    reviews: PressRoadTestResult[];
    compositeScore: number;
    salesDemandBoostPct: number;
    wonGoldenCalipersCOTY: boolean;
  } {
    // 1. Calculate category sub-scores (0-10 scale)
    const accelerationScore = Math.min(10, Math.max(1, Math.round((12.0 - vehicle.zeroToSixtySec) * 1.3 * 10) / 10));
    const handlingScore = Math.min(10, Math.max(1, Math.round((vehicle.lateralG - 0.55) * 18 * 10) / 10));
    const qualityScore = Math.min(10, Math.max(1, Math.round((vehicle.qualityScore / 10) * 10) / 10));
    const valueRatio = Math.min(1.5, 80000 / Math.max(25000, vehicle.msrpPrice));
    const valueScore = Math.min(10, Math.max(3, Math.round((5.0 + valueRatio * 3.5) * 10) / 10));

    const campusBonus = vehicle.campusPrestigeBonus || 0;
    const overallRatingScore = Math.min(
      100,
      Math.round(
        (accelerationScore * 2.5 + handlingScore * 2.5 + qualityScore * 3.0 + valueScore * 2.0) + campusBonus
      )
    );

    const isCarOfTheYearNominee = overallRatingScore >= 82;
    const wonGoldenCalipersCOTY = overallRatingScore >= 90;

    let demandMultiplier = 1.0;
    if (wonGoldenCalipersCOTY) {
      demandMultiplier = 1.45; // +45% massive sales spike for Car of the Year
    } else if (overallRatingScore >= 80) {
      demandMultiplier = 1.25; // Great road test results
    } else if (overallRatingScore < 60) {
      demandMultiplier = 0.82; // Criticized for poor handling or reliability
    }

    const reviews: PressRoadTestResult[] = [
      {
        magazineName: "Car and Driver",
        country: "United States",
        overallRatingScore,
        verdictQuote: wonGoldenCalipersCOTY
          ? "A transcendent triumph of road manners, blistering speed, and chassis poise."
          : overallRatingScore >= 75
          ? "Solid execution with punchy dynamics that reward an eager right foot."
          : "Lacks composure under hard cornering and needs interior fitment refinement.",
        accelerationScore,
        handlingScore,
        qualityScore,
        valueScore,
        isCarOfTheYearNominee,
        wonCarOfTheYear: wonGoldenCalipersCOTY,
        marketDemandMultiplier: demandMultiplier,
      },
      {
        magazineName: "Autocar",
        country: "United Kingdom",
        overallRatingScore: Math.round(overallRatingScore * 0.98),
        verdictQuote: overallRatingScore >= 80
          ? "Superbly sorted damping across scarred B-roads with immediate steering response."
          : "Chassis compliance leaves something to be desired on uneven British tarmac.",
        accelerationScore,
        handlingScore,
        qualityScore,
        valueScore,
        isCarOfTheYearNominee,
        wonCarOfTheYear: false,
        marketDemandMultiplier: demandMultiplier,
      },
      {
        magazineName: "Road & Track",
        country: "United States",
        overallRatingScore: Math.round(overallRatingScore * 1.02),
        verdictQuote: `We pulled ${vehicle.lateralG}g on the skidpad. This machine speaks directly to driving purists.`,
        accelerationScore,
        handlingScore,
        qualityScore,
        valueScore,
        isCarOfTheYearNominee,
        wonCarOfTheYear: false,
        marketDemandMultiplier: demandMultiplier,
      },
    ];

    const salesDemandBoostPct = Math.round((demandMultiplier - 1.0) * 100);

    return {
      reviews,
      compositeScore: overallRatingScore,
      salesDemandBoostPct,
      wonGoldenCalipersCOTY,
    };
  }
}
