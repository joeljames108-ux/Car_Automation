// ============================================================================
// AERO STUDIO MASTER COMPONENT
// ============================================================================
// Master assembly for the Aero Design Studio stage. Unites sub-tab navigation,
// the Three.js modular CAD GLB viewport, camera focus controls, and the
// parameter configuration deck situated directly below the 3D model.
// ============================================================================

import React from "react";
import {
  Wind,
  Sliders,
  Gauge,
  Zap,
  Flame,
  Layers,
  Shield,
  Activity,
  ChevronRight,
  Sparkles,
  Car,
  Compass,
  CircleDot,
  Radio,
  Check,
} from "lucide-react";
import {
  useAeroStudioStore,
  AeroStudioSubTab,
  VEHICLE_ARCHITECTURES,
  VehicleArchitecture,
} from "../../state/aeroStudioStore";
import { useModularVehicleBuilderStore } from "../../state/modularVehicleBuilderStore";
import { useGuidedEngineeringStore } from "../../state/guidedEngineeringStore";
import { AeroStudioCanvasViewport } from "./AeroStudioCanvasViewport";
import { AeroControlDeck } from "./AeroControlDeck";

interface SubTabItem {
  id: AeroStudioSubTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const SUB_TABS: SubTabItem[] = [
  { id: "frontAero", label: "Front Aero", icon: <Wind size={14} />, badge: "Splitter & Dive Planes" },
  { id: "rearAero", label: "Rear Aero", icon: <Wind size={14} />, badge: "Dual Swan-Neck Wing" },
  { id: "sideAero", label: "Side Aero", icon: <Layers size={14} />, badge: "Skirts & Rockers" },
  { id: "underbody", label: "Underbody", icon: <Layers size={14} />, badge: "Venturi Diffuser" },
  { id: "roofAero", label: "Roof Aero", icon: <Compass size={14} />, badge: "LMP1 Shark Fin" },
  { id: "activeAero", label: "Active Aero", icon: <Zap size={14} />, badge: "DRS & Airbrake" },
  { id: "coolingAero", label: "Cooling Aero", icon: <Flame size={14} />, badge: "Louvers & NACA" },
  { id: "wheelAero", label: "Wheel Aero", icon: <CircleDot size={14} />, badge: "Turbofan Discs" },
  { id: "aeroSummary", label: "Aero Summary", icon: <Gauge size={14} />, badge: "Wind Tunnel Telemetry" },
];

interface AeroStudioProps {
  onSelectStage?: (stage: string) => void;
}

export const AeroStudio: React.FC<AeroStudioProps> = ({ onSelectStage }) => {
  const { aeroStatus, markStageComplete, setActiveWorkflowStage } = useGuidedEngineeringStore();
  const activeSubTab = useAeroStudioStore((s) => s.activeSubTab);
  const setActiveSubTab = useAeroStudioStore((s) => s.setActiveSubTab);
  const physics = useAeroStudioStore((s) => s.physics);
  const config = useAeroStudioStore((s) => s.config);
  const vehicleVariant = useAeroStudioStore((s) => s.vehicleVariant);
  const setVehicleVariant = useAeroStudioStore((s) => s.setVehicleVariant);
  const modularModel = useModularVehicleBuilderStore((s) => s.selectedModel);

  return (
    <div className="w-full min-h-screen bg-[#05070a] text-slate-100 p-4 md:p-6 flex flex-col gap-5">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Wind size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                AERO DESIGN STUDIO
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40">
                  BLENDER 5.2 CAD TWIN
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Interactive modular aerodynamic surface tuner with real-time mechanical hinge pivots and surrogate Navier-Stokes physics.
              </p>
            </div>
          </div>
        </div>

        {/* Right Header: Host Vehicle Sync Badge & Wind Tunnel Telemetry Ticker */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Host Vehicle Live Sync Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 rounded-xl px-3 py-1.5 font-mono text-xs shadow-lg">
            <Car size={14} className="text-cyan-400" />
            <span className="text-slate-400">Host Vehicle:</span>
            <select
              value={vehicleVariant || modularModel || "sedan"}
              onChange={(e) => setVehicleVariant(e.target.value as VehicleArchitecture)}
              className="bg-slate-800 text-cyan-300 font-bold px-2 py-0.5 rounded border border-slate-700 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {Object.values(VEHICLE_ARCHITECTURES).map((arch) => (
                <option key={arch.id} value={arch.id}>
                  {arch.label} ({arch.badge.split("•")[0].trim()})
                </option>
              ))}
            </select>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              SYNCED
            </span>
          </div>

          {/* Global Key Metric Quick Ticker */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs">
            <Radio size={14} className="text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Wind Tunnel:</span>
            <span className="text-cyan-400 font-bold">{config.airspeedKmh} km/h</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Downforce:</span>
            <span className="text-cyan-300 font-bold">{physics.totalDownforceN.toFixed(0)} N</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Balance:</span>
            <span className="text-emerald-400 font-bold">{physics.aeroBalanceFrontPct.toFixed(1)}% Front</span>
          </div>
        </div>
      </div>

      {/* Stage 3 Workflow Action Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#0d1424]/90 via-[#10192e]/90 to-[#0d1424]/90 border border-amber-500/30 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
            aeroStatus === "configured"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-teal-500/15 text-teal-400 border border-teal-500/30"
          }`}>
            {aeroStatus === "configured" ? <Check size={18} /> : <Wind size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-100">
                STAGE 3: AERODYNAMIC PACKAGE & DOWNFORCE
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                aeroStatus === "configured"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : aeroStatus === "invalidated"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-teal-500/20 text-teal-300 border border-teal-500/40"
              }`}>
                {aeroStatus === "configured"
                  ? "✓ CONFIGURED"
                  : aeroStatus === "invalidated"
                  ? "⚠ RECALCULATION REQUIRED"
                  : "IN PROGRESS"}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Total Downforce: {physics.totalDownforceN.toFixed(0)} N • Aero Balance: {physics.aeroBalanceFrontPct.toFixed(1)}% Front • Drag Cd: {physics.totalCd.toFixed(3)}
            </p>
          </div>
        </div>

        {onSelectStage && (
          <button
            type="button"
            onClick={() => {
              markStageComplete("aero");
              setActiveWorkflowStage("interior");
              onSelectStage("interior");
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-mono font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Check size={15} strokeWidth={3} />
            <span>COMPLETE AERO & ADVANCE TO INTERIOR →</span>
          </button>
        )}
      </div>

      {/* Sub-Tab Navigation Header */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
        {SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_16px_rgba(0,240,255,0.2)]"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? "bg-cyan-900/60 text-cyan-200" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3D Viewport with Three.js WebGL and live Blender GLBs */}
      <div className="w-full">
        <AeroStudioCanvasViewport />
      </div>

      {/* Configuration Controls directly beneath the 3D GLB Viewport */}
      <div className="w-full">
        <AeroControlDeck />
      </div>
    </div>
  );
};
