// ===================================================================
// MULTI-SECTOR RACE TELEMETRY & LAP COMPARISON TOOL
// ===================================================================
// Vision Glass interactive panel comparing lap time deltas, tire thermals,
// brake rotor temperatures, and hybrid battery energy deployment.
// ===================================================================

import React, { useState, memo } from "react";
import { LineChart, ChartSeries } from "../ui/LineChart";
import { Flag, Timer, Thermometer, Zap, ShieldAlert } from "lucide-react";
import { playHMITabSound } from "../../utils/hmiSoundSynth";

export const RaceTelemetryComparisonTool: React.FC = memo(function RaceTelemetryComparisonTool() {
  const [activeTab, setActiveTab] = useState<"LAP_TIME" | "TIRE_TEMP" | "BRAKE_TEMP" | "HYBRID">("LAP_TIME");

  // Sample comparison dataset (Pro Driver vs Conservative Driver)
  const lapTimeSeries: ChartSeries[] = [
    {
      label: "Pro Driver (Aggressive)",
      color: "#007aff",
      fill: true,
      unit: "s",
      data: Array.from({ length: 15 }, (_, i) => ({ x: i + 1, y: 135.5 - Math.sin(i * 0.4) * 1.8 + i * 0.2 })),
    },
    {
      label: "AI Driver (Conservative)",
      color: "#ef4444",
      unit: "s",
      data: Array.from({ length: 15 }, (_, i) => ({ x: i + 1, y: 138.2 - Math.sin(i * 0.3) * 1.2 + i * 0.15 })),
    },
  ];

  const tireTempSeries: ChartSeries[] = [
    {
      label: "FL Tire (°C)",
      color: "#ef4444",
      unit: "°C",
      data: Array.from({ length: 15 }, (_, i) => ({ x: i + 1, y: 85 + i * 2.2 })),
    },
    {
      label: "FR Tire (°C)",
      color: "#f97316",
      unit: "°C",
      data: Array.from({ length: 15 }, (_, i) => ({ x: i + 1, y: 82 + i * 2.0 })),
    },
    {
      label: "RL Tire (°C)",
      color: "#22c55e",
      unit: "°C",
      data: Array.from({ length: 15 }, (_, i) => ({ x: i + 1, y: 78 + i * 1.8 })),
    },
    {
      label: "RR Tire (°C)",
      color: "#38bdf8",
      unit: "°C",
      data: Array.from({ length: 15 }, (_, i) => ({ x: i + 1, y: 76 + i * 1.6 })),
    },
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 space-y-5 text-slate-100 shadow-2xl">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Timer className="w-5 h-5 text-blue-400" />
            <span>RACE TELEMETRY & MULTI-LAP COMPARISON</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare lap deltas, cornering tire thermals, and brake energy recovery across stint laps.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              playHMITabSound();
              setActiveTab("LAP_TIME");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "LAP_TIME" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            LAP TIMES
          </button>
          <button
            onClick={() => {
              playHMITabSound();
              setActiveTab("TIRE_TEMP");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "TIRE_TEMP" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            TIRE THERMALS
          </button>
        </div>
      </div>

      {/* Active Chart View */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        {activeTab === "LAP_TIME" ? (
          <LineChart series={lapTimeSeries} xLabel="Lap Number" yLabel="Lap Time" yUnit="s" height={240} />
        ) : (
          <LineChart series={tireTempSeries} xLabel="Lap Number" yLabel="Surface Temp" yUnit="°C" height={240} />
        )}
      </div>
    </div>
  );
});
