"""
Sedan Class-A Exterior Body Panels (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
try:
    from .sedan_common import (
        link_mirrored, link_sided, link_and_finish, make_quad_patch,
        HOOD_REAR_Y, HOOD_FRONT_Y, COWL_Z, BELTLINE_Z,
        ROOF_FRONT_Y, ROOF_REAR_Y, ROOF_CROWN_Z,
        BACKLITE_BOTTOM_Y, TRUNK_REAR_LIP_Y, TRUNK_LIP_Z
    )
except ImportError:
    from sedan_common import (
        link_mirrored, link_sided, link_and_finish, make_quad_patch,
        HOOD_REAR_Y, HOOD_FRONT_Y, COWL_Z, BELTLINE_Z,
        ROOF_FRONT_Y, ROOF_REAR_Y, ROOF_CROWN_Z,
        BACKLITE_BOTTOM_Y, TRUNK_REAR_LIP_Y, TRUNK_LIP_Z
    )

def build_body_panels(mats):
    created = []
    mat_paint = mats.get("paint")
    mat_carbon = mats.get("carbon")
    mat_gloss = mats.get("gloss_black")

    print("[SEDAN_BODY] Generating Class-A Sculpted Body Panels...")

    # ------------------------------------------------------------------------
    # 1. SCULPTED HOOD / BONNET WITH POWERDOME (GEO_Hood)
    # ------------------------------------------------------------------------
    bm_hood = bmesh.new()
    hood_rows = []
    num_hood_stations = 9
    for i in range(num_hood_stations):
        t = i / float(num_hood_stations - 1)
        y = HOOD_REAR_Y + (HOOD_FRONT_Y - HOOD_REAR_Y) * t
        base_z = COWL_Z - 0.220 * t + 0.025 * math.sin(t * math.pi)
        w = 0.670 - 0.090 * t
        
        # Powerdome geometry
        pd_height = 0.028 * math.sin(t * math.pi * 0.9)
        
        hood_rows.append([
            Vector((0.000, y, base_z + pd_height + 0.012)),             # Center crease spine
            Vector((w * 0.28, y, base_z + pd_height + 0.022)),          # Powerdome crest
            Vector((w * 0.58, y, base_z + pd_height * 0.4 + 0.008)),    # Swage valley
            Vector((w * 0.82, y, base_z + 0.012)),                      # Outer crown
            Vector((w * 1.00, y, base_z)),                              # Fender shutline
        ])
    make_quad_patch(bm_hood, hood_rows)
    bmesh.ops.solidify(bm_hood, geom=bm_hood.faces, thickness=0.006)
    obj_hood = link_mirrored("GEO_Hood", "01_Body_Shell", bm_hood, mat_paint, bevel=0.003, subsurf=1)
    created.append(obj_hood)

    # ------------------------------------------------------------------------
    # 2. FRONT FENDERS WITH AERODYNAMIC AIR BREATHERS (L & R)
    # ------------------------------------------------------------------------
    bm_fender = bmesh.new()
    fender_rows = []
    f_y_pts = [2.300, 2.050, 1.800, 1.460, 1.150, 0.940]
    for f_y in f_y_pts:
        t_f = (f_y - 0.940) / (2.300 - 0.940)
        hood_x = 0.670 - 0.090 * t_f
        hood_z = COWL_Z - 0.220 * t_f + 0.025 * math.sin(t_f * math.pi)
        
        dy = f_y - 1.460
        if abs(dy) < 0.380:
            arch_z = 0.340 + math.sqrt(max(0.01, 0.380**2 - dy**2))
            flare_x = 0.945
            bot_z = arch_z
        else:
            flare_x = 0.925
            bot_z = 0.165

        # Door shutline match at Y = 0.940
        if abs(f_y - 0.940) < 1e-3:
            fender_rows.append([
                Vector((hood_x, f_y, hood_z)),
                Vector((0.770, f_y, 0.920)),
                Vector((0.865, f_y, 0.920)),                 # Matches front door beltline
                Vector((0.935, f_y, 0.740)),                 # Matches door shoulder crease
                Vector((0.885, f_y, 0.165)),                 # Matches rocker sill
            ])
        else:
            fender_rows.append([
                Vector((hood_x, f_y, hood_z)),
                Vector((hood_x + (flare_x - hood_x) * 0.35, f_y, hood_z - 0.04)),
                Vector((hood_x + (flare_x - hood_x) * 0.70, f_y, (hood_z + bot_z) * 0.55)),
                Vector((flare_x, f_y, (hood_z + bot_z) * 0.48)),
                Vector((flare_x, f_y, bot_z)),
            ])
    make_quad_patch(bm_fender, fender_rows)
    
    # Air Breather Vent Pocket behind front wheel
    rc_vent = bmesh.ops.create_cube(bm_fender, size=1.0)
    bmesh.ops.scale(bm_fender, vec=Vector((0.015, 0.14, 0.22)), verts=rc_vent['verts'])
    bmesh.ops.translate(bm_fender, vec=Vector((0.925, 1.08, 0.42)), verts=rc_vent['verts'])
    
    bmesh.ops.solidify(bm_fender, geom=bm_fender.faces, thickness=0.005)
    obj_fen_l, obj_fen_r = link_sided("GEO_Fender_FL", "GEO_Fender_FR", "01_Body_Shell", bm_fender, mat_paint, bevel=0.003, subsurf=1)
    created.extend([obj_fen_l, obj_fen_r])

    # ------------------------------------------------------------------------
    # 3. 4-DOOR ASSEMBLIES WITH ATHLETIC WAISTLINE TUCK & FLUSH POCKETS
    # ------------------------------------------------------------------------
    def make_door(y_start, y_end, is_rear=False):
        bm = bmesh.new()
        door_rows = []
        num_steps = 8
        for i in range(num_steps):
            t_d = i / float(num_steps - 1)
            cur_y = y_start + (y_end - y_start) * t_d
            x_waist = 0.935 if not is_rear else 0.955
            x_sill = 0.885
            door_rows.append([
                Vector((0.865, cur_y, BELTLINE_Z)),                      # Glass Beltline
                Vector((x_waist, cur_y, 0.740)),                         # Upper shoulder swage
                Vector((x_waist * 0.985, cur_y, 0.480)),                 # Scalloped waist tuck
                Vector((x_sill, cur_y, 0.165)),                          # Lower rocker sill
            ])
        make_quad_patch(bm, door_rows)
        
        # Flush Electronic Door Handle Pocket
        h_y = (y_start + y_end) * 0.5
        rc_h = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector((0.018, 0.15, 0.030)), verts=rc_h['verts'])
        bmesh.ops.translate(bm, vec=Vector((0.940, h_y, 0.880)), verts=rc_h['verts'])
        
        bmesh.ops.solidify(bm, geom=bm.faces, thickness=0.005)
        return bm

    bm_df = make_door(0.940, -0.280, is_rear=False)
    obj_df_l, obj_df_r = link_sided("GEO_Door_Front_L", "GEO_Door_Front_R", "01_Body_Shell", bm_df, mat_paint, bevel=0.003, subsurf=1)
    created.extend([obj_df_l, obj_df_r])

    bm_dr = make_door(-0.280, -1.280, is_rear=True)
    obj_dr_l, obj_dr_r = link_sided("GEO_Door_Rear_L", "GEO_Door_Rear_R", "01_Body_Shell", bm_dr, mat_paint, bevel=0.003, subsurf=1)
    created.extend([obj_dr_l, obj_dr_r])

    # ------------------------------------------------------------------------
    # 4. REAR QUARTER HAUNCHES (L & R) OVER 285/30R20 TIRES
    # ------------------------------------------------------------------------
    bm_rq = bmesh.new()
    rq_rows = []
    rq_y_pts = [-1.280, -1.460, -1.720, -1.980, -2.220, -2.380]
    for r_y in rq_y_pts:
        dy = r_y - (-1.460)
        if abs(dy) < 0.385:
            arch_z = 0.340 + math.sqrt(max(0.01, 0.385**2 - dy**2))
            flare_x = 0.975
            bot_z = arch_z
        else:
            flare_x = 0.945
            bot_z = 0.165
        
        t_rq = (r_y - (-1.280)) / (-2.380 - (-1.280))
        top_x = 0.865 - 0.280 * t_rq
        top_z = BELTLINE_Z + 0.095 * math.sin(t_rq * math.pi * 0.85)

        if abs(r_y - (-1.280)) < 1e-3:
            rq_rows.append([
                Vector((0.865, r_y, BELTLINE_Z)),
                Vector((0.955, r_y, 0.740)),
                Vector((0.940, r_y, 0.480)),
                Vector((0.885, r_y, 0.165)),
            ])
        else:
            rq_rows.append([
                Vector((top_x, r_y, top_z)),
                Vector((top_x + (flare_x - top_x) * 0.45, r_y, top_z - 0.10)),
                Vector((flare_x, r_y, (top_z + bot_z) * 0.50)),
                Vector((flare_x, r_y, bot_z)),
            ])
    make_quad_patch(bm_rq, rq_rows)
    bmesh.ops.solidify(bm_rq, geom=bm_rq.faces, thickness=0.005)
    obj_rq_l, obj_rq_r = link_sided("GEO_Quarter_Rear_L", "GEO_Quarter_Rear_R", "01_Body_Shell", bm_rq, mat_paint, bevel=0.003, subsurf=1)
    created.extend([obj_rq_l, obj_rq_r])

    # ------------------------------------------------------------------------
    # 5. DOUBLE-BUBBLE ROOF PANEL & SHARK FIN ANTENNA
    # ------------------------------------------------------------------------
    bm_roof = bmesh.new()
    roof_rows = []
    for i in range(8):
        t_r = i / 7.0
        r_y = ROOF_FRONT_Y + (ROOF_REAR_Y - ROOF_FRONT_Y) * t_r
        peak_z = ROOF_CROWN_Z + 0.015 * math.sin(t_r * math.pi)
        roof_rows.append([
            Vector((0.000, r_y, peak_z - 0.008)),              # Central aero depression
            Vector((0.220, r_y, peak_z + 0.006)),             # Double-bubble crown
            Vector((0.430, r_y, peak_z)),                     # Outer crown
            Vector((0.535, r_y, peak_z - 0.014)),             # Cantrail rebate
        ])
    make_quad_patch(bm_roof, roof_rows)
    
    # Shark Fin Aero Antenna
    rc_ant = bmesh.ops.create_cone(bm_roof, cap_ends=True, radius1=0.032, radius2=0.006, depth=0.080, segments=16)
    bmesh.ops.rotate(bm_roof, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-18), 4, 'X'), verts=rc_ant['verts'])
    bmesh.ops.translate(bm_roof, vec=Vector((0.0, -0.650, ROOF_CROWN_Z + 0.040)), verts=rc_ant['verts'])
    
    bmesh.ops.solidify(bm_roof, geom=bm_roof.faces, thickness=0.005)
    obj_roof = link_mirrored("GEO_Roof_Panel", "01_Body_Shell", bm_roof, mat_paint, bevel=0.003, subsurf=1)
    created.append(obj_roof)

    # ------------------------------------------------------------------------
    # 6. A-PILLARS & ROOF CANTRAIL RAILS (L & R) - SOLID CLOSED PROFILE
    # ------------------------------------------------------------------------
    bm_ap = bmesh.new()
    ap_stations = []
    for i in range(8):
        t_a = i / 7.0
        ay = HOOD_REAR_Y + (ROOF_FRONT_Y - HOOD_REAR_Y) * t_a
        az_roof = COWL_Z + (ROOF_CROWN_Z - COWL_Z) * t_a + 0.038 * math.sin(t_a * math.pi)
        ax_in = 0.650 + (0.535 - 0.650) * t_a
        ax_out = 0.770 + (0.565 - 0.770) * t_a
        
        # 4 vertices per cross section (Clockwise closed quad profile)
        v0 = bm_ap.verts.new(Vector((ax_in, ay, az_roof)))
        v1 = bm_ap.verts.new(Vector((ax_out, ay, az_roof - 0.008)))
        v2 = bm_ap.verts.new(Vector((ax_out - 0.015, ay, az_roof - 0.045)))
        v3 = bm_ap.verts.new(Vector((ax_in - 0.015, ay, az_roof - 0.035)))
        ap_stations.append((v0, v1, v2, v3))
        
    for i in range(len(ap_stations) - 1):
        s0 = ap_stations[i]
        s1 = ap_stations[i + 1]
        # 4 side faces
        bm_ap.faces.new((s0[0], s0[1], s1[1], s1[0]))
        bm_ap.faces.new((s0[1], s0[2], s1[2], s1[1]))
        bm_ap.faces.new((s0[2], s0[3], s1[3], s1[2]))
        bm_ap.faces.new((s0[3], s0[0], s1[0], s1[3]))
        
    # Cap start and end
    bm_ap.faces.new((ap_stations[0][3], ap_stations[0][2], ap_stations[0][1], ap_stations[0][0]))
    bm_ap.faces.new((ap_stations[-1][0], ap_stations[-1][1], ap_stations[-1][2], ap_stations[-1][3]))
    
    obj_ap_l, obj_ap_r = link_sided("GEO_A_Pillar_L", "GEO_A_Pillar_R", "01_Body_Shell", bm_ap, mat_paint, bevel=0.002, subsurf=0)
    created.extend([obj_ap_l, obj_ap_r])

    # ------------------------------------------------------------------------
    # 7. C-PILLARS / SAIL PANELS WITH HOFMEISTER KINK
    # ------------------------------------------------------------------------
    bm_cp = bmesh.new()
    cp_rows = []
    for i in range(8):
        t_c = i / 7.0
        cy = ROOF_REAR_Y + (BACKLITE_BOTTOM_Y - ROOF_REAR_Y) * t_c
        cz_top = ROOF_CROWN_Z + (1.040 - ROOF_CROWN_Z) * t_c + 0.032 * math.sin(t_c * math.pi)
        cx_in = 0.535 + (0.650 - 0.535) * t_c
        cz_bot = (ROOF_CROWN_Z - 0.02) * (1 - t_c) + 0.960 * t_c
        cx_out = 0.570 * (1 - t_c) + 0.885 * t_c
        cp_rows.append([
            Vector((cx_in, cy, cz_top)),
            Vector((cx_in + (cx_out - cx_in) * 0.40, cy, cz_top * 0.85 + cz_bot * 0.15)),
            Vector((cx_in + (cx_out - cx_in) * 0.75, cy, cz_top * 0.50 + cz_bot * 0.50)),
            Vector((cx_out, cy, cz_bot)),
        ])
    make_quad_patch(bm_cp, cp_rows)
    bmesh.ops.solidify(bm_cp, geom=bm_cp.faces, thickness=0.005)
    obj_cp = link_mirrored("GEO_C_Pillars", "01_Body_Shell", bm_cp, mat_paint, bevel=0.003, subsurf=1)
    created.append(obj_cp)

    # ------------------------------------------------------------------------
    # 8. SHADOWLINE PIANO BLACK B-PILLARS
    # ------------------------------------------------------------------------
    bm_bp = bmesh.new()
    for sx in [-1, 1]:
        rc_bp = bmesh.ops.create_cube(bm_bp, size=1.0)
        bmesh.ops.scale(bm_bp, vec=Vector((0.022, 0.070, 0.510)), verts=rc_bp['verts'])
        bmesh.ops.translate(bm_bp, vec=Vector((sx * 0.710, -0.280, 1.175)), verts=rc_bp['verts'])
    obj_bp = link_and_finish("GEO_B_Pillars", "01_Body_Shell", bm_bp, mat_gloss, bevel=0.002, subsurf=0)
    created.append(obj_bp)

    # ------------------------------------------------------------------------
    # 9. TRUNK DECKLID WITH INTEGRATED CARBON DUCKTAIL SPOILER
    # ------------------------------------------------------------------------
    bm_trunk = bmesh.new()
    trunk_rows = []
    for i in range(7):
        t_t = i / 6.0
        t_y = BACKLITE_BOTTOM_Y + (TRUNK_REAR_LIP_Y - BACKLITE_BOTTOM_Y) * t_t
        t_z = 1.040 - 0.025 * t_t + (0.022 * (t_t**2))
        w_tk = 0.650 - 0.080 * t_t
        trunk_rows.append([
            Vector((0.000, t_y, t_z)),
            Vector((w_tk * 0.35, t_y, t_z * 0.995)),
            Vector((w_tk * 0.72, t_y, t_z * 0.990)),
            Vector((w_tk * 1.00, t_y, t_z * 0.982)),
        ])
    make_quad_patch(bm_trunk, trunk_rows)
    
    # Integrated Carbon Ducktail Lip
    rc_spk = bmesh.ops.create_cube(bm_trunk, size=1.0)
    bmesh.ops.scale(bm_trunk, vec=Vector((0.58, 0.070, 0.025)), verts=rc_spk['verts'])
    bmesh.ops.rotate(bm_trunk, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-14), 4, 'X'), verts=rc_spk['verts'])
    bmesh.ops.translate(bm_trunk, vec=Vector((0.0, TRUNK_REAR_LIP_Y + 0.010, TRUNK_LIP_Z + 0.020)), verts=rc_spk['verts'])
    
    bmesh.ops.solidify(bm_trunk, geom=bm_trunk.faces, thickness=0.005)
    obj_trunk = link_mirrored("GEO_Trunk_Decklid", "01_Body_Shell", bm_trunk, mat_paint, bevel=0.003, subsurf=1)
    created.append(obj_trunk)

    print(f"[SEDAN_BODY] Successfully generated {len(created)} body shell objects.")
    return created
