// ===================================================================
// APEX ENGINEER — 21 HYBRID & EV TECHNOLOGY TELEMETRY SUITE
// Live Electrochemical, Thermal ODE, SiC/GaN Loss & eAxle Analytics
// Frosted Translucent Liquid Glassmorphic Studio Workstation Component
// ===================================================================

import React, { useState, useMemo } from "react";
import { Zap, Battery, Thermometer, ShieldAlert, Cpu, Activity, Gauge, RefreshCw, BarChart2, Flame, Wind, Maximize2, Sparkles, Sliders, ChevronRight } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { evaluateFullHybridPhysicsSuite } from "../sim/physics/advancedHybridPhysicsEngine";

const HYBRID_TELEMETRY_TABS = ["overview", "motors", "battery", "inverter", "regen", "sports"] as const;
type HybridTelemetryTab = typeof HYBRID_TELEMETRY_TABS[number];

export function HybridTelemetrySuite() {
  const { design, sim } = useDesign();
  const eng = design.engine;

  const [testSpeedKmh, setTestSpeedKmh] = useState(120);
  const [testSocPercent, setTestSocPercent] = useState(80);
  const [activeTab, setActiveTab] = useState<HybridTelemetryTab>("overview");

  // Run Master 21-Category Physics Evaluation
  const physicsData = useMemo(() => {
    return evaluateFullHybridPhysicsSuite(eng, sim);
  }, [eng, sim, testSpeedKmh, testSocPercent]);

  return (
    <div className="space-y-4 p-4 md:p-5 rounded-2xl bg-white/40 dark:bg-base-900/60 border border-white/60 dark:border-amber-500/30 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all">
      {/* Translucent Header Banner */}
      <div className="space-y-3 p-3.5 rounded-xl bg-white/40 dark:bg-base-950/60 border border-white/60 dark:border-amber-500/30 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0 shadow-sm">
              <Zap size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-amber-50 font-mono tracking-wider">
                  21 HYBRID & EV TELEMETRY SUITE
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] font-mono font-bold border border-amber-500/40 uppercase tracking-wider shrink-0">
                  REAL-TIME ODE PHYSICS
                </span>
              </div>
              <p className="text-[11px] text-amber-400 dark:text-amber-200/60 font-mono mt-0.5">
                SiC/GaN Switching · Submerged Cooling · Axial Vectoring
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Translucent Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 rounded-xl bg-white/40 dark:bg-base-950/60 border border-white/60 dark:border-base-800 backdrop-blur-md">
          {HYBRID_TELEMETRY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === tab
                  ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.5)] scale-[1.02]"
                  : "text-amber-500 dark:text-amber-200/60 hover:text-slate-900 dark:hover:text-amber-50 hover:bg-white/60 dark:hover:bg-white/10 border border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW TELEMETRY GRID */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-white/50 dark:bg-base-950/60 border border-white/60 dark:border-amber-500/30 backdrop-blur-md space-y-1.5 shadow-sm hover:bg-white/70 dark:hover:bg-base-950/80 hover:border-amber-500/60 transition-all">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 dark:text-amber-200/60 tracking-wider block">Total Combined Power</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-300">
                {physicsData.sportsOutput.boostedPowerHp + Math.round((eng.hybridMotorPower || 180) * 1.341)}
              </span>
              <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-400">HP</span>
            </div>
            <p className="text-[10px] text-amber-300/50 dark:text-amber-200/60 font-mono pt-1 border-t border-slate-200/50 dark:border-base-800">ICE V12 + Electric Assist (SiC Inverter)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/50 dark:bg-base-950/60 border border-white/60 dark:border-amber-500/30 backdrop-blur-md space-y-1.5 shadow-sm hover:bg-white/70 dark:hover:bg-base-950/80 hover:border-amber-500/60 transition-all">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 dark:text-amber-200/60 tracking-wider block">Inverter Efficiency</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {(physicsData.peOutput.inverterEfficiencyFraction * 100).toFixed(1)}%
              </span>
              <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-300">eff</span>
            </div>
            <p className="text-[10px] text-amber-300/50 dark:text-amber-200/60 font-mono pt-1 border-t border-slate-200/50 dark:border-base-800">{eng.voltageArchitecture || 800}V High Voltage Rail</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/50 dark:bg-base-950/60 border border-white/60 dark:border-amber-500/30 backdrop-blur-md space-y-1.5 shadow-sm hover:bg-white/70 dark:hover:bg-base-950/80 hover:border-amber-500/60 transition-all">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 dark:text-amber-200/60 tracking-wider block">Battery Pack Temp</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                {physicsData.batteryOutput.packTemperatureC}°C
              </span>
              <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-300">steady</span>
            </div>
            <p className="text-[10px] text-amber-300/50 dark:text-amber-200/60 font-mono pt-1 border-t border-slate-200/50 dark:border-base-800">SOH: {(physicsData.batteryOutput.stateOfHealthFraction * 100).toFixed(0)}% Optimal</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/50 dark:bg-base-950/60 border border-white/60 dark:border-amber-500/30 backdrop-blur-md space-y-1.5 shadow-sm hover:bg-white/70 dark:hover:bg-base-950/80 hover:border-amber-500/60 transition-all">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 dark:text-amber-200/60 tracking-wider block">NACS 350kW Fast Charge</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                {physicsData.chargingOutput.chargeTimeMinutes}
              </span>
              <span className="text-xs font-bold font-mono text-amber-500 dark:text-amber-100/80">mins (10-80%)</span>
            </div>
            <p className="text-[10px] text-amber-300/50 dark:text-amber-200/60 font-mono pt-1 border-t border-slate-200/50 dark:border-base-800">V2G/V2H: {physicsData.chargingOutput.v2xAvailablePowerKw} kW Output</p>
          </div>
        </div>
      )}

      {/* TAB 2: ELECTRIC MOTOR MAGNETIC FLUX & FIELD WEAKENING */}
      {activeTab === "motors" && (
        <div className="p-3.5 rounded-xl bg-white/50 dark:bg-base-950/60 border border-white/60 dark:border-amber-500/30 backdrop-blur-md space-y-2.5">
          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono uppercase flex items-center gap-2">
            <Cpu size={14} /> Electric Motor Electromagnetic Flux & Loss Spectrum
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">Stator Copper Loss (I²R)</span>
              <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">{physicsData.motorOutput.copperLossKw} kW</div>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">Iron Core Hysteresis Loss</span>
              <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">{physicsData.motorOutput.ironCoreLossKw} kW</div>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">Field Weakening Status</span>
              <div className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {physicsData.motorOutput.isFieldWeakeningActive ? "ACTIVE (High-Speed)" : "INACTIVE (Max Torque)"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BATTERY ELECTROCHEMICAL & SOH DEGRADATION */}
      {activeTab === "battery" && (
        <div className="p-3.5 rounded-xl bg-white/50 dark:bg-base-950/60 border border-white/60 dark:border-amber-500/30 backdrop-blur-md space-y-2.5">
          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono uppercase flex items-center gap-2">
            <Battery size={14} /> Battery Electrochemical & SOH Degradation Model
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">Open Circuit Voltage</span>
              <div className="text-base font-bold font-mono text-slate-800 dark:text-amber-50">{physicsData.batteryOutput.openCircuitVoltageV} V</div>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">Internal Resistance (R_int)</span>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">{physicsData.batteryOutput.internalResistanceOhm} Ω</div>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">Max Continuous Discharge</span>
              <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">{physicsData.batteryOutput.maxContinuousDischargeKw} kW</div>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">Thermal Runaway Risk</span>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {(physicsData.batteryOutput.thermalRunawayRiskFraction * 100).toFixed(0)}% (SAFE)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SIC / GAN POWER ELECTRONICS */}
      {activeTab === "inverter" && (
        <div className="p-3.5 rounded-xl bg-white/50 dark:bg-base-950/60 border border-white/60 dark:border-amber-500/30 backdrop-blur-md space-y-2.5">
          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono uppercase flex items-center gap-2">
            <Activity size={14} /> Silicon Carbide (SiC) / GaN Inverter Switching Loss Solver
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">Conduction Loss (I² × R_on)</span>
              <div className="text-base font-bold font-mono text-slate-800 dark:text-amber-50">{physicsData.peOutput.conductionLossKw} kW</div>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">16 kHz Switching Loss</span>
              <div className="text-base font-bold font-mono text-slate-800 dark:text-amber-50">{physicsData.peOutput.switchingLossKw} kW</div>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">ISO 26262 Isolation Resistance</span>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">{physicsData.peOutput.isolationResistanceMohm} MΩ</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REGENERATIVE BRAKING & BRAKE BLENDING */}
      {activeTab === "regen" && (
        <div className="p-3.5 rounded-xl bg-white/50 dark:bg-base-950/60 border border-white/60 dark:border-amber-500/30 backdrop-blur-md space-y-2.5">
          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono uppercase flex items-center gap-2">
            <RefreshCw size={14} /> Regenerative Braking & Kinetic Energy Recovery
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">Energy Recovered per Stop</span>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">{physicsData.regenOutput.energyRecoveredKwh} kWh</div>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">Peak Regenerative Power</span>
              <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">{physicsData.regenOutput.peakRegenPowerKw} kW</div>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">Deceleration G-Force</span>
              <div className="text-base font-bold font-mono text-amber-700 dark:text-amber-300">{physicsData.regenOutput.decelerationG} G</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SPORTS HYBRID PERFORMANCE TECH */}
      {activeTab === "sports" && (
        <div className="p-3.5 rounded-xl bg-white/50 dark:bg-base-950/60 border border-white/60 dark:border-amber-500/30 backdrop-blur-md space-y-2.5">
          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono uppercase flex items-center gap-2">
            <Sparkles size={14} /> Sports Hybrid Performance Suite (eTurbo, Torque Fill, eAxle)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">Electric Torque Fill Boost</span>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">+{physicsData.sportsOutput.boostedTorqueNm} Nm</div>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">Turbo Lag Reduction</span>
              <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">-{physicsData.sportsOutput.turboLagReductionSec}s</div>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-base-900/60 border border-white/50 dark:border-base-800 space-y-1">
              <span className="text-[10px] text-amber-400 dark:text-amber-200/60 font-mono block font-bold">0-60 mph Sprint Delta</span>
              <div className="text-base font-bold font-mono text-amber-700 dark:text-amber-300">{physicsData.sportsOutput.zeroToSixtyDeltaSec}s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
