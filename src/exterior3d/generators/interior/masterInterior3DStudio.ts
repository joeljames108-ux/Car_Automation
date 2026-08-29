// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR STUDIO — MASTER 3D COCKPIT STUDIO ORCHESTRATOR
// ============================================================================
// Assembles, renders, and manages the complete Three.js procedural cockpit:
// - Seamless orchestration of Dashboard, Steering Wheel, Seating, Consoles, Door Panels,
//   Headliner, Pedal Box, Rearview Mirror, and Roll Cages.
// - 6 Cinematic Camera Viewpoint Presets with smooth mathematical positioning.
// - Dynamic day/night and ambient RGB lighting orchestration.
// ============================================================================

import * as THREE from 'three';
import {
  MasterInteriorConfiguration,
} from '../../types/interiorStudioTypes';
import { DASHBOARD_CATALOG, STEERING_WHEEL_CATALOG, SEATING_CATALOG, CENTER_CONSOLE_CATALOG, AUDIO_SYSTEM_CATALOG } from '../../manifests/interiorStudioCatalog';
import { Dashboard3DGenerator } from './dashboard3DGenerator';
import { SteeringWheel3DGenerator } from './steeringWheel3DGenerator';
import { Seating3DGenerator } from './seating3DGenerator';
import { CenterConsole3DGenerator } from './centerConsole3DGenerator';
import { DoorCard3DGenerator } from './doorCard3DGenerator';
import { CabinShell3DGenerator } from './cabinShell3DGenerator';

export type InteriorCameraViewpoint =
  | 'driver_pov'               // First-person driver eyepoint
  | 'steering_cluster_macro'   // Close-up on digital cluster & steering yoke
  | 'center_console_macro'     // Focus on shifter, aircraft flap & HVAC
  | 'passenger_pov'            // Passenger perspective looking across dash
  | 'rear_vip_lounge'          // Rear seat view looking through cabin
  | 'overhead_panoramic';      // High-angle cutaway overview

export interface CameraPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

export class MasterInterior3DStudio {
  /**
   * Generates the entire photorealistic 3D interior cabin cockpit hierarchy.
   */
  public static buildCockpitScene(
    config: MasterInteriorConfiguration,
    wheelbaseMm: number = 2850,
    trackWidthMm: number = 1620
  ): THREE.Group {
    const root = new THREE.Group();
    root.name = 'MasterInteriorCockpitStudio_Root';

    const wbM = wheelbaseMm / 1000;
    const trackM = trackWidthMm / 1000;
    const ambHex = config.ambientLighting.enabled ? config.ambientLighting.primaryColorHex : '#000000';

    // 1. Dashboard Subassembly
    const dashboard = Dashboard3DGenerator.buildDashboard(
      config.dashboardClass,
      trackM,
      config.materials,
      ambHex
    );
    root.add(dashboard);

    // 2. Steering Wheel & Steering Column Subassembly
    const steeringWheel = SteeringWheel3DGenerator.buildSteeringWheel(
      config.steeringTypology,
      config.materials
    );
    steeringWheel.position.set(-0.48, 0.68, -0.34);
    root.add(steeringWheel);

    // 3. Seating Subassembly (Front Driver + Passenger + Rear VIP Bench)
    const seating = Seating3DGenerator.buildSeatingAssembly(
      config.seatingClass,
      config.seatCount,
      config.harnessType,
      config.materials,
      wbM,
      trackM
    );
    root.add(seating);

    // 4. Center Console & Transmission Shifter Subassembly
    const centerConsole = CenterConsole3DGenerator.buildCenterConsole(
      config.centerConsoleStyle,
      config.materials,
      wbM,
      ambHex
    );
    root.add(centerConsole);

    // 5. Door Card Panels (Left & Right) with Audio Grilles
    const audioSpec = AUDIO_SYSTEM_CATALOG[config.audioSystemId] || Object.values(AUDIO_SYSTEM_CATALOG)[0];
    const doorCards = DoorCard3DGenerator.buildDoorCardAssemblies(
      config.materials,
      audioSpec,
      wbM,
      trackM,
      ambHex
    );
    root.add(doorCards);

    // 6. Cabin Floor Tub, Pedal Box, Headliner, Rearview Mirror & Roll Cage
    const cabinShell = CabinShell3DGenerator.buildCabinShell(
      config.materials,
      config.rollCage,
      wbM,
      trackM
    );
    root.add(cabinShell);

    return root;
  }

  /**
   * Calculates the exact camera position, target vector, and field-of-view for each viewpoint preset.
   */
  public static getCameraPoseForViewpoint(viewpoint: InteriorCameraViewpoint): CameraPose {
    switch (viewpoint) {
      case 'driver_pov':
        return {
          position: new THREE.Vector3(-0.55, 0.92, -0.08), // Driver eye — headrest height, slightly back
          target: new THREE.Vector3(0.80, 0.55, -1.5), // Looking forward and slightly down through windshield at road
          fov: 75, // Wide angle to capture steering + dash + windshield + road
        };

      case 'steering_cluster_macro':
        return {
          position: new THREE.Vector3(-0.55, 0.82, -0.08), // Close behind steering wheel
          target: new THREE.Vector3(-0.48, 0.70, -0.36), // Focus on instrument cluster area
          fov: 42,
        };

      case 'center_console_macro':
        return {
          position: new THREE.Vector3(-0.38, 0.78, 0.05), // From driver's chest height
          target: new THREE.Vector3(-0.22, 0.30, 0.15), // Looking down at shifter & HVAC
          fov: 48,
        };

      case 'passenger_pov':
        return {
          position: new THREE.Vector3(-0.60, 0.90, 0.32), // Passenger eye position
          target: new THREE.Vector3(-0.40, 0.72, -0.30), // Looking toward driver's dash
          fov: 68,
        };

      case 'rear_vip_lounge':
        return {
          position: new THREE.Vector3(-1.20, 0.85, 0.05), // Rear seat center
          target: new THREE.Vector3(-0.20, 0.72, -0.10), // Looking forward through cabin
          fov: 75,
        };

      case 'overhead_panoramic':
      default:
        return {
          position: new THREE.Vector3(-0.60, 2.00, 0.10), // High overhead
          target: new THREE.Vector3(-0.50, 0.35, -0.10), // Looking down at full cabin
          fov: 58,
        };
    }
  }

  /**
   * Disposes all geometries and materials across the interior cockpit hierarchy.
   */
  public static disposeCockpitScene(group: THREE.Group | null): void {
    if (!group) return;
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m.dispose());
        }
      }
    });
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
  }
}
