import React, { useState, useMemo, memo } from "react";
import {
  Shield, Zap, Wind, Flame, Activity, Sparkles, Layers,
  Sliders, Award, Gauge, Disc, ArrowRight, CheckCircle2, AlertTriangle
} from "lucide-react";
import { MegawattHypercarStudioViewport } from "../MegawattHypercarStudioViewport";
import { CarboTitaniumMonocoqueSolver } from "../../../sim/hypercar/carboTitaniumMonocoqueSolver";
import { MegawattTriMotorPowertrainEngine } from "../../../sim/hypercar/megawattTriMotorPowertrainEngine";
import { ActiveGroundEffectVenturiAeromechanics, type ActiveDrsMode } from "../../../sim/hypercar/activeGroundEffectVenturiAeromechanics";
import { CarbonCeramicMatrixBrakeThermalFea } from "../../../sim/hypercar/carbonCeramicMatrixBrakeThermalFea";
import { useHypercarAssemblyStore } from "../../../sim/hypercar/state/hypercarAssemblyStore";
import { playHMITabSound, playHMIClickSound } from "../../../utils/hmiSoundSynth";

export type HypercarRDSubTab = "carbotanium_fea" | "trimotor_powertrain" | "venturi_aeromechanics" | "csic_brakes" | "bop_scrutineering" | "full_3d_lab";

interface HypercarRDTabDef {
  id: HypercarRDSubTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const HYPERCAR_RD_TABS: HypercarRDTabDef[] = [
  { id: "full_3d_lab", label: "Interactive 3D Megawatt Rig", icon: <Sparkles size={14} className="text-amber-400" />, badge: "3D CAD" },
  { id: "carbotanium_fea", label: "Carbotanium FEA Tub", icon: <Shield size={14} className="text-blue-400" />, badge: "75 kNm/°" },
  { id: "trimotor_powertrain", label: "800V Tri-Motor Powertrain", icon: <Zap size={14} className="text-cyan-400" />, badge: "1,600+ HP" },
  { id: "venturi_aeromechanics", label: "Venturi Ground Effect CFD", icon: <Wind size={14} className="text-emerald-400" /> },
  { id: "csic_brakes", label: "420mm C/SiC Brake Thermal", icon: <Flame size={14} className="text-rose-400" />, badge: "1,450°C" },
  { id: "bop_scrutineering", label: "WEC 24H BoP Scrutineering", icon: <Award size={14} className="text-yellow-400" />, badge: "ACO/FIA" },
];

export const HypercarDeepRDLab: React.FC = memo(function HypercarDeepRDLab() {
  const [activeSubTab, setActiveSubTab] = useState<HypercarRDSubTab>("full_3d_lab");
  const { metrics, homologationPassportId } = useHypercarAssemblyStore();

  // Interactive local states for calculations
  const [plyCount, setPlyCount] = useState<24 | 32 | 48>(32);
  const [tiMeshVolPct, setTiMeshVolPct] = useState<number>(18);
  const [appliedMomentNm, setAppliedMomentNm] = useState<number>(15000);

  const [icePowerHp, setIcePowerHp] = useState<number>(1050);
  const [frontMotorKw, setFrontMotorKw] = useState<number>(350);
  const [batteryKwh, setBatteryKwh] = useState<number>(85);

  const [airspeedKmH, setAirspeedKmH] = useState<number>(320);
  const [rideHeightMm, setRideHeightMm] = useState<number>(35);
  const [drsMode, setDrsMode] = useState<ActiveDrsMode>("HIGH_DOWNFORCE_CORNERING");

  // Solvers (memoized to avoid expensive re-calculations on unrelated renders)
  const monocoqueFea = useMemo(() => {
    return CarboTitaniumMonocoqueSolver.solveMonocoque({
      plyCount,
      titaniumMeshVolRatioPct: tiMeshVolPct,
      monocoqueLengthMm: 2750,
      monocoqueWidthMm: 1450,
      monocoqueHeightMm: 1100,
      appliedTorsionalMomentNm: appliedMomentNm,
    });
  }, [plyCount, tiMeshVolPct, appliedMomentNm]);

  const powertrain = useMemo(() => {
    return MegawattTriMotorPowertrainEngine.solvePowertrainKinetics({
      vehicleMassKg: metrics.totalMassKg || 1480,
      icePowerHp,
      frontLeftMotorKw: frontMotorKw,
      frontRightMotorKw: frontMotorKw,
      batteryCapacityKwh: batteryKwh,
      dragCoefficientCd: 0.31,
      frontalAreaM2: 2.05,
    });
  }, [metrics.totalMassKg, icePowerHp, frontMotorKw, batteryKwh]);

  const aero = useMemo(() => {
    return ActiveGroundEffectVenturiAeromechanics.solveAeromechanics({
      airspeedKmH,
      rideHeightMm,
      drsMode,
      wingAngleDeg: 12.0,
    });
  }, [airspeedKmH, rideHeightMm, drsMode]);

  const brakeFea = useMemo(() => {
    return CarbonCeramicMatrixBrakeThermalFea.solveBrakeThermalFea({
      entrySpeedKmH: airspeedKmH,
      vehicleMassKg: metrics.totalMassKg || 1480,
      rotorSpec: {
        outerDiameterMm: 420,
        innerDiameterMm: 240,
        thicknessMm: 40,
        rotorMassKg: 6.8,
        materialType: "CARBON_SILICON_CARBIDE_CSIC_R",
        maxOperatingTempC: 1450,
        specificHeatJPerKgK: 1200,
        thermalConductivityWPerMK: 45,
      },
      caliperSpec: {
        pistonCount: 10,
        pistonMaterial: "TITANIUM_NITRIDE_COATED",
        caliperBodyMaterial: "ALUMINUM_LITHIUM_MONOBLOC",
        maxHydraulicLinePressureBar: 120,
        totalPistonAreaCm2: 85,
      },
      hydraulicLinePressureBar: 95,
      ambientTempC: 30,
    });
  }, [airspeedKmH, metrics.totalMassKg]);

  return (
    <div className="w-full h-full flex flex-col bg-[#05070a] text-white overflow-hidden select-none">
      {/* Sub-Tabs Rail */}
      <div className="shrink-0 px-4 py-2 bg-black/60 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {HYPERCAR_RD_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playHMITabSound();
                setActiveSubTab(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border cursor-pointer ${
                isActive
                  ? "bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-sm shadow-amber-500/20"
                  : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-black">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeSubTab === "full_3d_lab" && (
          <div className="w-full h-[680px]">
            <MegawattHypercarStudioViewport />
          </div>
        )}

        {activeSubTab === "carbotanium_fea" && (
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="glass-panel p-6 border-amber-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="text-amber-400" size={24} />
                  <h2 className="text-xl font-bold text-slate-100 tracking-wide">
                    Carbotanium Monocoque Structural FEA & Tsai-Wu Failure Solver
                  </h2>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Analyze high-tensile carbon fiber woven with titanium thread weave. Evaluates torsional stiffness, shear strain, crash energy attenuation, and Tsai-Wu safety margins.
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black font-mono text-amber-400">
                  {(monocoqueFea.torsionalRigidityNmPerDeg / 1000).toFixed(1)} <span className="text-xs text-slate-400 font-normal">kNm/deg</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Torsional Rigidity Target</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Tsai-Wu Failure Index</span>
                <span className="text-2xl font-black font-mono text-emerald-400">{monocoqueFea.tsaiWuMaxFailureIndex.toFixed(3)}</span>
                <span className="text-xs text-emerald-300 block mt-1">
                  Status: {monocoqueFea.tsaiWuMaxFailureIndex < 1.0 ? "STRUCTURALLY SECURE" : "PLASTIC DEFORMATION RISK"}
                </span>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Total Bare Monocoque Mass</span>
                <span className="text-2xl font-black font-mono text-amber-300">{monocoqueFea.monocoqueBareWeightKg.toFixed(1)} kg</span>
                <span className="text-xs text-slate-400 block mt-1">Carbon + Titanium Matrix</span>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Crash Absorption</span>
                <span className="text-2xl font-black font-mono text-cyan-300">{(monocoqueFea.occupantCellCrushEnergyAbsorptionKj).toFixed(0)} kJ</span>
                <span className="text-xs text-slate-400 block mt-1">FIA 65G Impact Standard</span>
              </div>
            </div>

            {/* Interactive Parametric Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Composite Ply Schedule</label>
                <select
                  value={plyCount}
                  onChange={(e) => {
                    playHMIClickSound();
                    setPlyCount(parseInt(e.target.value) as 24 | 32 | 48);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value={24}>24-Ply Lightweight Sprint Layup</option>
                  <option value={32}>32-Ply Le Mans Endurance Spec [0/45/-45/90]s</option>
                  <option value={48}>48-Ply Heavy Reinforced Carbotanium</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Titanium Weave Ratio: {tiMeshVolPct}%</label>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={tiMeshVolPct}
                  onChange={(e) => setTiMeshVolPct(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Test Torsional Load: {appliedMomentNm} Nm</label>
                <input
                  type="range"
                  min="5000"
                  max="30000"
                  step="1000"
                  value={appliedMomentNm}
                  onChange={(e) => setAppliedMomentNm(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "trimotor_powertrain" && (
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="glass-panel p-6 border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="text-cyan-400" size={24} />
                  <h2 className="text-xl font-bold text-slate-100 tracking-wide">
                    800V Tri-Motor e-AWD Hybrid Powertrain Engine
                  </h2>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Simulates combined twin front permanent magnet synchronous axial-flux motors (700 kW) with rear twin-turbo combustion engine & MGU-K.
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black font-mono text-cyan-300">
                  {powertrain.combinedPeakPowerHp.toFixed(0)} <span className="text-xs text-slate-400 font-normal">HP</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Combined Output</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">0-100 km/h Launch</span>
                <span className="text-2xl font-black font-mono text-cyan-300">{powertrain.acceleration0_100KmHSec.toFixed(2)} s</span>
                <span className="text-xs text-slate-400 block mt-1">Torque Vectoring Active</span>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">0-200 km/h</span>
                <span className="text-2xl font-black font-mono text-amber-300">{powertrain.acceleration0_200KmHSec.toFixed(2)} s</span>
                <span className="text-xs text-slate-400 block mt-1">1/4 Mile: {powertrain.quarterMileTimeSec.toFixed(2)} s</span>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">V-Max Top Speed</span>
                <span className="text-2xl font-black font-mono text-emerald-400">{powertrain.topSpeedKmH.toFixed(0)} km/h</span>
                <span className="text-xs text-slate-400 block mt-1">Aero Drag Limited</span>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Total Wheel Torque</span>
                <span className="text-2xl font-black font-mono text-purple-300">{powertrain.combinedPeakTorqueNm.toFixed(0)} Nm</span>
                <span className="text-xs text-slate-400 block mt-1">Instant Electric Surge</span>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Combustion ICE Output: {icePowerHp} HP</label>
                <input
                  type="range"
                  min="600"
                  max="1400"
                  step="25"
                  value={icePowerHp}
                  onChange={(e) => setIcePowerHp(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Front Motors (Each): {frontMotorKw} kW</label>
                <input
                  type="range"
                  min="150"
                  max="450"
                  step="10"
                  value={frontMotorKw}
                  onChange={(e) => setFrontMotorKw(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Battery Pack Capacity: {batteryKwh} kWh</label>
                <input
                  type="range"
                  min="40"
                  max="120"
                  step="5"
                  value={batteryKwh}
                  onChange={(e) => setBatteryKwh(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "venturi_aeromechanics" && (
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="glass-panel p-6 border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="text-emerald-400" size={24} />
                  <h2 className="text-xl font-bold text-slate-100 tracking-wide">
                    Venturi Ground-Effect Aeromechanics & Active DRS Solver
                  </h2>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Computes suction pressure in underbody venturi tunnels, vortex bursting boundaries, porpoising frequency oscillations, and active DRS drag shedding.
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {aero.liftToDragRatioLoverD.toFixed(2)} <span className="text-xs text-slate-400 font-normal">L/D</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Aero Efficiency</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Total Downforce</span>
                <span className="text-2xl font-black font-mono text-emerald-300">{aero.totalDownforceKg.toFixed(0)} kg</span>
                <span className="text-xs text-slate-400 block mt-1">@ {airspeedKmH} km/h ({(aero.totalDownforceN / 1000).toFixed(1)} kN)</span>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Underbody Venturi Share</span>
                <span className="text-2xl font-black font-mono text-teal-300">{aero.underbodyVenturiSuctionPct.toFixed(0)}%</span>
                <span className="text-xs text-slate-400 block mt-1">Ground-Effect Suction</span>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Measured Aerodynamic Drag</span>
                <span className="text-2xl font-black font-mono text-rose-300">{(aero.totalDragN / 9.81).toFixed(0)} kg</span>
                <span className="text-xs text-slate-400 block mt-1">Drag Force: {(aero.totalDragN).toFixed(0)} N</span>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Porpoising Oscillation Status</span>
                <span className={`text-2xl font-black font-mono ${aero.porpoisingRiskStatus !== "STABLE_NOMINAL" ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                  {aero.porpoisingRiskStatus === "STABLE_NOMINAL" ? "STABLE" : `${aero.porpoisingFrequencyHz.toFixed(1)} Hz LIMIT CYCLE`}
                </span>
                <span className="text-xs text-slate-400 block mt-1">Ground Clearance: {rideHeightMm}mm</span>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Airspeed: {airspeedKmH} km/h</label>
                <input
                  type="range"
                  min="120"
                  max="380"
                  step="5"
                  value={airspeedKmH}
                  onChange={(e) => setAirspeedKmH(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Static Ride Height: {rideHeightMm} mm</label>
                <input
                  type="range"
                  min="20"
                  max="70"
                  value={rideHeightMm}
                  onChange={(e) => setRideHeightMm(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Active DRS Wing Configuration</label>
                <select
                  value={drsMode}
                  onChange={(e) => setDrsMode(e.target.value as ActiveDrsMode)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="HIGH_DOWNFORCE_CORNERING">High Downforce Cornering</option>
                  <option value="LOW_DRAG_STRAIGHT_SPRINT">Low Drag Straight Sprint (DRS Open)</option>
                  <option value="AIRBRAKE_DECELERATION_1_8G">Air Brake 65° Deceleration</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "csic_brakes" && (
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="glass-panel p-6 border-rose-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-rose-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="text-rose-400" size={24} />
                  <h2 className="text-xl font-bold text-slate-100 tracking-wide">
                    420mm Carbon-Silicon Carbide (C/SiC) Matrix Brake Thermal FEA
                  </h2>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Simulates full-stop deceleration thermal shock pyrometry, vane convective heat dissipation, and titanium 10-piston caliper hydraulic clamp force.
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black font-mono text-rose-400">
                  {brakeFea.rotorSurfaceTempPeakC.toFixed(0)} <span className="text-xs text-slate-400 font-normal">°C</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Peak Rotor Surface Pyrometry</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">100-0 km/h Stopping Distance</span>
                <span className="text-2xl font-black font-mono text-emerald-300">{brakeFea.stopDistanceMeters.toFixed(1)} m</span>
                <span className="text-xs text-slate-400 block mt-1">Decel: {brakeFea.decelerationG.toFixed(2)} G</span>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Hydraulic Clamping Force</span>
                <span className="text-2xl font-black font-mono text-amber-300">{(brakeFea.hydraulicClampingForceN / 1000).toFixed(1)} kN</span>
                <span className="text-xs text-slate-400 block mt-1">10-Piston Ti-N Caliper</span>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Vapor Lock Boiling Margin</span>
                <span className="text-2xl font-black font-mono text-teal-300">{brakeFea.vaporLockBoilingMarginC.toFixed(0)}°C</span>
                <span className="text-xs text-slate-400 block mt-1">Fluid Temp: {brakeFea.brakeFluidTempC.toFixed(0)}°C</span>
              </div>
              <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Thermo-Elastic Stress</span>
                <span className="text-2xl font-black font-mono text-purple-300">{brakeFea.thermoElasticHoopStressMpa.toFixed(0)} MPa</span>
                <span className="text-xs text-slate-400 block mt-1">Friction Coeff μ: {brakeFea.padFadeCoefficientMu.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "bop_scrutineering" && (
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="glass-panel p-6 border-yellow-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-yellow-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="text-yellow-400" size={24} />
                  <h2 className="text-xl font-bold text-slate-100 tracking-wide">
                    FIA / ACO World Endurance Championship BoP Scrutineering
                  </h2>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Balance of Performance homologation parameters for Le Mans Hypercar (LMH) & LMDh regulations.
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black font-mono text-emerald-400">
                  PASSPORT APPROVED
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{homologationPassportId || "ACO-LMH-2026-042"}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  LMH Technical Parameter Audit
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-slate-400">Minimum Vehicle Weight</span>
                    <span className="font-mono font-bold text-white">1030 kg (Compliant: {metrics.totalMassKg} kg)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-slate-400">Maximum Power Cap</span>
                    <span className="font-mono font-bold text-white">520 kW / 697 HP BoP Window</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-slate-400">Front MGU Deployment Threshold</span>
                    <span className="font-mono font-bold text-cyan-300">120 - 190 km/h (Dry/Wet)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-slate-400">Virtual Energy Stint Limit</span>
                    <span className="font-mono font-bold text-amber-300">900 MJ per Fuel/Energy Stint</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Sliders size={16} className="text-cyan-400" />
                  Dynamic BoP Ballast & Restrictor Table
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The automated Balance of Performance algorithm assigns ballast and power adjustments to equalize competitive lap time envelopes between pure ICE prototypes and hybrid 4WD hypercars across the 24H Le Mans circuit.
                </p>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Your car is within the optimal 1:1 downforce-to-drag and power-to-weight corridor for 24H Le Mans participation.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default HypercarDeepRDLab;
