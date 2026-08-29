import * as THREE from "three";

export interface SpringConfig { coils: number; wireRadius: number; outerRadius: number; pitch: number; freeLength: number; color: THREE.Color; }

function createSpring(cfg: Partial<SpringConfig>): THREE.Group {
  const grp = new THREE.Group();
  const coils = cfg.coils || 8, wR = cfg.wireRadius || 0.003, oR = cfg.outerRadius || 0.02;
  const pitch = cfg.pitch || 0.008, fLen = cfg.freeLength || 0.12;
  const pts: THREE.Vector3[] = [];
  const segs = coils * 24;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const angle = t * coils * Math.PI * 2;
    pts.push(new THREE.Vector3(
      Math.cos(angle) * oR,
      t * fLen - fLen / 2,
      Math.sin(angle) * oR
    ));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, segs, wR, 6, false),
    new THREE.MeshPhysicalMaterial({
      color: cfg.color?.getHex() || 0x00aaff, metalness: 0.8, roughness: 0.2,
    })
  );
  grp.add(tube);
  return grp;
}

function createDamper(): THREE.Group {
  const grp = new THREE.Group();
  // Outer tube
  const outer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.1, 12),
    new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.3 })
  );
  grp.add(outer);
  // Inner rod (chrome)
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.06, 8),
    new THREE.MeshPhysicalMaterial({ color: 0xdddddd, metalness: 0.95, roughness: 0.03 })
  );
  rod.position.y = 0.08;
  grp.add(rod);
  // Top mount
  const mount = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.01, 8),
    new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 })
  );
  mount.position.y = 0.11;
  grp.add(mount);
  // Reservoir
  const res = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.05, 8),
    new THREE.MeshPhysicalMaterial({ color: 0xcc8800, metalness: 0.7, roughness: 0.25 })
  );
  res.position.set(0.018, -0.02, 0);
  grp.add(res);
  return grp;
}

function createControlArm(): THREE.Group {
  const grp = new THREE.Group();
  // A-arm shape
  const armGeo = new THREE.BoxGeometry(0.15, 0.008, 0.015);
  const armMat = new THREE.MeshPhysicalMaterial({ color: 0x555555, metalness: 0.6, roughness: 0.35 });
  const arm1 = new THREE.Mesh(armGeo, armMat);
  arm1.rotation.y = 0.3;
  arm1.position.set(0, 0, 0.02);
  grp.add(arm1);
  const arm2 = new THREE.Mesh(armGeo, armMat);
  arm2.rotation.y = -0.3;
  arm2.position.set(0, 0, -0.02);
  grp.add(arm2);
  // Ball joint
  const joint = new THREE.Mesh(
    new THREE.SphereGeometry(0.008, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.85, roughness: 0.1 })
  );
  joint.position.x = 0.075;
  grp.add(joint);
  // Bushings
  for (const z of [-0.02, 0.02]) {
    const bush = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.012, 8),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 })
    );
    bush.rotation.x = Math.PI / 2;
    bush.position.set(-0.07, 0, z);
    grp.add(bush);
  }
  return grp;
}

function createAntiRollBar(): THREE.Group {
  const grp = new THREE.Group();
  const pts = [
    new THREE.Vector3(-0.3, 0, 0),
    new THREE.Vector3(-0.15, 0.05, 0),
    new THREE.Vector3(0, 0.06, 0),
    new THREE.Vector3(0.15, 0.05, 0),
    new THREE.Vector3(0.3, 0, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  const bar = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 20, 0.005, 6, false),
    new THREE.MeshPhysicalMaterial({ color: 0x44aa44, metalness: 0.7, roughness: 0.3 })
  );
  grp.add(bar);
  return grp;
}

export class SuspensionDetailSystem {
  buildSpring(group: THREE.Group, cfg?: Partial<SpringConfig>): void {
    group.add(createSpring(cfg || {}));
  }
  buildDamper(group: THREE.Group): void { group.add(createDamper()); }
  buildControlArm(group: THREE.Group): void { group.add(createControlArm()); }
  buildAntiRollBar(group: THREE.Group): void { group.add(createAntiRollBar()); }
  buildAll(group: THREE.Group): void {
    this.buildSpring(group); this.buildDamper(group);
    this.buildControlArm(group); this.buildAntiRollBar(group);
  }
}
