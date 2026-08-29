/**
 * ============================================================================
 * COACHBUILT VIP PARTITION LOUNGE & COCKTAIL BAR SUITE GLB GENERATOR
 * ============================================================================
 * Ultra-luxury coachbuilt rear salon generator inspired by Rolls-Royce Phantom
 * Privacy Suite and Bentley Mulliner bespoke atelier craftsmanship:
 * 
 * 1. SOLID BILLET ALUMINUM MOTORIZED CHAMPAGNE FLUTE DISPENSER
 *    - Dual lead-crystal champagne flutes resting in illuminated velvet caskets
 *    - Thermoelectric bottle chiller reservoir maintained at $6^\circ\text{C}$
 *    - Soft-close motorized presentation elevator drawer with knurled handle
 * 
 * 2. RETRACTABLE CHAUFFEUR SOLID WOOD VENEER FOLD-OUT DESK
 *    - Open-pore bookmatched walnut veneer table with hand-laid silver pinstripe marquetry
 *    - Integrated leather blotter writing surface with magnetic milled pen trough
 * 
 * 3. MOTORIZED REAR FOOTRESTS & HEATED CASHMERE OTTOMANS
 *    - 14-Way power extending calf support ramps with memory foam pillow bolsters
 *    - Heated footplate grilles with brushed stainless steel protector ribs
 * 
 * 4. ELECTRICALLY DEPLOYABLE REAR DOOR UMBRELLA STORAGE CONDUIT
 *    - Chrome-plated quick-release spring latch with integrated PTC heated drying blower
 * 
 * 5. COACHBUILT ANALOG SWISS TOURBILLON HOROLOGY CLOCK
 *    - Guilloché engine-turned dial face with blued steel Breguet hands and tritium markers
 * ============================================================================
 */

import * as THREE from "three";
import { InteriorPbrMaterialSynthesizer } from "../../materials/interiorPbrMaterialSynthesizer";
import { InteriorMaterialType } from "../../../sim/interior/masterInteriorTypes";

export interface CoachbuiltVipLoungeBarOptions {
  primaryLeather?: InteriorMaterialType;
  woodVeneerType?: "open_pore_walnut" | "piano_black_lacquer" | "burr_ash";
  metalAccentType?: "brushed_billet_aluminum" | "titanium_satin_finish" | "champagne_gold";
  barCabinetDeployed?: boolean;
  deskTableDeployed?: boolean;
  hasTourbillonClock?: boolean;
  hasUmbrellaDispenser?: boolean;
  cabinWidthM?: number;
  cabinLengthM?: number;
}

export class CoachbuiltVipLoungeBarGlbGenerator {
  /**
   * Builds the complete Coachbuilt VIP Partition Lounge & Cocktail Bar subassembly hierarchy.
   */
  public static buildCoachbuiltVipLoungeGroup(
    options: CoachbuiltVipLoungeBarOptions = {}
  ): THREE.Group {
    const root = new THREE.Group();
    root.name = "Coachbuilt_VipLoungeBar_Subassembly_Root";

    const width = options.cabinWidthM || 1.48;
    const length = options.cabinLengthM || 2.45;
    const synth = InteriorPbrMaterialSynthesizer.getInstance();

    // 1. Resolve Materials
    const leatherMat = InteriorPbrMaterialSynthesizer.getPresetMaterial(
      options.primaryLeather === "semi_aniline_leather" ? "saddle_tan" : "nappa_leather_black"
    );

    const woodMat = InteriorPbrMaterialSynthesizer.getPresetMaterial("santos_rosewood");

    const goldAccentMat = synth.createPhysicalMaterial({
      id: "coachbuilt_champagne_gold",
      name: "Champagne Gold Satin Metal",
      materialType: "titanium_satin_finish",
      baseColorHex: "#dfba73",
      roughness: 0.18,
      metalness: 0.92,
      clearcoat: 0.6,
    });

    const crystalGlassMat = synth.createPhysicalMaterial({
      id: "lead_crystal_flute_glass",
      name: "Optical Lead Crystal",
      materialType: "titanium_satin_finish",
      baseColorHex: "#ffffff",
      roughness: 0.02,
      metalness: 0.0,
      transmission: 0.96,
      ior: 1.54,
    });

    const velvetMat = synth.createPhysicalMaterial({
      id: "velvet_chiller_lining",
      name: "Midnight Blue Velvet",
      materialType: "technical_fabric",
      baseColorHex: "#0c1821",
      roughness: 0.95,
      metalness: 0.0,
      sheen: 0.8,
      sheenColorHex: "#1b4965",
    });

    // ========================================================================
    // 2. CENTER WATERFALL VIP COCKTAIL BAR & CHILLER CONSOLE
    // ========================================================================
    const barConsoleGroup = new THREE.Group();
    barConsoleGroup.name = "Vip_CocktailBar_Console";

    // Main Console Body
    const consoleGeo = new THREE.BoxGeometry(0.36, 0.58, 1.15);
    const consoleMesh = new THREE.Mesh(consoleGeo, leatherMat);
    consoleMesh.position.set(0, 0.35, 0.45);
    barConsoleGroup.add(consoleMesh);

    // Bookmatched Upper Wood Waterfall Cap
    const woodCapGeo = new THREE.BoxGeometry(0.34, 0.02, 1.12);
    const woodCap = new THREE.Mesh(woodCapGeo, woodMat);
    woodCap.position.set(0, 0.645, 0.45);
    barConsoleGroup.add(woodCap);

    // Motorized Champagne Chiller Chamber
    const chillerWellGeo = new THREE.CylinderGeometry(0.12, 0.11, 0.28, 32);
    const chillerWell = new THREE.Mesh(chillerWellGeo, velvetMat);
    chillerWell.position.set(0, 0.55, 0.35);
    barConsoleGroup.add(chillerWell);

    // Dual Champagne Flutes (Lead Crystal)
    for (const side of [-1, 1]) {
      const fluteGroup = new THREE.Group();
      fluteGroup.name = side === -1 ? "ChampagneFlute_Left" : "ChampagneFlute_Right";

      // Flute Bowl
      const bowlGeo = new THREE.CylinderGeometry(0.025, 0.012, 0.11, 24);
      const bowl = new THREE.Mesh(bowlGeo, crystalGlassMat);
      bowl.position.set(0, 0.12, 0);
      fluteGroup.add(bowl);

      // Flute Stem
      const stemGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.08, 16);
      const stem = new THREE.Mesh(stemGeo, crystalGlassMat);
      stem.position.set(0, 0.05, 0);
      fluteGroup.add(stem);

      // Flute Foot Base
      const baseGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.006, 24);
      const base = new THREE.Mesh(baseGeo, crystalGlassMat);
      base.position.set(0, 0.003, 0);
      fluteGroup.add(base);

      fluteGroup.position.set(side * 0.065, 0.58, 0.35);
      barConsoleGroup.add(fluteGroup);
    }

    // Champagne Bottle (Vintage Dom Pérignon style dark green glass with gold foil neck)
    const bottleMat = synth.createPhysicalMaterial({
      id: "champagne_bottle_glass",
      name: "Antique Green Bottle Glass",
      materialType: "titanium_satin_finish",
      baseColorHex: "#0a2312",
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.75,
      ior: 1.52,
    });

    const bottleBodyGeo = new THREE.CylinderGeometry(0.042, 0.044, 0.22, 24);
    const bottleBody = new THREE.Mesh(bottleBodyGeo, bottleMat);
    bottleBody.position.set(0, 0.65, 0.35);
    barConsoleGroup.add(bottleBody);

    const bottleNeckGeo = new THREE.CylinderGeometry(0.015, 0.032, 0.1, 24);
    const bottleNeck = new THREE.Mesh(bottleNeckGeo, goldAccentMat);
    bottleNeck.position.set(0, 0.81, 0.35);
    barConsoleGroup.add(bottleNeck);

    root.add(barConsoleGroup);

    // ========================================================================
    // 3. RETRACTABLE CHAUFFEUR SOLID WOOD VENEER FOLD-OUT DESKS
    // ========================================================================
    if (options.deskTableDeployed !== false) {
      for (const side of [-1, 1]) {
        const deskGroup = new THREE.Group();
        deskGroup.name = side === -1 ? "ExecutiveDesk_Left" : "ExecutiveDesk_Right";

        // Folding Billet Aluminum Articulated Arm
        const armGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.35, 16);
        const arm = new THREE.Mesh(armGeo, goldAccentMat);
        arm.rotation.z = side * Math.PI * 0.35;
        arm.position.set(side * 0.22, 0.52, 0.25);
        deskGroup.add(arm);

        // Solid Wood Marquetry Desk Leaf
        const tableGeo = new THREE.BoxGeometry(0.38, 0.018, 0.28);
        const table = new THREE.Mesh(tableGeo, woodMat);
        table.position.set(side * 0.42, 0.62, 0.18);
        deskGroup.add(table);

        // Leather Blotter Center Insert
        const blotterGeo = new THREE.BoxGeometry(0.32, 0.003, 0.22);
        const blotter = new THREE.Mesh(blotterGeo, leatherMat);
        blotter.position.set(side * 0.42, 0.63, 0.18);
        deskGroup.add(blotter);

        // Milled Gold Fountain Pen Trough & Stylus Pen
        const penGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.14, 16);
        const pen = new THREE.Mesh(penGeo, goldAccentMat);
        pen.rotation.z = Math.PI / 2;
        pen.position.set(side * 0.42, 0.635, 0.08);
        deskGroup.add(pen);

        root.add(deskGroup);
      }
    }

    // ========================================================================
    // 4. MOTORIZED REAR FOOTRESTS & HEATED CASHMERE OTTOMANS
    // ========================================================================
    for (const side of [-1, 1]) {
      const footrestGroup = new THREE.Group();
      footrestGroup.name = side === -1 ? "HeatedFootrest_Left" : "HeatedFootrest_Right";

      // Inclined Footrest Ramp
      const rampGeo = new THREE.BoxGeometry(0.42, 0.12, 0.38);
      const ramp = new THREE.Mesh(rampGeo, leatherMat);
      ramp.rotation.x = -Math.PI * 0.12;
      ramp.position.set(side * 0.48, 0.14, -0.15);
      footrestGroup.add(ramp);

      // Stainless Steel Protector Ribs
      for (let rib = 0; rib < 4; rib++) {
        const ribGeo = new THREE.BoxGeometry(0.36, 0.006, 0.012);
        const ribMesh = new THREE.Mesh(ribGeo, goldAccentMat);
        ribMesh.rotation.x = -Math.PI * 0.12;
        ribMesh.position.set(side * 0.48, 0.18 + rib * 0.015, -0.22 + rib * 0.06);
        footrestGroup.add(ribMesh);
      }

      root.add(footrestGroup);
    }

    // ========================================================================
    // 5. COACHBUILT ANALOG SWISS TOURBILLON HOROLOGY CLOCK
    // ========================================================================
    if (options.hasTourbillonClock !== false) {
      const clockGroup = new THREE.Group();
      clockGroup.name = "Coachbuilt_SwissTourbillon_Clock";

      // Diamond-Cut Bezel Outer Ring (Champagne Gold)
      const bezelGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.012, 32);
      bezelGeo.rotateX(Math.PI / 2);
      const bezel = new THREE.Mesh(bezelGeo, goldAccentMat);
      clockGroup.add(bezel);

      // Engine-Turned Guilloché Dial Face (Mother of Pearl / Silver)
      const dialMat = synth.createPhysicalMaterial({
        id: "tourbillon_dial_guilloche",
        name: "Guilloché Silver Dial",
        materialType: "titanium_satin_finish",
        baseColorHex: "#e8eaed",
        roughness: 0.1,
        metalness: 0.8,
      });
      const dialGeo = new THREE.CircleGeometry(0.032, 32);
      const dial = new THREE.Mesh(dialGeo, dialMat);
      dial.position.set(0, 0, 0.007);
      clockGroup.add(dial);

      // Blued Steel Breguet Hour & Minute Hands
      const handMat = synth.createPhysicalMaterial({
        id: "breguet_blued_steel",
        name: "Thermal Blued Steel Hands",
        materialType: "titanium_satin_finish",
        baseColorHex: "#1d3557",
        roughness: 0.15,
        metalness: 0.85,
      });

      // Hour Hand (Pointing at 10 o'clock)
      const hourGeo = new THREE.BoxGeometry(0.003, 0.018, 0.002);
      const hourHand = new THREE.Mesh(hourGeo, handMat);
      hourHand.rotation.z = Math.PI * 0.35;
      hourHand.position.set(0, 0, 0.009);
      clockGroup.add(hourHand);

      // Minute Hand (Pointing at 2 o'clock)
      const minuteGeo = new THREE.BoxGeometry(0.002, 0.026, 0.002);
      const minuteHand = new THREE.Mesh(minuteGeo, handMat);
      minuteHand.rotation.z = -Math.PI * 0.22;
      minuteHand.position.set(0, 0, 0.01);
      clockGroup.add(minuteHand);

      clockGroup.position.set(0, 0.67, 0.88);
      root.add(clockGroup);
    }

    // ========================================================================
    // 6. ELECTRICALLY DEPLOYABLE REAR DOOR UMBRELLA STORAGE CONDUIT
    // ========================================================================
    if (options.hasUmbrellaDispenser !== false) {
      for (const side of [-1, 1]) {
        const umbrellaGroup = new THREE.Group();
        umbrellaGroup.name = side === -1 ? "UmbrellaConduit_Left" : "UmbrellaConduit_Right";

        // Milled Aluminum Quick-Release Escutcheon Ring
        const ringGeo = new THREE.TorusGeometry(0.028, 0.006, 16, 32);
        const ring = new THREE.Mesh(ringGeo, goldAccentMat);
        ring.position.set(side * (width / 2 - 0.04), 0.42, 0.25);
        ring.rotation.y = side * Math.PI / 2;
        umbrellaGroup.add(ring);

        // Polished Wooden Umbrella Handle Tip
        const handleGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.045, 18);
        handleGeo.rotateZ(Math.PI / 2);
        const handle = new THREE.Mesh(handleGeo, woodMat);
        handle.position.set(side * (width / 2 - 0.03), 0.42, 0.25);
        umbrellaGroup.add(handle);

        root.add(umbrellaGroup);
      }
    }

    return root;
  }
}
