import * as THREE from "three";

export class AdvancedCarBodySculptor {
  private paintMat(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.5, roughness: 0.18, clearcoat: 1.0,
      clearcoatRoughness: 0.08, envMapIntensity: 2.0,
    });
  }

  buildAllPanels(g: THREE.Group): void {
    this.buildHood(g); this.buildFenders(g); this.buildDoors(g);
    this.buildRoof(g); this.buildTrunk(g); this.buildRearQuarters(g);
  }

  buildHood(g: THREE.Group): void {
    const mat = this.paintMat();
    const geo = new THREE.PlaneGeometry(1.6, 1, 14, 10);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, -Math.pow(x / 0.8, 2) * 0.03 + Math.sin(y * 3) * 0.005);
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, 0.46, -0.6);
    g.add(mesh);
    // Hood scoop
    const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.025, 0.4), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }));
    scoop.position.set(0, 0.48, -0.7); g.add(scoop);
    // Hood vents
    for (const x of [-0.25, 0.25]) for (let i = 0; i < 5; i++) {
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.005, 0.006), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
      v.position.set(x, 0.465, -0.55 + i * 0.06); g.add(v);
    }
  }

  buildRoof(g: THREE.Group): void {
    const mat = this.paintMat();
    const geo = new THREE.PlaneGeometry(1.3, 0.8, 14, 10);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, -Math.pow(x / 0.65, 2) * 0.03 + Math.sin(y * 3) * 0.005);
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, 0.555, 0.05);
    g.add(mesh);
    // Roof rails
    for (const x of [-0.55, 0.55]) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.005, 0.7), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      r.position.set(x, 0.553, 0.05); g.add(r);
    }
    // Shark fin antenna
    const ant = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.04, 4), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    ant.position.set(0, 0.57, 0.35); g.add(ant);
  }

  buildTrunk(g: THREE.Group): void {
    const mat = this.paintMat();
    const geo = new THREE.PlaneGeometry(1.4, 0.6, 14, 10);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, -Math.pow(x / 0.7, 2) * 0.03 + Math.sin(y * 3) * 0.005);
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, 0.44, 0.8);
    g.add(mesh);
    // Lip spoiler
    const sp = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.008, 0.06), new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.4, roughness: 0.3 }));
    sp.position.set(0, 0.46, 1.08); g.add(sp);
    for (const x of [-0.65, 0.65]) {
      const ep = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.04, 0.05), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      ep.position.set(x, 0.47, 1.08); g.add(ep);
    }
  }

  buildFenders(g: THREE.Group): void {
    const mat = this.paintMat();
    for (const side of [-1, 1]) {
      const geo = new THREE.PlaneGeometry(0.6, 1.2, 10, 12);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        pos.setZ(i, Math.pow(x / 0.3, 2) * 0.015 + Math.sin(y * 2) * 0.005);
      }
      geo.computeVertexNormals();
      const panel = new THREE.Mesh(geo, mat);
      panel.rotation.x = -Math.PI / 2;
      panel.rotation.z = side * Math.PI / 2;
      panel.position.set(side * 0.82, 0.35, -0.3);
      g.add(panel);
      // Wheel arch
      const arch = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.008, 8, 16, Math.PI), mat.clone());
      arch.position.set(side * 0.84, 0.22, -0.3); arch.rotation.y = side > 0 ? -Math.PI/2 : Math.PI/2; g.add(arch);
      // Fender vent
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.06, 0.15), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
      v.position.set(side * 0.83, 0.38, -0.5); g.add(v);
    }
  }

  buildDoors(g: THREE.Group): void {
    const mat = this.paintMat();
    for (const side of [-1, 1]) {
      const geo = new THREE.PlaneGeometry(0.8, 0.45, 10, 12);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        pos.setZ(i, Math.pow(x / 0.4, 2) * 0.015 + Math.sin(y * 2) * 0.005);
      }
      geo.computeVertexNormals();
      const panel = new THREE.Mesh(geo, mat);
      panel.rotation.x = -Math.PI / 2;
      panel.rotation.z = side * Math.PI / 2;
      panel.position.set(side * 0.83, 0.32, 0.1);
      g.add(panel);
      // Door handle
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.012, 0.06), new THREE.MeshPhysicalMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.05 }));
      h.position.set(side * 0.845, 0.35, 0.15); g.add(h);
      // Mirror
      const mh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.03), new THREE.MeshPhysicalMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.5 }));
      mh.position.set(side * 0.88, 0.42, -0.2); g.add(mh);
      const mg = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.025), new THREE.MeshPhysicalMaterial({ color: 0x88aacc, metalness: 1.0, roughness: 0.02 }));
      mg.position.set(side * 0.895, 0.42, -0.2); g.add(mg);
    }
  }

  buildRearQuarters(g: THREE.Group): void {
    const mat = this.paintMat();
    for (const side of [-1, 1]) {
      const geo = new THREE.PlaneGeometry(0.5, 0.8, 10, 12);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        pos.setZ(i, Math.pow(x / 0.25, 2) * 0.015 + Math.sin(y * 2) * 0.005);
      }
      geo.computeVertexNormals();
      const panel = new THREE.Mesh(geo, mat);
      panel.rotation.x = -Math.PI / 2;
      panel.rotation.z = side * Math.PI / 2;
      panel.position.set(side * 0.78, 0.35, 0.6);
      g.add(panel);
      // Fuel cap
      const fc = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.005, 12), new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 }));
      fc.position.set(side * 0.8, 0.38, 0.7); fc.rotation.z = Math.PI/2; g.add(fc);
    }
  }

}
