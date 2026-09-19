/**
 * ============================================================================
 * SCROLL-DRIVEN 3D STORYTELLING STORE & KEYFRAME INTERPOLATION ENGINE
 * ============================================================================
 * Translates scroll position into cinematic camera flight paths, component
 * reveals, dynamic exploded view kinematics, and bi-directional UI sync.
 *
 * SCROLL POSITION -> CAMERA POSITION -> COMPONENT REVEAL -> PANEL CONTEXT
 * ============================================================================
 */

import { create } from "zustand";
import { WorkflowStage } from "./guidedEngineeringStore";

export interface StoryKeyframe {
  id: string;
  progress: number; // 0.0 to 1.0
  chapterNumber: string; // e.g., "01 / 06"
  title: string;
  subtitle: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  fov: number;
  explodedFactor: number; // 0.0 (assembled) to 1.0 (fully exploded)
  componentId: string;
  panelGroupId: string; // Syncs with right-side engineering panel section
  technicalSpec?: string;
}

export interface InterpolatedStoryState {
  progress: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  fov: number;
  explodedFactor: number;
  activeKeyframe: StoryKeyframe;
  nextKeyframe: StoryKeyframe;
  interpolationT: number;
}

/**
 * 3D Story Keyframes for all 5 Automotive Engineering Stages
 */
export const STAGE_STORY_KEYFRAMES: Record<WorkflowStage, StoryKeyframe[]> = {
  // ─── 01 POWER UNIT ────────────────────────────────────────────────────────
  engine: [
    {
      id: "engine_overview",
      progress: 0.0,
      chapterNumber: "01 / 06",
      title: "POWER UNIT ARCHITECTURE",
      subtitle: "Wide engine bay envelope & structural cylinder block packaging",
      cameraPosition: [1.3, 0.9, 1.6],
      cameraTarget: [0.0, 0.1, 0.0],
      fov: 42,
      explodedFactor: 0.0,
      componentId: "engine_bay",
      panelGroupId: "architecture",
      technicalSpec: "Displacement & Block Architecture",
    },
    {
      id: "engine_block",
      progress: 0.2,
      chapterNumber: "02 / 06",
      title: "CYLINDER BLOCK & BORES",
      subtitle: "Deep-skirt structural crankcase, cross-bolted main caps & Si-Al bores",
      cameraPosition: [0.65, 0.35, 0.7],
      cameraTarget: [0.0, 0.05, 0.0],
      fov: 38,
      explodedFactor: 0.15,
      componentId: "cylinder_block",
      panelGroupId: "architecture",
      technicalSpec: "Bore & Stroke Ratio",
    },
    {
      id: "engine_internals",
      progress: 0.4,
      chapterNumber: "03 / 06",
      title: "ROTATING ASSEMBLY & PISTONS",
      subtitle: "Nitrided flat-plane / cross-plane crankshaft, forged H-beam rods & pistons",
      cameraPosition: [0.45, 0.15, 0.55],
      cameraTarget: [0.0, -0.05, 0.0],
      fov: 35,
      explodedFactor: 0.45,
      componentId: "crankshaft_pistons",
      panelGroupId: "architecture",
      technicalSpec: "Static Compression & Inertia",
    },
    {
      id: "engine_valvetrain",
      progress: 0.6,
      chapterNumber: "04 / 06",
      title: "CYLINDER HEADS & VALVETRAIN",
      subtitle: "Dual overhead camshafts, sodium-filled valves & high-rate dual springs",
      cameraPosition: [0.4, 0.55, 0.45],
      cameraTarget: [0.0, 0.22, 0.0],
      fov: 34,
      explodedFactor: 0.35,
      componentId: "cylinder_heads",
      panelGroupId: "valvetrain",
      technicalSpec: "Cam Lift & Redline Limiter",
    },
    {
      id: "engine_induction",
      progress: 0.8,
      chapterNumber: "05 / 06",
      title: "FORCED INDUCTION & PLENUM",
      subtitle: "Twin ceramic ball-bearing turbochargers with carbon fiber plenum runners",
      cameraPosition: [-0.7, 0.45, 0.6],
      cameraTarget: [-0.2, 0.18, 0.0],
      fov: 36,
      explodedFactor: 0.2,
      componentId: "turbo_intake",
      panelGroupId: "aspiration",
      technicalSpec: "Boost Pressure & Intercooling",
    },
    {
      id: "engine_thermal",
      progress: 1.0,
      chapterNumber: "06 / 06",
      title: "EXHAUST & THERMAL DYNAMICS",
      subtitle: "Equal-length Inconel exhaust headers & high-capacity dual-pass cooling",
      cameraPosition: [0.9, 0.6, 1.2],
      cameraTarget: [0.0, 0.12, 0.0],
      fov: 40,
      explodedFactor: 0.0,
      componentId: "exhaust_cooling",
      panelGroupId: "fuel_cooling",
      technicalSpec: "Thermal Rejection & Dyno Calibration",
    },
  ],

  // ─── 02 VEHICLE ARCHITECTURE ──────────────────────────────────────────────
  vehicle: [
    {
      id: "vehicle_body",
      progress: 0.0,
      chapterNumber: "01 / 06",
      title: "AERODYNAMIC SILHOUETTE",
      subtitle: "Sculpted exterior shell proportions and monocoque packaging envelope",
      cameraPosition: [3.2, 1.6, 2.8],
      cameraTarget: [0.0, 0.4, 0.0],
      fov: 40,
      explodedFactor: 0.0,
      componentId: "body_silhouette",
      panelGroupId: "platform",
      technicalSpec: "Platform & Body Style",
    },
    {
      id: "vehicle_chassis",
      progress: 0.2,
      chapterNumber: "02 / 06",
      title: "SPACEFRAME & CARBON TUB",
      subtitle: "High-rigidity central tub with aerospace extruded aluminum subframes",
      cameraPosition: [2.1, 0.9, 1.4],
      cameraTarget: [0.0, 0.3, 0.0],
      fov: 36,
      explodedFactor: 0.25,
      componentId: "chassis_tub",
      panelGroupId: "platform",
      technicalSpec: "Torsional Rigidity: 52 kNm/deg",
    },
    {
      id: "vehicle_kinematics",
      progress: 0.4,
      chapterNumber: "03 / 06",
      title: "SUSPENSION & KINEMATICS",
      subtitle: "Double wishbone pushrod geometry with 3-way adjustable remote coilovers",
      cameraPosition: [1.4, 0.5, 0.9],
      cameraTarget: [1.1, 0.3, 0.6],
      fov: 32,
      explodedFactor: 0.4,
      componentId: "suspension_kinematics",
      panelGroupId: "suspension",
      technicalSpec: "Spring Rates & Anti-Roll Bars",
    },
    {
      id: "vehicle_brakes",
      progress: 0.6,
      chapterNumber: "04 / 06",
      title: "CARBON CERAMIC BRAKES",
      subtitle: "Monobloc 6-piston forged calipers with ventilated 398mm carbon ceramic rotors",
      cameraPosition: [1.3, 0.35, 0.75],
      cameraTarget: [1.2, 0.32, 0.65],
      fov: 28,
      explodedFactor: 0.35,
      componentId: "brake_calipers",
      panelGroupId: "wheels_brakes",
      technicalSpec: "Deceleration & Thermal Dissipation",
    },
    {
      id: "vehicle_wheels",
      progress: 0.8,
      chapterNumber: "05 / 06",
      title: "FORGED ALLOY WHEELS",
      subtitle: "Center-lock ultra-lightweight forged wheels engineered for high lateral G",
      cameraPosition: [1.4, 0.4, 0.85],
      cameraTarget: [1.25, 0.34, 0.7],
      fov: 30,
      explodedFactor: 0.2,
      componentId: "wheels_rims",
      panelGroupId: "wheels_brakes",
      technicalSpec: "Unsprung Mass Reduction",
    },
    {
      id: "vehicle_chassis_complete",
      progress: 1.0,
      chapterNumber: "06 / 06",
      title: "CALIBRATED ROLLING CHASSIS",
      subtitle: "Integrated track stance with balanced corner weights and semi-slick tyres",
      cameraPosition: [2.8, 1.2, 2.2],
      cameraTarget: [0.0, 0.35, 0.0],
      fov: 38,
      explodedFactor: 0.0,
      componentId: "rolling_chassis",
      panelGroupId: "dimensions",
      technicalSpec: "Wheelbase & Ride Height Alignment",
    },
  ],

  // ─── 03 AIR MANAGEMENT ────────────────────────────────────────────────────
  aero: [
    {
      id: "aero_streamlines",
      progress: 0.0,
      chapterNumber: "01 / 06",
      title: "GLOBAL AIRFLOW ENVELOPE",
      subtitle: "Full-vehicle CFD pressure contours and aerodynamic stagnation boundary",
      cameraPosition: [3.5, 1.5, 2.6],
      cameraTarget: [0.0, 0.4, 0.0],
      fov: 42,
      explodedFactor: 0.0,
      componentId: "aero_overview",
      panelGroupId: "balance",
      technicalSpec: "Total Downforce & Drag Balance",
    },
    {
      id: "aero_splitter",
      progress: 0.2,
      chapterNumber: "02 / 06",
      title: "FRONT SPLITTER & VORTICES",
      subtitle: "Ground-effect front splitter extension with carbon fiber dive canards",
      cameraPosition: [1.6, 0.45, -2.9],
      cameraTarget: [0.0, 0.12, -2.3],
      fov: 36,
      explodedFactor: 0.15,
      componentId: "front_splitter",
      panelGroupId: "front_aero",
      technicalSpec: "Front Stagnation Pressure & Downforce",
    },
    {
      id: "aero_underbody",
      progress: 0.4,
      chapterNumber: "03 / 06",
      title: "VENTURI GROUND EFFECTS",
      subtitle: "Underbody venturi tunnels generating low pressure under lateral suction",
      cameraPosition: [1.2, -0.2, 1.5],
      cameraTarget: [0.0, 0.1, 0.0],
      fov: 38,
      explodedFactor: 0.3,
      componentId: "venturi_tunnels",
      panelGroupId: "underbody",
      technicalSpec: "Bernoulli Acceleration & Ground Suction",
    },
    {
      id: "aero_diffuser",
      progress: 0.6,
      chapterNumber: "04 / 06",
      title: "REAR DIFFUSER ACCELERATION",
      subtitle: "Multi-channel diffuser throat expanding airflow and minimizing wake turbulence",
      cameraPosition: [-1.9, 0.35, 1.1],
      cameraTarget: [-1.4, 0.2, 0.0],
      fov: 34,
      explodedFactor: 0.2,
      componentId: "rear_diffuser",
      panelGroupId: "underbody",
      technicalSpec: "Diffuser Expansion Ramp Angle",
    },
    {
      id: "aero_wing",
      progress: 0.8,
      chapterNumber: "05 / 06",
      title: "ACTIVE REAR WING & DRS",
      subtitle: "Dual-element swan-neck rear wing with live angle of attack control",
      cameraPosition: [1.75, 1.65, 2.85],
      cameraTarget: [0.0, 1.15, 2.15],
      fov: 35,
      explodedFactor: 0.25,
      componentId: "rear_wing",
      panelGroupId: "rear_aero",
      technicalSpec: "High Downforce vs Low Drag DRS",
    },
    {
      id: "aero_package_complete",
      progress: 1.0,
      chapterNumber: "06 / 06",
      title: "HOMOLOGATED AERO SPEC",
      subtitle: "Optimum lift-to-drag ratio with 42% front / 58% rear aerodynamic balance",
      cameraPosition: [3.0, 1.4, 2.4],
      cameraTarget: [0.0, 0.4, 0.0],
      fov: 38,
      explodedFactor: 0.0,
      componentId: "aero_summary",
      panelGroupId: "balance",
      technicalSpec: "Wind-Tunnel Validated Efficiency",
    },
  ],

  // ─── 04 DRIVER ENVIRONMENT ────────────────────────────────────────────────
  interior: [
    {
      id: "interior_cockpit",
      progress: 0.0,
      chapterNumber: "01 / 06",
      title: "CABIN ERGONOMICS ENVELOPE",
      subtitle: "FIA-homologated monocoque cockpit entry and driver sightlines",
      cameraPosition: [0.0, 1.2, 1.8],
      cameraTarget: [0.0, 0.6, 0.0],
      fov: 48,
      explodedFactor: 0.0,
      componentId: "cabin_overview",
      panelGroupId: "seating",
      technicalSpec: "Driver Envelope & Roll Cell",
    },
    {
      id: "interior_seating",
      progress: 0.2,
      chapterNumber: "02 / 06",
      title: "SEATING POSITION & H-POINT",
      subtitle: "Ultra-low center of gravity carbon bucket seats with 6-point harness anchors",
      cameraPosition: [0.3, 0.85, 0.6],
      cameraTarget: [0.1, 0.5, 0.0],
      fov: 42,
      explodedFactor: 0.2,
      componentId: "bucket_seats",
      panelGroupId: "seating",
      technicalSpec: "H-Point & Lateral Thigh Bolstering",
    },
    {
      id: "interior_steering",
      progress: 0.4,
      chapterNumber: "03 / 06",
      title: "MOTORSPORT STEERING YOKE",
      subtitle: "CNC billet aluminum GT3 steering wheel with magnetic paddle shifters",
      cameraPosition: [0.15, 0.75, 0.35],
      cameraTarget: [0.05, 0.68, 0.0],
      fov: 38,
      explodedFactor: 0.3,
      componentId: "steering_yoke",
      panelGroupId: "controls",
      technicalSpec: "Rotary Dials & Telemetry Buttons",
    },
    {
      id: "interior_avionics",
      progress: 0.6,
      chapterNumber: "04 / 06",
      title: "CURVED OLED AVIONICS",
      subtitle: "Pillar-to-pillar curved digital instrumentation with custom track telemetry",
      cameraPosition: [0.05, 0.78, 0.28],
      cameraTarget: [0.0, 0.72, -0.05],
      fov: 40,
      explodedFactor: 0.25,
      componentId: "oled_avionics",
      panelGroupId: "avionics",
      technicalSpec: "Telltale Warnings & Engine RPM Dials",
    },
    {
      id: "interior_console",
      progress: 0.8,
      chapterNumber: "05 / 06",
      title: "TACTILE SWITCHGEAR CONSOLE",
      subtitle: "Machined rotary dials, engine start safety flap & dual wireless charging bays",
      cameraPosition: [0.2, 0.6, 0.3],
      cameraTarget: [0.12, 0.48, 0.05],
      fov: 38,
      explodedFactor: 0.2,
      componentId: "centre_console",
      panelGroupId: "controls",
      technicalSpec: "Solid Billet Tactile Feedback",
    },
    {
      id: "interior_complete",
      progress: 1.0,
      chapterNumber: "06 / 06",
      title: "HOMOLOGATED INTERIOR",
      subtitle: "Matte Alcantara anti-glare dash with exposed forged carbon accents",
      cameraPosition: [0.4, 0.9, 0.8],
      cameraTarget: [0.0, 0.6, 0.0],
      fov: 44,
      explodedFactor: 0.0,
      componentId: "interior_complete",
      panelGroupId: "materials",
      technicalSpec: "Alcantara & Carbon Weave",
    },
  ],

  // ─── 05 COMPLETE MACHINE ──────────────────────────────────────────────────
  final_build: [
    {
      id: "final_homologated",
      progress: 0.0,
      chapterNumber: "01 / 05",
      title: "HOMOLOGATED SUPERCAR",
      subtitle: "Complete unified engineering assembly ready for track certification",
      cameraPosition: [3.8, 1.6, 3.2],
      cameraTarget: [0.0, 0.4, 0.0],
      fov: 40,
      explodedFactor: 0.0,
      componentId: "full_vehicle",
      panelGroupId: "overview",
      technicalSpec: "Total Vehicle Architecture",
    },
    {
      id: "final_powertrain_bay",
      progress: 0.25,
      chapterNumber: "02 / 05",
      title: "MID-ENGINE PACKAGING",
      subtitle: "Exposed carbon induction plenum and equal-length thermal exhaust packaging",
      cameraPosition: [-0.8, 1.1, 0.9],
      cameraTarget: [-0.2, 0.45, 0.0],
      fov: 36,
      explodedFactor: 0.2,
      componentId: "engine_bay_inspection",
      panelGroupId: "powertrain",
      technicalSpec: "Power-to-Weight Optimization",
    },
    {
      id: "final_stance",
      progress: 0.5,
      chapterNumber: "03 / 05",
      title: "KINEMATICS & CONTACT PATCH",
      subtitle: "Corner-weighted suspension geometry under simulated static ride compression",
      cameraPosition: [1.9, 0.45, 1.2],
      cameraTarget: [1.2, 0.35, 0.6],
      fov: 32,
      explodedFactor: 0.1,
      componentId: "stance_kinematics",
      panelGroupId: "chassis",
      technicalSpec: "Lateral Grip Potential: 1.45G",
    },
    {
      id: "final_aero_cfd",
      progress: 0.75,
      chapterNumber: "04 / 05",
      title: "CFD STREAMLINE PROFILE",
      subtitle: "Aerodynamic surface integration generating balanced high-speed downforce",
      cameraPosition: [-2.2, 1.2, 1.4],
      cameraTarget: [0.0, 0.5, 0.0],
      fov: 36,
      explodedFactor: 0.0,
      componentId: "streamline_profile",
      panelGroupId: "aero",
      technicalSpec: "Drag Coefficient & Downforce",
    },
    {
      id: "final_certification",
      progress: 1.0,
      chapterNumber: "05 / 05",
      title: "CERTIFICATION & TELEMETRY",
      subtitle: "Virtual wind-tunnel and dyno verified performance ready for export",
      cameraPosition: [3.4, 1.4, 2.6],
      cameraTarget: [0.0, 0.4, 0.0],
      fov: 40,
      explodedFactor: 0.0,
      componentId: "homologation_certificate",
      panelGroupId: "homologation",
      technicalSpec: "BOM Cost & Homologation Seal",
    },
  ],
};

/**
 * Hermite-smoothed interpolation between bounding keyframes for any
 * continuous scroll progress value (0.0 to 1.0).
 */
export function interpolateStoryState(
  stage: WorkflowStage,
  progress: number
): InterpolatedStoryState {
  const keyframes = STAGE_STORY_KEYFRAMES[stage] || STAGE_STORY_KEYFRAMES.engine;
  const clampedProgress = Math.max(0.0, Math.min(1.0, progress));

  if (keyframes.length === 1) {
    const kf = keyframes[0];
    return {
      progress: clampedProgress,
      cameraPosition: [...kf.cameraPosition],
      cameraTarget: [...kf.cameraTarget],
      fov: kf.fov,
      explodedFactor: kf.explodedFactor,
      activeKeyframe: kf,
      nextKeyframe: kf,
      interpolationT: 0,
    };
  }

  // Find bounding keyframes
  let idx = 0;
  while (
    idx < keyframes.length - 2 &&
    keyframes[idx + 1].progress <= clampedProgress
  ) {
    idx++;
  }

  const kfA = keyframes[idx];
  const kfB = keyframes[idx + 1] || kfA;

  const segmentLength = kfB.progress - kfA.progress;
  const rawT = segmentLength > 0 ? (clampedProgress - kfA.progress) / segmentLength : 0;
  // Smooth Hermite interpolation: 3t² - 2t³
  const t = Math.max(0, Math.min(1, rawT * rawT * (3 - 2 * rawT)));

  const lerp = (a: number, b: number, factor: number) => a + (b - a) * factor;

  const camPos: [number, number, number] = [
    lerp(kfA.cameraPosition[0], kfB.cameraPosition[0], t),
    lerp(kfA.cameraPosition[1], kfB.cameraPosition[1], t),
    lerp(kfA.cameraPosition[2], kfB.cameraPosition[2], t),
  ];

  const camTarget: [number, number, number] = [
    lerp(kfA.cameraTarget[0], kfB.cameraTarget[0], t),
    lerp(kfA.cameraTarget[1], kfB.cameraTarget[1], t),
    lerp(kfA.cameraTarget[2], kfB.cameraTarget[2], t),
  ];

  const fov = lerp(kfA.fov, kfB.fov, t);
  const explodedFactor = lerp(kfA.explodedFactor, kfB.explodedFactor, t);

  return {
    progress: clampedProgress,
    cameraPosition: camPos,
    cameraTarget: camTarget,
    fov,
    explodedFactor,
    activeKeyframe: rawT < 0.5 ? kfA : kfB,
    nextKeyframe: kfB,
    interpolationT: t,
  };
}

// ─── ZUSTAND STORE ──────────────────────────────────────────────────────────

interface Storytelling3DStore {
  scrollProgress: number;
  targetScrollProgress: number;
  activeStage: WorkflowStage;
  activePanelGroupId: string | null;
  isExplodedMode: boolean;

  setActiveStage: (stage: WorkflowStage) => void;
  setScrollProgress: (progress: number) => void;
  setTargetScrollProgress: (target: number) => void;
  stepScroll: (delta: number) => void;
  snapToKeyframe: (index: number) => void;
  nextKeyframe: () => void;
  prevKeyframe: () => void;
  syncFromPanelGroup: (groupId: string) => void;
  toggleExplodedMode: () => void;
  resetStory: () => void;
}

export const useStorytelling3DStore = create<Storytelling3DStore>((set, get) => ({
  scrollProgress: 0.0,
  targetScrollProgress: 0.0,
  activeStage: "engine",
  activePanelGroupId: "architecture",
  isExplodedMode: false,

  setActiveStage: (stage) => {
    const keyframes = STAGE_STORY_KEYFRAMES[stage];
    const firstGroup = keyframes && keyframes[0] ? keyframes[0].panelGroupId : null;
    set({
      activeStage: stage,
      scrollProgress: 0.0,
      targetScrollProgress: 0.0,
      activePanelGroupId: firstGroup,
    });
  },

  setScrollProgress: (progress) => {
    const clamped = Math.max(0.0, Math.min(1.0, progress));
    const state = interpolateStoryState(get().activeStage, clamped);
    set({
      scrollProgress: clamped,
      targetScrollProgress: clamped,
      activePanelGroupId: state.activeKeyframe.panelGroupId,
    });
  },

  setTargetScrollProgress: (target) => {
    const clamped = Math.max(0.0, Math.min(1.0, target));
    set({ targetScrollProgress: clamped });
  },

  stepScroll: (delta) => {
    const current = get().targetScrollProgress;
    const next = Math.max(0.0, Math.min(1.0, current + delta));
    get().setTargetScrollProgress(next);
  },

  snapToKeyframe: (index) => {
    const keyframes = STAGE_STORY_KEYFRAMES[get().activeStage];
    if (!keyframes || !keyframes[index]) return;
    const targetProgress = keyframes[index].progress;
    set({
      targetScrollProgress: targetProgress,
      activePanelGroupId: keyframes[index].panelGroupId,
    });
  },

  nextKeyframe: () => {
    const { activeStage, targetScrollProgress } = get();
    const keyframes = STAGE_STORY_KEYFRAMES[activeStage];
    if (!keyframes) return;
    const next = keyframes.find((kf) => kf.progress > targetScrollProgress + 0.02);
    if (next) {
      set({ targetScrollProgress: next.progress, activePanelGroupId: next.panelGroupId });
    } else {
      set({ targetScrollProgress: 1.0 });
    }
  },

  prevKeyframe: () => {
    const { activeStage, targetScrollProgress } = get();
    const keyframes = STAGE_STORY_KEYFRAMES[activeStage];
    if (!keyframes) return;
    const reversed = [...keyframes].reverse();
    const prev = reversed.find((kf) => kf.progress < targetScrollProgress - 0.02);
    if (prev) {
      set({ targetScrollProgress: prev.progress, activePanelGroupId: prev.panelGroupId });
    } else {
      set({ targetScrollProgress: 0.0 });
    }
  },

  syncFromPanelGroup: (groupId) => {
    const { activeStage } = get();
    const keyframes = STAGE_STORY_KEYFRAMES[activeStage];
    if (!keyframes) return;
    const matchedKf = keyframes.find((kf) => kf.panelGroupId === groupId);
    if (matchedKf) {
      set({ targetScrollProgress: matchedKf.progress, activePanelGroupId: groupId });
    }
  },

  toggleExplodedMode: () => {
    set((s) => ({ isExplodedMode: !s.isExplodedMode }));
  },

  resetStory: () => {
    set({
      scrollProgress: 0.0,
      targetScrollProgress: 0.0,
      activePanelGroupId: null,
      isExplodedMode: false,
    });
  },
}));
