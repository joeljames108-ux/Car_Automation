import { useState, useEffect } from "react";

interface ModernAnalogClockProps {
  size?: number;
  variant?: "wall-light" | "glass-dark" | "minimal-cyan";
  showLiveBadge?: boolean;
  label?: string;
}

export function ModernAnalogClock({
  size = 110,
  variant = "wall-light",
  showLiveBadge = true,
  label = "STUDIO CLOCK",
}: ModernAnalogClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  // Degrees
  const secondDeg = (seconds / 60) * 360;
  const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = ((hours + minutes / 60) / 12) * 360;

  // Colors based on variant
  const isLight = variant === "wall-light";
  const bgColor = isLight
    ? "radial-gradient(circle, #ffffff 0%, #e2e8f0 100%)"
    : variant === "glass-dark"
    ? "rgba(15, 23, 42, 0.85)"
    : "rgba(11, 19, 36, 0.90)";

  const borderColor = isLight ? "rgba(255, 255, 255, 0.80)" : "rgba(56, 189, 248, 0.35)";
  const tickColor = isLight ? "#334155" : "#94a3b8";
  const hourHandColor = isLight ? "#0f172a" : "#f8fafc";
  const minHandColor = isLight ? "#1e293b" : "#38bdf8";
  const secHandColor = "#ef4444"; // Red second hand as seen in reference image

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        position: "relative",
      }}
    >
      {/* Live Badge if enabled */}
      {showLiveBadge && (
        <div
          style={{
            position: "absolute",
            top: -6,
            left: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.20)",
            borderRadius: 20,
            padding: "2px 8px",
            fontSize: 10,
            fontWeight: 800,
            color: "#f8fafc",
            boxShadow: "0 4px 12px rgba(0,0,0,0.30)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              boxShadow: "0 0 8px #ef4444",
              display: "inline-block",
              animation: "pulse 1.5s infinite",
            }}
          />
          <span style={{ letterSpacing: "0.05em" }}>LIVE</span>
        </div>
      )}

      {/* Modern Analog Clock Frame */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: bgColor,
          border: `2px solid ${borderColor}`,
          boxShadow: isLight
            ? "0 12px 28px rgba(0, 0, 0, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.90), inset 0 -2px 6px rgba(0, 0, 0, 0.15)"
            : "0 12px 32px rgba(0, 0, 0, 0.50), inset 0 1px 1px rgba(255, 255, 255, 0.20)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Clock Dial Markings */}
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
          {/* Outer ring */}
          <circle cx="50" cy="50" r="48" fill="none" stroke={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)"} strokeWidth="1" />
          
          {/* Hour tick lines (12 ticks) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 50 + 38 * Math.sin(angle);
            const y1 = 50 - 38 * Math.cos(angle);
            const x2 = 50 + 44 * Math.sin(angle);
            const y2 = 50 - 44 * Math.cos(angle);
            const isQuarter = i % 3 === 0;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={tickColor}
                strokeWidth={isQuarter ? 2.5 : 1.2}
                strokeLinecap="round"
                opacity={isQuarter ? 0.95 : 0.6}
              />
            );
          })}

          {/* Minute dots (60 dots) */}
          {Array.from({ length: 60 }).map((_, i) => {
            if (i % 5 === 0) return null; // skip hour ticks
            const angle = (i * 6 * Math.PI) / 180;
            const cx = 50 + 42 * Math.sin(angle);
            const cy = 50 - 42 * Math.cos(angle);
            return <circle key={i} cx={cx} cy={cy} r="0.6" fill={tickColor} opacity="0.4" />;
          })}
        </svg>

        {/* Hour Hand */}
        <div
          style={{
            position: "absolute",
            width: Math.max(3, size * 0.045),
            height: size * 0.28,
            backgroundColor: hourHandColor,
            borderRadius: 4,
            top: `calc(50% - ${size * 0.28}px)`,
            left: `calc(50% - ${Math.max(3, size * 0.045) / 2}px)`,
            transformOrigin: "bottom center",
            transform: `rotate(${hourDeg}deg)`,
            transition: "transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            zIndex: 3,
          }}
        />

        {/* Minute Hand */}
        <div
          style={{
            position: "absolute",
            width: Math.max(2, size * 0.032),
            height: size * 0.38,
            backgroundColor: minHandColor,
            borderRadius: 3,
            top: `calc(50% - ${size * 0.38}px)`,
            left: `calc(50% - ${Math.max(2, size * 0.032) / 2}px)`,
            transformOrigin: "bottom center",
            transform: `rotate(${minuteDeg}deg)`,
            transition: "transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
            zIndex: 4,
          }}
        />

        {/* Second Hand (Red Sweep) */}
        <div
          style={{
            position: "absolute",
            width: 1.5,
            height: size * 0.44,
            backgroundColor: secHandColor,
            borderRadius: 1,
            top: `calc(50% - ${size * 0.44}px)`,
            left: "calc(50% - 0.75px)",
            transformOrigin: "bottom center",
            transform: `rotate(${secondDeg}deg)`,
            transition: "transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
            boxShadow: "0 0 6px rgba(239, 68, 68, 0.6)",
            zIndex: 5,
          }}
        />

        {/* Center Cap Pin */}
        <div
          style={{
            width: Math.max(6, size * 0.08),
            height: Math.max(6, size * 0.08),
            borderRadius: "50%",
            backgroundColor: isLight ? "#0f172a" : "#ffffff",
            border: `2px solid ${secHandColor}`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
            zIndex: 6,
          }}
        />
      </div>

      {label && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#94a3b8",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
