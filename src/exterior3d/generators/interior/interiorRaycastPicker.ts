/**
 * ============================================================================
 * INTERIOR 3D RAYCAST PICKER & HIGHLIGHT ENGINE
 * ============================================================================
 * Raycasting system mapping 3D cockpit meshes to customization workbench tabs:
 * - Direct click selection of Steering Wheel, Dashboard, Console, Seats, Doors, Roof
 * - Emissive rim highlight & glowing edge effects on hovered/selected subassemblies
 * - Automatic workbench tab synchronization (Seats, Dash, Console, Materials, Audio)
 * ============================================================================
 */

import * as THREE from "three";

export type InteriorWorkbenchTabKey = "seats" | "dash" | "console" | "materials" | "audio_safety" | "bespoke";

export interface RaycastHitResult {
  partCategory: InteriorWorkbenchTabKey;
  partName: string;
  submeshName: string;
  point: THREE.Vector3;
}

export class InteriorRaycastPicker {
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private interiorGroup: THREE.Group;

  private hoveredMesh: THREE.Mesh | null = null;
  private originalEmissive: THREE.Color = new THREE.Color(0, 0, 0);
  private originalEmissiveIntensity: number = 0;

  private onHoverCallback?: (partName: string | null, tab: InteriorWorkbenchTabKey | null) => void;
  private onClickCallback?: (partCategory: InteriorWorkbenchTabKey, partName: string) => void;

  constructor(
    camera: THREE.Camera,
    domElement: HTMLElement,
    interiorGroup: THREE.Group,
    onHover?: (partName: string | null, tab: InteriorWorkbenchTabKey | null) => void,
    onClick?: (partCategory: InteriorWorkbenchTabKey, partName: string) => void
  ) {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.camera = camera;
    this.domElement = domElement;
    this.interiorGroup = interiorGroup;
    this.onHoverCallback = onHover;
    this.onClickCallback = onClick;

    this.attachEvents();
  }

  public updateInteriorGroup(group: THREE.Group): void {
    this.interiorGroup = group;
    this.clearHighlight();
  }

  /**
   * Maps meshUserData or mesh object name to Interior Workbench Tab Key
   */
  public static mapMeshToWorkbenchTab(mesh: THREE.Object3D): { category: InteriorWorkbenchTabKey; label: string } | null {
    let curr: THREE.Object3D | null = mesh;
    while (curr) {
      const name = (curr.name || "").toLowerCase();
      const userDataCategory = curr.userData?.category;

      if (userDataCategory) {
        return { category: userDataCategory as InteriorWorkbenchTabKey, label: curr.name || "Cabin Component" };
      }

      if (name.includes("steer") || name.includes("yoke") || name.includes("paddle") || name.includes("wheel")) {
        return { category: "dash", label: "Steering Wheel & Controls" };
      }
      if (name.includes("dash") || name.includes("cluster") || name.includes("hud") || name.includes("vent") || name.includes("binnacle")) {
        return { category: "dash", label: "Dashboard & Digital Cluster" };
      }
      if (name.includes("console") || name.includes("infotainment") || name.includes("shifter") || name.includes("rotary") || name.includes("cup")) {
        return { category: "console", label: "Center Console & Infotainment" };
      }
      if (name.includes("seat") || name.includes("recaro") || name.includes("bucket") || name.includes("harness") || name.includes("headrest")) {
        return { category: "seats", label: "Seating System & Harnesses" };
      }
      if (name.includes("door") || name.includes("card") || name.includes("speaker") || name.includes("ambient") || name.includes("light")) {
        return { category: "materials", label: "Door Panels & Ambient Lighting" };
      }
      if (name.includes("roof") || name.includes("headliner") || name.includes("starlight") || name.includes("cage") || name.includes("roll")) {
        return { category: "audio_safety", label: "Roof & Safety Cage" };
      }

      curr = curr.parent;
    }

    return null;
  }

  private attachEvents(): void {
    let isClickDrag = false;
    let pointerDownTime = 0;

    const onPointerDown = () => {
      isClickDrag = false;
      pointerDownTime = performance.now();
    };

    const onPointerMove = (e: PointerEvent) => {
      isClickDrag = true;
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.performHoverCheck();
    };

    const onPointerUp = (e: PointerEvent) => {
      const clickDuration = performance.now() - pointerDownTime;
      // Distinguish fast click from camera look drag
      if (clickDuration < 280) {
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.performClickCheck();
      }
    };

    this.domElement.addEventListener("pointerdown", onPointerDown);
    this.domElement.addEventListener("pointermove", onPointerMove);
    this.domElement.addEventListener("pointerup", onPointerUp);
  }

  private performHoverCheck(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interiorGroup.children, true);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object as THREE.Mesh;
      const mapped = InteriorRaycastPicker.mapMeshToWorkbenchTab(hitObj);

      if (mapped) {
        if (this.hoveredMesh !== hitObj) {
          this.clearHighlight();
          this.applyHighlight(hitObj);
        }
        if (this.onHoverCallback) {
          this.onHoverCallback(mapped.label, mapped.category);
        }
        return;
      }
    }

    this.clearHighlight();
    if (this.onHoverCallback) {
      this.onHoverCallback(null, null);
    }
  }

  private performClickCheck(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interiorGroup.children, true);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const mapped = InteriorRaycastPicker.mapMeshToWorkbenchTab(hitObj);

      if (mapped && this.onClickCallback) {
        this.onClickCallback(mapped.category, mapped.label);
      }
    }
  }

  private applyHighlight(mesh: THREE.Mesh): void {
    this.hoveredMesh = mesh;
    if (mesh.material && !Array.isArray(mesh.material)) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.emissive) {
        this.originalEmissive.copy(mat.emissive);
        this.originalEmissiveIntensity = mat.emissiveIntensity || 0;
        mat.emissive.setHex(0xd9a64e); // Amber glow highlight
        mat.emissiveIntensity = 0.45;
      }
    }
  }

  private clearHighlight(): void {
    if (this.hoveredMesh && this.hoveredMesh.material && !Array.isArray(this.hoveredMesh.material)) {
      const mat = this.hoveredMesh.material as THREE.MeshStandardMaterial;
      if (mat.emissive) {
        mat.emissive.copy(this.originalEmissive);
        mat.emissiveIntensity = this.originalEmissiveIntensity;
      }
    }
    this.hoveredMesh = null;
  }

  public dispose(): void {
    this.clearHighlight();
  }
}
