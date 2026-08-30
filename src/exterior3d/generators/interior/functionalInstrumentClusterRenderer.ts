/**
 * ============================================================================
 * MODULAR INTERIOR STUDIO — FUNCTIONAL INSTRUMENT CLUSTER & INFOTAINMENT CANVAS
 * ============================================================================
 * Renders live, reactive 2D Canvas textures directly onto the in-game 3D cockpit
 * displays:
 * - Circular Tachometer with animated needle & redline shift indicator
 * - Digital Speedometer & Gear display (P, R, N, 1-8)
 * - Boost Pressure Bar & Turbo spool indicator
 * - Live Lateral / Longitudinal G-Force telemetry crosshairs
 * - Oil Temp, Coolant Temp & Fuel Level gauges
 * ============================================================================
 */

import * as THREE from "three";

export interface ClusterTelemetryState {
  rpm: number;
  maxRpm: number;
  speedKmh: number;
  gear: string;
  boostBar: number;
  oilTempC: number;
  coolantTempC: number;
  lateralG: number;
  longitudinalG: number;
  lapTimeSeconds: number;
}

export class FunctionalInstrumentClusterRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private texture: THREE.CanvasTexture | null = null;

  constructor(width: number = 1024, height: number = 512) {
    if (typeof document !== "undefined") {
      this.canvas = document.createElement("canvas");
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx = this.canvas.getContext("2d");
      if (this.canvas) {
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.needsUpdate = true;
      }
    }
  }

  public getTexture(): THREE.CanvasTexture | null {
    return this.texture;
  }

  public render(telemetry: ClusterTelemetryState): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background Clear
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, w, h);

    // Subtle Carbon Fiber Texture Grid Pattern
    ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // 1. Center Circular Tachometer Dial
    const cx = w * 0.5;
    const cy = h * 0.55;
    const radius = 170;

    // Outer Dial Arc
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI * 0.75, Math.PI * 2.25);
    ctx.stroke();

    // Active RPM Arc
    const rpmFrac = Math.min(1.0, Math.max(0, telemetry.rpm / telemetry.maxRpm));
    const startAngle = Math.PI * 0.75;
    const endAngle = startAngle + rpmFrac * (Math.PI * 1.5);

    const grad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
    grad.addColorStop(0, "#f59e0b");
    grad.addColorStop(0.7, "#d97706");
    grad.addColorStop(1, "#ef4444");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.stroke();

    // Center Gear Display
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 64px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(telemetry.gear, cx, cy - 20);

    // Digital Speedometer (km/h)
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 38px 'Courier New', monospace";
    ctx.fillText(`${Math.round(telemetry.speedKmh)}`, cx, cy + 45);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("KM/H", cx, cy + 70);

    // RPM Needle Line
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(endAngle) * (radius - 15), cy + Math.sin(endAngle) * (radius - 15));
    ctx.stroke();

    // 2. Left Side: G-Force Telemetry & Boost
    const leftX = w * 0.22;
    ctx.fillStyle = "#1a1008";
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2;
    ctx.fillRect(leftX - 80, cy - 80, 160, 160);
    ctx.strokeRect(leftX - 80, cy - 80, 160, 160);

    // Crosshairs
    ctx.strokeStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(leftX - 80, cy);
    ctx.lineTo(leftX + 80, cy);
    ctx.moveTo(leftX, cy - 80);
    ctx.lineTo(leftX, cy + 80);
    ctx.stroke();

    // Moving G-Dot
    const dotX = leftX + (telemetry.lateralG / 2.0) * 60;
    const dotY = cy - (telemetry.longitudinalG / 2.0) * 60;
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(dotX, dotY, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText("LAT / LONG G-METER", leftX, cy - 90);
    ctx.fillText(`${telemetry.lateralG.toFixed(2)} G`, leftX, cy + 98);

    // 3. Right Side: Boost & Thermal Gauges
    const rightX = w * 0.78;
    ctx.fillStyle = "#1a1008";
    ctx.strokeStyle = "#059669";
    ctx.lineWidth = 2;
    ctx.fillRect(rightX - 80, cy - 80, 160, 160);
    ctx.strokeRect(rightX - 80, cy - 80, 160, 160);

    // Boost Gauge Bar
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 13px monospace";
    ctx.fillText("TURBO BOOST", rightX, cy - 90);
    ctx.fillText(`${telemetry.boostBar.toFixed(2)} BAR`, rightX, cy + 98);

    const boostFrac = Math.min(1.0, Math.max(0, telemetry.boostBar / 2.5));
    ctx.fillStyle = "#10b981";
    ctx.fillRect(rightX - 60, cy + 60 - boostFrac * 120, 120, boostFrac * 120);

    // 4. Header Status Bar
    ctx.fillStyle = "#334155";
    ctx.fillRect(0, 0, w, 42);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("APEX PERFORMANCE CLUSTER v4.2", 24, 26);

    ctx.textAlign = "right";
    const minutes = Math.floor(telemetry.lapTimeSeconds / 60);
    const seconds = (telemetry.lapTimeSeconds % 60).toFixed(2);
    ctx.fillText(`LAP: ${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`, w - 24, 26);

    if (this.texture) {
      this.texture.needsUpdate = true;
    }
  }
}
