// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — MONOCOQUE & SURVIVAL CELL STUDIO
// ============================================================================

import React, { memo } from "react";
import { Shield, Scale, Layers, CheckCircle2, AlertTriangle } from "lucide-react";
import { useF1ConstructorStore } from "../../../sim/f1/state/f1ConstructorStore";
import type { CarbonFiberGrade, ResinMatrixType, CoreMaterialType } from "../../../sim/f1/types/f1Enums";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export const MonocoqueStudio: React.FC = memo(function MonocoqueStudio() {
  const { car, updateMonocoque } = useF1ConstructorStore();
  const m = car.monocoque;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Studio Header */}
      <div className="glass-panel p-6 border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-cyan-400" size={24} />
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">
              Carbon Fiber Monocoque & Safety Survival Cell
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Engineer the structural core of your Formula 1 car. Specify aerospace-grade composite layups, Nomex core sandwich panels, titanium Halo crash structures, and ballast distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-cyan-400">
              {m.monocoqueTorsionalRigidityKNmDeg} <span className="text-xs text-slate-400 font-normal">kNm/deg</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Torsional Rigidity</div>
          </div>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Carbon Fiber Grade */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Carbon Fiber Grade</span>
            <span className="text-[10px] text-cyan-400 font-mono">Structural Layup</span>
          </label>
          <select
            value={m.carbonFiberGrade}
            onChange={(e) => {
              playHMIClickSound();
              updateMonocoque({ carbonFiberGrade: e.target.value as CarbonFiberGrade });
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="T300_STANDARD">T300 Standard (230 GPa / 3.5 GPa)</option>
            <option value="T700_INTERMEDIATE">T700 Intermediate (230 GPa / 4.9 GPa)</option>
            <option value="T800_HIGH_STRENGTH">T800 High Strength (294 GPa / 5.88 GPa)</option>
            <option value="T1000_ULTRA_TENSILE">T1000 Ultra Tensile (294 GPa / 6.37 GPa)</option>
            <option value="M55J_HIGH_MODULUS">M55J Ultra High Modulus (540 GPa)</option>
            <option value="GRAPHENE_INFUSED">Graphene Infused Nano-Prepreg</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Higher modulus fibers increase torsional stiffness but require precise autoclave pressure cycles.
          </p>
        </div>

        {/* 2. Core Material */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Sandwich Core Material</span>
            <span className="text-[10px] text-cyan-400 font-mono">Energy Attenuation</span>
          </label>
          <select
            value={m.coreMaterial}
            onChange={(e) => {
              playHMIClickSound();
              updateMonocoque({ coreMaterial: e.target.value as CoreMaterialType });
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="NOMEX_HONEYCOMB_HRH10">Nomex Honeycomb HRH-10 (48 kg/m³)</option>
            <option value="ALUMINUM_5056_HONEYCOMB">Aluminum 5056 Honeycomb (Crush Resistant)</option>
            <option value="ROHACELL_HERO_POLYMETH">Rohacell PMI Foam (3D Contoured)</option>
            <option value="TITANIUM_3D_LATTICE">DMLS Titanium 3D Lattice</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Core thickness determines side impact resistance and bending moment capacity.
          </p>
        </div>

        {/* 3. Titanium Halo */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Titanium Halo Mount</span>
            <span className="text-[10px] text-ok-400 font-mono">FIA Art 13.2</span>
          </label>
          <select
            value={m.haloMaterial}
            onChange={(e) => {
              playHMIClickSound();
              updateMonocoque({ haloMaterial: e.target.value as any });
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="TITANIUM_GRADE_5_DMLS">Grade 5 Titanium (3D DMLS Laser Sintered)</option>
            <option value="TITANIUM_FORGED_EXTRUDED">Forged & Extruded Tubular Titanium</option>
          </select>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="haloAero"
              checked={m.haloFairingAeroRamp}
              onChange={(e) => {
                playHMIClickSound();
                updateMonocoque({ haloFairingAeroRamp: e.target.checked });
              }}
              className="accent-cyan-400 cursor-pointer"
            />
            <label htmlFor="haloAero" className="text-xs text-slate-300 cursor-pointer">
              Add Halo Micro-Aero Fairing (Reduces helmet buffet)
            </label>
          </div>
        </div>

        {/* 4. Cockpit Opening Template Width */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Cockpit Opening Width</span>
            <span className={`font-mono font-bold ${m.cockpitOpeningWidthMm >= 520 ? "text-ok-400" : "text-danger-400"}`}>
              {m.cockpitOpeningWidthMm} mm (Min 520mm)
            </span>
          </div>
          <input
            type="range"
            min="500"
            max="620"
            step="5"
            value={m.cockpitOpeningWidthMm}
            onChange={(e) => updateMonocoque({ cockpitOpeningWidthMm: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>500mm (Illegal)</span>
            <span>520mm (Legal Limit)</span>
            <span>620mm</span>
          </div>
        </div>

        {/* 5. Monocoque Torsional Stiffness */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Torsional Rigidity Target</span>
            <span className="font-mono text-cyan-400 font-bold">{m.monocoqueTorsionalRigidityKNmDeg} kNm/deg</span>
          </div>
          <input
            type="range"
            min="40"
            max="68"
            step="1"
            value={m.monocoqueTorsionalRigidityKNmDeg}
            onChange={(e) => updateMonocoque({ monocoqueTorsionalRigidityKNmDeg: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>40 kNm/deg</span>
            <span>54 kNm/deg (F1 Standard)</span>
            <span>68 kNm/deg</span>
          </div>
        </div>

        {/* 6. Ballast Placement */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Tungsten Ballast</span>
            <span className="font-mono text-amber-400 font-bold">{m.ballastTungstenKg} kg ({m.ballastPositionXPercent}% Front)</span>
          </div>
          <input
            type="range"
            min="0"
            max="45"
            step="1"
            value={m.ballastTungstenKg}
            onChange={(e) => updateMonocoque({ ballastTungstenKg: parseInt(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 kg</span>
            <span>18 kg (Recommended)</span>
            <span>45 kg</span>
          </div>
        </div>
      </div>
    </div>
  );
});
