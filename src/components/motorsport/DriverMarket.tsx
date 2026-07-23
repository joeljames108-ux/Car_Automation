// ===================================================================
// DRIVER MARKET — Browse, scout, hire, manage contracts
// ===================================================================
import { useState } from "react";
import { Users, Search, UserPlus, UserMinus, RefreshCw, FileText } from "lucide-react";
import { useCompany } from "../../state/CompanyContext";
import type { MotorsportTeam, RaceDriver } from "../../sim/types";

function SkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-300 font-mono">{value}</span>
      </div>
      <div className="h-1 bg-base-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function DriverCard({ driver, actions }: { driver: RaceDriver; actions: React.ReactNode }) {
  return (
    <div className="glass-panel p-3 card-hover">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-purple-500/20 border border-base-700 flex items-center justify-center text-lg font-bold text-accent-300">
          {driver.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200 truncate">{driver.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-base-800 text-slate-400">{driver.nationality}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            ${(driver.salary / 1_000_000).toFixed(1)}M/season
            {driver.contractEndSeason > 0 && <span className="ml-2 text-warn-400">Contract → S{driver.contractEndSeason}</span>}
          </div>
          <div className="grid grid-cols-5 gap-1.5 mt-2">
            <SkillBar label="Skill" value={driver.skill} color="bg-accent-400" />
            <SkillBar label="Con" value={driver.consistency} color="bg-ok-400" />
            <SkillBar label="Wet" value={driver.wetSkill} color="bg-blue-400" />
            <SkillBar label="Agg" value={driver.aggression} color="bg-warn-400" />
            <SkillBar label="Exp" value={driver.experience} color="bg-purple-400" />
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          {actions}
        </div>
      </div>
    </div>
  );
}

export function DriverMarket({ selectedTeam }: { selectedTeam: MotorsportTeam | null }) {
  const {
    company, assignMotorsportDriver, availableDrivers,
    scoutNewDriver, signScouted, releaseMotorsportDriver, renewMotorsportContract,
  } = useCompany();
  const [tab, setTab] = useState<"available" | "scouting" | "roster">("roster");

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 bg-base-850/50 rounded-lg p-1 border border-base-800">
        {[
          { id: "roster" as const, label: "Team Roster", icon: <Users size={12} /> },
          { id: "available" as const, label: "Free Agents", icon: <UserPlus size={12} /> },
          { id: "scouting" as const, label: "Scouting", icon: <Search size={12} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              tab === t.id ? "bg-accent-500/20 text-accent-300 tab-active-indicator" : "text-slate-400 hover:text-slate-200"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Roster tab */}
      {tab === "roster" && (
        <div className="space-y-3">
          {!selectedTeam ? (
            <div className="glass-panel p-8 text-center">
              <Users size={32} className="mx-auto text-slate-700 mb-2" />
              <p className="text-sm text-slate-500">Select a team to manage its drivers</p>
            </div>
          ) : selectedTeam.drivers.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <UserPlus size={32} className="mx-auto text-slate-700 mb-2" />
              <p className="text-sm text-slate-500">No drivers signed. Hire from Free Agents or Scout new talent.</p>
            </div>
          ) : (
            selectedTeam.drivers.map(d => (
              <DriverCard key={d.id} driver={d} actions={
                <>
                  <button onClick={() => renewMotorsportContract(selectedTeam.id, d.id, 2)}
                    className="px-2 py-1 rounded text-[10px] font-medium bg-ok-500/15 border border-ok-500/30 text-ok-400 hover:bg-ok-500/25 transition-all"
                    title="Renew contract for 2 seasons">
                    <RefreshCw size={10} className="inline mr-0.5" /> Renew
                  </button>
                  <button onClick={() => releaseMotorsportDriver(selectedTeam.id, d.id)}
                    className="px-2 py-1 rounded text-[10px] font-medium bg-danger-500/15 border border-danger-500/30 text-danger-400 hover:bg-danger-500/25 transition-all"
                    title="Release driver">
                    <UserMinus size={10} className="inline mr-0.5" /> Release
                  </button>
                </>
              } />
            ))
          )}
        </div>
      )}

      {/* Free Agents tab */}
      {tab === "available" && (
        <div className="space-y-3">
          {availableDrivers.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <p className="text-sm text-slate-500">All drivers are signed to teams.</p>
            </div>
          ) : (
            availableDrivers.map((d, idx) => (
              <DriverCard key={d.id} driver={d} actions={
                selectedTeam && selectedTeam.drivers.length < 2 ? (
                  <button onClick={() => assignMotorsportDriver(selectedTeam.id, idx)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-500/15 border border-accent-500/30 text-accent-300 hover:bg-accent-500/25 transition-all">
                    Hire
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-600">
                    {!selectedTeam ? "Select team" : "Full roster"}
                  </span>
                )
              } />
            ))
          )}
        </div>
      )}

      {/* Scouting tab */}
      {tab === "scouting" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button onClick={scoutNewDriver}
              disabled={company.motorsport.scoutedDrivers.length >= 4}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <Search size={14} /> Scout New Talent
            </button>
            <span className="text-[10px] text-slate-500">
              {company.motorsport.scoutedDrivers.length}/4 scouted
            </span>
          </div>
          {company.motorsport.scoutedDrivers.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <Search size={32} className="mx-auto text-slate-700 mb-2" />
              <p className="text-sm text-slate-500">Scout young talent from feeder series.</p>
              <p className="text-xs text-slate-600 mt-1">Cheaper but less experienced — high potential!</p>
            </div>
          ) : (
            company.motorsport.scoutedDrivers.map(d => (
              <DriverCard key={d.id} driver={d} actions={
                selectedTeam && selectedTeam.drivers.length < 2 ? (
                  <button onClick={() => signScouted(d.id, selectedTeam.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-ok-500/15 border border-ok-500/30 text-ok-400 hover:bg-ok-500/25 transition-all">
                    Sign
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-600">
                    {!selectedTeam ? "Select team" : "Full"}
                  </span>
                )
              } />
            ))
          )}
        </div>
      )}
    </div>
  );
}
