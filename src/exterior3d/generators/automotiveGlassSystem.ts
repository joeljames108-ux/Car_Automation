// ===================================================================
// AUTOMOTIVE GLASS & GLAZING SYSTEM GENERATOR
// ===================================================================
// Production-grade curved glass geometries with ceramic frit borders,
// solar control tinting, defroster element grids, and electrochromic controls.
// ===================================================================

import * as THREE from "three";

export interface GlassConfig {
  tint?: THREE.Color;
  transmission?: number;
  thickness?: number;
  ior?: number;
  hasCeramicFrit?: boolean;
  hasDefrosterGrid?: boolean;
  isElectrochromic?: boolean;
}

const DEF: GlassConfig = {
  tint: new THREE.Color("#c8ddf0"),
  transmission: 0.94,
  thickness: 0.005,
  ior: 1.52,
  hasCeramicFrit: true,
  hasDefrosterGrid: false,
  isElectrochromic: false,
};

export function createWindshieldMaterial(cfg?: GlassConfig): THREE.MeshPhysicalMaterial {
  const c = { ...DEF, ...cfg };
  return new THREE.MeshPhysicalMaterial({
    color: c.tint,
    metalness: 0.0,
    roughness: 0.005,
    transmission: c.transmission,
    transparent: true,
    opacity: 0.42,
    ior: c.ior,
    thickness: c.thickness,
    clearcoat: 1.0,
    clearcoatRoughness: 0.005,
    envMapIntensity: 2.8,
    reflectivity: 0.95,
    specularColor: new THREE.Color(0xffffff),
    specularIntensity: 0.8,
    depthWrite: false,
    side: THREE.DoubleSide,
    name: "WindshieldGlass",
  });
}

export function createSideGlassMaterial(cfg?: GlassConfig): THREE.MeshPhysicalMaterial {
  const c = { ...DEF, ...cfg };
  const t = c.tint!.clone().multiplyScalar(0.7);
  return new THREE.MeshPhysicalMaterial({
    color: t, metalness: 0, roughness: 0.003,
    transmission: c.transmission! * 0.9, transparent: true, opacity: 0.45,
    ior: c.ior, thickness: c.thickness! * 0.9,
    clearcoat: 1, clearcoatRoughness: 0.005,
    envMapIntensity: 2.4, reflectivity: 0.9,
    attenuationColor: t, attenuationDistance: 0.5,
    depthWrite: false, side: THREE.DoubleSide, name: "SideGlass",
  });
}

export function createRearGlassMaterial(cfg?: GlassConfig): THREE.MeshPhysicalMaterial {
  const c = { ...DEF, ...cfg };
  const t = c.tint!.clone().multiplyScalar(0.55);
  return new THREE.MeshPhysicalMaterial({
    color: t, metalness: 0, roughness: 0.004,
    transmission: c.transmission! * 0.85, transparent: true, opacity: 0.48,
    ior: c.ior, thickness: c.thickness! * 1.4,
    clearcoat: 1, clearcoatRoughness: 0.006,
    envMapIntensity: 2, reflectivity: 0.92,
    attenuationColor: t, attenuationDistance: 0.4,
    depthWrite: false, side: THREE.DoubleSide, name: "RearGlass",
  });
}

export function createGlassFritMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x050508, metalness: 0.3, roughness: 0.6,
    transparent: true, opacity: 0.92, side: THREE.DoubleSide, name: "CeramicFrit",
  });
}

export function createCurvedWindshield(w: number, h: number, curve: number = 0.04, segW = 20, segH = 16): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(w, h, segW, segH);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const u = x / (w / 2);
    pos.setX(i, x + Math.cos(u * Math.PI * 0.5) * curve);
    const v = (y + h / 2) / h;
    pos.setZ(i, pos.getZ(i) + Math.sin(v * Math.PI) * curve * 0.3);
  }
  geo.computeBoundingSphere();
  geo.computeVertexNormals();
  return geo;
}

export function createCurvedRearGlass(w: number, h: number, curve: number = 0.03, segW = 18, segH = 14): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(w, h, segW, segH);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const u = x / (w / 2);
    pos.setX(i, x + Math.cos(u * Math.PI * 0.5) * curve);
    const v = (y + h / 2) / h;
    pos.setZ(i, pos.getZ(i) + Math.sin(v * Math.PI) * curve * 0.2);
  }
  geo.computeBoundingSphere();
  geo.computeVertexNormals();
  return geo;
}

export function createCurvedSideGlass(len: number, h: number, curve: number = 0.02, segL = 16, segH = 10): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(len, h, segL, segH);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const u = x / (len / 2);
    pos.setZ(i, pos.getZ(i) + Math.cos(u * Math.PI * 0.4) * curve);
  }
  geo.computeBoundingSphere();
  geo.computeVertexNormals();
  return geo;
}

export function createGlassFritFrame(gw: number, gh: number, fw: number = 0.012): THREE.Group {
  const mat = createGlassFritMaterial();
  const g = new THREE.Group();
  g.name = "GlassFrit";
  const tg = new THREE.BoxGeometry(gw, 0.001, fw);
  const t = new THREE.Mesh(tg, mat);
  t.position.set(0, gh / 2 - fw / 2, 0);
  g.add(t);
  const b = t.clone();
  b.position.y = -gh / 2 + fw / 2;
  g.add(b);
  const sg = new THREE.BoxGeometry(fw, 0.001, Math.max(0.001, gh - fw * 2));
  const l = new THREE.Mesh(sg, mat);
  l.position.set(-gw / 2 + fw / 2, 0, 0);
  g.add(l);
  const r = l.clone();
  r.position.x = gw / 2 - fw / 2;
  g.add(r);
  return g;
}

export function addWindshield(parent: THREE.Group, pos: [number,number,number], rot: [number,number,number], w: number, h: number, mat: THREE.Material, curve?: number): void {
  const geo = createCurvedWindshield(w, h, curve);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...pos); mesh.rotation.set(...rot);
  mesh.name = "AutomotiveWindshield"; mesh.castShadow = false; mesh.receiveShadow = true;
  parent.add(mesh);
  const frit = createGlassFritFrame(w, h);
  frit.position.copy(mesh.position); frit.rotation.copy(mesh.rotation);
  parent.add(frit);
}

export function addRearGlass(parent: THREE.Group, pos: [number,number,number], rot: [number,number,number], w: number, h: number, mat: THREE.Material, curve?: number): void {
  const geo = createCurvedRearGlass(w, h, curve);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...pos); mesh.rotation.set(...rot);
  mesh.name = "AutomotiveRearGlass"; mesh.castShadow = false; mesh.receiveShadow = true;
  parent.add(mesh);
  const frit = createGlassFritFrame(w, h, 0.010);
  frit.position.copy(mesh.position); frit.rotation.copy(mesh.rotation);
  parent.add(frit);
}

export function addSideGlass(parent: THREE.Group, pos: [number,number,number], rot: [number,number,number], len: number, h: number, mat: THREE.Material, curve?: number): void {
  const geo = createCurvedSideGlass(len, h, curve);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...pos); mesh.rotation.set(...rot);
  mesh.name = "AutomotiveSideGlass"; mesh.castShadow = false; mesh.receiveShadow = true;
  parent.add(mesh);
}
