// ===========================================================================
// CHASSIS STRUCTURAL GEOMETRY - CURVED RAILS, TUNNELS & SUBFRAMES
// ===========================================================================
import * as THREE from "three";

export interface StructuralDimensions {
  wheelbaseM: number; trackFrontM: number; trackRearM: number;
  rideHeightM: number; chassisWidth: number;
  frontOverhangM: number; rearOverhangM: number;
}

export class ChassisStructuralGeometry {

  static buildCurvedFrameRails(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "CurvedFrameRails";
    const ht = d.chassisWidth / 2 * 0.48;
    const fx = d.wheelbaseM * 0.5 + d.frontOverhangM;
    const rx = -(d.wheelbaseM * 0.5 + d.rearOverhangM);
    const cy = d.rideHeightM + 0.12;
    for (const side of [-1, 1]) {
      const z = side * ht;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 32; i++) {
        const t = i / 32;
        const x = fx + t * (rx - fx);
        const yo = Math.sin(t * Math.PI) * 0.025;
        const zo = side * ht * 0.05 * Math.sin(t * Math.PI);
        pts.push(new THREE.Vector3(x, cy + yo, z + zo));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 48, 0.032, 8, false);
      const rail = new THREE.Mesh(geo, mat);
      rail.name = "FrameRail_" + (side < 0 ? "L" : "R");
      rail.castShadow = true; rail.receiveShadow = true;
      g.add(rail);
      for (let f = 0; f < 12; f++) {
        const fp = curve.getPointAt(f / 11);
        const fl = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.09, 0.004), mat);
        fl.position.copy(fp); fl.name = "Flange_" + f;
        g.add(fl);
      }
    }
    return g;
  }

  static buildCrossMembers(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "CrossMembers";
    const ht = d.chassisWidth / 2 * 0.48;
    const fx = d.wheelbaseM * 0.5 + d.frontOverhangM * 0.5;
    const rx = -(d.wheelbaseM * 0.5 + d.rearOverhangM * 0.5);
    const cy = d.rideHeightM + 0.10;
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const x = fx + t * (rx - fx);
      const tubeGeo = new THREE.CylinderGeometry(0.018, 0.018, ht * 1.7, 8);
      const cross = new THREE.Mesh(tubeGeo, mat);
      cross.rotation.z = Math.PI / 2;
      cross.position.set(x, cy, 0);
      cross.name = "CrossMember_" + i;
      cross.castShadow = true;
      g.add(cross);
      for (const side of [-1, 1]) {
        const gs = new THREE.Mesh(new THREE.CircleGeometry(0.03, 6), mat);
        gs.position.set(x, cy, side * ht * 0.82);
        gs.rotation.y = Math.PI / 2;
        gs.name = "Gusset_" + i + "_" + (side < 0 ? "L" : "R");
        g.add(gs);
      }
    }
    for (const diag of [1, -1]) {
      const dPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 16; i++) {
        const t = i / 16;
        const x = fx + 0.3 + t * (rx - fx - 0.6) * 0.6;
        const z = diag * ht * 0.5 * (t - 0.5) * 2;
        dPts.push(new THREE.Vector3(x, cy, z));
      }
      const dc = new THREE.CatmullRomCurve3(dPts);
      const dg = new THREE.TubeGeometry(dc, 24, 0.01, 6, false);
      const brace = new THREE.Mesh(dg, mat);
      brace.name = "DiagonalBrace";
      g.add(brace);
    }
    return g;
  }

  static buildFloorPan(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "FloorPan";
    const hw = d.chassisWidth / 2 * 0.85;
    const len = d.wheelbaseM + d.frontOverhangM + d.rearOverhangM;
    const y = d.rideHeightM + 0.02;
    const cx = (d.frontOverhangM - d.rearOverhangM) / 2;
    const floor = new THREE.Mesh(new THREE.BoxGeometry(len * 0.92, 0.004, hw * 1.8), mat);
    floor.position.set(cx, y, 0); floor.receiveShadow = true;
    g.add(floor);
    for (let i = 0; i < 6; i++) {
      const z = -hw * 0.7 + (i / 5) * hw * 1.4;
      const ribPts: THREE.Vector3[] = [];
      for (let j = 0; j <= 20; j++) {
        const t = j / 20;
        const x = cx - len * 0.45 + t * len * 0.9;
        ribPts.push(new THREE.Vector3(x, y + 0.003 + Math.abs(Math.sin(t * Math.PI * 3)) * 0.004, z));
      }
      const rc = new THREE.CatmullRomCurve3(ribPts);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(rc, 20, 0.004, 4, false), mat));
    }
    for (let i = 0; i < 8; i++) {
      const x = cx - len * 0.4 + (i / 7) * len * 0.8;
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.008, hw * 1.6), mat);
      rib.position.set(x, y + 0.006, 0); g.add(rib);
    }
    return g;
  }

  static buildDrivelineTunnel(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "DrivelineTunnel";
    const len = d.wheelbaseM * 0.7;
    const cx = d.frontOverhangM * 0.2;
    const y = d.rideHeightM + 0.03;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      pts.push(new THREE.Vector3(cx - len / 2 + t * len, y, 0));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tunnel = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.06, 8, false), mat);
    tunnel.castShadow = true; g.add(tunnel);
    for (let i = 0; i < 6; i++) {
      const p2 = curve.getPointAt((i + 0.5) / 6);
      const rib = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.005, 4, 16), mat);
      rib.position.copy(p2); rib.rotation.x = Math.PI / 2; g.add(rib);
    }
    return g;
  }

  static buildRockerSills(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "RockerSills";
    const hw = d.chassisWidth / 2 * 0.88;
    const len = d.wheelbaseM * 0.55;
    const y = d.rideHeightM + 0.04;
    const cx = -d.wheelbaseM * 0.05;
    for (const side of [-1, 1]) {
      const z = side * hw;
      const sill = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, 0.04), mat);
      sill.position.set(cx, y, z); sill.castShadow = true;
      sill.name = "Sill_" + (side < 0 ? "L" : "R"); g.add(sill);
      for (let i = 0; i < 5; i++) {
        const sx = cx - len / 2 + (i + 0.5) / 5 * len;
        const stiff = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.045, 0.035), mat);
        stiff.position.set(sx, y, z); g.add(stiff);
      }
    }
    return g;
  }

  static buildFrontSubframe(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "FrontSubframe";
    const ht = d.chassisWidth / 2 * 0.55;
    const x = d.wheelbaseM * 0.45;
    const y = d.rideHeightM + 0.06;
    const cradle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, ht * 1.8, 8), mat);
    cradle.rotation.z = Math.PI / 2; cradle.position.set(x, y, 0); g.add(cradle);
    for (const side of [-1, 1]) {
      for (const rail of [-1, 1]) {
        const aPts: THREE.Vector3[] = [];
        for (let i = 0; i <= 12; i++) {
          const t = i / 12;
          aPts.push(new THREE.Vector3(x + rail * 0.04 + t * 0.12, y - 0.03, side * (ht * 0.3 + t * ht * 0.6)));
        }
        const ac = new THREE.CatmullRomCurve3(aPts);
        g.add(new THREE.Mesh(new THREE.TubeGeometry(ac, 12, 0.012, 6, false), mat));
      }
      const uPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        uPts.push(new THREE.Vector3(x - 0.02 + t * 0.08, y + 0.04, side * (ht * 0.35 + t * ht * 0.45)));
      }
      const uc = new THREE.CatmullRomCurve3(uPts);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(uc, 10, 0.01, 6, false), mat));
      const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 12), mat);
      boss.position.set(x + 0.14, y - 0.03, side * ht * 0.88); g.add(boss);
    }
    return g;
  }

  static buildRearSubframe(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "RearSubframe";
    const ht = d.chassisWidth / 2 * 0.55;
    const x = -(d.wheelbaseM * 0.45);
    const y = d.rideHeightM + 0.06;
    for (const side of [-1, 1]) {
      const sr = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.035, 0.025), mat);
      sr.position.set(x, y, side * ht * 0.82); sr.castShadow = true; g.add(sr);
    }
    for (const xOff of [-0.10, 0.10]) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, ht * 1.5), mat);
      c.position.set(x + xOff, y, 0); g.add(c);
    }
    for (const side of [-1, 1]) {
      for (let link = 0; link < 5; link++) {
        const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.025, 10), mat);
        boss.position.set(x - 0.08 + link * 0.04, y - 0.01, side * ht * (0.65 + link * 0.05));
        g.add(boss);
      }
    }
    return g;
  }

  static buildShockTower(x: number, y: number, z: number, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "ShockTower";
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.18, 16), mat);
    tower.position.set(x, y + 0.18, z); tower.castShadow = true; g.add(tower);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.008, 16), mat);
    top.position.set(x, y + 0.275, z); g.add(top);
    const bearing = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.005, 8, 16), mat);
    bearing.position.set(x, y + 0.27, z); bearing.rotation.x = Math.PI / 2; g.add(bearing);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const bPts: THREE.Vector3[] = [];
      for (let j = 0; j <= 8; j++) {
        const t = j / 8;
        bPts.push(new THREE.Vector3(x + Math.cos(angle) * 0.04 * t, y + 0.04 + t * 0.16, z + Math.sin(angle) * 0.04 * t));
      }
      const bc = new THREE.CatmullRomCurve3(bPts);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(bc, 8, 0.005, 4, false), mat));
    }
    return g;
  }

  static buildCrashStructures(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "CrashStructures";
    const ht = d.chassisWidth / 2 * 0.42;
    const cy = d.rideHeightM + 0.14;
    const fx = d.wheelbaseM * 0.5 + d.frontOverhangM;
    for (const side of [-1, 1]) {
      for (let rail = 0; rail < 2; rail++) {
        const z = side * ht * (0.5 + rail * 0.35);
        const bPts: THREE.Vector3[] = [];
        for (let i = 0; i <= 12; i++) {
          const t = i / 12;
          bPts.push(new THREE.Vector3(fx + 0.1 - t * 0.4, cy + Math.sin(t * Math.PI) * 0.01, z));
        }
        const bc = new THREE.CatmullRomCurve3(bPts);
        const cb = new THREE.Mesh(new THREE.TubeGeometry(bc, 12, 0.022, 6, false), mat);
        cb.castShadow = true; g.add(cb);
        for (let r = 0; r < 6; r++) {
          const rp = bc.getPointAt(r / 5);
          const rib = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.003, 4, 8), mat);
          rib.position.copy(rp); rib.rotation.x = Math.PI / 2; g.add(rib);
        }
      }
    }
    const rx = -(d.wheelbaseM * 0.5 + d.rearOverhangM);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, ht * 1.8, 8), mat);
    bar.rotation.z = Math.PI / 2; bar.position.set(rx, cy, 0); g.add(bar);
    for (const side of [-1, 1]) {
      for (let r = 0; r < 2; r++) {
        const z = side * ht * (0.4 + r * 0.4);
        const cPts: THREE.Vector3[] = [];
        for (let i = 0; i <= 10; i++) {
          cPts.push(new THREE.Vector3(rx + (i / 10) * 0.35, cy, z));
        }
        const cc = new THREE.CatmullRomCurve3(cPts);
        g.add(new THREE.Mesh(new THREE.TubeGeometry(cc, 10, 0.018, 6, false), mat));
      }
    }
    return g;
  }

  static buildFirewall(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "Firewall";
    const hw = d.chassisWidth / 2 * 0.72;
    const x = d.wheelbaseM * 0.15;
    const y = d.rideHeightM + 0.16;
    const fw = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.24, hw * 1.5), mat);
    fw.position.set(x, y, 0); fw.castShadow = true; g.add(fw);
    for (let i = 0; i < 4; i++) {
      const stamp = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.003, hw * 1.2), mat);
      stamp.position.set(x + 0.005, y - 0.072 + i * 0.048, 0); g.add(stamp);
    }
    [{ z: -hw * 0.4, y: y + 0.02 }, { z: 0, y: y - 0.04 }, { z: hw * 0.3, y: y + 0.06 },
     { z: hw * 0.5, y: y - 0.02 }, { z: -hw * 0.6, y: y - 0.06 }].forEach((gp, i) => {
      const grom = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.004, 8, 12), mat);
      grom.position.set(x, gp.y, gp.z); grom.rotation.y = Math.PI / 2; g.add(grom);
    });
    return g;
  }

  static buildFuelCell(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "FuelCell";
    const x = -(d.wheelbaseM * 0.28);
    const y = d.rideHeightM + 0.01;
    const cell = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.10, 0.24), mat);
    cell.position.set(x, y, 0); g.add(cell);
    for (const zOff of [-0.07, 0.07]) {
      const sPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 16; i++) {
        const a = (i / 16) * Math.PI;
        sPts.push(new THREE.Vector3(x + Math.cos(a) * 0.12, y + Math.sin(a) * 0.06, zOff));
      }
      const sc = new THREE.CatmullRomCurve3(sPts);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(sc, 16, 0.004, 4, false), mat));
    }
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 12), mat);
    cap.position.set(x + 0.11, y + 0.055, 0); g.add(cap);
    return g;
  }

  static buildAccessoryTrays(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "AccessoryTrays";
    const y = d.rideHeightM + 0.04;
    const bx = -(d.wheelbaseM * 0.35);
    const bz = d.chassisWidth / 2 * 0.6;
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.008, 0.14), mat);
    tray.position.set(bx, y, bz); g.add(tray);
    const bPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      bPts.push(new THREE.Vector3(bx + Math.cos(a) * 0.09, y + 0.005 + Math.abs(Math.sin(a)) * 0.025, bz + Math.sin(a) * 0.065));
    }
    const bc = new THREE.CatmullRomCurve3(bPts);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(bc, 16, 0.003, 4, false), mat));
    const ecuP = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.10, 0.16), mat);
    ecuP.position.set(d.wheelbaseM * 0.12, y + 0.08, 0); g.add(ecuP);
    const ecu = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.10), mat);
    ecu.position.set(d.wheelbaseM * 0.12 + 0.015, y + 0.09, 0); g.add(ecu);
    return g;
  }

  static buildHeatShield(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "HeatShield";
    const len = d.wheelbaseM * 0.45;
    const cx = -(d.wheelbaseM * 0.1);
    const y = d.rideHeightM + 0.01;
    const sPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      sPts.push(new THREE.Vector3(cx - len / 2 + (i / 20) * len, y, 0));
    }
    const sc = new THREE.CatmullRomCurve3(sPts);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(sc, 24, 0.07, 6, false), mat));
    for (let i = 0; i < 16; i++) {
      const p = sc.getPointAt((i + 0.5) / 16);
      const d2 = new THREE.Mesh(new THREE.SphereGeometry(0.005, 4, 4), mat);
      d2.position.copy(p); d2.position.y -= 0.065; d2.scale.y = 0.3; g.add(d2);
    }
    return g;
  }

  static buildWeldBeads(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "WeldBeads";
    const ht = d.chassisWidth / 2 * 0.48;
    const cy = d.rideHeightM + 0.12;
    const fx = d.wheelbaseM * 0.5;
    const rx = -(d.wheelbaseM * 0.5);
    const wm = new THREE.MeshStandardMaterial({ color: 0x8a9098, metalness: 0.85, roughness: 0.35 });
    for (let i = 0; i < 10; i++) {
      const x = fx + (i / 9) * (rx - fx);
      for (const side of [-1, 1]) {
        const weld = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.003, 4, 12), wm);
        weld.position.set(x, cy, side * ht * 0.9);
        weld.rotation.set(Math.PI / 2, 0, Math.random() * 0.5);
        g.add(weld);
      }
    }
    return g;
  }

  static buildAll(d: StructuralDimensions, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "ChassisStructuralComplete";
    g.add(this.buildCurvedFrameRails(d, mat));
    g.add(this.buildCrossMembers(d, mat));
    g.add(this.buildFloorPan(d, mat));
    g.add(this.buildDrivelineTunnel(d, mat));
    g.add(this.buildRockerSills(d, mat));
    g.add(this.buildFrontSubframe(d, mat));
    g.add(this.buildRearSubframe(d, mat));
    g.add(this.buildCrashStructures(d, mat));
    g.add(this.buildFirewall(d, mat));
    g.add(this.buildFuelCell(d, mat));
    g.add(this.buildAccessoryTrays(d, mat));
    g.add(this.buildHeatShield(d, mat));
    g.add(this.buildWeldBeads(d, mat));
    const fx = d.wheelbaseM * 0.45;
    const rx = -(d.wheelbaseM * 0.45);
    const htF = d.chassisWidth / 2 * 0.72;
    const htR = d.chassisWidth / 2 * 0.72;
    const cy = d.rideHeightM + 0.06;
    for (const side of [-1, 1]) {
      g.add(this.buildShockTower(fx, cy, side * htF, mat));
      g.add(this.buildShockTower(rx, cy, side * htR, mat));
    }
    return g;
  }
}
