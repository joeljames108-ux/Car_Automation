import React, { useState } from "react";
import {
  BatteryCharging,
  Zap,
  ThermometerSnowflake,
  ShieldCheck,
  Sliders,
  Cpu,
  Layers,
  Activity,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSelect } from "../design/NeonHorizonSelect";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonToggle } from "../design/NeonHorizonToggle";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonEvBatteryStudio() {
  const { sim } = useDesign();

  const [chemistry, setChemistry] = useState<string>("nmc_811");
  const [packCapacityKwh, setPackCapacityKwh] = useState(105);
  const [is800V, setIs800V] = useState(true);
  const [coolingFlowLpm, setCoolingFlowLpm] = useState(24);
  const [maxRegenKw, setMaxRegenKw] = useState(280);

  const chemistries: Record<string, { name: string; density: string; maxC: string; runawayTemp: string }> = {
    nmc_811: { name: "NMC 811 High Density", density: "285 Wh/kg", maxC: "4.5 C", runawayTemp: "210°C" },
    solid_state: { name: "Solid-State Silicon-Ceramic", density: "390 Wh/kg", maxC: "6.0 C", runawayTemp: "380°C (Non-Flammable)" },
    lfp_blade: { name: "LFP Cell-to-Pack Blade", density: "180 Wh/kg", maxC: "3.0 C", runawayTemp: "270°C" },
    sodium_ion: { name: "Sodium-Ion Cold Climate", density: "160 Wh/kg", maxC: "4.0 C", runawayTemp: "310°C" },
  };

  const currentChem = chemistries[chemistry] || chemistries.nmc_811;
  const estimatedPackWeight = Math.round(packCapacityKwh / (parseInt(currentChem.density) / 1000) * 1.25);
  const peakChargeKw = is800V ? 350 : 150;

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "800V HIGH-VOLTAGE BATTERY & THERMAL MANAGEMENT LAB",
          subtitle: "Silicon-carbide inverters, cell-to-pack thermodynamics, and ultra-fast DC charging",
          icon: <BatteryCharging size={18} />,
          badge: <NeonHorizonBadge variant="live">{is800V ? "800V SiC ARCHITECTURE" : "400V ARCHITECTURE"}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="PACK CAPACITY" value={packCapacityKwh} unit="kWh" accentColor="cyan" />
          <NeonHorizonDataCard label="PEAK DC FAST CHARGE" value={peakChargeKw} unit="kW" accentColor="gold" />
          <NeonHorizonDataCard label="PACK TOTAL MASS" value={estimatedPackWeight} unit="kg" accentColor="magenta" />
          <NeonHorizonDataCard label="PEAK REGEN RECOVERY" value={maxRegenKw} unit="kW" accentColor="emerald" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Battery Configuration (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "CELL CHEMISTRY & PACK ARCHITECTURE",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-5"
          >
            <NeonHorizonSelect
              label="ELECTROCHEMICAL CELL CHEMISTRY"
              value={chemistry}
              onChange={setChemistry}
              options={[
                { value: "nmc_811", label: "NMC 811 Lithium Nickel Manganese Cobalt", sublabel: "285 Wh/kg · Optimum power-to-weight balance" },
                { value: "solid_state", label: "Solid-State Silicon-Ceramic Electrolyte", sublabel: "390 Wh/kg · 380°C thermal runaway safety" },
                { value: "lfp_blade", label: "LFP Cell-to-Pack Blade (Cobalt-Free)", sublabel: "180 Wh/kg · 4,000+ cycle lifespan" },
                { value: "sodium_ion", label: "Sodium-Ion Cold Climate Matrix", sublabel: "160 Wh/kg · -30°C low temperature discharge" },
              ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NeonHorizonSlider
                label="USABLE PACK ENERGY"
                value={packCapacityKwh}
                min={45}
                max={150}
                unit="kWh"
                onChange={setPackCapacityKwh}
                color="cyan"
              />
              <NeonHorizonSlider
                label="COOLING PLATE FLOWRATE"
                value={coolingFlowLpm}
                min={8}
                max={40}
                unit="L/min"
                onChange={setCoolingFlowLpm}
                color="magenta"
              />
            </div>

            <NeonHorizonSlider
              label="MAX KINETIC REGEN HARVESTING"
              value={maxRegenKw}
              min={50}
              max={350}
              unit="kW"
              onChange={setMaxRegenKw}
              color="emerald"
            />

            <div className="pt-2">
              <NeonHorizonToggle
                label="800V SILICON-CARBIDE (SiC) INVERTER PLATFORM"
                description="Doubles charging voltage, halves copper current losses, and reduces harness weight"
                checked={is800V}
                onChange={setIs800V}
                color="cyan"
              />
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Cell Thermodynamics & Thermal Map (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "CELL THERMODYNAMICS & METRICS",
              icon: <ThermometerSnowflake size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="p-4 rounded-xl bg-amber-950/80 border border-sky-400/15 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-300/60">Gravimetric Density:</span>
                <span className="text-xs font-bold nh-font-mono text-amber-300">{currentChem.density}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-300/60">Max Discharge Rate:</span>
                <span className="text-xs font-bold nh-font-mono text-amber-300">{currentChem.maxC}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-300/60">Runaway Threshold:</span>
                <span className="text-xs font-bold nh-font-mono text-emerald-300">{currentChem.runawayTemp}</span>
              </div>
            </div>

            {/* Battery Module Temperature Heatmap visual */}
            <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
              <span className="nh-label-caps text-amber-300/60 text-[10px]">MODULE THERMAL EQUALIZATION</span>
              <div className="grid grid-cols-4 gap-2">
                {[32.4, 33.1, 33.8, 32.7, 34.2, 34.9, 34.0, 33.5].map((temp, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-amber-950/80 border border-sky-400/20 flex flex-col items-center justify-center text-center"
                  >
                    <span className="text-[9px] text-amber-300/60">MOD {idx + 1}</span>
                    <span className="text-xs font-bold nh-font-mono text-amber-300">{temp}°C</span>
                  </div>
                ))}
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
