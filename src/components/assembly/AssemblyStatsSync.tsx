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
    <div className="absolute top-5 right-5 z-40 flex items-center gap-3.5 p-3.5 px-4 rounded-2xl bg-white/85 border border-white/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] animate-stage-transition-enter text-left pointer-events-none select-none">
      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200/80 shadow-sm flex items-center justify-center">
        <CheckCircle2 size={22} className="stroke-[2.5]" />
      </div>

      <div>
        <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
          INSTALLED & TORQUED
        </div>
        <div className="text-sm font-extrabold text-slate-800 tracking-tight">{meta.name}</div>
        <div className="flex items-center gap-3 mt-1 text-xs font-mono font-bold">
          {meta.statDeltas.hp > 0 && (
            <span className="text-blue-600 flex items-center gap-0.5">
              <TrendingUp size={12} /> +{meta.statDeltas.hp} HP
            </span>
          )}
          {meta.statDeltas.torque > 0 && (
            <span className="text-slate-800 flex items-center gap-0.5">
              <Zap size={12} /> +{meta.statDeltas.torque} Nm
            </span>
          )}
          {meta.statDeltas.cost > 0 && (
            <span className="text-amber-600 flex items-center gap-0.5">
              <DollarSign size={12} /> +${meta.statDeltas.cost}
            </span>
          )}
          {meta.statDeltas.reliability !== 0 && (
            <span className="text-slate-700 flex items-center gap-0.5">
              <ShieldCheck size={12} /> {meta.statDeltas.reliability > 0 ? "+" : ""}{meta.statDeltas.reliability}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
