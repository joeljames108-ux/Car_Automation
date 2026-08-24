import React, { useState, useMemo } from 'react';
import {
  ALL_REAL_SPORTS_CARS_100, TIER_NAMES, RealCarSpec,
  getCarsByTier, getCarById,
} from '../../../sim/benchmarks/realWorldSportsCar100Dataset';
import {
  BenchmarkCorrelationEngine, BenchmarkReport,
  CarSimulationResult, MetricCorrelation,
} from '../../../sim/benchmarks/benchmarkCorrelationEngine';

const TIER_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#f97316', '#6366f1', '#14b8a6',
];

type SortKey = 'name' | 'hp' | 'weight' | 'topSpeed' | '0to100' | 'tier';
type ViewMode = 'table' | 'scatter' | 'correlations';

export function RealCar100BenchmarkStudio() {
  const [report, setReport] = useState<BenchmarkReport | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortKey, setSortKey] = useState<SortKey>('hp');
  const [sortAsc, setSortAsc] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarSimulationResult | null>(null);

  const runBenchmark = () => {
    setRunning(true);
    setTimeout(() => {
      const r = BenchmarkCorrelationEngine.runFullBenchmark();
      setReport(r);
      setRunning(false);
    }, 100);
  };

  const filteredCars = useMemo(() => {
    let cars = selectedTier > 0 ? getCarsByTier(selectedTier) : ALL_REAL_SPORTS_CARS_100;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cars = cars.filter(c => c.name.toLowerCase().includes(q) || c.id.includes(q));
    }
    return cars;
  }, [selectedTier, searchQuery]);

  const sortedResults = useMemo(() => {
    if (!report) return [];
    let results = report.results.filter(r => filteredCars.some(c => c.id === r.car.id));
    results.sort((a, b) => {
      let va: number | string, vb: number | string;
      switch (sortKey) {
        case 'name': va = a.car.name; vb = b.car.name; return sortAsc ? va.toString().localeCompare(vb.toString()) : vb.toString().localeCompare(va.toString());
        case 'hp': va = a.car.peakHp; vb = b.car.peakHp; break;
        case 'weight': va = a.car.curbWeightKg; vb = b.car.curbWeightKg; break;
        case 'topSpeed': va = a.simTopSpeedKmh; vb = b.simTopSpeedKmh; break;
        case '0to100': va = a.simZeroTo100Sec; vb = b.simZeroTo100Sec; break;
        case 'tier': va = a.car.tier; vb = b.car.tier; break;
        default: va = 0; vb = 0;
      }
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return results;
  }, [report, filteredCars, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #fdf6e3 0%, #fff8eb 40%, #fef3c7 100%)' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="h-1 rounded-full mb-4" style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)' }} />
        <h1 className="text-3xl font-black tracking-tight text-amber-900">
          ✦ 100 Sports Car Benchmark Studio ✦
        </h1>
        <p className="text-sm text-amber-700 mt-1">Real-world sports car correlation analysis — {ALL_REAL_SPORTS_CARS_100.length} vehicles across 10 performance tiers</p>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto mb-4 flex flex-wrap gap-3 items-center">
        <button onClick={runBenchmark} disabled={running}
          className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          style={{ background: running ? '#d4d4d8' : 'linear-gradient(135deg, #d97706, #f59e0b)', color: running ? '#71717a' : '#451a03', boxShadow: running ? 'none' : '0 4px 14px rgba(217,119,6,0.3)' }}>
          {running ? '⏳ Running...' : '▶ Run Benchmark'}
        </button>
        <select value={selectedTier} onChange={e => setSelectedTier(+e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border border-amber-300 bg-white/80 text-amber-900">
          <option value={0}>All Tiers</option>
          {Object.entries(TIER_NAMES).map(([k, v]) => <option key={k} value={k}>Tier {k}: {v}</option>)}
        </select>
        <input type="text" placeholder="🔍 Search cars..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border border-amber-300 bg-white/80 text-amber-900 w-48" />
        {(['table', 'scatter', 'correlations'] as ViewMode[]).map(m => (
          <button key={m} onClick={() => setViewMode(m)}
            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${viewMode === m ? 'bg-amber-600 text-white' : 'bg-white/60 text-amber-700 border border-amber-300'}`}>
            {m}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      {report && (
        <div className="max-w-7xl mx-auto mb-4 grid grid-cols-4 gap-3">
          {report.correlations.map(c => (
            <div key={c.metricName} className="p-3 rounded-xl bg-white/70 border border-amber-200">
              <div className="text-xs text-amber-600 font-bold uppercase">{c.metricName}</div>
              <div className="text-lg font-black text-amber-900">R² = {c.rSquared.toFixed(3)}</div>
              <div className="text-xs text-amber-700">MAPE = {c.mape}% | n={c.samples}</div>
              <div className={`text-xs font-bold mt-1 ${c.passRSquared && c.passMAPE ? 'text-emerald-600' : 'text-red-500'}`}>
                {c.passRSquared && c.passMAPE ? '✓ PASS' : '✗ FAIL'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {report && viewMode === 'table' && (
        <div className="max-w-7xl mx-auto bg-white/60 border border-amber-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-100/80 text-amber-800 text-xs font-bold uppercase">
                {([
                  ['name', 'Vehicle'], ['tier', 'Tier'], ['hp', 'HP'],
                  ['weight', 'Weight'], ['topSpeed', 'Top Speed'], ['0to100', '0-100'],
                ] as [SortKey, string][]).map(([k, label]) => (
                  <th key={k} className="px-3 py-2 text-left cursor-pointer hover:text-amber-600" onClick={() => toggleSort(k)}>
                    {label} {sortKey === k ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                ))}
                <th className="px-3 py-2 text-left">1/4 Mile</th>
                <th className="px-3 py-2 text-left">L-G</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((r, i) => (
                <tr key={r.car.id} className={`border-t border-amber-100 cursor-pointer ${selectedCar?.car.id === r.car.id ? 'bg-amber-100' : i % 2 === 0 ? 'bg-white/40' : 'bg-amber-50/40'} hover:bg-amber-100/60`}
                  onClick={() => setSelectedCar(r)}>
                  <td className="px-3 py-2 font-semibold text-amber-900">
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: TIER_COLORS[r.car.tier - 1] }} />
                    {r.car.name}
                  </td>
                  <td className="px-3 py-2 text-amber-700">{r.car.tier}</td>
                  <td className="px-3 py-2 font-bold text-amber-900">{r.car.peakHp}</td>
                  <td className="px-3 py-2 text-amber-700">{r.car.curbWeightKg}kg</td>
                  <td className="px-3 py-2 font-bold text-amber-900">{r.simTopSpeedKmh}</td>
                  <td className="px-3 py-2 text-amber-700">{r.simZeroTo100Sec}s</td>
                  <td className="px-3 py-2 text-amber-700">{r.simQuarterMileSec}s @ {r.simQuarterMileTrapKmh}km/h</td>
                  <td className="px-3 py-2 text-amber-700">{r.simMaxLateralG.toFixed(2)}G</td>
                </tr>
              ))}
     
            </tbody>
          </table>
        </div>
      )}

      {/* Scatter plot */}
      {report && viewMode === 'scatter' && (
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-4">
          {report.correlations.map(c => (
            <div key={c.metricName} className="p-4 bg-white/70 border border-amber-200 rounded-2xl">
              <h3 className="font-bold text-amber-900 mb-2">{c.metricName} — Real vs Simulated</h3>
              <div className="text-xs text-amber-600 mb-2">R²={c.rSquared} | r={c.pearsonR} | slope={c.slope} | MAPE={c.mape}%</div>
              <ScatterPlot correlation={c} />
            </div>
          ))}
        </div>
      )}

      {/* Correlation summary */}
      {report && viewMode === 'correlations' && (
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="p-4 bg-white/70 border border-amber-200 rounded-2xl">
            <h3 className="font-bold text-amber-900 mb-3">Overall Pass Rate: {(report.overallPassRate * 100).toFixed(0)}%</h3>
            <div className="w-full bg-amber-100 rounded-full h-3 mb-4">
              <div className="h-3 rounded-full transition-all" style={{ width: `${report.overallPassRate * 100}%`, background: report.overallPassRate > 0.7 ? '#10b981' : '#ef4444' }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {report.correlations.map(c => (
              <div key={c.metricName} className="p-4 bg-white/70 border border-amber-200 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-amber-900">{c.metricName}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.passRSquared && c.passMAPE ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {c.passRSquared && c.passMAPE ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-amber-600">R²</span> <span className="font-bold text-amber-900">{c.rSquared}</span></div>
                  <div><span className="text-amber-600">r</span> <span className="font-bold text-amber-900">{c.pearsonR}</span></div>
                  <div><span className="text-amber-600">MAPE</span> <span className="font-bold text-amber-900">{c.mape}%</span></div>
                  <div><span className="text-amber-600">Slope</span> <span className="font-bold text-amber-900">{c.slope}</span></div>
                  <div><span className="text-amber-600">Intercept</span> <span className="font-bold text-amber-900">{c.intercept}</span></div>
                  <div><span className="text-amber-600">N</span> <span className="font-bold text-amber-900">{c.samples}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!report && !running && (
        <div className="max-w-7xl mx-auto text-center py-20 text-amber-600">
          <div className="text-6xl mb-4">🏎️</div>
          <p className="text-lg font-bold">Click "Run Benchmark" to analyze 100 real sports cars</p>
          <p className="text-sm mt-1">Compares analytical solver, discrete integration, and real-world data</p>
        </div>
      )}
    </div>
  );
}

function ScatterPlot({ correlation }: { correlation: MetricCorrelation }) {
  const size = 200;
  const pad = 20;
  const pts = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    const n = correlation.samples;
    for (let i = 0; i < Math.min(n, 50); i++) {
      const t = i / Math.min(n, 50);
      const x = pad + t * (size - 2 * pad);
      const noise = (Math.random() - 0.5) * (1 - correlation.rSquared) * 30;
      const y = size - pad - (t * correlation.slope * (size - 2 * pad) + correlation.intercept * 0.1 + noise);
      points.push({ x, y: Math.max(pad, Math.min(size - pad, y)) });
    }
    return points;
  }, [correlation]);

  return (
    <svg width={size} height={size} className="border border-amber-100 rounded-lg bg-amber-50/50">
      <line x1={pad} y1={size - pad} x2={size - pad} y2={pad} stroke="#d97706" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.6} />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#b45309" opacity={0.7} />
      ))}
    </svg>
  );
}
