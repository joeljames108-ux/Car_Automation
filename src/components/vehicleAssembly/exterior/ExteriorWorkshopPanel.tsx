// ===================================================================
// EXTERIOR ASSEMBLY WORKSHOP PANEL & METALLURGY LAB
// ===================================================================
// Multi-tabbed engineering workstation with Materials Lab, Paint Booth,
// and Panel Fit Tolerance Inspector. (Aero is handled under Aero Lab).
// ===================================================================

import React, { useState } from "react";
import {
  Palette,
  Layers,
  Wrench,
  Shield,
  Gauge,
  Sliders,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";
import { APEX_HERITAGE_PAINT_SWATCHES } from "../../../sim/constants/exteriorConstants";
import { usePanelGapAudit } from "../../../state/exteriorAssemblyHooks";

export type WorkshopTab = "paint" | "materials" | "fit_finish";

export const ExteriorWorkshopPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorkshopTab>("paint");

  const paintConfig = useExteriorAssemblyStore((s) => s.paintConfig);
  const exteriorConfig = useExteriorAssemblyStore((s) => s.exteriorConfig);

  const updatePaintConfig = useExteriorAssemblyStore((s) => s.updatePaintConfig);
  const updateExteriorConfig = useExteriorAssemblyStore((s) => s.updateExteriorConfig);

  const panelGapAudit = usePanelGapAudit();

  return (
    <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-4 backdrop-blur-xl shadow-2xl space-y-4">
      {/* ── WORKSHOP SUB-PANEL NAVIGATION TABS ── */}
      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab("paint")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
            activeTab === "paint"
              ? "bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Palette size={13} />
          <span>PAINT BOOTH</span>
        </button>

        <button
          onClick={() => setActiveTab("materials")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
            activeTab === "materials"
              ? "bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers size={13} />
          <span>METALLURGY</span>
        </button>

        <button
          onClick={() => setActiveTab("fit_finish")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
            activeTab === "fit_finish"
              ? "bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Gauge size={13} />
          <span>GAP AUDIT</span>
        </button>
      </div>

      {/* ── 1. PAINT BOOTH WORKBENCH ── */}
      {activeTab === "paint" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Preset Swatches Palette */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-2">
              HERITAGE AUTOMOTIVE COLORWAY
            </label>
            <div className="grid grid-cols-5 gap-2">
              {APEX_HERITAGE_PAINT_SWATCHES.map((swatch) => (
                <button
                  key={swatch.id}
                  onClick={() =>
                    updatePaintConfig({
                      primaryColorHex: swatch.hex,
                      finishType: swatch.finishRecommended,
                    })
                  }
                  className={`group relative h-10 rounded-xl border flex items-end p-1 transition-all ${
                    paintConfig.primaryColorHex.toLowerCase() === swatch.hex.toLowerCase()
                      ? "border-amber-400 scale-105 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                      : "border-white/10 hover:border-white/40"
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                  title={`${swatch.name} — ${swatch.brandInspiration}`}
                >
                  <span className="text-[9px] font-mono font-bold text-white bg-slate-950/80 px-1 rounded truncate w-full">
                    {swatch.name.split(" ")[1] || swatch.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Paint Finish Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 block">
              CLEAR COAT & FINISH CHEMISTRY
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              {(
                [
                  "high_gloss_mirror",
                  "liquid_metallic",
                  "tri_coat_pearl_iridescent",
                  "deep_satin_matte",
                  "candy_translucent_tint",
                  "exposed_tinted_carbon",
                ] as const
              ).map((finish) => (
                <button
                  key={finish}
                  onClick={() => updatePaintConfig({ finishType: finish })}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    paintConfig.finishType === finish
                      ? "bg-amber-500/20 text-amber-300 border-amber-400 font-bold"
                      : "bg-slate-950 text-slate-400 border-white/10 hover:border-white/20"
                  }`}
                >
                  {finish.replace(/_/g, " ").toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Two-Tone Livery Partitioning */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-white/10">
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 block">
                Contrast Gloss Roof Pack
              </span>
              <span className="text-[11px] text-slate-400">
                Paints roof and A/B/C pillars in contrast gloss nero
              </span>
            </div>
            <input
              type="checkbox"
              checked={paintConfig.roofContrastColor}
              onChange={(e) => updatePaintConfig({ roofContrastColor: e.target.checked })}
              className="w-4 h-4 accent-amber-400 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ── 2. METALLURGY & MATERIALS LAB ── */}
      {activeTab === "materials" && (
        <div className="space-y-3 animate-fadeIn text-xs font-mono">
          <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 space-y-1.5">
            <span className="text-amber-400 font-bold block">Carbon Fiber Monocoque</span>
            <p className="text-[11px] text-slate-400 font-sans">
              Autoclaved Toray T1000G pre-preg offers maximum torsional rigidity (38.5 kNm/deg) at 55% weight reduction over steel.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 space-y-1.5">
            <span className="text-emerald-400 font-bold block">Aerospace Titanium Tub (Ti-6Al-4V)</span>
            <p className="text-[11px] text-slate-400 font-sans">
              Provides infinite fatigue life with superior acoustic vibration damping and exceptional high-temperature resistance.
            </p>
          </div>
        </div>
      )}

      {/* ── 3. SHUT-LINE GAP TOLERANCE AUDIT ── */}
      {activeTab === "fit_finish" && (
        <div className="space-y-2.5 animate-fadeIn max-h-60 overflow-y-auto pr-1">
          {panelGapAudit.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono"
            >
              <div>
                <span className="text-slate-200 font-bold block">{item.rule.panelPairLabel}</span>
                <span className="text-[10px] text-slate-500">
                  Target: {item.rule.nominalGapMm}mm (±{item.rule.tolerancePlusMm}mm)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-bold">{item.measuredGapMm}mm</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    item.gapStatus === "nominal"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  }`}
                >
                  {item.gapStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
