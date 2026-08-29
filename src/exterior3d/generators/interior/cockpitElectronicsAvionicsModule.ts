// Cockpit Electronics & Avionics Integration Module
import * as THREE from "three";

export class CockpitElectronicsAvionicsModule {
  public static buildElectronicsSuite(trackWidthM: number, wheelbaseM: number): THREE.Group {
    const group = new THREE.Group();
    group.name = "CockpitElectronicsAvionics";
    const halfTrack = trackWidthM / 2;
    const blackMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0e17, metalness: 0.3, roughness: 0.6 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.1 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x050a14 });
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const sensorMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a2e, metalness: 0.4, roughness: 0.3, clearcoat: 0.8 });
    group.add(this.buildHudProjector(blackMat, ledMat));
    group.add(this.buildAdasCameraPod(sensorMat, blackMat));
    group.add(this.buildDigitalRearviewMirror(sensorMat, screenMat, chromeMat));
    group.add(this.buildCommAntennaArray(blackMat));
    group.add(this.buildAudioSystem(halfTrack, blackMat, chromeMat));
    group.add(this.buildClimateControlModule(blackMat, screenMat, ledMat));
    group.add(this.buildEcuUnit(blackMat, chromeMat, ledMat));
    return group;
  }
  private static buildHudProjector(blackMat: THREE.Material, ledMat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "HUD_Projector";
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.12), blackMat);
    housing.position.set(-0.30, 0.88, -0.20); g.add(housing);
    const lensMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.85, opacity: 0.2, transparent: true, roughness: 0.01, ior: 1.52, side: THREE.DoubleSide });
    const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.08), lensMat);
    lens.position.set(-0.30, 0.92, -0.20); lens.rotation.x = -0.3; g.add(lens);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
    glow.position.set(-0.30, 0.94, -0.22); glow.rotation.x = -0.4; g.add(glow);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 8), ledMat);
    led.position.set(-0.22, 0.88, -0.20); g.add(led);
    return g;
  }
  private static buildAdasCameraPod(sensorMat: THREE.Material, blackMat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "ADAS_CameraPod";
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.06), blackMat);
    housing.position.set(-0.24, 1.18, 0); g.add(housing);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.02, 16), sensorMat);
    lens.rotation.x = Math.PI / 2; lens.position.set(-0.24, 1.18, -0.035); g.add(lens);
    const sensor = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.025, 0.005), sensorMat);
    sensor.position.set(-0.18, 1.18, -0.032); g.add(sensor);
    const ir = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), new THREE.MeshBasicMaterial({ color: 0x330066 }));
    ir.position.set(-0.30, 1.18, -0.032); g.add(ir);
    const wc = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.24, 1.18, 0), new THREE.Vector3(-0.35, 1.10, 0.05), new THREE.Vector3(-0.50, 0.90, 0.10)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(wc, 12, 0.003, 4, false), blackMat));
    return g;
  }
  private static buildDigitalRearviewMirror(sensorMat: THREE.Material, screenMat: THREE.Material, chromeMat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "Digital_Rearview_Mirror";
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.025), sensorMat);
    housing.position.set(-0.24, 1.12, 0); g.add(housing);
    const display = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.045), screenMat);
    display.position.set(-0.24, 1.12, -0.014); g.add(display);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.08, 8), chromeMat);
    arm.position.set(-0.24, 1.16, 0.04); arm.rotation.x = Math.PI / 4; g.add(arm);
    const dimSensor = new THREE.Mesh(new THREE.SphereGeometry(0.004, 6, 6), sensorMat);
    dimSensor.position.set(-0.18, 1.14, -0.014); g.add(dimSensor);
    return g;
  }
  private static buildCommAntennaArray(blackMat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "Comm_Antenna";
    const fs2 = new THREE.Shape(); fs2.moveTo(0,0); fs2.bezierCurveTo(0.01,0.03,0.02,0.05,0.04,0.06); fs2.lineTo(0.06,0.04); fs2.bezierCurveTo(0.07,0.02,0.08,0.01,0.10,0); fs2.closePath();
    const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(fs2, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2 }), blackMat);
    fin.position.set(-0.60, 1.28, 0); g.add(fin);
    const ecu = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.08), blackMat);
    ecu.position.set(-0.50, 0.35, 0.30); g.add(ecu);
    for (let i = 0; i < 4; i++) {
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.003, 6, 6), new THREE.MeshBasicMaterial({ color: i < 2 ? 0x22c55e : 0xf59e0b }));
      led.position.set(-0.54 + i * 0.02, 0.35, 0.34); g.add(led);
    }
    const hc = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.50,0.35,0.30), new THREE.Vector3(-0.40,0.40,0.20), new THREE.Vector3(-0.30,0.50,0.10)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(hc, 10, 0.004, 4, false), blackMat));
    return g;
  }
  private static buildAudioSystem(halfTrack: number, blackMat: THREE.Material, chromeMat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "Audio_System";
    [-1, 1].forEach((side) => {
      const dz = side * (halfTrack - 0.05);
      g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.015,12), chromeMat), { position: new THREE.Vector3(-0.45, 1.00, dz) }));
      g.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(0.020,0.002,6,16), blackMat), { position: new THREE.Vector3(-0.45, 1.00, dz + side * 0.01) }));
      g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,0.02,20), blackMat), { position: new THREE.Vector3(-0.30, 0.25, dz) }));
      g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.040,0.050,0.008,20), new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.1 })), { position: new THREE.Vector3(-0.30, 0.25, dz + side * 0.012) }));
      g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.03,24), blackMat), { position: new THREE.Vector3(0.40, 0.30, dz * 0.5) }));
    });
    g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,0.012,16), chromeMat), { position: new THREE.Vector3(-0.35, 0.87, 0) }));
    g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.20,0.04,0.15), blackMat), { position: new THREE.Vector3(0.60, 0.15, 0) }));
    for (let f = 0; f < 8; f++) {
      g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.18,0.02,0.002), chromeMat), { position: new THREE.Vector3(0.60, 0.17, -0.06 + f * 0.017) }));
    }
    return g;
  }
  private static buildClimateControlModule(blackMat: THREE.Material, screenMat: THREE.Material, ledMat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "Climate_Control";
    g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.18,0.08,0.02), blackMat), { position: new THREE.Vector3(-0.35, 0.55, 0) }));
    g.add(Object.assign(new THREE.Mesh(new THREE.PlaneGeometry(0.14,0.04), screenMat), { position: new THREE.Vector3(-0.35, 0.56, -0.012) }));
    [-0.04, 0.04].forEach((zOff) => {
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.008,20), blackMat); dial.rotation.x = Math.PI / 2; dial.position.set(-0.35, 0.52, zOff); g.add(dial);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.020,0.002,6,16), new THREE.MeshBasicMaterial({ color: zOff < 0 ? 0xd97706 : 0xef4444 })); ring.rotation.y = Math.PI / 2; ring.position.set(-0.35, 0.52, zOff); g.add(ring);
    });
    for (let i = 0; i < 5; i++) {
      g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.012,0.006,0.012), i < 3 ? ledMat : blackMat), { position: new THREE.Vector3(-0.42 + i * 0.02, 0.50, 0) }));
    }
    [-0.06, 0.06].forEach((zOff, idx) => {
      g.add(Object.assign(new THREE.Mesh(new THREE.PlaneGeometry(0.025,0.015), new THREE.MeshBasicMaterial({ color: idx === 0 ? 0xd97706 : 0xef4444, transparent: true, opacity: 0.6 })), { position: new THREE.Vector3(-0.30, 0.52, zOff) }));
    });
    return g;
  }
  private static buildEcuUnit(blackMat: THREE.Material, chromeMat: THREE.Material, ledMat: THREE.Material): THREE.Group {
    const g = new THREE.Group(); g.name = "ECU_Processing_Unit";
    g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.20,0.04,0.14), blackMat), { position: new THREE.Vector3(-0.55, 0.40, 0.32) }));
    g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.18,0.005,0.12), chromeMat), { position: new THREE.Vector3(-0.55, 0.42, 0.32) }));
    for (let f = 0; f < 10; f++) {
      g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.16,0.015,0.002), chromeMat), { position: new THREE.Vector3(-0.55, 0.43, 0.27 + f * 0.012) }));
    }
    for (let p = 0; p < 6; p++) {
      g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.015,0.012,0.008), blackMat), { position: new THREE.Vector3(-0.62 + p * 0.018, 0.39, 0.39) }));
      g.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.002,4,4), ledMat), { position: new THREE.Vector3(-0.62 + p * 0.018, 0.40, 0.395) }));
    }
    g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.06,0.001,0.02), new THREE.MeshBasicMaterial({ color: 0xf59e0b })), { position: new THREE.Vector3(-0.55, 0.425, 0.32) }));
    return g;
  }
}
