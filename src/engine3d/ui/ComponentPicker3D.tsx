// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — 3D COMPONENT PICKER PANEL
// ============================================================================
// Collapsible side drawer cataloging all engine components across 8 categories,
// displaying live installation status, variant indicators, dependency locks,
// and one-click auto-assembly sequence triggers.
// ============================================================================

import React, { useState } from 'react';
import type { ComponentCategory3D, Engine3DComponentType } from '../types';
import { useEngine3DStore } from '../store/useEngine3DStore';
import { getAllV12Manifests } from '../manifests/v12Manifest';
import { globalAssemblyEngine } from '../core/assemblyEngine';

const CATEGORIES: { id: ComponentCategory3D | 'all'; label: string }[] = [
  { id: 'all', label: 'All Parts' },
  { id: 'core', label: 'Core' },
  { id: 'bottom-end', label: 'Bottom End' },
  { id: 'top-end', label: 'Top End' },
  { id: 'induction', label: 'Induction' },
  { id: 'exhaust', label: 'Exhaust' },
  { id: 'cooling', label: 'Cooling' },
  { id: 'drivetrain', label: 'Drivetrain' },
  { id: 'covers', label: 'Covers' },
];

export const ComponentPicker3D: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const installedTypes = useEngine3DStore((s) => s.installedTypes);
  const activeCategory = useEngine3DStore((s) => s.activeCategory);
  const setActiveCategory = useEngine3DStore((s) => s.setActiveCategory);
  const addComponent = useEngine3DStore((s) => s.addComponent);
  const progress = useEngine3DStore((s) => s.progress);
  const autoAssembleAll = useEngine3DStore((s) => s.autoAssembleAll);
  const resetAssembly = useEngine3DStore((s) => s.resetAssembly);
  const isAutoAssembling = useEngine3DStore((s) => s.isAutoAssembling);

  const allManifests = getAllV12Manifests();

  const filteredManifests = allManifests.filter((m) => {
    const matchesCat = activeCategory === 'all' || m.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div
      className={`absolute top-4 left-4 z-20 transition-all duration-300 flex ${
        isOpen ? 'w-88 max-w-[calc(100vw-2rem)]' : 'w-auto'
      }`}
    >
      {/* Main Drawer */}
      {isOpen ? (
        <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 rounded-xl shadow-2xl p-4 text-slate-100 flex flex-col max-h-[calc(100vh-6rem)]">
          {/* Header & Collapse Button */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>⚙ Modular Engine Builder</span>
              </h2>
              <div className="text-xs text-slate-400 mt-0.5">
                {progress.installedCount} of {progress.totalCount} Components Installed ({progress.percentage}%)
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              ◀
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-3">
            <div
              className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-2.5 scrollbar-none text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search parts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 mb-2.5"
          />

          {/* Component List */}
          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {filteredManifests.map((manifest) => {
              const isInstalled = installedTypes.includes(manifest.type);
              const check = globalAssemblyEngine.canInstall(manifest.type);
              const isAvailable = check.allowed;

              return (
                <div
                  key={manifest.type}
                  className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                    isInstalled
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                      : isAvailable
                      ? 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600'
                      : 'bg-slate-950/40 border-slate-800/50 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="truncate mr-2">
                    <div className="text-xs font-semibold truncate text-slate-200">
                      {manifest.displayName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {manifest.massKg} kg | ${manifest.costUsd.toLocaleString()}
                      {manifest.instanceCount > 1 && ` (×${manifest.instanceCount})`}
                    </div>
                  </div>

                  <div>
                    {isInstalled ? (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                        ✓ Added
                      </span>
                    ) : isAvailable ? (
                      <button
                        onClick={() => addComponent(manifest.type)}
                        className="text-[11px] font-semibold bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1 rounded shadow transition-colors"
                      >
                        + Install
                      </button>
                    ) : (
                      <span
                        className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-help"
                        title={check.reason}
                      >
                        🔒 Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={autoAssembleAll}
              disabled={isAutoAssembling || progress.percentage >= 100}
              className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white disabled:opacity-50 transition-all shadow"
            >
              {isAutoAssembling ? 'Assembling...' : 'Auto-Assemble All'}
            </button>
            <button
              onClick={resetAssembly}
              disabled={progress.installedCount === 0}
              className="py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      ) : (
        /* Collapsed Trigger Button */
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 p-2.5 rounded-xl shadow-2xl text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-xs font-bold"
        >
          <span>▶ Parts Catalog</span>
          <span className="bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800/60 font-mono">
            {progress.installedCount}/{progress.totalCount}
          </span>
        </button>
      )}
    </div>
  );
};
