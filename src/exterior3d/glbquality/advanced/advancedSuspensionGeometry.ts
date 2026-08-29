import * as THREE from "three";

export interface SuspensionConfig {
  type: "macpherson" | "double_wishbone" | "multi_link" | "pushrod";
  springRate: number;
  dampingRatio: number;
  rideHeight: number;
  camber: number;
  caster: number;
  toe: number;
}

export class AdvancedSuspensionGeometry {
  buildMacPherson(g: THREE.Group, config: SuspensionConfig): void {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.25, 8), new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.3 }));
    strut.position.y = config.rideHeight; g.add(strut);
    const springPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48, a = t * 6 * Math.PI * 2;
      springPts.push(new THREE.Vector3(Math.cos(a) * 0.02, config.rideHeight + t * 0.12 - 0.06, Math.sin(a) * 0.02));
    }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(springPts), 48, 0.003, 6, false), new THREE.MeshPhysicalMaterial({ color: 0x00aaff, metalness: 0.8, roughness: 0.2 })));
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.008, 0.015), new THREE.MeshPhysicalMaterial({ color: 0x555555, metalness: 0.6, roughness: 0.35 }));
    arm.position.set(0, config.rideHeight * 0.3, 0); g.add(arm);
  }

  buildDoubleWishbone(g: THREE.Group, config: SuspensionConfig): void {
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x555555, metalness: 0.6, roughness: 0.35 });
    for (const y of [0.02, 0.15]) {
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.008, 0.015), mat);
      upper.position.set(0, config.rideHeight * y / 0.15, 0); g.add(upper);
      const lower = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.008, 0.015), mat);
      lower.position.set(0, config.rideHeight * y / 0.15 - 0.08, 0); g.add(lower);
    }
    const upright = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.12, 0.02), mat);
    upright.position.set(0.08, config.rideHeight * 0.5, 0); g.add(upright);
    const knuckle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8), new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.15 }));
    knuckle.rotation.x = Math.PI / 2; knuckle.position.set(0.08, config.rideHeight * 0.5, 0); g.add(knuckle);
  }

  buildMultiLink(g: THREE.Group, config: SuspensionConfig): void {
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x555555, metalness: 0.6, roughness: 0.35 });
    for (let i = 0; i < 5; i++) {
      const link = new THREE.Mesh(new THREE.BoxGeometry(0.12 - i * 0.01, 0.006, 0.01), mat);
      link.position.set(0, config.rideHeight * (0.2 + i * 0.15), 0);
      link.rotation.y = (i - 2) * 0.1;
      g.add(link);
    }
  }

  buildPushrod(g: THREE.Group, config: SuspensionConfig): void {
    const pushrod = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.3, 6), new THREE.MeshPhysicalMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.05 }));
    pushrod.position.set(0, config.rideHeight, 0); g.add(pushrod);
    const rocker = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.008, 0.015), new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.7, roughness: 0.2 }));
    rocker.position.set(0, config.rideHeight + 0.15, 0); g.add(rocker);
    const rockerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.12, 6), new THREE.MeshPhysicalMaterial({ color: 0xaaaaaa, metalness: 0.8 }));
    rockerArm.rotation.z = Math.PI / 2; rockerArm.position.set(0, config.rideHeight + 0.15, 0); g.add(rockerArm);
  }

  build(g: THREE.Group, config: SuspensionConfig): void {
    switch (config.type) {
      case "macpherson": this.buildMacPherson(g, config); break;
      case "double_wishbone": this.buildDoubleWishbone(g, config); break;
      case "multi_link": this.buildMultiLink(g, config); break;
      case "pushrod": this.buildPushrod(g, config); break;
    }
  }
}
