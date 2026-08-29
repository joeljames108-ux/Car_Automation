import * as THREE from "three";

export interface FrameRailConfig { length: number; height: number; width: number; crossSection: "C" | "box" | "tubular"; gauge: number; material: "steel" | "aluminum" | "carbon"; }

function createFrameRails(cfg: Partial<FrameRailConfig>): THREE.Group {
  const grp = new THREE.Group();
  const l = cfg.length || 2.0, h = cfg.height || 0.08, w = cfg.width || 0.06;
  const matColor = cfg.material === "aluminum" ? 0xaaaaaa : cfg.material === "carbon" ? 0x333333 : 0x555555;
  const railMat = new THREE.MeshPhysicalMaterial({ color: matColor, metalness: 0.6, roughness: 0.35 });
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), railMat);
    rail.position.set(0, 0, 0);
    rail.position.x = side * 0.35;
    grp.add(rail);
    // C-channel cutouts along the rail
    for (let i = 0; i < 6; i++) {
      const cut = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.4, h * 0.3, l * 0.02),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      cut.position.set(side * 0.35, 0, (i - 2.5) * l * 0.16);
      grp.add(cut);
    }
  }
  return grp;
}

function createCrossMembers(): THREE.Group {
  const grp = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({ color: 0x555555, metalness: 0.5, roughness: 0.4 });
  for (let i = 0; i < 8; i++) {
    const member = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.02), mat);
    member.position.set(0, -0.02, (i - 3.5) * 0.25);
    grp.add(member);
  }
  // Diagonal braces
  for (let i = 0; i < 4; i++) {
    const brace = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.02, 0.35),
      new THREE.MeshPhysicalMaterial({ color: 0x444444, metalness: 0.5, roughness: 0.4 })
    );
    brace.rotation.y = 0.3 * (i % 2 === 0 ? 1 : -1);
    brace.position.set(0, -0.02, (i - 1.5) * 0.5);
    grp.add(brace);
  }
  return grp;
}

function createFloorPan(): THREE.Group {
  const grp = new THREE.Group();
  // Main floor plate
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.005, 2.0),
    new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.4, roughness: 0.5 })
  );
  floor.position.y = -0.04;
  grp.add(floor);
  // Stiffening ribs
  for (let i = 0; i < 10; i++) {
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.015, 0.003),
      new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.5 })
    );
    rib.position.set(0, -0.038, (i - 4.5) * 0.2);
    grp.add(rib);
  }
  return grp;
}

function createFirewall(): THREE.Group {
  const grp = new THREE.Group();
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.25, 0.008),
    new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.3, roughness: 0.6 })
  );
  wall.position.set(0, 0.05, -0.95);
  grp.add(wall);
  // Pass-through grommets
  for (const x of [-0.15, 0, 0.15]) {
    const grom = new THREE.Mesh(
      new THREE.TorusGeometry(0.015, 0.003, 8, 12),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 })
    );
    grom.position.set(x, 0.05, -0.94);
    grp.add(grom);
  }
  return grp;
}

export class ChassisDetailSystem {
  buildFrameRails(group: THREE.Group, cfg?: Partial<FrameRailConfig>): void {
    group.add(createFrameRails(cfg || {}));
  }
  buildCrossMembers(group: THREE.Group): void { group.add(createCrossMembers()); }
  buildFloorPan(group: THREE.Group): void { group.add(createFloorPan()); }
  buildFirewall(group: THREE.Group): void { group.add(createFirewall()); }
  buildAll(group: THREE.Group): void {
    this.buildFrameRails(group); this.buildCrossMembers(group);
    this.buildFloorPan(group); this.buildFirewall(group);
  }
}
