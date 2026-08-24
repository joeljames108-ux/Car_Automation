// ===================================================================
// ZUSTAND HIGGSFIELD STORE — AI Creative Suite Job Queue & Settings
// ===================================================================

import { create } from "zustand";
import {
  GenerationJob,
  HiggsfieldBackend,
  HiggsfieldKind,
  executeJob,
} from "../lib/higgsfield";

const LS_KEY = "apex_higgsfield_history_v1";
const MAX_HISTORY = 60;

interface HiggsfieldStore {
  backend: HiggsfieldBackend;
  proxyUrl: string;
  defaultImageModel: string;
  defaultVideoModel: string;
  jobs: GenerationJob[];
  history: GenerationJob[];

  setBackend: (b: HiggsfieldBackend) => void;
  setProxyUrl: (u: string) => void;
  setDefaultModels: (image: string, video: string) => void;

  submitJob: (input: { kind: HiggsfieldKind; modelId: string; title: string; prompt: string }) => void;
  clearHistory: () => void;

  _loadPersisted: () => void;
}

function persist(history: GenerationJob[]) {
  try {
    // data URLs can be large — keep only the most recent 12 rendered results
    const trimmed = history.slice(0, 12).map((j) => ({
      ...j,
      resultUrl: j.resultUrl && j.resultUrl.startsWith("data:") ? undefined : j.resultUrl,
    }));
    localStorage.setItem(LS_KEY, JSON.stringify(trimmed));
  } catch {
    /* storage full or unavailable — non-fatal */
  }
}

export const useHiggsfieldStore = create<HiggsfieldStore>((set: any, get: any) => ({
  backend: "demo",
  proxyUrl:
    (import.meta as any).env?.VITE_HIGGSFIELD_PROXY_URL ?? "",
  defaultImageModel: "nano-banana-pro",
  defaultVideoModel: "seedance-25",
  jobs: [],
  history: [],

  setBackend: (b) => set({ backend: b }),
  setProxyUrl: (u) => set({ proxyUrl: u }),
  setDefaultModels: (image, video) =>
    set({ defaultImageModel: image, defaultVideoModel: video }),

  submitJob: ({ kind, modelId, title, prompt }) => {
    const job: GenerationJob = {
      id: `hf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      kind,
      modelId,
      title,
      prompt,
      status: "running",
      createdAt: Date.now(),
      backend: get().backend,
    };

    set((s: HiggsfieldStore) => ({ jobs: [job, ...s.jobs] }));

    const settings: any = {
      backend: get().backend,
      proxyUrl: get().proxyUrl,
      defaultImageModel: get().defaultImageModel,
      defaultVideoModel: get().defaultVideoModel,
    };

    executeJob(job, settings)
      .then((finished) => {
        set((s: HiggsfieldStore) => ({
          jobs: s.jobs.map((j) => (j.id === finished.id ? finished : j)),
          history: [finished, ...s.history].slice(0, MAX_HISTORY),
        }));
        persist(get().history);
      })
      .catch(() => {
        /* executeJob handles its own failure states */
      });
  },

  clearHistory: () => {
    set({ history: [] });
    persist([]);
  },

  _loadPersisted: () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) set({ history: parsed });
    } catch {
      /* corrupt payload — ignore */
    }
  },
}));

useHiggsfieldStore.getState()._loadPersisted();
