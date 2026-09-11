"""
Sedan Luxury Executive VIP Interior (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
try:
    from .sedan_common import (
        link_and_finish,
        BELTLINE_Z
    )
except ImportError:
    from sedan_common import (
        link_and_finish,
        BELTLINE_Z
    )

def build_luxury_interior(mats):
    created = []
    mat_leather = mats.get("leather_charcoal")
    mat_cognac = mats.get("leather_cognac")
    mat_carbon = mats.get("carbon")
    mat_screen = mats.get("screen")
    mat_chrome = mats.get("chrome")
    mat_ambient = mats.get("ambient_cyan")

    print("[SEDAN_INTERIOR] Generating Sculpted Dashboard, Curved Displays, Bucket Seats & Console...")

    # ------------------------------------------------------------------------
    # 1. SCULPTED LEATHER DASHBOARD & AIR VENTS
    # ------------------------------------------------------------------------
    bm_dash = bmesh.new()
    # Main Dashboard Upper Tier
    rc_db = bmesh.ops.create_cube(bm_dash, size=1.0)
    bmesh.ops.scale(bm_dash, vec=Vector((1.44, 0.44, 0.22)), verts=rc_db['verts'])
    bmesh.ops.translate(bm_dash, vec=Vector((0.00, 0.650, 0.810)), verts=rc_db['verts'])
    
    # Driver Binnacle Cowl
    rc_bc = bmesh.ops.create_cube(bm_dash, size=1.0)
    bmesh.ops.scale(bm_dash, vec=Vector((0.46, 0.28, 0.09)), verts=rc_bc['verts'])
    bmesh.ops.translate(bm_dash, vec=Vector((0.38, 0.580, 0.940)), verts=rc_bc['verts'])
    
    # Metal Air Vents
    for vx in [-0.58, -0.15, 0.15, 0.58]:
        rc_v = bmesh.ops.create_cube(bm_dash, size=1.0)
        bmesh.ops.scale(bm_dash, vec=Vector((0.10, 0.02, 0.045)), verts=rc_v['verts'])
        bmesh.ops.translate(bm_dash, vec=Vector((vx, 0.480, 0.760)), verts=rc_v['verts'])
        
    obj_dash = link_and_finish("GEO_Interior_Dashboard", "10_Luxury_Interior", bm_dash, mat_leather, bevel=0.006, subsurf=0)
    created.append(obj_dash)

    # Ambient LED Light Piping along dashboard
    bm_amb = bmesh.new()
    rc_am = bmesh.ops.create_cube(bm_amb, size=1.0)
    bmesh.ops.scale(bm_amb, vec=Vector((1.38, 0.015, 0.008)), verts=rc_am['verts'])
    bmesh.ops.translate(bm_amb, vec=Vector((0.00, 0.460, 0.740)), verts=rc_am['verts'])
    obj_amb = link_and_finish("GEO_Interior_Ambient_LED", "10_Luxury_Interior", bm_amb, mat_ambient, bevel=0.001, subsurf=0)
    created.append(obj_amb)

    # ------------------------------------------------------------------------
    # 2. CURVED DUAL AMOLED DIGITAL DISPLAYS
    # ------------------------------------------------------------------------
    bm_scr = bmesh.new()
    # Driver 12.3" Instrument Cluster
    rc_ic = bmesh.ops.create_cube(bm_scr, size=1.0)
    bmesh.ops.scale(bm_scr, vec=Vector((0.32, 0.020, 0.140)), verts=rc_ic['verts'])
    bmesh.ops.rotate(bm_scr, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-8), 4, 'X'), verts=rc_ic['verts'])
    bmesh.ops.translate(bm_scr, vec=Vector((0.380, 0.540, 0.920)), verts=rc_ic['verts'])
    
    # Central 14.9" Infotainment Touchscreen
    rc_if = bmesh.ops.create_cube(bm_scr, size=1.0)
    bmesh.ops.scale(bm_scr, vec=Vector((0.42, 0.020, 0.160)), verts=rc_if['verts'])
    bmesh.ops.rotate(bm_scr, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(10), 4, 'Z'), verts=rc_if['verts'])
    bmesh.ops.translate(bm_scr, vec=Vector((0.000, 0.560, 0.910)), verts=rc_if['verts'])
    
    obj_scr = link_and_finish("GEO_Interior_Digital_Screens", "10_Luxury_Interior", bm_scr, mat_screen, bevel=0.002, subsurf=0)
    created.append(obj_scr)

    # ------------------------------------------------------------------------
    # 3. 3-SPOKE MULTI-FUNCTION SPORTS STEERING WHEEL
    # ------------------------------------------------------------------------
    bm_sw = bmesh.new()
    # Outer Toroidal Rim
    rc_rim = bmesh.ops.create_cone(bm_sw, cap_ends=False, radius1=0.180, radius2=0.180, depth=0.030, segments=36)
    bmesh.ops.rotate(bm_sw, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-22), 4, 'X'), verts=rc_rim['verts'])
    bmesh.ops.translate(bm_sw, vec=Vector((0.380, 0.360, 0.820)), verts=rc_rim['verts'])
    bmesh.ops.solidify(bm_sw, geom=bm_sw.faces, thickness=0.025)
    
    # Central Airbag Boss Hub
    rc_hub = bmesh.ops.create_cone(bm_sw, cap_ends=True, radius1=0.065, radius2=0.065, depth=0.035, segments=24)
    bmesh.ops.rotate(bm_sw, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-22), 4, 'X'), verts=rc_hub['verts'])
    bmesh.ops.translate(bm_sw, vec=Vector((0.380, 0.380, 0.820)), verts=rc_hub['verts'])
    
    # Left, Right and Lower Spokes
    for spk_ang in [math.pi, 0, -math.pi/2]:
        spk = bmesh.ops.create_cube(bm_sw, size=1.0)
        bmesh.ops.scale(bm_sw, vec=Vector((0.030, 0.015, 0.120)), verts=spk['verts'])
        bmesh.ops.rotate(bm_sw, cent=Vector((0,0,0)), matrix=Matrix.Rotation(spk_ang, 4, 'Y'), verts=spk['verts'])
        bmesh.ops.rotate(bm_sw, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-22), 4, 'X'), verts=spk['verts'])
        bmesh.ops.translate(bm_sw, vec=Vector((
            0.380 + math.cos(spk_ang) * 0.08,
            0.370,
            0.820 + math.sin(spk_ang) * 0.08
        )), verts=spk['verts'])
        
    obj_sw = link_and_finish("GEO_Interior_Steering_Wheel", "10_Luxury_Interior", bm_sw, mat_leather, bevel=0.003, subsurf=0)
    created.append(obj_sw)

    # ------------------------------------------------------------------------
    # 4. FRONT EXECUTIVE SPORT BUCKET SEATS (DRIVER & PASSENGER)
    # ------------------------------------------------------------------------
    bm_seats = bmesh.new()
    for sx in [-0.38, 0.38]:
        # Seat Cushion Pan
        rc_cush = bmesh.ops.create_cube(bm_seats, size=1.0)
        bmesh.ops.scale(bm_seats, vec=Vector((0.46, 0.50, 0.14)), verts=rc_cush['verts'])
        bmesh.ops.translate(bm_seats, vec=Vector((sx, 0.050, 0.360)), verts=rc_cush['verts'])
        
        # Side Thigh Bolsters
        for bx in [-0.20, 0.20]:
            rc_bl = bmesh.ops.create_cube(bm_seats, size=1.0)
            bmesh.ops.scale(bm_seats, vec=Vector((0.08, 0.48, 0.10)), verts=rc_bl['verts'])
            bmesh.ops.translate(bm_seats, vec=Vector((sx + bx, 0.050, 0.420)), verts=rc_bl['verts'])
            
        # Ergonomic Backrest
        rc_bk = bmesh.ops.create_cube(bm_seats, size=1.0)
        bmesh.ops.scale(bm_seats, vec=Vector((0.44, 0.14, 0.58)), verts=rc_bk['verts'])
        bmesh.ops.rotate(bm_seats, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(14), 4, 'X'), verts=rc_bk['verts'])
        bmesh.ops.translate(bm_seats, vec=Vector((sx, -0.160, 0.680)), verts=rc_bk['verts'])
        
        # Adjustable Headrest
        rc_hr = bmesh.ops.create_cube(bm_seats, size=1.0)
        bmesh.ops.scale(bm_seats, vec=Vector((0.26, 0.10, 0.16)), verts=rc_hr['verts'])
        bmesh.ops.rotate(bm_seats, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(14), 4, 'X'), verts=rc_hr['verts'])
        bmesh.ops.translate(bm_seats, vec=Vector((sx, -0.280, 1.050)), verts=rc_hr['verts'])
        
    obj_seats = link_and_finish("GEO_Interior_Front_Seats", "10_Luxury_Interior", bm_seats, mat_leather, bevel=0.008, subsurf=0)
    created.append(obj_seats)

    # ------------------------------------------------------------------------
    # 5. REAR VIP EXECUTIVE LOUNGE BENCH SEATING
    # ------------------------------------------------------------------------
    bm_rear_seat = bmesh.new()
    # Rear Base Bench
    rc_rb = bmesh.ops.create_cube(bm_rear_seat, size=1.0)
    bmesh.ops.scale(bm_rear_seat, vec=Vector((1.38, 0.48, 0.16)), verts=rc_rb['verts'])
    bmesh.ops.translate(bm_rear_seat, vec=Vector((0.00, -0.820, 0.380)), verts=rc_rb['verts'])
    
    # Rear Backrest with individual contouring
    rc_rbk = bmesh.ops.create_cube(bm_rear_seat, size=1.0)
    bmesh.ops.scale(bm_rear_seat, vec=Vector((1.36, 0.14, 0.58)), verts=rc_rbk['verts'])
    bmesh.ops.rotate(bm_rear_seat, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(16), 4, 'X'), verts=rc_rbk['verts'])
    bmesh.ops.translate(bm_rear_seat, vec=Vector((0.00, -1.020, 0.690)), verts=rc_rbk['verts'])
    
    # 3 Rear Headrests
    for rx in [-0.42, 0.00, 0.42]:
        rc_rhr = bmesh.ops.create_cube(bm_rear_seat, size=1.0)
        bmesh.ops.scale(bm_rear_seat, vec=Vector((0.24, 0.09, 0.14)), verts=rc_rhr['verts'])
        bmesh.ops.rotate(bm_rear_seat, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(16), 4, 'X'), verts=rc_rhr['verts'])
        bmesh.ops.translate(bm_rear_seat, vec=Vector((rx, -1.140, 1.040)), verts=rc_rhr['verts'])
        
    obj_r_seats = link_and_finish("GEO_Interior_Rear_Seats", "10_Luxury_Interior", bm_rear_seat, mat_cognac, bevel=0.008, subsurf=0)
    created.append(obj_r_seats)

    # ------------------------------------------------------------------------
    # 6. CENTER CONSOLE, SHIFTER & ROTARY CONTROLLER
    # ------------------------------------------------------------------------
    bm_cc = bmesh.new()
    # Main console tunnel
    rc_cc = bmesh.ops.create_cube(bm_cc, size=1.0)
    bmesh.ops.scale(bm_cc, vec=Vector((0.28, 1.45, 0.24)), verts=rc_cc['verts'])
    bmesh.ops.translate(bm_cc, vec=Vector((0.00, 0.050, 0.440)), verts=rc_cc['verts'])
    
    # Armrest storage lid
    rc_ar = bmesh.ops.create_cube(bm_cc, size=1.0)
    bmesh.ops.scale(bm_cc, vec=Vector((0.26, 0.45, 0.08)), verts=rc_ar['verts'])
    bmesh.ops.translate(bm_cc, vec=Vector((0.00, -0.350, 0.580)), verts=rc_ar['verts'])
    
    # Gear selector joystick
    rc_sh = bmesh.ops.create_cube(bm_cc, size=1.0)
    bmesh.ops.scale(bm_cc, vec=Vector((0.045, 0.055, 0.080)), verts=rc_sh['verts'])
    bmesh.ops.translate(bm_cc, vec=Vector((0.05, 0.220, 0.600)), verts=rc_sh['verts'])
    
    # iDrive Rotary Dial
    rc_rot = bmesh.ops.create_cone(bm_cc, cap_ends=True, radius1=0.035, radius2=0.035, depth=0.025, segments=24)
    bmesh.ops.translate(bm_cc, vec=Vector((-0.05, 0.120, 0.575)), verts=rc_rot['verts'])
    
    obj_cc = link_and_finish("GEO_Interior_Center_Console", "10_Luxury_Interior", bm_cc, mat_carbon, bevel=0.005, subsurf=0)
    created.append(obj_cc)

    # ------------------------------------------------------------------------
    # 7. INNER DOOR CARDS & SPEAKER GRILLES (4 DOORS)
    # ------------------------------------------------------------------------
    bm_dp = bmesh.new()
    for sx in [-0.82, 0.82]:
        for dy, d_len in [(0.35, 0.88), (-0.75, 0.72)]:
            # Door card main panel
            rc_d = bmesh.ops.create_cube(bm_dp, size=1.0)
            bmesh.ops.scale(bm_dp, vec=Vector((0.060, d_len, 0.480)), verts=rc_d['verts'])
            bmesh.ops.translate(bm_dp, vec=Vector((sx, dy, 0.620)), verts=rc_d['verts'])
            
            # Door armrest ledge
            rc_al = bmesh.ops.create_cube(bm_dp, size=1.0)
            bmesh.ops.scale(bm_dp, vec=Vector((0.080, d_len * 0.7, 0.060)), verts=rc_al['verts'])
            bmesh.ops.translate(bm_dp, vec=Vector((sx * 0.95, dy, 0.620)), verts=rc_al['verts'])
            
            # Metallic speaker grille
            rc_spk = bmesh.ops.create_cone(bm_dp, cap_ends=True, radius1=0.065, radius2=0.065, depth=0.015, segments=24)
            bmesh.ops.rotate(bm_dp, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_spk['verts'])
            bmesh.ops.translate(bm_dp, vec=Vector((sx * 0.94, dy + 0.15, 0.480)), verts=rc_spk['verts'])
            
    obj_dp = link_and_finish("GEO_Interior_Door_Cards", "10_Luxury_Interior", bm_dp, mat_leather, bevel=0.006, subsurf=0)
    created.append(obj_dp)

    print(f"[SEDAN_INTERIOR] Successfully generated {len(created)} luxury interior objects.")
    return created
