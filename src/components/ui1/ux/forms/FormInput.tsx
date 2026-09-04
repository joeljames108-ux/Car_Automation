import React, { useState, useId } from "react";
export interface FormInputProps {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: string; hint?: string;
  disabled?: boolean; required?: boolean; icon?: React.ReactNode; className?: string;
}
export const FormInput: React.FC<FormInputProps> = ({label,value,onChange,placeholder,type="text",error,hint,disabled,required,icon,className=""}) => {
  const [focused, setFocused] = useState(false);
  const id = useId();
  return (
    <div className={"flex flex-col gap-1.5 "+className}>
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/70">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-300/40">{icon}</div>}
        <input id={id} type={type} value={value} placeholder={placeholder} disabled={disabled}
          onChange={(e) => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full px-3 py-2.5 rounded-xl text-sm text-amber-100 placeholder-amber-300/30 outline-none transition-all disabled:opacity-50"
          style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+(error?"rgba(239,68,68,0.5)":focused?"rgba(196,168,96,0.4)":"rgba(255,255,255,0.08)"),boxShadow:focused?"0 0 0 3px rgba(196,168,96,0.1)":"none"}}
        />
      </div>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
      {hint && !error && <span className="text-[11px] text-amber-300/40">{hint}</span>}
    </div>
  );
};
