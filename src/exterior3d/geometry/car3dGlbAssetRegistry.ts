// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — CAR 3D GLB ASSET REGISTRY
// ============================================================================
// Master registry mapping vehicle body styles, chassis platforms, and engines
// to real production .glb / .gltf / .fbx 3D asset files.
// ============================================================================

export interface CarGlbAssetDefinition {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  assetPath: string;
  fallbackPath?: string;
  category: "SUPERCAR" | "HATCHBACK" | "SEDAN" | "RALLY" | "CHASSIS" | "ENGINE" | "RESTOMOD";
  wheelbaseMm: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  bodyPaintMaterialNames: string[];
  glassMaterialNames?: string[];
  caliperColorDefault?: string;
  suggestedCameraRadius?: number;
}

export class Car3DGlbAssetRegistry {
  public static readonly ASSETS: Record<string, CarGlbAssetDefinition> = {
    SUPERCAR_MID_ENGINE: {
      id: "SUPERCAR_MID_ENGINE",
      name: "BMW i8 Hybrid Supercar GLB",
      subtitle: "Mid-Engine Carbon Monocoque Plug-in Hybrid Supercar",
      description: "High-fidelity 3D GLB model of BMW i8 with carbon tub, butterfly doors, active aero body shell, and photorealistic cockpit.",
      assetPath: "/models/exterior/sports_car_bmw_i8.glb",
      fallbackPath: "/models/extracted/bmw-i8-xs-2015/source/2015-bmw-i8_xs_car.glb",
      category: "SUPERCAR",
      wheelbaseMm: 2800,
      lengthMm: 4689,
      widthMm: 1942,
      heightMm: 1297,
      bodyPaintMaterialNames: ["paint", "car_paint", "body", "car_body", "primary_paint", "exterior_paint", "paint_main"],
      glassMaterialNames: ["glass", "window", "windshield", "rear_window"],
      caliperColorDefault: "#dc2626",
      suggestedCameraRadius: 4.2,
    },
    GT3_RACE_CAR: {
      id: "GT3_RACE_CAR",
      name: "Ford Escort RS Cosworth WRC GLB",
      subtitle: "FIA World Rally Championship Spec 4WD Legend",
      description: "High-fidelity 3D GLB model of Ford Escort RS Cosworth with double-deck wing, hood heat extractors, and rally widebody.",
      assetPath: "/models/exterior/hatchback_ford_escort.glb",
      fallbackPath: "/models/extracted/ford-escort-rs-cosworth-cossie/source/Body_lodA/Body_lodA/fordEscortRSCosworth.glb",
      category: "RALLY",
      wheelbaseMm: 2551,
      lengthMm: 4211,
      widthMm: 1734,
      heightMm: 1425,
      bodyPaintMaterialNames: ["body_paint", "carpaint", "paint_main", "ford_body", "livery", "swatcha"],
      glassMaterialNames: ["glass", "window", "lighta_diffuse"],
      caliperColorDefault: "#0284c7",
      suggestedCameraRadius: 3.8,
    },
    MINI_COUNTRYMAN_JCW: {
      id: "MINI_COUNTRYMAN_JCW",
      name: "Mini Countryman JCW Rally GLB",
      subtitle: "John Cooper Works ALL4 Rally Cross Championship Spec",
      description: "Ultra-detailed glTF 3D model of Mini Countryman JCW with turbo engine bay, rally wheels, badge details, and racing interior.",
      assetPath: "/models/extracted/mini-countryman-jcw/source/Unity2Skfb/Unity2Skfb.gltf",
      category: "RALLY",
      wheelbaseMm: 2670,
      lengthMm: 4299,
      widthMm: 1822,
      heightMm: 1557,
      bodyPaintMaterialNames: ["car_mini_countrymanjcw_2017_body", "paint", "body"],
      caliperColorDefault: "#dc2626",
      suggestedCameraRadius: 3.9,
    },
    VOLVO_P1800_RESTOMOD: {
      id: "VOLVO_P1800_RESTOMOD",
      name: "Volvo P1800 Restomod Widebody FBX/GLB",
      subtitle: "Custom Carbon-Bodied Restomod Touring GT",
      description: "High-density 3D model of custom Volvo P1800 Restomod featuring widened track flares, billet grille, and custom wheels.",
      assetPath: "/models/extracted/volvo-p1800-restomod-widebody-edition/source/car5.fbx",
      category: "RESTOMOD",
      wheelbaseMm: 2450,
      lengthMm: 4400,
      widthMm: 1850,
      heightMm: 1280,
      bodyPaintMaterialNames: ["paint", "body", "car_body"],
      caliperColorDefault: "#eab308",
      suggestedCameraRadius: 4.1,
    },
    SPORTS_CHASSIS_01: {
      id: "SPORTS_CHASSIS_01",
      name: "Sports Car Aluminum Monocoque Chassis GLB",
      subtitle: "Hydroformed Aluminum & Carbon Fiber Structural Skeleton",
      description: "3D structural aluminum & carbon monocoque chassis platform with 36 hardpoint nodes, shock towers, and X-brace bars.",
      assetPath: "/models/chassis/sports_car_chassis_01.glb",
      category: "CHASSIS",
      wheelbaseMm: 2680,
      lengthMm: 4400,
      widthMm: 1880,
      heightMm: 1180,
      bodyPaintMaterialNames: ["frame", "chassis", "aluminum", "tub"],
      caliperColorDefault: "#059669",
      suggestedCameraRadius: 4.0,
    },
    HATCHBACK_CHASSIS_01: {
      id: "HATCHBACK_CHASSIS_01",
      name: "Hatchback Platform Chassis GLB",
      subtitle: "Front-Engine Transverse Unibody Platform Architecture",
      description: "3D unibody platform chassis model with hydroformed front subframe, rear torsion beam, floorpan, and engine cradle.",
      assetPath: "/models/chassis/hatchback_chassis_01.glb",
      category: "CHASSIS",
      wheelbaseMm: 2500,
      lengthMm: 4100,
      widthMm: 1720,
      heightMm: 1350,
      bodyPaintMaterialNames: ["frame", "unibody", "floor"],
      caliperColorDefault: "#dc2626",
      suggestedCameraRadius: 3.7,
    },
    V12_MASTER_ENGINE: {
      id: "V12_MASTER_ENGINE",
      name: "60° V12 Racing Engine & Transaxle GLB",
      subtitle: "3.5L 60° V12 Naturally Aspirated / Twin-Turbo Racing Powertrain",
      description: "Complete master 3D GLB model of 60° V12 Racing Engine with 7-speed sequential transaxle, 12 velocity stacks, and dry sump.",
      assetPath: "/models/v12_racing_engine.glb",
      category: "ENGINE",
      wheelbaseMm: 0,
      lengthMm: 1150,
      widthMm: 720,
      heightMm: 680,
      bodyPaintMaterialNames: ["valve_cover", "intake", "manifold", "block"],
      caliperColorDefault: "#f59e0b",
      suggestedCameraRadius: 2.5,
    },
    HYPERCAR_REAR_ASSEMBLY: {
      id: "HYPERCAR_REAR_ASSEMBLY",
      name: "Hypercar Rear Assembly & Active Aero GLB",
      subtitle: "Rear Bodywork, Active Swan-Neck Wing, Venturi Diffuser & Quad Titanium Exhaust",
      description: "High-fidelity 3D GLB model of hypercar rear assembly with active swan-neck wing, Venturi diffuser strakes, OLED lightbar, quad titanium exhausts, and rear suspension.",
      assetPath: "/models/exterior/rear_car_assembly.glb",
      category: "SUPERCAR",
      wheelbaseMm: 2750,
      lengthMm: 2200,
      widthMm: 1980,
      heightMm: 1180,
      bodyPaintMaterialNames: ["Clearcoat_Apex_Blue_Paint", "paint", "body"],
      glassMaterialNames: ["Smoked_Rear_Backlite_Glass", "glass"],
      caliperColorDefault: "#b91c1c",
      suggestedCameraRadius: 3.5,
    },
  };

  public static getAsset(id: string): CarGlbAssetDefinition {
    return this.ASSETS[id] || this.ASSETS.SUPERCAR_MID_ENGINE;
  }

  public static getAllAssets(): CarGlbAssetDefinition[] {
    return Object.values(this.ASSETS);
  }
}
