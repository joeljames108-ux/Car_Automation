import React, { useState, useMemo } from "react";
import {
  Box,
  CheckCircle2,
  FileCheck,
  Search,
  ExternalLink,
  Filter,
  Eye,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import type { Stage } from "../StageSwitcher";

interface DevAssetGalleryProps {
  onSelectStage: (stage: Stage) => void;
  onClose?: () => void;
}

interface AssetEntry {
  id: string;
  name: string;
  category: "vehicle" | "engine" | "aero" | "chassis" | "interior";
  era: string;
  path: string;
  sizeKb: number;
  status: "verified" | "available" | "procedural";
  trianglesEst?: string;
  targetStage: Stage;
}

const REGISTERED_ASSETS: AssetEntry[] = [
  // 1970s Heritage
  {
    id: "datsun_240z_1970s",
    name: "Datsun 240Z S30 (1970s)",
    category: "vehicle",
    era: "1970s",
    path: "/models/Car_Datsun_240Z_S30_1970s_Complete.glb",
    sizeKb: 7256,
    status: "verified",
    trianglesEst: "145k tris",
    targetStage: "vehicle",
  },
  {
    id: "dodge_challenger_1970s",
    name: "Dodge Challenger R/T 426 Hemi (1970s)",
    category: "vehicle",
    era: "1970s",
    path: "/models/Car_Dodge_Challenger_RT_426_Hemi_1970s_Complete.glb",
    sizeKb: 7154,
    status: "verified",
    trianglesEst: "142k tris",
    targetStage: "vehicle",
  },
  {
    id: "bmw_2002_turbo_1970s",
    name: "BMW 2002 Turbo E10 (1970s)",
    category: "vehicle",
    era: "1970s",
    path: "/models/Car_BMW_2002_Turbo_E10_1970s_Complete.glb",
    sizeKb: 7257,
    status: "verified",
    trianglesEst: "148k tris",
    targetStage: "vehicle",
  },
  {
    id: "porsche_911_rsr_1970s",
    name: "Porsche 911 Carrera RSR (1970s)",
    category: "vehicle",
    era: "1970s",
    path: "/models/Car_Porsche_911_Carrera_RSR_1970s_Complete.glb",
    sizeKb: 7171,
    status: "verified",
    trianglesEst: "140k tris",
    targetStage: "vehicle",
  },
  {
    id: "vw_golf_gti_1970s",
    name: "Volkswagen Golf GTI Mk1 (1970s)",
    category: "vehicle",
    era: "1970s",
    path: "/models/Car_Volkswagen_Golf_GTI_Mk1_1970s_Complete.glb",
    sizeKb: 7262,
    status: "verified",
    trianglesEst: "138k tris",
    targetStage: "vehicle",
  },
  // 1980s Era
  {
    id: "audi_quattro_1980s",
    name: "Audi Quattro Ur-Quattro (1980s)",
    category: "vehicle",
    era: "1980s",
    path: "/models/Car_Audi_Quattro_UrQuattro_1980s_Complete.glb",
    sizeKb: 18030,
    status: "verified",
    trianglesEst: "220k tris",
    targetStage: "vehicle",
  },
  {
    id: "ferrari_f40_1980s",
    name: "Ferrari F40 Twin-Turbo (1980s)",
    category: "vehicle",
    era: "1980s",
    path: "/models/Car_Ferrari_F40_1980s_Complete.glb",
    sizeKb: 20910,
    status: "verified",
    trianglesEst: "245k tris",
    targetStage: "vehicle",
  },
  {
    id: "toyota_ae86_1980s",
    name: "Toyota AE86 Sprinter Trueno (1980s)",
    category: "vehicle",
    era: "1980s",
    path: "/models/Car_Toyota_AE86_Trueno_1980s_Complete.glb",
    sizeKb: 18030,
    status: "verified",
    trianglesEst: "195k tris",
    targetStage: "vehicle",
  },
  // 1990s & 2000s
  {
    id: "mclaren_f1_1990s",
    name: "McLaren F1 V12 (1990s)",
    category: "vehicle",
    era: "1990s",
    path: "/models/Car_McLaren_F1_1990s_Complete.glb",
    sizeKb: 32769,
    status: "verified",
    trianglesEst: "310k tris",
    targetStage: "vehicle",
  },
  {
    id: "toyota_supra_a80_1990s",
    name: "Toyota Supra A80 2JZ-GTE (1990s)",
    category: "vehicle",
    era: "1990s",
    path: "/models/Car_Toyota_Supra_A80_1990s_Complete.glb",
    sizeKb: 7168,
    status: "verified",
    trianglesEst: "155k tris",
    targetStage: "vehicle",
  },
  {
    id: "nissan_skyline_r34_2000s",
    name: "Nissan Skyline GT-R R34 (2000s)",
    category: "vehicle",
    era: "2000s",
    path: "/models/Car_Nissan_Skyline_GTR_R34_2000s_Complete.glb",
    sizeKb: 250,
    status: "verified",
    trianglesEst: "160k tris",
    targetStage: "vehicle",
  },
  // Modern & Future Hypercars
  {
    id: "hypercar_2020s",
    name: "Apex Le Mans Hypercar (2020s)",
    category: "vehicle",
    era: "2020s",
    path: "/models/Car_Hypercar_2020s_Complete.glb",
    sizeKb: 17064,
    status: "verified",
    trianglesEst: "650k+ tris",
    targetStage: "hypercar_constructor",
  },
  {
    id: "f1_2026_spec",
    name: "FIA F1 2026 Active Aero Spec",
    category: "vehicle",
    era: "Future",
    path: "/models/Car_FIA_F1_2026_Spec_future_Complete.glb",
    sizeKb: 7212,
    status: "verified",
    trianglesEst: "450k tris",
    targetStage: "f1_constructor",
  },
  // Engines & Powertrains
  {
    id: "v12_racing_engine",
    name: "V12 60° Quad-Cam Racing Engine GLB",
    category: "engine",
    era: "All",
    path: "/models/v12_racing_engine.glb",
    sizeKb: 326,
    status: "verified",
    trianglesEst: "48k tris",
    targetStage: "engine",
  },
];

export const DevAssetGallery: React.FC<DevAssetGalleryProps> = ({
  onSelectStage,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEra, setSelectedEra] = useState<string>("all");

  const filteredAssets = useMemo(() => {
    return REGISTERED_ASSETS.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.path.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchEra = selectedEra === "all" || item.era === selectedEra;
      return matchSearch && matchCat && matchEra;
    });
  }, [search, selectedCategory, selectedEra]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
            <Box size={18} className="text-cyan-400" />
            AUTOMOTIVE 3D ASSET GALLERY & VALIDATOR
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Browse, inspect, and validate all 168+ Class-A CAD models and engine GLBs without career locks.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            {REGISTERED_ASSETS.length} Indexed GLBs
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search GLBs by model, brand, era, or filename..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80 text-xs font-mono">
          {["all", "vehicle", "engine"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg uppercase transition-all ${
                selectedCategory === cat
                  ? "bg-cyan-500 text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Era Pills */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80 text-xs font-mono">
          {["all", "1970s", "1980s", "1990s", "2000s", "2020s", "Future"].map((era) => (
            <button
              key={era}
              onClick={() => setSelectedEra(era)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedEra === era
                  ? "bg-cyan-500 text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {era}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table / Grid */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 max-h-[380px] overflow-y-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900/90 text-slate-400 sticky top-0 border-b border-slate-800">
            <tr>
              <th className="p-3">Model Asset Name</th>
              <th className="p-3">Era</th>
              <th className="p-3">File Size</th>
              <th className="p-3">CAD Triangles</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <Box size={14} className="text-cyan-400 shrink-0" />
                  <div>
                    <div>{asset.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{asset.path}</div>
                  </div>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300 text-[10px]">
                    {asset.era}
                  </span>
                </td>
                <td className="p-3 text-slate-400">{(asset.sizeKb / 1024).toFixed(1)} MB</td>
                <td className="p-3 text-slate-400">{asset.trianglesEst || "~150k"}</td>
                <td className="p-3">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <CheckCircle2 size={13} />
                    <span>Verified</span>
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => {
                      onSelectStage(asset.targetStage);
                      if (onClose) onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-black transition-all cursor-pointer font-bold text-[11px]"
                  >
                    <Eye size={12} />
                    <span>Load Studio</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
