import React, { useState, useMemo } from "react";
import { Gauge, Zap, Cog, Flame, ShieldAlert, Cpu, Activity } from "lucide-react";
import {
  evaluateClutchSlip,
  computeShiftTransient,
  calculateEDiffTorqueSplit,
  analyzeGearRatioProgression,
  type ClutchThermalState,
  type EDiffTorqueDistribution,
  type ShiftTransientResult,
} from "../../../sim/physics/transmissionPhysics";

interface TransmissionDynoTelemetryProps {
  transmissionType?: "manual_6" | "seq_7" | "dct_8" | "auto_8";
  gearCount?: number;
  finalDrive?: number;
  enginePeakTorqueNm?: number;
  redlineRpm?: number;
}

/**
 * ═════════════════════════════════════════════════════════════════════
 * TRANSMISSION & DRIVETRAIN DYNAMICS TELEMETRY HUD
 * ═════════════════════════════════════════════════════════════════════
 *
 * Real-Time Physics & Powertrain Engineering Visualizer:
 * 1. Tractive Effort ($F_{\text{drive}}$ vs $V_{\text{km/h}}$) Multi-Gear Envelopes
 * 2. RPM Drop & Shift Point Optimization ($RPM_{\text{after}} = RPM_{\text{before}} \cdot (R_{n+1}/R_n)$)
 * 3. Multi-Plate Wet Clutch Thermal Dissipation ($kJ$) & Glaze Degradation
 * 4. Active Electronic Limited-Slip Differential (E-Diff) Torque Vectoring Split
 */
export const TransmissionDynoTelemetry: React.FC<TransmissionDynoTelemetryProps> = ({
  transmissionType = "dct_8",
  gearCount = 8,
  finalDrive = 3.44,
  enginePeakTorqueNm = 620,
  redlineRpm = 8500,
}) => {
  // Configurable Transmission Tuner States
  const [selectedGear, setSelectedGear] = useState<number>(1);
  const [currentRpm, setCurrentRpm] = useState<number>(6800);
  const [clutchType, setClutchType] = useState<"organic" | "cerametallic" | "carbon_carbon" | "wet_multiplate">("wet_multiplate");
  const [diffRampType, setDiffRampType] = useState<"1.0_way" | "1.5_way" | "2.0_way" | "active_ediff">("active_ediff");
  const [steeringAngleDeg, setSteeringAngleDeg] = useState<number>(18);
  const [lateralG, setLateralG] = useState<number>(1.25);
  const [launchControlSlipMs, setLaunchControlSlipMs] = useState<number>(350);

  // Typical Standard Gear Ratios for 8-Speed DCT
  const gearRatios = useMemo(() => {
    switch (gearCount) {
      case 6:
        return [3.82, 2.36, 1.68, 1.31, 1.05, 0.84];
      case 7:
        return [3.92, 2.45, 1.75, 1.36, 1.08, 0.88, 0.72];
      case 8:
      default:
        return [4.05, 2.62, 1.88, 1.45, 1.18, 0.96, 0.80, 0.67];
    }
  }, [gearCount]);

  // Gear Progression Analysis
  const progressionData = useMemo(() => {
    return analyzeGearRatioProgression(gearRatios, finalDrive, redlineRpm);
  }, [gearRatios, finalDrive, redlineRpm]);

  // Current Gear Ratio & Speed
  const activeGearRatio = gearRatios[selectedGear - 1] || 1.0;
  const currentSpeedKmh = Math.round(
    ((currentRpm * 2 * Math.PI * 0.33 * 3.6) / (activeGearRatio * finalDrive * 60)) * 10
  ) / 10;

  // Clutch Slip Physics
  const clutchState: ClutchThermalState = useMemo(() => {
    const deltaOmega = (currentRpm - 2000) * ((2 * Math.PI) / 60);
    return evaluateClutchSlip(
      enginePeakTorqueNm,
      deltaOmega,
      launchControlSlipMs / 1000,
      clutchType,
      72
    );
  }, [enginePeakTorqueNm, currentRpm, launchControlSlipMs, clutchType]);

  // Shift Shock & G-Jerk Analysis
  const shiftTransient: ShiftTransientResult = useMemo(() => {
    const nextGearRatio = gearRatios[selectedGear] || activeGearRatio * 0.8;
    return computeShiftTransient(
      activeGearRatio,
      nextGearRatio,
      currentRpm,
      transmissionType === "seq_7" ? 1000 : 250,
      transmissionType === "seq_7"
    );
  }, [gearRatios, selectedGear, activeGearRatio, currentRpm, transmissionType]);

  // E-Diff Torque Vectoring Distribution
  const eDiffState: EDiffTorqueDistribution = useMemo(() => {
    const totalTorqueAtAxle = enginePeakTorqueNm * activeGearRatio * finalDrive * 0.88;
    return calculateEDiffTorqueSplit(
      totalTorqueAtAxle,
      steeringAngleDeg,
      lateralG,
      0.08,
      diffRampType
    );
  }, [enginePeakTorqueNm, activeGearRatio, finalDrive, steeringAngleDeg, lateralG, diffRampType]);

  // Tractive Effort Multi-Gear Curves SVG Path Data
  const tractiveCurves = useMemo(() => {
    return gearRatios.map((ratio, idx) => {
      const gearNum = idx + 1;
      const points: string[] = [];
      for (let rpm = 2000; rpm <= redlineRpm; rpm += 500) {
        const v = (rpm * 2 * Math.PI * 0.33 * 3.6) / (ratio * finalDrive * 60);
        const torqueAtRpm = enginePeakTorqueNm * (1 - Math.pow((rpm - 5500) / 4500, 2) * 0.25);
        const tractiveForceN = (torqueAtRpm * ratio * finalDrive * 0.90) / 0.33;
        
        // Map to SVG coordinates: width 380 (0-350 km/h), height 140 (0-16,000 N)
        const svgX = 30 + (v / 350) * 340;
        const svgY = 140 - (tractiveForceN / 16000) * 125;
        points.push(`${svgX.toFixed(1)},${svgY.toFixed(1)}`);
      }
      return {
        gear: gearNum,
        ratio,
        pathD: `M ${points.join(" L ")}`,
      };
    });
  }, [gearRatios, finalDrive, redlineRpm, enginePeakTorqueNm]);

  return (
    <div className="bg-amber-950/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-5 shadow-2xl text-amber-50 flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-amber-800/30 pb-3">
        <div className="flex items-center gap-2.5">
          <Cog className="w-5 h-5 text-amber-400 animate-spin" />
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-amber-300">
              Transmission & Drivetrain Telemetry HUD
            </h3>
            <span className="text-[11px] text-amber-200/60 font-mono">
              {gearCount}-Speed Dual-Clutch / Sequential | Final Drive: {finalDrive}:1 | Redline: {redlineRpm} RPM
            </span>
          </div>
        </div>

        {/* Active Gear & Speed Badge */}
        <div className="flex items-center gap-2 bg-amber-900/50 border border-amber-500/40 px-3 py-1 rounded-xl text-xs font-mono font-bold text-amber-200 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
          <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>GEAR {selectedGear} ({activeGearRatio}:1) · {currentSpeedKmh} km/h</span>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Tractive Force vs Speed Multi-Gear Curves */}
        <div className="lg:col-span-7 bg-amber-900/40 border border-amber-800/30 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-amber-100/80 font-bold flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" /> Tractive Force ($F_d$) vs Vehicle Speed ($V$)
            </span>
            <span className="text-[10px] text-amber-300/50">Max Force: 16.0 kN</span>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="relative w-full h-[160px] bg-amber-950/80 rounded-lg border border-amber-800/30 overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 400 150" className="w-full h-full">
              {/* Grid Lines */}
              {[30, 60, 90, 120].map((y) => (
                <line key={`t-grid-y-${y}`} x1="30" y1={y} x2="380" y2={y} stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
              ))}
              {[100, 170, 240, 310, 380].map((x) => (
                <line key={`t-grid-x-${x}`} x1={x} y1="15" x2={x} y2="140" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
              ))}

              {/* Multi-Gear Tractive Force Lines */}
              {tractiveCurves.map((curve) => (
                <g key={`tractive-gear-${curve.gear}`}>
                  <path
                    d={curve.pathD}
                    fill="none"
                    stroke={selectedGear === curve.gear ? "#fbbf24" : "#475569"}
                    strokeWidth={selectedGear === curve.gear ? "2.5" : "1.2"}
                    opacity={selectedGear === curve.gear ? 1 : 0.65}
                  />
                  {/* Gear Label on Top of Curve */}
                  <text
                    x={35 + (curve.gear - 1) * 38}
                    y={135 - (curve.gear === 1 ? 110 : 110 / (curve.gear * 0.75))}
                    fill={selectedGear === curve.gear ? "#fbbf24" : "#64748b"}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    G{curve.gear}
                  </text>
                </g>
              ))}

              {/* Axis Labels */}
              <text x="32" y="146" fill="#64748b" fontSize="8" fontFamily="monospace">0 km/h</text>
              <text x="180" y="146" fill="#64748b" fontSize="8" fontFamily="monospace">175 km/h</text>
              <text x="345" y="146" fill="#64748b" fontSize="8" fontFamily="monospace">350 km/h</text>
              <text x="2" y="24" fill="#64748b" fontSize="8" fontFamily="monospace" transform="rotate(-90 12,24)">16 kN</text>
            </svg>
          </div>

          {/* Gear Selection Pills */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
            {progressionData.map((g) => (
              <button
                key={`gear-select-btn-${g.gear}`}
                onClick={() => setSelectedGear(g.gear)}
                className={`flex-1 py-1 px-1.5 rounded-lg text-center font-mono text-[11px] border transition-all ${
                  selectedGear === g.gear
                    ? "bg-amber-500/25 border-amber-500 text-amber-200 font-bold shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                    : "bg-amber-950/60 border-amber-800/30 text-amber-200/60 hover:text-amber-50"
                }`}
              >
                <div>G{g.gear}</div>
                <div className="text-[9px] text-amber-300/50">{g.ratio}:1</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Clutch Thermal Slip & E-Diff Torque Vectoring */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Clutch Thermal & Wear Card */}
          <div className="bg-amber-900/40 border border-amber-800/30 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-amber-100/80 font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Multi-Plate Clutch Thermal State
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                clutchState.clutchTempC > 200 ? "bg-red-950 text-red-300 border border-red-500/40" : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
              }`}>
                {clutchState.clutchTempC}°C
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-amber-950/60 p-2 rounded border border-amber-800/30">
                <div className="text-[9px] text-amber-300/50">Slip Energy</div>
                <div className="text-amber-300 font-bold">{(clutchState.slipEnergyJoules / 1000).toFixed(1)} kJ</div>
              </div>
              <div className="bg-amber-950/60 p-2 rounded border border-amber-800/30">
                <div className="text-[9px] text-amber-300/50">Friction Coeff (μ)</div>
                <div className="text-amber-300 font-bold">{clutchState.frictionCoeff}</div>
              </div>
              <div className="bg-amber-950/60 p-2 rounded border border-amber-800/30">
                <div className="text-[9px] text-amber-300/50">Torque Limit</div>
                <div className="text-emerald-300 font-bold">{clutchState.torqueCapacityNm} Nm</div>
              </div>
            </div>

            {/* Launch Control Slip Time Slider */}
            <div className="flex flex-col gap-1 pt-1">
              <div className="flex justify-between text-[10px] font-mono text-amber-200/60">
                <span>Launch Control Clutch Slip Duration</span>
                <span className="text-amber-300 font-bold">{launchControlSlipMs} ms</span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="25"
                value={launchControlSlipMs}
                onChange={(e) => setLaunchControlSlipMs(parseInt(e.target.value))}
                className="w-full h-1.5 bg-amber-800/35 rounded appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>

          {/* E-Diff Torque Vectoring Card */}
          <div className="bg-amber-900/40 border border-amber-800/30 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-amber-100/80 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Active E-Diff Torque Vectoring
              </span>
              <span className="text-amber-300 font-mono text-[10px] font-bold">
                Lock: {eDiffState.lockupPercentage}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-amber-950/60 p-2 rounded border border-amber-800/30">
                <div className="text-[9px] text-amber-300/50">Left Wheel Torque</div>
                <div className="text-amber-300 font-bold">{eDiffState.leftWheelTorqueNm} Nm</div>
              </div>
              <div className="bg-amber-950/60 p-2 rounded border border-amber-800/30">
                <div className="text-[9px] text-amber-300/50">Right Wheel Torque</div>
                <div className="text-amber-300 font-bold">{eDiffState.rightWheelTorqueNm} Nm</div>
              </div>
            </div>

            {/* Dynamic Yaw Moment */}
            <div className="flex items-center justify-between text-[11px] font-mono text-amber-200/60 pt-1 border-t border-amber-800/30">
              <span>Vectoring Yaw Moment:</span>
              <span className="text-amber-300 font-bold">{eDiffState.vectoringYawMomentNm} Nm</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Tuning Sliders ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-amber-800/30">
        {/* Engine RPM Sweep */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono text-amber-200/60">
            <span>Engine RPM</span>
            <span className="text-amber-300 font-bold">{currentRpm} RPM</span>
          </div>
          <input
            type="range"
            min="2000"
            max={redlineRpm}
            step="100"
            value={currentRpm}
            onChange={(e) => setCurrentRpm(parseInt(e.target.value))}
            className="w-full h-1.5 bg-amber-800/35 rounded appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Cornering Steering Angle */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono text-amber-200/60">
            <span>Steering Angle (Diff Bias)</span>
            <span className="text-amber-300 font-bold">{steeringAngleDeg}°</span>
          </div>
          <input
            type="range"
            min="-45"
            max="45"
            step="1"
            value={steeringAngleDeg}
            onChange={(e) => setSteeringAngleDeg(parseInt(e.target.value))}
            className="w-full h-1.5 bg-amber-800/35 rounded appearance-none cursor-pointer accent-purple-400"
          />
        </div>

        {/* Shift Shock Index Metric */}
        <div className="flex flex-col justify-center bg-amber-900/40 p-2.5 rounded-lg border border-amber-800/30">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-amber-200/60">Shift Shock (Jerk):</span>
            <span className="text-amber-300 font-bold">{shiftTransient.shiftShockJerkGPerSec} g/s</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-amber-300/50 pt-1">
            <span>Sync Time: {shiftTransient.synchronizationTimeSec}s</span>
            <span>RPM Drop: {shiftTransient.rpmDropRatio * 100}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
