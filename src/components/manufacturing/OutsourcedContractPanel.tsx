import React, { useState } from "react";
import {
  Handshake,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Truck,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Boxes,
  HelpCircle,
  Sparkles,
  Receipt,
  FileCheck,
} from "lucide-react";
import {
  ContractManufacturer,
  ContractOrderQuote,
  PlacedContractOrder,
  CONTRACT_MANUFACTURERS_CATALOG,
  calculateContractManufacturerQuote,
} from "../../sim/manufacturing/manufacturingSystemEngine";
import { fmtCurrency } from "../../state/DesignContext";

interface OutsourcedContractPanelProps {
  baseMaterialsUSD: number;
  playerCashUSD: number;
  targetPriceUSD: number;
  modelName: string;
  activeOrders: PlacedContractOrder[];
  onPlaceOrder: (order: PlacedContractOrder) => void;
}

export function OutsourcedContractPanel({
  baseMaterialsUSD,
  playerCashUSD,
  targetPriceUSD,
  modelName,
  activeOrders,
  onPlaceOrder,
}: OutsourcedContractPanelProps) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("magna_steyr");
  const [orderUnits, setOrderUnits] = useState<number>(500);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [justPlacedReceipt, setJustPlacedReceipt] = useState<PlacedContractOrder | null>(null);

  const selectedPartner =
    CONTRACT_MANUFACTURERS_CATALOG.find((p) => p.id === selectedPartnerId) ||
    CONTRACT_MANUFACTURERS_CATALOG[0];

  const quote: ContractOrderQuote = calculateContractManufacturerQuote(
    selectedPartner,
    orderUnits,
    baseMaterialsUSD,
    playerCashUSD
  );

  const profitPerUnit = targetPriceUSD - quote.totalQuotedUnitCostUSD;
  const marginPct = targetPriceUSD > 0 ? (profitPerUnit / targetPriceUSD) * 100 : 0;

  const handleAuthorizeOrder = () => {
    if (!quote.canAfford || !quote.meetsMOQ || !quote.withinCapacity) return;

    setIsSubmitting(true);
    const newOrder: PlacedContractOrder = {
      orderId: `ORD-${Date.now().toString().slice(-6)}-${selectedPartner.id.slice(0, 3).toUpperCase()}`,
      partnerId: selectedPartner.id,
      partnerName: selectedPartner.name,
      vehicleModelName: modelName,
      unitsOrdered: orderUnits,
      unitCostUSD: quote.totalQuotedUnitCostUSD,
      totalPaidUSD: quote.totalContractCostUSD,
      orderTimestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      leadTimeDays: selectedPartner.leadTimeDays,
      qualityScore: selectedPartner.qualityRatingScore,
      status: "DELIVERED", // Immediate fleet fulfillment for gameplay flow
    };

    setTimeout(() => {
      onPlaceOrder(newOrder);
      setJustPlacedReceipt(newOrder);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER NOTICE ── */}
      <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-[#f4f7fb] to-indigo-50/50 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Handshake size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Contract Manufacturing & Rival Foundry Bidding
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Bypass factory capacity bottlenecks by commissioning external assembly lines. You pay the quoted contract price and receive turnkey finished vehicles ready for showroom distribution.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              Available Cash
            </span>
            <span className="text-base font-black font-mono text-emerald-800">
              ${Math.round(playerCashUSD).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTRACTOR & RIVAL CATALOG GRID ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
            <span>External Manufacturing Partners & Rival Foundries</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {CONTRACT_MANUFACTURERS_CATALOG.length} Available
            </span>
          </h4>
          <span className="text-[11px] text-slate-500">
            Select a company to review terms & place an order
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {CONTRACT_MANUFACTURERS_CATALOG.map((partner) => {
            const isSelected = partner.id === selectedPartnerId;
            const partnerQuote = calculateContractManufacturerQuote(
              partner,
              Math.max(partner.moqUnits, 250),
              baseMaterialsUSD,
              playerCashUSD
            );

            return (
              <div
                key={partner.id}
                onClick={() => {
                  setSelectedPartnerId(partner.id);
                  if (orderUnits < partner.moqUnits) {
                    setOrderUnits(partner.moqUnits);
                  }
                }}
                className={`group relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-md"
                    : "border-slate-200/90 bg-[#fbf9f5]/80 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div>
                  {/* Top Bar: Country & Badge */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <span className="text-base">{partner.countryFlag}</span>
                      <span>{partner.locationCity}</span>
                    </div>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wider border ${
                        partner.isRival
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {partner.isRival ? `RIVAL: ${partner.rivalBrandName}` : "INDEPENDENT"}
                    </span>
                  </div>

                  {/* Partner Name */}
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {partner.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {partner.specialty}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500 text-[11px]">Quoted Unit Cost:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${Math.round(partnerQuote.totalQuotedUnitCostUSD).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="text-slate-500">Quality QA Score:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {partner.qualityRatingScore}/100 ({partner.defectRatePct}% defect)
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="text-slate-500">Lead Time:</span>
                    <span className="font-mono text-slate-700">{partner.leadTimeDays} days</span>
                  </div>

                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="text-slate-500">Monthly Capacity:</span>
                    <span className="font-mono text-slate-700">
                      {partner.monthlyAvailableCapacity.toLocaleString()} <span className="text-[9px] text-slate-400">MOQ {partner.moqUnits}</span>
                    </span>
                  </div>

                  {partner.isRival && (
                    <div className="text-[10px] text-rose-700 font-medium pt-1">
                      ⚠️ Includes +{partner.rivalMarkupPct}% Rival Surcharge
                    </div>
                  )}
                </div>

                {/* Select Indicator */}
                <div className="mt-3 pt-2">
                  <button
                    type="button"
                    className={`w-full py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isSelected ? "Selected Partner ✓" : "Configure Order"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ORDER CONFIGURATION & CONFIRMATION DESK ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                ACTIVE CONTRACT DESK
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span>{selectedPartner.countryFlag}</span>
                <span>{selectedPartner.name}</span>
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Contract Order: {modelName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedPartner.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">Quick Batches:</span>
            {[selectedPartner.moqUnits, 250, 500, 1000, selectedPartner.monthlyAvailableCapacity].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setOrderUnits(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                  orderUnits === preset
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Units Slider */}
        <div className="py-5">
          <div className="flex justify-between items-baseline mb-2">
            <label className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">
              Order Quantity (Units to Commission)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black font-mono text-blue-700">
                {orderUnits.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">cars</span>
            </div>
          </div>

          <input
            type="range"
            min={selectedPartner.moqUnits}
            max={selectedPartner.monthlyAvailableCapacity}
            step={25}
            value={orderUnits}
            onChange={(e) => setOrderUnits(parseInt(e.target.value, 10) || selectedPartner.moqUnits)}
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
            <span>MOQ: {selectedPartner.moqUnits.toLocaleString()} units</span>
            <span className="text-blue-700 font-bold">
              Target Quota: {orderUnits.toLocaleString()} units
            </span>
            <span>Monthly Cap: {selectedPartner.monthlyAvailableCapacity.toLocaleString()} units</span>
          </div>
        </div>

        {/* Real-Time Price & Fee Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-xl bg-[#fbf9f5] border border-slate-200/80">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">
              Base Materials & BOM
            </span>
            <span className="text-sm font-bold font-mono text-slate-800">
              ${Math.round(quote.unitBaseMaterialsUSD).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">per car</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">
              Conversion & Stamping
            </span>
            <span className="text-sm font-bold font-mono text-slate-800">
              ${Math.round(quote.unitConversionCostUSD).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">per car</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">
              Partner Margin ({selectedPartner.contractMarginPct}%)
            </span>
            <span className="text-sm font-bold font-mono text-slate-800">
              ${Math.round(quote.unitPartnerMarginUSD).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">contractor fee</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">
              Rival Markup & Freight
            </span>
            <span className={`text-sm font-bold font-mono ${selectedPartner.isRival ? "text-rose-700" : "text-slate-800"}`}>
              ${Math.round(quote.unitRivalMarkupUSD + quote.unitLogisticsUSD).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {selectedPartner.isRival ? `+${selectedPartner.rivalMarkupPct}% rival penalty` : "logistics"}
            </span>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-3 pt-2 lg:pt-0">
            <span className="text-[10px] text-slate-600 font-bold uppercase font-mono tracking-wider block">
              Total Quoted Unit Cost
            </span>
            <span className="text-base font-black font-mono text-blue-700">
              ${Math.round(quote.totalQuotedUnitCostUSD).toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-700 font-mono font-semibold block">
              Profit: ${Math.round(profitPerUnit).toLocaleString()} ({marginPct.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Validation Errors or Alerts */}
        {quote.validationError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{quote.validationError}</span>
          </div>
        )}

        {/* Order Placement Action */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-xs text-slate-500">
              Total Order Price: <strong className="text-base font-mono text-slate-900 font-black">${quote.totalContractCostUSD.toLocaleString()}</strong>
            </div>
            <div className="text-[11px] text-slate-400">
              Delivery: ~{quote.guaranteedPassUnits.toLocaleString()} units expected to pass QA ({selectedPartner.defectRatePct}% estimated defect buffer)
            </div>
          </div>

          <button
            type="button"
            disabled={!quote.canAfford || !quote.meetsMOQ || !quote.withinCapacity || isSubmitting}
            onClick={handleAuthorizeOrder}
            className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-mono font-black text-xs tracking-wider uppercase shadow-md transition-all ${
              !quote.canAfford || !quote.meetsMOQ || !quote.withinCapacity
                ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                : isSubmitting
                ? "bg-blue-700 text-white animate-pulse"
                : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isSubmitting ? (
              <>
                <Clock size={16} className="animate-spin" />
                <span>TRANSFERRING CAPITAL & COMMENCING...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>PAY CONTRACT & COMMENCE ORDER (${quote.totalContractCostUSD.toLocaleString()}) →</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── RECENT ORDERS & DISPATCH LOG ── */}
      {activeOrders.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xs">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2 mb-3">
            <Receipt size={14} className="text-blue-600" />
            <span>Active Contract Order Receipts & Fulfillment History</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2 font-semibold">Order ID</th>
                  <th className="py-2 font-semibold">Contractor</th>
                  <th className="py-2 font-semibold">Vehicle</th>
                  <th className="py-2 font-semibold">Volume</th>
                  <th className="py-2 font-semibold">Unit Cost</th>
                  <th className="py-2 font-semibold">Total Paid</th>
                  <th className="py-2 font-semibold">Quality</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {activeOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-bold text-slate-800">{ord.orderId}</td>
                    <td className="py-2.5 text-slate-700">{ord.partnerName}</td>
                    <td className="py-2.5 text-slate-700">{ord.vehicleModelName}</td>
                    <td className="py-2.5 font-bold text-blue-700">
                      +{ord.unitsOrdered.toLocaleString()} units
                    </td>
                    <td className="py-2.5 text-slate-700">${Math.round(ord.unitCostUSD).toLocaleString()}</td>
                    <td className="py-2.5 font-bold text-slate-900">${ord.totalPaidUSD.toLocaleString()}</td>
                    <td className="py-2.5 text-emerald-700">{ord.qualityScore}/100</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {ord.status}
                      </span>
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
}
