export interface StageLoadingMetric {
  label: string;
  value: string;
}

export interface StageLoadingConfig {
  id: string;
  label: string;
  category: string;
  tagline: string;
  icon: string;
  accentColor: string;
  gradient: string;
  badgeBg: string;
  schematicType:
    | "campus"
    | "main_menu"
    | "architecture"
    | "engine"
    | "chassis"
    | "aero"
    | "interior"
    | "operations"
    | "garage"
    | "motorsport"
    | "f1"
    | "hypercar"
    | "rd"
    | "safety"
    | "simulation"
    | "testing"
    | "finance"
    | "contracts"
    | "calendar"
    | "reputation"
    | "workforce"
    | "supplyChain"
    | "dyno_ecu"
    | "track_battle"
    | "track_layout"
    | "transmission3d"
    | "suspension3d"
    | "nvh"
    | "twin"
    | "sales"
    | "competitors"
    | "compare"
    | "project_overview"
    | "settings"
    | "default";
  subtasks: string[];
  telemetryLogs: string[];
  metrics: StageLoadingMetric[];
}

export const STAGE_LOADING_CONFIGS: Record<string, StageLoadingConfig> = {
  // ── 1. Global Campus & Headquarters ──
  hq: {
    id: "hq",
    label: "Global Campus & Headquarters",
    category: "CORPORATE INFRASTRUCTURE & LOGISTICS",
    tagline: "Resolving 3D BIM Campus Master Coordinates, Rail Terminal & Executive Towers",
    icon: "🏢",
    accentColor: "#059669",
    gradient: "from-emerald-500/20 via-teal-500/10 to-emerald-600/15",
    badgeBg: "rgba(5, 150, 105, 0.12)",
    schematicType: "campus",
    subtasks: [
      "BIM 3D Campus Master Hardpoints",
      "Multi-Track Cargo Railway Terminal",
      "Wind Tunnel & Aero Prototyping Center",
      "Executive Towers & Design Pavilion",
      "Intermodal Logistics Routing Hub"
    ],
    telemetryLogs: [
      "[CAMPUS-BIM] Calibrating 3D spatial grid coordinates (X=0, Y=-420, Z=0)... OK",
      "[LOGISTICS-HUB] Synchronizing cargo rail siding switchgear & intermodal cranes... 100%",
      "[FACILITY-SYS] Initializing executive design pavilion & wind tunnel shaders... OK",
      "[CAMPUS-MASTER] Ready. Handing off to Campus Map Master Studio."
    ],
    metrics: [
      { label: "CAMPUS AREA", value: "142 Hectares" },
      { label: "RAIL SIDING", value: "4 Tracks Active" }
    ]
  },

  // ── 2. Apex Main Menu & Command Hub ──
  main_menu: {
    id: "main_menu",
    label: "Apex Automotive Headquarters Hub",
    category: "GLOBAL COMMAND & EXECUTIVE SUITE",
    tagline: "Synchronizing Corporate Portfolio, Financial Ledgers & Departmental Hubs",
    icon: "🏛️",
    accentColor: "#b45309",
    gradient: "from-amber-500/20 via-orange-500/10 to-amber-600/15",
    badgeBg: "rgba(180, 83, 9, 0.12)",
    schematicType: "main_menu",
    subtasks: [
      "Corporate Portfolio State Sync",
      "Market Share & Global Deliveries Ledger",
      "Division Telemetry Feeds Calibration",
      "Departmental Hub Action Routing",
      "Executive Dashboard Warmup"
    ],
    telemetryLogs: [
      "[PORTFOLIO] Polling global sales records & dealership inventories... OK",
      "[COMM-LINK] Synchronizing R&D, Motorsport & Manufacturing data streams... OK",
      "[EXECUTIVE] Refreshing real-time cash ledger & reputation metrics... 100%",
      "[MAIN-MENU] Global Headquarters Hub ready."
    ],
    metrics: [
      { label: "SIM CLOCK", value: "Real-Time 120Hz" },
      { label: "SYSTEMS", value: "11 Hubs Online" }
    ]
  },

  // ── 3. Vehicle Creation & Architecture Hub ──
  create_vehicle_hub: {
    id: "create_vehicle_hub",
    label: "Vehicle Creation & Architecture Hub",
    category: "AUTOMOTIVE DESIGN & VEHICLE SPECIFICATION",
    tagline: "Selecting Vehicle Archetypes, Hardpoint Topologies & Homologation Classes",
    icon: "🏎️",
    accentColor: "#d97706",
    gradient: "from-amber-500/20 via-yellow-500/10 to-amber-600/15",
    badgeBg: "rgba(217, 119, 6, 0.12)",
    schematicType: "architecture",
    subtasks: [
      "Vehicle Archetype Class Matrix",
      "Platform Wheelbase & Track Boundaries",
      "Powertrain Topology Integration",
      "Regulatory Homologation Targeting",
      "Prototype Blueprint Initialization"
    ],
    telemetryLogs: [
      "[ARCHETYPE] Loading Production, F1 & Hypercar engineering frameworks... OK",
      "[HARDPOINTS] Initializing chassis anchor translator in mm space... OK",
      "[SPECS] Calibrating power-to-weight, drag and downforce targets... 100%",
      "[CREATION-HUB] Vehicle Architecture Hub initialized."
    ],
    metrics: [
      { label: "WHEELBASE", value: "2,720 mm" },
      { label: "PLATFORMS", value: "Modular Matrix" }
    ]
  },

  // ── 4. Powertrain & Engine Studio ──
  engine: {
    id: "engine",
    label: "Powertrain & Engine Studio",
    category: "INTERNAL COMBUSTION & HYBRID PROPULSION",
    tagline: "Calibrating Billet Block CNC, Variable Valve Timing & Forced Induction",
    icon: "⚙️",
    accentColor: "#ea580c",
    gradient: "from-orange-500/20 via-amber-500/10 to-red-600/15",
    badgeBg: "rgba(234, 88, 12, 0.12)",
    schematicType: "engine",
    subtasks: [
      "Billet Cylinder Block Casting",
      "Forged Crankshaft & Titanium Rods",
      "Variable Valve Timing & Cam Phasing",
      "Twin-Scroll Ball-Bearing Turbos",
      "Dyno Ignition Maps & Lambda Air-Fuel"
    ],
    telemetryLogs: [
      "[DYNO-SYS] Connecting multi-cylinder thermodynamic combustion solver... OK",
      "[POWERTRAIN] Calculating MEP (Mean Effective Pressure) & P-V curve... 100%",
      "[TURBO] Initializing compressor map & wastegate actuator feedback... OK",
      "[ENGINE-STUDIO] Engine Designer ready for calibration."
    ],
    metrics: [
      { label: "BOOST", value: "1.85 Bar" },
      { label: "REDLINE", value: "8,500 RPM" }
    ]
  },

  // ── 5. Chassis & Exterior Dynamics Studio ──
  vehicle: {
    id: "vehicle",
    label: "Chassis & Exterior Dynamics Studio",
    category: "MONOCOQUE, STRUCTURAL CAD & AERO BODYWORK",
    tagline: "Fabricating Carbon Monocoque, 3.5mm Shutlines & Aerodynamic Surfaces",
    icon: "🚗",
    accentColor: "#0284c7",
    gradient: "from-sky-500/20 via-blue-500/10 to-cyan-600/15",
    badgeBg: "rgba(2, 132, 199, 0.12)",
    schematicType: "chassis",
    subtasks: [
      "Carbon-Fiber Monocoque Layup",
      "Double-Wishbone Hardpoint Geometry",
      "Class-A Surfacing & 3.5mm Shutline Gaps",
      "Underbody Venturi Downforce Tunnels",
      "Crash Safety Crumple Zone Optimization"
    ],
    telemetryLogs: [
      "[CAD-MESH] Loading Class-A continuous G2 curvature topology... OK",
      "[HARDPOINTS] Snapping 3D master anchors (Front/Rear suspension)... OK",
      "[RIGIDITY] FEA torsional stiffness: 45,200 Nm/deg target verified... 100%",
      "[VEHICLE-STUDIO] Vehicle Designer ready."
    ],
    metrics: [
      { label: "STIFFNESS", value: "45,200 Nm/deg" },
      { label: "SHUTLINES", value: "3.5 mm Gap" }
    ]
  },

  // ── 6. Aerodynamics & Wind Tunnel Studio ──
  aero_studio: {
    id: "aero_studio",
    label: "Aerodynamics & Wind Tunnel Studio",
    category: "COMPUTATIONAL FLUID DYNAMICS (CFD)",
    tagline: "Solving Navier-Stokes Streamlines, Active DRS Wing & Venturi Diffusers",
    icon: "💨",
    accentColor: "#0ea5e9",
    gradient: "from-cyan-500/20 via-sky-500/10 to-blue-600/15",
    badgeBg: "rgba(14, 165, 233, 0.12)",
    schematicType: "aero",
    subtasks: [
      "Navier-Stokes Surface Mesh Generation",
      "Active DRS Rear Wing Actuator Kinematics",
      "Rear Venturi Diffuser Expansion Angles",
      "Front Splitter Vortex Strakes & Canards",
      "High-Speed Aero Balance (Cl/Cd 3.8:1)"
    ],
    telemetryLogs: [
      "[CFD-SOLVER] Initializing 2.4M voxel boundary layer mesh... OK",
      "[WIND-TUNNEL] Setting simulated airspeed to 250 km/h (69.4 m/s)... 100%",
      "[AERO-MAP] Surface pressure distribution: Downforce +620kg @ 240km/h... OK",
      "[AERO-STUDIO] Aerodynamics Studio ready."
    ],
    metrics: [
      { label: "DRAG (Cd)", value: "0.285" },
      { label: "DOWNFORCE", value: "-620 kg" }
    ]
  },

  // ── 7. Cockpit & Cabin Ergonomics Studio ──
  interior: {
    id: "interior",
    label: "Cockpit & Cabin Ergonomics Studio",
    category: "HUMAN-MACHINE INTERFACE & LUXURY TRIM",
    tagline: "Lofting Nappa Leather, Curved OLED Displays & Acoustic Lightbars",
    icon: "💺",
    accentColor: "#7c3aed",
    gradient: "from-purple-500/20 via-violet-500/10 to-indigo-600/15",
    badgeBg: "rgba(124, 58, 237, 0.12)",
    schematicType: "interior",
    subtasks: [
      "SAE J1100 Driver H-Point Geometry",
      "Curved OLED Anti-Glare Instrument Cluster",
      "Perforated Nappa Leather & French Seams",
      "Fiber-Optic Ambient Lighting Ribbon",
      "Steering Wheel Tactile Switchgear"
    ],
    telemetryLogs: [
      "[ERGONOMICS] Aligning SAE J826 H-point at (X=-0.380, Y=0.000, Z=0.280)... OK",
      "[OLED-UI] Rendering 12.3-inch driver cluster & 14.5-inch MMI glass... 100%",
      "[LEATHER-CAD] Generating negative French seam gutters & bolster lofting... OK",
      "[INTERIOR-STUDIO] Interior Designer ready."
    ],
    metrics: [
      { label: "H-POINT", value: "SAE J826 OK" },
      { label: "DISPLAYS", value: "Curved OLED" }
    ]
  },


  // ── 9. Industrial Operations & Robotics Hub ──
  operations: {
    id: "operations",
    label: "Industrial Operations & Robotics Hub",
    category: "ADVANCED AUTOMATION & ASSEMBLY PLANTS",
    tagline: "Synchronizing KUKA Robot Kinematics, Stamping Presses & Takt Time",
    icon: "🏭",
    accentColor: "#ea580c",
    gradient: "from-orange-500/20 via-amber-500/10 to-orange-600/15",
    badgeBg: "rgba(234, 88, 12, 0.12)",
    schematicType: "operations",
    subtasks: [
      "KUKA 6-Axis Welding Robot Kinematics",
      "Automated Body-in-White Stamping Line",
      "Cathodic Electrodeposition Paint Bath",
      "Optical In-Line Laser QA Scanners",
      "Takt Time & Just-In-Time Assembly Feed"
    ],
    telemetryLogs: [
      "[FACTORY-PLC] Connecting industrial Profinet bus (128 robot cells)... OK",
      "[STAMPING] 4,000-ton hydraulic die press calibrated... 100%",
      "[QA-OPTICAL] In-line micrometer laser scanner: 0.05mm tolerance... OK",
      "[OPERATIONS] Manufacturing Operations floor ready."
    ],
    metrics: [
      { label: "TAKT TIME", value: "64 Seconds" },
      { label: "ROBOT CELLS", value: "128 Active" }
    ]
  },


  // ── 11. Executive Vehicle Fleet Garage ──
  garage: {
    id: "garage",
    label: "Executive Vehicle Fleet Garage",
    category: "INVENTORY, FLEET STAGING & TELEMETRY",
    tagline: "Staging Vehicle Collection, Maintenance Hoists & Diagnostic CAN-Bus",
    icon: "🚗",
    accentColor: "#475569",
    gradient: "from-slate-500/20 via-zinc-500/10 to-slate-600/15",
    badgeBg: "rgba(71, 85, 105, 0.12)",
    schematicType: "garage",
    subtasks: [
      "Vehicle Staging Turntable Calibration",
      "Hydraulic Service Hoist Alignment",
      "OBD-II CAN-Bus Telemetry Health Check",
      "Fleet Odometer & Depreciation Ledger",
      "Showroom Detailing & Lighting Prep"
    ],
    telemetryLogs: [
      "[FLEET-DB] Fetching registered vehicles, variants and mileage... OK",
      "[DIAGNOSTICS] CAN-Bus ECU error query: 0 fault codes detected... 100%",
      "[TURNTABLE] Calibrating 360-degree rotating staging platform... OK",
      "[GARAGE] Vehicle Fleet Garage ready."
    ],
    metrics: [
      { label: "TURNTABLE", value: "360° Motor OK" },
      { label: "DIAGNOSTICS", value: "0 Fault Codes" }
    ]
  },

  // ── 12. Apex Motorsport Division ──
  motorsport: {
    id: "motorsport",
    label: "Apex Motorsport Division",
    category: "INTERNATIONAL RACING & TELEMETRY",
    tagline: "Mapping Circuit Sectors, Infrared Tire Warmers & Live Lap Deltas",
    icon: "🏁",
    accentColor: "#dc2626",
    gradient: "from-red-500/20 via-rose-500/10 to-red-600/15",
    badgeBg: "rgba(220, 38, 38, 0.12)",
    schematicType: "motorsport",
    subtasks: [
      "Circuit GPS Track Mapping & Sectors",
      "Tire Warmer Infrared Heat Optimization",
      "Paddock Telemetry Radio Frequency Sync",
      "Pit Stop Strategy & Fuel Burn Models",
      "Live Lap Delta & Apex Trajectory Trace"
    ],
    telemetryLogs: [
      "[TRACK-GPS] Loading Silverstone, Spa & Suzuka timing sectors... OK",
      "[TIRE-WARM] Setting blanket temperatures: 100°C Front / 90°C Rear... 100%",
      "[TELEMETRY] 1,000Hz pit-to-car telemetry link online... OK",
      "[MOTORSPORT] Motorsport Division ready."
    ],
    metrics: [
      { label: "PIT LINK", value: "1,000 Hz Live" },
      { label: "TIRE TEMP", value: "100°C Pre-Heat" }
    ]
  },

  // ── 13. Formula 1 Single-Seater Constructor ──
  f1_constructor: {
    id: "f1_constructor",
    label: "Formula 1 Single-Seater Constructor",
    category: "FIA FORMULA 1 TECHNICAL REGULATIONS",
    tagline: "Engineering Ground-Effect Venturi Tunnels, 1.6L V6 Turbo PU & Titanium Halo",
    icon: "🏎️",
    accentColor: "#e11d48",
    gradient: "from-rose-500/20 via-red-500/10 to-rose-600/15",
    badgeBg: "rgba(225, 29, 72, 0.12)",
    schematicType: "f1",
    subtasks: [
      "FIA Article 3 Legality Box Audit",
      "Carbon-Nomex Survival Monocoque & Halo",
      "1.6L V6 Turbo MGU-K Hybrid Power Unit",
      "Ground-Effect Venturi Underbody Skirts",
      "Pushrod Suspension & Active DRS Wing"
    ],
    telemetryLogs: [
      "[FIA-REG] Validating minimum mass 798kg & 125kN Halo crash envelope... OK",
      "[V6-HYBRID] Calibrating 120kW MGU-K regeneration & deployment maps... 100%",
      "[VENTURI] Underbody floor suction: 1,450kg downforce @ 280km/h... OK",
      "[F1-WORKSHOP] Formula 1 Single-Seater Constructor ready."
    ],
    metrics: [
      { label: "MIN MASS", value: "798 kg Legal" },
      { label: "MGU-K", value: "120 kW Hybrid" }
    ]
  },

  // ── 14. Hypercar Prototype Constructor ──
  hypercar_constructor: {
    id: "hypercar_constructor",
    label: "Hypercar Prototype Constructor",
    category: "WEC / ACO LMH & LMDh REGULATIONS",
    tagline: "Configuring LMH BoP Aero Windows, Dual-Motor Hybrid AWD & Shark Fin",
    icon: "🔥",
    accentColor: "#2563eb",
    gradient: "from-blue-500/20 via-indigo-500/10 to-blue-600/15",
    badgeBg: "rgba(37, 99, 235, 0.12)",
    schematicType: "hypercar",
    subtasks: [
      "LMH Balance of Performance (BoP) Aero Window",
      "Hot-V Twin-Turbo V8 + Front Axle MGU",
      "Carbon Dorsal Shark Fin & Endplates",
      "Carbon-Ceramic Monobloc Brake Ducts",
      "Downforce / Drag Ratio (Cl/Cd 4.0:1) Lock"
    ],
    telemetryLogs: [
      "[WEC-BOP] Checking aerodynamic window ratio 4.0:1 ± 2%... VERIFIED",
      "[HYBRID-AWD] 500kW rear ICE + 200kW front electric motor sync... 100%",
      "[LE-MANS] 24-hour endurance thermal dissipation validation... OK",
      "[HYPERCAR-STUDIO] Hypercar Constructor ready."
    ],
    metrics: [
      { label: "BOP RATIO", value: "4.0:1 Cl/Cd" },
      { label: "HYBRID", value: "900V 700kW" }
    ]
  },

  // ── 15. Advanced R&D Technology Center ──
  rd: {
    id: "rd",
    label: "Advanced R&D Technology Center",
    category: "BREAKTHROUGH PATENTS & INNOVATION",
    tagline: "Unlocking Carbon Nanotube Weaves, Solid-State Cells & Generative CAD",
    icon: "🔬",
    accentColor: "#4f46e5",
    gradient: "from-indigo-500/20 via-purple-500/10 to-indigo-600/15",
    badgeBg: "rgba(79, 70, 229, 0.12)",
    schematicType: "rd",
    subtasks: [
      "Materials Science Nanotube Weaves",
      "Solid-State Battery Cell Density",
      "Plasma-Assisted Ignition Research",
      "Patent Filing & Tech Tree Expansion",
      "Generative CAD Topology Optimization"
    ],
    telemetryLogs: [
      "[TECH-TREE] Loading 88 proprietary automotive patents & unlocks... OK",
      "[LAB-CELLS] Solid-state 450 Wh/kg electrolyte bench test active... 100%",
      "[TOPOLOGY] Running 500-iteration structural FEA mass reduction... OK",
      "[R&D-CENTER] R&D Technology Center ready."
    ],
    metrics: [
      { label: "PATENTS", value: "88 Unlocked" },
      { label: "DENSITY", value: "450 Wh/kg" }
    ]
  },

  // ── 16. Crash Safety & Homologation Lab ──
  safety: {
    id: "safety",
    label: "Crash Safety & Homologation Lab",
    category: "EURO NCAP, IIHS & IMPACT BIOMECHANICS",
    tagline: "Verifying 64 km/h Offset Barrier, Airbag Timing & Passenger Survival Cell",
    icon: "🛡️",
    accentColor: "#ef4444",
    gradient: "from-red-500/20 via-orange-500/10 to-red-600/15",
    badgeBg: "rgba(239, 68, 68, 0.12)",
    schematicType: "safety",
    subtasks: [
      "64 km/h Offset Deformable Barrier Impact",
      "High-Strength Steel Survival Cell Rigidity",
      "Dual-Stage Pyrotechnic Airbag Deployment",
      "Roof Crush Strength-to-Weight Ratio",
      "Euro NCAP 5-Star Structural Rating Audit"
    ],
    telemetryLogs: [
      "[CRASH-RIG] High-speed camera telemetry synced at 10,000 fps... OK",
      "[DECEL-PULSE] Peak passenger compartment deceleration: 24G safe... 100%",
      "[AIRBAG-ECU] Pyrotechnic trigger latency: 14 milliseconds... OK",
      "[SAFETY-LAB] Safety Center ready."
    ],
    metrics: [
      { label: "NCAP RATING", value: "5 Stars (98%)" },
      { label: "IMPACT PULSE", value: "24G Controlled" }
    ]
  },

  // ── 17. Multi-Physics Simulation Dashboard ──
  simulation: {
    id: "simulation",
    label: "Multi-Physics Simulation Dashboard",
    category: "NUMERICAL SOLVER & DYNAMICS BENCHMARK",
    tagline: "Solving Tire Grip Limits, Transient Roll Dynamics & Lap Time Estimates",
    icon: "📈",
    accentColor: "#06b6d4",
    gradient: "from-cyan-500/20 via-blue-500/10 to-cyan-600/15",
    badgeBg: "rgba(6, 182, 212, 0.12)",
    schematicType: "simulation",
    subtasks: [
      "Non-Linear Tire Grip & Slip Angle Model",
      "Aerodynamic Pitch & Roll Sensitivity",
      "Powertrain Thermal Saturation Solver",
      "0-100 km/h & 400m Quarter-Mile Run",
      "High-G Skidpad & Slalom Stability Run"
    ],
    telemetryLogs: [
      "[SOLVER-RK4] 4th-order Runge-Kutta numerical integration (1,000Hz)... OK",
      "[TIRE-PACEJKA] Magic Formula 5.2 friction coefficient: 1.62G lat... 100%",
      "[THERMAL-ENG] Radiator heat rejection equilibrium: 92°C coolant... OK",
      "[SIMULATION] Simulation Dashboard ready."
    ],
    metrics: [
      { label: "LATERAL GRIP", value: "1.62 G Peak" },
      { label: "INTEGRATION", value: "1,000 Hz RK4" }
    ]
  },

  // ── 18. Proving Grounds & Testing Lab ──
  testing: {
    id: "testing",
    label: "Proving Grounds & Testing Lab",
    category: "DYNAMIC PERFORMANCE & HOMOLOGATION",
    tagline: "Calibrating 100-0 km/h Braking, Skidpad Lateral G & Slalom Transitions",
    icon: "⏱️",
    accentColor: "#3b82f6",
    gradient: "from-blue-500/20 via-sky-500/10 to-blue-600/15",
    badgeBg: "rgba(59, 130, 246, 0.12)",
    schematicType: "testing",
    subtasks: [
      "100-0 km/h Emergency Braking Distance",
      "Constant-Radius 200m Skidpad Lateral G",
      "Moose Test & High-Speed Slalom Stability",
      "High-Speed Oval 300+ km/h Endurance",
      "Cobblestone NVH & Suspension Shaker Rig"
    ],
    telemetryLogs: [
      "[PROVING-GROUND] High-speed banking telemetry beacon linked... OK",
      "[BRAKE-TEST] Carbon-ceramic stopping distance: 30.8m @ 100km/h... 100%",
      "[SHAKER-RIG] 4-post hydraulic shaker frequency response: 1.2Hz... OK",
      "[TESTING-LAB] Testing Lab ready."
    ],
    metrics: [
      { label: "100-0 BRAKE", value: "30.8 m" },
      { label: "OVAL SPEED", value: "340 km/h Bank" }
    ]
  },

  // ── 19. Corporate Finance & Treasury ──
  finance: {
    id: "finance",
    label: "Corporate Finance & Treasury",
    category: "CAPITAL ALLOCATION & AUDIT LEDGER",
    tagline: "Auditing Double-Entry Ledgers, Tooling Amortization & EBITDA Margins",
    icon: "💰",
    accentColor: "#16a34a",
    gradient: "from-green-500/20 via-emerald-500/10 to-green-600/15",
    badgeBg: "rgba(22, 163, 74, 0.12)",
    schematicType: "finance",
    subtasks: [
      "Double-Entry General Ledger Balance",
      "Unit Margin & Tooling Amortization",
      "R&D CapEx vs. Factory OpEx Allocation",
      "Global Currency Hedging & Interest Rates",
      "Quarterly EBITDA & Valuation Audit"
    ],
    telemetryLogs: [
      "[TREASURY] Fetching corporate reserves & liquid capital assets... OK",
      "[LEDGER] Reconciling accounts receivable vs supplier obligations... 100%",
      "[VALUATION] Enterprise valuation computed via DCF model... OK",
      "[FINANCE] Corporate Finance & Treasury ready."
    ],
    metrics: [
      { label: "NET MARGIN", value: "+24.8%" },
      { label: "AUDIT STATUS", value: "Reconciled OK" }
    ]
  },

  // ── 20. Procurement & Contracts Hub ──
  contracts: {
    id: "contracts",
    label: "Procurement & Contracts Hub",
    category: "SUPPLIER SLA & CLIENT DELIVERIES",
    tagline: "Verifying Tier-1 Supplier SLAs, Deal Room Terms & Escrow Deposits",
    icon: "📜",
    accentColor: "#1e3a8a",
    gradient: "from-blue-800/20 via-indigo-600/10 to-blue-900/15",
    badgeBg: "rgba(30, 58, 138, 0.12)",
    schematicType: "contracts",
    subtasks: [
      "Tier-1 OEM Supplier SLA Validation",
      "Bilateral Milestone Delivery Clauses",
      "Raw Material Price Escrow Locks",
      "Homologation Compliance Guarantees",
      "Cryptographic Digital Signature Signoff"
    ],
    telemetryLogs: [
      "[DEAL-ROOM] Polling active government & private fleet contracts... OK",
      "[SLA-VERIFY] Checking supplier quality metrics & penalty clauses... 100%",
      "[ESCROW] Verifying milestone funding release... OK",
      "[CONTRACTS] Procurement & Contracts Hub ready."
    ],
    metrics: [
      { label: "TIER-1 SUPPLIERS", value: "24 Active" },
      { label: "SIGNATURE", value: "2048-bit RSA" }
    ]
  },

  // ── 21. Corporate Calendar & Roadmap ──
  calendar: {
    id: "calendar",
    label: "Corporate Calendar & Season Schedule",
    category: "TIMELINE, MOTORSPORT RACES & PRODUCT LAUNCHES",
    tagline: "Tracking FIA Championship Weekends, Auto Shows & Financial Quarters",
    icon: "📅",
    accentColor: "#ca8a04",
    gradient: "from-yellow-500/20 via-amber-500/10 to-yellow-600/15",
    badgeBg: "rgba(202, 138, 4, 0.12)",
    schematicType: "calendar",
    subtasks: [
      "FIA Championship Race Weekends",
      "International Geneva Auto Show Reveal",
      "Quarterly Financial Earnings Calls",
      "Factory Maintenance Re-tooling Windows",
      "Supplier Lead-Time Delivery Milestones"
    ],
    telemetryLogs: [
      "[CHRONO] Synchronizing in-game tick calendar with simulation clock... OK",
      "[EVENTS] Populating 52-week racing & corporate event milestones... 100%",
      "[DEADLINES] Validating prototype signoff and launch dates... OK",
      "[CALENDAR] Corporate Calendar ready."
    ],
    metrics: [
      { label: "RACE FIXTURES", value: "24 Grands Prix" },
      { label: "NEXT AUTO SHOW", value: "Day 124" }
    ]
  },

  // ── 22. Brand Reputation & Media Reviews ──
  reputation: {
    id: "reputation",
    label: "Brand Reputation & Press Standing",
    category: "GLOBAL MEDIA, MOTORSPORT PRESTIGE & SENTIMENT",
    tagline: "Compiling Journalist Scores, Prestige Halo & Customer Brand Equity",
    icon: "⭐",
    accentColor: "#eab308",
    gradient: "from-yellow-400/20 via-amber-500/10 to-yellow-500/15",
    badgeBg: "rgba(234, 179, 8, 0.12)",
    schematicType: "reputation",
    subtasks: [
      "Automotive Journalist Review Aggregator",
      "Customer Brand Loyalty Index (NPS)",
      "Motorsport Championship Halo Effect",
      "Luxury Showroom Footfall & Prestige",
      "Tier-1 OEM Partnership Standing"
    ],
    telemetryLogs: [
      "[MEDIA-INDEX] Aggregating TopGear, MotorTrend & Evo scores... OK",
      "[BRAND-EQUITY] Prestige multiplier calculated at 1.48x... 100%",
      "[SENTIMENT] Social media & VIP customer sentiment: 94% positive... OK",
      "[REPUTATION] Brand Reputation & Media Standing ready."
    ],
    metrics: [
      { label: "PRESS SCORE", value: "9.8 / 10" },
      { label: "PRESTIGE HALO", value: "Tier 1 AAA" }
    ]
  },

  // ── 23. Workforce & Talent Acquisition ──
  workforce: {
    id: "workforce",
    label: "Workforce & Talent Acquisition",
    category: "ENGINEERING DIVISIONS, SALARIES & SPECIALISTS",
    tagline: "Recruiting F1 Aerodynamicists, Master Fabricators & Tuning Specialists",
    icon: "👥",
    accentColor: "#0d9488",
    gradient: "from-teal-500/20 via-emerald-500/10 to-teal-600/15",
    badgeBg: "rgba(13, 148, 136, 0.12)",
    schematicType: "workforce",
    subtasks: [
      "Aerodynamicist & F1 Specialist Roster",
      "Factory Floor Technician Skill Matrix",
      "Division Morale & Retention Indices",
      "Competitive Wage & Bonus Modeling",
      "Headhunting Tier-1 Powertrain Leads"
    ],
    telemetryLogs: [
      "[STAFF-DB] Querying 1,420 engineers across 8 global facilities... OK",
      "[PAYROLL] Reconciling monthly wages, bonuses and pension funds... 100%",
      "[MORALE] Team productivity index: 96.2% optimal... OK",
      "[WORKFORCE] Workforce & Talent Hub ready."
    ],
    metrics: [
      { label: "ENGINEERS", value: "1,420 Global" },
      { label: "MORALE", value: "96.2% Optimal" }
    ]
  },

  // ── 24. Global Supply Chain Logistics ──
  supplyChain: {
    id: "supplyChain",
    label: "Global Supply Chain & Logistics",
    category: "INTERMODAL FREIGHT & RAW MATERIAL FLOW",
    tagline: "Tracking Freight Rail Terminal, Port Shipping & Just-In-Sequence Delivery",
    icon: "🚆",
    accentColor: "#ea580c",
    gradient: "from-orange-500/20 via-amber-500/10 to-orange-600/15",
    badgeBg: "rgba(234, 88, 12, 0.12)",
    schematicType: "supplyChain",
    subtasks: [
      "Freight Cargo Railway Scheduling",
      "Port of Entry Maritime Shipping Routes",
      "Automated Warehouse ASRS Pallet Cranes",
      "Raw Aluminum & Carbon Fiber Inventory",
      "Just-In-Sequence Factory Line Feeding"
    ],
    telemetryLogs: [
      "[RAIL-OPS] Tracking intermodal cargo train 44B (1,200 tons lithium/steel)... OK",
      "[CONTAINERS] Harbor port customs clearance granted... 100%",
      "[JIT-FEED] Buffer stock maintained at 14.5 days operational reserve... OK",
      "[SUPPLY-CHAIN] Supply Chain & Logistics ready."
    ],
    metrics: [
      { label: "RAIL FREIGHT", value: "1,200 t Active" },
      { label: "JIT BUFFER", value: "14.5 Days Reserve" }
    ]
  },

  // ── 25. Powertrain Dyno & ECU Calibration ──
  dyno_ecu: {
    id: "dyno_ecu",
    label: "Powertrain Dyno & ECU Calibration",
    category: "DYNAMOMETER BENCH & IGNITION MAPS",
    tagline: "Measuring Wheel Torque, Horsepower Curves & Lambda Air-Fuel Maps",
    icon: "⚡",
    accentColor: "#f97316",
    gradient: "from-orange-500/20 via-amber-500/10 to-red-600/15",
    badgeBg: "rgba(249, 115, 22, 0.12)",
    schematicType: "dyno_ecu",
    subtasks: [
      "Chassis Roller Dyno Synchronizer",
      "Wideband Lambda Sensor Calibration",
      "Ignition Advance Timing Map Matrix",
      "Knock Sensor Fast-Fourier Analysis",
      "Power & Torque Curve Certification"
    ],
    telemetryLogs: [
      "[DYNO-ROLLER] Calibrating twin-roller eddy-current load absorption... OK",
      "[ECU-FLASH] Downloading Bosch Motorsport high-speed ignition map... 100%",
      "[AFR-SWEEP] Wideband O2 lambda target: 0.86 under full boost... OK",
      "[DYNO-ECU] Dyno & ECU Tuning Studio ready."
    ],
    metrics: [
      { label: "PEAK POWER", value: "840 HP @ 7,800" },
      { label: "TORQUE", value: "920 Nm @ 4,200" }
    ]
  },

  // ── 26. Telemetry Track Battles & Ghost Duels ──
  track_battle: {
    id: "track_battle",
    label: "Telemetry Track Battles & Ghost Duels",
    category: "HEAD-TO-HEAD SECTOR DELTA ANALYSIS",
    tagline: "Comparing GPS Telemetry Trajectories, Apex Speeds & Lap Deltas",
    icon: "⚔️",
    accentColor: "#ef4444",
    gradient: "from-red-500/20 via-rose-500/10 to-red-600/15",
    badgeBg: "rgba(239, 68, 68, 0.12)",
    schematicType: "track_battle",
    subtasks: [
      "GPS Telemetry Overlay Alignment",
      "Corner Apex Min-Speed Comparison",
      "Throttle Application Point Delta",
      "Braking Marker Distance Comparison",
      "High-Frequency Ghost Lap Synchronization"
    ],
    telemetryLogs: [
      "[GHOST-SYNC] Aligning reference telemetry stream (0.001s resolution)... OK",
      "[APEX-SPEED] Turn 4 apex delta: +4.2 km/h advantage... 100%",
      "[BRAKE-TRACE] Threshold braking: 12m deeper into braking zone... OK",
      "[TRACK-BATTLES] Track Battles Studio ready."
    ],
    metrics: [
      { label: "GHOST DELTA", value: "-0.182 s" },
      { label: "APEX SPEED", value: "+4.2 km/h" }
    ]
  },

  // ── 27. Track Layout Master Studio ──
  track_layout: {
    id: "track_layout",
    label: "Track Layout Master Studio",
    category: "CIRCUIT TOPOLOGY & ELEVATION DESIGN",
    tagline: "Engineering Corner Radii, Elevation Cambers & FIA Kerb Profiles",
    icon: "🗺️",
    accentColor: "#10b981",
    gradient: "from-emerald-500/20 via-teal-500/10 to-emerald-600/15",
    badgeBg: "rgba(16, 185, 129, 0.12)",
    schematicType: "track_layout",
    subtasks: [
      "Topographical Elevation Spline Lofting",
      "FIA Grade 1 Corner Radius Compliance",
      "Chicane & Runoff Area Runout Calc",
      "DRS Detection Zone Positioning",
      "Asphalt Micro-Texture Friction Map"
    ],
    telemetryLogs: [
      "[SPLINE-CAD] Computing 3D clothoid curvature transition spirals... OK",
      "[ELEVATION] Maximum gradient 7.4% at Turn 9 carousel banked 12°... 100%",
      "[FIA-SAFETY] Runoff gravel and Tecpro barriers approved Grade 1... OK",
      "[TRACK-LAYOUT] Track Layout Master Studio ready."
    ],
    metrics: [
      { label: "CIRCUIT LENGTH", value: "5.412 km" },
      { label: "TURNS", value: "19 Corners (FIA G1)" }
    ]
  },

  // ── 28. 3D Transmission & Drivetrain Studio ──
  transmission3d: {
    id: "transmission3d",
    label: "3D Transmission & Drivetrain Studio",
    category: "DUAL-CLUTCH, GEAR RATIOS & DIFFERENTIALS",
    tagline: "Modeling Dual-Clutch Packs, Helical Gearsets & Limited-Slip Diff",
    icon: "⚙️",
    accentColor: "#8b5cf6",
    gradient: "from-purple-500/20 via-violet-500/10 to-indigo-600/15",
    badgeBg: "rgba(139, 92, 246, 0.12)",
    schematicType: "transmission3d",
    subtasks: [
      "7-Speed Dual-Clutch Pre-Selector Hub",
      "Helical Cut Spur & Pinion Mesh",
      "Electro-Hydraulic Clutch Actuation",
      "Electronic Limited-Slip Differential",
      "Torque Vectoring Lockup Strategy"
    ],
    telemetryLogs: [
      "[GEARSET] Calculating helical tooth contact ratio: 2.14 smooth... OK",
      "[SHIFT-TIME] Dual-clutch pre-engagement shift speed: 45ms... 100%",
      "[E-LSD] Dynamic torque vectoring preload: 180 Nm calibrated... OK",
      "[TRANSMISSION] 3D Transmission Studio ready."
    ],
    metrics: [
      { label: "SHIFT SPEED", value: "45 ms DCT" },
      { label: "GEAR COUNT", value: "7-Speed Dual-Clutch" }
    ]
  },

  // ── 29. Kinematic Suspension Master Studio ──
  suspension3d: {
    id: "suspension3d",
    label: "Kinematic Suspension Master Studio",
    category: "DOUBLE-WISHBONE, CAMBER & COILOVER GEOMETRY",
    tagline: "Computing Anti-Dive Angles, Pushrod Rockers & Dynamic Camber Gain",
    icon: "🛞",
    accentColor: "#0284c7",
    gradient: "from-sky-500/20 via-blue-500/10 to-cyan-600/15",
    badgeBg: "rgba(2, 132, 199, 0.12)",
    schematicType: "suspension3d",
    subtasks: [
      "Upper & Lower A-Arm Wishbone Lengths",
      "CNC Bellcrank Pushrod Rocker Ratio",
      "Dynamic Camber Curve (-2.4° in Bump)",
      "Anti-Squat & Anti-Dive Geometry",
      "Remote Reservoir Coilover Damper Valves"
    ],
    telemetryLogs: [
      "[KINEMATICS] Instant center of roll calculated: 65mm above ground... OK",
      "[CAMBER-GAIN] Dynamic camber gain: -0.85° per 25mm bump stroke... 100%",
      "[DAMPERS] 4-way independent high/low speed compression valves set... OK",
      "[SUSPENSION-3D] Suspension Master Studio ready."
    ],
    metrics: [
      { label: "STATIC CAMBER", value: "-2.4° Front / -1.8° Rear" },
      { label: "STROKE", value: "110 mm Travel" }
    ]
  },

  // ── 30. NVH Acoustics & Sound Synthesis Lab ──
  nvh: {
    id: "nvh",
    label: "NVH Acoustics & Sound Synthesis Lab",
    category: "CABIN ACOUSTICS, DECIBEL & HARMONIC FFT",
    tagline: "Synthesizing Exhaust Harmonics, Acoustic Foam & Decibel Damping",
    icon: "🔊",
    accentColor: "#06b6d4",
    gradient: "from-cyan-500/20 via-sky-500/10 to-blue-600/15",
    badgeBg: "rgba(6, 182, 212, 0.12)",
    schematicType: "nvh",
    subtasks: [
      "Anechoic Sound Chamber Microphone Array",
      "V8 Crossplane vs Flatplane Harmonics",
      "Cabin Decibel Sound Pressure Level",
      "Active Noise Cancellation Inversion",
      "Fast-Fourier Acoustic Frequency Spectrum"
    ],
    telemetryLogs: [
      "[ANECHOIC-LAB] Calibrating 32-channel directional microphone dome... OK",
      "[FFT-AUDIO] Firing harmonic order 4.0 exhaust resonance at 6,400 RPM... 100%",
      "[CABIN-SPL] Cruising cabin sound pressure: 64 dBA whisper quiet... OK",
      "[NVH-LAB] NVH Sound Lab ready."
    ],
    metrics: [
      { label: "CABIN SPL", value: "64 dBA @ 120km/h" },
      { label: "HARMONICS", value: "Crossplane V8" }
    ]
  },

  // ── 31. Digital Twin Vehicle Telemetry ──
  twin: {
    id: "twin",
    label: "Digital Twin Vehicle Telemetry",
    category: "REAL-TIME IOT SENSOR STREAM & PREDICTIVE HEALTH",
    tagline: "Streaming CAN-Bus Sensors, Component Fatigue & Predictive Life",
    icon: "📡",
    accentColor: "#6366f1",
    gradient: "from-indigo-500/20 via-blue-500/10 to-indigo-600/15",
    badgeBg: "rgba(99, 102, 241, 0.12)",
    schematicType: "twin",
    subtasks: [
      "Holographic CAD Model State Mirroring",
      "Multi-Channel CAN-Bus IoT Telemetry Link",
      "Thermal Gradient Heatmap Generation",
      "Brake Rotor & Tire Wear Degradation",
      "Predictive Maintenance Remaining Useful Life"
    ],
    telemetryLogs: [
      "[DIGITAL-TWIN] Synchronizing 420 physical telemetry channels... OK",
      "[CAN-BUS] Packet rate: 2,500 messages/sec with zero drops... 100%",
      "[PREDICTIVE] Brake pad wear projection: 28,400 km remaining... OK",
      "[DIGITAL-TWIN] Digital Twin Telemetry ready."
    ],
    metrics: [
      { label: "IOT SENSORS", value: "420 Channels" },
      { label: "PACKET RATE", value: "2,500 msg/sec" }
    ]
  },



  // ── 34. Commercial Sales & Dealership Launch ──
  sales: {
    id: "sales",
    label: "Commercial Sales & Dealership Launch",
    category: "CUSTOMER DELIVERIES & SHOWROOM NETWORK",
    tagline: "Staging Glass Showrooms, Customer Configurator & Handover Ceremonies",
    icon: "🏷️",
    accentColor: "#059669",
    gradient: "from-emerald-500/20 via-teal-500/10 to-emerald-600/15",
    badgeBg: "rgba(5, 150, 105, 0.12)",
    schematicType: "sales",
    subtasks: [
      "Global Showroom Order Intake Pipeline",
      "Flagship Architectural Turntable Delivery",
      "Customer Bespoke Options Configurator",
      "Vehicle Allocation & Export Logistics",
      "Commercial Launch Campaign Activation"
    ],
    telemetryLogs: [
      "[SHOWROOM-CRM] Connecting 64 flagship luxury dealerships worldwide... OK",
      "[PRE-ORDERS] Allocations for launch edition: 100% reserved... 100%",
      "[DELIVERY-APP] Handover ceremonial key presentation ready... OK",
      "[SALES-LAUNCH] Commercial Sales Hub ready."
    ],
    metrics: [
      { label: "DEALERSHIPS", value: "64 Global" },
      { label: "ALLOCATIONS", value: "100% Reserved" }
    ]
  },

  // ── 35. World Competitors & Market Intelligence ──
  competitors: {
    id: "competitors",
    label: "World Competitors & Market Intelligence",
    category: "OEM BENCHMARKING & MARKET SHARE",
    tagline: "Analyzing Rival OEM Specs, Market Penetration & Segment Dominance",
    icon: "🌐",
    accentColor: "#0284c7",
    gradient: "from-sky-500/20 via-blue-500/10 to-cyan-600/15",
    badgeBg: "rgba(2, 132, 199, 0.12)",
    schematicType: "competitors",
    subtasks: [
      "Global OEM Market Share Distribution",
      "Supercar & Hypercar Benchmark Matrices",
      "Rival Powertrain Specific Output (HP/L)",
      "Patent Intelligence & Reverse Engineering",
      "Market Segment Pricing Sensitivity"
    ],
    telemetryLogs: [
      "[MARKET-INTEL] Scraping performance specs from 16 competitor models... OK",
      "[SEGMENT-SHARE] Apex market share in Luxury Supercar: 18.4%... 100%",
      "[BENCHMARK] Specific output leadership: Apex +22 HP/L ahead of rival... OK",
      "[COMPETITORS] Competitor Intelligence Hub ready."
    ],
    metrics: [
      { label: "MARKET SHARE", value: "18.4% (Top 3)" },
      { label: "RIVALS", value: "16 Tracked" }
    ]
  },

  // ── 36. Engineering Benchmark Comparison ──
  compare: {
    id: "compare",
    label: "Engineering Benchmark Comparison",
    category: "RADAR PERFORMANCE METRICS & SPEC MATRICES",
    tagline: "Comparing Multi-Axis Radar Polygons, Mass Ratios & Track Times",
    icon: "📊",
    accentColor: "#6366f1",
    gradient: "from-indigo-500/20 via-purple-500/10 to-indigo-600/15",
    badgeBg: "rgba(99, 102, 241, 0.12)",
    schematicType: "compare",
    subtasks: [
      "6-Axis Radar Polygon Metric Overlay",
      "Power-to-Weight Ratio Calculation",
      "Downforce-to-Drag Aero Efficiency",
      "Lateral Acceleration & Braking Delta",
      "Track Lap Time Simulation Differential"
    ],
    telemetryLogs: [
      "[COMPARISON] Normalizing 6 key performance attributes across vehicles... OK",
      "[POWER-WEIGHT] Apex Flagship: 1.62 kg/HP benchmark leader... 100%",
      "[RADAR-MESH] Plotting multi-vehicle comparison polygon overlays... OK",
      "[COMPARE-LAB] Engineering Comparison Studio ready."
    ],
    metrics: [
      { label: "POWER/WEIGHT", value: "1.62 kg/HP" },
      { label: "AERO EFFICIENCY", value: "3.8:1 L/D" }
    ]
  },

  // ── 37. Project Genesis Program Overview ──
  project_overview: {
    id: "project_overview",
    label: "Project Genesis Program Overview",
    category: "EXECUTIVE PROGRAM MANAGEMENT",
    tagline: "Reviewing Milestone Gateways, Engineering Budget & Delivery Roadmap",
    icon: "🧭",
    accentColor: "#b45309",
    gradient: "from-amber-600/20 via-orange-500/10 to-amber-700/15",
    badgeBg: "rgba(180, 83, 9, 0.12)",
    schematicType: "project_overview",
    subtasks: [
      "Executive Milestone Gateways Status",
      "Departmental Budget Allocation Ledger",
      "Engineering Risk Matrix & Mitigations",
      "Vehicle Prototype Readiness Scorecard",
      "Board of Directors Strategic Signoff"
    ],
    telemetryLogs: [
      "[PROGRAM-MGT] Aggregating Phase 1 through 7 completion deltas... OK",
      "[BUDGET-TRACK] Capital deployment within 2.4% of initial plan... 100%",
      "[READINESS] Pre-production prototype assembly on schedule... OK",
      "[PROJECT-OVERVIEW] Project Overview ready."
    ],
    metrics: [
      { label: "READINESS", value: "88% On Schedule" },
      { label: "BUDGET DELTA", value: "2.4% Optimal" }
    ]
  },

  // ── 38. Simulation Settings & Preferences ──
  settings: {
    id: "settings",
    label: "Simulation Settings & Preferences",
    category: "GRAPHICS, PHYSICS ENGINE & AUDIO HAPTICS",
    tagline: "Calibrating WebGL Shaders, 120Hz Telemetry & Sound Synthesis",
    icon: "⚙️",
    accentColor: "#64748b",
    gradient: "from-slate-500/20 via-zinc-500/10 to-slate-600/15",
    badgeBg: "rgba(100, 116, 139, 0.12)",
    schematicType: "settings",
    subtasks: [
      "WebGL Shader Pipeline Compilation",
      "Multi-Threaded Physics Engine Frequency",
      "Web Audio API Procedural Synthesizer",
      "Spatial Camera Inertial Damping",
      "Local Storage State Snapshot Verification"
    ],
    telemetryLogs: [
      "[GRAPHICS] Hardware acceleration: WebGL2 / WebGPU ready... OK",
      "[AUDIO-FX] Procedural engine acoustic synthesizers primed... 100%",
      "[PREFERENCES] User interface theme: Vision Glass Light Theme... OK",
      "[SETTINGS] Settings panel ready."
    ],
    metrics: [
      { label: "TARGET FPS", value: "120 Hz Native" },
      { label: "AUDIO SYNTH", value: "Web Audio API" }
    ]
  },

  // ── 39. Default Fallback ──
  default: {
    id: "default",
    label: "Automotive Engineering Workspace",
    category: "APEX MODULAR CAD & PHYSICS SYSTEM",
    tagline: "Streaming Multi-Physics Solvers, High-Precision Meshes & Shaders",
    icon: "🔧",
    accentColor: "#d97706",
    gradient: "from-amber-500/20 via-orange-500/10 to-amber-600/15",
    badgeBg: "rgba(217, 119, 6, 0.12)",
    schematicType: "default",
    subtasks: [
      "Subsystem Architecture Verification",
      "Coordinate Hardpoint Alignment",
      "PBR Material Shader Compilation",
      "Physics Parameter Synchronization",
      "Interactive Workspace Activation"
    ],
    telemetryLogs: [
      "[CORE-SYS] Initializing master coordinate translator... OK",
      "[SHADERS] Compiling PBR clearcoat & dielectric optical shaders... 100%",
      "[SYNC] Memory allocation optimal. Handing off to workspace... OK",
      "[SYSTEM] Engineering Workspace ready."
    ],
    metrics: [
      { label: "SUBSYSTEMS", value: "11 Validated" },
      { label: "COORDINATES", value: "3D mm Snapping" }
    ]
  }
};

/**
 * Normalizes stage key to matching configuration
 */
export function getStageLoadingConfig(stageName?: string): StageLoadingConfig {
  if (!stageName) return STAGE_LOADING_CONFIGS.default;
  const key = stageName.toLowerCase().trim();

  if (STAGE_LOADING_CONFIGS[key]) {
    return STAGE_LOADING_CONFIGS[key];
  }

  // Exact aliases & semantic keyword matching
  if (key.includes("hq") || key.includes("campus") || key.includes("facility")) return STAGE_LOADING_CONFIGS.hq;
  if (key.includes("main") || key.includes("home") || key.includes("menu")) return STAGE_LOADING_CONFIGS.main_menu;
  if (key.includes("create") || key.includes("architect") || key.includes("genesis_hub")) return STAGE_LOADING_CONFIGS.create_vehicle_hub;
  if (key.includes("dyno") || key.includes("ecu") || key.includes("tuning")) return STAGE_LOADING_CONFIGS.dyno_ecu;
  if (key.includes("engine") || key.includes("powertrain") || key.includes("combustion")) return STAGE_LOADING_CONFIGS.engine;
  if (key.includes("transmission") || key.includes("gearbox") || key.includes("clutch")) return STAGE_LOADING_CONFIGS.transmission3d;
  if (key.includes("suspension") || key.includes("wishbone") || key.includes("damper")) return STAGE_LOADING_CONFIGS.suspension3d;
  if (key.includes("aero") || key.includes("wind") || key.includes("diffuser") || key.includes("wing")) return STAGE_LOADING_CONFIGS.aero_studio;
  if (key.includes("interior") || key.includes("cockpit") || key.includes("cabin") || key.includes("ergonomic")) return STAGE_LOADING_CONFIGS.interior;
  if (key.includes("f1") || key.includes("formula") || key.includes("single_seater")) return STAGE_LOADING_CONFIGS.f1_constructor;
  if (key.includes("hypercar") || key.includes("lemans") || key.includes("prototype") || key.includes("wec")) return STAGE_LOADING_CONFIGS.hypercar_constructor;
  if (key.includes("garage") || key.includes("fleet") || key.includes("showroom")) return STAGE_LOADING_CONFIGS.garage;
  if (key.includes("battle") || key.includes("duel") || key.includes("ghost")) return STAGE_LOADING_CONFIGS.track_battle;
  if (key.includes("layout") || key.includes("circuit_design")) return STAGE_LOADING_CONFIGS.track_layout;
  if (key.includes("race") || key.includes("motorsport") || key.includes("track") || key.includes("paddock")) return STAGE_LOADING_CONFIGS.motorsport;
  if (key.includes("rd") || key.includes("research") || key.includes("patent") || key.includes("innovation")) return STAGE_LOADING_CONFIGS.rd;
  if (key.includes("operation") || key.includes("manufactur") || key.includes("factory") || key.includes("robot")) return STAGE_LOADING_CONFIGS.operations;
  if (key.includes("nvh") || key.includes("sound") || key.includes("acoustic")) return STAGE_LOADING_CONFIGS.nvh;
  if (key.includes("twin") || key.includes("iot") || key.includes("telemetry_stream")) return STAGE_LOADING_CONFIGS.twin;

  if (key.includes("sales") || key.includes("dealership") || key.includes("commercial")) return STAGE_LOADING_CONFIGS.sales;
  if (key.includes("competitor") || key.includes("rival") || key.includes("market_share") || key.includes("world")) return STAGE_LOADING_CONFIGS.competitors;
  if (key.includes("compare") || key.includes("benchmark") || key.includes("radar")) return STAGE_LOADING_CONFIGS.compare;
  if (key.includes("safety") || key.includes("crash") || key.includes("ncap") || key.includes("airbag")) return STAGE_LOADING_CONFIGS.safety;
  if (key.includes("finance") || key.includes("economy") || key.includes("ledger") || key.includes("budget") || key.includes("treasury")) return STAGE_LOADING_CONFIGS.finance;
  if (key.includes("contract") || key.includes("deal") || key.includes("supplier") || key.includes("sla")) return STAGE_LOADING_CONFIGS.contracts;
  if (key.includes("calendar") || key.includes("schedule") || key.includes("roadmap") || key.includes("season")) return STAGE_LOADING_CONFIGS.calendar;
  if (key.includes("reputation") || key.includes("press") || key.includes("review") || key.includes("media") || key.includes("prestige")) return STAGE_LOADING_CONFIGS.reputation;
  if (key.includes("workforce") || key.includes("talent") || key.includes("staff") || key.includes("employee") || key.includes("engineer")) return STAGE_LOADING_CONFIGS.workforce;
  if (key.includes("supply") || key.includes("logistics") || key.includes("freight") || key.includes("railway")) return STAGE_LOADING_CONFIGS.supplyChain;
  if (key.includes("simul") || key.includes("physics") || key.includes("dynamics")) return STAGE_LOADING_CONFIGS.simulation;
  if (key.includes("test") || key.includes("proving") || key.includes("skidpad")) return STAGE_LOADING_CONFIGS.testing;
  if (key.includes("project") || key.includes("genesis") || key.includes("overview")) return STAGE_LOADING_CONFIGS.project_overview;
  if (key.includes("setting") || key.includes("config") || key.includes("pref") || key.includes("option")) return STAGE_LOADING_CONFIGS.settings;
  if (key.includes("vehicle") || key.includes("chassis") || key.includes("body")) return STAGE_LOADING_CONFIGS.vehicle;

  return STAGE_LOADING_CONFIGS.default;
}
