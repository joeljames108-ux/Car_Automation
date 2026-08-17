// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — CAMERA PRESET TAXONOMY & KINEMATICS
// ============================================================================
// Comprehensive mathematical camera preset catalog featuring 15 specialized
// inspection viewpoints, spherical coordinate framing, and focus targets (Y-Up).
// ============================================================================

import type { CameraPreset3D, Vector3D } from '../types';

export interface CameraPresetDefinition {
  id: CameraPreset3D;
  label: string;
  category: 'overview' | 'orthographic' | 'detail';
  position: Vector3D;
  target: Vector3D;
  fov: number;
  description: string;
}

export const CAMERA_PRESET_DEFINITIONS: Record<CameraPreset3D, CameraPresetDefinition> = {
  'iso-front-left': {
    id: 'iso-front-left',
    label: 'Isometric Front-Left (3/4)',
    category: 'overview',
    position: { x: 1.4, y: 0.95, z: 1.2 },
    target: { x: 0, y: 0.05, z: 0 },
    fov: 42,
    description: 'Hero presentation angle showcasing front radiator, left bank, and top carbon cover.',
  },
  'iso-front-right': {
    id: 'iso-front-right',
    label: 'Isometric Front-Right (3/4)',
    category: 'overview',
    position: { x: 1.4, y: 0.95, z: -1.2 },
    target: { x: 0, y: 0.05, z: 0 },
    fov: 42,
    description: 'Hero angle showcasing Bank 2 exhaust header and twin-scroll turbocharger.',
  },
  'iso-rear-left': {
    id: 'iso-rear-left',
    label: 'Isometric Rear-Left',
    category: 'overview',
    position: { x: -1.4, y: 0.95, z: 1.2 },
    target: { x: 0, y: 0.05, z: 0 },
    fov: 42,
    description: 'Rear angle highlighting 7-speed sequential transaxle and left intake runners.',
  },
  'iso-rear-right': {
    id: 'iso-rear-right',
    label: 'Isometric Rear-Right',
    category: 'overview',
    position: { x: -1.4, y: 0.95, z: -1.2 },
    target: { x: 0, y: 0.05, z: 0 },
    fov: 42,
    description: 'Rear perspective highlighting transaxle bellhousing and turbocharger outlet.',
  },
  'front': {
    id: 'front',
    label: 'Front Elevation',
    category: 'orthographic',
    position: { x: -2.0, y: 0.05, z: 0 },
    target: { x: 0, y: 0.05, z: 0 },
    fov: 35,
    description: 'Straight-on front perspective framing the radiator and timing chain case.',
  },
  'rear': {
    id: 'rear',
    label: 'Rear Drivetrain',
    category: 'orthographic',
    position: { x: 2.0, y: 0.05, z: 0 },
    target: { x: 0, y: 0.05, z: 0 },
    fov: 35,
    description: 'Direct rear view showcasing transaxle casing and dual CV axle outputs.',
  },
  'left': {
    id: 'left',
    label: 'Left Flank (Bank 1)',
    category: 'orthographic',
    position: { x: 0, y: 0.05, z: 2.0 },
    target: { x: 0, y: 0.05, z: 0 },
    fov: 35,
    description: 'Side profile of Bank 1 Inconel primary tubes and anodized valve cover.',
  },
  'right': {
    id: 'right',
    label: 'Right Flank (Bank 2)',
    category: 'orthographic',
    position: { x: 0, y: 0.05, z: -2.0 },
    target: { x: 0, y: 0.05, z: 0 },
    fov: 35,
    description: 'Side profile of Bank 2 exhaust collector and turbocharger assembly.',
  },
  'top': {
    id: 'top',
    label: 'Top-Down Plan View',
    category: 'orthographic',
    position: { x: 0, y: 2.2, z: 0.001 },
    target: { x: 0, y: 0, z: 0 },
    fov: 32,
    description: 'Bird-eye top view framing the central valley ITB velocity stacks and carbon cover.',
  },
  'bottom': {
    id: 'bottom',
    label: 'Bottom Crankcase View',
    category: 'orthographic',
    position: { x: 0, y: -2.0, z: 0.001 },
    target: { x: 0, y: 0, z: 0 },
    fov: 35,
    description: 'Underside inspection angle showing dry sump pan and 4 AN-12 scavenge lines.',
  },
  'bank-left-detail': {
    id: 'bank-left-detail',
    label: 'Bank 1 Valvetrain Detail',
    category: 'detail',
    position: { x: 0.2, y: 0.55, z: 0.8 },
    target: { x: 0, y: 0.25, z: 0.18 },
    fov: 30,
    description: 'Close-up macro framing of Bank 1 camshafts, vernier gears, and spark plugs.',
  },
  'bank-right-detail': {
    id: 'bank-right-detail',
    label: 'Bank 2 Valvetrain Detail',
    category: 'detail',
    position: { x: 0.2, y: 0.55, z: -0.8 },
    target: { x: 0, y: 0.25, z: -0.18 },
    fov: 30,
    description: 'Close-up macro framing of Bank 2 valvetrain and exhaust port runners.',
  },
  'intake-detail': {
    id: 'intake-detail',
    label: 'Central ITB Velocity Stacks',
    category: 'detail',
    position: { x: 0.05, y: 0.85, z: 0.25 },
    target: { x: 0, y: 0.40, z: 0 },
    fov: 28,
    description: 'Extreme close-up framing of the 12 cobalt blue velocity stack bellmouths.',
  },
  'exhaust-detail': {
    id: 'exhaust-detail',
    label: 'Turbocharger & V-Band Flange',
    category: 'detail',
    position: { x: 0.65, y: 0.35, z: -0.65 },
    target: { x: 0.45, y: 0.12, z: -0.28 },
    fov: 30,
    description: 'Detailed inspection of the twin-scroll turbine volute and wastegate actuator.',
  },
  'bottom-end-detail': {
    id: 'bottom-end-detail',
    label: 'Crankshaft & Rod Journals',
    category: 'detail',
    position: { x: 0.15, y: -0.25, z: 0.45 },
    target: { x: 0, y: -0.05, z: 0 },
    fov: 32,
    description: 'Under-crankcase detail view showing connecting rod big-ends and main caps.',
  },
};
