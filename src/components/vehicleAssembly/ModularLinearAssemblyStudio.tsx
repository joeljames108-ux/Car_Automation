/**
 * ============================================================================
 * MODULAR LINEAR ASSEMBLY STUDIO (MASTER CAD & ENGINEERING SUITE)
 * ============================================================================
 * Orchestrates the full linear vehicle assembly workflow and engineering suite:
 * - 12-Stage Linear Assembly Chain
 * - CAD Vehicle Configuration Hierarchy Tree
 * - Real-Time Packaging & Clearance Diagnostics (0-100% Quality Score)
 * - 3D Center of Mass (CoM) & Inertia Solver
 * - Build Timeline Scrubber & Undo/Redo Engine
 * - Engineering Revisions & Design Freeze Snapshots
 * - Parametric Aerodynamics Studio & Live 3D Pivot Rotation
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Wrench,
  Cog,
  Gauge,
  Activity,
  Disc,
  Car,
  Sparkles,
  Sofa,
  Cpu,
  Flame,
  Trophy,
  Wind,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sliders,
  Layers,
  ShieldCheck,
  GitBranch,
} from "lucide-react";
import { useDesign } from "../../state/DesignContext";
import {
  InstalledSubsystemsState,
  AssemblyStageId,
  AeroParameters3D,
  ChassisConfig3D,
} from "./scene/ModularAssemblySceneGraph";
import { ModularLinearAssemblyViewport } from "./ModularLinearAssemblyViewport";
import { VehicleConfigTree } from "./ui/VehicleConfigTree";
import { AssemblyHealthDiagnostics } from "./ui/AssemblyHealthDiagnostics";
import { AssemblyTimelineBar } from "./ui/AssemblyTimelineBar";
import { AssemblyVersionManager } from "./ui/AssemblyVersionManager";
import { useAssemblyHistory } from "../../state/useAssemblyHistoryStore";
import { validateAssemblyPackaging, ClearanceIssue } from "../../sim/modularVehicle/AssemblyPackagingValidator";
import {
  computeAssemblyPhysicalState,
  COMPONENT_MANIFEST_CATALOG,
  ComponentManifest,
} from "../../sim/modularVehicle/AssemblyRegistryEngine";

// Individual Stage Components
import { ChassisAssemblyStage } from "./stages/ChassisAssemblyStage";
import { EngineAssemblyStage } from "./stages/EngineAssemblyStage";
import { TransmissionAssemblyStage } from "./stages/TransmissionAssemblyStage";
import { SuspensionAssemblyStage } from "./stages/SuspensionAssemblyStage";
import { BrakesAssemblyStage } from "./stages/BrakesAssemblyStage";
import { WheelsAssemblyStage } from "./stages/WheelsAssemblyStage";
import { BodyPanelsAssemblyStage } from "./stages/BodyPanelsAssemblyStage";
import { GlassAssemblyStage } from "./stages/GlassAssemblyStage";
import { InteriorAssemblyStage } from "./stages/InteriorAssemblyStage";
import { ElectronicsAssemblyStage } from "./stages/ElectronicsAssemblyStage";
import { FinalExteriorAssemblyStage } from "./stages/FinalExteriorAssemblyStage";
import { VehicleCompletionStage } from "./stages/VehicleCompletionStage";
import { ParametricAerodynamicsStudio } from "./aero/ParametricAerodynamicsStudio";

const STAGES: { id: AssemblyStageId; label: string; icon: any }[] = [
  { id: "chassis", label: "1. Chassis", icon: Wrench },
  { id: "engine", label: "2. Engine", icon: Cog },
  { id: "transmission", label: "3. Gearbox", icon: Gauge },
  { id: "suspension", label: "4. Suspension", icon: Activity },
  { id: "brakes", label: "5. Brakes", icon: Disc },
  { id: "wheels", label: "6. Wheels", icon: Disc },
  { id: "body_structure", label: "7. Body & Paint", icon: Car },
  { id: "glass", label: "8. Glass", icon: Sparkles },
  { id: "interior", label: "9. Interior", icon: Sofa },
  { id: "electronics", label: "10. Electronics", icon: Cpu },
  { id: "final_exterior", label: "11. Details", icon: Flame },
  { id: "aero_studio", label: "12. Aero Studio", icon: Wind },
  { id: "complete", label: "13. Complete", icon: Trophy },
];

import { assemblyAudio } from "./utils/assemblyAudioEngine";

export const ModularLinearAssemblyStudio: React.FC = () => {
  const { design, updateVehicle, updateAero, updateExterior } = useDesign();

  // Active linear stage & View Mode
  const [activeStage, setActiveStage] = useState<AssemblyStageId>("chassis");
  const [previewStage, setPreviewStage] = useState<AssemblyStageId | null>(null);
  const [activeTab, setActiveTab] = useState<"stage_config" | "cad_tree" | "diagnostics" | "versions">("stage_config");
  const [isInAeroStudio, setIsInAeroStudio] = useState<boolean>(false);

  // Viewport Settings
  const [explodedProgress, setExplodedProgress] = useState<number>(0);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [isXRay, setIsXRay] = useState<boolean>(false);
  const [showStreamlines, setShowStreamlines] = useState<boolean>(false);
  const [showCoMGizmo, setShowCoMGizmo] = useState<boolean>(false);
  const [visibilityModeRequest, setVisibilityModeRequest] = useState<{
    stage: AssemblyStageId;
    mode: "normal" | "ghost" | "xray" | "hidden" | "isolated";
  } | null>(null);

  // Core Assembly State
  const [assemblyState, setAssemblyState] = useState<InstalledSubsystemsState>(() => ({
    installedStages: new Set<AssemblyStageId>(["chassis", "engine"]),
    chassis: {
      type: "gt3",
      architecture: "spaceframe",
      wheelbaseMm: 2700,
      frontTrackMm: 1620,
      rearTrackMm: 1640,
      rideHeightMm: 95,
    },
    engine: design.engine,
    enginePosition: "mid",
    engineOffsetMm: 0,
    transmissionType: "dct_7",
    diffCoolingFins: true,
    cvBoots: true,
    suspensionType: "double_wishbone",
    activeCoilovers: true,
    arbFrontNmPerDeg: 120,
    arbRearNmPerDeg: 100,
    brakeType: "carbon_ceramic",
    brakeBiasPct: 62,
    caliperColor: "#ef4444",
    wheelStyle: "centerlock_gt3",
    tireCompound: "semi_slick",
    bodyKit: "gt3_aero",
    fenderLouvers: true,
    doorStyle: "butterfly",
    doorOpenAngleDeg: 0,
    bonnetStyle: "extractor_vents",
    bonnetOpenAngleDeg: 0,
    dickyStyle: "vented_decklid",
    dickyOpenAngleDeg: 0,
    paintColor: "#dc2626",
    paintFinish: "gloss",
    glassType: "race_polycarbonate",
    lexanEngineCover: true,
    interiorType: "carbon_bucket_gt3",
    sixPointHarness: true,
    motecDisplay: true,
    electronicsType: "motorsport_ecu_telemetry",
    raychemLooms: true,
    exhaustType: "quad_titanium",
    heatTintIntensity: 70,
    towHooksFront: true,
    towHooksRear: true,
    aero: {
      frontSplitterEnabled: true,
      frontSplitterLengthMm: 120,
      frontSplitterAngleDeg: 1.5,
      rearWingEnabled: true,
      rearWingType: "swan_neck",
      rearWingAngleDeg: 12,
      rearWingHeightMm: 340,
      rearWingWidthMm: 1650,
      gurneyFlap: true,
      endplateSize: "swan_neck",
      diffuserEnabled: true,
      diffuserAngleDeg: 10,
      diffuserStrakes: 4,
      diffuserExitWidthMm: 1050,
      sideSkirtsEnabled: true,
      sideSkirtExtensionMm: 60,
      vortexFins: true,
      underbodyVenturiTunnels: true,
      venturiTunnelCount: 4,
      frontCanards: true,
      frontCanardAngleDeg: 14,
    },
  }));

  // Undo/Redo & Version History Store
  const history = useAssemblyHistory(assemblyState, (reverted) => {
    setAssemblyState(reverted);
  });

  // Sync live engine from Engine Tab
  useEffect(() => {
    setAssemblyState((prev) => ({
      ...prev,
      engine: design.engine,
    }));
  }, [design.engine]);

  // Compute live manifests based on installed components
  const installedManifests = useMemo<ComponentManifest[]>(() => {
    const list: ComponentManifest[] = [];
    if (assemblyState.installedStages.has("chassis")) list.push(COMPONENT_MANIFEST_CATALOG["chassis_gt3"]);
    if (assemblyState.installedStages.has("engine")) {
      const engId =
        assemblyState.enginePosition === "front"
          ? "engine_v8_front"
          : assemblyState.enginePosition === "rear"
          ? "engine_v8_rear"
          : "engine_v8_mid";
      list.push(COMPONENT_MANIFEST_CATALOG[engId] || COMPONENT_MANIFEST_CATALOG["engine_v8_mid"]);
    }
    if (assemblyState.installedStages.has("transmission")) list.push(COMPONENT_MANIFEST_CATALOG["trans_dct_7"]);
    if (assemblyState.installedStages.has("suspension")) list.push(COMPONENT_MANIFEST_CATALOG["susp_pushrod_gt3"]);
    if (assemblyState.installedStages.has("brakes")) list.push(COMPONENT_MANIFEST_CATALOG["brakes_ccm"]);
    if (assemblyState.installedStages.has("wheels")) list.push(COMPONENT_MANIFEST_CATALOG["wheels_gt3_centerlock"]);
    if (assemblyState.installedStages.has("body_structure")) list.push(COMPONENT_MANIFEST_CATALOG["body_gt3_widebody"]);
    if (assemblyState.installedStages.has("glass")) list.push(COMPONENT_MANIFEST_CATALOG["glass_polycarbonate_lexan"]);
    if (assemblyState.installedStages.has("interior")) list.push(COMPONENT_MANIFEST_CATALOG["interior_carbon_bucket_gt3"]);
    if (assemblyState.installedStages.has("electronics")) list.push(COMPONENT_MANIFEST_CATALOG["electronics_motorsport_ms6"]);
    if (assemblyState.installedStages.has("final_exterior")) list.push(COMPONENT_MANIFEST_CATALOG["exhaust_quad_titanium"]);
    if (assemblyState.aero.rearWingEnabled || assemblyState.aero.frontSplitterEnabled) {
      list.push(COMPONENT_MANIFEST_CATALOG["aero_swan_neck_gt3"]);
    }
    return list;
  }, [assemblyState]);

  // Compute 3D Mass, CoM, and Physical State
  const physicalState = useMemo(() => {
    return computeAssemblyPhysicalState(installedManifests, assemblyState.chassis.wheelbaseMm);
  }, [installedManifests, assemblyState.chassis.wheelbaseMm]);

  // Real-time packaging and clearance health validation
  const healthReport = useMemo(() => {
    return validateAssemblyPackaging(assemblyState);
  }, [assemblyState]);

  // Install a stage and advance to next
  const handleInstallStage = (stageId: AssemblyStageId) => {
    assemblyAudio.playPneumaticInstall();
    setAssemblyState((prev) => {
      const nextStages = new Set(prev.installedStages);
      nextStages.add(stageId);
      const updated = { ...prev, installedStages: nextStages };
      history.pushState(updated);
      return updated;
    });

    const currentIndex = STAGES.findIndex((s) => s.id === stageId);
    if (currentIndex < STAGES.length - 1) {
      const nextStageId = STAGES[currentIndex + 1].id;
      setActiveStage(nextStageId);
    }
  };

  // Stage modification helpers
  const handleUpdateChassis = (patch: Partial<ChassisConfig3D>) => {
    setAssemblyState((prev) => {
      const newChassis = { ...prev.chassis, ...patch };
      updateVehicle({ rideHeight: newChassis.rideHeightMm });
      const updated = { ...prev, chassis: newChassis };
      history.pushState(updated);
      return updated;
    });
  };

  const handleUpdateAero = (patch: Partial<AeroParameters3D>) => {
    setAssemblyState((prev) => {
      const newAero = { ...prev.aero, ...patch };
      updateAero({
        wingAngle: newAero.rearWingAngleDeg,
        wingWidth: newAero.rearWingWidthMm,
        wingHeight: newAero.rearWingHeightMm,
        splitterLength: newAero.frontSplitterLengthMm,
        splitterAngle: newAero.frontSplitterAngleDeg,
        diffuserAngle: newAero.diffuserAngleDeg,
        canards: newAero.frontCanards,
        drs: newAero.rearWingType === "active_drs",
      });
      const updated = { ...prev, aero: newAero };
      history.pushState(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Assembly Timeline Ribbon with Undo/Redo & Stage Checkpoints */}
      <AssemblyTimelineBar
        stages={STAGES}
        activeStage={activeStage}
        installedStages={assemblyState.installedStages}
        onSelectStage={(s) => {
          setIsInAeroStudio(false);
          setActiveStage(s);
        }}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={() => {
          const reverted = history.undo();
          if (reverted) setAssemblyState(reverted);
        }}
        onRedo={() => {
          const advanced = history.redo();
          if (advanced) setAssemblyState(advanced);
        }}
        onResetVehicle={() => {
          const reset = history.resetVehicle();
          setAssemblyState(reset);
        }}
      />

      {/* Main 3D Viewport with CAD tools, Kinematics, Section Cut, and CoM Datum */}
      <ModularLinearAssemblyViewport
        assemblyState={assemblyState}
        activeStage={activeStage}
        previewStage={previewStage}
        explodedProgress={explodedProgress}
        onExplodedChange={setExplodedProgress}
        isAutoRotate={isAutoRotate}
        onToggleAutoRotate={() => setIsAutoRotate(!isAutoRotate)}
        isXRay={isXRay}
        onToggleXRay={() => setIsXRay(!isXRay)}
        showStreamlines={showStreamlines}
        onToggleStreamlines={() => setShowStreamlines(!showStreamlines)}
        physicalState={physicalState}
        showCoMGizmo={showCoMGizmo}
        onToggleCoMGizmo={() => setShowCoMGizmo(!showCoMGizmo)}
        visibilityModeRequest={visibilityModeRequest}
      />

      {/* View Switcher Tabs (Stage Configurator, CAD Tree, Health Diagnostics, Revisions) */}
      <div className="flex items-center justify-between gap-2 border-b border-base-800/80 pb-2 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setIsInAeroStudio(false);
              setActiveTab("stage_config");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
              activeTab === "stage_config" && !isInAeroStudio
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm"
                : "bg-base-900/60 border-base-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wrench size={13} />
            <span>STAGE CONFIGURATOR</span>
          </button>

          <button
            onClick={() => {
              setIsInAeroStudio(false);
              setActiveTab("cad_tree");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
              activeTab === "cad_tree"
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm"
                : "bg-base-900/60 border-base-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers size={13} />
            <span>CAD HIERARCHY TREE</span>
          </button>

          <button
            onClick={() => {
              setIsInAeroStudio(false);
              setActiveTab("diagnostics");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
              activeTab === "diagnostics"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm"
                : "bg-base-900/60 border-base-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck size={13} />
            <span>HEALTH & CLEARANCE ({healthReport.score}/100)</span>
          </button>

          <button
            onClick={() => {
              setIsInAeroStudio(false);
              setActiveTab("versions");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
              activeTab === "versions"
                ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                : "bg-base-900/60 border-base-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitBranch size={13} />
            <span>REVISIONS & FREEZE</span>
          </button>
        </div>

        {/* Parametric Aerodynamics Studio Gateway */}
        <button
          onClick={() => setIsInAeroStudio(true)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
            isInAeroStudio
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/30"
              : "bg-base-900/80 border-base-800 text-cyan-400 hover:border-cyan-500/50"
          }`}
        >
          <Wind size={13} className="animate-pulse" />
          <span>AERODYNAMICS STUDIO</span>
        </button>
      </div>

      {/* Dynamic Sub-Panel */}
      {isInAeroStudio ? (
        <ParametricAerodynamicsStudio
          aero={assemblyState.aero}
          onUpdateAero={handleUpdateAero}
          onExitToAssembly={() => setIsInAeroStudio(false)}
        />
      ) : activeTab === "cad_tree" ? (
        <VehicleConfigTree
          installedStages={assemblyState.installedStages}
          selectedStage={activeStage}
          onSelectStage={(s) => {
            setActiveStage(s);
            setActiveTab("stage_config");
          }}
          onSetVisibilityMode={(stage, mode) => {
            setVisibilityModeRequest({ stage, mode });
          }}
        />
      ) : activeTab === "diagnostics" ? (
        <AssemblyHealthDiagnostics
          healthReport={healthReport}
          physicalState={physicalState}
          showCoMGizmo={showCoMGizmo}
          onToggleCoMGizmo={() => setShowCoMGizmo(!showCoMGizmo)}
        />
      ) : activeTab === "versions" ? (
        <AssemblyVersionManager
          versions={history.versions}
          currentMassKg={physicalState.totalCurbWeightKg}
          currentHealthScore={healthReport.score}
          isCurrentFrozen={history.isCurrentFrozen}
          onSaveVersion={(name, score, mass, freeze) => {
            history.saveVersion(name, score, mass, freeze);
          }}
          onLoadVersion={(id) => {
            const loaded = history.loadVersion(id);
            if (loaded) setAssemblyState(loaded);
          }}
          onToggleFreeze={history.toggleFreezeCurrent}
        />
      ) : (
        <>
          {activeStage === "chassis" && (
            <ChassisAssemblyStage
              chassis={assemblyState.chassis}
              onUpdateChassis={handleUpdateChassis}
              isInstalled={assemblyState.installedStages.has("chassis")}
              onInstall={() => handleInstallStage("chassis")}
            />
          )}

          {activeStage === "engine" && (
            <EngineAssemblyStage
              engine={assemblyState.engine}
              enginePosition={assemblyState.enginePosition}
              onUpdatePosition={(pos) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, enginePosition: pos };
                  history.pushState(updated);
                  return updated;
                });
              }}
              engineOffsetMm={assemblyState.engineOffsetMm ?? 0}
              onUpdateOffset={(offset) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, engineOffsetMm: offset };
                  history.pushState(updated);
                  return updated;
                });
              }}
              isInstalled={assemblyState.installedStages.has("engine")}
              onInstall={() => handleInstallStage("engine")}
            />
          )}

          {activeStage === "transmission" && (
            <TransmissionAssemblyStage
              transmissionType={assemblyState.transmissionType}
              onUpdateTransmission={(t) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, transmissionType: t };
                  history.pushState(updated);
                  return updated;
                });
              }}
              diffCoolingFins={assemblyState.diffCoolingFins ?? true}
              onUpdateDiffCoolingFins={(enabled) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, diffCoolingFins: enabled };
                  history.pushState(updated);
                  return updated;
                });
              }}
              cvBoots={assemblyState.cvBoots ?? true}
              onUpdateCvBoots={(enabled) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, cvBoots: enabled };
                  history.pushState(updated);
                  return updated;
                });
              }}
              isInstalled={assemblyState.installedStages.has("transmission")}
              onInstall={() => handleInstallStage("transmission")}
            />
          )}

          {activeStage === "suspension" && (
            <SuspensionAssemblyStage
              suspensionType={assemblyState.suspensionType}
              onUpdateSuspension={(s) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, suspensionType: s };
                  history.pushState(updated);
                  return updated;
                });
              }}
              activeCoilovers={assemblyState.activeCoilovers ?? false}
              onUpdateActiveCoilovers={(enabled) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, activeCoilovers: enabled };
                  history.pushState(updated);
                  return updated;
                });
              }}
              arbFrontNmPerDeg={assemblyState.arbFrontNmPerDeg ?? 120}
              arbRearNmPerDeg={assemblyState.arbRearNmPerDeg ?? 100}
              onUpdateArb={(patch) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, ...patch };
                  history.pushState(updated);
                  return updated;
                });
              }}
              isInstalled={assemblyState.installedStages.has("suspension")}
              onInstall={() => handleInstallStage("suspension")}
            />
          )}

          {activeStage === "brakes" && (
            <BrakesAssemblyStage
              brakeType={assemblyState.brakeType}
              brakeBiasPct={assemblyState.brakeBiasPct ?? 62}
              onUpdateBrakeBias={(pct) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, brakeBiasPct: pct };
                  history.pushState(updated);
                  return updated;
                });
              }}
              caliperColor={assemblyState.caliperColor}
              onUpdateBrakes={(patch) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, ...patch };
                  history.pushState(updated);
                  return updated;
                });
              }}
              isInstalled={assemblyState.installedStages.has("brakes")}
              onInstall={() => handleInstallStage("brakes")}
            />
          )}

          {activeStage === "wheels" && (
            <WheelsAssemblyStage
              wheelStyle={assemblyState.wheelStyle}
              tireCompound={assemblyState.tireCompound}
              onUpdateWheels={(patch) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, ...patch };
                  history.pushState(updated);
                  return updated;
                });
              }}
              isInstalled={assemblyState.installedStages.has("wheels")}
              onInstall={() => handleInstallStage("wheels")}
            />
          )}

          {activeStage === "body_structure" && (
            <BodyPanelsAssemblyStage
              bodyKit={assemblyState.bodyKit}
              doorStyle={assemblyState.doorStyle}
              doorOpenAngleDeg={assemblyState.doorOpenAngleDeg ?? 0}
              bonnetStyle={assemblyState.bonnetStyle}
              bonnetOpenAngleDeg={assemblyState.bonnetOpenAngleDeg ?? 0}
              dickyStyle={assemblyState.dickyStyle}
              dickyOpenAngleDeg={assemblyState.dickyOpenAngleDeg ?? 0}
              paintColor={assemblyState.paintColor}
              paintFinish={assemblyState.paintFinish}
              fenderLouvers={assemblyState.fenderLouvers ?? false}
              onUpdateBody={(patch) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, ...patch };
                  history.pushState(updated);
                  return updated;
                });
                if (patch.paintColor || patch.paintFinish) {
                  updateExterior({
                    paintColor: patch.paintColor || assemblyState.paintColor,
                    paintFinish: patch.paintFinish || assemblyState.paintFinish,
                  });
                }
              }}
              isInstalled={assemblyState.installedStages.has("body_structure")}
              onInstall={() => handleInstallStage("body_structure")}
            />
          )}

          {activeStage === "glass" && (
            <GlassAssemblyStage
              glassType={assemblyState.glassType}
              onUpdateGlass={(g) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, glassType: g };
                  history.pushState(updated);
                  return updated;
                });
              }}
              lexanEngineCover={assemblyState.lexanEngineCover ?? false}
              onUpdateLexanEngineCover={(enabled) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, lexanEngineCover: enabled };
                  history.pushState(updated);
                  return updated;
                });
              }}
              isInstalled={assemblyState.installedStages.has("glass")}
              onInstall={() => handleInstallStage("glass")}
            />
          )}

          {activeStage === "interior" && (
            <InteriorAssemblyStage
              interiorType={assemblyState.interiorType}
              onUpdateInterior={(i) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, interiorType: i };
                  history.pushState(updated);
                  return updated;
                });
              }}
              sixPointHarness={assemblyState.sixPointHarness ?? true}
              onUpdateSixPointHarness={(enabled) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, sixPointHarness: enabled };
                  history.pushState(updated);
                  return updated;
                });
              }}
              motecDisplay={assemblyState.motecDisplay ?? true}
              onUpdateMotecDisplay={(enabled) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, motecDisplay: enabled };
                  history.pushState(updated);
                  return updated;
                });
              }}
              isInstalled={assemblyState.installedStages.has("interior")}
              onInstall={() => handleInstallStage("interior")}
            />
          )}

          {activeStage === "electronics" && (
            <ElectronicsAssemblyStage
              electronicsType={assemblyState.electronicsType}
              onUpdateElectronics={(e) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, electronicsType: e };
                  history.pushState(updated);
                  return updated;
                });
              }}
              raychemLooms={assemblyState.raychemLooms ?? false}
              onUpdateRaychemLooms={(enabled) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, raychemLooms: enabled };
                  history.pushState(updated);
                  return updated;
                });
              }}
              isInstalled={assemblyState.installedStages.has("electronics")}
              onInstall={() => handleInstallStage("electronics")}
            />
          )}

          {activeStage === "final_exterior" && (
            <FinalExteriorAssemblyStage
              exhaustType={assemblyState.exhaustType}
              onUpdateExhaustType={(ex) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, exhaustType: ex };
                  history.pushState(updated);
                  return updated;
                });
              }}
              heatTintIntensity={assemblyState.heatTintIntensity ?? 70}
              onUpdateHeatTint={(pct) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, heatTintIntensity: pct };
                  history.pushState(updated);
                  return updated;
                });
              }}
              towHooksFront={assemblyState.towHooksFront ?? true}
              towHooksRear={assemblyState.towHooksRear ?? true}
              onUpdateTowHooks={(patch) => {
                setAssemblyState((prev) => {
                  const updated = { ...prev, ...patch };
                  history.pushState(updated);
                  return updated;
                });
              }}
              isInstalled={assemblyState.installedStages.has("final_exterior")}
              onInstall={() => handleInstallStage("final_exterior")}
            />
          )}

          {activeStage === "aero_studio" && (
            <div className="p-4 rounded-2xl bg-base-900/80 border border-base-800 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-base-800 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-mono text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Wind size={16} /> 12. AERODYNAMICS STUDIO & ACTIVE SURFACES
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure high-downforce wings, front splitters, venturi diffuser angles, and DRS kinematics.
                  </p>
                </div>
                <button
                  onClick={() => handleInstallStage("aero_studio")}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 size={14} />
                  <span>LOCK & INSTALL AERO SUITE</span>
                </button>
              </div>
              <ParametricAerodynamicsStudio
                aero={assemblyState.aero}
                onUpdateAero={handleUpdateAero}
              />
            </div>
          )}

          {activeStage === "complete" && (
            <VehicleCompletionStage
              assemblyState={assemblyState}
              physicalState={{
                totalCurbWeightKg: physicalState.totalCurbWeightKg,
                centerOfMassMm: physicalState.centerOfMassMm,
                weightDistributionFrontPct: physicalState.weightDistributionFrontPct,
              }}
              onEnterAeroStudio={() => setActiveStage("aero_studio")}
              showCoMGizmo={showCoMGizmo}
              onToggleCoMGizmo={() => setShowCoMGizmo(!showCoMGizmo)}
              onFinishVehicle={() => {
                assemblyAudio.playPneumaticInstall();
                alert("Vehicle Assembly & Hardware Sign-Off Complete! Ready for Virtual Track Testing & Simulation.");
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
