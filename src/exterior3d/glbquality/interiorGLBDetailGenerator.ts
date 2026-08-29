import * as THREE from 'three';

export interface StitchConfig { color: THREE.Color; spacing: number; depth: number; width: number; }
export interface PerforationConfig { size: number; spacing: number; pattern: 'grid' | 'hexagonal' | 'diamond'; }
export interface WoodGrainConfig { color: THREE.Color; grainDensity: number; grainWidth: number; glossLevel: number; }
export interface ChromeBezelConfig { width: number; depth: number; radius: number; color: THREE.Color; }

const DEFAULT_STITCH: StitchConfig = { color: new THREE.Color(0.8, 0.7, 0.4), spacing: 0.008, depth: 0.001, width: 0.0005 };
const DEFAULT_PERFORATION: PerforationConfig = { size: 0.003, spacing: 0.01, pattern: 'hexagonal' };
const DEFAULT_WOOD: WoodGrainConfig = { color: new THREE.Color(0.35, 0.2, 0.1), grainDensity: 40, grainWidth: 0.002, glossLevel: 0.8 };
const DEFAULT_BEZEL: ChromeBezelConfig = { width: 0.003, depth: 0.001, radius: 0.001, color: new THREE.Color(0.85, 0.83, 0.78) };

export class InteriorGLBDetailGenerator {
  private stitchCfg: StitchConfig;
  private perfCfg: PerforationConfig;
  private woodCfg: WoodGrainConfig;
  private bezelCfg: ChromeBezelConfig;

  constructor(stitch?: Partial<StitchConfig>, perf?: Partial<PerforationConfig>, wood?: Partial<WoodGrainConfig>, bezel?: Partial<ChromeBezelConfig>) {
    this.stitchCfg = { ...DEFAULT_STITCH, ...stitch };
    this.perfCfg = { ...DEFAULT_PERFORATION, ...perf };
    this.woodCfg = { ...DEFAULT_WOOD, ...wood };
    this.bezelCfg = { ...DEFAULT_BEZEL, ...bezel };
  }

  generateStitchLine(path: THREE.Vector3[], config?: Partial<StitchConfig>): THREE.Group {
    const cfg = { ...this.stitchCfg, ...config };
    const group = new THREE.Group();
    group.name = 'stitch_detail';

    const stitchGeo = new THREE.BoxGeometry(cfg.width, cfg.depth, cfg.spacing * 0.4);
    const stitchMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.6, metalness: 0.1 });

    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];
      const segment = end.clone().sub(start);
      const length = segment.length();
      const stitchCount = Math.floor(length / cfg.spacing);

      for (let s = 0; s < stitchCount; s++) {
        const t = s / stitchCount;
        const pos = start.clone().lerp(end, t);
        const stitch = new THREE.Mesh(stitchGeo, stitchMat);
        stitch.position.copy(pos);
        stitch.lookAt(end);
        stitch.rotateX(Math.PI / 2);
        stitch.name = `stitch_${i}_${s}`;
        group.add(stitch);
      }
    }
    return group;
  }

  generatePerforationSurface(width: number, height: number, config?: Partial<PerforationConfig>): THREE.Group {
    const cfg = { ...this.perfCfg, ...config };
    const group = new THREE.Group();
    group.name = 'perforation_detail';

    const holeGeo = new THREE.CircleGeometry(cfg.size / 2, 8);
    const holeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.02, 0.02), roughness: 0.95, side: THREE.DoubleSide });

    const rows = Math.floor(height / cfg.spacing);
    const cols = Math.floor(width / cfg.spacing);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let x = c * cfg.spacing - width / 2;
        let y = r * cfg.spacing - height / 2;

        if (cfg.pattern === 'hexagonal' && r % 2 === 1) x += cfg.spacing / 2;
        if (cfg.pattern === 'diamond' && (r + c) % 2 === 0) continue;

        const hole = new THREE.Mesh(holeGeo, holeMat);
        hole.position.set(x, y, 0.0001);
        group.add(hole);
      }
    }
    return group;
  }

  generateWoodTrim(width: number, height: number, config?: Partial<WoodGrainConfig>): THREE.Mesh {
    const cfg = { ...this.woodCfg, ...config };
    const geo = new THREE.PlaneGeometry(width, height, 64, 64);
    const pos = geo.getAttribute('position');

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const grain = Math.sin(y * cfg.grainDensity + Math.sin(x * 20) * 0.3) * cfg.grainWidth;
      pos.setZ(i, grain);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhysicalMaterial({
      color: cfg.color, metalness: 0.0, roughness: 0.35,
      clearcoat: cfg.glossLevel, clearcoatRoughness: 0.08,
      envMapIntensity: 0.8,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'wood_trim_detail';
    return mesh;
  }

  generateChromeBezel(innerRadius: number, outerRadius: number, thickness: number, config?: Partial<ChromeBezelConfig>): THREE.Mesh {
    const cfg = { ...this.bezelCfg, ...config };
    const shape = new THREE.Shape();
    const segments = 64;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * outerRadius;
      const y = Math.sin(angle) * outerRadius;
      if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }

    const hole = new THREE.Path();
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * innerRadius;
      const y = Math.sin(angle) * innerRadius;
      if (i === 0) hole.moveTo(x, y); else hole.lineTo(x, y);
    }
    shape.holes.push(hole);

    const extrudeSettings = { depth: thickness, bevelEnabled: true, bevelThickness: cfg.depth, bevelSize: cfg.depth, bevelSegments: 3 };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const mat = new THREE.MeshPhysicalMaterial({
      color: cfg.color, metalness: 1.0, roughness: 0.03,
      clearcoat: 0.5, clearcoatRoughness: 0.01,
      envMapIntensity: 1.5,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'chrome_bezel_detail';
    return mesh;
  }

  generateAmbientLightStrip(points: THREE.Vector3[], color: THREE.Color, intensity = 2): THREE.Group {
    const group = new THREE.Group();
    group.name = 'ambient_light_strip';

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, points.length * 4, 0.002, 8, false);
    const lightMat = new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: intensity,
      transparent: true, opacity: 0.9, roughness: 0.1,
    });

    const tube = new THREE.Mesh(tubeGeo, lightMat);
    tube.name = 'light_strip_tube';
    group.add(tube);

    const glowGeo = new THREE.TubeGeometry(curve, points.length * 4, 0.006, 8, false);
    const glowMat = new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: intensity * 0.3,
      transparent: true, opacity: 0.3, side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.name = 'light_strip_glow';
    group.add(glow);

    return group;
  }

  generateScreenBezel(width: number, height: number, bezelWidth = 0.005): THREE.Group {
    const group = new THREE.Group();
    group.name = 'screen_bezel';

    const outerShape = new THREE.Shape();
    outerShape.moveTo(-width / 2 - bezelWidth, -height / 2 - bezelWidth);
    outerShape.lineTo(width / 2 + bezelWidth, -height / 2 - bezelWidth);
    outerShape.lineTo(width / 2 + bezelWidth, height / 2 + bezelWidth);
    outerShape.lineTo(-width / 2 - bezelWidth, height / 2 + bezelWidth);
    outerShape.lineTo(-width / 2 - bezelWidth, -height / 2 - bezelWidth);

    const hole = new THREE.Path();
    hole.moveTo(-width / 2, -height / 2);
    hole.lineTo(width / 2, -height / 2);
    hole.lineTo(width / 2, height / 2);
    hole.lineTo(-width / 2, height / 2);
    hole.lineTo(-width / 2, -height / 2);
    outerShape.holes.push(hole);

    const bezelGeo = new THREE.ExtrudeGeometry(outerShape, { depth: 0.002, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.001, bevelSegments: 2 });
    const bezelMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.08, 0.08, 0.08), metalness: 0.9, roughness: 0.15, clearcoat: 0.3 });
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.name = 'screen_bezel_frame';
    group.add(bezel);

    const screenGeo = new THREE.PlaneGeometry(width, height);
    const screenMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.01, 0.02, 0.04), emissive: new THREE.Color(0.05, 0.1, 0.2), emissiveIntensity: 0.5, roughness: 0.05, metalness: 0.1 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.003;
    screen.name = 'screen_surface';
    group.add(screen);

    return group;
  }

  generateVentSlats(width: number, height: number, slatCount = 8): THREE.Group {
    const group = new THREE.Group();
    group.name = 'vent_slats';

    const slatGeo = new THREE.BoxGeometry(width, 0.001, 0.002);
    const slatMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.12, 0.12, 0.12), metalness: 0.8, roughness: 0.3 });

    for (let i = 0; i < slatCount; i++) {
      const slat = new THREE.Mesh(slatGeo, slatMat);
      const y = (i / (slatCount - 1) - 0.5) * height;
      slat.position.y = y;
      slat.rotation.x = Math.PI / 6 * (i % 2 === 0 ? 1 : -1);
      slat.name = `vent_slat_${i}`;
      group.add(slat);
    }
    return group;
  }

  generateSwitchPanel(width: number, height: number, buttonCount: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'switch_panel';

    const panelGeo = new THREE.BoxGeometry(width, height, 0.003);
    const panelMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.1, 0.1, 0.1), roughness: 0.6, clearcoat: 0.2 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    group.add(panel);

    const btnGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.002, 16);
    const btnMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.15, 0.15, 0.15), metalness: 0.7, roughness: 0.2, clearcoat: 0.4 });

    for (let i = 0; i < buttonCount; i++) {
      const btn = new THREE.Mesh(btnGeo, btnMat);
      const angle = (i / buttonCount) * Math.PI * 2;
      btn.position.set(Math.cos(angle) * width * 0.35, Math.sin(angle) * height * 0.35, 0.003);
      btn.rotation.x = Math.PI / 2;
      btn.name = `button_${i}`;
      group.add(btn);
    }
    return group;
  }

  generateSeatBeltGuide(length: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'seatbelt_guide';

    const guideGeo = new THREE.TorusGeometry(0.015, 0.003, 8, 16, Math.PI);
    const guideMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.15, 0.15, 0.15), metalness: 0.9, roughness: 0.2 });
    const guide = new THREE.Mesh(guideGeo, guideMat);
    group.add(guide);

    const beltGeo = new THREE.BoxGeometry(0.04, length, 0.002);
    const beltMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.05, 0.05, 0.05), roughness: 0.8 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = -length / 2;
    belt.name = 'seatbelt_webbing';
    group.add(belt);

    return group;
  }
}

export const createDefaultInteriorDetailGenerator = () => new InteriorGLBDetailGenerator();
