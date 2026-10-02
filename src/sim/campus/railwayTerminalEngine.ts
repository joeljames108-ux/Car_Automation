/**
 * ═══════════════════════════════════════════════════════════════════════
 * HQ CARGO RAILWAY TERMINAL & INDUSTRIAL LOGISTICS ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements the comprehensive physical rail logistics facility on the
 * Automotive Corporate Campus (Zone A: Logistics & Production Perimeter).
 *
 * Core Mechanics:
 * 1. Multi-Level Facility Progression (Level 0 Unconnected Yard to Level 5 Continental Mega-Hub)
 * 2. Strict Capital Investment (Player liquid cash CapEx; never auto-advances with calendar)
 * 3. Daily Throughput Capacity (t/day) vs. Aggregate Demand (Inbound BOM + Outbound Cars)
 * 4. Truck Spillover & Overflow Penalty (Higher cost/t-km, transit delays, stockout risk)
 * 5. Specialized Siding Add-ons (Bulk Ore Gantry, Container CFS, Liquid Manifold, Auto-Racks)
 * 6. Rail Network Trunk Connectivity Tiers (Local -> Regional -> National -> Continental)
 * 7. B2B Competitor Utility (Monetizing surplus terminal slots to rival automakers)
 */

export type RailwayTerminalTier =
  | "unconnected_yard"
  | "single_spur"
  | "dual_depot"
  | "intermodal_yard"
  | "automated_hub"
  | "continental_terminal";

export type SpecializedSidingType =
  | "BULK_ORE_COIL_GANTRY"
  | "CONTAINER_CFS"
  | "LIQUID_TANKER_MANIFOLD"
  | "AUTORACK_STAGING_RAMP";

export type RailNetworkTier =
  | "LOCAL_SPUR"
  | "REGIONAL_CORRIDOR"
  | "NATIONAL_NETWORK"
  | "TRANS_CONTINENTAL_EXPRESS";

export interface RailwayTerminalLevelSpec {
  level: number;
  name: string;
  tier: RailwayTerminalTier;
  capitalCostUSD: number;          // CapEx required to upgrade
  constructionMonths: number;      // Civil construction duration
  monthlyMaintenanceUSD: number;   // Track maintenance, shunting, switch heaters
  dailyTonnageCapacity: number;    // Maximum freight throughput (tonnes/day)
  maxDailyCarriers: number;        // Max freight train movements per day
  freightCostSavingsPct: number;   // Cost reduction vs. overland road trucking (0.0 to 1.0)
  transitTimeReductionPct: number; // Transit time speedup vs. baseline road freight
  bottleneckResistanceScore: number;// 0 - 100 resilience against port/strike congestion
  autoRackVehiclesPerDay: number;  // Max finished vehicles loaded onto rail per day
  maxThirdPartyLeaseTonnes: number;// Max spare daily capacity leasable to competitors
  description: string;
}

export interface SpecializedSidingSpec {
  id: SpecializedSidingType;
  name: string;
  costUSD: number;
  monthlyUpkeepUSD: number;
  minTerminalLevel: number;
  procurementDiscountPct: number; // Applied to specific BOM materials
  defectReductionPpm: number;
  deliveryReliabilityBonusPct: number;
  description: string;
}

export interface NetworkConnectionSpec {
  tier: RailNetworkTier;
  name: string;
  costUSD: number;
  reputationRequired: number;
  speedKmh: number;
  transitSpeedupMultiplier: number; // Multiplier on route transit days
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════
// SPECIFICATION REGISTRIES
// ═══════════════════════════════════════════════════════════════════════

export const RAILWAY_LEVEL_SPECS: Record<number, RailwayTerminalLevelSpec> = {
  0: {
    level: 0,
    name: "Unconnected Dirt Staging Yard",
    tier: "unconnected_yard",
    capitalCostUSD: 0,
    constructionMonths: 0,
    monthlyMaintenanceUSD: 5_000,
    dailyTonnageCapacity: 0,
    maxDailyCarriers: 0,
    freightCostSavingsPct: 0.0,
    transitTimeReductionPct: 0.0,
    bottleneckResistanceScore: 10,
    autoRackVehiclesPerDay: 0,
    maxThirdPartyLeaseTonnes: 0,
    description: "Gravel yard with no rail connection. 100% of freight moves via expensive road truck convoys.",
  },
  1: {
    level: 1,
    name: "Single Industrial Rail Spur",
    tier: "single_spur",
    capitalCostUSD: 1_250_000,
    constructionMonths: 4,
    monthlyMaintenanceUSD: 35_000,
    dailyTonnageCapacity: 600,
    maxDailyCarriers: 1,
    freightCostSavingsPct: 0.35,
    transitTimeReductionPct: 0.15,
    bottleneckResistanceScore: 35,
    autoRackVehiclesPerDay: 20,
    maxThirdPartyLeaseTonnes: 100,
    description: "Single ballasted siding with wooden freight shed, diesel shunter, and flatcar loading for raw coils.",
  },
  2: {
    level: 2,
    name: "Covered Freight Depot & Dual Siding",
    tier: "dual_depot",
    capitalCostUSD: 3_800_000,
    constructionMonths: 6,
    monthlyMaintenanceUSD: 95_000,
    dailyTonnageCapacity: 2_500,
    maxDailyCarriers: 3,
    freightCostSavingsPct: 0.45,
    transitTimeReductionPct: 0.25,
    bottleneckResistanceScore: 50,
    autoRackVehiclesPerDay: 120,
    maxThirdPartyLeaseTonnes: 600,
    description: "Two parallel tracks with turnout switch, 20t overhead bridge crane, and 2-tier auto-rack ramp.",
  },
  3: {
    level: 3,
    name: "Intermodal Container & Marshalling Yard",
    tier: "intermodal_yard",
    capitalCostUSD: 9_500_000,
    constructionMonths: 8,
    monthlyMaintenanceUSD: 220_000,
    dailyTonnageCapacity: 8_000,
    maxDailyCarriers: 6,
    freightCostSavingsPct: 0.55,
    transitTimeReductionPct: 0.40,
    bottleneckResistanceScore: 70,
    autoRackVehiclesPerDay: 450,
    maxThirdPartyLeaseTonnes: 2_500,
    description: "4 classification tracks with Rail-Mounted Gantry crane, stacked ISO containers, and chemical siding.",
  },
  4: {
    level: 4,
    name: "Automated Logistics Rail Hub",
    tier: "automated_hub",
    capitalCostUSD: 24_000_000,
    constructionMonths: 12,
    monthlyMaintenanceUSD: 480_000,
    dailyTonnageCapacity: 20_000,
    maxDailyCarriers: 14,
    freightCostSavingsPct: 0.65,
    transitTimeReductionPct: 0.55,
    bottleneckResistanceScore: 85,
    autoRackVehiclesPerDay: 1_500,
    maxThirdPartyLeaseTonnes: 8_000,
    description: "6 electrified tracks with overhead catenary, twin RTG cranes, and multi-tier auto-rack terminal.",
  },
  5: {
    level: 5,
    name: "Continental High-Speed Intermodal Mega-Terminal",
    tier: "continental_terminal",
    capitalCostUSD: 65_000_000,
    constructionMonths: 18,
    monthlyMaintenanceUSD: 1_100_000,
    dailyTonnageCapacity: 50_000,
    maxDailyCarriers: 30,
    freightCostSavingsPct: 0.75,
    transitTimeReductionPct: 0.70,
    bottleneckResistanceScore: 98,
    autoRackVehiclesPerDay: 4_000,
    maxThirdPartyLeaseTonnes: 25_000,
    description: "8 high-speed slab tracks, aero electric freight loco, ASRS container stacks, and direct factory tunnel.",
  },
};

export const SPECIALIZED_SIDINGS: Record<SpecializedSidingType, SpecializedSidingSpec> = {
  BULK_ORE_COIL_GANTRY: {
    id: "BULK_ORE_COIL_GANTRY",
    name: "Heavy Bulk Ore & Coil Gantry",
    costUSD: 1_200_000,
    monthlyUpkeepUSD: 22_000,
    minTerminalLevel: 1,
    procurementDiscountPct: 0.04, // 4% raw material procurement discount
    defectReductionPpm: 0,
    deliveryReliabilityBonusPct: 0.02,
    description: "Heavy-duty gantry for direct offloading of steel coils and casting pig iron directly into warehouse yards.",
  },
  CONTAINER_CFS: {
    id: "CONTAINER_CFS",
    name: "Intermodal Container Freight Station (CFS)",
    costUSD: 2_400_000,
    monthlyUpkeepUSD: 45_000,
    minTerminalLevel: 2,
    procurementDiscountPct: 0.02,
    defectReductionPpm: 85,       // Eliminates in-transit shock damage for electronics & ECUs
    deliveryReliabilityBonusPct: 0.04,
    description: "Weather-tight container de-stuffing station with barcode scanning and zero in-transit moisture damage.",
  },
  LIQUID_TANKER_MANIFOLD: {
    id: "LIQUID_TANKER_MANIFOLD",
    name: "Liquid Chemical & Bulk Fluid Siding",
    costUSD: 1_600_000,
    monthlyUpkeepUSD: 28_000,
    minTerminalLevel: 2,
    procurementDiscountPct: 0.12, // 12% discount on bulk engine oils, paints, coolants, and battery precursors
    defectReductionPpm: 15,
    deliveryReliabilityBonusPct: 0.03,
    description: "Direct pumping manifold from rail tank cars into hazardous material and paint shop chemical storage.",
  },
  AUTORACK_STAGING_RAMP: {
    id: "AUTORACK_STAGING_RAMP",
    name: "Bi-Level Auto-Rack Vehicle Loading Hub",
    costUSD: 3_200_000,
    monthlyUpkeepUSD: 60_000,
    minTerminalLevel: 2,
    procurementDiscountPct: 0.0,
    defectReductionPpm: 120,      // Eliminates transit road stone-chip damage on new cars
    deliveryReliabilityBonusPct: 0.08, // Dealership delivery reliability reaches up to 99.2%
    description: "Direct roll-on roll-off staging ramp connecting factory end-of-line test track to enclosed auto-rack trains.",
  },
};

export const NETWORK_CONNECTIONS: Record<RailNetworkTier, NetworkConnectionSpec> = {
  LOCAL_SPUR: {
    tier: "LOCAL_SPUR",
    name: "Local Municipal Branch Spur",
    costUSD: 0,                   // Unlocked with Level 1 terminal
    reputationRequired: 0,
    speedKmh: 45,
    transitSpeedupMultiplier: 1.0,
    description: "Standard local industrial siding subject to branch line speed restrictions (45 km/h) and local dispatch curfews.",
  },
  REGIONAL_CORRIDOR: {
    tier: "REGIONAL_CORRIDOR",
    name: "Regional Industrial Freight Trunk",
    costUSD: 2_500_000,
    reputationRequired: 25,
    speedKmh: 75,
    transitSpeedupMultiplier: 0.75, // -25% transit time
    description: "Direct connection to the main national freight arterial; unlocks direct routes to heavy industrial supplier basins.",
  },
  NATIONAL_NETWORK: {
    tier: "NATIONAL_NETWORK",
    name: "National Electrified Priority Network",
    costUSD: 8_000_000,
    reputationRequired: 50,
    speedKmh: 100,
    transitSpeedupMultiplier: 0.55, // -45% transit time
    description: "High-priority scheduled train paths avoiding passenger curfew delays with nationwide container coverage.",
  },
  TRANS_CONTINENTAL_EXPRESS: {
    tier: "TRANS_CONTINENTAL_EXPRESS",
    name: "Trans-Continental Port & Export Express",
    costUSD: 22_000_000,
    reputationRequired: 75,
    speedKmh: 140,
    transitSpeedupMultiplier: 0.40, // -60% transit time
    description: "Dedicated high-speed freight corridor directly linking HQ to deepwater export ports and international borders.",
  },
};

// ═══════════════════════════════════════════════════════════════════════
// STATE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════

export interface RailwayTerminalState {
  level: number;
  operationalStatus: "operational" | "under_construction";
  constructionProgressMonths: number;
  installedSidings: SpecializedSidingType[];
  networkTier: RailNetworkTier;
  leasedThirdPartyTonnesDaily: number; // Capacity rented to competitors (t/day)
  leaseRateUSDPerTonne: number;        // Rent price charged ($ / tonne, e.g. $32)
  accumulatedSavingsUSD: number;
  totalTonnesProcessedRail: number;
  totalTonnesOverflowedTruck: number;
  totalVehiclesShippedRail: number;
  totalVehiclesOverflowedTruck: number;
}

export interface DailyFreightDispatchInput {
  inboundMaterialsTonnes: number; // Raw steel, aluminium, polymers, cells
  outboundComponentsTonnes: number; // B2B contract shipments, spares
  outboundVehiclesCount: number;  // Finished cars to dealerships & ports
  averageVehicleWeightTonnes?: number; // Default: 1.6 tonnes
  averageDistanceKm?: number;      // Default: 450 km
}

export interface DailyFreightDispatchResult {
  totalDemandTonnes: number;
  railCapacityTonnes: number;
  railCarriedTonnes: number;
  railCarriedVehicles: number;
  truckOverflowTonnes: number;
  truckOverflowVehicles: number;
  isCapacityExceeded: boolean;
  capacityUtilizationPct: number;
  dailyFreightCostUSD: number;
  dailyCostSavingsUSD: number;
  effectiveTransitDays: number;
  delayRiskPct: number;
  bottleneckAlerts: string[];
}

export interface MonthlyRailEconomics {
  facilityMaintenanceCostUSD: number;
  sidingsMaintenanceCostUSD: number;
  totalFacilityExpenseUSD: number;
  thirdPartyLeaseIncomeUSD: number;
  netTerminalProfitLossUSD: number;
  monthlyTonnageRail: number;
  monthlyTonnageTruckOverflow: number;
  estimatedFreightSavingsUSD: number;
}

// ═══════════════════════════════════════════════════════════════════════
// MASTER RAILWAY SIMULATION ENGINE
// ═══════════════════════════════════════════════════════════════════════

export class RailwayTerminalEngine {
  /**
   * Generates the default initial state for a 1970 startup (Level 0 Unconnected Yard).
   */
  public static createInitialState(): RailwayTerminalState {
    return {
      level: 0,
      operationalStatus: "operational",
      constructionProgressMonths: 0,
      installedSidings: [],
      networkTier: "LOCAL_SPUR",
      leasedThirdPartyTonnesDaily: 0,
      leaseRateUSDPerTonne: 32.0,
      accumulatedSavingsUSD: 0,
      totalTonnesProcessedRail: 0,
      totalTonnesOverflowedTruck: 0,
      totalVehiclesShippedRail: 0,
      totalVehiclesOverflowedTruck: 0,
    };
  }

  /**
   * Processes a single day's freight transport through the terminal.
   * Splits cargo between high-efficiency rail and road truck overflow.
   */
  public static processDailyFreightFlow(
    input: DailyFreightDispatchInput,
    state: RailwayTerminalState
  ): DailyFreightDispatchResult {
    const avgCarWeight = input.averageVehicleWeightTonnes ?? 1.6;
    const distanceKm = input.averageDistanceKm ?? 450;
    const vehicleTonnes = input.outboundVehiclesCount * avgCarWeight;
    const totalDemandTonnes = input.inboundMaterialsTonnes + input.outboundComponentsTonnes + vehicleTonnes;

    const levelSpec = RAILWAY_LEVEL_SPECS[state.level] ?? RAILWAY_LEVEL_SPECS[0];
    const networkSpec = NETWORK_CONNECTIONS[state.networkTier] ?? NETWORK_CONNECTIONS.LOCAL_SPUR;

    // Available daily rail capacity after dedicated 3rd-party competitor leases
    const availableRailCapacity = Math.max(0, levelSpec.dailyTonnageCapacity - state.leasedThirdPartyTonnesDaily);

    // 1. Calculate Rail Allocation vs. Truck Overflow
    const railCarriedTonnes = Math.min(totalDemandTonnes, availableRailCapacity);
    const truckOverflowTonnes = Math.max(0, totalDemandTonnes - availableRailCapacity);
    const isCapacityExceeded = truckOverflowTonnes > 0;
    const capacityUtilizationPct = availableRailCapacity > 0
      ? Math.min(100, (totalDemandTonnes / availableRailCapacity) * 100)
      : 100.0;

    // 2. Allocate Finished Vehicles to Auto-Rack Rails
    const maxRailCars = levelSpec.autoRackVehiclesPerDay;
    const railCarriedVehicles = Math.min(input.outboundVehiclesCount, maxRailCars);
    const truckOverflowVehicles = Math.max(0, input.outboundVehiclesCount - railCarriedVehicles);

    // 3. Freight Cost Calculations
    // Baseline overland trucking freight rate: $6.50 / tonne-km
    const truckRatePerTonneKm = 6.50;
    // Rail freight rate: reduced by levelSpec savings (e.g. L3 = 55% discount -> $2.925/t-km)
    const effectiveRailDiscount = levelSpec.freightCostSavingsPct;
    const railRatePerTonneKm = truckRatePerTonneKm * (1 - effectiveRailDiscount);

    // Baseline cost if 100% went by road truck
    const baselineTruckTotalCost = totalDemandTonnes * distanceKm * truckRatePerTonneKm;

    // Actual cost = (Rail Tonnes * Rail Rate) + (Overflow Tonnes * Truck Rate)
    const actualRailCost = railCarriedTonnes * distanceKm * railRatePerTonneKm;
    const actualOverflowCost = truckOverflowTonnes * distanceKm * truckRatePerTonneKm;
    const totalDailyFreightCost = actualRailCost + actualOverflowCost;
    const dailyCostSavings = Math.max(0, baselineTruckTotalCost - totalDailyFreightCost);

    // 4. Transit Time & Delay Risk
    // Baseline transit hours at 65 km/h road trucking
    const baseRoadTransitHours = distanceKm / 65 + 4; // +4h loading
    let transitHours = baseRoadTransitHours;
    if (state.level > 0 && availableRailCapacity > 0) {
      const trainSpeed = networkSpec.speedKmh;
      const trainHours = (distanceKm / trainSpeed) * networkSpec.transitSpeedupMultiplier + 6; // +6h shunting
      // Weighted blend by modal split
      const railRatio = totalDemandTonnes > 0 ? railCarriedTonnes / totalDemandTonnes : 0;
      transitHours = (trainHours * railRatio) + (baseRoadTransitHours * (1 - railRatio));
    }
    const effectiveTransitDays = Math.max(1, Math.ceil(transitHours / 24));

    // Delay risk based on bottleneck resistance score and overflow proportion
    const overflowRatio = totalDemandTonnes > 0 ? truckOverflowTonnes / totalDemandTonnes : 0;
    let delayRiskPct = Math.max(2, 100 - levelSpec.bottleneckResistanceScore);
    if (overflowRatio > 0.3) {
      delayRiskPct += Math.round(overflowRatio * 20); // Up to +20% extra risk when heavily congested
    }

    // 5. Generate Diagnostic Alerts
    const bottleneckAlerts: string[] = [];
    if (state.level === 0) {
      bottleneckAlerts.push("NO RAIL INFRASTRUCTURE: 100% of freight is moving via expensive overland road truck convoys.");
    } else if (isCapacityExceeded) {
      bottleneckAlerts.push(
        `RAIL TERMINAL OVERFLOW: Demand (${totalDemandTonnes.toFixed(0)} t/d) exceeded terminal capacity (${availableRailCapacity.toFixed(0)} t/d). ` +
        `${truckOverflowTonnes.toFixed(0)} tonnes diverted to road trucks (+${((truckOverflowTonnes / totalDemandTonnes) * 100).toFixed(0)}% cost surcharge).`
      );
    }
    if (truckOverflowVehicles > 0) {
      bottleneckAlerts.push(
        `AUTO-RACK DEFICIT: ${truckOverflowVehicles} finished vehicles shipped via open road car-haulers due to lack of rail car slots.`
      );
    }

    return {
      totalDemandTonnes: Number(totalDemandTonnes.toFixed(1)),
      railCapacityTonnes: availableRailCapacity,
      railCarriedTonnes: Number(railCarriedTonnes.toFixed(1)),
      railCarriedVehicles,
      truckOverflowTonnes: Number(truckOverflowTonnes.toFixed(1)),
      truckOverflowVehicles,
      isCapacityExceeded,
      capacityUtilizationPct: Number(capacityUtilizationPct.toFixed(1)),
      dailyFreightCostUSD: Number(totalDailyFreightCost.toFixed(2)),
      dailyCostSavingsUSD: Number(dailyCostSavings.toFixed(2)),
      effectiveTransitDays,
      delayRiskPct: Math.min(95, delayRiskPct),
      bottleneckAlerts,
    };
  }

  /**
   * Computes the complete monthly financial and operational ledger for the terminal.
   */
  public static calculateMonthlyEconomics(
    state: RailwayTerminalState,
    averageDailyDemand: DailyFreightDispatchInput
  ): MonthlyRailEconomics {
    const levelSpec = RAILWAY_LEVEL_SPECS[state.level] ?? RAILWAY_LEVEL_SPECS[0];
    const facilityMaintenance = levelSpec.monthlyMaintenanceUSD;

    // Sum maintenance of installed specialized sidings
    let sidingsMaintenance = 0;
    state.installedSidings.forEach((sidId) => {
      const spec = SPECIALIZED_SIDINGS[sidId];
      if (spec) sidingsMaintenance += spec.monthlyUpkeepUSD;
    });

    const totalFacilityExpense = facilityMaintenance + sidingsMaintenance;

    // 3rd-party competitor leasing income
    // E.g. 2,000 t/d * 30 days * $32/t = $1,920,000 / month
    const thirdPartyLeaseIncome = state.leasedThirdPartyTonnesDaily * 30 * state.leaseRateUSDPerTonne;

    // Simulate 30 days of freight flow
    const dailyDispatch = this.processDailyFreightFlow(averageDailyDemand, state);
    const monthlyTonnageRail = dailyDispatch.railCarriedTonnes * 30;
    const monthlyTonnageTruckOverflow = dailyDispatch.truckOverflowTonnes * 30;
    const estimatedFreightSavings = dailyDispatch.dailyCostSavingsUSD * 30;

    const netTerminalProfitLoss = thirdPartyLeaseIncome - totalFacilityExpense;

    return {
      facilityMaintenanceCostUSD: facilityMaintenance,
      sidingsMaintenanceCostUSD: sidingsMaintenance,
      totalFacilityExpenseUSD: totalFacilityExpense,
      thirdPartyLeaseIncomeUSD: Math.round(thirdPartyLeaseIncome),
      netTerminalProfitLossUSD: Math.round(netTerminalProfitLoss),
      monthlyTonnageRail: Math.round(monthlyTonnageRail),
      monthlyTonnageTruckOverflow: Math.round(monthlyTonnageTruckOverflow),
      estimatedFreightSavingsUSD: Math.round(estimatedFreightSavings),
    };
  }

  /**
   * Upgrades the Railway Terminal to the target level.
   * STRICT CAPITAL GATE: Requires exact liquid cash; fails immediately if funds are insufficient.
   */
  public static upgradeTerminalTier(
    state: RailwayTerminalState,
    targetLevel: number,
    playerCash: number
  ): { success: boolean; updatedState: RailwayTerminalState; remainingCash: number; errorReason?: string } {
    if (targetLevel <= state.level) {
      return { success: false, updatedState: state, remainingCash: playerCash, errorReason: "Target level must be higher than current level." };
    }
    if (targetLevel > 5) {
      return { success: false, updatedState: state, remainingCash: playerCash, errorReason: "Maximum facility level is Level 5." };
    }

    const nextSpec = RAILWAY_LEVEL_SPECS[targetLevel];
    if (!nextSpec) {
      return { success: false, updatedState: state, remainingCash: playerCash, errorReason: `Invalid target level ${targetLevel}.` };
    }

    if (playerCash < nextSpec.capitalCostUSD) {
      return {
        success: false,
        updatedState: state,
        remainingCash: playerCash,
        errorReason: `INSUFFICIENT CAPITAL: Upgrading to Level ${targetLevel} (${nextSpec.name}) requires $${(nextSpec.capitalCostUSD / 1e6).toFixed(2)}M, but player treasury has only $${(playerCash / 1e6).toFixed(2)}M.`,
      };
    }

    const remainingCash = playerCash - nextSpec.capitalCostUSD;
    const updatedState: RailwayTerminalState = {
      ...state,
      level: targetLevel,
      operationalStatus: "operational",
    };

    return {
      success: true,
      updatedState,
      remainingCash,
    };
  }

  /**
   * Installs a specialized siding add-on.
   * Gated by terminal level and liquid capital.
   */
  public static installSpecializedSiding(
    state: RailwayTerminalState,
    sidingId: SpecializedSidingType,
    playerCash: number
  ): { success: boolean; updatedState: RailwayTerminalState; remainingCash: number; errorReason?: string } {
    if (state.installedSidings.includes(sidingId)) {
      return { success: false, updatedState: state, remainingCash: playerCash, errorReason: "Siding module is already installed." };
    }

    const spec = SPECIALIZED_SIDINGS[sidingId];
    if (!spec) {
      return { success: false, updatedState: state, remainingCash: playerCash, errorReason: "Unknown siding module specification." };
    }

    if (state.level < spec.minTerminalLevel) {
      return {
        success: false,
        updatedState: state,
        remainingCash: playerCash,
        errorReason: `FACILITY LEVEL INSUFFICIENT: ${spec.name} requires Railway Terminal Level ${spec.minTerminalLevel}+. Current level is Level ${state.level}.`,
      };
    }

    if (playerCash < spec.costUSD) {
      return {
        success: false,
        updatedState: state,
        remainingCash: playerCash,
        errorReason: `INSUFFICIENT CAPITAL: Installing ${spec.name} costs $${(spec.costUSD / 1e6).toFixed(2)}M, but player has $${(playerCash / 1e6).toFixed(2)}M.`,
      };
    }

    const remainingCash = playerCash - spec.costUSD;
    const updatedState: RailwayTerminalState = {
      ...state,
      installedSidings: [...state.installedSidings, sidingId],
    };

    return {
      success: true,
      updatedState,
      remainingCash,
    };
  }

  /**
   * Upgrades the rail trunk network connectivity tier.
   * Gated by corporate reputation and capital cost.
   */
  public static upgradeNetworkTier(
    state: RailwayTerminalState,
    targetTier: RailNetworkTier,
    corporateReputation: number,
    playerCash: number
  ): { success: boolean; updatedState: RailwayTerminalState; remainingCash: number; errorReason?: string } {
    const spec = NETWORK_CONNECTIONS[targetTier];
    if (!spec) {
      return { success: false, updatedState: state, remainingCash: playerCash, errorReason: "Invalid network tier." };
    }

    if (corporateReputation < spec.reputationRequired) {
      return {
        success: false,
        updatedState: state,
        remainingCash: playerCash,
        errorReason: `REPUTATION GATE: Access to the ${spec.name} requires corporate reputation score of ${spec.reputationRequired}+ (Current: ${corporateReputation.toFixed(0)}).`,
      };
    }

    if (playerCash < spec.costUSD) {
      return {
        success: false,
        updatedState: state,
        remainingCash: playerCash,
        errorReason: `INSUFFICIENT CAPITAL: Connecting to ${spec.name} requires concession fee of $${(spec.costUSD / 1e6).toFixed(2)}M (Current Cash: $${(playerCash / 1e6).toFixed(2)}M).`,
      };
    }

    const remainingCash = playerCash - spec.costUSD;
    const updatedState: RailwayTerminalState = {
      ...state,
      networkTier: targetTier,
    };

    return {
      success: true,
      updatedState,
      remainingCash,
    };
  }

  /**
   * Configures B2B competitor capacity leasing.
   * Prevents over-committing beyond maximum third-party lease limit.
   */
  public static setThirdPartyLease(
    state: RailwayTerminalState,
    tonnesPerDay: number,
    rateUSDPerTonne: number = 32.0
  ): { success: boolean; updatedState: RailwayTerminalState; errorReason?: string } {
    const levelSpec = RAILWAY_LEVEL_SPECS[state.level] ?? RAILWAY_LEVEL_SPECS[0];
    if (tonnesPerDay < 0) {
      return { success: false, updatedState: state, errorReason: "Lease capacity cannot be negative." };
    }
    if (tonnesPerDay > levelSpec.maxThirdPartyLeaseTonnes) {
      return {
        success: false,
        updatedState: state,
        errorReason: `EXCEEDS MAXIMUM LEASE CAPACITY: Level ${state.level} facility allows a maximum of ${levelSpec.maxThirdPartyLeaseTonnes.toLocaleString()} t/d leased to 3rd parties.`,
      };
    }

    const updatedState: RailwayTerminalState = {
      ...state,
      leasedThirdPartyTonnesDaily: tonnesPerDay,
      leaseRateUSDPerTonne: Math.max(10, rateUSDPerTonne),
    };

    return {
      success: true,
      updatedState,
    };
  }
}
