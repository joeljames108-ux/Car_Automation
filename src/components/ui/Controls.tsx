import { useState, useEffect, useMemo, useRef, useCallback, type ReactNode } from "react";
import { ChevronDown, Check, Zap } from "lucide-react";
import { ApexTooltip } from "./ApexTooltip";
import { AnimatedCounter } from "./AnimatedCounter";

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

export function Section({ title, icon, children, className = "", collapsible = false, defaultOpen = true }: {
  title: string; icon?: ReactNode; children: ReactNode; className?: string; collapsible?: boolean; defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`panel p-4 transition-shadow duration-300 hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)] ${className}`}>
      {title && (
        <div
          onClick={() => collapsible && setIsOpen((prev) => !prev)}
          className={`flex items-center justify-between mb-3 ${
            collapsible ? "cursor-pointer select-none group" : ""
          }`}
        >
          <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider group-hover:text-amber-300 transition-colors">
            {icon}
            {title}
          </h3>
          {collapsible && (
            <div className="p-1 rounded-md bg-base-800/80 text-slate-400 group-hover:text-amber-300 group-hover:bg-base-750 transition-all">
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
              />
            </div>
          )}
        </div>
      )}
      {(!collapsible || isOpen) && (
        <div className="animate-stage-transition-enter">
          {children}
        </div>
      )}
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
    <div className="slider-card-capsule group/slider relative my-1.5 p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 backdrop-blur-xl shadow-md transition-all duration-200 hover:border-amber-500/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] select-none">
      {/* Header Row: Icon + Label (Left), Delta + Value (Right) */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Zap size={13} className="slider-icon text-amber-400 shrink-0" />
          <label className="text-xs font-mono font-bold tracking-wide text-slate-100 flex items-center gap-1 truncate">
            {label}
          </label>
          <ApexTooltip label={label} />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Live Differential Delta Badge (+X / -X) */}
          {diff !== 0 && (
            <span
              className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-md animate-in fade-in zoom-in-90 duration-150 ${
                diff > 0
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
              title={`Adjusted from initial value: ${initialRef.current}${unit || ""}`}
            >
              {diff > 0 ? `+${diff}` : `${diff}`}
            </span>
          )}

          {/* Current Slider Value */}
          <span className="slider-value-text font-mono text-xs font-extrabold text-amber-300 tracking-tight bg-slate-900/80 border border-amber-500/30 px-2 py-0.5 rounded-md shadow-[0_0_8px_rgba(245,158,11,0.2)]">
            {format ? format(localVal) : localVal}{unit && <span className="text-slate-400 text-[10px] font-normal ml-0.5">{unit}</span>}
          </span>
        </div>
      </div>
      
      {/* Slider Track with Stepper Controls */}
      <div className="flex items-center gap-2">
        {/* Decrement (-) Fine-Tune Button */}
        <button
          type="button"
          onClick={() => handleStepAdjust(-1)}
          disabled={localVal <= min}
          className="slider-step-btn w-6 h-6 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-amber-300 hover:border-amber-400/60 hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-90 shrink-0 font-bold text-xs shadow-sm cursor-pointer"
          title={`Decrease by ${step}${unit || ""}`}
        >
          -
        </button>

        <div className="relative flex-1 flex items-center h-5">
          {/* Custom Solid Progress Track */}
          <div className="slider-track-container absolute left-0 top-1/2 -translate-y-1/2 h-2.5 w-full bg-slate-900 rounded-full overflow-hidden pointer-events-none border border-slate-800 shadow-inner">
            <div
              className="slider-track-fill h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-[width] duration-75"
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
          className="slider-step-btn w-6 h-6 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-amber-300 hover:border-amber-400/60 hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-90 shrink-0 font-bold text-xs shadow-sm cursor-pointer"
          title={`Increase by ${step}${unit || ""}`}
        >
          +
        </button>
      </div>

      {hint && <p className="text-[10px] text-slate-400/80 mt-1 px-0.5 font-mono">{hint}</p>}
    </div>
  );
}

export function Select<T extends string>({ label, value, options, onChange }: {
  label?: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={containerRef} className="relative w-full select-none">
      {label && (
        <label className="label-mono mb-1.5 flex items-center gap-1.5">
          {label}
          <ApexTooltip label={label} />
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="custom-glass-select-trigger w-full bg-base-850 border border-base-700 rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer hover:border-amber-400/50 shadow-sm text-left"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : String(value)}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 shrink-0 text-slate-400 ${isOpen ? "rotate-180 text-amber-400" : ""}`} />
      </button>

      {/* Custom Glass Dropdown Menu Popup */}
      {isOpen && (
        <div
          className="custom-glass-select-dropdown absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl p-1.5 shadow-2xl backdrop-blur-3xl border border-white/20 animate-scale-reveal flex flex-col gap-0.5 max-h-60 overflow-y-auto"
        >
          {options.map((o) => {
            const isSelected = o.value === value;
            return (
              <button
                key={String(o.value)}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setIsOpen(false);
                }}
                className={`custom-glass-select-option w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "is-selected font-bold"
                    : ""
                }`}
              >
                <span className="truncate">{o.label}</span>
                {isSelected && <Check size={13} className="shrink-0 text-amber-500" />}
              </button>
            );
          })}
        </div>
      )}
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
          className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
            value === o.value
              ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.5)] scale-[1.02]"
              : "bg-base-850/80 border-base-750 text-slate-300 hover:text-slate-100 hover:bg-white/5"
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
      <span className="label-mono flex items-center gap-1.5">
        {label}
        <span onClick={(e) => e.stopPropagation()}>
          <ApexTooltip label={label} />
        </span>
      </span>
      <span className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${value ? "bg-accent-500 shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "bg-base-700"}`}>
        <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-300 ease-out ${value ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}
type Accent = "accent" | "ok" | "warn" | "danger" | "default";

export function StatTile({ label, value, unit, sub, accent = "default", icon, decimals }: {
  label: string; value: string | number; unit?: string; sub?: string; accent?: Accent; icon?: ReactNode; decimals?: number;
}) {
  const colorMap: Record<Accent, string> = {
    accent: "text-accent-300",
    ok: "text-ok-400",
    warn: "text-warn-400",
    danger: "text-danger-400",
    default: "text-slate-200",
  };

  const isNumeric = typeof value === "number";

  return (
    <div className="bg-base-850 border border-base-800 rounded-xl px-3.5 py-2.5 interactive-card transition-all duration-300 hover:border-amber-500/30">
      <div className="label-mono mb-1 flex items-center gap-1.5 text-[11px] text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`font-mono text-base font-bold ${colorMap[accent]} transition-colors flex items-baseline gap-1`}>
        {isNumeric ? (
          <AnimatedCounter value={value as number} decimals={decimals ?? (Number.isInteger(value as number) ? 0 : 1)} />
        ) : (
          <span>{value}</span>
        )}
        {unit && <span className="text-xs font-normal text-slate-400">{unit}</span>}
      </div>
      {sub && <div className="text-[10px] text-slate-500 mt-0.5 truncate">{sub}</div>}
    </div>
  );
}

export function ProgressBar({ value, max = 100, label, color = "bg-accent-500", className = "" }: {
  value: number; max?: number; label?: string; color?: string; className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-xs mb-1 font-mono text-slate-300">
          <span>{label}</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-base-800 overflow-hidden border border-base-700/50">
        <div
          className={`h-full ${color} smooth-progress-fill rounded-full shadow-[0_0_8px_rgba(34,211,238,0.4)]`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
