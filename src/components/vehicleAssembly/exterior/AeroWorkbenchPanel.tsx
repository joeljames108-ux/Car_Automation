// ===================================================================
// AERODYNAMICS WORKBENCH & LIVE FORCE DASHBOARD
// ===================================================================

import React from "react";
import { Wind, Gauge, Shield, Zap } from "lucide-react";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";
import { calculateAeroForces } from "../../../exterior3d/physics/aeroForceCalculator";

export const AeroWorkbenchPanel: React.FC = () => {
  const aeroConfig = useExteriorAssemblyStore((s) => s.aeroConfig);
  const updateAeroConfig = useExteriorAssemblyStore((s) => s.updateAeroConfig);

  const { totalCd, totalCl, frontDownforcePercent, speedSweep } = calculateAeroForces(aeroConfig);

  return (
    <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-2xl space-y-4 font-mono text-xs">
      <div className="flex items-center gap-2 pb-3 border-b border-white/10">
        <Wind className="text-cyan-400" size={18} />
        <h3 className="text-sm font-bold text-slate-100 uppercase">
          AERODYNAMIC TUNNEL & DOWNFORCE TELEMETRY
        </h3>
      </div>

      {/* Force Metric Badges */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 rounded-2xl bg-slate-950 border border-white/10">
          <span className="text-slate-500 text-[10px] block">DRAG (Cd)</span>
          <strong className="text-cyan-400 text-sm">{totalCd}</strong>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-white/10">
          <span className="text-slate-500 text-[10px] block">LIFT/DOWNFORCE (Cl)</span>
          <strong className="text-emerald-400 text-sm">-{totalCl}</strong>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-white/10">
          <span className="text-slate-500 text-[10px] block">AERO BALANCE</span>
          <strong className="text-amber-400 text-sm">{frontDownforcePercent}% FRONT</strong>
        </div>
      </div>

      {/* Speed vs Downforce Sweep Table */}
      <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
        <span className="text-slate-400 text-[11px] font-bold block">DOWNFORCE SPEED SWEEP</span>
        <div className="grid grid-cols-4 text-[10px] text-slate-400 pb-1 border-b border-white/5">
          <span>SPEED</span>
          <span>DOWNFORCE</span>
          <span>DRAG FORCE</span>
          <span>POWER REQ.</span>
        </div>
        {speedSweep.slice(1, 5).map((pt) => (
          <div key={pt.speedKmh} className="grid grid-cols-4 text-[11px]">
            <span className="text-slate-300 font-bold">{pt.speedKmh} km/h</span>
            <span className="text-emerald-400 font-bold">{pt.downforceKg} kg</span>
            <span className="text-slate-400">{pt.dragForceN} N</span>
            <span className="text-cyan-300">{pt.powerRequiredHp} hp</span>
          </div>
        ))}
      </div>
    </div>
  );
};
