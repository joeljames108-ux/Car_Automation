"""
Bus Panoramic Glazing & Tinted Safety Glass Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
Volvo 9700 H 13m (2006) Tri-Axle High-Floor Luxury Touring Coach Specification
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def build_bus_glazing(mat_registry):
    """Constructs raked panoramic curved windshield with perimeter frit frame, flush tinted side windows, and rear window."""
    created_objects = []
    
    bw = c.OVERALL_WIDTH
    bl = c.OVERALL_LENGTH
    
    # -------------------------------------------------------------------------
    # 1. RAKED PANORAMIC FRONT CURVED WINDSHIELD
    # -------------------------------------------------------------------------
    ws_mesh = bpy.data.meshes.new("GLASS_Panoramic_Windshield_Mesh")
    ws_obj = bpy.data.objects.new("GLASS_Panoramic_Windshield", ws_mesh)
    
    bm = bmesh.new()
    ws_w = bw - 0.140 # 2.410m
    ws_h = 1.820
    ws_z_base = 1.180
    ws_z_top = ws_z_base + ws_h
    ws_z_mid = (ws_z_base + ws_z_top) / 2.0
    
    # Curved panoramic windshield profile (curving around corners and raking rearward)
    segments_u = 28
    segments_v = 10
    
    for v_idx in range(segments_v + 1):
        v_fac = v_idx / segments_v
        z_curr = ws_z_base + v_fac * ws_h
        # Aerodynamic backward rake: windshield slopes back from Y=6.15m at base to Y=5.62m at top
        y_rake = c.FRONT_BUMPER_Y - 0.350 - 0.530 * v_fac
        
        for u_idx in range(segments_u + 1):
            u_fac = u_idx / segments_u
            x_curr = -ws_w / 2.0 + u_fac * ws_w
            # Corner aerodynamic wrap-around (parabolic curve around A-pillars)
            norm_x = (u_fac - 0.5) * 2.0 # -1.0 to +1.0
            corner_pull_y = -0.160 * (norm_x**2)
            
            bm.verts.new(Vector((x_curr, y_rake + corner_pull_y, z_curr)))
            
    bm.verts.ensure_lookup_table()
    for v_idx in range(segments_v):
        for u_idx in range(segments_u):
            v1 = bm.verts[v_idx * (segments_u + 1) + u_idx]
            v2 = bm.verts[v_idx * (segments_u + 1) + u_idx + 1]
            v3 = bm.verts[(v_idx + 1) * (segments_u + 1) + u_idx + 1]
            v4 = bm.verts[(v_idx + 1) * (segments_u + 1) + u_idx]
            bm.faces.new((v1, v2, v3, v4))
            
    bm.to_mesh(ws_mesh)
    bm.free()
    
    c.link_to_collection(ws_obj, "03_Bus_Glazing_Windows")
    ws_obj.data.materials.append(mat_registry.glass_clear if hasattr(mat_registry, "glass_clear") else mat_registry.glass_tinted)
    c.apply_finishing(ws_obj, bevel=0.002)
    created_objects.append(ws_obj)
    
    # Windshield Black Ceramic Frit Frame (PERIMETER ONLY - SLEEK SILK-SCREEN BORDER)
    # Top Frit Sunband Mask
    top_frit = c.create_box(
        "GLASS_Windshield_Frit_Top_Sunband",
        location=(0.0, c.FRONT_BUMPER_Y - 0.780, ws_z_top - 0.050),
        size=(ws_w - 0.060, 0.015, 0.100),
        col_name="03_Bus_Glazing_Windows",
        mat=mat_registry.glass_frit
    )
    created_objects.append(top_frit)
    
    # Bottom Cowl Frit Mask (Sleek Acoustic Seal Border)
    btm_frit = c.create_box(
        "GLASS_Windshield_Frit_Bottom_Cowl",
        location=(0.0, c.FRONT_BUMPER_Y - 0.365, ws_z_base + 0.022),
        size=(ws_w - 0.060, 0.015, 0.045),
        col_name="03_Bus_Glazing_Windows",
        mat=mat_registry.glass_frit
    )
    created_objects.append(btm_frit)
    
    # Left & Right A-Pillar Frit Border Strips (Thin Modern Silk-Screen Matrix)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        a_frit = c.create_box(
            f"GLASS_Windshield_Frit_APillar_{side}",
            location=(sign * (ws_w/2.0 - 0.025), c.FRONT_BUMPER_Y - 0.580, ws_z_mid),
            size=(0.035, 0.060, ws_h - 0.040),
            col_name="03_Bus_Glazing_Windows",
            mat=mat_registry.glass_frit
        )
        created_objects.append(a_frit)

    # -------------------------------------------------------------------------
    # 2. FLUSH PANORAMIC SIDE PASSENGER WINDOW RIBBONS
    # -------------------------------------------------------------------------
    side_win_len = 9.800
    side_win_h = 1.620
    side_win_z = c.BELTLINE_Z + side_win_h / 2.0 # 2.390m
    side_win_y = -0.350 # Centered along cabin
    
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # Continuous tinted optical panoramic glass ribbon
        side_glass = c.create_box(
            f"GLASS_Side_Passenger_Ribbon_{side}",
            location=(sign * (bw/2.0 + 0.020), side_win_y, side_win_z),
            size=(0.018, side_win_len, side_win_h),
            col_name="03_Bus_Glazing_Windows",
            mat=mat_registry.glass_tinted
        )
        created_objects.append(side_glass)
        
        # 6 High-Floor Luxury Coach Window Bays divided by 7 Satin Black Structural Sub-Pillars
        num_pillars = 7
        bay_step = side_win_len / (num_pillars - 1)
        for p_idx in range(num_pillars):
            pillar_y = side_win_y - side_win_len/2.0 + p_idx * bay_step
            pillar = c.create_box(
                f"GLASS_Pillar_Divider_{side}_{p_idx+1:02d}",
                location=(sign * (bw/2.0 + 0.024), pillar_y, side_win_z),
                size=(0.025, 0.060, side_win_h + 0.020),
                col_name="03_Bus_Glazing_Windows",
                mat=mat_registry.trim_satin_black
            )
            created_objects.append(pillar)

    # 3. Driver Left Electric Sliding Toll Window
    driver_toll_win = c.create_box(
        "GLASS_Driver_Toll_Window_Frame",
        location=(1.0 * (bw/2.0 + 0.024), 4.750, side_win_z - 0.180),
        size=(0.025, 0.880, 0.720),
        col_name="03_Bus_Glazing_Windows",
        mat=mat_registry.trim_satin_black
    )
    created_objects.append(driver_toll_win)
    
    # 4. Rear Passenger Cabin Heated Backlight Window
    rear_win_h = 0.950
    rear_win_w = bw - 0.440
    rear_win_z = c.ROOF_BODY_Z - 0.580
    rear_glass = c.create_box(
        "GLASS_Rear_Backlight_Window",
        location=(0.0, c.REAR_BUMPER_Y + 0.035, rear_win_z),
        size=(rear_win_w, 0.020, rear_win_h),
        col_name="03_Bus_Glazing_Windows",
        mat=mat_registry.glass_tinted
    )
    created_objects.append(rear_glass)
    
    # Rear Ceramic Frit Masking Border
    rear_frit = c.create_box(
        "GLASS_Rear_Backlight_Frit_Mask",
        location=(0.0, c.REAR_BUMPER_Y + 0.040, rear_win_z),
        size=(rear_win_w + 0.040, 0.015, rear_win_h + 0.040),
        col_name="03_Bus_Glazing_Windows",
        mat=mat_registry.glass_frit
    )
    created_objects.append(rear_frit)

    print(f"[BUS_GLAZING] Assembled panoramic aerodynamic glazing with {len(created_objects)} elements.")
    return created_objects
