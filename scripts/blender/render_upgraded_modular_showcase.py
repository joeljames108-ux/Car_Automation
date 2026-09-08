"""
Render Showcase of Upgraded High-Poly Modular Parts (Blender 5.2 LTS)
Renders photorealistic preview images of the newly upgraded non-boxy modular parts:
1. Complete Modular Front Assembly (curved hood, bumper with splitter, headlights, fenders)
2. High-Poly V8 Twin-Turbo Powertrain (ribbed block, DOHC heads, plenum, turbos)
3. 10-Spoke Forged Rim & Semi-Slick Tire with cross-drilled rotor & Brembo caliper
4. Sports Cockpit Interior (contoured dashboard, dual screens, and carbon bucket seats)
"""
import bpy
import math
import mathutils
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\6b65af10-4dec-4c71-90b8-d02c18319690"
PARTS_DIR = os.path.join(PROJECT_DIR, "public", "models", "modular_parts", "individual")

def setup_studio_lighting():
    # World
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("Studio_World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs['Color'].default_value = (0.04, 0.04, 0.05, 1.0)
        bg.inputs['Strength'].default_value = 1.0

    # Key light
    bpy.ops.object.light_add(type='AREA', location=(2.5, 3.0, 3.5))
    key = bpy.context.active_object
    key.data.energy = 1000
    key.data.size = 2.5
    key.rotation_euler = (math.radians(-45), math.radians(25), math.radians(35))

    # Fill light
    bpy.ops.object.light_add(type='AREA', location=(-2.8, -1.5, 2.8))
    fill = bpy.context.active_object
    fill.data.energy = 550
    fill.data.size = 3.0
    fill.rotation_euler = (math.radians(35), math.radians(-30), math.radians(-45))

    # Rim light
    bpy.ops.object.light_add(type='AREA', location=(0.0, -3.5, 2.5))
    rim = bpy.context.active_object
    rim.data.energy = 800
    rim.data.size = 2.0

def render_scene(output_filename, camera_loc, target_loc):
    # Camera
    bpy.ops.object.camera_add(location=camera_loc)
    cam = bpy.context.active_object
    bpy.context.scene.camera = cam

    # Point directly at target
    direction = mathutils.Vector(target_loc) - cam.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam.rotation_euler = rot_quat.to_euler()

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items else 'BLENDER_EEVEE'
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = os.path.join(ARTIFACTS_DIR, output_filename)

    bpy.ops.render.render(write_still=True)
    print(f"Rendered: {scene.render.filepath}")

def render_upgraded_engine():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    setup_studio_lighting()

    # Import powertrain parts
    for fn in ["engine_block.glb", "cylinder_heads.glb", "intake_plenum.glb", "exhaust_headers.glb", "turbochargers.glb"]:
        p = os.path.join(PARTS_DIR, fn)
        if os.path.exists(p):
            bpy.ops.import_scene.gltf(filepath=p)

    render_scene("upgraded_modular_engine_render.png", camera_loc=(1.2, 0.2, 0.95), target_loc=(0.0, 1.25, 0.45))

def render_upgraded_wheel():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    setup_studio_lighting()

    # Import wheel and brake
    for fn in ["wheel_rim_fl.glb", "tire_fl.glb", "brake_rotors_front.glb", "brake_calipers.glb"]:
        p = os.path.join(PARTS_DIR, fn)
        if os.path.exists(p):
            bpy.ops.import_scene.gltf(filepath=p)

    render_scene("upgraded_modular_wheel_render.png", camera_loc=(1.65, 2.05, 0.60), target_loc=(0.80, 1.425, 0.34))

def render_upgraded_front_body():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    setup_studio_lighting()

    # Import exterior front body
    for fn in ["hood.glb", "front_bumper.glb", "front_left_fender.glb", "front_right_fender.glb", "headlamp_left.glb", "headlamp_right.glb", "grille.glb", "front_splitter.glb"]:
        p = os.path.join(PARTS_DIR, fn)
        if os.path.exists(p):
            bpy.ops.import_scene.gltf(filepath=p)

    render_scene("upgraded_modular_front_body_render.png", camera_loc=(2.2, 3.8, 1.5), target_loc=(0.0, 1.8, 0.50))

def render_upgraded_interior():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    setup_studio_lighting()

    # Import interior cockpit
    for fn in ["dashboard.glb", "steering_wheel.glb", "driver_seat.glb", "passenger_seat.glb", "center_console.glb", "digital_cluster.glb", "infotainment.glb"]:
        p = os.path.join(PARTS_DIR, fn)
        if os.path.exists(p):
            bpy.ops.import_scene.gltf(filepath=p)

    render_scene("upgraded_modular_interior_render.png", camera_loc=(0.0, -1.2, 1.35), target_loc=(0.0, 0.35, 0.65))

def main():
    print("Rendering Upgraded Modular Part Showcases...")
    render_upgraded_engine()
    render_upgraded_wheel()
    render_upgraded_front_body()
    render_upgraded_interior()
    print("[SUCCESS] All showcase renders complete!")

if __name__ == "__main__":
    main()
