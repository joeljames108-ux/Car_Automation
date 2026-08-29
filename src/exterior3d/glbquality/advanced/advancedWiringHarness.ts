import * as THREE from "three";

export class AdvancedWiringHarness {
  buildMainHarness(g: THREE.Group): void {
    const paths = [
      [new THREE.Vector3(-0.3, 0.1, -0.4), new THREE.Vector3(-0.2, 0.12, -0.2), new THREE.Vector3(-0.1, 0.15, 0), new THREE.Vector3(0, 0.12, 0.2)],
      [new THREE.Vector3(0.3, 0.1, -0.4), new THREE.Vector3(0.2, 0.12, -0.2), new THREE.Vector3(0.1, 0.15, 0), new THREE.Vector3(0, 0.12, 0.2)],
      [new THREE.Vector3(-0.1, 0.15, -0.3), new THREE.Vector3(0, 0.18, -0.1), new THREE.Vector3(0.1, 0.15, 0.1)],
      [new THREE.Vector3(0, 0.2, -0.35), new THREE.Vector3(0, 0.22, -0.15), new THREE.Vector3(0, 0.2, 0.05)],
      [new THREE.Vector3(-0.25, 0.08, -0.1), new THREE.Vector3(-0.15, 0.1, 0.1), new THREE.Vector3(-0.05, 0.12, 0.3)],
      [new THREE.Vector3(0.25, 0.08, -0.1), new THREE.Vector3(0.15, 0.1, 0.1), new THREE.Vector3(0.05, 0.12, 0.3)],
    ];
    const colors = [0x111111, 0x222222, 0x882200, 0x003366, 0x333333, 0x444444];
    paths.forEach((pts, idx) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.002, 4, false), new THREE.MeshStandardMaterial({ color: colors[idx % colors.length], roughness: 0.7 }));
      g.add(tube);
    });
    for (let i = 0; i < 8; i++) {
      const clip = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.005, 0.003), new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6 }));
      clip.position.set((Math.random() - 0.5) * 0.4, 0.12 + Math.random() * 0.08, (Math.random() - 0.5) * 0.6);
      g.add(clip);
    }
  }

  buildIgnitionWires(g: THREE.Group, cylinderCount: number = 8): void {
    for (let i = 0; i < cylinderCount; i++) {
      const x = (i - cylinderCount / 2 + 0.5) * 0.04;
      const pts = [
        new THREE.Vector3(x, 0.15, -0.2),
        new THREE.Vector3(x * 0.8, 0.18, -0.1),
        new THREE.Vector3(x * 0.5, 0.2, 0),
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const colors = [0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800, 0x8800ff];
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.0015, 4, false), new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.6 }));
      g.add(tube);
    }
  }

  buildRelayBox(g: THREE.Group): void {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.05), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 }));
    g.add(box);
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const relay = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.015, 0.01), new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 }));
        relay.position.set(-0.015 + c * 0.015, 0.025, -0.01 + r * 0.02);
        g.add(relay);
      }
    }
  }
}
