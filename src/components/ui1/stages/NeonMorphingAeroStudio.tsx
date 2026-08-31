import React, { useState, useEffect, useRef } from "react";
import {
  Wind,
  Sliders,
  Activity,
  Zap,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonMorphingAeroStudio() {
  const { sim } = useDesign();

  const [camberAngleDeg, setCamberAngleDeg] = useState(12.5); // deg (0 - 18)
  const [piezoVoltageV, setPiezoVoltageV] = useState(450); // Volts (100 - 800)
  const [morphMode, setMorphMode] = useState<"high_downforce" | "low_drag_drs" | "turn_in_asymmetric" | "airbrake_flare">("high_downforce");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute Aerodynamics
  const liftToDragRatio = (4.2 + (1 - camberAngleDeg / 18) * 1.6).toFixed(2);
  const totalDownforceN = Math.round(1800 + (camberAngleDeg / 18) * 3400);
  const parasiticDragSavings = Math.round((camberAngleDeg / 18) * 22); // % vs hinged flap

  // 60FPS Morphing Airfoil Camber Canvas
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

      // Smooth Morphing Airfoil Profile
      const leadingEdgeX = 60;
      const leadingEdgeY = h * 0.45;
      const midChordX = w * 0.55;
      const midChordY = h * 0.45;
      const trailingEdgeX = w - 80;
      const trailingEdgeY = h * 0.45 + (camberAngleDeg / 18) * (h * 0.35);

      // Draw Top & Bottom Skin (Graphene Seamless)
      ctx.fillStyle = "rgba(56,189,248, 0.25)";
      ctx.strokeStyle = "#8fb9d9";
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(leadingEdgeX, leadingEdgeY);
      // Top Curvature
      ctx.bezierCurveTo(leadingEdgeX + 80, leadingEdgeY - 45, midChordX, midChordY - 25, trailingEdgeX, trailingEdgeY);
      // Trailing Edge Tip
      ctx.lineTo(trailingEdgeX - 10, trailingEdgeY + 15);
      // Bottom Curvature
      ctx.bezierCurveTo(midChordX, midChordY + 20, leadingEdgeX + 80, leadingEdgeY + 25, leadingEdgeX, leadingEdgeY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Piezo-electric Strain Actuators (Magenta Nodes)
      ctx.fillStyle = "#ff0055";
      for (let i = 0; i < 4; i++) {
        const px = midChordX + i * 35;
        const py = midChordY - 5 + ((trailingEdgeY - midChordY) * (i / 4));
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Streamlines
      ctx.strokeStyle = "rgba(56,189,248, 0.8)";
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 5; i++) {
        const offset = (tick * 4 + i * 40) % (w - 100);
        const sx = 40 + offset;
        let sy = h * 0.25 + i * 15;

        if (sx > leadingEdgeX && sx < trailingEdgeX) {
          const ratio = (sx - leadingEdgeX) / (trailingEdgeX - leadingEdgeX);
          sy += (ratio * (camberAngleDeg / 18) * 35);
        }

        ctx.fillStyle = "#8fb9d9";
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [camberAngleDeg]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "SHAPE-MORPHING GRAPHENE WING CAMBER & PIEZO AERO LAB",
          subtitle: "Seamless 0° to 18° elastomeric graphene trailing edge morphing, zero-hinge parasitic drag elimination, and 15ms piezo response",
          icon: <Wind size={18} />,
          badge: <NeonHorizonBadge variant="live">GRAPHENE MORPHING ACTIVE · {morphMode.toUpperCase().replace(/_/g, " ")}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="TOTAL WING DOWNFORCE" value={`${totalDownforceN} N`} accentColor="emerald" />
          <NeonHorizonDataCard label="LIFT-TO-DRAG (L/D)" value={`${liftToDragRatio} L/D`} accentColor="cyan" />
          <NeonHorizonDataCard label="MORPHING CAMBER" value={`${camberAngleDeg.toFixed(1)}° SEAMLESS`} accentColor="magenta" />
          <NeonHorizonDataCard label="HINGE DRAG SAVINGS" value={`-${parasiticDragSavings}% DRAG`} accentColor="gold" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Morphing Airfoil Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS CONTINUOUS SEAMLESS AIRFOIL CAMBER DEFORMATION",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-amber-950/80 rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className="text-[10px] nh-font-mono font-bold text-amber-300">
                  PIEZO MFC NODES: 15ms HIGH-SPEED STRAIN DEFORMATION
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "high_downforce", name: "High Downforce" },
                { id: "low_drag_drs", name: "DRS Low-Drag" },
                { id: "turn_in_asymmetric", name: "Apex Vector" },
                { id: "airbrake_flare", name: "Airbrake Flare" },
              ].map((m) => {
                const isSelected = morphMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setMorphMode(m.id as "high_downforce" | "low_drag_drs" | "turn_in_asymmetric" | "airbrake_flare");
                      if (m.id === "high_downforce") setCamberAngleDeg(16.0);
                      else if (m.id === "low_drag_drs") setCamberAngleDeg(1.5);
                      else if (m.id === "turn_in_asymmetric") setCamberAngleDeg(11.0);
                      else if (m.id === "airbrake_flare") setCamberAngleDeg(18.0);
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
              title: "CAMBER DEFLECTION & PIEZO VOLTAGE TUNING",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Graphene Wing Trailing Edge Camber"
              value={camberAngleDeg}
              min={0.0}
              max={18.0}
              step={0.5}
              unit="°"
              color="cyan"
              onChange={(val) => setCamberAngleDeg(val)}
            />

            <NeonHorizonSlider
              label="Macro-Fiber Composite Piezo Voltage"
              value={piezoVoltageV}
              min={100}
              max={800}
              step={25}
              unit=" V"
              color="magenta"
              onChange={(val) => setPiezoVoltageV(val)}
            />

            <div className="p-3.5 rounded-xl bg-amber-950/80 border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-300/60">Wing Skin Matrix:</span>
                <span className="text-emerald-300 font-bold">Elastomeric Graphene Prepreg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-300/60">Fatigue Life Limit:</span>
                <span className="text-amber-300 font-bold">&gt; 10⁷ Cyclic Flexures</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
