// ===================================================================
// FIA HOMOLOGATION & BALANCE OF PERFORMANCE (BOP) AUDIT PANEL
// ===================================================================
// Vision Glass dashboard conducting FIA technical regulation checks,
// air restrictor BoP calculations, success ballast, and digital certification.
// ===================================================================

import React, { useState, useMemo, memo } from "react";
import {
  HomologationAndBopEngine,
  FiaRacingSeries,
  FIA_REGULATIONS,
} from "../../sim/motorsport/homologationAndBopEngine";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";
import {
  Gavel,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Award,
  Sliders,
  FileCheck,
  Zap,
  Sparkles,
  Layers,
  Scale,
} from "lucide-react";

interface PresetSpec {
  name: string;
  series: FiaRacingSeries;
  weight: number;
  power: number;
  disp: number;
  prod: number;
  turbo: boolean;
  awd: boolean;
  abs: boolean;
  tc: boolean;
}

const PRESETS: PresetSpec[] = [
  {
    name: "Apex GT3 Spec-R",
    series: "FIA_GT3",
    weight: 1280,
    power: 560,
    disp: 4.0,
    prod: 450,
    turbo: true,
    awd: false,
    abs: true,
    tc: true,
  },
  {
    name: "Apex LMH Hypercar",
    series: "FIA_HYPERCAR_LMH",
    weight: 1040,
    power: 680,
    disp: 3.5,
    prod: 0,
    turbo: true,
    awd: true,
    abs: false,
    tc: true,
  },
  {
    name: "Apex GT4 Clubsport",
    series: "FIA_GT4",
    weight: 1420,
    power: 450,
    disp: 3.8,
    prod: 1200,
    turbo: false,
    awd: false,
    abs: true,
    tc: true,
  },
  {
    name: "Apex Rally1 Hybrid",
    series: "FIA_WRC_RALLY",
    weight: 1260,
    power: 500,
    disp: 1.6,
    prod: 2800,
    turbo: true,
    awd: true,
    abs: false,
    tc: false,
  },
  {
    name: "Apex Formula Monoposto",
    series: "FORMULA_SPEC",
    weight: 798,
    power: 1020,
    disp: 1.6,
    prod: 0,
    turbo: true,
    awd: false,
    abs: false,
    tc: false,
  },
];

const FiaHomologationPanelComponent: React.FC = () => {
  const [selectedSeries, setSelectedSeries] = useState<FiaRacingSeries>("FIA_GT3");
  const [vehicleName, setVehicleName] = useState<string>("Apex GT3 Concept");
  const [curbWeightKg, setCurbWeightKg] = useState<number>(1280);
  const [peakPowerHp, setPeakPowerHp] = useState<number>(560);
  const [displacementLiters, setDisplacementLiters] = useState<number>(4.0);
  const [annualProductionUnits, setAnnualProductionUnits] = useState<number>(450);
  const [hasTurbo, setHasTurbo] = useState<boolean>(true);
  const [isAwd, setIsAwd] = useState<boolean>(false);
  const [hasAbs, setHasAbs] = useState<boolean>(true);
  const [hasTractionControl, setHasTractionControl] = useState<boolean>(true);
  const [championshipStanding, setChampionshipStanding] = useState<number>(1); // 1st = Success Ballast

  // 1. Run Homologation Check
  const homologationResult = useMemo(() => {
    return HomologationAndBopEngine.checkHomologation({
      series: selectedSeries,
      curbWeightKg,
      peakPowerHp,
      displacementLiters,
      annualProductionUnits,
      hasTurbo,
      isAwd,
      hasAbs,
      hasTractionControl,
      rideHeightMm: 60,
    });
  }, [
    selectedSeries,
    curbWeightKg,
    peakPowerHp,
    displacementLiters,
    annualProductionUnits,
    hasTurbo,
    isAwd,
    hasAbs,
    hasTractionControl,
  ]);

  // 2. Run BoP Calculation
  const bopAdjustment = useMemo(() => {
    return HomologationAndBopEngine.calculateBoPAdjustment({
      series: selectedSeries,
      vehicleName,
      curbWeightKg,
      peakPowerHp,
      hasTurbo,
      championshipStandingPosition: championshipStanding,
    });
  }, [selectedSeries, vehicleName, curbWeightKg, peakPowerHp, hasTurbo, championshipStanding]);

  const applyPreset = (preset: PresetSpec) => {
    playHMIClickSound();
    setSelectedSeries(preset.series);
    setVehicleName(preset.name);
    setCurbWeightKg(preset.weight);
    setPeakPowerHp(preset.power);
    setDisplacementLiters(preset.disp);
    setAnnualProductionUnits(preset.prod);
    setHasTurbo(preset.turbo);
    setIsAwd(preset.awd);
    setHasAbs(preset.abs);
    setHasTractionControl(preset.tc);
  };

  const seriesSpec = FIA_REGULATIONS[selectedSeries];

  return (
    <div className="space-y-6 text-amber-50 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-amber-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{ background: "radial-gradient(circle at top right, rgba(245,158,11,0.35), transparent 70%)" }}
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
              FIA TECHNICAL SCRUTINEERING & EQUALIZATION
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              {seriesSpec.name}
            </span>
          </div>
          <h2 className="text-xl font-black text-amber-50 flex items-center gap-2 mt-1">
            <Gavel className="w-6 h-6 text-amber-400" />
            <span>Homologation Verification & BoP Scrutineering</span>
          </h2>
          <p className="text-xs text-amber-200/60 mt-0.5">
            Real-time compliance checks, air restrictor sizing, boost pressure limits, and dynamic success ballast.
          </p>
        </div>

        <div className="relative flex items-center gap-3 shrink-0">
          <div
            className={`px-4 py-2.5 rounded-xl text-xs font-black font-mono flex items-center space-x-2 border shadow-lg ${
              homologationResult.isCompliant
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/10"
                : "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/10"
            }`}
          >
            {homologationResult.isCompliant ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>STATUS: {homologationResult.overallStatus}</span>
          </div>
        </div>
      </div>

      {/* Homologation Benchmark Presets Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border-white/5 bg-amber-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-amber-200/60 flex items-center gap-1.5 shrink-0 px-2">
          <Sparkles size={14} className="text-amber-400" /> Quick Benchmarks:
        </span>
        {PRESETS.map((p) => {
          const isCurrent = selectedSeries === p.series && curbWeightKg === p.weight;
          return (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                isCurrent
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm"
                  : "bg-amber-950/60 border-amber-800/30 text-amber-200/60 hover:text-amber-50 hover:border-amber-700/30"
              }`}
            >
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Series Selector & Vehicle Parameter Inputs */}
      <div className="glass-panel p-5 rounded-2xl border-white/10 bg-amber-900/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-[11px] text-amber-200/60 font-mono font-bold block mb-1.5 uppercase">
            FIA Championship Series:
          </label>
          <select
            value={selectedSeries}
            onChange={(e) => {
              playHMITabSound();
              setSelectedSeries(e.target.value as FiaRacingSeries);
            }}
            className="w-full bg-amber-950/80 text-amber-50 text-xs rounded-xl p-2.5 border border-amber-700/30 font-mono outline-none"
          >
            <option value="FIA_GT3">FIA GT3 Championship</option>
            <option value="FIA_GT4">FIA GT4 European Series</option>
            <option value="FIA_HYPERCAR_LMH">FIA WEC Hypercar (LMH)</option>
            <option value="FIA_WRC_RALLY">FIA WRC Rally (Rally1)</option>
            <option value="FORMULA_SPEC">FIA Formula Monoposto</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-amber-200/60 font-mono font-bold block mb-1.5 uppercase">
            Vehicle Dry Weight (kg):
          </label>
          <input
            type="number"
            step={10}
            value={curbWeightKg}
            onChange={(e) => setCurbWeightKg(Number(e.target.value))}
            className="w-full bg-amber-950/80 text-amber-50 text-xs rounded-xl p-2.5 border border-amber-700/30 font-mono outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] text-amber-200/60 font-mono font-bold block mb-1.5 uppercase">
            Peak Engine Power (hp):
          </label>
          <input
            type="number"
            step={10}
            value={peakPowerHp}
            onChange={(e) => setPeakPowerHp(Number(e.target.value))}
            className="w-full bg-amber-950/80 text-amber-50 text-xs rounded-xl p-2.5 border border-amber-700/30 font-mono outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] text-amber-200/60 font-mono font-bold block mb-1.5 uppercase">
            Displacement (Liters):
          </label>
          <input
            type="number"
            step={0.1}
            value={displacementLiters}
            onChange={(e) => setDisplacementLiters(Number(e.target.value))}
            className="w-full bg-amber-950/80 text-amber-50 text-xs rounded-xl p-2.5 border border-amber-700/30 font-mono outline-none"
          />
        </div>
      </div>

      {/* BOP Adjustment Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-amber-900/40">
          <div className="text-xs text-amber-200/60 font-semibold flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>AIR RESTRICTOR SIZE</span>
          </div>
          <div className="text-2xl font-mono font-black text-amber-300 mt-2">
            {bopAdjustment.intakeAirRestrictorMm} <span className="text-xs text-amber-300/50">mm</span>
          </div>
          <div className="text-[11px] text-amber-300/50 mt-1">
            Calibrated Power: <strong className="text-amber-100/80">{bopAdjustment.calibratedPowerHp} hp</strong>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-amber-900/40">
          <div className="text-xs text-amber-200/60 font-semibold flex items-center space-x-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>SUCCESS BALLAST WEIGHT</span>
          </div>
          <div className="text-2xl font-mono font-black text-amber-300 mt-2">
            +{bopAdjustment.successBallastWeightKg} <span className="text-xs text-amber-300/50">kg</span>
          </div>
          <div className="text-[11px] text-amber-300/50 mt-1">
            Calibrated Weight: <strong className="text-amber-100/80">{bopAdjustment.calibratedWeightKg} kg</strong>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-amber-900/40">
          <div className="text-xs text-amber-200/60 font-semibold flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>CALIBRATED PWR-TO-WEIGHT</span>
          </div>
          <div className="text-2xl font-mono font-black text-emerald-300 mt-2">
            {bopAdjustment.rawPtoWRatioHpPerKg} <span className="text-xs text-amber-300/50">hp/kg</span>
          </div>
          <div className="text-[11px] text-amber-300/50 mt-1">
            Target Class P/W: <strong className="text-amber-100/80">{bopAdjustment.targetPtoWRatioHpPerKg}</strong>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-white/10 bg-amber-900/40">
          <div className="text-xs text-amber-200/60 font-semibold flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>ESTIMATED BOP LAP DELTA</span>
          </div>
          <div
            className={`text-2xl font-mono font-black mt-2 ${
              bopAdjustment.estimatedLapTimeDeltaSec >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {bopAdjustment.estimatedLapTimeDeltaSec >= 0 ? "+" : ""}
            {bopAdjustment.estimatedLapTimeDeltaSec}s
          </div>
          <div className="text-[11px] text-amber-300/50 mt-1">Grid equalization window</div>
        </div>
      </div>

      {/* Technical Regulation Audit Checklist */}
      <div className="glass-panel p-5 rounded-2xl border-white/10 bg-amber-900/40 space-y-3">
        <h3 className="text-sm font-bold text-amber-50 flex items-center gap-2">
          <Layers size={16} className="text-amber-400" />
          <span>FIA TECHNICAL HOMOLOGATION AUDIT CHECKLIST</span>
        </h3>
        <div className="space-y-2">
          {homologationResult.checks.map((check, idx) => (
            <div
              key={idx}
              className="bg-amber-950/80 p-3.5 rounded-xl border border-amber-800/30 flex items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-3">
                {check.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold text-amber-50">{check.ruleName}</div>
                  {check.deviationNote && (
                    <div className="text-[10px] text-rose-400 mt-0.5">{check.deviationNote}</div>
                  )}
                </div>
              </div>

              <div className="text-right font-mono text-xs shrink-0">
                <div className="text-amber-200/60">Req: {String(check.requiredValue)}</div>
                <div className={`font-bold ${check.passed ? "text-emerald-400" : "text-rose-400"}`}>
                  Actual: {String(check.actualValue)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FiaHomologationPanel = memo(FiaHomologationPanelComponent);
