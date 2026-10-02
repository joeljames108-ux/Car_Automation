import React, { Suspense, lazy, memo } from "react";
import { Car, Flag, FlaskConical } from "lucide-react";
import { StageLoadingSkeleton } from "./ui/StageLoadingSkeleton";

export type Stage =
  | "main_menu" | "create_vehicle_hub" | "powertrain_studio_select" | "operations" | "project_overview" | "hq" | "calendar" | "contracts" | "settings" | "reputation" | "finance" | "workforce"
  | "engine" | "vehicle" | "interior"
  | "aero_studio"
  | "manufacturing" | "factory" | "infotainment" | "rd" | "simulation" | "testing"
  | "race" | "stats" | "press" | "competitors"
  | "garage" | "compare" | "economy" | "motorsport" | "twin" | "safety" | "sales"
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
import { MainMenu } from "./mainMenu/MainMenu";
const CreateVehicleHub = lazy(() => import("./mainMenu/CreateVehicleHub").then(m => ({ default: m.CreateVehicleHub })));
const PowertrainStudioSelect = lazy(() => import("./assembly/PowertrainStudioSelect").then(m => ({ default: m.PowertrainStudioSelect })));
const OperationsPage = lazy(() => import("./mainMenu/pages/OperationsPage").then(m => ({ default: m.OperationsPage })));
const ProjectOverviewPage = lazy(() => import("./mainMenu/pages/ProjectOverviewPage").then(m => ({ default: m.ProjectOverviewPage })));
const CompanyHQPage = lazy(() => import("./mainMenu/pages/CompanyHQPage").then(m => ({ default: m.CompanyHQPage })));
const CalendarPage = lazy(() => import("./mainMenu/pages/CalendarPage").then(m => ({ default: m.CalendarPage })));
const ContractsPage = lazy(() => import("./mainMenu/pages/ContractsPage").then(m => ({ default: m.ContractsPage })));
const SettingsPage = lazy(() => import("./mainMenu/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const ReputationPage = lazy(() => import("./mainMenu/pages/ReputationPage").then(m => ({ default: m.ReputationPage })));
const FinancePage = lazy(() => import("./finance/FinancePage").then(m => ({ default: m.FinancePage })));
const WorkforceHub = lazy(() => import("./workforce/WorkforceHub").then(m => ({ default: m.WorkforceHub })));
const SubPageLayout = lazy(() => import("./mainMenu/SubPageLayout").then(m => ({ default: m.SubPageLayout })));
const AeroStudio = lazy(() => import("./aeroStudio/AeroStudio").then(m => ({ default: m.AeroStudio })));
const Transmission3DStudio = lazy(() => import("./transmissionStudio/Transmission3DStudio").then(m => ({ default: m.Transmission3DStudio })));
const TrackLayoutMasterStudio = lazy(() => import("./trackLayouts/TrackLayoutMasterStudio").then(m => ({ default: m.TrackLayoutMasterStudio })));
const PowertrainDynoStudio = lazy(() => import("./powertrain/PowertrainDynoStudio").then(m => ({ default: m.PowertrainDynoStudio })));
const TrackBattlesStudio = lazy(() => import("./telemetry/TrackBattlesStudio").then(m => ({ default: m.TrackBattlesStudio })));
const F1ConstructorMasterApp = lazy(() => import("./f1/F1ConstructorMasterApp").then(m => ({ default: m.F1ConstructorMasterApp })));
const HypercarConstructorMasterApp = lazy(() => import("./hypercar/HypercarConstructorMasterApp").then(m => ({ default: m.HypercarConstructorMasterApp })));
const EngineDesigner = lazy(() => import("./EngineDesigner").then(m => ({ default: m.EngineDesigner })));
const VehicleDesigner = lazy(() => import("./VehicleDesigner").then(m => ({ default: m.VehicleDesigner })));
const InteriorsDesigner = lazy(() => import("./InteriorsDesigner").then(m => ({ default: m.InteriorsDesigner })));
const ManufacturingDesigner = lazy(() => import("./ManufacturingDesigner").then(m => ({ default: m.ManufacturingDesigner })));
const FactoryPage = lazy(() => import("./factory/FactoryPage").then(m => ({ default: m.FactoryPage })));
const InfotainmentDesigner = lazy(() => import("./InfotainmentDesigner").then(m => ({ default: m.InfotainmentDesigner })));
const SafetyCenter = lazy(() => import("./SafetyCenter").then(m => ({ default: m.SafetyCenter })));
const SimulationDashboard = lazy(() => import("./SimulationDashboard").then(m => ({ default: m.SimulationDashboard })));
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
  const [displayedStage, setDisplayedStage] = React.useState<Stage>(stage);
  const [isTransitioning, setIsTransitioning] = React.useState<boolean>(false);
  const previousStageRef = React.useRef<Stage>(stage);

  React.useEffect(() => {
    if (stage !== previousStageRef.current) {
      previousStageRef.current = stage;
      React.startTransition(() => {
        setIsTransitioning(true);
      });
    }
  }, [stage]);

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
    safety: "safety",
    simulation: "simulation",
    manufacturing: "manufacturing",
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

  // Active option loading transition screen
  if (isTransitioning) {
    return (
      <Suspense fallback={<StageLoadingSkeleton stageName={stage} />}>
        <div key={`loading-${stage}`} className="stage-transition-enter w-full h-full min-h-[640px]">
          <StageLoadingSkeleton
            stageName={stage}
            durationMs={750}
            onComplete={() => {
              React.startTransition(() => {
                setDisplayedStage(stage);
                setIsTransitioning(false);
              });
            }}
            onSkip={() => {
              React.startTransition(() => {
                setDisplayedStage(stage);
                setIsTransitioning(false);
              });
            }}
          />
        </div>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<StageLoadingSkeleton stageName={displayedStage} />}>
      <div key={displayedStage} className="stage-transition-enter h-full">
        {displayedStage === "main_menu" && <MainMenu onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "create_vehicle_hub" && <CreateVehicleHub onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "powertrain_studio_select" && (
          <PowertrainStudioSelect
            onSelectEngine={() => onSelectStage("engine")}
            onSelectTransmission={() => onSelectStage("transmission3d")}
            onBackToCreatorMenu={() => onSelectStage("create_vehicle_hub")}
          />
        )}
        {displayedStage === "operations" && <OperationsPage onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "project_overview" && <ProjectOverviewPage onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "hq" && <CompanyHQPage onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "calendar" && <CalendarPage onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "contracts" && <ContractsPage onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "settings" && <SettingsPage onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "reputation" && <ReputationPage onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "workforce" && <WorkforceHub onBackToMenu={() => onSelectStage("main_menu")} />}
        {displayedStage === "garage" && (
          <SubPageLayout
            title="Vehicle Garage & Registry"
            category="Showroom • Tech Specs • Vehicle Comparison"
            icon={<Car size={18} className="text-amber-400" />}
            onSelectStage={(st) => onSelectStage(st as Stage)}
          >
            <VehicleGarage onSelectStage={(st) => onSelectStage(st as Stage)} />
          </SubPageLayout>
        )}
        {displayedStage === "motorsport" && (
          <SubPageLayout
            title="Motorsport Division"
            category="Grand Prix Races • Driver Lineup • Teams"
            icon={<Flag size={18} className="text-rose-400" />}
            onSelectStage={(st) => onSelectStage(st as Stage)}
          >
            <MotorsportDivision />
          </SubPageLayout>
        )}
        {displayedStage === "rd" && (
          <SubPageLayout
            title="R&D Innovation Lab"
            category="Advanced Technology • Prototypes • Patents"
            icon={<FlaskConical size={18} className="text-indigo-400" />}
            onSelectStage={(st) => onSelectStage(st as Stage)}
          >
            <RDCenter />
          </SubPageLayout>
        )}
        {displayedStage === "engine" && <EngineDesigner onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "vehicle" && <VehicleDesigner initialSubTab="modular_builder" onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "aero_studio" && <AeroStudio onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "interior" && <InteriorsDesigner initialSubTab="setup" onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "manufacturing" && <ManufacturingDesigner onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "factory" && <FactoryPage onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "infotainment" && <InteriorsDesigner initialSubTab="electronics" />}
        {displayedStage === "safety" && <SafetyCenter onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "simulation" && <SimulationDashboard onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "race" && <RaceSimulator />}
        {displayedStage === "stats" && <DetailedStats />}
        {displayedStage === "press" && <PressReviews />}
        {displayedStage === "compare" && <EngineeringComparison />}
        {(displayedStage === "economy" || displayedStage === "finance") && <FinancePage onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "twin" && <DigitalTwin />}
        {displayedStage === "sales" && <SalesLaunch />}
        {displayedStage === "competitors" && <Competitors />}
        {displayedStage === "supplyChain" && <SupplyChainWorkshop onSelectStage={(st) => onSelectStage(st as Stage)} />}
        {displayedStage === "nvh" && <NvhSoundLab />}
        {displayedStage === "suspension3d" && <SuspensionMasterStudio />}
        {displayedStage === "transmission3d" && (
          <Transmission3DStudio
            onSelectStage={(st) => onSelectStage(st as Stage)}
            onBackToMenu={() => onSelectStage("powertrain_studio_select")}
          />
        )}
        {displayedStage === "dyno_ecu" && <PowertrainDynoStudio />}
        {displayedStage === "track_battle" && <TrackBattlesStudio />}
        {displayedStage === "track_layout" && <TrackLayoutMasterStudio />}
        {displayedStage === "f1_constructor" && (
          <div className="w-full min-h-[750px] h-[calc(100vh-200px)]">
            <F1ConstructorMasterApp />
          </div>
        )}
        {displayedStage === "hypercar_constructor" && (
          <div className="w-full min-h-[750px] h-[calc(100vh-200px)]">
            <HypercarConstructorMasterApp />
          </div>
        )}
      </div>
    </Suspense>
  );
};

export const StageSwitcher = memo(StageSwitcherComponent);
