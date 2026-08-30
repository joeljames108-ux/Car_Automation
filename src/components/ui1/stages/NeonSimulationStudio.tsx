import React, { useState } from "react";
import {
  Timer,
  Trophy,
  Activity,
  Zap,
  Flame,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import { NeonLapTimesPanel } from "../design/NeonLapTimesPanel";

export function NeonSimulationStudio() {
  const { sim } = useDesign();

  const [selectedCircuit, setSelectedCircuit] = useState("nurburgring");

  const circuits = [
    { id: "nurburgring", name: "Nürburgring Nordschleife", length: "20.83 km", baseLap: "6:58.42", topSpeedTrap: "328 km/h", downforceDemand: "HIGH" },
    { id: "spa", name: "Circuit de Spa-Francorchamps", length: "7.00 km", baseLap: "2:14.12", topSpeedTrap: "334 km/h", downforceDemand: "MEDIUM-HIGH" },
    { id: "lemans", name: "Circuit de la Sarthe (Le Mans)", length: "13.62 km", baseLap: "3:22.80", topSpeedTrap: "362 km/h", downforceDemand: "LOW DRAG" },
    { id: "silverstone", name: "Silverstone Grand Prix Circuit", length: "5.89 km", baseLap: "1:52.40", topSpeedTrap: "318 km/h", downforceDemand: "HIGH" },
    { id: "monza", name: "Autodromo Nazionale Monza", length: "5.79 km", baseLap: "1:43.10", topSpeedTrap: "358 km/h", downforceDemand: "LOW DRAG" },
    { id: "suzuka", name: "Suzuka International Racing Course", length: "5.80 km", baseLap: "1:58.20", topSpeedTrap: "312 km/h", downforceDemand: "HIGH" },
    { id: "laguna", name: "WeatherTech Raceway Laguna Seca", length: "3.60 km", baseLap: "1:22.40", topSpeedTrap: "268 km/h", downforceDemand: "MAX DOWNFORCE" },
    { id: "monaco", name: "Circuit de Monaco", length: "3.33 km", baseLap: "1:11.20", topSpeedTrap: "254 km/h", downforceDemand: "MAX DOWNFORCE" },
  ];

  const activeCircuit = circuits.find((c) => c.id === selectedCircuit) || circuits[0];

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "GLOBAL 10-CIRCUIT SIMULATION & THEORETICAL LAP TIME MATRIX",
          subtitle: "Multi-circuit physics telemetry, apex sector splits, and maximum speed trap analysis",
          icon: <Timer size={18} />,
          badge: <NeonHorizonBadge variant="live">CIRCUIT PREDICTOR READY</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="ACTIVE TRACK" value={activeCircuit.name.split(" ")[0]} accentColor="cyan" />
          <NeonHorizonDataCard label="ESTIMATED LAP TIME" value={activeCircuit.baseLap} accentColor="emerald" />
          <NeonHorizonDataCard label="SPEED TRAP" value={activeCircuit.topSpeedTrap} accentColor="gold" />
          <NeonHorizonDataCard label="AERO DEMAND" value={activeCircuit.downforceDemand} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Circuit Selector (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "SELECT FIA SANCTIONED CIRCUIT",
              icon: <Trophy size={16} />,
            }}
            className="p-6 flex flex-col gap-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {circuits.map((circuit) => {
                const isSelected = selectedCircuit === circuit.id;
                return (
                  <div
                    key={circuit.id}
                    onClick={() => {
                      playHMIClickSound();
                      setSelectedCircuit(circuit.id);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
 isSelected
 ? "bg-sky-400/10 border-sky-400/30 text-sky-200"
 : "bg-[#0a111e] border-white/10 hover:border-sky-400/25"
 }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-50 truncate pr-2">{circuit.name}</span>
                      <NeonHorizonBadge variant={isSelected ? "cyan" : "neutral"} size="xs">
                        {circuit.length}
                      </NeonHorizonBadge>
                    </div>
                    <div className="flex items-center justify-between text-[10px] nh-font-mono text-amber-200/60">
                      <span className="text-emerald-300 font-bold">Lap: {circuit.baseLap}</span>
                      <span className="text-amber-300">Trap: {circuit.topSpeedTrap}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Sector Telemetry (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "SECTOR SPLIT TELEMETRY",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-3 font-mono text-xs"
          >
            <div className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex items-center justify-between">
              <span className="text-amber-200/60">Sector 1 (High Speed Apex):</span>
              <span className="text-sky-300 font-bold">24.810s</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex items-center justify-between">
              <span className="text-amber-200/60">Sector 2 (Technical Esses):</span>
              <span className="text-sky-300 font-bold">48.240s</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex items-center justify-between">
              <span className="text-amber-200/60">Sector 3 (Main Straight):</span>
              <span className="text-sky-300 font-bold">29.750s</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0e1626] border border-emerald-400/30 flex items-center justify-between mt-2">
              <span className="text-emerald-200 font-bold">Theoretical Best:</span>
              <span className="text-emerald-400 font-bold">{activeCircuit.baseLap}</span>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
