// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — POWER UNIT DYNO BENCH STUDIO
// ============================================================================

import React, { useState, useMemo, memo } from "react";
import { Zap, Activity, Cpu, Flame, Volume2, Play } from "lucide-react";
import { useF1ConstructorStore } from "../../../sim/f1/state/f1ConstructorStore";
import { PowerTorqueCurveChart } from "../../ui/PowerTorqueCurveChart";

export const DynoBenchStudio: React.FC = memo(function DynoBenchStudio() {
  const { car, engineRpm, setEngineRpm, isEngineRevving, setIsEngineRevving } = useF1ConstructorStore();
  const pu = car.powerUnit;

  // Generate Dyno Points for F1 V6 Turbo Hybrid (memoized against computed power)
  const dynoPoints = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => {
      const rpm = 3500 + i * 500;
      // Power Curve calculation (Peak power at 12,500 - 14,000 RPM)
      const normalizedRpm = (rpm - 3500) / (15000 - 3500);
      const icePower = car.computedIcePeakHp * Math.sin(normalizedRpm * Math.PI * 0.78);
      const ersPower = car.computedErsPeakHp; // Flat 160 HP
      const totalHp = Math.round(icePower + (rpm > 5500 ? ersPower : ersPower * 0.6));
      const torqueNm = Math.round((totalHp * 7127) / rpm);

      return {
        rpm,
        power: Math.max(220, totalHp),
        torque: Math.max(180, Math.min(850, torqueNm)),
      };
    });
  }, [car.computedIcePeakHp, car.computedErsPeakHp]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Studio Header */}
      <div className="glass-panel p-6 border-amber-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="text-amber-400" size={24} />
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">
              Power Unit Dynamometer & Thermal Bench
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real-time transient dyno sweep: 1.6L internal combustion engine output combined with MGU-K 120 kW electric boost across the 3,500 to 15,000 RPM operational rev range.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-amber-400">
              {car.computedTotalPeakHp} <span className="text-xs text-slate-400 font-normal">HP</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Peak System Output</div>
          </div>
        </div>
      </div>

      {/* Dyno Dyno Curve Chart */}
      <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Dyno Power & Torque vs RPM Curves
          </span>
          <span className="text-[11px] font-mono text-amber-400">
            Redline: 15,000 RPM (FIA Fuel Limit: 100 kg/h)
          </span>
        </div>

        <PowerTorqueCurveChart
          powerCurve={dynoPoints}
          height={280}
        />
      </div>

      {/* Dyno Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Thermal Efficiency</div>
          <div className="font-mono text-2xl font-bold text-ok-400">51.2%</div>
          <div className="text-[11px] text-slate-400 mt-1">Prechamber Mahle Combustion</div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Fuel Mass Flow Rate</div>
          <div className="font-mono text-2xl font-bold text-amber-400">100.0 <span className="text-xs text-slate-400">kg/h</span></div>
          <div className="text-[11px] text-slate-400 mt-1">FIA Sensor Capped</div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Exhaust Gas Temp</div>
          <div className="font-mono text-2xl font-bold text-red-400">985°C</div>
          <div className="text-[11px] text-slate-400 mt-1">MGU-H Turbine Inlet</div>
        </div>
      </div>
    </div>
  );
});
