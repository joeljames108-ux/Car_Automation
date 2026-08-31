import React, { useState } from "react";
import {
  Flame,
  Zap,
  Sliders,
  Activity,
  Gauge,
  ShieldCheck,
  RotateCw,
  Award,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonVgtTurboStudio() {
  const { sim } = useDesign();

  const [vaneOpeningPct, setVaneOpeningPct] = useState(38); // % (15-95)
  const [engineRpm, setEngineRpm] = useState(4800); // RPM (1500-9000)
  const [housingType, setHousingType] = useState<"vgt_monovariable" | "twin_scroll_vgt" | "electric_e_turbo" | "sequential_vgt">("twin_scroll_vgt");

  // Compute Turbo Dynamics
  const boostPressureBar = (1.2 + ((100 - vaneOpeningPct) / 80) * 1.8 + (engineRpm / 9000) * 0.8).toFixed(2);
  const spoolLatencyMs = Math.round(80 + (vaneOpeningPct / 95) * 180 - (housingType === "electric_e_turbo" ? 140 : 0));
  const compressorEfficiency = (72 + (1 - Math.abs(vaneOpeningPct - 45) / 50) * 6).toFixed(1);
  const turbineRpm = Math.round(95000 + (1 - vaneOpeningPct / 95) * 85000 + (engineRpm / 9000) * 45000);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "VARIABLE GEOMETRY TURBOCHARGER (VGT) & NOZZLE VANE BENCH",
          subtitle: "360-degree motorized guide vane aperture, sub-100ms transient boost threshold spool-up, and peak adiabatic efficiency optimizer",
          icon: <Flame size={18} />,
          badge: <NeonHorizonBadge variant="live">VGT BENCH ACTIVE · {housingType.toUpperCase().replace(/_/g, " ")}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="PEAK BOOST PRESSURE" value={`${boostPressureBar} BAR`} accentColor="emerald" />
          <NeonHorizonDataCard label="SPOOL-UP LATENCY" value={`${Math.max(25, spoolLatencyMs)} ms (INSTANT)`} accentColor="cyan" />
          <NeonHorizonDataCard label="COMPRESSOR EFFICIENCY" value={`${compressorEfficiency}% (ADIABATIC)`} accentColor="gold" />
          <NeonHorizonDataCard label="TURBINE ROTOR SPEED" value={`${turbineRpm.toLocaleString()} RPM`} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Vane Array Selection & Pressure Map (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "360° TURBINE HOUSING NOZZLE GUIDE VANE GEOMETRY",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-amber-950/80 border border-sky-400/25 font-mono text-xs">
              <div className="p-3 rounded-lg bg-amber-950/80 border border-white/10 flex flex-col items-center">
                <span className="text-amber-300/60 text-[10px]">Inlet Temp</span>
                <span className="text-amber-400 font-bold text-sm">985°C EGT</span>
                <span className="text-amber-400/50 text-[10px]">Inconel 718</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-950/80 border border-white/10 flex flex-col items-center">
                <span className="text-amber-300/60 text-[10px]">Pressure Ratio</span>
                <span className="text-amber-300 font-bold text-sm">3.85 : 1 P₃/P₁</span>
                <span className="text-emerald-400 text-[10px]">High Surge Margin</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-950/80 border border-white/10 flex flex-col items-center">
                <span className="text-amber-300/60 text-[10px]">Shaft Bearings</span>
                <span className="text-amber-300 font-bold text-sm">Dual Ceramic Ball</span>
                <span className="text-amber-400 text-[10px]">Water-Cooled CHRA</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "vgt_monovariable", name: "Mono-VGT" },
                { id: "twin_scroll_vgt", name: "Twin-Scroll VGT" },
                { id: "electric_e_turbo", name: "48V E-Turbo" },
                { id: "sequential_vgt", name: "Sequential" },
              ].map((m) => {
                const isSelected = housingType === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playTurboBoostSound();
                      setHousingType(m.id as "vgt_monovariable" | "twin_scroll_vgt" | "electric_e_turbo" | "sequential_vgt");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-amber-500/20 border-amber-500/30 text-sky-200"
 : "bg-amber-950/80 border-white/10 text-amber-300/60 hover:border-sky-400/25"
 }`}
                  >
                    {m.name}
                  </div>
                );
              })}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Sliders (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "VANE APERTURE & ENGINE SPEED",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Nozzle Guide Vane Opening Aperture"
              value={vaneOpeningPct}
              min={15}
              max={95}
              step={1}
              unit="%"
              color="cyan"
              onChange={(val) => setVaneOpeningPct(val)}
            />

            <NeonHorizonSlider
              label="Engine Speed (Dyno Point)"
              value={engineRpm}
              min={1500}
              max={9000}
              step={200}
              unit=" RPM"
              color="magenta"
              onChange={(val) => setEngineRpm(val)}
            />

            <div className="p-3.5 rounded-xl bg-amber-950/80 border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-300/60">Turbine Wheel:</span>
                <span className="text-emerald-300 font-bold">Titanium-Aluminide (TiAl)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-300/60">Wastegate Bypass:</span>
                <span className="text-amber-300 font-bold">Internal Electronic Diverter</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
