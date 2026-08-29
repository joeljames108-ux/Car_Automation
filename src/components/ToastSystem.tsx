import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from "lucide-react";

export type ToastType = "success" | "info" | "warning" | "rd";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, "id">) => void;
  success: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warn: (title: string, description?: string) => void;
  rd: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, description }: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev.slice(-4), { id, type, title, description }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description?: string) => toast({ type: "success", title, description }),
    [toast]
  );
  const info = useCallback(
    (title: string, description?: string) => toast({ type: "info", title, description }),
    [toast]
  );
  const warn = useCallback(
    (title: string, description?: string) => toast({ type: "warning", title, description }),
    [toast]
  );
  const rd = useCallback(
    (title: string, description?: string) => toast({ type: "rd", title, description }),
    [toast]
  );

  const contextValue = React.useMemo(() => ({
    toast, success, info, warn, rd
  }), [toast, success, info, warn, rd]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-slide-left ${
              t.type === "success"
                ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50"
                : t.type === "warning"
                ? "bg-amber-950/70 border-amber-500/40 text-amber-200 shadow-amber-950/50"
                : t.type === "rd"
                ? "bg-amber-950/70 border-amber-500/40 text-amber-200 shadow-purple-950/50"
                : "bg-amber-950/70 border-amber-500/40 text-amber-200 shadow-cyan-950/50"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {t.type === "warning" && <AlertCircle className="w-4 h-4 text-amber-400" />}
              {t.type === "rd" && <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />}
              {t.type === "info" && <Info className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold tracking-wide">{t.title}</div>
              {t.description && <div className="text-[11px] opacity-80 mt-0.5 leading-snug">{t.description}</div>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
