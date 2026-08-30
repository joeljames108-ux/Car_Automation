import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  CloudRain,
  Sun,
  Moon,
  Users,
  Activity,
  Zap,
  Sliders,
  ShieldAlert,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playHologramScanSound, playSubsystemEngageSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonEnduranceStudio() {
  const { sim } = useDesign();

  const [raceHour, setRaceHour] = useState(14); // 0-24 hrs
  const [activeDriver, setActiveDriver] = useState(1);
  const [weatherCondition, setWeatherCondition] = useState<"clear" | "overcast" | "rain">("clear");

  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated Doppler Weather Radar
  useEffect(() => {
    let animId: number;
    let angle = 0;

    const render = () => {
      const canvas = radarCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = "rgba(3, 7, 18, 0.25)";
      ctx.fillRect(0, 0, w, h);

      // Radar Concentric Circles
      ctx.strokeStyle = "rgba(56,189,248, 0.15)";
      ctx.lineWidth = 1;
      for (let r = 30; r <= 90; r += 30) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radar Sweep Line
      ctx.strokeStyle = "#8fb9d9";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 90, cy + Math.sin(angle) * 90);
      ctx.stroke();

      // Rain Cloud Blip
      if (weatherCondition === "rain") {
        ctx.fillStyle = "rgba(56,189,248, 0.4)";
        ctx.beginPath();
        ctx.arc(cx + 40, cy - 30, 25, 0, Math.PI * 2);
        ctx.fill();
      }

      angle += 0.04;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [weatherCondition]);

  const drivers = [
    { id: 1, name: "Maxime Dubois (Platinum)", stint: "2h 45m", fatigue: "18% (FRESH)", bpm: "142 BPM" },
    { id: 2, name: "Lucas Sterling (Gold)", stint: "0h 00m", fatigue: "5% (RESTED)", bpm: "72 BPM" },
    { id: 3, name: "Kenji Sato (Silver)", stint: "0h 00m", fatigue: "2% (RESTED)", bpm: "68 BPM" },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "24-HOUR ENDURANCE RACE SIMULATOR & DOPPLER WEATHER RADAR",
          subtitle: "Multi-driver stint management, live precipitation sweep, and thermal brake wear telemetry",
          icon: <Clock size={18} />,
          badge: <NeonHorizonBadge variant="live">RACE HOUR: {raceHour}:00 / 24:00</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="TIME OF DAY" value={raceHour >= 6 && raceHour < 18 ? "DAYLIGHT" : raceHour >= 18 && raceHour < 21 ? "SUNSET" : "NIGHT STINT"} accentColor={raceHour >= 6 && raceHour < 18 ? "gold" : "magenta"} />
          <NeonHorizonDataCard label="WEATHER RADAR" value={weatherCondition.toUpperCase()} accentColor={weatherCondition === "clear" ? "emerald" : weatherCondition === "overcast" ? "gold" : "cyan"} />
          <NeonHorizonDataCard label="ACTIVE DRIVER" value={drivers.find(d => d.id === activeDriver)?.name.split(" ")[0] || "Driver"} accentColor="cyan" />
          <NeonHorizonDataCard label="BRAKE ROTOR WEAR" value={`${Math.round(25 + (raceHour / 24) * 55)}% USED`} accentColor="coral" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Radar & Time Slider (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "LIVE DOPPLER WEATHER RADAR (20 KM RADIUS)",
              icon: <CloudRain size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-48 bg-amber-950/60 rounded-xl border border-sky-400/25 overflow-hidden relative flex items-center justify-center shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={radarCanvasRef} width={360} height={190} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
                <span className="text-[10px] nh-font-mono font-bold text-amber-400">CIRCUIT DE LA SARTHE · DOPPLER 500kW</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "clear", name: "Clear Dry" },
                { id: "overcast", name: "Overcast" },
                { id: "rain", name: "Rain Storm" },
              ].map((item) => {
                const isSelected = weatherCondition === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      playHologramScanSound();
                      setWeatherCondition(item.id as "clear" | "overcast" | "rain");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-amber-500/20 border-amber-500/30 text-sky-200"
 : "bg-amber-950/60 border-white/10 text-slate-400 hover:border-sky-400/25"
 }`}
                  >
                    {item.name}
                  </div>
                );
              })}
            </div>

            <NeonHorizonSlider
              label="Endurance Race Progress"
              value={raceHour}
              min={1}
              max={24}
              step={1}
              unit="h"
              color="gold"
              onChange={(val) => setRaceHour(val)}
            />
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Drivers Squad (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "3-DRIVER STINT ROTATION",
              icon: <Users size={16} />,
            }}
            className="p-6 flex flex-col gap-3"
          >
            {drivers.map((driver) => {
              const isSelected = activeDriver === driver.id;
              return (
                <div
                  key={driver.id}
                  onClick={() => {
                    playSubsystemEngageSound();
                    setActiveDriver(driver.id);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
 isSelected
 ? "bg-amber-500/20 border-amber-500/30 text-sky-200"
 : "bg-amber-950/60 border-white/10 hover:border-sky-400/25"
 }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{driver.name}</span>
                    <NeonHorizonBadge variant={isSelected ? "cyan" : "neutral"} size="xs">
                      {isSelected ? "IN COCKPIT" : "IN PIT BOX"}
                    </NeonHorizonBadge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] nh-font-mono text-slate-400">
                    <span>Stint: {driver.stint} · {driver.fatigue}</span>
                    <span className="text-emerald-300 font-bold">{driver.bpm}</span>
                  </div>
                </div>
              );
            })}
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
