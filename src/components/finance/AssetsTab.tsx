import {
  Building, Factory, Hammer, Wrench, Shield, CheckCircle2,
  TrendingDown, PlusCircle, Gauge, CreditCard, DollarSign, AlertCircle
} from "lucide-react";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useReputationStore } from "../../state/reputationStore";
import { CompanyAssetType } from "../../sim/economy/balanceSheet";
import {
  getAvailableLoanOpportunities,
  createActiveLoan,
  ActiveLoan,
} from "../../sim/economy/loanFinancingEngine";
import { calculateCompanyValuation } from "../../sim/economy/companyValuation";

export const AssetsTab: React.FC = () => {
  const { assets, balanceSheet, activeLoans, addLoan, injectCapital, monthlyRevenue, monthlyOperatingProfit, rdBudget } = useCompanyFinanceStore();
  const { month, year } = useSimulationClockStore();
  const { dimensions, overallReputation } = useReputationStore();

  const valuation = calculateCompanyValuation(
    balanceSheet,
    monthlyOperatingProfit * 12,
    overallReputation,
    dimensions.commercialTrust?.score ?? 35,
    rdBudget.activeProjects.filter((p) => p.status === "COMPLETED").length + 2
  );

  const loanOpportunities = getAvailableLoanOpportunities(
    valuation.creditRating,
    dimensions.commercialTrust?.score ?? 35,
    monthlyRevenue * 12
  );

  const handleTakeLoan = (opp: typeof loanOpportunities[0]) => {
    const principal = opp.maxPrincipal;
    const newLoan = createActiveLoan(
      opp.type,
      principal,
      opp.defaultTermMonths,
      opp.effectiveInterestRatePct,
      opp.lenderName,
      year
    );
    addLoan(newLoan);
    injectCapital(principal, `Commercial Debt Issue: ${opp.title}`, month, year);
  };

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

  const getAssetIcon = (type: CompanyAssetType) => {
    switch (type) {
      case "HQ":
        return <Building size={18} className="text-amber-700" />;
      case "FACTORY":
      case "WAREHOUSE":
      case "RAIL":
        return <Factory size={18} className="text-emerald-700" />;
      case "TESTING_FACILITY":
      case "WIND_TUNNEL":
      case "RD_LAB":
        return <Gauge size={18} className="text-sky-700" />;
      default:
        return <Hammer size={18} className="text-purple-700" />;
    }
  };

  const totalMonthlyMaintenance = assets.reduce((sum, a) => sum + a.monthlyMaintenanceCost, 0);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── 1. Assets Portfolio Header ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#f7f5ed] via-[#f9f7f0] to-[#f4f2e9] border border-[#ded8c8] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-amber-900 uppercase block mb-1">
              PHYSICAL CAPITAL ASSET REGISTRY & BOOK DEPRECIATION
            </span>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {formatCurrency(balanceSheet.totalPhysicalAssets)}
              <span className="text-xs text-slate-500 font-normal font-sans ml-2">Total Net Book Value</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Physical manufacturing plants, headquarters campus, engine dynamometers, and metal tooling dies recorded on the corporate balance sheet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#ffffff]/90 border border-[#e2ddd0]">
              <span className="text-slate-500 block text-[10px]">TOTAL ASSETS COUNT</span>
              <span className="font-bold text-slate-900">{assets.length} Properties</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#ffffff]/90 border border-[#e2ddd0]">
              <span className="text-slate-500 block text-[10px]">MONTHLY UPKEEP</span>
              <span className="font-bold text-amber-800">{formatCurrency(totalMonthlyMaintenance)} / mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Asset Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => {
          const depreciationAccumulated = asset.originalCost - asset.currentValue;
          return (
            <div
              key={asset.id}
              className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#eee8dc]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#f4f0e6] flex items-center justify-center">
                      {getAssetIcon(asset.type)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 font-sans leading-tight">
                        {asset.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">
                        {asset.type} • Acquired {asset.acquisitionYear}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {asset.conditionPct}% Integrity
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Current Book Value:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(asset.currentValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Original Acquisition Cost:</span>
                    <span className="text-slate-700">{formatCurrency(asset.originalCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Monthly Maintenance Upkeep:</span>
                    <span className="text-amber-800 font-bold">{formatCurrency(asset.monthlyMaintenanceCost)} / mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Annual Depreciation Rate:</span>
                    <span className="text-slate-700">{(asset.annualDepreciationRate * 100).toFixed(1)}% / yr</span>
                  </div>
                  {asset.capacityUnits && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Rated Annual Output:</span>
                      <span className="font-bold text-sky-800">{asset.capacityUnits.toLocaleString()} units / yr</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#eee8dc] text-[10px] font-mono text-slate-500 flex justify-between items-center">
                <span>Depreciation to Date:</span>
                <span className="font-semibold text-slate-700">-{formatCurrency(depreciationAccumulated)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Corporate Liabilities & Debt Facilities (Section 19 Spec) ── */}
      <div className="p-5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 font-serif text-sm flex items-center gap-2">
              <CreditCard size={16} className="text-purple-700" />
              Corporate Balance Sheet Liabilities & Debt Amortization
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Credit facilities, term loans, and debt obligations (Credit Rating: {valuation.creditRating})
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">
            Total Outstanding Debt: {formatCurrency(activeLoans.reduce((sum, l) => sum + l.principalRemaining, 0))}
          </span>
        </div>

        {/* Active Loans List */}
        {activeLoans.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#faf7f2] border border-[#ece6da] text-xs text-slate-600 font-mono flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Clean balance sheet with zero outstanding corporate debt liabilities.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeLoans.map((loan) => (
              <div key={loan.id} className="p-4 rounded-xl bg-[#faf7f2] border border-[#ece6da] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block font-sans">{loan.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{loan.lenderName}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      {loan.annualInterestRatePct}% APR
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Principal Left</span>
                      <span className="font-bold text-slate-900">{formatCurrency(loan.principalRemaining)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Monthly Debt Service</span>
                      <span className="font-bold text-rose-800">{formatCurrency(loan.monthlyPayment)} / mo</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#ece6da] flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>Maturity Timeline</span>
                  <span className="font-bold text-slate-700">{loan.monthsRemaining} of {loan.termMonths} months left</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Available Loan Facilities */}
        <div className="mt-2">
          <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
            Available Corporate Credit Facilities & Term Loan Programs
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {loanOpportunities.map((opp) => (
              <div key={opp.type} className="p-4 rounded-xl bg-[#faf9f6] border border-[#e2ddd0] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <span className="font-bold text-xs text-slate-900 font-sans">{opp.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{opp.lenderName}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-800">
                      {opp.effectiveInterestRatePct}% APR
                    </span>
                  </div>
                  <div className="text-xs font-mono my-2 space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Maximum Facility:</span>
                      <strong className="text-slate-900">{formatCurrency(opp.maxPrincipal)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Term Duration:</span>
                      <span>{opp.defaultTermMonths} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum Credit Rating:</span>
                      <span className="font-bold text-slate-700">{opp.minimumCreditRating}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#eee8dc] flex items-center justify-between">
                  {opp.isEligible ? (
                    <button
                      onClick={() => handleTakeLoan(opp)}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold transition-all text-center"
                    >
                      Issue {opp.title} ({formatCurrency(opp.maxPrincipal)})
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-700 italic">
                      {opp.ineligibilityReason}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
