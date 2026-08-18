// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — MASTER STUDIO CONTAINER
// ============================================================================
// Orchestrates the complete modular vehicle construction workflow:
// Step 1: Body Type Selection (10 categories)
// Step 2: 5 Dedicated Chassis Architectures
// Step 3: 3D CAD WebGL Viewport with Exploded View & X-Ray inspection
// Step 4: 12-Stage Component Assembly Ribbon
// Step 5: 3-Column Configuration Deck (Parameters, Metallurgy Lab, Impact & Advisory)
// ============================================================================

import React from 'react';
import { useVehicleConstructionStore } from '../../state/useVehicleConstructionStore';
import { BodyTypeCarousel } from './BodyTypeCarousel';
import { ChassisArchitectureSelector } from './ChassisArchitectureSelector';
import { ModularVehicle3DViewport } from './ModularVehicle3DViewport';
import { VehicleAssemblyRibbon } from './VehicleAssemblyRibbon';
import { Vehicle3ColumnDeck } from './Vehicle3ColumnDeck';
import { ModularInteriorWorkshop } from './ModularInteriorWorkshop';
import { SUBSYSTEM_STAGES } from '../../exterior3d/manifests/modularComponentManifest';

export const VehicleConstructionStudio: React.FC = () => {
  const store = useVehicleConstructionStore();
  const metrics = store.getComputedMetrics();

  const handleNextStage = () => {
    const currentIndex = SUBSYSTEM_STAGES.findIndex((s) => s.stage === store.activeStage);
    if (currentIndex >= 0 && currentIndex < SUBSYSTEM_STAGES.length - 1) {
      store.setActiveStage(SUBSYSTEM_STAGES[currentIndex + 1].stage);
    }
  };

  return (
    <div className="space-y-4 font-mono pb-36">
      {/* ── STEP 1: BODY TYPE CAROUSEL ── */}
      <BodyTypeCarousel
        activeBodyType={store.activeBodyType}
        onSelectBodyType={store.setBodyType}
      />

      {/* ── STEP 2: 5 CHASSIS ARCHITECTURES FOR ACTIVE BODY TYPE ── */}
      <ChassisArchitectureSelector
        activeBodyType={store.activeBodyType}
        selectedChassisId={store.activeChassisId}
        onSelectChassis={store.setChassisId}
      />

      {/* ── STEP 3: 3D WEBGL CAD VIEWPORT ── */}
      <ModularVehicle3DViewport
        bodyType={store.activeBodyType}
        chassisId={store.activeChassisId}
        installedStages={store.installedStages}
        materialGrades={store.materialGrades}
        interiorConfig={store.interiorConfig}
        wheelbaseMm={store.wheelbaseMm}
        trackWidthFrontMm={store.trackWidthFrontMm}
        trackWidthRearMm={store.trackWidthRearMm}
        rideHeightMm={store.rideHeightMm}
        viewMode={store.viewMode}
        cameraPreset={store.cameraPreset}
        explodedViewProgress={store.explodedViewProgress}
        isXRayActive={store.isXRayActive}
        isWireframeActive={store.isWireframeActive}
        isRotating={store.isRotating}
        onSetViewMode={store.setViewMode}
        onSetCameraPreset={store.setCameraPreset}
        onSetExplodedView={store.setExplodedViewProgress}
        onToggleXRay={store.toggleXRay}
        onToggleWireframe={store.toggleWireframe}
        onToggleRotating={store.toggleRotating}
      />

      {/* ── STEP 4: 12-STAGE ASSEMBLY RIBBON ── */}
      <VehicleAssemblyRibbon
        activeStage={store.activeStage}
        installedStages={store.installedStages}
        completionPercentage={metrics.completionPercentage}
        onSelectStage={store.setActiveStage}
        onInstallAll={() => SUBSYSTEM_STAGES.forEach((s) => store.installStage(s.stage))}
      />

      {/* ── STEP 5: 3-COLUMN CONFIGURATION DECK ── */}
      <Vehicle3ColumnDeck
        activeStage={store.activeStage}
        installedStages={store.installedStages}
        materialGrade={store.materialGrades[store.activeStage] || 'forged'}
        onSelectMaterialGrade={(grade) => store.setMaterialGrade(store.activeStage, grade)}
        onInstallStage={store.installStage}
        onRemoveStage={store.removeStage}
        onNextStage={handleNextStage}
        wheelbaseMm={store.wheelbaseMm}
        trackWidthFrontMm={store.trackWidthFrontMm}
        trackWidthRearMm={store.trackWidthRearMm}
        rideHeightMm={store.rideHeightMm}
        onUpdateWheelbase={store.setWheelbase}
        onUpdateTrackWidthFront={store.setTrackWidthFront}
        onUpdateTrackWidthRear={store.setTrackWidthRear}
        onUpdateRideHeight={store.setRideHeight}
        metrics={metrics}
      />

      {/* ── STEP 6: DEDICATED MODULAR INTERIOR WORKSHOP (WHEN INTERIOR STAGE ACTIVE) ── */}
      {store.activeStage === 'interior_cabin' && (
        <ModularInteriorWorkshop
          activeChassisId={store.activeChassisId}
          config={store.interiorConfig}
          onUpdateInterior={store.updateInteriorConfig}
        />
      )}
    </div>
  );
};
