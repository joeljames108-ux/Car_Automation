// ============================================================================
// MODULAR GLB/glTF ENGINE ASSEMBLY SYSTEM — CORE 3D TYPE SYSTEM
// ============================================================================
// Defines complete geometric math structures, component taxonomy, 3D attachment
// points, physical material visual properties, manifest specifications, live runtime
// instance graphs, camera/lighting setups, post-processing pipelines, serialization,
// validation engines, runtime type guards, and factory utilities.
// ============================================================================

import type { ComponentId, MaterialGrade } from '../sim/assemblyTypes';

// ============================================================================
// 1. 3D GEOMETRIC & MATHEMATICAL DATA STRUCTURES
// ============================================================================

/** 3-dimensional vector in meters (or standard coordinate units) */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/** 3-dimensional Euler rotation in radians */
export interface Euler3D {
  x: number;
  y: number;
  z: number;
  order?: 'XYZ' | 'YXZ' | 'ZXY' | 'ZYX' | 'YZX' | 'XZY';
}

/** 4-component Quaternion for smooth spatial orientation interpolation */
export interface Quaternion3D {
  x: number;
  y: number;
  z: number;
  w: number;
}

/** 4x4 Transformation Matrix flattened in column-major order */
export type Matrix4x4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

/** Complete 3D transformation state containing position, rotation, and scale */
export interface Transform3D {
  position: Vector3D;
  rotation: Euler3D;
  scale: Vector3D;
}

/** 3D Axis-Aligned Bounding Box (AABB) in meters */
export interface BoundingBox3D {
  min: Vector3D;
  max: Vector3D;
  center: Vector3D;
  size: Vector3D;
}

/** 3D Geometric Ray for click-selection and raycasting collision */
export interface Ray3D {
  origin: Vector3D;
  direction: Vector3D;
}

/** 3D Geometric Plane for clipping and cross-section analysis */
export interface Plane3D {
  normal: Vector3D;
  constant: number;
}

/** 3D Spherical Coordinate representation for orbital camera kinematics */
export interface Spherical3D {
  radius: number;
  phi: number;   // polar angle from up-axis in radians
  theta: number; // azimuthal angle around up-axis in radians
}

/** Cylindrical Coordinate representation for rotating engine components */
export interface Cylindrical3D {
  radius: number;
  theta: number; // angle in radians
  y: number;     // axial elevation
}

// ============================================================================
// 2. VECTOR & GEOMETRIC MATH UTILITIES
// ============================================================================

export const VectorMath = {
  create: (x: number = 0, y: number = 0, z: number = 0): Vector3D => ({ x, y, z }),
  
  zero: (): Vector3D => ({ x: 0, y: 0, z: 0 }),
  
  one: (): Vector3D => ({ x: 1, y: 1, z: 1 }),
  
  up: (): Vector3D => ({ x: 0, y: 0, z: 1 }),
  
  forward: (): Vector3D => ({ x: 1, y: 0, z: 0 }),
  
  right: (): Vector3D => ({ x: 0, y: 1, z: 0 }),
  
  clone: (v: Vector3D): Vector3D => ({ x: v.x, y: v.y, z: v.z }),
  
  copy: (target: Vector3D, source: Vector3D): Vector3D => {
    target.x = source.x;
    target.y = source.y;
    target.z = source.z;
    return target;
  },
  
  set: (v: Vector3D, x: number, y: number, z: number): Vector3D => {
    v.x = x;
    v.y = y;
    v.z = z;
    return v;
  },
  
  add: (a: Vector3D, b: Vector3D): Vector3D => ({
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  }),
  
  sub: (a: Vector3D, b: Vector3D): Vector3D => ({
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  }),
  
  multiplyScalar: (v: Vector3D, s: number): Vector3D => ({
    x: v.x * s,
    y: v.y * s,
    z: v.z * s,
  }),
  
  divideScalar: (v: Vector3D, s: number): Vector3D => ({
    x: s !== 0 ? v.x / s : 0,
    y: s !== 0 ? v.y / s : 0,
    z: s !== 0 ? v.z / s : 0,
  }),
  
  dot: (a: Vector3D, b: Vector3D): number => a.x * b.x + a.y * b.y + a.z * b.z,
  
  cross: (a: Vector3D, b: Vector3D): Vector3D => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }),
  
  lengthSq: (v: Vector3D): number => v.x * v.x + v.y * v.y + v.z * v.z,
  
  length: (v: Vector3D): number => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
  
  normalize: (v: Vector3D): Vector3D => {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return len > 0 ? { x: v.x / len, y: v.y / len, z: v.z / len } : { x: 0, y: 0, z: 0 };
  },
  
  distance: (a: Vector3D, b: Vector3D): number => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },
  
  distanceSq: (a: Vector3D, b: Vector3D): number => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
  },
  
  lerp: (a: Vector3D, b: Vector3D, t: number): Vector3D => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  }),
  
  equals: (a: Vector3D, b: Vector3D, epsilon: number = 1e-6): boolean =>
    Math.abs(a.x - b.x) <= epsilon &&
    Math.abs(a.y - b.y) <= epsilon &&
    Math.abs(a.z - b.z) <= epsilon,
    
  applyEuler: (v: Vector3D, e: Euler3D): Vector3D => {
    const q = QuaternionMath.fromEuler(e);
    return QuaternionMath.rotateVector(q, v);
  },
};

export const EulerMath = {
  create: (x: number = 0, y: number = 0, z: number = 0, order: Euler3D['order'] = 'XYZ'): Euler3D => ({
    x, y, z, order,
  }),
  
  zero: (): Euler3D => ({ x: 0, y: 0, z: 0, order: 'XYZ' }),
  
  clone: (e: Euler3D): Euler3D => ({ x: e.x, y: e.y, z: e.z, order: e.order }),
  
  toDegrees: (e: Euler3D): Vector3D => ({
    x: (e.x * 180) / Math.PI,
    y: (e.y * 180) / Math.PI,
    z: (e.z * 180) / Math.PI,
  }),
  
  fromDegrees: (xDeg: number, yDeg: number, zDeg: number, order: Euler3D['order'] = 'XYZ'): Euler3D => ({
    x: (xDeg * Math.PI) / 180,
    y: (yDeg * Math.PI) / 180,
    z: (zDeg * Math.PI) / 180,
    order,
  }),
  
  lerp: (a: Euler3D, b: Euler3D, t: number): Euler3D => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
    order: a.order || 'XYZ',
  }),
};

export const QuaternionMath = {
  identity: (): Quaternion3D => ({ x: 0, y: 0, z: 0, w: 1 }),
  
  fromEuler: (e: Euler3D): Quaternion3D => {
    const c1 = Math.cos(e.x / 2);
    const c2 = Math.cos(e.y / 2);
    const c3 = Math.cos(e.z / 2);
    const s1 = Math.sin(e.x / 2);
    const s2 = Math.sin(e.y / 2);
    const s3 = Math.sin(e.z / 2);

    return {
      x: s1 * c2 * c3 + c1 * s2 * s3,
      y: c1 * s2 * c3 - s1 * c2 * s3,
      z: c1 * c2 * s3 + s1 * s2 * c3,
      w: c1 * c2 * c3 - s1 * s2 * s3,
    };
  },
  
  toEuler: (q: Quaternion3D): Euler3D => {
    const sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
    const cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
    const x = Math.atan2(sinr_cosp, cosr_cosp);

    const sinp = 2 * (q.w * q.y - q.z * q.x);
    const y = Math.abs(sinp) >= 1 ? (Math.sign(sinp) * Math.PI) / 2 : Math.asin(sinp);

    const siny_cosp = 2 * (q.w * q.z + q.x * q.y);
    const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
    const z = Math.atan2(siny_cosp, cosy_cosp);

    return { x, y, z, order: 'XYZ' };
  },
  
  slerp: (qa: Quaternion3D, qb: Quaternion3D, t: number): Quaternion3D => {
    let cosHalfTheta = qa.w * qb.w + qa.x * qb.x + qa.y * qb.y + qa.z * qb.z;
    let b = { ...qb };

    if (cosHalfTheta < 0) {
      cosHalfTheta = -cosHalfTheta;
      b.x = -b.x;
      b.y = -b.y;
      b.z = -b.z;
      b.w = -b.w;
    }

    if (Math.abs(cosHalfTheta) >= 1.0) {
      return { ...qa };
    }

    const halfTheta = Math.acos(cosHalfTheta);
    const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

    if (Math.abs(sinHalfTheta) < 0.001) {
      return {
        x: qa.x * 0.5 + b.x * 0.5,
        y: qa.y * 0.5 + b.y * 0.5,
        z: qa.z * 0.5 + b.z * 0.5,
        w: qa.w * 0.5 + b.w * 0.5,
      };
    }

    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    return {
      x: qa.x * ratioA + b.x * ratioB,
      y: qa.y * ratioA + b.y * ratioB,
      z: qa.z * ratioA + b.z * ratioB,
      w: qa.w * ratioA + b.w * ratioB,
    };
  },
  
  rotateVector: (q: Quaternion3D, v: Vector3D): Vector3D => {
    const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
    const vx = v.x, vy = v.y, vz = v.z;

    const ix = qw * vx + qy * vz - qz * vy;
    const iy = qw * vy + qz * vx - qx * vz;
    const iz = qw * vz + qx * vy - qy * vx;
    const iw = -qx * vx - qy * vy - qz * vz;

    return {
      x: ix * qw + iw * -qx + iy * -qz - iz * -qy,
      y: iy * qw + iw * -qy + iz * -qx - ix * -qz,
      z: iz * qw + iw * -qz + ix * -qy - iy * -qx,
    };
  },
};

export const TransformMath = {
  createDefault: (): Transform3D => ({
    position: VectorMath.zero(),
    rotation: EulerMath.zero(),
    scale: VectorMath.one(),
  }),
  
  clone: (t: Transform3D): Transform3D => ({
    position: VectorMath.clone(t.position),
    rotation: EulerMath.clone(t.rotation),
    scale: VectorMath.clone(t.scale),
  }),
  
  lerp: (a: Transform3D, b: Transform3D, t: number): Transform3D => {
    const qA = QuaternionMath.fromEuler(a.rotation);
    const qB = QuaternionMath.fromEuler(b.rotation);
    const qInterp = QuaternionMath.slerp(qA, qB, t);

    return {
      position: VectorMath.lerp(a.position, b.position, t),
      rotation: QuaternionMath.toEuler(qInterp),
      scale: VectorMath.lerp(a.scale, b.scale, t),
    };
  },
};

// ============================================================================
// 3. COMPONENT TAXONOMY & ATTACHMENT TYPES
// ============================================================================

/** Exhaustive list of all independently controllable 3D engine components */
export type Engine3DComponentType =
  | 'engine-block'
  | 'crankshaft'
  | 'piston'
  | 'connecting-rod'
  | 'cylinder-head-left'
  | 'cylinder-head-right'
  | 'valve-cover-left'
  | 'valve-cover-right'
  | 'intake-manifold-left'
  | 'intake-manifold-right'
  | 'exhaust-header-left'
  | 'exhaust-header-right'
  | 'turbocharger'
  | 'dry-sump'
  | 'radiator'
  | 'transaxle'
  | 'engine-cover'
  | 'timing-chain'
  | 'flywheel'
  | 'clutch-pack'
  | 'bellhousing'
  | 'fuel-rail-left'
  | 'fuel-rail-right'
  | 'velocity-stack-left'
  | 'velocity-stack-right'
  | 'wiring-loom'
  | 'electronics-ecu'
  | 'spark-plug'
  | 'oil-filter'
  | 'water-pump';

/** Functional hierarchy category for grouping in configurator UI */
export type ComponentCategory3D =
  | 'core'
  | 'bottom-end'
  | 'top-end'
  | 'induction'
  | 'exhaust'
  | 'cooling'
  | 'drivetrain'
  | 'electrical'
  | 'covers';

/** Structural cylinder bank side of the component */
export type BankSide3D = 'left' | 'right' | 'center';

/** Multi-instance pattern of the component */
export type InstancePattern3D =
  | 'single'
  | 'per-cylinder'
  | 'per-bank'
  | 'per-bank-cylinder';

/** Functional attachment category for socket verification */
export type AttachmentCategory3D =
  | 'piston_cylinder_bore'
  | 'connecting_rod_crank_journal'
  | 'connecting_rod_wrist_pin'
  | 'crankshaft_main_saddle'
  | 'cylinder_head_deck'
  | 'valve_cover_rail'
  | 'intake_port_flange'
  | 'exhaust_port_flange'
  | 'turbo_flange'
  | 'oil_pan_skirt'
  | 'radiator_chassis_bracket'
  | 'transaxle_bellhousing_flange'
  | 'engine_cover_stud'
  | 'timing_case_front'
  | 'flywheel_crank_flange'
  | 'spark_plug_well'
  | 'fuel_rail_boss'
  | 'sensor_boss';

/** Precise 3D attachment mount definition */
export interface AttachmentPoint3D {
  id: string;                          // e.g. "Piston_04_Mount"
  position: Vector3D;                  // in component-local coordinates (meters)
  rotation: Euler3D;                   // alignment orientation in radians
  category: AttachmentCategory3D;
  acceptsType: Engine3DComponentType;  // what component type is accepted
  occupied: boolean;
  occupiedBy?: string;                 // instanceId of currently docked child component
  bankSide?: BankSide3D;
  cylinderIndex?: number;              // 1 to 12
  snappingToleranceRadiusMm?: number;  // tolerance radius for manual docking
  torqueSpecNm?: number;               // mechanical torque spec
}

// ============================================================================
// 4. PHYSICAL PBR MATERIAL DEFINITIONS
// ============================================================================

/** Visual configuration of an automotive material grade variant */
export interface MaterialVariantVisual {
  id: MaterialGrade | 'ceramic' | 'carbon_fiber' | 'inconel' | 'magnesium' | 'brass' | 'quartz_glass';
  label: string;
  color: number;                      // Hexadecimal RGB color (e.g. 0x94a3b8)
  metalness: number;                  // 0.0 (dielectric) to 1.0 (conductor)
  roughness: number;                  // 0.0 (smooth mirror) to 1.0 (matte diffuse)
  clearcoat?: number;                 // 0.0 to 1.0 (automotive clear lacquer)
  clearcoatRoughness?: number;        // 0.0 to 1.0
  transmission?: number;              // 0.0 (opaque) to 1.0 (transmissive glass)
  ior?: number;                       // Index of Refraction (1.0 to 2.5)
  emissive?: number;                  // Emissive glow color
  emissiveIntensity?: number;         // Glow multiplier
  envMapIntensity?: number;           // HDRI reflection multiplier
  opacity?: number;                   // Transparency opacity factor (0.0 to 1.0)
  wireframe?: boolean;
}

/** Complete component material preset catalog */
export interface MaterialPresetDefinition {
  name: string;
  description: string;
  defaultVariant: MaterialVariantVisual;
  availableVariants: MaterialVariantVisual[];
}

// ============================================================================
// 5. COMPONENT MANIFEST SCHEMA
// ============================================================================

/** Static declarative blueprint specification for an engine component */
export interface Engine3DComponentManifest {
  type: Engine3DComponentType;
  displayName: string;
  category: ComponentCategory3D;
  assetPath: string;                           // e.g. "/models/engines/v12/piston.glb"
  lodAssetPaths?: {                            // Level-of-detail asset variations
    lod0: string;                              // Full high-poly geometry
    lod1?: string;                             // Medium distance geometry
    lod2?: string;                             // Low-poly placeholder proxy
  };
  attachmentPoints: AttachmentPoint3D[];       // Sockets hosted ON this component
  parentType: Engine3DComponentType | null;    // What component type this mounts onto
  parentAttachmentPattern: string;             // Regex or pattern for parent socket matching
  selfMountPointId?: string;                   // ID of this component's mount socket aligning with parent
  dependencies: Engine3DComponentType[];       // Prerequisites that must be installed first
  instanceCount: number;                       // 1 for singular, 12 for pistons, 2 for heads, etc.
  instancePattern: InstancePattern3D;
  bankAssignment: BankSide3D;
  explodedOffset: Vector3D;                    // Directional explosion offset vector in meters
  explodedRotation?: Euler3D;                  // Exploded orientation delta
  defaultTransform: Transform3D;               // Base neutral transform
  variants: MaterialVariantVisual[];
  massKg: number;                              // Mass in kilograms
  centerOfMassMm: Vector3D;                    // Center of mass relative to local origin
  costUsd: number;
  torqueSpec?: {
    fastenerName: string;
    snugNm: number;
    finalAngleDeg: number;
    boltCount: number;
  };
  clearanceSpec?: {
    label: string;
    targetMm: number;
    minMm: number;
    maxMm: number;
  };
  soundOnInstall: 'heavy-drop' | 'metallic-click' | 'slide-lock' | 'pneumatic-snap' | 'spool-whine' | 'bolt-torque' | 'glass-settle';
  installAnimationDurationMs: number;
  description: string;
  engineeringNotes: string;
}

// ============================================================================
// 6. RUNTIME INSTANCE GRAPH DATA MODELS
// ============================================================================

/** Lifecycle state of a live component instance in the 3D viewport */
export type ComponentInstanceState =
  | 'spawning'     // Just created off-screen or above engine
  | 'traveling'    // Moving along Bezier trajectory towards mount
  | 'aligning'     // Rotating to match socket orientation
  | 'snapping'     // Final slide into place
  | 'settling'     // Spring bounce & emission flash
  | 'installed'    // Fully locked and active
  | 'removing'     // Flying away during uninstallation
  | 'removed'      // Marked for cleanup
  | 'error';       // Mechanical interference or dependency breach

/** Live, active component instance inside the 3D scene graph */
export interface ComponentInstance3D {
  instanceId: string;                          // Unique instance identifier e.g. "piston-04"
  type: Engine3DComponentType;
  manifestRef: Engine3DComponentManifest;
  transform: Transform3D;                      // Current real-time world transform
  assembledTransform: Transform3D;              // Solved final target position in assembled engine
  spawnTransform: Transform3D;                  // Trajectory spawn origin position
  parentInstanceId: string | null;             // ID of parent component instance
  parentAttachmentPointId: string | null;      // ID of socket on parent
  childInstanceIds: string[];                  // Subordinate attached children
  installedAt: number;                          // Timestamp when installed
  variant: MaterialVariantVisual;
  state: ComponentInstanceState;
  bankSide: BankSide3D;
  cylinderIndex: number | null;                 // 1 to 12 (or null for non-cylinder components)
  opacity: number;                             // Real-time render opacity
  visible: boolean;
  highlighted: boolean;                        // Hovered state indicator
  selected: boolean;                           // Selected state for inspection
  wireframe: boolean;
  animationProgress: number;                    // 0.0 to 1.0 during install/remove
  isAnimating: boolean;
}

// ============================================================================
// 7. CAMERA SYSTEM & VIEWPORT MODES
// ============================================================================

/** Pre-configured cinematic camera viewpoints */
export type CameraPreset3D =
  | 'iso-front-left'
  | 'iso-front-right'
  | 'iso-rear-left'
  | 'iso-rear-right'
  | 'front'
  | 'rear'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'bank-left-detail'
  | 'bank-right-detail'
  | 'intake-detail'
  | 'exhaust-detail'
  | 'bottom-end-detail';

/** Dynamic camera kinematic parameters */
export interface CameraState {
  preset: CameraPreset3D;
  position: Vector3D;
  target: Vector3D;
  fov: number;
  near: number;
  far: number;
  orbitEnabled: boolean;
  panEnabled: boolean;
  zoomEnabled: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
  dampingFactor: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
}

// ============================================================================
// 8. LIGHTING & STUDIO ATMOSPHERE PRESETS
// ============================================================================

/** Lighting environment ambiance mood */
export type LightingPreset =
  | 'studio'
  | 'workshop'
  | 'showroom'
  | 'outdoor'
  | 'dramatic'
  | 'blueprint';

/** Single light source definition */
export interface LightConfig {
  id: string;
  type: 'directional' | 'point' | 'spot' | 'ambient' | 'hemisphere';
  color: number;
  intensity: number;
  position?: Vector3D;
  target?: Vector3D;
  castShadow?: boolean;
  shadowMapSize?: number;
  shadowBias?: number;
  penumbra?: number;
  decay?: number;
  angle?: number;
}

/** Complete lighting and environment configuration */
export interface LightingPresetConfig {
  id: LightingPreset;
  label: string;
  description: string;
  lights: LightConfig[];
  environmentMap?: string;
  environmentIntensity: number;
  environmentRotation?: number;
  backgroundType: 'solid' | 'gradient' | 'hdri' | 'transparent';
  backgroundColor?: number;
  backgroundGradient?: [number, number];
  fog?: {
    color: number;
    near: number;
    far: number;
  };
  toneMapping: 'aces' | 'reinhard' | 'linear' | 'cineon';
  toneMappingExposure: number;
}

// ============================================================================
// 9. POST-PROCESSING PIPELINE SCHEMA
// ============================================================================

/** Visual post-processing effects configuration */
export interface PostProcessingConfig {
  bloom: {
    enabled: boolean;
    intensity: number;
    luminanceThreshold: number;
    luminanceSmoothing: number;
  };
  ssao: {
    enabled: boolean;
    radius: number;
    intensity: number;
    luminanceInfluence: number;
    samples: number;
  };
  vignette: {
    enabled: boolean;
    offset: number;
    darkness: number;
  };
  chromaticAberration: {
    enabled: boolean;
    offset: number;
  };
  depthOfField: {
    enabled: boolean;
    focusDistance: number;
    focalLength: number;
    bokehScale: number;
  };
  outline: {
    enabled: boolean;
    edgeStrength: number;
    pulseSpeed: number;
    selectedColor: number;
    hoveredColor: number;
  };
  toneMapping: {
    exposure: number;
  };
}

// ============================================================================
// 10. SERIALIZATION & PERSISTENCE
// ============================================================================

/** Compact serializable snapshot of a component instance */
export interface SerializedComponentInstance {
  instanceId: string;
  type: Engine3DComponentType;
  variantId: string;
  parentInstanceId: string | null;
  parentAttachmentPointId: string | null;
  bankSide: BankSide3D;
  cylinderIndex: number | null;
  customPositionOffset?: Vector3D;
}

/** Complete serializable engine build configuration */
export interface EngineAssemblyConfig {
  id: string;
  name: string;
  engineType: 'v12' | 'v8' | 'v10' | 'v6' | 'i6' | 'i4' | 'w12' | 'w16';
  installedComponents: SerializedComponentInstance[];
  createdAt: number;
  updatedAt: number;
  version: number;
  author?: string;
  notes?: string;
}

/** Bill of Materials entry for manufacturing and cost audit */
export interface BillOfMaterialsEntry {
  componentType: Engine3DComponentType;
  displayName: string;
  category: ComponentCategory3D;
  variantId: string;
  variantLabel: string;
  quantity: number;
  unitMassKg: number;
  totalMassKg: number;
  unitCostUsd: number;
  totalCostUsd: number;
  instanceIds: string[];
}

/** Summary of mechanical engine assembly build */
export interface AssemblySummaryReport {
  configName: string;
  engineType: string;
  totalComponents: number;
  totalMassKg: number;
  totalCostUsd: number;
  completionPercentage: number;
  bom: BillOfMaterialsEntry[];
  validationStatus: 'VALID' | 'WARNINGS' | 'INVALID';
  errorsCount: number;
  warningsCount: number;
}

// ============================================================================
// 11. EVENT BUS & DISPATCH TYPES
// ============================================================================

/** Typed domain event map for all 3D engine events */
export type Engine3DEvent =
  | { type: 'component-added'; instanceId: string; componentType: Engine3DComponentType; bankSide: BankSide3D; cylinderIndex: number | null; }
  | { type: 'component-removed'; instanceId: string; componentType: Engine3DComponentType; cascadeRemoved: string[]; }
  | { type: 'component-replaced'; instanceId: string; oldVariant: string; newVariant: string; }
  | { type: 'component-selected'; instanceId: string | null; component: ComponentInstance3D | null; }
  | { type: 'component-hovered'; instanceId: string | null; component: ComponentInstance3D | null; }
  | { type: 'animation-started'; instanceId: string; animationType: 'install' | 'remove' | 'explode' | 'variant_swap'; }
  | { type: 'animation-completed'; instanceId: string; animationType: 'install' | 'remove' | 'explode' | 'variant_swap'; }
  | { type: 'exploded-view-changed'; amount: number; }
  | { type: 'camera-preset-changed'; preset: CameraPreset3D; }
  | { type: 'lighting-preset-changed'; preset: LightingPreset; }
  | { type: 'assembly-complete'; totalComponents: number; }
  | { type: 'assembly-reset'; }
  | { type: 'config-saved'; configId: string; }
  | { type: 'config-loaded'; configId: string; };

export type Engine3DEventListener<T extends Engine3DEvent['type'] = Engine3DEvent['type']> = (
  event: Extract<Engine3DEvent, { type: T }>
) => void;

// ============================================================================
// 12. VALIDATION & DIAGNOSTIC MODELS
// ============================================================================

export type DiagnosticSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface Assembly3DValidationError {
  code: string;
  severity: DiagnosticSeverity;
  componentType: Engine3DComponentType;
  instanceId?: string;
  message: string;
  details: string;
  missingDependency?: Engine3DComponentType;
  autoFixAvailable?: boolean;
}

export interface Assembly3DValidationWarning {
  code: string;
  componentType?: Engine3DComponentType;
  instanceId?: string;
  message: string;
  suggestion: string;
}

export interface Assembly3DValidation {
  isValid: boolean;
  errors: Assembly3DValidationError[];
  warnings: Assembly3DValidationWarning[];
  passedChecks: number;
  totalChecks: number;
}

// ============================================================================
// 13. RUNTIME TYPE GUARDS
// ============================================================================

export function isVector3D(obj: unknown): obj is Vector3D {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Vector3D).x === 'number' &&
    typeof (obj as Vector3D).y === 'number' &&
    typeof (obj as Vector3D).z === 'number'
  );
}

export function isEuler3D(obj: unknown): obj is Euler3D {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Euler3D).x === 'number' &&
    typeof (obj as Euler3D).y === 'number' &&
    typeof (obj as Euler3D).z === 'number'
  );
}

export function isTransform3D(obj: unknown): obj is Transform3D {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    isVector3D((obj as Transform3D).position) &&
    isEuler3D((obj as Transform3D).rotation) &&
    isVector3D((obj as Transform3D).scale)
  );
}

export function isAttachmentPoint3D(obj: unknown): obj is AttachmentPoint3D {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as AttachmentPoint3D).id === 'string' &&
    isVector3D((obj as AttachmentPoint3D).position) &&
    isEuler3D((obj as AttachmentPoint3D).rotation) &&
    typeof (obj as AttachmentPoint3D).acceptsType === 'string' &&
    typeof (obj as AttachmentPoint3D).occupied === 'boolean'
  );
}

export function isComponentInstance3D(obj: unknown): obj is ComponentInstance3D {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as ComponentInstance3D).instanceId === 'string' &&
    typeof (obj as ComponentInstance3D).type === 'string' &&
    isTransform3D((obj as ComponentInstance3D).transform) &&
    typeof (obj as ComponentInstance3D).state === 'string'
  );
}

export function isEngine3DComponentType(value: string): value is Engine3DComponentType {
  const validTypes: Engine3DComponentType[] = [
    'engine-block',
    'crankshaft',
    'piston',
    'connecting-rod',
    'cylinder-head-left',
    'cylinder-head-right',
    'valve-cover-left',
    'valve-cover-right',
    'intake-manifold-left',
    'intake-manifold-right',
    'exhaust-header-left',
    'exhaust-header-right',
    'turbocharger',
    'dry-sump',
    'radiator',
    'transaxle',
    'engine-cover',
    'timing-chain',
    'flywheel',
    'clutch-pack',
    'bellhousing',
    'fuel-rail-left',
    'fuel-rail-right',
    'velocity-stack-left',
    'velocity-stack-right',
    'wiring-loom',
    'electronics-ecu',
    'spark-plug',
    'oil-filter',
    'water-pump',
  ];
  return validTypes.includes(value as Engine3DComponentType);
}

// ============================================================================
// 14. FACTORY & CREATION HELPER UTILITIES
// ============================================================================

export function createDefaultTransform3D(): Transform3D {
  return {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    scale: { x: 1, y: 1, z: 1 },
  };
}

export function createAttachmentPoint(
  id: string,
  position: Vector3D,
  rotation: Euler3D,
  category: AttachmentCategory3D,
  acceptsType: Engine3DComponentType,
  options?: Partial<AttachmentPoint3D>
): AttachmentPoint3D {
  return {
    id,
    position,
    rotation,
    category,
    acceptsType,
    occupied: false,
    ...options,
  };
}

export function createComponentInstance(
  instanceId: string,
  manifest: Engine3DComponentManifest,
  assembledTransform: Transform3D,
  options?: Partial<ComponentInstance3D>
): ComponentInstance3D {
  const spawnOffset = manifest.explodedOffset;
  const spawnPosition: Vector3D = {
    x: assembledTransform.position.x + spawnOffset.x * 2.5,
    y: assembledTransform.position.y + spawnOffset.y * 2.5,
    z: assembledTransform.position.z + (spawnOffset.z !== 0 ? spawnOffset.z * 3.0 : 0.8),
  };

  const spawnTransform: Transform3D = {
    position: spawnPosition,
    rotation: { ...assembledTransform.rotation },
    scale: { x: 0.1, y: 0.1, z: 0.1 },
  };

  return {
    instanceId,
    type: manifest.type,
    manifestRef: manifest,
    transform: TransformMath.clone(spawnTransform),
    assembledTransform: TransformMath.clone(assembledTransform),
    spawnTransform: TransformMath.clone(spawnTransform),
    parentInstanceId: null,
    parentAttachmentPointId: null,
    childInstanceIds: [],
    installedAt: Date.now(),
    variant: manifest.variants[0] || {
      id: 'forged',
      label: 'Forged Alloy',
      color: 0xcbd5e1,
      metalness: 0.88,
      roughness: 0.22,
    },
    state: 'spawning',
    bankSide: manifest.bankAssignment,
    cylinderIndex: null,
    opacity: 0,
    visible: true,
    highlighted: false,
    selected: false,
    wireframe: false,
    animationProgress: 0,
    isAnimating: true,
    ...options,
  };
}

export function createDefaultCameraState(): CameraState {
  return {
    preset: 'iso-front-left',
    position: { x: 1.4, y: 1.2, z: 0.9 },
    target: { x: 0, y: 0, z: 0.2 },
    fov: 42,
    near: 0.05,
    far: 50.0,
    orbitEnabled: true,
    panEnabled: true,
    zoomEnabled: true,
    autoRotate: false,
    autoRotateSpeed: 0.5,
    dampingFactor: 0.05,
    minDistance: 0.4,
    maxDistance: 4.5,
    minPolarAngle: 0.1,
    maxPolarAngle: Math.PI / 2 + 0.15,
  };
}

export function createDefaultPostProcessingConfig(): PostProcessingConfig {
  return {
    bloom: {
      enabled: true,
      intensity: 0.35,
      luminanceThreshold: 0.82,
      luminanceSmoothing: 0.25,
    },
    ssao: {
      enabled: true,
      radius: 0.08,
      intensity: 1.5,
      luminanceInfluence: 0.6,
      samples: 16,
    },
    vignette: {
      enabled: true,
      offset: 0.35,
      darkness: 0.45,
    },
    chromaticAberration: {
      enabled: false,
      offset: 0.0015,
    },
    depthOfField: {
      enabled: false,
      focusDistance: 1.2,
      focalLength: 0.05,
      bokehScale: 2.0,
    },
    outline: {
      enabled: true,
      edgeStrength: 3.0,
      pulseSpeed: 2.5,
      selectedColor: 0x06b6d4, // Cyan
      hoveredColor: 0xffffff,  // White
    },
    toneMapping: {
      exposure: 1.1,
    },
  };
}
