// ============================================================================
// ASSET MANIFEST INTEGRITY REGRESSION TEST
// ============================================================================
// Guards against dangling asset references: every assetPath declared by the
// Car3D GLB registry and the V12 modular component manifest must exist on
// disk under public/, exceed 1 KB (not an empty stub), and carry the valid
// glTF binary magic header. Adding a new generated family is one entry in
// REQUIRED_GENERATED_FAMILIES.
// ============================================================================

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { Car3DGlbAssetRegistry } from '../geometry/car3dGlbAssetRegistry.ts';
import { V12_COMPONENT_MANIFESTS } from '../../engine3d/manifests/v12Manifest.ts';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

const REQUIRED_GENERATED_FAMILIES: Record<string, string[]> = {
  'rear assembly': [
    'models/exterior/rear_car_assembly.glb',
    'models/exterior/rear_bumper.glb',
    'models/exterior/rear_diffuser.glb',
    'models/exterior/rear_wing.glb',
    'models/exterior/taillights.glb',
  ],
  'hoods': [
    'models/exterior/bmw_i8_supercar_hood_closed.glb',
    'models/exterior/bmw_i8_supercar_hood_open.glb',
    'models/exterior/ford_escort_rs_cosworth_hood_closed.glb',
    'models/exterior/ford_escort_rs_cosworth_hood_open.glb',
    'models/exterior/ford_escort_rs_cosworth_gt3_hood_closed.glb',
    'models/exterior/ford_escort_rs_cosworth_gt3_hood_open.glb',
    'models/exterior/hood.glb',
    'models/exterior/hood_panel.glb',
  ],
  'chassis frames': [
    'models/chassis/sports_car_chassis_01.glb',
    'models/chassis/hatchback_chassis_01.glb',
  ],
  'interior studio': [
    'models/interior/steering_wheel_gt3_yoke.glb',
    'models/interior/steering_wheel_sport.glb',
    'models/interior/seat_carbon_race.glb',
    'models/interior/seat_sport_bucket.glb',
    'models/interior/center_console_gt3.glb',
    'models/interior/center_console_executive.glb',
    'models/interior/door_cards_sport.glb',
  ],
  'master engine': ['models/v12_racing_engine.glb'],
};

function resolvePublicModel(assetPath: string): string {
  return path.join(PUBLIC_DIR, assetPath.replace(/^\//, ''));
}

function expectValidGlb(assetPath: string) {
  const abs = resolvePublicModel(assetPath);
  expect(fs.existsSync(abs), `Missing asset file: ${abs}`).toBe(true);

  const stats = fs.statSync(abs);
  expect(stats.size, `Asset stub too small (<1KB): ${assetPath}`).toBeGreaterThan(1024);

  const fd = fs.openSync(abs, 'r');
  try {
    const header = Buffer.alloc(4);
    fs.readSync(fd, header, 0, 4, 0);
    expect(header.equals(Buffer.from('glTF')), `Invalid GLB magic header: ${assetPath}`).toBe(true);
  } finally {
    fs.closeSync(fd);
  }
}

describe('AssetManifestIntegrity', () => {
  it('every Car3DGlbAssetRegistry assetPath resolves to a valid GLB', () => {
    const assets = Car3DGlbAssetRegistry.getAllAssets();
    expect(assets.length).toBeGreaterThan(0);

    for (const asset of assets) {
      if (!asset.assetPath.endsWith('.glb')) continue;
      expectValidGlb(asset.assetPath);
    }
  });

  it('every V12 modular component assetPath resolves to a valid GLB', () => {
    expect(V12_COMPONENT_MANIFESTS.length).toBeGreaterThan(0);

    for (const component of V12_COMPONENT_MANIFESTS) {
      expectValidGlb(component.assetPath);
    }
  });

  it('all required generated family files exist as valid GLBs', () => {
    for (const files of Object.values(REQUIRED_GENERATED_FAMILIES)) {
      for (const file of files) {
        expectValidGlb(file);
      }
    }
  });

  it('engine parts directory contains exactly the exported components', () => {
    const dir = path.join(PUBLIC_DIR, 'models', 'engines', 'v12');
    const glbs = fs.readdirSync(dir).filter((f) => f.endsWith('.glb')).sort();
    expect(glbs.length).toBe(V12_COMPONENT_MANIFESTS.length);
    expect(glbs.length).toBeGreaterThanOrEqual(18);
    expect(glbs).toContain('timing-chain.glb');
  });
});
