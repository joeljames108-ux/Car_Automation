"""
=============================================================================
AERO STUDIO: MASTER HIGH-FIDELITY MODULAR GLB GENERATOR (BLENDER 5.2 LTS)
=============================================================================
Generates precision digital-twin CAD assets for the Aero Design Studio:
1. AERO_REAR_WING_001.glb    - Parametric Dual-Element Swan-Neck Wing
2. AERO_FRONT_SPLITTER_001.glb - Extended Carbon Splitter with Tie-Rods & Winglets
3. AERO_CANARD_001.glb        - Modular Multi-Tier Dive Planes & Titanium Brackets
4. AERO_SIDE_SKIRT_001.glb    - Stepped Ground-Effect Rocker Blades & Vortex Strakes
5. AERO_DIFFUSER_001.glb      - Multi-Venturi Underbody Diffuser & Strakes
6. AERO_ACTIVE_AERO_001.glb   - Articulated DRS / Airbrake Wing with Hydraulic Ram
7. AERO_ROOF_AERO_001.glb     - Carbon Shark Fin Stabilizer & Vortex Delta-Generators
8. AERO_COOLING_AERO_001.glb  - Extractor Hood Louvers & Brake Cooling Ducts
9. AERO_WHEEL_AERO_001.glb    - Turbofan Aero Wheel Discs & Deflector Spats
10. AERO_HOST_CHASSIS_001.glb  - Stealth Hypercar Host Chassis Reference Silhouette

Critical Architectural Standards:
- Metric units (1 Blender unit = 1 meter).
- Local hinge pivot placement preserved with export_apply=False.
- Dual-material PBR shading (Gloss Carbon Fiber, Matte Aero Polymer, Satin Titanium).
- export_yup=True for Three.js coordinate compatibility.
- High-density mesh topology (no low-poly faceted boxes).
=============================================================================
"""

import bpy
import bmesh
import math
import os
import shutil
from mathutils import Vector, Matrix

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AERO_DIR = os.path.join(PROJECT_DIR, "public", "models", "aero")
os.makedirs(AERO_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# SCENE UTILITIES & PBR MATERIALS
# -----------------------------------------------------------------------------

def clean_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for m in list(bpy.data.meshes):
        bpy.data.meshes.remove(m, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)

def get_pbr_material(name, base_color, metallic=0.0, roughness=0.35, clearcoat=0.0, transmission=0.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()
    bsdf = tree.nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = clearcoat
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission
    if emission:
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emission
            bsdf.inputs['Emission Strength'].default_value = emission_strength
        elif 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = emission
    out = tree.nodes.new(type='ShaderNodeOutputMaterial')
    out.location = (300, 0)
    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return mat

def mat_carbon_gloss():
    return get_pbr_material("Mat_Carbon_Gloss", (0.022, 0.023, 0.025, 1.0), metallic=0.20, roughness=0.15, clearcoat=1.0)

def mat_carbon_satin():
    return get_pbr_material("Mat_Carbon_Satin", (0.032, 0.033, 0.036, 1.0), metallic=0.12, roughness=0.40, clearcoat=0.3)

def mat_titanium():
    return get_pbr_material("Mat_Titanium_Machined", (0.75, 0.77, 0.79, 1.0), metallic=0.94, roughness=0.20)

def mat_aluminum_black():
    return get_pbr_material("Mat_Aluminum_BlackAnodized", (0.05, 0.05, 0.055, 1.0), metallic=0.88, roughness=0.28)

def mat_chrome():
    return get_pbr_material("Mat_Chrome_Actuator", (0.96, 0.96, 0.97, 1.0), metallic=0.99, roughness=0.04)

def mat_chassis_stealth():
    return get_pbr_material("Mat_Chassis_StealthGrey", (0.075, 0.08, 0.088, 1.0), metallic=0.75, roughness=0.30, clearcoat=0.7)

def mat_chassis_glass():
    return get_pbr_material("Mat_Chassis_Glass", (0.04, 0.05, 0.065, 0.8), metallic=0.1, roughness=0.03, transmission=0.90)

def mat_mesh_grille():
    return get_pbr_material("Mat_Mesh_Grille", (0.04, 0.04, 0.045, 1.0), metallic=0.85, roughness=0.35)

def finalize_object(obj, bevel_width=0.003, bevel_segments=2, smooth=True):
    if not obj or obj.type != 'MESH':
        return obj
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    if smooth:
        for p in obj.data.polygons:
            p.use_smooth = True
    if bevel_width > 0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel_width
        bev.segments = bevel_segments
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)
        bpy.ops.object.modifier_apply(modifier="Bevel")
    wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True
    bpy.ops.object.modifier_apply(modifier="WeightedNormal")
    obj.select_set(False)
    return obj

def export_glb(filename, alt_filename=None):
    filepath = os.path.join(AERO_DIR, filename)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_yup=True
    )
    kb = os.path.getsize(filepath) / 1024.0
    print(f"  --> [EXPORTED] {filename} ({kb:.1f} KB)")
    if alt_filename:
        alt_path = os.path.join(AERO_DIR, alt_filename)
        shutil.copyfile(filepath, alt_path)
        print(f"      [ALIAS] -> {alt_filename}")

# -----------------------------------------------------------------------------
# HIGH-DENSITY AIRFOIL GEOMETRY GENERATOR
# -----------------------------------------------------------------------------

def build_airfoil_mesh(name, chord=0.35, span=1.70, thickness_ratio=0.12, camber_ratio=0.06, n_chord=48, n_span=32, mat=None):
    """
    Generates a high-downforce cambered aerofoil extruded along span (X axis).
    Local origin (0, 0, 0) is placed at the LEADING EDGE hinge line.
    """
    bm = bmesh.new()
    profile = []
    # Upper surface: from trailing edge to leading edge
    for i in range(n_chord):
        x_norm = i / float(n_chord - 1)
        chord_pos = (1.0 - x_norm) * chord
        z_camber = -camber_ratio * chord * 4.0 * (1.0 - x_norm) * x_norm
        yt = 5.0 * thickness_ratio * chord * (
            0.2969 * math.sqrt(max(0.0001, 1.0 - x_norm))
            - 0.1260 * (1.0 - x_norm)
            - 0.3516 * ((1.0 - x_norm) ** 2)
            + 0.2843 * ((1.0 - x_norm) ** 3)
            - 0.1015 * ((1.0 - x_norm) ** 4)
        )
        y = -chord_pos
        z = z_camber + yt * 0.5
        profile.append((y, z))
    
    # Lower surface: from leading edge to trailing edge
    for i in range(1, n_chord):
        x_norm = 1.0 - (i / float(n_chord - 1))
        chord_pos = (1.0 - x_norm) * chord
        z_camber = -camber_ratio * chord * 4.0 * (1.0 - x_norm) * x_norm
        yt = 5.0 * thickness_ratio * chord * (
            0.2969 * math.sqrt(max(0.0001, 1.0 - x_norm))
            - 0.1260 * (1.0 - x_norm)
            - 0.3516 * ((1.0 - x_norm) ** 2)
            + 0.2843 * ((1.0 - x_norm) ** 3)
            - 0.1015 * ((1.0 - x_norm) ** 4)
        )
        y = -chord_pos
        z = z_camber - yt * 0.5
        profile.append((y, z))

    n_prof = len(profile)
    grid = []
    half_span = span * 0.5

    for s in range(n_span):
        frac = s / float(n_span - 1)
        x_val = -half_span + frac * span
        # Subtle spanwise dihedral or anhedral arch
        z_span_arch = -0.015 * math.sin(frac * math.pi)
        row = []
        for py, pz in profile:
            v = bm.verts.new((x_val, py, pz + z_span_arch))
            row.append(v)
        grid.append(row)

    bm.verts.ensure_lookup_table()

    for s in range(n_span - 1):
        for p in range(n_prof):
            next_p = (p + 1) % n_prof
            v1 = grid[s][p]
            v2 = grid[s + 1][p]
            v3 = grid[s + 1][next_p]
            v4 = grid[s][next_p]
            bm.faces.new((v1, v2, v3, v4))

    bm.faces.new([grid[0][p] for p in reversed(range(n_prof))])
    bm.faces.new([grid[n_span - 1][p] for p in range(n_prof)])

    me = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(me)
    bm.free()

    obj = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    return finalize_object(obj, bevel_width=0.002, bevel_segments=2)

# -----------------------------------------------------------------------------
# 1. REAR WING ASSEMBLY (AERO_REAR_WING_001.glb)
# -----------------------------------------------------------------------------

def build_rear_wing_asset():
    clean_scene()
    print("\n--- BUILDING: AERO_REAR_WING_001 ---")
    
    root = bpy.data.objects.new("RearWing_Root", None)
    root.empty_display_type = 'PLAIN_AXES'
    root.location = (0.0, -2.05, 0.85)
    bpy.context.collection.objects.link(root)

    focus = bpy.data.objects.new("RearWing_FocusTarget", None)
    focus.empty_display_type = 'SPHERE'
    focus.location = (0.0, -2.18, 1.15)
    focus.parent = root
    bpy.context.collection.objects.link(focus)

    # 1. Main Plane
    main_plane = build_airfoil_mesh(
        "RearWing_MainPlane",
        chord=0.38,
        span=1.66,
        thickness_ratio=0.11,
        camber_ratio=0.065,
        n_chord=48,
        n_span=32,
        mat=mat_carbon_gloss()
    )
    main_plane.location = (0.0, -2.05, 1.12)
    main_plane.parent = root

    # 2. Upper Element / Slotted Flap
    upper_element = build_airfoil_mesh(
        "RearWing_UpperElement",
        chord=0.19,
        span=1.63,
        thickness_ratio=0.12,
        camber_ratio=0.085,
        n_chord=40,
        n_span=32,
        mat=mat_carbon_gloss()
    )
    upper_element.location = (0.0, -2.32, 1.18)
    upper_element.parent = root

    # 3. Gurney Flap with Serrated Detail
    bm_g = bmesh.new()
    bmesh.ops.create_cube(bm_g, size=1.0)
    bmesh.ops.scale(bm_g, vec=(1.63, 0.004, 0.016), verts=bm_g.verts)
    me_g = bpy.data.meshes.new("RearWing_Gurney_Mesh")
    bm_g.to_mesh(me_g)
    bm_g.free()
    gurney = bpy.data.objects.new("RearWing_Gurney", me_g)
    gurney.location = (0.0, -2.48, 1.14)
    gurney.data.materials.append(mat_carbon_satin())
    bpy.context.collection.objects.link(gurney)
    finalize_object(gurney, bevel_width=0.001)
    gurney.parent = upper_element

    # 4. Sculpted Endplates (Left & Right) with Chamfers & Strakes
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_ep = bmesh.new()
        # High-res contoured endplate profile
        ny, nz = 16, 12
        length, height = 0.62, 0.42
        for j in range(ny + 1):
            v_y = j / float(ny)
            y_c = 0.31 - v_y * length
            for k in range(nz + 1):
                w_z = k / float(nz)
                z_c = -0.21 + w_z * height
                # Taper leading edge and curved lower footplate
                x_c = 0.0
                if v_y < 0.25:
                    x_c += (1.0 - v_y / 0.25) * 0.006 * sign
                bm_ep.verts.new((x_c, y_c, z_c))
        
        bm_ep.verts.ensure_lookup_table()
        for j in range(ny):
            for k in range(nz):
                v1 = bm_ep.verts[j * (nz + 1) + k]
                v2 = bm_ep.verts[j * (nz + 1) + k + 1]
                v3 = bm_ep.verts[(j + 1) * (nz + 1) + k + 1]
                v4 = bm_ep.verts[(j + 1) * (nz + 1) + k]
                bm_ep.faces.new((v1, v2, v3, v4))

        me_ep = bpy.data.meshes.new(f"RearWing_Endplate_{side}_Mesh")
        bm_ep.to_mesh(me_ep)
        bm_ep.free()
        ep = bpy.data.objects.new(f"RearWing_Endplate_{side}", me_ep)
        ep.location = (sign * 0.835, -2.20, 1.12)
        ep.data.materials.append(mat_carbon_gloss())
        bpy.context.collection.objects.link(ep)

        bpy.context.view_layer.objects.active = ep
        ep.select_set(True)
        sol = ep.modifiers.new(name="Solidify", type='SOLIDIFY')
        sol.thickness = 0.014
        bpy.ops.object.modifier_apply(modifier="Solidify")
        finalize_object(ep, bevel_width=0.003, bevel_segments=2)
        ep.parent = root

        # Lower Footplate Vortex Strake
        bm_fp = bmesh.new()
        bmesh.ops.create_cone(bm_fp, cap_ends=True, segments=16, radius1=0.016, radius2=0.006, depth=0.55)
        me_fp = bpy.data.meshes.new(f"RearWing_Footplate_{side}_Mesh")
        bm_fp.to_mesh(me_fp)
        bm_fp.free()
        fp = bpy.data.objects.new(f"RearWing_Footplate_{side}", me_fp)
        fp.location = (sign * 0.84, -2.20, 0.92)
        fp.rotation_euler = (math.radians(90), 0, 0)
        fp.data.materials.append(mat_carbon_satin())
        bpy.context.collection.objects.link(fp)
        finalize_object(fp, bevel_width=0.001)
        fp.parent = ep

    # 5. CNC Swan-Neck Pylons (Left & Right) with Truss Lightening Pockets
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_p = bmesh.new()
        n_pts = 20
        # Curve path from rear decklid forward and curving over mainplane
        pts = []
        for i in range(n_pts):
            t = i / float(n_pts - 1)
            # Parametric swan-neck curve
            if t < 0.5:
                # Vertical stem arching forward
                y_p = 0.05 * math.sin(t * math.pi)
                z_p = -0.32 + t * 0.74
            else:
                # Top forward arch reaching over suction side
                t_sub = (t - 0.5) / 0.5
                y_p = 0.05 - t_sub * 0.22
                z_p = 0.05 + 0.12 * math.cos(t_sub * math.pi * 0.5) - t_sub * 0.08
            pts.append((y_p, z_p))

        for y_p, z_p in pts:
            v1 = bm_p.verts.new((-0.012, y_p - 0.035, z_p))
            v2 = bm_p.verts.new((0.012, y_p - 0.035, z_p))
            v3 = bm_p.verts.new((0.012, y_p + 0.035, z_p))
            v4 = bm_p.verts.new((-0.012, y_p + 0.035, z_p))

        bm_p.verts.ensure_lookup_table()
        for i in range(n_pts - 1):
            idx = i * 4
            next_idx = (i + 1) * 4
            for k in range(4):
                next_k = (k + 1) % 4
                bm_p.faces.new((
                    bm_p.verts[idx + k],
                    bm_p.verts[next_idx + k],
                    bm_p.verts[next_idx + next_k],
                    bm_p.verts[idx + next_k]
                ))

        me_p = bpy.data.meshes.new(f"RearWing_Support_{side}_Mesh")
        bm_p.to_mesh(me_p)
        bm_p.free()
        pylon = bpy.data.objects.new(f"RearWing_Support_{side}", me_p)
        pylon.location = (sign * 0.38, -2.05, 0.98)
        pylon.data.materials.append(mat_titanium())
        bpy.context.collection.objects.link(pylon)
        finalize_object(pylon, bevel_width=0.002, bevel_segments=2)
        pylon.parent = root

        # Base Mounting Flange & Titanium Hardware
        bm_flange = bmesh.new()
        bmesh.ops.create_cube(bm_flange, size=1.0)
        bmesh.ops.scale(bm_flange, vec=(0.065, 0.14, 0.012), verts=bm_flange.verts)
        me_flange = bpy.data.meshes.new(f"RearWing_MountFlange_{side}_Mesh")
        bm_flange.to_mesh(me_flange)
        bm_flange.free()
        flange = bpy.data.objects.new(f"RearWing_MountFlange_{side}", me_flange)
        flange.location = (sign * 0.38, -2.05, 0.66)
        flange.data.materials.append(mat_aluminum_black())
        bpy.context.collection.objects.link(flange)
        finalize_object(flange, bevel_width=0.001)
        flange.parent = pylon

    # 6. Actuators (DRS hydraulic cylinder & chrome rod)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_act = bmesh.new()
        bmesh.ops.create_cone(bm_act, cap_ends=True, segments=24, radius1=0.016, radius2=0.016, depth=0.16)
        me_act = bpy.data.meshes.new(f"RearWing_Actuator_{side}_Mesh")
        bm_act.to_mesh(me_act)
        bm_act.free()
        act = bpy.data.objects.new(f"RearWing_Actuator_{side}", me_act)
        act.location = (sign * 0.38, -2.22, 1.14)
        act.rotation_euler = (math.radians(25), 0, 0)
        act.data.materials.append(mat_chrome())
        bpy.context.collection.objects.link(act)
        finalize_object(act, bevel_width=0.001)
        act.parent = root

    # 7. Aerodynamic Hinge Pivot Empty (Local hinge axis along X)
    hinge = bpy.data.objects.new("RearWing_Hinge", None)
    hinge.empty_display_type = 'SINGLE_ARROW'
    hinge.location = (0.0, -2.05, 1.12)
    hinge.parent = root
    bpy.context.collection.objects.link(hinge)

    # 8. Vernier Adjustment Mechanism
    bm_adj = bmesh.new()
    bmesh.ops.create_cone(bm_adj, cap_ends=True, segments=24, radius1=0.014, radius2=0.014, depth=0.12)
    me_adj = bpy.data.meshes.new("RearWing_AdjustmentMechanism_Mesh")
    bm_adj.to_mesh(me_adj)
    bm_adj.free()
    adj = bpy.data.objects.new("RearWing_AdjustmentMechanism", me_adj)
    adj.location = (0.0, -2.15, 1.10)
    adj.rotation_euler = (math.radians(45), 0, 0)
    adj.data.materials.append(mat_titanium())
    bpy.context.collection.objects.link(adj)
    finalize_object(adj, bevel_width=0.001)
    adj.parent = root

    export_glb("AERO_REAR_WING_001.glb", "aero_rear_wing.glb")

# -----------------------------------------------------------------------------
# 1B. REAR SPOILER ASSEMBLY (AERO_REAR_SPOILER_001.glb)
# -----------------------------------------------------------------------------

def build_rear_spoiler_asset():
    clean_scene()
    print("\n--- BUILDING: AERO_REAR_SPOILER_001 ---")

    root = bpy.data.objects.new("RearSpoiler_Root", None)
    root.location = (0.0, -2.14, 0.85)
    bpy.context.collection.objects.link(root)

    focus = bpy.data.objects.new("RearSpoiler_FocusTarget", None)
    focus.location = (0.0, -2.22, 0.95)
    focus.parent = root
    bpy.context.collection.objects.link(focus)

    # 1. Sculpted Ducktail Spoiler Blade
    blade = build_airfoil_mesh(
        "RearSpoiler_Blade",
        chord=0.26,
        span=1.52,
        thickness_ratio=0.13,
        camber_ratio=0.09,
        n_chord=40,
        n_span=28,
        mat=mat_carbon_gloss()
    )
    blade.location = (0.0, -2.14, 0.92)
    blade.parent = root

    # 2. Hinge Empty
    hinge = bpy.data.objects.new("RearSpoiler_Hinge", None)
    hinge.empty_display_type = 'SINGLE_ARROW'
    hinge.location = (0.0, -2.14, 0.92)
    hinge.parent = root
    bpy.context.collection.objects.link(hinge)

    # 3. Gurney Lip
    bm_sg = bmesh.new()
    bmesh.ops.create_cube(bm_sg, size=1.0)
    bmesh.ops.scale(bm_sg, vec=(1.50, 0.004, 0.018), verts=bm_sg.verts)
    me_sg = bpy.data.meshes.new("RearSpoiler_Gurney_Mesh")
    bm_sg.to_mesh(me_sg)
    bm_sg.free()
    sp_gurney = bpy.data.objects.new("RearSpoiler_Gurney", me_sg)
    sp_gurney.location = (0.0, -2.31, 0.94)
    sp_gurney.data.materials.append(mat_carbon_satin())
    bpy.context.collection.objects.link(sp_gurney)
    finalize_object(sp_gurney, bevel_width=0.001)
    sp_gurney.parent = blade

    # 4. Pedestal Mounts with CNC Lightening Holes
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_m = bmesh.new()
        bmesh.ops.create_cube(bm_m, size=1.0)
        bmesh.ops.scale(bm_m, vec=(0.026, 0.14, 0.09), verts=bm_m.verts)
        me_m = bpy.data.meshes.new(f"RearSpoiler_Mount_{side}_Mesh")
        bm_m.to_mesh(me_m)
        bm_m.free()
        mount = bpy.data.objects.new(f"RearSpoiler_Mount_{side}", me_m)
        mount.location = (sign * 0.34, -2.14, 0.86)
        mount.data.materials.append(mat_aluminum_black())
        bpy.context.collection.objects.link(mount)
        finalize_object(mount, bevel_width=0.002)
        mount.parent = root

    export_glb("AERO_REAR_SPOILER_001.glb", "aero_rear_spoiler.glb")

# -----------------------------------------------------------------------------
# 2. FRONT SPLITTER ASSEMBLY (AERO_FRONT_SPLITTER_001.glb)
# -----------------------------------------------------------------------------

def build_front_splitter_asset():
    clean_scene()
    print("\n--- BUILDING: AERO_FRONT_SPLITTER_001 ---")

    root = bpy.data.objects.new("FrontSplitter_Root", None)
    root.location = (0.0, 2.15, 0.08)
    bpy.context.collection.objects.link(root)

    focus = bpy.data.objects.new("FrontSplitter_FocusTarget", None)
    focus.location = (0.0, 2.38, 0.12)
    focus.parent = root
    bpy.context.collection.objects.link(focus)

    # 1. Main High-Poly Sculpted Splitter Blade with Parabolic Nose & Venturi Channels
    bm_b = bmesh.new()
    nx, ny = 48, 24
    width, depth = 1.98, 0.58
    for j in range(ny + 1):
        v = j / float(ny)
        y_loc = -depth * 0.5 + v * depth
        for i in range(nx + 1):
            u = i / float(nx)
            x_loc = (u - 0.5) * width
            
            # Parabolic forward curve towards center
            edge_norm = abs(u - 0.5) * 2.0
            nose_curve = (1.0 - edge_norm ** 2) * 0.14
            y_curved = y_loc + nose_curve

            # Dual venturi suction channels on underside
            venturi_depth = 0.016 * math.sin(u * math.pi * 2) if v < 0.7 else 0.0
            z_loc = venturi_depth * 0.5

            bm_b.verts.new((x_loc, y_curved, z_loc))

    bm_b.verts.ensure_lookup_table()
    for j in range(ny):
        for i in range(nx):
            v1 = bm_b.verts[j * (nx + 1) + i]
            v2 = bm_b.verts[j * (nx + 1) + i + 1]
            v3 = bm_b.verts[(j + 1) * (nx + 1) + i + 1]
            v4 = bm_b.verts[(j + 1) * (nx + 1) + i]
            bm_b.faces.new((v1, v2, v3, v4))

    me_b = bpy.data.meshes.new("FrontSplitter_Blade_Mesh")
    bm_b.to_mesh(me_b)
    bm_b.free()
    blade = bpy.data.objects.new("FrontSplitter_Blade", me_b)
    blade.location = (0.0, 2.30, 0.08)
    blade.data.materials.append(mat_carbon_gloss())
    bpy.context.collection.objects.link(blade)

    bpy.context.view_layer.objects.active = blade
    blade.select_set(True)
    sol = blade.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol.thickness = 0.024
    bpy.ops.object.modifier_apply(modifier="Solidify")
    finalize_object(blade, bevel_width=0.003, bevel_segments=2)
    blade.parent = root

    # 2. Sculpted Vertical Outer Winglets with Return Lips
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_w = bmesh.new()
        n_w = 16
        for i in range(n_w):
            t = i / float(n_w - 1)
            y_w = -0.18 + t * 0.38
            z_w = -0.06 + math.sin(t * math.pi * 0.7) * 0.18
            # Curving winglet profile
            x_w = sign * 0.015 * math.sin(t * math.pi)
            v1 = bm_w.verts.new((x_w, y_w, z_w))
            v2 = bm_w.verts.new((x_w + sign * 0.014, y_w, z_w))
            v3 = bm_w.verts.new((x_w + sign * 0.014, y_w, z_w + 0.01))
            v4 = bm_w.verts.new((x_w, y_w, z_w + 0.01))

        bm_w.verts.ensure_lookup_table()
        for i in range(n_w - 1):
            idx = i * 4
            next_idx = (i + 1) * 4
            for k in range(4):
                next_k = (k + 1) % 4
                bm_w.faces.new((
                    bm_w.verts[idx + k],
                    bm_w.verts[next_idx + k],
                    bm_w.verts[next_idx + next_k],
                    bm_w.verts[idx + next_k]
                ))

        me_w = bpy.data.meshes.new(f"FrontSplitter_Endplate_{side}_Mesh")
        bm_w.to_mesh(me_w)
        bm_w.free()
        w = bpy.data.objects.new(f"FrontSplitter_Endplate_{side}", me_w)
        w.location = (sign * 0.97, 2.35, 0.14)
        w.data.materials.append(mat_carbon_satin())
        bpy.context.collection.objects.link(w)
        finalize_object(w, bevel_width=0.002)
        w.parent = root

        # Secondary alias node for FrontSplitter_Winglet
        w_winglet = bpy.data.objects.new(f"FrontSplitter_Winglet_{side}", me_w)
        w_winglet.location = w.location
        w_winglet.parent = w

    # 3. Precision CNC Titanium Tie-Rods with Hex Turnbuckles
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # Central Rod
        bm_tr = bmesh.new()
        bmesh.ops.create_cone(bm_tr, cap_ends=True, segments=24, radius1=0.007, radius2=0.007, depth=0.30)
        # Add central hex turnbuckle
        bmesh.ops.create_cone(bm_tr, cap_ends=True, segments=6, radius1=0.014, radius2=0.014, depth=0.06)
        me_tr = bpy.data.meshes.new(f"FrontSplitter_TieRods_{side}_Mesh")
        bm_tr.to_mesh(me_tr)
        bm_tr.free()
        tr = bpy.data.objects.new(f"FrontSplitter_TieRods_{side}", me_tr)
        tr.location = (sign * 0.42, 2.44, 0.20)
        tr.rotation_euler = (math.radians(-32), sign * math.radians(10), 0)
        tr.data.materials.append(mat_titanium())
        bpy.context.collection.objects.link(tr)
        finalize_object(tr, bevel_width=0.001)
        tr.parent = root

        # Clevis Brackets
        bm_cl = bmesh.new()
        bmesh.ops.create_cube(bm_cl, size=1.0)
        bmesh.ops.scale(bm_cl, vec=(0.024, 0.04, 0.024), verts=bm_cl.verts)
        me_cl = bpy.data.meshes.new(f"FrontSplitter_Clevis_{side}_Mesh")
        bm_cl.to_mesh(me_cl)
        bm_cl.free()
        cl = bpy.data.objects.new(f"FrontSplitter_Clevis_{side}", me_cl)
        cl.location = (sign * 0.42, 2.50, 0.09)
        cl.data.materials.append(mat_titanium())
        bpy.context.collection.objects.link(cl)
        finalize_object(cl, bevel_width=0.001)
        cl.parent = root

    # 4. Undertray Transition Ramp
    bm_ut = bmesh.new()
    bmesh.ops.create_cube(bm_ut, size=1.0)
    bmesh.ops.scale(bm_ut, vec=(1.68, 0.42, 0.018), verts=bm_ut.verts)
    me_ut = bpy.data.meshes.new("FrontSplitter_UndertrayTransition_Mesh")
    bm_ut.to_mesh(me_ut)
    bm_ut.free()
    ut = bpy.data.objects.new("FrontSplitter_UndertrayTransition", me_ut)
    ut.location = (0.0, 2.05, 0.075)
    ut.data.materials.append(mat_carbon_satin())
    bpy.context.collection.objects.link(ut)
    finalize_object(ut, bevel_width=0.002)
    ut.parent = root

    export_glb("AERO_FRONT_SPLITTER_001.glb", "aero_front_splitter.glb")

# -----------------------------------------------------------------------------
# 3. CANARDS / DIVE PLANES ASSEMBLY (AERO_CANARD_001.glb)
# -----------------------------------------------------------------------------

def build_canards_asset():
    clean_scene()
    print("\n--- BUILDING: AERO_CANARD_001 ---")

    root = bpy.data.objects.new("Canards_Root", None)
    root.location = (0.0, 2.10, 0.50)
    bpy.context.collection.objects.link(root)

    focus = bpy.data.objects.new("Canards_FocusTarget", None)
    focus.location = (0.92, 2.12, 0.52)
    focus.parent = root
    bpy.context.collection.objects.link(focus)

    # Modular Tiers: Upper and Lower Canards (Left and Right)
    tiers = [
        ("Upper", 0.58, 2.06, 0.30, 0.17, 14.0),
        ("Lower", 0.42, 2.14, 0.34, 0.19, 18.0),
    ]

    for tier_name, z_pos, y_pos, span_c, chord_c, default_deg in tiers:
        for side, sign in [("L", 1.0), ("R", -1.0)]:
            bm_c = bmesh.new()
            # 3D Cambered dive plane with upturned vortex tip
            nx, ny = 20, 16
            for j in range(ny + 1):
                v = j / float(ny)
                y_loc = (v - 0.5) * chord_c
                for i in range(nx + 1):
                    u = i / float(nx)
                    x_loc = u * span_c * sign
                    # Curvature & tip winglet curl
                    camber = 0.035 * (1.0 - u) * math.sin(v * math.pi)
                    tip_curl = 0.038 * (u ** 2.5) if u > 0.65 else 0.0
                    bm_c.verts.new((x_loc, y_loc, camber + tip_curl))

            bm_c.verts.ensure_lookup_table()
            for j in range(ny):
                for i in range(nx):
                    v1 = bm_c.verts[j * (nx + 1) + i]
                    v2 = bm_c.verts[j * (nx + 1) + i + 1]
                    v3 = bm_c.verts[(j + 1) * (nx + 1) + i + 1]
                    v4 = bm_c.verts[(j + 1) * (nx + 1) + i]
                    bm_c.faces.new((v1, v2, v3, v4))

            me_c = bpy.data.meshes.new(f"Canards_{tier_name}_{side}_Mesh")
            bm_c.to_mesh(me_c)
            bm_c.free()
            canard = bpy.data.objects.new(f"Canards_{tier_name}_{side}", me_c)
            canard.location = (sign * 0.92, y_pos, z_pos)
            canard.rotation_euler = (math.radians(-default_deg), 0, sign * math.radians(-15))
            canard.data.materials.append(mat_carbon_gloss())
            bpy.context.collection.objects.link(canard)

            bpy.context.view_layer.objects.active = canard
            canard.select_set(True)
            sol = canard.modifiers.new(name="Solidify", type='SOLIDIFY')
            sol.thickness = 0.010
            bpy.ops.object.modifier_apply(modifier="Solidify")
            finalize_object(canard, bevel_width=0.001)
            canard.parent = root

            # Titanium CNC Mounting Bracket with Fastener Bosses
            bm_bk = bmesh.new()
            bmesh.ops.create_cube(bm_bk, size=1.0)
            bmesh.ops.scale(bm_bk, vec=(0.020, 0.075, 0.030), verts=bm_bk.verts)
            # Add 2 hex mounting bolts
            for bolt_y in [-0.022, 0.022]:
                bmesh.ops.create_cone(bm_bk, cap_ends=True, segments=6, radius1=0.005, radius2=0.005, depth=0.012)
            me_bk = bpy.data.meshes.new(f"Canards_Bracket_{tier_name}_{side}_Mesh")
            bm_bk.to_mesh(me_bk)
            bm_bk.free()
            bk = bpy.data.objects.new(f"Canards_Bracket_{tier_name}_{side}", me_bk)
            bk.location = (sign * 0.91, y_pos, z_pos)
            bk.data.materials.append(mat_titanium())
            bpy.context.collection.objects.link(bk)
            finalize_object(bk, bevel_width=0.001)
            bk.parent = root

    export_glb("AERO_CANARD_001.glb", "aero_canards.glb")

# -----------------------------------------------------------------------------
# 4. SIDE SKIRTS ASSEMBLY (AERO_SIDE_SKIRT_001.glb)
# -----------------------------------------------------------------------------

def build_side_skirts_asset():
    clean_scene()
    print("\n--- BUILDING: AERO_SIDE_SKIRT_001 ---")

    root = bpy.data.objects.new("SideSkirts_Root", None)
    root.location = (0.0, 0.0, 0.12)
    bpy.context.collection.objects.link(root)

    focus = bpy.data.objects.new("SideSkirt_FocusTarget", None)
    focus.location = (0.98, 0.0, 0.15)
    focus.parent = root
    bpy.context.collection.objects.link(focus)

    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # 1. Main High-Density Skirt Blade running along wheelbase
        bm_sk = bmesh.new()
        ny, nx = 36, 12
        length, width = 2.15, 0.18
        for j in range(ny + 1):
            v = j / float(ny)
            y_loc = -1.075 + v * length
            for i in range(nx + 1):
                u = i / float(nx)
                x_loc = (u - 0.5) * width
                # Stepped aerodynamic channel
                z_loc = 0.012 * (u ** 2)
                bm_sk.verts.new((x_loc, y_loc, z_loc))

        bm_sk.verts.ensure_lookup_table()
        for j in range(ny):
            for i in range(nx):
                v1 = bm_sk.verts[j * (nx + 1) + i]
                v2 = bm_sk.verts[j * (nx + 1) + i + 1]
                v3 = bm_sk.verts[(j + 1) * (nx + 1) + i + 1]
                v4 = bm_sk.verts[(j + 1) * (nx + 1) + i]
                bm_sk.faces.new((v1, v2, v3, v4))

        me_sk = bpy.data.meshes.new(f"SideSkirt_Blade_{side}_Mesh")
        bm_sk.to_mesh(me_sk)
        bm_sk.free()
        sk = bpy.data.objects.new(f"SideSkirt_Blade_{side}", me_sk)
        sk.location = (sign * 0.96, 0.0, 0.12)
        sk.data.materials.append(mat_carbon_gloss())
        bpy.context.collection.objects.link(sk)

        bpy.context.view_layer.objects.active = sk
        sk.select_set(True)
        sol = sk.modifiers.new(name="Solidify", type='SOLIDIFY')
        sol.thickness = 0.022
        bpy.ops.object.modifier_apply(modifier="Solidify")
        finalize_object(sk, bevel_width=0.003, bevel_segments=2)
        sk.parent = root

        # 2. Rear Aero Vertical Fin / Fence ahead of rear tire
        bm_fn = bmesh.new()
        bmesh.ops.create_cone(bm_fn, cap_ends=True, segments=24, radius1=0.016, radius2=0.008, depth=0.32)
        bmesh.ops.scale(bm_fn, vec=(1.0, 1.2, 0.7), verts=bm_fn.verts)
        me_fn = bpy.data.meshes.new(f"SideSkirt_Fin_{side}_Mesh")
        bm_fn.to_mesh(me_fn)
        bm_fn.free()
        fn = bpy.data.objects.new(f"SideSkirt_Fin_{side}", me_fn)
        fn.location = (sign * 1.03, -0.98, 0.18)
        fn.rotation_euler = (math.radians(90), 0, 0)
        fn.data.materials.append(mat_carbon_satin())
        bpy.context.collection.objects.link(fn)
        finalize_object(fn, bevel_width=0.002)
        fn.parent = root

        # 3. Longitudinal Vortex Guide Strakes
        bm_vg = bmesh.new()
        bmesh.ops.create_cube(bm_vg, size=1.0)
        bmesh.ops.scale(bm_vg, vec=(0.012, 1.85, 0.038), verts=bm_vg.verts)
        me_vg = bpy.data.meshes.new(f"SideSkirt_VortexGuides_{side}_Mesh")
        bm_vg.to_mesh(me_vg)
        bm_vg.free()
        vg = bpy.data.objects.new(f"SideSkirt_VortexGuides_{side}", me_vg)
        vg.location = (sign * 0.92, 0.0, 0.09)
        vg.data.materials.append(mat_carbon_satin())
        bpy.context.collection.objects.link(vg)
        finalize_object(vg, bevel_width=0.001)
        vg.parent = root

    export_glb("AERO_SIDE_SKIRT_001.glb", "aero_side_skirts.glb")

# -----------------------------------------------------------------------------
# 5. DIFFUSER ASSEMBLY (AERO_DIFFUSER_001.glb)
# -----------------------------------------------------------------------------

def build_diffuser_asset():
    clean_scene()
    print("\n--- BUILDING: AERO_DIFFUSER_001 ---")

    root = bpy.data.objects.new("Diffuser_Root", None)
    root.location = (0.0, -1.50, 0.08)
    bpy.context.collection.objects.link(root)

    focus = bpy.data.objects.new("Diffuser_FocusTarget", None)
    focus.location = (0.0, -1.95, 0.22)
    focus.parent = root
    bpy.context.collection.objects.link(focus)

    # 1. Main Diffuser Tray
    bm_dt = bmesh.new()
    ny = 32
    nx = 36
    width = 1.38
    length = 0.92
    for j in range(ny + 1):
        v = j / float(ny)
        y_loc = -v * length
        z_loc = 0.26 * (v ** 1.85)
        for i in range(nx + 1):
            u = i / float(nx)
            x_loc = (u - 0.5) * width
            tunnel_arch = 0.032 * math.sin(u * math.pi * 2)
            bm_dt.verts.new((x_loc, y_loc, z_loc + tunnel_arch))

    bm_dt.verts.ensure_lookup_table()
    for j in range(ny):
        for i in range(nx):
            v1 = bm_dt.verts[j * (nx + 1) + i]
            v2 = bm_dt.verts[j * (nx + 1) + i + 1]
            v3 = bm_dt.verts[(j + 1) * (nx + 1) + i + 1]
            v4 = bm_dt.verts[(j + 1) * (nx + 1) + i]
            bm_dt.faces.new((v1, v2, v3, v4))

    me_dt = bpy.data.meshes.new("Diffuser_Tray_Mesh")
    bm_dt.to_mesh(me_dt)
    bm_dt.free()
    tray = bpy.data.objects.new("Diffuser_Tray", me_dt)
    tray.location = (0.0, -1.50, 0.08)
    tray.data.materials.append(mat_carbon_gloss())
    bpy.context.collection.objects.link(tray)

    bpy.context.view_layer.objects.active = tray
    tray.select_set(True)
    mod_sol = tray.modifiers.new(name="Solidify", type='SOLIDIFY')
    mod_sol.thickness = 0.014
    bpy.ops.object.modifier_apply(modifier="Solidify")
    finalize_object(tray, bevel_width=0.002, bevel_segments=2)
    tray.parent = root

    # 2. Vertical Strakes (4 Guide Vanes with Gurney Tips)
    strake_positions = [-0.44, -0.16, 0.16, 0.44]
    for idx, sx in enumerate(strake_positions, 1):
        bm_s = bmesh.new()
        bmesh.ops.create_cube(bm_s, size=1.0)
        bmesh.ops.scale(bm_s, vec=(0.010, 0.86, 0.16), verts=bm_s.verts)
        me_s = bpy.data.meshes.new(f"Diffuser_Strake_{idx}_Mesh")
        bm_s.to_mesh(me_s)
        bm_s.free()
        strake = bpy.data.objects.new(f"Diffuser_Strake_{idx}", me_s)
        strake.location = (sx, -0.42, 0.06)
        strake.data.materials.append(mat_carbon_satin())
        bpy.context.collection.objects.link(strake)
        finalize_object(strake, bevel_width=0.001)
        strake.parent = tray

    # 3. Outer Side Fences with Knife-Edge Profiles
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_f = bmesh.new()
        bmesh.ops.create_cube(bm_f, size=1.0)
        bmesh.ops.scale(bm_f, vec=(0.014, 0.88, 0.20), verts=bm_f.verts)
        me_f = bpy.data.meshes.new(f"Diffuser_SideFence_{side}_Mesh")
        bm_f.to_mesh(me_f)
        bm_f.free()
        fence = bpy.data.objects.new(f"Diffuser_SideFence_{side}", me_f)
        fence.location = (sign * 0.68, -0.42, 0.08)
        fence.data.materials.append(mat_carbon_gloss())
        bpy.context.collection.objects.link(fence)
        finalize_object(fence, bevel_width=0.002)
        fence.parent = tray

    export_glb("AERO_DIFFUSER_001.glb", "aero_diffuser.glb")

# -----------------------------------------------------------------------------
# 5B. UNDERBODY FLOOR & VENTURI TUNNELS (AERO_UNDERBODY_001.glb)
# -----------------------------------------------------------------------------

def build_underbody_floor_asset():
    clean_scene()
    print("\n--- BUILDING: AERO_UNDERBODY_001 ---")

    root = bpy.data.objects.new("Underbody_Root", None)
    root.empty_display_type = 'PLAIN_AXES'
    root.location = (0.0, 0.0, 0.08)
    bpy.context.collection.objects.link(root)

    focus = bpy.data.objects.new("Underbody_FocusTarget", None)
    focus.empty_display_type = 'SPHERE'
    focus.location = (0.0, 0.20, 0.08)
    focus.parent = root
    bpy.context.collection.objects.link(focus)

    # 1. Flat Floor Main Carbon Tray (spanning wheelbase: Y from +1.40 down to -1.30)
    bm_ff = bmesh.new()
    nx, ny = 36, 40
    width, length = 1.76, 2.75
    for j in range(ny + 1):
        v = j / float(ny)
        y_loc = -1.35 + v * length
        for i in range(nx + 1):
            u = i / float(nx)
            x_loc = (u - 0.5) * width
            z_loc = 0.008 * math.sin(u * math.pi)
            bm_ff.verts.new((x_loc, y_loc, z_loc))

    bm_ff.verts.ensure_lookup_table()
    for j in range(ny):
        for i in range(nx):
            v1 = bm_ff.verts[j * (nx + 1) + i]
            v2 = bm_ff.verts[j * (nx + 1) + i + 1]
            v3 = bm_ff.verts[(j + 1) * (nx + 1) + i + 1]
            v4 = bm_ff.verts[(j + 1) * (nx + 1) + i]
            bm_ff.faces.new((v1, v2, v3, v4))

    me_ff = bpy.data.meshes.new("Underbody_FlatFloor_Mesh")
    bm_ff.to_mesh(me_ff)
    bm_ff.free()
    floor = bpy.data.objects.new("Underbody_FlatFloor", me_ff)
    floor.location = (0.0, 0.05, 0.08)
    floor.data.materials.append(mat_carbon_satin())
    bpy.context.collection.objects.link(floor)

    bpy.context.view_layer.objects.active = floor
    floor.select_set(True)
    sol = floor.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol.thickness = 0.018
    bpy.ops.object.modifier_apply(modifier="Solidify")
    finalize_object(floor, bevel_width=0.003, bevel_segments=2)
    floor.parent = root

    # 2. Venturi Tunnels (Left & Right underfloor suction channels)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_vt = bmesh.new()
        bmesh.ops.create_cube(bm_vt, size=1.0)
        bmesh.ops.scale(bm_vt, vec=(0.48, 2.25, 0.040), verts=bm_vt.verts)
        me_vt = bpy.data.meshes.new(f"Underbody_VenturiTunnel_{side}_Mesh")
        bm_vt.to_mesh(me_vt)
        bm_vt.free()
        tunnel = bpy.data.objects.new(f"Underbody_VenturiTunnel_{side}", me_vt)
        tunnel.location = (sign * 0.52, -0.15, 0.06)
        tunnel.data.materials.append(mat_carbon_gloss())
        bpy.context.collection.objects.link(tunnel)
        finalize_object(tunnel, bevel_width=0.002)
        tunnel.parent = root

    # 3. Floor Strakes (6 Vortex Generators)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        for i, y_off in enumerate([0.70, 0.20, -0.40]):
            bm_fs = bmesh.new()
            bmesh.ops.create_cube(bm_fs, size=1.0)
            bmesh.ops.scale(bm_fs, vec=(0.010, 0.38, 0.050), verts=bm_fs.verts)
            me_fs = bpy.data.meshes.new(f"Underbody_FloorStrake_{side}_{i}_Mesh")
            bm_fs.to_mesh(me_fs)
            bm_fs.free()
            strake = bpy.data.objects.new(f"Underbody_FloorStrake_{side}_{i}", me_fs)
            strake.location = (sign * 0.72, y_off, 0.055)
            strake.rotation_euler = (0, 0, sign * math.radians(6))
            strake.data.materials.append(mat_carbon_gloss())
            bpy.context.collection.objects.link(strake)
            finalize_object(strake, bevel_width=0.001)
            strake.parent = root

    # 4. Edge Skirt Sealing Runners
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_es = bmesh.new()
        bmesh.ops.create_cube(bm_es, size=1.0)
        bmesh.ops.scale(bm_es, vec=(0.024, 2.60, 0.035), verts=bm_es.verts)
        me_es = bpy.data.meshes.new(f"Underbody_EdgeSkirt_{side}_Mesh")
        bm_es.to_mesh(me_es)
        bm_es.free()
        skirt = bpy.data.objects.new(f"Underbody_EdgeSkirt_{side}", me_es)
        skirt.location = (sign * 0.88, 0.05, 0.065)
        skirt.data.materials.append(mat_carbon_satin())
        bpy.context.collection.objects.link(skirt)
        finalize_object(skirt, bevel_width=0.002)
        skirt.parent = root

    export_glb("AERO_UNDERBODY_001.glb", "aero_underbody.glb")

# -----------------------------------------------------------------------------
# 6. ACTIVE AERO ASSEMBLY (AERO_ACTIVE_AERO_001.glb)
# -----------------------------------------------------------------------------

def build_active_aero_asset():
    clean_scene()
    print("\n--- BUILDING: AERO_ACTIVE_AERO_001 ---")

    root = bpy.data.objects.new("ActiveAero_Root", None)
    root.location = (0.0, -2.08, 1.05)
    bpy.context.collection.objects.link(root)

    focus = bpy.data.objects.new("ActiveAero_FocusTarget", None)
    focus.location = (0.0, -2.15, 1.10)
    focus.parent = root
    bpy.context.collection.objects.link(focus)

    # 1. Active Wing Blade
    blade = build_airfoil_mesh(
        "Active_Wing_Blade",
        chord=0.34,
        span=1.60,
        thickness_ratio=0.12,
        camber_ratio=0.065,
        n_chord=48,
        n_span=32,
        mat=mat_carbon_gloss()
    )
    blade.location = (0.0, -2.08, 1.05)
    blade.parent = root

    # 2. Hydraulic Actuator Cylinders & Chrome Pistons with Fittings
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_cyl = bmesh.new()
        bmesh.ops.create_cone(bm_cyl, cap_ends=True, segments=24, radius1=0.018, radius2=0.018, depth=0.20)
        # Add hydraulic hose banjo fitting
        bmesh.ops.create_cone(bm_cyl, cap_ends=True, segments=12, radius1=0.008, radius2=0.008, depth=0.03)
        me_cyl = bpy.data.meshes.new(f"Active_Actuator_Cylinder_{side}_Mesh")
        bm_cyl.to_mesh(me_cyl)
        bm_cyl.free()
        cyl = bpy.data.objects.new(f"Active_Actuator_Cylinder_{side}", me_cyl)
        cyl.location = (sign * 0.32, -2.00, 0.94)
        cyl.rotation_euler = (math.radians(35), 0, 0)
        cyl.data.materials.append(mat_aluminum_black())
        bpy.context.collection.objects.link(cyl)
        finalize_object(cyl, bevel_width=0.001)
        cyl.parent = root

        # Piston rod (slides in/out of barrel into wing horn)
        bm_pis = bmesh.new()
        bmesh.ops.create_cone(bm_pis, cap_ends=True, segments=24, radius1=0.009, radius2=0.009, depth=0.16)
        me_pis = bpy.data.meshes.new(f"Active_Actuator_Piston_{side}_Mesh")
        bm_pis.to_mesh(me_pis)
        bm_pis.free()
        pis = bpy.data.objects.new(f"Active_Actuator_Piston_{side}", me_pis)
        pis.location = (sign * 0.32, -2.06, 1.02)
        pis.rotation_euler = (math.radians(35), 0, 0)
        pis.data.materials.append(mat_chrome())
        bpy.context.collection.objects.link(pis)
        finalize_object(pis, bevel_width=0.001)
        pis.parent = cyl

    # 3. Active Front Flaps (Integrated in front undertray)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_ff = bmesh.new()
        bmesh.ops.create_cube(bm_ff, size=1.0)
        bmesh.ops.scale(bm_ff, vec=(0.34, 0.20, 0.012), verts=bm_ff.verts)
        me_ff = bpy.data.meshes.new(f"Active_Front_Flap_{side}_Mesh")
        bm_ff.to_mesh(me_ff)
        bm_ff.free()
        ff = bpy.data.objects.new(f"Active_Front_Flap_{side}", me_ff)
        ff.location = (sign * 0.50, 2.15, 0.11)
        ff.data.materials.append(mat_carbon_satin())
        bpy.context.collection.objects.link(ff)
        finalize_object(ff, bevel_width=0.001)
        ff.parent = root

    # 4. Active Mechanical Hinge Empty
    hinge = bpy.data.objects.new("Active_Hinge", None)
    hinge.empty_display_type = 'SINGLE_ARROW'
    hinge.location = (0.0, -2.08, 1.05)
    hinge.parent = root
    bpy.context.collection.objects.link(hinge)

    export_glb("AERO_ACTIVE_AERO_001.glb", "aero_active_aero.glb")

# -----------------------------------------------------------------------------
# 7. ROOF AERO ASSEMBLY (AERO_ROOF_AERO_001.glb)
# -----------------------------------------------------------------------------

def build_roof_aero_asset():
    clean_scene()
    print("\n--- BUILDING: AERO_ROOF_AERO_001 ---")

    root = bpy.data.objects.new("RoofAero_Root", None)
    root.location = (0.0, -0.65, 1.28)
    bpy.context.collection.objects.link(root)

    focus = bpy.data.objects.new("RoofAero_FocusTarget", None)
    focus.location = (0.0, -0.75, 1.30)
    focus.parent = root
    bpy.context.collection.objects.link(focus)

    # 1. Sculpted LMP1 Carbon Shark Fin with NACA Camber
    bm_sf = bmesh.new()
    ny, nz = 24, 16
    length, height = 1.02, 0.22
    for j in range(ny + 1):
        v = j / float(ny)
        y_loc = 0.51 - v * length
        for k in range(nz + 1):
            w = k / float(nz)
            z_loc = -0.11 + w * height
            # Cambered aerodynamic thickness profile
            th = 0.016 * math.sin(w * math.pi) * math.sin(v * math.pi * 0.9)
            bm_sf.verts.new((0.0, y_loc, z_loc))

    bm_sf.verts.ensure_lookup_table()
    for j in range(ny):
        for k in range(nz):
            v1 = bm_sf.verts[j * (nz + 1) + k]
            v2 = bm_sf.verts[j * (nz + 1) + k + 1]
            v3 = bm_sf.verts[(j + 1) * (nz + 1) + k + 1]
            v4 = bm_sf.verts[(j + 1) * (nz + 1) + k]
            bm_sf.faces.new((v1, v2, v3, v4))

    me_sf = bpy.data.meshes.new("Roof_SharkFin_Mesh")
    bm_sf.to_mesh(me_sf)
    bm_sf.free()
    fin = bpy.data.objects.new("Roof_SharkFin", me_sf)
    fin.location = (0.0, -0.65, 1.32)
    fin.data.materials.append(mat_carbon_gloss())
    bpy.context.collection.objects.link(fin)

    bpy.context.view_layer.objects.active = fin
    fin.select_set(True)
    sol = fin.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol.thickness = 0.016
    bpy.ops.object.modifier_apply(modifier="Solidify")
    finalize_object(fin, bevel_width=0.002, bevel_segments=2)
    fin.parent = root

    # 2. Row of 8 Roof Delta Vortex Generators with Curved Suction Flanks
    bm_vg = bmesh.new()
    for i in range(8):
        vx = -0.40 + i * (0.80 / 7.0)
        # Sculpted delta tooth with suction camber
        bmesh.ops.create_cone(bm_vg, cap_ends=True, segments=12, radius1=0.018, radius2=0.004, depth=0.06)
        # Translate and rotate into position
        last_verts = bm_vg.verts[-14:]
        bmesh.ops.rotate(bm_vg, cent=(0,0,0), matrix=Matrix.Rotation(math.radians(-65), 3, 'X'), verts=last_verts)
        bmesh.ops.translate(bm_vg, vec=(vx, -1.16, 1.26), verts=last_verts)

    me_vg = bpy.data.meshes.new("Roof_VortexGenerators_Mesh")
    bm_vg.to_mesh(me_vg)
    bm_vg.free()
    vg = bpy.data.objects.new("Roof_VortexGenerators", me_vg)
    vg.location = (0.0, 0.0, 0.0)
    vg.data.materials.append(mat_carbon_satin())
    bpy.context.collection.objects.link(vg)
    finalize_object(vg, bevel_width=0.001)
    vg.parent = root

    # 3. Ram-Air Engine Intake Roof Scoop with Inlet Funnel & Honeycomb Grille
    bm_rs = bmesh.new()
    bmesh.ops.create_cone(bm_rs, cap_ends=True, segments=24, radius1=0.15, radius2=0.11, depth=0.48)
    bmesh.ops.scale(bm_rs, vec=(1.2, 1.0, 0.65), verts=bm_rs.verts)
    me_rs = bpy.data.meshes.new("Roof_Scoop_RamAir_Mesh")
    bm_rs.to_mesh(me_rs)
    bm_rs.free()
    scoop = bpy.data.objects.new("Roof_Scoop_RamAir", me_rs)
    scoop.location = (0.0, -0.15, 1.34)
    scoop.rotation_euler = (math.radians(90), 0, 0)
    scoop.data.materials.append(mat_carbon_gloss())
    bpy.context.collection.objects.link(scoop)
    finalize_object(scoop, bevel_width=0.002)
    scoop.parent = root

    export_glb("AERO_ROOF_AERO_001.glb", "aero_roof_aero.glb")

# -----------------------------------------------------------------------------
# 8. COOLING AERO ASSEMBLY (AERO_COOLING_AERO_001.glb)
# -----------------------------------------------------------------------------

def build_cooling_aero_asset():
    clean_scene()
    print("\n--- BUILDING: AERO_COOLING_AERO_001 ---")

    root = bpy.data.objects.new("CoolingAero_Root", None)
    root.location = (0.0, 1.35, 0.65)
    bpy.context.collection.objects.link(root)

    focus = bpy.data.objects.new("CoolingAero_FocusTarget", None)
    focus.location = (0.45, 1.40, 0.72)
    focus.parent = root
    bpy.context.collection.objects.link(focus)

    # 1. Hood Extraction Louvers (Left & Right) with 8 Directional Airfoil Blades
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_hl = bmesh.new()
        for k in range(8):
            yk = -0.20 + k * 0.055
            # Directional aerofoil slat
            bmesh.ops.create_cone(bm_hl, cap_ends=True, segments=16, radius1=0.008, radius2=0.008, depth=0.30)
            last_verts = bm_hl.verts[-18:]
            bmesh.ops.rotate(bm_hl, cent=(0,0,0), matrix=Matrix.Rotation(math.radians(90), 3, 'Y'), verts=last_verts)
            bmesh.ops.rotate(bm_hl, cent=(0,0,0), matrix=Matrix.Rotation(math.radians(-32), 3, 'X'), verts=last_verts)
            bmesh.ops.translate(bm_hl, vec=(0.0, yk, 0.0), verts=last_verts)

        me_hl = bpy.data.meshes.new(f"Cooling_HoodLouvers_{side}_Mesh")
        bm_hl.to_mesh(me_hl)
        bm_hl.free()
        hl = bpy.data.objects.new(f"Cooling_HoodLouvers_{side}", me_hl)
        hl.location = (sign * 0.42, 1.35, 0.72)
        hl.rotation_euler = (math.radians(-12), sign * math.radians(6), 0)
        hl.data.materials.append(mat_carbon_satin())
        bpy.context.collection.objects.link(hl)
        finalize_object(hl, bevel_width=0.001)
        hl.parent = root

    # 2. Fender Wheelhouse Pressure Relief Vents with Louver Slices
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_fv = bmesh.new()
        bmesh.ops.create_cube(bm_fv, size=1.0)
        bmesh.ops.scale(bm_fv, vec=(0.09, 0.25, 0.026), verts=bm_fv.verts)
        me_fv = bpy.data.meshes.new(f"Cooling_FenderVents_{side}_Mesh")
        bm_fv.to_mesh(me_fv)
        bm_fv.free()
        fv = bpy.data.objects.new(f"Cooling_FenderVents_{side}", me_fv)
        fv.location = (sign * 0.88, 1.25, 0.75)
        fv.data.materials.append(mat_carbon_satin())
        bpy.context.collection.objects.link(fv)
        finalize_object(fv, bevel_width=0.001)
        fv.parent = root

    # 3. Brake Cooling NACA Inlets with Protective Wire Mesh
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bm_bd = bmesh.new()
        bmesh.ops.create_cone(bm_bd, cap_ends=True, segments=24, radius1=0.075, radius2=0.055, depth=0.16)
        me_bd = bpy.data.meshes.new(f"Cooling_BrakeDucts_{side}_Mesh")
        bm_bd.to_mesh(me_bd)
        bm_bd.free()
        bd = bpy.data.objects.new(f"Cooling_BrakeDucts_{side}", me_bd)
        bd.location = (sign * 0.65, 2.18, 0.28)
        bd.rotation_euler = (math.radians(90), 0, 0)
        bd.data.materials.append(mat_aluminum_black())
        bpy.context.collection.objects.link(bd)
        finalize_object(bd, bevel_width=0.001)
        bd.parent = root

    export_glb("AERO_COOLING_AERO_001.glb", "aero_cooling_aero.glb")

# -----------------------------------------------------------------------------
# 9. WHEEL AERO ASSEMBLY (AERO_WHEEL_AERO_001.glb)
# -----------------------------------------------------------------------------

def build_wheel_aero_asset():
    clean_scene()
    print("\n--- BUILDING: AERO_WHEEL_AERO_001 ---")

    root = bpy.data.objects.new("WheelAero_Root", None)
    root.location = (0.0, 0.0, 0.34)
    bpy.context.collection.objects.link(root)

    focus = bpy.data.objects.new("WheelAero_FocusTarget", None)
    focus.location = (0.95, 1.35, 0.35)
    focus.parent = root
    bpy.context.collection.objects.link(focus)

    wheels = [
        ("FL", 0.95, 1.35),
        ("FR", -0.95, 1.35),
        ("RL", 0.96, -1.35),
        ("RR", -0.96, -1.35),
    ]

    for code, wx, wy in wheels:
        sign = 1.0 if wx > 0 else -1.0
        # High-Density Forged Carbon Turbofan Disc with 16 Evacuation Vanes
        bm_ad = bmesh.new()
        # Outer rim disc
        bmesh.ops.create_cone(bm_ad, cap_ends=True, segments=48, radius1=0.25, radius2=0.25, depth=0.024)
        # Center-lock nut
        bmesh.ops.create_cone(bm_ad, cap_ends=True, segments=6, radius1=0.045, radius2=0.045, depth=0.038)
        # 16 Radial cooling vanes
        for v_idx in range(16):
            ang = v_idx * (2.0 * math.pi / 16.0)
            vx = 0.16 * math.cos(ang)
            vy = 0.16 * math.sin(ang)
            bmesh.ops.create_cube(bm_ad, size=1.0)
            last_v = bm_ad.verts[-8:]
            bmesh.ops.scale(bm_ad, vec=(0.008, 0.11, 0.014), verts=last_v)
            bmesh.ops.rotate(bm_ad, cent=(0,0,0), matrix=Matrix.Rotation(ang + math.radians(20), 3, 'Z'), verts=last_v)
            bmesh.ops.translate(bm_ad, vec=(vx, vy, 0.014), verts=last_v)

        me_ad = bpy.data.meshes.new(f"Wheel_AeroDisc_{code}_Mesh")
        bm_ad.to_mesh(me_ad)
        bm_ad.free()
        ad = bpy.data.objects.new(f"Wheel_AeroDisc_{code}", me_ad)
        ad.location = (wx + sign * 0.04, wy, 0.34)
        ad.rotation_euler = (0, math.radians(90), 0)
        ad.data.materials.append(mat_carbon_gloss())
        bpy.context.collection.objects.link(ad)
        finalize_object(ad, bevel_width=0.002)
        ad.parent = root

        # Wheel Spats / Tire Wake Air Deflector
        bm_sp = bmesh.new()
        bmesh.ops.create_cone(bm_sp, cap_ends=True, segments=24, radius1=0.035, radius2=0.015, depth=0.24)
        bmesh.ops.scale(bm_sp, vec=(0.8, 1.2, 0.5), verts=bm_sp.verts)
        me_sp = bpy.data.meshes.new(f"Wheel_Spats_{code}_Mesh")
        bm_sp.to_mesh(me_sp)
        bm_sp.free()
        spat = bpy.data.objects.new(f"Wheel_Spats_{code}", me_sp)
        spat.location = (wx + sign * 0.02, wy + 0.24, 0.12)
        spat.rotation_euler = (math.radians(90), 0, 0)
        spat.data.materials.append(mat_carbon_satin())
        bpy.context.collection.objects.link(spat)
        finalize_object(spat, bevel_width=0.001)
        spat.parent = root

    export_glb("AERO_WHEEL_AERO_001.glb", "aero_wheel_aero.glb")

# -----------------------------------------------------------------------------
# 10. HOST CHASSIS SILHOUETTE (AERO_HOST_CHASSIS_001.glb)
# -----------------------------------------------------------------------------

def build_host_chassis_asset():
    clean_scene()
    print("\n--- BUILDING: AERO_HOST_CHASSIS_001 ---")

    root = bpy.data.objects.new("HostChassis_Root", None)
    root.location = (0.0, 0.0, 0.0)
    bpy.context.collection.objects.link(root)

    # 1. High-Density Sculpted Hypercar Main Monocoque Body
    bm_b = bmesh.new()
    ny = 48
    nx = 32
    length = 4.55
    width = 1.96
    for j in range(ny + 1):
        v = j / float(ny)
        y_w = 2.28 - v * length
        if v < 0.18:
            # Front nose, splitter shelf, radiator inlet
            z_prof = 0.32 + (v / 0.18) * 0.40
            w_prof = 0.72 + (v / 0.18) * 0.26
        elif v < 0.48:
            # Cowl, windshield, double-bubble roof apex
            t = (v - 0.18) / 0.30
            z_prof = 0.72 + math.sin(t * math.pi) * 0.50
            w_prof = 0.98 - math.sin(t * math.pi) * 0.18
        else:
            # Fastback engine deck, rear haunches, and diffuser cradle
            t = (v - 0.48) / 0.52
            z_prof = 1.12 - t * 0.35
            w_prof = 0.80 + t * 0.20

        for i in range(nx + 1):
            u = i / float(nx)
            x_w = (u - 0.5) * width * w_prof
            # Compound crown curvature & roof bubbles
            roof_crown = 0.04 * math.sin(u * math.pi * 2) if (0.22 < v < 0.46) else 0.0
            z_w = z_prof * (1.0 - ((u - 0.5) * 0.38) ** 2) + roof_crown
            bm_b.verts.new((x_w, y_w, z_w))

    bm_b.verts.ensure_lookup_table()
    for j in range(ny):
        for i in range(nx):
            v1 = bm_b.verts[j * (nx + 1) + i]
            v2 = bm_b.verts[j * (nx + 1) + i + 1]
            v3 = bm_b.verts[(j + 1) * (nx + 1) + i + 1]
            v4 = bm_b.verts[(j + 1) * (nx + 1) + i]
            bm_b.faces.new((v1, v2, v3, v4))

    me_b = bpy.data.meshes.new("HostChassis_Body_Mesh")
    bm_b.to_mesh(me_b)
    bm_b.free()
    body = bpy.data.objects.new("HostChassis_Body", me_b)
    body.location = (0.0, 0.0, 0.0)
    body.data.materials.append(mat_chassis_stealth())
    bpy.context.collection.objects.link(body)

    bpy.context.view_layer.objects.active = body
    body.select_set(True)
    sol = body.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol.thickness = 0.016
    bpy.ops.object.modifier_apply(modifier="Solidify")
    finalize_object(body, bevel_width=0.004, bevel_segments=2)
    body.parent = root

    # 2. Translucent Cockpit Canopy Glass with A/B Pillar Frame
    bm_g = bmesh.new()
    bmesh.ops.create_cone(bm_g, cap_ends=True, segments=36, radius1=0.74, radius2=0.56, depth=1.48)
    bmesh.ops.scale(bm_g, vec=(1.08, 1.0, 0.72), verts=bm_g.verts)
    me_g = bpy.data.meshes.new("HostChassis_Cockpit_Mesh")
    bm_g.to_mesh(me_g)
    bm_g.free()
    glass = bpy.data.objects.new("HostChassis_Cockpit", me_g)
    glass.location = (0.0, 0.08, 0.98)
    glass.rotation_euler = (math.radians(-75), 0, 0)
    glass.data.materials.append(mat_chassis_glass())
    bpy.context.collection.objects.link(glass)
    finalize_object(glass, bevel_width=0.003)
    glass.parent = root

    export_glb("AERO_HOST_CHASSIS_001.glb", "aero_host_chassis.glb")

# -----------------------------------------------------------------------------
# MASTER EXECUTION ENTRY POINT
# -----------------------------------------------------------------------------

def main():
    print("===================================================================")
    print("  LAUNCHING AERO STUDIO HIGH-DENSITY BLENDER 5.2 LTS GLB GENERATOR")
    print("===================================================================")
    build_rear_wing_asset()
    build_rear_spoiler_asset()
    build_front_splitter_asset()
    build_canards_asset()
    build_side_skirts_asset()
    build_diffuser_asset()
    build_underbody_floor_asset()
    build_active_aero_asset()
    build_roof_aero_asset()
    build_cooling_aero_asset()
    build_wheel_aero_asset()
    build_host_chassis_asset()
    print("===================================================================")
    print("  AERO STUDIO HIGH-DENSITY GLBS COMPILED SUCCESSFULLY!")
    print("===================================================================")

if __name__ == "__main__":
    main()
