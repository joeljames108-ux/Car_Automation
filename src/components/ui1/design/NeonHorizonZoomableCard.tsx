import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Maximize2, ArrowLeft, X, Sparkles } from "lucide-react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

interface NeonHorizonZoomableCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
  className?: string;
  allowZoom?: boolean;
  glowColor?: "cyan" | "magenta" | "gold" | "emerald";
}

export function NeonHorizonZoomableCard({
  title,
  subtitle,
  badge,
  children,
  expandedContent,
  className = "",
  allowZoom = true,
  glowColor = "cyan",
}: NeonHorizonZoomableCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [modalRendered, setModalRendered] = useState(false);
  const [modalActive, setModalActive] = useState(false);

  const glowColors = {
    cyan: { text: "text-amber-300", bg: "bg-amber-500/20" },
    magenta: { text: "text-amber-300", bg: "bg-amber-500/10" },
    gold: { text: "text-amber-300", bg: "bg-amber-500/10" },
    emerald: { text: "text-emerald-300", bg: "bg-emerald-500/10" },
  }[glowColor];

  const openZoomModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!allowZoom) return;
    playHMIClickSound();
    setIsZoomed(true);
    setModalRendered(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setModalActive(true));
    });
  };

  const closeZoomModal = () => {
    setIsZoomed(false);
    setModalActive(false);
    setTimeout(() => setModalRendered(false), 400);
  };

  useEffect(() => {
    if (isZoomed) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isZoomed]);

  return (
    <div
      onClick={allowZoom ? openZoomModal : undefined}
      className={`relative group ${allowZoom ? "cursor-pointer" : ""} ${className}`}
    >
      {allowZoom && (
        <button
          onClick={openZoomModal}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/60 border border-white/15 text-slate-300 p-1.5 rounded-full shadow-lg z-20 hover:bg-white/10 hover:text-white hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
          title="Expand Panel"
        >
          <Maximize2 size={12} />
        </button>
      )}

      {children}

      {modalRendered && createPortal(
        <div
          className={`fixed inset-0 z-[200] flex items-center justify-center p-6 transition-all duration-400 ${
 modalActive ? "bg-black/70 backdrop-blur-xl opacity-100" : "bg-transparent opacity-0 pointer-events-none"
 }`}
          onClick={closeZoomModal}
        >
          <div
            className={`max-w-5xl w-full transition-all duration-400 ${
 modalActive ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
 }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-3xl bg-amber-950/60/95 backdrop-blur-3xl border border-white/12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden p-6">
              <div className="w-full flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <button
                  onClick={closeZoomModal}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] text-slate-200 border border-white/12 text-xs font-mono font-bold hover:bg-white/[0.12] transition-all active:scale-95 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
                  <Sparkles size={14} className={glowColors.text} />
                  {title || "Neon Horizon Panel"}
                </div>
                <button
                  onClick={closeZoomModal}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {(subtitle || badge) && (
                <div className="w-full flex items-center justify-between mb-3 text-xs font-mono">
                  {subtitle && <span className="text-slate-400">{subtitle}</span>}
                  {badge && (
                    <span className={`px-2.5 py-0.5 rounded-full ${glowColors.bg} border border-white/15 ${glowColors.text} font-bold`}>
                      {badge}
                    </span>
                  )}
                </div>
              )}

              <div className="w-full rounded-2xl p-5 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(12,22,38,0.95), rgba(6,11,20,0.98))" }}>
                {expandedContent || children}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
