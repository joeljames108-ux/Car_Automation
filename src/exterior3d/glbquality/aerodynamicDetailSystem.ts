import * as THREE from "three";

export class AerodynamicDetailSystem {
  generateFrontSplitter(width = 1.6, depth = 0.15): THREE.Group {
    const g = new THREE.Group(); g.name = "front_splitter";
    const s = new THREE.Shape(); s.moveTo(-width/2,0); s.lineTo(width/2,0);
    s.lineTo(width/2-0.05,-depth); s.quadraticCurveTo(0,-depth-0.03,-width/2+0.05,-depth);
    s.lineTo(-width/2,0);
    const m = new THREE.MeshPhysicalMaterial({color:new THREE.Color(0.04,0.04,0.04),metalness:0.1,roughness:0.3,clearcoat:0.4});
    g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:0.008,bevelEnabled:true,bevelThickness:0.001,bevelSize:0.001,bevelSegments:2}),m));
    for(const side of[-1,1]){const e=new THREE.Mesh(new THREE.BoxGeometry(0.008,depth*0.8,0.04),m);e.position.set(side*width/2,-depth*0.4,0.015);g.add(e);}
    return g;
  }
  generateRearDiffuser(channels=5): THREE.Group {
    const g = new THREE.Group(); g.name="rear_diffuser";
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.4,0.005,0.3),new THREE.MeshPhysicalMaterial({color:new THREE.Color(0.04,0.04,0.04),metalness:0.1,roughness:0.3})));
    for(let c=0;c<channels;c++){const v=new THREE.Mesh(new THREE.BoxGeometry(0.004,0.005,0.27),new THREE.MeshPhysicalMaterial({color:new THREE.Color(0.06,0.06,0.06)}));v.position.set((c-(channels-1)/2)*0.28,0,0);g.add(v);}
    return g;
  }
  generateRearWing(span=1.4,chord=0.12): THREE.Group {
    const g = new THREE.Group(); g.name="rear_wing";
    const ws=new THREE.Shape(); ws.moveTo(0,0); ws.quadraticCurveTo(chord*0.5,chord*0.08,chord,0); ws.quadraticCurveTo(chord*0.5,-chord*0.02,0,0);
    const m=new THREE.MeshPhysicalMaterial({color:new THREE.Color(0.04,0.04,0.04),metalness:0.1,roughness:0.3,clearcoat:0.4});
    const w=new THREE.Mesh(new THREE.ExtrudeGeometry(ws,{depth:span,bevelEnabled:true,bevelThickness:0.002,bevelSize:0.002,bevelSegments:4}),m);
    w.position.z=-span/2; w.rotation.x=8*Math.PI/180; g.add(w);
    for(const side of[-1,1]){const e=new THREE.Mesh(new THREE.BoxGeometry(0.006,chord*1.5,span*0.08),m);e.position.set(chord*0.3,0.03,side*span/2);g.add(e);}
    return g;
  }
  generateCanard(length=0.15,width=0.06): THREE.Group {
    const g=new THREE.Group(); g.name="canard";
    const s=new THREE.Shape(); s.moveTo(0,0); s.lineTo(length,width*0.3); s.lineTo(length,width*0.4);
    s.quadraticCurveTo(length*0.5,width,0,width*0.6); s.lineTo(0,0);
    g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:0.004,bevelEnabled:true,bevelThickness:0.001,bevelSize:0.001,bevelSegments:2}),new THREE.MeshPhysicalMaterial({color:new THREE.Color(0.04,0.04,0.04),metalness:0.1,roughness:0.3,clearcoat:0.4})));
    return g;
  }
}
export const createAerodynamicDetailSystem=()=>new AerodynamicDetailSystem();
