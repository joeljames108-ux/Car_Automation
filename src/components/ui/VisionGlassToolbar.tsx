import { useState, useRef, useCallback, type ReactNode } from "react";

interface ToolbarAction {
  id: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  badge?: string;
}

interface VisionGlassToolbarProps {
  actions: ToolbarAction[];
}

function ToolbarButton({ action }: { action: ToolbarAction }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    tooltipTimeout.current = setTimeout(() => setShowTooltip(true), 400);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowTooltip(false);
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
  }, []);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={action.onClick}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 12,
          border: "none",
          cursor: "pointer",
          color: action.isActive ? "#007aff" : isHovered ? "#1c1c1e" : "#636366",
          background: action.isActive
            ? "rgba(0, 122, 255, 0.16)"
            : isHovered
            ? "rgba(255, 255, 255, 0.65)"
            : "transparent",
          transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: isHovered ? "scale(1.16) translateY(-2px)" : "scale(1)",
          boxShadow: isHovered
            ? "0 6px 16px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.85)"
            : action.isActive
            ? "0 0 12px rgba(0, 136, 255, 0.25), inset 0 1px 0 rgba(0, 136, 255, 0.15)"
            : "none",
        }}
      >
        {action.icon}

        {/* Active indicator dot */}
        {action.isActive && (
          <div
            style={{
              position: "absolute",
              right: -2,
              top: "50%",
              transform: "translateY(-50%)",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#0088ff",
              boxShadow: "0 0 6px rgba(0, 136, 255, 0.6)",
              animation: "vg-toolbar-dot-pulse 2s ease-in-out infinite",
            }}
          />
        )}

        {/* Badge */}
        {action.badge && (
          <div
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              minWidth: 14,
              height: 14,
              borderRadius: 7,
              background: "#ff3b30",
              color: "#fff",
              fontSize: 8,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              boxShadow: "0 1px 3px rgba(255, 59, 48, 0.4)",
              animation: "vg-badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {action.badge}
          </div>
        )}
      </button>

      {/* Tooltip label — slides out from left */}
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            left: "calc(100% + 10px)",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 600,
            color: "#1c1c1e",
            whiteSpace: "nowrap" as const,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.10)",
            animation: "vg-tooltip-slide-in 0.2s ease-out",
            pointerEvents: "none" as const,
            zIndex: 100,
          }}
        >
          {action.label}
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              left: -4,
              top: "50%",
              transform: "translateY(-50%) rotate(45deg)",
              width: 8,
              height: 8,
              background: "rgba(255, 255, 255, 0.85)",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              borderTop: "none",
              borderRight: "none",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function VisionGlassToolbar({ actions }: VisionGlassToolbarProps) {
  return (
    <div
      className="hidden md:flex flex-col items-center"
      style={{
        position: "absolute",
        left: 18,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 30,
        background: "rgba(255, 252, 245, 0.58)",
        backdropFilter: "blur(50px) saturate(220%)",
        WebkitBackdropFilter: "blur(50px) saturate(220%)",
        border: "1px solid rgba(255, 255, 255, 0.75)",
        borderRadius: 22,
        padding: "12px 8px",
        boxShadow:
          "0 16px 40px rgba(0, 0, 0, 0.10), " +
          "0 4px 12px rgba(0, 0, 0, 0.05), " +
          "inset 0 1px 0 rgba(255, 255, 255, 0.90)",
        gap: 4,
        animation: "vg-toolbar-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
      }}
    >
      {/* Top section — navigation */}
      {actions.slice(0, -2).map((action) => (
        <ToolbarButton key={action.id} action={action} />
      ))}

      {/* Divider */}
      {actions.length > 2 && (
        <div
          style={{
            width: 20,
            height: 1,
            background: "rgba(255, 255, 255, 0.10)",
            margin: "4px 0",
            borderRadius: 1,
          }}
        />
      )}

      {/* Bottom section — utility */}
      {actions.slice(-2).map((action) => (
        <ToolbarButton key={action.id} action={action} />
      ))}
    </div>
  );
}
