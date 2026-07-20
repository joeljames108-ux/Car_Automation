// ===================================================================
// DIGITAL TWIN — Complete per-vehicle lifecycle history
// ===================================================================
import { useState, useMemo } from "react";
import { Cpu, Clock, CheckCircle2, AlertTriangle, Info, Star, Plus, BarChart3 } from "lucide-react";
import { useCompany } from "../state/CompanyContext";
import type { TwinEventType, TwinEvent } from "../sim/types";

const EVENT_ICONS: Record<TwinEventType, { icon: React.ReactNode; color: string }> = {
  design_created:        { icon: <Star size={12} />,          color: "text-accent-400 bg-accent-500/15" },
  design_modified:       { icon: <Info size={12} />,          color: "text-blue-400 bg-blue-500/15" },
  test_completed:        { icon: <CheckCircle2 size={12} />,  color: "text-ok-400 bg-ok-500/15" },
  simulation_run:        { icon: <BarChart3 size={12} />,     color: "text-purple-400 bg-purple-500/15" },
  manufacturing_started: { icon: <Info size={12} />,          color: "text-amber-400 bg-amber-500/15" },
  vehicle_launched:      { icon: <Star size={12} />,          color: "text-ok-400 bg-ok-500/15" },
  customer_feedback:     { icon: <Info size={12} />,          color: "text-slate-400 bg-slate-500/15" },
  warranty_claim:        { icon: <AlertTriangle size={12} />, color: "text-warn-400 bg-warn-500/15" },
  race_entry:            { icon: <CheckCircle2 size={12} />,  color: "text-blue-400 bg-blue-500/15" },
  race_result:           { icon: <Star size={12} />,          color: "text-yellow-400 bg-yellow-500/15" },
  facelift:              { icon: <Info size={12} />,          color: "text-purple-400 bg-purple-500/15" },
  generation:            { icon: <Star size={12} />,          color: "text-accent-400 bg-accent-500/15" },
  recall:                { icon: <AlertTriangle size={12} />, color: "text-danger-400 bg-danger-500/15" },
  award:                 { icon: <Star size={12} />,          color: "text-yellow-400 bg-yellow-500/15" },
  review_published:      { icon: <Info size={12} />,          color: "text-slate-400 bg-slate-500/15" },
};

const SEVERITY_STYLES: Record<string, string> = {
  info:    "border-l-2 border-blue-500/50",
  success: "border-l-2 border-ok-500/50",
  warning: "border-l-2 border-warn-500/50",
  danger:  "border-l-2 border-danger-500/50",
};

function EventRow({ event }: { event: TwinEvent }) {
  const meta = EVENT_ICONS[event.type] ?? { icon: <Info size={12} />, color: "text-slate-400 bg-slate-500/15" };
  const sevStyle = event.severity ? SEVERITY_STYLES[event.severity] : "border-l-2 border-base-800";
  return (
    <div className={`flex items-start gap-3 py-3 ${sevStyle} pl-3 hover:bg-base-850/30 transition-all`}>
      <div className="mt-0.5 shrink-0">
        <div className={`p-1.5 rounded-lg ${meta.color}`}>{meta.icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-200">{event.title}</span>
          <span className="text-[10px] text-slate-600 font-mono">Month {event.month}</span>
          <span className="text-[9px] uppercase tracking-wider text-slate-600">{event.type.replace(/_/g, " ")}</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">{event.description}</p>
        {event.data && Object.keys(event.data).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {Object.entries(event.data).map(([k, v]) => (
              <span key={k} className="text-[10px] bg-base-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                {k}: {String(v)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricsChart({ data }: { data: { month: number; customerSatisfaction: number; reliabilityScore: number; warrantyClaimRate: number }[] }) {
  if (data.length < 2) return <p className="text-slate-600 text-xs text-center py-4">Needs 2+ months of data.</p>;
  const w = 400; const h = 120; const pad = 30;
  const months = data.map(d => d.month);
  const minM = Math.min(...months); const maxM = Math.max(...months);
  const xScale = (m: number) => pad + (maxM === minM ? 0 : ((m - minM) / (maxM - minM)) * (w - 2 * pad));
  const yScale = (v: number) => h - pad - (v / 100) * (h - 2 * pad);

  function polyline(vals: number[], color: string) {
    const pts = data.map((d, i) => `${xScale(d.month)},${yScale(vals[i])}`).join(" ");
    return <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />;
  }

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={pad} y1={yScale(v)} x2={w - pad} y2={yScale(v)} stroke="#1e293b" strokeWidth="0.5" />
            <text x={pad - 4} y={yScale(v)} textAnchor="end" dominantBaseline="central" fontSize="8" fill="#475569">{v}</text>
          </g>
        ))}
        {polyline(data.map(d => d.customerSatisfaction), "#22d3ee")}
        {polyline(data.map(d => d.reliabilityScore), "#22c55e")}
        {polyline(data.map(d => d.warrantyClaimRate * 20), "#f97316")}
      </svg>
      <div className="flex gap-4 justify-center text-[10px] mt-1">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent-400 inline-block" />Satisfaction</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-ok-400 inline-block" />Reliability</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-400 inline-block" />Warranty (×20)</span>
      </div>
    </div>
  );
}

export function DigitalTwin() {
  const { company, addTwinEvent } = useCompany();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<TwinEventType | "all">("all");
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", type: "design_modified" as TwinEventType });

  const vehicle = selectedId ? company.garage.find(g => g.id === selectedId) : null;
  const twin = selectedId ? company.digitalTwins[selectedId] : null;

  const feedback = selectedId ? (company.customerFeedback[selectedId] ?? []) : [];
  const sales = selectedId ? (company.salesData[selectedId] ?? []) : [];

  const filteredEvents = useMemo(() =>
    (twin?.events ?? []).filter(e => filterType === "all" || e.type === filterType),
    [twin, filterType]
  );

  const eventTypes = useMemo(() =>
    [...new Set((twin?.events ?? []).map(e => e.type))],
    [twin]
  );

  const metricsData = useMemo(() => {
    const months = new Set([...feedback.map(f => f.month), ...sales.map(s => s.month)]);
    return [...months].sort().map(m => {
      const fb = feedback.find(f => f.month === m);
      const sr = sales.find(s => s.month === m);
      return {
        month: m,
        customerSatisfaction: fb?.satisfaction ?? 0,
        reliabilityScore: fb?.reliability ?? 0,
        warrantyClaimRate: fb?.warrantyClaims ?? 0,
        unitsSold: sr?.unitsSold ?? 0,
      };
    });
  }, [feedback, sales]);

  function handleAddEvent() {
    if (!selectedId || !newEvent.title) return;
    addTwinEvent(selectedId, {
      vehicleId: selectedId, type: newEvent.type,
      month: company.economy.month, title: newEvent.title,
      description: newEvent.description, severity: "info",
    });
    setNewEvent({ title: "", description: "", type: "design_modified" });
    setShowAddEvent(false);
  }

  return (
    <div className="space-y-4 stagger">
      {/* Header */}
      <div className="panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: "radial-gradient(ellipse at top right, rgba(34,211,238,0.3), transparent 60%)" }} />
        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-500/20 border border-accent-500/30">
            <Cpu size={24} className="text-accent-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Digital Twin</h2>
            <p className="text-xs text-slate-500">Complete per-vehicle lifecycle — engineering, testing, manufacturing, warranty, race data</p>
          </div>
        </div>
      </div>

      {/* Vehicle selector */}
      <div className="panel p-4">
        <label className="label-mono block mb-2">Select Vehicle</label>
        <select value={selectedId || ""}
          onChange={e => setSelectedId(e.target.value || null)}
          className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none">
          <option value="">— Select a vehicle to view its digital twin —</option>
          {company.garage.map(v => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.isLaunched ? "Launched" : "In Development"})
            </option>
          ))}
        </select>
      </div>

      {!selectedId && (
        <div className="panel p-10 text-center">
          <Cpu size={40} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 text-sm">Select a vehicle above to view its digital twin.</p>
        </div>
      )}

      {selectedId && vehicle && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="panel p-3 text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Events Logged</div>
              <div className="text-xl font-bold font-mono text-accent-300">{twin?.events.length ?? 0}</div>
            </div>
            <div className="panel p-3 text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Units Produced</div>
              <div className="text-xl font-bold font-mono text-slate-200">{(twin?.totalUnitsProduced ?? vehicle.totalUnitsSold).toLocaleString()}</div>
            </div>
            <div className="panel p-3 text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Lifetime Rating</div>
              <div className="text-xl font-bold font-mono text-ok-400">{twin?.lifetimeRating ?? vehicle.overallRating}</div>
            </div>
            <div className="panel p-3 text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Warranty Claims</div>
              <div className="text-xl font-bold font-mono text-warn-400">{twin?.totalWarrantyClaims ?? 0}</div>
            </div>
          </div>

          {/* Metrics chart */}
          {metricsData.length > 0 && (
            <div className="panel p-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BarChart3 size={12} className="text-accent-400" /> Metrics Over Time
              </h3>
              <MetricsChart data={metricsData} />
            </div>
          )}

          {/* Timeline */}
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={12} className="text-accent-400" /> Event Timeline
              </h3>
              <div className="flex items-center gap-2">
                <select value={filterType} onChange={e => setFilterType(e.target.value as any)}
                  className="bg-base-850 border border-base-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-accent-500">
                  <option value="all">All Events</option>
                  {eventTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
                <button onClick={() => setShowAddEvent(s => !s)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-accent-500/15 border border-accent-500/30 text-accent-300 hover:bg-accent-500/25 transition-all">
                  <Plus size={11} /> Log Event
                </button>
              </div>
            </div>

            {showAddEvent && (
              <div className="bg-base-850 rounded-xl p-3 mb-3 space-y-2 border border-base-700">
                <input value={newEvent.title} onChange={e => setNewEvent(n => ({ ...n, title: e.target.value }))}
                  placeholder="Event title"
                  className="w-full bg-base-900 border border-base-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:border-accent-500 focus:outline-none" />
                <input value={newEvent.description} onChange={e => setNewEvent(n => ({ ...n, description: e.target.value }))}
                  placeholder="Description"
                  className="w-full bg-base-900 border border-base-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:border-accent-500 focus:outline-none" />
                <select value={newEvent.type} onChange={e => setNewEvent(n => ({ ...n, type: e.target.value as TwinEventType }))}
                  className="w-full bg-base-900 border border-base-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:border-accent-500 focus:outline-none">
                  {(Object.keys(EVENT_ICONS) as TwinEventType[]).map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={handleAddEvent} className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-accent-500/20 border border-accent-500/40 text-accent-300 hover:bg-accent-500/30 transition-all">Add Event</button>
                  <button onClick={() => setShowAddEvent(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-all">Cancel</button>
                </div>
              </div>
            )}

            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={28} className="mx-auto text-slate-700 mb-2" />
                <p className="text-slate-600 text-sm">No events yet.</p>
                <p className="text-xs text-slate-700 mt-1">Log events manually or advance months to generate automatic feedback events.</p>
              </div>
            ) : (
              <div className="divide-y divide-base-800/50">
                {[...filteredEvents].reverse().map(e => <EventRow key={e.id} event={e} />)}
              </div>
            )}
          </div>

          {/* Customer feedback summary */}
          {feedback.length > 0 && (
            <div className="panel p-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Latest Customer Feedback</h3>
              {(() => {
                const last = feedback[feedback.length - 1];
                return (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    {[
                      ["Satisfaction", last.satisfaction],
                      ["Reliability", last.reliability],
                      ["Value", last.valueForMoney],
                      ["Performance", last.performance],
                      ["Comfort", last.comfort],
                      ["Technology", last.technology],
                    ].map(([label, val]) => (
                      <div key={label as string} className="bg-base-850 rounded-lg p-2">
                        <div className={`text-base font-bold font-mono ${(val as number) >= 70 ? "text-ok-400" : (val as number) >= 50 ? "text-accent-300" : "text-warn-400"}`}>{Math.round(val as number)}</div>
                        <div className="text-[9px] text-slate-600">{label}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
