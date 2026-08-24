// ============================================================================
// FIA WORLD ENDURANCE CHAMPIONSHIP (WEC) — CALENDAR & CIRCUIT PROFILES
// ============================================================================

export interface WECCircuitProfile {
  id: string;
  name: string;
  officialTitle: string;
  country: string;
  city: string;
  raceDurationHours: number;
  lapLengthMeters: number;
  altitudeMeters: number;
  downforceRequirement: "LOW" | "MEDIUM" | "HIGH";
  tireStressLevel: 1 | 2 | 3 | 4 | 5;
  brakeThermalStress: 1 | 2 | 3 | 4 | 5;
  bumpinessFatigueIndex: 1 | 2 | 3 | 4 | 5;
  nightRacingHours: number;
  idealLiftToDragRatio: number;
}

export const WEC_CIRCUITS: WECCircuitProfile[] = [
  {
    id: "wec_le_mans",
    name: "24 Hours of Le Mans",
    officialTitle: "92nd 24 Heures du Mans",
    country: "France",
    city: "Le Mans",
    raceDurationHours: 24,
    lapLengthMeters: 13626,
    altitudeMeters: 55,
    downforceRequirement: "LOW",
    tireStressLevel: 3,
    brakeThermalStress: 4,
    bumpinessFatigueIndex: 2,
    nightRacingHours: 9,
    idealLiftToDragRatio: 4.6,
  },
  {
    id: "wec_spa",
    name: "6 Hours of Spa-Francorchamps",
    officialTitle: "TotalEnergies 6 Hours of Spa",
    country: "Belgium",
    city: "Stavelot",
    raceDurationHours: 6,
    lapLengthMeters: 7004,
    altitudeMeters: 410,
    downforceRequirement: "HIGH",
    tireStressLevel: 4,
    brakeThermalStress: 3,
    bumpinessFatigueIndex: 3,
    nightRacingHours: 0,
    idealLiftToDragRatio: 4.3,
  },
  {
    id: "wec_sebring",
    name: "12 Hours of Sebring",
    officialTitle: "Mobil 1 Twelve Hours of Sebring",
    country: "United States",
    city: "Sebring, FL",
    raceDurationHours: 12,
    lapLengthMeters: 6019,
    altitudeMeters: 19,
    downforceRequirement: "MEDIUM",
    tireStressLevel: 5,
    brakeThermalStress: 5,
    bumpinessFatigueIndex: 5,
    nightRacingHours: 4,
    idealLiftToDragRatio: 4.4,
  },
  {
    id: "wec_monza",
    name: "6 Hours of Monza",
    officialTitle: "6 Hours of Monza — Temple of Speed",
    country: "Italy",
    city: "Monza",
    raceDurationHours: 6,
    lapLengthMeters: 5793,
    altitudeMeters: 162,
    downforceRequirement: "LOW",
    tireStressLevel: 3,
    brakeThermalStress: 5,
    bumpinessFatigueIndex: 2,
    nightRacingHours: 0,
    idealLiftToDragRatio: 4.7,
  },
  {
    id: "wec_fuji",
    name: "6 Hours of Fuji",
    officialTitle: "6 Hours of Fuji Speedway",
    country: "Japan",
    city: "Oyama",
    raceDurationHours: 6,
    lapLengthMeters: 4563,
    altitudeMeters: 580,
    downforceRequirement: "MEDIUM",
    tireStressLevel: 4,
    brakeThermalStress: 4,
    bumpinessFatigueIndex: 2,
    nightRacingHours: 0,
    idealLiftToDragRatio: 4.5,
  },
  {
    id: "wec_bahrain",
    name: "8 Hours of Bahrain",
    officialTitle: "Bapco Energies 8 Hours of Bahrain",
    country: "Bahrain",
    city: "Sakhir",
    raceDurationHours: 8,
    lapLengthMeters: 5412,
    altitudeMeters: 15,
    downforceRequirement: "HIGH",
    tireStressLevel: 5,
    brakeThermalStress: 4,
    bumpinessFatigueIndex: 2,
    nightRacingHours: 5,
    idealLiftToDragRatio: 4.2,
  },
];
