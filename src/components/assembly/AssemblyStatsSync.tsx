import { CheckCircle2 } from "lucide-react";
import { ComponentId, getAssemblyComponents } from "../../sim/assemblyTypes";
import { StatDeltaBadges, TorqueClearanceReadout } from "./assemblyUIHelpers";
import { EngineConfig } from "../../sim/types";

interface AssemblyStatsSyncProps {
  hoveredComponentId: ComponentId | null;
  installedComponents?: ComponentId[];
  engineConfig?: Partial<EngineConfig>;
}

export function AssemblyStatsSync({
  hoveredComponentId,
  installedComponents = [],
  engineConfig,
}: AssemblyStatsSyncProps) {
  // Show tooltip card ONLY when a component is actively hovered
  if (!hoveredComponentId) return null;

  const components = getAssemblyComponents(engineConfig);
  const meta = components.find((c) => c.id === hoveredComponentId);
  if (!meta) return null;

  const isInstalled = installedComponents.includes(hoveredComponentId);

  return (
    <div className="absolute top-5 right-5 z-40 flex items-center gap-3.5 p-3.5 px-4 rounded-2xl bg-white/90 border border-white/80 backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.15)] animate-stage-transition-enter text-left pointer-events-none select-none">
      <div
        className={`p-2 rounded-xl border shadow-sm flex items-center justify-center ${
          isInstalled
            ? "bg-emerald-100 text-emerald-700 border-emerald-200/80"
            : "bg-amber-100 text-amber-700 border-amber-200/80"
        }`}
      >
        <CheckCircle2 size={22} className="stroke-[2.5]" />
      </div>

      <div>
        <div className="text-[10px] font-mono text-amber-700 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
          {isInstalled ? "INSTALLED & TORQUED" : "COMPONENT SPECIFICATIONS"}
        </div>
        <div className="text-sm font-extrabold text-slate-800 tracking-tight">{meta.name}</div>
        
        {/* Shared Stat Delta Badges */}
        <StatDeltaBadges meta={meta} size="md" className="mt-1" />

        {/* Shared Torque Wrench Spec & Clearance Readout */}
        <TorqueClearanceReadout meta={meta} variant="compact" />
      </div>
    </div>
  );
}
