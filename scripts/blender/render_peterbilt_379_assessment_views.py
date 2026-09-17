"""
=============================================================================
RENDER PETERBILT 379 EXTENDED HOOD (1990s HEAVY TRUCK) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity studio validation shots of the procedural 1995 Peterbilt 379:
1. Front 3/4 Hero (127" Extended Hood, Texas 18" drop bumper, dual 15" Donaldson air cleaners, dual 7" monster stacks, Alcoa wheels)
2. Rear 3/4 (Low Air Leaf tandem bogie, Holland sliding 5th wheel, stainless half-fenders, Peterbilt mudflaps, pylon Suzie lines)
3. Side Profile (Classic owner-operator 265" WB stance, 150-gal fuel tanks, diamond step lids, Unibilt 63" UltraCab sleeper)
4. Front Elevation (Towering polished grille surround, red Peterbilt oval, split windshield, 14" gangster visor, 5 bullet roof lights)
5. Rear Elevation (Rear light bar with 4" round LED stop lamps, pintle hitch, coiled Suzie lines, straight exhaust stack tips)
=============================================================================
"""

import bpy
import math
import os
import sys
from mathutils import Vector, Euler

gen_dir = r"E:\Car_Automation\scripts\blender\generators"
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

if "generate_peterbilt_379_phase2" in sys.modules:
    del sys.modules["generate_peterbilt_379_phase2"]
import generate_peterbilt_379_phase2
from generate_peterbilt_379_phase2 import build_peterbilt_379_complete

# Build Peterbilt 379 unified complete model from fresh slate
build_peterbilt_379_complete()

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\acd43136-462b-4bcc-95d3-b92439716605"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# Clean previous cameras/lights/ground
for obj in list(bpy.data.objects):
    if any(k in obj.name for k in ["Studio", "Assessment", "KeyLight", "FillLight", "RimLight", "Overhead", "GroundBounce"]):
        bpy.data.objects.remove(obj, do_unlink=True)

# Studio World & Ambient Environment
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.04, 0.045, 0.05, 1.0)
    bg_node.inputs["Strength"].default_value = 0.90

# 1. Overhead Heavy Softbox (Z = 7.5 m)
top_data = bpy.data.lights.new(name="Assessment_Overhead", type='AREA')
top_data.energy = 6500
top_data.shape = 'RECTANGLE'
top_data.size = 4.5
top_data.size_y = 10.5
top_data.color = (1.0, 0.98, 0.96)
top_obj = bpy.data.objects.new("Assessment_Overhead", top_data)
top_obj.location = (0.0, -0.2, 7.5)
bpy.context.scene.collection.objects.link(top_obj)

# 2. Key Light (High-Output Commercial Vehicle Key)
key_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_data.energy = 5500
key_data.size = 7.5
key_obj = bpy.data.objects.new("Assessment_KeyLight", key_data)
key_obj.location = (7.8, 7.5, 5.0)
key_obj.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_obj)

# 3. Fill Light (Soft cool shadow fill)
fill_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_data.energy = 3200
fill_data.size = 9.0
fill_data.color = (0.88, 0.92, 1.0)
fill_obj = bpy.data.objects.new("Assessment_FillLight", fill_data)
fill_obj.location = (-7.8, 4.0, 4.2)
fill_obj.rotation_euler = Euler((math.radians(40), math.radians(-20), math.radians(-50)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_obj)

# 4. Rear Rim Light (Emphasizes 7" chrome stacks and sleeper silhouette)
rim_data = bpy.data.lights.new(name="Assessment_RimLight", type='AREA')
rim_data.energy = 4500
rim_data.size = 6.0
rim_data.color = (1.0, 0.95, 0.90)
rim_obj = bpy.data.objects.new("Assessment_RimLight", rim_data)
rim_obj.location = (-5.5, -7.5, 4.8)
rim_obj.rotation_euler = Euler((math.radians(-40), math.radians(25), math.radians(140)), 'XYZ')
bpy.context.scene.collection.objects.link(rim_obj)

# Studio Floor Turntable with subtle reflection
mesh_ground = bpy.data.meshes.new("Studio_Ground_Mesh")
ground_obj = bpy.data.objects.new("Studio_Ground", mesh_ground)
bpy.context.scene.collection.objects.link(ground_obj)

v0 = (-18.0, -18.0, 0.0)
v1 = ( 18.0, -18.0, 0.0)
v2 = ( 18.0,  18.0, 0.0)
v3 = (-18.0,  18.0, 0.0)
mesh_ground.from_pydata([v0, v1, v2, v3], [], [(0, 1, 2, 3)])
mesh_ground.update()

mat_ground = bpy.data.materials.new(name="Studio_Ground_Material")
mat_ground.use_nodes = True
bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.055, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.35
    bsdf.inputs["Metallic"].default_value = 0.15
ground_obj.data.materials.append(mat_ground)

# Render Settings
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100

# Color Management
scene.view_settings.view_transform = 'AgX' if 'AgX' in [t.name for t in bpy.types.ColorManagedViewSettings.bl_rna.properties['view_transform'].enum_items] else 'Filmic'
scene.view_settings.look = 'Medium High Contrast'

cam_data = bpy.data.cameras.new(name="Assessment_Camera")
cam_data.lens = 65.0
cam_data.sensor_width = 36.0
cam_data.clip_start = 0.1
cam_data.clip_end = 150.0
cam_obj = bpy.data.objects.new("Assessment_Camera", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

def setup_camera(pos, target, lens=65.0):
    cam_obj.location = Vector(pos)
    cam_data.lens = lens
    direction = Vector(target) - Vector(pos)
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

views = [
    {
        "name": "peterbilt_379_front_three_quarter.png",
        "cam_pos": (9.8, 8.8, 3.2),
        "target": (0.0, 1.8, 1.8),
        "lens": 55.0,
        "desc": "Front 3/4 Hero View: 127\" Extended Hood, Texas 18\" drop bumper, dual 15\" Donaldson air cleaners, dual 7\" monster stacks, Alcoa wheels"
    },
    {
        "name": "peterbilt_379_rear_three_quarter.png",
        "cam_pos": (-10.2, -8.8, 3.2),
        "target": (0.0, -1.8, 1.8),
        "lens": 52.0,
        "desc": "Rear 3/4 View: Low Air Leaf tandem bogie, Holland sliding 5th wheel, stainless half-fenders, Peterbilt mudflaps, pylon Suzie lines"
    },
    {
        "name": "peterbilt_379_side_profile.png",
        "cam_pos": (14.5, -0.2, 2.2),
        "target": (0.0, -0.2, 1.8),
        "lens": 70.0,
        "desc": "Side Profile View: 265\" WB stance, 150-gal fuel tanks, diamond step lids, Unibilt 63\" UltraCab sleeper"
    },
    {
        "name": "peterbilt_379_front_elevation.png",
        "cam_pos": (0.0, 12.5, 2.1),
        "target": (0.0, 2.2, 1.8),
        "lens": 75.0,
        "desc": "Front Elevation View: Towering polished grille surround, red Peterbilt oval, split windshield, 14\" gangster visor, 5 bullet roof lights"
    },
    {
        "name": "peterbilt_379_rear_elevation.png",
        "cam_pos": (0.0, -13.0, 2.1),
        "target": (0.0, -2.5, 1.8),
        "lens": 75.0,
        "desc": "Rear Elevation View: Rear light bar with 4\" round LED stop lamps, pintle hitch, coiled Suzie lines, straight exhaust stack tips"
    }
]

print("=============================================================================")
print("RENDERING PETERBILT 379 ASSESSMENT VIEWS")
print("=============================================================================")

rendered_paths = []
for v in views:
    out_path = os.path.join(ARTIFACTS_DIR, v["name"])
    scene.render.filepath = out_path
    setup_camera(v["cam_pos"], v["target"], v["lens"])
    print(f"--> Rendering view: {v['name']} ({v['desc']})...")
    bpy.ops.render.render(write_still=True)
    rendered_paths.append(out_path)
    print(f"    [DONE] Wrote image to: {out_path}")

print("=============================================================================")
print("ALL 5 PETERBILT 379 ASSESSMENT SHOTS RENDERED SUCCESSFULLY!")
print("=============================================================================")
