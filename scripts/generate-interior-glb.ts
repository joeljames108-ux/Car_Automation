// ============================================================================
// INTERIOR STUDIO GLB EXPORTER CLI
// ============================================================================
// Exports the interior generator suites to standalone GLB assets under
// public/models/interior/, matching the names suggested by the asset library
// README and interior studio catalog. Each export passes through the shared
// PBR enhancement pipeline.
//
// Run: npm run assets:interior
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as fs from 'fs';
import * as path from 'path';
import { enhanceGlbBuffer } from '../src/exterior3d/loaders/glbPbrEnhancer';
import { Dashboard3DGenerator } from '../src/exterior3d/generators/interior/dashboard3DGenerator';
import { SteeringWheel3DGenerator } from '../src/exterior3d/generators/interior/steeringWheel3DGenerator';
import { Seating3DGenerator } from '../src/exterior3d/generators/interior/seating3DGenerator';
import { CenterConsole3DGenerator } from '../src/exterior3d/generators/interior/centerConsole3DGenerator';
import { DoorCard3DGenerator } from '../src/exterior3d/generators/interior/doorCard3DGenerator';
import { AUDIO_SYSTEM_CATALOG } from '../src/exterior3d/manifests/interiorStudioCatalog';
import type {
  InteriorMaterialTheme,
  AudioSystemSpecification,
} from '../src/exterior3d/types/interiorStudioTypes';

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

if (typeof globalThis !== 'undefined' && typeof (globalThis as any).ImageData === 'undefined') {
  class MockImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  }
  // @ts-ignore
  globalThis.ImageData = MockImageData;
}

if (typeof globalThis !== 'undefined' && typeof (globalThis as any).document === 'undefined') {
  const dummyGradient = { addColorStop: () => {} };
  (globalThis as any).document = {
    createElement: (tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 512,
          height: 256,
          getContext: () => ({
            drawImage: () => {},
            getImageData: () => new (globalThis as any).ImageData(512, 256),
            putImageData: () => {},
            createRadialGradient: () => dummyGradient,
            createLinearGradient: () => dummyGradient,
            fillRect: () => {},
            clearRect: () => {},
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            fillText: () => {},
          }),
          toBlob: (cb: (blob: Blob) => void) => {
            if (cb) cb(new Blob([new Uint8Array(16)], { type: 'image/png' }));
          },
          toDataURL: () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        };
      }
      return {};
    },
  };
}

const SPORT_THEME: InteriorMaterialTheme = {
  primaryUpholstery: 'alcantara_suede',
  secondaryUpholstery: 'perforated_sport_leather',
  primaryColorHex: '#141821',
  secondaryColorHex: '#2a3040',
  stitchingPattern: 'double_contrast_stitch',
  stitchingColorHex: '#38bdf8',
  trimAccents: 'twill_gloss_carbon',
  seatBeltColorHex: '#0284c7',
  carpetColorHex: '#10141c',
  headlinerMaterial: 'alcantara_suede',
  headlinerColorHex: '#0c0f16',
};

const LUXURY_THEME: InteriorMaterialTheme = {
  primaryUpholstery: 'nappa_leather',
  secondaryUpholstery: 'semi_aniline_leather',
  primaryColorHex: '#2b2118',
  secondaryColorHex: '#4a3826',
  stitchingPattern: 'diamond_quilted',
  stitchingColorHex: '#d9b26a',
  trimAccents: 'open_pore_walnut',
  seatBeltColorHex: '#5b4630',
  carpetColorHex: '#241b12',
  headlinerMaterial: 'woven_fabric',
  headlinerColorHex: '#1c1710',
};

async function exportGroupToEnhancedGlb(
  group: THREE.Group,
  sceneName: string,
  outputPath: string
): Promise<number> {
  const scene = new THREE.Scene();
  scene.name = sceneName;
  scene.add(group);

  const exporter = new GLTFExporter();
  const raw = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => resolve(gltf as ArrayBuffer),
      (err) => reject(err),
      { binary: true }
    );
  });

  const enhanced = await enhanceGlbBuffer(Buffer.from(raw));
  fs.writeFileSync(outputPath, enhanced);
  return enhanced.byteLength;
}

async function main() {
  const outputDir = path.resolve('public/models/interior');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  INTERIOR STUDIO GLB EXPORT PIPELINE');
  console.log('═══════════════════════════════════════════════════════════');

  const hasDom = typeof globalThis !== 'undefined' && typeof (globalThis as any).document !== 'undefined';
  if (!hasDom) {
    console.log('  ℹ Node environment detected: dashboard exports require DOM canvas');
    console.log('    textures and will be skipped (run the same export in-browser).');
  }

  const audioSpec: AudioSystemSpecification = AUDIO_SYSTEM_CATALOG.AUDIO_PREMIUM_16 || Object.values(AUDIO_SYSTEM_CATALOG)[0];

  const jobs: Array<{ name: string; build: () => Promise<THREE.Group> }> = [
    {
      name: 'dashboard_executive.glb',
      build: async () => Dashboard3DGenerator.buildDashboard('executive_monolith', 1.52, LUXURY_THEME, '#d9b26a'),
    },
    {
      name: 'dashboard_sport.glb',
      build: async () => Dashboard3DGenerator.buildDashboard('gt3_track_cockpit', 1.48, SPORT_THEME, '#38bdf8'),
    },
    {
      name: 'dashboard_hyper_glass.glb',
      build: async () => Dashboard3DGenerator.buildDashboard('hyper_minimalist_glass', 1.50, SPORT_THEME, '#22d3ee'),
    },
    {
      name: 'steering_wheel_gt3_yoke.glb',
      build: async () => SteeringWheel3DGenerator.buildSteeringWheel('gt3_race_yoke', SPORT_THEME, 0),
    },
    {
      name: 'steering_wheel_sport.glb',
      build: async () => SteeringWheel3DGenerator.buildSteeringWheel('flat_bottom_sport', SPORT_THEME, 0),
    },
    {
      name: 'seat_carbon_race.glb',
      build: async () => Seating3DGenerator.buildSeatingAssembly('carbon_fixed_bucket', 2, 'sabelt_6_point_f1', SPORT_THEME, 2.68, 1.62),
    },
    {
      name: 'seat_sport_bucket.glb',
      build: async () => Seating3DGenerator.buildSeatingAssembly('sport_bolstered_recaro', 2, 'standard_3_point', LUXURY_THEME, 2.80, 1.64),
    },
    {
      name: 'center_console_gt3.glb',
      build: async () => CenterConsole3DGenerator.buildCenterConsole('track_carbon_stack', SPORT_THEME, 2.68, '#38bdf8'),
    },
    {
      name: 'center_console_executive.glb',
      build: async () => CenterConsole3DGenerator.buildCenterConsole('crystal_rotary_dial', LUXURY_THEME, 3.00, '#d9b26a'),
    },
    {
      name: 'door_cards_sport.glb',
      build: async () => DoorCard3DGenerator.buildDoorCardAssemblies(SPORT_THEME, audioSpec, 2.68, 1.62, '#38bdf8'),
    },
  ];

  let okCount = 0;
  for (const job of jobs) {
    try {
      const group = await job.build();
      group.name = group.name || job.name.replace(/\.glb$/, '');
      const bytes = await exportGroupToEnhancedGlb(group, job.name.replace(/\.glb$/, '_Scene'), path.join(outputDir, job.name));
      console.log(`  ✓ ${job.name} — ${(bytes / 1024).toFixed(1)} KB`);
      okCount++;
    } catch (err) {
      console.error(`  ✗ ${job.name}:`, err);
    }
  }

  const attempted = jobs.length;
  console.log('───────────────────────────────────────────────────────────');
  console.log(`Interior export complete: ${okCount}/${attempted} assets written.`);
  if (okCount !== attempted) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal interior export error:', err);
  process.exit(1);
});
