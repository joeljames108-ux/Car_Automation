import * as THREE from 'three';
export function addBodyPanelGaskets(
  group: THREE.Group,
  params: { midX: number; wbM: number; frontNoseX: number; rearBumperX: number;
    bodyWidth: number; hoodLen: number; doorLen: number },
  rubberMat?: THREE.Material
): void {
  const W = 0.003, D = 0.002;
  const mat = rubberMat || new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95, metalness: 0 });
  const { midX, wbM, frontNoseX, rearBumperX, bodyWidth, hoodLen, doorLen } = params;
  const g = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const m = (geo: THREE.BufferGeometry) => new THREE.Mesh(geo, mat);
  const p = (mesh: THREE.Mesh, x: number, y: number, z: number, name: string) => { mesh.position.set(x, y, z); mesh.name = name; group.add(mesh); };
  p(m(g(hoodLen * 0.96, D, W)), midX + 0.02, 0.56, -bodyWidth * 0.42, 'gasket_hood_fender_L');
  p(m(g(hoodLen * 0.96, D, W)), midX + 0.02, 0.56, bodyWidth * 0.42, 'gasket_hood_fender_R');
  p(m(g(W, D, bodyWidth * 0.82)), midX + hoodLen * 0.48, 0.56, 0, 'gasket_hood_rear');
  p(m(g(W, 0.38, W)), midX - doorLen * 0.46, 0.44, -bodyWidth / 2 + 0.01, 'gasket_door_front_L');
  p(m(g(W, 0.38, W)), midX - doorLen * 0.46, 0.44, bodyWidth / 2 - 0.01, 'gasket_door_front_R');
  p(m(g(W, 0.38, W)), midX + doorLen * 0.46, 0.44, -bodyWidth / 2 + 0.01, 'gasket_door_rear_L');
  p(m(g(W, 0.38, W)), midX + doorLen * 0.46, 0.44, bodyWidth / 2 - 0.01, 'gasket_door_rear_R');
  p(m(g(doorLen * 0.92, D, W)), midX + 0.05, 0.22, -bodyWidth / 2 + 0.01, 'gasket_door_bottom_L');
  p(m(g(doorLen * 0.92, D, W)), midX + 0.05, 0.22, bodyWidth / 2 - 0.01, 'gasket_door_bottom_R');
  p(m(g(doorLen * 0.92, D, W)), midX + 0.05, 0.66, -bodyWidth / 2 + 0.01, 'gasket_door_top_L');
  p(m(g(doorLen * 0.92, D, W)), midX + 0.05, 0.66, bodyWidth / 2 - 0.01, 'gasket_door_top_R');
  p(m(g(W, D, bodyWidth * 0.94)), frontNoseX - 0.08, 0.32, 0, 'gasket_front_bumper');
  p(m(g(W, D, bodyWidth * 0.94)), rearBumperX + 0.08, 0.32, 0, 'gasket_rear_bumper');
  p(m(g(wbM * 0.64, D, W)), midX - 0.04, 1.28, -bodyWidth * 0.40, 'gasket_roof_L');
  p(m(g(wbM * 0.64, D, W)), midX - 0.04, 1.28, bodyWidth * 0.40, 'gasket_roof_R');
  p(m(g(W, D, bodyWidth * 0.72)), rearBumperX + 0.22, 0.48, 0, 'gasket_trunk_seal');
}