/**
 * ============================================================================
 * MODULAR INTERIOR STUDIO — FLAGSHIP STUDIO CONTAINER
 * ============================================================================
 * Master interface integrating:
 * - 3D Interactive WebGL Cabin Viewport with Driver Seat First-Person Look-Around
 * - 5-Tab Precision Workbench (Seats, Dash, Console, Materials, Audio/Cage)
 * - Side-by-Side Cabin A vs B Comparison Bench
 * - 5 Curated Production Presets, Undo/Redo & JSON Serialization
 * ============================================================================
 */

import React, { useEffect, useState } from "react";
import {
  Armchair,
  Layers,
  Sparkles,
  RotateCcw,
  RotateCw,
  Download,
  Upload,
  GitCompare,
  Sliders,
  Check,
  Eye,
} from "lucide-react";
import { MasterInteriorStateEngine, CURATED_INTERIOR_PRESETS } from "../../sim/interior/masterInteriorStateEngine";
import { MasterModularInteriorState } from "../../sim/interior/masterInteriorTypes";
import { ModularInterior3DStudioViewport } from "./ModularInterior3DStudioViewport";
import { ModularInteriorStudioWorkbench } from "./ModularInteriorStudioWorkbench";
import { ModularInteriorComparisonStudio } from "./ModularInteriorComparisonStudio";

export const ModularInteriorStudio: React.FC = () => {
  const engine = MasterInteriorStateEngine.getInstance();
  const [state, setState] = useState<MasterModularInteriorState>(() => engine.getState());
  const [viewMode, setViewMode] = useState<"designer" | "compare">("designer");
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<"seats" | "dash" | "console" | "materials" | "audio_safety" | "bespoke">("seats");

  useEffect(() => {
    const unsub = engine.subscribe((next) => {
      setState({ ...next });
    });
    return unsub;
  }, []);

  const handleExport = () => {
    const json = engine.exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.id}_cabin_config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) engine.importJson(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4 font-sans" style={{ color: "#451A03" }}>
      {/* Decorative Top Accent Line */}
      <div
        className="w-full h-[2px]"
        style={{ background: "linear-gradient(to right, transparent, #D9A64E, transparent)" }}
      />

      {/* Top Banner & Preset Quick-Select */}
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl backdrop-blur-xl shadow-lg"
        style={{ backgroundColor: "rgba(255,248,235,0.85)", border: "1px solid rgba(217,166,78,0.4)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl shadow-md"
            style={{ backgroundColor: "rgba(217,166,78,0.2)", color: "#92400E", border: "1px solid rgba(217,166,78,0.4)" }}
          >
            <Armchair size={22} />
          </div>
          <div>
            <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: "#451A03" }}>
              <span>✦ MODULAR 3D INTERIOR STUDIO ✦</span>
              <span
                className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full"
                style={{ backgroundColor: "rgba(217,166,78,0.2)", color: "#92400E", border: "1px solid rgba(217,166,78,0.4)" }}
              >
                ⚙ 10 SUBASSEMBLIES
              </span>
              <span
                className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/20 text-emerald-800 border border-emerald-500/30"
              >
                💺 360° DRIVER POV
              </span>
            </h2>
            <p className="text-xs font-mono" style={{ color: "#92400E", opacity: 0.85 }}>
              Click 3D parts to customize • 360° Driver Seat Look-Around • Real-time cluster tachometer & HMI screens
            </p>
          </div>
        </div>

        {/* Preset & Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl"
            style={{ backgroundColor: "rgba(255,248,235,0.8)", border: "1px solid rgba(217,166,78,0.3)" }}
          >
            {Object.entries(CURATED_INTERIOR_PRESETS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => engine.loadPreset(key as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  state.id === p.id
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                    : "text-amber-800 hover:text-amber-950 hover:bg-amber-200/50"
                }`}
              >
                {p.name.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("designer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                viewMode === "designer"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "bg-amber-100/60 text-amber-800 border border-amber-300 hover:bg-amber-200/50"
              }`}
            >
              <Sliders size={13} />
              <span>STUDIO</span>
            </button>

            <button
              onClick={() => setViewMode("compare")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                viewMode === "compare"
                  ? "bg-amber-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-amber-100/60 text-amber-800 border border-amber-300 hover:bg-amber-100"
              }`}
            >
              <GitCompare size={13} />
              <span>COMPARE</span>
            </button>
          </div>

          {/* Undo / Redo & JSON IO */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => engine.undo()}
              title="Undo"
              className="p-1.5 rounded-xl bg-amber-100/60 border border-amber-300 text-amber-800 hover:bg-amber-200 cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => engine.redo()}
              title="Redo"
              className="p-1.5 rounded-xl bg-amber-100/60 border border-amber-300 text-amber-800 hover:bg-amber-200 cursor-pointer"
            >
              <RotateCw size={14} />
            </button>
            <button
              onClick={handleExport}
              title="Export JSON"
              className="p-1.5 rounded-xl bg-amber-100/60 border border-amber-300 text-amber-800 hover:bg-amber-200 cursor-pointer"
            >
              <Download size={14} />
            </button>
            <label
              title="Import JSON"
              className="p-1.5 rounded-xl bg-amber-100/60 border border-amber-300 text-amber-800 hover:bg-amber-200 cursor-pointer"
            >
              <Upload size={14} />
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Main Studio View (Hero 3D Viewport) */}
      {viewMode === "designer" ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Left: 3D Interactive Hero Viewport (70% on XL screens) */}
          <div className="xl:col-span-8 h-full">
            <ModularInterior3DStudioViewport
              state={state}
              onSelectPart={(tab) => setActiveWorkbenchTab(tab)}
            />
          </div>

          {/* Right: 5-Tab Workbench & Swatch Wall (30% on XL screens) */}
          <div className="xl:col-span-4 h-[680px]">
            <ModularInteriorStudioWorkbench
              state={state}
              activeTab={activeWorkbenchTab}
              onTabChange={(tab) => setActiveWorkbenchTab(tab)}
            />
          </div>
        </div>
      ) : (
        <ModularInteriorComparisonStudio currentCabin={state} />
      )}
    </div>
  );
};
