// ============================================================================
// 60° V12 RACING ENGINE & TRANSAXLE — 3D COMPONENT MANIFEST REGISTRY
// ============================================================================
// Complete declarative metadata, physical specifications, attachment bindings,
// dependency graphs, material variants, exploded view vectors, and sound triggers
// for every component in the 60° V12 racing powertrain.
// ============================================================================

import type {
  Engine3DComponentManifest,
  Engine3DComponentType,
  ComponentCategory3D,
  MaterialVariantVisual,
} from '../types';
import {
  V12_ENGINE_BLOCK_ATTACHMENTS,
  V12_CRANKSHAFT_ATTACHMENTS,
  V12_CYLINDER_HEAD_LEFT_ATTACHMENTS,
  V12_CYLINDER_HEAD_RIGHT_ATTACHMENTS,
  V12_INTAKE_ATTACHMENTS,
  V12_EXHAUST_ATTACHMENTS,
} from '../attachmentMaps/v12AttachmentMap';

// ============================================================================
// 1. STANDARD SHARED MATERIAL VARIANT PALETTES
// ============================================================================

export const METALLIC_VARIANTS: MaterialVariantVisual[] = [
  {
    id: 'cast',
    label: 'OEM Cast Gray Iron',
    color: 0x94a3b8,
    metalness: 0.75,
    roughness: 0.42,
    envMapIntensity: 1.0,
  },
  {
    id: 'forged',
    label: 'Forged Racing Alloy',
    color: 0xcbd5e1,
    metalness: 0.88,
    roughness: 0.25,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.2,
  },
  {
    id: 'billet',
    label: 'CNC Billet 6061-T6',
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.15,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5,
  },
  {
    id: 'titanium',
    label: 'Titanium Ti-6Al-4V (Spec-R)',
    color: 0xa78bfa,
    metalness: 0.95,
    roughness: 0.10,
    clearcoat: 0.8,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.8,
  },
];

export const SPECIALTY_VARIANTS = {
  anodizedGold: {
    id: 'forged' as const,
    label: 'Billet Gold Anodized',
    color: 0xf59e0b,
    metalness: 0.90,
    roughness: 0.20,
    clearcoat: 0.75,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.4,
  },
  cobaltBlue: {
    id: 'billet' as const,
    label: 'Apex Cobalt Blue Anodized',
    color: 0x0284c7,
    metalness: 0.85,
    roughness: 0.18,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.6,
  },
  ceramicWhite: {
    id: 'ceramic' as const,
    label: 'Thermal Barrier Ceramic White',
    color: 0xf8fafc,
    metalness: 0.25,
    roughness: 0.35,
    envMapIntensity: 0.8,
  },
  inconelGold: {
    id: 'inconel' as const,
    label: 'Inconel 625 Heat-Tinted Gold',
    color: 0xd97706,
    metalness: 0.90,
    roughness: 0.26,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.5,
  },
  dryCarbon: {
    id: 'carbon_fiber' as const,
    label: 'Autoclaved 2x2 Twill Dry Carbon',
    color: 0x1e293b,
    metalness: 0.35,
    roughness: 0.38,
    clearcoat: 0.95,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.4,
  },
  quartzGlass: {
    id: 'quartz_glass' as const,
    label: 'Scratch-Resistant Quartz Glass',
    color: 0x38bdf8,
    metalness: 0.10,
    roughness: 0.05,
    transmission: 0.90,
    ior: 1.54,
    opacity: 0.45,
    envMapIntensity: 2.0,
  },
};

// ============================================================================
// 2. MASTER V12 COMPONENT MANIFEST DEFINITIONS
// ============================================================================

export const V12_COMPONENT_MANIFESTS: Engine3DComponentManifest[] = [
  // ─── 01. ENGINE BLOCK & CRANKCASE (CORE FOUNDATION) ───
  {
    type: 'engine-block',
    displayName: '60° V12 Engine Block & Crankcase',
    category: 'core',
    assetPath: '/models/engines/v12/engine-block.glb',
    attachmentPoints: V12_ENGINE_BLOCK_ATTACHMENTS,
    parentType: null,
    parentAttachmentPattern: '',
    dependencies: [],
    instanceCount: 1,
    instancePattern: 'single',
    bankAssignment: 'center',
    explodedOffset: { x: 0, y: 0, z: 0 },
    defaultTransform: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      { id: 'cast', label: 'Gray Cast Iron (Heavy Duty)', color: 0x64748b, metalness: 0.70, roughness: 0.45 },
      { id: 'forged', label: 'Cast Magnesium-Aluminum Alloy', color: 0x94a3b8, metalness: 0.75, roughness: 0.42 },
      { id: 'billet', label: 'Compacted Graphite Iron (CGI)', color: 0xcbd5e1, metalness: 0.85, roughness: 0.28 },
      { id: 'titanium', label: 'Titanium Monobloc Spec-R', color: 0xa78bfa, metalness: 0.95, roughness: 0.12 },
    ],
    massKg: 85.0,
    centerOfMassMm: { x: 0, y: 0, z: 110 },
    costUsd: 4500,
    torqueSpec: { fastenerName: 'Main Bearing ARP2000 Studs', snugNm: 65, finalAngleDeg: 90, boltCount: 14 },
    clearanceSpec: { label: 'Main Journal Bearing Clearance', targetMm: 0.052, minMm: 0.045, maxMm: 0.060 },
    soundOnInstall: 'heavy-drop',
    installAnimationDurationMs: 1200,
    description: 'Structural cornerstone featuring deep-skirt crankcase, 7 cross-bolted main saddles, and 12 Nikasil-plated 88mm bores.',
    engineeringNotes: 'Handles up to 1,200 HP and 10,500 RPM with CGI matrix structural integrity.',
  },

  // ─── 02. CRANKSHAFT & MAIN BEARINGS (BOTTOM END) ───
  {
    type: 'crankshaft',
    displayName: 'Forged Nitrided Steel Crankshaft',
    category: 'bottom-end',
    assetPath: '/models/engines/v12/crankshaft.glb',
    attachmentPoints: V12_CRANKSHAFT_ATTACHMENTS,
    parentType: 'engine-block',
    parentAttachmentPattern: 'Crankshaft_Mount',
    selfMountPointId: 'Crankshaft_Mount',
    dependencies: ['engine-block'],
    instanceCount: 1,
    instancePattern: 'single',
    bankAssignment: 'center',
    explodedOffset: { x: 0, y: 0, z: -0.15 },
    defaultTransform: {
      position: { x: 0, y: 0, z: 0.05 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      { id: 'cast', label: 'Cast Nodular Iron', color: 0x64748b, metalness: 0.75, roughness: 0.35 },
      { id: 'forged', label: 'Forged 4340 Nitrided Steel', color: 0xcbd5e1, metalness: 0.92, roughness: 0.15 },
      { id: 'billet', label: 'Billet EN40B Aerospace Steel', color: 0xe2e8f0, metalness: 0.95, roughness: 0.10 },
      { id: 'titanium', label: 'Ultralight Billet Titanium', color: 0xa78bfa, metalness: 0.96, roughness: 0.08 },
    ],
    massKg: 22.4,
    centerOfMassMm: { x: 0, y: 0, z: 50 },
    costUsd: 2800,
    torqueSpec: { fastenerName: 'Main Cap Cross-Bolts', snugNm: 65, finalAngleDeg: 90, boltCount: 14 },
    clearanceSpec: { label: 'Crankshaft Thrust Endplay', targetMm: 0.15, minMm: 0.10, maxMm: 0.22 },
    soundOnInstall: 'slide-lock',
    installAnimationDurationMs: 1400,
    description: 'Fully counter-weighted 6-throw crankshaft with gun-drilled main journals and 60° even-fire journal spacing.',
    engineeringNotes: 'Dynamic balance rating under 0.25 g-mm with micro-polished journals.',
  },

  // ─── 03. PISTONS (BOTTOM END, 12x INSTANCES) ───
  {
    type: 'piston',
    displayName: 'Forged High-Compression Slipper Piston',
    category: 'bottom-end',
    assetPath: '/models/engines/v12/piston.glb',
    attachmentPoints: [
      {
        id: 'Piston_WristPin_Mount',
        position: { x: 0, y: 0, z: -0.02 },
        rotation: { x: 0, y: 0, z: 0 },
        category: 'connecting_rod_wrist_pin',
        acceptsType: 'connecting-rod',
        occupied: false,
      },
    ],
    parentType: 'engine-block',
    parentAttachmentPattern: 'Piston_[0-9]{2}_Mount',
    dependencies: ['engine-block'],
    instanceCount: 12,
    instancePattern: 'per-cylinder',
    bankAssignment: 'center',
    explodedOffset: { x: 0, y: 0, z: 0.25 },
    defaultTransform: {
      position: { x: 0, y: 0, z: 0.22 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      { id: 'cast', label: 'OEM Cast Hypereutectic', color: 0x94a3b8, metalness: 0.70, roughness: 0.40 },
      { id: 'forged', label: 'Forged 2618 Racing Alloy', color: 0xcbd5e1, metalness: 0.88, roughness: 0.22 },
      { id: 'billet', label: 'Billet CNC Box-Bridge Crown', color: 0xe2e8f0, metalness: 0.92, roughness: 0.15 },
      { id: 'titanium', label: 'Titanium Matrix Composite', color: 0xa78bfa, metalness: 0.95, roughness: 0.10 },
    ],
    massKg: 0.38,
    centerOfMassMm: { x: 0, y: 0, z: 15 },
    costUsd: 185,
    clearanceSpec: { label: 'Piston-to-Bore Wall Clearance', targetMm: 0.085, minMm: 0.075, maxMm: 0.095 },
    soundOnInstall: 'metallic-click',
    installAnimationDurationMs: 800,
    description: 'Lightweight slipper-skirt piston with diamond-turned ring lands, gas accumulator grooves, and DLC-coated wrist pin.',
    engineeringNotes: 'Compression ratio: 12.8:1 (NA) / 9.5:1 (Turbo). Withstands 140 bar peak cylinder pressure.',
  },

  // ─── 04. CONNECTING RODS (BOTTOM END, 12x INSTANCES) ───
  {
    type: 'connecting-rod',
    displayName: 'Titanium H-Beam Connecting Rod',
    category: 'bottom-end',
    assetPath: '/models/engines/v12/connecting-rod.glb',
    attachmentPoints: [],
    parentType: 'crankshaft',
    parentAttachmentPattern: 'Crank_Journal_[0-9]{2}_(Left|Right)_Mount',
    dependencies: ['engine-block', 'crankshaft', 'piston'],
    instanceCount: 12,
    instancePattern: 'per-cylinder',
    bankAssignment: 'center',
    explodedOffset: { x: 0, y: 0, z: 0.12 },
    defaultTransform: {
      position: { x: 0, y: 0, z: 0.14 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      { id: 'cast', label: 'Forged Carbon Steel', color: 0x64748b, metalness: 0.78, roughness: 0.38 },
      { id: 'forged', label: '4340 Chrome-Moly H-Beam', color: 0xcbd5e1, metalness: 0.90, roughness: 0.20 },
      { id: 'billet', label: 'Billet Carrillo-Spec Alloy', color: 0xe2e8f0, metalness: 0.94, roughness: 0.14 },
      { id: 'titanium', label: 'Aerospace Ti-6Al-4V Forged', color: 0xa78bfa, metalness: 0.96, roughness: 0.08 },
    ],
    massKg: 0.42,
    centerOfMassMm: { x: 0, y: 0, z: 65 },
    costUsd: 260,
    torqueSpec: { fastenerName: 'ARP Custom Age 625+ Rod Bolts', snugNm: 55, finalAngleDeg: 60, boltCount: 2 },
    clearanceSpec: { label: 'Rod Journal Oil Clearance', targetMm: 0.048, minMm: 0.040, maxMm: 0.055 },
    soundOnInstall: 'metallic-click',
    installAnimationDurationMs: 900,
    description: '140mm center-to-center H-beam connecting rod featuring rifle-drilled forced pin oiling and balanced within 0.5g.',
    engineeringNotes: 'Rated for 11,000 RPM reciprocating loads with zero fatigue propagation.',
  },

  // ─── 05. CYLINDER HEAD LEFT (TOP END, BANK 1) ───
  {
    type: 'cylinder-head-left',
    displayName: 'Bank 1 (Left) DOHC 24-Valve Cylinder Head',
    category: 'top-end',
    assetPath: '/models/engines/v12/cylinder-head-left.glb',
    attachmentPoints: V12_CYLINDER_HEAD_LEFT_ATTACHMENTS,
    parentType: 'engine-block',
    parentAttachmentPattern: 'CylinderHead_Left_Mount',
    selfMountPointId: 'CylinderHead_Left_Mount',
    dependencies: ['engine-block', 'crankshaft', 'piston'],
    instanceCount: 1,
    instancePattern: 'per-bank',
    bankAssignment: 'left',
    explodedOffset: { x: 0, y: 0.15, z: 0.18 },
    defaultTransform: {
      position: { x: 0, y: 0.18, z: 0.32 },
      rotation: { x: -0.5236, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      { id: 'cast', label: 'OEM Cast Aluminum A356', color: 0x94a3b8, metalness: 0.75, roughness: 0.42 },
      { id: 'forged', label: 'CNC Ported Racing Aluminum', color: 0xcbd5e1, metalness: 0.88, roughness: 0.24 },
      { id: 'billet', label: 'Billet CNC Monobloc Head', color: 0xe2e8f0, metalness: 0.92, roughness: 0.16 },
      { id: 'titanium', label: 'Beryllium-Copper Combustion Core', color: 0xa78bfa, metalness: 0.95, roughness: 0.10 },
    ],
    massKg: 18.2,
    centerOfMassMm: { x: 0, y: 0, z: 50 },
    costUsd: 3600,
    torqueSpec: { fastenerName: 'ARP2000 Head Studs (M11)', snugNm: 45, finalAngleDeg: 120, boltCount: 14 },
    clearanceSpec: { label: 'Valve Lash Clearance (Cold)', targetMm: 0.22, minMm: 0.20, maxMm: 0.25 },
    soundOnInstall: 'heavy-drop',
    installAnimationDurationMs: 1300,
    description: 'DOHC crossflow cylinder head housing 12 intake (36mm) and 12 exhaust (31mm) sodium-filled titanium valves.',
    engineeringNotes: 'Combustion chamber volume: 38.5 cc. CNC 5-axis ported runner flow rate: 365 CFM @ 28 in H2O.',
  },

  // ─── 06. CYLINDER HEAD RIGHT (TOP END, BANK 2) ───
  {
    type: 'cylinder-head-right',
    displayName: 'Bank 2 (Right) DOHC 24-Valve Cylinder Head',
    category: 'top-end',
    assetPath: '/models/engines/v12/cylinder-head-right.glb',
    attachmentPoints: V12_CYLINDER_HEAD_RIGHT_ATTACHMENTS,
    parentType: 'engine-block',
    parentAttachmentPattern: 'CylinderHead_Right_Mount',
    selfMountPointId: 'CylinderHead_Right_Mount',
    dependencies: ['engine-block', 'crankshaft', 'piston'],
    instanceCount: 1,
    instancePattern: 'per-bank',
    bankAssignment: 'right',
    explodedOffset: { x: 0, y: -0.15, z: 0.18 },
    defaultTransform: {
      position: { x: 0.015, y: -0.18, z: 0.32 },
      rotation: { x: 0.5236, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      { id: 'cast', label: 'OEM Cast Aluminum A356', color: 0x94a3b8, metalness: 0.75, roughness: 0.42 },
      { id: 'forged', label: 'CNC Ported Racing Aluminum', color: 0xcbd5e1, metalness: 0.88, roughness: 0.24 },
      { id: 'billet', label: 'Billet CNC Monobloc Head', color: 0xe2e8f0, metalness: 0.92, roughness: 0.16 },
      { id: 'titanium', label: 'Beryllium-Copper Combustion Core', color: 0xa78bfa, metalness: 0.95, roughness: 0.10 },
    ],
    massKg: 18.2,
    centerOfMassMm: { x: 0, y: 0, z: 50 },
    costUsd: 3600,
    torqueSpec: { fastenerName: 'ARP2000 Head Studs (M11)', snugNm: 45, finalAngleDeg: 120, boltCount: 14 },
    clearanceSpec: { label: 'Valve Lash Clearance (Cold)', targetMm: 0.22, minMm: 0.20, maxMm: 0.25 },
    soundOnInstall: 'heavy-drop',
    installAnimationDurationMs: 1300,
    description: 'Bank 2 DOHC cylinder head mirror-paired with Bank 1, staggered +15mm along crankshaft axis.',
    engineeringNotes: 'Combustion chamber volume: 38.5 cc. CNC 5-axis ported runner flow rate: 365 CFM @ 28 in H2O.',
  },

  // ─── 07. VALVE COVER LEFT (COVERS, BANK 1) ───
  {
    type: 'valve-cover-left',
    displayName: 'Bank 1 Anodized Billet Valve Cover',
    category: 'covers',
    assetPath: '/models/engines/v12/valve-cover-left.glb',
    attachmentPoints: [],
    parentType: 'cylinder-head-left',
    parentAttachmentPattern: 'ValveCover_Left_Mount',
    dependencies: ['cylinder-head-left'],
    instanceCount: 1,
    instancePattern: 'per-bank',
    bankAssignment: 'left',
    explodedOffset: { x: 0, y: 0.12, z: 0.22 },
    defaultTransform: {
      position: { x: 0, y: 0.22, z: 0.39 },
      rotation: { x: -0.5236, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      SPECIALTY_VARIANTS.anodizedGold,
      SPECIALTY_VARIANTS.cobaltBlue,
      SPECIALTY_VARIANTS.dryCarbon,
      { id: 'billet', label: 'Brushed Raw Aluminum', color: 0xe2e8f0, metalness: 0.90, roughness: 0.18 },
    ],
    massKg: 2.8,
    centerOfMassMm: { x: 0, y: 0, z: 20 },
    costUsd: 850,
    torqueSpec: { fastenerName: 'Titanium M6 Perimeter Bolts', snugNm: 12, finalAngleDeg: 0, boltCount: 16 },
    soundOnInstall: 'pneumatic-snap',
    installAnimationDurationMs: 800,
    description: 'CNC machined billet valve cover with internal oil baffle labyrinth and integrated spark plug O-ring sealing wells.',
    engineeringNotes: 'High-temperature viton perimeter seal with zero leakage up to 2.5 bar crankcase pressure.',
  },

  // ─── 08. VALVE COVER RIGHT (COVERS, BANK 2) ───
  {
    type: 'valve-cover-right',
    displayName: 'Bank 2 Anodized Billet Valve Cover',
    category: 'covers',
    assetPath: '/models/engines/v12/valve-cover-right.glb',
    attachmentPoints: [],
    parentType: 'cylinder-head-right',
    parentAttachmentPattern: 'ValveCover_Right_Mount',
    dependencies: ['cylinder-head-right'],
    instanceCount: 1,
    instancePattern: 'per-bank',
    bankAssignment: 'right',
    explodedOffset: { x: 0, y: -0.12, z: 0.22 },
    defaultTransform: {
      position: { x: 0.015, y: -0.22, z: 0.39 },
      rotation: { x: 0.5236, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      SPECIALTY_VARIANTS.anodizedGold,
      SPECIALTY_VARIANTS.cobaltBlue,
      SPECIALTY_VARIANTS.dryCarbon,
      { id: 'billet', label: 'Brushed Raw Aluminum', color: 0xe2e8f0, metalness: 0.90, roughness: 0.18 },
    ],
    massKg: 2.8,
    centerOfMassMm: { x: 0, y: 0, z: 20 },
    costUsd: 850,
    torqueSpec: { fastenerName: 'Titanium M6 Perimeter Bolts', snugNm: 12, finalAngleDeg: 0, boltCount: 16 },
    soundOnInstall: 'pneumatic-snap',
    installAnimationDurationMs: 800,
    description: 'Bank 2 matching billet valve cover with oil filler neck and crankcase breather AN-10 fitting.',
    engineeringNotes: 'High-temperature viton perimeter seal with zero leakage up to 2.5 bar crankcase pressure.',
  },

  // ─── 09. INTAKE MANIFOLD LEFT (INDUCTION, BANK 1) ───
  {
    type: 'intake-manifold-left',
    displayName: 'Bank 1 Ceramic ITB Intake Manifold',
    category: 'induction',
    assetPath: '/models/engines/v12/intake-manifold-left.glb',
    attachmentPoints: [V12_INTAKE_ATTACHMENTS[0], V12_INTAKE_ATTACHMENTS[2]],
    parentType: 'cylinder-head-left',
    parentAttachmentPattern: 'IntakeManifold_Left_Mount',
    dependencies: ['cylinder-head-left'],
    instanceCount: 1,
    instancePattern: 'per-bank',
    bankAssignment: 'left',
    explodedOffset: { x: 0, y: 0.10, z: 0.24 },
    defaultTransform: {
      position: { x: 0, y: 0.12, z: 0.36 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      SPECIALTY_VARIANTS.ceramicWhite,
      SPECIALTY_VARIANTS.dryCarbon,
      { id: 'billet', label: 'CNC Billet 6061 Flange', color: 0xe2e8f0, metalness: 0.90, roughness: 0.16 },
    ],
    massKg: 4.6,
    centerOfMassMm: { x: 0, y: 0, z: 60 },
    costUsd: 1950,
    torqueSpec: { fastenerName: 'Titanium M8 Intake Studs', snugNm: 28, finalAngleDeg: 0, boltCount: 12 },
    soundOnInstall: 'slide-lock',
    installAnimationDurationMs: 1000,
    description: '6 S-curved individual throttle body intake runners with parabolic ceramic thermal barrier coating.',
    engineeringNotes: 'Equal-length 280mm runner geometry tuned for 7,800 RPM Helmholtz resonance wave boost.',
  },

  // ─── 10. INTAKE MANIFOLD RIGHT (INDUCTION, BANK 2) ───
  {
    type: 'intake-manifold-right',
    displayName: 'Bank 2 Ceramic ITB Intake Manifold',
    category: 'induction',
    assetPath: '/models/engines/v12/intake-manifold-right.glb',
    attachmentPoints: [V12_INTAKE_ATTACHMENTS[1], V12_INTAKE_ATTACHMENTS[3]],
    parentType: 'cylinder-head-right',
    parentAttachmentPattern: 'IntakeManifold_Right_Mount',
    dependencies: ['cylinder-head-right'],
    instanceCount: 1,
    instancePattern: 'per-bank',
    bankAssignment: 'right',
    explodedOffset: { x: 0, y: -0.10, z: 0.24 },
    defaultTransform: {
      position: { x: 0.015, y: -0.12, z: 0.36 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      SPECIALTY_VARIANTS.ceramicWhite,
      SPECIALTY_VARIANTS.dryCarbon,
      { id: 'billet', label: 'CNC Billet 6061 Flange', color: 0xe2e8f0, metalness: 0.90, roughness: 0.16 },
    ],
    massKg: 4.6,
    centerOfMassMm: { x: 0, y: 0, z: 60 },
    costUsd: 1950,
    torqueSpec: { fastenerName: 'Titanium M8 Intake Studs', snugNm: 28, finalAngleDeg: 0, boltCount: 12 },
    soundOnInstall: 'slide-lock',
    installAnimationDurationMs: 1000,
    description: 'Bank 2 matching ITB intake runners feeding cylinders 2, 4, 6, 8, 10, 12.',
    engineeringNotes: 'Equal-length 280mm runner geometry tuned for 7,800 RPM Helmholtz resonance wave boost.',
  },

  // ─── 11. EXHAUST HEADERS LEFT (EXHAUST, BANK 1) ───
  {
    type: 'exhaust-header-left',
    displayName: 'Bank 1 6-into-1 Inconel Exhaust Header',
    category: 'exhaust',
    assetPath: '/models/engines/v12/exhaust-header-left.glb',
    attachmentPoints: [],
    parentType: 'cylinder-head-left',
    parentAttachmentPattern: 'ExhaustHeader_Left_Mount',
    dependencies: ['cylinder-head-left'],
    instanceCount: 1,
    instancePattern: 'per-bank',
    bankAssignment: 'left',
    explodedOffset: { x: 0, y: 0.20, z: -0.08 },
    defaultTransform: {
      position: { x: 0, y: 0.24, z: 0.28 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      SPECIALTY_VARIANTS.inconelGold,
      { id: 'forged', label: '321 Stainless Steel (Brushed)', color: 0xcbd5e1, metalness: 0.85, roughness: 0.30 },
      { id: 'titanium', label: 'Titanium Spec-R Heat-Blued', color: 0x6366f1, metalness: 0.95, roughness: 0.12 },
    ],
    massKg: 6.4,
    centerOfMassMm: { x: 100, y: 0, z: -40 },
    costUsd: 2800,
    torqueSpec: { fastenerName: 'Inconel 718 Exhaust Studs (M8)', snugNm: 45, finalAngleDeg: 0, boltCount: 12 },
    soundOnInstall: 'metallic-click',
    installAnimationDurationMs: 1100,
    description: '6-into-1 equal-length hydroformed Inconel 625 primary pipes (42mm) merging into a 76mm pyramidal collector.',
    engineeringNotes: 'Withstands continuous exhaust gas temperatures up to 1,050°C with zero thermal distortion.',
  },

  // ─── 12. EXHAUST HEADERS RIGHT (EXHAUST, BANK 2) ───
  {
    type: 'exhaust-header-right',
    displayName: 'Bank 2 6-into-1 Inconel Exhaust Header',
    category: 'exhaust',
    assetPath: '/models/engines/v12/exhaust-header-right.glb',
    attachmentPoints: V12_EXHAUST_ATTACHMENTS,
    parentType: 'cylinder-head-right',
    parentAttachmentPattern: 'ExhaustHeader_Right_Mount',
    dependencies: ['cylinder-head-right'],
    instanceCount: 1,
    instancePattern: 'per-bank',
    bankAssignment: 'right',
    explodedOffset: { x: 0, y: -0.20, z: -0.08 },
    defaultTransform: {
      position: { x: 0.015, y: -0.24, z: 0.28 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      SPECIALTY_VARIANTS.inconelGold,
      { id: 'forged', label: '321 Stainless Steel (Brushed)', color: 0xcbd5e1, metalness: 0.85, roughness: 0.30 },
      { id: 'titanium', label: 'Titanium Spec-R Heat-Blued', color: 0x6366f1, metalness: 0.95, roughness: 0.12 },
    ],
    massKg: 6.4,
    centerOfMassMm: { x: 100, y: 0, z: -40 },
    costUsd: 2800,
    torqueSpec: { fastenerName: 'Inconel 718 Exhaust Studs (M8)', snugNm: 45, finalAngleDeg: 0, boltCount: 12 },
    soundOnInstall: 'metallic-click',
    installAnimationDurationMs: 1100,
    description: 'Bank 2 hydroformed exhaust header terminating in a machined V-band flange for turbocharger coupling.',
    engineeringNotes: 'Withstands continuous exhaust gas temperatures up to 1,050°C with zero thermal distortion.',
  },

  // ─── 13. TURBOCHARGER (EXHAUST / INDUCTION) ───
  {
    type: 'turbocharger',
    displayName: 'Twin-Scroll Ceramic Ball-Bearing Turbocharger',
    category: 'exhaust',
    assetPath: '/models/engines/v12/turbocharger.glb',
    attachmentPoints: [],
    parentType: 'exhaust-header-right',
    parentAttachmentPattern: 'Turbocharger_Mount',
    dependencies: ['exhaust-header-right'],
    instanceCount: 1,
    instancePattern: 'single',
    bankAssignment: 'right',
    explodedOffset: { x: 0.15, y: -0.25, z: 0 },
    defaultTransform: {
      position: { x: 0.50, y: -0.32, z: 0.12 },
      rotation: { x: 0, y: 1.5708, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      { id: 'titanium', label: 'Titanium-Aluminide Billet Wheel (76mm)', color: 0xa78bfa, metalness: 0.94, roughness: 0.12 },
      { id: 'billet', label: 'CNC Forged Milled Compressor Wheel', color: 0xe2e8f0, metalness: 0.90, roughness: 0.18 },
      { id: 'ceramic', label: 'Ceramic Dual Ball Bearing Cartridge', color: 0x38bdf8, metalness: 0.85, roughness: 0.22 },
    ],
    massKg: 12.8,
    centerOfMassMm: { x: 0, y: 0, z: 0 },
    costUsd: 4200,
    torqueSpec: { fastenerName: 'Quick-Release Titanium V-Band Clamp', snugNm: 55, finalAngleDeg: 0, boltCount: 1 },
    soundOnInstall: 'spool-whine',
    installAnimationDurationMs: 1200,
    description: 'Aerospace-grade twin-scroll turbocharger with 76mm billet compressor wheel and dual ceramic ball bearings.',
    engineeringNotes: 'Max spool RPM: 145,000. Capable of delivering 2.4 bar boost with 78% adiabatic compressor efficiency.',
  },

  // ─── 14. DRY SUMP LUBRICATION (COOLING / LUBRICATION) ───
  {
    type: 'dry-sump',
    displayName: '4-Stage Scavenge Dry Sump Pan & Tank',
    category: 'cooling',
    assetPath: '/models/engines/v12/dry-sump.glb',
    attachmentPoints: [],
    parentType: 'engine-block',
    parentAttachmentPattern: 'OilPan_Mount',
    dependencies: ['engine-block', 'crankshaft'],
    instanceCount: 1,
    instancePattern: 'single',
    bankAssignment: 'center',
    explodedOffset: { x: 0, y: 0, z: -0.22 },
    defaultTransform: {
      position: { x: 0, y: 0, z: -0.03 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      { id: 'billet', label: 'CNC Billet 6061-T6 Scavenge Pan', color: 0xe2e8f0, metalness: 0.90, roughness: 0.18 },
      { id: 'cast', label: 'Cast Magnesium Lightweight Sump', color: 0x94a3b8, metalness: 0.78, roughness: 0.35 },
      SPECIALTY_VARIANTS.anodizedGold,
    ],
    massKg: 11.2,
    centerOfMassMm: { x: 0, y: 0, z: -30 },
    costUsd: 3100,
    torqueSpec: { fastenerName: 'Billet M6 Sump Bolts', snugNm: 22, finalAngleDeg: 0, boltCount: 24 },
    soundOnInstall: 'pneumatic-snap',
    installAnimationDurationMs: 1000,
    description: 'Low-profile billet scavenge trough with 4 AN-12 scavenge ports, centrifugal de-aerator tank, and spin-on racing filter.',
    engineeringNotes: 'Eliminates oil starvation up to 3.5 G lateral cornering loads. Lowers engine center of gravity by 65mm.',
  },

  // ─── 15. FRONT RADIATOR & COOLING (COOLING) ───
  {
    type: 'radiator',
    displayName: 'High-Efficiency Brazed Aluminum Radiator',
    category: 'cooling',
    assetPath: '/models/engines/v12/radiator.glb',
    attachmentPoints: [],
    parentType: 'engine-block',
    parentAttachmentPattern: 'Radiator_Front_Mount',
    dependencies: ['engine-block'],
    instanceCount: 1,
    instancePattern: 'single',
    bankAssignment: 'center',
    explodedOffset: { x: -0.30, y: 0, z: 0 },
    defaultTransform: {
      position: { x: -0.46, y: 0, z: 0.18 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      { id: 'forged', label: 'Micro-Louvered Brazed Aluminum Core', color: 0x334155, metalness: 0.80, roughness: 0.55 },
      { id: 'titanium', label: 'Ultra-Dense Double Pass Track Spec', color: 0x475569, metalness: 0.88, roughness: 0.40 },
    ],
    massKg: 8.5,
    centerOfMassMm: { x: 0, y: 0, z: 0 },
    costUsd: 1400,
    soundOnInstall: 'pneumatic-snap',
    installAnimationDurationMs: 1100,
    description: 'Dual-pass micro-louvered cooling core with carbon fiber fan shroud, 7 aerodynamic blades, and reinforced silicone hoses.',
    engineeringNotes: 'Dissipates up to 180 kW thermal energy with 85 L/min coolant flow rate at full load.',
  },

  // ─── 16. 7-SPEED SEQUENTIAL TRANSAXLE (DRIVETRAIN) ───
  {
    type: 'transaxle',
    displayName: '7-Speed Sequential Dog-Ring Transaxle',
    category: 'drivetrain',
    assetPath: '/models/engines/v12/transaxle.glb',
    attachmentPoints: [],
    parentType: 'engine-block',
    parentAttachmentPattern: 'Transaxle_Rear_Mount',
    dependencies: ['engine-block', 'crankshaft'],
    instanceCount: 1,
    instancePattern: 'single',
    bankAssignment: 'center',
    explodedOffset: { x: 0.35, y: 0, z: 0 },
    defaultTransform: {
      position: { x: 0.38, y: 0, z: 0.08 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      { id: 'cast', label: 'Cast Magnesium Casing', color: 0x64748b, metalness: 0.78, roughness: 0.40 },
      { id: 'billet', label: 'CNC Billet Aerospace 7075 Housing', color: 0xe2e8f0, metalness: 0.92, roughness: 0.16 },
      { id: 'titanium', label: 'Carbon-Magnesium Ultralight Casing', color: 0x1e293b, metalness: 0.50, roughness: 0.30 },
    ],
    massKg: 58.0,
    centerOfMassMm: { x: 200, y: 0, z: 0 },
    costUsd: 18500,
    torqueSpec: { fastenerName: 'Bellhousing Titanium M10 Bolts', snugNm: 75, finalAngleDeg: 0, boltCount: 10 },
    soundOnInstall: 'heavy-drop',
    installAnimationDurationMs: 1400,
    description: 'Rear-mounted 7-speed longitudinal sequential transaxle with integrated Salisbury limited-slip differential and CV axle outputs.',
    engineeringNotes: 'Straight-cut dog rings enable 25ms clutchless paddle-shifts under full throttle torque.',
  },

  // ─── 17. CARBON FIBER ENGINE COVER (COVERS) ───
  {
    type: 'engine-cover',
    displayName: 'Autoclaved Dry-Carbon Monocoque Engine Cover',
    category: 'covers',
    assetPath: '/models/engines/v12/engine-cover.glb',
    attachmentPoints: [],
    parentType: 'engine-block',
    parentAttachmentPattern: 'EngineCover_Top_Mount',
    dependencies: ['engine-block', 'cylinder-head-left', 'cylinder-head-right'],
    instanceCount: 1,
    instancePattern: 'single',
    bankAssignment: 'center',
    explodedOffset: { x: 0, y: 0, z: 0.35 },
    defaultTransform: {
      position: { x: 0, y: 0, z: 0.54 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      SPECIALTY_VARIANTS.dryCarbon,
      { id: 'forged', label: 'Forged Chopped Carbon Matrix', color: 0x334155, metalness: 0.40, roughness: 0.30 },
      { id: 'titanium', label: 'Gold Leaf Thermal Reflective Shroud', color: 0xf59e0b, metalness: 0.95, roughness: 0.10 },
    ],
    massKg: 3.2,
    centerOfMassMm: { x: 0, y: 0, z: 20 },
    costUsd: 3200,
    torqueSpec: { fastenerName: 'Quarter-Turn Dzus Fasteners', snugNm: 8, finalAngleDeg: 0, boltCount: 6 },
    soundOnInstall: 'glass-settle',
    installAnimationDurationMs: 1000,
    description: 'Pre-preg carbon fiber shroud with scratch-resistant quartz glass ITB window, ram-air scoop, and CNC gold perimeter bezel.',
    engineeringNotes: 'Aerodynamic ducting channels 450 CFM ambient airflow directly over the central valley fuel rails.',
  },

  // ─── 18. TIMING TRAIN & SPROCKETS (TOP END / TIMING) ───
  {
    type: 'timing-chain',
    displayName: 'Dual-Roller Motorsport Timing Train',
    category: 'top-end',
    assetPath: '/models/engines/v12/timing-chain.glb',
    attachmentPoints: [],
    parentType: 'engine-block',
    parentAttachmentPattern: 'TimingChain_Front_Mount',
    dependencies: ['engine-block', 'crankshaft', 'cylinder-head-left', 'cylinder-head-right'],
    instanceCount: 1,
    instancePattern: 'single',
    bankAssignment: 'center',
    explodedOffset: { x: -0.20, y: 0, z: 0 },
    defaultTransform: {
      position: { x: -0.31, y: 0, z: 0.25 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    variants: [
      { id: 'forged', label: 'Hardened Chrome-Alloy Roller Chain', color: 0xcbd5e1, metalness: 0.90, roughness: 0.20 },
      { id: 'billet', label: 'Billet Adjustable Vernier Cam Gears', color: 0xf59e0b, metalness: 0.92, roughness: 0.15 },
    ],
    massKg: 3.5,
    centerOfMassMm: { x: 0, y: 0, z: 0 },
    costUsd: 1200,
    soundOnInstall: 'metallic-click',
    installAnimationDurationMs: 900,
    description: 'Dual-roller heavy-duty timing chain linking the crankshaft snout to 4 adjustable vernier camshaft sprockets.',
    engineeringNotes: 'Includes hydraulic tensioners and PTFE chain guide dampening pads.',
  },
];

// ============================================================================
// 3. MANIFEST QUERY & HELPER UTILITIES
// ============================================================================

/**
 * Retrieves the static manifest blueprint for a given component type.
 */
export function getManifestForComponentType(type: Engine3DComponentType): Engine3DComponentManifest | undefined {
  return V12_COMPONENT_MANIFESTS.find((m) => m.type === type);
}

/**
 * Returns all registered component manifests in the V12 powertrain catalog.
 */
export function getAllV12Manifests(): Engine3DComponentManifest[] {
  return [...V12_COMPONENT_MANIFESTS];
}

/**
 * Retrieves all component manifests belonging to a specific functional category.
 */
export function getManifestsByCategory(category: ComponentCategory3D): Engine3DComponentManifest[] {
  return V12_COMPONENT_MANIFESTS.filter((m) => m.category === category);
}

/**
 * Retrieves the direct dependency prerequisite types required to install a given component.
 */
export function getRequiredDependencies(type: Engine3DComponentType): Engine3DComponentType[] {
  const manifest = getManifestForComponentType(type);
  return manifest ? [...manifest.dependencies] : [];
}

/**
 * Finds all downstream components that directly or transitively depend on a target component type.
 */
export function getDependentComponentTypes(targetType: Engine3DComponentType): Engine3DComponentType[] {
  const dependents = new Set<Engine3DComponentType>();

  function search(currentType: Engine3DComponentType) {
    for (const manifest of V12_COMPONENT_MANIFESTS) {
      if (manifest.dependencies.includes(currentType) && !dependents.has(manifest.type)) {
        dependents.add(manifest.type);
        search(manifest.type);
      }
    }
  }

  search(targetType);
  return Array.from(dependents);
}

/**
 * Calculates the total dry weight of the complete engine assembly with default material variants.
 */
export function calculateTotalAssemblyMassKg(): number {
  return V12_COMPONENT_MANIFESTS.reduce((sum, m) => sum + m.massKg * m.instanceCount, 0);
}

/**
 * Calculates the total cost of all components in the default assembly.
 */
export function calculateTotalAssemblyCostUsd(): number {
  return V12_COMPONENT_MANIFESTS.reduce((sum, m) => sum + m.costUsd * m.instanceCount, 0);
}

/**
 * Validates the dependency integrity and completeness of the entire manifest catalog.
 */
export function validateManifestCatalog(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const registeredTypes = new Set<Engine3DComponentType>(V12_COMPONENT_MANIFESTS.map((m) => m.type));

  for (const manifest of V12_COMPONENT_MANIFESTS) {
    // Check dependencies exist
    for (const dep of manifest.dependencies) {
      if (!registeredTypes.has(dep)) {
        errors.push(`Manifest '${manifest.type}' specifies unknown dependency: '${dep}'`);
      }
    }

    // Check parent exists if specified
    if (manifest.parentType && !registeredTypes.has(manifest.parentType)) {
      errors.push(`Manifest '${manifest.type}' specifies unknown parentType: '${manifest.parentType}'`);
    }

    // Check mass and cost
    if (manifest.massKg <= 0) {
      errors.push(`Manifest '${manifest.type}' has invalid massKg: ${manifest.massKg}`);
    }
    if (manifest.costUsd < 0) {
      errors.push(`Manifest '${manifest.type}' has negative costUsd: ${manifest.costUsd}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
