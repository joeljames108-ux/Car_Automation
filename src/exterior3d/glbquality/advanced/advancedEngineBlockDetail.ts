import * as THREE from "three";

export class AdvancedEngineBlockDetail {
  buildBoltPattern(g: THREE.Group, center: THREE.Vector3, radius: number, count: number, boltSize: number = 0.005): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(boltSize, boltSize, 0.006, 6), new THREE.MeshPhysicalMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.1 }));
      bolt.position.set(center.x + Math.cos(angle) * radius, center.y, center.z + Math.sin(angle) * radius);
      g.add(bolt);
      const washer = new THREE.Mesh(new THREE.CylinderGeometry(boltSize * 1.5, boltSize * 1.5, 0.001, 8), new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.15 }));
      washer.position.set(center.x + Math.cos(angle) * radius, center.y + 0.003, center.z + Math.sin(angle) * radius);
      g.add(washer);
    }
  }

  buildHeadGasket(g: THREE.Group, width: number, length: number): void {
    const shape = new THREE.Shape();
    const hw = width / 2, hl = length / 2;
    shape.moveTo(-hw, -hl);
    shape.lineTo(hw, -hl);
    shape.lineTo(hw, hl);
    shape.lineTo(-hw, hl);
    shape.lineTo(-hw, -hl);
    const holePath = new THREE.Path();
    holePath.absellipse(0, 0, 0.02, 0.02, 0, Math.PI * 2, false);
    shape.holes.push(holePath);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.001, bevelEnabled: false });
    const mat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.6, roughness: 0.4 });
    const gasket = new THREE.Mesh(geo, mat);
    gasket.rotation.x = -Math.PI / 2;
    g.add(gasket);
  }

  buildOilFilter(g: THREE.Group, position: THREE.Vector3): void {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 12), new THREE.MeshPhysicalMaterial({ color: 0x222222, metalness: 0.4, roughness: 0.6 }));
    body.position.copy(position);
    g.add(body);
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.03, 12), new THREE.MeshStandardMaterial({ color: 0x0066cc, roughness: 0.7 }));
    label.position.copy(position);
    g.add(label);
    const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.003, 12), new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 }));
    flange.position.set(position.x, position.y + 0.025, position.z);
    g.add(flange);
  }

  buildCoolantPassage(g: THREE.Group, from: THREE.Vector3, to: THREE.Vector3): void {
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    mid.y += 0.01;
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.005, 6, false), new THREE.MeshPhysicalMaterial({ color: 0x00aa44, metalness: 0.6, roughness: 0.3 }));
    g.add(tube);
  }

  buildSparkPlug(g: THREE.Group, position: THREE.Vector3): void {
    const ceramic = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 8), new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 }));
    ceramic.position.copy(position);
    g.add(ceramic);
    const metal = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.01, 8), new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 }));
    metal.position.set(position.x, position.y - 0.02, position.z);
    g.add(metal);
    const electrode = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.001, 0.008, 4), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.95 }));
    electrode.position.set(position.x, position.y - 0.03, position.z);
    g.add(electrode);
  }

  buildTimingChain(g: THREE.Group, positions: THREE.Vector3[]): void {
    const curve = new THREE.CatmullRomCurve3(positions, true);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.003, 4, true), new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7, roughness: 0.3 }));
    g.add(tube);
  }
}
