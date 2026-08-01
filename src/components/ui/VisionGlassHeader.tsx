import { useState, useEffect, useCallback } from "react";
import {
  Save, FolderOpen, RotateCcw, Search, User, Settings2,
  Clock, ChevronDown, Sparkles, Wifi, Battery,
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
}

export function VisionGlassHeader({
  month, totalRevenue, units,
  onSetUnits, onSave, onLoad, onReset, onSearch, onAdvanceMonth,
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        height: 48,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        flexShrink: 0,
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* ── LEFT: Logo + Brand ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
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
            background: "linear-gradient(135deg, #f8fafc 30%, #38bdf8 100%)",
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
        style={{
          display: "flex", alignItems: "center", gap: 6,
          position: "absolute", left: "50%", transform: "translateX(-50%)",
        }}
      >
        {/* Live time pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 10, padding: "4px 10px",
          fontSize: 10, color: "#94a3b8", fontFamily: "monospace",
        }}>
          <Clock size={10} style={{ color: "#64748b" }} />
          <span style={{ color: "#cbd5e1", fontWeight: 600 }}>{timeStr}</span>
        </div>

        {/* Economy status pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 10, padding: "4px 12px",
          fontSize: 10,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}>
          <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: 9, fontWeight: 700 }}>MO</span>
          <span style={{ color: "#38bdf8", fontWeight: 800, fontFamily: "monospace", fontSize: 11 }}>{month}</span>
          <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.12)" }} />
          <span style={{ color: "#34d399", fontWeight: 800, fontFamily: "monospace", fontSize: 11 }}>{fmtRev}</span>
          <button
            onClick={onAdvanceMonth}
            onMouseEnter={() => setHovered("advance")}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === "advance" ? "rgba(0,136,255,0.30)" : "rgba(0,136,255,0.18)",
              color: "#38bdf8",
              border: "1px solid rgba(0,136,255,0.30)",
              borderRadius: 7,
              padding: "2px 7px",
              fontSize: 9,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
              transform: hovered === "advance" ? "scale(1.05)" : "scale(1)",
            }}
          >
            +1 Mo
          </button>
        </div>

        {/* AI status indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "rgba(168,85,247,0.12)",
          border: "1px solid rgba(168,85,247,0.25)",
          borderRadius: 10, padding: "4px 8px",
          fontSize: 9, fontWeight: 700, color: "#c084fc",
        }}>
          <Sparkles size={10} style={{ animation: "vg-sparkle-pulse 2s ease-in-out infinite" }} />
          <span>AI ON</span>
        </div>
      </div>

      {/* ── RIGHT: Actions cluster ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 180, justifyContent: "flex-end" }}>
        {/* Search capsule */}
        <button
          onClick={onSearch}
          onMouseEnter={() => setHovered("search")}
          onMouseLeave={() => setHovered(null)}
          className="expanding-search-input btn-interactive flex items-center justify-between gap-2"
          style={{
            background: hovered === "search" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
            border: hovered === "search" ? "1px solid rgba(56,189,248,0.4)" : "1px solid rgba(255,255,255,0.10)",
            borderRadius: 10, padding: "4px 10px",
            fontSize: 10, color: "#cbd5e1", cursor: "pointer",
            boxShadow: hovered === "search" ? "0 0 12px rgba(56,189,248,0.2)" : "none",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Search size={12} style={{ color: "#38bdf8" }} />
            <span className="font-medium text-slate-200">Search Studio...</span>
          </div>
          <span style={{
            fontSize: 9, color: "#64748b", background: "rgba(255,255,255,0.06)",
            padding: "1px 5px", borderRadius: 4, fontFamily: "monospace",
          }}>
            ⌘K
          </span>
        </button>

        {/* Unit toggle */}
        <div style={{
          display: "flex", alignItems: "center", gap: 1,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 9, padding: 2,
        }}>
          {(["metric", "imperial"] as const).map((u) => (
            <button
              key={u}
              onClick={() => onSetUnits(u)}
              style={{
                padding: "3px 7px", borderRadius: 7,
                fontSize: 10, fontWeight: units === u ? 700 : 400,
                background: units === u ? "#ffffff" : "transparent",
                color: units === u ? "#0f172a" : "#64748b",
                border: "none", cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: units === u ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
              }}
            >
              {u.charAt(0).toUpperCase() + u.slice(1)}
            </button>
          ))}
        </div>

        {/* Icon actions */}
        {[
          { fn: onSave, icon: <Save size={13} />, tip: "Save", id: "save" },
          { fn: onLoad, icon: <FolderOpen size={13} />, tip: "Load", id: "load" },
          { fn: onReset, icon: <RotateCcw size={13} />, tip: "Reset", id: "reset" },
        ].map((a) => (
          <button
            key={a.id}
            onClick={a.fn}
            title={a.tip}
            onMouseEnter={() => setHovered(a.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: 5, borderRadius: 8,
              color: hovered === a.id ? "#f8fafc" : "#94a3b8",
              background: hovered === a.id ? "rgba(255,255,255,0.10)" : "transparent",
              border: "none", cursor: "pointer",
              transition: "all 0.2s ease",
              transform: hovered === a.id ? "translateY(-1px)" : "none",
            }}
          >
            {a.icon}
          </button>
        ))}

        {/* User avatar */}
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: "linear-gradient(135deg, #0088ff 0%, #38bdf8 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 10, fontWeight: 800,
          boxShadow: "0 2px 8px rgba(0,136,255,0.3)",
          marginLeft: 4,
        }}>
          <User size={13} />
        </div>
      </div>
    </div>
  );
}
