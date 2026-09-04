import React, { useId } from "react";
export interface FormSelectProps {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
  error?: string; disabled?: boolean; className?: string;
}
export const FormSelect: React.FC<FormSelectProps> = ({label,value,onChange,options,placeholder,error,disabled,className=""}) => {
  const id = useId();
  return (
    <div className={"flex flex-col gap-1.5 "+className}>
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/70">{label}</label>
      <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl text-sm text-amber-100 outline-none appearance-none cursor-pointer transition-all disabled:opacity-50"
        style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+(error?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.08)")}}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  );
};
