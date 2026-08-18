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
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Studio Gradient Background (Dark Navy to Charcoal)
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#0a0e1a');
      grad.addColorStop(0.4, '#151d2f');
      grad.addColorStop(0.7, '#070b14');
      grad.addColorStop(1, '#020408');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Overhead Softbox Light Strips (Yields crisp elongated reflections on car roof and hood)
      ctx.fillStyle = 'rgba(240, 248, 255, 0.95)';
      ctx.fillRect(canvas.width * 0.25, 20, canvas.width * 0.5, 40);

      ctx.fillStyle = 'rgba(180, 220, 255, 0.7)';
      ctx.fillRect(canvas.width * 0.1, 80, canvas.width * 0.8, 20);

      // 3. Side Rim Light Reflections (Cyan and Magenta rim accents)
      const leftRim = ctx.createRadialGradient(
        canvas.width * 0.15, canvas.height * 0.5, 10,
        canvas.width * 0.15, canvas.height * 0.5, 120
      );
      leftRim.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      leftRim.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = leftRim;
      ctx.fillRect(0, 0, canvas.width * 0.4, canvas.height);

      const rightRim = ctx.createRadialGradient(
        canvas.width * 0.85, canvas.height * 0.5, 10,
        canvas.width * 0.85, canvas.height * 0.5, 120
      );
      rightRim.addColorStop(0, 'rgba(236, 72, 153, 0.7)');
      rightRim.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = rightRim;
      ctx.fillRect(canvas.width * 0.6, 0, canvas.width * 0.4, canvas.height);
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
    opacity: number = 0.82
  ): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 512, 512);

      // 1. Central Ambient Occlusion shadow under chassis
      const centerGrad = ctx.createRadialGradient(256, 256, 20, 256, 256, 230);
      centerGrad.addColorStop(0, 'rgba(0, 0, 0, 0.96)');
      centerGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.78)');
      centerGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.38)');
      centerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, 512, 512);

      // 2. Front & Rear Tire Contact Patches (4 intense contact spots)
      const drawTirePatch = (x: number, y: number) => {
        const patch = ctx.createRadialGradient(x, y, 4, x, y, 50);
        patch.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
        patch.addColorStop(0.5, 'rgba(0, 0, 0, 0.65)');
        patch.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = patch;
        ctx.fillRect(x - 55, y - 55, 110, 110);
      };

      // FL, FR, RL, RR in normalized canvas space
      drawTirePatch(138, 145); // FL
      drawTirePatch(374, 145); // FR
      drawTirePatch(132, 375); // RL
      drawTirePatch(380, 375); // RR
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
    mesh.position.set(-0.925, 0.002, 0); // Aligned to vehicle center datum
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
    // 1. Ambient Baseline
    const ambient = new THREE.AmbientLight(0x0f172a, 1.4);
    scene.add(ambient);

    // 2. Overhead High-Intensity Softbox (Key light for car roof, hood, and shoulder lines)
    const topSoftbox = new THREE.DirectionalLight(0xffffff, 3.2);
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

    // 3. Three-Quarter Key Light (Warm white / ice cyan)
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
    keyLight.position.set(targetX + 4.5, 4, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // 4. Opposing Fill Light (Subdued cool fill)
    const fillLight = new THREE.DirectionalLight(0x64748b, 1.6);
    fillLight.position.set(targetX - 4.5, 3, 3);
    scene.add(fillLight);

    // 5. Rear Rim / Edge Light (Highlights diffuser, rear wing, and rear haunches)
    const rimLight = new THREE.DirectionalLight(0xec4899, 2.0);
    rimLight.position.set(targetX - 3.5, 3, -5.5);
    scene.add(rimLight);

    // 6. Underbody Floor Bounce
    const underGlow = new THREE.PointLight(0x00f0ff, 0.9, 6);
    underGlow.position.set(targetX, 0.15, 0);
    scene.add(underGlow);

    return { keyLight, fillLight, rimLight, topSoftbox, underGlow };
  }

  /**
   * Creates a modern engineering dark grid floor with radial vignette.
   */
  public static createCyberFloorGrid(size: number = 24): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Cyber_Floor_Grid';

    // Primary Grid
    const grid = new THREE.GridHelper(size, 48, 0x38bdf8, 0x1e293b);
    grid.position.y = 0;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.28;
    group.add(grid);

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
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, 496, 112);
      ctx.fillRect(8, 8, 496, 112);

      ctx.fillStyle = '#38bdf8';
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
