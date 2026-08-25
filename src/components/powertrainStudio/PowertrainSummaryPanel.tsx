/**
 * ============================================================================
 * POWERTRAIN SUMMARY PANEL — COMBINED ENGINE + DRIVETRAIN DASHBOARD
 * ============================================================================
 * Full BOM cost roll-up, mass budget, compatibility report, power-to-weight
 * calculations, and exportable spec sheet for the unified powertrain.
 * ============================================================================
 */

import React from "react";
import {
  DollarSign,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Gauge,
  Download,
  Zap,
  Cog,
  Activity,
  CheckCircle2,
} from "lucide-react";
import type { MasterEngineState } from "../../sim/engine/masterEngineTypes";

interface PowertrainSummaryPanelProps {
  state: MasterEngineState;
}

const TRANSMISSION_ARCH_LABELS: Record<string, string> = {
  dct_7: "7-Speed Dual-Clutch (DCT)",
  manual_6: "6-Speed Manual H-Pattern",
  seq_7: "7-Speed Sequential Dog-Box",
  single_speed: "Single-Speed (EV / Direct Drive)",
  cvt: "Continuously Variable (CVT)",
};

export const PowertrainSummaryPanel: React.FC<PowertrainSummaryPanelProps> = ({ state }) => {
  const bom = state.costAndBOM;
  const perf = state.performance;
  const dp = state.drivetrainPerformance;
  const dt = state.drivetrain;
  const compat = state.compatibility;

  const handleExportSpec = () => {
    const spec = {
      engine: {
        name: state.name,
        displacement: `${perf.displacementLiters}L`,
        architecture: `${state.architecture.family} ${state.architecture.cylinderCount}-cyl`,
        peakHp: `${perf.peakHorsepowerHp} HP @ ${perf.peakHorsepowerRpm} RPM`,
        peakTq: `${perf.peakTorqueNm} Nm @ ${perf.peakTorqueRpm} RPM`,
        redline: `${perf.redlineRpm} RPM`,
        mass: `${perf.engineTotalMassKg} kg`,
      },
      drivetrain: {
        architecture: TRANSMISSION_ARCH_LABELS[dt?.architecture ?? ""] ?? dt?.architecture,
        gears: dt?.activeGearCount,
        finalDrive: dt?.gearRatios.finalDrive,
        differential: dt?.lsdType,
        clutch: dt?.clutchType,
        shiftTime: `${dt?.shiftTimingMs} ms`,
        mass: `${dt?.massKg} kg`,
      },
      performance: {
        wheelHp: dp?.peakWheelHorsepowerHp,
        wheelTq: dp?.peakWheelTorqueNm,
        zeroTo60: dp?.estimatedZeroTo60Sec,
        zeroTo100: dp?.estimatedZeroTo100Sec,
        quarterMile: `${dp?.estimatedQuarterMileSec}s @ ${dp?.estimatedQuarterMileSpeedMph} mph`,
        totalMass: dp?.totalPowertrainMassKg,
        hpPerKg: dp?.powerToWeightHpPerKg,
      },
      cost: {
        engineBOM: bom.totalEngineBOMCostUSD,
        drivetrainBOM: bom.drivetrainCostUSD,
        totalPowertrain: bom.totalPowertrainBOMCostUSD,
        suggestedMSRP: bom.suggestedMSRPUSD,
      },
    };
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.name.replace(/\s+/g, "_")}_powertrain_spec.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950">
            <Scale size={18} />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-100">Powertrain Summary</span>
            <p className="text-[11px] text-slate-400">
              Combined engine + drivetrain BOM, mass budget, and compatibility
            </p>
          </div>
        </div>
        <button
          onClick={handleExportSpec}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          <Download size={13} />
          Export Spec
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BOM COST ROLL-UP */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <DollarSign size={14} className="text-emerald-400" />
            Bill of Materials Cost Roll-Up
          </div>
          <div className="space-y-1.5">
            {[
              { label: "Short Block", cost: bom.shortBlockCostUSD },
              { label: "Cylinder Heads", cost: bom.cylinderHeadsCostUSD },
              { label: "Valvetrain", cost: bom.valvetrainCostUSD },
              { label: "Forced Induction", cost: bom.forcedInductionCostUSD },
              { label: "Fuel & Ignition", cost: bom.fuelAndIgnitionCostUSD },
              { label: "Exhaust", cost: bom.exhaustCostUSD },
              { label: "Lubrication & Cooling", cost: bom.lubricationCoolingCostUSD },
              { label: "Precision Machining", cost: bom.precisionMachiningCostUSD },
              { label: "Assembly Labor", cost: bom.assemblyLaborCostUSD },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <span className="text-[11px] text-slate-400">{item.label}</span>
                <span className="text-xs font-mono font-bold text-slate-300">${item.cost?.toLocaleString() ?? 0}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-1.5 border-t border-slate-700">
              <span className="text-xs font-bold text-slate-200">Engine BOM Total</span>
              <span className="text-sm font-extrabold text-emerald-300 font-mono">${bom.totalEngineBOMCostUSD?.toLocaleString() ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[11px] text-cyan-400">Drivetrain ({TRANSMISSION_ARCH_LABELS[dt?.architecture ?? ""] ?? "—"})</span>
              <span className="text-xs font-mono font-bold text-cyan-300">${bom.drivetrainCostUSD?.toLocaleString() ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t-2 border-emerald-500/30 mt-1">
              <span className="text-sm font-extrabold text-emerald-200">TOTAL POWERTRAIN</span>
              <span className="text-lg font-black text-emerald-400 font-mono">${bom.totalPowertrainBOMCostUSD?.toLocaleString() ?? 0}</span>
            </div>
          </div>
        </div>

        {/* MASS BUDGET & POWER-TO-WEIGHT */}
        <div className="space-y-4">
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <Gauge size={14} className="text-amber-400" />
              Mass Budget & Power-to-Weight
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Engine</div>
                <div className="text-xl font-extrabold text-slate-200 mt-1">{perf.engineTotalMassKg} kg</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Drivetrain</div>
                <div className="text-xl font-extrabold text-slate-200 mt-1">{dt?.massKg ?? 0} kg</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-cyan-500/20">
                <div className="text-[10px] font-bold text-cyan-400 uppercase">Total Powertrain</div>
                <div className="text-xl font-extrabold text-cyan-300 mt-1">{dp?.totalPowertrainMassKg ?? "—"} kg</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-amber-500/20">
                <div className="text-[10px] font-bold text-amber-400 uppercase">HP / kg</div>
                <div className="text-xl font-extrabold text-amber-300 mt-1">{dp?.powerToWeightHpPerKg ?? "—"}</div>
              </div>
            </div>
          </div>

          {/* COMPATIBILITY STATUS */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
              {compat?.isMechanicallySafe ? (
                <ShieldCheck size={14} className="text-emerald-400" />
              ) : (
                <AlertTriangle size={14} className="text-red-400" />
              )}
              Mechanical Compatibility
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                compat?.isMechanicallySafe
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}>
                {compat?.isMechanicallySafe ? "✓ MECHANICALLY SAFE" : "✗ HAZARDS DETECTED"}
              </div>
              <span className="text-xs text-slate-400">
                {compat?.criticalHazardsCount ?? 0} critical • {compat?.warningsCount ?? 0} warnings
              </span>
            </div>
            {/* Drivetrain-specific torque check */}
            {dt && (
              <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                perf.peakTorqueNm <= dt.maxInputTorqueNm
                  ? "bg-emerald-950/30 border-emerald-500/20"
                  : "bg-red-950/30 border-red-500/20"
              }`}>
                <CheckCircle2 size={12} className={perf.peakTorqueNm <= dt.maxInputTorqueNm ? "text-emerald-400" : "text-red-400"} />
                <span className="text-[11px] text-slate-300">
                  Engine peak torque ({perf.peakTorqueNm} Nm) vs transmission input limit ({dt.maxInputTorqueNm} Nm)
                  {perf.peakTorqueNm > dt.maxInputTorqueNm ? " — EXCEEDS LIMIT" : " — OK"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
