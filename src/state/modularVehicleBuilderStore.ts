import { create } from "zustand";
import {
  VehicleBodyTypeId,
  VanSeatConfig,
  CommercialBodyType,
} from "../sim/modularVehicle/types";

export type VehicleModelCategory = VehicleBodyTypeId;

export type AssemblyStage =
  | "model_select" // Image 1: Front Page
  | "chassis" // Image 2: Chassis
  | "engine"
  | "gearbox"
  | "suspension" // Image 3: Suspension Studio
  | "brakes"
  | "wheels"
  | "body_framework"
  | "exterior_panels"
  | "lighting_glass"
  | "complete";

export type PartCategory = AssemblyStage | "aerodynamics" | "interior";

export interface StageDefinition {
  id: AssemblyStage;
  label: string;
  subsystemTitle: string;
  glbFilename: string;
  description: string;
  subComponents: string[];
}

export const ASSEMBLY_STAGES: StageDefinition[] = [
  {
    id: "chassis",
    label: "Chassis",
    subsystemTitle: "CHASSIS & STRUCTURAL PLATFORM",
    glbFilename: "chassis_sedan.glb", // dynamic based on model
    description: "Core longitudinal rails, subframe mounting cradles, battery/floor tub, and suspension hardpoints.",
    subComponents: ["Main Frame Rails", "Front Subframe Cradle", "Rear Carrier", "Floor Structural Pan"],
  },
  {
    id: "engine",
    label: "Engine",
    subsystemTitle: "POWERTRAIN: V8 TWIN-TURBO",
    glbFilename: "powertrain_engine.glb",
    description: "90° V8 engine block, twin mirror-image turbochargers, dry-sump lubrication, and carbon intake plenum.",
    subComponents: ["Aluminum Block & Heads", "Twin Turbochargers", "Inconel Manifolds", "Carbon Intake Plenum"],
  },
  {
    id: "gearbox",
    label: "Gearbox",
    subsystemTitle: "TRANSMISSION & DRIVETRAIN",
    glbFilename: "powertrain_gearbox.glb",
    description: "7-Speed Dual-Clutch transaxle, electro-hydraulic valve body, differential flanges, and carbon driveshaft.",
    subComponents: ["DCT Bellhousing & Clutch", "Gear Stack & Casing", "Rear Output Flanges", "Driveshaft"],
  },
  {
    id: "suspension",
    label: "Suspension",
    subsystemTitle: "SUSPENSION & STEERING KINEMATICS",
    glbFilename: "suspension_front.glb",
    description: "Front & Rear double-wishbone geometry with forged aluminum A-arms, coilover dampers, and tubular anti-roll bars.",
    subComponents: ["Lower A-Arms", "Upper Wishbones", "Coilover Damper Springs", "Tubular Anti-Roll Bar"],
  },
  {
    id: "brakes",
    label: "Brakes",
    subsystemTitle: "BRAKING SYSTEM",
    glbFilename: "brakes_assembly.glb",
    description: "410mm front / 390mm rear carbon-ceramic ventilated cross-drilled rotors with 6-piston monobloc calipers.",
    subComponents: ["Carbon-Ceramic Rotors", "6-Piston Monobloc Calipers", "Hydraulic Braided Lines", "Brake Hats"],
  },
  {
    id: "wheels",
    label: "Wheels",
    subsystemTitle: "WHEELS & PERFORMANCE TIRES",
    glbFilename: "wheels_assembly.glb",
    description: "20-inch diamond-cut forged lightweight alloy wheels wrapped in ultra-high-performance semi-slick rubber.",
    subComponents: ["Diamond-Cut Forged Rims", "Semi-Slick Tires (265/35R20)", "Centerlock Hub Caps", "TPMS Sensors"],
  },
  {
    id: "body_framework",
    label: "Body Framework",
    subsystemTitle: "BODY-IN-WHITE (BIW) FRAMEWORK",
    glbFilename: "body_framework_biw.glb",
    description: "Structural passenger safety cell with extruded aluminum A/B/C-pillars, roof hoop, and front/rear crash boxes.",
    subComponents: ["A-Pillars & B-Pillars", "Roof Cantrail Beams", "Windshield Cowl", "Front/Rear Crash Beams"],
  },
  {
    id: "exterior_panels",
    label: "Exterior Panels",
    subsystemTitle: "EXTERIOR BODYWORK & PANELS",
    glbFilename: "exterior_panels.glb",
    description: "Class-A exterior body skin panels including front hood, front/rear bumpers, side doors, and quarter panels.",
    subComponents: ["Sculpted Hood", "Front & Rear Bumper Covers", "Side Doors (L & R)", "Rear Quarter Panels"],
  },
  {
    id: "lighting_glass",
    label: "Lighting & Glass",
    subsystemTitle: "OPTICAL LIGHTING & ACOUSTIC GLAZING",
    glbFilename: "lighting_glass.glb",
    description: "Matrix LED projector headlights, full-width OLED taillight bar, and acoustic laminated privacy glass.",
    subComponents: ["Matrix LED Headlights", "OLED Taillight Lightbar", "Raked Windshield", "Side & Rear Glass"],
  },
];

export interface ModularPartItem {
  id: string;
  name: string;
  category: PartCategory;
  glbFilename: string;
  offset: [number, number, number];
  massKg: number;
  material: string;
}

export const MODULAR_CAR_PARTS: ModularPartItem[] = [
  // CHASSIS
  { id: "chassis_main", name: "Main Longitudinal Box Rails", category: "chassis", glbFilename: "chassis_main.glb", offset: [0, 0, 0], massKg: 110.0, material: "High-Strength Steel" },
  { id: "front_subframe", name: "Front Engine & Suspension Cradle", category: "chassis", glbFilename: "front_subframe.glb", offset: [0, 0.35, 0.1], massKg: 32.0, material: "Extruded Aluminum" },
  { id: "rear_subframe", name: "Rear Differential Carrier Cradle", category: "chassis", glbFilename: "rear_subframe.glb", offset: [0, -0.35, 0.1], massKg: 34.0, material: "Extruded Aluminum" },
  { id: "floor_structure", name: "Floor Tub & Center Tunnel", category: "chassis", glbFilename: "floor_structure.glb", offset: [0, 0, -0.15], massKg: 45.0, material: "Formed Steel" },
  { id: "firewall", name: "Cabin Firewall Bulkhead", category: "chassis", glbFilename: "firewall.glb", offset: [0, 0.2, 0.2], massKg: 18.0, material: "Acoustic Steel" },
  { id: "crash_structure_front", name: "Front Honeycomb Crash Boxes", category: "chassis", glbFilename: "crash_structure_front.glb", offset: [0, 0.6, 0.05], massKg: 14.0, material: "Aerospace Aluminum" },
  { id: "crash_structure_rear", name: "Rear Impact Attenuators", category: "chassis", glbFilename: "crash_structure_rear.glb", offset: [0, -0.6, 0.05], massKg: 12.0, material: "Aerospace Aluminum" },

  // BODY FRAMEWORK (BIW)
  { id: "body_framework", name: "Monocoque Structural Sills", category: "body_framework", glbFilename: "body_framework.glb", offset: [0, 0, 0.2], massKg: 52.0, material: "Boron Steel" },
  { id: "roof_structure", name: "Roof Cantrail Frame & Cross-Bows", category: "body_framework", glbFilename: "roof_structure.glb", offset: [0, 0, 0.45], massKg: 28.0, material: "Extruded Aluminum" },
  { id: "a_pillar", name: "Hydroformed A-Pillars", category: "body_framework", glbFilename: "a_pillar.glb", offset: [0, 0.3, 0.4], massKg: 16.0, material: "Martensitic Steel" },
  { id: "b_pillar", name: "Reinforced B-Pillars", category: "body_framework", glbFilename: "b_pillar.glb", offset: [0, 0, 0.35], massKg: 18.0, material: "Hot-Stamped Boron" },
  { id: "c_pillar", name: "Sweeping C-Pillar Trusses", category: "body_framework", glbFilename: "c_pillar.glb", offset: [0, -0.3, 0.4], massKg: 20.0, material: "High-Yield Steel" },
  { id: "rear_structure", name: "Rear Strut Tower Tie Bar", category: "body_framework", glbFilename: "rear_structure.glb", offset: [0, -0.4, 0.25], massKg: 15.0, material: "Aluminum Alloy" },
  { id: "wheelhouse_front", name: "Front Inner Wheel Arches", category: "body_framework", glbFilename: "wheelhouse_front.glb", offset: [0, 0.3, 0.15], massKg: 14.0, material: "Formed Steel" },
  { id: "wheelhouse_rear", name: "Rear Inner Wheel Tubs", category: "body_framework", glbFilename: "wheelhouse_rear.glb", offset: [0, -0.3, 0.15], massKg: 16.0, material: "Formed Steel" },

  // EXTERIOR PANELS
  { id: "hood", name: "Vented Aerodynamic Hood", category: "exterior_panels", glbFilename: "hood.glb", offset: [0, 0.4, 0.55], massKg: 11.5, material: "Superformed Aluminum" },
  { id: "front_left_fender", name: "Front Left Fender Arch", category: "exterior_panels", glbFilename: "front_left_fender.glb", offset: [0.45, 0.35, 0.25], massKg: 4.8, material: "Aluminum Alloy" },
  { id: "front_right_fender", name: "Front Right Fender Arch", category: "exterior_panels", glbFilename: "front_right_fender.glb", offset: [-0.45, 0.35, 0.25], massKg: 4.8, material: "Aluminum Alloy" },
  { id: "front_bumper", name: "Front Fascia & Bumper Cover", category: "exterior_panels", glbFilename: "front_bumper.glb", offset: [0, 0.75, 0.15], massKg: 8.5, material: "SMC Composite" },
  { id: "rear_bumper", name: "Rear Bumper Cover", category: "exterior_panels", glbFilename: "rear_bumper.glb", offset: [0, -0.75, 0.15], massKg: 8.2, material: "SMC Composite" },
  { id: "front_left_door", name: "Front Left Door Shell", category: "exterior_panels", glbFilename: "front_left_door.glb", offset: [0.55, 0.1, 0.15], massKg: 14.0, material: "Aluminum Alloy" },
  { id: "front_right_door", name: "Front Right Door Shell", category: "exterior_panels", glbFilename: "front_right_door.glb", offset: [-0.55, 0.1, 0.15], massKg: 14.0, material: "Aluminum Alloy" },
  { id: "rear_left_door", name: "Rear Left Door Shell", category: "exterior_panels", glbFilename: "rear_left_door.glb", offset: [0.55, -0.25, 0.15], massKg: 12.5, material: "Aluminum Alloy" },
  { id: "rear_right_door", name: "Rear Right Door Shell", category: "exterior_panels", glbFilename: "rear_right_door.glb", offset: [-0.55, -0.25, 0.15], massKg: 12.5, material: "Aluminum Alloy" },
  { id: "roof_panel", name: "Double-Bubble Carbon Roof", category: "exterior_panels", glbFilename: "roof_panel.glb", offset: [0, 0, 0.65], massKg: 6.2, material: "3K Prepreg Carbon" },
  { id: "trunk", name: "Aerodynamic Trunk Decklid", category: "exterior_panels", glbFilename: "trunk.glb", offset: [0, -0.5, 0.45], massKg: 8.0, material: "Superformed Aluminum" },
  { id: "rear_quarter_left", name: "Rear Left Quarter Panel", category: "exterior_panels", glbFilename: "rear_quarter_left.glb", offset: [0.45, -0.4, 0.25], massKg: 7.5, material: "Steel Skin" },
  { id: "rear_quarter_right", name: "Rear Right Quarter Panel", category: "exterior_panels", glbFilename: "rear_quarter_right.glb", offset: [-0.45, -0.4, 0.25], massKg: 7.5, material: "Steel Skin" },
  { id: "grille", name: "Hexagonal Radiator Grille", category: "exterior_panels", glbFilename: "grille.glb", offset: [0, 0.8, 0.2], massKg: 1.8, material: "Carbon Fiber" },
  { id: "mirror_left", name: "Driver Aerodynamic Mirror", category: "exterior_panels", glbFilename: "mirror_left.glb", offset: [0.65, 0.15, 0.4], massKg: 1.2, material: "Carbon Fiber" },
  { id: "mirror_right", name: "Passenger Aerodynamic Mirror", category: "exterior_panels", glbFilename: "mirror_right.glb", offset: [-0.65, 0.15, 0.4], massKg: 1.2, material: "Carbon Fiber" },

  // LIGHTING
  { id: "headlamp_left", name: "Left Matrix LED Projector", category: "lighting_glass", glbFilename: "headlamp_left.glb", offset: [0.35, 0.7, 0.3], massKg: 2.8, material: "Optical Quartz / LED" },
  { id: "headlamp_right", name: "Right Matrix LED Projector", category: "lighting_glass", glbFilename: "headlamp_right.glb", offset: [-0.35, 0.7, 0.3], massKg: 2.8, material: "Optical Quartz / LED" },
  { id: "tail_lamp_left", name: "Left 3D OLED Tail Lamp", category: "lighting_glass", glbFilename: "tail_lamp_left.glb", offset: [0.35, -0.7, 0.35], massKg: 2.4, material: "OLED Emitter" },
  { id: "tail_lamp_right", name: "Right 3D OLED Tail Lamp", category: "lighting_glass", glbFilename: "tail_lamp_right.glb", offset: [-0.35, -0.7, 0.35], massKg: 2.4, material: "OLED Emitter" },
  { id: "brake_light", name: "Center High-Mount Stop Lamp", category: "lighting_glass", glbFilename: "brake_light.glb", offset: [0, -0.5, 0.6], massKg: 0.6, material: "Red Micro-LED" },
  { id: "indicators", name: "Sequential Turn Signal Strips", category: "lighting_glass", glbFilename: "indicators.glb", offset: [0, 0.75, 0.2], massKg: 0.8, material: "Amber LED Guide" },

  // GLASS
  { id: "windshield", name: "Acoustic Raked Windshield", category: "lighting_glass", glbFilename: "windshield.glb", offset: [0, 0.15, 0.55], massKg: 14.5, material: "Laminated Safety Glass" },
  { id: "side_window_front_left", name: "Front Left Tempered Glass", category: "lighting_glass", glbFilename: "side_window_front_left.glb", offset: [0.55, 0.1, 0.45], massKg: 4.2, material: "Tempered Drop Glass" },
  { id: "side_window_front_right", name: "Front Right Tempered Glass", category: "lighting_glass", glbFilename: "side_window_front_right.glb", offset: [-0.55, 0.1, 0.45], massKg: 4.2, material: "Tempered Drop Glass" },
  { id: "side_window_rear_left", name: "Rear Left Passenger Glass", category: "lighting_glass", glbFilename: "side_window_rear_left.glb", offset: [0.55, -0.25, 0.45], massKg: 3.8, material: "Tempered Privacy Glass" },
  { id: "side_window_rear_right", name: "Rear Right Passenger Glass", category: "lighting_glass", glbFilename: "side_window_rear_right.glb", offset: [-0.55, -0.25, 0.45], massKg: 3.8, material: "Tempered Privacy Glass" },
  { id: "rear_glass", name: "Defroster Heated Rear Window", category: "lighting_glass", glbFilename: "rear_glass.glb", offset: [0, -0.45, 0.55], massKg: 11.0, material: "Curved Laminated Glass" },

  // AERODYNAMICS
  { id: "front_splitter", name: "Track Splitter & Endplates", category: "aerodynamics", glbFilename: "front_splitter.glb", offset: [0, 0.8, -0.2], massKg: 6.8, material: "Carbon Composite" },
  { id: "front_canard", name: "Dual Curved Dive Planes", category: "aerodynamics", glbFilename: "front_canard.glb", offset: [0, 0.7, 0.1], massKg: 1.4, material: "Dry Carbon" },
  { id: "side_skirt", name: "Ground-Effect Rocker Blades", category: "aerodynamics", glbFilename: "side_skirt.glb", offset: [0, 0, -0.15], massKg: 5.5, material: "Autoclaved Carbon" },
  { id: "diffuser", name: "5-Strake Venturi Diffuser", category: "aerodynamics", glbFilename: "diffuser.glb", offset: [0, -0.75, -0.2], massKg: 7.2, material: "Carbon Fiber" },
  { id: "rear_wing", name: "Swan-Neck Track GT Wing", category: "aerodynamics", glbFilename: "rear_wing.glb", offset: [0, -0.7, 0.65], massKg: 5.4, material: "Prepreg Carbon" },
  { id: "rear_spoiler", name: "Decklid Ducktail Gurney Lip", category: "aerodynamics", glbFilename: "rear_spoiler.glb", offset: [0, -0.6, 0.4], massKg: 1.6, material: "Carbon Fiber" },
  { id: "active_aero", name: "Active Motorized Louvers", category: "aerodynamics", glbFilename: "active_aero.glb", offset: [0, 0.7, 0.05], massKg: 3.2, material: "Carbon / Actuator" },
  { id: "underbody_panel", name: "Full Flat Underfloor Undertray", category: "aerodynamics", glbFilename: "underbody_panel.glb", offset: [0, 0, -0.3], massKg: 12.0, material: "Thermoformed Carbon" },

  // INTERIOR
  { id: "dashboard", name: "Leather Dashboard & Air Vents", category: "interior", glbFilename: "dashboard.glb", offset: [0, 0.2, 0.3], massKg: 18.0, material: "Nappa Leather / ABS" },
  { id: "steering_wheel", name: "Sports Wheel & Paddles", category: "interior", glbFilename: "steering_wheel.glb", offset: [0.2, 0.1, 0.3], massKg: 3.2, material: "Leather / Magnesium" },
  { id: "seats", name: "Carbon Bolstered Bucket Seats", category: "interior", glbFilename: "seats.glb", offset: [0, 0, 0.2], massKg: 24.0, material: "Alcantara / Carbon" },
  { id: "center_console", name: "Bridge Console & Controls", category: "interior", glbFilename: "center_console.glb", offset: [0, 0.05, 0.15], massKg: 8.5, material: "Piano Black / Billet" },
  { id: "door_panels", name: "Molded Interior Door Cards", category: "interior", glbFilename: "door_panels.glb", offset: [0.4, 0, 0.2], massKg: 12.0, material: "Stitched Leather" },
  { id: "instrument_cluster", name: "Digital Driver Binnacle", category: "interior", glbFilename: "instrument_cluster.glb", offset: [0.2, 0.15, 0.35], massKg: 2.5, material: "OLED Display" },
  { id: "infotainment", name: "Floating Infotainment Screen", category: "interior", glbFilename: "infotainment.glb", offset: [0, 0.15, 0.35], massKg: 2.2, material: "Glass Touchscreen" },

  // POWERTRAIN
  { id: "engine_block", name: "V8 90° Alloy Engine Block", category: "engine", glbFilename: "engine_block.glb", offset: [0, 0.45, 0.15], massKg: 85.0, material: "Silitec Cast Aluminum" },
  { id: "cylinder_heads", name: "DOHC 32V Heads & Red Covers", category: "engine", glbFilename: "cylinder_heads.glb", offset: [0, 0.45, 0.35], massKg: 38.0, material: "Aluminum / Magnesium" },
  { id: "intake_plenum", name: "Carbon-Fiber Dual Plenum", category: "engine", glbFilename: "intake_plenum.glb", offset: [0, 0.45, 0.48], massKg: 6.5, material: "Autoclaved Carbon" },
  { id: "exhaust_headers", name: "Mandrel Equal-Length Inconel", category: "engine", glbFilename: "exhaust_headers.glb", offset: [0, 0.45, 0.05], massKg: 12.0, material: "Inconel 625" },
  { id: "turbochargers", name: "Twin Mirror-Image Turbos", category: "engine", glbFilename: "turbochargers.glb", offset: [0, 0.35, 0.15], massKg: 18.0, material: "Nickel-Alloy / Titanium" },

  // GEARBOX
  { id: "transmission", name: "7-Speed Dual-Clutch Transaxle", category: "gearbox", glbFilename: "transmission.glb", offset: [0, -0.25, 0.15], massKg: 68.0, material: "Die-Cast Aluminum" },
  { id: "driveshaft", name: "Balanced Carbon Driveshaft", category: "gearbox", glbFilename: "driveshaft.glb", offset: [0, -0.45, 0.1], massKg: 7.2, material: "Filament Carbon" },
  { id: "differential", name: "Electronic LSD Differential", category: "gearbox", glbFilename: "differential.glb", offset: [0, -0.65, 0.1], massKg: 26.0, material: "Cast Steel Casing" },

  // SUSPENSION
  { id: "suspension_wishbones_front", name: "Front Upper & Lower A-Arms", category: "suspension", glbFilename: "suspension_wishbones_front.glb", offset: [0, 0.3, -0.2], massKg: 18.0, material: "Forged 6061-T6" },
  { id: "suspension_wishbones_rear", name: "Rear 5-Link Kinematics", category: "suspension", glbFilename: "suspension_wishbones_rear.glb", offset: [0, -0.3, -0.2], massKg: 20.0, material: "Forged 6061-T6" },
  { id: "coilovers", name: "Adjustable Monotube Coilovers", category: "suspension", glbFilename: "coilovers.glb", offset: [0, 0, 0.15], massKg: 14.0, material: "Chromoly / Titanium" },
  { id: "antiroll_bars", name: "Front & Rear Tubular Sway Bars", category: "suspension", glbFilename: "antiroll_bars.glb", offset: [0, 0, -0.15], massKg: 8.5, material: "Spring Steel" },
  { id: "steering_rack", name: "EPAS Steering Rack & Tie-Rods", category: "suspension", glbFilename: "steering_rack.glb", offset: [0, 0.45, -0.1], massKg: 11.0, material: "Billet Aluminum" },

  // BRAKES
  { id: "brake_rotors_front", name: "410mm CCM Front Ventilated Rotors", category: "brakes", glbFilename: "brake_rotors_front.glb", offset: [0.4, 0.3, 0], massKg: 13.0, material: "Carbon Ceramic Matrix" },
  { id: "brake_rotors_rear", name: "390mm CCM Rear Ventilated Rotors", category: "brakes", glbFilename: "brake_rotors_rear.glb", offset: [0.4, -0.3, 0], massKg: 11.0, material: "Carbon Ceramic Matrix" },
  { id: "brake_calipers", name: "Monobloc 6-Piston / 4-Piston Calipers", category: "brakes", glbFilename: "brake_calipers.glb", offset: [0.5, 0, 0.1], massKg: 14.0, material: "Forged Monobloc" },

  // WHEELS
  { id: "wheel_rim_fl", name: "20x9.5 Front Left Forged Rim", category: "wheels", glbFilename: "wheel_rim_fl.glb", offset: [0.65, 0.3, 0], massKg: 8.8, material: "Forged 6061 Aluminum" },
  { id: "tire_fl", name: "265/35R20 Front Left Semi-Slick", category: "wheels", glbFilename: "tire_fl.glb", offset: [0.85, 0.3, 0], massKg: 10.2, material: "Ultra-High Perf Rubber" },
  { id: "wheel_rim_fr", name: "20x9.5 Front Right Forged Rim", category: "wheels", glbFilename: "wheel_rim_fr.glb", offset: [-0.65, 0.3, 0], massKg: 8.8, material: "Forged 6061 Aluminum" },
  { id: "tire_fr", name: "265/35R20 Front Right Semi-Slick", category: "wheels", glbFilename: "tire_fr.glb", offset: [-0.85, 0.3, 0], massKg: 10.2, material: "Ultra-High Perf Rubber" },
  { id: "wheel_rim_rl", name: "20x11 Rear Left Forged Rim", category: "wheels", glbFilename: "wheel_rim_rl.glb", offset: [0.65, -0.3, 0], massKg: 9.8, material: "Forged 6061 Aluminum" },
  { id: "tire_rl", name: "305/30R20 Rear Left Semi-Slick", category: "wheels", glbFilename: "tire_rl.glb", offset: [0.85, -0.3, 0], massKg: 11.8, material: "Ultra-High Perf Rubber" },
  { id: "wheel_rim_rr", name: "20x11 Rear Right Forged Rim", category: "wheels", glbFilename: "wheel_rim_rr.glb", offset: [-0.65, -0.3, 0], massKg: 9.8, material: "Forged 6061 Aluminum" },
  { id: "tire_rr", name: "305/30R20 Rear Right Semi-Slick", category: "wheels", glbFilename: "tire_rr.glb", offset: [-0.85, -0.3, 0], massKg: 11.8, material: "Ultra-High Perf Rubber" },
];

export function getStageIndividualParts(stageId: AssemblyStage): ModularPartItem[] {
  return MODULAR_CAR_PARTS.filter((p) => p.category === stageId);
}

export function getCompleteVehicleGlbPath(model: VehicleModelCategory | string): string {
  const m = String(model || "sedan").toLowerCase();
  if (m === "crossover") return "/models/Car_Crossover_Complete.glb";
  if (m === "suv") return "/models/Car_Suv_Complete.glb";
  if (m === "f1" || m === "formula") return "/models/Car_F1_Complete.glb";
  if (m === "hypercar" || m === "megawatt") return "/models/Car_Hypercar_Complete.glb";
  if (m === "gt3" || m === "supercar" || m === "track_special") return "/models/Car_GT3_Supercar_Complete.glb";
  return "/models/Car_Sedan_Complete.glb";
}

export function getStageGlbPaths(stageId: AssemblyStage, model: VehicleModelCategory): string[] {
  if (stageId === "complete") {
    return [getCompleteVehicleGlbPath(model)];
  }
  const individual = getStageIndividualParts(stageId);
  if (individual.length > 0) {
    return individual.map((p) => `/models/modular_parts/individual/${p.glbFilename}`);
  }
  switch (stageId) {
    case "chassis": {
      const known = ["sedan", "coupe", "suv", "hatchback", "crossover"];
      const baseName = known.includes(model as string) ? model : "sedan";
      return [`/models/modular_parts/chassis_${baseName}.glb`];
    }
    default:
      return [];
  }
}

export const STAGE_EXPLODED_OFFSETS: Record<string, [number, number, number]> = {
  chassis: [0, 0, 0],
  engine: [0, 0.45, 0.25],
  gearbox: [0, -0.35, 0.2],
  suspension: [0, 0, -0.3],
  brakes: [0.4, 0, 0],
  wheels: [0.75, 0, 0],
  body_framework: [0, 0, 0.35],
  exterior_panels: [0, 0, 0.65],
  lighting_glass: [0, 0.2, 0.8],
  aerodynamics: [0, 0, -0.45],
  interior: [0, 0, 0.15],
};

export interface SubsystemOption {
  architecture: string;
  materialGrade: string;
  finish: string;
}

interface ModularVehicleBuilderState {
  // Step & Category
  selectedModel: VehicleModelCategory;
  currentStage: AssemblyStage;
  installedStages: string[]; // List of installed stage IDs
  hiddenPartIds: string[]; // List of hidden part IDs for deep inspection

  // Subsystem Options
  chassisArch: string;
  materialGrade: string;
  engineSpec: string;
  transmissionSpec: string;
  suspensionTuning: string;
  brakeCompound: string;
  bodyColorHex: string;
  aeroPackage: string;

  // Specialized Interactive CAD Kit States
  activeWingAngleDeg: number;
  drsActive: boolean;
  convertibleRoofPosition: number;
  vanSeatConfig: VanSeatConfig;
  offRoadRideHeightMm: number;
  offRoadTireDiameterInches: number;
  commercialBodyType: CommercialBodyType;

  // Viewport Settings
  viewportMode: "accumulated" | "subsystem_isolated";
  explodedProgress: number; // 0.0 to 1.0
  isXRay: boolean;
  isAutoRotate: boolean;

  // Actions
  setSelectedModel: (model: VehicleModelCategory) => void;
  setCurrentStage: (stage: AssemblyStage) => void;
  installCurrentStageAndNext: () => void;
  toggleStageInstall: (stageId: string) => void;
  uninstallStage: (stageId: string) => void;
  togglePartVisibility: (partId: string) => void;
  isPartVisible: (partId: string) => boolean;

  setChassisArch: (v: string) => void;
  setMaterialGrade: (v: string) => void;
  setEngineSpec: (v: string) => void;
  setTransmissionSpec: (v: string) => void;
  setSuspensionTuning: (v: string) => void;
  setBrakeCompound: (v: string) => void;
  setBodyColorHex: (v: string) => void;
  setAeroPackage: (v: string) => void;

  // Specialized CAD Kit Actions
  setActiveWingAngle: (angle: number) => void;
  setDrsActive: (active: boolean) => void;
  setConvertibleRoofPosition: (pos: number) => void;
  setVanSeatConfig: (config: VanSeatConfig) => void;
  setOffRoadRideHeight: (heightMm: number) => void;
  setOffRoadTireDiameter: (diaInches: number) => void;
  setCommercialBodyType: (bodyType: CommercialBodyType) => void;

  setViewportMode: (m: "accumulated" | "subsystem_isolated") => void;
  setExplodedProgress: (p: number) => void;
  setIsXRay: (v: boolean) => void;
  setIsAutoRotate: (v: boolean) => void;
  resetToFrontPage: () => void;
}

export const useModularVehicleBuilderStore = create<ModularVehicleBuilderState>((set, get) => ({
  selectedModel: "sedan",
  currentStage: "model_select", // starts at Image 1: Front Page
  installedStages: [],
  hiddenPartIds: [],

  chassisArch: "monocoque",
  materialGrade: "extruded_aluminum",
  engineSpec: "v8_twinturbo_4_0l",
  transmissionSpec: "dct_7speed",
  suspensionTuning: "double_wishbone_adaptive",
  brakeCompound: "carbon_ceramic_410mm",
  bodyColorHex: "#0a2558", // Deep Sapphire Blue
  aeroPackage: "gt_track_downforce",

  // Specialized Interactive CAD Kit Initial States
  activeWingAngleDeg: 0,
  drsActive: false,
  convertibleRoofPosition: 0.0,
  vanSeatConfig: "5_seat",
  offRoadRideHeightMm: 230,
  offRoadTireDiameterInches: 33,
  commercialBodyType: "flatbed",

  viewportMode: "accumulated",
  explodedProgress: 0.0,
  isXRay: false,
  isAutoRotate: false,

  setSelectedModel: (model) => set({ selectedModel: model }),
  setCurrentStage: (stage) => set({ currentStage: stage }),

  togglePartVisibility: (partId) => {
    const s = get();
    const isHidden = s.hiddenPartIds.includes(partId);
    set({
      hiddenPartIds: isHidden
        ? s.hiddenPartIds.filter((id) => id !== partId)
        : [...s.hiddenPartIds, partId],
    });
  },

  isPartVisible: (partId) => !get().hiddenPartIds.includes(partId),

  installCurrentStageAndNext: () => {
    const s = get();
    const stageId = s.currentStage;
    const stagesOrder: AssemblyStage[] = [
      "model_select",
      "chassis",
      "engine",
      "gearbox",
      "suspension",
      "brakes",
      "wheels",
      "body_framework",
      "exterior_panels",
      "lighting_glass",
      "complete",
    ];

    let updated = [...s.installedStages];
    if (stageId !== "model_select" && stageId !== "complete") {
      updated = Array.from(new Set([...updated, stageId]));
    }
    const currentIdx = stagesOrder.indexOf(stageId);
    const nextStage = currentIdx < stagesOrder.length - 1 ? stagesOrder[currentIdx + 1] : "complete";

    set({
      installedStages: updated,
      currentStage: nextStage,
    });
  },

  toggleStageInstall: (stageId) => {
    const s = get();
    const has = s.installedStages.includes(stageId);
    set({
      installedStages: has
        ? s.installedStages.filter((id) => id !== stageId)
        : [...s.installedStages, stageId],
    });
  },

  uninstallStage: (stageId) => {
    const s = get();
    set({
      installedStages: s.installedStages.filter((id) => id !== stageId),
    });
  },

  setChassisArch: (v) => set({ chassisArch: v }),
  setMaterialGrade: (v) => set({ materialGrade: v }),
  setEngineSpec: (v) => set({ engineSpec: v }),
  setTransmissionSpec: (v) => set({ transmissionSpec: v }),
  setSuspensionTuning: (v) => set({ suspensionTuning: v }),
  setBrakeCompound: (v) => set({ brakeCompound: v }),
  setBodyColorHex: (v) => set({ bodyColorHex: v }),
  setAeroPackage: (v) => set({ aeroPackage: v }),

  // Specialized CAD Kit Actions
  setActiveWingAngle: (angle) => set({ activeWingAngleDeg: Math.max(-15, Math.min(35, angle)) }),
  setDrsActive: (active) => set({ drsActive: active }),
  setConvertibleRoofPosition: (pos) => set({ convertibleRoofPosition: Math.max(0, Math.min(1, pos)) }),
  setVanSeatConfig: (cfg) => set({ vanSeatConfig: cfg }),
  setOffRoadRideHeight: (h) => set({ offRoadRideHeightMm: Math.max(180, Math.min(360, h)) }),
  setOffRoadTireDiameter: (d) => set({ offRoadTireDiameterInches: Math.max(30, Math.min(42, d)) }),
  setCommercialBodyType: (t) => set({ commercialBodyType: t }),

  setViewportMode: (m) => set({ viewportMode: m }),
  setExplodedProgress: (p) => set({ explodedProgress: Math.max(0, Math.min(1, p)) }),
  setIsXRay: (v) => set({ isXRay: v }),
  setIsAutoRotate: (v) => set({ isAutoRotate: v }),

  resetToFrontPage: () =>
    set({
      currentStage: "model_select",
      installedStages: [],
      explodedProgress: 0.0,
      viewportMode: "accumulated",
    }),
}));
