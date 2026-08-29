import * as THREE from "three";

export class AdvancedWheelAssembly {
  buildFullWheel(g:THREE.Group):void{this.buildRim(g);this.buildTire(g);this.buildBrakeDisc(g);this.buildCaliper(g);this.buildLugNuts(g);this.buildValveStem(g);}
  buildRim(g:THREE.Group):void{
    const m=new THREE.MeshPhysicalMaterial({color:0xcccccc,metalness:0.95,roughness:0.08});
    g.add(new THREE.Mesh(new THREE.TorusGeometry(0.22,0.012,8,32),m));
    g.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(0.18,0.008,6,24),m),{rotation:{...new THREE.Euler(),x:Math.PI/2}} as any));
    for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2;const s=new THREE.Mesh(new THREE.BoxGeometry(0.015,0.006,0.17),m);s.position.set(Math.cos(a)*0.11,0,Math.sin(a)*0.11);s.rotation.y=-a;g.add(s);}
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.02,16),m));
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.005,12),new THREE.MeshPhysicalMaterial({color:0xff2200,metalness:0.8,roughness:0.15}));cap.position.y=0.012;g.add(cap);
  }
  buildTire(g:THREE.Group):void{
    const t=new THREE.Mesh(new THREE.TorusGeometry(0.25,0.04,12,48),new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.85}));t.rotation.x=Math.PI/2;g.add(t);
    for(let i=0;i<32;i++){const a=(i/32)*Math.PI*2;const v=new THREE.Mesh(new THREE.BoxGeometry(0.002,0.045,0.008),new THREE.MeshStandardMaterial({color:0x0f0f0f}));v.position.set(Math.cos(a)*0.25,0,Math.sin(a)*0.25);v.rotation.y=a;g.add(v);}
  }
  buildBrakeDisc(g:THREE.Group):void{
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.008,32),new THREE.MeshPhysicalMaterial({color:0x666666,metalness:0.85,roughness:0.25})));
    for(let r=0;r<4;r++)for(let a=0;a<12;a++){const ang=(a/12)*Math.PI*2+r*0.15;const d=0.08+r*0.03;const h=new THREE.Mesh(new THREE.CylinderGeometry(0.002,0.002,0.01,6),new THREE.MeshStandardMaterial({color:0x333333}));h.position.set(Math.cos(ang)*d,0,Math.sin(ang)*d);g.add(h);}
    for(let i=0;i<20;i++){const a=(i/20)*Math.PI*2;const v=new THREE.Mesh(new THREE.BoxGeometry(0.002,0.005,0.06),new THREE.MeshStandardMaterial({color:0x555555,metalness:0.7}));v.position.set(Math.cos(a)*0.12,0,Math.sin(a)*0.12);v.rotation.y=a;g.add(v);}
  }
  buildCaliper(g:THREE.Group):void{
    const b=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.028,0.08),new THREE.MeshPhysicalMaterial({color:0xff2200,metalness:0.6,roughness:0.3}));b.position.z=0.15;g.add(b);
    for(let i=0;i<4;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.007,0.007,0.008,8),new THREE.MeshPhysicalMaterial({color:0xcccccc,metalness:0.9,roughness:0.1}));p.position.set(0,0,0.15+(i-1.5)*0.025);g.add(p);}
  }
  buildLugNuts(g:THREE.Group):void{for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2;const n=new THREE.Mesh(new THREE.CylinderGeometry(0.005,0.005,0.006,6),new THREE.MeshPhysicalMaterial({color:0xaaaaaa,metalness:0.9,roughness:0.1}));n.position.set(Math.cos(a)*0.03,0,Math.sin(a)*0.03);g.add(n);}}
  buildValveStem(g:THREE.Group):void{const s=new THREE.Mesh(new THREE.CylinderGeometry(0.003,0.002,0.025,6),new THREE.MeshStandardMaterial({color:0x333333,roughness:0.7}));s.position.set(0.23,0,0);g.add(s);}
}
