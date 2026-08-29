import * as THREE from "three";

export class AdvancedAnimatedEffects {
  private animations: Array<{ update: (time: number) => void }> = [];

  addCoolingFan(g: THREE.Group, position: THREE.Vector3): void {
    const group = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.001, 0.008), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.3 }));
      blade.rotation.y = (i / 5) * Math.PI * 2;
      group.add(blade);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.005, 8), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    group.add(hub);
    group.position.copy(position);
    g.add(group);
    this.animations.push({ update: (t) => { group.rotation.z = t * 8; } });
  }

  addAmbientLightStrip(g: THREE.Group, points: THREE.Vector3[], color: number): void {
    const curve = new THREE.CatmullRomCurve3(points);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.003, 6, false), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8 }));
    g.add(tube);
    this.animations.push({ update: (t) => { (tube.material as any).emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.3; } });
  }

  addPulsingGlow(g: THREE.Group, mesh: THREE.Mesh, color: number, speed: number = 1): void {
    const glowMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, transparent: true, opacity: 0.8 });
    const glow = new THREE.Mesh(mesh.geometry.clone(), glowMat);
    glow.scale.multiplyScalar(1.05);
    mesh.add(glow);
    this.animations.push({ update: (t) => { glowMat.emissiveIntensity = 0.3 + Math.sin(t * speed) * 0.3; } });
  }

  addRotatingBadge(g: THREE.Group, position: THREE.Vector3): void {
    const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.003, 16), new THREE.MeshPhysicalMaterial({ color: 0xffcc00, metalness: 0.9, roughness: 0.1 }));
    badge.position.copy(position);
    g.add(badge);
    this.animations.push({ update: (t) => { badge.rotation.y = t * 0.5; } });
  }

  addBreathingDashboard(g: THREE.Group, screenMesh: THREE.Mesh): void {
    const mat = screenMesh.material as THREE.MeshStandardMaterial;
    this.animations.push({ update: (t) => { mat.emissiveIntensity = 0.3 + Math.sin(t * 1.5) * 0.2; } });
  }

  addExhaustHeatHaze(g: THREE.Group, position: THREE.Vector3): void {
    const haze = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.08), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.05, side: THREE.DoubleSide }));
    haze.position.copy(position);
    g.add(haze);
    this.animations.push({ update: (t) => { haze.position.y = position.y + Math.sin(t * 3) * 0.01; haze.material.opacity = 0.03 + Math.sin(t * 2) * 0.02; } });
  }

  update(time: number): void { this.animations.forEach(a => a.update(time)); }
  getAnimationCount(): number { return this.animations.length; }
  clear(): void { this.animations = []; }
}
