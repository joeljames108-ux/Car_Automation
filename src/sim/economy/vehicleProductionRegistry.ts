/**
 * ═══════════════════════════════════════════════════════════════════════
 * VEHICLE PRODUCTION REGISTRY — MULTI-MODEL AUTOMOTIVE ASSEMBLY LINES
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 1A: Multi-model production management.
 * Tracks active, scheduled, and retired vehicle production lines,
 * their unit pricing, monthly factory capacity, work-in-progress inventory,
 * itemized Bill of Materials (BOM), and market competitiveness metrics.
 */

import { create } from "zustand";
import { VehicleMarketSegment } from "./salesDemandEngine";
import { VehicleBillOfMaterials } from "./variableExpenseEngine";

export interface VehicleProductionLine {
  modelId: string;
  modelName: string;
  segment: VehicleMarketSegment;
  listPrice: number;
  monthlyCapacity: number;
  currentInventory: number;
  baseMarketMonthlyDemand: number;
  competitivenessScore: number;       // 0-100 derived from engineering & aesthetics
  dealerCoveragePct: number;          // 0-100
  customerLoyaltyScore: number;       // 0-100
  bomProfile: VehicleBillOfMaterials;
  isActive: boolean;
  launchYear: number;
  launchMonth: number;
  discontinueYear?: number;
  discontinueMonth?: number;
}

export const INITIAL_1970_PRODUCTION_LINES: VehicleProductionLine[] = [
  {
    modelId: "model_gt_prototype_1970",
    modelName: "Veloce 3000 GT Prototype",
    segment: "COUPE",
    listPrice: 1250000, // ₹1.25M in 1970
    monthlyCapacity: 12, // Hand-built pilot production line
    currentInventory: 4,
    baseMarketMonthlyDemand: 18,
    competitivenessScore: 78,
    dealerCoveragePct: 15,
    customerLoyaltyScore: 65,
    bomProfile: {
      steelKg: 780,
      aluminumKg: 320,
      carbonFiberKg: 15,
      plasticsRubberKg: 110,
      purchasedPowertrainUnitCost: 0, // Handcrafted in-house V8
      electronicsAndWiringCost: 28000,
      interiorAndSeatingCost: 45000,
      brakesAndSuspensionHardwareCost: 38000,
      assemblyLaborHours: 140, // Artisan handcrafted coachwork
      assemblyLaborHourlyRate: 420,
      electricityKwhPerVehicle: 850,
      electricityCostPerKwh: 8.5,
      logisticsPerUnitCost: 6500,
    },
    isActive: true,
    launchYear: 1970,
    launchMonth: 1,
  },
  {
    modelId: "model_stradale_corsa_1970",
    modelName: "Stradale Corsa 4000 V8",
    segment: "SUPERCAR",
    listPrice: 3200000, // ₹3.2M premium flagship
    monthlyCapacity: 4, // Ultra-limited coachbuilt line
    currentInventory: 1,
    baseMarketMonthlyDemand: 6,
    competitivenessScore: 92,
    dealerCoveragePct: 10,
    customerLoyaltyScore: 82,
    bomProfile: {
      steelKg: 450,
      aluminumKg: 480,
      carbonFiberKg: 45,
      plasticsRubberKg: 90,
      purchasedPowertrainUnitCost: 0, // In-house racing dry-sump V8
      electronicsAndWiringCost: 48000,
      interiorAndSeatingCost: 110000,
      brakesAndSuspensionHardwareCost: 95000,
      assemblyLaborHours: 240, // Bespoke master assembly
      assemblyLaborHourlyRate: 520,
      electricityKwhPerVehicle: 1200,
      electricityCostPerKwh: 8.5,
      logisticsPerUnitCost: 14500,
    },
    isActive: true,
    launchYear: 1970,
    launchMonth: 1,
  },
  {
    modelId: "model_berlina_executive_1972",
    modelName: "Veloce Berlina 2500 Executive",
    segment: "SEDAN",
    listPrice: 950000, // ₹950k commercial volume seller
    monthlyCapacity: 22,
    currentInventory: 0,
    baseMarketMonthlyDemand: 32,
    competitivenessScore: 81,
    dealerCoveragePct: 22,
    customerLoyaltyScore: 70,
    bomProfile: {
      steelKg: 1050,
      aluminumKg: 180,
      carbonFiberKg: 0,
      plasticsRubberKg: 140,
      purchasedPowertrainUnitCost: 0,
      electronicsAndWiringCost: 22000,
      interiorAndSeatingCost: 38000,
      brakesAndSuspensionHardwareCost: 28000,
      assemblyLaborHours: 85,
      assemblyLaborHourlyRate: 380,
      electricityKwhPerVehicle: 650,
      electricityCostPerKwh: 8.5,
      logisticsPerUnitCost: 5200,
    },
    isActive: true,
    launchYear: 1972,
    launchMonth: 4,
  },
];

export interface VehicleProductionState {
  lines: VehicleProductionLine[];
  getActiveLines: (year: number, month?: number) => VehicleProductionLine[];
  getLineById: (modelId: string) => VehicleProductionLine | undefined;
  addLine: (line: VehicleProductionLine) => void;
  updateLine: (modelId: string, patch: Partial<VehicleProductionLine>) => void;
  setCapacity: (modelId: string, capacity: number) => void;
  setPrice: (modelId: string, price: number) => void;
  discontinueLine: (modelId: string, year: number, month: number) => void;
  updateInventory: (modelId: string, delta: number) => void;
  resetTo1970: () => void;
}

export const useVehicleProductionStore = create<VehicleProductionState>((set, get) => ({
  lines: [...INITIAL_1970_PRODUCTION_LINES],

  getActiveLines: (year: number, month?: number) => {
    return get().lines.filter((line) => {
      if (!line.isActive) return false;
      const isLaunched =
        year > line.launchYear ||
        (year === line.launchYear && (month === undefined || month >= line.launchMonth));
      if (!isLaunched) return false;
      if (line.discontinueYear) {
        const isDiscontinued =
          year > line.discontinueYear ||
          (year === line.discontinueYear && (month === undefined || month >= (line.discontinueMonth ?? 12)));
        if (isDiscontinued) return false;
      }
      return true;
    });
  },

  getLineById: (modelId: string) => {
    return get().lines.find((line) => line.modelId === modelId);
  },

  addLine: (line: VehicleProductionLine) => {
    set((state) => ({
      lines: [...state.lines.filter((l) => l.modelId !== line.modelId), line],
    }));
  },

  updateLine: (modelId: string, patch: Partial<VehicleProductionLine>) => {
    set((state) => ({
      lines: state.lines.map((l) => (l.modelId === modelId ? { ...l, ...patch } : l)),
    }));
  },

  setCapacity: (modelId: string, capacity: number) => {
    get().updateLine(modelId, { monthlyCapacity: Math.max(0, capacity) });
  },

  setPrice: (modelId: string, price: number) => {
    get().updateLine(modelId, { listPrice: Math.max(1000, price) });
  },

  discontinueLine: (modelId: string, year: number, month: number) => {
    get().updateLine(modelId, {
      isActive: false,
      discontinueYear: year,
      discontinueMonth: month,
    });
  },

  updateInventory: (modelId: string, delta: number) => {
    set((state) => ({
      lines: state.lines.map((l) =>
        l.modelId === modelId ? { ...l, currentInventory: Math.max(0, l.currentInventory + delta) } : l
      ),
    }));
  },

  resetTo1970: () => {
    set({ lines: [...INITIAL_1970_PRODUCTION_LINES] });
  },
}));
