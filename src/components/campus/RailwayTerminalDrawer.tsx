import React, { useState } from "react";
import {
  X,
  Train,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Shield,
  Clock,
  Layers,
  Container,
  Droplet,
  Truck,
  Car,
  Globe2,
  HardHat,
  Sparkles,
} from "lucide-react";
import { useCampusStore } from "../../state/campusStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useReputationStore } from "../../state/reputationStore";
import {
  RAILWAY_LEVEL_SPECS,
  SPECIALIZED_SIDINGS,
  NETWORK_CONNECTIONS,
  SpecializedSidingType,
  RailNetworkTier,
} from "../../sim/campus/railwayTerminalEngine";

interface RailwayTerminalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RailwayTerminalDrawer: React.FC<RailwayTerminalDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "sidings" | "network" | "leasing" | "upgrade">("overview");

  const {
    railwayTerminalState,
    upgradeRailwayTerminal,
    installRailwaySiding,
    upgradeRailwayNetwork,
    setRailwayThirdPartyLease,
    getRailwayDailyDispatch,
    getRailwayEconomics,
    lastActionMessage,
  } = useCampusStore();

  const { cash } = useSimulationClockStore();
  const { overallReputation } = useReputationStore();

  const currentLevel = railwayTerminalState.level;
  const currentSpec = RAILWAY_LEVEL_SPECS[currentLevel];
  const nextLevel = currentLevel < 5 ? currentLevel + 1 : null;
  const nextSpec = nextLevel !== null ? RAILWAY_LEVEL_SPECS[nextLevel] : null;

  const dispatchMetrics = getRailwayDailyDispatch();
  const econMetrics = getRailwayEconomics();
  const currentNetwork = NETWORK_CONNECTIONS[railwayTerminalState.networkTier];

  const [leaseInputTonnes, setLeaseInputTonnes] = useState(
    railwayTerminalState.leasedThirdPartyTonnesDaily
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#f8f6f0] border-l border-[#dad4c5] shadow-2xl h-full flex flex-col font-sans text-slate-900 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#dad4c5] bg-[#f1eee4]/95 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-800 font-bold">
              <Train size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 font-mono tracking-wider">
                  HQ CARGO RAILWAY TERMINAL
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  LEVEL {currentLevel} // {currentSpec.tier.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Zone A Logistics Hub • Multi-Modal Freight Infrastructure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-black/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#dad4c5] bg-[#ece7da]/70 px-3 pt-1 font-mono text-xs overflow-x-auto">
          {[
            { id: "overview", label: "Throughput & Status", icon: Train },
            { id: "sidings", label: "Specialized Sidings", icon: Layers },
            { id: "network", label: "Trunk Corridors", icon: Globe2 },
            { id: "leasing", label: "B2B Monetization", icon: DollarSign },
            { id: "upgrade", label: "Civil Upgrade", icon: HardHat },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "border-amber-700 text-amber-900 bg-white/70 rounded-t-lg shadow-xs"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/30"
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Alert Bar */}
        {lastActionMessage && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-[11px] font-mono text-amber-900 flex items-center justify-between">
            <span>{lastActionMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs font-sans">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-white border border-[#dad4c5] shadow-xs">
              <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Daily Capacity</span>
              <span className="text-base font-mono font-bold text-slate-900 block">
                {currentSpec.dailyTonnageCapacity.toLocaleString()} t/d
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                {currentSpec.maxDailyCarriers} trains/day
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#dad4c5] shadow-xs">
              <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Freight Cost Savings</span>
              <span className="text-base font-mono font-bold text-emerald-700 block">
                -{(currentSpec.freightCostSavingsPct * 100).toFixed(0)}%
              </span>
              <span className="text-[9px] text-slate-400 font-mono">vs. Road Trucking</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#dad4c5] shadow-xs">
              <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Monthly Net Benefit</span>
              <span className={`text-base font-mono font-bold block ${econMetrics.estimatedFreightSavingsUSD > 0 ? "text-emerald-700" : "text-slate-600"}`}>
                +${(econMetrics.estimatedFreightSavingsUSD / 1e3).toFixed(0)}k/mo
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Net Logistics Gain</span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: OVERVIEW & DISPATCH                                     */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Throughput Utilization Meter */}
              <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-3 font-mono">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Train size={14} className="text-amber-700" />
                    Daily Rail Capacity Utilization
                  </span>
                  <span className={dispatchMetrics.isCapacityExceeded ? "text-rose-700" : "text-emerald-700"}>
                    {dispatchMetrics.capacityUtilizationPct}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      dispatchMetrics.isCapacityExceeded
                        ? "bg-rose-600"
                        : dispatchMetrics.capacityUtilizationPct > 80
                        ? "bg-amber-500"
                        : "bg-emerald-600"
                    }`}
                    style={{ width: `${Math.min(100, dispatchMetrics.capacityUtilizationPct)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#eee9dc]">
                  <div className="text-slate-600">
                    Total Demand: <span className="font-bold text-slate-900">{dispatchMetrics.totalDemandTonnes} t/d</span>
                  </div>
                  <div className="text-slate-600">
                    Rail Carried: <span className="font-bold text-emerald-800">{dispatchMetrics.railCarriedTonnes} t/d</span>
                  </div>
                  <div className="text-slate-600">
                    Truck Overflow: <span className={`font-bold ${dispatchMetrics.truckOverflowTonnes > 0 ? "text-rose-700" : "text-slate-900"}`}>{dispatchMetrics.truckOverflowTonnes} t/d</span>
                  </div>
                  <div className="text-slate-600">
                    Auto-Rack Cars: <span className="font-bold text-amber-800">{dispatchMetrics.railCarriedVehicles} cars/d</span>
                  </div>
                </div>
              </div>

              {/* Diagnostic Alerts */}
              {dispatchMetrics.bottleneckAlerts.length > 0 && (
                <div className="space-y-2">
                  {dispatchMetrics.bottleneckAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2 font-mono"
                    >
                      <AlertTriangle size={15} className="text-amber-700 shrink-0 mt-0.5" />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Operational Facility Attributes */}
              <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-2 font-mono text-[11px]">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">
                  Terminal Specifications
                </h4>
                <div className="flex justify-between py-1 border-b border-[#eee9dc]">
                  <span className="text-slate-500">Current Facility Tier:</span>
                  <span className="font-bold text-slate-900">{currentSpec.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#eee9dc]">
                  <span className="text-slate-500">Active Rail Network Link:</span>
                  <span className="font-bold text-cyan-800">{currentNetwork.name} ({currentNetwork.speedKmh} km/h)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#eee9dc]">
                  <span className="text-slate-500">Auto-Rack Car Loading Ramp:</span>
                  <span className="font-bold text-slate-900">{currentSpec.autoRackVehiclesPerDay} vehicles/day max</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#eee9dc]">
                  <span className="text-slate-500">Monthly Facility Maintenance:</span>
                  <span className="font-bold text-rose-800">${(econMetrics.totalFacilityExpenseUSD / 1e3).toFixed(1)}k/mo</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Installed Specialized Sidings:</span>
                  <span className="font-bold text-slate-900">{railwayTerminalState.installedSidings.length} / 4 modules</span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: SPECIALIZED SIDINGS                                     */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === "sidings" && (
            <div className="space-y-3 font-mono">
              <p className="text-[11px] text-slate-600">
                Install dedicated industrial sidings and automated gantry extensions to cut raw material costs, protect sensitive electronics, and load finished vehicles.
              </p>

              {(Object.keys(SPECIALIZED_SIDINGS) as SpecializedSidingType[]).map((sidId) => {
                const spec = SPECIALIZED_SIDINGS[sidId];
                const isInstalled = railwayTerminalState.installedSidings.includes(sidId);
                const canAfford = cash >= spec.costUSD;
                const meetsLevel = currentLevel >= spec.minTerminalLevel;

                return (
                  <div
                    key={sidId}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isInstalled
                        ? "bg-emerald-50/50 border-emerald-300"
                        : "bg-white border-[#dad4c5]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{spec.name}</span>
                          {isInstalled && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                              INSTALLED
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-600 mt-1 font-sans">
                          {spec.description}
                        </p>
                      </div>

                      {!isInstalled && (
                        <button
                          disabled={!meetsLevel || !canAfford}
                          onClick={() => installRailwaySiding(sidId)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors ${
                            meetsLevel && canAfford
                              ? "bg-amber-700 text-white hover:bg-amber-800 shadow-xs"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          Install (${(spec.costUSD / 1e6).toFixed(2)}M)
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-[#eee9dc] text-[10px]">
                      <div>
                        <span className="text-slate-400 block">Req Level:</span>
                        <span className={`font-bold ${meetsLevel ? "text-slate-900" : "text-rose-700"}`}>
                          Level {spec.minTerminalLevel}+
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Upkeep:</span>
                        <span className="font-bold text-slate-700">${(spec.monthlyUpkeepUSD / 1e3).toFixed(0)}k/mo</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Primary Benefit:</span>
                        <span className="font-bold text-emerald-700">
                          {spec.procurementDiscountPct > 0
                            ? `-${(spec.procurementDiscountPct * 100).toFixed(0)}% Procurement`
                            : `+${(spec.deliveryReliabilityBonusPct * 100).toFixed(0)}% Reliability`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 3: TRUNK CORRIDORS & NETWORK CONCESSIONS                   */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === "network" && (
            <div className="space-y-3 font-mono">
              <p className="text-[11px] text-slate-600">
                Secure freight trunk rights-of-way and concessions to link the HQ Terminal to regional industrial clusters, national hubs, and international deepwater ports.
              </p>

              {(Object.keys(NETWORK_CONNECTIONS) as RailNetworkTier[]).map((tierKey) => {
                const netSpec = NETWORK_CONNECTIONS[tierKey];
                const isActive = railwayTerminalState.networkTier === tierKey;
                const canAfford = cash >= netSpec.costUSD;
                const meetsRep = (overallReputation ?? 15) >= netSpec.reputationRequired;

                return (
                  <div
                    key={tierKey}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isActive
                        ? "bg-cyan-50/70 border-cyan-300"
                        : "bg-white border-[#dad4c5]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{netSpec.name}</span>
                          {isActive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-200 text-cyan-900">
                              ACTIVE TRUNK
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-600 mt-1 font-sans">
                          {netSpec.description}
                        </p>
                      </div>

                      {!isActive && (
                        <button
                          disabled={!meetsRep || !canAfford}
                          onClick={() => upgradeRailwayNetwork(tierKey)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors ${
                            meetsRep && canAfford
                              ? "bg-cyan-700 text-white hover:bg-cyan-800 shadow-xs"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          Connect (${(netSpec.costUSD / 1e6).toFixed(2)}M)
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-[#eee9dc] text-[10px]">
                      <div>
                        <span className="text-slate-400 block">Line Speed:</span>
                        <span className="font-bold text-slate-900">{netSpec.speedKmh} km/h</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Req Reputation:</span>
                        <span className={`font-bold ${meetsRep ? "text-slate-900" : "text-rose-700"}`}>
                          {netSpec.reputationRequired}+ Rep
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Transit Speedup:</span>
                        <span className="font-bold text-emerald-700">
                          -{( (1 - netSpec.transitSpeedupMultiplier) * 100).toFixed(0)}% Days
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 4: B2B COMPETITOR LEASING                                  */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === "leasing" && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Third-Party Competitor Slot Leasing
                </h4>
                <p className="text-[11px] text-slate-600 font-sans">
                  Monetize your excess daily rail throughput by leasing shunting and container slots to rival automakers and regional suppliers for lucrative monthly recurring revenue.
                </p>

                <div className="space-y-2 pt-2 border-t border-[#eee9dc]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Lease Allowance (Level {currentLevel}):</span>
                    <span className="font-bold text-slate-900">
                      Up to {currentSpec.maxThirdPartyLeaseTonnes.toLocaleString()} t/day
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="range"
                      min={0}
                      max={currentSpec.maxThirdPartyLeaseTonnes}
                      step={50}
                      value={leaseInputTonnes}
                      onChange={(e) => setLeaseInputTonnes(Number(e.target.value))}
                      className="w-full accent-amber-700"
                    />
                    <span className="w-24 text-right font-bold text-amber-800 text-xs">
                      {leaseInputTonnes.toLocaleString()} t/d
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-slate-600">Calculated Monthly Revenue:</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      +${((leaseInputTonnes * 30 * railwayTerminalState.leaseRateUSDPerTonne) / 1e3).toFixed(0)}k / month
                    </span>
                  </div>

                  <button
                    onClick={() => setRailwayThirdPartyLease(leaseInputTonnes)}
                    className="w-full mt-2 py-2 rounded-xl bg-amber-700 text-white font-bold text-xs hover:bg-amber-800 transition-colors shadow-xs"
                  >
                    Apply Leasing Contract ({leaseInputTonnes.toLocaleString()} t/d)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 5: CIVIL UPGRADE                                           */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === "upgrade" && (
            <div className="space-y-4 font-mono">
              {nextSpec ? (
                <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#dad4c5] pb-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold">Target Expansion</span>
                      <span className="font-bold text-sm text-slate-900">
                        Level {nextSpec.level}: {nextSpec.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded">
                      {nextSpec.tier.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-sans">
                    {nextSpec.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Daily Capacity</span>
                      <span className="font-bold text-slate-900">
                        {currentSpec.dailyTonnageCapacity.toLocaleString()} ➔ {nextSpec.dailyTonnageCapacity.toLocaleString()} t/d
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Freight Savings</span>
                      <span className="font-bold text-emerald-700">
                        -{(currentSpec.freightCostSavingsPct * 100).toFixed(0)}% ➔ -{(nextSpec.freightCostSavingsPct * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Auto-Rack Ramps</span>
                      <span className="font-bold text-slate-900">
                        {currentSpec.autoRackVehiclesPerDay} ➔ {nextSpec.autoRackVehiclesPerDay} cars/day
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Civil Build Time</span>
                      <span className="font-bold text-slate-900">{nextSpec.constructionMonths} Months</span>
                    </div>
                  </div>

                  {/* Financial Requirement */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Capital Cost Required:</span>
                      <span className="font-bold text-slate-900">${(nextSpec.capitalCostUSD / 1e6).toFixed(2)}M CapEx</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Player Treasury:</span>
                      <span className={`font-bold ${cash >= nextSpec.capitalCostUSD ? "text-emerald-700" : "text-rose-700"}`}>
                        ${(cash / 1e6).toFixed(2)}M
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={cash < nextSpec.capitalCostUSD}
                    onClick={() => upgradeRailwayTerminal(nextSpec.level)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors shadow-xs ${
                      cash >= nextSpec.capitalCostUSD
                        ? "bg-amber-700 text-white hover:bg-amber-800"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {cash >= nextSpec.capitalCostUSD
                      ? `Authorize Upgrade ($${(nextSpec.capitalCostUSD / 1e6).toFixed(2)}M)`
                      : `Insufficient Funds (Need $${(nextSpec.capitalCostUSD / 1e6).toFixed(2)}M)`}
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <CheckCircle2 size={24} className="text-emerald-700 mx-auto" />
                  <h4 className="font-bold text-xs text-emerald-900">MAXIMUM EXPANSION REACHED</h4>
                  <p className="text-[11px] text-emerald-700 font-sans">
                    The facility operates as a Continental High-Speed Intermodal Mega-Terminal with 50,000 t/d throughput.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
