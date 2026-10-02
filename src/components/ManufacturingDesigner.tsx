import React, { useState, useMemo } from "react";
import { useDesign, fmtCurrency } from "../state/DesignContext";
import { useCompanyFinanceStore } from "../state/companyFinanceStore";
import { useWorkforceStore } from "../state/workforceStore";
import { useTradeStore } from "../state/tradeStore";
import { useCompany } from "../state/CompanyContext";
import { useActiveProductionStore } from "../state/activeProductionStore";
import {
  Factory,
  Wrench,
  Boxes,
  DollarSign,
  TrendingUp,
  Cpu,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Receipt,
  X,
} from "lucide-react";
import {
  ProductionRoutingMode,
  InHouseConstraintsResult,
  PlacedContractOrder,
  solveInHouseProductionConstraints,
  CONTRACT_MANUFACTURERS_CATALOG,
} from "../sim/manufacturing/manufacturingSystemEngine";
import { ManufacturingModeTabs } from "./manufacturing/ManufacturingModeTabs";
import { InHouseProductionPanel } from "./manufacturing/InHouseProductionPanel";
import { OutsourcedContractPanel } from "./manufacturing/OutsourcedContractPanel";
import { HybridProductionPanel } from "./manufacturing/HybridProductionPanel";
import { ManufacturingSummaryBar } from "./manufacturing/ManufacturingSummaryBar";

interface ManufacturingDesignerProps {
  onSelectStage?: (stage: any) => void;
}

export function ManufacturingDesigner({ onSelectStage }: ManufacturingDesignerProps = {}) {
  const { design, sim, updateManufacturing } = useDesign();
  const m = design.manufacturing;
  const cb = sim.costBreakdown;

  // Stores
  const { cash, recordTransaction } = useCompanyFinanceStore();
  const { departments, hireAggregatedStaff } = useWorkforceStore();
  const { warehouseInventory, placeSpotPurchase } = useTradeStore();
  const { company, addTwinEvent, saveToGarage } = useCompany();

  // Local state
  const [routingMode, setRoutingMode] = useState<ProductionRoutingMode>("in_house");
  const [activeContractOrders, setActiveContractOrders] = useState<PlacedContractOrder[]>([]);
  const [totalProducedCounter, setTotalProducedCounter] = useState<number>(0);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [lastRunSummary, setLastRunSummary] = useState<{ units: number; totalCost: number; date: string } | null>(null);
  const [activeModalReceipt, setActiveModalReceipt] = useState<{
    title: string;
    origin: string;
    units: number;
    unitCost: number;
    totalPaid: number;
    status: string;
    details: string;
  } | null>(null);

  // Workforce headcount in manufacturing
  const mfgDept = departments["MANUFACTURING"];
  const assemblyWorkers = mfgDept ? mfgDept.totalHeadcount : 45;

  // Multi-Constraint In-House Solver
  const inHouseConstraints: InHouseConstraintsResult = useMemo(() => {
    return solveInHouseProductionConstraints({
      requestedUnits: m.productionVolume,
      factoryTier: m.factoryTier,
      shiftCount: m.shiftCount,
      frameMaterial: m.frameMaterial,
      process: m.process,
      vehicleWeightKg: sim.weight || 1450,
      unitBOMCostUSD: cb.materials || 14000,
      targetMSRP: sim.targetPrice || 35000,
      warehouseInventory,
      assemblyWorkersAvailable: assemblyWorkers,
      playerCashUSD: cash,
    });
  }, [
    m.productionVolume,
    m.factoryTier,
    m.shiftCount,
    m.frameMaterial,
    m.process,
    sim.weight,
    cb.materials,
    sim.targetPrice,
    warehouseInventory,
    assemblyWorkers,
    cash,
  ]);

  // Snap to Max Feasible
  const handleSnapToMaxFeasible = () => {
    updateManufacturing({ productionVolume: inHouseConstraints.maxFeasibleUnits });
  };

  // Quick Spot Procurement for Missing Materials
  const handleQuickReplenish = (itemType: string, amount: number) => {
    placeSpotPurchase(itemType as any, amount, "nordic_materials_co");
  };

  // Quick Hire Assembly Techs
  const handleHireWorkers = (count: number) => {
    const hiringCost = count * 2500; // $2,500 recruiter & setup fee
    if (cash >= hiringCost) {
      recordTransaction(
        1,
        1970,
        "EMPLOYEE_SALARIES",
        hiringCost,
        `Recruitment & Onboarding of ${count} Assembly Technicians`
      );
      useCompanyFinanceStore.setState((s) => ({ cash: s.cash - hiringCost }));
      hireAggregatedStaff("MANUFACTURING", 2, count, 68);
    }
  };

  // Execute In-House Production Run
  const handleLaunchInHouse = (units: number, totalCost: number) => {
    if (units <= 0 || cash < totalCost) return;

    setIsLaunching(true);

    setTimeout(() => {
      // 1. Deduct cash and record double-entry transaction
      recordTransaction(
        1,
        1970,
        "ASSEMBLY_LABOR",
        totalCost,
        `In-House Production Run: ${units.toLocaleString()} units of ${design.name || "Series Vehicle"}`
      );
      useCompanyFinanceStore.setState((s) => ({ cash: s.cash - totalCost }));

      // 2. Consume Raw Materials from Warehouse Inventory
      useTradeStore.setState((s) => {
        const updatedInv = s.warehouseInventory.map((item) => {
          const detail = inHouseConstraints.materialDetails.find((d) => d.itemType === item.itemType);
          if (detail && detail.requiredPerVehicle > 0) {
            const consumed = detail.requiredPerVehicle * units;
            return {
              ...item,
              unitsOnHand: Math.max(0, item.unitsOnHand - consumed),
            };
          }
          return item;
        });
        return { warehouseInventory: updatedInv };
      });

      // 3. Register fleet production & global active production run
      const effectiveMonthly = inHouseConstraints.capacityDetails.effectiveMonthlyCapacity || 500;
      const dailyCapacity = Math.max(1, Math.round(effectiveMonthly / 30.4));
      const totalDays = Math.max(7, Math.ceil(units / dailyCapacity));

      useActiveProductionStore.getState().startProductionRun({
        vehicleName: design.name || "Apex Series GT",
        type: "in_house",
        factoryTier: m.factoryTier,
        totalUnits: units,
        daysTotal: totalDays,
        daysRemaining: totalDays,
        dailyRate: dailyCapacity,
        unitCostUSD: inHouseConstraints.costDetails.unitTotalCostUSD,
        totalCostUSD: totalCost,
        shiftCount: m.shiftCount,
        startDateStr: new Date().toISOString().split("T")[0],
        targetCompletionDateStr: new Date(Date.now() + totalDays * 86400000).toISOString().split("T")[0],
      });

      setTotalProducedCounter((prev) => prev + units);
      setLastRunSummary({
        units,
        totalCost,
        date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      // 4. Record Digital Twin & Garage log
      const vehicleId = `veh_${design.name.toLowerCase().replace(/\s+/g, "_")}`;
      addTwinEvent(vehicleId, {
        vehicleId,
        month: 1,
        title: "In-House Batch Complete",
        type: "manufacturing_started",
        severity: "success",
        description: `Assembled batch of ${units.toLocaleString()} vehicles in-house at plant.`,
      });

      setActiveModalReceipt({
        title: "In-House Production Run Authorized & Completed",
        origin: `Company Factory (${m.factoryTier.toUpperCase().replace("_", " ")})`,
        units,
        unitCost: inHouseConstraints.costDetails.unitTotalCostUSD,
        totalPaid: totalCost,
        status: "DELIVERED TO FLEET",
        details: `${units.toLocaleString()} finished vehicles assembled across ${m.shiftCount} shifts and passed quality inspection. Materials and labor debited.`,
      });

      setIsLaunching(false);
    }, 600);
  };

  // Place Contract Manufacturing Order
  const handlePlaceContractOrder = (order: PlacedContractOrder) => {
    // 1. Deduct cash & record ledger transaction
    recordTransaction(
      1,
      1970,
      "COMPONENT_PURCHASES",
      order.totalPaidUSD,
      `Contract Manufacturing Order: ${order.unitsOrdered} units from ${order.partnerName} (${order.orderId})`
    );
    useCompanyFinanceStore.setState((s) => ({ cash: s.cash - order.totalPaidUSD }));

    // 2. Add to active orders log & global active production run
    const leadDays = Math.max(7, order.leadTimeDays || 30);
    const dailyRate = Math.max(1, Math.round(order.unitsOrdered / leadDays));

    useActiveProductionStore.getState().startProductionRun({
      vehicleName: order.vehicleModelName || design.name || "Contract Model",
      type: "contract",
      partnerName: order.partnerName,
      totalUnits: order.unitsOrdered,
      daysTotal: leadDays,
      daysRemaining: leadDays,
      dailyRate,
      unitCostUSD: order.unitCostUSD,
      totalCostUSD: order.totalPaidUSD,
      shiftCount: 2,
      startDateStr: new Date().toISOString().split("T")[0],
      targetCompletionDateStr: new Date(Date.now() + leadDays * 86400000).toISOString().split("T")[0],
    });

    setActiveContractOrders((prev) => [order, ...prev]);
    setTotalProducedCounter((prev) => prev + order.unitsOrdered);

    // 3. Record Digital Twin event
    const vehicleId = `veh_${design.name.toLowerCase().replace(/\s+/g, "_")}`;
    addTwinEvent(vehicleId, {
      vehicleId,
      month: 1,
      title: "Contract Order Fulfilled",
      type: "manufacturing_started",
      severity: "success",
      description: `Contract order ${order.orderId} delivered: ${order.unitsOrdered} units from ${order.partnerName}.`,
    });

    // 4. Modal confirmation
    setActiveModalReceipt({
      title: "Contract Manufacturing Order Confirmed & Delivered",
      origin: `${order.partnerName}`,
      units: order.unitsOrdered,
      unitCost: order.unitCostUSD,
      totalPaid: order.totalPaidUSD,
      status: "TURNKEY FLEET DELIVERED",
      details: `Turnkey commercial batch delivered directly from ${order.partnerName}. Quality score certified at ${order.qualityScore}/100. Ready for dealership distribution.`,
    });
  };

  // Execute Hybrid Production Run
  const handleLaunchHybrid = (
    inHouseUnits: number,
    inHouseCost: number,
    outsourcedUnits: number,
    outsourcedCost: number,
    partnerId: string
  ) => {
    const totalCost = inHouseCost + outsourcedCost;
    if (cash < totalCost) return;

    setIsLaunching(true);
    const partner = CONTRACT_MANUFACTURERS_CATALOG.find((p) => p.id === partnerId) || CONTRACT_MANUFACTURERS_CATALOG[0];

    setTimeout(() => {
      // 1. Ledger transaction
      recordTransaction(
        1,
        1970,
        "COMPONENT_PURCHASES",
        totalCost,
        `Hybrid Fleet Production: ${inHouseUnits} in-house + ${outsourcedUnits} outsourced (${partner.name})`
      );
      useCompanyFinanceStore.setState((s) => ({ cash: s.cash - totalCost }));

      // 2. Consume in-house materials
      useTradeStore.setState((s) => {
        const updatedInv = s.warehouseInventory.map((item) => {
          const detail = inHouseConstraints.materialDetails.find((d) => d.itemType === item.itemType);
          if (detail && detail.requiredPerVehicle > 0) {
            const consumed = detail.requiredPerVehicle * inHouseUnits;
            return {
              ...item,
              unitsOnHand: Math.max(0, item.unitsOnHand - consumed),
            };
          }
          return item;
        });
        return { warehouseInventory: updatedInv };
      });

      // 3. Register contract order
      const contractOrder: PlacedContractOrder = {
        orderId: `HYB-${Date.now().toString().slice(-6)}`,
        partnerId: partner.id,
        partnerName: partner.name,
        vehicleModelName: design.name || "Series Model",
        unitsOrdered: outsourcedUnits,
        unitCostUSD: outsourcedUnits > 0 ? outsourcedCost / outsourcedUnits : 0,
        totalPaidUSD: outsourcedCost,
        orderTimestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        leadTimeDays: partner.leadTimeDays,
        qualityScore: partner.qualityRatingScore,
        status: "DELIVERED",
      };
      setActiveContractOrders((prev) => [contractOrder, ...prev]);

      const totalBatchUnits = inHouseUnits + outsourcedUnits;
      setTotalProducedCounter((prev) => prev + totalBatchUnits);

      setActiveModalReceipt({
        title: "Hybrid Fleet Production Authorized & Dispatched",
        origin: `In-House (${inHouseUnits} cars) + ${partner.name} (${outsourcedUnits} cars)`,
        units: totalBatchUnits,
        unitCost: totalCost / totalBatchUnits,
        totalPaid: totalCost,
        status: "COMBINED FLEET DELIVERED",
        details: `Successfully produced ${totalBatchUnits.toLocaleString()} total vehicles using hybrid dual-routing. In-house plant ran at 100% capacity and excess overflow was fulfilled by ${partner.name}.`,
      });

      setIsLaunching(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER HERO BANNER ── */}
      <div className="rounded-3xl border border-slate-200/90 bg-[#fbf9f5]/90 backdrop-blur-md p-6 shadow-sm relative overflow-hidden">
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)" }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Factory size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-bold tracking-wider">
                  STAGE 8: PRODUCTION & SOURCING PIPELINE
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  Model: {design.name || "Apex Prototype"}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                8. Manufacturing Operations & Dual-Route Assembly
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl mt-0.5">
                Produce vehicles through your company's owned plant (strictly governed by physical plant capacity, raw materials, assembly workforce, and working capital) or commission contract manufacturing orders with external foundries and rival automakers.
              </p>
            </div>
          </div>

          {onSelectStage && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onSelectStage("create_vehicle_hub")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 text-xs font-mono font-bold transition-all shadow-xs"
              >
                ← Vehicle Hub
              </button>
              <button
                type="button"
                onClick={() => onSelectStage("factory")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-mono font-bold transition-all shadow-xs"
              >
                <Factory size={13} />
                <span>Factory Floor & Lines →</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODE SWITCHER TABS ── */}
      <ManufacturingModeTabs
        mode={routingMode}
        onSelectMode={setRoutingMode}
        treasuryCashUSD={cash}
        inHouseBottleneck={inHouseConstraints.primaryBottleneck}
        inHouseMaxFeasible={inHouseConstraints.maxFeasibleUnits}
        activeContractOrdersCount={activeContractOrders.length}
      />

      {/* ── ACTIVE PRODUCTION VIEW ── */}
      {routingMode === "in_house" && (
        <InHouseProductionPanel
          constraints={inHouseConstraints}
          config={m}
          targetPriceUSD={sim.targetPrice || 35000}
          onUpdateConfig={updateManufacturing}
          onSnapToMaxFeasible={handleSnapToMaxFeasible}
          onQuickReplenishMaterial={handleQuickReplenish}
          onHireAssemblyWorkers={handleHireWorkers}
          onLaunchProductionRun={handleLaunchInHouse}
          isLaunching={isLaunching}
          lastRunSummary={lastRunSummary}
        />
      )}

      {routingMode === "outsourced" && (
        <OutsourcedContractPanel
          baseMaterialsUSD={cb.materials || 14000}
          playerCashUSD={cash}
          targetPriceUSD={sim.targetPrice || 35000}
          modelName={design.name || "Apex Prototype"}
          activeOrders={activeContractOrders}
          onPlaceOrder={handlePlaceContractOrder}
        />
      )}

      {routingMode === "hybrid" && (
        <HybridProductionPanel
          inHouseConstraints={inHouseConstraints}
          baseMaterialsUSD={cb.materials || 14000}
          playerCashUSD={cash}
          targetPriceUSD={sim.targetPrice || 35000}
          modelName={design.name || "Apex Prototype"}
          onLaunchHybridRun={handleLaunchHybrid}
          isLaunching={isLaunching}
        />
      )}

      {/* ── FINANCIAL & PRODUCTION SUMMARY FOOTER ── */}
      <ManufacturingSummaryBar
        targetPriceUSD={sim.targetPrice || 35000}
        unitCostUSD={
          routingMode === "in_house"
            ? inHouseConstraints.costDetails.unitTotalCostUSD
            : sim.totalCost || 24000
        }
        profitPerUnitUSD={
          sim.targetPrice -
          (routingMode === "in_house"
            ? inHouseConstraints.costDetails.unitTotalCostUSD
            : sim.totalCost || 24000)
        }
        safetyRating={sim.safetyRating || 4}
        totalFleetProduced={totalProducedCounter}
        onSelectStage={onSelectStage}
      />

      {/* ── INTERACTIVE FULFILLMENT RECEIPT MODAL ── */}
      {activeModalReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setActiveModalReceipt(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {activeModalReceipt.status}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeModalReceipt.title}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Origin / Facility:</span>
                <span className="font-bold text-slate-900">{activeModalReceipt.origin}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Fleet Units Added:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  +{activeModalReceipt.units.toLocaleString()} vehicles
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Unit Cost:</span>
                <span className="font-mono font-bold text-slate-800">
                  ${Math.round(activeModalReceipt.unitCost).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-900">Total Treasury Debited:</span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  ${Math.round(activeModalReceipt.totalPaid).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeModalReceipt.details}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModalReceipt(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold transition-all shadow-xs"
              >
                DISMISS RECEIPT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
