import React from "react";
import { NeonEntrance } from "./useNeonEntrance";
import { Navigation, Music, Thermometer, Sparkles, Volume2 } from "lucide-react";

export function NeonRealisticDashboardPreview({ interior }: { interior: any }) {
  const i = interior;
  const ic = i.interiorColor || "#141722";
  const ac = i.accentColor || "#8fb9d9";
  const sw = Math.min(260, Math.max(140, (i.infotainmentSize || 10) * 16));
  return (
    <NeonEntrance type="glow-burst" className="relative w-full overflow-hidden rounded-2xl" style={{ height: 310, background: "radial-gradient(ellipse 140% 100% at 50% 10%, " + ic + " 0%, #07090e 100%)", border: "1.5px solid rgba(255,255,255,0.15)" }}>
      <div className="absolute top-6 left-4 right-4 h-36 rounded-3xl border border-white/15 overflow-hidden" style={{ background: "linear-gradient(180deg, " + ic + ", rgba(10,14,22,0.95))" }}>
        <div className="absolute top-8 left-4 right-4 h-1 rounded-full" style={{ backgroundColor: ac, opacity: 0.55 }} />
      </div>
      <div className="absolute top-14 left-10 w-52 h-24 rounded-2xl border border-white/20 overflow-hidden flex flex-col justify-between p-2" style={{ background: "#080c14" }}>
        <div className="text-[8px] font-mono text-sky-400 font-bold px-1">NEON DIGITAL COCKPIT</div>
        <div className="flex items-center justify-between px-2 my-auto">
          <div className="text-lg font-black font-mono text-white">184<span className="text-[7px] text-slate-400 ml-1">km/h</span></div>
          <svg viewBox="0 0 40 40" className="w-10 h-10"><circle cx="20" cy="20" r="15" fill="none" stroke="#1e293b" strokeWidth="3" /><circle cx="20" cy="20" r="15" fill="none" stroke={ac} strokeWidth="3" strokeDasharray="94" strokeDashoffset="28" strokeLinecap="round" /></svg>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs text-white border" style={{ backgroundColor: ac + "30", borderColor: ac }}>3</div>
        </div>
      </div>
      <div className="absolute top-10 left-16 z-20 pointer-events-none">
        <div className="relative w-36 h-36 rounded-full border-8 flex items-center justify-center" style={{ borderColor: "#1e293b", background: "radial-gradient(circle, transparent 55%, rgba(0,0,0,0.6))" }}>
          <div className="absolute top-0 w-4 h-1.5 rounded-full" style={{ backgroundColor: ac }} />
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-slate-600 flex items-center justify-center"><div className="w-7 h-7 rounded-full flex items-center justify-center border font-black text-[9px] text-white" style={{ backgroundColor: ac }}>NEON</div></div>
        </div>
      </div>
      <div className="absolute bottom-2 left-6 right-6 flex justify-between pointer-events-none z-10">
        {["D","P"].map(function(s){return (
          <div key={s} className="w-24 h-28 rounded-t-3xl border-2 flex flex-col items-center justify-between p-2" style={{ background: "linear-gradient(180deg, " + ic + ", rgba(15,20,30,0.95))", borderColor: i.seatType === "carbon_bucket" ? ac : "rgba(255,255,255,0.25)" }}>
            <div className="w-12 h-6 rounded-xl border border-white/15 flex items-center justify-center text-[7px] font-mono text-slate-300 font-bold" style={{ backgroundColor: ac + "20" }}>NEON</div>
            <div className="w-full h-0.5 border-t border-dashed" style={{ borderColor: ac }} />
          </div>
        )})}
      </div>
      <div className="absolute top-2 right-3 z-30 flex items-center gap-1.5 bg-black/50 border border-white/15 rounded-full px-2.5 py-0.5 backdrop-blur-md text-[9px] font-mono text-slate-200"><Sparkles size={10} className="text-sky-400 animate-spin" style={{ animationDuration: "3s" }} /><span>NEON COCKPIT</span></div>
    </NeonEntrance>
  );
}