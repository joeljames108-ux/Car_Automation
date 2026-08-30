// ============================================================================
// METALLURGY DATABASE — Real-World Alloy Grades & Material Properties
// ============================================================================
// Comprehensive database of engineering alloys used in automotive motorsport
// applications with accurate metallurgical data from ASM International and
// MatWeb material databases.
// ============================================================================

export type HeatTreatment =
  | "as_cast"
  | "annealed"
  | "solution_treated"
  | "T6_tempered"
  | "T7_tempered"
  | "quenched_tempered"
  | "precipitation_hardened"
  | "age_hardened"
  | "nitrided"
  | "case_hardened";

export type ManufacturingProcess =
  | "sand_cast"
  | "die_cast"
  | "investment_cast"
  | "lost_foam_cast"
  | "open_die_forged"
  | "closed_die_forged"
  | "cold_forged"
  | "cnc_machined_from_billet"
  | "powder_metallurgy"
  | "metal_injection_molding"
  | "additive_manufactured"
  | "centrifugal_cast"
  | "continuous_cast"
  | "sheet_metal_formed"
  | "hydroformed";

export type MaterialFamily =
  | "gray_cast_iron"
  | "nodular_cast_iron"
  | "carbon_steel"
  | "low_alloy_steel"
  | "stainless_steel"
  | "maraging_steel"
  | "aluminum_silicon"
  | "aluminum_zinc"
  | "aluminum_copper"
  | "magnesium_alloy"
  | "titanium_alloy"
  | "nickel_superalloy"
  | "copper_alloy"
  | "ceramic_matrix_composite"
  | "carbon_carbon_composite"
  | "metal_matrix_composite";

export interface MetallurgicalProperties {
  // Mechanical Properties
  yieldStrengthMPa: number;
  ultimateTensileStrengthMPa: number;
  fatigueLimitMPa: number;
  youngsModulusGPa: number;
  shearModulusGPa: number;
  elongationPercent: number;
  hardness: { value: number; scale: "HV" | "HRC" | "HB" | "HRB" };

  // Physical Properties
  densityKgM3: number;
  thermalConductivityWMK: number;
  thermalExpansionUmMK: number;
  specificHeatJkgK: number;
  meltingPointC: number;

  // Service Limits
  maxOperatingTempC: number;
  maxBoostBar: number;
  corrosionResistance: "poor" | "fair" | "good" | "excellent" | "superior";
  weldability: "poor" | "fair" | "good" | "excellent";
  machinability: "poor" | "fair" | "good" | "excellent";

  // Cost Data
  rawMaterialCostPerKg: number; // USD/kg
  processingCostMultiplier: number; // relative to standard casting
  toolingLifeMultiplier: number; // relative to standard

  // Microstructure Description
  microstructure: string;
  keyAlloyingElements: string[];
}

export interface MetallurgyGrade {
  id: string;
  name: string;
  family: MaterialFamily;
  designation: string; // Industry standard designation (e.g., "EN-GJL-250", "A356-T6")
  description: string;
  properties: MetallurgicalProperties;
  heatTreatment: HeatTreatment;
  manufacturingProcess: ManufacturingProcess;
  commonApplications: string[];
  advantages: string[];
  disadvantages: string[];
  // Simulation multipliers (relative to baseline gray cast iron)
  hpMultiplier: number;
  weightMultiplier: number;
  costMultiplier: number;
  reliabilityDelta: number;
}

// ─── MATERIAL GRADE DATABASE ──────────────────────────────────────────────

export const METALLURGY_DATABASE: MetallurgyGrade[] = [
  // ═══ GRAY CAST IRON ═══
  {
    id: "cast_iron",
    name: "Gray Cast Iron",
    family: "gray_cast_iron",
    designation: "EN-GJL-250 / ASTM A48 Class 40",
    description: "Traditional engine block material with excellent vibration damping and thermal conductivity.",
    properties: {
      yieldStrengthMPa: 250,
      ultimateTensileStrengthMPa: 290,
      fatigueLimitMPa: 130,
      youngsModulusGPa: 110,
      shearModulusGPa: 42,
      elongationPercent: 0.5,
      hardness: { value: 220, scale: "HB" },
      densityKgM3: 7200,
      thermalConductivityWMK: 48,
      thermalExpansionUmMK: 10.5,
      specificHeatJkgK: 490,
      meltingPointC: 1150,
      maxOperatingTempC: 350,
      maxBoostBar: 1.2,
      corrosionResistance: "fair",
      weldability: "poor",
      machinability: "excellent",
      rawMaterialCostPerKg: 0.85,
      processingCostMultiplier: 1.0,
      toolingLifeMultiplier: 1.0,
      microstructure: "Flake graphite in ferritic-pearlitic matrix",
      keyAlloyingElements: ["C 3.2-3.6%", "Si 1.8-2.4%", "Mn 0.5-0.8%", "P <0.15%", "S <0.12%"],
    },
    heatTreatment: "as_cast",
    manufacturingProcess: "sand_cast",
    commonApplications: ["Engine blocks", "Brake rotors", "Flywheels", "Pump housings"],
    advantages: ["Excellent vibration damping", "Good thermal conductivity", "Low cost", "Easy to cast"],
    disadvantages: ["Very brittle (low elongation)", "Heavy", "Low strength-to-weight", "Cannot be forged"],
    hpMultiplier: 1.0,
    weightMultiplier: 1.0,
    costMultiplier: 1.0,
    reliabilityDelta: 0,
  },

  // ═══ NODULAR (DUCTILE) CAST IRON ═══
  {
    id: "nodular_iron",
    name: "Ductile Cast Iron",
    family: "nodular_cast_iron",
    designation: "EN-GJS-600-3 / ASTM A536 80-55-06",
    description: "Nodular graphite iron with 3x the strength of gray iron. Used in high-performance crankshafts.",
    properties: {
      yieldStrengthMPa: 370,
      ultimateTensileStrengthMPa: 600,
      fatigueLimitMPa: 280,
      youngsModulusGPa: 170,
      shearModulusGPa: 65,
      elongationPercent: 3.0,
      hardness: { value: 250, scale: "HB" },
      densityKgM3: 7100,
      thermalConductivityWMK: 32,
      thermalExpansionUmMK: 11.8,
      specificHeatJkgK: 500,
      meltingPointC: 1170,
      maxOperatingTempC: 400,
      maxBoostBar: 1.8,
      corrosionResistance: "fair",
      weldability: "fair",
      machinability: "excellent",
      rawMaterialCostPerKg: 1.20,
      processingCostMultiplier: 1.2,
      toolingLifeMultiplier: 0.9,
      microstructure: "Nodular (spheroidal) graphite in ferritic-pearlitic matrix",
      keyAlloyingElements: ["C 3.4-3.8%", "Si 2.0-2.8%", "Mn 0.1-0.4%", "Mg 0.03-0.06%", "Ce trace"],
    },
    heatTreatment: "annealed",
    manufacturingProcess: "sand_cast",
    commonApplications: ["Crankshafts", "Differential housings", "Heavy-duty gears", "Suspension components"],
    advantages: ["Good strength with castability", "Excellent fatigue resistance", "Vibration damping retained"],
    disadvantages: ["Heavier than steel forgings", "Lower elongation than steel", "Surface porosity possible"],
    hpMultiplier: 1.15,
    weightMultiplier: 0.98,
    costMultiplier: 1.3,
    reliabilityDelta: 8,
  },

  // ═══ CAST ALUMINUM A356-T6 ═══
  {
    id: "cast_aluminum",
    name: "A356 Aluminum Alloy T6",
    family: "aluminum_silicon",
    designation: "A356.0-T6 / EN AC-44300 T6",
    description: "The industry standard for high-performance aluminum engine blocks. Solution treated and artificially aged for maximum strength.",
    properties: {
      yieldStrengthMPa: 240,
      ultimateTensileStrengthMPa: 310,
      fatigueLimitMPa: 90,
      youngsModulusGPa: 72.4,
      shearModulusGPa: 27.5,
      elongationPercent: 5.0,
      hardness: { value: 85, scale: "HB" },
      densityKgM3: 2685,
      thermalConductivityWMK: 152,
      thermalExpansionUmMK: 22.5,
      specificHeatJkgK: 963,
      meltingPointC: 615,
      maxOperatingTempC: 250,
      maxBoostBar: 2.5,
      corrosionResistance: "good",
      weldability: "good",
      machinability: "excellent",
      rawMaterialCostPerKg: 2.80,
      processingCostMultiplier: 1.4,
      toolingLifeMultiplier: 0.8,
      microstructure: "Primary α-Al dendrites with eutectic Si particles, modified Sr",
      keyAlloyingElements: ["Si 6.5-7.5%", "Mg 0.25-0.45%", "Ti <0.2%", "Sr 150-200ppm"],
    },
    heatTreatment: "T6_tempered",
    manufacturingProcess: "sand_cast",
    commonApplications: ["Engine blocks", "Cylinder heads", "Intake manifolds", "Transmission cases"],
    advantages: ["63% weight reduction vs iron", "Excellent thermal conductivity", "Good machinability"],
    disadvantages: ["Lower strength than iron", "Higher thermal expansion", "Cylinder bore wear (needs liners)"],
    hpMultiplier: 1.20,
    weightMultiplier: 0.55,
    costMultiplier: 1.4,
    reliabilityDelta: 5,
  },

  // ═══ BILLET 7075-T6 ALUMINUM ═══
  {
    id: "billet_7075",
    name: "7075-T6 Billet Aluminum",
    family: "aluminum_zinc",
    designation: "AA 7075-T6 / EN AW-7075 T6",
    description: "Aerospace-grade extruded aluminum billet, CNC machined to final dimensions. The gold standard for racing pistons and structural components.",
    properties: {
      yieldStrengthMPa: 503,
      ultimateTensileStrengthMPa: 572,
      fatigueLimitMPa: 159,
      youngsModulusGPa: 71.7,
      shearModulusGPa: 26.9,
      elongationPercent: 11.0,
      hardness: { value: 175, scale: "HV" },
      densityKgM3: 2810,
      thermalConductivityWMK: 130,
      thermalExpansionUmMK: 23.6,
      specificHeatJkgK: 960,
      meltingPointC: 635,
      maxOperatingTempC: 200,
      maxBoostBar: 3.5,
      corrosionResistance: "fair",
      weldability: "poor",
      machinability: "good",
      rawMaterialCostPerKg: 6.50,
      processingCostMultiplier: 2.8,
      toolingLifeMultiplier: 0.6,
      microstructure: "Fine equiaxed grains with precipitated MgZn₂ (η') coherent phase",
      keyAlloyingElements: ["Zn 5.1-6.1%", "Mg 2.1-2.9%", "Cu 1.2-2.0%", "Cr 0.18-0.28%"],
    },
    heatTreatment: "T6_tempered",
    manufacturingProcess: "cnc_machined_from_billet",
    commonApplications: ["Racing pistons", "Structural chassis brackets", "Suspension uprights", "Wheel centers"],
    advantages: ["Highest strength aluminum", "Excellent fatigue life", "CNC precision"],
    disadvantages: ["Stress corrosion cracking risk", "Cannot be welded", "Expensive raw material"],
    hpMultiplier: 1.45,
    weightMultiplier: 0.58,
    costMultiplier: 2.8,
    reliabilityDelta: 15,
  },

  // ═══ MARAGING STEEL 300M ═══
  {
    id: "maraging_steel",
    name: "Maraging Steel 300M",
    family: "maraging_steel",
    designation: "UNS S13800 / 18Ni-300",
    description: "Ultra-high-strength nickel steel used in F1 crankshafts and connecting rods. Achieves exceptional toughness through precipitation hardening.",
    properties: {
      yieldStrengthMPa: 1860,
      ultimateTensileStrengthMPa: 1930,
      fatigueLimitMPa: 750,
      youngsModulusGPa: 186,
      shearModulusGPa: 72,
      elongationPercent: 12.0,
      hardness: { value: 54, scale: "HRC" },
      densityKgM3: 8100,
      thermalConductivityWMK: 24,
      thermalExpansionUmMK: 10.8,
      specificHeatJkgK: 460,
      meltingPointC: 1420,
      maxOperatingTempC: 500,
      maxBoostBar: 5.0,
      corrosionResistance: "good",
      weldability: "good",
      machinability: "fair",
      rawMaterialCostPerKg: 28.0,
      processingCostMultiplier: 3.5,
      toolingLifeMultiplier: 0.7,
      microstructure: "Lath martensite with Ni₃Mo and Ni₃Ti precipitates",
      keyAlloyingElements: ["Ni 17.5-18.5%", "Co 8.5-9.5%", "Mo 4.8-5.2%", "Ti 0.8-1.2%", "Al 0.1-0.2%"],
    },
    heatTreatment: "precipitation_hardened",
    manufacturingProcess: "closed_die_forged",
    commonApplications: ["F1 crankshafts", "Connecting rods", "Gear shafts", "Landing gear"],
    advantages: ["Extreme tensile strength", "Excellent fracture toughness", "Hardenable in large sections"],
    disadvantages: ["Very expensive", "Requires special tooling", "Low thermal conductivity"],
    hpMultiplier: 1.60,
    weightMultiplier: 0.82,
    costMultiplier: 4.2,
    reliabilityDelta: 22,
  },

  // ═══ Ti-6Al-4V TITANIUM ═══
  {
    id: "titanium_alloy",
    name: "Ti-6Al-4V Titanium",
    family: "titanium_alloy",
    designation: "Ti-6Al-4V Grade 5 / AMS 4928",
    description: "The workhorse titanium alloy for aerospace and Formula 1. Unbeatable strength-to-weight ratio at temperatures up to 400°C.",
    properties: {
      yieldStrengthMPa: 880,
      ultimateTensileStrengthMPa: 950,
      fatigueLimitMPa: 510,
      youngsModulusGPa: 114,
      shearModulusGPa: 44,
      elongationPercent: 14.0,
      hardness: { value: 340, scale: "HV" },
      densityKgM3: 4430,
      thermalConductivityWMK: 7.2,
      thermalExpansionUmMK: 8.6,
      specificHeatJkgK: 526,
      meltingPointC: 1660,
      maxOperatingTempC: 400,
      maxBoostBar: 6.0,
      corrosionResistance: "superior",
      weldability: "good",
      machinability: "poor",
      rawMaterialCostPerKg: 45.0,
      processingCostMultiplier: 4.5,
      toolingLifeMultiplier: 0.4,
      microstructure: "Equiaxed α-phase grains with intergranular β-phase",
      keyAlloyingElements: ["Al 5.5-6.75%", "V 3.5-4.5%", "Fe <0.3%", "O <0.2%"],
    },
    heatTreatment: "solution_treated",
    manufacturingProcess: "cnc_machined_from_billet",
    commonApplications: ["F1 connecting rods", "Valve springs", "Piston pins", "Exhaust systems"],
    advantages: ["50% lighter than steel at same strength", "Extreme fatigue life", "Corrosion-proof"],
    disadvantages: ["Very expensive", "Difficult to machine", "Low thermal conductivity causes heat buildup"],
    hpMultiplier: 1.65,
    weightMultiplier: 0.58,
    costMultiplier: 4.5,
    reliabilityDelta: 20,
  },

  // ═══ INCONEL 718 NICKEL SUPERALLOY ═══
  {
    id: "inconel_718",
    name: "Inconel 718 Superalloy",
    family: "nickel_superalloy",
    designation: "UNS N07718 / AMS 5662",
    description: "Nickel-chromium superalloy designed for extreme temperature applications. Used in turbine blades, exhaust manifolds, and turbocharger housings.",
    properties: {
      yieldStrengthMPa: 1035,
      ultimateTensileStrengthMPa: 1240,
      fatigueLimitMPa: 560,
      youngsModulusGPa: 205,
      shearModulusGPa: 79,
      elongationPercent: 12.0,
      hardness: { value: 40, scale: "HRC" },
      densityKgM3: 8190,
      thermalConductivityWMK: 11.4,
      thermalExpansionUmMK: 13.0,
      specificHeatJkgK: 435,
      meltingPointC: 1335,
      maxOperatingTempC: 700,
      maxBoostBar: 4.5,
      corrosionResistance: "superior",
      weldability: "good",
      machinability: "poor",
      rawMaterialCostPerKg: 65.0,
      processingCostMultiplier: 5.0,
      toolingLifeMultiplier: 0.3,
      microstructure: "γ (FCC nickel) matrix with γ' [Ni₃(Al,Ti)] and γ'' [Ni₃Nb] precipitates",
      keyAlloyingElements: ["Ni 50-55%", "Cr 17-21%", "Fe balance", "Nb+Ta 4.75-5.5%", "Mo 2.8-3.3%", "Ti 0.65-1.15%", "Al 0.2-0.8%"],
    },
    heatTreatment: "precipitation_hardened",
    manufacturingProcess: "investment_cast",
    commonApplications: ["Turbocharger housings", "Exhaust manifolds", "Gas turbine blades", "Rocket motor casings"],
    advantages: ["Extreme temperature capability", "Excellent creep resistance", "Outstanding corrosion resistance"],
    disadvantages: ["Very heavy", "Extremely expensive", "Nearly impossible to machine", "Low thermal conductivity"],
    hpMultiplier: 1.55,
    weightMultiplier: 1.05,
    costMultiplier: 6.0,
    reliabilityDelta: 28,
  },

  // ═══ HAYNES 230 ═══
  {
    id: "haynes_230",
    name: "Haynes 230 Superalloy",
    family: "nickel_superalloy",
    designation: "UNS N06230 / AMS 5878",
    description: "Nickel-chromium-tungsten superalloy with superior oxidation resistance. Premium material for exhaust headers and turbo manifolds.",
    properties: {
      yieldStrengthMPa: 390,
      ultimateTensileStrengthMPa: 860,
      fatigueLimitMPa: 330,
      youngsModulusGPa: 211,
      shearModulusGPa: 81,
      elongationPercent: 40.0,
      hardness: { value: 210, scale: "HV" },
      densityKgM3: 8970,
      thermalConductivityWMK: 8.9,
      thermalExpansionUmMK: 12.4,
      specificHeatJkgK: 427,
      meltingPointC: 1395,
      maxOperatingTempC: 1100,
      maxBoostBar: 3.5,
      corrosionResistance: "superior",
      weldability: "excellent",
      machinability: "poor",
      rawMaterialCostPerKg: 85.0,
      processingCostMultiplier: 5.5,
      toolingLifeMultiplier: 0.25,
      microstructure: "Single-phase solid solution FCC matrix with carbide precipitates",
      keyAlloyingElements: ["Ni 57%", "Cr 22%", "W 14%", "Mo 2%", "Co 5%", "C 0.1%", "La 0.02%"],
    },
    heatTreatment: "solution_treated",
    manufacturingProcess: "investment_cast",
    commonApplications: ["Exhaust headers", "Turbocharger housings", "Combustion liners", "Aftertreatment"],
    advantages: ["Extreme oxidation resistance", "Excellent fabricability", "Superior high-temp strength retention"],
    disadvantages: ["Very heavy", "Extremely expensive", "Poor machinability"],
    hpMultiplier: 1.40,
    weightMultiplier: 1.15,
    costMultiplier: 7.5,
    reliabilityDelta: 30,
  },

  // ═══ CERAMIC MATRIX COMPOSITE (CMC) ═══
  {
    id: "cmc",
    name: "SiC/SiC Ceramic Matrix Composite",
    family: "ceramic_matrix_composite",
    designation: "SiC/SiC CMC / GE LEAP Class",
    description: "Silicon carbide fiber-reinforced silicon carbide matrix composite. The ultimate high-temperature material for turbine components and thermal barriers.",
    properties: {
      yieldStrengthMPa: 350,
      ultimateTensileStrengthMPa: 450,
      fatigueLimitMPa: 250,
      youngsModulusGPa: 280,
      shearModulusGPa: 115,
      elongationPercent: 0.4,
      hardness: { value: 2200, scale: "HV" },
      densityKgM3: 2700,
      thermalConductivityWMK: 18,
      thermalExpansionUmMK: 3.0,
      specificHeatJkgK: 800,
      meltingPointC: 2730,
      maxOperatingTempC: 1350,
      maxBoostBar: 2.0,
      corrosionResistance: "superior",
      weldability: "poor",
      machinability: "poor",
      rawMaterialCostPerKg: 250.0,
      processingCostMultiplier: 8.0,
      toolingLifeMultiplier: 0.2,
      microstructure: "Continuous SiC fibers in SiC matrix with BN interphase coating",
      keyAlloyingElements: ["SiC fibers", "BN interphase", "SiC CVI/PIP matrix"],
    },
    heatTreatment: "as_cast",
    manufacturingProcess: "additive_manufactured",
    commonApplications: ["Turbine shrouds", "Thermal barrier coatings", "Brake discs (racing)", "Exhaust liners"],
    advantages: ["Extreme temperature capability", "Ultra-lightweight", "No thermal fatigue", "Exceptional hardness"],
    disadvantages: ["Extremely expensive", "Brittle failure mode", "Cannot be welded", "Very difficult to machine"],
    hpMultiplier: 1.70,
    weightMultiplier: 0.35,
    costMultiplier: 8.0,
    reliabilityDelta: 12,
  },

  // ═══ MIM TITANIUM (Powder Metallurgy) ═══
  {
    id: "mim_titanium",
    name: "MIM Titanium Ti-6Al-4V",
    family: "titanium_alloy",
    designation: "Ti-6Al-4V MIM / MPIF Standard 35",
    description: "Metal injection molded titanium for complex geometries. Near-net-shape production of intricate components with 95%+ material utilization.",
    properties: {
      yieldStrengthMPa: 830,
      ultimateTensileStrengthMPa: 900,
      fatigueLimitMPa: 420,
      youngsModulusGPa: 110,
      shearModulusGPa: 42,
      elongationPercent: 10.0,
      hardness: { value: 320, scale: "HV" },
      densityKgM3: 4380,
      thermalConductivityWMK: 6.8,
      thermalExpansionUmMK: 8.8,
      specificHeatJkgK: 530,
      meltingPointC: 1660,
      maxOperatingTempC: 380,
      maxBoostBar: 5.0,
      corrosionResistance: "superior",
      weldability: "good",
      machinability: "poor",
      rawMaterialCostPerKg: 35.0,
      processingCostMultiplier: 3.8,
      toolingLifeMultiplier: 0.5,
      microstructure: "Spheroidal α+β with controlled porosity <2%",
      keyAlloyingElements: ["Al 5.5-6.75%", "V 3.5-4.5%", "O <0.35%", "Fe <0.3%"],
    },
    heatTreatment: "solution_treated",
    manufacturingProcess: "powder_metallurgy",
    commonApplications: ["Complex brackets", "Turbo wheels", "Valve components", "Orthopedic implants"],
    advantages: ["Near-net-shape complex parts", "95%+ material utilization", "Lower cost than billet Ti"],
    disadvantages: ["Slightly lower properties than wrought", "Porosity concerns", "Expensive debinding/sintering"],
    hpMultiplier: 1.50,
    weightMultiplier: 0.60,
    costMultiplier: 3.8,
    reliabilityDelta: 18,
  },

  // ═══ CHROMOLY 4130 STEEL ═══
  {
    id: "chromoly",
    name: "4130 Chromoly Steel",
    family: "low_alloy_steel",
    designation: "AISI 4130 / EN 25 CrMo 4",
    description: "The backbone of motorsport chassis and roll cages. Chromium-molybdenum alloy steel offering excellent strength-to-weight ratio and weldability.",
    properties: {
      yieldStrengthMPa: 460,
      ultimateTensileStrengthMPa: 560,
      fatigueLimitMPa: 270,
      youngsModulusGPa: 205,
      shearModulusGPa: 80,
      elongationPercent: 21.5,
      hardness: { value: 22, scale: "HRC" },
      densityKgM3: 7850,
      thermalConductivityWMK: 42.7,
      thermalExpansionUmMK: 11.2,
      specificHeatJkgK: 475,
      meltingPointC: 1432,
      maxOperatingTempC: 550,
      maxBoostBar: 3.0,
      corrosionResistance: "fair",
      weldability: "excellent",
      machinability: "good",
      rawMaterialCostPerKg: 3.50,
      processingCostMultiplier: 1.8,
      toolingLifeMultiplier: 0.9,
      microstructure: "Tempered martensite with fine Fe₃C carbides",
      keyAlloyingElements: ["C 0.28-0.33%", "Cr 0.8-1.1%", "Mo 0.15-0.25%", "Mn 0.4-0.6%"],
    },
    heatTreatment: "quenched_tempered",
    manufacturingProcess: "open_die_forged",
    commonApplications: ["Roll cages", "Chassis tubes", "Drive shafts", "Suspension arms"],
    advantages: ["Excellent weldability", "High strength-to-weight", "Good fatigue life", "Widely available"],
    disadvantages: ["Requires heat treatment", "Heavier than aluminum", "Corrosion protection needed"],
    hpMultiplier: 1.30,
    weightMultiplier: 0.92,
    costMultiplier: 2.0,
    reliabilityDelta: 12,
  },

  // ═══ AL-SI HYPEREUTECTIC (Hypereutectic Aluminum) ═══
  {
    id: "hypereutectic_aluminum",
    name: "Hypereutectic Al-Si (A390)",
    family: "aluminum_silicon",
    designation: "A390.0-T6 / EN AC-48000 T6",
    description: "High-silicon aluminum with hard primary silicon particles for cylinder bore wear resistance. Eliminates the need for iron liners in engine blocks.",
    properties: {
      yieldStrengthMPa: 270,
      ultimateTensileStrengthMPa: 340,
      fatigueLimitMPa: 120,
      youngsModulusGPa: 81,
      shearModulusGPa: 30,
      elongationPercent: 1.5,
      hardness: { value: 120, scale: "HB" },
      densityKgM3: 2730,
      thermalConductivityWMK: 135,
      thermalExpansionUmMK: 18.5,
      specificHeatJkgK: 880,
      meltingPointC: 570,
      maxOperatingTempC: 220,
      maxBoostBar: 2.8,
      corrosionResistance: "good",
      weldability: "poor",
      machinability: "fair",
      rawMaterialCostPerKg: 3.20,
      processingCostMultiplier: 1.6,
      toolingLifeMultiplier: 0.7,
      microstructure: "Primary silicon particles (20-30µm) in α-Al dendritic matrix with eutectic Si",
      keyAlloyingElements: ["Si 16-18%", "Cu 4.0-5.0%", "Mg 0.5-0.65%", "Mn <0.3%", "Fe <0.5%"],
    },
    heatTreatment: "T6_tempered",
    manufacturingProcess: "die_cast",
    commonApplications: ["Cylinder bores (linerless)", "Piston skirts", "Brake calipers", "Compressor housings"],
    advantages: ["Wear-resistant cylinder bores", "No liners needed", "Lower weight than cast iron"],
    disadvantages: ["Low elongation (brittle)", "Difficult to cast", "Tool wear from Si particles"],
    hpMultiplier: 1.25,
    weightMultiplier: 0.52,
    costMultiplier: 1.6,
    reliabilityDelta: 8,
  },
];

// ─── LOOKUP UTILITIES ──────────────────────────────────────────────────────

/** Get a material grade by its ID */
export function getMaterialGrade(id: string): MetallurgyGrade | undefined {
  return METALLURGY_DATABASE.find((g) => g.id === id);
}

/** Get all grades belonging to a specific material family */
export function getGradesByFamily(family: MaterialFamily): MetallurgyGrade[] {
  return METALLURGY_DATABASE.filter((g) => g.family === family);
}

/** Calculate the strength-to-weight ratio of a material */
export function strengthToWeightRatio(grade: MetallurgyGrade): number {
  return grade.properties.ultimateTensileStrengthMPa / (grade.properties.densityKgM3 / 1000);
}

/** Calculate the specific stiffness (E/ρ) */
export function specificStiffness(grade: MetallurgyGrade): number {
  return (grade.properties.youngsModulusGPa * 1000) / grade.properties.densityKgM3;
}

/** Get the thermal efficiency index (how well the material dissipates heat) */
export function thermalEfficiencyIndex(grade: MetallurgyGrade): number {
  return (
    grade.properties.thermalConductivityWMK /
    (grade.properties.densityKgM3 * grade.properties.specificHeatJkgK * 1e-6)
  );
}

/** Get color coding for a material grade based on its cost tier */
export function getGradeColor(gradeId: string): { bg: string; text: string; border: string } {
  const grade = getMaterialGrade(gradeId);
  if (!grade) return { bg: "bg-slate-900", text: "text-slate-400", border: "border-slate-700" };

  if (grade.costMultiplier <= 1.3) return { bg: "bg-slate-900/80", text: "text-slate-300", border: "border-slate-600" };
  if (grade.costMultiplier <= 2.0) return { bg: "bg-amber-950/60", text: "text-amber-300", border: "border-amber-700" };
  if (grade.costMultiplier <= 3.5) return { bg: "bg-amber-950/60", text: "text-amber-300", border: "border-amber-700" };
  if (grade.costMultiplier <= 5.0) return { bg: "bg-amber-950/60", text: "text-amber-300", border: "border-amber-700" };
  return { bg: "bg-red-950/60", text: "text-red-300", border: "border-red-700" };
}

/** Get the process description for a manufacturing method */
export function getProcessDescription(process: ManufacturingProcess): string {
  const descriptions: Record<ManufacturingProcess, string> = {
    sand_cast: "Molten metal poured into sand molds. Low tooling cost, good for large parts.",
    die_cast: "Metal injected under high pressure into steel dies. Excellent surface finish.",
    investment_cast: "Lost-wax process for complex geometries. Used for turbine components.",
    lost_foam_cast: "Foam pattern vaporizes on metal contact. Complex shapes without cores.",
    open_die_forged: "Metal hammered between flat dies. Excellent grain flow for structural parts.",
    closed_die_forged: "Metal shaped in matched die cavities. High production rate, good properties.",
    cold_forged: "Room temperature forging for extreme work hardening and precision.",
    cnc_machined_from_billet: "CNC machining from solid billet. Zero porosity, maximum properties.",
    powder_metallurgy: "Metal powder sintered to near-final shape. Excellent material utilization.",
    metal_injection_molding: "Fine metal powder + polymer binder injection molded then sintered.",
    additive_manufactured: "Layer-by-layer laser or electron beam melting. Ultimate design freedom.",
    centrifugal_cast: "Molten metal spun in rotating mold. Dense, porosity-free cylindrical parts.",
    continuous_cast: "Continuous pouring into water-cooled mold for consistent billets and slabs.",
    sheet_metal_formed: "Pressed from sheet stock. Fast, lightweight panels and brackets.",
    hydroformed: "Fluid pressure forms metal into complex tubular shapes. Seamless, lightweight.",
  };
  return descriptions[process] || "Specialized manufacturing process.";
}

/** Get the heat treatment description */
export function getHeatTreatmentDescription(ht: HeatTreatment): string {
  const descriptions: Record<HeatTreatment, string> = {
    as_cast: "No post-processing. Properties from solidification only.",
    annealed: "Slow cooled to relieve stresses and improve ductility.",
    solution_treated: "Heated to single-phase region and quenched for supersaturated solid solution.",
    T6_tempered: "Solution treated + artificially aged at ~175°C for peak strength.",
    T7_tempered: "Solution treated + over-aged for improved dimensional stability.",
    quenched_tempered: "Rapid cooled from austenite + reheated to form tempered martensite.",
    precipitation_hardened: "Controlled aging to precipitate strengthening phases.",
    age_hardened: "Thermal treatment to precipitate fine secondary phases for strengthening.",
    nitrided: "Nitrogen diffusion surface hardening for wear resistance (58-62 HRC surface).",
    case_hardened: "Carbon diffusion + quench for hard case with tough core.",
  };
  return descriptions[ht] || "Specialized heat treatment.";
}
