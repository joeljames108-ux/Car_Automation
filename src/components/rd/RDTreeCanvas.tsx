// ===================================================================
// R&D TREE CANVAS — INTERACTIVE VEHICLE TECH TREE GRAPH (Photo 2 Spec)
// Complete visual node graph with glowing conduits, cad cards & sidebar
// ===================================================================
import React, { useMemo } from "react";
import { Cog, ArrowLeft, LayoutGrid, Network } from "lucide-react";
import { RDDepartmentMeta, RDTechNode } from "../../sim/rdTreeTypes";
import { calculateTreeLayout } from "../../sim/rdTreeLayoutEngine";
import { RDTechGraphNode } from "./RDTechGraphNode";
import { RDRootGenesisNode } from "./RDRootGenesisNode";
import { RDConduitLayer } from "./RDConduitLayer";
import { RDProgressSidebar } from "./RDProgressSidebar";
import { canResearchNode } from "../../sim/rdTreeEngine";
import { useRDTreeStore } from "../../state/rdTreeStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useDeveloperModeStore } from "../../state/developerModeStore";

interface RDTreeCanvasProps {
  department: RDDepartmentMeta;
  nodes: RDTechNode[];
  onBackToOverview: () => void;
  viewMode: "tree" | "grid";
  onToggleViewMode: (mode: "tree" | "grid") => void;
}

export const RDTreeCanvas: React.FC<RDTreeCanvasProps> = ({
  department,
  nodes,
  onBackToOverview,
  viewMode,
  onToggleViewMode,
}) => {
  const { unlockedTechs, activeProject, inspectNode } = useRDTreeStore();
  const { year } = useSimulationClockStore();
  const { devMode, overrides } = useDeveloperModeStore();
  const isDevBypassed = devMode && overrides.ignoreResearchRequirements;

  const unlockedSet = useMemo(() => new Set(unlockedTechs), [unlockedTechs]);

  // Compute graph layout
  const layout = useMemo(() => {
    return calculateTreeLayout(
      department.id,
      nodes,
      unlockedSet,
      activeProject?.nodeId
    );
  }, [department.id, nodes, unlockedSet, activeProject?.nodeId]);

  return (
    <div className="relative w-full rounded-3xl bg-[#0b1018] border border-slate-800/90 shadow-2xl p-4 sm:p-6 overflow-hidden select-none font-sans">
      {/* ─────────────────────────────────────────────────────────────
          AMBIENT RADIAL GLOW ORBS (Photo 2 Visual Atmosphere)
      ───────────────────────────────────────────────────────────── */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-[18%] w-[460px] h-[460px] bg-amber-500/14 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          1. TOP HEADER BAR WITH CENTRAL "R&D HUB" PILL (Photo 2)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-4">
        {/* Left: Department Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToOverview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all font-mono text-xs font-bold active:scale-95 cursor-pointer shadow-sm"
            title="Return to All R&D Departments"
          >
            <ArrowLeft size={13} className="text-amber-400" />
            <span>ALL DEPARTMENTS</span>
          </button>

          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-100 font-mono tracking-wider uppercase leading-none">
              VEHICLE {department.name.toUpperCase()} DEVELOPMENT TREE
            </h2>
            <div className="text-[10px] font-mono text-slate-400 font-medium mt-1">
              Class-A Automotive Architecture & Technology Evolution
            </div>
          </div>
        </div>

        {/* Center: R&D HUB Top Pill Badge (Photo 2 Centerpiece) */}
        <button
          onClick={onBackToOverview}
          className="group hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-900 hover:bg-white border border-slate-300 shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer active:scale-95"
          title="Open Master R&D Ecosystem Selector"
        >
          <div className="w-5 h-5 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center">
            <Cog size={12} className="group-hover:rotate-90 transition-transform duration-500" />
          </div>
          <span className="text-xs font-mono font-black tracking-wider uppercase">
            R&D HUB
          </span>
        </button>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl">
          <button
            onClick={() => onToggleViewMode("tree")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === "tree"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network size={12} />
            <span>Tree Graph</span>
          </button>
          <button
            onClick={() => onToggleViewMode("grid")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === "grid"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutGrid size={12} />
            <span>Grid View</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA: LEFT TREE CANVAS + RIGHT SIDEBAR
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-5 items-start justify-between">
        {/* Left: Scrollable / Scaled Node Graph Canvas */}
        <div className="flex-1 w-full overflow-x-auto overflow-y-hidden rounded-2xl bg-gradient-to-b from-[#0c121b] via-[#0e1622] to-[#0a0f16] border border-slate-800/80 shadow-inner p-3 min-h-[690px] relative scrollbar-thin scrollbar-thumb-slate-700">
          {/* Subtle Grid Backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          {/* Centered Tree Graph Stage */}
          <div
            style={{
              position: "relative",
              width: layout.canvasWidth,
              height: layout.canvasHeight,
              margin: "0 auto",
            }}
          >
            {/* SVG Conduit Layer */}
            <RDConduitLayer
              conduits={layout.conduits}
              width={layout.canvasWidth}
              height={layout.canvasHeight}
              hubX={layout.canvasWidth / 2}
              hubY={10}
            />

            {/* Foundational Genesis Node (Tier 0 Anchor) */}
            <RDRootGenesisNode
              x={layout.genesisNode.x}
              y={layout.genesisNode.y}
              width={layout.genesisNode.width}
              height={layout.genesisNode.height}
              onClick={() => {
                // If baseline is not unlocked, clicking genesis can highlight baseline
                const baseline = nodes.find((n) => n.id === "eng_arch_baseline");
                if (baseline) inspectNode(baseline.id);
              }}
            />

            {/* Tech Graph Nodes */}
            {layout.nodes.map((item) => {
              const node = item.node;
              const isUnlocked = unlockedSet.has(node.id);
              const isCur = activeProject?.nodeId === node.id;
              const check = canResearchNode(
                node.id,
                unlockedSet,
                year,
                100_000_000,
                500,
                {},
                isDevBypassed
              );
              const isReady = check.ok || isDevBypassed;
              const isJustUnlocked = isUnlocked && (node.id === "eng_arch_baseline" || node.id === activeProject?.nodeId);

              return (
                <RDTechGraphNode
                  key={node.id}
                  node={node}
                  x={item.x}
                  y={item.y}
                  width={item.width}
                  height={item.height}
                  isUnlocked={isUnlocked}
                  isResearching={isCur}
                  isReady={isReady}
                  isJustUnlocked={isJustUnlocked}
                  onClick={() => inspectNode(node.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Right: Live R&D Telemetry Sidebar (Photo 2) */}
        <RDProgressSidebar
          nodes={nodes}
          unlockedSet={unlockedSet}
          onInspectNode={inspectNode}
        />
      </div>
    </div>
  );
};
