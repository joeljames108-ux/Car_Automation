import React, { useState, useMemo } from 'react';
import {
  ALL_REAL_SPORTS_CARS_100, TIER_NAMES,
  getCarsByTier,
} from '../../../sim/benchmarks/realWorldSportsCar100Dataset';
import {
  BenchmarkCorrelationEngine, BenchmarkReport,
  CarSimulationResult, MetricCorrelation,
} from '../../../sim/benchmarks/benchmarkCorrelationEngine';
import { CircuitLapTimeSimulator, LapSimulationResult } from '../../../sim/track/circuitLapTimeSimulator';
import { mapRealCarToSolverParams } from '../../../sim/benchmarks/realCarSimulatorMapper';

const TIER_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#f97316', '#6366f1', '#14b8a6',
];

type SortKey = 'name' | 'hp' | 'weight' | 'topSpeed' | '0to100' | 'tier';
type ViewMode = 'table' | 'scatter' | 'correlations' | 'telemetry';
type MetricKey = 'Top Speed' | '0-100 km/h' | 'Quarter Mile Time' | 'Nurburgring Lap';

interface ScatterPair { real: number; sim: number; tier: number; id: string }

/** Extract the real/simulated pairs behind a metric correlation row. */
function pairsForMetric(
  results: CarSimulationResult[],
  metric: MetricKey,
  solver: 'analytical' | 'discrete'
): ScatterPair[] {
  const rows = results.filter(r =>
    metric !== 'Nurburgring Lap' || r.car.realNurburgringSec > 240
  );
  switch (metric) {
    case 'Top Speed':
      return rows.map(r => ({ real: r.car.realTopSpeedKmh, sim: r.simTopSpeedKmh, tier: r.car.tier, id: r.car.id }));
    case '0-100 km/h':
      return rows.map(r => ({ real: r.car.realZeroTo100Sec, sim: r.simZeroTo100Sec, tier: r.car.tier, id: r.car.id }));
    case 'Quarter Mile Time':
      return rows.filter(r => r.car.realQuarterMileSec > 0)
        .map(r => ({ real: r.car.realQuarterMileSec, sim: r.simQuarterMileSec, tier: r.car.tier, id: r.car.id }));
    case 'Nurburgring Lap':
      return rows.map(r => ({
        real: r.car.realNurburgringSec,
        sim: solver === 'discrete' ? r.lapSimNurburgringSec : r.simNurburgringSec,
        tier: r.car.tier,
        id: r.car.id,
      }));
  }
}

export function RealCar100BenchmarkStudio() {
  const [report, setReport] = useState<BenchmarkReport | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [solverMode, setSolverMode] = useState<'analytical' | 'discrete'>('analytical');
  const [scatterMetric, setScatterMetric] = useState<MetricKey>('Top Speed');
  const [sortKey, setSortKey] = useState<SortKey>('hp');
  const [sortAsc, setSortAsc] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarSimulationResult | null>(null);
  const [telemetry, setTelemetry] = useState<LapSimulationResult | null>(null);

  const runBenchmark = () => {
    setRunning(true);
    setTimeout(() => {
      const r = BenchmarkCorrelationEngine.runFullBenchmark();
      setReport(r);
      setRunning(false);
    }, 60);
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
    const visible = new Set(filteredCars.map(c => c.id));
    const results = report.results.filter(r => visible.has(r.car.id));
    results.sort((a, b) => {
      let va: number | string, vb: number | string;
      switch (sortKey) {
        case 'name': return sortAsc ? a.car.name.localeCompare(b.car.name) : b.car.name.localeCompare(a.car.name);
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

  const selectCarWithTelemetry = (r: CarSimulationResult) => {
    setSelectedCar(r);
    try {
      const { tireMu, downforceNAt200 } = mapRealCarToSolverParams(r.car);
      const isEV = r.car.engineLayout.startsWith('Electric');
      const isAWD = r.car.drivetrain === 'AWD' || r.car.drivetrain === 'Mid_AWD';
      const tt = r.car.transmission;
      const lapResult = CircuitLapTimeSimulator.simulateLap(
        CircuitLapTimeSimulator.PRESET_TRACKS.NURBURGRING_NORDSCHLEIFE,
        r.car.curbWeightKg,
        r.car.peakHp,
        tireMu,
        downforceNAt200,
        {
          driveAxleFraction: isEV || isAWD ? 0.95 : Math.max(0.42, 1 - r.car.weightDistFrontPct / 100),
          gearCount: r.car.gearCount,
          isElectric: isEV,
        }
      );
      setTelemetry(lapResult);
    } catch {
      setTelemetry(null);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const scatterPairs = useMemo(
    () => (report ? pairsForMetric(report.results, scatterMetric, solverMode) : []),
    [report, scatterMetric, solverMode]
  );
  const scatterCorr = useMemo(
    () => report?.correlations.find(c => c.metricName === scatterMetric && (c.solver === solverMode || c.solver === 'dual')),
    [report, scatterMetric, solverMode]
  );

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #fdf6e3 0%, #fff8eb 40%, #fef3c7 100%)' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="h-1 rounded-full mb-4" style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)' }} />
        <h1 className="text-3xl font-black tracking-tight text-amber-900">
          ✦ 100 Sports Car Benchmark Studio ✦
        </h1>
        <p className="text-sm text-amber-700 mt-1">
          Real-world correlation analysis — {ALL_REAL_SPORTS_CARS_100.length} vehicles across 10 performance tiers ·
          analytical solver vs discrete segment integrator vs verified published data
        </p>
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
        {(['table', 'scatter', 'correlations', 'telemetry'] as ViewMode[]).map(m => (
          <button key={m} onClick={() => setViewMode(m)}
            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${viewMode === m ? 'bg-amber-600 text-white' : 'bg-white/60 text-amber-700 border border-amber-300'}`}>
            {m}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      {report && (
        <div className="max-w-7xl mx-auto mb-4 grid grid-cols-4 gap-3">
          {report.correlations.filter(c => c.metricName !== 'Analytical vs Discrete Lap').slice(0, 4).map(c => (
            <div key={c.metricName + c.solver} className="p-3 rounded-xl bg-white/70 border border-amber-200">
              <div className="text-xs text-amber-600 font-bold uppercase">{c.metricName} <span className="font-normal">({c.solver})</span></div>
              <div className="text-lg font-black text-amber-900">
                {c.rSquared >= c.pearsonR * c.pearsonR ? `R² = ${c.rSquared.toFixed(3)}` : `r = ${c.pearsonR.toFixed(3)}`}
              </div>
              <div className="text-xs text-amber-700">MAPE = {c.mape}% | n={c.samples}</div>
              <div className={`text-xs font-bold mt-1 ${c.passRSquared && c.passMAPE ? 'text-emerald-600' : 'text-red-500'}`}>
                {c.passRSquared && c.passMAPE ? '✓ PASS' : '✗ FAIL'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results table */}
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
                <th className="px-3 py-2 text-left">Real Top / Sim</th>
                <th className="px-3 py-2 text-left">Real 0-100 / Sim</th>
                <th className="px-3 py-2 text-left">NRing Sim</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((r, i) => (
                <tr key={r.car.id}
                  className={`border-t border-amber-100 cursor-pointer ${selectedCar?.car.id === r.car.id ? 'bg-amber-100' : i % 2 === 0 ? 'bg-white/40' : 'bg-amber-50/40'} hover:bg-amber-100/60`}
                  onClick={() => selectCarWithTelemetry(r)}>
                  <td className="px-3 py-2 font-semibold text-amber-900">
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: TIER_COLORS[r.car.tier - 1] }} />
                    {r.car.name}
                  </td>
                  <td className="px-3 py-2 text-amber-700">{r.car.tier}</td>
                  <td className="px-3 py-2 font-bold text-amber-900">{r.car.peakHp}</td>
                  <td className="px-3 py-2 text-amber-700">{r.car.curbWeightKg}kg</td>
                  <td className="px-3 py-2 text-amber-700">{r.simTopSpeedKmh}</td>
                  <td className="px-3 py-2 text-amber-700">{r.simZeroTo100Sec}s</td>
                  <td className={`px-3 py-2 ${Math.abs(r.simTopSpeedKmh - r.car.realTopSpeedKmh) / r.car.realTopSpeedKmh < 0.05 ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {r.car.realTopSpeedKmh} / {r.simTopSpeedKmh}
                  </td>
                  <td className={`px-3 py-2 ${Math.abs(r.simZeroTo100Sec - r.car.realZeroTo100Sec) / r.car.realZeroTo100Sec < 0.08 ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {r.car.realZeroTo100Sec}s / {r.simZeroTo100Sec}s
                  </td>
                  <td className="px-3 py-2 text-amber-700">{r.lapSimNurburgringSec.toFixed(0)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Scatter plots — real data pairs */}
      {report && viewMode === 'scatter' && (
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            {(['Top Speed', '0-100 km/h', 'Quarter Mile Time', 'Nurburgring Lap'] as MetricKey[]).map(m => (
              <button key={m} onClick={() => setScatterMetric(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${scatterMetric === m ? 'bg-amber-600 text-white' : 'bg-white/70 text-amber-700 border border-amber-300'}`}>
                {m}
              </button>
            ))}
            {scatterMetric === 'Nurburgring Lap' && (
              <span className="flex gap-1 ml-2">
                {(['analytical', 'discrete'] as const).map(s => (
                  <button key={s} onClick={() => setSolverMode(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${solverMode === s ? 'bg-amber-800 text-white' : 'bg-white/70 text-amber-700 border border-amber-300'}`}>
                    {s === 'analytical' ? 'Analytical' : 'Discrete Integration'}
                  </button>
                ))}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/70 border border-amber-200 rounded-2xl">
              <h3 className="font-bold text-amber-900 mb-1">{scatterMetric} — Real vs Simulated</h3>
              {scatterCorr && (
                <div className="text-xs text-amber-600 mb-2">
                  R²={scatterCorr.rSquared} | r={scatterCorr.pearsonR} | slope={scatterCorr.slope} | intercept={scatterCorr.intercept} | MAPE={scatterCorr.mape}% | n={scatterCorr.samples}
                </div>
              )}
              <ScatterPlot pairs={scatterPairs} />
            </div>
            <div className="p-4 bg-white/70 border border-amber-200 rounded-2xl">
              <h3 className="font-bold text-amber-900 mb-2">Δ Residuals (sim − real)</h3>
              <ResidualHistogram pairs={scatterPairs} />
            </div>
          </div>
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
            <div className="text-xs text-amber-700">
              Inter-solver agreement (analytical ↔ discrete Nordschleife): R² = {report.analyticalVsDiscreteCorrelation.rSquared} |
              r = {report.analyticalVsDiscreteCorrelation.pearsonR} | MAPE = {report.analyticalVsDiscreteCorrelation.mape}% | n = {report.analyticalVsDiscreteCorrelation.samples}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...report.correlations, report.analyticalVsDiscreteCorrelation].map((c, i) => (
              <div key={c.metricName + c.solver + i} className="p-4 bg-white/70 border border-amber-200 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-amber-900">{c.metricName} <span className="text-xs text-amber-500 font-normal">({c.solver})</span></h3>
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

      {/* Selected-car telemetry */}
      {report && viewMode === 'telemetry' && selectedCar && (
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="p-4 bg-white/70 border border-amber-200 rounded-2xl">
            <h3 className="font-bold text-amber-900">{selectedCar.car.name} — dual-engine delta matrix</h3>
            <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
              {([
                ['Top speed', `${selectedCar.car.realTopSpeedKmh}`, `${selectedCar.simTopSpeedKmh} km/h`],
                ['0-100 km/h', `${selectedCar.car.realZeroTo100Sec}s`, `${selectedCar.simZeroTo100Sec}s`],
                ['0-200 km/h', `${selectedCar.car.realZeroTo200Sec || '—'}s`, `${selectedCar.simZeroTo200Sec}s`],
                ['1/4 mile', `${selectedCar.car.realQuarterMileSec || '—'}s`, `${selectedCar.simQuarterMileSec}s @ ${selectedCar.simQuarterMileTrapKmh}`],
                ['Max lateral', `${selectedCar.car.realMaxLateralG}g`, `${selectedCar.simMaxLateralG}g`],
                ['Braking 100-0', `${selectedCar.car.realBrakingDist100To0M}m`, `${selectedCar.simBrakingDist100To0M}m`],
                ['Nürburgring (analytical)', selectedCar.car.realNurburgringSec ? fmtLap(selectedCar.car.realNurburgringSec) : '—', fmtLap(selectedCar.simNurburgringSec)],
                ['Nürburgring (discrete)', selectedCar.car.realNurburgringSec ? fmtLap(selectedCar.car.realNurburgringSec) : '—', fmtLap(selectedCar.lapSimNurburgringSec)],
              ] as [string, string, string][]).map(([label, real, sim]) => (
                <div key={label} className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="text-xs text-amber-600 font-bold uppercase">{label}</div>
                  <div className="text-amber-800">real <b>{real}</b></div>
                  <div className="text-amber-900">sim <b>{sim}</b></div>
                </div>
              ))}
            </div>
          </div>
          {telemetry && (
            <div className="p-4 bg-white/70 border border-amber-200 rounded-2xl">
              <h3 className="font-bold text-amber-900 mb-1">
                Discrete-integration telemetry — {telemetry.track.name} · {telemetry.lapTimeString} · avg {telemetry.avgSpeedKmh} km/h
              </h3>
              <SpeedTrace telemetry={telemetry.telemetryTrace} />
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!report && !running && (
        <div className="max-w-7xl mx-auto text-center py-20 text-amber-600">
          <div className="text-6xl mb-4">🏎️</div>
          <p className="text-lg font-bold">Click "Run Benchmark" to analyze 100 real sports cars</p>
          <p className="text-sm mt-1">Compares the analytical dynamics solver and the discrete segment integrator against verified published performance</p>
        </div>
      )}
    </div>
  );
}


function fmtLap(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(1);
  return `${m}:${parseFloat(s) < 10 ? '0' : ''}${s}`;
}

function ScatterPlot({ pairs }: { pairs: ScatterPair[] }) {
  const size = 320;
  const pad = 34;
  const { pts, loX, hiX } = useMemo(() => {
    if (pairs.length === 0) return { pts: [], loX: 0, hiX: 1 };
    const all = pairs.flatMap(p => [p.real, p.sim]);
    let lo = Math.min(...all);
    let hi = Math.max(...all);
    const span = hi - lo || 1;
    lo -= span * 0.05;
    hi += span * 0.05;
    const sx = (v: number) => pad + ((v - lo) / (hi - lo)) * (size - 2 * pad);
    const sy = (v: number) => size - pad - ((v - lo) / (hi - lo)) * (size - 2 * pad);
    return {
      pts: pairs.map(p => ({ ...p, x: sx(p.real), y: sy(p.sim) })),
      loX: lo, hiX: hi,
    };
  }, [pairs]);

  const ticks = [loX, (loX + hiX) / 2, hiX];

  return (
    <svg width={size} height={size} className="border border-amber-100 rounded-lg bg-amber-50/50">
      {/* parity line */}
      <line x1={pad} y1={size - pad} x2={size - pad} y2={pad} stroke="#d97706" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.55} />
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad + (i * (size - 2 * pad)) / 2} y1={size - pad} x2={pad + (i * (size - 2 * pad)) / 2} y2={size - pad + 4} stroke="#d97706" strokeWidth={1} />
          <text x={pad + (i * (size - 2 * pad)) / 2} y={size - pad + 14} fontSize={8} fill="#92400e" textAnchor="middle">{t.toFixed(0)}</text>
        </g>
      ))}
      {pts.map((p, i) => (
        <circle key={`${p.id}-${i}`} cx={p.x} cy={p.y} r={3.5}
          fill={TIER_COLORS[(p.tier - 1) % TIER_COLORS.length]} opacity={0.75}
          stroke="#78350f" strokeWidth={0.5}>
          <title>{`${p.id}: real ${p.real.toFixed(1)} vs sim ${p.sim.toFixed(1)}`}</title>
        </circle>
      ))}
    </svg>
  );
}

function ResidualHistogram({ pairs }: { pairs: ScatterPair[] }) {
  const bins = useMemo(() => {
    const residuals = pairs.map(p => ((p.sim - p.real) / p.real) * 100);
    const maxAbs = Math.max(5, ...residuals.map(r => Math.abs(r)));
    const binCount = 15;
    const counts = new Array(binCount).fill(0);
    for (const r of residuals) {
      const idx = Math.min(binCount - 1, Math.floor(((r + maxAbs) / (2 * maxAbs)) * binCount));
      counts[idx]++;
    }
    const maxCount = Math.max(...counts, 1);
    return { counts, maxAbs, maxCount, binCount };
  }, [pairs]);
  const width = 320, height = 180, pad = 22;

  return (
    <svg width={width} height={height} className="border border-amber-100 rounded-lg bg-amber-50/50">
      <line x1={width / 2} y1={pad} x2={width / 2} y2={height - pad} stroke="#d97706" strokeWidth={1} strokeDasharray="3 2" />
      {bins.counts.map((count, i) => {
        const bw = (width - 2 * pad) / bins.binCount;
        const bh = (count / bins.maxCount) * (height - 2 * pad);
        const centerPct = ((i + 0.5) / bins.binCount) * 2 - 1;
        return (
          <rect key={i}
            x={pad + i * bw + 0.5} y={height - pad - bh} width={bw - 1} height={bh}
            fill={centerPct < 0 ? '#3b82f6' : '#f59e0b'} opacity={0.8} rx={1} />
        );
      })}
      <text x={pad} y={height - 6} fontSize={9} fill="#92400e">-{bins.maxAbs.toFixed(0)}%</text>
      <text x={width / 2} y={height - 6} fontSize={9} fill="#92400e" textAnchor="middle">0%</text>
      <text x={width - pad} y={height - 6} fontSize={9} fill="#92400e" textAnchor="end">+{bins.maxAbs.toFixed(0)}%</text>
    </svg>
  );
}

function SpeedTrace({ telemetry }: { telemetry: LapTelemetryPointLite[] }) {
  const width = 900, height = 220, pad = 26;
  const { path, maxSpeed, totalDist } = useMemo(() => {
    if (!telemetry.length) return { path: '', maxSpeed: 1, totalDist: 1 };
    const maxS = Math.max(...telemetry.map(t => t.speedKmh));
    const dist = telemetry[telemetry.length - 1].distanceM || 1;
    const d = telemetry
      .map((t, i) => {
        const x = pad + (t.distanceM / dist) * (width - 2 * pad);
        const y = height - pad - (t.speedKmh / maxS) * (height - 2 * pad);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
    return { path: d, maxSpeed: maxS, totalDist: dist };
  }, [telemetry]);

  const brakingZones = telemetry.filter(t => t.brakePct > 20);
  const cornerPeaks = telemetry.filter(t => t.lateralAccelG > 1.0);

  return (
    <div>
      <svg width={width} height={height} className="border border-amber-100 rounded-lg bg-amber-50/50 w-full">
        <path d={path} fill="none" stroke="#b45309" strokeWidth={2} />
        {brakingZones.map((t, i) => {
          const x = pad + (t.distanceM / (totalDist || 1)) * (width - 2 * pad);
          return <rect key={`b${i}`} x={x - 1.5} y={pad} width={3} height={height - 2 * pad} fill="#ef4444" opacity={0.18} />;
        })}
        {cornerPeaks.map((t, i) => {
          const x = pad + (t.distanceM / (totalDist || 1)) * (width - 2 * pad);
          const y = height - pad - (t.speedKmh / (maxSpeed || 1)) * (height - 2 * pad);
          return <circle key={`c${i}`} cx={x} cy={y} r={2.5} fill="#3b82f6" opacity={0.85} />;
        })}
        <text x={pad} y={pad - 8} fontSize={9} fill="#92400e">{maxSpeed.toFixed(0)} km/h max</text>
        <text x={width - pad} y={height - 6} fontSize={9} fill="#92400e" textAnchor="end">{(totalDist / 1000).toFixed(2)} km</text>
      </svg>
      <div className="text-[11px] text-amber-700 mt-1">
        Speed profile over 25 m segments · red bands = braking markers · blue dots = corner-exit apexes (&gt;1.0 g lateral)
      </div>
    </div>
  );
}

interface LapTelemetryPointLite { distanceM: number; speedKmh: number; brakePct: number; lateralAccelG: number }

export default RealCar100BenchmarkStudio;
