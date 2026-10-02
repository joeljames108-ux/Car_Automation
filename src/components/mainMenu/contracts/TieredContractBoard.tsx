/**
 * ═══════════════════════════════════════════════════════════════════════
 * TIERED CONTRACT BOARD COMPONENT
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements the 3-Tier automotive contracting interface:
 * - Tier 1: Production Contracts ("Manufacture This")
 * - Tier 2: Blueprint Manufacturing ("Build Exactly This")
 * - Tier 3: Engineering Contracts ("You Figure It Out")
 * - Active Contracts & Pipelines tab
 *
 * Designed with elegant Light Theme aesthetics:
 * Warm cream/alabaster, soft eucalyptus/sage, ice blue, champagne accents,
 * crisp slate typography, and full technical drawing / performance spec views.
 */

import React, { useState, useMemo } from "react";
import {
  Factory,
  Compass,
  FlaskConical,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Lock,
  DollarSign,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  X,
  Eye,
  FileText,
  Cpu,
  Zap,
  Activity,
  ShieldCheck,
  Award,
  Globe,
  Gauge,
  TrendingUp,
} from "lucide-react";
import { useContractsStore } from "../../../state/contractsStore";
import { useSimulationClockStore } from "../../../state/simulationClockStore";
import { useReputationStore } from "../../../state/reputationStore";
import { useRDTreeStore } from "../../../state/rdTreeStore";
import { useTradeStore } from "../../../state/tradeStore";
import { useCampusStore } from "../../../state/campusStore";
import { useCompanyFinanceStore } from "../../../state/companyFinanceStore";
import {
  getAvailableTieredContracts,
  evaluateTierFeasibility,
} from "../../../sim/economy/contractLifecycleEngine";
import { getEraForYear } from "../../../sim/economy/eraProgressionEngine";
import {
  ActiveTieredContract,
  ContractTier,
  TieredContractTemplate,
} from "../../../sim/economy/contractTierTypes";

export const TieredContractBoard: React.FC = () => {
  const {
    activeTieredContracts,
    completedTieredContracts,
    customFollowUpTenders,
    selectedTierTab,
    setSelectedTierTab,
    acceptTieredContract,
    cancelTieredContract,
  } = useContractsStore();

  const { year, month } = useSimulationClockStore();
  const { dimensions } = useReputationStore();
  const { unlockedTechs, activeDepartmentId } = useRDTreeStore();
  const { warehouseInventory, activeSupplierContracts } = useTradeStore();
  const { factoryState } = useCampusStore();
  const { cash } = useCompanyFinanceStore();

  const [inspectingTemplate, setInspectingTemplate] = useState<TieredContractTemplate | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const eraSpec = useMemo(() => getEraForYear(year), [year]);

  // Player state object for feasibility evaluations
  const playerState = useMemo(() => {
    const rawTier = factoryState?.factoryTier;
    const factoryTier: "boutique" | "small_batch" | "mid_volume" | "high_volume" | "mega" =
      rawTier === "workshop_plant"
        ? "boutique"
        : rawTier === "modern_assembly_plant"
        ? "mid_volume"
        : rawTier === "large_automotive_plant"
        ? "high_volume"
        : rawTier === "advanced_manufacturing_campus"
        ? "mega"
        : "small_batch";

    return {
      factoryTier,
      shiftCount: 2, // default 2-shift operating standard
      dimensionScores: dimensions,
      unlockedTechs,
      warehouseInventory: warehouseInventory.map((i) => ({
        itemType: i.itemType,
        unitsOnHand: i.unitsOnHand,
      })),
      activeInboundSuppliers: activeSupplierContracts.map((s) => s.itemCategory),
      cashAvailable: cash,
    };
  }, [factoryState, dimensions, unlockedTechs, warehouseInventory, activeSupplierContracts, cash]);

  // Catalog contracts available for current year & player status
  const availableCatalog = useMemo(() => {
    return getAvailableTieredContracts(year, dimensions, undefined, unlockedTechs);
  }, [year, dimensions, unlockedTechs]);

  // Combined available pool (includes custom follow-up tenders spawned by Tier 3)
  const allAvailable = useMemo(() => {
    return [...customFollowUpTenders, ...availableCatalog];
  }, [customFollowUpTenders, availableCatalog]);

  // Filter by selected tab
  const displayedContracts = useMemo(() => {
    if (selectedTierTab === "ACTIVE") return [];
    return allAvailable.filter((c) => c.tier === selectedTierTab);
  }, [allAvailable, selectedTierTab]);

  const handleAccept = (template: TieredContractTemplate) => {
    acceptTieredContract(template, year, month);
    setSuccessToast(`Contract accepted: ${template.title}! Added to active pipeline.`);
    setSelectedTierTab("ACTIVE");
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="w-full flex flex-col gap-5 select-none font-sans text-slate-800">
      
      {/* ── 1. Era & Market Context Header (Warm Light Theme) ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#fbf9f4] via-[#f6f4ee] to-[#eef3ec] border border-[#e2ded4] shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-800 uppercase tracking-wider mb-1">
              <Sparkles size={14} className="text-amber-600" />
              <span>{eraSpec.title}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">Sim Year {year}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Modular Automotive Contract Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Scale from a contract volume manufacturer, to precision blueprint fabricator, to an autonomous R&D powerhouse that designs and fulfills series production runs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-white border border-[#e2ded4] shadow-xs text-right">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Available Deals</div>
              <div className="text-lg font-black font-mono text-slate-900">{allAvailable.length}</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white border border-[#e2ded4] shadow-xs text-right">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Active Runs</div>
              <div className="text-lg font-black font-mono text-indigo-700">{activeTieredContracts.length}</div>
            </div>
          </div>
        </div>

        {/* Historical Context Notice */}
        <div className="mt-3.5 pt-3 border-t border-[#e2ded4]/60 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Globe size={13} className="text-slate-400" />
            <span>Era Scope: {eraSpec.keyHistoricalContext}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Inflation Factor: {eraSpec.macroInflationFactor}x
          </span>
        </div>
      </div>

      {/* ── 2. Success Toast ── */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-800">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── 3. Four Core Tabs Ribbon (Light Aesthetics) ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          {
            id: "PRODUCTION",
            label: "Tier 1: Production",
            subtitle: "Manufacture This",
            icon: Factory,
            count: allAvailable.filter((c) => c.tier === "PRODUCTION").length,
            color: "amber",
          },
          {
            id: "BLUEPRINT",
            label: "Tier 2: Blueprint",
            subtitle: "Build Exactly This",
            icon: Compass,
            count: allAvailable.filter((c) => c.tier === "BLUEPRINT").length,
            color: "sky",
          },
          {
            id: "ENGINEERING",
            label: "Tier 3: Engineering",
            subtitle: "You Figure It Out",
            icon: FlaskConical,
            count: allAvailable.filter((c) => c.tier === "ENGINEERING").length,
            color: "emerald",
          },
          {
            id: "ACTIVE",
            label: "Active Pipelines",
            subtitle: `${activeTieredContracts.length} Ongoing`,
            icon: PlayCircle,
            count: activeTieredContracts.length,
            color: "indigo",
          },
        ].map((tab) => {
          const isSelected = selectedTierTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTierTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-sans transition-all whitespace-nowrap border ${
                isSelected
                  ? "bg-white text-slate-900 border-slate-300 shadow-sm ring-2 ring-slate-400/20"
                  : "bg-[#f6f4ee]/80 text-slate-600 border-[#e2ded4] hover:bg-white hover:text-slate-900"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected
                    ? tab.color === "amber"
                      ? "bg-amber-100 text-amber-800"
                      : tab.color === "sky"
                      ? "bg-sky-100 text-sky-800"
                      : tab.color === "emerald"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-indigo-100 text-indigo-800"
                    : "bg-slate-200/60 text-slate-500"
                }`}
              >
                <Icon size={15} />
              </div>
              <div className="text-left">
                <div className="font-bold flex items-center gap-1.5">
                  {tab.label}
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? "bg-slate-100 text-slate-800" : "bg-slate-200/50 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-normal">{tab.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── 4. Main Tab Content ── */}
      {selectedTierTab === "ACTIVE" ? (
        /* Active Contracts Tracker */
        <div className="space-y-4">
          {activeTieredContracts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#e2ded4] shadow-xs">
              <PlayCircle size={40} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Active Contract Runs</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Explore the Production, Blueprint, or Engineering tabs to accept manufacturing and R&D contracts from automotive clients.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeTieredContracts.map((active) => {
                const t = active.template;
                const isT3 = t.tier === "ENGINEERING";
                const isDev = active.status === "IN_DEVELOPMENT" || active.status === "PROTOTYPE_TESTING";
                
                // Progress percentage
                const progressPct = isDev
                  ? Math.min(100, Math.round((active.rdProgress.designDaysElapsed / Math.max(1, active.rdProgress.designDaysTotal)) * 100))
                  : Math.min(100, Math.round((active.production.producedUnits / Math.max(1, active.production.targetUnits)) * 100));

                return (
                  <div
                    key={active.id}
                    className="p-5 rounded-2xl bg-white border border-[#e2ded4] shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{t.npcCountryFlag}</span>
                          <span className="text-xs font-bold text-slate-700">{t.npcName}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                            {t.tier}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            active.status === "IN_DEVELOPMENT"
                              ? "bg-purple-100 text-purple-800"
                              : active.status === "PROTOTYPE_TESTING"
                              ? "bg-amber-100 text-amber-800"
                              : active.status === "IN_PRODUCTION"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-sky-100 text-sky-800"
                          }`}
                        >
                          {active.status.replace("_", " ")}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">{t.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>

                      {/* Progress Bar */}
                      <div className="mt-4 p-3.5 rounded-xl bg-[#f6f4ee] border border-[#e2ded4]/60">
                        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                          <span className="text-slate-600 font-bold">
                            {isDev ? "R&D Prototype Progress" : "Batch Output"}
                          </span>
                          <span className="text-slate-900 font-black">
                            {isDev
                              ? `${active.rdProgress.designDaysElapsed} / ${active.rdProgress.designDaysTotal} days`
                              : `${active.production.producedUnits.toLocaleString()} / ${active.production.targetUnits.toLocaleString()} units`}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isDev ? "bg-purple-600" : "bg-emerald-600"
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        {/* Defect PPM or Prototype Score */}
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            {isDev
                              ? `Prototype Attempts: ${active.rdProgress.prototypeTestAttempts}`
                              : `Tolerance: max ${t.deliverables.qualityPpmMax} PPM`}
                          </span>
                          <span className="font-mono font-semibold text-slate-700">
                            {active.monthsRemaining.toFixed(1)} mo remaining
                          </span>
                        </div>
                      </div>

                      {/* Financials & Follow-up Notice */}
                      <div className="mt-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-mono font-bold">
                          <DollarSign size={14} />
                          <span>Earned: {formatCurrency(active.financials.totalRevenueEarned)}</span>
                        </div>
                        {active.financials.totalPenaltiesIncurred > 0 && (
                          <div className="flex items-center gap-1 text-rose-600 font-mono text-[11px]">
                            <AlertTriangle size={12} />
                            <span>Penalties: -{formatCurrency(active.financials.totalPenaltiesIncurred)}</span>
                          </div>
                        )}
                      </div>

                      {active.followUpOffered && (
                        <div className="mt-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5 font-medium">
                          <Sparkles size={13} className="text-amber-600 shrink-0" />
                          <span>Series Production Follow-Up Unlocked! Check Tier 1 catalog.</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setInspectingTemplate(t)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        <Eye size={13} />
                        <span>Inspect Specs</span>
                      </button>
                      <button
                        onClick={() => cancelTieredContract(active.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-mono"
                      >
                        Abandon Run
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Contract Catalog List for Selected Tier */
        <div className="space-y-3.5">
          {displayedContracts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#e2ded4] shadow-xs">
              <FileText size={36} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Contracts Available for Year {year}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Advance the simulation calendar or upgrade your company reputation to unlock new automotive agreements.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedContracts.map((contract) => {
                const feasibility = evaluateTierFeasibility(contract, playerState);
                const isLocked = !feasibility.isFeasible;

                return (
                  <div
                    key={contract.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                      isLocked
                        ? "bg-[#f8f7f3] border-slate-200/80 opacity-90"
                        : "bg-white border-[#e2ded4] hover:border-slate-400 shadow-sm hover:shadow-md"
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{contract.npcCountryFlag}</span>
                          <span className="text-xs font-bold text-slate-700">{contract.npcName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                              contract.difficulty === "ROUTINE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : contract.difficulty === "DEMANDING"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {contract.difficulty}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              contract.npcPersonality === "AGGRESSIVE"
                                ? "bg-rose-50 text-rose-700"
                                : contract.npcPersonality === "CONSERVATIVE"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {contract.npcPersonality}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {contract.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {contract.description}
                      </p>

                      {/* Flavor Quote */}
                      <div className="mt-3 p-2.5 rounded-xl bg-[#f6f4ee] border-l-2 border-slate-400 text-[11px] italic text-slate-600">
                        "{contract.flavorText}"
                      </div>

                      {/* Key Terms Ribbon */}
                      <div className="mt-3.5 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Volume</div>
                          <div className="text-xs font-black text-slate-800 font-mono">
                            {contract.deliverables.annualVolume.toLocaleString()} <span className="text-[9px] font-normal">/yr</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Unit Pay</div>
                          <div className="text-xs font-black text-emerald-700 font-mono">
                            {formatCurrency(contract.basePaymentPerUnit)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Bonus</div>
                          <div className="text-xs font-black text-slate-800 font-mono">
                            {formatCurrency(contract.completionBonus)}
                          </div>
                        </div>
                      </div>

                      {/* Feasibility Check Highlights */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {feasibility.capacityCheck.passed ? (
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle size={13} className="text-rose-600 shrink-0" />
                          )}
                          <span className={feasibility.capacityCheck.passed ? "text-slate-600" : "text-rose-700 font-semibold"}>
                            {feasibility.capacityCheck.message}
                          </span>
                        </div>

                        {contract.tier === "BLUEPRINT" && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            {feasibility.materialCheck.passed ? (
                              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                            ) : (
                              <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                            )}
                            <span className={feasibility.materialCheck.passed ? "text-slate-600" : "text-amber-700 font-semibold"}>
                              {feasibility.materialCheck.message}
                            </span>
                          </div>
                        )}

                        {contract.tier === "ENGINEERING" && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            {feasibility.rdCheck.passed ? (
                              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                            ) : (
                              <Lock size={13} className="text-purple-600 shrink-0" />
                            )}
                            <span className={feasibility.rdCheck.passed ? "text-slate-600" : "text-purple-700 font-semibold"}>
                              {feasibility.rdCheck.message}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setInspectingTemplate(contract)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                      >
                        <Eye size={13} />
                        <span>View Specs</span>
                      </button>

                      <button
                        onClick={() => handleAccept(contract)}
                        disabled={isLocked}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                          isLocked
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow"
                        }`}
                      >
                        {isLocked ? (
                          <>
                            <Lock size={12} />
                            <span>Locked</span>
                          </>
                        ) : (
                          <>
                            <span>Accept Order</span>
                            <ChevronRight size={13} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 5. Technical Blueprint / R&D Spec Modal ── */}
      {inspectingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fbf9f4] border border-[#e2ded4] shadow-2xl p-6 flex flex-col gap-5 text-slate-800">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#e2ded4]">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 uppercase">
                  <span>{inspectingTemplate.npcCountryFlag}</span>
                  <span>{inspectingTemplate.npcName}</span>
                  <span>•</span>
                  <span className="text-amber-800">{inspectingTemplate.tier} TIER SPECIFICATION</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {inspectingTemplate.title}
                </h2>
              </div>
              <button
                onClick={() => setInspectingTemplate(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Description & Deliverables */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {inspectingTemplate.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-white border border-[#e2ded4] text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Component</div>
                  <div className="text-xs font-bold text-slate-900">{inspectingTemplate.deliverables.specificPart}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Annual Volume</div>
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    {inspectingTemplate.deliverables.annualVolume.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Max PPM</div>
                  <div className="text-xs font-bold text-rose-700 font-mono">
                    ≤ {inspectingTemplate.deliverables.qualityPpmMax} PPM
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Duration</div>
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    {inspectingTemplate.durationMonths} months
                  </div>
                </div>
              </div>
            </div>

            {/* Tier 2: Technical Blueprint Drawing View */}
            {inspectingTemplate.tier === "BLUEPRINT" && inspectingTemplate.blueprintSpec && (
              <div className="p-4 rounded-2xl bg-[#edf4f9] border border-sky-200 text-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-sky-200">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-900">
                    <Compass size={16} className="text-sky-700" />
                    <span>TECHNICAL BLUEPRINT: {inspectingTemplate.blueprintSpec.drawingCode}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-sky-800 border border-sky-200 font-semibold">
                    {inspectingTemplate.blueprintSpec.toleranceClass}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Material Specification:</span>
                    <div className="font-bold text-slate-900">{inspectingTemplate.blueprintSpec.materialType}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Fabrication Process:</span>
                    <div className="font-bold text-slate-900 uppercase font-mono">
                      {inspectingTemplate.blueprintSpec.requiredProcess}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Target Tolerance:</span>
                    <div className="font-bold text-slate-900 font-mono">
                      ±{inspectingTemplate.blueprintSpec.targetToleranceMm} mm
                    </div>
                  </div>
                </div>

                {/* BOM Requirements */}
                <div className="pt-2 border-t border-sky-200/80">
                  <div className="text-[11px] font-bold text-sky-950 mb-1.5">Required Bill of Materials (per unit):</div>
                  <div className="space-y-1">
                    {inspectingTemplate.blueprintSpec.bomRequirements.map((bom, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white/70 px-2.5 py-1 rounded">
                        <span className="text-slate-700">{bom.name}</span>
                        <span className="font-mono text-slate-900 font-semibold">
                          {bom.amountPerUnit} {bom.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testing Gates */}
                <div className="pt-2 border-t border-sky-200/80">
                  <div className="text-[11px] font-bold text-sky-950 mb-1.5">Quality Assurance Testing Gates:</div>
                  <div className="space-y-1 text-xs">
                    {inspectingTemplate.blueprintSpec.testingGates.map((gate, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                        <ShieldCheck size={13} className="text-sky-600 shrink-0" />
                        <span>{gate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tier 3: Performance Spec & R&D View */}
            {inspectingTemplate.tier === "ENGINEERING" && inspectingTemplate.performanceSpec && (
              <div className="p-4 rounded-2xl bg-[#eef3ec] border border-emerald-200 text-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-900">
                    <FlaskConical size={16} className="text-emerald-700" />
                    <span>R&D PERFORMANCE CRITERIA</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200 font-semibold">
                    {inspectingTemplate.performanceSpec.componentCategory}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/80 border border-emerald-100 text-xs font-medium text-emerald-950">
                  {inspectingTemplate.performanceSpec.targetMetricsSummary}
                </div>

                {/* Validation Test Criteria */}
                <div className="pt-2 border-t border-emerald-200/80">
                  <div className="text-[11px] font-bold text-emerald-950 mb-1.5">Physical Test Protocols:</div>
                  <div className="space-y-1 text-xs">
                    {inspectingTemplate.performanceSpec.testCriteria.map((test, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                        <Gauge size={13} className="text-emerald-600 shrink-0" />
                        <span>{test}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follow-up Loop Guarantee */}
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Guaranteed Series Production:</span> Successful prototype testing guarantees a follow-up multi-year Tier 1 manufacturing contract!
                  </div>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-[#e2ded4] flex items-center justify-between">
              <div className="text-xs font-mono text-slate-600">
                Breach Penalty: <span className="font-bold text-rose-700">{formatCurrency(inspectingTemplate.contractBreachCostUSD)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectingTemplate(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAccept(inspectingTemplate);
                    setInspectingTemplate(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold font-mono shadow-sm"
                >
                  Ratify Agreement
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
