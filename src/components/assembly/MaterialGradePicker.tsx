// ===================================================================
// APEX ENGINE BUILDER — MATERIAL GRADE PICKER
// Interactive Material Variant Comparator & Grade Selection Component
// ===================================================================

import React from "react";
import {
  ShieldCheck,
  Zap,
  DollarSign,
  CheckCircle2,
  Layers,
  Scale,
  Sparkles,
} from "lucide-react";
import { ComponentVariant, MaterialGrade } from "../../sim/assemblyTypes";

interface MaterialGradePickerProps {
  variants: ComponentVariant[];
  selectedVariant: MaterialGrade;
  onSelectVariant: (variantId: MaterialGrade) => void;
  title?: string;
  className?: string;
}

const GRADE_SPECS: Record<
  string,
  {
    icon: string;
    badge: string;
    tensileStrength: string;
    thermalConductivity: string;
    maxBoost: string;
    description: string;
    accentColor: string;
  }
> = {
  cast: {
    icon: "🏭",
    badge: "OEM BASE",
    tensileStrength: "250 MPa",
    thermalConductivity: "48 W/m·K",
    maxBoost: "18 PSI",
    description: "Maximum acoustic damping & low production cost",
    accentColor: "slate",
  },
  forged: {
    icon: "⚒️",
    badge: "RACE SPEC",
    tensileStrength: "310 MPa",
    thermalConductivity: "150 W/m·K",
    maxBoost: "28 PSI",
    description: "45% mass reduction & high heat dissipation",
    accentColor: "cyan",
  },
  billet: {
    icon: "🔩",
    badge: "CNC BILLET",
    tensileStrength: "450 MPa",
    thermalConductivity: "36 W/m·K",
    maxBoost: "48 PSI",
    description: "Double fatigue strength for high-boost setups",
    accentColor: "purple",
  },
  titanium: {
    icon: "🚀",
    badge: "TITANIUM SPEC-R",
    tensileStrength: "950 MPa",
    thermalConductivity: "7.2 W/m·K",
    maxBoost: "65+ PSI",
    description: "Formula-1 hypercar spec with ultra-high strength-to-weight",
    accentColor: "amber",
  },
  ceramic: {
    icon: "🛡️",
    badge: "CERAMIC MATRIX",
    tensileStrength: "600 MPa",
    thermalConductivity: "18 W/m·K",
    maxBoost: "50 PSI",
    description: "Extreme thermal barrier coating with zero heat soak",
    accentColor: "emerald",
  },
};

export function MaterialGradePicker({
  variants,
  selectedVariant,
  onSelectVariant,
  title = "Metallurgy & Material Grade",
  className = "",
}: MaterialGradePickerProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={13} className="text-purple-400" />
          <span>{title}</span>
        </label>
        <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(192,132,252,0.2)]">
          {variants.length} Grades Available
        </span>
      </div>

      {/* Material Variant Selection List */}
      <div className="space-y-2.5">
        {variants.map((v) => {
          const isSelected = selectedVariant === v.id;
          const spec = GRADE_SPECS[v.id] || {
            icon: "⚙️",
            badge: "SPEC",
            tensileStrength: "300 MPa",
            thermalConductivity: "40 W/m·K",
            maxBoost: "20 PSI",
            description: "Engineered alloy component",
            accentColor: "slate",
          };

          return (
            <div
              key={v.id}
              onClick={() => onSelectVariant(v.id)}
              className={`group relative p-3 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                isSelected
                  ? "bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-slate-950/95 border-purple-400 shadow-[0_0_25px_rgba(192,132,252,0.25)] scale-[1.01]"
                  : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
              }`}
            >
              {/* Subtle top edge active glow */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 animate-pulse" />
              )}

              {/* Header: Icon + Name + Badge + Radio Check */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{spec.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs font-mono font-extrabold truncate ${
                          isSelected ? "text-purple-200" : "text-slate-200"
                        }`}
                      >
                        {v.label}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border shrink-0 ${
                          isSelected
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                            : "bg-slate-900 text-slate-400 border-slate-800"
                        }`}
                      >
                        {spec.badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Animated Radio Check Circle */}
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? "border-purple-400 bg-purple-500 shadow-[0_0_10px_rgba(192,132,252,0.6)]"
                      : "border-slate-700 bg-slate-900/80 group-hover:border-slate-600"
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              {/* Sub-description */}
              <p className="text-[10px] text-slate-400 font-mono mb-2 line-clamp-1">
                {spec.description}
              </p>

              {/* Engineering Metrics Progress Bars */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/60 text-[9px] font-mono">
                {/* Power Multiplier */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>Power</span>
                    <span className="text-cyan-400 font-bold">{Math.round(v.hpMultiplier * 100)}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${Math.min(100, (v.hpMultiplier / 1.65) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Weight Multiplier */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>Weight</span>
                    <span className="text-emerald-400 font-bold">{Math.round(v.weightMultiplier * 100)}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${Math.min(100, (v.weightMultiplier / 1.0) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Reliability Delta */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>Reliab</span>
                    <span className="text-amber-400 font-bold">+{v.reliabilityDelta}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${Math.min(100, (v.reliabilityDelta / 25) * 100 || 10)}%` }}
                    />
                  </div>
                </div>

                {/* Cost Multiplier */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>Cost</span>
                    <span className="text-purple-400 font-bold">{v.costMultiplier}x</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
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
