// ============================================================================
// ENGINE BLOCK SCULPTOR — REALISTIC BODY, OIL PAN, HEADS & ACCESSORY DETAIL
// Replaces primitive BoxGeometry blocks with sculpted, realistic cast shapes
// Adds oil pans, sumps, mounting bosses, fastener detail, and accessories
// ============================================================================

import * as THREE from "three";
import type { V12BlockMaterialPalette } from "./engineBlockGenerator";
import {
  createHexBoltHead,
  createAllenSocketHead,
  createCoreFreezePlug,
  create12PointHead,
  mergeBufferGeometries,
} from "./geometryDetailUtils";

// ============================================================================
// 1. SCULPTED V-ENGINE BLOCK BODY — Realistic cast aluminum shape
//    Uses LatheGeometry with engineering profile curves for lifter bores,
//    webbing valleys, and realistic casting contours
// ============================================================================

export interface BlockBodySpec {
  cylindersPerBank: number;
  bankAngleDeg: number;
  boreDiameter: number;
  boreSpacing: number;
  deckHeight: number;
  totalLength: number;
  blockWidth: number;
}

export function buildSculptedVBlockBody(
  spec: BlockBodySpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = "Sculpted_V_Block_Body";

  const halfV = (spec.bankAngleDeg / 2) * (Math.PI / 180);
  const halfLen = spec.totalLength / 2;
  const deckH = spec.deckHeight;

  // --- Main Block Casting (per bank) ---
  for (const side of [-1, 1]) {
    const bankGroup = new THREE.Group();
    bankGroup.name = "Block_Bank_" + (side > 0 ? "Left" : "Right");

    // Realistic block profile using extruded cross-section
    // Profile: lifter valley -> deck surface -> skirt -> crankcase rail
    const shape = new THREE.Shape();
    const hw = spec.blockWidth * 0.38;
    const dh = deckH * 0.85;

    // Bottom crankcase rail
    shape.moveTo(-hw, 0);
    shape.lineTo(hw, 0);
    // Outer skirt wall (slight draft angle for casting)
    shape.lineTo(hw + 0.008, dh * 0.15);
    // Lifter bore bulge area
    shape.lineTo(hw + 0.012, dh * 0.35);
    // Webbing relief valley
    shape.lineTo(hw + 0.006, dh * 0.50);
    // Upper deck transition
    shape.lineTo(hw + 0.010, dh * 0.70);
    // Deck surface
    shape.lineTo(hw - 0.005, dh * 0.95);
    shape.lineTo(0, dh);
    // Inner bank valley wall
    shape.lineTo(-hw * 0.3, dh * 0.85);
    shape.lineTo(-hw * 0.25, dh * 0.40);
    shape.lineTo(-hw * 0.30, 0);
    shape.lineTo(-hw, 0);

    const extrudeSettings = {
      depth: spec.totalLength * 0.96,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 3,
    };
    const blockGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const blockMesh = new THREE.Mesh(blockGeo, materials.castAluminumBlock);
    blockMesh.position.set(-spec.totalLength * 0.48, 0, 0);
    blockMesh.rotation.y = Math.PI / 2;
    blockMesh.position.y = -deckH * 0.5;
    blockMesh.rotation.x = side * halfV;
    blockMesh.castShadow = true;
    blockMesh.receiveShadow = true;
    bankGroup.add(blockMesh);

    // --- CNC Machined Deck Surface (visible face on top) ---
    const deckGeo = new THREE.BoxGeometry(
      spec.totalLength * 0.94,
      0.006,
      spec.blockWidth * 0.72
    );
    const deckMesh = new THREE.Mesh(deckGeo, materials.machinedDeckSurface);
    deckMesh.position.set(0, deckH * 0.43, side * deckH * 0.32);
    deckMesh.rotation.x = side * halfV;
    deckMesh.receiveShadow = true;
    bankGroup.add(deckMesh);

    // --- Structural Webbing Ribs on outer skirt ---
    const ribCount = spec.cylindersPerBank * 2 + 2;
    for (let r = 0; r < ribCount; r++) {
      const rx = -halfLen + (r / (ribCount - 1)) * spec.totalLength * 0.92;
      const ribH = deckH * (0.25 + 0.1 * Math.sin(r * 0.8));
      const ribGeo = new THREE.BoxGeometry(0.004, ribH, 0.014);
      const ribMesh = new THREE.Mesh(ribGeo, materials.castAluminumBlock);
      ribMesh.position.set(rx, -deckH * 0.38, side * (spec.blockWidth * 0.42));
      ribMesh.rotation.x = side * halfV * 0.3;
      bankGroup.add(ribMesh);
    }

    // --- Lifter Bore Bosses (visible on valley side) ---
    for (let i = 0; i < spec.cylindersPerBank; i++) {
      const lx = -halfLen + (i + 0.5) * spec.boreSpacing;
      const lifterGeo = new THREE.CylinderGeometry(
        spec.boreDiameter * 0.22, spec.boreDiameter * 0.22, 0.028, 16
      );
      const lifterMesh = new THREE.Mesh(lifterGeo, materials.machinedDeckSurface);
      lifterMesh.position.set(lx, deckH * 0.30, side * spec.boreDiameter * 0.15);
      lifterMesh.rotation.x = side * halfV;
      bankGroup.add(lifterMesh);
    }

    // --- Freeze Plugs (cast core plugs on outer skirt) ---
    for (let i = 0; i < spec.cylindersPerBank + 1; i++) {
      const px = -halfLen + i * spec.boreSpacing;
      const plugGeo = createCoreFreezePlug(0.014, 0.006, 0.0012);
      plugGeo.rotateX(side > 0 ? Math.PI / 2 : -Math.PI / 2);
      plugGeo.rotateZ(Math.PI / 2);
      plugGeo.translate(px, -deckH * 0.15, side * (spec.blockWidth * 0.44));
      const plugMesh = new THREE.Mesh(plugGeo, materials.brassFreezePlug);
      bankGroup.add(plugMesh);
    }

    group.add(bankGroup);
  }

  // --- Valley Floor Between Banks ---
  const valleyGeo = new THREE.BoxGeometry(
    spec.totalLength * 0.88, 0.010, spec.blockWidth * 0.25
  );
  const valleyMesh = new THREE.Mesh(valleyGeo, materials.machinedDeckSurface);
  valleyMesh.position.set(0, deckH * 0.25, 0);
  valleyMesh.receiveShadow = true;
  group.add(valleyMesh);

  return group;
}

// ============================================================================
// 2. OIL PAN / SUMP — Stamped steel, cast aluminum, or dry sump detail
// ============================================================================

export function buildOilPan(
  totalLength: number, blockWidth: number, deckHeight: number,
  materials: V12BlockMaterialPalette,
  drySump: boolean = false
): THREE.Group {
  const group = new THREE.Group();
  group.name = drySump ? "Dry_Sump_Reservoir" : "Wet_Sump_Oil_Pan";
  const panDepth = drySump ? 0.035 : 0.075;
  const panWidth = blockWidth * 0.88;
  const panLength = totalLength * 0.92;

  // Main pan body (tapered toward drain)
  const panShape = new THREE.Shape();
  const hw = panWidth / 2;
  panShape.moveTo(-hw, 0);
  panShape.lineTo(hw, 0);
  panShape.lineTo(hw - 0.008, -panDepth * 0.3);
  panShape.lineTo(hw * 0.6, -panDepth * 0.85);
  panShape.lineTo(hw * 0.3, -panDepth);
  panShape.lineTo(-hw * 0.3, -panDepth);
  panShape.lineTo(-hw * 0.6, -panDepth * 0.85);
  panShape.lineTo(-hw + 0.008, -panDepth * 0.3);
  panShape.lineTo(-hw, 0);

  const panGeo = new THREE.ExtrudeGeometry(panShape, {
    depth: panLength,
    bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2,
  });
  panGeo.rotateY(Math.PI / 2);
  const panMat = drySump ? materials.castAluminumBlock :
    new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.7, roughness: 0.4 });
  const panMesh = new THREE.Mesh(panGeo, panMat);
  panMesh.position.set(0, -deckHeight * 0.35, 0);
  panMesh.castShadow = true;
  group.add(panMesh);

  // Pan-to-block mounting flange with fasteners
  const flangeGeo = new THREE.BoxGeometry(panLength * 1.02, 0.006, panWidth * 1.04);
  const flangeMesh = new THREE.Mesh(flangeGeo, materials.machinedDeckSurface);
  flangeMesh.position.set(0, -deckHeight * 0.35 + 0.003, 0);
  group.add(flangeMesh);

  // Perimeter flange bolts (M8 x 1.25)
  const boltGeos: THREE.BufferGeometry[] = [];
  const boltSpacing = 0.040;
  for (let x = -panLength/2 + 0.02; x < panLength/2; x += boltSpacing) {
    for (const zSign of [-1, 1]) {
      const b = createHexBoltHead(0.006, 0.008);
      b.translate(x, -deckHeight * 0.35 + 0.012, zSign * (panWidth * 0.48));
      boltGeos.push(b);
    }
  }
  if (boltGeos.length > 0) {
    const merged = mergeBufferGeometries(boltGeos);
    group.add(new THREE.Mesh(merged, materials.arpHardenedFastener));
  }

  // Oil drain plug (magnetic, M14 x 1.5)
  const drainPlug = createHexBoltHead(0.012, 0.015);
  drainPlug.rotateX(-Math.PI / 2);
  drainPlug.translate(0, -panDepth - deckHeight * 0.35 + 0.012, 0);
  const drainMesh = new THREE.Mesh(drainPlug, materials.arpHardenedFastener);
  group.add(drainMesh);

  // Oil level sensor boss
  const sensorBoss = new THREE.CylinderGeometry(0.010, 0.012, 0.018, 12);
  sensorBoss.translate(panLength * 0.3, -deckHeight * 0.35 - panDepth * 0.5, panWidth * 0.35);
  group.add(new THREE.Mesh(sensorBoss, materials.castAluminumBlock));

  // Oil pan baffle plate (windage tray)
  if (!drySump) {
    const baffleGeo = new THREE.BoxGeometry(panLength * 0.85, 0.002, panWidth * 0.70);
    const baffleMesh = new THREE.Mesh(baffleGeo,
      new THREE.MeshStandardMaterial({ color: 0x718096, metalness: 0.8, roughness: 0.3 }));
    baffleMesh.position.set(0, -deckHeight * 0.35 - panDepth * 0.45, 0);
    group.add(baffleMesh);
  }

  return group;
}

// ============================================================================
// 3. ENGINE MOUNTING BOSSES & VIBRATION DAMPENER
// ============================================================================

export function buildEngineMountBosses(
  totalLength: number, deckHeight: number, blockWidth: number,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = "Engine_Mount_Bosses";
  const mountPositions = [
    { x: totalLength * 0.35, z: blockWidth * 0.48 },
    { x: totalLength * 0.35, z: -blockWidth * 0.48 },
    { x: -totalLength * 0.35, z: blockWidth * 0.48 },
    { x: -totalLength * 0.35, z: -blockWidth * 0.48 },
  ];

  for (const pos of mountPositions) {
    // Mount boss pad (reinforced casting)
    const bossGeo = new THREE.CylinderGeometry(0.022, 0.025, 0.024, 20);
    bossGeo.rotateX(Math.PI / 2);
    const bossMesh = new THREE.Mesh(bossGeo, materials.castAluminumBlock);
    bossMesh.position.set(pos.x, -deckHeight * 0.15, pos.z);
    bossMesh.castShadow = true;
    group.add(bossMesh);

    // Mount bolt (M12 x 1.75)
    const bolt = create12PointHead(0.010, 0.014, 0.016, 0.004);
    bolt.rotateX(Math.PI / 2);
    bolt.translate(pos.x, -deckHeight * 0.15 + 0.015, pos.z);
    group.add(new THREE.Mesh(bolt, materials.arpHardenedFastener));

    // Reinforcement gusset between boss and block
    const gussetShape = new THREE.Shape();
    gussetShape.moveTo(0, 0);
    gussetShape.lineTo(0.018, 0);
    gussetShape.lineTo(0, 0.025);
    gussetShape.closePath();
    const gussetGeo = new THREE.ExtrudeGeometry(gussetShape, {
      depth: 0.004, bevelEnabled: false,
    });
    const gussetMesh = new THREE.Mesh(gussetGeo, materials.castAluminumBlock);
    gussetMesh.position.set(pos.x - 0.009, -deckHeight * 0.15, pos.z - Math.sign(pos.z) * 0.018);
    group.add(gussetMesh);
  }

  // Front vibration damper (harmonic balancer)
  const damperGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.022, 32);
  damperGeo.rotateZ(Math.PI / 2);
  const damperMesh = new THREE.Mesh(damperGeo,
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.5 }));
  damperMesh.position.set(totalLength / 2 + 0.028, -deckHeight * 0.52, 0);
  damperMesh.castShadow = true;
  group.add(damperMesh);

  // Damper outer ring (rubber isolation ring)
  const ringGeo = new THREE.TorusGeometry(0.060, 0.006, 12, 32);
  ringGeo.rotateY(Math.PI / 2);
  ringGeo.translate(totalLength / 2 + 0.028, -deckHeight * 0.52, 0);
  group.add(new THREE.Mesh(ringGeo,
    new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.1, roughness: 0.85 })));

  // Damper center bolt (crank bolt)
  const crankBolt = create12PointHead(0.014, 0.018, 0.020, 0.005);
  crankBolt.rotateZ(Math.PI / 2);
  crankBolt.translate(totalLength / 2 + 0.040, -deckHeight * 0.52, 0);
  group.add(new THREE.Mesh(crankBolt, materials.arpHardenedFastener));

  return group;
}

// ============================================================================
// 4. OIL FILTER HOUSING, OIL COOLER & EXTERNAL PLUMBING
// ============================================================================

export function buildOilSystem(
  totalLength: number, deckHeight: number, blockWidth: number,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = "Oil_Filter_Cooler_System";

  // Spin-on oil filter canister
  const filterGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.095, 24);
  filterGeo.rotateZ(Math.PI / 2);
  const filterMat = new THREE.MeshStandardMaterial({color:0xf7fafc,metalness:0.3,roughness:0.6});
  const filterMesh = new THREE.Mesh(filterGeo, filterMat);
  filterMesh.position.set(totalLength*0.38, -deckHeight*0.25, blockWidth*0.35);
  filterMesh.castShadow = true;
  group.add(filterMesh);

  // Filter mounting flange
  const baseGeo = new THREE.CylinderGeometry(0.038,0.038,0.008,24);
  baseGeo.rotateZ(Math.PI/2);
  baseGeo.translate(totalLength*0.38+0.048, -deckHeight*0.25, blockWidth*0.35);
  group.add(new THREE.Mesh(baseGeo, materials.machinedDeckSurface));

  // Plate-style oil cooler with fins
  const coolerGeo = new THREE.BoxGeometry(0.018, 0.065, 0.055);
  const coolerMesh = new THREE.Mesh(coolerGeo, materials.castAluminumBlock);
  coolerMesh.position.set(totalLength*0.38+0.070, -deckHeight*0.25, blockWidth*0.35);
  coolerMesh.castShadow = true;
  group.add(coolerMesh);

  for (let fi=0;fi<8;fi++){
    const fg=new THREE.BoxGeometry(0.016,0.001,0.052);
    const fm=new THREE.Mesh(fg, materials.machinedDeckSurface);
    fm.position.set(totalLength*0.38+0.070, -deckHeight*0.25-0.028+fi*0.008, blockWidth*0.35);
    group.add(fm);
  }

  // AN fittings (gold anodized)
  const fMat=new THREE.MeshStandardMaterial({color:0xd4af37,metalness:0.9,roughness:0.15});
  for(const zOff of [-0.018,0.018]){
    const ft=new THREE.CylinderGeometry(0.006,0.006,0.012,12);
    ft.rotateZ(Math.PI/2);
    ft.translate(totalLength*0.38+0.082,-deckHeight*0.25+zOff*2,blockWidth*0.35);
    group.add(new THREE.Mesh(ft,fMat));
  }
  return group;
}

// ============================================================================
// 5. CYLINDER HEAD DETAILS — Cam caps, spark plug tubes, injector bosses
// ============================================================================

export function buildCylinderHeadDetails(
  cylsPerBank: number, bankAngleDeg: number,
  boreSpacing: number, boreDiam: number, deckH: number,
  totalLen: number, blockW: number,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const g = new THREE.Group();
  g.name = "Cylinder_Head_Details";
  const hV = (bankAngleDeg/2)*(Math.PI/180);
  const hL = totalLen/2;
  for(const side of [-1,1]){
    for(let i=0;i<cylsPerBank;i++){
      const cx=-hL+(i+0.5)*boreSpacing;
      // Cam bearing caps (DOHC)
      for(const zO of [-1,1]){
        const cap=new THREE.Mesh(new THREE.BoxGeometry(0.018,0.010,0.014),materials.machinedDeckSurface);
        cap.position.set(cx, deckH*0.52, side*deckH*0.38+zO*boreDiam*0.18);
        cap.rotation.x=side*hV;
        g.add(cap);
        // Cap bolts
        for(const fx of [-0.006,0.006]){
          const b=createAllenSocketHead(0.004,0.008);
          b.translate(cx+fx,deckH*0.53,side*deckH*0.38+zO*boreDiam*0.18);
          b.rotation.x=side*hV;
          g.add(new THREE.Mesh(b,materials.arpHardenedFastener));
        }
      }
      // Spark plug tube
      const pt=new THREE.CylinderGeometry(0.008,0.008,0.045,12);
      pt.translate(cx,deckH*0.55,side*deckH*0.35);
      pt.rotation.x=side*hV;
      g.add(new THREE.Mesh(pt,materials.nikasilCylinderBore));
      // Injector boss
      const ib=new THREE.CylinderGeometry(0.007,0.009,0.016,10);
      ib.translate(cx+boreSpacing*0.35,deckH*0.48,side*deckH*0.42);
      ib.rotation.x=side*hV*1.2;
      g.add(new THREE.Mesh(ib,materials.castAluminumBlock));
    }
    // Dowel pins
    for(const dx of [-hL*0.7,hL*0.7]){
      const d=new THREE.CylinderGeometry(0.005,0.005,0.015,8);
      d.translate(dx,deckH*0.46,side*deckH*0.30);
      d.rotation.x=side*hV;
      g.add(new THREE.Mesh(d,materials.machinedDeckSurface));
    }
  }
  return g;
}

// ============================================================================
// 6. MASTER ENGINE BLOCK SCULPTOR — Integrates all detail systems
// ============================================================================

export interface EngineBlockSculptConfig {
  cylindersPerBank: number; bankAngleDeg: number;
  boreDiameter: number; boreSpacing: number;
  deckHeight: number; totalLength: number; blockWidth: number;
  drySump?: boolean;
}

export function buildCompleteEngineBlock(
  config: EngineBlockSculptConfig,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = "Complete_Engine_Block_Assembly";
  group.add(buildSculptedVBlockBody(config, materials));
  group.add(buildOilPan(config.totalLength, config.blockWidth, config.deckHeight, materials, config.drySump ?? false));
  group.add(buildEngineMountBosses(config.totalLength, config.deckHeight, config.blockWidth, materials));
  group.add(buildOilSystem(config.totalLength, config.deckHeight, config.blockWidth, materials));
  group.add(buildCylinderHeadDetails(config.cylindersPerBank, config.bankAngleDeg, config.boreSpacing, config.boreDiameter, config.deckHeight, config.totalLength, config.blockWidth, materials));
  return group;
}
