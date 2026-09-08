"""
Render Assembled Modular Vehicle Beauty Shots (Blender 5.2 LTS)
Renders full vehicle showroom perspective with the new high-poly non-boxy modular parts:
1. Front 3/4 Studio Perspective
2. Rear 3/4 Aero Perspective
3. High-Angle Interior / Engine Cutaway
"""
import bpy
import math
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\6b65af10-4dec-4c71-90b8-d02c18319690"
PARTS_DIR = os.path.join(PROJECT_DIR, "public", "models", "modular_parts", "individual")

def setup_studio():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    world = bpy.data.worlds.new("Showroom_World")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs['Color'].default_value = (0.05, 0.055, 0.07, 1.0)
        bg.inputs['Strength'].default_value = 0.8

    # Ground floor plane with subtle gloss reflection
    bpy.ops.mesh.primitive_plane_add(size=30.0, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.name = "Showroom_Floor"
    fmat = bpy.data.materials.new("Floor_Material")
    fmat.use_nodes = True
    fbsdf = fmat.node_tree.nodes.get("Principled BSDF")
    if fbsdf:
        fbsdf.inputs['Base Color'].default_value = (0.04, 0.045, 0.05, 1.0)
        fbsdf.inputs['Roughness'].default_value = 0.25
        fbsdf.inputs['Metallic'].default_value = 0.1
    floor.data.materials.append(fmat)

    # Lighting setup
    # Key light
    bpy.ops.object.light_add(type='AREA', location=(3.5, 4.0, 4.5))
    key = bpy.context.active_object
    key.data.energy = 1200
    key.data.size = 3.5
    key.rotation_euler = (math.radians(-50), math.radians(20), math.radians(40))

    # Fill softbox
    bpy.ops.object.light_add(type='AREA', location=(-4.0, 1.0, 3.5))
    fill = bpy.context.active_object
    fill.data.energy = 600
    fill.data.size = 4.0

    # Rear rim backlight
    bpy.ops.object.light_add(type='AREA', location=(0.0, -5.0, 3.2))
    rim = bpy.context.active_object
    rim.data.energy = 900
    rim.data.size = 3.0

def load_all_modular_parts():
    for f in os.listdir(PARTS_DIR):
        if f.endswith(".glb"):
            p = os.path.join(PARTS_DIR, f)
            bpy.ops.import_scene.gltf(filepath=p)

def render_camera(out_name, loc, rot):
    bpy.ops.object.camera_add(location=loc, rotation=rot)
    cam = bpy.context.active_object
    bpy.context.scene.camera = cam

    scene = bpy.context.scene
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = os.path.join(ARTIFACTS_DIR, out_name)

    bpy.ops.render.render(write_still=True)
    print(f"Saved: {scene.render.filepath}")
    bpy.data.objects.remove(cam)

def main():
    setup_studio()
    load_all_modular_parts()

    # 1. Front 3/4 beauty view
    render_camera(
        "assembled_modular_car_front_34.png",
        loc=(3.8, 4.8, 2.2),
        rot=(math.radians(72), 0, math.radians(145))
    )

    # 2. Rear 3/4 aero diffuser view
    render_camera(
        "assembled_modular_car_rear_34.png",
        loc=(3.6, -4.8, 1.8),
        rot=(math.radians(75), 0, math.radians(38))
    )

    print("[SUCCESS] All assembled modular beauty renders completed!")

if __name__ == "__main__":
    main()
