"""
=============================================================================
RENDER MERCEDES-BENZ W116 ASSESSMENT VIEWS
=============================================================================
Renders 5 high-fidelity studio beauty assessment shots of the 1970s Mercedes-Benz W116:
1. Front 3/4 Hero (Upright chrome grille, standing star, halogen headlamps)
2. Rear 3/4 (Stately decklid, Barényi ribbed safety taillights, dual chrome exhaust)
3. Side Profile (Classic 3-box saloon proportions, Bundt wheels, chrome waistline)
4. Front Elevation (Classic Mercedes face, double bumper, overriders)
5. Rear Elevation (Barényi ribbed taillight optics, double rear bumper)
=============================================================================
"""

import bpy
import math
import os
from mathutils import Vector, Euler

try:
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
except NameError:
    CURRENT_DIR = r"E:\Car_Automation\scripts\blender"
CONVERSATION_ID = "acd43136-462b-4bcc-95d3-b92439716605"
ARTIFACTS_DIR = os.path.join(os.path.expanduser("~"), ".gemini", "antigravity-ide", "brain", CONVERSATION_ID)
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# 1. Clear camera and lights
for o in list(bpy.data.objects):
    if o.type in ['CAMERA', 'LIGHT']:
        bpy.data.objects.remove(o, do_unlink=True)

# 2. Setup World & Studio Lighting
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.05, 0.055, 0.065, 1.0)
    bg_node.inputs["Strength"].default_value = 0.70

# Studio Key Light
key_light_data = bpy.data.lights.new(name="Studio_KeyLight", type='AREA')
key_light_data.energy = 1600
key_light_data.size = 6.0
key_light = bpy.data.objects.new("Studio_KeyLight", key_light_data)
key_light.location = (4.5, 4.2, 5.0)
key_light.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_light)

# Studio Fill Light
fill_light_data = bpy.data.lights.new(name="Studio_FillLight", type='AREA')
fill_light_data.energy = 850
fill_light_data.size = 7.0
fill_light = bpy.data.objects.new("Studio_FillLight", fill_light_data)
fill_light.location = (-4.5, 3.5, 3.8)
fill_light.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_light)

# Studio Rim Light
rim_light_data = bpy.data.lights.new(name="Studio_RimLight", type='SUN')
rim_light_data.energy = 5.0
rim_light = bpy.data.objects.new("Studio_RimLight", rim_light_data)
rim_light.location = (0.0, -6.5, 4.5)
rim_light.rotation_euler = Euler((math.radians(125), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_light)

# 3. Camera Setup
cam_data = bpy.data.cameras.new("AssessmentCam")
cam_data.lens = 55.0
cam_data.clip_start = 0.1
cam_data.clip_end = 100.0
cam_obj = bpy.data.objects.new("AssessmentCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

# 4. Render Settings
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'PNG'

# 5 Master Automotive Validation Angles: (Name, Location, Target, Lens)
angles = [
    ("w116_front_three_quarter", (4.8, 4.5, 1.65), (0.0, 0.25, 0.70), 50.0),
    ("w116_rear_three_quarter", (4.8, -4.5, 1.65), (0.0, -0.25, 0.70), 50.0),
    ("w116_side_profile", (6.5, 0.0, 1.05), (0.0, 0.0, 0.72), 70.0),
    ("w116_front_elevation", (0.0, 5.8, 0.98), (0.0, 0.5, 0.70), 60.0),
    ("w116_rear_elevation", (0.0, -5.8, 0.98), (0.0, -0.5, 0.70), 60.0),
]

def look_at(cam, target):
    direction = Vector(target) - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

def run_renders():
    for name, loc, target, lens in angles:
        cam_obj.location = Vector(loc)
        cam_data.lens = lens
        look_at(cam_obj, target)
        
        out_file = os.path.join(ARTIFACTS_DIR, f"{name}.png")
        scene.render.filepath = out_file
        bpy.ops.render.render(write_still=True)
        print(f"[RENDERED] {name} -> {out_file}")

    print("[COMPLETE] All 5 W116 validation angles rendered successfully.")

if __name__ == "__main__":
    run_renders()
