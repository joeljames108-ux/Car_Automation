import React, { useState, useEffect, useRef } from "react";
import {
  Wind,
  Sliders,
  Activity,
  Zap,
  ShieldCheck,
  Layers,
  ArrowDownCircle,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonBoundaryLayerSuctionStudio() {
  const { sim } = useDesign();

  const [suctionFlowrateLps, setSuctionFlowrateLps] = useState(48); // L/s (10 - 100)
  const [poreDiameterMicrons, setPoreDiameterMicrons] = useState(65); // μm (20 - 120)
  const [suctionZone, setSuctionZone] = useState<"hood_cowl" | "roof_transition" | "side_sill_suction" | "full_surface_active">("roof_transition");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute Boundary Layer Mechanics
  const dragReductionCd = (-0.008 - (suctionFlowrateLps / 100) * 0.022).toFixed(3);
  const laminarRunExtensionMm = Math.round(15 + (suctionFlowrateLps / 100) * 48);
  const microTurbinePowerW = Math.round((suctionFlowrateLps / 100) * 380);
  const boundaryLayerThicknessMm = (3.8 - (suctionFlowrateLps / 100) * 2.2).toFixed(1);

  // 60FPS Micro-Pore Suction Particle Canvas
  useEffect(() => {
    let animId: number;
    let tick = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Micro-Perforated Carbon Skin Line
      ctx.strokeStyle = "rgba(0, 229, 255, 0.5)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, h * 0.7);
      ctx.lineTo(w - 40, h * 0.7);
      ctx.stroke();

      // Micro-Pore Perforations (Cyan Dashes)
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 1.5;
      for (let x = 60; x < w - 60; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, h * 0.7 - 3);
        ctx.lineTo(x, h * 0.7 + 10);
        ctx.stroke();
      }

      // Streamlines Ingesting into Pores
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 6; i++) {
        const offset = (tick * 4 + i * 35) % (w - 100);
        const sx = 40 + offset;
        let sy = h * 0.35 + i * 12;

        // Curve downwards toward pores
        if (sx > 120 && sx < w - 120) {
          const ratio = (sx - 120) / (w - 240);
          sy += (ratio * (suctionFlowrateLps / 100) * 35);
        }

        ctx.fillStyle = "#00e5ff";
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [suctionFlowrateLps, poreDiameterMicrons]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "MICRO-POROUS ACTIVE BOUNDARY LAYER SUCTION LAB",
          subtitle: "Laser-drilled micro-perforated carbon skin with 48V scavenge micro-turbines preventing flow separation and delaying turbulence transition",
          icon: <Wind size={18} />,
          badge: <NeonHorizonBadge variant="live">POROUS SUCTION ACTIVE · {suctionZone.toUpperCase().replace(/_/g, " ")}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="TOTAL DRAG REDUCTION" value={`${dragReductionCd} CD`} accentColor="emerald" />
          <NeonHorizonDataCard label="LAMINAR ATTACHMENT" value={`+${laminarRunExtensionMm} mm RUN`} accentColor="cyan" />
          <NeonHorizonDataCard label="BOUNDARY LAYER THICKNESS" value={`${boundaryLayerThicknessMm} mm`} accentColor="gold" />
          <NeonHorizonDataCard label="MICRO-TURBINE POWER" value={`${microTurbinePowerW} W (48V)`} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Suction Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS MICRO-PERFORATED SUCTION FIELD & INGESTION FLOW",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-[#030712] rounded-xl border border-cyan-500/30 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className="text-[10px] nh-font-mono font-bold text-cyan-300">
                  PORE DIAMETER: {poreDiameterMicrons}μm · MICRO-TURBINE SCAVENGE ACTIVE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "roof_transition", name: "Roof Transition" },
                { id: "hood_cowl", name: "Hood Cowl" },
                { id: "side_sill_suction", name: "Side Sills" },
                { id: "full_surface_active", name: "Full Surface" },
              ].map((m) => {
                const isSelected = suctionZone === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setSuctionZone(m.id as "hood_cowl" | "roof_transition" | "side_sill_suction" | "full_surface_active");
                      if (m.id === "roof_transition") setSuctionFlowrateLps(55);
                      else if (m.id === "hood_cowl") setSuctionFlowrateLps(35);
                      else if (m.id === "side_sill_suction") setSuctionFlowrateLps(42);
                      else if (m.id === "full_surface_active") setSuctionFlowrateLps(88);
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#091a38] border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                        : "bg-[#060e22] border-white/10 text-slate-400 hover:border-cyan-500/30"
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
              title: "SUCTION FLOWRATE & PORE GEOMETRY",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Boundary Layer Suction Flowrate"
              value={suctionFlowrateLps}
              min={10}
              max={100}
              step={2}
              unit=" L/s"
              color="cyan"
              onChange={(val) => setSuctionFlowrateLps(val)}
            />

            <NeonHorizonSlider
              label="Laser-Drilled Micro-Pore Diameter"
              value={poreDiameterMicrons}
              min={20}
              max={120}
              step={5}
              unit=" μm"
              color="magenta"
              onChange={(val) => setPoreDiameterMicrons(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#060e22] border border-cyan-500/20 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Drilling Method:</span>
                <span className="text-emerald-300 font-bold">Femtosecond UV Laser</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Suction Source:</span>
                <span className="text-cyan-300 font-bold">48V Brushless Micro-Impellers</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
