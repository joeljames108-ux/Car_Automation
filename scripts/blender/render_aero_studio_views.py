"""
Renders photorealistic preview images of the Aero Studio 3D GLBs
matching the camera presets defined in the master specification.
Outputs images to the brain artifact directory for visual inspection.
"""

import bpy
import math
import os
from mathutils import Vector, Euler

ARTIFACT_DIR = "C:/Users/acer/.gemini/antigravity-ide/brain/6b65af10-4dec-4c71-90b8-d02c18319690"
AERO_DIR = os.path.abspath("public/models/aero")

def setup_studio_environment():
    # World background dark studio
    world = bpy.data.worlds.new("AeroStudioWorld")
    world.use_nodes = True
    bpy.context.scene.world = world
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.015, 0.02, 0.035, 1.0)
        bg.inputs["Strength"].default_value = 0.5

    # Studio Lights
    # Key light
    key = bpy.data.lights.new("KeyLight", type="AREA")
    key.energy = 850.0
    key.size = 5.0
    key.color = (0.95, 0.98, 1.0)
    key_obj = bpy.data.objects.new("KeyLight", key)
    key_obj.location = Vector((4.5, 4.5, 4.0))
    key_obj.rotation_euler = (math.radians(45), math.radians(15), math.radians(-35))
    bpy.context.scene.collection.objects.link(key_obj)

    # Rim light (Aero Cyan)
    rim = bpy.data.lights.new("RimLight", type="AREA")
    rim.energy = 650.0
    rim.size = 4.0
    rim.color = (0.0, 0.85, 1.0)
    rim_obj = bpy.data.objects.new("RimLight", rim)
    rim_obj.location = Vector((-4.5, -4.5, 3.5))
    rim_obj.rotation_euler = (math.radians(-50), math.radians(-20), math.radians(140))
    bpy.context.scene.collection.objects.link(rim_obj)

    # Fill light
    fill = bpy.data.lights.new("FillLight", type="AREA")
    fill.energy = 350.0
    fill.size = 6.0
    fill.color = (0.85, 0.9, 1.0)
    fill_obj = bpy.data.objects.new("FillLight", fill)
    fill_obj.location = Vector((0.0, 0.0, 6.0))
    fill_obj.rotation_euler = (0, 0, 0)
    bpy.context.scene.collection.objects.link(fill_obj)

    # Floor grid reflection plane
    bpy.ops.mesh.primitive_plane_add(size=40.0, location=(0, 0, -0.01))
    floor = bpy.context.active_object
    floor.name = "Studio_Floor"
    mat = bpy.data.materials.new("StudioFloorMat")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.03, 0.04, 0.06, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.25
        bsdf.inputs["Metallic"].default_value = 0.6
    floor.data.materials.append(mat)

def frame_objects(objects, fov_deg=36, view_dir=Vector((1.0, 1.0, 0.5)), margin=1.15):
    corners = []
    for obj in objects:
        if obj.type == 'MESH':
            for c in obj.bound_box:
                corners.append(obj.matrix_world @ Vector(c))
    if not corners:
        return Vector((5, 5, 3)), Vector((0, 0, 0.5))

    min_c = Vector((min(c[0] for c in corners), min(c[1] for c in corners), min(c[2] for c in corners)))
    max_c = Vector((max(c[0] for c in corners), max(c[1] for c in corners), max(c[2] for c in corners)))
    center = (min_c + max_c) * 0.5
    radius = (max_c - min_c).length * 0.5
    dist = (radius * margin) / math.sin(math.radians(fov_deg * 0.5))
    cam_pos = center + view_dir.normalized() * dist
    return cam_pos, center

def set_camera(location, target, fov=36):
    cam = bpy.context.scene.camera
    if not cam:
        cam_data = bpy.data.cameras.new("RenderCam")
        cam = bpy.data.objects.new("RenderCam", cam_data)
        bpy.context.scene.collection.objects.link(cam)
        bpy.context.scene.camera = cam

    cam.location = Vector(location)
    direction = (Vector(target) - Vector(location)).normalized()
    cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    cam.data.angle = math.radians(fov)
    cam.data.clip_start = 0.1
    cam.data.clip_end = 100.0

def configure_render():
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'

def render_view(name, camera_pos, camera_target, fov=36):
    set_camera(camera_pos, camera_target, fov)
    out_path = os.path.join(ARTIFACT_DIR, f"{name}.png")
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"[Rendered] {out_path}")

def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    configure_render()
    setup_studio_environment()

    # Import Host Chassis
    chassis_glb = os.path.join(AERO_DIR, "AERO_HOST_CHASSIS_001.glb")
    if os.path.exists(chassis_glb):
        bpy.ops.import_scene.gltf(filepath=chassis_glb)

    # Import All Aero GLBs
    aero_glbs = [
        "AERO_FRONT_SPLITTER_001.glb",
        "AERO_CANARD_001.glb",
        "AERO_SIDE_SKIRT_001.glb",
        "AERO_REAR_WING_001.glb",
        "AERO_DIFFUSER_001.glb",
        "AERO_UNDERBODY_001.glb",
        "AERO_ROOF_AERO_001.glb",
        "AERO_COOLING_AERO_001.glb",
        "AERO_WHEEL_AERO_001.glb",
    ]

    for g in aero_glbs:
        p = os.path.join(AERO_DIR, g)
        if os.path.exists(p):
            bpy.ops.import_scene.gltf(filepath=p)

    all_meshes = [o for o in bpy.data.objects if o.type == 'MESH' and o.name != 'Studio_Floor']

    # 1. Master Full-Car Aerodynamic Overview (Elevated 3/4 Hero View)
    cam_pos, target = frame_objects(all_meshes, fov_deg=36, view_dir=Vector((1.4, 1.2, 0.7)), margin=1.15)
    render_view("aero_studio_full_car_overview", cam_pos, target, fov=36)

    # 2. Rear Wing Focused Inspection View
    wing_objs = [o for o in all_meshes if "RearWing" in o.name]
    if wing_objs:
        cam_pos, target = frame_objects(wing_objs, fov_deg=32, view_dir=Vector((1.1, -1.3, 0.8)), margin=1.2)
        render_view("aero_studio_rear_wing_inspection", cam_pos, target, fov=32)

    # 3. Front Splitter & Canards Dynamic 3/4 View
    front_objs = [o for o in all_meshes if "FrontSplitter" in o.name or "Canard" in o.name]
    if front_objs:
        cam_pos, target = frame_objects(front_objs, fov_deg=34, view_dir=Vector((1.2, 1.2, 0.5)), margin=1.2)
        render_view("aero_studio_front_splitter_inspection", cam_pos, target, fov=34)

    # 4. Rear Diffuser & Underbody Strakes Low-Angle View
    diff_objs = [o for o in all_meshes if "Diffuser" in o.name or "Underbody" in o.name]
    if diff_objs:
        cam_pos, target = frame_objects(diff_objs, fov_deg=36, view_dir=Vector((1.0, -1.3, 0.35)), margin=1.2)
        render_view("aero_studio_diffuser_inspection", cam_pos, target, fov=36)

if __name__ == "__main__":
    main()
