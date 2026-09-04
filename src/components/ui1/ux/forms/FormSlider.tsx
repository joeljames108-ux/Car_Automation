import React, { useId } from "react";
export interface FormSliderProps {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string;
  showValue?: boolean; className?: string;
}
export const FormSlider: React.FC<FormSliderProps> = ({label,value,onChange,min=0,max=100,step=1,unit="",showValue=true,className=""}) => {
  const id = useId();
  const pct = ((value-min)/(max-min))*100;
  return (
    <div className={"flex flex-col gap-1.5 "+className}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/70">{label}</label>
        {showValue && <span className="text-[11px] font-mono font-bold text-amber-200">{value}{unit}</span>}
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{background:"linear-gradient(to right, #c4a860 0%, #c4a860 "+pct+"%, rgba(255,255,255,0.08) "+pct+"%, rgba(255,255,255,0.08) 100%)"}}
      />
    </div>
  );
};
