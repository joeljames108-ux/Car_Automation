/**
 * ============================================================================
 * STAGE 4: SUSPENSION & KINEMATICS STAGE
 * ============================================================================
 */

import React from "react";
import { Activity, CheckCircle2, Sliders, Shield } from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface SuspensionAssemblyStageProps {
  suspensionType: InstalledSubsystemsState["suspensionType"];
  onUpdateSuspension: (type: InstalledSubsystemsState["suspensionType"]) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

export const SuspensionAssemblyStage: React.FC<SuspensionAssemblyStageProps> = ({
  suspensionType,
  onUpdateSuspension,
  isInstalled,
  onInstall,
}) => {
  const suspensions: {
    id: InstalledSubsystemsState["suspensionType"];
    label: string;
    camberGain: string;
    rollStiffness: string;
    desc: string;
  }[] = [
    {
      id: "double_wishbone",
      label: "Double Wishbone (Pushrod GT3)",
      camberGain: "-1.8°/deg roll",
      rollStiffness: "High (Track)",
      desc: "Unequal-length A-arms with inboard pushrod-actuated coilover dampers for pure kinematic control.",
    },
    {
      id: "pushrod",
      label: "Formula 1 Inboard Torsion Bar",
      camberGain: "-2.4°/deg roll",
      rollStiffness: "Very High (Race)",
      desc: "Carbon composite wishbones with 3rd-element heave springs for high downforce pitch control.",
    },
    {
      id: "multilink",
      label: "5-Link Inboard Multi-Link",
      camberGain: "-1.4°/deg roll",
      rollStiffness: "Adaptive",
      desc: "Decoupled lateral and longitudinal links providing optimal tire contact patch compliance.",
    },
    {
      id: "air_active",
      label: "Active Magnetorheological & Air",
      camberGain: "-1.2°/deg roll",
      rollStiffness: "Variable (1000Hz)",
      desc: "Dual-chamber air springs with 1,000Hz magnetic fluid damping for dynamic anti-roll leveling.",
    },
  ];

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              STAGE 4: 4-CORNER SUSPENSION & KINEMATICS
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Attach 4-corner wishbones, dampers, tie-rods, and uprights to the chassis hardpoints.
            </p>
          </div>
        </div>
        {isInstalled && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <CheckCircle2 size={14} /> SUSPENSION INSTALLED
          </span>
        )}
      </div>

      {/* Suspension Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suspensions.map((s) => {
          const isSelected = suspensionType === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onUpdateSuspension(s.id)}
              className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                isSelected
                  ? "bg-blue-500/20 border-blue-500/60 shadow-md ring-1 ring-blue-500/40"
                  : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">{s.label}</span>
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-300 font-bold">{s.rollStiffness}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5">{s.desc}</p>
              <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-base-800/60 text-slate-400">
                <span>Camber Gain: <strong className="text-cyan-600 dark:text-cyan-300">{s.camberGain}</strong></span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-ATTACH SUSPENSION" : "INSTALL SUSPENSION & PROCEED TO BRAKES"}
        </button>
      </div>
    </div>
  );
};
