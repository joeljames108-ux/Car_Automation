import React, { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
export interface GlassModalProps {
  isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl"; showClose?: boolean; overlayBlur?: number; className?: string;
}
const SM = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen, onClose, title, children, size = "md", showClose = true, overlayBlur = 12, className = "",
}) => {
  const oRef = useRef<HTMLDivElement>(null);
  const onKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => {
    if (isOpen) { document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [isOpen, onKey]);
  if (!isOpen) return null;
  return (
    <div ref={oRef} className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{backdropFilter:"blur("+overlayBlur+"px)",background:"rgba(0,0,0,0.5)",animation:"fadeIn 0.2s ease"}}
      onClick={(e)=>{if(e.target===oRef.current)onClose()}}>
      <div className={"w-full "+SM[size]+" "+className} style={{
        background:"rgba(26,16,8,0.88)",backdropFilter:"blur(40px) saturate(200%)",
        border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,
        boxShadow:"0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        animation:"scaleIn 0.25s cubic-bezier(0.16,1,0.3,1)",maxHeight:"85vh",overflow:"hidden",
        display:"flex",flexDirection:"column"}}>
        {(title||showClose)&&<div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          {title&&<h2 className="text-sm font-bold text-amber-100 tracking-wide">{title}</h2>}
          {showClose&&<button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-amber-300/60 hover:text-amber-100 transition-all cursor-pointer"><X size={16}/></button>}
        </div>}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-amber-100/90 text-sm">{children}</div>
      </div>
    </div>
  );
};