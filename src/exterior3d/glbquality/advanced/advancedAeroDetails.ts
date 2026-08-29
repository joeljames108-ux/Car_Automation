import * as THREE from "three";

export class AdvancedAeroDetails {
  buildSplitter(g:THREE.Group):void{g.add(new THREE.Mesh(new THREE.BoxGeometry(1.8,0.008,0.15),new THREE.MeshPhysicalMaterial({color:0x1a1a1a,roughness:0.3,metalness:0.4}))).position.set(0,0.06,-1.8);for(let i=0;i<8;i++){const v=new THREE.Mesh(new THREE.BoxGeometry(0.005,0.04,0.08),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.4}));v.position.set((i-3.5)*0.2,0.05,-1.85);g.add(v);}}
  buildDiffuser(g:THREE.Group):void{for(let i=0;i<6;i++){const v=new THREE.Mesh(new THREE.BoxGeometry(0.005,0.06,0.2),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.4}));v.position.set((i-2.5)*0.12,0.05,1.7);g.add(v);}}
  buildSideSkirts(g:THREE.Group):void{for(const s of [-1,1]){const sk=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.008,0.06),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.5}));sk.position.set(0,0.05,s*0.85);g.add(sk);}}
  buildVortexGenerators(g:THREE.Group):void{for(let i=0;i<6;i++){for(const s of [-1,1]){const vg=new THREE.Mesh(new THREE.ConeGeometry(0.01,0.02,3),new THREE.MeshStandardMaterial({color:0x222222,roughness:0.5}));vg.position.set(-0.8+i*0.15,0.56,s*0.55);g.add(vg);}}}
  buildUndertray(g:THREE.Group):void{g.add(new THREE.Mesh(new THREE.BoxGeometry(1.6,0.003,2.0),new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.4}))).position.y=-0.01;}
  buildAll(g:THREE.Group):void{this.buildSplitter(g);this.buildDiffuser(g);this.buildSideSkirts(g);this.buildVortexGenerators(g);this.buildUndertray(g);}
}
