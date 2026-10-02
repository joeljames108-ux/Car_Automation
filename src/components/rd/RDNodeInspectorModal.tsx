// ===================================================================
// R&D NODE INSPECTOR MODAL — DETAILED TELEMETRY & UNLOCK CONTROLS
// Mastery Tiers, Testing Rigs, Multi-Year Timing & Team Assignment
// ===================================================================
import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Lock,
  FlaskConical,
  Calendar,
  DollarSign,
  Brain,
  Building2,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Wrench,
  Award,
  Users,
  TestTube,
} from "lucide-react";
import { TECH_NODE_BY_ID, DEPARTMENT_BY_ID } from "../../sim/rdTreeData";
import { canResearchNode, getPrerequisiteDetails } from "../../sim/rdTreeEngine";
import { useRDTreeStore } from "../../state/rdTreeStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useDeveloperModeStore } from "../../state/developerModeStore";
import { MASTERY_TIERS } from "../../sim/rdTreeTypes";
import type { RDDepartmentId, MasteryRank } from "../../sim/rdTreeTypes";

export const RDNodeInspectorModal: React.FC = () => {
  const {
    inspectingNodeId,
    inspectNode,
    unlockedTechs,
    activeProject,
    startResearch,
    unlockNode,
    setActiveDepartment,
    researchTeams,
  } = useRDTreeStore();

  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  const year = useSimulationClockStore((s) => s.year) || 1970;

  const { devMode, overrides } = useDeveloperModeStore();
  const isDevBypassed = devMode && overrides.ignoreResearchRequirements;

  if (!inspectingNodeId) return null;
  const node = TECH_NODE_BY_ID[inspectingNodeId];
  if (!node) return null;

  const unlockedSet = new Set(unlockedTechs);
  const isUnlocked = unlockedSet.has(node.id);
  const isResearching = activeProject?.nodeId === node.id;
  const check = canResearchNode(node.id, unlockedSet, year, 100_000_000, 500, {}, isDevBypassed);
  const prereqDetails = getPrerequisiteDetails(node.id, unlockedSet);
  const depMeta = DEPARTMENT_BY_ID[node.departmentId];

  // Mastery target tier info
  const targetRank: MasteryRank = node.masteryTarget ?? (node.generation ? (Math.min(6, node.generation + 1) as MasteryRank) : 2);
  const tier = MASTERY_TIERS[targetRank];

  const handleLaunchResearch = () => {
    startResearch(node.id, node.scientists, selectedTeamId || undefined);
    inspectNode(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white/95 border border-[#d2dec0] rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between gap-4 pb-4 border-b border-[#e2ebd4]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                {depMeta?.name} • {node.subsection}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800">
                ERA: {node.yearAvailable}+
              </span>
              <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${tier.badgeBg} ${tier.badgeBorder} ${tier.badgeText} flex items-center gap-1`}>
                <Award size={10} />
                MASTERY LVL {tier.rank}: {tier.name.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 font-mono tracking-tight">
              {node.name}
            </h2>
          </div>

          <button
            onClick={() => inspectNode(null)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="relative z-10 py-4 space-y-4 overflow-y-auto pr-1">
          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {node.description}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-[#f8faf4] border border-[#d9e4cc] text-center">
              <div className="text-[9px] font-mono font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                <DollarSign size={11} className="text-emerald-600" /> Cost
              </div>
              <div className="text-xs font-mono font-black text-slate-900 mt-0.5">
                ${(node.cost / 1_000_000).toFixed(1)}M
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f8faf4] border border-[#d9e4cc] text-center">
              <div className="text-[9px] font-mono font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                <Calendar size={11} className="text-blue-600" /> Duration
              </div>
              <div className="text-xs font-mono font-black text-slate-900 mt-0.5">
                {node.months} Months
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f8faf4] border border-[#d9e4cc] text-center">
              <div className="text-[9px] font-mono font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                <Building2 size={11} className="text-purple-600" /> Facility
              </div>
              <div className="text-xs font-mono font-black text-slate-900 mt-0.5">
                Lv.{node.buildingLevel} Lab
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f8faf4] border border-[#d9e4cc] text-center">
              <div className="text-[9px] font-mono font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                <Brain size={11} className="text-amber-600" /> EK Points
              </div>
              <div className="text-xs font-mono font-black text-slate-900 mt-0.5">
                {node.ekCost} EK
              </div>
            </div>
          </div>

          {/* Physical Testing & Facility Requirements */}
          {node.testingRequirement && node.testingRequirement.type !== "none" && (
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <TestTube size={15} className="text-indigo-600" />
                <span className="font-bold text-indigo-950">
                  Required Testing Rig: {node.testingRequirement.label}
                </span>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                Min Lv. {node.testingRequirement.minimumLevel}
              </span>
            </div>
          )}

          {/* Prerequisites */}
          <div>
            <div className="text-xs font-mono font-extrabold uppercase text-slate-700 tracking-wider mb-2 flex items-center gap-1.5">
              <span>Required Technology Prerequisites</span>
              <span className="text-[10px] text-slate-500">({prereqDetails.length})</span>
            </div>

            {prereqDetails.length === 0 ? (
              <div className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                ✓ No prerequisite technologies required. Baseline technology.
              </div>
            ) : (
              <div className="space-y-1.5">
                {prereqDetails.map(({ node: req, department, isUnlocked: reqDone, isCrossDepartment }) => (
                  <div
                    key={req.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition-all ${
                      reqDone
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {reqDone ? (
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Lock size={14} className="text-slate-400 shrink-0" />
                      )}
                      <span className="font-bold truncate">{req.name}</span>
                      {isCrossDepartment && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0 font-bold">
                          {department?.name}
                        </span>
                      )}
                    </div>

                    {isCrossDepartment && (
                      <button
                        onClick={() => {
                          inspectNode(req.id);
                          setActiveDepartment(req.departmentId as RDDepartmentId);
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-900 underline shrink-0 cursor-pointer ml-2"
                      >
                        <span>Jump to Dept</span>
                        <ArrowRight size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Effects & Studio Unlocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Stat Effects */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-mono font-extrabold uppercase text-slate-700 mb-2 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" />
                <span>Simulation Stat Effects</span>
              </div>
              {node.effects.length === 0 ? (
                <div className="text-[11px] text-slate-500 font-mono">Structural baseline modifier</div>
              ) : (
                <div className="space-y-1">
                  {node.effects.map((eff, i) => (
                    <div
                      key={i}
                      className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50/80 px-2 py-1 rounded border border-emerald-200/80"
                    >
                      {eff.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Studio Unlocks */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-mono font-extrabold uppercase text-slate-700 mb-2 flex items-center gap-1">
                <Wrench size={12} className="text-blue-500" />
                <span>Modular Studio Unlocks</span>
              </div>
              {node.unlocks.length === 0 ? (
                <div className="text-[11px] text-slate-500 font-mono">Passive technology upgrade</div>
              ) : (
                <div className="space-y-1">
                  {node.unlocks.map((unl, i) => (
                    <div
                      key={i}
                      className="text-xs font-mono font-bold text-blue-800 bg-blue-50/80 px-2 py-1 rounded border border-blue-200/80 flex items-center justify-between"
                    >
                      <span>{unl.label}</span>
                      <span className="text-[9px] uppercase px-1 rounded bg-blue-200/60 font-mono">
                        {unl.studio}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Research Team Selection (if launching research) */}
          {!isUnlocked && !isResearching && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-mono font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Users size={12} className="text-indigo-600" />
                <span>Assign Specialized Research Team (Optional)</span>
              </div>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Default Engineering Pool ({node.scientists || 10} Engineers)</option>
                {researchTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.engineersCount} Staff • +{Math.round(team.specializationBonus * 100)}% Speed)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Locking Warning if Not Eligible */}
          {!isUnlocked && !check.ok && !isDevBypassed && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-900">
                <Lock size={12} />
                <span>Research Blocked by In-Game Constraints</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {check.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="relative z-10 pt-4 border-t border-[#e2ebd4] flex items-center justify-between gap-3">
          {/* Dev Mode Instant Unlock */}
          {devMode && !isUnlocked && (
            <button
              onClick={() => {
                unlockNode(node.id);
                inspectNode(null);
              }}
              className="px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap size={14} className="text-purple-600" />
              <span>DEV UNLOCK</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => inspectNode(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              CLOSE
            </button>

            {isUnlocked ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-black flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>RESEARCH MASTERED</span>
              </div>
            ) : isResearching ? (
              <div className="px-4 py-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-black flex items-center gap-1.5 animate-pulse">
                <FlaskConical size={14} />
                <span>RESEARCH IN PROGRESS ({activeProject?.progressMonths}/{activeProject?.totalMonths} MO)</span>
              </div>
            ) : (
              <button
                disabled={!check.ok && !isDevBypassed}
                onClick={handleLaunchResearch}
                className={`px-5 py-2 rounded-xl text-xs font-mono font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5 ${
                  check.ok || isDevBypassed
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                }`}
              >
                <FlaskConical size={14} />
                <span>START RESEARCH PROJECT</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
