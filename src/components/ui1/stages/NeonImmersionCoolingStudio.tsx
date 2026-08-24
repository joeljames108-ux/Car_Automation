import React, { useState } from "react";
import {
  Thermometer,
  Zap,
  ShieldCheck,
  Flame,
  Droplets,
  Activity,
  Sliders,
  AlertTriangle,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonImmersionCoolingStudio() {
  const { sim } = useDesign();

  const [flowRate, setFlowRate] = useState(75); // L/min
  const [chargePower, setChargePower] = useState(450); // kW
  const [fluidType, setFluidType] = useState<"synthetic_hydrocarbon" | "fluorinated_liquid" | "ester_based">("synthetic_hydrocarbon");

  // Compute thermal metrics based on flow rate and charge power
  const maxCellTemp = Math.round(28 + (chargePower / 600) * 35 - (flowRate / 120) * 18);
  const heatFlux = (0.8 + (chargePower / 400) * 1.6).toFixed(1);
  const runawayRisk = maxCellTemp > 55 ? "HIGH" : maxCellTemp > 45 ? "MODERATE" : "MINIMAL (SAFE)";

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "DIELECTRIC BATTERY IMMERSION COOLING & THERMAL RUNAWAY CONTAINMENT",
          subtitle: "Direct-contact phase change immersion fluid, 600 kW ultra-fast charge thermal dissipation, and cell gradient mapping",
          icon: <Droplets size={18} />,
          badge: <NeonHorizonBadge variant={maxCellTemp <= 45 ? "emerald" : "coral"}>MAX CELL TEMP: {maxCellTemp}°C</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="PEAK CELL TEMP" value={`${maxCellTemp}°C`} accentColor={maxCellTemp <= 45 ? "emerald" : "coral"} />
          <NeonHorizonDataCard label="HEAT FLUX" value={`${heatFlux} W/cm²`} accentColor="gold" />
          <NeonHorizonDataCard label="COOLANT FLOW" value={`${flowRate} L/min`} accentColor="cyan" />
          <NeonHorizonDataCard label="RUNAWAY RISK" value={runawayRisk} accentColor={maxCellTemp <= 45 ? "emerald" : "coral"} />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Cell Temperature Matrix (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "32-CELL IMMERSION MODULE THERMAL HEATMAP",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="grid grid-cols-8 gap-2 p-4 rounded-xl bg-[#05080f] border border-sky-400/25 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              {Array.from({ length: 32 }).map((_, idx) => {
                const cellTemp = Math.round(maxCellTemp - Math.abs(idx - 16) * 0.4);
                const isHot = cellTemp > 45;
                return (
                  <div
                    key={idx}
                    className={`h-12 rounded-lg border flex flex-col items-center justify-center font-mono text-[9px] font-bold transition-all ${
 isHot
 ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
 : "bg-sky-400/10 border-sky-400/25 text-sky-300"
 }`}
                  >
                    <span>C{idx + 1}</span>
                    <span>{cellTemp}°C</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300">Immersion Dielectric Chemistry:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "synthetic_hydrocarbon", name: "Synthetic Hydrocarbon" },
                  { id: "fluorinated_liquid", name: "Fluorinated Liquid" },
                  { id: "ester_based", name: "Synthetic Ester" },
                ].map((item) => {
                  const isSelected = fluidType === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        playSubsystemEngageSound();
                        setFluidType(item.id as "synthetic_hydrocarbon" | "fluorinated_liquid" | "ester_based");
                      }}
                      className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-sky-400/10 border-sky-400/30 text-sky-200"
 : "bg-[#0a111e] border-white/10 text-slate-400 hover:border-sky-400/25"
 }`}
                    >
                      {item.name}
                    </div>
                  );
                })}
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Pump Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "PUMP & FAST-CHARGE DYNAMICS",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Coolant Pump Flow Rate"
              value={flowRate}
              min={10}
              max={120}
              step={5}
              unit=" L/min"
              color="cyan"
              onChange={(val) => setFlowRate(val)}
            />

            <NeonHorizonSlider
              label="DC Fast Charge Power"
              value={chargePower}
              min={100}
              max={600}
              step={25}
              unit=" kW"
              color="gold"
              onChange={(val) => setChargePower(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Fluid Boiling Point:</span>
                <span className="text-sky-300 font-bold">110°C (Phase Change)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Dielectric Breakdown:</span>
                <span className="text-emerald-300 font-bold">&gt; 45 kV / 2.5mm</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
