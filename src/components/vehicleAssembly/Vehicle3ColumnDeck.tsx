import React from 'react';
import {
  Settings,
  Layers,
  Activity,
  Info,
  Sparkles,
  DollarSign,
  Shield,
  Gauge,
  Wrench,
  CheckCircle2,
  Zap,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { VehicleSubsystemStage } from '../../exterior3d/types/vehicleConstructionTypes';
import { MaterialGrade } from '../../sim/assemblyTypes';
import { Slider, ChoiceGrid } from '../ui/Controls';

interface Vehicle3ColumnDeckProps {
  activeStage: VehicleSubsystemStage;
  installedStages?: VehicleSubsystemStage[];
  materialGrade: MaterialGrade;
  onSelectMaterialGrade: (grade: MaterialGrade) => void;
  onInstallStage?: (stage: VehicleSubsystemStage) => void;
  onRemoveStage?: (stage: VehicleSubsystemStage) => void;
  onNextStage?: () => void;
  wheelbaseMm: number;
  trackWidthFrontMm: number;
  trackWidthRearMm: number;
  rideHeightMm: number;
  onUpdateWheelbase: (val: number) => void;
  onUpdateTrackWidthFront: (val: number) => void;
  onUpdateTrackWidthRear: (val: number) => void;
  onUpdateRideHeight: (val: number) => void;
  metrics: {
    totalMassKg: number;
    torsionalRigidityKNmPerDeg: number;
    estimated0to100Kph: number;
    estimatedTopSpeedKph: number;
    lateralG: number;
    brakingDist100to0M: number;
    totalBOMCostUSD: number;
  };
}

export const Vehicle3ColumnDeck: React.FC<Vehicle3ColumnDeckProps> = ({
  activeStage,
  installedStages = [],
  materialGrade,
  onSelectMaterialGrade,
  onInstallStage,
  onRemoveStage,
  onNextStage,
  wheelbaseMm,
  trackWidthFrontMm,
  trackWidthRearMm,
  rideHeightMm,
  onUpdateWheelbase,
  onUpdateTrackWidthFront,
  onUpdateTrackWidthRear,
  onUpdateRideHeight,
  metrics,
}) => {
  const materialTiers = [
    {
      id: 'cast' as MaterialGrade,
      name: 'Stamped Steel (OEM Base)',
      badge: 'OEM BASE',
      massLabel: '100%',
      rigidityLabel: '+0 kNm/°',
      costMult: '1.0x',
      description: 'Deep-drawn stamped high-strength steel. Lowest production cost and high impact ductility.',
    },
    {
      id: 'forged' as MaterialGrade,
      name: 'Die-Cast Aluminum Alloy (Lightweight)',
      badge: 'RACE SPEC',
      massLabel: '85%',
      rigidityLabel: '+6.0 kNm/°',
      costMult: '1.4x',
      description: 'Aerospace 6000/7000-series aluminum. 15% mass reduction with superior torsional responsiveness.',
    },
    {
      id: 'billet' as MaterialGrade,
      name: 'Compacted Graphite / CNC Billet Alloy',
      badge: 'CNC BILLET',
      massLabel: '75%',
      rigidityLabel: '+14.0 kNm/°',
      costMult: '1.9x',
      description: '5-axis CNC machined billet structure. Double fatigue strength under high-frequency track loads.',
    },
    {
      id: 'titanium' as MaterialGrade,
      name: 'Titanium & Pre-Preg Carbon Monocell',
      badge: 'TITANIUM / CARBON',
      massLabel: '60%',
      rigidityLabel: '+24.0 kNm/°',
      costMult: '3.8x',
      description: 'Autoclave-cured carbon fiber & Ti-6Al-4V hardpoints. Uncompromising Formula-1 grade stiffness.',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono">
      {/* ── COLUMN 1: PART CONTROLS & GEOMETRIC DIMENSIONS ── */}
      <div className="bg-white/80 dark:bg-base-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Settings size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase">
              {activeStage === 'architecture'
                ? 'Platform Architecture & Kinematics'
                : activeStage === 'chassis_platform'
                ? 'Chassis Frame & Structural Envelopes'
                : activeStage === 'powertrain_engine'
                ? 'Powertrain & Engine Placement'
                : activeStage === 'transmission'
                ? 'Transmission & Final Drive'
                : activeStage === 'suspension'
                ? 'Suspension Kinematics & Springs'
                : activeStage === 'wheels_brakes'
                ? 'Rotor Sizing & Tire Compounds'
                : activeStage === 'aerodynamics'
                ? 'Aerodynamic Downforce & DRS'
                : 'Component Dimensions & Fasteners'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Parametric geometry, track width & ride height
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          <Slider
            label="Chassis Wheelbase"
            value={wheelbaseMm}
            min={2400}
            max={3700}
            step={10}
            unit="mm"
            onChange={onUpdateWheelbase}
          />
          <Slider
            label="Front Track Width"
            value={trackWidthFrontMm}
            min={1500}
            max={1850}
            step={5}
            unit="mm"
            onChange={onUpdateTrackWidthFront}
          />
          <Slider
            label="Rear Track Width"
            value={trackWidthRearMm}
            min={1500}
            max={1950}
            step={5}
            unit="mm"
            onChange={onUpdateTrackWidthRear}
          />
          <Slider
            label="Chassis Ride Height"
            value={rideHeightMm}
            min={55}
            max={280}
            step={2}
            unit="mm"
            onChange={onUpdateRideHeight}
          />
        </div>
      </div>

      {/* ── COLUMN 2: METALLURGY & MATERIAL GRADE (4 TIERS) ── */}
      <div className="bg-white/80 dark:bg-base-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase">
                Metallurgy & Material Grade
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Density, structural stiffness & thermal limits
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
            4 Grades
          </span>
        </div>

        <div className="space-y-2.5">
          {materialTiers.map((tier) => {
            const isSelected = materialGrade === tier.id;

            return (
              <div
                key={tier.id}
                onClick={() => onSelectMaterialGrade(tier.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 space-y-1.5 ${
                  isSelected
                    ? 'bg-amber-500/10 dark:bg-slate-900/60 border-amber-500 dark:border-amber-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-50 dark:bg-base-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-400'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                    <strong className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                      {tier.name}
                    </strong>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-base-900 text-slate-500'}`}>
                    {tier.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
                  <div>
                    <span>Mass: </span>
                    <strong className={isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
                      {tier.massLabel}
                    </strong>
                  </div>
                  <div>
                    <span>Rigidity: </span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {tier.rigidityLabel}
                    </strong>
                  </div>
                  <div>
                    <span>Cost: </span>
                    <strong className="text-amber-600 dark:text-amber-400">
                      {tier.costMult}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── COLUMN 3: LIVE SPEC DELTAS & ENGINEERING ADVISORY ── */}
      <div className="bg-white/80 dark:bg-base-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase">
                Vehicle Performance Impact
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live calculated mass, rigidity & dynamic grip
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Live Computed
          </span>
        </div>

        {/* Metric Delta Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-base-950/70 border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 block">TOTAL CURB MASS</span>
            <strong className="text-sm text-amber-600 dark:text-amber-400 font-bold block">
              {metrics.totalMassKg} kg
            </strong>
            <span className="text-[9px] text-slate-400 block">Complete wet weight</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-base-950/70 border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 block">TORSIONAL RIGIDITY</span>
            <strong className="text-sm text-emerald-600 dark:text-emerald-400 font-bold block">
              {metrics.torsionalRigidityKNmPerDeg} kNm/°
            </strong>
            <span className="text-[9px] text-slate-400 block">Chassis deflection resistance</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-base-950/70 border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 block">0-100 KM/H ACCEL</span>
            <strong className="text-sm text-amber-600 dark:text-amber-400 font-bold block">
              {metrics.estimated0to100Kph} s
            </strong>
            <span className="text-[9px] text-slate-400 block">Top: {metrics.estimatedTopSpeedKph} km/h</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-base-950/70 border border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 block">HARDWARE BOM COST</span>
            <strong className="text-sm text-amber-600 dark:text-amber-400 font-bold block">
              ${metrics.totalBOMCostUSD.toLocaleString()}
            </strong>
            <span className="text-[9px] text-slate-400 block">Subsystems total sum</span>
          </div>
        </div>

        {/* Engineering Advisory Card */}
        <div className="p-3 rounded-2xl bg-amber-500/5 dark:bg-slate-900/60 border border-amber-500/20 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
            <Info size={14} />
            <span>ENGINEERING ADVISORY</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {materialGrade === 'titanium'
              ? 'Titanium & Carbon Monocell delivers maximum torsional stiffness (+24 kNm/°) with 40% weight reduction for supreme cornering agility.'
              : materialGrade === 'billet'
              ? 'CNC Billet Alloy provides enhanced fatigue strength and tight kinematic tolerances for high-frequency track loads.'
              : materialGrade === 'forged'
              ? 'Die-Cast Aluminum delivers optimal 15% mass savings and balanced stiffness for high-performance executive vehicles.'
              : 'Stamped Steel is the robust, ductile baseline for mass manufacturing and economical production.'}
          </p>
        </div>

        {/* ── 4. DEDICATED ASSEMBLY INSTALLATION ACTION BUTTONS ── */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {installedStages.includes(activeStage) ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-xs shadow-sm">
                <CheckCircle2 size={16} />
                <span>INSTALLED ON CHASSIS</span>
              </div>
              {onRemoveStage && (
                <button
                  onClick={() => onRemoveStage(activeStage)}
                  title="Uninstall stage from chassis"
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-base-950 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-all cursor-pointer"
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onInstallStage && onInstallStage(activeStage)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-400 hover:via-amber-500 hover:to-indigo-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] cursor-pointer"
            >
              <Zap size={16} className="fill-current" />
              <span>INSTALL SUBSYSTEM TO VEHICLE</span>
            </button>
          )}

          {onNextStage && (
            <button
              onClick={onNextStage}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-slate-100 dark:bg-base-950 hover:bg-slate-200 dark:hover:bg-base-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-400 text-xs font-bold transition-all cursor-pointer"
            >
              <span>PROCEED TO NEXT STAGE</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
