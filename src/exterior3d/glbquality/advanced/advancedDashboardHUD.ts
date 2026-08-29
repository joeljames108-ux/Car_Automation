import * as THREE from "three";

export class AdvancedDashboardHUD {
  buildDigitalCluster(g: THREE.Group): void {
    const bg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.01), new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1 }));
    bg.position.set(0, 0, 0);
    g.add(bg);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.13, 0.005), new THREE.MeshStandardMaterial({ color: 0x001133, emissive: 0x001133, emissiveIntensity: 0.8 }));
    screen.position.set(0, 0, 0.008);
    g.add(screen);
    for (let i = 0; i < 8; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.04 + i * 0.005, 0.002), new THREE.MeshStandardMaterial({ color: i < 5 ? 0x00ff00 : i < 7 ? 0xffff00 : 0xff0000, emissive: i < 5 ? 0x00ff00 : i < 7 ? 0xffff00 : 0xff0000, emissiveIntensity: 0.5 }));
      bar.position.set(-0.1 + i * 0.025, -0.02, 0.012);
      g.add(bar);
    }
    for (let i = 0; i < 12; i++) {
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.001, 0.008, 0.002), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 }));
      const angle = -Math.PI * 0.75 + (i / 11) * Math.PI * 1.5;
      tick.position.set(Math.cos(angle) * 0.08, Math.sin(angle) * 0.04, 0.012);
      tick.rotation.z = angle;
      g.add(tick);
    }
    const needle = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.06, 0.002), new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8 }));
    needle.position.set(0, 0.02, 0.013);
    g.add(needle);
  }

  buildInfotainmentScreen(g: THREE.Group, width: number = 0.2, height: number = 0.12): void {
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(width + 0.01, height + 0.01, 0.008), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }));
    g.add(bezel);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.003), new THREE.MeshStandardMaterial({ color: 0x002244, emissive: 0x002244, emissiveIntensity: 0.6 }));
    screen.position.z = 0.005;
    g.add(screen);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const icon = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.001), new THREE.MeshStandardMaterial({ color: [0x0066cc, 0x00aa44, 0xcc6600, 0xcc0000][c], emissive: [0x0066cc, 0x00aa44, 0xcc6600, 0xcc0000][c], emissiveIntensity: 0.3 }));
        icon.position.set(-0.06 + c * 0.04, 0.03 - r * 0.03, 0.007);
        g.add(icon);
      }
    }
  }

  buildHVACControls(g: THREE.Group): void {
    for (let i = 0; i < 3; i++) {
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 16), new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.3 }));
      knob.rotation.x = Math.PI / 2;
      knob.position.set(-0.03 + i * 0.03, -0.08, 0.008);
      g.add(knob);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.001, 8, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 }));
      ring.rotation.x = Math.PI / 2;
      ring.position.set(-0.03 + i * 0.03, -0.08, 0.013);
      g.add(ring);
    }
  }
}
