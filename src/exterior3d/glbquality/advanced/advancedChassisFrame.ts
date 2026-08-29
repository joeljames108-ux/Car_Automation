import * as THREE from "three";

export class AdvancedChassisFrame {
  buildFrameRails(g:THREE.Group):void{const mat=new THREE.MeshPhysicalMaterial({color:0x555555,metalness:0.6,roughness:0.35});for(const side of [-1,1]){const rail=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.08,2.0),mat);rail.position.x=side*0.35;g.add(rail);for(let i=0;i<6;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(0.024,0.024,0.04),new THREE.MeshStandardMaterial({color:0x222222}));c.position.set(side*0.35,0,(i-2.5)*0.32);g.add(c);}}}
  buildCrossMembers(g:THREE.Group):void{const mat=new THREE.MeshPhysicalMaterial({color:0x555555,metalness:0.5,roughness:0.4});for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.03,0.02),mat);m.position.set(0,-0.02,(i-3.5)*0.25);g.add(m);}}
  buildFloorPan(g:THREE.Group):void{g.add(new THREE.Mesh(new THREE.BoxGeometry(0.8,0.005,2.0),new THREE.MeshPhysicalMaterial({color:0x333333,metalness:0.4,roughness:0.5}))).position.y=-0.04;for(let i=0;i<10;i++){const r=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.015,0.003),new THREE.MeshStandardMaterial({color:0x444444,metalness:0.5}));r.position.set(0,-0.038,(i-4.5)*0.2);g.add(r);}}
  buildFirewall(g:THREE.Group):void{g.add(new THREE.Mesh(new THREE.BoxGeometry(0.7,0.25,0.008),new THREE.MeshStandardMaterial({color:0x444444,metalness:0.3,roughness:0.6}))).position.set(0,0.05,-0.95);for(const x of [-0.15,0,0.15]){const gt=new THREE.Mesh(new THREE.TorusGeometry(0.015,0.003,8,12),new THREE.MeshStandardMaterial({color:0x222222,roughness:0.8}));gt.position.set(x,0.05,-0.94);g.add(gt);}}
  buildAll(g:THREE.Group):void{this.buildFrameRails(g);this.buildCrossMembers(g);this.buildFloorPan(g);this.buildFirewall(g);}
}
