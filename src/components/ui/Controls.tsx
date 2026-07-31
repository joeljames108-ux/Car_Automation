import { useState, useEffect, useMemo, useRef, useCallback, type ReactNode } from "react";

function useCustomDebounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const debounced = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fnRef.current(...args);
    }, delay);
  }, [delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return useMemo(() => ({ debounced, cancel }), [debounced, cancel]);
}

export function Section({ title, icon, children, className = "" }: {
  title: string; icon?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <div className={`panel p-4 transition-shadow duration-300 hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)] ${className}`}>
      {title && (
        <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          {icon}
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, format, unit, hint, defaultValue }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; format?: (v: number) => string; unit?: string; hint?: string; defaultValue?: number;
}) {
  // Local immediate state for silky smooth 60fps slider dragging
  const [localVal, setLocalVal] = useState<number>(value);
  const isDraggingRef = useRef(false);

  // Sync external value updates when not dragging
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalVal(value);
    }
  }, [value]);

  // Debounced parent onChange update to eliminate re-simulation lag
  const { debounced: debouncedOnChange, cancel } = useCustomDebounce(onChange, 16);

  // Clean up debounce timer
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const handleInputChange = (newVal: number) => {
    const clamped = Math.min(max, Math.max(min, Math.round(newVal / step) * step));
    // Precise float rounding to prevent JS IEEE 754 precision artifacts (e.g. 11.500000000000002)
    const rounded = parseFloat(clamped.toFixed(3));
    setLocalVal(rounded);
    debouncedOnChange(rounded);
  };

  const handleStepAdjust = (dir: 1 | -1) => {
    const nextVal = localVal + dir * step;
    const clamped = Math.min(max, Math.max(min, Math.round(nextVal / step) * step));
    const rounded = parseFloat(clamped.toFixed(3));
    setLocalVal(rounded);
    onChange(rounded);
  };

  const percentage = Math.min(100, Math.max(0, ((localVal - min) / (max - min)) * 100));

  // Store initial baseline value to calculate live differential delta (+X / -X)
  const initialRef = useRef<number>(defaultValue !== undefined ? defaultValue : value);
  const diff = Math.round((localVal - initialRef.current) * 100) / 100;

  return (
    <div className="group/slider relative my-1 select-none">
      <div className="flex justify-between items-baseline mb-1.5">
        <label className="label-mono flex items-center gap-1">
          {label}
        </label>

        <div className="flex items-center gap-1.5">
          {/* Live Differential Delta Badge (+X / -X) */}
          {diff !== 0 && (
            <span
              className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded animate-in fade-in zoom-in-90 duration-150 ${
                diff > 0
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
              title={`Adjusted from initial value: ${initialRef.current}${unit || ""}`}
            >
              {diff > 0 ? `+${diff}` : `${diff}`}
            </span>
          )}

          {/* Current Slider Value Badge */}
          <span className="font-mono text-xs font-bold text-accent-300 bg-accent-500/10 px-2 py-0.5 rounded border border-accent-500/20 shadow-sm transition-all duration-200 group-hover/slider:border-accent-400 group-hover/slider:bg-accent-500/20">
            {format ? format(localVal) : localVal}{unit && <span className="text-slate-400 text-[10px] ml-1">{unit}</span>}
          </span>
        </div>
      </div>
      
      {/* Slider Track with Fine-Tuning + and - Stepper Buttons */}
      <div className="flex items-center gap-2">
        {/* Decrement (-) Fine-Tune Button */}
        <button
          type="button"
          onClick={() => handleStepAdjust(-1)}
          disabled={localVal <= min}
          className="w-6 h-6 rounded-md bg-base-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/80 hover:border-cyan-500/50 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-90 shrink-0 font-bold text-xs shadow-sm"
          title={`Decrease by ${step}${unit || ""}`}
        >
          -
        </button>

        <div className="relative flex-1 flex items-center h-5">
          {/* Custom Progress Fill Track overlay */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden pointer-events-none border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-accent-300 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          {/* Range Input element */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localVal}
            onMouseDown={() => { isDraggingRef.current = true; }}
            onMouseUp={() => { isDraggingRef.current = false; onChange(localVal); }}
            onTouchStart={() => { isDraggingRef.current = true; }}
            onTouchEnd={() => { isDraggingRef.current = false; onChange(localVal); }}
            onChange={(e) => handleInputChange(parseFloat(e.target.value))}
            className="relative z-10 w-full appearance-none bg-transparent cursor-pointer h-full"
          />
        </div>

        {/* Increment (+) Fine-Tune Button */}
        <button
          type="button"
          onClick={() => handleStepAdjust(1)}
          disabled={localVal >= max}
          className="w-6 h-6 rounded-md bg-base-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/80 hover:border-cyan-500/50 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-90 shrink-0 font-bold text-xs shadow-sm"
          title={`Increase by ${step}${unit || ""}`}
        >
          +
        </button>
      </div>

      {/* Subtle min/max scale indicators on hover */}
      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500/60 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200 mt-0.5 px-7">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>

      {hint && <p className="text-[10px] text-slate-400/80 mt-0.5">{hint}</p>}
    </div>
  );
}

export function Select<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div>
      {label && <label className="label-mono mb-1.5 block">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function ChoiceGrid<T extends string>({ value, options, onChange, columns = 2 }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; columns?: number;
}) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            value === o.value
              ? "bg-accent-500/20 border-accent-500/50 text-accent-300"
              : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full py-1"
    >
      <span className="label-mono">{label}</span>
      <span className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${value ? "bg-accent-500 shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "bg-base-700"}`}>
        <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-300 ease-out ${value ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

type Accent = "accent" | "ok" | "warn" | "danger" | "default";

export function StatTile({ label, value, unit, sub, accent = "default", icon }: {
  label: string; value: string | number; unit?: string; sub?: string; accent?: Accent; icon?: ReactNode;
}) {
  const colorMap: Record<Accent, string> = {
    accent: "text-accent-300",
    ok: "text-ok-400",
    warn: "text-warn-400",
    danger: "text-danger-400",
    default: "text-slate-200",
  };
  return (
    <div className="bg-base-850 border border-base-800 rounded-lg px-3 py-2 transition-all duration-300 hover:border-base-700 hover:bg-base-800/60">
      <div className="label-mono mb-0.5 flex items-center gap-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`font-mono text-base font-semibold ${colorMap[accent]} transition-colors`}>
        {value}
        {unit && <span className="text-xs text-slate-500 ml-0.5">{unit}</span>}
      </div>
      {sub && <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
}
