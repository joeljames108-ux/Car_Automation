import React, { useState } from "react";
import {
  Layers,
  Compass,
  Camera,
  Wrench,
  Sliders,
  Sun,
  CloudRain,
  Wind,
  Maximize2,
  HelpCircle,
  Keyboard,
  X,
  Eye,
  CheckCircle2,
  Unlock,
  Sparkles,
  History
} from "lucide-react";
import { useCampusStore, CampusViewMode } from "../../state/campusStore";
import { CampusUnitId } from "../../sim/campus/campusTypes";

interface CampusViewportControlsProps {
  onTogglePhotoMode?: (active: boolean) => void;
  isPhotoModeActive?: boolean;
  onOpenTutorial?: () => void;
  onOpenComparison?: () => void;
  onOpenAnalytics?: () => void;
  onOpenNotifications?: () => void;
  onToggleTimeline?: () => void;
  isTimelineOpen?: boolean;
}

export const CampusViewportControls: React.FC<CampusViewportControlsProps> = ({
  onTogglePhotoMode,
  isPhotoModeActive = false,
  onOpenTutorial,
  onOpenComparison,
  onOpenAnalytics,
  onOpenNotifications,
  onToggleTimeline,
  isTimelineOpen = false,
}) => {
  const {
    viewMode,
    setViewMode,
    selectedUnitId,
    units,
    setDebugUnitLevel,
    unlockAllPlots,
    setCameraFocusTarget,
  } = useCampusStore();

  const [showSandbox, setShowSandbox] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const selectedUnit = selectedUnitId ? units[selectedUnitId] : null;

  const viewModes: { id: CampusViewMode; label: string; desc: string }[] = [
    { id: "3d_isometric", label: "3D Isometric", desc: "45° Resin diorama view" },
    { id: "top_down_schematic", label: "Top-Down", desc: "CAD blueprint projection" },
    { id: "zoning_overlay", label: "Zoning", desc: "Zones A–D boundaries" },
    { id: "heat_map", label: "Heat Map", desc: "Workforce density overlay" },
  ];

  const handleResetCamera = () => {
    setCameraFocusTarget([0, 0, 0]);
  };

  return (
    <>
      {/* Floating Viewport Dock (Top-Left inside 3D canvas) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* View Mode Selector Chip Group */}
        <div className="bg-[#f8f6f0]/95 border border-[#dad4c5] backdrop-blur-md p-1.5 rounded-2xl shadow-md flex items-center gap-1">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              title={mode.desc}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                viewMode === mode.id
                  ? "bg-cyan-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Action Toolstrip: Photo Mode, Reset Camera, Sandbox, Shortcuts */}
        <div className="bg-[#f8f6f0]/95 border border-[#dad4c5] backdrop-blur-md p-1.5 rounded-2xl shadow-md flex items-center gap-1 self-start">
          <button
            onClick={handleResetCamera}
            title="Reset Camera (Space)"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
          >
            <Compass size={16} />
          </button>

          <button
            onClick={() => onTogglePhotoMode && onTogglePhotoMode(!isPhotoModeActive)}
            title="Toggle Clean Photo Mode (P)"
            className={`p-2 rounded-xl transition-colors ${
              isPhotoModeActive
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white"
            }`}
          >
            <Camera size={16} />
          </button>

          <button
            onClick={() => setShowSandbox(!showSandbox)}
            title="Campus Sandbox & Debug Controls (Phase 202)"
            className={`p-2 rounded-xl transition-colors ${
              showSandbox
                ? "bg-indigo-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white"
            }`}
          >
            <Sliders size={16} />
          </button>

          {onToggleTimeline && (
            <button
              onClick={onToggleTimeline}
              title="Campus Historical Timeline Viewer (Phase 218)"
              className={`p-2 rounded-xl transition-colors ${
                isTimelineOpen
                  ? "bg-cyan-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <History size={16} />
            </button>
          )}

          <button
            onClick={() => setShowShortcuts(true)}
            title="Keyboard Shortcuts Cheat Sheet"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
          >
            <Keyboard size={16} />
          </button>

          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              title="Campus Interactive Guide"
              className="p-2 rounded-xl text-cyan-700 hover:text-cyan-900 hover:bg-white transition-colors"
            >
              <HelpCircle size={16} />
            </button>
          )}
        </div>

        {/* Phase 202: Campus Sandbox / Level Debugger Drawer */}
        {showSandbox && (
          <div className="w-72 bg-[#f8f6f0]/95 border border-[#dad4c5] backdrop-blur-md p-4 rounded-2xl shadow-xl flex flex-col gap-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#dad4c5] pb-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold font-mono text-slate-900">
                <Sliders size={14} className="text-indigo-600" />
                <span>SANDBOX / DEBUGGER</span>
              </div>
              <button
                onClick={() => setShowSandbox(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={14} />
              </button>
            </div>

            {selectedUnit ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate max-w-[140px]">
                    {selectedUnit.shortName}
                  </span>
                  <span className="font-mono text-indigo-700 font-extrabold">
                    Level {selectedUnit.level} / 7
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={7}
                    value={selectedUnit.level}
                    onChange={(e) =>
                      setDebugUnitLevel(selectedUnit.id, parseInt(e.target.value, 10))
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>L0 (Plot)</span>
                  <span>L3 (1980s)</span>
                  <span>L7 (2030s)</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Select any building to test progression levels L0–L7.
              </p>
            )}

            <div className="pt-2 border-t border-[#dad4c5] flex flex-col gap-2">
              <button
                onClick={unlockAllPlots}
                className="w-full py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Unlock size={13} />
                <span>Unlock All 14 Plots</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Phase 199: Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setShowShortcuts(false)}
          />
          <div className="relative w-full max-w-md bg-[#f8f6f0] border border-[#dad4c5] rounded-3xl shadow-2xl p-5 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#dad4c5] pb-3 mb-4">
              <div className="flex items-center gap-2 text-sm font-extrabold font-mono text-slate-900">
                <Keyboard size={18} className="text-cyan-700" />
                <span>KEYBOARD SHORTCUTS</span>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {[
                { key: "1 – 9", desc: "Select Campus Units 01 through 09" },
                { key: "0", desc: "Select Unit 10 (Manufacturing Plant)" },
                { key: "Space", desc: "Reset Camera to Campus Center" },
                { key: "Tab", desc: "Toggle Building Tree Sidebar" },
                { key: "Esc", desc: "Deselect Unit / Close Active Drawer" },
                { key: "M", desc: "Open Analytics & Budget Breakdown" },
                { key: "N", desc: "Open Live Notifications & Event Log" },
                { key: "C", desc: "Open Facility Comparison Tool" },
                { key: "P", desc: "Toggle Clean Photo Mode" },
                { key: "?", desc: "Open Campus Interactive Guide" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#dad4c5]"
                >
                  <span className="font-bold text-slate-700">{item.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 font-extrabold text-[11px] shadow-2xs">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#dad4c5] text-center">
              <p className="text-[10px] text-slate-500 font-mono">
                Phase 199 • Rapid Campus Navigation System
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
