"""
Renders showcase beauty images of the enhanced Blender 5.2 interior models.
Outputs images to the artifact directory.
"""
import bpy
import math
import os
import sys

PROJECT_DIR = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
ARTIFACT_DIR = r"C:\Users\joelj\.gemini\antigravity-ide\brain\0c258528-c6a4-4854-b69f-64eac755c0d6"
INTERIOR_DIR = os.path.join(PROJECT_DIR, "public", "models", "interior")

def setup_studio_lighting():
    # World background dark studio
    world = bpy.data.worlds.get("World")
    if not world:
        world = bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.02, 0.025, 0.035, 1.0)
        bg.inputs["Strength"].default_value = 0.6

    # Key Light (cool white rim)
    key_light_data = bpy.data.lights.new(name="Key_Light", type='AREA')
    key_light_data.energy = 450.0
    key_light_data.size = 2.0
    key_light_data.color = (0.95, 0.98, 1.0)
    key_obj = bpy.data.objects.new("Key_Light", key_light_data)
    bpy.context.collection.objects.link(key_obj)
    key_obj.location = (1.5, -1.8, 2.2)
    key_obj.rotation_euler = (math.radians(50), 0, math.radians(40))

    # Fill Light (warm tint)
    fill_light_data = bpy.data.lights.new(name="Fill_Light", type='AREA')
    fill_light_data.energy = 220.0
    fill_light_data.size = 2.5
    fill_light_data.color = (1.0, 0.92, 0.85)
    fill_obj = bpy.data.objects.new("Fill_Light", fill_light_data)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.location = (-1.8, -1.5, 1.8)
    fill_obj.rotation_euler = (math.radians(45), 0, math.radians(-50))

    # Rim / Hair Light (ice blue accent)
    rim_light_data = bpy.data.lights.new(name="Rim_Light", type='POINT')
    rim_light_data.energy = 300.0
    rim_light_data.color = (0.3, 0.7, 1.0)
    rim_obj = bpy.data.objects.new("Rim_Light", rim_light_data)
    bpy.context.collection.objects.link(rim_obj)
    rim_obj.location = (0.0, 1.8, 1.5)

    # Upward interior floor bounce / fill light
    uplight_data = bpy.data.lights.new(name="Up_Light", type='AREA')
    uplight_data.energy = 350.0
    uplight_data.size = 2.0
    uplight_data.color = (0.95, 0.95, 1.0)
    up_obj = bpy.data.objects.new("Up_Light", uplight_data)
    bpy.context.collection.objects.link(up_obj)
    up_obj.location = (0.0, 0.2, -1.0)
    up_obj.rotation_euler = (math.radians(-90), 0, 0)

def render_model(glb_path, out_png_path, cam_loc, target_loc, cam_fov=45):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    setup_studio_lighting()
    
    # Import GLB
    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Setup Camera with Track-To target
    cam_data = bpy.data.cameras.new("Render_Camera")
    cam_data.lens_unit = 'FOV'
    cam_data.angle = math.radians(cam_fov)
    cam_obj = bpy.data.objects.new("Render_Camera", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    cam_obj.location = cam_loc
    bpy.context.scene.camera = cam_obj

    # Create target empty and track-to constraint
    target_empty = bpy.data.objects.new("Cam_Target", None)
    bpy.context.collection.objects.link(target_empty)
    target_empty.location = target_loc
    
    track_to = cam_obj.constraints.new(type='TRACK_TO')
    track_to.target = target_empty
    track_to.track_axis = 'TRACK_NEGATIVE_Z'
    track_to.up_axis = 'UP_Y'

    # Render settings (EEVEE)
    bpy.context.scene.render.engine = 'BLENDER_EEVEE'
    bpy.context.scene.render.resolution_x = 1280
    bpy.context.scene.render.resolution_y = 720
    bpy.context.scene.render.resolution_percentage = 100
    bpy.context.scene.render.filepath = out_png_path
    bpy.context.scene.render.image_settings.file_format = 'PNG'

    bpy.ops.render.render(write_still=True)
    print(f"[RENDERED] {out_png_path}")

def main():
    os.makedirs(ARTIFACT_DIR, exist_ok=True)

    # 1. Executive Dashboard Showcase (Wide perspective showing full dash, cluster, center screen & passenger OLED)
    dash_glb = os.path.join(INTERIOR_DIR, "dashboard_executive.glb")
    dash_png = os.path.join(ARTIFACT_DIR, "interior_executive_dashboard_beauty.png")
    render_model(dash_glb, dash_png, cam_loc=(-0.15, -0.95, 0.96), target_loc=(0.0, -0.05, 0.72), cam_fov=56)

    # 2. Luxury GT Dashboard Showcase (Breitling Tourbillon clock, organ stops, diamond-quilted passenger dash)
    gt_dash_glb = os.path.join(INTERIOR_DIR, "dashboard_luxury_gt.glb")
    gt_dash_png = os.path.join(ARTIFACT_DIR, "interior_luxury_gt_dashboard_beauty.png")
    render_model(gt_dash_glb, gt_dash_png, cam_loc=(-0.15, -0.92, 0.96), target_loc=(0.0, -0.05, 0.72), cam_fov=54)

    # 3. Formula Butterfly Steering Wheel Showcase (Curved 15-LED RPM bar, 3 knurled dials, PIT toggle)
    formula_glb = os.path.join(INTERIOR_DIR, "steering_formula.glb")
    formula_png = os.path.join(ARTIFACT_DIR, "interior_formula_wheel_beauty.png")
    render_model(formula_glb, formula_png, cam_loc=(-0.08, -0.42, 0.08), target_loc=(0.0, 0.0, 0.02), cam_fov=42)

    # 4. Luxury Massage Seat Showcase (Articulated neck pillow, rear tray table, tablet dock)
    seat_glb = os.path.join(INTERIOR_DIR, "seat_luxury_massage.glb")
    seat_png = os.path.join(ARTIFACT_DIR, "interior_luxury_massage_seat_beauty.png")
    render_model(seat_glb, seat_png, cam_loc=(-0.65, -0.85, 0.85), target_loc=(0.0, 0.0, 0.65), cam_fov=42)

    # 5. Bespoke Atelier Artisan Cockpit Showcase (Navy/cognac two-tone, burl wood, champagne decanter & flutes)
    atelier_glb = os.path.join(INTERIOR_DIR, "cockpit_bespoke_atelier.glb")
    atelier_png = os.path.join(ARTIFACT_DIR, "interior_cockpit_bespoke_atelier_beauty.png")
    render_model(atelier_glb, atelier_png, cam_loc=(0.35, -1.35, 1.25), target_loc=(0.0, 0.20, 0.60), cam_fov=62)

    # 6. 24-Hour Endurance GT3 Cockpit Showcase (Roll cage, night floodlights, Cool-Suit blue hoses, defog fans)
    endurance_glb = os.path.join(INTERIOR_DIR, "cockpit_endurance_gt3.glb")
    endurance_png = os.path.join(ARTIFACT_DIR, "interior_cockpit_endurance_gt3_beauty.png")
    render_model(endurance_glb, endurance_png, cam_loc=(0.35, -1.35, 1.25), target_loc=(0.0, 0.20, 0.60), cam_fov=62)

    # 7. Competition Floor Pedals Showcase (Floor carrier frame, billet reservoirs & braided hoses)
    pedal_glb = os.path.join(INTERIOR_DIR, "pedals_race.glb")
    pedal_png = os.path.join(ARTIFACT_DIR, "interior_race_pedals_beauty.png")
    render_model(pedal_glb, pedal_png, cam_loc=(-0.05, -0.45, 0.38), target_loc=(0.0, 0.05, 0.16), cam_fov=48)

    # 8. Executive Door Cards Showcase (Rotating Burmester tweeter pod, wood spear & dual speaker array)
    door_glb = os.path.join(INTERIOR_DIR, "door_cards_executive.glb")
    door_png = os.path.join(ARTIFACT_DIR, "interior_door_cards_executive_beauty.png")
    render_model(door_glb, door_png, cam_loc=(-0.10, -0.20, 0.60), target_loc=(-0.70, 0.10, 0.50), cam_fov=54)

    # 9. Executive Center Console Showcase (Wireless charging pad, knurled dial, deployable cupholders, rear roller)
    console_glb = os.path.join(INTERIOR_DIR, "center_console_executive.glb")
    console_png = os.path.join(ARTIFACT_DIR, "interior_center_console_beauty.png")
    render_model(console_glb, console_png, cam_loc=(-0.35, -0.65, 0.72), target_loc=(0.0, -0.05, 0.38), cam_fov=48)

    # 10. Starlight Panoramic Roof Showcase (Micro-fiber optic constellations, overhead SOS module & map reading lenses)
    roof_glb = os.path.join(INTERIOR_DIR, "roof_starlight.glb")
    roof_png = os.path.join(ARTIFACT_DIR, "interior_roof_starlight_beauty.png")
    render_model(roof_glb, roof_png, cam_loc=(0.0, 0.15, -0.55), target_loc=(0.0, 0.60, -0.01), cam_fov=60)

    # 11. GT3 Motorsport Center Console Showcase (Start/stop button with red safety flip cover, sequential shifter, brake bias)
    gt3_console_glb = os.path.join(INTERIOR_DIR, "center_console_gt3.glb")
    gt3_console_png = os.path.join(ARTIFACT_DIR, "interior_gt3_center_console_beauty.png")
    render_model(gt3_console_glb, gt3_console_png, cam_loc=(-0.25, 0.08, 0.55), target_loc=(-0.04, 0.28, 0.30), cam_fov=42)

    # 12. Luxury Executive Cockpit Master Assembly Showcase (Full cabin with turbine vents, crystal shifter, stalks, door latches)
    exec_cockpit_glb = os.path.join(INTERIOR_DIR, "cockpit_luxury_executive.glb")
    exec_cockpit_png = os.path.join(ARTIFACT_DIR, "interior_cockpit_luxury_executive_beauty.png")
    render_model(exec_cockpit_glb, exec_cockpit_png, cam_loc=(0.35, -1.35, 1.25), target_loc=(0.0, 0.20, 0.60), cam_fov=62)

    # 13. Quantum Hyperblade Cockpit Showcase (Floating photonic blade, turbine vents, zero-G seats, crystal toggle)
    quantum_cockpit_glb = os.path.join(INTERIOR_DIR, "cockpit_quantum_hyperblade.glb")
    quantum_cockpit_png = os.path.join(ARTIFACT_DIR, "interior_cockpit_quantum_hyperblade_beauty.png")
    render_model(quantum_cockpit_glb, quantum_cockpit_png, cam_loc=(0.35, -1.35, 1.25), target_loc=(0.0, 0.20, 0.60), cam_fov=62)

    # 14. GT3 Competition Cockpit Showcase (FIA window safety net, roll cage, harnesses, and illuminated GT3 RS sills)
    gt3_cockpit_glb = os.path.join(INTERIOR_DIR, "cockpit_gt3_competition.glb")
    gt3_cockpit_png = os.path.join(ARTIFACT_DIR, "interior_cockpit_gt3_competition_beauty.png")
    render_model(gt3_cockpit_glb, gt3_cockpit_png, cam_loc=(-1.15, -0.75, 1.05), target_loc=(-0.30, 0.15, 0.60), cam_fov=60)

    # 15. Horological Exposed Linkage & Motorsport Shifter Macro Showcase
    horo_console_glb = os.path.join(INTERIOR_DIR, "center_console_gt3.glb")
    horo_console_png = os.path.join(ARTIFACT_DIR, "interior_horological_shifter_beauty.png")
    render_model(horo_console_glb, horo_console_png, cam_loc=(-0.16, 0.15, 0.44), target_loc=(-0.04, 0.30, 0.32), cam_fov=36)

    # 16. Coachbuilt VIP Salon Cockpit Showcase (Burmester acoustic arrays, fold-out walnut airline tray, headrest medallions)
    vip_salon_glb = os.path.join(INTERIOR_DIR, "cockpit_coachbuilt_vip_salon.glb")
    vip_salon_png = os.path.join(ARTIFACT_DIR, "interior_cockpit_coachbuilt_vip_salon_beauty.png")
    render_model(vip_salon_glb, vip_salon_png, cam_loc=(0.35, -1.35, 1.25), target_loc=(0.0, 0.20, 0.60), cam_fov=62)

    print("\n[COMPLETE] All 16 interior showcase renders generated successfully!")

if __name__ == "__main__":
    main()

