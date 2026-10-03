/**
 * ═══════════════════════════════════════════════════════════════════════
 * RAW MATERIALS, TRADE & SUPPLY CHAIN HUB — LUXURY LIGHT INTERFACE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements the complete 6-level continuous physical and economic chain:
 * Natural Resources → Smelting/Refining → Formed Stocks → Components →
 * Subassemblies → Vehicle Final Assembly → Competitor B2B OEM Supply.
 *
 * Adheres to Light Luxury Design Standard:
 * - Warm cream/alabaster (#f7f5ef, #f6f4ee), soft eucalyptus (#eef3ec),
 *   ice blue (#edf4f9), soft amber/champagne (#fef6e9).
 * - Crisp slate typography (#0f172a, #1e293b, #334155).
 * - Full integration with useTradeStore, useCompanyFinanceStore, and
 *   materialQualityEngine.
 */

import React, { useState, useMemo } from "react";
import {
  Layers,
  Factory,
  Train,
  Truck,
  Ship,
  Plane,
  ShieldAlert,
  TrendingUp,
  DollarSign,
  Package,
  Activity,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Cpu,
  Wrench,
  Sliders,
  Info,
  Globe,
  Flame,
  Award,
  CircleDot,
  Building2,
  Coins,
  ArrowUpCircle,
} from "lucide-react";
import { useTradeStore } from "../../state/tradeStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useReputationStore } from "../../state/reputationStore";
import {
  DEFAULT_MATERIAL_QUALITIES,
  computeMaterialQualityComposite,
  evaluateManufacturingDefectRate,
  evaluateVehicleMaterialImpact,
  MaterialQualityVector,
  VehicleQualityImpact,
} from "../../sim/trade/materialQualityEngine";
import { NPC_SUPPLIERS } from "../../sim/trade/supplierRegistry";
import {
  BASELINE_MARKET_PRICES,
  getCompetitiveBids,
  calculateVolumeDiscountPct,
  calculateDurationDiscountPct,
  PAYMENT_TERM_MODIFIERS,
  createActiveSupplierContract,
} from "../../sim/trade/tradeContractEngine";
import {
  calculateFreightShipment,
  FREIGHT_MODES,
  INDUSTRIAL_REGIONS,
} from "../../sim/trade/logisticsRouteEngine";
import {
  calculateScrapRecovery,
  ManufacturingIntegrationParadigm,
} from "../../sim/trade/verticalIntegrationEngine";
import { AVAILABLE_B2B_OPPORTUNITIES, B2BOpportunity } from "../../sim/trade/b2bSalesEngine";
import {
  PrimaryResourceType,
  ProcessedMaterialType,
  ComponentCategory,
  SubassemblyType,
  SupplierContractType,
  PaymentTermsType,
  InventoryPolicyType,
  FreightTransportMode,
  SupplierProfile,
  ActiveSupplierContract,
  WarehouseInventoryRecord,
  B2BCustomerContract,
} from "../../sim/trade/tradeTypes";
import type { Stage } from "../StageSwitcher";

interface TradePageProps {
  onSelectStage?: (stage: Stage) => void;
  onBackToMenu?: () => void;
}

type TradeTab =
  | "commodities"
  | "suppliers"
  | "hierarchy"
  | "inventory"
  | "logistics"
  | "b2b"
  | "summary";

export const TradePage: React.FC<TradePageProps> = ({ onSelectStage, onBackToMenu }) => {
  const [activeTab, setActiveTab] = useState<TradeTab>("commodities");
  const [selectedMaterialKey, setSelectedMaterialKey] = useState<ProcessedMaterialType>("BASIC_CARBON_STEEL");
  const [spotPurchaseQty, setSpotPurchaseQty] = useState<number>(10);
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string>("ALL");
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Contract Negotiator Modal State
  const [contractSupplierId, setContractSupplierId] = useState<string>(NPC_SUPPLIERS[0].id);
  const [contractItem, setContractItem] = useState<ProcessedMaterialType | ComponentCategory>("BASIC_CARBON_STEEL");
  const [contractVolume, setContractVolume] = useState<number>(500);
  const [contractDuration, setContractDuration] = useState<SupplierContractType>("ANNUAL");
  const [contractPaymentTerm, setContractPaymentTerm] = useState<PaymentTermsType>("NET_30");

  // Zustand Store Selectors
  const tradeStore = useTradeStore();
  const financeStore = useCompanyFinanceStore();
  const clockStore = useSimulationClockStore();
  const { overallReputation } = useReputationStore();

  const warehouseUI = useMemo(() => {
    return tradeStore.getWarehouseUI(clockStore.year, overallReputation, financeStore.cash);
  }, [tradeStore, clockStore.year, overallReputation, financeStore.cash]);

  const handleUpgradeWarehouse = () => {
    const res = tradeStore.initiateWarehouseUpgrade(clockStore.month, clockStore.year);
    if (res.success) {
      showNotification(res.message, "success");
    } else {
      showNotification(res.message, "error");
    }
  };

  const showNotification = (text: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  // Selected Material Quality Data
  const currentQualityVector: MaterialQualityVector =
    DEFAULT_MATERIAL_QUALITIES[selectedMaterialKey] ??
    DEFAULT_MATERIAL_QUALITIES.BASIC_CARBON_STEEL;

  const currentCompositeScore = useMemo(
    () => computeMaterialQualityComposite(currentQualityVector),
    [currentQualityVector]
  );

  const defectMetrics = useMemo(
    () => evaluateManufacturingDefectRate(currentQualityVector),
    [currentQualityVector]
  );

  const vehicleImpact: VehicleQualityImpact = useMemo(
    () =>
      evaluateVehicleMaterialImpact([
        {
          materialType: selectedMaterialKey,
          massKg: 500,
          quality: currentQualityVector,
        },
      ]),
    [selectedMaterialKey, currentQualityVector]
  );

  // Contract Negotiator Price Calculations
  const selectedSupplier: SupplierProfile =
    NPC_SUPPLIERS.find((s) => s.id === contractSupplierId) ?? NPC_SUPPLIERS[0];
  const basePrice = BASELINE_MARKET_PRICES[contractItem] ?? 50000;
  const volumeDiscount = calculateVolumeDiscountPct(contractVolume);
  const durationYears =
    contractDuration === "SPOT" ? 0 : contractDuration === "ANNUAL" ? 1 : contractDuration === "MULTI_YEAR" ? 3 : 5;
  const durationDiscount = calculateDurationDiscountPct(durationYears);
  const paymentTermModifier = PAYMENT_TERM_MODIFIERS[contractPaymentTerm].costModifierPct;

  const netUnitDiscountPct = Math.min(25, volumeDiscount + durationDiscount);
  const adjustedUnitPrice = Math.round(
    basePrice * (1 - netUnitDiscountPct / 100) * (1 + paymentTermModifier / 100)
  );
  const totalMonthlyContractCost = adjustedUnitPrice * contractVolume;

  const handleSignContract = () => {
    const bids = getCompetitiveBids(contractItem, contractVolume, contractDuration, overallReputation);
    const chosenBid = bids.find((b) => b.supplier.id === selectedSupplier.id) ?? bids[0];

    const newContract = createActiveSupplierContract(
      chosenBid,
      contractItem,
      contractVolume,
      contractDuration,
      clockStore.month,
      clockStore.year
    );

    tradeStore.signSupplierContract(newContract);
    showNotification(
      `Successfully signed ${contractDuration} supply contract with ${selectedSupplier.name} (${contractVolume} units/mo at ₹${adjustedUnitPrice.toLocaleString()}/unit).`,
      "success"
    );
  };

  const handleSpotBuy = () => {
    const price = BASELINE_MARKET_PRICES[selectedMaterialKey] ?? 50000;
    const totalCost = spotPurchaseQty * price;

    if (financeStore.cash < totalCost) {
      showNotification(`Insufficient liquid cash. Required: ${formatINR(totalCost)}, Available: ${formatINR(financeStore.cash)}`, "error");
      return;
    }

    const success = tradeStore.placeSpotPurchase(
      selectedMaterialKey,
      spotPurchaseQty,
      selectedSupplier.id,
      price
    );

    if (success) {
      showNotification(
        `Spot purchase confirmed: ${spotPurchaseQty} units of ${selectedMaterialKey.replace(/_/g, " ")} delivered immediately. Debited ${formatINR(totalCost)}.`,
        "success"
      );
    }
  };

  return (
    <div className="w-full min-h-screen text-slate-900 bg-gradient-to-br from-[#f7f5ef] via-[#f3efe5] to-[#eae5d8] p-3 sm:p-5 lg:p-6 font-sans select-none relative">
      {/* Subtle ambient lighting contained to prevent pseudo-overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION HEADER
      ───────────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full py-3 px-4 sm:px-6 mb-5 rounded-2xl bg-[#faf8f2]/95 border border-[#dcd6c7] backdrop-blur-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Back Button */}
        <button
          onClick={() => {
            if (onBackToMenu) onBackToMenu();
            else if (onSelectStage) onSelectStage("operations");
          }}
          className="group flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/90 hover:bg-white border border-[#d2ccc0] hover:border-amber-400/80 text-slate-800 transition-all shadow-xs active:scale-95"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-amber-600" />
          <span className="text-xs font-black tracking-wider uppercase font-mono">
            Back to Operations
          </span>
        </button>

        {/* Title & Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 flex items-center justify-center shadow-md border border-slate-700">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-sm sm:text-base font-black tracking-wider text-slate-950 font-mono uppercase leading-tight flex items-center gap-2">
              <span>RAW MATERIALS, TRADE & SUPPLY CHAIN HUB</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                PHYSICAL FLOW ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Ores • Mills • Stamping Stocks • Tier-1 Suppliers • Logistics • Competitor OEM Contracts
            </div>
          </div>
        </div>

        {/* Quick Treasury Strip */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-[#ede9dd] border border-[#d7d1c1] text-slate-700 flex items-center gap-2">
            <Coins size={14} className="text-amber-600" />
            <span className="text-slate-500">Liquid Cash:</span>
            <span className="font-extrabold text-slate-900">{formatINR(financeStore.cash)}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#ede9dd] border border-[#d7d1c1] text-slate-700 flex items-center gap-2">
            <Package size={14} className="text-sky-600" />
            <span className="text-slate-500">Inventory Assets:</span>
            <span className="font-extrabold text-slate-900">
              {formatINR(tradeStore.lastMonthlySummary?.inventoryAssetValueINR ?? 12500000)}
            </span>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`relative z-20 mb-4 p-3 rounded-xl border flex items-center gap-3 text-xs font-semibold shadow-md animate-fade-in ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : notification.type === "error"
              ? "bg-rose-50 border-rose-300 text-rose-900"
              : "bg-sky-50 border-sky-300 text-sky-900"
          }`}
        >
          <Info size={16} />
          <span>{notification.text}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. LUXURY TAB NAVIGATION BAR
      ───────────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "commodities", label: "Commodities & Quality Lab", icon: <Scale size={15} /> },
          { id: "suppliers", label: "Suppliers & Contracts", icon: <Building2 size={15} /> },
          { id: "hierarchy", label: "Industrial Flow & Recycling", icon: <Factory size={15} /> },
          { id: "inventory", label: "Warehouse Stockpiles", icon: <Package size={15} /> },
          { id: "logistics", label: "Logistics & Rail Network", icon: <Train size={15} /> },
          { id: "b2b", label: "Competitor B2B Sales", icon: <Globe size={15} /> },
          { id: "summary", label: "Monthly Supply Audit", icon: <Activity size={15} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TradeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 shadow-xs ${
                isActive
                  ? "bg-gradient-to-r from-slate-900 to-slate-800 text-amber-400 border border-slate-700 shadow-md"
                  : "bg-[#fcfbf7] hover:bg-[#ffffff] text-slate-600 hover:text-slate-900 border border-[#ddd6c7]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          3. TAB CONTENT VIEWS
      ───────────────────────────────────────────────────────────── */}

      {/* TAB 1: COMMODITIES & MATERIAL QUALITY LAB */}
      {activeTab === "commodities" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Live Commodity Quotes (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-[#fdfcfa] border border-[#ddd6c7] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Coins size={15} className="text-amber-600" />
                  <span>Global Commodity Spot Market</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500 bg-[#eee9dc] px-2 py-0.5 rounded-md">
                  Spot Settlement: Immediate
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Select a raw ore, refined metal, or formed stock to inspect its engineering quality vector and execute spot purchases.
              </p>

              {/* Commodity List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {(Object.entries(BASELINE_MARKET_PRICES) as [ProcessedMaterialType, number][]).map(([key, price]) => {
                  const isSelected = selectedMaterialKey === key;
                  const quality = DEFAULT_MATERIAL_QUALITIES[key];
                  const composite = quality ? computeMaterialQualityComposite(quality) : 70;

                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedMaterialKey(key)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#f5efe2] border-amber-500/80 shadow-sm"
                          : "bg-white hover:bg-[#faf8f2] border-[#e2dcd0]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSelected ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {key.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900 font-mono">
                            {key.replace(/_/g, " ")}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Grade Score: <span className="font-bold text-slate-700">{composite}/100</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900 font-mono">
                          {formatINR(price)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-mono flex items-center justify-end gap-1">
                          <TrendingUp size={11} /> +1.2%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Spot Purchase Widget */}
            <div className="p-5 rounded-2xl bg-[#edf3ec] border border-[#c5d8c3] shadow-sm">
              <h4 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
                <DollarSign size={15} className="text-emerald-700" />
                <span>Execute Spot Replenishment</span>
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Emergency purchase of <strong className="text-slate-900">{selectedMaterialKey.replace(/_/g, " ")}</strong> at prevailing spot price. Instant warehouse delivery.
              </p>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono text-slate-600">Quantity:</span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={spotPurchaseQty}
                  onChange={(e) => setSpotPurchaseQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-3 py-1.5 rounded-lg bg-white border border-[#c5d8c3] text-xs font-mono font-bold text-slate-900 text-center"
                />
                <span className="text-xs font-mono text-slate-600">units/tonnes</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono mb-4 pt-2 border-t border-[#c5d8c3]">
                <span className="text-slate-600">Total Purchase Cost:</span>
                <span className="text-sm font-black text-slate-900">
                  {formatINR(spotPurchaseQty * (BASELINE_MARKET_PRICES[selectedMaterialKey] ?? 50000))}
                </span>
              </div>

              <button
                onClick={handleSpotBuy}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={15} />
                <span>CONFIRM SPOT PURCHASE</span>
              </button>
            </div>
          </div>

          {/* Right Column: 7-Axis Quality Radar & Physics Downstream Impact (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Quality Vector Breakdown */}
            <div className="p-5 rounded-2xl bg-[#fdfcfa] border border-[#ddd6c7] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                    <Scale size={16} className="text-amber-600" />
                    <span>Material Quality Profile: {selectedMaterialKey.replace(/_/g, " ")}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Engineering physical metrics governing tooling wear, scrap reject rates, and chassis dynamics.
                  </p>
                </div>
                <div className="px-3 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-mono font-black text-sm">
                  Composite: {currentCompositeScore}/100
                </div>
              </div>

              {/* 7-Axis Bar Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                {[
                  { label: "Yield Strength (MPa)", val: currentQualityVector.strength, color: "bg-blue-600" },
                  { label: "Lightness / Density Index", val: 100 - currentQualityVector.weightIndex, color: "bg-emerald-600" },
                  { label: "Microstructure Consistency", val: currentQualityVector.consistency, color: "bg-purple-600" },
                  { label: "Chemical Purity", val: currentQualityVector.purity, color: "bg-teal-600" },
                  { label: "Corrosion Resistance", val: currentQualityVector.corrosionResistance, color: "bg-cyan-600" },
                  { label: "Thermal Stability", val: currentQualityVector.heatResistance, color: "bg-amber-600" },
                  { label: "Stamping Manufacturability", val: currentQualityVector.manufacturability, color: "bg-rose-600" },
                ].map((axis) => (
                  <div key={axis.label} className="p-2.5 rounded-xl bg-[#f8f6f0] border border-[#e5dfd2]">
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-600">{axis.label}:</span>
                      <span className="font-bold text-slate-900">{axis.val}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${axis.color}`}
                        style={{ width: `${Math.min(100, Math.max(0, axis.val))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Downstream Engineering & Vehicle Impact */}
              <h4 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider mb-3 pt-3 border-t border-[#ede7d8] flex items-center gap-2">
                <Activity size={15} className="text-sky-700" />
                <span>Simulated Vehicle & Production Impact</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#edf4f9] border border-[#c7dceb]">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Scrap Reject Rate</div>
                  <div className="text-base font-black text-slate-900 font-mono mt-1">
                    {defectMetrics.rejectRatePct.toFixed(2)}%
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {defectMetrics.scrapRejectPPM.toLocaleString()} PPM
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#eef3ec] border border-[#c7dcc4]">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Curb Weight Delta</div>
                  <div className={`text-base font-black font-mono mt-1 ${vehicleImpact.curbWeightDeltaKg <= 0 ? "text-emerald-700" : "text-amber-700"}`}>
                    {vehicleImpact.curbWeightDeltaKg > 0 ? `+${vehicleImpact.curbWeightDeltaKg}` : vehicleImpact.curbWeightDeltaKg} kg
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">Relative to steel baseline</div>
                </div>

                <div className="p-3 rounded-xl bg-[#fef6e9] border border-[#fae2c0]">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Torsional Rigidity</div>
                  <div className="text-base font-black text-amber-900 font-mono mt-1">
                    {vehicleImpact.chassisTorsionalRigidityDelta > 0 ? `+${vehicleImpact.chassisTorsionalRigidityDelta.toFixed(1)}` : `${vehicleImpact.chassisTorsionalRigidityDelta.toFixed(1)}`} kNm/deg
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">Chassis stiffness response</div>
                </div>

                <div className="p-3 rounded-xl bg-[#fdf2f2] border border-[#f7cfcf]">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Warranty Claim Delta</div>
                  <div className={`text-base font-black font-mono mt-1 ${vehicleImpact.warrantyClaimRateChangePct <= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {vehicleImpact.warrantyClaimRateChangePct > 0 ? `+${vehicleImpact.warrantyClaimRateChangePct.toFixed(1)}%` : `${vehicleImpact.warrantyClaimRateChangePct.toFixed(1)}%`}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">3-Year field durability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIERS & CONTRACT NEGOTIATOR */}
      {activeTab === "suppliers" && (
        <div className="space-y-6">
          {/* Active Contracts Header */}
          <div className="p-5 rounded-2xl bg-[#fdfcfa] border border-[#ddd6c7] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <Award size={16} className="text-amber-600" />
                <span>Active Long-Term Supplier Contracts</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-600">
                {tradeStore.activeSupplierContracts.length} agreements active
              </span>
            </div>

            {tradeStore.activeSupplierContracts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-mono bg-[#f8f6f0] rounded-xl border border-dashed border-[#ddd6c7]">
                No active supplier contracts signed yet. Use the Contract Negotiator below to secure volume discounts.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-[#ede7d8]">
                      <th className="pb-2">Contract ID</th>
                      <th className="pb-2">Supplier</th>
                      <th className="pb-2">Material / Part</th>
                      <th className="pb-2">Monthly Commitment</th>
                      <th className="pb-2">Agreed Unit Price</th>
                      <th className="pb-2">Payment Terms</th>
                      <th className="pb-2">Months Left</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ebd9]">
                    {tradeStore.activeSupplierContracts.map((c) => (
                      <tr key={c.contractId} className="hover:bg-[#faf7ee]">
                        <td className="py-2.5 font-bold text-slate-700">{c.contractId}</td>
                        <td className="py-2.5 font-bold text-slate-900">{c.supplierName}</td>
                        <td className="py-2.5 text-slate-800">{c.itemName}</td>
                        <td className="py-2.5 font-bold">{c.monthlyCommittedVolume} units</td>
                        <td className="py-2.5 text-emerald-700 font-bold">{formatINR(c.agreedPricePerUnit)}</td>
                        <td className="py-2.5 text-slate-600">{c.paymentTerms}</td>
                        <td className="py-2.5 font-bold text-amber-700">{c.monthsRemaining} mo</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => {
                              tradeStore.cancelSupplierContract(c.contractId);
                              showNotification(`Contract ${c.contractId} terminated.`, "info");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold"
                          >
                            Terminate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Supplier Directory & Contract Negotiator Two-Column Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Supplier Catalog (6 Cols) */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-[#fdfcfa] border border-[#ddd6c7] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Building2 size={15} className="text-sky-700" />
                  <span>NPC Industrial Supplier Directory</span>
                </h3>
                {/* Filter */}
                <select
                  value={selectedSupplierFilter}
                  onChange={(e) => setSelectedSupplierFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-[#f4f0e6] border border-[#dad4c5] text-xs font-mono text-slate-800"
                >
                  <option value="ALL">All Regions</option>
                  {Object.keys(INDUSTRIAL_REGIONS).map((r) => (
                    <option key={r} value={r}>
                      {r.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {NPC_SUPPLIERS.filter(
                  (s) => selectedSupplierFilter === "ALL" || s.regionCluster === selectedSupplierFilter
                ).map((sup) => {
                  const isSelected = sup.id === contractSupplierId;
                  return (
                    <div
                      key={sup.id}
                      onClick={() => {
                        setContractSupplierId(sup.id);
                        if (sup.specializations[0]) setContractItem(sup.specializations[0]);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#f5efe2] border-amber-500/80 shadow-sm"
                          : "bg-white hover:bg-[#faf8f2] border-[#e2dcd0]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="font-mono font-black text-xs text-slate-900 flex items-center gap-2">
                          <span>{sup.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {sup.country}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                          Tech: {sup.technologyRating}/100
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 mb-2">{sup.description}</p>

                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-500 pt-2 border-t border-[#eee8d9]">
                        <div>
                          <span>Reliability: </span>
                          <strong className="text-slate-800">{sup.reliabilityRating}%</strong>
                        </div>
                        <div>
                          <span>Credit Rating: </span>
                          <strong className="text-slate-800">{sup.financialHealth}</strong>
                        </div>
                        <div>
                          <span>Capacity: </span>
                          <strong className="text-slate-800">{(sup.maximumMonthlyCapacity / 1000).toFixed(0)}k/mo</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Contract Negotiator Terminal (6 Cols) */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-[#fdfcfa] border border-[#ddd6c7] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
                  <Coins size={15} className="text-amber-600" />
                  <span>Contract Negotiation Desk</span>
                </h3>
                <p className="text-xs text-slate-600 mb-4">
                  Configure volume commitments and payment terms with <strong className="text-slate-900">{selectedSupplier.name}</strong> to lock in long-term discounts.
                </p>

                {/* Material Selection */}
                <div className="mb-4">
                  <label className="text-[11px] font-mono font-bold text-slate-700 block mb-1">
                    Commodity / Component:
                  </label>
                  <select
                    value={contractItem}
                    onChange={(e) => setContractItem(e.target.value as ProcessedMaterialType | ComponentCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#d8d2c4] text-xs font-mono font-bold text-slate-900"
                  >
                    {selectedSupplier.specializations.map((m) => (
                      <option key={m} value={m}>
                        {m.replace(/_/g, " ")} (Baseline: {formatINR(BASELINE_MARKET_PRICES[m] ?? 50000)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Volume Selector */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] font-mono font-bold text-slate-700 mb-1">
                    <span>Monthly Volume Commitment:</span>
                    <span className="text-amber-700">Volume Discount: -{volumeDiscount}%</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[100, 500, 2000, 5000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setContractVolume(v)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                          contractVolume === v
                            ? "bg-slate-900 text-amber-400 border-slate-900"
                            : "bg-white hover:bg-slate-50 text-slate-700 border-[#d8d2c4]"
                        }`}
                      >
                        {v} units
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Selector */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] font-mono font-bold text-slate-700 mb-1">
                    <span>Contract Duration:</span>
                    <span className="text-sky-700">Duration Discount: -{durationDiscount}%</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "SPOT", label: "Spot" },
                      { id: "ANNUAL", label: "1-Year" },
                      { id: "MULTI_YEAR", label: "3-Year" },
                      { id: "EXCLUSIVE", label: "Exclusive" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setContractDuration(d.id as SupplierContractType)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                          contractDuration === d.id
                            ? "bg-slate-900 text-amber-400 border-slate-900"
                            : "bg-white hover:bg-slate-50 text-slate-700 border-[#d8d2c4]"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Terms Selector */}
                <div className="mb-5">
                  <label className="text-[11px] font-mono font-bold text-slate-700 block mb-1">
                    Payment Terms & Credit:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { term: "CASH_UPFRONT", label: "Cash Upfront (-5% Disc)" },
                      { term: "NET_30", label: "Net 30 Days (Standard)" },
                      { term: "NET_90", label: "Net 90 Credit (+4% Fee)" },
                    ].map((t) => (
                      <button
                        key={t.term}
                        onClick={() => setContractPaymentTerm(t.term as PaymentTermsType)}
                        className={`p-2 rounded-xl text-[10px] font-mono font-bold border transition-all text-center ${
                          contractPaymentTerm === t.term
                            ? "bg-amber-100 text-amber-950 border-amber-400 shadow-xs"
                            : "bg-white hover:bg-slate-50 text-slate-700 border-[#d8d2c4]"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Financial Summary Box */}
                <div className="p-4 rounded-xl bg-[#ede9dd] border border-[#d7d0c0] space-y-1.5 font-mono text-xs mb-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Spot Price:</span>
                    <span>{formatINR(basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Volume + Duration Savings:</span>
                    <span>-{netUnitDiscountPct}%</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold pt-2 border-t border-[#d8d1bf]">
                    <span>Negotiated Unit Price:</span>
                    <span className="text-sm text-emerald-800">{formatINR(adjustedUnitPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold">
                    <span>Monthly Financial Commitment:</span>
                    <span className="text-sm text-slate-950">{formatINR(totalMonthlyContractCost)} / mo</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignContract}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-600 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Award size={16} />
                <span>SIGN FORMAL SUPPLY AGREEMENT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTINUOUS INDUSTRIAL HIERARCHY & RECYCLING */}
      {activeTab === "hierarchy" && (
        <div className="space-y-6">
          {/* Strategic Paradigm Selector */}
          <div className="p-5 rounded-2xl bg-[#fdfcfa] border border-[#ddd6c7] shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
              <Sliders size={16} className="text-sky-700" />
              <span>Corporate Manufacturing Strategy Paradigm</span>
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Select how deeply your enterprise vertically integrates raw material extraction, smelting, component manufacturing, and final vehicle assembly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: "VERTICAL_INTEGRATION",
                  title: "1. Full Vertical Integration",
                  sub: "Ford Rouge / Tesla Gigafactory Model",
                  desc: "Own your steel mills, foundry presses, and battery plants. Maximum supply security, custom alloy formulation, lowest unit marginal cost, but massive capital expenditure.",
                  margin: "+18.5% Margin",
                  capex: "High Capital Req.",
                },
                {
                  id: "HYBRID",
                  title: "2. Hybrid Architecture",
                  sub: "Porsche / Ferrari Agile Model",
                  desc: "Manufacture high-value proprietary powertrains and chassis in-house; procure standardized components (tires, electronics, glass) from elite Tier-1 suppliers.",
                  margin: "Balanced Margins",
                  capex: "Moderate Capex",
                },
                {
                  id: "SUPPLIER_BASED",
                  title: "3. Supplier-Based Assembly",
                  sub: "Lean Contract Manufacturing",
                  desc: "Procure 100% of discrete components from external specialists. Rapid flexibility and minimal initial investment, but vulnerable to supplier price increases and stockouts.",
                  margin: "-8.0% Margin Buffer",
                  capex: "Lowest Capex",
                },
              ].map((p) => {
                const isSelected = tradeStore.manufacturingParadigm === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => tradeStore.setManufacturingParadigm(p.id as ManufacturingIntegrationParadigm)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#f5efe2] border-amber-600 shadow-md ring-2 ring-amber-400/40"
                        : "bg-white hover:bg-[#faf8f2] border-[#e2dcd0]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-black text-xs text-slate-900">{p.title}</span>
                        {isSelected && <CheckCircle2 size={16} className="text-amber-600" />}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mb-2">{p.sub}</div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{p.desc}</p>
                    </div>

                    <div className="flex justify-between text-[11px] font-mono pt-3 border-t border-[#eee8d9]">
                      <span className="text-emerald-700 font-bold">{p.margin}</span>
                      <span className="text-slate-500">{p.capex}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6-Level Visual Economic Hierarchy Flow */}
          <div className="p-5 rounded-2xl bg-[#fdfcfa] border border-[#ddd6c7] shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
              <Factory size={16} className="text-emerald-700" />
              <span>6-Level Continuous Manufacturing Pipeline</span>
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              Live physical material transformation across all stages of production. Materials physically flow downstream into finished vehicles.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative">
              {[
                {
                  lvl: "Level 1",
                  title: "Extraction",
                  icon: <Flame size={16} className="text-amber-700" />,
                  items: ["Iron Ore", "Bauxite", "Crude Oil", "Silica Sand", "Copper Ore"],
                  bg: "bg-[#fbf4e5] border-[#f0dba7]",
                },
                {
                  lvl: "Level 2",
                  title: "Refining",
                  icon: <Factory size={16} className="text-orange-700" />,
                  items: ["Blast Furnace", "Bayer Smelter", "Cracking Plant", "Glass Furnace"],
                  bg: "bg-[#faeee5] border-[#efcfbd]",
                },
                {
                  lvl: "Level 3",
                  title: "Formed Stocks",
                  icon: <Layers size={16} className="text-blue-700" />,
                  items: ["Sheet Steel", "Al Extrusions", "Cast Iron", "Plastics & Resin"],
                  bg: "bg-[#eaf1f8] border-[#c4d7ec]",
                },
                {
                  lvl: "Level 4",
                  title: "Components",
                  icon: <Wrench size={16} className="text-teal-700" />,
                  items: ["Brake Discs", "Control Arms", "Body Panels", "Pistons & Gears"],
                  bg: "bg-[#e7f4f0] border-[#c0e4d7]",
                },
                {
                  lvl: "Level 5",
                  title: "Subassemblies",
                  icon: <Cpu size={16} className="text-indigo-700" />,
                  items: ["Front Suspension", "Engine Block", "Transaxle Unit", "Cockpit Module"],
                  bg: "bg-[#edeef9] border-[#cbd0f1]",
                },
                {
                  lvl: "Level 6",
                  title: "Final Vehicle",
                  icon: <Award size={16} className="text-emerald-700" />,
                  items: ["Chassis Marriage", "Paint Shop", "End-of-Line QA", "Dyno Validation"],
                  bg: "bg-[#eef5eb] border-[#cce4c4]",
                },
              ].map((step, idx) => (
                <div key={step.lvl} className={`p-3.5 rounded-xl border flex flex-col justify-between ${step.bg}`}>
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 mb-1">
                      <span>{step.lvl}</span>
                      {step.icon}
                    </div>
                    <div className="text-xs font-black text-slate-900 font-mono mb-2 uppercase">
                      {step.title}
                    </div>
                    <ul className="space-y-1 text-[11px] font-mono text-slate-700">
                      {step.items.map((it) => (
                        <li key={it} className="flex items-center gap-1.5">
                          <CircleDot size={9} className="text-slate-400" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {idx < 5 && (
                    <div className="mt-3 pt-2 border-t border-slate-300/50 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                      <span>Transforms →</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Electric Arc Furnace Scrap Recycling Subsystem */}
          <div className="p-5 rounded-2xl bg-[#edf3ec] border border-[#c5d8c3] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider">
                    Electric Arc Furnace Scrap Recovery Subsystem
                  </h3>
                  <p className="text-xs text-slate-600">
                    Captures stamping skeleton offcuts and converts them into high-purity recycled steel alloy ingots.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  tradeStore.toggleRecyclingFacility(!tradeStore.hasRecyclingFacility);
                  showNotification(
                    `Electric Arc Scrap Facility ${!tradeStore.hasRecyclingFacility ? "Activated" : "Deactivated"}`,
                    "info"
                  );
                }}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  tradeStore.hasRecyclingFacility
                    ? "bg-emerald-800 text-white shadow-md"
                    : "bg-white text-slate-700 border border-[#c5d8c3]"
                }`}
              >
                {tradeStore.hasRecyclingFacility ? "FACILITY ACTIVE (85% RECOVERY)" : "ACTIVATE FACILITY"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#c5d8c3] text-xs font-mono">
              <div>
                <span className="text-slate-500">Stamping Scrap Rate:</span>
                <div className="text-sm font-black text-slate-900">15.0% of Body Sheet Input</div>
              </div>
              <div>
                <span className="text-slate-500">Last Month Steel Recovered:</span>
                <div className="text-sm font-black text-emerald-800">
                  {tradeStore.lastMonthlySummary?.totalScrapRecycledTonnes ?? 0} Tonnes
                </div>
              </div>
              <div>
                <span className="text-slate-500">Material Cost Savings:</span>
                <div className="text-sm font-black text-emerald-800">
                  {formatINR(tradeStore.lastMonthlySummary?.recyclingCostSavingsINR ?? 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WAREHOUSE & STOCKPILES */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {/* HQ Central Warehouse & Leveling Card */}
          <div className="p-6 rounded-2xl bg-[#fdfcfa] border border-[#ddd6c7] shadow-sm space-y-5">
            {/* Header with Level & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ede7d8]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#fef6e9] border border-[#fbd38d] text-amber-900 flex items-center justify-center text-2xl shadow-sm">
                  {warehouseUI.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase font-mono tracking-wider">
                      HQ Central Warehouse & Logistics Facility
                    </h3>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold bg-[#fef6e9] text-amber-900 border border-[#fbd38d]">
                      Level {warehouseUI.level} • {warehouseUI.levelName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {warehouseUI.levelDescription}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
                    warehouseUI.utilizationPct > 85
                      ? "bg-rose-50 text-rose-800 border-rose-200"
                      : warehouseUI.utilizationPct > 60
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}
                >
                  {warehouseUI.utilizationPct}% Stored Capacity
                </span>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="p-3.5 rounded-xl bg-[#faf8f2] border border-[#e5dfd2]">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Storage Capacity</div>
                <div className="text-sm font-black text-slate-900 font-mono mt-1">
                  {warehouseUI.usedTonnes.toFixed(1)} / {warehouseUI.capacityTonnes.toLocaleString()} t
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      warehouseUI.utilizationPct > 85 ? "bg-rose-600" : warehouseUI.utilizationPct > 60 ? "bg-amber-600" : "bg-emerald-600"
                    }`}
                    style={{ width: `${Math.min(100, warehouseUI.utilizationPct)}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf8f2] border border-[#e5dfd2]">
                <div className="text-[10px] font-mono text-slate-500 uppercase">SKU Slot Allocation</div>
                <div className="text-sm font-black text-slate-900 font-mono mt-1">
                  {warehouseUI.skusUsed} / {warehouseUI.skuSlots} Active SKUs
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">Material taxonomy bays</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf8f2] border border-[#e5dfd2]">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Monthly Operating OpEx</div>
                <div className="text-sm font-black text-slate-900 font-mono mt-1">
                  {formatINR(warehouseUI.monthlyOperatingCost)}/mo
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">Staff, power & security</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf8f2] border border-[#e5dfd2]">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Holding Cost Rate</div>
                <div className={`text-sm font-black font-mono mt-1 ${warehouseUI.holdingCostModifier <= 1 ? "text-emerald-700" : "text-amber-800"}`}>
                  {(warehouseUI.holdingCostModifier * 100).toFixed(0)}% Baseline
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  {warehouseUI.holdingCostModifier <= 1
                    ? `-${Math.round((1 - warehouseUI.holdingCostModifier) * 100)}% holding discount`
                    : `+${Math.round((warehouseUI.holdingCostModifier - 1) * 100)}% outdoor penalty`}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf8f2] border border-[#e5dfd2]">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Annual Spoilage Risk</div>
                <div className={`text-sm font-black font-mono mt-1 ${warehouseUI.spoilageRiskPct <= 1.0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {warehouseUI.spoilageRiskPct.toFixed(1)}% / yr
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">Rubber, resin & batteries</div>
              </div>
            </div>

            {/* Warehouse Capacity Warning if High */}
            {warehouseUI.utilizationPct >= 85 && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800 font-mono">
                <AlertTriangle size={18} className="text-rose-600 shrink-0" />
                <span>
                  <strong>CRITICAL CAPACITY ALERT:</strong> Facility is at {warehouseUI.utilizationPct}% capacity ({warehouseUI.usedTonnes.toFixed(1)} / {warehouseUI.capacityTonnes.toLocaleString()} tonnes). Incoming contract deliveries may be refused or incur emergency storage surcharges!
                </span>
              </div>
            )}

            {/* Active Infrastructure Features */}
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-2">
                Active Logistics Infrastructure Capabilities
              </div>
              <div className="flex flex-wrap gap-2">
                {warehouseUI.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f4f0e6] text-slate-800 text-[11px] font-mono border border-[#e2dcd0]"
                  >
                    <CheckCircle2 size={12} className="text-emerald-700" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Upgrade & Construction Section */}
            <div className="pt-4 border-t border-[#ede7d8]">
              {warehouseUI.isUpgrading ? (
                <div className="p-4 rounded-xl bg-[#fef6e9] border border-[#fae2c0] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center animate-pulse">
                      <RefreshCw size={20} className="animate-spin" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-amber-900 uppercase font-mono tracking-wider">
                        Facility Expansion Under Construction
                      </div>
                      <div className="text-xs text-slate-700 font-mono mt-0.5">
                        Upgrading to <strong>Level {warehouseUI.level + 1}: {warehouseUI.upgradeTargetName}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
                      {warehouseUI.upgradeMonthsRemaining} Months Remaining
                    </span>
                  </div>
                </div>
              ) : warehouseUI.level < 5 ? (
                <div className="p-4 rounded-xl bg-[#f5f8f5] border border-[#cbe1ca] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ArrowUpCircle size={16} className="text-emerald-700" />
                      <span className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider">
                        Next Upgrade: Level {warehouseUI.level + 1} — {warehouseUI.nextLevelName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-xl">
                      Expand floor capacity, unlock climate-controlled bays, and lower holding carrying costs with modern logistics handling.
                    </p>
                    {warehouseUI.blockedReasons.length > 0 && !warehouseUI.canUpgrade && (
                      <div className="mt-2 space-y-1">
                        {warehouseUI.blockedReasons.map((reason, idx) => (
                          <div key={idx} className="text-[11px] font-mono text-rose-700 flex items-center gap-1.5">
                            <AlertTriangle size={12} className="text-rose-500 shrink-0" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={handleUpgradeWarehouse}
                      disabled={!warehouseUI.canUpgrade}
                      className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm ${
                        warehouseUI.canUpgrade
                          ? "bg-emerald-800 text-white hover:bg-emerald-700 shadow-md"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300"
                      }`}
                    >
                      {warehouseUI.canUpgrade
                        ? `Commission Upgrade (${formatINR(warehouseUI.nextLevelCost)})`
                        : "Upgrade Requirements Unmet"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#edf3ec] border border-[#c5d8c3] text-center text-xs font-mono text-emerald-900 font-bold">
                  ✨ MAXIMUM LOGISTICS INFRASTRUCTURE LEVEL ACHIEVED: Smart Mega-Warehouse fully operational with AI & AGVs.
                </div>
              )}
            </div>
          </div>

          {/* Inventory Policy Selection Card */}
          <div className="p-5 rounded-2xl bg-[#fdfcfa] border border-[#ddd6c7] shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
              <Sliders size={16} className="text-amber-600" />
              <span>Corporate Inventory Management Policy</span>
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Balance warehouse holding costs against assembly line stockout risk.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: "JUST_IN_TIME",
                  title: "Just-In-Time (JIT) Lean",
                  target: "2-5 Days Buffer",
                  desc: "Minimal warehouse storage. Lowest holding costs (₹12k/mo), but vulnerable to supplier rail strikes and logistics delays.",
                  cost: "Holding Cost: ~0.5%/mo",
                },
                {
                  id: "SAFETY_STOCK",
                  title: "Balanced Safety Stock",
                  target: "30-45 Days Buffer",
                  desc: "Standard automotive industry buffer. Absorbs standard shipment volatility with balanced holding insurance costs.",
                  cost: "Holding Cost: ~1.2%/mo",
                },
                {
                  id: "STRATEGIC_RESERVE",
                  title: "Strategic Commodity Reserve",
                  target: "90-180 Days Buffer",
                  desc: "Massive raw material stockpiles. Insulates your factories from global commodity price spikes, but incurs high warehouse insurance.",
                  cost: "Holding Cost: ~2.5%/mo",
                },
              ].map((pol) => {
                const isSelected = tradeStore.inventoryPolicy === pol.id;
                return (
                  <div
                    key={pol.id}
                    onClick={() => tradeStore.setInventoryPolicy(pol.id as InventoryPolicyType)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#f5efe2] border-amber-600 shadow-md ring-2 ring-amber-400/40"
                        : "bg-white hover:bg-[#faf8f2] border-[#e2dcd0]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-black text-xs text-slate-900">{pol.title}</span>
                        {isSelected && <CheckCircle2 size={16} className="text-amber-600" />}
                      </div>
                      <div className="text-[10px] font-mono font-bold text-amber-700 mb-2">{pol.target}</div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{pol.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-[#eee8d9] text-[10px] font-mono text-slate-500">
                      {pol.cost}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warehouse Stockpile Table */}
          <div className="p-5 rounded-2xl bg-[#fdfcfa] border border-[#ddd6c7] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <Package size={16} className="text-sky-700" />
                <span>Main Factory Warehouse Inventory Table</span>
              </h3>
              <div className="text-xs font-mono">
                <span className="text-slate-500">Total Stock Value: </span>
                <strong className="text-slate-900">
                  {formatINR(tradeStore.lastMonthlySummary?.inventoryAssetValueINR ?? 14200000)}
                </strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-[#ede7d8]">
                    <th className="pb-2">Material / Part Type</th>
                    <th className="pb-2">Category Level</th>
                    <th className="pb-2">Stock On-Hand</th>
                    <th className="pb-2">Max Capacity</th>
                    <th className="pb-2">Capacity Utilization</th>
                    <th className="pb-2">Monthly Carrying Cost</th>
                    <th className="pb-2 text-right">Quick Spot Buy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ebd9]">
                  {tradeStore.warehouseInventory.map((item) => {
                    const pct = Math.round((item.unitsOnHand / item.storageMaxCapacity) * 100);
                    const monthlyHoldingCost = item.unitsOnHand * item.averageUnitCost * item.holdingCostMonthlyRate;
                    return (
                      <tr key={item.id} className="hover:bg-[#faf7ee]">
                        <td className="py-2.5 font-bold text-slate-900">{item.name}</td>
                        <td className="py-2.5 text-slate-600">{item.level}</td>
                        <td className="py-2.5 font-extrabold text-slate-800">
                          {item.unitsOnHand.toFixed(1)} {item.unitOfMeasure}
                        </td>
                        <td className="py-2.5 text-slate-500">
                          {item.storageMaxCapacity} {item.unitOfMeasure}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  pct > 80 ? "bg-amber-600" : pct > 20 ? "bg-emerald-600" : "bg-rose-600"
                                }`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-600">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-600">
                          {formatINR(monthlyHoldingCost)}/mo
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => {
                              if (item.itemType in BASELINE_MARKET_PRICES) {
                                setSelectedMaterialKey(item.itemType as ProcessedMaterialType);
                                setActiveTab("commodities");
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-bold"
                          >
                            Order Spot
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LOGISTICS & RAIL NETWORK */}
      {activeTab === "logistics" && (
        <div className="space-y-6">
          {/* Rail Spur Infrastructure Card */}
          <div className="p-5 rounded-2xl bg-[#edf3ec] border border-[#c5d8c3] shadow-sm flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-md">
                <Train size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 uppercase font-mono tracking-wider">
                    Factory Industrial Rail Spur
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      tradeStore.hasFactoryRailSpur
                        ? "bg-emerald-200 text-emerald-900 border border-emerald-400"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tradeStore.hasFactoryRailSpur ? "ACTIVE SPUR CONNECTED" : "OFFLINE"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  Direct connection from the regional heavy rail corridor to your plant's raw material unloader. Slashes inbound bulk freight costs by <strong className="text-emerald-900">65%</strong> compared to road trucking.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                tradeStore.toggleRailSpur(!tradeStore.hasFactoryRailSpur);
                showNotification(
                  `Factory Rail Spur ${!tradeStore.hasFactoryRailSpur ? "Activated (-65% Freight)" : "Deactivated"}`,
                  "info"
                );
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md transition-all ${
                tradeStore.hasFactoryRailSpur
                  ? "bg-emerald-800 text-white"
                  : "bg-slate-900 text-amber-400 hover:bg-slate-800"
              }`}
            >
              {tradeStore.hasFactoryRailSpur ? "CONNECTED (65% DISCOUNT ACTIVE)" : "INVEST & ACTIVATE RAIL SPUR"}
            </button>
          </div>

          {/* Freight Mode Comparison Matrix */}
          <div className="p-5 rounded-2xl bg-[#fdfcfa] border border-[#ddd6c7] shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider mb-4 flex items-center gap-2">
              <Truck size={16} className="text-amber-600" />
              <span>Multi-Modal Transport Comparison Matrix</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  id: "HEAVY_RAIL",
                  name: "Heavy Freight Rail",
                  icon: <Train size={20} className="text-emerald-700" />,
                  cost: "₹1.40 / km / tonne",
                  speed: "Medium (3 Days)",
                  cap: "Very High (>5,000 t)",
                  adv: "65% discount with active factory rail spur.",
                },
                {
                  id: "ROAD_TRUCK",
                  name: "Road Truck Convoy",
                  icon: <Truck size={20} className="text-amber-700" />,
                  cost: "₹4.00 / km / tonne",
                  speed: "Fast (1 Day)",
                  cap: "Medium (25 t / rig)",
                  adv: "Door-to-door flexibility; no dedicated rail spur needed.",
                },
                {
                  id: "MARITIME_RORO",
                  name: "Ocean Container / RoRo",
                  icon: <Ship size={20} className="text-sky-700" />,
                  cost: "₹0.60 / km / tonne",
                  speed: "Slow (14 Days)",
                  cap: "Massive (>20,000 t)",
                  adv: "Ideal for intercontinental bulk raw ore imports.",
                },
                {
                  id: "AIR_EXPEDITED",
                  name: "Air Cargo Expedited",
                  icon: <Plane size={20} className="text-purple-700" />,
                  cost: "₹32.00 / km / tonne",
                  speed: "Ultra-Fast (6 Hours)",
                  cap: "Very Low (<5 t)",
                  adv: "Emergency replacement for assembly line stockouts.",
                },
              ].map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-[#f8f6f0] border border-[#e5dfd2] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      {m.icon}
                      <span className="font-mono font-black text-xs text-slate-900">{m.name}</span>
                    </div>
                    <div className="space-y-1 text-[11px] font-mono text-slate-600 mb-3">
                      <div>Base Rate: <strong className="text-slate-800">{m.cost}</strong></div>
                      <div>Transit Time: <strong className="text-slate-800">{m.speed}</strong></div>
                      <div>Max Capacity: <strong className="text-slate-800">{m.cap}</strong></div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-2 border-t border-[#e2dcd0]">
                    {m.adv}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COMPETITOR B2B OEM SUPPLY */}
      {activeTab === "b2b" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#fdfcfa] border border-[#ddd6c7] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Globe size={16} className="text-sky-700" />
                  <span>Competitor OEM Component Supply Board</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Supply high-performance engines, gearboxes, and suspensions to rival automakers for significant monthly revenue.
                </p>
              </div>
              <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-3 py-1 rounded-lg font-bold border border-amber-300">
                STRATEGIC DILEMMA: Revenue vs Rival Competitiveness
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {AVAILABLE_B2B_OPPORTUNITIES.map((opp) => {
                const isActive = tradeStore.activeB2BContracts.some(
                  (c) => c.componentName === opp.componentName && c.npcBuyerName === opp.npcBuyerName
                );
                return (
                  <div
                    key={opp.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isActive
                        ? "bg-[#eef3ec] border-emerald-400 ring-2 ring-emerald-300/50"
                        : "bg-white border-[#e0dad0] hover:bg-[#faf8f2]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-black text-sm text-slate-900">{opp.npcBuyerName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {opp.vehicleSegment}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mb-2">{opp.componentName}</div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{opp.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 rounded-lg bg-[#f8f6f0] border border-[#e5dfd2] mb-4">
                        <div>
                          <span className="text-slate-500">Monthly Volume:</span>
                          <div className="font-bold text-slate-900">{opp.requestedMonthlyVolume} units/mo</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Unit Offer:</span>
                          <div className="font-bold text-emerald-700">{formatINR(opp.offeredPricePerUnitINR)}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Gross Monthly Revenue:</span>
                          <div className="font-bold text-slate-950">
                            {formatINR(opp.requestedMonthlyVolume * opp.offeredPricePerUnitINR)}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500">Competitor Boost:</span>
                          <div className="font-bold text-rose-700">+{opp.competitorTechBoost}% Market Edge</div>
                        </div>
                      </div>
                    </div>

                    {isActive ? (
                      <button
                        onClick={() => {
                          const active = tradeStore.activeB2BContracts.find(
                            (c) => c.componentName === opp.componentName && c.npcBuyerName === opp.npcBuyerName
                          );
                          if (active) tradeStore.cancelB2BContract(active.contractId);
                          showNotification(`Terminated B2B supply agreement with ${opp.npcBuyerName}.`, "info");
                        }}
                        className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-mono text-xs font-bold uppercase tracking-wider"
                      >
                        TERMINATE B2B SUPPLY CONTRACT
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const newB2B: B2BCustomerContract = {
                            contractId: `b2b_${opp.id}_${Date.now()}`,
                            npcBuyerName: opp.npcBuyerName,
                            buyerCountry: opp.buyerCountry,
                            vehicleSegment: opp.vehicleSegment,
                            componentType: opp.requestedComponent,
                            componentName: opp.componentName,
                            monthlyUnits: opp.requestedMonthlyVolume,
                            pricePerUnit: opp.offeredPricePerUnitINR,
                            monthlyRevenue: opp.requestedMonthlyVolume * opp.offeredPricePerUnitINR,
                            durationMonths: opp.durationMonths,
                            monthsRemaining: opp.durationMonths,
                            deliveredOnTimePct: 100,
                            competitorTechBoost: opp.competitorTechBoost,
                          };
                          tradeStore.signB2BContract(newB2B);
                          showNotification(
                            `Signed ${opp.durationMonths}-Month OEM supply agreement with ${opp.npcBuyerName}. Generating ${formatINR(
                              opp.requestedMonthlyVolume * opp.offeredPricePerUnitINR
                            )}/mo.`,
                            "success"
                          );
                        }}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95 transition-all"
                      >
                        ACCEPT OEM SUPPLY TENDER
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: MONTHLY SUPPLY AUDIT & DISRUPTION LOG */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#fdfcfa] border border-[#ddd6c7] shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
              <Activity size={16} className="text-emerald-700" />
              <span>Latest Monthly Supply Chain Financial Audit</span>
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              Double-entry breakdown of procurement debits, inbound multi-modal freight, warehouse holding costs, scrap recycling gains, and B2B competitor revenue.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[#fbf4e5] border border-[#f0dba7]">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Material Procurement</div>
                <div className="text-lg font-black text-slate-950 font-mono mt-1">
                  {formatINR(tradeStore.lastMonthlySummary?.totalProcurementCost ?? 0)}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">Direct supplier deliveries</div>
              </div>

              <div className="p-4 rounded-xl bg-[#f4ebf8] border border-[#dfcae7]">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Inbound Logistics Freight</div>
                <div className="text-lg font-black text-purple-950 font-mono mt-1">
                  {formatINR(tradeStore.lastMonthlySummary?.totalLogisticsFreightCost ?? 0)}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  {tradeStore.hasFactoryRailSpur ? "Heavy Rail (65% disc)" : "Road Truck Convoy"}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#eef3ec] border border-[#c7dcc4]">
                <div className="text-[10px] font-mono text-slate-500 uppercase">B2B Competitor Revenue</div>
                <div className="text-lg font-black text-emerald-800 font-mono mt-1">
                  +{formatINR(tradeStore.lastMonthlySummary?.totalB2BRevenue ?? 0)}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">OEM component supply</div>
              </div>

              <div className="p-4 rounded-xl bg-[#edf4f9] border border-[#c7dceb]">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Warehouse Inventory Asset</div>
                <div className="text-lg font-black text-sky-950 font-mono mt-1">
                  {formatINR(tradeStore.lastMonthlySummary?.inventoryAssetValueINR ?? 14200000)}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">Capitalized on Balance Sheet</div>
              </div>
            </div>

            {/* Disruption & Stockout Alerts */}
            <h4 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
              <ShieldAlert size={15} className="text-amber-600" />
              <span>Supply Disruption & Bottleneck Notifications</span>
            </h4>

            {tradeStore.lastMonthlySummary?.alerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-900 flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>All supplier routes nominal. Assembly plant operating at 100% material sufficiency.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {tradeStore.lastMonthlySummary?.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs font-mono ${
                      alert.severity === "CRITICAL"
                        ? "bg-rose-50 border-rose-300 text-rose-900"
                        : "bg-amber-50 border-amber-300 text-amber-900"
                    }`}
                  >
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <div className="font-black">{alert.title}</div>
                      <div className="text-[11px] mt-0.5">{alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
