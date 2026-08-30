import React, { useState } from "react";
import {
  Wind,
  Sliders,
  Trophy,
  Volume2,
} from "lucide-react";
import { useDesign } from "../../state/DesignContext";
import { NeonHorizonGlassPanel } from "./design/NeonHorizonGlassPanel";
import { NeonHorizonTabs } from "./design/NeonHorizonTabs";
import { NeonHorizonDataCard } from "./design/NeonHorizonDataCard";
import { NeonHorizonSlider } from "./design/NeonHorizonSlider";
import { NeonHorizonToggle } from "./design/NeonHorizonToggle";
import { NeonHorizonBadge } from "./design/NeonHorizonBadge";

export function KineticStudioMultiverseSuite() {
  const { sim } = useDesign();

  const [activeDeck, setActiveDeck] = useState<string>("cfd_wind_tunnel");

  // CFD State
  const [airSpeed, setAirSpeed] = useState(240); // km/h
  const [showPressureHeatmap, setShowPressureHeatmap] = useState(true);

  // ECU Dyno State
  const [targetBoost, setTargetBoost] = useState(1.45); // BAR
  const [afrRatio, setAfrRatio] = useState(12.2); // Air Fuel Ratio

  // Calculated Aerodynamic Physics
  const vMs = airSpeed / 3.6; // Speed in m/s
  const airDensity = 1.225; // kg/m^3
  const frontalArea = 2.05; // m^2
  const dragForceN = Math.round(0.5 * airDensity * Math.pow(vMs, 2) * frontalArea * sim.dragCoeff);
  const downforceN = Math.round(0.5 * airDensity * Math.pow(vMs, 2) * frontalArea * Math.abs(sim.liftCoeff));
  const aeroPowerKw = Math.round((dragForceN * vMs) / 1000);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Studio Deck Selection Ribbon */}
      <NeonHorizonTabs
        activeTab={activeDeck}
        onChange={setActiveDeck}
        tabs={[
          { id: "cfd_wind_tunnel", label: "CFD Wind Tunnel & Streamlines", icon: <Wind size={14} /> },
          { id: "dyno_ecu", label: "Dyno & ECU Remap Workbench", icon: <Sliders size={14} /> },
          { id: "circuit_lap", label: "Nürburgring Lap Predictor", icon: <Trophy size={14} /> },
          { id: "nvh_acoustics", label: "NVH Audio & Spectrogram Lab", icon: <Volume2 size={14} /> },
        ]}
      />

      {/* =========================================================================
          DECK 1: CFD WIND TUNNEL & STREAMLINES SIMULATOR
          ========================================================================= */}
      {activeDeck === "cfd_wind_tunnel" && (
        <NeonHorizonGlassPanel
          variant="window"
          glow="cyan"
          corners="reticle"
          withScanline
          header={{
            title: "LATTICE-BOLTZMANN CFD WIND TUNNEL SIMULATOR",
            subtitle: "Aerodynamic airflow vectors, pressure distribution heatmaps, and wake vorticity",
            icon: <Wind size={18} />,
            badge: <NeonHorizonBadge variant="live">CFD SOLVER READY</NeonHorizonBadge>,
          }}
          className="p-6 flex flex-col gap-6"
        >
          {/* Tunnel Speed Slider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NeonHorizonSlider
              label="TUNNEL AIR VELOCITY"
              value={airSpeed}
              min={60}
              max={360}
              step={10}
              unit="km/h"
              onChange={setAirSpeed}
              color="cyan"
            />
            <NeonHorizonToggle
              label="SURFACE PRESSURE HEATMAP"
              description="Visualize high/low pressure stagnation gradients"
              checked={showPressureHeatmap}
              onChange={setShowPressureHeatmap}
              color="magenta"
            />
          </div>

          {/* Aerodynamic Physics Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NeonHorizonDataCard
              label="TOTAL DOWNFORCE"
              value={downforceN}
              unit="N"
              accentColor="cyan"
            />
            <NeonHorizonDataCard
              label="TOTAL AERO DRAG"
              value={dragForceN}
              unit="N"
              accentColor="magenta"
            />
            <NeonHorizonDataCard
              label="DRAG POWER LOSS"
              value={aeroPowerKw}
              unit="kW"
              accentColor="gold"
            />
          </div>
        </NeonHorizonGlassPanel>
      )}

      {/* =========================================================================
          DECK 2: DYNO & ECU REMAP WORKBENCH
          ========================================================================= */}
      {activeDeck === "dyno_ecu" && (
        <NeonHorizonGlassPanel
          variant="primary"
          corners="reticle"
          header={{
            title: "DYNO & ECU REMAP WORKBENCH",
            icon: <Sliders size={18} />,
          }}
          className="p-6 flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NeonHorizonSlider
              label="TARGET TURBO BOOST"
              value={targetBoost}
              min={0.8}
              max={2.5}
              step={0.05}
              unit="BAR"
              formatValue={(v) => v.toFixed(2)}
              onChange={setTargetBoost}
              color="cyan"
            />
            <NeonHorizonSlider
              label="AIR / FUEL RATIO (LAMBDA)"
              value={afrRatio}
              min={10.5}
              max={14.0}
              step={0.1}
              unit="AFR"
              formatValue={(v) => v.toFixed(1)}
              onChange={setAfrRatio}
              color="magenta"
            />
          </div>
        </NeonHorizonGlassPanel>
      )}

      {/* =========================================================================
          DECK 3: CIRCUIT LAP PREDICTOR
          ========================================================================= */}
      {activeDeck === "circuit_lap" && (
        <NeonHorizonGlassPanel
          variant="primary"
          corners="reticle"
          header={{
            title: "NÜRBURGRING LAP TIME PREDICTOR",
            icon: <Trophy size={18} />,
          }}
          className="p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NeonHorizonDataCard label="EST. LAP TIME" value="6:48.2" unit="min" accentColor="emerald" />
            <NeonHorizonDataCard label="SECTOR 1 (FLUGPLATZ)" value="1:42.1" unit="s" accentColor="cyan" />
            <NeonHorizonDataCard label="SECTOR 2 (KARRUSEL)" value="2:14.3" unit="s" accentColor="magenta" />
          </div>
        </NeonHorizonGlassPanel>
      )}

      {/* =========================================================================
          DECK 4: NVH ACOUSTICS
          ========================================================================= */}
      {activeDeck === "nvh_acoustics" && (
        <NeonHorizonGlassPanel
          variant="primary"
          corners="reticle"
          header={{
            title: "CABIN ACOUSTIC & NVH SPECTROGRAM",
            icon: <Volume2 size={18} />,
          }}
          className="p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NeonHorizonDataCard label="CABIN SPL @ 100 KM/H" value={64} unit="dBA" accentColor="cyan" />
            <NeonHorizonDataCard label="FIRING FREQUENCY" value={320} unit="Hz" accentColor="magenta" />
            <NeonHorizonDataCard label="EXHAUST TIMBRE" value="V12 Harmonic" accentColor="gold" />
          </div>
        </NeonHorizonGlassPanel>
      )}
    </div>
  );
}
