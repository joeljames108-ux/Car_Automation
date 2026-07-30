import { useState } from "react";
import { Zap } from "lucide-react";

interface GlassSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  onChange?: (val: number) => void;
  icon?: React.ReactNode;
  step?: number;
}

export function GlassSlider({
  label = "CFD Visualization Intensity",
  value = 80,
  min = 0,
  max = 100,
  unit = "%",
  onChange,
  icon = <Zap size={13} style={{ color: "#0088ff" }} />,
  step = 1,
}: GlassSliderProps) {
  const [val, setVal] = useState(value);

  const handleChange = (newVal: number) => {
    setVal(newVal);
    if (onChange) onChange(newVal);
  };

  const percentage = ((val - min) / (max - min)) * 100;

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.14)",
        borderRadius: 20,
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        color: "#f1f5f9",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
      }}
    >
      {/* Label and Value Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, fontWeight: 600 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#e2e8f0" }}>
          {icon}
          <span>{label}</span>
        </div>
        <span style={{ fontWeight: 800, color: "#0088ff", fontFamily: "monospace" }}>
          {val}{unit}
        </span>
      </div>

      {/* Custom Gradient Track Slider Container */}
      <div style={{ position: "relative", height: 8, display: "flex", alignItems: "center" }}>
        {/* Background Track with Fill */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 4,
            background: `linear-gradient(to right, #0088ff 0%, #0088ff ${percentage}%, rgba(255, 255, 255, 0.15) ${percentage}%, rgba(255, 255, 255, 0.15) 100%)`,
            boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.3)",
          }}
        />

        {/* Real Range Input over top */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={(e) => handleChange(Number(e.target.value))}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
            margin: 0,
            zIndex: 10,
          }}
        />

        {/* Custom Glowing Thumb Knob */}
        <div
          style={{
            position: "absolute",
            left: `calc(${percentage}% - 9px)`,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#ffffff",
            border: "2px solid #0088ff",
            boxShadow: "0 0 10px rgba(0, 136, 255, 0.8), 0 2px 6px rgba(0, 0, 0, 0.4)",
            pointerEvents: "none",
            zIndex: 5,
            transition: "left 0.05s ease-out",
          }}
        />
      </div>
    </div>
  );
}
