// ===================================================================
// AI RIVAL OEM MARKET COMPETITION DASHBOARD
// ===================================================================
// Interactive Vision Glass dashboard displaying global market share,
// Multinomial Logit consumer choice results, and revenue per price tier.
// ===================================================================

import React, { useState } from "react";
import { OemMarketCompetitionSimulator, MASTER_RIVAL_OEMS, MarketShareEntry } from "../../sim/market/oemMarketCompetitionSimulator";
import { PriceTierId, MASTER_PRICE_TIERS } from "../../sim/taxonomies/priceTierTaxonomy";
import { UtilityClassId, MASTER_UTILITY_CLASSES } from "../../sim/taxonomies/utilityClassTaxonomy";
import { Globe, DollarSign, TrendingUp, Users, Award, ShieldAlert } from "lucide-react";

export const OemMarketCompetitionDashboard: React.FC = () => {
  const [selectedPriceTier, setSelectedPriceTier] = useState<PriceTierId>("SUPERCAR_TRACK");
  const [selectedUtilityClass, setSelectedUtilityClass] = useState<UtilityClassId>("GT3_RACE_CAR");

  const [playerPriceUSD, setPlayerPriceUSD] = useState<number>(320000);
  const [playerHp, setPlayerHp] = useState<number>(750);
  const [playerPrestige, setPlayerPrestige] = useState<number>(94);

  const marketResults: MarketShareEntry[] = OemMarketCompetitionSimulator.simulateSegmentMarket({
    priceTier: selectedPriceTier,
    utilityClass: selectedUtilityClass,
    userDesignPriceUSD: playerPriceUSD,
    userDesignHp: playerHp,
    userDesignPrestige: playerPrestige,
    totalSegmentMonthlyDemandUnits: 500,
  });

  const playerShare = marketResults.find((m) => m.oemId === "user_oem");

  return (
    <div className="space-y-6 text-amber-50">
      {/* Top Banner */}
      <div className="bg-amber-900/40 backdrop-blur-xl p-6 rounded-2xl border border-amber-800/30 flex items-center justify-between shadow-xl">
        <div>
          <h2 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-500">
            GLOBAL AUTOMOTIVE OEM MARKET COMPETITION
          </h2>
          <p className="text-xs text-amber-200/60 mt-1">
            Multinomial Logit consumer choice modeling across 9 Price Tiers & 25 Utility Classes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-mono font-bold text-xs">
            SEGMENT DEMAND: 500 UNITS/MO
          </div>
        </div>
      </div>

      {/* Segment Selectors & Controls */}
      <div className="bg-amber-900/40 p-5 rounded-2xl border border-amber-800/30 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="text-xs text-amber-200/60 font-bold block mb-2">PRICE TIER SEGMENT:</label>
          <select
            value={selectedPriceTier}
            onChange={(e) => setSelectedPriceTier(e.target.value as PriceTierId)}
            className="w-full bg-amber-950/80 text-amber-50 text-xs rounded-xl p-2.5 border border-amber-700/30 font-mono outline-none"
          >
            {Object.keys(MASTER_PRICE_TIERS).map((key) => (
              <option key={key} value={key}>
                {MASTER_PRICE_TIERS[key as PriceTierId].displayName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-amber-200/60 font-bold block mb-2">UTILITY CLASS BODY:</label>
          <select
            value={selectedUtilityClass}
            onChange={(e) => setSelectedUtilityClass(e.target.value as UtilityClassId)}
            className="w-full bg-amber-950/80 text-amber-50 text-xs rounded-xl p-2.5 border border-amber-700/30 font-mono outline-none"
          >
            {Object.keys(MASTER_UTILITY_CLASSES).map((key) => (
              <option key={key} value={key}>
                {MASTER_UTILITY_CLASSES[key as UtilityClassId].displayName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-amber-200/60 font-bold block mb-2">PLAYER MSRP PRICE ($):</label>
          <input
            type="number"
            step={5000}
            value={playerPriceUSD}
            onChange={(e) => setPlayerPriceUSD(Number(e.target.value))}
            className="w-full bg-amber-950/80 text-amber-50 text-xs rounded-xl p-2.5 border border-amber-700/30 font-mono outline-none"
          />
        </div>
      </div>

      {/* Player OEM Performance Summary */}
      {playerShare && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30">
            <div className="text-xs text-amber-200/60 font-semibold flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>PLAYER MARKET SHARE</span>
            </div>
            <div className="text-2xl font-mono font-black text-emerald-400 mt-2">
              {playerShare.marketSharePct}%
            </div>
            <div className="text-[11px] text-amber-300/50 mt-1">{playerShare.monthlyUnitSales} units / month</div>
          </div>

          <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30">
            <div className="text-xs text-amber-200/60 font-semibold flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>MONTHLY GROSS REVENUE</span>
            </div>
            <div className="text-2xl font-mono font-black text-amber-400 mt-2">
              ${(playerShare.grossRevenueUSD / 1e6).toFixed(2)}M
            </div>
            <div className="text-[11px] text-amber-300/50 mt-1">${playerPriceUSD.toLocaleString()} MSRP</div>
          </div>

          <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30">
            <div className="text-xs text-amber-200/60 font-semibold flex items-center space-x-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>CUSTOMER SATISFACTION</span>
            </div>
            <div className="text-2xl font-mono font-black text-amber-400 mt-2">
              {playerShare.customerSatisfactionScore}%
            </div>
            <div className="text-[11px] text-amber-300/50 mt-1">High satisfaction grade</div>
          </div>

          <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30">
            <div className="text-xs text-amber-200/60 font-semibold flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>BRAND PRESTIGE</span>
            </div>
            <div className="text-2xl font-mono font-black text-amber-400 mt-2">{playerPrestige} / 100</div>
            <div className="text-[11px] text-amber-300/50 mt-1">Tier 1 Heritage Rating</div>
          </div>
        </div>
      )}

      {/* Competitor Market Share Breakdown */}
      <div className="bg-amber-900/40 p-5 rounded-2xl border border-amber-800/30 space-y-4">
        <h3 className="text-sm font-bold text-amber-50">SEGMENT COMPETITOR MARKET SHARE SPLIT</h3>
        <div className="space-y-3">
          {marketResults.map((entry) => (
            <div key={entry.oemId} className="bg-amber-950/80 p-4 rounded-xl border border-amber-800/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${entry.oemId === "user_oem" ? "bg-emerald-400" : "bg-amber-500"}`} />
                  <span className="text-xs font-bold text-white">{entry.oemName}</span>
                </div>
                <span className="text-xs font-mono font-black text-emerald-400">{entry.marketSharePct}% Share</span>
              </div>

              <div className="w-full bg-amber-900/50 h-2.5 rounded-full overflow-hidden border border-amber-800/30">
                <div
                  className={`h-full transition-all duration-500 ${entry.oemId === "user_oem" ? "bg-emerald-500" : "bg-amber-600"}`}
                  style={{ width: `${entry.marketSharePct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-amber-200/60 font-mono pt-1">
                <span>Monthly Sales: {entry.monthlyUnitSales} units</span>
                <span>Revenue: ${(entry.grossRevenueUSD / 1e6).toFixed(2)}M</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
