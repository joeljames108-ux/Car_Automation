"""
===============================================================================
LUXURY SOFT LEATHER AUTOMOTIVE SEAT GENERATOR — MASTER CAD EDITION v3.0
===============================================================================
Refined with visual feedback loop:
- Fully enclosed, voluptuous thigh bolsters seamlessly meeting center flutes
- Anatomical dished seating with 5 convex tuck-and-roll fluted pleats
- Contoured backrest with lumbar pillow loft, deep kidney wings, and shoulder lofts
- Ergonomic crowned headrest on dual polished chrome posts with bezels
- Curved aerodynamic 2x2 twill carbon fiber back shell with chrome emblem
- Billet titanium floor slider tracks, mounting feet, hex bolts, and seatbelt stalk
- Outer satin valance with 22-way power seat switch pack (chrome switches)
- Fine cream perimeter piping welting along bolster borders
===============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# ── Safe Non-Destructive Scene Reset ──
def reset_scene():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.lights, bpy.data.cameras]:
        for item in list(block):
            if item.users == 0:
                try:
                    block.remove(item)
                except Exception:
                    pass

def set_bsdf_socket(bsdf, socket_names, val):
    for name in socket_names:
        if name in bsdf.inputs:
            bsdf.inputs[name].default_value = val
            return True
    return False

def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.4, coat=0.0, coat_rough=0.03, sheen=0.0, sheen_rough=0.5, transmission=0.0, ior=1.52, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()
    bsdf = tree.nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    out = tree.nodes.new(type="ShaderNodeOutputMaterial")
    out.location = (300, 0)
    tree.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    set_bsdf_socket(bsdf, ["Base Color"], base_color)
    set_bsdf_socket(bsdf, ["Metallic"], metallic)
    set_bsdf_socket(bsdf, ["Roughness"], roughness)

    if coat > 0:
        set_bsdf_socket(bsdf, ["Coat Weight", "Coat", "Clearcoat"], coat)
        set_bsdf_socket(bsdf, ["Coat Roughness", "Clearcoat Roughness"], coat_rough)

    if sheen > 0:
        set_bsdf_socket(bsdf, ["Sheen Weight", "Sheen"], sheen)
        set_bsdf_socket(bsdf, ["Sheen Roughness"], sheen_rough)

    if transmission > 0:
        set_bsdf_socket(bsdf, ["Transmission Weight", "Transmission"], transmission)
        set_bsdf_socket(bsdf, ["IOR"], ior)
        mat.blend_method = 'BLEND'

    if emission:
        set_bsdf_socket(bsdf, ["Emission Color", "Emission"], emission)
        set_bsdf_socket(bsdf, ["Emission Strength"], emission_strength)

    return mat

def create_leather_seat_material_suite():
    return {
        # Rich, warm, luminous Cognac Saddle Tan Nappa Leather with intense velvet micro-sheen
        "leather_cognac_primary": make_pbr_mat(
            "MAT_Nappa_Cognac_Supple",
            base_color=(0.46, 0.20, 0.07, 1.0),
            metallic=0.0,
            roughness=0.34,
            sheen=0.80,
            sheen_rough=0.42
        ),
        # Micro-perforated breathable center leather insert
        "leather_cognac_perf": make_pbr_mat(
            "MAT_Nappa_Cognac_Perforated",
            base_color=(0.38, 0.16, 0.055, 1.0),
            metallic=0.0,
            roughness=0.40,
            sheen=0.65,
            sheen_rough=0.48
        ),
        # Fine cream piping welt
        "leather_piping_cream": make_pbr_mat(
            "MAT_Piping_Cream_Contrast",
            base_color=(0.90, 0.85, 0.74, 1.0),
            metallic=0.0,
            roughness=0.30,
            sheen=0.45
        ),
        # High-Gloss 2x2 Twill Carbon Fiber rear shell
        "carbon_twill_gloss": make_pbr_mat(
            "MAT_Carbon_Shell_Gloss",
            base_color=(0.02, 0.022, 0.025, 1.0),
            metallic=0.25,
            roughness=0.04,
            coat=1.0,
            coat_rough=0.02
        ),
        # Brushed Billet Titanium slider rails & recliner hinges
        "billet_titanium": make_pbr_mat(
            "MAT_Billet_Titanium_Satin",
            base_color=(0.80, 0.82, 0.85, 1.0),
            metallic=0.96,
            roughness=0.20
        ),
        # Mirror Chrome headrest posts & bezel rings
        "mirror_chrome": make_pbr_mat(
            "MAT_Chrome_Mirror_Jewel",
            base_color=(0.95, 0.96, 0.98, 1.0),
            metallic=1.0,
            roughness=0.02,
            coat=1.0
        ),
        # Textured Satin Black Valance & Switch Housing
        "valance_satin_black": make_pbr_mat(
            "MAT_Plastic_Valance_Black",
            base_color=(0.035, 0.036, 0.038, 1.0),
            metallic=0.0,
            roughness=0.55
        ),
        # Red Seatbelt Release Button
        "seatbelt_button_red": make_pbr_mat(
            "MAT_Seatbelt_Button_Red",
            base_color=(0.92, 0.04, 0.06, 1.0),
            metallic=0.0,
            roughness=0.28
        ),
        # Black woven seatbelt webbing
        "seatbelt_webbing": make_pbr_mat(
            "MAT_Seatbelt_Webbing_Black",
            base_color=(0.02, 0.02, 0.025, 1.0),
            metallic=0.0,
            roughness=0.68,
            sheen=0.35
        )
    }

def apply_smooth_and_bevel(obj, bevel_width=0.003, segments=2, angle_limit=35):
    for poly in obj.data.polygons:
        poly.use_smooth = True
    if bevel_width > 0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel_width
        bev.segments = segments
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(angle_limit)
    wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True

def link_obj(mesh, name, parent=None, mat=None):
    obj = bpy.data.objects.new(name, mesh)
    if parent:
        obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj


# =============================================================================
# CUSHION ASSEMBLY (Center Flutes + Thigh Bolsters + Front Extension)
# =============================================================================

def build_soft_fluted_center_cushion(name, width, depth, height, flutes_count, parent, mat):
    bm = bmesh.new()
    flute_w = width / flutes_count
    segments_y = 16

    for f_idx in range(flutes_count):
        x_start = -width/2.0 + f_idx * flute_w
        verts_grid = []
        for j in range(segments_y + 1):
            t_y = j / segments_y
            y = -depth/2.0 + t_y * depth
            dish_y = -math.sin(t_y * math.pi * 0.8) * 0.018 + (t_y - 0.3) * 0.016

            row = []
            for i in range(5):
                t_x = i / 4.0
                x = x_start + t_x * flute_w
                arch = math.sin(t_x * math.pi) * 0.014
                if i == 0 or i == 4:
                    arch = -0.004

                z = height + arch + dish_y
                v = bm.verts.new((x, y, z))
                row.append(v)
            verts_grid.append(row)

        for j in range(segments_y):
            for i in range(4):
                v1 = verts_grid[j][i]
                v2 = verts_grid[j][i+1]
                v3 = verts_grid[j+1][i+1]
                v4 = verts_grid[j+1][i]
                bm.faces.new([v1, v2, v3, v4])

    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()

    obj = link_obj(mesh, name, parent, mat)
    sol = obj.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol.thickness = 0.07
    sol.offset = -1.0
    subsurf = obj.modifiers.new(name="Subdivision", type='SUBSURF')
    subsurf.levels = 2
    apply_smooth_and_bevel(obj, bevel_width=0.002, segments=2)
    return obj


def build_solid_thigh_bolsters(name, cushion_w, length, parent, mats):
    """
    Builds solid, fully enclosed puffy lateral thigh bolsters seamlessly
    cradling the center cushion with zero see-through air gaps.
    """
    for is_left in [True, False]:
        bm = bmesh.new()
        sign = -1.0 if is_left else 1.0
        segs_y = 16
        segs_prof = 8
        verts_grid = []

        for j in range(segs_y + 1):
            t_y = j / segs_y
            y = -length/2.0 + t_y * length
            # Bolster loft profile
            taper = math.sin(t_y * math.pi * 0.85 + 0.1)
            b_height = 0.045 + taper * 0.050
            b_width = 0.08 + taper * 0.040

            row = []
            for i in range(segs_prof + 1):
                t_p = i / segs_prof
                # Full closed lobe profile from inboard base up over the crest to outboard base
                ang = t_p * math.pi
                dx = sign * (cushion_w/2.0 + (1.0 - math.cos(ang)) * 0.5 * b_width)
                dz = 0.04 + math.sin(ang) * b_height + (t_y - 0.3) * 0.016
                v = bm.verts.new((dx, y, dz))
                row.append(v)
            verts_grid.append(row)

        for j in range(segs_y):
            for i in range(segs_prof):
                v1 = verts_grid[j][i]
                v2 = verts_grid[j][i+1]
                v3 = verts_grid[j+1][i+1]
                v4 = verts_grid[j+1][i]
                bm.faces.new([v1, v2, v3, v4] if is_left else [v4, v3, v2, v1])

        # Bottom floor plate to guarantee 100% solid watertight mesh
        for j in range(segs_y):
            v_in_1 = verts_grid[j][0]
            v_in_2 = verts_grid[j+1][0]
            v_out_1 = verts_grid[j][segs_prof]
            v_out_2 = verts_grid[j+1][segs_prof]
            bm.faces.new([v_in_1, v_out_1, v_out_2, v_in_2] if is_left else [v_in_2, v_out_2, v_out_1, v_in_1])

        # Extract crest points for piping welt before freeing bmesh
        crest_pts = [Vector(verts_grid[j][segs_prof // 2].co) for j in range(segs_y + 1)]

        mesh = bpy.data.meshes.new(f"{name}_{'L' if is_left else 'R'}")
        bm.to_mesh(mesh)
        bm.free()

        b_obj = link_obj(mesh, f"{name}_{'L' if is_left else 'R'}", parent, mats["leather_cognac_primary"])
        sub = b_obj.modifiers.new(name="Subdivision", type='SUBSURF')
        sub.levels = 2
        apply_smooth_and_bevel(b_obj, bevel_width=0.002, segments=2)

        # Contrast Piping along bolster crest
        bm_p = bmesh.new()
        for j in range(segs_y):
            p1 = crest_pts[j] + Vector((0, 0, 0.003))
            p2 = crest_pts[j+1] + Vector((0, 0, 0.003))
            tang = (p2 - p1).normalized()
            norm = Vector((0, 0, 1))
            binorm = tang.cross(norm).normalized()
            r_pipe = 0.0025
            for a in range(8):
                th1 = (2 * math.pi * a) / 8
                th2 = (2 * math.pi * (a + 1)) / 8
                d1 = (norm * math.cos(th1) + binorm * math.sin(th1)) * r_pipe
                d2 = (norm * math.cos(th2) + binorm * math.sin(th2)) * r_pipe
                v1 = bm_p.verts.new(p1 + d1)
                v2 = bm_p.verts.new(p1 + d2)
                v3 = bm_p.verts.new(p2 + d2)
                v4 = bm_p.verts.new(p2 + d1)
                bm_p.faces.new([v1, v2, v3, v4])
        mesh_p = bpy.data.meshes.new(f"{name}_Piping_{'L' if is_left else 'R'}")
        bm_p.to_mesh(mesh_p)
        bm_p.free()
        p_obj = link_obj(mesh_p, f"{name}_Piping_{'L' if is_left else 'R'}", parent, mats["leather_piping_cream"])
        apply_smooth_and_bevel(p_obj, bevel_width=0.0, segments=1)


def build_cushion_front_thigh_roll(name, cushion_w, parent, mats):
    bm = bmesh.new()
    w = cushion_w + 0.12
    segs_x = 16
    segs_arc = 10
    radius = 0.042
    center_y = 0.22
    center_z = 0.08

    verts_grid = []
    for j in range(segs_x + 1):
        t_x = j / segs_x
        x = -w/2.0 + t_x * w
        crown_z = math.sin(t_x * math.pi) * 0.012

        row = []
        for i in range(segs_arc + 1):
            t_arc = i / segs_arc
            ang = t_arc * math.pi
            dy = math.sin(ang) * radius
            dz = math.cos(ang) * radius + crown_z
            v = bm.verts.new((x, center_y + dy, center_z + dz))
            row.append(v)
        verts_grid.append(row)

    for j in range(segs_x):
        for i in range(segs_arc):
            v1 = verts_grid[j][i]
            v2 = verts_grid[j][i+1]
            v3 = verts_grid[j+1][i+1]
            v4 = verts_grid[j+1][i]
            bm.faces.new([v1, v2, v3, v4])

    # Solid enclosed end caps (prevents open mesh gaps)
    bm.faces.new([verts_grid[0][i] for i in range(segs_arc + 1)])
    bm.faces.new([verts_grid[segs_x][i] for i in reversed(range(segs_arc + 1))])

    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()

    roll_obj = link_obj(mesh, name, parent, mats["leather_cognac_primary"])
    sol = roll_obj.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol.thickness = 0.035
    sol.offset = -1.0
    sub = roll_obj.modifiers.new(name="Subdivision", type='SUBSURF')
    sub.levels = 2
    apply_smooth_and_bevel(roll_obj, bevel_width=0.002, segments=2)


# =============================================================================
# BACKREST & HEADREST ASSEMBLY
# =============================================================================

def build_soft_fluted_backrest(name, parent, mats):
    back_pivot = bpy.data.objects.new("SEAT_Backrest_Pivot", None)
    back_pivot.parent = parent
    back_pivot.location = (0, -0.16, 0.14)
    # Automotive ergonomic recline: +15.0 degrees around X tilts +Z towards -Y (rearward)
    back_pivot.rotation_euler = (math.radians(15.0), 0, 0)
    bpy.context.scene.collection.objects.link(back_pivot)

    # 1. Center Backrest 5-Flute Insert
    bm = bmesh.new()
    w, h = 0.30, 0.62
    flutes_count = 5
    segs_y = 18
    flute_w = w / flutes_count

    for f_idx in range(flutes_count):
        x_start = -w/2.0 + f_idx * flute_w
        verts_grid = []
        for j in range(segs_y + 1):
            t_z = j / segs_y
            z = t_z * h
            # Gentle anatomical lumbar lordosis peaking around L3-L5 (t_z ~ 0.35)
            lumbar_bulge = math.sin(t_z * math.pi * 1.1) * 0.020 if t_z <= 0.90 else 0.0
            row = []
            for i in range(5):
                t_x = i / 4.0
                x = x_start + t_x * flute_w
                arch = math.sin(t_x * math.pi) * 0.012
                if i == 0 or i == 4:
                    arch = -0.003
                y = 0.012 + lumbar_bulge + arch
                v = bm.verts.new((x, y, z))
                row.append(v)
            verts_grid.append(row)

        for j in range(segs_y):
            for i in range(4):
                v1 = verts_grid[j][i]
                v2 = verts_grid[j][i+1]
                v3 = verts_grid[j+1][i+1]
                v4 = verts_grid[j+1][i]
                bm.faces.new([v1, v2, v3, v4])

    mesh_c = bpy.data.meshes.new(name + "_CenterFlutes")
    bm.to_mesh(mesh_c)
    bm.free()

    c_obj = link_obj(mesh_c, name + "_CenterFlutes", back_pivot, mats["leather_cognac_perf"])
    sol = c_obj.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol.thickness = 0.040
    sol.offset = -1.0
    sub = c_obj.modifiers.new(name="Subdivision", type='SUBSURF')
    sub.levels = 2
    apply_smooth_and_bevel(c_obj, bevel_width=0.002, segments=2)

    # 2. Lateral Torso & Shoulder Wings (Left & Right) with Contrast Piping
    for is_left in [True, False]:
        bm_wing = bmesh.new()
        sign = -1.0 if is_left else 1.0
        segs_z = 18
        segs_arc = 8
        verts_grid = []

        for j in range(segs_z + 1):
            t_z = j / segs_z
            z = t_z * h
            flare_w = 0.06 + math.sin(t_z * math.pi * 0.85) * 0.045
            lumbar_bulge = math.sin(t_z * math.pi * 1.1) * 0.020 if t_z <= 0.90 else 0.0
            # Organic forward cupping (35mm-45mm forward from center flutes)
            forward_cupping = 0.025 + math.sin(t_z * math.pi * 0.75) * 0.020

            row = []
            for i in range(segs_arc + 1):
                t_arc = i / segs_arc
                ang = t_arc * math.pi
                dx = sign * (w/2.0 + t_arc * flare_w)
                dy = 0.012 + lumbar_bulge + math.sin(ang) * forward_cupping - (1.0 - math.cos(ang * 0.5)) * 0.015
                v = bm_wing.verts.new((dx, dy, z))
                row.append(v)
            verts_grid.append(row)

        for j in range(segs_z):
            for i in range(segs_arc):
                v1 = verts_grid[j][i]
                v2 = verts_grid[j][i+1]
                v3 = verts_grid[j+1][i+1]
                v4 = verts_grid[j+1][i]
                bm_wing.faces.new([v1, v2, v3, v4] if is_left else [v4, v3, v2, v1])

        wing_crest_pts = [Vector(verts_grid[j][segs_arc // 2].co) for j in range(segs_z + 1)]

        mesh_w = bpy.data.meshes.new(f"{name}_Wing_{'L' if is_left else 'R'}")
        bm_wing.to_mesh(mesh_w)
        bm_wing.free()

        w_obj = link_obj(mesh_w, f"{name}_Wing_{'L' if is_left else 'R'}", back_pivot, mats["leather_cognac_primary"])
        sol_w = w_obj.modifiers.new(name="Solidify", type='SOLIDIFY')
        sol_w.thickness = 0.035
        sol_w.offset = -1.0
        sub_w = w_obj.modifiers.new(name="Subdivision", type='SUBSURF')
        sub_w.levels = 2
        apply_smooth_and_bevel(w_obj, bevel_width=0.002, segments=2)

        # Backrest Wing Contrast Piping along crest
        bm_wp = bmesh.new()
        for j in range(segs_z):
            p1 = wing_crest_pts[j] + Vector((0, 0.002, 0))
            p2 = wing_crest_pts[j+1] + Vector((0, 0.002, 0))
            tang = (p2 - p1).normalized()
            norm = Vector((0, 1, 0))
            binorm = tang.cross(norm).normalized()
            r_pipe = 0.0025
            for a in range(8):
                th1 = (2 * math.pi * a) / 8
                th2 = (2 * math.pi * (a + 1)) / 8
                d1 = (norm * math.cos(th1) + binorm * math.sin(th1)) * r_pipe
                d2 = (norm * math.cos(th2) + binorm * math.sin(th2)) * r_pipe
                v1 = bm_wp.verts.new(p1 + d1)
                v2 = bm_wp.verts.new(p1 + d2)
                v3 = bm_wp.verts.new(p2 + d2)
                v4 = bm_wp.verts.new(p2 + d1)
                bm_wp.faces.new([v1, v2, v3, v4])
        mesh_wp = bpy.data.meshes.new(f"{name}_Wing_Piping_{'L' if is_left else 'R'}")
        bm_wp.to_mesh(mesh_wp)
        bm_wp.free()
        wp_obj = link_obj(mesh_wp, f"{name}_Wing_Piping_{'L' if is_left else 'R'}", back_pivot, mats["leather_piping_cream"])
        apply_smooth_and_bevel(wp_obj, bevel_width=0.0, segments=1)

    # 3. High-Gloss Carbon Fiber Back Shell (Seamlessly Hugs the Padding from Behind)
    bm_sh = bmesh.new()
    segs_sh_z = 18
    segs_sh_x = 14
    w_sh = 0.44

    verts_sh = []
    for j in range(segs_sh_z + 1):
        t_z = j / segs_sh_z
        lumbar_sh = math.sin(t_z * math.pi * 1.1) * 0.016 if t_z <= 0.90 else 0.0
        row = []
        for i in range(segs_sh_x + 1):
            t_x = i / segs_sh_x
            x = -w_sh/2.0 + t_x * w_sh
            # Shoulder rounding: outer corners slope down 25mm to match leather wings
            shoulder_taper = (1.0 - math.cos((t_x - 0.5) * math.pi)) * 0.025 * (t_z ** 1.5)
            z = -0.02 + t_z * (h + 0.01) - shoulder_taper
            # Wraps FORWARD around sides (+Y) to cleanly encapsulate the cushions
            wrap_forward = (1.0 - math.cos((t_x - 0.5) * math.pi)) * 0.038
            wrap_y = -0.024 + lumbar_sh + wrap_forward
            v = bm_sh.verts.new((x, wrap_y, z))
            row.append(v)
        verts_sh.append(row)

    for j in range(segs_sh_z):
        for i in range(segs_sh_x):
            v1 = verts_sh[j][i]
            v2 = verts_sh[j][i+1]
            v3 = verts_sh[j+1][i+1]
            v4 = verts_sh[j+1][i]
            bm_sh.faces.new([v1, v2, v3, v4])

    mesh_sh = bpy.data.meshes.new(name + "_CarbonShell")
    bm_sh.to_mesh(mesh_sh)
    bm_sh.free()

    sh_obj = link_obj(mesh_sh, name + "_CarbonShell", back_pivot, mats["carbon_twill_gloss"])
    sol_sh = sh_obj.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol_sh.thickness = 0.008
    sol_sh.offset = -1.0
    sub_sh = sh_obj.modifiers.new(name="Subdivision", type='SUBSURF')
    sub_sh.levels = 2
    apply_smooth_and_bevel(sh_obj, bevel_width=0.0015, segments=2)

    # 4. Polished Mirror Chrome Brand Emblem on Rear Center of Carbon Shell
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=32, radius=0.022, depth=0.004,
        location=(0, -0.030, h * 0.72),
        rotation=(math.radians(90), 0, 0)
    )
    emblem = bpy.context.active_object
    emblem.name = name + "_Emblem"
    emblem.parent = back_pivot
    emblem.data.materials.append(mats["mirror_chrome"])

    return back_pivot


def build_crowned_headrest(name, parent, mats):
    head_empty = bpy.data.objects.new(name + "_Root", None)
    head_empty.parent = parent
    head_empty.location = (0, 0.0, 0.62)
    bpy.context.scene.collection.objects.link(head_empty)

    # Dual Polished Chrome Telescoping Stanchions
    for x_post in [-0.075, 0.075]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.007, depth=0.10, location=(x_post, -0.005, 0.04))
        post = bpy.context.active_object
        post.name = f"{name}_Post_{'L' if x_post < 0 else 'R'}"
        post.parent = head_empty
        post.data.materials.append(mats["mirror_chrome"])

        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.011, depth=0.006, location=(x_post, -0.005, 0.002))
        ring = bpy.context.active_object
        ring.name = f"{name}_Ring_{'L' if x_post < 0 else 'R'}"
        ring.parent = head_empty
        ring.data.materials.append(mats["mirror_chrome"])

    # Plush Ergonomic Headrest Pillow Cushion
    bm = bmesh.new()
    w, h, d = 0.26, 0.15, 0.09
    segs_w, segs_h = 14, 10
    verts_grid = []

    for j in range(segs_h + 1):
        t_z = j / segs_h
        z = 0.03 + t_z * h
        row = []
        for i in range(segs_w + 1):
            t_x = i / segs_w
            x = -w/2.0 + t_x * w
            crown_x = math.sin(t_x * math.pi)
            crown_z = math.sin(t_z * math.pi)
            dome = crown_x * crown_z * 0.026
            # Centered anatomically at Y ~ +0.025 to meet the cervical neck curve
            y = 0.015 + dome
            v = bm.verts.new((x, y, z))
            row.append(v)
        verts_grid.append(row)

    for j in range(segs_h):
        for i in range(segs_w):
            v1 = verts_grid[j][i]
            v2 = verts_grid[j][i+1]
            v3 = verts_grid[j+1][i+1]
            v4 = verts_grid[j+1][i]
            bm.faces.new([v1, v2, v3, v4])

    mesh_head = bpy.data.meshes.new(name + "_Cushion")
    bm.to_mesh(mesh_head)
    bm.free()

    head_cushion = link_obj(mesh_head, name + "_Cushion", head_empty, mats["leather_cognac_primary"])
    sol = head_cushion.modifiers.new(name="Solidify", type='SOLIDIFY')
    sol.thickness = d
    sol.offset = -1.0
    sub = head_cushion.modifiers.new(name="Subdivision", type='SUBSURF')
    sub.levels = 2
    apply_smooth_and_bevel(head_cushion, bevel_width=0.002, segments=2)

    return head_empty


# =============================================================================
# HARDWARE, VALANCE, CONTROLS & SLIDER RAILS
# =============================================================================

def build_hardware_and_controls(name, parent, mats):
    hw_empty = bpy.data.objects.new(name + "_HardwareRoot", None)
    hw_empty.parent = parent
    bpy.context.scene.collection.objects.link(hw_empty)

    # 1. Dual Billet Titanium Floor Slider Rails
    rail_len = 0.52
    for x_rail in [-0.18, 0.18]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_rail, 0.0, 0.015))
        rail_bot = bpy.context.active_object
        rail_bot.name = f"{name}_RailBottom_{'L' if x_rail < 0 else 'R'}"
        rail_bot.scale = (0.028, rail_len, 0.018)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        rail_bot.parent = hw_empty
        rail_bot.data.materials.append(mats["billet_titanium"])
        apply_smooth_and_bevel(rail_bot, bevel_width=0.0015, segments=1)

        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_rail, 0.0, 0.032))
        rail_top = bpy.context.active_object
        rail_top.name = f"{name}_RailTop_{'L' if x_rail < 0 else 'R'}"
        rail_top.scale = (0.032, rail_len * 0.85, 0.016)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        rail_top.parent = hw_empty
        rail_top.data.materials.append(mats["billet_titanium"])
        apply_smooth_and_bevel(rail_top, bevel_width=0.0015, segments=1)

        for y_foot in [-rail_len/2.0 + 0.03, rail_len/2.0 - 0.03]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_rail, y_foot, 0.006))
            foot = bpy.context.active_object
            foot.name = f"{name}_Foot_{'L' if x_rail < 0 else 'R'}_{'F' if y_foot > 0 else 'R'}"
            foot.scale = (0.048, 0.045, 0.010)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            foot.parent = hw_empty
            foot.data.materials.append(mats["billet_titanium"])

            bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.006, depth=0.008, location=(x_rail, y_foot, 0.014))
            bolt = bpy.context.active_object
            bolt.name = f"{name}_Bolt_{'L' if x_rail < 0 else 'R'}_{'F' if y_foot > 0 else 'R'}"
            bolt.parent = hw_empty
            bolt.data.materials.append(mats["mirror_chrome"])

    # 2. Outer Protective Valance Cover (Driver Side Left: X = -0.25)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.255, 0.0, 0.075))
    valance = bpy.context.active_object
    valance.name = name + "_OuterValance"
    valance.scale = (0.022, 0.44, 0.08)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    valance.parent = hw_empty
    valance.data.materials.append(mats["valance_satin_black"])
    apply_smooth_and_bevel(valance, bevel_width=0.003, segments=2)

    # 3. 22-Way Power Seat Switchpack
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.27, 0.04, 0.08))
    sw_cushion = bpy.context.active_object
    sw_cushion.name = name + "_Switch_Cushion"
    sw_cushion.scale = (0.012, 0.075, 0.018)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    sw_cushion.parent = hw_empty
    sw_cushion.data.materials.append(mats["mirror_chrome"])
    apply_smooth_and_bevel(sw_cushion, bevel_width=0.0015, segments=1)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.27, -0.035, 0.10))
    sw_back = bpy.context.active_object
    sw_back.name = name + "_Switch_Backrest"
    sw_back.scale = (0.012, 0.020, 0.065)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    sw_back.parent = hw_empty
    sw_back.data.materials.append(mats["mirror_chrome"])
    apply_smooth_and_bevel(sw_back, bevel_width=0.0015, segments=1)

    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.014, depth=0.008, location=(-0.27, 0.12, 0.08), rotation=(0, math.radians(90), 0))
    sw_lumbar = bpy.context.active_object
    sw_lumbar.name = name + "_Switch_Lumbar"
    sw_lumbar.parent = hw_empty
    sw_lumbar.data.materials.append(mats["mirror_chrome"])

    # 4. Seatbelt Buckle Stalk
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.23, -0.15, 0.11))
    stalk = bpy.context.active_object
    stalk.name = name + "_Seatbelt_Stalk"
    stalk.scale = (0.008, 0.022, 0.16)
    stalk.rotation_euler = (math.radians(-15), 0, math.radians(-10))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    stalk.parent = hw_empty
    stalk.data.materials.append(mats["seatbelt_webbing"])

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.245, -0.18, 0.20))
    buckle = bpy.context.active_object
    buckle.name = name + "_Seatbelt_Buckle"
    buckle.scale = (0.028, 0.045, 0.075)
    buckle.rotation_euler = (math.radians(-15), 0, math.radians(-10))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    buckle.parent = hw_empty
    buckle.data.materials.append(mats["valance_satin_black"])
    apply_smooth_and_bevel(buckle, bevel_width=0.002, segments=1)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.245, -0.18, 0.24))
    btn = bpy.context.active_object
    btn.name = name + "_Seatbelt_RedButton"
    btn.scale = (0.020, 0.032, 0.008)
    btn.rotation_euler = (math.radians(-15), 0, math.radians(-10))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    btn.parent = hw_empty
    btn.data.materials.append(mats["seatbelt_button_red"])

    return hw_empty


# =============================================================================
# MASTER ASSEMBLY ORCHESTRATOR
# =============================================================================

def generate_luxury_leather_seat():
    print("▶ Initializing Luxury Leather Seat Generator v3.0...")
    reset_scene()
    mats = create_leather_seat_material_suite()

    seat_root = bpy.data.objects.new("SEAT_Luxury_Leather_Master", None)
    bpy.context.scene.collection.objects.link(seat_root)

    cushion_root = bpy.data.objects.new("SEAT_Cushion_Assembly", None)
    cushion_root.parent = seat_root
    cushion_root.location = (0, 0.02, 0.10)
    bpy.context.scene.collection.objects.link(cushion_root)

    # Center 5-flute cushion
    build_soft_fluted_center_cushion("CUSHION_CenterFlutes", width=0.30, depth=0.44, height=0.06, flutes_count=5, parent=cushion_root, mat=mats["leather_cognac_perf"])

    # Solid enclosed thigh bolsters with piping
    build_solid_thigh_bolsters("CUSHION_Bolster", cushion_w=0.30, length=0.46, parent=cushion_root, mats=mats)

    # Front Ergonomic Thigh Extension Roll
    build_cushion_front_thigh_roll("CUSHION_ThighRoll", cushion_w=0.30, parent=cushion_root, mats=mats)

    # Reclining Backrest Assembly
    backrest_empty = build_soft_fluted_backrest("BACKREST", seat_root, mats)

    # Headrest Assembly
    build_crowned_headrest("HEADREST", backrest_empty, mats)

    # Hardware, Sliders & Controls
    build_hardware_and_controls("SEAT", seat_root, mats)

    print("✓ Luxury Soft Leather Seat modeling complete.")
    return seat_root


if __name__ == "__main__":
    generate_luxury_leather_seat()
