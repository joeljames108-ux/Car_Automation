import React from "react";
import {
  TrendingUp,
  Zap,
  DollarSign,
  ShieldCheck,
  Wrench,
  Ruler,
} from "lucide-react";
import {
  AssemblyComponentMeta,
  ComponentVariant,
  AssemblyPhase,
} from "../../sim/assemblyTypes";

interface StatDeltaBadgesProps {
  meta: AssemblyComponentMeta;
  variant?: ComponentVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatDeltaBadges: React.FC<StatDeltaBadgesProps> = ({
  meta,
  variant,
  size = "sm",
  className = "",
}) => {
  const hpMultiplier = variant?.hpMultiplier ?? 1;
  const costMultiplier = variant?.costMultiplier ?? 1;

  const hp = Math.round(meta.statDeltas.hp * hpMultiplier);
  const torque = meta.statDeltas.torque;
  const cost = Math.round(meta.statDeltas.cost * costMultiplier);
  const reliability = meta.statDeltas.reliability;

  const iconSizes = { sm: 9, md: 12, lg: 14 };
  const textClasses = {
    sm: "text-[9.5px] font-mono",
    md: "text-xs font-mono font-bold",
    lg: "text-sm font-mono font-bold",
  };

  const iconSize = iconSizes[size];
  const textCls = textClasses[size];

  if (size === "lg") {
    return (
      <div className={`grid grid-cols-2 gap-3 ${className}`}>
        <div className="bg-amber-950/60/80 border border-slate-800/80 rounded-2xl p-3">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <TrendingUp size={iconSize} className="text-amber-400" /> Peak Power
          </span>
          <div className="text-lg font-mono font-bold text-amber-300 mt-1">
            +{hp} HP
          </div>
        </div>

        <div className="bg-amber-950/60/80 border border-slate-800/80 rounded-2xl p-3">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Zap size={iconSize} className="text-pink-400" /> Peak Torque
          </span>
          <div className="text-lg font-mono font-bold text-pink-300 mt-1">
            +{torque} Nm
          </div>
        </div>

        <div className="bg-amber-950/60/80 border border-slate-800/80 rounded-2xl p-3">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <ShieldCheck size={iconSize} className="text-emerald-400" /> Durability
          </span>
          <div className="text-lg font-mono font-bold text-emerald-300 mt-1">
            {reliability > 0 ? "+" : ""}{reliability}%
          </div>
        </div>

        <div className="bg-amber-950/60/80 border border-slate-800/80 rounded-2xl p-3">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <DollarSign size={iconSize} className="text-amber-400" /> Total Cost
          </span>
          <div className="text-lg font-mono font-bold text-amber-300 mt-1">
            +${cost.toLocaleString()}
          </div>
        </div>
      </div>
    );
  }

  if (size === "md") {
    return (
      <div className={`flex items-center gap-3 ${textCls} ${className}`}>
        {hp > 0 && (
          <span className="text-amber-600 dark:text-amber-300 flex items-center gap-0.5">
            <TrendingUp size={iconSize} /> +{hp} HP
          </span>
        )}
        {torque > 0 && (
          <span className="text-pink-600 dark:text-pink-300 flex items-center gap-0.5">
            <Zap size={iconSize} /> +{torque} Nm
          </span>
        )}
        {cost > 0 && (
          <span className="text-amber-600 dark:text-amber-300 flex items-center gap-0.5">
            <DollarSign size={iconSize} /> +${cost}
          </span>
        )}
        {reliability !== 0 && (
          <span className="text-emerald-600 dark:text-emerald-300 flex items-center gap-0.5">
            <ShieldCheck size={iconSize} /> {reliability > 0 ? "+" : ""}{reliability}%
          </span>
        )}
      </div>
    );
  }

  // sm size (used in ComponentLibrary card)
  return (
    <div className={`grid grid-cols-3 gap-1 ${textCls} ${className}`}>
      <span className="flex items-center gap-0.5 text-amber-300">
        <TrendingUp size={iconSize} />
        <span>+{hp} HP</span>
      </span>
      <span className="flex items-center gap-0.5 text-pink-300">
        <Zap size={iconSize} />
        <span>+{torque} Nm</span>
      </span>
      <span className="flex items-center gap-0.5 text-amber-300">
        <DollarSign size={iconSize} />
        <span>+${cost}</span>
      </span>
    </div>
  );
};

interface TorqueClearanceReadoutProps {
  meta: AssemblyComponentMeta;
  variant?: "compact" | "full";
  className?: string;
}

export const TorqueClearanceReadout: React.FC<TorqueClearanceReadoutProps> = ({
  meta,
  variant = "compact",
  className = "",
}) => {
  if (!meta.torqueSpec && !meta.clearanceSpec) return null;

  if (variant === "full") {
    return (
      <div className={`p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 font-mono text-[10px] space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-amber-400 font-bold uppercase tracking-wide">
          <span className="flex items-center gap-1">
            <Zap size={11} className="text-amber-400" />
            Fastener & Fit Specs
          </span>
          <span className="text-[9px] text-amber-300/80">{meta.name}</span>
        </div>

        {meta.torqueSpec && (
          <div className="flex items-center justify-between bg-base-900/60 p-1.5 rounded-lg border border-amber-900/40">
            <span className="text-slate-300">
              {meta.torqueSpec.fastenerName} ({meta.torqueSpec.boltCount}x)
            </span>
            <span className="text-amber-400 font-bold">
              {meta.torqueSpec.snugNm} Nm + {meta.torqueSpec.finalAngleDeg}° TTY
            </span>
          </div>
        )}

        {meta.clearanceSpec && (
          <div className="flex items-center justify-between bg-base-900/60 p-1.5 rounded-lg border border-amber-900/40">
            <span className="text-slate-300">{meta.clearanceSpec.label}</span>
            <span className="text-emerald-400 font-bold">
              {meta.clearanceSpec.targetMm} mm ({meta.clearanceSpec.minMm}-{meta.clearanceSpec.maxMm})
            </span>
          </div>
        )}
      </div>
    );
  }

  // compact mode (used in hover tooltips)
  return (
    <div className={`mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 text-[10px] font-mono ${className}`}>
      {meta.torqueSpec && (
        <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
          <Wrench size={10} /> {meta.torqueSpec.snugNm} Nm + {meta.torqueSpec.finalAngleDeg}° ({meta.torqueSpec.boltCount}x)
        </span>
      )}
      {meta.clearanceSpec && (
        <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
          <Ruler size={10} /> {meta.clearanceSpec.label}: {meta.clearanceSpec.targetMm}mm
        </span>
      )}
    </div>
  );
};

export function getComponentSoundType(meta?: AssemblyComponentMeta): "heavy" | "click" | "slide" | "spool" | "metallic" | "pneumatic" {
  if (!meta) return "click";
  return meta.soundType || "click";
}

export function getComponentTorqueDisplay(meta?: AssemblyComponentMeta, phase?: AssemblyPhase): string {
  if (!meta || !meta.torqueSpec) {
    if (phase === "locking") return "LOCKED";
    if (phase === "inserting") return "ALIGNING";
    return "TORQUE N/A";
  }

  const { snugNm, finalAngleDeg } = meta.torqueSpec;
  if (phase === "confirming") {
    return `${snugNm} Nm + ${finalAngleDeg}° TTY PASSED`;
  }
  if (phase === "locking") {
    return `${snugNm} Nm + ${finalAngleDeg}° TTY LOCKED`;
  }
  return `${snugNm} Nm TORQUE`;
}
