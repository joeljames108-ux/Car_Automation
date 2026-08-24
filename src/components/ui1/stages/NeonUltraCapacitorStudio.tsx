import React, { useState, useEffect } from "react";
import {
  Zap,
  BatteryCharging,
  Sliders,
  Play,
  Activity,
  Flame,
  Gauge,
  Sparkles,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playTurboBoostSound, playSubsystemEngageSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonUltraCapacitorStudio() {
  const { sim } = useDesign();

  const [capSoc, setCapSoc] = useState(100); // % State of Charge
  const [burstActive, setBurstActive] = useState(false);
  const [regenBias, setRegenBias] = useState(65); // % to ultra-caps vs main battery

  // Slingshot Burst Simulation
  useEffect(() => {
    let timer: any;
    if (burstActive) {
      timer = setInterval(() => {
        setCapSoc((prev) => {
          if (prev <= 5) {
            setBurstActive(false);
            return 0;
          }
          return prev - 8;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [burstActive]);

  const handleTriggerKers = () => {
    if (capSoc < 20) {
      setCapSoc(100); // Recharge
      playSubsystemEngageSound();
      return;
    }
    playTurboBoostSound();
    setBurstActive(true);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow={burstActive ? "pulse" : "cyan"}
        corners="reticle"
        header={{
          title: "GRAPHENE ULTRA-CAPACITOR HYBRID BUFFER & 300KW KERS SLINGSHOT LAB",
          subtitle: "120 kW/kg specific power density, sub-second rapid kinetic regen capture, and 8-second hyper-boost deployment",
          icon: <Zap size={18} />,
          badge: <NeonHorizonBadge variant={burstActive ? "coral" : "live"}>{burstActive ? "KERS BOOST FIRING (300 kW)" : "CAPACITOR READY"}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="CAPACITOR SOC" value={`${capSoc}%`} accentColor={capSoc > 50 ? "emerald" : "coral"} />
          <NeonHorizonDataCard label="PEAK BURST POWER" value={burstActive ? "300 kW (+402 HP)" : "STANDBY (READY)"} accentColor={burstActive ? "coral" : "cyan"} />
          <NeonHorizonDataCard label="POWER DENSITY" value="120 kW/kg (GRAPHENE)" accentColor="gold" />
          <NeonHorizonDataCard label="REGEN ENERGY FLOW" value={`${regenBias}% ULTRA-CAP / ${100 - regenBias}% NMC`} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Capacitor Cell Matrix (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "GRAPHENE ULTRA-CAPACITOR BANK VOLTAGE DISCHARGE",
              icon: <BatteryCharging size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="grid grid-cols-12 gap-1.5 h-36 p-4 rounded-xl bg-[#030712] border border-sky-400/25 items-end shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              {Array.from({ length: 12 }).map((_, idx) => {
                const cellSoc = Math.max(0, capSoc - idx * 2.5);
                const isDischarging = burstActive;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      style={{ height: `${cellSoc}%` }}
                      className={`w-full rounded-t transition-all ${
 isDischarging
 ? "bg-rose-500"
 : "bg-sky-300"
 }`}
                    />
                    <span className="text-[8px] font-mono text-slate-400">#{idx + 1}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <NeonHorizonButton
                variant="primary"
                glow
                size="sm"
                onClick={handleTriggerKers}
              >
                <Zap size={14} className="mr-1.5" />
                {capSoc < 20 ? "⚡ RECHARGE ULTRA-CAPS (100%)" : "🚀 ACTIVATE 300 kW KERS SLINGSHOT"}
              </NeonHorizonButton>
              <span className="text-xs font-mono text-slate-400">
                Cycle Life: <strong className="text-emerald-400">500,000+ Full Pulses</strong>
              </span>
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Buffer Sliders (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "REGEN ENERGY RECOVERY BIAS",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Kinetic Regen to Ultra-Capacitor Ratio"
              value={regenBias}
              min={20}
              max={100}
              step={5}
              unit="% Cap"
              color="cyan"
              onChange={(val) => setRegenBias(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#060e22] border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Full Recharge Time:</span>
                <span className="text-sky-300 font-bold">1.8 Seconds (Braking)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Pack Weight:</span>
                <span className="text-amber-300 font-bold">24.5 kg Complete</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
