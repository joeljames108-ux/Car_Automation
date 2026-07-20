import { useEffect, useMemo, useState } from "react";
import {
  Gauge, Trophy, Zap, Weight, TrendingUp, Flag, DollarSign,
  Building2, Search, X, Crown, Target, ArrowUpDown, Info, Loader2,
  ChevronLeft, ChevronRight, Filter,
} from "lucide-react";
import { useDesign, fmtPower, fmtWeight, fmtSpeed, fmtCurrency } from "../state/DesignContext";
import { supabase } from "../lib/supabase";
import type { Competitor, SortKey, SortOption } from "../sim/competitorTypes";

const SORT_OPTIONS: SortOption[] = [
  { key: "power_hp", label: "Power", unit: "hp", lowerIsBetter: false, group: "Performance" },
  { key: "torque_nm", label: "Torque", unit: "Nm", lowerIsBetter: false, group: "Performance" },
  { key: "top_speed_kmh", label: "Top Speed", unit: "km/h", lowerIsBetter: false, group: "Performance" },
  { key: "accel_0_100", label: "0-100 km/h", unit: "s", lowerIsBetter: true, group: "Performance" },
  { key: "accel_0_200", label: "0-200 km/h", unit: "s", lowerIsBetter: true, group: "Performance" },
  { key: "quarter_mile", label: "Quarter Mile", unit: "s", lowerIsBetter: true, group: "Performance" },
  { key: "braking_100_0", label: "Braking 100-0", unit: "m", lowerIsBetter: true, group: "Performance" },
  { key: "lateral_g", label: "Lateral G", unit: "g", lowerIsBetter: false, group: "Performance" },
  { key: "weight_kg", label: "Weight", unit: "kg", lowerIsBetter: true, group: "Performance" },
  { key: "nurburgring_lap", label: "Nürburgring Nordschleife", unit: "", lowerIsBetter: true, group: "Lap Times" },
  { key: "laguna_seca_lap", label: "Laguna Seca", unit: "", lowerIsBetter: true, group: "Lap Times" },
  { key: "top_gear_track_lap", label: "Top Gear Track", unit: "", lowerIsBetter: true, group: "Lap Times" },
  { key: "price_usd", label: "Price", unit: "$", lowerIsBetter: true, group: "Cost" },
];

const COMPANY_LOGOS: Record<string, string> = {
  Koenigsegg: "#e11d48",
  Bugatti: "#0ea5e9",
  Ferrari: "#dc2626",
  McLaren: "#f97316",
  Lamborghini: "#facc15",
  Porsche: "#e2e8f0",
  Rimac: "#22d3ee",
};

function formatLap(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toFixed(3).padStart(6, "0")}`;
}

export function Competitors() {
  const { design, sim, units } = useDesign();
  const [cars, setCars] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("power_hp");
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 24;

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("competitors").select("*");
      if (!active) return;
      if (error) {
        setError(error.message);
      } else {
        setCars((data ?? []) as Competitor[]);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const sortOption = SORT_OPTIONS.find((o) => o.key === sortKey)!;

  const yourCar = useMemo(() => ({
    company: "Your Design",
    model: design.name,
    power_hp: sim.peakPower,
    torque_nm: sim.peakTorque,
    weight_kg: sim.weight,
    top_speed_kmh: sim.topSpeed,
    accel_0_100: sim.accel0_100,
    accel_0_200: sim.accel100_200 || null,
    quarter_mile: sim.quarterMile || null,
    braking_100_0: sim.brakingDist || null,
    lateral_g: sim.lateralG || null,
    price_usd: Math.round(sim.targetPrice),
    nurburgring_lap: sim.lapTimes.find((l) => l.trackId === "nordschleife")?.time ?? null,
    laguna_seca_lap: sim.lapTimes.find((l) => l.trackId === "laguna")?.time ?? null,
    top_gear_track_lap: null,
  }), [design.name, sim]);

  const ranked = useMemo(() => {
    const all = [...cars];
    const getVal = (c: Competitor) => c[sortKey];
    all.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (va === null) return 1;
      if (vb === null) return -1;
      return sortOption.lowerIsBetter ? va - vb : vb - va;
    });
    return all;
  }, [cars, sortKey, sortOption.lowerIsBetter]);

  const brands = useMemo(() =>
    Array.from(new Set(cars.map((c) => c.company))).sort(),
    [cars]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = ranked;
    if (brandFilter) out = out.filter((c) => c.company === brandFilter);
    if (q) out = out.filter((c) =>
      `${c.company} ${c.model}`.toLowerCase().includes(q),
    );
    return out;
  }, [ranked, query, brandFilter]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(0, pageCount - 1));
  const pagedCars = useMemo(() =>
    filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [filtered, safePage]);

  const tableCars = useMemo(() => filtered.slice(0, 50), [filtered]);

  const yourRank = useMemo(() => {
    const all = [...ranked, yourCar as unknown as Competitor];
    const getVal = (c: Competitor) => c[sortKey];
    all.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (va === null) return 1;
      if (vb === null) return -1;
      return sortOption.lowerIsBetter ? va - vb : vb - va;
    });
    return { index: all.findIndex((c) => (c as { company: string }).company === "Your Design") + 1, total: all.length };
  }, [ranked, yourCar, sortKey, sortOption.lowerIsBetter]);

  const bestVal = useMemo(() => {
    const vals = ranked.map((c) => c[sortKey]).filter((v): v is number => v !== null);
    if (vals.length === 0) return null;
    return sortOption.lowerIsBetter ? Math.min(...vals) : Math.max(...vals);
  }, [ranked, sortKey, sortOption.lowerIsBetter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-accent-400" size={28} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="panel p-6 text-center text-danger-300 border-danger-500/30">
        Failed to load competitor data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 stagger">
      {/* Hero */}
      <div className="panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(34,211,238,0.3), transparent 60%)" }} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-500/20 border border-accent-500/30">
              <Trophy size={24} className="text-accent-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Competitors</h2>
              <p className="text-xs text-slate-500">Benchmark your design against the world's fastest production hypercars</p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 bg-base-850 border border-base-800 rounded-lg px-3 py-2">
            <Target size={14} className="text-accent-300" />
            <span className="text-xs text-slate-400">Your design ranks</span>
            <span className="text-sm font-bold text-accent-300 font-mono">#{yourRank.index}</span>
            <span className="text-xs text-slate-500">of {yourRank.total}</span>
            <span className="text-slate-600 mx-1">·</span>
            <span className="text-xs text-slate-400">on</span>
            <span className="text-xs font-semibold text-slate-200">{sortOption.label}</span>
          </div>
        </div>
      </div>

      {/* Your car summary */}
      <YourDesignBanner design={design} sim={sim} units={units} />

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex items-center gap-2 relative flex-1">
          <Search size={14} className="text-slate-500 absolute left-3" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder="Search by brand or model..."
            className="w-full bg-base-850 border border-base-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-2 text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 bg-base-850 border border-base-800 rounded-lg p-1">
          <Filter size={14} className="text-slate-500 ml-2" />
          <select
            value={brandFilter}
            onChange={(e) => { setBrandFilter(e.target.value); setPage(0); }}
            className="bg-transparent text-sm text-slate-200 focus:outline-none pr-2"
          >
            <option value="" className="bg-base-900">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b} value={b} className="bg-base-900">{b}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-base-850 border border-base-800 rounded-lg p-1">
          <ArrowUpDown size={14} className="text-slate-500 ml-2" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-transparent text-sm text-slate-200 focus:outline-none pr-2"
          >
            {(["Performance", "Lap Times", "Cost"] as const).map((group) => (
              <optgroup key={group} label={group}>
                {SORT_OPTIONS.filter((o) => o.group === group).map((o) => (
                  <option key={o.key} value={o.key} className="bg-base-900">
                    {o.label}{o.unit ? ` (${o.unit})` : ""}{o.lowerIsBetter ? " ↓" : " ↑"}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Results count + pagination */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>{filtered.length} cars{brandFilter ? ` · ${brandFilter}` : ""}{query ? ` matching "${query}"` : ""}</span>
        {pageCount > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(0)} disabled={safePage === 0}
              className="p-1 rounded hover:bg-base-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400">
              <ChevronLeft size={14} /><ChevronLeft size={14} className="-ml-3" />
            </button>
            <button onClick={() => setPage(safePage - 1)} disabled={safePage === 0}
              className="p-1 rounded hover:bg-base-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400">
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono text-slate-400 px-2">{safePage + 1} / {pageCount}</span>
            <button onClick={() => setPage(safePage + 1)} disabled={safePage >= pageCount - 1}
              className="p-1 rounded hover:bg-base-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400">
              <ChevronRight size={14} />
            </button>
            <button onClick={() => setPage(pageCount - 1)} disabled={safePage >= pageCount - 1}
              className="p-1 rounded hover:bg-base-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400">
              <ChevronRight size={14} /><ChevronRight size={14} className="-ml-3" />
            </button>
          </div>
        )}
      </div>

      {/* Car grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {pagedCars.map((car, i) => {
          const isBest = bestVal !== null && car[sortKey] === bestVal && car[sortKey] !== null;
          return <CarCard key={car.id} car={car} rank={safePage * PAGE_SIZE + i + 1} isBest={isBest} sortLabel={sortOption.label} />;
        })}
      </div>

      {/* Pagination bottom */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2 py-2">
          <button onClick={() => setPage(safePage - 1)} disabled={safePage === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-base-850 border border-base-800 text-sm text-slate-300 hover:border-accent-500/40 disabled:opacity-30">
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="font-mono text-sm text-slate-400">{safePage + 1} / {pageCount}</span>
          <button onClick={() => setPage(safePage + 1)} disabled={safePage >= pageCount - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-base-850 border border-base-800 text-sm text-slate-300 hover:border-accent-500/40 disabled:opacity-30">
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Comparison table */}
      <ComparisonTable cars={tableCars} yourCar={yourCar} sortKey={sortKey} sortOption={sortOption} totalCars={filtered.length} />

      {/* Lap time rankings */}
      <LapTimeBoard cars={ranked} yourCar={yourCar} />

      <div className="flex items-center gap-2 text-[11px] text-slate-600 px-1">
        <Info size={12} />
        Performance figures sourced from manufacturer and published press data. Lap times are official or independently verified where available.
      </div>
    </div>
  );
}

// ---------- Your Design banner ----------

function YourDesignBanner({ design, sim, units }: {
  design: { name: string }; sim: { peakPower: number; peakTorque: number; topSpeed: number; accel0_60: number; accel0_100: number; weight: number; targetPrice: number };
  units: "metric" | "imperial";
}) {
  return (
    <div className="panel-glow p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-5 rounded-full bg-accent-500" />
        <h3 className="text-sm font-bold text-accent-300 uppercase tracking-wider">Your Design</h3>
        <span className="text-xs text-slate-500 ml-1">{design.name}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <MiniStat icon={<Zap size={13} />} label="Power" value={fmtPower(sim.peakPower * 0.7457, units)} accent />
        <MiniStat icon={<Gauge size={13} />} label="Torque" value={`${sim.peakTorque} Nm`} />
        <MiniStat icon={<TrendingUp size={13} />} label="Top Speed" value={fmtSpeed(sim.topSpeed, units)} accent />
        <MiniStat icon={<Target size={13} />} label="0-100" value={`${sim.accel0_100.toFixed(1)}s`} />
        <MiniStat icon={<Weight size={13} />} label="Weight" value={fmtWeight(sim.weight, units)} />
        <MiniStat icon={<DollarSign size={13} />} label="Target Price" value={fmtCurrency(sim.targetPrice)} />
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-base-850 border border-base-800 rounded-lg px-3 py-2">
      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">
        {icon}{label}
      </div>
      <div className={`font-mono font-bold text-sm ${accent ? "text-accent-300" : "text-slate-200"}`}>{value}</div>
    </div>
  );
}

// ---------- Car card ----------

function brandColor(company: string): string {
  if (COMPANY_LOGOS[company]) return COMPANY_LOGOS[company];
  let h = 0;
  for (let i = 0; i < company.length; i++) h = (h * 31 + company.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

function CarCard({ car, rank, isBest, sortLabel }: { car: Competitor; rank: number; isBest: boolean; sortLabel: string }) {
  const [imgOk, setImgOk] = useState(true);
  const logoColor = brandColor(car.company);
  const showImg = car.image_url && imgOk;
  const initials = car.company.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <div className={`panel overflow-hidden group transition-all hover:border-accent-500/40 ${isBest ? "ring-1 ring-accent-500/40" : ""}`}>
      <div className="relative h-36 bg-base-950 overflow-hidden">
        {showImg ? (
          <img
            src={car.image_url!}
            alt={`${car.company} ${car.model}`}
            onError={() => setImgOk(false)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: `radial-gradient(circle at 50% 40%, ${logoColor}1a, transparent 70%)` }}>
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${logoColor}1f`, border: `1px solid ${logoColor}40` }}>
                <span className="text-xl font-black tracking-tight" style={{ color: logoColor }}>{initials}</span>
              </div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-transparent to-transparent" />
        {isBest && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-accent-500/20 border border-accent-500/40 rounded px-1.5 py-0.5">
            <Crown size={11} className="text-accent-300" />
            <span className="text-[9px] font-bold text-accent-300 uppercase">Best {sortLabel}</span>
          </div>
        )}
        <div className="absolute top-2 left-2 w-6 h-6 rounded-md bg-base-950/80 border border-base-700 flex items-center justify-center">
          <span className="text-xs font-mono font-bold text-slate-300">{rank}</span>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: `${logoColor}22`, border: `1px solid ${logoColor}55` }}>
            <Building2 size={14} style={{ color: logoColor }} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{car.company}</div>
            <div className="text-sm font-bold text-slate-100 leading-tight">{car.model}</div>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-1.5">
          <CardStat label="Power" value={`${car.power_hp}`} unit="hp" />
          <CardStat label="0-100" value={`${car.accel_0_100.toFixed(1)}`} unit="s" />
          <CardStat label="Top Speed" value={`${car.top_speed_kmh}`} unit="km/h" />
          <CardStat label="Weight" value={`${car.weight_kg}`} unit="kg" />
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-base-800">
          <span className="text-[10px] text-slate-500">{car.engine_desc}</span>
          <span className="text-[10px] text-slate-600">{car.drivetrain}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">{car.year ?? "—"} · {car.country}</span>
          <span className="text-xs font-mono font-bold text-slate-300">{fmtCurrency(car.price_usd)}</span>
        </div>
      </div>
    </div>
  );
}

function CardStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-base-850 rounded px-2 py-1.5">
      <div className="label-mono">{label}</div>
      <div className="font-mono text-sm text-slate-200">{value}<span className="text-slate-500 text-[10px] ml-0.5">{unit}</span></div>
    </div>
  );
}

// ---------- Comparison table ----------

function ComparisonTable({ cars, yourCar, sortKey, sortOption, totalCars }: {
  cars: Competitor[];
  yourCar: Record<string, number | string | null>;
  sortKey: SortKey;
  sortOption: SortOption;
  totalCars: number;
}) {
  const metrics: { key: SortKey; label: string; fmt: (v: number) => string }[] = [
    { key: "power_hp", label: "Power", fmt: (v) => `${v} hp` },
    { key: "torque_nm", label: "Torque", fmt: (v) => `${v} Nm` },
    { key: "weight_kg", label: "Weight", fmt: (v) => `${v} kg` },
    { key: "top_speed_kmh", label: "Top Speed", fmt: (v) => `${v} km/h` },
    { key: "accel_0_100", label: "0-100", fmt: (v) => `${v.toFixed(1)}s` },
    { key: "accel_0_200", label: "0-200", fmt: (v) => `${v.toFixed(1)}s` },
    { key: "quarter_mile", label: "1/4 Mile", fmt: (v) => `${v.toFixed(1)}s` },
    { key: "braking_100_0", label: "Braking", fmt: (v) => `${v.toFixed(0)}m` },
    { key: "lateral_g", label: "Lat. G", fmt: (v) => `${v.toFixed(2)}g` },
    { key: "price_usd", label: "Price", fmt: (v) => fmtCurrency(v) },
  ];

  const best: Record<string, number> = {};
  for (const m of metrics) {
    const all = [...cars, yourCar as unknown as Competitor];
    const vals = all.map((c) => c[m.key]).filter((v): v is number => v !== null);
    if (vals.length === 0) continue;
    const mOpt = SORT_OPTIONS.find((o) => o.key === m.key)!;
    best[m.key] = mOpt.lowerIsBetter ? Math.min(...vals) : Math.max(...vals);
  }

  const renderCell = (val: number | null, mkey: SortKey) => {
    if (val === null) return <span className="text-slate-600">—</span>;
    const m = metrics.find((mm) => mm.key === mkey)!;
    const isBest = val === best[mkey];
    return <span className={isBest ? "text-ok-400 font-bold" : "text-slate-200"}>{m.fmt(val)}</span>;
  };

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-base-800">
        <Gauge size={16} className="text-accent-300" />
        <h3 className="text-sm font-bold text-slate-200">Spec Comparison</h3>
        <span className="text-[10px] text-slate-500 ml-1">Top {Math.min(50, totalCars)} of {totalCars} · Green = best in column</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-base-850 text-slate-400">
              <th className="text-left px-3 py-2 font-medium sticky left-0 bg-base-850">Car</th>
              {metrics.map((m) => (
                <th key={m.key} className={`text-right px-3 py-2 font-medium whitespace-nowrap ${sortKey === m.key ? "text-accent-300" : ""}`}>
                  {m.label}{sortKey === m.key && <span className="text-accent-400 ml-0.5">{sortOption.lowerIsBetter ? "↓" : "↑"}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-base-800 bg-accent-500/5">
              <td className="px-3 py-2 font-semibold text-accent-300 sticky left-0 bg-accent-500/5 whitespace-nowrap">★ Your Design</td>
              {metrics.map((m) => (
                <td key={m.key} className="text-right px-3 py-2 font-mono">
                  {renderCell((yourCar[m.key] as number | null) ?? null, m.key)}
                </td>
              ))}
            </tr>
            {cars.map((car) => (
              <tr key={car.id} className="border-b border-base-800/50 hover:bg-base-850/40">
                <td className="px-3 py-2 text-slate-300 sticky left-0 bg-base-900 whitespace-nowrap">
                  <span className="text-slate-500">{car.company}</span> {car.model}
                </td>
                {metrics.map((m) => (
                  <td key={m.key} className="text-right px-3 py-2 font-mono">
                    {renderCell(car[m.key], m.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Lap time board ----------

function LapTimeBoard({ cars, yourCar }: { cars: Competitor[]; yourCar: Record<string, number | string | null> }) {
  const tracks: { key: SortKey; label: string; flag: string }[] = [
    { key: "nurburgring_lap", label: "Nürburgring Nordschleife", flag: "DE" },
    { key: "laguna_seca_lap", label: "Laguna Seca", flag: "US" },
    { key: "top_gear_track_lap", label: "Top Gear Test Track", flag: "UK" },
  ];

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-base-800">
        <Flag size={16} className="text-accent-300" />
        <h3 className="text-sm font-bold text-slate-200">Lap Time Leaderboard</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-base-800">
        {tracks.map((track) => {
          const all = [...cars, yourCar as unknown as Competitor];
          const ranked = all
            .map((c) => ({ name: `${(c as { company: string }).company} ${(c as { model?: string }).model ?? ""}`.trim(), time: c[track.key] as number | null, isYou: (c as { company: string }).company === "Your Design" }))
            .sort((a, b) => {
              if (a.time === null) return 1;
              if (b.time === null) return -1;
              return a.time - b.time;
            });
          const valid = ranked.filter((r) => r.time !== null);
          return (
            <div key={track.key} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-base-850 border border-base-700 rounded px-1.5 py-0.5">{track.flag}</span>
                <span className="text-xs font-semibold text-slate-300">{track.label}</span>
                <span className="text-[10px] text-slate-600 ml-auto">{valid.length} times</span>
              </div>
              <div className="space-y-1">
                {ranked.slice(0, 8).map((r, i) => (
                  <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded ${r.isYou ? "bg-accent-500/10 border border-accent-500/30" : "hover:bg-base-850/50"}`}>
                    <span className={`w-5 text-center font-mono text-[11px] ${i === 0 ? "text-warn-400 font-bold" : "text-slate-500"}`}>{i + 1}</span>
                    <span className={`flex-1 text-xs truncate ${r.isYou ? "text-accent-300 font-semibold" : "text-slate-300"}`}>{r.isYou ? "★ " : ""}{r.name}</span>
                    <span className="font-mono text-xs text-slate-200">{formatLap(r.time)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
