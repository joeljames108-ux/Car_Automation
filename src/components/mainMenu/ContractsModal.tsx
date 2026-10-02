import React from "react";
import { X, FileText, CheckCircle, ShieldAlert, Award, Building, DollarSign, Handshake, ChevronRight } from "lucide-react";
import { useSimulationClockStore } from "../../state/simulationClockStore";

interface ContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStage?: (stage: string) => void;
}

export const ContractsModal: React.FC<ContractsModalProps> = ({ isOpen, onClose, onSelectStage }) => {
  const { cash } = useSimulationClockStore();

  if (!isOpen) return null;

  const mockContracts = [
    {
      id: "cnt_1",
      title: "Titan Metallurgical Sheet Steel Supply",
      type: "Supplier Agreement",
      status: "Active",
      duration: "3 Years (1978 - 1981)",
      volume: "12,000 t / yr",
      unitPrice: "€880 / t",
      savings: "-4% vs Spot Market",
      icon: <Building size={16} className="text-blue-400" />,
    },
    {
      id: "cnt_2",
      title: "European GT Championship Works Entry",
      type: "Motorsport Sanction",
      status: "Signed",
      duration: "1978 Season (18 Rounds)",
      volume: "2 Car Entries",
      unitPrice: "€1,200,000 Entry Fee",
      savings: "Points eligibility active",
      icon: <Award size={16} className="text-amber-400" />,
    },
    {
      id: "cnt_3",
      title: "Brembo Racing Brake Caliper Exclusive",
      type: "Tier-1 OEM Supply",
      status: "Pending Signature",
      duration: "2 Years",
      volume: "500 Sets Monobloc Calipers",
      unitPrice: "€4,200 / set",
      savings: "+12% Braking Thermal Dissipation",
      icon: <Handshake size={16} className="text-emerald-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.15)"
        }}
      >
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Corporate & Supplier Contracts
              </h2>
              <p className="text-xs text-slate-400">
                B2B Material Procurement, Tier-1 OEM Sourcing & Motorsport Sanctioning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Active Industrial & Racing Commitments
          </div>

          <div className="space-y-3">
            {mockContracts.map((cnt) => (
              <div
                key={cnt.id}
                className="p-4 rounded-xl border bg-slate-800/40 border-slate-700/60 hover:border-amber-400/50 transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center">
                      {cnt.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cnt.title}</h4>
                      <span className="text-[11px] text-slate-400">{cnt.type}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono ${
                    cnt.status === "Active" 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : cnt.status === "Signed"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {cnt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Duration</span>
                    <span className="font-semibold text-slate-300">{cnt.duration}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Committed Quota</span>
                    <span className="font-semibold text-slate-300">{cnt.volume}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Contract Rate</span>
                    <span className="font-semibold text-amber-300 font-mono">{cnt.unitPrice}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Advantage</span>
                    <span className="font-semibold text-emerald-400">{cnt.savings}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>* Contracts guarantee raw material supply rates and motorsport entry slots.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
