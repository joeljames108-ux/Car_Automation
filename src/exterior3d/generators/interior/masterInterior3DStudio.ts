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
          position: new THREE.Vector3(-0.70, 0.88, -0.34), // Seated driver eyepoint
          target: new THREE.Vector3(0.10, 0.72, -0.15),
          fov: 65,
        };

      case 'steering_cluster_macro':
        return {
          position: new THREE.Vector3(-0.62, 0.74, -0.34),
          target: new THREE.Vector3(-0.44, 0.72, -0.34),
          fov: 48,
        };

      case 'center_console_macro':
        return {
          position: new THREE.Vector3(-0.42, 0.65, -0.22),
          target: new THREE.Vector3(-0.24, 0.26, 0),
          fov: 52,
        };

      case 'passenger_pov':
        return {
          position: new THREE.Vector3(-0.70, 0.88, 0.34),
          target: new THREE.Vector3(-0.35, 0.70, -0.20),
          fov: 65,
        };

      case 'rear_vip_lounge':
        return {
          position: new THREE.Vector3(-1.38, 0.92, 0),
          target: new THREE.Vector3(-0.20, 0.68, 0),
          fov: 72,
        };

      case 'overhead_panoramic':
      default:
        return {
          position: new THREE.Vector3(-0.75, 2.20, 0),
          target: new THREE.Vector3(-0.60, 0.40, 0),
          fov: 60,
        };
    }
  }
}
