import React, { useState, useMemo } from "react";
import { Gauge, Flame, Activity, Zap, Info } from "lucide-react";
import {
  calculateIMEP,
  calculateDynamicCompressionRatio,
  evaluateOctaneKnockLimit,
  wiebeMassFractionBurned,
  type CombustionConfig,
} from "../../../sim/physics/combustionModel";

interface CombustionDynoHUDProps {
  compressionRatio?: number;
  volumetricEfficiency?: number;
  fuelType?: "gasoline_93" | "e85" | "race_110";
  boostBar?: number;
  intakeRunnerLengthMm?: number;
  currentRpm?: number;
}

/**
 * ═════════════════════════════════════════════════════════════════════
 * THERMODYNAMIC COMBUSTION & VIRTUAL DYNO INDICATOR DIAGRAM HUD
 * ═════════════════════════════════════════════════════════════════════
 *
 * Implements real-time Otto/Miller cycle thermodynamic simulation:
 * - P-V (Pressure-Volume) 4-Stroke Indicator Loop with IMEP Integration
 * - Wiebe Mass Fraction Burned curve x(θ)
 * - Helmholtz Acoustic Intake Runner Resonance Tuning Curve
 * - Octane Knock Margin & Dynamic Compression Ratio (DCR)
 */
export const CombustionDynoHUD: React.FC<CombustionDynoHUDProps> = ({
  compressionRatio = 10.5,
  volumetricEfficiency = 0.98,
  fuelType = "gasoline_93",
  boostBar = 0.0,
  intakeRunnerLengthMm = 280,
  currentRpm = 6500,
}) => {
  const [rpm, setRpm] = useState<number>(currentRpm);
  const [boost, setBoost] = useState<number>(boostBar);
  const [cr, setCr] = useState<number>(compressionRatio);
  const [runnerLen, setRunnerLen] = useState<number>(intakeRunnerLengthMm);

  // Fuel configuration mapping
  const fuelConfig = useMemo(() => {
    switch (fuelType) {
      case "e85":
        return { lhv: 29.2, stoich: 9.8, actualAfr: 8.2, octane: 105, name: "E85 Ethanol Blend" };
      case "race_110":
        return { lhv: 43.8, stoich: 14.7, actualAfr: 12.0, octane: 110, name: "110 Octane Leaded Race Fuel" };
      case "gasoline_93":
      default:
        return { lhv: 44.0, stoich: 14.7, actualAfr: 12.5, octane: 93, name: "93 Octane Premium Unleaded" };
    }
  }, [fuelType]);

  // Real-time combustion calculations
  const combustionMetrics = useMemo(() => {
    const config: CombustionConfig = {
      compressionRatio: cr,
      volumetricEfficiency: volumetricEfficiency * (1 + boost * 0.8),
      fuelLHV: fuelConfig.lhv,
      stoichAFR: fuelConfig.stoich,
      actualAFR: fuelConfig.actualAfr,
      combustionDurationDeg: 50,
      gamma: 1.32,
    };

    const imepData = calculateIMEP(config);
    const dcr = calculateDynamicCompressionRatio(cr, 45);
    const knockMargin = evaluateOctaneKnockLimit(cr, boost, fuelConfig.octane, 35);
    const bmep = Math.max(0, imepData.imepGross * 0.88 - 0.8); // 88% mechanical efficiency minus pumping

    // Helmholtz resonance tuned RPM: N_tune ≈ (c / 2π) * sqrt(A / (L * V)) * factor
    // Speed of sound c ≈ 345 m/s
    const tunedRpm = Math.round(180000 / Math.max(120, runnerLen));

    return {
      ...imepData,
      dcr,
      knockMargin,
      bmep: Math.round(bmep * 100) / 100,
      tunedRpm,
    };
  }, [cr, volumetricEfficiency, boost, fuelConfig, runnerLen]);

  // Generate P-V Diagram SVG Path points
  const pvPath = useMemo(() => {
    const pts: string[] = [];
    const w = 240;
    const h = 140;
    const maxP = Math.max(80, combustionMetrics.cylinderPeakPressureEstimate);

    // 1. Intake Stroke (Bottom horizontal line ~1-2 bar)
    const pIntakeY = h - (1.0 + boost) * (h / maxP);
    pts.push(`M 30 ${pIntakeY} L ${w - 20} ${pIntakeY}`);

    // 2. Compression Stroke (Polytropic curve up to TDC)
    for (let v = w - 20; v >= 30; v -= 10) {
      const vRatio = (w - 20) / Math.max(30, v);
      const p = Math.min(maxP, (1.0 + boost) * Math.pow(vRatio, 1.32));
      const py = h - p * (h / maxP);
      pts.push(`L ${v} ${py}`);
    }

    // 3. Combustion Pressure Spike @ TDC (V = min)
    const pPeakY = h - combustionMetrics.cylinderPeakPressureEstimate * (h / maxP);
    pts.push(`L 30 ${pPeakY}`);

    // 4. Power / Expansion Stroke (Polytropic expansion down to BDC)
    for (let v = 30; v <= w - 20; v += 10) {
      const vRatio = (w - 20) / Math.max(30, v);
      const p = Math.min(maxP, combustionMetrics.cylinderPeakPressureEstimate / Math.pow(vRatio, 1.25));
      const py = h - p * (h / maxP);
      pts.push(`L ${v} ${py}`);
    }

    // 5. Blowdown & Exhaust Stroke (Drop back to atmospheric)
    pts.push(`L ${w - 20} ${pIntakeY} Z`);

    return pts.join(" ");
  }, [combustionMetrics.cylinderPeakPressureEstimate, boost]);

  // Generate Wiebe curve points
  const wiebePoints = useMemo(() => {
    const pts: string[] = [];
    const w = 160;
    const h = 60;
    for (let deg = 0; deg <= 60; deg += 3) {
      const x = (deg / 60) * w;
      const mfb = wiebeMassFractionBurned(deg, 50, 5.0, 2.0);
      const y = h - mfb * h;
      pts.push(`${x},${y}`);
    }
    return pts.join(" ");
  }, []);

  return (
    <div className="bg-slate-950/95 backdrop-blur-lg border border-amber-500/30 rounded-2xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-amber-300">
              Thermodynamic Combustion & P-V Dyno Analyzer
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{fuelConfig.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-300">
          <span className="text-slate-500">Thermal Eff:</span>
          <span className="text-emerald-400 font-bold">
            {(combustionMetrics.idealOttoEfficiency * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* ── Grid: P-V Diagram & Key Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* P-V Indicator Plot */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>P-V Indicator Diagram (Pressure vs. Volume)</span>
            <span className="text-amber-400 font-bold">
              P_max: {combustionMetrics.cylinderPeakPressureEstimate.toFixed(0)} bar
            </span>
          </div>

          <div className="relative h-44 w-full bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 260 150" className="w-full h-full p-2">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="30" y2="135" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="220" y1="20" x2="220" y2="135" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="30" y1="135" x2="240" y2="135" stroke="#475569" strokeWidth="1.5" />
              <line x1="30" y1="10" x2="30" y2="135" stroke="#475569" strokeWidth="1.5" />

              {/* TDC & BDC Markers */}
              <text x="30" y="146" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">TDC</text>
              <text x="220" y="146" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">BDC</text>
              <text x="18" y="20" fill="#f59e0b" fontSize="8" fontFamily="monospace" textAnchor="middle">P (bar)</text>

              {/* P-V Loop Filled Path */}
              <path d={pvPath} fill="url(#pv-flame-gradient)" opacity="0.3" />
              <path d={pvPath} fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />

              {/* Flame Gradient Def */}
              <defs>
                <linearGradient id="pv-flame-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>IMEP_gross: <b className="text-amber-300">{combustionMetrics.imepGross.toFixed(2)} bar</b></span>
            <span>BMEP: <b className="text-emerald-300">{combustionMetrics.bmep.toFixed(2)} bar</b></span>
            <span>Pump Loss: <b className="text-slate-300">{(combustionMetrics.imepGross - combustionMetrics.bmep).toFixed(2)} bar</b></span>
          </div>
        </div>

        {/* Combustion Physics Side Panel */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Wiebe Mass Fraction Burned Curve */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Wiebe Mass Burned x(θ)</span>
              <span className="text-amber-400">CA50: ~8° ATDC</span>
            </div>
            <div className="h-16 w-full bg-slate-950/60 rounded border border-slate-800/80 flex items-center justify-center p-1">
              <svg viewBox="0 0 160 65" className="w-full h-full">
                <polyline fill="none" stroke="#fbbf24" strokeWidth="2" points={wiebePoints} />
                <line x1="0" y1="32" x2="160" y2="32" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" />
              </svg>
            </div>
          </div>

          {/* Knock Limit & Safety Margin Badge */}
          <div className={`rounded-xl p-3 border flex items-center justify-between font-mono text-xs ${
            combustionMetrics.knockMargin >= 2.0
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : combustionMetrics.knockMargin >= 0.0
              ? "bg-slate-900/60 border-amber-500/40 text-amber-300"
              : "bg-red-950/50 border-red-500/50 text-red-300 animate-pulse"
          }`}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <div>
                <div className="font-bold">Knock Safety Margin</div>
                <div className="text-[10px] opacity-80">
                  DCR: {combustionMetrics.dcr}:1 | Octane: {fuelConfig.octane}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-bold">{combustionMetrics.knockMargin.toFixed(1)} bar</span>
              <div className="text-[10px]">
                {combustionMetrics.knockMargin < 0 ? "DETONATION DETECTED" : "SAFE COMBUSTION"}
              </div>
            </div>
          </div>

          {/* Helmholtz Intake Acoustic Tuning */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Helmholtz Acoustic Peak</span>
              <span className="text-amber-400 font-bold">{combustionMetrics.tunedRpm} RPM</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Intake runner length ({runnerLen}mm) resonates at {combustionMetrics.tunedRpm} RPM for maximum ram-charge volumetric efficiency.
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Live Tuning Sliders ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
        {/* Compression Ratio */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Static CR</span>
            <span className="text-amber-300 font-bold">{cr.toFixed(1)}:1</span>
          </div>
          <input
            type="range"
            min="8.0"
            max="14.5"
            step="0.1"
            value={cr}
            onChange={(e) => setCr(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Turbo Boost */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Boost Pressure</span>
            <span className="text-amber-300 font-bold">{boost.toFixed(2)} bar</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="2.5"
            step="0.05"
            value={boost}
            onChange={(e) => setBoost(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Intake Runner Length */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Runner Length</span>
            <span className="text-amber-300 font-bold">{runnerLen} mm</span>
          </div>
          <input
            type="range"
            min="120"
            max="450"
            step="10"
            value={runnerLen}
            onChange={(e) => setRunnerLen(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-purple-400"
          />
        </div>

        {/* Engine RPM */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Engine Speed</span>
            <span className="text-emerald-300 font-bold">{rpm} RPM</span>
          </div>
          <input
            type="range"
            min="1000"
            max="9500"
            step="100"
            value={rpm}
            onChange={(e) => setRpm(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
          />
        </div>
      </div>
    </div>
  );
};
