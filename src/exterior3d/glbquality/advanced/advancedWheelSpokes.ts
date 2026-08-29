import * as THREE from "three";

export type SpokeStyle = "y_spoke" | "turbine" | "mesh" | "multi" | "basketweave";

export class AdvancedWheelSpokes {
  buildSpokes(g: THREE.Group, style: SpokeStyle, count: number = 5, radius: number = 0.2, hubRadius: number = 0.04): void {
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.08 });
    switch (style) {
      case "y_spoke":
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          for (const offset of [-0.08, 0.08]) {
            const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.006, radius - hubRadius), mat);
            spoke.position.set(Math.cos(angle) * (hubRadius + (radius - hubRadius) / 2), 0, Math.sin(angle) * (hubRadius + (radius - hubRadius) / 2));
            spoke.rotation.y = -angle + offset;
            g.add(spoke);
          }
        }
        break;
      case "turbine":
        for (let i = 0; i < count * 2; i++) {
          const angle = (i / (count * 2)) * Math.PI * 2;
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.004, radius - hubRadius), mat);
          blade.position.set(Math.cos(angle) * (hubRadius + (radius - hubRadius) / 2), 0, Math.sin(angle) * (hubRadius + (radius - hubRadius) / 2));
          blade.rotation.y = -angle + 0.3;
          g.add(blade);
        }
        break;
      case "mesh":
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.004, radius - hubRadius), mat);
          spoke.position.set(Math.cos(angle) * (hubRadius + (radius - hubRadius) / 2), 0, Math.sin(angle) * (hubRadius + (radius - hubRadius) / 2));
          spoke.rotation.y = -angle;
          g.add(spoke);
        }
        break;
      case "multi":
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.008, radius - hubRadius), mat);
          spoke.position.set(Math.cos(angle) * (hubRadius + (radius - hubRadius) / 2), 0, Math.sin(angle) * (hubRadius + (radius - hubRadius) / 2));
          spoke.rotation.y = -angle;
          g.add(spoke);
        }
        break;
      case "basketweave":
        for (let i = 0; i < count * 3; i++) {
          const angle = (i / (count * 3)) * Math.PI * 2;
          const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.003, (radius - hubRadius) * 0.6), mat);
          spoke.position.set(Math.cos(angle) * (hubRadius + (radius - hubRadius) * 0.4), 0, Math.sin(angle) * (hubRadius + (radius - hubRadius) * 0.4));
          spoke.rotation.y = -angle + (i % 3 === 0 ? 0.2 : -0.2);
          g.add(spoke);
        }
        break;
    }
    const rim = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.01, 8, 32), mat);
    rim.rotation.x = Math.PI / 2;
    g.add(rim);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(hubRadius, hubRadius, 0.015, 16), mat);
    g.add(hub);
  }
}
