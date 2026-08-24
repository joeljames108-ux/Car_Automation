import React, { useState } from "react";
import {
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Sparkles,
  Sliders,
  Stamp,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playHologramScanSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonHomologationStudio() {
  const { sim } = useDesign();

  const [passportIssued, setPassportIssued] = useState(false);

  const checks = [
    { id: "weight", name: "Minimum Dry Ballast Mass", req: "≥ 1,030 kg", actual: `${sim.weight} kg`, pass: sim.weight >= 1030 },
    { id: "wing", name: "Rear Wing Overhang Tolerance", req: "≤ 800 mm", actual: "720 mm", pass: true },
    { id: "drs", name: "DRS Flap Aperture Limit", req: "≤ 85.0 mm", actual: "84.2 mm", pass: true },
    { id: "plank", name: "Underbody Skid Plank Wear", req: "≤ 1.0 mm", actual: "0.4 mm", pass: true },
    { id: "noise", name: "Drive-By Static Sound Output", req: "≤ 110.0 dBA", actual: "106.5 dBA", pass: true },
    { id: "fuel", name: "FIA Fuel Cell Bladder Homologation", req: "FT3-1999 Kevlar", actual: "Certified", pass: true },
  ];

  const allPassed = checks.every((c) => c.pass);

  const handleIssuePassport = () => {
    playSubsystemEngageSound();
    setPassportIssued(true);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow={allPassed ? "emerald" : "magenta"}
        corners="reticle"
        header={{
          title: "FIA TECHNICAL SCRUTINEERING & HOMOLOGATION INSPECTOR",
          subtitle: "Official FIA GT3 / LMH hypercar technical regulation audit, dimensional laser check, and passport issuance",
          icon: <FileCheck size={18} />,
          badge: <NeonHorizonBadge variant={allPassed ? "emerald" : "coral"}>{allPassed ? "SCRUTINEERING PASSED" : "NON-COMPLIANT"}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="HOMOLOGATION CLASS" value="FIA LMH / GT3" accentColor="cyan" />
          <NeonHorizonDataCard label="TOTAL CHECKS" value={`${checks.filter(c => c.pass).length} / ${checks.length}`} accentColor="emerald" />
          <NeonHorizonDataCard label="SCRUTINEERING STATUS" value={allPassed ? "100% LEGAL" : "DEFECT DETECTED"} accentColor={allPassed ? "emerald" : "coral"} />
          <NeonHorizonDataCard label="PASSPORT CERTIFICATE" value={passportIssued ? "VERIFIED & SEALED" : "PENDING STAMP"} accentColor={passportIssued ? "gold" : "magenta"} />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Scrutineering Checks (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "FIA MANDATORY TECHNICAL SPECIFICATIONS",
              icon: <ShieldCheck size={16} />,
            }}
            className="p-6 flex flex-col gap-3"
          >
            {checks.map((check) => (
              <div
                key={check.id}
                className="p-3.5 rounded-xl bg-[#060e22] border border-white/10 flex items-center justify-between font-mono text-xs"
              >
                <div className="flex items-center gap-3">
                  {check.pass ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <XCircle size={16} className="text-rose-400" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-slate-100 font-bold">{check.name}</span>
                    <span className="text-[10px] text-slate-400">Rule: {check.req}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-cyan-300 font-bold">{check.actual}</span>
                  <NeonHorizonBadge variant={check.pass ? "emerald" : "coral"} size="xs">
                    {check.pass ? "PASS" : "FAIL"}
                  </NeonHorizonBadge>
                </div>
              </div>
            ))}
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Passport Seal Box (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "OFFICIAL GOLD PASSPORT SEAL",
              icon: <Stamp size={16} />,
            }}
            className="p-6 flex flex-col gap-4 text-center items-center justify-center"
          >
            {passportIssued ? (
              <div className="w-full flex flex-col items-center gap-3 p-4 rounded-xl bg-[#081a38] border border-amber-400/40 shadow-[0_0_25px_rgba(245,158,11,0.25)] animate-nh-materialize">
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-300">
                  <Award size={32} />
                </div>
                <span className="text-sm font-bold text-amber-300">FIA GOLD HOMOLOGATION PASSPORT</span>
                <span className="text-[10px] font-mono text-slate-300">
                  CHASSIS CERT HASH: 0x984F-A29E-FIA-2026
                </span>
                <NeonHorizonBadge variant="gold">OFFICIALLY HOMOLOGATED</NeonHorizonBadge>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-4 py-6">
                <span className="text-xs text-slate-400 max-w-xs">
                  All 6 technical scrutiny checks have satisfied FIA regulations. Click below to stamp and generate the permanent racing passport.
                </span>
                <NeonHorizonButton variant="primary" glow onClick={handleIssuePassport}>
                  <Stamp size={14} className="mr-1.5" /> ISSUE OFFICIAL FIA PASSPORT
                </NeonHorizonButton>
              </div>
            )}
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
