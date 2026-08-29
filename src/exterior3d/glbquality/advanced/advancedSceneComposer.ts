import * as THREE from "three";

export type CameraAngle = "front" | "rear" | "side" | "top" | "three_quarter" | "detail_wheel" | "detail_engine" | "interior";

export class AdvancedSceneComposer {
  setupScene(scene: THREE.Scene): void {
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog(0x111111, 10, 30);
  }

  setupCamera(camera: THREE.PerspectiveCamera, angle: CameraAngle): void {
    const positions: Record<CameraAngle, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
      front: { pos: new THREE.Vector3(0, 0.5, -3), target: new THREE.Vector3(0, 0.3, 0) },
      rear: { pos: new THREE.Vector3(0, 0.5, 3), target: new THREE.Vector3(0, 0.3, 0) },
      side: { pos: new THREE.Vector3(3, 0.4, 0), target: new THREE.Vector3(0, 0.3, 0) },
      top: { pos: new THREE.Vector3(0, 4, 0.01), target: new THREE.Vector3(0, 0, 0) },
      three_quarter: { pos: new THREE.Vector3(2.5, 1.2, -2), target: new THREE.Vector3(0, 0.3, 0) },
      detail_wheel: { pos: new THREE.Vector3(0.8, 0.2, -0.6), target: new THREE.Vector3(0.8, 0.2, -0.3) },
      detail_engine: { pos: new THREE.Vector3(0, 0.6, -0.8), target: new THREE.Vector3(0, 0.3, -0.5) },
      interior: { pos: new THREE.Vector3(-0.15, 0.4, -0.1), target: new THREE.Vector3(-0.15, 0.35, -0.5) },
    };
    const cfg = positions[angle];
    camera.position.copy(cfg.pos);
    camera.lookAt(cfg.target);
    camera.updateProjectionMatrix();
  }

  setupGround(scene: THREE.Scene): void {
    const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 64), new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.1, roughness: 0.2 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.003, 8, 64), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.002;
    scene.add(ring);
  }

  autoFitCamera(camera: THREE.PerspectiveCamera, object: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(object);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const distance = maxDim / (2 * Math.tan(fov / 2));
    camera.position.set(center.x + distance * 0.7, center.y + distance * 0.5, center.z + distance * 0.7);
    camera.lookAt(center);
  }
}
