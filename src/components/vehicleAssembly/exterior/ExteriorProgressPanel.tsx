// ===================================================================
// EXTERIOR ASSEMBLY PROGRESS & STATUS PANEL
// ===================================================================

import React from "react";
import { CheckCircle2, Shield, Wrench, Sparkles, Scale, DollarSign, Layers } from "lucide-react";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";

export const ExteriorProgressPanel: React.FC = () => {
  const buildProgress = useExteriorAssemblyStore((s) => s.getBuildProgress());
  const totalWeight = useExteriorAssemblyStore((s) => s.getTotalExteriorWeight());
  const totalCost = useExteriorAssemblyStore((s) => s.getTotalExteriorCost());
  const totalRigidity = useExteriorAssemblyStore((s) => s.getTotalTorsionalRigidityKNm());
  const paintConfig = useExteriorAssemblyStore((s) => s.paintConfig);

  const totalDft =
    paintConfig.eCoatPrimerMicrons +
    paintConfig.primerSurfacerMicrons +
    paintConfig.baseCoatMicrons +
    paintConfig.clearCoatMicrons;

  return (
    <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-4 backdrop-blur-xl shadow-2xl space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-200 uppercase flex items-center gap-1.5">
          <CheckCircle2 size={15} className="text-amber-400" />
          EXTERIOR BODY-IN-WHITE PROGRESS
        </span>
        <strong className="text-amber-300">{buildProgress}%</strong>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${buildProgress}%` }}
        />
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5 text-center">
        <div className="p-2 rounded-xl bg-slate-950">
          <span className="text-[10px] text-slate-500 block">WEIGHT</span>
          <strong className="text-slate-200">{Math.round(totalWeight)}kg</strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950">
          <span className="text-[10px] text-slate-500 block">RIGIDITY</span>
          <strong className="text-emerald-400">{totalRigidity} kNm/deg</strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950">
          <span className="text-[10px] text-slate-500 block">PAINT DFT</span>
          <strong className="text-amber-400">{totalDft} µm</strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950">
          <span className="text-[10px] text-slate-500 block">BOM COST</span>
          <strong className="text-amber-400">${Math.round(totalCost).toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
};
