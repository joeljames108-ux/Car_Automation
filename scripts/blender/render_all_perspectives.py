"""
==============================================================================
AUTOMOTIVE 5-VIEW STUDIO SHOWCASE BATCH RENDERER (BLENDER 5.x)
==============================================================================
Renders 5 cinematic 1080p automotive beauty shots of the complete executive sedan:
1. Front 3/4 Hero View          -> 'exports/sedan_render.png'
2. Rear 3/4 Aero View           -> 'exports/sedan_render_rear.png'
3. Side Profile Silhouette      -> 'exports/sedan_render_side.png'
4. Interior Cockpit & VIP Cabin -> 'exports/sedan_render_interior.png'
5. Underbody Chassis & Hardware -> 'exports/sedan_render_chassis.png'
==============================================================================
"""

import bpy
import os
import math
from mathutils import Vector

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
out_dir = os.path.join(PROJECT_DIR, "exports")
os.makedirs(out_dir, exist_ok=True)

print("[STUDIO] Resetting scene...")
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
for col in list(bpy.data.collections):
    bpy.data.collections.remove(col)

glb_path = os.path.join(out_dir, "Car_Sedan_Complete.glb")
print(f"[STUDIO] Importing complete master vehicle model: {glb_path}...")
bpy.ops.import_scene.gltf(filepath=glb_path)

import bmesh
for obj in list(bpy.data.objects):
    if obj.type == 'MESH':
        bm = bmesh.new()
        bm.from_mesh(obj.data)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        for f in bm.faces:
            f.smooth = True
        bm.to_mesh(obj.data)
        bm.free()
        obj.data.update()

# Showroom Floor with gentle reflections
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
floor = bpy.context.active_object
floor.name = "Studio_Showroom_Floor"
floor_mat = bpy.data.materials.new("Mat_StudioFloor")
floor_mat.use_nodes = True
bsdf = floor_mat.node_tree.nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs['Base Color'].default_value = (0.008, 0.009, 0.012, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.14
    bsdf.inputs['Metallic'].default_value = 0.35
floor.data.materials.append(floor_mat)

# World background
world = bpy.context.scene.world
if world and world.node_tree:
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.015, 0.016, 0.020, 1.0)
        bg_node.inputs['Strength'].default_value = 0.35

# Render Engine Settings
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 28
scene.cycles.use_denoising = True
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100

# Color Management for rich, deep contrast
scene.view_settings.view_transform = 'AgX' if 'AgX' in [c.name for c in bpy.types.ColorManagedViewSettings.bl_rna.properties['view_transform'].enum_items] else 'Filmic'
scene.view_settings.look = 'High Contrast'
scene.view_settings.exposure = 0.15

def clear_lights_and_cameras():
    for obj in list(bpy.data.objects):
        if obj.type in {'CAMERA', 'LIGHT'} or obj.name.startswith("Cam_Target"):
            bpy.data.objects.remove(obj, do_unlink=True)

def add_area_light(name, location, rotation, energy, size_x, size_y, color=(1.0, 1.0, 1.0)):
    light_data = bpy.data.lights.new(name=name, type='AREA')
    light_data.energy = energy
    light_data.size = size_x
    light_data.size_y = size_y
    light_data.color = color
    light_obj = bpy.data.objects.new(name, light_data)
    bpy.context.scene.collection.objects.link(light_obj)
    light_obj.location = location
    light_obj.rotation_euler = rotation
    return light_obj

# ----------------------------------------------------------------------------
# PASS 1: FRONT 3/4 HERO BEAUTY SHOT
# ----------------------------------------------------------------------------
print("[PASS 1/5] Front 3/4 Hero perspective...")
clear_lights_and_cameras()

cam_target = bpy.data.objects.new("Cam_Target_Front", None)
bpy.context.scene.collection.objects.link(cam_target)
cam_target.location = (0.0, 0.6, 0.60)

cam_data = bpy.data.cameras.new("Cam_Front")
cam_data.lens = 52
cam_obj = bpy.data.objects.new("Cam_Front", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
cam_obj.location = (4.3, 4.0, 1.45)

track = cam_obj.constraints.new(type='TRACK_TO')
track.target = cam_target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'
scene.camera = cam_obj

add_area_light("Light_Ceiling_Strip", (0.0, 0.5, 4.8), (0, 0, 0), energy=1400, size_x=8.0, size_y=1.8, color=(0.96, 0.98, 1.0))
add_area_light("Light_Key_Shoulder", (3.8, 3.6, 2.2), (math.radians(-35), math.radians(20), math.radians(-35)), energy=950, size_x=3.5, size_y=1.5, color=(1.0, 0.98, 0.96))
add_area_light("Light_Fill_Soft", (-4.0, 2.0, 1.8), (math.radians(-25), math.radians(-35), math.radians(35)), energy=350, size_x=4.0, size_y=2.0, color=(0.88, 0.92, 1.0))
add_area_light("Light_Rocker_Kicker", (3.5, 0.5, 0.45), (math.radians(-10), math.radians(70), math.radians(-15)), energy=500, size_x=4.5, size_y=0.6, color=(0.95, 0.98, 1.0))
add_area_light("Light_Rear_Rim", (-1.2, -4.5, 3.0), (math.radians(55), math.radians(-15), 0), energy=1200, size_x=5.0, size_y=1.2, color=(0.92, 0.96, 1.0))

front_out = os.path.join(out_dir, "sedan_render.png")
scene.render.filepath = front_out
print(f"[PASS 1/5] Rendering to {front_out}...")
bpy.ops.render.render(write_still=True)
print(f"[PASS 1/5] Done: {front_out}")

# ----------------------------------------------------------------------------
# PASS 2: REAR 3/4 AERO SHOT
# ----------------------------------------------------------------------------
print("[PASS 2/5] Rear 3/4 perspective...")
clear_lights_and_cameras()

cam_target = bpy.data.objects.new("Cam_Target_Rear", None)
bpy.context.scene.collection.objects.link(cam_target)
cam_target.location = (0.0, -0.9, 0.70)

cam_data = bpy.data.cameras.new("Cam_Rear")
cam_data.lens = 52
cam_obj = bpy.data.objects.new("Cam_Rear", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
cam_obj.location = (4.1, -4.2, 1.45)

track = cam_obj.constraints.new(type='TRACK_TO')
track.target = cam_target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'
scene.camera = cam_obj

add_area_light("Light_Ceiling_Strip", (0.0, -0.5, 4.8), (0, 0, 0), energy=1400, size_x=8.0, size_y=1.8, color=(0.96, 0.98, 1.0))
add_area_light("Light_Rear_Key", (3.6, -3.8, 2.2), (math.radians(35), math.radians(20), math.radians(-145)), energy=950, size_x=3.5, size_y=1.5, color=(1.0, 0.98, 0.96))
add_area_light("Light_Fill_Passenger", (-3.8, -2.2, 1.8), (math.radians(25), math.radians(-35), math.radians(145)), energy=350, size_x=4.0, size_y=2.0, color=(0.88, 0.92, 1.0))
add_area_light("Light_Front_Rim", (0.8, 4.2, 2.8), (math.radians(-50), math.radians(15), 0), energy=1100, size_x=5.0, size_y=1.2, color=(0.92, 0.96, 1.0))

rear_out = os.path.join(out_dir, "sedan_render_rear.png")
scene.render.filepath = rear_out
print(f"[PASS 2/5] Rendering to {rear_out}...")
bpy.ops.render.render(write_still=True)
print(f"[PASS 2/5] Done: {rear_out}")

# ----------------------------------------------------------------------------
# PASS 3: SIDE PROFILE TELEPHOTO SILHOUETTE
# ----------------------------------------------------------------------------
print("[PASS 3/5] Side Profile silhouette...")
clear_lights_and_cameras()

cam_target = bpy.data.objects.new("Cam_Target_Side", None)
bpy.context.scene.collection.objects.link(cam_target)
cam_target.location = (0.0, 0.0, 0.65)

cam_data = bpy.data.cameras.new("Cam_Side")
cam_data.lens = 85
cam_obj = bpy.data.objects.new("Cam_Side", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
cam_obj.location = (8.2, 0.0, 1.25)

track = cam_obj.constraints.new(type='TRACK_TO')
track.target = cam_target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'
scene.camera = cam_obj

add_area_light("Light_Ceiling_Strip", (0.0, 0.0, 4.8), (0, 0, 0), energy=1400, size_x=9.0, size_y=1.8, color=(0.96, 0.98, 1.0))
add_area_light("Light_Side_Rim_Top", (4.2, 0.0, 3.2), (math.radians(-30), math.radians(45), 0), energy=800, size_x=7.0, size_y=1.2, color=(1.0, 0.98, 0.96))
add_area_light("Light_Side_Rocker", (4.2, 0.0, 0.4), (math.radians(15), math.radians(70), 0), energy=450, size_x=6.0, size_y=0.5, color=(0.92, 0.96, 1.0))
add_area_light("Light_Front_Accent", (3.2, 3.5, 1.5), (math.radians(-25), math.radians(35), math.radians(-40)), energy=500, size_x=2.5, size_y=1.5, color=(1.0, 0.95, 0.90))
add_area_light("Light_Rear_Accent", (3.2, -3.5, 1.5), (math.radians(25), math.radians(35), math.radians(-140)), energy=500, size_x=2.5, size_y=1.5, color=(1.0, 0.92, 0.92))

side_out = os.path.join(out_dir, "sedan_render_side.png")
scene.render.filepath = side_out
print(f"[PASS 3/5] Rendering to {side_out}...")
bpy.ops.render.render(write_still=True)
print(f"[PASS 3/5] Done: {side_out}")

# ----------------------------------------------------------------------------
# PASS 4: INTERIOR COCKPIT HERO (DRIVER & CONSOLE PERSPECTIVE)
# ----------------------------------------------------------------------------
print("[PASS 4/5] Interior Cockpit & VIP Cabin...")
clear_lights_and_cameras()

cam_target = bpy.data.objects.new("Cam_Target_Interior", None)
bpy.context.scene.collection.objects.link(cam_target)
cam_target.location = (0.0, 0.55, 0.65)

cam_data = bpy.data.cameras.new("Cam_Interior")
cam_data.lens = 32
cam_obj = bpy.data.objects.new("Cam_Interior", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
# Positioned slightly above and between driver & passenger seats for immersive cockpit view
cam_obj.location = (0.20, -0.20, 0.95)

track = cam_obj.constraints.new(type='TRACK_TO')
track.target = cam_target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'
scene.camera = cam_obj

add_area_light("Light_Sunroof_Skylight", (0.0, 0.2, 1.40), (0, 0, 0), energy=220, size_x=1.4, size_y=1.0, color=(0.95, 0.98, 1.0))
add_area_light("Light_Dash_Fill", (0.0, 0.85, 0.80), (math.radians(-45), 0, 0), energy=55, size_x=0.8, size_y=0.4, color=(1.0, 0.96, 0.92))
add_area_light("Light_Console_Glow", (0.0, 0.2, 0.65), (0, 0, 0), energy=35, size_x=0.5, size_y=0.3, color=(0.85, 0.92, 1.0))

interior_out = os.path.join(out_dir, "sedan_render_interior.png")
scene.render.filepath = interior_out
print(f"[PASS 4/5] Rendering to {interior_out}...")
bpy.ops.render.render(write_still=True)
print(f"[PASS 4/5] Done: {interior_out}")

# ----------------------------------------------------------------------------
# PASS 5: UNDERBODY CHASSIS & POWERTRAIN ARCHITECTURE (CUTAWAY PERSPECTIVE)
# ----------------------------------------------------------------------------
print("[PASS 5/5] Chassis & Powertrain Architecture View...")
clear_lights_and_cameras()

# Hide outer body panels to reveal the underlying EV skateboard chassis,
# battery pack, suspension, steering system, and VIP cabin
body_objs = [o for o in bpy.data.objects if o.type == 'MESH' and any(k in o.name.lower() for k in ["bodypaint", "corner", "cavity", "dhl", "antenn", "roof_glass", "windshield", "defogger"])]
for o in body_objs:
    o.hide_render = True

cam_target = bpy.data.objects.new("Cam_Target_Chassis", None)
bpy.context.scene.collection.objects.link(cam_target)
cam_target.location = (0.0, 0.0, 0.40)

cam_data = bpy.data.cameras.new("Cam_Chassis")
cam_data.lens = 48
cam_obj = bpy.data.objects.new("Cam_Chassis", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
cam_obj.location = (3.8, 3.2, 2.0)

track = cam_obj.constraints.new(type='TRACK_TO')
track.target = cam_target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'
scene.camera = cam_obj

add_area_light("Light_Chassis_Top", (0.0, 0.0, 4.5), (0, 0, 0), energy=1500, size_x=6.0, size_y=3.0, color=(0.95, 0.98, 1.0))
add_area_light("Light_Chassis_Key", (3.2, 2.8, 2.0), (math.radians(-35), math.radians(20), math.radians(-35)), energy=1000, size_x=3.5, size_y=2.0, color=(1.0, 0.98, 0.95))
add_area_light("Light_Chassis_Fill", (-3.5, -2.0, 1.8), (math.radians(35), math.radians(-20), math.radians(145)), energy=500, size_x=4.0, size_y=2.0, color=(0.90, 0.95, 1.0))

chassis_out = os.path.join(out_dir, "sedan_render_chassis.png")
scene.render.filepath = chassis_out
print(f"[PASS 5/5] Rendering to {chassis_out}...")
bpy.ops.render.render(write_still=True)
print(f"[PASS 5/5] Done: {chassis_out}")

for o in body_objs:
    o.hide_render = False

print("[STUDIO] All 5 multi-perspective studio beauty renders completed successfully!")
