// ============================================================================
// CENTRALIZED GLTF / GLB LOADER FACTORY (Meshopt + Offline Draco Support)
// ============================================================================
// Provides shared, high-performance GLTFLoader instances preconfigured with:
// 1. MeshoptDecoder (Khronos EXT_meshopt_compression WebAssembly decoder)
// 2. DRACOLoader pointing to local '/draco/' WASM files (zero external CDN latency)
// 3. In-flight Promise deduplication to avoid redundant fetches for identical assets
// ============================================================================

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

class GltfLoaderFactory {
  private static sharedLoader: GLTFLoader | null = null;
  private static dracoLoader: DRACOLoader | null = null;
  private static inflightRequests: Map<string, Promise<GLTF>> = new Map();

  /**
   * Initializes or returns the shared DRACOLoader pointing to local '/draco/' decoders.
   */
  public static getDRACOLoader(): DRACOLoader {
    if (!this.dracoLoader) {
      this.dracoLoader = new DRACOLoader();
      if (typeof window !== 'undefined') {
        this.dracoLoader.setDecoderPath('/draco/');
      }
    }
    return this.dracoLoader;
  }

  /**
   * Configures any GLTFLoader instance with MeshoptDecoder and DRACOLoader.
   */
  public static configureLoader(loader: GLTFLoader): GLTFLoader {
    try {
      loader.setMeshoptDecoder(MeshoptDecoder);
    } catch {
      // Meshopt decoder fallback
    }

    if (typeof window !== 'undefined') {
      try {
        loader.setDRACOLoader(this.getDRACOLoader());
      } catch {
        // Fallback gracefully without Draco
      }
    }

    return loader;
  }

  /**
   * Creates a freshly configured GLTFLoader instance.
   */
  public static createLoader(): GLTFLoader {
    const loader = new GLTFLoader();
    return this.configureLoader(loader);
  }

  /**
   * Returns the shared singleton GLTFLoader instance.
   */
  public static getSharedLoader(): GLTFLoader {
    if (!this.sharedLoader) {
      this.sharedLoader = this.createLoader();
    }
    return this.sharedLoader;
  }

  /**
   * Loads a GLTF/GLB asset with request deduplication and configured decoders.
   */
  public static load(url: string, onProgress?: (event: ProgressEvent) => void): Promise<GLTF> {
    if (this.inflightRequests.has(url)) {
      return this.inflightRequests.get(url)!;
    }

    const loader = this.getSharedLoader();
    const promise = new Promise<GLTF>((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          this.inflightRequests.delete(url);
          resolve(gltf);
        },
        onProgress,
        (err) => {
          this.inflightRequests.delete(url);
          reject(err);
        }
      );
    });

    this.inflightRequests.set(url, promise);
    return promise;
  }

  /**
   * Disposes decoder worker pools and clears pending requests.
   */
  public static dispose(): void {
    if (this.dracoLoader) {
      this.dracoLoader.dispose();
      this.dracoLoader = null;
    }
    this.sharedLoader = null;
    this.inflightRequests.clear();
  }
}

export { GltfLoaderFactory, MeshoptDecoder };
export default GltfLoaderFactory;
