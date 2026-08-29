// ============================================================================
// INTERIOR STITCHING DETAIL SYSTEM — FRENCH SEAMS, CROSS-STITCH, EMBROIDERY
// ============================================================================
// High-fidelity stitching geometry generators for automotive interiors:
// - French seam stitching (raised linear stitch lines along panel edges)
// - Cross-stitch diamond quilting pattern (Bentley / Rolls-Royce style)
// - Contrast color piping (raised cord along seat bolsters, door cards)
// - Headrest embroidery patterns (logos, crests, monograms)
// - Button tufting (Chesterfield deep-button diamond pattern)
// - Perforated leather micro-hole patterns (heated/ventilated seat surfaces)
// - Double-needle top-stitching along seat seams
// - Spiral hand-stitched steering wheel wrap pattern
// - Seatbelt webbing texture stitch overlay
// - Dashboard decorative stitch lines (winding curves)
// ============================================================================

import * as THREE from "three";

export type StitchPattern =
  | "french_seam"
  | "cross_stitch_diamond"
  | "contrast_piping"
  | "double_needle_topstitch"
  | "button_tuft"
  | "perforated_leather"
  | "spiral_wrap"
  | "embroidery_logo"
  | "decorative_curve"
  | "basket_weave";

export interface StitchConfig {
  pattern: StitchPattern;
  colorHex: string;
  spacing: number; // mm between stitches
  stitchLength: number; // mm per stitch
  height: number; // mm raised above surface
  width: number; // mm width of stitch line
  segments: number; // curve segments for smoothness
}

export interface SeamPath {
  points: THREE.Vector3[];
  closed: boolean;
}

/**
 * Material cache for stitch materials
 */
const stitchMaterialCache = new Map<string, THREE.MeshBasicMaterial>();

function getStitchMaterial(colorHex: string): THREE.MeshBasicMaterial {
  if (!stitchMaterialCache.has(colorHex)) {
    stitchMaterialCache.set(colorHex, new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      side: THREE.DoubleSide,
    }));
  }
  return stitchMaterialCache.get(colorHex)!;
}

/**
 * Piping material cache
 */
const pipingMaterialCache = new Map<string, THREE.MeshPhysicalMaterial>();

function getPipingMaterial(colorHex: string): THREE.MeshPhysicalMaterial {
  if (!pipingMaterialCache.has(colorHex)) {
    pipingMaterialCache.set(colorHex, new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.65,
      metalness: 0.05,
      clearcoat: 0.1,
      sheen: 0.2,
      sheenColor: new THREE.Color(colorHex).multiplyScalar(1.3),
    }));
  }
  return pipingMaterialCache.get(colorHex)!;
}

/**
 * Main stitching detail system
 */
export class InteriorStitchingDetailSystem {
  /**
   * Creates a French seam stitch line along a path of 3D points.
   * French seams have two parallel rows of stitching with a raised ridge between them.
   */
  public static createFrenchSeam(
    path: THREE.Vector3[],
    stitchColorHex: string = "#d9a64e",
    seamWidthMm: number = 3.5,
    stitchSpacingMm: number = 4.0,
    stitchLengthMm: number = 3.0,
    stitchHeightMm: number = 0.4
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "FrenchSeam";
    const mat = getStitchMaterial(stitchColorHex);
    const seamWidth = seamWidthMm / 1000;
    const stitchSpacing = stitchSpacingMm / 1000;
    const stitchLen = stitchLengthMm / 1000;
    const stitchH = stitchHeightMm / 1000;
    const stitchW = 0.3 / 1000;

    // Calculate total path length
    let totalLength = 0;
    for (let i = 1; i < path.length; i++) {
      totalLength += path[i].distanceTo(path[i - 1]);
    }

    const stitchCount = Math.floor(totalLength / stitchSpacing);
    if (stitchCount < 1) return group;

    // Place stitches along both sides of seam
    for (const side of [-1, 1]) {
      const offset = side * seamWidth / 2;
      let distAccum = 0;
      let stitchIdx = 0;

      for (let i = 1; i < path.length && stitchIdx < stitchCount; i++) {
        const segLen = path[i].distanceTo(path[i - 1]);
        const segDir = path[i].clone().sub(path[i - 1]).normalize();

        // Calculate perpendicular direction for seam offset
        const up = new THREE.Vector3(0, 1, 0);
        const perp = new THREE.Vector3().crossVectors(segDir, up).normalize();
        if (perp.length() < 0.01) {
          perp.set(1, 0, 0);
        }

        let segDist = 0;
        while (segDist < segLen && stitchIdx < stitchCount) {
          const t = segDist / segLen;
          const pos = path[i - 1].clone().lerp(path[i], t);
          pos.add(perp.multiplyScalar(offset));
          pos.y += stitchH;

          // Create stitch dash
          const stitchGeo = new THREE.BoxGeometry(stitchLen, stitchH / 2, stitchW);
          const stitch = new THREE.Mesh(stitchGeo, mat);
          stitch.position.copy(pos);

          // Orient along path direction
          const angle = Math.atan2(segDir.z, segDir.x);
          stitch.rotation.y = -angle;

          group.add(stitch);
          stitchIdx++;
          segDist += stitchSpacing;
        }
        distAccum += segLen;
      }
    }

    // Central ridge (raised seam line)
    const ridgePoints: THREE.Vector3[] = [];
    for (const p of path) {
      ridgePoints.push(p.clone());
    }
    if (ridgePoints.length >= 2) {
      const curve = new THREE.CatmullRomCurve3(ridgePoints);
      const ridgeGeo = new THREE.TubeGeometry(curve, path.length * 4, 0.15 / 1000, 6, false);
      const ridgeMat = getStitchMaterial(stitchColorHex);
      const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
      ridge.name = "Seam_Ridge";
      group.add(ridge);
    }

    return group;
  }

  /**
   * Creates a cross-stitch diamond quilting pattern on a rectangular surface.
   * Used for Bentley/Rolls-Royce style diamond-stitched seat inserts.
   */
  public static createCrossStitchDiamond(
    widthMm: number,
    heightMm: number,
    diamondSizeMm: number,
    stitchColorHex: string = "#d9a64e",
    surfaceColorHex: string = "#1a1a2e",
    stitchDepthMm: number = 0.5
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "CrossStitchDiamond";
    const mat = getStitchMaterial(stitchColorHex);
    const w = widthMm / 1000;
    const h = heightMm / 1000;
    const ds = diamondSizeMm / 1000;
    const depth = stitchDepthMm / 1000;

    // Base surface panel
    const baseGeo = new THREE.BoxGeometry(w, depth, h);
    const baseMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(surfaceColorHex),
      roughness: 0.65,
      metalness: 0.05,
      sheen: 0.3,
      sheenColor: new THREE.Color(surfaceColorHex).multiplyScalar(1.2),
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.name = "Quilted_Base";
    group.add(base);

    // Diamond grid stitch lines
    const cols = Math.ceil(w / ds);
    const rows = Math.ceil(h / ds);
    const stitchW = 0.25 / 1000;
    const stitchH = 0.3 / 1000;

    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        const cx = -w / 2 + col * ds;
        const cz = -h / 2 + row * ds;

        // Diamond diagonal lines (4 per cell)
        const directions = [
          { dx: ds / 2, dz: ds / 2 },
          { dx: -ds / 2, dz: ds / 2 },
        ];

        for (const dir of directions) {
          const length = Math.sqrt(dir.dx * dir.dx + dir.dz * dir.dz);
          const angle = Math.atan2(dir.dz, dir.dx);
          const stitchGeo = new THREE.BoxGeometry(length, stitchH, stitchW);
          const stitch = new THREE.Mesh(stitchGeo, mat);
          stitch.position.set(cx + dir.dx / 2, depth / 2 + stitchH / 2, cz + dir.dz / 2);
          stitch.rotation.y = -angle;
          group.add(stitch);
        }
      }
    }

    // Tufting buttons at diamond intersections
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        const cx = -w / 2 + col * ds;
        const cz = -h / 2 + row * ds;

        const buttonGeo = new THREE.CylinderGeometry(1.2 / 1000, 1.2 / 1000, 0.8 / 1000, 12);
        const button = new THREE.Mesh(buttonGeo, mat);
        button.position.set(cx, depth / 2 + stitchH + 0.3 / 1000, cz);
        group.add(button);
      }
    }

    return group;
  }

  /**
   * Creates a contrast color piping cord along a path.
   * Used for seat bolster edges, door card trim lines, dashboard borders.
   */
  public static createContrastPiping(
    path: THREE.Vector3[],
    pipingColorHex: string = "#d9a64e",
    cordDiameterMm: number = 3.0
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "ContrastPiping";
    const mat = getPipingMaterial(pipingColorHex);

    if (path.length < 2) return group;

    const curve = new THREE.CatmullRomCurve3(path);
    const radius = (cordDiameterMm / 2) / 1000;
    const tubeGeo = new THREE.TubeGeometry(curve, path.length * 8, radius, 8, false);
    const piping = new THREE.Mesh(tubeGeo, mat);
    piping.name = "Piping_Cord";
    group.add(piping);

    return group;
  }

  /**
   * Creates a button tufting pattern (Chesterfield deep-button style).
   */
  public static createButtonTufting(
    widthMm: number,
    heightMm: number,
    buttonSpacingMm: number,
    surfaceColorHex: string = "#1a1510",
    buttonColorHex: string = "#1a1510",
    depthMm: number = 2.0
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "ButtonTufting";
    const w = widthMm / 1000;
    const h = heightMm / 1000;
    const spacing = buttonSpacingMm / 1000;
    const depth = depthMm / 1000;

    // Base cushion
    const baseGeo = new THREE.BoxGeometry(w, depth, h);
    const baseMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(surfaceColorHex),
      roughness: 0.72,
      metalness: 0.03,
      sheen: 0.25,
      sheenColor: new THREE.Color(surfaceColorHex).multiplyScalar(1.15),
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.name = "Tufted_Base";
    group.add(base);

    const cols = Math.floor(w / spacing);
    const rows = Math.floor(h / spacing);
    const btnMat = getStitchMaterial(buttonColorHex);

    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        const bx = -w / 2 + col * spacing + (row % 2 ? spacing / 2 : 0);
        const bz = -h / 2 + row * spacing;

        // Button
        const btnGeo = new THREE.CylinderGeometry(1.5 / 1000, 1.5 / 1000, 1.0 / 1000, 12);
        const btn = new THREE.Mesh(btnGeo, btnMat);
        btn.position.set(bx, depth / 2 + 0.5 / 1000, bz);
        btn.name = `Tuft_Button_${row}_${col}`;
        group.add(btn);

        // Radiating crease lines from each button
        for (let d = 0; d < 4; d++) {
          const angle = (d / 4) * Math.PI * 2;
          const lineLen = spacing * 0.4;
          const lineGeo = new THREE.BoxGeometry(lineLen, 0.1 / 1000, 0.2 / 1000);
          const line = new THREE.Mesh(lineGeo, btnMat);
          line.position.set(
            bx + Math.cos(angle) * lineLen / 2,
            depth / 2 + 0.3 / 1000,
            bz + Math.sin(angle) * lineLen / 2
          );
          line.rotation.y = -angle;
          group.add(line);
        }
      }
    }

    return group;
  }

  /**
   * Creates a perforated leather surface with micro-hole pattern.
   * Used for ventilated/heated seat surfaces.
   */
  public static createPerforatedLeather(
    widthMm: number,
    heightMm: number,
    holeDiameterMm: number = 1.0,
    holeSpacingMm: number = 3.0,
    surfaceColorHex: string = "#1e222b",
    depthMm: number = 1.5
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "PerforatedLeather";
    const w = widthMm / 1000;
    const h = heightMm / 1000;
    const holeR = (holeDiameterMm / 2) / 1000;
    const spacing = holeSpacingMm / 1000;
    const depth = depthMm / 1000;

    // Base surface
    const baseGeo = new THREE.BoxGeometry(w, depth, h);
    const baseMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(surfaceColorHex),
      roughness: 0.70,
      metalness: 0.04,
      sheen: 0.2,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.name = "Perf_Base";
    group.add(base);

    // Micro-hole pattern using instanced mesh
    const holeGeo = new THREE.CylinderGeometry(holeR, holeR, depth * 1.1, 8);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });

    const cols = Math.floor(w / spacing);
    const rows = Math.floor(h / spacing);

    // Use InstancedMesh for performance
    const instancedHoles = new THREE.InstancedMesh(holeGeo, holeMat, (cols + 1) * (rows + 1));
    const dummy = new THREE.Object3D();
    let idx = 0;

    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        const hx = -w / 2 + col * spacing;
        const hz = -h / 2 + row * spacing;
        dummy.position.set(hx, 0, hz);
        dummy.updateMatrix();
        instancedHoles.setMatrixAt(idx++, dummy.matrix);
      }
    }
    instancedHoles.count = idx;
    instancedHoles.name = "Perf_Holes";
    group.add(instancedHoles);

    return group;
  }

  /**
   * Creates a double-needle top-stitching line (two parallel stitch rows).
   */
  public static createDoubleNeedleTopstitch(
    path: THREE.Vector3[],
    stitchColorHex: string = "#d9a64e",
    needleSpacingMm: number = 6.0,
    stitchSpacingMm: number = 3.5,
    stitchLengthMm: number = 2.5
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "DoubleNeedleTopstitch";

    // Create two offset paths for the double needle
    for (const side of [-1, 1]) {
      const offsetPath = path.map((p, i) => {
        const offset = new THREE.Vector3(0, side * (needleSpacingMm / 2000), 0);
        return p.clone().add(offset);
      });

      const seam = this.createFrenchSeam(offsetPath, stitchColorHex, 0, stitchSpacingMm, stitchLengthMm, 0.3);
      seam.name = `Topstitch_${side > 0 ? "Right" : "Left"}`;
      group.add(seam);
    }

    return group;
  }

  /**
   * Creates a headrest embroidery pattern (logo, crest, or monogram).
   */
  public static createHeadrestEmbroidery(
    text: string,
    colorHex: string = "#d9a64e",
    sizeMm: number = 40,
    depthMm: number = 0.3
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "HeadrestEmbroidery";
    const mat = getStitchMaterial(colorHex);

    // Create text as extruded shapes approximated by boxes
    const charWidth = sizeMm * 0.6 / 1000;
    const charHeight = sizeMm / 1000;
    const depth = depthMm / 1000;
    const letterSpacing = sizeMm * 0.7 / 1000;
    const totalWidth = text.length * letterSpacing;

    for (let i = 0; i < text.length; i++) {
      const charGeo = new THREE.BoxGeometry(charWidth * 0.5, depth, charHeight * 0.7);
      const charMesh = new THREE.Mesh(charGeo, mat);
      charMesh.position.set(
        -totalWidth / 2 + i * letterSpacing,
        depth / 2,
        0
      );
      charMesh.name = `Embroidery_Char_${text[i]}`;
      group.add(charMesh);
    }

    // Decorative border frame around text
    const frameW = totalWidth + sizeMm * 0.8 / 1000;
    const frameH = charHeight + sizeMm * 0.4 / 1000;
    const frameGeo = new THREE.BoxGeometry(frameW, depth / 2, 0.2 / 1000);
    const frameTop = new THREE.Mesh(frameGeo, mat);
    frameTop.position.set(0, depth / 2, -frameH / 2);
    group.add(frameTop);
    const frameBot = new THREE.Mesh(frameGeo, mat);
    frameBot.position.set(0, depth / 2, frameH / 2);
    group.add(frameBot);

    return group;
  }

  /**
   * Creates spiral hand-stitched steering wheel wrap pattern.
   */
  public static createSpiralWheelWrap(
    wheelRadiusMm: number,
    wrapLengthMm: number,
    stitchColorHex: string = "#d9a64e",
    leatherColorHex: string = "#1a1a24",
    wrapWidthMm: number = 28
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "SpiralWheelWrap";
    const mat = getStitchMaterial(stitchColorHex);
    const r = wheelRadiusMm / 1000;
    const w = wrapWidthMm / 1000;
    const wrapLen = wrapLengthMm / 1000;

    // Spiral stitch line along the rim
    const spiralTurns = wrapLen / (w * 1.2);
    const points: THREE.Vector3[] = [];

    for (let i = 0; i <= spiralTurns * 20; i++) {
      const t = i / (spiralTurns * 20);
      const angle = t * spiralTurns * Math.PI * 2;
      const y = t * wrapLen - wrapLen / 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * (r + 0.5 / 1000),
        y,
        Math.sin(angle) * (r + 0.5 / 1000)
      ));
    }

    if (points.length >= 2) {
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, points.length * 2, 0.2 / 1000, 6, false);
      const tube = new THREE.Mesh(tubeGeo, mat);
      tube.name = "Spiral_StitchLine";
      group.add(tube);
    }

    return group;
  }

  /**
   * Creates a decorative curved stitch line on the dashboard.
   */
  public static createDecorativeStitchCurve(
    controlPoints: THREE.Vector3[],
    stitchColorHex: string = "#d9a64e",
    stitchSpacingMm: number = 4.0,
    curveSegments: number = 32
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "DecorativeStitchCurve";

    if (controlPoints.length < 2) return group;

    const curve = new THREE.CatmullRomCurve3(controlPoints);
    const points = curve.getPoints(curveSegments);

    // Convert to path for French seam
    const seam = this.createFrenchSeam(
      points,
      stitchColorHex,
      0, // no seam width - just a single line
      stitchSpacingMm,
      2.5,
      0.3
    );
    group.add(seam);

    return group;
  }

  /**
   * Creates a basket-weave stitched leather pattern.
   */
  public static createBasketWeave(
    widthMm: number,
    heightMm: number,
    weaveSizeMm: number = 8,
    stitchColorHex: string = "#8a7a5a",
    surfaceColorHex: string = "#2a2520"
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "BasketWeave";
    const mat = getStitchMaterial(stitchColorHex);
    const w = widthMm / 1000;
    const h = heightMm / 1000;
    const ws = weaveSizeMm / 1000;
    const cols = Math.ceil(w / ws);
    const rows = Math.ceil(h / ws);

    // Base surface
    const baseGeo = new THREE.BoxGeometry(w, 0.8 / 1000, h);
    const baseMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(surfaceColorHex),
      roughness: 0.72,
      metalness: 0.04,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    group.add(base);

    // Weave lines
    for (let row = 0; row <= rows; row++) {
      const lineGeo = new THREE.BoxGeometry(w, 0.15 / 1000, 0.2 / 1000);
      const line = new THREE.Mesh(lineGeo, mat);
      line.position.set(0, 0.45 / 1000, -h / 2 + row * ws);
      group.add(line);
    }
    for (let col = 0; col <= cols; col++) {
      const lineGeo = new THREE.BoxGeometry(0.2 / 1000, 0.15 / 1000, h);
      const line = new THREE.Mesh(lineGeo, mat);
      line.position.set(-w / 2 + col * ws, 0.45 / 1000, 0);
      group.add(line);
    }

    return group;
  }

  /**
   * Creates seatbelt webbing texture stitch overlay.
   */
  public static createSeatbeltWebbingStitch(
    widthMm: number = 50,
    lengthMm: number = 500,
    stitchColorHex: string = "#333333",
    webbingColorHex: string = "#1a1a1a"
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "SeatbeltWebbingStitch";
    const mat = getStitchMaterial(stitchColorHex);
    const w = widthMm / 1000;
    const l = lengthMm / 1000;

    // Webbing base
    const webGeo = new THREE.BoxGeometry(0.3 / 1000, 0.5 / 1000, w);
    const webMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(webbingColorHex),
      roughness: 0.85,
      metalness: 0.0,
    });
    const web = new THREE.Mesh(webGeo, webMat);
    group.add(web);

    // Center stitch line
    const stitchSpacing = 5 / 1000;
    const stitchCount = Math.floor(l / stitchSpacing);
    for (let i = 0; i < stitchCount; i++) {
      const sg = new THREE.BoxGeometry(0.1 / 1000, 0.15 / 1000, 0.15 / 1000);
      const s = new THREE.Mesh(sg, mat);
      s.position.set(0, 0.3 / 1000, -l / 2 + i * stitchSpacing);
      group.add(s);
    }

    return group;
  }

  /**
   * Clears all cached materials.
   */
  public static clearCache(): void {
    stitchMaterialCache.forEach((m) => m.dispose());
    stitchMaterialCache.clear();
    pipingMaterialCache.forEach((m) => m.dispose());
    pipingMaterialCache.clear();
  }
}
