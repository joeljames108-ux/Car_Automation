import * as THREE from "three";

export class AdvancedWeatherEffects {
  private particles: THREE.Points[] = [];

  addRain(g: THREE.Group, count: number = 500, area: number = 4): void {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * area;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * area;
      velocities[i] = 0.02 + Math.random() * 0.03;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x8899bb, size: 0.02, transparent: true, opacity: 0.6, sizeAttenuation: true });
    const rain = new THREE.Points(geo, mat);
    g.add(rain);
    this.particles.push(rain);
  }

  addSnow(g: THREE.Group, count: number = 300, area: number = 4): void {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * area;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * area;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, transparent: true, opacity: 0.8, sizeAttenuation: true });
    const snow = new THREE.Points(geo, mat);
    g.add(snow);
    this.particles.push(snow);
  }

  addFog(g: THREE.Scene, color: number = 0xcccccc, near: number = 5, far: number = 20): void {
    g.fog = new THREE.Fog(color, near, far);
  }

  addDustMotes(g: THREE.Group, count: number = 100, area: number = 2): void {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * area;
      positions[i * 3 + 1] = Math.random() * 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * area;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xccbb99, size: 0.008, transparent: true, opacity: 0.3, sizeAttenuation: true });
    g.add(new THREE.Points(geo, mat));
  }

  update(time: number): void {
    this.particles.forEach(p => {
      const pos = p.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - 0.03;
        if (y < 0) y = 3;
        pos.setY(i, y);
        pos.setX(i, pos.getX(i) + Math.sin(time + i) * 0.001);
      }
      pos.needsUpdate = true;
    });
  }

  clear(g: THREE.Group | THREE.Scene): void {
    this.particles.forEach(p => g.remove(p));
    this.particles = [];
    if ((g as THREE.Scene).fog) (g as THREE.Scene).fog = null;
  }
}
