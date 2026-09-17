"""
Render validation views for Supercars (Countach, F40, McLaren F1, Ford GT, 458 Italia, Revuelto, McMurtry)
"""
import bpy
import math
import os
from mathutils import Vector, Euler

ARTIFACT_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\8f138254-bc87-4151-bc67-d8d2f7377d28"
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

CARS = [
    ("1970s", "supercar_countach_f34.png", Vector((3.6, -3.8, 1.8))),
    ("1980s", "supercar_f40_f34.png", Vector((3.8, -4.0, 1.9))),
    ("1990s", "supercar_mclaren_f1_f34.png", Vector((3.7, -3.9, 1.8))),
    ("2020s", "supercar_revuelto_f34.png", Vector((4.0, -4.2, 1.9))),
]

def setup_studio():
    # Remove existing lights and cameras
    for o in list(bpy.data.objects):
        if o.type in ['LIGHT', 'CAMERA']:
            bpy.data.objects.remove(o, do_unlink=True)

    # Key light
    key_data = bpy.data.lights.new(name="Key_Light", type='AREA')
    key_data.energy = 1500
    key_data.size = 5.0
    key_data.color = (1.0, 0.98, 0.95)
    key_obj = bpy.data.objects.new("Key_Light", key_data)
    key_obj.location = (4.0, 4.0, 5.0)
    bpy.context.scene.collection.objects.link(key_obj)

    # Rim light
    rim_data = bpy.data.lights.new(name="Rim_Light", type='AREA')
    rim_data.energy = 2200
    rim_data.size = 6.0
    rim_data.color = (0.85, 0.92, 1.0)
    rim_obj = bpy.data.objects.new("Rim_Light", rim_data)
    rim_obj.location = (-4.0, -5.0, 4.0)
    bpy.context.scene.collection.objects.link(rim_obj)

    # Fill light
    fill_data = bpy.data.lights.new(name="Fill_Light", type='AREA')
    fill_data.energy = 800
    fill_data.size = 4.0
    fill_obj = bpy.data.objects.new("Fill_Light", fill_data)
    fill_obj.location = (-4.0, 3.0, 3.0)
    bpy.context.scene.collection.objects.link(fill_obj)

    # Camera
    cam_data = bpy.data.cameras.new(name="StudioCam")
    cam_data.lens = 55 # 55mm portrait/automotive lens
    cam_obj = bpy.data.objects.new("StudioCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Render settings
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    scene.render.resolution_x = 960
    scene.render.resolution_y = 540
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'

    return cam_obj

def render_car(era_id, filename, cam_pos):
    glb_path = os.path.join(ROOT_DIR, "public", "models", "vehicles", "supercar", era_id, "vehicle.glb")
    if not os.path.exists(glb_path):
        print(f"GLB not found: {glb_path}")
        return

    # Clear mesh objects
    for o in list(bpy.data.objects):
        if o.type not in ['LIGHT', 'CAMERA']:
            bpy.data.objects.remove(o, do_unlink=True)
    for m in list(bpy.data.meshes):
        bpy.data.meshes.remove(m, do_unlink=True)

    # Import GLB
    bpy.ops.import_scene.gltf(filepath=glb_path)

    cam = bpy.context.scene.camera
    cam.location = cam_pos
    # Look at center of vehicle (0, 0, 0.55)
    target = Vector((0.0, 0.0, 0.55))
    direction = target - cam_pos
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

    out_path = os.path.join(ARTIFACT_DIR, filename)
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered: {out_path}")

if __name__ == "__main__":
    setup_studio()
    for era_id, fname, pos in CARS:
        render_car(era_id, fname, pos)
