/**
 * ============================================================================
 * VEHICLE COMPARISON STUDIO (CAR A vs CAR B)
 * ============================================================================
 * Side-by-side vehicle benchmarking studio comparing engineering parameters,
 * aerodynamic load curves, multi-sector lap times, and manufacturing economics.
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Scale,
  Gauge,
  Wind,
  Compass,
  DollarSign,
  Zap,
  CheckCircle2,
  Copy,
  Plus,
} from "lucide-react";
import { MasterVehicleStateEngine } from "../../sim/masterVehicleState/masterVehicleStateEngine";
import { MasterVehicleState, VehicleComparisonDelta } from "../../sim/masterVehicleState/masterVehicleTypes";

export const VehicleComparisonStudio: React.FC = () => {
  const stateEngine = useMemo(() => MasterVehicleStateEngine.getInstance(), []);
  const [carA, setCarA] = useState<MasterVehicleState>(() => stateEngine.getState());

  useEffect(() => {
    const unsub = stateEngine.subscribe((newState) => {
      setCarA(newState);
    });
    return unsub;
  }, [stateEngine]);

  // Create a default Variant B for comparison (e.g. Clubsport Lightweight Spec)
  const [carB, setCarB] = useState<MasterVehicleState>(() => {
    const initialA = stateEngine.getState();
    const clone: MasterVehicleState = JSON.parse(JSON.stringify(initialA));
    clone.id = "VARIANT_B_CLUBSPORT";
    clone.name = `${initialA.name} [Lightweight Clubsport Spec]`;
    clone.powertrain.boostBar = 1.85;
    clone.aero.rearWingAngleDeg = 22;
    clone.chassis.materialGrade = "carbon_composite";
    clone.wheelsBrakes.tireCompound = "racing_slick";
    return clone;
  });

  const delta: VehicleComparisonDelta = useMemo(() => {
    return stateEngine.compareWith(carB);
  }, [carA, carB, stateEngine]);

  const mA = carA.metrics;
  const mB = carB.metrics;

  return (
    <div className="flex flex-col gap-4 w-full h-full text-slate-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <GitCompare size={20} />
          </div>
          <div>
            <h2 className="font-bold text-base text-white">Vehicle Engineering Comparison Studio</h2>
            <p className="text-xs text-slate-400">Side-by-side delta benchmark: Baseline Build vs Target Specification</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            Δ Nürburgring: {delta.lapTimeDiffSec > 0 ? `+${delta.lapTimeDiffSec}s` : `${delta.lapTimeDiffSec}s`}
          </span>
        </div>
      </div>

      {/* Main 2-Column Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CAR A (Baseline) */}
        <div className="p-5 rounded-3xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-xl flex flex-col gap-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">SPECIFICATION A (CURRENT BUILD)</span>
              <h3 className="font-bold text-base text-white">{carA.name}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              ${carA.costAndBOM.totalManufacturingCostUSD.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase block">Power</span>
              <span className="text-base font-bold text-amber-400">{mA.peakHorsepowerHp} hp</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase block">Curb Mass</span>
              <span className="text-base font-bold text-slate-200">{mA.totalCurbMassKg} kg</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase block">0–100 km/h</span>
              <span className="text-base font-bold text-emerald-400">{mA.zeroToHundredKmhSec}s</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase block">Top Speed</span>
              <span className="text-base font-bold text-cyan-400">{mA.topSpeedKmh} km/h</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase block">Downforce @ 160</span>
              <span className="text-base font-bold text-cyan-300">{mA.downforceAt160KmhN} N</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase block">Lateral Grip</span>
              <span className="text-base font-bold text-purple-400">{mA.maxLateralAccelerationG} g</span>
            </div>
          </div>
        </div>

        {/* CAR B (Target / Variant) */}
        <div className="p-5 rounded-3xl bg-slate-950/90 border border-purple-500/40 backdrop-blur-xl flex flex-col gap-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-purple-400">SPECIFICATION B (TARGET VARIANT)</span>
              <h3 className="font-bold text-base text-white">{carB.name}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ${carB.costAndBOM.totalManufacturingCostUSD.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase block">Power</span>
              <span className="text-base font-bold text-amber-400">{mB.peakHorsepowerHp} hp</span>
              <span className="text-[10px] text-emerald-400 ml-1">({delta.powerDiffHp > 0 ? `-${delta.powerDiffHp}` : `+${Math.abs(delta.powerDiffHp)}`} hp)</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase block">Curb Mass</span>
              <span className="text-base font-bold text-slate-200">{mB.totalCurbMassKg} kg</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase block">0–100 km/h</span>
              <span className="text-base font-bold text-emerald-400">{mB.zeroToHundredKmhSec}s</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase block">Top Speed</span>
              <span className="text-base font-bold text-cyan-400">{mB.topSpeedKmh} km/h</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase block">Downforce @ 160</span>
              <span className="text-base font-bold text-cyan-300">{mB.downforceAt160KmhN} N</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 text-[10px] uppercase block">Lateral Grip</span>
              <span className="text-base font-bold text-purple-400">{mB.maxLateralAccelerationG} g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Sector Virtual Track Lap Delta Breakdown */}
      <div className="p-5 rounded-3xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <Compass size={14} /> Multi-Sector Track Performance Comparison (Nürburgring Nordschleife)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
            <span className="text-[10px] text-slate-400 font-mono block">Sector 1 (High-Speed Sweepers)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-bold font-mono text-white">Car A: 54.2s</span>
              <span className="text-xs font-mono font-bold text-emerald-400">Δ {delta.sectorDeltas.sector1DiffSec}s</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
            <span className="text-[10px] text-slate-400 font-mono block">Sector 2 (Technical Esses & Hairpins)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-bold font-mono text-white">Car A: 1:48.6s</span>
              <span className="text-xs font-mono font-bold text-emerald-400">Δ {delta.sectorDeltas.sector2DiffSec}s</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
            <span className="text-[10px] text-slate-400 font-mono block">Sector 3 (Döttinger Höhe Main Straight)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-bold font-mono text-white">Car A: 1:12.4s</span>
              <span className="text-xs font-mono font-bold text-emerald-400">Δ {delta.sectorDeltas.sector3DiffSec}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
