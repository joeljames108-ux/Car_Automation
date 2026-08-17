// ============================================================================
// MODULAR GLB GENERATOR — MASTER COMPONENT EXPORT PIPELINE
// ============================================================================
// Orchestrates generation of all independent 60° V12 modular component GLB
// files, saves them into public/models/engines/v12/, generates a manifest index,
// and outputs a comprehensive manufacturing and asset report.
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { generateEngineBlockGlbBuffer } from './engineBlockGenerator';
import { generateCrankshaftGlbBuffer } from './crankshaftGenerator';
import { generatePistonGlbBuffer } from './pistonGenerator';
import { generateConnectingRodGlbBuffer } from './connectingRodGenerator';
import { generateCylinderHeadGlbBuffer } from './cylinderHeadGenerator';
import { generateValveCoverGlbBuffer } from './valveCoverGenerator';
import { generateIntakeManifoldGlbBuffer } from './intakeManifoldGenerator';
import { generateExhaustHeaderGlbBuffer } from './exhaustHeaderGenerator';
import { generateTurbochargerGlbBuffer } from './turbochargerGenerator';
import { generateDrySumpGlbBuffer } from './drySumpGenerator';
import { generateRadiatorGlbBuffer } from './radiatorGenerator';
import { generateTransaxleGlbBuffer } from './transaxleGenerator';
import { generateEngineCoverGlbBuffer } from './engineCoverGenerator';
import { V12_COMPONENT_MANIFESTS } from '../manifests/v12Manifest';

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

export interface ExportedAssetDetail {
  id: string;
  filename: string;
  filepath: string;
  byteSize: number;
  kilobytes: number;
}

export interface MasterExportSummary {
  timestamp: number;
  engineType: string;
  totalAssetsGenerated: number;
  totalBytes: number;
  totalKilobytes: number;
  assets: ExportedAssetDetail[];
}

/**
 * Runs the full export pipeline, generating individual .glb files for every
 * modular component in the V12 engine catalog.
 */
export async function exportAllModularV12GlbFiles(): Promise<MasterExportSummary> {
  console.log('=================================================================');
  console.log('  60° V12 RACING ENGINE — MODULAR GLB MASTER EXPORT PIPELINE     ');
  console.log('=================================================================');

  const outputDir = path.resolve('public/models/engines/v12');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const exportJobs: { id: string; filename: string; generator: () => Promise<ArrayBuffer> }[] = [
    { id: 'engine-block', filename: 'engine-block.glb', generator: generateEngineBlockGlbBuffer },
    { id: 'crankshaft', filename: 'crankshaft.glb', generator: generateCrankshaftGlbBuffer },
    { id: 'piston', filename: 'piston.glb', generator: generatePistonGlbBuffer },
    { id: 'connecting-rod', filename: 'connecting-rod.glb', generator: generateConnectingRodGlbBuffer },
    { id: 'cylinder-head-left', filename: 'cylinder-head-left.glb', generator: () => generateCylinderHeadGlbBuffer('left') },
    { id: 'cylinder-head-right', filename: 'cylinder-head-right.glb', generator: () => generateCylinderHeadGlbBuffer('right') },
    { id: 'valve-cover-left', filename: 'valve-cover-left.glb', generator: () => generateValveCoverGlbBuffer('left') },
    { id: 'valve-cover-right', filename: 'valve-cover-right.glb', generator: () => generateValveCoverGlbBuffer('right') },
    { id: 'intake-manifold-left', filename: 'intake-manifold-left.glb', generator: () => generateIntakeManifoldGlbBuffer('left') },
    { id: 'intake-manifold-right', filename: 'intake-manifold-right.glb', generator: () => generateIntakeManifoldGlbBuffer('right') },
    { id: 'exhaust-header-left', filename: 'exhaust-header-left.glb', generator: () => generateExhaustHeaderGlbBuffer('left') },
    { id: 'exhaust-header-right', filename: 'exhaust-header-right.glb', generator: () => generateExhaustHeaderGlbBuffer('right') },
    { id: 'turbocharger', filename: 'turbocharger.glb', generator: generateTurbochargerGlbBuffer },
    { id: 'dry-sump', filename: 'dry-sump.glb', generator: generateDrySumpGlbBuffer },
    { id: 'radiator', filename: 'radiator.glb', generator: generateRadiatorGlbBuffer },
    { id: 'transaxle', filename: 'transaxle.glb', generator: generateTransaxleGlbBuffer },
    { id: 'engine-cover', filename: 'engine-cover.glb', generator: generateEngineCoverGlbBuffer },
  ];

  const results: ExportedAssetDetail[] = [];
  let totalBytes = 0;

  for (let i = 0; i < exportJobs.length; i++) {
    const job = exportJobs[i];
    process.stdout.write(`[${(i + 1).toString().padStart(2, '0')}/${exportJobs.length}] Exporting ${job.filename.padEnd(26, ' ')} ... `);

    try {
      const buffer = await job.generator();
      const nodeBuffer = Buffer.from(buffer);
      const filePath = path.join(outputDir, job.filename);
      fs.writeFileSync(filePath, nodeBuffer);

      const byteSize = nodeBuffer.byteLength;
      totalBytes += byteSize;
      const kb = Number((byteSize / 1024).toFixed(1));

      results.push({
        id: job.id,
        filename: job.filename,
        filepath: filePath,
        byteSize,
        kilobytes: kb,
      });

      console.log(`✅ (${kb} KB)`);
    } catch (err) {
      console.log(`❌ ERROR:`, err);
    }
  }

  // Generate manifest.json index in output directory
  const manifestPath = path.join(outputDir, 'manifest.json');
  const manifestData = {
    engineType: 'v12',
    generatedAt: Date.now(),
    components: V12_COMPONENT_MANIFESTS,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), 'utf-8');
  console.log(`\n📄 Generated Manifest Index: ${manifestPath}`);

  const summary: MasterExportSummary = {
    timestamp: Date.now(),
    engineType: 'v12',
    totalAssetsGenerated: results.length,
    totalBytes,
    totalKilobytes: Number((totalBytes / 1024).toFixed(1)),
    assets: results,
  };

  console.log('-----------------------------------------------------------------');
  console.log(`🎉 Pipeline Complete: ${results.length} GLBs written (${summary.totalKilobytes} KB Total)`);
  console.log('=================================================================\n');

  return summary;
}

// Auto-run if executed directly via CLI
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('masterExporter')) {
  exportAllModularV12GlbFiles()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal export pipeline error:', err);
      process.exit(1);
    });
}
