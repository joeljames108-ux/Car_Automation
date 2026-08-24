// ===================================================================
// STAFF & PIT CREW PANEL — Key Personnel & Crew Chiefs
// ===================================================================
import { useState } from "react";
import { Users, Award, Shield, DollarSign, UserCheck, Flame } from "lucide-react";
import { useCompany } from "../../state/CompanyContext";
import type { MotorsportTeam } from "../../sim/types";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  skill: number;
  morale: number;
  salary: number;
  spec: string;
  bonus: string;
}

const DEFAULT_STAFF: StaffMember[] = [
  { id: "s1", name: "Adrian Newcomb", role: "Head Engineer", skill: 94, morale: 90, salary: 3_500_000, spec: "Ground Effect Aerodynamics", bonus: "+12% Downforce efficiency" },
  { id: "s2", name: "Hannah Schmitz", role: "Race Strategist", skill: 92, morale: 95, salary: 2_800_000, spec: "Undercut & Wet Timing", bonus: "+15% Strategy success rate" },
  { id: "s3", name: "Diego Rossi", role: "Pit Crew Chief", skill: 88, morale: 82, salary: 1_500_000, spec: "Sub-2.0s Pit Stops", bonus: "Pit stop time reduced by 0.4s" },
  { id: "s4", name: "Elena Vance", role: "Telemetry Director", skill: 90, morale: 88, salary: 2_200_000, spec: "Sensor Real-Time Diagnostics", bonus: "-20% Unforeseen DNF risk" },
  { id: "s5", name: "Marcus Thorne", role: "Powertrain Lead", skill: 89, morale: 86, salary: 3_000_000, spec: "Thermal & ERS Energy Recovery", bonus: "+18 HP ERS boost deploy" },
  { id: "s6", name: "Kenji Sato", role: "Vehicle Dynamics Chief", skill: 91, morale: 92, salary: 2_600_000, spec: "Suspension Geometry & Tire Life", bonus: "+10% Tire longevity" },
];

export function StaffPitCrewPanel({ selectedTeam }: { selectedTeam: MotorsportTeam | null }) {
  const { company } = useCompany();
  const [staff, setStaff] = useState<StaffMember[]>(DEFAULT_STAFF);
  const [bonusActiveId, setBonusActiveId] = useState<string | null>(null);

  const handleTrain = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, skill: Math.min(99, s.skill + 1), morale: Math.min(100, s.morale + 3) } : s));
    setBonusActiveId(id);
    setTimeout(() => setBonusActiveId(null), 2000);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-panel p-5 border-purple-500/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">TEAM TALENT & CREW</span>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">KEY ROSTER</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-1">
              <Users size={20} className="text-purple-400" /> Key Staff & Pit Crew Operations
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage Head Engineers, Race Strategists, and Pit Crew Chiefs to shave crucial tenths during pit stops and optimize development.
            </p>
          </div>

          {selectedTeam && (
            <div className="bg-base-950/80 px-3.5 py-2 rounded-xl border border-white/10 text-right shrink-0">
              <div className="text-[10px] text-slate-400">Team Allocation</div>
              <div className="text-sm font-bold text-purple-300">{selectedTeam.name}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {staff.map((s) => {
            const isTrained = bonusActiveId === s.id;
            return (
              <div
                key={s.id}
                className={`bg-base-950/70 p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between space-y-3 ${
                  isTrained
                    ? "border-purple-400 bg-purple-500/10 shadow-[0_0_20px_rgba(192,132,252,0.2)]"
                    : "border-white/5 hover:border-purple-500/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                      {s.role}
                    </span>
                    <span className="text-xs font-mono text-slate-300 font-bold flex items-center gap-0.5">
                      <DollarSign size={12} className="text-slate-500" />{(s.salary / 1e6).toFixed(1)}M/yr
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-100">{s.name}</h4>
                  <div className="text-xs text-slate-400 mt-1">Specialty: <span className="text-slate-200 font-medium">{s.spec}</span></div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                    <Award size={10} /> {s.bonus}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                        <span>Skill Rating</span>
                        <span className="text-cyan-300 font-mono font-bold">{s.skill}/100</span>
                      </div>
                      <div className="h-1.5 bg-base-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${s.skill}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                        <span>Morale</span>
                        <span className="text-emerald-400 font-mono font-bold">{s.morale}%</span>
                      </div>
                      <div className="h-1.5 bg-base-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${s.morale}%` }} />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTrain(s.id)}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Flame size={12} /> Intensive Training Workshop
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
