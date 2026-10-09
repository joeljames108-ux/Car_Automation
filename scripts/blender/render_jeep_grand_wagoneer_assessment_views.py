"""
=============================================================================
Autonomous Visual Feedback Loop: Jeep Grand Wagoneer (SJ, 1980s)
Generates 5 standard automotive validation viewpoints with accurate look-at
tracking, studio 3-point lighting, ground shadow floor, and 1080p rendering.
=============================================================================
"""

import bpy
import math
import os
import shutil
from mathutils import Vector, Euler, Matrix

# Destination directories
output_dirs = [
    r"C:\Users\acer\.gemini\antigravity-ide\brain\b4a77049-12bb-41b8-a852-bdc782fd07d7",
    r"e:\Car_Automation\assets\screenshots\jeep_grand_wagoneer"
]
for d in output_dirs:
    os.makedirs(d, exist_ok=True)

# Master GLB path
glb_path = r"e:\Car_Automation\public\models\Car_Jeep_Grand_Wagoneer_1980s_Complete.glb"

print("=" * 80)
print(f"LOADING VEHICLE #53: {glb_path}")
print("=" * 80)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

# Hide collision hitboxes so they don't occlude beauty geometry
for o in bpy.data.objects:
    if "hitbox" in o.name.lower():
        o.hide_render = True
        o.hide_viewport = True

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in dir(bpy.types) else 'BLENDER_EEVEE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.film_transparent = False

# --- World & Ambient Environment ---
world = bpy.data.worlds.new('GW_Assessment_World')
scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
nodes.clear()
bg = nodes.new('ShaderNodeBackground')
bg.inputs['Color'].default_value = (0.22, 0.23, 0.26, 1.0)
bg.inputs['Strength'].default_value = 1.0
output = nodes.new('ShaderNodeOutputWorld')
world.node_tree.links.new(bg.outputs['Background'], output.inputs['Surface'])

# --- Ground Studio Floor (Set to tire contact patch at Z = 0.00m) ---
bpy.ops.mesh.primitive_plane_add(size=45.0, location=(0.0, -1.5, 0.00))
obj_floor = bpy.context.active_object
obj_floor.name = "STUDIO_Floor"
mat_floor = bpy.data.materials.new(name="Mat_Studio_Floor")
mat_floor.use_nodes = True
f_nodes = mat_floor.node_tree.nodes
f_nodes.clear()
f_out = f_nodes.new(type='ShaderNodeOutputMaterial')
f_bsdf = f_nodes.new(type='ShaderNodeBsdfPrincipled')
f_bsdf.inputs['Base Color'].default_value = (0.06, 0.065, 0.075, 1.0)
f_bsdf.inputs['Roughness'].default_value = 0.38
if 'Specular IOR Level' in f_bsdf.inputs:
    f_bsdf.inputs['Specular IOR Level'].default_value = 0.35
elif 'Specular' in f_bsdf.inputs:
    f_bsdf.inputs['Specular'].default_value = 0.35
mat_floor.node_tree.links.new(f_bsdf.outputs['BSDF'], f_out.inputs['Surface'])
obj_floor.data.materials.append(mat_floor)

# --- Glass Transparency Setup for Viewport/EEVEE ---
for m in bpy.data.materials:
    if "glass" in m.name.lower():
        if hasattr(m, "blend_method"):
            m.blend_method = 'BLEND'
        if hasattr(m, "shadow_method"):
            m.shadow_method = 'NONE'
        if hasattr(m, "surface_render_method"):
            m.surface_render_method = 'DITHERED'
        if m.use_nodes:
            bsdf = m.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                if "Alpha" in bsdf.inputs:
                    bsdf.inputs["Alpha"].default_value = 0.26
                if "Roughness" in bsdf.inputs:
                    bsdf.inputs["Roughness"].default_value = 0.02
                if "Transmission Weight" in bsdf.inputs:
                    bsdf.inputs["Transmission Weight"].default_value = 0.94

# --- 3-Point Studio Lighting ---
def add_area_light(name, location, target_pos, energy=1500, size=7.0):
    bpy.ops.object.light_add(type='AREA', location=location)
    light = bpy.context.active_object
    light.name = name
    direction = target_pos - Vector(location)
    rot_quat = direction.to_track_quat('-Z', 'Y')
    light.rotation_euler = rot_quat.to_euler()
    light.data.energy = energy
    light.data.size = size
    return light

target_center = Vector((0.0, -1.4, 0.88))
add_area_light('Key_Light_Front', (6.0, 5.5, 5.2), target_center, energy=2000, size=7.0)
add_area_light('Fill_Light_Rear', (-6.0, -6.5, 4.8), target_center, energy=1400, size=8.0)
add_area_light('Rim_Light_Top', (0.0, -1.4, 8.0), target_center, energy=1200, size=9.0)
add_area_light('Side_Light_Right', (-7.5, 0.0, 3.8), target_center, energy=900, size=6.0)
add_area_light('Ground_Bounce', (0.0, -1.4, -0.2), target_center, energy=350, size=12.0)

# --- Camera Setup ---
cam_data = bpy.data.cameras.new(name="Assessment_Camera")
cam_data.lens = 55.0  # 55mm distortion-free automotive focal standard
cam_obj = bpy.data.objects.new(name="Assessment_Camera", object_data=cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

def set_camera_view(cam_obj, eye_pos, target_pos=Vector((0.0, -1.4, 0.88))):
    cam_obj.location = eye_pos
    direction = target_pos - eye_pos
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

validation_viewpoints = [
    {
        'filename': 'jeep_grand_wagoneer_front_three_quarter.png',
        'title': 'Front 3/4 Hero View (23-Slot Waterfall Grille, Sealed Beams, Teak Siding, Whitewalls)',
        'eye': Vector((5.2, 5.2, 2.3)),
        'target': Vector((0.0, 0.2, 0.85)),
    },
    {
        'filename': 'jeep_grand_wagoneer_rear_three_quarter.png',
        'title': 'Rear 3/4 View (Drop-Down Tailgate, Teak Woodgrain, Roof Luggage Rack, 3-Tier Taillamps)',
        'eye': Vector((5.2, -6.8, 2.3)),
        'target': Vector((0.0, -2.4, 0.85)),
    },
    {
        'filename': 'jeep_grand_wagoneer_side_profile.png',
        'title': 'Side Profile View (Full Teak Wood Siding, Extruded Chrome Moldings, 15" Gold Pocket Alloys)',
        'eye': Vector((9.8, -1.4, 1.4)),
        'target': Vector((0.0, -1.4, 0.85)),
    },
    {
        'filename': 'jeep_grand_wagoneer_front_elevation.png',
        'title': 'Front Elevation (Upright Chrome Prow, Stand-Up Hood Ornament, Bumper Fog Lamps)',
        'eye': Vector((0.0, 7.8, 1.3)),
        'target': Vector((0.0, 0.0, 0.80)),
    },
    {
        'filename': 'jeep_grand_wagoneer_rear_elevation.png',
        'title': 'Rear Elevation (Tailgate Defroster Glass, Jeep Script, Trailer Hitch, Chrome Bumper)',
        'eye': Vector((0.0, -8.4, 1.3)),
        'target': Vector((0.0, -3.2, 0.80)),
    },
]

print("\n" + "=" * 80)
print("EXECUTING AUTONOMOUS 5-VIEW ASSESSMENT RENDERS")
print("=" * 80)

for vp in validation_viewpoints:
    set_camera_view(cam_obj, vp['eye'], vp['target'])
    primary_out = os.path.join(output_dirs[0], vp['filename'])
    scene.render.filepath = primary_out
    print(f"Rendering: {vp['title']} -> {vp['filename']}")
    bpy.ops.render.render(write_still=True)
    f_size = os.path.getsize(primary_out)
    print(f"  ✓ Rendered: {primary_out} ({f_size:,} bytes)")
    for secondary_dir in output_dirs[1:]:
        sec_out = os.path.join(secondary_dir, vp['filename'])
        shutil.copyfile(primary_out, sec_out)
        print(f"  ✓ Replicated to: {sec_out}")

print("\n✓ All 5 assessment viewpoints successfully rendered and replicated!")
