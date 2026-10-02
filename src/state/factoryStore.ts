/**
 * ═══════════════════════════════════════════════════════════════════════
 * FACTORY MANAGEMENT ZUSTAND STORE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Bridges physical assembly lines, time-based slot reservations,
 * shift scheduling, maintenance lifecycles, and factory floor telemetry.
 */

import { create } from "zustand";
import {
  AssemblyLine,
  FactoryFloorSummary,
  LineType,
  ProductionSlot,
  SlotStatus,
} from "../sim/factory/factoryTypes";
import {
  computeFactoryFloorSummary,
  computeLineCapacity,
  computeLineUtilization,
  createInitialAssemblyLines,
} from "../sim/factory/factoryCapacityEngine";
import {
  evaluateBreakdownRisk,
  checkChangeoverRequired,
  tickChangeoverProgress,
} from "../sim/factory/factoryEventEngine";
import {
  PurchaseOrder,
  createPurchaseOrder,
  tickPurchaseOrders,
  calculatePurchaseOrderCost,
  checkBOMShortagesForProduction,
  deductBOMConsumption,
  addDeliveredStockToWarehouse,
} from "../sim/factory/factorySupplyChainEngine";
import {
  LineWorkforceSkill,
  initializeLineSkill,
  tickWorkerExperience,
  startTrainingProgram,
  applyWorkerHeadcountChange,
  evaluateTurnoverRisk,
  TRAINING_PROGRAM_COST_USD,
} from "../sim/factory/factorySkillEngine";
import { createCampusEvent } from "../sim/campus/campusEvents";
import { clockListeners, gameEventDateStr } from "./gameClockEngine";
import { useCampusStore } from "./campusStore";
import { useCompanyFinanceStore } from "./companyFinanceStore";
import { useTradeStore } from "./tradeStore";

export type FactoryViewTab =
  | "overview"
  | "lines"
  | "scheduler"
  | "materials"
  | "workforce"
  | "quality";

interface FactoryStoreState {
  // Assembly Lines on Floor
  assemblyLines: AssemblyLine[];
  selectedLineId: string | null;
  activeFilterType: "ALL" | LineType;
  activeViewTab: FactoryViewTab;

  // Floor Telemetry
  factoryFloorSummary: FactoryFloorSummary;

  // Navigation & View Actions
  setSelectedLineId: (lineId: string | null) => void;
  setActiveFilterType: (filter: "ALL" | LineType) => void;
  setActiveViewTab: (tab: FactoryViewTab) => void;

  // Line Lifecycle Actions
  addAssemblyLine: (params: Omit<AssemblyLine, "id" | "reservedSlots" | "dailyCapacityUnits" | "monthlyCapacityUnits" | "monthlyOperatingHoursAvailable" | "monthlyOperatingHoursReserved" | "monthlyOperatingHoursFree" | "utilizationPct">) => AssemblyLine;
  removeAssemblyLine: (lineId: string) => void;
  updateAssemblyLineConfig: (lineId: string, updates: Partial<AssemblyLine>) => void;
  upgradeAssemblyLine: (lineId: string) => boolean;
  scheduleLineMaintenance: (lineId: string, targetDateStr: string) => void;
  performMaintenance: (lineId: string) => void;

  // Slot Scheduling Actions
  reserveProductionSlot: (
    lineId: string,
    slotData: Omit<ProductionSlot, "id" | "producedUnits" | "status" | "elapsedDays" | "lineId">
  ) => { success: boolean; slot?: ProductionSlot; error?: string };
  cancelProductionSlot: (slotId: string) => void;
  pauseProductionSlot: (slotId: string, reason?: string) => void;
  resumeProductionSlot: (slotId: string) => void;

  // Supply Chain & Purchase Orders (Phase 2)
  purchaseOrders: PurchaseOrder[];
  placePurchaseOrder: (
    materialId: string,
    quantity: number,
    orderDateStr: string,
    targetSlotId?: string
  ) => { success: boolean; order?: PurchaseOrder; error?: string };
  cancelPurchaseOrder: (orderId: string) => boolean;

  // Workforce Skills & Training Academy (Phase 2)
  startLineTrainingProgram: (lineId: string) => boolean;

  // Game Loop Simulation
  tickFactoryDay: (currentDateStr: string, elapsedDays: number) => void;
  recalculateSummary: () => void;
  resetToInitialFloor: () => void;
}

const STORAGE_KEY = "car_automation_factory_store_v1";

const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // ignore
      }
    }
  },
};

function loadSavedFactoryState(): { lines: AssemblyLine[]; orders: PurchaseOrder[] } {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const lines =
        Array.isArray(parsed.assemblyLines) && parsed.assemblyLines.length > 0
          ? parsed.assemblyLines
          : createInitialAssemblyLines(1);
      const orders = Array.isArray(parsed.purchaseOrders) ? parsed.purchaseOrders : [];
      return { lines, orders };
    }
  } catch (err) {
    console.warn("Failed to parse saved factory state, using initial seed:", err);
  }
  return { lines: createInitialAssemblyLines(1), orders: [] };
}

function persistFactoryState(assemblyLines: AssemblyLine[], purchaseOrders: PurchaseOrder[]) {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify({ assemblyLines, purchaseOrders }));
  } catch {
    // ignore
  }
}

function recomputeLine(line: AssemblyLine): AssemblyLine {
  const workforceSkill =
    line.workforceSkill || initializeLineSkill(line.id, line.assignedWorkersCount);
  const lineWithSkill: AssemblyLine = { ...line, workforceSkill };
  const cap = computeLineCapacity(lineWithSkill);
  const util = computeLineUtilization(lineWithSkill, cap.effectiveMonthlyHours);
  const activeSlot = (lineWithSkill.reservedSlots || []).find((s) => s.status === "IN_PROGRESS");

  return {
    ...lineWithSkill,
    dailyCapacityUnits: cap.dailyCapacity,
    monthlyCapacityUnits: cap.monthlyCapacity,
    monthlyOperatingHoursAvailable: cap.effectiveMonthlyHours,
    monthlyOperatingHoursReserved: util.reservedHours,
    monthlyOperatingHoursFree: util.freeHours,
    utilizationPct: util.utilizationPct,
    activeSlotId: activeSlot?.id,
    status:
      line.status === "MAINTENANCE" || line.status === "UPGRADING" || line.status === "OFFLINE"
        ? line.status
        : line.status === "CHANGEOVER"
        ? "CHANGEOVER"
        : activeSlot
        ? "PRODUCING"
        : "IDLE",
  };
}

export const useFactoryStore = create<FactoryStoreState>((set, get) => {
  const { lines: savedLines, orders: savedOrders } = loadSavedFactoryState();
  const initialLines = savedLines.map(recomputeLine);
  const initialSummary = computeFactoryFloorSummary(initialLines, 1, "no_factory_outsourced");

  return {
    assemblyLines: initialLines,
    purchaseOrders: savedOrders,
    selectedLineId: initialLines.length > 0 ? initialLines[0].id : null,
    activeFilterType: "ALL",
    activeViewTab: "overview",
    factoryFloorSummary: initialSummary,

    setSelectedLineId: (lineId) => set({ selectedLineId: lineId }),
    setActiveFilterType: (filter) => set({ activeFilterType: filter }),
    setActiveViewTab: (tab) => set({ activeViewTab: tab }),

    addAssemblyLine: (params) => {
      const newLineId = `line_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newLineRaw: AssemblyLine = {
        ...params,
        id: newLineId,
        reservedSlots: [],
        dailyCapacityUnits: 0,
        monthlyCapacityUnits: 0,
        monthlyOperatingHoursAvailable: 0,
        monthlyOperatingHoursReserved: 0,
        monthlyOperatingHoursFree: 0,
        utilizationPct: 0,
      };

      const newLine = recomputeLine(newLineRaw);

      set((state) => {
        const nextLines = [...state.assemblyLines, newLine];
        persistFactoryState(nextLines, state.purchaseOrders);
        const campusState = useCampusStore.getState().factoryState;
        const summary = computeFactoryFloorSummary(
          nextLines,
          campusState.factoryLevel || 1,
          campusState.ownershipStatus || "no_factory_outsourced"
        );
        return {
          assemblyLines: nextLines,
          factoryFloorSummary: summary,
          selectedLineId: newLine.id,
        };
      });

      return newLine;
    },

    removeAssemblyLine: (lineId) => {
      set((state) => {
        const nextLines = state.assemblyLines.filter((l) => l.id !== lineId);
        persistFactoryState(nextLines, state.purchaseOrders);
        const campusState = useCampusStore.getState().factoryState;
        const summary = computeFactoryFloorSummary(
          nextLines,
          campusState.factoryLevel || 1,
          campusState.ownershipStatus || "no_factory_outsourced"
        );
        return {
          assemblyLines: nextLines,
          factoryFloorSummary: summary,
          selectedLineId: state.selectedLineId === lineId ? nextLines[0]?.id || null : state.selectedLineId,
        };
      });
    },

    updateAssemblyLineConfig: (lineId, updates) => {
      set((state) => {
        const nextLines = state.assemblyLines.map((line) => {
          if (line.id !== lineId) return line;
          let updatedSkill = updates.workforceSkill !== undefined ? updates.workforceSkill : line.workforceSkill;
          if (updates.assignedWorkersCount !== undefined && updatedSkill) {
            updatedSkill = applyWorkerHeadcountChange(updatedSkill, updates.assignedWorkersCount);
          }
          return recomputeLine({ ...line, ...updates, workforceSkill: updatedSkill });
        });
        persistFactoryState(nextLines, state.purchaseOrders);
        const campusState = useCampusStore.getState().factoryState;
        const summary = computeFactoryFloorSummary(
          nextLines,
          campusState.factoryLevel || 1,
          campusState.ownershipStatus || "no_factory_outsourced"
        );
        return {
          assemblyLines: nextLines,
          factoryFloorSummary: summary,
        };
      });
    },

    placePurchaseOrder: (materialId, quantity, orderDateStr, targetSlotId) => {
      const cost = calculatePurchaseOrderCost(materialId, quantity);
      const financeStore = useCompanyFinanceStore.getState();
      if (financeStore.cash < cost.totalCost) {
        return { success: false, error: "Insufficient company funds for purchase order" };
      }

      // Deduct cash via ledger
      const [yearStr, monthStr] = orderDateStr.split("-");
      const yr = parseInt(yearStr, 10) || 1970;
      const mo = parseInt(monthStr, 10) || 1;
      financeStore.recordTransaction(
        mo,
        yr,
        "RAW_MATERIALS",
        cost.totalCost,
        `Purchase Order: ${quantity.toLocaleString()} units of ${materialId} (Bulk discount: ${cost.discountPct}%)`
      );
      useCompanyFinanceStore.setState((s) => ({ cash: s.cash - cost.totalCost }));

      const newOrder = createPurchaseOrder({
        materialId,
        quantity,
        orderDateStr,
        targetSlotId,
      });

      set((state) => {
        const nextOrders = [...state.purchaseOrders, newOrder];
        persistFactoryState(state.assemblyLines, nextOrders);
        return { purchaseOrders: nextOrders };
      });

      return { success: true, order: newOrder };
    },

    cancelPurchaseOrder: (orderId) => {
      const order = get().purchaseOrders.find((o) => o.id === orderId);
      if (!order || order.status !== "PENDING") return false;

      // 80% refund (20% supplier restocking fee)
      const refundAmount = Math.round(order.totalCostUSD * 0.8);
      const [yearStr, monthStr] = order.orderDate.split("-");
      const yr = parseInt(yearStr, 10) || 1970;
      const mo = parseInt(monthStr, 10) || 1;
      useCompanyFinanceStore.getState().recordTransaction(
        mo,
        yr,
        "RAW_MATERIALS",
        -refundAmount,
        `Cancelled PO Refund (80%): ${order.materialName}`
      );
      useCompanyFinanceStore.setState((s) => ({ cash: s.cash + refundAmount }));

      set((state) => {
        const nextOrders = state.purchaseOrders.map((o) =>
          o.id === orderId ? { ...o, status: "CANCELLED" as const } : o
        );
        persistFactoryState(state.assemblyLines, nextOrders);
        return { purchaseOrders: nextOrders };
      });

      return true;
    },

    startLineTrainingProgram: (lineId) => {
      const line = get().assemblyLines.find((l) => l.id === lineId);
      if (!line) return false;
      const skill = line.workforceSkill || initializeLineSkill(line.id, line.assignedWorkersCount);
      if (skill.trainingProgramActive) return false;

      const financeStore = useCompanyFinanceStore.getState();
      if (financeStore.cash < TRAINING_PROGRAM_COST_USD) return false;

      financeStore.recordTransaction(
        1,
        1970,
        "ASSEMBLY_LABOR",
        TRAINING_PROGRAM_COST_USD,
        `Shop-Floor Technical Training Academy: ${line.name} (30 days)`
      );
      useCompanyFinanceStore.setState((s) => ({ cash: s.cash - TRAINING_PROGRAM_COST_USD }));

      const updatedSkill = startTrainingProgram(skill);
      get().updateAssemblyLineConfig(lineId, { workforceSkill: updatedSkill });
      return true;
    },

    upgradeAssemblyLine: (lineId) => {
      const line = get().assemblyLines.find((l) => l.id === lineId);
      if (!line || line.level >= 5) return false;

      const financeStore = useCompanyFinanceStore.getState();
      if (financeStore.cash < line.upgradeCostUSD) return false;

      // Deduct capital cost
      financeStore.recordTransaction(
        1,
        1970,
        "TOOLING",
        line.upgradeCostUSD,
        `Automation & Tooling Upgrade: ${line.name} (Tier ${line.level} -> ${line.level + 1})`
      );
      useCompanyFinanceStore.setState((s) => ({ cash: s.cash - line.upgradeCostUSD }));

      get().updateAssemblyLineConfig(lineId, {
        level: line.level + 1,
        efficiencyPct: Math.min(98, line.efficiencyPct + 4),
        cycleTimeMinutes: Math.max(4, Math.round(line.cycleTimeMinutes * 0.82)),
        upgradeCostUSD: Math.round(line.upgradeCostUSD * 1.6),
        breakdownRiskPct: Math.max(1, line.breakdownRiskPct - 3),
        status: "UPGRADING",
        upgradeDaysRemaining: 7,
      });

      return true;
    },

    scheduleLineMaintenance: (lineId, targetDateStr) => {
      get().updateAssemblyLineConfig(lineId, {
        nextScheduledMaintenance: targetDateStr,
      });
    },

    performMaintenance: (lineId) => {
      const line = get().assemblyLines.find((l) => l.id === lineId);
      if (!line) return;

      const maintenanceCost = Math.round(line.monthlyOperatingCostUSD * 0.15);
      useCompanyFinanceStore.getState().recordTransaction(
        1,
        1970,
        "FACTORY_MAINTENANCE",
        maintenanceCost,
        `Preventive Maintenance Overhaul: ${line.name}`
      );
      useCompanyFinanceStore.setState((s) => ({ cash: s.cash - maintenanceCost }));

      get().updateAssemblyLineConfig(lineId, {
        status: "MAINTENANCE",
        maintenanceDaysRemaining: 2,
        breakdownRiskPct: 2,
      });
    },

    reserveProductionSlot: (lineId, slotData) => {
      const line = get().assemblyLines.find((l) => l.id === lineId);
      if (!line) return { success: false, error: "Assembly line not found" };

      const newSlot: ProductionSlot = {
        ...slotData,
        id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        lineId,
        producedUnits: 0,
        elapsedDays: 0,
        status: "SCHEDULED",
      };

      const updatedSlots = [...(line.reservedSlots || []), newSlot];
      get().updateAssemblyLineConfig(lineId, {
        reservedSlots: updatedSlots,
      });

      return { success: true, slot: newSlot };
    },

    cancelProductionSlot: (slotId) => {
      set((state) => {
        const nextLines = state.assemblyLines.map((line) => {
          const hasSlot = (line.reservedSlots || []).some((s) => s.id === slotId);
          if (!hasSlot) return line;

          const updatedSlots = (line.reservedSlots || []).filter((s) => s.id !== slotId);
          return recomputeLine({ ...line, reservedSlots: updatedSlots });
        });
        persistFactoryState(nextLines, state.purchaseOrders);
        return { assemblyLines: nextLines };
      });
      get().recalculateSummary();
    },

    pauseProductionSlot: (slotId, reason = "Manual Pause") => {
      set((state) => {
        const nextLines = state.assemblyLines.map((line) => {
          const hasSlot = (line.reservedSlots || []).some((s) => s.id === slotId);
          if (!hasSlot) return line;

          const updatedSlots = (line.reservedSlots || []).map((s) =>
            s.id === slotId ? { ...s, status: "PAUSED" as SlotStatus, pauseReason: reason } : s
          );
          return recomputeLine({ ...line, reservedSlots: updatedSlots });
        });
        persistFactoryState(nextLines, state.purchaseOrders);
        return { assemblyLines: nextLines };
      });
      get().recalculateSummary();
    },

    resumeProductionSlot: (slotId) => {
      set((state) => {
        const nextLines = state.assemblyLines.map((line) => {
          const hasSlot = (line.reservedSlots || []).some((s) => s.id === slotId);
          if (!hasSlot) return line;

          const updatedSlots = (line.reservedSlots || []).map((s) =>
            s.id === slotId ? { ...s, status: "IN_PROGRESS" as SlotStatus, pauseReason: undefined } : s
          );
          return recomputeLine({ ...line, reservedSlots: updatedSlots });
        });
        persistFactoryState(nextLines, state.purchaseOrders);
        return { assemblyLines: nextLines };
      });
      get().recalculateSummary();
    },

    tickFactoryDay: (currentDateStr, elapsedDays = 1) => {
      if (elapsedDays <= 0) return;

      // Extract year/month from date string for event creation
      const [yearStr, monthStr] = currentDateStr.split("-");
      const evtYear = parseInt(yearStr, 10) || 1970;
      const evtMonth = parseInt(monthStr, 10) || 1;

      set((state) => {
        let changed = false;
        const pendingEvents: ReturnType<typeof createCampusEvent>[] = [];

        // ═══════════════════════════════════════════════════════════
        // 0. Progress Purchase Orders & Supply Deliveries (Phase 2)
        // ═══════════════════════════════════════════════════════════
        const { updatedOrders, newlyDelivered } = tickPurchaseOrders(state.purchaseOrders, elapsedDays);
        if (newlyDelivered.length > 0) {
          changed = true;
          try {
            const tradeStore = useTradeStore.getState();
            let currentInv = tradeStore.warehouseInventory;
            for (const po of newlyDelivered) {
              currentInv = addDeliveredStockToWarehouse(po, currentInv);
              pendingEvents.push(
                createCampusEvent(
                  "FACTORY_MATERIALS_DELIVERED",
                  "success",
                  `Materials Delivered: ${po.materialName}`,
                  `Shipment of ${po.quantity.toLocaleString()} ${po.unit} of "${po.materialName}" has arrived at the central warehouse and is ready for production staging.`,
                  evtYear,
                  evtMonth
                )
              );
            }
            useTradeStore.setState({ warehouseInventory: currentInv });
          } catch { /* trade store might not be available in tests */ }
        }

        const nextLines = state.assemblyLines.map((line) => {
          let lineChanged = false;
          let currentStatus = line.status;
          let breakdownRisk = line.breakdownRiskPct;
          let maintDays = line.maintenanceDaysRemaining;
          let upgDays = line.upgradeDaysRemaining;
          let changeoverDaysRemaining = line.changeoverDaysRemaining;
          let changeoverTargetModelId = line.changeoverTargetModelId;
          let currentVehicleModelId = line.currentVehicleModelId;

          // ─── Workforce Skills Progression & Promotions (Phase 2) ───
          let currentSkill = line.workforceSkill || initializeLineSkill(line.id, line.assignedWorkersCount);
          const skillResult = tickWorkerExperience(
            currentSkill,
            elapsedDays,
            currentStatus === "PRODUCING"
          );
          currentSkill = skillResult.updatedSkill;

          if (skillResult.trainingCompleted) {
            lineChanged = true;
            changed = true;
            pendingEvents.push(
              createCampusEvent(
                "FACTORY_TRAINING_COMPLETE",
                "success",
                `Training Complete: ${line.name}`,
                `Specialized technical skills training program on ${line.name} has concluded. Line workers now operate with enhanced speed and precision.`,
                evtYear,
                evtMonth
              )
            );
          }

          for (const promo of skillResult.promotions) {
            lineChanged = true;
            changed = true;
            pendingEvents.push(
              createCampusEvent(
                "FACTORY_WORKER_PROMOTED",
                "info",
                `Technician Promoted: ${line.name}`,
                `${promo.count} technician(s) on ${line.name} have advanced from ${promo.fromTier} to ${promo.toTier}! Line throughput and assembly quality have improved.`,
                evtYear,
                evtMonth
              )
            );
          }

          // Turnover check for understaffed lines
          const minReqWorkers = line.minWorkersRequired * line.shiftsPerDay;
          const staffingHealth = minReqWorkers > 0 ? (line.assignedWorkersCount / minReqWorkers) * 100 : 100;
          const turnover = evaluateTurnoverRisk(currentSkill, staffingHealth);
          if (turnover.turnoverDeparturesCount > 0) {
            lineChanged = true;
            changed = true;
          }
          currentSkill = turnover.updatedSkill;

          // ═══════════════════════════════════════════════════════════
          // 1. Progress ongoing MAINTENANCE
          // ═══════════════════════════════════════════════════════════
          if (currentStatus === "MAINTENANCE" && maintDays !== undefined) {
            lineChanged = true;
            changed = true;
            maintDays = Math.max(0, maintDays - elapsedDays);
            if (maintDays === 0) {
              currentStatus = "IDLE";
              breakdownRisk = 2;
              pendingEvents.push(
                createCampusEvent(
                  "FACTORY_MAINTENANCE_COMPLETE",
                  "success",
                  `Maintenance Complete: ${line.name}`,
                  `${line.name} has completed its maintenance overhaul and is back online. Breakdown risk reset to 2%.`,
                  evtYear,
                  evtMonth
                )
              );
            }
          }

          // ═══════════════════════════════════════════════════════════
          // 2. Progress ongoing UPGRADE
          // ═══════════════════════════════════════════════════════════
          if (currentStatus === "UPGRADING" && upgDays !== undefined) {
            lineChanged = true;
            changed = true;
            upgDays = Math.max(0, upgDays - elapsedDays);
            if (upgDays === 0) {
              currentStatus = "IDLE";
              pendingEvents.push(
                createCampusEvent(
                  "FACTORY_UPGRADE_COMPLETE",
                  "success",
                  `Upgrade Complete: ${line.name}`,
                  `${line.name} has been upgraded to Tier ${line.level}. Efficiency and cycle time improved.`,
                  evtYear,
                  evtMonth
                )
              );
            }
          }

          // ═══════════════════════════════════════════════════════════
          // 3. Progress ongoing CHANGEOVER (Phase 1 — new!)
          // ═══════════════════════════════════════════════════════════
          if (currentStatus === "CHANGEOVER" && changeoverDaysRemaining !== undefined) {
            lineChanged = true;
            changed = true;
            const coResult = tickChangeoverProgress(
              { ...line, status: currentStatus, changeoverDaysRemaining, changeoverTargetModelId },
              elapsedDays
            );
            currentStatus = coResult.updatedLine.status;
            changeoverDaysRemaining = coResult.updatedLine.changeoverDaysRemaining;
            changeoverTargetModelId = coResult.updatedLine.changeoverTargetModelId;
            currentVehicleModelId = coResult.updatedLine.currentVehicleModelId;

            if (coResult.completed) {
              pendingEvents.push(
                createCampusEvent(
                  "FACTORY_LINE_CHANGEOVER_COMPLETE",
                  "info",
                  `Changeover Complete: ${line.name}`,
                  `${line.name} has finished re-jigging and is now configured for model "${currentVehicleModelId || 'new platform'}". Ready for production.`,
                  evtYear,
                  evtMonth
                )
              );
            }
          }

          // ═══════════════════════════════════════════════════════════
          // 4. Accumulate breakdown risk if PRODUCING
          // ═══════════════════════════════════════════════════════════
          if (currentStatus === "PRODUCING") {
            breakdownRisk = Math.min(65, breakdownRisk + 0.05 * elapsedDays);
            lineChanged = true;
            changed = true;

            // ─── RANDOM BREAKDOWN ROLL (Phase 1 — new!) ───
            const breakdownResult = evaluateBreakdownRisk(
              { ...line, status: currentStatus, breakdownRiskPct: breakdownRisk }
            );

            if (breakdownResult.didBreakdown) {
              currentStatus = "MAINTENANCE";
              maintDays = breakdownResult.emergencyDowntimeDays;
              // Reset breakdown risk after emergency repair
              breakdownRisk = 3;

              // Deduct emergency repair cost
              try {
                const financeStore = useCompanyFinanceStore.getState();
                financeStore.recordTransaction(
                  evtMonth,
                  evtYear,
                  "FACTORY_MAINTENANCE",
                  breakdownResult.repairCostUSD,
                  `EMERGENCY: ${line.name} breakdown — repair cost`
                );
                useCompanyFinanceStore.setState((s) => ({ cash: s.cash - breakdownResult.repairCostUSD }));
              } catch { /* finance store may not be available in tests */ }

              pendingEvents.push(
                createCampusEvent(
                  "FACTORY_LINE_BREAKDOWN",
                  "error",
                  `⚠ BREAKDOWN: ${line.name}`,
                  `${line.name} has suffered an unexpected equipment failure!\n` +
                  `Emergency repair cost: $${breakdownResult.repairCostUSD.toLocaleString()}\n` +
                  `Estimated downtime: ${breakdownResult.emergencyDowntimeDays} days\n` +
                  (breakdownResult.pausedSlotVehicleName
                    ? `Production of "${breakdownResult.pausedSlotVehicleName}" has been paused.`
                    : `No active production was affected.`),
                  evtYear,
                  evtMonth,
                  undefined,
                  breakdownResult.repairCostUSD
                )
              );
            }
          }

          // ═══════════════════════════════════════════════════════════
          // 5. Progress and start production slots
          // ═══════════════════════════════════════════════════════════
          const isBlocked = currentStatus === "MAINTENANCE" || currentStatus === "UPGRADING" || currentStatus === "CHANGEOVER";

          const updatedSlots = (line.reservedSlots || []).map((slot) => {
            // Check if slot should start
            if (slot.status === "SCHEDULED" && slot.startDate <= currentDateStr && !isBlocked) {
              // ─── CHANGEOVER CHECK (Phase 1 — new!) ───
              const coCheck = checkChangeoverRequired(
                { ...line, currentVehicleModelId },
                slot.vehicleModelId
              );

              if (coCheck.requiresChangeover) {
                // Enter changeover state instead of starting production
                currentStatus = "CHANGEOVER";
                changeoverDaysRemaining = coCheck.changeoverDays;
                changeoverTargetModelId = coCheck.toModelId;
                lineChanged = true;
                changed = true;

                // Deduct changeover cost
                try {
                  const financeStore = useCompanyFinanceStore.getState();
                  financeStore.recordTransaction(
                    evtMonth,
                    evtYear,
                    "TOOLING",
                    coCheck.changeoverCostUSD,
                    `Platform changeover: ${line.name} → ${slot.vehicleModelName}`
                  );
                  useCompanyFinanceStore.setState((s) => ({ cash: s.cash - coCheck.changeoverCostUSD }));
                } catch { /* finance store may not be available in tests */ }

                pendingEvents.push(
                  createCampusEvent(
                    "FACTORY_LINE_CHANGEOVER_STARTED",
                    "warning",
                    `Changeover: ${line.name}`,
                    `${line.name} is re-jigging tooling from previous platform to "${slot.vehicleModelName}".\n` +
                    `Changeover time: ${coCheck.changeoverDays} day(s) | Cost: $${coCheck.changeoverCostUSD.toLocaleString()}`,
                    evtYear,
                    evtMonth
                  )
                );

                return slot; // Slot stays SCHEDULED until changeover completes
              }

              // No changeover needed — start production directly
              lineChanged = true;
              changed = true;
              currentVehicleModelId = slot.vehicleModelId;
              return { ...slot, status: "IN_PROGRESS" as SlotStatus };
            }

            // Pause active slot if breakdown just happened
            if (slot.status === "IN_PROGRESS" && currentStatus === "MAINTENANCE" && maintDays !== undefined && maintDays > 0) {
              lineChanged = true;
              changed = true;
              return { ...slot, status: "PAUSED" as SlotStatus, pauseReason: "Emergency breakdown — awaiting repair" };
            }

            // Produce units on active slot (only if not blocked)
            if (slot.status === "IN_PROGRESS" && !isBlocked) {
              const dailyRate = Math.max(1, slot.dailyRate || line.dailyCapacityUnits || 1);
              const unitsToProduce = Math.round(dailyRate * elapsedDays);

              // ─── Phase 2: Check BOM Shortages before producing ───
              let warehouseInv: any[] = [];
              try {
                warehouseInv = useTradeStore.getState().warehouseInventory || [];
              } catch { /* ignored */ }

              const shortageCheck = checkBOMShortagesForProduction(unitsToProduce, warehouseInv);
              if (!shortageCheck.isFeasible && warehouseInv.length > 0) {
                // Shortage detected: pause production slot and alert player
                lineChanged = true;
                changed = true;
                const deficitText = shortageCheck.shortages
                  .map((s) => `${s.name} (-${s.deficit.toLocaleString()} ${s.unit})`)
                  .join(", ");

                pendingEvents.push(
                  createCampusEvent(
                    "FACTORY_PRODUCTION_STARVED",
                    "error",
                    `⚠ Production Halted: ${line.name}`,
                    `Assembly of "${slot.vehicleModelName}" on ${line.name} has been paused due to raw material stockout.\nShortages: ${deficitText}.\nOrder supplies via the Materials tab to resume production.`,
                    evtYear,
                    evtMonth
                  )
                );

                return {
                  ...slot,
                  status: "PAUSED" as SlotStatus,
                  pauseReason: `Material Stockout: ${shortageCheck.shortages[0]?.name || "Missing BOM items"}`,
                };
              }

              // Deduct consumed materials from warehouse stock
              try {
                if (warehouseInv.length > 0) {
                  const consumption = deductBOMConsumption(unitsToProduce, warehouseInv);
                  useTradeStore.setState({ warehouseInventory: consumption.updatedInventory });
                }
              } catch { /* ignored */ }

              const nextProduced = Math.min(slot.targetUnits, slot.producedUnits + unitsToProduce);
              const nextElapsed = slot.elapsedDays + elapsedDays;

              lineChanged = true;
              changed = true;

              if (nextProduced >= slot.targetUnits) {
                pendingEvents.push(
                  createCampusEvent(
                    "FACTORY_SLOT_COMPLETED",
                    "success",
                    `Production Complete: ${slot.vehicleModelName}`,
                    `${line.name} has finished producing ${slot.targetUnits} units of "${slot.vehicleModelName}". Batch ready for dispatch.`,
                    evtYear,
                    evtMonth
                  )
                );

                return {
                  ...slot,
                  producedUnits: slot.targetUnits,
                  elapsedDays: nextElapsed,
                  status: "COMPLETED" as SlotStatus,
                };
              }

              return {
                ...slot,
                producedUnits: nextProduced,
                elapsedDays: nextElapsed,
              };
            }

            return slot;
          });

          if (!lineChanged) return line;

          return recomputeLine({
            ...line,
            status: currentStatus,
            breakdownRiskPct: Math.round(breakdownRisk * 10) / 10,
            maintenanceDaysRemaining: maintDays,
            upgradeDaysRemaining: upgDays,
            changeoverDaysRemaining,
            changeoverTargetModelId,
            currentVehicleModelId,
            workforceSkill: currentSkill,
            reservedSlots: updatedSlots,
          });
        });

        // Push all accumulated factory events into the campus notification system
        if (pendingEvents.length > 0) {
          try {
            const campusStore = useCampusStore.getState();
            for (const evt of pendingEvents) {
              campusStore.addCampusEvent(evt);
            }
          } catch { /* campus store may not be available in tests */ }
        }

        if (!changed) return state;

        persistFactoryState(nextLines, updatedOrders);
        const campusState = useCampusStore.getState().factoryState;
        const summary = computeFactoryFloorSummary(
          nextLines,
          campusState.factoryLevel || 1,
          campusState.ownershipStatus || "no_factory_outsourced"
        );

        return {
          assemblyLines: nextLines,
          purchaseOrders: updatedOrders,
          factoryFloorSummary: summary,
        };
      });
    },

    recalculateSummary: () => {
      const state = get();
      const campusState = useCampusStore.getState().factoryState;
      const summary = computeFactoryFloorSummary(
        state.assemblyLines,
        campusState.factoryLevel || 1,
        campusState.ownershipStatus || "no_factory_outsourced"
      );
      set({ factoryFloorSummary: summary });
    },

    resetToInitialFloor: () => {
      const initial = createInitialAssemblyLines(1);
      persistFactoryState(initial, []);
      const campusState = useCampusStore.getState().factoryState;
      const summary = computeFactoryFloorSummary(
        initial,
        campusState.factoryLevel || 1,
        campusState.ownershipStatus || "no_factory_outsourced"
      );
      set({
        assemblyLines: initial,
        purchaseOrders: [],
        selectedLineId: initial[0]?.id || null,
        factoryFloorSummary: summary,
      });
    },
  };
});

// Automatic simulation clock listener subscription
clockListeners.subscribe("day", "factoryDailyTick", (payload) => {
  const elapsedDays = payload.elapsedDays || 1;
  const dateStr = gameEventDateStr(payload.current);
  useFactoryStore.getState().tickFactoryDay(dateStr, elapsedDays);
});
