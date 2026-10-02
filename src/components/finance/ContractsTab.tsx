import React, { useState } from "react";
import {
  FileText, Handshake, DollarSign, Shield, ArrowUpRight,
  Clock, CheckCircle2, AlertTriangle, Sparkles, Factory
} from "lucide-react";
import { useContractsStore, ContractCategory } from "../../state/contractsStore";
import { useReputationStore } from "../../state/reputationStore";
import { TieredContractBoard } from "../mainMenu/contracts/TieredContractBoard";

export const ContractsTab: React.FC = () => {
  const {
    contracts,
    tenders,
    getNetMonthlyCashflow,
    getTotalAnnualizedValue,
    getAveragePartnerScore,
  } = useContractsStore();

  const { dimensions } = useReputationStore();
  const [subTab, setSubTab] = useState<"TIERED_BOARD" | "LEDGER">("TIERED_BOARD");

  const formatCurrency = (val: number) => {
    const isNegative = val < 0;
    const abs = Math.abs(val);
    if (abs >= 10000000) {
      return (isNegative ? "-" : "") + "₹" + (abs / 10000000).toFixed(2) + " Cr";
    }
    if (abs >= 100000) {
      return (isNegative ? "-" : "") + "₹" + (abs / 100000).toFixed(1) + " L";
    }
    return (isNegative ? "-" : "") + "₹" + abs.toLocaleString("en-IN");
  };

  const netCashflow = getNetMonthlyCashflow();
  const annualizedTotal = getTotalAnnualizedValue();
  const partnerScore = getAveragePartnerScore();

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── 1. Top Executive KPI Ribbon ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#eef6f2] via-[#f4faf6] to-[#edf5f0] border border-[#cfe5d6] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-900 uppercase block mb-1">
              B2B CONTRACTS & OEM SUPPLY AGREEMENTS
            </span>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {formatCurrency(netCashflow)}
              <span className="text-xs text-slate-500 font-normal font-sans ml-2">/ month net cashflow</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Contract agreements governing Tier-1 raw materials procurement, OEM crate engine sales, and international motorsport partnerships.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#ffffff]/90 border border-[#e2ddd0]">
              <span className="text-slate-500 block text-[10px]">ACTIVE AGREEMENTS</span>
              <span className="font-bold text-slate-900">{contracts.filter((c) => c.status === "ACTIVE").length} Contracts</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#ffffff]/90 border border-[#e2ddd0]">
              <span className="text-slate-500 block text-[10px]">AVG PARTNER TRUST</span>
              <span className="font-bold text-emerald-800">{partnerScore.toFixed(0)} / 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── View Switcher Buttons ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSubTab("TIERED_BOARD")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            subTab === "TIERED_BOARD"
              ? "bg-white text-slate-900 border-slate-300 shadow-sm"
              : "bg-[#f6f4ee] text-slate-600 border-[#e2ded4] hover:bg-white"
          }`}
        >
          <Factory size={15} className="text-amber-700" />
          <span>3-Tier Manufacturing & R&D Contracts</span>
        </button>
        <button
          onClick={() => setSubTab("LEDGER")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            subTab === "LEDGER"
              ? "bg-white text-slate-900 border-slate-300 shadow-sm"
              : "bg-[#f6f4ee] text-slate-600 border-[#e2ded4] hover:bg-white"
          }`}
        >
          <FileText size={15} className="text-slate-600" />
          <span>Active Contract Ledger ({contracts.length})</span>
        </button>
      </div>

      {subTab === "TIERED_BOARD" ? (
        <TieredContractBoard />
      ) : (
        /* ── 2. Active Contracts Ledger Table ── */
        <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#eee8dc]">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-slate-700" />
              <span className="text-xs font-black text-slate-900 font-mono uppercase tracking-wider">
                ACTIVE CONTRACTUAL COMMITMENTS
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Total Annualized: {formatCurrency(annualizedTotal)}
            </span>
          </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#e2ddd0] text-slate-500 text-[10px]">
                <th className="py-2">TITLE & PARTNER</th>
                <th className="py-2">CATEGORY</th>
                <th className="py-2">STATUS</th>
                <th className="py-2">MONTHLY CASH FLOW</th>
                <th className="py-2">REMAINING TERM</th>
                <th className="py-2 text-right">RELIABILITY</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id} className="border-b border-[#f2ede4] hover:bg-[#fbf9f4]">
                  <td className="py-3 font-sans">
                    <div className="font-bold text-slate-900 text-xs">{c.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {c.partnerName} • {c.partnerCountry}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f4f0e6] text-slate-800 border border-[#ded8c8]">
                      {c.category.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                        c.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td
                    className={`py-3 font-bold font-mono text-sm ${
                      c.monthlyCashflow >= 0 ? "text-emerald-700" : "text-amber-800"
                    }`}
                  >
                    {c.monthlyCashflow >= 0 ? "+" : ""}{formatCurrency(c.monthlyCashflow)} / mo
                  </td>
                  <td className="py-3 text-slate-700">
                    {c.terms.remainingMonths} of {c.terms.durationMonths} Mos
                  </td>
                  <td className="py-3 text-right font-bold text-emerald-800">
                    {c.onTimeDeliveryRate}% On-Time
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};
