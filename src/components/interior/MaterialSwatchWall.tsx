/**
 * ============================================================================
 * MODULAR INTERIOR STUDIO — 3D MATERIAL SWATCH WALL (UNIFIED)
 * ============================================================================
 */

import React from "react";
import {
  LuxuryMaterialSwatchWall,
  LUXURY_MATERIAL_CATALOG,
  type MaterialSwatchItem,
} from "./LuxuryMaterialSwatchWall";
import type { InteriorMaterialType } from "../../sim/interior/masterInteriorTypes";

export interface MaterialOptionDef extends MaterialSwatchItem {
  badge?: string;
  colorHex?: string;
  clearcoat?: number;
}

export const MATERIAL_SWATCH_CATALOG = LUXURY_MATERIAL_CATALOG;

export interface MaterialSwatchWallProps {
  activeMaterial: InteriorMaterialType;
  onSelectMaterial: (mat: InteriorMaterialType) => void;
  targetLayerLabel?: string;
}

export const MaterialSwatchWall: React.FC<MaterialSwatchWallProps> = ({
  activeMaterial,
  onSelectMaterial,
  targetLayerLabel = "PRIMARY UPHOLSTERY",
}) => {
  return (
    <LuxuryMaterialSwatchWall
      activeMaterial={activeMaterial}
      onSelectMaterial={onSelectMaterial}
      targetLayerLabel={targetLayerLabel}
    />
  );
};
