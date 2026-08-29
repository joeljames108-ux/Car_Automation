import * as THREE from "three";

export class AdvancedInteriorCabin {
  buildDashboard(g:THREE.Group):void{
    const dash=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.12,0.35),new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.7}));dash.position.set(0,0.35,-0.5);g.add(dash);
    const cluster=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.1,0.02),new THREE.MeshPhysicalMaterial({color:0x111111,metalness:0.3,roughness:0.2}));cluster.position.set(-0.15,0.38,-0.35);g.add(cluster);
    for(let i=0;i<2;i++){const gauge=new THREE.Mesh(new THREE.RingGeometry(0.03,0.04,16),new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0.9,roughness:0.05}));gauge.position.set(-0.2+i*0.12,0.39,-0.34);g.add(gauge);}
    const screen=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.1,0.005),new THREE.MeshStandardMaterial({color:0x001133,emissive:0x001133,emissiveIntensity:0.5}));screen.position.set(0,0.37,-0.36);g.add(screen);
  }
  buildSteeringWheel(g:THREE.Group):void{
    const rim=new THREE.Mesh(new THREE.TorusGeometry(0.15,0.012,8,24),new THREE.MeshPhysicalMaterial({color:0x1a1a1a,roughness:0.8,metalness:0.1}));rim.position.set(-0.15,0.35,-0.25);g.add(rim);
    for(let i=0;i<3;i++){const a=(i/3)*Math.PI*2-Math.PI/2;const spoke=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.006,0.12),new THREE.MeshStandardMaterial({color:0x333333,metalness:0.7}));spoke.position.set(-0.15+Math.cos(a)*0.06,0.35+Math.sin(a)*0.06,-0.25);spoke.rotation.z=a;g.add(spoke);}
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.01,12),new THREE.MeshPhysicalMaterial({color:0x222222,metalness:0.5}));hub.position.set(-0.15,0.35,-0.25);g.add(hub);
  }
  buildSeats(g:THREE.Group):void{
    for(const x of [-0.2,0.2]){
      const seat=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.4,0.35),new THREE.MeshStandardMaterial({color:0x2a1a0a,roughness:0.85}));seat.position.set(x,0.15,0.1);g.add(seat);
      const back=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.35,0.08),new THREE.MeshStandardMaterial({color:0x2a1a0a,roughness:0.85}));back.position.set(x,0.3,0.25);back.rotation.x=0.15;g.add(back);
      const head=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.15,0.06),new THREE.MeshStandardMaterial({color:0x2a1a0a,roughness:0.85}));head.position.set(x,0.5,0.28);g.add(head);
      for(let r=0;r<4;r++){const stitch=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.002,0.003),new THREE.MeshStandardMaterial({color:0x4a3a2a}));stitch.position.set(x,0.1+r*0.08,0.18);g.add(stitch);}
    }
  }
  buildCenterConsole(g:THREE.Group):void{
    const console=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.15,0.5),new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.6}));console.position.set(0,0.15,0);g.add(console);
    const shifter=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.012,0.08,8),new THREE.MeshPhysicalMaterial({color:0x333333,metalness:0.6,roughness:0.3}));shifter.position.set(0,0.24,0.1);g.add(shifter);
    for(let i=0;i<6;i++){const btn=new THREE.Mesh(new THREE.CylinderGeometry(0.005,0.005,0.003,8),new THREE.MeshStandardMaterial({color:0x222222,roughness:0.5}));btn.position.set(-0.04+i*0.016,0.23,-0.05);g.add(btn);}
  }
  buildDoorPanels(g:THREE.Group):void{
    for(const side of [-1,1]){
      const panel=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.35,0.4),new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.7}));panel.position.set(side*0.55,0.2,0.1);g.add(panel);
      const handle=new THREE.Mesh(new THREE.BoxGeometry(0.008,0.012,0.08),new THREE.MeshPhysicalMaterial({color:0xcccccc,metalness:0.9,roughness:0.05}));handle.position.set(side*0.52,0.28,0.15);g.add(handle);
      for(let i=0;i<4;i++){const btn=new THREE.Mesh(new THREE.CylinderGeometry(0.004,0.004,0.003,6),new THREE.MeshStandardMaterial({color:0x333333}));btn.position.set(side*0.53,0.22,0.05+i*0.04);g.add(btn);}
    }
  }
  buildAmbientLighting(g:THREE.Group):void{
    for(const x of [-0.45,0.45]){
      const pts=[new THREE.Vector3(x,0.08,-0.3),new THREE.Vector3(x,0.08,0.3)];
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(pts[0],pts[1]),2,0.003,6,false),new THREE.MeshStandardMaterial({color:0xff6600,emissive:0xff6600,emissiveIntensity:0.5})));}
  }
  buildAll(g:THREE.Group):void{this.buildDashboard(g);this.buildSteeringWheel(g);this.buildSeats(g);this.buildCenterConsole(g);this.buildDoorPanels(g);this.buildAmbientLighting(g);}
}
