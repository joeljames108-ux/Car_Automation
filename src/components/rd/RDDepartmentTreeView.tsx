// ===================================================================
// R&D DEPARTMENT TREE VIEW — SUBSECTION SWIMLANES & INTERACTIVE NODES
// ===================================================================
import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  FlaskConical,
  Clock,
  DollarSign,
  ChevronRight,
  Sparkles,
  Layers,
  Wrench,
  Network,
  LayoutGrid,
} from "lucide-react";
import {
  DEPARTMENT_BY_ID,
  TECH_NODES_BY_DEPARTMENT,
  DIVISION_BY_ID,
} from "../../sim/rdTreeData";
import { canResearchNode, getDepartmentStats } from "../../sim/rdTreeEngine";
import { useRDTreeStore } from "../../state/rdTreeStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useDeveloperModeStore } from "../../state/developerModeStore";
import type { RDDepartmentId, RDTechNode } from "../../sim/rdTreeTypes";
import { RDTreeCanvas } from "./RDTreeCanvas";

interface RDDepartmentTreeViewProps {
  departmentId: RDDepartmentId;
  onBackToOverview: () => void;
}

export const RDDepartmentTreeView: React.FC<RDDepartmentTreeViewProps> = ({
  departmentId,
  onBackToOverview,
}) => {
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");
  const {
    unlockedTechs,
    activeProject,
    inspectNode,
  } = useRDTreeStore();

  const { year } = useSimulationClockStore();
  const { devMode, overrides } = useDeveloperModeStore();
  const isDevBypassed = devMode && overrides.ignoreResearchRequirements;

  const dep = DEPARTMENT_BY_ID[departmentId];
  const division = dep ? DIVISION_BY_ID[dep.divisionId] : null;
  const nodes = TECH_NODES_BY_DEPARTMENT[departmentId] || [];
  const unlockedSet = useMemo(() => new Set(unlockedTechs), [unlockedTechs]);
  const stats = useMemo(() => getDepartmentStats(departmentId, unlockedSet), [departmentId, unlockedSet]);

  // Group nodes by subsection
  const nodesBySubsection = useMemo(() => {
    const map = new Map<string, RDTechNode[]>();
    for (const sub of dep?.subsections || []) {
      map.set(sub, []);
    }
    for (const n of nodes) {
      if (!map.has(n.subsection)) {
        map.set(n.subsection, []);
      }
      map.get(n.subsection)!.push(n);
    }
    return map;
  }, [dep, nodes]);

  if (!dep) return null;

  if (viewMode === "tree") {
    return (
      <RDTreeCanvas
        department={dep}
        nodes={nodes}
        onBackToOverview={onBackToOverview}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          TOP HEADER & BREADCRUMB
      ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-[#d2dec0] backdrop-blur-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToOverview}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#cddbbf] text-slate-700 hover:text-slate-900 transition-all font-mono text-xs font-bold shadow-2xs cursor-pointer active:scale-95"
          >
            <ArrowLeft size={14} className="text-amber-600" />
            <span>ALL DEPARTMENTS</span>
          </button>

          <div>
            <div className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-500">
              {division?.name} DIVISION
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight uppercase">
              {dep.name}
            </h2>
            <div className="text-xs font-mono text-slate-500 font-medium">
              {dep.tagline}
            </div>
          </div>
        </div>

        {/* View Mode Switcher & Progress Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("tree")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all text-slate-500 hover:text-slate-800"
            >
              <Network size={12} />
              <span>Tree Graph</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all bg-white text-slate-900 border border-slate-300 shadow-xs"
            >
              <LayoutGrid size={12} />
              <span>Grid View</span>
            </button>
          </div>

          <div className="flex items-center gap-4 bg-white/80 border border-[#d2dec0] px-4 py-2 rounded-xl shrink-0 font-mono">
            <div className="text-right">
              <div className="text-xs font-black text-slate-900">
                {stats.unlocked} / {stats.total} UNLOCKED
              </div>
              <div className="text-[10px] text-emerald-700 font-bold">
                {stats.percent}% HOMOLOGATED
              </div>
            </div>
            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Project Banner if in this department */}
      {activeProject && activeProject.departmentId === departmentId && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 animate-pulse">
              <FlaskConical size={16} />
            </div>
            <div>
              <div className="text-xs font-mono font-black text-amber-950 uppercase">
                ACTIVE RESEARCH: {activeProject.name}
              </div>
              <div className="text-[11px] font-mono text-amber-800">
                Progress: {activeProject.progressMonths} of {activeProject.totalMonths} Months ({Math.round((activeProject.progressMonths / activeProject.totalMonths) * 100)}%)
              </div>
            </div>
          </div>

          <div className="w-48 h-2 bg-amber-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${(activeProject.progressMonths / activeProject.totalMonths) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUBSECTION SWIMLANES & NODES GRID
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {Array.from(nodesBySubsection.entries()).map(([subsection, subNodes]) => {
          if (subNodes.length === 0) return null;

          return (
            <div
              key={subsection}
              className="p-5 rounded-2xl bg-white/70 border border-[#d2dec0] backdrop-blur-md shadow-xs space-y-3"
            >
              {/* Subsection Header */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#e2ebd4]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <h3 className="text-sm font-black text-slate-800 font-mono uppercase tracking-wider">
                    {subsection}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {subNodes.filter((n) => unlockedSet.has(n.id)).length} / {subNodes.length} Unlocked
                </span>
              </div>

              {/* Subsection Nodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subNodes.map((node) => {
                  const isDone = unlockedSet.has(node.id);
                  const isCurResearching = activeProject?.nodeId === node.id;
                  const check = canResearchNode(
                    node.id,
                    unlockedSet,
                    year,
                    100_000_000,
                    500,
                    {},
                    isDevBypassed
                  );

                  return (
                    <div
                      key={node.id}
                      onClick={() => inspectNode(node.id)}
                      className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md active:scale-[0.99] flex flex-col justify-between min-h-[140px] ${
                        isDone
                          ? "bg-gradient-to-b from-emerald-50/70 to-white/90 border-emerald-300 hover:border-emerald-400"
                          : isCurResearching
                          ? "bg-gradient-to-b from-amber-50/80 to-white/90 border-amber-400 ring-2 ring-amber-400/30"
                          : check.ok || isDevBypassed
                          ? "bg-white/90 hover:bg-white border-[#cddbbf] hover:border-amber-400"
                          : "bg-slate-50/80 border-slate-200 opacity-75 hover:opacity-100"
                      }`}
                    >
                      {/* Top Row: Year availability & Status icon */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${
                            isDone
                              ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                              : isCurResearching
                              ? "bg-amber-100 border-amber-300 text-amber-800 animate-pulse"
                              : check.yearLocked
                              ? "bg-slate-100 border-slate-300 text-slate-500"
                              : "bg-sky-100 border-sky-300 text-sky-800"
                          }`}
                        >
                          {node.yearAvailable}+
                        </span>

                        <div>
                          {isDone ? (
                            <CheckCircle2 size={16} className="text-emerald-600" />
                          ) : isCurResearching ? (
                            <FlaskConical size={16} className="text-amber-600 animate-pulse" />
                          ) : !check.ok && !isDevBypassed ? (
                            <Lock size={15} className="text-slate-400" />
                          ) : (
                            <span className="text-[9px] font-mono font-black text-amber-600 uppercase">
                              READY
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="mb-2">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors font-mono leading-tight">
                          {node.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug font-medium">
                          {node.description}
                        </p>
                      </div>

                      {/* Bottom Info: Cost, Months & Unlocks */}
                      <div className="pt-2 border-t border-[#e8efe0] flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>${(node.cost / 1_000_000).toFixed(1)}M • {node.months}mo</span>
                        {node.unlocks.length > 0 && (
                          <span className="font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                            +{node.unlocks.length} Unlocks
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
