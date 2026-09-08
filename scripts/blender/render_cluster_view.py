"""
Renders a photorealistic studio view of the Instrument Cluster GLB
matching "UNDERSTANDING YOUR DASHBOARD".
"""
import bpy
import math
import os
from mathutils import Vector, Euler

def render_cluster_preview():
    glb_path = os.path.abspath("public/models/interior/instrument_cluster_master.glb")
    out_img = os.path.abspath("C:/Users/acer/.gemini/antigravity-ide/brain/6b65af10-4dec-4c71-90b8-d02c18319690/instrument_cluster_preview.png")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Setup Camera facing the cluster directly
    cam_data = bpy.data.cameras.new("ClusterCam")
    cam_data.lens = 55
    cam_data.clip_start = 0.05
    cam_obj = bpy.data.objects.new("ClusterCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    cam_loc = Vector((0.0, -0.68, 0.0))
    cam_target = Vector((0.0, 0.0, 0.0))
    cam_obj.location = cam_loc
    direction = (cam_target - cam_loc).normalized()
    cam_obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

    # Dark studio environment with dramatic backlight
    world = bpy.data.worlds.new("ClusterWorld")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.015, 0.02, 0.03, 1.0)
        bg.inputs["Strength"].default_value = 0.25
    bpy.context.scene.world = world

    # Key light: Soft angled top rim light highlighting the cowl and chrome bezels
    top_rim = bpy.data.lights.new("TopRim", type='AREA')
    top_rim.energy = 8.0
    top_rim.color = (0.75, 0.88, 1.0)
    top_rim.size = 0.80
    rim_obj = bpy.data.objects.new("TopRim", top_rim)
    rim_obj.location = Vector((0.0, -0.30, 0.35))
    rim_obj.rotation_euler = Euler((math.radians(45), 0, 0), 'XYZ')
    bpy.context.scene.collection.objects.link(rim_obj)

    # Front soft fill for dials and needles
    front_fill = bpy.data.lights.new("FrontFill", type='POINT')
    front_fill.energy = 3.5
    front_fill.color = (1.0, 0.98, 0.95)
    front_fill.shadow_soft_size = 0.20
    fill_obj = bpy.data.objects.new("FrontFill", front_fill)
    fill_obj.location = Vector((0.0, -0.50, 0.0))
    bpy.context.scene.collection.objects.link(fill_obj)

    # Render settings
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 64
    bpy.context.scene.render.resolution_x = 1280
    bpy.context.scene.render.resolution_y = 720
    bpy.context.scene.render.image_settings.file_format = 'PNG'
    bpy.context.scene.render.filepath = out_img

    try:
        bpy.context.scene.view_settings.view_transform = 'AgX'
        bpy.context.scene.view_settings.look = 'High Contrast'
    except Exception:
        bpy.context.scene.view_settings.view_transform = 'Filmic'

    print(f"Rendering Instrument Cluster preview to {out_img}...")
    bpy.ops.render.render(write_still=True)
    print("Cluster preview render complete.")

if __name__ == "__main__":
    render_cluster_preview()
