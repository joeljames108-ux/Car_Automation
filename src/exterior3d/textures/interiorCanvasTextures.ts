// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR STUDIO — DYNAMIC HMI CANVAS TEXTURE GENERATOR
// ============================================================================
// High-resolution procedural HTML5 Canvas texture generators for automotive HMI:
// - Virtual Instrument Cluster (Tachometer, Speed, G-Force, Boost, ADAS, Tire Temps)
// - Central Infotainment (GPS Map, Dual-Zone HVAC, Media Audio Waveforms, Drive Modes)
// - Passenger Auxiliary Display (G-Meter, Lap Delta, Track Timer)
// - Holographic Windshield HUD (Collimated Speedometer, Shift Lights, Navigation Arrows)
// ============================================================================

import * as THREE from 'three';
import { HmiUiTheme } from '../types/interiorStudioTypes';

export interface ClusterTelemetryFrame {
  speedKmh: number;
  engineRpm: number;
  maxRpm: number;
  gear: string; // 'P', 'R', 'N', 'D1', 'M4'
  boostBar: number;
  lateralG: number;
  longitudinalG: number;
  oilTempC: number;
  coolantTempC: number;
  fuelSocPercent: number;
  driveMode: 'ECO' | 'COMFORT' | 'SPORT' | 'CORSA' | 'TRACK';
  theme: HmiUiTheme;
}

export class InteriorCanvasTextureFactory {
  private static createFallbackTexture(): THREE.Texture {
    const data = new Uint8Array([10, 15, 24, 255]);
    const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Generates a high-definition (2048x1024) Virtual Instrument Cluster CanvasTexture.
   */
  public static createClusterTexture(telemetry?: Partial<ClusterTelemetryFrame>): THREE.Texture {
    if (typeof document === 'undefined') {
      return this.createFallbackTexture();
    }

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return this.createFallbackTexture();
    }

    const t: ClusterTelemetryFrame = {
      speedKmh: 148,
      engineRpm: 6850,
      maxRpm: 9200,
      gear: 'M4',
      boostBar: 1.42,
      lateralG: 1.15,
      longitudinalG: 0.45,
      oilTempC: 98,
      coolantTempC: 90,
      fuelSocPercent: 78,
      driveMode: 'CORSA',
      theme: 'motorsport_track_telemetry',
      ...telemetry,
    };

    this.renderClusterToContext(ctx, canvas.width, canvas.height, t);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return texture;
  }

  /**
   * Generates a high-definition (2048x1536) Center Infotainment Navigation & Media CanvasTexture.
   */
  public static createInfotainmentTexture(theme: HmiUiTheme = 'cyberpunk_neon_cyan'): THREE.Texture {
    if (typeof document === 'undefined') {
      return this.createFallbackTexture();
    }

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1536;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return this.createFallbackTexture();
    }

    this.renderInfotainmentToContext(ctx, canvas.width, canvas.height, theme);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return texture;
  }

  /**
   * Generates a 1024x512 Passenger Performance Display CanvasTexture.
   */
  public static createPassengerScreenTexture(theme: HmiUiTheme = 'cyberpunk_neon_cyan'): THREE.Texture {
    if (typeof document === 'undefined') {
      return this.createFallbackTexture();
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return this.createFallbackTexture();
    }

    this.renderPassengerScreenToContext(ctx, canvas.width, canvas.height, theme);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return texture;
  }

  /**
   * Generates a 1024x512 Holographic Windshield Heads-Up Display CanvasTexture.
   */
  public static createHudTexture(speedKmh: number = 148, gear: string = 'M4', rpmRatio: number = 0.74): THREE.Texture {
    if (typeof document === 'undefined') {
      return this.createFallbackTexture();
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return this.createFallbackTexture();
    }

    this.renderHudToContext(ctx, canvas.width, canvas.height, speedKmh, gear, rpmRatio);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return texture;
  }

  // ==========================================================================
  // INTERNAL RENDER PIPELINES
  // ==========================================================================

  private static renderClusterToContext(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: ClusterTelemetryFrame
  ): void {
    // 1. Dark OLED Background with subtle vignette
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w * 0.7);
    bgGrad.addColorStop(0, '#0a0d14');
    bgGrad.addColorStop(1, '#020306');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Grid Accent Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    const isCorsa = t.driveMode === 'CORSA' || t.driveMode === 'TRACK';
    const accentColor = isCorsa ? '#ef4444' : t.theme === 'luxury_gold_elegance' ? '#d97706' : '#06b6d4';
    const secondaryColor = isCorsa ? '#f59e0b' : '#3b82f6';

    // 2. Central Massive Tachometer Arc (Motorsport Style)
    const cx = w / 2;
    const cy = h * 0.58;
    const radius = 340;

    // Background track ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI * 0.75, Math.PI * 2.25);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Active RPM Arc
    const rpmFraction = Math.min(1.0, Math.max(0.0, t.engineRpm / t.maxRpm));
    const startAngle = Math.PI * 0.75;
    const totalAngle = Math.PI * 1.5;
    const currentAngle = startAngle + totalAngle * rpmFraction;

    const rpmGrad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
    rpmGrad.addColorStop(0, secondaryColor);
    rpmGrad.addColorStop(0.7, accentColor);
    rpmGrad.addColorStop(1, '#ff0055');

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, currentAngle);
    ctx.strokeStyle = rpmGrad;
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Glow effect on active arc
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, currentAngle - 0.1, currentAngle);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 28;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // Graduated Tick Marks & RPM Numbers (0k to 10k)
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 10; i++) {
      const angle = startAngle + (totalAngle * (i / 10));
      const xOuter = cx + Math.cos(angle) * (radius + 28);
      const yOuter = cy + Math.sin(angle) * (radius + 28);
      const xInner = cx + Math.cos(angle) * (radius + (i % 2 === 0 ? 12 : 20));
      const yInner = cy + Math.sin(angle) * (radius + (i % 2 === 0 ? 12 : 20));

      ctx.beginPath();
      ctx.moveTo(xInner, yInner);
      ctx.lineTo(xOuter, yOuter);
      ctx.strokeStyle = i >= 8 ? '#ef4444' : 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = i % 2 === 0 ? 4 : 2;
      ctx.stroke();

      if (i % 2 === 0) {
        const xText = cx + Math.cos(angle) * (radius + 54);
        const yText = cy + Math.sin(angle) * (radius + 54);
        ctx.fillStyle = i >= 8 ? '#ef4444' : '#cbd5e1';
        ctx.fillText(`${i}`, xText, yText);
      }
    }

    // 3. Center Digital Speed & Gear Display
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 130px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(t.speedKmh)}`, cx, cy - 60);

    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('KM/H', cx, cy + 15);

    // Selected Gear Badge
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(cx - 55, cy + 50, 110, 65, 14);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px sans-serif';
    ctx.fillText(t.gear, cx, cy + 86);

    // Drive Mode Pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(cx - 90, cy + 135, 180, 42, 21);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`MODE: ${t.driveMode}`, cx, cy + 158);

    // 4. Shift Light Array (Top Center Strip)
    const ledCount = 16;
    const ledWidth = 32;
    const ledGap = 8;
    const totalLedW = (ledCount * ledWidth) + ((ledCount - 1) * ledGap);
    const startX = cx - (totalLedW / 2);
    const ledY = 90;

    for (let i = 0; i < ledCount; i++) {
      const active = i < Math.floor(rpmFraction * ledCount);
      const isRed = i >= 12;
      const isYellow = i >= 8 && i < 12;

      let ledColor = 'rgba(255, 255, 255, 0.1)';
      if (active) {
        ledColor = isRed ? '#ef4444' : isYellow ? '#eab308' : '#22c55e';
      }

      ctx.fillStyle = ledColor;
      ctx.beginPath();
      ctx.roundRect(startX + i * (ledWidth + ledGap), ledY, ledWidth, 14, 4);
      ctx.fill();

      if (active) {
        ctx.shadowColor = ledColor;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // 5. Left Side: G-Force Circular Telemetry HUD
    const leftX = 360;
    const leftY = cy;
    const gRadius = 130;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(leftX, leftY, gRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(leftX, leftY, gRadius * 0.5, 0, Math.PI * 2);
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(leftX - gRadius - 15, leftY);
    ctx.lineTo(leftX + gRadius + 15, leftY);
    ctx.moveTo(leftX, leftY - gRadius - 15);
    ctx.lineTo(leftX, leftY + gRadius + 15);
    ctx.stroke();

    // Instantaneous G-Bubble
    const gBubbleX = leftX + (t.lateralG / 2.0) * gRadius;
    const gBubbleY = leftY - (t.longitudinalG / 2.0) * gRadius;

    ctx.fillStyle = accentColor;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(gBubbleX, gBubbleY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('G-METER', leftX, leftY - gRadius - 35);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${t.lateralG.toFixed(2)}G LAT | ${t.longitudinalG.toFixed(2)}G LONG`, leftX, leftY + gRadius + 40);

    // 6. Right Side: Boost & Vehicle Thermal Telemetry
    const rightX = w - 360;
    const rightY = cy;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(rightX - 160, rightY - 140, 320, 280, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('POWERTRAIN STATUS', rightX, rightY - 100);

    // Boost Bar
    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`TURBO BOOST: ${t.boostBar.toFixed(2)} BAR`, rightX - 130, rightY - 50);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(rightX - 130, rightY - 35, 260, 12);
    ctx.fillStyle = accentColor;
    ctx.fillRect(rightX - 130, rightY - 35, 260 * Math.min(1.0, t.boostBar / 2.5), 12);

    // Oil Temp
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`OIL TEMP: ${t.oilTempC}°C`, rightX - 130, rightY + 15);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(rightX - 130, rightY + 30, 260, 12);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(rightX - 130, rightY + 30, 260 * (t.oilTempC / 130), 12);

    // Coolant Temp
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`COOLANT: ${t.coolantTempC}°C`, rightX - 130, rightY + 80);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(rightX - 130, rightY + 95, 260, 12);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(rightX - 130, rightY + 95, 260 * (t.coolantTempC / 120), 12);

    // Bottom Status Bar (Odometer, Range, Clock)
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('18,420 KM   •   RANGE: 540 KM (78%)   •   24.5°C   •   18:04', cx, h - 50);
  }

  private static renderInfotainmentToContext(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    theme: HmiUiTheme
  ): void {
    // 1. Dark Modern Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const accent = theme === 'cyberpunk_neon_cyan' ? '#06b6d4' : theme === 'luxury_gold_elegance' ? '#f59e0b' : '#3b82f6';

    // 2. Top Header Bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, 110);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(0, 110);
    ctx.lineTo(w, 110);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚡ APEX HMI NAVIGATION & TELEMETRY', 60, 70);

    ctx.textAlign = 'right';
    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('5G ULTRA  •  18:04  •  22.5°C', w - 60, 70);

    // 3. Left Navigation Map Window (Occupies 60% of Width)
    const mapW = w * 0.62;
    const mapH = h - 260;
    const mapX = 40;
    const mapY = 140;

    // Map canvas panel
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(mapX, mapY, mapW, mapH, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    // Stylized Simulated GPS Road Network
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(mapX + 100, mapY + mapH);
    ctx.quadraticCurveTo(mapX + mapW * 0.4, mapY + mapH * 0.5, mapX + mapW * 0.8, mapY + 80);
    ctx.moveTo(mapX, mapY + mapH * 0.4);
    ctx.lineTo(mapX + mapW, mapY + mapH * 0.3);
    ctx.stroke();

    // Active Route Path (Glowing Cyan / Green)
    ctx.strokeStyle = accent;
    ctx.lineWidth = 10;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(mapX + 220, mapY + mapH - 80);
    ctx.bezierCurveTo(mapX + 450, mapY + 500, mapX + 600, mapY + 350, mapX + mapW - 180, mapY + 180);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Vehicle Navigation Cursor Arrow
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(mapX + 220, mapY + mapH - 80, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(mapX + 220, mapY + mapH - 80, 10, 0, Math.PI * 2);
    ctx.fill();

    // Turn-by-Turn Maneuver Overlay Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    ctx.roundRect(mapX + 30, mapY + 30, 480, 150, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.font = '900 52px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('↱', mapX + 60, mapY + 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('In 450m Turn Right', mapX + 130, mapY + 85);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px sans-serif';
    ctx.fillText('Via Autodromo Nazionale Monza', mapX + 130, mapY + 130);

    // 4. Right Side: Media Player & Dual-Zone Climate Cards
    const rightW = w - mapW - 120;
    const rightX = mapX + mapW + 40;

    // Card 1: Media Player
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(rightX, mapY, rightW, mapH * 0.48, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    // Album Art Box
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(rightX + 30, mapY + 30, 140, 140, 14);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.font = '54px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('♬', rightX + 100, mapY + 115);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('Cyberdrive Symphony No. 9', rightX + 195, mapY + 75);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px sans-serif';
    ctx.fillText('Lossless 24-Bit / 96kHz Spatial Audio', rightX + 195, mapY + 115);

    // Audio Waveform Equalizer Bars
    for (let i = 0; i < 28; i++) {
      const barH = 15 + Math.sin(i * 0.4 + 1.2) * 35 + Math.cos(i * 0.8) * 20;
      ctx.fillStyle = i % 2 === 0 ? accent : '#38bdf8';
      ctx.fillRect(rightX + 40 + (i * 18), mapY + 280 - barH, 12, barH);
    }

    // Card 2: Dual-Zone Climate Control
    const climY = mapY + (mapH * 0.52);
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(rightX, climY, rightW, mapH * 0.48, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DUAL-ZONE CLIMATE CONTROL', rightX + (rightW / 2), climY + 50);

    // Driver Temp Dial
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 54px sans-serif';
    ctx.fillText('21.5°C', rightX + (rightW * 0.28), climY + 140);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.fillText('DRIVER AIR: AUTO', rightX + (rightW * 0.28), climY + 185);

    // Passenger Temp Dial
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 54px sans-serif';
    ctx.fillText('22.0°C', rightX + (rightW * 0.72), climY + 140);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.fillText('PASSENGER AIR: AUTO', rightX + (rightW * 0.72), climY + 185);

    // 5. Bottom Dock: Shortcuts (Nav, Audio, Vehicle Settings, HVAC, Phone)
    const dockY = h - 100;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, dockY, w, 100);

    const icons = ['🗺️ NAVIGATION', '🎵 MEDIA', '⚡ DRIVE DYNAMICS', '❄️ CLIMATE', '📱 TELEPHONE', '⚙️ SETTINGS'];
    const tabW = w / icons.length;

    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';

    icons.forEach((icon, idx) => {
      const isSelected = idx === 0;
      ctx.fillStyle = isSelected ? accent : '#64748b';
      ctx.fillText(icon, (idx * tabW) + (tabW / 2), dockY + 58);

      if (isSelected) {
        ctx.fillStyle = accent;
        ctx.fillRect(idx * tabW + (tabW * 0.2), h - 6, tabW * 0.6, 6);
      }
    });
  }

  private static renderPassengerScreenToContext(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    theme: HmiUiTheme
  ): void {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const accent = theme === 'cyberpunk_neon_cyan' ? '#06b6d4' : '#ef4444';

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(30, 30, w - 60, h - 60, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏎️ CO-PILOT PERFORMANCE DISPLAY', 60, 75);

    // Current Speed & G-Force
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.fillText('VEHICLE VELOCITY', 60, 150);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 70px sans-serif';
    ctx.fillText('148', 60, 225);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('KM/H', 195, 225);

    // Lap Delta & Track Map Mini
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.fillText('BEST LAP DELTA', w - 360, 150);
    ctx.fillStyle = '#22c55e';
    ctx.font = '900 64px sans-serif';
    ctx.fillText('- 0.384 s', w - 360, 225);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('ESTIMATED LAP: 1:44.82', w - 360, 275);

    // Bottom Media Ticker
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(60, h - 110, w - 120, 60, 12);
    ctx.fill();

    ctx.fillStyle = accent;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('♫ NOW PLAYING: Synthwave Accelerando — Dolby Atmos 3D', 80, h - 72);
  }

  private static renderHudToContext(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    speedKmh: number,
    gear: string,
    rpmRatio: number
  ): void {
    // Transparent glass background for HUD projection
    ctx.clearRect(0, 0, w, h);

    const hudColor = '#00ffcc'; // High-contrast collimated HUD green-cyan

    ctx.shadowColor = hudColor;
    ctx.shadowBlur = 15;

    // 1. Digital Speed
    ctx.fillStyle = hudColor;
    ctx.font = '900 110px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(speedKmh)}`, w / 2, 220);

    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('KM/H', w / 2, 275);

    // 2. Selected Gear
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(`[ ${gear} ]`, w / 2, 335);

    // 3. Top Curved Shift Light Ribbon
    const cx = w / 2;
    const cy = 460;
    const r = 380;
    const startA = Math.PI * 1.25;
    const totalA = Math.PI * 0.5;

    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, startA + totalA);
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.25)';
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, startA + totalA * Math.min(1.0, rpmRatio));
    ctx.strokeStyle = rpmRatio > 0.85 ? '#ff0055' : hudColor;
    ctx.lineWidth = 10;
    ctx.stroke();

    // 4. Navigation Chevron
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('↱ 450m', w / 2 + 240, 240);

    ctx.shadowBlur = 0;
  }
}
