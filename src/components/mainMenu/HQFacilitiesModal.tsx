import React from "react";
import { X, Building2, Wind, Factory, Wrench, ShieldCheck, Trophy, Sparkles, ChevronRight } from "lucide-react";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";

interface HQFacilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStage?: (stage: string) => void;
}

export const HQFacilitiesModal: React.FC<HQFacilitiesModalProps> = ({ isOpen, onClose, onSelectStage }) => {
  const cash = useCompanyFinanceStore((s) => s.cash);

  if (!isOpen) return null;

  const facilities = [
    {
      id: "fac_admin",
      name: "Corporate Executive Pavilion",
      level: 2,
      tier: "Mid-Century Modern Brick & Glass (1978)",
      effect: "+15% Management Efficiency, 40 Staff capacity",
      status: "Operational",
      icon: <Building2 size={18} className="text-amber-400" />,
    },
    {
      id: "fac_rd",
      name: "Engineering & Dyno Research Center",
      level: 3,
      tier: "Soundproof Transient Dyno Bays & Cleanroom",
      effect: "+22% R&D Speed, Turbo & EFI Tuning Unlocked",
      status: "Operational",
      icon: <Wrench size={18} className="text-cyan-400" />,
    },
    {
      id: "fac_tunnel",
      name: "Subsonic Wind Tunnel Complex",
      level: 1,
      tier: "1/4 Scale Smoke Streamline Testing",
      effect: "+10% Downforce Calculation Accuracy",
      status: "Upgrade Available",
      icon: <Wind size={18} className="text-emerald-400" />,
    },
    {
      id: "fac_factory",
      name: "Main Chassis Stamping & Assembly Plant",
      level: 2,
      tier: "Overhead Gantry & 2 Manual Assembly Lines",
      effect: "120 Units / Month max capacity",
      status: "Operational",
      icon: <Factory size={18} className="text-indigo-400" />,
    },
    {
      id: "fac_track",
      name: "Proving Grounds & Handling Circuit",
      level: 2,
      tier: "2.8 km Paved Handling Loop with High-Speed Banking",
      effect: "Enables Track Telemetry & Suspension Damping Trials",
      status: "Operational",
      icon: <Trophy size={18} className="text-red-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.15)"
        }}
      >
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Company HQ & Campus Facilities
              </h2>
              <p className="text-xs text-slate-400">
                Plot Grid: Sector 4 • Alpine Valley Valley Proving Grounds (1978 Era)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {/* Panoramic Campus Preview Banner */}
          <div className="relative h-44 rounded-xl overflow-hidden border border-white/10 shadow-lg">
            <img 
              src="/assets/main_menu/campus_hero.jpg" 
              alt="Company Campus" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-4">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
                CAMPUS MASTER PLAN
              </span>
              <h3 className="text-base font-bold text-white">
                Stuttgart Engineering & Proving Grounds Campus
              </h3>
              <p className="text-xs text-slate-300">
                12 Active Plots • 5 Operational Facilities • 2 Expansion Plots Ready for Purchase
              </p>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Facility Inventory & Operations
          </div>

          <div className="space-y-3">
            {facilities.map((fac) => (
              <div
                key={fac.id}
                className="p-3.5 rounded-xl border bg-slate-800/40 border-slate-700/60 hover:border-cyan-400/50 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                    {fac.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{fac.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-700/60 text-slate-300 border border-slate-600">
                        LVL {fac.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{fac.tier}</p>
                    <span className="text-[11px] font-semibold text-emerald-400 block mt-0.5">{fac.effect}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono ${
                    fac.status === "Operational"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {fac.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>* 14 Top-Level Campus Units • 13 HQ Buildings + 1 Manufacturing Plant</span>
          <div className="flex items-center gap-2">
            {onSelectStage && (
              <button
                onClick={() => {
                  onClose();
                  onSelectStage("hq");
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Building2 size={13} /> LAUNCH 3D CAMPUS MAP
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
