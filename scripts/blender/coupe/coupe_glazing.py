"""
Bentley Continental GT II Coupe (2011) Glazing & Glass System (Blender 5.2 LTS)
Raked Panoramic Windshield, Frameless Arched Side Windows, Triangular Opera Quarter Windows,
Continuous Chrome Cantrail Arch Moldings, and Sweeping Fastback Backlight.
Finished in Executive Obsidian Privacy Glass.
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
from coupe_common import link_to_collection, create_box_primitive, create_cylinder_primitive, apply_finishing

def lerp(a, b, t):
    return a + (b - a) * t

def build_glazing(mats):
    """
    Construct high-fidelity optical glass windows and luxury chrome window moldings.
    Uses calibrated executive obsidian privacy glass concealing interior completely.
    Watertight quad-dominant lofted surfaces with smooth light reflections.
    """
    created_objects = []
    
    # -------------------------------------------------------------------------
    # 1. RAKED PANORAMIC FRONT WINDSHIELD
    # -------------------------------------------------------------------------
    ws_mesh = bpy.data.meshes.new("Mesh_Windshield_Glass")
    ws_obj = bpy.data.objects.new("Windshield_Glass", ws_mesh)
    link_to_collection(ws_obj, "08_Coupe_Glazing_Windows")
    
    bm = bmesh.new()
    ws_stations = [
        # (Y, Z, half_width, camber_sag)
        ( 0.960, 0.888, 0.740, 0.042), # Base of windshield at cowl
        ( 0.790, 1.035, 0.700, 0.045),
        ( 0.620, 1.175, 0.660, 0.040),
        ( 0.450, 1.290, 0.620, 0.035),
        ( 0.280, 1.385, 0.580, 0.028), # Roof header
    ]
    
    prev_row = []
    for y, z, hw, sag in ws_stations:
        curr_row = []
        num_pts = 9
        for i in range(num_pts):
            t = i / (num_pts - 1)
            x = -hw + t * (2.0 * hw)
            camber = sag * (1.0 - (x / hw)**2)
            pt = bm.verts.new((x, y + camber, z))
            curr_row.append(pt)
        if prev_row:
            for i in range(num_pts - 1):
                bm.faces.new((prev_row[i], prev_row[i+1], curr_row[i+1], curr_row[i]))
        prev_row = curr_row
        
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(ws_mesh)
    bm.free()
    
    ws_obj.data.materials.append(mats.glass_tint)
    apply_finishing(ws_obj, bevel=0)
    sol_ws = ws_obj.modifiers.new("Solidify", 'SOLIDIFY')
    sol_ws.thickness = 0.004
    created_objects.append(ws_obj)

    # -------------------------------------------------------------------------
    # 2. FRAMELESS SIDE DROP GLASS & TRIANGULAR GT OPERA WINDOWS (Smooth Quads)
    # -------------------------------------------------------------------------
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # A. Front Door Frameless Drop-Glass (Lofted 5x4 Quad Grid)
        dg_mesh = bpy.data.meshes.new(f"Mesh_Door_Glass_{side}")
        dg_obj = bpy.data.objects.new(f"Door_Glass_{side}", dg_mesh)
        link_to_collection(dg_obj, "08_Coupe_Glazing_Windows")
        
        bm_dg = bmesh.new()
        
        # Longitudinal profiles along door glass (Y from 0.880 to -0.450)
        dg_profiles = [
            # y, x_sill, z_sill, x_roof, z_roof
            ( 0.860, 0.760, 0.890, 0.690, 0.980),
            ( 0.580, 0.830, 0.892, 0.620, 1.220),
            ( 0.280, 0.845, 0.895, 0.590, 1.345),
            ( 0.000, 0.850, 0.895, 0.605, 1.350),
            (-0.250, 0.850, 0.895, 0.615, 1.348),
            (-0.450, 0.850, 0.895, 0.620, 1.345),
        ]
        
        prev_dg_row = []
        n_vert = 4
        for y, xs, zs, xr, zr in dg_profiles:
            curr_row = []
            for j in range(n_vert):
                v_t = j / (n_vert - 1)
                vx = lerp(xs, xr, v_t)
                vz = lerp(zs, zr, v_t)
                # Subtle inward convex tumblehome
                camber = 0.008 * math.sin(v_t * math.pi)
                vx -= camber
                curr_row.append(bm_dg.verts.new((sign * vx, y, vz)))
            if prev_dg_row:
                for j in range(n_vert - 1):
                    if sign > 0:
                        bm_dg.faces.new((prev_dg_row[j], curr_row[j], curr_row[j+1], prev_dg_row[j+1]))
                    else:
                        bm_dg.faces.new((prev_dg_row[j], prev_dg_row[j+1], curr_row[j+1], curr_row[j]))
            prev_dg_row = curr_row
            
        bmesh.ops.recalc_face_normals(bm_dg, faces=bm_dg.faces)
        bm_dg.to_mesh(dg_mesh)
        bm_dg.free()
        
        dg_obj.data.materials.append(mats.glass_tint)
        apply_finishing(dg_obj, bevel=0)
        sol_dg = dg_obj.modifiers.new("Solidify", 'SOLIDIFY')
        sol_dg.thickness = 0.003
        created_objects.append(dg_obj)

        # B. Rear Quarter / Opera Window (Triangular Bentley Kink, Lofted 4x3 Quad Grid)
        qg_mesh = bpy.data.meshes.new(f"Mesh_Quarter_Glass_{side}")
        qg_obj = bpy.data.objects.new(f"Quarter_Glass_{side}", qg_mesh)
        link_to_collection(qg_obj, "08_Coupe_Glazing_Windows")
        
        bm_qg = bmesh.new()
        qg_profiles = [
            # y, x_sill, z_sill, x_roof, z_roof
            (-0.460, 0.850, 0.895, 0.620, 1.340),
            (-0.750, 0.850, 0.905, 0.630, 1.285),
            (-1.050, 0.845, 0.915, 0.645, 1.215),
            (-1.320, 0.835, 0.925, 0.660, 1.130),
        ]
        
        prev_qg_row = []
        n_qvert = 3
        for y, xs, zs, xr, zr in qg_profiles:
            curr_row = []
            for j in range(n_qvert):
                v_t = j / (n_qvert - 1)
                vx = lerp(xs, xr, v_t)
                vz = lerp(zs, zr, v_t)
                curr_row.append(bm_qg.verts.new((sign * vx, y, vz)))
            if prev_qg_row:
                for j in range(n_qvert - 1):
                    if sign > 0:
                        bm_qg.faces.new((prev_qg_row[j], curr_row[j], curr_row[j+1], prev_qg_row[j+1]))
                    else:
                        bm_qg.faces.new((prev_qg_row[j], prev_qg_row[j+1], curr_row[j+1], curr_row[j]))
            prev_qg_row = curr_row
            
        bmesh.ops.recalc_face_normals(bm_qg, faces=bm_qg.faces)
        bm_qg.to_mesh(qg_mesh)
        bm_qg.free()
        
        qg_obj.data.materials.append(mats.glass_tint)
        apply_finishing(qg_obj, bevel=0)
        sol_qg = qg_obj.modifiers.new("Solidify", 'SOLIDIFY')
        sol_qg.thickness = 0.003
        created_objects.append(qg_obj)

        # C. Signature Bentley Chrome Upper Arch Ribbon (Continuous Roof Cantrail Trim)
        arch_mesh = bpy.data.meshes.new(f"Mesh_Chrome_Arch_{side}")
        arch_obj = bpy.data.objects.new(f"Window_Chrome_Arch_{side}", arch_mesh)
        link_to_collection(arch_obj, "10_Coupe_Exterior_Hardware")
        
        bm_ar = bmesh.new()
        arch_pts = [
            (sign * 0.745,  0.880, 0.898),
            (sign * 0.610,  0.280, 1.355),
            (sign * 0.625,  0.000, 1.360),
            (sign * 0.635, -0.450, 1.355),
            (sign * 0.670, -1.250, 1.155),
            (sign * 0.710, -1.650, 0.985),
        ]
        prev_ar = []
        for p in arch_pts:
            v_in = bm_ar.verts.new((p[0], p[1], p[2]))
            v_out = bm_ar.verts.new((p[0] + sign * 0.016, p[1], p[2] + 0.014))
            if prev_ar:
                bm_ar.faces.new((prev_ar[0], prev_ar[1], v_out, v_in))
            prev_ar = [v_in, v_out]
        bmesh.ops.recalc_face_normals(bm_ar, faces=bm_ar.faces)
        bm_ar.to_mesh(arch_mesh)
        bm_ar.free()
        arch_obj.data.materials.append(mats.matrix_chrome)
        sol_ar = arch_obj.modifiers.new("Solidify", 'SOLIDIFY')
        sol_ar.thickness = 0.006
        created_objects.append(arch_obj)

        # Lower beltline chrome spear molding
        sill_trim = create_box_primitive(
            f"Window_Chrome_Beltline_{side}",
            size=(0.016, 2.150, 0.012),
            location=(sign * 0.855, -0.320, 0.892),
            mat=mats.matrix_chrome,
            collection_name="10_Coupe_Exterior_Hardware"
        )
        sill_trim.rotation_euler = (math.radians(-0.8), 0.0, 0.0)
        created_objects.append(sill_trim)

    # -------------------------------------------------------------------------
    # 3. FASTBACK REAR BACKLIGHT (BACK WINDOW)
    # -------------------------------------------------------------------------
    rw_mesh = bpy.data.meshes.new("Mesh_Rear_Backlight_Glass")
    rw_obj = bpy.data.objects.new("Rear_Backlight_Glass", rw_mesh)
    link_to_collection(rw_obj, "08_Coupe_Glazing_Windows")
    
    bm_rw = bmesh.new()
    rw_stations = [
        # (Y, Z, half_width, camber_sag)
        (-0.550, 1.380, 0.585, 0.028), # Roof apex junction
        (-0.850, 1.315, 0.605, 0.032),
        (-1.180, 1.195, 0.625, 0.038),
        (-1.500, 1.070, 0.630, 0.040),
        (-1.778, 0.980, 0.610, 0.035), # Trunk lid junction
    ]
    
    prev_rw_row = []
    for y, z, hw, sag in rw_stations:
        curr_row = []
        num_pts = 9
        for i in range(num_pts):
            t = i / (num_pts - 1)
            x = -hw + t * (2.0 * hw)
            camber = sag * (1.0 - (x / hw)**2)
            pt = bm_rw.verts.new((x, y - camber, z))
            curr_row.append(pt)
        if prev_rw_row:
            for i in range(num_pts - 1):
                bm_rw.faces.new((prev_rw_row[i], prev_rw_row[i+1], curr_row[i+1], curr_row[i]))
        prev_rw_row = curr_row
        
    bmesh.ops.recalc_face_normals(bm_rw, faces=bm_rw.faces)
    bm_rw.to_mesh(rw_mesh)
    bm_rw.free()
    
    rw_obj.data.materials.append(mats.glass_tint)
    apply_finishing(rw_obj, bevel=0)
    sol_rw = rw_obj.modifiers.new("Solidify", 'SOLIDIFY')
    sol_rw.thickness = 0.004
    created_objects.append(rw_obj)

    print(f"[COUPE_GLAZING] Executive obsidian privacy glass panels and chrome arch moldings assembled ({len(created_objects)} items).")
    return created_objects
