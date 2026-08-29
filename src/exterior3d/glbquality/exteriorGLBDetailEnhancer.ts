import * as THREE from 'three';

export interface PanelGapConfig { width: number; depth: number; color: THREE.Color; }
export interface PaintLayerConfig { baseThickness: number; clearcoatThickness: number; metallicFlake: boolean; pearlLayer: boolean; }
export interface WeatherSealConfig { width: number; height: number; color: THREE.Color; material: 'rubber' | 'foam' | 'silicone'; }

const DEFAULT_GAP: PanelGapConfig = { width: 0.002, depth: 0.001, color: new THREE.Color(0.01, 0.01, 0.01) };
const DEFAULT_PAINT: PaintLayerConfig = { baseThickness: 0.0001, clearcoatThickness: 0.00005, metallicFlake: true, pearlLayer: true };
const DEFAULT_SEAL: WeatherSealConfig = { width: 0.008, height: 0.004, color: new THREE.Color(0.03, 0.03, 0.03), material: 'rubber' };

export class ExteriorGLBDetailEnhancer {
  private gapCfg: PanelGapConfig;
  private paintCfg: PaintLayerConfig;
  private sealCfg: WeatherSealConfig;

  constructor(gap?: Partial<PanelGapConfig>, paint?: Partial<PaintLayerConfig>, seal?: Partial<WeatherSealConfig>) {
    this.gapCfg = { ...DEFAULT_GAP, ...gap };
    this.paintCfg = { ...DEFAULT_PAINT, ...paint };
    this.sealCfg = { ...DEFAULT_SEAL, ...seal };
  }

  generatePanelGap(path: THREE.Vector3[], config?: Partial<PanelGapConfig>): THREE.Mesh {
    const cfg = { ...this.gapCfg, ...config };
    const curve = new THREE.CatmullRomCurve3(path);
    const geo = new THREE.TubeGeometry(curve, Math.max(path.length * 4, 20), cfg.width / 2, 4, false);
    const mat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.95, metalness: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'panel_gap';
    return mesh;
  }

  generateDoorHandle(length = 0.12, width = 0.02, depth = 0.01): THREE.Group {
    const group = new THREE.Group();
    group.name = 'door_handle';

    const handleShape = new THREE.Shape();
    handleShape.moveTo(0, -width / 2);
    handleShape.lineTo(length, -width / 2);
    handleShape.quadraticCurveTo(length + depth, 0, length, width / 2);
    handleShape.lineTo(0, width / 2);
    handleShape.quadraticCurveTo(-depth, 0, 0, -width / 2);

    const handleGeo = new THREE.ExtrudeGeometry(handleShape, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.001, bevelSegments: 3 });
    const handleMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.85, 0.83, 0.78), metalness: 1.0, roughness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.02 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.name = 'handle_body';
    group.add(handle);

    return group;
  }

  generateFuelCap(diameter = 0.05): THREE.Group {
    const group = new THREE.Group();
    group.name = 'fuel_cap';

    const capGeo = new THREE.CylinderGeometry(diameter / 2, diameter / 2, 0.008, 32);
    const capMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.1, 0.1, 0.1), metalness: 0.8, roughness: 0.2, clearcoat: 0.5 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.rotation.x = Math.PI / 2;
    group.add(cap);

    const ringGeo = new THREE.TorusGeometry(diameter / 2 * 0.95, 0.001, 8, 32);
    const ringMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.7, 0.7, 0.7), metalness: 1.0, roughness: 0.03 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.z = 0.004;
    group.add(ring);

    return group;
  }

  generateExhaustTip(innerR = 0.03, outerR = 0.035, length = 0.08): THREE.Group {
    const group = new THREE.Group();
    group.name = 'exhaust_tip';

    const outerGeo = new THREE.CylinderGeometry(outerR, outerR, length, 32, 1, true);
    const outerMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.6, 0.6, 0.6), metalness: 1.0, roughness: 0.08, clearcoat: 0.3 });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    outer.rotation.x = Math.PI / 2;
    outer.name = 'outer_shell';
    group.add(outer);

    const innerGeo = new THREE.CylinderGeometry(innerR, innerR, length * 0.9, 32, 1, true);
    const innerMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.05, 0.05, 0.05), roughness: 0.8, side: THREE.BackSide });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.rotation.x = Math.PI / 2;
    inner.name = 'inner_shell';
    group.add(inner);

    const lipGeo = new THREE.TorusGeometry(outerR, 0.002, 8, 32);
    const lipMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.75, 0.73, 0.7), metalness: 1.0, roughness: 0.05 });
    const lip = new THREE.Mesh(lipGeo, lipMat);
    lip.position.z = length / 2;
    lip.name = 'tip_lip';
    group.add(lip);

    return group;
  }

  generateReflector(diameter = 0.03): THREE.Group {
    const group = new THREE.Group();
    group.name = 'reflector';

    const reflectorGeo = new THREE.SphereGeometry(diameter / 2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const reflectorMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0.8, 0.1, 0.05), metalness: 0.1, roughness: 0.05,
      clearcoat: 1.0, clearcoatRoughness: 0.01, envMapIntensity: 2.0,
      emissive: new THREE.Color(0.3, 0.02, 0.01), emissiveIntensity: 0.2,
    });
    const reflector = new THREE.Mesh(reflectorGeo, reflectorMat);
    group.add(reflector);

    const bezelGeo = new THREE.RingGeometry(diameter / 2 * 0.9, diameter / 2 * 1.1, 32);
    const bezelMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.15, 0.15, 0.15), metalness: 0.8, roughness: 0.2 });
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.position.z = 0.0001;
    group.add(bezel);

    return group;
  }

  generateSideSkirt(length: number, height = 0.03, depth = 0.05): THREE.Mesh {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(length, 0);
    shape.lineTo(length, height);
    shape.quadraticCurveTo(length * 0.9, height * 1.5, length * 0.7, height);
    shape.lineTo(0, height * 0.8);
    shape.lineTo(0, 0);

    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 4 });
    const mat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.08, 0.08, 0.08), metalness: 0.1, roughness: 0.3, clearcoat: 0.4 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'side_skirt';
    return mesh;
  }

  generateWindshieldWiper(length = 0.5): THREE.Group {
    const group = new THREE.Group();
    group.name = 'windshield_wiper';

    const armPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(length * 0.3, 0.01, 0),
      new THREE.Vector3(length * 0.7, 0.02, 0),
      new THREE.Vector3(length, 0.015, 0),
    ];
    const armCurve = new THREE.CatmullRomCurve3(armPoints);
    const armGeo = new THREE.TubeGeometry(armCurve, 20, 0.002, 6, false);
    const armMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.05, 0.05, 0.05), roughness: 0.7 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.name = 'wiper_arm';
    group.add(arm);

    const bladePoints = [
      new THREE.Vector3(length * 0.15, 0.012, 0.001),
      new THREE.Vector3(length * 0.85, 0.018, 0.001),
    ];
    const bladeCurve = new THREE.CatmullRomCurve3(bladePoints);
    const bladeGeo = new THREE.TubeGeometry(bladeCurve, 10, 0.001, 4, false);
    const bladeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.02, 0.02), roughness: 0.95 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.name = 'wiper_blade';
    group.add(blade);

    const pivotGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.01, 16);
    const pivotMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.1, 0.1, 0.1), metalness: 0.8, roughness: 0.2 });
    const pivot = new THREE.Mesh(pivotGeo, pivotMat);
    pivot.rotation.x = Math.PI / 2;
    pivot.name = 'wiper_pivot';
    group.add(pivot);

    return group;
  }

  generateAntenna(length = 0.08, baseR = 0.005): THREE.Group {
    const group = new THREE.Group();
    group.name = 'antenna';

    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.002, length * 0.7, 0),
      new THREE.Vector3(0, length, 0),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const antennaGeo = new THREE.TubeGeometry(curve, 16, 0.001, 6, false);
    const antennaMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.3, 0.3, 0.3), metalness: 0.9, roughness: 0.15 });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    group.add(antenna);

    const baseGeo = new THREE.CylinderGeometry(baseR, baseR * 1.3, 0.008, 16);
    const baseMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.15, 0.15, 0.15), metalness: 0.7, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    group.add(base);

    const tipGeo = new THREE.SphereGeometry(0.002, 8, 8);
    const tipMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.2, 0.2, 0.2), metalness: 0.9, roughness: 0.1 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = length;
    group.add(tip);

    return group;
  }
}

export const createDefaultExteriorDetailEnhancer = () => new ExteriorGLBDetailEnhancer();
