import React, { useState, useMemo } from "react";
import { Activity, Disc, Wind, MoveHorizontal } from "lucide-react";
import { calculateTyreGrip, createTyreState } from "../../../sim/physics/tyreModel";

interface SuspensionDynamicsPanelProps {
  curbWeightKg?: number;
  cgHeightMm?: number;
  rollStiffnessFrontNmDeg?: number;
  rollStiffnessRearNmDeg?: number;
  aeroDownforceFrontN?: number;
  aeroDownforceRearN?: number;
  tireCompound?: "hard" | "medium" | "soft" | "supersoft" | "slick";
}

/**
 * ═════════════════════════════════════════════════════════════════════
 * SUSPENSION DYNAMICS & PACEJKA MAGIC FORMULA TELEMETRY PANEL
 * ═════════════════════════════════════════════════════════════════════
 *
 * Implements vehicle dynamics formulas from vehicle-physics-tuner:
 * - Pacejka Magic Formula lateral force Fy(α) slip angle curves
 * - Suspension Roll Gradient: dφ/day = (m * h_arm) / (K_φ,f + K_φ,r - m * g * h_arm)
 * - Damper Damping Ratio ζ_bump / ζ_rebound
 * - Aerodynamic Balance Ratio & Center of Pressure (CoP)
 */
export const SuspensionDynamicsPanel: React.FC<SuspensionDynamicsPanelProps> = ({
  curbWeightKg = 1450,
  cgHeightMm = 460,
  rollStiffnessFrontNmDeg = 1450,
  rollStiffnessRearNmDeg = 1150,
  aeroDownforceFrontN = 2200,
  aeroDownforceRearN = 3100,
  tireCompound = "slick",
}) => {
  const [frontStiffness, setFrontStiffness] = useState<number>(rollStiffnessFrontNmDeg);
  const [rearStiffness, setRearStiffness] = useState<number>(rollStiffnessRearNmDeg);
  const [damperBumpRatio, setDamperBumpRatio] = useState<number>(0.38);
  const [damperReboundRatio, setDamperReboundRatio] = useState<number>(0.72);
  const [currentSlipAngle, setCurrentSlipAngle] = useState<number>(5.5);

  // 1. Calculate Roll Gradient (°/g)
  const rollGradientDegPerG = useMemo(() => {
    const rollCenterHeightMm = 90; // Typical double wishbone roll center
    const rollMomentArmM = Math.max(0.1, (cgHeightMm - rollCenterHeightMm) / 1000);
    const totalRollStiffnessNmDeg = frontStiffness + rearStiffness;
    const totalRollStiffnessNmRad = (totalRollStiffnessNmDeg * 180) / Math.PI;

    const massKg = curbWeightKg;
    const g = 9.81;
    const numerator = massKg * rollMomentArmM; // Nm / (m/s²)
    const denominator = totalRollStiffnessNmRad - massKg * g * rollMomentArmM;

    const radPerMps2 = numerator / Math.max(100, denominator);
    const degPerG = radPerMps2 * g * (180 / Math.PI);
    return Math.round(degPerG * 100) / 100;
  }, [curbWeightKg, cgHeightMm, frontStiffness, rearStiffness]);

  // 2. Calculate Aero Balance Ratio (% Front)
  const aeroBalancePercentFront = useMemo(() => {
    const totalDownforce = aeroDownforceFrontN + aeroDownforceRearN;
    if (totalDownforce <= 0) return 50;
    return Math.round((aeroDownforceFrontN / totalDownforce) * 1000) / 10;
  }, [aeroDownforceFrontN, aeroDownforceRearN]);

  // 3. Generate Pacejka Magic Formula Slip Angle Curve: Fy = D * sin(C * arctan(B*α - E(B*α - arctan(B*α))))
  const pacejkaPoints = useMemo(() => {
    const pts: string[] = [];
    const w = 240;
    const h = 100;
    const maxSlipDeg = 14;
    const maxFy = 6500; // N per tire

    // Pacejka Coefficients for given compound
    const B = 0.22;
    const C = 1.35;
    const D = tireCompound === "slick" ? 5800 : tireCompound === "soft" ? 5200 : 4600;
    const E = -0.15;

    for (let alpha = 0; alpha <= maxSlipDeg; alpha += 0.5) {
      const alphaRad = (alpha * Math.PI) / 180;
      const bx = B * alpha;
      const fy = D * Math.sin(C * Math.atan(bx - E * (bx - Math.atan(bx))));
      const px = (alpha / maxSlipDeg) * w;
      const py = h - (fy / maxFy) * (h - 10);
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }

    return pts.join(" ");
  }, [tireCompound]);

  return (
    <div className="bg-slate-950/95 backdrop-blur-lg border border-amber-500/30 rounded-2xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-amber-400 animate-pulse" />
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-amber-300">
              Vehicle Dynamics & Suspension Telemetry
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Compound: <span className="text-amber-400 uppercase font-bold">{tireCompound}</span> | Weight: {curbWeightKg} kg
            </span>
          </div>
        </div>

        {/* Roll Gradient Target Classification */}
        <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border ${
          rollGradientDegPerG <= 2.0
            ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
            : rollGradientDegPerG <= 3.5
            ? "bg-amber-950/60 border-amber-500/40 text-amber-300"
            : "bg-amber-950/60 border-amber-500/40 text-amber-300"
        }`}>
          <span>Roll Gradient: {rollGradientDegPerG}°/g</span>
          <span className="text-[10px] opacity-80">
            ({rollGradientDegPerG <= 1.8 ? "Track Spec" : rollGradientDegPerG <= 3.0 ? "Sport/GT" : "Street Comfort"})
          </span>
        </div>
      </div>

      {/* ── Grid: Pacejka Curve & Damping Ratios ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Pacejka Slip Angle Curve */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Pacejka MF 5.2 Lateral Grip Curve ($F_y$ vs $\alpha$)</span>
            <span className="text-amber-400 font-bold">Peak Slip: ~6.8°</span>
          </div>

          <div className="relative h-36 w-full bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 250 110" className="w-full h-full p-2">
              {/* Grid Lines */}
              <line x1="10" y1="95" x2="245" y2="95" stroke="#475569" strokeWidth="1.2" />
              <line x1="10" y1="10" x2="10" y2="95" stroke="#475569" strokeWidth="1.2" />
              <line x1="118" y1="10" x2="118" y2="95" stroke="#334155" strokeWidth="0.8" strokeDasharray="2 2" />

              {/* Peak Slip Marker */}
              <text x="118" y="105" fill="#fbbf24" fontSize="8" fontFamily="monospace" textAnchor="middle">α = 7°</text>
              <text x="240" y="105" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">14° Slip</text>
              <text x="12" y="18" fill="#fbbf24" fontSize="8" fontFamily="monospace">Lateral Force Fy (N)</text>

              {/* Curve */}
              <polyline fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" points={pacejkaPoints} />

              {/* Current Operating Point Marker */}
              {(() => {
                const cx = (currentSlipAngle / 14) * 240;
                return (
                  <g>
                    <line x1={cx} y1="10" x2={cx} y2="95" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />
                    <circle cx={cx} cy="35" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>Operating Slip: <b className="text-amber-300">{currentSlipAngle.toFixed(1)}°</b></span>
            <span>Front Aero: <b className="text-amber-300">{aeroBalancePercentFront}%</b></span>
            <span>Rear Aero: <b className="text-amber-300">{(100 - aeroBalancePercentFront).toFixed(1)}%</b></span>
          </div>
        </div>

        {/* Damping & Aero Balance Status */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Damper Critical Damping Ratios */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Damper Damping Ratios (ζ)</span>
              <span className="text-emerald-400 font-bold">Optimized</span>
            </div>

            <div className="flex flex-col gap-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Bump (Compression) Ratio:</span>
                <span className="text-amber-300 font-bold">ζ = {damperBumpRatio.toFixed(2)} (Target: 0.35-0.45)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(damperBumpRatio / 1.0) * 100}%` }} />
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Rebound (Extension) Ratio:</span>
                <span className="text-emerald-300 font-bold">ζ = {damperReboundRatio.toFixed(2)} (Target: 0.65-0.75)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${(damperReboundRatio / 1.0) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Aero Center of Pressure Balance */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Aerodynamic Balance (CoP)</span>
              <span className="text-amber-400 font-bold">{aeroBalancePercentFront}% Front</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {aeroBalancePercentFront >= 42 && aeroBalancePercentFront <= 48 ? (
                <span className="text-emerald-400">✅ Neutral Balance: Optimal turn-in grip without high-speed snap oversteer.</span>
              ) : aeroBalancePercentFront > 48 ? (
                <span className="text-amber-400">⚠️ Front-Heavy Aero: Risk of high-speed rear instability and oversteer.</span>
              ) : (
                <span className="text-slate-400">ℹ️ Rear-Biased Aero: High stability, mild high-speed understeer.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Suspension Sliders ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
        {/* Front Anti-Roll Stiffness */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Front Roll Stiffness</span>
            <span className="text-amber-300 font-bold">{frontStiffness} Nm/°</span>
          </div>
          <input
            type="range"
            min="600"
            max="3000"
            step="50"
            value={frontStiffness}
            onChange={(e) => setFrontStiffness(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Rear Anti-Roll Stiffness */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Rear Roll Stiffness</span>
            <span className="text-amber-300 font-bold">{rearStiffness} Nm/°</span>
          </div>
          <input
            type="range"
            min="400"
            max="2500"
            step="50"
            value={rearStiffness}
            onChange={(e) => setRearStiffness(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Cornering Slip Angle */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Tire Slip Angle (α)</span>
            <span className="text-amber-300 font-bold">{currentSlipAngle.toFixed(1)}°</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="12.0"
            step="0.2"
            value={currentSlipAngle}
            onChange={(e) => setCurrentSlipAngle(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
          />
        </div>
      </div>
    </div>
  );
};
