// ===================================================================
// EXTERIOR ASSEMBLY ANIMATION UTILITIES & PARTICLE CONTROLLERS
// ===================================================================
// Physics-driven easing curves, spot welding sparks burst generator,
// laser alignment trajectory paths, and exploded view offsets.
// ===================================================================

import type { ExteriorComponentId, ExteriorAssemblyPhase } from "../../../sim/exteriorAssemblyTypes";
import { EXTERIOR_ASSEMBLY_REGISTRY } from "../../../sim/exteriorAssemblyTypes";

export interface AnimatedParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

export function generateWeldingSparks(originX: number, originY: number, count = 16): AnimatedParticle[] {
  const colors = ["#ffffff", "#fef08a", "#fde047", "#f59e0b", "#ea580c", "#fbbf24"];
  const particles: AnimatedParticle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    particles.push({
      id: Math.random(),
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5, // Slight upward blast
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 1.5 + Math.random() * 2.5,
      alpha: 1.0,
    });
  }

  return particles;
}

export function calculateExplodedOffset(
  componentId: ExteriorComponentId,
  explodedAmount: number
): { x: number; y: number } {
  const comp = EXTERIOR_ASSEMBLY_REGISTRY.find((c) => c.id === componentId);
  if (!comp) return { x: 0, y: 0 };

  return {
    x: Math.round(comp.explodedOffset.x * explodedAmount),
    y: Math.round(comp.explodedOffset.y * explodedAmount),
  };
}

export function getComponentRenderZIndex(componentId: ExteriorComponentId): number {
  const renderOrder: ExteriorComponentId[] = [
    "floor_pan",
    "front_subframe",
    "rear_subframe",
    "chassis_frame",
    "firewall_bulkhead",
    "rocker_panels",
    "crash_boxes_front_rear",
    "roll_cage_safety",
    "suspension_front_assembly",
    "suspension_rear_assembly",
    "brake_rotors_calipers",
    "wheels_tires_assembly",
    "a_pillar_assembly",
    "b_pillar_assembly",
    "c_pillar_assembly",
    "front_fenders",
    "rear_quarter_panels",
    "doors_assembly",
    "hood_panel",
    "trunk_decklid",
    "roof_panel",
    "front_bumper_fascia",
    "rear_bumper_fascia",
    "front_splitter_tray",
    "rear_diffuser_tunnel",
    "side_skirts_aero",
    "rear_wing_spoiler",
    "canards_dive_planes",
    "hood_fender_vents",
    "windshield_glass",
    "side_door_glass",
    "rear_window_backlite",
    "headlights_matrix",
    "taillights_oled",
    "fog_drl_lights",
    "side_mirrors",
    "front_grille_mesh",
    "exhaust_tips_surround",
    "door_handles_latches",
    "wiper_cowl_assembly",
    "badges_emblems",
  ];

  const idx = renderOrder.indexOf(componentId);
  return idx !== -1 ? idx : 50;
}
