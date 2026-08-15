// ===================================================================
// APEX ENGINE BUILDER — MATERIAL GRADE PICKER (PHASE 20)
// Interactive Material Variant Comparator & Grade Selection Component
// ===================================================================

import React from "react";
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Layers,
  Award,
} from "lucide-react";
import { ComponentVariant, MaterialGrade } from "../../sim/assemblyTypes";

interface MaterialGradePickerProps {
  variants: ComponentVariant[];
  selectedVariant: MaterialGrade;
  onSelectVariant: (variantId: MaterialGrade) => void;
  title?: string;
  className?: string;
}

const GRADE_ICONS: Record<MaterialGrade, { icon: string; tone: string; badge: string }> = {
  cast: { icon: "🏭", tone: "text-slate-400", badge: "OEM BASE" },
  forged: { icon: "⚒️", tone: "text-cyan-400", badge: "RACE SPEC" },
  billet: { icon: "🔩", tone: "text-purple-400", badge: "CNC BILLET" },
  titanium: { icon: "🚀", tone: "text-amber-400", badge: "TITANIUM" },
  ceramic: { icon: "🛡️", tone: "text-emerald-400", badge: "CERAMIC" },
};

export function MaterialGradePicker({
  variants,
  selectedVariant,
  onSelectVariant,
  title = "Metallurgy & Material Grade",
  className = "",
}: MaterialGradePickerProps) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={13} className="text-purple-400" />
          <span>{title}</span>
        </label>
        <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
          {variants.length} Grades Available
        </span>
      </div>

      {/* Material Variant Selection List */}
      <div className="space-y-2">
        {variants.map((v) => {
          const isSelected = selectedVariant === v.id;
          const gradeMeta = GRADE_ICONS[v.id] || {
            icon: "⚙️",
            tone: "text-slate-400",
            badge: "SPEC",
          };

          return (
            <div
              key={v.id}
              onClick={() => onSelectVariant(v.id)}
              className={`group relative p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-purple-950/50 via-base-900/90 to-base-950/90 border-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.25)] scale-[1.01]"
                  : "bg-base-950/70 border-slate-800 hover:border-slate-700 hover:bg-base-900/80"
              }`}
            >
              {/* Header: Name + Badge + Checkmark */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{gradeMeta.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-extrabold ${
                          isSelected ? "text-purple-200" : "text-slate-200"
                        }`}
                      >
                        {v.label}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                          isSelected
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                            : "bg-base-900 text-slate-500 border-slate-800"
                        }`}
                      >
                        {gradeMeta.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-purple-400 bg-purple-500 text-black shadow-[0_0_8px_rgba(192,132,252,0.6)]"
                      : "border-slate-700 bg-slate-900"
                  }`}
                >
                  {isSelected && <CheckCircle2 size={11} />}
                </div>
              </div>

              {/* Stat Multiplier Comparison Bars */}
              <div className="grid grid-cols-4 gap-2 mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                {/* HP Multiplier */}
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Power</span>
                    <span className="text-cyan-300 font-bold">{(v.hpMultiplier * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1 bg-base-950 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${Math.min(100, (v.hpMultiplier / 2) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Weight Multiplier */}
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Weight</span>
                    <span
                      className={`font-bold ${
                        v.weightMultiplier < 1 ? "text-emerald-300" : "text-slate-300"
                      }`}
                    >
                      {(v.weightMultiplier * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-base-950 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${Math.min(100, v.weightMultiplier * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Reliability Delta */}
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Reliability</span>
                    <span className="text-amber-300 font-bold">
                      {v.reliabilityDelta >= 0 ? `+${v.reliabilityDelta}%` : `${v.reliabilityDelta}%`}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-base-950 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${Math.min(100, (v.reliabilityDelta + 25) * 2)}%` }}
                    />
                  </div>
                </div>

                {/* Cost Multiplier */}
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Cost</span>
                    <span className="text-purple-300 font-bold">{v.costMultiplier}x</span>
                  </div>
                  <div className="w-full h-1 bg-base-950 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full"
                      style={{ width: `${Math.min(100, (v.costMultiplier / 4.5) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
