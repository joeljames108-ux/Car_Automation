// ============================================================================
// GETLAYERS.AI — INTERACTIVE WebGL PROCEDURAL GRADIENT SHADER ENGINE
// ============================================================================
// Real-time GPU fluid gradient shaders inspired by GetLayers.ai:
// - Strigil: Deep cerulean/cyan fluid convection with caustic wave dynamics
// - Pharos: Solar flare amber, molten gold, and deep basalt obsidian
// - Laminar: Streamline supersonic velocity field with anisotropic shear
// - Komorebi: Dappled forest emerald, refracted jade, and golden sun dust
// - Antipode: Dual-polarity cyan and electric violet neon plasma
// - Ichor: Volcanic magma ember glow and crimson-tinted titanium
// - Kindle: Warm incandescent amber filaments and champagne gold
// - Shoal: Bioluminescent marine abyss with iridescent cyan ripples
// ============================================================================

import * as THREE from 'three';

export type GetLayersGradientId =
  | 'strigil'
  | 'pharos'
  | 'laminar'
  | 'komorebi'
  | 'antipode'
  | 'ichor'
  | 'kindle'
  | 'shoal';

export interface GradientColorPalette {
  name: string;
  subtitle: string;
  color1: string; // Base background
  color2: string; // Flow accent
  color3: string; // Specular crest
  color4: string; // Deep shadow
  fogColor: number;
  studioAmbient: number;
  speed: number;
  turbulence: number;
}

export const GETLAYERS_GRADIENTS: Record<GetLayersGradientId, GradientColorPalette> = {
  strigil: {
    name: 'Strigil',
    subtitle: 'Cerulean fluid convection & caustic wave dynamics',
    color1: '#070d18',
    color2: '#0284c7',
    color3: '#38bdf8',
    color4: '#031428',
    fogColor: 0x070d18,
    studioAmbient: 0x1e3a5f,
    speed: 0.85,
    turbulence: 1.4,
  },
  pharos: {
    name: 'Pharos',
    subtitle: 'Solar flare amber, molten gold & deep obsidian',
    color1: '#0c0a06',
    color2: '#d97706',
    color3: '#fde047',
    color4: '#291804',
    fogColor: 0x0c0a06,
    studioAmbient: 0x451a03,
    speed: 0.7,
    turbulence: 1.2,
  },
  laminar: {
    name: 'Laminar',
    subtitle: 'High-velocity aerodynamic streamline flow field',
    color1: '#060a12',
    color2: '#2563eb',
    color3: '#60a5fa',
    color4: '#0f172a',
    fogColor: 0x060a12,
    studioAmbient: 0x1e293b,
    speed: 1.2,
    turbulence: 0.9,
  },
  komorebi: {
    name: 'Komorebi',
    subtitle: 'Dappled emerald canopy & refracted jade highlights',
    color1: '#050c08',
    color2: '#059669',
    color3: '#34d399',
    color4: '#064e3b',
    fogColor: 0x050c08,
    studioAmbient: 0x064e3b,
    speed: 0.6,
    turbulence: 1.6,
  },
  antipode: {
    name: 'Antipode',
    subtitle: 'Cybernetic dual-polarity cyan & violet neon plasma',
    color1: '#090514',
    color2: '#9333ea',
    color3: '#06b6d4',
    color4: '#3b0764',
    fogColor: 0x090514,
    studioAmbient: 0x2e1065,
    speed: 1.0,
    turbulence: 1.8,
  },
  ichor: {
    name: 'Ichor',
    subtitle: 'Volcanic titanium exhaust glow & crimson embers',
    color1: '#120506',
    color2: '#dc2626',
    color3: '#f87171',
    color4: '#450a0a',
    fogColor: 0x120506,
    studioAmbient: 0x450a0a,
    speed: 0.9,
    turbulence: 1.5,
  },
  kindle: {
    name: 'Kindle',
    subtitle: 'Warm tungsten filament & brushed champagne luxury',
    color1: '#100c08',
    color2: '#b45309',
    color3: '#fed7aa',
    color4: '#431407',
    fogColor: 0x100c08,
    studioAmbient: 0x291804,
    speed: 0.5,
    turbulence: 1.1,
  },
  shoal: {
    name: 'Shoal',
    subtitle: 'Bioluminescent abyss & iridescent oceanic ripples',
    color1: '#040d14',
    color2: '#0d9488',
    color3: '#2dd4bf',
    color4: '#134e4a',
    fogColor: 0x040d14,
    studioAmbient: 0x115e59,
    speed: 0.75,
    turbulence: 1.3,
  },
};

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform float uSpeed;
  uniform float uTurbulence;
  varying vec2 vUv;

  // Simplex-inspired organic noise function
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * uSpeed * 0.25;

    // Interactive mouse distortion
    vec2 mouseOffset = (uMouse - 0.5) * 0.15;
    vec2 st = uv + mouseOffset;

    // Multi-octave organic warping
    float n1 = snoise(st * 2.2 * uTurbulence + vec2(t * 0.4, -t * 0.3));
    float n2 = snoise(st * 3.5 * uTurbulence - vec2(-t * 0.2, t * 0.5) + n1 * 0.5);
    float n3 = snoise(st * 5.0 + n2 * 0.8);

    // Dynamic wave mixing
    float mix1 = smoothstep(-0.6, 0.7, n1);
    float mix2 = smoothstep(-0.4, 0.8, n2);
    float mix3 = smoothstep(-0.2, 0.9, n3);

    // Quad-color blending
    vec3 colA = mix(uColor1, uColor2, mix1);
    vec3 colB = mix(uColor4, uColor3, mix2);
    vec3 finalCol = mix(colA, colB, mix3 * 0.75 + 0.25);

    // Subtle dark vignette to keep focus on vehicle
    float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv - 0.5) * 1.6);
    finalCol *= mix(0.45, 1.0, vignette);

    gl_FragColor = vec4(finalCol, 1.0);
  }
`;

export class GetLayersGradientShader {
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private currentId: GetLayersGradientId = 'strigil';

  constructor() {
    const palette = GETLAYERS_GRADIENTS[this.currentId];
    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uColor1: { value: new THREE.Color(palette.color1) },
        uColor2: { value: new THREE.Color(palette.color2) },
        uColor3: { value: new THREE.Color(palette.color3) },
        uColor4: { value: new THREE.Color(palette.color4) },
        uSpeed: { value: palette.speed },
        uTurbulence: { value: palette.turbulence },
      },
    });

    const geo = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = 'GetLayers_Background_Gradient_Plane';
    this.mesh.frustumCulled = false;
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public setGradient(id: GetLayersGradientId, scene?: THREE.Scene): void {
    this.currentId = id;
    const palette = GETLAYERS_GRADIENTS[id];
    if (!palette) return;

    this.material.uniforms.uColor1.value.set(palette.color1);
    this.material.uniforms.uColor2.value.set(palette.color2);
    this.material.uniforms.uColor3.value.set(palette.color3);
    this.material.uniforms.uColor4.value.set(palette.color4);
    this.material.uniforms.uSpeed.value = palette.speed;
    this.material.uniforms.uTurbulence.value = palette.turbulence;

    if (scene) {
      scene.fog = new THREE.FogExp2(palette.fogColor, 0.038);
    }
  }

  public getCurrentGradient(): GradientColorPalette {
    return GETLAYERS_GRADIENTS[this.currentId];
  }

  public update(delta: number, mouseX: number = 0.5, mouseY: number = 0.5): void {
    this.material.uniforms.uTime.value += delta;
    this.material.uniforms.uMouse.value.set(mouseX, mouseY);
  }

  public resize(width: number, height: number): void {
    this.material.uniforms.uResolution.value.set(width, height);
  }

  public dispose(): void {
    this.material.dispose();
    this.mesh.geometry.dispose();
  }
}
