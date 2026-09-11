"""
Bus Panoramic Glazing & Tinted Safety Glass Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def build_bus_glazing(mat_registry):
    """Constructs panoramic front windshield, flush tinted passenger side windows, and rear window."""
    created_objects = []
    
    bw = c.OVERALL_WIDTH
    bl = c.OVERALL_LENGTH
    
    # 1. Panoramic Front Curved Windshield
    # Expansive curved glass spanning from cowl (Z=1.05m) to destination sign (Z=2.82m)
    ws_mesh = bpy.data.meshes.new("GLASS_Panoramic_Windshield_Mesh")
    ws_obj = bpy.data.objects.new("GLASS_Panoramic_Windshield", ws_mesh)
    
    bm = bmesh.new()
    ws_w = bw - 0.160
    ws_h = 1.750
    ws_z = 1.050 + ws_h / 2.0
    ws_y = c.FRONT_BUMPER_Y - 0.180
    
    # Curved panoramic windshield profile
    segments_u = 24
    segments_v = 8
    
    for v_idx in range(segments_v + 1):
        v_fac = v_idx / segments_v
        z_curr = -ws_h / 2.0 + v_fac * ws_h
        # Top tilts rearward
        y_offset = -0.220 * v_fac
        
        for u_idx in range(segments_u + 1):
            u_fac = u_idx / segments_u
            x_curr = -ws_w / 2.0 + u_fac * ws_w
            # Curve around vehicle corners (parabolic curve)
            corner_depth = -0.180 * (1.0 - math.cos(math.pi * (u_fac - 0.5)))
            
            bm.verts.new(Vector((x_curr, ws_y + y_offset + corner_depth, ws_z + z_curr)))
            
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
    ws_obj.data.materials.append(mat_registry.glass_tinted)
    c.apply_finishing(ws_obj, bevel=0.002)
    created_objects.append(ws_obj)
    
    # Windshield Black Ceramic Frit Masking Border
    frit_border = c.create_box(
        "GLASS_Windshield_Frit_Masking_Surround",
        location=(0.0, ws_y + 0.010, ws_z),
        size=(ws_w + 0.040, 0.020, ws_h + 0.040),
        col_name="03_Bus_Glazing_Windows",
        mat=mat_registry.glass_frit
    )
    created_objects.append(frit_border)

    # 2. Flush Side Passenger Window Ribbons (Left & Right Flanks)
    # Spans from behind driver window (Y=4.0m) to rear haunch (Y=-4.5m)
    side_win_len = 8.600
    side_win_h = 1.620
    side_win_z = c.BELTLINE_Z + side_win_h / 2.0
    side_win_y = -0.200 # Centered along cabin
    
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # Continuous panoramic glass ribbon
        side_glass = c.create_box(
            f"GLASS_Side_Passenger_Ribbon_{side}",
            location=(sign * (bw/2.0 + 0.025), side_win_y, side_win_z),
            size=(0.020, side_win_len, side_win_h),
            col_name="03_Bus_Glazing_Windows",
            mat=mat_registry.glass_tinted
        )
        created_objects.append(side_glass)
        
        # Black Sub-Pillars dividing the ribbon into 6 individual modular bays
        num_pillars = 7
        bay_step = side_win_len / (num_pillars - 1)
        for p_idx in range(num_pillars):
            pillar_y = side_win_y - side_win_len/2.0 + p_idx * bay_step
            pillar = c.create_box(
                f"GLASS_Pillar_Divider_{side}_{p_idx+1:02d}",
                location=(sign * (bw/2.0 + 0.028), pillar_y, side_win_z),
                size=(0.025, 0.060, side_win_h + 0.020),
                col_name="03_Bus_Glazing_Windows",
                mat=mat_registry.glass_frit
            )
            created_objects.append(pillar)

    # 3. Rear Emergency Egress Window
    rear_glass_w = 1.950
    rear_glass_h = 1.100
    rear_glass_z = c.BELTLINE_Z + rear_glass_h / 2.0 + 0.200
    rear_glass = c.create_box(
        "GLASS_Rear_Emergency_Egress_Window",
        location=(0.0, c.REAR_BUMPER_Y + 0.020, rear_glass_z),
        size=(rear_glass_w, 0.025, rear_glass_h),
        col_name="03_Bus_Glazing_Windows",
        mat=mat_registry.glass_tinted
    )
    created_objects.append(rear_glass)

    # 4. Driver Egress / Sliding Toll Window (LHD Left Flank)
    driver_win = c.create_box(
        "GLASS_Driver_Side_Toll_Vent_Window",
        location=(1.0 * (bw/2.0 + 0.026), 4.600, side_win_z),
        size=(0.020, 0.950, side_win_h),
        col_name="03_Bus_Glazing_Windows",
        mat=mat_registry.glass_tinted
    )
    created_objects.append(driver_win)

    print(f"[BUS_GLAZING] Created {len(created_objects)} glazing and window objects.")
    return created_objects
