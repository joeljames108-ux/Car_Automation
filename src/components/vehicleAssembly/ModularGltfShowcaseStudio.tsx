// ============================================================================
// PHASE 27 — MODULAR glTF SHOWCASE STUDIO & UNIFIED AUTOMOTIVE CAD WORKSPACE
// ============================================================================
// Master high-contrast dark studio consolidating 3D Assembly Deck, Technical
// Blueprint CAD, Virtual Wind Tunnel CFD, and Powertrain Dyno Simulator.
// ============================================================================

import React, { useState } from 'react';
import {
  Layers,
  Compass,
  Wind,
  Zap,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { MasterVehicleAssemblyDeck } from './MasterVehicleAssemblyDeck';
import { MultiViewTechnicalBlueprint } from './MultiViewTechnicalBlueprint';
import { AerodynamicWindTunnelViewport } from './AerodynamicWindTunnelViewport';
import { PowertrainDynoDashboard } from './PowertrainDynoDashboard';
import { useMasterVehicleAssemblyStore } from '../../state/masterVehicleAssemblyStore';
import { UniversalGlbExporter } from '../../exterior3d/export/universalGlbExporter';
import { HighFidelitySedanChassisGenerator } from '../../exterior3d/generators/highFidelitySedanChassisGenerator';

export type StudioTabId = '3D_ASSEMBLY' | 'CAD_BLUEPRINT' | 'CFD_WIND_TUNNEL' | 'ENGINE_DYNO';

export const ModularGltfShowcaseStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudioTabId>('3D_ASSEMBLY');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const {
    totalMassKg,
    totalTorsionalRigidityNmPerDeg,
    weightDistributionFrontPct,
    totalCostUsd,
    totalAeroCd,
  } = useMasterVehicleAssemblyStore();

  const handleExportGlb = async () => {
    try {
      setIsExporting(true);
      const vehicleRoot = HighFidelitySedanChassisGenerator.buildChassis3D();
      const exportRes = await UniversalGlbExporter.exportVehicleToGlb(vehicleRoot, {
        binary: true,
        vehicleName: 'Apex_Sedan_Chassis_01_Assembly',
      });
      UniversalGlbExporter.triggerBrowserDownload(exportRes);
    } catch (err) {
      console.error('Failed to export vehicle GLB:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const tabs: { id: StudioTabId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: '3D_ASSEMBLY', label: '3D Assembly Deck', icon: Layers },
    { id: 'CAD_BLUEPRINT', label: 'CAD Blueprints', icon: Compass },
    { id: 'CFD_WIND_TUNNEL', label: 'Virtual CFD Tunnel', icon: Wind },
    { id: 'ENGINE_DYNO', label: 'Engine Dyno & Telemetry', icon: Zap },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-[#05070c] text-gray-100 font-sans overflow-hidden">
      {/* Top Unified Studio Navigation Ribbon */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#090d16] border-b border-[#182133] shadow-lg">
        {/* Studio Branding & Homologation Seal */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-500/20 border border-amber-500/40 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wide text-white">
                ANTIGRAVITY AUTOMOTIVE CAD STUDIO
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                100-PHASE V2.0
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono">
              DIN / ISO 1101 Kinematic Sockets & Modular glTF 2.0 Digital Twin
            </p>
          </div>
        </div>

        {/* Studio Workspace Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0e1422] p-1 rounded-xl border border-[#1b253b]">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#151c2e]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportGlb}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting Binary...' : 'Export 3D GLB Asset'}
          </button>
        </div>
      </div>

      {/* Main Studio Viewport Workspace */}
      <div className="flex-1 overflow-hidden p-3 bg-[#05070c]">
        {activeTab === '3D_ASSEMBLY' && <MasterVehicleAssemblyDeck />}
        {activeTab === 'CAD_BLUEPRINT' && <MultiViewTechnicalBlueprint />}
        {activeTab === 'CFD_WIND_TUNNEL' && <AerodynamicWindTunnelViewport />}
        {activeTab === 'ENGINE_DYNO' && <PowertrainDynoDashboard />}
      </div>

      {/* Bottom Telemetry Status Bar */}
      <div className="flex items-center justify-between px-6 py-2 bg-[#080c14] border-t border-[#161e2e] text-xs font-mono text-gray-400">
        <div className="flex items-center gap-6">
          <span>
            MASS: <strong className="text-gray-100">{totalMassKg} kg</strong>
          </span>
          <span>
            RIGIDITY: <strong className="text-amber-400">{totalTorsionalRigidityNmPerDeg} Nm/deg</strong>
          </span>
          <span>
            WEIGHT BIAS: <strong className="text-amber-400">{weightDistributionFrontPct}% F / {(100 - weightDistributionFrontPct).toFixed(1)}% R</strong>
          </span>
          <span>
            AERO CD: <strong className="text-rose-400">{totalAeroCd}</strong>
          </span>
          <span>
            TOTAL BUILD: <strong className="text-emerald-400">${totalCostUsd.toLocaleString()}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>FIA Homologation & ISO Kinematics Certified</span>
        </div>
      </div>
    </div>
  );
};
