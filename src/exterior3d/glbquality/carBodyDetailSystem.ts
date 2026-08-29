import * as THREE from "three";

export interface SurfaceCurveConfig { tension: number; segments: number; closed: boolean; normalDirection: "inward" | "outward"; }

function createPanelGap(length: number, width: number, depth: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(width, depth, length);
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }));
}

function createSurfaceReflectionPlane(w: number, h: number, segments: number): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(w, h, segments, segments);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, Math.sin(x * 3) * 0.005 + Math.cos(y * 2) * 0.003);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0.6, roughness: 0.2, clearcoat: 1.0,
    clearcoatRoughness: 0.1, envMapIntensity: 2.0, side: THREE.DoubleSide,
  }));
}

function createCharacterLine(pts: THREE.Vector3[], thickness: number): THREE.Group {
  const grp = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.15, metalness: 0.8 });
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const len = a.distanceTo(b);
    const geo = new THREE.CylinderGeometry(thickness * 0.5, thickness * 0.5, len, 6);
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(b, a).normalize();
    geo.translate(0, len / 2, 0);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    grp.add(mesh);
  }
  return grp;
}

function createCharacterLineSet(side: number, length: number, height: number): THREE.Group {
  const grp = new THREE.Group();
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    pts.push(new THREE.Vector3((t - 0.5) * length, height + Math.sin(t * Math.PI) * 0.02, side * (0.8 + Math.cos(t * Math.PI * 2) * 0.05)));
  }
  grp.add(createCharacterLine(pts, 0.004));
  return grp;
}

function createDoorPanelDetail(length: number, height: number, side: number): THREE.Group {
  const grp = new THREE.Group();
  grp.add(createPanelGap(length * 0.9, 0.003, height * 0.9));
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.08, 8),
    new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.1, metalness: 0.9 }));
  handle.rotation.x = Math.PI / 2;
  handle.position.set(0.1, height * 0.5, side * 0.84);
  grp.add(handle);
  return grp;
}

function createHoodSurface(width: number, length: number): THREE.Group {
  const grp = new THREE.Group();
  const geo = new THREE.PlaneGeometry(width, length, 12, 12);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, -Math.pow(x / (width / 2), 2) * 0.03 - Math.cos(y / length * Math.PI) * 0.01);
  }
  geo.computeVertexNormals();
  const hood = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.2, clearcoat: 0.8 }));
  hood.rotation.x = -Math.PI / 2;
  grp.add(hood);
  return grp;
}

export class CarBodyDetailSystem {
  buildSurfaceCurves(group: THREE.Group, _cfg?: Partial<SurfaceCurveConfig>): void {
    group.add(createSurfaceReflectionPlane(4.5, 2.0, 20));
  }
  buildPanelGaps(group: THREE.Group): void {
    const positions: Array<[number, number, number, number, number]> = [
      [1.2, 0.003, 0.6, 0.04, 0], [-1.2, 0.003, 0.6, 0.04, 0], [0, 0.003, 0.4, 0.03, Math.PI / 2],
    ];
    for (const [x, w, l, d, ry] of positions) {
      const gap = createPanelGap(l, w, d);
      gap.position.set(x, 0.2, 0);
      gap.rotation.y = ry;
      group.add(gap);
    }
  }
  buildCharacterLines(group: THREE.Group): void {
    group.add(createCharacterLineSet(1, 4.0, 0.3));
    group.add(createCharacterLineSet(-1, 4.0, 0.3));
  }
  buildSurfaceReflections(group: THREE.Group): void { group.add(createSurfaceReflectionPlane(4.2, 1.8, 16)); }
  buildDoorPanels(group: THREE.Group): void {
    group.add(createDoorPanelDetail(0.8, 0.4, 1));
    group.add(createDoorPanelDetail(0.8, 0.4, -1));
  }
  buildHoodSurface(group: THREE.Group): void {
    const hood = createHoodSurface(1.6, 1.0);
    hood.position.set(0, 0.45, -0.8);
    group.add(hood);
  }
  buildTrunkSurface(group: THREE.Group): void {
    const trunk = createHoodSurface(1.4, 0.8);
    trunk.position.set(0, 0.43, 1.0);
    group.add(trunk);
  }
  buildRoofDetail(group: THREE.Group): void {
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0, 8, 8),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.6, roughness: 0.15, clearcoat: 1.0 }));
    roof.rotation.x = -Math.PI / 2;
    roof.position.set(0, 0.55, 0);
    group.add(roof);
  }
  buildAeroDetails(group: THREE.Group): void {
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.008, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.4 }));
    splitter.position.set(0, 0.06, -1.8); group.add(splitter);
    for (let i = 0; i < 5; i++) {
      const vane = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.06, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 }));
      vane.position.set((i - 2) * 0.12, 0.05, 1.7); group.add(vane);
    }
  }
  buildAll(group: THREE.Group): void {
    this.buildSurfaceCurves(group); this.buildPanelGaps(group);
    this.buildCharacterLines(group); this.buildSurfaceReflections(group);
    this.buildDoorPanels(group); this.buildHoodSurface(group);
    this.buildTrunkSurface(group); this.buildRoofDetail(group);
    this.buildAeroDetails(group);
  }
}
