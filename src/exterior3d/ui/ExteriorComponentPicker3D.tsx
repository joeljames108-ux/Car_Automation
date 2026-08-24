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
    <div className="absolute top-4 right-4 z-20 w-72 max-h-96 rounded-2xl backdrop-blur-xl p-3 shadow-2xl overflow-y-auto space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.95)', border: '1px solid rgba(217,166,78,0.4)'}}>
      <div className="flex items-center gap-2 pb-2" style={{borderBottom: '1px solid rgba(217,166,78,0.25)'}}>
        <Box size={14} style={{color: '#92400E'}} />
        <span className="text-xs font-mono font-bold uppercase" style={{color: '#451A03'}}>
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
                  ? "border-amber-300/40 text-amber-800"
                  : isInstallable
                  ? "border-amber-200/50 hover:border-amber-400 text-amber-800 cursor-pointer"
                  : "border-amber-200/30 opacity-40 text-amber-600"
              }`}
              onClick={() => {
                if (!isInstalled && isInstallable) startInstall(comp.id);
              }}
            >
              <span className="truncate pr-2">{comp.name}</span>
              {isInstalled ? (
                <Check size={14} className="text-emerald-400 shrink-0" />
              ) : isInstallable ? (
                <Plus size={14} style={{color: '#92400E'}} className="shrink-0" />
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
