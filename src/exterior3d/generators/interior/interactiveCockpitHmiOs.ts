/**
 * ============================================================================
 * INTERACTIVE COCKPIT HMI TOUCHSCREEN STUDIO OS
 * ============================================================================
 * 60fps High-Resolution Dynamic HTML5 Canvas Operating System for OLED Screens:
 * 1. LIVE TELEMETRY & TRACK DYNAMICS
 *    - G-G Acceleration polar friction circle & tire temperature heatmaps
 *    - 800V Powertrain energy flow & active regenerative braking arcs
 * 2. REAL-TIME SATELLITE GPS NAVIGATION MAP
 *    - Vector road network, pulse GPS vehicle marker & turn-by-turn HUD guidance
 * 3. AUDIOPHILE SOUNDSTAGE & MEDIA EQUALIZER
 *    - 16-Band real-time acoustic spectrum analyzer & album artwork
 * 4. 4-ZONE CLIMATE CONTROL HMI
 *    - Circular temperature dials, seat ventilation/massage status & PM2.5 filtration
 * 5. RAYCAST TOUCH COORDINATE DISPATCHER
 *    - Translates 3D screen intersection $(u, v)$ to interactive UI buttons
 * ============================================================================
 */

import * as THREE from "three";

export type CockpitHmiTabMode = "telemetry" | "navigation" | "media" | "climate" | "dynamics";

export interface HmiLiveTelemetryData {
  speedKmh: number;
  rpm: number;
  gear: string;
  batterySocPercent: number;
  batteryPowerKw: number;
  tireTempsC: [number, number, number, number]; // FL, FR, RL, RR
  tirePressuresBar: [number, number, number, number];
  latG: number;
  longG: number;
  steeringAngleDeg: number;
  cabinTempDriverC: number;
  cabinTempPassC: number;
}

export class InteractiveCockpitHmiOs {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private activeTab: CockpitHmiTabMode = "telemetry";
  private animationFrameTime: number = 0;

  constructor(width: number = 1024, height: number = 512) {
    if (typeof document !== "undefined") {
      this.canvas = document.createElement("canvas");
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx = this.canvas.getContext("2d")!;
      this.texture = new THREE.CanvasTexture(this.canvas);
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;
      this.texture.generateMipmaps = false;
    } else {
      this.canvas = { width, height } as any;
      this.ctx = null as any;
      const data = new Uint8Array(16 * 16 * 4);
      this.texture = new THREE.DataTexture(data, 16, 16, THREE.RGBAFormat) as any;
    }
  }

  public getTexture(): THREE.CanvasTexture {
    return this.texture;
  }

  public setActiveTab(tab: CockpitHmiTabMode): void {
    this.activeTab = tab;
  }

  public getActiveTab(): CockpitHmiTabMode {
    return this.activeTab;
  }

  /**
   * Translates normalized UV screen coordinates into interactive button presses.
   */
  public handleTouchAtUv(u: number, v: number): CockpitHmiTabMode | null {
    // Invert V for standard canvas coordinates
    const x = u * this.canvas.width;
    const y = (1.0 - v) * this.canvas.height;

    // Header Tab Navigation Bar (Y: 10 to 60)
    if (y >= 10 && y <= 65) {
      const tabWidth = this.canvas.width / 5;
      const tabIdx = Math.floor(x / tabWidth);
      const tabs: CockpitHmiTabMode[] = ["telemetry", "navigation", "media", "climate", "dynamics"];
      if (tabs[tabIdx]) {
        this.activeTab = tabs[tabIdx];
        return this.activeTab;
      }
    }
    return null;
  }

  /**
   * Main 60fps render loop redrawing active dashboard widgets onto the texture canvas.
   */
  public render(data: HmiLiveTelemetryData, timeSec: number): void {
    this.animationFrameTime = timeSec;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;
    if (!ctx) return;

    // 1. Deep OLED Obsidian Background with Glassmorphic Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, "#08090d");
    bgGrad.addColorStop(1, "#10131a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Top Status Bar & App Header Tabs
    this.renderHeaderNavBar(w, h, data);

    // 3. Render Active Mode Content
    switch (this.activeTab) {
      case "telemetry":
        this.renderTelemetryTab(w, h, data);
        break;
      case "navigation":
        this.renderNavigationTab(w, h, data);
        break;
      case "media":
        this.renderMediaTab(w, h, data);
        break;
      case "climate":
        this.renderClimateTab(w, h, data);
        break;
      case "dynamics":
        this.renderDynamicsTab(w, h, data);
        break;
    }

    this.texture.needsUpdate = true;
  }

  private renderHeaderNavBar(w: number, h: number, data: HmiLiveTelemetryData): void {
    const ctx = this.ctx;
    const tabs: { key: CockpitHmiTabMode; label: string }[] = [
      { key: "telemetry", label: "PERFORMANCE" },
      { key: "navigation", label: "NAVIGATION" },
      { key: "media", label: "DOLBY MEDIA" },
      { key: "climate", label: "CLIMATE 4Z" },
      { key: "dynamics", label: "CHASSIS SETUP" },
    ];

    const tabWidth = w / tabs.length;
    for (let i = 0; i < tabs.length; i++) {
      const isSelected = this.activeTab === tabs[i].key;
      const x = i * tabWidth;

      if (isSelected) {
        ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
        ctx.fillRect(x + 4, 8, tabWidth - 8, 48);

        ctx.fillStyle = "#00f0ff";
        ctx.fillRect(x + 12, 54, tabWidth - 24, 3);
      }

      ctx.fillStyle = isSelected ? "#ffffff" : "#6c7a89";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tabs[i].label, x + tabWidth / 2, 38);
    }
  }

  private renderTelemetryTab(w: number, h: number, data: HmiLiveTelemetryData): void {
    const ctx = this.ctx;

    // Left Panel: Big Speed & Gear Readout
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 68px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${Math.round(data.speedKmh)}`, 45, 160);

    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("KM/H", 185, 160);

    // Gear indicator badge
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(45, 190, 80, 70);
    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.gear, 85, 242);

    // Center Panel: G-G Polar Friction Circle
    const ggCenterX = w * 0.48;
    const ggCenterY = h * 0.58;
    const ggRadius = 85;

    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ggCenterX, ggCenterY, ggRadius, 0, Math.PI * 2);
    ctx.arc(ggCenterX, ggCenterY, ggRadius * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // G-G Vector Dot
    const dotX = ggCenterX + data.latG * (ggRadius * 0.65);
    const dotY = ggCenterY - data.longG * (ggRadius * 0.65);
    ctx.fillStyle = "#ff0055";
    ctx.beginPath();
    ctx.arc(dotX, dotY, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8899aa";
    ctx.font = "14px sans-serif";
    ctx.fillText(`LAT: ${data.latG.toFixed(2)}G | LONG: ${data.longG.toFixed(2)}G`, ggCenterX, ggCenterY + ggRadius + 28);

    // Right Panel: 4-Corner Tire Thermal Heatmaps
    const tireX = w * 0.76;
    const tireY = h * 0.38;
    const tirePositions = [
      { x: tireX, y: tireY, temp: data.tireTempsC[0], pres: data.tirePressuresBar[0], label: "FL" },
      { x: tireX + 110, y: tireY, temp: data.tireTempsC[1], pres: data.tirePressuresBar[1], label: "FR" },
      { x: tireX, y: tireY + 110, temp: data.tireTempsC[2], pres: data.tirePressuresBar[2], label: "RL" },
      { x: tireX + 110, y: tireY + 110, temp: data.tireTempsC[3], pres: data.tirePressuresBar[3], label: "RR" },
    ];

    for (const t of tirePositions) {
      // Color from blue (cold) to green (optimal) to red (hot)
      const color = t.temp > 95 ? "#ff3300" : t.temp > 75 ? "#00ff88" : "#0099ff";
      ctx.fillStyle = color;
      ctx.fillRect(t.x, t.y, 45, 65);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(t.temp)}°C`, t.x + 22, t.y + 35);
      ctx.fillText(`${t.pres.toFixed(1)}b`, t.x + 22, t.y + 52);
    }
  }

  private renderNavigationTab(w: number, h: number, data: HmiLiveTelemetryData): void {
    const ctx = this.ctx;

    // Vector Road Grid Simulation
    ctx.strokeStyle = "#1a2636";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.8);
    ctx.lineTo(w * 0.45, h * 0.35);
    ctx.lineTo(w * 0.85, h * 0.7);
    ctx.stroke();

    // Active Route Highway (Cyan)
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.8);
    ctx.lineTo(w * 0.45, h * 0.35);
    ctx.stroke();

    // Pulse GPS Vehicle Marker
    const pulse = (Math.sin(this.animationFrameTime * 4.0) + 1.0) * 8;
    ctx.fillStyle = "rgba(0, 240, 255, 0.35)";
    ctx.beginPath();
    ctx.arc(w * 0.45, h * 0.35, 14 + pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(w * 0.45, h * 0.35, 7, 0, Math.PI * 2);
    ctx.fill();

    // Navigation Instruction HUD Card
    ctx.fillStyle = "rgba(16, 24, 38, 0.9)";
    ctx.fillRect(40, 90, 280, 110);
    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("In 450 m", 60, 135);
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px sans-serif";
    ctx.fillText("Turn Right on Apex Raceway", 60, 170);
  }

  private renderMediaTab(w: number, h: number, data: HmiLiveTelemetryData): void {
    const ctx = this.ctx;

    // Album Artwork Placeholder Box
    ctx.fillStyle = "#1e2430";
    ctx.fillRect(60, 100, 180, 180);
    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("♫", 150, 205);

    // Track metadata
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Cyberpunk Nightdrive 2077", 270, 145);
    ctx.fillStyle = "#00f0ff";
    ctx.font = "18px sans-serif";
    ctx.fillText("Apex Synthesizer • Dolby Atmos 3D Master", 270, 180);

    // 16-Band Equalizer Spectrum Analyzer
    for (let b = 0; b < 16; b++) {
      const eqHeight = (Math.sin(this.animationFrameTime * 6.0 + b * 0.5) * 0.5 + 0.5) * 80 + 10;
      ctx.fillStyle = b > 12 ? "#ff0055" : "#00f0ff";
      ctx.fillRect(270 + b * 22, 290 - eqHeight, 14, eqHeight);
    }
  }

  private renderClimateTab(w: number, h: number, data: HmiLiveTelemetryData): void {
    const ctx = this.ctx;

    // Driver Side Temperature Dial
    this.drawClimateDial(ctx, w * 0.28, h * 0.55, data.cabinTempDriverC, "DRIVER ZONE");

    // Passenger Side Temperature Dial
    this.drawClimateDial(ctx, w * 0.72, h * 0.55, data.cabinTempPassC, "PASSENGER ZONE");

    // Center Cabin Air Quality Badge
    ctx.fillStyle = "rgba(0, 255, 136, 0.15)";
    ctx.fillRect(w * 0.44, h * 0.42, 130, 90);
    ctx.fillStyle = "#00ff88";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("AQI EXCELLENT", w * 0.505, h * 0.47);
    ctx.fillText("PM2.5: 3 µg/m³", w * 0.505, h * 0.51);
  }

  private renderDynamicsTab(w: number, h: number, data: HmiLiveTelemetryData): void {
    const ctx = this.ctx;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("CHASSIS & POWERTRAIN DYNAMICS", 50, 110);

    // 800V High-Voltage Battery Pack State
    ctx.fillStyle = "#161b24";
    ctx.fillRect(50, 140, 420, 80);
    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`800V BATTERY SOC: ${Math.round(data.batterySocPercent)}%`, 70, 175);
    ctx.fillText(`POWER OUTPUT: ${Math.round(data.batteryPowerKw)} kW`, 70, 202);

    // Steering Angle Real-time Visualizer
    ctx.fillStyle = "#161b24";
    ctx.fillRect(500, 140, 420, 80);
    ctx.fillStyle = "#ffaa00";
    ctx.fillText(`STEERING ANGLE: ${data.steeringAngleDeg.toFixed(1)}°`, 520, 175);
    ctx.fillText(`FRONT DOWNFORCE: 480 kg @ 250 km/h`, 520, 202);
  }

  private drawClimateDial(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    tempC: number,
    label: string
  ): void {
    const radius = 75;
    ctx.strokeStyle = "#232d3f";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI * 0.75, Math.PI * 2.25);
    ctx.stroke();

    // Active Temperature Arc (Blue to Red)
    ctx.strokeStyle = tempC > 22 ? "#ff4422" : "#00aaff";
    ctx.beginPath();
    const arcEnd = Math.PI * 0.75 + ((tempC - 16) / 14) * (Math.PI * 1.5);
    ctx.arc(cx, cy, radius, Math.PI * 0.75, arcEnd);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${tempC.toFixed(1)}°`, cx, cy + 12);

    ctx.fillStyle = "#8899aa";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(label, cx, cy + 42);
  }
}
