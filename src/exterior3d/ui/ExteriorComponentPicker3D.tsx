// ===================================================================
// FLOATING 3D EXTERIOR COMPONENT PICKER OVERLAY
// ===================================================================

import React from "react";
import { Plus, Check, Box } from "lucide-react";
import { EXTERIOR_ASSEMBLY_REGISTRY } from "../../sim/exteriorAssemblyTypes";
import { useExteriorAssemblyStore } from "../../state/useExteriorAssemblyStore";

export const ExteriorComponentPicker3D: React.FC = () => {
  const installedComponents = useExteriorAssemblyStore((s) => s.installedComponents);
  const isComponentInstallable = useExteriorAssemblyStore((s) => s.isComponentInstallable);
  const startInstall = useExteriorAssemblyStore((s) => s.startInstall);

  return (
    <div className="absolute top-4 right-4 z-20 w-72 max-h-96 bg-slate-900/90 border border-white/10 rounded-2xl backdrop-blur-xl p-3 shadow-2xl overflow-y-auto space-y-2">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <Box size={14} className="text-cyan-400" />
        <span className="text-xs font-mono font-bold text-slate-200 uppercase">
          3D QUICK INSTALLER
        </span>
      </div>

      <div className="space-y-1.5">
        {EXTERIOR_ASSEMBLY_REGISTRY.map((comp) => {
          const isInstalled = installedComponents.includes(comp.id);
          const isInstallable = isComponentInstallable(comp.id);

          return (
            <div
              key={comp.id}
              className={`flex items-center justify-between p-2 rounded-xl border text-xs font-mono transition-all ${
                isInstalled
                  ? "bg-emerald-950/20 border-emerald-500/30 text-slate-300"
                  : isInstallable
                  ? "bg-slate-950/80 border-slate-700 hover:border-cyan-400 text-slate-200 cursor-pointer"
                  : "bg-slate-950/40 border-slate-850 opacity-40 text-slate-500"
              }`}
              onClick={() => {
                if (!isInstalled && isInstallable) startInstall(comp.id);
              }}
            >
              <span className="truncate pr-2">{comp.name}</span>
              {isInstalled ? (
                <Check size={14} className="text-emerald-400 shrink-0" />
              ) : isInstallable ? (
                <Plus size={14} className="text-cyan-400 shrink-0" />
              ) : (
                <span className="text-[10px]">🔒</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
