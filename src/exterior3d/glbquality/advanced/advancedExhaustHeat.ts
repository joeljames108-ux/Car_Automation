import * as THREE from "three";

export class AdvancedExhaustHeat {
  private heatSources: Array<{ mesh: THREE.Mesh; temp: number; maxTemp: number }> = [];

  addHeatSource(g: THREE.Group, position: THREE.Vector3, radius: number = 0.05): THREE.Mesh {
    const geo = new THREE.SphereGeometry(radius, 8, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff2200, emissiveIntensity: 0, transparent: true, opacity: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    g.add(mesh);
    this.heatSources.push({ mesh, temp: 20, maxTemp: 900 });
    return mesh;
  }

  addExhaustPipe(g: THREE.Group, from: THREE.Vector3, to: THREE.Vector3): void {
    const curve = new THREE.LineCurve3(from, to);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.015, 8, false), new THREE.MeshPhysicalMaterial({ color: 0x666666, metalness: 0.8, roughness: 0.3 }));
    g.add(tube);
  }

  addHeatHaze(g: THREE.Group, position: THREE.Vector3): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(0.08, 0.12);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.03, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    g.add(mesh);
    return mesh;
  }

  update(time: number, engineTemp: number = 0.5): void {
    this.heatSources.forEach(hs => {
      hs.temp = 20 + (hs.maxTemp - 20) * engineTemp;
      const intensity = Math.min(hs.temp / 500, 1.0);
      (hs.mesh.material as any).emissiveIntensity = intensity * (0.5 + Math.sin(time * 3) * 0.2);
      (hs.mesh.material as any).opacity = 0.1 + intensity * 0.3;
    });
  }
}
