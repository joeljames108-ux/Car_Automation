/**
 * AUTO TYCOON CAMPUS HQ - CAMPUS SAVE/LOAD SERIALIZATION (PHASE 28)
 * 
 * Provides robust JSON serialization, schema versioning,
 * and data integrity validation for the campus subsystem.
 */

import { CampusUnitDefinition, CampusUnitId, FactoryProgressionState } from "./campusTypes";
import { ConstructionJob } from "./constructionQueue";
import { CampusEventLogEntry } from "./campusEvents";
import { MaterialInventory, MaterialOrder } from "./constructionLogistics";
import { CampusEmployeeAssignment } from "./staffAllocationEngine";
import { CAMPUS_UNITS_REGISTRY, INITIAL_FACTORY_STATE } from "./campusRegistry";

export const CAMPUS_SAVE_SCHEMA_VERSION = 1;

export interface SerializedCampusData {
  schemaVersion: number;
  timestamp: number;
  units: Record<CampusUnitId, Partial<CampusUnitDefinition>>;
  factoryState: FactoryProgressionState;
  constructionJobs: ConstructionJob[];
  materialInventory: MaterialInventory;
  materialOrders: MaterialOrder[];
  staffAssignments: CampusEmployeeAssignment[];
  eventLog: CampusEventLogEntry[];
}

/**
 * Serialize full campus runtime state into an archival object
 */
export function serializeCampusState(
  units: Record<CampusUnitId, CampusUnitDefinition>,
  factoryState: FactoryProgressionState,
  constructionJobs: ConstructionJob[],
  materialInventory: MaterialInventory,
  materialOrders: MaterialOrder[],
  staffAssignments: CampusEmployeeAssignment[],
  eventLog: CampusEventLogEntry[]
): string {
  // Compress units by saving key dynamic attributes (level, status, currentStaff, subDepartments)
  const compactUnits: Record<string, Partial<CampusUnitDefinition>> = {};
  for (const [id, def] of Object.entries(units)) {
    compactUnits[id] = {
      id: def.id,
      level: def.level,
      tier: def.tier,
      status: def.status,
      currentStaff: def.currentStaff,
      monthlyMaintenanceCost: def.monthlyMaintenanceCost,
      subDepartments: def.subDepartments,
      activePrototypes: def.activePrototypes,
    };
  }

  const payload: SerializedCampusData = {
    schemaVersion: CAMPUS_SAVE_SCHEMA_VERSION,
    timestamp: Date.now(),
    units: compactUnits as Record<CampusUnitId, Partial<CampusUnitDefinition>>,
    factoryState,
    constructionJobs,
    materialInventory,
    materialOrders,
    staffAssignments,
    eventLog,
  };

  return JSON.stringify(payload);
}

export interface DeserializationResult {
  success: boolean;
  error?: string;
  units: Record<CampusUnitId, CampusUnitDefinition>;
  factoryState: FactoryProgressionState;
  constructionJobs: ConstructionJob[];
  materialInventory: MaterialInventory;
  materialOrders: MaterialOrder[];
  staffAssignments: CampusEmployeeAssignment[];
  eventLog: CampusEventLogEntry[];
}

/**
 * Reconstitutes and validates campus state from JSON with backwards compatibility
 */
export function deserializeCampusState(jsonString: string): DeserializationResult {
  try {
    const parsed: SerializedCampusData = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid campus save data payload.");
    }

    // Merge serialized units with base registry defaults to ensure all definitions remain intact
    const restoredUnits: Record<CampusUnitId, CampusUnitDefinition> = { ...CAMPUS_UNITS_REGISTRY };
    if (parsed.units) {
      for (const [unitId, partial] of Object.entries(parsed.units)) {
        const key = unitId as CampusUnitId;
        if (restoredUnits[key]) {
          restoredUnits[key] = {
            ...restoredUnits[key],
            level: partial.level ?? restoredUnits[key].level,
            tier: partial.tier ?? restoredUnits[key].tier,
            status: partial.status ?? restoredUnits[key].status,
            currentStaff: partial.currentStaff ?? restoredUnits[key].currentStaff,
            monthlyMaintenanceCost: partial.monthlyMaintenanceCost ?? restoredUnits[key].monthlyMaintenanceCost,
            subDepartments: partial.subDepartments ?? restoredUnits[key].subDepartments,
            activePrototypes: partial.activePrototypes ?? restoredUnits[key].activePrototypes,
          };
        }
      }
    }

    return {
      success: true,
      units: restoredUnits,
      factoryState: parsed.factoryState || INITIAL_FACTORY_STATE,
      constructionJobs: parsed.constructionJobs || [],
      materialInventory: parsed.materialInventory || {},
      materialOrders: parsed.materialOrders || [],
      staffAssignments: parsed.staffAssignments || [],
      eventLog: parsed.eventLog || [],
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown deserialization failure";
    return {
      success: false,
      error: errorMsg,
      units: { ...CAMPUS_UNITS_REGISTRY },
      factoryState: { ...INITIAL_FACTORY_STATE },
      constructionJobs: [],
      materialInventory: {},
      materialOrders: [],
      staffAssignments: [],
      eventLog: [],
    };
  }
}
