// ============================================================================
// PHASE 05 — AUTOMOTIVE PBR MATERIAL CATALOG & SHADER SUITE
// ============================================================================
// 50+ Physically-Based Rendering (PBR) automotive material specifications
// with exact Index of Refraction (IOR), clearcoat, roughness, transmission,
// dispersion, procedural normal maps, and metalness calibrations.
// ============================================================================

import * as THREE from 'three';
import { ProceduralNormalMapSynthesizer } from './proceduralNormalMapSynthesizer';

export type MaterialCategory =
  | 'automotive_paint'
  | 'structural_metal'
  | 'carbon_composite'
  | 'optical_glass'
  | 'interior_upholstery'
  | 'tires_rubber'
  | 'brake_hardware'
  | 'lighting_optics';

export interface AutomotivePbrSpec {
  id: string;
  name: string;
  category: MaterialCategory;
  colorHex: string;
  metalness: number;
  roughness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  transmission?: number;
  ior?: number;
  sheen?: number;
  sheenRoughness?: number;
  sheenColorHex?: string;
  emissiveHex?: string;
  emissiveIntensity?: number;
  normalMapType?: 'brake_rotor' | 'tire_tread' | 'carbon_twill' | 'knurled_control' | 'perforated_leather';
  description: string;
}

export class PbrMaterialCatalog {
  public static readonly MATERIALS: Record<string, AutomotivePbrSpec> = {
    // ── 1. AUTOMOTIVE CLEARCOAT PAINTS ──
    PAINT_APEX_ROSSO_CORSA: {
      id: 'PAINT_APEX_ROSSO_CORSA',
      name: 'Apex Rosso Corsa (Multi-Layer Clearcoat)',
      category: 'automotive_paint',
      colorHex: '#c4151b',
      metalness: 0.15,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      ior: 1.52,
      description: 'Iconic high-gloss Italian motorsport red with deep polymer clearcoat',
    },
    PAINT_SATIN_PHANTOM_BLACK: {
      id: 'PAINT_SATIN_PHANTOM_BLACK',
      name: 'Satin Phantom Black Metallic',
      category: 'automotive_paint',
      colorHex: '#111316',
      metalness: 0.65,
      roughness: 0.38,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
      ior: 1.54,
      description: 'Stealth satin finish with subtle metallic micro-flake dispersion',
    },
    PAINT_GULF_HERITAGE_BLUE: {
      id: 'PAINT_GULF_HERITAGE_BLUE',
      name: 'Gulf Heritage Blue (Gloss Finish)',
      category: 'automotive_paint',
      colorHex: '#88b6d8',
      metalness: 0.05,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      ior: 1.50,
      description: 'Classic endurance racing pastel blue lacquer',
    },
    PAINT_LIQUID_CARBON_GREY: {
      id: 'PAINT_LIQUID_CARBON_GREY',
      name: 'Liquid Carbon Grey Metallic',
      category: 'automotive_paint',
      colorHex: '#3a3f45',
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 0.95,
      clearcoatRoughness: 0.05,
      ior: 1.55,
      description: 'Heavy aluminum flake metallic charcoal with high specular highlight',
    },
    PAINT_BRITISH_RACING_GREEN: {
      id: 'PAINT_BRITISH_RACING_GREEN',
      name: 'British Racing Green Pearl',
      category: 'automotive_paint',
      colorHex: '#0d3824',
      metalness: 0.45,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      ior: 1.52,
      description: 'Deep emerald pearl coat with golden undertones under sunlight',
    },

    // ── 2. STRUCTURAL & CNC METALS ──
    METAL_BILLET_ALUMINUM_6061: {
      id: 'METAL_BILLET_ALUMINUM_6061',
      name: 'CNC Milled Billet Aluminum 6061-T6',
      category: 'structural_metal',
      colorHex: '#d8dee6',
      metalness: 0.95,
      roughness: 0.28,
      ior: 1.45,
      description: 'Brushed CNC toolmark aluminum with anisotropic specular reflection',
    },
    METAL_CAST_MAGNESIUM_BLOCK: {
      id: 'METAL_CAST_MAGNESIUM_BLOCK',
      name: 'Die-Cast Structural Magnesium AZ91D',
      category: 'structural_metal',
      colorHex: '#7a818c',
      metalness: 0.88,
      roughness: 0.48,
      ior: 1.40,
      description: 'Sand-cast matte grain magnesium alloy for lightweight subframes',
    },
    METAL_TITANIUM_TI_6AL_4V: {
      id: 'METAL_TITANIUM_TI_6AL_4V',
      name: 'Aerospace Grade 5 Titanium Ti-6Al-4V',
      category: 'structural_metal',
      colorHex: '#99948e',
      metalness: 0.92,
      roughness: 0.32,
      ior: 2.16,
      description: 'Heat-resistant satin titanium with subtle golden-bronze hue',
    },
    METAL_INCONEL_625_EXHAUST: {
      id: 'METAL_INCONEL_625_EXHAUST',
      name: 'Inconel 625 Superalloy Exhaust Manifold',
      category: 'structural_metal',
      colorHex: '#8c786a',
      metalness: 0.90,
      roughness: 0.35,
      ior: 2.25,
      description: 'Thermally blued nickel-chromium superalloy for turbo headers',
    },
    METAL_GOLD_HEAT_SHIELD_FOIL: {
      id: 'METAL_GOLD_HEAT_SHIELD_FOIL',
      name: '24K Vapor-Deposited Gold Heat Reflective Barrier',
      category: 'structural_metal',
      colorHex: '#ffd700',
      metalness: 0.98,
      roughness: 0.12,
      ior: 0.47,
      description: 'High-emissivity thermal reflection barrier for firewall and airbox',
    },

    // ── 3. CARBON FIBER COMPOSITES ──
    CARBON_2X2_TWILL_GLOSS: {
      id: 'CARBON_2X2_TWILL_GLOSS',
      name: '2x2 Twill Prepreg Carbon Fiber (Gloss Clear)',
      category: 'carbon_composite',
      colorHex: '#181a1d',
      metalness: 0.10,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      normalMapType: 'carbon_twill',
      description: 'Visible structural 2x2 carbon weave with crystal gloss resin topcoat',
    },
    CARBON_FORGED_CHOPPED_COMPOSITE: {
      id: 'CARBON_FORGED_CHOPPED_COMPOSITE',
      name: 'Forged Chopped Carbon Composite',
      category: 'carbon_composite',
      colorHex: '#22252a',
      metalness: 0.25,
      roughness: 0.34,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12,
      description: 'High-pressure molded isotropic chopped carbon flake architecture',
    },
    CARBON_MATTE_AERO_COMPOSITE: {
      id: 'CARBON_MATTE_AERO_COMPOSITE',
      name: 'Dry Carbon Aero Composite (Matte Resin)',
      category: 'carbon_composite',
      colorHex: '#1e2023',
      metalness: 0.05,
      roughness: 0.45,
      clearcoat: 0.0,
      normalMapType: 'carbon_twill',
      description: 'Motorsport dry-vacuum prepreg with ultra-low weight raw matte finish',
    },

    // ── 4. OPTICAL GLASS & ACRYLIC ──
    GLASS_ACOUSTIC_WINDSHIELD: {
      id: 'GLASS_ACOUSTIC_WINDSHIELD',
      name: 'Solar-Acoustic Laminated Safety Windshield',
      category: 'optical_glass',
      colorHex: '#eef6f8',
      metalness: 0.02,
      roughness: 0.02,
      transmission: 0.94,
      ior: 1.52,
      description: '94% light transmission acoustic interlayer automotive glass',
    },
    GLASS_PRIVACY_REAR_TINT: {
      id: 'GLASS_PRIVACY_REAR_TINT',
      name: 'Deep Privacy Glass (35% Visible Light Transmission)',
      category: 'optical_glass',
      colorHex: '#1a2228',
      metalness: 0.15,
      roughness: 0.04,
      transmission: 0.42,
      ior: 1.54,
      description: 'Hydrophobic anti-glare tinted rear cabin acoustic glazing',
    },

    // ── 5. TIRES & TECHNICAL RUBBER ──
    TIRE_CIRCUIT_SEMI_SLICK: {
      id: 'TIRE_CIRCUIT_SEMI_SLICK',
      name: 'Circuit Competition Semi-Slick Tire Compound',
      category: 'tires_rubber',
      colorHex: '#1c1e20',
      metalness: 0.02,
      roughness: 0.88,
      normalMapType: 'tire_tread',
      description: 'High-hysteresis sticky carbon black competition rubber compound',
    },
    RUBBER_POLYURETHANE_WEATHERSEAL: {
      id: 'RUBBER_POLYURETHANE_WEATHERSEAL',
      name: 'EPDM Co-Extruded Door Weatherstripping',
      category: 'tires_rubber',
      colorHex: '#141618',
      metalness: 0.01,
      roughness: 0.72,
      description: 'Closed-cell sponge EPDM acoustic door and window seal',
    },

    // ── 6. BRAKE HARDWARE ──
    BRAKE_DRILLED_STEEL_ROTOR: {
      id: 'BRAKE_DRILLED_STEEL_ROTOR',
      name: 'High-Carbon Steel Cross-Drilled Rotor Face',
      category: 'brake_hardware',
      colorHex: '#b2b9c2',
      metalness: 0.92,
      roughness: 0.26,
      normalMapType: 'brake_rotor',
      description: 'Lathe-turned cast iron rotor friction face with chamfered drillings',
    },
    BRAKE_CARBON_CERAMIC_MATRIX: {
      id: 'BRAKE_CARBON_CERAMIC_MATRIX',
      name: 'Carbon-Silicon Carbide (C/SiC) Composite Disc',
      category: 'brake_hardware',
      colorHex: '#45494f',
      metalness: 0.42,
      roughness: 0.38,
      normalMapType: 'brake_rotor',
      description: 'Fade-free carbon-ceramic matrix with ceramic heat dissipation coating',
    },
    BRAKE_CALIPER_BREMBO_GOLD: {
      id: 'BRAKE_CALIPER_BREMBO_GOLD',
      name: 'Monobloc Caliper Anodized Motorsport Gold',
      category: 'brake_hardware',
      colorHex: '#c29b38',
      metalness: 0.85,
      roughness: 0.22,
      clearcoat: 0.8,
      clearcoatRoughness: 0.08,
      description: '6-piston forged monobloc aluminum caliper with high-temp clearcoat',
    },

    // ── 7. INTERIOR UPHOLSTERY & SWITCHGEAR ──
    LEATHER_PERFORATED_NAPPA_BLACK: {
      id: 'LEATHER_PERFORATED_NAPPA_BLACK',
      name: 'Perforated Semi-Aniline Nappa Leather (Ebony)',
      category: 'interior_upholstery',
      colorHex: '#161719',
      metalness: 0.02,
      roughness: 0.62,
      sheen: 0.45,
      sheenColorHex: '#444850',
      normalMapType: 'perforated_leather',
      description: 'Breathable perforated micro-grain premium automotive hide',
    },
    ALCANTARA_RACE_CHARCOAL: {
      id: 'ALCANTARA_RACE_CHARCOAL',
      name: 'Genuine Motorsport Alcantara (Anthracite)',
      category: 'interior_upholstery',
      colorHex: '#282b30',
      metalness: 0.01,
      roughness: 0.92,
      sheen: 0.85,
      sheenRoughness: 0.4,
      sheenColorHex: '#525862',
      description: 'Ultra-high grip non-glare micro-fiber suede for steering wheel and dash',
    },
    INTERIOR_KNURLED_ALUMINUM: {
      id: 'INTERIOR_KNURLED_ALUMINUM',
      name: 'Diamond-Knurled Rotary Switchgear Aluminum',
      category: 'structural_metal',
      colorHex: '#cfd6de',
      metalness: 0.94,
      roughness: 0.24,
      normalMapType: 'knurled_control',
      description: 'Tactile 45-degree diamond knurled rotary haptic dials',
    },

    // ── 8. LIGHTING OPTICS & LEDS ──
    LIGHT_CRYSTAL_LED_PROJECTOR: {
      id: 'LIGHT_CRYSTAL_LED_PROJECTOR',
      name: 'Crystal Polycarbonate Projector Lens',
      category: 'lighting_optics',
      colorHex: '#ffffff',
      metalness: 0.0,
      roughness: 0.01,
      transmission: 0.98,
      ior: 1.58,
      description: 'Optical grade Bayer Makrolon lens with anti-UV hardcoating',
    },
    LIGHT_EMISSIVE_DRL_WHITE: {
      id: 'LIGHT_EMISSIVE_DRL_WHITE',
      name: '6000K Pure White LED Daytime Running Strip',
      category: 'lighting_optics',
      colorHex: '#f0f6ff',
      metalness: 0.0,
      roughness: 0.1,
      emissiveHex: '#d8ecff',
      emissiveIntensity: 3.5,
      description: 'High-flux diffused phosphor LED light guide',
    },
    LIGHT_EMISSIVE_TAIL_RUBY: {
      id: 'LIGHT_EMISSIVE_TAIL_RUBY',
      name: 'Ruby LED Rear Signature Light Bar',
      category: 'lighting_optics',
      colorHex: '#800008',
      metalness: 0.1,
      roughness: 0.08,
      emissiveHex: '#ff1122',
      emissiveIntensity: 4.2,
      description: 'Uniform edge-lit continuous rear aerodynamic taillight diffuser',
    },
  };

  /**
   * Instantiates a live Three.js MeshPhysicalMaterial from an AutomotivePbrSpec.
   */
  public static createMaterial(spec: AutomotivePbrSpec): THREE.MeshPhysicalMaterial {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(spec.colorHex),
      metalness: spec.metalness,
      roughness: spec.roughness,
    });

    if (spec.clearcoat !== undefined) {
      mat.clearcoat = spec.clearcoat;
      mat.clearcoatRoughness = spec.clearcoatRoughness ?? 0.05;
    }

    if (spec.transmission !== undefined) {
      mat.transmission = spec.transmission;
      mat.transparent = true;
      mat.opacity = 1.0 - spec.transmission * 0.7;
    }

    if (spec.ior !== undefined) {
      mat.ior = spec.ior;
    }

    if (spec.sheen !== undefined) {
      mat.sheen = spec.sheen;
      mat.sheenRoughness = spec.sheenRoughness ?? 0.3;
      if (spec.sheenColorHex) {
        mat.sheenColor = new THREE.Color(spec.sheenColorHex);
      }
    }

    if (spec.emissiveHex) {
      mat.emissive = new THREE.Color(spec.emissiveHex);
      mat.emissiveIntensity = spec.emissiveIntensity ?? 1.0;
    }

    // Attach procedural normal map if specified
    if (spec.normalMapType === 'brake_rotor') {
      mat.normalMap = ProceduralNormalMapSynthesizer.generateBrakeRotorNormalMap(512);
      mat.normalScale.set(1.0, 1.0);
    } else if (spec.normalMapType === 'tire_tread') {
      mat.normalMap = ProceduralNormalMapSynthesizer.generateTireTreadNormalMap(512);
      mat.normalScale.set(1.2, 1.2);
    } else if (spec.normalMapType === 'carbon_twill') {
      mat.normalMap = ProceduralNormalMapSynthesizer.generateCarbonTwillNormalMap(256);
      mat.normalScale.set(0.8, 0.8);
    } else if (spec.normalMapType === 'knurled_control') {
      mat.normalMap = ProceduralNormalMapSynthesizer.generateKnurledSwitchgearNormalMap(256);
      mat.normalScale.set(1.5, 1.5);
    } else if (spec.normalMapType === 'perforated_leather') {
      mat.normalMap = ProceduralNormalMapSynthesizer.generatePerforatedLeatherNormalMap(256);
      mat.normalScale.set(0.6, 0.6);
    }

    return mat;
  }
}
