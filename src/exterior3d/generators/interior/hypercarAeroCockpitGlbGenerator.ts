/**
 * ============================================================================
 * FORMULA 1 / HYPERCAR AERODYNAMIC COCKPIT & HALO GLB GENERATOR
 * ============================================================================
 * Ultra-high visual fidelity 3D cockpit generator for F1 / LMH Hypercars:
 * 1. FIA TITANIUM HALO COCKPIT SAFETY ARCHITECTURE
 *    - Central aerodynamic sightline spar with tear-off visor canister
 *    - Aerodynamic carbon fiber fairing wrap and transition fillets
 * 2. AUTOCLAVED NOMEX/KEVLAR HONEYCOMB CARBON MONOCOQUE TUB
 *    - Reclined feet-up driver seating position ($30^\circ$ torso angle)
 *    - High-side cockpit crash bolsters with conformal energy-absorbing foam
 * 3. QUICK-RELEASE FORMULA STEERING BOSS HUB
 *    - 32 Gold-plated Spring-Loaded CAN-bus communication pins
 *    - Red anodized aluminum quick-release locking collar
 * 4. ROOF CARBON AIRBOX SNORKEL INTAKE CONDUIT
 *    - Direct ram-air roof scoop transition into intake manifold
 * 5. PLUMBED LIFELINE FIRE SUPPRESSION SYSTEM
 *    - Dual 360° cockpit atomizing nozzles & braided steel pull cables
 * ============================================================================
 */

import * as THREE from "three";
import { InteriorPbrMaterialSynthesizer } from "../../materials/interiorPbrMaterialSynthesizer";
import { InteriorMaterialType } from "../../../sim/interior/masterInteriorTypes";

export interface HypercarCockpitOptions {
  haloEnabled?: boolean;
  haloMaterial?: "raw_titanium" | "matte_carbon" | "gloss_carbon";
  primaryCarbonType?: "3k_twill_carbon_fiber" | "forged_carbon_composite";
  accentColorHex?: string;
  hasRoofSnorkel?: boolean;
  hasFireSuppressionSystem?: boolean;
  cabinWidthM?: number;
  cabinLengthM?: number;
}

export class HypercarAeroCockpitGlbGenerator {
  /**
   * Builds the complete Formula 1 / Le Mans Hypercar aerodynamic cockpit hierarchy.
   */
  public static buildHypercarCockpitGroup(options: HypercarCockpitOptions): THREE.Group {
    const root = new THREE.Group();
    root.name = "Hypercar_AeroCockpit_Subassembly_Root";

    const width = options.cabinWidthM || 1.35;
    const length = options.cabinLengthM || 2.15;
    const synth = InteriorPbrMaterialSynthesizer.getInstance();

    // 1. Resolve Materials
    const carbonMat = InteriorPbrMaterialSynthesizer.getPresetMaterial(
      options.primaryCarbonType === "forged_carbon_composite" ? "forged_carbon" : "carbon_fiber_twill"
    );
    const rawTitaniumMat = InteriorPbrMaterialSynthesizer.getPresetMaterial("knurled_titanium");
    const aluminumMat = InteriorPbrMaterialSynthesizer.getPresetMaterial("brushed_aluminum");
    const alcantaraAnthracite = InteriorPbrMaterialSynthesizer.getPresetMaterial("alcantara_anthracite");

    const accentHex = options.accentColorHex || "#00f0ff";
    const accentMat = synth.createPhysicalMaterial({
      id: `hypercar_accent_${accentHex}`,
      name: "Hypercar Anodized Accent",
      materialType: "brushed_billet_aluminum",
      baseColorHex: accentHex,
      roughness: 0.25,
      metalness: 0.9,
    });

    // ========================================================================
    // 1. AUTOCLAVED NOMEX/KEVLAR HONEYCOMB CARBON MONOCOQUE TUB
    // ========================================================================
    const monocoqueTub = new THREE.Group();
    monocoqueTub.name = "Carbon_Monocoque_Tub";

    // Main floor tub with curved side sponsons
    const tubFloorGeo = new THREE.BoxGeometry(width * 0.92, 0.08, length * 0.95);
    const tubFloorMesh = new THREE.Mesh(tubFloorGeo, carbonMat);
    tubFloorMesh.position.set(0, 0.04, 0.0);
    tubFloorMesh.receiveShadow = true;
    monocoqueTub.add(tubFloorMesh);

    // Left High-Side Cockpit Sponson Wall
    const leftSponsonGeo = new THREE.BoxGeometry(0.12, 0.54, length * 0.88);
    const leftSponsonMesh = new THREE.Mesh(leftSponsonGeo, carbonMat);
    leftSponsonMesh.position.set(-width * 0.44, 0.32, 0.05);
    monocoqueTub.add(leftSponsonMesh);

    // Right High-Side Cockpit Sponson Wall
    const rightSponsonMesh = leftSponsonMesh.clone();
    rightSponsonMesh.position.set(width * 0.44, 0.32, 0.05);
    monocoqueTub.add(rightSponsonMesh);

    // Conformal FIA Confor-Foam Driver Knee & Elbow Pads
    const leftElbowPadGeo = new THREE.BoxGeometry(0.04, 0.16, 0.38);
    const leftElbowPadMesh = new THREE.Mesh(leftElbowPadGeo, alcantaraAnthracite);
    leftElbowPadMesh.position.set(-width * 0.36, 0.36, -0.05);
    monocoqueTub.add(leftElbowPadMesh);

    const rightElbowPadMesh = leftElbowPadMesh.clone();
    rightElbowPadMesh.position.set(width * 0.36, 0.36, -0.05);
    monocoqueTub.add(rightElbowPadMesh);

    // Reclined Carbon Seat Shell integrated directly into Monocoque Tub
    const seatShellCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.08, -0.42), // Footwell heel rest
      new THREE.Vector3(0, 0.16, -0.15), // Thigh ramp
      new THREE.Vector3(0, 0.09, 0.12),  // H-Point bucket depression
      new THREE.Vector3(0, 0.42, 0.48),  // Lumbar & spine recline
      new THREE.Vector3(0, 0.78, 0.62),  // Headrest support
    ]);
    const seatShellGeo = new THREE.TubeGeometry(seatShellCurve, 32, 0.24, 16, false);
    seatShellGeo.scale(1.0, 0.5, 1.0);
    const seatShellMesh = new THREE.Mesh(seatShellGeo, carbonMat);
    monocoqueTub.add(seatShellMesh);

    root.add(monocoqueTub);

    // ========================================================================
    // 2. FIA TITANIUM HALO COCKPIT SAFETY STRUCTURE
    // ========================================================================
    if (options.haloEnabled !== false) {
      const haloGroup = new THREE.Group();
      haloGroup.name = "FIA_Titanium_Halo_Assembly";

      const haloMatChoice = options.haloMaterial === "matte_carbon" || options.haloMaterial === "gloss_carbon"
        ? carbonMat
        : rawTitaniumMat;

      // Central Aerodynamic Sightline Spar
      const centerSparCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.62, -0.48),
        new THREE.Vector3(0, 0.78, -0.32),
        new THREE.Vector3(0, 0.94, -0.08),
      ]);
      const centerSparGeo = new THREE.TubeGeometry(centerSparCurve, 24, 0.024, 16, false);
      const centerSparMesh = new THREE.Mesh(centerSparGeo, haloMatChoice);
      centerSparMesh.name = "Halo_CenterSpar";
      centerSparMesh.castShadow = true;
      haloGroup.add(centerSparMesh);

      // Halo Horseshoe Hoop Loop surrounding driver head
      const hoopPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-width * 0.38, 0.88, 0.28),
        new THREE.Vector3(-width * 0.36, 0.94, 0.05),
        new THREE.Vector3(0, 0.94, -0.08),
        new THREE.Vector3(width * 0.36, 0.94, 0.05),
        new THREE.Vector3(width * 0.38, 0.88, 0.28),
      ]);
      const hoopGeo = new THREE.TubeGeometry(hoopPath, 32, 0.028, 16, false);
      const hoopMesh = new THREE.Mesh(hoopGeo, haloMatChoice);
      hoopMesh.name = "Halo_HorseshoeHoop";
      hoopMesh.castShadow = true;
      haloGroup.add(hoopMesh);

      // Left Rear Mounting Fillet Bracket
      const leftFilletGeo = new THREE.CylinderGeometry(0.032, 0.045, 0.16, 16);
      leftFilletGeo.rotateZ(Math.PI * 0.15);
      const leftFilletMesh = new THREE.Mesh(leftFilletGeo, rawTitaniumMat);
      leftFilletMesh.position.set(-width * 0.38, 0.82, 0.28);
      haloGroup.add(leftFilletMesh);

      // Right Rear Mounting Fillet Bracket
      const rightFilletMesh = leftFilletMesh.clone();
      rightFilletMesh.position.set(width * 0.38, 0.82, 0.28);
      haloGroup.add(rightFilletMesh);

      // Tear-off Visor Discard Canister mounted on Halo Central Spar
      const tearOffCanisterGeo = new THREE.BoxGeometry(0.045, 0.032, 0.065);
      const tearOffMesh = new THREE.Mesh(tearOffCanisterGeo, aluminumMat);
      tearOffMesh.position.set(0.032, 0.84, -0.22);
      haloGroup.add(tearOffMesh);

      root.add(haloGroup);
    }

    // ========================================================================
    // 3. QUICK-RELEASE STEERING BOSS HUB & GOLD CAN-BUS PINS
    // ========================================================================
    const quickReleaseHub = new THREE.Group();
    quickReleaseHub.name = "Steering_QuickRelease_Hub";
    quickReleaseHub.position.set(0, 0.58, -0.26);
    quickReleaseHub.rotation.x = Math.PI * 0.12;

    // Splined Steel Shaft Boss
    const shaftBossGeo = new THREE.CylinderGeometry(0.038, 0.042, 0.065, 24);
    shaftBossGeo.rotateX(Math.PI / 2);
    const shaftBossMesh = new THREE.Mesh(shaftBossGeo, rawTitaniumMat);
    quickReleaseHub.add(shaftBossMesh);

    // Red Anodized Spring-Loaded Locking Collar
    const collarGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.024, 24);
    collarGeo.rotateX(Math.PI / 2);
    const collarMat = synth.createPhysicalMaterial({
      id: "qr_collar_red",
      name: "Quick Release Red Collar",
      materialType: "brushed_billet_aluminum",
      baseColorHex: "#d6001c",
      roughness: 0.3,
      metalness: 0.9,
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.position.set(0, 0, 0.02);
    quickReleaseHub.add(collarMesh);

    // 12 Gold-plated Spring-Loaded CAN-Bus Contact Pins
    const pinMat = synth.createPhysicalMaterial({
      id: "can_gold_pin",
      name: "Gold-Plated CAN Pin",
      materialType: "brushed_billet_aluminum",
      baseColorHex: "#ffd700",
      roughness: 0.15,
      metalness: 0.98,
    });
    for (let p = 0; p < 12; p++) {
      const angle = (p / 12) * Math.PI * 2;
      const pinGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.008, 12);
      pinGeo.rotateX(Math.PI / 2);
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.set(Math.cos(angle) * 0.022, Math.sin(angle) * 0.022, 0.035);
      quickReleaseHub.add(pinMesh);
    }

    root.add(quickReleaseHub);

    // ========================================================================
    // 4. ROOF CARBON SNORKEL AIR INTAKE CONDUIT
    // ========================================================================
    if (options.hasRoofSnorkel !== false) {
      const snorkelCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 1.15, 0.65), // Roof intake mouth
        new THREE.Vector3(0, 0.98, 0.45),
        new THREE.Vector3(0, 0.72, 0.58), // Firewall intake box
      ]);
      const snorkelGeo = new THREE.TubeGeometry(snorkelCurve, 24, 0.09, 16, false);
      snorkelGeo.scale(1.2, 0.8, 1.0);
      const snorkelMesh = new THREE.Mesh(snorkelGeo, carbonMat);
      snorkelMesh.name = "Roof_Airbox_SnorkelConduit";
      snorkelMesh.castShadow = true;
      root.add(snorkelMesh);
    }

    // ========================================================================
    // 5. PLUMBED LIFELINE FIRE SUPPRESSION SYSTEM
    // ========================================================================
    if (options.hasFireSuppressionSystem !== false) {
      const fireGroup = new THREE.Group();
      fireGroup.name = "FIA_FireSuppression_Plumbing";

      // Extinguisher Bottle (Polished Aluminum Cylinder)
      const bottleGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.28, 24);
      bottleGeo.rotateZ(Math.PI / 2);
      const bottleMat = synth.createPhysicalMaterial({
        id: "fire_bottle_alu",
        name: "Lifeline Fire Bottle",
        materialType: "brushed_billet_aluminum",
        baseColorHex: "#d6001c",
        roughness: 0.35,
        metalness: 0.85,
      });
      const bottleMesh = new THREE.Mesh(bottleGeo, bottleMat);
      bottleMesh.position.set(0, 0.12, -0.32); // Mounted in front of seat tub
      fireGroup.add(bottleMesh);

      // Pressure Gauge
      const gaugeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.008, 16);
      gaugeGeo.rotateX(Math.PI / 2);
      const gaugeMesh = new THREE.Mesh(gaugeGeo, rawTitaniumMat);
      gaugeMesh.position.set(0.12, 0.16, -0.32);
      fireGroup.add(gaugeMesh);

      // Braided Steel Pull Cable Loop
      const cableLoopCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.08, 0.16, -0.32),
        new THREE.Vector3(width * 0.32, 0.45, -0.15),
        new THREE.Vector3(width * 0.36, 0.58, -0.22),
      ]);
      const cableGeo = new THREE.TubeGeometry(cableLoopCurve, 20, 0.0035, 8, false);
      const cableMesh = new THREE.Mesh(cableGeo, rawTitaniumMat);
      fireGroup.add(cableMesh);

      // Atomizing Nozzle 1 (Directed at Driver Chest)
      const nozzle1Geo = new THREE.ConeGeometry(0.012, 0.024, 16);
      nozzle1Geo.rotateX(-Math.PI * 0.35);
      const nozzle1Mesh = new THREE.Mesh(nozzle1Geo, rawTitaniumMat);
      nozzle1Mesh.position.set(-0.25, 0.52, -0.12);
      fireGroup.add(nozzle1Mesh);

      // Atomizing Nozzle 2 (Directed at Pedal Box)
      const nozzle2Mesh = nozzle1Mesh.clone();
      nozzle2Mesh.rotation.x = Math.PI * 0.25;
      nozzle2Mesh.position.set(0, 0.22, -0.58);
      fireGroup.add(nozzle2Mesh);

      root.add(fireGroup);
    }

    return root;
  }
}
