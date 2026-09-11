"""
Hilux Ladder Chassis Frame Assembly (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Builds the hydroformed steel ladder chassis with 7 crossmembers, outriggers, shock towers, and hitch.
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
from hilux_common import (
    create_bmesh_object,
    assign_material,
    apply_bevel_and_weighted_normals,
    create_tube_between,
    create_box,
    bmesh_create_cylinder,
    bmesh_create_cube,
    bmesh_create_torus,
    mat_trans,
    mat_rot_x,
    mat_rot_y,
    mat_scale,
    WHEELBASE,
    FRONT_AXLE_Y,
    REAR_AXLE_Y,
    GROUND_CLEARANCE
)

def build_chassis_frame(materials):
    mat_steel = materials.get("Mat_SteelChassis_Black")
    mat_zinc = materials.get("Mat_Hardware_ZincBolt")
    mat_chrome = materials.get("Mat_Emblem_Chrome")
    
    col_name = "01_Chassis_Frame"
    objects = []
    
    # 1. Main Side Rails (Left & Right)
    # The HiLux frame rail follows a 3D swept path with front kick-up, cab drop, and rear axle arch.
    rail_nodes_L = [
        # (X, Y, Z, width, height)
        (-0.44,  2.42, 0.42, 0.075, 0.12),   # Front horn bumper mount
        (-0.44,  2.20, 0.40, 0.080, 0.13),   # Radiator cradle
        (-0.44,  1.75, 0.46, 0.085, 0.16),   # Front suspension arch apex (over front axle 1.54m)
        (-0.46,  1.30, 0.36, 0.085, 0.15),   # Transition to cab floor
        (-0.52,  0.80, 0.32, 0.080, 0.15),   # Under cab front
        (-0.52,  0.00, 0.32, 0.080, 0.15),   # Under cab center
        (-0.52, -0.80, 0.33, 0.080, 0.15),   # Under cab rear
        (-0.53, -1.25, 0.42, 0.080, 0.16),   # Rise to rear axle arch
        (-0.54, -1.54, 0.52, 0.080, 0.17),   # Rear axle arch apex (over rear axle -1.54m)
        (-0.54, -1.90, 0.45, 0.080, 0.15),   # Down from rear arch
        (-0.54, -2.40, 0.41, 0.075, 0.13),   # Bed rear support
        (-0.54, -2.68, 0.40, 0.075, 0.12),   # Rear bumper & hitch horn
    ]
    
    for side, side_mult, suffix in [("Left", 1.0, "_L"), ("Right", -1.0, "_R")]:
        bm = bmesh.new()
        rail_nodes = [(x * side_mult, y, z, w, h) for (x, y, z, w, h) in rail_nodes_L]
        
        # Build swept box segments connecting consecutive nodes
        for i in range(len(rail_nodes) - 1):
            n1 = rail_nodes[i]
            n2 = rail_nodes[i+1]
            p1 = Vector((n1[0], n1[1], n1[2]))
            p2 = Vector((n2[0], n2[1], n2[2]))
            w_avg = (n1[3] + n2[3]) / 2.0
            h_avg = (n1[4] + n2[4]) / 2.0
            
            center = (p1 + p2) / 2.0
            delta = p2 - p1
            length = delta.length
            
            up = Vector((0, 0, 1))
            fwd = delta.normalized()
            side_vec = fwd.cross(up).normalized() * side_mult
            actual_up = side_vec.cross(fwd).normalized()
            
            hw = w_avg / 2.0
            hh = h_avg / 2.0
            hl = length / 2.0
            
            v_local = [
                -side_vec * hw - actual_up * hh - fwd * hl + center,
                 side_vec * hw - actual_up * hh - fwd * hl + center,
                 side_vec * hw - actual_up * hh + fwd * hl + center,
                -side_vec * hw - actual_up * hh + fwd * hl + center,
                -side_vec * hw + actual_up * hh - fwd * hl + center,
                 side_vec * hw + actual_up * hh - fwd * hl + center,
                 side_vec * hw + actual_up * hh + fwd * hl + center,
                -side_vec * hw + actual_up * hh + fwd * hl + center,
            ]
            
            b_verts = [bm.verts.new(v) for v in v_local]
            faces_idx = [
                (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1),
                (2, 6, 7, 3), (0, 3, 7, 4), (1, 5, 6, 2)
            ]
            for f in faces_idx:
                try:
                    bm.faces.new([b_verts[idx] for idx in f])
                except ValueError:
                    pass
                    
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.01)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        
        obj_rail = create_bmesh_object(f"CHASSIS_Rail{suffix}", col_name, bm)
        assign_material(obj_rail, mat_steel)
        apply_bevel_and_weighted_normals(obj_rail, width=0.004, segments=2)
        objects.append(obj_rail)
        
    # 2. Seven Structural Crossmembers
    crossmembers_data = [
        # (name, type, center, size/radius, p1, p2)
        ("CHASSIS_XM1_FrontBumper", "tube", (-0.44, 2.38, 0.41), (0.44, 2.38, 0.41), 0.040),
        ("CHASSIS_XM2_SuspensionCradle", "box", (0.0, 1.54, 0.38), (0.86, 0.22, 0.10)),
        ("CHASSIS_XM3_TransmissionMount", "box", (0.0, 0.70, 0.32), (0.98, 0.14, 0.08)),
        ("CHASSIS_XM4_CenterBearing", "tube", (-0.52, 0.00, 0.33), (0.52, 0.00, 0.33), 0.038),
        ("CHASSIS_XM5_FuelTankForward", "tube", (-0.52, -0.85, 0.34), (0.52, -0.85, 0.34), 0.038),
        ("CHASSIS_XM6_RearShockTower", "tube", (-0.54, -1.54, 0.52), (0.54, -1.54, 0.52), 0.042),
        ("CHASSIS_XM7_RearHitchBeam", "box", (0.0, -2.66, 0.40), (1.08, 0.12, 0.10)),
    ]
    
    for item in crossmembers_data:
        name = item[0]
        xm_type = item[1]
        if xm_type == "box":
            center = item[2]
            size = item[3]
            bm = create_box(center, size)
        else: # tube
            p1 = item[2]
            p2 = item[3]
            radius = item[4]
            bm = create_tube_between(p1, p2, radius, segments=16)
            
        obj_xm = create_bmesh_object(name, col_name, bm)
        assign_material(obj_xm, mat_steel)
        apply_bevel_and_weighted_normals(obj_xm, width=0.003, segments=2)
        objects.append(obj_xm)
        
    # 3. Class IV 2-inch Square Hitch Receiver & Pin Loop
    bm_hitch = bmesh.new()
    bmesh_create_cube(bm_hitch, size=0.075, matrix=mat_trans(0.0, -2.75, 0.38) @ mat_scale(1.0, 2.5, 1.0))
    obj_hitch = create_bmesh_object("CHASSIS_HitchReceiver", col_name, bm_hitch)
    assign_material(obj_hitch, mat_steel)
    apply_bevel_and_weighted_normals(obj_hitch, width=0.002, segments=2)
    objects.append(obj_hitch)
    
    # 4. Front Recovery Tow Hooks (Forged Red / Zinc)
    for side, mult, sfx in [("Left", 1.0, "_L"), ("Right", -1.0, "_R")]:
        bm_hook = bmesh.new()
        bmesh_create_cylinder(
            bm_hook,
            radius=0.018,
            depth=0.15,
            segments=12,
            matrix=mat_trans(0.42 * mult, 2.44, 0.34) @ mat_rot_x(90)
        )
        bmesh_create_torus(
            bm_hook,
            major_radius=0.035,
            minor_radius=0.012,
            major_segments=16,
            minor_segments=8,
            matrix=mat_trans(0.42 * mult, 2.50, 0.34) @ mat_rot_y(90)
        )
        obj_hook = create_bmesh_object(f"CHASSIS_RecoveryHook{sfx}", col_name, bm_hook)
        assign_material(obj_hook, mat_steel)
        objects.append(obj_hook)
        
    # 5. Cab & Bed Mount Outriggers (Rubber Biscuits)
    mount_positions = [
        # (Y, X_span, Z, type)
        ( 2.10, 0.50, 0.42, "Cab1_RadiatorSupport"),
        ( 1.10, 0.56, 0.35, "Cab2_A_Pillar"),
        ( 0.20, 0.56, 0.34, "Cab3_B_Pillar"),
        (-0.40, 0.56, 0.35, "Cab4_C_Pillar"),
        (-0.70, 0.58, 0.36, "Bed1_Front"),
        (-1.70, 0.58, 0.44, "Bed2_Mid"),
        (-2.55, 0.58, 0.41, "Bed3_Rear"),
    ]
    
    for y_pos, x_span, z_pos, label in mount_positions:
        for mult, sfx in [(1.0, "_L"), (-1.0, "_R")]:
            bm_mount = bmesh.new()
            bmesh_create_cube(
                bm_mount,
                size=0.06,
                matrix=mat_trans(x_span * mult, y_pos, z_pos) @ mat_scale(1.4, 1.0, 1.0)
            )
            bmesh_create_cylinder(
                bm_mount,
                radius=0.038,
                depth=0.045,
                segments=12,
                matrix=mat_trans(x_span * mult, y_pos, z_pos + 0.045)
            )
            obj_mount = create_bmesh_object(f"CHASSIS_Mount_{label}{sfx}", col_name, bm_mount)
            assign_material(obj_mount, mat_steel)
            objects.append(obj_mount)
            
    print(f"[HILUX] Chassis Frame generated with {len(objects)} objects.")
    return objects
