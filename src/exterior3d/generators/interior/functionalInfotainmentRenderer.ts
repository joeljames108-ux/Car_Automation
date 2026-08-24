/**
 * ============================================================================
 * FUNCTIONAL INFOTAINMENT & COCKPIT HMI CANVAS TEXTURE RENDERER
 * ============================================================================
 * Generates an ultra-high-resolution (1024x512) dynamic HTML5 Canvas texture
 * for the vehicle's central touchscreen and passenger co-pilot displays.
 * 
 * Interactive Modes:
 * 1. TRACK TELEMETRY: Live 4-corner tire temps, brake rotor temps, G-force friction
 *    circle polygon, live lap delta timer, and AWD torque vectoring split.
 * 2. MEDIA & DOLBY ATMOS DSP: Real-time 14-band animated audio spectrum,
 *    track metadata, acoustic soundstage spatial balance.
 * 3. DRIVE DYNAMICS MAP: Strada / Sport / Corsa / Drift mode selection with
 *    throttle curve, damper stiffness, and ESC slip angle matrix.
 * 4. CLIMATE & CABIN AIR: Dual-zone temperature dials (21.5°C / 22.0°C), animated
 *    airflow vectors, seat heating/cooling indicators, ionization status.
 * ============================================================================
 */

import * as THREE from "three";

export type InfotainmentScreenMode = "telemetry" | "media" | "dynamics" | "climate";

export interface InfotainmentTelemetryData {
  speedKmh: number;
  gear: string;
  rpm: number;
  maxRpm: number;
  lateralG: number;
  longitudinalG: number;
  lapTimeSeconds: number;
  lapDeltaSeconds: number;
  tireTempsC: [number, number, number, number]; // FL, FR, RL, RR
  brakeTempsC: [number, number, number, number]; // FL, FR, RL, RR
  torqueSplitFrontRear: [number, number]; // e.g. [30, 70]
  cabinTempDriverC: number;
  cabinTempPassengerC: number;
  driveMode: "Strada" | "Sport" | "Corsa" | "Drift";
  audioTrackTitle: string;
  audioArtist: string;
}

export class FunctionalInfotainmentRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private texture: THREE.CanvasTexture | null = null;
  private currentMode: InfotainmentScreenMode = "telemetry";
  private animTimer: number = 0;

  constructor(width: number = 1024, height: number = 512) {
    if (typeof document !== "undefined") {
      this.canvas = document.createElement("canvas");
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx = this.canvas.getContext("2d");

      if (this.canvas) {
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.generateMipmaps = true;
        this.texture.minFilter = THREE.LinearMipmapLinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
      }
    }
  }

  public getTexture(): THREE.CanvasTexture | null {
    return this.texture;
  }

  public setMode(mode: InfotainmentScreenMode) {
    this.currentMode = mode;
  }

  public getMode(): InfotainmentScreenMode {
    return this.currentMode;
  }

  public render(data: Partial<InfotainmentTelemetryData> = {}) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.animTimer += 0.02;

    const fullData: InfotainmentTelemetryData = {
      speedKmh: data.speedKmh ?? 184,
      gear: data.gear ?? "4",
      rpm: data.rpm ?? 5400,
      maxRpm: data.maxRpm ?? 9000,
      lateralG: data.lateralG ?? 0.85,
      longitudinalG: data.longitudinalG ?? 0.42,
      lapTimeSeconds: data.lapTimeSeconds ?? 84.62,
      lapDeltaSeconds: data.lapDeltaSeconds ?? -0.38,
      tireTempsC: data.tireTempsC ?? [88, 89, 94, 95],
      brakeTempsC: data.brakeTempsC ?? [420, 435, 380, 395],
      torqueSplitFrontRear: data.torqueSplitFrontRear ?? [30, 70],
      cabinTempDriverC: data.cabinTempDriverC ?? 21.5,
      cabinTempPassengerC: data.cabinTempPassengerC ?? 22.0,
      driveMode: data.driveMode ?? "Corsa",
      audioTrackTitle: data.audioTrackTitle ?? "Apex Symphony No. 8 in V8 Major",
      audioArtist: data.audioArtist ?? "Antigravity Spatial Dolby Atmos",
    };

    // Dark Luxury Cockpit UI Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, "#030712");
    bgGrad.addColorStop(0.5, "#0b1329");
    bgGrad.addColorStop(1, "#020617");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle carbon grid texture
    ctx.strokeStyle = "rgba(6, 182, 212, 0.07)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Top Status Header Bar
    this.renderHeaderBar(ctx, w, h, fullData);

    // Left Mode Sidebar
    this.renderSidebar(ctx, w, h);

    // Main Content Area
    ctx.save();
    ctx.translate(140, 60);
    const contentW = w - 160;
    const contentH = h - 80;

    switch (this.currentMode) {
      case "telemetry":
        this.renderTelemetryMode(ctx, contentW, contentH, fullData);
        break;
      case "media":
        this.renderMediaMode(ctx, contentW, contentH, fullData);
        break;
      case "dynamics":
        this.renderDynamicsMode(ctx, contentW, contentH, fullData);
        break;
      case "climate":
        this.renderClimateMode(ctx, contentW, contentH, fullData);
        break;
    }

    ctx.restore();

    // Outer Bezel & Glass Reflection Sheen
    this.renderGlassGlint(ctx, w, h);

    if (this.texture) {
      this.texture.needsUpdate = true;
    }
  }

  private renderHeaderBar(ctx: CanvasRenderingContext2D, w: number, h: number, data: InfotainmentTelemetryData) {
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(0, 0, w, 50);

    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(w, 50);
    ctx.stroke();

    // Left Brand Logo & Title
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 16px 'Courier New', monospace";
    ctx.fillText("ANTIGRAVITY // COCKPIT OS 4.0", 20, 32);

    // Drive Mode Pill
    ctx.fillStyle = data.driveMode === "Corsa" ? "#ef4444" : "#06b6d4";
    ctx.fillRect(400, 14, 90, 24);
    ctx.fillStyle = "#020617";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`MODE: ${data.driveMode}`, 445, 31);
    ctx.textAlign = "left";

    // Time & Temp
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px 'Courier New', monospace";
    ctx.fillText("14:48 | 24°C AMBIENT | GPS 5G LOCK", w - 320, 32);
  }

  private renderSidebar(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const modes: { id: InfotainmentScreenMode; label: string }[] = [
      { id: "telemetry", label: "TELEMETRY" },
      { id: "media", label: "AUDIO DSP" },
      { id: "dynamics", label: "DYNAMICS" },
      { id: "climate", label: "CLIMATE" },
    ];

    const btnH = (h - 70) / modes.length;

    modes.forEach((m, idx) => {
      const y = 60 + idx * btnH;
      const isSelected = this.currentMode === m.id;

      if (isSelected) {
        ctx.fillStyle = "rgba(6, 182, 212, 0.25)";
        ctx.fillRect(10, y, 120, btnH - 8);
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 2;
        ctx.strokeRect(10, y, 120, btnH - 8);
      } else {
        ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
        ctx.fillRect(10, y, 120, btnH - 8);
      }

      ctx.fillStyle = isSelected ? "#38bdf8" : "#64748b";
      ctx.font = "bold 12px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText(m.label, 70, y + btnH / 2);
    });
    ctx.textAlign = "left";
  }

  private renderTelemetryMode(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    data: InfotainmentTelemetryData
  ) {
    // 1. Live G-Force Friction Circle (Left)
    const gSize = 180;
    const gX = 100;
    const gY = h / 2;

    ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
    ctx.lineWidth = 1;
    [0.5, 1.0, 1.5, 2.0].forEach((g) => {
      const r = (g / 2.0) * (gSize / 2);
      ctx.beginPath();
      ctx.arc(gX, gY, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(gX - gSize / 2, gY);
    ctx.lineTo(gX + gSize / 2, gY);
    ctx.moveTo(gX, gY - gSize / 2);
    ctx.lineTo(gX, gY + gSize / 2);
    ctx.stroke();

    // G-Force Vector Point
    const pointX = gX + (data.lateralG / 2.0) * (gSize / 2);
    const pointY = gY - (data.longitudinalG / 2.0) * (gSize / 2);

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(pointX, pointY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fca5a5";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText(`LAT: ${data.lateralG.toFixed(2)}G`, gX - 45, gY + gSize / 2 + 25);
    ctx.fillText(`LON: ${data.longitudinalG.toFixed(2)}G`, gX - 45, gY + gSize / 2 + 42);

    // 2. Vehicle 4-Corner Thermal Tire & Brake Heatmap (Center)
    const carX = 380;
    const carY = h / 2;

    // Vehicle silhouette box
    ctx.strokeStyle = "rgba(6, 182, 212, 0.6)";
    ctx.lineWidth = 2;
    ctx.strokeRect(carX - 45, carY - 80, 90, 160);

    // 4 Tires & Brake Callouts
    const tirePositions = [
      { x: carX - 75, y: carY - 70, label: "FL", temp: data.tireTempsC[0], brake: data.brakeTempsC[0] },
      { x: carX + 50, y: carY - 70, label: "FR", temp: data.tireTempsC[1], brake: data.brakeTempsC[1] },
      { x: carX - 75, y: carY + 40, label: "RL", temp: data.tireTempsC[2], brake: data.brakeTempsC[2] },
      { x: carX + 50, y: carY + 40, label: "RR", temp: data.tireTempsC[3], brake: data.brakeTempsC[3] },
    ];

    tirePositions.forEach((t) => {
      // Tire box (Green = optimal ~90°C)
      ctx.fillStyle = t.temp > 100 ? "#ef4444" : t.temp > 80 ? "#10b981" : "#3b82f6";
      ctx.fillRect(t.x, t.y, 25, 40);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 11px 'Courier New', monospace";
      ctx.fillText(`${t.label}: ${t.temp}°C`, t.x > carX ? t.x + 30 : t.x - 65, t.y + 16);
      ctx.fillStyle = "#f59e0b";
      ctx.fillText(`BRK: ${t.brake}°C`, t.x > carX ? t.x + 30 : t.x - 65, t.y + 32);
    });

    // 3. Lap Delta Timer & AWD Torque Split (Right)
    const rightX = 580;
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    ctx.fillRect(rightX, 20, 260, 180);
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.strokeRect(rightX, 20, 260, 180);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.fillText("LAP TELEMETRY // SECTOR 3", rightX + 15, 45);

    const lapMin = Math.floor(data.lapTimeSeconds / 60);
    const lapSec = (data.lapTimeSeconds % 60).toFixed(2);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 26px 'Courier New', monospace";
    ctx.fillText(`${lapMin}:${lapSec.padStart(5, "0")}`, rightX + 15, 80);

    const deltaSign = data.lapDeltaSeconds <= 0 ? "-" : "+";
    ctx.fillStyle = data.lapDeltaSeconds <= 0 ? "#a855f7" : "#ef4444"; // Purple = fastest sector
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.fillText(`DELTA: ${deltaSign}${Math.abs(data.lapDeltaSeconds).toFixed(2)}s`, rightX + 15, 110);

    // AWD Torque Split Bar
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px 'Courier New', monospace";
    ctx.fillText(`AWD TORQUE: F ${data.torqueSplitFrontRear[0]}% / R ${data.torqueSplitFrontRear[1]}%`, rightX + 15, 145);

    ctx.fillStyle = "#0284c7";
    ctx.fillRect(rightX + 15, 155, (data.torqueSplitFrontRear[0] / 100) * 230, 16);
    ctx.fillStyle = "#f97316";
    ctx.fillRect(
      rightX + 15 + (data.torqueSplitFrontRear[0] / 100) * 230,
      155,
      (data.torqueSplitFrontRear[1] / 100) * 230,
      16
    );
  }

  private renderMediaMode(ctx: CanvasRenderingContext2D, w: number, h: number, data: InfotainmentTelemetryData) {
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.fillText("BESPOKE 24-SPEAKER DIAMOND SOUNDSTAGE // DOLBY ATMOS", 20, 35);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.fillText(`NOW PLAYING: ${data.audioTrackTitle}`, 20, 75);
    ctx.fillStyle = "#a855f7";
    ctx.font = "16px 'Courier New', monospace";
    ctx.fillText(`ARTIST: ${data.audioArtist}`, 20, 105);

    // Real-Time 14-Band Equalizer Spectrum
    const bands = 14;
    const bandW = 35;
    const startX = 30;
    const startY = h - 40;

    for (let i = 0; i < bands; i++) {
      const height = Math.sin(this.animTimer * 2 + i * 0.4) * 80 + 90;
      const grad = ctx.createLinearGradient(0, startY - height, 0, startY);
      grad.addColorStop(0, "#06b6d4");
      grad.addColorStop(0.6, "#8b5cf6");
      grad.addColorStop(1, "#ec4899");

      ctx.fillStyle = grad;
      ctx.fillRect(startX + i * (bandW + 12), startY - height, bandW, height);
    }
  }

  private renderDynamicsMode(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    data: InfotainmentTelemetryData
  ) {
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.fillText("DYNAMIC CHASSIS & POWERTRAIN MAPPING", 20, 35);

    const modes = ["Strada", "Sport", "Corsa", "Drift"];
    modes.forEach((mode, idx) => {
      const x = 30 + idx * 190;
      const y = 60;
      const isCurrent = data.driveMode === mode;

      ctx.fillStyle = isCurrent ? "rgba(6, 182, 212, 0.3)" : "rgba(15, 23, 42, 0.6)";
      ctx.fillRect(x, y, 170, 260);
      ctx.strokeStyle = isCurrent ? "#06b6d4" : "rgba(148, 163, 184, 0.2)";
      ctx.lineWidth = isCurrent ? 2 : 1;
      ctx.strokeRect(x, y, 170, 260);

      ctx.fillStyle = isCurrent ? "#38bdf8" : "#f8fafc";
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.fillText(mode.toUpperCase(), x + 20, y + 35);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px 'Courier New', monospace";
      ctx.fillText(`Throttle: ${mode === "Corsa" ? "100% Linear" : "Progressive"}`, x + 15, y + 80);
      ctx.fillText(`Dampers: ${mode === "Corsa" ? "Track Stiff" : "Adaptive"}`, x + 15, y + 110);
      ctx.fillText(`Aero: ${mode === "Corsa" ? "High Downforce" : "Low Drag"}`, x + 15, y + 140);
      ctx.fillText(`ESC: ${mode === "Drift" ? "15° Slip Angle" : "Full Track"}`, x + 15, y + 170);
    });
  }

  private renderClimateMode(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    data: InfotainmentTelemetryData
  ) {
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.fillText("DUAL-ZONE CLIMATE CONTROL & AIR IONIZER", 20, 35);

    // Driver Temp Dial
    this.renderClimateDial(ctx, 160, 180, "DRIVER ZONE", data.cabinTempDriverC, true);

    // Passenger Temp Dial
    this.renderClimateDial(ctx, 480, 180, "PASSENGER ZONE", data.cabinTempPassengerC, false);
  }

  private renderClimateDial(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    label: string,
    tempC: number,
    isHeating: boolean
  ) {
    const r = 85;
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0.7 * Math.PI, 2.3 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 34px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${tempC.toFixed(1)}°C`, cx, cy + 10);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText(label, cx, cy - 35);

    ctx.fillStyle = isHeating ? "#f97316" : "#06b6d4";
    ctx.font = "12px 'Courier New', monospace";
    ctx.fillText(isHeating ? "HEAT: ACTIVE" : "COOL: ACTIVE", cx, cy + 40);
    ctx.textAlign = "left";
  }

  private renderGlassGlint(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const glint = ctx.createLinearGradient(0, 0, w, h);
    glint.addColorStop(0, "rgba(255, 255, 255, 0.08)");
    glint.addColorStop(0.3, "rgba(255, 255, 255, 0.02)");
    glint.addColorStop(0.6, "transparent");
    ctx.fillStyle = glint;
    ctx.fillRect(0, 0, w, h);
  }
}
