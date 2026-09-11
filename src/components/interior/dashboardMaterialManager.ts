/**
 * ============================================================================
 * DASHBOARD MATERIAL MANAGER (Three.js WebGL Engine)
 * ============================================================================
 * Manages real-time PBR material modifications without reloading the GLB:
 * - Upper Dash Pad Nappa leather color & roughness
 * - Decorative trim spear (Walnut, Carbon, Titanium, Aluminum, Piano Black, etc.)
 * - Steering grip material (Leather, Alcantara, Perforated, Carbon, Wood)
 * - Multi-Zone Ambient LED emissive color & intensity
 * - Windshield glass tint & transmission
 * - French contrast stitching thread
 * ============================================================================
 */

import * as THREE from "three";
import { DashboardAssetManager } from "./dashboardAssetManager";
import {
  DashboardTrimType,
  SeatStyle,
  SeatBeltColor,
  SteeringGripMaterial,
  SteeringStripeStyle,
  StitchingColor,
  WindshieldTint,
} from "../../state/interiorDashboardConfigStore";

export class DashboardMaterialManager {
  private assetManager: DashboardAssetManager;
  private textureLoader: THREE.TextureLoader;
  private woodTexture: THREE.Texture | null = null;
  private carbonTexture: THREE.Texture | null = null;
  private perfTexture: THREE.Texture | null = null;

  constructor(assetManager: DashboardAssetManager) {
    this.assetManager = assetManager;
    this.textureLoader = new THREE.TextureLoader();
    this.loadCommonTextures();
  }

  private loadCommonTextures() {
    this.woodTexture = this.textureLoader.load("/models/interior/textures/wood_walnut_grain.png");
    this.woodTexture.colorSpace = THREE.SRGBColorSpace;
    this.carbonTexture = this.textureLoader.load("/models/interior/textures/carbon_twill_weave.png");
    this.carbonTexture.colorSpace = THREE.SRGBColorSpace;
    this.carbonTexture.wrapS = THREE.RepeatWrapping;
    this.carbonTexture.wrapT = THREE.RepeatWrapping;
    this.carbonTexture.repeat.set(4, 4);
    this.perfTexture = this.textureLoader.load("/models/interior/textures/leather_perforated_pattern.png");
    this.perfTexture.colorSpace = THREE.SRGBColorSpace;
    this.perfTexture.wrapS = THREE.RepeatWrapping;
    this.perfTexture.wrapT = THREE.RepeatWrapping;
    this.perfTexture.repeat.set(6, 6);
  }

  // 1. Upper Dash Pad Color
  public updateUpperDashPadColor(hexColor: string) {
    const padNodes = [
      this.assetManager.getNode<THREE.Mesh>("DASH_UPPER_PAD"),
      this.assetManager.getNode<THREE.Mesh>("DASH_UPPER_COWL_BINNACLE"),
      this.assetManager.getNode<THREE.Mesh>("DASH_UPPER_PASS_SWEEP"),
    ];

    const threeColor = new THREE.Color(hexColor);
    padNodes.forEach((node) => {
      if (node && node.material) {
        const mat = node.material as THREE.MeshStandardMaterial;
        mat.color.copy(threeColor);
        mat.roughness = 0.48;
        mat.metalness = 0.02;
        mat.needsUpdate = true;
      }
    });
  }

  // 2. Decorative Dashboard Trim Spear
  public updateDashboardTrim(trimType: DashboardTrimType) {
    const trimNodes = [
      this.assetManager.getNode<THREE.Mesh>("DASH_TRIM_SPEAR"),
      this.assetManager.getNode<THREE.Mesh>("CONSOLE_TOP_PLATE"),
      this.assetManager.getNode<THREE.Mesh>("DOOR_TRIM_SPEAR_L"),
      this.assetManager.getNode<THREE.Mesh>("DOOR_TRIM_SPEAR_R"),
    ];

    trimNodes.forEach((node) => {
      if (!node || !node.material) return;
      const mat = node.material as THREE.MeshStandardMaterial;

      switch (trimType) {
        case "walnut":
          mat.map = this.woodTexture;
          mat.color.setHex(0xffffff);
          mat.metalness = 0.04;
          mat.roughness = 0.18;
          break;
        case "dark_walnut":
          mat.map = this.woodTexture;
          mat.color.setHex(0x5c4033);
          mat.metalness = 0.04;
          mat.roughness = 0.22;
          break;
        case "carbon":
          mat.map = this.carbonTexture;
          mat.color.setHex(0xffffff);
          mat.metalness = 0.85;
          mat.roughness = 0.12;
          break;
        case "forged_carbon":
          mat.map = this.carbonTexture;
          mat.color.setHex(0x333338);
          mat.metalness = 0.70;
          mat.roughness = 0.25;
          break;
        case "titanium":
          mat.map = null;
          mat.color.setHex(0x8a929a);
          mat.metalness = 0.92;
          mat.roughness = 0.26;
          break;
        case "aluminum":
          mat.map = null;
          mat.color.setHex(0xd8dbe2);
          mat.metalness = 0.96;
          mat.roughness = 0.18;
          break;
        case "piano_black":
          mat.map = null;
          mat.color.setHex(0x060608);
          mat.metalness = 0.05;
          mat.roughness = 0.02;
          break;
        case "bronze":
          mat.map = null;
          mat.color.setHex(0xcd7f32);
          mat.metalness = 0.88;
          mat.roughness = 0.24;
          break;
        case "copper":
          mat.map = null;
          mat.color.setHex(0xb87333);
          mat.metalness = 0.90;
          mat.roughness = 0.20;
          break;
        case "ceramic":
          mat.map = null;
          mat.color.setHex(0xf0f2f5);
          mat.metalness = 0.10;
          mat.roughness = 0.06;
          break;
        default:
          mat.map = this.woodTexture;
          mat.color.setHex(0xffffff);
          break;
      }
      mat.needsUpdate = true;
    });
  }

  // 3. Steering Wheel Grip Material
  public updateSteeringGripMaterial(gripMat: SteeringGripMaterial, gripColor: string) {
    const wheelRimNodeNames = [
      "STEERING_SPORT_3SPOKE",
      "STEER_GT_RIM_SCULPT",
      "STEERING_YOKE_GRIP_L",
      "STEERING_YOKE_GRIP_R",
      "STEER_LUX_RIM",
      "STEER_PERF_RIM",
      "STEER_CLASSIC_RIM",
      "STEERING_FORMULA",
    ];

    const baseColor = new THREE.Color(gripColor);

    wheelRimNodeNames.forEach((name) => {
      const node = this.assetManager.getNode<THREE.Mesh>(name);
      if (!node || !node.material) return;
      const mat = node.material as THREE.MeshStandardMaterial;

      mat.color.copy(baseColor);

      switch (gripMat) {
        case "alcantara":
        case "suede":
          mat.map = null;
          mat.roughness = 0.88;
          mat.metalness = 0.02;
          break;
        case "perforated":
          mat.map = this.perfTexture;
          mat.roughness = 0.44;
          mat.metalness = 0.02;
          break;
        case "carbon":
          mat.map = this.carbonTexture;
          mat.roughness = 0.15;
          mat.metalness = 0.82;
          break;
        case "wood":
          mat.map = this.woodTexture;
          mat.roughness = 0.20;
          mat.metalness = 0.04;
          break;
        case "leather":
        default:
          mat.map = null;
          mat.roughness = 0.44;
          mat.metalness = 0.02;
          break;
      }
      mat.needsUpdate = true;
    });
  }

  // 4. Steering 12 O'Clock Stripe
  public updateSteeringStripe(stripeStyle: SteeringStripeStyle) {
    const stripe = this.assetManager.getNode<THREE.Mesh>("STEERING_TOP_STRIPE");
    if (!stripe || !stripe.material) return;

    if (stripeStyle === "none") {
      stripe.visible = false;
      return;
    }

    stripe.visible = true;
    const mat = stripe.material as THREE.MeshStandardMaterial;
    switch (stripeStyle) {
      case "red": mat.color.setHex(0xef4444); break;
      case "yellow": mat.color.setHex(0xeab308); break;
      case "blue": mat.color.setHex(0x3b82f6); break;
      case "white": mat.color.setHex(0xffffff); break;
      case "green": mat.color.setHex(0x22c55e); break;
    }
    mat.needsUpdate = true;
  }

  // 5. Multi-Zone Ambient Neon Lightguide
  public updateAmbientLighting(hexColor: string, nightMode: boolean) {
    const ambientNodes = [
      this.assetManager.getNode<THREE.Mesh>("AMBIENT_LIGHT_DASH"),
      this.assetManager.getNode<THREE.Mesh>("AMBIENT_LIGHT_CONSOLE"),
      this.assetManager.getNode<THREE.Mesh>("AMBIENT_LIGHT_FOOTWELL_L"),
      this.assetManager.getNode<THREE.Mesh>("AMBIENT_LIGHT_FOOTWELL_R"),
      this.assetManager.getNode<THREE.Mesh>("DOOR_AMBIENT_L"),
      this.assetManager.getNode<THREE.Mesh>("DOOR_AMBIENT_R"),
      this.assetManager.getNode<THREE.Mesh>("DASH_START_HALO"),
    ];

    const threeColor = new THREE.Color(hexColor);
    const intensity = nightMode ? 24.0 : 8.0;

    ambientNodes.forEach((node) => {
      if (node && node.material) {
        const mat = node.material as THREE.MeshStandardMaterial;
        mat.color.copy(threeColor);
        mat.emissive.copy(threeColor);
        mat.emissiveIntensity = intensity;
        mat.needsUpdate = true;
      }
    });
  }

  // 6. French Stitching Color
  public updateStitching(stitchingColor: StitchingColor) {
    const stitchNodes = [
      this.assetManager.getNode<THREE.Mesh>("DASH_COWL_STITCH_L"),
      this.assetManager.getNode<THREE.Mesh>("DASH_COWL_STITCH_PASS"),
      this.assetManager.getNode<THREE.Mesh>("CONSOLE_BOLSTER_STITCH_L"),
      this.assetManager.getNode<THREE.Mesh>("CONSOLE_BOLSTER_STITCH_R"),
      this.assetManager.getNode<THREE.Mesh>("CONSOLE_ARMREST_STITCH_L"),
      this.assetManager.getNode<THREE.Mesh>("CONSOLE_ARMREST_STITCH_R"),
    ];

    if (stitchingColor === "none") {
      stitchNodes.forEach((n) => n && (n.visible = false));
      return;
    }

    const col = new THREE.Color();
    switch (stitchingColor) {
      case "gold": col.setHex(0xd97706); break;
      case "red": col.setHex(0xef4444); break;
      case "blue": col.setHex(0x3b82f6); break;
      case "yellow": col.setHex(0xfacc15); break;
      case "white": col.setHex(0xffffff); break;
      case "silver": col.setHex(0x94a3b8); break;
    }

    stitchNodes.forEach((node) => {
      if (node && node.material) {
        node.visible = true;
        const mat = node.material as THREE.MeshStandardMaterial;
        mat.color.copy(col);
        mat.needsUpdate = true;
      }
    });
  }

  // 7. Windshield Tint
  public updateWindshieldTint(tint: WindshieldTint) {
    const windshield = this.assetManager.getNode<THREE.Mesh>("CABIN_WINDSHIELD_AND_MIRROR");
    if (!windshield || !windshield.material) return;
    const mat = windshield.material as THREE.MeshStandardMaterial;

    switch (tint) {
      case "light_tint":
        mat.color.setHex(0x8a929a);
        mat.opacity = 0.22;
        break;
      case "medium_smoke":
        mat.color.setHex(0x333338);
        mat.opacity = 0.38;
        break;
      case "dark_smoke":
        mat.color.setHex(0x18181c);
        mat.opacity = 0.55;
        break;
      case "blue_tint":
        mat.color.setHex(0x38bdf8);
        mat.opacity = 0.25;
        break;
      case "green_tint":
        mat.color.setHex(0x34d399);
        mat.opacity = 0.25;
        break;
      case "iridescent":
        mat.color.setHex(0xa855f7);
        mat.opacity = 0.32;
        break;
      case "clear":
      default:
        mat.color.setHex(0xf0f8ff);
        mat.opacity = 0.15;
        break;
    }
    mat.transparent = true;
    mat.needsUpdate = true;
  }

  // 8. Seat Upholstery & Leather Color Propagation across Front, Row 2 & Row 3
  public updateSeatUpholstery(leatherColor: string, seatStyle?: SeatStyle) {
    const seatNodes = [
      this.assetManager.getNode<THREE.Mesh>("CABIN_SEATS"),
      this.assetManager.getNode<THREE.Mesh>("SEAT_FRONT_L"),
      this.assetManager.getNode<THREE.Mesh>("SEAT_FRONT_R"),
      this.assetManager.getNode<THREE.Mesh>("SEAT_ROW2_L"),
      this.assetManager.getNode<THREE.Mesh>("SEAT_ROW2_R"),
      this.assetManager.getNode<THREE.Mesh>("SEAT_ROW2_C"),
      this.assetManager.getNode<THREE.Mesh>("SEAT_ROW2_ARMREST_CONSOLE"),
      this.assetManager.getNode<THREE.Mesh>("SEAT_ROW2_CAPTAIN_CONSOLE"),
      this.assetManager.getNode<THREE.Mesh>("SEAT_ROW3_L"),
      this.assetManager.getNode<THREE.Mesh>("SEAT_ROW3_R"),
      this.assetManager.getNode<THREE.Mesh>("SEAT_ROW3_C"),
      this.assetManager.getNode<THREE.Mesh>("ROW3_ARMREST_L"),
      this.assetManager.getNode<THREE.Mesh>("ROW3_ARMREST_R"),
    ];

    const threeColor = new THREE.Color(leatherColor);
    const roughness = seatStyle === "bucket" || seatStyle === "racing" ? 0.65 : 0.44;

    seatNodes.forEach((node) => {
      if (!node) return;
      node.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.color.copy(threeColor);
            mat.roughness = roughness;
            mat.metalness = 0.05;
            mat.needsUpdate = true;
          }
        }
      });
    });
  }

  // 9. Multi-Row Seatbelt Webbing Color
  public updateSeatBelts(beltColor: SeatBeltColor) {
    const beltNodes = [
      this.assetManager.getNode<THREE.Mesh>("SEATBELT_ROW1_L"),
      this.assetManager.getNode<THREE.Mesh>("SEATBELT_ROW1_R"),
      this.assetManager.getNode<THREE.Mesh>("SEATBELT_ROW2_L"),
      this.assetManager.getNode<THREE.Mesh>("SEATBELT_ROW2_R"),
      this.assetManager.getNode<THREE.Mesh>("SEATBELT_ROW2_C"),
      this.assetManager.getNode<THREE.Mesh>("SEATBELT_ROW3_L"),
      this.assetManager.getNode<THREE.Mesh>("SEATBELT_ROW3_R"),
      this.assetManager.getNode<THREE.Mesh>("SEATBELT_ROW3_C"),
    ];

    const col = new THREE.Color();
    switch (beltColor) {
      case "red": col.setHex(0xdc2626); break;
      case "blue": col.setHex(0x2563eb); break;
      case "yellow": col.setHex(0xeab308); break;
      case "grey": col.setHex(0x64748b); break;
      case "black":
      default:
        col.setHex(0x18181b);
        break;
    }

    beltNodes.forEach((node) => {
      if (!node) return;
      node.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.color.copy(col);
            mat.needsUpdate = true;
          }
        }
      });
    });
  }
}
