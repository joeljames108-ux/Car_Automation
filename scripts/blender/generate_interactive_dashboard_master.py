"""
==============================================================================
BLENDER 5.2 PROCEDURAL INTERACTIVE DASHBOARD GLB GENERATOR
==============================================================================
Generates public/models/interior/dashboard_interactive_master.glb matching:
- User Wireframe (Image 1): Modular hierarchy for real-time interactivity
- Reference Cockpit View (Image 4): Front-facing driver eye-level perspective
  showing steering wheel on left, two-tone sculpted upper dash pad, center
  infotainment screen, air vents, center console with shifter, and passenger dash.
==============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# Import PBR upgrade library
sys.path.append(os.path.abspath("scripts/blender"))
import engine_pbr_upgrade_lib as pbr_lib

def log(msg):
    print(f"[INTERACTIVE_DASHBOARD_GEN] {msg}")

# CAD helpers
def add_cylinder(bm, radius, depth, segments=24, matrix=Matrix.Identity(4)):
    return bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        cap_tris=False,
        segments=segments,
        radius1=radius,
        radius2=radius,
        depth=depth,
        matrix=matrix
    )

def add_box(bm, size=(1,1,1), matrix=Matrix.Identity(4)):
    res = bmesh.ops.create_cube(bm, size=1.0, matrix=matrix)
    bmesh.ops.scale(bm, vec=Vector(size), verts=res['verts'])
    return res

def create_obj(name, bm, mat=None, parent=None):
    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    for p in obj.data.polygons:
        p.use_smooth = True
    wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True
    wn.weight = 100
    return obj

def build_interactive_dashboard():
    log("Initializing Blender 5.2 scene for interactive dashboard generation...")
    pbr_lib.reset_scene()
    mat_suite = pbr_lib.get_pbr_suite()
    
    # Custom specific PBR materials for interior dashboard
    # Upper Dash Pad Material (Aegean Cobalt Blue from Image 4)
    mat_dash_blue = pbr_lib.create_pbr_material("Mat_Dash_UpperPad_Blue", (0.12, 0.35, 0.75, 1.0), metallic=0.08, roughness=0.38, clearcoat=0.6)
    # Main Dash Slate Gray / Tan
    mat_dash_main = pbr_lib.create_pbr_material("Mat_Dash_MainBody_Tan", (0.75, 0.68, 0.58, 1.0), metallic=0.05, roughness=0.55)
    # Open-pore Walnut Wood Trim
    mat_wood_trim = pbr_lib.create_pbr_material("Mat_InteriorTrim_Walnut", (0.35, 0.18, 0.08, 1.0), metallic=0.15, roughness=0.25, clearcoat=0.8)
    # Nappa Leather Charcoal
    mat_leather_charcoal = pbr_lib.create_pbr_material("Mat_Nappa_Charcoal", (0.10, 0.10, 0.11, 1.0), metallic=0.05, roughness=0.45, clearcoat=0.4)
    # Emissive Cyan Ambient Light
    mat_ambient_cyan = pbr_lib.create_pbr_material("Mat_Ambient_Cyan_Glow", (0.1, 0.85, 1.0, 1.0), metallic=0.1, roughness=0.1)
    nodes = mat_ambient_cyan.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (0.1, 0.85, 1.0, 1.0)
            bsdf.inputs["Emission Strength"].default_value = 5.0
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (0.1, 0.85, 1.0, 1.0)
    # Infotainment Screen Display Material
    mat_screen_display = pbr_lib.create_pbr_material("Mat_Infotainment_Display", (0.05, 0.07, 0.12, 1.0), metallic=0.1, roughness=0.04, clearcoat=1.0)
    # Instrument Cluster Display Material
    mat_cluster_display = pbr_lib.create_pbr_material("Mat_Cluster_Display", (0.04, 0.05, 0.08, 1.0), metallic=0.1, roughness=0.04, clearcoat=1.0)

    root_group = bpy.data.objects.new("DASHBOARD_INTERACTIVE_ROOT", None)
    bpy.context.scene.collection.objects.link(root_group)

    # ========================================================================
    # 1. UPPER DASHBOARD TWO-TONE PAD (Highlighted in Blue in Image 4)
    # ========================================================================
    log("Building sculpted upper dashboard pad (Image 4 blue deck)...")
    bm_pad = bmesh.new()
    # Sculpted cowl spanning driver binnacle across center stack to passenger door
    # Main upper sweep
    add_box(bm_pad, size=(1.38, 0.36, 0.045), matrix=Matrix.Translation(Vector((0.0, 0.05, 0.49))))
    # Driver gauge binnacle arch cowl
    add_box(bm_pad, size=(0.42, 0.28, 0.065), matrix=Matrix.Translation(Vector((-0.35, -0.02, 0.52))))
    # Passenger eyebrow contour
    add_box(bm_pad, size=(0.50, 0.26, 0.038), matrix=Matrix.Translation(Vector((0.36, 0.04, 0.495))))
    dash_upper_obj = create_obj("DASH_UPPER_PAD", bm_pad, mat_dash_blue, parent=root_group)

    # ========================================================================
    # 2. MAIN DASHBOARD BODY (Structure, Glovebox, Knee Bolsters)
    # ========================================================================
    log("Building main dashboard structural body...")
    bm_main = bmesh.new()
    # Main dashboard lower bulk
    add_box(bm_main, size=(1.36, 0.32, 0.24), matrix=Matrix.Translation(Vector((0.0, 0.08, 0.34))))
    # Passenger glovebox panel
    add_box(bm_main, size=(0.48, 0.04, 0.18), matrix=Matrix.Translation(Vector((0.36, -0.07, 0.28))))
    # Driver lower steering knee bolster
    add_box(bm_main, size=(0.44, 0.04, 0.16), matrix=Matrix.Translation(Vector((-0.35, -0.07, 0.26))))
    create_obj("DASH_MAIN_BODY", bm_main, mat_dash_main, parent=root_group)

    # ========================================================================
    # 3. HORIZONTAL DECORATIVE TRIM SPEAR (Wood / Carbon / Aluminum)
    # ========================================================================
    log("Building horizontal decorative trim spear...")
    bm_trim = bmesh.new()
    add_box(bm_trim, size=(1.34, 0.025, 0.042), matrix=Matrix.Translation(Vector((0.0, -0.085, 0.42))))
    create_obj("DASH_TRIM_SPEAR", bm_trim, mat_wood_trim, parent=root_group)

    # ========================================================================
    # 4. AMBIENT LED LIGHT GUIDE CONTOUR
    # ========================================================================
    log("Building ambient LED light guide strip...")
    bm_led = bmesh.new()
    add_box(bm_led, size=(1.32, 0.015, 0.008), matrix=Matrix.Translation(Vector((0.0, -0.092, 0.442))))
    # Center console ambient surround
    add_box(bm_led, size=(0.26, 0.012, 0.008), matrix=Matrix.Translation(Vector((0.0, -0.16, 0.245))))
    create_obj("DASH_AMBIENT_LIGHT", bm_led, mat_ambient_cyan, parent=root_group)

    # ========================================================================
    # 5. HVAC AIR VENTS (Center, Driver Left, Passenger Right)
    # ========================================================================
    log("Building HVAC air conditioning louvers...")
    bm_vents = bmesh.new()
    # Center twin vents above infotainment screen (as seen in Image 4)
    for dx in [-0.08, 0.08]:
        add_box(bm_vents, size=(0.11, 0.03, 0.045), matrix=Matrix.Translation(Vector((dx, -0.09, 0.435))))
    # Left side driver vent
    add_box(bm_vents, size=(0.08, 0.03, 0.05), matrix=Matrix.Translation(Vector((-0.62, -0.06, 0.40))))
    # Right side passenger vent
    add_box(bm_vents, size=(0.08, 0.03, 0.05), matrix=Matrix.Translation(Vector((0.62, -0.06, 0.40))))
    create_obj("DASH_HVAC_VENTS", bm_vents, mat_suite["billet_deck"], parent=root_group)

    # ========================================================================
    # 6. CENTER INFOTAINMENT TOUCHSCREEN & BEZEL (Center of Image 4)
    # ========================================================================
    log("Building center infotainment display stack...")
    # Infotainment Frame / Bezel
    bm_bezel = bmesh.new()
    add_box(bm_bezel, size=(0.30, 0.025, 0.22), matrix=Matrix.Translation(Vector((0.0, -0.09, 0.30))))
    # Volume knob & hazard triangle button
    add_cylinder(bm_bezel, 0.014, 0.016, segments=20, matrix=Matrix.Translation(Vector((-0.11, -0.105, 0.19))) @ Matrix.Rotation(math.radians(90), 4, 'X'))
    add_cylinder(bm_bezel, 0.014, 0.016, segments=20, matrix=Matrix.Translation(Vector((0.11, -0.105, 0.19))) @ Matrix.Rotation(math.radians(90), 4, 'X'))
    create_obj("INFOTAINMENT_BEZEL", bm_bezel, mat_suite["cast_iron"], parent=root_group)

    # Infotainment Screen Plane (UV mapped for dynamic HTML5 canvas)
    bm_screen = bmesh.new()
    add_box(bm_screen, size=(0.26, 0.006, 0.17), matrix=Matrix.Translation(Vector((0.0, -0.104, 0.31))))
    create_obj("INFOTAINMENT_SCREEN", bm_screen, mat_screen_display, parent=root_group)

    # ========================================================================
    # 7. DRIVER INSTRUMENT CLUSTER
    # ========================================================================
    log("Building driver instrument cluster...")
    bm_cluster_binnacle = bmesh.new()
    add_box(bm_cluster_binnacle, size=(0.38, 0.08, 0.16), matrix=Matrix.Translation(Vector((-0.35, -0.04, 0.43))))
    create_obj("CLUSTER_HOOD", bm_cluster_binnacle, mat_suite["cast_aluminum"], parent=root_group)

    bm_cluster_disp = bmesh.new()
    add_box(bm_cluster_disp, size=(0.34, 0.006, 0.13), matrix=Matrix.Translation(Vector((-0.35, -0.075, 0.43))))
    create_obj("CLUSTER_SCREEN", bm_cluster_disp, mat_cluster_display, parent=root_group)

    # ========================================================================
    # 8. STEERING WHEELS GROUP (Interchangeable 3D Wheels)
    # ========================================================================
    log("Building interchangeable steering wheel options...")
    steering_root = bpy.data.objects.new("STEERING_ROOT", None)
    steering_root.location = Vector((-0.35, -0.28, 0.40))
    steering_root.rotation_euler = Euler((math.radians(18), 0.0, 0.0), 'XYZ')
    bpy.context.scene.collection.objects.link(steering_root)
    steering_root.parent = root_group

    # Steering Column & Stalks
    bm_col = bmesh.new()
    add_cylinder(bm_col, 0.038, 0.22, segments=20, matrix=Matrix.Rotation(math.radians(90), 4, 'Y') @ Matrix.Rotation(math.radians(-72), 4, 'Z'))
    # Turn signal & wiper control stalks
    mat_stalk_l = Matrix.Translation(Vector((-0.07, 0.06, 0.02))) @ Matrix.Rotation(math.radians(-35), 4, 'Z')
    add_cylinder(bm_col, 0.007, 0.12, segments=12, matrix=mat_stalk_l)
    mat_stalk_r = Matrix.Translation(Vector((0.07, 0.06, 0.02))) @ Matrix.Rotation(math.radians(35), 4, 'Z')
    add_cylinder(bm_col, 0.007, 0.12, segments=12, matrix=mat_stalk_r)
    create_obj("STEERING_COLUMN_AND_STALKS", bm_col, mat_suite["arp_stud"], parent=steering_root)

    # Paddle Shifters (Left - / Right +)
    bm_paddles = bmesh.new()
    add_box(bm_paddles, size=(0.024, 0.006, 0.11), matrix=Matrix.Translation(Vector((-0.14, 0.03, 0.04))))
    add_box(bm_paddles, size=(0.024, 0.006, 0.11), matrix=Matrix.Translation(Vector((0.14, 0.03, 0.04))))
    create_obj("STEERING_PADDLE_SHIFTERS", bm_paddles, mat_suite["anodized_blue"], parent=steering_root)

    # 12 O'Clock Center Stripe
    bm_stripe = bmesh.new()
    add_box(bm_stripe, size=(0.024, 0.032, 0.015), matrix=Matrix.Translation(Vector((0.0, 0.0, 0.178))))
    create_obj("STEERING_TOP_STRIPE", bm_stripe, mat_suite["wrinkle_red"], parent=steering_root)

    # Drive Mode Rotary Manettino Dial
    bm_manettino = bmesh.new()
    add_cylinder(bm_manettino, 0.014, 0.016, segments=16, matrix=Matrix.Translation(Vector((0.065, -0.01, -0.06))))
    create_obj("STEERING_DRIVE_MODE_DIAL", bm_manettino, mat_suite["anodized_gold"], parent=steering_root)

    # Wheel 1: Sport 3-Spoke Wheel (Default matching Image 4)
    bm_sport = bmesh.new()
    # Outer Rim (Torus approximated by segments)
    rim_r = 0.175
    rim_thick = 0.016
    segments = 28
    for i in range(segments):
        ang = i * (2 * math.pi / segments)
        ang_next = (i + 1) * (2 * math.pi / segments)
        p1 = Vector((rim_r * math.sin(ang), 0.0, rim_r * math.cos(ang)))
        p2 = Vector((rim_r * math.sin(ang_next), 0.0, rim_r * math.cos(ang_next)))
        mid = (p1 + p2) * 0.5
        seg_len = (p2 - p1).length
        dir_v = (p2 - p1).normalized()
        rot_q = dir_v.to_track_quat('Z', 'Y')
        mat = Matrix.Translation(mid) @ rot_q.to_matrix().to_4x4()
        add_cylinder(bm_sport, rim_thick, seg_len, segments=12, matrix=mat)
    # Center Hub & Horn Pad (as in Image 4)
    add_box(bm_sport, size=(0.12, 0.028, 0.10), matrix=Matrix.Translation(Vector((0.0, -0.01, 0.0))))
    # Left, Right, and Bottom Spokes
    add_box(bm_sport, size=(0.10, 0.016, 0.035), matrix=Matrix.Translation(Vector((-0.09, -0.005, 0.0))))
    add_box(bm_sport, size=(0.10, 0.016, 0.035), matrix=Matrix.Translation(Vector((0.09, -0.005, 0.0))))
    add_box(bm_sport, size=(0.035, 0.016, 0.10), matrix=Matrix.Translation(Vector((0.0, -0.005, -0.09))))
    create_obj("STEERING_SPORT_3SPOKE", bm_sport, mat_leather_charcoal, parent=steering_root)

    # Wheel 2: GT3 Competition Yoke
    bm_yoke = bmesh.new()
    # Yoke U-shaped bottom and side handles (open top)
    for i in range(16):
        ang = math.pi * 0.75 + i * (math.pi * 1.5 / 16) # Bottom half sweep
        ang_next = math.pi * 0.75 + (i + 1) * (math.pi * 1.5 / 16)
        p1 = Vector((rim_r * math.sin(ang), 0.0, rim_r * math.cos(ang)))
        p2 = Vector((rim_r * math.sin(ang_next), 0.0, rim_r * math.cos(ang_next)))
        mid = (p1 + p2) * 0.5
        seg_len = (p2 - p1).length
        rot_q = (p2 - p1).normalized().to_track_quat('Z', 'Y')
        mat = Matrix.Translation(mid) @ rot_q.to_matrix().to_4x4()
        add_cylinder(bm_yoke, 0.018, seg_len, segments=12, matrix=mat)
    # Carbon bridge & racing grips
    add_box(bm_yoke, size=(0.18, 0.022, 0.08), matrix=Matrix.Translation(Vector((0.0, -0.008, 0.01))))
    yoke_obj = create_obj("STEERING_GT3_YOKE", bm_yoke, mat_suite["dry_carbon"], parent=steering_root)
    yoke_obj.hide_viewport = True # Hidden by default, toggled by config

    # Wheel 3: Formula Racing Butterfly Yoke
    bm_formula = bmesh.new()
    add_box(bm_formula, size=(0.28, 0.020, 0.14), matrix=Matrix.Translation(Vector((0.0, -0.008, 0.0))))
    add_cylinder(bm_formula, 0.022, 0.16, segments=16, matrix=Matrix.Translation(Vector((-0.13, -0.01, 0.0))))
    add_cylinder(bm_formula, 0.022, 0.16, segments=16, matrix=Matrix.Translation(Vector((0.13, -0.01, 0.0))))
    formula_obj = create_obj("STEERING_FORMULA", bm_formula, mat_suite["forged_carbon"], parent=steering_root)
    formula_obj.hide_viewport = True

    # Wheel 4: Classic Heritage Wood Rim
    bm_wood = bmesh.new()
    for i in range(segments):
        ang = i * (2 * math.pi / segments)
        ang_next = (i + 1) * (2 * math.pi / segments)
        p1 = Vector((rim_r * 1.05 * math.sin(ang), 0.0, rim_r * 1.05 * math.cos(ang)))
        p2 = Vector((rim_r * 1.05 * math.sin(ang_next), 0.0, rim_r * 1.05 * math.cos(ang_next)))
        mid = (p1 + p2) * 0.5
        seg_len = (p2 - p1).length
        rot_q = (p2 - p1).normalized().to_track_quat('Z', 'Y')
        mat = Matrix.Translation(mid) @ rot_q.to_matrix().to_4x4()
        add_cylinder(bm_wood, 0.013, seg_len, segments=12, matrix=mat)
    # Chrome 3-spoke split
    add_box(bm_wood, size=(0.14, 0.006, 0.02), matrix=Matrix.Translation(Vector((-0.08, 0.0, 0.0))))
    add_box(bm_wood, size=(0.14, 0.006, 0.02), matrix=Matrix.Translation(Vector((0.08, 0.0, 0.0))))
    add_box(bm_wood, size=(0.02, 0.006, 0.14), matrix=Matrix.Translation(Vector((0.0, 0.0, -0.08))))
    wood_obj = create_obj("STEERING_CLASSIC_WOOD", bm_wood, mat_wood_trim, parent=steering_root)
    wood_obj.hide_viewport = True

    # ========================================================================
    # 9. CENTER CONSOLE & SHIFTERS (As shown in Image 4)
    # ========================================================================
    log("Building center console tunnel and gear shifters...")
    console_root = bpy.data.objects.new("CONSOLE_ROOT", None)
    bpy.context.scene.collection.objects.link(console_root)
    console_root.parent = root_group

    # Center Tunnel Base
    bm_tunnel = bmesh.new()
    add_box(bm_tunnel, size=(0.28, 0.65, 0.22), matrix=Matrix.Translation(Vector((0.0, -0.38, 0.14))))
    # Cup holders
    for dy in [-0.48, -0.58]:
        add_cylinder(bm_tunnel, 0.040, 0.06, segments=20, matrix=Matrix.Translation(Vector((0.0, dy, 0.22))))
    create_obj("CONSOLE_BASE", bm_tunnel, mat_leather_charcoal, parent=console_root)

    # Shifter 1: Automatic Lever (Matching Image 4)
    bm_auto = bmesh.new()
    # Base gate bezel
    add_box(bm_auto, size=(0.14, 0.18, 0.015), matrix=Matrix.Translation(Vector((0.0, -0.28, 0.252))))
    # Vertical shifter stick
    add_cylinder(bm_auto, 0.010, 0.10, segments=16, matrix=Matrix.Translation(Vector((0.0, -0.28, 0.30))))
    # Sculpted T-handle shift knob with thumb button (as in Image 4)
    add_box(bm_auto, size=(0.042, 0.065, 0.045), matrix=Matrix.Translation(Vector((0.0, -0.28, 0.355))))
    create_obj("CONSOLE_SHIFTER_AUTO", bm_auto, mat_suite["cast_aluminum"], parent=console_root)

    # Shifter 2: Gated Manual Shifter
    bm_manual = bmesh.new()
    add_box(bm_manual, size=(0.14, 0.18, 0.015), matrix=Matrix.Translation(Vector((0.0, -0.28, 0.252))))
    # Leather shift boot cone
    bmesh.ops.create_cone(bm_manual, cap_ends=True, cap_tris=False, segments=16, radius1=0.048, radius2=0.015, depth=0.07, matrix=Matrix.Translation(Vector((0.0, -0.28, 0.285))))
    # Polished steel shaft and aluminum sphere knob
    add_cylinder(bm_manual, 0.007, 0.07, segments=14, matrix=Matrix.Translation(Vector((0.0, -0.28, 0.34))))
    bmesh.ops.create_uvsphere(bm_manual, u_segments=16, v_segments=16, radius=0.024, matrix=Matrix.Translation(Vector((0.0, -0.28, 0.385))))
    manual_obj = create_obj("CONSOLE_SHIFTER_MANUAL", bm_manual, mat_suite["billet_deck"], parent=console_root)
    manual_obj.hide_viewport = True

    # Shifter 3: Monostable Electronic Toggle
    bm_toggle = bmesh.new()
    add_box(bm_toggle, size=(0.14, 0.18, 0.015), matrix=Matrix.Translation(Vector((0.0, -0.28, 0.252))))
    add_box(bm_toggle, size=(0.040, 0.065, 0.035), matrix=Matrix.Translation(Vector((0.0, -0.28, 0.27))))
    toggle_obj = create_obj("CONSOLE_SHIFTER_TOGGLE", bm_toggle, mat_suite["titanium_metal"], parent=console_root)
    toggle_obj.hide_viewport = True

    # ========================================================================
    # 10. CABIN ENVIRONMENT (Windshield, A-Pillars, Door Panels, Seats)
    # ========================================================================
    log("Building cabin environment context matching Image 4...")
    bm_cabin = bmesh.new()
    # Left A-pillar
    add_box(bm_cabin, size=(0.06, 0.45, 0.65), matrix=Matrix.Translation(Vector((-0.68, 0.18, 0.68))) @ Matrix.Rotation(math.radians(-32), 4, 'Y') @ Matrix.Rotation(math.radians(-25), 4, 'X'))
    # Right A-pillar
    add_box(bm_cabin, size=(0.06, 0.45, 0.65), matrix=Matrix.Translation(Vector((0.68, 0.18, 0.68))) @ Matrix.Rotation(math.radians(32), 4, 'Y') @ Matrix.Rotation(math.radians(-25), 4, 'X'))
    # Left Door Card & Armrest
    add_box(bm_cabin, size=(0.12, 0.65, 0.42), matrix=Matrix.Translation(Vector((-0.72, -0.25, 0.32))))
    # Right Door Card & Armrest
    add_box(bm_cabin, size=(0.12, 0.65, 0.42), matrix=Matrix.Translation(Vector((0.72, -0.25, 0.32))))
    # Driver Seat Lower Bolster (visible in lower left corner of Image 4)
    add_box(bm_cabin, size=(0.46, 0.45, 0.28), matrix=Matrix.Translation(Vector((-0.35, -0.58, 0.10))))
    # Passenger Seat Lower Bolster (visible in lower right corner of Image 4)
    add_box(bm_cabin, size=(0.46, 0.45, 0.28), matrix=Matrix.Translation(Vector((0.35, -0.58, 0.10))))
    create_obj("CABIN_ENVIRONMENT", bm_cabin, mat_dash_main, parent=root_group)

    # Windshield Glass & Rearview Mirror
    bm_windshield = bmesh.new()
    add_box(bm_windshield, size=(1.35, 0.012, 0.62), matrix=Matrix.Translation(Vector((0.0, 0.24, 0.72))) @ Matrix.Rotation(math.radians(-38), 4, 'X'))
    # Rearview Mirror attached to windshield header
    add_box(bm_windshield, size=(0.20, 0.025, 0.055), matrix=Matrix.Translation(Vector((0.0, 0.12, 0.88))))
    add_cylinder(bm_windshield, 0.008, 0.06, segments=12, matrix=Matrix.Translation(Vector((0.0, 0.15, 0.89))) @ Matrix.Rotation(math.radians(45), 4, 'X'))
    create_obj("CABIN_WINDSHIELD_AND_MIRROR", bm_windshield, mat_suite["quartz_glass"], parent=root_group)

    # ========================================================================
    # EXPORT MASTER GLB
    # ========================================================================
    out_dir = os.path.abspath("public/models/interior")
    os.makedirs(out_dir, exist_ok=True)
    out_glb = os.path.join(out_dir, "dashboard_interactive_master.glb")
    log(f"Exporting complete interactive dashboard to: {out_glb}")
    
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=out_glb,
        export_format='GLB',
        use_selection=False,
        export_apply=False, # Keep hierarchy and local transforms intact!
        export_yup=True,
        export_materials='EXPORT',
    )
    sz_kb = os.path.getsize(out_glb) / 1024.0
    log(f"[SUCCESS] Exported dashboard_interactive_master.glb ({sz_kb:.1f} KB)")

if __name__ == "__main__":
    build_interactive_dashboard()
