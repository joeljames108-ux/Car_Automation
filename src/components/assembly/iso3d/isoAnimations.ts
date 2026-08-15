import type { ComponentId } from "../../../sim/assemblyTypes";
import { IsoPoint3D } from "./isoMath";

export interface ComponentIsoTrajectory {
  componentId: ComponentId;
  start3D: IsoPoint3D;
  end3D: IsoPoint3D;
  easeType: "linear" | "easeOutQuad" | "bounce";
}

// Custom 3D Bezier & Linear Installation Vectors for all 14 engine parts
export const COMPONENT_3D_TRAJECTORIES: Record<ComponentId, ComponentIsoTrajectory> = {
  block: {
    componentId: "block",
    start3D: { x: 0, y: 0, z: 120 },
    end3D: { x: 0, y: 0, z: 0 },
    easeType: "bounce",
  },
  crankshaft: {
    componentId: "crankshaft",
    start3D: { x: 0, y: -250, z: 12 },
    end3D: { x: 0, y: 0, z: 12 },
    easeType: "easeOutQuad",
  },
  pistons: {
    componentId: "pistons",
    start3D: { x: 0, y: 0, z: 220 },
    end3D: { x: 0, y: 0, z: 50 },
    easeType: "bounce",
  },
  rods: {
    componentId: "rods",
    start3D: { x: 0, y: 0, z: 180 },
    end3D: { x: 0, y: 0, z: 30 },
    easeType: "easeOutQuad",
  },
  camshaft: {
    componentId: "camshaft",
    start3D: { x: -220, y: 0, z: 95 },
    end3D: { x: 0, y: 0, z: 95 },
    easeType: "easeOutQuad",
  },
  head_gasket: {
    componentId: "head_gasket",
    start3D: { x: 0, y: 0, z: 140 },
    end3D: { x: 0, y: 0, z: 66 },
    easeType: "linear",
  },
  cylinder_head: {
    componentId: "cylinder_head",
    start3D: { x: 0, y: 0, z: 240 },
    end3D: { x: 0, y: 0, z: 72 },
    easeType: "bounce",
  },
  valves: {
    componentId: "valves",
    start3D: { x: 0, y: 0, z: 160 },
    end3D: { x: 0, y: 0, z: 80 },
    easeType: "linear",
  },
  intake_manifold: {
    componentId: "intake_manifold",
    start3D: { x: -180, y: 180, z: 150 },
    end3D: { x: 0, y: 0, z: 85 },
    easeType: "easeOutQuad",
  },
  exhaust_headers: {
    componentId: "exhaust_headers",
    start3D: { x: 200, y: -150, z: 120 },
    end3D: { x: 0, y: 0, z: 60 },
    easeType: "easeOutQuad",
  },
  turbocharger: {
    componentId: "turbocharger",
    start3D: { x: 240, y: 100, z: 180 },
    end3D: { x: 0, y: 0, z: 50 },
    easeType: "easeOutQuad",
  },
  oil_pan: {
    componentId: "oil_pan",
    start3D: { x: 0, y: 0, z: -160 },
    end3D: { x: 0, y: 0, z: -20 },
    easeType: "bounce",
  },
  radiator: {
    componentId: "radiator",
    start3D: { x: -220, y: 0, z: 120 },
    end3D: { x: 0, y: 0, z: 0 },
    easeType: "easeOutQuad",
  },
  transmission: {
    componentId: "transmission",
    start3D: { x: 260, y: 0, z: 60 },
    end3D: { x: 0, y: 0, z: 0 },
    easeType: "bounce",
  },
  engine_cover: {
    componentId: "engine_cover",
    start3D: { x: 0, y: 0, z: 280 },
    end3D: { x: 0, y: 0, z: 0 },
    easeType: "bounce",
  },
  hybrid_motor: {
    componentId: "hybrid_motor",
    start3D: { x: 0, y: -200, z: 0 },
    end3D: { x: 0, y: 0, z: 0 },
    easeType: "easeOutQuad",
  },
  inverter_ecu: {
    componentId: "inverter_ecu",
    start3D: { x: 180, y: 180, z: 160 },
    end3D: { x: 0, y: 0, z: 100 },
    easeType: "easeOutQuad",
  },
};
