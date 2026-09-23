---
name: skill-for-vehicle-camera-framing
description: Automotive 3D configurator camera framing and cinematic transition skill. Formulates standardized camera target empties baked into Blender/glTF hierarchies (Hero 3/4, Wheel Macro, Cockpit POV, Engine Close-up, Aero Diffuser), Field of View (FOV) calibrations, Three.js OrbitControls spherical tweening formulas, and auto-discovery runtime controllers.
---

# Skill for Vehicle Camera Framing: Configurator Cinematics & POV Anchors Standard

This skill establishes the **quantitative spatial coordinate standards, optical lens parameters (focal length $f$, field of view $\text{FOV}$), and Three.js runtime camera transition architecture** for automotive 3D configurators. By baking standardized camera anchor empties (`CAMERA_*`) directly into Blender GLBs, any web or mobile client can smoothly tween the viewport between exterior hero stances, macro wheel inspections, and cockpit driver POVs with zero hardcoded magic numbers.

---

## 1. Master Camera Anchor Registry

Every vehicle GLB must embed standardized empty nodes under `VEHICLE_ROOT` representing the primary automotive viewing perspectives:

| Camera Anchor Node | Position $(X, Y, Z)$ | Target Focal Point | Lens FOV | Primary Viewing Purpose |
|:---|:---|:---|:---|:---|
| **`CAMERA_Hero_Front_3Quarter`** | $(-3.80\text{m}, +4.20\text{m}, +1.65\text{m})$ | $(0.0, +0.20\text{m}, +0.65\text{m})$ | $35^\circ$ ($50\text{mm}$) | Hero exterior overview & silhouette |
| **`CAMERA_Hero_Rear_3Quarter`**  | $(+3.80\text{m}, -4.20\text{m}, +1.65\text{m})$ | $(0.0, -0.20\text{m}, +0.65\text{m})$ | $35^\circ$ ($50\text{mm}$) | Rear diffuser, exhaust & spoiler |
| **`CAMERA_Side_Elevation`**      | $(-5.80\text{m}, 0.0, +1.10\text{m})$           | $(0.0, 0.0, +0.60\text{m})$         | $28^\circ$ ($70\text{mm}$) | True profile, wheelbase & stance |
| **`CAMERA_Wheel_Front_Macro`**   | $(-1.85\text{m}, +1.32\text{m}, +0.48\text{m})$ | $(-0.95\text{m}, +1.32\text{m}, +0.34\text{m})$ | $42^\circ$ ($35\text{mm}$) | Wheel spoke, caliper & rotor inspection |
| **`CAMERA_Cockpit_Driver_POV`**  | $(-0.380\text{m}, -0.150\text{m}, +0.980\text{m})$| $(-0.380\text{m}, +0.440\text{m}, +0.680\text{m})$| $68^\circ$ ($24\text{mm}$) | Driver seat POV facing steering wheel |
| **`CAMERA_Cockpit_Cabin_Wide`**  | $(+0.450\text{m}, -0.650\text{m}, +1.020\text{m})$| $(-0.120\text{m}, +0.250\text{m}, +0.580\text{m})$| $75^\circ$ ($20\text{mm}$) | Full cabin view of dashboard & console |
| **`CAMERA_Engine_Bay_CloseUp`**  | $(0.0, -0.650\text{m}, +1.450\text{m})$         | $(0.0, -0.650\text{m}, +0.480\text{m})$ | $45^\circ$ ($32\text{mm}$) | Top-down view into intake & Hot-V turbos|

---

## 2. Blender Procedural Camera Anchor Generation

In Blender, camera anchors are authored as named empties childed to `VEHICLE_ROOT` with custom properties specifying target points and FOV:

```python
def create_camera_anchor(name, position, target_point, fov=35.0):
    """Creates a standardized camera empty with metadata for WebGL runtimes."""
    bpy.ops.object.empty_add(type='SINGLE_ARROW', location=position)
    cam_empty = bpy.context.active_object
    cam_empty.name = f"CAMERA_{name}"
    
    # Store target focal point and FOV in custom properties
    cam_empty["is_camera_anchor"] = True
    cam_empty["target_x"] = float(target_point[0])
    cam_empty["target_y"] = float(target_point[1])
    cam_empty["target_z"] = float(target_point[2])
    cam_empty["fov"] = float(fov)
    cam_empty["transition_duration"] = 1.2  # Seconds
    
    return cam_empty
```

---

## 3. Three.js Spherical Interpolation (Tweening) Architecture

When the user clicks a configurator tab (e.g. "Customize Wheels" or "Enter Cockpit"), Three.js smoothly interpolates the camera and `OrbitControls.target`:

```typescript
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

export class VehicleCameraController {
  private camera: THREE.PerspectiveCamera;
  private controls: any;
  private anchors: Map<string, { position: THREE.Vector3; target: THREE.Vector3; fov: number }> = new Map();

  constructor(camera: THREE.PerspectiveCamera, controls: any) {
    this.camera = camera;
    this.controls = controls;
  }

  public registerAnchorsFromGlb(scene: THREE.Group): void {
    scene.traverse((child: any) => {
      if (child.name.startsWith('CAMERA_') && child.userData?.is_camera_anchor) {
        const anchorName = child.name.replace('CAMERA_', '');
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);

        const target = new THREE.Vector3(
          child.userData.target_x,
          child.userData.target_y,
          child.userData.target_z
        );

        this.anchors.set(anchorName, {
          position: worldPos,
          target: target,
          fov: child.userData.fov || 35.0
        });
      }
    });
  }

  public transitionTo(anchorName: string, durationMs = 1200): void {
    const anchor = this.anchors.get(anchorName);
    if (!anchor) return;

    // Smooth spherical position tween
    new TWEEN.Tween(this.camera.position)
      .to(anchor.position, durationMs)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();

    // Smooth controls target tween
    new TWEEN.Tween(this.controls.target)
      .to(anchor.target, durationMs)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();

    // Smooth FOV zoom tween
    new TWEEN.Tween(this.camera)
      .to({ fov: anchor.fov }, durationMs)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => this.camera.updateProjectionMatrix())
      .start();
  }
}
```

---

## 4. Mandatory Blender glTF Export Invocation

```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,            # MANDATORY: Exports camera anchor metadata
    export_animations=True,
    export_apply=False,            # Preserves camera anchor world positions
    export_yup=True
)
```
