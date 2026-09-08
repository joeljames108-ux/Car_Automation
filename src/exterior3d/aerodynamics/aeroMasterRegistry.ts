// ============================================================================
// AERO MASTER REGISTRY & COMPONENT SPECIFICATION CONTRACTS
// ============================================================================
// Master single-source-of-truth registry defining all 11 modular aerodynamic
// subassemblies in the vehicle configurator, their Blender GLB node structures,
// preferred camera viewpoints, transform bindings, and aerodynamic sensitivities.
// ============================================================================

import { AeroComponentId, CameraViewDef } from '../../state/aeroStudioStore';

export type AeroTransformMode =
  | 'rotation'        // Rotates mesh around mechanical hinge pivot
  | 'translation'     // Translates mesh along guide axis
  | 'scale'           // Scales component dimensions (span, chord, gurney)
  | 'modular_toggle'  // Toggles visibility of discrete sub-elements (tiers, strakes)
  | 'material';       // Material assignment switch

export interface AeroParameterDef {
  id: string;
  name: string;
  category: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
  transformMode: AeroTransformMode;
  targetNode: string;
  targetAxis?: 'x' | 'y' | 'z';
  transformMultiplier?: number;
  hingeNode?: string;
  description: string;
  proTip: string;
}

export interface AeroSubassemblySpec {
  id: AeroComponentId;
  name: string;
  categoryName: string;
  subTabId: string;
  glbPath: string;
  alternateGlbPath?: string;
  focusTargetNode: string;
  preferredCamera: CameraViewDef;
  nodes: {
    root: string;
    focusTarget: string;
    hinges?: string[];
    movableParts: string[];
    toggleParts?: string[];
  };
  parameters: AeroParameterDef[];
  aeroCoefficients: {
    baseDownforceCl: number;
    baseDragCd: number;
    copOffsetXM: number; // m from front axle (+ front, - rear)
    copOffsetZM: number; // m height above ground
    downforceSensitivity: number; // ΔCl per unit change
    dragSensitivity: number;      // ΔCd per unit change
  };
  compatibleVehicles: string[];
}

export const AERO_MASTER_REGISTRY: Record<AeroComponentId, AeroSubassemblySpec> = {
  frontSplitter: {
    id: 'frontSplitter',
    name: 'Front Track Splitter',
    categoryName: 'Front Aerodynamics',
    subTabId: 'frontAero',
    glbPath: '/models/aero/AERO_FRONT_SPLITTER_001.glb',
    alternateGlbPath: '/models/aero/aero_front_splitter.glb',
    focusTargetNode: 'FrontSplitter_FocusTarget',
    preferredCamera: {
      position: [1.60, 0.45, 2.90],
      target: [0.0, 0.12, 2.30],
      fov: 38,
    },
    nodes: {
      root: 'FrontSplitter_Root',
      focusTarget: 'FrontSplitter_FocusTarget',
      movableParts: ['FrontSplitter_Blade'],
      toggleParts: ['FrontSplitter_TieRods_L', 'FrontSplitter_TieRods_R', 'FrontSplitter_Winglet_L', 'FrontSplitter_Winglet_R'],
    },
    parameters: [
      {
        id: 'splitterExtension',
        name: 'Splitter Extension',
        category: 'Dimensions',
        unit: 'mm',
        min: 20,
        max: 220,
        step: 10,
        default: 120,
        transformMode: 'translation',
        targetNode: 'FrontSplitter_Blade',
        targetAxis: 'z',
        transformMultiplier: 0.001,
        description: 'Longitudinal protrusion of the carbon splitter blade forward of the bumper leading edge.',
        proTip: 'Extending past 120 mm requires titanium tie-rods to withstand up to 3,200 N of vertical aerodynamic suction.',
      },
      {
        id: 'splitterPitchAngle',
        name: 'Splitter Attack Pitch Angle',
        category: 'Incidence',
        unit: 'deg',
        min: -2.0,
        max: 6.0,
        step: 0.5,
        default: 1.5,
        transformMode: 'rotation',
        targetNode: 'FrontSplitter_Blade',
        targetAxis: 'x',
        transformMultiplier: 1.0,
        hingeNode: 'FrontSplitter_Root',
        description: 'Angle of attack of the front splitter blade relative to the horizontal ground plane.',
        proTip: 'A 1.5° downward rake produces an optimal venturi stagnation effect without stalling underside flow.',
      },
    ],
    aeroCoefficients: {
      baseDownforceCl: 0.42,
      baseDragCd: 0.038,
      copOffsetXM: 1.95,
      copOffsetZM: 0.10,
      downforceSensitivity: 0.0035,
      dragSensitivity: 0.0006,
    },
    compatibleVehicles: ['sedan', 'coupe', 'gt3_supercar', 'hypercar'],
  },

  canards: {
    id: 'canards',
    name: 'Canard Dive Planes',
    categoryName: 'Front Aerodynamics',
    subTabId: 'frontAero',
    glbPath: '/models/aero/AERO_CANARD_001.glb',
    alternateGlbPath: '/models/aero/aero_canards.glb',
    focusTargetNode: 'Canards_FocusTarget',
    preferredCamera: {
      position: [1.55, 0.75, 2.50],
      target: [0.92, 0.52, 2.10],
      fov: 34,
    },
    nodes: {
      root: 'Canards_Root',
      focusTarget: 'Canards_FocusTarget',
      movableParts: ['Canards_Upper_L', 'Canards_Upper_R', 'Canards_Lower_L', 'Canards_Lower_R'],
      toggleParts: ['Canards_Lower_L', 'Canards_Lower_R', 'Canards_Bracket_Lower_L', 'Canards_Bracket_Lower_R'],
    },
    parameters: [
      {
        id: 'canardsIncidence',
        name: 'Canards Incidence Angle',
        category: 'Incidence',
        unit: 'deg',
        min: 5.0,
        max: 28.0,
        step: 1.0,
        default: 14.0,
        transformMode: 'rotation',
        targetNode: 'Canards_Upper_L',
        targetAxis: 'x',
        transformMultiplier: 1.0,
        description: 'Pitch angle of the dive planes relative to the oncoming boundary layer.',
        proTip: 'Generates high-energy vortices along the wheel arch, keeping dirty wheel wake away from underbody tunnels.',
      },
    ],
    aeroCoefficients: {
      baseDownforceCl: 0.18,
      baseDragCd: 0.024,
      copOffsetXM: 1.85,
      copOffsetZM: 0.52,
      downforceSensitivity: 0.008,
      dragSensitivity: 0.0018,
    },
    compatibleVehicles: ['coupe', 'gt3_supercar', 'hypercar'],
  },

  airCurtains: {
    id: 'airCurtains',
    name: 'Front Bumper Air Curtains',
    categoryName: 'Front Aerodynamics',
    subTabId: 'frontAero',
    glbPath: '/models/aero/AERO_FRONT_SPLITTER_001.glb',
    focusTargetNode: 'FrontSplitter_FocusTarget',
    preferredCamera: {
      position: [1.65, 0.50, 2.40],
      target: [0.85, 0.35, 1.95],
      fov: 36,
    },
    nodes: {
      root: 'FrontSplitter_Root',
      focusTarget: 'FrontSplitter_FocusTarget',
      movableParts: [],
    },
    parameters: [],
    aeroCoefficients: {
      baseDownforceCl: 0.05,
      baseDragCd: -0.015, // Reduces drag by smoothing wheel wake
      copOffsetXM: 1.80,
      copOffsetZM: 0.35,
      downforceSensitivity: 0.001,
      dragSensitivity: -0.001,
    },
    compatibleVehicles: ['sedan', 'coupe', 'gt3_supercar', 'hypercar'],
  },

  rearWing: {
    id: 'rearWing',
    name: 'Dual-Element Swan-Neck Wing',
    categoryName: 'Rear Aerodynamics',
    subTabId: 'rearAero',
    glbPath: '/models/aero/AERO_REAR_WING_001.glb',
    alternateGlbPath: '/models/aero/aero_rear_wing.glb',
    focusTargetNode: 'RearWing_FocusTarget',
    preferredCamera: {
      position: [1.75, 1.65, -2.85],
      target: [0.0, 1.15, -2.15],
      fov: 35,
    },
    nodes: {
      root: 'RearWing_Root',
      focusTarget: 'RearWing_FocusTarget',
      hinges: ['RearWing_Hinge'],
      movableParts: ['RearWing_MainPlane', 'RearWing_UpperElement', 'RearWing_Gurney', 'RearWing_Actuator_L', 'RearWing_Actuator_R'],
      toggleParts: ['RearWing_Support_L', 'RearWing_Support_R'],
    },
    parameters: [
      {
        id: 'rearWingAngle',
        name: 'Main Wing Angle of Attack',
        category: 'Incidence',
        unit: 'deg',
        min: 0,
        max: 35,
        step: 1,
        default: 14,
        transformMode: 'rotation',
        targetNode: 'RearWing_MainPlane',
        targetAxis: 'x',
        transformMultiplier: 1.0,
        hingeNode: 'RearWing_Hinge',
        description: 'Physical angle of attack of the main carbon airfoil element around its leading edge hinge.',
        proTip: 'Above 22° without a secondary slotted flap slot, boundary layer separation causes flow stall.',
      },
      {
        id: 'upperFlapAngle',
        name: 'Slotted Upper Flap AoA',
        category: 'Incidence',
        unit: 'deg',
        min: 0,
        max: 42,
        step: 1,
        default: 18,
        transformMode: 'rotation',
        targetNode: 'RearWing_UpperElement',
        targetAxis: 'x',
        transformMultiplier: 1.0,
        description: 'Camber angle of the secondary Fowler-style trailing edge flap.',
        proTip: 'Slot injection re-energizes low-pressure suction side, yielding 35% higher downforce before aerodynamic stall.',
      },
      {
        id: 'rearWingSpan',
        name: 'Wing Span Width',
        category: 'Dimensions',
        unit: 'mm',
        min: 1200,
        max: 1950,
        step: 25,
        default: 1650,
        transformMode: 'scale',
        targetNode: 'RearWing_MainPlane',
        targetAxis: 'x',
        transformMultiplier: 1.0 / 1650,
        description: 'Overall aerodynamic wingspan across the rear deck.',
        proTip: 'Wider spans reduce induced tip vortex drag according to finite-wing Prandtl lifting-line theory.',
      },
    ],
    aeroCoefficients: {
      baseDownforceCl: 0.85,
      baseDragCd: 0.115,
      copOffsetXM: -2.15,
      copOffsetZM: 1.15,
      downforceSensitivity: 0.032,
      dragSensitivity: 0.0075,
    },
    compatibleVehicles: ['coupe', 'gt3_supercar', 'hypercar'],
  },

  rearSpoiler: {
    id: 'rearSpoiler',
    name: 'Carbon Pedestal Rear Spoiler',
    categoryName: 'Rear Aerodynamics',
    subTabId: 'rearAero',
    glbPath: '/models/aero/AERO_REAR_SPOILER_001.glb',
    alternateGlbPath: '/models/aero/aero_rear_spoiler.glb',
    focusTargetNode: 'RearSpoiler_FocusTarget',
    preferredCamera: {
      position: [1.40, 1.30, -2.55],
      target: [0.0, 0.95, -2.05],
      fov: 36,
    },
    nodes: {
      root: 'RearSpoiler_Root',
      focusTarget: 'RearSpoiler_FocusTarget',
      hinges: ['RearSpoiler_Hinge'],
      movableParts: ['RearSpoiler_Blade', 'RearSpoiler_Gurney'],
      toggleParts: ['RearSpoiler_Mount_L', 'RearSpoiler_Mount_R'],
    },
    parameters: [
      {
        id: 'spoilerAngle',
        name: 'Spoiler Pitch Angle',
        category: 'Incidence',
        unit: 'deg',
        min: 0,
        max: 25,
        step: 1,
        default: 10,
        transformMode: 'rotation',
        targetNode: 'RearSpoiler_Blade',
        targetAxis: 'x',
        transformMultiplier: 1.0,
        hingeNode: 'RearSpoiler_Hinge',
        description: 'Angle of the ducktail / pedestal blade relative to rear deck air stream.',
        proTip: 'Suppresses rear lift while adding only 30% of the drag penalty of a tall track wing.',
      },
      {
        id: 'spoilerGurney',
        name: 'Gurney Flap Lip',
        category: 'Trim',
        unit: 'mm',
        min: 0,
        max: 20,
        step: 2,
        default: 8,
        transformMode: 'scale',
        targetNode: 'RearSpoiler_Gurney',
        targetAxis: 'z',
        transformMultiplier: 1.0 / 12,
        description: 'Vertical trailing edge tab that traps high-pressure boundary layer air.',
        proTip: 'Increases net spoiler downforce by 15% with negligible extra frontal drag.',
      },
    ],
    aeroCoefficients: {
      baseDownforceCl: 0.38,
      baseDragCd: 0.042,
      copOffsetXM: -2.10,
      copOffsetZM: 0.92,
      downforceSensitivity: 0.016,
      dragSensitivity: 0.0032,
    },
    compatibleVehicles: ['sedan', 'coupe', 'gt3_supercar'],
  },

  diffuser: {
    id: 'diffuser',
    name: 'Multi-Venturi Underbody Diffuser',
    categoryName: 'Underbody Aerodynamics',
    subTabId: 'underbody',
    glbPath: '/models/aero/AERO_DIFFUSER_001.glb',
    alternateGlbPath: '/models/aero/aero_diffuser.glb',
    focusTargetNode: 'Diffuser_FocusTarget',
    preferredCamera: {
      position: [1.45, 0.12, -2.60],
      target: [0.0, 0.18, -1.95],
      fov: 38,
    },
    nodes: {
      root: 'Diffuser_Root',
      focusTarget: 'Diffuser_FocusTarget',
      movableParts: ['Diffuser_Tray'],
      toggleParts: ['Diffuser_Strake_1', 'Diffuser_Strake_2', 'Diffuser_Strake_3', 'Diffuser_Strake_4', 'Diffuser_SideFence_L', 'Diffuser_SideFence_R'],
    },
    parameters: [
      {
        id: 'diffuserRampAngle',
        name: 'Diffuser Ramp Expansion Angle',
        category: 'Incidence',
        unit: 'deg',
        min: 4.0,
        max: 24.0,
        step: 1.0,
        default: 14.0,
        transformMode: 'rotation',
        targetNode: 'Diffuser_Tray',
        targetAxis: 'x',
        transformMultiplier: 1.0,
        hingeNode: 'Diffuser_Root',
        description: 'Upward expansion angle of the diffuser tray from throat to rear exhaust outlet.',
        proTip: 'Angles beyond 17° risk flow detachment and adverse pressure gradient stall unless vortex strakes are installed.',
      },
    ],
    aeroCoefficients: {
      baseDownforceCl: 0.58,
      baseDragCd: 0.032, // Very high L/D efficiency
      copOffsetXM: -1.75,
      copOffsetZM: 0.18,
      downforceSensitivity: 0.026,
      dragSensitivity: 0.0021,
    },
    compatibleVehicles: ['sedan', 'coupe', 'gt3_supercar', 'hypercar'],
  },

  underbodyFloor: {
    id: 'underbodyFloor',
    name: 'Flat Floor & Venturi Tunnels',
    categoryName: 'Underbody Aerodynamics',
    subTabId: 'underbody',
    glbPath: '/models/aero/AERO_UNDERBODY_001.glb',
    alternateGlbPath: '/models/aero/aero_underbody.glb',
    focusTargetNode: 'Underbody_FocusTarget',
    preferredCamera: {
      position: [2.20, -0.25, 0.0],
      target: [0.0, 0.08, 0.0],
      fov: 42,
    },
    nodes: {
      root: 'Underbody_Root',
      focusTarget: 'Underbody_FocusTarget',
      movableParts: ['Underbody_FlatFloor', 'Underbody_VenturiTunnel_L', 'Underbody_VenturiTunnel_R'],
      toggleParts: ['Underbody_EdgeSkirt_L', 'Underbody_EdgeSkirt_R'],
    },
    parameters: [
      {
        id: 'venturiTunnelDepth',
        name: 'Venturi Tunnel Throat Depth',
        category: 'Dimensions',
        unit: 'mm',
        min: 15,
        max: 65,
        step: 5,
        default: 35,
        transformMode: 'scale',
        targetNode: 'Underbody_VenturiTunnel_L',
        targetAxis: 'z',
        transformMultiplier: 1.0 / 35,
        description: 'Depth of the contoured ground-effect venturi channels beneath the floorpan.',
        proTip: 'Deep venturi tunnels generate huge Bernoulli downforce directly at the vehicle center of gravity.',
      },
    ],
    aeroCoefficients: {
      baseDownforceCl: 0.65,
      baseDragCd: 0.028,
      copOffsetXM: 0.05,
      copOffsetZM: 0.08,
      downforceSensitivity: 0.015,
      dragSensitivity: 0.0012,
    },
    compatibleVehicles: ['gt3_supercar', 'hypercar'],
  },

  sideSkirts: {
    id: 'sideSkirts',
    name: 'Ground-Effect Side Skirts',
    categoryName: 'Side Aerodynamics',
    subTabId: 'sideAero',
    glbPath: '/models/aero/AERO_SIDE_SKIRT_001.glb',
    alternateGlbPath: '/models/aero/aero_side_skirts.glb',
    focusTargetNode: 'SideSkirt_FocusTarget',
    preferredCamera: {
      position: [2.30, 0.35, 0.10],
      target: [0.98, 0.14, 0.0],
      fov: 38,
    },
    nodes: {
      root: 'SideSkirts_Root',
      focusTarget: 'SideSkirt_FocusTarget',
      movableParts: ['SideSkirt_Blade_L', 'SideSkirt_Blade_R'],
      toggleParts: ['SideSkirt_Fin_L', 'SideSkirt_Fin_R'],
    },
    parameters: [
      {
        id: 'skirtExtension',
        name: 'Side Skirt Blade Extension',
        category: 'Dimensions',
        unit: 'mm',
        min: 10,
        max: 120,
        step: 5,
        default: 45,
        transformMode: 'translation',
        targetNode: 'SideSkirt_Blade_L',
        targetAxis: 'x',
        transformMultiplier: 0.001,
        description: 'Lateral width of the rocker blade extending from the door sill edge.',
        proTip: 'Acts as a physical wall to isolate low underbody air pressure from higher ambient air pressure.',
      },
    ],
    aeroCoefficients: {
      baseDownforceCl: 0.22,
      baseDragCd: 0.012,
      copOffsetXM: 0.0,
      copOffsetZM: 0.12,
      downforceSensitivity: 0.004,
      dragSensitivity: 0.0005,
    },
    compatibleVehicles: ['sedan', 'coupe', 'gt3_supercar', 'hypercar'],
  },

  activeAero: {
    id: 'activeAero',
    name: 'Active DRS & Airbrake System',
    categoryName: 'Active Aerodynamics',
    subTabId: 'activeAero',
    glbPath: '/models/aero/AERO_ACTIVE_AERO_001.glb',
    alternateGlbPath: '/models/aero/aero_active_aero.glb',
    focusTargetNode: 'ActiveAero_FocusTarget',
    preferredCamera: {
      position: [1.80, 1.45, -2.75],
      target: [0.0, 1.10, -2.12],
      fov: 36,
    },
    nodes: {
      root: 'ActiveAero_Root',
      focusTarget: 'ActiveAero_FocusTarget',
      hinges: ['Active_Hinge'],
      movableParts: ['Active_Wing_Blade', 'Active_Actuator_Piston_L', 'Active_Actuator_Piston_R', 'Active_Front_Flap_L', 'Active_Front_Flap_R'],
    },
    parameters: [
      {
        id: 'activeAeroDeployment',
        name: 'Live Wing Articulation Mode',
        category: 'Active State',
        unit: '%',
        min: 0,
        max: 100,
        step: 25,
        default: 50,
        transformMode: 'rotation',
        targetNode: 'Active_Wing_Blade',
        targetAxis: 'x',
        transformMultiplier: 1.0,
        hingeNode: 'Active_Hinge',
        description: 'Continuous articulation from 0% (Low Drag DRS 4°) to 100% (Emergency Airbrake 48°).',
        proTip: '100% Airbrake position sheds 1,800 N of braking burden from carbon-ceramic brake calipers.',
      },
    ],
    aeroCoefficients: {
      baseDownforceCl: 0.90,
      baseDragCd: 0.085,
      copOffsetXM: -2.10,
      copOffsetZM: 1.08,
      downforceSensitivity: 0.028,
      dragSensitivity: 0.022,
    },
    compatibleVehicles: ['gt3_supercar', 'hypercar'],
  },

  roofAero: {
    id: 'roofAero',
    name: 'Roof Shark Fin & Vortex Generators',
    categoryName: 'Roof Aerodynamics',
    subTabId: 'roofAero',
    glbPath: '/models/aero/AERO_ROOF_AERO_001.glb',
    alternateGlbPath: '/models/aero/aero_roof_aero.glb',
    focusTargetNode: 'RoofAero_FocusTarget',
    preferredCamera: {
      position: [1.40, 1.85, -0.75],
      target: [0.0, 1.30, -0.70],
      fov: 35,
    },
    nodes: {
      root: 'RoofAero_Root',
      focusTarget: 'RoofAero_FocusTarget',
      movableParts: ['Roof_SharkFin', 'Roof_VortexGenerators', 'Roof_Scoop_RamAir'],
    },
    parameters: [
      {
        id: 'sharkFinHeight',
        name: 'LMP1 Shark Fin Spine',
        category: 'Stability',
        unit: 'mm',
        min: 60,
        max: 220,
        step: 20,
        default: 160,
        transformMode: 'scale',
        targetNode: 'Roof_SharkFin',
        targetAxis: 'z',
        transformMultiplier: 1.0 / 180,
        description: 'Vertical aerodynamic carbon fin running down the center of the greenhouse roof.',
        proTip: 'Directs clean, unseparated air onto the rear wing while stabilizing the car against yaw spinouts in high-speed crosswinds.',
      },
    ],
    aeroCoefficients: {
      baseDownforceCl: 0.08,
      baseDragCd: 0.008,
      copOffsetXM: -0.85,
      copOffsetZM: 1.30,
      downforceSensitivity: 0.002,
      dragSensitivity: 0.0004,
    },
    compatibleVehicles: ['coupe', 'gt3_supercar', 'hypercar'],
  },

  coolingAero: {
    id: 'coolingAero',
    name: 'Hood Louvers & Brake Ducts',
    categoryName: 'Cooling Aerodynamics',
    subTabId: 'coolingAero',
    glbPath: '/models/aero/AERO_COOLING_AERO_001.glb',
    alternateGlbPath: '/models/aero/aero_cooling_aero.glb',
    focusTargetNode: 'CoolingAero_FocusTarget',
    preferredCamera: {
      position: [1.20, 1.25, 1.75],
      target: [0.42, 0.72, 1.35],
      fov: 34,
    },
    nodes: {
      root: 'CoolingAero_Root',
      focusTarget: 'CoolingAero_FocusTarget',
      movableParts: ['Cooling_HoodLouvers_L', 'Cooling_HoodLouvers_R', 'Cooling_BrakeDucts_L', 'Cooling_BrakeDucts_R'],
    },
    parameters: [
      {
        id: 'hoodLouverAngle',
        name: 'Hood Heat Extraction Louvers',
        category: 'Thermal',
        unit: 'deg',
        min: 0,
        max: 45,
        step: 5,
        default: 25,
        transformMode: 'rotation',
        targetNode: 'Cooling_HoodLouvers_L',
        targetAxis: 'x',
        transformMultiplier: 1.0,
        description: 'Multi-slat louvers venting radiator heat out of the hood.',
        proTip: 'Evacuating high pressure from beneath the hood eliminates front aerodynamic lift.',
      },
    ],
    aeroCoefficients: {
      baseDownforceCl: 0.12,
      baseDragCd: 0.015,
      copOffsetXM: 1.35,
      copOffsetZM: 0.72,
      downforceSensitivity: 0.003,
      dragSensitivity: 0.001,
    },
    compatibleVehicles: ['sedan', 'coupe', 'gt3_supercar', 'hypercar'],
  },

  wheelAero: {
    id: 'wheelAero',
    name: 'Turbofan Aero Wheel Discs',
    categoryName: 'Wheel Aerodynamics',
    subTabId: 'wheelAero',
    glbPath: '/models/aero/AERO_WHEEL_AERO_001.glb',
    alternateGlbPath: '/models/aero/aero_wheel_aero.glb',
    focusTargetNode: 'WheelAero_FocusTarget',
    preferredCamera: {
      position: [1.85, 0.45, 1.45],
      target: [0.95, 0.35, 1.35],
      fov: 34,
    },
    nodes: {
      root: 'WheelAero_Root',
      focusTarget: 'WheelAero_FocusTarget',
      movableParts: ['Wheel_AeroDisc_FL', 'Wheel_AeroDisc_FR', 'Wheel_AeroDisc_RL', 'Wheel_AeroDisc_RR'],
      toggleParts: ['Wheel_Spats_FL', 'Wheel_Spats_FR', 'Wheel_Spats_RL', 'Wheel_Spats_RR'],
    },
    parameters: [
      {
        id: 'wheelDiscsInstalled',
        name: 'Turbofan Aero Wheel Discs',
        category: 'Efficiency',
        unit: 'state',
        min: 0,
        max: 1,
        step: 1,
        default: 1,
        transformMode: 'modular_toggle',
        targetNode: 'Wheel_AeroDisc_FL',
        description: 'Forged carbon turbofan discs mounted flush over wheel spokes.',
        proTip: 'Smooths chaotic wheel churn while centrifugal vanes vacuum heat away from brake calipers.',
      },
    ],
    aeroCoefficients: {
      baseDownforceCl: 0.08,
      baseDragCd: -0.018, // Reduces drag significantly
      copOffsetXM: 0.0,
      copOffsetZM: 0.34,
      downforceSensitivity: 0.002,
      dragSensitivity: -0.002,
    },
    compatibleVehicles: ['sedan', 'coupe', 'gt3_supercar', 'hypercar'],
  },

  undertrayFloor: {
    id: 'undertrayFloor',
    name: 'Underbody Ground-Effect Floor',
    categoryName: 'Underbody Aerodynamics',
    subTabId: 'underbody',
    glbPath: '/models/aero/AERO_UNDERBODY_001.glb',
    alternateGlbPath: '/models/aero/aero_underbody.glb',
    focusTargetNode: 'Underbody_FocusTarget',
    preferredCamera: {
      position: [2.20, -0.25, 0.0],
      target: [0.0, 0.08, 0.0],
      fov: 42,
    },
    nodes: {
      root: 'Underbody_Root',
      focusTarget: 'Underbody_FocusTarget',
      movableParts: ['Underbody_FlatFloor'],
    },
    parameters: [],
    aeroCoefficients: {
      baseDownforceCl: 0.50,
      baseDragCd: 0.020,
      copOffsetXM: 0.0,
      copOffsetZM: 0.08,
      downforceSensitivity: 0.01,
      dragSensitivity: 0.001,
    },
    compatibleVehicles: ['gt3_supercar', 'hypercar'],
  },

  roofFin: {
    id: 'roofFin',
    name: 'Roof Shark Fin',
    categoryName: 'Roof Aerodynamics',
    subTabId: 'roofAero',
    glbPath: '/models/aero/AERO_ROOF_AERO_001.glb',
    focusTargetNode: 'RoofAero_FocusTarget',
    preferredCamera: {
      position: [1.40, 1.85, -0.75],
      target: [0.0, 1.30, -0.70],
      fov: 35,
    },
    nodes: {
      root: 'RoofAero_Root',
      focusTarget: 'RoofAero_FocusTarget',
      movableParts: ['Roof_SharkFin'],
    },
    parameters: [],
    aeroCoefficients: {
      baseDownforceCl: 0.05,
      baseDragCd: 0.005,
      copOffsetXM: -0.85,
      copOffsetZM: 1.30,
      downforceSensitivity: 0.001,
      dragSensitivity: 0.0002,
    },
    compatibleVehicles: ['coupe', 'gt3_supercar', 'hypercar'],
  },

  vortexGenerators: {
    id: 'vortexGenerators',
    name: 'Roof Vortex Generators',
    categoryName: 'Roof Aerodynamics',
    subTabId: 'roofAero',
    glbPath: '/models/aero/AERO_ROOF_AERO_001.glb',
    focusTargetNode: 'RoofAero_FocusTarget',
    preferredCamera: {
      position: [1.20, 1.75, -1.25],
      target: [0.0, 1.28, -1.18],
      fov: 32,
    },
    nodes: {
      root: 'RoofAero_Root',
      focusTarget: 'RoofAero_FocusTarget',
      movableParts: ['Roof_VortexGenerators'],
    },
    parameters: [],
    aeroCoefficients: {
      baseDownforceCl: 0.04,
      baseDragCd: 0.003,
      copOffsetXM: -1.20,
      copOffsetZM: 1.25,
      downforceSensitivity: 0.001,
      dragSensitivity: 0.0001,
    },
    compatibleVehicles: ['sedan', 'coupe', 'gt3_supercar', 'hypercar'],
  },

  coolingLouvers: {
    id: 'coolingLouvers',
    name: 'Hood Extraction Louvers',
    categoryName: 'Cooling Aerodynamics',
    subTabId: 'coolingAero',
    glbPath: '/models/aero/AERO_COOLING_AERO_001.glb',
    focusTargetNode: 'CoolingAero_FocusTarget',
    preferredCamera: {
      position: [1.20, 1.25, 1.75],
      target: [0.42, 0.72, 1.35],
      fov: 34,
    },
    nodes: {
      root: 'CoolingAero_Root',
      focusTarget: 'CoolingAero_FocusTarget',
      movableParts: ['Cooling_HoodLouvers_L', 'Cooling_HoodLouvers_R'],
    },
    parameters: [],
    aeroCoefficients: {
      baseDownforceCl: 0.08,
      baseDragCd: 0.010,
      copOffsetXM: 1.35,
      copOffsetZM: 0.72,
      downforceSensitivity: 0.002,
      dragSensitivity: 0.0005,
    },
    compatibleVehicles: ['sedan', 'coupe', 'gt3_supercar', 'hypercar'],
  },

  brakeDucts: {
    id: 'brakeDucts',
    name: 'Front Brake Cooling Ducts',
    categoryName: 'Cooling Aerodynamics',
    subTabId: 'coolingAero',
    glbPath: '/models/aero/AERO_COOLING_AERO_001.glb',
    focusTargetNode: 'CoolingAero_FocusTarget',
    preferredCamera: {
      position: [1.40, 0.45, 2.50],
      target: [0.65, 0.28, 2.18],
      fov: 34,
    },
    nodes: {
      root: 'CoolingAero_Root',
      focusTarget: 'CoolingAero_FocusTarget',
      movableParts: ['Cooling_BrakeDucts_L', 'Cooling_BrakeDucts_R'],
    },
    parameters: [],
    aeroCoefficients: {
      baseDownforceCl: 0.04,
      baseDragCd: 0.006,
      copOffsetXM: 1.80,
      copOffsetZM: 0.28,
      downforceSensitivity: 0.001,
      dragSensitivity: 0.0005,
    },
    compatibleVehicles: ['sedan', 'coupe', 'gt3_supercar', 'hypercar'],
  },

  wheelDiscs: {
    id: 'wheelDiscs',
    name: 'Turbofan Aero Wheel Discs',
    categoryName: 'Wheel Aerodynamics',
    subTabId: 'wheelAero',
    glbPath: '/models/aero/AERO_WHEEL_AERO_001.glb',
    focusTargetNode: 'WheelAero_FocusTarget',
    preferredCamera: {
      position: [1.85, 0.45, 1.45],
      target: [0.95, 0.35, 1.35],
      fov: 34,
    },
    nodes: {
      root: 'WheelAero_Root',
      focusTarget: 'WheelAero_FocusTarget',
      movableParts: ['Wheel_AeroDisc_FL', 'Wheel_AeroDisc_FR', 'Wheel_AeroDisc_RL', 'Wheel_AeroDisc_RR'],
    },
    parameters: [],
    aeroCoefficients: {
      baseDownforceCl: 0.06,
      baseDragCd: -0.015,
      copOffsetXM: 0.0,
      copOffsetZM: 0.34,
      downforceSensitivity: 0.001,
      dragSensitivity: -0.001,
    },
    compatibleVehicles: ['sedan', 'coupe', 'gt3_supercar', 'hypercar'],
  },

  wheelSpats: {
    id: 'wheelSpats',
    name: 'Wheel Spat Deflectors',
    categoryName: 'Wheel Aerodynamics',
    subTabId: 'wheelAero',
    glbPath: '/models/aero/AERO_WHEEL_AERO_001.glb',
    focusTargetNode: 'WheelAero_FocusTarget',
    preferredCamera: {
      position: [1.75, 0.35, 1.65],
      target: [0.92, 0.25, 1.45],
      fov: 36,
    },
    nodes: {
      root: 'WheelAero_Root',
      focusTarget: 'WheelAero_FocusTarget',
      movableParts: ['Wheel_Spats_FL', 'Wheel_Spats_FR', 'Wheel_Spats_RL', 'Wheel_Spats_RR'],
    },
    parameters: [],
    aeroCoefficients: {
      baseDownforceCl: 0.04,
      baseDragCd: -0.008,
      copOffsetXM: 0.0,
      copOffsetZM: 0.12,
      downforceSensitivity: 0.001,
      dragSensitivity: -0.0005,
    },
    compatibleVehicles: ['sedan', 'coupe', 'gt3_supercar', 'hypercar'],
  },

  activeWing: {
    id: 'activeWing',
    name: 'Active DRS Rear Wing',
    categoryName: 'Active Aerodynamics',
    subTabId: 'activeAero',
    glbPath: '/models/aero/AERO_ACTIVE_AERO_001.glb',
    focusTargetNode: 'ActiveAero_FocusTarget',
    preferredCamera: {
      position: [1.80, 1.45, -2.75],
      target: [0.0, 1.10, -2.12],
      fov: 36,
    },
    nodes: {
      root: 'ActiveAero_Root',
      focusTarget: 'ActiveAero_FocusTarget',
      hinges: ['Active_Hinge'],
      movableParts: ['Active_Wing_Blade'],
    },
    parameters: [],
    aeroCoefficients: {
      baseDownforceCl: 0.85,
      baseDragCd: 0.080,
      copOffsetXM: -2.10,
      copOffsetZM: 1.08,
      downforceSensitivity: 0.025,
      dragSensitivity: 0.02,
    },
    compatibleVehicles: ['gt3_supercar', 'hypercar'],
  },

  activeAirbrake: {
    id: 'activeAirbrake',
    name: 'Dynamic Airbrake Deployer',
    categoryName: 'Active Aerodynamics',
    subTabId: 'activeAero',
    glbPath: '/models/aero/AERO_ACTIVE_AERO_001.glb',
    focusTargetNode: 'ActiveAero_FocusTarget',
    preferredCamera: {
      position: [1.80, 1.45, -2.75],
      target: [0.0, 1.10, -2.12],
      fov: 36,
    },
    nodes: {
      root: 'ActiveAero_Root',
      focusTarget: 'ActiveAero_FocusTarget',
      hinges: ['Active_Hinge'],
      movableParts: ['Active_Wing_Blade', 'Active_Actuator_Piston_L', 'Active_Actuator_Piston_R'],
    },
    parameters: [],
    aeroCoefficients: {
      baseDownforceCl: 1.10,
      baseDragCd: 0.35,
      copOffsetXM: -2.10,
      copOffsetZM: 1.15,
      downforceSensitivity: 0.035,
      dragSensitivity: 0.045,
    },
    compatibleVehicles: ['gt3_supercar', 'hypercar'],
  },
};
