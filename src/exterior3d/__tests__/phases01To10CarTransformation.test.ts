// ============================================================================
// MASTER CAR 3D TRANSFORM — VITEST TEST SUITE FOR PHASES 01–10
// ============================================================================
// Validates Model Hierarchy Audit, Vehicle Proportions, Primary Body Volume,
// Surface Design, Panel Separation, Wheel Arches, Wheels, Tires, & Brakes.
// ============================================================================

import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { Car3DGeometryGenerator } from "../geometry/car3dGeometryGenerator";
import { SculptedBodyPanelsGenerator } from "../generators/sculptedBodyPanelsGenerator";
import { ForgedWheelAssembly3D } from "../generators/forgedWheelAssembly3D";
import { generateWheel3DGeometry } from "../generators/wheelGenerator";
import { generateTire3DGeometry } from "../generators/tireGenerator";
import { generateBrakes3DGeometry } from "../generators/brakeCaliperGenerator";
import { HYPERCAR_PROPORTIONS, generateLoftedBodyShell } from "../generators/automotiveBodyLofter";

describe("Phases 01–10 Automotive 3D Transformation Verification", () => {

  it("Phase 01 & 02: Model Audit & Hierarchy Node Classification", () => {
    const carGroup = Car3DGeometryGenerator.buildCar3DGroup("SUPERCAR_MID_ENGINE");
    expect(carGroup).toBeDefined();
    expect(carGroup.name).toContain("CAR_3D");

    const nodeNames: string[] = [];
    carGroup.traverse((child) => {
      if (child.name) nodeNames.push(child.name);
    });

    // Check that core structural and body nodes exist in hierarchy
    expect(nodeNames.some(n => n.includes("Chassis") || n.includes("ChassisRoot"))).toBe(true);
    expect(nodeNames.some(n => n.includes("Body") || n.includes("SculptedBody"))).toBe(true);
    expect(nodeNames.some(n => n.includes("Wheel") || n.includes("WheelsBrakes"))).toBe(true);
  });

  it("Phase 03: Vehicle Proportion Verification", () => {
    const props = HYPERCAR_PROPORTIONS;
    expect(props.wheelbase).toBeGreaterThanOrEqual(2.5);
    expect(props.wheelbase).toBeLessThanOrEqual(3.2);
    expect(props.overallLength).toBeGreaterThan(props.wheelbase);
    expect(props.overallWidth).toBeGreaterThan(props.trackWidthRear);
    expect(props.overallHeight).toBeLessThan(props.overallWidth);
    expect(props.groundClearance).toBeGreaterThanOrEqual(0.05);
    expect(props.groundClearance).toBeLessThanOrEqual(0.20);

    // Verify 4 wheels sit inside body envelope
    const halfWidth = props.overallWidth / 2;
    const halfTrackFront = props.trackWidthFront / 2;
    const halfTrackRear = props.trackWidthRear / 2;
    expect(halfTrackFront).toBeLessThan(halfWidth);
    expect(halfTrackRear).toBeLessThan(halfWidth);
  });

  it("Phase 04 & 05: Primary Body Volume & Surface Lofting", () => {
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0044cc });
    const carbonMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

    const loftedShell = generateLoftedBodyShell(HYPERCAR_PROPORTIONS, bodyMaterial, carbonMaterial, {
      longitudinalSubdivisions: 8,
      splitUpperLower: true,
    });

    expect(loftedShell).toBeDefined();
    expect(loftedShell.name).toBe("Lofted_Body_Shell");

    const childrenNames = loftedShell.children.map(c => c.name);
    expect(childrenNames).toContain("Body_Upper_Shell_Paint");
    expect(childrenNames).toContain("Body_Lower_Diffuser_Carbon");
    expect(childrenNames).toContain("Body_Flat_Floor_Carbon");
  });

  it("Phase 06 & 07: Body Panel Separation & Sculpted Bodywork", () => {
    const bodyGroup = SculptedBodyPanelsGenerator.buildSculptedBody(
      "supercar",
      2680,
      1710,
      "forged",
      false,
      0x0044cc,
      {},
      undefined,
      1660
    );

    expect(bodyGroup).toBeDefined();
    expect(bodyGroup.name).toContain("SculptedBody");

    let meshCount = 0;
    bodyGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) meshCount++;
    });

    expect(meshCount).toBeGreaterThan(10); // Multiple separated panel meshes
  });

  it("Phase 08: Realistic Wheels", () => {
    const wheel = generateWheel3DGeometry({ finish: "satin_bronze" });
    expect(wheel).toBeDefined();
    expect(wheel.name).toBe("Wheel_Rim_Assembly_HighDetail");

    let meshCount = 0;
    wheel.traverse((child) => {
      if (child instanceof THREE.Mesh) meshCount++;
    });
    expect(meshCount).toBeGreaterThanOrEqual(10); // Rim lip, barrel, 10 Y-spokes, centerlock, valve
  });

  it("Phase 09: Realistic Competition Tires", () => {
    const tire = generateTire3DGeometry();
    expect(tire).toBeDefined();
    expect(tire.name).toBe("Tire_Assembly_HighDetail");

    let meshCount = 0;
    tire.traverse((child) => {
      if (child instanceof THREE.Mesh) meshCount++;
    });
    expect(meshCount).toBeGreaterThanOrEqual(5); // Sidewall torus, tread cylinder, tread grooves, sidewall text
  });

  it("Phase 10: Carbon-Ceramic Brake System", () => {
    const brakes = generateBrakes3DGeometry({ caliperColorHex: "#dc2626" });
    expect(brakes).toBeDefined();
    expect(brakes.name).toBe("Brakes_Assembly_HighDetail");

    let hasRotor = false;
    let hasCaliper = false;
    brakes.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const matName = (child.material as THREE.Material).name || "";
        if (matName.includes("Rotor") || child.name.includes("Rotor")) hasRotor = true;
        if (matName.includes("Caliper") || child.name.includes("Caliper")) hasCaliper = true;
      }
    });

    expect(hasRotor).toBe(true);
    expect(hasCaliper).toBe(true);
  });

  it("Full Assembly Test: Wheel & Brake Corner Aggregation", () => {
    const assembly = ForgedWheelAssembly3D.buildWheelsAndBrakes(
      2750,
      1660,
      1710,
      680,
      "forged",
      { rimStyle: "split_5", rimFinish: "gloss_black", caliperColorHex: "#ff1100" }
    );

    expect(assembly).toBeDefined();
    expect(assembly.name).toBe("WheelsBrakes_Assembly");
    expect(assembly.children.length).toBeGreaterThanOrEqual(4); // 4 corners
  });

});
