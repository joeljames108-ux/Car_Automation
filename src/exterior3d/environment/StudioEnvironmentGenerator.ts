// ============================================================================
// AAA AUTOMOTIVE STUDIO ENVIRONMENT & LIGHTING RIG GENERATOR
// ============================================================================
// 100-Phase Master Automotive CAD Architecture — Phase 12: Studio Lighting & Contact Shadows
// - 5-Point Dynamic Automotive Studio Lighting Rig (Overhead Softbox, Key, Fill, Rim, Underbounce)
// - Precision Ground Contact Shadow Plane with 4-Tire Footprint Ambient Occlusion
// - Spherical HDRI Radiance Map with High-Contrast Clearcoat Reflection Strips
// ============================================================================

import * as THREE from 'three';

export interface StudioEnvironmentOptions {
  theme?: 'darkWindTunnel' | 'luxuryShowroom' | 'cyberpunkNeon' | 'carbonLab';
  showGroundShadow?: boolean;
  groundShadowOpacity?: number;
}

export class StudioEnvironmentGenerator {
  /**
   * Generates a high-contrast dynamic spherical radiance cube/environment map for PBR reflections.
   */
  public static createStudioRadianceMap(renderer: THREE.WebGLRenderer): THREE.Texture {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Rich warm studio gradient background
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#3d2e18');
      grad.addColorStop(0.25, '#4a3a20');
      grad.addColorStop(0.5, '#2a1f10');
      grad.addColorStop(0.75, '#1a1208');
      grad.addColorStop(1, '#0d0a04');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Main overhead softbox — wide bright strip for roof reflection
      ctx.fillStyle = 'rgba(255, 250, 240, 1.0)';
      ctx.fillRect(canvas.width * 0.15, 8, canvas.width * 0.7, 55);

      // Secondary overhead strip
      ctx.fillStyle = 'rgba(255, 240, 210, 0.88)';
      ctx.fillRect(canvas.width * 0.05, 72, canvas.width * 0.9, 30);

      // Tertiary strip for fine highlight definition
      ctx.fillStyle = 'rgba(255, 245, 230, 0.55)';
      ctx.fillRect(canvas.width * 0.12, 112, canvas.width * 0.76, 14);

      // Fourth accent strip
      ctx.fillStyle = 'rgba(255, 225, 170, 0.35)';
      ctx.fillRect(canvas.width * 0.2, 134, canvas.width * 0.6, 8);

      // 3. Floor bounce — warm amber gradient at bottom
      const floorGrad = ctx.createLinearGradient(0, canvas.height - 40, 0, canvas.height);
      floorGrad.addColorStop(0, 'rgba(180, 140, 80, 0.0)');
      floorGrad.addColorStop(0.5, 'rgba(180, 140, 80, 0.18)');
      floorGrad.addColorStop(1, 'rgba(160, 120, 60, 0.35)');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

      // 4. Left rim light — warm golden radial
      const leftRim = ctx.createRadialGradient(
        canvas.width * 0.12, canvas.height * 0.45, 10,
        canvas.width * 0.12, canvas.height * 0.45, 140
      );
      leftRim.addColorStop(0, 'rgba(255, 220, 120, 0.95)');
      leftRim.addColorStop(0.5, 'rgba(255, 190, 80, 0.3)');
      leftRim.addColorStop(1, 'rgba(255, 180, 60, 0)');
      ctx.fillStyle = leftRim;
      ctx.fillRect(0, 0, canvas.width * 0.45, canvas.height);

      // 5. Right rim light — slightly cooler amber
      const rightRim = ctx.createRadialGradient(
        canvas.width * 0.88, canvas.height * 0.45, 10,
        canvas.width * 0.88, canvas.height * 0.45, 140
      );
      rightRim.addColorStop(0, 'rgba(255, 170, 70, 0.85)');
      rightRim.addColorStop(0.5, 'rgba(255, 150, 50, 0.25)');
      rightRim.addColorStop(1, 'rgba(255, 140, 40, 0)');
      ctx.fillStyle = rightRim;
      ctx.fillRect(canvas.width * 0.55, 0, canvas.width * 0.45, canvas.height);

      // 6. Subtle top-center hotspot for specular crown highlight
      const crownHotspot = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.15, 5,
        canvas.width * 0.5, canvas.height * 0.15, 180
      );
      crownHotspot.addColorStop(0, 'rgba(255, 255, 245, 0.6)');
      crownHotspot.addColorStop(1, 'rgba(255, 255, 245, 0)');
      ctx.fillStyle = crownHotspot;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.5);

      // 7. Background scattered warm bokeh dots for depth
      for (let i = 0; i < 25; i++) {
        const bx = Math.random() * canvas.width;
        const by = Math.random() * canvas.height;
        const br = 15 + Math.random() * 30;
        const bokeh = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        const alpha = 0.03 + Math.random() * 0.06;
        bokeh.addColorStop(0, `rgba(255, 220, 140, ${alpha})`);
        bokeh.addColorStop(1, 'rgba(255, 220, 140, 0)');
        ctx.fillStyle = bokeh;
        ctx.fillRect(bx - br, by - br, br * 2, br * 2);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Generates a realistic soft ground contact shadow plane with radial and tire falloff.
   */
  public static createContactShadowPlane(
    width: number = 2.8,
    length: number = 5.6,
    opacity: number = 0.88
  ): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 512, 512);

      // 1. Central Ambient Occlusion shadow under chassis — softer outer falloff
      const centerGrad = ctx.createRadialGradient(256, 256, 15, 256, 256, 240);
      centerGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
      centerGrad.addColorStop(0.25, 'rgba(0, 0, 0, 0.88)');
      centerGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.5)');
      centerGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.15)');
      centerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, 512, 512);

      // 2. Front & Rear Tire Contact Patches — tighter, more realistic
      const drawTirePatch = (x: number, y: number) => {
        const patch = ctx.createRadialGradient(x, y, 2, x, y, 48);
        patch.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
        patch.addColorStop(0.3, 'rgba(0, 0, 0, 0.8)');
        patch.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)');
        patch.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = patch;
        ctx.fillRect(x - 52, y - 52, 104, 104);

        // Tire spread/contact oval for realism
        const ovalGrad = ctx.createRadialGradient(x, y, 0, x, y, 35);
        ovalGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        ovalGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = ovalGrad;
        ctx.beginPath();
        ctx.ellipse(x, y, 30, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      };

      // FL, FR, RL, RR in normalized canvas space
      drawTirePatch(138, 145); // FL
      drawTirePatch(374, 145); // FR
      drawTirePatch(132, 375); // RL
      drawTirePatch(380, 375); // RR

      // 3. Subtle warm ambient glow beneath car for studio realism
      const warmGlow = ctx.createRadialGradient(256, 256, 30, 256, 256, 200);
      warmGlow.addColorStop(0, 'rgba(180, 130, 60, 0.08)');
      warmGlow.addColorStop(1, 'rgba(180, 130, 60, 0)');
      ctx.fillStyle = warmGlow;
      ctx.fillRect(0, 0, 512, 512);
    }

    const shadowTexture = new THREE.CanvasTexture(canvas);
    shadowTexture.needsUpdate = true;

    const geo = new THREE.PlaneGeometry(width, length);
    const mat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(-0.925, 0.002, 0);
    mesh.name = 'Realistic_Ground_Contact_Shadow';
    return mesh;
  }

  /**
   * Sets up a full 5-point studio lighting rig with key softbox, fill, rim, and ground bounce.
   */
  public static setupStudioLighting(scene: THREE.Scene, theme: string = 'darkWindTunnel', targetX: number = -0.925): {
    keyLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    rimLight: THREE.DirectionalLight;
    topSoftbox: THREE.DirectionalLight;
    underGlow: THREE.PointLight;
  } {
    // 1. Ambient Baseline — warm golden fill
    const ambient = new THREE.AmbientLight(0x2a1f10, 2.0);
    scene.add(ambient);

    // Hemisphere for sky/ground color separation
    const hemi = new THREE.HemisphereLight(0xfff5e6, 0x1a1208, 0.6);
    scene.add(hemi);

    // 2. Overhead High-Intensity Softbox — car roof, hood, shoulder lines
    const topSoftbox = new THREE.DirectionalLight(0xfff5e6, 4.2);
    topSoftbox.position.set(targetX, 8, 0);
    topSoftbox.castShadow = true;
    topSoftbox.shadow.mapSize.width = 2048;
    topSoftbox.shadow.mapSize.height = 2048;
    topSoftbox.shadow.camera.near = 0.5;
    topSoftbox.shadow.camera.far = 15;
    topSoftbox.shadow.camera.left = -3.5;
    topSoftbox.shadow.camera.right = 3.5;
    topSoftbox.shadow.camera.top = 3.5;
    topSoftbox.shadow.camera.bottom = -3.5;
    topSoftbox.shadow.bias = -0.0005;
    scene.add(topSoftbox);

    // 3. Three-Quarter Key Light — warm golden key for body highlights
    const keyLight = new THREE.DirectionalLight(0xffd699, 3.0);
    keyLight.position.set(targetX + 4.5, 4.5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // 4. Opposing Fill Light — soft warm fill to lift shadows
    const fillLight = new THREE.DirectionalLight(0x8b7355, 1.8);
    fillLight.position.set(targetX - 4.5, 3.5, 3);
    scene.add(fillLight);

    // 5. Rear Rim / Edge Light — dramatic edge separation
    const rimLight = new THREE.DirectionalLight(0xffa833, 2.2);
    rimLight.position.set(targetX - 3.5, 3.5, -5.5);
    scene.add(rimLight);

    // 6. Underbody Floor Bounce — warm undercarriage fill
    const underGlow = new THREE.PointLight(0xffaa33, 1.6, 8);
    underGlow.position.set(targetX, 0.15, 0);
    scene.add(underGlow);

    return { keyLight, fillLight, rimLight, topSoftbox, underGlow };
  }

  /**
   * Creates a subtle reflective floor mirror using a second camera render pass.
   * Returns the camera and render target for the reflection.
   */
  public static createGroundReflectionMirror(renderer: THREE.WebGLRenderer, scene: THREE.Scene, mainCamera: THREE.PerspectiveCamera): {
    mirrorCamera: THREE.PerspectiveCamera;
    mirrorTarget: THREE.WebGLRenderTarget;
    mirrorMesh: THREE.Mesh;
  } {
    const size = new THREE.Vector2();
    renderer.getSize(size);

    // Mirror render target at half resolution for performance
    const mirrorTarget = new THREE.WebGLRenderTarget(size.x, size.y, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

    // Mirror camera - flipped vertically around ground plane (y=0)
    const mirrorCamera = mainCamera.clone();

    // Semi-transparent mirror plane
    const mirrorGeo = new THREE.PlaneGeometry(10, 10);
    const mirrorMat = new THREE.MeshBasicMaterial({
      map: mirrorTarget.texture,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mirrorMesh = new THREE.Mesh(mirrorGeo, mirrorMat);
    mirrorMesh.rotation.x = -Math.PI / 2;
    mirrorMesh.position.y = 0.001;
    mirrorMesh.name = 'Ground_Reflection_Mirror';
    mirrorMesh.renderOrder = -1;

    return { mirrorCamera, mirrorTarget, mirrorMesh };
  }
  /**
   * Creates a subtle reflective ground plane for car underside bounce.
   */
  public static createReflectiveGroundPlane(): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(14, 14);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1208,
      metalness: 0.35,
      roughness: 0.08,
      clearcoat: 0.4,
      clearcoatRoughness: 0.1,
      envMapIntensity: 0.8,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.001;
    mesh.receiveShadow = true;
    mesh.name = 'Reflective_Ground_Plane';
    return mesh;
  }
  /**
   * Creates a modern engineering dark grid floor with radial vignette.
   */
  public static createCyberFloorGrid(size: number = 24): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Cyber_Floor_Grid';

    // Primary fine grid
    const grid = new THREE.GridHelper(size, 60, 0xd4a843, 0x2a1f10);
    grid.position.y = 0;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.22;
    group.add(grid);

    // Secondary coarse grid for scale reference
    const coarseGrid = new THREE.GridHelper(size, 12, 0xd4a843, 0x2a1f10);
    coarseGrid.position.y = 0.001;
    (coarseGrid.material as THREE.Material).transparent = true;
    (coarseGrid.material as THREE.Material).opacity = 0.35;
    group.add(coarseGrid);

    // Radial ground glow for atmospheric depth
    const glowGeo = new THREE.PlaneGeometry(size, size);
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 256;
    glowCanvas.height = 256;
    const glowCtx = glowCanvas.getContext('2d');
    if (glowCtx) {
      const glowGrad = glowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
      glowGrad.addColorStop(0, 'rgba(180, 140, 80, 0.08)');
      glowGrad.addColorStop(0.5, 'rgba(180, 140, 80, 0.03)');
      glowGrad.addColorStop(1, 'rgba(180, 140, 80, 0)');
      glowCtx.fillStyle = glowGrad;
      glowCtx.fillRect(0, 0, 256, 256);
    }
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.rotation.x = -Math.PI / 2;
    glowMesh.position.y = 0.002;
    group.add(glowMesh);

    return group;
  }

  /**
   * Creates a 3D Floating Holographic Telemetry Badge.
   */
  public static createFloatingHoloBadge(x: number, y: number, text: string): THREE.Group {
    const group = new THREE.Group();
    group.name = 'FloatingHoloBadge';
    group.position.set(x, y, 0);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Frosted glass background
      ctx.fillStyle = 'rgba(255, 248, 235, 0.85)';
      ctx.strokeStyle = 'rgba(217, 166, 78, 0.6)';
      ctx.lineWidth = 3;
      const r = 12;
      ctx.beginPath();
      ctx.moveTo(8 + r, 8);
      ctx.lineTo(504 - r, 8);
      ctx.quadraticCurveTo(504, 8, 504, 8 + r);
      ctx.lineTo(504, 120 - r);
      ctx.quadraticCurveTo(504, 120, 504 - r, 120);
      ctx.lineTo(8 + r, 120);
      ctx.quadraticCurveTo(8, 120, 8, 120 - r);
      ctx.lineTo(8, 8 + r);
      ctx.quadraticCurveTo(8, 8, 8 + r, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 24px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 64);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const planeGeo = new THREE.PlaneGeometry(1.2, 0.3);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });

    const badge = new THREE.Mesh(planeGeo, planeMat);
    group.add(badge);
    return group;
  }
}
