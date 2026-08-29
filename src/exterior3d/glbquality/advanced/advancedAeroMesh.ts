import * as THREE from "three";

export class AdvancedAeroMesh {
  buildFrontSplitter(g: THREE.Group, width: number = 1.8, depth: number = 0.15): void {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(-width / 2 + 0.05, depth);
    shape.lineTo(width / 2 - 0.05, depth);
    shape.lineTo(width / 2, 0);
    shape.lineTo(-width / 2, 0);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2 });
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.4, roughness: 0.3, clearcoat: 0.8 });
    const splitter = new THREE.Mesh(geo, mat);
    splitter.rotation.x = -Math.PI / 2;
    g.add(splitter);
    for (let i = 0; i < 6; i++) {
      const canard = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.003, 0.06), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 }));
      canard.position.set(-width / 2 + 0.1 + i * 0.08, 0.003, depth / 2);
      g.add(canard);
    }
  }

  buildRearDiffuser(g: THREE.Group, width: number = 0.8, depth: number = 0.2): void {
    for (let i = 0; i < 7; i++) {
      const vane = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.06, depth), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 }));
      vane.position.set((i - 3) * (width / 7), 0.03, 0);
      g.add(vane);
    }
    for (const side of [-1, 1]) {
      const fence = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.08, depth), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 }));
      fence.position.set(side * width / 2, 0.04, 0);
      g.add(fence);
    }
  }

  buildRearWing(g: THREE.Group, width: number = 1.2, chord: number = 0.08): void {
    const geo = new THREE.BoxGeometry(width, 0.006, chord);
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.4, roughness: 0.3, clearcoat: 0.8 });
    g.add(new THREE.Mesh(geo, mat));
    const flapGeo = new THREE.BoxGeometry(width * 0.9, 0.004, chord * 0.5);
    const flap = new THREE.Mesh(flapGeo, mat);
    flap.position.set(0, -0.015, -chord * 0.3);
    g.add(flap);
    for (const side of [-1, 1]) {
      const endplate = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.06, chord * 1.2), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 }));
      endplate.position.set(side * width / 2, -0.01, 0);
      g.add(endplate);
    }
    for (const side of [-1, 1]) {
      const support = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.15, 6), new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.6, roughness: 0.3 }));
      support.position.set(side * width / 3, -0.08, 0);
      g.add(support);
    }
  }

  buildVortexGenerators(g: THREE.Group, count: number = 8, width: number = 1.0): void {
    for (let i = 0; i < count; i++) {
      const vg = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.015, 3), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }));
      vg.position.set((i - count / 2 + 0.5) * (width / count), 0.008, 0);
      g.add(vg);
    }
  }
}
