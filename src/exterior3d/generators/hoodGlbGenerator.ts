// ============================================================================
// PHASE 25 — HIGH-FIDELITY SCULPTED HOOD GLB GENERATOR & EXPORTER
// ============================================================================
// Generates a complete, production-grade .glb binary model for the sculpted
// clamshell hood with S-duct extractors, carbon underside, gas struts, hinges,
// AeroCatch latches, and full articulation support.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { SculptedBodyPanelsGenerator, BodyClosuresArticulation } from './sculptedBodyPanelsGenerator';
import type { VehicleBodyType } from '../types/vehicleConstructionTypes';
import { MaterialGrade } from '../../sim/assemblyTypes';
import { enhanceGlbBuffer } from '../loaders/glbPbrEnhancer';

// Polyfill Node.js FileReader for Three.js GLTFExporter binary writer in CLI
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).FileReader === 'undefined') {
  class NodeFileReader {
    result: ArrayBuffer | null = null;
    onloadend: (() => void) | null = null;
    async readAsArrayBuffer(blob: Blob) {
      this.result = await blob.arrayBuffer();
      if (this.onloadend) this.onloadend();
    }
  }
  // @ts-ignore
  globalThis.FileReader = NodeFileReader;
}

export interface HoodGlbExportOptions {
  vehicleName: string;
  bodyType: VehicleBodyType;
  wheelbaseMm: number;
  trackWidthMm: number;
  paintColorHex: number;
  materialGrade: MaterialGrade;
  hoodOpenProgress: number; // 0 = closed, 1 = fully open
  author?: string;
  dracoCompression?: boolean;
  maxTextureSize?: number;
}

export interface HoodGlbExportResult {
  filename: string;
  byteLength: number;
  buffer: ArrayBuffer;
}

/**
 * Generates a high-fidelity sculpted hood as a standalone GLB asset
 * with all mechanical and aerodynamic details for the given vehicle configuration.
 */
export async function generateSculptedHoodGlbBuffer(
  options: HoodGlbExportOptions
): Promise<ArrayBuffer> {
  const {
    vehicleName,
    bodyType,
    wheelbaseMm,
    trackWidthMm,
    paintColorHex,
    materialGrade,
    hoodOpenProgress,
    author = 'Antigravity Automotive CAD Engine',
    dracoCompression = false,
    maxTextureSize = 2048,
  } = options;

  // Build the articulation state for the hood
  const articulation: BodyClosuresArticulation = {
    hoodOpenProgress: Math.max(0, Math.min(1, hoodOpenProgress)),
    doorOpenProgress: 0,
    rearHatchOpenProgress: 0,
  };

  // Generate the full sculpted body panels (includes the hood)
  const bodyGroup = SculptedBodyPanelsGenerator.buildSculptedBody(
    bodyType,
    wheelbaseMm,
    trackWidthMm,
    materialGrade,
    false, // isXRay
    paintColorHex,
    articulation,
    undefined, // paintConfig
    undefined // trackWidthFrontMm
  );

  // Extract just the hood from the body group
  const hoodGroup = extractHoodFromBody(bodyGroup, options);

  // Create a clean scene with just the hood for export
  const exportScene = new THREE.Scene();
  exportScene.name = `${vehicleName}_Sculpted_Hood`;

  // Add the hood group
  exportScene.add(hoodGroup);

  // Attach custom glTF extension metadata
  hoodGroup.userData = {
    ...hoodGroup.userData,
    APEX_hood_metadata: {
      vehicleName,
      bodyType,
      wheelbaseMm,
      trackWidthMm,
      paintColorHex: `#${paintColorHex.toString(16).padStart(6, '0')}`,
      materialGrade,
      hoodOpenProgress,
      exportedAt: new Date().toISOString(),
      generator: 'Antigravity Modular glTF Assembly System v2.0 - Hood Export',
      features: [
        'G2_curvature_stamped_skin',
        'power_dome',
        'spine_ridge',
        'muscle_crests',
        'dual_S_duct_extractors',
        'turning_vanes',
        'carbon_underside_stiffener',
        'X_brace_skeleton',
        'AeroCatch_latches',
        'billet_hinges',
        'hydraulic_gas_struts',
        'cowl_panel',
        'washer_jets',
        'articulated_forward_pivot',
      ],
      hoodDimensions: {
        lengthMm: 760,
        widthMm: 1240,
        cowlHeightMm: 680,
        leadingEdgeHeightMm: 535,
        powerDomeHeightMm: 45,
        pivotLocation: 'forward_cowl',
        articulationRangeDeg: 50,
      },
    },
  };

  // Export to GLB
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();

    exporter.parse(
      exportScene,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          resolve(gltf);
        } else {
          const jsonStr = JSON.stringify(gltf, null, 2);
          const encoder = new TextEncoder();
          const buffer = encoder.encode(jsonStr).buffer;
          resolve(buffer);
        }
      },
      (error) => {
        reject(new Error(`Failed to export Hood GLB: ${error.message || String(error)}`));
      },
      {
        binary: true,
        maxTextureSize,
        includeCustomExtensions: true,
        // Note: dracoCompression requires additional setup with DRACOLoader
      }
    );
  });
}

/**
 * Extracts or builds the hood component group for GLB export
 */
function extractHoodFromBody(bodyGroup: THREE.Group, options?: HoodGlbExportOptions): THREE.Group {
  const hoodGroup = new THREE.Group();
  hoodGroup.name = 'Hood_Panel_Assembly';

  bodyGroup.traverse((child) => {
    // Find the Block04_ProductionSculptedHood group
    if (child.name === 'Block04_ProductionSculptedHood') {
      // Clone the entire hood assembly including pivot, struts, cowl
      hoodGroup.add(child.clone(true));
    }
  });

  // If not found by block name, traverse for hood meshes
  if (hoodGroup.children.length === 0) {
    bodyGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh || child instanceof THREE.Group) {
        if (child.name && (
          child.name.includes('Hood') ||
          child.name.includes('hood') ||
          child.name.includes('S_Duct')
        )) {
          hoodGroup.add(child.clone(true));
        }
      }
    });
  }

  // Fallback: If still empty, construct Block04 Sculpted Hood directly
  if (hoodGroup.children.length === 0 && options) {
    const frontAxleX = (options.wheelbaseMm / 1000) * 0.16; // ~0.45m
    const frontNoseX = frontAxleX + 0.88;
    const halfTfM = (options.trackWidthMm / 1000) / 2;

    const paintMat = new THREE.MeshStandardMaterial({
      name: 'Body_Paint_Primary',
      color: options.paintColorHex,
      metalness: 0.85,
      roughness: 0.15,
    });
    const carbonMat = new THREE.MeshStandardMaterial({
      name: 'Autoclaved_2x2_Twill_Dry_Carbon',
      color: 0x1e293b,
      metalness: 0.35,
      roughness: 0.38,
    });
    const gasketMat = new THREE.MeshStandardMaterial({
      name: 'EPDM_Rubber_Gasket',
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.05,
    });
    const strutMat = new THREE.MeshStandardMaterial({
      name: 'Billet_Titanium_Anodized',
      color: 0x94a3b8,
      metalness: 0.90,
      roughness: 0.20,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      name: 'Gloss_Black_Aero_Trim',
      color: 0x020617,
      metalness: 0.60,
      roughness: 0.10,
    });
    const meshMat = new THREE.MeshStandardMaterial({
      name: 'Hexagonal_Grille_Mesh',
      color: 0x090d16,
      metalness: 0.70,
      roughness: 0.40,
    });

    const directHood = SculptedBodyPanelsGenerator.buildBlock04SculptedHoodAndSDuct(
      frontAxleX,
      frontNoseX,
      halfTfM,
      paintMat,
      carbonMat,
      gasketMat,
      strutMat,
      trimMat,
      meshMat,
      { hoodOpenProgress: options.hoodOpenProgress }
    );

    hoodGroup.add(directHood);
  }

  // Ensure proper positioning at origin for standalone GLB export
  const bbox = new THREE.Box3().setFromObject(hoodGroup);
  if (!bbox.isEmpty()) {
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    hoodGroup.position.sub(center);
    hoodGroup.position.y -= bbox.min.y;
  }

  return hoodGroup;
}

/**
 * Triggers a browser download of the exported hood GLB
 */
export function triggerHoodGlbDownload(
  exportResult: HoodGlbExportResult
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const blob = new Blob([exportResult.buffer], {
    type: 'model/gltf-binary',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportResult.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convenience function to generate and download hood GLB in one call
 */
export async function generateAndDownloadHoodGlb(
  options: HoodGlbExportOptions
): Promise<void> {
  const buffer = await generateSculptedHoodGlbBuffer(options);
  const result: HoodGlbExportResult = {
    filename: `${options.vehicleName.toLowerCase().replace(/\s+/g, '_')}_sculpted_hood.glb`,
    byteLength: buffer.byteLength,
    buffer,
  };
  triggerHoodGlbDownload(result);
}

/**
 * Generate hood GLB for specific vehicle presets
 */
export const HoodGlbPresets = {
  supercar: {
    vehicleName: 'BMW_i8_Supercar',
    bodyType: 'supercar' as VehicleBodyType,
    wheelbaseMm: 2800,
    trackWidthMm: 1620,
    paintColorHex: 0xb45309,
    materialGrade: 'forged' as MaterialGrade,
  },
  gt3: {
    vehicleName: 'Ford_Escort_RS_Cosworth_GT3',
    bodyType: 'sports_car' as VehicleBodyType,
    wheelbaseMm: 2551,
    trackWidthMm: 1580,
    paintColorHex: 0xdc2626,
    materialGrade: 'forged' as MaterialGrade,
  },
  hatchback: {
    vehicleName: 'Ford_Escort_RS_Cosworth',
    bodyType: 'hatchback' as VehicleBodyType,
    wheelbaseMm: 2551,
    trackWidthMm: 1580,
    paintColorHex: 0x059669,
    materialGrade: 'billet' as MaterialGrade,
  },
};

/**
 * Generate all preset hood GLBs and save to public/models/exterior/
 * Run this in a Node.js environment (not browser)
 */
export async function exportAllHoodGlbPresets(
  outputDir: string = 'public/models/exterior'
): Promise<{ preset: string; filename: string; bytes: number }[]> {
  const fs = await import('fs');
  const path = await import('path');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = [];

  for (const [presetName, preset] of Object.entries(HoodGlbPresets)) {
    console.log(`[Hood GLB Export] Generating ${presetName}...`);

    // Export closed hood
    const rawClosedBuffer = await generateSculptedHoodGlbBuffer({
      ...preset,
      hoodOpenProgress: 0,
    });
    const closedBuffer = await enhanceGlbBuffer(Buffer.from(rawClosedBuffer));
    const closedFilename = `${preset.vehicleName.toLowerCase().replace(/\s+/g, '_')}_hood_closed.glb`;
    const closedPath = path.join(outputDir, closedFilename);
    fs.writeFileSync(closedPath, Buffer.from(closedBuffer));
    results.push({ preset: `${presetName}_closed`, filename: closedFilename, bytes: closedBuffer.byteLength });

    // Export open hood (45 degrees)
    const rawOpenBuffer = await generateSculptedHoodGlbBuffer({
      ...preset,
      hoodOpenProgress: 1,
    });
    const openBuffer = await enhanceGlbBuffer(Buffer.from(rawOpenBuffer));
    const openFilename = `${preset.vehicleName.toLowerCase().replace(/\s+/g, '_')}_hood_open.glb`;
    const openPath = path.join(outputDir, openFilename);
    fs.writeFileSync(openPath, Buffer.from(openBuffer));
    results.push({ preset: `${presetName}_open`, filename: openFilename, bytes: openBuffer.byteLength });

    // Save standard hood.glb and hood_panel.glb reference files
    if (presetName === 'supercar') {
      const defaultHoodPath = path.join(outputDir, 'hood.glb');
      fs.writeFileSync(defaultHoodPath, Buffer.from(closedBuffer));
      results.push({ preset: 'default_hood', filename: 'hood.glb', bytes: closedBuffer.byteLength });

      const hoodPanelPath = path.join(outputDir, 'hood_panel.glb');
      fs.writeFileSync(hoodPanelPath, Buffer.from(closedBuffer));
      results.push({ preset: 'default_hood_panel', filename: 'hood_panel.glb', bytes: closedBuffer.byteLength });
    }

    console.log(`  ✓ ${closedFilename} (${(closedBuffer.byteLength / 1024).toFixed(1)} KB)`);
    console.log(`  ✓ ${openFilename} (${(openBuffer.byteLength / 1024).toFixed(1)} KB)`);
  }

  return results;
}