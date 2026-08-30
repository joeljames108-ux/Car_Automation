// ============================================================================
// F1 MODULAR VEHICLE ASSEMBLY — COMPONENT BROWSER & ENGINEERING INSPECTOR
// ============================================================================
// Sidebar allowing the player to browse sockets, inspect compatible modular parts,
// view delta performance comparisons, and execute physical snap installations.
// ============================================================================

import React, { memo } from "react";
import { useF1AssemblyStore } from "../../../sim/f1/state/f1AssemblyStore";
import { F1_SOCKET_ANCHORS, type F1SocketId } from "../../../sim/f1/modular/f1Sockets";
import { F1ComponentRegistry, type F1ComponentDefinition } from "../../../sim/f1/modular/f1ComponentRegistry";
import { F1AttachmentGraph } from "../../../sim/f1/modular/f1AttachmentGraph";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import {
  Wrench, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw,
  Sparkles, Layers, ShieldCheck, Box, Trash2, Undo2, Redo2, Plus
} from "lucide-react";

export const F1ModularComponentBrowser: React.FC = memo(function F1ModularComponentBrowser() {
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
  } = useF1AssemblyStore();

  const allSockets = Object.keys(F1_SOCKET_ANCHORS) as F1SocketId[];
  const activeSocket = selectedSocketId ? F1_SOCKET_ANCHORS[selectedSocketId] : null;
  const currentlyInstalledCompId = selectedSocketId ? installedMap[selectedSocketId] : null;
  const currentlyInstalledComp = currentlyInstalledCompId ? F1ComponentRegistry.getComponent(currentlyInstalledCompId) : null;
  const candidateComponents = selectedSocketId ? F1ComponentRegistry.getComponentsForSocket(selectedSocketId) : [];

  return (
    <div className="w-96 flex flex-col h-full bg-slate-900/80 border-r border-white/10 text-white select-none">
      {/* Top Header & History Bar */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-wider uppercase text-white">Modular Assembly</h2>
            <p className="text-[10px] text-zinc-400">20 Sockets • Real-Time CAD</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              playHMIClickSound();
              undo();
            }}
            disabled={undoStack.length === 0}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              playHMIClickSound();
              redo();
            }}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Action Preset Buttons */}
      <div className="grid grid-cols-2 gap-2 p-2 border-b border-white/10 bg-black/20 text-[11px]">
        <button
          onClick={() => {
            playHMIClickSound();
            resetToBareChassis();
          }}
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 font-bold transition-all cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          Bare Chassis
        </button>
        <button
          onClick={() => {
            playHMIClickSound();
            autoAssembleFactoryBaseline();
          }}
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-bold transition-all cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          Factory Works
        </button>
      </div>

      {/* Sockets Selector Carousel / List */}
      <div className="p-2 border-b border-white/10 overflow-x-auto flex gap-1.5 scrollbar-thin bg-black/30">
        {allSockets.map((sId) => {
          const sAnchor = F1_SOCKET_ANCHORS[sId];
          const isInstalled = !!installedMap[sId];
          const isSelected = selectedSocketId === sId;

          return (
            <button
              key={sId}
              onClick={() => {
                playHMIClickSound();
                selectSocket(sId);
              }}
              className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-amber-500 text-black border-amber-400 shadow-md shadow-cyan-500/30 font-black"
                  : isInstalled
                  ? "bg-zinc-900/80 text-zinc-300 border-white/10 hover:border-white/30"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse"
              }`}
            >
              {isInstalled ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3 text-amber-400" />}
              {sAnchor.name.split(" ")[0]}
            </button>
          );
        })}
      </div>

      {/* Selected Socket Detail & Candidate Parts */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeSocket ? (
          <div>
            {/* Active Socket Card */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-amber-500/30 mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
                  {activeSocket.category} SOCKET
                </span>
                <span className="text-[9px] font-mono text-zinc-400">
                  [{activeSocket.positionMm.join(", ")} mm]
                </span>
              </div>
              <h3 className="text-sm font-black text-white">{activeSocket.name}</h3>
              <p className="text-[11px] text-zinc-400 mt-1">{activeSocket.description}</p>

              {currentlyInstalledComp && (
                <div className="mt-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">
                      Currently Installed
                    </span>
                    <span className="text-xs font-bold text-white">{currentlyInstalledComp.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      playHMIClickSound();
                      uninstallComponent(activeSocket.id);
                    }}
                    className="p-1.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 text-[10px] font-bold transition-all cursor-pointer"
                    title="Detach Component"
                  >
                    Detach
                  </button>
                </div>
              )}
            </div>

            {/* Candidate Components List */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Compatible Components ({candidateComponents.length})
              </h4>

              {candidateComponents.map((comp) => {
                const isInstalled = currentlyInstalledCompId === comp.id;
                const canInstallCheck = F1AttachmentGraph.canInstallComponent(comp, installedMap);

                return (
                  <div
                    key={comp.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isInstalled
                        ? "bg-slate-900/60 border-amber-500/50 shadow-md shadow-cyan-500/10"
                        : "bg-zinc-900/60 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {comp.name}
                          {comp.isFactoryStandard && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Works Spec
                            </span>
                          )}
                        </h5>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{comp.description}</p>
                      </div>
                    </div>

                    {/* Engineering Specs Grid */}
                    <div className="grid grid-cols-3 gap-1.5 my-2.5 text-[10px] font-mono">
                      <div className="p-1.5 rounded bg-black/40 border border-white/5">
                        <span className="text-zinc-500 block text-[9px]">MASS</span>
                        <span className="font-bold text-amber-300">{comp.massKg} kg</span>
                      </div>
                      {comp.aero && (
                        <>
                          <div className="p-1.5 rounded bg-black/40 border border-white/5">
                            <span className="text-zinc-500 block text-[9px]">DOWNFORCE</span>
                            <span className="font-bold text-emerald-400">+{comp.aero.downforceKgAt250Kmh} kg</span>
                          </div>
                          <div className="p-1.5 rounded bg-black/40 border border-white/5">
                            <span className="text-zinc-500 block text-[9px]">DRAG</span>
                            <span className="font-bold text-rose-400">+{comp.aero.dragKgAt250Kmh} kg</span>
                          </div>
                        </>
                      )}
                      {comp.power && (
                        <div className="p-1.5 rounded bg-black/40 border border-white/5 col-span-2">
                          <span className="text-zinc-500 block text-[9px]">POWER</span>
                          <span className="font-bold text-amber-300">
                            {comp.power.iceHorsepower} HP ICE + {comp.power.ersHorsepower} HP ERS
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {isInstalled ? (
                      <div className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Installed On Chassis
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          playHMIClickSound();
                          installComponent(comp.id);
                        }}
                        disabled={!canInstallCheck.canInstall}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          canInstallCheck.canInstall
                            ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-cyan-500/20 font-black"
                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        }`}
                      >
                        {canInstallCheck.canInstall ? (
                          <>
                            <ArrowRight className="w-3.5 h-3.5" />
                            Snap into Chassis (${(comp.costUsd / 1_000_000).toFixed(1)}M)
                          </>
                        ) : (
                          canInstallCheck.reason
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 text-xs">
            Select an attachment socket to view compatible components.
          </div>
        )}
      </div>
    </div>
  );
});
