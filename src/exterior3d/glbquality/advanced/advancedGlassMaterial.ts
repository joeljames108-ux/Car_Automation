import * as THREE from "three";

export class AdvancedGlassMaterial {
  buildWindshield(g:THREE.Group):void{const geo=new THREE.PlaneGeometry(1.4,0.5,12,6),pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);pos.setZ(i,-Math.pow(x/0.7,2)*0.08-y*0.15);}geo.computeVertexNormals();g.add(new THREE.Mesh(geo,new THREE.MeshPhysicalMaterial({color:0xaaccff,transmission:0.85,ior:1.52,thickness:0.004,roughness:0.05,side:THREE.DoubleSide}))).rotation.x=-Math.PI/2-0.25;}
  buildSideWindows(g:THREE.Group):void{for(const side of [-1,1]){const fw=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.3,6,4),new THREE.MeshPhysicalMaterial({color:0xaaccff,transmission:0.85,ior:1.52,thickness:0.004,roughness:0.05,side:THREE.DoubleSide}));fw.rotation.x=-Math.PI/2-0.1;fw.position.set(0,0.4,side*0.72);g.add(fw);}}
  buildRearWindow(g:THREE.Group):void{g.add(new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.35,8,4),new THREE.MeshPhysicalMaterial({color:0x88aacc,transmission:0.75,ior:1.52,thickness:0.004,roughness:0.08,side:THREE.DoubleSide}))).rotation.x=-Math.PI/2+0.3;}
  buildSunroof(g:THREE.Group):void{g.add(new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.5,6,4),new THREE.MeshPhysicalMaterial({color:0x99bbdd,transmission:0.8,ior:1.52,thickness:0.005,roughness:0.03,side:THREE.DoubleSide}))).rotation.x=-Math.PI/2;}
  buildAll(g:THREE.Group):void{this.buildWindshield(g);this.buildSideWindows(g);this.buildRearWindow(g);this.buildSunroof(g);}
}
