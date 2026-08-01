import {
  TrendingUp,
  Zap,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { ComponentId, ENGINE_ASSEMBLY_COMPONENTS } from "../../sim/assemblyTypes";

interface AssemblyStatsSyncProps {
  lastInstalledId: ComponentId | null;
}

export function AssemblyStatsSync({ lastInstalledId }: AssemblyStatsSyncProps) {
  if (!lastInstalledId) return null;

  const meta = ENGINE_ASSEMBLY_COMPONENTS.find((c) => c.id === lastInstalledId);
  if (!meta) return null;

  return (
    <div className="absolute top-4 right-4 z-40 flex items-center gap-3 p-3 rounded-2xl bg-base-900/90 border border-cyan-500/40 backdrop-blur-xl shadow-2xl animate-stage-transition-enter text-left pointer-events-none select-none">
      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 size={18} />
      </div>

      <div>
        <div className="text-[9.5px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
          INSTALLED & TORQUED
        </div>
        <div className="text-xs font-bold text-slate-100">{meta.name}</div>
        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
          {meta.statDeltas.hp > 0 && (
            <span className="text-cyan-300 font-bold flex items-center gap-0.5">
              <TrendingUp size={10} /> +{meta.statDeltas.hp} HP
            </span>
          )}
          {meta.statDeltas.torque > 0 && (
            <span className="text-pink-300 font-bold flex items-center gap-0.5">
              <Zap size={10} /> +{meta.statDeltas.torque} Nm
            </span>
          )}
          {meta.statDeltas.cost > 0 && (
            <span className="text-amber-300 font-bold flex items-center gap-0.5">
              <DollarSign size={10} /> +${meta.statDeltas.cost}
            </span>
          )}
          {meta.statDeltas.reliability !== 0 && (
            <span className="text-emerald-300 font-bold flex items-center gap-0.5">
              <ShieldCheck size={10} /> {meta.statDeltas.reliability > 0 ? "+" : ""}{meta.statDeltas.reliability}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
