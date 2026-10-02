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
import { Sparkles, Cpu, LayoutGrid, Gauge, Sofa, Check, ChevronLeft, ArrowRight } from 'lucide-react';
import { useDesign } from '../state/DesignContext';
import { useGuidedEngineeringStore } from '../state/guidedEngineeringStore';
import { InfotainmentDesigner } from './InfotainmentDesigner';
import { InteractiveDashboardStudio } from './interior/InteractiveDashboardStudio';
import { InstrumentClusterDiagnosticStudio } from './interior/InstrumentClusterDiagnosticStudio';
import { playHMITabSound } from '../utils/hmiSoundSynth';

export type InteriorStudioViewMode = 'setup' | 'cluster_diagnostic' | 'electronics';

interface InteriorsDesignerProps {
  initialSubTab?: InteriorStudioViewMode;
  onSelectStage?: (stage: string) => void;
}

export function InteriorsDesigner({ initialSubTab = 'setup', onSelectStage }: InteriorsDesignerProps) {
  const { design } = useDesign();
  const { interiorStatus, markStageComplete, setActiveWorkflowStage } = useGuidedEngineeringStore();
  const [viewMode, setViewMode] = useState<InteriorStudioViewMode>(initialSubTab);

  const handleNextToCreatorMenu = () => {
    markStageComplete("interior");
    if (onSelectStage) {
      onSelectStage("create_vehicle_hub");
    }
  };

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
      {/* Stage 4 Workflow Action Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#0d1424]/90 via-[#10192e]/90 to-[#0d1424]/90 border border-amber-500/30 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
            interiorStatus === "configured"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
          }`}>
            {interiorStatus === "configured" ? <Check size={18} /> : <Sofa size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-100">
                STAGE 4: COCKPIT INTERIOR & AVIONICS
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                interiorStatus === "configured"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : interiorStatus === "invalidated"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
              }`}>
                {interiorStatus === "configured"
                  ? "✓ CONFIGURED"
                  : interiorStatus === "invalidated"
                  ? "⚠ RECALCULATION REQUIRED"
                  : "IN PROGRESS"}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Dashboard material: {design.vehicle.interior.dashboardMaterial} • Seats: {design.vehicle.interior.seatType} • Displays: {design.vehicle.interior.infotainmentSize}"
            </p>
          </div>
        </div>

        {onSelectStage && (
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onSelectStage("create_vehicle_hub")}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-amber-400/50 text-slate-300 hover:text-amber-300 font-mono font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
              title="Return to Creator Menu"
            >
              <ChevronLeft size={14} />
              <span>← CREATOR MENU</span>
            </button>
            <button
              type="button"
              onClick={handleNextToCreatorMenu}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
              title="Complete Interior and return to Creator Menu"
            >
              <Check size={15} strokeWidth={3} />
              <span>NEXT → CREATOR MENU</span>
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
      {/* ── TOP SWITCHER: UNIFIED INTERIOR & ELECTRONICS STUDIO TABS ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-gradient-to-r from-[#0b0f19]/90 via-[#111625]/85 to-[#0b0f19]/90 backdrop-blur-xl shadow-xl border border-amber-500/25">
        <div className="flex items-center gap-2 pl-2">
          <Sparkles size={18} className="text-amber-400" />
          <span className="text-xs font-black tracking-wider uppercase text-amber-300">
            INTERIOR & ELECTRONICS WORKBENCH
          </span>
        </div>

        {/* Studio View Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <button
            onClick={() => handleTabSelect('setup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'setup'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <LayoutGrid size={13} />
            <span>DASHBOARD CONFIGURATION</span>
          </button>

          <button
            onClick={() => handleTabSelect('cluster_diagnostic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'cluster_diagnostic'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Gauge size={13} />
            <span>UNDERSTANDING YOUR DASHBOARD</span>
          </button>

          <button
            onClick={() => handleTabSelect('electronics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'electronics'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Cpu size={13} />
            <span>ELECTRONICS & AVIONICS</span>
          </button>
        </div>
      </div>

      {/* ── CONDITIONAL VIEW MODE RENDERING ── */}
      {viewMode === 'setup' ? (
        <InteractiveDashboardStudio initialWorkspaceMode="hardware" onSelectStage={onSelectStage} />
      ) : viewMode === 'cluster_diagnostic' ? (
        <InstrumentClusterDiagnosticStudio />
      ) : (
        /* MODE C: Vehicle Electronics, Infotainment, ADAS, CAN-FD & Avionics */
        <InteractiveDashboardStudio initialWorkspaceMode="avionics" onSelectStage={onSelectStage} />
      )}
    </div>
  );
}
