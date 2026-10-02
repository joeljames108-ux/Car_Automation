import React, { useState } from "react";
import {
  Car, Layers, DollarSign, TrendingUp, PieChart,
  CheckCircle2, ArrowRight, ShieldCheck, Scale, Cpu, Zap
} from "lucide-react";
import { calculateVehicleCostBreakdown, VehicleCostParams } from "../../sim/economy/vehicleCostCalculator";
import { evaluateMakeOrBuyDecision, InHouseProductionSpec, SupplierBidQuote } from "../../sim/economy/supplyChainCostEngine";

export const CostPerVehicleTab: React.FC = () => {
  // Pre-configured vehicle model lines
  const vehicleModels: VehicleCostParams[] = [
    {
      vehicleId: "model_veloce_gt_1970",
      modelName: "Veloce 3000 GT Prototype (Handcrafted)",
      sellingPrice: 1250000,
      monthlyProductionVolume: 12,
      factoryAllocatedFixedMonthlyCost: 180000,
      steelCost: 66300,
      aluminumCost: 76800,
      carbonFiberCost: 27750,
      engineCost: 120000, // Handcrafted 3.0L V8
      transmissionCost: 65000, // 5-speed manual transaxle
      suspensionCost: 38000,
      brakesCost: 32000,
      electronicsCost: 28000,
      interiorCost: 55000,
      assemblyLaborCost: 58800, // 140 hrs @ ₹420/hr
      logisticsCost: 6500,
      warrantyReserveFactor: 0.02,
    },
    {
      vehicleId: "model_corsa_supercar_1970",
      modelName: "Stradale Corsa 4000 (Mid-Engine V8)",
      sellingPrice: 3200000,
      monthlyProductionVolume: 4,
      factoryAllocatedFixedMonthlyCost: 240000,
      steelCost: 45000,
      aluminumCost: 185000,
      carbonFiberCost: 85000,
      engineCost: 350000, // High-revving race-derived V8
      transmissionCost: 145000, // Dog-leg close-ratio gearbox
      suspensionCost: 95000,
      brakesCost: 88000,
      electronicsCost: 48000,
      interiorCost: 120000,
      assemblyLaborCost: 112000,
      logisticsCost: 12000,
      warrantyReserveFactor: 0.03,
    },
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const currentParams = vehicleModels[selectedIdx];
  const breakdown = calculateVehicleCostBreakdown(currentParams);

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

  const costItems = [
    { label: "Steel Sheet Metal & Rails", cost: breakdown.steel, category: "Raw Materials" },
    { label: "Aluminum Extrusions & Panels", cost: breakdown.aluminum, category: "Raw Materials" },
    { label: "Composite Elements & Trim", cost: breakdown.carbonFiber, category: "Raw Materials" },
    { label: "V8 Powertrain Assembly", cost: breakdown.engine, category: "Powertrain" },
    { label: "Manual Gearbox & Differential", cost: breakdown.transmission, category: "Powertrain" },
    { label: "Suspension Wishbones & Dampers", cost: breakdown.suspension, category: "Running Gear" },
    { label: "Brake Calipers & Rotors", cost: breakdown.brakes, category: "Running Gear" },
    { label: "Harnesses, Ignition & Instruments", cost: breakdown.electronics, category: "Electrical" },
    { label: "Hand-Stitched Cabin & Dash", cost: breakdown.interior, category: "Cabin" },
    { label: "Direct Factory Assembly Labor", cost: breakdown.assemblyLabor, category: "Direct Labor" },
    { label: "Allocated Plant Overhead", cost: breakdown.allocatedFactoryOverhead, category: "Fixed Allocation" },
    { label: "Outbound Freight Logistics", cost: breakdown.logistics, category: "Logistics" },
    { label: "Actuarial Warranty Reserve", cost: breakdown.warrantyReserve, category: "Quality Reserve" },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── 1. Top Executive Banner ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#f4f7f6] via-[#f7faf8] to-[#f0f5f2] border border-[#d2dfd8] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-900 uppercase block mb-1">
              SECTION 37: THE MOST VALUABLE SCREEN — PER-VEHICLE BOM BREAKDOWN
            </span>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {formatCurrency(breakdown.grossContribution)}
              <span className="text-xs text-emerald-700 font-normal font-sans ml-2">
                Contribution ({breakdown.grossMarginPct}% Margin)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Microscopic accounting of direct bill of materials (BOM), assembly takt labor, allocated plant fixed overhead, and realized profit margin per car.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {vehicleModels.map((m, idx) => (
              <button
                key={m.vehicleId}
                onClick={() => setSelectedIdx(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                  selectedIdx === idx
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-[#ffffff]/90 text-slate-700 border-[#ded8c8] hover:bg-[#ffffff]"
                }`}
              >
                {m.modelName.split(" ")[0]} {m.modelName.split(" ")[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Top Summary KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Selling Price */}
        <div className="p-4 rounded-2xl bg-[#ffffff]/90 border border-[#e2ddd0] shadow-xs">
          <span className="text-slate-500 text-[10px] font-mono font-bold uppercase block mb-1">
            RETAIL LIST PRICE
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatCurrency(breakdown.sellingPrice)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Customer invoice benchmark</div>
        </div>

        {/* Total Cost Per Car */}
        <div className="p-4 rounded-2xl bg-[#ffffff]/90 border border-[#e2ddd0] shadow-xs">
          <span className="text-slate-500 text-[10px] font-mono font-bold uppercase block mb-1">
            TOTAL UNIT PRODUCTION COST
          </span>
          <div className="text-2xl font-black text-amber-800 font-mono">
            {formatCurrency(breakdown.totalCostPerVehicle)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">BOM + Labor + Allocated Plant</div>
        </div>

        {/* Unit Contribution */}
        <div className="p-4 rounded-2xl bg-[#ffffff]/90 border border-[#e2ddd0] shadow-xs">
          <span className="text-slate-500 text-[10px] font-mono font-bold uppercase block mb-1">
            GROSS CONTRIBUTION PER CAR
          </span>
          <div className="text-2xl font-black text-emerald-800 font-mono">
            {formatCurrency(breakdown.grossContribution)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-bold font-mono">
            {breakdown.grossMarginPct}% Gross Margin
          </div>
        </div>

        {/* Breakeven Monthly Volume */}
        <div className="p-4 rounded-2xl bg-[#ffffff]/90 border border-[#e2ddd0] shadow-xs">
          <span className="text-slate-500 text-[10px] font-mono font-bold uppercase block mb-1">
            BREAKEVEN MONTHLY VOLUME
          </span>
          <div className="text-2xl font-black text-sky-800 font-mono">
            {breakdown.breakevenUnitsMonthly} units / mo
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Current output: {breakdown.monthlyProductionVolume} units
          </div>
        </div>
      </div>

      {/* ── 3. Exhaustive BOM Breakdown Table ── */}
      <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#eee8dc]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-slate-700" />
            <span className="text-xs font-black text-slate-900 font-mono uppercase tracking-wider">
              {breakdown.modelName.toUpperCase()} — ITEMIZED COST SCHEDULE
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {costItems.length} Subsystem Cost Lines
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#e2ddd0] text-slate-500 text-[10px]">
                <th className="py-2">SUBSYSTEM COMPONENT LINE</th>
                <th className="py-2">ACCOUNTING CATEGORY</th>
                <th className="py-2 text-right">COST PER VEHICLE</th>
                <th className="py-2 text-right">% OF TOTAL COST</th>
              </tr>
            </thead>
            <tbody>
              {costItems.map((item, idx) => {
                const pct = ((item.cost / breakdown.totalCostPerVehicle) * 100).toFixed(1);
                return (
                  <tr key={idx} className="border-b border-[#f2ede4] hover:bg-[#fbf9f4]">
                    <td className="py-2.5 font-sans font-bold text-slate-900">{item.label}</td>
                    <td className="py-2.5 text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-[#f4f0e6] text-[10px] text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      {formatCurrency(item.cost)}
                    </td>
                    <td className="py-2.5 text-right text-slate-600 font-bold">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 font-bold text-sm bg-[#faf8f4]">
                <td className="py-3 font-sans text-slate-900" colSpan={2}>
                  TOTAL AMORTIZED COST PER VEHICLE
                </td>
                <td className="py-3 text-right text-amber-900 font-mono">
                  {formatCurrency(breakdown.totalCostPerVehicle)}
                </td>
                <td className="py-3 text-right text-slate-900 font-mono">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── 3. Strategic Sourcing: Make vs Buy Decision Cards (Section 15 Spec) ── */}
      <div className="p-5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 font-serif text-sm flex items-center gap-2">
              <Scale size={16} className="text-purple-700" />
              Strategic Sourcing: In-House Manufacturing vs. Tier-1 Supplier Bids
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Evaluating CapEx tooling amortization vs supplier profit margin across key subsystems
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              spec: {
                componentName: "3.0L High-Compression V8 Powertrain",
                toolingAndCapExRequired: 4500000,
                toolingLifecycleUnits: 5000,
                fixedMonthlyPlantOverhead: 45000,
                directUnitMaterialsAndLabor: 42000,
                internalQualityDefectPpm: 250,
                engineeringScoreRequired: 80,
              },
              quote: {
                supplierId: "cosworth_powertrain",
                supplierName: "Cosworth Engineering Ltd",
                componentName: "3.0L High-Compression V8 Powertrain",
                unitPrice: 120000,
                minMonthlyVolume: 5,
                maxMonthlyVolume: 50,
                leadTimeWeeks: 6,
                defectTolerancePpm: 120,
                paymentTerms: "NET_30" as const,
                supplierReliabilityScore: 92,
                supplierReputationScore: 95,
              },
            },
            {
              spec: {
                componentName: "5-Speed Dog-Leg Transaxle",
                toolingAndCapExRequired: 3200000,
                toolingLifecycleUnits: 8000,
                fixedMonthlyPlantOverhead: 30000,
                directUnitMaterialsAndLabor: 28000,
                internalQualityDefectPpm: 320,
                engineeringScoreRequired: 75,
              },
              quote: {
                supplierId: "zf_transmissions",
                supplierName: "ZF Friedrichshafen AG",
                componentName: "5-Speed Dog-Leg Transaxle",
                unitPrice: 65000,
                minMonthlyVolume: 8,
                maxMonthlyVolume: 60,
                leadTimeWeeks: 4,
                defectTolerancePpm: 80,
                paymentTerms: "NET_60" as const,
                supplierReliabilityScore: 94,
                supplierReputationScore: 90,
              },
            },
            {
              spec: {
                componentName: "Carbon-Ceramic Calipers & Rotors",
                toolingAndCapExRequired: 6500000,
                toolingLifecycleUnits: 2500,
                fixedMonthlyPlantOverhead: 55000,
                directUnitMaterialsAndLabor: 58000,
                internalQualityDefectPpm: 150,
                engineeringScoreRequired: 90,
              },
              quote: {
                supplierId: "brembo_racing",
                supplierName: "Brembo S.p.A. Racing Division",
                componentName: "Carbon-Ceramic Calipers & Rotors",
                unitPrice: 88000,
                minMonthlyVolume: 4,
                maxMonthlyVolume: 30,
                leadTimeWeeks: 5,
                defectTolerancePpm: 60,
                paymentTerms: "NET_30" as const,
                supplierReliabilityScore: 98,
                supplierReputationScore: 98,
              },
            },
          ].map(({ spec, quote }) => {
            const evalResult = evaluateMakeOrBuyDecision(spec, [quote], currentParams.monthlyProductionVolume);
            const isMake = evalResult.recommendation === "MAKE_IN_HOUSE";
            return (
              <div key={spec.componentName} className="p-4 rounded-xl bg-[#faf7f2] border border-[#ece6da] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900 font-sans leading-tight">
                      {spec.componentName}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                      isMake
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-sky-100 text-sky-800 border-sky-300"
                    }`}>
                      {evalResult.recommendation.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] font-mono mb-3">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>In-House Unit Cost:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(evalResult.inHouseUnitCostAtVolume)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>{quote.supplierName}:</span>
                      <span className="font-bold text-slate-700">{formatCurrency(evalResult.bestSupplierQuote.unitPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Tooling CapEx Required:</span>
                      <span className="font-bold text-purple-800">{formatCurrency(spec.toolingAndCapExRequired)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Breakeven Run Rate:</span>
                      <span className="font-bold text-slate-900">{evalResult.breakevenMonthlyVolume} units/mo</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#ece6da] text-[10px] text-slate-500 font-serif italic leading-snug">
                  {evalResult.strategicRationale}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
