// ENGINE DETAIL SYSTEMS
import * as THREE from "three";
const M={
  steel:()=>new THREE.MeshStandardMaterial({color:0x4a4a50,roughness:0.30,metalness:0.88}),
  alum:()=>new THREE.MeshStandardMaterial({color:0xb8b8c0,roughness:0.22,metalness:0.82}),
  ss:()=>new THREE.MeshStandardMaterial({color:0xc0c0c8,roughness:0.15,metalness:0.92}),
  cop:()=>new THREE.MeshStandardMaterial({color:0xb87333,roughness:0.35,metalness:0.80}),
  rub:()=>new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.90,metalness:0.0}),
  sil:()=>new THREE.MeshStandardMaterial({color:0xcc3333,roughness:0.60,metalness:0.05}),
  blk:()=>new THREE.MeshStandardMaterial({color:0x1a1a1e,roughness:0.50,metalness:0.70}),
  brz:()=>new THREE.MeshStandardMaterial({color:0xc5a55a,roughness:0.25,metalness:0.78}),
  clip:()=>new THREE.MeshStandardMaterial({color:0x333338,roughness:0.45,metalness:0.08}),
};
