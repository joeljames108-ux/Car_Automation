import React, { ReactNode } from "react";
import { playHMITabSound } from "../../../utils/hmiSoundSynth";

export interface NeonHorizonTabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface NeonHorizonTabsProps {
  tabs: NeonHorizonTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "pills" | "underline" | "glass" | "compact";
  className?: string;
}

export const NeonHorizonTabs: React.FC<NeonHorizonTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "glass",
  className = "",
}) => {
  const handleSelect = (id: string) => {
    playHMITabSound();
    onChange(id);
  };

  const containerStyles = {
    glass:
      "bg-[#081226]/80 backdrop-blur-xl p-1 rounded-2xl border border-cyan-400/20 shadow-inner flex items-center gap-1 overflow-x-auto no-scrollbar",
    pills:
      "bg-black/30 p-1 rounded-xl border border-white/5 flex items-center gap-1 overflow-x-auto no-scrollbar",
    underline:
      "border-b border-cyan-500/20 flex items-center gap-2 overflow-x-auto no-scrollbar px-2",
    compact:
      "bg-[#070e1c]/80 p-0.5 rounded-xl border border-white/10 flex items-center gap-0.5",
  }[variant];

  return (
    <div className={`${containerStyles} ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === "underline") {
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleSelect(tab.id)}
              disabled={tab.disabled}
              className={`relative px-4 py-2 text-xs font-semibold nh-font-body tracking-wider transition-all duration-200 flex items-center gap-2 ${
                isActive
                  ? "text-cyan-200 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-t-lg"
              } ${tab.disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {tab.icon && <span className={isActive ? "text-cyan-400" : "text-slate-500"}>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400 shadow-[0_0_12px_rgba(0,229,255,0.8)]" />
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleSelect(tab.id)}
            disabled={tab.disabled}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold nh-font-body tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              isActive
                ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/25 text-white border border-cyan-400/50 shadow-[0_0_15px_rgba(0,229,255,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
            } ${tab.disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
          >
            {tab.icon && <span className={isActive ? "text-cyan-300" : "text-slate-400"}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
};
