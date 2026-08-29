import * as THREE from 'three';

export interface BoltHeadConfig { size: number; height: number; type: 'hex' | 'allen' | 'torx' | '12point'; grade: string; }
export interface GasketConfig { thickness: number; color: THREE.Color; material: 'graphite' | 'MLS' | 'copper'; }
export interface HoseConfig { radius: number; length: number; color: THREE.Color; clampType: 'spring' | 'worm' | 'T-bolt'; }
export interface WireLoomConfig { radius: number; color: THREE.Color; segments: number; }

const DEFAULT_BOLT: BoltHeadConfig = { size: 0.008, height: 0.005, type: 'hex', grade: '10.9' };
const DEFAULT_GASKET: GasketConfig = { thickness: 0.002, color: new THREE.Color(0.3, 0.3, 0.3), material: 'MLS' };
const DEFAULT_HOSE: HoseConfig = { radius: 0.012, length: 0.2, color: new THREE.Color(0.08, 0.08, 0.08), clampType: 'spring' };
const DEFAULT_WIRE: WireLoomConfig = { radius: 0.004, color: new THREE.Color(0.1, 0.1, 0.1), segments: 8 };

export class EngineGLBDetailEnhancer {
  private boltCfg: BoltHeadConfig;
  private gasketCfg: GasketConfig;
  private hoseCfg: HoseConfig;
  private wireCfg: WireLoomConfig;

  constructor(bolt?: Partial<BoltHeadConfig>, gasket?: Partial<GasketConfig>, hose?: Partial<HoseConfig>, wire?: Partial<WireLoomConfig>) {
    this.boltCfg = { ...DEFAULT_BOLT, ...bolt };
    this.gasketCfg = { ...DEFAULT_GASKET, ...gasket };
    this.hoseCfg = { ...DEFAULT_HOSE, ...hose };
    this.wireCfg = { ...DEFAULT_WIRE, ...wire };
  }

  generateBoltHead(config?: Partial<BoltHeadConfig>): THREE.Mesh {
    const cfg = { ...this.boltCfg, ...config };
    let geo: THREE.BufferGeometry;
    const r = cfg.size / 2;

    if (cfg.type === 'hex') {
      geo = new THREE.CylinderGeometry(r, r, cfg.height, 6);
    } else if (cfg.type === 'allen') {
      geo = new THREE.CylinderGeometry(r, r, cfg.height, 6);
      const holeGeo = new THREE.CylinderGeometry(r * 0.4, r * 0.4, cfg.height + 0.001, 6);
      const holeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.02, 0.02) });
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.y = 0;
      const group = new THREE.Group();
      group.add(new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.55, 0.52, 0.48), metalness: 0.92, roughness: 0.25 })));
      group.add(hole);
      return group as any;
    } else if (cfg.type === 'torx') {
      geo = new THREE.CylinderGeometry(r, r, cfg.height, 6);
    } else {
      geo = new THREE.CylinderGeometry(r, r, cfg.height, 12);
    }

    const gradeColors: Record<string, THREE.Color> = {
      '8.8': new THREE.Color(0.6, 0.55, 0.3),
      '10.9': new THREE.Color(0.55, 0.52, 0.48),
      '12.9': new THREE.Color(0.35, 0.33, 0.3),
      'A2-70': new THREE.Color(0.75, 0.73, 0.7),
      'Inconel': new THREE.Color(0.5, 0.48, 0.45),
    };

    const mat = new THREE.MeshPhysicalMaterial({
      color: gradeColors[cfg.grade] || new THREE.Color(0.55, 0.52, 0.48),
      metalness: 0.92, roughness: 0.25, clearcoat: 0.1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.name = `bolt_${cfg.type}_${cfg.grade}`;
    return mesh;
  }

  generateBoltPattern(radius: number, count: number, config?: Partial<BoltHeadConfig>): THREE.Group {
    const group = new THREE.Group();
    group.name = 'bolt_pattern';
    const bolt = this.generateBoltHead(config);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const b = bolt.clone();
      b.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      b.rotation.x = Math.PI / 2;
      b.name = `bolt_${i}`;
      group.add(b);
    }
    return group;
  }

  generateGasket(width: number, height: number, config?: Partial<GasketConfig>): THREE.Mesh {
    const cfg = { ...this.gasketCfg, ...config };
    const shape = new THREE.Shape();
    const hw = width / 2, hh = height / 2;
    const r = 0.005;
    shape.moveTo(-hw + r, -hh);
    shape.lineTo(hw - r, -hh);
    shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
    shape.lineTo(hw, hh - r);
    shape.quadraticCurveTo(hw, hh, hw - r, hh);
    shape.lineTo(-hw + r, hh);
    shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
    shape.lineTo(-hw, -hh + r);
    shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

    const holeW = hw - 0.01, holeH = hh - 0.01;
    const hole = new THREE.Path();
    hole.moveTo(-holeW, -holeH); hole.lineTo(holeW, -holeH); hole.lineTo(holeW, holeH); hole.lineTo(-holeW, holeH); hole.lineTo(-holeW, -holeH);
    shape.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(shape, { depth: cfg.thickness, bevelEnabled: false });
    const gasketColors: Record<string, THREE.Color> = {
      'graphite': new THREE.Color(0.15, 0.15, 0.15),
      'MLS': new THREE.Color(0.5, 0.48, 0.45),
      'copper': new THREE.Color(0.72, 0.45, 0.2),
    };
    const mat = new THREE.MeshStandardMaterial({ color: gasketColors[cfg.material] || cfg.color, roughness: 0.6, metalness: cfg.material === 'MLS' ? 0.8 : 0.2 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = `gasket_${cfg.material}`;
    return mesh;
  }

  generateHose(path: THREE.Vector3[], config?: Partial<HoseConfig>): THREE.Group {
    const cfg = { ...this.hoseCfg, ...config };
    const group = new THREE.Group();
    group.name = 'hose_assembly';

    const curve = new THREE.CatmullRomCurve3(path);
    const hoseGeo = new THREE.TubeGeometry(curve, path.length * 8, cfg.radius, 12, false);
    const hoseMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.75, metalness: 0 });
    const hose = new THREE.Mesh(hoseGeo, hoseMat);
    hose.name = 'hose_body';
    group.add(hose);

    const clampGeo = new THREE.TorusGeometry(cfg.radius * 1.1, 0.001, 6, 16);
    const clampMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.7, 0.68, 0.65), metalness: 0.9, roughness: 0.15 });

    for (let i = 0; i < path.length; i += Math.floor(path.length / 3) + 1) {
      if (i >= path.length) break;
      const clamp = new THREE.Mesh(clampGeo, clampMat);
      clamp.position.copy(path[i]);
      clamp.name = `clamp_${i}`;
      group.add(clamp);
    }

    return group;
  }

  generateWireLoom(path: THREE.Vector3[], config?: Partial<WireLoomConfig>): THREE.Group {
    const cfg = { ...this.wireCfg, ...config };
    const group = new THREE.Group();
    group.name = 'wire_loom';

    const curve = new THREE.CatmullRomCurve3(path);
    const loomGeo = new THREE.TubeGeometry(curve, path.length * 6, cfg.radius, cfg.segments, false);
    const loomMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.85 });
    const loom = new THREE.Mesh(loomGeo, loomMat);
    loom.name = 'loom_body';
    group.add(loom);

    const wrapGeo = new THREE.TorusGeometry(cfg.radius * 1.05, 0.0005, 4, cfg.segments);
    const wrapMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.06, 0.06, 0.06), roughness: 0.9 });
    for (let i = 0; i < path.length - 1; i += 2) {
      const t = i / (path.length - 1);
      const wrap = new THREE.Mesh(wrapGeo, wrapMat);
      const pos = curve.getPointAt(Math.min(t, 1));
      wrap.position.copy(pos);
      wrap.lookAt(curve.getPointAt(Math.min(t + 0.01, 1)));
      group.add(wrap);
    }

    return group;
  }

  generateCoolantFitting(diameter = 0.02): THREE.Group {
    const group = new THREE.Group();
    group.name = 'coolant_fitting';

    const bodyGeo = new THREE.CylinderGeometry(diameter / 2, diameter / 2, diameter, 16);
    const bodyMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.2, 0.4, 0.8), metalness: 0.85, roughness: 0.2, clearcoat: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    body.name = 'fitting_body';
    group.add(body);

    const collarGeo = new THREE.CylinderGeometry(diameter / 2 * 1.3, diameter / 2 * 1.3, diameter * 0.2, 16);
    const collarMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.8, 0.65, 0.2), metalness: 0.9, roughness: 0.15 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.z = diameter * 0.4;
    collar.name = 'fitting_collar';
    group.add(collar);

    return group;
  }

  generateOilFilter(diameter = 0.065, height = 0.1): THREE.Group {
    const group = new THREE.Group();
    group.name = 'oil_filter';

    const bodyGeo = new THREE.CylinderGeometry(diameter / 2, diameter / 2, height, 24);
    const bodyMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.15, 0.15, 0.15), metalness: 0.7, roughness: 0.3, clearcoat: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    body.name = 'filter_body';
    group.add(body);

    const labelGeo = new THREE.CylinderGeometry(diameter / 2 * 1.001, diameter / 2 * 1.001, height * 0.5, 24, 1, true);
    const labelMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.6, 0.1, 0.05), roughness: 0.5 });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.rotation.x = Math.PI / 2;
    label.name = 'filter_label';
    group.add(label);

    return group;
  }

  generateSparkPlug(length = 0.08, diameter = 0.014): THREE.Group {
    const group = new THREE.Group();
    group.name = 'spark_plug';

    const shellGeo = new THREE.CylinderGeometry(diameter / 2, diameter / 2, length * 0.5, 6);
    const shellMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.65, 0.63, 0.6), metalness: 0.95, roughness: 0.15 });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.name = 'plug_shell';
    group.add(shell);

    const insulatorGeo = new THREE.CylinderGeometry(diameter / 2 * 0.5, diameter / 2 * 0.5, length * 0.4, 12);
    const insulatorMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.95, 0.93, 0.9), metalness: 0.0, roughness: 0.2, clearcoat: 0.5 });
    const insulator = new THREE.Mesh(insulatorGeo, insulatorMat);
    insulator.position.y = length * 0.45;
    insulator.name = 'plug_insulator';
    group.add(insulator);

    return group;
  }
}

export const createDefaultEngineDetailEnhancer = () => new EngineGLBDetailEnhancer();
