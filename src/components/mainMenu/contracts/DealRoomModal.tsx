import React from "react";
import {
  X, Handshake, AlertTriangle, CheckCircle, TrendingUp,
  Shield, DollarSign, Calendar, Sparkles, Building, ArrowRight
} from "lucide-react";
import { useContractsStore, type ContractCategory } from "../../../state/contractsStore";

export const DealRoomModal: React.FC = () => {
  const {
    activeNegotiation,
    closeDealRoom,
    updateNegotiationTerms,
    requestCounterOffer,
    ratifyNegotiation,
  } = useContractsStore();

  if (!activeNegotiation) return null;

  const isOutbound = activeNegotiation.category !== "INBOUND_SUPPLIER";
  const monthlyImpact = Math.round((activeNegotiation.unitPrice * activeNegotiation.annualVolume) / 12);
  const formattedMonthly = (isOutbound ? "+" : "-") + "$" + monthlyImpact.toLocaleString();

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "EAGER":
        return { text: "Eager to Sign", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
      case "FAVORABLE":
        return { text: "Favorable Terms", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" };
      case "HESITANT":
        return { text: "Hesitant / Guarded", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
      default:
        return { text: "Insulted / Critical", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" };
    }
  };

  const sentiment = getSentimentBadge(activeNegotiation.partnerSentiment);

  const handleSign = () => {
    const success = ratifyNegotiation();
    if (!success) {
      alert("Offer rejected by counterpart. Increase offer terms or accept their counter-offer.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn select-none font-sans">
      <div className="w-full max-w-4xl bg-slate-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border-t-cyan-500/50">
        
        {/* ── Top Header ── */}
        <div className="p-5 sm:p-6 bg-slate-900/80 border-b border-white/10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Handshake size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  B2B DEAL ROOM • LIVE NEGOTIATION
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                  {activeNegotiation.category.replace("_", " ")}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                {activeNegotiation.partnerName}
              </h2>
            </div>
          </div>

          <button
            onClick={closeDealRoom}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Main Negotiation Body ── */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#090c14]">
          
          {/* Left Column: Commercial Levers (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={14} className="text-cyan-400" />
              <span>COMMERCIAL LEVERS & TERMS</span>
            </div>

            {/* Lever 1: Unit Price Slider */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-white">Unit Price</label>
                <div className="text-sm font-extrabold font-mono text-cyan-300">
                  ${activeNegotiation.unitPrice.toLocaleString()} <span className="text-[10px] text-slate-400">/ unit</span>
                </div>
              </div>
              <input
                type="range"
                min={Math.round(activeNegotiation.unitPrice * 0.5)}
                max={Math.round(activeNegotiation.unitPrice * 1.8)}
                step={Math.max(1, Math.round(activeNegotiation.unitPrice * 0.02))}
                value={activeNegotiation.unitPrice}
                onChange={(e) => updateNegotiationTerms({ unitPrice: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Aggressive Discount</span>
                <span>Market Parity</span>
                <span>Premium Margin</span>
              </div>
            </div>

            {/* Lever 2: Annual Volume Slider */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-white">Annual Volume Commitment (MOQ)</label>
                <div className="text-sm font-extrabold font-mono text-cyan-300">
                  {activeNegotiation.annualVolume.toLocaleString()} <span className="text-[10px] text-slate-400">units/yr</span>
                </div>
              </div>
              <input
                type="range"
                min={Math.max(1, Math.round(activeNegotiation.annualVolume * 0.4))}
                max={Math.round(activeNegotiation.annualVolume * 2.5)}
                step={Math.max(1, Math.round(activeNegotiation.annualVolume * 0.05))}
                value={activeNegotiation.annualVolume}
                onChange={(e) => updateNegotiationTerms({ annualVolume: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
              />
            </div>

            {/* Lever 3: Contract Duration Toggle Buttons */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <label className="text-xs font-bold text-white block mb-2">
                Contract Duration Term
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 5].map((yrs) => {
                  const isSelected = activeNegotiation.durationYears === yrs;
                  return (
                    <button
                      key={yrs}
                      type="button"
                      onClick={() => updateNegotiationTerms({ durationYears: yrs as 1 | 3 | 5 })}
                      className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all border ${
                        isSelected
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                          : "bg-slate-950/70 text-slate-400 border-white/5 hover:border-white/20"
                      }`}
                    >
                      {yrs} Year{yrs > 1 ? "s" : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lever 4: Exclusivity & Payment Term Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Exclusivity */}
              <div
                onClick={() => updateNegotiationTerms({ exclusivity: !activeNegotiation.exclusivity })}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield size={14} className={activeNegotiation.exclusivity ? "text-cyan-400" : "text-slate-500"} />
                    <span>Exclusivity Clause</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Lock out rival companies</div>
                </div>
                <input
                  type="checkbox"
                  checked={activeNegotiation.exclusivity}
                  onChange={() => {}}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Payment Terms */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                <label className="text-xs font-bold text-white block mb-1">Payment Timing</label>
                <select
                  value={activeNegotiation.paymentTerm}
                  onChange={(e) => updateNegotiationTerms({ paymentTerm: e.target.value as any })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                >
                  <option value="NET_30">Net 30 Days (Standard)</option>
                  <option value="NET_60">Net 60 Days (Flexible)</option>
                  <option value="UPFRONT">Upfront Advance (5% Perk)</option>
                </select>
              </div>
            </div>

            {/* Counter-Offer Box if present */}
            {activeNegotiation.counterOffer && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-400 mb-1">
                  <Sparkles size={14} />
                  <span>COUNTER-PROPOSAL FROM {activeNegotiation.partnerName}</span>
                </div>
                <p className="text-xs text-amber-100/90 leading-relaxed mb-3">
                  "{activeNegotiation.counterOffer.message}"
                </p>
                <button
                  onClick={() => {
                    if (activeNegotiation.counterOffer) {
                      updateNegotiationTerms({
                        unitPrice: activeNegotiation.counterOffer.unitPrice,
                        durationYears: activeNegotiation.counterOffer.durationYears,
                        annualVolume: activeNegotiation.counterOffer.annualVolume,
                      });
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all font-mono"
                >
                  Apply Counter-Offer Terms
                </button>
              </div>
            )}
          </div>

          {/* Right Column: AI Partner Sentiment & Acceptance Meter (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            
            {/* Acceptance Gauge Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col items-center text-center">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
                ACCEPTANCE PROBABILITY
              </span>

              {/* Large Metric Display */}
              <div className="text-4xl sm:text-5xl font-black font-mono text-white my-2">
                <span className={activeNegotiation.acceptanceProbability >= 70 ? "text-emerald-400" : activeNegotiation.acceptanceProbability >= 40 ? "text-amber-400" : "text-rose-400"}>
                  {activeNegotiation.acceptanceProbability}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-white/5 my-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    activeNegotiation.acceptanceProbability >= 70 
                      ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" 
                      : activeNegotiation.acceptanceProbability >= 40 
                      ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]" 
                      : "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                  }`}
                  style={{ width: `${activeNegotiation.acceptanceProbability}%` }}
                />
              </div>

              {/* Sentiment Badge */}
              <div className={`mt-2 px-3 py-1 rounded-full text-xs font-mono font-bold border ${sentiment.color}`}>
                {sentiment.text}
              </div>
            </div>

            {/* Financial Projection Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 font-mono">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                PROJECTED FINANCIAL IMPACT
              </span>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Monthly Cashflow:</span>
                <span className={`font-bold text-sm ${isOutbound ? "text-emerald-400" : "text-rose-400"}`}>
                  {formattedMonthly}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Annual Deal Value:</span>
                <span className="text-white font-bold">
                  ${(monthlyImpact * 12).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Contract Value:</span>
                <span className="text-cyan-300 font-bold">
                  ${(monthlyImpact * 12 * activeNegotiation.durationYears).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Early Termination Risk:</span>
                <span className="text-amber-400 font-bold">
                  ${(monthlyImpact * 3).toLocaleString()} fee
                </span>
              </div>
            </div>

            {/* Actions: Request Counter or Ratify */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={requestCounterOffer}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-cyan-400/50 text-xs font-mono font-bold transition-all"
              >
                Request Partner Counter-Offer
              </button>

              <button
                type="button"
                disabled={activeNegotiation.acceptanceProbability < 40}
                onClick={handleSign}
                className={`w-full py-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl ${
                  activeNegotiation.acceptanceProbability >= 40
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-cyan-500/25 hover:shadow-cyan-500/40"
                    : "bg-slate-900 text-slate-600 border border-white/5 cursor-not-allowed"
                }`}
              >
                <span>Sign & Ratify Contract</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
