// ===================================================================
// APEX ENGINE BUILDER — METALLURGY GRADE PICKER
// Advanced Material Selector with Real-World Alloy Properties
// ===================================================================

import React, { useState } from "react";
import {
  Layers,
  Flame,
  Thermometer,
  Weight,
  Shield,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Beaker,
  Hammer,
} from "lucide-react";
import { ComponentVariant, MaterialGrade } from "../../sim/assemblyTypes";
import {
  getMaterialGrade,
  type MetallurgyGrade,
  type MetallurgicalProperties,
} from "../../sim/metallurgyDatabase";

interface MaterialGradePickerProps {
  variants: ComponentVariant[];
  selectedVariant: MaterialGrade;
  onSelectVariant: (variantId: MaterialGrade) => void;
  title?: string;
  className?: string;
}

// ─── GRADE METADATA ──────────────────────────────────────────────────────

const GRADE_SPECS: Record<
  string,
  {
    icon: string;
    badge: string;
    tensileStrength: string;
    thermalConductivity: string;
    maxBoost: string;
    density: string;
    hardness: string;
    maxTemp: string;
    description: string;
    accentColor: string;
    heatTreatment?: string;
    process?: string;
    family?: string;
  }
> = {
  cast: {
    icon: "🏭",
    badge: "OEM BASE",
    tensileStrength: "290 MPa",
    thermalConductivity: "48 W/m·K",
    maxBoost: "18 PSI",
    density: "7.20 g/cm³",
    hardness: "220 HB",
    maxTemp: "350°C",
    description: "Gray cast iron — maximum acoustic damping & low production cost",
    accentColor: "slate",
    heatTreatment: "As-Cast",
    process: "Sand Casting",
    family: "Gray Cast Iron",
  },
  forged: {
    icon: "⚒️",
    badge: "RACE SPEC",
    tensileStrength: "560 MPa",
    thermalConductivity: "152 W/m·K",
    maxBoost: "28 PSI",
    density: "2.69 g/cm³",
    hardness: "85 HB",
    maxTemp: "250°C",
    description: "A356-T6 aluminum — 63% weight reduction vs iron with good thermal dissipation",
    accentColor: "cyan",
    heatTreatment: "T6 Temper",
    process: "Sand Casting",
    family: "Aluminum-Silicon",
  },
  billet: {
    icon: "🔩",
    badge: "CNC BILLET",
    tensileStrength: "572 MPa",
    thermalConductivity: "130 W/m·K",
    maxBoost: "48 PSI",
    density: "2.81 g/cm³",
    hardness: "175 HV",
    maxTemp: "200°C",
    description: "7075-T6 aerospace billet — highest strength aluminum with CNC precision",
    accentColor: "purple",
    heatTreatment: "T6 Temper",
    process: "CNC from Billet",
    family: "Aluminum-Zinc",
  },
  titanium: {
    icon: "🚀",
    badge: "TITANIUM SPEC-R",
    tensileStrength: "950 MPa",
    thermalConductivity: "7.2 W/m·K",
    maxBoost: "65+ PSI",
    density: "4.43 g/cm³",
    hardness: "340 HV",
    maxTemp: "400°C",
    description: "Ti-6Al-4V Grade 5 — unbeatable strength-to-weight for F1 components",
    accentColor: "amber",
    heatTreatment: "Solution Treated",
    process: "CNC from Billet",
    family: "Titanium Alloy",
  },
  ceramic: {
    icon: "🛡️",
    badge: "CERAMIC MATRIX",
    tensileStrength: "450 MPa",
    thermalConductivity: "18 W/m·K",
    maxBoost: "50 PSI",
    density: "2.70 g/cm³",
    hardness: "2200 HV",
    maxTemp: "1350°C",
    description: "SiC/SiC CMC — extreme temperature capability with near-zero thermal expansion",
    accentColor: "emerald",
    heatTreatment: "As-Manufactured",
    process: "Additive Manufacturing",
    family: "Ceramic Matrix Composite",
  },
  cast_iron: {
    icon: "🏭",
    badge: "OEM BASE",
    tensileStrength: "290 MPa",
    thermalConductivity: "48 W/m·K",
    maxBoost: "18 PSI",
    density: "7.20 g/cm³",
    hardness: "220 HB",
    maxTemp: "350°C",
    description: "EN-GJL-250 gray cast iron — traditional engine block material",
    accentColor: "slate",
    heatTreatment: "As-Cast",
    process: "Sand Casting",
    family: "Gray Cast Iron",
  },
  nodular_iron: {
    icon: "⚙️",
    badge: "DUCTILE",
    tensileStrength: "600 MPa",
    thermalConductivity: "32 W/m·K",
    maxBoost: "26 PSI",
    density: "7.10 g/cm³",
    hardness: "250 HB",
    maxTemp: "400°C",
    description: "EN-GJS-600-3 — nodular graphite for 3x the strength of gray iron",
    accentColor: "slate",
    heatTreatment: "Annealed",
    process: "Sand Casting",
    family: "Nodular Cast Iron",
  },
  cast_aluminum: {
    icon: "⬡",
    badge: "LIGHTWEIGHT",
    tensileStrength: "310 MPa",
    thermalConductivity: "152 W/m·K",
    maxBoost: "36 PSI",
    density: "2.69 g/cm³",
    hardness: "85 HB",
    maxTemp: "250°C",
    description: "A356.0-T6 — industry standard for high-performance aluminum blocks",
    accentColor: "cyan",
    heatTreatment: "T6 Temper",
    process: "Sand Casting",
    family: "Aluminum-Silicon",
  },
  billet_7075: {
    icon: "🔩",
    badge: "CNC BILLET",
    tensileStrength: "572 MPa",
    thermalConductivity: "130 W/m·K",
    maxBoost: "50 PSI",
    density: "2.81 g/cm³",
    hardness: "175 HV",
    maxTemp: "200°C",
    description: "AA 7075-T6 — aerospace-grade extruded billet for racing pistons",
    accentColor: "purple",
    heatTreatment: "T6 Temper",
    process: "CNC from Billet",
    family: "Aluminum-Zinc",
  },
  maraging_steel: {
    icon: "⚡",
    badge: "ULTRA STRENGTH",
    tensileStrength: "1930 MPa",
    thermalConductivity: "24 W/m·K",
    maxBoost: "72 PSI",
    density: "8.10 g/cm³",
    hardness: "54 HRC",
    maxTemp: "500°C",
    description: "18Ni-300 maraging — extreme tensile strength for F1 crankshafts",
    accentColor: "amber",
    heatTreatment: "Precipitation Hardened",
    process: "Closed-Die Forged",
    family: "Maraging Steel",
  },
  titanium_alloy: {
    icon: "🚀",
    badge: "TITANIUM GRADE 5",
    tensileStrength: "950 MPa",
    thermalConductivity: "7.2 W/m·K",
    maxBoost: "65+ PSI",
    density: "4.43 g/cm³",
    hardness: "340 HV",
    maxTemp: "400°C",
    description: "Ti-6Al-4V — the F1 workhorse with unbeatable strength-to-weight ratio",
    accentColor: "amber",
    heatTreatment: "Solution Treated",
    process: "CNC from Billet",
    family: "Titanium Alloy",
  },
  inconel_718: {
    icon: "🔥",
    badge: "SUPERALLOY",
    tensileStrength: "1240 MPa",
    thermalConductivity: "11.4 W/m·K",
    maxBoost: "65 PSI",
    density: "8.19 g/cm³",
    hardness: "40 HRC",
    maxTemp: "700°C",
    description: "UNS N07718 nickel-chromium superalloy for turbine and exhaust components",
    accentColor: "red",
    heatTreatment: "Precipitation Hardened",
    process: "Investment Cast",
    family: "Nickel Superalloy",
  },
  haynes_230: {
    icon: "🔥",
    badge: "EXOTIC SUPERA",
    tensileStrength: "860 MPa",
    thermalConductivity: "8.9 W/m·K",
    maxBoost: "50 PSI",
    density: "8.97 g/cm³",
    hardness: "210 HV",
    maxTemp: "1100°C",
    description: "Haynes 230 — nickel-chromium-tungsten for extreme oxidation environments",
    accentColor: "red",
    heatTreatment: "Solution Treated",
    process: "Investment Cast",
    family: "Nickel Superalloy",
  },
  cmc: {
    icon: "🛡️",
    badge: "CMC",
    tensileStrength: "450 MPa",
    thermalConductivity: "18 W/m·K",
    maxBoost: "29 PSI",
    density: "2.70 g/cm³",
    hardness: "2200 HV",
    maxTemp: "1350°C",
    description: "SiC/SiC ceramic matrix composite — ultimate high-temp material",
    accentColor: "emerald",
    heatTreatment: "As-Manufactured",
    process: "Additive Manufacturing",
    family: "Ceramic Matrix Composite",
  },
  mim_titanium: {
    icon: "⚡",
    badge: "MIM TITANIUM",
    tensileStrength: "900 MPa",
    thermalConductivity: "6.8 W/m·K",
    maxBoost: "72 PSI",
    density: "4.38 g/cm³",
    hardness: "320 HV",
    maxTemp: "380°C",
    description: "MIM Ti-6Al-4V — near-net-shape titanium for complex geometries",
    accentColor: "amber",
    heatTreatment: "Solution Treated",
    process: "Powder Metallurgy",
    family: "Titanium Alloy",
  },
  chromoly: {
    icon: "🏗️",
    badge: "CHASSIS STEEL",
    tensileStrength: "560 MPa",
    thermalConductivity: "42.7 W/m·K",
    maxBoost: "43 PSI",
    density: "7.85 g/cm³",
    hardness: "22 HRC",
    maxTemp: "550°C",
    description: "AISI 4130 Cr-Mo steel — backbone of motorsport chassis and roll cages",
    accentColor: "cyan",
    heatTreatment: "Quenched & Tempered",
    process: "Open-Die Forged",
    family: "Low Alloy Steel",
  },
  hypereutectic_aluminum: {
    icon: "⬡",
    badge: "HYPEREUTECTIC",
    tensileStrength: "340 MPa",
    thermalConductivity: "135 W/m·K",
    maxBoost: "40 PSI",
    density: "2.73 g/cm³",
    hardness: "120 HB",
    maxTemp: "220°C",
    description: "A390.0-T6 — silicon-hardened cylinder bores, no liners needed",
    accentColor: "cyan",
    heatTreatment: "T6 Temper",
    process: "Die Casting",
    family: "Aluminum-Silicon",
  },
};

// ─── PROPERTY BAR COMPONENT ───────────────────────────────────────────────

function PropertyBar({
  label,
  value,
  displayValue,
  maxValue,
  color,
  unit,
}: {
  label: string;
  value: number;
  displayValue: string;
  maxValue: number;
  color: string;
  unit?: string;
}) {
  const pct = Math.min(100, (value / maxValue) * 100);
  return (
    <div>
      <div className="flex justify-between text-amber-200/60 mb-0.5">
        <span className="truncate">{label}</span>
        <span className={`font-bold ${color}`}>
          {displayValue}
          {unit && <span className="text-amber-300/50 font-normal ml-0.5">{unit}</span>}
        </span>
      </div>
      <div className="h-1.5 w-full bg-amber-900/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500`}
          style={{
            width: `${pct}%`,
            backgroundColor: color.includes("cyan") ? "#fbbf24"
              : color.includes("emerald") ? "#34d399"
              : color.includes("amber") ? "#fbbf24"
              : color.includes("purple") ? "#fbbf24"
              : color.includes("red") ? "#f87171"
              : "#94a3b8",
          }}
        />
      </div>
    </div>
  );
}

// ─── EXPANDED DETAIL PANEL ────────────────────────────────────────────────

function MetallurgyDetailPanel({ grade }: { grade: MetallurgyGrade }) {
  const p = grade.properties;
  return (
    <div className="mt-3 p-3 rounded-xl bg-amber-950/80 border border-amber-800/30 space-y-3">
      {/* Material Family & Designation */}
      <div className="flex items-center gap-2 pb-2 border-b border-amber-800/30">
        <Beaker size={12} className="text-amber-400 shrink-0" />
        <div>
          <div className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
            {grade.designation}
          </div>
          <div className="text-[9px] font-mono text-amber-300/50">{grade.family.replace(/_/g, " ")}</div>
        </div>
      </div>

      {/* Mechanical Properties */}
      <div>
        <div className="flex items-center gap-1 mb-2">
          <Hammer size={10} className="text-amber-400" />
          <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider">
            Mechanical Properties
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px] font-mono">
          <div className="flex justify-between">
            <span className="text-amber-300/50">Yield Strength</span>
            <span className="text-amber-300 font-bold">{p.yieldStrengthMPa} MPa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">UTS</span>
            <span className="text-amber-300 font-bold">{p.ultimateTensileStrengthMPa} MPa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">Fatigue Limit</span>
            <span className="text-amber-300 font-bold">{p.fatigueLimitMPa} MPa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">Elastic Modulus</span>
            <span className="text-amber-100/80 font-bold">{p.youngsModulusGPa} GPa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">Elongation</span>
            <span className="text-emerald-300 font-bold">{p.elongationPercent}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">Hardness</span>
            <span className="text-amber-300 font-bold">{p.hardness.value} {p.hardness.scale}</span>
          </div>
        </div>
      </div>

      {/* Physical Properties */}
      <div>
        <div className="flex items-center gap-1 mb-2">
          <Thermometer size={10} className="text-amber-400" />
          <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider">
            Physical & Thermal
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px] font-mono">
          <div className="flex justify-between">
            <span className="text-amber-300/50">Density</span>
            <span className="text-amber-100/80 font-bold">{(p.densityKgM3 / 1000).toFixed(2)} g/cm³</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">Thermal K</span>
            <span className="text-amber-300 font-bold">{p.thermalConductivityWMK} W/m·K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">CTE</span>
            <span className="text-amber-100/80 font-bold">{p.thermalExpansionUmMK} µm/m·K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">Max Temp</span>
            <span className="text-red-300 font-bold">{p.maxOperatingTempC}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">Melting Point</span>
            <span className="text-amber-100/80 font-bold">{p.meltingPointC}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">Max Boost</span>
            <span className="text-amber-300 font-bold">{(p.maxBoostBar * 14.5).toFixed(0)} PSI</span>
          </div>
        </div>
      </div>

      {/* Manufacturing & Heat Treatment */}
      <div>
        <div className="flex items-center gap-1 mb-2">
          <Flame size={10} className="text-red-400" />
          <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-wider">
            Processing
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px] font-mono">
          <div className="flex justify-between">
            <span className="text-amber-300/50">Heat Treat</span>
            <span className="text-red-300 font-bold">{grade.heatTreatment.replace(/_/g, " ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">Process</span>
            <span className="text-red-300 font-bold">{grade.manufacturingProcess.replace(/_/g, " ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">Corrosion</span>
            <span className="text-emerald-300 font-bold capitalize">{p.corrosionResistance}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">Machinability</span>
            <span className="text-amber-100/80 font-bold capitalize">{p.machinability}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">Cost/kg</span>
            <span className="text-amber-300 font-bold">${p.rawMaterialCostPerKg.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/50">Tooling Life</span>
            <span className="text-amber-100/80 font-bold">{(p.toolingLifeMultiplier * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Alloying Elements */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <Info size={10} className="text-amber-200/60" />
          <span className="text-[9px] font-mono font-bold text-amber-200/60 uppercase tracking-wider">
            Key Alloying Elements
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {p.keyAlloyingElements.map((el, i) => (
            <span
              key={i}
              className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-200/60 border border-amber-800/30"
            >
              {el}
            </span>
          ))}
        </div>
      </div>

      {/* Microstructure */}
      <div className="p-2 rounded-lg bg-amber-900/40 border border-amber-800/30">
        <div className="text-[9px] font-mono text-amber-300/50 mb-1">Microstructure</div>
        <div className="text-[9px] font-mono text-amber-100/80 italic">{p.microstructure}</div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────

export function MaterialGradePicker({
  variants,
  selectedVariant,
  onSelectVariant,
  title = "Metallurgy & Material Grade",
  className = "",
}: MaterialGradePickerProps) {
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono font-bold text-amber-100/80 uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={13} className="text-amber-400" />
          <span>{title}</span>
        </label>
        <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(192,132,252,0.2)]">
          {variants.length} Grades Available
        </span>
      </div>

      {/* Material Variant Selection List */}
      <div className="space-y-2.5">
        {variants.map((v) => {
          const isSelected = selectedVariant === v.id;
          const spec = GRADE_SPECS[v.id] || GRADE_SPECS.cast;
          const isExpanded = expandedGrade === v.id;
          const dbGrade = getMaterialGrade(v.metallurgyId || v.id);

          return (
            <div
              key={v.id}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                isSelected
                  ? "bg-gradient-to-r from-amber-950/80 via-slate-900/90 to-slate-950/95 border-amber-400 shadow-[0_0_25px_rgba(192,132,252,0.25)] scale-[1.01]"
                  : "bg-amber-950/70 border-amber-800/30 hover:border-amber-700/30 hover:bg-amber-900/40"
              }`}
            >
              {/* Subtle top edge active glow */}
              {isSelected && (
                <div className="h-[2px] bg-gradient-to-r from-amber-500 via-cyan-400 to-amber-500 animate-pulse" />
              )}

              {/* Clickable Header */}
              <div
                className="p-3 cursor-pointer"
                onClick={() => onSelectVariant(v.id)}
              >
                {/* Header: Icon + Name + Badge + Radio Check */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{spec.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-xs font-mono font-extrabold truncate ${
                            isSelected ? "text-amber-200" : "text-amber-50"
                          }`}
                        >
                          {v.label}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border shrink-0 ${
                            isSelected
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-amber-900/50 text-amber-200/60 border-amber-800/30"
                          }`}
                        >
                          {spec.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Expand button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedGrade(isExpanded ? null : v.id);
                      }}
                      className={`p-1 rounded-full transition-colors ${
                        isExpanded
                          ? "bg-amber-500/20 text-amber-300"
                          : "text-amber-400 hover:text-amber-200/60 hover:bg-amber-800/35"
                      }`}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {/* Radio Check Circle */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-amber-400 bg-amber-500 shadow-[0_0_10px_rgba(192,132,252,0.6)]"
                          : "border-amber-700/30 bg-amber-900/40 group-hover:border-amber-600/30"
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* Sub-description */}
                <p className="text-[10px] text-amber-200/60 font-mono mb-2 line-clamp-1">
                  {spec.description}
                </p>

                {/* Engineering Metrics Progress Bars */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-amber-800/30 text-[9px] font-mono">
                  <PropertyBar
                    label="Power"
                    value={v.hpMultiplier}
                    displayValue={`${Math.round(v.hpMultiplier * 100)}%`}
                    maxValue={1.7}
                    color="text-amber-400"
                  />
                  <PropertyBar
                    label="Weight"
                    value={v.weightMultiplier}
                    displayValue={`${Math.round(v.weightMultiplier * 100)}%`}
                    maxValue={1.2}
                    color="text-emerald-400"
                  />
                  <PropertyBar
                    label="Reliab"
                    value={v.reliabilityDelta}
                    displayValue={`+${v.reliabilityDelta}%`}
                    maxValue={30}
                    color="text-amber-400"
                  />
                  <PropertyBar
                    label="Cost"
                    value={v.costMultiplier}
                    displayValue={`${v.costMultiplier}x`}
                    maxValue={8}
                    color="text-amber-400"
                  />
                </div>
              </div>

              {/* Expanded Metallurgy Detail Panel */}
              {isExpanded && dbGrade && (
                <MetallurgyDetailPanel grade={dbGrade} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
