// ===================================================================
// EXTERIOR ASSEMBLY PROGRESS & STATUS PANEL
// ===================================================================

import React from "react";
import { CheckCircle2, Box, Layers, ArrowRightLeft, Sparkles, Gauge, Car } from "lucide-react";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";
import { useVehicleArchitectureStore } from "../../../state/useVehicleArchitectureStore";
import { VehicleCategory } from "../../../sim/vehicleArchitecture/vehicleArchitectureTypes";

const PLATFORM_OPTIONS: { id: VehicleCategory; label: string; badge: string; desc: string }[] = [
  { id: "sedan", label: "Sedan", badge: "SEDAN", desc: "Monocoque Executive Chassis" },
  { id: "hatchback", label: "Hatchback", badge: "HATCHBACK", desc: "Agile Spaceframe Chassis" },
  { id: "crossover", label: "Cross", badge: "CROSS", desc: "All-Road Multi-Link Chassis" },
  { id: "suv", label: "SUV", badge: "SUV", desc: "Heavy-Duty Reinforced Chassis" },
];

export const ExteriorProgressPanel: React.FC = () => {
  const buildProgress = useExteriorAssemblyStore((s) => s.getBuildProgress());
  const totalWeight = useExteriorAssemblyStore((s) => s.getTotalExteriorWeight());
  const totalCost = useExteriorAssemblyStore((s) => s.getTotalExteriorCost());
  const totalRigidity = useExteriorAssemblyStore((s) => s.getTotalTorsionalRigidityKNm());
  const paintConfig = useExteriorAssemblyStore((s) => s.paintConfig);
  const extCategory = useExteriorAssemblyStore((s) => s.vehicleCategory);
  const setExtCategory = useExteriorAssemblyStore((s) => s.setVehicleCategory);

  const archCategory = useVehicleArchitectureStore((s) => s.selectedCategory);
  const selectArchCategory = useVehicleArchitectureStore((s) => s.selectCategory);
  const architecture = useVehicleArchitectureStore((s) => s.architecture);

  const activeCategory = archCategory || extCategory || "sedan";

  const handlePlatformChange = (cat: VehicleCategory) => {
    selectArchCategory(cat);
    setExtCategory(cat);
  };

  const totalDft =
    paintConfig.eCoatPrimerMicrons +
    paintConfig.primerSurfacerMicrons +
    paintConfig.baseCoatMicrons +
    paintConfig.clearCoatMicrons;

  const currentPlatformInfo = PLATFORM_OPTIONS.find((p) => p.id === activeCategory) || PLATFORM_OPTIONS[0];

  return (
    <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-4 backdrop-blur-xl shadow-2xl space-y-3 font-mono text-xs">
      {/* ── TOP BAR: ACTIVE PLATFORM & SPECIFIC GLB STATUS ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Car size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                DESIGNING STUDIO PLATFORM
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold tracking-wider animate-pulse">
                {currentPlatformInfo.badge}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300 font-sans">
              <span>{architecture.name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400/90 font-mono text-[10px] flex items-center gap-1">
                <Box size={11} />
                /models/vehicles/{activeCategory}/chassis.glb + body-framework.glb
              </span>
            </div>
          </div>
        </div>

        {/* Quick Platform Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-white/5">
          {PLATFORM_OPTIONS.map((plat) => {
            const isSelected = activeCategory === plat.id;
            return (
              <button
                key={plat.id}
                onClick={() => handlePlatformChange(plat.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all duration-200 flex items-center gap-1 ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 font-black scale-105"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <span>{plat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── PROGRESS & DIMENSIONS ROW ── */}
      <div className="flex items-center justify-between pt-1">
        <span className="font-bold text-slate-200 uppercase flex items-center gap-1.5">
          <CheckCircle2 size={15} className="text-amber-400" />
          EXTERIOR BODY-IN-WHITE PROGRESS
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400">
            WB: <span className="text-slate-200">{architecture.wheelbaseMm}mm</span> | Track:{" "}
            <span className="text-slate-200">{architecture.trackFrontMm}mm</span> | Clearance:{" "}
            <span className="text-slate-200">{architecture.rideHeightMm}mm</span>
          </span>
          <strong className="text-amber-300 text-sm">{buildProgress}%</strong>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-500"
          style={{ width: `${buildProgress}%` }}
        />
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5 text-center">
        <div className="p-2 rounded-xl bg-slate-950">
          <span className="text-[10px] text-slate-500 block">WEIGHT</span>
          <strong className="text-slate-200">{Math.round(totalWeight)}kg</strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950">
          <span className="text-[10px] text-slate-500 block">RIGIDITY</span>
          <strong className="text-emerald-400">{totalRigidity} kNm/deg</strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950">
          <span className="text-[10px] text-slate-500 block">PAINT DFT</span>
          <strong className="text-amber-400">{totalDft} µm</strong>
        </div>
        <div className="p-2 rounded-xl bg-slate-950">
          <span className="text-[10px] text-slate-500 block">BOM COST</span>
          <strong className="text-amber-400">${Math.round(totalCost).toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
};
