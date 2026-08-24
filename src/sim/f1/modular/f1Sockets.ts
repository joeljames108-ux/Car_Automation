// ============================================================================
// F1 MODULAR VEHICLE ASSEMBLY — SOCKET DEFINITIONS & ANCHORS
// ============================================================================
// Standardized 3D mm coordinates (X: lateral, Y: vertical, Z: longitudinal)
// where origin (0, 0, 0) is at the ground level directly below the front axle.
// Positive X is car-right, positive Y is upward, positive Z is rearward.
// ============================================================================

import * as THREE from "three";

export type F1SocketId =
  | "SOCKET_SURVIVAL_CELL"          // Root chassis anchor (0, 300, 900)
  | "SOCKET_NOSE_CONE"              // Front crash attenuator (0, 320, -700)
  | "SOCKET_FRONT_WING"             // Front wing mainplane (0, 120, -1350)
  | "SOCKET_HALO"                   // Titanium Halo safety frame (0, 720, 950)
  | "SOCKET_COCKPIT_TRIM"           // Steering wheel, pedals, PDU display (0, 520, 850)
  | "SOCKET_SUSPENSION_FL"          // Front-Left double wishbones (-450, 360, 0)
  | "SOCKET_SUSPENSION_FR"          // Front-Right double wishbones (450, 360, 0)
  | "SOCKET_FLOOR_UNDERBODY"        // Venturi tunnels & ground effect floor (0, 75, 1400)
  | "SOCKET_SIDEPOD_L"              // Left sidepod & radiator duct (-650, 340, 1200)
  | "SOCKET_SIDEPOD_R"              // Right sidepod & radiator duct (650, 340, 1200)
  | "SOCKET_POWER_UNIT"             // 1.6L V6 ICE + Turbo + MGU-K/H (0, 380, 1950)
  | "SOCKET_GEARBOX"                // 8-speed structural transmission (0, 350, 2750)
  | "SOCKET_SUSPENSION_RL"          // Rear-Left double wishbones (-450, 360, 3600)
  | "SOCKET_SUSPENSION_RR"          // Rear-Right double wishbones (450, 360, 3600)
  | "SOCKET_REAR_DIFFUSER"          // Rear floor diffuser expansion (0, 200, 3550)
  | "SOCKET_REAR_WING"              // Rear wing pylons, mainplane & DRS (0, 850, 3750)
  | "SOCKET_WHEEL_FL"               // Front-Left 18-inch wheel & brake (-900, 360, 0)
  | "SOCKET_WHEEL_FR"               // Front-Right 18-inch wheel & brake (900, 360, 0)
  | "SOCKET_WHEEL_RL"               // Rear-Left 18-inch wheel & brake (-900, 360, 3600)
  | "SOCKET_WHEEL_RR";              // Rear-Right 18-inch wheel & brake (900, 360, 3600)

export interface F1SocketAnchor {
  id: F1SocketId;
  name: string;
  category: "CHASSIS" | "AERO" | "POWERTRAIN" | "SUSPENSION" | "WHEELS";
  positionMm: [number, number, number]; // [x, y, z] in mm
  normalVector: [number, number, number]; // Exploded translation direction
  parentSocketId: F1SocketId | null;
  mandatoryForHomologation: boolean;
  description: string;
}

export const F1_SOCKET_ANCHORS: Record<F1SocketId, F1SocketAnchor> = {
  SOCKET_SURVIVAL_CELL: {
    id: "SOCKET_SURVIVAL_CELL",
    name: "Carbon Monocoque Survival Cell",
    category: "CHASSIS",
    positionMm: [0, 300, 1100],
    normalVector: [0, 1, 0],
    parentSocketId: null,
    mandatoryForHomologation: true,
    description: "Primary structural backbone and FIA crash-tested driver cell.",
  },
  SOCKET_NOSE_CONE: {
    id: "SOCKET_NOSE_CONE",
    name: "Front Nose Cone Attenuator",
    category: "CHASSIS",
    positionMm: [0, 320, -700],
    normalVector: [0, 0, -1],
    parentSocketId: "SOCKET_SURVIVAL_CELL",
    mandatoryForHomologation: true,
    description: "Frontal crash absorption structure and front wing mounting point.",
  },
  SOCKET_FRONT_WING: {
    id: "SOCKET_FRONT_WING",
    name: "Front Wing Assembly & Outwash Flaps",
    category: "AERO",
    positionMm: [0, 120, -1350],
    normalVector: [0, 0, -1],
    parentSocketId: "SOCKET_NOSE_CONE",
    mandatoryForHomologation: true,
    description: "4-element front wing generating downforce and outwash vortex conditioning.",
  },
  SOCKET_HALO: {
    id: "SOCKET_HALO",
    name: "Titanium Halo Cockpit Protection",
    category: "CHASSIS",
    positionMm: [0, 720, 950],
    normalVector: [0, 1, 0],
    parentSocketId: "SOCKET_SURVIVAL_CELL",
    mandatoryForHomologation: true,
    description: "FIA Standard 8869-2018 grade-5 titanium driver protection ring.",
  },
  SOCKET_COCKPIT_TRIM: {
    id: "SOCKET_COCKPIT_TRIM",
    name: "Cockpit Interior & OLED Steering Wheel",
    category: "CHASSIS",
    positionMm: [0, 520, 850],
    normalVector: [0, 1, 0],
    parentSocketId: "SOCKET_SURVIVAL_CELL",
    mandatoryForHomologation: true,
    description: "Ergonomic 3D molded seat, quick-release steering wheel, and pedals.",
  },
  SOCKET_SUSPENSION_FL: {
    id: "SOCKET_SUSPENSION_FL",
    name: "Front-Left Suspension Wishbones",
    category: "SUSPENSION",
    positionMm: [-450, 360, 0],
    normalVector: [-1, 0, 0],
    parentSocketId: "SOCKET_SURVIVAL_CELL",
    mandatoryForHomologation: true,
    description: "Front-left double wishbone pushrod/pullrod kinematic linkage.",
  },
  SOCKET_SUSPENSION_FR: {
    id: "SOCKET_SUSPENSION_FR",
    name: "Front-Right Suspension Wishbones",
    category: "SUSPENSION",
    positionMm: [450, 360, 0],
    normalVector: [1, 0, 0],
    parentSocketId: "SOCKET_SURVIVAL_CELL",
    mandatoryForHomologation: true,
    description: "Front-right double wishbone pushrod/pullrod kinematic linkage.",
  },
  SOCKET_FLOOR_UNDERBODY: {
    id: "SOCKET_FLOOR_UNDERBODY",
    name: "Venturi Ground Effect Floor & Fences",
    category: "AERO",
    positionMm: [0, 75, 1800],
    normalVector: [0, -1, 0],
    parentSocketId: "SOCKET_SURVIVAL_CELL",
    mandatoryForHomologation: true,
    description: "Underbody venturi tunnels generating over 60% of total vehicle downforce.",
  },
  SOCKET_SIDEPOD_L: {
    id: "SOCKET_SIDEPOD_L",
    name: "Left Sidepod & Radiator Intake",
    category: "AERO",
    positionMm: [-650, 340, 1650],
    normalVector: [-1, 0, 0],
    parentSocketId: "SOCKET_SURVIVAL_CELL",
    mandatoryForHomologation: true,
    description: "Left aerodynamic downwash ramp and thermal heat exchanger ducting.",
  },
  SOCKET_SIDEPOD_R: {
    id: "SOCKET_SIDEPOD_R",
    name: "Right Sidepod & Radiator Intake",
    category: "AERO",
    positionMm: [650, 340, 1650],
    normalVector: [1, 0, 0],
    parentSocketId: "SOCKET_SURVIVAL_CELL",
    mandatoryForHomologation: true,
    description: "Right aerodynamic downwash ramp and intercooler ducting.",
  },
  SOCKET_POWER_UNIT: {
    id: "SOCKET_POWER_UNIT",
    name: "1.6L V6 Turbo-Hybrid Power Unit",
    category: "POWERTRAIN",
    positionMm: [0, 380, 2150],
    normalVector: [0, 1, 0],
    parentSocketId: "SOCKET_SURVIVAL_CELL",
    mandatoryForHomologation: true,
    description: "Internal combustion V6 engine, turbocharger, MGU-K, MGU-H, and battery.",
  },
  SOCKET_GEARBOX: {
    id: "SOCKET_GEARBOX",
    name: "8-Speed Seamless Structural Transmission",
    category: "POWERTRAIN",
    positionMm: [0, 350, 2900],
    normalVector: [0, 0, 1],
    parentSocketId: "SOCKET_POWER_UNIT",
    mandatoryForHomologation: true,
    description: "Carbon monocoque casing housing 8 forward gears and active limited slip differential.",
  },
  SOCKET_SUSPENSION_RL: {
    id: "SOCKET_SUSPENSION_RL",
    name: "Rear-Left Suspension Wishbones",
    category: "SUSPENSION",
    positionMm: [-450, 360, 3600],
    normalVector: [-1, 0, 0],
    parentSocketId: "SOCKET_GEARBOX",
    mandatoryForHomologation: true,
    description: "Rear-left wishbones mounting to the structural gearbox casing.",
  },
  SOCKET_SUSPENSION_RR: {
    id: "SOCKET_SUSPENSION_RR",
    name: "Rear-Right Suspension Wishbones",
    category: "SUSPENSION",
    positionMm: [450, 360, 3600],
    normalVector: [1, 0, 0],
    parentSocketId: "SOCKET_GEARBOX",
    mandatoryForHomologation: true,
    description: "Rear-right wishbones mounting to the structural gearbox casing.",
  },
  SOCKET_REAR_DIFFUSER: {
    id: "SOCKET_REAR_DIFFUSER",
    name: "Rear Diffuser Expansion Tunnel",
    category: "AERO",
    positionMm: [0, 200, 3550],
    normalVector: [0, -0.5, 1],
    parentSocketId: "SOCKET_FLOOR_UNDERBODY",
    mandatoryForHomologation: true,
    description: "High-aspect vertical strakes expanding underfloor airflow into low-pressure wake.",
  },
  SOCKET_REAR_WING: {
    id: "SOCKET_REAR_WING",
    name: "Rear Wing, Beam Wing & DRS Flap",
    category: "AERO",
    positionMm: [0, 850, 3750],
    normalVector: [0, 1, 1],
    parentSocketId: "SOCKET_GEARBOX",
    mandatoryForHomologation: true,
    description: "Upper rear wing assembly with 85mm hydraulic DRS actuator.",
  },
  SOCKET_WHEEL_FL: {
    id: "SOCKET_WHEEL_FL",
    name: "Front-Left Wheel, Tire & Carbon Brake",
    category: "WHEELS",
    positionMm: [-900, 360, 0],
    normalVector: [-1, 0, 0],
    parentSocketId: "SOCKET_SUSPENSION_FL",
    mandatoryForHomologation: true,
    description: "18-inch forged magnesium rim, Pirelli P-Zero tire, and 1050-hole carbon disc.",
  },
  SOCKET_WHEEL_FR: {
    id: "SOCKET_WHEEL_FR",
    name: "Front-Right Wheel, Tire & Carbon Brake",
    category: "WHEELS",
    positionMm: [900, 360, 0],
    normalVector: [1, 0, 0],
    parentSocketId: "SOCKET_SUSPENSION_FR",
    mandatoryForHomologation: true,
    description: "18-inch forged magnesium rim, Pirelli P-Zero tire, and 1050-hole carbon disc.",
  },
  SOCKET_WHEEL_RL: {
    id: "SOCKET_WHEEL_RL",
    name: "Rear-Left Wheel, Tire & Carbon Brake",
    category: "WHEELS",
    positionMm: [-900, 360, 3600],
    normalVector: [-1, 0, 0],
    parentSocketId: "SOCKET_SUSPENSION_RL",
    mandatoryForHomologation: true,
    description: "18-inch forged magnesium rim, wide Pirelli P-Zero tire, and BBW brake caliper.",
  },
  SOCKET_WHEEL_RR: {
    id: "SOCKET_WHEEL_RR",
    name: "Rear-Right Wheel, Tire & Carbon Brake",
    category: "WHEELS",
    positionMm: [900, 360, 3600],
    normalVector: [1, 0, 0],
    parentSocketId: "SOCKET_SUSPENSION_RR",
    mandatoryForHomologation: true,
    description: "18-inch forged magnesium rim, wide Pirelli P-Zero tire, and BBW brake caliper.",
  },
};
