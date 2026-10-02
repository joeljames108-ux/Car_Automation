// ===================================================================
// SUPPLY CHAIN & PROCUREMENT WORKSHOP UI PANEL
// ===================================================================
// Continuous 6-level physical flow: Ores → Smelting → Formed Stocks →
// Discrete Components → Subassemblies → Vehicle Assembly → B2B Supply.
// ===================================================================

import React from "react";
import { TradePage } from "./trade/TradePage";
import type { Stage } from "./StageSwitcher";

interface SupplyChainWorkshopProps {
  onSelectStage?: (stage: Stage) => void;
}

export const SupplyChainWorkshop: React.FC<SupplyChainWorkshopProps> = ({ onSelectStage }) => {
  return <TradePage onSelectStage={onSelectStage} />;
};
