import * as THREE from "three";

export class AdvancedBrakeSystem {
  buildCeramicDisc(g: THREE.Group, radius: number = 0.2): void {
    const discMat = new THREE.MeshPhysicalMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.25 });
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.008, 32), discMat);
    g.add(disc);
    for (let ring = 0; ring < 4; ring++) {
      for (let a = 0; a < 12; a++) {
        const angle = (a / 12) * Math.PI * 2 + ring * 0.15;
        const dist = radius * (0.4 + ring * 0.15);
        const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.01, 6), new THREE.MeshStandardMaterial({ color: 0x333333 }));
        hole.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        g.add(hole);
      }
    }
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const vane = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.005, 0.06), new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7 }));
      vane.position.set(Math.cos(a) * radius * 0.6, 0, Math.sin(a) * radius * 0.6);
      vane.rotation.y = a;
      g.add(vane);
    }
  }

  buildMonoblockCaliper(g: THREE.Group, color: number = 0xff2200): void {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.1), new THREE.MeshPhysicalMaterial({ color, metalness: 0.6, roughness: 0.3 }));
    body.position.set(0, 0, 0.15);
    g.add(body);
    for (let i = 0; i < 6; i++) {
      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.008, 8), new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 }));
      piston.position.set(0, 0, 0.15 + (i - 2.5) * 0.02);
      g.add(piston);
    }
    for (const z of [0.1, 0.2]) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.025, 0.07), new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.8 }));
      pad.position.set(0, 0, z);
      g.add(pad);
    }
    const bleed = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.01, 6), new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 0.9 }));
    bleed.position.set(0.02, 0.02, 0.15);
    g.add(bleed);
  }

  buildBrakeLine(g: THREE.Group, from: THREE.Vector3, to: THREE.Vector3): void {
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    mid.y += 0.02;
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.002, 4, false), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.3 }));
    g.add(tube);
  }
}
