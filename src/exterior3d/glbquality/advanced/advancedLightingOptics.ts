import * as THREE from "three";

export class AdvancedLightingOptics {
  buildHeadlight(g:THREE.Group):void{
    const lens=new THREE.Mesh(new THREE.SphereGeometry(0.08,16,16,0,Math.PI),new THREE.MeshPhysicalMaterial({color:0xffffff,transmission:0.9,roughness:0.05,ior:1.5,thickness:0.01}));g.add(lens);
    const ref=new THREE.Mesh(new THREE.SphereGeometry(0.06,12,12,0,Math.PI),new THREE.MeshStandardMaterial({color:0xffffff,metalness:1.0,roughness:0.02}));ref.position.z=0.02;g.add(ref);
    const chip=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.01,0.005),new THREE.MeshStandardMaterial({color:0xffffdd,emissive:0xffffdd,emissiveIntensity:2.0}));chip.position.z=0.04;g.add(chip);
    const h=new THREE.Mesh(new THREE.CylinderGeometry(0.085,0.07,0.1,16),new THREE.MeshStandardMaterial({color:0x222222,roughness:0.6,metalness:0.3}));h.rotation.x=Math.PI/2;h.position.z=-0.05;g.add(h);
  }
  buildTaillight(g:THREE.Group):void{
    for(let i=0;i<12;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(0.015,0.008,0.003),new THREE.MeshStandardMaterial({color:0xff0000,emissive:0xff0000,emissiveIntensity:1.5}));l.position.set((i-5.5)*0.018,0,0);g.add(l);}
    const lens=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.04,0.005),new THREE.MeshPhysicalMaterial({color:0xff0000,transmission:0.6,roughness:0.1,ior:1.5}));lens.position.z=0.005;g.add(lens);
    const brake=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.03,0.003),new THREE.MeshStandardMaterial({color:0xff2200,emissive:0xff2200,emissiveIntensity:2.0}));brake.position.z=-0.003;g.add(brake);
  }
  buildDRL(g:THREE.Group):void{
    const curve=new THREE.CurvePath<THREE.Vector3>();
    curve.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.08,0.04,0),new THREE.Vector3(-0.05,0.06,0),new THREE.Vector3(0,0.06,0)));
    curve.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,0.06,0),new THREE.Vector3(0.05,0.06,0),new THREE.Vector3(0.08,0.04,0)));
    const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,20,0.003,6,false),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:1.8}));g.add(tube);
  }
  buildFogLight(g:THREE.Group):void{
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.035,0.02,12),new THREE.MeshPhysicalMaterial({color:0xffffcc,transmission:0.8,roughness:0.05,ior:1.5})));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.01,8,8),new THREE.MeshStandardMaterial({color:0xffffcc,emissive:0xffffaa,emissiveIntensity:2.0})));
  }
  buildTurnSignal(g:THREE.Group):void{for(let i=0;i<5;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(0.006,0.006,0.002),new THREE.MeshStandardMaterial({color:0xffaa00,emissive:0xffaa00,emissiveIntensity:1.5}));l.position.set(i*0.01,0,0);g.add(l);}}
  buildAll(g:THREE.Group):void{this.buildHeadlight(g);this.buildTaillight(g);this.buildDRL(g);this.buildFogLight(g);this.buildTurnSignal(g);}
}
