/**
 * ==============================================================================
 * MODULAR COMPANY ARCHITECTURE MASTER BARREL
 * ==============================================================================
 * Clean domain separation uniting all enterprise automotive subsystems:
 * - Finance (P&L, Treasury, Balance Sheet, Ledger)
 * - Employees (Workforce, Departments, Key Personnel, Payroll)
 * - Reputation (Market Stature, Brand Acclaim, Milestones)
 * - Contracts (B2B Fleet, Component Supply, OEM Deals)
 * - Factory (Manufacturing Lines, Tooling, Shifts, Production Routing)
 * - Procurement (Raw Materials, Sourcing, Commodity Contracts, Logistics)
 * - Warehouse (Inventory Depots, Buffer Reserves, Stock Value)
 * - HQ (Campus Infrastructure, Buildings, Executive Facilities)
 * - Identity (Company Name, Founder, Era, Core Values)
 */

// Subsystem Namespaces
export * as Finance from "./finance";
export * as Employees from "./employees";
export * as Reputation from "./reputation";
export * as Contracts from "./contracts";
export * as Factory from "./factory";
export * as Procurement from "./procurement";
export * as Warehouse from "./warehouse";
export * as HQ from "./hq";
export * as Identity from "./identity";

// Primary Stores
export { useFinanceStore, useCompanyFinanceStore } from "./finance";
export { useEmployeesStore, useWorkforceStore } from "./employees";
export { useReputationStore } from "./reputation";
export { useContractsStore } from "./contracts";
export { useFactoryStore } from "./factory";
export { useProcurementStore } from "./procurement";
export { useWarehouseStore } from "./warehouse";
export { useCompanyIdentityStore } from "./identity";
