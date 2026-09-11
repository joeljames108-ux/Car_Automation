"""
Sedan Wheels, Tires & Brembo Carbon-Ceramic Brakes (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
try:
    from .sedan_common import (
        link_and_finish,
        FRONT_AXLE_Y, REAR_AXLE_Y, HUB_Z,
        TIRE_RADIUS, WHEEL_RADIUS,
        FRONT_TIRE_WIDTH, REAR_TIRE_WIDTH
    )
except ImportError:
    from sedan_common import (
        link_and_finish,
        FRONT_AXLE_Y, REAR_AXLE_Y, HUB_Z,
        TIRE_RADIUS, WHEEL_RADIUS,
        FRONT_TIRE_WIDTH, REAR_TIRE_WIDTH
    )

def build_wheels_and_brakes(mats):
    created = []
    mat_tire = mats.get("tire")
    mat_alloy = mats.get("rim_alloy")
    mat_rotor = mats.get("rotor")
    mat_caliper = mats.get("caliper")
    mat_chrome = mats.get("chrome")

    print("[SEDAN_WHEELS] Generating 20\" Forged Turbine Wheels, Radial Tires & Brembo Brakes...")

    wheel_stations = [
        ("FL", (0.825, FRONT_AXLE_Y, HUB_Z), True),
        ("FR", (-0.825, FRONT_AXLE_Y, HUB_Z), True),
        ("RL", (0.835, REAR_AXLE_Y, HUB_Z), False),
        ("RR", (-0.835, REAR_AXLE_Y, HUB_Z), False),
    ]

    for corner_id, (x_pos, y_pos, z_pos), is_front in wheel_stations:
        is_left = x_pos > 0
        w_width = FRONT_TIRE_WIDTH if is_front else REAR_TIRE_WIDTH
        r_barrel = WHEEL_RADIUS
        r_tire = TIRE_RADIUS

        # --------------------------------------------------------------------
        # 1. RADIAL TIRE (Ground contact at Z = 0.000m)
        # --------------------------------------------------------------------
        bm_tire = bmesh.new()
        rc_out = bmesh.ops.create_cone(bm_tire, cap_ends=False, radius1=r_tire, radius2=r_tire, depth=w_width, segments=64)
        bmesh.ops.rotate(bm_tire, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_out['verts'])
        bmesh.ops.translate(bm_tire, vec=Vector((x_pos, y_pos, z_pos)), verts=rc_out['verts'])
        bmesh.ops.solidify(bm_tire, geom=bm_tire.faces, thickness=(r_tire - r_barrel))
        
        # Sidewall outer bevel ring
        out_shift = (w_width * 0.50) if is_left else -(w_width * 0.50)
        rc_sw = bmesh.ops.create_cone(bm_tire, cap_ends=False, radius1=r_tire * 0.96, radius2=r_barrel * 1.04, depth=0.015, segments=48)
        bmesh.ops.rotate(bm_tire, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_sw['verts'])
        bmesh.ops.translate(bm_tire, vec=Vector((x_pos + out_shift * 0.95, y_pos, z_pos)), verts=rc_sw['verts'])
        
        obj_tire = link_and_finish(f"GEO_Tire_{corner_id}", "09_Wheels_Brakes", bm_tire, mat_tire, bevel=0.004, subsurf=1)
        created.append(obj_tire)

        # --------------------------------------------------------------------
        # 2. 20-INCH FORGED 5-TWIN-SPOKE TURBINE ALLOY RIM
        # --------------------------------------------------------------------
        bm_rim = bmesh.new()
        # Outer Rim Barrel
        rc_bar = bmesh.ops.create_cone(bm_rim, cap_ends=False, radius1=r_barrel, radius2=r_barrel, depth=w_width * 0.96, segments=48)
        bmesh.ops.rotate(bm_rim, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_bar['verts'])
        bmesh.ops.translate(bm_rim, vec=Vector((x_pos, y_pos, z_pos)), verts=rc_bar['verts'])
        bmesh.ops.solidify(bm_rim, geom=bm_rim.faces, thickness=0.018)

        # 5 Twin-Spoke Turbine Pairs
        face_out_x = x_pos + (w_width * 0.42 if is_left else -w_width * 0.42)
        for spk_idx in range(5):
            angle = spk_idx * (2 * math.pi / 5)
            for d_ang in [-0.075, 0.075]:
                a = angle + d_ang
                spoke = bmesh.ops.create_cube(bm_rim, size=1.0)
                bmesh.ops.scale(bm_rim, vec=Vector((0.018, 0.026, r_barrel * 0.82)), verts=spoke['verts'])
                bmesh.ops.rotate(bm_rim, cent=Vector((0,0,0)), matrix=Matrix.Rotation(a, 4, 'X'), verts=spoke['verts'])
                bmesh.ops.translate(bm_rim, vec=Vector((
                    face_out_x,
                    y_pos + math.sin(a) * (r_barrel * 0.46),
                    z_pos + math.cos(a) * (r_barrel * 0.46)
                )), verts=spoke['verts'])

        # Center Hub & Lug Nuts
        rhub = bmesh.ops.create_cone(bm_rim, cap_ends=True, radius1=0.080, radius2=0.080, depth=0.045, segments=32)
        bmesh.ops.rotate(bm_rim, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rhub['verts'])
        bmesh.ops.translate(bm_rim, vec=Vector((face_out_x * 0.98, y_pos, z_pos)), verts=rhub['verts'])

        # 5 Lug Nuts
        for lug_i in range(5):
            la = lug_i * (2 * math.pi / 5)
            rc_lug = bmesh.ops.create_cone(bm_rim, cap_ends=True, radius1=0.010, radius2=0.010, depth=0.018, segments=6)
            bmesh.ops.rotate(bm_rim, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_lug['verts'])
            bmesh.ops.translate(bm_rim, vec=Vector((
                face_out_x + (0.010 if is_left else -0.010),
                y_pos + math.sin(la) * 0.045,
                z_pos + math.cos(la) * 0.045
            )), verts=rc_lug['verts'])

        obj_rim = link_and_finish(f"GEO_WheelRim_{corner_id}", "09_Wheels_Brakes", bm_rim, mat_alloy, bevel=0.003, subsurf=1)
        created.append(obj_rim)

        # --------------------------------------------------------------------
        # 3. CARBON-CERAMIC DRILLED BRAKE ROTORS
        # --------------------------------------------------------------------
        bm_rotor = bmesh.new()
        rd = 0.205 if is_front else 0.190
        rotor_x = x_pos - (0.035 if is_left else -0.035)
        rc_r = bmesh.ops.create_cone(bm_rotor, cap_ends=True, radius1=rd, radius2=rd, depth=0.028, segments=48)
        bmesh.ops.rotate(bm_rotor, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_r['verts'])
        bmesh.ops.translate(bm_rotor, vec=Vector((rotor_x, y_pos, z_pos)), verts=rc_r['verts'])
        
        # Center rotor hat bell
        rc_hat = bmesh.ops.create_cone(bm_rotor, cap_ends=True, radius1=0.095, radius2=0.095, depth=0.035, segments=32)
        bmesh.ops.rotate(bm_rotor, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_hat['verts'])
        bmesh.ops.translate(bm_rotor, vec=Vector((rotor_x + (0.010 if is_left else -0.010), y_pos, z_pos)), verts=rc_hat['verts'])
        
        obj_rotor = link_and_finish(f"GEO_BrakeRotor_{corner_id}", "09_Wheels_Brakes", bm_rotor, mat_rotor, bevel=0.002, subsurf=0)
        created.append(obj_rotor)

        # --------------------------------------------------------------------
        # 4. BREMBO GLOSS RED CALIPERS
        # --------------------------------------------------------------------
        bm_cal = bmesh.new()
        cal_len = 0.220 if is_front else 0.180
        cal_height = 0.085
        rc_cl = bmesh.ops.create_cube(bm_cal, size=1.0)
        bmesh.ops.scale(bm_cal, vec=Vector((0.080, cal_height, cal_len)), verts=rc_cl['verts'])
        bmesh.ops.translate(bm_cal, vec=Vector((
            rotor_x + (0.015 if is_left else -0.015),
            y_pos + 0.120,
            z_pos + 0.085
        )), verts=rc_cl['verts'])
        
        obj_cal = link_and_finish(f"GEO_BrakeCaliper_{corner_id}", "09_Wheels_Brakes", bm_cal, mat_caliper, bevel=0.005, subsurf=1)
        created.append(obj_cal)

    print(f"[SEDAN_WHEELS] Successfully generated {len(created)} wheel, tire & brake objects.")
    return created
