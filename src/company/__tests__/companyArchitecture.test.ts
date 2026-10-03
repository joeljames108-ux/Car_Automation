import { describe, it, expect } from "vitest";
import {
  Finance,
  Employees,
  Reputation,
  Contracts,
  Factory,
  Procurement,
  Warehouse,
  HQ,
  Identity,
  useFinanceStore,
  useEmployeesStore,
  useReputationStore,
  useContractsStore,
  useFactoryStore,
  useProcurementStore,
  useWarehouseStore,
  useCompanyIdentityStore,
} from "../index";

describe("Company Subsystem Architecture (Option B Master Barrel)", () => {
  it("exposes all 9 modular company namespaces", () => {
    expect(Finance).toBeDefined();
    expect(Employees).toBeDefined();
    expect(Reputation).toBeDefined();
    expect(Contracts).toBeDefined();
    expect(Factory).toBeDefined();
    expect(Procurement).toBeDefined();
    expect(Warehouse).toBeDefined();
    expect(HQ).toBeDefined();
    expect(Identity).toBeDefined();
  });

  it("exposes all standalone subsystem store hooks", () => {
    expect(typeof useFinanceStore).toBe("function");
    expect(typeof useEmployeesStore).toBe("function");
    expect(typeof useReputationStore).toBe("function");
    expect(typeof useContractsStore).toBe("function");
    expect(typeof useFactoryStore).toBe("function");
    expect(typeof useProcurementStore).toBe("function");
    expect(typeof useWarehouseStore).toBe("function");
    expect(typeof useCompanyIdentityStore).toBe("function");
  });

  it("verifies initial state of modular stores", () => {
    const warehouseState = useWarehouseStore.getState();
    expect(Array.isArray(warehouseState.locations)).toBe(true);

    const financeState = useFinanceStore.getState();
    expect(typeof financeState.cash).toBe("number");

    const reputationState = useReputationStore.getState();
    expect(typeof reputationState.overallReputation).toBe("number");
  });
});
