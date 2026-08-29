import * as THREE from "three";

export interface GlassConfig { tint: THREE.Color; transmission: number; ior: number; thickness: number; rainRepellent: boolean; heatingElement: boolean; }

function createWindshield(cfg: Partial<GlassConfig>): THREE.Group {
  const grp = new THREE.Group();
  const geo = new THREE.PlaneGeometry(1.4, 0.5, 12, 6);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, -Math.pow(x / 0.7, 2) * 0.08 - y * 0.15);
  }
  geo.computeVertexNormals();
  const glass = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
    color: cfg.tint?.getHex() || 0xaaccff,
    transmission: cfg.transmission || 0.85,
    ior: cfg.ior || 1.52,
    thickness: cfg.thickness || 0.004,
    roughness: 0.05,
    metalness: 0.0,
    side: THREE.DoubleSide,
  }));
  glass.rotation.x = -Math.PI / 2 - 0.25;
  glass.position.set(0, 0.45, -0.55);
  grp.add(glass);
  // Windshield frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6, metalness: 0.3 });
  for (const x of [-0.7, 0.7]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.5, 0.015), frameMat);
    pillar.position.set(x, 0.42, -0.52);
    pillar.rotation.x = -0.25;
    grp.add(pillar);
  }
  return grp;
}

function createSideWindows(): THREE.Group {
  const grp = new THREE.Group();
  for (const side of [-1, 1]) {
    // Front side window
    const fGeo = new THREE.PlaneGeometry(0.4, 0.3, 6, 4);
    const fPos = fGeo.attributes.position;
    for (let i = 0; i < fPos.count; i++) {
      const y = fPos.getY(i);
      fPos.setZ(i, -y * 0.05);
    }
    fGeo.computeVertexNormals();
    const fWin = new THREE.Mesh(fGeo, new THREE.MeshPhysicalMaterial({
      color: 0xaaccff, transmission: 0.85, ior: 1.52, thickness: 0.004,
      roughness: 0.05, side: THREE.DoubleSide,
    }));
    fWin.rotation.x = -Math.PI / 2 - 0.1;
    fWin.rotation.z = side * 0.05;
    fWin.position.set(0, 0.4, side * 0.72);
    grp.add(fWin);
    // Rear side window
    const rGeo = new THREE.PlaneGeometry(0.3, 0.25, 6, 4);
    const rWin = new THREE.Mesh(rGeo, new THREE.MeshPhysicalMaterial({
      color: 0x88aacc, transmission: 0.75, ior: 1.52, thickness: 0.004,
      roughness: 0.08, side: THREE.DoubleSide,
    }));
    rWin.rotation.x = -Math.PI / 2 - 0.08;
    rWin.position.set(0.15, 0.38, side * 0.7);
    grp.add(rWin);
    // Window frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.55), frameMat);
    frame.position.set(0, 0.43, side * 0.71);
    grp.add(frame);
  }
  return grp;
}

function createRearWindow(): THREE.Group {
  const grp = new THREE.Group();
  const geo = new THREE.PlaneGeometry(1.2, 0.35, 8, 4);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, -Math.pow(x / 0.6, 2) * 0.05 + y * 0.1);
  }
  geo.computeVertexNormals();
  const glass = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
    color: 0x88aacc, transmission: 0.75, ior: 1.52, thickness: 0.004,
    roughness: 0.08, side: THREE.DoubleSide,
  }));
  glass.rotation.x = -Math.PI / 2 + 0.3;
  glass.position.set(0, 0.42, 0.6);
  grp.add(glass);
  return grp;
}

function createSunroof(): THREE.Group {
  const grp = new THREE.Group();
  const geo = new THREE.PlaneGeometry(0.6, 0.5, 6, 4);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, -Math.pow(x / 0.3, 2) * 0.01);
  }
  geo.computeVertexNormals();
  const glass = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
    color: 0x99bbdd, transmission: 0.8, ior: 1.52, thickness: 0.005,
    roughness: 0.03, side: THREE.DoubleSide,
  }));
  glass.rotation.x = -Math.PI / 2;
  glass.position.set(0, 0.555, -0.1);
  grp.add(glass);
  // Sunroof seal
  const seal = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.004, 6, 24),
    new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 })
  );
  seal.rotation.x = Math.PI / 2;
  seal.position.set(0, 0.553, -0.1);
  grp.add(seal);
  return grp;
}

export class WindowGlassDetailSystem {
  buildWindshield(group: THREE.Group, cfg?: Partial<GlassConfig>): void {
    group.add(createWindshield(cfg || {}));
  }
  buildSideWindows(group: THREE.Group): void { group.add(createSideWindows()); }
  buildRearWindow(group: THREE.Group): void { group.add(createRearWindow()); }
  buildSunroof(group: THREE.Group): void { group.add(createSunroof()); }
  buildAll(group: THREE.Group): void {
    this.buildWindshield(group); this.buildSideWindows(group);
    this.buildRearWindow(group); this.buildSunroof(group);
  }
}
