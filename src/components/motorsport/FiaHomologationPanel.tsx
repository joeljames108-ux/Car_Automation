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
import { Gavel, CheckCircle2, XCircle, ShieldAlert, Award, Sliders, Download, FileCheck } from "lucide-react";

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
  }, [selectedSeries, curbWeightKg, peakPowerHp, displacementLiters, annualProductionUnits, hasTurbo, isAwd, hasAbs, hasTractionControl]);

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


  const seriesSpec = FIA_REGULATIONS[selectedSeries];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 flex items-center justify-between shadow-2xl">
        <div>
          <h2 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center space-x-2">
            <Gavel className="w-6 h-6 text-amber-400" />
            <span>FIA HOMOLOGATION & BALANCE OF PERFORMANCE (BOP)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Technical compliance verification against FIA regulations and automated BoP air restrictor & ballast tuning.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className={`px-4 py-2 rounded-xl text-xs font-black font-mono flex items-center space-x-2 border shadow-lg ${
              homologationResult.isCompliant
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10"
                : "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10"
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

      {/* Series Selector & Vehicle Parameter Inputs */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className="text-xs text-slate-400 font-bold block mb-2">RACING SERIES CATEGORY:</label>
          <select
            value={selectedSeries}
            onChange={(e) => setSelectedSeries(e.target.value as FiaRacingSeries)}
            className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 font-mono outline-none"
          >
            <option value="FIA_GT3">FIA GT3 Championship</option>
            <option value="FIA_GT4">FIA GT4 European Series</option>
            <option value="FIA_HYPERCAR_LMH">FIA World Endurance Hypercar (LMH)</option>
            <option value="FIA_WRC_RALLY">FIA World Rally Championship (Rally1)</option>
            <option value="FORMULA_SPEC">FIA Formula Monoposto</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-bold block mb-2">VEHICLE DRY WEIGHT (KG):</label>
          <input
            type="number"
            step={10}
            value={curbWeightKg}
            onChange={(e) => setCurbWeightKg(Number(e.target.value))}
            className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 font-mono outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 font-bold block mb-2">PEAK ENGINE POWER (HP):</label>
          <input
            type="number"
            step={10}
            value={peakPowerHp}
            onChange={(e) => setPeakPowerHp(Number(e.target.value))}
            className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 font-mono outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 font-bold block mb-2">ENGINE DISPLACEMENT (L):</label>
          <input
            type="number"
            step={0.1}
            value={displacementLiters}
            onChange={(e) => setDisplacementLiters(Number(e.target.value))}
            className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700 font-mono outline-none"
          />
        </div>
      </div>

      {/* BOP Adjustment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>AIR RESTRICTOR SIZE</span>
          </div>
          <div className="text-2xl font-mono font-black text-amber-400 mt-2">
            {bopAdjustment.intakeAirRestrictorMm} <span className="text-xs text-slate-500">mm</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Calibrated Power: {bopAdjustment.calibratedPowerHp} hp
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold flex items-center space-x-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span>SUCCESS BALLAST WEIGHT</span>
          </div>
          <div className="text-2xl font-mono font-black text-purple-400 mt-2">
            +{bopAdjustment.successBallastWeightKg} <span className="text-xs text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total Weight: {bopAdjustment.calibratedWeightKg} kg
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>CALIBRATED PWR-TO-WEIGHT</span>
          </div>
          <div className="text-2xl font-mono font-black text-emerald-400 mt-2">
            {bopAdjustment.rawPtoWRatioHpPerKg} <span className="text-xs text-slate-500">hp/kg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Target Class P/W: {bopAdjustment.targetPtoWRatioHpPerKg}</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">ESTIMATED BOP LAP DELTA</div>
          <div className={`text-2xl font-mono font-black mt-2 ${bopAdjustment.estimatedLapTimeDeltaSec >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {bopAdjustment.estimatedLapTimeDeltaSec >= 0 ? "+" : ""}{bopAdjustment.estimatedLapTimeDeltaSec}s
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Grid pace equalization</div>
        </div>
      </div>

      {/* Technical Regulation Audit Table */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200">FIA TECHNICAL HOMOLOGATION AUDIT CHECKLIST</h3>
        <div className="space-y-2">
          {homologationResult.checks.map((check, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                {check.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-200">{check.ruleName}</div>
                  {check.deviationNote && <div className="text-[10px] text-rose-400 mt-0.5">{check.deviationNote}</div>}
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <div className="text-slate-400">Req: {String(check.requiredValue)}</div>
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

