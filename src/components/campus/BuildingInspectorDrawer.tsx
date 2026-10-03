import React, { useState } from "react";
import {
  X,
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  Wrench,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Factory,
  Globe2,
  Hammer,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Car,
  Package,
  Clock,
  Flame,
  Award,
  Calendar,
  History,
  Info,
  ChevronRight
} from "lucide-react";
import { useCampusStore } from "../../state/campusStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { NPC_CONTRACT_MANUFACTURERS } from "../../sim/campus/campusRegistry";
import { FactoryProgressionEngine } from "../../sim/campus/factoryProgressionEngine";
import { useWorkforceStore } from "../../state/workforceStore";
import { FacilityWorkloadIntensity } from "../../sim/workforce/facilityWorkloadAndFatigue";

import { ContractorTier, CONTRACTOR_TIERS } from "../../sim/campus/constructionQueue";
import { campusAudio } from "../../sim/campus/campusAudioEngine";

type InspectorTab = "overview" | "departments" | "staff" | "upgrade" | "history";

const ERA_LOOKUP: Record<number, { era: string; tierName: string; eraStyle: string; style: string; badgeColor: string }> = {
  0: { era: "Tier 0: Greenfield Plot", tierName: "Tier 0: Greenfield Plot", eraStyle: "Unbuilt Lot", style: "Surveyed Greenfield Plot", badgeColor: "bg-amber-100 text-amber-800 border-amber-300" },
  1: { era: "Tier 1: Starter Office", tierName: "Tier 1: Starter Office", eraStyle: "Industrial Brick (1970s Theme)", style: "Brutalist Exposed Brick & Sawtooth", badgeColor: "bg-purple-100 text-purple-800 border-purple-300" },
  2: { era: "Tier 2: Department Wing", tierName: "Tier 2: Department Wing", eraStyle: "Modernist Steel (1980s Theme)", style: "Ribbon Windows & Steel Framing", badgeColor: "bg-blue-100 text-blue-800 border-blue-300" },
  3: { era: "Tier 3: Specialized Center", tierName: "Tier 3: Specialized Center", eraStyle: "Corporate Pavilion (1990s Theme)", style: "Tinted Acrylic & Expansion Wings", badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-300" },
  4: { era: "Tier 4: Advanced HQ", tierName: "Tier 4: Advanced HQ", eraStyle: "High-Tech Glass (2000s Theme)", style: "Curtain Wall & Mezzanine Balustrades", badgeColor: "bg-teal-100 text-teal-800 border-teal-300" },
  5: { era: "Tier 5: Global Benchmark HQ", tierName: "Tier 5: Global Benchmark HQ", eraStyle: "International Glass (2010s Theme)", style: "Multi-Platform Robotics & Glass Atriums", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  6: { era: "Tier 6: Innovation Campus", tierName: "Tier 6: Innovation Campus", eraStyle: "Smart Microgrid (2020s Theme)", style: "EV Skateboard Marriage & Solar Microgrid", badgeColor: "bg-amber-100 text-amber-800 border-amber-300" },
  7: { era: "Tier 7: Hypermodern Complex", tierName: "Tier 7: Hypermodern Complex", eraStyle: "Parametric AI (2030s Theme)", style: "Lights-Out Gigafactory & Aero Spire", badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300" },
};

export const BuildingInspectorDrawer: React.FC = () => {
  const {
    units,
    factoryState,
    selectedUnitId,
    selectUnit,
    constructPlot,
    upgradeUnit,
    startConstruction,
    constructionJobs,
    upgradeSubDepartment,
    assignPrototypeSlot,
    purchaseFactoryLand,
    beginFactoryConstruction,
    selectContractPartner,
    upgradeFactoryTier,
    upgradeFactoryShop,
    lastActionMessage,
    clearActionMessage,
  } = useCampusStore();

  const { cash } = useCompanyFinanceStore();
  const { facilityOvertimePolicies, setFacilityOvertimeIntensity, getFacilityWorkloadReport } = useWorkforceStore();

  const [activeTab, setActiveTab] = useState<InspectorTab>("overview");
  const [selectedContractor, setSelectedContractor] = useState<ContractorTier>("standard");

  if (!selectedUnitId) return null;
  const unit = units[selectedUnitId];
  if (!unit) return null;

  const isFactory = unit.isFactory;
  const factoryEcon = isFactory ? FactoryProgressionEngine.getEconomicsSummary(factoryState) : null;
  const isLockedPlot = unit.status === "locked";
  const eraInfo = ERA_LOOKUP[unit.level] || ERA_LOOKUP[1];

  return (
    <div className="absolute top-0 right-0 h-full w-full max-w-lg bg-[#f8f6f0]/95 backdrop-blur-xl border-l border-[#dad4c5] shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-200 text-slate-900">
      {/* ── DRAWER HEADER (Phase 183) ── */}
      <div className="p-4 border-b border-[#dad4c5] bg-[#f1eee4]/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-mono font-bold text-base shadow-xs ${
            isLockedPlot
              ? "bg-amber-100 border-amber-300 text-amber-800"
              : "bg-cyan-100 border-cyan-300 text-cyan-800"
          }`}>
            {unit.unitNumber.toString().padStart(2, "0")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 leading-tight">{unit.name}</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#e8e4d8] text-slate-700 border border-[#dad4c5]">
                {unit.code}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-slate-500 font-mono">{unit.sectorLabel}</p>
              <span className="text-[10px] text-slate-400">•</span>
              <span className="text-[10px] font-mono font-medium text-slate-600">
                {isLockedPlot ? "RESERVED PLOT" : `LVL ${unit.level} / ${unit.maxLevel}`}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => selectUnit(null)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-black/5 transition-colors"
          title="Close Inspector"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── ACTION NOTIFICATION BANNER ── */}
      {lastActionMessage && (
        <div className="px-4 py-2 bg-cyan-100 border-b border-cyan-300 text-[11px] text-cyan-900 flex items-center justify-between font-medium">
          <span className="truncate pr-2">{lastActionMessage}</span>
          <button onClick={clearActionMessage} className="text-cyan-700 hover:text-cyan-950">
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── 5-TAB NAVIGATION BAR (Phase 183) ── */}
      {!isLockedPlot && (
        <div className="flex border-b border-[#dad4c5] bg-[#ece7da]/70 px-2 pt-1 font-mono text-[11px]">
          {[
            { id: "overview", label: "Overview", icon: Building2 },
            { id: "departments", label: "Depts", icon: Layers, badge: unit.subDepartments.filter(d => d.unlocked).length },
            { id: "staff", label: "Staff", icon: Users },
            { id: "upgrade", label: "Upgrade", icon: TrendingUp },
            { id: "history", label: "History", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as InspectorTab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-1 border-b-2 font-bold transition-all ${
                  isActive
                    ? "border-cyan-700 text-cyan-900 bg-white/70 rounded-t-lg shadow-xs"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/30"
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-cyan-100 text-cyan-900" : "bg-slate-200 text-slate-700"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── SCROLLABLE BODY CONTENT ── */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
        {/* ── CASE 1: LOCKED EXPANSION PLOT (Phase 189) ── */}
        {isLockedPlot && (
          <div className="p-4 rounded-xl bg-gradient-to-b from-[#fef6e9] to-[#f8f6f0] border border-[#ebd5b8] space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle size={18} />
              <span className="font-bold text-sm text-slate-900">Reserved Expansion Plot (Phase 35)</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              This plot is surveyed and zoned on the campus master plan. Constructing this facility unlocks specialized R&D capabilities, test infrastructure, and dedicated staff capacity.
            </p>
            <div className="p-3 rounded-lg bg-white/90 border border-[#dad4c5] space-y-2 font-mono shadow-xs">
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Construction Capital:</span>
                <span className="text-amber-800 font-bold">${((unit.constructionUnlockCost || 3000000) / 1e6).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Initial Staff Capacity:</span>
                <span className="text-slate-900 font-bold">40 Engineers</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Footprint:</span>
                <span className="text-slate-700 font-bold">Standard Master Plot (36m x 36m)</span>
              </div>
            </div>
            {(() => {
              const unlockCost = unit.constructionUnlockCost || 3000000;
              const hasFunds = cash >= unlockCost;
              return (
                <div className="space-y-2 font-mono">
                  <div className="p-2.5 rounded-lg bg-white/90 border border-[#dad4c5] text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">AVAILABLE TREASURY:</span>
                      <span className={`font-bold ${hasFunds ? "text-emerald-700" : "text-amber-700"}`}>
                        ${(cash / 1e6).toFixed(2)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">REQUIRED CAPITAL:</span>
                      <span className="font-bold text-slate-800">${(unlockCost / 1e6).toFixed(2)}M</span>
                    </div>
                    <div className="pt-1 border-t border-[#e8e4d8] flex justify-between font-bold">
                      <span className="text-slate-600">CAPITAL STATUS:</span>
                      {hasFunds ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={11} /> READY (+$${((cash - unlockCost) / 1e6).toFixed(2)}M surplus)
                        </span>
                      ) : (
                        <span className="text-amber-800 flex items-center gap-1">
                          <AlertTriangle size={11} className="text-amber-600" /> NEED +${((unlockCost - cash) / 1e6).toFixed(2)}M MORE
                        </span>
                      )}
                    </div>
                  </div>
                  {hasFunds ? (
                    <button
                      onClick={() => {
                        campusAudio.playUnlockPlot();
                        constructPlot(unit.id);
                      }}
                      className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer text-xs"
                    >
                      <Hammer size={15} /> CONSTRUCT & COMMISSION FACILITY (${(unlockCost / 1e6).toFixed(1)}M)
                    </button>
                  ) : (
                    <div className="space-y-1">
                      <button
                        disabled
                        className="w-full py-2.5 px-3 rounded-lg bg-slate-200 border border-slate-300 text-slate-600 font-bold flex items-center justify-center gap-2 text-xs cursor-not-allowed select-none"
                      >
                        <AlertTriangle size={14} className="text-amber-600" /> INSUFFICIENT CAPITAL (${(unlockCost / 1e6).toFixed(1)}M REQUIRED)
                      </button>
                      <p className="text-[9px] text-slate-500 text-center font-sans">
                        Treasury has ${(cash / 1e6).toFixed(2)}M. Earn an additional ${((unlockCost - cash) / 1e6).toFixed(2)}M through car sales to fund this expansion.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── CASE 2: OPERATIONAL UNIT (Tabs) ── */}
        {!isLockedPlot && (
          <>
            {/* ══════════════════════════════════════════════════════════ */}
            {/* TAB 1: OVERVIEW TAB (Phase 184)                            */}
            {/* ══════════════════════════════════════════════════════════ */}
            {activeTab === "overview" && (
              <div className="space-y-3.5">
                {/* Metrics Summary Strip */}
                <div className="p-3.5 rounded-xl bg-white/90 border border-[#dad4c5] grid grid-cols-3 gap-2 text-center shadow-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">CAMPUS TIER</span>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {unit.tier.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">STAFF ON DUTY</span>
                    <span className="text-xs font-bold text-cyan-800 font-mono">
                      {unit.currentStaff} / {unit.staffCapacity}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">MAINTENANCE</span>
                    <span className="text-xs font-bold text-amber-800 font-mono">
                      ${(unit.monthlyMaintenanceCost / 1e3).toFixed(0)}k/mo
                    </span>
                  </div>
                </div>

                {/* Level Progress Bar & Architectural Style */}
                <div className="p-3.5 rounded-xl bg-white/90 border border-[#dad4c5] space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-600 font-bold">Facility Evolution:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${eraInfo.badgeColor}`}>
                      Level {unit.level} • {eraInfo.era}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-cyan-600 transition-all duration-300"
                      style={{ width: `${(unit.level / unit.maxLevel) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Architecture: <strong className="text-slate-700">{eraInfo.style}</strong>
                  </p>
                </div>

                {/* Shared Facility Callout (Aero HQ & Motorsport HQ) */}
                {unit.sharedWithUnitId && (
                  <div className="p-3 rounded-xl bg-[#edf4f9] border border-[#c5d9e8] flex items-start gap-2.5 shadow-xs">
                    <Share2 size={16} className="text-sky-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-sky-900 block">Shared Facility Base</span>
                      <p className="text-[10px] text-slate-700 leading-relaxed mt-0.5">
                        {unit.sharedRelationshipNote}
                      </p>
                    </div>
                  </div>
                )}

                {/* Prototype Engineering Bays */}
                {Boolean(unit.prototypeCapacity) && (
                  <div className="p-3.5 rounded-xl bg-white/90 border border-cyan-300 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-cyan-700">
                        <Wrench size={16} />
                        <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                          Prototype Engineering Bays
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
                        CAPACITY: {unit.prototypeCapacity} CARS
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Engineering garage for experimental mule prototypes, engine bench testing, and aerodynamic buck mockups prior to series production.
                    </p>

                    <div className="space-y-2">
                      {(unit.activePrototypes || []).map((slot) => (
                        <div key={slot.slotId} className="p-2.5 rounded-lg bg-[#f8f6f0] border border-[#dad4c5] space-y-1.5 shadow-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold font-mono text-cyan-800">BAY #{slot.slotId}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {slot.vehicleName ? slot.activeTask?.replace(/_/g, " ").toUpperCase() : "AVAILABLE BAY"}
                            </span>
                          </div>
                          {slot.vehicleName ? (
                            <div>
                              <span className="text-slate-900 font-medium block">{slot.vehicleName}</span>
                              <div className="w-full h-1.5 rounded-full bg-slate-200 mt-1.5 overflow-hidden">
                                <div className="h-full bg-cyan-600" style={{ width: `${slot.progressPct}%` }} />
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => assignPrototypeSlot(slot.slotId, "Apex Project 1970 Experimental", "prototype_assembly")}
                              className="w-full py-1.5 text-[10px] font-mono font-bold text-cyan-800 bg-cyan-100 hover:bg-cyan-200 border border-cyan-300 rounded transition-all shadow-xs"
                            >
                              + STAGE NEW PROTOTYPE CAR
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manufacturing Plant Hub (Unit 10) */}
                {isFactory && factoryEcon && (
                  <div className="space-y-3.5 p-3.5 rounded-xl bg-gradient-to-b from-[#fef6e9] to-[#f8f6f0] border border-amber-300 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Factory size={16} className="text-amber-700" />
                        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                          Manufacturing Lifecycle
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        factoryState.ownershipStatus === "no_factory_outsourced" ? "bg-amber-100 text-amber-800 border border-amber-300" :
                        factoryState.ownershipStatus === "under_construction" ? "bg-cyan-100 text-cyan-800 border border-cyan-300" :
                        "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}>
                        {factoryState.ownershipStatus.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="p-3 rounded-lg bg-white/90 border border-[#dad4c5] space-y-1.5 font-mono text-[10px] shadow-xs">
                      <div className="flex justify-between text-slate-700 font-bold text-[11px] pb-1 border-b border-[#dad4c5]">
                        <span>Unit Production Cost:</span>
                        <span className="text-amber-800">${factoryEcon.costBreakdown.totalOutsourcedUnitCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Materials:</span>
                        <span>${factoryEcon.costBreakdown.materialsCost.totalMaterialsCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Factory Conversion:</span>
                        <span>${factoryEcon.costBreakdown.conversionCost.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Purchase Land Action */}
                    {factoryState.ownershipStatus === "no_factory_outsourced" && (
                      <button
                        onClick={purchaseFactoryLand}
                        disabled={cash < factoryState.landPurchasePrice}
                        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <DollarSign size={14} /> ACQUIRE INDUSTRIAL SITE (${(factoryState.landPurchasePrice / 1e6).toFixed(1)}M)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* TAB 2: DEPARTMENTS TAB (Phase 185)                         */}
            {/* ══════════════════════════════════════════════════════════ */}
            {activeTab === "departments" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-600 font-bold uppercase tracking-wider">
                    Specialized Sub-Departments ({unit.subDepartments.length})
                  </span>
                  <span className="text-cyan-800 font-bold">
                    {unit.subDepartments.filter(d => d.unlocked).length} Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {unit.subDepartments.map((dept) => (
                    <div
                      key={dept.id}
                      className={`p-3 rounded-xl border transition-all shadow-xs ${
                        dept.unlocked
                          ? "bg-white/90 border-[#dad4c5]"
                          : "bg-[#f1eee4]/60 border-dashed border-[#c2bcae] opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-[11px]">{dept.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 uppercase">
                            {dept.type.replace(/_/g, " ")}
                          </span>
                        </div>
                        {dept.unlocked && (
                          <span className="text-[10px] font-mono font-bold text-slate-600">
                            LVL {dept.level}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-600 leading-normal mb-2">
                        {dept.description}
                      </p>

                      {dept.unlocked ? (
                        <div className="space-y-1.5 pt-2 border-t border-[#dad4c5]">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-500">Staff Assigned:</span>
                            <span className="text-cyan-800 font-bold">{dept.staffAssigned} / {dept.maxStaff}</span>
                          </div>

                          {dept.perks.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {dept.perks.map((p, idx) => (
                                <span key={idx} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => upgradeSubDepartment(unit.id, dept.id)}
                              disabled={dept.level >= dept.maxLevel || cash < dept.level * 350000}
                              className="text-[10px] font-mono font-bold text-cyan-900 bg-cyan-100 hover:bg-cyan-200 border border-cyan-300 px-2.5 py-1 rounded transition-all disabled:opacity-40 shadow-xs"
                            >
                              EXPAND LAB (${(dept.level * 350).toLocaleString()}k)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-amber-700 flex items-center gap-1">
                          <AlertTriangle size={12} /> Requires {unit.name} Level {dept.requiredUnitLevel}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* TAB 3: STAFF & WORKFORCE TAB (Phase 186)                   */}
            {/* ══════════════════════════════════════════════════════════ */}
            {activeTab === "staff" && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-white/90 border border-[#dad4c5] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-700">
                      <Users size={16} />
                      <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Workforce Allocation & Overtime
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-bold">
                      {unit.code}
                    </span>
                  </div>

                  {(() => {
                    const currentPolicy = facilityOvertimePolicies[unit.code] || "standard_40h";
                    const report = getFacilityWorkloadReport(unit.code);

                    return (
                      <div className="space-y-2.5 font-mono text-[11px]">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Shift Schedule:</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: "standard_40h", label: "40h Standard" },
                            { id: "crunch_52h", label: "52h Crunch" },
                            { id: "extreme_crunch_65h", label: "65h Death" },
                          ].map((pol) => (
                            <button
                              key={pol.id}
                              onClick={() => setFacilityOvertimeIntensity(unit.code, pol.id as FacilityWorkloadIntensity)}
                              className={`py-2 rounded-lg font-bold text-[10px] transition-all ${
                                currentPolicy === pol.id
                                  ? pol.id === "extreme_crunch_65h"
                                    ? "bg-rose-600 text-white shadow-sm"
                                    : pol.id === "crunch_52h"
                                    ? "bg-amber-600 text-white shadow-sm"
                                    : "bg-cyan-700 text-white shadow-sm"
                                  : "bg-[#f1eee4] text-slate-700 hover:text-slate-900 hover:bg-[#e8e4d8] border border-[#dad4c5]"
                              }`}
                            >
                              {pol.label}
                            </button>
                          ))}
                        </div>

                        {report && (
                          <div className="p-3 rounded-lg bg-[#f8f6f0] border border-[#dad4c5] grid grid-cols-3 gap-2 text-[10px] text-center shadow-xs">
                            <div>
                              <span className="text-slate-500 block">CAD Speed</span>
                              <span className="font-bold text-slate-900 text-xs">{report.speedMultiplier}x</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Error Rate</span>
                              <span className={`font-bold text-xs ${report.cadErrorRatePenaltyPct > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                                +{report.cadErrorRatePenaltyPct}%
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Morale Drift</span>
                              <span className={`font-bold text-xs ${report.monthlyMoraleDelta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                {report.monthlyMoraleDelta >= 0 ? `+${report.monthlyMoraleDelta}` : report.monthlyMoraleDelta}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Headcount Breakdown */}
                <div className="p-3.5 rounded-xl bg-white/90 border border-[#dad4c5] space-y-2 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-800 font-mono block">Department Headcount:</span>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Assigned to Labs:</span>
                      <span className="font-bold text-slate-900">
                        {unit.subDepartments.reduce((acc, d) => acc + (d.unlocked ? d.staffAssigned : 0), 0)} Engineers
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Reserve Engineering Pool:</span>
                      <span className="font-bold text-slate-900">
                        {Math.max(0, unit.currentStaff - unit.subDepartments.reduce((acc, d) => acc + (d.unlocked ? d.staffAssigned : 0), 0))} Engineers
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 border-t border-[#dad4c5] pt-1">
                      <span>Maximum Facility Cap:</span>
                      <span className="font-bold text-cyan-800">{unit.staffCapacity} Seats</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* TAB 4: UPGRADE TAB (Phase 187)                            */}
            {/* ══════════════════════════════════════════════════════════ */}
            {activeTab === "upgrade" && (
              <div className="space-y-3.5">
                {/* ── Active Capital Upgrade Explanatory Notice ── */}
                <div className="p-3 rounded-xl bg-sky-50/90 border border-sky-200 text-slate-800 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sky-900 font-bold font-mono text-[11px]">
                      <DollarSign size={14} className="text-sky-700" />
                      <span>ACTIVE CAPITAL INVESTMENT</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-200 text-sky-900">
                      NO YEAR GATE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                    Facility expansions are <strong>funded by company treasury ($)</strong>. Buildings <em>never auto-upgrade with calendar years</em> — you decide when to commission civil contractors to expand your campus.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/90 border border-[#dad4c5] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Architectural Expansion Path</h4>
                      <p className="text-[10px] text-slate-500">Progress from Level {unit.level} to Level {unit.level + 1}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-800">
                      ${(unit.upgradeCost / 1e6).toFixed(1)}M Base Capex
                    </span>
                  </div>

                  {/* Progression Comparison */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono p-2.5 rounded-lg bg-[#f8f6f0] border border-[#dad4c5]">
                    <div>
                      <span className="text-slate-500 block">CURRENT TIER:</span>
                      <span className="font-bold text-slate-800">{unit.tier.replace(/_/g, " ").toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">NEXT TIER:</span>
                      <span className="font-bold text-cyan-800">
                        {unit.level < unit.maxLevel ? `TIER ${unit.level + 1}` : "MAX TIER REACHED"}
                      </span>
                    </div>
                  </div>

                  {/* Active Construction or Upgrade Options */}
                  {(() => {
                    const activeJob = constructionJobs.find(
                      (j) => j.unitId === unit.id && (j.status === "in_progress" || j.status === "queued" || j.status.startsWith("paused"))
                    );

                    if (activeJob) {
                      return (
                        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-300 space-y-2 font-mono">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-amber-900 flex items-center gap-1.5">
                              <Hammer size={14} className="text-amber-700" />
                              Under Construction
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold uppercase">
                              {activeJob.contractorTier || "Standard"} Tier
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-amber-600 transition-all duration-300"
                              style={{ width: `${activeJob.progressPct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-600">
                            <span>Progress: <strong>{activeJob.progressPct}%</strong></span>
                            <span>{activeJob.totalMonthsRequired - activeJob.monthsElapsed} months remaining</span>
                          </div>
                        </div>
                      );
                    }

                    if (unit.level >= unit.maxLevel) {
                      return (
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-center font-mono text-[10px] text-emerald-800 font-bold">
                          FACILITY AT MAXIMUM HYPERMODERN LEVEL 7
                        </div>
                      );
                    }

                    const contractor = CONTRACTOR_TIERS[selectedContractor];
                    const finalCost = Math.round(unit.upgradeCost * contractor.costMultiplier);
                    const hasFunds = cash >= finalCost;

                    return (
                      <div className="space-y-3 font-mono">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 block uppercase">
                            Civil Contractor Tier:
                          </span>
                          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                            {(["budget", "standard", "premium"] as ContractorTier[]).map((t) => {
                              const info = CONTRACTOR_TIERS[t];
                              const isSelected = selectedContractor === t;
                              const tierCost = Math.round(unit.upgradeCost * info.costMultiplier);
                              return (
                                <button
                                  key={t}
                                  onClick={() => setSelectedContractor(t)}
                                  className={`p-2 rounded-lg border text-left transition-all ${
                                    isSelected
                                      ? t === "premium"
                                        ? "bg-purple-50 border-purple-400 text-purple-900 shadow-xs"
                                        : t === "budget"
                                        ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs"
                                        : "bg-cyan-50 border-cyan-400 text-cyan-900 shadow-xs"
                                      : "bg-white border-[#dad4c5] text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  <span className="font-bold block capitalize text-[10px]">{t}</span>
                                  <span className="text-[9px] text-slate-500 block">${(tierCost / 1e6).toFixed(1)}M</span>
                                  <span className="text-[8px] text-slate-400 block">{info.durationMultiplier}x Time</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Treasury vs Capex Balance */}
                        <div className="p-2.5 rounded-lg bg-[#f8f6f0] border border-[#dad4c5] font-mono text-[10px] space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">AVAILABLE TREASURY:</span>
                            <span className={`font-bold ${hasFunds ? "text-emerald-700" : "text-amber-700"}`}>
                              ${(cash / 1e6).toFixed(2)}M
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">CONTRACTOR CAPEX ({selectedContractor.toUpperCase()}):</span>
                            <span className="font-bold text-slate-900">${(finalCost / 1e6).toFixed(2)}M</span>
                          </div>
                          <div className="pt-1 border-t border-[#e2dcd0] flex justify-between items-center text-[10px]">
                            <span className="text-slate-600 font-bold">CAPITAL STATUS:</span>
                            {hasFunds ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 size={12} /> APPROVED (+${((cash - finalCost) / 1e6).toFixed(2)}M surplus)
                              </span>
                            ) : (
                              <span className="text-amber-800 font-bold flex items-center gap-1">
                                <AlertTriangle size={12} className="text-amber-600" /> NEED +${((finalCost - cash) / 1e6).toFixed(2)}M MORE
                              </span>
                            )}
                          </div>
                        </div>

                        {hasFunds ? (
                          <button
                            onClick={() => {
                              campusAudio.playUpgradeFacility();
                              startConstruction(unit.id, unit.level + 1, selectedContractor);
                            }}
                            className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md font-mono text-[11px] cursor-pointer"
                          >
                            <TrendingUp size={14} /> COMMISSION LEVEL {unit.level + 1} (${(finalCost / 1e6).toFixed(1)}M)
                          </button>
                        ) : (
                          <div className="space-y-1.5">
                            <button
                              disabled
                              className="w-full py-2.5 px-3 rounded-lg bg-slate-200 border border-slate-300 text-slate-600 font-bold flex items-center justify-center gap-2 font-mono text-[11px] cursor-not-allowed select-none shadow-none"
                            >
                              <AlertTriangle size={14} className="text-amber-600" /> INSUFFICIENT CAPITAL (${(finalCost / 1e6).toFixed(1)}M REQUIRED)
                            </button>
                            <div className="p-2 rounded bg-amber-50/70 border border-amber-200 text-amber-900 text-[10px] font-sans flex items-start gap-1.5">
                              <Info size={13} className="text-amber-700 shrink-0 mt-0.5" />
                              <span>
                                Treasury holds <strong>${(cash / 1e6).toFixed(2)}M</strong>. Fund this expansion by earning <strong>${((finalCost - cash) / 1e6).toFixed(2)}M</strong> via vehicle production, dealership sales, or engineering grants.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* 8-Level Evolution Roadmap */}
                <div className="p-3.5 rounded-xl bg-white/90 border border-[#dad4c5] space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 font-mono block">Progression Roadmap:</span>
                    <span className="text-[9px] font-mono text-slate-500 bg-[#f1eee4] px-1.5 py-0.5 rounded border border-[#dad4c5]">
                      Active Capital Upgrades
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-sans">
                    Building tiers reflect architectural complexity and capacity. They are commissioned using company funds and do <strong>not</strong> require waiting for calendar years.
                  </p>
                  <div className="space-y-1 text-[10px] font-mono">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((lvl) => {
                      const info = ERA_LOOKUP[lvl];
                      const isCurrent = lvl === unit.level;
                      const isPast = lvl < unit.level;
                      const isNext = lvl === unit.level + 1;
                      return (
                        <div
                          key={lvl}
                          className={`p-2 rounded-lg flex items-center justify-between transition-all ${
                            isCurrent
                              ? "bg-cyan-50 border border-cyan-300 text-cyan-950 font-bold shadow-xs"
                              : isNext
                              ? "bg-amber-50/60 border border-amber-200 text-slate-800"
                              : isPast
                              ? "text-slate-400 bg-slate-50/50"
                              : "text-slate-600"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              isCurrent
                                ? "bg-cyan-200 text-cyan-900"
                                : isNext
                                ? "bg-amber-200 text-amber-900"
                                : isPast
                                ? "bg-slate-200 text-slate-500"
                                : "bg-slate-100 text-slate-400"
                            }`}>
                              L{lvl}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[10px]">{info.tierName}</span>
                                {isCurrent && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-600 text-white font-mono">
                                    CURRENT
                                  </span>
                                )}
                                {isNext && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-600 text-white font-mono">
                                    NEXT
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-slate-500 block">{info.style} • {info.eraStyle}</span>
                            </div>
                          </div>
                          <div className="text-right text-[9px] font-mono">
                            {isCurrent ? (
                              <span className="text-cyan-800 font-bold">OPERATIONAL</span>
                            ) : isPast ? (
                              <span className="text-slate-400">COMPLETED</span>
                            ) : isNext ? (
                              <span className="text-amber-800 font-bold">${(unit.upgradeCost / 1e6).toFixed(1)}M Capex</span>
                            ) : (
                              <span className="text-slate-400">HIGHER TIER</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* TAB 5: HISTORY & HERITAGE TAB (Phase 188)                  */}
            {/* ══════════════════════════════════════════════════════════ */}
            {activeTab === "history" && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-white/90 border border-[#dad4c5] space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <History size={16} />
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Architectural Heritage & Evolution
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    This facility originated in the 1970 founding era. As your automotive enterprise expanded through the decades, original foundations were preserved while high-tech wings and solar arrays were integrated.
                  </p>
                  <div className="p-3 rounded-lg bg-[#f8f6f0] border border-[#dad4c5] space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Commission Date:</span>
                      <span className="font-bold text-slate-900">January 1970</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Preserved Heritage Elements:</span>
                      <span className="font-bold text-slate-900">Sawtooth Roof & West Brick Wing</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Master Plot Coordinates:</span>
                      <span className="font-bold text-slate-900">Zone A • Plot #{unit.unitNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/90 border border-[#dad4c5] space-y-2 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-800 font-mono block">Production Milestones:</span>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>1970 Startup Greenfield Survey & Ground Breaking</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>Initial Mechanical Tooling & Manual Assembly Jigs</span>
                    </div>
                    {unit.level >= 2 && (
                      <div className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        <span>Robotic Body-in-White Welding Automation Commissioned</span>
                      </div>
                    )}
                    {unit.level >= 4 && (
                      <div className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        <span>High-Bay Assembly & Continuous Slat Conveyor Loop</span>
                      </div>
                    )}
                    {unit.level >= 6 && (
                      <div className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        <span>Cleanroom EV Battery Pack Marriage & Megawatt Solar Array</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
