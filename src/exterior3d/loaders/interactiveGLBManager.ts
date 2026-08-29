// ============================================================================
// INTERACTIVE GLB MANAGER — Universal Interactivity for All 3D Models
// Adds raycast picking, part highlighting, exploded view, tooltips,
// material swapping, and drag-to-reposition for any loaded GLB
// ============================================================================

import * as THREE from "three";

export interface InteractivePart {
  mesh: THREE.Mesh;
  name: string;
  category: string;
  originalMaterial: THREE.Material;
  originalPosition: THREE.Vector3;
  originalEmissive: THREE.Color;
  explodedOffset: THREE.Vector3;
  isHighlighted: boolean;
  isSelected: boolean;
  isVisible: boolean;
  userData: Record<string, unknown>;
}

export interface GLBInteractionConfig {
  highlightColor?: THREE.Color;
  highlightIntensity?: number;
  selectColor?: THREE.Color;
  selectIntensity?: number;
  explodeDuration?: number;
  enableDrag?: boolean;
  enableExplode?: boolean;
  enableMaterialSwap?: boolean;
  enablePartIsolation?: boolean;
}

// ============================================================================
// INTERACTIVE GLB MANAGER CLASS
// ============================================================================

export class InteractiveGLBManager {
  private root: THREE.Group;
  private parts: Map<string, InteractivePart> = new Map();
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private config: GLBInteractionConfig;
  private explodeFactor: number = 0;
  private targetExplodeFactor: number = 0;
  private hoveredPart: InteractivePart | null = null;
  private selectedPart: InteractivePart | null = null;
  private isolatedPart: InteractivePart | null = null;
  private animationCallbacks: ((dt: number) => void)[] = [];

  // Events
  private onPartHover?: (part: InteractivePart | null) => void;
  private onPartSelect?: (part: InteractivePart | null) => void;
  private onExplodeChange?: (factor: number) => void;

  constructor(
    root: THREE.Group,
    camera: THREE.Camera,
    domElement: HTMLElement,
    config: GLBInteractionConfig = {}
  ) {
    this.root = root;
    this.camera = camera;
    this.domElement = domElement;
    this.config = {
      highlightColor: new THREE.Color(0xfbbf24),
      highlightIntensity: 0.4,
      selectColor: new THREE.Color(0x38bdf8),
      selectIntensity: 0.6,
      explodeDuration: 0.6,
      enableDrag: true,
      enableExplode: true,
      enableMaterialSwap: true,
      enablePartIsolation: true,
      ...config,
    };
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.scanAndRegisterParts();
    this.attachEvents();
  }

  // ========================================================================
  // PART SCANNING — Automatically discovers all meshes in the GLB hierarchy
  // ========================================================================

  private scanAndRegisterParts(): void {
    let partIndex = 0;
    this.root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.material) return;
        const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        if (!(mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial)) return;
        const category = this.categorizeMesh(mesh);
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);
        const part: InteractivePart = {
          mesh, name: mesh.name || "Part_" + partIndex,
          category, originalMaterial: mat.clone(),
          originalPosition: mesh.position.clone(),
          originalEmissive: (mat as any).emissive ? new THREE.Color((mat as any).emissive.r, (mat as any).emissive.g, (mat as any).emissive.b) : new THREE.Color(0),
          explodedOffset: this.computeExplodeOffset(mesh, category),
          isHighlighted: false, isSelected: false, isVisible: true,
          userData: mesh.userData || {},
        };
        this.parts.set(mesh.uuid, part);
        partIndex++;
      }
    });
  }

  private categorizeMesh(mesh: THREE.Mesh): string {
    const n = (mesh.name || "").toLowerCase();
    if (n.includes("steer") || n.includes("wheel") || n.includes("yoke")) return "steering";
    if (n.includes("seat") || n.includes("recaro") || n.includes("bucket")) return "seats";
    if (n.includes("dash") || n.includes("cluster") || n.includes("binnacle")) return "dashboard";
    if (n.includes("console") || n.includes("shifter") || n.includes("rotary")) return "console";
    if (n.includes("door") || n.includes("panel") || n.includes("card")) return "doors";
    if (n.includes("roof") || n.includes("headliner")) return "roof";
    if (n.includes("exhaust") || n.includes("header") || n.includes("turbo")) return "exhaust";
    if (n.includes("wheel") || n.includes("rim") || n.includes("tire") || n.includes("brake")) return "wheels";
    if (n.includes("body") || n.includes("panel") || n.includes("hood") || n.includes("fender")) return "body";
    if (n.includes("engine") || n.includes("block") || n.includes("intake")) return "engine";
    if (n.includes("light") || n.includes("lamp") || n.includes("led")) return "lighting";
    if (n.includes("ambient") || n.includes("led_strip")) return "ambient_lighting";
    if (n.includes("carpet") || n.includes("floor") || n.includes("mat")) return "flooring";
    if (n.includes("mirror")) return "mirrors";
    if (n.includes("vent") || n.includes("hvac") || n.includes("climate")) return "hvac";
    return "other";
  }

  private computeExplodeOffset(mesh: THREE.Mesh, category: string): THREE.Vector3 {
    const center = new THREE.Vector3();
    if (mesh.geometry) {
      mesh.geometry.computeBoundingBox();
      const bb = mesh.geometry.boundingBox!;
      bb.getCenter(center);
    }
    const dir = center.clone().normalize();
    const dist = center.length();
    if (dist < 0.01) return new THREE.Vector3();
    const explodeScale = 0.25;
    return dir.multiplyScalar(explodeScale);
  }

  // ========================================================================
  // EVENT HANDLING — Raycast pointer events for hover and click
  // ========================================================================

  private attachEvents(): void {
    let pointerDownTime = 0;
    const onPointerDown = () => { pointerDownTime = performance.now(); };

    const onPointerMove = (e: PointerEvent) => {
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.performHoverRaycast();
    };

    const onPointerUp = () => {
      if (performance.now() - pointerDownTime < 280) {
        this.performClickRaycast();
      }
    };

    this.domElement.addEventListener("pointerdown", onPointerDown);
    this.domElement.addEventListener("pointermove", onPointerMove);
    this.domElement.addEventListener("pointerup", onPointerUp);
  }

  private performHoverRaycast(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes: THREE.Mesh[] = [];
    this.parts.forEach((p) => meshes.push(p.mesh));
    const hits = this.raycaster.intersectObjects(meshes, false);
    const hitPart = hits.length > 0 ? this.parts.get(hits[0].object.uuid) ?? null : null;
    if (hitPart !== this.hoveredPart) {
      if (this.hoveredPart) this.clearHighlight(this.hoveredPart);
      this.hoveredPart = hitPart;
      if (hitPart) this.applyHighlight(hitPart, this.config.highlightColor!, this.config.highlightIntensity!);
      this.domElement.style.cursor = hitPart ? "pointer" : "default";
      this.onPartHover?.(hitPart);
    }
  }

  private performClickRaycast(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes: THREE.Mesh[] = [];
    this.parts.forEach((p) => meshes.push(p.mesh));
    const hits = this.raycaster.intersectObjects(meshes, false);
    const hitPart = hits.length > 0 ? this.parts.get(hits[0].object.uuid) ?? null : null;
    if (this.selectedPart && this.selectedPart !== hitPart) {
      this.clearSelection(this.selectedPart);
    }
    this.selectedPart = hitPart;
    if (hitPart) {
      this.applyHighlight(hitPart, this.config.selectColor!, this.config.selectIntensity!);
      hitPart.isSelected = true;
    }
    this.onPartSelect?.(hitPart);
  }

  // ========================================================================
  // HIGHLIGHT & SELECTION — Emissive glow effects
  // ========================================================================

  private applyHighlight(part: InteractivePart, color: THREE.Color, intensity: number): void {
    const mat = part.mesh.material as any;
    if (mat && mat.emissive) {
      mat.emissive.copy(color);
      mat.emissiveIntensity = intensity;
    }
    part.isHighlighted = true;
  }

  private clearHighlight(part: InteractivePart): void {
    if (part.isSelected) return;
    const mat = part.mesh.material as any;
    if (mat && mat.emissive) {
      mat.emissive.copy(part.originalEmissive);
      mat.emissiveIntensity = 0;
    }
    part.isHighlighted = false;
  }

  private clearSelection(part: InteractivePart): void {
    const mat = part.mesh.material as any;
    if (mat && mat.emissive) {
      mat.emissive.copy(part.originalEmissive);
      mat.emissiveIntensity = 0;
    }
    part.isSelected = false;
    part.isHighlighted = false;
  }

  // ========================================================================
  // EXPLODED VIEW — Smoothly animate parts outward from center
  // ========================================================================

  public setExplodeFactor(factor: number): void {
    this.targetExplodeFactor = Math.max(0, Math.min(1, factor));
  }

  public toggleExplode(): void {
    this.targetExplodeFactor = this.explodeFactor > 0.5 ? 0 : 1;
  }

  private updateExplode(dt: number): void {
    const speed = 1.0 / (this.config.explodeDuration || 0.6);
    if (Math.abs(this.explodeFactor - this.targetExplodeFactor) < 0.001) {
      this.explodeFactor = this.targetExplodeFactor;
    } else {
      this.explodeFactor += (this.targetExplodeFactor - this.explodeFactor) * Math.min(1, speed * dt);
    }
    this.parts.forEach((part) => {
      const offset = part.explodedOffset.clone().multiplyScalar(this.explodeFactor);
      part.mesh.position.copy(part.originalPosition.clone().add(offset));
    });
    this.onExplodeChange?.(this.explodeFactor);
  }

  // ========================================================================
  // MATERIAL SWAP — Change material on selected part
  // ========================================================================

  public swapPartMaterial(partName: string, newMaterial: THREE.Material): void {
    this.parts.forEach((part) => {
      if (part.name === partName || part.category === partName) {
        part.mesh.material = newMaterial;
      }
    });
  }

  public swapCategoryMaterial(category: string, newMaterial: THREE.Material): void {
    this.parts.forEach((part) => {
      if (part.category === category) {
        part.mesh.material = newMaterial;
      }
    });
  }

  // ========================================================================
  // PART ISOLATION — Show only the selected part
  // ========================================================================

  public isolatePart(partName: string): void {
    this.parts.forEach((part) => {
      part.isVisible = part.name === partName || part.category === partName;
      part.mesh.visible = part.isVisible;
    });
    this.isolatedPart = this.parts.get(partName) || null;
  }

  public showAll(): void {
    this.parts.forEach((part) => {
      part.isVisible = true;
      part.mesh.visible = true;
    });
    this.isolatedPart = null;
  }

  // ========================================================================
  // PUBLIC API — Getters, setters, and query methods
  // ========================================================================

  public update(dt: number): void {
    if (this.config.enableExplode) this.updateExplode(dt);
    this.animationCallbacks.forEach((cb) => cb(dt));
  }

  public onPartHovered(cb: (part: InteractivePart | null) => void): void {
    this.onPartHover = cb;
  }

  public onPartSelected(cb: (part: InteractivePart | null) => void): void {
    this.onPartSelect = cb;
  }

  public onExplodeChanged(cb: (factor: number) => void): void {
    this.onExplodeChange = cb;
  }

  public getParts(): InteractivePart[] {
    return Array.from(this.parts.values());
  }

  public getPartsByCategory(category: string): InteractivePart[] {
    return Array.from(this.parts.values()).filter((p) => p.category === category);
  }

  public getCategories(): string[] {
    const cats = new Set<string>();
    this.parts.forEach((p) => cats.add(p.category));
    return Array.from(cats);
  }

  public getSelectedPart(): InteractivePart | null {
    return this.selectedPart;
  }

  public getHoveredPart(): InteractivePart | null {
    return this.hoveredPart;
  }

  public getExplodeFactor(): number {
    return this.explodeFactor;
  }

  public getPartCount(): number {
    return this.parts.size;
  }

  public addAnimationCallback(cb: (dt: number) => void): void {
    this.animationCallbacks.push(cb);
  }

  public highlightCategory(category: string): void {
    this.parts.forEach((part) => {
      if (part.category === category) {
        this.applyHighlight(part, this.config.highlightColor!, this.config.highlightIntensity!);
      } else {
        this.clearHighlight(part);
      }
    });
  }

  public clearAllHighlights(): void {
    this.parts.forEach((part) => {
      this.clearHighlight(part);
      this.clearSelection(part);
    });
    this.hoveredPart = null;
    this.selectedPart = null;
  }

  public resetPositions(): void {
    this.parts.forEach((part) => {
      part.mesh.position.copy(part.originalPosition);
      part.mesh.visible = true;
      part.isVisible = true;
    });
    this.explodeFactor = 0;
    this.targetExplodeFactor = 0;
    this.isolatedPart = null;
  }

  public dispose(): void {
    this.clearAllHighlights();
    this.parts.clear();
    this.animationCallbacks = [];
  }
}
