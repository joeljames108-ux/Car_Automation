import { useEffect, useRef } from "react";
import { useDesign } from "../state/DesignContext";
import { useToast } from "./ToastSystem";

export function ThermalAlertMonitor() {
  const { sim } = useDesign();
  const toast = useToast();
  const lastAlertsRef = useRef<Record<string, number>>({});

  const knockRisk = sim.knockRisk || 0;
  const coolingMargin = sim.coolingMargin || 0.5;
  const brakingDist = sim.brakingDist || 35;
  const dragCoeff = sim.dragCoeff || 0.3;
  const lateralG = sim.lateralG || 1.2;

  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    const now = Date.now();

    // Helper to debounce alerts by 10 seconds per category
    const canNotify = (key: string, cooldownMs = 10000) => {
      const last = lastAlertsRef.current[key] || 0;
      if (now - last > cooldownMs) {
        lastAlertsRef.current[key] = now;
        return true;
      }
      return false;
    };

    // 1. Engine Knock / Thermal Alert
    if (knockRisk > 0.5) {
      if (canNotify("knock")) {
        toastRef.current.warn(
          "Engine Thermal & Knock Warning",
          `High knock risk detected (${(knockRisk * 100).toFixed(0)}%). Reduce compression ratio or retard timing.`
        );
      }
    }

    // 2. Cooling Margin Alert (Oil/Coolant Temp Exceeded)
    if (coolingMargin < 0.2) {
      if (canNotify("cooling")) {
        toastRef.current.warn(
          "Oil Temp Exceeded 110°C",
          "Cooling margin critically low (< 20%). Increase radiator area or radiator air inlets to prevent thermal failure."
        );
      }
    }

    // 3. Brake Fade / Stopping Distance Alert
    if (brakingDist > 42) {
      if (canNotify("brakes")) {
        toastRef.current.warn(
          "Brake System Thermal Fade",
          `100-0 km/h stopping distance increased to ${brakingDist.toFixed(1)}m. Upgrade brake disc diameter or pad compound.`
        );
      }
    }

    // 4. Aero Loss / High Drag Alert
    if (dragCoeff > 0.45) {
      if (canNotify("aero")) {
        toastRef.current.info(
          "Aerodynamic Loss Detected",
          `Drag coefficient high (Cd ${dragCoeff.toFixed(2)}). Reduce wing AoA or optimize body shape.`
        );
      }
    }

    // 5. Tyre Grip / Degradation Warning
    if (lateralG < 0.85) {
      if (canNotify("tyre")) {
        toastRef.current.warn(
          "Tire Degradation / Low Grip",
          `Cornering grip reduced (${lateralG.toFixed(2)}g). Consider switching to softer tire compound or increasing tire width.`
        );
      }
    }

  }, [knockRisk, coolingMargin, brakingDist, dragCoeff, lateralG]);

  return null;
}
