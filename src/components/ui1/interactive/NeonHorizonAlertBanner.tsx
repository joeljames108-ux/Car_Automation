import React, { useState } from "react";
import {
  AlertTriangle,
  X,
  Flame,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";

export interface NeonHorizonAlertBannerProps {
  type?: "warning" | "danger" | "info";
  title: string;
  message: string;
  onDismiss?: () => void;
}

export function NeonHorizonAlertBanner({
  type = "warning",
  title,
  message,
  onDismiss,
}: NeonHorizonAlertBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const accentClasses =
    type === "danger"
      ? "bg-rose-950/80 border-rose-500/60 text-rose-200"
      : type === "warning"
      ? "bg-amber-950/80 border-amber-500/60 text-amber-200"
      : "bg-slate-900/80 border-sky-400/30 text-sky-200";

  return (
    <div
      className={`w-full p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between gap-4 animate-nh-materialize ${accentClasses}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center border border-white/15">
          {type === "danger" ? (
            <Flame size={16} className="text-rose-400 animate-pulse" />
          ) : (
            <AlertTriangle size={16} className="text-amber-400" />
          )}
        </div>
        <div>
          <div className="text-xs font-bold nh-font-headline tracking-wide uppercase">{title}</div>
          <p className="text-[11px] opacity-90 leading-relaxed">{message}</p>
        </div>
      </div>

      <button
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
}
