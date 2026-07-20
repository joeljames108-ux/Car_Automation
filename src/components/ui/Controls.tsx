import type { ReactNode } from "react";

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

export function Slider({ label, value, min, max, step = 1, onChange, format, unit, hint }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; format?: (v: number) => string; unit?: string; hint?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <label className="label-mono">{label}</label>
        <span className="font-mono text-xs text-accent-300">
          {format ? format(value) : value}{unit && <span className="text-slate-500 ml-0.5">{unit}</span>}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      {hint && <p className="text-[10px] text-slate-600 mt-0.5">{hint}</p>}
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

export function StatTile({ label, value, unit, sub, accent = "default" }: {
  label: string; value: string | number; unit?: string; sub?: string; accent?: Accent;
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
      <div className="label-mono mb-0.5">{label}</div>
      <div className={`font-mono text-base font-semibold ${colorMap[accent]} transition-colors`}>
        {value}
        {unit && <span className="text-xs text-slate-500 ml-0.5">{unit}</span>}
      </div>
      {sub && <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
}
