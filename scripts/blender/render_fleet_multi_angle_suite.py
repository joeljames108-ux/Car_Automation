"""
============================================================================
Automated Multi-Angle Automotive Validation Render Suite
============================================================================
Part IV - Phase 201: Multi-Angle Screenshot Render Suite Execution
Captures 5 photorealistic automotive validation views per vehicle:
  1. Front 3/4 (front_three_quarter)
  2. Rear 3/4 (rear_three_quarter)
  3. Side Profile (side_profile)
  4. Front Direct (front_view)
  5. Rear Direct (rear_view)
============================================================================
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Euler

PROJECT_ROOT = r"e:\Car_Automation"
OUT_RENDERS_DIR = os.path.join(PROJECT_ROOT, "docs", "renders")
os.makedirs(OUT_RENDERS_DIR, exist_ok=True)

CAMERA_PRESETS = {
    "front_three_quarter": {
        "location": (3.8, 4.2, 1.8),
        "rotation": (math.radians(72), 0, math.radians(138))
    },
    "rear_three_quarter": {
        "location": (3.8, -4.2, 1.8),
        "rotation": (math.radians(108), 0, math.radians(42))
    },
    "side_profile": {
        "location": (5.2, 0.0, 1.3),
        "rotation": (math.radians(90), 0, math.radians(90))
    },
    "front_view": {
        "location": (0.0, 5.0, 1.4),
        "rotation": (math.radians(78), 0, math.radians(180))
    },
    "rear_view": {
        "location": (0.0, -5.0, 1.4),
        "rotation": (math.radians(102), 0, 0)
    }
}


def setup_studio_lighting():
    """Configures high-contrast automotive studio lighting."""
    # Key light
    key_light = bpy.data.lights.new(name="Studio_Key", type='AREA')
    key_light.energy = 1500
    key_light.size = 5.0
    key_obj = bpy.data.objects.new("Studio_Key_Obj", key_light)
    bpy.context.scene.collection.objects.link(key_obj)
    key_obj.location = (4.0, 4.0, 5.0)

    # Fill light
    fill_light = bpy.data.lights.new(name="Studio_Fill", type='AREA')
    fill_light.energy = 800
    fill_light.size = 6.0
    fill_obj = bpy.data.objects.new("Studio_Fill_Obj", fill_light)
    bpy.context.scene.collection.objects.link(fill_obj)
    fill_obj.location = (-4.0, 3.0, 4.0)

    # Rim light
    rim_light = bpy.data.lights.new(name="Studio_Rim", type='SPOT')
    rim_light.energy = 2500
    rim_obj = bpy.data.objects.new("Studio_Rim_Obj", rim_light)
    bpy.context.scene.collection.objects.link(rim_obj)
    rim_obj.location = (0.0, -5.0, 4.5)
    rim_obj.rotation_euler = (math.radians(45), 0, 0)


def setup_render_settings():
    """Sets standard 1080p preview render settings."""
    scene = bpy.context.scene
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'WEBP'
    scene.render.image_settings.quality = 90
    scene.display_settings.display_device = 'sRGB'
    scene.view_settings.view_transform = 'Filmic'
    scene.view_settings.look = 'Medium High Contrast'


def render_vehicle_views(glb_path, category, era):
    """Imports glb, renders 5 angles, saves images, and clears scene."""
    if not os.path.exists(glb_path):
        return

    # Clear scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # Import GLB
    bpy.ops.import_scene.gltf(filepath=glb_path)

    setup_studio_lighting()
    setup_render_settings()

    # Create Camera
    cam_data = bpy.data.cameras.new("RenderCam")
    cam_data.lens = 50.0 # 50mm automotive portrait lens
    cam_obj = bpy.data.objects.new("RenderCam_Obj", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    cat_render_dir = os.path.join(OUT_RENDERS_DIR, category)
    os.makedirs(cat_render_dir, exist_ok=True)

    for view_name, params in CAMERA_PRESETS.items():
        cam_obj.location = params["location"]
        cam_obj.rotation_euler = params["rotation"]

        out_path = os.path.join(cat_render_dir, f"{era}_{view_name}.webp")
        bpy.context.scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        print(f"  [RENDER OK] {out_path}")


def render_all_fleet_samples(max_per_cat=1):
    """Renders representative validation angles for verification."""
    print(">>> RUNNING PHASE 201: AUTOMOTIVE VALIDATION RENDER SUITE <<<")
    cat_dir = os.path.join(PROJECT_ROOT, "public", "models", "vehicles")
    if not os.path.exists(cat_dir):
        return

    for cat in sorted(os.listdir(cat_dir)):
        cpath = os.path.join(cat_dir, cat)
        if not os.path.isdir(cpath):
            continue
        # Take future or 2020s era
        for era in ["future", "2020s"]:
            glb_path = os.path.join(cpath, era, "vehicle.glb")
            if os.path.exists(glb_path):
                print(f"\n[RENDERING] {cat} ({era})...")
                render_vehicle_views(glb_path, cat, era)
                break


if __name__ == "__main__":
    render_all_fleet_samples()
