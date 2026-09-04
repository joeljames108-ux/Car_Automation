// ============================================================================
// ANIMATED FLOW STREAMLINE & PARTICLE SYSTEM
// ============================================================================
// High-performance procedural flow visualization for /anatomy mode:
// - Coolant Loop (Cyan pulse through engine jackets & radiator)
// - Lubricating Oil Circuit (Golden amber flow from dry sump to bearings)
// - Charge Air Intake Stream (Sky blue high-velocity vortex to plenum)
// - Direct Fuel Injection (Lime green high-pressure pulses)
// - Exhaust Gas Flow (Crimson/orange high-temp exhaust pulses)
// - Mechanical Power Transfer (Electric magenta torque vectors)
// ============================================================================

import * as THREE from 'three';
import { FlowPathDefinition, FlowPathType } from './multimodeCapabilities';

export interface ActiveFlowConfig {
  coolant: boolean;
  oil: boolean;
  air: boolean;
  fuel: boolean;
  exhaust: boolean;
  power: boolean;
}

export class FlowVisualizationSystem {
  private group: THREE.Group;
  private flowMeshes: {
    definition: FlowPathDefinition;
    tubeMesh: THREE.Mesh;
    particleMesh: THREE.Points;
    curve: THREE.CatmullRomCurve3;
    offsets: Float32Array;
  }[] = [];
  private activeConfig: ActiveFlowConfig;
  private time: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'Flow_Visualization_System';
    this.activeConfig = {
      coolant: true,
      oil: true,
      air: true,
      fuel: true,
      exhaust: true,
      power: true,
    };
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  /**
   * Initializes or refreshes flow path curves from an array of definitions.
   */
  public buildFlowPaths(definitions: FlowPathDefinition[]): void {
    this.clear();

    for (const def of definitions) {
      if (def.points.length < 2) continue;

      const curvePoints = def.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const curve = new THREE.CatmullRomCurve3(curvePoints);

      // 1. Semi-translucent glowing guide tube
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.008, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: def.colorHex,
        transparent: true,
        opacity: 0.25,
        wireframe: false,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      this.group.add(tubeMesh);

      // 2. Animated Moving Flow Particles along the spline curve
      const particleCount = 48;
      const positions = new Float32Array(particleCount * 3);
      const offsets = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        offsets[i] = i / particleCount;
        const pt = curve.getPointAt(offsets[i]);
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Particle Material with additive glow blending
      const particleMat = new THREE.PointsMaterial({
        color: def.glowHex,
        size: 0.024,
        transparent: true,
        opacity: 0.90,
        blending: THREE.AdditiveBlending,
      });

      const particleMesh = new THREE.Points(particleGeo, particleMat);
      this.group.add(particleMesh);

      this.flowMeshes.push({
        definition: def,
        tubeMesh,
        particleMesh,
        curve,
        offsets,
      });
    }

    this.updateVisibility();
  }

  /**
   * Updates flow particle positions each frame.
   */
  public update(delta: number): void {
    this.time += delta;

    for (const item of this.flowMeshes) {
      if (!item.particleMesh.visible) continue;

      const posAttr = item.particleMesh.geometry.getAttribute('position') as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const speed = 0.45; // loop rate in seconds

      for (let i = 0; i < item.offsets.length; i++) {
        item.offsets[i] = (item.offsets[i] + delta * speed) % 1.0;
        const pt = item.curve.getPointAt(item.offsets[i]);
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }

      posAttr.needsUpdate = true;
    }
  }

  /**
   * Toggles active flow types on or off.
   */
  public setFlowConfig(config: Partial<ActiveFlowConfig>): void {
    this.activeConfig = { ...this.activeConfig, ...config };
    this.updateVisibility();
  }

  private updateVisibility(): void {
    for (const item of this.flowMeshes) {
      const type = item.definition.type;
      const isVisible = Boolean(this.activeConfig[type]);
      item.tubeMesh.visible = isVisible;
      item.particleMesh.visible = isVisible;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.group.visible = enabled;
  }

  public clear(): void {
    while (this.group.children.length > 0) {
      const obj = this.group.children[0];
      this.group.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }
    this.flowMeshes = [];
  }
}
