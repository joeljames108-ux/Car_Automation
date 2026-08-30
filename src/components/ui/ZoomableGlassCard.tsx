import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Maximize2, ArrowLeft, X, Sparkles } from "lucide-react";

interface ZoomableGlassCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
  className?: string;
  allowZoom?: boolean;
}

export function ZoomableGlassCard({
  title,
  subtitle,
  badge,
  children,
  expandedContent,
  className = "",
  allowZoom = true,
}: ZoomableGlassCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [modalRendered, setModalRendered] = useState(false);
  const [modalActive, setModalActive] = useState(false);

  const openZoomModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!allowZoom) return;
    setIsZoomed(true);
    setModalRendered(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setModalActive(true);
      });
    });
  };

  const closeZoomModal = () => {
    setIsZoomed(false);
    setModalActive(false);
    setTimeout(() => {
      setModalRendered(false);
    }, 400);
  };

  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeZoomModal();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isZoomed]);

  return (
    <div
      onClick={allowZoom ? openZoomModal : undefined}
      className={`relative group ${allowZoom ? "cursor-pointer" : ""} ${className}`}
    >
      {/* Zoom Button Icon on Hover */}
      {allowZoom && (
        <button
          onClick={openZoomModal}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/90 border border-amber-400/40 text-amber-400 p-1.5 rounded-full shadow-md z-20 hover:bg-amber-50 hover:scale-110 active:scale-95 cursor-pointer"
          title="Click to Zoom Card"
        >
          <Maximize2 size={12} />
        </button>
      )}

      {children}

      {/* Ultra-Smooth Spatial Glass Lightbox Modal via Portal directly to body */}
      {modalRendered && createPortal(
        <div 
          className={`schematic-backdrop ${modalActive ? "active" : ""}`}
          onClick={closeZoomModal}
        >
          <div 
            className="schematic-modal-container max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Back & Close */}
            <div className="w-full flex items-center justify-between border-b border-amber-200/50 pb-3.5 mb-4">
              <button
                onClick={closeZoomModal}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-400/30 text-xs font-mono font-bold hover:bg-amber-500/20 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-500">
                <Sparkles size={14} className="text-[#007aff]" />
                {title || "Vision Glass Panel"}
              </div>
              <button
                onClick={closeZoomModal}
                className="p-1.5 rounded-full text-amber-200/60 hover:text-amber-500 hover:bg-slate-200/50 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Subtitle / Badge Header */}
            {(subtitle || badge) && (
              <div className="w-full flex items-center justify-between mb-3 text-xs font-mono">
                {subtitle && <span className="text-amber-300/50">{subtitle}</span>}
                {badge && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-[#007aff] font-bold">
                    {badge}
                  </span>
                )}
              </div>
            )}

            {/* High-Resolution Expanded Content Container */}
            <div className="w-full bg-gradient-to-br from-white/95 via-amber-50/30 to-slate-100/50 border border-amber-200/50 rounded-2xl p-5 shadow-sm overflow-hidden">
              {expandedContent || children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
