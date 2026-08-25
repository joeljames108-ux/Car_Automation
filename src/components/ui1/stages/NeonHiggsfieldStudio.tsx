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
} from "lucide-react";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHiggsfieldGlobe, angularDistanceDeg, type GlobeTabDef } from "./NeonHiggsfieldGlobe";
import { playHologramScanSound } from "../interactive/NeonHorizonSoundEngine";
import { useDesign } from "../../../state/DesignContext";
import { useCompany } from "../../../state/CompanyContext";
import { useHiggsfieldStore } from "../../../state/useHiggsfieldStore";
import {
  CarBriefInput,
  HF_MODELS,
  HF_TOOLS,
  HF_VIRAL_PRESETS,
  GenerationJob,
  buildCinematicShotPrompts,
  buildMarketingCampaign,
  buildShowcaseImagePrompt,
  openWebTool,
} from "../../../lib/higgsfield";

type StudioTab = "image" | "cinema" | "audio" | "marketing" | "batch" | "connect";

const TABS: (GlobeTabDef & { id: StudioTab })[] = [
  {
    id: "image",
    label: "Image Lab",
    icon: <ImageIcon size={13} />,
    lat: 0,
    lng: 0,
    hue: 199,
    description: "Neural Diffusion & AI Studio Renders",
    cardinal: "0°N, 0°E · PRIME FRONT",
    side: "top-left",
  },
  {
    id: "cinema",
    label: "Cinema 4K",
    icon: <Clapperboard size={13} />,
    lat: 0,
    lng: 90,
    hue: 265,
    description: "Cinematic Video & Camera Motion",
    cardinal: "0°N, +90°E · EAST FLANK",
    side: "right",
  },
  {
    id: "audio",
    label: "Audio Synth",
    icon: <Music4 size={13} />,
    lat: 0,
    lng: 180,
    hue: 155,
    description: "Dynamic Soundtracks & Exhaust Audio",
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
    description: "Viral Campaigns & Launch Press",
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
    description: "Multi-GPU Distributed Neural Batch",
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
    description: "Live Webhooks & Engine Bridge",
    cardinal: "-60°S, 0°E · SOUTH POLE",
    side: "bottom",
  },
];

const IMAGE_STYLES = [
  { id: "night-city", label: "Neon Night City", suffix: "rain-slicked neon metropolis at night, volumetric fog, reflections on wet asphalt" },
  { id: "studio", label: "Studio Spotlight", suffix: "black studio, single overhead spotlight, glossy floor reflection, product photography" },
  { id: "alpine", label: "Alpine Dawn", suffix: "mountain pass at golden-hour dawn, mist in the valley, long shadows" },
  { id: "track", label: "Race Track Panning", suffix: "panning shot on a race circuit, heat haze, motion-blurred armco" },
  { id: "cyberpunk", label: "Cyberpunk Garage", suffix: "underground cyberpunk garage, holographic telemetry overlays, teal and magenta rim light" },
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
    return {
      name: (design as any)?.name ?? "Apex Prototype",
      bodyStyle: typeof vehicle.bodyType === "string" ? String(vehicle.bodyType).replace(/_/g, " ") : undefined,
      powerHp: (sim as any)?.peakPower,
      topSpeedKph: (sim as any)?.topSpeed,
      zeroTo60: (sim as any)?.accel0_60,
    };
  }, [design, sim]);
}

// ─────────────────────────────────────────────────────────────
// Shared pieces
// ─────────────────────────────────────────────────────────────

function JobCard({ job }: { job: GenerationJob }) {
  const statusIcon =
    job.status === "running" ? (
      <Loader2 size={12} className="animate-spin text-sky-300" />
    ) : job.status === "done" ? (
      <CheckCircle2 size={12} className="text-emerald-300" />
    ) : (
      <XCircle size={12} className="text-rose-300" />
    );

  return (
    <div className="rounded-xl border border-white/10 bg-[#0a111e]/80 overflow-hidden">
      <div className="aspect-video bg-black/40 relative flex items-center justify-center">
        {job.resultUrl && job.status === "done" ? (
          <img src={job.resultUrl} alt={job.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            {job.status === "running" ? "rendering…" : job.error ?? "no preview"}
          </span>
        )}
        <span className="absolute top-2 left-2">{statusIcon}</span>
        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono uppercase text-slate-300">
          {job.modelId}
        </span>
      </div>
      <div className="px-2.5 py-2">
        <p className="text-[11px] font-semibold text-slate-200 truncate">{job.title}</p>
        <p className="text-[9px] text-slate-500 line-clamp-2 mt-0.5">{job.prompt}</p>
      </div>
    </div>
  );
}

function PromptBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full rounded-xl bg-[#0a111e]/85 border border-white/10 focus:border-sky-400/35 outline-none px-3 py-2.5 text-[11px] leading-relaxed text-slate-200 font-mono resize-none"
      spellCheck={false}
    />
  );
}

function Gallery() {
  const jobs = useHiggsfieldStore((s) => s.jobs);
  const history = useHiggsfieldStore((s) => s.history);
  const clearHistory = useHiggsfieldStore((s) => s.clearHistory);
  const shown = [...jobs, ...history].slice(0, 18);

  return (
    <NeonHorizonGlassPanel
      variant="secondary"
      header={{
        icon: <Layers3 size={14} />,
        title: "Render Queue & History",
        subtitle: `${jobs.filter((j) => j.status === "running").length} active · ${history.length} archived`,
        actions: (
          <NeonHorizonButton variant="ghost" size="xs" icon={<Trash2 size={11} />} onClick={clearHistory}>
            Clear
          </NeonHorizonButton>
        ),
      }}
    >
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 min-h-[120px]">
        {shown.length === 0 && (
          <p className="col-span-full text-center text-[11px] text-slate-500 py-8">
            No generations yet — compose a prompt above and hit Generate.
          </p>
        )}
        {shown.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </div>
    </NeonHorizonGlassPanel>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Image Lab
// ─────────────────────────────────────────────────────────────

function ImageLabTab() {
  const brief = useCarBrief();
  const submitJob = useHiggsfieldStore((s) => s.submitJob);
  const defaultImageModel = useHiggsfieldStore((s) => s.defaultImageModel);

  const [modelId, setModelId] = useState(defaultImageModel);
  const [styleId, setStyleId] = useState<string>(IMAGE_STYLES[0].id);
  const [paintHex, setPaintHex] = useState("#8fb9d9");
  const [extra, setExtra] = useState("");
  const [promptOverride, setPromptOverride] = useState<string | null>(null);

  const styleSuffix = IMAGE_STYLES.find((s) => s.id === styleId)?.suffix ?? "";
  const composedPrompt = `${buildShowcaseImagePrompt(brief, styleSuffix)}${paintHex ? `, hero colour #${paintHex.replace("#", "")}` : ""}${extra ? `, ${extra}` : ""}`;
  const prompt = promptOverride ?? composedPrompt;

  const generate = () =>
    submitJob({ kind: "image", modelId, title: `${brief.name} — ${IMAGE_STYLES.find((s) => s.id === styleId)?.label}`, prompt });

  return (
    <div className="flex flex-col gap-4">
      <NeonHorizonGlassPanel
        glow="cyan"
        header={{
          icon: <ImageIcon size={14} />,
          title: "AI Showcase Renderer",
          subtitle: "Photoreal stills of your current build",
          badge: <NeonHorizonBadge variant="cyan">Nano Banana Pro · GPT Image 2 · Seedream</NeonHorizonBadge>,
        }}
      >
        <div className="p-4 grid lg:grid-cols-[260px_1fr] gap-4">
          {/* Controls */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">Model</p>
              <div className="flex flex-col gap-1.5">
                {HF_MODELS.filter((m) => m.kind === "image").map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModelId(m.id)}
                    className={`text-left px-2.5 py-2 rounded-lg border transition-all ${
                      modelId === m.id
                        ? "border-sky-400/35 bg-sky-400/10"
                        : "border-white/8 bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <span className="text-[11px] font-bold text-slate-100">{m.label}</span>
                    <span className="block text-[9px] text-slate-500">{m.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">Hero Paint</p>
              <input
                type="color"
                value={paintHex}
                onChange={(e) => setPaintHex(e.target.value)}
                className="w-full h-8 rounded-lg bg-transparent border border-white/10 cursor-pointer"
              />
            </div>
          </div>

          {/* Prompt */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">Scene Style</p>
              <div className="flex flex-wrap gap-1.5">
                {IMAGE_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyleId(s.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                      styleId === s.id
                        ? "border-sky-400/35 bg-sky-400/15 text-sky-100"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <PromptBox value={prompt} onChange={setPromptOverride} />
            <div className="flex items-center justify-between gap-3">
              <input
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Extra direction… e.g. 85mm lens, motion blur wheels"
                className="flex-1 rounded-lg bg-[#0a111e]/85 border border-white/10 focus:border-sky-400/30 outline-none px-3 py-2 text-[11px] text-slate-200 placeholder:text-slate-600"
              />
              <NeonHorizonButton variant="neon" icon={<Wand2 size={13} />} onClick={generate}>
                Generate
              </NeonHorizonButton>
            </div>
          </div>
        </div>
      </NeonHorizonGlassPanel>
      <Gallery />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Cinema
// ─────────────────────────────────────────────────────────────

function CinemaTab() {
  const brief = useCarBrief();
  const submitJob = useHiggsfieldStore((s) => s.submitJob);
  const defaultVideoModel = useHiggsfieldStore((s) => s.defaultVideoModel);
  const [modelId, setModelId] = useState(defaultVideoModel);
  const [presetId, setPresetId] = useState<string | null>("bullet-time");
  const shots = useMemo(() => buildCinematicShotPrompts(brief), [brief]);
  const preset = HF_VIRAL_PRESETS.find((p) => p.id === presetId);

  const shootShot = (shotTitle: string, basePrompt: string) => {
    const finalPrompt = preset ? `${basePrompt}, ${preset.promptSuffix}` : basePrompt;
    submitJob({ kind: "video", modelId, title: `${brief.name} — ${shotTitle}${preset ? ` (${preset.label})` : ""}`, prompt: finalPrompt });
  };

  return (
    <div className="flex flex-col gap-4">
      <NeonHorizonGlassPanel
        glow="magenta"
        header={{
          icon: <Clapperboard size={14} />,
          title: "Cinema Studio — Launch Film Builder",
          subtitle: "Four-shot storyboard → Seedance 2.5 / Kling 3",
          badge: <NeonHorizonBadge variant="gold">Seedance 2.5</NeonHorizonBadge>,
        }}
      >
        <div className="p-4 flex flex-col gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">Video Model</p>
              <div className="grid grid-cols-3 gap-1.5">
                {HF_MODELS.filter((m) => m.kind === "video").map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModelId(m.id)}
                    className={`px-2.5 py-2 rounded-lg border text-left transition-all ${
                      modelId === m.id ? "border-violet-400/50 bg-violet-400/10" : "border-white/8 bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-100 block truncate">{m.label}</span>
                    <span className="text-[9px] text-slate-500 block truncate">{m.vendor}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">Viral Preset Overlay</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setPresetId(null)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                    presetId === null ? "border-fuchsia-400/50 bg-fuchsia-400/15 text-fuchsia-100" : "border-white/10 bg-white/[0.03] text-slate-300"
                  }`}
                >
                  None
                </button>
                {HF_VIRAL_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPresetId(p.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                      presetId === p.id ? "border-fuchsia-400/50 bg-fuchsia-400/15 text-fuchsia-100" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-1">
            {shots.map((s) => (
              <div key={s.shot} className="rounded-xl border border-white/10 bg-[#0a111e]/70 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-100">
                    <Film size={11} className="text-violet-300" /> {s.shot}
                  </span>
                  <NeonHorizonButton size="xs" variant="neon" icon={<Sparkles size={10} />} onClick={() => shootShot(s.shot, s.prompt)}>
                    Shoot
                  </NeonHorizonButton>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-400 line-clamp-3">{preset ? `${s.prompt}, ${preset.promptSuffix}` : s.prompt}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-slate-500">Tip: connect the “web” backend to open each shot pre-filled in Higgsfield Cinema Studio.</p>
            <NeonHorizonButton size="sm" variant="secondary" icon={<ExternalLink size={11} />} onClick={() => openWebTool("https://higgsfield.ai/generate")}>
              Open Cinema Studio
            </NeonHorizonButton>
          </div>
        </div>
      </NeonHorizonGlassPanel>
      <Gallery />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Audio
// ─────────────────────────────────────────────────────────────

function AudioTab() {
  const brief = useCarBrief();
  const submitJob = useHiggsfieldStore((s) => s.submitJob);
  const [vibeId, setVibeId] = useState<string>(MUSIC_VIBES[0].id);

  const compose = () => {
    const vibe = MUSIC_VIBES.find((v) => v.id === vibeId)!;
    submitJob({
      kind: "audio",
      modelId: "higgsfield-audio",
      title: `${brief.name} — ${vibe.label}`,
      prompt: `Original soundtrack for the ${brief.name} launch film. Musical direction: ${vibe.desc}. Blend subtle sampled textures of a ${(brief as any).powerHp ?? 600} hp engine at load. 30 seconds, cinematic mix.`,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <NeonHorizonGlassPanel
        glow="emerald"
        header={{
          icon: <Music4 size={14} />,
          title: "Soundtrack Composer Brief",
          subtitle: "Score generated from your engine's character",
        }}
      >
        <div className="p-4 flex flex-col gap-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {MUSIC_VIBES.map((v) => (
              <button
                key={v.id}
                onClick={() => setVibeId(v.id)}
                className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                  vibeId === v.id ? "border-emerald-400/50 bg-emerald-400/10" : "border-white/8 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <span className="text-[11px] font-bold text-slate-100 block">{v.label}</span>
                <span className="text-[9px] text-slate-500 leading-snug block mt-0.5">{v.desc}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <NeonHorizonButton variant="emerald" icon={<Wand2 size={13} />} onClick={compose}>
              Compose Soundtrack
            </NeonHorizonButton>
          </div>
        </div>
      </NeonHorizonGlassPanel>
      <Gallery />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Marketing
// ─────────────────────────────────────────────────────────────

function MarketingTab() {
  const brief = useCarBrief();
  const { company } = useCompany();
  const openTool = useHiggsfieldStore((s) => s.backend);
  void openTool;

  const garageVehicle = (company as any)?.garage?.find(
    (g: any) => g.name === brief.name || g.modelName === brief.name
  );
  const reviewScore: number | undefined = garageVehicle
    ? (garageVehicle.sim as any)?.reviewSummary?.overallScore ?? undefined
    : undefined;

  const campaign = useMemo(
    () => buildMarketingCampaign({ ...brief, reviewScore }),
    [brief, reviewScore]
  );

  return (
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
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-4">
          <p className="text-sm font-extrabold tracking-wide text-amber-100">{campaign.headline}</p>
          <p className="text-[11px] italic text-slate-300 mt-1">“{campaign.tagline}”</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Channel Plan</p>
            <ul className="space-y-1.5">
              {campaign.channels.map((c) => (
                <li key={c} className="flex items-center gap-2 text-[11px] text-slate-300">
                  <span className="w-1 h-1 rounded-full bg-amber-300" /> {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Asset Checklist (via Higgsfield)</p>
            <ul className="space-y-1.5">
              {campaign.assetChecklist.map((a) => (
                <li key={a} className="flex items-center gap-2 text-[11px] text-slate-300">
                  <CheckCircle2 size={11} className="text-emerald-300 shrink-0" /> {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </NeonHorizonGlassPanel>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Supercomputer (batch)
// ─────────────────────────────────────────────────────────────

function BatchTab() {
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
    submitJob({
      kind: "video",
      modelId: "seedance-25",
      title: `Press Kit — ${brief.name} teaser`,
      prompt: `${buildShowcaseImagePrompt(brief)}, dramatic 6-second teaser cut, logo reveal at the end`,
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
        <div className="p-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <NeonHorizonButton variant="neon" icon={<Layers3 size={13} />} onClick={runShowroomPack}>
              Run Showroom Pack (≤8 cars)
            </NeonHorizonButton>
            <NeonHorizonButton variant="primary" icon={<Clapperboard size={13} />} onClick={runPressKit}>
              Render Press Teaser
            </NeonHorizonButton>
          </div>
          {jobs.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-[#0a111e]/70 p-3">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                <span>QUEUE PROGRESS</span>
                <span>
                  {doneCount}/{jobs.length} · {running} rendering
                </span>
              </div>
              <div className="h-2 rounded-full bg-black/50 overflow-hidden">
                <div className="h-full bg-sky-400/50 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </NeonHorizonGlassPanel>
      <Gallery />
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
    navigator.clipboard?.writeText("https://mcp.higgsfield.ai/mcp").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <NeonHorizonGlassPanel
        header={{ icon: <Plug size={14} />, title: "Backend Wiring", subtitle: "How this studio reaches Higgsfield" }}
      >
        <div className="p-4 grid md:grid-cols-3 gap-3">
          {(
            [
              { id: "demo", label: "Demo Mode", desc: "Procedural placeholder renders, fully offline." },
              { id: "web", label: "Web Deep-Link", desc: "Opens prefilled prompts in Higgsfield web tools. Works today." },
              { id: "api", label: "API Proxy", desc: "POSTs jobs to your proxy fronting the MCP server." },
            ] as const
          ).map((b) => (
            <button
              key={b.id}
              onClick={() => setBackend(b.id)}
              className={`text-left px-3 py-3 rounded-xl border transition-all ${
                backend === b.id ? "border-sky-400/35 bg-sky-400/10" : "border-white/8 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <span className="text-[11px] font-bold text-slate-100 block">{b.label}</span>
              <span className="text-[9px] text-slate-500 leading-snug block mt-0.5">{b.desc}</span>
            </button>
          ))}
        </div>
        {backend === "api" && (
          <div className="px-4 pb-4">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 block mb-1.5">Proxy Endpoint</label>
            <input
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              placeholder="https://your-proxy.example.com/higgsfield"
              className="w-full rounded-lg bg-[#0a111e]/85 border border-white/10 focus:border-sky-400/30 outline-none px-3 py-2 text-[11px] font-mono text-slate-200"
            />
            <p className="text-[9px] text-slate-500 mt-1.5">
              Proxy contract: POST /jobs {"{kind,model,prompt}"} → {"{id,status,resultUrl}"}; GET /jobs/:id for polling.
            </p>
          </div>
        )}
      </NeonHorizonGlassPanel>

      <NeonHorizonGlassPanel
        glow="cyan"
        header={{
          icon: <Copy size={14} />,
          title: "Agent Integrations",
          subtitle: "MCP · CLI · Blender · Canvas",
          actions: (
            <NeonHorizonButton size="xs" variant={copied ? "emerald" : "secondary"} icon={copied ? <CheckCircle2 size={11} /> : <Copy size={11} />} onClick={copyMcp}>
              {copied ? "Copied!" : "Copy MCP URL"}
            </NeonHorizonButton>
          ),
        }}
      >
        <div className="p-4">
          <code className="block rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-[10px] font-mono text-sky-200 overflow-x-auto">
            claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp
          </code>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {HF_TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => openWebTool(t.url)}
                className="text-left px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-sky-400/30 hover:bg-sky-400/[0.06] transition-all group"
              >
                <span className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-100 group-hover:text-sky-200">{t.label}</span>
                  <ExternalLink size={10} className="text-slate-500" />
                </span>
                <span className="text-[9px] text-slate-500 leading-snug block mt-0.5">{t.blurb}</span>
              </button>
            ))}
          </div>
        </div>
      </NeonHorizonGlassPanel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main stage
// ─────────────────────────────────────────────────────────────

export function NeonHiggsfieldStudio() {
  const [tab, setTab] = useState<StudioTab>("image");
  const [transitMs, setTransitMs] = useState(520);
  const backend = useHiggsfieldStore((s) => s.backend);

  const go = (next: StudioTab) => {
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
      {/* Title strip */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <Sparkles size={18} className="text-fuchsia-200" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-wide text-slate-50">Higgsfield Creative Suite</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">AI media generation · wired into APEX ENGINEER</p>
          </div>
        </div>
        <NeonHorizonBadge variant={backend === "api" ? "emerald" : backend === "web" ? "cyan" : "neutral"} pulse={backend !== "demo"}>
          BACKEND: {backend.toUpperCase()}
        </NeonHorizonBadge>
      </div>

      {/* Orbital navigation + content viewport */}
      <div className="grid xl:grid-cols-[minmax(300px,400px)_1fr] gap-5 items-start">
        <div className="flex flex-col gap-4 xl:sticky xl:top-2">
          <NeonHorizonGlassPanel
            variant="secondary"
            glow="magenta"
            header={{
              icon: <Orbit size={14} />,
              title: "Mission Globe",
              subtitle: "Drag to spin · click a node to fly there",
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
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                      isActive ? "text-white" : "border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                    }`}
                    style={
                      isActive
                        ? {
                            borderColor: `hsl(${nHue} 90% 70% / 0.55)`,
                            background: `hsl(${nHue} 90% 60% / 0.1)`,
                          }
                        : undefined
                    }
                  >
                    {t.icon}
                    <span className="text-[11px] font-bold tracking-wide">{t.label}</span>
                    <span className="ml-auto font-mono text-[9px] text-slate-500">
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
                className="flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, rgba(15, 23, 42, 0.9), hsl(${nHue} 90% 40% / 0.1))`,
                  borderColor: `hsl(${nHue} 90% 70% / 0.4)`,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                      background: `hsl(${nHue} 95% 60% / 0.25)`,
                      color: `hsl(${nHue} 95% 80%)`,
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
                          background: `hsl(${nHue} 90% 60% / 0.18)`,
                          color: `hsl(${nHue} 95% 80%)`,
                          border: `1px solid hsl(${nHue} 90% 70% / 0.35)`,
                        }}
                      >
                        {curTab.cardinal}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans mt-0.5">{curTab.description}</p>
                  </div>
                </div>

                {/* Fast Cycle Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => go(prevTab.id)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 hover:text-white bg-slate-950/80 hover:bg-slate-800 border border-white/10 transition-all flex items-center gap-1"
                    title={`Rotate globe to ${prevTab.label}`}
                  >
                    ← {prevTab.label}
                  </button>
                  <button
                    onClick={() => go(nextTab.id)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 hover:text-white bg-slate-950/80 hover:bg-slate-800 border border-white/10 transition-all flex items-center gap-1"
                    title={`Rotate globe to ${nextTab.label}`}
                  >
                    {nextTab.label} →
                  </button>
                </div>
              </div>
            );
          })()}

          {tab === "image" && <ImageLabTab />}
          {tab === "cinema" && <CinemaTab />}
          {tab === "audio" && <AudioTab />}
          {tab === "marketing" && <MarketingTab />}
          {tab === "batch" && <BatchTab />}
          {tab === "connect" && <ConnectTab />}
        </div>
      </div>
    </div>
  );
}
