import React from "react";
import { Factory, Truck, Train, Cpu, ArrowRight, ShieldAlert, Sparkles, Layers, Box, CheckCircle2 } from "lucide-react";
import { SubPageLayout } from "../SubPageLayout";
import type { Stage } from "../../StageSwitcher";

interface OperationsPageProps {
  onSelectStage: (stage: Stage) => void;
}

export const OperationsPage: React.FC<OperationsPageProps> = ({ onSelectStage }) => {
  return (
    <SubPageLayout
      title="Operations & Supply Chain"
      category="Production • Logistics • Industrial Infrastructure"
      icon={<Factory size={20} className="text-emerald-400" />}
      onSelectStage={onSelectStage}
    >
      <div className="w-full flex-1 flex flex-col gap-5">
        {/* Banner: Ready for Design Phase */}
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-slate-900 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">OPERATIONS & INDUSTRIAL ARCHITECTURE</h2>
              <p className="text-xs text-slate-300">
                This division is architected and ready for your detailed custom layout design. Explore the connected operational sub-systems below.
              </p>
            </div>
          </div>
          <div className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg">
            DESIGN PHASE READY
          </div>
        </div>

        {/* 3 Core Operational Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1: Assembly Plants */}
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Factory size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-mono">1. Vehicle Assembly Plants</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Stamping • Body-in-White • Assembly</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Robotic cell cycle times, stamping die amortization, plant throughput capacity, and automated quality control testing.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Current Plant Capacity:</span>
                  <span className="text-white font-bold">12,500 units/yr</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Line Efficiency:</span>
                  <span className="text-emerald-400 font-bold">94.2%</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Robotic Automation:</span>
                  <span className="text-cyan-400 font-bold">Level 4 Autonomous</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectStage("manufacturing")}
              className="mt-5 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all font-mono"
            >
              <span>OPEN MANUFACTURING DESIGNER</span>
              <ArrowRight size={14} className="text-emerald-400" />
            </button>
          </div>

          {/* Pillar 2: Supply Chain & Raw Materials */}
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-mono">2. Supply Chain & Materials</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Steel • Aluminum • Carbon • Silicon</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Vertical integration of raw materials, steel mills, semiconductor allocation, and Tier-1 automotive component suppliers.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Steel Stockpile:</span>
                  <span className="text-white font-bold">8,320 tonnes</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Carbon Fiber Supply:</span>
                  <span className="text-cyan-400 font-bold">Secure (Tier-1)</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Material Cost Index:</span>
                  <span className="text-emerald-400 font-bold">-3.2% (Optimized)</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectStage("supplyChain")}
              className="mt-5 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all font-mono"
            >
              <span>OPEN SUPPLY CHAIN WORKSHOP</span>
              <ArrowRight size={14} className="text-sky-400" />
            </button>
          </div>

          {/* Pillar 3: Logistics & Freight Rail */}
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Train size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-mono">3. Logistics & Rail Network</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Rail Freight • Port Logistics • JIT</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Corporate industrial railway network, connecting raw ore mines to company steel plants, ports, and finished vehicle shipping.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Active Rail Corridors:</span>
                  <span className="text-white font-bold">4 Mainlines</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">JIT Delivery Accuracy:</span>
                  <span className="text-emerald-400 font-bold">99.1% On-Time</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Fleet Transport:</span>
                  <span className="text-amber-300 font-bold">60 Auto-Rack Trains</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectStage("supplyChain")}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-bold text-amber-200 hover:text-white flex items-center justify-center gap-2 transition-all font-mono"
            >
              <span>OPEN LOGISTICS & RAIL NETWORK</span>
              <ArrowRight size={14} className="text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </SubPageLayout>
  );
};
