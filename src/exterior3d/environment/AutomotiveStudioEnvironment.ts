/**
 * ============================================================================
 * AUTOMOTIVE STUDIO ENVIRONMENT & LIGHTING RIG MASTER ENGINE
 * ============================================================================
 * Generates photorealistic automotive studio environments, dynamic gradient
 * backdrops, 5-point lighting rigs, and contact shadow floors.
 * 
 * Presets:
 * 1. Luxury Showroom (Clean Silver & White Studio)
 * 2. Titanium Slate (Modern CAD Design Studio - Default)
 * 3. Warm Sunset (Golden Hour Amber Studio - Matches warm theme)
 * 4. Cyberpunk Neon (Electric Violet & Cyan Hologram Studio)
 * 5. Blueprint Navy (Aeronautical Technical CAD Drafting Studio)
 * 6. Obsidian Stealth (Carbon Fiber Darkroom with High Contrast)
 */

import * as THREE from "three";

export type StudioEnvironmentPreset =
  | "luxury_showroom"
  | "titanium_slate"
  | "warm_sunset"
  | "cyberpunk_neon"
  | "blueprint_navy"
  | "obsidian_stealth";

export interface StudioEnvironmentConfig {
  id: StudioEnvironmentPreset;
  name: string;
  tagline: string;
  category: "light" | "slate" | "warm" | "creative" | "dark";
  topColor: string;
  horizonColor: string;
  floorColor: string;
  ambientLightColor: number;
  ambientLightIntensity: number;
  hemiSkyColor: number;
  hemiGroundColor: number;
  hemiIntensity: number;
  keyLightColor: number;
  keyLightIntensity: number;
  keyLightPos: [number, number, number];
  fillLightColor: number;
  fillLightIntensity: number;
  rimLightColor: number;
  rimLightIntensity: number;
  gridPrimaryColor: number;
  gridSecondaryColor: number;
  gridOpacity: number;
  floorReflectivity: number;
  toneMappingExposure: number;
}

export const STUDIO_ENVIRONMENT_PRESETS: Record<StudioEnvironmentPreset, StudioEnvironmentConfig> = {
  luxury_showroom: {
    id: "luxury_showroom",
    name: "Luxury Showroom",
    tagline: "Clean high-key daylight studio with polished porcelain reflections",
    category: "light",
    topColor: "#f8fafc",
    horizonColor: "#e2e8f0",
    floorColor: "#cbd5e1",
    ambientLightColor: 0xffffff,
    ambientLightIntensity: 1.6,
    hemiSkyColor: 0xffffff,
    hemiGroundColor: 0x94a3b8,
    hemiIntensity: 0.8,
    keyLightColor: 0xfffaf0,
    keyLightIntensity: 3.2,
    keyLightPos: [6, 10, -6],
    fillLightColor: 0xfbbf24,
    fillLightIntensity: 1.2,
    rimLightColor: 0xf59e0b,
    rimLightIntensity: 1.0,
    gridPrimaryColor: 0x475569,
    gridSecondaryColor: 0x94a3b8,
    gridOpacity: 0.35,
    floorReflectivity: 0.22,
    toneMappingExposure: 1.15,
  },

  titanium_slate: {
    id: "titanium_slate",
    name: "Titanium Slate",
    tagline: "Modern CAD design studio with brushed anthracite & cyan accents",
    category: "slate",
    topColor: "#1e293b",
    horizonColor: "#0f172a",
    floorColor: "#182234",
    ambientLightColor: 0xe2e8f0,
    ambientLightIntensity: 1.1,
    hemiSkyColor: 0xfbbf24,
    hemiGroundColor: 0x1a1508,
    hemiIntensity: 0.6,
    keyLightColor: 0xfff8ee,
    keyLightIntensity: 3.0,
    keyLightPos: [6, 9, -6],
    fillLightColor: 0xd97706,
    fillLightIntensity: 1.4,
    rimLightColor: 0xfbbf24,
    rimLightIntensity: 1.2,
    gridPrimaryColor: 0xf59e0b,
    gridSecondaryColor: 0x334155,
    gridOpacity: 0.4,
    floorReflectivity: 0.16,
    toneMappingExposure: 1.35,
  },

  warm_sunset: {
    id: "warm_sunset",
    name: "Warm Sunset Studio",
    tagline: "Golden hour amber horizon matching warm UI glassmorphism theme",
    category: "warm",
    topColor: "#2e1814",
    horizonColor: "#451a14",
    floorColor: "#1f0f0c",
    ambientLightColor: 0xffecd1,
    ambientLightIntensity: 1.3,
    hemiSkyColor: 0xffedd5,
    hemiGroundColor: 0x2e1814,
    hemiIntensity: 0.7,
    keyLightColor: 0xffaa44,
    keyLightIntensity: 3.4,
    keyLightPos: [7, 8, -5],
    fillLightColor: 0xd97706,
    fillLightIntensity: 1.6,
    rimLightColor: 0xfbbf24,
    rimLightIntensity: 2.2,
    gridPrimaryColor: 0xf59e0b,
    gridSecondaryColor: 0x78350f,
    gridOpacity: 0.45,
    floorReflectivity: 0.2,
    toneMappingExposure: 1.3,
  },

  cyberpunk_neon: {
    id: "cyberpunk_neon",
    name: "Cyberpunk Neon",
    tagline: "Electric violet & cyan laser hologram darkroom with high vibrance",
    category: "creative",
    topColor: "#1a0f2e",
    horizonColor: "#110820",
    floorColor: "#0a0414",
    ambientLightColor: 0x2e1065,
    ambientLightIntensity: 1.5,
    hemiSkyColor: 0x00f0ff,
    hemiGroundColor: 0x1a0f2e,
    hemiIntensity: 0.8,
    keyLightColor: 0x00f0ff,
    keyLightIntensity: 3.8,
    keyLightPos: [6, 9, -6],
    fillLightColor: 0xff007f,
    fillLightIntensity: 2.6,
    rimLightColor: 0xf59e0b,
    rimLightIntensity: 2.4,
    gridPrimaryColor: 0x00f0ff,
    gridSecondaryColor: 0xf59e0b,
    gridOpacity: 0.5,
    floorReflectivity: 0.24,
    toneMappingExposure: 1.4,
  },

  blueprint_navy: {
    id: "blueprint_navy",
    name: "Blueprint CAD",
    tagline: "Aeronautical engineering drafting navy with crisp CAD grids",
    category: "slate",
    topColor: "#172554",
    horizonColor: "#1e3a8a",
    floorColor: "#0f172a",
    ambientLightColor: 0x93c5fd,
    ambientLightIntensity: 1.4,
    hemiSkyColor: 0xfbbf24,
    hemiGroundColor: 0x172554,
    hemiIntensity: 0.7,
    keyLightColor: 0xf0f9ff,
    keyLightIntensity: 3.2,
    keyLightPos: [6, 10, -6],
    fillLightColor: 0xd97706,
    fillLightIntensity: 1.6,
    rimLightColor: 0xfbbf24,
    rimLightIntensity: 1.4,
    gridPrimaryColor: 0xf59e0b,
    gridSecondaryColor: 0x92400e,
    gridOpacity: 0.55,
    floorReflectivity: 0.15,
    toneMappingExposure: 1.3,
  },

  obsidian_stealth: {
    id: "obsidian_stealth",
    name: "Obsidian Stealth",
    tagline: "Carbon fiber darkroom with precision overhead softbox highlight strip",
    category: "dark",
    topColor: "#18181b",
    horizonColor: "#111113",
    floorColor: "#09090b",
    ambientLightColor: 0xa1a1aa,
    ambientLightIntensity: 0.9,
    hemiSkyColor: 0xe4e4e7,
    hemiGroundColor: 0x18181b,
    hemiIntensity: 0.5,
    keyLightColor: 0xffffff,
    keyLightIntensity: 3.2,
    keyLightPos: [6, 9, -6],
    fillLightColor: 0xfbbf24,
    fillLightIntensity: 1.2,
    rimLightColor: 0xe4e4e7,
    rimLightIntensity: 1.8,
    gridPrimaryColor: 0x71717a,
    gridSecondaryColor: 0x27272a,
    gridOpacity: 0.35,
    floorReflectivity: 0.12,
    toneMappingExposure: 1.35,
  },
};

export class AutomotiveStudioEnvironmentManager {
  /**
   * Generates a high-quality smooth radial + linear gradient background CanvasTexture.
   */
  public static createGradientBackgroundTexture(
    topColor: string,
    horizonColor: string,
    floorColor: string,
    hasSoftboxHighlight = true
  ): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // 1. Base Vertical Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, topColor);
      grad.addColorStop(0.55, horizonColor);
      grad.addColorStop(1, floorColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Horizon Radial Bloom (Atmospheric Studio Glow)
      const horizonBloom = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.58,
        10,
        canvas.width * 0.5,
        canvas.height * 0.58,
        canvas.width * 0.55
      );
      horizonBloom.addColorStop(0, "rgba(255, 255, 255, 0.12)");
      horizonBloom.addColorStop(0.4, "rgba(255, 255, 255, 0.04)");
      horizonBloom.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = horizonBloom;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. Overhead Softbox Highlight Strip (simulates automotive studio ceiling bank)
      if (hasSoftboxHighlight) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.fillRect(canvas.width * 0.2, 12, canvas.width * 0.6, 28);

        ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
        ctx.fillRect(canvas.width * 0.1, 44, canvas.width * 0.8, 16);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Generates a circular studio floor disc with radial falloff to eliminate hard horizon cutoffs.
   */
  public static createStudioFloorDisc(
    radius = 18,
    floorColor: number = 0x1e293b,
    reflectivity = 0.18
  ): THREE.Mesh {
    const geo = new THREE.CircleGeometry(radius, 64);

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      grad.addColorStop(0.7, "rgba(255, 255, 255, 0.85)");
      grad.addColorStop(0.92, "rgba(255, 255, 255, 0.3)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
    }

    const alphaMap = new THREE.CanvasTexture(canvas);
    alphaMap.needsUpdate = true;

    const mat = new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 0.4,
      metalness: 0.2,
      alphaMap,
      transparent: true,
      opacity: Math.min(1.0, reflectivity * 4.5 + 0.3),
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.015;
    mesh.receiveShadow = true;
    mesh.name = "Studio_Floor_Disc";
    return mesh;
  }

  /**
   * Generates an articulated contact shadow plane under the vehicle chassis.
   */
  public static createContactShadowPlane(
    width = 3.2,
    length = 6.0,
    opacity = 0.65
  ): THREE.Mesh {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, 512, 512);

      // Central ambient shadow under chassis
      const centerGrad = ctx.createRadialGradient(256, 256, 10, 256, 256, 240);
      centerGrad.addColorStop(0, "rgba(0, 0, 0, 0.95)");
      centerGrad.addColorStop(0.35, "rgba(0, 0, 0, 0.75)");
      centerGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.3)");
      centerGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, 512, 512);

      // Four corner tire contact patches
      const drawTirePatch = (x: number, y: number) => {
        const patch = ctx.createRadialGradient(x, y, 0, x, y, 42);
        patch.addColorStop(0, "rgba(0, 0, 0, 0.95)");
        patch.addColorStop(0.4, "rgba(0, 0, 0, 0.7)");
        patch.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = patch;
        ctx.beginPath();
        ctx.ellipse(x, y, 26, 16, 0, 0, Math.PI * 2);
        ctx.fill();
      };

      drawTirePatch(145, 140); // FL
      drawTirePatch(367, 140); // FR
      drawTirePatch(140, 372); // RL
      drawTirePatch(372, 372); // RR
    }

    const shadowTex = new THREE.CanvasTexture(canvas);
    shadowTex.needsUpdate = true;

    const geo = new THREE.PlaneGeometry(width, length);
    const mat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, 0.001, 0);
    mesh.name = "Vehicle_Contact_Shadow";
    return mesh;
  }
}
