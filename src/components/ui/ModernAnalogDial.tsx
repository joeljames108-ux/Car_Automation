import { useState } from "react";
import { Plus, Minus, Zap, Scale, Wind, Info, ArrowRight, Sun, Layers } from "lucide-react";

interface ModernAnalogDialProps {
  title?: string;
  value?: number;
  min?: number;
  max?: number;
  unit?: string;
  sublabel?: string;
  onChange?: (val: number) => void;
  step?: number;
  ticks?: (string | number)[];
}

export function ModernAnalogDial({
  title = "AERODYNAMIC PROFILE",
  value = 19,
  min = 0,
  max = 40,
  unit = "°",
  sublabel = "L/D",
  onChange,
  step = 1,
  ticks = ["2.0", "2.5", "3.0", "3.5", "3.0", "3.5"],
}: ModernAnalogDialProps) {
  const [val, setVal] = useState(value);
  const [actionState, setActionState] = useState<"downforce" | "balance" | "drag">("downforce");
  const [lightningEnabled, setLightningEnabled] = useState(true);
  const [cfdIntensity, setCfdIntensity] = useState(80);
  const [wireframeEnabled, setWireframeEnabled] = useState(false);

  const handleUpdate = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    setVal(clamped);
    if (onChange) onChange(clamped);
  };

  // Gauge SVG Math
  const radius = 62;
  const strokeWidth = 8;
  const center = 80;
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle;

  const percentage = (val - min) / (max - min);
  const activeAngle = startAngle + percentage * totalAngle;

  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
    const startPt = polarToCartesian(cx, cy, r, end);
    const endPt = polarToCartesian(cx, cy, r, start);
    const largeArcFlag = end - start <= 180 ? "0" : "1";
    return ["M", startPt.x, startPt.y, "A", r, r, 0, largeArcFlag, 0, endPt.x, endPt.y].join(" ");
  };

  const bgArcPath = describeArc(center, center, radius, startAngle, endAngle);
  const activeArcPath = describeArc(center, center, radius, startAngle, Math.max(startAngle + 0.1, activeAngle));
  const knobPos = polarToCartesian(center, center, radius, activeAngle);
  const needleEndPos = polarToCartesian(center, center, radius - 14, activeAngle);

  return (
    <div
      className="modern-analog-card"
      style={{
        background: "rgba(28, 34, 46, 0.72)",
        backdropFilter: "blur(50px) saturate(190%)",
        WebkitBackdropFilter: "blur(50px) saturate(190%)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        borderRadius: 24,
        padding: "16px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        color: "#f8fafc",
        width: "100%",
        maxWidth: 340,
      }}
    >
      {/* Title Header */}
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase" }}>
            {title}
          </div>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#38bdf8", boxShadow: "0 0 8px #38bdf8" }} />
        </div>
      )}

      {/* Main Analog Gauge Container */}
      <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative", width: 170, height: 170, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={170} height={170} viewBox="0 0 160 160">
            {/* Ambient Backlight Glow */}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(0, 136, 255, 0.08)" strokeWidth={strokeWidth + 12} />
            
            {/* Background Track Arc */}
            <path d={bgArcPath} fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth={strokeWidth} strokeLinecap="round" />
            
            {/* Active Vibrant Color-Corrected Arc */}
            <path
              d={activeArcPath}
              fill="none"
              stroke="url(#analogArcGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 8px rgba(0, 136, 255, 0.8))" }}
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="analogArcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0088ff" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>

            {/* Analog Needle Indicator */}
            <line
              x1={center}
              y1={center}
              x2={needleEndPos.x}
              y2={needleEndPos.y}
              stroke="#0088ff"
              strokeWidth={2.5}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 6px rgba(0, 136, 255, 0.9))" }}
            />

            {/* Center Cap Pin */}
            <circle cx={center} cy={center} r={6} fill="#ffffff" stroke="#0088ff" strokeWidth={2} style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />

            {/* Glowing Indicator Knob */}
            <circle cx={knobPos.x} cy={knobPos.y} r={7} fill="#0088ff" stroke="#ffffff" strokeWidth={2} style={{ filter: "drop-shadow(0 0 10px rgba(0, 136, 255, 1))" }} />
          </svg>

          {/* Outer Tick Numbers */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {ticks.map((t, i) => {
              const tickAngle = startAngle + (i / (ticks.length - 1)) * totalAngle;
              const pos = polarToCartesian(center, center, radius + 16, tickAngle);
              return (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: pos.x - 10,
                    top: pos.y - 8,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#94a3b8",
                    width: 20,
                    textAlign: "center",
                    fontFamily: "monospace",
                  }}
                >
                  {t}
                </span>
              );
            })}
          </div>

          {/* Central Value Readout */}
          <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", lineHeight: 1, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              {val}{unit}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", marginTop: 2 }}>
              {sublabel}
            </div>
          </div>

          {/* Bottom Angle Bounds (40° - 40°) */}
          <div style={{ position: "absolute", bottom: 12, width: "100%", display: "flex", justifyContent: "space-between", padding: "0 20px", fontSize: 10, fontWeight: 700, color: "#64748b" }}>
            <span>40°</span>
            <span>40°</span>
          </div>
        </div>

        {/* Stepper Buttons (- / +) */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", justifyContent: "center", marginTop: -6 }}>
          <button
            onClick={() => handleUpdate(val - step)}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              borderRadius: 12,
              width: 38,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <Minus size={14} />
          </button>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#cbd5e1", fontFamily: "monospace" }}>{val}{unit}</span>
          <button
            onClick={() => handleUpdate(val + step)}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              borderRadius: 12,
              width: 38,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Actions Row (Downforce+, Balance+, Drag-) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Actions</div>
        <div style={{ display: "flex", gap: 6, width: "100%" }}>
          {[
            { key: "downforce", label: "+ Downforce+", icon: <Zap size={11} /> },
            { key: "balance", label: "Balance+", icon: <Scale size={11} /> },
            { key: "drag", label: "- Drag-", icon: <Wind size={11} /> },
          ].map((act) => {
            const isActive = actionState === act.key;
            return (
              <button
                key={act.key}
                onClick={() => setActionState(act.key as any)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  padding: "8px 4px",
                  borderRadius: 12,
                  fontSize: 10,
                  fontWeight: 700,
                  background: isActive ? "#0088ff" : "rgba(255, 255, 255, 0.07)",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  border: isActive ? "1px solid rgba(255, 255, 255, 0.30)" : "1px solid rgba(255, 255, 255, 0.10)",
                  boxShadow: isActive ? "0 4px 16px rgba(0, 136, 255, 0.50)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {act.icon}
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls Section 1: Lightning & CFD Visualization Intensity */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1" }}>Lightning</span>
          {/* Custom Switch Toggle */}
          <button
            onClick={() => setLightningEnabled(!lightningEnabled)}
            style={{
              width: 36,
              height: 20,
              borderRadius: 12,
              background: lightningEnabled ? "#0088ff" : "rgba(255,255,255,0.15)",
              position: "relative",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#ffffff",
                position: "absolute",
                top: 2,
                left: lightningEnabled ? 18 : 2,
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>CFD Visualization Intensity</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={12} style={{ color: "#38bdf8" }} />
            <input
              type="range"
              min={0}
              max={100}
              value={cfdIntensity}
              onChange={(e) => setCfdIntensity(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#0088ff", cursor: "pointer" }}
            />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", width: 30, textAlign: "right" }}>{cfdIntensity}%</span>
          </div>
        </div>
      </div>

      {/* Controls Section 2: Wireframe & Last Login timestamp */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1" }}>CFD Visualization Intensity</span>
            <Info size={12} style={{ color: "#64748b" }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>Wireframe</span>
          <button
            onClick={() => setWireframeEnabled(!wireframeEnabled)}
            style={{
              width: 36,
              height: 20,
              borderRadius: 12,
              background: wireframeEnabled ? "#0088ff" : "rgba(255,255,255,0.15)",
              position: "relative",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#ffffff",
                position: "absolute",
                top: 2,
                left: wireframeEnabled ? 18 : 2,
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8, fontSize: 10, color: "#64748b" }}>
          <span>Last Logn at 8:02 AM</span>
          <button style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", cursor: "pointer" }}>
            <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
