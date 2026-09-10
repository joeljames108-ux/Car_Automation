import React, { Suspense, lazy, memo } from "react";
import { StageLoadingSkeleton } from "./ui/StageLoadingSkeleton";

export type Stage =
  | "command" | "engine" | "vehicle" | "exterior" | "interior"
  | "aero_studio" | "final_build"
  | "manufacturing" | "infotainment" | "rd" | "simulation" | "testing"
  | "race" | "stats" | "press" | "competitors"
  | "garage" | "compare" | "economy" | "motorsport" | "twin" | "safety" | "sales" | "ai"
  | "supplyChain" | "nvh" | "suspension3d" | "transmission3d" | "powertrain"
  | "f1_constructor" | "hypercar_constructor" | "dyno_ecu" | "track_battle" | "track_layout"
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
import { useGuidedEngineeringStore, WorkflowStage, WORKFLOW_STAGES_META } from "../state/guidedEngineeringStore";
import { LockedStageGate } from "./guidedWorkflow/LockedStageGate";
const FinalBuildStudio = lazy(() => import("./finalBuild/FinalBuildStudio").then(m => ({ default: m.FinalBuildStudio })));
const AeroStudio = lazy(() => import("./aeroStudio/AeroStudio").then(m => ({ default: m.AeroStudio })));
const Transmission3DStudio = lazy(() => import("./transmissionStudio/Transmission3DStudio").then(m => ({ default: m.Transmission3DStudio })));
const TrackLayoutMasterStudio = lazy(() => import("./trackLayouts/TrackLayoutMasterStudio").then(m => ({ default: m.TrackLayoutMasterStudio })));
const PowertrainDynoStudio = lazy(() => import("./powertrain/PowertrainDynoStudio").then(m => ({ default: m.PowertrainDynoStudio })));
const TrackBattlesStudio = lazy(() => import("./telemetry/TrackBattlesStudio").then(m => ({ default: m.TrackBattlesStudio })));
const F1ConstructorMasterApp = lazy(() => import("./f1/F1ConstructorMasterApp").then(m => ({ default: m.F1ConstructorMasterApp })));
const HypercarConstructorMasterApp = lazy(() => import("./hypercar/HypercarConstructorMasterApp").then(m => ({ default: m.HypercarConstructorMasterApp })));
const CommandCenter = lazy(() => import("./CommandCenter").then(m => ({ default: m.CommandCenter })));
const ApexAIStudio = lazy(() => import("./ApexAIStudio").then(m => ({ default: m.ApexAIStudio })));
const EngineDesigner = lazy(() => import("./EngineDesigner").then(m => ({ default: m.EngineDesigner })));
const VehicleDesigner = lazy(() => import("./VehicleDesigner").then(m => ({ default: m.VehicleDesigner })));
const ExteriorDesigner = lazy(() => import("./ExteriorDesigner").then(m => ({ default: m.ExteriorDesigner })));
const ExteriorDesignerIntegration = lazy(() => import("./vehicleAssembly/exterior/ExteriorDesignerIntegration").then(m => ({ default: m.ExteriorDesignerIntegration })));
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
const SupplyChainWorkshop = lazy(() => import("./SupplyChainWorkshop").then(m => ({ default: m.SupplyChainWorkshop })));
const NvhSoundLab = lazy(() => import("./NvhSoundLab").then(m => ({ default: m.NvhSoundLab })));
const SuspensionMasterStudio = lazy(() => import("./chassis/SuspensionMasterStudio").then(m => ({ default: m.SuspensionMasterStudio })));

interface StageSwitcherProps {
  stage: Stage;
  onSelectStage: (stage: Stage) => void;
}

const StageSwitcherComponent: React.FC<StageSwitcherProps> = ({ stage, onSelectStage }) => {
  const { canEnterStage, setActiveWorkflowStage } = useGuidedEngineeringStore();

  // Idle Pre-fetching Warming for smooth zero-lag tab transitions
  React.useEffect(() => {
    const prefetch = () => {
      import("./EngineDesigner");
      import("./VehicleDesigner");
      import("./InteriorsDesigner");
      import("./SimulationDashboard");
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(prefetch, { timeout: 2000 });
    } else {
      const timer = setTimeout(prefetch, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Check if target stage is governed by the sequential workflow gating
  const workflowMap: Partial<Record<Stage, WorkflowStage>> = {
    engine: "engine",
    vehicle: "vehicle",
    aero_studio: "aero",
    interior: "interior",
    final_build: "final_build",
  };

  const targetWorkflowStage = workflowMap[stage];

  React.useEffect(() => {
    if (targetWorkflowStage) {
      setActiveWorkflowStage(targetWorkflowStage);
    }
  }, [targetWorkflowStage, setActiveWorkflowStage]);

  if (targetWorkflowStage) {
    const gate = canEnterStage(targetWorkflowStage);
    if (!gate.allowed) {
      return (
        <LockedStageGate
          targetStage={targetWorkflowStage}
          reason={gate.reason}
          requiredStage={gate.requiredStage}
          onGoToRequiredStage={(reqStage) => {
            const meta = WORKFLOW_STAGES_META[reqStage];
            setActiveWorkflowStage(reqStage);
            onSelectStage(meta.appStageId as Stage);
          }}
        />
      );
    }
  }

  return (
    <Suspense fallback={<StageLoadingSkeleton stageName={stage} />}>
      <div key={stage} className="stage-transition-enter">
        {stage === "command" && <CommandCenter onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {stage === "ai" && <ApexAIStudio />}
        {stage === "engine" && <EngineDesigner onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {stage === "vehicle" && <VehicleDesigner initialSubTab="modular_builder" onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {stage === "exterior" && <ExteriorDesignerIntegration />}
        {stage === "aero_studio" && <AeroStudio onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {stage === "interior" && <InteriorsDesigner initialSubTab="setup" onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {stage === "final_build" && <FinalBuildStudio onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {stage === "manufacturing" && <ManufacturingDesigner />}
        {stage === "infotainment" && <InteriorsDesigner initialSubTab="electronics" />}
        {stage === "safety" && <SafetyCenter onSelectStage={(st) => onSelectStage(st as Stage)} />}
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
        {stage === "supplyChain" && <SupplyChainWorkshop />}
        {stage === "nvh" && <NvhSoundLab />}
        {stage === "suspension3d" && <SuspensionMasterStudio />}
        {stage === "transmission3d" && <Transmission3DStudio />}
        {stage === "dyno_ecu" && <PowertrainDynoStudio />}
        {stage === "track_battle" && <TrackBattlesStudio />}
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

export const StageSwitcher = memo(StageSwitcherComponent);
