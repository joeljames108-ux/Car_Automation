// AUTOMOTIVE DASHBOARD CURVATURE SYSTEM
import * as THREE from "three";

export function createDashboardCowlGeometry(w: number, h: number, d: number, gx=32, gy=16): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(w, d, gx, gy); geo.rotateX(-Math.PI/2);
  const p = geo.attributes.position;
  for(let i=0;i<p.count;i++){const px=p.getX(i),pz=p.getZ(i);const uc=(px/w)*2,vc=(pz/d)*2;
    p.setY(i,(1-vc*vc)*0.015 - uc*uc*0.008 - Math.pow(Math.abs(uc),3)*0.012);}
  geo.computeVertexNormals(); return geo;
}

export function createSeatCushionGeometry(w: number, h: number, d: number, bolstered=true, gx=20, gy=12): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(w, d, gx, gy); geo.rotateX(-Math.PI/2);
  const p = geo.attributes.position;
  for(let i=0;i<p.count;i++){const px=p.getX(i),pz=p.getZ(i);const u=(px+w/2)/w;const v=(pz+d/2)/d;const uc=(u-0.5)*2;
    p.setY(i, Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*0.012 + uc*uc*(bolstered?0.025:0.01) + Math.max(0,uc)*0.008);}
  geo.computeVertexNormals(); return geo;
}

export function createSeatbackGeometry(w: number, h: number, d: number, bolstered=true, gx=16, gy=20): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(w, h, gx, gy);
  const p = geo.attributes.position;
  for(let i=0;i<p.count;i++){const px=p.getX(i),py=p.getY(i);const u=(px+w/2)/w;const v=(py+h/2)/h;const uc=(u-0.5)*2;
    p.setZ(i, Math.pow(Math.abs(uc),1.8)*(bolstered?0.022:0.008) + Math.max(0,0.012-Math.abs(v+0.3)*0.03) + Math.max(0,0.008-Math.abs(v-0.6)*0.02) - Math.exp(-Math.pow(uc/0.1,2))*0.005);}
  geo.computeVertexNormals(); return geo;
}

export function createHeadrestGeometry(w: number, h: number, d: number, gx=12, gy=12): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(w, h, gx, gy);
  const p = geo.attributes.position;
  for(let i=0;i<p.count;i++){const px=p.getX(i),py=p.getY(i);const u=(px+w/2)/w;const v=(py+h/2)/h;const uc=(u-0.5)*2;
    p.setZ(i, Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*0.018 - uc*uc*0.008);}
  geo.computeVertexNormals(); return geo;
}

export function createCenterConsoleGeometry(l: number, w: number, h: number, gx=20, gy=12): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(l, w, gx, gy); geo.rotateX(-Math.PI/2);
  const p = geo.attributes.position;
  for(let i=0;i<p.count;i++){const px=p.getX(i),pz=p.getZ(i);const u=(px+l/2)/l;const v=(pz+w/2)/w;const vc=(v-0.5)*2;
    p.setY(i, (1-vc*vc)*0.012 + Math.exp(-Math.pow((u-0.3)/0.15,2))*0.015 + Math.exp(-Math.pow((u+0.5)/0.25,2))*0.018);}
  geo.computeVertexNormals(); return geo;
}

export function createDoorCardGeometry(w: number, h: number, d: number, gx=16, gy=16): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(w, h, gx, gy);
  const p = geo.attributes.position;
  for(let i=0;i<p.count;i++){const px=p.getX(i),py=p.getY(i);const u=(px+w/2)/w;const v=(py+h/2)/h;
    p.setZ(i, Math.exp(-Math.pow((v-0.6)/0.15,2))*0.02 - Math.exp(-Math.pow((u+0.4)/0.2,2))*Math.exp(-Math.pow((v+0.5)/0.2,2))*0.008 + Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*0.006);}
  geo.computeVertexNormals(); return geo;
}

export function createDashboardBolsterGeometry(w: number, h: number, d: number, gx=20, gy=12): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(w, d, gx, gy); geo.rotateX(-Math.PI/2);
  const p = geo.attributes.position;
  for(let i=0;i<p.count;i++){const px=p.getX(i),pz=p.getZ(i);const uc=(px/w)*2,vc=(pz/d)*2;
    p.setY(i,(1-vc*vc)*0.012 + Math.exp(-Math.pow(uc/0.3,2))*0.018);}
  geo.computeVertexNormals(); return geo;
}

export function createDashboardTrimGeometry(w: number, h: number, d: number, gx=16, gy=8): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(w, h, d, gx, 2, gy);
  geo.computeVertexNormals(); return geo;
}

export function createGT3DashShellGeometry(w: number, h: number, d: number, gx=24, gy=16): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(w, h, d, gx, gy, 4);
  geo.computeVertexNormals(); return geo;
}

