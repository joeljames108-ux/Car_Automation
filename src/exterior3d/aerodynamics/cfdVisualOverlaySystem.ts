// ============================================================================
// PHASE 120: CFD VISUAL OVERLAY SYSTEM & STREAMLINE PARTICLE ENGINE
// ============================================================================
// Dynamic Three.js overlays including 3D force vectors (with live Newton labels),
// velocity-coded particle streamlines, wake vortex ribbons, and pressure gradients.
// ============================================================================

import * as THREE from 'three';
import type { AeroSurrogatePhysicsResult } from '../../sim/aerodynamics/aeroStudioTypes';

export class CFDVisualOverlaySystem {
  /**
   * Generates dynamic 3D force vectors (arrows) scaled to generated downforce & drag Newtons.
   */
  public static buildForceVectors3D(physics: AeroSurrogatePhysicsResult): THREE.Group {
    const group = new THREE.Group();
    group.name = 'CFD_Force_Vectors_Group';

    const maxArrowLength = 1.4;
    const forceScale = maxArrowLength / Math.max(1, physics.totalDownforceN || 2500);

    // 1. Front Downforce Vector (Pointing DOWN at front axle: X = 0, Y = 0.5, Z = -1.4)
    const frontLength = Math.max(0.2, physics.frontDownforceN * forceScale);
    const frontDir = new THREE.Vector3(0, -1, 0);
    const frontOrigin = new THREE.Vector3(0, 0.6 + frontLength, -1.4);
    const frontArrow = new THREE.ArrowHelper(frontDir, frontOrigin, frontLength, 0x00f0ff, 0.14, 0.08);
    group.add(frontArrow);

    // 2. Rear Downforce Vector (Pointing DOWN at rear axle: X = 0, Y = 0.5, Z = +1.4)
    const rearLength = Math.max(0.2, physics.rearDownforceN * forceScale);
    const rearDir = new THREE.Vector3(0, -1, 0);
    const rearOrigin = new THREE.Vector3(0, 0.6 + rearLength, 1.4);
    const rearArrow = new THREE.ArrowHelper(rearDir, rearOrigin, rearLength, 0xec4899, 0.14, 0.08);
    group.add(rearArrow);

    // 3. Total Drag Vector (Pointing FORWARD/AFT opposing motion at Center of Pressure)
    const dragScale = maxArrowLength / Math.max(1, physics.totalDragN || 1200);
    const dragLength = Math.max(0.25, physics.totalDragN * dragScale * 0.7);
    const dragDir = new THREE.Vector3(0, 0, 1); // Opposing relative flow
    const dragOrigin = new THREE.Vector3(0, 0.65, physics.centerOfPressureXM);
    const dragArrow = new THREE.ArrowHelper(dragDir, dragOrigin, dragLength, 0xf59e0b, 0.14, 0.08);
    group.add(dragArrow);

    // 4. Center of Pressure Indicator Sphere
    const copGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const copMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true });
    const copMesh = new THREE.Mesh(copGeo, copMat);
    copMesh.position.set(0, 0.65, physics.centerOfPressureXM);
    group.add(copMesh);

    return group;
  }

  /**
   * Generates dynamic particle cloud streamlines flowing around the vehicle.
   */
  public static buildStreamlinesParticleSystem(
    particleCount: number = 800
  ): { points: THREE.Points; updateParticles: (airspeedKmh: number, delta: number) => void } {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    const cyanColor = new THREE.Color(0x00f0ff);
    const yellowColor = new THREE.Color(0xfacc15);
    const redColor = new THREE.Color(0xef4444);

    for (let i = 0; i < particleCount; i++) {
      // Seed positions across inlet box in front of vehicle
      const seedX = (Math.random() - 0.5) * 2.6;
      const seedY = 0.05 + Math.random() * 1.35;
      const seedZ = -3.8 + Math.random() * 8.0;

      positions[i * 3 + 0] = seedX;
      positions[i * 3 + 1] = seedY;
      positions[i * 3 + 2] = seedZ;

      // Base velocity
      velocities[i] = 0.8 + Math.random() * 0.4;

      // Color coding (cyan laminar at front -> yellow/red accelerated/wake at rear)
      const t = Math.max(0, Math.min(1, (seedZ + 3.8) / 7.5));
      const col = t < 0.5 ? cyanColor.clone().lerp(yellowColor, t * 2) : yellowColor.clone().lerp(redColor, (t - 0.5) * 2);

      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, material);
    points.name = 'CFD_Streamline_Points';

    const updateParticles = (airspeedKmh: number, delta: number) => {
      const speedFactor = (airspeedKmh / 200) * 12.0 * delta;
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        // Move particle along +Z (airflow over car moving forward)
        array[i * 3 + 2] += velocities[i] * speedFactor;

        // Flow deflection over hood, roof, and diffuser
        const z = array[i * 3 + 2];
        const x = array[i * 3 + 0];

        if (z > -2.2 && z < 1.5 && Math.abs(x) < 0.9) {
          // Flow rises over nose and cabin
          if (z < -0.5 && array[i * 3 + 1] < 0.65) {
            array[i * 3 + 1] += 0.015 * speedFactor;
          } else if (z >= -0.5 && z < 1.2 && array[i * 3 + 1] < 1.05) {
            array[i * 3 + 1] += 0.02 * speedFactor;
          }
        }

        // Reset particle if past rear wake
        if (array[i * 3 + 2] > 4.2) {
          array[i * 3 + 0] = (Math.random() - 0.5) * 2.6;
          array[i * 3 + 1] = 0.05 + Math.random() * 1.35;
          array[i * 3 + 2] = -3.8;
        }
      }

      posAttr.needsUpdate = true;
    };

    return { points, updateParticles };
  }

  /**
   * Generates helical trailing wake vortex line ribbons behind rear wing tips.
   */
  public static buildWakeVortexRibbons(spanM: number, heightM: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'CFD_Wake_Vortex_Ribbons';

    const buildVortexCurve = (isLeft: boolean): THREE.Line => {
      const sign = isLeft ? -1 : 1;
      const points: THREE.Vector3[] = [];
      const numSteps = 40;
      const startX = sign * (spanM / 2);
      const startY = heightM + 0.02;
      const startZ = 2.1;

      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        const radius = 0.04 + t * 0.18; // Expanding vortex core
        const angle = t * Math.PI * 8.0;
        const z = startZ + t * 2.5;
        const x = startX + sign * Math.cos(angle) * radius - sign * t * 0.15;
        const y = startY + Math.sin(angle) * radius;
        points.push(new THREE.Vector3(x, y, z));
      }

      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.65,
      });
      return new THREE.Line(curveGeo, curveMat);
    };

    group.add(buildVortexCurve(true));
    group.add(buildVortexCurve(false));

    return group;
  }
}
