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
  const [activeTab, setActiveTab] = useState<"position" | "marketing" | "projection">("position");
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
  }

  const tabs = [
    { id: "position"   as const, label: "1. Market & Positioning" },
    { id: "marketing"  as const, label: "2. Marketing & Regions" },
    { id: "projection" as const, label: "3. Pre-Launch Projections" },
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
              <h2 className="text-lg font-bold text-slate-100">Sales & Launch</h2>
              <p className="text-xs text-slate-500">Market positioning, pricing strategy, launch events, and revenue tracking</p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold font-mono text-ok-400">{fmt(company.totalRevenue)}</div>
              <div className="text-[10px] text-slate-600">Total Revenue</div>
            </div>
            <div>
              <div className={`text-xl font-bold font-mono ${company.totalProfit >= 0 ? "text-ok-400" : "text-danger-400"}`}>{fmt(company.totalProfit)}</div>
              <div className="text-[10px] text-slate-600">Total Profit</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-accent-300">{company.garage.filter(g => g.isLaunched).length}</div>
              <div className="text-[10px] text-slate-600">Active Models</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle selector */}
      <div className="panel p-4">
        <label className="label-mono block mb-2">Vehicle</label>
        <select value={selectedVehicleId || ""}
          onChange={e => setSelectedVehicleId(e.target.value || null)}
          className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none">
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
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === t.id ? "bg-accent-500/20 text-accent-300" : "text-slate-400 hover:text-slate-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. MARKET & POSITIONING TAB */}
      {activeTab === "position" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="panel p-5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">1. Market Segment Target</h3>
            <p className="text-xs text-slate-500 mb-3">Select the primary buyer demographic and vehicle price bracket for your model.</p>
            <div className="space-y-2">
              {SEGMENTS.map(s => (
                <button key={s.value} onClick={() => setConfig(c => ({ ...c, marketSegment: s.value as MarketSegmentTarget }))}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all border ${
                    config.marketSegment === s.value
                      ? "bg-accent-500/15 border-accent-500/40 text-accent-300 font-semibold"
                      : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
                  }`}>
                  <span>{s.label}</span>
                  <span className="text-xs font-mono text-slate-500">{s.priceRange}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">2. Strategic Pricing Philosophy</h3>
            <div className="space-y-2">
              {PRICING_STRATEGIES.map(s => (
                <button key={s.value} onClick={() => setConfig(c => ({ ...c, pricingStrategy: s.value as PricingStrategy }))}
                  className={`w-full flex items-start gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all border ${
                    config.pricingStrategy === s.value
                      ? "bg-accent-500/15 border-accent-500/40 text-accent-300"
                      : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
                  }`}>
                  <span className="font-bold shrink-0 pt-0.5">{s.label}</span>
                  <span className="text-slate-400 text-left">{s.desc}</span>
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
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Pricing, Volume & Margin</h3>
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
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Global Target Regions & Warranty</h3>
            <div>
              <label className="label-mono block mb-2">Select Market Distribution Regions</label>
              <div className="grid grid-cols-2 gap-2">
                {REGIONS.map(r => (
                  <button key={r.value} onClick={() => toggleRegion(r.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      config.regions.includes(r.value)
                        ? "bg-accent-500/15 border-accent-500/40 text-accent-300"
                        : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
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
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Financial Projections & Break-Even</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-base-850 rounded-xl p-3.5 text-center border border-base-800">
                <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Est. Monthly Units</div>
                <div className="text-xl font-bold font-mono text-slate-200">{projection.monthlyUnits.toLocaleString()}</div>
              </div>
              <div className="bg-base-850 rounded-xl p-3.5 text-center border border-base-800">
                <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Est. Monthly Revenue</div>
                <div className="text-xl font-bold font-mono text-ok-400">{fmt(projection.monthlyRevenue)}</div>
              </div>
              <div className="bg-base-850 rounded-xl p-3.5 text-center border border-base-800">
                <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Est. Monthly Net Profit</div>
                <div className={`text-xl font-bold font-mono ${projection.monthlyProfit >= 0 ? "text-ok-400" : "text-danger-400"}`}>{fmt(projection.monthlyProfit)}</div>
              </div>
              <div className="bg-base-850 rounded-xl p-3.5 text-center border border-base-800">
                <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Break-Even Time</div>
                <div className="text-xl font-bold font-mono text-accent-300">
                  {projection.breakEvenMonths ? `${projection.breakEvenMonths} Months` : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="panel p-5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Launch Event Format</h3>
            <div className="space-y-2">
              {LAUNCH_EVENTS.map(e => (
                <button key={e.value} onClick={() => setConfig(c => ({ ...c, launchEvent: e.value as LaunchEventType }))}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs transition-all border ${
                    config.launchEvent === e.value
                      ? "bg-accent-500/15 border-accent-500/40 text-accent-300 font-bold"
                      : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
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
              <p className="text-slate-400 text-sm font-medium">Select a vehicle model from the dropdown above to launch it to market.</p>
            </div>
          ) : vehicle.isLaunched ? (
            <div className="panel p-6 text-center border-ok-500/40 bg-ok-500/10">
              <CheckCircle2 size={28} className="mx-auto text-ok-400 mb-2" />
              <p className="text-ok-300 text-sm font-bold">{vehicle.name} is active on the global commercial market!</p>
              <p className="text-slate-400 text-xs mt-1">Commercial market launch is active. Market positioning and distribution live.</p>
            </div>
          ) : (
            <div className="panel p-5 border-2 border-accent-500/40 bg-gradient-to-r from-accent-500/10 via-base-900 to-accent-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Rocket size={24} className="text-accent-400 shrink-0" />
                  <div>
                    <div className="text-base font-bold text-slate-100">{vehicle.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{Math.round(vehicle.peakPower)}hp · {Math.round(vehicle.topSpeed)}km/h · Rating: {vehicle.overallRating}/100</div>
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
    </div>
  );
}
