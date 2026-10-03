/**
 * ═══════════════════════════════════════════════════════════════════════
 * TRADE STORE — ZUSTAND MASTER PROCUREMENT & SUPPLY CHAIN STATE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements the player-facing Trade & Supply Chain State:
 * - Active supplier contracts & spot purchase queue
 * - Warehouse inventory stockpiles & safety buffer policy
 * - Multi-modal freight logistics & factory rail spur status
 * - B2B competitor component sales
 * - Monthly supply chain heartbeat execution
 */

import { create } from "zustand";
import {
  ActiveSupplierContract,
  B2BCustomerContract,
  ComponentCategory,
  InventoryPolicyType,
  LogisticsRoute,
  MonthlySupplyChainSummary,
  ProcessedMaterialType,
  SpotCommodityQuote,
  SupplierContractType,
  WarehouseInventoryRecord,
} from "../sim/trade/tradeTypes";
import {
  INITIAL_1970_WAREHOUSE_INVENTORY,
  calculateInventoryValuation,
  applyInventoryPolicy,
} from "../sim/trade/inventoryWarehouseEngine";
import { NPC_SUPPLIERS } from "../sim/trade/supplierRegistry";
import { BASELINE_MARKET_PRICES, getCompetitiveBids, createActiveSupplierContract } from "../sim/trade/tradeContractEngine";
import { evaluateProductionFeasibility, STANDARD_VEHICLE_BOM_REQUIREMENTS } from "../sim/trade/supplyDisruptionEngine";
import { calculateFreightShipment } from "../sim/trade/logisticsRouteEngine";
import { calculateScrapRecovery, ManufacturingIntegrationParadigm } from "../sim/trade/verticalIntegrationEngine";
import { AVAILABLE_B2B_OPPORTUNITIES, processMonthlyB2BFulfillments } from "../sim/trade/b2bSalesEngine";
import {
  HQWarehouseState,
  INITIAL_HQ_WAREHOUSE_STATE,
  processMonthlyWarehouseTick,
  startWarehouseUpgrade,
  checkWarehouseUpgradeEligibility,
  getWarehouseSummary,
  type WarehouseSummaryForUI,
} from "../sim/trade/hqWarehouseEngine";
import { useCompanyFinanceStore } from "./companyFinanceStore";
import { useSimulationClockStore } from "./simulationClockStore";

export const INITIAL_SPOT_QUOTES: SpotCommodityQuote[] = [
  {
    type: "BASIC_CARBON_STEEL",
    name: "Automotive Stamping Sheet Steel",
    unit: "tonne",
    spotPriceINR: 52000,
    dailyChangePct: 0.8,
    volatilityIndex: 0.15,
    globalScarcity: "NORMAL",
    description: "Cold-rolled continuous sheet for unibody structures and exterior panels",
  },
  {
    type: "ALUMINUM_SHEET_6000",
    name: "Grade 6061-T6 Structural Aluminum",
    unit: "tonne",
    spotPriceINR: 185000,
    dailyChangePct: -0.4,
    volatilityIndex: 0.22,
    globalScarcity: "NORMAL",
    description: "Lightweight alloy sheet for hoods, trunklids, and bumper beam extrusions",
  },
  {
    type: "ADVANCED_UHSS_STEEL",
    name: "Martensitic Ultra-High-Strength Steel",
    unit: "tonne",
    spotPriceINR: 135000,
    dailyChangePct: 1.2,
    volatilityIndex: 0.28,
    globalScarcity: "CONSTRAINED",
    description: "Ultra-rigid boron steel for A/B pillars and passenger safety rigid cells",
  },
  {
    type: "DUCTILE_CAST_IRON",
    name: "Nodular Grey & Ductile Iron",
    unit: "tonne",
    spotPriceINR: 62000,
    dailyChangePct: 0.1,
    volatilityIndex: 0.12,
    globalScarcity: "ABUNDANT",
    description: "High damping capacity cast iron for engine cylinder blocks and brake rotors",
  },
  {
    type: "VULCANIZED_RUBBER",
    name: "Synthetic & Natural SBR Elastomers",
    unit: "tonne",
    spotPriceINR: 95000,
    dailyChangePct: 1.5,
    volatilityIndex: 0.35,
    globalScarcity: "CONSTRAINED",
    description: "Specialized silica-reinforced polymer for high-performance automotive tyres",
  },
  {
    type: "AUTOMOTIVE_FLOAT_GLASS",
    name: "Solar-Reflective Float Glass",
    unit: "tonne",
    spotPriceINR: 68000,
    dailyChangePct: -0.2,
    volatilityIndex: 0.14,
    globalScarcity: "NORMAL",
    description: "Optical clear float glass for curved windshields and side glass lamination",
  },
  {
    type: "ELECTROLYTIC_COPPER",
    name: "Grade A High-Purity Electrolytic Copper",
    unit: "tonne",
    spotPriceINR: 650000,
    dailyChangePct: 0.5,
    volatilityIndex: 0.32,
    globalScarcity: "NORMAL",
    description: "Electrical conductors for full-vehicle wiring looms and alternator stators",
  },
  {
    type: "TITANIUM_GRADE_5",
    name: "Aerospace Ti-6Al-4V Alloy",
    unit: "kg",
    spotPriceINR: 3200,
    dailyChangePct: 2.1,
    volatilityIndex: 0.45,
    globalScarcity: "CRITICAL_SHORTAGE",
    description: "Ultra-high strength-to-weight titanium for racing conrods and exhaust manifolds",
  },
];

export const INITIAL_1970_SUPPLIER_CONTRACTS: ActiveSupplierContract[] = [
  {
    contractId: "sc_atlas_steel_1970_01",
    supplierId: "atlas_steel_co",
    supplierName: "Atlas Industrial Steel Corp.",
    itemCategory: "BASIC_CARBON_STEEL",
    itemName: "Automotive Steel Coil",
    contractType: "ANNUAL",
    monthlyCommittedVolume: 25, // tonnes/mo
    agreedPricePerUnit: 49500, // 5% discount
    paymentTerms: "NET_30",
    qualityVector: { ...NPC_SUPPLIERS[0].baseQualityVector },
    startMonth: 1,
    startYear: 1970,
    totalDurationMonths: 12,
    monthsRemaining: 12,
    discountPercentage: 5.0,
    priorityDelivery: false,
    penaltyClauseActive: true,
    fulfilledThisMonth: 25,
  },
  {
    contractId: "sc_apex_tyres_1970_01",
    supplierId: "apex_elastomers_tyres",
    supplierName: "Apex Tyre & Rubber Technologies",
    itemCategory: "TYRES_WHEELS",
    itemName: "High-Grip Tyre & Wheel Sets",
    contractType: "ANNUAL",
    monthlyCommittedVolume: 20, // car sets
    agreedPricePerUnit: 30500,
    paymentTerms: "NET_30",
    qualityVector: { ...NPC_SUPPLIERS[5].baseQualityVector },
    startMonth: 1,
    startYear: 1970,
    totalDurationMonths: 12,
    monthsRemaining: 12,
    discountPercentage: 4.8,
    priorityDelivery: false,
    penaltyClauseActive: true,
    fulfilledThisMonth: 20,
  },
];

export interface TradeStoreState {
  // ── STATE ──────────────────────────────────────────────────────────
  warehouseInventory: WarehouseInventoryRecord[];
  activeSupplierContracts: ActiveSupplierContract[];
  activeB2BContracts: B2BCustomerContract[];
  spotCommodityQuotes: SpotCommodityQuote[];
  inventoryPolicy: InventoryPolicyType;
  hasFactoryRailSpur: boolean;
  hasRecyclingFacility: boolean;
  manufacturingParadigm: ManufacturingIntegrationParadigm;
  lastMonthlySummary: MonthlySupplyChainSummary | null;

  // ── HQ WAREHOUSE LEVELING ──────────────────────────────────────────
  hqWarehouse: HQWarehouseState;

  // ── ACTIONS ────────────────────────────────────────────────────────
  signSupplierContract: (contract: ActiveSupplierContract) => void;
  cancelSupplierContract: (contractId: string) => void;
  placeSpotPurchase: (
    itemType: ProcessedMaterialType | ComponentCategory,
    units: number,
    supplierId: string,
    unitPriceINR?: number
  ) => boolean;
  setInventoryPolicy: (policy: InventoryPolicyType) => void;
  signB2BContract: (contract: B2BCustomerContract) => void;
  cancelB2BContract: (contractId: string) => void;
  toggleRailSpur: (active: boolean) => void;
  toggleRecyclingFacility: (active: boolean) => void;
  setManufacturingParadigm: (paradigm: ManufacturingIntegrationParadigm) => void;
  initiateWarehouseUpgrade: (month: number, year: number) => { success: boolean; message: string };
  getWarehouseUI: (year: number, reputation: number, cash: number) => WarehouseSummaryForUI;
  processMonthlyTradeTick: (
    month: number,
    year: number,
    plannedVehicleProduction: number
  ) => MonthlySupplyChainSummary;
  addRawMaterialsTonnes: (tonnes: number) => void;
  resetTo1970: () => void;
}

export function selectTotalMaterialsTonnes(state: TradeStoreState): number {
  return Math.round(
    state.warehouseInventory.reduce((acc, item) => {
      if (item.unitOfMeasure === "tonnes") return acc + item.unitsOnHand;
      if (item.unitOfMeasure === "kg") return acc + item.unitsOnHand / 1000;
      return acc;
    }, 0)
  );
}

export const useTradeStore = create<TradeStoreState>((set, get) => ({
  warehouseInventory: [...INITIAL_1970_WAREHOUSE_INVENTORY],
  activeSupplierContracts: [...INITIAL_1970_SUPPLIER_CONTRACTS],
  activeB2BContracts: [],
  spotCommodityQuotes: [...INITIAL_SPOT_QUOTES],
  inventoryPolicy: "SAFETY_STOCK",
  hasFactoryRailSpur: false,
  hasRecyclingFacility: true,
  manufacturingParadigm: "HYBRID",
  lastMonthlySummary: null,
  hqWarehouse: { ...INITIAL_HQ_WAREHOUSE_STATE },

  signSupplierContract: (contract) => {
    set((state) => ({
      activeSupplierContracts: [
        ...state.activeSupplierContracts.filter((c) => c.contractId !== contract.contractId),
        contract,
      ],
    }));
  },

  cancelSupplierContract: (contractId) => {
    set((state) => ({
      activeSupplierContracts: state.activeSupplierContracts.filter((c) => c.contractId !== contractId),
    }));
  },

  placeSpotPurchase: (itemType, units, supplierId, unitPriceINR) => {
    const state = get();
    const supplier = NPC_SUPPLIERS.find((s) => s.id === supplierId) ?? NPC_SUPPLIERS[0];
    const price = unitPriceINR ?? BASELINE_MARKET_PRICES[itemType] ?? 50000;
    const totalCost = units * price;

    // Check financial balance
    const financeStore = useCompanyFinanceStore.getState();
    if (financeStore.cash < totalCost) {
      return false; // Insufficient funds
    }

    const clock = useSimulationClockStore.getState();
    const curYear = clock.year ?? 1970;
    const curMonth = clock.month ?? 1;

    // Debit cash via ledger & state
    financeStore.recordTransaction(
      curMonth,
      curYear,
      itemType.includes("STEEL") || itemType.includes("ALUMINUM") || itemType.includes("IRON") || itemType.includes("RUBBER") || itemType.includes("GLASS") || itemType.includes("COPPER")
        ? "RAW_MATERIALS"
        : "COMPONENT_PURCHASES",
      totalCost,
      `Spot Purchase: ${units} units of ${itemType} from ${supplier.name}`
    );
    useCompanyFinanceStore.setState((s) => ({ cash: s.cash - totalCost }));

    // Update warehouse inventory on-hand and total stored weight
    set((s) => {
      const inv = [...s.warehouseInventory];
      const existing = inv.find((i) => i.itemType === itemType);
      if (existing) {
        const newUnits = existing.unitsOnHand + units;
        existing.averageUnitCost = Math.round(
          (existing.unitsOnHand * existing.averageUnitCost + units * price) / newUnits
        );
        existing.unitsOnHand = newUnits;
      } else {
        inv.push({
          id: `inv_${itemType.toLowerCase()}_${Date.now()}`,
          itemType: itemType as any,
          name: itemType.replace(/_/g, " "),
          level: "LEVEL_2_PROCESSED",
          unitsOnHand: units,
          unitOfMeasure: "tonnes",
          averageUnitCost: price,
          qualityVector: {
            strength: 75,
            weightIndex: 60,
            consistency: 80,
            purity: 85,
            corrosionResistance: 70,
            heatResistance: 75,
            manufacturability: 80,
          },
          overallQualityScore: 75,
          warehouseFacilityId: "fac_central_warehouse_01",
          holdingCostMonthlyRate: 0.018,
          reorderPoint: 10,
          safetyStockTarget: 50,
          storageMaxCapacity: 2500,
        });
      }

      const totalTonnes = inv.reduce((sum, item) => {
        const tonnes = item.unitOfMeasure === "tonnes" ? item.unitsOnHand : item.unitOfMeasure === "kg" ? item.unitsOnHand / 1000 : item.unitsOnHand * 0.05;
        return sum + tonnes;
      }, 0);

      return {
        warehouseInventory: inv,
        hqWarehouse: {
          ...s.hqWarehouse,
          totalMaterialStoredTonnes: Number(totalTonnes.toFixed(1)),
        },
      };
    });

    return true;
  },

  setInventoryPolicy: (policy) => {
    set((state) => {
      const updated = state.warehouseInventory.map((item) =>
        applyInventoryPolicy(item, policy, 30)
      );
      return { inventoryPolicy: policy, warehouseInventory: updated };
    });
  },

  signB2BContract: (contract) => {
    set((state) => ({
      activeB2BContracts: [...state.activeB2BContracts, contract],
    }));
  },

  cancelB2BContract: (contractId) => {
    set((state) => ({
      activeB2BContracts: state.activeB2BContracts.filter((c) => c.contractId !== contractId),
    }));
  },

  toggleRailSpur: (active) => set({ hasFactoryRailSpur: active }),
  toggleRecyclingFacility: (active) => set({ hasRecyclingFacility: active }),
  setManufacturingParadigm: (paradigm) => set({ manufacturingParadigm: paradigm }),

  initiateWarehouseUpgrade: (month, year) => {
    const state = get();
    const result = startWarehouseUpgrade(state.hqWarehouse, month, year);
    if (result.success) {
      set({ hqWarehouse: result.newState });
      // Debit CapEx via finance store
      if (result.capexDebitINR > 0) {
        const financeStore = useCompanyFinanceStore.getState();
        financeStore.recordTransaction(
          month,
          year,
          "HQ_CONSTRUCTION",
          result.capexDebitINR,
          `HQ Warehouse Upgrade: Construction of Level ${state.hqWarehouse.currentLevel + 1} facility`
        );
        useCompanyFinanceStore.setState((s) => ({ cash: s.cash - result.capexDebitINR }));
      }
    }
    return { success: result.success, message: result.message };
  },

  getWarehouseUI: (year, reputation, cash) => {
    const state = get();
    return getWarehouseSummary(state.hqWarehouse, year, reputation, cash);
  },

  processMonthlyTradeTick: (month, year, plannedVehicleProduction) => {
    const state = get();
    const financeStore = useCompanyFinanceStore.getState();
    const alerts: Array<{ severity: "INFO" | "WARNING" | "CRITICAL"; title: string; message: string }> = [];

    // ── 1. RECEIVE INCOMING CONTRACT DELIVERIES ───────────────────────
    let monthlyProcurementCost = 0;
    const inv = [...state.warehouseInventory];

    for (const contract of state.activeSupplierContracts) {
      const deliveredVolume = contract.monthlyCommittedVolume;
      const cost = deliveredVolume * contract.agreedPricePerUnit;
      monthlyProcurementCost += cost;

      // Add to inventory
      const targetInv = inv.find((i) => i.itemType === contract.itemCategory);
      if (targetInv) {
        targetInv.unitsOnHand = Math.min(
          targetInv.storageMaxCapacity,
          targetInv.unitsOnHand + deliveredVolume
        );
      }

      // Record transaction if cash upfront or Net 30
      financeStore.recordTransaction(
        month,
        year,
        contract.itemCategory.includes("STEEL") || contract.itemCategory.includes("ALUMINUM")
          ? "RAW_MATERIALS"
          : "COMPONENT_PURCHASES",
        cost,
        `Contract Delivery: ${deliveredVolume} units ${contract.itemName} from ${contract.supplierName}`
      );
    }

    // ── 2. LOGISTICS FREIGHT COSTS ────────────────────────────────────
    let monthlyFreightCost = 0;
    for (const contract of state.activeSupplierContracts) {
      const supplier = NPC_SUPPLIERS.find((s) => s.id === contract.supplierId);
      if (supplier) {
        const mode = state.hasFactoryRailSpur ? "HEAVY_RAIL" : "ROAD_TRUCK";
        const freight = calculateFreightShipment(
          supplier.regionCluster,
          contract.monthlyCommittedVolume,
          mode,
          state.hasFactoryRailSpur
        );
        monthlyFreightCost += freight.netFreightCostINR;
      }
    }

    if (monthlyFreightCost > 0) {
      financeStore.recordTransaction(
        month,
        year,
        "LOGISTICS",
        monthlyFreightCost,
        `Multi-Modal Inbound Freight (${state.hasFactoryRailSpur ? "Heavy Rail 65% Discount" : "Road Truck Convoy"})`
      );
    }

    // ── 3. EVALUATE ASSEMBLY LINE BOTTLENECKS & CONSUMPTION ───────────
    const feasibility = evaluateProductionFeasibility(plannedVehicleProduction, inv);

    if (feasibility.isBottlenecked) {
      alerts.push({
        severity: "CRITICAL",
        title: "Assembly Line Production Capped by Material Shortage",
        message: `Output reduced from ${plannedVehicleProduction} to ${feasibility.feasibleUnits} vehicles due to ${feasibility.bottleneckItem} shortage (${feasibility.shortagePercentage}% deficit).`,
      });
    }

    // Deduct consumed materials for feasible units
    for (const item of inv) {
      const consumedUnits = feasibility.consumedInventory[item.itemType] ?? 0;
      if (consumedUnits > 0) {
        item.unitsOnHand = Math.max(0, parseFloat((item.unitsOnHand - consumedUnits).toFixed(2)));
      }
    }

    // ── 4. SCRAP RECYCLING ───────────────────────────────────────────
    const steelConsumed = feasibility.consumedInventory["BASIC_CARBON_STEEL"] ?? 0;
    const scrapResult = calculateScrapRecovery(
      "BASIC_CARBON_STEEL",
      steelConsumed,
      15.0,
      state.hasRecyclingFacility
    );

    if (scrapResult.recycledMaterialOutputTonnes > 0) {
      // Put recycled ingot back into steel warehouse
      const steelInv = inv.find((i) => i.itemType === "BASIC_CARBON_STEEL");
      if (steelInv) {
        steelInv.unitsOnHand += scrapResult.recycledMaterialOutputTonnes;
      }
      alerts.push({
        severity: "INFO",
        title: "Electric Arc Furnace Scrap Recovery Complete",
        message: `Recovered ${scrapResult.recycledMaterialOutputTonnes} tonnes of clean steel alloy from stamping offcuts, saving ₹${Math.round(scrapResult.netRecyclingBenefitINR / 1000)}k.`,
      });
    }

    // ── 5. B2B COMPONENT SALES FULFILLMENT ────────────────────────────
    const b2bResult = processMonthlyB2BFulfillments(state.activeB2BContracts, !feasibility.isBottlenecked);
    if (b2bResult.totalB2BRevenueINR > 0) {
      financeStore.recordTransaction(
        month,
        year,
        "COMPONENT_SALES",
        b2bResult.totalB2BRevenueINR,
        `B2B OEM Supply: Fulfilled ${b2bResult.totalDeliveredUnits} components to competitor automakers`
      );
    }

    // ── 6. HQ WAREHOUSE MONTHLY TICK ──────────────────────────────────
    const warehouseResult = processMonthlyWarehouseTick(state.hqWarehouse, inv);

    // Warehouse operating cost (staff, utilities, security)
    if (warehouseResult.monthlyOperatingCost > 0) {
      financeStore.recordTransaction(
        month,
        year,
        "FACTORY_MAINTENANCE",
        warehouseResult.monthlyOperatingCost,
        `HQ Warehouse Operations: Level ${warehouseResult.updatedState.currentLevel} — ${warehouseResult.capacityUtilizationPct}% utilized`
      );
    }

    // Spoilage expense (perishable material degradation)
    if (warehouseResult.spoilageExpenseINR > 0) {
      financeStore.recordTransaction(
        month,
        year,
        "FACTORY_MAINTENANCE",
        warehouseResult.spoilageExpenseINR,
        `Material Spoilage & Degradation (Rubber, Polymers, Battery Materials)`
      );
    }

    // Warehouse upgrade completion event
    if (warehouseResult.upgradeCompleted && warehouseResult.upgradeCompletionMessage) {
      alerts.push({
        severity: "INFO",
        title: "Warehouse Upgrade Complete",
        message: warehouseResult.upgradeCompletionMessage,
      });
    }

    // Storage capacity warning
    if (warehouseResult.storageWarning) {
      alerts.push({
        severity: warehouseResult.capacityUtilizationPct >= 95 ? "CRITICAL" : "WARNING",
        title: "Warehouse Capacity Alert",
        message: warehouseResult.storageWarning,
      });
    }

    // ── 7. INVENTORY VALUATION & HOLDING COST ─────────────────────────
    const valuation = calculateInventoryValuation(inv);
    // Apply warehouse level holding cost modifier
    const adjustedHoldingCost = Math.round(
      valuation.totalMonthlyHoldingCostINR * warehouseResult.holdingCostModifier
    );
    if (adjustedHoldingCost > 0) {
      financeStore.recordTransaction(
        month,
        year,
        "FACTORY_MAINTENANCE",
        adjustedHoldingCost,
        `Inventory Holding & Insurance (Level ${warehouseResult.updatedState.currentLevel} modifier: ${(warehouseResult.holdingCostModifier * 100).toFixed(0)}%)`
      );
    }

    // Decrement contract duration
    const updatedContracts = state.activeSupplierContracts
      .map((c) => ({ ...c, monthsRemaining: c.monthsRemaining - 1 }))
      .filter((c) => c.monthsRemaining > 0);

    const totalWarehouseCosts =
      warehouseResult.monthlyOperatingCost +
      warehouseResult.spoilageExpenseINR +
      adjustedHoldingCost;

    const summary: MonthlySupplyChainSummary = {
      month,
      year,
      totalProcurementCost: monthlyProcurementCost,
      totalHoldingCost: totalWarehouseCosts,
      totalLogisticsFreightCost: monthlyFreightCost,
      totalB2BRevenue: b2bResult.totalB2BRevenueINR,
      totalScrapRecycledTonnes: scrapResult.recycledMaterialOutputTonnes,
      recyclingCostSavingsINR: scrapResult.netRecyclingBenefitINR,
      inventoryAssetValueINR: valuation.totalAssetValueINR,
      stockoutsEncountered: feasibility.isBottlenecked
        ? [
            {
              itemType: feasibility.bottleneckItem ?? "Component",
              shortageUnits: feasibility.shortageAmount,
              productionBottleneckRatePct: feasibility.shortagePercentage,
            },
          ]
        : [],
      alerts,
    };

    set({
      warehouseInventory: inv,
      activeSupplierContracts: updatedContracts,
      hqWarehouse: warehouseResult.updatedState,
      lastMonthlySummary: summary,
    });

    return summary;
  },

  addRawMaterialsTonnes: (tonnes: number) => {
    set((state) => {
      const inv = [...state.warehouseInventory];
      const steelIdx = inv.findIndex(
        (i) => i.id === "inv_steel_coils" || i.itemType === "BASIC_CARBON_STEEL"
      );
      if (steelIdx >= 0) {
        inv[steelIdx] = {
          ...inv[steelIdx],
          unitsOnHand: Math.max(0, inv[steelIdx].unitsOnHand + tonnes),
        };
      }
      return { warehouseInventory: inv };
    });
  },

  resetTo1970: () => {
    set({
      warehouseInventory: [...INITIAL_1970_WAREHOUSE_INVENTORY],
      activeSupplierContracts: [...INITIAL_1970_SUPPLIER_CONTRACTS],
      activeB2BContracts: [],
      spotCommodityQuotes: [...INITIAL_SPOT_QUOTES],
      inventoryPolicy: "SAFETY_STOCK",
      hasFactoryRailSpur: false,
      hasRecyclingFacility: true,
      manufacturingParadigm: "HYBRID",
      lastMonthlySummary: null,
      hqWarehouse: { ...INITIAL_HQ_WAREHOUSE_STATE },
    });
  },
}));
