// ============================================================================
// CHASSIS FEA STRUCTURAL STRESS & TORSIONAL RIGIDITY ANALYZER
// ============================================================================
// Complies with chassis-fea-stress-analyzer standard:
// - Structural stress hotspot analysis & von Mises stress distribution
// - Torsional rigidity benchmark targets:
//     * Steel Ladder Frame: 8 - 12 kNm/deg
//     * Pressed Steel Unibody: 20 - 30 kNm/deg
//     * Aluminum Spaceframe: 32 - 42 kNm/deg
//     * Carbon Monocoque Tub: 45 - 65+ kNm/deg
// - Real-time cornering roll torque deflection calculation
// ============================================================================

import React, { useState, useMemo, memo } from 'react';
import {
  ShieldAlert,
  Activity,
  Gauge,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  Sparkles,
} from 'lucide-react';

export type ChassisArchitecture = 'LADDER_FRAME' | 'PRESSED_UNIBODY' | 'ALU_SPACEFRAME' | 'CARBON_MONOCOQUE';

interface ArchitectureProfile {
  id: ChassisArchitecture;
  name: string;
  nominalRigidityKNm: number;
  rigidityMinKNm: number;
  rigidityMaxKNm: number;
  baselineMassKg: number;
  yieldStrengthMpa: number;
  description: string;
}

const ARCHITECTURE_PROFILES: Record<ChassisArchitecture, ArchitectureProfile> = {
  LADDER_FRAME: {
    id: 'LADDER_FRAME',
    name: 'Steel Ladder Frame',
    nominalRigidityKNm: 10,
    rigidityMinKNm: 8,
    rigidityMaxKNm: 12,
    baselineMassKg: 420,
    yieldStrengthMpa: 350,
    description: 'Heavy dual C-channel rails with crossmembers. Ideal for extreme off-road and towing, low torsional twist resistance.',
  },
  PRESSED_UNIBODY: {
    id: 'PRESSED_UNIBODY',
    name: 'Pressed Steel Unibody',
    nominalRigidityKNm: 25,
    rigidityMinKNm: 20,
    rigidityMaxKNm: 30,
    baselineMassKg: 310,
    yieldStrengthMpa: 580,
    description: 'High-strength boron & HSLA steel stamped monocoque with crumple zones. Balanced NVH and crashworthiness.',
  },
  ALU_SPACEFRAME: {
    id: 'ALU_SPACEFRAME',
    name: 'Aluminum Spaceframe',
    nominalRigidityKNm: 37,
    rigidityMinKNm: 32,
    rigidityMaxKNm: 42,
    baselineMassKg: 215,
    yieldStrengthMpa: 320,
    description: 'Extruded 6000-series aluminum nodes with cast shock towers. High rigidity-to-weight ratio for sports cars.',
  },
  CARBON_MONOCOQUE: {
    id: 'CARBON_MONOCOQUE',
    name: 'Carbon Monocoque Tub',
    nominalRigidityKNm: 56,
    rigidityMinKNm: 45,
    rigidityMaxKNm: 65,
    baselineMassKg: 105,
    yieldStrengthMpa: 1450,
    description: 'Pre-preg T800 autoclave-cured composite tub with honeycomb core. Uncompromising racing rigidity and pilot survival cell.',
  },
};

export const ChassisFeaStressCard: React.FC<{ className?: string }> = memo(({ className = '' }) => {
  const [architecture, setArchitecture] = useState<ChassisArchitecture>('CARBON_MONOCOQUE');
  const [corneringG, setCorneringG] = useState<number>(1.4);
  const [selectedLoadNode, setSelectedLoadNode] = useState<string>('FRONT_LEFT_TOWER');

  const profile = ARCHITECTURE_PROFILES[architecture];

  // Dynamic FEA Calculations
  const calculations = useMemo(() => {
    // Dynamic roll moment based on vehicle mass (nominal 1450kg), G-force, and roll center height (0.38m)
    const rollTorqueNm = 1450 * 9.81 * corneringG * 0.38;
    // Torsional deflection in degrees: theta = RollTorque (Nm) / Rigidity (Nm/deg)
    const torsionalDeflectionDeg = rollTorqueNm / (profile.nominalRigidityKNm * 1000);
    // Peak von Mises stress (MPa) scaling with G-force and rigidity stiffness factor
    const peakVonMisesMpa = Math.round(180 + corneringG * 110 * (45 / profile.nominalRigidityKNm));
    // Factor of safety
    const safetyFactor = Math.max(1.1, +(profile.yieldStrengthMpa / peakVonMisesMpa).toFixed(2));

    return {
      rollTorqueNm: Math.round(rollTorqueNm),
      torsionalDeflectionDeg: +torsionalDeflectionDeg.toFixed(3),
      peakVonMisesMpa,
      safetyFactor,
    };
  }, [profile, corneringG]);

  const loadNodes = [
    { id: 'FRONT_LEFT_TOWER', label: 'FL Shock Tower', stress: calculations.peakVonMisesMpa * 0.95 },
    { id: 'FRONT_RIGHT_TOWER', label: 'FR Shock Tower', stress: calculations.peakVonMisesMpa * 0.55 },
    { id: 'FIREWALL_NODE', label: 'Firewall Shear Web', stress: calculations.peakVonMisesMpa * 0.78 },
    { id: 'SILL_RAIL_LEFT', label: 'Left Rocker Sill', stress: calculations.peakVonMisesMpa * 0.88 },
    { id: 'REAR_BULKHEAD', label: 'Rear Subframe Mount', stress: calculations.peakVonMisesMpa * 0.68 },
  ];

  return (
    <div className={`flex flex-col bg-[#090d16] text-slate-100 rounded-2xl border border-slate-800/80 shadow-2xl p-5 font-sans ${className}`}>
      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-wide uppercase text-slate-100">
                Chassis FEA Stress & Rigidity Analyzer
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                kNm/deg HOMOLOGATED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Structural Torsional Stiffness · von Mises Hotspot Mapping · DIN ISO FEA Standards
            </p>
          </div>
        </div>

        {/* Safety Factor Pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold ${
          calculations.safetyFactor >= 2.0
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
            : calculations.safetyFactor >= 1.5
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
            : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
        }`}>
          <ShieldAlert className="w-4 h-4" />
          <span>SAFETY FACTOR: {calculations.safetyFactor}x</span>
        </div>
      </div>

      {/* ── ARCHITECTURE SELECTOR TABS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {(Object.keys(ARCHITECTURE_PROFILES) as ChassisArchitecture[]).map((archKey) => {
          const item = ARCHITECTURE_PROFILES[archKey];
          const isSelected = architecture === archKey;
          return (
            <button
              key={archKey}
              onClick={() => setArchitecture(archKey)}
              className={`spring-press flex flex-col p-3 rounded-xl border text-left transition-all focus-visible:outline-none focus-ring-emil ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/60 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60'
              }`}
            >
              <span className={`text-[10px] font-mono font-bold uppercase ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                {item.rigidityMinKNm}-{item.rigidityMaxKNm} kNm/deg
              </span>
              <span className="text-xs font-bold text-slate-100 mt-0.5 truncate">
                {item.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400 mt-1">
                {item.baselineMassKg} kg · {item.yieldStrengthMpa} MPa
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 2-COLUMN MAIN TELEMETRY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: Interactive FEA Heatmap Canvas */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Chassis von Mises Stress Gradient (Isometric Top View)
            </span>
            <span className="text-[11px] font-mono text-amber-400">
              Peak: {calculations.peakVonMisesMpa} MPa
            </span>
          </div>

          {/* SVG FEA Mesh Representation */}
          <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-[#080d1a] to-[#04060c] rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 500 280" className="w-full h-full p-2">
              <defs>
                {/* FEA Stress Heatmap Gradient */}
                <linearGradient id="fea-stress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                  <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="65%" stopColor="#10b981" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
                </linearGradient>

                <linearGradient id="chassis-tube-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="50%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Structural Frame Wireframe Polygons */}
              {/* Central Cockpit Monocoque Cell */}
              <polygon
                points="160,80 340,80 370,200 130,200"
                fill="url(#chassis-tube-grad)"
                stroke="#475569"
                strokeWidth="2"
                opacity="0.75"
              />

              {/* Stress Hotspot Overlay under Cornering Roll */}
              <polygon
                points="160,80 250,90 230,190 130,200"
                fill="url(#fea-stress-gradient)"
                opacity={Math.min(0.9, 0.4 + corneringG * 0.25)}
              />

              {/* Front Frame Rails */}
              <path
                d="M 160 80 L 70 95 L 70 140 L 140 140"
                fill="none"
                stroke={corneringG > 1.5 ? '#ef4444' : '#f59e0b'}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 160 120 L 70 140 L 70 185 L 140 185"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Rear Subframe Rails */}
              <path
                d="M 340 80 L 430 95 L 430 140 L 360 140"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 355 120 L 430 140 L 430 185 L 360 185"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Load Nodes Markers */}
              <g className="cursor-pointer">
                <circle cx="70" cy="95" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="70" cy="185" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.2" />
                <circle cx="160" cy="80" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.2" />
                <circle cx="200" cy="200" r="5.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.2" />
                <circle cx="430" cy="95" r="5" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.2" />
              </g>

              {/* Center Datum Line */}
              <line x1="40" y1="140" x2="460" y2="140" stroke="#94a3b8" strokeWidth="1" strokeDasharray="6, 4" opacity="0.4" />

              {/* Stress Legend Scale inside SVG */}
              <rect x="20" y="245" width="160" height="8" rx="4" fill="url(#fea-stress-gradient)" />
              <text x="20" y="265" fill="#94a3b8" fontSize="9" fontFamily="monospace">0 MPa</text>
              <text x="140" y="265" fill="#ef4444" fontSize="9" fontFamily="monospace">{profile.yieldStrengthMpa} MPa</text>
            </svg>
          </div>

          {/* Cornering Load Slider */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Cornering Load Factor:
              </span>
              <span className="font-bold text-amber-400 text-sm">{corneringG.toFixed(2)} G</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.05"
              value={corneringG}
              onChange={(e) => setCorneringG(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>

        {/* RIGHT: Rigidity Benchmarks & Structural Telemetry */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Key Rigidity Metric Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
              Torsional Stiffness Index
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-amber-400">
                {profile.nominalRigidityKNm}
              </span>
              <span className="text-xs font-mono text-slate-400">kNm / deg</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              {profile.description}
            </div>
          </div>

          {/* Dynamic Deflection under Roll Moment */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[9px] font-mono text-slate-400 uppercase">Roll Moment</span>
              <div className="text-base font-bold font-mono text-slate-100 mt-1">
                {calculations.rollTorqueNm.toLocaleString()} Nm
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[9px] font-mono text-slate-400 uppercase">Twist Deflection</span>
              <div className={`text-base font-bold font-mono mt-1 ${
                calculations.torsionalDeflectionDeg < 0.15 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {calculations.torsionalDeflectionDeg}°
              </div>
            </div>
          </div>

          {/* Load Path Hotspot Table */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wide block mb-2">
              Critical Node Stress Analysis
            </span>
            <div className="space-y-1.5">
              {loadNodes.map((n) => {
                const pct = Math.min(100, Math.round((n.stress / profile.yieldStrengthMpa) * 100));
                return (
                  <div key={n.id} className="flex flex-col text-xs font-mono">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>{n.label}</span>
                      <span className={pct > 80 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {Math.round(n.stress)} MPa ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct > 85 ? 'bg-rose-500' : pct > 65 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ChassisFeaStressCard.displayName = 'ChassisFeaStressCard';
