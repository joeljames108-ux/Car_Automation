// ===================================================================
// ENGINEERING COMPARISON — Side-by-side vehicle analysis
// ===================================================================
import { useState, useMemo } from "react";
import { GitCompare, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useCompany } from "../state/CompanyContext";
import type { GarageVehicle } from "../sim/types";

interface MetricRow {
  label: string;
  section: string;
  getValue: (v: GarageVehicle) => number;
  format: (n: number) => string;
  unit?: string;
  higherIsBetter: boolean;
}

const METRICS: MetricRow[] = [
  // Engine
  { section: "Engine", label: "Peak Power",        getValue: v => v.sim.peakPower,          format: n => n.toFixed(0),   unit: "hp",    higherIsBetter: true },
  { section: "Engine", label: "Peak Torque",       getValue: v => v.sim.peakTorque,         format: n => n.toFixed(0),   unit: "Nm",    higherIsBetter: true },
  { section: "Engine", label: "Displacement",      getValue: v => v.sim.displacement,       format: n => n.toFixed(0),   unit: "cc",    higherIsBetter: false },
  { section: "Engine", label: "Redline",           getValue: v => v.sim.redline,            format: n => n.toFixed(0),   unit: "rpm",   higherIsBetter: true },
  { section: "Engine", label: "Fuel Economy",      getValue: v => v.sim.fuelEconomy,        format: n => n.toFixed(1),   unit: "L/100k",higherIsBetter: false },
  { section: "Engine", label: "Reliability",       getValue: v => v.sim.reliability * 100,  format: n => n.toFixed(0),   unit: "%",     higherIsBetter: true },
  { section: "Engine", label: "Emissions",         getValue: v => v.sim.emissions,          format: n => n.toFixed(0),   unit: "g/km",  higherIsBetter: false },
  { section: "Engine", label: "Engine Weight",     getValue: v => v.sim.engineWeight,       format: n => n.toFixed(0),   unit: "kg",    higherIsBetter: false },
  // Performance
  { section: "Performance", label: "Total Weight", getValue: v => v.sim.weight,             format: n => n.toFixed(0),   unit: "kg",    higherIsBetter: false },
  { section: "Performance", label: "Top Speed",    getValue: v => v.sim.topSpeed,           format: n => n.toFixed(0),   unit: "km/h",  higherIsBetter: true },
  { section: "Performance", label: "0–100 km/h",  getValue: v => v.sim.accel0_100,         format: n => n.toFixed(2),   unit: "s",     higherIsBetter: false },
  { section: "Performance", label: "Quarter Mile", getValue: v => v.sim.quarterMile,        format: n => n.toFixed(2),   unit: "s",     higherIsBetter: false },
  { section: "Performance", label: "Lateral G",    getValue: v => v.sim.lateralG,           format: n => n.toFixed(2),   unit: "g",     higherIsBetter: true },
  { section: "Performance", label: "Braking 100→0",getValue: v => v.sim.brakingDist,       format: n => n.toFixed(0),   unit: "m",     higherIsBetter: false },
  // Aerodynamics
  { section: "Aerodynamics", label: "Drag Coeff",  getValue: v => v.sim.dragCoeff,          format: n => n.toFixed(3),              higherIsBetter: false },
  { section: "Aerodynamics", label: "Downforce",   getValue: v => v.sim.downforce,          format: n => n.toFixed(0),   unit: "kg",   higherIsBetter: true },
  { section: "Aerodynamics", label: "Aero Balance",getValue: v => v.sim.aeroBalance * 100,  format: n => n.toFixed(1),   unit: "%F",   higherIsBetter: false },
  // Cost
  { section: "Cost & Value", label: "Vehicle Cost",getValue: v => v.sim.vehicleCost,        format: n => `$${(n/1000).toFixed(0)}k`,                higherIsBetter: false },
  { section: "Cost & Value", label: "Target Price",getValue: v => v.sim.targetPrice,        format: n => `$${(n/1000).toFixed(0)}k`,                higherIsBetter: false },
  { section: "Cost & Value", label: "Profit Margin",getValue: v => v.sim.profitMargin * 100,format: n => n.toFixed(1),   unit: "%",    higherIsBetter: true },
  // Ratings
  { section: "Ratings", label: "Market Rating",    getValue: v => v.sim.marketRating * 100, format: n => n.toFixed(0),   unit: "/100", higherIsBetter: true },
  { section: "Ratings", label: "Safety Rating",    getValue: v => v.sim.safetyRating * 100, format: n => n.toFixed(0),   unit: "/100", higherIsBetter: true },
  { section: "Ratings", label: "Drivability",      getValue: v => v.sim.drivability * 100,  format: n => n.toFixed(0),   unit: "/100", higherIsBetter: true },
  { section: "Ratings", label: "Comfort",          getValue: v => v.sim.comfortRating * 100,format: n => n.toFixed(0),   unit: "/100", higherIsBetter: true },
  { section: "Ratings", label: "Luxury",           getValue: v => v.sim.luxuryRating * 100, format: n => n.toFixed(0),   unit: "/100", higherIsBetter: true },
];

const SECTIONS = [...new Set(METRICS.map(m => m.section))];

function Delta({ a, b, metric }: { a: number; b: number; metric: MetricRow }) {
  if (a === 0 && b === 0) return <span className="text-slate-600">—</span>;
  const diff = b - a;
  const pct = a !== 0 ? ((diff / Math.abs(a)) * 100) : 0;
  const better = metric.higherIsBetter ? diff > 0 : diff < 0;
  const worse = metric.higherIsBetter ? diff < 0 : diff > 0;

  if (Math.abs(pct) < 0.5) return <span className="text-slate-500 flex items-center gap-0.5"><Minus size={10} /> same</span>;

  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${better ? "text-ok-400" : worse ? "text-danger-400" : "text-slate-400"}`}>
      {diff > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function VehicleSelect({ label, value, vehicles, onChange }: {
  label: string; value: string | null; vehicles: GarageVehicle[];
  onChange: (id: string | null) => void;
}) {
  return (
    <div className="flex-1">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1">{label}</div>
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value || null)}
        className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none"
      >
        <option value="">— Select Vehicle —</option>
        {vehicles.map(v => (
          <option key={v.id} value={v.id}>{v.name} ({Math.round(v.peakPower)}hp, {Math.round(v.topSpeed)}km/h)</option>
        ))}
      </select>
    </div>
  );
}

function RadarChart({ a, b }: { a: GarageVehicle; b: GarageVehicle }) {
  const axes = [
    { label: "Power",    va: Math.min(a.sim.peakPower / 1000, 1),    vb: Math.min(b.sim.peakPower / 1000, 1) },
    { label: "Speed",    va: Math.min(a.sim.topSpeed / 400, 1),      vb: Math.min(b.sim.topSpeed / 400, 1) },
    { label: "Safety",   va: a.sim.safetyRating,                     vb: b.sim.safetyRating },
    { label: "Comfort",  va: a.sim.comfortRating,                    vb: b.sim.comfortRating },
    { label: "Tech",     va: a.sim.infotainment.technologyScore,     vb: b.sim.infotainment.technologyScore },
    { label: "Value",    va: Math.min(a.sim.profitMargin + 0.5, 1),  vb: Math.min(b.sim.profitMargin + 0.5, 1) },
  ];
  const cx = 120; const cy = 120; const r = 90;
  const n = axes.length;

  function getPoint(val: number, i: number) {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + val * r * Math.cos(angle), y: cy + val * r * Math.sin(angle) };
  }

  function polyPoints(vals: number[]) {
    return vals.map((v, i) => { const p = getPoint(v, i); return `${p.x},${p.y}`; }).join(" ");
  }

  function gridPoly(level: number) {
    return Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      return `${cx + level * r * Math.cos(angle)},${cy + level * r * Math.sin(angle)}`;
    }).join(" ");
  }

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[240px] mx-auto">
      {[0.25, 0.5, 0.75, 1.0].map(l => (
        <polygon key={l} points={gridPoly(l)} fill="none" stroke="#334155" strokeWidth="1" />
      ))}
      {axes.map((_, i) => {
        const p = getPoint(1, i);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1e293b" strokeWidth="1.5" />;
      })}
      <polygon points={polyPoints(axes.map(a => a.va))} fill="rgba(34,211,238,0.12)" stroke="#22d3ee" strokeWidth="1.5" />
      <polygon points={polyPoints(axes.map(a => a.vb))} fill="rgba(249,115,22,0.12)" stroke="#f97316" strokeWidth="1.5" />
      {axes.map((ax, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const lx = cx + (r + 16) * Math.cos(angle);
        const ly = cy + (r + 16) * Math.sin(angle);
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" className="text-[9px]" fill="#94a3b8" fontSize="9">{ax.label}</text>;
      })}
    </svg>
  );
}

export function EngineeringComparison() {
  const { company } = useCompany();
  const [idA, setIdA] = useState<string | null>(null);
  const [idB, setIdB] = useState<string | null>(null);
  const [section, setSection] = useState<string | null>(null);

  const vA = useMemo(() => company.garage.find(g => g.id === idA) ?? null, [company.garage, idA]);
  const vB = useMemo(() => company.garage.find(g => g.id === idB) ?? null, [company.garage, idB]);

  const grouped = useMemo(() => {
    const result: Record<string, MetricRow[]> = {};
    for (const s of SECTIONS) {
      result[s] = METRICS.filter(m => m.section === s);
    }
    return result;
  }, []);

  return (
    <div className="space-y-4 stagger">
      {/* Header */}
      <div className="panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: "radial-gradient(ellipse at top right, rgba(34,211,238,0.3), transparent 60%)" }} />
        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-500/20 border border-accent-500/30">
            <GitCompare size={24} className="text-accent-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Engineering Comparison</h2>
            <p className="text-xs text-slate-500">Side-by-side analysis of any two vehicles from your garage</p>
          </div>
        </div>
      </div>

      {/* Vehicle selectors */}
      <div className="panel p-4">
        <div className="flex gap-4 flex-col sm:flex-row">
          <VehicleSelect label="Vehicle A (Baseline)" value={idA} vehicles={company.garage} onChange={setIdA} />
          <div className="flex items-end justify-center pb-2">
            <span className="text-accent-400 font-bold text-lg">VS</span>
          </div>
          <VehicleSelect label="Vehicle B (Compare to)" value={idB} vehicles={company.garage} onChange={setIdB} />
        </div>
      </div>

      {company.garage.length < 2 && (
        <div className="panel p-10 text-center">
          <GitCompare size={36} className="mx-auto text-slate-700 mb-3" />
          <p className="text-slate-500 text-sm">You need at least 2 vehicles in your garage to compare.</p>
          <p className="text-slate-600 text-xs mt-1">Go to the Garage tab and save some designs first.</p>
        </div>
      )}

      {vA && vB && (
        <>
          {/* Radar chart */}
          <div className="panel p-5">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Performance Profile</h3>
            <div className="flex items-center gap-8 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <RadarChart a={vA} b={vB} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-accent-400 rounded" />
                  <span className="text-sm text-slate-300 font-medium">{vA.name}</span>
                  <span className="text-xs text-slate-500">(A)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-orange-400 rounded" />
                  <span className="text-sm text-slate-300 font-medium">{vB.name}</span>
                  <span className="text-xs text-slate-500">(B)</span>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-xs text-slate-500">Overall Rating</div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold font-mono text-accent-300">{vA.overallRating}</span>
                    <span className="text-slate-600">→</span>
                    <span className={`text-xl font-bold font-mono ${vB.overallRating >= vA.overallRating ? "text-ok-400" : "text-danger-400"}`}>{vB.overallRating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section filter */}
          <div className="flex items-center gap-1 flex-wrap">
            <button onClick={() => setSection(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${section === null ? "bg-accent-500/20 border-accent-500/40 text-accent-300" : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"}`}>All</button>
            {SECTIONS.map(s => (
              <button key={s} onClick={() => setSection(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${section === s ? "bg-accent-500/20 border-accent-500/40 text-accent-300" : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"}`}>{s}</button>
            ))}
          </div>

          {/* Metric table */}
          {Object.entries(grouped)
            .filter(([s]) => section === null || s === section)
            .map(([sectionName, rows]) => (
            <div key={sectionName} className="panel overflow-hidden">
              <div className="px-4 py-2.5 bg-base-850/50 border-b border-base-800">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{sectionName}</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-base-800">
                    <th className="text-left px-4 py-2 text-[10px] text-slate-500 font-mono uppercase">Metric</th>
                    <th className="text-right px-4 py-2 text-[10px] text-accent-400 font-mono uppercase">{vA.variantName} (A)</th>
                    <th className="text-right px-4 py-2 text-[10px] text-orange-400 font-mono uppercase">{vB.variantName} (B)</th>
                    <th className="text-right px-4 py-2 text-[10px] text-slate-500 font-mono uppercase">Δ Change</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((m, i) => {
                    const valA = m.getValue(vA);
                    const valB = m.getValue(vB);
                    return (
                      <tr key={m.label} className={`border-b border-base-800/50 transition-colors hover:bg-base-850/30 ${i % 2 === 0 ? "" : "bg-base-900/30"}`}>
                        <td className="px-4 py-2 text-xs text-slate-400">{m.label}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-accent-300">{m.format(valA)}{m.unit && <span className="text-slate-600 ml-0.5 text-[10px]">{m.unit}</span>}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-orange-300">{m.format(valB)}{m.unit && <span className="text-slate-600 ml-0.5 text-[10px]">{m.unit}</span>}</td>
                        <td className="px-4 py-2 text-right"><Delta a={valA} b={valB} metric={m} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
