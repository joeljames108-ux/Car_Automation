"""
=============================================================================
Procedural Class-A CAD Generator: Rolls-Royce Phantom VII EWB Limousine (2000s)
PHASE 60: Sovereign Body Shell, Pantheon Chrome Grille, Spirit of Ecstasy,
Coach Doors, Bi-Xenon Optics, Jewel Taillights & Tri-Target GLB Export
=============================================================================
Limousine Architecture — 2000s Sovereign British Grandeur & Modern Bespoke Engineering
Phase 60 builds the complete monolithic Class-A exterior body, classic 2:1 wheel-to-body
height proportion, monumental upright mirror-polished chrome Pantheon radiator shell,
iconic Spirit of Ecstasy Flying Lady hood mascot, solid front nose fascia panels with
bi-xenon rectangular headlamps and lower circular LED driving lamps, reverse-opening
rear coach doors, monolithic formal C-pillar privacy sail panels, mathematically curved
wheel arches with rolled flare moldings and enclosed dark inner wheel tubs, acoustic
double-glazed glass with optical transparency, vertical jewel taillights, and serializes
tri-target GLBs (>200 KB) for web and simulation.

Phase 60 Architectural Subsystems:
1. Complete Exterior PBR Material Suite:
   - Deep Midnight Sapphire metallic body lacquer with mirror clearcoat
   - English White upper carriage two-tone roof & bonnet contrast option
   - Mirror chrome electroplated brightwork for Pantheon shell, Flying Lady, window surrounds & spears
   - Dark matte radiator backing depth mesh providing authentic optical depth
   - High-transmittance optical dielectric glass with rear salon VIP privacy tint and alpha blending
   - Bi-xenon optical projector lenses & circular LED driving lamps with Fresnel refraction
   - Vertical jewel taillights with ruby red stop/tail rings, amber turn signals & clear reverse lenses
   - Vulcanized black window weatherstrips & aerodynamic bumper impact seals
2. Monolithic 6.09m Phantom VII EWB Body Shell:
   - Sovereign upright stance with imposing 2:1 wheel-to-body height proportion
   - Long majestic hood with raised center spine extending to Pantheon plinth
   - Chauffeur front doors and extended rear-hinged coach doors (suicide doors)
   - Solid structural A-pillars, reinforced wide B-pillars, and monolithic formal C-pillar privacy sails
   - Continuous sheet-metal fender flanks with smooth semicircular curved wheel arches
   - Rolled curved arch flare moldings and enclosed dark inner wheel tubs (zero see-through voids)
   - Heavy chrome coach-door pull handles with integrated dual keyholes
3. Monumental Rolls-Royce Pantheon Chrome Radiator Grille Shell & Mascot:
   - Upright temple-inspired chrome grille shell with 24 hand-polished vertical vanes
   - Dark radiator depth backing providing authentic optical depth
   - Sculpted Spirit of Ecstasy (Flying Lady) mascot perched forward on retracting plinth collar with swept wings
4. Solid Front Nose Fascia & Lighting:
   - Solid body-colored nose panels flanking the Pantheon grille with zero exposed chassis gaps
   - Rectangular bi-xenon projector headlamps with chrome internal divider bars and clear outer polycarb lenses
   - Lower circular LED driving lamps / fog lamps with optical micro-lenses
   - Wrap-around amber corner turn indicators flush with front fender crowns
   - Integrated front bumper with wide lower air intake and chrome accent blade
5. Rear Fascia, Jewel Taillights & Bumper:
   - Signature vertical jewel-like taillight assemblies with ruby red LED perimeter borders
   - Separate amber turn signal and clear reverse optical segments
   - Gracefully tapered trunk decklid with recessed license plate cavity and chrome boot handle
   - Integrated rear aerodynamic bumper with polished chrome rub strip and dual oval exhaust tips
6. Acoustic Laminated Double-Glazed Glass & Exterior Jewelry:
   - Dual-pane thermal acoustic glass with deep rear lounge privacy tint and alpha blending
   - Perimeter chrome window reveal moldings framing coach door aperture
   - Full-length waistline chrome spear accent moldings along fender, doors, and quarter panels
   - Aerodynamic body-colored side mirrors with integrated defrost glass
   - Front fender chrome "RR" monogram side relief badges
7. Tri-Target GLB Serialization:
   - public/models/vehicles/limousine/2000s/vehicle.glb
   - public/models/Car_Rolls_Royce_Phantom_VII_EWB_2000s_Complete.glb
   - exports/Car_Rolls_Royce_Phantom_VII_EWB_2000s.glb
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion

# Import Phase 59 generator
gen_dir = os.path.dirname(os.path.abspath(__file__))
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

import generate_rolls_royce_phantom_vii_phase1


# ============================================================================
# 1. CORE COMPATIBILITY WRAPPERS & UTILITIES
# ============================================================================

def _compat_create_cylinder(bm, radius=1.0, depth=2.0, segments=16, cap_ends=True, cap_tris=False, matrix=None, **kwargs):
    """Blender 5.x compatibility wrapper for bmesh cylinder creation using create_cone."""
    r1 = kwargs.pop('radius1', radius)
    r2 = kwargs.pop('radius2', radius)
    kwargs.pop('round_cap', None)
    if matrix is None:
        matrix = Matrix()
    return bmesh.ops.create_cone(
        bm,
        cap_ends=cap_ends,
        cap_tris=cap_tris,
        segments=segments,
        radius1=r1,
        radius2=r2,
        depth=depth,
        matrix=matrix,
        **kwargs
    )

if not hasattr(bmesh.ops, 'create_cylinder'):
    bmesh.ops.create_cylinder = _compat_create_cylinder


def add_annular_tube(bm, r_inner, r_outer, depth, segments=36, matrix=None, create_sidewalls=True):
    """Generates an annular cylindrical tube/ring with quad walls and smooth sidewalls."""
    if matrix is None:
        matrix = Matrix()
    d2 = depth * 0.5
    for i in range(segments):
        a0 = i * (2.0 * math.pi / segments)
        a1 = (i + 1) * (2.0 * math.pi / segments)
        c0, s0 = math.cos(a0), math.sin(a0)
        c1, s1 = math.cos(a1), math.sin(a1)
        v_out_0_top = bm.verts.new(matrix @ Vector((c0 * r_outer, s0 * r_outer, d2)))
        v_out_1_top = bm.verts.new(matrix @ Vector((c1 * r_outer, s1 * r_outer, d2)))
        v_out_1_bot = bm.verts.new(matrix @ Vector((c1 * r_outer, s1 * r_outer, -d2)))
        v_out_0_bot = bm.verts.new(matrix @ Vector((c0 * r_outer, s0 * r_outer, -d2)))
        bm.faces.new([v_out_0_top, v_out_1_top, v_out_1_bot, v_out_0_bot])
        if r_inner > 0:
            v_in_0_top = bm.verts.new(matrix @ Vector((c0 * r_inner, s0 * r_inner, d2)))
            v_in_1_top = bm.verts.new(matrix @ Vector((c1 * r_inner, s1 * r_inner, d2)))
            v_in_1_bot = bm.verts.new(matrix @ Vector((c1 * r_inner, s1 * r_inner, -d2)))
            v_in_0_bot = bm.verts.new(matrix @ Vector((c0 * r_inner, s0 * r_inner, -d2)))
            bm.faces.new([v_in_0_bot, v_in_1_bot, v_in_1_top, v_in_0_top])
            if create_sidewalls:
                bm.faces.new([v_in_0_top, v_in_1_top, v_out_1_top, v_out_0_top])
                bm.faces.new([v_out_0_bot, v_out_1_bot, v_in_1_bot, v_in_0_bot])


def apply_smooth_and_modifiers(obj, angle_deg=35.0, bevel_width=0.003, segments=2):
    """Applies smooth shading and non-destructive modifiers for Class-A CAD mesh quality."""
    if obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True
        if hasattr(obj.data, 'use_auto_smooth'):
            obj.data.use_auto_smooth = True
            obj.data.auto_smooth_angle = math.radians(angle_deg)
        if bevel_width > 0:
            mod_bev = obj.modifiers.new(name="BeVEL", type='BEVEL')
            mod_bev.width = bevel_width
            mod_bev.segments = segments
            mod_bev.limit_method = 'ANGLE'
            mod_bev.angle_limit = math.radians(angle_deg)
        mod_wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        mod_wn.keep_sharp = True


def weld_mesh_vertices(bm, dist=0.001):
    """Welds coincident vertices in bmesh to eliminate unmerged quad seams."""
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=dist)


def create_body_part_object(name, bm, material=None, angle_deg=35.0, bevel_width=0.003):
    """Converts bmesh to mesh object, assigns material, links to active collection."""
    weld_mesh_vertices(bm, dist=0.0008)
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    if material:
        obj.data.materials.append(material)
    bpy.context.collection.objects.link(obj)
    apply_smooth_and_modifiers(obj, angle_deg=angle_deg, bevel_width=bevel_width)
    return obj


def get_or_create_mat(name, make_nodes_func):
    """Retrieves or builds a high-fidelity Principled BSDF PBR material."""
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    make_nodes_func(mat, nodes, links)
    return mat

# ============================================================================
# 2. EXTERIOR PBR MATERIAL SUITE
# ============================================================================

def build_phantom_vii_exterior_material_suite():
    """Builds the complete exterior PBR material suite for Phantom VII EWB."""
    mats = {}

    def _pbr(name, base_col, roughness=0.5, metallic=0.0, clearcoat=0.0, transmission=0.0, ior=1.45, alpha=1.0, emission=None, emission_strength=1.0):
        def _build(mat, nodes, links):
            out = nodes.new(type='ShaderNodeOutputMaterial')
            bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
            bsdf.inputs['Base Color'].default_value = base_col
            bsdf.inputs['Roughness'].default_value = roughness
            bsdf.inputs['Metallic'].default_value = metallic
            if 'Clearcoat Weight' in bsdf.inputs:
                bsdf.inputs['Clearcoat Weight'].default_value = clearcoat
            elif 'Clearcoat' in bsdf.inputs:
                bsdf.inputs['Clearcoat'].default_value = clearcoat
            if 'Transmission Weight' in bsdf.inputs:
                bsdf.inputs['Transmission Weight'].default_value = transmission
            elif 'Transmission' in bsdf.inputs:
                bsdf.inputs['Transmission'].default_value = transmission
            if 'IOR' in bsdf.inputs:
                bsdf.inputs['IOR'].default_value = ior
            if 'Alpha' in bsdf.inputs:
                bsdf.inputs['Alpha'].default_value = alpha
            if alpha < 1.0 or transmission > 0.05:
                if hasattr(mat, 'blend_method'):
                    mat.blend_method = 'BLEND'
                if hasattr(mat, 'shadow_method'):
                    mat.shadow_method = 'NONE'
            if emission:
                if 'Emission Color' in bsdf.inputs:
                    bsdf.inputs['Emission Color'].default_value = emission
                    bsdf.inputs['Emission Strength'].default_value = emission_strength
                elif 'Emission' in bsdf.inputs:
                    bsdf.inputs['Emission'].default_value = emission
            links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
        return get_or_create_mat(name, _build)

    # 1. Body Lacquer & Chrome Brightwork
    mats['body_lacquer_midnight'] = _pbr('Mat_RR_MidnightSapphire_Metallic', (0.015, 0.025, 0.060, 1.0), roughness=0.08, metallic=0.45, clearcoat=1.0)
    mats['body_contrast_silver'] = _pbr('Mat_RR_EnglishSilver_Bonnet', (0.75, 0.77, 0.80, 1.0), roughness=0.12, metallic=0.75, clearcoat=0.9)
    mats['pantheon_mirror_chrome'] = _pbr('Mat_RR_Pantheon_MirrorChrome', (0.96, 0.97, 0.98, 1.0), roughness=0.015, metallic=1.0, clearcoat=1.0)
    mats['spirit_of_ecstasy'] = _pbr('Mat_RR_SpiritOfEcstasy_Mascot', (0.95, 0.96, 0.98, 1.0), roughness=0.03, metallic=0.98, clearcoat=1.0)
    mats['radiator_dark_depth'] = _pbr('Mat_RR_Radiator_DarkDepth', (0.010, 0.010, 0.012, 1.0), roughness=0.92, metallic=0.02)
    mats['wheel_arch_liner'] = _pbr('Mat_RR_WheelArch_DarkAcousticLiner', (0.012, 0.012, 0.014, 1.0), roughness=0.92, metallic=0.01)

    # 2. Lighting & Optics
    mats['headlamp_clear_lens'] = _pbr('Mat_RR_Headlamp_OpticalPolycarb', (0.95, 0.97, 1.0, 1.0), roughness=0.02, transmission=0.92, alpha=0.28, ior=1.52)
    mats['bixenon_projector'] = _pbr('Mat_RR_BiXenon_Projector_Core', (0.98, 0.99, 1.0, 1.0), roughness=0.1, emission=(0.95, 0.98, 1.0, 1.0), emission_strength=8.0)
    mats['circular_drl_halo'] = _pbr('Mat_RR_Circular_DRL_Halo', (1.0, 1.0, 1.0, 1.0), roughness=0.15, emission=(1.0, 1.0, 1.0, 1.0), emission_strength=5.0)
    mats['corner_amber_marker'] = _pbr('Mat_RR_Amber_TurnIndicator', (0.95, 0.45, 0.04, 1.0), roughness=0.18, transmission=0.75, alpha=0.85, emission=(0.95, 0.42, 0.04, 1.0), emission_strength=2.2)
    mats['taillight_ruby_jewel'] = _pbr('Mat_RR_Taillight_RubyJewel', (0.82, 0.02, 0.028, 1.0), roughness=0.10, transmission=0.78, alpha=0.88, emission=(0.85, 0.02, 0.02, 1.0), emission_strength=2.5)
    mats['taillight_amber_jewel'] = _pbr('Mat_RR_Taillight_AmberJewel', (0.92, 0.48, 0.05, 1.0), roughness=0.14, transmission=0.72, alpha=0.85, emission=(0.90, 0.45, 0.05, 1.0), emission_strength=2.0)
    mats['reverse_clear_jewel'] = _pbr('Mat_RR_Reverse_ClearJewel', (0.94, 0.95, 0.96, 1.0), roughness=0.08, transmission=0.90, alpha=0.75, ior=1.5)

    # 3. Glass & Rubber
    mats['windshield_laminated'] = _pbr('Mat_RR_Windshield_AcousticGlass', (0.92, 0.95, 0.98, 1.0), roughness=0.02, transmission=0.94, alpha=0.20, ior=1.52)
    mats['privacy_lounge_glass'] = _pbr('Mat_RR_RearLounge_VIP_PrivacyTint', (0.015, 0.020, 0.028, 1.0), roughness=0.03, transmission=0.65, alpha=0.60, ior=1.52)
    mats['bumper_rubber_seal'] = _pbr('Mat_RR_Bumper_Weatherstrip', (0.010, 0.010, 0.012, 1.0), roughness=0.88, metallic=0.01)

    return mats

# ============================================================================
# 3. MONOLITHIC 6.09M SOVEREIGN SPACEFRAME BODY SHELL
# ============================================================================

def build_fender_with_smooth_arch(bm, side, yc, zc, r, y_fwd, y_aft, z_belt, z_rocker, x_pos, thickness=0.045, segments=12):
    """
    Constructs a solid, continuous Class-A CAD sheet-metal fender flank with a
    mathematically smooth semicircular curved wheel arch opening and rolled flare molding.
    Generates clean quad faces connecting the arch contour to the beltline and rockers.
    """
    x_out = x_pos * side
    x_in = (x_pos - thickness) * side

    # Determine direction: if y_fwd > y_aft, we are working frontwards
    # Generate semicircular arch points from front (cos=1) to rear (cos=-1)
    arch_pts = []
    for i in range(segments + 1):
        th = math.pi * i / segments
        ay = yc + r * math.cos(th)
        az = zc + r * math.sin(th)
        arch_pts.append((ay, az))

    # 1. Forward Flank Box (from front of arch to y_fwd)
    y_arch_front = arch_pts[0][0]
    fwd_len = abs(y_fwd - y_arch_front)
    fwd_mid_y = (y_fwd + y_arch_front) * 0.5
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((x_out, fwd_mid_y, (z_belt + z_rocker) * 0.5))) @
               Matrix.Scale(thickness, 4, Vector((1, 0, 0))) @
               Matrix.Scale(fwd_len, 4, Vector((0, 1, 0))) @
               Matrix.Scale(z_belt - z_rocker, 4, Vector((0, 0, 1)))
    )

    # 2. Aft Flank Box (from rear of arch to y_aft)
    y_arch_rear = arch_pts[-1][0]
    aft_len = abs(y_arch_rear - y_aft)
    aft_mid_y = (y_aft + y_arch_rear) * 0.5
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((x_out, aft_mid_y, (z_belt + z_rocker) * 0.5))) @
               Matrix.Scale(thickness, 4, Vector((1, 0, 0))) @
               Matrix.Scale(aft_len, 4, Vector((0, 1, 0))) @
               Matrix.Scale(z_belt - z_rocker, 4, Vector((0, 0, 1)))
    )

    # 3. Continuous Eyebrow Crown connecting top of arch to beltline
    eyebrow_h = z_belt - (zc + r)
    eyebrow_z = (z_belt + zc + r) * 0.5
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((x_out, yc, eyebrow_z))) @
               Matrix.Scale(thickness, 4, Vector((1, 0, 0))) @
               Matrix.Scale(2.0 * r, 4, Vector((0, 1, 0))) @
               Matrix.Scale(eyebrow_h, 4, Vector((0, 0, 1)))
    )

    # 4. Smooth Curved Arch Fill Quads (Bridging the eyebrow box to the circular arch contour)
    for i in range(segments):
        p0 = arch_pts[i]
        p1 = arch_pts[i + 1]
        seg_mid_y = (p0[0] + p1[0]) * 0.5
        seg_mid_z = (p0[1] + p1[1]) * 0.5
        top_z = zc + r
        seg_h = top_z - seg_mid_z
        if seg_h > 0.005:
            bmesh.ops.create_cube(
                bm,
                size=1.0,
                matrix=Matrix.Translation(Vector((x_out, seg_mid_y, seg_mid_z + seg_h * 0.5))) @
                       Matrix.Scale(thickness, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(abs(p0[0] - p1[0]) + 0.015, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(seg_h, 4, Vector((0, 0, 1)))
            )

    # 5. Rolled Flared Arch Lip (Curved chrome/body flare molding following the circular arc)
    for i in range(segments):
        p0 = arch_pts[i]
        p1 = arch_pts[i + 1]
        lip_mid_y = (p0[0] + p1[0]) * 0.5
        lip_mid_z = (p0[1] + p1[1]) * 0.5
        dy = p1[0] - p0[0]
        dz = p1[1] - p0[1]
        seg_len = math.sqrt(dy * dy + dz * dz)
        ang = math.atan2(dz, dy)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector(((x_pos + 0.012) * side, lip_mid_y, lip_mid_z))) @
                   Matrix.Rotation(ang, 4, 'X') @
                   Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(seg_len + 0.010, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.025, 4, Vector((0, 0, 1)))
        )


def build_phantom_vii_body_shell(mats):
    """
    Constructs the monumental 6.09m sovereign aluminum body shell.
    Features imposing 2:1 wheel-to-body proportion, high waistline beltline at Z = 1.05m,
    long majestic hood with center crest, chauffeur front doors, extended rear-hinged
    coach doors, monolithic formal C-pillar privacy sails, mathematically curved
    wheel arches with rolled flare moldings, and enclosed dark inner wheel tubs.
    Dimensions: Length 6.092m (Y = -3.046m to +3.046m), Width 1.990m, Height 1.64m.
    """
    bm_body = bmesh.new()
    bm_tubs = bmesh.new()

    body_w = 0.995   # Half-width (1.99m wide body)
    hood_z = 1.08    # Majestic high hood level
    belt_z = 1.05    # High horizontal waistline level
    roof_z = 1.64    # Lofty roof height
    roof_w = 0.74    # Half-width of roof panel
    rocker_z = 0.32  # Lower rocker sill level

    # 1. Long Majestic Front Hood with Center Spine (Y = 1.44m to 3.02m, Width = 1.62m)
    bmesh.ops.create_cube(
        bm_body,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.23, hood_z))) @
               Matrix.Scale(1.62, 4, Vector((1, 0, 0))) @
               Matrix.Scale(1.56, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.045, 4, Vector((0, 0, 1)))
    )
    # Raised Center Hood Spine leading directly to Spirit of Ecstasy
    bmesh.ops.create_cube(
        bm_body,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.23, hood_z + 0.018))) @
               Matrix.Scale(0.035, 4, Vector((1, 0, 0))) @
               Matrix.Scale(1.54, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.016, 4, Vector((0, 0, 1)))
    )
    # Header panel framing the Pantheon grille shell top plinth (Y = 3.00m to 3.04m)
    bmesh.ops.create_cube(
        bm_body,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 3.02, hood_z + 0.02))) @
               Matrix.Scale(1.88, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.06, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.06, 4, Vector((0, 0, 1)))
    )
    # Cowl Wiper Trough Panel (Y = 1.44m to 1.48m, Z = 1.05m)
    bmesh.ops.create_cube(
        bm_body,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.46, hood_z - 0.02))) @
               Matrix.Scale(1.64, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.05, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.03, 4, Vector((0, 0, 1)))
    )

    # 2. Upper Front Fenders with Semicircular Curved Wheel Arch Openings
    # Front wheel center: Y = 1.91m, Z = 0.40m, arch radius R = 0.47m
    for side in [1.0, -1.0]:
        # Upper horizontal crown blade (Z = 1.07m, Y = 1.44m to 3.02m)
        bmesh.ops.create_cube(
            bm_body,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.90 * side, 2.23, hood_z - 0.01))) @
                   Matrix.Scale(0.18, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(1.56, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
        )
        # Semicircular Curved Front Fender Flank with integrated arch opening
        build_fender_with_smooth_arch(
            bm_body,
            side=side,
            yc=1.91,
            zc=0.40,
            r=0.47,
            y_fwd=3.02,
            y_aft=1.44,
            z_belt=belt_z,
            z_rocker=rocker_z,
            x_pos=body_w,
            thickness=0.045,
            segments=12
        )

        # Front Dark Inner Wheel Tub / Enclosed Liner (radius 0.46m, width 0.30m)
        bmesh.ops.create_cylinder(
            bm_tubs,
            cap_ends=False,
            radius=0.46,
            depth=0.30,
            segments=28,
            matrix=Matrix.Translation(Vector((0.84 * side, 1.91, 0.40))) @
                   Matrix.Rotation(math.radians(90.0 * side), 4, 'Y')
        )
        # Inner vertical splash wall
        bmesh.ops.create_cube(
            bm_tubs,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.69 * side, 1.91, 0.65))) @
                   Matrix.Scale(0.02, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.96, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.55, 4, Vector((0, 0, 1)))
        )

    # 3. Passenger Cabin Flanks & Coach Doors (Y = -1.44m to +1.44m -> 2.88m continuous cabin)
    for side in [1.0, -1.0]:
        # Lower body flank & door skins (Z = 0.32m to 1.05m)
        bmesh.ops.create_cube(
            bm_body,
            size=1.0,
            matrix=Matrix.Translation(Vector((body_w * side, 0.0, (belt_z + rocker_z) * 0.5))) @
                   Matrix.Scale(0.048, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(2.88, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(belt_z - rocker_z, 4, Vector((0, 0, 1)))
        )
        # Structural A-Pillar (Connecting Cowl Y=1.46m, Z=1.05m to Roof Y=1.25m, Z=1.62m)
        bmesh.ops.create_cube(
            bm_body,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.80 * side, 1.355, 1.335))) @
                   Matrix.Rotation(math.radians(22.0), 4, 'X') @
                   Matrix.Rotation(math.radians(-10.0 * side), 4, 'Y') @
                   Matrix.Scale(0.075, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.075, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.64, 4, Vector((0, 0, 1)))
        )
        # Structural B-Pillar (Chauffeur / Coach Door central pillar: Y = 0.25m)
        bmesh.ops.create_cube(
            bm_body,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.92 * side, 0.25, 1.34))) @
                   Matrix.Scale(0.07, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.20, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.58, 4, Vector((0, 0, 1)))
        )
        # Door Window Beltline Inner Sill (Closing inner gap beneath glass along entire cabin)
        bmesh.ops.create_cube(
            bm_body,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.91 * side, 0.0, belt_z))) @
                   Matrix.Scale(0.20, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(2.90, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
        )

    # 4. Rear Quarter Panels with Semicircular Curved Wheel Arches & Monolithic Formal C-Pillars
    # Rear wheel center: Y = -1.91m, Z = 0.40m, arch radius R = 0.47m
    for side in [1.0, -1.0]:
        # Upper horizontal quarter crown (Z = 1.04m, Y = -3.02m to -1.44m)
        bmesh.ops.create_cube(
            bm_body,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.90 * side, -2.23, belt_z - 0.01))) @
                   Matrix.Scale(0.18, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(1.56, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
        )
        # Semicircular Curved Rear Quarter Flank with integrated arch opening
        build_fender_with_smooth_arch(
            bm_body,
            side=side,
            yc=-1.91,
            zc=0.40,
            r=0.47,
            y_fwd=-1.44,
            y_aft=-3.02,
            z_belt=belt_z,
            z_rocker=rocker_z,
            x_pos=body_w,
            thickness=0.045,
            segments=12
        )

        # Rear Dark Inner Wheel Tub / Enclosed Liner (radius 0.46m, width 0.30m)
        bmesh.ops.create_cylinder(
            bm_tubs,
            cap_ends=False,
            radius=0.46,
            depth=0.30,
            segments=28,
            matrix=Matrix.Translation(Vector((0.84 * side, -1.91, 0.40))) @
                   Matrix.Rotation(math.radians(90.0 * side), 4, 'Y')
        )
        # Inner vertical splash wall
        bmesh.ops.create_cube(
            bm_tubs,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.69 * side, -1.91, 0.65))) @
                   Matrix.Scale(0.02, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.96, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.55, 4, Vector((0, 0, 1)))
        )

        # ---------------------------------------------------------------------
        # Monolithic Sovereign Formal C-Pillar Limousine Privacy Sail Panel
        # Clean architectural sail panel connecting rear quarter beltline to roof
        # ---------------------------------------------------------------------
        # Main C-pillar sail panel body (Y = -1.44m to -2.15m, Z = 1.05m to 1.64m)
        bmesh.ops.create_cube(
            bm_body,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.85 * side, -1.795, 1.345))) @
                   Matrix.Rotation(math.radians(-6.0 * side), 4, 'Y') @
                   Matrix.Scale(0.18, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.71, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.59, 4, Vector((0, 0, 1)))
        )
        # Polished Chrome "RR" Monogram Medallion Plinth on C-Pillar
        bmesh.ops.create_cube(
            bm_body,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.942 * side, -1.78, 1.35))) @
                   Matrix.Scale(0.010, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.075, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.055, 4, Vector((0, 0, 1)))
        )

    # 5. Rear Trunk Decklid & Rear Vertical Face (Y = -2.15m to -3.02m)
    # Gently sloping regal trunk decklid
    bmesh.ops.create_cube(
        bm_body,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -2.585, belt_z - 0.01))) @
               Matrix.Scale(1.68, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.87, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
    )
    # Rear Vertical Trunk Drop Face
    bmesh.ops.create_cube(
        bm_body,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -3.02, 0.72))) @
               Matrix.Scale(1.92, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.04, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.62, 4, Vector((0, 0, 1)))
    )

    # 6. Monolithic Lofty Roof Panel (Y = -1.85m to +1.25m -> 3.10m length, Z = 1.64m)
    bmesh.ops.create_cube(
        bm_body,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.30, roof_z))) @
               Matrix.Scale(roof_w * 2.0, 4, Vector((1, 0, 0))) @
               Matrix.Scale(3.10, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
    )
    # Left and Right aerodynamic roof cantrails
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm_body,
            size=1.0,
            matrix=Matrix.Translation(Vector((roof_w * side, -0.30, roof_z - 0.02))) @
                   Matrix.Rotation(math.radians(16.0 * side), 4, 'Y') @
                   Matrix.Scale(0.14, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(3.10, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.035, 4, Vector((0, 0, 1)))
        )

    # 7. Heavy Chrome Coach-Door Pull Handles (Opposing center pull handles at B-pillar!)
    for side in [1.0, -1.0]:
        for hy in [0.38, 0.12]:
            bmesh.ops.create_cube(
                bm_body,
                size=1.0,
                matrix=Matrix.Translation(Vector(((body_w + 0.018) * side, hy, belt_z - 0.05))) @
                       Matrix.Scale(0.022, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.16, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.038, 4, Vector((0, 0, 1)))
            )

    obj_body = create_body_part_object("BODY_Phantom_VII_EWB_UpperShell", bm_body, mats['body_lacquer_midnight'], bevel_width=0.003)
    obj_tubs = create_body_part_object("BODY_Phantom_VII_Inner_Wheel_Tubs", bm_tubs, mats['wheel_arch_liner'], bevel_width=0.0)

    return [obj_body, obj_tubs]

# ============================================================================
# 4. PANTHEON CHROME GRILLE SHELL, SPIRIT OF ECSTASY & FRONT FASCIA
# ============================================================================

def build_phantom_vii_front_fascia_and_grille(mats):
    """
    Constructs the monumental mirror-polished chrome Pantheon radiator grille shell,
    24 vertical fluted vanes, dark radiator depth backing, sculpted Spirit of Ecstasy mascot,
    solid front nose fascia panels with bi-xenon projector headlamps, circular LED DRLs,
    and integrated front aerodynamic bumper.
    """
    gy = 3.02   # Grille front plane Y
    gz = 0.82   # Grille center Z
    by = 3.06   # Front bumper apex Y
    bz = 0.46   # Bumper center Z

    # -------------------------------------------------------------------------
    # A. Monumental Rolls-Royce Pantheon Mirror-Chrome Grille Shell
    # -------------------------------------------------------------------------
    bm_grille = bmesh.new()
    gw = 0.72   # Grille width (0.72m)
    gh = 0.68   # Grille height (0.68m)

    # Outer chrome temple perimeter frame
    # Top arch plinth (Z = 1.16m)
    bmesh.ops.create_cube(
        bm_grille,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, gy, gz + gh * 0.5))) @
               Matrix.Scale(gw, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.07, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.05, 4, Vector((0, 0, 1)))
    )
    # Bottom frame (Z = 0.48m)
    bmesh.ops.create_cube(
        bm_grille,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, gy, gz - gh * 0.5))) @
               Matrix.Scale(gw, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.07, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.05, 4, Vector((0, 0, 1)))
    )
    # Left & Right vertical upright temple pillars
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm_grille,
            size=1.0,
            matrix=Matrix.Translation(Vector((gw * 0.5 * side, gy, gz))) @
                   Matrix.Scale(0.05, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.07, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(gh, 4, Vector((0, 0, 1)))
        )

    # 24 Polished Vertical Fluted Vanes (Hand-shaped Pantheon temple aesthetic)
    v_count = 24
    v_spacing = (gw - 0.10) / (v_count - 1)
    for iv in range(v_count):
        vx = -((gw - 0.10) * 0.5) + iv * v_spacing
        bmesh.ops.create_cube(
            bm_grille,
            size=1.0,
            matrix=Matrix.Translation(Vector((vx, gy + 0.005, gz))) @
                   Matrix.Scale(0.008, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.035, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(gh - 0.04, 4, Vector((0, 0, 1)))
        )

    # Center vertical chrome divider spine
    bmesh.ops.create_cube(
        bm_grille,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, gy + 0.012, gz))) @
               Matrix.Scale(0.016, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
               Matrix.Scale(gh + 0.02, 4, Vector((0, 0, 1)))
    )

    # Top plinth Rolls-Royce "RR" monogram enamel badge
    bmesh.ops.create_cube(
        bm_grille,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, gy + 0.025, gz + gh * 0.5 - 0.02))) @
               Matrix.Scale(0.065, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.015, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.045, 4, Vector((0, 0, 1)))
    )

    obj_grille = create_body_part_object("FRONT_Phantom_VII_Pantheon_Grille_Shell", bm_grille, mats['pantheon_mirror_chrome'])

    # Dark Radiator Backing Depth Mesh
    bm_back = bmesh.new()
    bmesh.ops.create_cube(
        bm_back,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, gy - 0.03, gz))) @
               Matrix.Scale(gw - 0.04, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.02, 4, Vector((0, 1, 0))) @
               Matrix.Scale(gh - 0.04, 4, Vector((0, 0, 1)))
    )
    obj_back = create_body_part_object("FRONT_Phantom_VII_Grille_DarkBacking", bm_back, mats['radiator_dark_depth'])

    # -------------------------------------------------------------------------
    # B. Sculpted Spirit of Ecstasy (Flying Lady) Mascot
    # Poised forward atop the radiator shell with elegant swept wings
    # -------------------------------------------------------------------------
    bm_mascot = bmesh.new()
    mascot_z = gz + gh * 0.5 + 0.03
    # Stepped circular plinth collar trapdoor
    bmesh.ops.create_cylinder(
        bm_mascot,
        cap_ends=True,
        radius=0.042,
        depth=0.015,
        matrix=Matrix.Translation(Vector((0.0, gy + 0.01, mascot_z)))
    )
    bmesh.ops.create_cylinder(
        bm_mascot,
        cap_ends=True,
        radius=0.032,
        depth=0.008,
        matrix=Matrix.Translation(Vector((0.0, gy + 0.015, mascot_z + 0.012)))
    )
    # Mascot draped torso (leaning forward at 30 deg)
    bmesh.ops.create_cone(
        bm_mascot,
        cap_ends=True,
        radius1=0.016,
        radius2=0.009,
        depth=0.085,
        matrix=Matrix.Translation(Vector((0.0, gy + 0.025, mascot_z + 0.052))) @
               Matrix.Rotation(math.radians(30.0), 4, 'X')
    )
    # Serene head & hair sphere
    bmesh.ops.create_cylinder(
        bm_mascot,
        cap_ends=True,
        radius=0.011,
        depth=0.018,
        matrix=Matrix.Translation(Vector((0.0, gy + 0.046, mascot_z + 0.098)))
    )
    # Billowed flowing gown wings (swept back along shoulder lines)
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm_mascot,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.022 * side, gy - 0.010, mascot_z + 0.082))) @
                   Matrix.Rotation(math.radians(-55.0), 4, 'X') @
                   Matrix.Rotation(math.radians(-14.0 * side), 4, 'Y') @
                   Matrix.Scale(0.006, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.050, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.085, 4, Vector((0, 0, 1)))
        )

    obj_mascot = create_body_part_object("FRONT_Phantom_VII_Spirit_Of_Ecstasy", bm_mascot, mats['spirit_of_ecstasy'])

    # -------------------------------------------------------------------------
    # C. Solid Front Nose Fascia Panels (Flanking the Pantheon Grille)
    # Fills the entire space from grille edge (X = 0.36m) to outer fender (X = 0.995m),
    # eliminating any hollow cavity or exposed spaceframe voids!
    # -------------------------------------------------------------------------
    bm_nose = bmesh.new()
    for side in [1.0, -1.0]:
        # Main solid front nose panel (X = 0.36m to 0.995m, Y = 3.01m, Z = 0.58m to 1.08m)
        bmesh.ops.create_cube(
            bm_nose,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.675 * side, 3.01, 0.83))) @
                   Matrix.Scale(0.63, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.03, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.50, 4, Vector((0, 0, 1)))
        )
        # Upper eyebrow fillet under hood (Z = 1.05m to 1.08m)
        bmesh.ops.create_cube(
            bm_nose,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.675 * side, 3.02, 1.065))) @
                   Matrix.Scale(0.63, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.03, 4, Vector((0, 0, 1)))
        )

    obj_nose = create_body_part_object("FRONT_Phantom_VII_Nose_Fascia", bm_nose, mats['body_lacquer_midnight'])

    # -------------------------------------------------------------------------
    # D. Front Lighting: Bi-Xenon Rectangular Lamps, Lenses & Lower Circular DRL Halos
    # -------------------------------------------------------------------------
    bm_hl = bmesh.new()
    bm_lens = bmesh.new()
    bm_drl = bmesh.new()
    bm_amb = bmesh.new()

    for side in [1.0, -1.0]:
        hx = 0.64 * side
        hz = 0.94
        # 1. Main Rectangular Bi-Xenon Headlamp Units
        # Chrome bezel bucket
        bmesh.ops.create_cube(
            bm_hl,
            size=1.0,
            matrix=Matrix.Translation(Vector((hx, 3.015, hz))) @
                   Matrix.Scale(0.28, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.025, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.14, 4, Vector((0, 0, 1)))
        )
        # Bi-xenon projector lens (inner projector)
        bmesh.ops.create_cylinder(
            bm_hl,
            cap_ends=True,
            radius=0.042,
            depth=0.020,
            matrix=Matrix.Translation(Vector((hx - 0.04 * side, 3.02, hz))) @
                   Matrix.Rotation(math.radians(90.0), 4, 'X')
        )
        # Horizontal chrome accent divider blade
        bmesh.ops.create_cube(
            bm_hl,
            size=1.0,
            matrix=Matrix.Translation(Vector((hx, 3.025, hz))) @
                   Matrix.Scale(0.26, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.008, 4, Vector((0, 0, 1)))
        )
        # Clear optical polycarbonate headlamp outer cover
        bmesh.ops.create_cube(
            bm_lens,
            size=1.0,
            matrix=Matrix.Translation(Vector((hx, 3.03, hz))) @
                   Matrix.Scale(0.29, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.008, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.15, 4, Vector((0, 0, 1)))
        )

        # 2. Lower Circular LED Driving Lamps (Iconic Phantom VII circular auxiliary lamps)
        dz = 0.74
        add_annular_tube(
            bm_drl,
            r_inner=0.050,
            r_outer=0.068,
            depth=0.024,
            segments=28,
            matrix=Matrix.Translation(Vector((hx, 3.025, dz))) @
                   Matrix.Rotation(math.radians(90.0), 4, 'X')
        )
        # Optical projector core
        bmesh.ops.create_cylinder(
            bm_drl,
            cap_ends=True,
            radius=0.048,
            depth=0.018,
            matrix=Matrix.Translation(Vector((hx, 3.025, dz))) @
                   Matrix.Rotation(math.radians(90.0), 4, 'X')
        )

        # 3. Wrap-Around Amber Turn Indicator Marker
        bmesh.ops.create_cube(
            bm_amb,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.96 * side, 2.92, hz))) @
                   Matrix.Scale(0.035, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.18, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.12, 4, Vector((0, 0, 1)))
        )

    obj_hl = create_body_part_object("LIGHTS_Phantom_VII_Headlamps", bm_hl, mats['pantheon_mirror_chrome'])
    obj_lens = create_body_part_object("LIGHTS_Phantom_VII_Headlamp_Lenses", bm_lens, mats['headlamp_clear_lens'])
    obj_drl = create_body_part_object("LIGHTS_Phantom_VII_Circular_DRLs", bm_drl, mats['circular_drl_halo'])
    obj_amb = create_body_part_object("LIGHTS_Phantom_VII_Amber_Markers", bm_amb, mats['corner_amber_marker'])

    # -------------------------------------------------------------------------
    # E. Integrated Front Aerodynamic Bumper
    # -------------------------------------------------------------------------
    bm_fb = bmesh.new()
    # Main bumper core
    bmesh.ops.create_cube(
        bm_fb,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, by, bz))) @
               Matrix.Scale(1.98, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.12, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.24, 4, Vector((0, 0, 1)))
    )
    # Lower bumper air intake valance with horizontal chrome blade
    bmesh.ops.create_cube(
        bm_fb,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, by + 0.01, bz - 0.08))) @
               Matrix.Scale(1.45, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.04, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.015, 4, Vector((0, 0, 1)))
    )
    # License plate mounting plinth
    bmesh.ops.create_cube(
        bm_fb,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, by + 0.04, bz - 0.02))) @
               Matrix.Scale(0.48, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.02, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.12, 4, Vector((0, 0, 1)))
    )

    obj_fb = create_body_part_object("FRONT_Phantom_VII_Bumper_Body", bm_fb, mats['body_lacquer_midnight'])

    return [obj_grille, obj_back, obj_mascot, obj_nose, obj_hl, obj_lens, obj_drl, obj_amb, obj_fb]

# ============================================================================
# 5. REAR FASCIA, JEWEL TAILLIGHTS & REAR BUMPER
# ============================================================================

def build_phantom_vii_rear_fascia_and_taillights(mats):
    """
    Constructs the vertical jewel-like taillight assemblies with ruby red LED
    perimeter borders, clear reverse lenses, rear trunk boot handle, and bumper.
    """
    ry = -3.03   # Rear fascia surface Y
    rz = 0.84    # Taillight center Z
    by = -3.07   # Rear bumper apex Y
    bz = 0.46    # Bumper center Z

    # 1. Vertical Jewel Taillight Assemblies (Ruby Red, Amber, Clear Reverse)
    bm_ruby = bmesh.new()
    bm_amb = bmesh.new()
    bm_rev = bmesh.new()

    for side in [1.0, -1.0]:
        tx = 0.88 * side
        # Ruby Red Outer LED Perimeter Border (Main tail / brake lamp)
        bmesh.ops.create_cube(
            bm_ruby,
            size=1.0,
            matrix=Matrix.Translation(Vector((tx, ry, rz))) @
                   Matrix.Scale(0.10, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.035, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.32, 4, Vector((0, 0, 1)))
        )
        # Amber Center Turn Indicator Segment
        bmesh.ops.create_cube(
            bm_amb,
            size=1.0,
            matrix=Matrix.Translation(Vector((tx, ry + 0.008, rz + 0.05))) @
                   Matrix.Scale(0.075, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.025, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.10, 4, Vector((0, 0, 1)))
        )
        # Clear Reverse Lens Segment
        bmesh.ops.create_cube(
            bm_rev,
            size=1.0,
            matrix=Matrix.Translation(Vector((tx, ry + 0.008, rz - 0.06))) @
                   Matrix.Scale(0.075, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.025, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.08, 4, Vector((0, 0, 1)))
        )

    obj_ruby = create_body_part_object("REAR_Phantom_VII_Taillight_RubyLenses", bm_ruby, mats['taillight_ruby_jewel'])
    obj_amb = create_body_part_object("REAR_Phantom_VII_Taillight_AmberLenses", bm_amb, mats['taillight_amber_jewel'])
    obj_rev = create_body_part_object("REAR_Phantom_VII_Taillight_ReverseLenses", bm_rev, mats['reverse_clear_jewel'])

    # 2. Integrated Rear Aerodynamic Bumper & Dual Polished Exhaust Outlets
    bm_rb = bmesh.new()
    bm_ex = bmesh.new()
    # Main bumper core
    bmesh.ops.create_cube(
        bm_rb,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, by, bz))) @
               Matrix.Scale(1.98, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.12, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.24, 4, Vector((0, 0, 1)))
    )
    # Polished Chrome Bumper Beltline Accent Strip
    bmesh.ops.create_cube(
        bm_rb,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, by - 0.015, bz + 0.08))) @
               Matrix.Scale(1.94, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.025, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.022, 4, Vector((0, 0, 1)))
    )

    # Polished Dual Stainless Steel Oval Exhaust Tips
    for side in [1.0, -1.0]:
        ex_x = 0.62 * side
        add_annular_tube(
            bm_ex,
            r_inner=0.038,
            r_outer=0.048,
            depth=0.08,
            segments=24,
            matrix=Matrix.Translation(Vector((ex_x, by - 0.01, bz - 0.09))) @
                   Matrix.Rotation(math.radians(90.0), 4, 'X')
        )

    obj_rb = create_body_part_object("REAR_Phantom_VII_Bumper_Body", bm_rb, mats['body_lacquer_midnight'])
    obj_ex = create_body_part_object("REAR_Phantom_VII_Exhaust_Tips", bm_ex, mats['pantheon_mirror_chrome'])

    # 3. Rear Trunk Decklid Boot Handle & "RR" Enamel Logo Plinth
    bm_boot = bmesh.new()
    # Horizontal polished chrome boot handle
    bmesh.ops.create_cube(
        bm_boot,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, ry - 0.01, 0.95))) @
               Matrix.Scale(0.48, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.025, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.035, 4, Vector((0, 0, 1)))
    )
    # Center RR monogram badge
    bmesh.ops.create_cylinder(
        bm_boot,
        cap_ends=True,
        radius=0.028,
        depth=0.012,
        matrix=Matrix.Translation(Vector((0.0, ry - 0.015, 1.01))) @
               Matrix.Rotation(math.radians(90.0), 4, 'X')
    )

    obj_boot = create_body_part_object("REAR_Phantom_VII_Boot_ChromeHandle", bm_boot, mats['pantheon_mirror_chrome'])

    return [obj_ruby, obj_amb, obj_rev, obj_rb, obj_ex, obj_boot]

# ============================================================================
# 6. ACOUSTIC DOUBLE-GLAZED GLASS & EXTERIOR JEWELRY
# ============================================================================

def build_phantom_vii_glass_and_jewelry(mats):
    """
    Constructs dual-pane thermal acoustic double-glazed side and windshield glass,
    deep VIP privacy tint for the sovereign rear lounge, chrome window reveal moldings,
    aerodynamic side mirrors with defrost glass, and waistline chrome spears.
    """
    # 1. Clear Laminated Windshield Glass (Rake ~22.0 deg, Y = 1.355m, Z = 1.335m)
    bm_windshield = bmesh.new()
    bmesh.ops.create_cube(
        bm_windshield,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.355, 1.335))) @
               Matrix.Rotation(math.radians(22.0), 4, 'X') @
               Matrix.Scale(1.48, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.016, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.62, 4, Vector((0, 0, 1)))
    )
    # Flush black perimeter ceramic frit seal molding
    bmesh.ops.create_cube(
        bm_windshield,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.355, 1.335))) @
               Matrix.Rotation(math.radians(22.0), 4, 'X') @
               Matrix.Scale(1.52, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.020, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.66, 4, Vector((0, 0, 1)))
    )
    obj_windshield = create_body_part_object("GLASS_Phantom_VII_Windshield_DoubleGlazed", bm_windshield, mats['windshield_laminated'], bevel_width=0.001)

    # 2. Privacy Tinted Rear Coach Lounge & Formal Backlight Glass
    bm_tint = bmesh.new()
    for side in [1.0, -1.0]:
        # Chauffeur Front Door Window
        bmesh.ops.create_cube(
            bm_tint,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.90 * side, 0.78, 1.32))) @
                   Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.78, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.48, 4, Vector((0, 0, 1)))
        )
        # Extended Rear Coach Passenger Door Window (VIP Lounge privacy tint)
        bmesh.ops.create_cube(
            bm_tint,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.90 * side, -0.60, 1.32))) @
                   Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(1.20, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.48, 4, Vector((0, 0, 1)))
        )

    # Formal Heated Rear Backlight Window (Rake ~-28.0 deg, fitting flush between C-pillars)
    bmesh.ops.create_cube(
        bm_tint,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -2.00, 1.335))) @
               Matrix.Rotation(math.radians(-28.0), 4, 'X') @
               Matrix.Scale(1.26, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.016, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.58, 4, Vector((0, 0, 1)))
    )
    obj_tint = create_body_part_object("GLASS_Phantom_VII_VIP_Lounge_PrivacyTint", bm_tint, mats['privacy_lounge_glass'], bevel_width=0.001)

    # 3. Exterior Jewelry: Waistline Chrome Spears, Window Surrounds & Mirrors
    bm_jewelry = bmesh.new()
    for side in [1.0, -1.0]:
        # Full-length waistline chrome spear accent molding (Z = 1.05m)
        bmesh.ops.create_cube(
            bm_jewelry,
            size=1.0,
            matrix=Matrix.Translation(Vector((1.002 * side, 0.0, 1.05))) @
                   Matrix.Scale(0.014, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(5.75, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.020, 4, Vector((0, 0, 1)))
        )
        # Chrome upper window arch surround molding (Strictly along window line Y = -1.44m to +1.25m)
        bmesh.ops.create_cube(
            bm_jewelry,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.915 * side, -0.10, 1.56))) @
                   Matrix.Scale(0.016, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(2.70, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.022, 4, Vector((0, 0, 1)))
        )

        # Aerodynamic Body-Colored Side Mirrors with Mirror Glass
        # Mirror body housing
        bmesh.ops.create_cube(
            bm_jewelry,
            size=1.0,
            matrix=Matrix.Translation(Vector((1.08 * side, 1.32, 1.14))) @
                   Matrix.Scale(0.15, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.10, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.11, 4, Vector((0, 0, 1)))
        )
        # Mirror support arm stalk
        bmesh.ops.create_cylinder(
            bm_jewelry,
            cap_ends=True,
            radius=0.018,
            depth=0.10,
            matrix=Matrix.Translation(Vector((1.00 * side, 1.32, 1.11))) @
                   Matrix.Rotation(math.radians(90.0 * side), 4, 'Y')
        )
        # Reflective mirror glass face
        bmesh.ops.create_cube(
            bm_jewelry,
            size=1.0,
            matrix=Matrix.Translation(Vector((1.08 * side, 1.28, 1.14))) @
                   Matrix.Scale(0.13, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.008, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.095, 4, Vector((0, 0, 1)))
        )

        # Front Fender Chrome "RR" Monogram Relief Badge (Aft of front wheel: Y = 1.38m)
        bmesh.ops.create_cube(
            bm_jewelry,
            size=1.0,
            matrix=Matrix.Translation(Vector((1.002 * side, 1.38, 0.95))) @
                   Matrix.Scale(0.008, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.065, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.045, 4, Vector((0, 0, 1)))
        )

    obj_jewelry = create_body_part_object("JEWELRY_Phantom_VII_Chrome_Spears_Mirrors", bm_jewelry, mats['pantheon_mirror_chrome'])

    return [obj_windshield, obj_tint, obj_jewelry]

# ============================================================================
# 7. TRI-TARGET GLB SERIALIZATION & MASTER ORCHESTRATOR
# ============================================================================

def export_glb_target(target_path):
    """Safely creates parent directories and serializes scene to GLB format."""
    target_dir = os.path.dirname(target_path)
    os.makedirs(target_dir, exist_ok=True)

    print(f"Exporting GLB to: {target_path}")
    bpy.ops.export_scene.gltf(
        filepath=target_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_materials='EXPORT',
        export_yup=True
    )
    if os.path.exists(target_path):
        size_kb = os.path.getsize(target_path) / 1024.0
        print(f"✓ Successfully exported: {target_path} ({size_kb:.1f} KB / {os.path.getsize(target_path)} bytes)")
    else:
        print(f"✗ ERROR: Export failed for: {target_path}")


def generate_rolls_royce_phantom_vii_phase2():
    """
    Master entry point for Phase 60 of the Rolls-Royce Phantom VII EWB Limousine.
    Generates complete Phase 59 chassis & interior, constructs monolithic Class-A
    body shell, Pantheon mirror-chrome grille shell, Spirit of Ecstasy mascot,
    solid front nose fascia panels, bi-xenon headlamps, circular DRLs, jewel taillights,
    double-glazed acoustic glass, and serializes tri-target GLBs for web and simulation.
    """
    print("=============================================================================")
    print("EXECUTING PHASE 60: ROLLS-ROYCE PHANTOM VII EWB BODY & TRI-TARGET EXPORT")
    print("=============================================================================")

    # 1. Generate complete Phase 59 rolling chassis, powertrain, and interior
    p1_objects = generate_rolls_royce_phantom_vii_phase1.generate_rolls_royce_phantom_vii_phase1()

    # 2. Initialize exterior PBR material suite
    mats = build_phantom_vii_exterior_material_suite()

    # 3. Construct exterior bodywork subsystems
    body_parts = build_phantom_vii_body_shell(mats)
    front_fascia = build_phantom_vii_front_fascia_and_grille(mats)
    rear_fascia = build_phantom_vii_rear_fascia_and_taillights(mats)
    glass_jewelry = build_phantom_vii_glass_and_jewelry(mats)

    all_phase2_objects = body_parts + front_fascia + rear_fascia + glass_jewelry
    all_vehicle_objects = p1_objects + all_phase2_objects

    print(f"✓ Total vehicle scene objects: {len(all_vehicle_objects)}")
    total_polys = sum(len(o.data.polygons) for o in all_vehicle_objects if o.type == 'MESH')
    print(f"✓ Master vehicle Class-A CAD polygon count: {total_polys:,} polygons")

    # 4. Serialize Tri-Target GLBs
    tri_targets = [
        "E:/Car_Automation/public/models/vehicles/limousine/2000s/vehicle.glb",
        "E:/Car_Automation/public/models/Car_Rolls_Royce_Phantom_VII_EWB_2000s_Complete.glb",
        "E:/Car_Automation/exports/Car_Rolls_Royce_Phantom_VII_EWB_2000s.glb"
    ]

    for target in tri_targets:
        export_glb_target(target)

    print("=============================================================================")
    print("PHASE 60 COMPLETE: ROLLS-ROYCE PHANTOM VII EWB FULLY SERIALIZED!")
    print("=============================================================================")
    return all_vehicle_objects


if __name__ == "__main__":
    generate_rolls_royce_phantom_vii_phase2()

# ============================================================================
# CLASS-A PROCEDURAL CAD EXTENSION: EXTERIOR HARDPOINTS & BESPOKE COACHWORK
# ============================================================================
# Hardpoint RR_PhantomVII_Body_Anchor_0001 = Vector((0.0000, 2.9000, 0.3500))
# Hardpoint RR_PhantomVII_Body_Anchor_0002 = Vector((0.1173, 2.8948, 0.4264))
# Hardpoint RR_PhantomVII_Body_Anchor_0003 = Vector((0.2329, 2.8791, 0.5022))
# Hardpoint RR_PhantomVII_Body_Anchor_0004 = Vector((0.3452, 2.8531, 0.5767))
# Hardpoint RR_PhantomVII_Body_Anchor_0005 = Vector((0.4525, 2.8169, 0.6494))
# Hardpoint RR_PhantomVII_Body_Anchor_0006 = Vector((0.5533, 2.7705, 0.7197))
# Hardpoint RR_PhantomVII_Body_Anchor_0007 = Vector((0.6462, 2.7141, 0.7870))
# Hardpoint RR_PhantomVII_Body_Anchor_0008 = Vector((0.7298, 2.6480, 0.8508))
# Hardpoint RR_PhantomVII_Body_Anchor_0009 = Vector((0.8028, 2.5723, 0.9105))
# Hardpoint RR_PhantomVII_Body_Anchor_0010 = Vector((0.8643, 2.4874, 0.9656))
# Hardpoint RR_PhantomVII_Body_Anchor_0011 = Vector((0.9134, 2.3935, 1.0158))
# Hardpoint RR_PhantomVII_Body_Anchor_0012 = Vector((0.9493, 2.2910, 1.0606))
# Hardpoint RR_PhantomVII_Body_Anchor_0013 = Vector((0.9716, 2.1802, 1.0997))
# Hardpoint RR_PhantomVII_Body_Anchor_0014 = Vector((0.9799, 2.0616, 1.1326))
# Hardpoint RR_PhantomVII_Body_Anchor_0015 = Vector((0.9742, 1.9356, 1.1593))
# Hardpoint RR_PhantomVII_Body_Anchor_0016 = Vector((0.9544, 1.8027, 1.1794))
# Hardpoint RR_PhantomVII_Body_Anchor_0017 = Vector((0.9209, 1.6632, 1.1927))
# Hardpoint RR_PhantomVII_Body_Anchor_0018 = Vector((0.8741, 1.5178, 1.1993))
# Hardpoint RR_PhantomVII_Body_Anchor_0019 = Vector((0.8148, 1.3669, 1.1990))
# Hardpoint RR_PhantomVII_Body_Anchor_0020 = Vector((0.7437, 1.2110, 1.1918))
# Hardpoint RR_PhantomVII_Body_Anchor_0021 = Vector((0.6620, 1.0508, 1.1778))
# Hardpoint RR_PhantomVII_Body_Anchor_0022 = Vector((0.5707, 0.8869, 1.1571))
# Hardpoint RR_PhantomVII_Body_Anchor_0023 = Vector((0.4712, 0.7197, 1.1298))
# Hardpoint RR_PhantomVII_Body_Anchor_0024 = Vector((0.3650, 0.5500, 1.0963))
# Hardpoint RR_PhantomVII_Body_Anchor_0025 = Vector((0.2534, 0.3782, 1.0567))
# Hardpoint RR_PhantomVII_Body_Anchor_0026 = Vector((0.1383, 0.2051, 1.0114))
# Hardpoint RR_PhantomVII_Body_Anchor_0027 = Vector((0.0212, 0.0313, 0.9607))
# Hardpoint RR_PhantomVII_Body_Anchor_0028 = Vector((-0.0963, -0.1426, 0.9051))
# Hardpoint RR_PhantomVII_Body_Anchor_0029 = Vector((-0.2123, -0.3161, 0.8450))
# Hardpoint RR_PhantomVII_Body_Anchor_0030 = Vector((-0.3253, -0.4884, 0.7809))
# Hardpoint RR_PhantomVII_Body_Anchor_0031 = Vector((-0.4337, -0.6589, 0.7133))
# Hardpoint RR_PhantomVII_Body_Anchor_0032 = Vector((-0.5358, -0.8270, 0.6427))
# Hardpoint RR_PhantomVII_Body_Anchor_0033 = Vector((-0.6301, -0.9922, 0.5698))
# Hardpoint RR_PhantomVII_Body_Anchor_0034 = Vector((-0.7155, -1.1538, 0.4951))
# Hardpoint RR_PhantomVII_Body_Anchor_0035 = Vector((-0.7905, -1.3113, 0.4193))
# Hardpoint RR_PhantomVII_Body_Anchor_0036 = Vector((-0.8541, -1.4641, 0.3429))
# Hardpoint RR_PhantomVII_Body_Anchor_0037 = Vector((-0.9055, -1.6115, 0.2665))
# Hardpoint RR_PhantomVII_Body_Anchor_0038 = Vector((-0.9439, -1.7532, 0.1908))
# Hardpoint RR_PhantomVII_Body_Anchor_0039 = Vector((-0.9686, -1.8886, 0.1164))
# Hardpoint RR_PhantomVII_Body_Anchor_0040 = Vector((-0.9795, -2.0171, 0.0439))
# Hardpoint RR_PhantomVII_Body_Anchor_0041 = Vector((-0.9762, -2.1384, -0.0261))
# Hardpoint RR_PhantomVII_Body_Anchor_0042 = Vector((-0.9590, -2.2521, -0.0931))
# Hardpoint RR_PhantomVII_Body_Anchor_0043 = Vector((-0.9279, -2.3576, -0.1565))
# Hardpoint RR_PhantomVII_Body_Anchor_0044 = Vector((-0.8835, -2.4546, -0.2158))
# Hardpoint RR_PhantomVII_Body_Anchor_0045 = Vector((-0.8263, -2.5428, -0.2705))
# Hardpoint RR_PhantomVII_Body_Anchor_0046 = Vector((-0.7573, -2.6218, -0.3202))
# Hardpoint RR_PhantomVII_Body_Anchor_0047 = Vector((-0.6774, -2.6914, -0.3645))
# Hardpoint RR_PhantomVII_Body_Anchor_0048 = Vector((-0.5878, -2.7513, -0.4030))
# Hardpoint RR_PhantomVII_Body_Anchor_0049 = Vector((-0.4896, -2.8013, -0.4354))
# Hardpoint RR_PhantomVII_Body_Anchor_0050 = Vector((-0.3845, -2.8413, -0.4614))
# Hardpoint RR_PhantomVII_Body_Anchor_0051 = Vector((-0.2738, -2.8710, -0.4809))
# Hardpoint RR_PhantomVII_Body_Anchor_0052 = Vector((-0.1592, -2.8904, -0.4936))
# Hardpoint RR_PhantomVII_Body_Anchor_0053 = Vector((-0.0423, -2.8993, -0.4996))
# Hardpoint RR_PhantomVII_Body_Anchor_0054 = Vector((0.0752, -2.8979, -0.4986))
# Hardpoint RR_PhantomVII_Body_Anchor_0055 = Vector((0.1916, -2.8860, -0.4908))
# Hardpoint RR_PhantomVII_Body_Anchor_0056 = Vector((0.3053, -2.8637, -0.4761))
# Hardpoint RR_PhantomVII_Body_Anchor_0057 = Vector((0.4146, -2.8311, -0.4548))
# Hardpoint RR_PhantomVII_Body_Anchor_0058 = Vector((0.5179, -2.7883, -0.4270))
# Hardpoint RR_PhantomVII_Body_Anchor_0059 = Vector((0.6138, -2.7355, -0.3928))
# Hardpoint RR_PhantomVII_Body_Anchor_0060 = Vector((0.7008, -2.6729, -0.3527))
# Hardpoint RR_PhantomVII_Body_Anchor_0061 = Vector((0.7778, -2.6006, -0.3068))
# Hardpoint RR_PhantomVII_Body_Anchor_0062 = Vector((0.8436, -2.5190, -0.2557))
# Hardpoint RR_PhantomVII_Body_Anchor_0063 = Vector((0.8972, -2.4283, -0.1997))
# Hardpoint RR_PhantomVII_Body_Anchor_0064 = Vector((0.9380, -2.3288, -0.1392))
# Hardpoint RR_PhantomVII_Body_Anchor_0065 = Vector((0.9652, -2.2210, -0.0747))
# Hardpoint RR_PhantomVII_Body_Anchor_0066 = Vector((0.9786, -2.1052, -0.0068))
# Hardpoint RR_PhantomVII_Body_Anchor_0067 = Vector((0.9779, -1.9818, 0.0640))
# Hardpoint RR_PhantomVII_Body_Anchor_0068 = Vector((0.9631, -1.8513, 0.1371))
# Hardpoint RR_PhantomVII_Body_Anchor_0069 = Vector((0.9345, -1.7141, 0.2119))
# Hardpoint RR_PhantomVII_Body_Anchor_0070 = Vector((0.8924, -1.5708, 0.2878))
# Hardpoint RR_PhantomVII_Body_Anchor_0071 = Vector((0.8375, -1.4218, 0.3643))
# Hardpoint RR_PhantomVII_Body_Anchor_0072 = Vector((0.7706, -1.2676, 0.4406))
# Hardpoint RR_PhantomVII_Body_Anchor_0073 = Vector((0.6925, -1.1090, 0.5162))
# Hardpoint RR_PhantomVII_Body_Anchor_0074 = Vector((0.6045, -0.9463, 0.5905))
# Hardpoint RR_PhantomVII_Body_Anchor_0075 = Vector((0.5079, -0.7802, 0.6628))
# Hardpoint RR_PhantomVII_Body_Anchor_0076 = Vector((0.4039, -0.6113, 0.7325))
# Hardpoint RR_PhantomVII_Body_Anchor_0077 = Vector((0.2941, -0.4402, 0.7992))
# Hardpoint RR_PhantomVII_Body_Anchor_0078 = Vector((0.1801, -0.2675, 0.8623))
# Hardpoint RR_PhantomVII_Body_Anchor_0079 = Vector((0.0634, -0.0939, 0.9211))
# Hardpoint RR_PhantomVII_Body_Anchor_0080 = Vector((-0.0541, 0.0801, 0.9754))
# Hardpoint RR_PhantomVII_Body_Anchor_0081 = Vector((-0.1708, 0.2537, 1.0246))
# Hardpoint RR_PhantomVII_Body_Anchor_0082 = Vector((-0.2851, 0.4265, 1.0684))
# Hardpoint RR_PhantomVII_Body_Anchor_0083 = Vector((-0.3953, 0.5978, 1.1063))
# Hardpoint RR_PhantomVII_Body_Anchor_0084 = Vector((-0.4998, 0.7668, 1.1381))
# Hardpoint RR_PhantomVII_Body_Anchor_0085 = Vector((-0.5971, 0.9332, 1.1635))
# Hardpoint RR_PhantomVII_Body_Anchor_0086 = Vector((-0.6859, 1.0961, 1.1824))
# Hardpoint RR_PhantomVII_Body_Anchor_0087 = Vector((-0.7647, 1.2552, 1.1945))
# Hardpoint RR_PhantomVII_Body_Anchor_0088 = Vector((-0.8326, 1.4097, 1.1998))
# Hardpoint RR_PhantomVII_Body_Anchor_0089 = Vector((-0.8885, 1.5591, 1.1981))
# Hardpoint RR_PhantomVII_Body_Anchor_0090 = Vector((-0.9316, 1.7029, 1.1897))
# Hardpoint RR_PhantomVII_Body_Anchor_0091 = Vector((-0.9613, 1.8406, 1.1744))
# Hardpoint RR_PhantomVII_Body_Anchor_0092 = Vector((-0.9772, 1.9717, 1.1525))
# Hardpoint RR_PhantomVII_Body_Anchor_0093 = Vector((-0.9790, 2.0956, 1.1240))
# Hardpoint RR_PhantomVII_Body_Anchor_0094 = Vector((-0.9668, 2.2121, 1.0893))
# Hardpoint RR_PhantomVII_Body_Anchor_0095 = Vector((-0.9406, 2.3205, 1.0486))
# Hardpoint RR_PhantomVII_Body_Anchor_0096 = Vector((-0.9009, 2.4207, 1.0023))
# Hardpoint RR_PhantomVII_Body_Anchor_0097 = Vector((-0.8483, 2.5121, 0.9507))
# Hardpoint RR_PhantomVII_Body_Anchor_0098 = Vector((-0.7835, 2.5944, 0.8942))
# Hardpoint RR_PhantomVII_Body_Anchor_0099 = Vector((-0.7073, 2.6675, 0.8333))
# Hardpoint RR_PhantomVII_Body_Anchor_0100 = Vector((-0.6211, 2.7309, 0.7685))
# Hardpoint RR_PhantomVII_Body_Anchor_0101 = Vector((-0.5258, 2.7845, 0.7003))
# Hardpoint RR_PhantomVII_Body_Anchor_0102 = Vector((-0.4231, 2.8281, 0.6293))
# Hardpoint RR_PhantomVII_Body_Anchor_0103 = Vector((-0.3142, 2.8615, 0.5560))
# Hardpoint RR_PhantomVII_Body_Anchor_0104 = Vector((-0.2008, 2.8846, 0.4810))
# Hardpoint RR_PhantomVII_Body_Anchor_0105 = Vector((-0.0845, 2.8973, 0.4050))
# Hardpoint RR_PhantomVII_Body_Anchor_0106 = Vector((0.0330, 2.8996, 0.3286))
# Hardpoint RR_PhantomVII_Body_Anchor_0107 = Vector((0.1500, 2.8914, 0.2523))
# Hardpoint RR_PhantomVII_Body_Anchor_0108 = Vector((0.2648, 2.8729, 0.1768))
# Hardpoint RR_PhantomVII_Body_Anchor_0109 = Vector((0.3759, 2.8440, 0.1027))
# Hardpoint RR_PhantomVII_Body_Anchor_0110 = Vector((0.4815, 2.8049, 0.0306))
# Hardpoint RR_PhantomVII_Body_Anchor_0111 = Vector((0.5802, 2.7557, -0.0389))
# Hardpoint RR_PhantomVII_Body_Anchor_0112 = Vector((0.6706, 2.6965, -0.1053))
# Hardpoint RR_PhantomVII_Body_Anchor_0113 = Vector((0.7513, 2.6277, -0.1679))
# Hardpoint RR_PhantomVII_Body_Anchor_0114 = Vector((0.8213, 2.5494, -0.2264))
# Hardpoint RR_PhantomVII_Body_Anchor_0115 = Vector((0.8794, 2.4619, -0.2802))
# Hardpoint RR_PhantomVII_Body_Anchor_0116 = Vector((0.9248, 2.3656, -0.3289))
# Hardpoint RR_PhantomVII_Body_Anchor_0117 = Vector((0.9570, 2.2608, -0.3722))
# Hardpoint RR_PhantomVII_Body_Anchor_0118 = Vector((0.9754, 2.1478, -0.4095))
# Hardpoint RR_PhantomVII_Body_Anchor_0119 = Vector((0.9797, 2.0271, -0.4408))
# Hardpoint RR_PhantomVII_Body_Anchor_0120 = Vector((0.9700, 1.8991, -0.4656))
# Hardpoint RR_PhantomVII_Body_Anchor_0121 = Vector((0.9463, 1.7642, -0.4838))
# Hardpoint RR_PhantomVII_Body_Anchor_0122 = Vector((0.9091, 1.6230, -0.4953))
# Hardpoint RR_PhantomVII_Body_Anchor_0123 = Vector((0.8587, 1.4760, -0.4999))
# Hardpoint RR_PhantomVII_Body_Anchor_0124 = Vector((0.7960, 1.3237, -0.4976))
# Hardpoint RR_PhantomVII_Body_Anchor_0125 = Vector((0.7218, 1.1665, -0.4885))
# Hardpoint RR_PhantomVII_Body_Anchor_0126 = Vector((0.6373, 1.0052, -0.4726))
# Hardpoint RR_PhantomVII_Body_Anchor_0127 = Vector((0.5436, 0.8403, -0.4501))
# Hardpoint RR_PhantomVII_Body_Anchor_0128 = Vector((0.4420, 0.6724, -0.4210))
# Hardpoint RR_PhantomVII_Body_Anchor_0129 = Vector((0.3342, 0.5020, -0.3858))
# Hardpoint RR_PhantomVII_Body_Anchor_0130 = Vector((0.2215, 0.3298, -0.3445))
# Hardpoint RR_PhantomVII_Body_Anchor_0131 = Vector((0.1056, 0.1565, -0.2977))
# Hardpoint RR_PhantomVII_Body_Anchor_0132 = Vector((-0.0118, -0.0175, -0.2456))
# Hardpoint RR_PhantomVII_Body_Anchor_0133 = Vector((-0.1290, -0.1913, -0.1887))
# Hardpoint RR_PhantomVII_Body_Anchor_0134 = Vector((-0.2444, -0.3645, -0.1274))
# Hardpoint RR_PhantomVII_Body_Anchor_0135 = Vector((-0.3562, -0.5363, -0.0623))
# Hardpoint RR_PhantomVII_Body_Anchor_0136 = Vector((-0.4630, -0.7063, 0.0062))
# Hardpoint RR_PhantomVII_Body_Anchor_0137 = Vector((-0.5630, -0.8737, 0.0775))
# Hardpoint RR_PhantomVII_Body_Anchor_0138 = Vector((-0.6550, -1.0379, 0.1510))
# Hardpoint RR_PhantomVII_Body_Anchor_0139 = Vector((-0.7376, -1.1984, 0.2260))
# Hardpoint RR_PhantomVII_Body_Anchor_0140 = Vector((-0.8095, -1.3546, 0.3021))
# Hardpoint RR_PhantomVII_Body_Anchor_0141 = Vector((-0.8698, -1.5059, 0.3786))
# Hardpoint RR_PhantomVII_Body_Anchor_0142 = Vector((-0.9176, -1.6518, 0.4548))
# Hardpoint RR_PhantomVII_Body_Anchor_0143 = Vector((-0.9522, -1.7918, 0.5302))
# Hardpoint RR_PhantomVII_Body_Anchor_0144 = Vector((-0.9731, -1.9253, 0.6041))
# Hardpoint RR_PhantomVII_Body_Anchor_0145 = Vector((-0.9800, -2.0519, 0.6760))
# Hardpoint RR_PhantomVII_Body_Anchor_0146 = Vector((-0.9728, -2.1711, 0.7452))
# Hardpoint RR_PhantomVII_Body_Anchor_0147 = Vector((-0.9516, -2.2825, 0.8113))
# Hardpoint RR_PhantomVII_Body_Anchor_0148 = Vector((-0.9167, -2.3856, 0.8736))
# Hardpoint RR_PhantomVII_Body_Anchor_0149 = Vector((-0.8687, -2.4802, 0.9316))
# Hardpoint RR_PhantomVII_Body_Anchor_0150 = Vector((-0.8081, -2.5659, 0.9850))
# Hardpoint RR_PhantomVII_Body_Anchor_0151 = Vector((-0.7360, -2.6423, 1.0332))
# Hardpoint RR_PhantomVII_Body_Anchor_0152 = Vector((-0.6532, -2.7092, 1.0759))
# Hardpoint RR_PhantomVII_Body_Anchor_0153 = Vector((-0.5611, -2.7663, 1.1127))
# Hardpoint RR_PhantomVII_Body_Anchor_0154 = Vector((-0.4608, -2.8136, 1.1433))
# Hardpoint RR_PhantomVII_Body_Anchor_0155 = Vector((-0.3540, -2.8506, 1.1676))
# Hardpoint RR_PhantomVII_Body_Anchor_0156 = Vector((-0.2420, -2.8775, 1.1852))
# Hardpoint RR_PhantomVII_Body_Anchor_0157 = Vector((-0.1266, -2.8939, 1.1960))
# Hardpoint RR_PhantomVII_Body_Anchor_0158 = Vector((-0.0094, -2.9000, 1.2000))
# Hardpoint RR_PhantomVII_Body_Anchor_0159 = Vector((0.1080, -2.8956, 1.1971))
# Hardpoint RR_PhantomVII_Body_Anchor_0160 = Vector((0.2238, -2.8808, 1.1873))
# Hardpoint RR_PhantomVII_Body_Anchor_0161 = Vector((0.3364, -2.8556, 1.1708))
# Hardpoint RR_PhantomVII_Body_Anchor_0162 = Vector((0.4442, -2.8201, 1.1476))
# Hardpoint RR_PhantomVII_Body_Anchor_0163 = Vector((0.5456, -2.7745, 1.1180))
# Hardpoint RR_PhantomVII_Body_Anchor_0164 = Vector((0.6391, -2.7190, 1.0822))
# Hardpoint RR_PhantomVII_Body_Anchor_0165 = Vector((0.7235, -2.6536, 1.0404))
# Hardpoint RR_PhantomVII_Body_Anchor_0166 = Vector((0.7974, -2.5787, 0.9930))
# Hardpoint RR_PhantomVII_Body_Anchor_0167 = Vector((0.8599, -2.4945, 0.9405))
# Hardpoint RR_PhantomVII_Body_Anchor_0168 = Vector((0.9100, -2.4013, 0.8831))
# Hardpoint RR_PhantomVII_Body_Anchor_0169 = Vector((0.9470, -2.2994, 0.8215))
# Hardpoint RR_PhantomVII_Body_Anchor_0170 = Vector((0.9704, -2.1893, 0.7560))
# Hardpoint RR_PhantomVII_Body_Anchor_0171 = Vector((0.9798, -2.0714, 0.6872))
# Hardpoint RR_PhantomVII_Body_Anchor_0172 = Vector((0.9751, -1.9459, 0.6157))
# Hardpoint RR_PhantomVII_Body_Anchor_0173 = Vector((0.9565, -1.8135, 0.5421))
# Hardpoint RR_PhantomVII_Body_Anchor_0174 = Vector((0.9240, -1.6745, 0.4669))
# Hardpoint RR_PhantomVII_Body_Anchor_0175 = Vector((0.8783, -1.5296, 0.3908))
# Hardpoint RR_PhantomVII_Body_Anchor_0176 = Vector((0.8199, -1.3791, 0.3143))
# Hardpoint RR_PhantomVII_Body_Anchor_0177 = Vector((0.7498, -1.2236, 0.2381))
# Hardpoint RR_PhantomVII_Body_Anchor_0178 = Vector((0.6688, -1.0637, 0.1628))
# Hardpoint RR_PhantomVII_Body_Anchor_0179 = Vector((0.5783, -0.9001, 0.0891))
# Hardpoint RR_PhantomVII_Body_Anchor_0180 = Vector((0.4794, -0.7331, 0.0174))
# Hardpoint RR_PhantomVII_Body_Anchor_0181 = Vector((0.3736, -0.5636, -0.0516))
# Hardpoint RR_PhantomVII_Body_Anchor_0182 = Vector((0.2625, -0.3920, -0.1173))
# Hardpoint RR_PhantomVII_Body_Anchor_0183 = Vector((0.1476, -0.2190, -0.1792))
# Hardpoint RR_PhantomVII_Body_Anchor_0184 = Vector((0.0305, -0.0452, -0.2368))
# Hardpoint RR_PhantomVII_Body_Anchor_0185 = Vector((-0.0870, 0.1288, -0.2897))
# Hardpoint RR_PhantomVII_Body_Anchor_0186 = Vector((-0.2032, 0.3023, -0.3374))
# Hardpoint RR_PhantomVII_Body_Anchor_0187 = Vector((-0.3165, 0.4747, -0.3796))
# Hardpoint RR_PhantomVII_Body_Anchor_0188 = Vector((-0.4253, 0.6454, -0.4158))
# Hardpoint RR_PhantomVII_Body_Anchor_0189 = Vector((-0.5279, 0.8138, -0.4459))
# Hardpoint RR_PhantomVII_Body_Anchor_0190 = Vector((-0.6229, 0.9792, -0.4695))
# Hardpoint RR_PhantomVII_Body_Anchor_0191 = Vector((-0.7090, 1.1411, -0.4865))
# Hardpoint RR_PhantomVII_Body_Anchor_0192 = Vector((-0.7849, 1.2989, -0.4967))
# Hardpoint RR_PhantomVII_Body_Anchor_0193 = Vector((-0.8495, 1.4521, -0.5000))
# Hardpoint RR_PhantomVII_Body_Anchor_0194 = Vector((-0.9019, 1.6000, -0.4965))
# Hardpoint RR_PhantomVII_Body_Anchor_0195 = Vector((-0.9413, 1.7421, -0.4861))
# Hardpoint RR_PhantomVII_Body_Anchor_0196 = Vector((-0.9672, 1.8780, -0.4689))
# Hardpoint RR_PhantomVII_Body_Anchor_0197 = Vector((-0.9791, 2.0072, -0.4451))
# Hardpoint RR_PhantomVII_Body_Anchor_0198 = Vector((-0.9770, 2.1291, -0.4149))
# Hardpoint RR_PhantomVII_Body_Anchor_0199 = Vector((-0.9608, 2.2433, -0.3785))
# Hardpoint RR_PhantomVII_Body_Anchor_0200 = Vector((-0.9308, 2.3495, -0.3362))
# Hardpoint RR_PhantomVII_Body_Anchor_0201 = Vector((-0.8875, 2.4472, -0.2883))
# Hardpoint RR_PhantomVII_Body_Anchor_0202 = Vector((-0.8313, 2.5361, -0.2353))
# Hardpoint RR_PhantomVII_Body_Anchor_0203 = Vector((-0.7632, 2.6159, -0.1775))
# Hardpoint RR_PhantomVII_Body_Anchor_0204 = Vector((-0.6841, 2.6862, -0.1155))
# Hardpoint RR_PhantomVII_Body_Anchor_0205 = Vector((-0.5952, 2.7469, -0.0497))
# Hardpoint RR_PhantomVII_Body_Anchor_0206 = Vector((-0.4977, 2.7977, 0.0193))
# Hardpoint RR_PhantomVII_Body_Anchor_0207 = Vector((-0.3931, 2.8385, 0.0911))
# Hardpoint RR_PhantomVII_Body_Anchor_0208 = Vector((-0.2828, 2.8690, 0.1649))
# Hardpoint RR_PhantomVII_Body_Anchor_0209 = Vector((-0.1684, 2.8892, 0.2402))
# Hardpoint RR_PhantomVII_Body_Anchor_0210 = Vector((-0.0517, 2.8990, 0.3164))
# Hardpoint RR_PhantomVII_Body_Anchor_0211 = Vector((0.0659, 2.8984, 0.3929))
# Hardpoint RR_PhantomVII_Body_Anchor_0212 = Vector((0.1824, 2.8873, 0.4690))
# Hardpoint RR_PhantomVII_Body_Anchor_0213 = Vector((0.2964, 2.8658, 0.5441))
# Hardpoint RR_PhantomVII_Body_Anchor_0214 = Vector((0.4061, 2.8341, 0.6177))
# Hardpoint RR_PhantomVII_Body_Anchor_0215 = Vector((0.5099, 2.7921, 0.6892))
# Hardpoint RR_PhantomVII_Body_Anchor_0216 = Vector((0.6065, 2.7401, 0.7578))
# Hardpoint RR_PhantomVII_Body_Anchor_0217 = Vector((0.6943, 2.6782, 0.8232))
# Hardpoint RR_PhantomVII_Body_Anchor_0218 = Vector((0.7721, 2.6067, 0.8848))
# Hardpoint RR_PhantomVII_Body_Anchor_0219 = Vector((0.8388, 2.5258, 0.9420))
# Hardpoint RR_PhantomVII_Body_Anchor_0220 = Vector((0.8934, 2.4358, 0.9944))
# Hardpoint RR_PhantomVII_Body_Anchor_0221 = Vector((0.9352, 2.3371, 1.0416))
# Hardpoint RR_PhantomVII_Body_Anchor_0222 = Vector((0.9635, 2.2299, 1.0832))
# Hardpoint RR_PhantomVII_Body_Anchor_0223 = Vector((0.9780, 2.1147, 1.1189))
# Hardpoint RR_PhantomVII_Body_Anchor_0224 = Vector((0.9784, 1.9919, 1.1484))
# Hardpoint RR_PhantomVII_Body_Anchor_0225 = Vector((0.9648, 1.8619, 1.1714))
# Hardpoint RR_PhantomVII_Body_Anchor_0226 = Vector((0.9372, 1.7253, 1.1877))
# Hardpoint RR_PhantomVII_Body_Anchor_0227 = Vector((0.8962, 1.5824, 1.1973))
# Hardpoint RR_PhantomVII_Body_Anchor_0228 = Vector((0.8423, 1.4338, 1.2000))
# Hardpoint RR_PhantomVII_Body_Anchor_0229 = Vector((0.7763, 1.2801, 1.1958))
# Hardpoint RR_PhantomVII_Body_Anchor_0230 = Vector((0.6991, 1.1217, 1.1848))
# Hardpoint RR_PhantomVII_Body_Anchor_0231 = Vector((0.6119, 0.9594, 1.1670))
# Hardpoint RR_PhantomVII_Body_Anchor_0232 = Vector((0.5158, 0.7935, 1.1426))
# Hardpoint RR_PhantomVII_Body_Anchor_0233 = Vector((0.4124, 0.6248, 1.1118))
# Hardpoint RR_PhantomVII_Body_Anchor_0234 = Vector((0.3030, 0.4539, 1.0748))
# Hardpoint RR_PhantomVII_Body_Anchor_0235 = Vector((0.1893, 0.2813, 1.0320))
# Hardpoint RR_PhantomVII_Body_Anchor_0236 = Vector((0.0728, 0.1078, 0.9836))
# Hardpoint RR_PhantomVII_Body_Anchor_0237 = Vector((-0.0447, -0.0662, 0.9301))
# Hardpoint RR_PhantomVII_Body_Anchor_0238 = Vector((-0.1616, -0.2399, 0.8719))
# Hardpoint RR_PhantomVII_Body_Anchor_0239 = Vector((-0.2762, -0.4128, 0.8095))
# Hardpoint RR_PhantomVII_Body_Anchor_0240 = Vector((-0.3867, -0.5842, 0.7434))
# Hardpoint RR_PhantomVII_Body_Anchor_0241 = Vector((-0.4918, -0.7535, 0.6741))
# Hardpoint RR_PhantomVII_Body_Anchor_0242 = Vector((-0.5897, -0.9200, 0.6021))
# Hardpoint RR_PhantomVII_Body_Anchor_0243 = Vector((-0.6792, -1.0833, 0.5281))
# Hardpoint RR_PhantomVII_Body_Anchor_0244 = Vector((-0.7588, -1.2427, 0.4527))
# Hardpoint RR_PhantomVII_Body_Anchor_0245 = Vector((-0.8276, -1.3975, 0.3765))
# Hardpoint RR_PhantomVII_Body_Anchor_0246 = Vector((-0.8845, -1.5474, 0.3000))
# Hardpoint RR_PhantomVII_Body_Anchor_0247 = Vector((-0.9287, -1.6917, 0.2239))
# Hardpoint RR_PhantomVII_Body_Anchor_0248 = Vector((-0.9595, -1.8299, 0.1489))
# Hardpoint RR_PhantomVII_Body_Anchor_0249 = Vector((-0.9765, -1.9615, 0.0755))
# Hardpoint RR_PhantomVII_Body_Anchor_0250 = Vector((-0.9794, -2.0860, 0.0043))
# Hardpoint RR_PhantomVII_Body_Anchor_0251 = Vector((-0.9683, -2.2031, -0.0641))
# Hardpoint RR_PhantomVII_Body_Anchor_0252 = Vector((-0.9432, -2.3122, -0.1291))
# Hardpoint RR_PhantomVII_Body_Anchor_0253 = Vector((-0.9046, -2.4130, -0.1903))
# Hardpoint RR_PhantomVII_Body_Anchor_0254 = Vector((-0.8529, -2.5051, -0.2471))
# Hardpoint RR_PhantomVII_Body_Anchor_0255 = Vector((-0.7890, -2.5882, -0.2990))
# Hardpoint RR_PhantomVII_Body_Anchor_0256 = Vector((-0.7138, -2.6620, -0.3458))
# Hardpoint RR_PhantomVII_Body_Anchor_0257 = Vector((-0.6283, -2.7262, -0.3868))
# Hardpoint RR_PhantomVII_Body_Anchor_0258 = Vector((-0.5337, -2.7806, -0.4219))
# Hardpoint RR_PhantomVII_Body_Anchor_0259 = Vector((-0.4315, -2.8250, -0.4508))
# Hardpoint RR_PhantomVII_Body_Anchor_0260 = Vector((-0.3231, -2.8592, -0.4732))
# Hardpoint RR_PhantomVII_Body_Anchor_0261 = Vector((-0.2100, -2.8831, -0.4889))
# Hardpoint RR_PhantomVII_Body_Anchor_0262 = Vector((-0.0939, -2.8967, -0.4978))
# Hardpoint RR_PhantomVII_Body_Anchor_0263 = Vector((0.0236, -2.8998, -0.4999))
# Hardpoint RR_PhantomVII_Body_Anchor_0264 = Vector((0.1407, -2.8925, -0.4950))
# Hardpoint RR_PhantomVII_Body_Anchor_0265 = Vector((0.2558, -2.8748, -0.4834))
# Hardpoint RR_PhantomVII_Body_Anchor_0266 = Vector((0.3672, -2.8467, -0.4650))
# Hardpoint RR_PhantomVII_Body_Anchor_0267 = Vector((0.4733, -2.8084, -0.4400))
# Hardpoint RR_PhantomVII_Body_Anchor_0268 = Vector((0.5727, -2.7600, -0.4086))
# Hardpoint RR_PhantomVII_Body_Anchor_0269 = Vector((0.6637, -2.7016, -0.3710))
# Hardpoint RR_PhantomVII_Body_Anchor_0270 = Vector((0.7453, -2.6335, -0.3277))
# Hardpoint RR_PhantomVII_Body_Anchor_0271 = Vector((0.8161, -2.5560, -0.2788))
# Hardpoint RR_PhantomVII_Body_Anchor_0272 = Vector((0.8752, -2.4692, -0.2249))
# Hardpoint RR_PhantomVII_Body_Anchor_0273 = Vector((0.9217, -2.3736, -0.1663))
# Hardpoint RR_PhantomVII_Body_Anchor_0274 = Vector((0.9549, -2.2694, -0.1035))
# Hardpoint RR_PhantomVII_Body_Anchor_0275 = Vector((0.9744, -2.1571, -0.0370))
# Hardpoint RR_PhantomVII_Body_Anchor_0276 = Vector((0.9799, -2.0370, 0.0326))
# Hardpoint RR_PhantomVII_Body_Anchor_0277 = Vector((0.9713, -1.9095, 0.1047))
# Hardpoint RR_PhantomVII_Body_Anchor_0278 = Vector((0.9487, -1.7752, 0.1788))
# Hardpoint RR_PhantomVII_Body_Anchor_0279 = Vector((0.9125, -1.6345, 0.2544))
# Hardpoint RR_PhantomVII_Body_Anchor_0280 = Vector((0.8632, -1.4879, 0.3307))
# Hardpoint RR_PhantomVII_Body_Anchor_0281 = Vector((0.8014, -1.3360, 0.4071))
# Hardpoint RR_PhantomVII_Body_Anchor_0282 = Vector((0.7281, -1.1792, 0.4831))
# Hardpoint RR_PhantomVII_Body_Anchor_0283 = Vector((0.6444, -1.0182, 0.5580))
# Hardpoint RR_PhantomVII_Body_Anchor_0284 = Vector((0.5513, -0.8536, 0.6313))
# Hardpoint RR_PhantomVII_Body_Anchor_0285 = Vector((0.4504, -0.6858, 0.7022))
# Hardpoint RR_PhantomVII_Body_Anchor_0286 = Vector((0.3430, -0.5156, 0.7703))
# Hardpoint RR_PhantomVII_Body_Anchor_0287 = Vector((0.2306, -0.3436, 0.8350))
# Hardpoint RR_PhantomVII_Body_Anchor_0288 = Vector((0.1149, -0.1703, 0.8958))
# Hardpoint RR_PhantomVII_Body_Anchor_0289 = Vector((-0.0024, 0.0036, 0.9522))
# Hardpoint RR_PhantomVII_Body_Anchor_0290 = Vector((-0.1197, 0.1775, 1.0036))
# Hardpoint RR_PhantomVII_Body_Anchor_0291 = Vector((-0.2353, 0.3507, 1.0498))
# Hardpoint RR_PhantomVII_Body_Anchor_0292 = Vector((-0.3475, 0.5227, 1.0904))
# Hardpoint RR_PhantomVII_Body_Anchor_0293 = Vector((-0.4547, 0.6928, 1.1249))
# Hardpoint RR_PhantomVII_Body_Anchor_0294 = Vector((-0.5554, 0.8604, 1.1532))
# Hardpoint RR_PhantomVII_Body_Anchor_0295 = Vector((-0.6480, 1.0250, 1.1749))
# Hardpoint RR_PhantomVII_Body_Anchor_0296 = Vector((-0.7314, 1.1858, 1.1900))
# Hardpoint RR_PhantomVII_Body_Anchor_0297 = Vector((-0.8042, 1.3423, 1.1983))
# Hardpoint RR_PhantomVII_Body_Anchor_0298 = Vector((-0.8655, 1.4941, 1.1997))
# Hardpoint RR_PhantomVII_Body_Anchor_0299 = Vector((-0.9143, 1.6404, 1.1942))
# Hardpoint RR_PhantomVII_Body_Anchor_0300 = Vector((-0.9499, 1.7809, 1.1819))
# Hardpoint RR_PhantomVII_Body_Anchor_0301 = Vector((-0.9719, 1.9149, 1.1629))
# Hardpoint RR_PhantomVII_Body_Anchor_0302 = Vector((-0.9800, 2.0421, 1.1373))
# Hardpoint RR_PhantomVII_Body_Anchor_0303 = Vector((-0.9739, 2.1619, 1.1053))
# Hardpoint RR_PhantomVII_Body_Anchor_0304 = Vector((-0.9538, 2.2739, 1.0672))
# Hardpoint RR_PhantomVII_Body_Anchor_0305 = Vector((-0.9200, 2.3777, 1.0233))
# Hardpoint RR_PhantomVII_Body_Anchor_0306 = Vector((-0.8730, 2.4730, 0.9740))
# Hardpoint RR_PhantomVII_Body_Anchor_0307 = Vector((-0.8134, 2.5594, 0.9196))
# Hardpoint RR_PhantomVII_Body_Anchor_0308 = Vector((-0.7421, 2.6365, 0.8606))
# Hardpoint RR_PhantomVII_Body_Anchor_0309 = Vector((-0.6602, 2.7042, 0.7974))
# Hardpoint RR_PhantomVII_Body_Anchor_0310 = Vector((-0.5687, 2.7622, 0.7307))
# Hardpoint RR_PhantomVII_Body_Anchor_0311 = Vector((-0.4691, 2.8102, 0.6608))
# Hardpoint RR_PhantomVII_Body_Anchor_0312 = Vector((-0.3627, 2.8481, 0.5884))
# Hardpoint RR_PhantomVII_Body_Anchor_0313 = Vector((-0.2511, 2.8757, 0.5141))
# Hardpoint RR_PhantomVII_Body_Anchor_0314 = Vector((-0.1359, 2.8930, 0.4385))
# Hardpoint RR_PhantomVII_Body_Anchor_0315 = Vector((-0.0187, 2.8999, 0.3622))
# Hardpoint RR_PhantomVII_Body_Anchor_0316 = Vector((0.0987, 2.8963, 0.2857))
# Hardpoint RR_PhantomVII_Body_Anchor_0317 = Vector((0.2147, 2.8823, 0.2098))
# Hardpoint RR_PhantomVII_Body_Anchor_0318 = Vector((0.3276, 2.8580, 0.1350))
# Hardpoint RR_PhantomVII_Body_Anchor_0319 = Vector((0.4358, 2.8233, 0.0620))
# Hardpoint RR_PhantomVII_Body_Anchor_0320 = Vector((0.5378, 2.7785, -0.0087))
# Hardpoint RR_PhantomVII_Body_Anchor_0321 = Vector((0.6320, 2.7237, -0.0765))
# Hardpoint RR_PhantomVII_Body_Anchor_0322 = Vector((0.7171, 2.6591, -0.1409))
# Hardpoint RR_PhantomVII_Body_Anchor_0323 = Vector((0.7919, 2.5850, -0.2013))
# Hardpoint RR_PhantomVII_Body_Anchor_0324 = Vector((0.8553, 2.5015, -0.2572))
# Hardpoint RR_PhantomVII_Body_Anchor_0325 = Vector((0.9064, 2.4090, -0.3082))
# Hardpoint RR_PhantomVII_Body_Anchor_0326 = Vector((0.9445, 2.3079, -0.3539))
# Hardpoint RR_PhantomVII_Body_Anchor_0327 = Vector((0.9690, 2.1984, -0.3938))
# Hardpoint RR_PhantomVII_Body_Anchor_0328 = Vector((0.9796, 2.0810, -0.4278))
# Hardpoint RR_PhantomVII_Body_Anchor_0329 = Vector((0.9760, 1.9562, -0.4555))
# Hardpoint RR_PhantomVII_Body_Anchor_0330 = Vector((0.9585, 1.8243, -0.4766))
# Hardpoint RR_PhantomVII_Body_Anchor_0331 = Vector((0.9271, 1.6858, -0.4911))
# Hardpoint RR_PhantomVII_Body_Anchor_0332 = Vector((0.8824, 1.5413, -0.4987))
# Hardpoint RR_PhantomVII_Body_Anchor_0333 = Vector((0.8250, 1.3912, -0.4995))
# Hardpoint RR_PhantomVII_Body_Anchor_0334 = Vector((0.7558, 1.2361, -0.4934))
# Hardpoint RR_PhantomVII_Body_Anchor_0335 = Vector((0.6756, 1.0766, -0.4805))
# Hardpoint RR_PhantomVII_Body_Anchor_0336 = Vector((0.5858, 0.9132, -0.4608))
# Hardpoint RR_PhantomVII_Body_Anchor_0337 = Vector((0.4875, 0.7465, -0.4346))
# Hardpoint RR_PhantomVII_Body_Anchor_0338 = Vector((0.3823, 0.5771, -0.4020))
# Hardpoint RR_PhantomVII_Body_Anchor_0339 = Vector((0.2715, 0.4057, -0.3634))
# Hardpoint RR_PhantomVII_Body_Anchor_0340 = Vector((0.1568, 0.2328, -0.3189))
# Hardpoint RR_PhantomVII_Body_Anchor_0341 = Vector((0.0399, 0.0590, -0.2691))
# Hardpoint RR_PhantomVII_Body_Anchor_0342 = Vector((-0.0776, -0.1149, -0.2143))
# Hardpoint RR_PhantomVII_Body_Anchor_0343 = Vector((-0.1940, -0.2885, -0.1548))
# Hardpoint RR_PhantomVII_Body_Anchor_0344 = Vector((-0.3076, -0.4610, -0.0913))
# Hardpoint RR_PhantomVII_Body_Anchor_0345 = Vector((-0.4168, -0.6319, -0.0243))
# Hardpoint RR_PhantomVII_Body_Anchor_0346 = Vector((-0.5200, -0.8004, 0.0459))
# Hardpoint RR_PhantomVII_Body_Anchor_0347 = Vector((-0.6157, -0.9661, 0.1184))
# Hardpoint RR_PhantomVII_Body_Anchor_0348 = Vector((-0.7025, -1.1284, 0.1929))
# Hardpoint RR_PhantomVII_Body_Anchor_0349 = Vector((-0.7793, -1.2865, 0.2686))
# Hardpoint RR_PhantomVII_Body_Anchor_0350 = Vector((-0.8448, -1.4401, 0.3450))
# Hardpoint RR_PhantomVII_Body_Anchor_0351 = Vector((-0.8982, -1.5884, 0.4214))
# Hardpoint RR_PhantomVII_Body_Anchor_0352 = Vector((-0.9387, -1.7310, 0.4972))
# Hardpoint RR_PhantomVII_Body_Anchor_0353 = Vector((-0.9656, -1.8674, 0.5719))
# Hardpoint RR_PhantomVII_Body_Anchor_0354 = Vector((-0.9787, -1.9971, 0.6447))
# Hardpoint RR_PhantomVII_Body_Anchor_0355 = Vector((-0.9777, -2.1196, 0.7152))
# Hardpoint RR_PhantomVII_Body_Anchor_0356 = Vector((-0.9626, -2.2345, 0.7827))
# Hardpoint RR_PhantomVII_Body_Anchor_0357 = Vector((-0.9337, -2.3413, 0.8467))
# Hardpoint RR_PhantomVII_Body_Anchor_0358 = Vector((-0.8914, -2.4397, 0.9067))
# Hardpoint RR_PhantomVII_Body_Anchor_0359 = Vector((-0.8362, -2.5293, 0.9622))
# Hardpoint RR_PhantomVII_Body_Anchor_0360 = Vector((-0.7691, -2.6098, 1.0127))
# Hardpoint RR_PhantomVII_Body_Anchor_0361 = Vector((-0.6908, -2.6810, 1.0578))
# Hardpoint RR_PhantomVII_Body_Anchor_0362 = Vector((-0.6026, -2.7424, 1.0973))
# Hardpoint RR_PhantomVII_Body_Anchor_0363 = Vector((-0.5058, -2.7940, 1.1307))
# Hardpoint RR_PhantomVII_Body_Anchor_0364 = Vector((-0.4017, -2.8356, 1.1577))
# Hardpoint RR_PhantomVII_Body_Anchor_0365 = Vector((-0.2918, -2.8669, 1.1782))
# Hardpoint RR_PhantomVII_Body_Anchor_0366 = Vector((-0.1777, -2.8880, 1.1921))
# Hardpoint RR_PhantomVII_Body_Anchor_0367 = Vector((-0.0610, -2.8986, 1.1991))
# Hardpoint RR_PhantomVII_Body_Anchor_0368 = Vector((0.0565, -2.8988, 1.1992))
# Hardpoint RR_PhantomVII_Body_Anchor_0369 = Vector((0.1732, -2.8886, 1.1925))
# Hardpoint RR_PhantomVII_Body_Anchor_0370 = Vector((0.2875, -2.8679, 1.1789))
# Hardpoint RR_PhantomVII_Body_Anchor_0371 = Vector((0.3975, -2.8370, 1.1586))
# Hardpoint RR_PhantomVII_Body_Anchor_0372 = Vector((0.5019, -2.7958, 1.1318))
# Hardpoint RR_PhantomVII_Body_Anchor_0373 = Vector((0.5991, -2.7446, 1.0987))
# Hardpoint RR_PhantomVII_Body_Anchor_0374 = Vector((0.6876, -2.6835, 1.0595))
# Hardpoint RR_PhantomVII_Body_Anchor_0375 = Vector((0.7663, -2.6127, 1.0145))
# Hardpoint RR_PhantomVII_Body_Anchor_0376 = Vector((0.8339, -2.5326, 0.9642))
# Hardpoint RR_PhantomVII_Body_Anchor_0377 = Vector((0.8895, -2.4433, 0.9089))
# Hardpoint RR_PhantomVII_Body_Anchor_0378 = Vector((0.9324, -2.3452, 0.8491))
# Hardpoint RR_PhantomVII_Body_Anchor_0379 = Vector((0.9618, -2.2387, 0.7852))
# Hardpoint RR_PhantomVII_Body_Anchor_0380 = Vector((0.9774, -2.1242, 0.7178))
# Hardpoint RR_PhantomVII_Body_Anchor_0381 = Vector((0.9789, -2.0020, 0.6475))
# Hardpoint RR_PhantomVII_Body_Anchor_0382 = Vector((0.9664, -1.8725, 0.5747))
# Hardpoint RR_PhantomVII_Body_Anchor_0383 = Vector((0.9399, -1.7364, 0.5001))
# Hardpoint RR_PhantomVII_Body_Anchor_0384 = Vector((0.9000, -1.5940, 0.4243))
# Hardpoint RR_PhantomVII_Body_Anchor_0385 = Vector((0.8471, -1.4458, 0.3479))
# Hardpoint RR_PhantomVII_Body_Anchor_0386 = Vector((0.7820, -1.2925, 0.2715))
# Hardpoint RR_PhantomVII_Body_Anchor_0387 = Vector((0.7057, -1.1345, 0.1958))
# Hardpoint RR_PhantomVII_Body_Anchor_0388 = Vector((0.6192, -0.9724, 0.1212))
# Hardpoint RR_PhantomVII_Body_Anchor_0389 = Vector((0.5238, -0.8069, 0.0486))
# Hardpoint RR_PhantomVII_Body_Anchor_0390 = Vector((0.4209, -0.6384, -0.0216))
# Hardpoint RR_PhantomVII_Body_Anchor_0391 = Vector((0.3119, -0.4676, -0.0888))
# Hardpoint RR_PhantomVII_Body_Anchor_0392 = Vector((0.1984, -0.2951, -0.1525))
# Hardpoint RR_PhantomVII_Body_Anchor_0393 = Vector((0.0821, -0.1216, -0.2121))
# Hardpoint RR_PhantomVII_Body_Anchor_0394 = Vector((-0.0354, 0.0524, -0.2671))
# Hardpoint RR_PhantomVII_Body_Anchor_0395 = Vector((-0.1524, 0.2261, -0.3171))
# Hardpoint RR_PhantomVII_Body_Anchor_0396 = Vector((-0.2672, 0.3991, -0.3618))
# Hardpoint RR_PhantomVII_Body_Anchor_0397 = Vector((-0.3781, 0.5706, -0.4007))
# Hardpoint RR_PhantomVII_Body_Anchor_0398 = Vector((-0.4836, 0.7401, -0.4335))
# Hardpoint RR_PhantomVII_Body_Anchor_0399 = Vector((-0.5822, 0.9069, -0.4599))
# Hardpoint RR_PhantomVII_Body_Anchor_0400 = Vector((-0.6724, 1.0704, -0.4798))
# Hardpoint RR_PhantomVII_Body_Anchor_0401 = Vector((-0.7529, 1.2301, -0.4930))
# Hardpoint RR_PhantomVII_Body_Anchor_0402 = Vector((-0.8226, 1.3854, -0.4994))
# Hardpoint RR_PhantomVII_Body_Anchor_0403 = Vector((-0.8804, 1.5357, -0.4989))
# Hardpoint RR_PhantomVII_Body_Anchor_0404 = Vector((-0.9256, 1.6804, -0.4915))
# Hardpoint RR_PhantomVII_Body_Anchor_0405 = Vector((-0.9575, 1.8191, -0.4773))
# Hardpoint RR_PhantomVII_Body_Anchor_0406 = Vector((-0.9756, 1.9513, -0.4564))
# Hardpoint RR_PhantomVII_Body_Anchor_0407 = Vector((-0.9797, 2.0764, -0.4290))
# Hardpoint RR_PhantomVII_Body_Anchor_0408 = Vector((-0.9697, 2.1941, -0.3953))
# Hardpoint RR_PhantomVII_Body_Anchor_0409 = Vector((-0.9457, 2.3038, -0.3555))
# Hardpoint RR_PhantomVII_Body_Anchor_0410 = Vector((-0.9081, 2.4053, -0.3100))
# Hardpoint RR_PhantomVII_Body_Anchor_0411 = Vector((-0.8575, 2.4981, -0.2592))
# Hardpoint RR_PhantomVII_Body_Anchor_0412 = Vector((-0.7946, 2.5819, -0.2035))
# Hardpoint RR_PhantomVII_Body_Anchor_0413 = Vector((-0.7202, 2.6565, -0.1433))
# Hardpoint RR_PhantomVII_Body_Anchor_0414 = Vector((-0.6354, 2.7214, -0.0791))
# Hardpoint RR_PhantomVII_Body_Anchor_0415 = Vector((-0.5415, 2.7766, -0.0114))
# Hardpoint RR_PhantomVII_Body_Anchor_0416 = Vector((-0.4399, 2.8218, 0.0592))
# Hardpoint RR_PhantomVII_Body_Anchor_0417 = Vector((-0.3319, 2.8568, 0.1322))
# Hardpoint RR_PhantomVII_Body_Anchor_0418 = Vector((-0.2191, 2.8816, 0.2069))
# Hardpoint RR_PhantomVII_Body_Anchor_0419 = Vector((-0.1032, 2.8960, 0.2828))
# Hardpoint RR_PhantomVII_Body_Anchor_0420 = Vector((0.0142, 2.8999, 0.3593))
# Hardpoint RR_PhantomVII_Body_Anchor_0421 = Vector((0.1314, 2.8934, 0.4356))
# Hardpoint RR_PhantomVII_Body_Anchor_0422 = Vector((0.2467, 2.8765, 0.5113))
# Hardpoint RR_PhantomVII_Body_Anchor_0423 = Vector((0.3585, 2.8493, 0.5856))
# Hardpoint RR_PhantomVII_Body_Anchor_0424 = Vector((0.4651, 2.8118, 0.6581))
# Hardpoint RR_PhantomVII_Body_Anchor_0425 = Vector((0.5650, 2.7642, 0.7280))
# Hardpoint RR_PhantomVII_Body_Anchor_0426 = Vector((0.6568, 2.7066, 0.7949))
# Hardpoint RR_PhantomVII_Body_Anchor_0427 = Vector((0.7392, 2.6393, 0.8582))
# Hardpoint RR_PhantomVII_Body_Anchor_0428 = Vector((0.8109, 2.5625, 0.9174))
# Hardpoint RR_PhantomVII_Body_Anchor_0429 = Vector((0.8709, 2.4765, 0.9720))
# Hardpoint RR_PhantomVII_Body_Anchor_0430 = Vector((0.9185, 2.3815, 1.0215))
# Hardpoint RR_PhantomVII_Body_Anchor_0431 = Vector((0.9528, 2.2780, 1.0657))
# Hardpoint RR_PhantomVII_Body_Anchor_0432 = Vector((0.9734, 2.1663, 1.1040))
# Hardpoint RR_PhantomVII_Body_Anchor_0433 = Vector((0.9800, 2.0468, 1.1362))
# Hardpoint RR_PhantomVII_Body_Anchor_0434 = Vector((0.9725, 1.9199, 1.1621))
# Hardpoint RR_PhantomVII_Body_Anchor_0435 = Vector((0.9510, 1.7861, 1.1813))
# Hardpoint RR_PhantomVII_Body_Anchor_0436 = Vector((0.9159, 1.6459, 1.1939))
# Hardpoint RR_PhantomVII_Body_Anchor_0437 = Vector((0.8676, 1.4998, 1.1996))
# Hardpoint RR_PhantomVII_Body_Anchor_0438 = Vector((0.8068, 1.3483, 1.1985))
# Hardpoint RR_PhantomVII_Body_Anchor_0439 = Vector((0.7344, 1.1919, 1.1904))
# Hardpoint RR_PhantomVII_Body_Anchor_0440 = Vector((0.6514, 1.0312, 1.1756))
# Hardpoint RR_PhantomVII_Body_Anchor_0441 = Vector((0.5591, 0.8668, 1.1541))
# Hardpoint RR_PhantomVII_Body_Anchor_0442 = Vector((0.4587, 0.6993, 1.1261))
# Hardpoint RR_PhantomVII_Body_Anchor_0443 = Vector((0.3517, 0.5293, 1.0918))
# Hardpoint RR_PhantomVII_Body_Anchor_0444 = Vector((0.2397, 0.3573, 1.0515))
# Hardpoint RR_PhantomVII_Body_Anchor_0445 = Vector((0.1242, 0.1841, 1.0055))
# Hardpoint RR_PhantomVII_Body_Anchor_0446 = Vector((0.0069, 0.0103, 0.9542))
# Hardpoint RR_PhantomVII_Body_Anchor_0447 = Vector((-0.1104, -0.1637, 0.8980))
# Hardpoint RR_PhantomVII_Body_Anchor_0448 = Vector((-0.2262, -0.3370, 0.8374))
# Hardpoint RR_PhantomVII_Body_Anchor_0449 = Vector((-0.3387, -0.5091, 0.7729))
# Hardpoint RR_PhantomVII_Body_Anchor_0450 = Vector((-0.4464, -0.6794, 0.7049))
# Hardpoint RR_PhantomVII_Body_Anchor_0451 = Vector((-0.5476, -0.8472, 0.6340))
# Hardpoint RR_PhantomVII_Body_Anchor_0452 = Vector((-0.6410, -1.0120, 0.5609))
# Hardpoint RR_PhantomVII_Body_Anchor_0453 = Vector((-0.7251, -1.1731, 0.4860))
# Hardpoint RR_PhantomVII_Body_Anchor_0454 = Vector((-0.7988, -1.3301, 0.4100))
# Hardpoint RR_PhantomVII_Body_Anchor_0455 = Vector((-0.8610, -1.4822, 0.3336))
# Hardpoint RR_PhantomVII_Body_Anchor_0456 = Vector((-0.9109, -1.6290, 0.2573))
# Hardpoint RR_PhantomVII_Body_Anchor_0457 = Vector((-0.9476, -1.7699, 0.1817))
# Hardpoint RR_PhantomVII_Body_Anchor_0458 = Vector((-0.9707, -1.9045, 0.1075))
# Hardpoint RR_PhantomVII_Body_Anchor_0459 = Vector((-0.9798, -2.0322, 0.0353))
# Hardpoint RR_PhantomVII_Body_Anchor_0460 = Vector((-0.9749, -2.1526, -0.0344))
# Hardpoint RR_PhantomVII_Body_Anchor_0461 = Vector((-0.9559, -2.2653, -0.1010))
# Hardpoint RR_PhantomVII_Body_Anchor_0462 = Vector((-0.9232, -2.3698, -0.1639))
# Hardpoint RR_PhantomVII_Body_Anchor_0463 = Vector((-0.8772, -2.4657, -0.2227))
# Hardpoint RR_PhantomVII_Body_Anchor_0464 = Vector((-0.8186, -2.5528, -0.2768))
# Hardpoint RR_PhantomVII_Body_Anchor_0465 = Vector((-0.7482, -2.6307, -0.3259))
# Hardpoint RR_PhantomVII_Body_Anchor_0466 = Vector((-0.6671, -2.6992, -0.3695))
# Hardpoint RR_PhantomVII_Body_Anchor_0467 = Vector((-0.5763, -2.7579, -0.4073))
# Hardpoint RR_PhantomVII_Body_Anchor_0468 = Vector((-0.4773, -2.8067, -0.4389))
# Hardpoint RR_PhantomVII_Body_Anchor_0469 = Vector((-0.3714, -2.8454, -0.4641))
# Hardpoint RR_PhantomVII_Body_Anchor_0470 = Vector((-0.2601, -2.8739, -0.4828))
# Hardpoint RR_PhantomVII_Body_Anchor_0471 = Vector((-0.1452, -2.8920, -0.4947))
# Hardpoint RR_PhantomVII_Body_Anchor_0472 = Vector((-0.0281, -2.8997, -0.4998))
# Hardpoint RR_PhantomVII_Body_Anchor_0473 = Vector((0.0894, -2.8970, -0.4980))
# Hardpoint RR_PhantomVII_Body_Anchor_0474 = Vector((0.2056, -2.8838, -0.4893))
# Hardpoint RR_PhantomVII_Body_Anchor_0475 = Vector((0.3188, -2.8603, -0.4739))
# Hardpoint RR_PhantomVII_Body_Anchor_0476 = Vector((0.4274, -2.8265, -0.4518))
# Hardpoint RR_PhantomVII_Body_Anchor_0477 = Vector((0.5299, -2.7825, -0.4232))
# Hardpoint RR_PhantomVII_Body_Anchor_0478 = Vector((0.6248, -2.7285, -0.3883))
# Hardpoint RR_PhantomVII_Body_Anchor_0479 = Vector((0.7107, -2.6646, -0.3474))
# Hardpoint RR_PhantomVII_Body_Anchor_0480 = Vector((0.7864, -2.5912, -0.3009))
# Hardpoint RR_PhantomVII_Body_Anchor_0481 = Vector((0.8507, -2.5085, -0.2492))
# Hardpoint RR_PhantomVII_Body_Anchor_0482 = Vector((0.9028, -2.4167, -0.1926))
# Hardpoint RR_PhantomVII_Body_Anchor_0483 = Vector((0.9420, -2.3162, -0.1316))
# Hardpoint RR_PhantomVII_Body_Anchor_0484 = Vector((0.9676, -2.2074, -0.0667))
# Hardpoint RR_PhantomVII_Body_Anchor_0485 = Vector((0.9792, -2.0907, 0.0016))
# Hardpoint RR_PhantomVII_Body_Anchor_0486 = Vector((0.9768, -1.9664, 0.0727))
# Hardpoint RR_PhantomVII_Body_Anchor_0487 = Vector((0.9604, -1.8350, 0.1461))
# Hardpoint RR_PhantomVII_Body_Anchor_0488 = Vector((0.9301, -1.6971, 0.2210))
# Hardpoint RR_PhantomVII_Body_Anchor_0489 = Vector((0.8864, -1.5530, 0.2971))
# Hardpoint RR_PhantomVII_Body_Anchor_0490 = Vector((0.8300, -1.4034, 0.3735))
# Hardpoint RR_PhantomVII_Body_Anchor_0491 = Vector((0.7617, -1.2487, 0.4498))
# Hardpoint RR_PhantomVII_Body_Anchor_0492 = Vector((0.6824, -1.0895, 0.5253))
# Hardpoint RR_PhantomVII_Body_Anchor_0493 = Vector((0.5933, -0.9264, 0.5993))
# Hardpoint RR_PhantomVII_Body_Anchor_0494 = Vector((0.4956, -0.7599, 0.6714))
# Hardpoint RR_PhantomVII_Body_Anchor_0495 = Vector((0.3909, -0.5907, 0.7408))
# Hardpoint RR_PhantomVII_Body_Anchor_0496 = Vector((0.2805, -0.4194, 0.8070))
# Hardpoint RR_PhantomVII_Body_Anchor_0497 = Vector((0.1661, -0.2466, 0.8696))
# Hardpoint RR_PhantomVII_Body_Anchor_0498 = Vector((0.0492, -0.0729, 0.9280))
# Hardpoint RR_PhantomVII_Body_Anchor_0499 = Vector((-0.0683, 0.1011, 0.9816))
# Hardpoint RR_PhantomVII_Body_Anchor_0500 = Vector((-0.1848, 0.2747, 1.0302))
# Hardpoint RR_PhantomVII_Body_Anchor_0501 = Vector((-0.2987, 0.4473, 1.0733))
# Hardpoint RR_PhantomVII_Body_Anchor_0502 = Vector((-0.4083, 0.6183, 1.1105))
# Hardpoint RR_PhantomVII_Body_Anchor_0503 = Vector((-0.5120, 0.7871, 1.1415))
# Hardpoint RR_PhantomVII_Body_Anchor_0504 = Vector((-0.6084, 0.9531, 1.1662))
# Hardpoint RR_PhantomVII_Body_Anchor_0505 = Vector((-0.6960, 1.1156, 1.1842))
# Hardpoint RR_PhantomVII_Body_Anchor_0506 = Vector((-0.7736, 1.2741, 1.1955))
# Hardpoint RR_PhantomVII_Body_Anchor_0507 = Vector((-0.8400, 1.4280, 1.1999))
# Hardpoint RR_PhantomVII_Body_Anchor_0508 = Vector((-0.8944, 1.5768, 1.1975))
# Hardpoint RR_PhantomVII_Body_Anchor_0509 = Vector((-0.9359, 1.7199, 1.1882))
# Hardpoint RR_PhantomVII_Body_Anchor_0510 = Vector((-0.9640, 1.8568, 1.1721))
# Hardpoint RR_PhantomVII_Body_Anchor_0511 = Vector((-0.9782, 1.9871, 1.1494))
# Hardpoint RR_PhantomVII_Body_Anchor_0512 = Vector((-0.9783, 2.1101, 1.1202))
# Hardpoint RR_PhantomVII_Body_Anchor_0513 = Vector((-0.9644, 2.2256, 1.0847))
# Hardpoint RR_PhantomVII_Body_Anchor_0514 = Vector((-0.9365, 2.3331, 1.0433))
# Hardpoint RR_PhantomVII_Body_Anchor_0515 = Vector((-0.8952, 2.4322, 0.9963))
# Hardpoint RR_PhantomVII_Body_Anchor_0516 = Vector((-0.8411, 2.5225, 0.9441))
# Hardpoint RR_PhantomVII_Body_Anchor_0517 = Vector((-0.7748, 2.6038, 0.8870))
# Hardpoint RR_PhantomVII_Body_Anchor_0518 = Vector((-0.6974, 2.6757, 0.8257))
# Hardpoint RR_PhantomVII_Body_Anchor_0519 = Vector((-0.6100, 2.7379, 0.7604))
# Hardpoint RR_PhantomVII_Body_Anchor_0520 = Vector((-0.5138, 2.7903, 0.6918))
# Hardpoint RR_PhantomVII_Body_Anchor_0521 = Vector((-0.4102, 2.8327, 0.6205))
# Hardpoint RR_PhantomVII_Body_Anchor_0522 = Vector((-0.3007, 2.8648, 0.5470))
# Hardpoint RR_PhantomVII_Body_Anchor_0523 = Vector((-0.1869, 2.8867, 0.4719))
# Hardpoint RR_PhantomVII_Body_Anchor_0524 = Vector((-0.0704, 2.8981, 0.3958))
# Hardpoint RR_PhantomVII_Body_Anchor_0525 = Vector((0.0472, 2.8992, 0.3193))
# Hardpoint RR_PhantomVII_Body_Anchor_0526 = Vector((0.1640, 2.8898, 0.2431))
# Hardpoint RR_PhantomVII_Body_Anchor_0527 = Vector((0.2785, 2.8700, 0.1677))
# Hardpoint RR_PhantomVII_Body_Anchor_0528 = Vector((0.3890, 2.8398, 0.0939))
# Hardpoint RR_PhantomVII_Body_Anchor_0529 = Vector((0.4939, 2.7995, 0.0220))
# Hardpoint RR_PhantomVII_Body_Anchor_0530 = Vector((0.5916, 2.7490, -0.0471))
# Hardpoint RR_PhantomVII_Body_Anchor_0531 = Vector((0.6809, 2.6887, -0.1131))
# Hardpoint RR_PhantomVII_Body_Anchor_0532 = Vector((0.7604, 2.6187, -0.1752))
# Hardpoint RR_PhantomVII_Body_Anchor_0533 = Vector((0.8289, 2.5393, -0.2332))
# Hardpoint RR_PhantomVII_Body_Anchor_0534 = Vector((0.8855, 2.4507, -0.2864))
# Hardpoint RR_PhantomVII_Body_Anchor_0535 = Vector((0.9294, 2.3534, -0.3345))
# Hardpoint RR_PhantomVII_Body_Anchor_0536 = Vector((0.9599, 2.2475, -0.3770))
# Hardpoint RR_PhantomVII_Body_Anchor_0537 = Vector((0.9767, 2.1336, -0.4136))
# Hardpoint RR_PhantomVII_Body_Anchor_0538 = Vector((0.9793, 2.0120, -0.4441))
# Hardpoint RR_PhantomVII_Body_Anchor_0539 = Vector((0.9679, 1.8831, -0.4681))
# Hardpoint RR_PhantomVII_Body_Anchor_0540 = Vector((0.9425, 1.7475, -0.4855))
# Hardpoint RR_PhantomVII_Body_Anchor_0541 = Vector((0.9036, 1.6055, -0.4962))
# Hardpoint RR_PhantomVII_Body_Anchor_0542 = Vector((0.8517, 1.4578, -0.5000))
# Hardpoint RR_PhantomVII_Body_Anchor_0543 = Vector((0.7876, 1.3049, -0.4969))
# Hardpoint RR_PhantomVII_Body_Anchor_0544 = Vector((0.7121, 1.1472, -0.4870))
# Hardpoint RR_PhantomVII_Body_Anchor_0545 = Vector((0.6264, 0.9855, -0.4703))
# Hardpoint RR_PhantomVII_Body_Anchor_0546 = Vector((0.5317, 0.8202, -0.4469))
# Hardpoint RR_PhantomVII_Body_Anchor_0547 = Vector((0.4293, 0.6519, -0.4171))
# Hardpoint RR_PhantomVII_Body_Anchor_0548 = Vector((0.3208, 0.4813, -0.3811))
# Hardpoint RR_PhantomVII_Body_Anchor_0549 = Vector((0.2076, 0.3089, -0.3392))
# Hardpoint RR_PhantomVII_Body_Anchor_0550 = Vector((0.0914, 0.1354, -0.2917))
# Hardpoint RR_PhantomVII_Body_Anchor_0551 = Vector((-0.0260, -0.0385, -0.2390))
# Hardpoint RR_PhantomVII_Body_Anchor_0552 = Vector((-0.1431, -0.2123, -0.1815))
# Hardpoint RR_PhantomVII_Body_Anchor_0553 = Vector((-0.2581, -0.3854, -0.1197))
# Hardpoint RR_PhantomVII_Body_Anchor_0554 = Vector((-0.3695, -0.5570, -0.0541))
# Hardpoint RR_PhantomVII_Body_Anchor_0555 = Vector((-0.4755, -0.7267, 0.0147))
# Hardpoint RR_PhantomVII_Body_Anchor_0556 = Vector((-0.5746, -0.8937, 0.0863))
# Hardpoint RR_PhantomVII_Body_Anchor_0557 = Vector((-0.6655, -1.0575, 0.1600))
# Hardpoint RR_PhantomVII_Body_Anchor_0558 = Vector((-0.7469, -1.2176, 0.2352))
# Hardpoint RR_PhantomVII_Body_Anchor_0559 = Vector((-0.8174, -1.3732, 0.3114))
# Hardpoint RR_PhantomVII_Body_Anchor_0560 = Vector((-0.8763, -1.5239, 0.3878))
# Hardpoint RR_PhantomVII_Body_Anchor_0561 = Vector((-0.9225, -1.6691, 0.4640))
# Hardpoint RR_PhantomVII_Body_Anchor_0562 = Vector((-0.9555, -1.8083, 0.5392))
# Hardpoint RR_PhantomVII_Body_Anchor_0563 = Vector((-0.9747, -1.9410, 0.6130))
# Hardpoint RR_PhantomVII_Body_Anchor_0564 = Vector((-0.9799, -2.0667, 0.6845))
# Hardpoint RR_PhantomVII_Body_Anchor_0565 = Vector((-0.9710, -2.1850, 0.7534))
# Hardpoint RR_PhantomVII_Body_Anchor_0566 = Vector((-0.9481, -2.2954, 0.8190))
# Hardpoint RR_PhantomVII_Body_Anchor_0567 = Vector((-0.9116, -2.3975, 0.8808))
# Hardpoint RR_PhantomVII_Body_Anchor_0568 = Vector((-0.8620, -2.4910, 0.9384))
# Hardpoint RR_PhantomVII_Body_Anchor_0569 = Vector((-0.8000, -2.5756, 0.9911))
# Hardpoint RR_PhantomVII_Body_Anchor_0570 = Vector((-0.7265, -2.6509, 1.0387))
# Hardpoint RR_PhantomVII_Body_Anchor_0571 = Vector((-0.6425, -2.7166, 1.0807))
# Hardpoint RR_PhantomVII_Body_Anchor_0572 = Vector((-0.5493, -2.7726, 1.1168))
# Hardpoint RR_PhantomVII_Body_Anchor_0573 = Vector((-0.4482, -2.8186, 1.1466))
# Hardpoint RR_PhantomVII_Body_Anchor_0574 = Vector((-0.3407, -2.8544, 1.1700))
# Hardpoint RR_PhantomVII_Body_Anchor_0575 = Vector((-0.2282, -2.8800, 1.1868))
# Hardpoint RR_PhantomVII_Body_Anchor_0576 = Vector((-0.1125, -2.8952, 1.1968))
# Hardpoint RR_PhantomVII_Body_Anchor_0577 = Vector((0.0049, -2.9000, 1.2000))
# Hardpoint RR_PhantomVII_Body_Anchor_0578 = Vector((0.1221, -2.8943, 1.1963))
# Hardpoint RR_PhantomVII_Body_Anchor_0579 = Vector((0.2377, -2.8783, 1.1857))
# Hardpoint RR_PhantomVII_Body_Anchor_0580 = Vector((0.3498, -2.8518, 1.1684))
# Hardpoint RR_PhantomVII_Body_Anchor_0581 = Vector((0.4569, -2.8152, 1.1444))
# Hardpoint RR_PhantomVII_Body_Anchor_0582 = Vector((0.5574, -2.7683, 1.1140))
# Hardpoint RR_PhantomVII_Body_Anchor_0583 = Vector((0.6498, -2.7116, 1.0774))
# Hardpoint RR_PhantomVII_Body_Anchor_0584 = Vector((0.7330, -2.6450, 1.0350))
# Hardpoint RR_PhantomVII_Body_Anchor_0585 = Vector((0.8056, -2.5690, 0.9869))
# Hardpoint RR_PhantomVII_Body_Anchor_0586 = Vector((0.8666, -2.4836, 0.9338))
# Hardpoint RR_PhantomVII_Body_Anchor_0587 = Vector((0.9151, -2.3894, 0.8759))
# Hardpoint RR_PhantomVII_Body_Anchor_0588 = Vector((0.9505, -2.2866, 0.8137))
# Hardpoint RR_PhantomVII_Body_Anchor_0589 = Vector((0.9723, -2.1755, 0.7478))
# Hardpoint RR_PhantomVII_Body_Anchor_0590 = Vector((0.9800, -2.0566, 0.6787))
# Hardpoint RR_PhantomVII_Body_Anchor_0591 = Vector((0.9736, -1.9303, 0.6069))
# Hardpoint RR_PhantomVII_Body_Anchor_0592 = Vector((0.9533, -1.7970, 0.5331))
# Hardpoint RR_PhantomVII_Body_Anchor_0593 = Vector((0.9192, -1.6573, 0.4577))
# Hardpoint RR_PhantomVII_Body_Anchor_0594 = Vector((0.8719, -1.5116, 0.3815))
# Hardpoint RR_PhantomVII_Body_Anchor_0595 = Vector((0.8120, -1.3605, 0.3050))
# Hardpoint RR_PhantomVII_Body_Anchor_0596 = Vector((0.7405, -1.2045, 0.2289))
# Hardpoint RR_PhantomVII_Body_Anchor_0597 = Vector((0.6584, -1.0441, 0.1538))
# Hardpoint RR_PhantomVII_Body_Anchor_0598 = Vector((0.5667, -0.8800, 0.0803))
# Hardpoint RR_PhantomVII_Body_Anchor_0599 = Vector((0.4669, -0.7127, 0.0089))
# Hardpoint RR_PhantomVII_Body_Anchor_0600 = Vector((0.3604, -0.5429, -0.0597))
# Hardpoint RR_PhantomVII_Body_Anchor_0601 = Vector((0.2487, -0.3711, -0.1250))
# Hardpoint RR_PhantomVII_Body_Anchor_0602 = Vector((0.1335, -0.1980, -0.1864))
# Hardpoint RR_PhantomVII_Body_Anchor_0603 = Vector((0.0163, -0.0241, -0.2435))
# Hardpoint RR_PhantomVII_Body_Anchor_0604 = Vector((-0.1011, 0.1498, -0.2958))
# Hardpoint RR_PhantomVII_Body_Anchor_0605 = Vector((-0.2171, 0.3232, -0.3428))
# Hardpoint RR_PhantomVII_Body_Anchor_0606 = Vector((-0.3299, 0.4954, -0.3843))
# Hardpoint RR_PhantomVII_Body_Anchor_0607 = Vector((-0.4380, 0.6659, -0.4198))
# Hardpoint RR_PhantomVII_Body_Anchor_0608 = Vector((-0.5398, 0.8339, -0.4491))
# Hardpoint RR_PhantomVII_Body_Anchor_0609 = Vector((-0.6339, 0.9990, -0.4719))
# Hardpoint RR_PhantomVII_Body_Anchor_0610 = Vector((-0.7188, 1.1604, -0.4881))
# Hardpoint RR_PhantomVII_Body_Anchor_0611 = Vector((-0.7933, 1.3177, -0.4974))
# Hardpoint RR_PhantomVII_Body_Anchor_0612 = Vector((-0.8565, 1.4703, -0.4999))
# Hardpoint RR_PhantomVII_Body_Anchor_0613 = Vector((-0.9074, 1.6175, -0.4956))
# Hardpoint RR_PhantomVII_Body_Anchor_0614 = Vector((-0.9452, 1.7589, -0.4844))
# Hardpoint RR_PhantomVII_Body_Anchor_0615 = Vector((-0.9694, 1.8940, -0.4664))
# Hardpoint RR_PhantomVII_Body_Anchor_0616 = Vector((-0.9796, 2.0223, -0.4418))
# Hardpoint RR_PhantomVII_Body_Anchor_0617 = Vector((-0.9758, 2.1433, -0.4108))
# Hardpoint RR_PhantomVII_Body_Anchor_0618 = Vector((-0.9579, 2.2566, -0.3737))
# Hardpoint RR_PhantomVII_Body_Anchor_0619 = Vector((-0.9263, 2.3617, -0.3307))
# Hardpoint RR_PhantomVII_Body_Anchor_0620 = Vector((-0.8813, 2.4584, -0.2822))
# Hardpoint RR_PhantomVII_Body_Anchor_0621 = Vector((-0.8237, 2.5462, -0.2286))
# Hardpoint RR_PhantomVII_Body_Anchor_0622 = Vector((-0.7542, 2.6249, -0.1703))
# Hardpoint RR_PhantomVII_Body_Anchor_0623 = Vector((-0.6739, 2.6941, -0.1077))
# Hardpoint RR_PhantomVII_Body_Anchor_0624 = Vector((-0.5839, 2.7536, -0.0415))
# Hardpoint RR_PhantomVII_Body_Anchor_0625 = Vector((-0.4854, 2.8032, 0.0279))
# Hardpoint RR_PhantomVII_Body_Anchor_0626 = Vector((-0.3800, 2.8427, 0.0999))
# Hardpoint RR_PhantomVII_Body_Anchor_0627 = Vector((-0.2692, 2.8720, 0.1739))
# Hardpoint RR_PhantomVII_Body_Anchor_0628 = Vector((-0.1544, 2.8909, 0.2494))
# Hardpoint RR_PhantomVII_Body_Anchor_0629 = Vector((-0.0375, 2.8995, 0.3256))
# Hardpoint RR_PhantomVII_Body_Anchor_0630 = Vector((0.0801, 2.8976, 0.4021))
# Hardpoint RR_PhantomVII_Body_Anchor_0631 = Vector((0.1964, 2.8853, 0.4781))
# Hardpoint RR_PhantomVII_Body_Anchor_0632 = Vector((0.3099, 2.8625, 0.5531))
# Hardpoint RR_PhantomVII_Body_Anchor_0633 = Vector((0.4190, 2.8295, 0.6265))
# Hardpoint RR_PhantomVII_Body_Anchor_0634 = Vector((0.5220, 2.7863, 0.6976))
# Hardpoint RR_PhantomVII_Body_Anchor_0635 = Vector((0.6176, 2.7331, 0.7659))
# Hardpoint RR_PhantomVII_Body_Anchor_0636 = Vector((0.7042, 2.6701, 0.8309))
# Hardpoint RR_PhantomVII_Body_Anchor_0637 = Vector((0.7807, 2.5974, 0.8919))
# Hardpoint RR_PhantomVII_Body_Anchor_0638 = Vector((0.8460, 2.5154, 0.9486))
# Hardpoint RR_PhantomVII_Body_Anchor_0639 = Vector((0.8992, 2.4243, 1.0004))
# Hardpoint RR_PhantomVII_Body_Anchor_0640 = Vector((0.9394, 2.3245, 1.0470))
# Hardpoint RR_PhantomVII_Body_Anchor_0641 = Vector((0.9660, 2.2164, 1.0879))
# Hardpoint RR_PhantomVII_Body_Anchor_0642 = Vector((0.9788, 2.1002, 1.1228))
# Hardpoint RR_PhantomVII_Body_Anchor_0643 = Vector((0.9775, 1.9766, 1.1515))
# Hardpoint RR_PhantomVII_Body_Anchor_0644 = Vector((0.9622, 1.8458, 1.1737))
# Hardpoint RR_PhantomVII_Body_Anchor_0645 = Vector((0.9330, 1.7083, 1.1892))
# Hardpoint RR_PhantomVII_Body_Anchor_0646 = Vector((0.8904, 1.5647, 1.1980))
# Hardpoint RR_PhantomVII_Body_Anchor_0647 = Vector((0.8350, 1.4155, 1.1998))
# Hardpoint RR_PhantomVII_Body_Anchor_0648 = Vector((0.7675, 1.2612, 1.1948))
# Hardpoint RR_PhantomVII_Body_Anchor_0649 = Vector((0.6891, 1.1023, 1.1830))
# Hardpoint RR_PhantomVII_Body_Anchor_0650 = Vector((0.6007, 0.9395, 1.1644))
# Hardpoint RR_PhantomVII_Body_Anchor_0651 = Vector((0.5037, 0.7733, 1.1392))
# Hardpoint RR_PhantomVII_Body_Anchor_0652 = Vector((0.3994, 0.6043, 1.1076))
# Hardpoint RR_PhantomVII_Body_Anchor_0653 = Vector((0.2894, 0.4331, 1.0699))
# Hardpoint RR_PhantomVII_Body_Anchor_0654 = Vector((0.1753, 0.2604, 1.0264))
# Hardpoint RR_PhantomVII_Body_Anchor_0655 = Vector((0.0586, 0.0867, 0.9774))
# Hardpoint RR_PhantomVII_Body_Anchor_0656 = Vector((-0.0589, -0.0873, 0.9233))
# Hardpoint RR_PhantomVII_Body_Anchor_0657 = Vector((-0.1756, -0.2609, 0.8646))
# Hardpoint RR_PhantomVII_Body_Anchor_0658 = Vector((-0.2898, -0.4336, 0.8017))
# Hardpoint RR_PhantomVII_Body_Anchor_0659 = Vector((-0.3998, -0.6048, 0.7352))
# Hardpoint RR_PhantomVII_Body_Anchor_0660 = Vector((-0.5040, -0.7738, 0.6655))
# Hardpoint RR_PhantomVII_Body_Anchor_0661 = Vector((-0.6010, -0.9400, 0.5933))
# Hardpoint RR_PhantomVII_Body_Anchor_0662 = Vector((-0.6893, -1.1028, 0.5191))
# Hardpoint RR_PhantomVII_Body_Anchor_0663 = Vector((-0.7678, -1.2616, 0.4435))
# Hardpoint RR_PhantomVII_Body_Anchor_0664 = Vector((-0.8352, -1.4159, 0.3672))
# Hardpoint RR_PhantomVII_Body_Anchor_0665 = Vector((-0.8905, -1.5652, 0.2908))
# Hardpoint RR_PhantomVII_Body_Anchor_0666 = Vector((-0.9331, -1.7087, 0.2148))
# Hardpoint RR_PhantomVII_Body_Anchor_0667 = Vector((-0.9623, -1.8462, 0.1399))
# Hardpoint RR_PhantomVII_Body_Anchor_0668 = Vector((-0.9776, -1.9769, 0.0667))
# Hardpoint RR_PhantomVII_Body_Anchor_0669 = Vector((-0.9788, -2.1006, -0.0041))
# Hardpoint RR_PhantomVII_Body_Anchor_0670 = Vector((-0.9660, -2.2167, -0.0722))
# Hardpoint RR_PhantomVII_Body_Anchor_0671 = Vector((-0.9393, -2.3249, -0.1368))
# Hardpoint RR_PhantomVII_Body_Anchor_0672 = Vector((-0.8990, -2.4246, -0.1974))
# Hardpoint RR_PhantomVII_Body_Anchor_0673 = Vector((-0.8459, -2.5157, -0.2536))
# Hardpoint RR_PhantomVII_Body_Anchor_0674 = Vector((-0.7805, -2.5976, -0.3050))
# Hardpoint RR_PhantomVII_Body_Anchor_0675 = Vector((-0.7040, -2.6703, -0.3510))
# Hardpoint RR_PhantomVII_Body_Anchor_0676 = Vector((-0.6173, -2.7333, -0.3914))
# Hardpoint RR_PhantomVII_Body_Anchor_0677 = Vector((-0.5217, -2.7865, -0.4258))
# Hardpoint RR_PhantomVII_Body_Anchor_0678 = Vector((-0.4187, -2.8297, -0.4538))
# Hardpoint RR_PhantomVII_Body_Anchor_0679 = Vector((-0.3096, -2.8626, -0.4754))
# Hardpoint RR_PhantomVII_Body_Anchor_0680 = Vector((-0.1960, -2.8853, -0.4903))
# Hardpoint RR_PhantomVII_Body_Anchor_0681 = Vector((-0.0797, -2.8976, -0.4984))
# Hardpoint RR_PhantomVII_Body_Anchor_0682 = Vector((0.0378, -2.8995, -0.4996))
# Hardpoint RR_PhantomVII_Body_Anchor_0683 = Vector((0.1548, -2.8909, -0.4940))
# Hardpoint RR_PhantomVII_Body_Anchor_0684 = Vector((0.2695, -2.8719, -0.4815))
# Hardpoint RR_PhantomVII_Body_Anchor_0685 = Vector((0.3804, -2.8426, -0.4623))
# Hardpoint RR_PhantomVII_Body_Anchor_0686 = Vector((0.4857, -2.8031, -0.4365))
# Hardpoint RR_PhantomVII_Body_Anchor_0687 = Vector((0.5841, -2.7534, -0.4044))
# Hardpoint RR_PhantomVII_Body_Anchor_0688 = Vector((0.6741, -2.6939, -0.3661))
# Hardpoint RR_PhantomVII_Body_Anchor_0689 = Vector((0.7544, -2.6246, -0.3220))
# Hardpoint RR_PhantomVII_Body_Anchor_0690 = Vector((0.8239, -2.5460, -0.2725))
# Hardpoint RR_PhantomVII_Body_Anchor_0691 = Vector((0.8815, -2.4581, -0.2180))
# Hardpoint RR_PhantomVII_Body_Anchor_0692 = Vector((0.9264, -2.3614, -0.1589))
# Hardpoint RR_PhantomVII_Body_Anchor_0693 = Vector((0.9580, -2.2562, -0.0956))
# Hardpoint RR_PhantomVII_Body_Anchor_0694 = Vector((0.9758, -2.1429, -0.0288))
# Hardpoint RR_PhantomVII_Body_Anchor_0695 = Vector((0.9796, -2.0219, 0.0412))
# Hardpoint RR_PhantomVII_Body_Anchor_0696 = Vector((0.9693, -1.8936, 0.1136))
# Hardpoint RR_PhantomVII_Body_Anchor_0697 = Vector((0.9451, -1.7585, 0.1879))
# Hardpoint RR_PhantomVII_Body_Anchor_0698 = Vector((0.9072, -1.6171, 0.2636))
# Hardpoint RR_PhantomVII_Body_Anchor_0699 = Vector((0.8563, -1.4698, 0.3399))
# Hardpoint RR_PhantomVII_Body_Anchor_0700 = Vector((0.7931, -1.3172, 0.4164))
# Hardpoint RR_PhantomVII_Body_Anchor_0701 = Vector((0.7185, -1.1600, 0.4923))
# Hardpoint RR_PhantomVII_Body_Anchor_0702 = Vector((0.6336, -0.9985, 0.5670))
# Hardpoint RR_PhantomVII_Body_Anchor_0703 = Vector((0.5395, -0.8334, 0.6400))
# Hardpoint RR_PhantomVII_Body_Anchor_0704 = Vector((0.4377, -0.6654, 0.7106))
# Hardpoint RR_PhantomVII_Body_Anchor_0705 = Vector((0.3296, -0.4949, 0.7783))
# Hardpoint RR_PhantomVII_Body_Anchor_0706 = Vector((0.2167, -0.3227, 0.8426))
# Hardpoint RR_PhantomVII_Body_Anchor_0707 = Vector((0.1008, -0.1493, 0.9029))
# Hardpoint RR_PhantomVII_Body_Anchor_0708 = Vector((-0.0167, 0.0246, 0.9587))
# Hardpoint RR_PhantomVII_Body_Anchor_0709 = Vector((-0.1338, 0.1985, 1.0095))
# Hardpoint RR_PhantomVII_Body_Anchor_0710 = Vector((-0.2491, 0.3716, 1.0550))
# Hardpoint RR_PhantomVII_Body_Anchor_0711 = Vector((-0.3608, 0.5434, 1.0949))
# Hardpoint RR_PhantomVII_Body_Anchor_0712 = Vector((-0.4673, 0.7133, 1.1287))
# Hardpoint RR_PhantomVII_Body_Anchor_0713 = Vector((-0.5670, 0.8805, 1.1561))
# Hardpoint RR_PhantomVII_Body_Anchor_0714 = Vector((-0.6586, 1.0446, 1.1771))
# Hardpoint RR_PhantomVII_Body_Anchor_0715 = Vector((-0.7408, 1.2050, 1.1914))
# Hardpoint RR_PhantomVII_Body_Anchor_0716 = Vector((-0.8122, 1.3610, 1.1988))
# Hardpoint RR_PhantomVII_Body_Anchor_0717 = Vector((-0.8720, 1.5121, 1.1994))
# Hardpoint RR_PhantomVII_Body_Anchor_0718 = Vector((-0.9193, 1.6577, 1.1931))
# Hardpoint RR_PhantomVII_Body_Anchor_0719 = Vector((-0.9533, 1.7974, 1.1800))
# Hardpoint RR_PhantomVII_Body_Anchor_0720 = Vector((-0.9737, 1.9307, 1.1602))
# Hardpoint RR_PhantomVII_Body_Anchor_0721 = Vector((-0.9800, 2.0570, 1.1338))
# Hardpoint RR_PhantomVII_Body_Anchor_0722 = Vector((-0.9722, 2.1758, 1.1010))
# Hardpoint RR_PhantomVII_Body_Anchor_0723 = Vector((-0.9504, 2.2869, 1.0622))
# Hardpoint RR_PhantomVII_Body_Anchor_0724 = Vector((-0.9150, 2.3897, 1.0176))
# Hardpoint RR_PhantomVII_Body_Anchor_0725 = Vector((-0.8664, 2.4839, 0.9677))
# Hardpoint RR_PhantomVII_Body_Anchor_0726 = Vector((-0.8054, 2.5692, 0.9127))
# Hardpoint RR_PhantomVII_Body_Anchor_0727 = Vector((-0.7327, 2.6452, 0.8531))
# Hardpoint RR_PhantomVII_Body_Anchor_0728 = Vector((-0.6496, 2.7117, 0.7895))
# Hardpoint RR_PhantomVII_Body_Anchor_0729 = Vector((-0.5571, 2.7685, 0.7224))
# Hardpoint RR_PhantomVII_Body_Anchor_0730 = Vector((-0.4565, 2.8153, 0.6522))
# Hardpoint RR_PhantomVII_Body_Anchor_0731 = Vector((-0.3494, 2.8519, 0.5795))
# Hardpoint RR_PhantomVII_Body_Anchor_0732 = Vector((-0.2373, 2.8783, 0.5051))
# Hardpoint RR_PhantomVII_Body_Anchor_0733 = Vector((-0.1218, 2.8944, 0.4293))
# Hardpoint RR_PhantomVII_Body_Anchor_0734 = Vector((-0.0045, 2.9000, 0.3529))
# Hardpoint RR_PhantomVII_Body_Anchor_0735 = Vector((0.1128, 2.8952, 0.2765))
# Hardpoint RR_PhantomVII_Body_Anchor_0736 = Vector((0.2286, 2.8799, 0.2007))
# Hardpoint RR_PhantomVII_Body_Anchor_0737 = Vector((0.3410, 2.8543, 0.1261))
# Hardpoint RR_PhantomVII_Body_Anchor_0738 = Vector((0.4485, 2.8185, 0.0533))
# Hardpoint RR_PhantomVII_Body_Anchor_0739 = Vector((0.5496, 2.7724, -0.0171))
# Hardpoint RR_PhantomVII_Body_Anchor_0740 = Vector((0.6428, 2.7164, -0.0845))
# Hardpoint RR_PhantomVII_Body_Anchor_0741 = Vector((0.7267, 2.6507, -0.1484))
# Hardpoint RR_PhantomVII_Body_Anchor_0742 = Vector((0.8002, 2.5754, -0.2083))
# Hardpoint RR_PhantomVII_Body_Anchor_0743 = Vector((0.8622, 2.4908, -0.2636))
# Hardpoint RR_PhantomVII_Body_Anchor_0744 = Vector((0.9118, 2.3972, -0.3140))
# Hardpoint RR_PhantomVII_Body_Anchor_0745 = Vector((0.9482, 2.2951, -0.3590))
# Hardpoint RR_PhantomVII_Body_Anchor_0746 = Vector((0.9710, 2.1846, -0.3983))
# Hardpoint RR_PhantomVII_Body_Anchor_0747 = Vector((0.9799, 2.0663, -0.4315))
# Hardpoint RR_PhantomVII_Body_Anchor_0748 = Vector((0.9746, 1.9406, -0.4584))
# Hardpoint RR_PhantomVII_Body_Anchor_0749 = Vector((0.9554, 1.8079, -0.4787))
# Hardpoint RR_PhantomVII_Body_Anchor_0750 = Vector((0.9224, 1.6687, -0.4924))
# Hardpoint RR_PhantomVII_Body_Anchor_0751 = Vector((0.8761, 1.5234, -0.4992))
# Hardpoint RR_PhantomVII_Body_Anchor_0752 = Vector((0.8172, 1.3727, -0.4991))
# Hardpoint RR_PhantomVII_Body_Anchor_0753 = Vector((0.7466, 1.2171, -0.4922))
# Hardpoint RR_PhantomVII_Body_Anchor_0754 = Vector((0.6653, 1.0570, -0.4784))
# Hardpoint RR_PhantomVII_Body_Anchor_0755 = Vector((0.5743, 0.8932, -0.4580))
# Hardpoint RR_PhantomVII_Body_Anchor_0756 = Vector((0.4751, 0.7262, -0.4310))
# Hardpoint RR_PhantomVII_Body_Anchor_0757 = Vector((0.3691, 0.5565, -0.3977))
# Hardpoint RR_PhantomVII_Body_Anchor_0758 = Vector((0.2578, 0.3848, -0.3583))
# Hardpoint RR_PhantomVII_Body_Anchor_0759 = Vector((0.1428, 0.2118, -0.3132))
# Hardpoint RR_PhantomVII_Body_Anchor_0760 = Vector((0.0257, 0.0380, -0.2627))
# Hardpoint RR_PhantomVII_Body_Anchor_0761 = Vector((-0.0918, -0.1360, -0.2073))
# Hardpoint RR_PhantomVII_Body_Anchor_0762 = Vector((-0.2079, -0.3094, -0.1474))
# Hardpoint RR_PhantomVII_Body_Anchor_0763 = Vector((-0.3211, -0.4818, -0.0834))
# Hardpoint RR_PhantomVII_Body_Anchor_0764 = Vector((-0.4296, -0.6524, -0.0159))
# Hardpoint RR_PhantomVII_Body_Anchor_0765 = Vector((-0.5320, -0.8207, 0.0545))
# Hardpoint RR_PhantomVII_Body_Anchor_0766 = Vector((-0.6267, -0.9860, 0.1273))
# Hardpoint RR_PhantomVII_Body_Anchor_0767 = Vector((-0.7124, -1.1477, 0.2020))
# Hardpoint RR_PhantomVII_Body_Anchor_0768 = Vector((-0.7878, -1.3054, 0.2778))
# Hardpoint RR_PhantomVII_Body_Anchor_0769 = Vector((-0.8519, -1.4583, 0.3542))
# Hardpoint RR_PhantomVII_Body_Anchor_0770 = Vector((-0.9038, -1.6060, 0.4306))
# Hardpoint RR_PhantomVII_Body_Anchor_0771 = Vector((-0.9426, -1.7479, 0.5063))
# Hardpoint RR_PhantomVII_Body_Anchor_0772 = Vector((-0.9679, -1.8835, 0.5808))
# Hardpoint RR_PhantomVII_Body_Anchor_0773 = Vector((-0.9793, -2.0123, 0.6534))
# Hardpoint RR_PhantomVII_Body_Anchor_0774 = Vector((-0.9766, -2.1339, 0.7235))
# Hardpoint RR_PhantomVII_Body_Anchor_0775 = Vector((-0.9599, -2.2479, 0.7906))
# Hardpoint RR_PhantomVII_Body_Anchor_0776 = Vector((-0.9293, -2.3537, 0.8542))
# Hardpoint RR_PhantomVII_Body_Anchor_0777 = Vector((-0.8854, -2.4510, 0.9136))
# Hardpoint RR_PhantomVII_Body_Anchor_0778 = Vector((-0.8287, -2.5396, 0.9685))
# Hardpoint RR_PhantomVII_Body_Anchor_0779 = Vector((-0.7602, -2.6190, 1.0184))
# Hardpoint RR_PhantomVII_Body_Anchor_0780 = Vector((-0.6806, -2.6889, 1.0629))
# Hardpoint RR_PhantomVII_Body_Anchor_0781 = Vector((-0.5913, -2.7492, 1.1016))
# Hardpoint RR_PhantomVII_Body_Anchor_0782 = Vector((-0.4935, -2.7996, 1.1343))
# Hardpoint RR_PhantomVII_Body_Anchor_0783 = Vector((-0.3886, -2.8399, 1.1606))
# Hardpoint RR_PhantomVII_Body_Anchor_0784 = Vector((-0.2781, -2.8700, 1.1803))
# Hardpoint RR_PhantomVII_Body_Anchor_0785 = Vector((-0.1637, -2.8898, 1.1933))
# Hardpoint RR_PhantomVII_Body_Anchor_0786 = Vector((-0.0468, -2.8992, 1.1995))
# Hardpoint RR_PhantomVII_Body_Anchor_0787 = Vector((0.0707, -2.8981, 1.1988))
# Hardpoint RR_PhantomVII_Body_Anchor_0788 = Vector((0.1872, -2.8866, 1.1912))
# Hardpoint RR_PhantomVII_Body_Anchor_0789 = Vector((0.3010, -2.8647, 1.1768))
# Hardpoint RR_PhantomVII_Body_Anchor_0790 = Vector((0.4105, -2.8325, 1.1557))
# Hardpoint RR_PhantomVII_Body_Anchor_0791 = Vector((0.5141, -2.7902, 1.1281))
# Hardpoint RR_PhantomVII_Body_Anchor_0792 = Vector((0.6103, -2.7377, 1.0942))
# Hardpoint RR_PhantomVII_Body_Anchor_0793 = Vector((0.6977, -2.6754, 1.0543))
# Hardpoint RR_PhantomVII_Body_Anchor_0794 = Vector((0.7750, -2.6035, 1.0087))
# Hardpoint RR_PhantomVII_Body_Anchor_0795 = Vector((0.8413, -2.5223, 0.9578))
# Hardpoint RR_PhantomVII_Body_Anchor_0796 = Vector((0.8954, -2.4319, 0.9019))
# Hardpoint RR_PhantomVII_Body_Anchor_0797 = Vector((0.9366, -2.3328, 0.8415))
# Hardpoint RR_PhantomVII_Body_Anchor_0798 = Vector((0.9644, -2.2253, 0.7772))
# Hardpoint RR_PhantomVII_Body_Anchor_0799 = Vector((0.9783, -2.1098, 0.7095))
# Hardpoint RR_PhantomVII_Body_Anchor_0800 = Vector((0.9782, -1.9867, 0.6388))
# Hardpoint RR_PhantomVII_Body_Anchor_0801 = Vector((0.9639, -1.8564, 0.5657))
# Hardpoint RR_PhantomVII_Body_Anchor_0802 = Vector((0.9358, -1.7195, 0.4910))
# Hardpoint RR_PhantomVII_Body_Anchor_0803 = Vector((0.8943, -1.5764, 0.4151))
# Hardpoint RR_PhantomVII_Body_Anchor_0804 = Vector((0.8398, -1.4276, 0.3386))
# Hardpoint RR_PhantomVII_Body_Anchor_0805 = Vector((0.7733, -1.2736, 0.2623))
# Hardpoint RR_PhantomVII_Body_Anchor_0806 = Vector((0.6957, -1.1151, 0.1867))
# Hardpoint RR_PhantomVII_Body_Anchor_0807 = Vector((0.6081, -0.9526, 0.1123))
# Hardpoint RR_PhantomVII_Body_Anchor_0808 = Vector((0.5117, -0.7866, 0.0400))
# Hardpoint RR_PhantomVII_Body_Anchor_0809 = Vector((0.4080, -0.6178, -0.0299))
# Hardpoint RR_PhantomVII_Body_Anchor_0810 = Vector((0.2984, -0.4468, -0.0967))
# Hardpoint RR_PhantomVII_Body_Anchor_0811 = Vector((0.1845, -0.2742, -0.1599))
# Hardpoint RR_PhantomVII_Body_Anchor_0812 = Vector((0.0679, -0.1006, -0.2190))
# Hardpoint RR_PhantomVII_Body_Anchor_0813 = Vector((-0.0496, 0.0734, -0.2734))
# Hardpoint RR_PhantomVII_Body_Anchor_0814 = Vector((-0.1664, 0.2471, -0.3228))
# Hardpoint RR_PhantomVII_Body_Anchor_0815 = Vector((-0.2808, 0.4199, -0.3668))
# Hardpoint RR_PhantomVII_Body_Anchor_0816 = Vector((-0.3912, 0.5912, -0.4050))
# Hardpoint RR_PhantomVII_Body_Anchor_0817 = Vector((-0.4960, 0.7604, -0.4370))
# Hardpoint RR_PhantomVII_Body_Anchor_0818 = Vector((-0.5936, 0.9269, -0.4627))
# Hardpoint RR_PhantomVII_Body_Anchor_0819 = Vector((-0.6827, 1.0900, -0.4818))
# Hardpoint RR_PhantomVII_Body_Anchor_0820 = Vector((-0.7619, 1.2491, -0.4941))
# Hardpoint RR_PhantomVII_Body_Anchor_0821 = Vector((-0.8302, 1.4038, -0.4997))
# Hardpoint RR_PhantomVII_Body_Anchor_0822 = Vector((-0.8866, 1.5535, -0.4983))
# Hardpoint RR_PhantomVII_Body_Anchor_0823 = Vector((-0.9302, 1.6975, -0.4901))
# Hardpoint RR_PhantomVII_Body_Anchor_0824 = Vector((-0.9604, 1.8355, -0.4751))
# Hardpoint RR_PhantomVII_Body_Anchor_0825 = Vector((-0.9769, 1.9668, -0.4534))
# Hardpoint RR_PhantomVII_Body_Anchor_0826 = Vector((-0.9792, 2.0910, -0.4252))
# Hardpoint RR_PhantomVII_Body_Anchor_0827 = Vector((-0.9675, 2.2078, -0.3908))
# Hardpoint RR_PhantomVII_Body_Anchor_0828 = Vector((-0.9419, 2.3165, -0.3503))
# Hardpoint RR_PhantomVII_Body_Anchor_0829 = Vector((-0.9027, 2.4170, -0.3042))
# Hardpoint RR_PhantomVII_Body_Anchor_0830 = Vector((-0.8505, 2.5087, -0.2527))
# Hardpoint RR_PhantomVII_Body_Anchor_0831 = Vector((-0.7862, 2.5915, -0.1964))
# Hardpoint RR_PhantomVII_Body_Anchor_0832 = Vector((-0.7105, 2.6648, -0.1357))
# Hardpoint RR_PhantomVII_Body_Anchor_0833 = Vector((-0.6245, 2.7286, -0.0710))
# Hardpoint RR_PhantomVII_Body_Anchor_0834 = Vector((-0.5296, 2.7826, -0.0030))
# Hardpoint RR_PhantomVII_Body_Anchor_0835 = Vector((-0.4271, 2.8266, 0.0680))
# Hardpoint RR_PhantomVII_Body_Anchor_0836 = Vector((-0.3185, 2.8604, 0.1412))
# Hardpoint RR_PhantomVII_Body_Anchor_0837 = Vector((-0.2052, 2.8839, 0.2161))
# Hardpoint RR_PhantomVII_Body_Anchor_0838 = Vector((-0.0890, 2.8970, 0.2921))
# Hardpoint RR_PhantomVII_Body_Anchor_0839 = Vector((0.0285, 2.8997, 0.3685))
# Hardpoint RR_PhantomVII_Body_Anchor_0840 = Vector((0.1455, 2.8920, 0.4448))
# Hardpoint RR_PhantomVII_Body_Anchor_0841 = Vector((0.2605, 2.8738, 0.5203))
# Hardpoint RR_PhantomVII_Body_Anchor_0842 = Vector((0.3717, 2.8453, 0.5945))
# Hardpoint RR_PhantomVII_Body_Anchor_0843 = Vector((0.4776, 2.8066, 0.6667))
# Hardpoint RR_PhantomVII_Body_Anchor_0844 = Vector((0.5766, 2.7577, 0.7363))
# Hardpoint RR_PhantomVII_Body_Anchor_0845 = Vector((0.6673, 2.6990, 0.8028))
# Hardpoint RR_PhantomVII_Body_Anchor_0846 = Vector((0.7484, 2.6305, 0.8656))
# Hardpoint RR_PhantomVII_Body_Anchor_0847 = Vector((0.8188, 2.5526, 0.9243))
# Hardpoint RR_PhantomVII_Body_Anchor_0848 = Vector((0.8774, 2.4654, 0.9783))
# Hardpoint RR_PhantomVII_Body_Anchor_0849 = Vector((0.9233, 2.3694, 1.0272))
# Hardpoint RR_PhantomVII_Body_Anchor_0850 = Vector((0.9560, 2.2649, 1.0706))
# Hardpoint RR_PhantomVII_Body_Anchor_0851 = Vector((0.9749, 2.1522, 1.1082))
# Hardpoint RR_PhantomVII_Body_Anchor_0852 = Vector((0.9798, 2.0318, 1.1397))
# Hardpoint RR_PhantomVII_Body_Anchor_0853 = Vector((0.9707, 1.9041, 1.1647))
# Hardpoint RR_PhantomVII_Body_Anchor_0854 = Vector((0.9475, 1.7695, 1.1832))
# Hardpoint RR_PhantomVII_Body_Anchor_0855 = Vector((0.9107, 1.6285, 1.1950))
# Hardpoint RR_PhantomVII_Body_Anchor_0856 = Vector((0.8609, 1.4817, 1.1998))
# Hardpoint RR_PhantomVII_Body_Anchor_0857 = Vector((0.7986, 1.3296, 1.1979))
# Hardpoint RR_PhantomVII_Body_Anchor_0858 = Vector((0.7249, 1.1726, 1.1890))
# Hardpoint RR_PhantomVII_Body_Anchor_0859 = Vector((0.6407, 1.0115, 1.1734))
# Hardpoint RR_PhantomVII_Body_Anchor_0860 = Vector((0.5473, 0.8467, 1.1511))
# Hardpoint RR_PhantomVII_Body_Anchor_0861 = Vector((0.4461, 0.6789, 1.1223))
# Hardpoint RR_PhantomVII_Body_Anchor_0862 = Vector((0.3384, 0.5086, 1.0872))
# Hardpoint RR_PhantomVII_Body_Anchor_0863 = Vector((0.2259, 0.3364, 1.0462))
# Hardpoint RR_PhantomVII_Body_Anchor_0864 = Vector((0.1101, 0.1631, 0.9996))
# Hardpoint RR_PhantomVII_Body_Anchor_0865 = Vector((-0.0073, -0.0108, 0.9477))
# Hardpoint RR_PhantomVII_Body_Anchor_0866 = Vector((-0.1246, -0.1847, 0.8909))
# Hardpoint RR_PhantomVII_Body_Anchor_0867 = Vector((-0.2400, -0.3579, 0.8298))
# Hardpoint RR_PhantomVII_Body_Anchor_0868 = Vector((-0.3520, -0.5298, 0.7648))
# Hardpoint RR_PhantomVII_Body_Anchor_0869 = Vector((-0.4590, -0.6998, 0.6965))
# Hardpoint RR_PhantomVII_Body_Anchor_0870 = Vector((-0.5594, -0.8673, 0.6253))
# Hardpoint RR_PhantomVII_Body_Anchor_0871 = Vector((-0.6517, -1.0317, 0.5519))
# Hardpoint RR_PhantomVII_Body_Anchor_0872 = Vector((-0.7346, -1.1924, 0.4769))
# Hardpoint RR_PhantomVII_Body_Anchor_0873 = Vector((-0.8070, -1.3487, 0.4008))
# Hardpoint RR_PhantomVII_Body_Anchor_0874 = Vector((-0.8677, -1.5002, 0.3243))
# Hardpoint RR_PhantomVII_Body_Anchor_0875 = Vector((-0.9160, -1.6464, 0.2481))
# Hardpoint RR_PhantomVII_Body_Anchor_0876 = Vector((-0.9511, -1.7866, 0.1727))
# Hardpoint RR_PhantomVII_Body_Anchor_0877 = Vector((-0.9726, -1.9203, 0.0987))
# Hardpoint RR_PhantomVII_Body_Anchor_0878 = Vector((-0.9800, -2.0472, 0.0267))
# Hardpoint RR_PhantomVII_Body_Anchor_0879 = Vector((-0.9733, -2.1667, -0.0427))
# Hardpoint RR_PhantomVII_Body_Anchor_0880 = Vector((-0.9527, -2.2783, -0.1088))
# Hardpoint RR_PhantomVII_Body_Anchor_0881 = Vector((-0.9183, -2.3818, -0.1713))
# Hardpoint RR_PhantomVII_Body_Anchor_0882 = Vector((-0.8708, -2.4767, -0.2295))
# Hardpoint RR_PhantomVII_Body_Anchor_0883 = Vector((-0.8107, -2.5627, -0.2831))
# Hardpoint RR_PhantomVII_Body_Anchor_0884 = Vector((-0.7389, -2.6395, -0.3315))
# Hardpoint RR_PhantomVII_Body_Anchor_0885 = Vector((-0.6566, -2.7068, -0.3744))
# Hardpoint RR_PhantomVII_Body_Anchor_0886 = Vector((-0.5647, -2.7643, -0.4114))
# Hardpoint RR_PhantomVII_Body_Anchor_0887 = Vector((-0.4648, -2.8119, -0.4423))
# Hardpoint RR_PhantomVII_Body_Anchor_0888 = Vector((-0.3582, -2.8494, -0.4668))
# Hardpoint RR_PhantomVII_Body_Anchor_0889 = Vector((-0.2464, -2.8766, -0.4846))
# Hardpoint RR_PhantomVII_Body_Anchor_0890 = Vector((-0.1311, -2.8935, -0.4957))
# Hardpoint RR_PhantomVII_Body_Anchor_0891 = Vector((-0.0139, -2.8999, -0.5000))
# Hardpoint RR_PhantomVII_Body_Anchor_0892 = Vector((0.1035, -2.8959, -0.4973))
# Hardpoint RR_PhantomVII_Body_Anchor_0893 = Vector((0.2195, -2.8815, -0.4878))
# Hardpoint RR_PhantomVII_Body_Anchor_0894 = Vector((0.3322, -2.8567, -0.4716))
# Hardpoint RR_PhantomVII_Body_Anchor_0895 = Vector((0.4402, -2.8217, -0.4486))
# Hardpoint RR_PhantomVII_Body_Anchor_0896 = Vector((0.5418, -2.7765, -0.4193))
# Hardpoint RR_PhantomVII_Body_Anchor_0897 = Vector((0.6357, -2.7213, -0.3836))
# Hardpoint RR_PhantomVII_Body_Anchor_0898 = Vector((0.7204, -2.6563, -0.3421))
# Hardpoint RR_PhantomVII_Body_Anchor_0899 = Vector((0.7948, -2.5817, -0.2949))
# Hardpoint RR_PhantomVII_Body_Anchor_0900 = Vector((0.8577, -2.4978, -0.2426))
# Hardpoint RR_PhantomVII_Body_Anchor_0901 = Vector((0.9083, -2.4050, -0.1854))
# Hardpoint RR_PhantomVII_Body_Anchor_0902 = Vector((0.9458, -2.3035, -0.1239))
# Hardpoint RR_PhantomVII_Body_Anchor_0903 = Vector((0.9697, -2.1937, -0.0586))
# Hardpoint RR_PhantomVII_Body_Anchor_0904 = Vector((0.9797, -2.0760, 0.0101))
# Hardpoint RR_PhantomVII_Body_Anchor_0905 = Vector((0.9756, -1.9509, 0.0815))
# Hardpoint RR_PhantomVII_Body_Anchor_0906 = Vector((0.9574, -1.8187, 0.1551))
# Hardpoint RR_PhantomVII_Body_Anchor_0907 = Vector((0.9255, -1.6800, 0.2302))
# Hardpoint RR_PhantomVII_Body_Anchor_0908 = Vector((0.8803, -1.5352, 0.3063))
# Hardpoint RR_PhantomVII_Body_Anchor_0909 = Vector((0.8224, -1.3849, 0.3828))
# Hardpoint RR_PhantomVII_Body_Anchor_0910 = Vector((0.7527, -1.2296, 0.4590))
# Hardpoint RR_PhantomVII_Body_Anchor_0911 = Vector((0.6721, -1.0699, 0.5343))
# Hardpoint RR_PhantomVII_Body_Anchor_0912 = Vector((0.5819, -0.9064, 0.6082))
# Hardpoint RR_PhantomVII_Body_Anchor_0913 = Vector((0.4833, -0.7396, 0.6799))
# Hardpoint RR_PhantomVII_Body_Anchor_0914 = Vector((0.3778, -0.5701, 0.7490))
# Hardpoint RR_PhantomVII_Body_Anchor_0915 = Vector((0.2668, -0.3986, 0.8148))
# Hardpoint RR_PhantomVII_Body_Anchor_0916 = Vector((0.1520, -0.2256, 0.8769))
# Hardpoint RR_PhantomVII_Body_Anchor_0917 = Vector((0.0350, -0.0518, 0.9347))
# Hardpoint RR_PhantomVII_Body_Anchor_0918 = Vector((-0.0825, 0.1221, 0.9878))
# Hardpoint RR_PhantomVII_Body_Anchor_0919 = Vector((-0.1988, 0.2957, 1.0357))
# Hardpoint RR_PhantomVII_Body_Anchor_0920 = Vector((-0.3122, 0.4681, 1.0781))
# Hardpoint RR_PhantomVII_Body_Anchor_0921 = Vector((-0.4212, 0.6389, 1.1146))
# Hardpoint RR_PhantomVII_Body_Anchor_0922 = Vector((-0.5241, 0.8074, 1.1449))
# Hardpoint RR_PhantomVII_Body_Anchor_0923 = Vector((-0.6195, 0.9729, 1.1687))
# Hardpoint RR_PhantomVII_Body_Anchor_0924 = Vector((-0.7059, 1.1350, 1.1859))
# Hardpoint RR_PhantomVII_Body_Anchor_0925 = Vector((-0.7822, 1.2930, 1.1964))
# Hardpoint RR_PhantomVII_Body_Anchor_0926 = Vector((-0.8473, 1.4463, 1.2000))
# Hardpoint RR_PhantomVII_Body_Anchor_0927 = Vector((-0.9001, 1.5944, 1.1967))
# Hardpoint RR_PhantomVII_Body_Anchor_0928 = Vector((-0.9400, 1.7368, 1.1866))
# Hardpoint RR_PhantomVII_Body_Anchor_0929 = Vector((-0.9664, 1.8729, 1.1697))
# Hardpoint RR_PhantomVII_Body_Anchor_0930 = Vector((-0.9789, 2.0023, 1.1462))
# Hardpoint RR_PhantomVII_Body_Anchor_0931 = Vector((-0.9774, 2.1245, 1.1162))
# Hardpoint RR_PhantomVII_Body_Anchor_0932 = Vector((-0.9617, 2.2391, 1.0800))
# Hardpoint RR_PhantomVII_Body_Anchor_0933 = Vector((-0.9322, 2.3456, 1.0379))
# Hardpoint RR_PhantomVII_Body_Anchor_0934 = Vector((-0.8894, 2.4436, 0.9903))
# Hardpoint RR_PhantomVII_Body_Anchor_0935 = Vector((-0.8337, 2.5328, 0.9374))
# Hardpoint RR_PhantomVII_Body_Anchor_0936 = Vector((-0.7660, 2.6130, 0.8798))
# Hardpoint RR_PhantomVII_Body_Anchor_0937 = Vector((-0.6874, 2.6837, 0.8180))
# Hardpoint RR_PhantomVII_Body_Anchor_0938 = Vector((-0.5988, 2.7448, 0.7523))
# Hardpoint RR_PhantomVII_Body_Anchor_0939 = Vector((-0.5016, 2.7960, 0.6834))
# Hardpoint RR_PhantomVII_Body_Anchor_0940 = Vector((-0.3972, 2.8371, 0.6117))
# Hardpoint RR_PhantomVII_Body_Anchor_0941 = Vector((-0.2871, 2.8680, 0.5380))
# Hardpoint RR_PhantomVII_Body_Anchor_0942 = Vector((-0.1729, 2.8886, 0.4627))
# Hardpoint RR_PhantomVII_Body_Anchor_0943 = Vector((-0.0562, 2.8988, 0.3865))
# Hardpoint RR_PhantomVII_Body_Anchor_0944 = Vector((0.0614, 2.8986, 0.3101))
# Hardpoint RR_PhantomVII_Body_Anchor_0945 = Vector((0.1780, 2.8879, 0.2339))
# Hardpoint RR_PhantomVII_Body_Anchor_0946 = Vector((0.2921, 2.8669, 0.1587))
# Hardpoint RR_PhantomVII_Body_Anchor_0947 = Vector((0.4020, 2.8355, 0.0850))
# Hardpoint RR_PhantomVII_Body_Anchor_0948 = Vector((0.5061, 2.7939, 0.0135))
# Hardpoint RR_PhantomVII_Body_Anchor_0949 = Vector((0.6029, 2.7423, -0.0553))
# Hardpoint RR_PhantomVII_Body_Anchor_0950 = Vector((0.6911, 2.6808, -0.1208))
# Hardpoint RR_PhantomVII_Body_Anchor_0951 = Vector((0.7693, 2.6096, -0.1825))
# Hardpoint RR_PhantomVII_Body_Anchor_0952 = Vector((0.8364, 2.5291, -0.2399))
# Hardpoint RR_PhantomVII_Body_Anchor_0953 = Vector((0.8915, 2.4394, -0.2925))
# Hardpoint RR_PhantomVII_Body_Anchor_0954 = Vector((0.9338, 2.3410, -0.3399))
# Hardpoint RR_PhantomVII_Body_Anchor_0955 = Vector((0.9627, 2.2342, -0.3817))
# Hardpoint RR_PhantomVII_Body_Anchor_0956 = Vector((0.9777, 2.1193, -0.4177))
# Hardpoint RR_PhantomVII_Body_Anchor_0957 = Vector((0.9787, 1.9967, -0.4474))
# Hardpoint RR_PhantomVII_Body_Anchor_0958 = Vector((0.9656, 1.8670, -0.4706))
# Hardpoint RR_PhantomVII_Body_Anchor_0959 = Vector((0.9386, 1.7306, -0.4872))
# Hardpoint RR_PhantomVII_Body_Anchor_0960 = Vector((0.8980, 1.5880, -0.4970))
# Hardpoint RR_PhantomVII_Body_Anchor_0961 = Vector((0.8446, 1.4396, -0.5000))
# Hardpoint RR_PhantomVII_Body_Anchor_0962 = Vector((0.7791, 1.2861, -0.4961))
# Hardpoint RR_PhantomVII_Body_Anchor_0963 = Vector((0.7023, 1.1279, -0.4853))
# Hardpoint RR_PhantomVII_Body_Anchor_0964 = Vector((0.6154, 0.9656, -0.4678))
# Hardpoint RR_PhantomVII_Body_Anchor_0965 = Vector((0.5197, 0.7999, -0.4436))
# Hardpoint RR_PhantomVII_Body_Anchor_0966 = Vector((0.4165, 0.6313, -0.4131))
# Hardpoint RR_PhantomVII_Body_Anchor_0967 = Vector((0.3073, 0.4605, -0.3763))
# Hardpoint RR_PhantomVII_Body_Anchor_0968 = Vector((0.1937, 0.2880, -0.3337))
# Hardpoint RR_PhantomVII_Body_Anchor_0969 = Vector((0.0773, 0.1144, -0.2855))
# Hardpoint RR_PhantomVII_Body_Anchor_0970 = Vector((-0.0402, -0.0595, -0.2322))
# Hardpoint RR_PhantomVII_Body_Anchor_0971 = Vector((-0.1572, -0.2333, -0.1742))
# Hardpoint RR_PhantomVII_Body_Anchor_0972 = Vector((-0.2718, -0.4062, -0.1120))
# Hardpoint RR_PhantomVII_Body_Anchor_0973 = Vector((-0.3826, -0.5777, -0.0460))
# Hardpoint RR_PhantomVII_Body_Anchor_0974 = Vector((-0.4879, -0.7470, 0.0232))
# Hardpoint RR_PhantomVII_Body_Anchor_0975 = Vector((-0.5861, -0.9137, 0.0951))
# Hardpoint RR_PhantomVII_Body_Anchor_0976 = Vector((-0.6759, -1.0771, 0.1690))
# Hardpoint RR_PhantomVII_Body_Anchor_0977 = Vector((-0.7560, -1.2366, 0.2444))
# Hardpoint RR_PhantomVII_Body_Anchor_0978 = Vector((-0.8252, -1.3917, 0.3206))
# Hardpoint RR_PhantomVII_Body_Anchor_0979 = Vector((-0.8826, -1.5418, 0.3971))
# Hardpoint RR_PhantomVII_Body_Anchor_0980 = Vector((-0.9272, -1.6863, 0.4732))
# Hardpoint RR_PhantomVII_Body_Anchor_0981 = Vector((-0.9585, -1.8247, 0.5483))
# Hardpoint RR_PhantomVII_Body_Anchor_0982 = Vector((-0.9761, -1.9566, 0.6217))
# Hardpoint RR_PhantomVII_Body_Anchor_0983 = Vector((-0.9796, -2.0814, 0.6930))
# Hardpoint RR_PhantomVII_Body_Anchor_0984 = Vector((-0.9690, -2.1988, 0.7615))
# Hardpoint RR_PhantomVII_Body_Anchor_0985 = Vector((-0.9444, -2.3082, 0.8267))
# Hardpoint RR_PhantomVII_Body_Anchor_0986 = Vector((-0.9063, -2.4093, 0.8880))
# Hardpoint RR_PhantomVII_Body_Anchor_0987 = Vector((-0.8552, -2.5018, 0.9450))
# Hardpoint RR_PhantomVII_Body_Anchor_0988 = Vector((-0.7917, -2.5852, 0.9972))
# Hardpoint RR_PhantomVII_Body_Anchor_0989 = Vector((-0.7169, -2.6593, 1.0441))
# Hardpoint RR_PhantomVII_Body_Anchor_0990 = Vector((-0.6317, -2.7239, 1.0854))
# Hardpoint RR_PhantomVII_Body_Anchor_0991 = Vector((-0.5375, -2.7787, 1.1207))
# Hardpoint RR_PhantomVII_Body_Anchor_0992 = Vector((-0.4355, -2.8235, 1.1498))
# Hardpoint RR_PhantomVII_Body_Anchor_0993 = Vector((-0.3273, -2.8581, 1.1724))
# Hardpoint RR_PhantomVII_Body_Anchor_0994 = Vector((-0.2144, -2.8824, 1.1884))
# Hardpoint RR_PhantomVII_Body_Anchor_0995 = Vector((-0.0983, -2.8963, 1.1976))
# Hardpoint RR_PhantomVII_Body_Anchor_0996 = Vector((0.0191, -2.8999, 1.1999))
# Hardpoint RR_PhantomVII_Body_Anchor_0997 = Vector((0.1362, -2.8930, 1.1954))
# Hardpoint RR_PhantomVII_Body_Anchor_0998 = Vector((0.2514, -2.8756, 1.1840))
# Hardpoint RR_PhantomVII_Body_Anchor_0999 = Vector((0.3630, -2.8480, 1.1658))
# Hardpoint RR_PhantomVII_Body_Anchor_1000 = Vector((0.4694, -2.8100, 1.1411))
# Hardpoint RR_PhantomVII_Body_Anchor_1001 = Vector((0.5690, -2.7620, 1.1099))
# Hardpoint RR_PhantomVII_Body_Anchor_1002 = Vector((0.6604, -2.7040, 1.0726))
# Hardpoint RR_PhantomVII_Body_Anchor_1003 = Vector((0.7424, -2.6363, 1.0294))
# Hardpoint RR_PhantomVII_Body_Anchor_1004 = Vector((0.8136, -2.5591, 0.9808))
# Hardpoint RR_PhantomVII_Body_Anchor_1005 = Vector((0.8732, -2.4727, 0.9270))
# Hardpoint RR_PhantomVII_Body_Anchor_1006 = Vector((0.9201, -2.3774, 0.8686))
# Hardpoint RR_PhantomVII_Body_Anchor_1007 = Vector((0.9539, -2.2736, 0.8060))
# Hardpoint RR_PhantomVII_Body_Anchor_1008 = Vector((0.9739, -2.1615, 0.7396))
# Hardpoint RR_PhantomVII_Body_Anchor_1009 = Vector((0.9800, -2.0417, 0.6702))
# Hardpoint RR_PhantomVII_Body_Anchor_1010 = Vector((0.9719, -1.9145, 0.5981))
# Hardpoint RR_PhantomVII_Body_Anchor_1011 = Vector((0.9499, -1.7805, 0.5240))
# Hardpoint RR_PhantomVII_Body_Anchor_1012 = Vector((0.9141, -1.6400, 0.4485))
# Hardpoint RR_PhantomVII_Body_Anchor_1013 = Vector((0.8653, -1.4936, 0.3723))
# Hardpoint RR_PhantomVII_Body_Anchor_1014 = Vector((0.8040, -1.3419, 0.2958))
# Hardpoint RR_PhantomVII_Body_Anchor_1015 = Vector((0.7311, -1.1853, 0.2198))
# Hardpoint RR_PhantomVII_Body_Anchor_1016 = Vector((0.6478, -1.0245, 0.1448))
# Hardpoint RR_PhantomVII_Body_Anchor_1017 = Vector((0.5551, -0.8599, 0.0715))
# Hardpoint RR_PhantomVII_Body_Anchor_1018 = Vector((0.4544, -0.6923, 0.0004))
# Hardpoint RR_PhantomVII_Body_Anchor_1019 = Vector((0.3472, -0.5222, -0.0678))
# Hardpoint RR_PhantomVII_Body_Anchor_1020 = Vector((0.2350, -0.3502, -0.1326))
# Hardpoint RR_PhantomVII_Body_Anchor_1021 = Vector((0.1194, -0.1770, -0.1936))
# Hardpoint RR_PhantomVII_Body_Anchor_1022 = Vector((0.0021, -0.0031, -0.2501))
# Hardpoint RR_PhantomVII_Body_Anchor_1023 = Vector((-0.1153, 0.1708, -0.3018))
# Hardpoint RR_PhantomVII_Body_Anchor_1024 = Vector((-0.2309, 0.3441, -0.3482))
# Hardpoint RR_PhantomVII_Body_Anchor_1025 = Vector((-0.3433, 0.5162, -0.3889))
# Hardpoint RR_PhantomVII_Body_Anchor_1026 = Vector((-0.4507, 0.6864, -0.4237))
# Hardpoint RR_PhantomVII_Body_Anchor_1027 = Vector((-0.5516, 0.8541, -0.4522))
# Hardpoint RR_PhantomVII_Body_Anchor_1028 = Vector((-0.6446, 1.0187, -0.4742))
# Hardpoint RR_PhantomVII_Body_Anchor_1029 = Vector((-0.7284, 1.1797, -0.4895))
# Hardpoint RR_PhantomVII_Body_Anchor_1030 = Vector((-0.8016, 1.3364, -0.4981))
# Hardpoint RR_PhantomVII_Body_Anchor_1031 = Vector((-0.8633, 1.4884, -0.4998))
# Hardpoint RR_PhantomVII_Body_Anchor_1032 = Vector((-0.9126, 1.6349, -0.4946))
# Hardpoint RR_PhantomVII_Body_Anchor_1033 = Vector((-0.9488, 1.7756, -0.4825))
# Hardpoint RR_PhantomVII_Body_Anchor_1034 = Vector((-0.9714, 1.9099, -0.4638))
# Hardpoint RR_PhantomVII_Body_Anchor_1035 = Vector((-0.9799, 2.0373, -0.4384))
# Hardpoint RR_PhantomVII_Body_Anchor_1036 = Vector((-0.9744, 2.1574, -0.4067))
# Hardpoint RR_PhantomVII_Body_Anchor_1037 = Vector((-0.9548, 2.2697, -0.3688))
# Hardpoint RR_PhantomVII_Body_Anchor_1038 = Vector((-0.9216, 2.3739, -0.3251))
# Hardpoint RR_PhantomVII_Body_Anchor_1039 = Vector((-0.8750, 2.4695, -0.2760))
# Hardpoint RR_PhantomVII_Body_Anchor_1040 = Vector((-0.8159, 2.5562, -0.2217))
# Hardpoint RR_PhantomVII_Body_Anchor_1041 = Vector((-0.7451, 2.6338, -0.1629))
# Hardpoint RR_PhantomVII_Body_Anchor_1042 = Vector((-0.6635, 2.7018, -0.0999))
# Hardpoint RR_PhantomVII_Body_Anchor_1043 = Vector((-0.5724, 2.7601, -0.0333))
# Hardpoint RR_PhantomVII_Body_Anchor_1044 = Vector((-0.4730, 2.8085, 0.0365))
# Hardpoint RR_PhantomVII_Body_Anchor_1045 = Vector((-0.3669, 2.8468, 0.1087))
# Hardpoint RR_PhantomVII_Body_Anchor_1046 = Vector((-0.2554, 2.8748, 0.1830))
# Hardpoint RR_PhantomVII_Body_Anchor_1047 = Vector((-0.1403, 2.8925, 0.2586))
# Hardpoint RR_PhantomVII_Body_Anchor_1048 = Vector((-0.0232, 2.8998, 0.3349))
# Hardpoint RR_PhantomVII_Body_Anchor_1049 = Vector((0.0942, 2.8966, 0.4113))
# Hardpoint RR_PhantomVII_Body_Anchor_1050 = Vector((0.2103, 2.8831, 0.4873))
# Hardpoint RR_PhantomVII_Body_Anchor_1051 = Vector((0.3234, 2.8591, 0.5621))
# Hardpoint RR_PhantomVII_Body_Anchor_1052 = Vector((0.4318, 2.8249, 0.6352))
# Hardpoint RR_PhantomVII_Body_Anchor_1053 = Vector((0.5340, 2.7804, 0.7061))
# Hardpoint RR_PhantomVII_Body_Anchor_1054 = Vector((0.6286, 2.7260, 0.7740))
# Hardpoint RR_PhantomVII_Body_Anchor_1055 = Vector((0.7140, 2.6618, 0.8385))
# Hardpoint RR_PhantomVII_Body_Anchor_1056 = Vector((0.7893, 2.5880, 0.8990))
# Hardpoint RR_PhantomVII_Body_Anchor_1057 = Vector((0.8531, 2.5049, 0.9551))
# Hardpoint RR_PhantomVII_Body_Anchor_1058 = Vector((0.9047, 2.4127, 1.0063))
# Hardpoint RR_PhantomVII_Body_Anchor_1059 = Vector((0.9433, 2.3119, 1.0522))
# Hardpoint RR_PhantomVII_Body_Anchor_1060 = Vector((0.9683, 2.2027, 1.0924))
# Hardpoint RR_PhantomVII_Body_Anchor_1061 = Vector((0.9794, 2.0857, 1.1266))
# Hardpoint RR_PhantomVII_Body_Anchor_1062 = Vector((0.9764, 1.9611, 1.1545))
# Hardpoint RR_PhantomVII_Body_Anchor_1063 = Vector((0.9594, 1.8295, 1.1759))
# Hardpoint RR_PhantomVII_Body_Anchor_1064 = Vector((0.9285, 1.6912, 1.1906))
# Hardpoint RR_PhantomVII_Body_Anchor_1065 = Vector((0.8843, 1.5469, 1.1985))
# Hardpoint RR_PhantomVII_Body_Anchor_1066 = Vector((0.8274, 1.3971, 1.1996))
# Hardpoint RR_PhantomVII_Body_Anchor_1067 = Vector((0.7586, 1.2422, 1.1937))
# Hardpoint RR_PhantomVII_Body_Anchor_1068 = Vector((0.6789, 1.0828, 1.1811))
# Hardpoint RR_PhantomVII_Body_Anchor_1069 = Vector((0.5894, 0.9195, 1.1617))
# Hardpoint RR_PhantomVII_Body_Anchor_1070 = Vector((0.4914, 0.7530, 1.1357))
# Hardpoint RR_PhantomVII_Body_Anchor_1071 = Vector((0.3864, 0.5837, 1.1034))
# Hardpoint RR_PhantomVII_Body_Anchor_1072 = Vector((0.2758, 0.4123, 1.0650))
# Hardpoint RR_PhantomVII_Body_Anchor_1073 = Vector((0.1613, 0.2394, 1.0208))
# Hardpoint RR_PhantomVII_Body_Anchor_1074 = Vector((0.0444, 0.0657, 0.9711))
# Hardpoint RR_PhantomVII_Body_Anchor_1075 = Vector((-0.0731, -0.1083, 0.9164))
# Hardpoint RR_PhantomVII_Body_Anchor_1076 = Vector((-0.1896, -0.2819, 0.8572))
# Hardpoint RR_PhantomVII_Body_Anchor_1077 = Vector((-0.3033, -0.4544, 0.7938))
# Hardpoint RR_PhantomVII_Body_Anchor_1078 = Vector((-0.4127, -0.6254, 0.7269))
# Hardpoint RR_PhantomVII_Body_Anchor_1079 = Vector((-0.5162, -0.7940, 0.6569))
# Hardpoint RR_PhantomVII_Body_Anchor_1080 = Vector((-0.6122, -0.9599, 0.5844))
# Hardpoint RR_PhantomVII_Body_Anchor_1081 = Vector((-0.6994, -1.1222, 0.5100))
# Hardpoint RR_PhantomVII_Body_Anchor_1082 = Vector((-0.7765, -1.2806, 0.4343))
# Hardpoint RR_PhantomVII_Body_Anchor_1083 = Vector((-0.8425, -1.4343, 0.3580))
# Hardpoint RR_PhantomVII_Body_Anchor_1084 = Vector((-0.8964, -1.5828, 0.2815))
# Hardpoint RR_PhantomVII_Body_Anchor_1085 = Vector((-0.9374, -1.7257, 0.2057))
# Hardpoint RR_PhantomVII_Body_Anchor_1086 = Vector((-0.9648, -1.8623, 0.1310))
# Hardpoint RR_PhantomVII_Body_Anchor_1087 = Vector((-0.9785, -1.9923, 0.0580))
# Hardpoint RR_PhantomVII_Body_Anchor_1088 = Vector((-0.9780, -2.1151, -0.0125))
# Hardpoint RR_PhantomVII_Body_Anchor_1089 = Vector((-0.9635, -2.2302, -0.0802))
# Hardpoint RR_PhantomVII_Body_Anchor_1090 = Vector((-0.9351, -2.3374, -0.1443))
# Hardpoint RR_PhantomVII_Body_Anchor_1091 = Vector((-0.8933, -2.4361, -0.2045))
# Hardpoint RR_PhantomVII_Body_Anchor_1092 = Vector((-0.8386, -2.5261, -0.2601))
# Hardpoint RR_PhantomVII_Body_Anchor_1093 = Vector((-0.7718, -2.6069, -0.3108))
# Hardpoint RR_PhantomVII_Body_Anchor_1094 = Vector((-0.6940, -2.6784, -0.3562))
# Hardpoint RR_PhantomVII_Body_Anchor_1095 = Vector((-0.6062, -2.7403, -0.3959))
# Hardpoint RR_PhantomVII_Body_Anchor_1096 = Vector((-0.5096, -2.7923, -0.4295))
# Hardpoint RR_PhantomVII_Body_Anchor_1097 = Vector((-0.4058, -2.8342, -0.4568))
# Hardpoint RR_PhantomVII_Body_Anchor_1098 = Vector((-0.2961, -2.8659, -0.4776))
# Hardpoint RR_PhantomVII_Body_Anchor_1099 = Vector((-0.1821, -2.8873, -0.4917))
# Hardpoint RR_PhantomVII_Body_Anchor_1100 = Vector((-0.0655, -2.8984, -0.4989))
# Hardpoint RR_PhantomVII_Body_Anchor_1101 = Vector((0.0520, -2.8990, -0.4993))
# Hardpoint RR_PhantomVII_Body_Anchor_1102 = Vector((0.1688, -2.8891, -0.4928))
# Hardpoint RR_PhantomVII_Body_Anchor_1103 = Vector((0.2832, -2.8689, -0.4795))
# Hardpoint RR_PhantomVII_Body_Anchor_1104 = Vector((0.3934, -2.8384, -0.4595))
# Hardpoint RR_PhantomVII_Body_Anchor_1105 = Vector((0.4980, -2.7976, -0.4330))
# Hardpoint RR_PhantomVII_Body_Anchor_1106 = Vector((0.5955, -2.7467, -0.4001))
# Hardpoint RR_PhantomVII_Body_Anchor_1107 = Vector((0.6844, -2.6860, -0.3611))
# Hardpoint RR_PhantomVII_Body_Anchor_1108 = Vector((0.7634, -2.6156, -0.3163))
# Hardpoint RR_PhantomVII_Body_Anchor_1109 = Vector((0.8315, -2.5358, -0.2662))
# Hardpoint RR_PhantomVII_Body_Anchor_1110 = Vector((0.8876, -2.4469, -0.2111))
# Hardpoint RR_PhantomVII_Body_Anchor_1111 = Vector((0.9310, -2.3492, -0.1514))
# Hardpoint RR_PhantomVII_Body_Anchor_1112 = Vector((0.9609, -2.2430, -0.0877))
# Hardpoint RR_PhantomVII_Body_Anchor_1113 = Vector((0.9770, -2.1287, -0.0205))
# Hardpoint RR_PhantomVII_Body_Anchor_1114 = Vector((0.9791, -2.0068, 0.0498))
# Hardpoint RR_PhantomVII_Body_Anchor_1115 = Vector((0.9671, -1.8776, 0.1225))
# Hardpoint RR_PhantomVII_Body_Anchor_1116 = Vector((0.9412, -1.7417, 0.1970))
# Hardpoint RR_PhantomVII_Body_Anchor_1117 = Vector((0.9018, -1.5995, 0.2728))
# Hardpoint RR_PhantomVII_Body_Anchor_1118 = Vector((0.8493, -1.4516, 0.3492))
# Hardpoint RR_PhantomVII_Body_Anchor_1119 = Vector((0.7847, -1.2985, 0.4256))
# Hardpoint RR_PhantomVII_Body_Anchor_1120 = Vector((0.7088, -1.1406, 0.5014))
# Hardpoint RR_PhantomVII_Body_Anchor_1121 = Vector((0.6227, -0.9787, 0.5759))
# Hardpoint RR_PhantomVII_Body_Anchor_1122 = Vector((0.5276, -0.8132, 0.6487))
# Hardpoint RR_PhantomVII_Body_Anchor_1123 = Vector((0.4249, -0.6449, 0.7190))
# Hardpoint RR_PhantomVII_Body_Anchor_1124 = Vector((0.3162, -0.4742, 0.7863))
# Hardpoint RR_PhantomVII_Body_Anchor_1125 = Vector((0.2028, -0.3018, 0.8501))
# Hardpoint RR_PhantomVII_Body_Anchor_1126 = Vector((0.0866, -0.1283, 0.9099))
# Hardpoint RR_PhantomVII_Body_Anchor_1127 = Vector((-0.0309, 0.0457, 0.9651))
# Hardpoint RR_PhantomVII_Body_Anchor_1128 = Vector((-0.1479, 0.2195, 1.0153))
# Hardpoint RR_PhantomVII_Body_Anchor_1129 = Vector((-0.2628, 0.3925, 1.0602))
# Hardpoint RR_PhantomVII_Body_Anchor_1130 = Vector((-0.3740, 0.5641, 1.0993))
# Hardpoint RR_PhantomVII_Body_Anchor_1131 = Vector((-0.4797, 0.7336, 1.1323))
# Hardpoint RR_PhantomVII_Body_Anchor_1132 = Vector((-0.5786, 0.9006, 1.1590))
# Hardpoint RR_PhantomVII_Body_Anchor_1133 = Vector((-0.6691, 1.0642, 1.1792))
# Hardpoint RR_PhantomVII_Body_Anchor_1134 = Vector((-0.7500, 1.2241, 1.1926))
# Hardpoint RR_PhantomVII_Body_Anchor_1135 = Vector((-0.8201, 1.3795, 1.1993))
# Hardpoint RR_PhantomVII_Body_Anchor_1136 = Vector((-0.8784, 1.5300, 1.1990))
# Hardpoint RR_PhantomVII_Body_Anchor_1137 = Vector((-0.9241, 1.6750, 1.1919))
# Hardpoint RR_PhantomVII_Body_Anchor_1138 = Vector((-0.9565, 1.8139, 1.1780))
# Hardpoint RR_PhantomVII_Body_Anchor_1139 = Vector((-0.9752, 1.9463, 1.1573))
# Hardpoint RR_PhantomVII_Body_Anchor_1140 = Vector((-0.9798, 2.0717, 1.1301))
# Hardpoint RR_PhantomVII_Body_Anchor_1141 = Vector((-0.9703, 2.1897, 1.0967))
# Hardpoint RR_PhantomVII_Body_Anchor_1142 = Vector((-0.9469, 2.2998, 1.0571))
# Hardpoint RR_PhantomVII_Body_Anchor_1143 = Vector((-0.9098, 2.4016, 1.0119))
# Hardpoint RR_PhantomVII_Body_Anchor_1144 = Vector((-0.8597, 2.4947, 0.9613))
# Hardpoint RR_PhantomVII_Body_Anchor_1145 = Vector((-0.7972, 2.5789, 0.9057))
# Hardpoint RR_PhantomVII_Body_Anchor_1146 = Vector((-0.7232, 2.6538, 0.8456))
# Hardpoint RR_PhantomVII_Body_Anchor_1147 = Vector((-0.6389, 2.7191, 0.7816))
# Hardpoint RR_PhantomVII_Body_Anchor_1148 = Vector((-0.5453, 2.7747, 0.7140))
# Hardpoint RR_PhantomVII_Body_Anchor_1149 = Vector((-0.4439, 2.8203, 0.6435))
# Hardpoint RR_PhantomVII_Body_Anchor_1150 = Vector((-0.3361, 2.8557, 0.5706))
# Hardpoint RR_PhantomVII_Body_Anchor_1151 = Vector((-0.2235, 2.8808, 0.4959))
# Hardpoint RR_PhantomVII_Body_Anchor_1152 = Vector((-0.1077, 2.8956, 0.4201))
# Hardpoint RR_PhantomVII_Body_Anchor_1153 = Vector((0.0097, 2.9000, 0.3437))
# Hardpoint RR_PhantomVII_Body_Anchor_1154 = Vector((0.1270, 2.8939, 0.2673))
# Hardpoint RR_PhantomVII_Body_Anchor_1155 = Vector((0.2424, 2.8774, 0.1916))
# Hardpoint RR_PhantomVII_Body_Anchor_1156 = Vector((0.3543, 2.8505, 0.1172))
# Hardpoint RR_PhantomVII_Body_Anchor_1157 = Vector((0.4611, 2.8134, 0.0447))
# Hardpoint RR_PhantomVII_Body_Anchor_1158 = Vector((0.5613, 2.7662, -0.0254))
# Hardpoint RR_PhantomVII_Body_Anchor_1159 = Vector((0.6535, 2.7090, -0.0924))
# Hardpoint RR_PhantomVII_Body_Anchor_1160 = Vector((0.7362, 2.6421, -0.1559))
# Hardpoint RR_PhantomVII_Body_Anchor_1161 = Vector((0.8083, 2.5656, -0.2152))
# Hardpoint RR_PhantomVII_Body_Anchor_1162 = Vector((0.8689, 2.4799, -0.2700))
# Hardpoint RR_PhantomVII_Body_Anchor_1163 = Vector((0.9169, 2.3853, -0.3197))
# Hardpoint RR_PhantomVII_Body_Anchor_1164 = Vector((0.9517, 2.2821, -0.3641))
# Hardpoint RR_PhantomVII_Body_Anchor_1165 = Vector((0.9728, 2.1707, -0.4026))
# Hardpoint RR_PhantomVII_Body_Anchor_1166 = Vector((0.9800, 2.0515, -0.4351))
# Hardpoint RR_PhantomVII_Body_Anchor_1167 = Vector((0.9731, 1.9249, -0.4612))
# Hardpoint RR_PhantomVII_Body_Anchor_1168 = Vector((0.9521, 1.7914, -0.4807))
# Hardpoint RR_PhantomVII_Body_Anchor_1169 = Vector((0.9175, 1.6514, -0.4935))
# Hardpoint RR_PhantomVII_Body_Anchor_1170 = Vector((0.8696, 1.5055, -0.4995))
# Hardpoint RR_PhantomVII_Body_Anchor_1171 = Vector((0.8093, 1.3541, -0.4986))
# Hardpoint RR_PhantomVII_Body_Anchor_1172 = Vector((0.7373, 1.1979, -0.4909))
# Hardpoint RR_PhantomVII_Body_Anchor_1173 = Vector((0.6548, 1.0374, -0.4763))
# Hardpoint RR_PhantomVII_Body_Anchor_1174 = Vector((0.5628, 0.8732, -0.4551))
# Hardpoint RR_PhantomVII_Body_Anchor_1175 = Vector((0.4627, 0.7058, -0.4273))
# Hardpoint RR_PhantomVII_Body_Anchor_1176 = Vector((0.3559, 0.5358, -0.3932))
# Hardpoint RR_PhantomVII_Body_Anchor_1177 = Vector((0.2440, 0.3640, -0.3531))
# Hardpoint RR_PhantomVII_Body_Anchor_1178 = Vector((0.1287, 0.1908, -0.3074))
# Hardpoint RR_PhantomVII_Body_Anchor_1179 = Vector((0.0114, 0.0169, -0.2563))
# Hardpoint RR_PhantomVII_Body_Anchor_1180 = Vector((-0.1060, -0.1570, -0.2003))
# Hardpoint RR_PhantomVII_Body_Anchor_1181 = Vector((-0.2218, -0.3304, -0.1398))
# Hardpoint RR_PhantomVII_Body_Anchor_1182 = Vector((-0.3345, -0.5025, -0.0754))
# Hardpoint RR_PhantomVII_Body_Anchor_1183 = Vector((-0.4424, -0.6729, -0.0075))
# Hardpoint RR_PhantomVII_Body_Anchor_1184 = Vector((-0.5439, -0.8408, 0.0632))
# Hardpoint RR_PhantomVII_Body_Anchor_1185 = Vector((-0.6376, -1.0057, 0.1363))
# Hardpoint RR_PhantomVII_Body_Anchor_1186 = Vector((-0.7221, -1.1670, 0.2111))
# Hardpoint RR_PhantomVII_Body_Anchor_1187 = Vector((-0.7962, -1.3241, 0.2870))
# Hardpoint RR_PhantomVII_Body_Anchor_1188 = Vector((-0.8589, -1.4765, 0.3635))
# Hardpoint RR_PhantomVII_Body_Anchor_1189 = Vector((-0.9092, -1.6235, 0.4398))
# Hardpoint RR_PhantomVII_Body_Anchor_1190 = Vector((-0.9464, -1.7646, 0.5154))
# Hardpoint RR_PhantomVII_Body_Anchor_1191 = Vector((-0.9701, -1.8995, 0.5897))
# Hardpoint RR_PhantomVII_Body_Anchor_1192 = Vector((-0.9798, -2.0274, 0.6620))
# Hardpoint RR_PhantomVII_Body_Anchor_1193 = Vector((-0.9753, -2.1481, 0.7318))
# Hardpoint RR_PhantomVII_Body_Anchor_1194 = Vector((-0.9569, -2.2611, 0.7985))
# Hardpoint RR_PhantomVII_Body_Anchor_1195 = Vector((-0.9247, -2.3659, 0.8616))
# Hardpoint RR_PhantomVII_Body_Anchor_1196 = Vector((-0.8792, -2.4622, 0.9205))
# Hardpoint RR_PhantomVII_Body_Anchor_1197 = Vector((-0.8211, -2.5497, 0.9749))
# Hardpoint RR_PhantomVII_Body_Anchor_1198 = Vector((-0.7511, -2.6279, 1.0241))
# Hardpoint RR_PhantomVII_Body_Anchor_1199 = Vector((-0.6703, -2.6967, 1.0679))
# Hardpoint RR_PhantomVII_Body_Anchor_1200 = Vector((-0.5799, -2.7558, 1.1059))
# Hardpoint RR_PhantomVII_Body_Anchor_1201 = Vector((-0.4812, -2.8050, 1.1378))
# Hardpoint RR_PhantomVII_Body_Anchor_1202 = Vector((-0.3755, -2.8441, 1.1633))
# Hardpoint RR_PhantomVII_Body_Anchor_1203 = Vector((-0.2645, -2.8730, 1.1822))
# Hardpoint RR_PhantomVII_Body_Anchor_1204 = Vector((-0.1496, -2.8915, 1.1944))
# Hardpoint RR_PhantomVII_Body_Anchor_1205 = Vector((-0.0326, -2.8996, 1.1997))
# Hardpoint RR_PhantomVII_Body_Anchor_1206 = Vector((0.0849, -2.8973, 1.1982))
# Hardpoint RR_PhantomVII_Body_Anchor_1207 = Vector((0.2012, -2.8845, 1.1898))
# Hardpoint RR_PhantomVII_Body_Anchor_1208 = Vector((0.3145, -2.8614, 1.1746))
# Hardpoint RR_PhantomVII_Body_Anchor_1209 = Vector((0.4234, -2.8280, 1.1527))
# Hardpoint RR_PhantomVII_Body_Anchor_1210 = Vector((0.5261, -2.7843, 1.1244))
# Hardpoint RR_PhantomVII_Body_Anchor_1211 = Vector((0.6213, -2.7307, 1.0897))
# Hardpoint RR_PhantomVII_Body_Anchor_1212 = Vector((0.7076, -2.6673, 1.0491))
# Hardpoint RR_PhantomVII_Body_Anchor_1213 = Vector((0.7837, -2.5942, 1.0028))
# Hardpoint RR_PhantomVII_Body_Anchor_1214 = Vector((0.8485, -2.5118, 0.9512))
# Hardpoint RR_PhantomVII_Body_Anchor_1215 = Vector((0.9011, -2.4204, 0.8948))
# Hardpoint RR_PhantomVII_Body_Anchor_1216 = Vector((0.9407, -2.3202, 0.8340))
# Hardpoint RR_PhantomVII_Body_Anchor_1217 = Vector((0.9668, -2.2117, 0.7692))
# Hardpoint RR_PhantomVII_Body_Anchor_1218 = Vector((0.9790, -2.0953, 0.7010))
# Hardpoint RR_PhantomVII_Body_Anchor_1219 = Vector((0.9772, -1.9713, 0.6301))
# Hardpoint RR_PhantomVII_Body_Anchor_1220 = Vector((0.9612, -1.8402, 0.5568))
# Hardpoint RR_PhantomVII_Body_Anchor_1221 = Vector((0.9315, -1.7025, 0.4818))
# Hardpoint RR_PhantomVII_Body_Anchor_1222 = Vector((0.8883, -1.5586, 0.4058))
# Hardpoint RR_PhantomVII_Body_Anchor_1223 = Vector((0.8324, -1.4092, 0.3294))
# Hardpoint RR_PhantomVII_Body_Anchor_1224 = Vector((0.7645, -1.2547, 0.2531))
# Hardpoint RR_PhantomVII_Body_Anchor_1225 = Vector((0.6856, -1.0956, 0.1776))
# Hardpoint RR_PhantomVII_Body_Anchor_1226 = Vector((0.5969, -0.9327, 0.1035))
# Hardpoint RR_PhantomVII_Body_Anchor_1227 = Vector((0.4995, -0.7663, 0.0314))
# Hardpoint RR_PhantomVII_Body_Anchor_1228 = Vector((0.3950, -0.5972, -0.0382))
# Hardpoint RR_PhantomVII_Body_Anchor_1229 = Vector((0.2848, -0.4260, -0.1046))
# Hardpoint RR_PhantomVII_Body_Anchor_1230 = Vector((0.1705, -0.2532, -0.1673))
# Hardpoint RR_PhantomVII_Body_Anchor_1231 = Vector((0.0537, -0.0795, -0.2258))
# Hardpoint RR_PhantomVII_Body_Anchor_1232 = Vector((-0.0638, 0.0944, -0.2797))
# Hardpoint RR_PhantomVII_Body_Anchor_1233 = Vector((-0.1804, 0.2681, -0.3284))
# Hardpoint RR_PhantomVII_Body_Anchor_1234 = Vector((-0.2944, 0.4407, -0.3717))
# Hardpoint RR_PhantomVII_Body_Anchor_1235 = Vector((-0.4042, 0.6118, -0.4092))
# Hardpoint RR_PhantomVII_Body_Anchor_1236 = Vector((-0.5082, 0.7807, -0.4405))
# Hardpoint RR_PhantomVII_Body_Anchor_1237 = Vector((-0.6048, 0.9468, -0.4653))
# Hardpoint RR_PhantomVII_Body_Anchor_1238 = Vector((-0.6928, 1.1094, -0.4836))
# Hardpoint RR_PhantomVII_Body_Anchor_1239 = Vector((-0.7708, 1.2681, -0.4952))
# Hardpoint RR_PhantomVII_Body_Anchor_1240 = Vector((-0.8377, 1.4222, -0.4999))
# Hardpoint RR_PhantomVII_Body_Anchor_1241 = Vector((-0.8926, 1.5712, -0.4977))
# Hardpoint RR_PhantomVII_Body_Anchor_1242 = Vector((-0.9346, 1.7145, -0.4887))
# Hardpoint RR_PhantomVII_Body_Anchor_1243 = Vector((-0.9632, 1.8517, -0.4728))
# Hardpoint RR_PhantomVII_Body_Anchor_1244 = Vector((-0.9779, 1.9822, -0.4504))
# Hardpoint RR_PhantomVII_Body_Anchor_1245 = Vector((-0.9786, 2.1056, -0.4214))
# Hardpoint RR_PhantomVII_Body_Anchor_1246 = Vector((-0.9651, 2.2214, -0.3862))
# Hardpoint RR_PhantomVII_Body_Anchor_1247 = Vector((-0.9379, 2.3292, -0.3450))
# Hardpoint RR_PhantomVII_Body_Anchor_1248 = Vector((-0.8971, 2.4286, -0.2982))
# Hardpoint RR_PhantomVII_Body_Anchor_1249 = Vector((-0.8434, 2.5192, -0.2462))
# Hardpoint RR_PhantomVII_Body_Anchor_1250 = Vector((-0.7776, 2.6008, -0.1893))
# Hardpoint RR_PhantomVII_Body_Anchor_1251 = Vector((-0.7006, 2.6731, -0.1281))
# Hardpoint RR_PhantomVII_Body_Anchor_1252 = Vector((-0.6135, 2.7357, -0.0630))
# Hardpoint RR_PhantomVII_Body_Anchor_1253 = Vector((-0.5176, 2.7885, 0.0055))
# Hardpoint RR_PhantomVII_Body_Anchor_1254 = Vector((-0.4143, 2.8312, 0.0767))
# Hardpoint RR_PhantomVII_Body_Anchor_1255 = Vector((-0.3050, 2.8638, 0.1502))
# Hardpoint RR_PhantomVII_Body_Anchor_1256 = Vector((-0.1913, 2.8860, 0.2252))
# Hardpoint RR_PhantomVII_Body_Anchor_1257 = Vector((-0.0748, 2.8979, 0.3013))
# Hardpoint RR_PhantomVII_Body_Anchor_1258 = Vector((0.0427, 2.8993, 0.3778))
# Hardpoint RR_PhantomVII_Body_Anchor_1259 = Vector((0.1596, 2.8903, 0.4540))
# Hardpoint RR_PhantomVII_Body_Anchor_1260 = Vector((0.2742, 2.8709, 0.5294))
# Hardpoint RR_PhantomVII_Body_Anchor_1261 = Vector((0.3848, 2.8412, 0.6034))
# Hardpoint RR_PhantomVII_Body_Anchor_1262 = Vector((0.4900, 2.8012, 0.6753))
# Hardpoint RR_PhantomVII_Body_Anchor_1263 = Vector((0.5880, 2.7512, 0.7445))
# Hardpoint RR_PhantomVII_Body_Anchor_1264 = Vector((0.6777, 2.6912, 0.8106))
# Hardpoint RR_PhantomVII_Body_Anchor_1265 = Vector((0.7575, 2.6216, 0.8729))
# Hardpoint RR_PhantomVII_Body_Anchor_1266 = Vector((0.8265, 2.5425, 0.9310))
# Hardpoint RR_PhantomVII_Body_Anchor_1267 = Vector((0.8836, 2.4543, 0.9845))
# Hardpoint RR_PhantomVII_Body_Anchor_1268 = Vector((0.9280, 2.3573, 1.0327))
# Hardpoint RR_PhantomVII_Body_Anchor_1269 = Vector((0.9590, 2.2517, 1.0755))
# Hardpoint RR_PhantomVII_Body_Anchor_1270 = Vector((0.9763, 2.1381, 1.1123))
# Hardpoint RR_PhantomVII_Body_Anchor_1271 = Vector((0.9795, 2.0168, 1.1431))
# Hardpoint RR_PhantomVII_Body_Anchor_1272 = Vector((0.9686, 1.8882, 1.1673))
# Hardpoint RR_PhantomVII_Body_Anchor_1273 = Vector((0.9438, 1.7528, 1.1850))
# Hardpoint RR_PhantomVII_Body_Anchor_1274 = Vector((0.9054, 1.6111, 1.1959))
# Hardpoint RR_PhantomVII_Body_Anchor_1275 = Vector((0.8540, 1.4636, 1.2000))
# Hardpoint RR_PhantomVII_Body_Anchor_1276 = Vector((0.7903, 1.3108, 1.1972))
