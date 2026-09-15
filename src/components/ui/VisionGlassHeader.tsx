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
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(28px) saturate(190%)",
        WebkitBackdropFilter: "blur(28px) saturate(190%)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.25)",
        flexShrink: 0,
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* ── LEFT: Logo + Brand ── */}
      <div className="vision-glass-header-brand" style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
        {/* Animated logo mark */}
        <div
          style={{
            position: "relative",
            width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute", inset: -2,
              borderRadius: 12,
              background: "conic-gradient(from 0deg, rgba(0,136,255,0.3), rgba(56,189,248,0.15), rgba(168,85,247,0.2), rgba(0,136,255,0.3))",
              animation: "vg-logo-spin 8s linear infinite",
              filter: "blur(3px)",
            }}
          />
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{
              height: 20, width: 20, color: "#0088ff",
              filter: "drop-shadow(0 0 6px rgba(0,136,255,0.5))",
              position: "relative", zIndex: 1,
            }}
            fill="currentColor"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        <div>
          <div style={{
            fontSize: 13, fontWeight: 800, letterSpacing: "0.06em",
            color: "#f8fafc", lineHeight: 1,
            background: "linear-gradient(135deg, #f8fafc 30%, #fbbf24 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            APEX ENGINEER
          </div>
          <div style={{
            fontSize: 9, fontWeight: 600, letterSpacing: "0.12em",
            color: "#64748b", textTransform: "uppercase" as const,
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
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 10, padding: "4px 10px",
            fontSize: 10, color: "#94a3b8", fontFamily: "monospace",
          }}
        >
          <Clock size={10} style={{ color: "#64748b" }} aria-hidden="true" />
          <span style={{ color: "#cbd5e1", fontWeight: 600 }}>{timeStr}</span>
        </div>

        {/* Economy status pill */}
        <div
          aria-label={`Economy Status: Month ${month}, Revenue ${fmtRev}`}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 10, padding: "4px 12px",
            fontSize: 10,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: 9, fontWeight: 700 }}>MO</span>
          <span style={{ color: "#fbbf24", fontWeight: 800, fontFamily: "monospace", fontSize: 11 }}>{month}</span>
          <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.12)" }} />
          <span style={{ color: "#34d399", fontWeight: 800, fontFamily: "monospace", fontSize: 11 }}>{fmtRev}</span>
          <button
            onClick={onAdvanceMonth}
            onMouseEnter={() => setHovered("advance")}
            onMouseLeave={() => setHovered(null)}
            aria-label="Advance simulation by 1 month"
            className="spring-press focus-visible:outline-none focus-ring-emil"
            style={{
              background: hovered === "advance" ? "rgba(0,136,255,0.30)" : "rgba(0,136,255,0.18)",
              color: "#fbbf24",
              border: "1px solid rgba(0,136,255,0.30)",
              borderRadius: 7,
              padding: "2px 7px",
              fontSize: 9,
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease-out",
              transform: hovered === "advance" ? "scale(1.05)" : "scale(1)",
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
            background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.25)",
            borderRadius: 10, padding: "4px 8px",
            fontSize: 9, fontWeight: 700, color: "#fbbf24",
          }}
        >
          <Sparkles size={10} style={{ animation: "vg-sparkle-pulse 2s ease-in-out infinite" }} aria-hidden="true" />
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
          className="vision-glass-search expanding-search-input btn-interactive spring-press flex items-center justify-between gap-2 focus-visible:outline-none focus-ring-emil"
          style={{
            background: hovered === "search" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
            border: hovered === "search" ? "1px solid rgba(56,189,248,0.4)" : "1px solid rgba(255,255,255,0.10)",
            borderRadius: 10, padding: "4px 10px",
            fontSize: 10, color: "#cbd5e1", cursor: "pointer",
            boxShadow: hovered === "search" ? "0 0 12px rgba(56,189,248,0.2)" : "none",
            transition: "transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease-out, border-color 0.15s ease-out, box-shadow 0.18s ease-out",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Search size={12} style={{ color: "#fbbf24" }} aria-hidden="true" />
            <span className="vision-glass-search-label font-medium text-slate-200">Search Studio...</span>
          </div>
          <span className="vision-glass-search-shortcut" style={{
            fontSize: 9, color: "#94a3b8", background: "rgba(255,255,255,0.08)",
            padding: "1px 5px", borderRadius: 4, fontFamily: "monospace", fontWeight: 700,
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
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 9, padding: 2,
          }}
        >
          {(["metric", "imperial"] as const).map((u) => (
            <button
              key={u}
              role="radio"
              aria-checked={units === u}
              onClick={() => onSetUnits(u)}
              aria-label={`Switch units to ${u}`}
              className="spring-press focus-visible:outline-none focus-ring-emil"
              style={{
                padding: "3px 7px", borderRadius: 7,
                fontSize: 10, fontWeight: units === u ? 700 : 500,
                background: units === u ? "#ffffff" : "transparent",
                color: units === u ? "#080c14" : "#94a3b8",
                border: "none", cursor: "pointer",
                transition: "transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease-out, color 0.15s ease-out",
                boxShadow: units === u ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
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
            className="vision-glass-icon-action spring-press focus-visible:outline-none focus-ring-emil"
            style={{
              padding: 5, borderRadius: 8,
              color: hovered === a.id ? "#f8fafc" : "#94a3b8",
              background: hovered === a.id ? "rgba(255,255,255,0.10)" : "transparent",
              border: "none", cursor: "pointer",
              transition: "transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease-out, color 0.15s ease-out",
              transform: hovered === a.id ? "translateY(-1px) scale(1.06)" : "none",
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
            className="vision-glass-focus-toggle spring-press focus-visible:outline-none focus-ring-emil"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 8px", borderRadius: 9,
              fontSize: 9, fontWeight: 700,
              color: focusMode ? "#07111f" : "#cbd5e1",
              background: focusMode ? "#fbbf24" : "rgba(255,255,255,0.08)",
              border: focusMode ? "1px solid rgba(251,191,36,0.85)" : "1px solid rgba(255,255,255,0.12)",
              cursor: "pointer",
              transition: "transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease-out, box-shadow 0.18s ease-out",
              boxShadow: focusMode ? "0 0 14px rgba(251,191,36,0.35)" : "none",
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
            className="spring-press focus-visible:outline-none focus-ring-emil"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 8px", borderRadius: 9,
              fontSize: 9, fontWeight: 700,
              color: "#fef3c7",
              background: "rgba(245, 158, 11, 0.18)",
              border: "1px solid rgba(245, 158, 11, 0.45)",
              cursor: "pointer",
              transition: "transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease-out, box-shadow 0.18s ease-out",
              boxShadow: "0 0 10px rgba(245,158,11,0.18)",
            }}
          >
            <Sparkles size={11} style={{ color: "#fbbf24" }} aria-hidden="true" />
            <span style={{ fontFamily: "monospace", letterSpacing: "0.5px" }}>
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
