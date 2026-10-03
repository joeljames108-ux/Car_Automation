import React, { useEffect } from "react";
import { useSimulationClockStore } from "../state/simulationClockStore";

/**
 * GlobalSimulationTicker
 * 
 * Continuous master simulation clock ticker.
 * Operates in the background decoupled from UI views and rendering logic.
 */
export const GlobalSimulationTicker: React.FC = () => {
  const { isPlaying, speed, advanceDays, advanceHours } = useSimulationClockStore();

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 1000;
    const timer = setInterval(() => {
      if (speed >= 25) {
        advanceDays(speed >= 50 ? 7 : 1);
      } else {
        advanceHours(speed);
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, speed, advanceDays, advanceHours]);

  return null;
};
