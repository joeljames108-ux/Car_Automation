import React from "react";
import { Zap, Flag, Shield, Fuel, Flame, Gauge, ArrowRight } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { useToast } from "./ToastSystem";
import { ZoomableGlassCard } from "./ui/ZoomableGlassCard";
import { VEHICLE_PRESET_LIBRARY, createBaseDesign, createV12Hybrid1000HpDesign } from "../sim/vehiclePresets";
import type { VehicleDesign } from "../sim/types";

export interface PresetCardItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  description: string;
  stats: string;
  generator: () => VehicleDesign;
}

export function PresetQuickSelect() {
  const { setDesign } = useDesign();
  const toast = useToast();

  const presets: PresetCardItem[] = [
    {
      id: "v12_hybrid_1000hp",
      title: "1000 HP V12 Hybrid Valkyrie",
      badge: "V12 Hybrid 1000 HP",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      icon: <Flame size={18} className="text-purple-400 animate-pulse" />,
      description: "6.4L Screaming 9,200 RPM V12 + 180kW Solid-State PHEV Electric Drive generating 1,000 HP total output.",
      stats: "1,000 HP • 6.4L V12 + 180kW Hybrid • Carbon Ceramic AWD",
      generator: () => createV12Hybrid1000HpDesign(),
    },
  {
    id: "sprint_race",
    title: "Sprint Race Setup",
    badge: "High Performance",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
    icon: <Flag size={18} className="text-red-400" />,
    description: "Aggressive aero downforce, ultra-soft slicks, short ratio gearbox & high RPM limit for sprint domination.",
    stats: "Ultra-Soft Slicks • 4.10 Final Drive • High Downforce",
    generator: () => {
      const v = createBaseDesign("Sprint Race Special", "hypercar", "hypercar");
      v.engine.layout = "v8";
      v.engine.bore = 88;
      v.engine.stroke = 82;
      v.engine.redline = 9000;
      v.engine.intake = "twin_turbo";
      v.engine.boostPressure = 1.6;
      v.vehicle.tireCompound = "soft";
      v.vehicle.finalDrive = 4.10;
      v.vehicle.aero.wingAngle = 18;
      v.vehicle.aero.splitterLength = 120;
      v.vehicle.brakeType = "carbon_ceramic";
      v.vehicle.brakePadCompound = 0.9;
      return v;
    },
  },
  {
    id: "high_downforce",
    title: "High Downforce",
    badge: "Technical Circuit",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    icon: <Gauge size={18} className="text-cyan-400" />,
    description: "Maximizes ground effect, rear wing AoA, and aggressive splitter for maximum cornering speeds at Monaco & Hungaroring.",
    stats: "15° Wing AoA • Ground Effect Tunnel • Active Aero Enabled",
    generator: () => {
      const v = createBaseDesign("AeroApex Downforce GT", "upper_mid", "coupe");
      v.engine.layout = "v6";
      v.engine.redline = 8500;
      v.engine.intake = "twin_turbo";
      v.vehicle.aero.wingAngle = 22;
      v.vehicle.aero.splitterLength = 140;
      v.vehicle.aero.underbody = "ground_effect";
      v.vehicle.tireCompound = "soft";
      v.vehicle.suspensionFront = "double_wishbone";
      v.vehicle.suspensionRear = "multilink";
      return v;
    },
  },
  {
    id: "fuel_efficient",
    title: "Fuel Efficient",
    badge: "Endurance & Eco",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    icon: <Fuel size={18} className="text-emerald-400" />,
    description: "Lean air-fuel ratio tuning, low drag coefficient bodywork, tall final drive ratios, and active hybrid energy harvest.",
    stats: "2.92 Final Drive • Sleek Aerodynamics • Lean AFR Tuning",
    generator: () => {
      const v = createBaseDesign("EcoStream Hybrid GT", "lower_mid", "sedan");
      v.engine.layout = "i4";
      v.engine.hybridArchitecture = "phev";
      v.engine.hybridMotorPower = 80;
      v.engine.batteryCapacity = 14;
      v.vehicle.aero.bodyShape = 0.95;
      v.vehicle.aero.wingAngle = 2;
      v.vehicle.finalDrive = 2.92;
      v.vehicle.tireCompound = "hard";
      return v;
    },
  },
  {
    id: "balanced_street",
    title: "Balanced Sport GT",
    badge: "Street & Track",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: <Zap size={18} className="text-amber-400" />,
    description: "Perfect equilibrium between daily comfort, reliable cooling margins, manageable cost, and track capability.",
    stats: "Medium Slicks • Balanced Aero • Sports Suspension",
    generator: () => {
      const v = createBaseDesign("Apex Sport GT", "upper_mid", "coupe");
      v.engine.layout = "v6";
      v.engine.redline = 7500;
      v.vehicle.tireCompound = "medium";
      v.vehicle.finalDrive = 3.55;
      v.vehicle.aero.wingAngle = 8;
      return v;
    },
  },
];

  const applyPreset = (preset: PresetCardItem) => {
    const newDesign = preset.generator();
    setDesign(newDesign);
    toast.success(
      `Preset Applied: ${preset.title}`,
      `Vehicle configuration updated with ${preset.stats}.`
    );
  };

  return (
    <div className="panel border border-base-800 rounded-2xl p-4 mb-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent-500/20 text-accent-400 border border-accent-500/30">
            <Zap size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quick-Start Engineering Presets</h3>
            <p className="text-[11px] text-slate-400">Instant setup templates to jump-start your vehicle configuration</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-500 hidden sm:block">
          Click preset to load complete config
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presets.map((p) => (
          <ZoomableGlassCard
            key={p.id}
            title={p.title}
            badge={p.badge}
            subtitle={p.stats}
            expandedContent={
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-400/30 text-[#007aff]">
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{p.title}</h3>
                    <p className="text-xs text-slate-500 font-mono">{p.stats}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-blue-200/40">
                  {p.description}
                </p>
                <button
                  onClick={() => applyPreset(p)}
                  className="w-full py-2.5 rounded-xl bg-[#007aff] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-blue-600 transition-all"
                >
                  <span>Apply Specification Blueprint</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            }
          >
            <div
              onClick={() => applyPreset(p)}
              className="group relative glass-panel border border-base-800 hover:border-accent-500/50 rounded-xl p-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/5 hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-semibold font-mono px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 text-accent-400 transition-opacity">
                    <ArrowRight size={14} />
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-base-950 border border-base-800 group-hover:border-accent-500/30 transition-colors">
                    {p.icon}
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                    {p.title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-2">
                  {p.description}
                </p>
              </div>
              <div className="pt-2 border-t border-base-850/80 text-[10px] font-mono text-accent-300/80 truncate">
                {p.stats}
              </div>
            </div>
          </ZoomableGlassCard>
        ))}
      </div>
    </div>
  );
}
