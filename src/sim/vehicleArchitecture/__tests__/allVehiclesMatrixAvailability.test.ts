import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  VEHICLE_ARCHITECTURE_MATRIX,
  VEHICLE_ARCHITECTURE_DEFINITIONS,
  VEHICLE_ERAS,
  getAllArchitectures,
  getAllEras,
} from '../vehicleArchitectureMatrix';
import { isBodyGlbAvailable, getCell } from '../../bodyArchitectureMatrix';
import { CANONICAL_ARCHITECTURE_IDS, CANONICAL_ERA_IDS } from '../architectureIdCompat';

describe('All 168 Vehicle Matrix Models On-Disk & System Verification', () => {
  const ROOT_DIR = path.resolve(__dirname, '../../../../');
  const PUBLIC_MODELS_DIR = path.join(ROOT_DIR, 'public', 'models', 'vehicles');

  it('verifies 24 architectures and 7 eras cardinality', () => {
    expect(CANONICAL_ARCHITECTURE_IDS.length).toBe(24);
    expect(CANONICAL_ERA_IDS.length).toBe(7);
    expect(getAllArchitectures().length).toBe(24);
    expect(getAllEras().length).toBe(7);
  });

  it('verifies all 168 GLB files exist on disk with valid headers and non-zero size', () => {
    let verifiedGlbs = 0;

    for (const archId of CANONICAL_ARCHITECTURE_IDS) {
      for (const eraId of CANONICAL_ERA_IDS) {
        // Handle path mapping
        const folderArch = archId === 'pickup_truck' ? 'pickup' : (archId === 'race_formula' ? 'formula' : (archId === 'gt3_racing' ? 'gt3' : archId));
        const glbDiskPath = path.join(PUBLIC_MODELS_DIR, folderArch, eraId, 'vehicle.glb');

        expect(fs.existsSync(glbDiskPath), `GLB for [${archId}][${eraId}] exists at ${glbDiskPath}`).toBe(true);

        const stats = fs.statSync(glbDiskPath);
        expect(stats.size).toBeGreaterThan(500); // Non-trivial GLB

        // Verify glTF binary magic header (0x46546C67 = "glTF")
        const fd = fs.openSync(glbDiskPath, 'r');
        const buffer = Buffer.alloc(4);
        fs.readSync(fd, buffer, 0, 4, 0);
        fs.closeSync(fd);
        expect(buffer.toString('utf-8')).toBe('glTF');

        verifiedGlbs++;
      }
    }

    expect(verifiedGlbs).toBe(168);
  });

  it('verifies matrix metadata and isGlbAvailable flag for all 168 cells', () => {
    for (const archId of CANONICAL_ARCHITECTURE_IDS) {
      for (const eraId of CANONICAL_ERA_IDS) {
        const entry = VEHICLE_ARCHITECTURE_MATRIX[archId][eraId];
        expect(entry).toBeDefined();
        expect(entry.isGlbAvailable).toBe(true);
        expect(entry.bodyOnly).toBe(true);
        expect(entry.referenceVehicle.length).toBeGreaterThan(0);
        expect(entry.designDna.silhouette.length).toBeGreaterThan(0);
      }
    }
  });

  it('verifies runtime bodyArchitectureMatrix availability check', () => {
    for (const archId of CANONICAL_ARCHITECTURE_IDS) {
      for (const eraId of CANONICAL_ERA_IDS) {
        const folderArch = archId === 'pickup_truck' ? 'pickup' : (archId === 'race_formula' ? 'formula' : (archId === 'gt3_racing' ? 'gt3' : archId));
        expect(isBodyGlbAvailable(folderArch, eraId)).toBe(true);
      }
    }
  });
});
