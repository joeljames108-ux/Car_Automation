// ============================================================================
// MULTI-MODE 3D VISUALIZATION CAPABILITIES REGISTRY
// ============================================================================
// Comprehensive engineering specifications for /exploded, /360, /anatomy,
// and /cutaway modes across all core vehicle subsystems:
// - Engine, Turbo, Transmission, Differential, Suspension, Brakes,
//   Wheels & Tires, Aerodynamics, Interior Cockpit, Battery / EV Pack.
// ============================================================================

import * as THREE from 'three';

export type VisualizationMode = '360' | 'exploded' | 'anatomy' | 'cutaway' | 'xray';

export type FlowPathType = 'coolant' | 'oil' | 'air' | 'fuel' | 'exhaust' | 'power';

export interface ComponentAnatomyPart {
  name: string;
  category: string;
  description: string;
  whyItExists: string;
  material: string;
  operatingRange?: string;
  tolerances?: string;
}

export interface FlowPathDefinition {
  id: string;
  name: string;
  type: FlowPathType;
  colorHex: number;
  glowHex: number;
  points: [number, number, number][];
  flowRateDescription: string;
}

export interface SubsystemCapability {
  id: string;
  name: string;
  category:
    | 'engine'
    | 'turbo'
    | 'transmission'
    | 'differential'
    | 'suspension'
    | 'brakes'
    | 'wheels'
    | 'aero'
    | 'interior'
    | 'battery'
    | 'full_car';
  icon: string;
  modes: {
    has360: boolean;
    hasExploded: boolean;
    hasAnatomy: boolean;
    hasCutaway: boolean;
    hasXRay: boolean;
  };
  anatomy: {
    summary: string;
    engineeringRole: string;
    specs: { label: string; value: string }[];
    parts: ComponentAnatomyPart[];
    flows: FlowPathDefinition[];
  };
  explodedConfig: {
    maxDisplacement: number;
    parts: {
      matchPattern: string; // name pattern to match
      vector: [number, number, number]; // displacement direction
      distance: number;
      order: number; // sequential explosion order 1..N
    }[];
  };
  cutawayConfig: {
    defaultPlane: 'X' | 'Y' | 'Z';
    defaultDepth: number; // -1.0 to 1.0
    invertNormal: boolean;
    cutDescription: string;
  };
  cameraPresets: {
    name: string;
    pos: [number, number, number];
    target: [number, number, number];
    fov: number;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBSYSTEM DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export const SUBSYSTEM_CAPABILITIES: Record<string, SubsystemCapability> = {
  // ── 1. ENGINE ──
  engine: {
    id: 'engine',
    name: 'Twin-Turbocharged V8 / V12 Powertrain',
    category: 'engine',
    icon: '⚡',
    modes: { has360: true, hasExploded: true, hasAnatomy: true, hasCutaway: true, hasXRay: true },
    anatomy: {
      summary: 'High-revving, dry-sump internal combustion engine delivering extreme volumetric efficiency and immediate throttle response.',
      engineeringRole: 'Converts chemical energy into rotational torque through synchronized four-stroke combustion cycles.',
      specs: [
        { label: 'Displacement', value: '4.0L – 6.5L' },
        { label: 'Max Redline', value: '9,000 – 11,100 RPM' },
        { label: 'Peak Power', value: '750 – 1,020 HP' },
        { label: 'Oil Pressure', value: '5.5 bar @ 8,000 RPM' },
        { label: 'Coolant Operating Temp', value: '88°C – 94°C' },
      ],
      parts: [
        {
          name: 'Cylinder Block & Liners',
          category: 'Core Structure',
          description: 'A356-T6 forged aluminum alloy crankcase featuring Nikasil-coated cylinder bores and cast iron bedplate cross-bolting.',
          whyItExists: 'Withstands extreme peak cylinder combustion pressures (>180 bar) while providing rigid journals for the crankshaft.',
          material: 'A356-T6 Billet Aluminum / Nikasil',
          tolerances: '0.005mm bore roundness',
        },
        {
          name: 'Billet Flat-Plane Crankshaft',
          category: 'Rotating Assembly',
          description: 'Counterweighted 180° flat-plane crankshaft forged from 4340 nitrided steel with micro-polished journals and lightning pockets.',
          whyItExists: 'Transforms reciprocating linear motion of the pistons into continuous rotational drive torque with minimal rotational inertia.',
          material: '4340 Forged Nitrided Steel',
          tolerances: 'Dynamic balance within 0.25 g-cm',
        },
        {
          name: 'Forged Pistons & H-Beam Rods',
          category: 'Combustion Chamber',
          description: 'Slipper-skirt 2618 alloy pistons with DLC-coated wrist pins mated to forged titanium/chromoly H-beam connecting rods.',
          whyItExists: 'Captures burning gas expansion forces and transfers tensile/compressive loads directly to the rod journals at 25 m/s piston speeds.',
          material: '2618 Forged Alloy & Titanium',
          operatingRange: '-30°C to +320°C crown temp',
        },
        {
          name: 'DOHC Cylinder Heads & Titanium Valves',
          category: 'Valvetrain',
          description: 'Crossflow 4-valve combustion chambers with hollow sodium-filled exhaust valves and dual overhead camshafts with finger followers.',
          whyItExists: 'Controls precise charge intake breathing and exhaust gas evacuation timed down to fractions of a millisecond.',
          material: 'Precision Cast Aluminum & Titanium',
        },
        {
          name: 'High-Pressure Direct Injection Rails',
          category: 'Fuel Delivery',
          description: '350-bar stainless steel common rails feeding piezo-electric direct injectors positioned centrally in each combustion dome.',
          whyItExists: 'Atomizes high-octane racing fuel into micro-droplets (<10 microns) for ultra-fast, knock-resistant flame front propagation.',
          material: 'Stainless Steel 316L',
          operatingRange: '200 to 350 bar',
        },
      ],
      flows: [
        {
          id: 'engine_oil',
          name: 'Dry-Sump Lubricating Circuit',
          type: 'oil',
          colorHex: 0xf59e0b,
          glowHex: 0xd97706,
          flowRateDescription: '65 L/min @ 9,000 RPM',
          points: [
            [-0.30, 0.20, 0.40],
            [-0.10, 0.25, 0.20],
            [0.0, 0.32, 0.0],
            [0.15, 0.45, -0.20],
            [0.15, 0.65, -0.20],
            [-0.15, 0.65, -0.20],
            [0.0, 0.22, -0.10],
          ],
        },
        {
          id: 'engine_coolant',
          name: 'Cylinder Jacket Cooling Loop',
          type: 'coolant',
          colorHex: 0x06b6d4,
          glowHex: 0x0284c7,
          flowRateDescription: '180 L/min pressurized water-glycol',
          points: [
            [0.0, 0.35, -2.10],
            [0.0, 0.25, -1.20],
            [0.0, 0.35, 0.10],
            [0.22, 0.50, 0.10],
            [0.22, 0.50, -0.30],
            [-0.22, 0.50, -0.30],
            [-0.22, 0.50, 0.10],
            [0.0, 0.45, -0.40],
            [0.0, 0.35, -2.10],
          ],
        },
        {
          id: 'engine_air',
          name: 'Charge Air Intake Stream',
          type: 'air',
          colorHex: 0x38bdf8,
          glowHex: 0x0284c7,
          flowRateDescription: '1,400 kg/hr @ full boost',
          points: [
            [0.0, 1.15, 0.10],
            [0.0, 0.85, 0.0],
            [0.0, 0.68, 0.0],
            [0.18, 0.62, -0.10],
            [-0.18, 0.62, -0.10],
          ],
        },
        {
          id: 'engine_fuel',
          name: 'Direct Injection Rail',
          type: 'fuel',
          colorHex: 0x22c55e,
          glowHex: 0x16a34a,
          flowRateDescription: '350 bar pulsed injection',
          points: [
            [-0.18, 0.68, 0.15],
            [-0.18, 0.68, -0.25],
            [0.18, 0.68, -0.25],
            [0.18, 0.68, 0.15],
          ],
        },
        {
          id: 'engine_exhaust',
          name: 'High-Temperature Exhaust Evacuation',
          type: 'exhaust',
          colorHex: 0xef4444,
          glowHex: 0xb91c1c,
          flowRateDescription: '950°C gas pulses @ 1.8 bar backpressure',
          points: [
            [0.28, 0.45, -0.10],
            [0.32, 0.38, 0.15],
            [0.26, 0.42, 0.55],
            [0.20, 0.35, 1.20],
            [0.15, 0.28, 2.20],
          ],
        },
        {
          id: 'engine_power',
          name: 'Mechanical Torque Path',
          type: 'power',
          colorHex: 0xd946ef,
          glowHex: 0xa21caf,
          flowRateDescription: '1,100 Nm torque output',
          points: [
            [0.0, 0.35, 0.10],
            [0.0, 0.35, 0.55],
            [0.0, 0.35, 1.05],
            [0.0, 0.32, 1.65],
            [0.45, 0.34, 1.35],
            [-0.45, 0.34, 1.35],
          ],
        },
      ],
    },
    explodedConfig: {
      maxDisplacement: 0.85,
      parts: [
        { matchPattern: 'cover', vector: [0, 1, 0], distance: 0.45, order: 1 },
        { matchPattern: 'intake', vector: [0, 1, 0.2], distance: 0.65, order: 1 },
        { matchPattern: 'head', vector: [0.6, 0.8, 0], distance: 0.55, order: 2 },
        { matchPattern: 'cam', vector: [0.5, 0.9, 0], distance: 0.50, order: 2 },
        { matchPattern: 'valve', vector: [0.3, 0.7, 0], distance: 0.40, order: 3 },
        { matchPattern: 'piston', vector: [0.4, 0.5, 0], distance: 0.45, order: 4 },
        { matchPattern: 'rod', vector: [0.3, 0.3, 0], distance: 0.35, order: 4 },
        { matchPattern: 'crank', vector: [0, -0.8, 0], distance: 0.45, order: 5 },
        { matchPattern: 'block', vector: [0, 0, 0], distance: 0.0, order: 0 },
        { matchPattern: 'exhaust', vector: [1, -0.2, 0.2], distance: 0.65, order: 2 },
      ],
    },
    cutawayConfig: {
      defaultPlane: 'X',
      defaultDepth: 0.0,
      invertNormal: false,
      cutDescription: 'Sagittal section exposing cylinder bores #1-#4, piston crowns, and crankshaft throws.',
    },
    cameraPresets: [
      { name: 'Isometric Hero', pos: [1.2, 1.1, 1.4], target: [0, 0.4, 0], fov: 42 },
      { name: 'Top Valvetrain', pos: [0, 2.0, 0.1], target: [0, 0.4, 0], fov: 38 },
      { name: 'Crankcase Bottom', pos: [0, -1.2, 0.8], target: [0, 0.3, 0], fov: 40 },
      { name: 'Front Pulley Timing', pos: [0, 0.4, -1.5], target: [0, 0.4, 0], fov: 36 },
    ],
  },

  // ── 2. TURBOCHARGER ──
  turbo: {
    id: 'turbo',
    name: 'Billet Aerofoil Twin-Scroll Turbocharger',
    category: 'turbo',
    icon: '🌪️',
    modes: { has360: true, hasExploded: true, hasAnatomy: true, hasCutaway: true, hasXRay: true },
    anatomy: {
      summary: 'High-temperature ceramic ball-bearing twin-scroll turbocharger with milled billet compressor wheel.',
      engineeringRole: 'Harvests wasted kinetic and thermal exhaust gas energy to compress ambient intake air for forced induction.',
      specs: [
        { label: 'Max Turbine Speed', value: '165,000 RPM' },
        { label: 'Peak Boost Pressure', value: '2.4 bar (35 psi)' },
        { label: 'Turbine Inlet Temp', value: 'Up to 1,020°C' },
        { label: 'Bearing Type', value: 'Dual Ceramic Ball Bearing Cartridge' },
      ],
      parts: [
        {
          name: 'Billet Compressor Wheel',
          category: 'Cold Side',
          description: 'CNC point-milled 2618 aluminum impellor featuring extended-tip aero geometry and 11 splitter blades.',
          whyItExists: 'Pulls ambient charge air axially and accelerates it radially at Mach speeds into the diffuser volute.',
          material: 'Forged 2618-T6 Billet Aluminum',
          tolerances: 'Zero-plane dual-axis dynamic balance',
        },
        {
          name: 'Inconel Turbine Wheel & Shaft',
          category: 'Hot Side',
          description: 'Superalloy Inconel 713C investment-cast turbine wheel friction-welded to a high-tensile induction-hardened steel shaft.',
          whyItExists: 'Survives 1,000°C sonic exhaust gas bombardment, extracting kinetic force to spin the common shaft.',
          material: 'Inconel 713C & Induction-Hardened 4340',
        },
        {
          name: 'Center Housing Rotating Assembly (CHRA)',
          category: 'Bearing Core',
          description: 'Ductile iron bearing cartridge with water-cooling jacket and dual ceramic angular-contact ball bearings.',
          whyItExists: 'Supports shaft rotation at 165,000 RPM with minimal frictional loss and prevents thermal oil coking upon shutdown.',
          material: 'Ductile Cast Iron & Ceramic Silicon Nitride',
        },
        {
          name: 'Dual-Port Wastegate Actuator',
          category: 'Boost Regulation',
          description: 'Pneumatic canister with internal fluoroelastomer diaphragm and calibrated spring controlling the internal bypass flapper.',
          whyItExists: 'Diverts excess exhaust gas around the turbine to maintain target manifold boost and avoid engine overpressure.',
          material: 'Stamped Stainless Steel & FKM Diaphragm',
        },
      ],
      flows: [
        {
          id: 'turbo_air_boost',
          name: 'Compressed Air Charge Outflow',
          type: 'air',
          colorHex: 0x38bdf8,
          glowHex: 0x0284c7,
          flowRateDescription: '2.4 bar absolute pressure',
          points: [
            [-0.32, 0.40, -0.10],
            [-0.38, 0.42, 0.15],
            [-0.45, 0.35, -0.45],
            [-0.45, 0.28, -1.25],
          ],
        },
        {
          id: 'turbo_oil_feed',
          name: 'Cartridge High-Pressure Oil Feed',
          type: 'oil',
          colorHex: 0xf59e0b,
          glowHex: 0xd97706,
          flowRateDescription: '4.0 bar filtered dry-sump feed',
          points: [
            [-0.20, 0.55, 0.10],
            [-0.35, 0.46, 0.10],
            [-0.35, 0.32, 0.10],
          ],
        },
      ],
    },
    explodedConfig: {
      maxDisplacement: 0.60,
      parts: [
        { matchPattern: 'compressor_cover', vector: [0, 0, -1], distance: 0.40, order: 1 },
        { matchPattern: 'compressor_wheel', vector: [0, 0, -1], distance: 0.28, order: 2 },
        { matchPattern: 'turbine_cover', vector: [0, 0, 1], distance: 0.40, order: 1 },
        { matchPattern: 'turbine_wheel', vector: [0, 0, 1], distance: 0.28, order: 2 },
        { matchPattern: 'chra', vector: [0, 0.5, 0], distance: 0.20, order: 3 },
        { matchPattern: 'wastegate', vector: [-1, 0.5, 0], distance: 0.35, order: 1 },
      ],
    },
    cutawayConfig: {
      defaultPlane: 'Z',
      defaultDepth: 0.0,
      invertNormal: false,
      cutDescription: 'Coronal cut bisecting the turbine housing, bearing cartridge, and compressor volute.',
    },
    cameraPresets: [
      { name: 'Compressor Face', pos: [-0.6, 0.5, -0.5], target: [-0.35, 0.4, 0.1], fov: 36 },
      { name: 'Turbine Hot Side', pos: [-0.6, 0.5, 0.7], target: [-0.35, 0.4, 0.1], fov: 36 },
    ],
  },

  // ── 3. TRANSMISSION ──
  transmission: {
    id: 'transmission',
    name: '7-Speed Dual-Clutch Sequential Transaxle',
    category: 'transmission',
    icon: '⚙️',
    modes: { has360: true, hasExploded: true, hasAnatomy: true, hasCutaway: true, hasXRay: true },
    anatomy: {
      summary: 'Rear-mounted dual-clutch transmission with integrated electronic limited-slip differential and paddle actuation.',
      engineeringRole: 'Multiplies engine torque and provides rapid, seamless gear transitions (sub-30ms) without power interruption.',
      specs: [
        { label: 'Gear Ratios', value: '1st: 3.91 to 7th: 0.84' },
        { label: 'Shift Time', value: '28 milliseconds' },
        { label: 'Max Input Torque', value: '1,200 Nm' },
        { label: 'Clutch Type', value: 'Wet Multi-Plate Dual Clutch' },
      ],
      parts: [
        {
          name: 'Dual-Clutch Pack Assembly',
          category: 'Input Coupling',
          description: 'Concentric wet multi-plate clutch packs with carbon-sintered friction discs actuated by electro-hydraulic solenoid valves.',
          whyItExists: 'Pre-selects odd and even gear sets simultaneously so shifting requires only transferring pressure from one clutch to the other.',
          material: 'Carbon-Sintered Steel & Billet Basket',
        },
        {
          name: 'Helical Main & Counter Shafts',
          category: 'Gears & Shafts',
          description: 'Dual input nested concentric shafts driving case-hardened 8620 steel helical gear pairs on needle roller bearings.',
          whyItExists: 'Delivers high torque multiplication with angled gear teeth providing quiet operation and high contact area.',
          material: '8620 Case-Hardened Steel',
          tolerances: 'DIN 4 precision gear grinding',
        },
        {
          name: 'Carbon-Composite Synchronizers',
          category: 'Engagement',
          description: 'Triple-cone synchronizer rings with carbon-friction lining equalizing shaft speeds prior to dog-ring lockup.',
          whyItExists: 'Matches rotational speeds between gear and shaft in milliseconds to prevent gear clash during aggressive downshifts.',
          material: 'Carbon-Friction Lined Brass/Steel',
        },
      ],
      flows: [
        {
          id: 'trans_torque',
          name: 'Rotational Drive Torque Flow',
          type: 'power',
          colorHex: 0xd946ef,
          glowHex: 0xa21caf,
          flowRateDescription: 'Full engine torque transfer',
          points: [
            [0.0, 0.35, 0.65],
            [0.0, 0.35, 1.10],
            [0.0, 0.30, 1.55],
            [0.35, 0.34, 1.35],
            [-0.35, 0.34, 1.35],
          ],
        },
      ],
    },
    explodedConfig: {
      maxDisplacement: 0.75,
      parts: [
        { matchPattern: 'case', vector: [0, 0.8, 0], distance: 0.50, order: 1 },
        { matchPattern: 'shaft', vector: [0, 0, -1], distance: 0.40, order: 2 },
        { matchPattern: 'gear', vector: [0.6, 0, 0], distance: 0.35, order: 3 },
        { matchPattern: 'clutch', vector: [0, 0, -1], distance: 0.55, order: 1 },
        { matchPattern: 'diff', vector: [0, 0, 1], distance: 0.45, order: 2 },
      ],
    },
    cutawayConfig: {
      defaultPlane: 'Y',
      defaultDepth: 0.35,
      invertNormal: false,
      cutDescription: 'Horizontal plane slicing top casing off to display input shafts, gear teeth, and shift forks.',
    },
    cameraPresets: [
      { name: 'Transaxle 3/4', pos: [1.2, 0.8, 1.6], target: [0, 0.32, 1.2], fov: 40 },
      { name: 'Side Gear Stack', pos: [1.8, 0.35, 1.2], target: [0, 0.32, 1.2], fov: 36 },
    ],
  },

  // ── 4. BRAKES ──
  brakes: {
    id: 'brakes',
    name: 'Carbon-Ceramic Matrix (CCM) Braking System',
    category: 'brakes',
    icon: '🛑',
    modes: { has360: true, hasExploded: true, hasAnatomy: true, hasCutaway: true, hasXRay: true },
    anatomy: {
      summary: '6-piston monobloc front and 4-piston rear carbon-ceramic disc braking system with floating rotor hats.',
      engineeringRole: 'Converts vehicle kinetic energy into thermal dissipation to achieve massive deceleration (>1.8G) without fade.',
      specs: [
        { label: 'Rotor Diameter', value: 'Front: 398mm / Rear: 380mm' },
        { label: 'Rotor Thickness', value: '38mm cross-drilled' },
        { label: 'Caliper Construction', value: 'Billet Aluminum Monobloc' },
        { label: 'Friction Coefficient', value: '0.48 – 0.54 μ' },
        { label: 'Max Operating Temp', value: 'Up to 1,000°C' },
      ],
      parts: [
        {
          name: 'Monobloc 6-Piston Caliper',
          category: 'Hydraulic Clamp',
          description: 'CNC-milled single-piece billet aluminum caliper housing differential-bore titanium pistons with ceramic heat caps.',
          whyItExists: 'Eliminates caliper bridge deflection under high pedal pressures (>80 bar) to ensure rock-solid brake pedal feel.',
          material: 'Billet 7075-T6 Aerospace Aluminum',
        },
        {
          name: 'Carbon-Silicon Carbide (C/SiC) Disc',
          category: 'Friction Surface',
          description: '3D carbon-fiber needle felt infused with liquid silicon carbide at 1,700°C with internal directional cooling vanes.',
          whyItExists: 'Saves 60% unsprung weight compared to cast iron while eliminating thermal deformation and brake fade under racing conditions.',
          material: 'Carbon-Silicon Carbide Matrix',
        },
        {
          name: 'Floating Titanium Drive Bobbins',
          category: 'Mounting',
          description: '12 radial grade-5 titanium drive pegs with spring-steel anti-rattle clips connecting rotor to center hat.',
          whyItExists: 'Allows radial thermal expansion of the carbon disc relative to the aluminum hub without inducing warping or shear stress.',
          material: 'Grade 5 Titanium (Ti-6Al-4V)',
        },
      ],
      flows: [
        {
          id: 'brake_fluid',
          name: 'High-Pressure Hydraulic Fluid Pulse',
          type: 'coolant',
          colorHex: 0xf59e0b,
          glowHex: 0xd97706,
          flowRateDescription: '80 bar pedal clamping pressure',
          points: [
            [-0.35, 0.45, -0.65],
            [-0.65, 0.35, -1.15],
            [-0.82, 0.38, -1.35],
          ],
        },
      ],
    },
    explodedConfig: {
      maxDisplacement: 0.55,
      parts: [
        { matchPattern: 'wheel', vector: [-1, 0, 0], distance: 0.55, order: 1 },
        { matchPattern: 'caliper', vector: [0, 0.8, -0.4], distance: 0.35, order: 2 },
        { matchPattern: 'pad', vector: [-0.4, 0.5, 0], distance: 0.25, order: 3 },
        { matchPattern: 'rotor', vector: [-1, 0, 0], distance: 0.28, order: 4 },
        { matchPattern: 'bobbin', vector: [-1, 0, 0], distance: 0.32, order: 4 },
        { matchPattern: 'hub', vector: [0, 0, 0], distance: 0.0, order: 0 },
      ],
    },
    cutawayConfig: {
      defaultPlane: 'X',
      defaultDepth: -0.84,
      invertNormal: true,
      cutDescription: 'Transverse cut slicing open caliper body to reveal piston cylinders, fluid passages, and pad backing plates.',
    },
    cameraPresets: [
      { name: 'Caliper Close-Up', pos: [-1.4, 0.45, -1.35], target: [-0.84, 0.34, -1.35], fov: 32 },
      { name: 'Rotor Face', pos: [-1.6, 0.34, -1.35], target: [-0.84, 0.34, -1.35], fov: 30 },
    ],
  },

  // ── 5. SUSPENSION ──
  suspension: {
    id: 'suspension',
    name: 'Double-Wishbone Pushrod Suspension System',
    category: 'suspension',
    icon: '🛞',
    modes: { has360: true, hasExploded: true, hasAnatomy: true, hasCutaway: true, hasXRay: true },
    anatomy: {
      summary: 'Independent double A-arm suspension with inboard pushrods, aluminum rocker bellcranks, and remote-reservoir coilovers.',
      engineeringRole: 'Maintains optimal tire contact patch camber and toe throughout wheel travel while controlling pitch, roll, and heave.',
      specs: [
        { label: 'Front Wheel Travel', value: '±55 mm bump / rebound' },
        { label: 'Damper Type', value: '4-Way Adjustable Inboard Coilover' },
        { label: 'Roll Stiffness', value: '2,800 Nm / degree' },
        { label: 'Anti-Roll Bar', value: 'Tubular Chromoly with Blade Adjusters' },
      ],
      parts: [
        {
          name: 'Aerodynamic Carbon A-Arms',
          category: 'Linkage',
          description: 'Upper and lower wishbone arms wrapped in aerodynamic carbon teardrop fairings with spherical uniball joints.',
          whyItExists: 'Transmits lateral and longitudinal tire loads into the monocoque chassis while minimizing aerodynamic wake drag.',
          material: 'High-Modulus Carbon Fiber & Chromoly',
        },
        {
          name: 'Inboard Pushrod & CNC Rocker',
          category: 'Actuation',
          description: 'Diagonal carbon pushrod driving an anodized CNC aluminum rocker bellcrank with progressive motion ratio.',
          whyItExists: 'Moves heavy spring and damper units inboard to reduce unsprung mass and improve frontal aerodynamic packaging.',
          material: 'Carbon Tube & Billet 7075-T6 Aluminum',
        },
        {
          name: 'Piggyback Nitrogen Coilover Damper',
          category: 'Damping',
          description: 'Lightweight aluminum shock body with high/low speed compression and rebound clickers, helical spring, and bump stop.',
          whyItExists: 'Dissipates road surface energy and controls chassis pitch under braking and roll under hard cornering.',
          material: 'Hard-Anodized Aluminum & High-Tensile Steel',
        },
      ],
      flows: [],
    },
    explodedConfig: {
      maxDisplacement: 0.65,
      parts: [
        { matchPattern: 'spring', vector: [0, 0.8, 0], distance: 0.35, order: 1 },
        { matchPattern: 'damper', vector: [0, 0.5, 0], distance: 0.25, order: 2 },
        { matchPattern: 'wishbone', vector: [-0.6, 0.2, 0], distance: 0.40, order: 2 },
        { matchPattern: 'pushrod', vector: [-0.4, 0.6, 0], distance: 0.30, order: 3 },
        { matchPattern: 'upright', vector: [-1.0, 0, 0], distance: 0.45, order: 1 },
      ],
    },
    cutawayConfig: {
      defaultPlane: 'Z',
      defaultDepth: -1.35,
      invertNormal: false,
      cutDescription: 'Section through damper cartridge exposing piston shims, oil valves, and pressurized nitrogen chamber.',
    },
    cameraPresets: [
      { name: 'Front Suspension Bay', pos: [-1.2, 0.9, -1.0], target: [-0.5, 0.35, -1.35], fov: 38 },
      { name: 'Rocker Linkage', pos: [0, 1.2, -1.2], target: [0, 0.55, -1.35], fov: 35 },
    ],
  },

  // ── 6. AERODYNAMICS ──
  aero: {
    id: 'aero',
    name: 'High-Downforce Active Aerodynamics Suite',
    category: 'aero',
    icon: '🪶',
    modes: { has360: true, hasExploded: true, hasAnatomy: true, hasCutaway: true, hasXRay: true },
    anatomy: {
      summary: 'Integrated aerodynamic downforce package with front venturi splitter, rear diffuser strakes, and swan-neck active DRS rear wing.',
      engineeringRole: 'Generates up to 1,200 kg of aerodynamic downforce at 250 km/h with minimal induced drag penalty.',
      specs: [
        { label: 'Downforce @ 250 km/h', value: '1,150 kg (GT3 Spec)' },
        { label: 'Lift-to-Drag Ratio (L/D)', value: '3.45 : 1' },
        { label: 'DRS Drag Reduction', value: '-32% rear wing drag' },
        { label: 'Front/Rear Aero Balance', value: '44% Front / 56% Rear' },
      ],
      parts: [
        {
          name: 'Front Carbon Splitter with Venturi Keel',
          category: 'Front Aero',
          description: 'Full-width prepreg carbon splitter plate featuring dual upward venturi ramps, turnbuckle struts, and titanium skid pucks.',
          whyItExists: 'Creates high stagnation pressure on top and low pressure underneath, pinning the front axle for precise turn-in bite.',
          material: 'Prepreg Autoclaved Carbon Fiber & Titanium',
        },
        {
          name: 'Swan-Neck Dual-Element Rear Wing',
          category: 'Rear Aero',
          description: 'High-aspect-ratio carbon mainplane suspended from top-mount CNC aluminum pylons with adjustable Gurney flap and DRS flap.',
          whyItExists: 'Prevents flow separation on the high-suction lower surface of the wing, generating massive rear downforce for high-speed stability.',
          material: 'Toray T800 Carbon Fiber & 7075-T6 Pylons',
        },
        {
          name: 'Multi-Channel Rear Venturi Diffuser',
          category: 'Underbody Aero',
          description: 'Stepped underfloor venturi tunnels expanding upward at 14° with 6 vertical strakes and trailing edge serrations.',
          whyItExists: 'Expands high-velocity underbody air back to atmospheric pressure, creating massive ground effect suction across the flat floor.',
          material: 'Prepreg Carbon Fiber Sandwich Core',
        },
      ],
      flows: [
        {
          id: 'aero_downforce',
          name: 'Aerodynamic Airflow Streamlines',
          type: 'air',
          colorHex: 0x38bdf8,
          glowHex: 0x0284c7,
          flowRateDescription: '250 km/h boundary layer airflow',
          points: [
            [0.0, 0.15, -2.40],
            [0.0, 0.40, -1.80],
            [0.0, 0.70, -0.60],
            [0.0, 1.05, 0.40],
            [0.0, 1.15, 1.40],
            [0.0, 1.18, 2.20],
          ],
        },
      ],
    },
    explodedConfig: {
      maxDisplacement: 0.80,
      parts: [
        { matchPattern: 'wing', vector: [0, 0.8, 0.5], distance: 0.65, order: 1 },
        { matchPattern: 'pylon', vector: [0, 0.4, 0.2], distance: 0.35, order: 2 },
        { matchPattern: 'endplate', vector: [0.8, 0, 0], distance: 0.40, order: 1 },
        { matchPattern: 'splitter', vector: [0, -0.4, -0.6], distance: 0.55, order: 1 },
        { matchPattern: 'diffuser', vector: [0, -0.4, 0.6], distance: 0.55, order: 1 },
        { matchPattern: 'canard', vector: [0.6, 0.2, -0.4], distance: 0.35, order: 2 },
      ],
    },
    cutawayConfig: {
      defaultPlane: 'X',
      defaultDepth: 0.0,
      invertNormal: false,
      cutDescription: 'Centerline sagittal cut showing inverted airfoil profiles, throat curvature, and diffuser angle.',
    },
    cameraPresets: [
      { name: 'Rear Wing Aerofoil', pos: [0, 1.6, 2.8], target: [0, 1.15, 2.1], fov: 38 },
      { name: 'Front Splitter Keel', pos: [0, 0.3, -2.8], target: [0, 0.15, -2.0], fov: 36 },
      { name: 'Diffuser Tunnels', pos: [0, -0.2, 2.6], target: [0, 0.25, 1.8], fov: 40 },
    ],
  },

  // ── 7. FULL CAR ──
  full_car: {
    id: 'full_car',
    name: 'Complete Modular Vehicle Monocoque & Subassemblies',
    category: 'full_car',
    icon: '🏎️',
    modes: { has360: true, hasExploded: true, hasAnatomy: true, hasCutaway: true, hasXRay: true },
    anatomy: {
      summary: 'Complete carbon-fiber monocoque chassis integrating front/rear subframes, powertrain, suspension, and aerodynamic body panels.',
      engineeringRole: 'Integrates all subassemblies into an FIA-compliant high-performance racing vehicle.',
      specs: [
        { label: 'Curb Mass', value: '1,180 kg (Homologated GT3)' },
        { label: 'Weight Distribution', value: '46.5% Front / 53.5% Rear' },
        { label: 'Torsional Rigidity', value: '52,000 Nm / degree' },
        { label: 'Top Speed', value: '> 340 km/h (211 mph)' },
      ],
      parts: [
        {
          name: 'Carbon Monocoque Tub',
          category: 'Chassis',
          description: 'Single-piece autoclaved carbon tub with aluminum honeycomb core and integrated roll cage anchoring nodes.',
          whyItExists: 'Forms the high-rigidity passenger survival cell and structural foundation for all suspension load paths.',
          material: 'Prepreg Carbon Fiber & Aluminum Honeycomb',
        },
        {
          name: 'Chromoly Subframe Cradles',
          category: 'Chassis',
          description: '4130 chromoly steel tubular spaceframe cradles bolted directly to front and rear monocoque bulkheads.',
          whyItExists: 'Isolates suspension impact forces and supports the powertrain while acting as replaceable progressive crash attenuators.',
          material: '4130 Chromoly Alloy Steel',
        },
      ],
      flows: [],
    },
    explodedConfig: {
      maxDisplacement: 1.10,
      parts: [
        { matchPattern: 'hood', vector: [0, 0.8, -0.6], distance: 0.70, order: 1 },
        { matchPattern: 'door', vector: [0.9, 0.3, 0], distance: 0.65, order: 1 },
        { matchPattern: 'wheel', vector: [1.1, 0, 0], distance: 0.80, order: 2 },
        { matchPattern: 'wing', vector: [0, 0.9, 0.6], distance: 0.75, order: 1 },
        { matchPattern: 'bumper', vector: [0, 0, -1.0], distance: 0.65, order: 1 },
        { matchPattern: 'diffuser', vector: [0, -0.4, 0.8], distance: 0.60, order: 2 },
        { matchPattern: 'roof', vector: [0, 0.9, 0], distance: 0.55, order: 2 },
      ],
    },
    cutawayConfig: {
      defaultPlane: 'X',
      defaultDepth: 0.0,
      invertNormal: false,
      cutDescription: 'Full vehicle sagittal half-cut exposing engine bay, cockpit interior seating, and underbody venturi tunnels.',
    },
    cameraPresets: [
      { name: 'Hero 3/4 Perspective', pos: [3.4, 1.6, 3.8], target: [0, 0.35, 0], fov: 40 },
      { name: 'Front Profile', pos: [0, 0.9, -4.6], target: [0, 0.35, 0], fov: 36 },
      { name: 'Rear Profile', pos: [0, 1.1, 4.6], target: [0, 0.35, 0], fov: 36 },
      { name: 'Side Elevation', pos: [4.8, 0.8, 0], target: [0, 0.35, 0], fov: 34 },
      { name: 'Top Plan View', pos: [0, 6.2, 0.01], target: [0, 0, 0], fov: 48 },
      { name: 'Cockpit Driver View', pos: [-0.35, 0.85, 0.1], target: [0, 0.75, -0.6], fov: 55 },
    ],
  },
};
