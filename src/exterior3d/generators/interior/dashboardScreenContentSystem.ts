// ============================================================================
// DASHBOARD SCREEN CONTENT SYSTEM — PROCEDURAL CANVAS TEXTURES FOR HUD/CLUSTER
// ============================================================================
// Generates high-fidelity canvas-based screen textures for:
// - Digital instrument cluster (speedo, tach, fuel, temp, gear indicator)
// - Central infotainment display (navigation map, media player, HVAC controls)
// - Head-Up Display (HUD) projected overlay (speed, navigation arrows, warnings)
// - Passenger co-pilot screen (media, rear climate, seat controls)
// - Rear seat entertainment screens (streaming, climate, lighting control)
// - Center console touchpad haptic feedback visualizer
// - Steering wheel thumb display (lap times, radio channel)
// - Door panel touchscreen (seat memory, mirror, window controls)
// - Gauge cluster animations (needle sweep, startup sequence, warning flashes)
// - Real-time telemetry overlay (tire pressures, temps, brake bias)
// ============================================================================

export interface ScreenTextureConfig {
  width: number;
  height: number;
  theme: "luxury_gold" | "sport_cyan" | "racing_red" | "minimal_dark" | "heritage_green" | "cyber_purple";
  brightness: number;
}

export class DashboardScreenContentSystem {
  private static canvasPool: HTMLCanvasElement[] = [];
  private static maxPoolSize = 10;

  private static getCanvas(width: number, height: number): HTMLCanvasElement {
    if (this.canvasPool.length > 0) {
      const c = this.canvasPool.pop()!;
      c.width = width;
      c.height = height;
      return c;
    }
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    return c;
  }

  private static returnCanvas(c: HTMLCanvasElement): void {
    if (this.canvasPool.length < this.maxPoolSize) {
      this.canvasPool.push(c);
    }
  }

  /**
   * Theme color palettes
   */
  private static getThemeColors(theme: ScreenTextureConfig["theme"]) {
    const palettes = {
      luxury_gold: {
        primary: "#d9a64e",
        secondary: "#b8860b",
        bg: "#070b14",
        text: "#e8d5a0",
        accent: "#f5d68a",
        warning: "#ef4444",
        success: "#22c55e",
        dim: "#3a3a3a",
      },
      sport_cyan: {
        primary: "#f59e0b",
        secondary: "#0891b2",
        bg: "#050a12",
        text: "#e0f2fe",
        accent: "#fde68a",
        warning: "#f59e0b",
        success: "#10b981",
        dim: "#1e293b",
      },
      racing_red: {
        primary: "#ef4444",
        secondary: "#dc2626",
        bg: "#0a0505",
        text: "#fecaca",
        accent: "#f87171",
        warning: "#fbbf24",
        success: "#34d399",
        dim: "#2a1a1a",
      },
      minimal_dark: {
        primary: "#94a3b8",
        secondary: "#64748b",
        bg: "#020617",
        text: "#e2e8f0",
        accent: "#cbd5e1",
        warning: "#f97316",
        success: "#22c55e",
        dim: "#1e293b",
      },
      heritage_green: {
        primary: "#22c55e",
        secondary: "#16a34a",
        bg: "#050f0a",
        text: "#bbf7d0",
        accent: "#4ade80",
        warning: "#eab308",
        success: "#86efac",
        dim: "#14532d",
      },
      cyber_purple: {
        primary: "#f59e0b",
        secondary: "#d97706",
        bg: "#0a0512",
        text: "#e9d5ff",
        accent: "#fbbf24",
        warning: "#f43f5e",
        success: "#34d399",
        dim: "#2e1065",
      },
    };
    return palettes[theme];
  }

  /**
   * Creates a digital instrument cluster texture with speedo, tach, and gauges.
   */
  public static createInstrumentCluster(config: ScreenTextureConfig, data?: {
    speedKmh?: number;
    rpm?: number;
    gear?: number;
    fuelPercent?: number;
    tempC?: number;
  }): HTMLCanvasElement {
    const { width: w, height: h } = config;
    const canvas = this.getCanvas(w, h);
    const ctx = canvas.getContext("2d")!;
    const colors = this.getThemeColors(config.theme);

    // Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle grid pattern
    ctx.strokeStyle = colors.dim + "30";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const speed = data?.speedKmh ?? 0;
    const rpm = data?.rpm ?? 0;
    const gear = data?.gear ?? 0;
    const fuel = data?.fuelPercent ?? 75;
    const temp = data?.tempC ?? 90;

    // ── Speed Display (center) ──
    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = colors.text;
    ctx.font = `bold ${h * 0.32}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.round(speed).toString(), cx, cy - h * 0.05);

    ctx.fillStyle = colors.dim;
    ctx.font = `${h * 0.08}px 'Courier New', monospace`;
    ctx.fillText("km/h", cx, cy + h * 0.15);

    // ── Gear Indicator ──
    ctx.fillStyle = colors.primary;
    ctx.font = `bold ${h * 0.22}px 'Courier New', monospace`;
    ctx.fillText(gear === 0 ? "N" : gear === -1 ? "R" : gear.toString(), cx, cy - h * 0.30);

    // ── Tachometer Arc (top-left) ──
    const tachCx = w * 0.22;
    const tachCy = h * 0.45;
    const tachR = w * 0.16;

    ctx.strokeStyle = colors.dim;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(tachCx, tachCy, tachR, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();

    // RPM fill arc
    const rpmNorm = Math.min(1, rpm / 15000);
    const rpmAngle = Math.PI * 0.8 + rpmNorm * Math.PI * 1.4;
    ctx.strokeStyle = rpmNorm > 0.85 ? colors.warning : colors.primary;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(tachCx, tachCy, tachR, Math.PI * 0.8, rpmAngle);
    ctx.stroke();

    // RPM value
    ctx.fillStyle = colors.text;
    ctx.font = `bold ${h * 0.10}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.fillText(Math.round(rpm).toString(), tachCx, tachCy + h * 0.02);
    ctx.fillStyle = colors.dim;
    ctx.font = `${h * 0.05}px 'Courier New', monospace`;
    ctx.fillText("RPM", tachCx, tachCy + h * 0.12);

    // Redline zone markers
    for (let r = 10000; r <= 15000; r += 1000) {
      const rNorm = r / 15000;
      const rAngle = Math.PI * 0.8 + rNorm * Math.PI * 1.4;
      ctx.fillStyle = colors.warning;
      ctx.font = `${h * 0.035}px 'Courier New', monospace`;
      const mx = tachCx + Math.cos(rAngle) * (tachR + 12);
      const my = tachCy + Math.sin(rAngle) * (tachR + 12);
      ctx.fillText((r / 1000).toString(), mx, my);
    }

    // ── Fuel Gauge (bottom-left) ──
    const fuelX = w * 0.12;
    const fuelY = h * 0.88;
    const fuelW = w * 0.25;

    ctx.fillStyle = colors.dim;
    ctx.fillRect(fuelX - fuelW / 2, fuelY, fuelW, 8);

    const fuelColor = fuel < 20 ? colors.warning : colors.success;
    ctx.fillStyle = fuelColor;
    ctx.fillRect(fuelX - fuelW / 2, fuelY, fuelW * (fuel / 100), 8);

    ctx.fillStyle = colors.text;
    ctx.font = `${h * 0.05}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(fuel)}%`, fuelX, fuelY + h * 0.06);
    ctx.fillStyle = colors.dim;
    ctx.fillText("FUEL", fuelX, fuelY - h * 0.02);

    // ── Temperature Gauge (bottom-right) ──
    const tempX = w * 0.88;
    const tempY = h * 0.88;
    const tempW = w * 0.25;

    ctx.fillStyle = colors.dim;
    ctx.fillRect(tempX - tempW / 2, tempY, tempW, 8);

    const tempColor = temp > 110 ? colors.warning : colors.primary;
    ctx.fillStyle = tempColor;
    ctx.fillRect(tempX - tempW / 2, tempY, tempW * Math.min(1, temp / 150), 8);

    ctx.fillStyle = colors.text;
    ctx.font = `${h * 0.05}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(temp)}°C`, tempX, tempY + h * 0.06);
    ctx.fillStyle = colors.dim;
    ctx.fillText("TEMP", tempX, tempY - h * 0.02);

    // ── Status Icons Row (top) ──
    const icons = ["ABS", "TC", "DRS", "ERS"];
    icons.forEach((icon, i) => {
      const ix = w * 0.25 + i * (w * 0.15);
      const iy = h * 0.08;
      ctx.fillStyle = i === 2 ? colors.success : colors.dim;
      ctx.font = `bold ${h * 0.05}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(icon, ix, iy);
    });

    // ── Lap Time (if racing mode) ──
    ctx.fillStyle = colors.accent;
    ctx.font = `${h * 0.06}px 'Courier New', monospace`;
    ctx.textAlign = "right";
    ctx.fillText("1:23.456", w * 0.95, h * 0.15);

    return canvas;
  }

  /**
   * Creates a central infotainment display texture.
   */
  public static createInfotainmentScreen(config: ScreenTextureConfig, data?: {
    mediaTitle?: string;
    mediaArtist?: string;
    hvacTemp?: number;
    navDestination?: string;
  }): HTMLCanvasElement {
    const { width: w, height: h } = config;
    const canvas = this.getCanvas(w, h);
    const ctx = canvas.getContext("2d")!;
    const colors = this.getThemeColors(config.theme);

    // Background with gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, colors.bg);
    bgGrad.addColorStop(1, "#000000");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // ── Navigation Map Area (top 60%) ──
    ctx.fillStyle = "#0a1520";
    ctx.fillRect(w * 0.02, h * 0.02, w * 0.62, h * 0.56);

    // Grid lines for map
    ctx.strokeStyle = "#152535";
    ctx.lineWidth = 1;
    for (let x = 0; x < w * 0.62; x += 30) {
      ctx.beginPath();
      ctx.moveTo(w * 0.02 + x, h * 0.02);
      ctx.lineTo(w * 0.02 + x, h * 0.58);
      ctx.stroke();
    }

    // Road lines
    ctx.strokeStyle = colors.primary + "60";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.10, h * 0.55);
    ctx.quadraticCurveTo(w * 0.25, h * 0.30, w * 0.55, h * 0.10);
    ctx.stroke();

    ctx.strokeStyle = colors.dim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.20);
    ctx.lineTo(w * 0.58, h * 0.40);
    ctx.stroke();

    // Current position marker
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(w * 0.30, h * 0.32, 6, 0, Math.PI * 2);
    ctx.fill();

    // Navigation arrow
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.moveTo(w * 0.30, h * 0.28);
    ctx.lineTo(w * 0.27, h * 0.34);
    ctx.lineTo(w * 0.33, h * 0.34);
    ctx.closePath();
    ctx.fill();

    // Map label
    ctx.fillStyle = colors.text;
    ctx.font = `${h * 0.04}px 'Courier New', monospace`;
    ctx.textAlign = "left";
    ctx.fillText(data?.navDestination || "Current Location", w * 0.04, h * 0.55);

    // ── Media Player (right side) ──
    ctx.fillStyle = "#0f1520";
    ctx.fillRect(w * 0.66, h * 0.02, w * 0.32, h * 0.35);

    ctx.fillStyle = colors.text;
    ctx.font = `bold ${h * 0.05}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.fillText("NOW PLAYING", w * 0.82, h * 0.10);

    ctx.fillStyle = colors.accent;
    ctx.font = `bold ${h * 0.06}px 'Courier New', monospace`;
    ctx.fillText(data?.mediaTitle || "Midnight Drive", w * 0.82, h * 0.22);

    ctx.fillStyle = colors.dim;
    ctx.font = `${h * 0.04}px 'Courier New', monospace`;
    ctx.fillText(data?.mediaArtist || "Apex Records", w * 0.82, h * 0.30);

    // Playback controls
    ctx.fillStyle = colors.text;
    ctx.font = `${h * 0.08}px 'Courier New', monospace`;
    ctx.fillText("⏮  ▶  ⏭", w * 0.82, h * 0.42);

    // ── HVAC Controls (bottom) ──
    ctx.fillStyle = "#0f1520";
    ctx.fillRect(w * 0.02, h * 0.62, w * 0.96, h * 0.36);

    const hvacTemp = data?.hvacTemp ?? 22;
    // Driver temp
    ctx.fillStyle = colors.text;
    ctx.font = `bold ${h * 0.12}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${hvacTemp}°`, w * 0.18, h * 0.82);

    ctx.fillStyle = colors.dim;
    ctx.font = `${h * 0.04}px 'Courier New', monospace`;
    ctx.fillText("DRIVER", w * 0.18, h * 0.72);

    // Passenger temp
    ctx.fillStyle = colors.text;
    ctx.font = `bold ${h * 0.12}px 'Courier New', monospace`;
    ctx.fillText(`${hvacTemp}°`, w * 0.82, h * 0.82);

    ctx.fillStyle = colors.dim;
    ctx.font = `${h * 0.04}px 'Courier New', monospace`;
    ctx.fillText("PASS", w * 0.82, h * 0.72);

    // Center HVAC controls
    ctx.fillStyle = colors.primary;
    ctx.font = `${h * 0.06}px 'Courier New', monospace`;
    ctx.fillText("❄ AUTO ♦ SYNC", w * 0.50, h * 0.82);

    // Fan speed bar
    ctx.fillStyle = colors.dim;
    ctx.fillRect(w * 0.35, h * 0.90, w * 0.30, 4);
    ctx.fillStyle = colors.primary;
    ctx.fillRect(w * 0.35, h * 0.90, w * 0.18, 4);

    return canvas;
  }

  /**
   * Creates a Head-Up Display (HUD) overlay texture.
   */
  public static createHUDOverlay(config: ScreenTextureConfig, data?: {
    speedKmh?: number;
    navigationArrow?: "left" | "right" | "straight" | "uturn";
    warningText?: string;
  }): HTMLCanvasElement {
    const { width: w, height: h } = config;
    const canvas = this.getCanvas(w, h);
    const ctx = canvas.getContext("2d")!;
    const colors = this.getThemeColors(config.theme);

    // Transparent background (HUD is overlaid on windshield)
    ctx.clearRect(0, 0, w, h);

    const speed = data?.speedKmh ?? 0;

    // Speed (large, centered)
    ctx.fillStyle = colors.primary;
    ctx.font = `bold ${h * 0.35}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = 0.85;
    ctx.fillText(Math.round(speed).toString(), w / 2, h * 0.40);

    ctx.fillStyle = colors.dim;
    ctx.font = `${h * 0.10}px 'Courier New', monospace`;
    ctx.fillText("km/h", w / 2, h * 0.58);

    // Speed limit indicator (if available)
    ctx.strokeStyle = colors.warning;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.40, h * 0.22, 0, Math.PI * 2);
    ctx.stroke();

    // Navigation arrow
    if (data?.navigationArrow) {
      const arrowX = w * 0.15;
      const arrowY = h * 0.45;
      ctx.fillStyle = colors.success;
      ctx.font = `${h * 0.20}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      const arrows: Record<string, string> = {
        left: "←",
        right: "→",
        straight: "↑",
        uturn: "↺",
      };
      ctx.fillText(arrows[data.navigationArrow] || "↑", arrowX, arrowY);
    }

    // Warning text
    if (data?.warningText) {
      ctx.fillStyle = colors.warning;
      ctx.font = `bold ${h * 0.08}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(data.warningText, w / 2, h * 0.80);
    }

    ctx.globalAlpha = 1.0;
    return canvas;
  }

  /**
   * Creates a rear passenger entertainment screen texture.
   */
  public static createRearEntertainment(config: ScreenTextureConfig, data?: {
    temperature?: number;
    mediaPlaying?: boolean;
    mediaTitle?: string;
  }): HTMLCanvasElement {
    const { width: w, height: h } = config;
    const canvas = this.getCanvas(w, h);
    const ctx = canvas.getContext("2d")!;
    const colors = this.getThemeColors(config.theme);

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    // Media player or seat controls
    if (data?.mediaPlaying) {
      ctx.fillStyle = colors.accent;
      ctx.font = `bold ${h * 0.08}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(data.mediaTitle || "Rear Entertainment", w / 2, h * 0.25);

      // Progress bar
      ctx.fillStyle = colors.dim;
      ctx.fillRect(w * 0.1, h * 0.40, w * 0.80, 4);
      ctx.fillStyle = colors.primary;
      ctx.fillRect(w * 0.1, h * 0.40, w * 0.35, 4);

      ctx.fillStyle = colors.text;
      ctx.font = `${h * 0.06}px 'Courier New', monospace`;
      ctx.fillText("1:23 / 4:56", w / 2, h * 0.50);
    }

    // Climate controls
    const temp = data?.temperature ?? 22;
    ctx.fillStyle = colors.text;
    ctx.font = `bold ${h * 0.15}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${temp}°C`, w / 2, h * 0.78);

    ctx.fillStyle = colors.dim;
    ctx.font = `${h * 0.06}px 'Courier New', monospace`;
    ctx.fillText("REAR CLIMATE", w / 2, h * 0.70);

    return canvas;
  }

  /**
   * Creates a startup animation frame (needle sweep).
   */
  public static createStartupFrame(config: ScreenTextureConfig, progress: number): HTMLCanvasElement {
    const { width: w, height: h } = config;
    const canvas = this.getCanvas(w, h);
    const ctx = canvas.getContext("2d")!;
    const colors = this.getThemeColors(config.theme);

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    // Fade-in effect
    ctx.globalAlpha = progress;

    // Logo area
    ctx.fillStyle = colors.primary;
    ctx.font = `bold ${h * 0.15}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.fillText("APEX ENGINEER", w / 2, h * 0.35);

    ctx.fillStyle = colors.dim;
    ctx.font = `${h * 0.06}px 'Courier New', monospace`;
    ctx.fillText("VISION STUDIO", w / 2, h * 0.48);

    // Loading bar
    ctx.fillStyle = colors.dim;
    ctx.fillRect(w * 0.2, h * 0.60, w * 0.60, 4);
    ctx.fillStyle = colors.primary;
    ctx.fillRect(w * 0.2, h * 0.60, w * 0.60 * progress, 4);

    // Percentage
    ctx.fillStyle = colors.text;
    ctx.font = `bold ${h * 0.10}px 'Courier New', monospace`;
    ctx.fillText(`${Math.round(progress * 100)}%`, w / 2, h * 0.78);

    ctx.globalAlpha = 1.0;
    return canvas;
  }

  /**
   * Creates a telemetry overlay for real-time vehicle data.
   */
  public static createTelemetryOverlay(config: ScreenTextureConfig, data?: {
    tirePressures?: number[];
    tireTemps?: number[];
    brakeTemps?: number[];
    lapTime?: string;
    position?: number;
    gapToLeader?: string;
  }): HTMLCanvasElement {
    const { width: w, height: h } = config;
    const canvas = this.getCanvas(w, h);
    const ctx = canvas.getContext("2d")!;
    const colors = this.getThemeColors(config.theme);

    ctx.clearRect(0, 0, w, h);

    // Tire pressure grid (4 corners)
    const tireXs = [w * 0.25, w * 0.75, w * 0.25, w * 0.75];
    const tireYs = [h * 0.25, h * 0.25, h * 0.75, h * 0.75];
    const pressures = data?.tirePressures ?? [2.3, 2.3, 2.5, 2.5];

    for (let i = 0; i < 4; i++) {
      const px = tireXs[i];
      const py = tireYs[i];
      const pColor = pressures[i] < 2.0 || pressures[i] > 2.8 ? colors.warning : colors.success;

      ctx.strokeStyle = pColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, h * 0.10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = `bold ${h * 0.08}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${pressures[i].toFixed(1)}`, px, py + h * 0.03);
      ctx.fillStyle = colors.dim;
      ctx.font = `${h * 0.04}px 'Courier New', monospace`;
      ctx.fillText("bar", px, py + h * 0.10);
    }

    // Lap time
    if (data?.lapTime) {
      ctx.fillStyle = colors.accent;
      ctx.font = `bold ${h * 0.07}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(data.lapTime, w / 2, h * 0.10);
    }

    return canvas;
  }

  /**
   * Releases a canvas back to the pool.
   */
  public static releaseCanvas(canvas: HTMLCanvasElement): void {
    this.returnCanvas(canvas);
  }
}
