/**
 * ============================================================================
 * 3D AERODYNAMIC STREAMLINE & WIND TUNNEL PARTICLE SYSTEM
 * ============================================================================
 * Interactive WebGL particle simulation visualizing airflow streamlines,
 * laminar stagnation zones, underbody ground-effect venturi channels,
 * and high-downforce vortex shedding behind the rear wing.
 */

import * as THREE from "three";
import { AeroSubsystemState } from "../../sim/masterVehicleState/masterVehicleTypes";

export class AeroStreamlineParticleSystem {
  private particleGroup: THREE.Group;
  private pointsMesh: THREE.Points;
  private particleCount: number = 1800;
  private positions: Float32Array;
  private velocities: Float32Array;
  private colors: Float32Array;
  private initialSeeds: Float32Array;

  constructor() {
    this.particleGroup = new THREE.Group();
    this.particleGroup.name = "AeroStreamlines";

    this.positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    this.colors = new Float32Array(this.particleCount * 3);
    this.initialSeeds = new Float32Array(this.particleCount * 3);

    const geo = new THREE.BufferGeometry();
    this.initializeParticles();

    geo.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.pointsMesh = new THREE.Points(geo, mat);
    this.particleGroup.add(this.pointsMesh);
  }

  public getParticleGroup(): THREE.Group {
    return this.particleGroup;
  }

  public setVisible(visible: boolean): void {
    this.particleGroup.visible = visible;
  }

  /**
   * Initializes particles in an aerodynamic wind-tunnel grid ahead of the vehicle.
   */
  private initializeParticles(): void {
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      // Spawn ahead of vehicle (Z = -3.2m to -2.0m)
      const x = (Math.random() - 0.5) * 1.8;
      const y = Math.random() * 1.2 + 0.05;
      const z = -3.5 + Math.random() * 1.2;

      this.positions[idx] = x;
      this.positions[idx + 1] = y;
      this.positions[idx + 2] = z;

      this.initialSeeds[idx] = x;
      this.initialSeeds[idx + 1] = y;
      this.initialSeeds[idx + 2] = z;

      // Base airspeed (45 m/s ≈ 160 km/h)
      this.velocities[idx] = 0;
      this.velocities[idx + 1] = 0;
      this.velocities[idx + 2] = 0.08 + Math.random() * 0.04;

      // Default Cyan flow color
      this.colors[idx] = 0.1;
      this.colors[idx + 1] = 0.85;
      this.colors[idx + 2] = 0.95;
    }
  }

  /**
   * Updates particle positions along vehicle aerodynamic flow field each animation frame.
   */
  public update(deltaSec: number, aero: AeroSubsystemState): void {
    const posAttr = this.pointsMesh.geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = this.pointsMesh.geometry.attributes.color as THREE.BufferAttribute;

    const wingAngleFactor = (aero.rearWingAngleDeg || 12) / 20;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;

      let x = this.positions[idx];
      let y = this.positions[idx + 1];
      let z = this.positions[idx + 2];
      const vz = this.velocities[idx + 2];

      z += vz;

      // Flow deflection around front hood & windshield
      if (z > -1.8 && z < -0.3 && Math.abs(x) < 0.85) {
        if (y < 0.65) {
          y += 0.015; // Deflect up over hood
          // Turn yellow/orange in stagnation compression zone
          this.colors[idx] = 0.95;
          this.colors[idx + 1] = 0.65;
          this.colors[idx + 2] = 0.1;
        }
      }

      // Windshield & roof curve
      if (z >= -0.3 && z < 0.6 && Math.abs(x) < 0.75) {
        if (y < 0.95) {
          y += 0.012;
          // High speed over roof -> electric cyan
          this.colors[idx] = 0.05;
          this.colors[idx + 1] = 0.95;
          this.colors[idx + 2] = 1.0;
        }
      }

      // Downwash and wake over rear decklid & wing
      if (z >= 1.2 && z <= 2.4 && Math.abs(x) < 0.9) {
        if (y > 0.6) {
          y -= 0.018 * wingAngleFactor; // Strong downwash from rear wing
          // Downforce vortex -> magenta/purple
          this.colors[idx] = 0.85;
          this.colors[idx + 1] = 0.15;
          this.colors[idx + 2] = 0.95;
        }
      }

      // Reset particle if it leaves the wind tunnel bounding box
      if (z > 3.8) {
        x = this.initialSeeds[idx] + (Math.random() - 0.5) * 0.2;
        y = this.initialSeeds[idx + 1];
        z = -3.5;
        this.colors[idx] = 0.1;
        this.colors[idx + 1] = 0.85;
        this.colors[idx + 2] = 0.95;
      }

      this.positions[idx] = x;
      this.positions[idx + 1] = y;
      this.positions[idx + 2] = z;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }

  /**
   * Frees WebGL particle geometry buffers and points material.
   */
  public dispose(): void {
    if (this.pointsMesh) {
      if (this.pointsMesh.geometry) {
        this.pointsMesh.geometry.dispose();
      }
      if (this.pointsMesh.material) {
        if (Array.isArray(this.pointsMesh.material)) {
          this.pointsMesh.material.forEach((m) => m.dispose());
        } else {
          this.pointsMesh.material.dispose();
        }
      }
      this.particleGroup.remove(this.pointsMesh);
    }
  }
}
