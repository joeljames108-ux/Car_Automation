// ============================================================================
// PHASE 109 — MASTER MOTORSPORT ENGINE & GLOBAL ECONOMY PROVING DECK
// ============================================================================
// Multi-physics and econometric workstation integrating:
//   1. 18,000 RPM Desmodromic & Electro-Hydraulic Camless Valvetrain
//   2. 3-Rotor 20B/26B Wankel Rotary Epitrochoid & Apex Seal Leakage
//   3. Global Automotive Macro-Economy, Raw Commodity Indices & BOM Cost
// ============================================================================

import React, { useState } from 'react';
import {
  Flame,
  Activity,
  DollarSign,
  Cpu,
  BarChart2,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Gauge,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { DesmodromicCamlessValvetrainSolver, DesmodromicValvetrainResult } from '../../sim/engine/desmodromicCamlessValvetrainSolver';
import { TriRotorWankelRotarySolver, TriRotorWankelResult } from '../../sim/engine/triRotorWankelRotarySolver';
import { GlobalAutomotiveEconomySolver, VehicleMacroEconomicReport, EconomicMarketCycle } from '../../sim/economy/globalAutomotiveEconomySolver';

export const MotorsportEconomyProvingDeck: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DESMODROMIC_VALVETRAIN' | 'TRI_ROTOR_WANKEL' | 'GLOBAL_MACRO_ECONOMY'>('DESMODROMIC_VALVETRAIN');
  const [desmoRpm, setDesmoRpm] = useState<number>(14000);
  const [rotaryBoostBar, setRotaryBoostBar] = useState<number>(1.2);
  const [economyCycle, setEconomyCycle] = useState<EconomicMarketCycle>('STABLE_EQUILIBRIUM');

  // Compute Multi-Physics and Econometric Engines
  const valvetrainResult: DesmodromicValvetrainResult = DesmodromicCamlessValvetrainSolver.solveValvetrainDynamics({
    actuationType: 'DESMODROMIC_POSITIVE_DRIVE',
    engineSpeedRpm: desmoRpm,
    millerCycleRetardDeg: 20,
  });

  const rotaryResult: TriRotorWankelResult = TriRotorWankelRotarySolver.solveTriRotorEngine({
    portingType: 'PERIPHERAL_PORT_RACING',
    eccentricShaftRpm: 9200,
    boostPressureBar: rotaryBoostBar,
  });

  const economyReport: VehicleMacroEconomicReport = GlobalAutomotiveEconomySolver.solveGlobalEconomy({
    marketCycle: economyCycle,
    factoryRoboticsAutomationPct: 94.0,
    batteryCapacityKwh: 120.0,
  });

  return (
    <div className="flex flex-col h-full w-full bg-slate-900/80 text-gray-100 p-4 gap-4 overflow-y-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 rounded-2xl bg-slate-900/80 border border-[#162236] shadow-2xl gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-500/20 via-amber-500/20 to-amber-500/20 border border-amber-500/40 text-amber-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-white">
                MOTORSPORT COMBUSTION & MACRO-ECONOMY STUDIO
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold">
                PHASE 106–110 RUNNING
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              18,000 RPM Desmodromic VVT ▸ 3-Rotor 20B Wankel Epitrochoid ▸ Global Raw Material Indices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-[#1c2c47] text-gray-300">
            <span className="text-gray-500 mr-2">Desmo Max:</span>
            <span className="text-amber-400 font-bold">{valvetrainResult.maxEngineSpeedRpm} RPM</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-[#1c2c47] text-gray-300">
            <span className="text-gray-500 mr-2">Rotary Power:</span>
            <span className="text-rose-400 font-bold">{rotaryResult.brakeHorsepowerBhp} BHP</span>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'DESMODROMIC_VALVETRAIN', label: '18,000 RPM Desmodromic Valvetrain', icon: Gauge },
          { id: 'TRI_ROTOR_WANKEL', label: '3-Rotor Wankel Epitrochoid Engine', icon: Flame },
          { id: 'GLOBAL_MACRO_ECONOMY', label: 'Global Macro-Economy & Supply Chain', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 border-amber-500/50 text-white shadow-lg'
                  : 'bg-slate-900/80 border-[#131d2e] text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 flex flex-col gap-4">
        {/* TAB 1: Desmodromic Valvetrain */}
        {activeTab === 'DESMODROMIC_VALVETRAIN' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            <div className="flex flex-col p-5 rounded-2xl bg-slate-900/80 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
                <Gauge className="w-4 h-4" /> VALVE KINEMATICS & FLOAT ELIMINATION
              </h3>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-[#101826] flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">VALVE FLOAT STATUS:</span>
                  <span className="text-emerald-400 font-bold">100% ELIMINATED (Positive Drive)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">MAX INTAKE LIFT:</span>
                  <span className="text-amber-400 font-bold">{valvetrainResult.maxIntakeLiftMm} mm ({valvetrainResult.intakeDurationCrankDeg}° CA)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">HERTZIAN STRESS:</span>
                  <span className="text-amber-400 font-bold">{valvetrainResult.peakHertzianStressMpa} MPa (DLC Coated)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">VOLUMETRIC EFFICIENCY:</span>
                  <span className="text-amber-400 font-bold">{valvetrainResult.volumetricEfficiencyPct}%</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-mono text-gray-400">ENGINE SPEED: {desmoRpm} RPM</label>
                <input
                  type="range"
                  min="4000"
                  max="18000"
                  step="500"
                  value={desmoRpm}
                  onChange={(e) => setDesmoRpm(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col p-5 rounded-2xl bg-slate-900/80 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-gray-200 font-mono">720° 4-STROKE VALVE LIFT & CONTACT STRESS PROFILE</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                {valvetrainResult.liftProfilePoints.filter(p => p.crankAngleDeg >= 300 && p.crankAngleDeg <= 600).slice(0, 8).map((pt) => (
                  <div key={pt.crankAngleDeg} className="p-3 rounded-xl bg-slate-900/80 border border-[#101826] flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400">{pt.crankAngleDeg}° CA</span>
                    <span className="text-amber-400 font-bold">Lift: {pt.intakeLiftMm} mm</span>
                    <span className="text-amber-400">{pt.hertzianContactStressMpa} MPa</span>
                    <span className="text-[10px] text-amber-400">{pt.effectiveFlowAreaCm2} cm² Flow</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Tri-Rotor Wankel */}
        {activeTab === 'TRI_ROTOR_WANKEL' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            <div className="flex flex-col p-5 rounded-2xl bg-slate-900/80 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-rose-400 font-mono flex items-center gap-2">
                <Flame className="w-4 h-4" /> 3-ROTOR 20B TURBOCHARGED ROTARY
              </h3>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-[#101826] flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">OUTPUT POWER:</span>
                  <span className="text-rose-400 font-bold">{rotaryResult.brakeHorsepowerBhp} BHP ({rotaryResult.brakeTorqueNm} Nm)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">PEAK COMBUSTION:</span>
                  <span className="text-amber-400 font-bold">{rotaryResult.peakCombustionPressureBar} bar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">OIL INJECTION RATE:</span>
                  <span className="text-amber-400 font-bold">{rotaryResult.oilInjectionRateCcPerMin} cc/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">APEX SEAL WEAR:</span>
                  <span className="text-emerald-400 font-bold">{rotaryResult.apexSealWearRateMicronsPerHour} μm / hr</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-mono text-gray-400">BOOST PRESSURE: {rotaryBoostBar} BAR</label>
                <input
                  type="range"
                  min="0.2"
                  max="2.4"
                  step="0.1"
                  value={rotaryBoostBar}
                  onChange={(e) => setRotaryBoostBar(Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col p-5 rounded-2xl bg-slate-900/80 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-gray-200 font-mono">360° EPITROCHOID ROTOR CHAMBER INDICATOR (P-V CYCLE)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                {rotaryResult.chamberIndicatorDiagram.filter((_, idx) => idx % 4 === 0).slice(0, 8).map((pt) => (
                  <div key={pt.rotorAngleDeg} className="p-3 rounded-xl bg-slate-900/80 border border-[#101826] flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400">Rotor {pt.rotorAngleDeg}°</span>
                    <span className="text-rose-400 font-bold">{pt.cylinderPressureBar} bar</span>
                    <span className="text-amber-400">v_slide: {pt.apexSealSlidingVelocityMs} m/s</span>
                    <span className="text-[10px] text-emerald-400">h_film: {pt.apexSealFilmThicknessMicrons} μm</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Global Macro-Economy */}
        {activeTab === 'GLOBAL_MACRO_ECONOMY' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            <div className="flex flex-col p-5 rounded-2xl bg-slate-900/80 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> BOM COST & PRICE ELASTICITY
              </h3>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-[#101826] flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">TOTAL BOM COST:</span>
                  <span className="text-gray-100 font-bold">${economyReport.totalVehicleBomCostUsd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">RECOMMENDED MSRP:</span>
                  <span className="text-emerald-400 font-bold">${economyReport.recommendedMsrpUsd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">FACTORY OEE:</span>
                  <span className="text-amber-400 font-bold">{economyReport.factoryOverallEquipmentEffectivenessPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ANNUAL DEMAND:</span>
                  <span className="text-amber-400 font-bold">{economyReport.projectedAnnualSalesVolumeUnits.toLocaleString()} units</span>
                </div>
              </div>

              <div className="flex gap-2">
                {(['EXPANSION_BULL_MARKET', 'STABLE_EQUILIBRIUM', 'SUPPLY_CHAIN_SHORTAGE'] as EconomicMarketCycle[]).map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => setEconomyCycle(cycle)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-mono font-bold border transition-all ${
                      economyCycle === cycle
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-900/80 text-gray-400 border-[#1c2c47]'
                    }`}
                  >
                    {cycle.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col p-5 rounded-2xl bg-slate-900/80 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-gray-200 font-mono">RAW MATERIAL COMMODITY SPOT PRICE INDICES</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                {economyReport.rawMaterialCommodities.map((c) => (
                  <div key={c.commodityId} className="p-3.5 rounded-xl bg-slate-900/80 border border-[#101826] flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-bold text-[11px]">{c.name}</span>
                      <span className={`text-[10px] font-bold ${c.thirtyDayChangePct >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {c.thirtyDayChangePct >= 0 ? '+' : ''}{c.thirtyDayChangePct}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-400 font-bold text-sm">${c.spotPriceUsd.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-500">{c.unit}</span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Supply Risk Index: <strong className={c.supplyRiskIndex > 60 ? 'text-rose-400' : 'text-emerald-400'}>{c.supplyRiskIndex}/100</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
