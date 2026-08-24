// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — BUILD STATE MACHINE & WORKSHOP STEPS
// ============================================================================

export type F1WorkshopStepId =
  | "overview"
  | "monocoque"
  | "powerunit"
  | "aerodynamics"
  | "suspension"
  | "drivetrain"
  | "brakes"
  | "cockpit"
  | "livery"
  | "scrutineering"
  | "windtunnel"
  | "dynobench";

export interface F1WorkshopStepMeta {
  id: F1WorkshopStepId;
  title: string;
  shortTitle: string;
  iconName: string;
  category: "ENGINEERING" | "AERODYNAMICS" | "CHASSIS" | "COMPLIANCE";
  description: string;
  completionThreshold: number; // 0 - 100
}

export const F1_WORKSHOP_STEPS: F1WorkshopStepMeta[] = [
  {
    id: "overview",
    title: "Apex Works Command Deck",
    shortTitle: "Overview",
    iconName: "LayoutDashboard",
    category: "ENGINEERING",
    description: "Holistic telemetry overview, FIA cost cap expenditure, weight budget, and power unit readiness.",
    completionThreshold: 100,
  },
  {
    id: "monocoque",
    title: "Carbon Monocoque & Survival Cell",
    shortTitle: "Monocoque",
    iconName: "Shield",
    category: "CHASSIS",
    description: "Autoclave carbon fiber layup, crash structure attenuation, titanium Halo integration, and ballast placement.",
    completionThreshold: 100,
  },
  {
    id: "powerunit",
    title: "1.6L V6 Turbo-Hybrid Power Unit",
    shortTitle: "Power Unit",
    iconName: "Zap",
    category: "ENGINEERING",
    description: "Direct-injected V6 ICE, Mahle prechamber ignition, MGU-K kinetic recovery, and 125,000 RPM MGU-H turbo.",
    completionThreshold: 100,
  },
  {
    id: "aerodynamics",
    title: "Ground Effect & Vortex Aero Suite",
    shortTitle: "Aero & Floor",
    iconName: "Wind",
    category: "AERODYNAMICS",
    description: "Multi-element front wing outwash, venturi underbody ground effect tunnels, and 85mm hydraulic DRS flap.",
    completionThreshold: 100,
  },
  {
    id: "suspension",
    title: "Pushrod & Pullrod Kinematics Rig",
    shortTitle: "Suspension",
    iconName: "Activity",
    category: "CHASSIS",
    description: "Carbon wishbone aero profiling, torsion bar spring rates, third heave dampers, and camber/toe geometry.",
    completionThreshold: 100,
  },
  {
    id: "drivetrain",
    title: "8-Speed Seamless Shift & Diff Bay",
    shortTitle: "Drivetrain",
    iconName: "Layers",
    category: "CHASSIS",
    description: "Carbon monocoque structural gearbox casing, 14ms seamless gear shifts, and electro-hydraulic active differential.",
    completionThreshold: 100,
  },
  {
    id: "brakes",
    title: "Carbon-Carbon Disc & BBW System",
    shortTitle: "Brakes",
    iconName: "Disc",
    category: "CHASSIS",
    description: "1050-hole ventilated carbon discs, monobloc 6-piston calipers, and brake-by-wire MGU-K regen blending.",
    completionThreshold: 100,
  },
  {
    id: "cockpit",
    title: "Ergonomics, Steering Wheel & Electronics",
    shortTitle: "Cockpit & ECU",
    iconName: "Sliders",
    category: "ENGINEERING",
    description: "Formula 1 multifunction OLED steering wheel display, rotary selectors, driver seat mold, and McLaren TAG-320 ECU.",
    completionThreshold: 100,
  },
  {
    id: "livery",
    title: "Livery Studio & Title Sponsors",
    shortTitle: "Livery & Brands",
    iconName: "Palette",
    category: "COMPLIANCE",
    description: "Matte/gloss composite paintwork, driver numbers, sponsor branding real estate, and carbon weave reveal.",
    completionThreshold: 100,
  },
  {
    id: "scrutineering",
    title: "FIA Technical Scrutineering Gate",
    shortTitle: "Scrutineering",
    iconName: "Gavel",
    category: "COMPLIANCE",
    description: "Comprehensive 8-article FIA rule compliance audit, physical weight check, and official digital homologation passport.",
    completionThreshold: 100,
  },
  {
    id: "windtunnel",
    title: "Virtual Wind Tunnel & CFD Lab",
    shortTitle: "Wind Tunnel",
    iconName: "Gauge",
    category: "AERODYNAMICS",
    description: "60% scale rolling road wind tunnel testing, streamline particle visualization, and surface pressure coefficient maps.",
    completionThreshold: 100,
  },
  {
    id: "dynobench",
    title: "Engine Dyno Bench & Audio Sim",
    shortTitle: "Dyno Bench",
    iconName: "Cpu",
    category: "ENGINEERING",
    description: "Dyno curve RPM sweep, BSFC thermal efficiency contour map, and Web Audio procedural V6 hybrid sound synthesizer.",
    completionThreshold: 100,
  },
];
