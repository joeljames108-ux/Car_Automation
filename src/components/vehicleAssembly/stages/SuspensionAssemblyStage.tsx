/**
 * ============================================================================
 * STAGE 4: SUSPENSION — INBOARD PUSHROD WISHBONES, COILOVERS, ANTI-ROLL BARS
 * ============================================================================
 * Attach 4-corner wishbones to chassis hardpoints. Configure inboard pushrod
 * actuation, active electronically-controlled coilovers and anti-roll bars.
 */

import React from "react";
import { Activity, CheckCircle2, Zap, CircleDot } from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface SuspensionAssemblyStageProps {
  suspensionType: InstalledSubsystemsState["suspensionType"];
  onUpdateSuspension: (type: InstalledSubsystemsState["suspensionType"]) => void;
  activeCoilovers?: boolean;
  onUpdateActiveCoilovers?: (enabled: boolean) => void;
  arbFrontNmPerDeg?: number;
  arbRearNmPerDeg?: number;
  onUpdateArb?: (patch: { arbFrontNmPerDeg?: number; arbRearNmPerDeg?: number }) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

export const SuspensionAssemblyStage: React.FC<SuspensionAssemblyStageProps> = ({
  suspensionType,
  onUpdateSuspension,
  activeCoilovers = true,
  onUpdateActiveCoilovers = () => {},
  arbFrontNmPerDeg = 250,
  arbRearNmPerDeg = 180,
  onUpdateArb = () => {},
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

  // Live handling balance estimate from ARB split
  const totalArb = (arbFrontNmPerDeg || 0) + (arbRearNmPerDeg || 0);
  const balanceNote =
    totalArb === 0
      ? "No anti-roll stiffness fitted — expect heavy body roll."
      : arbFrontNmPerDeg > arbRearNmPerDeg * 1.35
      ? "Front-stiff ARB bias → understeer-safe entry, stable for novice drivers."
      : arbRearNmPerDeg > arbFrontNmPerDeg * 1.35
      ? "Rear-stiff ARB bias → rotation-happy entry, suits experienced drivers."
      : "Balanced ARB split → neutral platform across compound corner phases.";

  const arbBarMm = (nm: number) => (18 + (nm / 220) * 14).toFixed(0);

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
              Attach wishbones, uprights & tie-rods. Trim active coilovers and hollow anti-roll bars.
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
              <div className="text-[10px] font-mono pt-2 border-t border-base-800/60 text-slate-400">
                Camber Gain: <strong className="text-cyan-600 dark:text-cyan-300">{s.camberGain}</strong>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Coilovers Toggle */}
      <button
        onClick={() => onUpdateActiveCoilovers(!activeCoilovers)}
        className={`w-full p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
          activeCoilovers
            ? "bg-emerald-500/15 border-emerald-500/50 ring-1 ring-emerald-500/40"
            : "bg-base-900/60 border-base-800 hover:border-base-700"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Zap size={13} className="text-emerald-400" /> ACTIVE ELECTRONIC COILOVERS
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
            activeCoilovers ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-base-800 border-base-700 text-slate-500"
          }`}>
            {activeCoilovers ? "✓ ACTIVE (1000 Hz)" : "PASSIVE"}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Remote-reservoir dampers with ride-height sensor pucks and solenoid damping actuators at all four corners.
          {activeCoilovers
            ? " Skyhook mode engaged: 1000Hz compression/rebound adaptation per wheel."
            : " Fixed valving — passive spring/damper units."}
        </p>
      </button>

      {/* Anti-Roll Bars */}
      <div className="p-3.5 rounded-2xl bg-base-900/60 border border-base-800 space-y-4">
        <label className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <CircleDot size={13} className="text-red-400" /> HOLLOW BLADE-ADJUSTABLE ANTI-ROLL BARS
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 dark:text-slate-300 font-bold">Front ARB</span>
              <span className="text-red-500 font-bold">{arbFrontNmPerDeg} Nm/° · ⌀{arbBarMm(arbFrontNmPerDeg)}mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="220"
              step="10"
              value={arbFrontNmPerDeg}
              onChange={(e) => onUpdateArb({ arbFrontNmPerDeg: parseInt(e.target.value) })}
              className="w-full accent-red-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>Soft</span><span>Race Stiff</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 font-bold">Rear ARB</span>
              <span className="text-red-500 font-bold">{arbRearNmPerDeg} Nm/° · ⌀{arbBarMm(arbRearNmPerDeg)}mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="220"
              step="10"
              value={arbRearNmPerDeg}
              onChange={(e) => onUpdateArb({ arbRearNmPerDeg: parseInt(e.target.value) })}
              className="w-full accent-red-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>Soft</span><span>Race Stiff</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-base-800/60">
          Balance prediction: {balanceNote}
        </p>
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
