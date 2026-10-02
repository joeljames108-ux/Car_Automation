/**
 * AUTO TYCOON CAMPUS HQ - BUILDING PLACEMENT ENGINE (PHASE 37)
 * 
 * Accurately positions, aligns, rotates, and attaches interactive beacons
 * to 3D campus buildings and plot boundary markers across all 14 units.
 */

import * as THREE from "three";
import { CampusUnitDefinition, CampusUnitId } from "../../sim/campus/campusTypes";
import { CAMPUS_PLOTS, CampusPlotDefinition } from "../../sim/campus/campusPlotCoordinates";
import { CampusModelLoader } from "./CampusModelLoader";

export class BuildingPlacementEngine {
  /**
   * Places a building model onto its registered world plot
   */
  public static placeBuildingOnPlot(
    buildingGroup: THREE.Group,
    unit: CampusUnitDefinition,
    plot: CampusPlotDefinition
  ): void {
    // Snap to plot world position
    buildingGroup.position.set(plot.worldPosition.x, plot.worldPosition.y, plot.worldPosition.z);
    buildingGroup.rotation.y = plot.rotationRad;

    // Attach metadata to group and all descendant meshes
    buildingGroup.name = `CAMPUS_BUILDING_${unit.id}`;
    buildingGroup.userData = {
      unitId: unit.id,
      unitKey: unit.unitKey,
      plotId: plot.plotId,
      level: unit.level,
      status: unit.status,
    };

    buildingGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.userData.unitId = unit.id;
        child.userData.plotId = plot.plotId;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Add glowing selection beacon ring if not already present
    if (!buildingGroup.getObjectByName("SELECTION_BEACON")) {
      const beaconRingGeo = new THREE.RingGeometry(
        Math.max(plot.footprintMeters.width, plot.footprintMeters.length) * 0.65,
        Math.max(plot.footprintMeters.width, plot.footprintMeters.length) * 0.72,
        32
      );
      beaconRingGeo.rotateX(-Math.PI / 2);
      const beaconRingMat = new THREE.MeshBasicMaterial({
        color: "#38bdf8",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const beaconMesh = new THREE.Mesh(beaconRingGeo, beaconRingMat);
      beaconMesh.name = "SELECTION_BEACON";
      beaconMesh.position.y = 0.25;
      beaconMesh.visible = false; // Hidden until unit selected
      buildingGroup.add(beaconMesh);
    }
  }

  /**
   * Generates a 3D marker for an unbuilt or locked plot (Phase 35)
   * Shows yellow surveyor stakes, boundary chalk lines, and a billboard sign
   */
  public static createLockedPlotMarker(plot: CampusPlotDefinition, unitName: string): THREE.Group {
    const markerGroup = new THREE.Group();
    markerGroup.name = `PLOT_MARKER_${plot.plotId}`;
    markerGroup.position.set(plot.worldPosition.x, plot.worldPosition.y, plot.worldPosition.z);
    markerGroup.rotation.y = plot.rotationRad;
    markerGroup.userData = {
      plotId: plot.plotId,
      unitId: plot.unitId,
      isLockedPlotMarker: true,
    };

    const halfW = plot.footprintMeters.width / 2;
    const halfL = plot.footprintMeters.length / 2;

    // 1. Boundary boundary posts at 4 corners
    const postGeo = new THREE.CylinderGeometry(0.3, 0.3, 2.5, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: "#facc15", roughness: 0.5 }); // Bright safety yellow

    const corners = [
      { x: -halfW, z: -halfL },
      { x: halfW, z: -halfL },
      { x: halfW, z: halfL },
      { x: -halfW, z: halfL },
    ];

    corners.forEach((c) => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(c.x, 1.25, c.z);
      post.castShadow = true;
      post.userData.unitId = plot.unitId;
      markerGroup.add(post);
    });

    // 2. Dashed yellow boundary perimeter ribbon
    const ribbonGeo = new THREE.RingGeometry(
      Math.max(halfW, halfL) * 0.95,
      Math.max(halfW, halfL) * 1.05,
      4
    );
    ribbonGeo.rotateX(-Math.PI / 2);
    ribbonGeo.rotateY(Math.PI / 4);
    const ribbonMat = new THREE.MeshBasicMaterial({
      color: "#eab308",
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.y = 0.1;
    ribbon.userData.unitId = plot.unitId;
    markerGroup.add(ribbon);

    // 3. Wooden surveyor billboard sign
    const signBoardGeo = new THREE.BoxGeometry(6, 2.8, 0.4);
    const signBoardMat = new THREE.MeshStandardMaterial({ color: "#78350f", roughness: 0.8 }); // Dark timber
    const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat);
    signBoard.position.set(0, 3.2, 0);
    signBoard.castShadow = true;
    signBoard.userData.unitId = plot.unitId;
    markerGroup.add(signBoard);

    // Sign support posts
    const signLegGeo = new THREE.CylinderGeometry(0.2, 0.2, 3.2, 8);
    const leg1 = new THREE.Mesh(signLegGeo, signBoardMat);
    leg1.position.set(-2.2, 1.6, 0);
    const leg2 = new THREE.Mesh(signLegGeo, signBoardMat);
    leg2.position.set(2.2, 1.6, 0);
    markerGroup.add(leg1);
    markerGroup.add(leg2);

    return markerGroup;
  }

  /**
   * Generates a 3D construction site marker with orange safety fences and crane mast (Phase 47)
   */
  public static createConstructionSiteMarker(plot: CampusPlotDefinition): THREE.Group {
    const siteGroup = new THREE.Group();
    siteGroup.name = `CONSTRUCTION_SITE_${plot.plotId}`;
    siteGroup.position.set(plot.worldPosition.x, plot.worldPosition.y, plot.worldPosition.z);
    siteGroup.rotation.y = plot.rotationRad;
    siteGroup.userData = {
      plotId: plot.plotId,
      unitId: plot.unitId,
      isConstructionSite: true,
    };

    const halfW = plot.footprintMeters.width / 2;
    const halfL = plot.footprintMeters.length / 2;

    // Safety fencing along perimeter
    const fenceMat = new THREE.MeshStandardMaterial({ color: "#ea580c", roughness: 0.6 }); // Construction orange
    const fenceGeo = new THREE.BoxGeometry(plot.footprintMeters.width, 2.2, 0.3);

    const fNorth = new THREE.Mesh(fenceGeo, fenceMat);
    fNorth.position.set(0, 1.1, -halfL);
    const fSouth = new THREE.Mesh(fenceGeo, fenceMat);
    fSouth.position.set(0, 1.1, halfL);

    const fenceSideGeo = new THREE.BoxGeometry(0.3, 2.2, plot.footprintMeters.length);
    const fWest = new THREE.Mesh(fenceSideGeo, fenceMat);
    fWest.position.set(-halfW, 1.1, 0);
    const fEast = new THREE.Mesh(fenceSideGeo, fenceMat);
    fEast.position.set(halfW, 1.1, 0);

    siteGroup.add(fNorth);
    siteGroup.add(fSouth);
    siteGroup.add(fWest);
    siteGroup.add(fEast);

    // Tower crane mast
    const craneMastGeo = new THREE.BoxGeometry(1.8, 28, 1.8);
    const craneMat = new THREE.MeshStandardMaterial({ color: "#facc15", metalness: 0.4, roughness: 0.4 });
    const craneMast = new THREE.Mesh(craneMastGeo, craneMat);
    craneMast.position.set(0, 14, 0);
    craneMast.castShadow = true;
    siteGroup.add(craneMast);

    // Crane horizontal jib
    const jibGeo = new THREE.BoxGeometry(22, 1.4, 1.4);
    const jib = new THREE.Mesh(jibGeo, craneMat);
    jib.position.set(6, 27.5, 0);
    jib.castShadow = true;
    siteGroup.add(jib);

    siteGroup.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        c.userData.unitId = plot.unitId;
      }
    });

    return siteGroup;
  }
}
