import React, { useState, useId } from "react";
export interface FormTextAreaProps {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; error?: string; maxLength?: number;
  disabled?: boolean; className?: string;
}
export const FormTextArea: React.FC<FormTextAreaProps> = ({label,value,onChange,placeholder,rows=4,error,maxLength,disabled,className=""}) => {
  const [focused, setFocused] = useState(false);
  const id = useId();
  return (
    <div className={"flex flex-col gap-1.5 "+className}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/70">{label}</label>
        {maxLength && <span className="text-[10px] text-amber-300/40 font-mono">{value.length}/{maxLength}</span>}
      </div>
      <textarea id={id} value={value} placeholder={placeholder} rows={rows} disabled={disabled} maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full px-3 py-2.5 rounded-xl text-sm text-amber-100 placeholder-amber-300/30 outline-none resize-none transition-all disabled:opacity-50"
        style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+(error?"rgba(239,68,68,0.5)":focused?"rgba(196,168,96,0.4)":"rgba(255,255,255,0.08)"),boxShadow:focused?"0 0 0 3px rgba(196,168,96,0.1)":"none"}}
      />
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  );
};
