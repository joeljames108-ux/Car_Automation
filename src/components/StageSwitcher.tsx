import React, { Suspense, lazy } from "react";
import { StageLoadingSkeleton } from "./ui/StageLoadingSkeleton";

export type Stage =
  | "command" | "engine" | "vehicle" | "exterior" | "aero" | "interior"
  | "manufacturing" | "infotainment" | "rd" | "simulation" | "testing"
  | "race" | "stats" | "press" | "competitors"
  | "garage" | "compare" | "economy" | "motorsport" | "twin" | "safety" | "sales" | "ai"
  | "graphics3d" | "supplyChain" | "nvh" | "suspension3d" | "studio" | "grand_studio" | "transmission3d"
  | "f1_constructor" | "hypercar_constructor" | "dyno_ecu" | "track_battle" | "wind_tunnel" | "track_layout"
  | "battery" | "sensors" | "audio" | "acoustics" | "sound" | "leaderboard" | "records" | "homologation" | "endurance"
  | "autonomous" | "immersion" | "tires" | "brakes" | "4ws" | "active_suspension"
  | "torque_vectoring" | "variable_compression" | "porpoising" | "ultracapacitor"
  | "diffuser" | "autoclave" | "plasma" | "sic_inverter"
  | "magneride" | "sduct"
  | "vortex" | "flywheel"
  | "splitter_skirt" | "morphing_aero"
  | "fender_louvers" | "vgt_turbo"
  | "blown_wing" | "skid_spark"
  | "boundary_suction" | "thermal_pcm";

// ── Lazy-loaded stage panel components ──
const Transmission3DStudio = lazy(() => import("./transmissionStudio/Transmission3DStudio").then(m => ({ default: m.Transmission3DStudio })));
const TrackLayoutMasterStudio = lazy(() => import("./trackLayouts/TrackLayoutMasterStudio").then(m => ({ default: m.TrackLayoutMasterStudio })));
const WindTunnelAeroStudio = lazy(() => import("./aerodynamics/WindTunnelAeroStudio").then(m => ({ default: m.WindTunnelAeroStudio })));
const PowertrainDynoStudio = lazy(() => import("./powertrain/PowertrainDynoStudio").then(m => ({ default: m.PowertrainDynoStudio })));
const TrackBattlesStudio = lazy(() => import("./telemetry/TrackBattlesStudio").then(m => ({ default: m.TrackBattlesStudio })));
const F1ConstructorMasterApp = lazy(() => import("./f1/F1ConstructorMasterApp").then(m => ({ default: m.F1ConstructorMasterApp })));
const HypercarConstructorMasterApp = lazy(() => import("./hypercar/HypercarConstructorMasterApp").then(m => ({ default: m.HypercarConstructorMasterApp })));
const CommandCenter = lazy(() => import("./CommandCenter").then(m => ({ default: m.CommandCenter })));
const ApexAIStudio = lazy(() => import("./ApexAIStudio").then(m => ({ default: m.ApexAIStudio })));
const EngineDesigner = lazy(() => import("./EngineDesigner").then(m => ({ default: m.EngineDesigner })));
const VehicleDesigner = lazy(() => import("./VehicleDesigner").then(m => ({ default: m.VehicleDesigner })));
const ExteriorDesigner = lazy(() => import("./ExteriorDesigner").then(m => ({ default: m.ExteriorDesigner })));
const AeroLab = lazy(() => import("./AeroLab").then(m => ({ default: m.AeroLab })));
const InteriorsDesigner = lazy(() => import("./InteriorsDesigner").then(m => ({ default: m.InteriorsDesigner })));
const ManufacturingDesigner = lazy(() => import("./ManufacturingDesigner").then(m => ({ default: m.ManufacturingDesigner })));
const InfotainmentDesigner = lazy(() => import("./InfotainmentDesigner").then(m => ({ default: m.InfotainmentDesigner })));
const SafetyCenter = lazy(() => import("./SafetyCenter").then(m => ({ default: m.SafetyCenter })));
const SimulationDashboard = lazy(() => import("./SimulationDashboard").then(m => ({ default: m.SimulationDashboard })));
const TestingLab = lazy(() => import("./TestingLab").then(m => ({ default: m.TestingLab })));
const RaceSimulator = lazy(() => import("./RaceSimulator").then(m => ({ default: m.RaceSimulator })));
const DetailedStats = lazy(() => import("./DetailedStats").then(m => ({ default: m.DetailedStats })));
const PressReviews = lazy(() => import("./PressReviews").then(m => ({ default: m.PressReviews })));
const VehicleGarage = lazy(() => import("./VehicleGarage").then(m => ({ default: m.VehicleGarage })));
const EngineeringComparison = lazy(() => import("./EngineeringComparison").then(m => ({ default: m.EngineeringComparison })));
const DynamicEconomy = lazy(() => import("./DynamicEconomy").then(m => ({ default: m.DynamicEconomy })));
const MotorsportDivision = lazy(() => import("./MotorsportDivision").then(m => ({ default: m.MotorsportDivision })));
const DigitalTwin = lazy(() => import("./DigitalTwin").then(m => ({ default: m.DigitalTwin })));
const SalesLaunch = lazy(() => import("./SalesLaunch").then(m => ({ default: m.SalesLaunch })));
const Competitors = lazy(() => import("./Competitors").then(m => ({ default: m.Competitors })));
const RDCenter = lazy(() => import("./RDCenter").then(m => ({ default: m.RDCenter })));
const EngineAndCar3DGraphicsViewport = lazy(() => import("./vehicleAssembly/EngineAndCar3DGraphicsViewport").then(m => ({ default: m.EngineAndCar3DGraphicsViewport })));
const SupplyChainWorkshop = lazy(() => import("./SupplyChainWorkshop").then(m => ({ default: m.SupplyChainWorkshop })));
const NvhSoundLab = lazy(() => import("./NvhSoundLab").then(m => ({ default: m.NvhSoundLab })));
const SuspensionMasterStudio = lazy(() => import("./chassis/SuspensionMasterStudio").then(m => ({ default: m.SuspensionMasterStudio })));
const GrandAutomotiveStudioHub = lazy(() => import("./GrandAutomotiveStudioHub").then(m => ({ default: m.GrandAutomotiveStudioHub })));

interface StageSwitcherProps {
  stage: Stage;
  onSelectStage: (stage: Stage) => void;
}

export const StageSwitcher: React.FC<StageSwitcherProps> = ({ stage, onSelectStage }) => {
  return (
    <Suspense fallback={<StageLoadingSkeleton stageName={stage} />}>
      <div key={stage} className="stage-transition-enter">
        {stage === "command" && <CommandCenter onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {stage === "ai" && <ApexAIStudio />}
        {(stage === "studio" || stage === "grand_studio") && <GrandAutomotiveStudioHub />}
        {stage === "engine" && <EngineDesigner />}
        {stage === "vehicle" && <VehicleDesigner initialSubTab="linear_assembly" />}
        {stage === "exterior" && <VehicleDesigner initialSubTab="exterior" />}
        {stage === "aero" && <VehicleDesigner initialSubTab="aero" />}
        {stage === "interior" && <InteriorsDesigner />}
        {stage === "manufacturing" && <ManufacturingDesigner />}
        {stage === "infotainment" && <InfotainmentDesigner />}
        {stage === "safety" && <SafetyCenter />}
        {stage === "simulation" && <SimulationDashboard />}
        {stage === "testing" && <TestingLab />}
        {stage === "race" && <RaceSimulator />}
        {stage === "stats" && <DetailedStats />}
        {stage === "press" && <PressReviews />}
        {stage === "garage" && <VehicleGarage />}
        {stage === "compare" && <EngineeringComparison />}
        {stage === "economy" && <DynamicEconomy />}
        {stage === "motorsport" && <MotorsportDivision />}
        {stage === "twin" && <DigitalTwin />}
        {stage === "sales" && <SalesLaunch />}
        {stage === "competitors" && <Competitors />}
        {stage === "rd" && <RDCenter />}
        {stage === "graphics3d" && <EngineAndCar3DGraphicsViewport />}
        {stage === "supplyChain" && <SupplyChainWorkshop />}
        {stage === "nvh" && <NvhSoundLab />}
        {stage === "suspension3d" && <SuspensionMasterStudio />}
        {stage === "transmission3d" && <Transmission3DStudio />}
        {stage === "dyno_ecu" && <PowertrainDynoStudio />}
        {stage === "track_battle" && <TrackBattlesStudio />}
        {stage === "wind_tunnel" && <WindTunnelAeroStudio />}
        {stage === "track_layout" && <TrackLayoutMasterStudio />}
        {stage === "f1_constructor" && (
          <div className="w-full min-h-[750px] h-[calc(100vh-200px)]">
            <F1ConstructorMasterApp />
          </div>
        )}
        {stage === "hypercar_constructor" && (
          <div className="w-full min-h-[750px] h-[calc(100vh-200px)]">
            <HypercarConstructorMasterApp />
          </div>
        )}
      </div>
    </Suspense>
  );
};
