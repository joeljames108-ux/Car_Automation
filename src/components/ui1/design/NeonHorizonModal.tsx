import React, { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { NeonHorizonGlassPanel } from "./NeonHorizonGlassPanel";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export interface NeonHorizonModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  actions?: ReactNode;
}

export const NeonHorizonModal: React.FC<NeonHorizonModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = "lg",
  actions,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const maxWClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  }[maxWidth];

  const handleClose = () => {
    playHMIClickSound();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#05080f]/80 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className={`relative w-full ${maxWClasses} z-10 animate-nh-materialize`}>
        <NeonHorizonGlassPanel
          variant="window"
          glow="cyan"
          corners="reticle"
          className="p-0 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/8 bg-black/25 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-2 rounded-xl bg-sky-400/10 border border-sky-400/25 text-sky-300">
                  {icon}
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold nh-font-headline tracking-wider text-amber-50 uppercase">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-amber-200/60 nh-font-mono">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl text-amber-200/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/20"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">{children}</div>

          {/* Footer Actions */}
          {actions && (
            <div className="px-6 py-3.5 border-t border-white/8 bg-black/20 flex items-center justify-end gap-3">
              {actions}
            </div>
          )}
        </NeonHorizonGlassPanel>
      </div>
    </div>
  );
};
