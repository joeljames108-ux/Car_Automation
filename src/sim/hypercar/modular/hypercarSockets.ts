// ============================================================================
// HYPERCAR MODULAR VEHICLE ASSEMBLY — 22 SOCKET DEFINITIONS & HARDPOINTS
// ============================================================================
// Standardized 3D mm coordinates (X: lateral, Y: vertical, Z: longitudinal)
// where origin (0, 0, 0) is at the ground plane directly below the front axle.
// LMH Prototype Wheelbase: 3,150 mm. Total vehicle length: ~5,000 mm.
// ============================================================================

export type HypercarSocketId =
  | "SOCKET_CENTRAL_MONOCOQUE"      // Full enclosed carbon cockpit tub (0, 420, 1100)
  | "SOCKET_FRONT_CRASH_NOSE"       // Front impact crash attenuator (0, 350, -650)
  | "SOCKET_FRONT_CLAMSHELL"        // Front enclosed bodywork & wheel arches (0, 480, -300)
  | "SOCKET_FRONT_SPLITTER"         // Carbon front splitter & diffuser strakes (0, 90, -950)
  | "SOCKET_FRONT_CANARDS"          // Dual aerodynamic dive planes (-880, 360, -750)
  | "SOCKET_FRONT_HYBRID_MGU"       // 200 kW front-axle electric motor (0, 260, 0)
  | "SOCKET_FRONT_SUSPENSION"       // Front double wishbones & AWD drive linkage (0, 380, 0)
  | "SOCKET_COCKPIT_ENCLOSED"       // Endurance seat, drinks system, display (0, 560, 1150)
  | "SOCKET_WINDSCREEN_ROOF"        // Polycarbonate windscreen & safety canopy (0, 950, 1050)
  | "SOCKET_ROOF_AIR_SCOOP"         // High-velocity periscope ram air scoop (0, 1080, 1550)
  | "SOCKET_SIDE_BODY_L"            // Left sidepod, intercooler & gullwing door (-820, 450, 1550)
  | "SOCKET_SIDE_BODY_R"            // Right sidepod, radiator duct & gullwing door (820, 450, 1550)
  | "SOCKET_FLOOR_UNDERBODY"        // Aerodynamic flat floor & venturi channels (0, 65, 1550)
  | "SOCKET_BATTERY_900V"           // High-voltage 900V liquid-cooled battery (0, 240, 1350)
  | "SOCKET_ICE_POWERTRAIN"         // Twin-turbo V6 / V8 internal combustion engine (0, 440, 2150)
  | "SOCKET_EXHAUST_SYSTEM"         // Top-exit thermal exhaust manifold (0, 720, 2250)
  | "SOCKET_GEARBOX_REAR"           // 7-speed transverse sequential transmission (0, 360, 2800)
  | "SOCKET_REAR_SUSPENSION"        // Rear double wishbones & heave dampers (0, 380, 3150)
  | "SOCKET_DORSAL_SHARK_FIN"       // FIA mandatory longitudinal stability fin (0, 920, 2400)
  | "SOCKET_REAR_WING"              // Swan-neck pylons, mainplane & endplates (0, 980, 3650)
  | "SOCKET_REAR_DIFFUSER"          // Full endurance diffuser tunnels (0, 220, 3400)
  | "SOCKET_WHEELS_BRAKES_FL"       // Front-Left 18-inch wheel & endurance disc (-950, 355, 0)
  | "SOCKET_WHEELS_BRAKES_FR"       // Front-Right 18-inch wheel & endurance disc (950, 355, 0)
  | "SOCKET_WHEELS_BRAKES_RL"       // Rear-Left 18-inch wheel & endurance disc (-950, 355, 3150)
  | "SOCKET_WHEELS_BRAKES_RR";      // Rear-Right 18-inch wheel & endurance disc (950, 355, 3150)

export interface HypercarSocketAnchor {
  id: HypercarSocketId;
  name: string;
  category: "CHASSIS" | "BODYWORK" | "AERO" | "HYBRID_POWERTRAIN" | "COOLING" | "SUSPENSION" | "WHEELS";
  positionMm: [number, number, number];
  normalVector: [number, number, number];
  parentSocketId: HypercarSocketId | null;
  mandatoryForHomologation: boolean;
  description: string;
}

export const HYPERCAR_SOCKET_ANCHORS: Record<HypercarSocketId, HypercarSocketAnchor> = {
  SOCKET_CENTRAL_MONOCOQUE: {
    id: "SOCKET_CENTRAL_MONOCOQUE",
    name: "Enclosed Carbon Survival Monocoque",
    category: "CHASSIS",
    positionMm: [0, 420, 1100],
    normalVector: [0, 1, 0],
    parentSocketId: null,
    mandatoryForHomologation: true,
    description: "FIA-homologated enclosed carbon fiber survival cell with integrated A-pillar & B-pillar roll cages.",
  },
  SOCKET_FRONT_CRASH_NOSE: {
    id: "SOCKET_FRONT_CRASH_NOSE",
    name: "Frontal Impact Absorber",
    category: "CHASSIS",
    positionMm: [0, 350, -650],
    normalVector: [0, 0, -1],
    parentSocketId: "SOCKET_CENTRAL_MONOCOQUE",
    mandatoryForHomologation: true,
    description: "Carbon-aluminum honeycomb crash box meeting FIA 120 kN frontal impact standards.",
  },
  SOCKET_FRONT_CLAMSHELL: {
    id: "SOCKET_FRONT_CLAMSHELL",
    name: "Front Clamshell & Enclosed Arches",
    category: "BODYWORK",
    positionMm: [0, 480, -300],
    normalVector: [0, 1, -0.5],
    parentSocketId: "SOCKET_FRONT_CRASH_NOSE",
    mandatoryForHomologation: true,
    description: "Full-width front bodywork encompassing high-beam endurance headlights and front wheel arches.",
  },
  SOCKET_FRONT_SPLITTER: {
    id: "SOCKET_FRONT_SPLITTER",
    name: "Aerodynamic Front Splitter",
    category: "AERO",
    positionMm: [0, 90, -950],
    normalVector: [0, -1, 0],
    parentSocketId: "SOCKET_FRONT_CLAMSHELL",
    mandatoryForHomologation: true,
    description: "Front aerodynamic splitter generating high-downforce ground suction into the front tunnels.",
  },
  SOCKET_FRONT_CANARDS: {
    id: "SOCKET_FRONT_CANARDS",
    name: "Front Aerodynamic Dive Planes",
    category: "AERO",
    positionMm: [-880, 360, -750],
    normalVector: [-1, 0.5, -0.5],
    parentSocketId: "SOCKET_FRONT_CLAMSHELL",
    mandatoryForHomologation: false,
    description: "Dual carbon canard blades trimming front aerodynamic balance.",
  },
  SOCKET_FRONT_HYBRID_MGU: {
    id: "SOCKET_FRONT_HYBRID_MGU",
    name: "200 kW Front Axle Electric MGU",
    category: "HYBRID_POWERTRAIN",
    positionMm: [0, 260, 0],
    normalVector: [0, -1, 0],
    parentSocketId: "SOCKET_CENTRAL_MONOCOQUE",
    mandatoryForHomologation: true,
    description: "Front-mounted permanent magnet synchronous motor delivering 200 kW e-AWD torque and regenerative braking.",
  },
  SOCKET_FRONT_SUSPENSION: {
    id: "SOCKET_FRONT_SUSPENSION",
    name: "Front AWD Double Wishbones",
    category: "SUSPENSION",
    positionMm: [0, 380, 0],
    normalVector: [0, 1, 0],
    parentSocketId: "SOCKET_CENTRAL_MONOCOQUE",
    mandatoryForHomologation: true,
    description: "Pushrod-actuated front suspension with torsion springs, third heave damper, and AWD driveshafts.",
  },
  SOCKET_COCKPIT_ENCLOSED: {
    id: "SOCKET_COCKPIT_ENCLOSED",
    name: "Cockpit Interior & Display Cluster",
    category: "CHASSIS",
    positionMm: [0, 560, 1150],
    normalVector: [0, 1, 0],
    parentSocketId: "SOCKET_CENTRAL_MONOCOQUE",
    mandatoryForHomologation: true,
    description: "Molded FIA-certified carbon seat, 8.8-inch telemetry HUD display, AC cabin cooling, and hydration pump.",
  },
  SOCKET_WINDSCREEN_ROOF: {
    id: "SOCKET_WINDSCREEN_ROOF",
    name: "Heated Windscreen & Canopy",
    category: "BODYWORK",
    positionMm: [0, 950, 1050],
    normalVector: [0, 1, 0],
    parentSocketId: "SOCKET_CENTRAL_MONOCOQUE",
    mandatoryForHomologation: true,
    description: "Anti-fog heated polycarbonate windscreen with single central aerodynamic wiper blade.",
  },
  SOCKET_ROOF_AIR_SCOOP: {
    id: "SOCKET_ROOF_AIR_SCOOP",
    name: "Periscope Roof Ram-Air Scoop",
    category: "COOLING",
    positionMm: [0, 1080, 1550],
    normalVector: [0, 1, 0],
    parentSocketId: "SOCKET_WINDSCREEN_ROOF",
    mandatoryForHomologation: true,
    description: "High-pressure roof scoop feeding combustion air into the twin turbochargers.",
  },
  SOCKET_SIDE_BODY_L: {
    id: "SOCKET_SIDE_BODY_L",
    name: "Left Sidepod & Radiator Duct",
    category: "BODYWORK",
    positionMm: [-820, 450, 1550],
    normalVector: [-1, 0, 0],
    parentSocketId: "SOCKET_CENTRAL_MONOCOQUE",
    mandatoryForHomologation: true,
    description: "Left sculpted bodywork with high-flow charge air cooler duct and forward-opening dihedral door.",
  },
  SOCKET_SIDE_BODY_R: {
    id: "SOCKET_SIDE_BODY_R",
    name: "Right Sidepod & Oil Cooler Duct",
    category: "BODYWORK",
    positionMm: [820, 450, 1550],
    normalVector: [1, 0, 0],
    parentSocketId: "SOCKET_CENTRAL_MONOCOQUE",
    mandatoryForHomologation: true,
    description: "Right sculpted bodywork with dual water radiator duct and passenger emergency extraction latch.",
  },
  SOCKET_FLOOR_UNDERBODY: {
    id: "SOCKET_FLOOR_UNDERBODY",
    name: "Aerodynamic Flat Floor & Stepped Planks",
    category: "AERO",
    positionMm: [0, 65, 1550],
    normalVector: [0, -1, 0],
    parentSocketId: "SOCKET_CENTRAL_MONOCOQUE",
    mandatoryForHomologation: true,
    description: "Full underbody carbon floor generating low-drag ground effect suction conforming to WEC aero limits.",
  },
  SOCKET_BATTERY_900V: {
    id: "SOCKET_BATTERY_900V",
    name: "900V Liquid-Cooled Battery Pack",
    category: "HYBRID_POWERTRAIN",
    positionMm: [0, 240, 1350],
    normalVector: [0, -1, 0],
    parentSocketId: "SOCKET_CENTRAL_MONOCOQUE",
    mandatoryForHomologation: true,
    description: "Dielectric fluid immersion-cooled 900V battery with 800 kW charge/discharge pulse capability.",
  },
  SOCKET_ICE_POWERTRAIN: {
    id: "SOCKET_ICE_POWERTRAIN",
    name: "3.5L Twin-Turbo V6 Combustion Engine",
    category: "HYBRID_POWERTRAIN",
    positionMm: [0, 440, 2150],
    normalVector: [0, 1, 0],
    parentSocketId: "SOCKET_CENTRAL_MONOCOQUE",
    mandatoryForHomologation: true,
    description: "Bespoke endurance 90-degree twin-turbocharged V6 producing 500 kW (680 HP) to the rear axle.",
  },
  SOCKET_EXHAUST_SYSTEM: {
    id: "SOCKET_EXHAUST_SYSTEM",
    name: "Inconel Top-Exit Exhaust System",
    category: "HYBRID_POWERTRAIN",
    positionMm: [0, 720, 2250],
    normalVector: [0, 1, 0],
    parentSocketId: "SOCKET_ICE_POWERTRAIN",
    mandatoryForHomologation: true,
    description: "Ultra-lightweight ceramic-coated Inconel 625 exhaust manifold venting upward into the rear wake.",
  },
  SOCKET_GEARBOX_REAR: {
    id: "SOCKET_GEARBOX_REAR",
    name: "7-Speed Transverse Sequential Gearbox",
    category: "HYBRID_POWERTRAIN",
    positionMm: [0, 360, 2800],
    normalVector: [0, 0, 1],
    parentSocketId: "SOCKET_ICE_POWERTRAIN",
    mandatoryForHomologation: true,
    description: "Structural magnesium transmission casing with pneumatic paddle-shift actuator and limited-slip diff.",
  },
  SOCKET_REAR_SUSPENSION: {
    id: "SOCKET_REAR_SUSPENSION",
    name: "Rear Multilink Wishbones & Dampers",
    category: "SUSPENSION",
    positionMm: [0, 380, 3150],
    normalVector: [0, 1, 0],
    parentSocketId: "SOCKET_GEARBOX_REAR",
    mandatoryForHomologation: true,
    description: "Rear pushrod-actuated suspension mounting directly to the structural gearbox casing.",
  },
  SOCKET_DORSAL_SHARK_FIN: {
    id: "SOCKET_DORSAL_SHARK_FIN",
    name: "FIA Mandatory Dorsal Shark Fin",
    category: "AERO",
    positionMm: [0, 920, 2400],
    normalVector: [0, 1, 0],
    parentSocketId: "SOCKET_CENTRAL_MONOCOQUE",
    mandatoryForHomologation: true,
    description: "Longitudinal stability fin preventing vehicle airborne rollover in high-yaw slides.",
  },
  SOCKET_REAR_WING: {
    id: "SOCKET_REAR_WING",
    name: "Swan-Neck Adjustable Rear Wing",
    category: "AERO",
    positionMm: [0, 980, 3650],
    normalVector: [0, 1, 1],
    parentSocketId: "SOCKET_GEARBOX_REAR",
    mandatoryForHomologation: true,
    description: "High-aspect carbon rear aerofoil with slotted endplates and adjustable angle-of-attack bracket.",
  },
  SOCKET_REAR_DIFFUSER: {
    id: "SOCKET_REAR_DIFFUSER",
    name: "Long-Throat Rear Diffuser Tunnel",
    category: "AERO",
    positionMm: [0, 220, 3400],
    normalVector: [0, -0.5, 1],
    parentSocketId: "SOCKET_FLOOR_UNDERBODY",
    mandatoryForHomologation: true,
    description: "High-volume carbon diffuser expanding air outward between the rear crash structure.",
  },
  SOCKET_WHEELS_BRAKES_FL: {
    id: "SOCKET_WHEELS_BRAKES_FL",
    name: "Front-Left 18-inch Wheel & Carbon-Ceramic Brake",
    category: "WHEELS",
    positionMm: [-950, 355, 0],
    normalVector: [-1, 0, 0],
    parentSocketId: "SOCKET_FRONT_SUSPENSION",
    mandatoryForHomologation: true,
    description: "Forged magnesium rim, 31/71-18 Michelin endurance radial tire, and 380mm carbon disc.",
  },
  SOCKET_WHEELS_BRAKES_FR: {
    id: "SOCKET_WHEELS_BRAKES_FR",
    name: "Front-Right 18-inch Wheel & Carbon-Ceramic Brake",
    category: "WHEELS",
    positionMm: [950, 355, 0],
    normalVector: [1, 0, 0],
    parentSocketId: "SOCKET_FRONT_SUSPENSION",
    mandatoryForHomologation: true,
    description: "Forged magnesium rim, 31/71-18 Michelin endurance radial tire, and 380mm carbon disc.",
  },
  SOCKET_WHEELS_BRAKES_RL: {
    id: "SOCKET_WHEELS_BRAKES_RL",
    name: "Rear-Left 18-inch Wheel & Carbon-Ceramic Brake",
    category: "WHEELS",
    positionMm: [-950, 355, 3150],
    normalVector: [-1, 0, 0],
    parentSocketId: "SOCKET_REAR_SUSPENSION",
    mandatoryForHomologation: true,
    description: "Forged magnesium rim, 31/71-18 Michelin endurance radial tire, and 355mm carbon disc.",
  },
  SOCKET_WHEELS_BRAKES_RR: {
    id: "SOCKET_WHEELS_BRAKES_RR",
    name: "Rear-Right 18-inch Wheel & Carbon-Ceramic Brake",
    category: "WHEELS",
    positionMm: [950, 355, 3150],
    normalVector: [1, 0, 0],
    parentSocketId: "SOCKET_REAR_SUSPENSION",
    mandatoryForHomologation: true,
    description: "Forged magnesium rim, 31/71-18 Michelin endurance radial tire, and 355mm carbon disc.",
  },
};
