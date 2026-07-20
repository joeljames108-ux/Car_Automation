// ===================================================================
// VEHICLE GARAGE — Permanent vehicle storage with family tree
// ===================================================================
import { useState, useMemo } from "react";
import {
  Warehouse, Plus, Copy, GitBranch, Trash2, Search, Filter,
  Zap, Weight, Gauge, DollarSign, ChevronRight, ChevronDown,
  CheckCircle2, ArrowUpRight,
} from "lucide-react";
import { useCompany } from "../state/CompanyContext";
import { useDesign } from "../state/DesignContext";
import type { GarageVehicle, VehicleVariantType } from "../sim/types";

const VARIANT_COLORS: Record<VehicleVariantType, string> = {
  base:            "bg-slate-500/20 text-slate-400 border-slate-500/30",
  trim:            "bg-blue-500/20 text-blue-400 border-blue-500/30",
  facelift:        "bg-amber-500/20 text-amber-400 border-amber-500/30",
  generation:      "bg-accent-500/20 text-accent-400 border-accent-500/30",
  special_edition: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const VARIANT_LABELS: Record<VehicleVariantType, string> = {
  base: "Base", trim: "Trim", facelift: "Facelift",
  generation: "New Gen", special_edition: "Special Ed.",
};

function ratingColor(r: number) {
  if (r >= 80) return "text-ok-400";
  if (r >= 60) return "text-accent-300";
  if (r >= 40) return "text-warn-400";
  return "text-danger-400";
}

function VehicleCard({
  vehicle, onLoad, onDuplicate, onCreateVariant, onDelete, isSelected, onClick,
}: {
  vehicle: GarageVehicle;
  onLoad: () => void;
  onDuplicate: () => void;
  onCreateVariant: (type: VehicleVariantType) => void;
  onDelete: () => void;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`panel p-4 cursor-pointer transition-all duration-200 hover:border-base-700 relative group ${
        isSelected ? "border-accent-500/50 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${VARIANT_COLORS[vehicle.variantType]}`}>
              {VARIANT_LABELS[vehicle.variantType]}
            </span>
            <span className="text-[10px] text-slate-600">Gen {vehicle.generation}</span>
            {vehicle.isLaunched && (
              <span className="text-[10px] text-ok-400 flex items-center gap-0.5">
                <CheckCircle2 size={10} /> Launched
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-100 text-sm truncate">{vehicle.name}</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">{vehicle.modelName}</p>
        </div>
        <div className={`text-base font-bold font-mono ${ratingColor(vehicle.overallRating)}`}>
          {vehicle.overallRating}
          <span className="text-[10px] text-slate-600 ml-0.5">/100</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        <div className="bg-base-850 rounded-lg p-1.5 text-center">
          <Zap size={10} className="mx-auto text-accent-400 mb-0.5" />
          <div className="font-mono text-xs text-slate-200">{Math.round(vehicle.peakPower)}</div>
          <div className="text-[9px] text-slate-600">hp</div>
        </div>
        <div className="bg-base-850 rounded-lg p-1.5 text-center">
          <Weight size={10} className="mx-auto text-slate-400 mb-0.5" />
          <div className="font-mono text-xs text-slate-200">{Math.round(vehicle.weight)}</div>
          <div className="text-[9px] text-slate-600">kg</div>
        </div>
        <div className="bg-base-850 rounded-lg p-1.5 text-center">
          <Gauge size={10} className="mx-auto text-blue-400 mb-0.5" />
          <div className="font-mono text-xs text-slate-200">{Math.round(vehicle.topSpeed)}</div>
          <div className="text-[9px] text-slate-600">km/h</div>
        </div>
        <div className="bg-base-850 rounded-lg p-1.5 text-center">
          <DollarSign size={10} className="mx-auto text-ok-400 mb-0.5" />
          <div className="font-mono text-xs text-slate-200">{(vehicle.price / 1000).toFixed(0)}k</div>
          <div className="text-[9px] text-slate-600">USD</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onLoad(); }}
          className="flex-1 py-1 rounded-lg text-xs font-medium bg-accent-500/15 border border-accent-500/30 text-accent-300 hover:bg-accent-500/25 transition-all"
        >
          Load
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          title="Duplicate"
          className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-base-800 transition-all"
        >
          <Copy size={12} />
        </button>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(m => !m); }}
            title="Create Variant"
            className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-base-800 transition-all"
          >
            <GitBranch size={12} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 bottom-8 z-50 bg-base-850 border border-base-700 rounded-lg py-1 w-36 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              {(["trim", "facelift", "generation", "special_edition"] as VehicleVariantType[]).map(t => (
                <button
                  key={t}
                  onClick={() => { onCreateVariant(t); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-base-800 transition-all"
                >
                  {VARIANT_LABELS[t]}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete"
          className="p-1.5 rounded-lg text-xs text-slate-500 hover:text-danger-400 hover:bg-danger-500/10 transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Tags */}
      {vehicle.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {vehicle.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[9px] bg-base-800 text-slate-500 px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function FamilyTreeNode({ vehicle, allVehicles, depth = 0 }: {
  vehicle: GarageVehicle; allVehicles: GarageVehicle[]; depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = allVehicles.filter(v => v.parentId === vehicle.id);

  return (
    <div className={depth > 0 ? "ml-5 border-l border-base-800 pl-3" : ""}>
      <div className="flex items-center gap-2 py-1.5">
        {children.length > 0 ? (
          <button onClick={() => setExpanded(e => !e)} className="text-slate-500 hover:text-slate-300 transition-all">
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : <div className="w-3" />}
        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${VARIANT_COLORS[vehicle.variantType]}`}>
          {VARIANT_LABELS[vehicle.variantType]}
        </span>
        <span className="text-sm text-slate-200 font-medium">{vehicle.name}</span>
        <span className="text-[10px] text-slate-600">Gen {vehicle.generation} · {Math.round(vehicle.peakPower)}hp</span>
        {vehicle.isLaunched && <CheckCircle2 size={10} className="text-ok-400" />}
      </div>
      {expanded && children.map(c => (
        <FamilyTreeNode key={c.id} vehicle={c} allVehicles={allVehicles} depth={depth + 1} />
      ))}
    </div>
  );
}

export function VehicleGarage() {
  const { company, saveToGarage, removeFromGarage, duplicateVehicle } = useCompany();
  const { design, sim, setDesign } = useDesign();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<VehicleVariantType | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "tree">("grid");
  const [saveName, setSaveName] = useState({ model: "", variant: "" });
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const filtered = useMemo(() =>
    company.garage.filter(v =>
      (filter === "all" || v.variantType === filter) &&
      v.name.toLowerCase().includes(search.toLowerCase())
    ),
    [company.garage, filter, search]
  );

  const roots = useMemo(() =>
    company.garage.filter(v => !v.parentId),
    [company.garage]
  );

  function handleSave() {
    if (!saveName.model.trim()) return;
    saveToGarage(design, sim, saveName.model, saveName.variant || "Base", "base", null);
    setShowSaveDialog(false);
    setSaveName({ model: "", variant: "" });
  }

  function handleLoad(v: GarageVehicle) {
    setDesign(v.design);
  }

  function handleDuplicate(v: GarageVehicle) {
    duplicateVehicle(v.id, `${v.variantName} Copy`);
  }

  function handleCreateVariant(v: GarageVehicle, type: VehicleVariantType) {
    const suffix = VARIANT_LABELS[type];
    saveToGarage(v.design, v.sim, v.modelName, suffix, type, v.id);
  }

  return (
    <div className="space-y-4 stagger">
      {/* Header */}
      <div className="panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: "radial-gradient(ellipse at top right, rgba(34,211,238,0.3), transparent 60%)" }} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-500/20 border border-accent-500/30">
              <Warehouse size={24} className="text-accent-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Vehicle Garage</h2>
              <p className="text-xs text-slate-500">Permanent vehicle archive — every design, every generation</p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-accent-300">{company.garage.length}</span>
            <span className="text-sm text-slate-500">vehicles stored</span>
          </div>
        </div>
      </div>

      {/* Save current design */}
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Plus size={12} className="text-accent-400" /> Save Current Design
          </h3>
        </div>
        {showSaveDialog ? (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={saveName.model}
              onChange={e => setSaveName(n => ({ ...n, model: e.target.value }))}
              placeholder="Model name (e.g. Falcon)"
              className="bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none flex-1 min-w-32"
            />
            <input
              value={saveName.variant}
              onChange={e => setSaveName(n => ({ ...n, variant: e.target.value }))}
              placeholder="Variant (e.g. GT, Sport)"
              className="bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none w-40"
            />
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-xs font-semibold bg-accent-500/20 border border-accent-500/40 text-accent-300 hover:bg-accent-500/30 transition-all">
              Save to Garage
            </button>
            <button onClick={() => setShowSaveDialog(false)} className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-base-800 transition-all">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent-500/15 border border-accent-500/30 text-accent-300 hover:bg-accent-500/25 transition-all"
          >
            <Plus size={14} /> Save "{design.name}" to Garage
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vehicles…"
            className="w-full bg-base-900 border border-base-800 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-300 focus:border-accent-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1 bg-base-850 rounded-lg p-1 border border-base-800">
          <Filter size={12} className="text-slate-500 ml-1 mr-0.5" />
          {(["all", "base", "trim", "facelift", "generation", "special_edition"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                filter === f ? "bg-accent-500/20 text-accent-300" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {f === "all" ? "All" : VARIANT_LABELS[f as VehicleVariantType]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-base-850 rounded-lg p-1 border border-base-800">
          <button onClick={() => setView("grid")} className={`px-2 py-1 rounded text-[11px] transition-all ${view === "grid" ? "bg-accent-500/20 text-accent-300" : "text-slate-500"}`}>Grid</button>
          <button onClick={() => setView("tree")} className={`px-2 py-1 rounded text-[11px] transition-all ${view === "tree" ? "bg-accent-500/20 text-accent-300" : "text-slate-500"}`}>Tree</button>
        </div>
      </div>

      {/* Content */}
      {company.garage.length === 0 ? (
        <div className="panel p-12 text-center">
          <Warehouse size={40} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 text-sm">Your garage is empty.</p>
          <p className="text-slate-600 text-xs mt-1">Design a vehicle above and save it to start your collection.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(v => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              isSelected={selectedId === v.id}
              onClick={() => setSelectedId(id => id === v.id ? null : v.id)}
              onLoad={() => handleLoad(v)}
              onDuplicate={() => handleDuplicate(v)}
              onCreateVariant={(type) => handleCreateVariant(v, type)}
              onDelete={() => removeFromGarage(v.id)}
            />
          ))}
        </div>
      ) : (
        <div className="panel p-5">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <GitBranch size={12} className="text-accent-400" /> Family Tree
          </h3>
          {roots.length === 0 ? (
            <p className="text-slate-600 text-sm">No root vehicles yet.</p>
          ) : (
            <div className="space-y-2">
              {roots.map(r => (
                <FamilyTreeNode key={r.id} vehicle={r} allVehicles={company.garage} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected vehicle detail */}
      {selectedId && (() => {
        const v = company.garage.find(g => g.id === selectedId);
        if (!v) return null;
        return (
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-100">{v.name} — Notes</h3>
              <button onClick={() => setSelectedId(null)} className="text-xs text-slate-500 hover:text-slate-300">✕</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="bg-base-850 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Created</div>
                <div className="text-sm font-mono text-slate-300">{new Date(v.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="bg-base-850 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Units Sold</div>
                <div className="text-sm font-mono text-slate-300">{v.totalUnitsSold.toLocaleString()}</div>
              </div>
              <div className="bg-base-850 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Children</div>
                <div className="text-sm font-mono text-slate-300">{v.childIds.length}</div>
              </div>
              <div className="bg-base-850 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Status</div>
                <div className={`text-sm font-medium ${v.isLaunched ? "text-ok-400" : "text-slate-400"}`}>
                  {v.isLaunched ? "On Market" : "In Development"}
                </div>
              </div>
            </div>
            {v.notes && <p className="text-sm text-slate-400">{v.notes}</p>}
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleLoad(v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-500/15 border border-accent-500/30 text-accent-300 hover:bg-accent-500/25 transition-all">
                <ArrowUpRight size={12} /> Load into Designer
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
