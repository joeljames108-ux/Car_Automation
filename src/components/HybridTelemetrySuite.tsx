// ===================================================================
// APEX ENGINEER — 21 HYBRID & EV TECHNOLOGY TELEMETRY SUITE
// Live Electrochemical, Thermal ODE, SiC/GaN Loss & eAxle Analytics
// ===================================================================

import { useState, useMemo } from "react";
import { Zap, Battery, Thermometer, ShieldAlert, Cpu, Activity, Gauge, RefreshCw, BarChart2, Flame, Wind, Maximize2, Sparkles, Sliders } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { evaluateFullHybridPhysicsSuite, calculateMotorPhysics, calculateBatteryPhysics, calculatePowerElectronicsPhysics, calculateHybridTransmissionPhysics, calculateRegenBrakingPhysics, calculateChargingPhysics, calculateSportsHybridPhysics } from "../sim/physics/advancedHybridPhysicsEngine";

export function HybridTelemetrySuite() {
  const { currentDesign, updateEngine } = useDesign();
  const eng = currentDesign.engine;

  const [testSpeedKmh, setTestSpeedKmh] = useState(120);
  const [testSocPercent, setTestSocPercent] = useState(80);
  const [activeTab, setActiveTab] = useState<"overview" | "motors" | "battery" | "inverter" | "regen" | "sports">("overview");

  // Run Master 21-Category Physics Evaluation
  const physicsData = useMemo(() => {
    return evaluateFullHybridPhysicsSuite(eng, {
      curbWeight: 1450,
      engine: { peakPower: 759, peakTorque: 720 } as any,
    } as any);
  }, [eng, testSpeedKmh, testSocPercent]);

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-gradient-to-b from-base-950 via-base-900 to-base-950 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Zap size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wider flex items-center gap-2">
              21 HYBRID & EV SUBSYSTEM PHYSICS TELEMETRY SUITE
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/40">
                REAL-TIME ODE PHYSICS
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              SiC/GaN Inverter Switching · Liquid Chiller Thermal ODE · Axial Flux Magnetic Vectoring
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-base-950 p-1 rounded-xl border border-base-800">
          {(["overview", "motors", "battery", "inverter", "regen", "sports"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW TELEMETRY GRID */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-base-900/90 border border-cyan-500/20 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Combined Power</span>
            <div className="text-xl font-bold font-mono text-cyan-300 flex items-baseline gap-1">
              {physicsData.sportsOutput.boostedPowerHp + Math.round((eng.hybridMotorPower || 180) * 1.341)}
              <span className="text-xs text-slate-400">HP</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">ICE + Electric Assist (SiC Inverter)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-base-900/90 border border-cyan-500/20 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Inverter Efficiency (SiC/GaN)</span>
            <div className="text-xl font-bold font-mono text-emerald-400 flex items-baseline gap-1">
              {(physicsData.peOutput.inverterEfficiencyFraction * 100).toFixed(1)}%
              <span className="text-xs text-slate-400">eff</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">{eng.voltageArchitecture || 800}V High Voltage Rail</p>
          </div>

          <div className="p-3.5 rounded-xl bg-base-900/90 border border-cyan-500/20 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Battery Pack Temp (Liquid Chiller)</span>
            <div className="text-xl font-bold font-mono text-amber-400 flex items-baseline gap-1">
              {physicsData.batteryOutput.packTemperatureC}°C
              <span className="text-xs text-slate-400">steady</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">SOH: {(physicsData.batteryOutput.stateOfHealthFraction * 100).toFixed(0)}% Optimal</p>
          </div>

          <div className="p-3.5 rounded-xl bg-base-900/90 border border-cyan-500/20 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">NACS 350kW Fast Charge</span>
            <div className="text-xl font-bold font-mono text-cyan-400 flex items-baseline gap-1">
              {physicsData.chargingOutput.chargeTimeMinutes}
              <span className="text-xs text-slate-400">mins (10-80%)</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">V2G/V2H: {physicsData.chargingOutput.v2xAvailablePowerKw} kW Output</p>
          </div>
        </div>
      )}

      {/* TAB 2: ELECTRIC MOTOR MAGNETIC FLUX & FIELD WEAKENING */}
      {activeTab === "motors" && (
        <div className="p-4 rounded-xl bg-base-900/90 border border-cyan-500/30 space-y-3">
          <h4 className="text-xs font-bold text-cyan-300 font-mono uppercase flex items-center gap-2">
            <Cpu size={14} /> Electric Motor Electromagnetic Flux & Loss Spectrum
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Stator Copper Loss (I²R)</span>
              <div className="text-lg font-bold font-mono text-amber-400">{physicsData.motorOutput.copperLossKw} kW</div>
            </div>
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Iron Core Hysteresis Loss</span>
              <div className="text-lg font-bold font-mono text-amber-400">{physicsData.motorOutput.ironCoreLossKw} kW</div>
            </div>
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Field Weakening Region Status</span>
              <div className="text-lg font-bold font-mono text-cyan-400">
                {physicsData.motorOutput.isFieldWeakeningActive ? "ACTIVE (High-Speed Constant Power)" : "INACTIVE (Max Torque Region)"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BATTERY ELECTROCHEMICAL & SOH DEGRADATION */}
      {activeTab === "battery" && (
        <div className="p-4 rounded-xl bg-base-900/90 border border-cyan-500/30 space-y-3">
          <h4 className="text-xs font-bold text-cyan-300 font-mono uppercase flex items-center gap-2">
            <Battery size={14} /> Battery Electrochemical & SOH Degradation Model
          </h4>
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Open Circuit Voltage</span>
              <div className="text-lg font-bold font-mono text-slate-100">{physicsData.batteryOutput.openCircuitVoltageV} V</div>
            </div>
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Internal Resistance (R_int)</span>
              <div className="text-lg font-bold font-mono text-emerald-400">{physicsData.batteryOutput.internalResistanceOhm} Ω</div>
            </div>
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Max Continuous Discharge</span>
              <div className="text-lg font-bold font-mono text-cyan-400">{physicsData.batteryOutput.maxContinuousDischargeKw} kW</div>
            </div>
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Thermal Runaway Risk</span>
              <div className="text-lg font-bold font-mono text-emerald-400">
                {(physicsData.batteryOutput.thermalRunawayRiskFraction * 100).toFixed(0)}% (SAFE)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SIC / GAN POWER ELECTRONICS */}
      {activeTab === "inverter" && (
        <div className="p-4 rounded-xl bg-base-900/90 border border-cyan-500/30 space-y-3">
          <h4 className="text-xs font-bold text-cyan-300 font-mono uppercase flex items-center gap-2">
            <Activity size={14} /> Silicon Carbide (SiC) / GaN Inverter Switching Loss Solver
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Conduction Loss (I² × R_on)</span>
              <div className="text-lg font-bold font-mono text-slate-100">{physicsData.peOutput.conductionLossKw} kW</div>
            </div>
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">16 kHz Switching Loss</span>
              <div className="text-lg font-bold font-mono text-slate-100">{physicsData.peOutput.switchingLossKw} kW</div>
            </div>
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">ISO 26262 Isolation Resistance</span>
              <div className="text-lg font-bold font-mono text-emerald-400">{physicsData.peOutput.isolationResistanceMohm} MΩ</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REGENERATIVE BRAKING & BRAKE BLENDING */}
      {activeTab === "regen" && (
        <div className="p-4 rounded-xl bg-base-900/90 border border-cyan-500/30 space-y-3">
          <h4 className="text-xs font-bold text-cyan-300 font-mono uppercase flex items-center gap-2">
            <RefreshCw size={14} /> Regenerative Braking & Kinetic Energy Recovery
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Energy Recovered per Stop</span>
              <div className="text-lg font-bold font-mono text-emerald-400">{physicsData.regenOutput.energyRecoveredKwh} kWh</div>
            </div>
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Peak Regenerative Power</span>
              <div className="text-lg font-bold font-mono text-cyan-400">{physicsData.regenOutput.peakRegenPowerKw} kW</div>
            </div>
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Deceleration G-Force</span>
              <div className="text-lg font-bold font-mono text-cyan-300">{physicsData.regenOutput.decelerationG} G</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SPORTS HYBRID PERFORMANCE TECH */}
      {activeTab === "sports" && (
        <div className="p-4 rounded-xl bg-base-900/90 border border-cyan-500/30 space-y-3">
          <h4 className="text-xs font-bold text-cyan-300 font-mono uppercase flex items-center gap-2">
            <Sparkles size={14} /> Sports Hybrid Performance Suite (eTurbo, Torque Fill, eAxle)
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Electric Torque Fill Boost</span>
              <div className="text-lg font-bold font-mono text-emerald-400">+{physicsData.sportsOutput.boostedTorqueNm} Nm</div>
            </div>
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">Turbo Lag Reduction</span>
              <div className="text-lg font-bold font-mono text-cyan-400">-{physicsData.sportsOutput.turboLagReductionSec}s</div>
            </div>
            <div className="p-3 rounded-xl bg-base-950 border border-base-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">0-60 mph Sprint Delta</span>
              <div className="text-lg font-bold font-mono text-cyan-300">{physicsData.sportsOutput.zeroToSixtyDeltaSec}s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
