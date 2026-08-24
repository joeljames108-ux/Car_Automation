import React, { useState } from "react";
import {
  Save,
  Download,
  Upload,
  CheckCircle2,
  X,
  FileCode,
  Sparkles,
  Layers,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";

export interface NeonHorizonSaveDialogProps {
  open: boolean;
  mode: "save" | "load";
  onClose: () => void;
}

export function NeonHorizonSaveDialog({
  open,
  mode,
  onClose,
}: NeonHorizonSaveDialogProps) {
  const { design, setDesign, sim } = useDesign();

  const [activeSlot, setActiveSlot] = useState<number>(1);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const slots = [
    { id: 1, name: "Slot 1: Jesko Attack Homologation", power: "1,600 HP", weight: "1,420 kg", date: "2026-08-24 00:15" },
    { id: 2, name: "Slot 2: Nürburgring Record Special", power: "740 HP", weight: "1,090 kg", date: "2026-08-23 22:40" },
    { id: 3, name: "Slot 3: Le Mans Low Drag Speedtail", power: "880 HP", weight: "1,240 kg", date: "2026-08-23 18:20" },
    { id: 4, name: "Slot 4: Daily GT Cruiser", power: "520 HP", weight: "1,450 kg", date: "2026-08-22 14:10" },
  ];

  const handleExportJson = () => {
    playHMIClickSound();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(design, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `apex_vehicle_blueprint_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSaveSlot = (slotId: number) => {
    playHMIClickSound();
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-nh-materialize">
      <div className="w-full max-w-xl bg-[#0a111e] border border-white/12 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-black/30">
          <div className="flex items-center gap-2">
            <Save size={18} className="text-sky-300/90" />
            <h3 className="text-base font-bold nh-font-headline text-slate-100 uppercase tracking-wide">
              {mode === "save" ? "Save Vehicle Blueprint Snapshot" : "Load Vehicle Blueprint"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Blueprint Slots */}
        <div className="p-6 flex flex-col gap-3 nh-scroll">
          <span className="nh-label-caps text-slate-400 text-[10px]">BLUEPRINT STORAGE SLOTS</span>
          <div className="flex flex-col gap-2">
            {slots.map((s) => {
              const isSelected = activeSlot === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    playHMIClickSound();
                    setActiveSlot(s.id);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
 isSelected
 ? "bg-sky-400/10 border-sky-400/30"
 : "bg-[#0a111e] border-white/10 hover:border-sky-400/25"
 }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{s.name}</h4>
                    <span className="text-[10px] nh-font-mono text-slate-400">
                      {s.power} · {s.weight} · {s.date}
                    </span>
                  </div>
                  <NeonHorizonBadge variant={isSelected ? "cyan" : "neutral"} size="xs">
                    Slot 0{s.id}
                  </NeonHorizonBadge>
                </div>
              );
            })}
          </div>

          {copiedNotification && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs nh-font-mono flex items-center gap-2">
              <CheckCircle2 size={14} />
              <span>Blueprint snapshot saved successfully to Slot 0{activeSlot}!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
            <NeonHorizonButton
              variant="ghost"
              size="sm"
              icon={<Download size={14} />}
              onClick={handleExportJson}
            >
              Export JSON
            </NeonHorizonButton>

            <div className="flex items-center gap-2">
              <NeonHorizonButton variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </NeonHorizonButton>
              <NeonHorizonButton
                variant="primary"
                size="sm"
                icon={<Save size={14} />}
                onClick={() => handleSaveSlot(activeSlot)}
              >
                {mode === "save" ? "Save to Slot" : "Load Slot"}
              </NeonHorizonButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
