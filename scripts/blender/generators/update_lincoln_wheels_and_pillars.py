"""
Updates Lincoln Town Car Limo Phase 1 and Phase 2 generators:
1. Upgrades wheel assembly in Phase 1 with authentic hollow annular tires,
   bright Goodyear whitewall annular bands, and multi-piece turbine alloy rims/spokes/emblems/brakes.
2. Upgrades body shell in Phase 2 with solid structural A-pillars and flush door window sills.
3. Preserves line count >= 2,500 lines on both files.
"""

import os
import re

p1_path = r"e:\Car_Automation\scripts\blender\generators\generate_lincoln_town_car_limo_phase1.py"
p2_path = r"e:\Car_Automation\scripts\blender\generators\generate_lincoln_town_car_limo_phase2.py"

# ==============================================================================
# 1. UPDATE PHASE 1
# ==============================================================================
with open(p1_path, 'r', encoding='utf-8') as f:
    p1_content = f.read()

# Check if add_annular_tube is already in p1
annular_tube_code = '''
def add_annular_tube(bm, r_inner, r_outer, depth, segments=36, matrix=None, create_sidewalls=True):
    """Generates an annular cylindrical ring/tube with quad walls and sidewalls."""
    if matrix is None:
        matrix = Matrix()
    d2 = depth * 0.5
    for i in range(segments):
        a0 = i * (2.0 * math.pi / segments)
        a1 = (i + 1) * (2.0 * math.pi / segments)
        c0, s0 = math.cos(a0), math.sin(a0)
        c1, s1 = math.cos(a1), math.sin(a1)
        v_out_0_top = bm.verts.new(matrix @ Vector((c0 * r_outer, s0 * r_outer, d2)))
        v_out_1_top = bm.verts.new(matrix @ Vector((c1 * r_outer, s1 * r_outer, d2)))
        v_out_1_bot = bm.verts.new(matrix @ Vector((c1 * r_outer, s1 * r_outer, -d2)))
        v_out_0_bot = bm.verts.new(matrix @ Vector((c0 * r_outer, s0 * r_outer, -d2)))
        bm.faces.new([v_out_0_top, v_out_1_top, v_out_1_bot, v_out_0_bot])
        if r_inner > 0:
            v_in_0_top = bm.verts.new(matrix @ Vector((c0 * r_inner, s0 * r_inner, d2)))
            v_in_1_top = bm.verts.new(matrix @ Vector((c1 * r_inner, s1 * r_inner, d2)))
            v_in_1_bot = bm.verts.new(matrix @ Vector((c1 * r_inner, s1 * r_inner, -d2)))
            v_in_0_bot = bm.verts.new(matrix @ Vector((c0 * r_inner, s0 * r_inner, -d2)))
            bm.faces.new([v_in_0_bot, v_in_1_bot, v_in_1_top, v_in_0_top])
            if create_sidewalls:
                bm.faces.new([v_in_0_top, v_in_1_top, v_out_1_top, v_out_0_top])
                bm.faces.new([v_out_0_bot, v_out_1_bot, v_in_1_bot, v_in_0_bot])
'''

if "def add_annular_tube" not in p1_content:
    # Insert after _compat_create_cylinder
    target = "if not hasattr(bmesh.ops, 'create_cylinder'):\n    bmesh.ops.create_cylinder = _compat_create_cylinder\n"
    p1_content = p1_content.replace(target, target + annular_tube_code + "\n")

# Replace build_lincoln_turbine_wheels_and_brakes
new_wheels_func = '''def build_lincoln_turbine_wheels_and_brakes(materials):
    """
    Constructs the 15-inch Lincoln Turbine-fin alloy wheels, Goodyear Arriva
    whitewall radial tires, and front disc / rear drum braking systems.
    Decoupled into:
      1. WHEELS_Lincoln_Tires_BlackRubber (Mat_Goodyear_Tire_Tread)
      2. WHEELS_Lincoln_Tires_Whitewall (Mat_Goodyear_Whitewall_Stripe)
      3. WHEELS_Lincoln_Turbine_Alloy_Brakes (Mat_Lincoln_Turbine_Face)
    """
    bm_tires = bmesh.new()
    bm_ww = bmesh.new()
    bm_rims = bmesh.new()

    wheel_rad = 0.365  # Tire outer radius
    rim_rad = 0.205    # 15" wheel rim bead radius (approx 410mm dia)
    rim_w = 0.21       # Wheel width
    w_positions = [
        ("FL", Vector(( 0.80,  2.05, wheel_rad)),  1.0, True),
        ("FR", Vector((-0.80,  2.05, wheel_rad)), -1.0, True),
        ("RL", Vector(( 0.81, -2.05, wheel_rad)),  1.0, False),
        ("RR", Vector((-0.81, -2.05, wheel_rad)), -1.0, False)
    ]

    for name, pos, side, is_front in w_positions:
        rot_y = Matrix.Rotation(math.radians(90.0 * side), 4, 'Y')

        # ---------------------------------------------------------------------
        # 1. Goodyear Arriva Radial Tire (Hollow Annular Tube - Rim sits inside!)
        # ---------------------------------------------------------------------
        add_annular_tube(
            bm_tires,
            r_inner=rim_rad,
            r_outer=wheel_rad,
            depth=rim_w,
            segments=36,
            matrix=Matrix.Translation(pos) @ rot_y
        )

        # ---------------------------------------------------------------------
        # 2. Authentic 1.5-inch Vulcanized Whitewall Annular Stripe
        # ---------------------------------------------------------------------
        add_annular_tube(
            bm_ww,
            r_inner=0.225,
            r_outer=0.265,
            depth=0.006,
            segments=36,
            matrix=Matrix.Translation(pos) @ rot_y @ Matrix.Translation(Vector((0, 0, 0.106)))
        )

        # ---------------------------------------------------------------------
        # 3. 15-Inch Lincoln Turbine-Fin Alloy Wheel & Center Medallion
        # ---------------------------------------------------------------------
        # Deep Stepped Chrome Rim Lip
        add_annular_tube(
            bm_rims,
            r_inner=0.192,
            r_outer=rim_rad,
            depth=0.045,
            segments=36,
            matrix=Matrix.Translation(pos) @ rot_y @ Matrix.Translation(Vector((0, 0, 0.082)))
        )
        # Outer stepped bead rim flange
        add_annular_tube(
            bm_rims,
            r_inner=rim_rad - 0.008,
            r_outer=rim_rad + 0.010,
            depth=0.015,
            segments=36,
            matrix=Matrix.Translation(pos) @ rot_y @ Matrix.Translation(Vector((0, 0, 0.102)))
        )

        # Recessed Wheel Center Face Cavity
        add_annular_tube(
            bm_rims,
            r_inner=0.065,
            r_outer=0.194,
            depth=0.025,
            segments=36,
            matrix=Matrix.Translation(pos) @ rot_y @ Matrix.Translation(Vector((0, 0, 0.060)))
        )

        # 16 Directional Radiating Turbine Blade Cooling Fins
        for i_fin in range(16):
            fin_ang = i_fin * (2.0 * math.pi / 16.0)
            fin_mat = (Matrix.Translation(pos) @ rot_y @
                       Matrix.Rotation(fin_ang, 4, 'Z') @
                       Matrix.Translation(Vector((0.128, 0.0, 0.070))) @
                       Matrix.Rotation(math.radians(24.0), 4, 'X') @
                       Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.008, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.024, 4, Vector((0, 0, 1))))
            bmesh.ops.create_cube(bm_rims, size=1.0, matrix=fin_mat)

        # Center Hub Spindle Cone
        bmesh.ops.create_cone(
            bm_rims,
            cap_ends=True,
            radius1=0.065,
            radius2=0.052,
            depth=0.035,
            segments=24,
            matrix=Matrix.Translation(pos) @ rot_y @ Matrix.Translation(Vector((0, 0, 0.082)))
        )

        # Raised 3D Lincoln Four-Point Star Center Emblem
        # Vertical star beam
        star_mat_v = (Matrix.Translation(pos) @ rot_y @
                      Matrix.Translation(Vector((0, 0, 0.102))) @
                      Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @
                      Matrix.Scale(0.055, 4, Vector((0, 1, 0))) @
                      Matrix.Scale(0.008, 4, Vector((0, 0, 1))))
        bmesh.ops.create_cube(bm_rims, size=1.0, matrix=star_mat_v)
        # Horizontal star beam
        star_mat_h = (Matrix.Translation(pos) @ rot_y @
                      Matrix.Translation(Vector((0, 0, 0.102))) @
                      Matrix.Scale(0.055, 4, Vector((1, 0, 0))) @
                      Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                      Matrix.Scale(0.008, 4, Vector((0, 0, 1))))
        bmesh.ops.create_cube(bm_rims, size=1.0, matrix=star_mat_h)

        # 5 Chrome Acorn Lug Nuts (5x4.5" bolt circle = radius 0.057m)
        for i_lug in range(5):
            lug_ang = i_lug * (2.0 * math.pi / 5.0)
            lx = math.cos(lug_ang) * 0.057
            ly = math.sin(lug_ang) * 0.057
            lug_mat = (Matrix.Translation(pos) @ rot_y @
                       Matrix.Translation(Vector((lx, ly, 0.078))) @
                       Matrix.Scale(0.022, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.022, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.025, 4, Vector((0, 0, 1))))
            bmesh.ops.create_cube(bm_rims, size=1.0, matrix=lug_mat)

        # ---------------------------------------------------------------------
        # 4. Braking System (Front Vented Disc / Rear Finned Drum)
        # ---------------------------------------------------------------------
        if is_front:
            # Front 11.5" Ventilated Cast Iron Brake Rotor
            add_annular_tube(
                bm_rims,
                r_inner=0.082,
                r_outer=0.146,
                depth=0.028,
                segments=32,
                matrix=Matrix.Translation(pos) @ rot_y @ Matrix.Translation(Vector((0, 0, -0.04)))
            )
            # Heavy Dual-Piston Cast Iron Brake Caliper
            cal_mat = (Matrix.Translation(pos) @ rot_y @
                       Matrix.Translation(Vector((0.11, 0.06, -0.04))) @
                       Matrix.Scale(0.16, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.12, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.08, 4, Vector((0, 0, 1))))
            bmesh.ops.create_cube(bm_rims, size=1.0, matrix=cal_mat)
        else:
            # Rear 11" Cast Iron Brake Drum
            add_annular_tube(
                bm_rims,
                r_inner=0.075,
                r_outer=0.140,
                depth=0.065,
                segments=32,
                matrix=Matrix.Translation(pos) @ rot_y @ Matrix.Translation(Vector((0, 0, -0.05)))
            )

    obj_tires = create_mesh_object("WHEELS_Lincoln_Tires_BlackRubber", bm_tires, materials['tire_tread_rubber'])
    add_bevel_modifier(obj_tires, width=0.003, segments=2)

    obj_ww = create_mesh_object("WHEELS_Lincoln_Tires_Whitewall", bm_ww, materials['tire_whitewall_stripe'])
    add_bevel_modifier(obj_ww, width=0.001, segments=1)

    obj_rims = create_mesh_object("WHEELS_Lincoln_Turbine_Alloy_Brakes", bm_rims, materials['turbine_alloy_machined'])
    add_bevel_modifier(obj_rims, width=0.002, segments=2)

    return [obj_tires, obj_ww, obj_rims]
'''

# Find start of old build_lincoln_turbine_wheels_and_brakes
p1_start = p1_content.find("def build_lincoln_turbine_wheels_and_brakes(materials):")
p1_end = p1_content.find("def build_chauffeur_front_cockpit(materials):")
if p1_start != -1 and p1_end != -1:
    p1_content = p1_content[:p1_start] + new_wheels_func + "\n\n\n# " + "="*76 + "\n" + p1_content[p1_end:]

# Also update caller in generate_lincoln_town_car_limo_phase1()
caller_old = """    # 5. Lincoln Turbine Wheels, Whitewall Tires & Brakes
    wheels_obj = build_lincoln_turbine_wheels_and_brakes(mats)
    print(f"✓ Created {wheels_obj.name} with {len(wheels_obj.data.polygons)} polygons.")"""

caller_new = """    # 5. Lincoln Turbine Wheels, Whitewall Tires & Brakes
    wheels_objs = build_lincoln_turbine_wheels_and_brakes(mats)
    for wo in wheels_objs:
        print(f"✓ Created {wo.name} with {len(wo.data.polygons)} polygons.")"""

p1_content = p1_content.replace(caller_old, caller_new)

with open(p1_path, 'w', encoding='utf-8') as f:
    f.write(p1_content)

print(f"Phase 1 updated. Total lines: {len(p1_content.splitlines())}")


# ==============================================================================
# 2. UPDATE PHASE 2 (A-PILLARS & WINDOW SILLS)
# ==============================================================================
with open(p2_path, 'r', encoding='utf-8') as f:
    p2_content = f.read()

# Add A-pillars and window sills to build_limousine_body_shell
# Find where rear quarter panels start or door flanks
door_flanks_target = "    # 3. Limousine Body Sides & Doors (Y = -1.65m to +1.65m -> 3.30m continuous flank!)"

a_pillars_and_sills = """    # Structural Limousine A-Pillars (Connecting Cowl Y=1.62m, Z=0.88m to Roof Y=1.40m, Z=1.40m)
    for side in [1.0, -1.0]:
        # Slanted structural A-pillar beam
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.81 * side, 1.51, 1.14))) @
                   Matrix.Rotation(math.radians(-23.0), 4, 'X') @
                   Matrix.Rotation(math.radians(-14.0 * side), 4, 'Y') @
                   Matrix.Scale(0.075, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.065, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.58, 4, Vector((0, 0, 1)))
        )
        # Window Beltline Top Sills (Closing inner void beneath side glass)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.89 * side, 0.0, 0.88))) @
                   Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(3.30, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
        )

"""

if "Structural Limousine A-Pillars" not in p2_content:
    p2_content = p2_content.replace(door_flanks_target, a_pillars_and_sills + door_flanks_target)

with open(p2_path, 'w', encoding='utf-8') as f:
    f.write(p2_content)

print(f"Phase 2 updated. Total lines: {len(p2_content.splitlines())}")
