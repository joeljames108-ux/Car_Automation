// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — 3D WEBGL CAD VIEWPORT
// ============================================================================
// Full-width interactive Three.js WebGL canvas supporting:
// - Orbit controls & studio lighting
// - Exploded view radial separation slider (0% to 100%)
// - X-Ray structural transparency & Wireframe inspection
// - 4 Camera presets (Front 3/4, Side, Top, Cockpit)
// - 3-Way Mode Switcher: 2D Blueprint, 3D Isometric SVG, 3D WebGL GLB
// ============================================================================

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js';
import {
  Layers,
  Sparkles,
  Eye,
  Sliders,
  RotateCw,
  Maximize2,
  Compass,
  Zap,
  Ruler,
  Flame,
  Wind,
  Disc,
} from 'lucide-react';
import { SharedWebGLContextManager } from '../../engine3d/managers/SharedWebGLContextManager';
import { VehicleSceneGraph } from '../../exterior3d/scene/VehicleSceneGraph';
import { VehicleDiagnosticGizmo } from '../../exterior3d/geometry/vehicleDiagnosticGizmo';
import { ModularChassisFamilyGenerator } from '../../exterior3d/generators/modularChassisFamilyGenerator';
import { ModularClosuresGenerator } from '../../exterior3d/generators/modularClosuresGenerator';
import { ModularInterior3DGenerator } from '../../exterior3d/generators/modularInterior3DGenerator';
import { ModularLightingGlassAeroGenerator } from '../../exterior3d/generators/modularLightingGlassAeroGenerator';
import { KinematicSuspension3DGenerator } from '../../exterior3d/generators/kinematicSuspension3DGenerator';
import { ForgedWheelAssembly3D, RimArchitectureStyle } from '../../exterior3d/generators/forgedWheelAssembly3D';
import { ModularPowertrainDrivetrain3DGenerator } from '../../exterior3d/generators/modularPowertrainDrivetrain3DGenerator';
import { SkateboardBatteryPack3DGenerator } from '../../exterior3d/generators/skateboardBatteryPack3DGenerator';
import {
  VehicleBodyType,
  VehicleSubsystemStage,
  Assembly3DViewMode,
  CameraPreset,
} from '../../exterior3d/types/vehicleConstructionTypes';
import { ModularInteriorConfiguration } from '../../exterior3d/types/modularInteriorTypes';
import { CHASSIS_50_MAP } from '../../exterior3d/manifests/chassis50Manifest';
import { MaterialGrade } from '../../sim/assemblyTypes';
import { StudioEnvironmentGenerator } from '../../exterior3d/environment/StudioEnvironmentGenerator';
import { UniversalGlbAssetLoader } from '../../exterior3d/loaders/universalGlbAssetLoader';
import { PaintFinishType, ModularBodyPanelCustomizer } from '../../exterior3d/materials/modularBodyPanelCustomizer';
import { ModularStructureEngine } from '../../sim/modularVehicle/modularStructureEngine';
import { ModularStructureVisualizer } from '../../exterior3d/geometry/modularStructureVisualizer';

interface ModularVehicle3DViewportProps {
  bodyType: VehicleBodyType;
  chassisId: string;
  installedStages: VehicleSubsystemStage[];
  materialGrades: Record<VehicleSubsystemStage, MaterialGrade>;
  interiorConfig?: Partial<ModularInteriorConfiguration>;
  wheelbaseMm: number;
  trackWidthFrontMm: number;
  trackWidthRearMm: number;
  rideHeightMm: number;
  viewMode: Assembly3DViewMode;
  cameraPreset: CameraPreset;
  explodedViewProgress: number;
  isXRayActive: boolean;
  isWireframeActive: boolean;
  isRotating: boolean;
  onSetViewMode: (mode: Assembly3DViewMode) => void;
  onSetCameraPreset: (preset: CameraPreset) => void;
  onSetExplodedView: (val: number) => void;
  onToggleXRay: () => void;
  onToggleWireframe: () => void;
  onToggleRotating: () => void;
  showCoG?: boolean;
  showFEAStress?: boolean;
  showLoadVectors?: boolean;
  isolatedStage?: string | null;
}

export const ModularVehicle3DViewport: React.FC<ModularVehicle3DViewportProps> = ({
  bodyType,
  chassisId,
  installedStages,
  materialGrades,
  interiorConfig = {},
  wheelbaseMm,
  trackWidthFrontMm,
  trackWidthRearMm,
  rideHeightMm,
  viewMode,
  cameraPreset,
  explodedViewProgress,
  isXRayActive,
  isWireframeActive,
  isRotating,
  onSetViewMode,
  onSetCameraPreset,
  onSetExplodedView,
  onToggleXRay,
  onToggleWireframe,
  onToggleRotating,
  showCoG = false,
  showFEAStress = false,
  showLoadVectors = false,
  isolatedStage = null,
}) => {
  const [modelSource, setModelSource] = React.useState<
    'parametric' | 'volvo_p1800' | 'byd_atto3' | 'ford_escort' | 'bmw_i8' | 'mini_countryman' | 'v12_engine'
  >('parametric');
  const [paintColor, setPaintColor] = React.useState<string>('#b45309');
  const [paintFinish, setPaintFinish] = React.useState<PaintFinishType>('satin_metallic');
  const [rimStyle, setRimStyle] = React.useState<RimArchitectureStyle>('turbofan');
  const [rimFinish, setRimFinish] = React.useState<'silver' | 'gloss_black' | 'satin_bronze' | 'gold' | 'gunmetal' | 'chrome'>('silver');
  const [headlightsOn, setHeadlightsOn] = React.useState<boolean>(true);
  const [underglowOn, setUnderglowOn] = React.useState<boolean>(false);
  const [underglowColor, setUnderglowColor] = React.useState<string>('#f59e0b');
  const [articulationMode, setArticulationMode] = React.useState<'closed' | 'doors_open' | 'hood_open' | 'all_open'>('closed');
  const [showDiagnostics, setShowDiagnostics] = React.useState<boolean>(false);
  const [brakesGlowing, setBrakesGlowing] = React.useState<boolean>(false);
  const [drsMode, setDrsMode] = React.useState<'closed' | 'drs_open' | 'airbrake'>('closed');
  const [showCFD, setShowCFD] = React.useState<boolean>(false);
  const [exhaustBackfire, setExhaustBackfire] = React.useState<boolean>(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const sceneGraphRef = useRef<VehicleSceneGraph | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Setup Three.js WebGL Scene
  useEffect(() => {
    if (viewMode !== '3d_glb' && viewMode !== 'xray_structural') return;
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera & WebGL Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c12);
    scene.fog = new THREE.FogExp2(0x0a0c12, 0.03);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    const targetX = -wheelbaseMm / 2000;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(targetX + 3.4, 1.8, 2.8);
    cameraRef.current = camera;

    const renderer = SharedWebGLContextManager.createSafeRenderer(container, width, height, {
      antialias: true,
      alpha: true,
      shadows: true,
      maxPixelRatio: 1.5,
    });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Post-Processing Pipeline
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // Screen-Space Ambient Occlusion for panel gap and crevice shadows
    const saoPass = new SAOPass(scene, camera, new THREE.Vector2(512, 512));
    saoPass.params.saoBias = 0.5;
    saoPass.params.saoIntensity = 0.035;
    saoPass.params.saoScale = 1.5;
    saoPass.params.saoKernelRadius = 80;
    saoPass.params.saoBlur = true;
    saoPass.params.saoBlurRadius = 6;
    saoPass.params.saoBlurStdDev = 3;
    saoPass.params.saoBlurDepthCutoff = 0.01;
    composer.addPass(saoPass);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.3, 0.5, 0.82);
    composer.addPass(bloomPass);
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.uniforms["resolution"].value.set(1 / width, 1 / height);
    composer.addPass(fxaaPass);
    const vignetteShader = {
      uniforms: { tDiffuse: { value: null }, offset: { value: 1.0 }, darkness: { value: 1.2 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: "uniform sampler2D tDiffuse; uniform float offset; uniform float darkness; varying vec2 vUv; void main(){ vec4 t=texture2D(tDiffuse,vUv); vec2 u=(vUv-vec2(0.5))*vec2(offset); t.rgb*=1.0-dot(u,u)*darkness; gl_FragColor=t; }"
    };
    const vignettePass = new ShaderPass(vignetteShader);
    composer.addPass(vignettePass);
    composer.addPass(new OutputPass());

    // Studio Environment Radiance Map
    if (typeof document !== 'undefined') {
      scene.environment = StudioEnvironmentGenerator.createStudioRadianceMap(renderer);
    }

    // 2. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Ground limit
    controls.minDistance = 1.5;
    controls.maxDistance = 12.0;
    controls.target.set(-wheelbaseMm / 2000, 0.4, 0);
    controlsRef.current = controls;

    // 3. Studio Lighting Rig
    StudioEnvironmentGenerator.setupStudioLighting(scene, 'luxuryShowroom');

    // 3b. Atmospheric Dust Particles for volumetric depth
    const dustCount = 120;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 6;
      dustPositions[i * 3 + 1] = Math.random() * 3;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      dustSizes[i] = 0.02 + Math.random() * 0.04;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
    const dustMat = new THREE.PointsMaterial({
      color: 0xc8ddf0,
      size: 0.035,
      transparent: true,
      opacity: 0.25,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    dustParticles.name = 'Atmospheric_Dust_Particles';
    scene.add(dustParticles);

    // 3c. Volumetric light cone from above softbox
    const lightConeGeo = new THREE.ConeGeometry(2.5, 4, 32, 1, true);
    const lightConeMat = new THREE.MeshBasicMaterial({
      color: 0xd0d8e8,
      transparent: true,
      opacity: 0.02,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const lightCone = new THREE.Mesh(lightConeGeo, lightConeMat);
    lightCone.position.set(-0.9, 3.5, 0);
    lightCone.name = 'Volumetric_Light_Cone';
    scene.add(lightCone);

    // Ground Plane with Soft Contact Shadow & Cyber Grid
    const cyberFloor = StudioEnvironmentGenerator.createCyberFloorGrid(24);
    scene.add(cyberFloor);

    const shadowPlane = StudioEnvironmentGenerator.createContactShadowPlane(2.6, 5.2, 0.88);
    scene.add(shadowPlane);

    // Reflective ground plane for underside bounce
    const reflectPlane = StudioEnvironmentGenerator.createReflectiveGroundPlane();
    scene.add(reflectPlane);

    // Ground reflection mirror
    const mirror = StudioEnvironmentGenerator.createGroundReflectionMirror(renderer, scene, camera);
    scene.add(mirror.mirrorMesh);

    // 3D Floating Holographic Telemetry Badge (Matching Reference Screenshot)
    const holoBadge = StudioEnvironmentGenerator.createFloatingHoloBadge(0.65, 1.35, `BODY: ${bodyType.toUpperCase()} • APEX-CAD 3D`);
    scene.add(holoBadge);

    // 4. Initialize Vehicle Scene Graph
    const sceneGraph = new VehicleSceneGraph();
    sceneGraphRef.current = sceneGraph;
    scene.add(sceneGraph.vehicleRoot);

    // 5. Populate Modular Meshes or Reference CAD Models (GLB / FBX)
    if (modelSource !== 'parametric') {
      let modelUrl = '';
      if (modelSource === 'volvo_p1800') modelUrl = '/models/extracted/volvo-p1800-restomod-widebody-edition/source/car5.fbx';
      else if (modelSource === 'byd_atto3') modelUrl = '/models/extracted/2024-byd-atto-3/source/FINAL_MODEL/FINAL_MODEL.fbx';
      else if (modelSource === 'ford_escort') modelUrl = '/models/exterior/hatchback_ford_escort.glb';
      else if (modelSource === 'bmw_i8') modelUrl = '/models/exterior/sports_car_bmw_i8.glb';
      else if (modelSource === 'mini_countryman') modelUrl = '/models/extracted/mini-countryman-jcw/source/Unity2Skfb/Unity2Skfb.gltf';
      else if (modelSource === 'v12_engine') modelUrl = '/models/engines/v12/engine-block.glb';

      UniversalGlbAssetLoader.loadAsset(modelUrl)
        .then((res) => {
          if (res && res.scene) {
            // Auto-colorize GLB body panels from paint color picker
            const paintColor3 = new THREE.Color(paintColor);
            res.scene.traverse((child) => {
              if (!(child as THREE.Mesh).isMesh) return;
              const mesh = child as THREE.Mesh;
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((m) => {
                if ((m as any).isMeshPhysicalMaterial || (m as any).isMeshStandardMaterial) {
                  const sm = m as THREE.MeshStandardMaterial;
                  // Apply paint to metallic body panels (high metalness = painted body)
                  if (sm.metalness > 0.4 && sm.color.r > 0.15 && sm.color.g > 0.15 && sm.color.b > 0.15) {
                    sm.color.lerp(paintColor3, 0.55);
                    sm.needsUpdate = true;
                  }
                }
              });
            });
            sceneGraph.vehicleRoot.add(res.scene);
          }
        })
        .catch((err) => {
          console.warn('[ModularViewport] Failed to load 3D model, falling back to parametric:', err);
        });
    } else {
      const chassisDef = CHASSIS_50_MAP[chassisId] || CHASSIS_50_MAP['SEDAN_CHASSIS_01'];

      // 5.1 Chassis Monocoque / Platform Mesh
      if (installedStages.includes('chassis_platform') || installedStages.includes('architecture')) {
        const chassisGrade = materialGrades.chassis_platform || 'forged';
        const chassisMesh = ModularChassisFamilyGenerator.buildChassisMesh(chassisDef, chassisGrade, isWireframeActive);
        sceneGraph.chassisRoot.add(chassisMesh);
      }

      // 5.2 Kinematic Suspension Assembly (Double Wishbones & Coilovers)
      if (installedStages.includes('suspension')) {
        const suspensionMesh = KinematicSuspension3DGenerator.buildSuspension(
          wheelbaseMm,
          trackWidthFrontMm,
          trackWidthRearMm,
          chassisDef.rideHeightMm,
          materialGrades.suspension || 'forged'
        );
        sceneGraph.suspensionRoot.add(suspensionMesh);
      }

      // 5.3 Forged Concave Wheels & Carbon-Ceramic Brakes
      if (installedStages.includes('wheels_brakes')) {
        const wheelsMesh = ForgedWheelAssembly3D.buildWheelsAndBrakes(
          wheelbaseMm,
          trackWidthFrontMm,
          trackWidthRearMm,
          680,
          materialGrades.wheels_brakes || 'forged',
          {
            rimStyle,
            rimFinish,
            brakesGlowing,
            brakeGlowIntensity: 0.95,
          }
        );
        sceneGraph.wheelBrakeRoot.add(wheelsMesh);
      }

      // 5.4 Modular Powertrain, Drivetrain & Battery
      if (installedStages.includes('powertrain_engine') || installedStages.includes('transmission')) {
        if (chassisDef.architectureClass === 'skateboard_ev_platform') {
          const batteryMesh = SkateboardBatteryPack3DGenerator.buildBatteryPack(wheelbaseMm, trackWidthRearMm, isXRayActive);
          sceneGraph.powertrainRoot.add(batteryMesh);
        } else {
          const layout =
            bodyType === 'supercar' || bodyType === 'hypercar' || bodyType === 'sports_car'
              ? 'mid_engine'
              : 'front_engine';

          const engineLayout: import('../../sim/types').EngineLayout =
            bodyType === 'hypercar'
              ? 'v12'
              : bodyType === 'supercar'
              ? 'v10'
              : bodyType === 'sports_car' || bodyType === 'convertible'
              ? 'boxer6'
              : bodyType === 'coupe'
              ? 'v8'
              : bodyType === 'sedan'
              ? 'v6'
              : bodyType === 'hatchback' || bodyType === 'wagon'
              ? 'i4'
              : bodyType === 'suv' || bodyType === 'pickup'
              ? 'v8'
              : 'v8';

          const powertrainMesh = ModularPowertrainDrivetrain3DGenerator.buildPowertrainDrivetrain(
            wheelbaseMm,
            materialGrades.powertrain_engine || 'forged',
            layout,
            engineLayout
          );
          sceneGraph.powertrainRoot.add(powertrainMesh);

          // Exhaust Flame Pop & Bang VFX
          if (exhaustBackfire) {
            const rearBumperX = 0.45 - (wheelbaseMm / 1000) - 0.72;
            const flames = ModularBodyPanelCustomizer.createExhaustBackfireVFX(rearBumperX, 0.32, [-0.18, 0.18]);
            sceneGraph.powertrainRoot.add(flames);
          }
        }
      }

      // 5.5 Closures & Sculpted Exterior Body Panels
      if (installedStages.includes('exterior_panels')) {
        const panelGrade = materialGrades.exterior_panels || 'forged';
        const doorOpen = articulationMode === 'doors_open' || articulationMode === 'all_open';
        const hoodOpen = articulationMode === 'hood_open' || articulationMode === 'all_open';

        const closures = ModularClosuresGenerator.buildClosures(
          bodyType,
          wheelbaseMm,
          trackWidthRearMm,
          panelGrade,
          isXRayActive,
          parseInt(paintColor.replace('#', '0x'), 16),
          {
            doorOpenProgress: doorOpen ? 1 : 0,
            hoodOpenProgress: hoodOpen ? 1 : 0,
          },
          { finishType: paintFinish, primaryColorHex: paintColor },
          trackWidthFrontMm
        );
        sceneGraph.exteriorPanelsRoot.add(closures);
      }

      // 5.6 Modular Cabin Interior & Cockpit
      if (installedStages.includes('interior_cabin')) {
        const interior = ModularInterior3DGenerator.buildModularInterior(interiorConfig, wheelbaseMm, trackWidthFrontMm);
        sceneGraph.interiorRoot.add(interior);
      }

      // 5.7 Lighting & Optical Glass
      if (installedStages.includes('lighting_glass')) {
        const lights = ModularLightingGlassAeroGenerator.buildLighting(wheelbaseMm, trackWidthFrontMm, {
          headlightsOn,
          drlOn: true,
          underglowOn,
          underglowColorHex: underglowColor,
        });
        sceneGraph.lightingGlassRoot.add(lights);

        // Only add standalone fallback glass if full sculpted exterior panels are not active
        if (!installedStages.includes('exterior_panels')) {
          const glass = ModularLightingGlassAeroGenerator.buildGlass(wheelbaseMm, trackWidthFrontMm);
          sceneGraph.lightingGlassRoot.add(glass);
        }
      }

      // 5.8 Active Aerodynamics & CFD Streamlines
      if (installedStages.includes('aerodynamics')) {
        // Only add standalone fallback aero wing if full sculpted exterior panels are not active
        if (!installedStages.includes('exterior_panels')) {
          const aero = ModularLightingGlassAeroGenerator.buildAerodynamics(
            wheelbaseMm,
            trackWidthRearMm,
            drsMode === 'drs_open',
            drsMode === 'airbrake'
          );
          sceneGraph.aeroRoot.add(aero);
        }

        if (showCFD) {
          const cfdMesh = ModularLightingGlassAeroGenerator.buildCFDStreamlines(wheelbaseMm, trackWidthRearMm);
          sceneGraph.aeroRoot.add(cfdMesh);
        }

        if (exhaustBackfire) {
          const flames = ModularLightingGlassAeroGenerator.buildExhaustFlames(wheelbaseMm, trackWidthRearMm);
          sceneGraph.aeroRoot.add(flames);
        }
      }

      // 5.9 Dimensional Foundation Diagnostic Overlay
      if (showDiagnostics) {
        const gizmo = VehicleDiagnosticGizmo.createDiagnosticOverlay(wheelbaseMm, trackWidthFrontMm, trackWidthRearMm);
        scene.add(gizmo);
      }

      // 5.10 Modular Structure Telemetry & FEA Stress Overlays (CoG, Load Vectors, FEA Heatmap)
      if (showCoG || showFEAStress || showLoadVectors) {
        const chassisDef = CHASSIS_50_MAP[chassisId] || CHASSIS_50_MAP['SEDAN_CHASSIS_01'];
        const telemetry = ModularStructureEngine.solveStructure(
          chassisDef,
          installedStages,
          materialGrades,
          wheelbaseMm,
          trackWidthFrontMm,
          trackWidthRearMm,
          rideHeightMm
        );
        const telemetryOverlays = ModularStructureVisualizer.createTelemetryOverlayGroup(
          telemetry,
          wheelbaseMm,
          trackWidthFrontMm,
          trackWidthRearMm,
          rideHeightMm,
          { showCoG, showFEAStress, showLoadVectors }
        );
        scene.add(telemetryOverlays);
      }

      // 5.11 Apply Subassembly Solo Isolation
      ModularStructureVisualizer.applySubassemblyIsolation(sceneGraph.vehicleRoot, isolatedStage);
    }

    // Update Exploded View
    sceneGraph.updateExplodedView(explodedViewProgress);

    // 6. Animation Render Loop (Adaptive with Background Tab Idle Sleep)
    let animationFrameId: number;
    let isTabVisible = typeof document !== 'undefined' ? !document.hidden : true;

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange);
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isTabVisible) return;

      if (isRotating) {
        sceneGraph.vehicleRoot.rotation.y += 0.005;
      }

      controls.update();
      // Render ground reflection pass
      mirror.mirrorCamera.position.copy(camera.position);
      mirror.mirrorCamera.position.y = -camera.position.y;
      mirror.mirrorCamera.quaternion.copy(camera.quaternion);
      mirror.mirrorCamera.lookAt(-wheelbaseMm / 2000, 0.4, 0);
      renderer.setRenderTarget(mirror.mirrorTarget);
      renderer.render(scene, mirror.mirrorCamera);
      renderer.setRenderTarget(null);

      // Render master composition pass with SSAO and UnrealBloom
      composer.render();
    };
    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      fxaaPass.uniforms["resolution"].value.set(1 / w, 1 / h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      mirror.mirrorTarget.dispose();
      sceneGraph.dispose();
      SharedWebGLContextManager.disposeThreeScene(scene);
      SharedWebGLContextManager.safelyDisposeRenderer(renderer, container);
    };
  }, [
    bodyType,
    chassisId,
    installedStages,
    materialGrades,
    wheelbaseMm,
    trackWidthFrontMm,
    trackWidthRearMm,
    rideHeightMm,
    viewMode,
    modelSource,
    paintColor,
    paintFinish,
    rimStyle,
    rimFinish,
    headlightsOn,
    underglowOn,
    underglowColor,
    articulationMode,
    showDiagnostics,
    brakesGlowing,
    drsMode,
    showCFD,
    exhaustBackfire,
    explodedViewProgress,
    isXRayActive,
    isWireframeActive,
    isRotating,
    showCoG,
    showFEAStress,
    showLoadVectors,
    isolatedStage,
  ]);

  // Update Camera Presets
  const applyCameraPreset = (preset: CameraPreset) => {
    onSetCameraPreset(preset);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const targetX = -wheelbaseMm / 2000;
    controls.target.set(targetX, 0.4, 0);

    if (preset === 'front_3_4') {
      camera.position.set(targetX + 3.4, 1.8, 2.8);
    } else if (preset === 'side_profile') {
      camera.position.set(targetX, 1.0, 3.8);
    } else if (preset === 'top_chassis') {
      camera.position.set(targetX, 4.8, 0.01);
    } else if (preset === 'cockpit') {
      camera.position.set(targetX - 0.2, 0.9, -0.1);
    }
    controls.update();
  };

  return (
    <div className="relative w-full bg-slate-950/90 border border-slate-800/40 rounded-3xl overflow-hidden shadow-2xl font-mono flex flex-col">
      {/* ── TOP HEADER TOOLBAR (OUTSIDE DIAGRAM) ── */}
      <div className="w-full p-4 flex flex-col gap-3 bg-slate-950/90 border-b border-slate-800/50 backdrop-blur-md">
        {/* Main Row: Modes & Primary Controls */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          {/* Left: View Mode Toggles & 3D Model Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-amber-950/60 border border-amber-800/40">
              <button
                onClick={() => onSetViewMode('2d_blueprint')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === '2d_blueprint'
                    ? 'bg-amber-500 text-amber-950 shadow-md'
                    : 'text-amber-400/70 hover:text-amber-200'
                }`}
              >
                2D Blueprint
              </button>
              <button
                onClick={() => onSetViewMode('3d_glb')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === '3d_glb'
                    ? 'bg-amber-500 text-amber-950 shadow-md'
                    : 'text-amber-400/70 hover:text-amber-200'
                }`}
              >
                3D WebGL GLB
              </button>
            </div>

            {/* Model Source Selector */}
            {(viewMode === '3d_glb' || viewMode === 'xray_structural') && (
              <select
                value={modelSource}
                onChange={(e) => setModelSource(e.target.value as any)}
                className="px-3 py-1.5 rounded-2xl bg-amber-950/60 border border-amber-600/50 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-400 cursor-pointer shadow-md hover:border-amber-400 transition-all"
              >
                <option value="parametric">⚡ Parametric Sculpted CAD</option>
                <option value="volvo_p1800">🇸🇪 Volvo P1800 Restomod (FBX)</option>
                <option value="byd_atto3">⚡ 2024 BYD Atto 3 (FBX)</option>
                <option value="ford_escort">🏆 Ford Escort RS Cosworth (GLB)</option>
                <option value="bmw_i8">⚡ BMW i8 Cyber Coupe (GLB)</option>
                <option value="mini_countryman">🚙 Mini Countryman JCW (GLTF)</option>
                <option value="v12_engine">⚙️ V12 Racing Engine (GLB)</option>
              </select>
            )}
          </div>

          {/* Right: Inspection Controls (Exploded View, X-Ray, Wireframe, Rotate, Camera Presets) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Exploded View Slider */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-950/60 border border-amber-800/40 text-xs text-slate-300">
              <Sliders size={13} className="text-amber-400" />
              <span className="text-[10px] text-slate-400 font-bold">Exploded:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodedViewProgress}
                onChange={(e) => onSetExplodedView(parseFloat(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer h-1.5"
              />
              <span className="text-[10px] text-amber-400 font-bold w-6">
                {Math.round(explodedViewProgress * 100)}%
              </span>
            </div>

            {/* X-Ray Toggle */}
            <button
              onClick={onToggleXRay}
              className={`p-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                isXRayActive
                  ? 'bg-amber-600/20 text-amber-300 border-amber-500/50 shadow-md'
                  : 'bg-base-950/80 border-slate-800 text-amber-400/70 hover:text-amber-200'
              }`}
              title="Toggle X-Ray Structural View"
            >
              <Eye size={15} />
            </button>

            {/* Wireframe Toggle */}
            <button
              onClick={onToggleWireframe}
              className={`p-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                isWireframeActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                  : 'bg-base-950/80 border-slate-800 text-amber-400/70 hover:text-amber-200'
              }`}
              title="Toggle CAD Wireframe Mesh"
            >
              <Layers size={15} />
            </button>

            {/* Auto-Rotate Toggle */}
            <button
              onClick={onToggleRotating}
              className={`p-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                isRotating
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                  : 'bg-base-950/80 border-slate-800 text-amber-400/70 hover:text-amber-200'
              }`}
              title="Toggle Auto-Rotation"
            >
              <RotateCw size={15} />
            </button>

            {/* Camera Presets */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-amber-950/60 border border-amber-800/40">
              <button
                onClick={() => applyCameraPreset('front_3_4')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${cameraPreset === 'front_3_4' ? 'bg-amber-500 text-slate-950' : 'text-amber-400/70 hover:text-amber-200'}`}
              >
                3/4 Front
              </button>
              <button
                onClick={() => applyCameraPreset('side_profile')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${cameraPreset === 'side_profile' ? 'bg-amber-500 text-slate-950' : 'text-amber-400/70 hover:text-amber-200'}`}
              >
                Side
              </button>
              <button
                onClick={() => applyCameraPreset('top_chassis')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${cameraPreset === 'top_chassis' ? 'text-white' : 'text-amber-700 hover:text-amber-900'}`} style={cameraPreset === 'top_chassis' ? {backgroundColor: '#D9A64E'} : {}}
              >
                Top Plan
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Toolbar (Paint Finish, Swatches, Rims, Aero, Brakes, VFX) */}
        {(viewMode === '3d_glb' || viewMode === 'xray_structural') && modelSource === 'parametric' && (
          <div className="w-full flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-amber-800/40 text-xs">
            {/* Paint Finish & Color Swatches */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-amber-400/60 font-bold uppercase tracking-wider">Paint:</span>
              <select
                value={paintFinish}
                onChange={(e) => setPaintFinish(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
              >
                <option value="satin_metallic">✨ Satin Metallic</option>
                <option value="gloss_clearcoat">💎 Gloss Clearcoat</option>
                <option value="liquid_candy">🍬 Liquid Candy Tint</option>
                <option value="pearlescent">🌈 Pearlescent Chroma</option>
                <option value="forged_carbon">⚡ Forged Carbon</option>
                <option value="matte_carbon">🏁 2x2 Matte Carbon</option>
              </select>

              <div className="flex items-center gap-1.5 ml-1">
                {[
                  { label: 'Sapphire Blue', color: '#b45309' },
                  { label: 'Crimson Red', color: '#ef4444' },
                  { label: 'Emerald Green', color: '#10b981' },
                  { label: 'Carbon Slate', color: '#1a1008' },
                  { label: 'Racing Gold', color: '#eab308' },
                  { label: 'Solar Orange', color: '#f97316' },
                  { label: 'Hyper Violet', color: '#f59e0b' },
                  { label: 'Pure White', color: '#f8fafc' },
                ].map((swatch) => (
                  <button
                    key={swatch.color}
                    onClick={() => setPaintColor(swatch.color)}
                    className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                      paintColor === swatch.color ? 'scale-125 border-white' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: swatch.color }}
                    title={swatch.label}
                  />
                ))}
              </div>
            </div>

            {/* Forged Rim Style & Finish */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-amber-400/60 font-bold uppercase tracking-wider">Rims:</span>
              <select
                value={rimStyle}
                onChange={(e) => setRimStyle(e.target.value as RimArchitectureStyle)}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
              >
                <option value="turbofan">🌀 Turbofan Aero</option>
                <option value="multi_spoke">⚙️ 10-Spoke Forged</option>
                <option value="mesh_bbs">🏁 BBS Cross-Mesh</option>
                <option value="split_5">⚡ Twin 5-Spoke</option>
                <option value="solid_disc">🛡️ Solid Aero Disc</option>
              </select>

              <select
                value={rimFinish}
                onChange={(e) => setRimFinish(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
              >
                <option value="silver">Silver</option>
                <option value="gloss_black">Gloss Black</option>
                <option value="satin_bronze">Bronze</option>
                <option value="gold">Gold</option>
                <option value="gunmetal">Gunmetal</option>
                <option value="chrome">Chrome</option>
              </select>
            </div>

            {/* Lighting, Closures, Aerodynamics, Brakes & VFX Toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Headlights Toggle */}
              <button
                onClick={() => setHeadlightsOn(!headlightsOn)}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  headlightsOn
                    ? 'bg-amber-200/60 text-amber-800 border-amber-400/60 shadow-md'
                    : 'border-amber-200/40 text-amber-700 hover:text-amber-900'
                }`}
                title="Toggle Matrix LED Headlights & Taillights"
              >
                <Zap size={12} className={headlightsOn ? 'text-amber-400' : 'text-slate-500'} />
                <span>{headlightsOn ? 'Lights: ON' : 'Lights: OFF'}</span>
              </button>

              {/* Underglow Neon Toggle */}
              <button
                onClick={() => setUnderglowOn(!underglowOn)}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  underglowOn
                    ? 'bg-amber-200/60 text-amber-800 border-amber-400/60 shadow-md'
                    : 'border-amber-200/40 text-amber-700 hover:text-amber-900'
                }`}
                title="Toggle Cyber Underbody Neon Glow"
              >
                <Sparkles size={12} className={underglowOn ? 'text-amber-400' : 'text-slate-500'} />
                <span>{underglowOn ? 'Neon: ON' : 'Neon: OFF'}</span>
              </button>

              {/* Kinetic Closures Articulation Mode */}
              <select
                value={articulationMode}
                onChange={(e) => setArticulationMode(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
              >
                <option value="closed">🔒 Panels Closed</option>
                <option value="doors_open">🚪 Doors Open</option>
                <option value="hood_open">🔧 Hood Open</option>
                <option value="all_open">✨ All Open</option>
              </select>

              {/* Thermal Glowing Brakes Toggle */}
              <button
                onClick={() => setBrakesGlowing(!brakesGlowing)}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  brakesGlowing
                    ? 'bg-amber-200/60 text-amber-800 border-amber-400/60 shadow-md'
                    : 'border-amber-200/40 text-amber-700 hover:text-amber-900'
                }`}
                title="Toggle Thermal Carbon-Ceramic Glowing Brake Rotors"
              >
                <Disc size={12} className={brakesGlowing ? 'text-amber-400 animate-pulse' : 'text-slate-500'} />
                <span>{brakesGlowing ? 'Brakes: HOT' : 'Brakes: COOL'}</span>
              </button>

              {/* Active DRS Wing Mode */}
              <select
                value={drsMode}
                onChange={(e) => setDrsMode(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
              >
                <option value="closed">🛡️ Wing: Normal</option>
                <option value="drs_open">⚡ DRS: Open</option>
                <option value="airbrake">🛑 Airbrake</option>
              </select>

              {/* 3D CFD Streamlines */}
              <button
                onClick={() => setShowCFD(!showCFD)}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  showCFD
                    ? 'bg-amber-200/60 text-amber-800 border-amber-400/60 shadow-md'
                    : 'border-amber-200/40 text-amber-700 hover:text-amber-900'
                }`}
                title="Toggle 3D Real-Time CFD Streamlines & Wingtip Vortices"
              >
                <Wind size={12} className={showCFD ? 'text-emerald-400' : 'text-slate-500'} />
                <span>{showCFD ? 'CFD: ON' : 'CFD: OFF'}</span>
              </button>

              {/* Exhaust Backfire Flame VFX */}
              <button
                onClick={() => setExhaustBackfire(!exhaustBackfire)}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  exhaustBackfire
                    ? 'bg-amber-200/60 text-amber-800 border-amber-400/60 shadow-md'
                    : 'border-amber-200/40 text-amber-700 hover:text-amber-900'
                }`}
                title="Trigger High-RPM Exhaust Backfire Flames & Embers"
              >
                <Flame size={12} className={exhaustBackfire ? 'text-orange-400 animate-pulse' : 'text-slate-500'} />
                <span>{exhaustBackfire ? 'Flames: ON' : 'Flames: OFF'}</span>
              </button>

              {/* Diagnostics */}
              <button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  showDiagnostics
                    ? 'bg-amber-200/60 text-amber-800 border-amber-400/60 shadow-md'
                    : 'border-amber-200/40 text-amber-700 hover:text-amber-900'
                }`}
                title="Toggle 3D Master Bounding Box & Wheel Center Diagnostic Gizmo"
              >
                <Ruler size={13} className={showDiagnostics ? 'text-amber-400' : 'text-slate-500'} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CANVAS RENDER STAGE (CLEAN & UNOBSTRUCTED 3D) ── */}
      <div className="relative h-[560px] w-full flex items-center justify-center bg-slate-950/60">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* ── BOTTOM HUD CAD DIMENSIONS OVERLAY ── */}
        <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-[11px] text-amber-400/70 pointer-events-none">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-amber-950/60 border border-amber-800/40 backdrop-blur-md">
            <span>Wheelbase: <strong className="text-amber-400">{wheelbaseMm}mm</strong></span>
            <span>Track F/R: <strong className="text-amber-900">{trackWidthFrontMm}/{trackWidthRearMm}mm</strong></span>
            <span>Ride Height: <strong className="text-emerald-400">{rideHeightMm}mm</strong></span>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-amber-950/60 border border-amber-800/40 backdrop-blur-md text-[10px] text-amber-400/60">
            Left Click: Orbit • Right Click: Pan • Scroll: Zoom
          </div>
        </div>
      </div>
    </div>
  );
};
