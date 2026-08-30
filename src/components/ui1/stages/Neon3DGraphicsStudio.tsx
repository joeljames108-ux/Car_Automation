import React, { useState } from "react";
import {
  Box,
  Layers,
  Sparkles,
  Car,
  Flame,
  Wrench,
  Shield,
  Activity,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import { EngineAndCar3DGraphicsViewport } from "../../vehicleAssembly/EngineAndCar3DGraphicsViewport";
import { ModularEngine3DViewport } from "../../../engine3d/ModularEngine3DViewport";
import { ModularExterior3DViewport } from "../../../exterior3d/ModularExterior3DViewport";

type ViewportTab = "all_in_one" | "engine_assembly" | "exterior_assembly";

export function Neon3DGraphicsStudio() {
  const { sim, design } = useDesign();

  const [activeTab, setActiveTab] = useState<ViewportTab>("all_in_one");

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "PHOTOREALISTIC 3D ENGINE & CAR GRAPHICS STUDIO",
          subtitle: "Real-time Three.js WebGL rendering, PBR metallic shaders, kinematics & exploded sub-assemblies",
          icon: <Box size={18} />,
          badge: <NeonHorizonBadge variant="live">PBR 3D PIPELINE LIVE</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="TOTAL VEHICLE MASS" value={sim.weight} unit="kg" accentColor="cyan" />
          <NeonHorizonDataCard label="PEAK HORSEPOWER" value={sim.peakPower} unit="HP" accentColor="gold" />
          <NeonHorizonDataCard label="CENTER OF MASS (Z)" value="340 mm" accentColor="emerald" />
          <NeonHorizonDataCard label="3D SHADER ENGINE" value="ACES Film" accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: "all_in_one" as const, label: "Flagship 3D Studio (Vehicle & Engine)", icon: <Car size={14} /> },
          { id: "engine_assembly" as const, label: "Modular Engine 3D Assembly", icon: <Flame size={14} /> },
          { id: "exterior_assembly" as const, label: "Modular Exterior 3D Assembly", icon: <Layers size={14} /> },
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
 ? "bg-amber-500/25 text-sky-200 border border-amber-500/30"
 : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
 }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: All-in-One 3D Studio */}
      {activeTab === "all_in_one" && (
        <div className="w-full min-h-[700px] h-[780px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] bg-amber-950/60 relative">
          <EngineAndCar3DGraphicsViewport />
        </div>
      )}

      {/* Tab 2: Modular Engine 3D Assembly */}
      {activeTab === "engine_assembly" && (
        <div className="w-full min-h-[700px] h-[780px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] bg-amber-950/60 relative">
          <ModularEngine3DViewport
            className="w-full h-full"
            engineConfig={design.engine}
            showFloatingPanels={true}
          />
        </div>
      )}

      {/* Tab 3: Modular Exterior 3D Assembly */}
      {activeTab === "exterior_assembly" && (
        <div className="w-full min-h-[700px] h-[780px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] bg-amber-950/60 relative">
          <ModularExterior3DViewport
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
}
