import { useState, useEffect, memo } from "react";
import {
  Save, FolderOpen, RotateCcw, Search, User,
  Clock, Sparkles, Maximize2, Minimize2, Palette,
} from "lucide-react";

interface VisionGlassHeaderProps {
  month: number;
  totalRevenue: number;
  units: "metric" | "imperial";
  onSetUnits: (u: "metric" | "imperial") => void;
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
  onSearch: () => void;
  onAdvanceMonth: () => void;
  uiTheme?: "theme3" | "theme4";
  onSetUiTheme?: (theme: "theme3" | "theme4") => void;
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
}

function VisionGlassHeaderComponent({
  month, totalRevenue, units,
  onSetUnits, onSave, onLoad, onReset, onSearch, onAdvanceMonth,
  uiTheme = "theme4", onSetUiTheme, focusMode = false, onToggleFocusMode,
}: VisionGlassHeaderProps) {
  const [time, setTime] = useState(new Date());
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const fmtRev = totalRevenue >= 1e6
    ? `$${(totalRevenue / 1e6).toFixed(1)}M`
    : `$${(totalRevenue / 1e3).toFixed(0)}k`;

  return (
    <header
      role="banner"
      className="vision-glass-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        height: 48,
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        background: "rgba(255, 255, 255, 0.35)",
        backdropFilter: "blur(40px) saturate(190%)",
        WebkitBackdropFilter: "blur(40px) saturate(190%)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.85)",
        flexShrink: 0,
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* ── LEFT: Logo + Brand ── */}
      <div className="vision-glass-header-brand" style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
        {/* Apple visionOS Logo Plinth */}
        <div
          style={{
            position: "relative",
            width: 30, height: 30,
            borderRadius: 9,
            background: "rgba(0, 122, 255, 0.12)",
            border: "1px solid rgba(0, 122, 255, 0.25)",
            boxShadow: "0 2px 8px rgba(0, 122, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.80)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{
              height: 18, width: 18, color: "#007aff",
            }}
            fill="currentColor"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        <div>
          <div style={{
            fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em",
            color: "#1c1c1e", lineHeight: 1.1,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
          }}>
            APEX ENGINEER
          </div>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
            color: "#8e8e93", textTransform: "uppercase" as const,
          }}>
            Vision Studio
          </div>
        </div>
      </div>

      {/* ── CENTER: Status Pill Cluster ── */}
      <div
        className="vision-glass-header-status"
        style={{
          display: "flex", alignItems: "center", gap: 6,
          position: "absolute", left: "50%", transform: "translateX(-50%)",
        }}
      >
        {/* Live time pill */}
        <div
          aria-label={`Current time: ${timeStr}`}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 8, padding: "3px 9px",
            fontSize: 10, color: "#636366", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          <Clock size={10} style={{ color: "#8e8e93" }} aria-hidden="true" />
          <span style={{ color: "#1c1c1e", fontWeight: 600 }}>{timeStr}</span>
        </div>

        {/* Economy status pill */}
        <div
          aria-label={`Economy Status: Month ${month}, Revenue ${fmtRev}`}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 8, padding: "3px 10px",
            fontSize: 10,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          <span style={{ color: "#8e8e93", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 9, fontWeight: 700 }}>MO</span>
          <span style={{ color: "#b45309", fontWeight: 800, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 11 }}>{month}</span>
          <div style={{ width: 1, height: 12, background: "rgba(0,0,0,0.10)" }} />
          <span style={{ color: "#059669", fontWeight: 800, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 11 }}>{fmtRev}</span>
          <button
            onClick={onAdvanceMonth}
            onMouseEnter={() => setHovered("advance")}
            onMouseLeave={() => setHovered(null)}
            aria-label="Advance simulation by 1 month"
            className="spring-press focus-visible:outline-none focus-ring-emil active:scale-95"
            style={{
              background: hovered === "advance" ? "rgba(0,122,255,0.18)" : "rgba(0,122,255,0.08)",
              color: "#007aff",
              border: "1px solid rgba(0,122,255,0.25)",
              borderRadius: 6,
              padding: "2px 7px",
              fontSize: 9,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.16s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            +1 Mo
          </button>
        </div>

        {/* AI status indicator */}
        <div
          aria-label="Apex AI agent active"
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "rgba(147, 51, 234, 0.08)",
            border: "1px solid rgba(147, 51, 234, 0.20)",
            borderRadius: 8, padding: "3px 8px",
            fontSize: 9, fontWeight: 700, color: "#7e22ce",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          <Sparkles size={10} style={{ color: "#9333ea" }} aria-hidden="true" />
          <span>AI ON</span>
        </div>
      </div>

      {/* ── RIGHT: Actions cluster ── */}
      <div className="vision-glass-header-actions" style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 180, justifyContent: "flex-end" }}>
        {/* Search capsule */}
        <button
          onClick={onSearch}
          onMouseEnter={() => setHovered("search")}
          onMouseLeave={() => setHovered(null)}
          aria-label="Search studio modules (Control plus K)"
          className="vision-glass-search expanding-search-input btn-interactive spring-press flex items-center justify-between gap-2 focus-visible:outline-none focus-ring-emil active:scale-95"
          style={{
            background: hovered === "search" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)",
            border: hovered === "search" ? "1px solid rgba(0,122,255,0.35)" : "1px solid rgba(0,0,0,0.08)",
            borderRadius: 8, padding: "3px 10px",
            fontSize: 10, color: "#1c1c1e", cursor: "pointer",
            boxShadow: hovered === "search" ? "0 2px 8px rgba(0,122,255,0.12)" : "inset 0 1px 0 rgba(255,255,255,0.85)",
            transition: "all 0.16s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Search size={12} style={{ color: "#007aff" }} aria-hidden="true" />
            <span className="vision-glass-search-label font-medium text-slate-800">Search Studio...</span>
          </div>
          <span className="vision-glass-search-shortcut" style={{
            fontSize: 9, color: "#636366", background: "rgba(0,0,0,0.06)",
            padding: "1px 5px", borderRadius: 4, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 700,
          }}>
            ⌘K
          </span>
        </button>

        {/* Unit toggle */}
        <div
          className="vision-glass-unit-toggle"
          role="radiogroup"
          aria-label="Measurement Units"
          style={{
            display: "flex", alignItems: "center", gap: 1,
            background: "rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 8, padding: 2,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          {(["metric", "imperial"] as const).map((u) => (
            <button
              key={u}
              role="radio"
              aria-checked={units === u}
              onClick={() => onSetUnits(u)}
              aria-label={`Switch units to ${u}`}
              className="spring-press focus-visible:outline-none focus-ring-emil active:scale-95"
              style={{
                padding: "3px 7px", borderRadius: 6,
                fontSize: 10, fontWeight: units === u ? 700 : 500,
                background: units === u ? "#ffffff" : "transparent",
                color: units === u ? "#1c1c1e" : "#8e8e93",
                border: "none", cursor: "pointer",
                transition: "all 0.16s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: units === u ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
              }}
            >
              <span className="vision-glass-unit-full">{u.charAt(0).toUpperCase() + u.slice(1)}</span>
              <span className="vision-glass-unit-short" aria-hidden="true">{u === "metric" ? "M" : "I"}</span>
            </button>
          ))}
        </div>

        {/* Icon actions */}
        {[
          { fn: onSave, icon: <Save size={13} />, tip: "Save Design", id: "save" },
          { fn: onLoad, icon: <FolderOpen size={13} />, tip: "Load Design", id: "load" },
          { fn: onReset, icon: <RotateCcw size={13} />, tip: "Reset Defaults", id: "reset" },
        ].map((a) => (
          <button
            key={a.id}
            onClick={a.fn}
            title={a.tip}
            aria-label={a.tip}
            onMouseEnter={() => setHovered(a.id)}
            onMouseLeave={() => setHovered(null)}
            className="vision-glass-icon-action spring-press focus-visible:outline-none focus-ring-emil active:scale-95"
            style={{
              padding: 5, borderRadius: 7,
              color: hovered === a.id ? "#1c1c1e" : "#636366",
              background: hovered === a.id ? "rgba(0,0,0,0.06)" : "transparent",
              border: "none", cursor: "pointer",
              transition: "all 0.16s cubic-bezier(0.16, 1, 0.3, 1)",
              transform: hovered === a.id ? "translateY(-1px) scale(1.05)" : "none",
            }}
          >
            {a.icon}
          </button>
        ))}

        {onToggleFocusMode && (
          <button
            type="button"
            onClick={onToggleFocusMode}
            title={focusMode ? "Exit Focus Workspace (Ctrl + Shift + F)" : "Enter Focus Workspace (Ctrl + Shift + F)"}
            aria-label={focusMode ? "Exit focus workspace" : "Enter focus workspace"}
            aria-pressed={focusMode}
            className="vision-glass-focus-toggle spring-press focus-visible:outline-none focus-ring-emil active:scale-95"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 8px", borderRadius: 8,
              fontSize: 9, fontWeight: 700,
              color: focusMode ? "#ffffff" : "#1c1c1e",
              background: focusMode ? "#007aff" : "rgba(0,0,0,0.05)",
              border: focusMode ? "1px solid rgba(0,122,255,0.85)" : "1px solid rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "all 0.16s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: focusMode ? "0 2px 8px rgba(0,122,255,0.25)" : "inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            {focusMode ? <Minimize2 size={12} aria-hidden="true" /> : <Maximize2 size={12} aria-hidden="true" />}
            <span className="vision-glass-focus-label">{focusMode ? "EXIT FOCUS" : "FOCUS"}</span>
          </button>
        )}

        {/* Theme Indicator & Quick Toggle */}
        {onSetUiTheme && (
          <button
            type="button"
            onClick={() => onSetUiTheme(uiTheme === "theme4" ? "theme3" : "theme4")}
            title={uiTheme === "theme4" ? "Active: UI 4 (Vision Glass) — Click to switch to Theme 3" : "Active: Theme 3 — Click to switch to UI 4 (Vision Glass)"}
            aria-label="Toggle UI theme"
            className="spring-press focus-visible:outline-none focus-ring-emil active:scale-95"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 8px", borderRadius: 8,
              fontSize: 9, fontWeight: 700,
              color: "#1c1c1e",
              background: "rgba(0,122,255,0.08)",
              border: "1px solid rgba(0,122,255,0.20)",
              cursor: "pointer",
              transition: "all 0.16s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            <Sparkles size={11} style={{ color: "#007aff" }} aria-hidden="true" />
            <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", letterSpacing: "0.2px" }}>
              {uiTheme === "theme4" ? "SWITCH TO THEME 3" : "UI 4 (VISION GLASS)"}
            </span>
          </button>
        )}


        {/* User avatar */}
        <div
          aria-label="User Profile"
          className="vision-glass-profile"
          style={{
            width: 26, height: 26, borderRadius: "50%",
            background: "linear-gradient(135deg, #0088ff 0%, #fbbf24 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 10, fontWeight: 800,
            boxShadow: "0 2px 8px rgba(0,136,255,0.3)",
            marginLeft: 4,
          }}
        >
          <User size={13} aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}

export const VisionGlassHeader = memo(VisionGlassHeaderComponent);
