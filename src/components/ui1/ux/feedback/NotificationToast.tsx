import React, { useState, useCallback, createContext, useContext, useRef, useEffect } from "react";
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from "lucide-react";
export type ToastType = "success" | "warning" | "info" | "error";
export interface Toast { id: string; type: ToastType; title: string; message?: string; duration?: number; }
interface ToastCtx { toasts: Toast[]; addToast: (t: Omit<Toast, "id">) => void; removeToast: (id: string) => void; }
const Ctx = createContext<ToastCtx>({ toasts: [], addToast: () => {}, removeToast: () => {} });
export const useToast = () => useContext(Ctx);
const ICO: Record<ToastType, React.ReactNode> = {
  success: React.createElement(CheckCircle, {size:16,className:"text-emerald-400"}),
  warning: React.createElement(AlertTriangle, {size:16,className:"text-amber-400"}),
  info: React.createElement(Info, {size:16,className:"text-sky-400"}),
  error: React.createElement(AlertCircle, {size:16,className:"text-red-400"}),
};
const BG: Record<ToastType, string> = { success: "rgba(16,185,129,0.12)", warning: "rgba(245,158,11,0.12)", info: "rgba(14,165,233,0.12)", error: "rgba(239,68,68,0.12)" };
const BR: Record<ToastType, string> = { success: "rgba(16,185,129,0.25)", warning: "rgba(245,158,11,0.25)", info: "rgba(14,165,233,0.25)", error: "rgba(239,68,68,0.25)" };
let tc = 0;
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const removeToast = useCallback((id: string) => {
    setToasts(p => p.filter(t => t.id !== id));
    const tm = timers.current.get(id); if (tm) { clearTimeout(tm); timers.current.delete(id); }
  }, []);
  const addToast = useCallback((t: Omit<Toast, "id">) => {
    const id = "t" + (++tc); const nt: Toast = { id, duration: 4000, ...t };
    setToasts(p => [...p.slice(-4), nt]);
    if (nt.duration && nt.duration > 0) { const tm = setTimeout(() => removeToast(id), nt.duration); timers.current.set(id, tm); }
  }, [removeToast]);
  useEffect(() => () => timers.current.forEach(t => clearTimeout(t)), []);
  return (
    <Ctx.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none" style={{maxWidth:380}}>
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl"
            style={{background:BG[t.type],border:"1px solid "+BR[t.type],backdropFilter:"blur(20px)",animation:"slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)"}}>
            <div className="shrink-0 mt-0.5">{ICO[t.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-amber-100">{t.title}</div>
              {t.message && <div className="text-xs text-amber-300/70 mt-0.5">{t.message}</div>}
            </div>
            <button onClick={() => removeToast(t.id)} className="shrink-0 p-1 rounded-full hover:bg-white/10 text-amber-300/50 hover:text-amber-100 transition-all cursor-pointer"><X size={14}/></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
