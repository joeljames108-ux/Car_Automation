import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { simulate } from "../sim/engine";
import { defaultDesign } from "../sim/constants";
import type { VehicleDesign, SimResult, EngineConfig, VehicleConfig, AeroConfig, InteriorConfig, ElectronicsConfig, ManufacturingConfig, ExteriorConfig, AeroResearchConfig, InfotainmentConfig } from "../sim/types";

export type UnitSystem = "metric" | "imperial";

interface DesignContextValue {
  design: VehicleDesign;
  sim: SimResult;
  units: UnitSystem;
  setUnits: (u: UnitSystem) => void;
  updateEngine: (patch: Partial<EngineConfig>) => void;
  updateVehicle: (patch: Partial<VehicleConfig>) => void;
  updateAero: (patch: Partial<AeroConfig>) => void;
  updateAeroResearch: (patch: Partial<AeroResearchConfig>) => void;
  updateExterior: (patch: Partial<ExteriorConfig>) => void;
  updateInterior: (patch: Partial<InteriorConfig>) => void;
  updateElectronics: (patch: Partial<ElectronicsConfig>) => void;
  updateManufacturing: (patch: Partial<ManufacturingConfig>) => void;
  updateInfotainment: (patch: Partial<InfotainmentConfig>) => void;
  setDesign: (d: VehicleDesign) => void;
  resetDesign: () => void;
}

const DesignContext = createContext<DesignContextValue | null>(null);

export function DesignProvider({ children }: { children: ReactNode }) {
  const [design, setDesignState] = useState<VehicleDesign>(() => defaultDesign());
  const [units, setUnits] = useState<UnitSystem>("metric");
  const sim = useMemo(() => simulate(design), [design]);

  const setDesign = useCallback((d: VehicleDesign) => {
    setDesignState({ ...d, updatedAt: new Date().toISOString() });
  }, []);

  const updateEngine = useCallback((patch: Partial<EngineConfig>) => {
    setDesignState((d) => ({ ...d, engine: { ...d.engine, ...patch }, updatedAt: new Date().toISOString() }));
  }, []);

  const updateVehicle = useCallback((patch: Partial<VehicleConfig>) => {
    setDesignState((d) => ({ ...d, vehicle: { ...d.vehicle, ...patch }, updatedAt: new Date().toISOString() }));
  }, []);

  const updateAero = useCallback((patch: Partial<AeroConfig>) => {
    setDesignState((d) => ({ ...d, vehicle: { ...d.vehicle, aero: { ...d.vehicle.aero, ...patch } }, updatedAt: new Date().toISOString() }));
  }, []);

  const updateAeroResearch = useCallback((patch: Partial<AeroResearchConfig>) => {
    setDesignState((d) => ({ ...d, vehicle: { ...d.vehicle, aeroResearch: { ...d.vehicle.aeroResearch, ...patch } }, updatedAt: new Date().toISOString() }));
  }, []);

  const updateExterior = useCallback((patch: Partial<ExteriorConfig>) => {
    setDesignState((d) => ({ ...d, vehicle: { ...d.vehicle, exterior: { ...d.vehicle.exterior, ...patch } }, updatedAt: new Date().toISOString() }));
  }, []);

  const updateInterior = useCallback((patch: Partial<InteriorConfig>) => {
    setDesignState((d) => ({ ...d, vehicle: { ...d.vehicle, interior: { ...d.vehicle.interior, ...patch } }, updatedAt: new Date().toISOString() }));
  }, []);

  const updateElectronics = useCallback((patch: Partial<ElectronicsConfig>) => {
    setDesignState((d) => ({ ...d, vehicle: { ...d.vehicle, electronics: { ...d.vehicle.electronics, ...patch } }, updatedAt: new Date().toISOString() }));
  }, []);

  const updateManufacturing = useCallback((patch: Partial<ManufacturingConfig>) => {
    setDesignState((d) => ({ ...d, manufacturing: { ...d.manufacturing, ...patch }, updatedAt: new Date().toISOString() }));
  }, []);

  const updateInfotainment = useCallback((patch: Partial<InfotainmentConfig>) => {
    setDesignState((d) => ({ ...d, infotainment: { ...d.infotainment, ...patch }, updatedAt: new Date().toISOString() }));
  }, []);

  const resetDesign = useCallback(() => setDesignState(defaultDesign()), []);

  const value: DesignContextValue = {
    design, sim, units, setUnits,
    updateEngine, updateVehicle, updateAero, updateAeroResearch, updateExterior, updateInterior, updateElectronics, updateManufacturing, updateInfotainment,
    setDesign, resetDesign,
  };

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error("useDesign must be used within DesignProvider");
  return ctx;
}

// ---------- Unit conversion helpers ----------

export function fmtSpeed(kmh: number, units: UnitSystem): string {
  if (units === "imperial") return `${Math.round(kmh * 0.621371)} mph`;
  return `${Math.round(kmh)} km/h`;
}

export function fmtWeight(kg: number, units: UnitSystem): string {
  if (units === "imperial") return `${Math.round(kg * 2.20462)} lb`;
  return `${Math.round(kg)} kg`;
}

export function fmtDistance(m: number, units: UnitSystem): string {
  if (units === "imperial") return `${(m * 3.28084).toFixed(1)} ft`;
  return `${m.toFixed(1)} m`;
}

export function fmtPower(kw: number, units: UnitSystem): string {
  if (units === "imperial") return `${Math.round(kw * 1.34102)} hp`;
  return `${Math.round(kw)} kW`;
}

export function fmtTorque(nm: number, units: UnitSystem): string {
  if (units === "imperial") return `${Math.round(nm * 0.737562)} lb-ft`;
  return `${Math.round(nm)} Nm`;
}

export function fmtTemp(c: number, units: UnitSystem): string {
  if (units === "imperial") return `${Math.round(c * 9/5 + 32)}°F`;
  return `${Math.round(c)}°C`;
}

export function fmtFuel(lPer100: number, units: UnitSystem): string {
  if (lPer100 === 0) return "—";
  if (units === "imperial") return `${Math.round(235.215 / lPer100)} mpg`;
  return `${lPer100.toFixed(1)} L/100km`;
}

export function fmtCurrency(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`;
  return `$${usd}`;
}
