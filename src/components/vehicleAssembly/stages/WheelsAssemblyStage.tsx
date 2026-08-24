/**
 * ============================================================================
 * STAGE 6: WHEELS & TIRES — FORGED CONCAVE CENTERLOCK RIMS + RACING SLICKS
 * ============================================================================
 * Mount forged concave centerlock monoblock rims with racing slicks or
 * semi-slicks. Includes centerlock torque spec and tire warmer protocol.
 */

import React, { useState } from "react";
import { Disc, CheckCircle2, Flame, Thermometer } from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface WheelsAssemblyStageProps {
  wheelStyle: InstalledSubsystemsState["wheelStyle"];
  tireCompound: InstalledSubsystemsState["tireCompound"];
  onUpdateWheels: (patch: {
    wheelStyle?: InstalledSubsystemsState["wheelStyle"];
    tireCompound?: InstalledSubsystemsState["tireCompound"];
  }) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

export const WheelsAssemblyStage: React.FC<WheelsAssemblyStageProps> = ({
  wheelStyle,
  tireCompound,
  onUpdateWheels,
  isInstalled,
  onInstall,
}) => {
  const [warmersOn, setWarmersOn] = useState(true);

  const wheelStyles: {
    id: InstalledSubsystemsState["wheelStyle"];
    label: string;
    weight: string;
    strength: string;
    spec: string;
    desc: string;
  }[] = [
    {
      id: "centerlock_gt3",
      label: "Centerlock Forged GT3 Monoblock",
      weight: "8.4 kg / wheel",
      strength: "Motorsport Spec",
      spec: "Deep-concave 10-spoke · 600 Nm center nut · R/L handed threads",
      desc: "Single central locking nut with lightweight forged aluminum deep-concave spoke construction.",
    },
    {
      id: "forged_turbofan",
      label: "Aero Turbofan Carbon Disc",
      weight: "8.9 kg / wheel",
      strength: "High Downforce",
      spec: "Carbon turbofan shroud · brake heat extraction",
      desc: "Integrated carbon fiber aero blade covers that extract brake heat and reduce air turbulence.",
    },
    {
      id: "carbon_spoke",
      label: "Full Carbon Fiber Barrel & Spokes",
      weight: "6.2 kg / wheel",
      strength: "Ultra-Lightweight",
      spec: "Hollow prepreg spokes · -40% rotational inertia",
      desc: "Hollow prepreg carbon fiber wheel reducing rotational unsprung inertia by 40%.",
    },
    {
      id: "deep_dish",
      label: "Multi-Piece Forged Deep Dish",
      weight: "9.6 kg / wheel",
      strength: "Stance & Track",
      spec: "3-piece modular · polished step lip · Ti hardware",
      desc: "Forged 3-piece modular alloy rim with polished step lip and titanium assembly hardware.",
    },
  ];

  const tireCompounds: {
    id: InstalledSubsystemsState["tireCompound"];
    label: string;
    gripCoeff: string;
    longevity: string;
    wetRating: string;
    opTemp: string;
  }[] = [
    { id: "racing_slick", label: "Full Racing Slick (Dry)", gripCoeff: "1.75 G Peak Grip", longevity: "250 km (Race)", wetRating: "Dry Only", opTemp: "90–110°C" },
    { id: "semi_slick", label: "Trackday Semi-Slick (R-Comp)", gripCoeff: "1.45 G Peak Grip", longevity: "6,000 km", wetRating: "Damp Safe", opTemp: "70–95°C" },
    { id: "street_sport", label: "Ultra-High Performance Street", gripCoeff: "1.25 G Peak Grip", longevity: "25,000 km", wetRating: "All-Weather", opTemp: "40–70°C" },
  ];

  const selectedTire = tireCompounds.find((t) => t.id === tireCompound) || tireCompounds[1];

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Disc size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              STAGE 6: WHEELS & MOTORSPORT TYRES
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Mount forged concave rims and high-grip compounds onto the 4-corner hubs.
            </p>
          </div>
        </div>
        {isInstalled && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <CheckCircle2 size={14} /> WHEELS INSTALLED
          </span>
        )}
      </div>

      {/* Wheel Rim Styles */}
      <div className="space-y-2">
        <label className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 block">
          FORGED RIM ARCHITECTURE & FINISH
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {wheelStyles.map((w) => {
            const isSelected = wheelStyle === w.id;
            return (
              <button
                key={w.id}
                onClick={() => onUpdateWheels({ wheelStyle: w.id })}
                className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/40"
                    : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">{w.label}</span>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-300 font-bold">{w.weight}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">{w.desc}</p>
                <div className="space-y-0.5 text-[10px] font-mono pt-2 border-t border-base-800/60">
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold">{w.strength}</div>
                  <div className="text-slate-500 dark:text-slate-400">{w.spec}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tire Compound Selection */}
      <div className="space-y-2">
        <label className="text-xs bold font-mono text-slate-700 dark:text-slate-300 block">
          TIRE COMPOUND & TREAD PATTERN
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {tireCompounds.map((tc) => {
            const isSelected = tireCompound === tc.id;
            return (
              <button
                key={tc.id}
                onClick={() => onUpdateWheels({ tireCompound: tc.id })}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-500/60 shadow-md ring-1 ring-amber-500/40"
                    : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
                }`}
              >
                <div className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 mb-1">{tc.label}</div>
                <div className="space-y-0.5 text-[10px] font-mono text-slate-400">
                  <div>Grip: <strong className="text-emerald-400">{tc.gripCoeff}</strong></div>
                  <div>Life: <strong className="text-slate-300">{tc.longevity}</strong></div>
                  <div>Weather: <strong className="text-cyan-300">{tc.wetRating}</strong></div>
                  <div>Op. Temp: <strong className="text-orange-400">{tc.opTemp}</strong></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tire Warmer Protocol */}
      <div className="p-3.5 rounded-2xl bg-base-900/60 border border-base-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-orange-400" />
          <div>
            <div className="text-xs font-bold font-mono text-slate-700 dark:text-slate-200">TIRE WARMER PROTOCOL</div>
            <div className="text-[10px] font-mono text-slate-500">
              {warmersOn ? `Blankets @ ${selectedTire.opTemp.split("–")[0]}°C — instant green-flag grip window` : "Cold tires — 1 formation lap to reach operating window"}
            </div>
          </div>
        </div>
        <button
          onClick={() => setWarmersOn(!warmersOn)}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
            warmersOn ? "bg-orange-500/20 border-orange-500/50 text-orange-400" : "bg-base-800 border-base-700 text-slate-500"
          }`}
        >
          {warmersOn ? (
            <span className="flex items-center gap-1"><Thermometer size={12} /> BLANKETS ON</span>
          ) : (
            "BLANKETS OFF"
          )}
        </button>
      </div>

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-MOUNT WHEELS" : "INSTALL WHEELS & PROCEED TO BODY PANELS"}
        </button>
      </div>
    </div>
  );
};
