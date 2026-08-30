/**
 * ============================================================================
 * MODULAR INTERIOR STUDIO — SIDE-BY-SIDE CABIN COMPARISON BENCH
 * ============================================================================
 * Benchmarks Cabin A vs Cabin B:
 * - Direct Delta Scorecards for Weight, Cost, Luxury, Sportiness & NVH dB
 * - Visual Multi-Metric Radar comparisons
 * - Actionable Vehicle Packaging & Track Trade-Off Recommendations
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import { GitCompare, Scale, DollarSign, Volume2, ShieldCheck, Zap, Sparkles, Download, Eye } from "lucide-react";
import { MasterModularInteriorState } from "../../sim/interior/masterInteriorTypes";
import { CURATED_INTERIOR_PRESETS } from "../../sim/interior/masterInteriorStateEngine";
import { MasterInteriorSolver } from "../../sim/interior/masterInteriorSolver";
import { InteriorAcousticThermalSimulator } from "../../sim/interior/interiorAcousticThermalSimulator";
import { InteriorErgonomicsBiometricsEngine } from "../../sim/interior/interiorErgonomicsBiometricsEngine";
import { UniversalGlbExporter } from "../../exterior3d/export/universalGlbExporter";
import { HyperFidelityInteriorCadEngine } from "../../exterior3d/generators/interior/hyperFidelityInteriorCadEngine";

interface ModularInteriorComparisonStudioProps {
  currentCabin: MasterModularInteriorState;
}

export const ModularInteriorComparisonStudio: React.FC<ModularInteriorComparisonStudioProps> = ({ currentCabin }) => {
  const [benchmarkKey, setBenchmarkKey] = useState<string>("GT3_COMPETITION_RACE");
  const [isExportingA, setIsExportingA] = useState<boolean>(false);
  const [isExportingB, setIsExportingB] = useState<boolean>(false);

  const benchmarkRaw = CURATED_INTERIOR_PRESETS[benchmarkKey] || CURATED_INTERIOR_PRESETS.GT3_COMPETITION_RACE;
  const benchmarkCabin: MasterModularInteriorState = {
    ...benchmarkRaw,
    metrics: MasterInteriorSolver.solveMetrics(benchmarkRaw),
  };

  const delta = MasterInteriorSolver.compareInteriors(currentCabin, benchmarkCabin);

  // Acoustic & NVH physics comparison
  const acousticA = useMemo(() => InteriorAcousticThermalSimulator.simulateCabinAcoustics(currentCabin, 4200, 120, true), [currentCabin]);
  const acousticB = useMemo(() => InteriorAcousticThermalSimulator.simulateCabinAcoustics(benchmarkCabin, 4200, 120, true), [benchmarkCabin]);

  // SAE Ergonomics biometrics comparison
  const ergoA = useMemo(() => InteriorErgonomicsBiometricsEngine.solveDriverErgonomics(currentCabin, "50th_male", 0, 0), [currentCabin]);
  const ergoB = useMemo(() => InteriorErgonomicsBiometricsEngine.solveDriverErgonomics(benchmarkCabin, "50th_male", 0, 0), [benchmarkCabin]);

  const handleExportGlbA = async () => {
    setIsExportingA(true);
    try {
      const group = HyperFidelityInteriorCadEngine.buildFullInteriorCad(currentCabin);
      const res = await UniversalGlbExporter.exportVehicleToGlb(group, { vehicleName: `Cabin_A_${currentCabin.name}` });
      UniversalGlbExporter.triggerBrowserDownload(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingA(false);
    }
  };

  const handleExportGlbB = async () => {
    setIsExportingB(true);
    try {
      const group = HyperFidelityInteriorCadEngine.buildFullInteriorCad(benchmarkCabin);
      const res = await UniversalGlbExporter.exportVehicleToGlb(group, { vehicleName: `Cabin_B_${benchmarkCabin.name}` });
      UniversalGlbExporter.triggerBrowserDownload(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingB(false);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 backdrop-blur-xl shadow-2xl text-xs font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-amber-500/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <GitCompare size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100">CABIN ENGINEERING COMPARISON BENCH</h3>
            <p className="text-[11px] text-amber-300/80">Benchmark current cabin configuration against production baselines</p>
          </div>
        </div>

        {/* Benchmark Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">BENCHMARK CABIN:</span>
          <select
            value={benchmarkKey}
            onChange={(e) => setBenchmarkKey(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-bold outline-none"
          >
            {Object.entries(CURATED_INTERIOR_PRESETS).map(([k, p]) => (
              <option key={k} value={k}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Cabin Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cabin A Card */}
        <div className="p-4 rounded-xl space-y-3" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.25)'}}>
          <div className="flex items-center justify-between">
            <span className="font-bold" style={{color: '#92400E'}}>CABIN A (CURRENT ACTIVE)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px]" style={{backgroundColor: 'rgba(217,166,78,0.2)', color: '#92400E'}}>{currentCabin.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(255,248,235,0.5)', border: '1px solid rgba(217,166,78,0.15)'}}>
              <span className="block" style={{color: '#78716C'}}>Total Mass:</span>
              <span className="font-extrabold" style={{color: '#451A03'}}>{currentCabin.metrics.totalInteriorMassKg} kg</span>
            </div>
            <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(255,248,235,0.5)', border: '1px solid rgba(217,166,78,0.15)'}}>
              <span className="block" style={{color: '#78716C'}}>BOM Cost:</span>
              <span className="font-extrabold" style={{color: '#451A03'}}>${currentCabin.metrics.totalInteriorCostUSD.toLocaleString()}</span>
            </div>
            <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(255,248,235,0.5)', border: '1px solid rgba(217,166,78,0.15)'}}>
              <span className="block" style={{color: '#78716C'}}>Ear Noise Level:</span>
              <span className="font-extrabold text-amber-600">{acousticA.driverEarSplDba} dBA</span>
            </div>
            <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(255,248,235,0.5)', border: '1px solid rgba(217,166,78,0.15)'}}>
              <span className="block" style={{color: '#78716C'}}>SAE Ergo Score:</span>
              <span className="font-extrabold text-emerald-600">{ergoA.overallSaeErgonomicsScore}/100</span>
            </div>
          </div>
          <button
            onClick={handleExportGlbA}
            disabled={isExportingA}
            className="w-full mt-2 py-1.5 px-3 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center gap-1.5 text-[10px] cursor-pointer hover:bg-amber-700 disabled:opacity-50"
          >
            <Download size={12} />
            <span>{isExportingA ? "EXPORTING..." : "EXPORT CABIN A GLB"}</span>
          </button>
        </div>

        {/* Cabin B Card */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-400">CABIN B (BENCHMARK)</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">{benchmarkCabin.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="block text-slate-400">Total Mass:</span>
              <span className="font-extrabold text-slate-100">{benchmarkCabin.metrics.totalInteriorMassKg} kg</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="block text-slate-400">BOM Cost:</span>
              <span className="font-extrabold text-slate-100">${benchmarkCabin.metrics.totalInteriorCostUSD.toLocaleString()}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="block text-slate-400">Ear Noise Level:</span>
              <span className="font-extrabold text-amber-400">{acousticB.driverEarSplDba} dBA</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="block text-slate-400">SAE Ergo Score:</span>
              <span className="font-extrabold text-emerald-400">{ergoB.overallSaeErgonomicsScore}/100</span>
            </div>
          </div>
          <button
            onClick={handleExportGlbB}
            disabled={isExportingB}
            className="w-full mt-2 py-1.5 px-3 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center gap-1.5 text-[10px] cursor-pointer hover:bg-amber-700 disabled:opacity-50"
          >
            <Download size={12} />
            <span>{isExportingB ? "EXPORTING..." : "EXPORT CABIN B GLB"}</span>
          </button>
        </div>
      </div>

      {/* Delta Scorecard Grid */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h4 className="font-bold text-slate-200 flex items-center gap-2">
          <Zap size={14} className="text-amber-400" />
          <span>DELTA PERFORMANCE SCORECARD (B vs A)</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">MASS DELTA</span>
            <span className={`text-base font-extrabold ${delta.massDiffKg < 0 ? "text-emerald-400" : "text-red-400"}`}>
              {delta.massDiffKg > 0 ? `+${delta.massDiffKg}` : delta.massDiffKg} kg
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">COST DELTA</span>
            <span className={`text-base font-extrabold ${delta.costDiffUSD < 0 ? "text-emerald-400" : "text-amber-400"}`}>
              {delta.costDiffUSD > 0 ? `+$${delta.costDiffUSD.toLocaleString()}` : `-$${Math.abs(delta.costDiffUSD).toLocaleString()}`}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">COMFORT DELTA</span>
            <span className={`text-base font-extrabold ${delta.comfortDiffPercent > 0 ? "text-emerald-400" : "text-slate-400"}`}>
              {delta.comfortDiffPercent > 0 ? `+${delta.comfortDiffPercent}%` : `${delta.comfortDiffPercent}%`}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 text-[10px] block">LATERAL G SUPPORT</span>
            <span className={`text-base font-extrabold ${delta.lateralGSupportDiff > 0 ? "text-emerald-400" : "text-slate-400"}`}>
              {delta.lateralGSupportDiff > 0 ? `+${delta.lateralGSupportDiff}G` : `${delta.lateralGSupportDiff}G`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
