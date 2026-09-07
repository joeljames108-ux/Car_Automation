// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR & ELECTRONICS STUDIO — MAIN DESIGNER COMPONENT
// ============================================================================
// Features:
// - Photorealistic 3D Three.js First-Person Cockpit Viewport with 6 Camera Presets
// - 5-Tab Glassmorphism Interior Studio Workbench (Materials, Displays, Seating, Audio, NVH)
// - Integrated Vehicle Electronics, Avionics, CAN-FD, ADAS & Infotainment Suite
// - Complete Two-Way State Synchronization with DesignContext
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Sparkles, Sliders, Cpu } from 'lucide-react';
import { useDesign } from '../state/DesignContext';
import { InfotainmentDesigner } from './InfotainmentDesigner';
import { InteriorDashboardConfiguratorStudio } from './interior/InteriorDashboardConfiguratorStudio';
import { playHMITabSound } from '../utils/hmiSoundSynth';

export type InteriorStudioViewMode = 'electronics' | 'configurator';

interface InteriorsDesignerProps {
  initialSubTab?: InteriorStudioViewMode;
}

export function InteriorsDesigner({ initialSubTab = 'configurator' }: InteriorsDesignerProps) {
  const { design } = useDesign();
  const [viewMode, setViewMode] = useState<InteriorStudioViewMode>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setViewMode(initialSubTab);
    }
  }, [initialSubTab]);

  const handleTabSelect = (mode: InteriorStudioViewMode) => {
    playHMITabSound();
    setViewMode(mode);
  };

  return (
    <div className="space-y-4">
      {/* ── TOP SWITCHER: UNIFIED INTERIOR & ELECTRONICS STUDIO TABS ── */}
      <div
        className="flex items-center justify-between p-2 rounded-2xl backdrop-blur-xl shadow-xl border"
        style={{
          backgroundColor: 'rgba(255,248,235,0.88)',
          borderColor: 'rgba(217,166,78,0.4)',
        }}
      >
        <div className="flex items-center gap-2 pl-2">
          <Sparkles style={{ color: '#92400E' }} size={18} />
          <span className="text-xs font-black tracking-wider uppercase" style={{ color: '#92400E' }}>
            INTERIOR & ELECTRONICS WORKBENCH
          </span>
        </div>

        {/* Studio View Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
          <button
            onClick={() => handleTabSelect('configurator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'configurator'
                ? 'shadow-md scale-[1.02] bg-blue-600 text-white ring-2 ring-blue-400'
                : 'hover:opacity-80 bg-blue-500/10 text-blue-800'
            }`}
          >
            <Sliders size={13} />
            <span>🎚️ 3D COCKPIT CONFIGURATOR</span>
          </button>

          <button
            onClick={() => handleTabSelect('electronics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'electronics'
                ? 'shadow-md scale-[1.02]'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: viewMode === 'electronics' ? '#B45309' : 'transparent',
              color: viewMode === 'electronics' ? '#ffffff' : '#78350F'
            }}
          >
            <Cpu size={13} />
            <span>ELECTRONICS & AVIONICS</span>
          </button>
        </div>
      </div>

      {/* ── CONDITIONAL VIEW MODE RENDERING ── */}
      {viewMode === 'configurator' ? (
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-amber-800/30">
          <InteriorDashboardConfiguratorStudio />
        </div>
      ) : (
        /* MODE B: Vehicle Electronics, Infotainment, ADAS, CAN-FD & Avionics */
        <InfotainmentDesigner />
      )}
    </div>
  );
}
