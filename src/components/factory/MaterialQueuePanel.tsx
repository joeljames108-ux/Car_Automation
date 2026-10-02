import React, { useMemo, useState } from "react";
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  ArrowRight,
  PackageCheck,
  Truck,
  Plus,
  Clock,
  Calendar,
  XCircle,
  Tag,
  ShieldCheck,
  ChevronRight,
  Layers,
} from "lucide-react";
import { useFactoryStore } from "../../state/factoryStore";
import { useTradeStore } from "../../state/tradeStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { computeSlotBOM } from "../../sim/factory/factoryBOMEngine";
import {
  COMMODITY_SUPPLY_SPECS,
  calculatePurchaseOrderCost,
  getMaterialSupplySpec,
} from "../../sim/factory/factorySupplyChainEngine";

export function MaterialQueuePanel() {
  const { assemblyLines, purchaseOrders, placePurchaseOrder, cancelPurchaseOrder } = useFactoryStore();
  const { warehouseInventory } = useTradeStore();
  const clock = useSimulationClockStore();

  const currentDateStr = `${clock.year ?? 1970}-${String(clock.month ?? 1).padStart(2, "0")}-${String(clock.day ?? 1).padStart(2, "0")}`;

  // Order Placement Modal / Form State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("mat_steel");
  const [orderQuantity, setOrderQuantity] = useState<number>(25000);
  const [orderMessage, setOrderMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Extract all slots that are active or scheduled
  const activeSlots = useMemo(() => {
    const slots: any[] = [];
    assemblyLines.forEach((l) => {
      (l.reservedSlots || []).forEach((s) => {
        if (s.status === "IN_PROGRESS" || s.status === "SCHEDULED") {
          slots.push({ slot: s, lineName: l.name });
        }
      });
    });
    return slots;
  }, [assemblyLines]);

  const boms = useMemo(() => {
    return activeSlots.map(({ slot, lineName }) => ({
      ...computeSlotBOM(slot, warehouseInventory),
      lineName,
    }));
  }, [activeSlots, warehouseInventory]);

  // Total material demand aggregation
  const aggregatedDemands = useMemo(() => {
    const totals: Record<string, { id: string; name: string; totalReq: number; unit: string; inStock: number }> = {};

    boms.forEach((bom) => {
      bom.items.forEach((item) => {
        if (!totals[item.id]) {
          totals[item.id] = {
            id: item.id,
            name: item.name,
            totalReq: 0,
            unit: item.unit,
            inStock: item.unitsInStock,
          };
        }
        totals[item.id].totalReq += item.totalRequired;
      });
    });

    return Object.values(totals);
  }, [boms]);

  // Selected commodity order cost computation
  const currentCostInfo = useMemo(() => {
    return calculatePurchaseOrderCost(selectedMaterialId, orderQuantity);
  }, [selectedMaterialId, orderQuantity]);

  const selectedSpec = useMemo(() => {
    return getMaterialSupplySpec(selectedMaterialId);
  }, [selectedMaterialId]);

  const handlePlaceOrder = () => {
    setOrderMessage(null);
    const result = placePurchaseOrder(selectedMaterialId, orderQuantity, currentDateStr);
    if (result.success) {
      setOrderMessage({
        type: "success",
        text: `Purchase Order confirmed! ${orderQuantity.toLocaleString()} ${selectedSpec.unit} scheduled for delivery on ${result.order?.deliveryDate}.`,
      });
      setTimeout(() => {
        setIsOrderModalOpen(false);
        setOrderMessage(null);
      }, 1800);
    } else {
      setOrderMessage({
        type: "error",
        text: result.error || "Failed to place order. Check company funds.",
      });
    }
  };

  const pendingOrders = useMemo(() => {
    return (purchaseOrders || []).filter((o) => o.status === "PENDING");
  }, [purchaseOrders]);

  const deliveredOrders = useMemo(() => {
    return (purchaseOrders || []).filter((o) => o.status === "DELIVERED").slice(-5);
  }, [purchaseOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Material Requirements & Supply Logistics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage raw commodity lead-times, place bulk purchase orders, and monitor warehouse delivery schedules
          </p>
        </div>

        <button
          onClick={() => {
            setIsOrderModalOpen(true);
            setOrderMessage(null);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto hover:shadow"
        >
          <Truck size={14} className="text-amber-400" /> Place Purchase Order
        </button>
      </div>

      {/* Aggregate Commodities Stockpile Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Current Stockpile vs Floor Demand</h3>
          <span className="text-[11px] text-slate-400">Updates live with assembly line runs</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {aggregatedDemands.map((mat) => {
            const isShortage = mat.inStock < mat.totalReq;
            const coveragePct = mat.totalReq > 0 ? Math.min(100, Math.round((mat.inStock / mat.totalReq) * 100)) : 100;
            const spec = COMMODITY_SUPPLY_SPECS[mat.id];

            return (
              <div
                key={mat.name}
                className={`p-4 rounded-xl border transition-all ${
                  isShortage
                    ? "bg-amber-50/70 border-amber-300 shadow-sm"
                    : "bg-white border-slate-200/80 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-slate-500 truncate">{mat.name}</div>
                  {isShortage && <AlertTriangle size={13} className="text-amber-600 shrink-0" />}
                </div>

                <div className="text-lg font-bold text-slate-900 mt-1">
                  {mat.inStock.toLocaleString()}{" "}
                  <span className="text-[10px] font-normal text-slate-500">{mat.unit}</span>
                </div>

                <div className="mt-2 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                    <span>Req: {mat.totalReq.toLocaleString()}</span>
                    <span className={isShortage ? "text-amber-800 font-bold" : "text-emerald-700 font-semibold"}>
                      {coveragePct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isShortage ? "bg-amber-500" : "bg-emerald-600"}`}
                      style={{ width: `${coveragePct}%` }}
                    />
                  </div>
                </div>

                {spec && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Lead: {spec.nominalLeadTimeDays}d</span>
                    <button
                      onClick={() => {
                        setSelectedMaterialId(mat.id);
                        setOrderQuantity(Math.max(spec.bulkDiscountThreshold / 2, mat.totalReq - mat.inStock));
                        setIsOrderModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      + Order
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Purchase Orders & Shipments in Transit */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Shipments In Transit & Active Purchase Orders</h3>
            <p className="text-xs text-slate-500">Materials en route from regional suppliers to factory warehouse</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {pendingOrders.length} In-Transit
          </span>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
            <Truck size={28} className="mx-auto text-slate-400 mb-2" />
            <div className="text-xs font-medium text-slate-600">No shipments currently in transit</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Click &quot;Place Purchase Order&quot; above to procure steel, tyres, or electronics before lines run out.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200/60 rounded-xl overflow-hidden">
            {pendingOrders.map((po) => {
              const spec = getMaterialSupplySpec(po.materialId);
              const totalDays = spec.nominalLeadTimeDays || 10;
              const daysPassed = Math.max(0, totalDays - po.daysRemaining);
              const progressPct = Math.min(100, Math.round((daysPassed / totalDays) * 100));

              return (
                <div key={po.id} className="p-4 bg-[#fcfbf9] hover:bg-white transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                        In Transit ({po.daysRemaining}d remaining)
                      </span>
                      {po.bulkDiscountPct > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {po.bulkDiscountPct}% Bulk Discount
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-900">{po.materialName}</div>
                    <div className="text-xs text-slate-500">
                      Ordered: {po.quantity.toLocaleString()} {po.unit} • Total: ${po.totalCostUSD.toLocaleString()} (${po.unitPriceUSD}/{po.unit})
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-36 text-right">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>ETA</span>
                        <span className="font-semibold text-slate-700">{po.deliveryDate}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => cancelPurchaseOrder(po.id)}
                      className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
                      title="Cancel order with 80% refund"
                    >
                      Cancel PO
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Per-Batch BOM Status */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Batch Material Staging by Production Slot</h3>

        {boms.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
            <PackageCheck size={28} className="mx-auto text-slate-400 mb-2" />
            <div className="text-xs text-slate-500">No scheduled production batches currently require material allocation.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {boms.map((bom) => (
              <div
                key={bom.slotId}
                className="p-4 rounded-xl border border-slate-200/80 bg-[#fcfbf9] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60">
                  <div>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {bom.lineName}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{bom.vehicleModelName}</h4>
                    <div className="text-xs text-slate-500">Target: {bom.targetUnits.toLocaleString()} units</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        bom.isReady
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {bom.isReady ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                      {bom.isReady ? "Materials Staged & Ready" : `${bom.shortageCount} Shortages`}
                    </span>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">
                        ${Math.round(bom.totalBOMCostUSD / 1000)}k
                      </div>
                      <div className="text-[10px] text-slate-400">Total BOM Cost</div>
                    </div>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                  {bom.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2 rounded-lg border ${
                        item.isShortage ? "bg-amber-100/40 border-amber-300" : "bg-white border-slate-200/60"
                      }`}
                    >
                      <div className="text-[10px] font-medium text-slate-500 truncate">{item.name}</div>
                      <div className="font-semibold text-slate-900 mt-0.5">
                        {item.totalRequired.toLocaleString()} {item.unit}
                      </div>
                      <div className={`text-[10px] font-medium mt-0.5 ${item.isShortage ? "text-amber-800 font-bold" : "text-emerald-700"}`}>
                        {item.isShortage ? `Short -${item.shortageUnits}` : "In Stock"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Place Purchase Order Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="text-indigo-600" size={20} />
                <h3 className="text-base font-bold text-slate-900">Procure Raw Commodities</h3>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>

            {orderMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  orderMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {orderMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                <span>{orderMessage.text}</span>
              </div>
            )}

            {/* Select Material Commodity */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Select Commodity</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(COMMODITY_SUPPLY_SPECS).map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => {
                      setSelectedMaterialId(spec.id);
                      setOrderQuantity(spec.bulkDiscountThreshold);
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      selectedMaterialId === spec.id
                        ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold text-slate-900 truncate">{spec.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ${spec.baseUnitPriceUSD}/{spec.unit} • {spec.nominalLeadTimeDays}d lead
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Order Volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700">Order Quantity ({selectedSpec.unit})</label>
                <span className="text-[11px] text-indigo-700 font-medium">
                  Bulk discount at &ge;{selectedSpec.bulkDiscountThreshold.toLocaleString()} {selectedSpec.unit}
                </span>
              </div>
              <input
                type="number"
                min="100"
                step="500"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Pricing and Lead Time Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Nominal Supplier Lead-Time</span>
                <span className="font-bold text-slate-900">{selectedSpec.nominalLeadTimeDays} Days</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Unit Price (1970 Era)</span>
                <span className="font-semibold text-slate-900">${currentCostInfo.unitPrice} / {selectedSpec.unit}</span>
              </div>
              {currentCostInfo.discountPct > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Volume Bulk Discount</span>
                  <span>−{currentCostInfo.discountPct}%</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total Purchase Order Cost</span>
                <span className="text-base font-extrabold text-indigo-950">
                  ${currentCostInfo.totalCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all hover:shadow"
              >
                Confirm & Dispatch PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
