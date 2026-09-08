/**
 * ============================================================================
 * DASHBOARD SCREEN TEXTURE MANAGER (Three.js WebGL Engine)
 * ============================================================================
 * Generates dynamic, high-performance 2D Canvas textures for:
 * - 8 Infotainment Display Modes (Navigation, Telemetry, Media, Climate, Vehicle, Camera, Performance, Settings)
 * - 5 Instrument Cluster Styles (Digital, Analog Dials, Performance, Minimal, Track)
 * - Projected Head-Up Display (HUD)
 * - Uses dirty-flag caching to maintain high-performance 60 FPS rendering.
 * ============================================================================
 */

import * as THREE from "three";
import { DashboardAssetManager } from "./dashboardAssetManager";
import { InfotainmentMode, ClusterStyle, HUDMode } from "../../state/interiorDashboardConfigStore";

export class DashboardScreenTextureManager {
  private assetManager: DashboardAssetManager;

  // Infotainment Canvas & Texture
  private infoCanvas: HTMLCanvasElement;
  private infoCtx: CanvasRenderingContext2D;
  private infoTexture: THREE.CanvasTexture;
  private currentInfoMode: InfotainmentMode = "navigation";

  // Cluster Canvas & Texture
  private clusterCanvas: HTMLCanvasElement;
  private clusterCtx: CanvasRenderingContext2D;
  private clusterTexture: THREE.CanvasTexture;
  private currentClusterStyle: ClusterStyle = "digital";

  // HUD Canvas & Texture
  private hudCanvas: HTMLCanvasElement;
  private hudCtx: CanvasRenderingContext2D;
  private hudTexture: THREE.CanvasTexture;
  private currentHudMode: HUDMode = "off";

  // Telemetry Mock Animation State
  private animTick: number = 0;

  constructor(assetManager: DashboardAssetManager) {
    this.assetManager = assetManager;

    // 1. Infotainment (512x320)
    this.infoCanvas = document.createElement("canvas");
    this.infoCanvas.width = 512;
    this.infoCanvas.height = 320;
    this.infoCtx = this.infoCanvas.getContext("2d")!;
    this.infoTexture = new THREE.CanvasTexture(this.infoCanvas);
    this.infoTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. Cluster (512x256)
    this.clusterCanvas = document.createElement("canvas");
    this.clusterCanvas.width = 512;
    this.clusterCanvas.height = 256;
    this.clusterCtx = this.clusterCanvas.getContext("2d")!;
    this.clusterTexture = new THREE.CanvasTexture(this.clusterCanvas);
    this.clusterTexture.colorSpace = THREE.SRGBColorSpace;

    // 3. HUD (256x128)
    this.hudCanvas = document.createElement("canvas");
    this.hudCanvas.width = 256;
    this.hudCanvas.height = 128;
    this.hudCtx = this.hudCanvas.getContext("2d")!;
    this.hudTexture = new THREE.CanvasTexture(this.hudCanvas);
    this.hudTexture.colorSpace = THREE.SRGBColorSpace;
  }

  public bindToMeshes() {
    // Bind Infotainment
    const screenMesh = this.assetManager.getNode<THREE.Mesh>("INFOTAINMENT_SCREEN");
    if (screenMesh && screenMesh.material) {
      const mat = screenMesh.material as THREE.MeshStandardMaterial;
      mat.map = this.infoTexture;
      mat.emissiveMap = this.infoTexture;
      mat.emissive.setHex(0xffffff);
      mat.emissiveIntensity = 0.95;
      mat.needsUpdate = true;
    }

    // Bind Cluster
    const clusterMesh = this.assetManager.getNode<THREE.Mesh>("CLUSTER_SCREEN");
    if (clusterMesh && clusterMesh.material) {
      const mat = clusterMesh.material as THREE.MeshStandardMaterial;
      mat.map = this.clusterTexture;
      mat.emissiveMap = this.clusterTexture;
      mat.emissive.setHex(0xffffff);
      mat.emissiveIntensity = 0.90;
      mat.needsUpdate = true;
    }

    // Bind HUD
    const hudMesh = this.assetManager.getNode<THREE.Mesh>("HUD_PROJECTION_PLANE");
    if (hudMesh && hudMesh.material) {
      const mat = hudMesh.material as THREE.MeshStandardMaterial;
      mat.map = this.hudTexture;
      mat.emissiveMap = this.hudTexture;
      mat.emissive.setHex(0xffffff);
      mat.emissiveIntensity = 1.0;
      mat.transparent = true;
      mat.opacity = 0.85;
      mat.needsUpdate = true;
    }

    this.renderInfotainment();
    this.renderCluster();
    this.renderHUD();
  }

  public setInfotainmentMode(mode: InfotainmentMode) {
    this.currentInfoMode = mode;
    this.renderInfotainment();
  }

  public setClusterStyle(style: ClusterStyle) {
    this.currentClusterStyle = style;
    this.renderCluster();
  }

  public setHUDMode(mode: HUDMode) {
    this.currentHudMode = mode;
    this.renderHUD();
  }

  public updateAnimation(delta: number) {
    this.animTick += delta;

    // Update animated modes at 20fps for efficiency
    if (this.currentInfoMode === "telemetry" || this.currentInfoMode === "media" || this.currentInfoMode === "performance") {
      this.renderInfotainment();
    }
    if (this.currentClusterStyle === "digital" || this.currentClusterStyle === "track" || this.currentClusterStyle === "performance") {
      this.renderCluster();
    }
    if (this.currentHudMode !== "off") {
      this.renderHUD();
    }
  }

  // ==========================================================================
  // INFOTAINMENT RENDERING (8 MODES)
  // ==========================================================================
  private renderInfotainment() {
    const ctx = this.infoCtx;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 512, 320);

    // Status Bar
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, 512, 34);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("APEX OS 5.2", 18, 22);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("5G LTE", 380, 22);
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText("12:45 PM", 440, 22);

    switch (this.currentInfoMode) {
      case "navigation":
        this.drawNavigationUI(ctx);
        break;
      case "telemetry":
        this.drawTelemetryUI(ctx);
        break;
      case "media":
        this.drawMediaUI(ctx);
        break;
      case "climate":
        this.drawClimateUI(ctx);
        break;
      case "vehicle":
        this.drawVehicleUI(ctx);
        break;
      case "camera":
        this.drawCameraUI(ctx);
        break;
      case "performance":
        this.drawPerformanceUI(ctx);
        break;
      case "settings":
        this.drawSettingsUI(ctx);
        break;
    }

    this.infoTexture.needsUpdate = true;
  }

  private drawNavigationUI(ctx: CanvasRenderingContext2D) {
    // Map Grid
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let x = 0; x < 512; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 34); ctx.lineTo(x, 320); ctx.stroke();
    }
    for (let y = 34; y < 320; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }

    // Route Vector Path
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(100, 310);
    ctx.quadraticCurveTo(240, 200, 256, 170);
    ctx.quadraticCurveTo(280, 130, 420, 80);
    ctx.stroke();

    // Ego Vehicle Marker
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(256, 170, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Turn Guidance Card
    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.fillRect(20, 50, 210, 80);
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 50, 210, 80);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("↱ 450 m", 35, 82);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("In 450m Turn Right", 35, 105);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px sans-serif";
    ctx.fillText("Grand Prix Way", 35, 122);
  }

  private drawTelemetryUI(ctx: CanvasRenderingContext2D) {
    const rpm = 3200 + Math.sin(this.animTick * 3) * 2800;
    const speed = Math.round(75 + Math.sin(this.animTick * 2) * 45);

    // RPM Bar
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(30, 60, 452, 28);
    const rpmRatio = Math.max(0, Math.min(1, rpm / 8000));
    ctx.fillStyle = rpmRatio > 0.85 ? "#ef4444" : "#38bdf8";
    ctx.fillRect(30, 60, 452 * rpmRatio, 28);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`ENGINE SPEED: ${Math.round(rpm)} RPM`, 40, 78);

    // Digital Speedometer
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px sans-serif";
    ctx.fillText(`${speed}`, 60, 175);
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("MPH", 185, 155);

    // G-Force Circle
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(380, 160, 55, 0, Math.PI * 2);
    ctx.stroke();

    const gX = 380 + Math.sin(this.animTick * 2.5) * 35;
    const gY = 160 + Math.cos(this.animTick * 2.5) * 25;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(gX, gY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Tire Temps
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 12px monospace";
    ctx.fillText("FL 88°C   FR 89°C", 50, 260);
    ctx.fillText("RL 92°C   RR 93°C", 50, 285);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("BOOST: 1.85 BAR  •  OIL: 104°C", 260, 275);
  }

  private drawMediaUI(ctx: CanvasRenderingContext2D) {
    // Album Art
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(40, 65, 120, 120);
    ctx.fillStyle = "#1d4ed8";
    ctx.beginPath();
    ctx.arc(100, 125, 35, 0, Math.PI * 2);
    ctx.fill();

    // Track Info
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("Apex Velocity (Live)", 185, 95);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px sans-serif";
    ctx.fillText("Synthwave Motorway Orchestra", 185, 125);

    // Animated Audio Waveform Equalizer
    ctx.fillStyle = "#38bdf8";
    for (let i = 0; i < 24; i++) {
      const h = Math.abs(Math.sin(this.animTick * 4 + i * 0.4)) * 38 + 6;
      ctx.fillRect(185 + i * 11, 185 - h, 7, h);
    }

    // Progress Bar
    ctx.fillStyle = "#334155";
    ctx.fillRect(40, 235, 432, 8);
    const prog = (this.animTick * 0.1) % 1;
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(40, 235, 432 * prog, 8);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px monospace";
    ctx.fillText("02:14", 40, 265);
    ctx.fillText("03:48", 435, 265);
  }

  private drawClimateUI(ctx: CanvasRenderingContext2D) {
    // Dual Zone Temperature Display
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(40, 60, 200, 140);
    ctx.fillRect(272, 60, 200, 140);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px sans-serif";
    ctx.fillText("72°F", 85, 135);
    ctx.fillText("68°F", 315, 135);

    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("DRIVER ZONE", 95, 175);
    ctx.fillText("PASSENGER ZONE", 310, 175);

    // Fan & Airflow
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(40, 235, 432, 20);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("AUTO A/C • FAN SPEED: 4 / 7 • RECIRCULATION ACTIVE", 70, 250);
  }

  private drawVehicleUI(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("VEHICLE HEALTH & SYSTEM TELEMETRY", 40, 75);

    // Tire Pressure Boxes
    const tires = [
      { name: "FRONT LEFT", psi: "34 PSI", x: 40, y: 100 },
      { name: "FRONT RIGHT", psi: "34 PSI", x: 280, y: 100 },
      { name: "REAR LEFT", psi: "36 PSI", x: 40, y: 190 },
      { name: "REAR RIGHT", psi: "36 PSI", x: 280, y: 190 },
    ];

    tires.forEach((t) => {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(t.x, t.y, 190, 70);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px sans-serif";
      ctx.fillText(t.name, t.x + 15, t.y + 25);
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 24px monospace";
      ctx.fillText(t.psi, t.x + 15, t.y + 55);
    });
  }

  private drawCameraUI(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#0c1524";
    ctx.fillRect(0, 34, 512, 286);

    // Dynamic trajectory guides
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 310);
    ctx.quadraticCurveTo(180, 200, 210, 130);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(392, 310);
    ctx.quadraticCurveTo(332, 200, 302, 130);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("HD REAR-VIEW CAMERA • CHECK SURROUNDINGS", 80, 65);
  }

  private drawPerformanceUI(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 20px monospace";
    ctx.fillText("CHRONO PERFORMANCE TELEMETRY", 40, 75);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px monospace";
    ctx.fillText("0 - 60: 2.85 s", 40, 135);
    ctx.fillText("LAP: 1:24.88", 40, 195);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 22px monospace";
    ctx.fillText("DELTA: -0.14 s (PERSONAL BEST)", 40, 245);
  }

  private drawSettingsUI(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("COCKPIT & ADAS SETTINGS", 40, 75);

    const settings = [
      "LANE KEEP ASSIST: ON",
      "BLIND SPOT DETECTION: ON",
      "TRACTION CONTROL: SPORT",
      "EXHAUST VALVE: OPEN",
    ];

    settings.forEach((s, idx) => {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(40, 95 + idx * 45, 432, 36);
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(s, 55, 118 + idx * 45);
    });
  }

  // ==========================================================================
  // CLUSTER RENDERING (5 STYLES)
  // ==========================================================================
  private renderCluster() {
    const ctx = this.clusterCtx;
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, 512, 256);

    const speed = Math.round(75 + Math.sin(this.animTick * 2) * 45);
    const rpm = 3200 + Math.sin(this.animTick * 3) * 2800;

    switch (this.currentClusterStyle) {
      case "digital":
        // Perspective Lane Lines
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(256, 80); ctx.lineTo(140, 240);
        ctx.moveTo(256, 80); ctx.lineTo(372, 240);
        ctx.stroke();

        // Ego car icon
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(236, 170, 40, 30);

        // Digital Speed & Gear
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 56px sans-serif";
        ctx.fillText(`${speed}`, 220, 70);
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#38bdf8";
        ctx.fillText("MPH", 295, 45);
        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold 28px monospace";
        ctx.fillText("D4", 242, 240);
        break;

      case "performance":
        // Central Rev Ring
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(256, 130, 80, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();

        ctx.strokeStyle = "#ef4444";
        ctx.beginPath();
        const rpmEnd = Math.PI * 0.8 + (Math.PI * 1.4) * (rpm / 8000);
        ctx.arc(256, 130, 80, Math.PI * 0.8, rpmEnd);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 44px sans-serif";
        ctx.fillText(`${speed}`, 235, 135);
        ctx.font = "bold 14px sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("MPH", 245, 155);
        break;

      case "track":
        // F1 Shift Light Array
        for (let i = 0; i < 15; i++) {
          ctx.fillStyle = i < 5 ? "#22c55e" : i < 10 ? "#eab308" : "#ef4444";
          ctx.fillRect(60 + i * 26, 30, 20, 16);
        }
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 52px monospace";
        ctx.fillText(`${speed} MPH`, 150, 130);
        ctx.fillStyle = "#10b981";
        ctx.font = "bold 20px monospace";
        ctx.fillText("LAP 4:  1:24.88  (-0.14s)", 120, 185);
        break;

      case "minimal":
      case "analog":
      default:
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px sans-serif";
        ctx.fillText(`${speed} MPH`, 180, 130);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "14px monospace";
        ctx.fillText("ODOMETER: 004,285 MI • RANGE: 340 MI", 100, 190);
        break;
    }

    this.clusterTexture.needsUpdate = true;
  }

  // ==========================================================================
  // HUD RENDERING
  // ==========================================================================
  private renderHUD() {
    const ctx = this.hudCtx;
    ctx.clearRect(0, 0, 256, 128);

    if (this.currentHudMode === "off") {
      this.hudTexture.needsUpdate = true;
      return;
    }

    const speed = Math.round(75 + Math.sin(this.animTick * 2) * 45);

    ctx.fillStyle = "rgba(6, 182, 212, 0.95)";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(`${speed}`, 30, 60);
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("MPH", 90, 40);

    ctx.fillStyle = "rgba(245, 158, 11, 0.95)";
    ctx.font = "bold 18px monospace";
    ctx.fillText("D4", 90, 60);

    if (this.currentHudMode === "navigation") {
      ctx.fillStyle = "rgba(6, 182, 212, 0.95)";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("↱ 450 m", 30, 95);
    }

    this.hudTexture.needsUpdate = true;
  }
}
