/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEALERSHIP NETWORK ENGINE — RETAIL DISTRIBUTION & SERVICE FOOTPRINT
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 3B & Section 17 (Dealership Network Economics):
 * Manages company retail presence across domestic and export territories:
 * - Flagship Owned Showrooms (prestigious brand centers, zero commission)
 * - Franchised Partner Dealerships (rapid territory expansion, dealer commission)
 * - Authorized Regional Service Centers (drives fleet retention & warranty repair)
 * - Master Distribution Logistics Hubs (speeds vehicle deliveries & buffers stock)
 */

import { create } from "zustand";

export type DealershipType =
  | "OWNED_SHOWROOM"
  | "FRANCHISED_DEALER"
  | "SERVICE_CENTER"
  | "DISTRIBUTION_HUB";

export interface Dealership {
  id: string;
  name: string;
  type: DealershipType;
  city: string;
  country: string;
  yearEstablished: number;
  monthlyRent: number;
  monthlyStaffPayroll: number;
  monthlyMaintenance: number;
  salesCapacityMonthly: number;
  serviceBaysCount: number;
  customerSatisfactionScore: number; // 0-100
  isActive: boolean;
}

export interface DealershipNetworkSummary {
  totalLocations: number;
  ownedShowroomsCount: number;
  franchisedDealersCount: number;
  serviceCentersCount: number;
  distributionHubsCount: number;
  totalMonthlyOverhead: number;
  itemizedCosts: {
    rent: number;
    staff: number;
    maintenance: number;
  };
  territoryCoveragePct: number; // 0-100% feed for vehicleSalesEngine
  totalMonthlySalesCapacity: number;
  totalServiceBays: number;
  averageCustomerSatisfaction: number;
}

export const INITIAL_1970_DEALERSHIPS: Dealership[] = [
  {
    id: "dealer_flagship_capital_1970",
    name: "Capital Metro Flagship Atelier",
    type: "OWNED_SHOWROOM",
    city: "Capital City",
    country: "Domestic",
    yearEstablished: 1970,
    monthlyRent: 22000,
    monthlyStaffPayroll: 18000,
    monthlyMaintenance: 5000,
    salesCapacityMonthly: 15,
    serviceBaysCount: 3,
    customerSatisfactionScore: 88,
    isActive: true,
  },
  {
    id: "dealer_franchise_industrial_1970",
    name: "Northern Industrial Auto Gallery",
    type: "FRANCHISED_DEALER",
    city: "Port City",
    country: "Domestic",
    yearEstablished: 1970,
    monthlyRent: 8000,
    monthlyStaffPayroll: 6000,
    monthlyMaintenance: 2000,
    salesCapacityMonthly: 12,
    serviceBaysCount: 2,
    customerSatisfactionScore: 76,
    isActive: true,
  },
];

export function calculateDealershipEconomics(
  dealerships: Dealership[],
  commercialReputation: number = 30
): DealershipNetworkSummary {
  const active = dealerships.filter((d) => d.isActive);

  let rentTotal = 0;
  let staffTotal = 0;
  let maintTotal = 0;
  let salesCapacity = 0;
  let serviceBays = 0;
  let ownedCount = 0;
  let franchiseCount = 0;
  let serviceCenterCount = 0;
  let hubCount = 0;
  let totalSat = 0;

  for (const d of active) {
    rentTotal += d.monthlyRent;
    staffTotal += d.monthlyStaffPayroll;
    maintTotal += d.monthlyMaintenance;
    salesCapacity += d.salesCapacityMonthly;
    serviceBays += d.serviceBaysCount;
    totalSat += d.customerSatisfactionScore;

    if (d.type === "OWNED_SHOWROOM") ownedCount++;
    else if (d.type === "FRANCHISED_DEALER") franchiseCount++;
    else if (d.type === "SERVICE_CENTER") serviceCenterCount++;
    else if (d.type === "DISTRIBUTION_HUB") hubCount++;
  }

  // Commercial trust gives up to 10% rent negotiation discount
  const rentDiscount = Math.min(0.12, (commercialReputation / 100) * 0.12);
  const effectiveRent = Math.round(rentTotal * (1 - rentDiscount));
  const totalOverhead = effectiveRent + staffTotal + maintTotal;

  // Territory coverage percentage formula:
  // Owned showroom = 8% coverage each
  // Franchised dealer = 5% coverage each
  // Distribution hub = adds +4% boost to all dealers
  const hubMultiplier = 1 + hubCount * 0.04;
  const rawCoverage = (ownedCount * 8 + franchiseCount * 5) * hubMultiplier;
  const territoryCoveragePct = Math.min(95, Math.max(5, Math.round(rawCoverage)));

  const avgSat = active.length > 0 ? Math.round(totalSat / active.length) : 50;

  return {
    totalLocations: active.length,
    ownedShowroomsCount: ownedCount,
    franchisedDealersCount: franchiseCount,
    serviceCentersCount: serviceCenterCount,
    distributionHubsCount: hubCount,
    totalMonthlyOverhead: totalOverhead,
    itemizedCosts: {
      rent: effectiveRent,
      staff: staffTotal,
      maintenance: maintTotal,
    },
    territoryCoveragePct,
    totalMonthlySalesCapacity: salesCapacity,
    totalServiceBays: serviceBays,
    averageCustomerSatisfaction: avgSat,
  };
}

export interface DealershipState {
  dealerships: Dealership[];
  addDealership: (dealer: Dealership) => void;
  removeDealership: (id: string) => void;
  toggleDealershipActive: (id: string) => void;
  getNetworkSummary: (commercialReputation?: number) => DealershipNetworkSummary;
  resetTo1970: () => void;
}

export const useDealershipStore = create<DealershipState>((set, get) => ({
  dealerships: [...INITIAL_1970_DEALERSHIPS],

  addDealership: (dealer) => {
    set((state) => ({
      dealerships: [...state.dealerships.filter((d) => d.id !== dealer.id), dealer],
    }));
  },

  removeDealership: (id) => {
    set((state) => ({
      dealerships: state.dealerships.filter((d) => d.id !== id),
    }));
  },

  toggleDealershipActive: (id) => {
    set((state) => ({
      dealerships: state.dealerships.map((d) =>
        d.id === id ? { ...d, isActive: !d.isActive } : d
      ),
    }));
  },

  getNetworkSummary: (commercialReputation = 30) => {
    return calculateDealershipEconomics(get().dealerships, commercialReputation);
  },

  resetTo1970: () => {
    set({ dealerships: [...INITIAL_1970_DEALERSHIPS] });
  },
}));
