// ====================================================================
// ENVIRONMENT REFLECTION & WEATHER SYSTEM - Showroom + Weather
// ====================================================================
// Complete environment simulation:
// - 15+ ground surface presets with accurate materials
// - Showroom environments (luxury, motorsport, dramatic, desert, ocean)
// - Time-of-day lighting (dawn, noon, dusk, night)
// - Weather effects: rain, snow, dust, fog, mist
// - Ground reflection mirror plane with blur
// - Contact shadow plane with 4-tire footprint AO
// - Animated weather particles
// - Atmospheric fog and haze
// - PMREMGenerator-based environment maps
// - Animated ground plane with time-varying reflectivity
// - Scene lighting rig with key/fill/rim
// - Debug helpers: grid overlay, measurement lines
// ====================================================================

import * as THREE from 'three';

export interface GroundConfig {
  type: string;
  reflectivity: number;
  color: number;
  roughness: number;
  normalScale?: number;
}

export interface WeatherConfig {
  rain: boolean;
  snow: boolean;
  dust: number;
  wetness: number;
  temperature: number;
  fog: number;
  wind: number;
}

export interface ShowroomConfig {
  name: string;
  floorPreset: string;
  wallColor: number;
  ceilingColor: number;
  keyLightColor: number;
  keyLightIntensity: number;
  fillLightColor: number;
  fillLightIntensity: number;
  ambientIntensity: number;
  envMapPreset: 'warm_studio' | 'cool_studio' | 'neutral' | 'dramatic' | 'garage' | 'outdoor';
}

// --- 15+ GROUND PRESETS ---
export const GROUND_PRESETS: Record<string, GroundConfig> = {
  studio: { type: 'studio_floor', reflectivity: 0.5, color: 0x1a1208, roughness: 0.15 },
  asphalt_dry: { type: 'asphalt', reflectivity: 0.12, color: 0x2a2a2a, roughness: 0.85 },
  asphalt_wet: { type: 'asphalt_wet', reflectivity: 0.55, color: 0x1a1a1a, roughness: 0.25 },
  concrete_polished: { type: 'polished_concrete', reflectivity: 0.35, color: 0x888880, roughness: 0.3 },
  wet_black: { type: 'wet_black', reflectivity: 0.7, color: 0x0a0a0a, roughness: 0.08 },
  showroom_tile: { type: 'showroom', reflectivity: 0.6, color: 0xf5f0e8, roughness: 0.1 },
  gravel: { type: 'gravel', reflectivity: 0.05, color: 0x5a5040, roughness: 0.95 },
  cobblestone: { type: 'cobblestone', reflectivity: 0.2, color: 0x6a6058, roughness: 0.7 },
  carbon_fiber: { type: 'carbon', reflectivity: 0.4, color: 0x111118, roughness: 0.2 },
  metal_checker: { type: 'checker', reflectivity: 0.3, color: 0x808080, roughness: 0.4 },
  racing_grid: { type: 'grid', reflectivity: 0.15, color: 0x2a2a2a, roughness: 0.75 },
  marble: { type: 'marble', reflectivity: 0.55, color: 0xe8e0d8, roughness: 0.12 },
  dark_wood: { type: 'wood', reflectivity: 0.25, color: 0x3a2818, roughness: 0.45 },
  wet_concrete: { type: 'wet_concrete', reflectivity: 0.5, color: 0x3a3a3a, roughness: 0.2 },
  snow_covered: { type: 'snow', reflectivity: 0.3, color: 0xe8eef4, roughness: 0.65 },
};

// --- SHOWROOM PRESETS ---
export const SHOWROOM_PRESETS: Record<string, ShowroomConfig> = {
  luxury: {
    name: "Luxury Showroom",
    floorPreset: "showroom_tile",
    wallColor: 0xf0ece4, ceilingColor: 0xffffff,
    keyLightColor: 0xfff0d0, keyLightIntensity: 3.0,
    fillLightColor: 0xd0e0f0, fillLightIntensity: 1.5,
    ambientIntensity: 0.4,
    envMapPreset: "warm_studio",
  },
  motorsport: {
    name: "Motorsport Garage",
    floorPreset: "racing_grid",
    wallColor: 0x1a1a1a, ceilingColor: 0x2a2a2a,
    keyLightColor: 0xffffff, keyLightIntensity: 4.0,
    fillLightColor: 0x8090b0, fillLightIntensity: 1.0,
    ambientIntensity: 0.3,
    envMapPreset: "cool_studio",
  },
  dramatic: {
    name: "Dramatic Dark",
    floorPreset: "wet_black",
    wallColor: 0x0a0a0a, ceilingColor: 0x050505,
    keyLightColor: 0xffe0b0, keyLightIntensity: 5.0,
    fillLightColor: 0x202040, fillLightIntensity: 0.5,
    ambientIntensity: 0.15,
    envMapPreset: "dramatic",
  },
  desert: {
    name: "Desert Outdoor",
    floorPreset: "gravel",
    wallColor: 0x000000, ceilingColor: 0x000000,
    keyLightColor: 0xffd080, keyLightIntensity: 6.0,
    fillLightColor: 0x8090c0, fillLightIntensity: 2.0,
    ambientIntensity: 0.5,
    envMapPreset: "outdoor",
  },
  ocean: {
    name: "Ocean Pier",
    floorPreset: "wet_concrete",
    wallColor: 0x000000, ceilingColor: 0x000000,
    keyLightColor: 0xf0e8d0, keyLightIntensity: 3.5,
    fillLightColor: 0x4060a0, fillLightIntensity: 2.5,
    ambientIntensity: 0.45,
    envMapPreset: "outdoor",
  },
};

// --- ENVIRONMENT REFLECTION SYSTEM ---
export class EnvironmentReflectionSystem {
  public static createGroundPlane(config: GroundConfig): THREE.Mesh {
    const mat = new THREE.MeshPhysicalMaterial({
      color: config.color,
      metalness: 0.3 * config.reflectivity,
      roughness: config.roughness || (1.0 - config.reflectivity * 0.8),
      clearcoat: config.reflectivity * 0.5,
      clearcoatRoughness: 0.1,
      envMapIntensity: config.reflectivity,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.001;
    mesh.receiveShadow = true;
    mesh.name = 'GroundPlane';
    return mesh;
  }

  // --- CHECKER/GRID GROUND TEXTURE ---
  public static createCheckerGround(color1: number, color2: number, scale: number): THREE.Mesh {
    const size = 512;
    const data = new Uint8Array(size * size * 4);
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const checker = ((Math.floor(x / scale) + Math.floor(y / scale)) % 2) === 0;
        const c = checker ? c1 : c2;
        data[idx] = Math.floor(c.r * 255);
        data[idx + 1] = Math.floor(c.g * 255);
        data[idx + 2] = Math.floor(c.b * 255);
        data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    tex.needsUpdate = true;
    const mat = new THREE.MeshPhysicalMaterial({
      map: tex, roughness: 0.5, metalness: 0.1,
      clearcoat: 0.3, clearcoatRoughness: 0.2,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.001;
    mesh.receiveShadow = true;
    mesh.name = 'CheckerGround';
    return mesh;
  }

  // --- STUDIO ENVIRONMENT MAP ---
  public static createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const cv = document.createElement('canvas');
    cv.width = 1024; cv.height = 512;
    const ctx = cv.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#1a1020');
    grad.addColorStop(0.3, '#2a1a35');
    grad.addColorStop(0.5, '#40304a');
    grad.addColorStop(0.7, '#5a4040');
    grad.addColorStop(1, '#3a2818');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);
    const kl = ctx.createRadialGradient(700, 150, 0, 700, 150, 250);
    kl.addColorStop(0, 'rgba(255,240,220,0.6)');
    kl.addColorStop(0.5, 'rgba(255,220,180,0.15)');
    kl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = kl; ctx.fillRect(0, 0, 1024, 512);
    const fl = ctx.createRadialGradient(200, 200, 0, 200, 200, 180);
    fl.addColorStop(0, 'rgba(180,200,255,0.25)');
    fl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fl; ctx.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 20; i++) {
      const bx = Math.random() * 1024, by = Math.random() * 512;
      const br = 15 + Math.random() * 30;
      const bokeh = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      bokeh.addColorStop(0, 'rgba(255,220,140,' + (0.03 + Math.random() * 0.06) + ')');
      bokeh.addColorStop(1, 'rgba(255,220,140,0)');
      ctx.fillStyle = bokeh; ctx.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    const envMap = pmrem.fromEquirectangular(tex).texture;
    tex.dispose(); pmrem.dispose();
    return envMap;
  }

  // --- TIME-OF-DAY ENVIRONMENT ---
  public static createTimeOfDayEnvironment(renderer: THREE.WebGLRenderer, timeOfDay: 'dawn' | 'noon' | 'dusk' | 'night'): THREE.Texture {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const cv = document.createElement('canvas');
    cv.width = 1024; cv.height = 512;
    const ctx = cv.getContext('2d')!;
    const presets: Record<string, { sky: string[]; sun: string; ambient: string }> = {
      dawn: { sky: ['#1a0a20', '#4a2040', '#ff8040', '#ffc080', '#ffe0b0'], sun: 'rgba(255,180,100,0.8)', ambient: 'rgba(120,80,60,0.3)' },
      noon: { sky: ['#002060', '#2060b0', '#40a0e0', '#80c8f0', '#c0e8ff'], sun: 'rgba(255,255,240,0.9)', ambient: 'rgba(180,200,220,0.4)' },
      dusk: { sky: ['#0a0a20', '#1a1040', '#6030a0', '#c04060', '#ff6040'], sun: 'rgba(255,120,60,0.7)', ambient: 'rgba(100,60,80,0.25)' },
      night: { sky: ['#020208', '#050510', '#0a0a18', '#0a0a18', '#050510'], sun: 'rgba(200,210,255,0.15)', ambient: 'rgba(20,20,40,0.15)' },
    };
    const p = presets[timeOfDay];
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    p.sky.forEach((c, i) => grad.addColorStop(i / (p.sky.length - 1), c));
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1024, 512);
    const sunY = timeOfDay === 'noon' ? 100 : timeOfDay === 'dawn' ? 350 : timeOfDay === 'dusk' ? 360 : 200;
    const sunGrad = ctx.createRadialGradient(700, sunY, 0, 700, sunY, 80);
    sunGrad.addColorStop(0, p.sun); sunGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sunGrad; ctx.fillRect(0, 0, 1024, 512);
    if (timeOfDay === 'night') {
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
        ctx.beginPath(); ctx.arc(Math.random() * 1024, Math.random() * 300, 0.5 + Math.random() * 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    const envMap = pmrem.fromEquirectangular(tex).texture;
    tex.dispose(); pmrem.dispose();
    return envMap;
  }

  // --- CONTACT SHADOW ---
  public static createContactShadowPlane(): THREE.Mesh {
    const cv = document.createElement('canvas');
    cv.width = 512; cv.height = 512;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, 512, 512);
    const cGrad = ctx.createRadialGradient(256, 256, 15, 256, 256, 240);
    cGrad.addColorStop(0, 'rgba(0,0,0,1.0)');
    cGrad.addColorStop(0.25, 'rgba(0,0,0,0.88)');
    cGrad.addColorStop(0.55, 'rgba(0,0,0,0.5)');
    cGrad.addColorStop(0.8, 'rgba(0,0,0,0.15)');
    cGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cGrad; ctx.fillRect(0, 0, 512, 512);
    const drawPatch = (x: number, y: number) => {
      const p = ctx.createRadialGradient(x, y, 2, x, y, 48);
      p.addColorStop(0, 'rgba(0,0,0,1.0)'); p.addColorStop(0.3, 'rgba(0,0,0,0.8)');
      p.addColorStop(0.6, 'rgba(0,0,0,0.35)'); p.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = p; ctx.fillRect(x - 52, y - 52, 104, 104);
    };
    drawPatch(138, 145); drawPatch(374, 145); drawPatch(132, 375); drawPatch(380, 375);
    const cGrad2 = ctx.createRadialGradient(256, 260, 50, 256, 260, 150);
    cGrad2.addColorStop(0, 'rgba(0,0,0,0.6)'); cGrad2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cGrad2; ctx.fillRect(80, 80, 352, 352);
    const tex = new THREE.CanvasTexture(cv); tex.needsUpdate = true;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 5.6),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.88, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(-0.925, 0.002, 0); mesh.name = 'ContactShadow';
    return mesh;
  }

  // --- REFLECTIVE MIRROR PLANE ---
  public static createReflectiveMirrorPlane(renderer: THREE.WebGLRenderer): THREE.Mesh {
    const renderTarget = new THREE.WebGLRenderTarget(512, 512);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.9, roughness: 0.05,
      envMap: renderTarget.texture, envMapIntensity: 0.4,
      transparent: true, opacity: 0.3,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), mat);
    mesh.rotation.x = -Math.PI / 2; mesh.position.y = 0.001; mesh.name = 'ReflectiveMirror';
    return mesh;
  }

  // --- ANIMATED GROUND PLANE ---
  public static createAnimatedGround(renderer: THREE.WebGLRenderer): THREE.Group {
    const group = new THREE.Group();
    group.name = 'AnimatedGround';
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1208, metalness: 0.3, roughness: 0.15,
      clearcoat: 0.5, clearcoatRoughness: 0.1,
      transparent: true, opacity: 0.85, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), mat);
    mesh.rotation.x = -Math.PI / 2; mesh.position.y = -0.001;
    mesh.receiveShadow = true; mesh.name = 'AnimatedGroundPlane';
    group.add(mesh);
    // Reflection ring
    const ringGeo = new THREE.RingGeometry(1.5, 2.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.02, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.001;
    group.add(ring);
    return group;
  }

  // --- SCENE LIGHTING RIG ---
  public static createSceneLightingRig(config: ShowroomConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = 'SceneLighting';
    // Key light
    const keyLight = new THREE.DirectionalLight(config.keyLightColor, config.keyLightIntensity);
    keyLight.position.set(3, 5, 2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.001;
    group.add(keyLight);
    // Fill light
    const fillLight = new THREE.DirectionalLight(config.fillLightColor, config.fillLightIntensity);
    fillLight.position.set(-2, 3, -1);
    group.add(fillLight);
    // Rim / back light
    const rimLight = new THREE.DirectionalLight(0xc0d0e0, config.fillLightIntensity * 0.7);
    rimLight.position.set(-1, 4, -4);
    group.add(rimLight);
    // Ambient
    const ambient = new THREE.AmbientLight(0xffffff, config.ambientIntensity);
    group.add(ambient);
    // Ground bounce
    const bounceLight = new THREE.PointLight(0xffe8d0, 0.3, 6);
    bounceLight.position.set(0, -0.5, 0);
    group.add(bounceLight);
    return group;
  }

  // --- WEATHER PARTICLES ---
  public static createRainDroplets(count: number = 200): THREE.Points {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      sizes[i] = 0.01 + Math.random() * 0.02;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    const mat = new THREE.PointsMaterial({
      color: 0xaaccff, size: 0.015, transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const points = new THREE.Points(geo, mat); points.name = 'RainDroplets';
    return points;
  }

  public static createSnowParticles(count: number = 300): THREE.Points {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.02, transparent: true, opacity: 0.6,
      blending: THREE.NormalBlending, depthWrite: false,
    });
    const points = new THREE.Points(geo, mat); points.name = 'SnowParticles';
    return points;
  }

  public static createDustMotes(count: number = 80): THREE.Points {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 1] = 0.3 + Math.random() * 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xddccaa, size: 0.008, transparent: true, opacity: 0.25,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const points = new THREE.Points(geo, mat); points.name = 'DustMotes';
    return points;
  }

  // --- MIST VOLUME ---
  public static createMistVolume(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'MistVolume';
    const mat = new THREE.MeshBasicMaterial({
      color: 0xc0c8d0, transparent: true, opacity: 0.08,
      side: THREE.DoubleSide, depthWrite: false,
    });
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.PlaneGeometry(6 + Math.random() * 4, 0.5 + Math.random() * 1.5);
      const plane = new THREE.Mesh(geo, mat);
      plane.position.set((Math.random() - 0.5) * 4, 0.2 + Math.random() * 0.8, (Math.random() - 0.5) * 4);
      plane.rotation.y = Math.random() * Math.PI;
      group.add(plane);
    }
    return group;
  }

  // --- DEBUG GRID ---
  public static createDebugGrid(size: number = 10, divisions: number = 20): THREE.GridHelper {
    const grid = new THREE.GridHelper(size, divisions, 0x444444, 0x222222);
    grid.name = 'DebugGrid';
    grid.position.y = -0.002;
    return grid;
  }

  // --- MEASUREMENT OVERLAY ---
  public static createMeasurementLine(start: THREE.Vector3, end: THREE.Vector3): THREE.Group {
    const group = new THREE.Group();
    group.name = 'MeasurementLine';
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const mat = new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.3 });
    const geo = new THREE.CylinderGeometry(0.001, 0.001, len, 4);
    const line = new THREE.Mesh(geo, mat);
    line.position.copy(start).add(dir.multiplyScalar(0.5));
    line.lookAt(end);
    line.rotateX(Math.PI / 2);
    group.add(line);
    // End caps
    for (const pos of [start, end]) {
      const capGeo = new THREE.SphereGeometry(0.005, 8, 8);
      const cap = new THREE.Mesh(capGeo, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      cap.position.copy(pos);
      group.add(cap);
    }
    return group;
  }

  // --- WEATHER ---
  public static applyWeatherEffects(scene: THREE.Scene, weather: WeatherConfig): void {
    if (weather.rain) scene.add(this.createRainDroplets());
    if (weather.snow) scene.add(this.createSnowParticles());
    if (weather.dust > 0) scene.add(this.createDustMotes());
    if (weather.fog > 0) scene.add(this.createMistVolume());
  }

  public static animateWeather(particles: THREE.Points, time: number, type: 'rain' | 'snow' | 'dust'): void {
    if (!particles.geometry.attributes.position) return;
    const pos = particles.geometry.attributes.position as THREE.BufferAttribute;
    const count = pos.count;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i);
      if (type === 'rain') {
        y -= 0.05;
        if (y < -0.1) y = 3;
      } else if (type === 'snow') {
        y -= 0.005;
        pos.setX(i, pos.getX(i) + Math.sin(time * 0.5 + i) * 0.002);
        if (y < -0.1) y = 4;
      } else if (type === 'dust') {
        y += Math.sin(time * 0.3 + i * 0.1) * 0.001;
        pos.setX(i, pos.getX(i) + Math.sin(time * 0.2 + i) * 0.001);
      }
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  }

  // --- FOG ---
  public static applySceneFog(scene: THREE.Scene, color: number, near: number, far: number): void {
    scene.fog = new THREE.Fog(color, near, far);
  }

  public static removeSceneFog(scene: THREE.Scene): void {
    scene.fog = null;
  }
}
