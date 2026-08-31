import React, { useState } from "react";
import {
  Sofa,
  Volume2,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Play,
  Check,
  Cpu,
  Box,
  Layers,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSelect } from "../design/NeonHorizonSelect";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import { InteriorsDesigner } from "../../InteriorsDesigner";
import { ModularInteriorWorkshop } from "../../vehicleAssembly/ModularInteriorWorkshop";
import { HyperFidelityCockpitStudioCustomizer } from "../../interior/HyperFidelityCockpitStudioCustomizer";
import { InteriorDashboardConfiguratorStudio } from "../../interior/InteriorDashboardConfiguratorStudio";

type InteriorStudioTab = "configurator" | "hyper_fidelity_studio" | "cockpit_3d_studio" | "interior_workshop" | "hmi_quick_tune";

export function NeonInteriorStudio() {
  const { design, sim, updateInterior, updateInfotainment } = useDesign();

  const [activeTab, setActiveTab] = useState<InteriorStudioTab>("configurator");
  const [clusterTheme, setClusterTheme] = useState<string>("cyberpunk_neon");
  const [seatType, setSeatType] = useState<string>("carbon_bucket");
  const [ambientColor, setAmbientColor] = useState<string>("#8fb9d9");
  const [soundMode, setSoundMode] = useState<string>("v12_symphony");

  const ambientColors = ["#8fb9d9", "#a78bfa", "#34d399", "#d9b36c", "#ff5252"];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header Banner */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "HOLOGRAPHIC COCKPIT & HMI STUDIO",
          subtitle: "Digital cluster skins, carbon fiber ergonomics, and synthetic acoustic feedback",
          icon: <Sofa size={18} />,
          badge: <NeonHorizonBadge variant="live">HMI CLUSTER ONLINE</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NeonHorizonDataCard label="CABIN SPL @ 100 KM/H" value={64} unit="dBA" accentColor="cyan" />
          <NeonHorizonDataCard label="INTERIOR MASS" value={145} unit="kg" accentColor="magenta" />
          <NeonHorizonDataCard label="INFOTAINMENT LATENCY" value="1.2" unit="ms" accentColor="emerald" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: "configurator" as const, label: "Interior Configurator", icon: <Sliders size={14} /> },
          { id: "hyper_fidelity_studio" as const, label: "✨ Hyper-Fidelity 3D Studio", icon: <Sparkles size={14} /> },
          { id: "cockpit_3d_studio" as const, label: "3D Cockpit & Interior Designer", icon: <Box size={14} /> },
          { id: "interior_workshop" as const, label: "Modular Interior Workshop", icon: <Layers size={14} /> },
          { id: "hmi_quick_tune" as const, label: "HMI Cluster Quick Tune", icon: <Sliders size={14} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playHMITabSound();
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs nh-font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,229,255,0.25)]"
                  : "text-amber-300/60 hover:text-amber-100 hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View 0: Interior Dashboard Configurator */}
      {activeTab === "configurator" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-amber-950/80" style={{height: 'calc(100vh - 180px)', minHeight: '600px'}}>
          <InteriorDashboardConfiguratorStudio />
        </div>
      )}

{/* View 0: Hyper-Fidelity 3D Studio */}
      {activeTab === "hyper_fidelity_studio" && (
        <div className="w-full h-[700px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <HyperFidelityCockpitStudioCustomizer />
        </div>
      )}

      {/* View 1: 3D Cockpit Designer */}
      {activeTab === "cockpit_3d_studio" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-amber-950/80 p-3">
          <InteriorsDesigner />
        </div>
      )}

      {/* View 2: Modular Interior Workshop */}
      {activeTab === "interior_workshop" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-amber-950/80 p-3">
          <ModularInteriorWorkshop
            activeChassisId={design.vehicle.chassis}
            config={{}}
            onUpdateInterior={() => {}}
          />
        </div>
      )}

      {/* View 3: Quick HMI Tune */}
      {activeTab === "hmi_quick_tune" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <NeonHorizonGlassPanel
              variant="primary"
              corners="reticle"
              header={{
                title: "HOLOGRAPHIC INSTRUMENT CLUSTER",
                subtitle: "Theme preset, refresh rate, and telemetry layout",
                icon: <Cpu size={16} />,
              }}
              className="p-6 flex flex-col gap-5"
            >
              <NeonHorizonSelect
                label="DIGITAL CLUSTER THEME"
                value={clusterTheme}
                onChange={(val) => setClusterTheme(val)}
                options={[
                  { value: "cyberpunk_neon", label: "Apex Cyberpunk Neon", sublabel: "High contrast cyan/magenta HUD gauges" },
                  { value: "minimalist_gt", label: "Minimalist GT Track Spec", sublabel: "Center rev dial with delta delta timer" },
                  { value: "luxury_stealth", label: "Obsidian Smoked Frosted Glass", sublabel: "Elegant muted typography and subtle dials" },
                ]}
              />

              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold text-amber-300/60 uppercase tracking-wider">
                  AMBIENT COCKPIT LED ILLUMINATION
                </span>
                <div className="flex items-center gap-3">
                  {ambientColors.map((col) => (
                    <button
                      key={col}
                      onClick={() => setAmbientColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
 ambientColor === col ? "scale-125 border-white" : "border-transparent opacity-70"
 }`}
                    />
                  ))}
                </div>
              </div>
            </NeonHorizonGlassPanel>
          </div>

          {/* Right Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <NeonHorizonGlassPanel
              variant="window"
              glow="magenta"
              corners="reticle"
              header={{
                title: "SEATING & ERGONOMICS",
                icon: <Sofa size={16} />,
              }}
              className="p-6 flex flex-col gap-4"
            >
              <NeonHorizonSelect
                label="SEAT ARCHITECTURE"
                value={seatType}
                onChange={(val) => setSeatType(val)}
                options={[
                  { value: "carbon_bucket", label: "Fixed-Back FIA Carbon Bucket", sublabel: "6-point harness slots · 4.8 kg" },
                  { value: "sport_bolster", label: "18-Way Adjustable Bolstered Leather", sublabel: "Pneumatic side lumbar support · 18.2 kg" },
                  { value: "alcantara_comfort", label: "Alcantara Ergonomic Cruiser", sublabel: "Heating, cooling & massage · 22.5 kg" },
                ]}
              />
            </NeonHorizonGlassPanel>
          </div>
        </div>
      )}
    </div>
  );
}
