"""
Blender 5.2 Cycles Renderer for Upgraded Automotive Cockpit Interiors.
Renders high-resolution beauty shots of executive luxury and hypercar track cockpits.
"""

import bpy
import math
import os
import sys
from mathutils import Vector

def render_cockpit(glb_rel_path, out_png_name, title="Cockpit"):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    glb_path = os.path.abspath(glb_rel_path)
    if not os.path.exists(glb_path):
        print(f"[ERROR] Asset not found: {glb_path}")
        return
        
    print(f"\n[RENDER] Importing {glb_path}...")
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    # Camera setup: Elevated 3/4 perspective looking into the cabin
    cam_data = bpy.data.cameras.new("CockpitCam")
    cam_data.lens = 42
    cam = bpy.data.objects.new("CockpitCam", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    
    # Position camera looking into passenger/driver compartment from rear-quarter high angle
    cam.location = Vector((1.35, -1.35, 1.45))
    target = Vector((0.0, 0.15, 0.68))
    direction = target - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()
    
    # Studio lighting setup tailored for interior luxury finishes
    # Key light (soft diffused cabin fill from above)
    light_key = bpy.data.lights.new("KeyLight", type='AREA')
    light_key.energy = 380
    light_key.size = 2.5
    light_key.color = (0.98, 0.96, 0.94)
    obj_key = bpy.data.objects.new("KeyLight", light_key)
    obj_key.location = Vector((0.8, -0.5, 2.2))
    bpy.context.scene.collection.objects.link(obj_key)
    
    # Dash fill light (highlights instrument cluster & console)
    light_fill = bpy.data.lights.new("DashFill", type='AREA')
    light_fill.energy = 220
    light_fill.size = 1.8
    light_fill.color = (0.85, 0.92, 1.0)
    obj_fill = bpy.data.objects.new("DashFill", light_fill)
    obj_fill.location = Vector((-0.9, 0.6, 1.5))
    bpy.context.scene.collection.objects.link(obj_fill)
    
    # Rim light (accents leather bolsters & carbon weave)
    light_rim = bpy.data.lights.new("RimLight", type='AREA')
    light_rim.energy = 260
    light_rim.color = (0.95, 0.90, 0.85)
    obj_rim = bpy.data.objects.new("RimLight", light_rim)
    obj_rim.location = Vector((-1.4, -1.2, 1.6))
    bpy.context.scene.collection.objects.link(obj_rim)
    
    # Dark studio environment
    bpy.context.scene.world = bpy.data.worlds.new("StudioWorld")
    bg = bpy.context.scene.world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.015, 0.018, 0.025, 1.0)
        bg.inputs["Strength"].default_value = 0.4
        
    # Render settings: Cycles CPU
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 32
    scene.cycles.adaptive_threshold = 0.05
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 800
    scene.render.image_settings.file_format = 'PNG'
    
    out_img = os.path.abspath(f"exports/{out_png_name}")
    os.makedirs(os.path.dirname(out_img), exist_ok=True)
    scene.render.filepath = out_img
    
    print(f"[RENDER] Rendering {title} to {out_img}...")
    bpy.ops.render.render(write_still=True)
    size_kb = os.path.getsize(out_img) / 1024
    print(f"[RENDER COMPLETE] {out_img} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    render_cockpit("public/models/interior/cockpit_luxury_executive.glb", "interior_executive_render.png", "Executive Luxury Cockpit")
    render_cockpit("public/models/interior/cockpit_hypercar_carbon.glb", "interior_hypercar_render.png", "Hypercar Track Cockpit")
    render_cockpit("public/models/interior/cockpit_gt3_competition.glb", "interior_gt3_render.png", "GT3 Competition Cockpit")
