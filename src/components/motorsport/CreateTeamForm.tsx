// ===================================================================
// CREATE TEAM FORM — Multi-step team creation wizard
// ===================================================================
import { useState } from "react";
import { Plus, ChevronRight, Palette } from "lucide-react";
import { useCompany } from "../../state/CompanyContext";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "./TeamCard";
import type { MotorsportCategory } from "../../sim/types";

const LIVERY_PRESETS = [
  "#e63946", "#2196f3", "#4caf50", "#ff9800", "#9c27b0",
  "#00bcd4", "#ff5722", "#3f51b5", "#009688", "#f44336",
  "#1a237e", "#d32f2f", "#00695c", "#e65100",
];

export function CreateTeamForm({ onClose }: { onClose: () => void }) {
  const { createMotorsportTeam, company } = useCompany();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", category: "gt" as MotorsportCategory,
    budget: 20_000_000, baseVehicleId: null as string | null,
  });

  function handleCreate() {
    if (!form.name.trim()) return;
    createMotorsportTeam(form.name, form.category, form.budget, form.baseVehicleId);
    onClose();
  }

  const steps = [
    { title: "Team Identity", subtitle: "Name your racing team" },
    { title: "Category", subtitle: "Choose your racing series" },
    { title: "Budget & Vehicle", subtitle: "Set your season budget" },
  ];

  return (
    <div className="glass-panel p-5 border-accent-500/30 racing-stripes relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-10"
        style={{ background: "radial-gradient(ellipse at bottom right, rgba(34,211,238,0.3), transparent 60%)" }} />

      <div className="relative">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i === step ? "bg-accent-500/30 text-accent-300 border border-accent-500/50" :
                i < step ? "bg-ok-500/20 text-ok-400 border border-ok-500/40" :
                "bg-base-800 text-slate-600 border border-base-700"
              }`}>{i < step ? "✓" : i + 1}</div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 rounded ${i < step ? "bg-ok-500/40" : "bg-base-700"}`} />
              )}
            </div>
          ))}
          <div className="ml-3">
            <div className="text-sm font-semibold text-slate-100">{steps[step].title}</div>
            <div className="text-[10px] text-slate-500">{steps[step].subtitle}</div>
          </div>
        </div>

        {/* Step 0: Name */}
        {step === 0 && (
          <div className="space-y-3 animate-fade-in-up">
            <div>
              <label className="label-mono block mb-1">Team Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Apex Motorsport GT"
                autoFocus
                className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500/30 transition-all" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-base-800 transition-all">Cancel</button>
              <button onClick={() => form.name.trim() && setStep(1)} disabled={!form.name.trim()}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold bg-accent-500/20 border border-accent-500/40 text-accent-300 hover:bg-accent-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Category */}
        {step === 1 && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_LABELS) as MotorsportCategory[]).map(cat => (
                <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))}
                  className={`px-3 py-3 rounded-xl text-xs font-medium transition-all border card-hover ${
                    form.category === cat ? `${CATEGORY_COLORS[cat]} shadow-lg` : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
                  }`}>
                  <div className="text-sm font-semibold mb-0.5">{CATEGORY_LABELS[cat]}</div>
                  <div className="text-[10px] opacity-60">
                    {cat === "gt" ? "Production-based racing" :
                     cat === "formula" ? "Open-wheel pinnacle" :
                     cat === "hypercar" ? "Endurance hypercars" :
                     cat === "touring" ? "Tin-top battles" :
                     cat === "rally" ? "Point-to-point stages" :
                     "Multi-hour marathons"}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setStep(0)} className="px-4 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-base-800 transition-all">Back</button>
              <button onClick={() => setStep(2)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold bg-accent-500/20 border border-accent-500/40 text-accent-300 hover:bg-accent-500/30 transition-all">
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Budget & Vehicle */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in-up">
            <div>
              <label className="label-mono block mb-1.5">Season Budget</label>
              <div className="flex items-center gap-3">
                <input type="range" min={5_000_000} max={100_000_000} step={1_000_000}
                  value={form.budget} onChange={e => setForm(f => ({ ...f, budget: +e.target.value }))} className="flex-1" />
                <span className="text-lg font-bold font-mono text-accent-300 w-24 text-right">${(form.budget / 1_000_000).toFixed(0)}M</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 mt-1 px-0.5">
                <span>$5M</span>
                <span>$100M</span>
              </div>
            </div>
            <div>
              <label className="label-mono block mb-1.5">Base Vehicle (optional)</label>
              <select value={form.baseVehicleId || ""} onChange={e => setForm(f => ({ ...f, baseVehicleId: e.target.value || null }))}
                className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none transition-all">
                <option value="">None (clean-sheet design)</option>
                {company.garage.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-base-800 transition-all">Back</button>
              <button onClick={handleCreate}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold bg-accent-500/20 border border-accent-500/40 text-accent-300 hover:bg-accent-500/30 transition-all">
                <Plus size={14} /> Create {form.name || "Team"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
