// ===================================================================
// HQ INFRASTRUCTURE PANEL — R&D Facilities & Headquarters Upgrades
// ===================================================================
import { useState, memo } from "react";
import { Building2, Zap, Wind, Cpu, Gauge, Users, Wrench, Shield, CheckCircle } from "lucide-react";
import { useCompany } from "../../state/CompanyContext";
import type { MotorsportTeam } from "../../sim/types";

const DEFAULT_BUILDINGS = [
  { id: "wind_tunnel", name: "Wind Tunnel", level: 2, maxLevel: 5, desc: "+10% Downforce R&D efficiency", effect: "Aero development speed +15%", cost: 10_000_000, icon: <Wind size={16} className="text-cyan-400" /> },
  { id: "cfd_supercomputer", name: "CFD Supercomputer", level: 1, maxLevel: 5, desc: "+8% Drag reduction modeling", effect: "Drag coefficient optimization +12%", cost: 8_000_000, icon: <Cpu size={16} className="text-purple-400" /> },
  { id: "design_center", name: "Design Center", level: 2, maxLevel: 5, desc: "Unlocks breakthrough high-risk aero projects", effect: "Component pace ceiling +20", cost: 12_000_000, icon: <Wrench size={16} className="text-amber-400" /> },
  { id: "telemetry_lab", name: "Telemetry & Data Lab", level: 1, maxLevel: 5, desc: "+10% Tire wear simulation precision", effect: "Race strategy predictability +25%", cost: 6_000_000, icon: <Gauge size={16} className="text-blue-400" /> },
  { id: "driver_simulator", name: "Driver Simulator", level: 2, maxLevel: 5, desc: "+2 Driver skill gain per season", effect: "Driver wet & consistency training +18%", cost: 15_000_000, icon: <Zap size={16} className="text-yellow-400" /> },
  { id: "parts_factory", name: "Parts Factory", level: 1, maxLevel: 5, desc: "+20% Component manufacturing speed", effect: "Spare parts fabrication turnaround -50%", cost: 10_000_000, icon: <Building2 size={16} className="text-emerald-400" /> },
  { id: "scouting_hq", name: "Scouting Headquarters", level: 1, maxLevel: 5, desc: "Reveals hidden talent stats globally", effect: "Rookie potential detection +30%", cost: 5_000_000, icon: <Users size={16} className="text-pink-400" /> },
  { id: "staff_lounge", name: "Staff Facilities & Lounge", level: 2, maxLevel: 5, desc: "+10 Team morale & lower salary demands", effect: "Pit crew retention +20%", cost: 4_000_000, icon: <Shield size={16} className="text-teal-400" /> },
];

export const HQInfrastructurePanel = memo(function HQInfrastructurePanel({ selectedTeam }: { selectedTeam: MotorsportTeam | null }) {
  const { company } = useCompany();
  const [buildings, setBuildings] = useState(DEFAULT_BUILDINGS);
  const [upgradedId, setUpgradedId] = useState<string | null>(null);

  const availableFunds = selectedTeam ? selectedTeam.budget : (company.totalRevenue || 50_000_000);

  const handleUpgrade = (id: string, cost: number) => {
    if (availableFunds < cost) return;
    setBuildings(prev => prev.map(b => b.id === id ? { ...b, level: Math.min(b.maxLevel, b.level + 1) } : b));
    setUpgradedId(id);
    setTimeout(() => setUpgradedId(null), 2000);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-panel p-5 border-cyan-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Building2 size={120} className="text-cyan-400" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">FACILITY MANAGEMENT</span>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">HQ CAMPUS</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-1">
                <Building2 size={20} className="text-cyan-400" /> Team Headquarters & R&D Facilities
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Construct and upgrade specialized facilities to boost aerodynamic efficiency, part manufacturing speed, and driver training.
              </p>
            </div>

            {selectedTeam && (
              <div className="bg-base-950/80 px-3.5 py-2 rounded-xl border border-white/10 text-right shrink-0">
                <div className="text-[10px] text-slate-400">Assigned Team</div>
                <div className="text-sm font-bold text-cyan-300">{selectedTeam.name}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {buildings.map((b) => {
              const isMax = b.level >= b.maxLevel;
              const canAfford = availableFunds >= b.cost;
              const isJustUpgraded = upgradedId === b.id;

              return (
                <div
                  key={b.id}
                  className={`bg-base-950/70 p-4 rounded-xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                    isJustUpgraded
                      ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.2)]"
                      : "border-white/5 hover:border-cyan-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-base-900 border border-white/10 shrink-0">
                      {b.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-100">{b.name}</span>
                        <span className="text-[10px] font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-full">
                          LVL {b.level}/{b.maxLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{b.desc}</p>
                      <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                        <Zap size={10} /> {b.effect}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isMax ? (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle size={12} /> MAX LVL
                      </span>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(b.id, b.cost)}
                        disabled={!canAfford}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        Upgrade (${(b.cost / 1e6).toFixed(1)}M)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

