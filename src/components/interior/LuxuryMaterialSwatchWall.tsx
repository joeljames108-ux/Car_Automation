/**
 * ============================================================================
 * LUXURY MATERIAL SWATCH WALL & COLOR STUDIO
 * ============================================================================
 * Premium 3D-styled physical material swatches with dynamic specular lighting:
 * - Ultra-Luxury Nappa & Semi-Aniline Leather Collection
 * - Perforated & Racing Alcantara Suedes
 * - 3K Twill & Forged Carbon Composites
 * - Billet Aluminum, Titanium & Open-Pore Exotic Woods
 * - Contrast Stitching Thread Studio
 * ============================================================================
 */

import React from "react";
import { Sparkles, Check, Palette } from "lucide-react";
import { InteriorMaterialType } from "../../sim/interior/masterInteriorTypes";

export interface MaterialSwatchItem {
  id: InteriorMaterialType;
  name: string;
  category: "leather" | "alcantara" | "carbon" | "metal" | "wood";
  previewGradient: string;
  roughness: number;
  metalness: number;
  description: string;
  premiumCostUSD: number;
}

export const LUXURY_MATERIAL_CATALOG: MaterialSwatchItem[] = [
  // Leather
  {
    id: "nappa_leather",
    name: "Obsidian Black Nappa",
    category: "leather",
    previewGradient: "radial-gradient(circle at 35% 35%, #334155 0%, #1a1008 70%, #020617 100%)",
    roughness: 0.65,
    metalness: 0.1,
    description: "Ultra-fine grain bovine leather with natural breathable finish",
    premiumCostUSD: 1800,
  },
  {
    id: "semi_aniline_leather",
    name: "Cognac Semi-Aniline Leather",
    category: "leather",
    previewGradient: "radial-gradient(circle at 35% 35%, #d97706 0%, #92400e 70%, #451a03 100%)",
    roughness: 0.55,
    metalness: 0.05,
    description: "Supple hand-selected hides finished with protective micro-pigment",
    premiumCostUSD: 4200,
  },
  // Alcantara
  {
    id: "perforated_alcantara",
    name: "Anthracite Racing Alcantara",
    category: "alcantara",
    previewGradient: "radial-gradient(circle at 35% 35%, #52525b 0%, #27272a 70%, #18181b 100%)",
    roughness: 0.9,
    metalness: 0.02,
    description: "High-grip microfibre suede engineered for motorsport cockpits",
    premiumCostUSD: 2800,
  },
  // Carbon
  {
    id: "3k_twill_carbon_fiber",
    name: "3K Twill Carbon Weave",
    category: "carbon",
    previewGradient: "radial-gradient(circle at 35% 35%, #475569 0%, #1e293b 50%, #090d16 100%)",
    roughness: 0.25,
    metalness: 0.8,
    description: "Autoclave-cured 2x2 twill weave with high-gloss mirror resin",
    premiumCostUSD: 5600,
  },
  {
    id: "forged_carbon_composite",
    name: "Forged Carbon Marble",
    category: "carbon",
    previewGradient: "radial-gradient(circle at 35% 35%, #64748b 0%, #334155 45%, #1a1008 100%)",
    roughness: 0.35,
    metalness: 0.75,
    description: "Compression-moulded chopped carbon strand mosaic",
    premiumCostUSD: 4800,
  },
  // Metals
  {
    id: "brushed_billet_aluminum",
    name: "CNC Brushed Billet Aluminum",
    category: "metal",
    previewGradient: "radial-gradient(circle at 35% 35%, #f1f5f9 0%, #94a3b8 60%, #475569 100%)",
    roughness: 0.3,
    metalness: 0.95,
    description: "Anisotropic linear brushed aircraft-grade 6061-T6 alloy",
    premiumCostUSD: 1400,
  },
  {
    id: "titanium_satin_finish",
    name: "Titanium Satin Gray",
    category: "metal",
    previewGradient: "radial-gradient(circle at 35% 35%, #cbd5e1 0%, #64748b 60%, #334155 100%)",
    roughness: 0.4,
    metalness: 0.9,
    description: "Micro-bead blasted Grade 5 titanium with warm satin sheen",
    premiumCostUSD: 2400,
  },
  // Wood
  {
    id: "open_pore_walnut",
    name: "Open-Pore Dark Walnut",
    category: "wood",
    previewGradient: "radial-gradient(circle at 35% 35%, #b45309 0%, #78350f 60%, #291104 100%)",
    roughness: 0.6,
    metalness: 0.0,
    description: "Sustainably harvested architectural crown-cut walnut veneer",
    premiumCostUSD: 2200,
  },
  {
    id: "piano_black_lacquer",
    name: "Deep Piano Black Lacquer",
    category: "wood",
    previewGradient: "radial-gradient(circle at 35% 35%, #1e293b 0%, #090d16 70%, #000000 100%)",
    roughness: 0.1,
    metalness: 0.2,
    description: "Multi-coat polished high-gloss lacquer mirror finish",
    premiumCostUSD: 950,
  },
];

export const CONTRAST_STITCHING_COLORS = [
  { name: "Guards Red", hex: "#ef4444" },
  { name: "Racing Yellow", hex: "#eab308" },
  { name: "Miami Blue", hex: "#f59e0b" },
  { name: "Acid Green", hex: "#84cc16" },
  { name: "Chalk White", hex: "#f8fafc" },
  { name: "Burnt Orange", hex: "#f97316" },
  { name: "Amethyst Purple", hex: "#f59e0b" },
  { name: "Stealth Black", hex: "#1a1008" },
];

export interface LuxuryMaterialSwatchWallProps {
  selectedMaterial?: InteriorMaterialType;
  activeMaterial?: InteriorMaterialType;
  selectedStitchColorHex?: string;
  onSelectMaterial: (mat: InteriorMaterialType) => void;
  onSelectStitchColor?: (hex: string) => void;
  targetLayerLabel?: string;
}

export const LuxuryMaterialSwatchWall: React.FC<LuxuryMaterialSwatchWallProps> = ({
  selectedMaterial,
  activeMaterial,
  selectedStitchColorHex,
  onSelectMaterial,
  onSelectStitchColor,
  targetLayerLabel,
}) => {
  const currentMaterial = selectedMaterial ?? activeMaterial ?? "nappa_leather";
  return (
    <div className="space-y-4 text-xs font-mono">
      {/* Material Swatch Spheres Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-slate-200 font-bold flex items-center gap-1.5">
            <Palette size={14} style={{color: '#92400E'}} />
            <span>PHYSICAL MATERIAL SWATCHES</span>
          </label>
          <span className="text-[10px] font-mono" style={{color: '#92400E', opacity: 0.7}}>PBR Shaders</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {LUXURY_MATERIAL_CATALOG.map((mat) => {
            const isSelected = currentMaterial === mat.id;
            return (
              <button
                key={mat.id}
                onClick={() => onSelectMaterial(mat.id)}
                className={`group relative p-2.5 rounded-xl text-left border transition-all overflow-hidden ${
                  isSelected
                    ? "border-amber-400 shadow-[0_0_15px_rgba(217,166,78,0.3)]"
                    : "bg-white/50 border-amber-200/60 hover:border-amber-300 hover:bg-amber-50/50"
                }`}
              >
                {/* 3D Material Sphere Preview with Specular Highlight */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-9 h-9 rounded-full shadow-lg border border-white/20 flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform"
                    style={{ background: mat.previewGradient }}
                  >
                    {/* Simulated Specular Highlight Point */}
                    <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-white/40 blur-[1px]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate text-[11px]" style={{color: '#451A03'}}>{mat.name}</div>
                    <div className="text-[9px] capitalize" style={{color: '#92400E'}}>{mat.category}</div>
                  </div>
                </div>

                <div className="text-[10px] line-clamp-2 leading-tight" style={{color: '#78716C'}}>
                  {mat.description}
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 p-0.5 rounded-full" style={{backgroundColor: '#D9A64E', color: 'white'}}>
                    <Check size={10} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contrast Stitching Studio */}
      {selectedStitchColorHex && onSelectStitchColor && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-slate-200 font-bold flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              <span>CONTRAST STITCHING THREAD</span>
            </label>
            <span className="text-[10px] text-amber-400 font-mono">French Double Stitch</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {CONTRAST_STITCHING_COLORS.map((stitch) => {
              const isSelected = selectedStitchColorHex.toLowerCase() === stitch.hex.toLowerCase();
              return (
                <button
                  key={stitch.hex}
                  onClick={() => onSelectStitchColor(stitch.hex)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "bg-slate-950 border-amber-400 shadow-sm"
                      : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                  }`}
                >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0 shadow-inner"
                  style={{ backgroundColor: stitch.hex }}
                />
                <span className="text-[10px] font-bold text-slate-200 truncate">{stitch.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
};
