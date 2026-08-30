/**
 * ============================================================================
 * HIGH-DENSITY INTERIOR ENGINEERING TELEMETRY DASHBOARD
 * ============================================================================
 * Complete interactive engineering telemetry dashboard combining:
 * 1. 3D Voxel CFD Airflow & ISO 7730 PMV Thermal Comfort Metrics
 * 2. ISO 2631-1 Whole-Body Seat Vibration & SEAT Transmissibility
 * 3. SAE J1100 H-Point Biometrics & Sightline Blindspot Coverage
 * 4. 3D CAD Assembly Inspector & Binary GLB Serializer Exporter
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import {
  Activity,
  Wind,
  Volume2,
  Eye,
  Sliders,
  Download,
  CheckCircle,
  Cpu,
  Zap,
  Box,
  Layers,
  Thermometer,
  ShieldAlert,
} from "lucide-react";
import { MasterModularInteriorState } from "../../sim/interior/masterInteriorTypes";
import { InteriorThermalFluidDynamicsEngine } from "../../sim/interior/interiorThermalFluidDynamicsEngine";
import { CabinVibrationSeatNvhSolver } from "../../sim/interior/cabinVibrationSeatNvhSolver";
import { InteriorErgonomicsBiometricsEngine } from "../../sim/interior/interiorErgonomicsBiometricsEngine";
import { UniversalGlbExporter } from "../../exterior3d/export/universalGlbExporter";
import { HyperFidelityInteriorCadEngine } from "../../exterior3d/generators/interior/hyperFidelityInteriorCadEngine";
import { DEFAULT_BESPOKE_STATE } from "./BespokeLuxuryInteriorStudioHub";

export const InteriorEngineeringTelemetryDashboard: React.FC = () => {
  const [state, setState] = useState<MasterModularInteriorState>(DEFAULT_BESPOKE_STATE);
  const [simRpm, setSimRpm] = useState<number>(4200);
  const [speedKmh, setSpeedKmh] = useState<number>(120);
  const [ambientTempC, setAmbientTempC] = useState<number>(36.0);
  const [hvacSetTempC, setHvacSetTempC] = useState<number>(21.5);
  const [isExportingGlb, setIsExportingGlb] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Compute CFD Airflow & ISO 7730 Comfort
  const cfdSummary = useMemo(() => {
    return InteriorThermalFluidDynamicsEngine.simulateCabinCfd(state, ambientTempC, 850, hvacSetTempC, 4);
  }, [state, ambientTempC, hvacSetTempC]);

  // Compute ISO 2631-1 Vibration NVH
  const nvhSummary = useMemo(() => {
    return CabinVibrationSeatNvhSolver.solveSeatVibrationNvh(state, simRpm, speedKmh, true);
  }, [state, simRpm, speedKmh]);

  // Compute NVH Frequency Spectrum
  const nvhSpectrum = useMemo(() => {
    return CabinVibrationSeatNvhSolver.generateNvhSpectrum(state, simRpm);
  }, [state, simRpm]);

  // Compute SAE J1100 Ergonomics
  const ergoSummary = useMemo(() => {
    return InteriorErgonomicsBiometricsEngine.solveDriverErgonomics(state, "50th_male", 0, 0);
  }, [state]);

  const handleExportGlb = async () => {
    setIsExportingGlb(true);
    try {
      const cadGroup = HyperFidelityInteriorCadEngine.buildFullInteriorCad(state);
      const res = await UniversalGlbExporter.exportInteriorCabinToGlb(cadGroup, `Bespoke_Interior_${state.id}`);
      UniversalGlbExporter.triggerBrowserDownload(res);
      setExportSuccessMsg(`Exported ${res.filename} (${(res.byteLength / 1024).toFixed(1)} KB)`);
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } catch (err) {
      console.error("GLB export failed:", err);
    } finally {
      setIsExportingGlb(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Cpu size={14} /> AUTOMOTIVE CABIN TELEMETRY & PHYSICS DASHBOARD
          </div>
          <h1 className="text-2xl font-black text-white">{state.name}</h1>
        </div>

        <button
          onClick={handleExportGlb}
          disabled={isExportingGlb}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 border border-amber-400 text-white shadow-lg cursor-pointer hover:brightness-110 disabled:opacity-50"
        >
          <Download size={14} className={isExportingGlb ? "animate-bounce" : ""} />
          <span>{isExportingGlb ? "EXPORTING..." : "EXPORT FULL GLB CAD"}</span>
        </button>
      </div>

      {exportSuccessMsg && (
        <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{exportSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. 3D CFD Airflow & ISO 7730 Thermal Comfort Panel */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Wind size={16} /> 3D Voxel CFD & ISO 7730 Thermal Comfort
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Total Air Cells:</span>
              <div className="text-lg font-bold text-amber-300">{cfdSummary.totalAirCells}</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Avg Cabin Temp:</span>
              <div className="text-lg font-bold text-amber-300">{cfdSummary.averageCabinTempC}°C</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Max Air Velocity:</span>
              <div className="text-lg font-bold text-amber-300">{cfdSummary.maxAirVelocityMps} m/s</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">HVAC Cooling Duty:</span>
              <div className="text-lg font-bold text-emerald-300">{cfdSummary.hvacCoolingDutyKw} kW</div>
            </div>
          </div>

          {/* ISO 7730 Comfort Zones Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300">ISO 7730 Fanger PMV / PPD Zones</div>
            <div className="space-y-1.5">
              {cfdSummary.thermalComfortZones.map((z) => (
                <div key={z.zoneName} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{z.zoneName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">PMV: {z.pmvIndex}</span>
                    <span className="text-rose-400 font-bold">PPD: {z.ppdPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. ISO 2631-1 Seat NVH & Transmissibility Panel */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} /> ISO 2631-1 Seat NVH Transmissibility
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Floor Accel RMS:</span>
              <div className="text-lg font-bold text-amber-300">{nvhSummary.floorAccelRmsMps2} m/s²</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Seat Aw Accel:</span>
              <div className="text-lg font-bold text-rose-300">{nvhSummary.weightedAccelAwMps2} m/s²</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">SEAT Factor:</span>
              <div className="text-lg font-bold text-emerald-300">{nvhSummary.seatFactorRatio}</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Vibration VDV:</span>
              <div className="text-lg font-bold text-amber-300">{nvhSummary.vibrationDoseValueVdv}</div>
            </div>
          </div>

          {/* Spectrum Graph Bar Representation */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300">NVH Attenuation Spectrum (20 Hz - 500 Hz)</div>
            <div className="space-y-1">
              {nvhSpectrum.slice(0, 5).map((pt) => (
                <div key={pt.frequencyHz} className="flex items-center gap-2 text-[10px]">
                  <span className="w-12 text-slate-400 font-bold">{pt.frequencyHz} Hz</span>
                  <div className="flex-1 h-3 rounded-full bg-slate-950 overflow-hidden flex">
                    <div className="h-full bg-amber-500" style={{ width: `${(pt.seatSplDba / 100) * 100}%` }} />
                  </div>
                  <span className="text-emerald-400 font-bold">-{pt.attenuationDb} dB</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. SAE J1100 Ergonomics & Sightline Biometrics */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Eye size={16} /> SAE J1100 Ergonomics Biometrics
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-400">H-Point X/Y/Z:</span>
              <span className="font-bold text-amber-300">
                {ergoSummary.hPointCoordinatesMm.x}, {ergoSummary.hPointCoordinatesMm.y}, {ergoSummary.hPointCoordinatesMm.z} mm
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Headroom Clearance:</span>
              <span className="font-bold text-emerald-300">{ergoSummary.headroomClearanceMm} mm</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-400">A-Pillar Obscuration:</span>
              <span className="font-bold text-amber-300">{ergoSummary.aPillarObscurationDeg}°</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-400">SAE Overall Score:</span>
              <span className="font-bold text-amber-300">{ergoSummary.overallSaeErgonomicsScore}/100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
