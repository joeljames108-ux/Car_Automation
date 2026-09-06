import React, { useMemo, useState } from "react";
import {
  Sparkles,
  ImageIcon,
  Clapperboard,
  Music4,
  Megaphone,
  Cpu,
  Plug,
  Wand2,
  Copy,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  Layers3,
  Film,
  Orbit,
  Box,
  Maximize2,
  Download,
  Flame,
  Gauge,
  Wind,
  Compass,
  Check,
  X,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHiggsfieldGlobe, angularDistanceDeg, type GlobeTabDef } from "./NeonHiggsfieldGlobe";
import { playHologramScanSound } from "../interactive/NeonHorizonSoundEngine";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { useDesign } from "../../../state/DesignContext";
import { useCompany } from "../../../state/CompanyContext";
import { useHiggsfieldStore } from "../../../state/useHiggsfieldStore";
import {
  CarBriefInput,
  HF_MODELS,
  HF_TOOLS,
  HF_VIRAL_PRESETS,
  GenerationJob,
  HiggsfieldKind,
  buildCinematicShotPrompts,
  buildMarketingCampaign,
  buildShowcaseImagePrompt,
  build3DMeshPrompt,
  openWebTool,
} from "../../../lib/higgsfield";

type StudioTab = "image" | "cinema" | "mesh3d" | "audio" | "marketing" | "batch" | "connect";

const TABS: (GlobeTabDef & { id: StudioTab })[] = [
  {
    id: "image",
    label: "Image Lab",
    icon: <ImageIcon size={13} />,
    lat: 0,
    lng: 0,
    hue: 199,
    description: "Neural Diffusion & Photoreal AI Studio Stills",
    cardinal: "0°N, 0°E · PRIME FRONT",
    side: "top-left",
  },
  {
    id: "cinema",
    label: "Cinema 4K",
    icon: <Clapperboard size={13} />,
    lat: 0,
    lng: 60,
    hue: 265,
    description: "Cinematic Video, Speedramps & Camera Direction",
    cardinal: "0°N, +60°E · EAST FLANK",
    side: "right",
  },
  {
    id: "mesh3d",
    label: "3D Mesh Lab",
    icon: <Box size={13} />,
    lat: 0,
    lng: 120,
    hue: 170,
    description: "Neural 3D GLB Synthesis & Mesh Lifting",
    cardinal: "0°N, +120°E · NORTHEAST ORBIT",
    side: "top-right",
  },
  {
    id: "audio",
    label: "Audio Synth",
    icon: <Music4 size={13} />,
    lat: 0,
    lng: 180,
    hue: 155,
    description: "Exhaust Harmonics & Dynamic Soundtracks",
    cardinal: "0°N, 180°W · BACK ANTIPODE",
    side: "top-right",
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: <Megaphone size={13} />,
    lat: 0,
    lng: -90,
    hue: 45,
    description: "Viral Campaigns & Launch Press Assets",
    cardinal: "0°N, -90°W · WEST FLANK",
    side: "left",
  },
  {
    id: "batch",
    label: "Supercomputer",
    icon: <Cpu size={13} />,
    lat: 60,
    lng: 0,
    hue: 350,
    description: "Multi-GPU Distributed Neural Batch Processing",
    cardinal: "+60°N, 0°E · NORTH POLE",
    side: "top",
  },
  {
    id: "connect",
    label: "Neural Connect",
    icon: <Plug size={13} />,
    lat: -60,
    lng: 0,
    hue: 185,
    description: "MCP Diagnostics & Engine Bridge",
    cardinal: "-60°S, 0°E · SOUTH POLE",
    side: "bottom",
  },
];

const IMAGE_STYLES = [
  { id: "night-city", label: "Neon Night City", suffix: "rain-slicked neon metropolis at night, volumetric fog, reflections on wet asphalt" },
  { id: "studio", label: "Studio Spotlight", suffix: "monolithic black studio, single overhead spotlight, glossy floor reflection, high-end product photography" },
  { id: "alpine", label: "Alpine Dawn", suffix: "mountain pass at golden-hour dawn, valley mist, long cinematic shadows" },
  { id: "track", label: "Race Track Panning", suffix: "high-speed panning shot on a race circuit, heat haze, motion-blurred armco barriers" },
  { id: "wind-tunnel", label: "Wind Tunnel Smoke", suffix: "wind tunnel aerodynamic testing, fluorescent smoke streamlines, carbon fiber reflections" },
  { id: "cyberpunk", label: "Cyberpunk Dyno Bay", suffix: "underground cyberpunk dyno test cell, holographic telemetry overlays, teal and magenta rim light" },
] as const;

const CAMERA_MOTIONS = [
  { id: "fpv-drone", label: "FPV Chase Drone", desc: "Low-altitude aggressive pursuit, camera banking into apex" },
  { id: "crane-orbit", label: "360° Crane Orbit", desc: "Smooth sweeping orbit around the entire vehicle silhouette" },
  { id: "bullet-time", label: "Frozen Bullet Time", desc: "Time-frozen camera rotational sweep with floating sparks" },
  { id: "cockpit-pov", label: "Cockpit Driver POV", desc: "High-G violent vibration inside helmet, steering telemetry" },
  { id: "dolly-track", label: "Telephoto Dolly", desc: "Compressed background perspective, lens blur tracking car" },
] as const;

const SPEED_RAMPS = [
  { id: "auto", label: "Auto Pace" },
  { id: "slowmo", label: "Apex Slow-Mo" },
  { id: "speedup", label: "Hyperspeed Blur" },
  { id: "impact", label: "Impact Snip" },
] as const;

const MESH_CATEGORIES = [
  { id: "monocoque", label: "Complete Hypercar Body", icon: "🏎️", blurb: "Watertight aerodynamic bodywork with diffuser & active wing" },
  { id: "wing", label: "Active Rear Aero Wing", icon: "🪽", blurb: "Swan-neck carbon fiber GT3 wing with DRS pitch actuator" },
  { id: "engine", label: "Twin-Turbo V8 Block", icon: "⚙️", blurb: "4.0L hot-V twin-turbo block with pie-weld exhaust runners" },
  { id: "gearbox", label: "Sequential 6-Speed", icon: "🕹️", blurb: "Transverse sequential magnesium casing with gear cluster" },
  { id: "wheel", label: "Centerlock Magnesium Wheel", icon: "🛞", blurb: "Forged monoblock rim with aero turbine vanes & carbon rotor" },
  { id: "suspension", label: "Pushrod Inboard Damper", icon: "🔬", blurb: "Billet aluminum rocker arm with visible remote-reservoir coilover" },
] as const;

const MUSIC_VIBES = [
  { id: "synthwave", label: "Synthwave Drive", desc: "retro arpeggios, gated reverb drums, 100 BPM night-drive energy" },
  { id: "orchestral", label: "Epic Orchestral", desc: "brass swells, taiko hits, rising ostinato for launch films" },
  { id: "industrial", label: "Industrial Pulse", desc: "metallic percussion layered with real engine samples, aggressive tension" },
  { id: "ambient", label: "Showroom Ambient", desc: "glass pads, sparse piano, luxury showroom calm" },
] as const;

function useCarBrief(): CarBriefInput {
  const { design, sim } = useDesign();
  return useMemo(() => {
    const vehicle: any = (design as any)?.vehicle ?? {};
    const aero: any = (design as any)?.aero ?? {};
    const engine: any = (design as any)?.engine ?? {};

    return {
      name: (design as any)?.name ?? "Apex Prototype",
      bodyStyle: typeof vehicle.bodyType === "string" ? String(vehicle.bodyType).replace(/_/g, " ") : "Hypercar",
      powerHp: (sim as any)?.peakPower ?? 850,
      topSpeedKph: (sim as any)?.topSpeed ?? 365,
      zeroTo60: (sim as any)?.accel0_60 ?? 2.4,
      downforceKg: (aero as any)?.rearDownforce ?? 420,
      dragCd: (aero as any)?.dragCoefficient ?? 0.31,
      boostPressureBar: (engine as any)?.boostPressure ?? 2.2,
      chassisType: vehicle.chassis ?? "Carbon Monocoque",
      paintHex: (design as any)?.paintColor ?? "#00F5D4",
    };
  }, [design, sim]);
}

// ─────────────────────────────────────────────────────────────
// Telemetry Ribbon: Apex Pulse Injection
// ─────────────────────────────────────────────────────────────

interface ApexPulseRibbonProps {
  brief: CarBriefInput;
  onInject: (snippet: string) => void;
  onApplyPreset?: (prompt: string) => void;
}

function ApexPulseRibbon({ brief, onInject, onApplyPreset }: ApexPulseRibbonProps) {
  const [pulse, setPulse] = useState(false);

  const handleInject = () => {
    playHMIClickSound();
    setPulse(true);
    setTimeout(() => setPulse(false), 800);

    const snippet = `[Apex Telemetry: ${brief.name}, ${Math.round(brief.powerHp ?? 800)} HP, Top Speed ${Math.round(
      brief.topSpeedKph ?? 350
    )} km/h, 0-60 in ${brief.zeroTo60?.toFixed(1) ?? "2.5"}s, Downforce ${Math.round(
      brief.downforceKg ?? 400
    )} kg, Boost ${(brief.boostPressureBar ?? 2.0).toFixed(1)} bar, Chassis: ${brief.chassisType}]`;

    onInject(snippet);
  };

  const presets = [
    { label: "🌧️ Nürburgring Rain Attack", text: `${brief.name} attacking the Nürburgring carousel in heavy rain, water spray rooster tails, glowing red carbon ceramic brake rotors, motion blur, 8K ray-traced` },
    { label: "⚡ Cyberpunk Dyno Cell", text: `${brief.name} strapped to an all-wheel-drive dyno cell, glowing turbochargers cherry red, holographic telemetry graphs projected in mist, cyan & magenta rim lighting` },
    { label: "💨 Wind Tunnel Stream", text: `${brief.name} undergoing aerodynamic testing in high-speed wind tunnel, laser sheet particle velocimetry, fluorescent smoke curling over active rear wing, 4K CAD precision` },
    { label: "🌅 Monaco GP Dusk", text: `${brief.name} parked on the Casino Square straight at golden dusk, Mediterranean yachts in background, warm sunset reflections on metallic clearcoat paint` },
    { label: "💥 Exploded Powertrain", text: `Exploded isometric holographic CAD cutaway of ${brief.name} showing internal Twin-Turbo V8, titanium pistons, 6-speed sequential gearbox, glowing neon circuit paths, blueprint matrix` },
  ];

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 p-3 bg-gradient-to-r from-zinc-950/90 via-black/80 to-zinc-950/90 backdrop-blur-xl ${
        pulse ? "border-[#00F5D4] shadow-[0_0_25px_rgba(0,245,212,0.35)]" : "border-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between flex-wrap gap-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-white font-mono">
            <Flame size={14} className="text-[#FFB703] animate-pulse" />
            Apex Pulse Telemetry Bridge
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[9px] font-mono text-[#00F5D4] font-bold">
            LIVE SYNC
          </span>
        </div>

        <button
          onClick={handleInject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00F5D4]/15 hover:bg-[#00F5D4]/25 border border-[#00F5D4]/40 text-[#00F5D4] text-xs font-mono font-bold tracking-wider transition-all duration-150 active:scale-[0.97] shadow-[0_0_12px_rgba(0,245,212,0.2)] cursor-pointer"
        >
          <Zap size={12} className={pulse ? "animate-bounce text-white" : ""} />
          Inject Telemetry into Prompt
        </button>
      </div>

      {/* Vehicle Live Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-2.5">
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-[9px] font-mono text-zinc-400">VEHICLE</span>
          <span className="text-xs font-black text-white truncate font-sans">{brief.name}</span>
        </div>
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-[9px] font-mono text-zinc-400">HORSEPOWER</span>
          <span className="text-xs font-black text-[#FFB703] font-mono">{Math.round(brief.powerHp ?? 800)} HP</span>
        </div>
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-[9px] font-mono text-zinc-400">TOP SPEED</span>
          <span className="text-xs font-black text-[#00F5D4] font-mono">{Math.round(brief.topSpeedKph ?? 350)} km/h</span>
        </div>
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-[9px] font-mono text-zinc-400">0-60 MPH</span>
          <span className="text-xs font-black text-emerald-400 font-mono">{brief.zeroTo60?.toFixed(1) ?? "2.4"} s</span>
        </div>
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-[9px] font-mono text-zinc-400">AERO DOWNFORCE</span>
          <span className="text-xs font-black text-sky-400 font-mono">{Math.round(brief.downforceKg ?? 420)} kg</span>
        </div>
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
          <span className="text-[9px] font-mono text-zinc-400">PAINT FINISH</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
              style={{ backgroundColor: brief.paintHex ?? "#00F5D4" }}
            />
            <span className="text-[10px] font-mono text-zinc-200 uppercase">{brief.paintHex ?? "#00F5D4"}</span>
          </div>
        </div>
      </div>

      {/* Quick Prompt Presets */}
      {onApplyPreset && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-white/5">
          <span className="text-[9px] font-mono text-zinc-500 shrink-0 uppercase tracking-widest mr-1">PRESETS:</span>
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                playHMIClickSound();
                onApplyPreset(p.text);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] border border-white/8 hover:border-white/20 text-[10px] text-zinc-300 hover:text-white font-sans whitespace-nowrap transition-all duration-150 active:scale-[0.97] cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Interactive Full-Screen Media Lightbox Modal
// ─────────────────────────────────────────────────────────────

interface MediaLightboxModalProps {
  job: GenerationJob | null;
  onClose: () => void;
  onRemix?: (prompt: string) => void;
}

function MediaLightboxModal({ job, onClose, onRemix }: MediaLightboxModalProps) {
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(job.prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-nh-materialize"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl border border-white/20 bg-zinc-950/95 shadow-[0_20px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
              {job.kind === "3d" ? <Box size={18} /> : job.kind === "video" ? <Film size={18} /> : <ImageIcon size={18} />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-wide">{job.title}</h3>
              <p className="text-[10px] font-mono text-zinc-400">
                MODEL: <span className="text-[#00F5D4] uppercase">{job.modelId}</span> · {new Date(job.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all active:scale-[0.95]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Media Preview Stage */}
        <div className="relative flex-1 min-h-[340px] max-h-[58vh] bg-black/80 flex items-center justify-center overflow-hidden p-3">
          {job.resultUrl && job.status === "done" ? (
            <img src={job.resultUrl} alt={job.title} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#00F5D4]" />
              <span className="text-xs font-mono text-zinc-400 tracking-wider uppercase">SYNTHESIZING NEURAL ASSET…</span>
            </div>
          )}

          <div className="absolute top-5 right-5 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/70 border border-white/15 text-[10px] font-mono font-bold uppercase text-[#00F5D4] backdrop-blur-md">
              KIND: {job.kind.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Modal Footer & Prompt Inspection */}
        <div className="p-6 border-t border-white/10 bg-zinc-950 flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">GENERATIVE PROMPT INJECTION</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-mono text-[#00F5D4] hover:underline cursor-pointer"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "COPIED" : "COPY PROMPT"}
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-black/60 border border-white/8 text-xs font-mono text-zinc-200 leading-relaxed max-h-24 overflow-y-auto scrollbar-thin">
              {job.prompt}
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {job.resultUrl && (
                <a
                  href={job.resultUrl}
                  download={`higgsfield_${job.modelId}_${job.id}.png`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold font-mono tracking-wider transition-all active:scale-[0.97]"
                >
                  <Download size={13} />
                  Download Asset
                </a>
              )}
            </div>

            {onRemix && (
              <button
                onClick={() => {
                  onRemix(job.prompt);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00F5D4]/20 hover:bg-[#00F5D4]/30 border border-[#00F5D4]/40 text-[#00F5D4] text-xs font-bold font-mono tracking-wider transition-all active:scale-[0.97]"
              >
                <Wand2 size={13} />
                Load Prompt into Studio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared Job Card & Prompt Box
// ─────────────────────────────────────────────────────────────

function JobCard({ job, onInspect }: { job: GenerationJob; onInspect: (j: GenerationJob) => void }) {
  const statusIcon =
    job.status === "running" ? (
      <Loader2 size={12} className="animate-spin text-amber-300" />
    ) : job.status === "done" ? (
      <CheckCircle2 size={12} className="text-emerald-300" />
    ) : (
      <XCircle size={12} className="text-rose-300" />
    );

  return (
    <div
      onClick={() => onInspect(job)}
      className="group rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden shadow-lg transition-all duration-200 hover:border-[#00F5D4]/40 hover:shadow-[0_8px_25px_rgba(0,245,212,0.15)] cursor-pointer active:scale-[0.98]"
    >
      <div className="aspect-video bg-zinc-950/90 relative flex items-center justify-center overflow-hidden">
        {job.resultUrl && job.status === "done" ? (
          <img
            src={job.resultUrl}
            alt={job.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            {job.status === "running" ? "synthesizing…" : job.error ?? "no preview"}
          </span>
        )}

        <span className="absolute top-2 left-2 p-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10">
          {statusIcon}
        </span>

        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 border border-white/10 text-[9px] font-mono uppercase text-[#00F5D4]">
          {job.modelId}
        </span>

        <span className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 size={11} />
        </span>
      </div>

      <div className="px-3.5 py-3">
        <p className="text-xs font-bold text-white truncate font-sans group-hover:text-[#00F5D4] transition-colors">
          {job.title}
        </p>
        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 font-mono">{job.prompt}</p>
      </div>
    </div>
  );
}

function PromptBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const chars = value.length;
  const isLong = chars > 600;

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-2xl bg-black/60 border border-white/10 focus:border-[#00F5D4]/60 focus:shadow-[0_0_20px_rgba(0,245,212,0.2)] outline-none px-4 py-3 text-xs leading-relaxed text-white font-mono resize-none transition-all placeholder:text-zinc-600"
        spellCheck={false}
      />
      <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 pointer-events-none">
        <span className={isLong ? "text-amber-400" : ""}>{chars}</span>
        <span>/ 1200</span>
      </div>
    </div>
  );
}

function Gallery({ onInspect }: { onInspect: (j: GenerationJob) => void }) {
  const jobs = useHiggsfieldStore((s) => s.jobs);
  const history = useHiggsfieldStore((s) => s.history);
  const clearHistory = useHiggsfieldStore((s) => s.clearHistory);
  const activeFilter = useHiggsfieldStore((s) => s.activeFilter);
  const setActiveFilter = useHiggsfieldStore((s) => s.setActiveFilter);

  const allItems = [...jobs, ...history];
  const filtered = allItems.filter((j) => (activeFilter === "all" ? true : j.kind === activeFilter));
  const shown = filtered.slice(0, 18);

  const filters: { id: "all" | HiggsfieldKind; label: string }[] = [
    { id: "all", label: "All Formats" },
    { id: "3d", label: "3D Meshes" },
    { id: "image", label: "Stills" },
    { id: "video", label: "Videos" },
    { id: "audio", label: "Audio" },
  ];

  return (
    <NeonHorizonGlassPanel
      variant="secondary"
      header={{
        icon: <Layers3 size={14} />,
        title: "Render Queue & Neural Asset Gallery",
        subtitle: `${jobs.filter((j) => j.status === "running").length} active synthesizing · ${history.length} archived`,
        actions: (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    activeFilter === f.id
                      ? "bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/40"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <NeonHorizonButton variant="ghost" size="xs" icon={<Trash2 size={11} />} onClick={clearHistory}>
              Clear
            </NeonHorizonButton>
          </div>
        ),
      }}
    >
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 min-h-[140px]">
        {shown.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
            <p className="text-xs text-zinc-400 font-sans">No generations yet for this filter.</p>
            <p className="text-[10px] text-zinc-600 font-mono mt-1">Compose a prompt in any tab above and click Synthesize.</p>
          </div>
        )}
        {shown.map((j) => (
          <JobCard key={j.id} job={j} onInspect={onInspect} />
        ))}
      </div>
    </NeonHorizonGlassPanel>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: 3D Mesh Lab (NEW)
// ─────────────────────────────────────────────────────────────

function Mesh3DTab({ onInspect }: { onInspect: (j: GenerationJob) => void }) {
  const brief = useCarBrief();
  const submitJob = useHiggsfieldStore((s) => s.submitJob);
  const default3DModel = useHiggsfieldStore((s) => s.default3DModel);

  const [modelId, setModelId] = useState(default3DModel || "image_to_3d");
  const [categoryId, setCategoryId] = useState<string>(MESH_CATEGORIES[0].id);
  const [topology, setTopology] = useState<"quad" | "triangle">("quad");
  const [polycount, setPolycount] = useState(65000);
  const [enablePbr, setEnablePbr] = useState(true);
  const [promptOverride, setPromptOverride] = useState<string | null>(null);

  const activeCategory = MESH_CATEGORIES.find((c) => c.id === categoryId)!;
  const composedPrompt = build3DMeshPrompt(
    brief,
    activeCategory.label,
    `${topology} topology, ${Math.round(polycount / 1000)}k target triangles, ${enablePbr ? "metallic roughness normal AO PBR maps" : "untextured"}`
  );
  const prompt = promptOverride ?? composedPrompt;

  const handleInjectTelemetry = (telemetry: string) => {
    setPromptOverride((prev) => `${prev ?? composedPrompt}, ${telemetry}`);
  };

  const handleApplyPreset = (text: string) => {
    setPromptOverride(text);
  };

  const generate = () => {
    playHMIClickSound();
    submitJob({
      kind: "3d",
      modelId,
      title: `${brief.name} — ${activeCategory.label} (3D GLB)`,
      prompt,
      metadata: { topology, polycount, enablePbr, category: activeCategory.id },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <ApexPulseRibbon brief={brief} onInject={handleInjectTelemetry} onApplyPreset={handleApplyPreset} />

      <NeonHorizonGlassPanel
        glow="cyan"
        header={{
          icon: <Box size={14} />,
          title: "Neural 3D Mesh Synthesis Lab",
          subtitle: "Lift single/multi-angle automotive concept art into textured 3D GLBs",
          badge: <NeonHorizonBadge variant="cyan">Meshy Image-to-3D · Meta SAM 3 3D</NeonHorizonBadge>,
        }}
      >
        <div className="p-4 grid lg:grid-cols-[280px_1fr] gap-5">
          {/* 3D Parameters */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#00F5D4] font-mono mb-2">3D Neural Model</p>
              <div className="flex flex-col gap-1.5">
                {HF_MODELS.filter((m) => m.kind === "3d").map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModelId(m.id)}
                    className={`text-left px-3 py-2.5 rounded-xl border transition-all duration-150 active:scale-[0.98] ${
                      modelId === m.id
                        ? "border-[#00F5D4]/60 bg-[#00F5D4]/15 shadow-[0_0_15px_rgba(0,245,212,0.15)]"
                        : "border-white/8 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{m.label}</span>
                    <span className="text-[9px] text-zinc-400 block mt-0.5">{m.blurb}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#00F5D4] font-mono mb-2">Mesh Topology Standard</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTopology("quad")}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all active:scale-[0.97] ${
                    topology === "quad"
                      ? "border-[#00F5D4] bg-[#00F5D4]/20 text-[#00F5D4]"
                      : "border-white/10 bg-white/[0.02] text-zinc-400"
                  }`}
                >
                  QUAD (SubD CAD)
                </button>
                <button
                  onClick={() => setTopology("triangle")}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all active:scale-[0.97] ${
                    topology === "triangle"
                      ? "border-[#00F5D4] bg-[#00F5D4]/20 text-[#00F5D4]"
                      : "border-white/10 bg-white/[0.02] text-zinc-400"
                  }`}
                >
                  TRIANGLE (Detail)
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-widest text-[#00F5D4] font-mono">Polycount Density</span>
                <span className="text-xs font-mono font-bold text-white">{polycount.toLocaleString()} Tris</span>
              </div>
              <input
                type="range"
                min={10000}
                max={150000}
                step={5000}
                value={polycount}
                onChange={(e) => setPolycount(Number(e.target.value))}
                className="w-full accent-[#00F5D4] cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-mono text-zinc-500 mt-1">
                <span>10K (LOD 3)</span>
                <span>65K (Standard)</span>
                <span>150K (CAD Detail)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/8">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Bake PBR Maps</span>
                <span className="text-[9px] text-zinc-400">Normal, Roughness, Metalness</span>
              </div>
              <input
                type="checkbox"
                checked={enablePbr}
                onChange={(e) => setEnablePbr(e.target.checked)}
                className="accent-[#00F5D4] w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Component Target & Prompt */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#00F5D4] font-mono mb-2">Automotive Subassembly Target</p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {MESH_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      playHMIClickSound();
                      setCategoryId(c.id);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all active:scale-[0.98] ${
                      categoryId === c.id
                        ? "border-[#00F5D4]/60 bg-[#00F5D4]/15 shadow-[0_0_12px_rgba(0,245,212,0.15)]"
                        : "border-white/8 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{c.icon}</span>
                      <span className="text-xs font-bold text-white truncate">{c.label}</span>
                    </div>
                    <span className="text-[9px] text-zinc-400 line-clamp-2 leading-tight">{c.blurb}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1.5">Generative 3D Mesh Specification</p>
              <PromptBox value={prompt} onChange={setPromptOverride} />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
              <span className="text-[10px] font-mono text-zinc-500">
                Exports zero-offset world coordinates ready for Three.js & Unreal Engine.
              </span>
              <NeonHorizonButton variant="neon" icon={<Wand2 size={13} />} onClick={generate}>
                Synthesize 3D GLB
              </NeonHorizonButton>
            </div>
          </div>
        </div>
      </NeonHorizonGlassPanel>

      <Gallery onInspect={onInspect} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Image Lab
// ─────────────────────────────────────────────────────────────

function ImageLabTab({ onInspect }: { onInspect: (j: GenerationJob) => void }) {
  const brief = useCarBrief();
  const submitJob = useHiggsfieldStore((s) => s.submitJob);
  const defaultImageModel = useHiggsfieldStore((s) => s.defaultImageModel);

  const [modelId, setModelId] = useState(defaultImageModel || "soul_cinematic");
  const [styleId, setStyleId] = useState<string>(IMAGE_STYLES[0].id);
  const [aspectRatio, setAspectRatio] = useState<string>("21:9");
  const [resolution, setResolution] = useState<string>("4k");
  const [paintHex, setPaintHex] = useState(brief.paintHex ?? "#00F5D4");
  const [extra, setExtra] = useState("");
  const [promptOverride, setPromptOverride] = useState<string | null>(null);

  const styleSuffix = IMAGE_STYLES.find((s) => s.id === styleId)?.suffix ?? "";
  const composedPrompt = `${buildShowcaseImagePrompt(brief, styleSuffix)}, ${aspectRatio} aspect ratio, ${resolution} resolution${
    paintHex ? `, hero colour #${paintHex.replace("#", "")}` : ""
  }${extra ? `, ${extra}` : ""}`;
  const prompt = promptOverride ?? composedPrompt;

  const handleInjectTelemetry = (telemetry: string) => {
    setPromptOverride((prev) => `${prev ?? composedPrompt}, ${telemetry}`);
  };

  const handleApplyPreset = (text: string) => {
    setPromptOverride(text);
  };

  const generate = () => {
    playHMIClickSound();
    submitJob({
      kind: "image",
      modelId,
      title: `${brief.name} — ${IMAGE_STYLES.find((s) => s.id === styleId)?.label}`,
      prompt,
      metadata: { aspectRatio, resolution, paintHex },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <ApexPulseRibbon brief={brief} onInject={handleInjectTelemetry} onApplyPreset={handleApplyPreset} />

      <NeonHorizonGlassPanel
        glow="cyan"
        header={{
          icon: <ImageIcon size={14} />,
          title: "AI Automotive Showcase Stills",
          subtitle: "Cinema-grade concept art & photoreal renders",
          badge: <NeonHorizonBadge variant="cyan">Soul Cinema · GPT Image 2 · 4K Anamorphic</NeonHorizonBadge>,
        }}
      >
        <div className="p-4 grid lg:grid-cols-[270px_1fr] gap-5">
          {/* Controls */}
          <div className="flex flex-col gap-3.5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#00F5D4] font-mono mb-2">Image Model</p>
              <div className="flex flex-col gap-1.5">
                {HF_MODELS.filter((m) => m.kind === "image").map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModelId(m.id)}
                    className={`text-left px-3 py-2 rounded-xl border transition-all active:scale-[0.98] ${
                      modelId === m.id
                        ? "border-[#00F5D4]/50 bg-[#00F5D4]/15 shadow-[0_0_12px_rgba(0,245,212,0.15)]"
                        : "border-white/8 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{m.label}</span>
                    <span className="text-[9px] text-zinc-400 block">{m.blurb}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1.5">Aspect Ratio</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {["21:9", "16:9", "1:1", "9:16"].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all active:scale-[0.95] ${
                        aspectRatio === ratio
                          ? "border-[#00F5D4] bg-[#00F5D4]/20 text-[#00F5D4]"
                          : "border-white/10 bg-white/[0.02] text-zinc-400"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1.5">Resolution</p>
                <div className="grid grid-cols-3 gap-1">
                  {["1k", "2k", "4k"].map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono uppercase font-bold border transition-all active:scale-[0.95] ${
                        resolution === res
                          ? "border-[#00F5D4] bg-[#00F5D4]/20 text-[#00F5D4]"
                          : "border-white/10 bg-white/[0.02] text-zinc-400"
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1.5">Paint Color Override</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={paintHex}
                  onChange={(e) => setPaintHex(e.target.value)}
                  className="w-10 h-8 rounded-lg bg-transparent border border-white/20 cursor-pointer"
                />
                <span className="text-xs font-mono text-zinc-300 uppercase">{paintHex}</span>
              </div>
            </div>
          </div>

          {/* Prompt Form */}
          <div className="flex flex-col gap-3.5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-2">Automotive Lighting Style</p>
              <div className="flex flex-wrap gap-2">
                {IMAGE_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      playHMIClickSound();
                      setStyleId(s.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-[0.97] ${
                      styleId === s.id
                        ? "border-[#00F5D4] bg-[#00F5D4]/20 text-[#00F5D4] shadow-[0_0_10px_rgba(0,245,212,0.2)]"
                        : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1.5">Master Generative Prompt</p>
              <PromptBox value={prompt} onChange={setPromptOverride} />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <input
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Extra creative direction… e.g. 50mm f/1.2 prime, brake rotor glow, titanium sparks"
                className="flex-1 rounded-xl bg-black/50 border border-white/10 focus:border-[#00F5D4]/50 outline-none px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 font-mono"
              />
              <NeonHorizonButton variant="neon" icon={<Wand2 size={13} />} onClick={generate}>
                Synthesize Still
              </NeonHorizonButton>
            </div>
          </div>
        </div>
      </NeonHorizonGlassPanel>

      <Gallery onInspect={onInspect} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Cinema
// ─────────────────────────────────────────────────────────────

function CinemaTab({ onInspect }: { onInspect: (j: GenerationJob) => void }) {
  const brief = useCarBrief();
  const submitJob = useHiggsfieldStore((s) => s.submitJob);
  const defaultVideoModel = useHiggsfieldStore((s) => s.defaultVideoModel);

  const [modelId, setModelId] = useState(defaultVideoModel || "cinematic_studio_3_0");
  const [cameraMotion, setCameraMotion] = useState<string>(CAMERA_MOTIONS[0].id);
  const [speedramp, setSpeedramp] = useState<string>(SPEED_RAMPS[1].id);
  const [aspectRatio, setAspectRatio] = useState("21:9");
  const [resolution, setResolution] = useState("1080p");
  const [generateAudio, setGenerateAudio] = useState(true);
  const [presetId, setPresetId] = useState<string | null>("bullet-time");

  const shots = useMemo(() => buildCinematicShotPrompts(brief), [brief]);
  const preset = HF_VIRAL_PRESETS.find((p) => p.id === presetId);
  const motion = CAMERA_MOTIONS.find((c) => c.id === cameraMotion);

  const handleInjectTelemetry = (telemetry: string) => {
    // Inject into brief
    console.log("Injected telemetry into cinema builder:", telemetry);
  };

  const shootShot = (shotTitle: string, basePrompt: string) => {
    playHMIClickSound();
    const finalPrompt = `${basePrompt}, ${motion?.desc ?? ""}, speedramp: ${speedramp}, aspect ratio: ${aspectRatio}, resolution: ${resolution}${
      preset ? `, ${preset.promptSuffix}` : ""
    }${generateAudio ? ", with synchronized engine exhaust audio & cinematic soundtrack" : ""}`;

    submitJob({
      kind: "video",
      modelId,
      title: `${brief.name} — ${shotTitle}${preset ? ` (${preset.label})` : ""}`,
      prompt: finalPrompt,
      metadata: { cameraMotion, speedramp, aspectRatio, resolution, generateAudio },
    });
  };

  const shootFullStoryboard = () => {
    playHMIClickSound();
    shots.forEach((s) => {
      shootShot(s.shot, s.prompt);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <ApexPulseRibbon brief={brief} onInject={handleInjectTelemetry} />

      <NeonHorizonGlassPanel
        glow="magenta"
        header={{
          icon: <Clapperboard size={14} />,
          title: "Cinema Studio 4.0 — Launch Film Director",
          subtitle: "State-of-the-art cinematic camera trajectories, speed-ramping & audio",
          badge: <NeonHorizonBadge variant="gold">Cinema Studio 3.0 · Speedramp Control</NeonHorizonBadge>,
        }}
      >
        <div className="p-4 flex flex-col gap-4">
          {/* Director Controls */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-violet-300 font-mono mb-2">Video Engine</p>
              <div className="flex flex-col gap-1.5">
                {HF_MODELS.filter((m) => m.kind === "video").map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModelId(m.id)}
                    className={`px-3 py-2 rounded-xl border text-left transition-all active:scale-[0.98] ${
                      modelId === m.id
                        ? "border-violet-400/60 bg-violet-500/20 text-white shadow-[0_0_12px_rgba(167,139,250,0.2)]"
                        : "border-white/8 bg-white/[0.02] text-zinc-300 hover:border-white/20"
                    }`}
                  >
                    <span className="text-xs font-bold block truncate">{m.label}</span>
                    <span className="text-[9px] text-violet-300/60 block truncate">{m.vendor}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-violet-300 font-mono mb-2">Camera Direction</p>
              <div className="flex flex-col gap-1.5">
                {CAMERA_MOTIONS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setCameraMotion(m.id)}
                    className={`px-3 py-1.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                      cameraMotion === m.id
                        ? "border-violet-400/60 bg-violet-500/20 text-white"
                        : "border-white/8 bg-white/[0.02] text-zinc-300 hover:border-white/20"
                    }`}
                  >
                    <span className="text-xs font-bold block">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-violet-300 font-mono mb-2">Speed-Ramp & Audio</p>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-1.5">
                  {SPEED_RAMPS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSpeedramp(s.id)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        speedramp === s.id
                          ? "border-violet-400 bg-violet-500/20 text-violet-200"
                          : "border-white/10 bg-white/[0.02] text-zinc-400"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setGenerateAudio((v) => !v)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                    generateAudio
                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                      : "border-white/10 bg-white/[0.02] text-zinc-400"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {generateAudio ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    {generateAudio ? "SOUNDTRACK ON" : "SILENT VIDEO"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-violet-300 font-mono mb-2">Aspect Ratio & Res</p>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-1">
                  {["21:9", "16:9", "9:16"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        aspectRatio === r ? "border-violet-400 bg-violet-500/20 text-white" : "border-white/10 text-zinc-400"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-1">
                  {["720p", "1080p", "4k"].map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono uppercase font-bold border transition-all ${
                        resolution === res ? "border-violet-400 bg-violet-500/20 text-white" : "border-white/10 text-zinc-400"
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Viral Presets Strip */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-2">Viral VFX Style Preset</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPresetId(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  presetId === null ? "border-fuchsia-400/60 bg-fuchsia-500/20 text-white" : "border-white/10 text-zinc-400"
                }`}
              >
                None (Pure Cinema)
              </button>
              {HF_VIRAL_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPresetId(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    presetId === p.id ? "border-fuchsia-400/60 bg-fuchsia-500/20 text-white" : "border-white/10 text-zinc-300 hover:border-white/25"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Storyboard 4-Shot Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Four-Shot Launch Storyboard</span>
              <NeonHorizonButton size="xs" variant="primary" icon={<Sparkles size={11} />} onClick={shootFullStoryboard}>
                Render Entire Storyboard (4 Shots)
              </NeonHorizonButton>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {shots.map((s) => (
                <div key={s.shot} className="rounded-2xl border border-white/10 bg-black/50 p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Film size={12} className="text-violet-400" /> {s.shot}
                    </span>
                    <NeonHorizonButton size="xs" variant="neon" icon={<Sparkles size={10} />} onClick={() => shootShot(s.shot, s.prompt)}>
                      Shoot Cut
                    </NeonHorizonButton>
                  </div>
                  <p className="text-[10px] leading-relaxed text-zinc-400 font-mono line-clamp-3">
                    {preset ? `${s.prompt}, ${preset.promptSuffix}` : s.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-zinc-500 font-mono">Tip: connect the “web” backend to open each shot pre-filled in Higgsfield Cinema Studio.</p>
            <NeonHorizonButton size="sm" variant="secondary" icon={<ExternalLink size={11} />} onClick={() => openWebTool("https://higgsfield.ai/generate")}>
              Open Cinema Studio 4.0
            </NeonHorizonButton>
          </div>
        </div>
      </NeonHorizonGlassPanel>

      <Gallery onInspect={onInspect} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Audio Synth
// ─────────────────────────────────────────────────────────────

function AudioTab({ onInspect }: { onInspect: (j: GenerationJob) => void }) {
  const brief = useCarBrief();
  const submitJob = useHiggsfieldStore((s) => s.submitJob);
  const [vibeId, setVibeId] = useState<string>(MUSIC_VIBES[0].id);

  const compose = () => {
    playHMIClickSound();
    const vibe = MUSIC_VIBES.find((v) => v.id === vibeId)!;
    submitJob({
      kind: "audio",
      modelId: "higgsfield-audio",
      title: `${brief.name} — ${vibe.label}`,
      prompt: `Original automotive soundtrack for ${brief.name} launch film. Direction: ${vibe.desc}. Blended with authentic ${Math.round(
        brief.powerHp ?? 800
      )} HP twin-turbo engine spool, wastegate chirp and titanium exhaust resonance. 30s mix.`,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <NeonHorizonGlassPanel
        glow="emerald"
        header={{
          icon: <Music4 size={14} />,
          title: "Soundtrack & Exhaust Audio Synth",
          subtitle: "Score and acoustic profiles generated directly from your powertrain harmonics",
        }}
      >
        <div className="p-4 flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {MUSIC_VIBES.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  playHMIClickSound();
                  setVibeId(v.id);
                }}
                className={`text-left p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
                  vibeId === v.id
                    ? "border-emerald-400/60 bg-emerald-500/20 text-white shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                    : "border-white/8 bg-white/[0.02] text-zinc-300 hover:border-white/20"
                }`}
              >
                <span className="text-xs font-bold block mb-1">{v.label}</span>
                <span className="text-[10px] text-emerald-300/60 leading-snug block">{v.desc}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <NeonHorizonButton variant="emerald" icon={<Wand2 size={13} />} onClick={compose}>
              Compose Powertrain Soundtrack
            </NeonHorizonButton>
          </div>
        </div>
      </NeonHorizonGlassPanel>

      <Gallery onInspect={onInspect} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Marketing
// ─────────────────────────────────────────────────────────────

function MarketingTab({ onInspect }: { onInspect: (j: GenerationJob) => void }) {
  const brief = useCarBrief();
  const { company } = useCompany();

  const garageVehicle = (company as any)?.garage?.find(
    (g: any) => g.name === brief.name || g.modelName === brief.name
  );
  const reviewScore: number | undefined = garageVehicle
    ? (garageVehicle.sim as any)?.reviewSummary?.overallScore ?? undefined
    : undefined;

  const campaign = useMemo(() => buildMarketingCampaign({ ...brief, reviewScore }), [brief, reviewScore]);

  return (
    <div className="flex flex-col gap-4">
      <NeonHorizonGlassPanel
        glow="gold"
        header={{
          icon: <Megaphone size={14} />,
          title: "Launch Campaign Generator",
          subtitle: "Marketing Studio brief for the current build",
          badge: <NeonHorizonBadge variant="gold">Auto-drafted</NeonHorizonBadge>,
          actions: (
            <NeonHorizonButton size="xs" variant="gold" icon={<ExternalLink size={11} />} onClick={() => openWebTool("https://higgsfield.ai/marketing-studio")}>
              Open Marketing Studio
            </NeonHorizonButton>
          ),
        }}
      >
        <div className="p-4 flex flex-col gap-4">
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-4 shadow-lg">
            <p className="text-base font-extrabold tracking-wide text-amber-100">{campaign.headline}</p>
            <p className="text-xs italic text-amber-200/80 mt-1">“{campaign.tagline}”</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/8">
              <p className="text-[10px] uppercase tracking-widest text-amber-300/80 font-mono mb-2">Omnichannel Strategy</p>
              <ul className="space-y-2">
                {campaign.channels.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-xs text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/8">
              <p className="text-[10px] uppercase tracking-widest text-amber-300/80 font-mono mb-2">Creative Asset Checklist</p>
              <ul className="space-y-2">
                {campaign.assetChecklist.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </NeonHorizonGlassPanel>

      <Gallery onInspect={onInspect} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Supercomputer (Batch)
// ─────────────────────────────────────────────────────────────

function BatchTab({ onInspect }: { onInspect: (j: GenerationJob) => void }) {
  const { company } = useCompany();
  const brief = useCarBrief();
  const submitJob = useHiggsfieldStore((s) => s.submitJob);
  const defaultImageModel = useHiggsfieldStore((s) => s.defaultImageModel);
  const garage: any[] = (company as any)?.garage ?? [];
  const jobs = useHiggsfieldStore((s) => s.jobs);
  const running = jobs.filter((j) => j.status === "running").length;
  const doneCount = jobs.filter((j) => j.status === "done").length;
  const progress = jobs.length > 0 ? Math.round((doneCount / jobs.length) * 100) : 0;

  const runShowroomPack = () => {
    playHMIClickSound();
    const cars = garage.length > 0 ? garage.slice(0, 8) : [{ name: brief.name }];
    cars.forEach((g: any, i: number) => {
      const carBrief: CarBriefInput = {
        name: g.name ?? "Apex Prototype",
        powerHp: g.sim?.peakPower ?? brief.powerHp,
        tierLabel: i === 0 ? "flagship" : "halo",
      };
      submitJob({
        kind: "image",
        modelId: defaultImageModel,
        title: `Showroom Pack — ${carBrief.name}`,
        prompt: buildShowcaseImagePrompt(carBrief, "pristine showroom, polished floor, symmetrical lighting rig, ultra detailed 4K"),
      });
    });
  };

  const runPressKit = () => {
    playHMIClickSound();
    submitJob({
      kind: "video",
      modelId: "cinematic_studio_3_0",
      title: `Press Kit — ${brief.name} teaser`,
      prompt: `${buildShowcaseImagePrompt(brief)}, dramatic 6-second teaser cut with camera crane, logo reveal at the end`,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <NeonHorizonGlassPanel
        header={{
          icon: <Cpu size={14} />,
          title: "Supercomputer — Batch Automation",
          subtitle: "Queue creative jobs across your whole garage",
          badge: <NeonHorizonBadge variant="cyan">{garage.length} vehicles in garage</NeonHorizonBadge>,
        }}
      >
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2.5">
            <NeonHorizonButton variant="neon" icon={<Layers3 size={13} />} onClick={runShowroomPack}>
              Run Showroom Pack (≤8 cars)
            </NeonHorizonButton>
            <NeonHorizonButton variant="primary" icon={<Clapperboard size={13} />} onClick={runPressKit}>
              Render Press Teaser
            </NeonHorizonButton>
          </div>

          {jobs.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
              <div className="flex justify-between text-xs font-mono text-zinc-400 mb-2">
                <span>BATCH QUEUE PROGRESS</span>
                <span className="text-white font-bold">
                  {doneCount}/{jobs.length} completed · {running} rendering
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
                <div className="h-full bg-[#00F5D4] transition-all duration-500 shadow-[0_0_12px_#00F5D4]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </NeonHorizonGlassPanel>

      <Gallery onInspect={onInspect} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Connect
// ─────────────────────────────────────────────────────────────

function ConnectTab() {
  const backend = useHiggsfieldStore((s) => s.backend);
  const setBackend = useHiggsfieldStore((s) => s.setBackend);
  const proxyUrl = useHiggsfieldStore((s) => s.proxyUrl);
  const setProxyUrl = useHiggsfieldStore((s) => s.setProxyUrl);
  const [copied, setCopied] = useState(false);

  const copyMcp = () => {
    playHMIClickSound();
    navigator.clipboard?.writeText("https://mcp.higgsfield.ai/mcp").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <NeonHorizonGlassPanel
        header={{ icon: <Plug size={14} />, title: "Backend Wiring & Protocols", subtitle: "Connect your workspace to the live Higgsfield MCP network" }}
      >
        <div className="p-4 grid md:grid-cols-3 gap-3">
          {(
            [
              { id: "demo", label: "Demo Mode (Offline)", desc: "Procedural ray-traced & 3D wireframe renders, 100% offline." },
              { id: "web", label: "Web Deep-Link", desc: "Opens prefilled prompts in Higgsfield web tools. Works today." },
              { id: "api", label: "MCP API Proxy", desc: "POSTs jobs to your proxy fronting the Higgsfield MCP server." },
            ] as const
          ).map((b) => (
            <button
              key={b.id}
              onClick={() => {
                playHMIClickSound();
                setBackend(b.id);
              }}
              className={`text-left p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                backend === b.id
                  ? "border-[#00F5D4]/60 bg-[#00F5D4]/15 shadow-[0_0_15px_rgba(0,245,212,0.15)]"
                  : "border-white/8 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <span className="text-xs font-bold text-white block mb-1">{b.label}</span>
              <span className="text-[10px] text-zinc-400 leading-snug block">{b.desc}</span>
            </button>
          ))}
        </div>

        {backend === "api" && (
          <div className="px-4 pb-4">
            <label className="text-[10px] uppercase tracking-widest text-[#00F5D4] font-mono block mb-1.5">Proxy Endpoint</label>
            <input
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              placeholder="https://your-proxy.example.com/higgsfield"
              className="w-full rounded-xl bg-black/60 border border-white/10 focus:border-[#00F5D4]/40 outline-none px-3.5 py-2.5 text-xs font-mono text-white"
            />
            <p className="text-[9px] text-zinc-500 font-mono mt-1.5">
              Contract: POST /jobs {"{kind,model,prompt}"} → {"{id,status,resultUrl}"}; GET /jobs/:id for polling.
            </p>
          </div>
        )}
      </NeonHorizonGlassPanel>

      <NeonHorizonGlassPanel
        glow="cyan"
        header={{
          icon: <Copy size={14} />,
          title: "Agent & Studio Integrations",
          subtitle: "Model Context Protocol · CLI · Blender · Canvas",
          actions: (
            <NeonHorizonButton size="xs" variant={copied ? "emerald" : "secondary"} icon={copied ? <CheckCircle2 size={11} /> : <Copy size={11} />} onClick={copyMcp}>
              {copied ? "Copied!" : "Copy MCP URL"}
            </NeonHorizonButton>
          ),
        }}
      >
        <div className="p-4">
          <code className="block rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-xs font-mono text-[#00F5D4] overflow-x-auto shadow-inner">
            claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp
          </code>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {HF_TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => openWebTool(t.url)}
                className="text-left p-3.5 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-[#00F5D4]/40 hover:bg-[#00F5D4]/[0.05] transition-all group active:scale-[0.98]"
              >
                <span className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-[#00F5D4]">{t.label}</span>
                  <ExternalLink size={11} className="text-zinc-500 group-hover:text-[#00F5D4]" />
                </span>
                <span className="text-[10px] text-zinc-400 leading-snug block">{t.blurb}</span>
              </button>
            ))}
          </div>
        </div>
      </NeonHorizonGlassPanel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main stage: NeonHiggsfieldStudio
// ─────────────────────────────────────────────────────────────

export function NeonHiggsfieldStudio() {
  const [tab, setTab] = useState<StudioTab>("image");
  const [transitMs, setTransitMs] = useState(520);
  const [inspectJob, setInspectJob] = useState<GenerationJob | null>(null);
  const backend = useHiggsfieldStore((s) => s.backend);

  const go = (next: StudioTab) => {
    playHMIClickSound();
    setTab((prev) => {
      if (prev !== next) {
        const from = TABS.find((t) => t.id === prev)!;
        const to = TABS.find((t) => t.id === next)!;
        const dist = angularDistanceDeg(from, to);
        setTransitMs(Math.round(Math.min(1500, Math.max(380, dist * 5 + 340))));
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4 animate-nh-materialize">
      {/* Interactive Lightbox Modal */}
      <MediaLightboxModal job={inspectJob} onClose={() => setInspectJob(null)} />

      {/* Title strip */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.25)]">
            <Sparkles size={20} className="text-[#00F5D4]" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">Higgsfield AI Creative Suite</h2>
            <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-mono">
              3D GLB · 4K CINEMA · NEURAL STILLS · AUDIO SYNTH · DTC ADS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NeonHorizonBadge variant={backend === "api" ? "emerald" : backend === "web" ? "cyan" : "neutral"} pulse={backend !== "demo"}>
            BACKEND: {backend.toUpperCase()}
          </NeonHorizonBadge>
        </div>
      </div>

      {/* Orbital navigation + content viewport */}
      <div className="grid xl:grid-cols-[minmax(300px,380px)_1fr] gap-5 items-start">
        <div className="flex flex-col gap-4 xl:sticky xl:top-2">
          <NeonHorizonGlassPanel
            variant="secondary"
            glow="magenta"
            header={{
              icon: <Orbit size={14} />,
              title: "Mission Globe Navigator",
              subtitle: "Drag to spin sphere · click a node to fly there",
            }}
          >
            <div className="p-2 pb-3">
              <NeonHiggsfieldGlobe
                tabs={TABS}
                activeId={tab}
                onSelect={(id) => go(id as StudioTab)}
                onArrive={() => playHologramScanSound()}
              />
            </div>
          </NeonHorizonGlassPanel>

          <NeonHorizonGlassPanel
            variant="tertiary"
            header={{ icon: <Layers3 size={13} />, title: "Flight Manifest", subtitle: "Direct waypoint access" }}
          >
            <div className="p-2 flex flex-col gap-1">
              {TABS.map((t) => {
                const isActive = t.id === tab;
                const nHue = t.hue ?? 200;
                return (
                  <button
                    key={t.id}
                    onClick={() => go(t.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all duration-150 active:scale-[0.98] ${
                      isActive ? "text-white" : "border-transparent text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                    }`}
                    style={
                      isActive
                        ? {
                            borderColor: `hsl(${nHue} 90% 70% / 0.55)`,
                            background: `hsl(${nHue} 90% 60% / 0.15)`,
                            boxShadow: `0 0 15px hsl(${nHue} 90% 60% / 0.15)`,
                          }
                        : undefined
                    }
                  >
                    {t.icon}
                    <span className="text-xs font-bold tracking-wide">{t.label}</span>
                    <span className="ml-auto font-mono text-[9px] text-zinc-500">
                      {t.lat >= 0 ? "+" : ""}
                      {t.lat}° / {t.lng >= 0 ? "+" : ""}
                      {t.lng}°
                    </span>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: isActive ? `hsl(${nHue} 95% 75%)` : "#475569",
                        boxShadow: isActive ? `0 0 8px hsl(${nHue} 95% 68%)` : undefined,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        <div
          key={tab}
          className="nh-globe-content relative min-w-0 flex flex-col gap-3.5"
          style={{ ["--nh-transit" as any]: `${Math.round(transitMs * 0.62)}ms` }}
        >
          <div
            key={`bar-${tab}`}
            className="nh-transit-bar"
            style={{
              animationDuration: `${transitMs}ms`,
              background: `linear-gradient(90deg, hsl(${TABS.find((t) => t.id === tab)?.hue ?? 200} 95% 65% / 0.15), hsl(${
                TABS.find((t) => t.id === tab)?.hue ?? 200
              } 95% 70% / 0.95))`,
            }}
          />

          {/* Active Station Orbital HUD Waypoint Bar */}
          {(() => {
            const curTab = TABS.find((t) => t.id === tab)!;
            const curIdx = TABS.findIndex((t) => t.id === tab);
            const prevTab = TABS[(curIdx - 1 + TABS.length) % TABS.length];
            const nextTab = TABS[(curIdx + 1) % TABS.length];
            const nHue = curTab.hue ?? 200;

            return (
              <div
                className="flex items-center justify-between p-3.5 rounded-2xl border backdrop-blur-xl transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, rgba(10, 15, 26, 0.95), hsl(${nHue} 90% 40% / 0.15))`,
                  borderColor: `hsl(${nHue} 90% 70% / 0.4)`,
                  boxShadow: `0 4px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                      background: `hsl(${nHue} 95% 60% / 0.25)`,
                      color: `hsl(${nHue} 95% 85%)`,
                      border: `1px solid hsl(${nHue} 90% 70% / 0.5)`,
                    }}
                  >
                    {curTab.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white tracking-wide">{curTab.label}</span>
                      <span
                        className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase"
                        style={{
                          background: `hsl(${nHue} 90% 60% / 0.2)`,
                          color: `hsl(${nHue} 95% 85%)`,
                          border: `1px solid hsl(${nHue} 90% 70% / 0.4)`,
                        }}
                      >
                        {curTab.cardinal}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans mt-0.5">{curTab.description}</p>
                  </div>
                </div>

                {/* Fast Cycle Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => go(prevTab.id)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-mono text-zinc-300 hover:text-white bg-black/50 hover:bg-black/80 border border-white/10 transition-all active:scale-[0.96] flex items-center gap-1"
                  >
                    ← {prevTab.label}
                  </button>
                  <button
                    onClick={() => go(nextTab.id)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-mono text-zinc-300 hover:text-white bg-black/50 hover:bg-black/80 border border-white/10 transition-all active:scale-[0.96] flex items-center gap-1"
                  >
                    {nextTab.label} →
                  </button>
                </div>
              </div>
            );
          })()}

          {tab === "image" && <ImageLabTab onInspect={setInspectJob} />}
          {tab === "cinema" && <CinemaTab onInspect={setInspectJob} />}
          {tab === "mesh3d" && <Mesh3DTab onInspect={setInspectJob} />}
          {tab === "audio" && <AudioTab onInspect={setInspectJob} />}
          {tab === "marketing" && <MarketingTab onInspect={setInspectJob} />}
          {tab === "batch" && <BatchTab onInspect={setInspectJob} />}
          {tab === "connect" && <ConnectTab />}
        </div>
      </div>
    </div>
  );
}
