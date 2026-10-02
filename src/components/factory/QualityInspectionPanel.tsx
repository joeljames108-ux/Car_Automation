import React, { useMemo } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers,
  Wrench,
  Sparkles,
  Gauge,
  Droplets,
  Activity,
} from "lucide-react";
import { useFactoryStore } from "../../state/factoryStore";
import { computeLineQualityMetrics } from "../../sim/factory/factoryQualityEngine";

export function QualityInspectionPanel() {
  const { assemblyLines } = useFactoryStore();

  const lineMetrics = useMemo(() => {
    return assemblyLines.map((line) => {
      const staffingRatio = line.assignedWorkersCount / Math.max(1, line.minWorkersRequired * line.shiftsPerDay);
      return {
        line,
        metrics: computeLineQualityMetrics(line, staffingRatio),
      };
    });
  }, [assemblyLines]);

  const avgPassRate = Math.round(
    lineMetrics.reduce((acc, cur) => acc + cur.metrics.firstTimePassRatePct, 0) /
      Math.max(1, lineMetrics.length)
  );

  const avgDefectRate = (
    lineMetrics.reduce((acc, cur) => acc + cur.metrics.defectRatePct, 0) /
    Math.max(1, lineMetrics.length)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">End-of-Line Quality & Inspection</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          First-time pass rates, panel gap tolerances, acoustic sealing, and dynamometer verification
        </p>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pass Rate</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {avgPassRate}%
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">First-Time Quality Yield</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Defect Rate</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {avgDefectRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tolerance deviations & leaks</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quality Grade</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">
            Class A
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Automotive OEM Benchmark</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rework Bay</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            Active
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Post-assembly rectification</div>
        </div>
      </div>

      {/* Per-Line Quality Cards */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Per-Line Quality Performance</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lineMetrics.map(({ line, metrics }) => (
            <div
              key={line.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-[#fcfbf9] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{line.name}</h4>
                  <div className="text-xs text-slate-500">{line.type.replace("_", " ")} • Tier {line.level}</div>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Grade {metrics.qualityGrade}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-200/60">
                <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500">First-Time Pass</div>
                  <div className="font-bold text-emerald-700 mt-0.5">{metrics.firstTimePassRatePct}%</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500">Defect Rate</div>
                  <div className="font-bold text-slate-900 mt-0.5">{metrics.defectRatePct}%</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500">Rework / Unit</div>
                  <div className="font-bold text-slate-900 mt-0.5">${metrics.reworkCostPerUnitUSD}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standard Quality Gates Checklist */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Standard Automotive Quality Gates</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-[#fcfbf9] space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Droplets size={16} className="text-blue-600" />
              <span>Monsoon Water Leak Test</span>
            </div>
            <p className="text-[11px] text-slate-500">
              3,000 L/min high-pressure deluge verifying windshield, door seals, and tailgate water-tightness.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-[#fcfbf9] space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Gauge size={16} className="text-indigo-600" />
              <span>End-of-Line Roll Dyno</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Chassis dynamometer testing engine mapping, transmission shift smoothness, ABS calibration, and torque curves.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-[#fcfbf9] space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Layers size={16} className="text-purple-600" />
              <span>Laser Gap & Flushness</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Optical coordinate measuring robots checking 3.5mm shutlines and zero-step exterior panel fit.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-[#fcfbf9] space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Activity size={16} className="text-emerald-600" />
              <span>NVH & Squeak Rig</span>
            </div>
            <p className="text-[11px] text-slate-500">
              4-post shaker table analyzing interior rattles, dashboard compliance, and suspension bushing acoustics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
