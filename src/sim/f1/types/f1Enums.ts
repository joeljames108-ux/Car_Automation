// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — ENUMS & TAXONOMIES
// ============================================================================
// Comprehensive enumeration domain for FIA Formula 1 vehicle engineering,
// powertrain, aerodynamics, materials science, chassis physics, and race operations.
// ============================================================================

// ---------- 1. Chassis & Materials ----------
export type CarbonFiberGrade =
  | "T300_STANDARD"        // Entry aerospace standard, 230 GPa modulus, 3.5 GPa tensile
  | "T700_INTERMEDIATE"    // High strength structural, 230 GPa, 4.9 GPa tensile
  | "T800_HIGH_STRENGTH"   // Premier F1 monocoque standard, 294 GPa, 5.88 GPa tensile
  | "T1000_ULTRA_TENSILE"  // Extreme impact nosecones & survival cell outer ply, 294 GPa, 6.37 GPa
  | "M55J_HIGH_MODULUS"    // Pitch-based ultra-high stiffness for suspension wishbones & wings, 540 GPa
  | "GRAPHENE_INFUSED";    // Experimental nano-reinforced prepreg for thin-wall floor skirts

export type ResinMatrixType =
  | "EPOXY_TOUGHENED_180C"     // Industry standard toughened epoxy autoclave prepreg (180°C cure)
  | "CYANATE_ESTER_RADOME"     // Low dielectric / high glass-transition (Tg > 240°C) for telemetry & nose
  | "BISMALEIMIDE_HIGH_TEMP"   // 260°C continuous service for exhaust surround & turbo heatshields
  | "POLYIMIDE_THERMAL_BARRIER";// 350°C peak operating threshold for turbochargers & wastegate areas

export type CoreMaterialType =
  | "NOMEX_HONEYCOMB_HRH10"    // Aramid paper core, 48 kg/m³ density, structural standard
  | "ALUMINUM_5056_HONEYCOMB"  // High crush-strength metallic core for crash attenuator structures
  | "ROHACELL_HERO_POLYMETH"   // High temperature closed-cell PMI foam for 3D contoured aerodynamic surfaces
  | "TITANIUM_3D_LATTICE";     // Additive manufactured DMLS titanium lattice for Halo load points

export type MetallicAlloyGrade =
  | "TI_6AL_4V_GRADE5"         // Standard high strength titanium for suspension uprights & fasteners
  | "TI_6AL_2SN_4ZR_2MO"       // High temp titanium for exhaust brackets & turbo housings
  | "INCONEL_625_SUPERALLOY"   // Nickel-chromium superalloy for high stress exhaust primaries
  | "INCONEL_718_PRECIPITATION"// Extreme yield strength (1100 MPa) for turbocharger turbine shafts
  | "BERYLLIUM_COPPER_C17200"  // High thermal conductivity alloy for valve seats & guide inserts
  | "AERMET_100_ULTRA_STEEL"   // 2000 MPa tensile steel for driveline half-shafts & gearbox input shafts
  | "AL_LI_2099_AEROSPACE";    // Aluminum-lithium low density alloy for complex hydraulic manifolds

// ---------- 2. Power Unit & Powertrain ----------
export type F1PowerUnitMode =
  | "STRAT_1_QUALIFYING_MAX"   // Maximum ICE boost (100 kg/h max flow) + 120 kW MGU-K continuous
  | "STRAT_2_RACE_AGGRESSIVE"  // High deployment for overtaking & undercut in/out laps
  | "STRAT_3_RACE_BALANCED"    // 1:1 state of charge replenishment cycle over whole lap
  | "STRAT_4_HARVEST_MAX"      // Aggressive MGU-K lift-and-coast harvesting (up to 2 MJ/lap cap)
  | "STRAT_5_FUEL_SAVE_LIFT"   // Early throttle lift before braking zones to reduce fuel flow
  | "STRAT_6_SAFETY_CAR_IDLE"  // Minimum heat generation, electrical battery preservation
  | "STRAT_OVERTAKE_BOOST";    // Driver steering wheel overtake button (120 kW dump till battery floor)

export type CombustionPrechamberTech =
  | "PASSIVE_PRECHAMBER_TBI"   // Passive orifice prechamber, relies on main injector scavenging
  | "ACTIVE_DUAL_STAGE_MAHLE"  // Mahle Jet Ignition active prechamber with dedicated micro-injector
  | "CORONA_DISCHARGE_IGNITION"// Ultra-high energy multi-point plasma discharge ignition
  | "ULTRASONIC_STRATIFIED";   // High frequency fuel atomization for lean burn lambda 1.35+

export type MguKDeploymentStrategy =
  | "CORNER_EXIT_TORQUE_FILL"  // Fills turbo spool lag below 7,500 RPM for instantaneous torque
  | "TOP_END_SPEED_EXTENDER"   // Deploys on long straights between 280-350 km/h to overcome drag
  | "TRACTION_OPTIMIZED"       // Modulates torque delivery based on wheel slip sensor feedback
  | "DYNAMIC_GPS_DELTA";       // Apex speed GPS micro-bursts calculated per corner profile

export type MguHControlMode =
  | "DIRECT_MGU_K_ENERGY_FEED" // MGU-H directly feeds 120 kW to MGU-K bypassing the 4 MJ battery cap
  | "ENERGY_STORE_CHARGING"    // Routes exhaust heat electrical energy directly to battery pack
  | "TURBO_ANTI_LAG_MOTORING"  // Spins up compressor to 100k RPM before throttle application
  | "HYBRID_EFFICIENCY_SPLIT"; // Automated dynamic allocation optimizing thermal balance

export type F1GearboxCasingType =
  | "CARBON_TITANIUM_HYBRID"   // Carbon fiber composite structure with cast titanium bearing inserts
  | "FULL_CARBON_MONOCOQUE"    // Ultra-stiff autoclave-cured structural monocoque casing (42 kg)
  | "ADDITIVE_DMLS_TITANIUM";  // Generative topology-optimized laser melted titanium skeleton

// ---------- 3. Aerodynamics ----------
export type AeroPackageLevel =
  | "ULTRA_LOW_DRAG_MONZA"     // Minimal rear wing flap angle (8°), trimmed beam wing, Monza/Baku spec
  | "LOW_DRAG_SPA_SILVERSTONE" // Shallow 15° wing, optimized DRS delta for long straights
  | "MEDIUM_DOWNFORCE_GLOBAL"  // Baseline 22° wing for balanced GP circuits (Barcelona, Austin, Suzuka)
  | "HIGH_DOWNFORCE_HUNGARY"   // Aggressive 30° wing with Gurney flaps for tight technical circuits
  | "MAXIMUM_DOWNFORCE_MONACO"; // 36° maximum angle, deep floor tunnels, max cooling louvers

export type FrontWingConcept =
  | "INWASH_VORTEX_GENERATOR"  // Directs airflow inboard towards floor fences and sidepod undercut
  | "OUTWASH_WAKE_DEFLECTOR"   // Directs tire wake outboard away from underbody venturi inlets
  | "GROUND_SEALING_NEUTRAL";  // Balanced loading creating high central vortex structure (Y250 legacy)

export type SidepodPhilosophy =
  | "AGGRESSIVE_DOWNWASH_RAMP" // Red Bull / McLaren downwash ramp directing flow to diffuser top
  | "ZEROPOD_ULTRA_NARROW"     // Mercedes ultra-compact packaging maximizing exposed floor area
  | "INWASH_BATHTUB_SCALLOP"   // Ferrari deep bathtub channel guiding air between rear wheels
  | "HIGH_UNDERCUT_AERO_BRIDGE";// Aston Martin extreme undercut exposing massive floor leading edge

export type DiffuserStrakeLayout =
  | "QUAD_VORTEX_FENCE_FIA"    // Maximum allowable 4 vertical strakes per side within FIA bounding box
  | "EXPANSION_OPTIMIZED_TRI"  // 3 high-aspect strakes creating delayed boundary layer separation
  | "SLOTTED_WINGLET_DIFFUSER";// Diffuser expansion wall with micro-slots for secondary flow injection

// ---------- 4. Suspension & Dynamics ----------
export type F1SuspensionLayout =
  | "FRONT_PUSHROD_REAR_PULLROD"// Classic packaging: front high rocker for aero, rear low CoG
  | "FRONT_PULLROD_REAR_PUSHROD"// Modern ground-effect standard: front pullrod for floor aero, rear pushrod for diffuser clearance
  | "FULL_PUSHROD_FOUR_CORNER"  // Maximum accessibility for mechanics during rapid setup changes
  | "FULL_PULLROD_LOW_COG";     // Lowest center of gravity but extreme packaging density

export type AntiRollBarType =
  | "TORSION_BAR_ROTARY_BLADE" // Mechanical torsion bar with indexed rotary blade stiffness adjustment
  | "HYDRAULIC_HEAVE_LINKED"   // Inter-connected heave/roll hydraulic cartridge (compliant with FIA rules)
  | "TITANIUM_U_BEAM_PASSIVE"; // Ultra-lightweight passive composite/titanium U-bar

export type BrakeDiscHolePattern =
  | "600_HOLE_MEDIUM_COOLING"  // Low drag / moderate brake circuits (Monza, Silverstone)
  | "1050_HOLE_HIGH_VENT"      // Standard high-load GP specification (Bahrain, Barcelona)
  | "1480_HOLE_CHEVRON_EXTREME";// Extreme thermal dissipation for Montreal, Singapore, Red Bull Ring

// ---------- 5. Tires & Stints ----------
export type F1TireCompound =
  | "C1_SUPER_HARD"            // Silverstone, Suzuka, Barcelona high-energy load circuits
  | "C2_HARD"                  // High degradation abrasive tracks
  | "C3_MEDIUM"                // Universal working range compound (featured in every race weekend)
  | "C4_SOFT"                  // Street circuits & low degradation tracks
  | "C5_ULTRA_SOFT"            // Monaco, Singapore, Baku, Las Vegas maximum mechanical grip
  | "INTERMEDIATE_GREEN"       // Damp track / light rain (standing water < 3mm)
  | "FULL_WET_BLUE";           // Heavy rain (clears 85 liters/sec per tire at 300 km/h)

// ---------- 6. Season, Series & Championship ----------
export type F1SessionType =
  | "FP1_PRACTICE"             // 60-min baseline aero correlation & baseline setup
  | "FP2_PRACTICE"             // 60-min race simulation long-run stint evaluation
  | "FP3_PRACTICE"             // 60-min qualifying simulation on soft compound
  | "QUALIFYING_Q1"            // 18-min session: 20 cars, bottom 5 eliminated (P16-P20)
  | "QUALIFYING_Q2"            // 15-min session: 15 cars, bottom 5 eliminated (P11-P15)
  | "QUALIFYING_Q3"            // 12-min top-10 pole shootout
  | "SPRINT_SHOOTOUT_SQ1"      // 12-min mandatory Medium tire session
  | "SPRINT_SHOOTOUT_SQ2"      // 10-min mandatory Medium tire session
  | "SPRINT_SHOOTOUT_SQ3"      // 8-min mandatory Soft tire session
  | "SPRINT_RACE"              // 100 km sprint race with points for top 8 (8-7-6-5-4-3-2-1)
  | "GRAND_PRIX_MAIN_RACE";    // Full 305 km Grand Prix with mandatory 2 dry compounds

export type F1WeatherType =
  | "DRY_SUNNY"                // Track temp 38°C-54°C, optimal tire working window
  | "DRY_OVERCAST"             // Track temp 22°C-34°C, lower thermal degradation
  | "CHANGING_DRIZZLE"         // Crossover zone between C5/C4 slicks and Green Inters
  | "WET_INTERMEDIATE"         // Standing water, requires Green Inters
  | "MONSOON_FULL_WET"         // Heavy spray, extreme aquaplaning risk, Safety Car likely
  | "DRYING_LINE_CROSSOVER";   // Damp track with drying racing line, critical strategy transition

export type F1FlagStatus =
  | "GREEN_FLAG"               // Track clear, racing speed
  | "YELLOW_SECTOR_SINGLE"     // Hazard in sector, no overtaking, reduce speed
  | "DOUBLE_YELLOW_FULL"       // Major hazard or marshals on track, prepare to stop
  | "SAFETY_CAR_FULL"          // Full Physical Safety Car deployed, delta time mandatory
  | "VIRTUAL_SAFETY_CAR_VSC"   // VSC active, maintain 40% reduced pace delta
  | "RED_FLAG_SUSPENDED"       // Session stopped, return to pit lane, free tire change allowed
  | "BLACK_WHITE_WARNING"      // Driver warning for track limits or unsportsmanlike behavior
  | "CHEQUERED_FLAG";          // Session finished
