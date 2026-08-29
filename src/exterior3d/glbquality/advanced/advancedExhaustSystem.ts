import * as THREE from "three";

export class AdvancedExhaustSystem {
  buildHeaders(g:THREE.Group):void{for(let i=0;i<6;i++){const pts=[new THREE.Vector3((i-2.5)*0.04,0,-0.2),new THREE.Vector3((i-2.5)*0.03,-0.05,-0.15),new THREE.Vector3((i-2.5)*0.02,-0.1,-0.08),new THREE.Vector3(0,-0.12,0)];g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,0.008,8,false),new THREE.MeshPhysicalMaterial({color:0x884422,metalness:0.8,roughness:0.35})));}g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.015,0.08,8),new THREE.MeshPhysicalMaterial({color:0x773311,metalness:0.75,roughness:0.4})));}
  buildMuffler(g:THREE.Group):void{const s=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.3,16),new THREE.MeshPhysicalMaterial({color:0x999999,metalness:0.85,roughness:0.2}));s.rotation.x=Math.PI/2;g.add(s);for(const z of [-0.175,0.175]){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,0.05,8),new THREE.MeshStandardMaterial({color:0x888888,metalness:0.8}));p.rotation.x=Math.PI/2;p.position.z=z+(z>0?0.025:-0.025);g.add(p);}}
  buildTips(g:THREE.Group):void{for(const x of [-0.04,0.04]){g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.022,0.04,12),new THREE.MeshPhysicalMaterial({color:0xcccccc,metalness:0.95,roughness:0.05})));} g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.017,0.03,12),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.9})));}
  buildCat(g:THREE.Group):void{g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.12,12),new THREE.MeshStandardMaterial({color:0x777777,metalness:0.7,roughness:0.4})));}
  buildAll(g:THREE.Group):void{this.buildHeaders(g);this.buildMuffler(g);this.buildTips(g);this.buildCat(g);}
}
