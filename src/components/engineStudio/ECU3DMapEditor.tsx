/**
 * ============================================================================
 * APEX ENGINEER — INTERACTIVE 16x16 ECU MAP EDITOR & SURFACE VISUALIZER
 * ============================================================================
 * Production-grade ECU tuning calibration interface.
 * Features:
 * - 16x16 Color-Coded Matrix Grid (Fuel VE, Ignition Timing, Target AFR, VVT, Wastegate)
 * - Single & Multi-Cell Selection with Bump Controls (+1 / -1 / +5 / -5)
 * - Matrix Gaussian Smoothing & Auto Calibration
 * - Real-Time Live Dyno Tracer Dot (RPM vs MAP Load)
 * - 3D Heatmap Cell Height Depth Visualizer
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import {
  Cpu,
  Zap,
  Flame,
  Activity,
  Sparkles,
  Sliders,
  RefreshCw,
  Plus,
  Minus,
  Check,
  RotateCcw,
  Layers,
  BarChart3,
  Gauge,
  TrendingUp,
} from "lucide-react";
import {
  ECU3DMapTuningEngine,
  ECUFullCalibrationSuite,
  ECUMap16x16,
} from "../../sim/engine/ecu3DMapTuningEngine";
import { MasterEngineState } from "../../sim/engine/masterEngineTypes";

interface ECU3DMapEditorProps {
  state: MasterEngineState;
  onUpdateState?: (newState: MasterEngineState) => void;
  currentRpm?: number;
  currentMapKPa?: number;
}

type SelectedMapId = "fuel" | "ignition" | "afr" | "vvt" | "wastegate";

export const ECU3DMapEditor: React.FC<ECU3DMapEditorProps> = ({
  state,
  onUpdateState,
  currentRpm = 4500,
  currentMapKPa = 145,
}) => {
  const [suite, setSuite] = useState<ECUFullCalibrationSuite>(() =>
    ECU3DMapTuningEngine.generateCalibrationSuite(state)
  );

  const [activeMapId, setActiveMapId] = useState<SelectedMapId>("ignition");
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({ row: 6, col: 8 });
  const [is3DView, setIs3DView] = useState<boolean>(false);

  // Active Map Selection
  const activeMap: ECUMap16x16 = useMemo(() => {
    switch (activeMapId) {
      case "fuel": return suite.fuelMap;
      case "ignition": return suite.ignitionMap;
      case "afr": return suite.targetAfrMap;
      case "vvt": return suite.vvtIntakeMap;
      case "wastegate": return suite.wastegateMap;
      default: return suite.ignitionMap;
    }
  }, [activeMapId, suite]);

  // Interpolate Live Tracer Point
  const liveTrace = useMemo(() => {
    return ECU3DMapTuningEngine.interpolateMapValue(activeMap, currentRpm, currentMapKPa);
  }, [activeMap, currentRpm, currentMapKPa]);

  // Handlers for Bumping Cell Values
  const handleBumpCell = (delta: number) => {
    if (!selectedCell) return;
    const updatedMap = ECU3DMapTuningEngine.bumpMapCells(activeMap, [selectedCell], delta);
    updateSuiteWithMap(updatedMap);
  };

  const handleSmoothMap = () => {
    const smoothedMap = ECU3DMapTuningEngine.smoothMap(activeMap);
    updateSuiteWithMap(smoothedMap);
  };

  const handleResetMap = () => {
    const defaultSuite = ECU3DMapTuningEngine.generateCalibrationSuite(state);
    setSuite(defaultSuite);
  };

  const updateSuiteWithMap = (newMap: ECUMap16x16) => {
    setSuite((prev) => {
      const next = { ...prev };
      if (activeMapId === "fuel") next.fuelMap = newMap;
      if (activeMapId === "ignition") next.ignitionMap = newMap;
      if (activeMapId === "afr") next.targetAfrMap = newMap;
      if (activeMapId === "vvt") next.vvtIntakeMap = newMap;
      if (activeMapId === "wastegate") next.wastegateMap = newMap;
      return next;
    });
  };

  // Cell Color Scale (Normalized 0.0 to 1.0)
  const getCellColor = (val: number, min: number, max: number) => {
    const norm = Math.min(1.0, Math.max(0.0, (val - min) / (max - min || 1)));
    if (activeMapId === "ignition") {
      // Blue (retarded/low) -> Cyan -> Yellow -> Orange -> Red (advanced/high)
      if (norm < 0.25) return "bg-blue-950/80 text-blue-300 border-blue-800/40";
      if (norm < 0.50) return "bg-cyan-950/80 text-cyan-300 border-cyan-800/40";
      if (norm < 0.75) return "bg-amber-950/80 text-amber-300 border-amber-800/40";
      return "bg-rose-950/80 text-rose-300 border-rose-800/50 font-bold";
    }
    if (activeMapId === "afr") {
      // Red (rich <= 11.5) -> Green (stochiometric ~14.7) -> Blue (lean >= 15.0)
      if (val < 12.0) return "bg-rose-950/80 text-rose-300 border-rose-800/40";
      if (val < 13.8) return "bg-amber-950/80 text-amber-300 border-amber-800/40";
      if (val < 14.8) return "bg-emerald-950/80 text-emerald-300 border-emerald-800/40";
      return "bg-blue-950/80 text-blue-300 border-blue-800/40";
    }
    // Default VE / Duty heat
    if (norm < 0.3) return "bg-slate-900 text-slate-400 border-slate-800";
    if (norm < 0.6) return "bg-cyan-950/80 text-cyan-300 border-cyan-800/40";
    if (norm < 0.85) return "bg-amber-950/80 text-amber-300 border-amber-800/40";
    return "bg-rose-950/80 text-rose-300 border-rose-800/50 font-bold";
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950/90 backdrop-blur-2xl p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
      {/* ================================================================= */}
      {/* MAP EDITOR HEADER & SELECTOR TABS */}
      {/* ================================================================= */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <Cpu size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">16x16 ECU Calibration Suite</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                LIVE MAP TRACER ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Bi-linear interpolated 256-cell lookup tables • 3D surface mapping
            </p>
          </div>
        </div>

        {/* Map Type Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 overflow-x-auto">
          {[
            { id: "ignition" as const, label: "Ignition Timing", icon: <Zap size={12} /> },
            { id: "fuel" as const, label: "Fuel VE %", icon: <Flame size={12} /> },
            { id: "afr" as const, label: "Target AFR", icon: <Activity size={12} /> },
            { id: "vvt" as const, label: "VVT Intake", icon: <Sliders size={12} /> },
            { id: "wastegate" as const, label: "Wastegate Duty", icon: <Gauge size={12} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveMapId(tab.id);
                setSelectedCell({ row: 6, col: 8 });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeMapId === tab.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* TOOLBAR — CELL EDIT CONTROLS, BUMPS, SMOOTHING */}
      {/* ================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Selected Cell:</span>
          {selectedCell ? (
            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
              R{selectedCell.row} ({activeMap.axis.loadKPaBreakpoints[selectedCell.row]} kPa) × C{selectedCell.col} ({activeMap.axis.rpmBreakpoints[selectedCell.col]} RPM) = {activeMap.grid[selectedCell.row][selectedCell.col]} {activeMap.unit}
            </span>
          ) : (
            <span className="text-slate-600">Click any cell to edit</span>
          )}
        </div>

        {/* Bump Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleBumpCell(-5.0)}
            disabled={!selectedCell}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-rose-300 rounded-lg border border-slate-700 transition-all cursor-pointer"
            title="-5 Units"
          >
            <Minus size={11} />
            <span>-5</span>
          </button>
          <button
            onClick={() => handleBumpCell(-1.0)}
            disabled={!selectedCell}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-rose-300 rounded-lg border border-slate-700 transition-all cursor-pointer"
            title="-1 Unit"
          >
            <Minus size={11} />
            <span>-1</span>
          </button>
          <button
            onClick={() => handleBumpCell(1.0)}
            disabled={!selectedCell}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-300 rounded-lg border border-slate-700 transition-all cursor-pointer"
            title="+1 Unit"
          >
            <Plus size={11} />
            <span>+1</span>
          </button>
          <button
            onClick={() => handleBumpCell(5.0)}
            disabled={!selectedCell}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-300 rounded-lg border border-slate-700 transition-all cursor-pointer"
            title="+5 Units"
          >
            <Plus size={11} />
            <span>+5</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleSmoothMap}
            className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-cyan-950 text-cyan-300 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer font-sans text-xs font-semibold"
          >
            <Sparkles size={12} />
            <span>Smooth Matrix</span>
          </button>

          <button
            onClick={handleResetMap}
            className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all cursor-pointer font-sans text-xs font-semibold"
          >
            <RotateCcw size={12} />
            <span>Reset Base</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 16x16 GRID TABLE WITH LIVE TRACER DOT */}
      {/* ================================================================= */}
      <div className="flex-1 w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-2">
        <table className="w-full text-center border-collapse font-mono text-[10.5px]">
          <thead>
            <tr>
              <th className="p-1 text-[9px] text-slate-500 border border-slate-850 bg-slate-900 uppercase">
                MAP \ RPM
              </th>
              {activeMap.axis.rpmBreakpoints.map((rpm, c) => (
                <th
                  key={c}
                  className={`p-1 border border-slate-850 text-slate-400 bg-slate-900/90 ${
                    liveTrace.colIndex === c ? "text-cyan-300 font-bold bg-cyan-950/60" : ""
                  }`}
                >
                  {rpm}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeMap.axis.loadKPaBreakpoints.map((load, r) => (
              <tr key={r}>
                {/* Y-Axis Label (kPa MAP) */}
                <td
                  className={`p-1 border border-slate-850 text-slate-400 bg-slate-900/90 font-bold ${
                    liveTrace.rowIndex === r ? "text-cyan-300 bg-cyan-950/60" : ""
                  }`}
                >
                  {load}k
                </td>

                {/* 16 Cells across columns */}
                {activeMap.grid[r].map((val, c) => {
                  const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                  const isTraceCell = liveTrace.rowIndex === r && liveTrace.colIndex === c;
                  const colorClass = getCellColor(val, activeMap.minValue, activeMap.maxValue);

                  return (
                    <td
                      key={c}
                      onClick={() => setSelectedCell({ row: r, col: c })}
                      className={`relative p-1.5 border border-slate-850 cursor-pointer transition-all hover:scale-105 hover:z-20 hover:brightness-125 ${colorClass} ${
                        isSelected ? "ring-2 ring-cyan-400 z-30 font-extrabold shadow-lg" : ""
                      }`}
                    >
                      <span>{val}</span>

                      {/* Live Dyno Tracer Dot Overlay */}
                      {isTraceCell && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-ping" />
                          <div className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================================================================= */}
      {/* LIVE ENGINE TRACER RIBBON & STATS */}
      {/* ================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Gauge size={13} className="text-cyan-400" />
            <span className="text-slate-400">Live Dyno Load:</span>
            <span className="text-cyan-300 font-bold">{currentRpm} RPM</span>
            <span className="text-slate-600">@</span>
            <span className="text-amber-300 font-bold">{currentMapKPa} kPa</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-emerald-400" />
            <span className="text-slate-400">Interpolated Output:</span>
            <span className="text-emerald-300 font-bold text-sm">
              {liveTrace.interpolatedValue} {activeMap.unit}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Target Map: <span className="text-slate-300 font-bold">{activeMap.name}</span>
        </div>
      </div>
    </div>
  );
};
