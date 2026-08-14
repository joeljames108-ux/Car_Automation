const fs = require('fs');
const path = require('path');

const priceTiers = [
  { id: "price_budget", name: "Budget / Economy Hatch", targetMSRP: "$12,000 – $18,000", expectedPower: "65 – 85 HP", desc: "1.0L 3-Cyl / 1.2L 4-Cyl SOHC, Drum Brakes, Manual Steering, Stamped Steel Wheels", plat: "budget_economy", body: "city_car", eng: "i3" },
  { id: "price_lower_mid", name: "Lower Mid-Range Sedan", targetMSRP: "$18,000 – $26,000", expectedPower: "110 – 135 HP", desc: "1.6L DOHC Port Injection, Steel Unibody, 250mm Discs, 15\" Alloys", plat: "lower_mid", body: "sedan", eng: "i4" },
  { id: "price_upper_mid", name: "Upper Mid-Range Family SUV", targetMSRP: "$26,000 – $40,000", expectedPower: "175 – 210 HP", desc: "2.0L Turbo / 2.5L NA Direct Injection, AWD, Multilink, 18\" Alloys", plat: "upper_mid", body: "crossover", eng: "i4" },
  { id: "price_premium", name: "Premium Executive Sport", targetMSRP: "$40,000 – $65,000", expectedPower: "320 – 380 HP", desc: "3.0L Inline-6 Twin-Turbo, Al Spaceframe, Adaptive Dampers, Leather", plat: "premium", body: "sedan", eng: "i6" },
  { id: "price_luxury", name: "Luxury Flagship V8", targetMSRP: "$65,000 – $120,000", expectedPower: "500 – 580 HP", desc: "4.4L Twin-Turbo V8, Air Suspension, Executive Massage Leather, OLED", plat: "luxury", body: "sedan", eng: "v8" },
  { id: "price_ultra_luxury", name: "Ultra Luxury Coachbuilt", targetMSRP: "$120,000 – $250,000", expectedPower: "600 – 680 HP", desc: "6.0L Quad-Cam V12, Active Noise Cancelling, Zero-Gravity Reclining Seats", plat: "ultra_luxury", body: "limousine", eng: "v12" },
  { id: "price_exotic", name: "Exotic GT / Sports", targetMSRP: "$150,000 – $350,000", expectedPower: "550 - 650 HP", desc: "Mid-engine V8/V10 Sports / GT", plat: "exotic", body: "sports_car", eng: "v10" },
  { id: "price_supercar", name: "Mid-Engine Supercar", targetMSRP: "$250,000 – $600,000", expectedPower: "720 – 800 HP", desc: "4.0L Twin-Turbo Flat-Plane V8, Carbon Tub, Carbon Ceramic Brakes", plat: "supercar", body: "supercar", eng: "v8" },
  { id: "price_hypercar", name: "Megawatt Quad-Motor Hypercar", targetMSRP: "$600,000 – $3,000,000+", expectedPower: "1,400 – 1,900 HP", desc: "Quad-Motor Electric / Quad-Turbo Hybrid W16, Full Carbon Monocoque", plat: "hypercar", body: "hypercar", eng: "electric" }
];

const utilClasses = [
  // Body & Consumer
  { id: "util_city", name: "City Car", targetMSRP: "$12k", expectedPower: "70 HP", desc: "Compact city car", plat: "budget_economy", body: "city_car", eng: "i3" },
  { id: "util_hatch", name: "Hatchback", targetMSRP: "$20k", expectedPower: "120 HP", desc: "Standard hatchback", plat: "lower_mid", body: "hatchback", eng: "i4" },
  { id: "util_sedan", name: "Sedan", targetMSRP: "$25k", expectedPower: "150 HP", desc: "Family sedan", plat: "lower_mid", body: "sedan", eng: "i4" },
  { id: "util_wagon", name: "Wagon (Estate)", targetMSRP: "$28k", expectedPower: "180 HP", desc: "Estate car", plat: "upper_mid", body: "wagon", eng: "i4" },
  { id: "util_coupe", name: "Coupe", targetMSRP: "$35k", expectedPower: "220 HP", desc: "Sporty coupe", plat: "street_sport", body: "coupe", eng: "v6" },
  { id: "util_convertible", name: "Convertible", targetMSRP: "$40k", expectedPower: "250 HP", desc: "Open top", plat: "street_sport", body: "convertible", eng: "v6" },
  { id: "util_suv", name: "SUV", targetMSRP: "$45k", expectedPower: "300 HP", desc: "Full size SUV", plat: "upper_mid", body: "suv", eng: "v8" },
  { id: "util_crossover", name: "Crossover (CUV)", targetMSRP: "$30k", expectedPower: "190 HP", desc: "Crossover utility", plat: "upper_mid", body: "crossover", eng: "i4" },
  { id: "util_pickup", name: "Pickup Truck", targetMSRP: "$40k", expectedPower: "350 HP", desc: "Work truck", plat: "commercial_fleet", body: "pickup", eng: "v8" },
  { id: "util_mpv", name: "MPV", targetMSRP: "$28k", expectedPower: "160 HP", desc: "Multi-purpose", plat: "upper_mid", body: "mpv", eng: "i4" },
  { id: "util_minivan", name: "Minivan", targetMSRP: "$35k", expectedPower: "280 HP", desc: "Family van", plat: "upper_mid", body: "minivan", eng: "v6" },
  { id: "util_van", name: "Van", targetMSRP: "$32k", expectedPower: "200 HP", desc: "Commercial van", plat: "commercial_fleet", body: "van", eng: "v6" },
  { id: "util_offroad", name: "Off-road 4x4", targetMSRP: "$45k", expectedPower: "280 HP", desc: "Off-road specialist", plat: "upper_mid", body: "offroad_4x4", eng: "v6" },
  { id: "util_limo", name: "Limousine", targetMSRP: "$150k", expectedPower: "450 HP", desc: "Stretched luxury", plat: "ultra_luxury", body: "limousine", eng: "v8" },
  
  // Performance & Heritage
  { id: "util_sports", name: "Sports Car", targetMSRP: "$60k", expectedPower: "400 HP", desc: "Sports car", plat: "street_sport", body: "sports_car", eng: "v6" },
  { id: "util_gt", name: "Grand Tourer (GT)", targetMSRP: "$120k", expectedPower: "550 HP", desc: "Grand tourer", plat: "gt", body: "gt_coupe", eng: "v8" },
  { id: "util_muscle", name: "Muscle Car", targetMSRP: "$45k", expectedPower: "480 HP", desc: "American Muscle", plat: "street_sport", body: "muscle_car", eng: "v8" },
  { id: "util_pony", name: "Pony Car", targetMSRP: "$35k", expectedPower: "320 HP", desc: "Compact muscle", plat: "street_sport", body: "pony_car", eng: "v6" },
  { id: "util_super", name: "Supercar", targetMSRP: "$300k", expectedPower: "750 HP", desc: "Exotic supercar", plat: "supercar", body: "supercar", eng: "v10" },
  { id: "util_hyper", name: "Hypercar", targetMSRP: "$1.5M", expectedPower: "1000 HP", desc: "Ultimate hypercar", plat: "hypercar", body: "hypercar", eng: "v12" },

  // Commercial & Fleet
  { id: "util_commercial", name: "Commercial Vehicle", targetMSRP: "$45k", expectedPower: "300 HP", desc: "Heavy commercial", plat: "commercial_fleet", body: "commercial", eng: "v8" },
  { id: "util_taxi", name: "Taxi", targetMSRP: "$25k", expectedPower: "150 HP", desc: "Fleet taxi", plat: "commercial_fleet", body: "taxi", eng: "i4" },
  { id: "util_police", name: "Police Vehicle", targetMSRP: "$48k", expectedPower: "400 HP", desc: "Interceptor", plat: "commercial_fleet", body: "police", eng: "v6" },
  { id: "util_ambulance", name: "Ambulance", targetMSRP: "$80k", expectedPower: "350 HP", desc: "Emergency medical", plat: "commercial_fleet", body: "ambulance", eng: "v8" },
  { id: "util_fire", name: "Fire Vehicle", targetMSRP: "$120k", expectedPower: "450 HP", desc: "Fire emergency", plat: "commercial_fleet", body: "fire_vehicle", eng: "v8" },

  // Motorsport
  { id: "util_rally", name: "Rally Car", targetMSRP: "$200k", expectedPower: "380 HP", desc: "WRC Spec", plat: "rally", body: "rally_car", eng: "i4" },
  { id: "util_formula", name: "Formula Car", targetMSRP: "$500k", expectedPower: "600 HP", desc: "Open wheel", plat: "motorsport", body: "formula_car", eng: "v6" },
  { id: "util_touring", name: "Touring Car", targetMSRP: "$150k", expectedPower: "350 HP", desc: "Touring race spec", plat: "motorsport", body: "touring_car", eng: "i4" },
  { id: "util_gt_race", name: "GT Race Car", targetMSRP: "$350k", expectedPower: "550 HP", desc: "GT3 Spec", plat: "gt", body: "gt_race_car", eng: "v8" },
  { id: "util_drift", name: "Drift Car", targetMSRP: "$80k", expectedPower: "600 HP", desc: "Drift spec", plat: "motorsport", body: "drift_car", eng: "i6" },
  { id: "util_track", name: "Track Car", targetMSRP: "$100k", expectedPower: "400 HP", desc: "Track day special", plat: "motorsport", body: "track_car", eng: "i4" },

  // Powertrain Tech
  { id: "util_ev2", name: "Electric Vehicle (EV)", targetMSRP: "$50k", expectedPower: "400 HP", desc: "Pure electric", plat: "premium", body: "sedan", eng: "electric" },
  { id: "util_hev", name: "Hybrid (HEV)", targetMSRP: "$30k", expectedPower: "220 HP", desc: "Hybrid electric", plat: "upper_mid", body: "sedan", eng: "hybrid" },
  { id: "util_phev", name: "Plug-in Hybrid (PHEV)", targetMSRP: "$40k", expectedPower: "300 HP", desc: "Plug-in hybrid", plat: "premium", body: "suv", eng: "hybrid" },
  { id: "util_fcev", name: "Hydrogen Fuel Cell (FCEV)", targetMSRP: "$60k", expectedPower: "200 HP", desc: "Hydrogen fuel cell", plat: "premium", body: "sedan", eng: "electric" }
];

let content = `import { defaultDesign } from "./constants";
import type { VehicleDesign, PlatformType, BodyType, InfoDisplayConfig } from "./types";
import type { ClimateTier } from "./electronicsData";

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
  return d;
}

export const VEHICLE_PRESET_LIBRARY: VehiclePresetItem[] = [
`;

function buildPreset(item, category, groupLabel) {
  let generatorCode = `    generator: () => {
      const v = createBaseDesign("${item.name}", "${item.plat}", "${item.body}");
      v.engine.layout = "${item.eng}";`;
      
  if (item.eng === 'electric') {
    generatorCode += `
      v.engine.evMotorPower = 300;`;
  } else if (item.eng === 'hybrid') {
    generatorCode += `
      v.engine.hybridArchitecture = "phev";
      v.engine.batteryCapacity = 15;`;
  }
  
  if (item.body === 'police' || item.body === 'ambulance' || item.body === 'fire_vehicle' || item.body === 'taxi' || item.body === 'commercial' || item.body === 'suv' || item.body === 'pickup' || item.body === 'offroad_4x4' || item.body === 'rally_car') {
     generatorCode += `
      v.vehicle.driveType = "awd";`;
  }

  generatorCode += `
      return v;
    }`;

  return `  {
    id: "${item.id}",
    name: "${item.name}",
    category: "${category}",
    groupLabel: "${groupLabel}",
    targetMSRP: "${item.targetMSRP}",
    expectedPower: "${item.expectedPower}",
    description: "${item.desc.replace(/"/g, '\\"')}",
${generatorCode}
  }`;
}

content += `  // ================= PRICE TIERS =================\n`;
priceTiers.forEach((item, index) => {
  content += buildPreset(item, 'price', 'By Price Tiers') + ',\n';
});

content += `\n  // ================= UTILITY CLASSES =================\n`;
utilClasses.forEach((item, index) => {
  content += buildPreset(item, 'utility', 'By Utility Class') + (index === utilClasses.length - 1 ? '\n' : ',\n');
});

content += `];\n`;

fs.writeFileSync(path.join(__dirname, 'src', 'sim', 'vehiclePresets.ts'), content);
console.log('Successfully generated vehiclePresets.ts');
