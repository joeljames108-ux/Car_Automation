// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — LIGHTING & STUDIO AMBIANCE PRESETS
// ============================================================================
// Defines photographic lighting setups, tone mapping profiles, shadow bias
// parameters, and color temperature profiles for automotive presentation.
// ============================================================================

import type { LightingPreset, LightingPresetConfig } from '../types';

export const LIGHTING_PRESET_CONFIGS: Record<LightingPreset, LightingPresetConfig> = {
  studio: {
    id: 'studio',
    label: 'Studio Key Clean',
    description: 'Neutral 5500K balanced 3-point studio lighting with crisp soft shadows and clear specular reflections.',
    lights: [
      {
        id: 'key_light',
        type: 'directional',
        color: 0xffffff,
        intensity: 2.4,
        position: { x: 2.5, y: 3.5, z: 4.0 },
        target: { x: 0, y: 0, z: 0.18 },
        castShadow: true,
        shadowMapSize: 2048,
        shadowBias: -0.0001,
      },
      {
        id: 'fill_light',
        type: 'directional',
        color: 0xbae6fd,
        intensity: 0.8,
        position: { x: -3.0, y: 1.5, z: 2.0 },
        castShadow: false,
      },
      {
        id: 'rim_light',
        type: 'directional',
        color: 0xfde68a,
        intensity: 0.9,
        position: { x: 0, y: -3.0, z: 3.5 },
        castShadow: false,
      },
      {
        id: 'ambient_hemi',
        type: 'hemisphere',
        color: 0xffffff,
        intensity: 0.45,
      },
    ],
    environmentMap: 'studio',
    environmentIntensity: 1.2,
    backgroundType: 'solid',
    backgroundColor: 0x020617,
    toneMapping: 'aces',
    toneMappingExposure: 1.15,
  },

  workshop: {
    id: 'workshop',
    label: 'Industrial Workshop',
    description: 'Warm high-intensity overhead fluorescent bays with gritty metallic reflections.',
    lights: [
      {
        id: 'overhead_bay',
        type: 'directional',
        color: 0xfef08a,
        intensity: 2.8,
        position: { x: 0, y: 0, z: 4.5 },
        castShadow: true,
      },
      {
        id: 'side_work_lamp',
        type: 'spot',
        color: 0xffffff,
        intensity: 2.0,
        position: { x: 2.0, y: 2.0, z: 2.0 },
        angle: Math.PI / 4,
      },
    ],
    environmentMap: 'warehouse',
    environmentIntensity: 1.4,
    backgroundType: 'solid',
    backgroundColor: 0x0f172a,
    toneMapping: 'aces',
    toneMappingExposure: 1.1,
  },

  showroom: {
    id: 'showroom',
    label: 'Luxury Showroom',
    description: 'High-contrast diffuse ceiling panels creating elongated reflections along carbon surfaces.',
    lights: [
      {
        id: 'ceiling_panel_1',
        type: 'directional',
        color: 0xffffff,
        intensity: 3.0,
        position: { x: 1.5, y: 2.0, z: 5.0 },
        castShadow: true,
      },
      {
        id: 'accent_spot',
        type: 'spot',
        color: 0x38bdf8,
        intensity: 1.8,
        position: { x: -2.0, y: -2.0, z: 3.0 },
      },
    ],
    environmentMap: 'city',
    environmentIntensity: 1.6,
    backgroundType: 'solid',
    backgroundColor: 0x030712,
    toneMapping: 'aces',
    toneMappingExposure: 1.25,
  },

  outdoor: {
    id: 'outdoor',
    label: 'Golden Hour Sunset',
    description: 'Low-angle warm sunlight with vibrant orange horizon reflections and long dramatic shadows.',
    lights: [
      {
        id: 'sun_key',
        type: 'directional',
        color: 0xffedd5,
        intensity: 3.6,
        position: { x: 4.0, y: -4.0, z: 2.0 },
        castShadow: true,
      },
      {
        id: 'sky_bounce',
        type: 'hemisphere',
        color: 0x38bdf8,
        intensity: 0.8,
      },
    ],
    environmentMap: 'sunset',
    environmentIntensity: 1.5,
    backgroundType: 'solid',
    backgroundColor: 0x18181b,
    toneMapping: 'aces',
    toneMappingExposure: 1.2,
  },

  dramatic: {
    id: 'dramatic',
    label: 'Cinematic Cyberpunk Reveal',
    description: 'Deep high-contrast rim lighting with cyan and amber backlights.',
    lights: [
      {
        id: 'cyan_rim',
        type: 'directional',
        color: 0x06b6d4,
        intensity: 4.0,
        position: { x: -3.0, y: -3.0, z: 2.5 },
        castShadow: true,
      },
      {
        id: 'amber_fill',
        type: 'directional',
        color: 0xf59e0b,
        intensity: 2.2,
        position: { x: 3.0, y: 3.0, z: 1.5 },
      },
    ],
    environmentMap: 'night',
    environmentIntensity: 1.0,
    backgroundType: 'solid',
    backgroundColor: 0x020617,
    toneMapping: 'aces',
    toneMappingExposure: 1.3,
  },

  blueprint: {
    id: 'blueprint',
    label: 'Technical CAD Blueprint',
    description: 'Flat uniform diffuse lighting with zero shadow distortion for pure mechanical CAD inspection.',
    lights: [
      {
        id: 'cad_ambient',
        type: 'ambient',
        color: 0x38bdf8,
        intensity: 2.0,
      },
    ],
    environmentMap: 'apartment',
    environmentIntensity: 0.5,
    backgroundType: 'solid',
    backgroundColor: 0x082f49,
    toneMapping: 'linear',
    toneMappingExposure: 1.0,
  },
};
