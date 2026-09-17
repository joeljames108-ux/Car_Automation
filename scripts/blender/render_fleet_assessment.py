"""
Render validation views for Supercars and Hypercars (Front 3/4 Perspective)
+Y is Forward, +Z is Up, +X is Driver Side (LHD)
Camera should be at (+X, +Y, +Z) looking toward vehicle center.
"""
import bpy
import math
import os
from mathutils import Vector, Euler

ARTIFACT_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\8f138254-bc87-4151-bc67-d8d2f7377d28"
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

RENDER_QUEUE = [
    # (architecture, era, filename, cam_pos, target)
    ("supercar", "1970s", "supercar_countach_front34.png", Vector((3.6, 4.2, 1.5)), Vector((0.0, 0.2, 0.45))),
    ("supercar", "1980s", "supercar_f40_front34.png", Vector((3.7, 4.3, 1.5)), Vector((0.0, 0.2, 0.45))),
    ("supercar", "1990s", "supercar_mclaren_f1_front34.png", Vector((3.6, 4.1, 1.5)), Vector((0.0, 0.2, 0.45))),
    ("supercar", "2020s", "supercar_revuelto_front34.png", Vector((3.8, 4.4, 1.5)), Vector((0.0, 0.2, 0.45))),
    ("hypercar", "2000s", "hypercar_veyron_front34.png", Vector((3.7, 4.3, 1.5)), Vector((0.0, 0.2, 0.45))),
    ("hypercar", "2020s", "hypercar_chiron_front34.png", Vector((3.8, 4.4, 1.5)), Vector((0.0, 0.2, 0.45))),
    ("hypercar", "future", "hypercar_jesko_front34.png", Vector((3.8, 4.4, 1.5)), Vector((0.0, 0.2, 0.45))),
]

def setup_studio():
    for o in list(bpy.data.objects):
        if o.type in ['LIGHT', 'CAMERA']:
            bpy.data.objects.remove(o, do_unlink=True)

    # Key light (illuminates front 3/4)
    key_data = bpy.data.lights.new(name="Key_Light", type='AREA')
    key_data.energy = 2200
    key_data.size = 6.0
    key_data.color = (1.0, 0.98, 0.95)
    key_obj = bpy.data.objects.new("Key_Light", key_data)
    key_obj.location = (4.5, 4.5, 5.0)
    bpy.context.scene.collection.objects.link(key_obj)

    # Rim light (illuminates rear haunch / roofline)
    rim_data = bpy.data.lights.new(name="Rim_Light", type='AREA')
    rim_data.energy = 2500
    rim_data.size = 6.0
    rim_data.color = (0.85, 0.92, 1.0)
    rim_obj = bpy.data.objects.new("Rim_Light", rim_data)
    rim_obj.location = (-4.5, -4.5, 4.0)
    bpy.context.scene.collection.objects.link(rim_obj)

    # Front fill light
    fill_data = bpy.data.lights.new(name="Fill_Light", type='AREA')
    fill_data.energy = 1000
    fill_data.size = 5.0
    fill_obj = bpy.data.objects.new("Fill_Light", fill_data)
    fill_obj.location = (-3.5, 4.5, 3.5)
    bpy.context.scene.collection.objects.link(fill_obj)

    # Camera
    cam_data = bpy.data.cameras.new(name="StudioCam")
    cam_data.lens = 55
    cam_obj = bpy.data.objects.new("StudioCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    scene.render.resolution_x = 960
    scene.render.resolution_y = 540
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'

    return cam_obj

def render_item(arch, era_id, filename, cam_pos, target):
    glb_path = os.path.join(ROOT_DIR, "public", "models", "vehicles", arch, era_id, "vehicle.glb")
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
    direction = target - cam_pos
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

    out_path = os.path.join(ARTIFACT_DIR, filename)
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"Successfully rendered: {out_path}")

if __name__ == "__main__":
    setup_studio()
    for arch, era_id, fname, pos, target in RENDER_QUEUE:
        render_item(arch, era_id, fname, pos, target)
