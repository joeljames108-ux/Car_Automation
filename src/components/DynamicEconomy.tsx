// ===================================================================
// DYNAMIC ECONOMY — Live market & world simulation dashboard
// ===================================================================
import { useMemo, useState } from "react";
import {
  TrendingUp, TrendingDown, Fuel, AlertTriangle, Calendar,
  Globe, ShoppingCart, Zap, ChevronRight, Play, FastForward,
  Newspaper,
} from "lucide-react";
import { useCompany } from "../state/CompanyContext";
import { LineChart } from "./ui/LineChart";
import type { MarketEvent, Regulation } from "../sim/types";

function Pill({ label, color }: { label: string; color: "cyan" | "green" | "amber" | "red" | "purple" }) {
  const cls: Record<string, string> = {
    cyan:   "bg-accent-500/15 text-accent-300 border-accent-500/30",
    green:  "bg-ok-500/15 text-ok-400 border-ok-500/30",
    amber:  "bg-warn-500/15 text-warn-400 border-warn-500/30",
    red:    "bg-danger-500/15 text-danger-400 border-danger-500/30",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  };
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cls[color]}`}>{label}</span>;
}

function SeverityBar({ value }: { value: number }) {
  const color = value > 0.7 ? "bg-danger-500" : value > 0.4 ? "bg-warn-400" : "bg-ok-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-base-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value * 100}%` }} />
      </div>
      <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{Math.round(value * 100)}%</span>
    </div>
  );
}

function PrefBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-mono text-slate-300">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 bg-base-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

function RegCard({ reg }: { reg: Regulation }) {
  const severityColor = reg.severity > 0.7 ? "border-danger-500/30" : reg.severity > 0.4 ? "border-warn-500/30" : "border-ok-500/30";
  const regionColors: Record<string, string> = { global: "cyan", na: "green", eu: "amber", asia: "purple" };
  return (
    <div className={`bg-base-850 border ${severityColor} rounded-xl p-3`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-xs font-semibold text-slate-200">{reg.name}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{reg.description}</div>
        </div>
        <Pill label={reg.region.toUpperCase()} color={(regionColors[reg.region] ?? "cyan") as any} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <SeverityBar value={reg.severity} />
        <span className="text-[10px] text-danger-400 ml-2 shrink-0">
          ${reg.penalty.toLocaleString()} fine
        </span>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: MarketEvent }) {
  const icons: Record<string, React.ReactNode> = {
    oil_crisis:        <Fuel size={14} className="text-warn-400" />,
    ev_boom:           <Zap size={14} className="text-ok-400" />,
    material_shortage: <AlertTriangle size={14} className="text-danger-400" />,
    tech_breakthrough: <TrendingUp size={14} className="text-accent-400" />,
    recession:         <TrendingDown size={14} className="text-danger-400" />,
    luxury_boom:       <Globe size={14} className="text-purple-400" />,
    suv_craze:         <ShoppingCart size={14} className="text-amber-400" />,
    green_mandate:     <Globe size={14} className="text-ok-400" />,
  };
  return (
    <div className="bg-base-850 border border-base-800 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1.5">
        {icons[event.type] ?? <Globe size={14} />}
        <span className="text-xs font-semibold text-slate-200">{event.name}</span>
      </div>
      <p className="text-[10px] text-slate-500 mb-2">{event.description}</p>
      <div className="flex flex-wrap gap-1">
        {event.effects.fuelPriceMultiplier && (
          <span className="text-[10px] bg-warn-500/10 text-warn-400 px-1.5 py-0.5 rounded">
            Fuel ×{event.effects.fuelPriceMultiplier.toFixed(1)}
          </span>
        )}
        {event.effects.evDemandBonus && (
          <span className="text-[10px] bg-ok-500/10 text-ok-400 px-1.5 py-0.5 rounded">
            EV demand {event.effects.evDemandBonus > 0 ? "+" : ""}{Math.round(event.effects.evDemandBonus * 100)}%
          </span>
        )}
        {event.effects.luxuryDemandBonus && (
          <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded">
            Luxury {event.effects.luxuryDemandBonus > 0 ? "+" : ""}{Math.round(event.effects.luxuryDemandBonus * 100)}%
          </span>
        )}
        {event.effects.materialCostMultiplier && (
          <span className="text-[10px] bg-danger-500/10 text-danger-400 px-1.5 py-0.5 rounded">
            Materials ×{event.effects.materialCostMultiplier.toFixed(1)}
          </span>
        )}
      </div>
      <div className="text-[10px] text-slate-600 mt-1.5">
        {event.durationMonths} month duration · started month {event.startMonth}
      </div>
    </div>
  );
}

export function DynamicEconomy() {
  const { company, advanceAllSystems } = useCompany();
  const { economy } = company;
  const [activeTab, setActiveTab] = useState<"overview" | "regulations" | "events" | "news">("overview");

  const fuelSeries = useMemo(() => [{
    data: economy.fuelPriceHistory.slice(-36).map(h => ({ x: h.month, y: h.price })),
    color: "#f59e0b",
    fill: true,
  }], [economy.fuelPriceHistory]);

  const matEntries = Object.entries(economy.materialCosts);
  const competitorActions = company.competitorActions.slice(-15).reverse();

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "regulations" as const, label: `Regulations (${economy.upcomingRegulations.length})` },
    { id: "events" as const, label: `Active Events (${economy.activeEvents.length})` },
    { id: "news" as const, label: `World News (${competitorActions.length})` },
  ];

  return (
    <div className="space-y-4 stagger">
      {/* Header */}
      <div className="panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: "radial-gradient(ellipse at top right, rgba(34,211,238,0.3), transparent 60%)" }} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-500/20 border border-accent-500/30">
              <TrendingUp size={24} className="text-accent-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Dynamic Economy</h2>
              <p className="text-xs text-slate-500">Live market simulation — fuel, materials, regulations, events</p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Game Month</div>
              <div className="text-2xl font-bold font-mono text-accent-300">{economy.month}</div>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={advanceAllSystems} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent-500/20 border border-accent-500/40 text-accent-300 hover:bg-accent-500/30 transition-all">
                <Play size={12} /> +1 Month
              </button>
              <button onClick={() => { for (let i = 0; i < 6; i++) advanceAllSystems(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-base-850 border border-base-700 text-slate-300 hover:border-base-600 transition-all">
                <FastForward size={12} /> +6 Months
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="panel p-3 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Fuel Price</div>
          <div className="text-xl font-bold font-mono text-warn-400">${economy.fuelPrice.toFixed(2)}</div>
          <div className="text-[10px] text-slate-600">per gallon</div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Inflation</div>
          <div className="text-xl font-bold font-mono text-slate-200">{economy.inflation.toFixed(1)}%</div>
          <div className="text-[10px] text-slate-600">annual</div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">GDP Growth</div>
          <div className={`text-xl font-bold font-mono ${economy.gdpGrowth >= 0 ? "text-ok-400" : "text-danger-400"}`}>{economy.gdpGrowth.toFixed(1)}%</div>
          <div className="text-[10px] text-slate-600">annual</div>
        </div>
        <div className="panel p-3 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Interest Rate</div>
          <div className="text-xl font-bold font-mono text-slate-200">{economy.interestRate.toFixed(1)}%</div>
          <div className="text-[10px] text-slate-600">annual</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-base-850 rounded-lg p-1 border border-base-800 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === t.id ? "bg-accent-500/20 text-accent-300" : "text-slate-400 hover:text-slate-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {/* Fuel price chart */}
          <div className="panel p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Fuel size={12} className="text-warn-400" /> Fuel Price History ($/gal)
            </h3>
            <LineChart series={fuelSeries} height={120} yMin={1} yMax={8} xLabel="Month" yLabel="$/gal" />
          </div>

          {/* Material costs */}
          <div className="panel p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Material Costs ($/kg)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {matEntries.map(([mat, cost]) => (
                <div key={mat} className="bg-base-850 rounded-lg p-2.5 text-center">
                  <div className="text-[10px] text-slate-500 capitalize mb-1">{mat.replace("_", " ")}</div>
                  <div className="font-mono text-sm text-slate-200">${cost.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer preferences */}
          <div className="panel p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Customer Preferences</h3>
            <div className="space-y-3">
              <PrefBar label="EV Adoption"        value={economy.customerPreferences.evAdoption}        color="bg-ok-400" />
              <PrefBar label="SUV Preference"     value={economy.customerPreferences.suvPreference}     color="bg-blue-400" />
              <PrefBar label="Luxury Demand"      value={economy.customerPreferences.luxuryDemand}      color="bg-purple-400" />
              <PrefBar label="Performance Focus"  value={economy.customerPreferences.performanceDemand} color="bg-accent-400" />
              <PrefBar label="Safety Priority"    value={economy.customerPreferences.safetyPriority}    color="bg-warn-400" />
              <PrefBar label="Tech Savvy"         value={economy.customerPreferences.techPriority}      color="bg-blue-400" />
              <PrefBar label="Eco-Conscious"      value={economy.customerPreferences.ecoFriendly}       color="bg-ok-400" />
            </div>
          </div>

          {/* Market segment demand */}
          <div className="panel p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Market Segment Demand</h3>
            <div className="space-y-2">
              {economy.segmentDemand.map(seg => (
                <div key={seg.segment} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-slate-400 capitalize">{seg.segment.replace("_", " ")}</div>
                  <div className="flex-1 h-2 bg-base-800 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-500/60 rounded-full" style={{ width: `${seg.demand * 100}%` }} />
                  </div>
                  <div className="text-xs font-mono text-slate-400 w-10 text-right">{Math.round(seg.demand * 100)}%</div>
                  <div className={`text-[10px] w-12 text-right ${seg.growthRate >= 0 ? "text-ok-400" : "text-danger-400"}`}>
                    {seg.growthRate > 0 ? "+" : ""}{(seg.growthRate * 100).toFixed(1)}%/mo
                  </div>
                  <div className="text-[10px] text-slate-600 w-20 text-right">${(seg.averagePrice / 1000).toFixed(0)}k avg</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "regulations" && (
        <div className="space-y-3">
          {economy.activeRegulations.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-danger-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle size={11} /> Active Regulations
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {economy.activeRegulations.map(r => <RegCard key={r.id} reg={r} />)}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar size={11} /> Upcoming Regulations
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {economy.upcomingRegulations.map(r => (
                <div key={r.id}>
                  <div className="text-[10px] text-slate-600 mb-1 flex items-center gap-1">
                    <Calendar size={9} /> Effective month {r.effectiveMonth}
                    {r.effectiveMonth > economy.month && <span className="text-accent-400">({r.effectiveMonth - economy.month} months away)</span>}
                  </div>
                  <RegCard reg={r} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "events" && (
        <div className="space-y-3">
          {economy.activeEvents.length === 0 && economy.eventHistory.length === 0 ? (
            <div className="panel p-10 text-center">
              <Globe size={36} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">No market events active. Advance months to trigger events.</p>
            </div>
          ) : (
            <>
              {economy.activeEvents.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-ok-300 uppercase tracking-wider mb-2">Active Events</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {economy.activeEvents.map(e => <EventCard key={e.id} event={e} />)}
                  </div>
                </div>
              )}
              {economy.eventHistory.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Event History</div>
                  <div className="grid gap-2 sm:grid-cols-2 opacity-60">
                    {economy.eventHistory.slice(-8).map(e => <EventCard key={e.id} event={e} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "news" && (
        <div className="panel p-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Newspaper size={12} className="text-accent-400" /> Competitor Intelligence Feed
          </h3>
          {competitorActions.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-6">No competitor actions yet. Advance months to see activity.</p>
          ) : (
            <div className="space-y-2">
              {competitorActions.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-base-800/50 last:border-0">
                  <div className="text-[10px] text-slate-600 font-mono w-14 shrink-0 pt-0.5">Mo. {a.month}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-200">{a.companyName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        a.type === "launch" ? "bg-ok-500/15 text-ok-400 border-ok-500/30" :
                        a.type === "patent" ? "bg-accent-500/15 text-accent-400 border-accent-500/30" :
                        a.type === "recall" ? "bg-danger-500/15 text-danger-400 border-danger-500/30" :
                        "bg-base-800 text-slate-400 border-base-700"
                      }`}>{a.type.replace("_", " ")}</span>
                    </div>
                    <div className="text-xs text-slate-400">{a.title}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">{a.description}</div>
                  </div>
                  <ChevronRight size={12} className="text-slate-700 shrink-0 mt-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
