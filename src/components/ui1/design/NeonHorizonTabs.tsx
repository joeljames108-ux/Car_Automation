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
      "bg-[#0a111e]/80 backdrop-blur-xl p-1 rounded-2xl border border-sky-400/15 shadow-inner flex items-center gap-1 overflow-x-auto no-scrollbar",
    pills:
      "bg-black/30 p-1 rounded-xl border border-white/5 flex items-center gap-1 overflow-x-auto no-scrollbar",
    underline:
      "border-b border-sky-400/15 flex items-center gap-2 overflow-x-auto no-scrollbar px-2",
    compact:
      "bg-[#0a111e]/80 p-0.5 rounded-xl border border-white/10 flex items-center gap-0.5",
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
              className={`nh-focus relative px-4 py-2 text-xs font-semibold nh-font-body tracking-wider transition-all duration-200 flex items-center gap-2 ${
 isActive
 ? "text-sky-200 font-bold"
 : "text-amber-200/60 hover:text-amber-50 hover:bg-white/5 rounded-t-lg"
 } ${tab.disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {tab.icon && <span className={isActive ? "text-sky-400" : "text-amber-300/50"}>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-300/70 rounded-full" />
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleSelect(tab.id)}
            disabled={tab.disabled}
            className={`nh-focus px-3.5 py-1.5 rounded-xl text-xs font-semibold nh-font-body tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
 isActive
 ? "bg-white/[0.08] text-white border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] font-bold"
 : "text-amber-200/60 hover:text-amber-50 hover:bg-white/5 border border-transparent"
 } ${tab.disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
          >
            {tab.icon && <span className={isActive ? "text-sky-300" : "text-amber-200/60"}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
};
