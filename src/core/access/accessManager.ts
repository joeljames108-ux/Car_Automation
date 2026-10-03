/**
 * ═══════════════════════════════════════════════════════════════════════
 *  ACCESS MANAGER — MASTER PROGRESSION GATE & OVERRIDE ARBITRATION
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Architecture:
 *
 *                    GAME CLOCK (Year / Date)
 *                            │
 *            ┌───────────────┴───────────────┐
 *            ↓                               ↓
 *     eraProgressionEngine          developerModeStore
 *     (1970 → 1985 → 2000 → 2015+)  (Sandbox & Dev Overrides)
 *            │                               │
 *            └───────────────┬───────────────┘
 *                            ↓
 *                      ACCESS MANAGER
 *                            │
 *        ┌───────────┬───────┴───────┬───────────┐
 *        ↓           ↓               ↓           ↓
 *     Engines    Chassis & Aero   Interiors  Materials & R&D
 *
 *  Rules:
 *    1. Single authority for all feature, era, and component unlocks.
 *    2. In Player Mode: strictly enforces historical eras, R&D tech trees,
 *       and facility levels.
 *    3. In Developer Mode: selectively or globally bypasses gating rules
 *       based on active DevOverrides.
 */

import {
  AutomotiveEraType,
  AUTOMOTIVE_ERAS,
  getEraForYear,
  EraSpecification,
} from "../../sim/economy/eraProgressionEngine";
import {
  MATERIAL_ERA_TIMELINE,
} from "../../sim/trade/economicEraProgression";
import type { ProcessedMaterialType } from "../../sim/trade/tradeTypes";
import { useDeveloperModeStore } from "../../state/developerModeStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useRDTreeStore } from "../../state/rdTreeStore";

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  requiredYear?: number;
  requiredEra?: AutomotiveEraType;
  requiredTechId?: string;
  bypassedByDevMode?: boolean;
}

export class AccessManager {
  /**
   * Check if current game context satisfies the required year
   */
  static canAccessYear(requiredYear: number, overrideCurrentYear?: number): boolean {
    const dev = useDeveloperModeStore.getState();
    if (dev.devMode && dev.overrides.ignoreWorkflowGating) {
      return true;
    }
    const currentYear = overrideCurrentYear ?? useSimulationClockStore.getState().year;
    return currentYear >= requiredYear;
  }

  /**
   * Check if current game context has unlocked an automotive era
   */
  static canAccessEra(targetEra: AutomotiveEraType, overrideCurrentYear?: number): AccessCheckResult {
    const dev = useDeveloperModeStore.getState();
    const currentYear = overrideCurrentYear ?? useSimulationClockStore.getState().year;
    const targetSpec: EraSpecification = AUTOMOTIVE_ERAS[targetEra];

    if (dev.devMode && (dev.overrides.ignoreWorkflowGating || dev.overrides.ignoreEngineLocks)) {
      return { allowed: true, bypassedByDevMode: true };
    }

    if (currentYear >= targetSpec.startYear) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `Locked until ${targetSpec.startYear} (${targetSpec.title}). Current year is ${currentYear}.`,
      requiredYear: targetSpec.startYear,
      requiredEra: targetEra,
    };
  }

  /**
   * Check if an engine architecture or technology is accessible
   */
  static canAccessEngine(params: {
    unlockYear?: number;
    requiredTechId?: string;
    isSuperchargedOrTurbo?: boolean;
    isHybridOrElectric?: boolean;
  }): AccessCheckResult {
    const dev = useDeveloperModeStore.getState();
    if (dev.devMode && dev.overrides.ignoreEngineLocks) {
      return { allowed: true, bypassedByDevMode: true };
    }

    const currentYear = useSimulationClockStore.getState().year;

    // Check historical year availability
    if (params.unlockYear && currentYear < params.unlockYear) {
      return {
        allowed: false,
        reason: `Engine architecture requires year ${params.unlockYear}+ (Current: ${currentYear}).`,
        requiredYear: params.unlockYear,
      };
    }

    // Forced era checks for advanced propulsion
    if (params.isHybridOrElectric && currentYear < 2010) {
      return {
        allowed: false,
        reason: "Hybrid & High-Voltage Electric powertrains require the 2010+ Electrified Era.",
        requiredYear: 2010,
        requiredEra: "ERA_2015_TECH_LEADER",
      };
    }

    if (params.isSuperchargedOrTurbo && currentYear < 1978) {
      return {
        allowed: false,
        reason: "Turbocharged forced-induction systems require the 1978+ Turbo Era.",
        requiredYear: 1978,
        requiredEra: "ERA_1985_ESTABLISHED",
      };
    }

    // Check R&D tech prerequisites if specified
    if (params.requiredTechId) {
      const rd = useRDTreeStore.getState();
      const hasTech = rd.unlockedTechs.includes(params.requiredTechId);
      if (!hasTech && !(dev.devMode && dev.overrides.ignoreResearchRequirements)) {
        return {
          allowed: false,
          reason: `Requires R&D patent ${params.requiredTechId}.`,
          requiredTechId: params.requiredTechId,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check if a chassis platform / body structure is accessible
   */
  static canAccessVehicleArchitecture(params: {
    requiresCarbonMonocoque?: boolean;
    requiresAluminumSpaceframe?: boolean;
    unlockYear?: number;
    requiredTechId?: string;
  }): AccessCheckResult {
    const dev = useDeveloperModeStore.getState();
    if (dev.devMode && dev.overrides.ignoreVehicleLocks) {
      return { allowed: true, bypassedByDevMode: true };
    }

    const currentYear = useSimulationClockStore.getState().year;

    if (params.unlockYear && currentYear < params.unlockYear) {
      return {
        allowed: false,
        reason: `Platform architecture unlocks in year ${params.unlockYear} (Current: ${currentYear}).`,
        requiredYear: params.unlockYear,
      };
    }

    if (params.requiresCarbonMonocoque && currentYear < 1992) {
      return {
        allowed: false,
        reason: "Full carbon composite monocoque tub requires autoclave tech introduced in 1992+.",
        requiredYear: 1992,
        requiredEra: "ERA_1985_ESTABLISHED",
      };
    }

    if (params.requiresAluminumSpaceframe && currentYear < 1989) {
      return {
        allowed: false,
        reason: "Extruded aluminum spaceframe construction requires 1989+ metallurgy.",
        requiredYear: 1989,
        requiredEra: "ERA_1985_ESTABLISHED",
      };
    }

    if (params.requiredTechId) {
      const rd = useRDTreeStore.getState();
      if (!rd.unlockedTechs.includes(params.requiredTechId) && !(dev.devMode && dev.overrides.ignoreResearchRequirements)) {
        return {
          allowed: false,
          reason: `Requires R&D technology unlock: ${params.requiredTechId}.`,
          requiredTechId: params.requiredTechId,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check if aerodynamic devices (DRS, active flaps, Venturi diffusers) are accessible
   */
  static canAccessAero(params: {
    requiresActiveAero?: boolean;
    requiresGroundEffectVenturi?: boolean;
    unlockYear?: number;
  }): AccessCheckResult {
    const dev = useDeveloperModeStore.getState();
    if (dev.devMode && dev.overrides.ignoreAeroLocks) {
      return { allowed: true, bypassedByDevMode: true };
    }

    const currentYear = useSimulationClockStore.getState().year;

    if (params.unlockYear && currentYear < params.unlockYear) {
      return {
        allowed: false,
        reason: `Aero package unlocks in year ${params.unlockYear}.`,
        requiredYear: params.unlockYear,
      };
    }

    if (params.requiresActiveAero && currentYear < 1991) {
      return {
        allowed: false,
        reason: "Active aerodynamic wings and DRS actuators require 1991+ electro-hydraulic controls.",
        requiredYear: 1991,
      };
    }

    if (params.requiresGroundEffectVenturi && currentYear < 1977) {
      return {
        allowed: false,
        reason: "Full underbody Venturi ground effect tunnels require 1977+ aerodynamic advancements.",
        requiredYear: 1977,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if interior appointments and infotainment screens are accessible
   */
  static canAccessInterior(params: {
    requiresDigitalOLED?: boolean;
    requiresARHUD?: boolean;
    unlockYear?: number;
  }): AccessCheckResult {
    const dev = useDeveloperModeStore.getState();
    if (dev.devMode && dev.overrides.ignoreInteriorLocks) {
      return { allowed: true, bypassedByDevMode: true };
    }

    const currentYear = useSimulationClockStore.getState().year;

    if (params.unlockYear && currentYear < params.unlockYear) {
      return {
        allowed: false,
        reason: `Interior equipment requires year ${params.unlockYear}.`,
        requiredYear: params.unlockYear,
      };
    }

    if (params.requiresARHUD && currentYear < 2020) {
      return {
        allowed: false,
        reason: "Augmented Reality Head-Up Displays require 2020+ photonics and spatial computing.",
        requiredYear: 2020,
      };
    }

    if (params.requiresDigitalOLED && currentYear < 2012) {
      return {
        allowed: false,
        reason: "Curved digital OLED instrument clusters require 2012+ automotive display electronics.",
        requiredYear: 2012,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if a raw material is commercially unlocked in the global supply chain
   */
  static canAccessMaterial(materialKey: ProcessedMaterialType): AccessCheckResult {
    const dev = useDeveloperModeStore.getState();
    if (dev.devMode && dev.overrides.ignoreFacilityLocks) {
      return { allowed: true, bypassedByDevMode: true };
    }

    const currentYear = useSimulationClockStore.getState().year;
    const spec = MATERIAL_ERA_TIMELINE[materialKey];
    if (!spec) {
      return { allowed: true };
    }

    if (currentYear < spec.unlockYear) {
      return {
        allowed: false,
        reason: `${spec.name} is not commercially viable until ${spec.unlockYear} (${spec.eraIntroduced}).`,
        requiredYear: spec.unlockYear,
        requiredEra: spec.eraIntroduced,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if an R&D research project is accessible
   */
  static canAccessResearch(techId: string, requiredYear?: number): AccessCheckResult {
    const dev = useDeveloperModeStore.getState();
    if (dev.devMode && dev.overrides.ignoreResearchRequirements) {
      return { allowed: true, bypassedByDevMode: true };
    }

    if (requiredYear) {
      const currentYear = useSimulationClockStore.getState().year;
      if (currentYear < requiredYear) {
        return {
          allowed: false,
          reason: `R&D initiative "${techId}" requires year ${requiredYear}+.`,
          requiredYear,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check if a motorsport competition class or championship is accessible
   */
  static canAccessMotorsport(category: string, requiredReputation = 0): AccessCheckResult {
    const dev = useDeveloperModeStore.getState();
    if (dev.devMode && dev.overrides.ignoreMotorsportRequirements) {
      return { allowed: true, bypassedByDevMode: true };
    }

    return { allowed: true };
  }
}

/**
 * React hook for components needing reactive access checking
 */
export function useAccessManager() {
  const year = useSimulationClockStore((s) => s.year);
  const dev = useDeveloperModeStore();
  const currentEra = getEraForYear(year);

  return {
    year,
    currentEra,
    devMode: dev.devMode,
    overrides: dev.overrides,
    canAccessYear: (y: number) => AccessManager.canAccessYear(y, year),
    canAccessEra: (era: AutomotiveEraType) => AccessManager.canAccessEra(era, year),
    canAccessEngine: AccessManager.canAccessEngine,
    canAccessVehicleArchitecture: AccessManager.canAccessVehicleArchitecture,
    canAccessAero: AccessManager.canAccessAero,
    canAccessInterior: AccessManager.canAccessInterior,
    canAccessMaterial: AccessManager.canAccessMaterial,
    canAccessResearch: AccessManager.canAccessResearch,
    canAccessMotorsport: AccessManager.canAccessMotorsport,
  };
}
