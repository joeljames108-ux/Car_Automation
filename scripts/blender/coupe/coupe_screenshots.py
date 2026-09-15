"""
Bentley Continental GT II Coupe (2011) Automated Multi-Angle Screenshot Suite (Blender 5.2 LTS)
Renders high-resolution studio viewport captures across all automotive validation angles.
"""

import bpy
import math
import os
from mathutils import Vector, Euler

OUTPUT_DIR = r"C:\Users\joelj\.gemini\antigravity-ide\brain\71f60dcd-8058-4911-8400-0b607a565735"

def setup_studio_environment():
    """Configure automotive studio lighting with softboxes and neutral floor ground reflection."""
    # Configure World Background for crisp ambient reflection
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("Studio_World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs["Color"].default_value = (0.14, 0.15, 0.17, 1.0)
        bg_node.inputs["Strength"].default_value = 1.0
        
    # Ensure lighting collection
    light_col = bpy.data.collections.get("Studio_Lighting")
    if not light_col:
        light_col = bpy.data.collections.new("Studio_Lighting")
        bpy.context.scene.collection.children.link(light_col)
        
    # Clear existing lights
    for obj in list(light_col.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
        
    # 1. Overhead Master Softbox (Balanced ambient ceiling softbox)
    top_light_data = bpy.data.lights.new(name="Studio_Overhead_Softbox", type='AREA')
    top_light_data.energy = 1400
    top_light_data.shape = 'RECTANGLE'
    top_light_data.size = 3.5
    top_light_data.size_y = 6.0
    top_light_data.color = (1.0, 0.98, 0.95)
    top_light = bpy.data.objects.new("Studio_Overhead_Softbox", top_light_data)
    top_light.location = (0.0, 0.0, 4.8)
    top_light.rotation_euler = (0.0, 0.0, 0.0)
    light_col.objects.link(top_light)

    
    # 2. Left Side Strip Softbox (Defines Continental Powerline & Haunch)
    left_strip_data = bpy.data.lights.new(name="Studio_Left_Strip", type='AREA')
    left_strip_data.energy = 1200
    left_strip_data.shape = 'RECTANGLE'
    left_strip_data.size = 1.0
    left_strip_data.size_y = 6.5
    left_strip_data.color = (0.95, 0.98, 1.0)
    left_strip = bpy.data.objects.new("Studio_Left_Strip", left_strip_data)
    left_strip.location = (4.2, 0.0, 1.8)
    left_strip.rotation_euler = (0.0, math.radians(-75), 0.0)
    light_col.objects.link(left_strip)
    
    # 3. Right Side Strip Softbox
    right_strip_data = bpy.data.lights.new(name="Studio_Right_Strip", type='AREA')
    right_strip_data.energy = 1200
    right_strip_data.shape = 'RECTANGLE'
    right_strip_data.size = 1.0
    right_strip_data.size_y = 6.5
    right_strip_data.color = (0.95, 0.98, 1.0)
    right_strip = bpy.data.objects.new("Studio_Right_Strip", right_strip_data)
    right_strip.location = (-4.2, 0.0, 1.8)
    right_strip.rotation_euler = (0.0, math.radians(75), 0.0)
    light_col.objects.link(right_strip)
    
    # 4. Front Fascia Fill Softbox (Illuminates Matrix Grille & Headlights)
    front_soft_data = bpy.data.lights.new(name="Studio_Front_Fill", type='AREA')
    front_soft_data.energy = 1400
    front_soft_data.shape = 'RECTANGLE'
    front_soft_data.size = 3.5
    front_soft_data.size_y = 2.0
    front_soft_data.color = (1.0, 0.97, 0.94)
    front_soft = bpy.data.objects.new("Studio_Front_Fill", front_soft_data)
    front_soft.location = (1.5, 4.8, 2.2)
    front_soft.rotation_euler = (math.radians(-35), math.radians(15), math.radians(-25))
    light_col.objects.link(front_soft)
    
    # 5. Rear 3/4 Fill Softbox
    rear_soft_data = bpy.data.lights.new(name="Studio_Rear_Fill", type='AREA')
    rear_soft_data.energy = 1100
    rear_soft_data.shape = 'RECTANGLE'
    rear_soft_data.size = 3.5
    rear_soft_data.size_y = 2.0
    rear_soft_data.color = (0.94, 0.97, 1.0)
    rear_soft = bpy.data.objects.new("Studio_Rear_Fill", rear_soft_data)
    rear_soft.location = (2.0, -5.0, 2.0)
    rear_soft.rotation_euler = (math.radians(35), math.radians(-15), math.radians(155))
    light_col.objects.link(rear_soft)
    
    # 6. Underbody Neutral Ground Shadow Plane
    mesh = bpy.data.meshes.new("Studio_Ground_Plane_Mesh")
    ground = bpy.data.objects.new("Studio_Ground_Plane", mesh)
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= 14.0
        v.co.y *= 14.0
        v.co.z *= 0.02
    bm.to_mesh(mesh)
    bm.free()
    ground.location = (0, 0, -0.01)
    light_col.objects.link(ground)
    
    ground_mat = bpy.data.materials.get("Mat_Studio_Floor")
    if not ground_mat:
        ground_mat = bpy.data.materials.new("Mat_Studio_Floor")
        ground_mat.use_nodes = True
        bsdf = ground_mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.04, 0.04, 0.045, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.45
    ground.data.materials.append(ground_mat)

def setup_camera():
    """Ensure a dedicated automotive studio camera exists."""
    cam = bpy.data.objects.get("Studio_Automotive_Camera")
    if not cam:
        cam_data = bpy.data.cameras.new("Studio_Automotive_Camera")
        cam = bpy.data.objects.new("Studio_Automotive_Camera", cam_data)
        bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    cam.data.lens = 60.0
    cam.data.clip_start = 0.1
    cam.data.clip_end = 100.0
    return cam

def point_camera_at(cam, target):
    """Orient camera to look directly at target point (X, Y, Z)."""
    loc = cam.location
    direction = target - loc
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

def capture_angles():
    """Capture all 5 core validation angles using EEVEE camera render."""
    setup_studio_environment()
    cam = setup_camera()
    
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 16
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    
    # 5 Key Automotive Validation Angles
    angles = [
        {
            "filename": "coupe_front_hero_3_4.png",
            "cam_loc": Vector((4.80, 4.40, 1.75)),
            "target": Vector((0.0, 0.35, 0.72)),
            "lens": 55.0
        },
        {
            "filename": "coupe_rear_3_4.png",
            "cam_loc": Vector((4.60, -4.80, 1.75)),
            "target": Vector((0.0, -0.35, 0.75)),
            "lens": 55.0
        },
        {
            "filename": "coupe_side_profile.png",
            "cam_loc": Vector((7.20, 0.0, 1.05)),
            "target": Vector((0.0, 0.0, 0.70)),
            "lens": 65.0
        },
        {
            "filename": "coupe_front_fascia_close.png",
            "cam_loc": Vector((1.70, 3.80, 0.88)),
            "target": Vector((0.0, 2.15, 0.65)),
            "lens": 65.0
        },
        {
            "filename": "coupe_rear_fascia_close.png",
            "cam_loc": Vector((1.80, -3.80, 0.85)),
            "target": Vector((0.0, -2.15, 0.65)),
            "lens": 65.0
        }
    ]
    
    rendered_files = []
    for a in angles:
        out_path = os.path.join(OUTPUT_DIR, a["filename"])
        cam.location = a["cam_loc"]
        cam.data.lens = a["lens"]
        point_camera_at(cam, a["target"])
        scene.camera = cam
        scene.render.filepath = out_path
        
        print(f"[SCREENSHOT] Rendering camera angle {a['filename']} ...")
        try:
            bpy.ops.render.render(write_still=True)
        except Exception as e:
            print(f"[SCREENSHOT] Failed render for {a['filename']}: {e}")
            continue
                
        if os.path.exists(out_path):
            size_kb = os.path.getsize(out_path) / 1024.0
            print(f"[SCREENSHOT] Saved {a['filename']} ({size_kb:.1f} KB)")
            rendered_files.append(out_path)
            
    print(f"[SCREENSHOT] Successfully captured {len(rendered_files)}/{len(angles)} validation renders.")
    return rendered_files

if __name__ == "__main__":
    capture_angles()
