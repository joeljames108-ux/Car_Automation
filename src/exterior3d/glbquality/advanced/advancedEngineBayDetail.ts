import * as THREE from "three";

export class AdvancedEngineBayDetail {
  buildHoses(g:THREE.Group):void{for(let i=0;i<6;i++){const pts=[new THREE.Vector3((i-2.5)*0.04,0.1,-0.3),new THREE.Vector3((i-2.5)*0.03,0.05,-0.2),new THREE.Vector3((i-2.5)*0.02,0,-0.1)];g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,0.004,6,false),new THREE.MeshStandardMaterial({color:i%2===0?0x222222:0x444444,roughness:0.7})));}}
  buildWires(g:THREE.Group):void{for(let i=0;i<4;i++){const pts=[new THREE.Vector3(-0.15+i*0.1,0.12,-0.25),new THREE.Vector3(-0.12+i*0.08,0.08,-0.15),new THREE.Vector3(-0.1+i*0.06,0.05,-0.05)];g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),8,0.0015,4,false),new THREE.MeshStandardMaterial({color:0x882200,roughness:0.6})));}}
  buildReservoirs(g:THREE.Group):void{g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.018,0.05,12),new THREE.MeshPhysicalMaterial({color:0x0066cc,transmission:0.7,roughness:0.1,ior:1.3}))).position.set(0.25,0.12,-0.2);g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.03,8),new THREE.MeshPhysicalMaterial({color:0xccaa00,transmission:0.5,roughness:0.2}))).position.set(-0.25,0.15,-0.3);}
  buildBelts(g:THREE.Group):void{const pts=[new THREE.Vector3(-0.05,0.02,-0.35),new THREE.Vector3(0.05,0.02,-0.35),new THREE.Vector3(0.05,0.05,-0.32),new THREE.Vector3(-0.05,0.05,-0.32)];g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),24,0.002,4,true),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.9})));}
  buildAirFilter(g:THREE.Group):void{g.add(new THREE.Mesh(new THREE.BoxGeometry(0.15,0.06,0.12),new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.7}))).position.set(0,0.15,-0.3);}
  buildECU(g:THREE.Group):void{g.add(new THREE.Mesh(new THREE.BoxGeometry(0.08,0.02,0.06),new THREE.MeshStandardMaterial({color:0x222222,roughness:0.5,metalness:0.3}))).position.set(-0.2,0.1,-0.15);}
  buildAll(g:THREE.Group):void{this.buildHoses(g);this.buildWires(g);this.buildReservoirs(g);this.buildBelts(g);this.buildAirFilter(g);this.buildECU(g);}
}
