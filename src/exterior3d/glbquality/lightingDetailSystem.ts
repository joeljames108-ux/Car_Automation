import * as THREE from "three";

export interface LEDArrayConfig { rows: number; cols: number; ledSize: number; spacing: number; color: THREE.Color; intensity: number; }

function createHeadlight(): THREE.Group {
  const grp = new THREE.Group();
  // Outer lens
  const lens = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 16, 16, 0, Math.PI),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0.05, ior: 1.5, thickness: 0.01 })
  );
  grp.add(lens);
  // Projector reflector
  const reflector = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 12, 12, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1.0, roughness: 0.02 })
  );
  reflector.position.z = 0.02;
  grp.add(reflector);
  // LED chip
  const chip = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.01, 0.005),
    new THREE.MeshStandardMaterial({ color: 0xffffdd, emissive: 0xffffdd, emissiveIntensity: 2.0 })
  );
  chip.position.z = 0.04;
  grp.add(chip);
  // Housing
  const housing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.07, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6, metalness: 0.3 })
  );
  housing.rotation.x = Math.PI / 2;
  housing.position.z = -0.05;
  grp.add(housing);
  return grp;
}

function createTaillight(): THREE.Group {
  const grp = new THREE.Group();
  // LED strip bar
  for (let i = 0; i < 12; i++) {
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.008, 0.003),
      new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1.5 })
    );
    led.position.set((i - 5.5) * 0.018, 0, 0);
    grp.add(led);
  }
  // Outer lens
  const lens = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.04, 0.005),
    new THREE.MeshPhysicalMaterial({ color: 0xff0000, transmission: 0.6, roughness: 0.1, ior: 1.5 })
  );
  lens.position.z = 0.005;
  grp.add(lens);
  // Brake light (brighter center)
  const brake = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.03, 0.003),
    new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 2.0 })
  );
  brake.position.z = -0.003;
  grp.add(brake);
  return grp;
}

function createDRL(): THREE.Group {
  const grp = new THREE.Group();
  // C-shaped DRL strip
  const curve = new THREE.CurvePath<THREE.Vector3>();
  const arc = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.08, 0.04, 0),
    new THREE.Vector3(-0.05, 0.06, 0),
    new THREE.Vector3(0, 0.06, 0)
  );
  curve.add(arc);
  const arc2 = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 0.06, 0),
    new THREE.Vector3(0.05, 0.06, 0),
    new THREE.Vector3(0.08, 0.04, 0)
  );
  curve.add(arc2);
  const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.003, 6, false);
  const drl = new THREE.Mesh(tubeGeo,
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.8 })
  );
  grp.add(drl);
  return grp;
}

function createFogLight(): THREE.Group {
  const grp = new THREE.Group();
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.035, 0.02, 12),
    new THREE.MeshPhysicalMaterial({ color: 0xffffcc, transmission: 0.8, roughness: 0.05, ior: 1.5 })
  );
  grp.add(lens);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.01, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffffaa, emissiveIntensity: 2.0 })
  );
  grp.add(bulb);
  return grp;
}

function createTurnSignal(): THREE.Group {
  const grp = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.006, 0.006, 0.002),
      new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 1.5 })
    );
    led.position.set(i * 0.01, 0, 0);
    grp.add(led);
  }
  return grp;
}

export class LightingDetailSystem {
  buildHeadlight(group: THREE.Group, _cfg?: Partial<LEDArrayConfig>): void {
    group.add(createHeadlight());
  }
  buildTaillight(group: THREE.Group): void {
    group.add(createTaillight());
  }
  buildDRL(group: THREE.Group): void {
    group.add(createDRL());
  }
  buildFogLight(group: THREE.Group): void {
    group.add(createFogLight());
  }
  buildTurnSignals(group: THREE.Group): void {
    const left = createTurnSignal(); left.position.set(-0.5, 0, 0); group.add(left);
    const right = createTurnSignal(); right.position.set(0.5, 0, 0); group.add(right);
  }
  buildAll(group: THREE.Group): void {
    this.buildHeadlight(group); this.buildTaillight(group);
    this.buildDRL(group); this.buildFogLight(group); this.buildTurnSignals(group);
  }
}
