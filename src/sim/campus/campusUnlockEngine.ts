/**
 * AUTO TYCOON CAMPUS HQ - CAMPUS UNLOCK ENGINE (PHASE 23)
 * 
 * Evaluates prerequisite conditions for acquiring expansion plots
 * and constructing locked specialized campus units.
 */

import { CampusUnitId } from "./campusTypes";

export interface UnlockRequirement {
  unitId: CampusUnitId;
  name: string;
  minYear: number;
  minCorporateLevel: number;
  minCashOnHand: number;
  minReputation: number;
  requiredCompletedUnits?: CampusUnitId[];
  description: string;
}

export const CAMPUS_UNLOCK_REQUIREMENTS: Record<CampusUnitId, UnlockRequirement> = {
  // ── STARTER BUILDINGS (Unlocked in 1970) ──
  CENTRAL_CORPORATE_HQ: {
    unitId: "CENTRAL_CORPORATE_HQ",
    name: "Central Corporate HQ",
    minYear: 1970,
    minCorporateLevel: 1,
    minCashOnHand: 0,
    minReputation: 0,
    description: "Active starter building. The core executive heart of the company.",
  },
  POWERTRAIN_EV_HQ: {
    unitId: "POWERTRAIN_EV_HQ",
    name: "Powertrain & EV HQ",
    minYear: 1970,
    minCorporateLevel: 1,
    minCashOnHand: 0,
    minReputation: 0,
    description: "Active starter building. Engine and drivetrain development labs.",
  },
  VEHICLE_DESIGN_HQ: {
    unitId: "VEHICLE_DESIGN_HQ",
    name: "Vehicle Design HQ",
    minYear: 1970,
    minCorporateLevel: 1,
    minCashOnHand: 0,
    minReputation: 0,
    description: "Active starter building. Styling studio and 1:1 clay modeling.",
  },
  CHASSIS_DYNAMICS_HQ: {
    unitId: "CHASSIS_DYNAMICS_HQ",
    name: "Chassis & Dynamics HQ",
    minYear: 1970,
    minCorporateLevel: 1,
    minCashOnHand: 0,
    minReputation: 0,
    description: "Active starter building. Suspension, steering, and braking rigs.",
  },
  INTERIOR_HQ: {
    unitId: "INTERIOR_HQ",
    name: "Interior & HMI HQ",
    minYear: 1970,
    minCorporateLevel: 1,
    minCashOnHand: 0,
    minReputation: 0,
    description: "Active starter building. Cabin ergonomics, seating, and dashboards.",
  },
  SUPPLIER_PROCUREMENT_HQ: {
    unitId: "SUPPLIER_PROCUREMENT_HQ",
    name: "Supplier & Procurement HQ",
    minYear: 1970,
    minCorporateLevel: 1,
    minCashOnHand: 0,
    minReputation: 0,
    description: "Active starter building. Component purchasing and logistics docks.",
  },
  MARKETING_SALES_HQ: {
    unitId: "MARKETING_SALES_HQ",
    name: "Marketing & Sales HQ",
    minYear: 1970,
    minCorporateLevel: 1,
    minCashOnHand: 0,
    minReputation: 0,
    description: "Active starter building. Dealership network and advertising press.",
  },

  // ── 7 LOCKED EXPANSION PLOTS (Requires Growth & Technology) ──
  AERO_HQ: {
    unitId: "AERO_HQ",
    name: "Aero HQ & Wind Tunnel",
    minYear: 1972,
    minCorporateLevel: 2,
    minCashOnHand: 1800000,
    minReputation: 20,
    requiredCompletedUnits: ["CENTRAL_CORPORATE_HQ", "VEHICLE_DESIGN_HQ"],
    description: "Requires Corporate Level 2, $1.8M capital reserves, and 20 reputation to build boundary-layer wind tunnel.",
  },
  TESTING_VALIDATION_HQ: {
    unitId: "TESTING_VALIDATION_HQ",
    name: "Testing & Validation HQ",
    minYear: 1971,
    minCorporateLevel: 2,
    minCashOnHand: 1200000,
    minReputation: 15,
    requiredCompletedUnits: ["CHASSIS_DYNAMICS_HQ"],
    description: "Requires Corporate Level 2, $1.2M capital reserves to acquire rough-road torture track proving grounds.",
  },
  MOTORSPORT_HQ: {
    unitId: "MOTORSPORT_HQ",
    name: "Motorsport HQ",
    minYear: 1973,
    minCorporateLevel: 2,
    minCashOnHand: 2000000,
    minReputation: 25,
    requiredCompletedUnits: ["POWERTRAIN_EV_HQ", "CHASSIS_DYNAMICS_HQ"],
    description: "Requires Corporate Level 2, $2.0M capital reserves, and 25 reputation to launch works racing division.",
  },
  COMMERCIAL_VEHICLES_HQ: {
    unitId: "COMMERCIAL_VEHICLES_HQ",
    name: "Commercial Vehicles HQ",
    minYear: 1972,
    minCorporateLevel: 2,
    minCashOnHand: 1500000,
    minReputation: 18,
    requiredCompletedUnits: ["POWERTRAIN_EV_HQ"],
    description: "Requires Corporate Level 2, $1.5M capital reserves to develop heavy commercial truck platforms.",
  },
  FACTORY: {
    unitId: "FACTORY",
    name: "Owned Manufacturing Plant Complex",
    minYear: 1974,
    minCorporateLevel: 3,
    minCashOnHand: 5000000,
    minReputation: 30,
    requiredCompletedUnits: ["SUPPLIER_PROCUREMENT_HQ", "QUALITY_RELIABILITY_HQ"],
    description: "Requires Corporate Level 3, $5.0M civil engineering reserves, and 30 reputation to transition from outsourced assembly to owned factory.",
  },
  QUALITY_RELIABILITY_HQ: {
    unitId: "QUALITY_RELIABILITY_HQ",
    name: "Quality & Reliability HQ",
    minYear: 1971,
    minCorporateLevel: 2,
    minCashOnHand: 950000,
    minReputation: 12,
    requiredCompletedUnits: ["CENTRAL_CORPORATE_HQ"],
    description: "Requires Corporate Level 2 and $950k capital reserves to install precision coordinate measuring metrology.",
  },
  SAFETY_HQ: {
    unitId: "SAFETY_HQ",
    name: "Safety & Crash Test Center",
    minYear: 1972,
    minCorporateLevel: 2,
    minCashOnHand: 1400000,
    minReputation: 16,
    requiredCompletedUnits: ["CENTRAL_CORPORATE_HQ"],
    description: "Requires Corporate Level 2 and $1.4M capital reserves to build 150m linear crash deceleration sled hall.",
  },
};

export interface GameStateContext {
  currentYear: number;
  corporateLevel: number;
  cashOnHand: number;
  companyReputation: number;
  activeUnitIds: CampusUnitId[];
}

export interface UnlockEvaluationResult {
  canUnlock: boolean;
  missingRequirements: string[];
  requirement: UnlockRequirement;
}

/**
 * Pure function: Evaluate whether a locked unit plot can be acquired and constructed.
 */
export function evaluateUnlockConditions(
  unitId: CampusUnitId,
  gameState: GameStateContext
): UnlockEvaluationResult {
  const req = CAMPUS_UNLOCK_REQUIREMENTS[unitId];
  if (!req) {
    return {
      canUnlock: true,
      missingRequirements: [],
      requirement: {
        unitId,
        name: unitId,
        minYear: 1970,
        minCorporateLevel: 1,
        minCashOnHand: 0,
        minReputation: 0,
        description: "",
      },
    };
  }

  const missing: string[] = [];

  if (gameState.currentYear < req.minYear) {
    missing.push(`Available in year ${req.minYear} (Current: ${gameState.currentYear})`);
  }

  if (gameState.corporateLevel < req.minCorporateLevel) {
    missing.push(`Requires Corporate HQ Level ${req.minCorporateLevel} (Current: Level ${gameState.corporateLevel})`);
  }

  if (gameState.cashOnHand < req.minCashOnHand) {
    const deficit = req.minCashOnHand - gameState.cashOnHand;
    missing.push(`Requires $${req.minCashOnHand.toLocaleString()} capital reserves (Deficit: $${deficit.toLocaleString()})`);
  }

  if (gameState.companyReputation < req.minReputation) {
    missing.push(`Requires reputation score of ${req.minReputation} (Current: ${gameState.companyReputation})`);
  }

  if (req.requiredCompletedUnits && req.requiredCompletedUnits.length > 0) {
    for (const prereqId of req.requiredCompletedUnits) {
      if (!gameState.activeUnitIds.includes(prereqId)) {
        const prereqName = CAMPUS_UNLOCK_REQUIREMENTS[prereqId]?.name || prereqId;
        missing.push(`Requires operational ${prereqName}`);
      }
    }
  }

  return {
    canUnlock: missing.length === 0,
    missingRequirements: missing,
    requirement: req,
  };
}
