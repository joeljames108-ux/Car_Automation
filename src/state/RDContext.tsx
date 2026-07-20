import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { RDState, RDBonuses, BuildingId, TechnologyId } from "../sim/rdTypes";
import { initialRDState } from "../sim/rdData";
import {
  advanceMonth, computeBonuses, upgradeBuilding, startProject, pauseProject,
  resumeProject, cancelProject, hireEngineer, fireEngineer, patentTech,
  startSkunkworksProject,
} from "../sim/rdEngine";

interface RDContextValue {
  state: RDState;
  bonuses: RDBonuses;
  loading: boolean;
  saving: boolean;
  advanceOneMonth: () => void;
  advanceSixMonths: () => void;
  upgrade: (buildingId: BuildingId) => void;
  startResearch: (techId: TechnologyId, scientists: number) => void;
  startSkunkworks: (templateIdx: number, scientists: number) => void;
  pauseResearch: (projectId: string) => void;
  resumeResearch: (projectId: string) => void;
  cancelResearch: (projectId: string) => void;
  hire: (engineerId: string) => void;
  fire: (engineerId: string) => void;
  patent: (techId: TechnologyId) => void;
  updateBudget: (budget: RDState["budget"]) => void;
  reset: () => void;
}

const Ctx = createContext<RDContextValue | null>(null);

export function RDProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RDState>(() => initialRDState());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.from("rd_state").select("state").eq("id", 1).maybeSingle();
        if (!mounted) return;
        if (error) { console.warn("rd load error", error.message); setLoading(false); return; }
        if (data?.state) {
          // Merge with defaults so new fields don't break old saves
          const base = initialRDState();
          setState({ ...base, ...(data.state as RDState) });
        }
      } catch (e) {
        console.warn("rd load failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Persist to Supabase (debounced via the state object identity)
  useEffect(() => {
    if (loading) return;
    setSaving(true);
    const timer = setTimeout(async () => {
      try {
        await supabase.from("rd_state").upsert(
          { id: 1, state: state as unknown as Record<string, unknown>, updated_at: new Date().toISOString() },
          { onConflict: "id" }
        );
      } catch (e) {
        console.warn("rd save failed", e);
      } finally {
        setSaving(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [state, loading]);

  const advanceOneMonth = useCallback(() => setState((s) => advanceMonth(s)), []);
  const advanceSixMonths = useCallback(() => {
    setState((s) => { let cur = s; for (let i = 0; i < 6; i++) cur = advanceMonth(cur); return cur; });
  }, []);
  const upgrade = useCallback((id: BuildingId) => setState((s) => upgradeBuilding(s, id)), []);
  const startResearch = useCallback((techId: TechnologyId, scientists: number) =>
    setState((s) => startProject(s, techId, scientists)), []);
  const startSkunkworks = useCallback((templateIdx: number, scientists: number) =>
    setState((s) => startSkunkworksProject(s, templateIdx, scientists)), []);
  const pauseResearch = useCallback((id: string) => setState((s) => pauseProject(s, id)), []);
  const resumeResearch = useCallback((id: string) => setState((s) => resumeProject(s, id)), []);
  const cancelResearch = useCallback((id: string) => setState((s) => cancelProject(s, id)), []);
  const hire = useCallback((id: string) => setState((s) => hireEngineer(s, id)), []);
  const fire = useCallback((id: string) => setState((s) => fireEngineer(s, id)), []);
  const patent = useCallback((techId: TechnologyId) => setState((s) => patentTech(s, techId)), []);
  const updateBudget = useCallback((budget: RDState["budget"]) =>
    setState((s) => ({ ...s, budget })), []);
  const reset = useCallback(() => setState(initialRDState()), []);

  const bonuses = useMemo(() => computeBonuses(state), [state]);

  const value: RDContextValue = {
    state, bonuses, loading, saving,
    advanceOneMonth, advanceSixMonths, upgrade,
    startResearch, startSkunkworks, pauseResearch, resumeResearch, cancelResearch,
    hire, fire, patent, updateBudget, reset,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRD(): RDContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRD must be used within RDProvider");
  return ctx;
}
