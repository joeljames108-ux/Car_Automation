import { useState, useEffect } from "react";
import { Save, FolderOpen, Trash2, Copy, X, Search } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useDesign } from "../state/DesignContext";
import { defaultInfotainment } from "../sim/constants";
import type { VehicleDesign } from "../sim/types";

interface SavedDesign {
  id: string;
  name: string;
  description: string;
  design: VehicleDesign;
  created_at: string;
}

export function SaveLoadDialog({ open, onClose, mode }: {
  open: boolean; onClose: () => void; mode: "save" | "load";
}) {
  const { design, setDesign } = useDesign();
  const [name, setName] = useState(design.name);
  const [description, setDescription] = useState(design.description);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open && mode === "load") {
      loadDesigns();
    }
  }, [open, mode]);

  async function loadDesigns() {
    setLoading(true);
    const { data, error } = await supabase.from("designs").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setSavedDesigns(data as SavedDesign[]);
    }
    setLoading(false);
  }

  async function save() {
    setLoading(true);
    const { error } = await supabase.from("designs").insert({
      name, description, design,
    });
    if (!error) {
      onClose();
    }
    setLoading(false);
  }

  async function loadDesign(d: SavedDesign) {
    setDesign({ ...d.design, name: d.name, description: d.description, infotainment: d.design.infotainment ?? defaultInfotainment() });
    onClose();
  }

  async function deleteDesign(id: string) {
    await supabase.from("designs").delete().eq("id", id);
    loadDesigns();
  }

  async function cloneDesign(d: SavedDesign) {
    await supabase.from("designs").insert({
      name: `${d.name} (Copy)`, description: d.description, design: d.design,
    });
    loadDesigns();
  }

  if (!open) return null;

  const filtered = savedDesigns.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-base-900 border border-base-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-800">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            {mode === "save" ? <><Save size={16} /> Save Design</> : <><FolderOpen size={16} /> Load Design</>}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
        </div>

        {mode === "save" ? (
          <div className="p-4 space-y-3">
            <div>
              <label className="label-mono mb-1.5 block">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none" />
            </div>
            <div>
              <label className="label-mono mb-1.5 block">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none resize-none" />
            </div>
            <button onClick={save} disabled={loading || !name} className="w-full bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-base-950 font-semibold text-sm px-4 py-2.5 rounded-lg transition-all">
              {loading ? "Saving..." : "Save Design"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-3 border-b border-base-800">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search designs..." className="w-full bg-base-850 border border-base-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {loading && <p className="text-xs text-slate-500 text-center py-4">Loading...</p>}
              {!loading && filtered.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No designs found</p>}
              {filtered.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-850 border border-base-800 mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-200 truncate">{d.name}</div>
                    <div className="text-[10px] text-slate-600">{d.description || "No description"}</div>
                  </div>
                  <button onClick={() => loadDesign(d)} className="text-accent-400 hover:text-accent-300 text-xs">Load</button>
                  <button onClick={() => cloneDesign(d)} className="text-slate-500 hover:text-slate-300"><Copy size={14} /></button>
                  <button onClick={() => deleteDesign(d.id)} className="text-danger-400 hover:text-danger-300"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
