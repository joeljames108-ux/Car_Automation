import React from "react";
import {
  Layers,
  Calendar,
  Boxes,
  Users,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  Clock,
  Wrench,
  TrendingUp,
  Cpu,
  Truck,
  GraduationCap,
  Sparkles,
  Award,
  AlertTriangle,
} from "lucide-react";
import { useFactoryStore, FactoryViewTab } from "../../state/factoryStore";
import { useTradeStore } from "../../state/tradeStore";

interface FactoryHeroCardsProps {
  onNavigateTab: (tab: FactoryViewTab) => void;
}

export const FactoryHeroCards: React.FC<FactoryHeroCardsProps> = ({ onNavigateTab }) => {
  const { assemblyLines, factoryFloorSummary, purchaseOrders } = useFactoryStore();
  const { warehouseInventory } = useTradeStore();

  const activeLinesCount = factoryFloorSummary.activeLinesCount;
  const totalLinesCount = Math.max(1, assemblyLines.length);
  const activeJobsCount = factoryFloorSummary.activeJobsCount;
  const inTransitOrdersCount = (purchaseOrders || []).filter((po) => po.status === "PENDING").length;
  const avgEfficiency = Math.round(
    assemblyLines.reduce((acc, l) => acc + l.efficiencyPct, 0) / totalLinesCount
  );

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-800 shadow-2xs">
            <Sparkles size={18} className="text-emerald-700 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-mono text-slate-900 tracking-tight flex items-center gap-2">
              <span>Factory Operational Studios</span>
              <span className="text-[11px] font-sans font-semibold text-slate-500">(Workstation Gateways)</span>
            </h3>
            <p className="text-xs text-slate-600 font-sans">
              Direct access into physical line bays, takt scheduling, procurement logistics, shift training, and QA inspection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[11px]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>5 Workstations Online</span>
          </span>
        </div>
      </div>

      {/* 5 Hero Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
        {/* ── CARD 1: ASSEMBLY LINES & TOOLING ── */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab("lines")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigateTab("lines");
            }
          }}
          className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#ffffff]/98 via-[#faf7f0]/95 to-[#f4efe4]/95 border-2 border-[#ded5c4] hover:border-emerald-500 shadow-sm hover:shadow-[0_16px_40px_rgba(16,185,129,0.12)] transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 active:scale-[0.99] focus:outline-none"
        >
          {/* Top Ambient Lighting Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          <div>
            {/* Top Metadata Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 font-mono font-black text-[10px] tracking-wider uppercase">
                  Module 01
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Tooling & Bays
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-emerald-50 text-emerald-800 border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{activeLinesCount}/{assemblyLines.length} BAYS ACTIVE</span>
              </div>
            </div>

            {/* Visual Hero Image Container with Robust Fallback */}
            <div className="relative w-full h-38 sm:h-44 rounded-xl overflow-hidden mb-3.5 border border-[#e2d8c6] shadow-inner group-hover:border-emerald-400/80 transition-colors bg-gradient-to-br from-slate-900 via-stone-900 to-slate-950">
              <img
                src="/assets/divisions/manufacture.jpg"
                alt="Assembly Lines & Tooling Bays"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

              {/* Overlay Glass Badge */}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2.5 text-white z-10 pointer-events-none">
                <div className="p-2 rounded-xl bg-emerald-600/90 text-white shadow-md shrink-0">
                  <Layers size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black font-mono tracking-wider text-emerald-100 truncate">
                    ROBOTIC LINES & TOOLING
                  </div>
                  <div className="text-[10px] text-emerald-200/90 font-mono truncate">
                    {assemblyLines.length} Lines • {factoryFloorSummary.totalMonthlyCapacityUnits.toLocaleString()} Max Units • Takt Mgmt
                  </div>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-black font-mono text-slate-900 group-hover:text-emerald-800 transition-colors flex items-center gap-2">
                <span>Assembly Lines & Tooling</span>
                <span className="text-xs font-semibold text-slate-500 font-sans">(Line Bays)</span>
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Configure physical line bays, takt times, automation levels, and manage platform changeover re-jigging delays when switching vehicle architectures.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-[#eed8c8]/80 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                {activeLinesCount} Active Lines
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                {avgEfficiency}% Tooling Health
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                Platform Re-Tooling
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="mt-4 pt-3 border-t border-[#ded5c4]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab("lines");
              }}
              className="w-full py-2.5 px-4 rounded-xl text-white font-mono font-black text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:translate-x-0.5 active:scale-98 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-700/25"
            >
              <span>MANAGE ASSEMBLY LINES</span>
              <ChevronRight size={15} className="text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-center mt-1.5 text-[10px] font-mono text-slate-500 font-medium">
              Inspect line takt, re-jigging delays & tooling wear
            </div>
          </div>
        </div>

        {/* ── CARD 2: PRODUCTION SCHEDULER & TAKT ── */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab("scheduler")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigateTab("scheduler");
            }
          }}
          className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#ffffff]/98 via-[#faf7f0]/95 to-[#f4efe4]/95 border-2 border-[#ded5c4] hover:border-blue-500 shadow-sm hover:shadow-[0_16px_40px_rgba(59,130,246,0.12)] transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 active:scale-[0.99] focus:outline-none"
        >
          {/* Top Ambient Lighting Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600" />

          <div>
            {/* Top Metadata Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/40 text-blue-900 font-mono font-black text-[10px] tracking-wider uppercase">
                  Module 02
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Takt Calendar
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-blue-50 text-blue-800 border-blue-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>{activeJobsCount} ACTIVE BATCHES</span>
              </div>
            </div>

            {/* Visual Hero Image Container with Robust Fallback */}
            <div className="relative w-full h-38 sm:h-44 rounded-xl overflow-hidden mb-3.5 border border-[#e2d8c6] shadow-inner group-hover:border-blue-400/80 transition-colors bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950">
              <img
                src="/assets/divisions/final_build.jpg"
                alt="Production Scheduler & Takt Time"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

              {/* Overlay Glass Badge */}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2.5 text-white z-10 pointer-events-none">
                <div className="p-2 rounded-xl bg-blue-600/90 text-white shadow-md shrink-0">
                  <Calendar size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black font-mono tracking-wider text-blue-100 truncate">
                    DYNAMIC TAKT & RESERVATIONS
                  </div>
                  <div className="text-[10px] text-blue-200/90 font-mono truncate">
                    {factoryFloorSummary.usedMonthlyCapacityUnits.toLocaleString()} / {factoryFloorSummary.totalMonthlyCapacityUnits.toLocaleString()} Units Booked ({factoryFloorSummary.overallUtilizationPct}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-black font-mono text-slate-900 group-hover:text-blue-800 transition-colors flex items-center gap-2">
                <span>Production Scheduler</span>
                <span className="text-xs font-semibold text-slate-500 font-sans">(Calendar)</span>
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Reserve monthly production slots, allocate daily batch volume, balance takt loads, and synchronize vehicle contracts without causing line starvation.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-[#eed8c8]/80 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                {factoryFloorSummary.availableMonthlyCapacityUnits.toLocaleString()} Units Free
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                Gantt Slot Allocation
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                Takt Time Balance
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="mt-4 pt-3 border-t border-[#ded5c4]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab("scheduler");
              }}
              className="w-full py-2.5 px-4 rounded-xl text-white font-mono font-black text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:translate-x-0.5 active:scale-98 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 shadow-blue-700/25"
            >
              <span>OPEN PRODUCTION SCHEDULER</span>
              <ChevronRight size={15} className="text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-center mt-1.5 text-[10px] font-mono text-slate-500 font-medium">
              Assign vehicle batches & view monthly calendar slots
            </div>
          </div>
        </div>

        {/* ── CARD 3: SUPPLY CHAIN & WAREHOUSE BOM ── */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab("materials")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigateTab("materials");
            }
          }}
          className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#ffffff]/98 via-[#faf7f0]/95 to-[#f4efe4]/95 border-2 border-[#ded5c4] hover:border-amber-500 shadow-sm hover:shadow-[0_16px_40px_rgba(245,158,11,0.12)] transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 active:scale-[0.99] focus:outline-none"
        >
          {/* Top Ambient Lighting Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

          <div>
            {/* Top Metadata Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-900 font-mono font-black text-[10px] tracking-wider uppercase">
                  Module 03
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Materials & BOM
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-amber-50 text-amber-900 border-amber-300">
                {inTransitOrdersCount > 0 ? (
                  <span className="flex items-center gap-1">
                    <Truck size={12} className="text-amber-600" />
                    <span>{inTransitOrdersCount} SHIPMENTS EN ROUTE</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Boxes size={12} className="text-amber-600" />
                    <span>WAREHOUSE STOCKED</span>
                  </span>
                )}
              </div>
            </div>

            {/* Visual Hero Image Container with Robust Fallback */}
            <div className="relative w-full h-38 sm:h-44 rounded-xl overflow-hidden mb-3.5 border border-[#e2d8c6] shadow-inner group-hover:border-amber-400/80 transition-colors bg-gradient-to-br from-slate-900 via-amber-950 to-slate-950">
              <img
                src="/screenshots/campus/hq_11_procurement_l1/hq_11_procurement_l1_01_FRONT_3Q.png"
                alt="Supply Chain & Warehouse Logistics"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

              {/* Overlay Glass Badge */}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2.5 text-white z-10 pointer-events-none">
                <div className="p-2 rounded-xl bg-amber-500/90 text-slate-950 shadow-md shrink-0">
                  <Boxes size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black font-mono tracking-wider text-amber-100 truncate">
                    BOM PROCUREMENT & DISCOUNTS
                  </div>
                  <div className="text-[10px] text-amber-200/90 font-mono truncate">
                    Steel • Alloy • Carbon • Microchips • Fasteners
                  </div>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-black font-mono text-slate-900 group-hover:text-amber-800 transition-colors flex items-center gap-2">
                <span>Supply Chain & Warehouse</span>
                <span className="text-xs font-semibold text-slate-500 font-sans">(BOM Parts)</span>
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Purchase raw materials, negotiate bulk supplier discounts, track lead-time deliveries in transit, and maintain warehouse buffers to avert assembly line stalls.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-[#eed8c8]/80 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                3-14 Day Lead Times
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                Up to 15% Bulk Discount
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                JIT Stock Management
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="mt-4 pt-3 border-t border-[#ded5c4]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab("materials");
              }}
              className="w-full py-2.5 px-4 rounded-xl text-white font-mono font-black text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:translate-x-0.5 active:scale-98 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 shadow-amber-600/25"
            >
              <span>PROCURE MATERIALS & BOM</span>
              <ChevronRight size={15} className="text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-center mt-1.5 text-[10px] font-mono text-slate-500 font-medium">
              Order raw materials and track deliveries in transit
            </div>
          </div>
        </div>

        {/* ── CARD 4: WORKFORCE & TRAINING ACADEMY ── */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab("workforce")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigateTab("workforce");
            }
          }}
          className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#ffffff]/98 via-[#faf7f0]/95 to-[#f4efe4]/95 border-2 border-[#ded5c4] hover:border-purple-500 shadow-sm hover:shadow-[0_16px_40px_rgba(168,85,247,0.12)] transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 active:scale-[0.99] focus:outline-none"
        >
          {/* Top Ambient Lighting Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600" />

          <div>
            {/* Top Metadata Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/40 text-purple-900 font-mono font-black text-[10px] tracking-wider uppercase">
                  Module 04
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Staff & Skills
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-purple-50 text-purple-900 border-purple-300">
                <Users size={12} className="text-purple-600" />
                <span>{factoryFloorSummary.totalFactoryWorkersAssigned} STAFF • {factoryFloorSummary.staffingHealthPct}% HEALTH</span>
              </div>
            </div>

            {/* Visual Hero Image Container with Robust Fallback */}
            <div className="relative w-full h-38 sm:h-44 rounded-xl overflow-hidden mb-3.5 border border-[#e2d8c6] shadow-inner group-hover:border-purple-400/80 transition-colors bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950">
              <img
                src="/assets/divisions/vehicle.jpg"
                alt="Workforce Academy & Shift Management"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

              {/* Overlay Glass Badge */}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2.5 text-white z-10 pointer-events-none">
                <div className="p-2 rounded-xl bg-purple-600/90 text-white shadow-md shrink-0">
                  <GraduationCap size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black font-mono tracking-wider text-purple-100 truncate">
                    4-TIER SKILL MATRIX & ACADEMY
                  </div>
                  <div className="text-[10px] text-purple-200/90 font-mono truncate">
                    Trainee • Journeyman • Senior • Master (+25% Takt, -70% Defect)
                  </div>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-black font-mono text-slate-900 group-hover:text-purple-800 transition-colors flex items-center gap-2">
                <span>Workforce & Academy</span>
                <span className="text-xs font-semibold text-slate-500 font-sans">(Shifts & Training)</span>
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Deploy 3-shift 24/7 operating crews, optimize floor wages, and enroll workers in the 30-day technical academy to advance them to Master assemblers.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-[#eed8c8]/80 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                30-Day Training Sprints
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                1-3 Shift Rotations
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                Morale & Retention
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="mt-4 pt-3 border-t border-[#ded5c4]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab("workforce");
              }}
              className="w-full py-2.5 px-4 rounded-xl text-white font-mono font-black text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:translate-x-0.5 active:scale-98 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 shadow-purple-700/25"
            >
              <span>MANAGE WORKFORCE & ACADEMY</span>
              <ChevronRight size={15} className="text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-center mt-1.5 text-[10px] font-mono text-slate-500 font-medium">
              Manage shift crews and technical training programs
            </div>
          </div>
        </div>

        {/* ── CARD 5: QUALITY INSPECTION & SIX SIGMA QA ── */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab("quality")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigateTab("quality");
            }
          }}
          className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#ffffff]/98 via-[#faf7f0]/95 to-[#f4efe4]/95 border-2 border-[#ded5c4] hover:border-rose-500 shadow-sm hover:shadow-[0_16px_40px_rgba(244,63,94,0.12)] transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 active:scale-[0.99] focus:outline-none"
        >
          {/* Top Ambient Lighting Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600" />

          <div>
            {/* Top Metadata Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/40 text-rose-900 font-mono font-black text-[10px] tracking-wider uppercase">
                  Module 05
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  End-of-Line QA
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-rose-50 text-rose-900 border-rose-300">
                <ShieldCheck size={12} className="text-rose-600" />
                <span>SIX SIGMA QUALITY</span>
              </div>
            </div>

            {/* Visual Hero Image Container with Robust Fallback */}
            <div className="relative w-full h-38 sm:h-44 rounded-xl overflow-hidden mb-3.5 border border-[#e2d8c6] shadow-inner group-hover:border-rose-400/80 transition-colors bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950">
              <img
                src="/screenshots/campus/hq_12_quality_l7/hq_12_quality_l7_01_FRONT_3Q.png"
                alt="Quality Inspection & Six Sigma QA"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

              {/* Overlay Glass Badge */}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2.5 text-white z-10 pointer-events-none">
                <div className="p-2 rounded-xl bg-rose-600/90 text-white shadow-md shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black font-mono tracking-wider text-rose-100 truncate">
                    LASER SCANNING & SCRAP REWORK
                  </div>
                  <div className="text-[10px] text-rose-200/90 font-mono truncate">
                    CMM Alignment • Paint Film Thickness • Warranty Mitigation
                  </div>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-black font-mono text-slate-900 group-hover:text-rose-800 transition-colors flex items-center gap-2">
                <span>Quality Inspection & QA</span>
                <span className="text-xs font-semibold text-slate-500 font-sans">(Defect Control)</span>
              </h4>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Perform automated laser panel-gap checks, evaluate paint thickness, route defective vehicles through rework loops, and safeguard company reputation.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-[#eed8c8]/80 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                Laser Gap Metrology
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                Scrap Rework Loops
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                Warranty Mitigation
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="mt-4 pt-3 border-t border-[#ded5c4]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateTab("quality");
              }}
              className="w-full py-2.5 px-4 rounded-xl text-white font-mono font-black text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:translate-x-0.5 active:scale-98 bg-gradient-to-r from-rose-700 to-pink-800 hover:from-rose-600 hover:to-pink-700 shadow-rose-700/25"
            >
              <span>INSPECT QUALITY & REWORK</span>
              <ChevronRight size={15} className="text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-center mt-1.5 text-[10px] font-mono text-slate-500 font-medium">
              Review defect rates, CMM inspection & scrap loops
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
