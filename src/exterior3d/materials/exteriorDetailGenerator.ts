// ====================================================================
// EXTERIOR DETAIL GENERATOR - Door Handles, Badges, Vents, Diffusers
// ====================================================================
// Complete exterior detail generation:
// - 4 door handle styles with mechanism detail
// - 5 badge styles with material options
// - Hood vents, side fender vents, rear diffuser fins
// - Front splitter, rear spoiler, ducktail
// - Side skirts, rocker panels, aero tunnels
// - Window trim, belt line, pillar covers
// - Roof rails, cross bars, roof rack
// - Exhaust heat shields, tow hook covers
// - License plate holder with illumination
// ====================================================================

import * as THREE from 'three';

export interface ExteriorDetailConfig {
  doorHandleStyle: 'flush_pop' | 'recessed' | 'traditional' | 'camera_mirror';
  badgeStyle: '3d_emblem' | 'flat_print' | 'illuminated' | 'chrome_script' | 'carbon_badge';
  antennaType: 'shark_fin' | 'whip' | 'integrated' | 'none';
  wiperStyle: 'aero' | 'traditional' | 'hidden';
  fuelCapStyle: 'flush' | 'traditional' | 'electric_port';
  exhaustTipStyle: 'quad_round' | 'dual_oval' | 'integrated' | 'hidden' | 'side_exit' | 'tri_angle';
  mirrorType: 'standard' | 'camera' | 'frameless';
  garnishFinish: 'chrome' | 'gloss_black' | 'carbon' | 'body_color';
  hasHoodVents: boolean;
  hasSideVents: boolean;
  hasDiffuser: boolean;
  hasSpoiler: boolean;
  hasRoofRails: boolean;
  hasTowHookCover: boolean;
  splitterStyle: 'none' | 'lip' | 'canards' | 'full_splitter';
}

// --- EXTERIOR DETAIL GENERATOR ---
export class ExteriorDetailGenerator {
  public static buildAllDetails(config: ExteriorDetailConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = 'ExteriorDetails';

    group.add(this.buildDoorHandles(config.doorHandleStyle));
    group.add(this.buildBadge(config.badgeStyle));
    group.add(this.buildAntenna(config.antennaType));
    group.add(this.buildWipers(config.wiperStyle));
    group.add(this.buildFuelCap(config.fuelCapStyle));
    group.add(this.buildExhaustTips(config.exhaustTipStyle));
    group.add(this.buildMirrors(config.mirrorType));
    group.add(this.buildGarnishTrim(config.garnishFinish));

    if (config.hasHoodVents) group.add(this.buildHoodVents());
    if (config.hasSideVents) group.add(this.buildSideFenderVents());
    if (config.hasDiffuser) group.add(this.buildRearDiffuser());
    if (config.hasSpoiler) group.add(this.buildRearSpoiler());
    if (config.hasRoofRails) group.add(this.buildRoofRails());
    if (config.hasTowHookCover) group.add(this.buildTowHookCover());
    if (config.splitterStyle !== 'none') group.add(this.buildFrontSplitter(config.splitterStyle));

    group.add(this.buildLicensePlateHolder());
    group.add(this.buildWindowTrim());
    group.add(this.buildPillarCovers());
    group.add(this.buildExhaustHeatShield());
    group.add(this.buildRockerPanels());

    return group;
  }

  // --- DOOR HANDLES ---
  public static buildDoorHandles(style: ExteriorDetailConfig['doorHandleStyle']): THREE.Group {
    const group = new THREE.Group();
    group.name = 'DoorHandles';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x222222, metalness: 0.85, roughness: 0.12, clearcoat: 0.9 });
    const positions = [[0.0, 0.55, 0.72], [0.0, 0.55, -0.72]];

    for (const [x, y, z] of positions) {
      const handle = new THREE.Group();

      if (style === 'flush_pop') {
        const hGeo = new THREE.BoxGeometry(0.12, 0.015, 0.025);
        const h = new THREE.Mesh(hGeo, mat);
        h.position.set(x, y, z);
        handle.add(h);
        // Gap line
        const gapGeo = new THREE.BoxGeometry(0.13, 0.003, 0.03);
        const gapMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const gap = new THREE.Mesh(gapGeo, gapMat);
        gap.position.set(x, y - 0.009, z);
        handle.add(gap);
        // Capacitive touch sensor strip
        const sensorGeo = new THREE.BoxGeometry(0.1, 0.001, 0.015);
        const sensorMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.5, roughness: 0.3 });
        const sensor = new THREE.Mesh(sensorGeo, sensorMat);
        sensor.position.set(x, y + 0.008, z);
        handle.add(sensor);
      } else if (style === 'recessed') {
        const rGeo = new THREE.BoxGeometry(0.1, 0.03, 0.02);
        const r = new THREE.Mesh(rGeo, mat);
        r.position.set(x, y, z);
        handle.add(r);
        const pGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.06, 8);
        pGeo.rotateX(Math.PI / 2);
        const pad = new THREE.Mesh(pGeo, mat);
        pad.position.set(x, y, z + 0.015);
        handle.add(pad);
      } else if (style === 'traditional') {
        const tGeo = new THREE.BoxGeometry(0.14, 0.025, 0.035);
        const t = new THREE.Mesh(tGeo, mat);
        t.position.set(x, y, z);
        handle.add(t);
        const bGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.04, 8);
        bGeo.rotateZ(Math.PI / 2);
        const bracket = new THREE.Mesh(bGeo, mat);
        bracket.position.set(x - 0.05, y + 0.005, z);
        handle.add(bracket);
        // Chrome accent strip
        const chromeMat = new THREE.MeshPhysicalMaterial({ color: 0xeeeeee, metalness: 0.95, roughness: 0.03, clearcoat: 1.0 });
        const chromeGeo = new THREE.BoxGeometry(0.12, 0.003, 0.001);
        const chrome = new THREE.Mesh(chromeGeo, chromeMat);
        chrome.position.set(x, y + 0.013, z + 0.018);
        handle.add(chrome);
      } else if (style === 'camera_mirror') {
        const camGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.008, 16);
        camGeo.rotateX(Math.PI / 2);
        const cam = new THREE.Mesh(camGeo, mat);
        cam.position.set(x, y, z + 0.01);
        handle.add(cam);
        const lensMat = new THREE.MeshPhysicalMaterial({ color: 0x000000, metalness: 0.3, roughness: 0.05, clearcoat: 1.0 });
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.008, 16), lensMat);
        lens.position.set(x, y, z + 0.015);
        handle.add(lens);
      }
      group.add(handle);
    }
    return group;
  }

  // --- BADGES ---
  public static buildBadge(style: ExteriorDetailConfig['badgeStyle']): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Badge';

    const badgeMat = new THREE.MeshPhysicalMaterial({
      color: 0xc0c0c0, metalness: 0.95, roughness: 0.05, clearcoat: 1.0, envMapIntensity: 2.5,
    });

    if (style === '3d_emblem') {
      const baseGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.005, 32);
      baseGeo.rotateX(Math.PI / 2);
      group.add(new THREE.Mesh(baseGeo, badgeMat));
      const innerGeo = new THREE.TorusGeometry(0.025, 0.004, 8, 32);
      group.add(new THREE.Mesh(innerGeo, badgeMat));
    } else if (style === 'flat_print') {
      const flatGeo = new THREE.CircleGeometry(0.035, 32);
      group.add(new THREE.Mesh(flatGeo, badgeMat));
    } else if (style === 'illuminated') {
      const illuMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.5 });
      const illuGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.006, 32);
      illuGeo.rotateX(Math.PI / 2);
      group.add(new THREE.Mesh(illuGeo, illuMat));
      group.add(new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.003, 8, 32), badgeMat));
    } else if (style === 'chrome_script') {
      // Simulate chrome lettering with individual letter blocks
      const letters = 8;
      for (let i = 0; i < letters; i++) {
        const lGeo = new THREE.BoxGeometry(0.012, 0.015, 0.003);
        const letter = new THREE.Mesh(lGeo, badgeMat);
        letter.position.set(-0.04 + i * 0.015, 0, 0.002);
        group.add(letter);
      }
    } else if (style === 'carbon_badge') {
      const carbonMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0a10, metalness: 0.4, roughness: 0.15, clearcoat: 1.0 });
      const baseGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.004, 32);
      baseGeo.rotateX(Math.PI / 2);
      group.add(new THREE.Mesh(baseGeo, carbonMat));
      const letterGeo = new THREE.BoxGeometry(0.04, 0.012, 0.003);
      group.add(new THREE.Mesh(letterGeo, badgeMat));
    }
    group.position.set(-1.2, 0.55, 0);
    return group;
  }

  // --- ANTENNA ---
  public static buildAntenna(type: ExteriorDetailConfig['antennaType']): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Antenna';
    if (type === 'none') return group;
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.3, roughness: 0.2, clearcoat: 0.8 });

    if (type === 'shark_fin') {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0.08, 0);
      shape.quadraticCurveTo(0.1, 0, 0.1, 0.02);
      shape.lineTo(0.04, 0.05);
      shape.quadraticCurveTo(0.02, 0.06, 0, 0.03);
      shape.lineTo(0, 0);
      const finGeo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.05, bevelEnabled: true, bevelThickness: 0.005,
        bevelSize: 0.005, bevelSegments: 4,
      });
      finGeo.center();
      group.add(new THREE.Mesh(finGeo, mat));
      // GPS antenna bump
      const bumpGeo = new THREE.SphereGeometry(0.008, 12, 12);
      const bump = new THREE.Mesh(bumpGeo, mat);
      bump.position.set(0, 0.015, 0);
      group.add(bump);
    } else if (type === 'whip') {
      const whipGeo = new THREE.CylinderGeometry(0.002, 0.001, 0.2, 8);
      const whip = new THREE.Mesh(whipGeo, mat);
      whip.position.y = 0.1;
      group.add(whip);
      const baseGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.015, 12);
      group.add(new THREE.Mesh(baseGeo, mat));
      // Spring coil at base
      const springGeo = new THREE.TorusGeometry(0.006, 0.001, 4, 16);
      const spring = new THREE.Mesh(springGeo, mat);
      spring.position.y = 0.015;
      group.add(spring);
    } else if (type === 'integrated') {
      const intGeo = new THREE.BoxGeometry(0.15, 0.008, 0.04);
      group.add(new THREE.Mesh(intGeo, mat));
    }
    group.position.set(-0.3, 0.85, 0);
    return group;
  }

  // --- WIPERS ---
  public static buildWipers(style: ExteriorDetailConfig['wiperStyle']): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Wipers';
    if (style === 'hidden') return group;

    const mat = new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.4, roughness: 0.6 });
    const bladeMat = new THREE.MeshPhysicalMaterial({ color: 0x222222, metalness: 0.1, roughness: 0.8 });
    const bladeLength = style === 'aero' ? 0.45 : 0.4;
    const positions = [[0.2, 0.55, 0.25], [0.2, 0.55, -0.15]];

    for (const [x, y, z] of positions) {
      // Wiper arm
      const armGeo = new THREE.CylinderGeometry(0.003, 0.003, bladeLength, 8);
      armGeo.rotateZ(Math.PI / 4);
      group.add(new THREE.Mesh(armGeo, mat));
      // Wiper blade
      const bladeGeo = new THREE.BoxGeometry(bladeLength * 0.9, 0.002, 0.015);
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(x, y, z);
      blade.rotation.y = 0.3;
      group.add(blade);
      // Pivot cap
      const pivotGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.008, 8);
      const pivot = new THREE.Mesh(pivotGeo, mat);
      pivot.position.set(0.35, 0.54, z);
      group.add(pivot);
    }
    return group;
  }

  // --- FUEL CAP ---
  public static buildFuelCap(style: ExteriorDetailConfig['fuelCapStyle']): THREE.Group {
    const group = new THREE.Group();
    group.name = 'FuelCap';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.15, clearcoat: 0.8 });

    if (style === 'flush') {
      group.add(new THREE.Mesh(new THREE.CircleGeometry(0.035, 32), mat));
      const gap = new THREE.Mesh(new THREE.RingGeometry(0.034, 0.036, 32), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      group.add(gap);
    } else if (style === 'traditional') {
      const capGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.008, 32);
      capGeo.rotateX(Math.PI / 2);
      group.add(new THREE.Mesh(capGeo, mat));
      // Hinge detail
      const hingeGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.03, 6);
      hingeGeo.rotateZ(Math.PI / 2);
      group.add(new THREE.Mesh(hingeGeo, mat));
    } else {
      // EV charge port
      const portGeo = new THREE.BoxGeometry(0.065, 0.055, 0.008);
      group.add(new THREE.Mesh(portGeo, mat));
      // CCS/NACS socket
      const socketGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.01, 16);
      socketGeo.rotateX(Math.PI / 2);
      const socketMat = new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.5, roughness: 0.3 });
      group.add(new THREE.Mesh(socketGeo, socketMat));
      // LED indicator
      const ledMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 2.0 });
      const ledGeo = new THREE.SphereGeometry(0.003, 8, 8);
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0.025, 0.02, 0.005);
      group.add(led);
    }
    return group;
  }

  // --- EXHAUST TIPS ---
  public static buildExhaustTips(style: ExteriorDetailConfig['exhaustTipStyle']): THREE.Group {
    const group = new THREE.Group();
    group.name = 'ExhaustTips';
    if (style === 'hidden') return group;

    const mat = new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.1 });
    const carbonMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0a10, metalness: 0.4, roughness: 0.15, clearcoat: 0.8 });

    if (style === 'quad_round') {
      for (let i = 0; i < 4; i++) {
        const geo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 24);
        geo.rotateX(Math.PI / 2);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(-0.3 + i * 0.2, 0.25, 1.8);
        group.add(mesh);
        // Inner soot
        const innerGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 24);
        innerGeo.rotateX(Math.PI / 2);
        const innerMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.9 });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        inner.position.set(-0.3 + i * 0.2, 0.25, 1.85);
        group.add(inner);
      }
    } else if (style === 'dual_oval') {
      for (const x of [-0.2, 0.2]) {
        const shape = new THREE.Shape();
        shape.ellipse(0, 0, 0.04, 0.025, 0, Math.PI * 2, false, 0);
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: false });
        geo.rotateX(Math.PI / 2);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 0.25, 1.75);
        group.add(mesh);
      }
    } else if (style === 'integrated') {
      // Integrated into bumper fascia
      const fasciaMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.5, roughness: 0.2 });
      const fasciaGeo = new THREE.BoxGeometry(0.8, 0.06, 0.08);
      const fascia = new THREE.Mesh(fasciaGeo, fasciaMat);
      fascia.position.set(0, 0.24, 1.82);
      group.add(fascia);
    } else if (style === 'side_exit') {
      const geo = new THREE.CylinderGeometry(0.035, 0.03, 0.2, 24);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0.8, 0.15, 0.2);
      mesh.rotation.z = Math.PI / 2;
      group.add(mesh);
    } else if (style === 'tri_angle') {
      // Pagani-style triple exhaust
      const positions = [[0, 0.03], [-0.03, -0.02], [0.03, -0.02]];
      for (const [x, y] of positions) {
        const geo = new THREE.CylinderGeometry(0.025, 0.025, 0.1, 24);
        geo.rotateX(Math.PI / 2);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 0.25 + y, 1.82);
        group.add(mesh);
      }
    }
    return group;
  }

  // --- MIRRORS ---
  public static buildMirrors(type: ExteriorDetailConfig['mirrorType']): THREE.Group {
    const group = new THREE.Group();
    group.name = 'ExteriorMirrors';
    const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.2 });
    const mirrorMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.98, roughness: 0.02 });

    for (const x of [-0.85, 0.85]) {
      const housingGeo = new THREE.BoxGeometry(type === 'camera' ? 0.06 : 0.16, 0.08, 0.12);
      const housing = new THREE.Mesh(housingGeo, bodyMat);
      housing.position.set(x, 0.85, -0.45);
      group.add(housing);

      // Mirror glass
      const glassGeo = new THREE.PlaneGeometry(0.07, 0.1);
      glassGeo.rotateY(x > 0 ? -Math.PI / 2 : Math.PI / 2);
      const glass = new THREE.Mesh(glassGeo, mirrorMat);
      glass.position.set(x + (x > 0 ? -0.035 : 0.035), 0.85, -0.45);
      group.add(glass);

      // Stalk/arm
      const stalkGeo = new THREE.BoxGeometry(0.08, 0.015, 0.04);
      const stalk = new THREE.Mesh(stalkGeo, bodyMat);
      stalk.position.set(x > 0 ? x - 0.08 : x + 0.08, 0.85, -0.43);
      group.add(stalk);

      // Turn signal indicator on mirror
      const sigMat = new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: 0xff6600, emissiveIntensity: 2.0 });
      const sigGeo = new THREE.BoxGeometry(0.04, 0.004, 0.002);
      const sig = new THREE.Mesh(sigGeo, sigMat);
      sig.position.set(x, 0.82, -0.45 + (x > 0 ? -0.06 : 0.06));
      group.add(sig);
    }
    return group;
  }

  // --- GARNISH TRIM ---
  public static buildGarnishTrim(finish: ExteriorDetailConfig['garnishFinish']): THREE.Group {
    const group = new THREE.Group();
    group.name = 'GarnishTrim';

    const mat = new THREE.MeshPhysicalMaterial({
      color: finish === 'chrome' ? 0xeeeeee : 0x111111,
      metalness: finish === 'chrome' ? 0.95 : 0.3,
      roughness: finish === 'chrome' ? 0.05 : 0.2,
      clearcoat: 0.9,
    });

    const trimGeo = new THREE.BoxGeometry(0.015, 0.015, 2.2);
    const leftTrim = new THREE.Mesh(trimGeo, mat);
    leftTrim.position.set(-0.78, 0.52, 0);
    group.add(leftTrim);
    const rightTrim = leftTrim.clone();
    rightTrim.position.set(0.78, 0.52, 0);
    group.add(rightTrim);

    return group;
  }

  // --- HOOD VENTS ---
  public static buildHoodVents(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'HoodVents';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.25, clearcoat: 0.7 });
    const positions = [[0.4, 0.58, 0.15], [0.4, 0.58, -0.15]];
    for (const [x, y, z] of positions) {
      const ventGeo = new THREE.BoxGeometry(0.15, 0.005, 0.08);
      const vent = new THREE.Mesh(ventGeo, mat);
      vent.position.set(x, y, z);
      group.add(vent);
      // Louver slats
      for (let i = 0; i < 4; i++) {
        const slatGeo = new THREE.BoxGeometry(0.14, 0.002, 0.002);
        const slat = new THREE.Mesh(slatGeo, mat);
        slat.position.set(x, y + 0.003, z - 0.025 + i * 0.015);
        slat.rotation.x = 0.3;
        group.add(slat);
      }
    }
    return group;
  }

  // --- SIDE FENDER VENTS ---
  public static buildSideFenderVents(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'SideFenderVents';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.2 });
    for (const side of [-0.72, 0.72]) {
      const ventGeo = new THREE.BoxGeometry(0.02, 0.06, 0.12);
      const vent = new THREE.Mesh(ventGeo, mat);
      vent.position.set(0.3, 0.42, side);
      group.add(vent);
      // Chrome accent
      const chromeMat = new THREE.MeshPhysicalMaterial({ color: 0xdddddd, metalness: 0.95, roughness: 0.03, clearcoat: 1.0 });
      const accentGeo = new THREE.BoxGeometry(0.002, 0.003, 0.11);
      const accent = new THREE.Mesh(accentGeo, chromeMat);
      accent.position.set(0.3, 0.45, side);
      group.add(accent);
    }
    return group;
  }

  // --- REAR DIFFUSER ---
  public static buildRearDiffuser(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'RearDiffuser';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, metalness: 0.3, roughness: 0.2, clearcoat: 0.6 });
    // Main diffuser body
    const bodyGeo = new THREE.BoxGeometry(0.6, 0.04, 0.15);
    const body = new THREE.Mesh(bodyGeo, mat);
    body.position.set(0, 0.18, 1.75);
    group.add(body);
    // Fin vanes
    const finCount = 6;
    for (let i = 0; i < finCount; i++) {
      const finGeo = new THREE.BoxGeometry(0.003, 0.06, 0.12);
      const fin = new THREE.Mesh(finGeo, mat);
      fin.position.set(-0.25 + i * (0.5 / (finCount - 1)), 0.2, 1.75);
      fin.rotation.x = 0.15;
      group.add(fin);
    }
    return group;
  }

  // --- REAR SPOILER ---
  public static buildRearSpoiler(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'RearSpoiler';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, metalness: 0.5, roughness: 0.15, clearcoat: 0.8 });
    // Main blade
    const bladeGeo = new THREE.BoxGeometry(0.8, 0.008, 0.15);
    const blade = new THREE.Mesh(bladeGeo, mat);
    blade.position.set(-0.9, 0.62, 0);
    blade.rotation.x = 0.05;
    group.add(blade);
    // Gurney flap
    const gurneyGeo = new THREE.BoxGeometry(0.78, 0.015, 0.003);
    const gurney = new THREE.Mesh(gurneyGeo, mat);
    gurney.position.set(-0.9, 0.63, 0.07);
    group.add(gurney);
    // End plates
    for (const z of [-0.12, 0.12]) {
      const epGeo = new THREE.BoxGeometry(0.1, 0.04, 0.005);
      const ep = new THREE.Mesh(epGeo, mat);
      ep.position.set(-0.9, 0.61, z);
      group.add(ep);
    }
    // Uprights
    for (const z of [-0.08, 0.08]) {
      const upGeo = new THREE.BoxGeometry(0.005, 0.08, 0.005);
      const up = new THREE.Mesh(upGeo, mat);
      up.position.set(-0.9, 0.57, z);
      group.add(up);
    }
    return group;
  }

  // --- ROOF RAILS ---
  public static buildRoofRails(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'RoofRails';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.15, clearcoat: 0.6 });
    for (const side of [-0.35, 0.35]) {
      const railGeo = new THREE.BoxGeometry(0.8, 0.015, 0.02);
      const rail = new THREE.Mesh(railGeo, mat);
      rail.position.set(-0.1, 0.78, side);
      group.add(rail);
      // Mount feet
      for (const x of [-0.3, 0.15]) {
        const footGeo = new THREE.BoxGeometry(0.04, 0.02, 0.025);
        const foot = new THREE.Mesh(footGeo, mat);
        foot.position.set(x, 0.77, side);
        group.add(foot);
      }
    }
    return group;
  }

  // --- TOW HOOK COVER ---
  public static buildTowHookCover(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'TowHookCover';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.3 });
    const coverGeo = new THREE.CircleGeometry(0.02, 16);
    const cover = new THREE.Mesh(coverGeo, mat);
    cover.position.set(0, 0.35, 1.85);
    group.add(cover);
    return group;
  }

  // --- FRONT SPLITTER ---
  public static buildFrontSplitter(style: ExteriorDetailConfig['splitterStyle']): THREE.Group {
    const group = new THREE.Group();
    group.name = 'FrontSplitter';
    const carbonMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0a10, metalness: 0.4, roughness: 0.15, clearcoat: 1.0 });

    if (style === 'lip') {
      const lipGeo = new THREE.BoxGeometry(0.8, 0.005, 0.06);
      const lip = new THREE.Mesh(lipGeo, carbonMat);
      lip.position.set(0, 0.22, 1.8);
      group.add(lip);
    } else if (style === 'canards') {
      const lipGeo = new THREE.BoxGeometry(0.8, 0.005, 0.06);
      group.add(new THREE.Mesh(lipGeo, carbonMat));
      // Canard wings
      for (const side of [-0.35, 0.35]) {
        const canardGeo = new THREE.BoxGeometry(0.08, 0.003, 0.04);
        const canard = new THREE.Mesh(canardGeo, carbonMat);
        canard.position.set(side, 0.28, 1.78);
        canard.rotation.x = -0.2;
        group.add(canard);
      }
    } else if (style === 'full_splitter') {
      const splitGeo = new THREE.BoxGeometry(1.0, 0.006, 0.12);
      const split = new THREE.Mesh(splitGeo, carbonMat);
      split.position.set(0, 0.22, 1.82);
      group.add(split);
      // Support rods
      for (const x of [-0.25, 0.25]) {
        const rodGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.12, 6);
        const rod = new THREE.Mesh(rodGeo, new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.1 }));
        rod.position.set(x, 0.27, 1.8);
        rod.rotation.x = 0.8;
        group.add(rod);
      }
    }
    return group;
  }

  // --- LICENSE PLATE HOLDER ---
  public static buildLicensePlateHolder(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'LicensePlateHolder';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.4, roughness: 0.3 });
    const plateGeo = new THREE.BoxGeometry(0.005, 0.05, 0.12);
    const plate = new THREE.Mesh(plateGeo, mat);
    plate.position.set(0, 0.3, 1.86);
    group.add(plate);
    // Plate illumination LED
    const ledMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff0d0, emissiveIntensity: 1.5 });
    const ledGeo = new THREE.BoxGeometry(0.003, 0.002, 0.08);
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(0, 0.34, 1.86);
    group.add(led);
    return group;
  }

  // --- WINDOW TRIM ---
  public static buildWindowTrim(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'WindowTrim';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.15, clearcoat: 0.7 });
    // Upper window line
    const trimGeo = new THREE.BoxGeometry(0.003, 0.003, 1.4);
    const trim = new THREE.Mesh(trimGeo, mat);
    trim.position.set(0, 0.72, 0);
    group.add(trim);
    return group;
  }

  // --- PILLAR COVERS ---
  public static buildPillarCovers(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'PillarCovers';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, metalness: 0.5, roughness: 0.15, clearcoat: 0.8 });
    const pillars = [
      { pos: [0.55, 0.7, 0.6] as [number, number, number], size: [0.01, 0.12, 0.04] as [number, number, number] },
      { pos: [-0.2, 0.72, 0.6] as [number, number, number], size: [0.01, 0.1, 0.04] as [number, number, number] },
      { pos: [0.55, 0.7, -0.6] as [number, number, number], size: [0.01, 0.12, 0.04] as [number, number, number] },
      { pos: [-0.2, 0.72, -0.6] as [number, number, number], size: [0.01, 0.1, 0.04] as [number, number, number] },
    ];
    for (const p of pillars) {
      const geo = new THREE.BoxGeometry(p.size[0], p.size[1], p.size[2]);
      const pillar = new THREE.Mesh(geo, mat);
      pillar.position.set(p.pos[0], p.pos[1], p.pos[2]);
      group.add(pillar);
    }
    return group;
  }

  // --- EXHAUST HEAT SHIELD ---
  public static buildExhaustHeatShield(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'ExhaustHeatShield';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.85, roughness: 0.35 });
    const shieldGeo = new THREE.BoxGeometry(0.5, 0.003, 0.2);
    const shield = new THREE.Mesh(shieldGeo, mat);
    shield.position.set(0, 0.22, 1.65);
    group.add(shield);
    return group;
  }

  // --- ROCKER PANELS ---
  public static buildRockerPanels(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'RockerPanels';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.5, roughness: 0.2, clearcoat: 0.6 });
    for (const side of [-0.73, 0.73]) {
      const rockerGeo = new THREE.BoxGeometry(1.4, 0.03, 0.02);
      const rocker = new THREE.Mesh(rockerGeo, mat);
      rocker.position.set(0, 0.25, side);
      group.add(rocker);
    }
    return group;
  }
}
