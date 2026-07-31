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
      className="glass-slider-card"
      style={{
        background: "rgba(255, 252, 245, 0.58)",
        backdropFilter: "blur(40px) saturate(210%)",
        WebkitBackdropFilter: "blur(40px) saturate(210%)",
        border: "1px solid rgba(255, 255, 255, 0.75)",
        borderRadius: 20,
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        color: "#1c1c1e",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.90)",
      }}
    >
      {/* Label and Value Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, fontWeight: 700 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#1c1c1e" }}>
          {icon}
          <span>{label}</span>
        </div>
        <span style={{ fontWeight: 800, color: "#007aff", fontFamily: "monospace" }}>
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
            background: `linear-gradient(to right, #007aff 0%, #007aff ${percentage}%, rgba(0, 0, 0, 0.08) ${percentage}%, rgba(0, 0, 0, 0.08) 100%)`,
            boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.10)",
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
            border: "2px solid #007aff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15), 0 0 10px rgba(0, 122, 255, 0.3)",
            pointerEvents: "none",
            zIndex: 5,
            transition: "left 0.05s ease-out",
          }}
        />
      </div>
    </div>
  );
}
