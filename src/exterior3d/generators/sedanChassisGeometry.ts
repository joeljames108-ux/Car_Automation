// ===================================================================
// HIGH-FIDELITY UNIBODY SEDAN CHASSIS 3D GEOMETRY GENERATOR
// ===================================================================
// Master procedural 3D construction of a modern sedan Body-in-White (BIW)
// unibody monocoque architecture based on real automotive engineering:
// - Front crash box rails, shock towers with cowl braces, stepped firewall
// - Passenger safety cell: A/B/C pillars, cant rails, rocker sill beams
// - Corrugated floor pan with driveline tunnel and seat crossmember bridges
// - Roof perimeter framework with panoramic center bows & rear parcel shelf X-brace
// - Rear inner wheelhouses, longitudinal rails, and trunk perimeter structure
// ===================================================================

import * as THREE from "three";
import type { ExteriorEngineeringConfig } from "../../sim/types/exterior";
import { getSedanChassisMaterials } from "../materials/sedanMetallurgyShaders";

// ── Shared Procedural Geometry Cache ──
const boxGeoCache = new Map<string, THREE.BoxGeometry>();
const cylGeoCache = new Map<string, THREE.CylinderGeometry>();

function getBoxGeometry(width: number, height: number, depth: number): THREE.BoxGeometry {
  const key = `${width.toFixed(4)}_${height.toFixed(4)}_${depth.toFixed(4)}`;
  let geo = boxGeoCache.get(key);
  if (!geo) {
    geo = new THREE.BoxGeometry(width, height, depth);
    boxGeoCache.set(key, geo);
  }
  return geo;
}

function getCylinderGeometry(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  radialSegments: number = 16,
  heightSegments: number = 1,
  openEnded: boolean = false,
  thetaStart?: number,
  thetaLength?: number
): THREE.CylinderGeometry {
  const key = `${radiusTop.toFixed(4)}_${radiusBottom.toFixed(4)}_${height.toFixed(4)}_${radialSegments}_${openEnded}_${thetaStart || 0}_${thetaLength || 0}`;
  let geo = cylGeoCache.get(key);
  if (!geo) {
    geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
    cylGeoCache.set(key, geo);
  }
  return geo;
}

export function generateSedanChassis3DGeometry(
  config?: Partial<ExteriorEngineeringConfig>
): THREE.Group {
  const masterGroup = new THREE.Group();
  masterGroup.name = "Sedan_Unibody_Chassis_Master";

  const materials = getSedanChassisMaterials();

  // Dimensions in meters (standard executive sedan baseline)
  const wb = (config?.wheelbase || 2850) / 1000;       // 2.85m wheelbase
  const halfWb = wb / 2;
  const trackF = (config?.trackWidthFront || 1620) / 1000; // 1.62m front track
  const halfTrackF = trackF / 2;
  const trackR = (config?.trackWidthRear || 1610) / 1000;   // 1.61m rear track
  const halfTrackR = trackR / 2;
  const cabinWidth = halfTrackF * 0.92;
  const floorHeight = 0.22;

  // =================================================================
  // 1. FRONT SUBSTRUCTURE (ENGINE BAY, CRASH RAILS, SHOCK TOWERS)
  // =================================================================
  const frontGroup = new THREE.Group();
  frontGroup.name = "1_Front_Substructure";

  // 1.1 Left & Right Front Longitudinal Crash Rails (Hydroformed Box Section)
  const frontRailLength = 1.05;
  const frontRailGeo = getBoxGeometry(frontRailLength, 0.14, 0.09);
  
  const leftFrontRail = new THREE.Mesh(frontRailGeo, materials.highStrengthSteel);
  leftFrontRail.position.set(halfWb * 0.82, floorHeight + 0.12, halfTrackF * 0.52);
  leftFrontRail.castShadow = true;
  leftFrontRail.receiveShadow = true;
  frontGroup.add(leftFrontRail);

  const rightFrontRail = new THREE.Mesh(frontRailGeo, materials.highStrengthSteel);
  rightFrontRail.position.set(halfWb * 0.82, floorHeight + 0.12, -halfTrackF * 0.52);
  rightFrontRail.castShadow = true;
  rightFrontRail.receiveShadow = true;
  frontGroup.add(rightFrontRail);

  // Front Rail Lightening & Tooling Holes (Decorative Insets)
  for (let i = 0; i < 4; i++) {
    const holeGeo = getCylinderGeometry(0.022, 0.022, 0.10, 16);
    const leftHole = new THREE.Mesh(holeGeo, materials.stampedAlloyDark);
    leftHole.rotation.z = Math.PI / 2;
    leftHole.position.set(halfWb * 0.55 + i * 0.18, floorHeight + 0.12, halfTrackF * 0.52);
    frontGroup.add(leftHole);

    const rightHole = new THREE.Mesh(holeGeo, materials.stampedAlloyDark);
    rightHole.rotation.z = Math.PI / 2;
    rightHole.position.set(halfWb * 0.55 + i * 0.18, floorHeight + 0.12, -halfTrackF * 0.52);
    frontGroup.add(rightHole);
  }

  // 1.2 Hexagonal Front Crush Cans & Bumper Mounting Plates
  const crushCanGeo = getCylinderGeometry(0.045, 0.05, 0.22, 6);
  const leftCrushCan = new THREE.Mesh(crushCanGeo, materials.stampedAlloyLight);
  leftCrushCan.rotation.z = Math.PI / 2;
  leftCrushCan.position.set(halfWb * 0.82 + frontRailLength / 2 + 0.11, floorHeight + 0.12, halfTrackF * 0.52);
  frontGroup.add(leftCrushCan);

  const rightCrushCan = new THREE.Mesh(crushCanGeo, materials.stampedAlloyLight);
  rightCrushCan.rotation.z = Math.PI / 2;
  rightCrushCan.position.set(halfWb * 0.82 + frontRailLength / 2 + 0.11, floorHeight + 0.12, -halfTrackF * 0.52);
  frontGroup.add(rightCrushCan);

  // Front Bumper Beam Crossmember (High-Strength Aluminum Extrusion)
  const bumperBeamGeo = new THREE.BoxGeometry(0.12, 0.14, halfTrackF * 1.42);
  const bumperBeam = new THREE.Mesh(bumperBeamGeo, materials.highStrengthSteel);
  bumperBeam.position.set(halfWb * 0.82 + frontRailLength / 2 + 0.22, floorHeight + 0.12, 0);
  bumperBeam.castShadow = true;
  frontGroup.add(bumperBeam);

  // 1.3 Radiator Core Support Yoke & Upper Cowl Cross-Tie
  const radUpperTieGeo = new THREE.BoxGeometry(0.06, 0.05, halfTrackF * 1.35);
  const radUpperTie = new THREE.Mesh(radUpperTieGeo, materials.stampedAlloyLight);
  radUpperTie.position.set(halfWb * 0.82 + frontRailLength / 2 + 0.08, floorHeight + 0.48, 0);
  frontGroup.add(radUpperTie);

  const radUprightGeo = new THREE.BoxGeometry(0.06, 0.36, 0.05);
  const radLeftUpright = new THREE.Mesh(radUprightGeo, materials.stampedAlloyLight);
  radLeftUpright.position.set(halfWb * 0.82 + frontRailLength / 2 + 0.08, floorHeight + 0.30, halfTrackF * 0.65);
  frontGroup.add(radLeftUpright);

  const radRightUpright = new THREE.Mesh(radUprightGeo, materials.stampedAlloyLight);
  radRightUpright.position.set(halfWb * 0.82 + frontRailLength / 2 + 0.08, floorHeight + 0.30, -halfTrackF * 0.65);
  frontGroup.add(radRightUpright);

  // 1.4 Deep-Drawn Stamped Front Shock Towers (LH & RH)
  const towerGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.38, 24, 1, true);
  const leftTower = new THREE.Mesh(towerGeo, materials.stampedAlloyMain);
  leftTower.position.set(halfWb * 0.72, floorHeight + 0.38, halfTrackF * 0.58);
  leftTower.castShadow = true;
  frontGroup.add(leftTower);

  const rightTower = new THREE.Mesh(towerGeo, materials.stampedAlloyMain);
  rightTower.position.set(halfWb * 0.72, floorHeight + 0.38, -halfTrackF * 0.58);
  rightTower.castShadow = true;
  frontGroup.add(rightTower);

  // Tower Top Damper Plates & 3-Stud Flange Ring
  const towerTopGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.025, 24);
  const leftTowerTop = new THREE.Mesh(towerTopGeo, materials.highStrengthSteel);
  leftTowerTop.position.set(halfWb * 0.72, floorHeight + 0.57, halfTrackF * 0.58);
  frontGroup.add(leftTowerTop);

  const rightTowerTop = new THREE.Mesh(towerTopGeo, materials.highStrengthSteel);
  rightTowerTop.position.set(halfWb * 0.72, floorHeight + 0.57, -halfTrackF * 0.58);
  frontGroup.add(rightTowerTop);

  // Diagonal Strut Tower Braces to Firewall Cowl
  const braceGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.48, 16);
  const leftBrace = new THREE.Mesh(braceGeo, materials.machinedAlloy);
  leftBrace.position.set(halfWb * 0.54, floorHeight + 0.56, halfTrackF * 0.32);
  leftBrace.rotation.x = -0.65;
  leftBrace.rotation.z = -0.75;
  frontGroup.add(leftBrace);

  const rightBrace = new THREE.Mesh(braceGeo, materials.machinedAlloy);
  rightBrace.position.set(halfWb * 0.54, floorHeight + 0.56, -halfTrackF * 0.32);
  rightBrace.rotation.x = 0.65;
  rightBrace.rotation.z = -0.75;
  frontGroup.add(rightBrace);

  // 1.5 Stepped Stamped Firewall Bulkhead & Cowl Tray
  const firewallMainGeo = new THREE.BoxGeometry(0.04, 0.55, cabinWidth * 2);
  const firewallMain = new THREE.Mesh(firewallMainGeo, materials.stampedAlloyMain);
  firewallMain.position.set(halfWb * 0.38, floorHeight + 0.42, 0);
  firewallMain.castShadow = true;
  frontGroup.add(firewallMain);

  // Upper Cowl Water Drain Tray / Windshield Base Header
  const cowlTrayGeo = new THREE.BoxGeometry(0.22, 0.06, cabinWidth * 2.05);
  const cowlTray = new THREE.Mesh(cowlTrayGeo, materials.highStrengthSteel);
  cowlTray.position.set(halfWb * 0.35, floorHeight + 0.69, 0);
  frontGroup.add(cowlTray);

  // Center Transmission Tunnel Bellhousing Flare (Firewall Pocket)
  const tunnelFlareGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.28, 16, 1, false, 0, Math.PI);
  const tunnelFlare = new THREE.Mesh(tunnelFlareGeo, materials.stampedAlloyDark);
  tunnelFlare.rotation.x = -Math.PI / 2;
  tunnelFlare.position.set(halfWb * 0.38, floorHeight + 0.22, 0);
  frontGroup.add(tunnelFlare);

  masterGroup.add(frontGroup);

  // =================================================================
  // 2. CABIN UNIBODY SAFETY CELL & SIDE RING FRAMES (A/B/C PILLARS)
  // =================================================================
  const cabinGroup = new THREE.Group();
  cabinGroup.name = "2_Cabin_Safety_Cell_Ring_Frames";

  // 2.1 Left & Right Multi-Chamber Rocker Sill Beams
  const sillLength = wb * 1.05;
  const sillGeo = new THREE.BoxGeometry(sillLength, 0.16, 0.12);
  
  const leftSill = new THREE.Mesh(sillGeo, materials.highStrengthSteel);
  leftSill.position.set(-halfWb * 0.05, floorHeight + 0.08, cabinWidth);
  leftSill.castShadow = true;
  cabinGroup.add(leftSill);

  const rightSill = new THREE.Mesh(sillGeo, materials.highStrengthSteel);
  rightSill.position.set(-halfWb * 0.05, floorHeight + 0.08, -cabinWidth);
  rightSill.castShadow = true;
  cabinGroup.add(rightSill);

  // Pinch-Weld Lower Flange Lips
  const flangeGeo = new THREE.BoxGeometry(sillLength, 0.035, 0.015);
  const leftPinchFlange = new THREE.Mesh(flangeGeo, materials.stampedAlloyDark);
  leftPinchFlange.position.set(-halfWb * 0.05, floorHeight - 0.01, cabinWidth + 0.055);
  cabinGroup.add(leftPinchFlange);

  const rightPinchFlange = new THREE.Mesh(flangeGeo, materials.stampedAlloyDark);
  rightPinchFlange.position.set(-halfWb * 0.05, floorHeight - 0.01, -(cabinWidth + 0.055));
  cabinGroup.add(rightPinchFlange);

  // 2.2 Curved Hydrodynamic A-Pillars (LH & RH)
  const aPillarLength = 0.98;
  const aPillarGeo = new THREE.BoxGeometry(0.065, aPillarLength, 0.055);

  const leftAPillar = new THREE.Mesh(aPillarGeo, materials.highStrengthSteel);
  leftAPillar.position.set(halfWb * 0.15, floorHeight + 0.95, cabinWidth * 0.88);
  leftAPillar.rotation.z = -0.58; // Raked back 33 degrees from horizontal
  leftAPillar.rotation.x = -0.15; // Inward tumblehome
  leftAPillar.castShadow = true;
  cabinGroup.add(leftAPillar);

  const rightAPillar = new THREE.Mesh(aPillarGeo, materials.highStrengthSteel);
  rightAPillar.position.set(halfWb * 0.15, floorHeight + 0.95, -cabinWidth * 0.88);
  rightAPillar.rotation.z = -0.58;
  rightAPillar.rotation.x = 0.15;
  rightAPillar.castShadow = true;
  cabinGroup.add(rightAPillar);

  // 2.3 Stamped Tapered B-Pillars (Center Safety Post)
  const bPillarGeo = new THREE.BoxGeometry(0.12, 0.82, 0.06);

  const leftBPillar = new THREE.Mesh(bPillarGeo, materials.highStrengthSteel);
  leftBPillar.position.set(-halfWb * 0.08, floorHeight + 0.52, cabinWidth * 0.92);
  leftBPillar.rotation.x = -0.12; // Inward tumblehome
  leftBPillar.castShadow = true;
  cabinGroup.add(leftBPillar);

  const rightBPillar = new THREE.Mesh(bPillarGeo, materials.highStrengthSteel);
  rightBPillar.position.set(-halfWb * 0.08, floorHeight + 0.52, -cabinWidth * 0.92);
  rightBPillar.rotation.x = 0.12;
  rightBPillar.castShadow = true;
  cabinGroup.add(rightBPillar);

  // B-Pillar Seatbelt Anchor Pockets
  const bPillarCutoutGeo = new THREE.BoxGeometry(0.045, 0.12, 0.02);
  const leftBeltPocket = new THREE.Mesh(bPillarCutoutGeo, materials.stampedAlloyDark);
  leftBeltPocket.position.set(-halfWb * 0.08, floorHeight + 0.65, cabinWidth * 0.94);
  cabinGroup.add(leftBeltPocket);

  const rightBeltPocket = new THREE.Mesh(bPillarCutoutGeo, materials.stampedAlloyDark);
  rightBeltPocket.position.set(-halfWb * 0.08, floorHeight + 0.65, -cabinWidth * 0.94);
  cabinGroup.add(rightBeltPocket);

  // 2.4 Aerodynamic Swept C-Pillars (Rear Quarter Fastback)
  const cPillarLength = 1.05;
  const cPillarGeo = new THREE.BoxGeometry(0.14, cPillarLength, 0.065);

  const leftCPillar = new THREE.Mesh(cPillarGeo, materials.highStrengthSteel);
  leftCPillar.position.set(-halfWb * 0.58, floorHeight + 0.88, cabinWidth * 0.86);
  leftCPillar.rotation.z = 0.52; // Swept rearward
  leftCPillar.rotation.x = -0.16; // Tumblehome
  leftCPillar.castShadow = true;
  cabinGroup.add(leftCPillar);

  const rightCPillar = new THREE.Mesh(cPillarGeo, materials.highStrengthSteel);
  rightCPillar.position.set(-halfWb * 0.58, floorHeight + 0.88, -cabinWidth * 0.86);
  rightCPillar.rotation.z = 0.52;
  rightCPillar.rotation.x = 0.16;
  rightCPillar.castShadow = true;
  cabinGroup.add(rightCPillar);

  // 2.5 Upper Cant Rails (Roof Longitudinal Side Rails)
  const cantRailLength = wb * 0.85;
  const cantRailGeo = new THREE.BoxGeometry(cantRailLength, 0.05, 0.055);

  const leftCantRail = new THREE.Mesh(cantRailGeo, materials.highStrengthSteel);
  leftCantRail.position.set(-halfWb * 0.18, floorHeight + 1.22, cabinWidth * 0.76);
  leftCantRail.castShadow = true;
  cabinGroup.add(leftCantRail);

  const rightCantRail = new THREE.Mesh(cantRailGeo, materials.highStrengthSteel);
  rightCantRail.position.set(-halfWb * 0.18, floorHeight + 1.22, -cabinWidth * 0.76);
  rightCantRail.castShadow = true;
  cabinGroup.add(rightCantRail);

  masterGroup.add(cabinGroup);

  // =================================================================
  // 3. FLOOR PAN & DRIVELINE TUNNEL ASSEMBLY
  // =================================================================
  const floorGroup = new THREE.Group();
  floorGroup.name = "3_Floor_Pan_Assembly";

  // 3.1 Main Stamped Corrugated Floor Pan Sheet
  const floorLength = wb * 0.78;
  const floorSheetGeo = new THREE.BoxGeometry(floorLength, 0.025, cabinWidth * 1.88);
  const floorSheet = new THREE.Mesh(floorSheetGeo, materials.stampedAlloyMain);
  floorSheet.position.set(-halfWb * 0.12, floorHeight + 0.015, 0);
  floorSheet.receiveShadow = true;
  floorGroup.add(floorSheet);

  // Floor Pan Longitudinal Stiffening Swage Ribs
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue; // Skip center where tunnel sits
    const ribGeo = new THREE.BoxGeometry(floorLength * 0.92, 0.02, 0.035);
    const ribMesh = new THREE.Mesh(ribGeo, materials.stampedAlloyDark);
    ribMesh.position.set(-halfWb * 0.12, floorHeight + 0.03, i * 0.18);
    floorGroup.add(ribMesh);
  }

  // 3.2 Central Driveline & Exhaust Tunnel
  const tunnelArchGeo = new THREE.CylinderGeometry(0.14, 0.16, floorLength * 0.98, 16, 1, false, 0, Math.PI);
  const tunnelArch = new THREE.Mesh(tunnelArchGeo, materials.stampedAlloyMain);
  tunnelArch.rotation.z = Math.PI / 2;
  tunnelArch.rotation.y = Math.PI / 2;
  tunnelArch.position.set(-halfWb * 0.12, floorHeight + 0.12, 0);
  tunnelArch.castShadow = true;
  floorGroup.add(tunnelArch);

  // 3.3 Front & Rear Seat Mounting Crossmember Bridges (U-Channels)
  const seatBridgeGeo = new THREE.BoxGeometry(0.08, 0.065, cabinWidth * 1.85);
  
  // Front Seat Front Crossmember
  const frontSeatBridge1 = new THREE.Mesh(seatBridgeGeo, materials.highStrengthSteel);
  frontSeatBridge1.position.set(halfWb * 0.12, floorHeight + 0.055, 0);
  floorGroup.add(frontSeatBridge1);

  // Front Seat Rear Crossmember
  const frontSeatBridge2 = new THREE.Mesh(seatBridgeGeo, materials.highStrengthSteel);
  frontSeatBridge2.position.set(-halfWb * 0.28, floorHeight + 0.055, 0);
  floorGroup.add(frontSeatBridge2);

  // 3.4 Rear Heel Board & Raised Rear Seat Substrate
  const heelBoardGeo = new THREE.BoxGeometry(0.04, 0.18, cabinWidth * 1.85);
  const heelBoard = new THREE.Mesh(heelBoardGeo, materials.stampedAlloyMain);
  heelBoard.position.set(-halfWb * 0.48, floorHeight + 0.10, 0);
  floorGroup.add(heelBoard);

  const rearSeatBaseGeo = new THREE.BoxGeometry(0.42, 0.03, cabinWidth * 1.82);
  const rearSeatBase = new THREE.Mesh(rearSeatBaseGeo, materials.stampedAlloyMain);
  rearSeatBase.position.set(-halfWb * 0.68, floorHeight + 0.20, 0);
  floorGroup.add(rearSeatBase);

  masterGroup.add(floorGroup);

  // =================================================================
  // 4. ROOF FRAMEWORK & REAR PARCEL SHELF X-BRACE
  // =================================================================
  const roofGroup = new THREE.Group();
  roofGroup.name = "4_Roof_Framework";

  // 4.1 Windshield Upper Header Rail
  const frontHeaderGeo = new THREE.BoxGeometry(0.08, 0.045, cabinWidth * 1.52);
  const frontHeader = new THREE.Mesh(frontHeaderGeo, materials.highStrengthSteel);
  frontHeader.position.set(halfWb * 0.22, floorHeight + 1.22, 0);
  roofGroup.add(frontHeader);

  // 4.2 Panoramic Sunroof Perimeter Frame & Center Bows
  const centerBowGeo = new THREE.BoxGeometry(0.06, 0.03, cabinWidth * 1.48);
  const centerBow = new THREE.Mesh(centerBowGeo, materials.stampedAlloyLight);
  centerBow.position.set(-halfWb * 0.18, floorHeight + 1.22, 0);
  roofGroup.add(centerBow);

  // 4.3 Rear Window Upper Header Rail
  const rearHeaderGeo = new THREE.BoxGeometry(0.08, 0.045, cabinWidth * 1.48);
  const rearHeader = new THREE.Mesh(rearHeaderGeo, materials.highStrengthSteel);
  rearHeader.position.set(-halfWb * 0.52, floorHeight + 1.20, 0);
  roofGroup.add(rearHeader);

  // 4.4 Stamped Rear Parcel Shelf Deck with Diagonal X-Brace (Matching Photos)
  const shelfDeckGeo = new THREE.BoxGeometry(0.45, 0.03, cabinWidth * 1.72);
  const shelfDeck = new THREE.Mesh(shelfDeckGeo, materials.stampedAlloyMain);
  shelfDeck.position.set(-halfWb * 0.72, floorHeight + 0.78, 0);
  roofGroup.add(shelfDeck);

  // Rear Bulkhead Diagonal Structural X-Brace Members
  const xBraceGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.95, 16);
  
  const xBrace1 = new THREE.Mesh(xBraceGeo, materials.highStrengthSteel);
  xBrace1.position.set(-halfWb * 0.68, floorHeight + 0.52, 0);
  xBrace1.rotation.x = 0.65;
  xBrace1.rotation.y = 0.15;
  roofGroup.add(xBrace1);

  const xBrace2 = new THREE.Mesh(xBraceGeo, materials.highStrengthSteel);
  xBrace2.position.set(-halfWb * 0.68, floorHeight + 0.52, 0);
  xBrace2.rotation.x = -0.65;
  xBrace2.rotation.y = -0.15;
  roofGroup.add(xBrace2);

  masterGroup.add(roofGroup);

  // =================================================================
  // 5. REAR WHEELHOUSES, TRUNK PAN & REAR CRASH STRUCTURE
  // =================================================================
  const rearGroup = new THREE.Group();
  rearGroup.name = "5_Rear_Substructure";

  // 5.1 Deep-Drawn Rear Inner Wheelhouse Arches (LH & RH)
  const rearArchGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 24, 1, false, 0, Math.PI);
  
  const leftRearArch = new THREE.Mesh(rearArchGeo, materials.stampedAlloyMain);
  leftRearArch.rotation.z = Math.PI / 2;
  leftRearArch.rotation.y = Math.PI / 2;
  leftRearArch.position.set(-halfWb * 0.98, floorHeight + 0.36, halfTrackR * 0.68);
  leftRearArch.castShadow = true;
  rearGroup.add(leftRearArch);

  const rightRearArch = new THREE.Mesh(rearArchGeo, materials.stampedAlloyMain);
  rightRearArch.rotation.z = Math.PI / 2;
  rightRearArch.rotation.y = -Math.PI / 2;
  rightRearArch.position.set(-halfWb * 0.98, floorHeight + 0.36, -halfTrackR * 0.68);
  rightRearArch.castShadow = true;
  rearGroup.add(rightRearArch);

  // Rear Spring / Damper Domes
  const rearDomeGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.22, 16);
  const leftRearDome = new THREE.Mesh(rearDomeGeo, materials.highStrengthSteel);
  leftRearDome.position.set(-halfWb * 0.98, floorHeight + 0.56, halfTrackR * 0.68);
  rearGroup.add(leftRearDome);

  const rightRearDome = new THREE.Mesh(rearDomeGeo, materials.highStrengthSteel);
  rightRearDome.position.set(-halfWb * 0.98, floorHeight + 0.56, -halfTrackR * 0.68);
  rearGroup.add(rightRearDome);

  // 5.2 Rear Longitudinal Rails (Stepped Box Beams)
  const rearRailLength = 1.05;
  const rearRailGeo = new THREE.BoxGeometry(rearRailLength, 0.12, 0.08);

  const leftRearRail = new THREE.Mesh(rearRailGeo, materials.highStrengthSteel);
  leftRearRail.position.set(-halfWb * 1.05, floorHeight + 0.25, halfTrackR * 0.52);
  leftRearRail.castShadow = true;
  rearGroup.add(leftRearRail);

  const rightRearRail = new THREE.Mesh(rearRailGeo, materials.highStrengthSteel);
  rightRearRail.position.set(-halfWb * 1.05, floorHeight + 0.25, -halfTrackR * 0.52);
  rightRearRail.castShadow = true;
  rearGroup.add(rightRearRail);

  // 5.3 Recessed Trunk Floor & Spare Wheel Well
  const trunkFloorGeo = new THREE.BoxGeometry(0.65, 0.02, halfTrackR * 1.02);
  const trunkFloor = new THREE.Mesh(trunkFloorGeo, materials.stampedAlloyMain);
  trunkFloor.position.set(-halfWb * 1.15, floorHeight + 0.14, 0);
  rearGroup.add(trunkFloor);

  const spareWellGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.14, 24);
  const spareWell = new THREE.Mesh(spareWellGeo, materials.stampedAlloyDark);
  spareWell.position.set(-halfWb * 1.18, floorHeight + 0.07, 0);
  rearGroup.add(spareWell);

  // 5.4 Rear End Panel Ring & Bumper Crash Bar
  const rearEndRingGeo = new THREE.BoxGeometry(0.05, 0.42, halfTrackR * 1.35);
  const rearEndRing = new THREE.Mesh(rearEndRingGeo, materials.stampedAlloyLight);
  rearEndRing.position.set(-halfWb * 1.48, floorHeight + 0.48, 0);
  rearGroup.add(rearEndRing);

  const rearBumperBarGeo = new THREE.BoxGeometry(0.10, 0.12, halfTrackR * 1.38);
  const rearBumperBar = new THREE.Mesh(rearBumperBarGeo, materials.highStrengthSteel);
  rearBumperBar.position.set(-halfWb * 1.55, floorHeight + 0.22, 0);
  rearBumperBar.castShadow = true;
  rearGroup.add(rearBumperBar);

  masterGroup.add(rearGroup);

  return masterGroup;
}
