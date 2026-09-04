import React, { useId } from "react";
export interface FormToggleProps {
  label: string; checked: boolean; onChange: (v: boolean) => void;
  description?: string; disabled?: boolean; className?: string;
}
export const FormToggle: React.FC<FormToggleProps> = ({label,checked,onChange,description,disabled,className=""}) => {
  const id = useId();
  return (
    <div className={"flex items-center justify-between gap-4 "+className}>
      <div className="flex-1">
        <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/70 cursor-pointer">{label}</label>
        {description && <p className="text-[10px] text-amber-300/40 mt-0.5">{description}</p>}
      </div>
      <button id={id} role="switch" aria-checked={checked} disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className="relative w-10 h-5.5 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50"
        style={{background:checked?"rgba(196,168,96,0.4)":"rgba(255,255,255,0.08)",border:"1px solid "+(checked?"rgba(196,168,96,0.5)":"rgba(255,255,255,0.1)")}}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
          style={{left:checked?"22px":"2px",background:checked?"#c4a860":"rgba(255,255,255,0.4)",boxShadow:checked?"0 0 8px rgba(196,168,96,0.4)":"none"}} />
      </button>
    </div>
  );
};
