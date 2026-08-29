import React, { type ReactNode } from "react";

export interface ProvingDeckTab<T extends string = string> {
  id: T;
  label: string;
  icon?: ReactNode;
  badge?: string;
}

export interface GenericProvingDeckProps<T extends string = string> {
  title: string;
  phaseBadge?: string;
  subtitle?: string;
  icon?: ReactNode;
  iconGradient?: string;
  headerBadges?: ReactNode;
  tabs?: ProvingDeckTab<T>[];
  activeTab?: T;
  onTabChange?: (tabId: T) => void;
  children: ReactNode;
  className?: string;
}

export function GenericProvingDeck<T extends string = string>({
  title,
  phaseBadge,
  subtitle,
  icon,
  iconGradient = "from-amber-500/20 via-amber-500/20 to-emerald-500/20 border-amber-500/40 text-amber-400",
  headerBadges,
  tabs,
  activeTab,
  onTabChange,
  children,
  className = "",
}: GenericProvingDeckProps<T>) {
  return (
    <div className={`flex flex-col h-full w-full bg-[#030509] text-gray-100 p-4 gap-4 overflow-y-auto font-sans ${className}`}>
      {/* Studio Header Ribbon */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 rounded-2xl bg-[#070b14] border border-[#1b263b] shadow-2xl gap-4">
        <div className="flex items-center gap-3.5">
          {icon && (
            <div className={`p-2.5 rounded-2xl bg-gradient-to-tr border ${iconGradient}`}>
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-white">
                {title}
              </h1>
              {phaseBadge && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold">
                  {phaseBadge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-400 font-mono">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {headerBadges && (
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {headerBadges}
          </div>
        )}
      </div>

      {/* Tab Switcher if tabs provided */}
      {tabs && tabs.length > 0 && onTabChange && (
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[#070b14] border border-[#1b263b]">
          {tabs.map((t) => {
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[9px] ${isSelected ? "bg-slate-900/40 text-slate-900 font-extrabold" : "bg-amber-500/20 text-amber-300"}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}
