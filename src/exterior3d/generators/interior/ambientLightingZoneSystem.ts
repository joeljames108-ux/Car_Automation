// ============================================================================
// AMBIENT LIGHTING ZONE SYSTEM — 64-COLOR FIBER OPTIC CABIN ILLUMINATION
// ============================================================================
// Multi-zone ambient interior lighting system for hyper-luxury cabins:
// - Door sill entry lights (illuminated scuff plates with logo projection)
// - Foot well ambient glow (front driver, front passenger, rear left, rear right)
// - Dashboard ambient ribbon strip (continuous LED strip under cowl)
// - Center console ambient halo (around rotary dial, wireless pads)
// - Door panel ambient spear (horizontal light line along door card)
// - Starlight headliner (fiber-optic pin-point constellation in headliner)
// - Seat ambient accent (backrest LED edge lighting)
// - Rear parcel shelf ambient glow
// - Gear selector / shifter ambient ring
// - Pedal box footwell illumination
// - Glove box interior illumination
// - Cup holder ambient ring glow
// - Mirror / visor vanity light
// - Rear passenger reading lights
// - Full-zone color synchronization controller
// ============================================================================

import * as THREE from "three";

export interface AmbientZoneDefinition {
  id: string;
  name: string;
  category: "door_sill" | "footwell" | "dashboard" | "console" | "door_panel" | "roof" | "seat" | "rear" | "gear" | "pedal" | "glovebox" | "cupholder" | "mirror" | "reading";
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number]; // width, height, depth in meters
  shape: "box" | "tube" | "ring" | "point" | "sphere";
  defaultColorHex: string;
  brightness: number; // 0 to 1
  animated: boolean;
  animationSpeed: number;
  animationType: "pulse" | "breathe" | "flow" | "none";
}

export const AMBIENT_ZONE_PRESETS: AmbientZoneDefinition[] = [
  // Door Sills (2 zones - left and right)
  {
    id: "door_sill_left", name: "Driver Door Sill", category: "door_sill",
    position: [-0.82, 0.02, 0.15], rotation: [0, 0, 0],
    size: [0.6, 0.005, 0.12], shape: "box",
    defaultColorHex: "#f59e0b", brightness: 0.8, animated: false, animationSpeed: 0, animationType: "none",
  },
  {
    id: "door_sill_right", name: "Passenger Door Sill", category: "door_sill",
    position: [0.82, 0.02, 0.15], rotation: [0, 0, 0],
    size: [0.6, 0.005, 0.12], shape: "box",
    defaultColorHex: "#f59e0b", brightness: 0.8, animated: false, animationSpeed: 0, animationType: "none",
  },
  // Foot Wells (4 zones)
  {
    id: "footwell_driver", name: "Driver Footwell", category: "footwell",
    position: [-0.68, -0.02, -0.55], rotation: [0, 0, 0],
    size: [0.40, 0.003, 0.50], shape: "box",
    defaultColorHex: "#f59e0b", brightness: 0.6, animated: false, animationSpeed: 0, animationType: "none",
  },
  {
    id: "footwell_passenger", name: "Passenger Footwell", category: "footwell",
    position: [0.68, -0.02, -0.55], rotation: [0, 0, 0],
    size: [0.40, 0.003, 0.50], shape: "box",
    defaultColorHex: "#f59e0b", brightness: 0.6, animated: false, animationSpeed: 0, animationType: "none",
  },
  {
    id: "footwell_rear_left", name: "Rear Left Footwell", category: "footwell",
    position: [-0.60, -0.02, 0.65], rotation: [0, 0, 0],
    size: [0.35, 0.003, 0.40], shape: "box",
    defaultColorHex: "#f59e0b", brightness: 0.4, animated: false, animationSpeed: 0, animationType: "none",
  },
  {
    id: "footwell_rear_right", name: "Rear Right Footwell", category: "footwell",
    position: [0.60, -0.02, 0.65], rotation: [0, 0, 0],
    size: [0.35, 0.003, 0.40], shape: "box",
    defaultColorHex: "#f59e0b", brightness: 0.4, animated: false, animationSpeed: 0, animationType: "none",
  },
  // Dashboard Ribbon
  {
    id: "dash_ribbon", name: "Dashboard Ambient Ribbon", category: "dashboard",
    position: [-0.45, 0.74, 0.0], rotation: [0, 0, 0],
    size: [1.45, 0.005, 0.012], shape: "box",
    defaultColorHex: "#f59e0b", brightness: 0.7, animated: true, animationSpeed: 0.5, animationType: "breathe",
  },
  // Console Halo
  {
    id: "console_halo", name: "Center Console Halo", category: "console",
    position: [-0.20, 0.23, 0.0], rotation: [Math.PI / 2, 0, 0],
    size: [0.08, 0.005, 0.08], shape: "ring",
    defaultColorHex: "#f59e0b", brightness: 0.9, animated: true, animationSpeed: 1.0, animationType: "pulse",
  },
  // Door Panel Spears
  {
    id: "door_spear_left", name: "Driver Door Ambient Spear", category: "door_panel",
    position: [-0.82, 0.65, 0.15], rotation: [0, 0, 0],
    size: [0.005, 0.008, 0.95], shape: "box",
    defaultColorHex: "#f59e0b", brightness: 0.75, animated: true, animationSpeed: 0.8, animationType: "flow",
  },
  {
    id: "door_spear_right", name: "Passenger Door Ambient Spear", category: "door_panel",
    position: [0.82, 0.65, 0.15], rotation: [0, 0, 0],
    size: [0.005, 0.008, 0.95], shape: "box",
    defaultColorHex: "#f59e0b", brightness: 0.75, animated: true, animationSpeed: 0.8, animationType: "flow",
  },
  // Seat Accents
  {
    id: "seat_accent_driver", name: "Driver Seat LED Accent", category: "seat",
    position: [-0.68, 0.65, -0.30], rotation: [0, 0, -0.15],
    size: [0.003, 0.50, 0.003], shape: "box",
    defaultColorHex: "#f59e0b", brightness: 0.5, animated: true, animationSpeed: 0.3, animationType: "breathe",
  },
  {
    id: "seat_accent_passenger", name: "Passenger Seat LED Accent", category: "seat",
    position: [0.68, 0.65, -0.30], rotation: [0, 0, 0.15],
    size: [0.003, 0.50, 0.003], shape: "box",
    defaultColorHex: "#f59e0b", brightness: 0.5, animated: true, animationSpeed: 0.3, animationType: "breathe",
  },
  // Cup Holder Rings
  {
    id: "cupholder_left", name: "Left Cupholder Ring", category: "cupholder",
    position: [-0.36, 0.23, -0.06], rotation: [Math.PI / 2, 0, 0],
    size: [0.04, 0.003, 0.04], shape: "ring",
    defaultColorHex: "#f59e0b", brightness: 0.6, animated: false, animationSpeed: 0, animationType: "none",
  },
  {
    id: "cupholder_right", name: "Right Cupholder Ring", category: "cupholder",
    position: [-0.36, 0.23, 0.06], rotation: [Math.PI / 2, 0, 0],
    size: [0.04, 0.003, 0.04], shape: "ring",
    defaultColorHex: "#f59e0b", brightness: 0.6, animated: false, animationSpeed: 0, animationType: "none",
  },
  // Gear Selector Ring
  {
    id: "gear_ring", name: "Gear Selector Ambient Ring", category: "gear",
    position: [-0.20, 0.24, 0.0], rotation: [Math.PI / 2, 0, 0],
    size: [0.05, 0.004, 0.05], shape: "ring",
    defaultColorHex: "#f59e0b", brightness: 0.85, animated: true, animationSpeed: 1.5, animationType: "pulse",
  },
  // Pedal Box
  {
    id: "pedal_box", name: "Pedal Box Illumination", category: "pedal",
    position: [-0.68, 0.10, -0.75], rotation: [0, 0, 0],
    size: [0.20, 0.003, 0.18], shape: "box",
    defaultColorHex: "#ffffff", brightness: 0.4, animated: false, animationSpeed: 0, animationType: "none",
  },
  // Glove Box
  {
    id: "glovebox", name: "Glove Box Interior Light", category: "glovebox",
    position: [0.55, 0.55, -0.35], rotation: [0, 0, 0],
    size: [0.15, 0.003, 0.10], shape: "box",
    defaultColorHex: "#ffffff", brightness: 0.5, animated: false, animationSpeed: 0, animationType: "none",
  },
  // Rear Shelf
  {
    id: "rear_shelf", name: "Rear Parcel Shelf Glow", category: "rear",
    position: [0.0, 0.50, 1.05], rotation: [0, 0, 0],
    size: [1.20, 0.003, 0.08], shape: "box",
    defaultColorHex: "#f59e0b", brightness: 0.35, animated: true, animationSpeed: 0.4, animationType: "breathe",
  },
];

/**
 * Creates a single ambient light zone mesh.
 */
function createAmbientZoneMesh(zone: AmbientZoneDefinition): THREE.Mesh {
  const color = new THREE.Color(zone.defaultColorHex);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: zone.brightness * 0.7,
    side: THREE.DoubleSide,
  });

  let geo: THREE.BufferGeometry;

  switch (zone.shape) {
    case "ring":
      geo = new THREE.TorusGeometry(
        zone.size[0] / 2,
        zone.size[1] / 2,
        8, 32
      );
      break;
    case "sphere":
      geo = new THREE.SphereGeometry(zone.size[0] / 2, 16, 16);
      break;
    case "point":
      geo = new THREE.SphereGeometry(0.003, 8, 8);
      break;
    default: // box
      geo = new THREE.BoxGeometry(zone.size[0], zone.size[1], zone.size[2]);
  }

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...zone.position);
  mesh.rotation.set(...zone.rotation);
  mesh.name = `Ambient_${zone.id}`;
  mesh.userData = {
    isAmbientLight: true,
    zoneId: zone.id,
    category: zone.category,
    baseBrightness: zone.brightness,
    animated: zone.animated,
    animationSpeed: zone.animationSpeed,
    animationType: zone.animationType,
    baseColor: zone.defaultColorHex,
  };

  return mesh;
}

/**
 * Starlight headliner fiber-optic pin-point constellation generator.
 */
export class StarlightHeadlinerSystem {
  private points: THREE.Points;
  private material: THREE.PointsMaterial;
  private basePositions: Float32Array;
  private twinklePhases: Float32Array;
  private starCount: number;

  constructor(
    widthMm: number = 1200,
    lengthMm: number = 1400,
    starCount: number = 500,
    colorHex: string = "#ffffff"
  ) {
    this.starCount = starCount;
    const w = widthMm / 1000;
    const l = lengthMm / 1000;

    const positions = new Float32Array(starCount * 3);
    this.basePositions = new Float32Array(starCount * 3);
    this.twinklePhases = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * w;
      const y = 1.28; // Headliner height
      const z = (Math.random() - 0.5) * l;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      this.basePositions[i * 3] = x;
      this.basePositions[i * 3 + 1] = y;
      this.basePositions[i * 3 + 2] = z;
      this.twinklePhases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    this.material = new THREE.PointsMaterial({
      color: new THREE.Color(colorHex),
      size: 0.004,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.name = "Starlight_Headliner";
    this.points.userData = { isAmbientLight: true, category: "roof", zoneId: "starlight_headliner" };
  }

  public getObject3D(): THREE.Points {
    return this.points;
  }

  /**
   * Updates twinkle animation for starlight fiber optics.
   */
  public update(timeSec: number): void {
    const positions = this.points.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.starCount; i++) {
      const phase = this.twinklePhases[i];
      const twinkle = 0.4 + Math.sin(timeSec * 2.0 + phase) * 0.3 + Math.sin(timeSec * 3.7 + phase * 1.3) * 0.3;
      // Subtle Y-axis micro-motion
      positions[i * 3 + 1] = this.basePositions[i * 3 + 1] + Math.sin(timeSec + phase) * 0.001;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Changes the color of all starlight points.
   */
  public setColor(colorHex: string): void {
    this.material.color.set(colorHex);
  }

  public dispose(): void {
    this.points.geometry.dispose();
    this.material.dispose();
  }
}

/**
 * Master ambient lighting controller that manages all zones.
 */
export class AmbientLightingZoneController {
  private zones: Map<string, THREE.Mesh> = new Map();
  private starlightSystem: StarlightHeadlinerSystem;
  private scene: THREE.Scene;
  private masterColor: string = "#f59e0b";
  private masterBrightness: number = 1.0;
  private time: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.starlightSystem = new StarlightHeadlinerSystem();

    // Create all zone meshes
    for (const zoneDef of AMBIENT_ZONE_PRESETS) {
      const mesh = createAmbientZoneMesh(zoneDef);
      this.zones.set(zoneDef.id, mesh);
    }
  }

  /**
   * Adds all ambient light zones and starlight to the scene.
   */
  public addToScene(): void {
    for (const [, mesh] of this.zones) {
      this.scene.add(mesh);
    }
    this.scene.add(this.starlightSystem.getObject3D());
  }

  /**
   * Sets the master color for all zones.
   */
  public setMasterColor(colorHex: string): void {
    this.masterColor = colorHex;
    for (const [, mesh] of this.zones) {
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.color.set(colorHex);
    }
    this.starlightSystem.setColor(colorHex);
  }

  /**
   * Sets master brightness for all zones.
   */
  public setMasterBrightness(brightness: number): void {
    this.masterBrightness = Math.max(0, Math.min(1, brightness));
    for (const [, mesh] of this.zones) {
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const baseBright = mesh.userData.baseBrightness || 0.7;
      mat.opacity = baseBright * this.masterBrightness * 0.7;
    }
  }

  /**
   * Sets color for a specific zone.
   */
  public setZoneColor(zoneId: string, colorHex: string): void {
    const mesh = this.zones.get(zoneId);
    if (mesh) {
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.color.set(colorHex);
    }
  }

  /**
   * Enables/disables a specific zone.
   */
  public setZoneEnabled(zoneId: string, enabled: boolean): void {
    const mesh = this.zones.get(zoneId);
    if (mesh) {
      mesh.visible = enabled;
    }
  }

  /**
   * Applies a lighting theme (all zones change to theme color).
   */
  public applyTheme(themeName: string): void {
    const themes: Record<string, string> = {
      "arctic_ice": "#f59e0b",
      "warm_amber": "#f59e0b",
      "cosmic_purple": "#f59e0b",
      "racing_red": "#ef4444",
      "emerald_green": "#22c55e",
      "rose_gold": "#fbbf24",
      "sunset_orange": "#f97316",
      "midnight_blue": "#d97706",
      "pure_white": "#ffffff",
      "ocean_teal": "#14b8a6",
    };
    const color = themes[themeName] || "#f59e0b";
    this.setMasterColor(color);
  }

  /**
   * Updates animated zones.
   */
  public update(dt: number): void {
    this.time += dt;
    this.starlightSystem.update(this.time);

    for (const [, mesh] of this.zones) {
      if (!mesh.userData.animated) continue;

      const speed = mesh.userData.animationSpeed || 1.0;
      const animType = mesh.userData.animationType;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const baseOp = (mesh.userData.baseBrightness || 0.7) * this.masterBrightness * 0.7;

      switch (animType) {
        case "pulse":
          mat.opacity = baseOp * (0.5 + Math.sin(this.time * speed * 4) * 0.5);
          break;
        case "breathe":
          mat.opacity = baseOp * (0.7 + Math.sin(this.time * speed * 2) * 0.3);
          break;
        case "flow":
          // Flow effect via position micro-shift
          mesh.position.y = mesh.userData._baseY || mesh.position.y;
          if (!mesh.userData._baseY) mesh.userData._baseY = mesh.position.y;
          mesh.position.y = mesh.userData._baseY + Math.sin(this.time * speed * 3) * 0.002;
          break;
      }
    }
  }

  /**
   * Returns the count of active zones.
   */
  public getZoneCount(): number {
    return this.zones.size;
  }

  /**
   * Disposes all resources.
   */
  public dispose(): void {
    for (const [, mesh] of this.zones) {
      (mesh.material as THREE.Material).dispose();
      mesh.geometry.dispose();
    }
    this.zones.clear();
    this.starlightSystem.dispose();
  }
}
