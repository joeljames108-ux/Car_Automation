// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — 800V SKATEBOARD EV BATTERY PACK 3D GENERATOR
// ============================================================================
// Procedurally generates ultra-high-detail 800V structural underfloor battery pack:
// - Extruded aerospace aluminum tray with longitudinal crash-absorbing ribs
// - 4680 Cylindrical & Prismatic Cell Matrices with laser-welded copper busbar bridges
// - Serpentine aluminum glycol cooling snake plates with dual quick-connect manifolds
// - High-voltage safety junction box: Vacuum contactors, solid-state pyro-fuses, and BMS ECU
// ============================================================================

import * as THREE from 'three';

export class SkateboardBatteryPack3DGenerator {
  public static buildBatteryPack(
    wheelbaseMm: number,
    trackWidthMm: number,
    isXRay: boolean = false
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'EV_Skateboard_800V_BatteryPack';

    const wbM = wheelbaseMm / 1000;
    const halfTrM = (trackWidthMm / 2) / 1000;

    const trayLength = wbM * 0.74;
    const trayWidth = halfTrM * 1.54;
    const packCenterX = -wbM * 0.42;

    // Materials
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Extruded aerospace structural aluminum
      metalness: 0.94,
      roughness: 0.18,
      transparent: isXRay,
      opacity: isXRay ? 0.35 : 1.0,
    });

    const cellCanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Metallic electric blue 4680 cell casing
      metalness: 0.85,
      roughness: 0.22,
    });

    const copperBusbarMat = new THREE.MeshPhysicalMaterial({
        color: 0x0f172a,
        metalness: 0.85,
        roughness: 0.2,
        clearcoat: 0.9,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.2,
      });

    const coolingPlateMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Anodized cyan liquid cooling channels
      metalness: 0.92,
      roughness: 0.15,
    });

    const bmsJunctionMat = new THREE.MeshStandardMaterial({
      color: 0x09090b, // Sealed high-voltage junction box
      metalness: 0.90,
      roughness: 0.25,
    });

    const goldConnectorMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Gold-plated high-current contactor terminals
      metalness: 0.98,
      roughness: 0.08,
    });

    // ── 1. Structural Underfloor Tray & Extrusion Ribs ──
    const trayGeo = new THREE.BoxGeometry(trayLength, 0.12, trayWidth);
    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.position.set(packCenterX, 0.16, 0);
    group.add(tray);

    // Longitudinal Stiffening Beams
    [-trayWidth * 0.46, 0, trayWidth * 0.46].forEach((zPos) => {
      const beamGeo = new THREE.BoxGeometry(trayLength * 0.98, 0.03, 0.04);
      const beam = new THREE.Mesh(beamGeo, trayMat);
      beam.position.set(packCenterX, 0.23, zPos);
      group.add(beam);
    });

    // ── 2. 800V Cell Modules & Laser-Welded Busbars ──
    const numModulesX = 5;
    const numModulesZ = 2;
    const modLen = trayLength / (numModulesX + 0.4);
    const modWid = trayWidth / (numModulesZ + 0.4);

    for (let ix = 0; ix < numModulesX; ix++) {
      for (let iz = 0; iz < numModulesZ; iz++) {
        const posX = packCenterX - (trayLength / 2) + (ix + 0.5) * (trayLength / numModulesX);
        const posZ = -(trayWidth / 2) + (iz + 0.5) * (trayWidth / numModulesZ);

        // Module Housing Block
        const modGeo = new THREE.BoxGeometry(modLen * 0.88, 0.08, modWid * 0.86);
        const module = new THREE.Mesh(modGeo, cellCanMat);
        module.position.set(posX, 0.18, posZ);
        group.add(module);

        // Cylindrical 4680 Cell Terminals
        for (let c = 0; c < 4; c++) {
          const cx = posX - 0.04 + (c % 2) * 0.08;
          const cz = posZ - 0.04 + Math.floor(c / 2) * 0.08;
          const cellGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.012, 16);
          const cellCap = new THREE.Mesh(cellGeo, goldConnectorMat);
          cellCap.position.set(cx, 0.225, cz);
          group.add(cellCap);
        }

        // Serpentine Liquid Cooling Plate Beneath Module
        const plateGeo = new THREE.BoxGeometry(modLen * 0.92, 0.014, modWid * 0.90);
        const plate = new THREE.Mesh(plateGeo, coolingPlateMat);
        plate.position.set(posX, 0.13, posZ);
        group.add(plate);
      }
    }

    // ── 3. High-Voltage Copper Busbar Spine ──
    const spineGeo = new THREE.BoxGeometry(trayLength * 0.92, 0.018, 0.036);
    const spine = new THREE.Mesh(spineGeo, copperBusbarMat);
    spine.position.set(packCenterX, 0.22, 0);
    group.add(spine);

    // ── 4. High-Voltage Safety Junction Box (BMS, Contactors & Pyro-Fuse) ──
    const juncGeo = new THREE.BoxGeometry(0.24, 0.10, 0.32);
    const juncBox = new THREE.Mesh(juncGeo, bmsJunctionMat);
    juncBox.position.set(packCenterX + trayLength * 0.42, 0.20, 0);
    group.add(juncBox);

    // High-Voltage Vacuum Contactor Relays
    [-0.06, 0.06].forEach((cz) => {
      const contGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.05, 16);
      const contactor = new THREE.Mesh(contGeo, goldConnectorMat);
      contactor.position.set(packCenterX + trayLength * 0.42, 0.24, cz);
      group.add(contactor);
    });

    // Solid-State Pyro-Fuse Actuator
    const fuseGeo = new THREE.BoxGeometry(0.06, 0.03, 0.06);
    const pyroFuse = new THREE.Mesh(fuseGeo, copperBusbarMat);
    pyroFuse.position.set(packCenterX + trayLength * 0.42, 0.24, 0);
    group.add(pyroFuse);

    // Quick-Connect Glycol Liquid Manifolds
    [-0.12, 0.12].forEach((mz) => {
      const maniGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.035, 16);
      maniGeo.rotateZ(Math.PI / 2);
      const manifold = new THREE.Mesh(maniGeo, coolingPlateMat);
      manifold.position.set(packCenterX - trayLength * 0.48, 0.16, mz);
      group.add(manifold);
    });

    return group;
  }
}
