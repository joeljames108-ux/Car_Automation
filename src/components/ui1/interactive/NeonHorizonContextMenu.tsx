import React, { useEffect, useState, ReactNode } from "react";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
}

export interface NeonHorizonContextMenuProps {
  items: ContextMenuItem[];
  children: ReactNode;
}

export const NeonHorizonContextMenu: React.FC<NeonHorizonContextMenuProps> = ({
  items,
  children,
}) => {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setCoords({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleClick = () => setCoords(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div onContextMenu={handleContextMenu}>
      {children}
      {coords && (
        <div
          className="fixed z-50 animate-nh-materialize select-none"
          style={{ top: coords.y, left: coords.x }}
        >
          <NeonHorizonGlassPanel
            variant="floating"
            glow="cyan"
            corners="sharp"
            className="p-1.5 min-w-[180px] flex flex-col gap-0.5"
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  setCoords(null);
                }}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold nh-font-body tracking-wider transition-all duration-150 cursor-pointer ${
                  item.danger
                    ? "text-rose-300 hover:bg-rose-500/20"
                    : "text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon && <span className="text-cyan-400">{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
                {item.shortcut && (
                  <kbd className="text-[10px] nh-font-mono text-slate-400 opacity-60">
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            ))}
          </NeonHorizonGlassPanel>
        </div>
      )}
    </div>
  );
};
