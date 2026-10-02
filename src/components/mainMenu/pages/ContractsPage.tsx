import React, { useState } from "react";
import {
  FileText, DollarSign, Shield, Handshake, Sparkles, ArrowRight,
  Building, CheckCircle2, AlertTriangle, Clock, RefreshCw, XCircle,
  TrendingUp, Award, Layers, Globe
} from "lucide-react";
import { SubPageLayout } from "../SubPageLayout";
import { useContractsStore, type ContractCategory, type ContractItem } from "../../../state/contractsStore";
import { DealRoomModal } from "../contracts/DealRoomModal";
import { TieredContractBoard } from "../contracts/TieredContractBoard";
import type { Stage } from "../../StageSwitcher";

interface ContractsPageProps {
  onSelectStage: (stage: Stage) => void;
}

type FilterTab = "ALL" | ContractCategory | "TENDERS" | "TIERED_BOARD";

export const ContractsPage: React.FC<ContractsPageProps> = ({ onSelectStage }) => {
  const {
    contracts,
    tenders,
    selectedContractId,
    selectContract,
    openDealRoomForTender,
    openDealRoomForRenegotiation,
    extendContract,
    terminateContract,
    getNetMonthlyCashflow,
    getTotalAnnualizedValue,
    getAveragePartnerScore,
    getSecurityIndex,
  } = useContractsStore();

  const [activeTab, setActiveTab] = useState<FilterTab>("TIERED_BOARD");

  const netCashflow = getNetMonthlyCashflow();
  const annualizedTotal = getTotalAnnualizedValue();
  const partnerScore = getAveragePartnerScore();
  const securityIndex = getSecurityIndex();

  const filteredContracts = contracts.filter((c) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "TENDERS" || activeTab === "TIERED_BOARD") return false;
    return c.category === activeTab;
  });

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || contracts[0];

  const formatCurrency = (val: number) => {
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    if (absVal >= 1000000) {
      return (isNegative ? "-" : "+") + "$" + (absVal / 1000000).toFixed(2) + "M";
    }
    return (isNegative ? "-" : "+") + "$" + absVal.toLocaleString();
  };

  const getCategoryLabel = (cat: ContractCategory) => {
    switch (cat) {
      case "INBOUND_SUPPLIER":
        return "Inbound Supplier";
      case "OUTBOUND_OEM":
        return "OEM B2B Client";
      case "MOTORSPORT":
        return "Motorsport & Racing";
      case "TECH_LICENSE":
        return "Technology & IP";
    }
  };

  return (
    <SubPageLayout
      title="Corporate & B2B Contracts"
      category="Material Procurement • OEM Powertrain Supply • Motorsport Partnerships • IP Licensing"
      icon={<FileText size={20} className="text-cyan-300" />}
      onSelectStage={onSelectStage}
    >
      <div className="w-full flex-1 flex flex-col gap-5 select-none font-sans pb-12">
        
        {/* ── 1. Top Executive KPI Ribbon ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* KPI 1: Net Monthly Cashflow */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <DollarSign size={13} className="text-emerald-400" />
                NET MONTHLY CASHFLOW
              </span>
              <span className="text-[10px] text-slate-500 uppercase">Automated</span>
            </div>
            <div className={`text-xl sm:text-2xl font-black font-mono ${netCashflow >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatCurrency(netCashflow)} <span className="text-xs text-slate-400 font-normal">/ mo</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp size={11} className="text-emerald-400" />
              <span>Inbound costs offset by B2B revenue</span>
            </div>
          </div>

          {/* KPI 2: Total Annual Portfolio Value */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Layers size={13} className="text-cyan-400" />
                ANNUAL DEAL PORTFOLIO
              </span>
              <span className="text-[10px] text-slate-500 uppercase">Active</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">
              ${(annualizedTotal / 1000000).toFixed(1)}M <span className="text-xs text-slate-400 font-normal">/ yr</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {contracts.length} active enterprise agreements
            </div>
          </div>

          {/* KPI 3: Supply Chain Security Index */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Shield size={13} className="text-purple-400" />
                SUPPLY SECURITY INDEX
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Resilient</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-purple-300">
              {securityIndex}% <span className="text-xs text-slate-400 font-normal">Protected</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Long-term contracts immune to spot spikes
            </div>
          </div>

          {/* KPI 4: Partner Relationship Score */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Handshake size={13} className="text-amber-400" />
                PARTNER TRUST INDEX
              </span>
              <span className="text-[10px] text-slate-500 uppercase">Overall</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">
              {partnerScore}<span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Unlocks emergency allocation privileges
            </div>
          </div>
        </div>

        {/* ── 2. Category Filter Tabs ── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "TIERED_BOARD", label: "🏭 3-Tier Manufacturing & R&D", highlight: true },
            { id: "ALL", label: `Legacy Portfolios (${contracts.length})` },
            { id: "INBOUND_SUPPLIER", label: `Inbound Suppliers (${contracts.filter(c => c.category === "INBOUND_SUPPLIER").length})` },
            { id: "OUTBOUND_OEM", label: `Outbound OEM Sales (${contracts.filter(c => c.category === "OUTBOUND_OEM").length})` },
            { id: "MOTORSPORT", label: `Motorsport (${contracts.filter(c => c.category === "MOTORSPORT").length})` },
            { id: "TECH_LICENSE", label: `Tech Licensing (${contracts.filter(c => c.category === "TECH_LICENSE").length})` },
            { id: "TENDERS", label: `Legacy Tenders (${tenders.length})` },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap border ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : tab.highlight
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                    : "bg-slate-900/80 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── 3. Main Workspace ── */}
        {activeTab === "TIERED_BOARD" ? (
          <div className="flex-1">
            <TieredContractBoard />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
            
            {/* Left Panel: Deal Cards List (7 Cols) */}
            <div className="lg:col-span-7 space-y-3.5">
            
            {/* When viewing Open Tenders */}
            {activeTab === "TENDERS" && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400 shrink-0" />
                    <span>Review incoming proposals from automakers, mining syndicates, and race teams.</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">
                    LIVE MARKET
                  </span>
                </div>

                {tenders.map((tender) => (
                  <div
                    key={tender.id}
                    className="p-5 rounded-2xl bg-slate-900/85 border border-white/10 hover:border-amber-400/50 transition-all shadow-xl space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                            {getCategoryLabel(tender.category)}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {tender.partnerCountry}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                          {tender.title}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1">
                          {tender.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-extrabold font-mono text-cyan-300">
                          ${tender.baseUnitPrice.toLocaleString()} <span className="text-[10px] text-slate-400">/ unit</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Benchmark: ${tender.benchmarkPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-400">Volume: </span>
                        <span className="text-white font-bold">{tender.proposedAnnualVolume.toLocaleString()} units/yr</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Term: </span>
                        <span className="text-white font-bold">{tender.recommendedDurationYears} Years</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Exclusivity: </span>
                        <span className={tender.exclusivityRequested ? "text-cyan-400 font-bold" : "text-slate-400"}>
                          {tender.exclusivityRequested ? "Requested" : "Standard"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="text-[11px] text-slate-400">
                        <span className="text-amber-400 font-semibold font-mono">Reward: </span>
                        {tender.perkOnSign}
                      </div>

                      <button
                        onClick={() => openDealRoomForTender(tender.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg hover:shadow-cyan-500/30"
                      >
                        <span>Enter Deal Room</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* When viewing Active Contracts */}
            {activeTab !== "TENDERS" && filteredContracts.map((con) => {
              const isSelected = selectedContract?.id === con.id;
              const isOutbound = con.category !== "INBOUND_SUPPLIER";
              const progressPct = Math.round((con.terms.remainingMonths / con.terms.durationMonths) * 100);

              return (
                <div
                  key={con.id}
                  onClick={() => selectContract(con.id)}
                  className={`p-4 sm:p-5 rounded-2xl transition-all cursor-pointer shadow-xl border flex flex-col justify-between ${
                    isSelected
                      ? "bg-slate-900/95 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                      : "bg-slate-900/80 border-white/10 hover:border-white/20 hover:bg-slate-900"
                  }`}
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                          {getCategoryLabel(con.category)}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {con.partnerCountry}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {con.status === "PENDING_RENEWAL" && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 animate-pulse">
                            <Clock size={10} />
                            RENEWAL SOON
                          </span>
                        )}
                        <span className={`text-sm font-extrabold font-mono ${isOutbound ? "text-emerald-400" : "text-rose-400"}`}>
                          {formatCurrency(con.monthlyCashflow)}/mo
                        </span>
                      </div>
                    </div>

                    {/* Title & Partner */}
                    <h3 className="text-base font-extrabold text-white">
                      {con.partnerName}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {con.title}
                    </p>

                    {/* Term Progress Bar */}
                    <div className="my-3 p-3 rounded-xl bg-slate-950/70 border border-white/5">
                      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                        <span className="text-slate-400">Duration Term Progress:</span>
                        <span className="text-slate-200 font-bold">
                          {con.terms.remainingMonths} of {con.terms.durationMonths} Mos Left
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            progressPct > 25 ? "bg-cyan-400" : "bg-amber-400"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center justify-between font-mono">
                      <span>Perk: <span className="text-cyan-300 font-semibold">{con.perk}</span></span>
                      <span className="text-slate-500 font-bold">Trust: {con.relationshipScore}/100</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Panel: Selected Contract Inspector (5 Cols) */}
          <div className="lg:col-span-5">
            {selectedContract ? (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/15 shadow-2xl sticky top-20 flex flex-col justify-between gap-5 backdrop-blur-xl">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                        CONTRACT DOSSIER & SLA
                      </span>
                      <h3 className="text-lg font-black text-white mt-0.5">
                        {selectedContract.partnerName}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      {selectedContract.status}
                    </span>
                  </div>

                  {/* Financial & Volume Terms Table */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-white/5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monthly Cashflow:</span>
                      <span className={`font-bold ${selectedContract.monthlyCashflow >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {formatCurrency(selectedContract.monthlyCashflow)}/mo
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contract Unit Price:</span>
                      <span className="text-white font-bold">${selectedContract.terms.unitPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Annual Volume:</span>
                      <span className="text-white font-bold">{selectedContract.terms.annualVolume.toLocaleString()} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Term:</span>
                      <span className="text-slate-200">{selectedContract.terms.paymentTerm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Exclusivity:</span>
                      <span className={selectedContract.terms.exclusivity ? "text-cyan-400 font-bold" : "text-slate-400"}>
                        {selectedContract.terms.exclusivity ? "Exclusive Partner" : "Standard"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Defect Tolerance (PPM):</span>
                      <span className="text-slate-200">&lt; {selectedContract.terms.defectTolerancePpm} PPM</span>
                    </div>
                  </div>

                  {/* SLA Commitment */}
                  <div className="mt-3.5 p-3.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      GUARANTEED SERVICE LEVEL AGREEMENT (SLA)
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      "{selectedContract.terms.slaCommitment}"
                    </p>
                  </div>

                  {/* Performance & Quality Track Record */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5">
                      <div className="text-[10px] text-slate-400">On-Time Delivery</div>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">
                        {selectedContract.onTimeDeliveryRate}%
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5">
                      <div className="text-[10px] text-slate-400">Historical Units</div>
                      <div className="text-base font-bold text-cyan-300 mt-0.5">
                        {selectedContract.historyDeliveredUnits.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dossier Action Buttons */}
                <div className="space-y-2 pt-3 border-t border-white/10 font-mono">
                  <button
                    onClick={() => openDealRoomForRenegotiation(selectedContract.id)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={13} />
                    <span>Open Deal Room (Renegotiate)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => extendContract(selectedContract.id, 12)}
                      className="py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-bold transition-all"
                    >
                      +1 Year Extension
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Terminate contract with ${selectedContract.partnerName}? Penalty fee: $${selectedContract.terms.earlyTerminationPenalty.toLocaleString()}`)) {
                          terminateContract(selectedContract.id);
                        }
                      }}
                      className="py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <XCircle size={13} />
                      <span>Terminate Deal</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 text-center text-slate-500 text-xs font-mono">
                Select a contract to inspect legal terms, SLA commitments, and renewal options.
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* ── 4. Interactive Deal Room Modal ── */}
      <DealRoomModal />
    </SubPageLayout>
  );
};
