import React, { useState, useEffect } from "react";
import {
  Camera,
  RotateCcw,
  GitCompare,
  Trash2,
  Download,
  Copy,
  Check,
  FileJson,
  Calendar,
  DollarSign,
  ShieldAlert,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  listSnapshots,
  takeSnapshot,
  restoreSnapshot,
  deleteSnapshot,
  diffSnapshots,
  dumpFullStateJSON,
  type StateSnapshotMeta,
  type StateDiffResult,
} from "../../state/stateSnapshotManager";
import { formatGameDate } from "../../state/gameClockEngine";
import { useSimulationClockStore } from "../../state/simulationClockStore";

export const DevStateInspector: React.FC = () => {
  const [snapshots, setSnapshots] = useState<StateSnapshotMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"snapshots" | "diff" | "dump">("snapshots");

  // Snapshot creation state
  const [newSnapName, setNewSnapName] = useState("");
  const [newSnapDesc, setNewSnapDesc] = useState("");
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Diff state
  const [diffSnapA, setDiffSnapA] = useState<string>("");
  const [diffSnapB, setDiffSnapB] = useState<string>("");
  const [diffResult, setDiffResult] = useState<StateDiffResult | null>(null);

  // Dump state
  const [copied, setCopied] = useState(false);
  const clock = useSimulationClockStore();

  const loadAllSnapshots = async () => {
    setLoading(true);
    try {
      const list = await listSnapshots();
      setSnapshots(list);
      if (list.length >= 2 && !diffSnapA && !diffSnapB) {
        setDiffSnapA(list[1].id);
        setDiffSnapB(list[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSnapshots();
  }, []);

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapName.trim()) return;
    setLoading(true);
    try {
      const snap = await takeSnapshot(newSnapName, newSnapDesc);
      setNewSnapName("");
      setNewSnapDesc("");
      setActionMessage({
        type: "success",
        text: `Snapshot "${snap.name}" successfully created (${snap.approxSizeKb}KB).`,
      });
      await loadAllSnapshots();
    } catch (err: any) {
      setActionMessage({ type: "error", text: `Failed to create snapshot: ${err?.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string, name: string) => {
    if (!window.confirm(`Restore game state to snapshot "${name}"? This will overwrite the live simulation state.`)) {
      return;
    }
    setLoading(true);
    try {
      const res = await restoreSnapshot(id);
      if (res.success) {
        setActionMessage({
          type: "success",
          text: `Game state successfully restored to "${name}".`,
        });
      } else {
        setActionMessage({ type: "error", text: `Restore failed: ${res.error}` });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteSnapshot(id);
    await loadAllSnapshots();
  };

  const handleRunDiff = async () => {
    if (!diffSnapA || !diffSnapB) return;
    setLoading(true);
    try {
      const res = await diffSnapshots(diffSnapA, diffSnapB);
      if (res.success && res.diff) {
        setDiffResult(res.diff);
      } else {
        setActionMessage({ type: "error", text: res.error || "Diff failed" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDump = () => {
    const json = dumpFullStateJSON();
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDump = () => {
    const json = dumpFullStateJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apex_state_dump_${clock.year}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full text-slate-200 font-sans text-xs select-none">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setActiveTab("snapshots")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === "snapshots"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Camera size={13} />
            <span>Snapshots ({snapshots.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("diff");
              if (snapshots.length >= 2 && !diffResult) handleRunDiff();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === "diff"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitCompare size={13} />
            <span>Diff Viewer</span>
          </button>
          <button
            onClick={() => setActiveTab("dump")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === "dump"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileJson size={13} />
            <span>State Dump</span>
          </button>
        </div>

        {actionMessage && (
          <div
            className={`px-3 py-1 rounded text-xs border flex items-center gap-2 ${
              actionMessage.type === "success"
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/30"
                : "bg-rose-950/60 text-rose-300 border-rose-500/30"
            }`}
          >
            <span>{actionMessage.text}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="opacity-70 hover:opacity-100 ml-1 font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ── TAB 1: Snapshots List & Capture ── */}
      {activeTab === "snapshots" && (
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Create New Snapshot Form */}
          <form
            onSubmit={handleCreateSnapshot}
            className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-wrap items-center gap-2 shadow-inner"
          >
            <input
              type="text"
              placeholder="Snapshot Name (e.g. Pre-Turbo 1985 Baseline)"
              value={newSnapName}
              onChange={(e) => setNewSnapName(e.target.value)}
              className="flex-1 min-w-[200px] bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="Optional notes / description"
              value={newSnapDesc}
              onChange={(e) => setNewSnapDesc(e.target.value)}
              className="flex-1 min-w-[180px] bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading || !newSnapName.trim()}
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Camera size={13} />
              <span>Capture State</span>
            </button>
          </form>

          {/* Snapshots Table / Cards */}
          {snapshots.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-white/10 rounded-xl">
              <Camera size={28} className="mx-auto mb-2 opacity-40 text-amber-400" />
              <p className="font-medium">No state snapshots stored in IndexedDB.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Capture a snapshot above or type <code className="text-amber-400">state.snapshot &lt;name&gt;</code> in the Dev Console.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3 bg-slate-900/60 border border-white/10 rounded-xl hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xs group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                          <Camera size={12} className="text-amber-400" />
                          <span>{snap.name}</span>
                        </h4>
                        {snap.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {snap.description}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {snap.approxSizeKb} KB
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                        <Calendar size={10} className="text-amber-400" />
                        Yr {snap.year}
                      </span>
                      <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/5 text-emerald-300">
                        <DollarSign size={10} />
                        ${(snap.cash / 1e6).toFixed(1)}M
                      </span>
                      {snap.scenario && (
                        <span className="bg-amber-950/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-semibold">
                          {snap.scenario}
                        </span>
                      )}
                      <span className="text-slate-500">
                        {new Date(snap.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleRestore(snap.id, snap.name)}
                      className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors"
                      title="Restore full simulation state from this snapshot"
                    >
                      <RotateCcw size={11} />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => {
                        setDiffSnapA(snap.id);
                        setActiveTab("diff");
                      }}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-medium flex items-center gap-1 transition-colors"
                      title="Compare against another snapshot"
                    >
                      <GitCompare size={11} />
                      <span>Diff</span>
                    </button>
                    <button
                      onClick={() => handleDelete(snap.id)}
                      className="p-1 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete snapshot"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: State Diff Viewer ── */}
      {activeTab === "diff" && (
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Selector Bar */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-slate-400 font-medium">Snapshot A:</label>
              <select
                value={diffSnapA}
                onChange={(e) => setDiffSnapA(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
              >
                <option value="">Select Snapshot A</option>
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Yr {s.year})
                  </option>
                ))}
              </select>

              <ArrowRight size={14} className="text-slate-500 mx-1" />

              <label className="text-slate-400 font-medium">Snapshot B:</label>
              <select
                value={diffSnapB}
                onChange={(e) => setDiffSnapB(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
              >
                <option value="">Select Snapshot B</option>
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Yr {s.year})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunDiff}
              disabled={loading || !diffSnapA || !diffSnapB}
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 transition-all"
            >
              <GitCompare size={13} />
              <span>Compute Diff</span>
            </button>
          </div>

          {/* Diff Result List */}
          {diffResult ? (
            <div className="space-y-2">
              <div className="px-3 py-2 bg-amber-950/30 border border-amber-500/30 rounded-lg text-amber-200 text-xs font-mono font-medium">
                {diffResult.summary}
              </div>

              {diffResult.changes.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-mono">
                  Identical states! No property differences found between these snapshots.
                </div>
              ) : (
                <div className="space-y-1 font-mono text-xs">
                  {diffResult.changes.map((c, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        c.type === "added"
                          ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
                          : c.type === "removed"
                          ? "bg-rose-950/20 border-rose-500/20 text-rose-300"
                          : "bg-slate-900/60 border-white/10 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            c.type === "added"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : c.type === "removed"
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {c.type}
                        </span>
                        <span className="font-semibold text-white">{c.path}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="line-through text-slate-500">
                          {c.oldValue !== undefined ? JSON.stringify(c.oldValue) : "undefined"}
                        </span>
                        <ArrowRight size={10} className="text-slate-400" />
                        <span className="font-bold text-amber-300">
                          {c.newValue !== undefined ? JSON.stringify(c.newValue) : "undefined"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              Select two snapshots above to view property modifications.
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: Full State Dump ── */}
      {activeTab === "dump" && (
        <div className="flex flex-col flex-1 overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono text-[11px]">
              Live Zustand Store Serialization (Read-Only)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDump}
                className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? "Copied!" : "Copy JSON"}</span>
              </button>
              <button
                onClick={handleDownloadDump}
                className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download size={12} />
                <span>Download .json</span>
              </button>
            </div>
          </div>

          <pre className="flex-1 bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-[11px] text-amber-200/90 overflow-auto scrollbar-thin select-text">
            {dumpFullStateJSON()}
          </pre>
        </div>
      )}
    </div>
  );
};
