/**
 * AUTO TYCOON CAMPUS HQ - CAMPUS EVENT SYSTEM (PHASE 27)
 * 
 * Manages game events, milestones, architectural awards,
 * and random incidents (e.g. electrical short, winter freeze).
 */

import { CampusUnitId } from "./campusTypes";

export type CampusEventType =
  | "CONSTRUCTION_STARTED"
  | "CONSTRUCTION_COMPLETED"
  | "LEVEL_UP"
  | "PLOT_UNLOCKED"
  | "DEPARTMENT_OPENED"
  | "STAFF_MILESTONE"
  | "CAMPUS_AWARD"
  | "INCIDENT_ELECTRICAL_SHORT"
  | "INCIDENT_FROZEN_PIPES"
  | "DISASTER_FIRE"
  | "DISASTER_FLOOD"
  // Factory Floor Events (Phase 1 & 2)
  | "FACTORY_LINE_BREAKDOWN"
  | "FACTORY_LINE_CHANGEOVER_STARTED"
  | "FACTORY_LINE_CHANGEOVER_COMPLETE"
  | "FACTORY_MAINTENANCE_COMPLETE"
  | "FACTORY_SLOT_COMPLETED"
  | "FACTORY_UPGRADE_COMPLETE"
  | "FACTORY_MATERIALS_DELIVERED"
  | "FACTORY_PRODUCTION_STARVED"
  | "FACTORY_WORKER_PROMOTED"
  | "FACTORY_TRAINING_COMPLETE";

export type EventSeverity = "info" | "success" | "warning" | "error";

export interface CampusEventLogEntry {
  id: string;
  type: CampusEventType;
  severity: EventSeverity;
  title: string;
  message: string;
  unitId?: CampusUnitId;
  year: number;
  month: number;
  repairCost?: number;
  isRead: boolean;
  createdAt: number;
}

export function createCampusEvent(
  type: CampusEventType,
  severity: EventSeverity,
  title: string,
  message: string,
  year: number,
  month: number,
  unitId?: CampusUnitId,
  repairCost?: number
): CampusEventLogEntry {
  return {
    id: `EVT_${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type,
    severity,
    title,
    message,
    unitId,
    year,
    month,
    repairCost,
    isRead: false,
    createdAt: Date.now(),
  };
}

/**
 * Evaluates random incident probability during monthly simulation tick.
 * Very low baseline chance (< 2% per month) so it doesn't frustrate players.
 */
export function evaluateRandomCampusIncident(
  activeUnits: CampusUnitId[],
  year: number,
  month: number
): CampusEventLogEntry | null {
  if (activeUnits.length === 0) return null;

  const roll = Math.random();
  // 1.5% chance of a minor event
  if (roll > 0.015) return null;

  const targetUnit = activeUnits[Math.floor(Math.random() * activeUnits.length)];

  if (month === 12 || month === 1 || month === 2) {
    // Winter incident: frozen water main
    return createCampusEvent(
      "INCIDENT_FROZEN_PIPES",
      "warning",
      "Sub-Zero Freeze: Burst Water Main",
      `Freezing conditions ruptured a water main near ${targetUnit}. Temporary repair crew deployed.`,
      year,
      month,
      targetUnit,
      4500
    );
  }

  // Electrical transformer short
  return createCampusEvent(
    "INCIDENT_ELECTRICAL_SHORT",
    "warning",
    "Electrical Substation Surge",
    `A high-voltage transformer surge tripped circuit breakers at ${targetUnit}. Equipment inspection required.`,
    year,
    month,
    targetUnit,
    6500
  );
}
