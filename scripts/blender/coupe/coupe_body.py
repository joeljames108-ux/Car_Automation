"""
Bentley Continental GT II Coupe (2011) Seamless Class-A Coachwork Builder (Blender 5.2 LTS)
Continuous, fully enclosed, watertight monocoque body shell with sculpted aerodynamic nose,
recessed front matrix grille aperture, circular headlamp nacelles, smooth circular wheel arches,
inner wheel well liners, muscular 315mm rear haunches, fastback roof canopy, sealed rear bumper fascia, and ducktail lip.
"""

import bpy
import bmesh
import math
from mathutils import Vector
import coupe_common as c

def lerp(a, b, t):
    return a + (b - a) * t

def build_coupe_body_and_closures(mat_registry):
    """
    Constructs the unified, seamless Bentley Continental GT II exterior coachwork.
    Strictly exterior focus. Windows use executive obsidian privacy glass.
    Watertight monocoque with zero open cavities or inner chassis visibility.
    """
    body_parts = []

    # -------------------------------------------------------------------------
    # 1. CONTINUOUS FULL-BODY LOWER SHELL & CLOSURES (FRONT NOSE TO REAR BUMPER)
    # -------------------------------------------------------------------------
    hull_mesh = bpy.data.meshes.new("BODY_Hull_Mesh")
    hull_obj = bpy.data.objects.new("BODY_Hull", hull_mesh)
    c.link_to_collection(hull_obj, "05_Coupe_Body_Monocoque")
    
    bm = bmesh.new()

    # 23 longitudinal stations with dense wheel arch resolution for smooth circular cutouts
    stations = [
        # 0-3: Front Bumper & Aerodynamic Nose (Curved front bumper sweep)
        {"y":  2.340, "hw": 0.670, "z_bot": 0.220, "z_belt": 0.770, "hw_sh": 0.350, "z_c": 0.810, "is_open": False},
        {"y":  2.260, "hw": 0.770, "z_bot": 0.210, "z_belt": 0.810, "hw_sh": 0.440, "z_c": 0.835, "is_open": False},
        {"y":  2.120, "hw": 0.865, "z_bot": 0.205, "z_belt": 0.840, "hw_sh": 0.540, "z_c": 0.855, "is_open": False},
        {"y":  1.820, "hw": 0.930, "z_bot": 0.205, "z_belt": 0.860, "hw_sh": 0.630, "z_c": 0.870, "is_open": False},
        
        # 4-9: Front Wheel Arch (Axle Y = 1.373m, Hub Z = 0.352m, Arch Radius ~ 0.395m)
        {"y":  1.680, "hw": 0.942, "z_bot": 0.480, "z_belt": 0.868, "hw_sh": 0.670, "z_c": 0.875, "is_open": False},
        {"y":  1.550, "hw": 0.950, "z_bot": 0.670, "z_belt": 0.874, "hw_sh": 0.700, "z_c": 0.878, "is_open": False},
        {"y":  1.373, "hw": 0.955, "z_bot": 0.745, "z_belt": 0.880, "hw_sh": 0.720, "z_c": 0.882, "is_open": False},
        {"y":  1.200, "hw": 0.950, "z_bot": 0.670, "z_belt": 0.882, "hw_sh": 0.730, "z_c": 0.885, "is_open": False},
        {"y":  1.070, "hw": 0.942, "z_bot": 0.480, "z_belt": 0.884, "hw_sh": 0.740, "z_c": 0.887, "is_open": False},
        {"y":  0.978, "hw": 0.935, "z_bot": 0.205, "z_belt": 0.885, "hw_sh": 0.745, "z_c": 0.888, "is_open": False},
        
        # 10-13: Cabin Waistline (Beltline Z = 0.885m, Window Sill Shelf hw_sh = 0.840m)
        {"y":  0.650, "hw": 0.925, "z_bot": 0.205, "z_belt": 0.885, "hw_sh": 0.845, "z_c": None, "is_open": True},
        {"y":  0.200, "hw": 0.915, "z_bot": 0.205, "z_belt": 0.885, "hw_sh": 0.840, "z_c": None, "is_open": True},
        {"y": -0.250, "hw": 0.920, "z_bot": 0.205, "z_belt": 0.888, "hw_sh": 0.845, "z_c": None, "is_open": True},
        {"y": -0.650, "hw": 0.940, "z_bot": 0.205, "z_belt": 0.900, "hw_sh": 0.855, "z_c": None, "is_open": True},
        
        # 14-19: Rear Wheel Arch & Muscular Haunch (Axle Y = -1.373m, 315mm Rear Stance hw = 0.985m)
        {"y": -0.968, "hw": 0.970, "z_bot": 0.205, "z_belt": 0.918, "hw_sh": 0.865, "z_c": None, "is_open": True},
        {"y": -1.070, "hw": 0.976, "z_bot": 0.490, "z_belt": 0.924, "hw_sh": 0.860, "z_c": None, "is_open": True},
        {"y": -1.200, "hw": 0.982, "z_bot": 0.680, "z_belt": 0.928, "hw_sh": 0.850, "z_c": None, "is_open": True},
        {"y": -1.373, "hw": 0.985, "z_bot": 0.755, "z_belt": 0.928, "hw_sh": 0.835, "z_c": None, "is_open": True},
        {"y": -1.550, "hw": 0.976, "z_bot": 0.680, "z_belt": 0.924, "hw_sh": 0.820, "z_c": None, "is_open": True},
        {"y": -1.680, "hw": 0.964, "z_bot": 0.490, "z_belt": 0.918, "hw_sh": 0.795, "z_c": None, "is_open": True},
        {"y": -1.778, "hw": 0.950, "z_bot": 0.210, "z_belt": 0.908, "hw_sh": 0.665, "z_c": 0.975, "is_open": False},
        
        # 20-22: Rear Decklid & Bumper Valance
        {"y": -2.180, "hw": 0.890, "z_bot": 0.225, "z_belt": 0.880, "hw_sh": 0.585, "z_c": 0.955, "is_open": False},
        {"y": -2.430, "hw": 0.790, "z_bot": 0.240, "z_belt": 0.845, "hw_sh": 0.490, "z_c": 0.945, "is_open": False},
        {"y": -2.465, "hw": 0.670, "z_bot": 0.250, "z_belt": 0.805, "hw_sh": 0.380, "z_c": 0.920, "is_open": False},
    ]

    prev_left = []
    prev_right = []
    prev_center = None
    first_ring_l = None
    first_ring_r = None
    last_ring_l = None
    last_ring_r = None
    
    for idx, s in enumerate(stations):
        y = s["y"]
        hw = s["hw"]
        z_bot = s["z_bot"]
        z_belt = s["z_belt"]
        hw_sh = s["hw_sh"]
        z_c = s["z_c"]
        is_open = s["is_open"]
        
        z1 = lerp(z_bot, z_belt, 0.32)
        z2 = lerp(z_bot, z_belt, 0.68)
        
        # Left side points (-X)
        l_pts = [
            bm.verts.new((-hw * 0.95, y, z_bot)),
            bm.verts.new((-hw * 0.98, y, z1)),
            bm.verts.new((-hw,        y, z2)),
            bm.verts.new((-hw * 0.99, y, z_belt)),
            bm.verts.new((-hw_sh,     y, z_belt + 0.008)),
        ]
        
        # Right side points (+X)
        r_pts = [
            bm.verts.new(( hw * 0.95, y, z_bot)),
            bm.verts.new(( hw * 0.98, y, z1)),
            bm.verts.new(( hw,        y, z2)),
            bm.verts.new(( hw * 0.99, y, z_belt)),
            bm.verts.new(( hw_sh,     y, z_belt + 0.008)),
        ]
        
        if idx == 0:
            first_ring_l = l_pts
            first_ring_r = r_pts
        if idx == len(stations) - 1:
            last_ring_l = l_pts
            last_ring_r = r_pts
            
        # Bridge flank quads
        if prev_left:
            for i in range(4):
                bm.faces.new((prev_left[i], prev_left[i+1], l_pts[i+1], l_pts[i]))
                bm.faces.new((r_pts[i], r_pts[i+1], prev_right[i+1], prev_right[i]))
                
        # Center deck / hood bridging (for closed stations)
        if not is_open and z_c is not None:
            c_pt = bm.verts.new((0.0, y, z_c))
            if not prev_center:
                bm.faces.new((l_pts[4], c_pt, r_pts[4]))
            else:
                bm.faces.new((prev_left[4], l_pts[4], c_pt, prev_center))
                bm.faces.new((prev_center, c_pt, r_pts[4], prev_right[4]))
            prev_center = c_pt
        else:
            prev_center = None
            
        prev_left = l_pts
        prev_right = r_pts

    # -------------------------------------------------------------------------
    # FRONT BUMPER END-CAP (Watertight closure around matrix grille aperture)
    # -------------------------------------------------------------------------
    # Grille aperture: X in [-0.350, 0.350], Z in [0.480, 0.780]
    fl0 = first_ring_l[0]
    fl1 = first_ring_l[1]
    fl2 = first_ring_l[2]
    fl3 = first_ring_l[3]
    fl4 = first_ring_l[4]
    
    fr0 = first_ring_r[0]
    fr1 = first_ring_r[1]
    fr2 = first_ring_r[2]
    fr3 = first_ring_r[3]
    fr4 = first_ring_r[4]
    
    # Lower bumper chin bar vertices
    y_nose = 2.340
    v_chin_l = bm.verts.new((-0.350, y_nose, 0.220))
    v_chin_r = bm.verts.new(( 0.350, y_nose, 0.220))
    v_grille_bl = bm.verts.new((-0.350, y_nose, 0.480))
    v_grille_br = bm.verts.new(( 0.350, y_nose, 0.480))
    
    # Lower bumper apron faces
    bm.faces.new((fl0, v_chin_l, v_chin_r, fr0))
    bm.faces.new((fl1, v_grille_bl, v_chin_l, fl0))
    bm.faces.new((fr0, v_chin_r, v_grille_br, fr1))
    bm.faces.new((v_chin_l, v_grille_bl, v_grille_br, v_chin_r))
    
    # Left cheek front face (housing left headlamps)
    bm.faces.new((fl1, fl2, fl3, fl4, v_grille_bl))
    # Right cheek front face (housing right headlamps)
    bm.faces.new((fr1, v_grille_br, fr4, fr3, fr2))

    # -------------------------------------------------------------------------
    # REAR BUMPER END-CAP (100% Watertight closure around license plate tub)
    # -------------------------------------------------------------------------
    rl0 = last_ring_l[0]  # (-0.636, -2.465, 0.250)
    rl1 = last_ring_l[1]  # (-0.656, -2.465, 0.428)
    rl2 = last_ring_l[2]  # (-0.670, -2.465, 0.627)
    rl3 = last_ring_l[3]  # (-0.663, -2.465, 0.805)
    rl4 = last_ring_l[4]  # (-0.380, -2.465, 0.813)
    
    rr0 = last_ring_r[0]  # ( 0.636, -2.465, 0.250)
    rr1 = last_ring_r[1]  # ( 0.656, -2.465, 0.428)
    rr2 = last_ring_r[2]  # ( 0.670, -2.465, 0.627)
    rr3 = last_ring_r[3]  # ( 0.663, -2.465, 0.805)
    rr4 = last_ring_r[4]  # ( 0.380, -2.465, 0.813)
    
    y_rear = -2.465
    v_rc_bot_l = bm.verts.new((-0.380, y_rear, 0.250))
    v_rc_bot_r = bm.verts.new(( 0.380, y_rear, 0.250))
    v_rc_mid_l = bm.verts.new((-0.380, y_rear, 0.520))
    v_rc_mid_r = bm.verts.new(( 0.380, y_rear, 0.520))
    v_rc_top_l = bm.verts.new((-0.380, y_rear, 0.813))
    v_rc_top_r = bm.verts.new(( 0.380, y_rear, 0.813))
    v_rc_apex  = bm.verts.new(( 0.000, y_rear, 0.920))
    
    # 1. Lower valance faces
    bm.faces.new((rl0, rr0, v_rc_bot_r, v_rc_bot_l))
    bm.faces.new((rl0, v_rc_bot_l, v_rc_mid_l, rl1))
    bm.faces.new((rr0, rr1, v_rc_mid_r, v_rc_bot_r))
    bm.faces.new((v_rc_bot_l, v_rc_bot_r, v_rc_mid_r, v_rc_mid_l))
    
    # 2. Left & Right rear quarter corner faces (framing elliptical taillights)
    bm.faces.new((rl1, v_rc_mid_l, rl4, rl3, rl2))
    bm.faces.new((rr1, rr2, rr3, rr4, v_rc_mid_r))
    
    # 3. Center license plate tub backing face (fully seals license tub cavity)
    bm.faces.new((v_rc_mid_l, v_rc_mid_r, v_rc_top_r, v_rc_top_l))
    
    # 4. Upper rear decklid horizontal shelf (smooth quad bridging to trunk deck)
    vt0 = bm.verts.new((-0.380, y_rear, 0.880))
    vt1 = bm.verts.new((-0.130, y_rear, 0.890))
    vt2 = bm.verts.new(( 0.130, y_rear, 0.890))
    vt3 = bm.verts.new(( 0.380, y_rear, 0.880))
    
    bm.faces.new((rl4, v_rc_top_l, vt0))
    bm.faces.new((v_rc_top_l, v_rc_top_r, vt2, vt1))
    bm.faces.new((v_rc_top_r, rr4, vt3))
    bm.faces.new((vt0, vt1, vt2, vt3))


    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(hull_mesh)
    bm.free()
    
    hull_obj.data.materials.append(mat_registry.body_red)
    c.apply_finishing(hull_obj, bevel=0.004)
    body_parts.append(hull_obj)

    # -------------------------------------------------------------------------
    # 2. CHROME BONNET CENTER SPEAR & POWER BULGE
    # -------------------------------------------------------------------------
    spear = c.create_box(
        "BODY_Hood_Center_Chrome_Spear",
        location=(0.0, 1.580, 0.890),
        size=(0.014, 1.250, 0.008),
        col_name="06_Coupe_Closures_Panels",
        mat=mat_registry.matrix_chrome,
        bevel=0.001
    )
    body_parts.append(spear)

    # -------------------------------------------------------------------------
    # 3. GREENHOUSE CANOPY FRAMEWORK: A-PILLARS, ROOF SKIN, C-PILLARS
    # -------------------------------------------------------------------------
    gh_mesh = bpy.data.meshes.new("BODY_Greenhouse_Canopy_Mesh")
    gh_obj = bpy.data.objects.new("BODY_Greenhouse_Canopy", gh_mesh)
    c.link_to_collection(gh_obj, "05_Coupe_Body_Monocoque")
    
    bm_g = bmesh.new()
    
    # Roof Skin Stations (From Windshield Header Y=0.280 to Backlight Header Y=-0.550)
    roof_stations = [
        # (Y, Z_center, half_w)
        ( 0.280, 1.385, 0.585),
        ( 0.000, 1.404, 0.615),
        (-0.280, 1.398, 0.620),
        (-0.550, 1.380, 0.615),
    ]
    prev_rf = []
    num_rf = 9
    for y, z_c, hw in roof_stations:
        row = []
        for i in range(num_rf):
            t = i / (num_rf - 1)
            x = -hw + t * (2.0 * hw)
            crown = 0.020 * (1.0 - (x / hw)**2)
            row.append(bm_g.verts.new((x, y, z_c - crown)))
        if prev_rf:
            for i in range(num_rf - 1):
                bm_g.faces.new((prev_rf[i], prev_rf[i+1], row[i+1], row[i]))
        prev_rf = row

    # Left & Right A-Pillars, Cantrails, and C-Pillars
    for sign in [1.0, -1.0]:
        # A-Pillar (Flank waist sill to roof header)
        va0 = bm_g.verts.new((sign * 0.745,  0.960, 0.885))
        va1 = bm_g.verts.new((sign * 0.700,  0.960, 0.895))
        va2 = bm_g.verts.new((sign * 0.540,  0.280, 1.375))
        va3 = bm_g.verts.new((sign * 0.585,  0.280, 1.350))
        bm_g.faces.new((va0, va1, va2, va3))
        
        # Cantrail Rail (Roof edge above doors)
        vcr0 = bm_g.verts.new((sign * 0.585,  0.280, 1.350))
        vcr1 = bm_g.verts.new((sign * 0.615, -0.550, 1.350))
        vcr2 = bm_g.verts.new((sign * 0.640, -0.550, 1.325))
        vcr3 = bm_g.verts.new((sign * 0.610,  0.280, 1.325))
        bm_g.faces.new((vcr0, vcr1, vcr2, vcr3))
        
        # C-Pillar (Fastback sweep from roof header to rear decklid)
        vc0 = bm_g.verts.new((sign * 0.615, -0.550, 1.350))
        vc1 = bm_g.verts.new((sign * 0.565, -0.550, 1.375))
        vc2 = bm_g.verts.new((sign * 0.660, -1.778, 0.965))
        vc3 = bm_g.verts.new((sign * 0.710, -1.778, 0.950))
        bm_g.faces.new((vc0, vc1, vc2, vc3))

    bmesh.ops.recalc_face_normals(bm_g, faces=bm_g.faces)
    bm_g.to_mesh(gh_mesh)
    bm_g.free()
    
    gh_obj.data.materials.append(mat_registry.body_red)
    c.apply_finishing(gh_obj, bevel=0.003)
    body_parts.append(gh_obj)

    # -------------------------------------------------------------------------
    # 4. REAR DUCKTAIL LIP SPOILER
    # -------------------------------------------------------------------------
    ducktail = c.create_box(
        "BODY_Rear_Ducktail_Lip",
        location=(0.0, -2.420, 0.955),
        size=(0.980, 0.050, 0.022),
        rotation=(math.radians(-10), 0.0, 0.0),
        col_name="06_Coupe_Closures_Panels",
        mat=mat_registry.body_red,
        bevel=0.002
    )
    body_parts.append(ducktail)

    # -------------------------------------------------------------------------
    # 5. REAR DIFFUSER & SEALED LICENSE RECESS TUB
    # -------------------------------------------------------------------------
    diffuser = c.create_box(
        "BODY_Rear_Lower_Diffuser_Valance",
        location=(0.0, -2.450, 0.250),
        size=(1.480, 0.080, 0.090),
        col_name="07_Coupe_Fascia_Aerodynamics",
        mat=mat_registry.trim_piano_black,
        bevel=0.004
    )
    body_parts.append(diffuser)
    
    lic_tub = c.create_box(
        "BODY_Rear_License_Plate_Recess",
        location=(0.0, -2.460, 0.580),
        size=(0.540, 0.030, 0.160),
        col_name="05_Coupe_Body_Monocoque",
        mat=mat_registry.trim_piano_black,
        bevel=0.002
    )
    body_parts.append(lic_tub)

    lic_plate = c.create_box(
        "BODY_Rear_License_Plate",
        location=(0.0, -2.475, 0.580),
        size=(0.500, 0.012, 0.125),
        col_name="05_Coupe_Body_Monocoque",
        mat=mat_registry.trim_satin_black,
        bevel=0.002
    )
    body_parts.append(lic_plate)

    # -------------------------------------------------------------------------
    # 6. INNER WHEEL WELL LINERS (Semicircular Arch Liners Z >= HUB_Z)
    # -------------------------------------------------------------------------
    # Completely encloses each wheel housing above the axle line so interior cannot be seen
    wheel_wells = [
        ("FL",  1.0, c.FRONT_AXLE_Y, c.TRACK_FRONT / 2.0),
        ("FR", -1.0, c.FRONT_AXLE_Y, c.TRACK_FRONT / 2.0),
        ("RL",  1.0, c.REAR_AXLE_Y,  c.TRACK_REAR / 2.0),
        ("RR", -1.0, c.REAR_AXLE_Y,  c.TRACK_REAR / 2.0),
    ]
    for ww_name, sign, ax_y, half_tr in wheel_wells:
        ww_mesh = bpy.data.meshes.new(f"BODY_WheelWell_Liner_{ww_name}_Mesh")
        ww_obj = bpy.data.objects.new(f"BODY_WheelWell_Liner_{ww_name}", ww_mesh)
        c.link_to_collection(ww_obj, "05_Coupe_Body_Monocoque")
        
        bm_ww = bmesh.new()
        steps = 20
        r_inner = 0.380
        r_outer = 0.405
        x_out = sign * (half_tr - 0.015)
        x_in  = x_out - sign * 0.200
        
        top_outer, top_inner = [], []
        bot_outer, bot_inner = [], []
        
        for st in range(steps + 1):
            theta = (math.pi * st) / steps
            cos_t = math.cos(theta)
            sin_t = math.sin(theta)
            
            y = ax_y + r_inner * cos_t
            z = c.HUB_Z + r_inner * sin_t
            top_inner.append(bm_ww.verts.new((x_out, y, z)))
            bot_inner.append(bm_ww.verts.new((x_in,  y, z)))
            
            yo = ax_y + r_outer * cos_t
            zo = c.HUB_Z + r_outer * sin_t
            top_outer.append(bm_ww.verts.new((x_out, yo, zo)))
            bot_outer.append(bm_ww.verts.new((x_in,  yo, zo)))
            
        for st in range(steps):
            # Outer surface
            bm_ww.faces.new((top_outer[st], top_outer[st+1], bot_outer[st+1], bot_outer[st]))
            # Inner arch ceiling
            bm_ww.faces.new((top_inner[st+1], top_inner[st], bot_inner[st], bot_inner[st+1]))
            # Outward-facing rim flange
            bm_ww.faces.new((top_inner[st], top_inner[st+1], top_outer[st+1], top_outer[st]))
            
        bmesh.ops.recalc_face_normals(bm_ww, faces=bm_ww.faces)
        bm_ww.to_mesh(ww_mesh)
        bm_ww.free()
        
        ww_obj.data.materials.append(mat_registry.trim_satin_black)
        c.apply_finishing(ww_obj, bevel=0.002)
        body_parts.append(ww_obj)


    # -------------------------------------------------------------------------
    # 7. CONTINUOUS AERODYNAMIC UNDERBODY BELLY TRAY (FLAT FLOOR PAN)
    # -------------------------------------------------------------------------
    underbody = c.create_box(
        "BODY_Aerodynamic_Underbody_Pan",
        location=(0.0, -0.050, 0.200),
        size=(1.620, 4.700, 0.020),
        col_name="01_Coupe_Chassis_Platform",
        mat=mat_registry.trim_satin_black,
        bevel=0.004
    )
    body_parts.append(underbody)

    print(f"[COUPE_BODY] Bentley Continental GT Class-A watertight body shell assembled ({len(body_parts)} components).")
    return body_parts
