import bpy
import math
import os
from mathutils import Vector, Euler

def render_full_cabin_cutaway():
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    out_dir = os.path.abspath("C:/Users/acer/.gemini/antigravity-ide/brain/c774af4c-ac14-4622-b3f7-1682dd510f06")
    out_file = os.path.join(out_dir, "interior_multi_row_showcase_cutaway.png")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Hide duplicate captain console for cleaner default bench look in showcase
    cap_console = bpy.data.objects.get("SEAT_ROW2_CAPTAIN_CONSOLE")
    if cap_console:
        cap_console.hide_render = True

    # Lighting setup
    world = bpy.data.worlds.new("InteriorWorld")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.6, 0.7, 0.82, 1.0)
        bg.inputs["Strength"].default_value = 0.9
    bpy.context.scene.world = world

    sun = bpy.data.lights.new("SunKey", type='SUN')
    sun.energy = 3.2
    sun.color = (1.0, 0.98, 0.94)
    sun_obj = bpy.data.objects.new("SunKey", sun)
    sun_obj.rotation_euler = Euler((math.radians(50), math.radians(20), math.radians(-35)), 'XYZ')
    bpy.context.scene.collection.objects.link(sun_obj)

    # Top soft area light
    top_area = bpy.data.lights.new("TopArea", type='AREA')
    top_area.energy = 22.0
    top_area.size = 2.4
    top_obj = bpy.data.objects.new("TopArea", top_area)
    top_obj.location = Vector((-0.4, -0.8, 2.0))
    bpy.context.scene.collection.objects.link(top_obj)

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, "RenderSettings") and 'BLENDER_EEVEE_NEXT' in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items else 'BLENDER_EEVEE'
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 900
    scene.render.film_transparent = False

    cam_data = bpy.data.cameras.new("CutawayCam")
    cam_data.lens = 32.0
    cam_obj = bpy.data.objects.new("CutawayCam", cam_data)
    cam_loc = Vector((-1.65, -1.05, 1.55))
    target_loc = Vector((0.0, -0.75, 0.40))
    cam_obj.location = cam_loc
    direction = target_loc - cam_loc
    cam_obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    scene.render.filepath = out_file
    bpy.ops.render.render(write_still=True)
    print(f"[RENDERED] {out_file}")

if __name__ == "__main__":
    render_full_cabin_cutaway()
