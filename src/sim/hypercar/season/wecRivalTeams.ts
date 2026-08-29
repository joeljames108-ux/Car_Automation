// ============================================================================
// FIA WORLD ENDURANCE CHAMPIONSHIP — RIVAL HYPERCAR CONSTRUCTOR TEAMS
// ============================================================================

export interface WECHypercarTeam {
  id: string;
  name: string;
  carModel: string;
  chassisType: "LMH" | "LMDh";
  engineSpec: string;
  drivers: string[];
  primaryColor: string;
  baseRating: number; // 0-100
}

export const WEC_RIVAL_HYPERCAR_TEAMS: WECHypercarTeam[] = [
  {
    id: "toyota_gazoo",
    name: "Toyota Gazoo Racing",
    carModel: "Toyota GR010 Hybrid",
    chassisType: "LMH",
    engineSpec: "3.5L Twin-Turbo V6 + Front MGU",
    drivers: ["S. Buemi", "B. Hartley", "R. Hirakawa"],
    primaryColor: "#dc2626",
    baseRating: 96,
  },
  {
    id: "ferrari_af_corse",
    name: "Ferrari AF Corse",
    carModel: "Ferrari 499P",
    chassisType: "LMH",
    engineSpec: "3.0L Twin-Turbo V6 + Front MGU",
    drivers: ["A. Pier Guidi", "J. Calado", "A. Giovinazzi"],
    primaryColor: "#ef4444",
    baseRating: 97,
  },
  {
    id: "porsche_penske",
    name: "Porsche Penske Motorsport",
    carModel: "Porsche 963",
    chassisType: "LMDh",
    engineSpec: "4.6L Twin-Turbo V8 + Bosch Hybrid",
    drivers: ["K. Estre", "A. Lotterer", "L. Vanthoor"],
    primaryColor: "#ffffff",
    baseRating: 95,
  },
  {
    id: "cadillac_racing",
    name: "Cadillac Racing",
    carModel: "Cadillac V-Series.R",
    chassisType: "LMDh",
    engineSpec: "5.5L Naturally Aspirated V8 + Hybrid",
    drivers: ["E. Bamber", "A. Lynn", "S. Bourdais"],
    primaryColor: "#d97706",
    baseRating: 93,
  },
  {
    id: "peugeot_totalenergies",
    name: "Peugeot TotalEnergies",
    carModel: "Peugeot 9X8 2024",
    chassisType: "LMH",
    engineSpec: "2.6L Twin-Turbo V6 + Front MGU",
    drivers: ["P. di Resta", "L. Duval", "S. Vandoorne"],
    primaryColor: "#84cc16",
    baseRating: 91,
  },
  {
    id: "alpine_endurance",
    name: "Alpine Endurance Team",
    carModel: "Alpine A424",
    chassisType: "LMDh",
    engineSpec: "3.4L Single-Turbo V6 + Hybrid",
    drivers: ["M. Schumacher", "N. Lapierre", "M. Vaxiviere"],
    primaryColor: "#0284c7",
    baseRating: 90,
  },
  {
    id: "bmw_m_team_wrt",
    name: "BMW M Team WRT",
    carModel: "BMW M Hybrid V8",
    chassisType: "LMDh",
    engineSpec: "4.0L Twin-Turbo V8 + Hybrid",
    drivers: ["R. Rast", "R. Frijns", "S. van der Linde"],
    primaryColor: "#f59e0b",
    baseRating: 92,
  },
  {
    id: "lamborghini_iron_lynx",
    name: "Lamborghini Iron Lynx",
    carModel: "Lamborghini SC63",
    chassisType: "LMDh",
    engineSpec: "3.8L Twin-Turbo V8 + Hybrid",
    drivers: ["D. Kvyat", "M. Bortolotti", "E. Mortara"],
    primaryColor: "#10b981",
    baseRating: 89,
  },
];
