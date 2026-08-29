// ============================================================================
// ADVANCED AUTOMOTIVE MATERIALS LIBRARY — 50+ PBR PHYSICAL MATERIALS
// ============================================================================
// Production-grade Three.js MeshPhysicalMaterial presets for:
// - Paint finishes (metallic, pearlescent, matte, satin, ceramic-coated)
// - Carbon fiber weaves (2x2 twill, plain, spread tow, forged)
// - Metals (titanium, magnesium, Inconel, aluminum, steel, copper)
// - Interior materials (Alcantara, Nappa leather, DINAMICA, forged carbon)
// - Brake components (carbon-ceramic, cross-drilled, slotted, titanium caliper)
// - Glass types (laminated, polycarbonate, tinted privacy, electrochromic)
// - Tire compounds (slick, intermediate, wet, street)
// - Lighting materials (LED, OLED, fiber optic, ambient)
// - Environmental (ground, sky, workshop floor, showroom)
// ============================================================================

import * as THREE from "three";

export type MaterialCategory =
  | "paint"
  | "carbon_fiber"
  | "metal"
  | "interior"
  | "brake"
  | "glass"
  | "tire"
  | "lighting"
  | "environment";

export interface AutomotiveMaterialDefinition {
  name: string;
  category: MaterialCategory;
  description: string;
  create: (colorOverride?: number) => THREE.Material;
}

export class AdvancedAutomotiveMaterialsLibrary {
  private static _cache: Map<string, THREE.Material> = new Map();

  /**
   * Gets a material by name. Returns cached instance if already created.
   */
  public static getMaterial(name: string, colorOverride?: number): THREE.Material {
    const key = `${name}_${colorOverride ?? "default"}`;
    if (this._cache.has(key)) return this._cache.get(key)!;
    const def = this.MATERIALS.find((m) => m.name === name);
    if (!def) {
      console.warn(`[AutoMaterials] Unknown material: ${name}`);
      return new THREE.MeshStandardMaterial({ color: 0xff00ff });
    }
    const mat = def.create(colorOverride);
    this._cache.set(key, mat);
    return mat;
  }

  /**
   * Returns all material definitions in a category.
   */
  public static getMaterialsByCategory(category: MaterialCategory): AutomotiveMaterialDefinition[] {
    return this.MATERIALS.filter((m) => m.category === category);
  }

  /**
   * Clears the material cache.
   */
  public static clearCache(): void {
    this._cache.forEach((mat) => mat.dispose());
    this._cache.clear();
  }

  /**
   * Returns the count of cached materials.
   */
  public static getCacheSize(): number {
    return this._cache.size;
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAINT MATERIALS
  // ════════════════════════════════════════════════════════════════════════

  private static readonly PAINT_MATERIALS: AutomotiveMaterialDefinition[] = [
    {
      name: "PAINT_METALLIC_CLEARCOAT",
      category: "paint",
      description: "Standard automotive metallic paint with clearcoat layer",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x0044cc,
        metalness: 0.85,
        roughness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.01,
        reflectivity: 1.0,
        envMapIntensity: 1.8,
      }),
    },
    {
      name: "PAINT_PEARLESCENT",
      category: "paint",
      description: "Pearlescent paint with color-shifting effect under light",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x8844cc,
        metalness: 0.75,
        roughness: 0.15,
        clearcoat: 0.9,
        clearcoatRoughness: 0.02,
        sheen: 0.4,
        sheenColor: new THREE.Color(color ?? 0xaa66ee),
        sheenRoughness: 0.3,
        envMapIntensity: 2.0,
      }),
    },
    {
      name: "PAINT_MATTE_SATIN",
      category: "paint",
      description: "Matte/satin finish for race liveries and stealth looks",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x333333,
        metalness: 0.45,
        roughness: 0.65,
        clearcoat: 0.2,
        clearcoatRoughness: 0.5,
        envMapIntensity: 0.8,
      }),
    },
    {
      name: "PAINT_CERAMIC_COATED",
      category: "paint",
      description: "Ceramic-coated paint with ultra-high gloss and hydrophobic properties",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0xcc0000,
        metalness: 0.9,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.005,
        reflectivity: 1.0,
        specularIntensity: 1.0,
        specularColor: new THREE.Color(0xffffff),
        envMapIntensity: 2.5,
      }),
    },
    {
      name: "PAINT_CHROMAFLAIR",
      category: "paint",
      description: "Color-shift chromaflair paint (Koenigsegg, Lamborghini style)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x6633aa,
        metalness: 0.92,
        roughness: 0.08,
        clearcoat: 1.0,
        clearcoatRoughness: 0.01,
        sheen: 0.6,
        sheenColor: new THREE.Color(0x33ccaa),
        sheenRoughness: 0.15,
        envMapIntensity: 3.0,
      }),
    },
    {
      name: "PAINT_FROZEN_JET",
      category: "paint",
      description: "Frozen/matte metallic (BMW Individual Frozen finishes)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x2a2a2e,
        metalness: 0.8,
        roughness: 0.42,
        clearcoat: 0.15,
        clearcoatRoughness: 0.8,
        envMapIntensity: 1.0,
      }),
    },
    {
      name: "PAINT_VINYL_WRAP_GLOSS",
      category: "paint",
      description: "High-gloss vinyl wrap with slight orange peel",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0xe11d48,
        metalness: 0.1,
        roughness: 0.18,
        clearcoat: 0.85,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.5,
      }),
    },
    {
      name: "PAINT_EXPOSED_CARBON",
      category: "paint",
      description: "Clear-coated exposed carbon fiber weave under lacquer",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x1a1a1a,
        metalness: 0.45,
        roughness: 0.22,
        clearcoat: 1.0,
        clearcoatRoughness: 0.01,
        envMapIntensity: 2.0,
      }),
    },
    {
      name: "PAINT_CHROME",
      category: "paint",
      description: "Mirror chrome plating for show cars",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0xdddddd,
        metalness: 1.0,
        roughness: 0.0,
        clearcoat: 0.5,
        clearcoatRoughness: 0.001,
        envMapIntensity: 4.0,
      }),
    },
    {
      name: "PAINT_CANDY_APPLE",
      category: "paint",
      description: "Candy apple red with deep translucent color layer",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0xcc1100,
        metalness: 0.7,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.005,
        transmission: 0.05,
        thickness: 0.5,
        envMapIntensity: 2.2,
      }),
    },
  ];

  // ════════════════════════════════════════════════════════════════════════
  // CARBON FIBER MATERIALS
  // ════════════════════════════════════════════════════════════════════════

  private static readonly CARBON_MATERIALS: AutomotiveMaterialDefinition[] = [
    {
      name: "CARBON_2X2_TWILL",
      category: "carbon_fiber",
      description: "Standard 2x2 twill weave carbon fiber (most common in motorsport)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x111622,
        metalness: 0.42,
        roughness: 0.28,
        clearcoat: 0.8,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.6,
      }),
    },
    {
      name: "CARBON_PLAIN_WEAVE",
      category: "carbon_fiber",
      description: "Plain weave carbon fiber (used for structural components)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x0d1015,
        metalness: 0.38,
        roughness: 0.32,
        clearcoat: 0.6,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.4,
      }),
    },
    {
      name: "CARBON_SPREAD_TOW",
      category: "carbon_fiber",
      description: "Spread tow (TeXtreme) carbon fiber for ultra-smooth surfaces",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x151a24,
        metalness: 0.5,
        roughness: 0.18,
        clearcoat: 1.0,
        clearcoatRoughness: 0.01,
        envMapIntensity: 2.0,
      }),
    },
    {
      name: "CARBON_FORGED",
      category: "carbon_fiber",
      description: "Forged carbon (random marbled pattern, Lamborghini/Porsche style)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x181c22,
        metalness: 0.55,
        roughness: 0.22,
        clearcoat: 0.9,
        clearcoatRoughness: 0.03,
        envMapIntensity: 1.8,
      }),
    },
    {
      name: "CARBON_KEVLAR_HYBRID",
      category: "carbon_fiber",
      description: "Carbon-Kevlar hybrid weave (impact-resistant)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x2a2815,
        metalness: 0.35,
        roughness: 0.35,
        clearcoat: 0.5,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.2,
      }),
    },
    {
      name: "CARBON_DRY_LAYUP",
      category: "carbon_fiber",
      description: "Dry carbon (no resin pooling, rough matte finish)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x151515,
        metalness: 0.25,
        roughness: 0.55,
        clearcoat: 0.0,
        envMapIntensity: 0.8,
      }),
    },
    {
      name: "CARBON_CERAMIC_MATRIX",
      category: "carbon_fiber",
      description: "Carbon-Silicon Carbide (C/SiC) for brake discs",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x2a2a2a,
        metalness: 0.55,
        roughness: 0.38,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1.0,
      }),
    },
  ];

  // ════════════════════════════════════════════════════════════════════════
  // METAL MATERIALS
  // ════════════════════════════════════════════════════════════════════════

  private static readonly METAL_MATERIALS: AutomotiveMaterialDefinition[] = [
    {
      name: "TITANIUM_GRADE5",
      category: "metal",
      description: "Ti-6Al-4V Grade 5 Titanium (halo, roll structure, fasteners)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x8a929a,
        roughness: 0.25,
        metalness: 0.92,
      }),
    },
    {
      name: "TITANIUM_HEAT_BLOOM",
      category: "metal",
      description: "Heat-anodized titanium with blue/purple exhaust bloom",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x5566aa,
        roughness: 0.20,
        metalness: 0.95,
      }),
    },
    {
      name: "MAGNESIUM_FORGED",
      category: "metal",
      description: "Forged magnesium alloy (wheel rims)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x9a9a9a,
        roughness: 0.30,
        metalness: 0.88,
      }),
    },
    {
      name: "INCONEL_718",
      category: "metal",
      description: "Inconel 718 superalloy (exhaust manifolds, turbo housings)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x707078,
        roughness: 0.35,
        metalness: 0.82,
      }),
    },
    {
      name: "BILLET_ALUMINUM",
      category: "metal",
      description: "CNC billet 6061-T6 aluminum (uprights, brackets)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0xb0b8c0,
        roughness: 0.22,
        metalness: 0.90,
      }),
    },
    {
      name: "STEEL_CHROMOLY",
      category: "metal",
      description: "4130 Chromoly steel (suspension arms, roll hoop)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x606068,
        roughness: 0.40,
        metalness: 0.85,
      }),
    },
    {
      name: "COPPER_HEATSINK",
      category: "metal",
      description: "Copper heat sink material (battery cooling, ECU housings)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0xb87333,
        roughness: 0.25,
        metalness: 0.92,
      }),
    },
    {
      name: "GOLD_PLATED",
      category: "metal",
      description: "Gold plating (electrical connectors, MGU housings)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0xd97706,
        roughness: 0.15,
        metalness: 0.95,
      }),
    },
    {
      name: "STAINLESS_STEEL",
      category: "metal",
      description: "316L stainless steel (fasteners, safety wire)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0xa0a5aa,
        roughness: 0.28,
        metalness: 0.90,
      }),
    },
    {
      name: "ANODIZED_RED",
      category: "metal",
      description: "Red anodized aluminum (center lock nuts, safety labels)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0xcc2222,
        roughness: 0.20,
        metalness: 0.88,
      }),
    },
    {
      name: "ANODIZED_BLUE",
      category: "metal",
      description: "Blue anodized aluminum (intercooler fittings, brake lines)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x2244aa,
        roughness: 0.20,
        metalness: 0.88,
      }),
    },
  ];

  // ════════════════════════════════════════════════════════════════════════
  // INTERIOR MATERIALS
  // ════════════════════════════════════════════════════════════════════════

  private static readonly INTERIOR_MATERIALS: AutomotiveMaterialDefinition[] = [
    {
      name: "ALCANTARA_SUEDE",
      category: "interior",
      description: "Alcantara/DINAMICA micro-suede (steering wheel, headliner, seat inserts)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x1e222d,
        roughness: 0.85,
        metalness: 0.02,
        sheen: 0.5,
        sheenColor: new THREE.Color(color ?? 0x2a2e3a),
        sheenRoughness: 0.4,
      }),
    },
    {
      name: "NAPPA_LEATHER",
      category: "interior",
      description: "Nappa full-grain leather (seats, door cards, dashboard)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x1a1510,
        roughness: 0.70,
        metalness: 0.03,
        clearcoat: 0.15,
        clearcoatRoughness: 0.35,
        sheen: 0.3,
        sheenColor: new THREE.Color(color ?? 0x2a2218),
      }),
    },
    {
      name: "BRIDLE_LEATHER",
      category: "interior",
      description: "Heavy bridle leather (race seat bolsters, door pulls)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x3a2a18,
        roughness: 0.60,
        metalness: 0.02,
        clearcoat: 0.1,
      }),
    },
    {
      name: "SUEDE_ON_ALCANTARA",
      category: "interior",
      description: "Open-pore Alcantara with higher nap depth (grip surfaces)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x222222,
        roughness: 0.92,
        metalness: 0.0,
        sheen: 0.6,
        sheenColor: new THREE.Color(0x333333),
      }),
    },
    {
      name: "OPEN_PORE_WOOD",
      category: "interior",
      description: "Open-pore wood veneer (luxury interior trim)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x3a2a1a,
        roughness: 0.50,
        metalness: 0.02,
        clearcoat: 0.4,
        clearcoatRoughness: 0.15,
      }),
    },
    {
      name: "CARBON_INTERIOR_TRIM",
      category: "interior",
      description: "Carbon fiber interior trim (center console, dashboard)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x151518,
        metalness: 0.45,
        roughness: 0.22,
        clearcoat: 0.9,
        clearcoatRoughness: 0.02,
      }),
    },
    {
      name: "STEERING_WHEEL_GRIP",
      category: "interior",
      description: "Perforated leather + Alcantara hybrid steering wheel grip",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x111111,
        roughness: 0.75,
        metalness: 0.02,
        sheen: 0.3,
        sheenColor: new THREE.Color(0x1a1a1a),
      }),
    },
  ];

  // ════════════════════════════════════════════════════════════════════════
  // BRAKE MATERIALS
  // ════════════════════════════════════════════════════════════════════════

  private static readonly BRAKE_MATERIALS: AutomotiveMaterialDefinition[] = [
    {
      name: "BRAKE_DISC_CARBON",
      category: "brake",
      description: "Carbon-carbon brake disc (F1 specification, 330mm)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x2a2a2a,
        roughness: 0.45,
        metalness: 0.55,
      }),
    },
    {
      name: "BRAKE_DISC_CSIC",
      category: "brake",
      description: "Carbon-Silicon Carbide (C/SiC) brake disc (GT/Hypercar, 420mm)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x3a3a3a,
        roughness: 0.38,
        metalness: 0.60,
      }),
    },
    {
      name: "BRAKE_CALIPER_BREMBO",
      category: "brake",
      description: "Painted Brembo monobloc caliper with clearcoat",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0xef4444,
        metalness: 0.85,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
      }),
    },
    {
      name: "BRAKE_CALIPER_GLOWING",
      category: "brake",
      description: "Brake caliper with thermal glow (for braking animations)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0xff4500,
        emissive: 0xff2200,
        emissiveIntensity: 1.5,
        roughness: 0.4,
      }),
    },
    {
      name: "BRAKE_PAD_FRICTION",
      category: "brake",
      description: "Brake pad friction material surface",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x444444,
        roughness: 0.90,
        metalness: 0.1,
      }),
    },
    {
      name: "BRAKE_LINE_STEEL",
      category: "brake",
      description: "Braided stainless steel brake line",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x888888,
        roughness: 0.35,
        metalness: 0.88,
      }),
    },
  ];

  // ════════════════════════════════════════════════════════════════════════
  // GLASS MATERIALS
  // ════════════════════════════════════════════════════════════════════════

  private static readonly GLASS_MATERIALS: AutomotiveMaterialDefinition[] = [
    {
      name: "GLASS_LAMINATED",
      category: "glass",
      description: "Laminated safety glass (windshield)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0xc8ddf0,
        transmission: 0.92,
        transparent: true,
        opacity: 0.40,
        roughness: 0.01,
        ior: 1.52,
        thickness: 0.006,
        depthWrite: false,
      }),
    },
    {
      name: "GLASS_POLYCARBONATE",
      category: "glass",
      description: "Polycarbonate (Lexan) lightweight windows",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0xd0d8e8,
        transmission: 0.88,
        transparent: true,
        opacity: 0.35,
        roughness: 0.02,
        ior: 1.58,
        thickness: 0.004,
        depthWrite: false,
      }),
    },
    {
      name: "GLASS_PRIVACY_TINT",
      category: "glass",
      description: "Privacy tinted rear glass",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x1a2030,
        transmission: 0.65,
        transparent: true,
        opacity: 0.55,
        roughness: 0.01,
        ior: 1.52,
        thickness: 0.005,
        depthWrite: false,
      }),
    },
    {
      name: "GLASS_ELECTROCHROMIC",
      category: "glass",
      description: "Electrochromic smart glass (variable tint)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0x4488aa,
        transmission: 0.50,
        transparent: true,
        opacity: 0.50,
        roughness: 0.005,
        ior: 1.52,
        thickness: 0.005,
        depthWrite: false,
      }),
    },
    {
      name: "GLASS_HEADLIGHT_LENS",
      category: "glass",
      description: "Headlight polycarbonate lens (anti-UV coated)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0xeeeeee,
        transmission: 0.95,
        transparent: true,
        opacity: 0.30,
        roughness: 0.005,
        ior: 1.58,
        clearcoat: 1.0,
        clearcoatRoughness: 0.005,
        depthWrite: false,
      }),
    },
    {
      name: "GLASS_MIRROR_CHROME",
      category: "glass",
      description: "Mirror-coated glass (rear view mirror, camera lens)",
      create: (color?: number) => new THREE.MeshPhysicalMaterial({
        color: color ?? 0xccccdd,
        metalness: 0.95,
        roughness: 0.0,
        envMapIntensity: 5.0,
      }),
    },
  ];

  // ════════════════════════════════════════════════════════════════════════
  // TIRE MATERIALS
  // ════════════════════════════════════════════════════════════════════════

  private static readonly TIRE_MATERIALS: AutomotiveMaterialDefinition[] = [
    {
      name: "TIRE_SLICK_DRY",
      category: "tire",
      description: "Pirelli/Michelin slick racing tire (dry compound)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x111111,
        roughness: 0.92,
        metalness: 0.02,
      }),
    },
    {
      name: "TIRE_INTERMEDIATE",
      category: "tire",
      description: "Intermediate rain tire with shallow grooves",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x151515,
        roughness: 0.88,
        metalness: 0.02,
      }),
    },
    {
      name: "TIRE_FULL_WET",
      category: "tire",
      description: "Full wet tire with deep grooves",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x1a1a1a,
        roughness: 0.85,
        metalness: 0.02,
      }),
    },
    {
      name: "TIRE_STREET_HIGH_PERF",
      category: "tire",
      description: "High-performance street tire (Michelin Pilot Sport)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x0e0e0e,
        roughness: 0.90,
        metalness: 0.01,
      }),
    },
    {
      name: "TIRE sidewall_lettering",
      category: "tire",
      description: "Raised white lettering on tire sidewall",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0xdddddd,
        roughness: 0.80,
        metalness: 0.0,
      }),
    },
  ];

  // ════════════════════════════════════════════════════════════════════════
  // LIGHTING MATERIALS
  // ════════════════════════════════════════════════════════════════════════

  private static readonly LIGHTING_MATERIALS: AutomotiveMaterialDefinition[] = [
    {
      name: "LED_HEADLIGHT_WHITE",
      category: "lighting",
      description: "White LED headlight emitter (6000K daylight)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 3.5,
        roughness: 0.1,
      }),
    },
    {
      name: "LED_DRL_AMBER",
      category: "lighting",
      description: "Amber LED daytime running light",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0xffa500,
        emissive: 0xff8800,
        emissiveIntensity: 2.5,
        roughness: 0.1,
      }),
    },
    {
      name: "OLED_TAILLIGHT_RED",
      category: "lighting",
      description: "OLED taillight bar (deep red, even glow)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0xff1122,
        emissive: 0xff0022,
        emissiveIntensity: 3.5,
        roughness: 0.1,
      }),
    },
    {
      name: "LED_BRAKELIGHT_RED",
      category: "lighting",
      description: "High-intensity brake light LED (FIA rain light)",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 5.0,
        roughness: 0.1,
      }),
    },
    {
      name: "LED_TURN_SIGNAL_AMBER",
      category: "lighting",
      description: "Amber turn signal / indicator LED",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0xffaa00,
        emissive: 0xff9900,
        emissiveIntensity: 2.0,
        roughness: 0.1,
      }),
    },
    {
      name: "FIBER_OPTIC_AMBIENT",
      category: "lighting",
      description: "Fiber optic ambient interior lighting strip",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x00f0ff,
        emissive: color ?? 0x00f0ff,
        emissiveIntensity: 1.5,
        roughness: 0.3,
      }),
    },
  ];

  // ════════════════════════════════════════════════════════════════════════
  // ENVIRONMENT MATERIALS
  // ════════════════════════════════════════════════════════════════════════

  private static readonly ENVIRONMENT_MATERIALS: AutomotiveMaterialDefinition[] = [
    {
      name: "WORKSHOP_FLOOR_POLISHED",
      category: "environment",
      description: "Polished concrete workshop floor with reflections",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x15181e,
        roughness: 0.2,
        metalness: 0.8,
      }),
    },
    {
      name: "SHOWROOM_FLOOR",
      category: "environment",
      description: "Dark showroom floor with subtle grid",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x080a10,
        roughness: 0.15,
        metalness: 0.85,
      }),
    },
    {
      name: "TRACK_ASPHALT",
      category: "environment",
      description: "Racing circuit asphalt surface",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x2a2a2a,
        roughness: 0.85,
        metalness: 0.0,
      }),
    },
    {
      name: "PIT_LANE_CONCRETE",
      category: "environment",
      description: "Pit lane concrete surface",
      create: (color?: number) => new THREE.MeshStandardMaterial({
        color: color ?? 0x555555,
        roughness: 0.75,
        metalness: 0.05,
      }),
    },
    {
      name: "SKY_DOME_CLEAR",
      category: "environment",
      description: "Clear sky environment dome for reflections",
      create: (color?: number) => new THREE.MeshBasicMaterial({
        color: color ?? 0x87ceeb,
        side: THREE.BackSide,
      }),
    },
  ];

  /**
   * Master list of all material definitions.
   */
  public static readonly MATERIALS: AutomotiveMaterialDefinition[] = [
    ...this.PAINT_MATERIALS,
    ...this.CARBON_MATERIALS,
    ...this.METAL_MATERIALS,
    ...this.INTERIOR_MATERIALS,
    ...this.BRAKE_MATERIALS,
    ...this.GLASS_MATERIALS,
    ...this.TIRE_MATERIALS,
    ...this.LIGHTING_MATERIALS,
    ...this.ENVIRONMENT_MATERIALS,
  ];

  /**
   * Returns the total number of available materials.
   */
  public static get totalMaterialCount(): number {
    return this.MATERIALS.length;
  }

  /**
   * Returns a list of all material names.
   */
  public static getAllMaterialNames(): string[] {
    return this.MATERIALS.map((m) => m.name);
  }

  /**
   * Returns a random material from a category.
   */
  public static getRandomMaterial(category: MaterialCategory): AutomotiveMaterialDefinition {
    const materials = this.getMaterialsByCategory(category);
    return materials[Math.floor(Math.random() * materials.length)];
  }
}
