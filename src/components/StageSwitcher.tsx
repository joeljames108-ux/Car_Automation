import React, { Suspense, lazy } from "react";
import { StageLoadingSkeleton } from "./ui/StageLoadingSkeleton";

export type Stage =
  | "command" | "engine" | "vehicle" | "exterior" | "aero" | "interior"
  | "manufacturing" | "infotainment" | "rd" | "simulation" | "testing"
  | "race" | "stats" | "press" | "competitors"
  | "garage" | "compare" | "economy" | "motorsport" | "twin" | "safety" | "sales" | "ai";

// ── Lazy-loaded stage panel components ──
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
        {stage === "engine" && <EngineDesigner />}
        {stage === "vehicle" && <VehicleDesigner />}
        {stage === "exterior" && <ExteriorDesigner />}
        {stage === "aero" && <AeroLab />}
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
      </div>
    </Suspense>
  );
};
