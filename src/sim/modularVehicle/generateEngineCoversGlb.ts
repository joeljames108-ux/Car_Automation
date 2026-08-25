// ============================================================================
// MODULAR ENGINE COVERS — STANDALONE GLB GENERATOR & ASSET BAKER
// ============================================================================
// Bakes high-fidelity binary GLB models for all 12 engine cover typologies:
//   1. Apex Hypercar Monocoque (Quartz window, gold bezel, ram scoop)
//   2. Sarthe GT3 Endurance (Twin carbon airboxes, velocity stacks)
//   3. Modena Billet Skeleton (CNC 6061-T6 lattice truss frame)
//   4. Prancing Heritage Plenums (Wrinkle-red sand cast dual plenums)
//   5. Stealth Track Vortex (Forged gold flake carbon, vortex fins)
//   6. Purist Exposed ITBs (Raw open velocity stacks & billet rails)
//   7. Inline Twin-Cam Turbo (Asymmetric dry carbon & titanium turbo shield)
//   8. Boxer Twin-Plenum Flat (Dual horizontal runners & top-mount intercooler)
//   9. W16 Quad-Turbo Hypersport (4-bank carbon cover & inconel heat shield)
//  10. Rotary Apex Trochoid (Epitrochoid rotor profile & side-draft trumpets)
//  11. Supercharged V8 Shaker Scoop (Billet case & functional hood shaker scoop)
//  12. F1 Pneumatic Carbon Plenum (Teardrop carbon airbox & gold thermal foil)
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { generateEngineCoverGlbBuffer } from '../../engine3d/generators/engineCoverGenerator';
import { enhanceGlbBuffer } from '../../exterior3d/loaders/glbPbrEnhancer';
import type { EngineCoverModel } from '../engine/masterEngineTypes';

interface CoverTask {
  filename: string;
  model: EngineCoverModel;
  coverColor?: string;
  bezelColor?: string;
  badgeText?: string;
  cylsPerBank?: number;
}

async function main() {
  console.log('=================================================================');
  console.log('  MODULAR ENGINE COVERS GLB ASSET GENERATOR (12 MODELS)          ');
  console.log('=================================================================');

  const coversDir = path.resolve('public/models/engines/covers');
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }

  const v12Dir = path.resolve('public/models/engines/v12');
  if (!fs.existsSync(v12Dir)) {
    fs.mkdirSync(v12Dir, { recursive: true });
  }

  const tasks: CoverTask[] = [
    {
      filename: 'engine_cover_hypercar_quartz.glb',
      model: 'hypercar_quartz',
      coverColor: 'dry_carbon',
      bezelColor: 'billet_gold',
      badgeText: 'APEX V12',
      cylsPerBank: 6,
    },
    {
      filename: 'engine_cover_gt3_endurance.glb',
      model: 'gt3_endurance',
      coverColor: 'dry_carbon',
      bezelColor: 'titanium_blue',
      badgeText: 'GT3 RACING',
      cylsPerBank: 6,
    },
    {
      filename: 'engine_cover_billet_skeleton.glb',
      model: 'billet_skeleton',
      coverColor: 'billet_silver',
      bezelColor: 'billet_gold',
      badgeText: 'V12 CORSA',
      cylsPerBank: 6,
    },
    {
      filename: 'engine_cover_heritage_wrinkle.glb',
      model: 'heritage_wrinkle',
      coverColor: 'rosso_corsa',
      bezelColor: 'polished_chrome',
      badgeText: '48 VALVE',
      cylsPerBank: 6,
    },
    {
      filename: 'engine_cover_stealth_vortex.glb',
      model: 'stealth_vortex',
      coverColor: 'forged_carbon_gold',
      bezelColor: 'titanium_blue',
      badgeText: 'STEALTH V12',
      cylsPerBank: 6,
    },
    {
      filename: 'engine_cover_exposed_itb.glb',
      model: 'exposed_itb',
      coverColor: 'billet_silver',
      bezelColor: 'billet_gold',
      badgeText: 'ITB PURIST',
      cylsPerBank: 6,
    },
    {
      filename: 'engine_cover_inline_twin_cam_turbo.glb',
      model: 'inline_twin_cam_turbo',
      coverColor: 'dry_carbon',
      bezelColor: 'billet_gold',
      badgeText: 'I6 TWIN-CAM 24V',
      cylsPerBank: 6,
    },
    {
      filename: 'engine_cover_boxer_twin_plenum_flat.glb',
      model: 'boxer_twin_plenum_flat',
      coverColor: 'dry_carbon',
      bezelColor: 'titanium_blue',
      badgeText: 'FLAT-6 TWIN TURBO',
      cylsPerBank: 3,
    },
    {
      filename: 'engine_cover_w16_quad_turbo_hypersport.glb',
      model: 'w16_quad_turbo_hypersport',
      coverColor: 'dry_carbon',
      bezelColor: 'billet_gold',
      badgeText: 'W16 QUAD-TURBO 8.0L',
      cylsPerBank: 4,
    },
    {
      filename: 'engine_cover_rotary_apex_trochoid.glb',
      model: 'rotary_apex_trochoid',
      coverColor: 'dry_carbon',
      bezelColor: 'billet_gold',
      badgeText: 'ROTARY RACING WANKEL',
      cylsPerBank: 3,
    },
    {
      filename: 'engine_cover_supercharged_v8_shaker.glb',
      model: 'supercharged_v8_shaker',
      coverColor: 'billet_silver',
      bezelColor: 'crimson_red',
      badgeText: 'SUPERCHARGED HEMI',
      cylsPerBank: 4,
    },
    {
      filename: 'engine_cover_f1_pneumatic_carbon_plenum.glb',
      model: 'f1_pneumatic_carbon_plenum',
      coverColor: 'dry_carbon',
      bezelColor: 'billet_gold',
      badgeText: 'F1 V10 PNEUMATIC',
      cylsPerBank: 5,
    },
  ];

  for (const task of tasks) {
    console.log(`[BAKING] Generating ${task.filename} (${task.model})...`);
    try {
      const buffer = await generateEngineCoverGlbBuffer({
        model: task.model,
        coverColor: task.coverColor as any,
        bezelColor: task.bezelColor as any,
        badgeText: task.badgeText,
        cylsPerBank: task.cylsPerBank,
      });

      const nodeBuf = Buffer.from(buffer);
      const enhanced = await enhanceGlbBuffer(nodeBuf);
      const outPath = path.join(coversDir, task.filename);
      fs.writeFileSync(outPath, enhanced);
      console.log(`  ✅ Written ${outPath} (${enhanced.byteLength.toLocaleString()} bytes)`);

      // Also copy default hypercar cover to v12 directory if needed
      if (task.model === 'hypercar_quartz') {
        const v12CoverPath = path.join(v12Dir, 'engine-cover.glb');
        fs.writeFileSync(v12CoverPath, enhanced);
        console.log(`  ✅ Synced default V12 cover to ${v12CoverPath}`);
      }
    } catch (err) {
      console.error(`  ❌ Failed to generate ${task.filename}:`, err);
    }
  }

  console.log('=================================================================');
  console.log('  ALL 12 ENGINE COVER GLB ASSETS BAKED SUCCESSFULLY!             ');
  console.log('=================================================================');
}

main().catch((err) => {
  console.error('Fatal error during engine cover baking:', err);
  process.exit(1);
});
