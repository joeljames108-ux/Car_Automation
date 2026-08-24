// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — REGULATORY, CHOSEN CONSTRUCTOR & SEASON TYPES
// ============================================================================

import type { F1CarDesign } from "./f1Types";
import type { F1SessionType, F1TireCompound, F1WeatherType, F1FlagStatus } from "./f1Enums";

// ---------- 1. FIA Technical Regulations Verification ----------
export interface F1ScrutineeringCheckItem {
  articleCode: string;                 // e.g. "Art 3.5.1", "Art 5.1.2"
  title: string;
  category: "CHASSIS" | "POWER_UNIT" | "AERO" | "SAFETY" | "WEIGHT" | "FINANCIAL";
  currentValue: number | string;
  regulatoryRequirement: string;
  status: "PASS" | "FAIL" | "WARNING";
  deltaToLimit: string;
  remediationAdvice: string;
}

export interface F1ScrutineeringReport {
  passedHomologation: boolean;
  overallScore: number;                // 0 - 100
  totalChecks: number;
  passedCount: number;
  failedCount: number;
  warningCount: number;
  items: F1ScrutineeringCheckItem[];
  generatedTimestamp: number;
}

// ---------- 2. Constructor Team & Facility Management ----------
export type F1FacilityLevel = 1 | 2 | 3 | 4 | 5;

export interface F1ConstructorFacilities {
  windTunnelScale: "SCALE_50_LEGACY" | "SCALE_60_REGULATORY";
  windTunnelFacilityLevel: F1FacilityLevel;
  cfdSupercomputerLevel: F1FacilityLevel;
  autoclaveCleanroomLevel: F1FacilityLevel;
  dynoTestingBenchLevel: F1FacilityLevel;
  driverInLoopSimLevel: F1FacilityLevel;
  pitCrewGymTrainingLevel: F1FacilityLevel;
}

export interface F1ConstructorDepartmentBudget {
  chassisResearchUsd: number;
  powerUnitResearchUsd: number;
  aerodynamicsCfdUsd: number;
  vehicleDynamicsSuspensionUsd: number;
  manufacturingAndMaterialsUsd: number;
  raceOperationsAndLogisticsUsd: number;
  totalSpentUsd: number;
  budgetCapMaxUsd: number;             // $140,000,000 baseline
}

export interface F1ConstructorTeamState {
  teamId: string;
  teamName: string;
  teamPrincipalName: string;
  nationality: string;
  headquartersCity: string;
  carDesign: F1CarDesign;
  facilities: F1ConstructorFacilities;
  budget: F1ConstructorDepartmentBudget;
  developmentPoints: number;           // R&D tokens earned through practice sessions
  allocatedIcesCount: number;          // Max 3 per season without grid penalty
  allocatedTurbosCount: number;        // Max 3
  allocatedMguKCount: number;          // Max 3
  allocatedMguHCount: number;          // Max 3
  allocatedEnergyStoresCount: number;  // Max 2
  allocatedControlElectronicsCount: number;// Max 2
}

// ---------- 3. Circuit & GPS Telemetry Model ----------
export interface F1CircuitProfile {
  id: string;
  name: string;
  officialTitle: string;
  country: string;
  city: string;
  flagEmoji: string;
  lapLengthMeters: number;
  turnsCount: number;
  raceLapsCount: number;
  totalRaceDistanceKm: number;
  drsZoneCount: number;
  baseLapRecordSec: number;
  trackGripIndex: number;              // 0.85 (dusty street) - 1.25 (high bite Silverstone)
  tireStressLevel: 1 | 2 | 3 | 4 | 5;  // 5 = extreme abrasive
  brakeSeverityLevel: 1 | 2 | 3 | 4 | 5;
  downforceRequirement: "LOW" | "MEDIUM" | "HIGH" | "MAXIMUM";
  altitudeMeters: number;
  averageAmbientTempC: number;
  rainProbabilityPercent: number;
  safetyCarProbabilityPercent: number;
}

// ---------- 4. Rival AI Team Profiles ----------
export interface F1RivalTeamSpec {
  teamId: string;
  teamName: string;
  colorHex: string;
  engineSupplier: "FERRARI" | "MERCEDES" | "HONDA_RBPT" | "RENAULT" | "AUDI";
  powerUnitRating: number;             // 1 - 100
  aerodynamicsRating: number;          // 1 - 100
  chassisMechanicalRating: number;     // 1 - 100
  reliabilityRating: number;           // 1 - 100
  driver1Name: string;
  driver1Rating: number;
  driver2Name: string;
  driver2Rating: number;
  estimatedLapTimeOffsetSec: number;   // Delta to theoretical pole
}
