// ============================================================================
// EV BATTERY PACK ARCHITECT & THERMAL MANAGEMENT STUDIO
// ============================================================================
// Complies with ev-battery-pack-architect standard:
// - Cell Chemistries:
//     * LFP (Lithium Iron Phosphate): 160 Wh/kg, 3500+ cycles, 270°C runaway limit
//     * NMC 811 (Nickel Manganese Cobalt): 260 Wh/kg, 1200 cycles, liquid chilled
//     * Solid-State: 420 Wh/kg, zero thermal runaway risk
// - Voltage Architecture:
//     * 800V Architecture: 350kW DC Fast Charge, -25% copper harness weight, low I²R
//     * 400V Architecture: 150kW DC Fast Charge, thicker cabling
// - Serpentine bottom cold plate thermal dissipation & coolant flow simulation
// ============================================================================

import React, { useState, useMemo, memo } from 'react';
import {
  BatteryCharging,
  Zap,
  Thermometer,
  ShieldCheck,
  Flame,
  Droplets,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Cpu,
} from 'lucide-react';

export type VoltageSystem = '800V_ULTRA' | '400V_STANDARD';
export type CellChemistry = 'LFP' | 'NMC_811' | 'SOLID_STATE';

interface ChemistryProfile {
  id: CellChemistry;
  name: string;
  energyDensityWhKg: number;
  cycleLife: number;
  thermalRunawayTempC: number;
  relativeCostPerKwh: number;
  coolingNeed: 'PASSIVE_AIR' | 'MODERATE_LIQUID' | 'CHILLED_SERPENTINE';
  description: string;
}

const CHEMISTRY_PROFILES: Record<CellChemistry, ChemistryProfile> = {
  LFP: {
    id: 'LFP',
    name: 'LFP (Lithium Iron Phosphate)',
    energyDensityWhKg: 160,
    cycleLife: 3500,
    thermalRunawayTempC: 270,
    relativeCostPerKwh: 65,
    coolingNeed: 'MODERATE_LIQUID',
    description: 'Extremely safe olivine crystal structure. 3500+ cycle life, zero cobalt/nickel, robust against thermal runaway.',
  },
  NMC_811: {
    id: 'NMC_811',
    name: 'NMC 811 (Nickel-Manganese-Cobalt)',
    energyDensityWhKg: 260,
    cycleLife: 1200,
    thermalRunawayTempC: 210,
    relativeCostPerKwh: 110,
    coolingNeed: 'CHILLED_SERPENTINE',
    description: 'High energy density for performance hypercars. Demands precision glycol-water cold plates to maintain < 45°C.',
  },
  SOLID_STATE: {
    id: 'SOLID_STATE',
    name: 'Next-Gen Solid-State Ceramic',
    energyDensityWhKg: 420,
    cycleLife: 5000,
    thermalRunawayTempC: 450,
    relativeCostPerKwh: 220,
    coolingNeed: 'PASSIVE_AIR',
    description: 'Incombustible ceramic/sulfide solid electrolyte with pure lithium-metal anode. Immense gravimetric density.',
  },
};

export const EvBatteryThermalStudio: React.FC<{ className?: string }> = memo(({ className = '' }) => {
  const [voltage, setVoltage] = useState<VoltageSystem>('800V_ULTRA');
  const [chemistry, setChemistry] = useState<CellChemistry>('NMC_811');
  const [packCapacityKwh, setPackCapacityKwh] = useState<number>(100);
  const [ambientTempC, setAmbientTempC] = useState<number>(25);
  const [chargeRateC, setChargeRateC] = useState<number>(2.5); // C-rate

  const chemProfile = CHEMISTRY_PROFILES[chemistry];
  const is800V = voltage === '800V_ULTRA';

  // Physical Powertrain Calculations
  const metrics = useMemo(() => {
    // Pack Mass from gravimetric cell density (with 35% packaging overhead for enclosure, BMS, cooling plates)
    const packMassKg = Math.round((packCapacityKwh * 1000) / chemProfile.energyDensityWhKg * 1.35);
    
    // Harness mass (copper): 800V saves 25% wire mass due to halved current (P = V * I)
    const baselineHarnessKg = 32;
    const harnessMassKg = is800V ? +(baselineHarnessKg * 0.75).toFixed(1) : baselineHarnessKg;

    // Fast charge power (kW)
    const maxChargeKw = is800V ? 350 : 150;
    // Current at max charge power (A)
    const nominalVoltage = is800V ? 800 : 400;
    const peakCurrentAmps = Math.round((maxChargeKw * 1000) / nominalVoltage);

    // Internal resistance heating: P_heat = I^2 * R
    // High-power pack internal resistance ~ 0.035 Ohm (400V) vs 0.070 Ohm (800V packs with more series cells)
    const packResistanceOhm = is800V ? 0.055 : 0.035;
    // 800V has half current for same power -> I^2*R is halved!
    const heatDissipationWatts = Math.round(Math.pow(peakCurrentAmps, 2) * packResistanceOhm * 0.15);

    // Coolant flow required to maintain delta T < 2.5°C across the bottom plate: Q = m * Cp * deltaT
    // Cp of 50/50 Water-Glycol = 3560 J/(kg*K)
    const targetDeltaT = 2.4; // deg C
    const coolantFlowLpm = +((heatDissipationWatts / (3560 * targetDeltaT)) * 60 / 1.05).toFixed(1);

    // Pack core temperature steady state
    const packTempC = +(ambientTempC + (heatDissipationWatts / 1200)).toFixed(1);

    // 10-80% fast charge duration (mins)
    const timeTo80Mins = is800V ? 16 : 34;

    return {
      packMassKg,
      harnessMassKg,
      maxChargeKw,
      peakCurrentAmps,
      heatDissipationWatts,
      coolantFlowLpm,
      packTempC,
      timeTo80Mins,
    };
  }, [packCapacityKwh, chemProfile, is800V, ambientTempC, chargeRateC]);

  return (
    <div className={`flex flex-col bg-[#090d16] text-slate-100 rounded-2xl border border-slate-800/80 shadow-2xl p-5 font-sans ${className}`}>
      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-wide uppercase text-slate-100">
                800V EV Architecture & Battery Thermal Studio
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                800V vs 400V BENCHMARK
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Cell Chemistries (LFP / NMC 811 / Solid-State) · Serpentine Cold Plate Cooling · Harness Copper Weight
            </p>
          </div>
        </div>

        {/* Voltage Toggle Capsule */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setVoltage('800V_ULTRA')}
            className={`spring-press px-3 py-1.5 rounded-lg text-xs font-semibold focus-visible:outline-none focus-ring-emil ${
              is800V
                ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ 800V Architecture
          </button>
          <button
            onClick={() => setVoltage('400V_STANDARD')}
            className={`spring-press px-3 py-1.5 rounded-lg text-xs font-semibold focus-visible:outline-none focus-ring-emil ${
              !is800V
                ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            400V Legacy
          </button>
        </div>
      </div>

      {/* ── CELL CHEMISTRY SELECTOR ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {(Object.keys(CHEMISTRY_PROFILES) as CellChemistry[]).map((chemKey) => {
          const item = CHEMISTRY_PROFILES[chemKey];
          const isSelected = chemistry === chemKey;
          return (
            <button
              key={chemKey}
              onClick={() => setChemistry(chemKey)}
              className={`spring-press flex flex-col p-3.5 rounded-xl border text-left transition-all focus-visible:outline-none focus-ring-emil ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/60 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-[10px] font-mono font-bold uppercase ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                  {item.energyDensityWhKg} Wh/kg
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {item.cycleLife} Cycles
                </span>
              </div>
              <div className="text-xs font-bold text-slate-100">
                {item.name}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── MAIN DASHBOARD: 2-COLUMN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: Serpentine Cooling Plate Simulator */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              Serpentine Bottom Cold Plate Thermal Distribution
            </span>
            <span className={`text-xs font-mono font-bold ${metrics.packTempC > 45 ? 'text-rose-400' : 'text-emerald-400'}`}>
              Pack Temp: {metrics.packTempC}°C
            </span>
          </div>

          {/* SVG Cold Plate Simulation */}
          <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-[#080d1a] to-[#04060c] rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center p-3">
            <svg viewBox="0 0 520 280" className="w-full h-full">
              <defs>
                <linearGradient id="coolant-serpentine-flow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>

                <linearGradient id="battery-module-cell" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Battery Enclosure Base */}
              <rect x="30" y="30" width="460" height="220" rx="12" fill="#090d16" stroke="#334155" strokeWidth="2" />

              {/* 8 Battery Modules */}
              {[
                { x: 50, y: 50 }, { x: 155, y: 50 }, { x: 260, y: 50 }, { x: 365, y: 50 },
                { x: 50, y: 145 }, { x: 155, y: 145 }, { x: 260, y: 145 }, { x: 365, y: 145 },
              ].map((mod, idx) => (
                <g key={idx}>
                  <rect
                    x={mod.x}
                    y={mod.y}
                    width="95"
                    height="75"
                    rx="8"
                    fill="url(#battery-module-cell)"
                    stroke={metrics.packTempC > 45 ? '#ef4444' : '#38bdf8'}
                    strokeWidth="1.2"
                  />
                  <text x={mod.x + 12} y={mod.y + 25} fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    MOD 0{idx + 1}
                  </text>
                  <text x={mod.x + 12} y={mod.y + 45} fill="#34d399" fontSize="12" fontFamily="monospace" fontWeight="bold">
                    {(metrics.packTempC - (idx % 2 === 0 ? 0.4 : 0.8)).toFixed(1)}°C
                  </text>
                  <text x={mod.x + 12} y={mod.y + 60} fill="#64748b" fontSize="8" fontFamily="monospace">
                    {(is800V ? 800 : 400) / 8}V · 12S
                  </text>
                </g>
              ))}

              {/* Serpentine Bottom Cooling Channel Path */}
              <path
                d="M 40 240 L 470 240 Q 485 240 485 220 L 485 135 Q 485 115 470 115 L 40 115 Q 25 115 25 95 L 25 40 L 40 40"
                fill="none"
                stroke="url(#coolant-serpentine-flow)"
                strokeWidth="4"
                strokeDasharray="8, 4"
                className="animate-pulse"
                opacity="0.85"
              />
            </svg>
          </div>

          {/* Thermal Controls */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-800/80">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Ambient Temperature</span>
                <span className="font-bold text-amber-400">{ambientTempC}°C</span>
              </div>
              <input
                type="range"
                min="-10"
                max="50"
                value={ambientTempC}
                onChange={(e) => setAmbientTempC(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Pack Energy</span>
                <span className="font-bold text-amber-400">{packCapacityKwh} kWh</span>
              </div>
              <input
                type="range"
                min="50"
                max="140"
                step="5"
                value={packCapacityKwh}
                onChange={(e) => setPackCapacityKwh(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Electrical & Fast Charge Telemetry */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Fast Charge Metric Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
              DC Fast Charge Power (10-80%)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-amber-400">
                {metrics.maxChargeKw}
              </span>
              <span className="text-xs font-mono text-slate-400">kW Peak · {metrics.timeTo80Mins} Mins</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              {is800V
                ? '800V architecture doubles potential power at same wire gauge, slashing charge stop times to sub-20 minutes.'
                : '400V architecture limits charging power to 150kW before excessive cable heat and thermal throttling occur.'}
            </div>
          </div>

          {/* 4-Stat Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[9px] font-mono text-slate-400 uppercase">Harness Copper Mass</span>
              <div className="text-base font-bold font-mono text-slate-100 mt-1">
                {metrics.harnessMassKg} kg
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                {is800V ? '-25% Copper Savings' : 'Baseline Copper'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[9px] font-mono text-slate-400 uppercase">Coolant Flow Rate</span>
              <div className="text-base font-bold font-mono text-sky-400 mt-1">
                {metrics.coolantFlowLpm} L/min
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                ΔT &lt; 2.5°C target
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[9px] font-mono text-slate-400 uppercase">Pack Mass</span>
              <div className="text-base font-bold font-mono text-slate-100 mt-1">
                {metrics.packMassKg} kg
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Enclosure + Cells
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[9px] font-mono text-slate-400 uppercase">I²R Heat Loss</span>
              <div className="text-base font-bold font-mono text-amber-400 mt-1">
                {metrics.heatDissipationWatts} W
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                At {metrics.peakCurrentAmps}A Current
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

EvBatteryThermalStudio.displayName = 'EvBatteryThermalStudio';
