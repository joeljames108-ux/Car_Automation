// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — MODULAR INTERIOR WORKSHOP UI
// ============================================================================
// Interactive cockpit customizer allowing independent selection of:
// - Modular Dashboard (filtered by active chassis compatibility)
// - Instrument Cluster & Infotainment Screen
// - Steering Wheel & Shifter Console
// - Front Sport/Comfort/Race Seating
// - Ambient Lighting & Metallurgy/Trim Grades
// ============================================================================

import React, { useState } from 'react';
import {
  Armchair,
  Layers,
  Sparkles,
  Zap,
  Settings,
  Shield,
  Palette,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  DASHBOARD_CATALOG,
  INSTRUMENT_CLUSTER_CATALOG,
  STEERING_WHEEL_CATALOG,
  SEATING_CATALOG,
  CENTER_CONSOLE_CATALOG,
} from '../../exterior3d/manifests/modularInteriorManifest';
import {
  ModularInteriorConfiguration,
  InteriorTrimGrade,
} from '../../exterior3d/types/modularInteriorTypes';

interface ModularInteriorWorkshopProps {
  activeChassisId: string;
  config: Partial<ModularInteriorConfiguration>;
  onUpdateInterior: (partial: Partial<ModularInteriorConfiguration>) => void;
}

export const ModularInteriorWorkshop: React.FC<ModularInteriorWorkshopProps> = ({
  activeChassisId,
  config,
  onUpdateInterior,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboards' | 'displays_steering' | 'seating_console' | 'trim_ambient'>('dashboards');

  const currentDashId = config.dashboardId || 'DASHBOARD_01_EXECUTIVE';
  const currentClusterId = config.instrumentClusterId || 'CLUSTER_VIRTUAL_COCKPIT_12_3';
  const currentWheelId = config.steeringWheelId || 'STEERING_FLAT_BOTTOM_SPORT';
  const currentSeatId = config.frontSeatsId || 'SEATS_SPORT_BOLSTERED';
  const currentConsoleId = config.centerConsoleId || 'CONSOLE_SPORT_GATED';
  const currentTrim = config.primaryTrimGrade || 'nappa_leather';
  const ambientColor = config.ambientLightingColorHex || '#06b6d4';

  const trimGrades: { id: InteriorTrimGrade; name: string; badge: string }[] = [
    { id: 'nappa_leather', name: 'Semi-Aniline Nappa Leather', badge: 'LUXURY' },
    { id: 'alcantara_race', name: 'Alcantara Suede Race Weave', badge: 'RACE SPEC' },
    { id: 'open_pore_wood', name: 'Natural Open-Pore Walnut Wood', badge: 'HERITAGE' },
    { id: 'forged_carbon', name: 'Pre-Preg Forged Carbon Inlays', badge: 'MOTORSPORT' },
    { id: 'brushed_aluminum', name: 'Billet Brushed Aluminum Trim', badge: 'ENGINEERING' },
  ];

  const ambientColors = [
    { name: 'Cyan Neon', hex: '#06b6d4' },
    { name: 'Hyper Purple', hex: '#a855f7' },
    { name: 'Emerald Green', hex: '#10b981' },
    { name: 'Amber Gold', hex: '#f59e0b' },
    { name: 'Crimson Red', hex: '#ef4444' },
    { name: 'Ice White', hex: '#f8fafc' },
  ];

  return (
    <div className="bg-white/80 dark:bg-base-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-4 font-mono">
      {/* Header & Subsystem Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Armchair size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase">
              MODULAR COCKPIT & INTERIOR STUDIO
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Independently attachable dashboards, displays, wheels, seats & ambient lighting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-base-950 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('dashboards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboards' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboards
          </button>
          <button
            onClick={() => setActiveTab('displays_steering')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'displays_steering' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Displays & Wheel
          </button>
          <button
            onClick={() => setActiveTab('seating_console')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'seating_console' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Seating & Console
          </button>
          <button
            onClick={() => setActiveTab('trim_ambient')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'trim_ambient' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trim & Lighting
          </button>
        </div>
      </div>

      {/* ── TAB 1: MODULAR DASHBOARDS ── */}
      {activeTab === 'dashboards' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DASHBOARD_CATALOG.map((dash) => {
            const isSelected = currentDashId === dash.id;
            const isCompatible = dash.compatibleChassisIds.includes(activeChassisId) || dash.compatibleChassisIds.length === 0;

            return (
              <div
                key={dash.id}
                onClick={() => isCompatible && onUpdateInterior({ dashboardId: dash.id })}
                className={`p-4 rounded-2xl border transition-all duration-200 space-y-2 select-none ${
                  !isCompatible
                    ? 'opacity-40 bg-slate-100/40 dark:bg-base-950/40 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                    : isSelected
                    ? 'bg-cyan-500/10 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer scale-102'
                    : 'bg-slate-50 dark:bg-base-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-400 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-200 dark:bg-base-900 text-slate-500'}`}>
                    {dash.style.replace('_', ' ').toUpperCase()}
                  </span>
                  {!isCompatible ? (
                    <span className="flex items-center gap-1 text-[9px] text-rose-500 font-bold">
                      <Lock size={12} /> INCOMPATIBLE
                    </span>
                  ) : isSelected ? (
                    <CheckCircle2 size={15} className="text-cyan-400" />
                  ) : null}
                </div>

                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {dash.name}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {dash.description}
                </p>

                <div className="flex justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Mass: <strong className="text-cyan-600 dark:text-cyan-400">{dash.massKg} kg</strong></span>
                  <span>Cost: <strong className="text-amber-600 dark:text-amber-400">${dash.costUSD}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 2: DISPLAYS & STEERING WHEEL ── */}
      {activeTab === 'displays_steering' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Instrument Clusters */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Instrument Cluster</label>
            <div className="space-y-2">
              {INSTRUMENT_CLUSTER_CATALOG.map((cluster) => {
                const isSelected = currentClusterId === cluster.id;
                return (
                  <div
                    key={cluster.id}
                    onClick={() => onUpdateInterior({ instrumentClusterId: cluster.id })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-base-950/60 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>{cluster.name}</span>
                      <span className="text-amber-500">${cluster.costUSD}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{cluster.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Steering Wheels */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Steering Wheel</label>
            <div className="space-y-2">
              {STEERING_WHEEL_CATALOG.map((wheel) => {
                const isSelected = currentWheelId === wheel.id;
                return (
                  <div
                    key={wheel.id}
                    onClick={() => onUpdateInterior({ steeringWheelId: wheel.id })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-base-950/60 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>{wheel.name}</span>
                      <span className="text-amber-500">${wheel.costUSD}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{wheel.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SEATING & CONSOLES ── */}
      {activeTab === 'seating_console' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Front Seating</label>
            <div className="space-y-2">
              {SEATING_CATALOG.map((seat) => {
                const isSelected = currentSeatId === seat.id;
                return (
                  <div
                    key={seat.id}
                    onClick={() => onUpdateInterior({ frontSeatsId: seat.id })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-base-950/60 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>{seat.name}</span>
                      <span className="text-amber-500">${seat.costUSD}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{seat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Consoles */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Center Console & Shifter</label>
            <div className="space-y-2">
              {CENTER_CONSOLE_CATALOG.map((con) => {
                const isSelected = currentConsoleId === con.id;
                return (
                  <div
                    key={con.id}
                    onClick={() => onUpdateInterior({ centerConsoleId: con.id })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-base-950/60 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>{con.name}</span>
                      <span className="text-amber-500">${con.costUSD}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{con.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: TRIM MATERIALS & AMBIENT LIGHTING ── */}
      {activeTab === 'trim_ambient' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trim Materials */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Primary Interior Trim</label>
            <div className="space-y-2">
              {trimGrades.map((tg) => {
                const isSelected = currentTrim === tg.id;
                return (
                  <div
                    key={tg.id}
                    onClick={() => onUpdateInterior({ primaryTrimGrade: tg.id })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/10 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-base-950/60 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{tg.name}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {tg.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ambient Lighting Spectrum */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Ambient LED Lightstrip Hue</label>
            <div className="grid grid-cols-3 gap-2">
              {ambientColors.map((col) => {
                const isSelected = ambientColor === col.hex;
                return (
                  <button
                    key={col.hex}
                    onClick={() => onUpdateInterior({ ambientLightingColorHex: col.hex })}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected ? 'border-cyan-400 bg-cyan-500/10 scale-105 ring-1 ring-cyan-400' : 'border-slate-800 bg-base-950'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full shadow-lg" style={{ backgroundColor: col.hex }} />
                    <span className="text-[10px] text-slate-300 font-bold">{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
