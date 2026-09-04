/**
 * ============================================================================
 * VEHICLE DIMENSION STUDIO (PHASE 8 PARAMETRIC DIMENSIONAL ENVELOPE)
 * ============================================================================
 * Real-time parametric dimension configurator with category min/max bounds:
 * - Wheelbase (mm)
 * - Front & Rear Track Width (mm)
 * - Ground Clearance & Ride Height (mm)
 * - Front & Rear Overhangs (mm)
 * - Overall Length, Width, Height (mm)
 * - Engine Bay & Luggage Volumes (L)
 * Updates live 3D chassis, wheel positioning, and body proportions.
 */

import React from "react";
import {
  Ruler,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sliders,
  Scale,
  Sparkles,
  Info,
} from "lucide-react";
import {
  VehicleCategoryId,
  getVehicleCategory,
} from "../../../sim/modularVehicle/vehicleTypeRegistry";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export interface VehicleDimensions {
  wheelbaseMm: number;
  frontTrackMm: number;
  rearTrackMm: number;
  rideHeightMm: number;
  overallLengthMm: number;
  overallWidthMm: number;
  overallHeightMm: number;
  frontOverhangMm: number;
  rearOverhangMm: number;
  cabinPositionPct: number;
  engineBayVolumeL?: number;
  luggageVolumeL?: number;
}

interface VehicleDimensionStudioProps {
  categoryId: VehicleCategoryId;
  dimensions: VehicleDimensions;
  onChangeDimensions: (patch: Partial<VehicleDimensions>) => void;
  onResetToCategoryDefault: () => void;
}

export const VehicleDimensionStudio: React.FC<VehicleDimensionStudioProps> = ({
  categoryId,
  dimensions,
  onChangeDimensions,
  onResetToCategoryDefault,
}) => {
  const cat = getVehicleCategory(categoryId);
  const bounds = cat.dimensions;

  const handleSliderChange = (key: keyof VehicleDimensions, value: number) => {
    onChangeDimensions({ [key]: value });
  };

  return (
    <div className="panel p-5 sm:p-7 rounded-3xl space-y-6 shadow-2xl border border-amber-500/25 bg-slate-950/90 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Ruler size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black font-mono tracking-tight text-white uppercase">
                PARAMETRIC DIMENSION STUDIO
              </h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                {cat.name} ENVELOPE
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Modifying dimensions live-updates 3D chassis length, axle positions, and cabin proportions.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playHMIClickSound();
            onResetToCategoryDefault();
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>RESET TO CATEGORY DEFAULT</span>
        </button>
      </div>

      {/* Main Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* 1. Wheelbase Slider */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase">Wheelbase</span>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              {dimensions.wheelbaseMm} mm
            </span>
          </div>
          <input
            type="range"
            min={bounds.wheelbase.min}
            max={bounds.wheelbase.max}
            step={10}
            value={dimensions.wheelbaseMm}
            onChange={(e) => handleSliderChange("wheelbaseMm", Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Min: {bounds.wheelbase.min} mm</span>
            <span>Target: {bounds.wheelbase.default} mm</span>
            <span>Max: {bounds.wheelbase.max} mm</span>
          </div>
        </div>

        {/* 2. Front Track Slider */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase">Front Track Width</span>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              {dimensions.frontTrackMm} mm
            </span>
          </div>
          <input
            type="range"
            min={bounds.frontTrack.min}
            max={bounds.frontTrack.max}
            step={5}
            value={dimensions.frontTrackMm}
            onChange={(e) => handleSliderChange("frontTrackMm", Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Min: {bounds.frontTrack.min} mm</span>
            <span>Default: {bounds.frontTrack.default} mm</span>
            <span>Max: {bounds.frontTrack.max} mm</span>
          </div>
        </div>

        {/* 3. Rear Track Slider */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase">Rear Track Width</span>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              {dimensions.rearTrackMm} mm
            </span>
          </div>
          <input
            type="range"
            min={bounds.rearTrack.min}
            max={bounds.rearTrack.max}
            step={5}
            value={dimensions.rearTrackMm}
            onChange={(e) => handleSliderChange("rearTrackMm", Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Min: {bounds.rearTrack.min} mm</span>
            <span>Default: {bounds.rearTrack.default} mm</span>
            <span>Max: {bounds.rearTrack.max} mm</span>
          </div>
        </div>

        {/* 4. Ride Height & Ground Clearance */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase">Ride Height</span>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              {dimensions.rideHeightMm} mm
            </span>
          </div>
          <input
            type="range"
            min={bounds.rideHeight.min}
            max={bounds.rideHeight.max}
            step={5}
            value={dimensions.rideHeightMm}
            onChange={(e) => handleSliderChange("rideHeightMm", Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Low: {bounds.rideHeight.min} mm</span>
            <span>Nominal: {bounds.rideHeight.default} mm</span>
            <span>High: {bounds.rideHeight.max} mm</span>
          </div>
        </div>

        {/* 5. Front Overhang */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase">Front Overhang</span>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              {dimensions.frontOverhangMm} mm
            </span>
          </div>
          <input
            type="range"
            min={bounds.frontOverhang.min}
            max={bounds.frontOverhang.max}
            step={10}
            value={dimensions.frontOverhangMm}
            onChange={(e) => handleSliderChange("frontOverhangMm", Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Min: {bounds.frontOverhang.min} mm</span>
            <span>Max: {bounds.frontOverhang.max} mm</span>
          </div>
        </div>

        {/* 6. Rear Overhang */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase">Rear Overhang</span>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
              {dimensions.rearOverhangMm} mm
            </span>
          </div>
          <input
            type="range"
            min={bounds.rearOverhang.min}
            max={bounds.rearOverhang.max}
            step={10}
            value={dimensions.rearOverhangMm}
            onChange={(e) => handleSliderChange("rearOverhangMm", Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Min: {bounds.rearOverhang.min} mm</span>
            <span>Max: {bounds.rearOverhang.max} mm</span>
          </div>
        </div>
      </div>

      {/* Calculated Dimensional Summary Callouts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 block uppercase">Overall Length</span>
          <span className="text-sm font-bold font-mono text-white">
            {dimensions.wheelbaseMm + dimensions.frontOverhangMm + dimensions.rearOverhangMm} mm
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 block uppercase">Overall Width</span>
          <span className="text-sm font-bold font-mono text-white">
            {Math.max(dimensions.frontTrackMm, dimensions.rearTrackMm) + 260} mm
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 block uppercase">Overall Height</span>
          <span className="text-sm font-bold font-mono text-white">
            {dimensions.overallHeightMm} mm
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 block uppercase">Calculated Cargo Volume</span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            {cat.luggageVolumeL.default} L
          </span>
        </div>
      </div>
    </div>
  );
};
