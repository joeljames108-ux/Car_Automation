import { useState } from "react";
import { ModernAnalogDial } from "./ModernAnalogDial";
import { ModernAnalogClock } from "./ModernAnalogClock";
import { EngineeringLog } from "../EngineeringLog";
import { CFDView } from "./CFDView";
import { useDesign } from "../../state/DesignContext";
import { SlidersHorizontal, Camera, Activity, HelpCircle, User, Bot } from "lucide-react";

export function SpatialReferenceSuite() {
  const { design, sim, updateAeroResearch } = useDesign();
  const [rideHeight, setRideHeight] = useState(105);
  const [cameraSmart, setCameraSmart] = useState(true);
  const [timePeriod, setTimePeriod] = useState<"monthly" | "weekly">("monthly");
  const [activeTab, setActiveTab] = useState("Suspension");

  return (
    <div
      className="spatial-reference-suite w-full"
      style={{
        position: "relative",
        borderRadius: 28,
        padding: "16px",
        background: "rgba(22, 28, 38, 0.60)",
        backdropFilter: "blur(60px) saturate(190%)",
        WebkitBackdropFilter: "blur(60px) saturate(190%)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        boxShadow: "0 32px 100px rgba(0, 0, 0, 0.50), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Top Main Grid Layout (Reference Photo Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Column 1 (Left): AERODYNAMIC PROFILE Dial Card */}
        <div className="lg:col-span-3 flex justify-center">
          <ModernAnalogDial
            title="AERODYNAMIC PROFILE"
            value={19}
            min={0}
            max={40}
            unit="°"
            sublabel="L/D"
            ticks={["3.5", "3.0", "2.5", "2.0", "2.5", "3.0", "3.5"]}
          />
        </div>

        {/* Column 2 (Center): CFD Live Simulation Window + 3 Sub-Cards */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* CFD Wind Tunnel Live View */}
          <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
            <CFDView
              aero={design.vehicle.aero}
              dragCoeff={sim.dragCoeff}
              liftCoeff={sim.liftCoeff}
              downforce={sim.downforce}
            />
          </div>

          {/* Bottom Row 3 Cards: Vehicle Configuration | CFD Lab Data | Aero Forces over Velocity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1: VEHICLE CONFIGURATION */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.07)",
                backdropFilter: "blur(30px)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                borderRadius: 20,
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase" }}>
                VEHICLE CONFIGURATION
              </div>

              {/* Technical 3D Suspension Diagram */}
              <div style={{ position: "relative", height: 80, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
                <svg width="120" height="70" viewBox="0 0 120 70">
                  <path d="M20 50 L40 30 L80 30 L100 50 M40 30 L40 15 L80 15 L80 30" stroke="#38bdf8" strokeWidth="2" fill="none" />
                  <circle cx="20" cy="50" r="10" fill="none" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="20" y1="50" x2="40" y2="30" stroke="#34d399" strokeWidth="2" />
                  <line x1="80" y1="30" x2="100" y2="50" stroke="#34d399" strokeWidth="2" />
                </svg>
              </div>

              {/* Ride Height Slider */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#cbd5e1" }}>Ride Height (mm)</span>
                  {/* Blue Toggle Switch */}
                  <button
                    onClick={() => setRideHeight(rideHeight === 105 ? 85 : 105)}
                    style={{
                      width: 30,
                      height: 16,
                      borderRadius: 10,
                      background: "#0088ff",
                      position: "relative",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: 16 }} />
                  </button>
                </div>
                <input
                  type="range"
                  min={60}
                  max={160}
                  value={rideHeight}
                  onChange={(e) => setRideHeight(Number(e.target.value))}
                  style={{ accentColor: "#0088ff", width: "100%", cursor: "pointer" }}
                />
              </div>

              {/* White Pill Input Element */}
              <div style={{ background: "#ffffff", color: "#0f172a", borderRadius: 14, padding: "6px 12px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Standard Aero Mode</span>
                <span style={{ fontSize: 10, color: "#64748b" }}>✓</span>
              </div>
            </div>

            {/* Card 2: CFD LAB DATA */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.07)",
                backdropFilter: "blur(30px)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                borderRadius: 20,
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase" }}>
                CFD LAB DATA
              </div>

              <div style={{ fontSize: 11, color: "#cbd5e1", lineHeight: 1.4 }}>
                <div>Drag Cd: <span style={{ fontWeight: 800, color: "#ffffff" }}>{sim.dragCoeff.toFixed(3)}</span></div>
                <div>Front/Rear Lift: <span style={{ fontWeight: 800, color: "#34d399" }}>+0.067 / +0.101</span></div>
              </div>

              {/* Camera ISmart Cam Toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.05)", padding: "6px 10px", borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#ffffff" }}>Camera</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>ISmart Cam</div>
                </div>
                <button
                  onClick={() => setCameraSmart(!cameraSmart)}
                  style={{
                    width: 32,
                    height: 18,
                    borderRadius: 10,
                    background: cameraSmart ? "#0088ff" : "rgba(255,255,255,0.2)",
                    position: "relative",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: cameraSmart ? 16 : 2 }} />
                </button>
              </div>

              {/* Wireframe Vehicle Thumbnail Box */}
              <div style={{ height: 60, background: "#000000", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="100" height="40" viewBox="0 0 100 40">
                  <path d="M10 28 L30 15 L70 15 L90 28 Z" stroke="#38bdf8" strokeWidth="1" fill="none" strokeDasharray="2 2" />
                  <circle cx="25" cy="28" r="6" stroke="#38bdf8" fill="none" />
                  <circle cx="75" cy="28" r="6" stroke="#38bdf8" fill="none" />
                </svg>
              </div>
            </div>

            {/* Card 3: AERO FORCES OVER VELOCITY */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.07)",
                backdropFilter: "blur(30px)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                borderRadius: 20,
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase" }}>
                  AERO FORCES OVER VELOCITY
                </div>
                <HelpCircle size={12} style={{ color: "#64748b" }} />
              </div>

              {/* Time Period Filter Pills (Monthly / Weekly) */}
              <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.08)", padding: 2, borderRadius: 10, width: "fit-content" }}>
                <button
                  onClick={() => setTimePeriod("monthly")}
                  style={{
                    padding: "2px 10px",
                    borderRadius: 8,
                    fontSize: 9,
                    fontWeight: 700,
                    background: timePeriod === "monthly" ? "#ffffff" : "transparent",
                    color: timePeriod === "monthly" ? "#0f172a" : "#94a3b8",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimePeriod("weekly")}
                  style={{
                    padding: "2px 10px",
                    borderRadius: 8,
                    fontSize: 9,
                    fontWeight: 700,
                    background: timePeriod === "weekly" ? "#ffffff" : "transparent",
                    color: timePeriod === "weekly" ? "#0f172a" : "#94a3b8",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Weekly
                </button>
              </div>

              {/* Visual Bar & Multi-Line Chart (Matching Reference Image) */}
              <div style={{ position: "relative", height: 95, width: "100%" }}>
                <svg width="100%" height="100%" viewBox="0 0 200 95" preserveAspectRatio="none">
                  {/* Vertical bar series */}
                  {[30, 45, 60, 80, 65].map((h, i) => (
                    <rect
                      key={i}
                      x={20 + i * 36}
                      y={90 - h}
                      width={18}
                      height={h}
                      rx={4}
                      fill="rgba(255, 255, 255, 0.12)"
                    />
                  ))}
                  {/* Blue Line Curve */}
                  <path d="M 10 70 Q 60 50 110 65 T 190 30" fill="none" stroke="#0088ff" strokeWidth="2.5" />
                  {/* Red Line Curve */}
                  <path d="M 10 35 Q 60 55 110 75 T 190 85" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                  {/* Green Line Curve */}
                  <path d="M 10 80 Q 60 70 110 40 T 190 20" fill="none" stroke="#34d399" strokeWidth="2.5" />
                </svg>

                {/* X Axis Month Labels */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#94a3b8", fontFamily: "monospace", marginTop: 2 }}>
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3 (Right): ENGINEERING LOG Panel */}
        <div className="lg:col-span-3">
          <EngineeringLog />
        </div>
      </div>

      {/* Floating Bottom Navigation Capsule Bar (Matching Reference Image) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(30px) saturate(190%)",
          WebkitBackdropFilter: "blur(30px) saturate(190%)",
          borderRadius: 28,
          padding: "6px 12px",
          width: "max-content",
          margin: "0 auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          {["Suspension", "Chassis", "Aero", "Powertrain", "Brakes"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: isActive ? 800 : 500,
                  background: isActive ? "#ffffff" : "transparent",
                  color: isActive ? "#0f172a" : "#475569",
                  boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Avatar badge */}
        <div style={{ marginLeft: 12, width: 28, height: 28, borderRadius: "50%", background: "#0088ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <User size={16} />
        </div>
      </div>

      {/* Floating Bottom-Right Apex AI Button (Matching Reference Image) */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 24,
          zIndex: 30,
          background: "rgba(22, 28, 38, 0.85)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255, 255, 255, 0.20)",
          borderRadius: 20,
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 700,
          color: "#ffffff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <Bot size={14} style={{ color: "#38bdf8" }} />
        <span>Apex AI</span>
        <span style={{ background: "#ef4444", color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
          1
        </span>
      </div>
    </div>
  );
}
