import {
  TrendingUp,
  Zap,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { ComponentId, ENGINE_ASSEMBLY_COMPONENTS } from "../../sim/assemblyTypes";

interface AssemblyStatsSyncProps {
  hoveredComponentId: ComponentId | null;
  installedComponents?: ComponentId[];
}

export function AssemblyStatsSync({
  hoveredComponentId,
  installedComponents = [],
}: AssemblyStatsSyncProps) {
  // Show tooltip card ONLY when a component is actively hovered
  if (!hoveredComponentId) return null;

  const meta = ENGINE_ASSEMBLY_COMPONENTS.find((c) => c.id === hoveredComponentId);
  if (!meta) return null;

  const isInstalled = installedComponents.includes(hoveredComponentId);

  return (
    <div className="absolute top-5 right-5 z-40 flex items-center gap-3.5 p-3.5 px-4 rounded-2xl bg-white/90 border border-white/80 backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.15)] animate-stage-transition-enter text-left pointer-events-none select-none">
      <div
        className={`p-2 rounded-xl border shadow-sm flex items-center justify-center ${
          isInstalled
            ? "bg-emerald-100 text-emerald-700 border-emerald-200/80"
            : "bg-cyan-100 text-cyan-700 border-cyan-200/80"
        }`}
      >
        <CheckCircle2 size={22} className="stroke-[2.5]" />
      </div>

      <div>
        <div className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
          {isInstalled ? "INSTALLED & TORQUED" : "COMPONENT SPECIFICATIONS"}
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
