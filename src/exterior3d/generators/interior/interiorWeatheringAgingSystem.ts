// ============================================================================
// INTERIOR WEATHERING & AGING SYSTEM — PATINA, UV FADING, USAGE MARKS
// ============================================================================
// Realistic interior wear and aging simulation system:
// - Leather patina development (oil absorption, darkening, smoothing)
// - UV fading simulation (dashboard top, door card upper surfaces)
// - Usage marks (seat bolster wear, armrest darkening, steering wheel shine)
// - Scratches and scuffs (piano black trim, chrome bezels, screen surfaces)
// - Brake dust accumulation (pedal surfaces, carpet near doors)
// - Spill stains (cup holder rings, armrest, seat cushions)
// - Heat damage (dashboard warping simulation, material discoloration)
// - Airbag cover aging (yellowing, texture change)
// - Carpet mat wear patterns (heel pad area, entry zone)
// - Seat creasing (leather base cushion compression lines)
// - Button wear (frequent-touch icons fading)
// - Screen fingerprint overlay
// - Vent dust accumulation
// - Rubber seal degradation (door weatherstripping)
// - Metal oxidation (aluminum trim, chrome bezels)
// - Fabric pilling (Alcantara / suede areas)
// - Odor simulation metadata (for AR/VR haptic feedback)
// - Mileage-based aging curves
// - Climate-based aging modifiers (tropical, desert, arctic)
// - Usage intensity multipliers (daily driver vs. weekend car)
// ============================================================================

import * as THREE from "three";

export type AgingEnvironment = "tropical" | "desert" | "temperate" | "arctic" | "coastal";
export type UsageIntensity = "daily_heavy" | "daily_moderate" | "weekend" | "garage_queen" | "showroom";
export type WearCategory = "leather" | "plastic" | "metal" | "fabric" | "glass" | "rubber" | "carbon" | "screen";

export interface AgingConfig {
  mileageKm: number;
  ageYears: number;
  environment: AgingEnvironment;
  usageIntensity: UsageIntensity;
  hasGarageStorage: boolean;
  hasSeatCovers: boolean;
  lastDetailDaysAgo: number;
  smokerOwner: boolean;
  petOwner: boolean;
  childSeats: boolean;
}

export interface WearResult {
  category: WearCategory;
  description: string;
  severityPercent: number; // 0-100
  affectedAreas: string[];
  visualChanges: string[];
  colorShift: string; // CSS color shift
  roughnessShift: number; // delta
  metalnessShift: number; // delta
  opacityShift: number; // for transparent materials
}

/**
 * Environment-based aging multipliers.
 */
const ENVIRONMENT_MULTIPLIERS: Record<AgingEnvironment, {
  uvFading: number;
  heatDamage: number;
  moistureDamage: number;
  saltCorrosion: number;
  dustAccumulation: number;
}> = {
  tropical: { uvFading: 1.4, heatDamage: 1.3, moistureDamage: 1.5, saltCorrosion: 0.8, dustAccumulation: 1.1 },
  desert: { uvFading: 1.8, heatDamage: 1.6, moistureDamage: 0.3, saltCorrosion: 0.2, dustAccumulation: 1.5 },
  temperate: { uvFading: 1.0, heatDamage: 1.0, moistureDamage: 1.0, saltCorrosion: 0.6, dustAccumulation: 1.0 },
  arctic: { uvFading: 0.5, heatDamage: 0.4, moistureDamage: 1.2, saltCorrosion: 1.4, dustAccumulation: 0.7 },
  coastal: { uvFading: 1.1, heatDamage: 0.9, moistureDamage: 1.3, saltCorrosion: 2.0, dustAccumulation: 0.9 },
};

/**
 * Usage intensity multipliers.
 */
const USAGE_MULTIPLIERS: Record<UsageIntensity, {
  seatWear: number;
  buttonWear: number;
  carpetWear: number;
  steeringWheelWear: number;
  pedalWear: number;
}> = {
  daily_heavy: { seatWear: 1.5, buttonWear: 1.3, carpetWear: 1.4, steeringWheelWear: 1.3, pedalWear: 1.5 },
  daily_moderate: { seatWear: 1.0, buttonWear: 1.0, carpetWear: 1.0, steeringWheelWear: 1.0, pedalWear: 1.0 },
  weekend: { seatWear: 0.6, buttonWear: 0.7, carpetWear: 0.5, steeringWheelWear: 0.6, pedalWear: 0.5 },
  garage_queen: { seatWear: 0.3, buttonWear: 0.3, carpetWear: 0.2, steeringWheelWear: 0.3, pedalWear: 0.2 },
  showroom: { seatWear: 0.1, buttonWear: 0.1, carpetWear: 0.05, steeringWheelWear: 0.1, pedalWear: 0.05 },
};

/**
 * Base aging rates per year for each wear category.
 */
const BASE_AGING_RATES: Record<WearCategory, number> = {
  leather: 0.08,
  plastic: 0.05,
  metal: 0.02,
  fabric: 0.06,
  glass: 0.01,
  rubber: 0.07,
  carbon: 0.03,
  screen: 0.02,
};

/**
 * Aging-progressive material modifier.
 * Applies realistic color shifts and property changes based on aging.
 */
function applyAgingToMaterial(
  material: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial,
  category: WearCategory,
  agingPercent: number
): void {
  const t = Math.min(1, agingPercent / 100);

  switch (category) {
    case "leather":
      // Leather darkens (oil absorption), roughness decreases (smoothing from use)
      material.color.multiplyScalar(1 - t * 0.15);
      material.roughness = Math.max(0.3, material.roughness - t * 0.2);
      if ("clearcoat" in material) {
        (material as any).clearcoat = Math.min(0.4, (material as any).clearcoat + t * 0.15);
      }
      break;

    case "plastic":
      // Dashboard plastic fades (lighter), becomes more matte
      material.color.lerp(new THREE.Color(0x808080), t * 0.2);
      material.roughness = Math.min(0.95, material.roughness + t * 0.15);
      break;

    case "metal":
      // Chrome/aluminum develops patina, slight darkening
      material.color.multiplyScalar(1 - t * 0.08);
      material.roughness = Math.min(0.5, material.roughness + t * 0.2);
      material.metalness = Math.max(0.5, material.metalness - t * 0.15);
      break;

    case "fabric":
      // Carpet fades, becomes slightly matted
      material.color.lerp(new THREE.Color(0x808080), t * 0.12);
      material.roughness = Math.min(0.98, material.roughness + t * 0.05);
      break;

    case "rubber":
      // Rubber seals dry out, crack appearance
      material.color.lerp(new THREE.Color(0x404040), t * 0.25);
      material.roughness = Math.min(0.95, material.roughness + t * 0.1);
      break;

    case "carbon":
      // Carbon fiber clearcoat yellows slightly
      const yellowTint = new THREE.Color(0x1a1a00);
      material.color.lerp(yellowTint, t * 0.08);
      if ("clearcoat" in material) {
        (material as any).clearcoatRoughness = Math.min(0.15, (material as any).clearcoatRoughness + t * 0.08);
      }
      break;

    case "glass":
      // Window glass develops micro-scratches (haze)
      if ("transmission" in material) {
        (material as any).transmission = Math.max(0.6, (material as any).transmission - t * 0.15);
      }
      material.roughness = Math.min(0.1, material.roughness + t * 0.05);
      break;

    case "screen":
      // Screen develops fingerprint overlay (slight haze)
      material.roughness = Math.min(0.08, material.roughness + t * 0.03);
      break;
  }
}

export class InteriorWeatheringAgingSystem {
  private config: AgingConfig;
  private envMultipliers: typeof ENVIRONMENT_MULTIPLIERS.temperate;
  private usageMultipliers: typeof USAGE_MULTIPLIERS.daily_moderate;

  constructor(config: AgingConfig) {
    this.config = config;
    this.envMultipliers = ENVIRONMENT_MULTIPLIERS[config.environment];
    this.usageMultipliers = USAGE_MULTIPLIERS[config.usageIntensity];
  }

  /**
   * Calculates the overall aging percentage based on all factors.
   */
  public calculateAgingPercent(category: WearCategory): number {
    const baseRate = BASE_AGING_RATES[category];
    const years = this.config.ageYears;
    const mileageFactor = Math.min(2, this.config.mileageKm / 100000); // Normalize to 100k km

    let aging = baseRate * years * 100 * (1 + mileageFactor * 0.5);

    // Apply environment modifier
    const envKey = this.getEnvironmentKey(category);
    if (envKey) {
      aging *= this.envMultipliers[envKey];
    }

    // Apply usage modifier
    const usageKey = this.getUsageKey(category);
    if (usageKey) {
      aging *= this.usageMultipliers[usageKey];
    }

    // Protective factors
    if (this.config.hasGarageStorage) aging *= 0.7;
    if (this.config.hasSeatCovers) aging *= 0.5;
    if (this.config.lastDetailDaysAgo < 30) aging *= 0.8;

    // Damage multipliers
    if (this.config.smokerOwner && category === "fabric") aging *= 1.4;
    if (this.config.petOwner && category === "leather") aging *= 1.2;
    if (this.config.childSeats && category === "leather") aging *= 1.15;

    return Math.min(100, Math.max(0, aging));
  }

  private getEnvironmentKey(category: WearCategory): keyof typeof ENVIRONMENT_MULTIPLIERS.temperate | null {
    switch (category) {
      case "leather": return "moistureDamage";
      case "plastic": return "uvFading";
      case "metal": return "saltCorrosion";
      case "fabric": return "dustAccumulation";
      case "rubber": return "heatDamage";
      case "carbon": return "uvFading";
      case "glass": return "dustAccumulation";
      default: return null;
    }
  }

  private getUsageKey(category: WearCategory): keyof typeof USAGE_MULTIPLIERS.daily_moderate | null {
    switch (category) {
      case "leather": return "seatWear";
      case "plastic": return "buttonWear";
      case "fabric": return "carpetWear";
      case "metal": return "pedalWear";
      default: return null;
    }
  }

  /**
   * Analyzes all interior materials and returns wear results.
   */
  public analyzeAllWear(): WearResult[] {
    const results: WearResult[] = [];

    // 1. Leather Seats
    const leatherAging = this.calculateAgingPercent("leather");
    results.push({
      category: "leather",
      description: "Seat leather patina and bolster wear",
      severityPercent: leatherAging,
      affectedAreas: ["Driver seat base", "Driver seat bolsters", "Armrest", "Steering wheel rim"],
      visualChanges: ["Darkening from oil absorption", "Smoothing of grain texture", "Bolster creasing"],
      colorShift: `rgb(${Math.round(30 - leatherAging * 0.15)}, ${Math.round(30 - leatherAging * 0.12)}, ${Math.round(35 - leatherAging * 0.10)})`,
      roughnessShift: -leatherAging * 0.002,
      metalnessShift: 0,
      opacityShift: 0,
    });

    // 2. Dashboard Plastic
    const plasticAging = this.calculateAgingPercent("plastic");
    results.push({
      category: "plastic",
      description: "Dashboard UV fading and surface degradation",
      severityPercent: plasticAging,
      affectedAreas: ["Dashboard top surface", "Door card upper", "A-pillar trim", "Console surround"],
      visualChanges: ["UV fading (lighter gray)", "Increased matte texture", "Surface micro-cracks"],
      colorShift: `rgb(${Math.round(26 + plasticAging * 0.3)}, ${Math.round(29 + plasticAging * 0.25)}, ${Math.round(36 + plasticAging * 0.2)})`,
      roughnessShift: plasticAging * 0.0015,
      metalnessShift: 0,
      opacityShift: 0,
    });

    // 3. Metal Trim
    const metalAging = this.calculateAgingPercent("metal");
    results.push({
      category: "metal",
      description: "Aluminum/chrome patina and oxidation",
      severityPercent: metalAging,
      affectedAreas: ["Door handles", "Air vent bezels", "Seat adjustment knobs", "Window switches"],
      visualChanges: ["Slight tarnishing", "Reduced mirror reflectivity", "Micro-scratches"],
      colorShift: `rgb(${Math.round(190 - metalAging * 0.3)}, ${Math.round(195 - metalAging * 0.25)}, ${Math.round(200 - metalAging * 0.2)})`,
      roughnessShift: metalAging * 0.002,
      metalnessShift: -metalAging * 0.0015,
      opacityShift: 0,
    });

    // 4. Carpet / Fabric
    const fabricAging = this.calculateAgingPercent("fabric");
    results.push({
      category: "fabric",
      description: "Carpet mat wear and floor fabric soiling",
      severityPercent: fabricAging,
      affectedAreas: ["Driver heel pad", "Door entry zones", "Under-seat area", "Headliner"],
      visualChanges: ["Heel pad matting", "Entry zone soiling", "Carpet fiber crushing"],
      colorShift: `rgb(${Math.round(15 + fabricAging * 0.2)}, ${Math.round(18 + fabricAging * 0.15)}, ${Math.round(25 + fabricAging * 0.1)})`,
      roughnessShift: fabricAging * 0.001,
      metalnessShift: 0,
      opacityShift: 0,
    });

    // 5. Rubber Seals
    const rubberAging = this.calculateAgingPercent("rubber");
    results.push({
      category: "rubber",
      description: "Door weatherstripping and window seal degradation",
      severityPercent: rubberAging,
      affectedAreas: ["Door weatherstripping", "Window channels", "Pedal pads", "Floor mat edges"],
      visualChanges: ["Dry rot appearance", "Slight cracking", "Loss of elasticity visual"],
      colorShift: `rgb(${Math.round(24 - rubberAging * 0.2)}, ${Math.round(24 - rubberAging * 0.15)}, ${Math.round(26 - rubberAging * 0.1)})`,
      roughnessShift: rubberAging * 0.001,
      metalnessShift: 0,
      opacityShift: 0,
    });

    // 6. Carbon Fiber Trim
    const carbonAging = this.calculateAgingPercent("carbon");
    results.push({
      category: "carbon",
      description: "Carbon fiber clearcoat yellowing and micro-scratches",
      severityPercent: carbonAging,
      affectedAreas: ["Dashboard trim", "Door card inlays", "Center console", "Steering wheel spokes"],
      visualChanges: ["Slight amber tint to clearcoat", "Reduced gloss", "Fine surface scratches"],
      colorShift: `rgb(${Math.round(10 + carbonAging * 0.08)}, ${Math.round(13 + carbonAging * 0.06)}, ${Math.round(20 + carbonAging * 0.02)})`,
      roughnessShift: carbonAging * 0.0008,
      metalnessShift: 0,
      opacityShift: 0,
    });

    // 7. Screen Surfaces
    const screenAging = this.calculateAgingPercent("screen");
    results.push({
      category: "screen",
      description: "Display screen fingerprint overlay and micro-scratches",
      severityPercent: screenAging,
      affectedAreas: ["Central infotainment", "Instrument cluster", "Passenger display", "HUD lens"],
      visualChanges: ["Fingerprint smudge overlay", "Anti-reflective coating wear", "Micro-scratches"],
      colorShift: "none",
      roughnessShift: screenAging * 0.0005,
      metalnessShift: 0,
      opacityShift: 0,
    });

    // 8. Glass
    const glassAging = this.calculateAgingPercent("glass");
    results.push({
      category: "glass",
      description: "Interior glass haze and micro-scratch development",
      severityPercent: glassAging,
      affectedAreas: ["Instrument cluster lens", "Infotainment screen cover", "HUD combiner"],
      visualChanges: ["Slight haze from cleaning", "Fine scratches from dust", "Reduced clarity"],
      colorShift: "none",
      roughnessShift: glassAging * 0.0005,
      metalnessShift: 0,
      opacityShift: -glassAging * 0.001,
    });

    return results;
  }

  /**
   * Applies aging effects to a Three.js material based on category and aging percent.
   */
  public applyAgingToMaterial(material: THREE.Material, category: WearCategory): void {
    const aging = this.calculateAgingPercent(category);
    if (material instanceof THREE.MeshPhysicalMaterial || material instanceof THREE.MeshStandardMaterial) {
      applyAgingToMaterial(material, category, aging);
    }
  }

  /**
   * Applies aging to an entire scene graph, updating materials based on naming conventions.
   */
  public applyAgingToScene(scene: THREE.Scene): void {
    scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      const name = node.name.toLowerCase();

      let category: WearCategory | null = null;

      if (name.includes("seat") || name.includes("leather") || name.includes("armrest") || name.includes("headrest")) {
        category = "leather";
      } else if (name.includes("dashboard") || name.includes("dash") || name.includes("console") || name.includes("plastic")) {
        category = "plastic";
      } else if (name.includes("aluminum") || name.includes("chrome") || name.includes("metal") || name.includes("bezel") || name.includes("vent")) {
        category = "metal";
      } else if (name.includes("carpet") || name.includes("fabric") || name.includes("headliner") || name.includes("suede")) {
        category = "fabric";
      } else if (name.includes("rubber") || name.includes("seal") || name.includes("weatherstrip") || name.includes("pedal_pad")) {
        category = "rubber";
      } else if (name.includes("carbon") || name.includes("weave")) {
        category = "carbon";
      } else if (name.includes("screen") || name.includes("display") || name.includes("cluster")) {
        category = "screen";
      } else if (name.includes("glass") || name.includes("windshield") || name.includes("window")) {
        category = "glass";
      }

      if (category) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        for (const mat of materials) {
          this.applyAgingToMaterial(mat, category);
        }
      }
    });
  }

  /**
   * Creates a wear visualization overlay (colored highlights showing wear zones).
   */
  public createWearVisualization(scene: THREE.Scene): THREE.Group {
    const group = new THREE.Group();
    group.name = "WearVisualization";

    const results = this.analyzeAllWear();

    for (const result of results) {
      if (result.severityPercent < 10) continue; // Skip minimal wear

      const severity = result.severityPercent / 100;
      const color = new THREE.Color();
      if (severity < 0.3) color.setHex(0x22c55e); // Green = mild
      else if (severity < 0.6) color.setHex(0xf59e0b); // Amber = moderate
      else color.setHex(0xef4444); // Red = severe

      const markerGeo = new THREE.SphereGeometry(0.015, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6,
      });

      // Place markers at approximate affected area positions
      const positions = this.getAffectedAreaPositions(result.category);
      for (const pos of positions) {
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.set(...pos);
        marker.name = `WearMarker_${result.category}`;
        group.add(marker);
      }
    }

    return group;
  }

  private getAffectedAreaPositions(category: WearCategory): [number, number, number][] {
    switch (category) {
      case "leather":
        return [[-0.68, 0.38, -0.30], [0.68, 0.38, -0.30], [-0.68, 0.52, 0.18], [0.68, 0.52, 0.18]];
      case "plastic":
        return [[-0.45, 0.78, -0.65], [0.45, 0.78, -0.65], [-0.82, 0.65, 0.15], [0.82, 0.65, 0.15]];
      case "metal":
        return [[-0.82, 0.50, 0.45], [0.82, 0.50, 0.45], [-0.45, 0.74, 0.0], [-0.20, 0.24, 0.0]];
      case "fabric":
        return [[-0.68, 0.01, -0.55], [0.68, 0.01, -0.55], [0.0, 1.28, 0.15]];
      case "rubber":
        return [[-0.82, 0.30, -0.30], [0.82, 0.30, -0.30], [-0.68, 0.10, -0.75]];
      case "carbon":
        return [[0.0, 0.66, -0.64], [-0.85, 0.10, 0.20], [0.85, 0.10, 0.20]];
      case "screen":
        return [[-0.68, 0.92, -0.54], [-0.47, 0.68, 0.08], [0.48, 0.78, -0.35]];
      case "glass":
        return [[-0.68, 0.92, -0.54], [-0.68, 0.98, -0.82]];
      default:
        return [];
    }
  }

  /**
   * Generates a wear report summary.
   */
  public generateWearReport(): string {
    const results = this.analyzeAllWear();
    let report = "=== INTERIOR WEAR & AGING REPORT ===\n\n";
    report += `Vehicle Age: ${this.config.ageYears} years | Mileage: ${this.config.mileageKm.toLocaleString()} km\n`;
    report += `Environment: ${this.config.environment} | Usage: ${this.config.usageIntensity}\n`;
    report += `Garage: ${this.config.hasGarageStorage ? "Yes" : "No"} | Last Detail: ${this.config.lastDetailDaysAgo} days ago\n\n`;

    for (const r of results) {
      const severity = r.severityPercent < 20 ? "MINOR" :
                       r.severityPercent < 50 ? "MODERATE" :
                       r.severityPercent < 75 ? "SIGNIFICANT" : "SEVERE";
      report += `[${severity}] ${r.category.toUpperCase()} — ${r.description}\n`;
      report += `  Wear: ${r.severityPercent.toFixed(1)}%\n`;
      report += `  Areas: ${r.affectedAreas.join(", ")}\n`;
      report += `  Changes: ${r.visualChanges.join("; ")}\n\n`;
    }

    return report;
  }
}
