import { useMemo } from "react";
import type { InteriorConfig } from "../../sim/types";
import { Navigation, Music, Thermometer, Shield, Zap, Sparkles, Volume2, Cpu } from "lucide-react";

interface RealisticDashboardPreviewProps {
  interior: InteriorConfig;
}

export function RealisticDashboardPreview({ interior }: RealisticDashboardPreviewProps) {
  const i = interior;
  const intColor = i.interiorColor || "#141722";
  const accColor = i.accentColor || "#0088ff";

  // Compute dashboard trim texture style based on dashboardMaterial
  const dashTextureStyle = useMemo(() => {
    switch (i.dashboardMaterial) {
      case "carbon_fiber":
        return {
          backgroundImage: `
            linear-gradient(45deg, rgba(0,0,0,0.4) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.4) 75%),
            linear-gradient(45deg, rgba(0,0,0,0.4) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.4) 75%)
          `,
          backgroundSize: "8px 8px",
          backgroundPosition: "0 0, 4px 4px",
        };
      case "wood":
        return {
          backgroundImage: "linear-gradient(90deg, rgba(160, 82, 45, 0.25) 0%, rgba(139, 69, 19, 0.4) 50%, rgba(160, 82, 45, 0.25) 100%)",
        };
      case "alcantara":
        return {
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 0%, transparent 80%)",
          filter: "contrast(1.1)",
        };
      case "aluminum":
        return {
          backgroundImage: "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(180, 200, 220, 0.05) 50%, rgba(255, 255, 255, 0.15) 100%)",
        };
      default:
        return {};
    }
  }, [i.dashboardMaterial]);

  // Screen width calculation based on infotainmentSize
  const screenWidth = Math.min(260, Math.max(140, (i.infotainmentSize || 10) * 16));

  return (
    <div
      className="realistic-dashboard-preview relative w-full overflow-hidden select-none"
      style={{
        height: 310,
        borderRadius: 20,
        background: `radial-gradient(ellipse 140% 100% at 50% 10%, ${intColor} 0%, #07090e 100%)`,
        border: "1.5px solid rgba(255, 255, 255, 0.20)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3)",
      }}
    >
      {/* ── 1. ROLL CAGE TUBULAR BARS (Background) ── */}
      {i.rollCage && i.rollCage !== "none" && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 600 310">
          <path d="M 40,20 L 560,20 L 580,280 L 20,280 Z" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
          <path d="M 60,30 L 280,200 M 540,30 L 320,200" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
          {i.rollCage === "full" || i.rollCage === "welded" ? (
            <line x1="50" y1="140" x2="550" y2="140" stroke="#94a3b8" strokeWidth="10" />
          ) : null}
        </svg>
      )}

      {/* ── 2. MAIN DASHBOARD LEATHER COWL ── */}
      <div
        className="absolute top-6 left-4 right-4 h-36 rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${intColor} 0%, rgba(10, 14, 22, 0.95) 100%)`,
          boxShadow: "0 12px 30px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.2)",
          ...dashTextureStyle,
        }}
      >
        {/* Leather Seam Stitching Line */}
        <div
          className="absolute top-2 left-6 right-6 h-0.5"
          style={{
            borderTop: `1.5px dashed ${accColor}`,
            opacity: 0.65,
          }}
        />

        {/* Ambient LED Fiber-Optic Strip */}
        <div
          className="absolute top-8 left-4 right-4 h-1 rounded-full transition-all duration-500"
          style={{
            backgroundColor: accColor,
            boxShadow: `0 0 ${16 * (i.ambientLighting ?? 0.8)}px ${accColor}, 0 0 ${30 * (i.ambientLighting ?? 0.8)}px ${accColor}`,
            opacity: Math.max(0.25, i.ambientLighting ?? 0.8),
          }}
        />

        {/* Anodized Air Vents */}
        <div className="absolute top-12 left-6 flex gap-3">
          {[1, 2].map((v) => (
            <div
              key={v}
              className="w-7 h-7 rounded-full flex items-center justify-center border border-white/30"
              style={{
                background: "radial-gradient(circle, #2d3748 0%, #0f172a 100%)",
                boxShadow: "inset 0 1px 3px rgba(255,255,255,0.3)",
              }}
            >
              <div className="w-5 h-0.5 bg-slate-400 rotate-45" />
            </div>
          ))}
        </div>

        <div className="absolute top-12 right-6 flex gap-3">
          {[1, 2].map((v) => (
            <div
              key={v}
              className="w-7 h-7 rounded-full flex items-center justify-center border border-white/30"
              style={{
                background: "radial-gradient(circle, #2d3748 0%, #0f172a 100%)",
                boxShadow: "inset 0 1px 3px rgba(255,255,255,0.3)",
              }}
            >
              <div className="w-5 h-0.5 bg-slate-400 -rotate-45" />
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. DIGITAL INSTRUMENT CLUSTER DISPLAY (Driver Side) ── */}
      <div
        className="absolute top-14 left-10 w-52 h-24 rounded-2xl border border-white/30 overflow-hidden flex flex-col justify-between p-2 shadow-xl"
        style={{
          background: "#080c14",
          boxShadow: `0 0 20px rgba(0, 136, 255, 0.15), inset 0 0 12px rgba(0,0,0,0.8)`,
        }}
      >
        <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 px-1">
          <span className="text-cyan-400 font-bold">APEX DIGITAL COCKPIT</span>
          <span style={{ color: accColor }} className="font-bold">SPORT+</span>
        </div>

        {/* Cluster Gauges Display */}
        <div className="flex items-center justify-between px-2 my-auto">
          {/* Speedometer readout */}
          <div className="flex flex-col items-center">
            <span className="text-lg font-black font-mono text-white leading-none">184</span>
            <span className="text-[7px] font-mono text-slate-400">km/h</span>
          </div>

          {/* RPM Dial Arc Graphic */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <circle cx="20" cy="20" r="15" fill="none" stroke="#1e293b" strokeWidth="3" />
              <circle
                cx="20" cy="20" r="15" fill="none"
                stroke={accColor} strokeWidth="3"
                strokeDasharray="94" strokeDashoffset="28"
                strokeLinecap="round"
              />
              <line x1="20" y1="20" x2="28" y2="10" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="absolute text-[8px] font-bold font-mono text-white">7.2k</span>
          </div>

          {/* Gear badge */}
          <div className="flex flex-col items-center">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs text-white border"
              style={{ backgroundColor: `${accColor}30`, borderColor: accColor }}
            >
              3
            </div>
            <span className="text-[7px] font-mono text-slate-400 mt-0.5">GEAR</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[7px] font-mono text-slate-500 px-1">
          <span>TIRE: 2.4 BAR</span>
          <span>G-FORCE: 1.25G</span>
        </div>
      </div>

      {/* ── 4. SPORT STEERING WHEEL WITH PADDLE SHIFTERS ── */}
      <div className="absolute top-10 left-16 z-20 flex items-center justify-center pointer-events-none">
        {/* Paddle Shifters behind wheel */}
        <div className="absolute -left-6 top-6 w-3 h-10 rounded-l-md bg-slate-700 border border-slate-500 flex items-center justify-center text-[8px] font-bold text-slate-300">
          -
        </div>
        <div className="absolute -right-6 top-6 w-3 h-10 rounded-r-md bg-slate-700 border border-slate-500 flex items-center justify-center text-[8px] font-bold text-slate-300">
          +
        </div>

        {/* Wheel Ring Outer */}
        <div
          className="relative w-36 h-36 rounded-full border-8 flex items-center justify-center shadow-2xl"
          style={{
            borderColor: i.steeringMaterial === "carbon" ? "#1e293b" : "#0f172a",
            background: "radial-gradient(circle, transparent 55%, rgba(0,0,0,0.6) 100%)",
            borderRadius: i.steeringWheel === "flat_bottom" ? "50% 50% 40% 40%" : "50%",
            boxShadow: "0 10px 25px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.2)",
          }}
        >
          {/* Top Rev Marker Indicator */}
          <div
            className="absolute top-0 w-4 h-1.5 rounded-full"
            style={{ backgroundColor: accColor, boxShadow: `0 0 6px ${accColor}` }}
          />

          {/* Steering Wheel Center Spokes & Emblem */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-slate-600 flex items-center justify-center shadow-inner relative">
            {/* Center Emblem */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border font-black text-[9px] text-white shadow-md"
              style={{ backgroundColor: accColor, borderColor: "#ffffff" }}
            >
              APEX
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. CENTRAL INFOTAINMENT TOUCHSCREEN DISPLAY ── */}
      <div
        className="absolute top-14 left-1/2 -translate-x-1/2 rounded-2xl border border-white/30 overflow-hidden flex flex-col p-2.5 shadow-2xl transition-all duration-300 z-10"
        style={{
          width: screenWidth,
          height: 110,
          background: "linear-gradient(135deg, #0b101d 0%, #060911 100%)",
          boxShadow: `0 12px 36px rgba(0, 0, 0, 0.6), 0 0 16px ${accColor}30`,
        }}
      >
        {/* Top Status Bar */}
        <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 mb-1 border-b border-white/10 pb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-bold">18:24</span>
          </div>
          <div className="flex items-center gap-2">
            {i.hasNav && <Navigation size={9} className="text-cyan-400" />}
            {i.hasPremiumAudio && <Volume2 size={9} className="text-purple-400" />}
            {i.climateControl && <Thermometer size={9} className="text-amber-400" />}
          </div>
        </div>

        {/* Screen Content: GPS Map & Media Panel */}
        <div className="flex-1 grid grid-cols-2 gap-2 items-center">
          {/* Navigation preview map */}
          <div className="h-full rounded-lg bg-slate-900 border border-white/10 relative overflow-hidden flex flex-col justify-between p-1.5">
            <div className="text-[7px] font-mono text-cyan-400 font-bold flex items-center gap-1">
              <Navigation size={8} /> ROUTE 3D
            </div>
            {/* GPS Vector Line */}
            <svg viewBox="0 0 80 40" className="w-full h-8">
              <path d="M 5 35 Q 30 10 50 25 T 75 5" fill="none" stroke={accColor} strokeWidth="2" strokeDasharray="3 1" />
              <circle cx="75" cy="5" r="2.5" fill="#34d399" />
            </svg>
            <div className="text-[7px] font-mono text-slate-300">2.4 km ahead</div>
          </div>

          {/* Media & Climate Stats */}
          <div className="h-full flex flex-col justify-between p-1">
            <div className="flex items-center gap-1 text-[8px] font-mono text-purple-300 truncate">
              <Music size={9} /> APEX Studio HD
            </div>
            <div className="flex items-center gap-1 text-[8px] font-mono text-amber-300">
              <Thermometer size={9} /> 21.5°C DUAL AUTO
            </div>
            <div className="w-full bg-base-800 h-1.5 rounded-full overflow-hidden border border-white/10">
              <div className="h-full rounded-full" style={{ width: "70%", backgroundColor: accColor }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. CENTER CONSOLE SHIFTER TUNNEL ── */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-24 rounded-t-3xl border-t border-x border-white/20 flex flex-col items-center justify-start pt-2"
        style={{
          background: `linear-gradient(180deg, rgba(20, 26, 38, 0.95) 0%, rgba(8, 11, 18, 0.98) 100%)`,
          boxShadow: "inset 0 2px 4px rgba(255,255,255,0.15)",
        }}
      >
        {/* Shift Knob */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-400 flex items-center justify-center shadow-lg relative">
          <div
            className="w-4 h-4 rounded-full border flex items-center justify-center text-[7px] font-mono font-bold text-white"
            style={{ backgroundColor: accColor, borderColor: "#ffffff" }}
          >
            P
          </div>
        </div>

        {/* Aluminum Pedals Preview */}
        <div className="flex gap-3 mt-2">
          <div className="w-3 h-5 rounded-t bg-slate-600 border border-slate-400" />
          <div className="w-4 h-6 rounded-t bg-slate-500 border border-slate-300" />
        </div>
      </div>

      {/* ── 7. LUXURY SPORT BUCKET SEATS (Bottom Perspective) ── */}
      <div className="absolute bottom-2 left-6 right-6 flex justify-between pointer-events-none z-10">
        {/* Driver Seat */}
        <div
          className="w-24 h-28 rounded-t-3xl border-2 flex flex-col items-center justify-between p-2 shadow-2xl relative"
          style={{
            background: `linear-gradient(180deg, ${intColor} 0%, rgba(15, 20, 30, 0.95) 100%)`,
            borderColor: i.seatType === "carbon_bucket" || i.seatType === "racing_shell" ? accColor : "rgba(255,255,255,0.3)",
            boxShadow: `0 -6px 20px rgba(0,0,0,0.5), inset 0 0 10px ${accColor}25`,
          }}
        >
          {/* Seat Headrest */}
          <div className="w-12 h-6 rounded-xl border border-white/20 flex items-center justify-center text-[7px] font-mono text-slate-300 font-bold" style={{ backgroundColor: `${accColor}20` }}>
            APEX
          </div>
          {/* Harness Slots if racing harness enabled */}
          {i.racingHarness && (
            <div className="flex gap-2">
              <div className="w-2 h-4 rounded bg-red-600 border border-red-400" />
              <div className="w-2 h-4 rounded bg-red-600 border border-red-400" />
            </div>
          )}
          {/* Contrast Stitching */}
          <div className="w-full h-0.5 border-t border-dashed" style={{ borderColor: accColor }} />
        </div>

        {/* Passenger Seat */}
        <div
          className="w-24 h-28 rounded-t-3xl border-2 flex flex-col items-center justify-between p-2 shadow-2xl relative"
          style={{
            background: `linear-gradient(180deg, ${intColor} 0%, rgba(15, 20, 30, 0.95) 100%)`,
            borderColor: i.seatType === "carbon_bucket" || i.seatType === "racing_shell" ? accColor : "rgba(255,255,255,0.3)",
            boxShadow: `0 -6px 20px rgba(0,0,0,0.5), inset 0 0 10px ${accColor}25`,
          }}
        >
          {/* Seat Headrest */}
          <div className="w-12 h-6 rounded-xl border border-white/20 flex items-center justify-center text-[7px] font-mono text-slate-300 font-bold" style={{ backgroundColor: `${accColor}20` }}>
            APEX
          </div>
          {/* Harness Slots if racing harness enabled */}
          {i.racingHarness && (
            <div className="flex gap-2">
              <div className="w-2 h-4 rounded bg-red-600 border border-red-400" />
              <div className="w-2 h-4 rounded bg-red-600 border border-red-400" />
            </div>
          )}
          {/* Contrast Stitching */}
          <div className="w-full h-0.5 border-t border-dashed" style={{ borderColor: accColor }} />
        </div>
      </div>

      {/* ── 8. SAFETY EQUIPMENT (Fire Extinguisher, Window Net) ── */}
      {i.fireExtinguisher && (
        <div className="absolute bottom-4 right-32 z-20 flex items-center gap-1 bg-red-600 border border-red-400 rounded-lg px-1.5 py-0.5 text-[7px] font-mono text-white font-bold shadow-md">
          <Shield size={8} /> FIRE EXT
        </div>
      )}

      {/* ── 9. REALISM BADGE OVERLAY ── */}
      <div className="absolute top-2 right-3 z-30 flex items-center gap-1.5 bg-black/50 border border-white/20 rounded-full px-2.5 py-0.5 backdrop-blur-md text-[9px] font-mono text-slate-200">
        <Sparkles size={10} className="text-cyan-400 animate-spin" />
        <span>3D COCKPIT PREVIEW</span>
      </div>
    </div>
  );
}
