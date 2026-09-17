import fs from 'fs';
import path from 'path';

// Master mapping from (architecture, era) to generated GLB source file
const DEPLOYMENT_MAP = [
  // --- 1. SEDAN (7/7) ---
  { arch: 'sedan', era: '1970s', ref: 'Mercedes-Benz W116', src: 'exports/Car_Mercedes_Benz_W116_1970s.glb', rootName: 'Car_Mercedes_Benz_W116_1970s.glb' },
  { arch: 'sedan', era: '1980s', ref: 'Mercedes-Benz 190E', src: 'exports/Car_Mercedes_Benz_190E_1980s.glb', rootName: 'Car_Mercedes_Benz_190E_1980s.glb' },
  { arch: 'sedan', era: '1990s', ref: 'BMW 5-Series E39', src: 'exports/Car_BMW_5Series_E39_1990s.glb', rootName: 'Car_BMW_5Series_E39_1990s.glb' },
  { arch: 'sedan', era: '2000s', ref: 'Audi RS6 (C6)', src: 'exports/Car_Audi_RS6_C6_2000s.glb', rootName: 'Car_Audi_RS6_C6_2000s.glb' },
  { arch: 'sedan', era: '2010s', ref: 'Alfa Romeo Giulia Quadrifoglio', src: 'exports/Car_Alfa_Romeo_Giulia_Quadrifoglio_2010s.glb', rootName: 'Car_Alfa_Romeo_Giulia_Quadrifoglio_2010s.glb' },
  { arch: 'sedan', era: '2020s', ref: 'Honda Civic Sedan', src: 'exports/Car_Honda_Civic_Sedan_2020s.glb', rootName: 'Car_Honda_Civic_Sedan_2020s.glb' },
  { arch: 'sedan', era: 'future', ref: 'Audi Grandsphere Concept', src: 'exports/Car_Audi_Grandsphere_Concept_Future.glb', rootName: 'Car_Audi_Grandsphere_Concept_Future.glb' },

  // --- 2. HATCHBACK (7/7) ---
  { arch: 'hatchback', era: '1970s', ref: 'Volkswagen Golf GTI Mk1', src: 'exports/Car_Volkswagen_Golf_GTI_Mk1_1970s.glb', rootName: 'Car_Volkswagen_Golf_GTI_Mk1_1970s.glb' },
  { arch: 'hatchback', era: '1980s', ref: 'Peugeot 205 GTi', src: 'exports/Car_Peugeot_205_GTi_1980s.glb', rootName: 'Car_Peugeot_205_GTi_1980s.glb' },
  { arch: 'hatchback', era: '1990s', ref: 'Honda Civic Type R (EK9)', src: 'exports/Car_Honda_Civic_Type_R_EK9_1990s.glb', rootName: 'Car_Honda_Civic_Type_R_EK9_1990s.glb' },
  { arch: 'hatchback', era: '2000s', ref: 'Renault Clio V6 Phase 2', src: 'exports/Car_Renault_Clio_V6_Phase2_2000s.glb', rootName: 'Car_Renault_Clio_V6_Phase2_2000s.glb' },
  { arch: 'hatchback', era: '2010s', ref: 'Ford Focus RS Mk3', src: 'exports/Car_Ford_Focus_RS_Mk3_2010s.glb', rootName: 'Car_Ford_Focus_RS_Mk3_2010s.glb' },
  { arch: 'hatchback', era: '2020s', ref: 'Toyota GR Yaris', src: 'exports/Car_Toyota_GR_Yaris_2020s.glb', rootName: 'Car_Toyota_GR_Yaris_2020s.glb' },
  { arch: 'hatchback', era: 'future', ref: 'Hyundai N Vision 74', src: 'exports/Car_Hyundai_N_Vision_74_future.glb', rootName: 'Car_Hyundai_N_Vision_74_Future.glb' },

  // --- 3. COUPE (7/7) ---
  { arch: 'coupe', era: '1970s', ref: 'Datsun 240Z', src: 'exports/Car_Datsun_240Z_1970s.glb', rootName: 'Car_Datsun_240Z_1970s.glb' },
  { arch: 'coupe', era: '1980s', ref: 'Audi Quattro', src: 'exports/Car_Audi_Quattro_1980s.glb', rootName: 'Car_Audi_Quattro_1980s.glb' },
  { arch: 'coupe', era: '1990s', ref: 'Toyota Supra A80', src: 'exports/Car_Toyota_Supra_A80_1990s.glb', rootName: 'Car_Toyota_Supra_A80_1990s.glb' },
  { arch: 'coupe', era: '2000s', ref: 'Nissan Skyline GT-R (R34)', src: 'exports/Car_Nissan_Skyline_GT_R_R34_2000s.glb', rootName: 'Car_Nissan_Skyline_GT_R_R34_2000s.glb' },
  { arch: 'coupe', era: '2010s', ref: 'BMW M4 GTS (F82)', src: 'exports/Car_BMW_M4_GTS_F82_2010s.glb', rootName: 'Car_BMW_M4_GTS_F82_2010s.glb' },
  { arch: 'coupe', era: '2020s', ref: 'Maserati MC20', src: 'exports/Car_Maserati_MC20_2020s.glb', rootName: 'Car_Maserati_MC20_2020s.glb' },
  { arch: 'coupe', era: 'future', ref: 'Polestar Synergy Concept', src: 'exports/Car_Polestar_Synergy_Concept_future.glb', rootName: 'Car_Polestar_Synergy_Concept_future.glb' },

  // --- 4. SPORTS CAR (7/7) ---
  { arch: 'sports_car', era: '1970s', ref: 'Porsche 911 Turbo (930)', src: 'exports/Car_Porsche_911_Turbo_930_1970s.glb', rootName: 'Car_Porsche_911_Turbo_930_1970s.glb' },
  { arch: 'sports_car', era: '1980s', ref: 'Mazda RX-7 (FC3S)', src: 'exports/Car_Mazda_RX_7_FC3S_1980s.glb', rootName: 'Car_Mazda_RX_7_FC3S_1980s.glb' },
  { arch: 'sports_car', era: '1990s', ref: 'Honda NSX (NA1)', src: 'exports/Car_Honda_NSX_NA1_1990s.glb', rootName: 'Car_Honda_NSX_NA1_1990s.glb' },
  { arch: 'sports_car', era: '2000s', ref: 'Porsche 911 GT3 (997)', src: 'exports/Car_Porsche_911_GT3_997_2000s.glb', rootName: 'Car_Porsche_911_GT3_997_2000s.glb' },
  { arch: 'sports_car', era: '2010s', ref: 'Chevrolet Corvette Stingray (C7)', src: 'exports/Car_Chevrolet_Corvette_Stingray_C7_2010s.glb', rootName: 'Car_Chevrolet_Corvette_Stingray_C7_2010s.glb' },
  { arch: 'sports_car', era: '2020s', ref: 'Alpine A110 R', src: 'exports/Car_Alpine_A110_R_2020s.glb', rootName: 'Car_Alpine_A110_R_2020s.glb' },
  { arch: 'sports_car', era: 'future', ref: 'Lotus Evija', src: 'exports/Car_Lotus_Evija_future.glb', rootName: 'Car_Lotus_Evija_future.glb' },

  // --- 5. SUPERCAR (7/7) ---
  { arch: 'supercar', era: '1970s', ref: 'Lamborghini Countach LP400', src: 'exports/Car_Lamborghini_Countach_LP400_1970s.glb', rootName: 'Car_Lamborghini_Countach_LP400_1970s.glb' },
  { arch: 'supercar', era: '1980s', ref: 'Ferrari F40', src: 'exports/Car_Ferrari_F40_1980s.glb', rootName: 'Car_Ferrari_F40_1980s.glb' },
  { arch: 'supercar', era: '1990s', ref: 'McLaren F1', src: 'exports/Car_McLaren_F1_1990s.glb', rootName: 'Car_McLaren_F1_1990s.glb' },
  { arch: 'supercar', era: '2000s', ref: 'Ford GT (2005)', src: 'exports/Car_Ford_GT_2005_2000s.glb', rootName: 'Car_Ford_GT_2005_2000s.glb' },
  { arch: 'supercar', era: '2010s', ref: 'Ferrari 458 Italia', src: 'exports/Car_Ferrari_458_Italia_2010s.glb', rootName: 'Car_Ferrari_458_Italia_2010s.glb' },
  { arch: 'supercar', era: '2020s', ref: 'Lamborghini Revuelto', src: 'exports/Car_Lamborghini_Revuelto_2020s.glb', rootName: 'Car_Lamborghini_Revuelto_2020s.glb' },
  { arch: 'supercar', era: 'future', ref: 'McMurtry Spéirling', src: 'exports/Car_McMurtry_Speirling_future.glb', rootName: 'Car_McMurtry_Speirling_future.glb' },

  // --- 6. HYPERCAR (7/7) ---
  { arch: 'hypercar', era: '1970s', ref: 'Porsche 917 Living Legend', src: 'exports/Car_Porsche_917_Living_Legend_1970s.glb', rootName: 'Car_Porsche_917_Living_Legend_1970s.glb' },
  { arch: 'hypercar', era: '1980s', ref: 'Porsche 959', src: 'exports/Car_Porsche_959_1980s.glb', rootName: 'Car_Porsche_959_1980s.glb' },
  { arch: 'hypercar', era: '1990s', ref: 'Mercedes-Benz CLK GTR', src: 'exports/Car_Mercedes_Benz_CLK_GTR_1990s.glb', rootName: 'Car_Mercedes_Benz_CLK_GTR_1990s.glb' },
  { arch: 'hypercar', era: '2000s', ref: 'Bugatti Veyron 16.4', src: 'exports/Car_Bugatti_Veyron_16.4_2000s.glb', rootName: 'Car_Bugatti_Veyron_16.4_2000s.glb' },
  { arch: 'hypercar', era: '2010s', ref: 'Porsche 918 Spyder', src: 'exports/Car_Porsche_918_Spyder_2010s.glb', rootName: 'Car_Porsche_918_Spyder_2010s.glb' },
  { arch: 'hypercar', era: '2020s', ref: 'Bugatti Chiron Pur Sport', src: 'exports/Car_Bugatti_Chiron_Pur_Sport_2020s.glb', rootName: 'Car_Bugatti_Chiron_Pur_Sport_2020s.glb' },
  { arch: 'hypercar', era: 'future', ref: 'Koenigsegg Jesko Attack', src: 'exports/Car_Koenigsegg_Jesko_Attack_future.glb', rootName: 'Car_Koenigsegg_Jesko_Attack_future.glb' },

  // --- 7. GRAND TOURER (7/7) ---
  { arch: 'grand_tourer', era: '1970s', ref: 'Aston Martin V8 Vantage', src: 'exports/Car_Aston_Martin_V8_Vantage_1970s.glb', rootName: 'Car_Aston_Martin_V8_Vantage_1970s.glb' },
  { arch: 'grand_tourer', era: '1980s', ref: 'Porsche 928 S4', src: 'exports/Car_Porsche_928_S4_1980s.glb', rootName: 'Car_Porsche_928_S4_1980s.glb' },
  { arch: 'grand_tourer', era: '1990s', ref: 'Aston Martin DB7', src: 'exports/Car_Aston_Martin_DB7_1990s.glb', rootName: 'Car_Aston_Martin_DB7_1990s.glb' },
  { arch: 'grand_tourer', era: '2000s', ref: 'Aston Martin DBS V12', src: 'exports/Car_Aston_Martin_DBS_V12_2000s.glb', rootName: 'Car_Aston_Martin_DBS_V12_2000s.glb' },
  { arch: 'grand_tourer', era: '2010s', ref: 'Ferrari F12berlinetta', src: 'exports/Car_Ferrari_F12berlinetta_2010s.glb', rootName: 'Car_Ferrari_F12berlinetta_2010s.glb' },
  { arch: 'grand_tourer', era: '2020s', ref: 'Bentley Continental GT Mulliner', src: 'exports/Car_Bentley_Continental_GT_Mulliner_2020s.glb', rootName: 'Car_Bentley_Continental_GT_Mulliner_2020s.glb' },
  { arch: 'grand_tourer', era: 'future', ref: 'Cadillac Celestiq', src: 'exports/Car_Cadillac_Celestiq_future.glb', rootName: 'Car_Cadillac_Celestiq_future.glb' },

  // --- 8. MUSCLE CAR (7/7) ---
  { arch: 'muscle_car', era: '1970s', ref: 'Dodge Challenger R/T (1970)', src: 'exports/Car_Dodge_Challenger_R_T_1970_1970s.glb', rootName: 'Car_Dodge_Challenger_R_T_1970_1970s.glb' },
  { arch: 'muscle_car', era: '1980s', ref: 'Ford Mustang 5.0 LX (Foxbody)', src: 'exports/Car_Ford_Mustang_5.0_LX_Foxbody_1980s.glb', rootName: 'Car_Ford_Mustang_5.0_LX_Foxbody_1980s.glb' },
  { arch: 'muscle_car', era: '1990s', ref: 'Chevrolet Camaro SS (4th Gen)', src: 'exports/Car_Chevrolet_Camaro_SS_4th_Gen_1990s.glb', rootName: 'Car_Chevrolet_Camaro_SS_4th_Gen_1990s.glb' },
  { arch: 'muscle_car', era: '2000s', ref: 'Ford Mustang GT (2005 S197)', src: 'exports/Car_Ford_Mustang_GT_2005_S197_2000s.glb', rootName: 'Car_Ford_Mustang_GT_2005_S197_2000s.glb' },
  { arch: 'muscle_car', era: '2010s', ref: 'Dodge Charger SRT Hellcat', src: 'exports/Car_Dodge_Charger_SRT_Hellcat_2010s.glb', rootName: 'Car_Dodge_Charger_SRT_Hellcat_2010s.glb' },
  { arch: 'muscle_car', era: '2020s', ref: 'Dodge Challenger SRT Demon 170', src: 'exports/Car_Dodge_Challenger_SRT_Demon_170_2020s.glb', rootName: 'Car_Dodge_Challenger_SRT_Demon_170_2020s.glb' },
  { arch: 'muscle_car', era: 'future', ref: 'Dodge Charger Daytona SRT EV', src: 'exports/Car_Dodge_Charger_Daytona_SRT_EV_future.glb', rootName: 'Car_Dodge_Charger_Daytona_SRT_EV_future.glb' },

  // --- 9. CONVERTIBLE (7/7) ---
  { arch: 'convertible', era: '1970s', ref: 'Alfa Romeo Spider Veloce', src: 'exports/Car_Alfa_Romeo_Spider_Veloce_1970s.glb', rootName: 'Car_Alfa_Romeo_Spider_Veloce_1970s.glb' },
  { arch: 'convertible', era: '1980s', ref: 'Mercedes-Benz 560SL (R107)', src: 'exports/Car_Mercedes_Benz_560SL_R107_1980s.glb', rootName: 'Car_Mercedes_Benz_560SL_R107_1980s.glb' },
  { arch: 'convertible', era: '1990s', ref: 'Porsche 911 Carrera Cabriolet (993)', src: 'exports/Car_Porsche_911_Carrera_Cabriolet_993_1990s.glb', rootName: 'Car_Porsche_911_Carrera_Cabriolet_993_1990s.glb' },
  { arch: 'convertible', era: '2000s', ref: 'Honda S2000 (AP1)', src: 'exports/Car_Honda_S2000_AP1_2000s.glb', rootName: 'Car_Honda_S2000_AP1_2000s.glb' },
  { arch: 'convertible', era: '2010s', ref: 'Jaguar F-Type V8 R Convertible', src: 'exports/Car_Jaguar_F_Type_V8_R_Convertible_2010s.glb', rootName: 'Car_Jaguar_F_Type_V8_R_Convertible_2010s.glb' },
  { arch: 'convertible', era: '2020s', ref: 'Bentley Continental GT Speed Convertible', src: 'exports/Car_Bentley_Continental_GT_Speed_Convertible_2020s.glb', rootName: 'Car_Bentley_Continental_GT_Speed_Convertible_2020s.glb' },
  { arch: 'convertible', era: 'future', ref: 'Genesis X Convertible Concept', src: 'exports/Car_Genesis_X_Convertible_Concept_future.glb', rootName: 'Car_Genesis_X_Convertible_Concept_future.glb' },

  // --- 10. ROADSTER (7/7) ---
  { arch: 'roadster', era: '1970s', ref: 'Triumph Spitfire 1500', src: 'exports/Car_Triumph_Spitfire_1500_1970s.glb', rootName: 'Car_Triumph_Spitfire_1500_1970s.glb' },
  { arch: 'roadster', era: '1980s', ref: 'Mazda MX-5 Miata (NA)', src: 'exports/Car_Mazda_MX_5_Miata_NA_1980s.glb', rootName: 'Car_Mazda_MX_5_Miata_NA_1980s.glb' },
  { arch: 'roadster', era: '1990s', ref: 'BMW Z3 M Roadster', src: 'exports/Car_BMW_Z3_M_Roadster_1990s.glb', rootName: 'Car_BMW_Z3_M_Roadster_1990s.glb' },
  { arch: 'roadster', era: '2000s', ref: 'Lotus Elise Series 2', src: 'exports/Car_Lotus_Elise_Series_2_2000s.glb', rootName: 'Car_Lotus_Elise_Series_2_2000s.glb' },
  { arch: 'roadster', era: '2010s', ref: 'Mazda MX-5 Miata (ND)', src: 'exports/Car_Mazda_MX_5_Miata_ND_2010s.glb', rootName: 'Car_Mazda_MX_5_Miata_ND_2010s.glb' },
  { arch: 'roadster', era: '2020s', ref: 'Ferrari 812 GTS', src: 'exports/Car_Ferrari_812_GTS_2020s.glb', rootName: 'Car_Ferrari_812_GTS_2020s.glb' },
  { arch: 'roadster', era: 'future', ref: 'Tesla Roadster 2', src: 'exports/Car_Tesla_Roadster_2_future.glb', rootName: 'Car_Tesla_Roadster_2_future.glb' },

  // --- 11. PICKUP TRUCK ---
  { arch: 'pickup', era: '1980s', ref: 'Toyota Hilux (4th Gen)', src: 'exports/Car_HiLux_SR5_Complete.glb', rootName: 'Car_HiLux_SR5_Complete.glb' },
  { arch: 'pickup', era: '2020s', ref: 'Toyota Hilux SR5 Double-Cab', src: 'exports/Car_HiLux_SR5_Complete.glb', rootName: 'Car_HiLux_SR5_Complete.glb' },

  // --- 12. CROSSOVER ---
  { arch: 'crossover', era: '2010s', ref: 'High-Fidelity Crossover', src: 'exports/Car_Crossover_Complete.glb', rootName: 'Car_Crossover_Complete.glb' },

  // --- 13. SUV ---
  { arch: 'suv', era: '2000s', ref: 'High-Fidelity SUV', src: 'exports/Car_Suv_Complete.glb', rootName: 'Car_Suv_Complete.glb' },

  // --- 14. BUS / COACH ---
  { arch: 'bus', era: '2000s', ref: 'High-Fidelity Coach Bus', src: 'public/models/Car_Bus_Complete.glb', rootName: 'Car_Bus_Complete.glb' },

  // --- 15. FORMULA / RACE ---
  { arch: 'formula', era: '2020s', ref: 'High-Fidelity F1 Single-Seater', src: 'exports/Car_F1_Complete.glb', rootName: 'Car_F1_Complete.glb' },

  // --- 16. GT3 / RACING SPORTS ---
  { arch: 'gt3', era: '2020s', ref: 'High-Fidelity GT3 Supercar', src: 'public/models/Car_GT3_Supercar_Complete.glb', rootName: 'Car_GT3_Supercar_Complete.glb' },
];

console.log(`\n================================================================================`);
console.log(`DEPLOYING ${DEPLOYMENT_MAP.length} HIGH-FIDELITY GLB ASSETS ACROSS ARCHITECTURES & ERAS`);
console.log(`================================================================================\n`);

let deployedCount = 0;
let bytesCopied = 0;

for (const item of DEPLOYMENT_MAP) {
  // Resolve source file: check exports first, then public/models, then root path
  let actualSrc = null;
  if (fs.existsSync(item.src)) {
    actualSrc = item.src;
  } else if (item.rootName && fs.existsSync(path.join('public/models', item.rootName))) {
    actualSrc = path.join('public/models', item.rootName);
  } else if (fs.existsSync(item.rootName)) {
    actualSrc = item.rootName;
  }

  if (!actualSrc) {
    console.warn(`[SKIP: NOT FOUND] ${item.arch}/${item.era} (${item.ref}) -> ${item.src}`);
    continue;
  }

  // 1. Target architecture & era slot
  const targetDir = path.join('public/models/vehicles', item.arch, item.era);
  fs.mkdirSync(targetDir, { recursive: true });
  const targetGlb = path.join(targetDir, 'vehicle.glb');

  // Copy to architecture/era slot
  fs.copyFileSync(actualSrc, targetGlb);
  const size = fs.statSync(targetGlb).size;
  bytesCopied += size;

  // 2. Also ensure standalone named file exists in public/models/
  if (item.rootName) {
    const rootTarget = path.join('public/models', item.rootName);
    if (!fs.existsSync(rootTarget) || fs.statSync(rootTarget).size !== size) {
      fs.copyFileSync(actualSrc, rootTarget);
    }
  }

  deployedCount++;
  console.log(`✅ [DEPLOYED] ${item.arch.toUpperCase()} / ${item.era} (${item.ref})`);
  console.log(`   Source: ${actualSrc} (${(size / 1024).toFixed(1)} KB)`);
  console.log(`   Target: ${targetGlb}`);
}

console.log(`\n================================================================================`);
console.log(`DEPLOYMENT COMPLETE: ${deployedCount}/${DEPLOYMENT_MAP.length} vehicles placed under their respective architectures and eras!`);
console.log(`Total data deployed: ${(bytesCopied / (1024 * 1024)).toFixed(2)} MB`);
console.log(`================================================================================\n`);
