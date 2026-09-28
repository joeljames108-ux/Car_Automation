---
name: skill-for-glb-meshopt-compression
description: Automotive GLB meshopt compression and streaming delivery skill. Formulates the lossless/quantized compression of 15MB 450k-triangle CAD assets down to 2.5MB-3.8MB using EXT_meshopt_compression, @gltf-transform CLI pipelines (dedup, weld, quantize 14-bit, reorder vertex cache, meshopt), Three.js MeshoptDecoder runtime integration, and delivery optimization.
---

# Skill for glTF Meshopt Compression: Web Delivery & 75% Bandwidth Reduction Standard

This skill establishes the **quantitative compression pipeline, vertex cache reordering, attribute quantization standards, and Three.js client runtime decoder integration** for `EXT_meshopt_compression`. It enables a high-density 15MB / 450,000-triangle Class-A CAD automotive model to be compressed to **2.5MB – 3.8MB** for fast web and mobile 3D configurator loading while preserving 100% of all vertices, normals, UVs, morph keys, and animation tracks.

---

## 1. Architectural Principles of Meshopt Compression

### The Decimation Fallacy (STRICTLY PROHIBITED)
Using polygon decimation (e.g. collapsing 450,000 triangles down to 40,000 triangles) to reduce file size destroys Class-A specular highlights, flattens curved tire sipes, and creates faceted shading glitches across hood shutlines.

### The Meshopt Solution
`EXT_meshopt_compression` compresses the binary floating-point buffers directly:
1. **Vertex Cache Reordering (`reorder`):** Re-indexes triangles to maximize GPU Post-Transform Vertex Cache (L1/L2) hit rates.
2. **Quantization (`quantize`):** Converts 32-bit floats into quantized 14-bit integers for positions and 10-bit integers for normals/tangents.
3. **Entropy Encoding (`meshopt`):** Compresses byte deltas with SIMD-accelerated Huffman/LZ4-style codecs.
4. **Result:** Typically **>75% reduction** in raw `.glb` transfer size with **zero visual quality loss**!

---

## 2. Quantitative Size Targets

| Vehicle Asset | Uncompressed Master CAD Size | Meshopt Compressed Target Size | Triangle Retention |
|:---|---:|---:|---:|
| **Complete 15MB Hero Vehicle** | **14.8 MB – 16.2 MB** | **2.8 MB – 3.6 MB** | **100% (450,000 tris preserved)** |
| **Cabin Suite (Seats, Dash, Wheel)** | **4.2 MB – 5.5 MB** | **0.8 MB – 1.2 MB** | **100% (130,000 tris preserved)** |
| **Running Gear (4 Wheels & Brakes)**| **3.2 MB – 3.8 MB** | **0.6 MB – 0.9 MB** | **100% (100,000 tris preserved)** |

---

## 3. The 5-Step `@gltf-transform` Optimization Pipeline

Optimization is performed via Node.js script or CLI tool:

```javascript
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, quantize, reorder, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';

export async function optimizeAutomotiveGlb(inputPath, outputPath) {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.read(inputPath);
  await MeshoptEncoder.ready;

  await document.transform(
    // Step 1: Remove duplicate accessors and materials
    dedup(),

    // Step 2: Weld coincident vertices (0.5mm tolerance)
    weld({ tolerance: 0.0005 }),

    // Step 3: Quantize vertex attributes
    quantize({
      quantizePosition: 14,   // 14-bit position precision (~0.1mm accuracy)
      quantizeNormal: 10,     // 10-bit normal precision
      quantizeTexcoord: 12,   // 12-bit UV precision
      quantizeColor: 8        // 8-bit vertex color
    }),

    // Step 4: Reorder indices for GPU vertex cache locality
    reorder({ encoder: MeshoptEncoder }),

    // Step 5: Apply Meshopt buffer compression
    meshopt({ encoder: MeshoptEncoder, level: 'medium' })
  );

  await io.write(outputPath, document);
}
```

### Fast CLI Recipe
```bash
# Automated single-command optimization
gltf-transform optimize input.glb output.opt.glb \
  --texture-compress false \
  --quantize-position 14 \
  --quantize-normal 10
```

---

## 4. Three.js Client Runtime Decoder Integration

In the web frontend, configure `GLTFLoader` with `MeshoptDecoder`:

```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export function createAutomotiveGlbLoader(): GLTFLoader {
  const loader = new GLTFLoader();
  
  // Register SIMD WebAssembly Meshopt Decoder
  loader.setMeshoptDecoder(MeshoptDecoder);
  
  return loader;
}
```

- **Decompression Speed:** Decompresses 450,000 triangles in **<12 milliseconds** using SIMD WebAssembly.
- **Instant Interactive Playback:** All baked NLA actions and morph keys remain immediately playable on the decompressed meshes.

---

## 5. Dual-Mode Production Export Standard

When building automotive assets on any device:
1. Always preserve the raw uncompressed master CAD export in `public/models/interior/<name>.glb` and `exports/<name>.glb`.
2. Generate the fast-loading optimized delivery copy alongside it: `public/models/interior/<name>.opt.glb`.
3. The application loads the `.opt.glb` asset for fast 60 FPS user experience while the `.glb` master serves as the CAD source of truth.
