import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Sliders,
  Box,
  Check,
  Maximize2,
  Activity,
  Copy,
  Code,
} from "lucide-react";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import { useKineticTheme } from "./KineticThemeEngine";
import { NeonHorizonGlassPanel } from "./design/NeonHorizonGlassPanel";
import { NeonHorizonTabs } from "./design/NeonHorizonTabs";
import { NeonHorizonSlider } from "./design/NeonHorizonSlider";
import { NeonHorizonToggle } from "./design/NeonHorizonToggle";
import { NeonHorizonButton } from "./design/NeonHorizonButton";
import { NeonHorizonBadge } from "./design/NeonHorizonBadge";
import { NeonHorizonProgressRing } from "./design/NeonHorizonProgressRing";

export function AnimMasterComponentCatalog() {
  const { theme, soundEnabled } = useKineticTheme();
  const [activeTab, setActiveTab] = useState<string>("tilt_cards");

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Component State Dials
  const [sliderVal, setSliderVal] = useState(65);
  const [switch1, setSwitch1] = useState(true);
  const [switch2, setSwitch2] = useState(false);
  const [radialVal, setRadialVal] = useState(84);
  const [tiltAmount, setTiltAmount] = useState(8);

  // Mouse tilt tracking
  const [cardTilt, setCardTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const ry = (x / (rect.width / 2)) * tiltAmount;
    const rx = -(y / (rect.height / 2)) * tiltAmount;
    setCardTilt({ rx, ry });
  };

  const handleMouseLeaveCard = () => {
    setCardTilt({ rx: 0, ry: 0 });
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    if (soundEnabled) playHMIClickSound();
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const tabs = [
    { id: "tilt_cards", label: "3D Tilt Cards", icon: <Box size={14} /> },
    { id: "spring_sliders", label: "Elastic Sliders", icon: <Sliders size={14} /> },
    { id: "micro_switches", label: "Micro Switches", icon: <Check size={14} /> },
    { id: "stagger_lists", label: "Stagger Lists", icon: <Layers size={14} /> },
    { id: "radial_rings", label: "Radial Rings", icon: <Activity size={14} /> },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header Banner */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "ANIMMASTER COMPONENT CATALOG & ENGINE",
          subtitle: "Inspect, test micro-interactions, and copy production-ready code snippets",
          icon: <Sparkles size={16} />,
          badge: <NeonHorizonBadge variant="live">300+ PRO COMPONENTS</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-xs text-slate-300 max-w-2xl">
            Interactive playground for automotive design tokens, glassmorphism containers, physics sliders, and SVG gauges.
          </p>
          <div className="flex items-center gap-2">
            <NeonHorizonBadge variant="cyan">Theme: {theme.name}</NeonHorizonBadge>
          </div>
        </div>
      </NeonHorizonGlassPanel>

      {/* Component Category Navigation Tabs */}
      <NeonHorizonTabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />

      {/* Main Interactive Showcase Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Playground (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* TAB 1: 3D TILT CARDS */}
          {activeTab === "tilt_cards" && (
            <NeonHorizonGlassPanel
              variant="primary"
              corners="reticle"
              header={{
                title: "3D Perspective Kinetic Tilt Card",
                subtitle: "Hover to test real-time 3D spring momentum & specular glare",
                icon: <Box size={16} />,
              }}
              className="p-6"
            >
              <div className="flex justify-center items-center p-8 bg-[#040712]/80 rounded-2xl border border-cyan-500/20 min-h-[300px] perspective-1000">
                <div
                  onMouseMove={handleMouseMoveCard}
                  onMouseLeave={handleMouseLeaveCard}
                  style={{
                    transform: `rotateX(${cardTilt.rx}deg) rotateY(${cardTilt.ry}deg)`,
                    transition: cardTilt.rx === 0 ? "transform 0.5s ease-out" : "none",
                    transformStyle: "preserve-3d",
                  }}
                  className="w-full max-w-md bg-gradient-to-br from-[#0a1226]/90 via-[#101c3d]/90 to-[#0a1226]/90 p-6 rounded-2xl border border-cyan-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,229,255,0.2)] relative overflow-hidden cursor-pointer group"
                >
                  {/* Dynamic Glare */}
                  <div
                    style={{
                      opacity: Math.abs(cardTilt.rx) > 0 ? 0.35 : 0,
                      background: `radial-gradient(circle at ${50 + cardTilt.ry * 5}% ${50 - cardTilt.rx * 5}%, rgba(255,255,255,0.4), transparent 60%)`,
                    }}
                    className="absolute inset-0 pointer-events-none transition-opacity"
                  />

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs nh-font-mono font-bold text-cyan-400 tracking-wider">APEX AUTOMOTIVE TELEMETRY</span>
                    <NeonHorizonBadge variant="magenta">HYPERCAR V8</NeonHorizonBadge>
                  </div>

                  <h4 className="text-xl font-black text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">
                    Koenigsegg Jesko Attack Telemetry
                  </h4>
                  <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                    Ultra-high downforce active aerodynamics (1000kg @ 275km/h) coupled with a 1600 HP Twin-Turbo Flat-Plane V8.
                  </p>

                  <div className="grid grid-cols-3 gap-3 border-t border-cyan-500/20 pt-4 nh-font-mono">
                    <div className="bg-[#050917] p-2.5 rounded-xl border border-cyan-500/20 text-center">
                      <div className="text-[9px] text-slate-400">POWER</div>
                      <div className="text-sm font-bold text-cyan-300">1600 HP</div>
                    </div>
                    <div className="bg-[#050917] p-2.5 rounded-xl border border-cyan-500/20 text-center">
                      <div className="text-[9px] text-slate-400">REDLINE</div>
                      <div className="text-sm font-bold text-fuchsia-300">8500 RPM</div>
                    </div>
                    <div className="bg-[#050917] p-2.5 rounded-xl border border-cyan-500/20 text-center">
                      <div className="text-[9px] text-slate-400">TOP SPEED</div>
                      <div className="text-sm font-bold text-emerald-300">480 km/h</div>
                    </div>
                  </div>
                </div>
              </div>
            </NeonHorizonGlassPanel>
          )}

          {/* TAB 2: ELASTIC SPRING SLIDERS */}
          {activeTab === "spring_sliders" && (
            <NeonHorizonGlassPanel
              variant="primary"
              corners="reticle"
              header={{
                title: "Elastic Spring Physics Slider",
                subtitle: "High-precision slider with haptic sound marks and smooth value lerp",
                icon: <Sliders size={16} />,
              }}
              className="p-6 flex flex-col gap-6"
            >
              <NeonHorizonSlider
                label="TURBOCHARGER BOOST PRESSURE"
                value={sliderVal}
                min={0}
                max={100}
                unit="BAR"
                formatValue={(v) => (v * 0.035).toFixed(2)}
                onChange={setSliderVal}
                color="cyan"
              />
            </NeonHorizonGlassPanel>
          )}

          {/* TAB 3: MICRO SWITCHES */}
          {activeTab === "micro_switches" && (
            <NeonHorizonGlassPanel
              variant="primary"
              corners="reticle"
              header={{
                title: "Sci-Fi Micro Switch Toggles",
                icon: <Check size={16} />,
              }}
              className="p-6 flex flex-col gap-4"
            >
              <NeonHorizonToggle
                label="DRS HYDRAULIC ACTUATOR"
                description="Automatically deploys rear wing DRS in high-speed zones"
                checked={switch1}
                onChange={setSwitch1}
                color="cyan"
              />
              <NeonHorizonToggle
                label="TRACTION CONTROL SYSTEM (TC)"
                description="Closed-loop spark retard torque reduction"
                checked={switch2}
                onChange={setSwitch2}
                color="magenta"
              />
            </NeonHorizonGlassPanel>
          )}

          {/* TAB 4: STAGGER LISTS */}
          {activeTab === "stagger_lists" && (
            <NeonHorizonGlassPanel
              variant="primary"
              corners="reticle"
              header={{
                title: "Staggered Animation Subsystem Nodes",
                icon: <Layers size={16} />,
              }}
              className="p-6 flex flex-col gap-3"
            >
              {[
                { name: "Powertrain V12 Monoblock", status: "Nominal", latency: "0.4ms" },
                { name: "Aero Venturi Tuners", status: "Calibrated", latency: "0.2ms" },
                { name: "Brake Torque Vectoring", status: "Active", latency: "0.1ms" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#081226]/80 border border-cyan-500/20 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-slate-100">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] nh-font-mono text-cyan-300">{item.latency}</span>
                    <NeonHorizonBadge variant="live">{item.status}</NeonHorizonBadge>
                  </div>
                </div>
              ))}
            </NeonHorizonGlassPanel>
          )}

          {/* TAB 5: RADIAL RINGS */}
          {activeTab === "radial_rings" && (
            <NeonHorizonGlassPanel
              variant="primary"
              corners="reticle"
              header={{
                title: "SVG Circular Progress Gauges",
                icon: <Activity size={16} />,
              }}
              className="p-6 flex items-center justify-around gap-4"
            >
              <NeonHorizonProgressRing percentage={radialVal} color="cyan" sublabel="AERO EFF" />
              <NeonHorizonProgressRing percentage={68} color="magenta" sublabel="THERMAL" />
              <NeonHorizonProgressRing percentage={92} color="emerald" sublabel="STRUCTURAL" />
            </NeonHorizonGlassPanel>
          )}
        </div>

        {/* Right Code Export Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="secondary"
            corners="rounded"
            header={{
              title: "Code Snippet Export",
              icon: <Code size={14} />,
              actions: (
                <NeonHorizonButton
                  variant="ghost"
                  size="xs"
                  icon={<Copy size={12} />}
                  onClick={() => copyToClipboard(`<NeonHorizonGlassPanel variant="primary" glow="cyan" />`, "snippet")}
                >
                  {copiedCode ? "Copied!" : "Copy"}
                </NeonHorizonButton>
              ),
            }}
            className="p-4"
          >
            <pre className="p-3 rounded-xl bg-[#03060f] border border-cyan-500/20 text-[11px] nh-font-mono text-cyan-300 overflow-x-auto">
              <code>{`<NeonHorizonGlassPanel
  variant="primary"
  glow="cyan"
  corners="reticle"
  header={{
    title: "LIVE STATS",
    icon: <Zap size={14} />
  }}
>
  <NeonHorizonDataCard
    label="POWER"
    value={1600}
    unit="HP"
  />
</NeonHorizonGlassPanel>`}</code>
            </pre>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
