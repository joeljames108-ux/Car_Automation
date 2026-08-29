import * as THREE from "three";

export interface SpokeConfig { count: number; width: number; depth: number; profile: "flat" | "tapered" | "turbine" | "Y-spoke"; concavity: number; }

function createSpoke(config: SpokeConfig, index: number, hubRadius: number, rimRadius: number): THREE.Mesh {
  const angle = (index / config.count) * Math.PI * 2;
  const length = rimRadius - hubRadius;
  const geo = new THREE.BoxGeometry(config.width, config.depth, length);
  const mat = new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.15 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * (hubRadius + length / 2), 0, Math.sin(angle) * (hubRadius + length / 2));
  mesh.rotation.y = -angle;
  return mesh;
}

function createTireTread(outerR: number, width: number): THREE.Mesh {
  const geo = new THREE.TorusGeometry(outerR, width * 0.3, 16, 48);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85, metalness: 0.0 });
  const tread = new THREE.Mesh(geo, mat);
  // Add tread pattern grooves
  for (let i = 0; i < 20; i++) {
    const gAngle = (i / 20) * Math.PI * 2;
    const groove = new THREE.Mesh(
      new THREE.BoxGeometry(0.002, width * 0.35, outerR * 0.02),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 })
    );
    groove.position.set(Math.cos(gAngle) * outerR, 0, Math.sin(gAngle) * outerR);
    groove.rotation.y = gAngle;
    tread.add(groove);
  }
  return tread;
}

function createBrakeDisc(radius: number): THREE.Group {
  const grp = new THREE.Group();
  // Main disc
  const discGeo = new THREE.CylinderGeometry(radius, radius, 0.01, 32);
  const discMat = new THREE.MeshPhysicalMaterial({ color: 0x666666, metalness: 0.85, roughness: 0.25 });
  const disc = new THREE.Mesh(discGeo, discMat);
  grp.add(disc);
  // Cross-drilled holes
  for (let r = 0; r < 4; r++) {
    for (let a = 0; a < 16; a++) {
      const angle = (a / 16) * Math.PI * 2 + r * 0.1;
      const dist = radius * (0.4 + r * 0.15);
      const hole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.002, 0.002, 0.012, 6),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      hole.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      grp.add(hole);
    }
  }
  // Hub center
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.2, radius * 0.2, 0.02, 16),
    new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 })
  );
  grp.add(hub);
  return grp;
}

function createCaliper(radius: number): THREE.Group {
  const grp = new THREE.Group();
  // Main caliper body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.03, radius * 0.5),
    new THREE.MeshPhysicalMaterial({ color: 0xff2200, metalness: 0.6, roughness: 0.3 })
  );
  grp.add(body);
  // Pistons
  for (let i = 0; i < 4; i++) {
    const piston = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.01, 8),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 })
    );
    piston.position.set(0, 0, (i - 1.5) * radius * 0.12);
    grp.add(piston);
  }
  // Brand text placeholder
  const label = new THREE.Mesh(
    new THREE.BoxGeometry(0.001, 0.015, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3 })
  );
  label.position.set(0.021, 0, 0);
  grp.add(label);
  return grp;
}

function createLugNuts(count: number, radius: number): THREE.Group {
  const grp = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const nut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.008, 6),
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.1 })
    );
    nut.position.set(Math.cos(angle) * radius * 0.15, 0, Math.sin(angle) * radius * 0.15);
    grp.add(nut);
  }
  return grp;
}

export class WheelDetailSystem {
  private defaultSpokeConfig: SpokeConfig = {
    count: 10, width: 0.015, depth: 0.008, profile: "tapered", concavity: 0.3,
  };

  buildSpokes(group: THREE.Group, cfg?: Partial<SpokeConfig>): void {
    const c = { ...this.defaultSpokeConfig, ...cfg };
    const hubR = 0.05, rimR = 0.22;
    for (let i = 0; i < c.count; i++) {
      const spoke = createSpoke(c, i, hubR, rimR);
      group.add(spoke);
    }
    // Rim barrel
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(rimR, 0.01, 8, 32),
      new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.08 })
    );
    rim.rotation.x = Math.PI / 2;
    group.add(rim);
  }

  buildTireTread(group: THREE.Group): void {
    group.add(createTireTread(0.25, 0.12));
  }

  buildBrakeDisc(group: THREE.Group): void {
    group.add(createBrakeDisc(0.2));
  }

  buildCaliper(group: THREE.Group): void {
    const cal = createCaliper(0.2);
    cal.position.set(0, 0, 0.2);
    group.add(cal);
  }

  buildLugNuts(group: THREE.Group): void {
    group.add(createLugNuts(5, 0.22));
  }

  buildValveStem(group: THREE.Group): void {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.002, 0.03, 6),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 })
    );
    stem.position.set(0.23, 0, 0);
    group.add(stem);
  }

  buildAll(group: THREE.Group): void {
    this.buildSpokes(group); this.buildTireTread(group);
    this.buildBrakeDisc(group); this.buildCaliper(group);
    this.buildLugNuts(group); this.buildValveStem(group);
  }
}
