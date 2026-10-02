import React from "react";
import {
  Car, Cpu, Key, Handshake, Flag, Wrench, DollarSign,
  TrendingUp, ArrowUpRight, CheckCircle2, Shield, Layers, FileText
} from "lucide-react";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useContractsStore } from "../../state/contractsStore";
import { useReputationStore } from "../../state/reputationStore";
import { useVehicleProductionStore } from "../../sim/economy/vehicleProductionRegistry";

export const IncomeTab: React.FC = () => {
  const { monthlyRevenue, monthlySnapshots, techLicenses, motorsportState, lastTickResult } = useCompanyFinanceStore();
  const { contracts } = useContractsStore();
  const { overallReputation, dimensions } = useReputationStore();
  const { lines } = useVehicleProductionStore();

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

  const latestSnapshot = monthlySnapshots.length > 0 ? monthlySnapshots[monthlySnapshots.length - 1] : null;
  const revByCategory = latestSnapshot?.revenueByCategory ?? {
    VEHICLE_SALES: 0,
    COMPONENT_SALES: 0,
    TECH_LICENSING: 0,
    CONTRACT_INCOME: 0,
    MOTORSPORT_INCOME: 0,
    AFTER_SALES: 0,
  };

  const activeContracts = contracts.filter((c) => c.status === "ACTIVE");

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── 1. Revenue Streams Summary Header ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#edf4f9] via-[#f4f7f8] to-[#edf4f0] border border-[#d2dfdb] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-sky-800 uppercase block mb-1">
              CORPORATE REVENUE SYSTEM (6 ACTIVE STREAMS)
            </span>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {formatCurrency(monthlyRevenue)}
              <span className="text-xs text-slate-500 font-normal font-sans ml-2">/ month</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Diversified revenue architecture ensuring commercial stability across vehicle demand cycles, OEM B2B partnerships, and recurring after-sales cash flow.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-700" />
              Brand Lift: +{Math.round((overallReputation / 100) * 25)}% Elasticity
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. The Six Distinct Revenue Streams Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Stream 1: Vehicle Sales */}
        <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 mb-2">
              <span className="flex items-center gap-1.5 text-slate-900">
                <Car size={16} className="text-sky-600" />
                1. VEHICLE SALES
              </span>
              <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                DIRECT TO CUSTOMER
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mb-1">
              {formatCurrency(revByCategory.VEHICLE_SALES)}
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Retail deliveries across active model lines. Realized unit price after dealer network margins.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#f6f9fc] border border-[#dce8f4] text-[11px] font-mono text-slate-700 flex justify-between items-center">
            <span>Active Production Lines:</span>
            <span className="font-bold text-slate-900">{lines.filter((l) => l.isActive).length} Models</span>
          </div>
        </div>

        {/* Stream 2: B2B Component Supply */}
        <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 mb-2">
              <span className="flex items-center gap-1.5 text-slate-900">
                <Cpu size={16} className="text-emerald-600" />
                2. COMPONENT SUPPLY
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                B2B OEM CONTRACTS
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mb-1">
              {formatCurrency(revByCategory.COMPONENT_SALES)}
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Supplying in-house engines, transmissions, and rolling assemblies to third-party carmakers.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#f4faf5] border border-[#d5ecda] text-[11px] font-mono text-slate-700 flex justify-between items-center">
            <span>Active OEM Clients:</span>
            <span className="font-bold text-emerald-800">{activeContracts.length} Partners</span>
          </div>
        </div>

        {/* Stream 3: Technology Licensing */}
        <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 mb-2">
              <span className="flex items-center gap-1.5 text-slate-900">
                <Key size={16} className="text-purple-600" />
                3. TECH & IP LICENSING
              </span>
              <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                PATENT ROYALTIES
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mb-1">
              {formatCurrency(revByCategory.TECH_LICENSING)}
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Per-unit royalties and ongoing engineering support contracts on proprietary patents.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#faf6fe] border border-[#e9daf8] text-[11px] font-mono text-slate-700 flex justify-between items-center">
            <span>Active Licenses:</span>
            <span className="font-bold text-purple-800">{techLicenses.filter((l) => l.status === "ACTIVE").length} Agreements</span>
          </div>
        </div>

        {/* Stream 4: Strategic Contracts */}
        <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 mb-2">
              <span className="flex items-center gap-1.5 text-slate-900">
                <Handshake size={16} className="text-indigo-600" />
                4. STRATEGIC CONTRACTS
              </span>
              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                COMMERCIAL ALLIANCES
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mb-1">
              {formatCurrency(revByCategory.CONTRACT_INCOME)}
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Multi-year tender commitments from corporate fleet operators and municipal institutions.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#f5f6fe] border border-[#dcdffd] text-[11px] font-mono text-slate-700 flex justify-between items-center">
            <span>Contract Cashflow:</span>
            <span className="font-bold text-indigo-800">{activeContracts.length} Active</span>
          </div>
        </div>

        {/* Stream 5: Motorsport & Racing */}
        <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 mb-2">
              <span className="flex items-center gap-1.5 text-slate-900">
                <Flag size={16} className="text-rose-600" />
                5. MOTORSPORT DIVISION
              </span>
              <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                PRIZES & SPONSORS
              </span>
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <div className="text-2xl font-black text-slate-900 font-mono">
                {formatCurrency(revByCategory.MOTORSPORT_INCOME)}
              </div>
              {lastTickResult && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                  lastTickResult.motorsportNetCost <= 0
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}>
                  Net: {lastTickResult.motorsportNetCost <= 0 ? "+" : "-"}{formatCurrency(Math.abs(lastTickResult.motorsportNetCost))}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Championship prize money, commercial title sponsorships, and customer racing support.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#fef5f5] border border-[#fbd8d8] text-[11px] font-mono text-slate-700 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span>Racing Status:</span>
              <span className="font-bold text-rose-800">{motorsportState.isActive ? `${motorsportState.tier} (#${motorsportState.currentChampionshipStanding})` : "Inactive (Workshop Era)"}</span>
            </div>
            {lastTickResult && (
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-rose-100">
                <span>Revenue vs Expense:</span>
                <span>+{formatCurrency(lastTickResult.motorsportRevenue)} / -{formatCurrency(lastTickResult.motorsportExpense)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stream 6: After-Sales & Servicing */}
        <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 mb-2">
              <span className="flex items-center gap-1.5 text-slate-900">
                <Wrench size={16} className="text-amber-600" />
                6. AFTER-SALES & SERVICE
              </span>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                INSTALLED FLEET PARC
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mb-1">
              {formatCurrency(revByCategory.AFTER_SALES)}
            </div>
            <p className="text-xs text-slate-600 mb-3">
              High-margin recurring revenue from scheduled servicing visits, spare parts, and accessories.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#fdfaf3] border border-[#f7e6c4] text-[11px] font-mono text-slate-700 flex justify-between items-center">
            <span>Customer Retention:</span>
            <span className="font-bold text-amber-800">88% Authorized Network</span>
          </div>
        </div>
      </div>

      {/* ── 3. Itemized Vehicle Production Lines Breakdown (Section 5F Spec) ── */}
      <div className="p-5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 font-serif text-sm flex items-center gap-2">
              <Layers size={16} className="text-sky-600" />
              Active Vehicle Model Portfolio & Monthly Sales Performance
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Individual model line unit pricing, factory output, realized sales prices, and gross profit contribution
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#fcfaf6] border-b border-[#ece6da] text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Model Name</th>
                <th className="py-2.5 px-3">Segment</th>
                <th className="py-2.5 px-3 text-right">List Price</th>
                <th className="py-2.5 px-3 text-right">Monthly Output</th>
                <th className="py-2.5 px-3 text-right">Sold / Demand</th>
                <th className="py-2.5 px-3 text-right">Realized Unit Price</th>
                <th className="py-2.5 px-3 text-right">Monthly Gross Profit</th>
                <th className="py-2.5 px-3 text-right">Inventory</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line) => {
                const salesDetail = lastTickResult?.modelSalesDetails.find((m) => m.modelId === line.modelId);
                return (
                  <tr key={line.modelId} className="hover:bg-[#faf7f2] transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{line.modelName}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-200">
                        {line.segment}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(line.listPrice)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-800">{line.monthlyCapacity} units/mo</td>
                    <td className="py-3 px-3 text-right text-slate-800">
                      {salesDetail ? (
                        <span className="font-bold text-slate-900">
                          {salesDetail.unitsSold} <span className="text-[10px] text-slate-500 font-normal">/ {salesDetail.unitsDemanded}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-800">
                      {salesDetail ? (
                        <span className="font-bold text-emerald-800">
                          {formatCurrency(salesDetail.realizedPrice)}
                        </span>
                      ) : (
                        formatCurrency(line.listPrice)
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {salesDetail ? (
                        <span className={`font-bold ${salesDetail.grossProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                          {salesDetail.grossProfit >= 0 ? "+" : ""}{formatCurrency(salesDetail.grossProfit)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-800">{line.currentInventory} units</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        line.isActive
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-100 text-slate-600 border border-slate-300"
                      }`}>
                        {line.isActive ? "ACTIVE" : "RETIRED"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Itemized B2B Contracts & Tech Licensing Breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active B2B Contracts */}
        <div className="p-5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-3">
          <h4 className="font-bold text-slate-900 font-serif text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Handshake size={15} className="text-indigo-600" />
            Active B2B Supply & Fleet Contracts
          </h4>
          {activeContracts.length === 0 ? (
            <span className="text-xs text-slate-400 italic p-2">No active third-party contracts currently in force.</span>
          ) : (
            <div className="flex flex-col gap-2">
              {activeContracts.map((ctr) => (
                <div key={ctr.id} className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece6da] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{ctr.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Partner: {ctr.partnerName}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-emerald-700">{formatCurrency(ctr.monthlyCashflow)}</span>
                    <span className="text-[10px] text-slate-400 block">/ month</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tech Licensing Royalties */}
        <div className="p-5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-3">
          <h4 className="font-bold text-slate-900 font-serif text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Key size={15} className="text-purple-600" />
            Active Technology Patent Licensing
          </h4>
          {techLicenses.filter((l) => l.status === "ACTIVE").length === 0 ? (
            <span className="text-xs text-slate-400 italic p-2">No proprietary patents licensed to external OEMs yet. Unlock advanced R&D patents to generate licensing revenue.</span>
          ) : (
            <div className="flex flex-col gap-2">
              {techLicenses.filter((l) => l.status === "ACTIVE").map((lic) => (
                <div key={lic.id} className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece6da] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{lic.technologyName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Licensee: {lic.licenseeName}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-purple-700">₹{lic.perUnitRoyalty}/unit</span>
                    <span className="text-[10px] text-slate-400 block">{lic.durationMonths - lic.monthsActive} mos remaining</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
