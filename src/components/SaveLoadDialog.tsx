import { useState, useEffect } from "react";
import {
  Save,
  FolderOpen,
  Trash2,
  Copy,
  X,
  Search,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  DollarSign,
  Star,
  Download,
  Upload,
  AlertTriangle,
  Car,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useDesign } from "../state/DesignContext";
import { defaultInfotainment } from "../sim/constants";
import type { VehicleDesign } from "../sim/types";
import { useDeveloperModeStore } from "../state/developerModeStore";
import {
  listSaves,
  saveGame,
  loadGame,
  deleteSave,
  exportSaveToJSON,
  importSaveFromJSON,
  type SaveGameMetadata,
  type SaveNamespace,
} from "../state/saveManager";

interface SavedDesign {
  id: string;
  name: string;
  description: string;
  design: VehicleDesign;
  created_at: string;
}

export function SaveLoadDialog({
  open,
  onClose,
  mode,
}: {
  open: boolean;
  onClose: () => void;
  mode: "save" | "load";
}) {
  const { devMode } = useDeveloperModeStore();
  const { design, setDesign } = useDesign();

  // Mode: "games" (full game state) vs "designs" (individual car model)
  const [saveType, setSaveType] = useState<"games" | "designs">("games");

  // Selected namespace tab for game saves: defaults to current devMode
  const [selectedNamespace, setSelectedNamespace] = useState<SaveNamespace>(
    devMode ? "developer" : "player"
  );

  // Game saves state
  const [gameSaves, setGameSaves] = useState<SaveGameMetadata[]>([]);
  const [saveName, setSaveName] = useState(
    devMode ? `Dev Sandbox ${new Date().toLocaleDateString()}` : `Career Save`
  );
  const [saveDesc, setSaveDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Cross-namespace warning confirmation modal state
  const [pendingCrossLoad, setPendingCrossLoad] = useState<SaveGameMetadata | null>(null);

  // Vehicle design saves state (legacy)
  const [name, setName] = useState(design.name);
  const [description, setDescription] = useState(design.description);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);

  useEffect(() => {
    if (open) {
      setSelectedNamespace(devMode ? "developer" : "player");
      refreshGameSaves();
      if (mode === "load") {
        loadDesigns();
      }
    }
  }, [open, mode, devMode]);

  function refreshGameSaves() {
    const list = listSaves("all");
    setGameSaves(list);
  }

  async function loadDesigns() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("designs")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setSavedDesigns(data as SavedDesign[]);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  }

  // ── Game Save / Load Handlers ──
  function handleSaveGame() {
    if (!saveName.trim()) return;
    setLoading(true);
    const slotId = `slot_${Date.now().toString(36)}`;
    const res = saveGame(slotId, saveName.trim(), saveDesc.trim());
    setLoading(false);
    if (res.success) {
      refreshGameSaves();
      onClose();
    }
  }

  function handleLoadGame(meta: SaveGameMetadata) {
    // Check if cross-namespace load
    const isCross = (meta.namespace === "developer" && !devMode) || (meta.namespace === "player" && devMode);
    if (isCross) {
      setPendingCrossLoad(meta);
      return;
    }
    executeLoad(meta);
  }

  function executeLoad(meta: SaveGameMetadata) {
    setLoading(true);
    const res = loadGame(meta.slotId, meta.namespace);
    setLoading(false);
    if (res.success) {
      setPendingCrossLoad(null);
      onClose();
    }
  }

  function handleDeleteSave(slotId: string, ns: SaveNamespace) {
    deleteSave(slotId, ns);
    refreshGameSaves();
  }

  function handleExportJSON(slotId: string, ns: SaveNamespace, filename: string) {
    const json = exportSaveToJSON(slotId, ns);
    if (!json) return;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename.replace(/\s+/g, "_")}_${slotId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importSaveFromJSON(content);
        if (res.success) {
          refreshGameSaves();
        } else {
          alert(`Import failed: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ── Design Save / Load Handlers (Legacy) ──
  async function saveDesign() {
    setLoading(true);
    const { error } = await supabase.from("designs").insert({
      name,
      description,
      design,
    });
    if (!error) {
      onClose();
    }
    setLoading(false);
  }

  async function loadDesign(d: SavedDesign) {
    setDesign({
      ...d.design,
      name: d.name,
      description: d.description,
      infotainment: d.design.infotainment ?? defaultInfotainment(),
    });
    onClose();
  }

  async function deleteDesign(id: string) {
    await supabase.from("designs").delete().eq("id", id);
    loadDesigns();
  }

  async function cloneDesign(d: SavedDesign) {
    await supabase.from("designs").insert({
      name: `${d.name} (Copy)`,
      description: d.description,
      design: d.design,
    });
    loadDesigns();
  }

  if (!open) return null;

  const filteredGameSaves = gameSaves.filter(
    (s) =>
      s.namespace === selectedNamespace &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.slotId.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredDesigns = savedDesigns.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#0b0f19] border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
              {mode === "save" ? (
                <>
                  <Save size={16} className="text-amber-400" /> Save Manager
                </>
              ) : (
                <>
                  <FolderOpen size={16} className="text-amber-400" /> Load Game & State
                </>
              )}
            </h2>

            {/* Save Type Switcher: Entire Game vs Vehicle Design */}
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10 text-xs font-mono">
              <button
                onClick={() => setSaveType("games")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  saveType === "games"
                    ? "bg-amber-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Campaign / Sandbox
              </button>
              <button
                onClick={() => setSaveType("designs")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  saveType === "designs"
                    ? "bg-amber-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Vehicle Designs
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── FULL GAME SAVE / LOAD VIEW ── */}
        {saveType === "games" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Namespace Isolation Banner */}
            <div
              className={`px-5 py-2 text-xs font-mono flex items-center justify-between gap-3 border-b ${
                devMode
                  ? "bg-amber-950/40 text-amber-200 border-amber-500/30"
                  : "bg-emerald-950/40 text-emerald-200 border-emerald-500/30"
              }`}
            >
              <div className="flex items-center gap-2">
                {devMode ? (
                  <Zap size={14} className="text-amber-400" />
                ) : (
                  <ShieldCheck size={14} className="text-emerald-400" />
                )}
                <span>
                  {devMode
                    ? "⚡ DEVELOPER SAVE MODE ACTIVE: Saves are stored in isolated dev namespace"
                    : "🎮 PLAYER CAREER MODE: Normal progression saves"}
                </span>
              </div>

              {/* Import button */}
              <label className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] cursor-pointer transition-colors">
                <Upload size={11} />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {/* Namespace Filter Tabs */}
            <div className="px-5 py-2 bg-slate-950/50 border-b border-white/5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedNamespace("player")}
                  className={`px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    selectedNamespace === "player"
                      ? "bg-emerald-600 text-white font-bold border-emerald-500 shadow-sm"
                      : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <ShieldCheck size={12} />
                  <span>Player Saves ({gameSaves.filter((s) => s.namespace === "player").length})</span>
                </button>

                <button
                  onClick={() => setSelectedNamespace("developer")}
                  className={`px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    selectedNamespace === "developer"
                      ? "bg-amber-600 text-white font-bold border-amber-500 shadow-sm"
                      : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Zap size={12} />
                  <span>Dev Sandbox Saves ({gameSaves.filter((s) => s.namespace === "developer").length})</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative w-44">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Filter slots..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-7 pr-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* SAVE FORM (if mode === save) */}
            {mode === "save" && (
              <div className="p-4 bg-slate-900/40 border-b border-white/10 space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 mb-1 block">Save Name</label>
                  <input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Enter save name..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Description / Notes</label>
                  <textarea
                    value={saveDesc}
                    onChange={(e) => setSaveDesc(e.target.value)}
                    rows={2}
                    placeholder="Optional notes about this save..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>
                <button
                  onClick={handleSaveGame}
                  disabled={loading || !saveName.trim()}
                  className={`w-full font-bold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    devMode
                      ? "bg-amber-600 hover:bg-amber-500 text-slate-950"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  <Save size={14} />
                  <span>
                    {loading
                      ? "Saving..."
                      : `Save to ${devMode ? "⚡ Developer Namespace" : "🎮 Player Namespace"}`}
                  </span>
                </button>
              </div>
            )}

            {/* SLOTS LIST */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {filteredGameSaves.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  <FolderOpen size={28} className="mx-auto mb-2 opacity-40 text-amber-400" />
                  <p>No saves found in {selectedNamespace} namespace.</p>
                  {mode === "save" && (
                    <p className="text-[11px] text-slate-600 mt-1">
                      Use the form above to create your first save in this namespace.
                    </p>
                  )}
                </div>
              ) : (
                filteredGameSaves.map((save) => {
                  const isDev = save.namespace === "developer";
                  return (
                    <div
                      key={save.slotId}
                      className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDev
                          ? "bg-amber-950/20 border-amber-500/20 hover:border-amber-500/40"
                          : "bg-slate-900/60 border-white/10 hover:border-emerald-500/40"
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                              isDev
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {isDev ? "DEV" : "CAREER"}
                          </span>
                          <span className="font-bold text-slate-100 text-xs font-mono">
                            {save.name}
                          </span>
                          {save.slotId === "autosave" && (
                            <span className="text-[9px] bg-red-500/20 text-red-300 px-1 rounded font-bold font-mono">
                              AUTO
                            </span>
                          )}
                        </div>

                        {save.description && (
                          <p className="text-[11px] text-slate-400 font-mono">
                            {save.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className="text-amber-400" />
                            {save.gameDate}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-300">
                            <DollarSign size={11} />
                            ${(save.cash / 1e6).toFixed(1)}M
                          </span>
                          <span className="flex items-center gap-1 text-amber-300">
                            <Star size={11} />
                            {save.reputation}
                          </span>
                          {save.__devMetadata?.activeScenario && (
                            <span className="bg-black/40 text-amber-300 px-1 rounded border border-amber-500/30">
                              {save.__devMetadata.activeScenario}
                            </span>
                          )}
                          <span className="text-slate-600">
                            {new Date(save.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => handleLoadGame(save)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <FolderOpen size={12} />
                          <span>Load</span>
                        </button>
                        <button
                          onClick={() =>
                            handleExportJSON(save.slotId, save.namespace, save.name)
                          }
                          className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Export as JSON"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteSave(save.slotId, save.namespace)}
                          className="p-1.5 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete save slot"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── VEHICLE DESIGNS VIEW (LEGACY COMPATIBLE) ── */}
        {saveType === "designs" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {mode === "save" ? (
              <div className="p-4 space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 mb-1 block">Design Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>
                <button
                  onClick={saveDesign}
                  disabled={loading || !name}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg transition-all"
                >
                  {loading ? "Saving..." : "Save Vehicle Design"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-hidden font-mono text-xs">
                <div className="p-3 border-b border-slate-800">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search vehicle designs..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {loading && (
                    <p className="text-xs text-slate-500 text-center py-4">Loading...</p>
                  )}
                  {!loading && filteredDesigns.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">
                      No vehicle designs found.
                    </p>
                  )}
                  {filteredDesigns.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700"
                    >
                      <Car size={16} className="text-amber-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {d.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {d.description || "No description"}
                        </div>
                      </div>
                      <button
                        onClick={() => loadDesign(d)}
                        className="text-amber-400 hover:text-amber-300 text-xs font-bold px-2 py-1 rounded bg-amber-500/10"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => cloneDesign(d)}
                        className="text-slate-500 hover:text-slate-300 p-1"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => deleteDesign(d.id)}
                        className="text-rose-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CROSS-NAMESPACE WARNING CONFIRMATION MODAL ── */}
        {pendingCrossLoad && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 font-mono text-xs">
              <div className="flex items-center gap-3 text-amber-400">
                <AlertTriangle size={24} className="animate-pulse" />
                <h3 className="text-sm font-bold text-white">
                  Cross-Namespace Load Confirmation
                </h3>
              </div>

              <p className="text-slate-300 leading-relaxed">
                You are currently in{" "}
                <strong className={devMode ? "text-amber-300" : "text-emerald-300"}>
                  {devMode ? "Developer Mode" : "Player Career Mode"}
                </strong>
                , but attempting to load a save from the{" "}
                <strong className={pendingCrossLoad.namespace === "developer" ? "text-amber-300" : "text-emerald-300"}>
                  {pendingCrossLoad.namespace === "developer" ? "Developer Sandbox" : "Player Career"}
                </strong>{" "}
                namespace (
                <span className="text-white font-bold">{pendingCrossLoad.name}</span>).
              </p>

              <div className="p-3 bg-black/50 rounded-xl border border-white/10 text-[11px] text-amber-200/90 space-y-1">
                <div className="flex items-center gap-1">
                  <span>Target Date:</span> <strong>{pendingCrossLoad.gameDate}</strong>
                </div>
                <div className="flex items-center gap-1">
                  <span>Balance:</span> <strong>${(pendingCrossLoad.cash / 1e6).toFixed(1)}M</strong>
                </div>
                {pendingCrossLoad.namespace === "developer" && (
                  <p className="text-amber-400 font-semibold pt-1">
                    ⚠ Loading this save will automatically activate Developer Mode and override rules.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setPendingCrossLoad(null)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeLoad(pendingCrossLoad)}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-colors"
                >
                  Confirm & Load
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
