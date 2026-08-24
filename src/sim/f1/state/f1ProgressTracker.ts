// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — PROGRESS & SUBSYSTEM COMPLETION TRACKER
// ============================================================================

import type { F1CarDesign } from "../types/f1Types";
import type { F1WorkshopStepId } from "./f1BuildStateMachine";

export interface F1SubsystemCompletionStatus {
  stepId: F1WorkshopStepId;
  percentage: number;
  isCompliant: boolean;
  warningsCount: number;
  highlightKpi: string;
}

export class F1ProgressTracker {
  public static calculateSubsystemProgress(car: F1CarDesign): Record<F1WorkshopStepId, F1SubsystemCompletionStatus> {
    return {
      overview: {
        stepId: "overview",
        percentage: 100,
        isCompliant: car.computedFiaHomologationScore === 100,
        warningsCount: car.computedFiaHomologationScore < 100 ? 1 : 0,
        highlightKpi: `${car.computedTotalPeakHp} HP | ${car.computedTotalMassKg} kg`,
      },
      monocoque: {
        stepId: "monocoque",
        percentage: 100,
        isCompliant: car.monocoque.cockpitOpeningWidthMm >= 520,
        warningsCount: 0,
        highlightKpi: `${car.monocoque.monocoqueTorsionalRigidityKNmDeg} kNm/deg`,
      },
      powerunit: {
        stepId: "powerunit",
        percentage: 100,
        isCompliant: car.powerUnit.mguKPowerKw <= 120 && car.powerUnit.energyStoreCapacityMj <= 4.0,
        warningsCount: 0,
        highlightKpi: `${car.computedIcePeakHp} ICE + ${car.computedErsPeakHp} ERS HP`,
      },
      aerodynamics: {
        stepId: "aerodynamics",
        percentage: 100,
        isCompliant: car.aero.frontWingSpanMm <= 2000 && car.aero.rearWingDrsFlapGapOpenMm <= 85,
        warningsCount: 0,
        highlightKpi: `${car.aero.totalDownforceAt250KmhKg} kg DF @ 250 km/h`,
      },
      suspension: {
        stepId: "suspension",
        percentage: 100,
        isCompliant: true,
        warningsCount: 0,
        highlightKpi: `${car.suspension.frontRideHeightStaticMm}F / ${car.suspension.rearRideHeightStaticMm}R mm`,
      },
      drivetrain: {
        stepId: "drivetrain",
        percentage: 100,
        isCompliant: true,
        warningsCount: 0,
        highlightKpi: `${car.gearbox.shiftTimeMs}ms Shift Time`,
      },
      brakes: {
        stepId: "brakes",
        percentage: 100,
        isCompliant: true,
        warningsCount: 0,
        highlightKpi: `${car.brakes.brakeBiasDefaultFrontPercent}% Front Bias`,
      },
      cockpit: {
        stepId: "cockpit",
        percentage: 100,
        isCompliant: true,
        warningsCount: 0,
        highlightKpi: `${car.cockpit.telemetryChannelsCount} Channels`,
      },
      livery: {
        stepId: "livery",
        percentage: 100,
        isCompliant: true,
        warningsCount: 0,
        highlightKpi: `#${car.livery.carNumber} ${car.livery.titleSponsorName}`,
      },
      scrutineering: {
        stepId: "scrutineering",
        percentage: car.computedFiaHomologationScore,
        isCompliant: car.computedFiaHomologationScore === 100,
        warningsCount: car.computedFiaHomologationScore < 100 ? 1 : 0,
        highlightKpi: `${car.computedFiaHomologationScore}% FIA Passport`,
      },
      windtunnel: {
        stepId: "windtunnel",
        percentage: 100,
        isCompliant: true,
        warningsCount: 0,
        highlightKpi: `L/D: ${(car.aero.totalDownforceAt250KmhKg / car.aero.totalDragAt250KmhKg).toFixed(2)}`,
      },
      dynobench: {
        stepId: "dynobench",
        percentage: 100,
        isCompliant: true,
        warningsCount: 0,
        highlightKpi: `50.4% Thermal Eff.`,
      },
    };
  }
}
