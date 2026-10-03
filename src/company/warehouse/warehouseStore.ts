import { create } from "zustand";

export interface WarehouseLocation {
  id: string;
  name: string;
  type: "hq_central" | "factory_buffer" | "regional_hub";
  capacityTonnes: number;
  currentTonnes: number;
  utilizationRate: number; // 0-1
  monthlyLeaseCost: number;
  safetyBufferDays: number;
}

export interface StoredStockItem {
  id: string;
  name: string;
  category: "raw_material" | "stamped_part" | "powertrain" | "electronics" | "finished_goods";
  quantity: number;
  unit: "tonnes" | "units" | "crates";
  unitValueUSD: number;
  totalValueUSD: number;
  locationId: string;
}

export interface WarehouseState {
  totalCapacityTonnes: number;
  totalCurrentTonnes: number;
  storageUtilizationRate: number;
  monthlyStorageExpenseUSD: number;
  locations: WarehouseLocation[];
  inventory: Record<string, StoredStockItem>;

  // Actions
  addLocation: (location: WarehouseLocation) => void;
  updateLocationCapacity: (locationId: string, additionalTonnes: number, costUSD: number) => void;
  updateSafetyBufferDays: (locationId: string, days: number) => void;
  adjustStock: (itemId: string, deltaQuantity: number, itemMetadata?: Partial<StoredStockItem>) => void;
  calculateTotalInventoryValuation: () => number;
}

const INITIAL_LOCATIONS: WarehouseLocation[] = [
  {
    id: "loc_hq_central",
    name: "Central Logistics & Storage Depot",
    type: "hq_central",
    capacityTonnes: 15_000,
    currentTonnes: 4_200,
    utilizationRate: 0.28,
    monthlyLeaseCost: 35_000,
    safetyBufferDays: 30,
  },
  {
    id: "loc_factory_buffer",
    name: "Factory Floor Buffer Storage",
    type: "factory_buffer",
    capacityTonnes: 5_000,
    currentTonnes: 2_100,
    utilizationRate: 0.42,
    monthlyLeaseCost: 15_000,
    safetyBufferDays: 14,
  },
];

const INITIAL_INVENTORY: Record<string, StoredStockItem> = {
  raw_sheet_steel: {
    id: "raw_sheet_steel",
    name: "Automotive Grade Deep-Draw Steel Sheets",
    category: "raw_material",
    quantity: 2_800,
    unit: "tonnes",
    unitValueUSD: 850,
    totalValueUSD: 2_380_000,
    locationId: "loc_hq_central",
  },
  raw_cast_aluminum: {
    id: "raw_cast_aluminum",
    name: "Cast Aluminum Ingots (A356)",
    category: "raw_material",
    quantity: 950,
    unit: "tonnes",
    unitValueUSD: 2_400,
    totalValueUSD: 2_280_000,
    locationId: "loc_hq_central",
  },
  engine_blocks_v8: {
    id: "engine_blocks_v8",
    name: "Machined Cross-Plane V8 Engine Blocks",
    category: "powertrain",
    quantity: 450,
    unit: "units",
    unitValueUSD: 3_200,
    totalValueUSD: 1_440_000,
    locationId: "loc_factory_buffer",
  },
};

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  totalCapacityTonnes: 20_000,
  totalCurrentTonnes: 6_300,
  storageUtilizationRate: 0.315,
  monthlyStorageExpenseUSD: 50_000,
  locations: INITIAL_LOCATIONS,
  inventory: INITIAL_INVENTORY,

  addLocation: (location) => {
    set((state) => {
      const locations = [...state.locations, location];
      const totalCapacityTonnes = locations.reduce((sum, l) => sum + l.capacityTonnes, 0);
      const totalCurrentTonnes = locations.reduce((sum, l) => sum + l.currentTonnes, 0);
      const monthlyStorageExpenseUSD = locations.reduce((sum, l) => sum + l.monthlyLeaseCost, 0);
      return {
        locations,
        totalCapacityTonnes,
        totalCurrentTonnes,
        storageUtilizationRate: totalCapacityTonnes > 0 ? totalCurrentTonnes / totalCapacityTonnes : 0,
        monthlyStorageExpenseUSD,
      };
    });
  },

  updateLocationCapacity: (locationId, additionalTonnes, costUSD) => {
    set((state) => {
      const locations = state.locations.map((loc) => {
        if (loc.id !== locationId) return loc;
        const newCap = loc.capacityTonnes + additionalTonnes;
        return {
          ...loc,
          capacityTonnes: newCap,
          utilizationRate: newCap > 0 ? loc.currentTonnes / newCap : 0,
          monthlyLeaseCost: loc.monthlyLeaseCost + Math.round(costUSD * 0.01),
        };
      });
      const totalCapacityTonnes = locations.reduce((sum, l) => sum + l.capacityTonnes, 0);
      const totalCurrentTonnes = locations.reduce((sum, l) => sum + l.currentTonnes, 0);
      const monthlyStorageExpenseUSD = locations.reduce((sum, l) => sum + l.monthlyLeaseCost, 0);
      return {
        locations,
        totalCapacityTonnes,
        totalCurrentTonnes,
        storageUtilizationRate: totalCapacityTonnes > 0 ? totalCurrentTonnes / totalCapacityTonnes : 0,
        monthlyStorageExpenseUSD,
      };
    });
  },

  updateSafetyBufferDays: (locationId, days) => {
    set((state) => ({
      locations: state.locations.map((loc) => (loc.id === locationId ? { ...loc, safetyBufferDays: days } : loc)),
    }));
  },

  adjustStock: (itemId, deltaQuantity, metadata) => {
    set((state) => {
      const existing = state.inventory[itemId];
      const newQty = Math.max(0, (existing?.quantity ?? 0) + deltaQuantity);
      const unitValue = metadata?.unitValueUSD ?? existing?.unitValueUSD ?? 100;
      const updated: StoredStockItem = {
        id: itemId,
        name: metadata?.name ?? existing?.name ?? itemId,
        category: metadata?.category ?? existing?.category ?? "raw_material",
        quantity: newQty,
        unit: metadata?.unit ?? existing?.unit ?? "units",
        unitValueUSD: unitValue,
        totalValueUSD: newQty * unitValue,
        locationId: metadata?.locationId ?? existing?.locationId ?? "loc_hq_central",
      };

      const inventory = { ...state.inventory, [itemId]: updated };
      const totalCurrentTonnes = Object.values(inventory).reduce((acc, item) => {
        if (item.unit === "tonnes") return acc + item.quantity;
        return acc + item.quantity * 0.001; // estimate 1kg per unit
      }, 0);

      return {
        inventory,
        totalCurrentTonnes: Math.round(totalCurrentTonnes),
        storageUtilizationRate: state.totalCapacityTonnes > 0 ? totalCurrentTonnes / state.totalCapacityTonnes : 0,
      };
    });
  },

  calculateTotalInventoryValuation: () => {
    const inv = get().inventory;
    return Object.values(inv).reduce((sum, item) => sum + item.totalValueUSD, 0);
  },
}));
