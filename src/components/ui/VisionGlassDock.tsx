import { useState, useRef, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

interface StageItem {
  id: string;
  label: string;
  icon: ReactNode;
  category: string;
}

interface CategoryItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface VisionGlassDockProps {
  stages: StageItem[];
  categories: CategoryItem[];
  activeCategory: string;
  activeStage: string;
  onSelectCategory: (id: string) => void;
  onSelectStage: (id: string) => void;
}

export function VisionGlassDock({
  stages, categories, activeCategory, activeStage,
  onSelectCategory, onSelectStage,
}: VisionGlassDockProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const activeCategoryStages = stages.filter((s) => s.category === activeCategory);

  // Magnification effect calculation
  const getMagnification = useCallback((idx: number) => {
    if (hoveredIdx === null) return 1;
    const distance = Math.abs(idx - hoveredIdx);
    if (distance === 0) return 1.25;
    if (distance === 1) return 1.12;
    if (distance === 2) return 1.04;
    return 1;
  }, [hoveredIdx]);

  return (
    <nav
      role="navigation"
      aria-label="Workspace Module Dock"
      style={{
        position: "absolute",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        maxWidth: "96vw",
      }}
    >
      {/* ── Active Module Label (floating above dock) ── */}
      <div
        key={activeStage}
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#94a3b8",
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          opacity: 0.8,
          animation: "vg-dock-label-in 0.3s ease-out",
        }}
      >
        {stages.find((s) => s.id === activeStage)?.label ?? ""}
      </div>

      {/* ── Main Dock Bar ── */}
      <div
        ref={dockRef}
        role="toolbar"
        aria-label="Module Stages"
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 3,
          maxWidth: "100%",
          overflowX: "auto",
          // Apple Vision OS Translucent Light Glass dock
          background: "rgba(255, 255, 255, 0.78)",
          backdropFilter: "blur(50px) saturate(200%)",
          WebkitBackdropFilter: "blur(50px) saturate(200%)",
          border: "1.5px solid rgba(255, 255, 255, 0.90)",
          boxShadow:
            "0 14px 45px rgba(0, 0, 0, 0.12), " +
            "0 4px 16px rgba(0, 0, 0, 0.06), " +
            "inset 0 1px 0 rgba(255, 255, 255, 0.95), " +
            "0 0 25px rgba(255, 220, 180, 0.25)",
          borderRadius: 22,
          padding: "5px 8px",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          animation: "vg-prismatic-border 6s ease-in-out infinite",
        }}
      >
        {/* ── Category Buttons ── */}
        {categories.map((cat) => {
          const active = activeCategory === cat.id;
          const isHov = hoveredCat === cat.id;
          return (
            <button
              key={cat.id}
              aria-label={`Switch workspace category to ${cat.label}`}
              aria-current={active ? "true" : undefined}
              onClick={() => {
                onSelectCategory(cat.id);
                // Auto-select first in category if not already there
                const first = stages.find((s) => s.category === cat.id);
                const stagesInCat = stages.filter((s) => s.category === cat.id);
                if (first && !stagesInCat.some((s) => s.id === activeStage)) {
                  onSelectStage(first.id);
                }
              }}
              onMouseEnter={() => setHoveredCat(cat.id)}
              onMouseLeave={() => setHoveredCat(null)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 14px",
                borderRadius: 16,
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                background: active
                  ? "rgba(0, 122, 255, 0.16)"
                  : isHov
                  ? "rgba(255, 255, 255, 0.65)"
                  : "transparent",
                color: active ? "#007aff" : isHov ? "#1c1c1e" : "#475569",
                border: active
                  ? "1px solid rgba(0, 122, 255, 0.30)"
                  : isHov
                  ? "1px solid rgba(255, 255, 255, 0.85)"
                  : "1px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap" as const,
                transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transform: isHov ? "translateY(-4px) scale(1.05)" : "none",
                boxShadow: isHov
                  ? "0 6px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)"
                  : "none",
              }}
            >
              <span style={{ display: "flex", alignItems: "center" }} aria-hidden="true">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}

        {/* ── Divider ── */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(0,0,0,0.12)",
            margin: "0 4px",
            alignSelf: "center",
            borderRadius: 1,
          }}
        />

        {/* ── Module Stage Buttons (with macOS Dock magnification) ── */}
        {activeCategoryStages.map((s, idx) => {
          const cur = activeStage === s.id;
          const mag = getMagnification(idx);
          const isHov = hoveredIdx === idx;

          return (
            <button
              key={s.id}
              onClick={() => onSelectStage(s.id)}
              title={s.label}
              aria-label={`Open stage: ${s.label}`}
              aria-current={cur ? "page" : undefined}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${cur ? "dock-item-active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: `${Math.round(5 * mag)}px ${Math.round(11 * mag)}px`,
                borderRadius: Math.round(14 * mag),
                fontSize: Math.round(11 * mag),
                fontWeight: cur ? 700 : 500,
                background: cur
                  ? "rgba(0, 122, 255, 0.16)"
                  : isHov
                  ? "rgba(0, 0, 0, 0.05)"
                  : "transparent",
                color: cur ? "#007aff" : "#64748b",
                border: cur ? "1px solid rgba(0, 122, 255, 0.30)" : "none",
                cursor: "pointer",
                whiteSpace: "nowrap" as const,
                transition: "all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transform: `scale(${mag})`,
                transformOrigin: "bottom center",
              }}
            >
              <span
                style={{
                  color: cur ? "#007aff" : "#64748b",
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.2s ease",
                }}
                aria-hidden="true"
              >
                {s.icon}
              </span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Active Indicator Dot ── */}
      <div
        aria-hidden="true"
        style={{
          display: "flex",
          gap: 4,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {activeCategoryStages.map((s) => (
          <div
            key={s.id}
            style={{
              width: activeStage === s.id ? 8 : 4,
              height: 4,
              borderRadius: 3,
              background: activeStage === s.id
                ? "#007aff"
                : "rgba(255,255,255,0.25)",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: activeStage === s.id
                ? "0 0 6px rgba(0,122,255,0.5)"
                : "none",
            }}
          />
        ))}
      </div>
    </nav>
  );
}
