import * as THREE from "three";

export class AdvancedSuspensionSystem {
  buildCoilover(g:THREE.Group):void{const pts:THREE.Vector3[]=[],coils=8,oR=0.02,wR=0.003,fL=0.12,s=coils*24;for(let i=0;i<=s;i++){const t=i/s,a=t*coils*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*oR,t*fL-fL/2,Math.sin(a)*oR));}g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),s,wR,6,false),new THREE.MeshPhysicalMaterial({color:0x00aaff,metalness:0.8,roughness:0.2})));g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.1,12),new THREE.MeshPhysicalMaterial({color:0x333333,metalness:0.7,roughness:0.3})));}
  buildControlArm(g:THREE.Group):void{const mat=new THREE.MeshPhysicalMaterial({color:0x555555,metalness:0.6,roughness:0.35});const a1=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.008,0.015),mat);a1.rotation.y=0.3;a1.position.z=0.02;g.add(a1);const a2=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.008,0.015),mat);a2.rotation.y=-0.3;a2.position.z=-0.02;g.add(a2);}
  buildAntiRollBar(g:THREE.Group):void{const pts=[new THREE.Vector3(-0.3,0,0),new THREE.Vector3(-0.15,0.05,0),new THREE.Vector3(0,0.06,0),new THREE.Vector3(0.15,0.05,0),new THREE.Vector3(0.3,0,0)];g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),20,0.005,6,false),new THREE.MeshPhysicalMaterial({color:0x44aa44,metalness:0.7,roughness:0.3})));
  }
  buildAll(g:THREE.Group):void{this.buildCoilover(g);this.buildControlArm(g);this.buildAntiRollBar(g);}
}
