import { defaultDesign } from "./constants";
import type { VehicleDesign, PlatformType, BodyType } from "./types";
export type PresetCategory = "price" | "utility";

export interface VehiclePresetItem {
  id: string;
  name: string;
  category: PresetCategory;
  groupLabel: string;
  targetMSRP: string;
  expectedPower: string;
  description: string;
  generator: () => VehicleDesign;
}

export function createBaseDesign(name: string, platform: PlatformType, bodyType: BodyType): VehicleDesign {
  const d = defaultDesign();
  d.name = name;
  d.vehicle.platform = platform;
  d.vehicle.exterior.bodyType = bodyType;
  d.vehicle.driveType = "fwd";
  d.vehicle.enginePosition = "front";
  return d;
}

export function createV12Hybrid1000HpDesign(): VehicleDesign {
  const v = createBaseDesign("Apex Valkyrie V12 Hybrid 1000", "hypercar", "hypercar");
  v.engine.layout = "v12";
  v.engine.bore = 92;
  v.engine.stroke = 80; // ~6.4L V12
  v.engine.redline = 9200;
  v.engine.rpmLimiter = 9200;
  v.engine.valvetrain = "dohc_vvl";
  v.engine.crank = "forged_steel";
  v.engine.pistons = "forged";
  v.engine.intake = "na";
  v.engine.fuelSystem = "direct";
  v.engine.hybridArchitecture = "phev";
  v.engine.hybridMotorPower = 180; // 180 kW = 241 HP electric assist
  v.engine.batteryCapacity = 16;
  v.engine.batteryChemistry = "solid_state";
  v.engine.motorPlacement = "p2";
  v.engine.regenLevel = 0.8;

  // 21 Comprehensive Hybrid & EV Subsystems
  v.engine.powerElectronicsType = "silicon_carbide_sic";
  v.engine.voltageArchitecture = 800;
  v.engine.hybridTransmission = "dct_hybrid";
  v.engine.regenBrakingTech = "brake_by_wire";
  v.engine.thermalManagement = "liquid_chiller";
  v.engine.chargingTech = "nacs";
  v.engine.engineStrategy = "auto_start_stop";
  v.engine.sensorSuite = "ai_telemetry_pro";
  v.engine.emissionsTech = "three_way_cat";
  v.engine.safetySystems = "pyro_fuse_orange_lines";
  v.engine.futureTech = "solid_state_structural";
  v.engine.sportsHybridTech = "electric_torque_fill";

  v.vehicle.driveType = "awd";
  v.vehicle.enginePosition = "mid";
  v.vehicle.transmissionType = "dct_7";
  v.vehicle.brakeType = "carbon_ceramic";
  v.vehicle.tireCompound = "semislick";
  v.vehicle.aero.wingAngle = 14;
  v.vehicle.aero.underbody = "ground_effect";
  return v;
}

export const VEHICLE_PRESET_LIBRARY: VehiclePresetItem[] = [
  // ================= PRICE TIERS =================
  {
    id: "price_budget",
    name: "Budget / Economy Hatch",
    category: "price",
    groupLabel: "By Price Tiers",
    targetMSRP: "$12,000 – $18,000",
    expectedPower: "65 – 85 HP",
    description: "1.0L 3-Cyl / 1.2L 4-Cyl SOHC, Drum Brakes, Manual Steering, Stamped Steel Wheels",
    generator: () => {
      const v = createBaseDesign("Budget / Economy Hatch", "budget_economy", "city_car");
      v.engine.layout = "i3";
      return v;
    }
  },
  {
    id: "price_lower_mid",
    name: "Lower Mid-Range Sedan",
    category: "price",
    groupLabel: "By Price Tiers",
    targetMSRP: "$18,000 – $26,000",
    expectedPower: "110 – 135 HP",
    description: "1.6L DOHC Port Injection, Steel Unibody, 250mm Discs, 15\" Alloys",
    generator: () => {
      const v = createBaseDesign("Lower Mid-Range Sedan", "lower_mid", "sedan");
      v.engine.layout = "i4";
      return v;
    }
  },
  {
    id: "price_upper_mid",
    name: "Upper Mid-Range Family SUV",
    category: "price",
    groupLabel: "By Price Tiers",
    targetMSRP: "$26,000 – $40,000",
    expectedPower: "175 – 210 HP",
    description: "2.0L Turbo / 2.5L NA Direct Injection, AWD, Multilink, 18\" Alloys",
    generator: () => {
      const v = createBaseDesign("Upper Mid-Range Family SUV", "upper_mid", "crossover");
      v.engine.layout = "i4";
      return v;
    }
  },
  {
    id: "price_premium",
    name: "Premium Executive Sport",
    category: "price",
    groupLabel: "By Price Tiers",
    targetMSRP: "$40,000 – $65,000",
    expectedPower: "320 – 380 HP",
    description: "3.0L Inline-6 Twin-Turbo, Al Spaceframe, Adaptive Dampers, Leather",
    generator: () => {
      const v = createBaseDesign("Premium Executive Sport", "premium", "sedan");
      v.engine.layout = "i6";
      return v;
    }
  },
  {
    id: "price_luxury",
    name: "Luxury Flagship V8",
    category: "price",
    groupLabel: "By Price Tiers",
    targetMSRP: "$65,000 – $120,000",
    expectedPower: "500 – 580 HP",
    description: "4.4L Twin-Turbo V8, Air Suspension, Executive Massage Leather, OLED",
    generator: () => {
      const v = createBaseDesign("Luxury Flagship V8", "luxury", "sedan");
      v.engine.layout = "v8";
      return v;
    }
  },
  {
    id: "price_ultra_luxury",
    name: "Ultra Luxury Coachbuilt",
    category: "price",
    groupLabel: "By Price Tiers",
    targetMSRP: "$120,000 – $250,000",
    expectedPower: "600 – 680 HP",
    description: "6.0L Quad-Cam V12, Active Noise Cancelling, Zero-Gravity Reclining Seats",
    generator: () => {
      const v = createBaseDesign("Ultra Luxury Coachbuilt", "ultra_luxury", "limousine");
      v.engine.layout = "v12";
      return v;
    }
  },
  {
    id: "price_exotic",
    name: "Exotic GT / Sports",
    category: "price",
    groupLabel: "By Price Tiers",
    targetMSRP: "$150,000 – $350,000",
    expectedPower: "550 - 650 HP",
    description: "Mid-engine V8/V10 Sports / GT",
    generator: () => {
      const v = createBaseDesign("Exotic GT / Sports", "exotic", "sports_car");
      v.engine.layout = "v10";
      return v;
    }
  },
  {
    id: "price_supercar",
    name: "Mid-Engine Supercar",
    category: "price",
    groupLabel: "By Price Tiers",
    targetMSRP: "$250,000 – $600,000",
    expectedPower: "720 – 800 HP",
    description: "4.0L Twin-Turbo Flat-Plane V8, Carbon Tub, Carbon Ceramic Brakes",
    generator: () => {
      const v = createBaseDesign("Mid-Engine Supercar", "supercar", "supercar");
      v.engine.layout = "v8";
      return v;
    }
  },
  {
    id: "price_hypercar",
    name: "Megawatt Quad-Motor Hypercar",
    category: "price",
    groupLabel: "By Price Tiers",
    targetMSRP: "$600,000 – $3,000,000+",
    expectedPower: "1,400 – 1,900 HP",
    description: "Quad-Motor Electric / Quad-Turbo Hybrid W16, Full Carbon Monocoque",
    generator: () => {
      const v = createBaseDesign("Megawatt Quad-Motor Hypercar", "hypercar", "hypercar");
      v.engine.layout = "electric";
      v.engine.evMotorPower = 300;
      return v;
    }
  },
  {
    id: "v12_hybrid_1000hp",
    name: "Apex 1000 HP V12 Hybrid Hypercar",
    category: "price",
    groupLabel: "By Price Tiers",
    targetMSRP: "$1,800,000 – $2,500,000",
    expectedPower: "1,000 HP",
    description: "6.4L Naturally Aspirated 9,200 RPM V12 + 180kW Solid-State Hybrid Electric Drive (1,000 HP Total Output)",
    generator: () => createV12Hybrid1000HpDesign(),
  },

  // ================= UTILITY CLASSES =================
  {
    id: "util_city",
    name: "City Car",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$12k",
    expectedPower: "70 HP",
    description: "Compact city car",
    generator: () => {
      const v = createBaseDesign("City Car", "budget_economy", "city_car");
      v.engine.layout = "i3";
      return v;
    }
  },
  {
    id: "util_hatch",
    name: "Hatchback",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$20k",
    expectedPower: "120 HP",
    description: "Standard hatchback",
    generator: () => {
      const v = createBaseDesign("Hatchback", "lower_mid", "hatchback");
      v.engine.layout = "i4";
      return v;
    }
  },
  {
    id: "util_sedan",
    name: "Sedan",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$25k",
    expectedPower: "150 HP",
    description: "Family sedan",
    generator: () => {
      const v = createBaseDesign("Sedan", "lower_mid", "sedan");
      v.engine.layout = "i4";
      return v;
    }
  },
  {
    id: "util_wagon",
    name: "Wagon (Estate)",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$28k",
    expectedPower: "180 HP",
    description: "Estate car",
    generator: () => {
      const v = createBaseDesign("Wagon (Estate)", "upper_mid", "wagon");
      v.engine.layout = "i4";
      return v;
    }
  },
  {
    id: "util_coupe",
    name: "Coupe",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$35k",
    expectedPower: "220 HP",
    description: "Sporty coupe",
    generator: () => {
      const v = createBaseDesign("Coupe", "street_sport", "coupe");
      v.engine.layout = "v6";
      return v;
    }
  },
  {
    id: "util_convertible",
    name: "Convertible",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$40k",
    expectedPower: "250 HP",
    description: "Open top",
    generator: () => {
      const v = createBaseDesign("Convertible", "street_sport", "convertible");
      v.engine.layout = "v6";
      return v;
    }
  },
  {
    id: "util_suv",
    name: "SUV",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$45k",
    expectedPower: "300 HP",
    description: "Full size SUV",
    generator: () => {
      const v = createBaseDesign("SUV", "upper_mid", "suv");
      v.engine.layout = "v8";
      v.vehicle.driveType = "awd";
      return v;
    }
  },
  {
    id: "util_crossover",
    name: "Crossover (CUV)",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$30k",
    expectedPower: "190 HP",
    description: "Crossover utility",
    generator: () => {
      const v = createBaseDesign("Crossover (CUV)", "upper_mid", "crossover");
      v.engine.layout = "i4";
      return v;
    }
  },
  {
    id: "util_pickup",
    name: "Pickup Truck",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$40k",
    expectedPower: "350 HP",
    description: "Work truck",
    generator: () => {
      const v = createBaseDesign("Pickup Truck", "commercial_fleet", "pickup");
      v.engine.layout = "v8";
      v.vehicle.driveType = "awd";
      return v;
    }
  },
  {
    id: "util_mpv",
    name: "MPV",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$28k",
    expectedPower: "160 HP",
    description: "Multi-purpose",
    generator: () => {
      const v = createBaseDesign("MPV", "upper_mid", "mpv");
      v.engine.layout = "i4";
      return v;
    }
  },
  {
    id: "util_minivan",
    name: "Minivan",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$35k",
    expectedPower: "280 HP",
    description: "Family van",
    generator: () => {
      const v = createBaseDesign("Minivan", "upper_mid", "minivan");
      v.engine.layout = "v6";
      return v;
    }
  },
  {
    id: "util_van",
    name: "Van",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$32k",
    expectedPower: "200 HP",
    description: "Commercial van",
    generator: () => {
      const v = createBaseDesign("Van", "commercial_fleet", "van");
      v.engine.layout = "v6";
      return v;
    }
  },
  {
    id: "util_offroad",
    name: "Off-road 4x4",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$45k",
    expectedPower: "280 HP",
    description: "Off-road specialist",
    generator: () => {
      const v = createBaseDesign("Off-road 4x4", "upper_mid", "offroad_4x4");
      v.engine.layout = "v6";
      v.vehicle.driveType = "awd";
      return v;
    }
  },
  {
    id: "util_limo",
    name: "Limousine",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$150k",
    expectedPower: "450 HP",
    description: "Stretched luxury",
    generator: () => {
      const v = createBaseDesign("Limousine", "ultra_luxury", "limousine");
      v.engine.layout = "v8";
      return v;
    }
  },
  {
    id: "util_sports",
    name: "Sports Car",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$60k",
    expectedPower: "400 HP",
    description: "Sports car",
    generator: () => {
      const v = createBaseDesign("Sports Car", "street_sport", "sports_car");
      v.engine.layout = "v6";
      return v;
    }
  },
  {
    id: "util_gt",
    name: "Grand Tourer (GT)",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$120k",
    expectedPower: "550 HP",
    description: "Grand tourer",
    generator: () => {
      const v = createBaseDesign("Grand Tourer (GT)", "gt", "gt_coupe");
      v.engine.layout = "v8";
      return v;
    }
  },
  {
    id: "util_muscle",
    name: "Muscle Car",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$45k",
    expectedPower: "480 HP",
    description: "American Muscle",
    generator: () => {
      const v = createBaseDesign("Muscle Car", "street_sport", "muscle_car");
      v.engine.layout = "v8";
      return v;
    }
  },
  {
    id: "util_pony",
    name: "Pony Car",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$35k",
    expectedPower: "320 HP",
    description: "Compact muscle",
    generator: () => {
      const v = createBaseDesign("Pony Car", "street_sport", "pony_car");
      v.engine.layout = "v6";
      return v;
    }
  },
  {
    id: "util_super",
    name: "Supercar",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$300k",
    expectedPower: "750 HP",
    description: "Exotic supercar",
    generator: () => {
      const v = createBaseDesign("Supercar", "supercar", "supercar");
      v.engine.layout = "v10";
      return v;
    }
  },
  {
    id: "util_hyper",
    name: "Hypercar",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$1.5M",
    expectedPower: "1000 HP",
    description: "Ultimate hypercar",
    generator: () => {
      const v = createBaseDesign("Hypercar", "hypercar", "hypercar");
      v.engine.layout = "v12";
      return v;
    }
  },
  {
    id: "util_commercial",
    name: "Commercial Vehicle",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$45k",
    expectedPower: "300 HP",
    description: "Heavy commercial",
    generator: () => {
      const v = createBaseDesign("Commercial Vehicle", "commercial_fleet", "commercial");
      v.engine.layout = "v8";
      v.vehicle.driveType = "awd";
      return v;
    }
  },
  {
    id: "util_taxi",
    name: "Taxi",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$25k",
    expectedPower: "150 HP",
    description: "Fleet taxi",
    generator: () => {
      const v = createBaseDesign("Taxi", "commercial_fleet", "taxi");
      v.engine.layout = "i4";
      v.vehicle.driveType = "awd";
      return v;
    }
  },
  {
    id: "util_police",
    name: "Police Vehicle",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$48k",
    expectedPower: "400 HP",
    description: "Interceptor",
    generator: () => {
      const v = createBaseDesign("Police Vehicle", "commercial_fleet", "police");
      v.engine.layout = "v6";
      v.vehicle.driveType = "awd";
      return v;
    }
  },
  {
    id: "util_ambulance",
    name: "Ambulance",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$80k",
    expectedPower: "350 HP",
    description: "Emergency medical",
    generator: () => {
      const v = createBaseDesign("Ambulance", "commercial_fleet", "ambulance");
      v.engine.layout = "v8";
      v.vehicle.driveType = "awd";
      return v;
    }
  },
  {
    id: "util_fire",
    name: "Fire Vehicle",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$120k",
    expectedPower: "450 HP",
    description: "Fire emergency",
    generator: () => {
      const v = createBaseDesign("Fire Vehicle", "commercial_fleet", "fire_vehicle");
      v.engine.layout = "v8";
      v.vehicle.driveType = "awd";
      return v;
    }
  },
  {
    id: "util_rally",
    name: "Rally Car",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$200k",
    expectedPower: "380 HP",
    description: "WRC Spec",
    generator: () => {
      const v = createBaseDesign("Rally Car", "rally", "rally_car");
      v.engine.layout = "i4";
      v.vehicle.driveType = "awd";
      return v;
    }
  },
  {
    id: "util_formula",
    name: "Formula Car",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$500k",
    expectedPower: "600 HP",
    description: "Open wheel",
    generator: () => {
      const v = createBaseDesign("Formula Car", "motorsport", "formula_car");
      v.engine.layout = "v6";
      return v;
    }
  },
  {
    id: "util_touring",
    name: "Touring Car",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$150k",
    expectedPower: "350 HP",
    description: "Touring race spec",
    generator: () => {
      const v = createBaseDesign("Touring Car", "motorsport", "touring_car");
      v.engine.layout = "i4";
      return v;
    }
  },
  {
    id: "util_gt_race",
    name: "GT Race Car",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$350k",
    expectedPower: "550 HP",
    description: "GT3 Spec",
    generator: () => {
      const v = createBaseDesign("GT Race Car", "gt", "gt_race_car");
      v.engine.layout = "v8";
      return v;
    }
  },
  {
    id: "util_drift",
    name: "Drift Car",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$80k",
    expectedPower: "600 HP",
    description: "Drift spec",
    generator: () => {
      const v = createBaseDesign("Drift Car", "motorsport", "drift_car");
      v.engine.layout = "i6";
      return v;
    }
  },
  {
    id: "util_track",
    name: "Track Car",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$100k",
    expectedPower: "400 HP",
    description: "Track day special",
    generator: () => {
      const v = createBaseDesign("Track Car", "motorsport", "track_car");
      v.engine.layout = "i4";
      return v;
    }
  },
  {
    id: "util_ev2",
    name: "Electric Vehicle (EV)",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$50k",
    expectedPower: "400 HP",
    description: "Pure electric",
    generator: () => {
      const v = createBaseDesign("Electric Vehicle (EV)", "premium", "sedan");
      v.engine.layout = "electric";
      v.engine.evMotorPower = 300;
      return v;
    }
  },
  {
    id: "util_hev",
    name: "Hybrid (HEV)",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$30k",
    expectedPower: "220 HP",
    description: "Hybrid electric",
    generator: () => {
      const v = createBaseDesign("Hybrid (HEV)", "upper_mid", "sedan");
      v.engine.layout = "hybrid";
      v.engine.hybridArchitecture = "phev";
      v.engine.batteryCapacity = 15;
      return v;
    }
  },
  {
    id: "util_phev",
    name: "Plug-in Hybrid (PHEV)",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$40k",
    expectedPower: "300 HP",
    description: "Plug-in hybrid",
    generator: () => {
      const v = createBaseDesign("Plug-in Hybrid (PHEV)", "premium", "suv");
      v.engine.layout = "hybrid";
      v.engine.hybridArchitecture = "phev";
      v.engine.batteryCapacity = 15;
      v.vehicle.driveType = "awd";
      return v;
    }
  },
  {
    id: "util_fcev",
    name: "Hydrogen Fuel Cell (FCEV)",
    category: "utility",
    groupLabel: "By Utility Class",
    targetMSRP: "$60k",
    expectedPower: "200 HP",
    description: "Hydrogen fuel cell",
    generator: () => {
      const v = createBaseDesign("Hydrogen Fuel Cell (FCEV)", "premium", "sedan");
      v.engine.layout = "electric";
      v.engine.evMotorPower = 300;
      return v;
    }
  }
];
