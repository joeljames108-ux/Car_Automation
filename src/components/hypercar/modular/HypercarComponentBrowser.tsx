// ============================================================================
// HYPERCAR MODULAR COMPONENT BROWSER & ENGINEERING INSPECTOR
// ============================================================================

import React, { useState, memo, useMemo } from "react";
import { useHypercarAssemblyStore } from "../../../sim/hypercar/state/hypercarAssemblyStore";
import { HYPERCAR_SOCKET_ANCHORS, type HypercarSocketId } from "../../../sim/hypercar/modular/hypercarSockets";
import { HypercarComponentRegistry, type HypercarComponentDefinition } from "../../../sim/hypercar/modular/hypercarComponentRegistry";
import { useHypercarWorkflowStore, HYPERCAR_WORKFLOW_STAGES, type HypercarWorkflowStage } from "../../../sim/hypercar/state/hypercarWorkflowStore";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import {
  Layers,
  Wrench,
  RotateCcw,
  RotateCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Wind,
  Shield,
  DollarSign,
  PlusCircle,
  XCircle,
  Lock,
  ArrowRight,
} from "lucide-react";

// Map hypercar workflow stages to socket categories
const HYPERCAR_STAGE_CATEGORIES: Record<HypercarWorkflowStage, string[]> = {
  power_unit: ["HYBRID_POWERTRAIN", "COOLING"],
  monocoque: ["CHASSIS", "SUSPENSION", "WHEELS"],
  aero: ["AERO"],
  cockpit: ["CHASSIS"],
  final_build: ["CHASSIS", "HYBRID_POWERTRAIN", "AERO", "SUSPENSION", "WHEELS", "COOLING", "BODYWORK"],
};

export const HypercarComponentBrowser: React.FC = memo(function HypercarComponentBrowser() {
  const {
    installedMap,
    selectedSocketId,
    selectSocket,
    installComponent,
    uninstallComponent,
    resetToBareChassis,
    autoAssembleFactoryBaseline,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useHypercarAssemblyStore();

  const { activeConstructionStage, markStageComplete, canEnterStage } = useHypercarWorkflowStore();
  const stageMeta = HYPERCAR_WORKFLOW_STAGES[activeConstructionStage];

  const allSockets = Object.keys(HYPERCAR_SOCKET_ANCHORS) as HypercarSocketId[];

  // Filter by workflow stage
  const visibleCategories = HYPERCAR_STAGE_CATEGORIES[activeConstructionStage] || [];
  const filteredSockets = useMemo(() =>
    allSockets.filter(sId => visibleCategories.includes(HYPERCAR_SOCKET_ANCHORS[sId].category)),
    [allSockets, visibleCategories]
  );

  const mandatorySockets = filteredSockets.filter(sId => HYPERCAR_SOCKET_ANCHORS[sId].mandatoryForHomologation);
  const allMandatoryInstalled = mandatorySockets.every(sId => !!installedMap[sId]);

  const nextStageMap: Partial<Record<HypercarWorkflowStage, HypercarWorkflowStage>> = {
    power_unit: "monocoque",
    monocoque: "aero",
    aero: "cockpit",
    cockpit: "final_build",
  };
  const nextStage = nextStageMap[activeConstructionStage];

  const activeSocket = selectedSocketId ? HYPERCAR_SOCKET_ANCHORS[selectedSocketId] : null;
  const installedComponentId = selectedSocketId ? installedMap[selectedSocketId] : null;
  const installedCompDef = installedComponentId ? HypercarComponentRegistry.getComponent(installedComponentId) : null;
  const candidateComponents = selectedSocketId ? HypercarComponentRegistry.getComponentsForSocket(selectedSocketId) : [];

  return (
    <div className="w-96 h-full flex flex-col bg-zinc-950/95 border-r border-white/10 text-white select-none backdrop-blur-xl">
      {/* Header & Quick Action Buttons */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-400" />
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-100">
              Stage {stageMeta.number}: {stageMeta.label}
            </h2>
            <p className="text-[9px] text-zinc-500 font-mono">
              {filteredSockets.length} sockets • {stageMeta.icon}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              playHMIClickSound();
              undo();
            }}
            disabled={undoStack.length === 0}
            className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              playHMIClickSound();
              redo();
            }}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
            title="Redo"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Assembly Presets: Bare Monocoque vs Factory Baseline */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-black/40 border-b border-white/10">
        <button
          onClick={() => {
            playHMIClickSound();
            resetToBareChassis();
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          Bare Monocoque
        </button>
        <button
          onClick={() => {
            playHMIClickSound();
            autoAssembleFactoryBaseline();
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-3 h-3" />
          Factory Baseline
        </button>
      </div>

      {/* Current Stage Sockets Explorer List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 mb-1">
          Stage {stageMeta.number} Sockets ({filteredSockets.length})
        </div>
        {filteredSockets.map((socketId) => {
          const anchor = HYPERCAR_SOCKET_ANCHORS[socketId];
          const isInstalled = !!installedMap[socketId];
          const isSelected = selectedSocketId === socketId;
          const compDef = isInstalled ? HypercarComponentRegistry.getComponent(installedMap[socketId]!) : null;

          return (
            <div
              key={socketId}
              onClick={() => {
                playHMIClickSound();
                selectSocket(socketId);
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10"
                  : isInstalled
                  ? "bg-zinc-900/60 border-white/10 hover:border-white/20"
                  : "bg-zinc-950/40 border-dashed border-rose-500/30 hover:border-rose-500/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 truncate">{anchor.name}</span>
                {isInstalled ? (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    INSTALLED
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    EMPTY
                  </span>
                )}
              </div>
              {compDef && <p className="text-[11px] text-amber-400 font-medium mt-0.5 truncate">{compDef.name}</p>}
            </div>
          );
        })}
      </div>

      {/* Selected Socket Candidates Inspector */}
      {activeSocket && (
        <div className="p-4 border-t border-white/10 bg-zinc-900/90 space-y-3 max-h-72 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase">{activeSocket.name}</h3>
            {installedCompDef && (
              <button
                onClick={() => {
                  playHMIClickSound();
                  uninstallComponent(activeSocket.id);
                }}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <XCircle className="w-3 h-3" />
                Detach
              </button>
            )}
          </div>

          {/* Candidate Components for Selected Socket */}
          <div className="space-y-2">
            {candidateComponents.map((comp) => {
              const isCurrent = installedComponentId === comp.id;

              return (
                <div
                  key={comp.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/10"
                      : "bg-black/50 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{comp.name}</span>
                    <span className="text-[10px] font-mono text-zinc-400">{comp.massKg} kg</span>
                  </div>

                  <p className="text-[10px] text-zinc-400 line-clamp-2 mb-2">{comp.description}</p>

                  {/* Metrics Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5 text-[9px] font-mono font-bold">
                    {comp.aero && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Wind className="w-2.5 h-2.5" />
                        +{comp.aero.downforceKgAt250Kmh}kg DF
                      </span>
                    )}
                    {comp.power && comp.power.iceHorsepower > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5" />
                        {comp.power.iceHorsepower} HP ICE
                      </span>
                    )}
                    {comp.power && comp.power.frontMguKw > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" />
                        {comp.power.frontMguKw} kW MGU
                      </span>
                    )}
                    {comp.endurance && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Shield className="w-2.5 h-2.5" />
                        {comp.endurance.coolingCapacityKw} kW Cool
                      </span>
                    )}
                  </div>

                  {/* Install Action */}
                  {!isCurrent ? (
                    <button
                      onClick={() => {
                        playHMIClickSound();
                        installComponent(comp.id);
                      }}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-[11px] uppercase tracking-wider shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3" />
                      Snap into Chassis
                    </button>
                  ) : (
                    <div className="text-center text-[10px] font-bold text-emerald-400 py-1">
                      ✓ Active in Assembly
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom: Stage Completion */}
      <div className="p-3 border-t border-white/10 bg-black/40 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-mono text-zinc-500">
            {mandatorySockets.filter(sId => !!installedMap[sId]).length}/{mandatorySockets.length} mandatory installed
          </span>
          {allMandatoryInstalled ? (
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> STAGE READY
            </span>
          ) : (
            <span className="text-[9px] font-mono text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {mandatorySockets.length - mandatorySockets.filter(sId => !!installedMap[sId]).length} required
            </span>
          )}
        </div>
        {nextStage && (
          <button
            onClick={() => {
              playHMIClickSound();
              if (allMandatoryInstalled) {
                markStageComplete(activeConstructionStage);
              }
            }}
            disabled={!allMandatoryInstalled}
            className={`w-full py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              allMandatoryInstalled
                ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30"
                : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
            }`}
          >
            {allMandatoryInstalled ? (
              <>
                <ArrowRight className="w-3.5 h-3.5" />
                COMPLETE & CONTINUE TO {HYPERCAR_WORKFLOW_STAGES[nextStage].label}
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Install all mandatory components first
              </>
            )}
          </button>
        )}
        {!nextStage && allMandatoryInstalled && (
          <button
            onClick={() => {
              playHMIClickSound();
              markStageComplete(activeConstructionStage);
            }}
            className="w-full py-2 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            FINALIZE ALL STAGES
          </button>
        )}
      </div>
    </div>
  );
});
