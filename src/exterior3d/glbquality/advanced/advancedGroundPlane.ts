import * as THREE from "three";

export class AdvancedGroundPlane {
  buildReflectiveFloor(g: THREE.Group, size: number = 12): void {
    const floorGeo = new THREE.PlaneGeometry(size, size);
    const floorMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1208, metalness: 0.2, roughness: 0.15, clearcoat: 0.1, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.001;
    floor.receiveShadow = true;
    g.add(floor);
  }

  buildGridFloor(g: THREE.Group, size: number = 12, divisions: number = 20): void {
    const grid = new THREE.GridHelper(size, divisions, 0x333333, 0x1a1a1a);
    grid.position.y = 0.001;
    g.add(grid);
  }

  buildTurntable(g: THREE.Group, radius: number = 2): void {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.02, 64), new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.5, roughness: 0.3 }));
    base.position.y = -0.01;
    g.add(base);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.005, 8, 64), new THREE.MeshPhysicalMaterial({ color: 0xffcc00, metalness: 0.9, roughness: 0.1 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.005;
    g.add(ring);
  }

  buildStudioFloor(g: THREE.Group): void {
    const floorGeo = new THREE.CircleGeometry(5, 64);
    const floorMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.1, roughness: 0.2, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    g.add(floor);
  }
}
