import * as THREE from "three";

export type LightingPreset = "studio" | "showroom" | "outdoor" | "night" | "dramatic";

const LIGHT_CONFIGS: Record<LightingPreset, { ambient: number; ambientIntensity: number; key: { color: number; intensity: number; position: THREE.Vector3 }; fill: { color: number; intensity: number; position: THREE.Vector3 }; rim: { color: number; intensity: number; position: THREE.Vector3 }; bg: number }> = {
  studio: { ambient: 0x404040, ambientIntensity: 0.4, key: { color: 0xffffff, intensity: 1.5, position: new THREE.Vector3(3, 4, 2) }, fill: { color: 0x8888ff, intensity: 0.6, position: new THREE.Vector3(-3, 2, 1) }, rim: { color: 0xffffff, intensity: 0.8, position: new THREE.Vector3(0, 2, -4) }, bg: 0x111111 },
  showroom: { ambient: 0x333340, ambientIntensity: 0.5, key: { color: 0xffffee, intensity: 2.0, position: new THREE.Vector3(2, 5, 3) }, fill: { color: 0x6666aa, intensity: 0.8, position: new THREE.Vector3(-4, 3, 2) }, rim: { color: 0xffffff, intensity: 1.0, position: new THREE.Vector3(0, 1, -5) }, bg: 0x0a0a12 },
  outdoor: { ambient: 0x87ceeb, ambientIntensity: 0.6, key: { color: 0xffeedd, intensity: 2.5, position: new THREE.Vector3(5, 8, 3) }, fill: { color: 0x6699cc, intensity: 0.4, position: new THREE.Vector3(-3, 4, -2) }, rim: { color: 0xffddaa, intensity: 0.3, position: new THREE.Vector3(-1, 1, -6) }, bg: 0x87ceeb },
  night: { ambient: 0x111122, ambientIntensity: 0.15, key: { color: 0x4466ff, intensity: 0.8, position: new THREE.Vector3(2, 3, 2) }, fill: { color: 0x222244, intensity: 0.3, position: new THREE.Vector3(-3, 2, 1) }, rim: { color: 0xff4400, intensity: 0.5, position: new THREE.Vector3(0, 1, -4) }, bg: 0x050510 },
  dramatic: { ambient: 0x111111, ambientIntensity: 0.2, key: { color: 0xff6600, intensity: 3.0, position: new THREE.Vector3(4, 3, 0) }, fill: { color: 0x0044ff, intensity: 0.5, position: new THREE.Vector3(-4, 2, 3) }, rim: { color: 0xff0000, intensity: 1.2, position: new THREE.Vector3(0, 0.5, -5) }, bg: 0x080808 },
};

export class AdvancedSceneLighting {
  private lights: THREE.Light[] = [];
  private ambientLight: THREE.AmbientLight | null = null;

  setupPreset(scene: THREE.Scene, preset: LightingPreset): void {
    this.clear(scene);
    const cfg = LIGHT_CONFIGS[preset];
    this.ambientLight = new THREE.AmbientLight(cfg.ambient, cfg.ambientIntensity);
    scene.add(this.ambientLight);
    const keyLight = new THREE.DirectionalLight(cfg.key.color, cfg.key.intensity);
    keyLight.position.copy(cfg.key.position);
    keyLight.castShadow = true;
    scene.add(keyLight); this.lights.push(keyLight);
    const fillLight = new THREE.DirectionalLight(cfg.fill.color, cfg.fill.intensity);
    fillLight.position.copy(cfg.fill.position);
    scene.add(fillLight); this.lights.push(fillLight);
    const rimLight = new THREE.DirectionalLight(cfg.rim.color, cfg.rim.intensity);
    rimLight.position.copy(cfg.rim.position);
    scene.add(rimLight); this.lights.push(rimLight);
    scene.background = new THREE.Color(cfg.bg);
  }

  addSpotLight(scene: THREE.Scene, position: THREE.Vector3, target: THREE.Vector3, color: number, intensity: number, angle: number = 0.5, penumbra: number = 0.5): THREE.SpotLight {
    const spot = new THREE.SpotLight(color, intensity, 20, angle, penumbra);
    spot.position.copy(position);
    spot.target.position.copy(target);
    spot.castShadow = true;
    scene.add(spot); scene.add(spot.target);
    this.lights.push(spot);
    return spot;
  }

  addPointLight(scene: THREE.Scene, position: THREE.Vector3, color: number, intensity: number, distance: number = 10): THREE.PointLight {
    const pt = new THREE.PointLight(color, intensity, distance);
    pt.position.copy(position);
    scene.add(pt);
    this.lights.push(pt);
    return pt;
  }

  clear(scene: THREE.Scene): void {
    this.lights.forEach(l => scene.remove(l));
    this.lights = [];
    if (this.ambientLight) { scene.remove(this.ambientLight); this.ambientLight = null; }
  }
}
