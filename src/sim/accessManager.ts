/**
 * ============================================================================
 * ACCESS MANAGER (Access Control & Progression Decoupling Layer)
 * ============================================================================
 * Central architecture layer separating game content from player progression
 * and developer overrides.
 *
 * Rule: Systems ALWAYS query AccessManager. Dev mode never alters base rules,
 * it only bypasses them at this query boundary.
 */

import { useDeveloperModeStore } from "../state/developerModeStore";
import type { WorkflowStage, ConfigurationStatus, StageGateResult } from "../state/guidedEngineeringStore";

export interface AccessResult {
  allowed: boolean;
  reason?: string;
  requiredPrerequisite?: string;
  devBypassed?: boolean;
}

export interface AccessContext {
  year?: number;
  completedTechs?: string[];
  reputation?: number;
  cash?: number;
}

export class AccessManager {
  /**
   * Check whether a guided engineering workflow stage can be entered.
   * If dev override `ignoreWorkflowGating` is active, permits free navigation.
   * Otherwise enforces strict, sequential manufacturing dependencies.
   */
  static canAccessStage(
    targetStage: WorkflowStage,
    statuses: {
      engineStatus: ConfigurationStatus;
      transmissionStatus?: ConfigurationStatus;
      vehicleStatus: ConfigurationStatus;
      aeroStatus: ConfigurationStatus;
      interiorStatus: ConfigurationStatus;
      safetyStatus?: ConfigurationStatus;
      simulationStatus?: ConfigurationStatus;
      manufacturingStatus?: ConfigurationStatus;
      finalBuildStatus?: ConfigurationStatus;
    }
  ): StageGateResult {
    const devState = useDeveloperModeStore.getState();
    const isDevGatingBypassed = devState.devMode && devState.overrides.ignoreWorkflowGating;

    if (isDevGatingBypassed) {
      return {
        allowed: true,
        reason: "Developer Mode: Sequential workflow gating bypassed",
        devBypassed: true,
      };
    }

    // === AUTHENTIC PLAYER SEQUENTIAL WORKFLOW GATING ===
    switch (targetStage) {
      case "engine":
        // Stage 1 (Engine) is always accessible from launch
        return { allowed: true };

      case "vehicle": {
        const isEngineSatisfied =
          statuses.engineStatus === "configured" || statuses.engineStatus === "invalidated";
        const isTransmissionSatisfied =
          !statuses.transmissionStatus ||
          statuses.transmissionStatus === "configured" ||
          statuses.transmissionStatus === "invalidated";
        if (!isEngineSatisfied || !isTransmissionSatisfied) {
          return {
            allowed: false,
            reason: !isEngineSatisfied
              ? "Complete ENGINE configuration first."
              : "Complete TRANSMISSION configuration first.",
            requiredStage: "engine",
          };
        }
        return { allowed: true };
      }

      case "aero": {
        // Must satisfy vehicle prerequisites first
        const vehicleGate = this.canAccessStage("vehicle", statuses);
        if (!vehicleGate.allowed) return vehicleGate;

        const isVehicleSatisfied =
          statuses.vehicleStatus === "configured" || statuses.vehicleStatus === "invalidated";
        if (!isVehicleSatisfied) {
          return {
            allowed: false,
            reason: "Complete VEHICLE configuration first.",
            requiredStage: "vehicle",
          };
        }
        return { allowed: true };
      }

      case "interior": {
        // Must satisfy aero prerequisites first
        const aeroGate = this.canAccessStage("aero", statuses);
        if (!aeroGate.allowed) return aeroGate;

        const isAeroSatisfied =
          statuses.aeroStatus === "configured" || statuses.aeroStatus === "invalidated";
        if (!isAeroSatisfied) {
          return {
            allowed: false,
            reason: "Complete AERODYNAMICS configuration first.",
            requiredStage: "aero",
          };
        }
        return { allowed: true };
      }

      case "safety": {
        // Must satisfy interior prerequisites first
        const interiorGate = this.canAccessStage("interior", statuses);
        if (!interiorGate.allowed) return interiorGate;

        const isInteriorSatisfied =
          statuses.interiorStatus === "configured" || statuses.interiorStatus === "invalidated";
        if (!isInteriorSatisfied) {
          return {
            allowed: false,
            reason: "Complete INTERIOR configuration first.",
            requiredStage: "interior",
          };
        }
        return { allowed: true };
      }

      case "simulation": {
        // Must satisfy safety prerequisites first
        const safetyGate = this.canAccessStage("safety", statuses);
        if (!safetyGate.allowed) return safetyGate;

        const isSafetySatisfied =
          !statuses.safetyStatus ||
          statuses.safetyStatus === "configured" ||
          statuses.safetyStatus === "invalidated";
        if (!isSafetySatisfied) {
          return {
            allowed: false,
            reason: "Complete SAFETY CENTER configuration & testing first.",
            requiredStage: "safety",
          };
        }
        return { allowed: true };
      }

      case "manufacturing": {
        // MANDATORY REQUIREMENT: Player can go to Manufacturing only if all remaining 6 tabs are complete
        const missing: { name: string; stage: WorkflowStage }[] = [];
        if (statuses.engineStatus !== "configured" && statuses.engineStatus !== "invalidated") {
          missing.push({ name: "1. Engine", stage: "engine" });
        } else if (statuses.transmissionStatus && statuses.transmissionStatus !== "configured" && statuses.transmissionStatus !== "invalidated") {
          missing.push({ name: "1. Transmission (Drivetrain)", stage: "engine" });
        }
        if (statuses.vehicleStatus !== "configured" && statuses.vehicleStatus !== "invalidated") {
          missing.push({ name: "2. Vehicle Studio", stage: "vehicle" });
        }
        if (statuses.aeroStatus !== "configured" && statuses.aeroStatus !== "invalidated") {
          missing.push({ name: "3. Aero Studio", stage: "aero" });
        }
        if (statuses.interiorStatus !== "configured" && statuses.interiorStatus !== "invalidated") {
          missing.push({ name: "4. Interior", stage: "interior" });
        }
        if (statuses.safetyStatus && statuses.safetyStatus !== "configured" && statuses.safetyStatus !== "invalidated") {
          missing.push({ name: "5. Safety Center", stage: "safety" });
        }
        if (statuses.simulationStatus && statuses.simulationStatus !== "configured" && statuses.simulationStatus !== "invalidated") {
          missing.push({ name: "6. Sim & Testing", stage: "simulation" });
        }

        if (missing.length > 0) {
          return {
            allowed: false,
            reason: `Manufacturing is locked. You must complete all remaining 6 tabs (Engine, Vehicle, Aero, Interior, Safety, and Simulation) before authorizing factory production. Missing: ${missing.map(m => m.name).join(", ")}`,
            requiredStage: missing[0].stage,
          };
        }
        return { allowed: true };
      }

      case "final_build": {
        // Must satisfy interior prerequisites first
        const interiorGate = this.canAccessStage("interior", statuses);
        if (!interiorGate.allowed) return interiorGate;

        const isInteriorSatisfied =
          statuses.interiorStatus === "configured" || statuses.interiorStatus === "invalidated";
        if (!isInteriorSatisfied) {
          return {
            allowed: false,
            reason: "Complete INTERIOR configuration first.",
            requiredStage: "interior",
          };
        }
        return { allowed: true };
      }

      default:
        return { allowed: true };
    }
  }

  /**
   * Check whether an engine architecture / layout is accessible.
   */
  static canAccessEngine(layout: string, context?: AccessContext): AccessResult {
    const devState = useDeveloperModeStore.getState();
    if (devState.devMode && devState.overrides.ignoreEngineLocks) {
      return { allowed: true, devBypassed: true };
    }

    const currentYear = context?.year ?? 1970;
    const completedTechs = context?.completedTechs ?? [];

    switch (layout.toLowerCase()) {
      case "ev":
      case "electric":
        if (currentYear >= 2008 || completedTechs.includes("battery_chemistry_nmc")) {
          return { allowed: true };
        }
        return {
          allowed: false,
          reason: "Requires EV Battery Lab R&D or era >= 2008",
          requiredPrerequisite: "EV Battery Tech",
        };

      case "hybrid":
        if (currentYear >= 1997 || completedTechs.includes("hybrid_powertrain")) {
          return { allowed: true };
        }
        return {
          allowed: false,
          reason: "Requires Hybrid Powertrain R&D or era >= 1997",
          requiredPrerequisite: "Hybrid Electronics",
        };

      case "w16":
      case "v12":
        if (currentYear >= 1970) {
          return { allowed: true };
        }
        return { allowed: false, reason: "Requires multi-cylinder blueprint" };

      case "rotary":
        if (completedTechs.includes("experimental_combustion") || currentYear >= 1970) {
          return { allowed: true };
        }
        return { allowed: false, reason: "Requires Wankel Rotary Licensing" };

      default:
        // i3, i4, i6, v6, v8, boxer4, boxer6 are standard baseline 1970
        return { allowed: true };
    }
  }

  /**
   * Check whether a vehicle architecture / platform is accessible.
   */
  static canAccessVehicle(archId: string, context?: AccessContext): AccessResult {
    const devState = useDeveloperModeStore.getState();
    if (devState.devMode && devState.overrides.ignoreVehicleLocks) {
      return { allowed: true, devBypassed: true };
    }

    const currentYear = context?.year ?? 1970;
    const completedTechs = context?.completedTechs ?? [];

    if (archId.includes("carbon") || archId.includes("hypercar")) {
      if (currentYear >= 1990 || completedTechs.includes("carbon_fiber_monocoque")) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Requires Carbon Fiber Monocoque R&D (or era >= 1990)",
        requiredPrerequisite: "Materials Science Level 3",
      };
    }

    if (archId.includes("suv") || archId.includes("crossover")) {
      if (currentYear >= 1984) {
        return { allowed: true };
      }
      return { allowed: true }; // Allow classic 4x4 / utility
    }

    return { allowed: true };
  }

  /**
   * Check whether an aerodynamic component is accessible.
   */
  static canAccessAero(featureId: string, context?: AccessContext): AccessResult {
    const devState = useDeveloperModeStore.getState();
    if (devState.devMode && devState.overrides.ignoreAeroLocks) {
      return { allowed: true, devBypassed: true };
    }

    const completedTechs = context?.completedTechs ?? [];
    if (featureId.includes("active_drs") || featureId.includes("active_flap")) {
      if (completedTechs.includes("active_aerodynamics")) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Requires Active Aerodynamics R&D and Wind Tunnel Level 3",
        requiredPrerequisite: "Aero Center Level 3",
      };
    }

    return { allowed: true };
  }

  /**
   * Check whether an interior configuration is accessible.
   */
  static canAccessInterior(interiorId: string, context?: AccessContext): AccessResult {
    const devState = useDeveloperModeStore.getState();
    if (devState.devMode && devState.overrides.ignoreInteriorLocks) {
      return { allowed: true, devBypassed: true };
    }

    const currentYear = context?.year ?? 1970;
    if (interiorId.includes("oled") || interiorId.includes("digital_cockpit")) {
      if (currentYear >= 2012) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Curved OLED instrument clusters require Digital Cockpit R&D (or era >= 2012)",
        requiredPrerequisite: "Electronics Lab Level 4",
      };
    }

    return { allowed: true };
  }

  /**
   * Check whether a research node can be started.
   */
  static canAccessResearch(techId: string, _context?: AccessContext): AccessResult {
    const devState = useDeveloperModeStore.getState();
    if (devState.devMode && devState.overrides.ignoreResearchRequirements) {
      return { allowed: true, devBypassed: true };
    }
    return { allowed: true };
  }

  /**
   * Check whether a motorsport event can be entered.
   */
  static canAccessMotorsport(_eventId: string, _context?: AccessContext): AccessResult {
    const devState = useDeveloperModeStore.getState();
    if (devState.devMode && devState.overrides.ignoreMotorsportRequirements) {
      return { allowed: true, devBypassed: true };
    }
    return { allowed: true };
  }
}

export const canAccessStage = AccessManager.canAccessStage;

