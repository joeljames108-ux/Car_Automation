"""
Premium Studio Multi-Angle Showcase Renderer for Executive Sedan (Blender 4.x / 5.x)
Renders 6 clean angles on a bright, premium studio light background.
"""

import bpy
import os
import math
import shutil
from mathutils import Vector

PROJECT_DIR = r"E:\Car_Automation"
OUTPUT_DIR = os.path.join(PROJECT_DIR, "renders", "sedan")
PUBLIC_RENDERS_DIR = os.path.join(PROJECT_DIR, "public", "renders", "sedan")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PUBLIC_RENDERS_DIR, exist_ok=True)

def render_showcase(resolution_x=1280, resolution_y=720):
    print("=" * 70)
    print(f"[SEDAN_RENDER] RENDERING LIGHT-BACKGROUND STUDIO SHOWCASE ({resolution_x}x{resolution_y})...")
    print("=" * 70)
    
    scene = bpy.context.scene
    scene.render.resolution_x = resolution_x
    scene.render.resolution_y = resolution_y
    scene.render.image_settings.file_format = 'PNG'
    
    # Fast viewport-quality rendering
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, "RenderEngineEEVEENext") else 'BLENDER_EEVEE'
    if hasattr(scene, "eevee"):
        if hasattr(scene.eevee, "taa_render_samples"):
            scene.eevee.taa_render_samples = 16
        if hasattr(scene.eevee, "use_raytracing"):
            scene.eevee.use_raytracing = True

    # Calculate vehicle center & bounds
    meshes = [o for o in bpy.data.objects if o.type == 'MESH' and not o.name.startswith("STUDIO_")]
    all_corners = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    min_x = min(c.x for c in all_corners)
    max_x = max(c.x for c in all_corners)
    min_y = min(c.y for c in all_corners)
    max_y = max(c.y for c in all_corners)
    min_z = min(c.z for c in all_corners)
    max_z = max(c.z for c in all_corners)
    
    cx = (min_x + max_x) / 2.0
    cy = (min_y + max_y) / 2.0
    cz = (min_z + max_z) / 2.0
    max_dim = max(max_x - min_x, max_y - min_y, max_z - min_z)
    target = Vector((cx, cy, cz * 0.75))

    # Configure Bright Premium Light Studio World Background
    world = bpy.data.worlds.get("SedanLightStudioWorld")
    if not world:
        world = bpy.data.worlds.new("SedanLightStudioWorld")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        # Bright, clean studio light grey/white background
        bg.inputs[0].default_value = (0.88, 0.90, 0.93, 1.0)
        bg.inputs[1].default_value = 1.25

    # Clear old studio lights & camera & floor
    for o in list(bpy.data.objects):
        if o.name.startswith("STUDIO_"):
            bpy.data.objects.remove(o, do_unlink=True)

    # 1. Studio Floor Plane (Matte white/light grey ground)
    mesh_floor = bpy.data.meshes.new("STUDIO_Floor_Mesh")
    obj_floor = bpy.data.objects.new("STUDIO_Floor", mesh_floor)
    scene.collection.objects.link(obj_floor)
    import bmesh
    bm_fl = bmesh.new()
    bmesh.ops.create_grid(bm_fl, x_segments=2, y_segments=2, size=25.0)
    bm_fl.to_mesh(mesh_floor)
    bm_fl.free()
    obj_floor.location = (cx, cy, min_z - 0.002)

    mat_floor = bpy.data.materials.get("STUDIO_Floor_Mat")
    if not mat_floor:
        mat_floor = bpy.data.materials.new("STUDIO_Floor_Mat")
        mat_floor.use_nodes = True
        bsdf_fl = mat_floor.node_tree.nodes.get("Principled BSDF")
        if bsdf_fl:
            bsdf_fl.inputs['Base Color'].default_value = (0.90, 0.92, 0.94, 1.0)
            bsdf_fl.inputs['Roughness'].default_value = 0.45
            bsdf_fl.inputs['Specular IOR Level' if 'Specular IOR Level' in bsdf_fl.inputs else 'Specular'].default_value = 0.2
    obj_floor.data.materials.append(mat_floor)

    # 2. Large Overhead Studio Softbox
    top_l = bpy.data.lights.new("STUDIO_TopLight", type='AREA')
    top_l.energy = 1400.0
    top_l.size = 8.0
    top_l.size_y = 6.0
    top_l.color = (1.0, 0.98, 0.95)
    top_obj = bpy.data.objects.new("STUDIO_TopLight", top_l)
    scene.collection.objects.link(top_obj)
    top_obj.location = (cx, cy, cz + 4.5)

    # 3. Front Key Light
    key_l = bpy.data.lights.new("STUDIO_KeyLight", type='AREA')
    key_l.energy = 850.0
    key_l.size = 4.5
    key_l.color = (1.0, 0.97, 0.94)
    key_obj = bpy.data.objects.new("STUDIO_KeyLight", key_l)
    scene.collection.objects.link(key_obj)
    key_obj.location = (cx + 4.2, cy + 4.8, cz + 2.6)

    # 4. Side Soft Fill
    fill_l = bpy.data.lights.new("STUDIO_FillLight", type='AREA')
    fill_l.energy = 600.0
    fill_l.size = 6.0
    fill_l.color = (0.94, 0.96, 1.0)
    fill_obj = bpy.data.objects.new("STUDIO_FillLight", fill_l)
    scene.collection.objects.link(fill_obj)
    fill_obj.location = (cx - 5.5, cy - 1.2, cz + 2.2)

    # 5. Rear Rim Light
    rim_l = bpy.data.lights.new("STUDIO_RimLight", type='AREA')
    rim_l.energy = 750.0
    rim_l.size = 4.5
    rim_l.color = (0.95, 0.98, 1.0)
    rim_obj = bpy.data.objects.new("STUDIO_RimLight", rim_l)
    scene.collection.objects.link(rim_obj)
    rim_obj.location = (cx + 2.5, cy - 5.5, cz + 2.2)

    # 6. Studio Camera
    cam_data = bpy.data.cameras.new("STUDIO_Camera")
    cam_data.lens = 50
    cam_obj = bpy.data.objects.new("STUDIO_Camera", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    def point_at(cam, tgt):
        direction = tgt - cam.location
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam.rotation_euler = rot_quat.to_euler()

    views = [
        ("sedan_showcase_isometric.png", Vector((cx + max_dim * 0.95, cy + max_dim * 0.92, cz + max_dim * 0.35))),
        ("sedan_showcase_front.png", Vector((cx, cy + max_dim * 1.30, cz + 0.18))),
        ("sedan_showcase_side.png", Vector((cx + max_dim * 1.35, cy, cz + 0.15))),
        ("sedan_showcase_rear.png", Vector((cx, cy - max_dim * 1.30, cz + 0.22))),
        ("sedan_showcase_rear_34.png", Vector((cx + max_dim * 0.90, cy - max_dim * 0.95, cz + max_dim * 0.32))),
        ("sedan_showcase_top.png", Vector((cx + 0.05, cy - 0.10, cz + max_dim * 1.45))),
    ]

    rendered_files = []
    for filename, pos in views:
        cam_obj.location = pos
        point_at(cam_obj, target)
        out_path = os.path.join(OUTPUT_DIR, filename)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        rendered_files.append(out_path)
        
        # Copy to public renders
        pub_path = os.path.join(PUBLIC_RENDERS_DIR, filename)
        shutil.copyfile(out_path, pub_path)
        print(f"  ✓ Rendered on Light Background: {filename} ({os.path.getsize(out_path)/1024:.1f} KB)")

    # Clean up studio objects after rendering to leave mesh clean
    for o in list(bpy.data.objects):
        if o.name.startswith("STUDIO_"):
            bpy.data.objects.remove(o, do_unlink=True)

    print("=" * 70)
    print(f"[SEDAN_RENDER] All {len(views)} light-background studio renders saved.")
    print("=" * 70)
    return rendered_files

if __name__ == "__main__":
    render_showcase()
