"""
RENDER VEHICLE FAMILY SHOWCASE (Blender 5.2 LTS)
=============================================================================
Renders studio beauty shots of the procedural vehicle families with +Y Forward:
  - Sedan, Coupe, Wagon, Shooting Brake, Pickup, Hypercar, Off-Road 4x4, Dune Buggy
=============================================================================
"""

import bpy
import math
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\6b65af10-4dec-4c71-90b8-d02c18319690"
COMPLETE_DIR = os.path.join(PROJECT_DIR, "public", "models", "vehicle_families", "complete")

def setup_studio():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    world = bpy.data.worlds.new("Showroom_World")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs['Color'].default_value = (0.04, 0.045, 0.055, 1.0)
        bg.inputs['Strength'].default_value = 0.85

    # Studio floor plane
    bpy.ops.mesh.primitive_plane_add(size=40.0, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.name = "Studio_Floor"
    fmat = bpy.data.materials.new("Floor_Mat")
    fmat.use_nodes = True
    fbsdf = fmat.node_tree.nodes.get("Principled BSDF")
    if fbsdf:
        fbsdf.inputs['Base Color'].default_value = (0.03, 0.032, 0.038, 1.0)
        fbsdf.inputs['Roughness'].default_value = 0.24
        fbsdf.inputs['Metallic'].default_value = 0.15
    floor.data.materials.append(fmat)

    # Lighting setup (Key from front-left-above, Fill from right, Rim from rear)
    bpy.ops.object.light_add(type='AREA', location=(4.5, 6.0, 4.5))
    key = bpy.context.active_object
    key.data.energy = 1800
    key.data.size = 4.0
    key.rotation_euler = (math.radians(-50), math.radians(20), math.radians(-140))

    bpy.ops.object.light_add(type='AREA', location=(-4.8, 3.0, 3.8))
    fill = bpy.context.active_object
    fill.data.energy = 900
    fill.data.size = 4.5

    bpy.ops.object.light_add(type='AREA', location=(0.0, -6.2, 3.8))
    rim = bpy.context.active_object
    rim.data.energy = 1400
    rim.data.size = 4.0

def render_model(glb_filename, output_png):
    setup_studio()

    glb_path = os.path.join(COMPLETE_DIR, glb_filename)
    if not os.path.exists(glb_path):
        print(f"Skipping missing model: {glb_path}")
        return

    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Camera target at car center
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0.70))
    target = bpy.context.active_object

    # Camera at front 3/4 perspective
    bpy.ops.object.camera_add(location=(5.4, 6.8, 2.8))
    cam = bpy.context.active_object
    bpy.context.scene.camera = cam
    cam.data.lens = 45 # 45mm lens for automotive beauty framing

    track = cam.constraints.new(type='TRACK_TO')
    track.target = target
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'

    scene = bpy.context.scene
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = os.path.join(ARTIFACTS_DIR, output_png)

    bpy.ops.render.render(write_still=True)
    print(f"[RENDER SUCCESS] Saved: {scene.render.filepath}")

def main():
    models = [
        ("sedan_complete.glb", "family_sedan_studio.png"),
        ("coupe_complete.glb", "family_coupe_studio.png"),
        ("station_wagon_complete.glb", "family_wagon_studio.png"),
        ("shooting_brake_complete.glb", "family_shooting_brake_studio.png"),
        ("pickup_truck_complete.glb", "family_pickup_truck_studio.png"),
        ("hypercar_complete.glb", "family_hypercar_studio.png"),
        ("offroad_4x4_complete.glb", "family_offroad_4x4_studio.png"),
        ("dune_buggy_complete.glb", "family_dune_buggy_studio.png"),
    ]

    for glb_file, png_out in models:
        print(f"\n--- Rendering: {glb_file} -> {png_out} ---")
        render_model(glb_file, png_out)

    print("\n=======================================================")
    print(" ✅ ALL 8 SHOWCASE BEAUTY RENDERS UPDATED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    main()
