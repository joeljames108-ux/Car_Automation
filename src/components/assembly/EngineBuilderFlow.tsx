// ===================================================================
// APEX ENGINE BUILDER — MASTER ENGINE BUILDER FLOW (PHASE 14)
// Sequential 1-Page Assembly Pipeline with Stage Orchestration & Smooth Flow
// ===================================================================

import React, { useRef, useMemo } from "react";
import {
  useEngineBuilderFlow,
  UseEngineBuilderFlowProps,
} from "../../state/useEngineBuilderFlow";
import { StickyEngineDiagram } from "./StickyEngineDiagram";
import { SectionNavigationBar } from "./SectionNavigationBar";
import { PowertrainSelector } from "./PowertrainSelector";

// ICE Sections
import { EngineBlockSection } from "./sections/EngineBlockSection";
import { CrankshaftSection } from "./sections/CrankshaftSection";
import { PistonsSection } from "./sections/PistonsSection";
import { ConnectingRodsSection } from "./sections/ConnectingRodsSection";
import { HeadGasketSection } from "./sections/HeadGasketSection";
import { CylinderHeadSection } from "./sections/CylinderHeadSection";
import { CamshaftSection } from "./sections/CamshaftSection";
import { ValvesSection } from "./sections/ValvesSection";
import { IntakeManifoldSection } from "./sections/IntakeManifoldSection";
import { ExhaustHeadersSection } from "./sections/ExhaustHeadersSection";
import { TurbochargerSection } from "./sections/TurbochargerSection";
import { OilPanSection } from "./sections/OilPanSection";
import { RadiatorSection } from "./sections/RadiatorSection";
import { TransmissionSection } from "./sections/TransmissionSection";
import { EngineCoverSection } from "./sections/EngineCoverSection";
import { ICECompletionGate } from "./sections/ICECompletionGate";

// EV Sections
import { EVBatteryTraySection } from "./sections/ev/EVBatteryTraySection";
import { EVCellModulesSection } from "./sections/ev/EVCellModulesSection";
import { EVBMSSection } from "./sections/ev/EVBMSSection";
import { EVBusbarsSection } from "./sections/ev/EVBusbarsSection";
import { EVCoolingSection } from "./sections/ev/EVCoolingSection";
import { EVInverterSection } from "./sections/ev/EVInverterSection";
import { EVRotorSection } from "./sections/ev/EVRotorSection";
import { EVStatorSection } from "./sections/ev/EVStatorSection";
import { EVGearboxSection } from "./sections/ev/EVGearboxSection";
import { EVPDUSection } from "./sections/ev/EVPDUSection";
import { EVRegenSection } from "./sections/ev/EVRegenSection";
import { EVCompletionGate } from "./sections/ev/EVCompletionGate";

// Hybrid & Finish
import { HybridOptionalSection } from "./sections/HybridOptionalSection";
import { FinishSummarySection } from "./sections/FinishSummarySection";
import { SectionCard } from "./SectionCard";
import { InstallButton } from "./InstallButton";

import { ComponentId, MaterialGrade, getAssemblyComponents } from "../../sim/assemblyTypes";

interface EngineBuilderFlowProps extends UseEngineBuilderFlowProps {
  onOpenLightbox?: () => void;
  className?: string;
}

export function EngineBuilderFlow({
  engineConfig,
  sim,
  updateEngine,
  updateVehicle,
  onShowCompletionModal,
  onOpenLightbox,
  className = "",
}: EngineBuilderFlowProps) {
  const flow = useEngineBuilderFlow({
    engineConfig,
    sim,
    updateEngine,
    updateVehicle,
    onShowCompletionModal,
  });

  const sectionContainerRef = useRef<HTMLDivElement | null>(null);
  const isEV = flow.powertrainMode === "electric";
  const componentsList = useMemo(() => getAssemblyComponents(engineConfig), [engineConfig]);

  // Helper to retrieve meta for a component
  const getCompMeta = (id: ComponentId) => componentsList.find((c) => c.id === id);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ========================================================================= */}
      {/* 1. STICKY TOP ENGINE 3D ISO DIAGRAM                                       */}
      {/* ========================================================================= */}
      <StickyEngineDiagram
        powertrainMode={flow.powertrainMode}
        currentStage={flow.currentStage}
        currentStageMeta={flow.currentStageMeta}
        installedComponents={flow.assembly.installedComponents}
        activeComponentId={flow.assembly.activeComponentId}
        phase={flow.assembly.phase}
        hoveredComponentId={flow.assembly.hoveredComponentId}
        isExplodedView={flow.assembly.isExplodedView}
        isAssemblyComplete={flow.assembly.isAssemblyComplete}
        engineConfig={engineConfig}
        selectedVariants={flow.assembly.selectedVariants}
        flowProgressPercentage={flow.flowProgressPercentage}
        onAdvancePhase={flow.assembly.advancePhase}
        onCompleteInstall={flow.handleInstallComplete}
        onSkipAnimation={flow.assembly.skipCurrentAnimation}
        onHoverComponent={flow.assembly.setHoveredComponentId}
        onSelectComponent={(id) => {
          if (id) flow.navigateToStage(id);
        }}
        onOpenLightbox={onOpenLightbox}
      />

      {/* ========================================================================= */}
      {/* 2. HORIZONTAL SECTION NAVIGATION BAR                                      */}
      {/* ========================================================================= */}
      <SectionNavigationBar
        powertrainMode={flow.powertrainMode}
        currentStage={flow.currentStage}
        stagesList={flow.stagesList}
        flowProgressPercentage={flow.flowProgressPercentage}
        onNavigateToStage={flow.navigateToStage}
        onInstallCurrentStage={flow.installCurrentStage}
        isInstalling={flow.isCurrentStageInstalling}
        canInstallCurrent={flow.assembly.canInstall(flow.currentStage as ComponentId)}
      />

      {/* ========================================================================= */}
      {/* 3. DYNAMIC ACTIVE SECTION CONTENT CONTAINER                               */}
      {/* ========================================================================= */}
      <div ref={sectionContainerRef} className="w-full pt-1">
        
        {/* ── STAGE 0: POWERTRAIN SELECTION ── */}
        {flow.currentStage === "powertrain_select" && (
          <PowertrainSelector
            currentMode={flow.powertrainMode}
            engineConfig={engineConfig}
            onSelectPowertrain={flow.selectPowertrain}
          />
        )}

        {/* ── ICE PATH (12 STAGES) ── */}
        {!isEV && flow.currentStage === "block" && (
          <EngineBlockSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("block")}
            selectedVariant={flow.assembly.selectedVariants.block || "cast"}
            isInstalled={flow.assembly.installedComponents.includes("block")}
            isInstalling={flow.assembly.activeComponentId === "block"}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            updateVehicle={updateVehicle}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("block", v)}
            onInstall={() => flow.assembly.startInstall("block")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("crankshaft")}
          />
        )}

        {!isEV && flow.currentStage === "crankshaft" && (
          <CrankshaftSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("crankshaft")}
            selectedVariant={flow.assembly.selectedVariants.crankshaft || "forged"}
            isInstalled={flow.assembly.installedComponents.includes("crankshaft")}
            isInstalling={flow.assembly.activeComponentId === "crankshaft"}
            canInstall={flow.assembly.canInstall("crankshaft")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("crankshaft", v)}
            onInstall={() => flow.assembly.startInstall("crankshaft")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("pistons")}
          />
        )}

        {!isEV && flow.currentStage === "pistons" && (
          <PistonsSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("pistons")}
            selectedVariant={flow.assembly.selectedVariants.pistons || "forged"}
            isInstalled={flow.assembly.installedComponents.includes("pistons")}
            isInstalling={flow.assembly.activeComponentId === "pistons"}
            canInstall={flow.assembly.canInstall("pistons")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("pistons", v)}
            onInstall={() => flow.assembly.startInstall("pistons")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("rods")}
          />
        )}

        {!isEV && flow.currentStage === "rods" && (
          <ConnectingRodsSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("rods")}
            selectedVariant={flow.assembly.selectedVariants.rods || "forged"}
            isInstalled={flow.assembly.installedComponents.includes("rods")}
            isInstalling={flow.assembly.activeComponentId === "rods"}
            canInstall={flow.assembly.canInstall("rods")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("rods", v)}
            onInstall={() => flow.assembly.startInstall("rods")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("head_gasket")}
          />
        )}

        {!isEV && flow.currentStage === "head_gasket" && (
          <HeadGasketSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("head_gasket")}
            selectedVariant={flow.assembly.selectedVariants.head_gasket || "forged"}
            isInstalled={flow.assembly.installedComponents.includes("head_gasket")}
            isInstalling={flow.assembly.activeComponentId === "head_gasket"}
            canInstall={flow.assembly.canInstall("head_gasket")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("head_gasket", v)}
            onInstall={() => flow.assembly.startInstall("head_gasket")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("cylinder_head")}
          />
        )}

        {!isEV && flow.currentStage === "cylinder_head" && (
          <CylinderHeadSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("cylinder_head")}
            selectedVariant={flow.assembly.selectedVariants.cylinder_head || "billet"}
            isInstalled={flow.assembly.installedComponents.includes("cylinder_head")}
            isInstalling={flow.assembly.activeComponentId === "cylinder_head"}
            canInstall={flow.assembly.canInstall("cylinder_head")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("cylinder_head", v)}
            onInstall={() => flow.assembly.startInstall("cylinder_head")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("camshaft")}
          />
        )}

        {!isEV && flow.currentStage === "camshaft" && (
          <CamshaftSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("camshaft")}
            selectedVariant={flow.assembly.selectedVariants.camshaft || "forged"}
            isInstalled={flow.assembly.installedComponents.includes("camshaft")}
            isInstalling={flow.assembly.activeComponentId === "camshaft"}
            canInstall={flow.assembly.canInstall("camshaft")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("camshaft", v)}
            onInstall={() => flow.assembly.startInstall("camshaft")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("valves")}
          />
        )}

        {!isEV && flow.currentStage === "valves" && (
          <ValvesSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("valves")}
            selectedVariant={flow.assembly.selectedVariants.valves || "titanium"}
            isInstalled={flow.assembly.installedComponents.includes("valves")}
            isInstalling={flow.assembly.activeComponentId === "valves"}
            canInstall={flow.assembly.canInstall("valves")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("valves", v)}
            onInstall={() => flow.assembly.startInstall("valves")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("intake_manifold")}
          />
        )}

        {!isEV && flow.currentStage === "intake_manifold" && (
          <IntakeManifoldSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("intake_manifold")}
            selectedVariant={flow.assembly.selectedVariants.intake_manifold || "billet"}
            isInstalled={flow.assembly.installedComponents.includes("intake_manifold")}
            isInstalling={flow.assembly.activeComponentId === "intake_manifold"}
            canInstall={flow.assembly.canInstall("intake_manifold")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("intake_manifold", v)}
            onInstall={() => flow.assembly.startInstall("intake_manifold")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("exhaust_headers")}
          />
        )}

        {!isEV && flow.currentStage === "exhaust_headers" && (
          <ExhaustHeadersSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("exhaust_headers")}
            selectedVariant={flow.assembly.selectedVariants.exhaust_headers || "forged"}
            isInstalled={flow.assembly.installedComponents.includes("exhaust_headers")}
            isInstalling={flow.assembly.activeComponentId === "exhaust_headers"}
            canInstall={flow.assembly.canInstall("exhaust_headers")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("exhaust_headers", v)}
            onInstall={() => flow.assembly.startInstall("exhaust_headers")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("turbocharger")}
          />
        )}

        {!isEV && flow.currentStage === "turbocharger" && (
          <TurbochargerSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("turbocharger")}
            selectedVariant={flow.assembly.selectedVariants.turbocharger || "titanium"}
            isInstalled={flow.assembly.installedComponents.includes("turbocharger")}
            isInstalling={flow.assembly.activeComponentId === "turbocharger"}
            canInstall={flow.assembly.canInstall("turbocharger")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("turbocharger", v)}
            onInstall={() => flow.assembly.startInstall("turbocharger")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("oil_pan")}
          />
        )}

        {!isEV && flow.currentStage === "oil_pan" && (
          <OilPanSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("oil_pan")}
            selectedVariant={flow.assembly.selectedVariants.oil_pan || "cast"}
            isInstalled={flow.assembly.installedComponents.includes("oil_pan")}
            isInstalling={flow.assembly.activeComponentId === "oil_pan"}
            canInstall={flow.assembly.canInstall("oil_pan")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("oil_pan", v)}
            onInstall={() => flow.assembly.startInstall("oil_pan")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("radiator")}
          />
        )}

        {!isEV && flow.currentStage === "radiator" && (
          <RadiatorSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("radiator")}
            selectedVariant={flow.assembly.selectedVariants.radiator || "forged"}
            isInstalled={flow.assembly.installedComponents.includes("radiator")}
            isInstalling={flow.assembly.activeComponentId === "radiator"}
            canInstall={flow.assembly.canInstall("radiator")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("radiator", v)}
            onInstall={() => flow.assembly.startInstall("radiator")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("transmission")}
          />
        )}

        {!isEV && flow.currentStage === "transmission" && (
          <TransmissionSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("transmission")}
            selectedVariant={flow.assembly.selectedVariants.transmission || "forged"}
            isInstalled={flow.assembly.installedComponents.includes("transmission")}
            isInstalling={flow.assembly.activeComponentId === "transmission"}
            canInstall={flow.assembly.canInstall("transmission")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("transmission", v)}
            onInstall={() => flow.assembly.startInstall("transmission")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("engine_cover")}
          />
        )}

        {!isEV && flow.currentStage === "engine_cover" && (
          <EngineCoverSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("engine_cover")}
            selectedVariant={flow.assembly.selectedVariants.engine_cover || "billet"}
            isInstalled={flow.assembly.installedComponents.includes("engine_cover")}
            isInstalling={flow.assembly.activeComponentId === "engine_cover"}
            canInstall={flow.assembly.canInstall("engine_cover")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("engine_cover", v)}
            onInstall={() => flow.assembly.startInstall("engine_cover")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("chassis_frame")}
          />
        )}

        {/* ── UNIFIED VEHICLE & CHASSIS STAGES ── */}
        {flow.currentStage === "chassis_frame" && (
          <SectionCard
            title="Chassis Frame & Structural Monocoque"
            subtitle="Select unibody steel, aluminum spaceframe, or carbon monocoque tub"
            accent="cyan"
          >
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-300">
                The structural monocoque chassis is the core foundation for engine mounts, suspension pickup points, and driver safety tub.
              </p>
              <div className="flex items-center gap-3">
                <InstallButton
                  componentId="chassis_frame"
                  componentName="Chassis Frame & Monocoque"
                  phase={flow.assembly.phase}
                  isInstalled={flow.assembly.installedComponents.includes("chassis_frame")}
                  isInstalling={flow.assembly.activeComponentId === "chassis_frame"}
                  canInstall={true}
                  onInstall={() => flow.assembly.startInstall("chassis_frame")}
                  onNext={() => flow.navigateToStage("suspension_front")}
                />
              </div>
            </div>
          </SectionCard>
        )}

        {flow.currentStage === "suspension_front" && (
          <SectionCard
            title="Front Wishbone Suspension Kinematics"
            subtitle="Pushrod damper geometry, anti-roll bar rates, and steering knuckle"
            accent="cyan"
          >
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-300">
                Double-wishbone pushrod suspension maintains optimal tire contact patch and camber gain through high-G cornering.
              </p>
              <div className="flex items-center gap-3">
                <InstallButton
                  componentId="suspension_front"
                  componentName="Front Wishbone Suspension"
                  phase={flow.assembly.phase}
                  isInstalled={flow.assembly.installedComponents.includes("suspension_front")}
                  isInstalling={flow.assembly.activeComponentId === "suspension_front"}
                  canInstall={true}
                  onInstall={() => flow.assembly.startInstall("suspension_front")}
                  onNext={() => flow.navigateToStage("suspension_rear")}
                />
              </div>
            </div>
          </SectionCard>
        )}

        {flow.currentStage === "suspension_rear" && (
          <SectionCard
            title="Rear Multi-Link Suspension System"
            subtitle="Active skyhook dampers, toe control arms, and rear sway bar link"
            accent="cyan"
          >
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-300">
                Multi-link rear suspension prevents snap-oversteer under aggressive power-on corner exit.
              </p>
              <div className="flex items-center gap-3">
                <InstallButton
                  componentId="suspension_rear"
                  componentName="Rear Multi-Link Suspension"
                  phase={flow.assembly.phase}
                  isInstalled={flow.assembly.installedComponents.includes("suspension_rear")}
                  isInstalling={flow.assembly.activeComponentId === "suspension_rear"}
                  canInstall={true}
                  onInstall={() => flow.assembly.startInstall("suspension_rear")}
                  onNext={() => flow.navigateToStage("brakes")}
                />
              </div>
            </div>
          </SectionCard>
        )}

        {flow.currentStage === "brakes" && (
          <SectionCard
            title="Carbon-Ceramic Brake System & Calipers"
            subtitle="6-piston monobloc aluminum calipers and carbon-ceramic vented discs"
            accent="amber"
          >
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-300">
                Carbon-ceramic rotors eliminate thermal brake fade during repeated high-speed circuit braking.
              </p>
              <div className="flex items-center gap-3">
                <InstallButton
                  componentId="brakes"
                  componentName="Carbon-Ceramic Brakes"
                  phase={flow.assembly.phase}
                  isInstalled={flow.assembly.installedComponents.includes("brakes")}
                  isInstalling={flow.assembly.activeComponentId === "brakes"}
                  canInstall={true}
                  onInstall={() => flow.assembly.startInstall("brakes")}
                  onNext={() => flow.navigateToStage("wheels_tires")}
                />
              </div>
            </div>
          </SectionCard>
        )}

        {flow.currentStage === "wheels_tires" && (
          <SectionCard
            title="Forged Magnesium Wheels & Racing Slicks"
            subtitle="Centerlock forged wheels and soft-compound competition slick tires"
            accent="purple"
          >
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-300">
                Forged magnesium wheels reduce un-sprung rotational inertia for rapid acceleration and turn-in.
              </p>
              <div className="flex items-center gap-3">
                <InstallButton
                  componentId="wheels_tires"
                  componentName="Forged Wheels & Tires"
                  phase={flow.assembly.phase}
                  isInstalled={flow.assembly.installedComponents.includes("wheels_tires")}
                  isInstalling={flow.assembly.activeComponentId === "wheels_tires"}
                  canInstall={true}
                  onInstall={() => flow.assembly.startInstall("wheels_tires")}
                  onNext={() => flow.navigateToStage("aero_package")}
                />
              </div>
            </div>
          </SectionCard>
        )}

        {flow.currentStage === "aero_package" && (
          <SectionCard
            title="Active Aerodynamic Wing & Venturi Splitters"
            subtitle="Active DRS rear wing, carbon front splitter, and ground-effect venturi channels"
            accent="emerald"
          >
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-300">
                Active aerodynamic surfaces generate high-speed downforce while minimizing drag on straights.
              </p>
              <div className="flex items-center gap-3">
                <InstallButton
                  componentId="aero_package"
                  componentName="Active Aerodynamics"
                  phase={flow.assembly.phase}
                  isInstalled={flow.assembly.installedComponents.includes("aero_package")}
                  isInstalling={flow.assembly.activeComponentId === "aero_package"}
                  canInstall={true}
                  onInstall={() => flow.assembly.startInstall("aero_package")}
                  onNext={() => flow.navigateToStage("electronics_ecu")}
                />
              </div>
            </div>
          </SectionCard>
        )}

        {flow.currentStage === "electronics_ecu" && (
          <SectionCard
            title="Bosch Motorsport ECU & Harness Suite"
            subtitle="High-speed CAN-bus electronics, telemetry sensors, and ECU map"
            accent="blue"
          >
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-300">
                High-speed CAN-bus ECU coordinates launch control, ABS, and torque vectoring algorithms.
              </p>
              <div className="flex items-center gap-3">
                <InstallButton
                  componentId="electronics_ecu"
                  componentName="Motorsport ECU & Wiring"
                  phase={flow.assembly.phase}
                  isInstalled={flow.assembly.installedComponents.includes("electronics_ecu")}
                  isInstalling={flow.assembly.activeComponentId === "electronics_ecu"}
                  canInstall={true}
                  onInstall={() => flow.assembly.startInstall("electronics_ecu")}
                  onNext={() => flow.navigateToStage("ice_gate")}
                />
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── EV PATH (12 STAGES) ── */}
        {isEV && flow.currentStage === "block" && (
          <EVBatteryTraySection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("block")}
            selectedVariant={flow.assembly.selectedVariants.block || "cast"}
            isInstalled={flow.assembly.installedComponents.includes("block")}
            isInstalling={flow.assembly.activeComponentId === "block"}
            canInstall={true}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("block", v)}
            onInstall={() => flow.assembly.startInstall("block")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("crankshaft")}
          />
        )}

        {isEV && flow.currentStage === "crankshaft" && (
          <EVCellModulesSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("crankshaft")}
            selectedVariant={flow.assembly.selectedVariants.crankshaft || "forged"}
            isInstalled={flow.assembly.installedComponents.includes("crankshaft")}
            isInstalling={flow.assembly.activeComponentId === "crankshaft"}
            canInstall={flow.assembly.canInstall("crankshaft")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("crankshaft", v)}
            onInstall={() => flow.assembly.startInstall("crankshaft")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("pistons")}
          />
        )}

        {isEV && flow.currentStage === "pistons" && (
          <EVBMSSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("pistons")}
            selectedVariant={flow.assembly.selectedVariants.pistons || "forged"}
            isInstalled={flow.assembly.installedComponents.includes("pistons")}
            isInstalling={flow.assembly.activeComponentId === "pistons"}
            canInstall={flow.assembly.canInstall("pistons")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("pistons", v)}
            onInstall={() => flow.assembly.startInstall("pistons")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("rods")}
          />
        )}

        {isEV && flow.currentStage === "rods" && (
          <EVBusbarsSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("rods")}
            selectedVariant={flow.assembly.selectedVariants.rods || "forged"}
            isInstalled={flow.assembly.installedComponents.includes("rods")}
            isInstalling={flow.assembly.activeComponentId === "rods"}
            canInstall={flow.assembly.canInstall("rods")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("rods", v)}
            onInstall={() => flow.assembly.startInstall("rods")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("oil_pan")}
          />
        )}

        {isEV && (flow.currentStage === "oil_pan" || flow.currentStage === "head_gasket") && (
          <EVCoolingSection
            engineConfig={engineConfig}
            sim={sim}
            currentStage={flow.currentStage}
            reservoirComponentMeta={getCompMeta("oil_pan")}
            coolingPlateComponentMeta={getCompMeta("head_gasket")}
            selectedReservoirVariant={flow.assembly.selectedVariants.oil_pan || "cast"}
            selectedPlateVariant={flow.assembly.selectedVariants.head_gasket || "forged"}
            isReservoirInstalled={flow.assembly.installedComponents.includes("oil_pan")}
            isPlateInstalled={flow.assembly.installedComponents.includes("head_gasket")}
            isInstalling={flow.isCurrentStageInstalling}
            canInstall={flow.assembly.canInstall(flow.currentStage as ComponentId)}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectReservoirVariant={(v) => flow.assembly.setSelectedVariant("oil_pan", v)}
            onSelectPlateVariant={(v) => flow.assembly.setSelectedVariant("head_gasket", v)}
            onInstall={flow.installCurrentStage}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() =>
              flow.navigateToStage(flow.currentStage === "oil_pan" ? "head_gasket" : "cylinder_head")
            }
          />
        )}

        {isEV && flow.currentStage === "cylinder_head" && (
          <EVInverterSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("cylinder_head")}
            selectedVariant={flow.assembly.selectedVariants.cylinder_head || "billet"}
            isInstalled={flow.assembly.installedComponents.includes("cylinder_head")}
            isInstalling={flow.assembly.activeComponentId === "cylinder_head"}
            canInstall={flow.assembly.canInstall("cylinder_head")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("cylinder_head", v)}
            onInstall={() => flow.assembly.startInstall("cylinder_head")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("camshaft")}
          />
        )}

        {isEV && flow.currentStage === "camshaft" && (
          <EVRotorSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("camshaft")}
            selectedVariant={flow.assembly.selectedVariants.camshaft || "forged"}
            isInstalled={flow.assembly.installedComponents.includes("camshaft")}
            isInstalling={flow.assembly.activeComponentId === "camshaft"}
            canInstall={flow.assembly.canInstall("camshaft")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("camshaft", v)}
            onInstall={() => flow.assembly.startInstall("camshaft")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("valves")}
          />
        )}

        {isEV && flow.currentStage === "valves" && (
          <EVStatorSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("valves")}
            selectedVariant={flow.assembly.selectedVariants.valves || "titanium"}
            isInstalled={flow.assembly.installedComponents.includes("valves")}
            isInstalling={flow.assembly.activeComponentId === "valves"}
            canInstall={flow.assembly.canInstall("valves")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("valves", v)}
            onInstall={() => flow.assembly.startInstall("valves")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("intake_manifold")}
          />
        )}

        {isEV && flow.currentStage === "intake_manifold" && (
          <EVGearboxSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("intake_manifold")}
            selectedVariant={flow.assembly.selectedVariants.intake_manifold || "billet"}
            isInstalled={flow.assembly.installedComponents.includes("intake_manifold")}
            isInstalling={flow.assembly.activeComponentId === "intake_manifold"}
            canInstall={flow.assembly.canInstall("intake_manifold")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("intake_manifold", v)}
            onInstall={() => flow.assembly.startInstall("intake_manifold")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("exhaust_headers")}
          />
        )}

        {isEV && flow.currentStage === "exhaust_headers" && (
          <EVPDUSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("exhaust_headers")}
            selectedVariant={flow.assembly.selectedVariants.exhaust_headers || "forged"}
            isInstalled={flow.assembly.installedComponents.includes("exhaust_headers")}
            isInstalling={flow.assembly.activeComponentId === "exhaust_headers"}
            canInstall={flow.assembly.canInstall("exhaust_headers")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("exhaust_headers", v)}
            onInstall={() => flow.assembly.startInstall("exhaust_headers")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("turbocharger")}
          />
        )}

        {isEV && flow.currentStage === "turbocharger" && (
          <EVRegenSection
            engineConfig={engineConfig}
            sim={sim}
            componentMeta={getCompMeta("turbocharger")}
            selectedVariant={flow.assembly.selectedVariants.turbocharger || "titanium"}
            isInstalled={flow.assembly.installedComponents.includes("turbocharger")}
            isInstalling={flow.assembly.activeComponentId === "turbocharger"}
            canInstall={flow.assembly.canInstall("turbocharger")}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectVariant={(v) => flow.assembly.setSelectedVariant("turbocharger", v)}
            onInstall={() => flow.assembly.startInstall("turbocharger")}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onNext={() => flow.navigateToStage("finish")}
          />
        )}

        {/* ── OPTIONAL HYBRID STAGE ── */}
        {(flow.currentStage === "hybrid_optional" ||
          flow.currentStage === "hybrid_motor" ||
          flow.currentStage === "inverter_ecu") && (
          <HybridOptionalSection
            engineConfig={engineConfig}
            sim={sim}
            currentStage={flow.currentStage}
            motorComponentMeta={getCompMeta("hybrid_motor")}
            inverterComponentMeta={getCompMeta("inverter_ecu")}
            selectedMotorVariant={flow.assembly.selectedVariants.hybrid_motor || "forged"}
            selectedInverterVariant={flow.assembly.selectedVariants.inverter_ecu || "billet"}
            isMotorInstalled={flow.assembly.installedComponents.includes("hybrid_motor")}
            isInverterInstalled={flow.assembly.installedComponents.includes("inverter_ecu")}
            isInstalling={flow.isCurrentStageInstalling}
            phase={flow.assembly.phase}
            currentTotalStats={flow.assembly.currentStats}
            updateEngine={updateEngine}
            onSelectMotorVariant={(v) => flow.assembly.setSelectedVariant("hybrid_motor", v)}
            onSelectInverterVariant={(v) => flow.assembly.setSelectedVariant("inverter_ecu", v)}
            onInstall={flow.installCurrentStage}
            onSkipAnimation={flow.assembly.skipCurrentAnimation}
            onSkipHybrid={flow.skipHybrid}
            onNext={() => {
              if (flow.currentStage === "hybrid_motor") {
                flow.navigateToStage("inverter_ecu");
              } else {
                flow.navigateToStage("finish");
              }
            }}
          />
        )}

        {/* ── FINISH & SUMMARY STAGE ── */}
        {flow.currentStage === "finish" && (
          <FinishSummarySection
            powertrainMode={flow.powertrainMode}
            engineConfig={engineConfig}
            sim={sim}
            installedComponents={flow.assembly.installedComponents}
            selectedVariants={flow.assembly.selectedVariants}
            currentTotalStats={flow.assembly.currentStats}
            onShowCompletionModal={() => onShowCompletionModal?.()}
            onResetFlow={flow.resetFlow}
          />
        )}
      </div>
    </div>
  );
}
