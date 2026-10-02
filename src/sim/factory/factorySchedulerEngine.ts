/**
 * ═══════════════════════════════════════════════════════════════════════
 * FACTORY PRODUCTION SCHEDULER ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements pure calendar-based scheduling algorithms:
 * 1. Calendar date arithmetic with line operating days
 * 2. Slot reservation with conflict & overlap detection
 * 3. Monthly Gantt matrix generation for high-density UI rendering
 * 4. Contract SLA tracking and delivery projections
 */

import { AssemblyLine, ProductionSlot, SlotStatus } from "./factoryTypes";
import { computeLineCapacity } from "./factoryCapacityEngine";

export interface ScheduleSlotInput {
  lineId: string;
  vehicleModelId: string;
  vehicleModelName: string;
  startDateStr: string; // YYYY-MM-DD
  targetUnits: number;
  unitBOMCostUSD: number;
  unitLaborCostUSD: number;
  priority?: 1 | 2 | 3;
  contractId?: string;
  customDailyRate?: number;
}

export interface ScheduleSlotResult {
  success: boolean;
  slot?: ProductionSlot;
  conflictReason?: string;
  suggestedStartDate?: string;
}

export interface GanttDayCell {
  dayNumber: number;
  dateStr: string;
  isOperatingDay: boolean;
  slots: {
    slotId: string;
    vehicleModelName: string;
    status: SlotStatus;
    isStart: boolean;
    isEnd: boolean;
    progressPct: number;
  }[];
}

export interface GanttLineRow {
  lineId: string;
  lineName: string;
  lineType: string;
  days: GanttDayCell[];
  monthlyCapacityUnits: number;
  scheduledUnitsThisMonth: number;
  utilizationPct: number;
}

export interface GanttMonthView {
  year: number;
  month: number;
  monthName: string;
  daysInMonth: number;
  rows: GanttLineRow[];
}

/**
 * Adds N operational days to a start date, skipping non-operating days.
 */
export function calculateCompletionDate(
  startDateStr: string,
  operationalDaysRequired: number,
  operatingDaysPerWeek: 5 | 6 | 7
): string {
  const [y, m, d] = startDateStr.split("-").map(Number);
  const current = new Date(Date.UTC(y, m - 1, d));

  let addedOperational = 0;
  while (addedOperational < operationalDaysRequired) {
    current.setUTCDate(current.getUTCDate() + 1);
    const dayOfWeek = current.getUTCDay(); // 0 = Sun, 6 = Sat

    if (operatingDaysPerWeek === 5) {
      // Exclude Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedOperational++;
      }
    } else if (operatingDaysPerWeek === 6) {
      // Exclude Sunday (0)
      if (dayOfWeek !== 0) {
        addedOperational++;
      }
    } else {
      // 7 days
      addedOperational++;
    }
  }

  const outY = current.getUTCFullYear();
  const outM = String(current.getUTCMonth() + 1).padStart(2, "0");
  const outD = String(current.getUTCDate()).padStart(2, "0");
  return `${outY}-${outM}-${outD}`;
}

/**
 * Checks for date overlap between two slots.
 */
export function doSlotsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA <= endB && endA >= startB;
}

/**
 * Validates and calculates a production slot reservation for an assembly line.
 */
export function validateAndCreateSlot(
  line: AssemblyLine,
  input: ScheduleSlotInput
): ScheduleSlotResult {
  const cap = computeLineCapacity(line);
  const dailyRate = input.customDailyRate || Math.max(1, cap.dailyCapacity);
  const operationalDaysRequired = Math.ceil(input.targetUnits / dailyRate);

  const calculatedEndDate = calculateCompletionDate(
    input.startDateStr,
    operationalDaysRequired,
    line.operatingDaysPerWeek
  );

  // Check for conflicts with existing reserved slots on this line
  const conflictingSlot = (line.reservedSlots || []).find((existing) => {
    if (existing.status === "CANCELLED" || existing.status === "COMPLETED") return false;
    return doSlotsOverlap(
      input.startDateStr,
      calculatedEndDate,
      existing.startDate,
      existing.endDate
    );
  });

  if (conflictingSlot) {
    return {
      success: false,
      conflictReason: `Schedule conflict: ${line.name} is already committed to ${conflictingSlot.vehicleModelName} from ${conflictingSlot.startDate} to ${conflictingSlot.endDate}.`,
      suggestedStartDate: conflictingSlot.endDate,
    };
  }

  const slot: ProductionSlot = {
    id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    lineId: line.id,
    contractId: input.contractId,
    vehicleModelId: input.vehicleModelId,
    vehicleModelName: input.vehicleModelName,
    startDate: input.startDateStr,
    endDate: calculatedEndDate,
    totalProductionDays: operationalDaysRequired,
    elapsedDays: 0,
    targetUnits: input.targetUnits,
    producedUnits: 0,
    dailyRate,
    unitCycleTimeMinutes: cap.cycleTimeMinutes,
    unitBOMCostUSD: input.unitBOMCostUSD,
    unitLaborCostUSD: input.unitLaborCostUSD,
    totalCostUSD: (input.unitBOMCostUSD + input.unitLaborCostUSD) * input.targetUnits,
    status: "SCHEDULED",
    priority: input.priority || 2,
  };

  return {
    success: true,
    slot,
  };
}

/**
 * Generates a full month Gantt matrix for all lines on the floor.
 */
export function generateMonthlyGanttView(
  lines: AssemblyLine[],
  year: number,
  month: number // 1-12
): GanttMonthView {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const rows: GanttLineRow[] = lines.map((line) => {
    const days: GanttDayCell[] = [];
    let scheduledUnitsThisMonth = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const jsDate = new Date(Date.UTC(year, month - 1, d));
      const dow = jsDate.getUTCDay();

      const isOperatingDay =
        line.operatingDaysPerWeek === 7
          ? true
          : line.operatingDaysPerWeek === 6
          ? dow !== 0
          : dow !== 0 && dow !== 6;

      const activeSlotsOnDay: GanttDayCell["slots"] = [];

      for (const slot of line.reservedSlots || []) {
        if (slot.status === "CANCELLED") continue;

        if (dateStr >= slot.startDate && dateStr <= slot.endDate) {
          const isStart = dateStr === slot.startDate;
          const isEnd = dateStr === slot.endDate;
          const progressPct = Math.round(
            (slot.producedUnits / Math.max(1, slot.targetUnits)) * 100
          );

          activeSlotsOnDay.push({
            slotId: slot.id,
            vehicleModelName: slot.vehicleModelName,
            status: slot.status,
            isStart,
            isEnd,
            progressPct,
          });

          if (isOperatingDay && (slot.status === "IN_PROGRESS" || slot.status === "SCHEDULED")) {
            scheduledUnitsThisMonth += slot.dailyRate;
          }
        }
      }

      days.push({
        dayNumber: d,
        dateStr,
        isOperatingDay,
        slots: activeSlotsOnDay,
      });
    }

    const cap = computeLineCapacity(line);
    const utilizationPct =
      cap.monthlyCapacity > 0
        ? Math.min(100, Math.round((scheduledUnitsThisMonth / cap.monthlyCapacity) * 100))
        : 0;

    return {
      lineId: line.id,
      lineName: line.name,
      lineType: line.type,
      days,
      monthlyCapacityUnits: cap.monthlyCapacity,
      scheduledUnitsThisMonth,
      utilizationPct,
    };
  });

  return {
    year,
    month,
    monthName: monthNames[month - 1] || "Current Month",
    daysInMonth,
    rows,
  };
}
