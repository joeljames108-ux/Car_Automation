"""
================================================================================
APEX ENGINEER: CLASS-A PRODUCTION MASTER CAD PIPELINE
VEHICLE 25: 1970s ALFA ROMEO SPIDER VELOCE (SERIES 2 CODA TRONCA)
================================================================================
Universal Automotive Origin:
- Front Axle Center Ground Origin: (0, 0, 0)
- Dimensions: Length 4,120mm (Y: +0.760m to -3.360m), Width 1,630mm (X: +/-0.815m), Height 1,290mm
- Wheelbase: 2,250mm (Front Axle Y = 0.000m, Rear Axle Y = -2.250m)
- Target Quality: 100.0% Grade A Production Certification
- 7 Subsystem Domains: BODY, AERO, CHASSIS, GLASS, LIGHTING, POWERTRAIN, WHEELS (+ INTERIOR)
- Pininfarina "Coda Tronca" Sculptural Unibody with Authentic Front & Rear Wheel Arches
- Recessed Round 7-inch Halogen Headlamp Nacelle Buckets & Chrome Scudetto Heart
- Flush Articulating Doors with Lower A-Pillar Hinge Vectors & Scallop Lines
- Open Campagnolo Turbina Magnesium Wheels with 24 Radial Vanes & Dunlop/Pirelli Tires
- Driver-Focused Roadster Cockpit: Twin Conical Veglia Gauges, Hellebore Wood Wheel, Ribbed Buckets
- 10 Semantic Audio-Haptic Hitboxes, 7+ Keyframed NLA Actions, 4 Standardized Cameras
================================================================================
"""

import bpy
import bmesh
from mathutils import Vector, Matrix, Euler
import math
import os
import shutil
import subprocess


# ─── 1. Scene Management & Helpers ───────────────────────────────────────────
def clean_scene():
    """Wipe default scene artifacts and initialize clean context."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for b in [bpy.data.meshes, bpy.data.materials, bpy.data.textures,
              bpy.data.images, bpy.data.cameras, bpy.data.lights, bpy.data.actions]:
        for item in list(b):
            b.remove(item, do_unlink=True)


def safe_face(bm, verts, mat_idx=0):
    """Safely create an n-gon or quad face, preventing duplicate face collisions."""
    unique_v = []
    seen = set()
    for v in verts:
        if v not in seen:
            unique_v.append(v)
            seen.add(v)
    if len(unique_v) < 3:
        return None
    try:
        f = bm.faces.new(unique_v)
        f.material_index = mat_idx
        return f
    except ValueError:
        return None


def add_box(bm, size=(1, 1, 1), matrix=Matrix(), mat_idx=0):
    """Procedural box primitive generator."""
    sx, sy, sz = size[0] * 0.5, size[1] * 0.5, size[2] * 0.5
    v = [
        bm.verts.new(matrix @ Vector((-sx, -sy, -sz))),
        bm.verts.new(matrix @ Vector(( sx, -sy, -sz))),
        bm.verts.new(matrix @ Vector(( sx,  sy, -sz))),
        bm.verts.new(matrix @ Vector((-sx,  sy, -sz))),
        bm.verts.new(matrix @ Vector((-sx, -sy,  sz))),
        bm.verts.new(matrix @ Vector(( sx, -sy,  sz))),
        bm.verts.new(matrix @ Vector(( sx,  sy,  sz))),
        bm.verts.new(matrix @ Vector((-sx,  sy,  sz)))
    ]
    faces = [
        (0, 1, 2, 3), (4, 7, 6, 5),
        (0, 4, 5, 1), (2, 6, 7, 3),
        (0, 3, 7, 4), (1, 5, 6, 2)
    ]
    for idxs in faces:
        safe_face(bm, [v[i] for i in idxs], mat_idx=mat_idx)


def add_cylinder(bm, radius1=0.1, radius2=0.1, depth=0.2, segments=24, matrix=Matrix(), cap_ends=True, mat_idx=0):
    """Procedural cylinder/cone primitive generator."""
    r1, r2, d = radius1, radius2, depth * 0.5
    bot_ring = []
    top_ring = []
    for i in range(segments):
        theta = 2.0 * math.pi * i / segments
        x = math.cos(theta)
        y = math.sin(theta)
        bot_ring.append(bm.verts.new(matrix @ Vector((x * r1, y * r1, -d))))
        top_ring.append(bm.verts.new(matrix @ Vector((x * r2, y * r2,  d))))

    for i in range(segments):
        nxt = (i + 1) % segments
        safe_face(bm, (bot_ring[i], bot_ring[nxt], top_ring[nxt], top_ring[i]), mat_idx=mat_idx)

    if cap_ends:
        c_bot = bm.verts.new(matrix @ Vector((0, 0, -d)))
        c_top = bm.verts.new(matrix @ Vector((0, 0,  d)))
        for i in range(segments):
            nxt = (i + 1) % segments
            safe_face(bm, (bot_ring[nxt], bot_ring[i], c_bot), mat_idx=mat_idx)
            safe_face(bm, (top_ring[i], top_ring[nxt], c_top), mat_idx=mat_idx)


def add_annulus(bm, r_outer, r_inner, depth=0.02, segments=36, matrix=Matrix(), mat_idx=0):
    """
    Procedural hollow disc / donut ring:
    Leaves the center (r < r_inner) 100% open! Perfect for wheels, tires & bezels.
    """
    d = depth * 0.5
    outer_top = []
    outer_bot = []
    inner_top = []
    inner_bot = []

    for i in range(segments):
        th = 2.0 * math.pi * i / segments
        cx = math.cos(th)
        cy = math.sin(th)
        outer_top.append(bm.verts.new(matrix @ Vector((cx * r_outer, cy * r_outer,  d))))
        outer_bot.append(bm.verts.new(matrix @ Vector((cx * r_outer, cy * r_outer, -d))))
        inner_top.append(bm.verts.new(matrix @ Vector((cx * r_inner, cy * r_inner,  d))))
        inner_bot.append(bm.verts.new(matrix @ Vector((cx * r_inner, cy * r_inner, -d))))

    for i in range(segments):
        nxt = (i + 1) % segments
        # Top annular face
        safe_face(bm, (outer_top[i], outer_top[nxt], inner_top[nxt], inner_top[i]), mat_idx=mat_idx)
        # Bottom annular face
        safe_face(bm, (outer_bot[nxt], outer_bot[i], inner_bot[i], inner_bot[nxt]), mat_idx=mat_idx)
        # Outer cylindrical edge
        safe_face(bm, (outer_bot[i], outer_bot[nxt], outer_top[nxt], outer_top[i]), mat_idx=mat_idx)
        # Inner cylindrical rim
        safe_face(bm, (inner_top[i], inner_top[nxt], inner_bot[nxt], inner_bot[i]), mat_idx=mat_idx)


def add_rod(bm, p1, p2, radius=0.015, segments=12, mat_idx=0):
    """Connect two 3D points with an authentic tubular rod."""
    p1 = Vector(p1)
    p2 = Vector(p2)
    delta = p2 - p1
    length = delta.length
    if length < 1e-5:
        return
    center = (p1 + p2) * 0.5
    dir_v = delta.normalized()
    rot = dir_v.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    mat = Matrix.Translation(center) @ rot
    add_cylinder(bm, radius1=radius, radius2=radius, depth=length, segments=segments, matrix=mat, cap_ends=True, mat_idx=mat_idx)


def finish_mesh_obj(name, bm, mats, mat_keys, parent_col, smooth=True, bevel_w=0.0025, subsurf_lvl=2):
    """Convert bmesh to object with modifiers and materials."""
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    parent_col.objects.link(obj)

    for k in mat_keys:
        if k in mats:
            obj.data.materials.append(mats[k])

    if smooth:
        for p in obj.data.polygons:
            p.use_smooth = True

    if bevel_w > 0.0001:
        mod_bev = obj.modifiers.new("Bevel", 'BEVEL')
        mod_bev.width = bevel_w
        mod_bev.segments = 2
        mod_bev.limit_method = 'ANGLE'
        mod_bev.angle_limit = math.radians(35.0)

    if subsurf_lvl > 0:
        mod_sub = obj.modifiers.new("Subsurf", 'SUBSURF')
        mod_sub.levels = subsurf_lvl
        mod_sub.render_levels = subsurf_lvl

    mod_wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    mod_wn.keep_sharp = True

    return obj


# ─── 2. Photorealistic PBR Material Factory ──────────────────────────────────
def build_materials():
    """Create authentic PBR materials for the Alfa Romeo Spider Veloce."""
    mats = {}

    def new_pbr(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, transmission=0.0, emission=None, emission_strength=1.0, ior=1.5, alpha=1.0):
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        nodes.clear()

        out_node = nodes.new("ShaderNodeOutputMaterial")
        bsdf = nodes.new("ShaderNodeBsdfPrincipled")
        links.new(bsdf.outputs["BSDF"], out_node.inputs["Surface"])

        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness

        if "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = clearcoat
        elif "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = clearcoat

        if "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = transmission
        elif "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = transmission

        if "IOR" in bsdf.inputs:
            bsdf.inputs["IOR"].default_value = ior

        if alpha < 1.0:
            if "Alpha" in bsdf.inputs:
                bsdf.inputs["Alpha"].default_value = alpha
            mat.blend_method = 'BLEND'

        if emission is not None:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = emission
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength
        return mat

    # 1. Exterior Paint: Deep Iconic Rosso Alfa (Classic Italian Gloss Red)
    mats['paint_rosso_alfa']    = new_pbr("Paint_Rosso_Alfa", (0.35, 0.008, 0.008, 1.0), metallic=0.10, roughness=0.10, clearcoat=1.0)
    # 2. Mirror-Polished Vintage Italian Chrome (Scudetto, Bumpers, Windshield Frame, Badges)
    mats['chrome_vintage']      = new_pbr("Chrome_Vintage_Italian", (0.97, 0.97, 0.98, 1.0), metallic=1.0, roughness=0.02, clearcoat=1.0)
    # 3. Campagnolo Turbina Magnesium Alloy (Warm Cast Silver)
    mats['alloy_campagnolo']    = new_pbr("Alloy_Campagnolo_Magnesium", (0.80, 0.81, 0.83, 1.0), metallic=0.88, roughness=0.22)
    # 4. Satin Black Rubber / Plastic (Bumper Overriders, Seals, Weatherstripping)
    mats['rubber_satin_black']  = new_pbr("Rubber_Satin_Black", (0.025, 0.025, 0.025, 1.0), metallic=0.02, roughness=0.72)
    # 5. Folding Canvas Soft-Top Tonneau (Textured Black Vinyl Fabric)
    mats['canvas_tonneau_black']= new_pbr("Canvas_Tonneau_Black", (0.035, 0.035, 0.038, 1.0), metallic=0.0, roughness=0.88)
    # 6. Optical Dielectric Laminated Safety Windshield Glass (Clear, subtle sky reflection)
    mats['glass_windshield']    = new_pbr("Glass_Windshield_Clear", (0.92, 0.96, 0.98, 1.0), metallic=0.0, roughness=0.02, clearcoat=1.0, transmission=0.95, alpha=0.22)
    # 7. 7-inch Sealed-Beam Halogen Headlamp Reflector (Warm 3200K Halogen)
    mats['led_headlamp_warm']   = new_pbr("Light_Halogen_SealedBeam", (1.0, 0.96, 0.88, 1.0), metallic=0.0, roughness=0.08, emission=(1.0, 0.95, 0.85, 1.0), emission_strength=18.0)
    # 8. Front Turn Signal Fluted Amber Lens
    mats['lens_amber']          = new_pbr("Lens_Amber_Turn", (1.0, 0.45, 0.02, 1.0), metallic=0.0, roughness=0.14, emission=(1.0, 0.42, 0.0, 1.0), emission_strength=12.0)
    # 9. Rear Coda Tronca Tri-Color Taillamp Lens (Ruby Red)
    mats['lens_ruby_tail']      = new_pbr("Lens_Ruby_Taillamp", (0.85, 0.02, 0.03, 1.0), metallic=0.0, roughness=0.12, emission=(0.95, 0.02, 0.02, 1.0), emission_strength=16.0)
    # 10. Reverse White Lens
    mats['lens_reverse_white']  = new_pbr("Lens_Reverse_White", (0.95, 0.95, 0.95, 1.0), metallic=0.0, roughness=0.10, emission=(0.90, 0.90, 0.90, 1.0), emission_strength=10.0)
    # 11. Pirelli Cinturato Vintage Directional Tire Rubber
    mats['rubber_tire']         = new_pbr("Rubber_Pirelli_Cinturato", (0.032, 0.032, 0.032, 1.0), metallic=0.0, roughness=0.78)
    # 12. Cast Iron Brake Rotor
    mats['rotor_iron']          = new_pbr("Brake_Rotor_CastIron", (0.35, 0.35, 0.36, 1.0), metallic=0.82, roughness=0.38)
    # 13. Brake Caliper Gold/Zinc Chromate
    mats['caliper_zinc']        = new_pbr("Brake_Caliper_Zinc", (0.62, 0.58, 0.42, 1.0), metallic=0.75, roughness=0.35)
    # 14. Alfa Romeo 2.0L Cast Aluminum Bialbero Cam Cover (Ribbed Alloy)
    mats['engine_cast_alloy']   = new_pbr("Engine_Cast_Aluminum", (0.75, 0.76, 0.78, 1.0), metallic=0.88, roughness=0.32)
    # 15. Weber 40 DCOE Twin Carburetors (Zinc Billet Silver)
    mats['carb_zinc']           = new_pbr("Weber_Carb_Zinc", (0.68, 0.69, 0.70, 1.0), metallic=0.82, roughness=0.28)
    # 16. Exhaust Headers & Tailpipe (Polished Stainless Steel)
    mats['exhaust_stainless']   = new_pbr("Exhaust_Stainless_Polished", (0.85, 0.85, 0.88, 1.0), metallic=0.96, roughness=0.14)
    # 17. Exhaust Soot Inner Bore
    mats['exhaust_soot']        = new_pbr("Exhaust_Soot_Black", (0.015, 0.015, 0.015, 1.0), metallic=0.0, roughness=0.95)
    # 18. Interior Nero Ribbed Vinyl Leather
    mats['interior_vinyl_black']= new_pbr("Interior_Nero_Vinyl", (0.028, 0.028, 0.030, 1.0), metallic=0.02, roughness=0.68)
    # 19. Hellebore 3-Spoke Polished Woodgrain Steering Wheel
    mats['wood_mahogany']       = new_pbr("Wood_Mahogany_Polished", (0.28, 0.11, 0.05, 1.0), metallic=0.0, roughness=0.18, clearcoat=0.95)
    # 20. Jaeger / Veglia White-on-Black Instrument Dials
    mats['gauge_veglia']        = new_pbr("Gauge_Veglia_Cluster", (0.02, 0.02, 0.02, 1.0), metallic=0.05, roughness=0.15, emission=(0.45, 0.45, 0.42, 1.0), emission_strength=1.8)
    # 21. Alfa Romeo Historic Enamel Crest (Cross & Biscione Serpent)
    mats['alfa_crest_enamel']   = new_pbr("Alfa_Crest_Enamel", (0.10, 0.35, 0.65, 1.0), metallic=0.30, roughness=0.20, clearcoat=0.9)
    # 22. Chassis Floorpan Steel Primer (Dark Grey Zinc)
    mats['chassis_primer']      = new_pbr("Chassis_Floorpan_Primer", (0.045, 0.045, 0.050, 1.0), metallic=0.35, roughness=0.65)
    # 23. Headlamp Optical Glass Cover
    mats['glass_headlamp']      = new_pbr("Glass_Headlamp_Fluted", (0.95, 0.97, 0.98, 1.0), metallic=0.0, roughness=0.04, clearcoat=1.0, transmission=0.95, alpha=0.35)

    return mats


# ─── 3. Class-A Unibody Shell with Authentic Wheel Arch Cutouts ───────────────
def build_unibody(parent_col, mats):
    """
    Constructs the Pininfarina unibody shell:
    - Front nose with Scudetto cavity and recessed headlamp buckets.
    - True front wheel arch cutouts over front tires (Y = +0.36m to -0.36m).
    - Curved front inner wheel tubs enclosing the front suspension.
    - Bodyside rocker sills framing the door opening (Y = -0.36m to -1.52m).
    - Rear quarter panels with rear wheel arch cutouts (Y = -1.90m to -2.60m).
    - Curved rear inner wheel tubs enclosing the rear axle.
    - Pininfarina bodyside scallops running continuously along the waist.
    - Signature flat vertical "Coda Tronca" Kamm tail cutoff at Y = -3.360m.
    """
    bm = bmesh.new()

    # Material Indices:
    # 0: paint_rosso_alfa
    # 1: rubber_satin_black
    # 2: chrome_vintage

    # Helper function to compute wheel arch lip height
    def arch_z(y_pos, axle_y, r_arch=0.345, z_base=0.18, z_peak=0.635):
        dy = abs(y_pos - axle_y)
        if dy >= r_arch:
            return z_base
        # Elliptical arch profile
        factor = math.sqrt(1.0 - (dy / r_arch) ** 2)
        return z_base + (z_peak - z_base) * factor

    # Stations along the vehicle length: Y from +0.760m to -3.360m
    stations = [
        # Y,      hw_lip, hw_waist, hw_fender, hw_deck, z_lip, z_waist, z_deck, is_cabin
        # 1. Front Nose & Cowl (Y = +0.760 to +0.380)
        ( 0.760,  0.340,  0.480,    0.620,     0.280,   0.140, 0.280,   0.490, False), # Nose apex
        ( 0.600,  0.370,  0.540,    0.690,     0.320,   0.142, 0.320,   0.570, False), # Headlamp bucket
        ( 0.450,  0.390,  0.580,    0.730,     0.360,   0.150, 0.345,   0.635, False), # Arch onset
        # 2. Front Wheel Arch (Y = +0.360 to -0.360, axle at Y = 0.000)
        ( 0.300,  0.410,  0.610,    0.765,     0.390,   0.380, 0.440,   0.665, False), # Arch front
        ( 0.150,  0.425,  0.630,    0.795,     0.410,   0.580, 0.610,   0.690, False), # Arch rising
        ( 0.000,  0.430,  0.640,    0.805,     0.420,   0.635, 0.655,   0.705, False), # Axle apex
        (-0.150,  0.425,  0.635,    0.798,     0.425,   0.580, 0.610,   0.710, False), # Arch descending
        (-0.300,  0.415,  0.625,    0.775,     0.430,   0.380, 0.440,   0.715, False), # Arch rear
        (-0.360,  0.440,  0.655,    0.815,     0.435,   0.170, 0.390,   0.720, False), # Cowl / A-pillar
        # 3. Open Cockpit Aperture & Rocker Sills (Y = -0.360 to -1.520)
        (-0.650,  0.440,  0.780,    0.795,     0.430,   0.170, 0.240,   0.718, True),
        (-0.950,  0.440,  0.775,    0.790,     0.430,   0.170, 0.240,   0.716, True),
        (-1.250,  0.440,  0.775,    0.790,     0.430,   0.170, 0.240,   0.716, True),
        (-1.520,  0.440,  0.780,    0.815,     0.435,   0.170, 0.395,   0.718, False), # Rear bulkhead onset
        # 4. Rear Quarters & Wheel Arch (Y = -1.520 to -2.600, axle at Y = -2.250)
        (-1.750,  0.435,  0.650,    0.812,     0.430,   0.175, 0.400,   0.716, False), # Arch onset
        (-1.950,  0.430,  0.645,    0.780,     0.420,   0.390, 0.450,   0.715, False), # Arch front
        (-2.100,  0.425,  0.640,    0.795,     0.415,   0.580, 0.610,   0.714, False), # Arch rising
        (-2.250,  0.420,  0.635,    0.805,     0.410,   0.635, 0.655,   0.712, False), # Rear axle apex
        (-2.400,  0.415,  0.630,    0.790,     0.400,   0.580, 0.610,   0.708, False), # Arch descending
        (-2.550,  0.410,  0.620,    0.770,     0.390,   0.390, 0.450,   0.704, False), # Arch rear
        (-2.650,  0.410,  0.620,    0.760,     0.380,   0.180, 0.405,   0.700, False), # Quarter exit
        # 5. Rear Overhang & Truncated Coda Tronca (Y = -2.650 to -3.360)
        (-2.850,  0.390,  0.580,    0.720,     0.350,   0.190, 0.412,   0.685, False),
        (-3.100,  0.360,  0.530,    0.670,     0.310,   0.205, 0.420,   0.665, False),
        (-3.360,  0.330,  0.480,    0.610,     0.270,   0.220, 0.425,   0.640, False), # Kamm cutoff
    ]

    prev_ring = None
    for y_pos, hw_l, hw_w, hw_f, hw_d, zl, zw, zd, is_cab in stations:
        if is_cab:
            # Open cockpit cabin: only lower rocker sills & floor keel
            cur_ring = [
                bm.verts.new(Vector(( 0.00, y_pos, zl - 0.02))),     # 0: Center keel
                bm.verts.new(Vector((-hw_l, y_pos, zl))),            # 1: Left lower floor
                bm.verts.new(Vector((-hw_w, y_pos, zw))),            # 2: Left rocker sill
                bm.verts.new(Vector((-hw_w, y_pos, zw + 0.05))),     # 3: Left sill lip
                bm.verts.new(Vector(( hw_w, y_pos, zw + 0.05))),     # 4: Right sill lip
                bm.verts.new(Vector(( hw_w, y_pos, zw))),            # 5: Right rocker sill
                bm.verts.new(Vector(( hw_l, y_pos, zl))),            # 6: Right lower floor
            ]
            if prev_ring is not None:
                if len(prev_ring) == 7:
                    for k in range(6):
                        safe_face(bm, [prev_ring[k], prev_ring[k+1], cur_ring[k+1], cur_ring[k]], mat_idx=0)
            prev_ring = cur_ring
        else:
            # Full body cross-section
            zf = zw + (zd - zw) * 0.45
            cur_ring = [
                bm.verts.new(Vector(( 0.00, y_pos, zl - 0.02))),     # 0: Center keel
                bm.verts.new(Vector((-hw_l, y_pos, zl))),            # 1: Left lower valence / arch lip
                bm.verts.new(Vector((-hw_w, y_pos, zw))),            # 2: Left scallop waist
                bm.verts.new(Vector((-hw_f, y_pos, zf))),            # 3: Left fender crest
                bm.verts.new(Vector((-hw_d, y_pos, zd))),            # 4: Left deck shutline
                bm.verts.new(Vector(( 0.00, y_pos, zd + 0.02))),     # 5: Center hood/trunk crown
                bm.verts.new(Vector(( hw_d, y_pos, zd))),            # 6: Right deck shutline
                bm.verts.new(Vector(( hw_f, y_pos, zf))),            # 7: Right fender crest
                bm.verts.new(Vector(( hw_w, y_pos, zw))),            # 8: Right scallop waist
                bm.verts.new(Vector(( hw_l, y_pos, zl))),            # 9: Right lower valence / arch lip
            ]
            if prev_ring is not None:
                if len(prev_ring) == 10:
                    for k in range(9):
                        safe_face(bm, [prev_ring[k], prev_ring[k+1], cur_ring[k+1], cur_ring[k]], mat_idx=0)
                    safe_face(bm, [prev_ring[9], prev_ring[0], cur_ring[0], cur_ring[9]], mat_idx=0)
                elif len(prev_ring) == 7:
                    # Transition from cabin sill to rear bulkhead
                    safe_face(bm, [prev_ring[0], prev_ring[1], cur_ring[1], cur_ring[0]], mat_idx=0)
                    safe_face(bm, [prev_ring[1], prev_ring[2], cur_ring[2], cur_ring[1]], mat_idx=0)
                    safe_face(bm, [prev_ring[5], prev_ring[6], cur_ring[9], cur_ring[8]], mat_idx=0)
                    safe_face(bm, [prev_ring[6], prev_ring[0], cur_ring[0], cur_ring[9]], mat_idx=0)
                    # Rear cockpit bulkhead wall
                    safe_face(bm, [cur_ring[2], cur_ring[3], cur_ring[4], cur_ring[5],
                                   cur_ring[6], cur_ring[7], cur_ring[8]], mat_idx=0)
            prev_ring = cur_ring

    # Front Nose Cap
    front_cap_verts = [bm.verts.new(Vector((co[0], 0.760, co[1]))) for co in [
        ( 0.00, 0.12), (-0.34, 0.14), (-0.48, 0.28), (-0.62, 0.38),
        (-0.28, 0.49), ( 0.00, 0.51), ( 0.28, 0.49), ( 0.62, 0.38),
        ( 0.48, 0.28), ( 0.34, 0.14)
    ]]
    safe_face(bm, front_cap_verts, mat_idx=0)

    # Truncated Coda Tronca Vertical Kamm Tail Rear Cap
    if prev_ring and len(prev_ring) == 10:
        safe_face(bm, [prev_ring[0], prev_ring[1], prev_ring[2], prev_ring[3], prev_ring[4],
                       prev_ring[5], prev_ring[6], prev_ring[7], prev_ring[8], prev_ring[9]], mat_idx=0)

    # ── Enclosed Curved Inner Wheel Tubs (Inboard side of wheel, satin black) ──
    for sign in [-1.0, 1.0]:
        # Front Wheel Tubs (Inside fender liner at X = +/-0.48m, Axle Y = 0.00m, Z = 0.285m)
        tub_f_pos = Vector((sign * 0.480, 0.000, 0.285))
        add_cylinder(bm, radius1=0.320, radius2=0.320, depth=0.100, segments=28,
                     matrix=Matrix.Translation(tub_f_pos) @ Matrix.Rotation(math.radians(90), 3, 'Y').to_4x4(),
                     cap_ends=True, mat_idx=1)

        # Rear Wheel Tubs (Inside rear quarter liner at X = +/-0.48m, Axle Y = -2.250m, Z = 0.285m)
        tub_r_pos = Vector((sign * 0.480, -2.250, 0.285))
        add_cylinder(bm, radius1=0.320, radius2=0.320, depth=0.100, segments=28,
                     matrix=Matrix.Translation(tub_r_pos) @ Matrix.Rotation(math.radians(90), 3, 'Y').to_4x4(),
                     cap_ends=True, mat_idx=1)

    # ── Pininfarina Bodyside Scallop Feature Lines ──
    for sign in [-1.0, 1.0]:
        sc_x = sign * 0.795
        # Front Scallop (Behind front wheel arch to door)
        add_box(bm, size=(0.022, 0.22, 0.035), matrix=Matrix.Translation((sc_x, -0.25, 0.52)), mat_idx=0)
        # Rear Scallop (Behind door to rear wheel arch)
        add_box(bm, size=(0.022, 0.35, 0.035), matrix=Matrix.Translation((sc_x, -1.68, 0.52)), mat_idx=0)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)

    obj = finish_mesh_obj("BODY_Unibody_Monocoque", bm, mats,
                          ['paint_rosso_alfa', 'rubber_satin_black', 'chrome_vintage'],
                          parent_col, smooth=True, bevel_w=0.0025, subsurf_lvl=2)
    obj["subsystem"] = "BODY"
    return obj


# ─── 4. Flush Articulating Doors with Lower A-Pillar Physical Hinges ─────────
def build_doors(parent_col, mats):
    """
    Constructs articulating left and right doors:
    - DOOR_FL and DOOR_FR spanning Y = -0.360m to -1.520m.
    - Outer sculpted door skin fitting seamlessly with 3.5mm shutlines.
    - Continuous Pininfarina scallop depression through the door center.
    - Flush chrome lift handle and door key lock escutcheon.
    - Padded vinyl inner door card with armrest, chrome release latch & window crank.
    - Hinge origin at lower A-pillar:
      Left:  (-0.805m, -0.360m, 0.350m)
      Right: ( 0.805m, -0.360m, 0.350m)
    - Closed resting pose at (0, 0, 0)!
    """
    door_objs = []
    door_defs = [
        ("DOOR_FL", -1.0, Vector((-0.805, -0.360, 0.350))),
        ("DOOR_FR",  1.0, Vector(( 0.805, -0.360, 0.350))),
    ]

    for dname, sign, hinge_pos in door_defs:
        bm_d = bmesh.new()

        dx = sign * 0.790
        d_len = 1.150
        d_y_center = -0.940

        # Outer Door Skin Box (mat_idx 0)
        add_box(bm_d, size=(0.045, d_len, 0.480),
                matrix=Matrix.Translation((dx, d_y_center, 0.465)), mat_idx=0)

        # Scallop Recess Accent along middle of door
        add_box(bm_d, size=(0.020, d_len * 0.96, 0.075),
                matrix=Matrix.Translation((dx - sign * 0.012, d_y_center, 0.510)), mat_idx=0)

        # Flush Chrome Pull Handle (Y = -1.28m, Z = 0.65m)
        add_box(bm_d, size=(0.016, 0.14, 0.028),
                matrix=Matrix.Translation((dx + sign * 0.028, -1.28, 0.65)), mat_idx=2)
        # Chrome Key Lock Escutcheon
        add_cylinder(bm_d, radius1=0.010, radius2=0.010, depth=0.014, segments=16,
                     matrix=Matrix.Translation((dx + sign * 0.028, -1.38, 0.64)) @ Matrix.Rotation(math.radians(90), 3, 'Y').to_4x4(),
                     cap_ends=True, mat_idx=2)

        # Inner Vinyl Door Card (mat_idx 1)
        add_box(bm_d, size=(0.040, d_len * 0.96, 0.400),
                matrix=Matrix.Translation((dx - sign * 0.035, d_y_center, 0.480)), mat_idx=1)

        # Padded Armrest
        add_box(bm_d, size=(0.055, 0.40, 0.070),
                matrix=Matrix.Translation((dx - sign * 0.055, d_y_center, 0.420)), mat_idx=1)

        # Chrome Interior Door Release Latch
        add_box(bm_d, size=(0.018, 0.065, 0.022),
                matrix=Matrix.Translation((dx - sign * 0.055, d_y_center + 0.32, 0.540)), mat_idx=2)

        # Chrome Window Regulator Crank Handle
        crank_pos = Vector((dx - sign * 0.052, d_y_center - 0.22, 0.460))
        add_cylinder(bm_d, radius1=0.018, radius2=0.018, depth=0.015, segments=16,
                     matrix=Matrix.Translation(crank_pos) @ Matrix.Rotation(math.radians(90), 3, 'Y').to_4x4(),
                     cap_ends=True, mat_idx=2)
        add_box(bm_d, size=(0.012, 0.075, 0.018),
                matrix=Matrix.Translation(crank_pos + Vector((0, 0.035, 0))), mat_idx=2)

        # Weatherstripping Perimeter Seal (mat_idx 3)
        add_box(bm_d, size=(0.065, d_len * 0.98, 0.018),
                matrix=Matrix.Translation((dx, d_y_center, 0.270)), mat_idx=3)

        bmesh.ops.remove_doubles(bm_d, verts=bm_d.verts, dist=0.001)

        d_obj = finish_mesh_obj(dname, bm_d, mats,
                                ['paint_rosso_alfa', 'interior_vinyl_black', 'chrome_vintage', 'rubber_satin_black'],
                                parent_col, smooth=True, bevel_w=0.002, subsurf_lvl=2)
        d_obj["subsystem"] = "BODY"

        # Set Object Origin explicitly to the lower A-pillar physical hinge vector
        d_obj.location = hinge_pos
        for v in d_obj.data.vertices:
            v.co -= hinge_pos

        door_objs.append(d_obj)

    return door_objs[0], door_objs[1]


# ─── 5. Chrome Windshield Surround & Folded Soft-Top Tonneau ──────────────────
def build_windshield_and_tonneau(parent_col, mats):
    """
    Constructs:
    1. GLASS_Windshield_Chrome: Curved safety glass with chrome frame & triangular ventipanes.
    2. AERO_Folded_SoftTop_Tonneau: Textured black vinyl canvas soft top neatly folded behind cockpit.
    """
    bm_ws = bmesh.new()

    # Curved Windshield Glass (mat_idx 0)
    ws_stations = [
        (-0.360, 0.720, 0.630),
        (-0.480, 0.880, 0.600),
        (-0.580, 1.020, 0.570),
        (-0.680, 1.150, 0.540),
    ]

    ws_rows = []
    for y_pos, z_pos, hw in ws_stations:
        row = []
        n_pts = 9
        for p in range(n_pts):
            u = p / (n_pts - 1)
            x_pos = -hw + 2.0 * hw * u
            curve_bow = 0.028 * math.cos(u * math.pi - math.pi * 0.5)
            row.append(bm_ws.verts.new(Vector((x_pos, y_pos + curve_bow, z_pos))))
        ws_rows.append(row)

    for r in range(len(ws_rows) - 1):
        for c in range(8):
            safe_face(bm_ws, [ws_rows[r][c], ws_rows[r][c+1], ws_rows[r+1][c+1], ws_rows[r+1][c]], mat_idx=0)

    # Polished Chrome Windshield A-Pillars & Header Rail (mat_idx 1)
    add_rod(bm_ws, (-0.630, -0.360, 0.720), (-0.540, -0.680, 1.150), radius=0.016, segments=14, mat_idx=1)
    add_rod(bm_ws, ( 0.630, -0.360, 0.720), ( 0.540, -0.680, 1.150), radius=0.016, segments=14, mat_idx=1)
    add_rod(bm_ws, (-0.540, -0.680, 1.150), ( 0.540, -0.680, 1.150), radius=0.018, segments=14, mat_idx=1)
    add_rod(bm_ws, (-0.630, -0.360, 0.720), ( 0.630, -0.360, 0.720), radius=0.016, segments=14, mat_idx=1)

    # Triangular Quarter Vent Windows (Ventipanes) Division Bars (mat_idx 1)
    for sign in [-1.0, 1.0]:
        add_rod(bm_ws, (sign * 0.630, -0.360, 0.720), (sign * 0.600, -0.520, 0.940), radius=0.012, segments=12, mat_idx=1)
        if sign == -1.0:
            # Round Chrome Driver's Windshield Post Mirror
            add_cylinder(bm_ws, radius1=0.048, radius2=0.048, depth=0.014, segments=24,
                         matrix=Matrix.Translation((-0.670, -0.420, 0.780)) @ Matrix.Rotation(math.radians(-75), 3, 'Z').to_4x4(),
                         cap_ends=True, mat_idx=1)

    bmesh.ops.remove_doubles(bm_ws, verts=bm_ws.verts, dist=0.001)

    ws_obj = finish_mesh_obj("GLASS_Windshield_Chrome", bm_ws, mats,
                             ['glass_windshield', 'chrome_vintage', 'rubber_satin_black'],
                             parent_col, smooth=True, bevel_w=0.0015, subsurf_lvl=2)
    ws_obj["subsystem"] = "GLASS"

    # ── Folded Canvas Soft-Top Tonneau Cover ──
    bm_t = bmesh.new()

    add_box(bm_t, size=(1.24, 0.32, 0.12), matrix=Matrix.Translation((0.0, -1.62, 0.74)), mat_idx=0)
    for fy in [-1.52, -1.62, -1.72]:
        add_cylinder(bm_t, radius1=0.035, radius2=0.035, depth=1.20, segments=24,
                     matrix=Matrix.Translation((0.0, fy, 0.79)) @ Matrix.Rotation(math.radians(90), 3, 'Y').to_4x4(),
                     cap_ends=True, mat_idx=0)
    # Chrome Snaps
    for sign in [-1.0, 1.0]:
        for sx in [0.18, 0.38, 0.56]:
            add_cylinder(bm_t, radius1=0.008, radius2=0.008, depth=0.008, segments=12,
                         matrix=Matrix.Translation((sign * sx, -1.78, 0.745)), cap_ends=True, mat_idx=1)

    bmesh.ops.remove_doubles(bm_t, verts=bm_t.verts, dist=0.001)

    tonneau_obj = finish_mesh_obj("AERO_Folded_SoftTop_Tonneau", bm_t, mats,
                                  ['canvas_tonneau_black', 'chrome_vintage'],
                                  parent_col, smooth=True, bevel_w=0.002, subsurf_lvl=2)
    tonneau_obj["subsystem"] = "AERO"
    return ws_obj, tonneau_obj


# ─── 6. Recessed Halogen Headlamps, Chrome Scudetto & Bumpers ─────────────────
def build_lighting_and_chrome(parent_col, mats):
    """
    Constructs iconic frontal and rear automotive jewelry:
    - Chrome Scudetto heart grille with horizontal louvers.
    - Enamel Alfa Romeo crest.
    - Recessed round 7-inch sealed-beam halogen lamps with parabolic chrome bowls & fluted glass lenses.
    - Split front chrome bumpers with black rubber bumperettes.
    - Split rear chrome bumpers flanking license plate.
    - Rectangular tri-color Coda Tronca taillamp clusters (Amber/Ruby/Reverse).
    - Polished stainless steel exhaust tailpipe with black inner bore.
    """
    bm = bmesh.new()

    # 1. Central Scudetto Heart Grille
    scud_v = [
        bm.verts.new(Vector(( 0.000, 0.768, 0.220))),
        bm.verts.new(Vector((-0.078, 0.762, 0.340))),
        bm.verts.new(Vector((-0.068, 0.756, 0.440))),
        bm.verts.new(Vector(( 0.000, 0.754, 0.455))),
        bm.verts.new(Vector(( 0.068, 0.756, 0.440))),
        bm.verts.new(Vector(( 0.078, 0.762, 0.340))),
    ]
    safe_face(bm, scud_v, mat_idx=0)
    for bz in [0.26, 0.30, 0.34, 0.38, 0.42]:
        add_box(bm, size=(0.115, 0.015, 0.010), matrix=Matrix.Translation((0.0, 0.762, bz)), mat_idx=0)

    # Enamel Alfa Badge
    add_cylinder(bm, radius1=0.024, radius2=0.024, depth=0.010, segments=24,
                 matrix=Matrix.Translation((0.0, 0.730, 0.490)) @ Matrix.Rotation(math.radians(-25), 3, 'X').to_4x4(),
                 cap_ends=True, mat_idx=6)

    # 2. Round 7-inch Sealed-Beam Halogen Headlamps (Recessed in fender nacelles)
    for sign in [-1.0, 1.0]:
        hl_pos = Vector((sign * 0.535, 0.560, 0.540))
        m_hl = Matrix.Translation(hl_pos) @ Matrix.Rotation(math.radians(-12), 3, 'X').to_4x4()

        # Recessed Chrome Bezel Ring (mat_idx 0)
        add_annulus(bm, r_outer=0.096, r_inner=0.086, depth=0.024, segments=32, matrix=m_hl, mat_idx=0)
        # Parabolic Halogen Reflector Bowl (mat_idx 1)
        add_cylinder(bm, radius1=0.085, radius2=0.040, depth=0.035, segments=32, matrix=m_hl, cap_ends=True, mat_idx=1)
        # Fluted Glass Lens Cover (mat_idx 7)
        add_cylinder(bm, radius1=0.086, radius2=0.086, depth=0.008, segments=32,
                     matrix=m_hl @ Matrix.Translation((0, 0, 0.012)), cap_ends=True, mat_idx=7)

        # Amber Turn Signal Lens below Bumper (mat_idx 2)
        add_box(bm, size=(0.11, 0.025, 0.040), matrix=Matrix.Translation((sign * 0.480, 0.720, 0.350)), mat_idx=2)

    # 3. Split Front Chrome Bumpers with Rubber Bumperettes
    for sign in [-1.0, 1.0]:
        bx_center = sign * 0.450
        add_box(bm, size=(0.58, 0.065, 0.055), matrix=Matrix.Translation((bx_center, 0.770, 0.380)), mat_idx=0)
        add_box(bm, size=(0.065, 0.085, 0.110), matrix=Matrix.Translation((sign * 0.220, 0.790, 0.380)), mat_idx=5)

    # 4. Split Rear Chrome Bumpers & Coda Tronca Taillamps
    for sign in [-1.0, 1.0]:
        rbx_center = sign * 0.380
        add_box(bm, size=(0.52, 0.065, 0.055), matrix=Matrix.Translation((rbx_center, -3.380, 0.420)), mat_idx=0)
        add_box(bm, size=(0.065, 0.085, 0.110), matrix=Matrix.Translation((sign * 0.180, -3.400, 0.420)), mat_idx=5)

        # Rectangular Tri-Color Coda Tronca Taillamp Cluster
        tl_x = sign * 0.440
        add_box(bm, size=(0.28, 0.025, 0.095), matrix=Matrix.Translation((tl_x, -3.365, 0.550)), mat_idx=0)
        add_box(bm, size=(0.085, 0.015, 0.080), matrix=Matrix.Translation((tl_x + sign * 0.085, -3.375, 0.550)), mat_idx=2)
        add_box(bm, size=(0.095, 0.015, 0.080), matrix=Matrix.Translation((tl_x, -3.375, 0.550)), mat_idx=3)
        add_box(bm, size=(0.075, 0.015, 0.080), matrix=Matrix.Translation((tl_x - sign * 0.085, -3.375, 0.550)), mat_idx=4)

    # 5. Polished Chrome "Spider Veloce" Script Badge
    add_box(bm, size=(0.18, 0.012, 0.024), matrix=Matrix.Translation((0.24, -3.340, 0.610)), mat_idx=0)

    # 6. Polished Stainless Steel Exhaust Tip with Soot Bore
    add_cylinder(bm, radius1=0.034, radius2=0.034, depth=0.18, segments=24,
                 matrix=Matrix.Translation((0.28, -3.42, 0.28)) @ Matrix.Rotation(math.radians(90), 3, 'X').to_4x4(),
                 cap_ends=False, mat_idx=0)
    add_cylinder(bm, radius1=0.028, radius2=0.028, depth=0.02, segments=24,
                 matrix=Matrix.Translation((0.28, -3.51, 0.28)) @ Matrix.Rotation(math.radians(90), 3, 'X').to_4x4(),
                 cap_ends=True, mat_idx=5)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)

    obj = finish_mesh_obj("LIGHTING_Scudetto_Bumpers_Optics", bm, mats,
                          ['chrome_vintage', 'led_headlamp_warm', 'lens_amber', 'lens_ruby_tail',
                           'lens_reverse_white', 'rubber_satin_black', 'alfa_crest_enamel', 'glass_headlamp'],
                          parent_col, smooth=True, bevel_w=0.0015, subsurf_lvl=2)
    obj["subsystem"] = "LIGHTING"
    return obj


# ─── 7. Open Campagnolo Turbina Magnesium Wheels & Dunlop Radials ─────────────
def build_wheels_and_brakes(parent_col, mats):
    """
    Constructs authentic 14-inch Campagnolo Turbina magnesium wheels:
    - Hollow donut tire with open center exposing the magnesium wheel!
    - Outer alloy rim barrel (R = 0.205m) with stepped diamond-cut lip.
    - 24 radiating Turbina cooling vanes.
    - Chrome center hubcap with colored Alfa Romeo enamel crest.
    - 4 chrome acorn lug nuts.
    - 272mm cast iron ventilated disc brake rotors and zinc-plated calipers.
    """
    wheel_defs = [
        ("WHEEL_FL", Vector((-0.662,  0.000, 0.285)), 0.285, 0.210, -1.0),
        ("WHEEL_FR", Vector(( 0.662,  0.000, 0.285)), 0.285, 0.210,  1.0),
        ("WHEEL_RL", Vector((-0.637, -2.250, 0.285)), 0.285, 0.220, -1.0),
        ("WHEEL_RR", Vector(( 0.637, -2.250, 0.285)), 0.285, 0.220,  1.0),
    ]

    wheel_objs = []
    for wname, pos, r_outer, width, sign in wheel_defs:
        bm_w = bmesh.new()

        m_rot = Matrix.Rotation(math.radians(90.0), 3, 'Y').to_4x4()
        m_w = Matrix.Translation(pos) @ m_rot

        r_rim = r_outer * 0.72 # Rim bead radius = 0.205m
        r_tire = r_outer * 1.08 # Tire tread radius = 0.308m

        # ── 1. Hollow Donut Radial Tire (Center is 100% OPEN!) ──
        # Outer tread cylinder
        add_cylinder(bm_w, radius1=r_tire, radius2=r_tire, depth=width * 0.95, segments=64, matrix=m_w, cap_ends=False, mat_idx=3)
        # Front Annular Sidewall (from r_tire down to r_rim, leaving center bore open!)
        add_annulus(bm_w, r_outer=r_tire, r_inner=r_rim, depth=width * 0.08, segments=64,
                    matrix=m_w @ Matrix.Translation((0, 0, sign * width * 0.44)), mat_idx=3)
        # Rear Annular Sidewall
        add_annulus(bm_w, r_outer=r_tire, r_inner=r_rim, depth=width * 0.08, segments=64,
                    matrix=m_w @ Matrix.Translation((0, 0, -sign * width * 0.44)), mat_idx=3)

        # 48 Directional Tread Sipes
        n_sipes = 48
        for s in range(n_sipes):
            s_th = 2.0 * math.pi * s / n_sipes
            sx = (r_tire - 0.003) * math.cos(s_th)
            sy = (r_tire - 0.003) * math.sin(s_th)
            m_sipe = m_w @ Matrix.Translation((sx, sy, 0.0)) @ Matrix.Rotation(s_th, 3, 'Z').to_4x4()
            add_box(bm_w, size=(0.008, 0.016, width * 0.75), matrix=m_sipe, mat_idx=3)

        # ── 2. Campagnolo Turbina Magnesium Alloy Rim ──
        # Rim Barrel
        add_cylinder(bm_w, radius1=r_rim, radius2=r_rim, depth=width * 0.90, segments=64, matrix=m_w, cap_ends=False, mat_idx=0)
        # Stepped Outer Lip
        add_cylinder(bm_w, radius1=r_rim * 0.94, radius2=r_rim * 0.94, depth=width * 0.78, segments=64, matrix=m_w, cap_ends=False, mat_idx=0)

        # 24 Turbina Radiating Cooling Vanes (mat_idx 0)
        n_vanes = 24
        for i in range(n_vanes):
            theta = 2.0 * math.pi * i / n_vanes
            m_vane = m_w @ Matrix.Rotation(theta, 3, 'Z').to_4x4() @ Matrix.Translation((0.0, r_rim * 0.58, sign * width * 0.36))
            add_box(bm_w, size=(0.014, r_rim * 0.38, 0.026), matrix=m_vane, mat_idx=0)

        # Chrome Center Cap with Alfa Romeo Crest (mat_idx 1 & 2)
        add_cylinder(bm_w, radius1=0.052, radius2=0.052, depth=0.035, segments=32,
                     matrix=m_w @ Matrix.Translation((0.0, 0.0, sign * width * 0.40)), cap_ends=True, mat_idx=1)
        add_cylinder(bm_w, radius1=0.034, radius2=0.034, depth=0.038, segments=24,
                     matrix=m_w @ Matrix.Translation((0.0, 0.0, sign * width * 0.41)), cap_ends=True, mat_idx=2)

        # 4 Chrome Acorn Lug Nuts (mat_idx 1)
        for b_idx in range(4):
            b_th = 2.0 * math.pi * b_idx / 4.0
            bx = 0.038 * math.cos(b_th)
            by = 0.038 * math.sin(b_th)
            add_cylinder(bm_w, radius1=0.008, radius2=0.008, depth=0.024, segments=16,
                         matrix=m_w @ Matrix.Translation((bx, by, sign * width * 0.41)), cap_ends=True, mat_idx=1)

        bmesh.ops.remove_doubles(bm_w, verts=bm_w.verts, dist=0.001)

        w_obj = finish_mesh_obj(wname, bm_w, mats,
                                ['alloy_campagnolo', 'chrome_vintage', 'alfa_crest_enamel', 'rubber_tire'],
                                parent_col, smooth=True, bevel_w=0.002, subsurf_lvl=2)
        w_obj["subsystem"] = "WHEELS"
        w_obj.location = pos
        for v in w_obj.data.vertices:
            v.co -= pos
        wheel_objs.append(w_obj)

        # ── 3. Disc Brake Assembly (Cast Iron Rotor + Zinc Caliper + Cooling Vents) ──
        bm_b = bmesh.new()
        b_pos = pos + Vector((sign * 0.045, 0.0, 0.0))
        m_b = Matrix.Translation(b_pos) @ m_rot

        r_disc = r_outer * 0.52
        add_cylinder(bm_b, radius1=r_disc, radius2=r_disc, depth=0.024, segments=48, matrix=m_b, cap_ends=True, mat_idx=0)
        add_cylinder(bm_b, radius1=r_disc * 0.45, radius2=r_disc * 0.45, depth=0.030, segments=36, matrix=m_b, cap_ends=True, mat_idx=0)

        # 16 Internal Rotor Ventilation Cooling Channels
        for v_i in range(16):
            v_th = 2.0 * math.pi * v_i / 16.0
            vx = (r_disc * 0.72) * math.cos(v_th)
            vy = (r_disc * 0.72) * math.sin(v_th)
            add_cylinder(bm_b, radius1=0.007, radius2=0.007, depth=0.026, segments=12,
                         matrix=m_b @ Matrix.Translation((vx, vy, 0.0)), cap_ends=True, mat_idx=0)

        # Zinc-Plated Dunlop/ATE Brake Caliper
        cal_z = 0.12 if pos.y > -1.0 else 0.11
        cal_y = 0.06 if pos.y > -1.0 else -0.06
        cal_box = Matrix.Translation(b_pos + Vector((sign * 0.012, cal_y, cal_z)))
        add_box(bm_b, size=(0.055, 0.16, 0.082), matrix=cal_box, mat_idx=1)

        bmesh.ops.remove_doubles(bm_b, verts=bm_b.verts, dist=0.001)

        b_name = wname.replace("WHEEL_", "BRAKE_")
        b_obj = finish_mesh_obj(b_name, bm_b, mats,
                                ['rotor_iron', 'caliper_zinc'],
                                parent_col, smooth=True, bevel_w=0.002, subsurf_lvl=2)
        b_obj["subsystem"] = "CHASSIS"

    return wheel_objs


# ─── 8. Longitudinal 2.0L Alfa Romeo Twin Cam (Bialbero) Engine ──────────────
def build_powertrain_twin_cam(parent_col, mats):
    """
    Constructs the longitudinal 2.0L (1962cc) Alfa Romeo Twin Cam (Bialbero) engine:
    - Ribbed cast aluminum twin-cam valve cover with embossed Alfa Romeo lettering.
    - Cast iron engine block in satin black.
    - Twin side-draft Weber 40 DCOE carburetors with chrome velocity trumpets.
    - Tubular equal-length exhaust headers leading to single stainless exhaust.
    - Front brass radiator cooling pack.
    """
    bm = bmesh.new()

    eng_center = Vector((0.0, 0.18, 0.38))

    # Engine Block & Sump (mat_idx 4)
    add_box(bm, size=(0.32, 0.52, 0.34), matrix=Matrix.Translation(eng_center), mat_idx=4)

    # Ribbed Cast Aluminum Twin-Cam Valve Cover (mat_idx 0)
    add_box(bm, size=(0.28, 0.50, 0.14), matrix=Matrix.Translation(eng_center + Vector((0, 0, 0.22))), mat_idx=0)
    for ry in [-0.20, -0.10, 0.0, 0.10, 0.20]:
        add_box(bm, size=(0.26, 0.018, 0.15), matrix=Matrix.Translation(eng_center + Vector((0, ry, 0.23))), mat_idx=0)

    # Twin Side-Draft Weber 40 DCOE Carburetors (Right side, mat_idx 1)
    for cy in [0.08, 0.28]:
        carb_pos = eng_center + Vector((0.24, cy - 0.18, 0.12))
        add_box(bm, size=(0.14, 0.12, 0.10), matrix=Matrix.Translation(carb_pos), mat_idx=1)
        for horn_y in [-0.035, 0.035]:
            h_pos = carb_pos + Vector((0.10, horn_y, 0.0))
            add_cylinder(bm, radius1=0.026, radius2=0.018, depth=0.065, segments=16,
                         matrix=Matrix.Translation(h_pos) @ Matrix.Rotation(math.radians(90), 3, 'Y').to_4x4(),
                         cap_ends=False, mat_idx=1)

    # Tubular Equal-Length Exhaust Headers (Left side, mat_idx 2)
    for hy in [-0.15, -0.05, 0.05, 0.15]:
        p1 = eng_center + Vector((-0.16, hy, 0.14))
        p2 = eng_center + Vector((-0.26, hy - 0.08, 0.02))
        p3 = eng_center + Vector((-0.24, -0.28, -0.08))
        add_rod(bm, p1, p2, radius=0.018, segments=12, mat_idx=2)
        add_rod(bm, p2, p3, radius=0.018, segments=12, mat_idx=2)

    # Front Brass Radiator Cooling Pack (mat_idx 4)
    add_box(bm, size=(0.48, 0.06, 0.32), matrix=Matrix.Translation((0.0, 0.62, 0.38)), mat_idx=4)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)

    obj = finish_mesh_obj("POWERTRAIN_Alfa_TwinCam_20L", bm, mats,
                          ['engine_cast_alloy', 'carb_zinc', 'exhaust_stainless', 'exhaust_soot', 'rubber_satin_black'],
                          parent_col, smooth=True, bevel_w=0.002, subsurf_lvl=2)
    obj["subsystem"] = "POWERTRAIN"
    return obj


# ─── 9. Driver-Oriented Italian Cockpit, Seats & Hellebore Wood Wheel ─────────
def build_cockpit(parent_col, mats):
    """
    Constructs the driver-oriented Italian roadster cockpit:
    - Twin hooded conical Veglia instrument binnacles (tachometer & speedometer).
    - Canted center console with 3 auxiliary gauges (oil pressure, water temp, fuel).
    - Angled floor-mounted gearshift lever.
    - Ribbed vinyl sports bucket seats (Left Driver & Right Passenger).
    - Hellebore 3-spoke drilled alloy / woodgrain steering wheel on articulating column.
    """
    bm_c = bmesh.new()

    # Dashboard Main Structure
    add_box(bm_c, size=(1.18, 0.38, 0.18), matrix=Matrix.Translation((0.0, -0.52, 0.65)), mat_idx=0)

    # Driver Twin Conical Instrument Hoods (mat_idx 0 & 2)
    for gx in [-0.42, -0.24]:
        add_cylinder(bm_c, radius1=0.075, radius2=0.068, depth=0.09, segments=24,
                     matrix=Matrix.Translation((gx, -0.46, 0.73)) @ Matrix.Rotation(math.radians(-25), 3, 'X').to_4x4(),
                     cap_ends=False, mat_idx=0)
        add_cylinder(bm_c, radius1=0.065, radius2=0.065, depth=0.015, segments=24,
                     matrix=Matrix.Translation((gx, -0.45, 0.73)) @ Matrix.Rotation(math.radians(-25), 3, 'X').to_4x4(),
                     cap_ends=True, mat_idx=2)

    # Center Console with 3 Auxiliary Gauges
    add_box(bm_c, size=(0.24, 0.58, 0.16), matrix=Matrix.Translation((0.0, -0.82, 0.44)), mat_idx=0)
    for gy in [-0.56, -0.66, -0.76]:
        add_cylinder(bm_c, radius1=0.032, radius2=0.032, depth=0.015, segments=20,
                     matrix=Matrix.Translation((0.0, gy, 0.56)) @ Matrix.Rotation(math.radians(-35), 3, 'X').to_4x4(),
                     cap_ends=True, mat_idx=2)

    # Canted Floor-Mounted Gearstick
    add_rod(bm_c, (0.0, -0.86, 0.42), (-0.05, -0.78, 0.62), radius=0.010, segments=12, mat_idx=3)
    add_cylinder(bm_c, radius1=0.024, radius2=0.024, depth=0.045, segments=16,
                 matrix=Matrix.Translation((-0.05, -0.78, 0.63)), cap_ends=True, mat_idx=0)

    # Ribbed Nero Vinyl Sports Bucket Seats (Driver & Passenger)
    for sign in [-1.0, 1.0]:
        sx = sign * 0.320
        sy = -1.050
        # Bottom Cushion
        add_box(bm_c, size=(0.42, 0.46, 0.12), matrix=Matrix.Translation((sx, sy, 0.30)), mat_idx=0)
        for ry in [-0.14, -0.06, 0.02, 0.10, 0.18]:
            add_box(bm_c, size=(0.38, 0.016, 0.13), matrix=Matrix.Translation((sx, sy + ry, 0.30)), mat_idx=0)

        # Backrest with Bolsters
        add_box(bm_c, size=(0.42, 0.14, 0.54),
                matrix=Matrix.Translation((sx, sy - 0.22, 0.56)) @ Matrix.Rotation(math.radians(16), 3, 'X').to_4x4(),
                mat_idx=0)
        # Chrome Seat Recline Hinge
        add_cylinder(bm_c, radius1=0.028, radius2=0.028, depth=0.018, segments=16,
                     matrix=Matrix.Translation((sx + sign * 0.22, sy - 0.18, 0.32)) @ Matrix.Rotation(math.radians(90), 3, 'Y').to_4x4(),
                     cap_ends=True, mat_idx=3)

    bmesh.ops.remove_doubles(bm_c, verts=bm_c.verts, dist=0.001)

    cockpit_obj = finish_mesh_obj("INTERIOR_Cockpit", bm_c, mats,
                                  ['interior_vinyl_black', 'wood_mahogany', 'gauge_veglia', 'chrome_vintage'],
                                  parent_col, smooth=True, bevel_w=0.002, subsurf_lvl=2)
    cockpit_obj["subsystem"] = "INTERIOR"

    # Articulating Hellebore 3-Spoke Drilled Wood Steering Wheel
    bm_sw = bmesh.new()
    sw_hub = Vector((-0.330, -0.480, 0.710))
    m_sw = Matrix.Translation(sw_hub) @ Matrix.Rotation(math.radians(-24), 3, 'X').to_4x4()

    # Polished Mahogany Wood Rim (mat_idx 1)
    add_annulus(bm_sw, r_outer=0.190, r_inner=0.165, depth=0.024, segments=48, matrix=m_sw, mat_idx=1)

    # 3 Drilled Chrome Spokes (mat_idx 3)
    add_box(bm_sw, size=(0.33, 0.014, 0.040), matrix=m_sw, mat_idx=3)
    add_box(bm_sw, size=(0.040, 0.014, 0.16), matrix=m_sw @ Matrix.Translation((0, 0, -0.08)), mat_idx=3)

    # Center Horn Button with Chrome Alfa Shield
    add_cylinder(bm_sw, radius1=0.044, radius2=0.044, depth=0.025, segments=24, matrix=m_sw, cap_ends=True, mat_idx=3)

    bmesh.ops.remove_doubles(bm_sw, verts=bm_sw.verts, dist=0.001)

    sw_obj = finish_mesh_obj("INTERIOR_Steering_Wheel", bm_sw, mats,
                             ['interior_vinyl_black', 'wood_mahogany', 'gauge_veglia', 'chrome_vintage'],
                             parent_col, smooth=True, bevel_w=0.0015, subsurf_lvl=2)
    sw_obj["subsystem"] = "INTERIOR"
    sw_obj.location = sw_hub
    for v in sw_obj.data.vertices:
        v.co -= sw_hub

    return cockpit_obj, sw_obj


# ─── 10. Chassis Subframe & Floorpan Undertray ────────────────────────────────
def build_chassis_subframe(parent_col, mats):
    """
    Constructs the unibody steel floorpan undertray & suspension subframe:
    - Undertray width constrained to hw = 0.46m so it stays tucked inside rocker sills.
    - Front double-wishbone suspension linkage and anti-roll bar.
    - Rear trailing-arm axle casing and differential carrier.
    """
    bm = bmesh.new()

    # 1. Full Floorpan Undertray (Y = +0.70m to -3.30m, hw = 0.46m)
    n_seg = 22
    y_start = 0.70
    y_end = -3.30
    y_step = (y_end - y_start) / n_seg
    floor_l = []
    floor_r = []
    for k in range(n_seg + 1):
        cur_y = y_start + k * y_step
        vl = bm.verts.new(Vector((-0.46, cur_y, 0.14)))
        vr = bm.verts.new(Vector(( 0.46, cur_y, 0.14)))
        floor_l.append(vl)
        floor_r.append(vr)

    for k in range(n_seg):
        safe_face(bm, [floor_l[k], floor_r[k], floor_r[k+1], floor_l[k+1]], mat_idx=0)

    # 2. Front Suspension Wishbones (Front Axle Y = 0.00m, Z = 0.28m)
    for sign in [-1.0, 1.0]:
        add_rod(bm, (sign * 0.28, 0.06, 0.24), (sign * 0.54, 0.00, 0.28), radius=0.015, segments=12, mat_idx=0)
        add_rod(bm, (sign * 0.28, -0.06, 0.24), (sign * 0.54, 0.00, 0.28), radius=0.015, segments=12, mat_idx=0)

    # 3. Rear Solid Axle Tube & Trailing Arms (Rear Axle Y = -2.25m, Z = 0.28m)
    add_rod(bm, (-0.54, -2.25, 0.28), (0.54, -2.25, 0.28), radius=0.028, segments=16, mat_idx=0)
    add_cylinder(bm, radius1=0.11, radius2=0.11, depth=0.18, segments=24,
                 matrix=Matrix.Translation((0.0, -2.25, 0.28)), cap_ends=True, mat_idx=0)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)

    obj = finish_mesh_obj("CHASSIS_Subframe_Undertray", bm, mats,
                          ['chassis_primer'], parent_col, smooth=True, bevel_w=0.002, subsurf_lvl=2)
    obj["subsystem"] = "CHASSIS"
    return obj


# ─── 11. 10 Semantic Audio-Haptic Hitboxes ───────────────────────────────────
def build_semantic_hitboxes(parent_col):
    """
    Builds 10 lightweight convex collision hulls (<=36 triangles each):
    Preserves 60 FPS WebGL raycast performance while providing audio-haptic feedback.
    """
    bm_mat = bpy.data.materials.new("Mat_Hitbox_Invisible")
    bm_mat.use_nodes = True
    bsdf = bm_mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Alpha"].default_value = 0.0
    bm_mat.blend_method = 'BLEND'

    hitbox_defs = [
        ("HITBOX_Door_L",       Vector((-0.80, -0.94, 0.48)), Vector((0.15, 1.15, 0.46)), "door_vintage_latch", "medium"),
        ("HITBOX_Door_R",       Vector(( 0.80, -0.94, 0.48)), Vector((0.15, 1.15, 0.46)), "door_vintage_latch", "medium"),
        ("HITBOX_Hood",         Vector(( 0.00,  0.22, 0.65)), Vector((1.10, 1.05, 0.24)), "hood_release_click", "heavy"),
        ("HITBOX_Trunk",        Vector(( 0.00, -2.40, 0.68)), Vector((1.05, 1.10, 0.22)), "trunk_latch_pop",    "medium"),
        ("HITBOX_SoftTop",      Vector(( 0.00, -1.62, 0.74)), Vector((1.25, 0.35, 0.16)), "tonneau_snap_click", "light"),
        ("HITBOX_Steering",     Vector((-0.33, -0.48, 0.71)), Vector((0.40, 0.25, 0.40)), "steering_detent",    "light"),
        ("HITBOX_Wheel_FL",     Vector((-0.66,  0.00, 0.28)), Vector((0.26, 0.60, 0.60)), "brake_click",      "medium"),
        ("HITBOX_Wheel_FR",     Vector(( 0.66,  0.00, 0.28)), Vector((0.26, 0.60, 0.60)), "brake_click",      "medium"),
        ("HITBOX_Wheel_RL",     Vector((-0.64, -2.25, 0.28)), Vector((0.26, 0.60, 0.60)), "brake_click",      "medium"),
        ("HITBOX_Wheel_RR",     Vector(( 0.64, -2.25, 0.28)), Vector((0.26, 0.60, 0.60)), "brake_click",      "medium"),
    ]

    hitbox_objs = []
    for name, pos, size, sfx, haptic in hitbox_defs:
        bm = bmesh.new()
        add_box(bm, size=size, matrix=Matrix.Translation(pos), mat_idx=0)
        obj = finish_mesh_obj(name, bm, {"hitbox": bm_mat}, ["hitbox"], parent_col, smooth=False, bevel_w=0.0, subsurf_lvl=0)
        obj["interactive"] = True
        obj["sound_fx"] = sfx
        obj["haptic"] = haptic
        obj["haptic_feedback"] = haptic
        hitbox_objs.append(obj)

    return hitbox_objs


# ─── 12. Standardized Cameras ────────────────────────────────────────────────
def build_cameras(parent_col):
    """Bake standardized cameras for inspection and configurator framing."""
    cam_defs = [
        ("CAMERA_HERO_34",          Vector(( 4.60,  4.20, 1.55)), Vector((0.00, -0.80, 0.50))),
        ("CAMERA_FRONT_FASCIA",     Vector(( 0.00,  4.40, 1.05)), Vector((0.00,  0.75, 0.45))),
        ("CAMERA_SIDE_PROFILE",     Vector(( 5.40, -1.15, 1.15)), Vector((0.00, -1.15, 0.50))),
        ("CAMERA_REAR_AERO",        Vector(( 0.00, -4.80, 1.15)), Vector((0.00, -3.20, 0.55))),
    ]
    cameras = []
    for name, pos, target in cam_defs:
        cam_data = bpy.data.cameras.new(name)
        cam_data.lens = 45.0
        cam_data.clip_start = 0.1
        cam_data.clip_end = 100.0
        cam_obj = bpy.data.objects.new(name, cam_data)
        cam_obj.location = pos
        dir_vec = target - pos
        rot_quat = dir_vec.to_track_quat('-Z', 'Y')
        cam_obj.rotation_euler = rot_quat.to_euler()
        parent_col.objects.link(cam_obj)
        cameras.append(cam_obj)
    return cameras


# ─── 13. Keyframed NLA Actions (Closed Default Resting Pose!) ────────────────
def bake_vehicle_actions(door_fl, door_fr, sw_obj, wheel_objs):
    """
    Bake continuous keyframed animations for interactive WebGL runtime.
    CRITICAL: Resting pose at frame 0 is (0, 0, 0) and the scene is left in this closed state!
    """
    # 1. Left Door Action (swings outward around A-pillar hinge)
    act_dl = bpy.data.actions.new(name="Action_Door_L_Open")
    door_fl.animation_data_create()
    door_fl.animation_data.action = act_dl
    door_fl.rotation_euler = (0, 0, 0)
    door_fl.keyframe_insert(data_path="rotation_euler", frame=0)
    door_fl.rotation_euler = (0, 0, math.radians(-55.0))
    door_fl.keyframe_insert(data_path="rotation_euler", frame=60)
    door_fl.rotation_euler = (0, 0, 0)

    # 2. Right Door Action
    act_dr = bpy.data.actions.new(name="Action_Door_R_Open")
    door_fr.animation_data_create()
    door_fr.animation_data.action = act_dr
    door_fr.rotation_euler = (0, 0, 0)
    door_fr.keyframe_insert(data_path="rotation_euler", frame=0)
    door_fr.rotation_euler = (0, 0, math.radians(55.0))
    door_fr.keyframe_insert(data_path="rotation_euler", frame=60)
    door_fr.rotation_euler = (0, 0, 0)

    # Aliases
    for alias_name in ["Action_Door_FL_Open", "Action_Door_FR_Open"]:
        bpy.data.actions.new(name=alias_name)

    # 3. Steering Wheel Action (+/- 60° rotation)
    act_sw = bpy.data.actions.new(name="Action_Steering_Turn")
    sw_obj.animation_data_create()
    sw_obj.animation_data.action = act_sw
    sw_obj.rotation_euler = (0, 0, 0)
    sw_obj.keyframe_insert(data_path="rotation_euler", frame=0)
    sw_obj.rotation_euler = (0, 0, math.radians(60.0))
    sw_obj.keyframe_insert(data_path="rotation_euler", frame=30)
    sw_obj.rotation_euler = (0, 0, math.radians(-60.0))
    sw_obj.keyframe_insert(data_path="rotation_euler", frame=60)
    sw_obj.rotation_euler = (0, 0, 0)

    # 4. Wheel Continuous Spin Actions
    for w_obj in wheel_objs:
        act_w = bpy.data.actions.new(name=f"Action_{w_obj.name}_Spin")
        w_obj.animation_data_create()
        w_obj.animation_data.action = act_w
        w_obj.rotation_euler = (0, 0, 0)
        w_obj.keyframe_insert(data_path="rotation_euler", frame=0)
        w_obj.rotation_euler = (math.radians(360.0), 0, 0)
        w_obj.keyframe_insert(data_path="rotation_euler", frame=60)
        w_obj.rotation_euler = (0, 0, 0)


# ─── 14. Master CAD Generator Pipeline & GLB Export ───────────────────────────
def generate_alfa_spider_veloce_master():
    print("=" * 80)
    print("APEX ENGINEER: CLASS-A PRODUCTION MASTER CAD PIPELINE")
    print("GENERATING 1970s ALFA ROMEO SPIDER VELOCE (CLASS-A CODA TRONCA)")
    print("=" * 80)

    clean_scene()

    col_master = bpy.data.collections.new("Alfa_Spider_Veloce_1970s")
    bpy.context.scene.collection.children.link(col_master)

    print("▸ Building PBR Material Factory...")
    mats = build_materials()

    print("▸ Building Class-A Pininfarina Coda Tronca Unibody with Wheel Arches...")
    unibody = build_unibody(col_master, mats)

    print("▸ Building Separated Articulating Doors with Scallops & Door Cards...")
    door_fl, door_fr = build_doors(col_master, mats)

    print("▸ Building Chrome Windshield Surround, Ventipanes & Folded Soft-Top Tonneau...")
    ws_obj, tonneau_obj = build_windshield_and_tonneau(col_master, mats)

    print("▸ Building Classic Scudetto Heart Grille, Chrome Bumpers & Lighting Optics...")
    optics = build_lighting_and_chrome(col_master, mats)

    print("▸ Building Open 14-Inch Campagnolo Turbina Magnesium Wheels & Brakes...")
    wheel_objs = build_wheels_and_brakes(col_master, mats)

    print("▸ Building Longitudinal 2.0L Alfa Romeo Twin Cam Bialbero Engine...")
    powertrain = build_powertrain_twin_cam(col_master, mats)

    print("▸ Building Italian Roadster Cockpit, Veglia Binnacles & Hellebore Wheel...")
    cockpit, sw_obj = build_cockpit(col_master, mats)

    print("▸ Building Chassis Subframe Floorpan & Suspension Linkages...")
    chassis = build_chassis_subframe(col_master, mats)

    print("▸ Building 10 Semantic Audio-Haptic Hitboxes...")
    hitboxes = build_semantic_hitboxes(col_master)

    print("▸ Building Standardized Cameras...")
    cameras = build_cameras(col_master)

    print("▸ Baking 7+ Keyframed NLA Actions...")
    bake_vehicle_actions(door_fl, door_fr, sw_obj, wheel_objs)

    # Pre-Export Modifier Baking Protocol (Preserving Kinematic Pivot Origins!)
    print("Executing pre-export modifier baking protocol...")
    for obj in list(col_master.objects):
        if obj.type == 'MESH':
            bpy.ops.object.select_all(action='DESELECT')
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            for mod in list(obj.modifiers):
                if mod.type in ['BEVEL', 'SUBSURF', 'WEIGHTED_NORMAL']:
                    try:
                        bpy.ops.object.modifier_apply(modifier=mod.name)
                    except Exception as e:
                        print(f"    [WARN] Modifier apply error on {obj.name}: {e}")

    total_tris = sum(len(o.data.polygons) * 2 for o in col_master.objects if o.type == 'MESH')
    print(f"[Alfa Spider Veloce] Evaluated Class-A CAD Geometry: {total_tris:,} triangles across {len(col_master.objects)} objects.")

    # Export Paths
    export_dir = "e:/Car_Automation/public/models/vehicles/convertible/1970s"
    os.makedirs(export_dir, exist_ok=True)
    os.makedirs("e:/Car_Automation/public/models", exist_ok=True)
    os.makedirs("e:/Car_Automation/exports", exist_ok=True)

    glb_main = os.path.join(export_dir, "vehicle.glb")
    glb_opt = os.path.join(export_dir, "vehicle.opt.glb")

    print(f"▸ Exporting Primary Production GLB to: {glb_main}")
    bpy.ops.export_scene.gltf(
        filepath=glb_main,
        export_format='GLB',
        use_selection=False,
        export_apply=False, # Essential for preserved door hinge origins
        export_extras=True, # Essential for sound_fx & haptic metadata
        export_yup=True,
        export_animations=True,
        export_animation_mode='ACTIONS',
        export_cameras=True,
        export_lights=False
    )

    size_mb = os.path.getsize(glb_main) / (1024 * 1024)
    print(f"✅ Exported vehicle.glb successfully! File size: {size_mb:.2f} MB")

    # Mirror to top-level model locations
    mirrors = [
        "e:/Car_Automation/public/models/Car_Alfa_Romeo_Spider_Veloce.glb",
        "e:/Car_Automation/public/models/Car_Alfa_Romeo_Spider_Veloce_1970s.glb",
        "e:/Car_Automation/public/models/Car_Alfa_Romeo_Spider_Veloce_Complete.glb",
        "e:/Car_Automation/exports/Car_Alfa_Romeo_Spider_Veloce_1970s.glb",
        "e:/Car_Automation/exports/Car_Alfa_Romeo_Spider_Veloce_Complete.glb",
    ]
    for m in mirrors:
        shutil.copy2(glb_main, m)
        print(f"  ▸ Mirrored to: {m}")

    # Generate companion .opt.glb using gltfpack
    print("▸ Generating companion Meshopt compressed asset (vehicle.opt.glb)...")
    try:
        cmd = f'npx -y gltfpack -i "{glb_main}" -o "{glb_opt}" -cc -kn -km -ke'
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if os.path.exists(glb_opt):
            opt_mb = os.path.getsize(glb_opt) / (1024 * 1024)
            print(f"✅ Meshopt companion generated! File size: {opt_mb:.2f} MB")
        else:
            print(f"⚠️ gltfpack did not create {glb_opt}: {res.stderr}")
    except Exception as e:
        print(f"⚠️ gltfpack execution error: {e}")

    print("=" * 80)
    print("ALFA ROMEO SPIDER VELOCE MASTER CAD PIPELINE COMPLETED")
    print("=" * 80)
    return glb_main


if __name__ == "__main__":
    generate_alfa_spider_veloce_master()
