// ============================================================================
// 3D MODULAR STRUCTURE VISUALIZER & FEA STRESS GIZMO PIPELINE
// ============================================================================
// Constructs procedural Three.js visual gizmos:
// 1. Luminous 3D Center of Gravity (CoG) Sphere & Ground Projection
// 2. 4-Corner Tire Normal Load Vector Arrows
// 3. FEA Stress Tensors & Hotspot Beacons with Color-Coded Heatmap
// 4. Subassembly Isolation / Ghosting Controller
// ============================================================================

import * as THREE from 'three';
import { ModularStructureTelemetry, FeaStressHotspot } from '../../sim/modularVehicle/modularStructureEngine';

export class ModularStructureVisualizer {
  /**
   * Constructs the complete Modular Structure Telemetry 3D Overlay Group.
   */
  public static createTelemetryOverlayGroup(
    telemetry: ModularStructureTelemetry,
    wheelbaseMm: number,
    trackWidthFrontMm: number,
    trackWidthRearMm: number,
    rideHeightMm: number,
    options: {
      showCoG?: boolean;
      showFEAStress?: boolean;
      showLoadVectors?: boolean;
    } = {}
  ): THREE.Group {
    const rootGroup = new THREE.Group();
    rootGroup.name = 'Modular_Structure_Telemetry_Overlays';

    const { showCoG = true, showFEAStress = true, showLoadVectors = true } = options;

    const wbM = wheelbaseMm / 1000;
    const tfM = trackWidthFrontMm / 1000;
    const trM = trackWidthRearMm / 1000;
    const rhM = rideHeightMm / 1000;

    const frontAxleX = 0.45;
    const rearAxleX = frontAxleX - wbM;
    const halfTf = tfM / 2;
    const halfTr = trM / 2;

    // 1. Center of Gravity (CoG) 3D Luminous Sphere
    if (showCoG) {
      const cogGroup = this.createCenterOfGravityGizmo(telemetry, frontAxleX);
      rootGroup.add(cogGroup);
    }

    // 2. 4-Corner Tire Normal Load Vector Arrows
    if (showLoadVectors) {
      const loadsGroup = this.createTireLoadVectorsGizmo(telemetry, frontAxleX, rearAxleX, halfTf, halfTr);
      rootGroup.add(loadsGroup);
    }

    // 3. FEA Structural Stress Hotspots & Load Path Trusses
    if (showFEAStress) {
      const feaGroup = this.createFeaStressHeatmapGizmo(telemetry.feaHotspots);
      rootGroup.add(feaGroup);
    }

    return rootGroup;
  }

  // ─── 1. CENTER OF GRAVITY (CoG) GIZMO ───
  private static createCenterOfGravityGizmo(
    telemetry: ModularStructureTelemetry,
    frontAxleX: number
  ): THREE.Group {
    const cogGroup = new THREE.Group();
    cogGroup.name = 'CoG_Visualizer_Gizmo';

    const cogWorldX = frontAxleX + (telemetry.centerOfGravity.xMm / 1000);
    const cogWorldY = telemetry.centerOfGravity.yMm / 1000;
    const cogWorldZ = telemetry.centerOfGravity.zMm / 1000;

    // Inner Glowing Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.045, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Cyan Luminous
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(cogWorldX, cogWorldY, cogWorldZ);
    cogGroup.add(coreMesh);

    // Outer Dual-Segment Alternating Shell (Golden & Obsidian)
    const shellGeo = new THREE.SphereGeometry(0.065, 24, 24);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.15,
      transparent: true,
      opacity: 0.75,
      wireframe: true,
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.position.set(cogWorldX, cogWorldY, cogWorldZ);
    cogGroup.add(shellMesh);

    // 3D Cartesian Axes
    const axisLen = 0.22;
    const xAxisGeo = new THREE.CylinderGeometry(0.003, 0.003, axisLen, 12);
    xAxisGeo.rotateZ(Math.PI / 2);
    const xAxis = new THREE.Mesh(xAxisGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    xAxis.position.set(cogWorldX, cogWorldY, cogWorldZ);
    cogGroup.add(xAxis);

    const yAxisGeo = new THREE.CylinderGeometry(0.003, 0.003, axisLen, 12);
    const yAxis = new THREE.Mesh(yAxisGeo, new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    yAxis.position.set(cogWorldX, cogWorldY, cogWorldZ);
    cogGroup.add(yAxis);

    const zAxisGeo = new THREE.CylinderGeometry(0.003, 0.003, axisLen, 12);
    zAxisGeo.rotateX(Math.PI / 2);
    const zAxis = new THREE.Mesh(zAxisGeo, new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
    zAxis.position.set(cogWorldX, cogWorldY, cogWorldZ);
    cogGroup.add(zAxis);

    // Ground Projection Drop-Line
    const dropLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(cogWorldX, cogWorldY, cogWorldZ),
      new THREE.Vector3(cogWorldX, 0.005, cogWorldZ),
    ]);
    const dropLineMat = new THREE.LineDashedMaterial({
      color: 0x06b6d4,
      dashSize: 0.04,
      gapSize: 0.02,
    });
    const dropLine = new THREE.Line(dropLineGeo, dropLineMat);
    dropLine.computeLineDistances();
    cogGroup.add(dropLine);

    // Ground Bullseye Target Disc
    const discGeo = new THREE.RingGeometry(0.08, 0.12, 32);
    discGeo.rotateX(-Math.PI / 2);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.position.set(cogWorldX, 0.006, cogWorldZ);
    cogGroup.add(discMesh);

    return cogGroup;
  }

  // ─── 2. 4-CORNER TIRE LOAD VECTORS ───
  private static createTireLoadVectorsGizmo(
    telemetry: ModularStructureTelemetry,
    frontAxleX: number,
    rearAxleX: number,
    halfTf: number,
    halfTr: number
  ): THREE.Group {
    const loadsGroup = new THREE.Group();
    loadsGroup.name = 'Tire_Load_Vectors_Gizmo';

    const corners: { name: string; x: number; z: number; loadN: number; loadKg: number }[] = [
      { name: 'FL', x: frontAxleX, z: -halfTf, loadN: telemetry.cornerForcesN.fl, loadKg: telemetry.cornerLoadsKg.fl },
      { name: 'FR', x: frontAxleX, z: halfTf, loadN: telemetry.cornerForcesN.fr, loadKg: telemetry.cornerLoadsKg.fr },
      { name: 'RL', x: rearAxleX, z: -halfTr, loadN: telemetry.cornerForcesN.rl, loadKg: telemetry.cornerLoadsKg.rl },
      { name: 'RR', x: rearAxleX, z: halfTr, loadN: telemetry.cornerForcesN.rr, loadKg: telemetry.cornerLoadsKg.rr },
    ];

    const maxForceN = Math.max(telemetry.cornerForcesN.fl, telemetry.cornerForcesN.fr, telemetry.cornerForcesN.rl, telemetry.cornerForcesN.rr, 4500);

    for (const corner of corners) {
      const arrowLen = 0.20 + (corner.loadN / maxForceN) * 0.45;
      const arrowDir = new THREE.Vector3(0, 1, 0);
      const arrowOrigin = new THREE.Vector3(corner.x, 0.01, corner.z);

      const arrowHelper = new THREE.ArrowHelper(
        arrowDir,
        arrowOrigin,
        arrowLen,
        0xf59e0b, // Amber / Gold
        0.08,
        0.04
      );
      arrowHelper.name = `Load_Vector_${corner.name}`;
      loadsGroup.add(arrowHelper);

      // Contact Patch Ground Halo Ring
      const patchGeo = new THREE.RingGeometry(0.06, 0.085, 24);
      patchGeo.rotateX(-Math.PI / 2);
      const patchMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      });
      const patchMesh = new THREE.Mesh(patchGeo, patchMat);
      patchMesh.position.set(corner.x, 0.005, corner.z);
      loadsGroup.add(patchMesh);
    }

    return loadsGroup;
  }

  // ─── 3. FEA STRESS HEATMAP GIZMO ───
  private static createFeaStressHeatmapGizmo(hotspots: FeaStressHotspot[]): THREE.Group {
    const feaGroup = new THREE.Group();
    feaGroup.name = 'FEA_Stress_Heatmap_Gizmo';

    for (const spot of hotspots) {
      // Color Mapping based on von Mises Stress & Yield Ratio
      let spotColor = 0x06b6d4; // Cyan (Nominal < 250 MPa)
      if (spot.vonMisesStressMpa > 400) {
        spotColor = 0xef4444; // Red (Critical Hotspot > 400 MPa)
      } else if (spot.vonMisesStressMpa > 280) {
        spotColor = 0xeab308; // Yellow/Amber (Elevated Stress)
      } else if (spot.vonMisesStressMpa > 180) {
        spotColor = 0x22c55e; // Green (Standard Load)
      }

      // Hotspot Beacon Sphere
      const sphereGeo = new THREE.SphereGeometry(0.038, 20, 20);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: spotColor,
        emissive: spotColor,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.8,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.name = `FEA_Beacon_${spot.nodeId}`;
      sphereMesh.position.set(spot.location.x, spot.location.y, spot.location.z);
      feaGroup.add(sphereMesh);

      // Outer Pulsing Halo Ring
      const haloGeo = new THREE.TorusGeometry(0.055, 0.004, 12, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: spotColor,
        transparent: true,
        opacity: 0.8,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.set(spot.location.x, spot.location.y, spot.location.z);
      feaGroup.add(haloMesh);
    }

    // Connect Front & Rear Nodes with Load Path Vector Trusses
    if (hotspots.length >= 4) {
      const trussPoints: THREE.Vector3[] = [];
      for (const h of hotspots) {
        trussPoints.push(new THREE.Vector3(h.location.x, h.location.y, h.location.z));
      }
      const trussGeo = new THREE.BufferGeometry().setFromPoints(trussPoints);
      const trussMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.45,
      });
      const trussLine = new THREE.Line(trussGeo, trussMat);
      feaGroup.add(trussLine);
    }

    return feaGroup;
  }

  // ─── 4. SUBASSEMBLY SOLO / ISOLATION CONTROLLER ───
  public static applySubassemblyIsolation(
    vehicleRoot: THREE.Group,
    isolatedStage: string | null
  ) {
    if (!isolatedStage || isolatedStage === 'all') {
      // Restore all original materials & visibility
      vehicleRoot.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.visible = true;
          if (mesh.userData.origMaterial) {
            mesh.material = mesh.userData.origMaterial;
          }
        }
      });
      return;
    }

    const ghostMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.12,
      roughness: 0.9,
      metalness: 0.1,
      wireframe: false,
    });

    vehicleRoot.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.userData.origMaterial) {
          mesh.userData.origMaterial = mesh.material;
        }

        // Determine if this mesh belongs to the isolated stage
        const parentName = (mesh.parent?.name || '').toLowerCase();
        const meshName = mesh.name.toLowerCase();
        const stageKey = isolatedStage.toLowerCase().replace('_', '');

        const isMatching =
          parentName.includes(stageKey) ||
          meshName.includes(stageKey) ||
          (stageKey === 'chassis' && (parentName.includes('chassis') || meshName.includes('chassis'))) ||
          (stageKey === 'suspension' && (parentName.includes('suspension') || meshName.includes('wishbone'))) ||
          (stageKey === 'wheels' && (parentName.includes('wheel') || meshName.includes('wheel') || meshName.includes('tire') || meshName.includes('caliper'))) ||
          (stageKey === 'powertrain' && (parentName.includes('powertrain') || parentName.includes('battery') || meshName.includes('engine') || meshName.includes('motor'))) ||
          (stageKey === 'aero' && (parentName.includes('aero') || meshName.includes('wing') || meshName.includes('splitter') || meshName.includes('diffuser')));

        if (isMatching) {
          mesh.material = mesh.userData.origMaterial;
          mesh.visible = true;
        } else {
          mesh.material = ghostMaterial;
          mesh.visible = true;
        }
      }
    });
  }
}
