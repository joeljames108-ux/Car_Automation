import { create } from "zustand";

const STORAGE_KEY = "apex_live_stats_collapsed_right";

interface LiveStatsRailState {
  isCollapsedToRight: boolean;
  setIsCollapsedToRight: (collapsed: boolean) => void;
  toggleCollapseToRight: () => void;
}

export const useLiveStatsRailStore = create<LiveStatsRailState>((set) => ({
  isCollapsedToRight: (() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  })(),
  setIsCollapsedToRight: (collapsed: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {}
    set({ isCollapsedToRight: collapsed });
  },
  toggleCollapseToRight: () => {
    set((state) => {
      const next = !state.isCollapsedToRight;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return { isCollapsedToRight: next };
    });
  },
}));
