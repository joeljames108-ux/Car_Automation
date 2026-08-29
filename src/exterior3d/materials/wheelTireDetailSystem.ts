// ====================================================================
// WHEEL, TIRE & BRAKE DETAIL SYSTEM - Expanded
// ====================================================================
// Complete wheel assembly generation:
// - 12 rim styles with detailed spoke geometry
// - 12 tire compounds with unique visual properties
// - Cross-drilled/slotted carbon ceramic brake rotors
// - Multi-piston calipers with branding
// - Beadlock rings, center locks, valve stems
// - Tire sidewall markings and tread patterns
// - Heat coloring on brake components
// ====================================================================

import * as THREE from 'three';

export type RimStyle =
  | 'split_5' | 'multi_spoke' | 'mesh_bbs' | 'turbofan' | 'solid_disc'
  | 'deep_dish' | 'directional_turbine' | 'forged_monoblock' | 'cross_spoke'
  | 'snowflake' | 'basketweave' | 'period_correct_wire';

export type TireCompound =
  | 'street' | 'semi_slick' | 'slick' | 'wet' | 'rally'
  | 'all_season' | 'winter_studless' | 'drag_radial' | 'drift_spec'
  | 'rally_gravel' | 'endurance_wet' | 'intermediate';

export interface WheelAssemblyConfig {
  rimDiameterInch: number;
  tireWidthMm: number;
  aspectRatio: number;
  rimStyle: RimStyle;
  rimFinish: 'gloss_black' | 'satin_platinum' | 'diamond_cut' | 'bronze' | 'gold'
    | 'matte_gunmetal' | 'polished_chrome' | 'brushed_titanium' | 'carbon_fiber'
    | 'anodized_red' | 'anodized_blue' | 'raw_forge';
  tireCompound: TireCompound;
  caliperPistons: number;
  rotorDiameterMm: number;
  rotorType: 'vented_steel' | 'carbon_ceramic' | 'slotted_steel' | 'drilled_carbon'
    | 'carbon_ceramic_drilled' | 'iron_vented_slotted';
  hasCenterLock: boolean;
  brakeDuctFins: boolean;
  beadlockRing: boolean;
  tireSidewall: 'standard' | 'low_profile' | 'raised_white' | 'outlined_white' | 'sponsor_sticker';
  wheelWeight: number; // kg
  offset: number; // mm
}

// --- RIM FINISH MATERIALS ---
const RIM_FINISH: Record<string, Partial<THREE.MeshPhysicalMaterialParameters>> = {
  gloss_black: { color: 0x0a0a0a, metalness: 0.85, roughness: 0.08, clearcoat: 1.0, clearcoatRoughness: 0.02 },
  satin_platinum: { color: 0xa0a5ac, metalness: 0.92, roughness: 0.22, clearcoat: 0.5, clearcoatRoughness: 0.15 },
  diamond_cut: { color: 0xd8dce4, metalness: 0.95, roughness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.01 },
  bronze: { color: 0x8b6914, metalness: 0.88, roughness: 0.25, clearcoat: 0.7, clearcoatRoughness: 0.08 },
  gold: { color: 0xd4a843, metalness: 0.95, roughness: 0.12, clearcoat: 0.9, clearcoatRoughness: 0.03 },
  matte_gunmetal: { color: 0x4a4e52, metalness: 0.82, roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.25 },
  polished_chrome: { color: 0xf0f0f0, metalness: 1.0, roughness: 0.02, clearcoat: 1.0, clearcoatRoughness: 0.005, envMapIntensity: 3.0 },
  brushed_titanium: { color: 0x8a8578, metalness: 0.94, roughness: 0.18, clearcoat: 0.6, clearcoatRoughness: 0.08 },
  carbon_fiber: { color: 0x0a0a10, metalness: 0.4, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.02, envMapIntensity: 1.5 },
  anodized_red: { color: 0x8b0000, metalness: 0.9, roughness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.05 },
  anodized_blue: { color: 0x003090, metalness: 0.9, roughness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.05 },
  raw_forge: { color: 0x909090, metalness: 0.85, roughness: 0.3, clearcoat: 0.4, clearcoatRoughness: 0.2 },
};

// --- TIRE COMPOUND PROPERTIES ---
interface TireCompoundData {
  roughness: number;
  color: number;
  treadDepth: number;
  gripCoeff: number;
  wearRate: number;
  heatBuildup: number;
  sidewallStiffness: number;
  treadPattern: 'asymmetric' | 'directional' | 'slick' | 'block' | 'rib' | 'hybrid';
}

const TIRE_COMPOUNDS: Record<TireCompound, TireCompoundData> = {
  street: { roughness: 0.85, color: 0x1a1c1e, treadDepth: 6.5, gripCoeff: 0.82, wearRate: 1.0, heatBuildup: 0.5, sidewallStiffness: 0.7, treadPattern: 'asymmetric' },
  semi_slick: { roughness: 0.72, color: 0x15171a, treadDepth: 3.0, gripCoeff: 0.92, wearRate: 1.8, heatBuildup: 0.7, sidewallStiffness: 0.85, treadPattern: 'directional' },
  slick: { roughness: 0.55, color: 0x181a1c, treadDepth: 0.5, gripCoeff: 0.98, wearRate: 3.5, heatBuildup: 0.9, sidewallStiffness: 0.95, treadPattern: 'slick' },
  wet: { roughness: 0.82, color: 0x1c1e20, treadDepth: 8.0, gripCoeff: 0.75, wearRate: 0.8, heatBuildup: 0.3, sidewallStiffness: 0.65, treadPattern: 'directional' },
  rally: { roughness: 0.88, color: 0x1a1c1e, treadDepth: 10.0, gripCoeff: 0.78, wearRate: 2.2, heatBuildup: 0.6, sidewallStiffness: 0.8, treadPattern: 'block' },
  all_season: { roughness: 0.88, color: 0x1b1d1f, treadDepth: 7.5, gripCoeff: 0.72, wearRate: 0.6, heatBuildup: 0.4, sidewallStiffness: 0.6, treadPattern: 'hybrid' },
  winter_studless: { roughness: 0.92, color: 0x1d1f22, treadDepth: 9.0, gripCoeff: 0.65, wearRate: 0.5, heatBuildup: 0.2, sidewallStiffness: 0.5, treadPattern: 'block' },
  drag_radial: { roughness: 0.65, color: 0x141618, treadDepth: 1.2, gripCoeff: 0.95, wearRate: 2.8, heatBuildup: 0.85, sidewallStiffness: 0.4, treadPattern: 'rib' },
  drift_spec: { roughness: 0.78, color: 0x191b1e, treadDepth: 4.0, gripCoeff: 0.70, wearRate: 4.0, heatBuildup: 0.75, sidewallStiffness: 0.7, treadPattern: 'directional' },
  rally_gravel: { roughness: 0.90, color: 0x1a1c1e, treadDepth: 12.0, gripCoeff: 0.60, wearRate: 3.0, heatBuildup: 0.5, sidewallStiffness: 0.75, treadPattern: 'block' },
  endurance_wet: { roughness: 0.80, color: 0x1b1d20, treadDepth: 7.0, gripCoeff: 0.78, wearRate: 0.7, heatBuildup: 0.35, sidewallStiffness: 0.65, treadPattern: 'directional' },
  intermediate: { roughness: 0.76, color: 0x1a1c1f, treadDepth: 4.5, gripCoeff: 0.85, wearRate: 1.2, heatBuildup: 0.6, sidewallStiffness: 0.75, treadPattern: 'hybrid' },
};

// --- WHEEL TIRE DETAIL SYSTEM ---
export class WheelTireDetailSystem {
  public static buildWheelAssembly(config: WheelAssemblyConfig): THREE.Group {
    const group = new THREE.Group();
    group.name = 'WheelTireAssembly';

    const rimR = (config.rimDiameterInch * 0.0254) / 2;
    const tireR = rimR + (config.tireWidthMm * (config.aspectRatio / 100)) / 1000;
    const tireW = config.tireWidthMm / 1000;
    const rimW = tireW * 0.7;

    // Tire
    group.add(this.buildTire(tireR, tireW, rimR, config.tireCompound, config.tireSidewall));

    // Rim
    group.add(this.buildRim(rimR, rimW, config.rimStyle, config.rimFinish));

    // Beadlock ring
    if (config.beadlockRing) group.add(this.buildBeadlockRing(rimR, rimW));

    // Brake assembly
    const discR = (config.rotorDiameterMm / 1000) / 2;
    const disc = this.buildBrakeDisc(discR, config.rotorType, config.rotorDiameterMm);
    disc.position.z = -rimW * 0.3;
    group.add(disc);

    // Caliper
    const caliper = this.buildCaliper(config.caliperPistons, discR, config.rotorType);
    caliper.position.set(discR * 0.6, 0, -rimW * 0.15);
    group.add(caliper);

    // Brake duct fins
    if (config.brakeDuctFins) group.add(this.buildBrakeDuctFins(discR));

    // Center hardware
    group.add(config.hasCenterLock ? this.buildCenterLock() : this.buildLugNuts(5));

    // Valve stem
    const valve = this.buildValveStem();
    valve.position.set(0, rimR * 0.85, tireW * 0.4);
    group.add(valve);

    // TPMS sensor
    const tpms = this.buildTPMSSensor();
    tpms.position.set(rimR * 0.3, 0, tireW * 0.3);
    group.add(tpms);

    return group;
  }

  // --- TIRE ---
  public static buildTire(outerR: number, width: number, innerR: number, compound: TireCompound, sidewall: string): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Tire';

    const tc = TIRE_COMPOUNDS[compound];
    const tireMat = new THREE.MeshPhysicalMaterial({
      color: tc.color, roughness: tc.roughness, metalness: 0.02,
      clearcoat: 0.05, clearcoatRoughness: 0.6,
      sheen: 0.1, sheenColor: new THREE.Color(0x303030),
    });

    // Main tire body
    const tubeR = (outerR - innerR) / 2;
    const tireGeo = new THREE.TorusGeometry(innerR + tubeR, tubeR, 32, 64);
    tireGeo.computeVertexNormals();
    const tireMesh = new THREE.Mesh(tireGeo, tireMat);
    tireMesh.rotation.y = Math.PI / 2;
    tireMesh.castShadow = true;
    group.add(tireMesh);

    // Sidewall band
    const swGeo = new THREE.TorusGeometry(outerR - tubeR * 0.2, tubeR * 0.15, 8, 64);
    const swMat = new THREE.MeshPhysicalMaterial({ color: 0x111214, roughness: 0.9, metalness: 0, clearcoat: 0.1 });
    const sw = new THREE.Mesh(swGeo, swMat);
    sw.rotation.y = Math.PI / 2;
    group.add(sw);

    // Sidewall text band (brand)
    const brandGeo = new THREE.TorusGeometry(outerR - tubeR * 0.1, tubeR * 0.08, 6, 64);
    const brandMat = new THREE.MeshPhysicalMaterial({ color: 0x222222, roughness: 0.85, metalness: 0.0 });
    const brand = new THREE.Mesh(brandGeo, brandMat);
    brand.rotation.y = Math.PI / 2;
    group.add(brand);

    // Raised white lettering band
    if (sidewall === 'raised_white' || sidewall === 'outlined_white') {
      const wlGeo = new THREE.TorusGeometry(outerR - tubeR * 0.12, tubeR * 0.04, 6, 64);
      const wlMat = new THREE.MeshPhysicalMaterial({
        color: sidewall === 'raised_white' ? 0xf0f0f0 : 0xf0f0f0,
        roughness: 0.7, metalness: 0,
        emissive: 0xf0f0f0, emissiveIntensity: sidewall === 'outlined_white' ? 0.1 : 0,
      });
      const wl = new THREE.Mesh(wlGeo, wlMat);
      wl.rotation.y = Math.PI / 2;
      group.add(wl);
    }

    // Tread surface (for deep-tread compounds)
    if (tc.treadDepth > 2) {
      const treadGeo = new THREE.TorusGeometry(outerR, tubeR * 0.12, 16, 64);
      const treadMat = new THREE.MeshPhysicalMaterial({ color: tc.color, roughness: tc.roughness * 1.05, metalness: 0 });
      const tread = new THREE.Mesh(treadGeo, treadMat);
      tread.rotation.y = Math.PI / 2;
      group.add(tread);
    }

    // Siping lines for winter/intermediate compounds
    if (compound === 'winter_studless' || compound === 'endurance_wet') {
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const sipeGeo = new THREE.BoxGeometry(0.002, tubeR * 0.6, tubeR * 0.05);
        const sipe = new THREE.Mesh(sipeGeo, new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.95 }));
        sipe.position.set(0, Math.sin(angle) * outerR, Math.cos(angle) * outerR);
        sipe.rotation.x = angle;
        group.add(sipe);
      }
    }

    // Stud holes for winter tires
    if (compound === 'winter_studless') {
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const studGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.01, 8);
        const studMat = new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
        const stud = new THREE.Mesh(studGeo, studMat);
        stud.position.set(0, Math.sin(angle) * outerR * 0.98, Math.cos(angle) * outerR * 0.98);
        group.add(stud);
      }
    }

    return group;
  }

  // --- RIM ---
  public static buildRim(radius: number, width: number, style: RimStyle, finish: string): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Rim';

    const mat = new THREE.MeshPhysicalMaterial(RIM_FINISH[finish] || RIM_FINISH.gloss_black);

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(radius, radius, width, 64, 1, true);
    barrelGeo.rotateZ(Math.PI / 2);
    barrelGeo.computeVertexNormals();
    group.add(new THREE.Mesh(barrelGeo, mat));

    // Spokes
    group.add(this.generateSpokes(radius, width, style, mat));

    // Outer lip
    const lipGeo = new THREE.TorusGeometry(radius, width * 0.03, 8, 64);
    const lip = new THREE.Mesh(lipGeo, mat);
    lip.rotation.y = Math.PI / 2;
    group.add(lip);

    // Inner lip
    const innerLipGeo = new THREE.TorusGeometry(radius * 0.98, width * 0.02, 8, 64);
    const innerLip = new THREE.Mesh(innerLipGeo, mat);
    innerLip.rotation.y = Math.PI / 2;
    innerLip.position.x = -width;
    group.add(innerLip);

    // Center hub
    const centerGeo = new THREE.CylinderGeometry(radius * 0.25, radius * 0.25, width * 0.15, 32);
    centerGeo.rotateZ(Math.PI / 2);
    group.add(new THREE.Mesh(centerGeo, mat));

    // Center cap
    const capGeo = new THREE.CylinderGeometry(radius * 0.15, radius * 0.15, width * 0.05, 24);
    capGeo.rotateZ(Math.PI / 2);
    const capMat = new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.95, roughness: 0.08, clearcoat: 1.0 });
    group.add(new THREE.Mesh(capGeo, capMat));

    // Ventilation holes (for drilled/disc styles)
    if (style !== 'solid_disc') {
      const ventCount = style === 'basketweave' ? 8 : 6;
      for (let i = 0; i < ventCount; i++) {
        const angle = (i / ventCount) * Math.PI * 2;
        const ventGeo = new THREE.CylinderGeometry(radius * 0.04, radius * 0.04, width * 0.06, 12);
        ventGeo.rotateZ(Math.PI / 2);
        const ventMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, metalness: 0.3, roughness: 0.4 });
        const vent = new THREE.Mesh(ventGeo, ventMat);
        vent.position.set(0, Math.sin(angle) * radius * 0.6, Math.cos(angle) * radius * 0.6);
        group.add(vent);
      }
    }

    return group;
  }

  private static generateSpokes(radius: number, width: number, style: RimStyle, mat: THREE.MeshPhysicalMaterial): THREE.Group {
    const group = new THREE.Group();

    const spokeCounts: Record<string, number> = {
      split_5: 10, multi_spoke: 20, mesh_bbs: 25, turbofan: 12,
      solid_disc: 0, deep_dish: 5, directional_turbine: 8,
      forged_monoblock: 6, cross_spoke: 16, snowflake: 6,
      basketweave: 24, period_correct_wire: 32,
    };
    const spokeCount = spokeCounts[style] || 5;

    if (style === 'solid_disc') {
      const dGeo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, width * 0.04, 64);
      dGeo.rotateZ(Math.PI / 2);
      group.add(new THREE.Mesh(dGeo, mat));
      return group;
    }

    // Turbofan — add fin ring
    if (style === 'turbofan') {
      const fanGeo = new THREE.TorusGeometry(radius * 0.9, width * 0.08, 4, 64);
      const fan = new THREE.Mesh(fanGeo, mat);
      fan.rotation.y = Math.PI / 2;
      group.add(fan);
    }

    // Deep dish — add stepped lip
    if (style === 'deep_dish') {
      const stepGeo = new THREE.CylinderGeometry(radius * 0.85, radius * 0.85, width * 0.15, 32, 1, true);
      stepGeo.rotateZ(Math.PI / 2);
      group.add(new THREE.Mesh(stepGeo, mat));
    }

    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * Math.PI * 2;

      // Main spoke geometry varies by style
      const spokeW = style === 'cross_spoke' ? width * 0.05 : width * 0.08;
      const spokeH = radius * (style === 'basketweave' ? 0.6 : 0.85);
      const spokeD = radius * 0.08;

      let sGeo: THREE.BufferGeometry;
      if (style === 'directional_turbine' || style === 'basketweave') {
        // Curved turbine blade
        sGeo = new THREE.BoxGeometry(spokeW, spokeH, spokeD);
      } else {
        sGeo = new THREE.BoxGeometry(spokeW, spokeH, spokeD);
      }

      sGeo.rotateX(angle);
      const spoke = new THREE.Mesh(sGeo, mat);
      spoke.position.set(0, Math.sin(angle) * radius * 0.45, Math.cos(angle) * radius * 0.45);
      group.add(spoke);

      // Cross-spoke add perpendicular bridge
      if (style === 'cross_spoke' && i % 2 === 0) {
        const bridgeGeo = new THREE.BoxGeometry(spokeW * 0.8, spokeH * 0.4, spokeD * 0.8);
        bridgeGeo.rotateX(angle + Math.PI / spokeCount);
        const bridge = new THREE.Mesh(bridgeGeo, mat);
        bridge.position.set(0, Math.sin(angle) * radius * 0.35, Math.cos(angle) * radius * 0.35);
        group.add(bridge);
      }

      // Wire spoke add thin wire
      if (style === 'period_correct_wire') {
        const wireGeo = new THREE.CylinderGeometry(0.001, 0.001, radius * 0.8, 4);
        wireGeo.rotateX(angle);
        const wire = new THREE.Mesh(wireGeo, mat);
        wire.position.set(0, Math.sin(angle) * radius * 0.45, Math.cos(angle) * radius * 0.45);
        group.add(wire);
      }
    }

    return group;
  }

  // --- BRAKE DISC ---
  public static buildBrakeDisc(radius: number, type: string, diameterMm: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'BrakeDisc';

    const isCarbon = type.includes('carbon');
    const isSlotted = type.includes('slotted');
    const isDrilled = type.includes('drilled');

    const mat = new THREE.MeshPhysicalMaterial({
      color: isCarbon ? 0x222225 : 0x888890,
      metalness: isCarbon ? 0.4 : 0.92,
      roughness: isCarbon ? 0.6 : 0.18,
      clearcoat: 0.2,
    });

    // Main disc
    const discGeo = new THREE.CylinderGeometry(radius, radius, 0.02, 64);
    discGeo.rotateZ(Math.PI / 2);
    group.add(new THREE.Mesh(discGeo, mat));

    // Hat bell mounting
    const hatGeo = new THREE.CylinderGeometry(radius * 0.45, radius * 0.45, 0.035, 32);
    hatGeo.rotateZ(Math.PI / 2);
    const hatMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.85, roughness: 0.3 });
    group.add(new THREE.Mesh(hatGeo, hatMat));

    // Mounting bolts
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const boltGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.04, 6);
      boltGeo.rotateZ(Math.PI / 2);
      const boltMat = new THREE.MeshPhysicalMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.15 });
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.set(0, Math.sin(angle) * radius * 0.35, Math.cos(angle) * radius * 0.35);
      group.add(bolt);
    }

    // Cross-drilled holes
    if (isDrilled) {
      const drillCount = Math.floor(radius * 80);
      for (let ring = 0; ring < 3; ring++) {
        const ringR = radius * (0.55 + ring * 0.12);
        for (let i = 0; i < drillCount; i++) {
          const angle = (i / drillCount) * Math.PI * 2 + ring * 0.15;
          const holeGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.025, 6);
          holeGeo.rotateZ(Math.PI / 2);
          const holeMat = new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.5, roughness: 0.4 });
          const hole = new THREE.Mesh(holeGeo, holeMat);
          hole.position.set(0, Math.sin(angle) * ringR, Math.cos(angle) * ringR);
          group.add(hole);
        }
      }
    }

    // Slots
    if (isSlotted) {
      const slotCount = 8;
      for (let i = 0; i < slotCount; i++) {
        const angle = (i / slotCount) * Math.PI * 2;
        const slotGeo = new THREE.BoxGeometry(0.001, 0.01, radius * 0.35);
        const slotMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, metalness: 0.3, roughness: 0.5 });
        const slot = new THREE.Mesh(slotGeo, slotMat);
        slot.rotation.z = angle;
        slot.position.set(0, Math.sin(angle) * radius * 0.65, Math.cos(angle) * radius * 0.65);
        group.add(slot);
      }
    }

    // Vented internal vanes
    const vaneCount = 12;
    for (let i = 0; i < vaneCount; i++) {
      const angle = (i / vaneCount) * Math.PI * 2;
      const vaneGeo = new THREE.BoxGeometry(0.015, 0.008, radius * 0.45);
      const vane = new THREE.Mesh(vaneGeo, mat);
      vane.rotation.z = angle;
      vane.position.set(0, Math.sin(angle) * radius * 0.55, Math.cos(angle) * radius * 0.55);
      group.add(vane);
    }

    // Heat coloring for carbon ceramic
    if (isCarbon) {
      const heatMat = new THREE.MeshPhysicalMaterial({
        color: 0x886633, emissive: 0x442200, emissiveIntensity: 0.1,
        metalness: 0.5, roughness: 0.3, transparent: true, opacity: 0.15,
      });
      const heatGeo = new THREE.CylinderGeometry(radius * 0.7, radius * 0.7, 0.021, 64);
      heatGeo.rotateZ(Math.PI / 2);
      group.add(new THREE.Mesh(heatGeo, heatMat));
    }

    return group;
  }

  // --- CALIPER ---
  public static buildCaliper(pistons: number, discRadius: number, rotorType: string): THREE.Group {
    const group = new THREE.Group();
    group.name = 'BrakeCaliper';

    // Caliper body color based on piston count
    const caliperColor = pistons >= 10 ? 0xffb703 : pistons >= 8 ? 0xd90429 : pistons >= 6 ? 0xff4444 : 0x2b2d42;
    const cMat = new THREE.MeshPhysicalMaterial({
      color: caliperColor, metalness: 0.6, roughness: 0.25, clearcoat: 0.9,
    });

    // Main body
    const bW = discRadius * 0.4, bH = discRadius * 0.6, bD = 0.06;
    const bGeo = new THREE.BoxGeometry(bD, bH, bW);
    bGeo.translate(0, 0, -bW / 2);
    group.add(new THREE.Mesh(bGeo, cMat));

    // Piston bores
    for (let i = 0; i < pistons; i++) {
      const py = (i - (pistons - 1) / 2) * (bH * 0.7 / Math.max(pistons - 1, 1));
      const pistonGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.015, 16);
      pistonGeo.rotateZ(Math.PI / 2);
      const pistonMat = new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.95, roughness: 0.08 });
      const piston = new THREE.Mesh(pistonGeo, pistonMat);
      piston.position.set(-bD / 2 - 0.005, py, -bW / 2);
      group.add(piston);
    }

    // Bleed nipple
    const bleedGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.02, 8);
    const bleedMat = new THREE.MeshPhysicalMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 });
    const bleed = new THREE.Mesh(bleedGeo, bleedMat);
    bleed.position.set(bD / 2 + 0.01, bH * 0.4, -bW / 2);
    group.add(bleed);

    // Brake line fitting
    const lineGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.03, 8);
    const line = new THREE.Mesh(lineGeo, bleedMat);
    line.position.set(0, bH * 0.45, -bW * 0.3);
    group.add(line);

    // Pad backing plate
    const padGeo = new THREE.BoxGeometry(0.004, bH * 0.6, bW * 0.8);
    const padMat = new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.3, roughness: 0.7 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(bD * 0.3, 0, -bW / 2);
    group.add(pad);

    // Pad friction material
    const frictionGeo = new THREE.BoxGeometry(0.003, bH * 0.55, bW * 0.75);
    const frictionMat = new THREE.MeshPhysicalMaterial({ color: 0x555555, metalness: 0.1, roughness: 0.85 });
    const friction = new THREE.Mesh(frictionGeo, frictionMat);
    friction.position.set(bD * 0.32, 0, -bW / 2);
    group.add(friction);

    // Branding ridge on caliper face
    const ridgeGeo = new THREE.BoxGeometry(bD * 0.01, bH * 0.15, bW * 0.5);
    const ridgeMat = new THREE.MeshPhysicalMaterial({ color: caliperColor, metalness: 0.7, roughness: 0.2, clearcoat: 1.0 });
    const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
    ridge.position.set(-bD / 2 - 0.001, 0, -bW / 2);
    group.add(ridge);

    return group;
  }

  // --- BRAKE DUCT FINS ---
  public static buildBrakeDuctFins(discRadius: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'BrakeDuctFins';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.4, roughness: 0.3, clearcoat: 0.5 });
    const finCount = 6;
    for (let i = 0; i < finCount; i++) {
      const angle = (i / finCount) * Math.PI * 2;
      const finGeo = new THREE.BoxGeometry(discRadius * 0.15, 0.003, discRadius * 0.08);
      const fin = new THREE.Mesh(finGeo, mat);
      fin.position.set(
        -discRadius * 0.8,
        Math.sin(angle) * discRadius * 0.4,
        Math.cos(angle) * discRadius * 0.4
      );
      fin.rotation.x = angle;
      group.add(fin);
    }
    return group;
  }

  // --- CENTER LOCK ---
  public static buildCenterLock(): THREE.Group {
    const g = new THREE.Group();
    g.name = 'CenterLock';
    const m = new THREE.MeshPhysicalMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.15, clearcoat: 0.8 });

    // Main nut body
    const nutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6);
    g.add(new THREE.Mesh(nutGeo, m));

    // Central marking dot
    const dotMat = new THREE.MeshPhysicalMaterial({ color: 0xff2200, emissive: 0xff0000, emissiveIntensity: 0.5 });
    const dotGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.005, 8);
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.y = 0.016;
    g.add(dot);

    return g;
  }

  // --- LUG NUTS ---
  public static buildLugNuts(count: number): THREE.Group {
    const g = new THREE.Group();
    g.name = 'LugNuts';
    const m = new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.92, roughness: 0.12 });
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      // Hex nut body
      const lGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6);
      lGeo.rotateX(Math.PI / 2);
      const lug = new THREE.Mesh(lGeo, m);
      lug.position.set(Math.cos(a) * 0.025, Math.sin(a) * 0.025, 0.01);
      g.add(lug);
      // Acorn seat
      const seatGeo = new THREE.ConeGeometry(0.007, 0.008, 6);
      seatGeo.rotateX(Math.PI / 2);
      const seat = new THREE.Mesh(seatGeo, m);
      seat.position.set(Math.cos(a) * 0.025, Math.sin(a) * 0.025, 0.02);
      g.add(seat);
    }
    return g;
  }

  // --- VALVE STEM ---
  public static buildValveStem(): THREE.Group {
    const g = new THREE.Group();
    g.name = 'ValveStem';
    const m = new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 });
    const stemGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.02, 12);
    stemGeo.rotateX(Math.PI / 2);
    g.add(new THREE.Mesh(stemGeo, m));
    // Valve cap
    const capMat = new THREE.MeshPhysicalMaterial({ color: 0x222222, metalness: 0.5, roughness: 0.2 });
    const capGeo = new THREE.CylinderGeometry(0.005, 0.004, 0.008, 8);
    capGeo.rotateX(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.z = 0.012;
    g.add(cap);
    return g;
  }

  // --- TPMS SENSOR ---
  public static buildTPMSSensor(): THREE.Group {
    const g = new THREE.Group();
    g.name = 'TPMS';
    const m = new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.4 });
    const bodyGeo = new THREE.BoxGeometry(0.02, 0.01, 0.015);
    g.add(new THREE.Mesh(bodyGeo, m));
    return g;
  }

  // --- BEADLOCK RING ---
  public static buildBeadlockRing(rimRadius: number, rimWidth: number): THREE.Group {
    const g = new THREE.Group();
    g.name = 'BeadlockRing';
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xff4400, metalness: 0.7, roughness: 0.25, clearcoat: 0.8 });
    const ringGeo = new THREE.TorusGeometry(rimRadius, rimWidth * 0.04, 8, 64);
    const ring = new THREE.Mesh(ringGeo, mat);
    ring.rotation.y = Math.PI / 2;
    g.add(ring);
    // Bolts around the ring
    const boltCount = 20;
    for (let i = 0; i < boltCount; i++) {
      const angle = (i / boltCount) * Math.PI * 2;
      const boltGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.012, 6);
      const boltMat = new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.1 });
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.set(0, Math.sin(angle) * rimRadius, Math.cos(angle) * rimRadius);
      bolt.rotation.x = angle;
      g.add(bolt);
    }
    return g;
  }
}
