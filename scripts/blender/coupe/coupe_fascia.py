"""
Bentley Continental GT II Coupe (2011) Front Fascia & Matrix Grille Builder (Blender 5.2 LTS)
Iconic Hollow Chrome Matrix Radiator Grille Surround + Central Spine + Winged "B" Mascot + 3-Segment Air Dam
"""

import bpy
import bmesh
import math
from mathutils import Vector
import coupe_common as c

def create_hollow_matrix_grille(name, y_pos, z_pos, mats, col_name):
    """
    Creates an authentic Bentley upright radiator grille with a hollow polished chrome surround frame,
    recessed diamond wire-mesh backing, and central vertical chrome divider spine.
    """
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    c.link_to_collection(obj, col_name)
    
    bm = bmesh.new()
    
    # Outer frame coordinates
    hw_out_top = 0.355
    hw_out_bot = 0.335
    z_out_top  = z_pos + 0.145
    z_out_bot  = z_pos - 0.145
    
    # Inner aperture coordinates
    hw_in_top  = 0.320
    hw_in_bot  = 0.300
    z_in_top   = z_pos + 0.120
    z_in_bot   = z_pos - 0.120
    
    y_front = y_pos + 0.025
    y_mid   = y_pos + 0.010
    y_back  = y_pos - 0.015
    
    # 1. Front Outer Ring
    v_fo_tl = bm.verts.new((-hw_out_top, y_front, z_out_top))
    v_fo_tr = bm.verts.new(( hw_out_top, y_front, z_out_top))
    v_fo_br = bm.verts.new(( hw_out_bot, y_front, z_out_bot))
    v_fo_bl = bm.verts.new((-hw_out_bot, y_front, z_out_bot))
    
    # 2. Front Inner Ring
    v_fi_tl = bm.verts.new((-hw_in_top, y_front, z_in_top))
    v_fi_tr = bm.verts.new(( hw_in_top, y_front, z_in_top))
    v_fi_br = bm.verts.new(( hw_in_bot, y_front, z_in_bot))
    v_fi_bl = bm.verts.new((-hw_in_bot, y_front, z_in_bot))
    
    # 3. Back Outer Ring
    v_bo_tl = bm.verts.new((-hw_out_top * 0.98, y_back, z_out_top))
    v_bo_tr = bm.verts.new(( hw_out_top * 0.98, y_back, z_out_top))
    v_bo_br = bm.verts.new(( hw_out_bot * 0.98, y_back, z_out_bot))
    v_bo_bl = bm.verts.new((-hw_out_bot * 0.98, y_back, z_out_bot))
    
    # 4. Back Inner Ring (Recessed Mesh Anchor)
    v_bi_tl = bm.verts.new((-hw_in_top, y_back, z_in_top))
    v_bi_tr = bm.verts.new(( hw_in_top, y_back, z_in_top))
    v_bi_br = bm.verts.new(( hw_in_bot, y_back, z_in_bot))
    v_bi_bl = bm.verts.new((-hw_in_bot, y_back, z_in_bot))
    
    # Chrome Surround Faces (Material Index 0)
    # Front bezel faces: Top, Bottom, Left, Right
    f_top = bm.faces.new((v_fo_tl, v_fo_tr, v_fi_tr, v_fi_tl))
    f_bot = bm.faces.new((v_fo_bl, v_fi_bl, v_fi_br, v_fo_br))
    f_lft = bm.faces.new((v_fo_tl, v_fi_tl, v_fi_bl, v_fo_bl))
    f_rgt = bm.faces.new((v_fo_tr, v_fo_br, v_fi_br, v_fi_tr))
    
    # Outer side walls:
    bm.faces.new((v_bo_tl, v_bo_tr, v_fo_tr, v_fo_tl))
    bm.faces.new((v_bo_tr, v_bo_br, v_fo_br, v_fo_tr))
    bm.faces.new((v_bo_br, v_bo_bl, v_fo_bl, v_fo_br))
    bm.faces.new((v_bo_bl, v_bo_tl, v_fo_tl, v_fo_bl))
    
    # Inner reveal walls:
    bm.faces.new((v_fi_tl, v_fi_tr, v_bi_tr, v_bi_tl))
    bm.faces.new((v_fi_tr, v_fi_br, v_bi_br, v_bi_tr))
    bm.faces.new((v_fi_br, v_fi_bl, v_bi_bl, v_bi_br))
    bm.faces.new((v_fi_bl, v_fi_tl, v_bi_tl, v_bi_bl))
    
    for f in bm.faces:
        f.material_index = 0
        
    # Recessed Diamond Matrix Wire Mesh Plate (Material Index 1)
    f_mesh = bm.faces.new((v_bi_tl, v_bi_tr, v_bi_br, v_bi_bl))
    f_mesh.material_index = 1
    
    # 5. Central Vertical Chrome Divider Spine
    hw_rib = 0.009
    y_rib_f = y_front + 0.008
    y_rib_b = y_back + 0.005
    vr_tl_f = bm.verts.new((-hw_rib, y_rib_f, z_out_top + 0.004))
    vr_tr_f = bm.verts.new(( hw_rib, y_rib_f, z_out_top + 0.004))
    vr_br_f = bm.verts.new(( hw_rib, y_rib_f, z_out_bot - 0.004))
    vr_bl_f = bm.verts.new((-hw_rib, y_rib_f, z_out_bot - 0.004))
    
    vr_tl_b = bm.verts.new((-hw_rib, y_rib_b, z_out_top))
    vr_tr_b = bm.verts.new(( hw_rib, y_rib_b, z_out_top))
    vr_br_b = bm.verts.new(( hw_rib, y_rib_b, z_out_bot))
    vr_bl_b = bm.verts.new((-hw_rib, y_rib_b, z_out_bot))
    
    f_rib_f = bm.faces.new((vr_tl_f, vr_tr_f, vr_br_f, vr_bl_f))
    f_rib_l = bm.faces.new((vr_tl_b, vr_tl_f, vr_bl_f, vr_bl_b))
    f_rib_r = bm.faces.new((vr_tr_f, vr_tr_b, vr_br_b, vr_br_f))
    f_rib_t = bm.faces.new((vr_tl_b, vr_tr_b, vr_tr_f, vr_tl_f))
    f_rib_b = bm.faces.new((vr_bl_f, vr_br_f, vr_br_b, vr_bl_b))
    for f in [f_rib_f, f_rib_l, f_rib_r, f_rib_t, f_rib_b]:
        f.material_index = 0
        
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    
    obj.data.materials.append(mats.matrix_chrome)
    obj.data.materials.append(mats.matrix_mesh)
    c.apply_finishing(obj, bevel=0.003)
    return obj

def build_coupe_front_fascia(mat_registry):
    """Constructs the iconic upright matrix chrome grille, winged Bentley badge, and aerodynamic lower bumper intakes."""
    created_objects = []
    
    grille_y = 2.345
    grille_z = 0.640
    
    # 1. Iconic Bentley Upright Radiator Grille (Hollow Bezel + Mesh + Vertical Spine)
    grille = create_hollow_matrix_grille(
        "FASCIA_Bentley_Matrix_Grille_Assembly",
        y_pos=grille_y,
        z_pos=grille_z,
        mats=mat_registry,
        col_name="07_Coupe_Fascia_Aerodynamics"
    )
    created_objects.append(grille)

    # 2. Winged "B" Flying Bentley Bonnet Mascot
    emblem_y = 2.325
    emblem_z = 0.835
    
    wings_base = c.create_box(
        "FASCIA_Bentley_Winged_Emblem_Plinth",
        location=(0.0, emblem_y, emblem_z),
        size=(0.140, 0.045, 0.014),
        rotation=(math.radians(-14), 0, 0),
        col_name="07_Coupe_Fascia_Aerodynamics",
        mat=mat_registry.matrix_chrome,
        bevel=0.002
    )
    created_objects.append(wings_base)
    
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        wing = c.create_box(
            f"FASCIA_Bentley_Emblem_Wing_{side}",
            location=(sign * 0.046, emblem_y + 0.005, emblem_z + 0.006),
            size=(0.052, 0.028, 0.010),
            rotation=(math.radians(-14), sign * math.radians(8), 0),
            col_name="07_Coupe_Fascia_Aerodynamics",
            mat=mat_registry.matrix_chrome,
            bevel=0.001
        )
        created_objects.append(wing)
        
    b_core = c.create_cylinder(
        "FASCIA_Bentley_Emblem_Center_B_Core",
        location=(0.0, emblem_y + 0.008, emblem_z + 0.006),
        radius=0.018,
        depth=0.012,
        rotation=(math.radians(76), 0, 0),
        vertices=24,
        col_name="07_Coupe_Fascia_Aerodynamics",
        mat=mat_registry.trim_piano_black
    )
    created_objects.append(b_core)

    # 3. Lower Bumper 3-Segment Air Dam Intakes
    lower_y = 2.345
    lower_z = 0.315
    
    # Center Lower Air Dam (Trapezoidal Intake Frame)
    center_intake = c.create_box(
        "FASCIA_Lower_Center_Intake_Dam",
        location=(0.0, lower_y, lower_z),
        size=(0.660, 0.050, 0.120),
        col_name="07_Coupe_Fascia_Aerodynamics",
        mat=mat_registry.trim_piano_black,
        bevel=0.004
    )
    created_objects.append(center_intake)
    
    center_mesh = c.create_box(
        "FASCIA_Lower_Center_Intake_Mesh",
        location=(0.0, lower_y + 0.012, lower_z),
        size=(0.630, 0.020, 0.100),
        col_name="07_Coupe_Fascia_Aerodynamics",
        mat=mat_registry.matrix_mesh,
        bevel=0.002
    )
    created_objects.append(center_mesh)
    
    # Left & Right Intercooler Brake Cooling Ducts with Horizontal Chrome Splitter Blades
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        side_duct_x = sign * 0.580
        side_duct_y = lower_y - 0.015
        
        side_duct = c.create_box(
            f"FASCIA_Lower_Brake_Cooling_Duct_{side}",
            location=(side_duct_x, side_duct_y, lower_z),
            size=(0.260, 0.050, 0.110),
            rotation=(0, 0, sign * math.radians(-8)),
            col_name="07_Coupe_Fascia_Aerodynamics",
            mat=mat_registry.trim_piano_black,
            bevel=0.004
        )
        created_objects.append(side_duct)
        
        side_mesh = c.create_box(
            f"FASCIA_Lower_Side_Duct_Mesh_{side}",
            location=(side_duct_x, side_duct_y + 0.012, lower_z),
            size=(0.230, 0.020, 0.095),
            rotation=(0, 0, sign * math.radians(-8)),
            col_name="07_Coupe_Fascia_Aerodynamics",
            mat=mat_registry.matrix_mesh,
            bevel=0.002
        )
        created_objects.append(side_mesh)
        
        splitter_fin = c.create_box(
            f"FASCIA_Lower_Splitter_Fin_{side}",
            location=(side_duct_x, side_duct_y + 0.020, lower_z),
            size=(0.240, 0.025, 0.010),
            rotation=(0, 0, sign * math.radians(-8)),
            col_name="07_Coupe_Fascia_Aerodynamics",
            mat=mat_registry.matrix_chrome,
            bevel=0.001
        )
        created_objects.append(splitter_fin)

    print(f"[COUPE_FASCIA] Bentley matrix grille, winged emblem, and 3-segment lower air dams assembled ({len(created_objects)} items).")
    return created_objects
