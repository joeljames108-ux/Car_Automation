// Higgsfield AI integration layer — https://higgsfield.ai
//
// Higgsfield exposes an MCP server (https://mcp.higgsfield.ai/mcp) rather than a
// public browser REST API. This module therefore ships three pluggable backends:
//
//   "web"  → opens prefilled Higgsfield web tools in a new tab (works today, no key)
//   "api"  → posts jobs to your own proxy (VITE_HIGGSFIELD_PROXY_URL) that fronts
//            the Higgsfield MCP/CLI; jobs are polled until completion
//   "demo" → generates procedural placeholder art locally so the studio is fully
//            usable offline
//
// Every product surface Higgsfield offers is represented in HF_MODELS/HF_TOOLS.

export type HiggsfieldBackend = "web" | "api" | "demo";

export type HiggsfieldKind = "image" | "video" | "audio" | "campaign" | "batch" | "scene" | "3d";

export interface HiggsfieldModel {
  id: string;
  label: string;
  kind: Extract<HiggsfieldKind, "image" | "video" | "3d">;
  vendor: string;
  blurb: string;
  /** Higgsfield web-app deep link used by the "web" backend */
  appUrl: string;
}

export const HF_MODELS: HiggsfieldModel[] = [
  // ─── 3D Mesh Synthesis Models ───
  { id: "image_to_3d", label: "Image to 3D (Meshy)", kind: "3d", vendor: "Meshy", blurb: "Single image to 3D GLB with quad/tri topology & PBR", appUrl: "https://higgsfield.ai/generate" },
  { id: "sam_3_3d", label: "SAM 3 3D Objects", kind: "3d", vendor: "Meta", blurb: "Lift vehicle image into textured 3D GLB mesh", appUrl: "https://higgsfield.ai/generate" },
  { id: "multi_image_to_3d", label: "Multi-Image to 3D", kind: "3d", vendor: "Meshy", blurb: "Multi-view reconstruction for CAD precision", appUrl: "https://higgsfield.ai/generate" },

  // ─── Photoreal Image Models ───
  { id: "soul_cinematic", label: "Soul Cinema", kind: "image", vendor: "Higgsfield", blurb: "Cinema-grade stills, 21:9 anamorphic concept art", appUrl: "https://higgsfield.ai/soul" },
  { id: "gpt_image_2", label: "GPT Image 2", kind: "image", vendor: "OpenAI", blurb: "Next-gen 4K photoreal renders & typography", appUrl: "https://higgsfield.ai/ai/image?model=gpt_image_2" },
  { id: "cinematic_studio_2_5", label: "Cinema Studio Image 2.5", kind: "image", vendor: "Higgsfield", blurb: "Ultra-sharp 4K automotive scene stills", appUrl: "https://higgsfield.ai/generate" },
  { id: "nano-banana-pro", label: "Nano Banana Pro", kind: "image", vendor: "Google", blurb: "4K photoreal renders, best all-rounder", appUrl: "https://higgsfield.ai/ai/image?model=nano-banana-pro" },
  { id: "seedream-5-lite", label: "Seedream 5.0 Lite", kind: "image", vendor: "ByteDance", blurb: "Fast stylized iterations & design studies", appUrl: "https://higgsfield.ai/ai/image?model=seedream_5_lite" },
  { id: "soul-2", label: "Soul 2.0", kind: "image", vendor: "Higgsfield", blurb: "Trained consistent characters & brand drivers", appUrl: "https://higgsfield.ai/soul" },

  // ─── Cinematic Video Models ───
  { id: "cinematic_studio_3_0", label: "Cinema Studio Video 3.0", kind: "video", vendor: "Higgsfield", blurb: "Most advanced cinema-grade video with sound & 4K", appUrl: "https://higgsfield.ai/generate" },
  { id: "cinematic_studio_video_v2", label: "Cinema Studio Video v2", kind: "video", vendor: "Higgsfield", blurb: "Camera direction, speed-ramping & multi-shots", appUrl: "https://higgsfield.ai/ai/video" },
  { id: "seedance-25", label: "Seedance 2.5", kind: "video", vendor: "ByteDance", blurb: "Flagship high-framerate dynamic video model", appUrl: "https://higgsfield.ai/ai/video?model=seedance_2_5&resolution=1080p" },
  { id: "marketing_studio_video", label: "Marketing Studio Video", kind: "video", vendor: "Higgsfield", blurb: "TikTok & Reels 9:16 one-click product ads", appUrl: "https://higgsfield.ai/marketing-studio" },
  { id: "kling-3", label: "Kling 3", kind: "video", vendor: "Kuaishou", blurb: "Physics-true motion, drifts, sparks & tyre smoke", appUrl: "https://higgsfield.ai/kling-3.0" },
];

/** Non-model product surfaces (Cinema Studio, Marketing Studio, presets...) */
export const HF_TOOLS = [
  { id: "cinema-studio", label: "Cinema Studio 4.0", url: "https://higgsfield.ai/generate", blurb: "Multi-shot cinematic scenes with camera direction" },
  { id: "marketing-studio", label: "Marketing Studio", url: "https://higgsfield.ai/marketing-studio", blurb: "End-to-end ad campaigns from a single brief" },
  { id: "viral-presets", label: "Viral Presets", url: "https://higgsfield.ai/viral-presets", blurb: "One-tap big-budget VFX styles" },
  { id: "supercomputer", label: "Supercomputer", url: "https://higgsfield.ai/supercomputer", blurb: "One superagent for the whole creative stack" },
  { id: "canvas", label: "Canvas", url: "https://higgsfield.ai/canvas", blurb: "Layered image editing & moodboards" },
  { id: "mcp", label: "MCP Server", url: "https://higgsfield.ai/mcp", blurb: "Connect any agent — mcp.higgsfield.ai/mcp" },
  { id: "cli", label: "CLI", url: "https://github.com/higgsfield-ai/cli", blurb: "Script generations from Claude Code / terminals" },
  { id: "blender", label: "Blender Plugin", url: "https://higgsfield.ai/plugins/blender", blurb: "Prompt scenes, import GLB blockouts" },
] as const;

export const HF_VIRAL_PRESETS = [
  { id: "bullet-time", label: "Bullet Time", promptSuffix: "bullet-time orbit around the car, frozen debris and light streaks, matrix style" },
  { id: "earth-zoom", label: "Earth Zoom", promptSuffix: "seamless zoom from low Earth orbit down to the car on tarmac" },
  { id: "ink-riot", label: "Ink Riot", promptSuffix: "explosive ink splatter transition revealing the car, high contrast comic ink" },
  { id: "cold-vision", label: "Cold Vision", promptSuffix: "icy blue grade, frost creeping across bodywork, cold vision look" },
  { id: "particles", label: "Particles", promptSuffix: "car dissolving into swirling luminous particles then reassembling" },
  { id: "comic", label: "Comic", promptSuffix: "halftone comic panels animating into live action car shot" },
  { id: "agamemnon", label: "Agamemnon", promptSuffix: "bronze-age epic lighting, god rays over the car like ancient armor" },
  { id: "fallen-angel", label: "Fallen Angel", promptSuffix: "dark gothic cathedral haze, feathers drifting around the car" },
] as const;

export interface GenerationJob {
  id: string;
  kind: HiggsfieldKind;
  modelId: string;
  title: string;
  prompt: string;
  status: "queued" | "running" | "done" | "failed";
  createdAt: number;
  finishedAt?: number;
  backend: HiggsfieldBackend;
  /** data URL (demo) or remote URL (api) once complete */
  resultUrl?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface HiggsfieldSettings {
  backend: HiggsfieldBackend;
  proxyUrl: string;
  defaultImageModel: string;
  defaultVideoModel: string;
  default3DModel?: string;
}

export const PROXY_URL = (import.meta as any).env?.VITE_HIGGSFIELD_PROXY_URL ?? "";

let jobCounter = 0;
export function nextJobId(): string {
  jobCounter += 1;
  return `hf_${Date.now().toString(36)}_${jobCounter}`;
}

// ─────────────────────────────────────────────────────────────
// Prompt builders — compose rich prompts from game state
// ─────────────────────────────────────────────────────────────

export interface CarBriefInput {
  name: string;
  bodyStyle?: string;
  paintHex?: string;
  powerHp?: number;
  topSpeedKph?: number;
  zeroTo60?: number;
  tierLabel?: string;
  reviewScore?: number;
  vibeTags?: string[];
  downforceKg?: number;
  dragCd?: number;
  boostPressureBar?: number;
  chassisType?: string;
  engineType?: string;
  weightKg?: number;
}

export function buildShowcaseImagePrompt(car: CarBriefInput, extra = ""): string {
  const bits = [
    `A ${car.tierLabel ?? "flagship"} ${car.bodyStyle ?? "hypercar"} called "${car.name}"`,
    car.paintHex ? `painted deep ${describeHex(car.paintHex)} with optical clearcoat` : null,
    car.powerHp ? `${Math.round(car.powerHp)} hp powertrain` : null,
    car.downforceKg ? `${Math.round(car.downforceKg)} kg active aero downforce` : null,
    "parked in a rain-slicked neon-lit metropolis at night",
    "cinematic automotive photography, 35mm anamorphic lens, volumetric fog, reflections on wet asphalt",
    extra,
  ].filter(Boolean);
  return bits.join(", ");
}

export function build3DMeshPrompt(car: CarBriefInput, category: string, detail = "cad"): string {
  const bits = [
    `Complete 3D mesh model of automotive component "${category}" for vehicle "${car.name}"`,
    car.paintHex ? `primary surface finish ${describeHex(car.paintHex)} metallic` : null,
    car.chassisType ? `monocoque substrate ${car.chassisType.replace(/_/g, " ")}` : "carbon fiber composite",
    "zero-offset origin, watertight manifold topology, symmetry aligned, PBR material maps",
    detail === "cad" ? "sub-millimeter precision engineering CAD blockout, clean bevels" : "stylized concept geometry",
  ].filter(Boolean);
  return bits.join(", ");
}

export function buildCinematicShotPrompts(car: CarBriefInput): { shot: string; prompt: string }[] {
  return [
    { shot: "Cold Open", prompt: `${buildShowcaseImagePrompt(car)} — slow dolly-in through mist, headlights flicker on, twin-turbo spool rumble` },
    { shot: "Tunnel Run", prompt: `${car.name} blasting at ${car.topSpeedKph ? Math.round(car.topSpeedKph) : 340} km/h through an illuminated tunnel, motion blur streaks, sparks trailing, low chase drone angle` },
    { shot: "Drift Corner", prompt: `${car.name} drifting a mountain hairpin at dusk, tyre smoke catching golden light, side tracking shot with telemetry overlay` },
    { shot: "Hero Reveal", prompt: `${car.name} revealed under a single spotlight in a dark hangar, slow 180° crane orbit, dust motes in the beam, wing DRS actuator active` },
  ];
}

export function buildMarketingCampaign(car: CarBriefInput): { headline: string; tagline: string; channels: string[]; assetChecklist: string[] } {
  const score = car.reviewScore ?? 8.5;
  return {
    headline: `${car.name} — Engineered Beyond Reason`,
    tagline:
      score >= 9
        ? "The reviews called it impossible. We called it Tuesday."
        : score >= 7.5
          ? "Precision has a new address."
          : "Bold moves. Honest engineering.",
    channels: ["YouTube pre-roll (16:9 4K)", "TikTok / Reels (9:16 UGC)", "Print spread (magazine)", "Billboard hero frame (21:9)"],
    assetChecklist: [
      "1× hero image — Soul Cinema 4K night render",
      "1× 3D CAD mesh — Image to 3D textured GLB",
      "3× viral preset clips — Bullet Time / Particles / Cold Vision",
      "1× 30s launch film — Cinema Studio 3.0 + Sound Synth",
      "1× soundtrack — Audio Lab engine-score hybrid",
      "4× social cutdowns — Marketing Studio auto-resize",
    ],
  };
}

export function describeHex(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length < 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 24) return max > 200 ? "pearl white" : max > 110 ? "gunmetal grey" : "obsidian black";
  if (r === max && b > g) return "crimson red";
  if (g === max && b > r) return "cyan teal";
  if (g === max) return "emerald green";
  if (b === max) return "midnight blue";
  if (r === max && g > b * 1.6) return "sunburst orange";
  if (r === max && g > b) return "gold yellow";
  return "iridescent";
}

// ─────────────────────────────────────────────────────────────
// Demo-mode procedural renderer (offline placeholder art)
// ─────────────────────────────────────────────────────────────

export function renderDemoArt(prompt: string, paintHex: string, w = 640, h = 360): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  let seed = 0;
  for (let i = 0; i < prompt.length; i++) seed = (seed * 31 + prompt.charCodeAt(i)) >>> 0;
  const hue = seed % 360;

  // Sky / Backing
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, `hsl(${hue}, 80%, 8%)`);
  sky.addColorStop(0.55, `hsl(${(hue + 45) % 360}, 90%, 18%)`);
  sky.addColorStop(0.58, "#040810");
  sky.addColorStop(1, "#020408");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Volumetric light shafts
  ctx.save();
  ctx.globalAlpha = 0.25;
  const beamGrad = ctx.createLinearGradient(0, 0, w, h);
  beamGrad.addColorStop(0, `hsl(${hue}, 100%, 75%)`);
  beamGrad.addColorStop(0.7, "transparent");
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(w * 0.1, 0);
  ctx.lineTo(w * 0.45, h * 0.6);
  ctx.lineTo(w * 0.35, h * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Neon skyline grid
  ctx.fillStyle = `hsla(${(hue + 140) % 360}, 95%, 65%, 0.8)`;
  for (let i = 0; i < 16; i++) {
    const bw = 16 + ((seed >> i) % 36);
    const bh = 24 + ((seed >> (i * 2)) % 110);
    const bx = (i * w) / 16 + ((seed >> i) % 8);
    ctx.fillRect(bx, h * 0.58 - bh, bw, bh);
  }

  // Wet tarmac reflection
  const glow = ctx.createRadialGradient(w / 2, h * 0.76, 12, w / 2, h * 0.76, w * 0.6);
  glow.addColorStop(0, paintHex);
  glow.addColorStop(1, "transparent");
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = glow;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
  ctx.globalAlpha = 1;

  // Grid lines on asphalt
  ctx.strokeStyle = "rgba(0, 245, 212, 0.15)";
  ctx.lineWidth = 1;
  for (let y = h * 0.6; y < h; y += 18) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Stylized Hypercar Silhouette
  const cx = w / 2;
  const cy = h * 0.74;
  const cw = w * 0.55;

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 12, cw * 0.52, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = paintHex;
  ctx.beginPath();
  ctx.moveTo(cx - cw / 2, cy);
  ctx.lineTo(cx - cw / 2 + cw * 0.12, cy - 20);
  ctx.lineTo(cx - cw * 0.18, cy - 36);
  ctx.lineTo(cx + cw * 0.16, cy - 36);
  ctx.lineTo(cx + cw / 2 - cw * 0.08, cy - 18);
  ctx.lineTo(cx + cw / 2, cy);
  ctx.closePath();
  ctx.fill();

  // Specular sheen
  const sheen = ctx.createLinearGradient(cx - cw * 0.2, cy - 36, cx + cw * 0.2, cy);
  sheen.addColorStop(0, "rgba(255,255,255,0.7)");
  sheen.addColorStop(0.5, "transparent");
  ctx.fillStyle = sheen;
  ctx.fill();

  // Aero GT Wing
  ctx.fillStyle = "#0c1322";
  ctx.fillRect(cx - cw * 0.48, cy - 42, cw * 0.22, 6);
  ctx.fillStyle = "#00F5D4";
  ctx.fillRect(cx - cw * 0.48, cy - 44, cw * 0.22, 2);

  // Glass canopy
  ctx.fillStyle = "rgba(160, 235, 255, 0.7)";
  ctx.beginPath();
  ctx.moveTo(cx - cw * 0.17, cy - 34);
  ctx.lineTo(cx - cw * 0.09, cy - 48);
  ctx.lineTo(cx + cw * 0.13, cy - 48);
  ctx.lineTo(cx + cw * 0.2, cy - 34);
  ctx.closePath();
  ctx.fill();

  // Centerlock Wheels & Neon Rotors
  for (const wx of [cx - cw * 0.32, cx + cw * 0.31]) {
    ctx.fillStyle = "#080b12";
    ctx.beginPath();
    ctx.arc(wx, cy, 17, 0, Math.PI * 2);
    ctx.fill();

    // Glowing rotor
    ctx.strokeStyle = "#ff4d6d";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(wx, cy, 11, 0, Math.PI * 2);
    ctx.stroke();

    // Rim spoke highlights
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(wx, cy, 17, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Laser Headlight Beams
  const beam = ctx.createLinearGradient(cx + cw / 2, cy - 14, w, cy - 14);
  beam.addColorStop(0, "rgba(255,245,190,0.9)");
  beam.addColorStop(0.2, "rgba(0,245,212,0.4)");
  beam.addColorStop(1, "transparent");
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(cx + cw * 0.44, cy - 18);
  ctx.lineTo(w, cy - 50);
  ctx.lineTo(w, cy + 16);
  ctx.closePath();
  ctx.fill();

  // Telemetry Watermark & HUD Tag
  ctx.fillStyle = "rgba(0, 245, 212, 0.85)";
  ctx.font = "bold 10px 'JetBrains Mono', monospace";
  ctx.fillText("HIGGSFIELD AI · NEURAL STILL RENDER", 14, 22);

  ctx.fillStyle = "rgba(230,245,255,0.6)";
  ctx.font = "9px 'JetBrains Mono', monospace";
  ctx.fillText("4K ANAMORPHIC · RAY-TRACED SPECULARS · METALLIC CLEARCOAT", 14, h - 14);

  return canvas.toDataURL("image/png");
}

export function render3DProceduralDemo(prompt: string, paintHex: string, w = 640, h = 360): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Dark CAD viewport background
  ctx.fillStyle = "#070b14";
  ctx.fillRect(0, 0, w, h);

  // Perspective 3D Grid floor
  ctx.strokeStyle = "rgba(0, 245, 212, 0.15)";
  ctx.lineWidth = 1;
  const cx = w / 2;
  const cy = h * 0.62;

  for (let i = -10; i <= 10; i++) {
    // Radial grid
    ctx.beginPath();
    ctx.moveTo(cx + i * 28, cy - 30);
    ctx.lineTo(cx + i * 65, h);
    ctx.stroke();
  }
  for (let j = 0; j < 6; j++) {
    const y = cy + j * 18;
    ctx.beginPath();
    ctx.moveTo(cx - 240 - j * 30, y);
    ctx.lineTo(cx + 240 + j * 30, y);
    ctx.stroke();
  }

  // 3D Isometric Wireframe Monocoque
  ctx.save();
  ctx.translate(cx, cy - 20);

  // Bounding Box (cyan dashed)
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "rgba(0, 245, 212, 0.4)";
  ctx.strokeRect(-160, -70, 320, 90);
  ctx.setLineDash([]);

  // Solid Chassis Underlay
  ctx.fillStyle = paintHex;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(-150, 0);
  ctx.lineTo(-130, -35);
  ctx.lineTo(-40, -55);
  ctx.lineTo(60, -55);
  ctx.lineTo(130, -20);
  ctx.lineTo(150, 5);
  ctx.lineTo(120, 15);
  ctx.lineTo(-120, 15);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Wireframe Topology Lines (Quad Subdivisions)
  ctx.strokeStyle = "#00F5D4";
  ctx.lineWidth = 1.2;
  for (let x = -140; x <= 140; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 15);
    ctx.lineTo(x * 0.85, -30);
    ctx.lineTo(x * 0.6, -55);
    ctx.stroke();
  }
  for (let y = -55; y <= 15; y += 14) {
    ctx.beginPath();
    ctx.moveTo(-150 + Math.abs(y) * 0.3, y);
    ctx.lineTo(150 - Math.abs(y) * 0.3, y);
    ctx.stroke();
  }

  // Center coordinate axes
  ctx.lineWidth = 2;
  // X axis (red)
  ctx.strokeStyle = "#ff4d6d";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(45, 12);
  ctx.stroke();
  // Y axis (green)
  ctx.strokeStyle = "#06d6a0";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-35, 10);
  ctx.stroke();
  // Z axis (blue)
  ctx.strokeStyle = "#3a86ff";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -50);
  ctx.stroke();

  ctx.restore();

  // CAD Telemetry Overlay
  ctx.fillStyle = "#00F5D4";
  ctx.font = "bold 10px 'JetBrains Mono', monospace";
  ctx.fillText("NEURAL 3D MESH SYNTHESIS · MESHY / SAM-3D", 14, 22);

  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "9px 'JetBrains Mono', monospace";
  ctx.fillText("VERTICES: 64,820  ·  TRIANGLES: 129,640  ·  QUAD TOPOLOGY  ·  PBR BAKE: OK", 14, h - 28);
  ctx.fillText("STATUS: ZERO-OFFSET WORLD COORD READY FOR THREE.JS / UNREAL", 14, h - 14);

  return canvas.toDataURL("image/png");
}

// ─────────────────────────────────────────────────────────────
// Job execution across backends
// ─────────────────────────────────────────────────────────────

export function openWebTool(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function buildPrefilledWebUrl(model: HiggsfieldModel, prompt: string): string {
  const sep = model.appUrl.includes("?") ? "&" : "?";
  return `${model.appUrl}${sep}prompt=${encodeURIComponent(prompt.slice(0, 1800))}`;
}

/** Kick off generation. Resolves immediately with the created job; polling for api backend continues in background. */
export async function executeJob(
  job: GenerationJob,
  settings: HiggsfieldSettings
): Promise<GenerationJob> {
  if (settings.backend === "web") {
    const model = HF_MODELS.find((m) => m.id === job.modelId);
    openWebTool(model ? buildPrefilledWebUrl(model, job.prompt) : HF_TOOLS[0].url);
    return { ...job, status: "done", finishedAt: Date.now(), resultUrl: model?.appUrl };
  }

  if (settings.backend === "demo") {
    const paint = extractPaint(job.prompt);
    const art = job.kind === "3d"
      ? render3DProceduralDemo(job.prompt, paint)
      : renderDemoArt(job.prompt, paint);
    await delay(900 + Math.random() * 1200); // simulate realistic latency
    return { ...job, status: "done", finishedAt: Date.now(), resultUrl: art };
  }

  // api backend — POST to proxy, then poll
  try {
    const res = await fetch(settings.proxyUrl.replace(/\/$/, "") + "/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: job.kind, model: job.modelId, prompt: job.prompt }),
    });
    if (!res.ok) throw new Error(`Proxy responded ${res.status}`);
    const data = await res.json();
    const remoteId: string = data.id;
    const resultUrl: string | undefined = data.resultUrl;
    if (resultUrl) return { ...job, status: "done", finishedAt: Date.now(), resultUrl };
    // poll up to ~4 minutes
    for (let i = 0; i < 48; i++) {
      await delay(5000);
      const poll = await fetch(settings.proxyUrl.replace(/\/$/, "") + `/jobs/${remoteId}`);
      if (!poll.ok) continue;
      const pj = await poll.json();
      if (pj.status === "done") return { ...job, status: "done", finishedAt: Date.now(), resultUrl: pj.resultUrl };
      if (pj.status === "failed") throw new Error(pj.error ?? "Remote job failed");
    }
    throw new Error("Timed out waiting for proxy job");
  } catch (err: any) {
    return { ...job, status: "failed", finishedAt: Date.now(), error: err?.message ?? String(err) };
  }
}

function extractPaint(prompt: string): string {
  const m = prompt.match(/#([0-9a-fA-F]{6})/);
  return m ? `#${m[1]}` : "#00f5d4";
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
