// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — 10 BODY-TYPE CAROUSEL UI
// ============================================================================
// Displays all 10 automotive body types with category badges, dimensional
// envelopes, and smooth horizontal scrolling selection.
// ============================================================================

import React, { useRef } from 'react';
import {
  Car,
  Zap,
  Layers,
  Shield,
  Sun,
  Flame,
  Trophy,
  Sparkles,
  Truck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { BODY_TYPE_REGISTRY, ALL_BODY_TYPES } from '../../exterior3d/manifests/bodyTypeManifest';
import { VehicleBodyType } from '../../exterior3d/types/vehicleConstructionTypes';

interface BodyTypeCarouselProps {
  activeBodyType: VehicleBodyType;
  onSelectBodyType: (bodyType: VehicleBodyType) => void;
}

const BODY_ICONS: Record<VehicleBodyType, React.ReactNode> = {
  sedan: <Car size={18} />,
  coupe: <Zap size={18} />,
  hatchback: <Layers size={18} />,
  suv: <Shield size={18} />,
  wagon: <Car size={18} />,
  convertible: <Sun size={18} />,
  sports_car: <Flame size={18} />,
  supercar: <Trophy size={18} />,
  hypercar: <Sparkles size={18} />,
  pickup: <Truck size={18} />,
};

export const BodyTypeCarousel: React.FC<BodyTypeCarouselProps> = ({
  activeBodyType,
  onSelectBodyType,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white/80 dark:bg-base-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 backdrop-blur-xl shadow-xl space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Car size={16} />
          </span>
          <strong className="text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider">
            STEP 1: SELECT VEHICLE BODY ARCHITECTURE
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-base-950 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
            10 Body Categories
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          50 Dedicated Chassis Platforms
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="relative flex items-center">
        <button
          onClick={() => scroll('left')}
          className="p-2 rounded-2xl bg-slate-100 dark:bg-base-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:border-amber-500/40 transition-all mr-2 shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {ALL_BODY_TYPES.map((bt) => {
            const meta = BODY_TYPE_REGISTRY[bt];
            const isSelected = activeBodyType === bt;

            return (
              <div
                key={bt}
                onClick={() => onSelectBodyType(bt)}
                className={`min-w-[210px] p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 space-y-2 select-none ${
                  isSelected
                    ? 'bg-amber-500/10 dark:bg-slate-900/60 border-amber-500 dark:border-amber-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-102'
                    : 'bg-slate-50 dark:bg-base-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={isSelected ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500'}>
                      {BODY_ICONS[bt]}
                    </span>
                    <strong className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {meta.name}
                    </strong>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-base-900 text-slate-500'}`}>
                    {meta.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <div>
                    <span>WB: </span>
                    <strong className={isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
                      {meta.typicalWheelbaseMm.default}mm
                    </strong>
                  </div>
                  <div>
                    <span>Cd: </span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {meta.baseDragCoefficientCd}
                    </strong>
                  </div>
                  <div>
                    <span>Chassis: </span>
                    <strong className="text-amber-600 dark:text-amber-400">5 Choices</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scroll('right')}
          className="p-2 rounded-2xl bg-slate-100 dark:bg-base-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:border-amber-500/40 transition-all ml-2 shadow-sm"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
