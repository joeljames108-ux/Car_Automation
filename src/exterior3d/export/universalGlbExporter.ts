// ============================================================================
// PHASE 24 — UNIVERSAL 3D glTF / GLB ASSEMBLY EXPORTER & BINARY SERIALIZER
// ============================================================================
// Exports live Three.js modular vehicle assembly hierarchies into valid
// glTF 2.0 JSON and binary GLB files with PBR materials, sockets, and metadata.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export interface GlbExportOptions {
  binary: boolean; // true for .glb, false for .gltf
  includeCustomMetadata: boolean;
  embedTextures: boolean;
  maxTextureSize: number;
  dracoCompression: boolean;
  vehicleName: string;
  author: string;
}

export interface ExportedGlbResult {
  filename: string;
  byteLength: number;
  buffer: ArrayBuffer;
  jsonMetadata?: Record<string, unknown>;
}

export class UniversalGlbExporter {
  /**
   * Asynchronously exports a Three.js vehicle assembly hierarchy into a binary GLB buffer.
   */
  public static async exportVehicleToGlb(
    rootGroup: THREE.Object3D,
    options?: Partial<GlbExportOptions>
  ): Promise<ExportedGlbResult> {
    if (typeof (globalThis as any).FileReader === 'undefined') {
      (globalThis as any).FileReader = class {
        onload: ((e: any) => void) | null = null;
        onerror: ((e: any) => void) | null = null;
        result: any = null;
        async readAsArrayBuffer(blob: any) {
          try {
            const buf = typeof blob.arrayBuffer === 'function' ? await blob.arrayBuffer() : new ArrayBuffer(0);
            this.result = buf;
            if (this.onload) this.onload({ target: this });
          } catch (err) {
            if (this.onerror) this.onerror(err);
          }
        }
        async readAsDataURL(blob: any) {
          try {
            const buf = typeof blob.arrayBuffer === 'function' ? await blob.arrayBuffer() : new ArrayBuffer(0);
            const base64 = typeof Buffer !== 'undefined' ? Buffer.from(buf).toString('base64') : '';
            this.result = `data:${blob.type || 'application/octet-stream'};base64,${base64}`;
            if (this.onload) this.onload({ target: this });
          } catch (err) {
            if (this.onerror) this.onerror(err);
          }
        }
      };
    }

    const opts: GlbExportOptions = {
      binary: true,
      includeCustomMetadata: true,
      embedTextures: true,
      maxTextureSize: 2048,
      dracoCompression: false,
      vehicleName: 'Modular_Vehicle_Assembly',
      author: 'Antigravity Automotive CAD Engine',
      ...options,
    };

    return new Promise((resolve, reject) => {
      // 1. Attach custom glTF extension metadata to scene userdata
      if (opts.includeCustomMetadata) {
        rootGroup.userData = {
          ...rootGroup.userData,
          APEX_vehicle_metadata: {
            vehicleName: opts.vehicleName,
            author: opts.author,
            exportedAt: new Date().toISOString(),
            generator: 'Antigravity Modular glTF Assembly System v2.0',
            chassisStandard: 'ISO_1101_AUTOMOTIVE_HOMOLOGATED',
          },
        };
      }

      // 2. Instantiate Three.js GLTFExporter
      const exporter = new GLTFExporter();

      exporter.parse(
        rootGroup,
        (gltf) => {
          if (gltf instanceof ArrayBuffer) {
            resolve({
              filename: `${opts.vehicleName.toLowerCase().replace(/\s+/g, '_')}.glb`,
              byteLength: gltf.byteLength,
              buffer: gltf,
            });
          } else {
            const jsonStr = JSON.stringify(gltf, null, 2);
            const encoder = new TextEncoder();
            const buffer = encoder.encode(jsonStr).buffer;
            resolve({
              filename: `${opts.vehicleName.toLowerCase().replace(/\s+/g, '_')}.gltf`,
              byteLength: buffer.byteLength,
              buffer,
              jsonMetadata: gltf,
            });
          }
        },
        (error) => {
          reject(new Error(`Failed to export GLB asset: ${error.message || String(error)}`));
        },
        {
          binary: opts.binary,
          maxTextureSize: opts.maxTextureSize,
          includeCustomExtensions: true,
        }
      );
    });
  }

  /**
   * Helper utility to serialize a complete interior cabin state configuration to a GLB file.
   */
  public static async exportInteriorCabinToGlb(
    rootGroup: THREE.Object3D,
    interiorName: string = "Bespoke_Interior_Cabin",
    authorName: string = "Antigravity Automotive CAD Engine"
  ): Promise<ExportedGlbResult> {
    return this.exportVehicleToGlb(rootGroup, {
      vehicleName: interiorName.toLowerCase().replace(/\s+/g, "_"),
      author: authorName,
      binary: true,
      includeCustomMetadata: true,
      embedTextures: true,
      maxTextureSize: 2048,
    });
  }

  /**
   * Helper utility to trigger in-browser file download of the exported GLB buffer.
   */
  public static triggerBrowserDownload(exportResult: ExportedGlbResult): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const blob = new Blob([exportResult.buffer], {
      type: exportResult.filename.endsWith('.glb') ? 'model/gltf-binary' : 'model/gltf+json',
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
}
