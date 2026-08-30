// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — 5 CHASSIS ARCHITECTURE SELECTOR
// ============================================================================
// Renders the 5 unique chassis architectures available for the active body type,
// displaying mass, torsional stiffness, hardpoints, and manufacturing cost.
// ============================================================================

import React from 'react';
import { Shield, Activity, DollarSign, Cpu, CheckCircle2, ChevronRight } from 'lucide-react';
import { Chassis50Definition, VehicleBodyType } from '../../exterior3d/types/vehicleConstructionTypes';
import { getChassisForBodyType } from '../../exterior3d/manifests/chassis50Manifest';

interface ChassisArchitectureSelectorProps {
  activeBodyType: VehicleBodyType;
  selectedChassisId: string;
  onSelectChassis: (chassisId: string) => void;
}

export const ChassisArchitectureSelector: React.FC<ChassisArchitectureSelectorProps> = ({
  activeBodyType,
  selectedChassisId,
  onSelectChassis,
}) => {
  const chassisList: Chassis50Definition[] = getChassisForBodyType(activeBodyType);

  return (
    <div className="bg-white/80 dark:bg-base-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 backdrop-blur-xl shadow-xl space-y-3 font-mono">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Shield size={16} />
          </span>
          <strong className="text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider">
            STEP 2: SELECT 1 OF 5 CHASSIS ARCHITECTURES
          </strong>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 font-semibold">
            {chassisList.length} Engineering Platforms
          </span>
        </div>
      </div>

      {/* Grid of 5 Unique Chassis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {chassisList.map((chassis, idx) => {
          const isSelected = selectedChassisId === chassis.id;

          return (
            <div
              key={chassis.id}
              onClick={() => onSelectChassis(chassis.id)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-2 select-none ${
                isSelected
                  ? 'bg-amber-500/10 dark:bg-slate-900/60 border-amber-500 dark:border-amber-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-102 ring-1 ring-amber-400'
                  : 'bg-slate-50 dark:bg-base-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-base-900 text-slate-500'}`}>
                    PLATFORM #{idx + 1}
                  </span>
                  {isSelected && <CheckCircle2 size={15} className="text-amber-400" />}
                </div>

                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {chassis.name}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {chassis.tagline}
                </p>
              </div>

              {/* Spec Mini Badges */}
              <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mass:</span>
                  <strong className={isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
                    {chassis.baseMassKg} kg
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rigidity:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {chassis.torsionalRigidityKNmPerDeg} kNm/°
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BOM:</span>
                  <strong className="text-amber-600 dark:text-amber-400">
                    ${chassis.manufacturingCostBOM.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
