// ===================================================================
// SALES LAUNCH — Market positioning, launch, and sales dashboard
// ===================================================================
import { useState, useMemo } from "react";
import {
  DollarSign, Rocket, Globe, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { useCompany } from "../state/CompanyContext";
import { Slider } from "./ui/Controls";
import type { SalesConfig, MarketSegmentTarget, PricingStrategy, LaunchEventType } from "../sim/types";

const SEGMENTS: { value: MarketSegmentTarget; label: string; priceRange: string }[] = [
  { value: "economy",     label: "Economy",     priceRange: "$5k–25k" },
  { value: "mainstream",  label: "Mainstream",  priceRange: "$15k–45k" },
  { value: "premium",     label: "Premium",     priceRange: "$35k–80k" },
  { value: "luxury",      label: "Luxury",      priceRange: "$60k–200k" },
  { value: "ultra_luxury",label: "Ultra Luxury",priceRange: "$150k–500k" },
  { value: "hypercar",    label: "Hypercar",    priceRange: "$500k+" },
];

const LAUNCH_EVENTS: { value: LaunchEventType; label: string; boost: number }[] = [
  { value: "auto_show",     label: "Auto Show Reveal",    boost: 1.15 },
  { value: "online_reveal", label: "Online Announcement", boost: 1.05 },
  { value: "private_event", label: "Private Media Event", boost: 1.10 },
  { value: "dealer_launch", label: "Dealer Network",      boost: 1.02 },
  { value: "press_launch",  label: "Press Launch",        boost: 1.20 },
];

const PRICING_STRATEGIES: { value: PricingStrategy; label: string; desc: string }[] = [
  { value: "premium",     label: "Premium",      desc: "Price above market — emphasize quality" },
  { value: "competitive", label: "Competitive",  desc: "Match market pricing — broad appeal" },
  { value: "value",       label: "Value",        desc: "Below market — high volume play" },
  { value: "penetration", label: "Penetration",  desc: "Aggressive intro pricing — gain share" },
  { value: "skimming",    label: "Price Skimming",desc: "Start high, reduce over time" },
];

const REGIONS: { value: SalesConfig["regions"][number]; label: string }[] = [
  { value: "na",          label: "North America" },
  { value: "eu",          label: "Europe" },
  { value: "asia",        label: "Asia-Pacific" },
  { value: "middle_east", label: "Middle East" },
  { value: "oceania",     label: "Oceania" },
];

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}



export function SalesLaunch() {
  const { company, launchVehicle } = useCompany();
  const [activeTab, setActiveTab] = useState<"position" | "marketing" | "projection" | "dashboard">("position");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [config, setConfig] = useState<SalesConfig>({
    vehicleId: "",
    targetPrice: 45000,
    pricingStrategy: "competitive",
    targetVolume: 5000,
    dealerMargin: 0.08,
    marketingBudget: 500000,
    warrantyYears: 3,
    warrantyMiles: 60000,
    launchEvent: "auto_show",
    regions: ["na", "eu"],
    marketSegment: "mainstream",
  });

  const vehicle = selectedVehicleId ? company.garage.find(g => g.id === selectedVehicleId) : null;
  const salesHistory = selectedVehicleId ? (company.salesData[selectedVehicleId] ?? []) : [];


  const projection = useMemo(() => {
    const eventBoost = LAUNCH_EVENTS.find(e => e.value === config.launchEvent)?.boost ?? 1;
    const regionBoost = 1 + config.regions.length * 0.12;
    const stratMultiplier: Record<string, number> = {
      premium: 0.7, competitive: 1.0, value: 1.4, penetration: 1.6, skimming: 0.6,
    };
    const strat = stratMultiplier[config.pricingStrategy] ?? 1;
    const monthlyUnits = Math.round((config.targetVolume / 12) * strat * eventBoost * regionBoost);
    const monthlyRevenue = monthlyUnits * config.targetPrice;
    const cogs = vehicle?.sim.vehicleCost ?? config.targetPrice * 0.6;
    const monthlyProfit = monthlyRevenue * (1 - config.dealerMargin) - cogs * monthlyUnits;
    const breakEvenMonths = monthlyProfit > 0 ? Math.ceil(config.marketingBudget / Math.max(monthlyProfit, 1)) : null;
    return { monthlyUnits, monthlyRevenue, monthlyProfit, breakEvenMonths };
  }, [config, vehicle]);

  function toggleRegion(r: SalesConfig["regions"][number]) {
    setConfig(c => ({
      ...c,
      regions: c.regions.includes(r) ? c.regions.filter(x => x !== r) : [...c.regions, r],
    }));
  }

  function handleLaunch() {
    if (!selectedVehicleId) return;
    launchVehicle(selectedVehicleId, { ...config, vehicleId: selectedVehicleId });
    setActiveTab("dashboard");
  }

  const totalRevenue = salesHistory.reduce((s, r) => s + r.revenue, 0);
  const totalProfit = salesHistory.reduce((s, r) => s + r.profit, 0);
  const totalUnits = salesHistory.reduce((s, r) => s + r.unitsSold, 0);

  const tabs = [
    { id: "position"   as const, label: "1. Market & Positioning" },
    { id: "marketing"  as const, label: "2. Marketing & Regions" },
    { id: "projection" as const, label: "3. Pre-Launch Projections" },
    { id: "dashboard"  as const, label: `4. Sales Dashboard${salesHistory.length > 0 ? ` (${salesHistory.length} periods)` : ""}` },
  ];

  return (
    <div className="space-y-4 stagger">
      {/* Header */}
      <div className="panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: "radial-gradient(ellipse at top right, rgba(34,211,238,0.3), transparent 60%)" }} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-ok-500/20 border border-ok-500/30">
              <DollarSign size={24} className="text-ok-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-50">Sales & Launch</h2>
              <p className="text-xs text-amber-300/50">Market positioning, pricing strategy, launch events, and revenue tracking</p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold font-mono text-ok-400">{fmt(company.totalRevenue)}</div>
              <div className="text-[10px] text-amber-400">Total Revenue</div>
            </div>
            <div>
              <div className={`text-xl font-bold font-mono ${company.totalProfit >= 0 ? "text-ok-400" : "text-danger-400"}`}>{fmt(company.totalProfit)}</div>
              <div className="text-[10px] text-amber-400">Total Profit</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-accent-300">{company.garage.filter(g => g.isLaunched).length}</div>
              <div className="text-[10px] text-amber-400">Active Models</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle selector */}
      <div className="panel p-4">
        <label className="label-mono block mb-2">Vehicle</label>
        <select value={selectedVehicleId || ""}
          onChange={e => setSelectedVehicleId(e.target.value || null)}
          className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-amber-50 focus:border-accent-500 focus:outline-none">
          <option value="">— Select a vehicle to configure or track —</option>
          {company.garage.map(v => (
            <option key={v.id} value={v.id}>
              {v.name} — {v.isLaunched ? "✓ Launched" : "Not Launched"} · {Math.round(v.peakPower)}hp · ${(v.price / 1000).toFixed(0)}k
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-base-850 rounded-lg p-1 border border-base-800">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === t.id ? "bg-accent-500/20 text-accent-300" : "text-amber-200/60 hover:text-amber-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. MARKET & POSITIONING TAB */}
      {activeTab === "position" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="panel p-5">
            <h3 className="text-xs font-bold text-amber-50 uppercase tracking-wider mb-3">1. Market Segment Target</h3>
            <p className="text-xs text-amber-300/50 mb-3">Select the primary buyer demographic and vehicle price bracket for your model.</p>
            <div className="space-y-2">
              {SEGMENTS.map(s => (
                <button key={s.value} onClick={() => setConfig(c => ({ ...c, marketSegment: s.value as MarketSegmentTarget }))}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all border ${
                    config.marketSegment === s.value
                      ? "bg-accent-500/15 border-accent-500/40 text-accent-300 font-semibold"
                      : "bg-base-850 border-base-800 text-amber-200/60 hover:border-base-700"
                  }`}>
                  <span>{s.label}</span>
                  <span className="text-xs font-mono text-amber-300/50">{s.priceRange}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-50 uppercase tracking-wider mb-1">2. Strategic Pricing Philosophy</h3>
            <div className="space-y-2">
              {PRICING_STRATEGIES.map(s => (
                <button key={s.value} onClick={() => setConfig(c => ({ ...c, pricingStrategy: s.value as PricingStrategy }))}
                  className={`w-full flex items-start gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all border ${
                    config.pricingStrategy === s.value
                      ? "bg-accent-500/15 border-accent-500/40 text-accent-300"
                      : "bg-base-850 border-base-800 text-amber-200/60 hover:border-base-700"
                  }`}>
                  <span className="font-bold shrink-0 pt-0.5">{s.label}</span>
                  <span className="text-amber-200/60 text-left">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MARKETING & REGIONS TAB */}
      {activeTab === "marketing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-50 uppercase tracking-wider">Pricing, Volume & Margin</h3>
            <Slider label="Target MSRP Retail Price" value={config.targetPrice} min={5000} max={2000000} step={1000}
              onChange={v => setConfig(c => ({ ...c, targetPrice: v }))}
              format={v => `$${(v / 1000).toFixed(0)}k`} />
            <Slider label="Annual Planned Production Volume" value={config.targetVolume} min={100} max={500000} step={100}
              onChange={v => setConfig(c => ({ ...c, targetVolume: v }))}
              format={v => `${v.toLocaleString()} units/yr`} />
            <Slider label="Dealer Network Commission Margin" value={config.dealerMargin} min={0.03} max={0.20} step={0.01}
              onChange={v => setConfig(c => ({ ...c, dealerMargin: v }))}
              format={v => `${(v * 100).toFixed(0)}%`} />
            <Slider label="Global Marketing Campaign Budget" value={config.marketingBudget} min={0} max={20_000_000} step={100000}
              onChange={v => setConfig(c => ({ ...c, marketingBudget: v }))}
              format={v => fmt(v)} />
          </div>

          <div className="panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-50 uppercase tracking-wider">Global Target Regions & Warranty</h3>
            <div>
              <label className="label-mono block mb-2">Select Market Distribution Regions</label>
              <div className="grid grid-cols-2 gap-2">
                {REGIONS.map(r => (
                  <button key={r.value} onClick={() => toggleRegion(r.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      config.regions.includes(r.value)
                        ? "bg-accent-500/15 border-accent-500/40 text-accent-300"
                        : "bg-base-850 border-base-800 text-amber-200/60 hover:border-base-700"
                    }`}>
                    <Globe size={12} /> {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-base-800/80 pt-3 space-y-3">
              <Slider label="Warranty Duration (Years)" value={config.warrantyYears} min={1} max={10}
                onChange={v => setConfig(c => ({ ...c, warrantyYears: v }))} format={v => `${v} Years`} />
              <Slider label="Warranty Coverage Distance" value={config.warrantyMiles} min={12000} max={200000} step={5000}
                onChange={v => setConfig(c => ({ ...c, warrantyMiles: v }))}
                format={v => `${(v / 1000).toFixed(0)}k miles`} />
            </div>
          </div>
        </div>
      )}

      {/* 3. PRE-LAUNCH PROJECTIONS & LAUNCH ACTION */}
      {activeTab === "projection" && (
        <div className="space-y-4">
          <div className="panel p-5">
            <h3 className="text-xs font-bold text-amber-50 uppercase tracking-wider mb-4">Financial Projections & Break-Even</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-base-850 rounded-xl p-3.5 text-center border border-base-800">
                <div className="text-[10px] text-amber-300/50 uppercase font-mono mb-1">Est. Monthly Units</div>
                <div className="text-xl font-bold font-mono text-amber-50">{projection.monthlyUnits.toLocaleString()}</div>
              </div>
              <div className="bg-base-850 rounded-xl p-3.5 text-center border border-base-800">
                <div className="text-[10px] text-amber-300/50 uppercase font-mono mb-1">Est. Monthly Revenue</div>
                <div className="text-xl font-bold font-mono text-ok-400">{fmt(projection.monthlyRevenue)}</div>
              </div>
              <div className="bg-base-850 rounded-xl p-3.5 text-center border border-base-800">
                <div className="text-[10px] text-amber-300/50 uppercase font-mono mb-1">Est. Monthly Net Profit</div>
                <div className={`text-xl font-bold font-mono ${projection.monthlyProfit >= 0 ? "text-ok-400" : "text-danger-400"}`}>{fmt(projection.monthlyProfit)}</div>
              </div>
              <div className="bg-base-850 rounded-xl p-3.5 text-center border border-base-800">
                <div className="text-[10px] text-amber-300/50 uppercase font-mono mb-1">Break-Even Time</div>
                <div className="text-xl font-bold font-mono text-accent-300">
                  {projection.breakEvenMonths ? `${projection.breakEvenMonths} Months` : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="panel p-5">
            <h3 className="text-xs font-bold text-amber-50 uppercase tracking-wider mb-3">Launch Event Format</h3>
            <div className="space-y-2">
              {LAUNCH_EVENTS.map(e => (
                <button key={e.value} onClick={() => setConfig(c => ({ ...c, launchEvent: e.value as LaunchEventType }))}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs transition-all border ${
                    config.launchEvent === e.value
                      ? "bg-accent-500/15 border-accent-500/40 text-accent-300 font-bold"
                      : "bg-base-850 border-base-800 text-amber-200/60 hover:border-base-700"
                  }`}>
                  <span>{e.label}</span>
                  <span className="text-ok-400 font-mono font-bold">+{Math.round((e.boost - 1) * 100)}% Volume Boost</span>
                </button>
              ))}
            </div>
          </div>

          {!vehicle ? (
            <div className="panel p-6 text-center">
              <AlertTriangle size={24} className="mx-auto text-yellow-400 mb-2" />
              <p className="text-amber-200/60 text-sm font-medium">Select a vehicle model from the dropdown above to launch it to market.</p>
            </div>
          ) : vehicle.isLaunched ? (
            <div className="panel p-6 text-center border-ok-500/40 bg-ok-500/10">
              <CheckCircle2 size={28} className="mx-auto text-ok-400 mb-2" />
              <p className="text-ok-300 text-sm font-bold">{vehicle.name} is active on the global commercial market!</p>
              <p className="text-amber-200/60 text-xs mt-1">View revenue, profit, and monthly customer feedback in Tab 4 (Sales Dashboard).</p>
            </div>
          ) : (
            <div className="panel p-5 border-2 border-accent-500/40 bg-gradient-to-r from-accent-500/10 via-base-900 to-accent-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Rocket size={24} className="text-accent-400 shrink-0" />
                  <div>
                    <div className="text-base font-bold text-amber-50">{vehicle.name}</div>
                    <div className="text-xs text-amber-200/60 font-mono">{Math.round(vehicle.peakPower)}hp · {Math.round(vehicle.topSpeed)}km/h · Rating: {vehicle.overallRating}/100</div>
                  </div>
                </div>
              </div>
              <button onClick={handleLaunch}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-ok-500/30 via-emerald-500/20 to-ok-500/30 border border-ok-500/50 text-ok-300 hover:from-ok-500/40 hover:to-ok-500/40 transition-all text-sm font-bold shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <Rocket size={18} /> Official Commercial Market Launch ➔
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "dashboard" && (
        <div className="space-y-4">
          {/* All launched vehicles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {company.garage.filter(g => g.isLaunched).map(v => {
              const vSales = company.salesData[v.id] ?? [];
              const vRevenue = vSales.reduce((s, r) => s + r.revenue, 0);
              const vProfit = vSales.reduce((s, r) => s + r.profit, 0);
              const vUnits = vSales.reduce((s, r) => s + r.unitsSold, 0);
              const lastFb = (company.customerFeedback[v.id] ?? []).slice(-1)[0];
              return (
                <div key={v.id} onClick={() => setSelectedVehicleId(v.id)}
                  className={`panel p-4 cursor-pointer transition-all hover:border-base-700 ${selectedVehicleId === v.id ? "border-ok-500/50" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-amber-50">{v.name}</span>
                    <CheckCircle2 size={13} className="text-ok-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="bg-base-850 rounded p-1.5 text-center">
                      <div className="font-mono text-ok-400">{fmt(vRevenue)}</div>
                      <div className="text-amber-400 text-[9px]">Revenue</div>
                    </div>
                    <div className="bg-base-850 rounded p-1.5 text-center">
                      <div className={`font-mono ${vProfit >= 0 ? "text-ok-400" : "text-danger-400"}`}>{fmt(vProfit)}</div>
                      <div className="text-amber-400 text-[9px]">Profit</div>
                    </div>
                    <div className="bg-base-850 rounded p-1.5 text-center">
                      <div className="font-mono text-amber-50">{vUnits.toLocaleString()}</div>
                      <div className="text-amber-400 text-[9px]">Units</div>
                    </div>
                    <div className="bg-base-850 rounded p-1.5 text-center">
                      <div className="font-mono text-accent-300">{lastFb?.satisfaction ?? "—"}</div>
                      <div className="text-amber-400 text-[9px]">Satisfaction</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected vehicle detail */}
          {selectedVehicleId && salesHistory.length > 0 && (
            <div className="panel p-4">
              <h3 className="text-xs font-semibold text-amber-100/80 uppercase tracking-wider mb-3">Period Sales Performance</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-base-800">
                    <th className="text-left px-2 py-2 text-amber-300/50 font-mono">Month</th>
                    <th className="text-right px-2 py-2 text-amber-300/50 font-mono">Units</th>
                    <th className="text-right px-2 py-2 text-amber-300/50 font-mono">Revenue</th>
                    <th className="text-right px-2 py-2 text-amber-300/50 font-mono">Profit</th>
                    <th className="text-right px-2 py-2 text-amber-300/50 font-mono">Market Share</th>
                  </tr>
                </thead>
                <tbody>
                  {salesHistory.map((r, i) => (
                    <tr key={i} className="border-b border-base-800/50 hover:bg-base-850/30">
                      <td className="px-2 py-2 font-mono text-amber-200/60">{r.month}</td>
                      <td className="px-2 py-2 text-right font-mono text-amber-50">{r.unitsSold.toLocaleString()}</td>
                      <td className="px-2 py-2 text-right font-mono text-ok-400">{fmt(r.revenue)}</td>
                      <td className={`px-2 py-2 text-right font-mono ${r.profit >= 0 ? "text-ok-400" : "text-danger-400"}`}>{fmt(r.profit)}</td>
                      <td className="px-2 py-2 text-right font-mono text-amber-200/60">{(r.marketShare * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-base-700">
                  <tr>
                    <td className="px-2 py-2 text-xs font-semibold text-amber-100/80">TOTAL</td>
                    <td className="px-2 py-2 text-right font-mono font-bold text-amber-50">{totalUnits.toLocaleString()}</td>
                    <td className="px-2 py-2 text-right font-mono font-bold text-ok-400">{fmt(totalRevenue)}</td>
                    <td className={`px-2 py-2 text-right font-mono font-bold ${totalProfit >= 0 ? "text-ok-400" : "text-danger-400"}`}>{fmt(totalProfit)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {company.garage.filter(g => g.isLaunched).length === 0 && (
            <div className="panel p-10 text-center">
              <DollarSign size={36} className="mx-auto text-amber-500 mb-3" />
              <p className="text-amber-300/50 text-sm">No launched vehicles yet.</p>
              <p className="text-xs text-amber-400 mt-1">Go to the Launch tab to bring a vehicle to market.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
