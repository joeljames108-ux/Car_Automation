"""
=============================================================================
RENDER BMW 5 SERIES (E39) ASSESSMENT VIEWS
=============================================================================
Renders high-fidelity studio assessment shots for the 1990s Sedan:
1. Front 3/4 Hero (Twin kidney grilles, Angel Eyes corona rings, Style 32 wheels)
2. Rear 3/4 (L-shaped Celis taillights, Hofmeister kink, dual exhaust)
3. Side Profile (Athletic executive silhouette, C-pillar Hofmeister kink)
4. Front Elevation (Integrated hood kidneys, quad halo headlamps, fog lamps)
5. Rear Elevation (Celis neon rod taillights, trunk decklid, dual exhaust)
=============================================================================
"""

import bpy
import math
import os
from mathutils import Vector, Euler

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\acd43136-462b-4bcc-95d3-b92439716605"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# Remove any existing studio cameras/lights to avoid clutter
for obj in list(bpy.data.objects):
    if "Studio" in obj.name or "Assessment" in obj.name or "Light" in obj.name:
        bpy.data.objects.remove(obj, do_unlink=True)

# 1. World & Lighting
world = bpy.context.scene.world
if not world:
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs["Color"].default_value = (0.05, 0.05, 0.06, 1.0)
    bg_node.inputs["Strength"].default_value = 0.8

# Key Light
key_light_data = bpy.data.lights.new(name="Assessment_KeyLight", type='AREA')
key_light_data.energy = 1600
key_light_data.size = 6.0
key_light = bpy.data.objects.new("Assessment_KeyLight", key_light_data)
key_light.location = (5.2, 5.2, 5.0)
key_light.rotation_euler = Euler((math.radians(45), math.radians(15), math.radians(45)), 'XYZ')
bpy.context.scene.collection.objects.link(key_light)

# Fill Light
fill_light_data = bpy.data.lights.new(name="Assessment_FillLight", type='AREA')
fill_light_data.energy = 900
fill_light_data.size = 6.0
fill_light = bpy.data.objects.new("Assessment_FillLight", fill_light_data)
fill_light.location = (-5.2, 4.0, 4.0)
fill_light.rotation_euler = Euler((math.radians(35), math.radians(-20), math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(fill_light)

# Rim Light
rim_light_data = bpy.data.lights.new(name="Assessment_RimLight", type='SUN')
rim_light_data.energy = 4.5
rim_light = bpy.data.objects.new("Assessment_RimLight", rim_light_data)
rim_light.location = (0.0, -6.5, 4.0)
rim_light.rotation_euler = Euler((math.radians(120), 0, 0), 'XYZ')
bpy.context.scene.collection.objects.link(rim_light)

# Ground Shadow Plane
bm_plane = bpy.data.meshes.new("StudioGround")
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
ground_obj = bpy.context.active_object
ground_obj.name = "StudioGround"
mat_ground = bpy.data.materials.new("Ground_Mat")
mat_ground.use_nodes = True
g_bsdf = mat_ground.node_tree.nodes.get("Principled BSDF")
if g_bsdf:
    g_bsdf.inputs["Base Color"].default_value = (0.03, 0.03, 0.035, 1.0)
    g_bsdf.inputs["Roughness"].default_value = 0.5
ground_obj.data.materials.append(mat_ground)

# Camera Setup
cam_data = bpy.data.cameras.new("AssessmentCam")
cam_data.lens = 50.0
cam_data.clip_start = 0.1
cam_data.clip_end = 100.0
cam_obj = bpy.data.objects.new("AssessmentCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

# Render Settings
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'PNG'

# Balanced automotive camera positions for BMW E39 (Length 4.775m, Width 1.800m)
angles = [
    ("e39_front_three_quarter", (5.2, 5.2, 1.65), (0.0, 0.1, 0.68), 50.0),
    ("e39_rear_three_quarter", (5.2, -5.2, 1.65), (0.0, -0.1, 0.68), 50.0),
    ("e39_side_profile", (7.0, 0.0, 0.80), (0.0, 0.0, 0.68), 60.0),
    ("e39_front_elevation", (0.0, 6.2, 0.82), (0.0, 0.2, 0.68), 55.0),
    ("e39_rear_elevation", (0.0, -6.2, 0.82), (0.0, -0.2, 0.68), 55.0),
]

def look_at(cam, target):
    direction = Vector(target) - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

for name, loc, target, lens in angles:
    cam_obj.location = Vector(loc)
    cam_data.lens = lens
    look_at(cam_obj, target)
    
    out_file = os.path.join(ARTIFACTS_DIR, f"{name}.png")
    scene.render.filepath = out_file
    bpy.ops.render.render(write_still=True)
    print(f"[RENDERED] {name} -> {out_file} ({os.path.getsize(out_file)} bytes)")

# Clean up ground plane after render
bpy.data.objects.remove(ground_obj, do_unlink=True)
print("[COMPLETE] All 5 BMW 5 Series (E39) validation angles rendered successfully.")
