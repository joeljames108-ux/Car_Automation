import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search, Command, LayoutDashboard, Cog, Car, Paintbrush, Wind,
  Sofa, Factory, Monitor, ShieldCheck, Microscope, Activity,
  FlaskConical, Flag, BarChart3, Warehouse, GitCompare, TrendingUp,
  Trophy, Cpu, Palette, Sparkles, X, ArrowRight
} from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { VEHICLE_PRESET_LIBRARY } from "../sim/vehiclePresets";
import { useToast } from "./ToastSystem";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStage: (stage: string) => void;
}

interface CommandItem {
  id: string;
  category: "Modules" | "Presets" | "Themes" | "Actions";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette({ isOpen, onClose, onSelectStage }: CommandPaletteProps) {
  const { setDesign, setUiTheme, resetDesign } = useDesign();
  const { success, info } = useToast();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Modules
      { id: "mod_command", category: "Modules", title: "Command Center", subtitle: "Overview & Presets", icon: <LayoutDashboard size={16} />, action: () => onSelectStage("command") },
      { id: "mod_engine", category: "Modules", title: "Engine Designer", subtitle: "ICE, Turbo, Hybrid, EV", icon: <Cog size={16} />, action: () => onSelectStage("engine") },
      { id: "mod_vehicle", category: "Modules", title: "Vehicle Architecture", subtitle: "Chassis, Drivetrain & Suspension", icon: <Car size={16} />, action: () => onSelectStage("vehicle") },
      { id: "mod_exterior", category: "Modules", title: "Exterior & Styling", subtitle: "Paint, Lighting & Trim", icon: <Paintbrush size={16} />, action: () => onSelectStage("exterior") },
      { id: "mod_aero", category: "Modules", title: "Aero Lab & Wind Tunnel", subtitle: "Cd, Downforce & CFD", icon: <Wind size={16} />, action: () => onSelectStage("aero") },
      { id: "mod_interior", category: "Modules", title: "Interior & Comfort", subtitle: "Cabin & Materials", icon: <Sofa size={16} />, action: () => onSelectStage("interior") },
      { id: "mod_manufacturing", category: "Modules", title: "Manufacturing", subtitle: "Tooling & Factory Cost", icon: <Factory size={16} />, action: () => onSelectStage("manufacturing") },
      { id: "mod_infotainment", category: "Modules", title: "Electronics & Audio", subtitle: "Display & Sensors", icon: <Monitor size={16} />, action: () => onSelectStage("infotainment") },
      { id: "mod_safety", category: "Modules", title: "Safety Center", subtitle: "Crash Tests & Ratings", icon: <ShieldCheck size={16} />, action: () => onSelectStage("safety") },
      { id: "mod_rd", category: "Modules", title: "R&D Innovation Lab", subtitle: "Tech Trees & Patents", icon: <Microscope size={16} />, action: () => onSelectStage("rd") },
      { id: "mod_simulation", category: "Modules", title: "Simulation Dashboard", subtitle: "0-60, Lap Time, MPG", icon: <Activity size={16} />, action: () => onSelectStage("simulation") },
      { id: "mod_testing", category: "Modules", title: "Testing Lab", subtitle: "Dyno, Skidpad & Thermal", icon: <FlaskConical size={16} />, action: () => onSelectStage("testing") },
      { id: "mod_race", category: "Modules", title: "Race Simulator", subtitle: "Track Battle & telemetry", icon: <Flag size={16} />, action: () => onSelectStage("race") },
      { id: "mod_stats", category: "Modules", title: "Detailed Telemetry Stats", subtitle: "Full Engineering Data", icon: <BarChart3 size={16} />, action: () => onSelectStage("stats") },
      { id: "mod_garage", category: "Modules", title: "Vehicle Garage", subtitle: "Fleet & Saved Models", icon: <Warehouse size={16} />, action: () => onSelectStage("garage") },
      { id: "mod_compare", category: "Modules", title: "Engineering Comparison", subtitle: "Side-by-side spec comparison", icon: <GitCompare size={16} />, action: () => onSelectStage("compare") },
      { id: "mod_economy", category: "Modules", title: "Dynamic Economy", subtitle: "Market Demands & MSRP", icon: <TrendingUp size={16} />, action: () => onSelectStage("economy") },
      { id: "mod_motorsport", category: "Modules", title: "Motorsport Division", subtitle: "WEC, GT3 & F1 Racing", icon: <Trophy size={16} />, action: () => onSelectStage("motorsport") },
      { id: "mod_twin", category: "Modules", title: "Digital Twin", subtitle: "Real-time Telemetry Feed", icon: <Cpu size={16} />, action: () => onSelectStage("twin") },

      // Themes
      { id: "theme_1", category: "Themes", title: "Theme 1 — Cyan Cyber Glass", subtitle: "Default Liquid Glass", icon: <Palette size={16} />, action: () => { setUiTheme("theme1"); success("Theme Switched", "Activated Theme 1 — Cyan Cyber Glass"); } },
      { id: "theme_2", category: "Themes", title: "Theme 2 — Cosmic Nebula", subtitle: "Deep Purple Sci-Fi", icon: <Palette size={16} />, action: () => { setUiTheme("theme2"); success("Theme Switched", "Activated Theme 2 — Cosmic Nebula"); } },
      { id: "theme_3", category: "Themes", title: "Theme 3 — Nordic Light Glass", subtitle: "Minimalist Alabaster White", icon: <Palette size={16} />, action: () => { setUiTheme("theme3"); success("Theme Switched", "Activated Theme 3 — Nordic Light Glass"); } },
      { id: "theme_4", category: "Themes", title: "Theme 4 — Vision Glass", subtitle: "Spatial Glass Lounge", icon: <Palette size={16} />, action: () => { setUiTheme("theme4"); success("Theme Switched", "Activated Theme 4 — Vision Glass"); } },

      // Actions
      { id: "act_reset", category: "Actions", title: "Reset Current Vehicle", subtitle: "Restore factory default specs", icon: <Sparkles size={16} />, action: () => { resetDesign(); info("Vehicle Reset", "Restored default engineering specs"); } },

      // Vehicle Presets
      ...VEHICLE_PRESET_LIBRARY.map((p) => ({
        id: `preset_${p.id}`,
        category: "Presets" as const,
        title: p.name,
        subtitle: `${p.targetMSRP} • ${p.expectedPower}`,
        icon: <Car size={16} className="text-cyan-400" />,
        action: () => {
          setDesign(p.generator());
          success("Preset Loaded", `Loaded vehicle preset: ${p.name}`);
        }
      }))
    ];

    return list;
  }, [onSelectStage, setDesign, setUiTheme, resetDesign, success, info]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Handle arrow key navigation & submit
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-base-950/90 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl animate-scale-reveal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800/80 bg-base-900/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search modules, presets, themes, actions... (or press Esc to close)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No matching modules, presets, or commands found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent"
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${isSelected ? "bg-cyan-500/30 text-cyan-200" : "bg-slate-800/60 text-slate-400"}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold flex items-center gap-2">
                      {item.title}
                      <span className="text-[10px] font-normal uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                        {item.category}
                      </span>
                    </div>
                    {item.subtitle && <div className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</div>}
                  </div>
                  {isSelected && <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />}
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-slate-800/80 bg-base-900/40 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Esc</kbd> Close</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-400 font-medium">
            <Command size={12} /> Ctrl + K
          </div>
        </div>
      </div>
    </div>
  );
}
