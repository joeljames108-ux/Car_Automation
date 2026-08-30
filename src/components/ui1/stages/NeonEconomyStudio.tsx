import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Globe,
  Truck,
  Layers,
  PieChart,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonEconomyStudio() {
  const { sim, design } = useDesign();

  const [productionTarget, setProductionTarget] = useState(500); // units/year
  const [markupPercent, setMarkupPercent] = useState(45); // %

  const bomItems = [
    { category: "Carbon Fiber Monocoque & Crash Box", supplier: "Toray Composites (Japan)", cost: "$42,000", leadTime: "18 days" },
    { category: "Bespoke Powertrain & Turbocharging", supplier: "Cosworth Engineering (UK)", cost: "$68,500", leadTime: "24 days" },
    { category: "800V SiC Inverter & Cell Pack", supplier: "Rimac Technology (Croatia)", cost: "$38,000", leadTime: "14 days" },
    { category: "Carbon Ceramic Brembo Brakes & Monoblocs", supplier: "Brembo Racing (Italy)", cost: "$16,200", leadTime: "10 days" },
    { category: "Active Aerodynamic Hydraulics & DRS", supplier: "Multimatic Dynamics (Canada)", cost: "$14,800", leadTime: "12 days" },
    { category: "Alcantara & Carbon Cockpit Trim", supplier: "Poltrona Frau (Italy)", cost: "$11,500", leadTime: "8 days" },
  ];

  const totalUnitBOM = 191000;
  const suggestedMsrp = Math.round(totalUnitBOM * (1 + markupPercent / 100));
  const annualGrossProfit = Math.round((suggestedMsrp - totalUnitBOM) * productionTarget);

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "GLOBAL SUPPLY CHAIN & BOM COST ENGINE",
          subtitle: "Tier-1 component procurement logistics, unit bill of materials, and financial margins",
          icon: <Globe size={18} />,
          badge: <NeonHorizonBadge variant="live">GROSS MARGIN: {markupPercent}%</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="TOTAL UNIT BOM COST" value={`$${(totalUnitBOM / 1000).toFixed(0)}k`} accentColor="cyan" />
          <NeonHorizonDataCard label="RECOMMENDED MSRP" value={`$${(suggestedMsrp / 1000).toFixed(0)}k`} accentColor="gold" />
          <NeonHorizonDataCard label="ANNUAL PRODUCTION" value={productionTarget} unit="Units" accentColor="magenta" />
          <NeonHorizonDataCard label="EST. ANNUAL GROSS YIELD" value={`$${(annualGrossProfit / 1000000).toFixed(1)}M`} accentColor="emerald" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left BOM Breakdown (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "HIERARCHICAL BILL OF MATERIALS (BOM)",
              icon: <Layers size={16} />,
            }}
            className="p-6 flex flex-col gap-3"
          >
            {bomItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-50">{item.category}</span>
                  <span className="text-xs font-bold nh-font-mono text-sky-300">{item.cost}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] nh-font-mono text-amber-200/60">
                  <span>{item.supplier}</span>
                  <span className="text-amber-300">Lead: {item.leadTime}</span>
                </div>
              </div>
            ))}
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Financial Sliders & Margins (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "PRICING & LOGISTICS MODEL",
              icon: <TrendingUp size={16} />,
            }}
            className="p-6 flex flex-col gap-5"
          >
            <NeonHorizonSlider
              label="TARGET GROSS MARKUP"
              value={markupPercent}
              min={15}
              max={80}
              unit="%"
              onChange={setMarkupPercent}
              color="cyan"
            />

            <NeonHorizonSlider
              label="ANNUAL PRODUCTION VOLUME"
              value={productionTarget}
              min={50}
              max={2500}
              step={50}
              unit="Units"
              onChange={setProductionTarget}
              color="magenta"
            />

            <div className="p-4 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-200/60">Unit Profit:</span>
                <span className="text-xs font-bold nh-font-mono text-emerald-300">
                  +${((suggestedMsrp - totalUnitBOM) / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-200/60">Break-Even Volume:</span>
                <span className="text-xs font-bold nh-font-mono text-amber-300">82 Units</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-200/60">Average Transit Time:</span>
                <span className="text-xs font-bold nh-font-mono text-sky-300">14.3 Days</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
