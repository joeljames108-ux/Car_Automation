import * as THREE from "three";

export interface MufflerConfig { length: number; diameter: number; chambers: number; perforatedTube: boolean; material: "aluminized" | "stainless" | "titanium"; }

function createHeaderPipes(): THREE.Group {
  const grp = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const pts = [
      new THREE.Vector3((i - 2.5) * 0.04, 0, -0.2),
      new THREE.Vector3((i - 2.5) * 0.03, -0.05, -0.15),
      new THREE.Vector3((i - 2.5) * 0.02, -0.1, -0.08),
      new THREE.Vector3(0, -0.12, 0),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 16, 0.008, 8, false),
      new THREE.MeshPhysicalMaterial({ color: 0x884422, metalness: 0.8, roughness: 0.35 })
    );
    grp.add(tube);
  }
  // Merge collector
  const collector = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.015, 0.08, 8),
    new THREE.MeshPhysicalMaterial({ color: 0x773311, metalness: 0.75, roughness: 0.4 })
  );
  collector.position.set(0, -0.12, 0.04);
  grp.add(collector);
  return grp;
}

function createMuffler(cfg: Partial<MufflerConfig>): THREE.Group {
  const l = cfg.length || 0.3, d = cfg.diameter || 0.08;
  const grp = new THREE.Group();
  // Outer shell
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(d/2, d/2, l, 16),
    new THREE.MeshPhysicalMaterial({ color: 0x999999, metalness: 0.85, roughness: 0.2 })
  );
  shell.rotation.x = Math.PI / 2;
  grp.add(shell);
  // Inlet/outlet pipes
  for (const z of [-l/2, l/2]) {
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(d*0.25, d*0.25, 0.05, 8),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.3 })
    );
    pipe.rotation.x = Math.PI / 2;
    pipe.position.z = z > 0 ? z + 0.025 : z - 0.025;
    grp.add(pipe);
  }
  // Internal perforated tube (visible through cutaway)
  if (cfg.perforatedTube !== false) {
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(d*0.12, d*0.12, l*0.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x666666, wireframe: true })
    );
    inner.rotation.x = Math.PI / 2;
    grp.add(inner);
  }
  return grp;
}

function createExhaustTips(): THREE.Group {
  const grp = new THREE.Group();
  for (const x of [-0.04, 0.04]) {
    // Outer tip
    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.022, 0.04, 12),
      new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.05 })
    );
    tip.rotation.x = Math.PI / 2;
    tip.position.set(x, 0, 0);
    grp.add(tip);
    // Inner dark
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.017, 0.03, 12),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
    );
    inner.rotation.x = Math.PI / 2;
    inner.position.set(x, 0, 0.005);
    grp.add(inner);
  }
  return grp;
}

function createCatalyticConverter(): THREE.Group {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12),
    new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.7, roughness: 0.4 })
  );
  body.rotation.x = Math.PI / 2;
  grp.add(body);
  // Heat shield
  const shield = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.1, 12, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.6, roughness: 0.5, side: THREE.DoubleSide })
  );
  shield.rotation.x = Math.PI / 2;
  grp.add(shield);
  return grp;
}

export class ExhaustDetailSystem {
  buildHeaders(group: THREE.Group): void { group.add(createHeaderPipes()); }
  buildMuffler(group: THREE.Group, cfg?: Partial<MufflerConfig>): void { group.add(createMuffler(cfg || {})); }
  buildTips(group: THREE.Group): void { group.add(createExhaustTips()); }
  buildCat(group: THREE.Group): void { group.add(createCatalyticConverter()); }
  buildAll(group: THREE.Group): void {
    this.buildHeaders(group); this.buildMuffler(group);
    this.buildTips(group); this.buildCat(group);
  }
}
