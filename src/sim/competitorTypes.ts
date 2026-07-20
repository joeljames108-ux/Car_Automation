export interface Competitor {
  id: string;
  company: string;
  country: string;
  model: string;
  year: number | null;
  image_url: string | null;
  power_hp: number;
  torque_nm: number;
  weight_kg: number;
  top_speed_kmh: number;
  accel_0_100: number;
  accel_0_200: number | null;
  quarter_mile: number | null;
  braking_100_0: number | null;
  lateral_g: number | null;
  drivetrain: string;
  engine_desc: string;
  price_usd: number;
  nurburgring_lap: number | null;
  laguna_seca_lap: number | null;
  top_gear_track_lap: number | null;
  description: string | null;
}

export type SortKey =
  | "power_hp"
  | "torque_nm"
  | "weight_kg"
  | "top_speed_kmh"
  | "accel_0_100"
  | "accel_0_200"
  | "quarter_mile"
  | "braking_100_0"
  | "lateral_g"
  | "price_usd"
  | "nurburgring_lap"
  | "laguna_seca_lap"
  | "top_gear_track_lap";

export interface SortOption {
  key: SortKey;
  label: string;
  unit: string;
  lowerIsBetter: boolean;
  group: "Performance" | "Lap Times" | "Cost";
}
