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

export type HiggsfieldKind = "image" | "video" | "audio" | "campaign" | "batch" | "scene";

export interface HiggsfieldModel {
  id: string;
  label: string;
  kind: Extract<HiggsfieldKind, "image" | "video">;
  vendor: string;
  blurb: string;
  /** Higgsfield web-app deep link used by the "web" backend */
  appUrl: string;
}

export const HF_MODELS: HiggsfieldModel[] = [
  { id: "nano-banana-pro", label: "Nano Banana Pro", kind: "image", vendor: "Google", blurb: "4K photoreal renders, best all-rounder", appUrl: "https://higgsfield.ai/ai/image?model=nano-banana-pro" },
  { id: "gpt-image-2", label: "GPT Image 2", kind: "image", vendor: "OpenAI", blurb: "Prompt-faithful concept art & infographics", appUrl: "https://higgsfield.ai/ai/image?model=gpt_image_2" },
  { id: "seedream-5-lite", label: "Seedream 5.0 Lite", kind: "image", vendor: "ByteDance", blurb: "Fast stylized iterations", appUrl: "https://higgsfield.ai/ai/image?model=seedream_5_lite" },
  { id: "soul-2", label: "Soul 2.0", kind: "image", vendor: "Higgsfield", blurb: "Trained consistent characters / brand faces", appUrl: "https://higgsfield.ai/soul" },
  { id: "seedance-25", label: "Seedance 2.5", kind: "video", vendor: "ByteDance", blurb: "Flagship cinematic video model", appUrl: "https://higgsfield.ai/ai/video?model=seedance_2_5&resolution=1080p" },
  { id: "seedance-20", label: "Seedance 2.0", kind: "video", vendor: "ByteDance", blurb: "High-quality fast cuts", appUrl: "https://higgsfield.ai/ai/video?model=seedance_2_0" },
  { id: "kling-3", label: "Kling 3", kind: "video", vendor: "Kuaishou", blurb: "Physics-true motion, drifts & smoke", appUrl: "https://higgsfield.ai/kling-3.0" },
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
}

export interface HiggsfieldSettings {
  backend: HiggsfieldBackend;
  proxyUrl: string;
  defaultImageModel: string;
  defaultVideoModel: string;
}

const PROXY_URL = (import.meta as any).env?.VITE_HIGGSFIELD_PROXY_URL ?? "";

let jobCounter = 0;
function nextJobId(): string {
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
}

export function buildShowcaseImagePrompt(car: CarBriefInput, extra = ""): string {
  const bits = [
    `A ${car.tierLabel ?? "flagship"} ${car.bodyStyle ?? "sports coupé"} called "${car.name}"`,
    car.paintHex ? `painted deep ${describeHex(car.paintHex)}` : null,
    car.powerHp ? `${Math.round(car.powerHp)} hp` : null,
    "parked in a rain-slicked neon-lit metropolis at night",
    "cinematic automotive photography, 35mm anamorphic lens, volumetric fog, reflections on wet asphalt",
    extra,
  ].filter(Boolean);
  return bits.join(", ");
}

export function buildCinematicShotPrompts(car: CarBriefInput): { shot: string; prompt: string }[] {
  return [
    { shot: "Cold Open", prompt: `${buildShowcaseImagePrompt(car)} — slow dolly-in through mist, headlights flicker on, engine start rumble` },
    { shot: "Tunnel Run", prompt: `${car.name} blasting through an illuminated tunnel, motion blur streaks, sparks trailing, low chase drone angle` },
    { shot: "Drift Corner", prompt: `${car.name} drifting a mountain hairpin at dusk, tyre smoke catching golden light, side tracking shot` },
    { shot: "Hero Reveal", prompt: `${car.name} revealed under a single spotlight in a dark hangar, slow 180° crane orbit, dust motes in the beam` },
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
    channels: ["YouTube pre-roll (16:9)", "TikTok / Reels (9:16 UGC)", "Print spread (magazine)", "Billboard hero frame"],
    assetChecklist: [
      "1× hero image — Nano Banana Pro night render",
      "3× viral preset clips — Bullet Time / Particles / Cold Vision",
      "1× 30s launch film — Cinema Studio + Seedance 2.5",
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

  // Sky gradient keyed to prompt hash
  let seed = 0;
  for (let i = 0; i < prompt.length; i++) seed = (seed * 31 + prompt.charCodeAt(i)) >>> 0;
  const hue = seed % 360;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, `hsl(${hue}, 70%, 12%)`);
  sky.addColorStop(0.62, `hsl(${(hue + 40) % 360}, 85%, 22%)`);
  sky.addColorStop(0.63, "#05070d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Neon skyline
  ctx.fillStyle = `hsla(${(hue + 120) % 360}, 90%, 60%, 0.75)`;
  for (let i = 0; i < 14; i++) {
    const bw = 18 + ((seed >> i) % 40);
    const bh = 30 + ((seed >> (i * 2)) % 90);
    const bx = (i * w) / 14 + ((seed >> i) % 10);
    ctx.fillRect(bx, h * 0.63 - bh, bw, bh);
  }

  // Ground glow + reflection
  const glow = ctx.createRadialGradient(w / 2, h * 0.78, 8, w / 2, h * 0.78, w * 0.55);
  glow.addColorStop(0, paintHex);
  glow.addColorStop(1, "transparent");
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = glow;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
  ctx.globalAlpha = 1;

  // Stylized car silhouette
  const cx = w / 2;
  const cy = h * 0.74;
  const cw = w * 0.52;
  ctx.fillStyle = paintHex;
  ctx.beginPath();
  ctx.moveTo(cx - cw / 2, cy);
  ctx.lineTo(cx - cw / 2 + cw * 0.12, cy - 18);
  ctx.lineTo(cx - cw * 0.18, cy - 34);
  ctx.lineTo(cx + cw * 0.16, cy - 34);
  ctx.lineTo(cx + cw / 2 - cw * 0.1, cy - 16);
  ctx.lineTo(cx + cw / 2, cy);
  ctx.closePath();
  ctx.fill();
  // canopy
  ctx.fillStyle = "rgba(140, 220, 255, 0.55)";
  ctx.beginPath();
  ctx.moveTo(cx - cw * 0.17, cy - 32);
  ctx.lineTo(cx - cw * 0.1, cy - 46);
  ctx.lineTo(cx + cw * 0.13, cy - 46);
  ctx.lineTo(cx + cw * 0.19, cy - 32);
  ctx.closePath();
  ctx.fill();
  // wheels
  ctx.fillStyle = "#0b0e15";
  for (const wx of [cx - cw * 0.3, cx + cw * 0.3]) {
    ctx.beginPath();
    ctx.arc(wx, cy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(160,200,255,.7)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  // headlight beams
  const beam = ctx.createLinearGradient(cx + cw / 2, cy - 12, w, cy - 12);
  beam.addColorStop(0, "rgba(255,240,190,.8)");
  beam.addColorStop(1, "transparent");
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(cx + cw * 0.42, cy - 16);
  ctx.lineTo(w, cy - 44);
  ctx.lineTo(w, cy + 8);
  ctx.closePath();
  ctx.fill();

  // Watermark
  ctx.fillStyle = "rgba(230,245,255,.65)";
  ctx.font = "600 11px 'JetBrains Mono', monospace";
  ctx.fillText("DEMO RENDER — connect a backend for real output", 12, h - 12);

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
    const art = renderDemoArt(job.prompt, extractPaint(job.prompt));
    await delay(900 + Math.random() * 1200); // simulate latency
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
  return m ? `#${m[1]}` : "#fbbf24";
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
