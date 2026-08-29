// ===================================================================
// REALISTIC SIDE SKIRT 3D GEOMETRY GENERATOR
// ===================================================================
// Sculpted aero side skirts with:
// - Smooth lofted profile following body contour
// - Integrated vortex generators (6 per side)
// - Brake cooling duct intake
// - Carbon fiber construction with Kevlar underside
// ===================================================================

import * as THREE from "three";

export function generateSideSkirts3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "SideSkirts_Assembly";

  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0e18, metalness: 0.92, roughness: 0.15,
    clearcoat: 0.9, clearcoatRoughness: 0.03,
  });
  const kevlarMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a1508, metalness: 0.3, roughness: 0.6,
  });

  [-1, 1].forEach((side) => {
    const skirtGroup = new THREE.Group();

    // Main skirt panel (smooth lofted shape)
    const panelShape = new THREE.Shape();
    panelShape.moveTo(-0.70, 0);
    panelShape.bezierCurveTo(-0.60, 0.005, -0.40, 0.010, -0.20, 0.012);
    panelShape.bezierCurveTo(0.0, 0.013, 0.30, 0.010, 0.50, 0.006);
    panelShape.bezierCurveTo(0.60, 0.003, 0.68, 0, 0.70, -0.005);
    panelShape.lineTo(0.70, -0.04);
    panelShape.bezierCurveTo(0.60, -0.035, 0.30, -0.030, 0.0, -0.028);
    panelShape.bezierCurveTo(-0.30, -0.030, -0.60, -0.035, -0.70, -0.04);
    panelShape.closePath();

    const panelGeo = new THREE.ExtrudeGeometry(panelShape, {
      depth: 0.015, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2
    });
    const panel = new THREE.Mesh(panelGeo, carbonMat);
    panel.position.set(0, -0.06, side * 0.48);
    panel.rotation.y = side * 0.02;
    panel.castShadow = true;
    skirtGroup.add(panel);

    // Kevlar underside (visible when car is lifted)
    const underGeo = new THREE.PlaneGeometry(1.40, 0.035);
    const under = new THREE.Mesh(underGeo, kevlarMat);
    under.position.set(0, -0.10, side * 0.48);
    under.rotation.x = Math.PI / 2;
    skirtGroup.add(under);

    // Vortex generators (6 small triangular fins)
    for (let v = 0; v < 6; v++) {
      const vgShape = new THREE.Shape();
      vgShape.moveTo(0, 0);
      vgShape.lineTo(0.015, 0.008);
      vgShape.lineTo(0, 0.016);
      vgShape.closePath();

      const vgGeo = new THREE.ExtrudeGeometry(vgShape, { depth: 0.001, bevelEnabled: false });
      const vg = new THREE.Mesh(vgGeo, carbonMat);
      vg.position.set(-0.50 + v * 0.20, -0.055, side * 0.49);
      vg.rotation.y = side * 0.3;
      skirtGroup.add(vg);
    }

    // Brake cooling duct intake (near rear wheel)
    const ductShape = new THREE.Shape();
    ductShape.moveTo(-0.04, -0.01);
    ductShape.bezierCurveTo(-0.04, 0.02, -0.02, 0.03, 0.0, 0.03);
    ductShape.bezierCurveTo(0.02, 0.03, 0.04, 0.02, 0.04, -0.01);
    ductShape.lineTo(0.04, -0.025);
    ductShape.bezierCurveTo(0.02, -0.03, -0.02, -0.03, -0.04, -0.025);
    ductShape.closePath();

    const ductGeo = new THREE.ExtrudeGeometry(ductShape, {
      depth: 0.04, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.001, bevelSegments: 2
    });
    const duct = new THREE.Mesh(ductGeo, carbonMat);
    duct.position.set(0.55, -0.07, side * 0.48);
    skirtGroup.add(duct);

    group.add(skirtGroup);
  });

  return group;
}
