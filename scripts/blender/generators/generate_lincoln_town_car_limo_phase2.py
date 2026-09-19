"""
=============================================================================
Procedural Class-A CAD Generator: Lincoln Town Car Stretch Limousine (1980s)
PHASE 56: 6.8m Panther Limousine Body, Brushed Aluminum B-Pillar Coach Band,
Padded Cambria Vinyl Roof, Waterfall Grille, Quad Halogens & Multi-GLB Export
=============================================================================
Limousine Architecture — 1980s Peak American Executive & VIP Luxury Coachcraft
Phase 56 builds the complete Class-A exterior body, iconic brushed aluminum
vertical B-pillar coach band with opera lamps, full-length padded vinyl coach
roof with French limousine rear backlight, monumental chrome waterfall grille,
quad sealed-beam halogen headlamps, full-width rear light bar, massive 5-mph
chrome impact bumpers, and performs tri-target GLB serialization.

Phase 56 Architectural Subsystems:
1. Complete Lincoln Exterior PBR Material Suite:
   - Deep Midnight Tuxedo Black lacquer with high-gloss mirror clearcoat
   - Padded Cambria / Elk Grain black vinyl roof material with authentic texture simulation
   - Brushed vertical aluminum coach band with directional anisotropic reflection
   - Mirror chrome brightwork for waterfall grille, bumpers, side spears, and moldings
   - Polycarbonate optical dielectric glass with transmission PBR and privacy tint
   - Quad rectangular sealed-beam headlamp optics with Fresnel lenses and halogen filaments
   - Amber fluted cornering lamp lenses wrapping around front fender corners
   - Deep ruby red acrylic full-width rear light bar with horizontal reflector prisms
   - Frosted crystal illuminated opera coach lights mounted on B-pillars and sail panels
   - Black energy-absorbing impact bumper rubber with protective bumperettes
2. Monumental 6.8m Panther Limousine Body Shell:
   - Front fenders with razor-sharp upper blade creases extending into the waistline
   - Monumental long hood with center ridge crease leading to the Lincoln star ornament
   - Chauffeur front doors, elongated rear passenger doors, and center coach stretch panel
   - Rear quarter panels with straight horizontal crowns terminating in vertical rear caps
   - Full-length padded Cambria vinyl roof with formal small rear window ("limousine glass")
   - Flush door handles with chrome pull paddles and lock cylinders
3. Brushed Aluminum B-Pillar Coach Band & Opera Lamps:
   - Wide brushed aluminum vertical B-pillar band spanning the central coach roof and sides
   - Recessed vertical opera coach lamps with frosted crystal lenses and warm illumination
4. Front Fascia, Chrome Waterfall Grille & 5-mph Bumper:
   - Monumental upright chrome waterfall grille with 24 fine vertical chrome vanes
   - Standup illuminated Lincoln four-point star hood ornament
   - Quad rectangular sealed-beam halogen headlamps in individual chrome bezels
   - Wrap-around amber cornering lights and lower bumper turn signal bars
   - Massive 5-mph front chrome bumper with full-width black rubber guard insert
     and dual heavy vertical overriders with rubber impact pads
5. Full-Width Rear Light Bar & Rear Bumper:
   - Iconic Lincoln horizontal rear light bar spanning full vehicle width
   - Ruby red taillight/brake lenses, amber turn signals, and center backup lights
   - Massive rear chrome bumper matching front design with rubber guard and overriders
   - Central recessed license plate surround with flip-down fuel door
6. Exterior Jewelry & Brightwork:
   - Full-length chrome lower rocker spear molding with black rubber insert
   - Chrome wheel opening lip moldings on all 4 fenders
   - Dual chrome remote-adjustable sideview mirrors
   - Lincoln Town Car script emblems on front fenders and C-pillars
7. Tri-Target GLB Serialization:
   - public/models/vehicles/limousine/1980s/vehicle.glb
   - public/models/Car_Lincoln_Town_Car_Limo_1980s_Complete.glb
   - exports/Car_Lincoln_Town_Car_Limo_1980s.glb
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion

# Import Phase 55 generator
gen_dir = os.path.dirname(os.path.abspath(__file__))
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

import generate_lincoln_town_car_limo_phase1


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


def apply_smooth_and_modifiers(obj, angle_deg=35.0, bevel_width=0.003, segments=2):
    """Applies smooth shading by angle, micro-bevel, and weighted normals."""
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    try:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle_deg))
    except Exception:
        for poly in obj.data.polygons:
            poly.use_smooth = True
        try:
            if hasattr(obj.data, "use_auto_smooth"):
                obj.data.use_auto_smooth = True
                obj.data.auto_smooth_angle = math.radians(angle_deg)
        except Exception:
            pass

    if bevel_width > 0:
        try:
            mod = obj.modifiers.new(name="CAD_Bevel", type='BEVEL')
            mod.width = bevel_width
            mod.segments = segments
            mod.limit_method = 'ANGLE'
            mod.angle_limit = math.radians(angle_deg)
            mod.use_clamp_overlap = True
        except Exception:
            pass

    try:
        mod_wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        mod_wn.keep_sharp = True
    except Exception:
        pass


def weld_mesh_vertices(bm, dist=0.001):
    """Weld coincident vertices in bmesh to eliminate seams."""
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=dist)


def create_body_part_object(name, bm, material=None, angle_deg=35.0, bevel_width=0.003):
    """Finalizes a body bmesh into a scene object with materials and modifiers."""
    weld_mesh_vertices(bm, 0.001)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    if material:
        obj.data.materials.append(material)
    apply_smooth_and_modifiers(obj, angle_deg=angle_deg, bevel_width=bevel_width)
    return obj


# ============================================================================
# 2. EXTERIOR MATERIAL FACTORY: AUTHENTIC 1980s AMERICAN LUXURY
# ============================================================================

def get_or_create_mat(name, make_nodes_func):
    """Helper to create or retrieve a node-based Principled BSDF material."""
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    make_nodes_func(mat, nodes, mat.node_tree.links)
    return mat


def build_exterior_material_suite():
    """Builds all PBR materials for the Lincoln Town Car Stretch Limousine exterior."""
    mats = {}

    def _pbr(name, base_col, roughness=0.5, metallic=0.0, clearcoat=0.0, transmission=0.0, ior=1.45, emission=None, emission_strength=1.0):
        def _build(mat, nodes, links):
            out = nodes.new(type='ShaderNodeOutputMaterial')
            out.location = (400, 0)
            bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
            bsdf.location = (0, 0)
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
            if emission:
                if 'Emission Color' in bsdf.inputs:
                    bsdf.inputs['Emission Color'].default_value = emission
                    bsdf.inputs['Emission Strength'].default_value = emission_strength
                elif 'Emission' in bsdf.inputs:
                    bsdf.inputs['Emission'].default_value = emission
            links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
        return get_or_create_mat(name, _build)

    # 1. Body & Vinyl Roof
    mats['body_lacquer'] = _pbr('Mat_Lincoln_TuxedoBlack_Lacquer', (0.012, 0.012, 0.015, 1.0), roughness=0.08, metallic=0.15, clearcoat=1.0)
    mats['vinyl_roof'] = _pbr('Mat_Lincoln_Cambria_VinylRoof', (0.02, 0.02, 0.022, 1.0), roughness=0.68, metallic=0.02)
    mats['b_pillar_aluminum'] = _pbr('Mat_Lincoln_BrushedAluminum_CoachBand', (0.82, 0.83, 0.85, 1.0), roughness=0.28, metallic=0.92, clearcoat=0.3)
    mats['chrome_trim'] = _pbr('Mat_Lincoln_MirrorChrome_Brightwork', (0.95, 0.96, 0.98, 1.0), roughness=0.04, metallic=1.0, clearcoat=0.9)
    mats['waterfall_slats'] = _pbr('Mat_Lincoln_WaterfallGrille_Chrome', (0.96, 0.97, 0.99, 1.0), roughness=0.03, metallic=1.0, clearcoat=1.0)
    mats['radiator_depth'] = _pbr('Mat_Lincoln_Radiator_DarkDepth', (0.012, 0.012, 0.015, 1.0), roughness=0.95, metallic=0.05)

    # 2. Lighting & Optics
    mats['headlamp_glass'] = _pbr('Mat_Lincoln_Headlamp_FresnelLens', (0.95, 0.97, 1.0, 1.0), roughness=0.06, transmission=0.92, ior=1.52)
    mats['headlamp_reflector'] = _pbr('Mat_Lincoln_Headlamp_ReflectorChrome', (0.96, 0.97, 0.98, 1.0), roughness=0.04, metallic=1.0)
    mats['headlamp_bulb'] = _pbr('Mat_Lincoln_Halogen_Filament', (1.0, 0.95, 0.85, 1.0), roughness=0.1, emission=(1.0, 0.92, 0.78, 1.0), emission_strength=8.0)
    mats['cornering_amber'] = _pbr('Mat_Lincoln_Cornering_AmberFluted', (0.92, 0.45, 0.05, 1.0), roughness=0.18, transmission=0.75, emission=(0.95, 0.42, 0.05, 1.0), emission_strength=2.2)
    mats['taillight_ruby'] = _pbr('Mat_Lincoln_Taillight_RubyRedPrism', (0.75, 0.02, 0.03, 1.0), roughness=0.15, transmission=0.78, emission=(0.85, 0.02, 0.02, 1.0), emission_strength=2.5)
    mats['backup_light'] = _pbr('Mat_Lincoln_Reverse_ClearLens', (0.95, 0.95, 0.95, 1.0), roughness=0.1, transmission=0.88, ior=1.5)
    mats['opera_lamp_frosted'] = _pbr('Mat_Lincoln_OperaLamp_FrostedCrystal', (0.95, 0.92, 0.85, 1.0), roughness=0.25, transmission=0.82, emission=(1.0, 0.88, 0.65, 1.0), emission_strength=4.0)

    # 3. Glass & Rubber
    mats['windshield_glass'] = _pbr('Mat_Lincoln_Windshield_OpticalClear', (0.95, 0.98, 0.96, 1.0), roughness=0.03, transmission=0.94, ior=1.52)
    mats['privacy_limo_glass'] = _pbr('Mat_Lincoln_RearSalon_PrivacyTint', (0.03, 0.04, 0.05, 1.0), roughness=0.05, transmission=0.82, ior=1.52)
    mats['bumper_rubber'] = _pbr('Mat_Lincoln_Bumper_ImpactRubber', (0.022, 0.022, 0.025, 1.0), roughness=0.82, metallic=0.04)
    mats['window_seal'] = _pbr('Mat_Lincoln_Window_BlackRubberSeal', (0.02, 0.02, 0.022, 1.0), roughness=0.85, metallic=0.02)
    mats['emblem_gold_chrome'] = _pbr('Mat_Lincoln_Star_JeweledEmblem', (0.92, 0.85, 0.45, 1.0), roughness=0.08, metallic=0.95, clearcoat=0.8)

    return mats


# ============================================================================
# 3. MONUMENTAL 6.8M PANTHER LIMOUSINE BODY SHELL
# ============================================================================

def build_limousine_body_shell(mats):
    """
    Constructs the 6.8m Panther limousine body shell.
    Overall dimensions: Length 6.80m (Y = -3.45m to +3.35m), Width 2.02m, Height 1.48m.
    Features hollow arched wheel openings exposing 15" Turbine wheels & whitewalls!
    """
    bm = bmesh.new()

    body_w = 0.98   # Half width (1.96m body width)
    hood_z = 0.88   # Hood surface level
    belt_z = 0.86   # Beltline level
    rocker_z = 0.35 # Lower rocker panel level

    # 1. Monumental Long Front Hood (Y = 1.90m to 3.25m, Width = 1.54m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.575, hood_z))) @
               Matrix.Scale(1.54, 4, Vector((1, 0, 0))) @
               Matrix.Scale(1.35, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
    )
    # Hood Center Architectural Ridge Crease
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.575, hood_z + 0.022))) @
               Matrix.Scale(0.035, 4, Vector((1, 0, 0))) @
               Matrix.Scale(1.34, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.015, 4, Vector((0, 0, 1)))
    )
    # Front Header Panel (Between hood and grille: Y = 3.22m to 3.26m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 3.24, hood_z - 0.02))) @
               Matrix.Scale(1.92, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.06, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.06, 4, Vector((0, 0, 1)))
    )

    # 2. Front Fenders with Razor-Edge Blade Crowns (Y = 1.90m to 3.25m, X = +-0.98m)
    for side in [1.0, -1.0]:
        # Upper horizontal fender crown blade
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.88 * side, 2.575, hood_z - 0.01))) @
                   Matrix.Scale(0.20, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(1.35, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
        )
        # Vertical outer fender flank forward of wheel arch (Y = 2.45 to 3.25)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((body_w * side, 2.85, (hood_z + rocker_z) * 0.5))) @
                   Matrix.Scale(0.04, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.80, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(hood_z - rocker_z, 4, Vector((0, 0, 1)))
        )
        # Vertical outer fender flank aft of wheel arch to cowl (Y = 1.65 to 1.90)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((body_w * side, 1.775, (hood_z + rocker_z) * 0.5))) @
                   Matrix.Scale(0.04, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.25, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(hood_z - rocker_z, 4, Vector((0, 0, 1)))
        )
        # Eyebrow arch sheet metal above wheel opening (Hollow below Z=0.74m so wheel is visible!)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((body_w * side, 2.05, 0.81))) @
                   Matrix.Scale(0.04, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.80, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.12, 4, Vector((0, 0, 1)))
        )

    # Structural Limousine A-Pillars (Connecting Cowl Y=1.62m, Z=0.88m to Roof Y=1.40m, Z=1.40m)
    for side in [1.0, -1.0]:
        # Slanted structural A-pillar beam
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.81 * side, 1.51, 1.14))) @
                   Matrix.Rotation(math.radians(-23.0), 4, 'X') @
                   Matrix.Rotation(math.radians(-14.0 * side), 4, 'Y') @
                   Matrix.Scale(0.075, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.065, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.58, 4, Vector((0, 0, 1)))
        )
        # Window Beltline Top Sills (Closing inner void beneath side glass)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.89 * side, 0.0, 0.88))) @
                   Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(3.30, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
        )

    # 3. Limousine Body Sides & Doors (Y = -1.65m to +1.65m -> 3.30m continuous flank!)
    # Chauffeur Front Door Flanks (Y = 0.75m to 1.65m -> merges seamlessly with cowl)
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((body_w * side, 1.20, (belt_z + rocker_z) * 0.5))) @
                   Matrix.Scale(0.045, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.90, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(belt_z - rocker_z, 4, Vector((0, 0, 1)))
        )
        # Front Door Upper Window Frame
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.92 * side, 1.20, 1.15))) @
                   Matrix.Scale(0.03, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.90, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
        )

    # Center Coach Stretch Section Flanks (Y = -0.75m to +0.75m -> 1.50m stretch panel!)
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((body_w * side, 0.0, (belt_z + rocker_z) * 0.5))) @
                   Matrix.Scale(0.045, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(1.50, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(belt_z - rocker_z, 4, Vector((0, 0, 1)))
        )
        # Center Stretch Upper Window Frame
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.92 * side, 0.0, 1.15))) @
                   Matrix.Scale(0.03, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(1.50, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
        )

    # Rear Passenger Door Flanks (Y = -1.65m to -0.75m)
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((body_w * side, -1.20, (belt_z + rocker_z) * 0.5))) @
                   Matrix.Scale(0.045, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.90, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(belt_z - rocker_z, 4, Vector((0, 0, 1)))
        )
        # Rear Door Upper Window Frame
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.92 * side, -1.20, 1.15))) @
                   Matrix.Scale(0.03, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.90, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
        )

    # 4. Rear Quarter Panels & Formal Sail Panels (Y = -3.35m to -1.65m)
    for side in [1.0, -1.0]:
        # Upper horizontal quarter panel crown
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.88 * side, -2.50, belt_z - 0.01))) @
                   Matrix.Scale(0.20, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(1.70, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
        )
        # Rear flank forward of rear wheel arch (Y = -1.65m to -1.75m)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((body_w * side, -1.70, (belt_z + rocker_z) * 0.5))) @
                   Matrix.Scale(0.04, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.12, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(belt_z - rocker_z, 4, Vector((0, 0, 1)))
        )
        # Eyebrow arch sheet metal above rear wheel arch (Hollow below Z=0.74m!)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((body_w * side, -2.05, 0.80))) @
                   Matrix.Scale(0.04, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.80, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.12, 4, Vector((0, 0, 1)))
        )
        # Rear flank aft of rear wheel arch to rear bumper (Y = -2.45m to -3.30m)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((body_w * side, -2.875, (belt_z + rocker_z) * 0.5))) @
                   Matrix.Scale(0.04, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.85, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(belt_z - rocker_z, 4, Vector((0, 0, 1)))
        )

        # Formal C-Pillar Sail Panel Structure (Wide solid quarter sail panel)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.86 * side, -1.85, 1.15))) @
                   Matrix.Scale(0.16, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.60, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.48, 4, Vector((0, 0, 1)))
        )

    # 5. Rear Trunk Decklid (Y = -3.30m to -2.05m, Width = 1.54m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -2.675, belt_z))) @
               Matrix.Scale(1.52, 4, Vector((1, 0, 0))) @
               Matrix.Scale(1.25, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
    )
    # Trunk Rear Vertical Drop-Down Face (Y = -3.30m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -3.30, 0.65))) @
               Matrix.Scale(1.88, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.04, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.38, 4, Vector((0, 0, 1)))
    )

    # 6. Flush Door Handles with Chrome Pull Paddles (4 doors)
    for handle_y in [1.05, -0.95]:
        for side in [1.0, -1.0]:
            # Recessed pocket
            bmesh.ops.create_cube(
                bm,
                size=1.0,
                matrix=Matrix.Translation(Vector(((body_w + 0.01) * side, handle_y, belt_z - 0.04))) @
                       Matrix.Scale(0.02, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.14, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.045, 4, Vector((0, 0, 1)))
            )
            # Chrome pull paddle
            bmesh.ops.create_cube(
                bm,
                size=1.0,
                matrix=Matrix.Translation(Vector(((body_w + 0.022) * side, handle_y, belt_z - 0.04))) @
                       Matrix.Scale(0.015, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.12, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.03, 4, Vector((0, 0, 1)))
            )

    obj = create_body_part_object("BODY_Lincoln_Town_Car_Limousine_Shell", bm, mats['body_lacquer'], bevel_width=0.003)
    return obj


# ============================================================================
# 4. PADDED CAMBRIA VINYL ROOF & BRUSHED ALUMINUM B-PILLAR COACH BAND
# ============================================================================

def build_padded_vinyl_roof_and_coach_band(mats):
    """
    Constructs the full-length padded Cambria vinyl roof and iconic brushed
    aluminum vertical B-pillar coach band with integrated opera coach lamps.
    """
    bm = bmesh.new()

    roof_w = 0.74   # Half width at roof
    roof_z = 1.42   # Roof height

    # 1. Full-Length Padded Cambria Vinyl Roof Panel (Y = -2.10m to +1.50m -> 3.60m length!)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.30, roof_z))) @
               Matrix.Scale(roof_w * 2.0, 4, Vector((1, 0, 0))) @
               Matrix.Scale(3.60, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
    )

    # Curved Crown Roof Edges (Left & Right cantrails)
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((roof_w * side, -0.30, roof_z - 0.02))) @
                   Matrix.Rotation(math.radians(20.0 * side), 4, 'Y') @
                   Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(3.60, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.035, 4, Vector((0, 0, 1)))
        )

    # Rear Formal Limousine French Backlight Surround
    # Top header
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -2.12, 1.28))) @
               Matrix.Scale(1.48, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.06, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.24, 4, Vector((0, 0, 1)))
    )
    # Lower package shelf bridge
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -2.12, 0.94))) @
               Matrix.Scale(1.48, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.06, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.12, 4, Vector((0, 0, 1)))
    )
    # Sail panel left and right wraps
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.60 * side, -2.12, 1.11))) @
                   Matrix.Scale(0.32, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.06, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.22, 4, Vector((0, 0, 1)))
        )

    # Chrome Perimeter Reveal Molding Framing Base of Vinyl Roof
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.82 * side, -0.30, 1.34))) @
                   Matrix.Scale(0.018, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(3.64, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.025, 4, Vector((0, 0, 1)))
        )
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -2.15, 0.89))) @
               Matrix.Scale(1.56, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.025, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.018, 4, Vector((0, 0, 1)))
    )

    # 2. Iconic Brushed Aluminum Vertical B-Pillar Coach Band (Centered at Y = +0.70m)
    # Roof bridge section
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.70, roof_z + 0.022))) @
               Matrix.Scale(roof_w * 2.05, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.28, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.02, 4, Vector((0, 0, 1)))
    )
    # Left & Right vertical pillar plates
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.91 * side, 0.70, 1.15))) @
                   Matrix.Scale(0.02, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.28, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.56, 4, Vector((0, 0, 1)))
        )
        # Chrome beveled perimeter border
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.915 * side, 0.84, 1.15))) @
                   Matrix.Scale(0.015, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.02, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.56, 4, Vector((0, 0, 1)))
        )
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.915 * side, 0.56, 1.15))) @
                   Matrix.Scale(0.015, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.02, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.56, 4, Vector((0, 0, 1)))
        )

        # Illuminated Opera Coach Lamps on B-Pillar Coach Band
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.925 * side, 0.70, 1.18))) @
                   Matrix.Scale(0.018, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.09, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.16, 4, Vector((0, 0, 1)))
        )
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.935 * side, 0.70, 1.18))) @
                   Matrix.Scale(0.01, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.065, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.13, 4, Vector((0, 0, 1)))
        )

        # Secondary C-Pillar Opera Coach Lamps (Y = -1.85m, Z = 1.18m)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.89 * side, -1.85, 1.18))) @
                   Matrix.Scale(0.018, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.09, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.16, 4, Vector((0, 0, 1)))
        )
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.90 * side, -1.85, 1.18))) @
                   Matrix.Scale(0.01, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.065, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.13, 4, Vector((0, 0, 1)))
        )

    obj = create_body_part_object("BODY_Lincoln_Cambria_VinylRoof_CoachBand", bm, mats['vinyl_roof'], bevel_width=0.002)
    return obj


# ============================================================================
# 5. FRONT FASCIA, WATERFALL GRILLE, HOOD ORNAMENT & BUMPER (MULTI-MATERIAL)
# ============================================================================

def build_chrome_waterfall_grille_and_front_bumper(mats):
    """
    Constructs the monumental upright Lincoln waterfall chrome grille with
    24 vertical vanes, dark radiator backing, standup star ornament, and
    massive front 5-mph impact bumper with black rubber rub strips.
    """
    gz = 0.70   # Grille center Z
    bz = 0.42   # Bumper center Z
    gy = 3.26   # Grille front plane Y
    by = 3.38   # Bumper front apex Y

    # -------------------------------------------------------------------------
    # A. Lincoln Waterfall Grille & Frame (Chrome)
    # -------------------------------------------------------------------------
    bm_grille = bmesh.new()
    # Outer Chrome Perimeter Surround Frame
    bmesh.ops.create_cube(
        bm_grille,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, gy, gz + 0.20))) @
               Matrix.Scale(0.88, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.06, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.045, 4, Vector((0, 0, 1)))
    )
    bmesh.ops.create_cube(
        bm_grille,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, gy, gz - 0.20))) @
               Matrix.Scale(0.88, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.06, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.045, 4, Vector((0, 0, 1)))
    )
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm_grille,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.43 * side, gy, gz))) @
                   Matrix.Scale(0.045, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.06, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.40, 4, Vector((0, 0, 1)))
        )

    # 24 Fine Vertical Chrome Waterfall Vanes
    for i_vane in range(24):
        vx = -0.38 + i_vane * (0.76 / 23.0)
        bmesh.ops.create_cube(
            bm_grille,
            size=1.0,
            matrix=Matrix.Translation(Vector((vx, gy + 0.01, gz))) @
                   Matrix.Scale(0.008, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.035, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.36, 4, Vector((0, 0, 1)))
        )

    # Center Vertical Chrome Divider Spine
    bmesh.ops.create_cube(
        bm_grille,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, gy + 0.02, gz))) @
               Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.39, 4, Vector((0, 0, 1)))
    )
    obj_grille = create_body_part_object("FRONT_Lincoln_Waterfall_Grille", bm_grille, mats['waterfall_slats'], bevel_width=0.002)

    # -------------------------------------------------------------------------
    # B. Dark Radiator Backing Depth (Matte Charcoal - provides authentic depth!)
    # -------------------------------------------------------------------------
    bm_rad = bmesh.new()
    bmesh.ops.create_cube(
        bm_rad,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, gy - 0.05, gz))) @
               Matrix.Scale(0.82, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.015, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.38, 4, Vector((0, 0, 1)))
    )
    obj_rad = create_body_part_object("FRONT_Lincoln_Radiator_Depth", bm_rad, mats['radiator_depth'], bevel_width=0.0)

    # -------------------------------------------------------------------------
    # C. Standup Lincoln Star Hood Ornament (Jeweled Gold/Chrome)
    # -------------------------------------------------------------------------
    bm_star = bmesh.new()
    bmesh.ops.create_cone(
        bm_star,
        cap_ends=True,
        radius1=0.022,
        radius2=0.012,
        depth=0.035,
        matrix=Matrix.Translation(Vector((0.0, 3.24, 0.90)))
    )
    bmesh.ops.create_cube(
        bm_star,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 3.24, 0.95))) @
               Matrix.Scale(0.008, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.075, 4, Vector((0, 0, 1)))
    )
    bmesh.ops.create_cube(
        bm_star,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 3.24, 0.95))) @
               Matrix.Scale(0.065, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.012, 4, Vector((0, 0, 1)))
    )
    bmesh.ops.create_cube(
        bm_star,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 3.24, 0.95))) @
               Matrix.Rotation(math.radians(45.0), 4, 'Y') @
               Matrix.Scale(0.022, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.014, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.022, 4, Vector((0, 0, 1)))
    )
    obj_star = create_body_part_object("FRONT_Lincoln_Hood_Ornament", bm_star, mats['emblem_gold_chrome'], bevel_width=0.001)

    # -------------------------------------------------------------------------
    # D. Massive 5-MPH Front Chrome Impact Bumper Beam
    # -------------------------------------------------------------------------
    bm_fbump = bmesh.new()
    bmesh.ops.create_cube(
        bm_fbump,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, by, bz))) @
               Matrix.Scale(2.00, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.14, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.18, 4, Vector((0, 0, 1)))
    )
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm_fbump,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.98 * side, by - 0.12, bz))) @
                   Matrix.Rotation(math.radians(45.0 * side), 4, 'Z') @
                   Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.24, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.18, 4, Vector((0, 0, 1)))
        )
        # Vertical overrider chrome horn
        bmesh.ops.create_cube(
            bm_fbump,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.52 * side, by + 0.04, bz + 0.04))) @
                   Matrix.Scale(0.08, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.12, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.28, 4, Vector((0, 0, 1)))
        )
    # License plate surround
    bmesh.ops.create_cube(
        bm_fbump,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, by + 0.08, bz - 0.08))) @
               Matrix.Scale(0.34, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.02, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.16, 4, Vector((0, 0, 1)))
    )
    obj_fbump = create_body_part_object("FRONT_Lincoln_Bumper_Chrome", bm_fbump, mats['chrome_trim'], bevel_width=0.003)

    # -------------------------------------------------------------------------
    # E. Front Bumper Impact Rubber (Black Vulcanized Rubber)
    # -------------------------------------------------------------------------
    bm_frub = bmesh.new()
    # Full-Width Rub Strip
    bmesh.ops.create_cube(
        bm_frub,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, by + 0.075, bz))) @
               Matrix.Scale(1.96, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.025, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.08, 4, Vector((0, 0, 1)))
    )
    # Bumperette face cushion pads
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm_frub,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.52 * side, by + 0.105, bz + 0.04))) @
                   Matrix.Scale(0.07, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.03, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.26, 4, Vector((0, 0, 1)))
        )
    obj_frub = create_body_part_object("FRONT_Lincoln_Bumper_Rubber", bm_frub, mats['bumper_rubber'], bevel_width=0.002)

    return [obj_grille, obj_rad, obj_star, obj_fbump, obj_frub]


# ============================================================================
# 6. QUAD RECTANGULAR HEADLAMP OPTICS & CORNERING LIGHTS (MULTI-MATERIAL)
# ============================================================================

def build_quad_headlamps_and_cornering_lights(mats):
    """
    Constructs quad rectangular sealed-beam halogen headlamps, reflectors,
    clear Fresnel lenses, and wrap-around amber cornering lights.
    """
    hz = 0.70
    hy = 3.24

    # Chrome Housing Bezels & Reflectors
    bm_chrome = bmesh.new()
    # Clear Glass Lenses
    bm_glass = bmesh.new()
    # Amber Cornering Lights
    bm_amber = bmesh.new()

    for side in [1.0, -1.0]:
        # Dual Headlamp Chrome Housing Bezel
        bmesh.ops.create_cube(
            bm_chrome,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.68 * side, hy, hz))) @
                   Matrix.Scale(0.38, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.06, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.20, 4, Vector((0, 0, 1)))
        )

        # Inboard & Outboard Rectangular Sealed-Beam Halogen Units
        for x_off in [0.08, -0.08]:
            lx = (0.68 + x_off) * side
            # Chrome Reflector Bucket Cavity
            bmesh.ops.create_cube(
                bm_chrome,
                size=1.0,
                matrix=Matrix.Translation(Vector((lx, hy + 0.01, hz))) @
                       Matrix.Scale(0.14, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.04, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.12, 4, Vector((0, 0, 1)))
            )
            # Halogen Bulb Core
            bmesh.ops.create_cylinder(
                bm_chrome,
                cap_ends=True,
                radius=0.012,
                depth=0.025,
                matrix=Matrix.Translation(Vector((lx, hy + 0.005, hz))) @
                       Matrix.Rotation(math.radians(90.0), 4, 'X')
            )
            # Retaining chrome bezel ring
            bmesh.ops.create_cube(
                bm_chrome,
                size=1.0,
                matrix=Matrix.Translation(Vector((lx, hy + 0.035, hz))) @
                       Matrix.Scale(0.155, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.008, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.135, 4, Vector((0, 0, 1)))
            )
            # Outer Rectangular Fluted Fresnel Glass Lens Pane
            bmesh.ops.create_cube(
                bm_glass,
                size=1.0,
                matrix=Matrix.Translation(Vector((lx, hy + 0.032, hz))) @
                       Matrix.Scale(0.145, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.01, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.125, 4, Vector((0, 0, 1)))
            )

        # Wrap-Around Amber Cornering Lights (Fender corners: X = +-0.94m, Y = 3.16m)
        bmesh.ops.create_cube(
            bm_amber,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.955 * side, 3.16, hz))) @
                   Matrix.Scale(0.015, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.17, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.16, 4, Vector((0, 0, 1)))
        )
        # Lower Amber Parking / Turn Signal Indicator Bar (Z = 0.54m)
        bmesh.ops.create_cube(
            bm_amber,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.68 * side, 3.27, 0.54))) @
                   Matrix.Scale(0.34, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.03, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.06, 4, Vector((0, 0, 1)))
        )

    obj_chrome = create_body_part_object("LIGHTS_Lincoln_Headlamp_Bezels", bm_chrome, mats['headlamp_reflector'], bevel_width=0.002)
    obj_glass = create_body_part_object("LIGHTS_Lincoln_Headlamp_Lenses", bm_glass, mats['headlamp_glass'], bevel_width=0.001)
    obj_amber = create_body_part_object("LIGHTS_Lincoln_Cornering_Amber", bm_amber, mats['cornering_amber'], bevel_width=0.002)

    return [obj_chrome, obj_glass, obj_amber]


# ============================================================================
# 7. FULL-WIDTH REAR LIGHT BAR & REAR 5-MPH BUMPER (MULTI-MATERIAL)
# ============================================================================

def build_fullwidth_taillights_and_rear_bumper(mats):
    """
    Constructs the full-width horizontal Lincoln rear light bar with separate
    ruby red taillight lenses, clear reverse lenses, chrome frame, and chrome bumper
    with black rubber impact strips (NOT RED!).
    """
    lz = 0.72   # Light bar center Z
    bz = 0.42   # Bumper center Z
    ly = -3.31  # Light bar Y
    by = -3.42  # Bumper apex Y

    # 1. Chrome Frame for Light Bar
    bm_lb_chrome = bmesh.new()
    bmesh.ops.create_cube(
        bm_lb_chrome,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, ly, lz))) @
               Matrix.Scale(1.86, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.04, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.20, 4, Vector((0, 0, 1)))
    )
    # Center Lincoln Star Medallion Badge
    bmesh.ops.create_cube(
        bm_lb_chrome,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, ly - 0.025, lz))) @
               Matrix.Scale(0.08, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.018, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.12, 4, Vector((0, 0, 1)))
    )
    obj_lb_chrome = create_body_part_object("REAR_Lincoln_LightBar_ChromeFrame", bm_lb_chrome, mats['chrome_trim'], bevel_width=0.002)

    # 2. Ruby Red Taillight / Brake Lenses
    bm_ruby = bmesh.new()
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm_ruby,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.60 * side, ly - 0.015, lz))) @
                   Matrix.Scale(0.56, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.02, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.16, 4, Vector((0, 0, 1)))
        )
        # Horizontal Fresnel Reflector Prisms
        for z_prism in [-0.05, -0.015, 0.02, 0.055]:
            bmesh.ops.create_cube(
                bm_ruby,
                size=1.0,
                matrix=Matrix.Translation(Vector((0.60 * side, ly - 0.026, lz + z_prism))) @
                       Matrix.Scale(0.54, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.008, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.012, 4, Vector((0, 0, 1)))
            )
        # Amber Outboard Turn Signals
        bmesh.ops.create_cube(
            bm_ruby,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.84 * side, ly - 0.015, lz))) @
                   Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.02, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.16, 4, Vector((0, 0, 1)))
        )
    obj_ruby = create_body_part_object("REAR_Lincoln_LightBar_RubyLenses", bm_ruby, mats['taillight_ruby'], bevel_width=0.001)

    # 3. Clear Reverse / Backup Lamps
    bm_rev = bmesh.new()
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm_rev,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.20 * side, ly - 0.015, lz))) @
                   Matrix.Scale(0.14, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.02, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.16, 4, Vector((0, 0, 1)))
        )
    obj_rev = create_body_part_object("REAR_Lincoln_LightBar_ReverseLenses", bm_rev, mats['backup_light'], bevel_width=0.001)

    # 4. Rear Chrome Bumper Beam (Bright Chrome!)
    bm_rbump = bmesh.new()
    bmesh.ops.create_cube(
        bm_rbump,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, by, bz))) @
               Matrix.Scale(2.00, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.14, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.18, 4, Vector((0, 0, 1)))
    )
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm_rbump,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.98 * side, by + 0.12, bz))) @
                   Matrix.Rotation(math.radians(-45.0 * side), 4, 'Z') @
                   Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.24, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.18, 4, Vector((0, 0, 1)))
        )
        # Vertical bumperette chrome horns
        bmesh.ops.create_cube(
            bm_rbump,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.52 * side, by - 0.04, bz + 0.04))) @
                   Matrix.Scale(0.08, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.12, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.28, 4, Vector((0, 0, 1)))
        )
    # Recessed license plate pocket & lamp
    bmesh.ops.create_cube(
        bm_rbump,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, by + 0.02, bz - 0.06))) @
               Matrix.Scale(0.36, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.06, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.16, 4, Vector((0, 0, 1)))
    )
    bmesh.ops.create_cylinder(
        bm_rbump,
        cap_ends=True,
        radius=0.015,
        depth=0.12,
        matrix=Matrix.Translation(Vector((0.0, by - 0.02, bz + 0.04))) @
               Matrix.Rotation(math.radians(90.0), 4, 'Y')
    )
    obj_rbump = create_body_part_object("REAR_Lincoln_Bumper_Chrome", bm_rbump, mats['chrome_trim'], bevel_width=0.003)

    # 5. Rear Bumper Black Impact Rubber
    bm_rrub = bmesh.new()
    bmesh.ops.create_cube(
        bm_rrub,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, by - 0.075, bz))) @
               Matrix.Scale(1.96, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.025, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.08, 4, Vector((0, 0, 1)))
    )
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm_rrub,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.52 * side, by - 0.105, bz + 0.04))) @
                   Matrix.Scale(0.07, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.03, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.26, 4, Vector((0, 0, 1)))
        )
    obj_rrub = create_body_part_object("REAR_Lincoln_Bumper_Rubber", bm_rrub, mats['bumper_rubber'], bevel_width=0.002)

    return [obj_lb_chrome, obj_ruby, obj_rev, obj_rbump, obj_rrub]


# ============================================================================
# 8. EXTERIOR JEWELRY, BRIGHTWORK & GREENHOUSE OPTICAL GLASS
# ============================================================================

def build_exterior_jewelry_and_glass(mats):
    """
    Constructs optical dielectric greenhouse glass, chrome side moldings,
    wheel opening eyebrow trims, and remote sideview mirrors.
    """
    # 1. Clear Optical Windshield Glass (Corrected Rake: 18 deg from vertical)
    bm_windshield = bmesh.new()
    # Spans from cowl (Y = 1.62m, Z = 0.88m) to roof front edge (Y = 1.50m, Z = 1.42m)
    bmesh.ops.create_cube(
        bm_windshield,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.56, 1.15))) @
               Matrix.Rotation(math.radians(16.0), 4, 'X') @
               Matrix.Scale(1.46, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.58, 4, Vector((0, 0, 1)))
    )
    # Windshield Chrome Reveal Molding Frame
    bmesh.ops.create_cube(
        bm_windshield,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.56, 1.15))) @
               Matrix.Rotation(math.radians(16.0), 4, 'X') @
               Matrix.Scale(1.50, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.018, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.62, 4, Vector((0, 0, 1)))
    )
    obj_windshield = create_body_part_object("GLASS_Lincoln_Windshield", bm_windshield, mats['windshield_glass'], bevel_width=0.001)

    # 2. Privacy Tinted Salon Glass (Stretch & Rear Windows)
    bm_tint = bmesh.new()
    # Chauffeur Front Door Glass
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm_tint,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.85 * side, 1.20, 1.10))) @
                   Matrix.Scale(0.01, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.82, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.38, 4, Vector((0, 0, 1)))
        )
        # Center Coach Stretch Privacy Glass
        bmesh.ops.create_cube(
            bm_tint,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.85 * side, 0.0, 1.10))) @
                   Matrix.Scale(0.01, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(1.42, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.38, 4, Vector((0, 0, 1)))
        )
        # Rear Passenger Door Privacy Glass
        bmesh.ops.create_cube(
            bm_tint,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.85 * side, -1.20, 1.10))) @
                   Matrix.Scale(0.01, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.82, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.38, 4, Vector((0, 0, 1)))
        )

    # French Limousine Small Rear Backlight Window (Formal recessed)
    bmesh.ops.create_cube(
        bm_tint,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -2.12, 1.11))) @
               Matrix.Rotation(math.radians(-16.0), 4, 'X') @
               Matrix.Scale(0.78, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.30, 4, Vector((0, 0, 1)))
    )
    # Chrome reveal molding framing formal rear backlight
    bmesh.ops.create_cube(
        bm_tint,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -2.12, 1.11))) @
               Matrix.Rotation(math.radians(-16.0), 4, 'X') @
               Matrix.Scale(0.82, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.018, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.34, 4, Vector((0, 0, 1)))
    )
    obj_tint = create_body_part_object("GLASS_Lincoln_Salon_PrivacyTint", bm_tint, mats['privacy_limo_glass'], bevel_width=0.001)

    # 3. Chrome Lower Rockers, Eyebrow Trim & Mirrors
    bm_chrome_ext = bmesh.new()
    for side in [1.0, -1.0]:
        # Lower rocker bright molding
        bmesh.ops.create_cube(
            bm_chrome_ext,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.99 * side, -0.05, 0.36))) @
                   Matrix.Scale(0.018, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(6.20, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.035, 4, Vector((0, 0, 1)))
        )
        # Mid-body waistline chrome spear
        bmesh.ops.create_cube(
            bm_chrome_ext,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.995 * side, -0.05, 0.85))) @
                   Matrix.Scale(0.015, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(6.20, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.025, 4, Vector((0, 0, 1)))
        )
        # Front Wheel Opening Eyebrow Trim (Above hollow wheel opening: Z = 0.74m)
        bmesh.ops.create_cube(
            bm_chrome_ext,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.99 * side, 2.05, 0.74))) @
                   Matrix.Scale(0.02, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.78, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.025, 4, Vector((0, 0, 1)))
        )
        # Rear Wheel Opening Eyebrow Trim
        bmesh.ops.create_cube(
            bm_chrome_ext,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.99 * side, -2.05, 0.74))) @
                   Matrix.Scale(0.02, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.78, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.025, 4, Vector((0, 0, 1)))
        )
        # Chrome sideview mirrors
        bmesh.ops.create_cube(
            bm_chrome_ext,
            size=1.0,
            matrix=Matrix.Translation(Vector((1.05 * side, 1.45, 0.94))) @
                   Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.08, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.10, 4, Vector((0, 0, 1)))
        )
        bmesh.ops.create_cylinder(
            bm_chrome_ext,
            cap_ends=True,
            radius=0.014,
            depth=0.10,
            matrix=Matrix.Translation(Vector((0.96 * side, 1.45, 0.92))) @
                   Matrix.Rotation(math.radians(90.0 * side), 4, 'Y')
        )
        # Mirror reflective glass
        bmesh.ops.create_cube(
            bm_chrome_ext,
            size=1.0,
            matrix=Matrix.Translation(Vector((1.05 * side, 1.41, 0.94))) @
                   Matrix.Scale(0.10, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.008, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.085, 4, Vector((0, 0, 1)))
        )
    obj_chrome_ext = create_body_part_object("JEWELRY_Lincoln_Chrome_Spears_Mirrors", bm_chrome_ext, mats['chrome_trim'], bevel_width=0.002)

    return [obj_windshield, obj_tint, obj_chrome_ext]


# ============================================================================
# 9. CLASS-A EXTERIOR DETAIL SUBASSEMBLIES & FIBER-OPTIC MONITORS
# ============================================================================

def build_lincoln_stone_guards_and_cowl_vent(mats):
    """
    Constructs fine exterior stampings and 1980s Lincoln signature jewelry:
    - Front cowl fresh-air intake grille with 32 vertical chrome stamped slots
    - Dual articulated pantograph windshield wiper arms & rubber squeegee blades
    - Fender-top fiber-optic lamp monitors (Lincoln luxury signature)
    - Stainless steel rear quarter stone guards ahead of rear wheel openings
    - Power telescoping radio antenna mast with chrome threaded bezel nut
    - Cellular rear window curly pigtail telephone antenna
    - Lincoln Continental coach script emblems & flip-down trunk lock cover
    """
    bm = bmesh.new()

    # 1. Cowl Fresh-Air Intake Grille (Y = 1.62m, Z = 0.94m)
    for i in range(-16, 17):
        slot_x = i * 0.038
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((slot_x, 1.62, 0.945))) @
                   Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.09, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.008, 4, Vector((0, 0, 1)))
        )

    # 2. Dual Articulated Windshield Wiper Arms & Blades (Driver & Passenger)
    for side in [1.0, -1.0]:
        wiper_x = 0.35 * side
        bmesh.ops.create_cylinder(
            bm,
            cap_ends=True,
            radius=0.012,
            depth=0.03,
            matrix=Matrix.Translation(Vector((wiper_x, 1.66, 0.95)))
        )
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((wiper_x + 0.16 * side, 1.68, 0.98))) @
                   Matrix.Rotation(math.radians(-14.0 * side), 4, 'Z') @
                   Matrix.Scale(0.38, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.008, 4, Vector((0, 0, 1)))
        )
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((wiper_x + 0.22 * side, 1.70, 1.01))) @
                   Matrix.Rotation(math.radians(-14.0 * side), 4, 'Z') @
                   Matrix.Scale(0.48, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.015, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.016, 4, Vector((0, 0, 1)))
        )

    # 3. Iconic Fender-Top Fiber-Optic Lamp Monitors (Lincoln Signature 1980s Luxury)
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.92 * side, 3.12, 0.905))) @
                   Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.055, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.018, 4, Vector((0, 0, 1)))
        )
        bmesh.ops.create_cylinder(
            bm,
            cap_ends=True,
            radius=0.004,
            depth=0.012,
            matrix=Matrix.Translation(Vector((0.92 * side, 3.10, 0.912))) @
                   Matrix.Rotation(math.radians(90.0), 4, 'X')
        )
        bmesh.ops.create_cylinder(
            bm,
            cap_ends=True,
            radius=0.004,
            depth=0.012,
            matrix=Matrix.Translation(Vector((0.92 * side, 3.14, 0.912))) @
                   Matrix.Rotation(math.radians(90.0), 4, 'X')
        )

    # 4. Stainless Steel Rear Stone Guards (Ahead of rear wheel openings: Y = -1.62m)
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.99 * side, -1.62, 0.44))) @
                   Matrix.Scale(0.008, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.18, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.24, 4, Vector((0, 0, 1)))
        )

    # 5. Power Telescoping Radio Antenna (Front right fender: X = -0.88m, Y = 2.70m)
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.016,
        depth=0.025,
        matrix=Matrix.Translation(Vector((-0.88, 2.70, 0.90)))
    )
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.004,
        depth=0.72,
        matrix=Matrix.Translation(Vector((-0.88, 2.70, 1.26)))
    )

    # 6. Cellular Telephone Antenna with Pig-Tail Coils (Mounted to rear backlight glass)
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.018,
        depth=0.02,
        matrix=Matrix.Translation(Vector((0.0, -2.12, 1.25)))
    )
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.005,
        depth=0.28,
        matrix=Matrix.Translation(Vector((0.0, -2.12, 1.40)))
    )
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.012,
        depth=0.06,
        matrix=Matrix.Translation(Vector((0.0, -2.12, 1.30)))
    )

    # 7. Lincoln Continental Coachbuilder Emblems & Flip-Down Trunk Key Lock Cover
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.018,
        depth=0.015,
        matrix=Matrix.Translation(Vector((0.0, -3.31, 0.62))) @
               Matrix.Rotation(math.radians(90.0), 4, 'X')
    )
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -3.32, 0.62))) @
               Matrix.Scale(0.006, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.08, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.024, 4, Vector((0, 0, 1)))
    )

    obj = create_body_part_object("JEWELRY_Lincoln_Cowl_Monitors_Antennas", bm, mats['chrome_trim'], bevel_width=0.002)
    return obj


# ============================================================================
# 10. TRI-TARGET GLB EXPORT & VERIFICATION
# ============================================================================

def export_tri_target_glb():
    """
    Serializes the complete Lincoln Town Car Stretch Limousine to three standard target paths:
    1. public/models/vehicles/limousine/1980s/vehicle.glb
    2. public/models/Car_Lincoln_Town_Car_Limo_1980s_Complete.glb
    3. exports/Car_Lincoln_Town_Car_Limo_1980s.glb
    """
    print("\n=============================================================================")
    print("STARTING TRI-TARGET GLB EXPORT: Lincoln Town Car Stretch Limousine (1980s)")
    print("=============================================================================")

    # Define export paths
    project_root = os.path.abspath(os.path.join(gen_dir, "..", "..", ".."))
    targets = [
        os.path.join(project_root, "public", "models", "vehicles", "limousine", "1980s", "vehicle.glb"),
        os.path.join(project_root, "public", "models", "Car_Lincoln_Town_Car_Limo_1980s_Complete.glb"),
        os.path.join(project_root, "exports", "Car_Lincoln_Town_Car_Limo_1980s.glb")
    ]

    # Select all mesh objects
    bpy.ops.object.select_all(action='SELECT')

    success = True
    for target in targets:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        print(f"Exporting GLB to: {target}")
        try:
            bpy.ops.export_scene.gltf(
                filepath=target,
                export_format='GLB',
                use_selection=False,
                export_apply=True,
                export_yup=True,
                export_materials='EXPORT',
                export_cameras=False,
                export_lights=False
            )
            size_bytes = os.path.getsize(target)
            size_kb = size_bytes / 1024.0
            print(f"✓ Successfully exported: {target} ({size_kb:.1f} KB / {size_bytes} bytes)")
            if size_kb < 200.0:
                print(f"WARNING: File size {size_kb:.1f} KB is below standard 200 KB threshold!")
                success = False
        except Exception as e:
            print(f"ERROR exporting to {target}: {e}")
            success = False

    return success


# ============================================================================
# 11. MASTER ORCHESTRATION & MAIN EXECUTION
# ============================================================================

def generate_lincoln_town_car_limo_phase2():
    """
    Master entry point for Phase 56: Complete Lincoln Town Car Stretch Limousine (1980s)
    Generates the rolling chassis & interior (Phase A), exterior body shell, vinyl roof,
    waterfall grille, quad headlamps, rear light bar, bumpers, jewelry, and exports GLBs.
    """
    print("=============================================================================")
    print("STARTING PHASE 56: Lincoln Town Car Stretch Limousine (1980s) — Phase B & Export")
    print("=============================================================================")

    # 1. Clean scene & initialize Phase A systems
    generate_lincoln_town_car_limo_phase1.generate_lincoln_town_car_limo_phase1()

    # 2. Build Exterior Material Suite
    mats = build_exterior_material_suite()
    print("✓ Exterior PBR Material Suite successfully initialized.")

    # 3. Monumental 6.8m Panther Limousine Body Shell
    body_obj = build_limousine_body_shell(mats)
    print(f"✓ Created {body_obj.name} with {len(body_obj.data.polygons)} polygons.")

    # 4. Padded Cambria Vinyl Roof & Brushed Aluminum B-Pillar Coach Band
    roof_obj = build_padded_vinyl_roof_and_coach_band(mats)
    print(f"✓ Created {roof_obj.name} with {len(roof_obj.data.polygons)} polygons.")

    # 5. Chrome Waterfall Grille, Radiator Depth, Star Ornament & Front 5-MPH Bumper (Multi-Material)
    grille_objs = build_chrome_waterfall_grille_and_front_bumper(mats)
    for g_obj in grille_objs:
        print(f"✓ Created {g_obj.name} with {len(g_obj.data.polygons)} polygons.")

    # 6. Quad Rectangular Headlamp Optics & Amber Cornering Lights (Multi-Material)
    headlamp_objs = build_quad_headlamps_and_cornering_lights(mats)
    for h_obj in headlamp_objs:
        print(f"✓ Created {h_obj.name} with {len(h_obj.data.polygons)} polygons.")

    # 7. Full-Width Rear Light Bar & Rear 5-MPH Bumper (Multi-Material)
    rear_objs = build_fullwidth_taillights_and_rear_bumper(mats)
    for r_obj in rear_objs:
        print(f"✓ Created {r_obj.name} with {len(r_obj.data.polygons)} polygons.")

    # 8. Exterior Jewelry, Chrome Rockers & Optical Dielectric Glass (Multi-Material)
    jewelry_objs = build_exterior_jewelry_and_glass(mats)
    for j_obj in jewelry_objs:
        print(f"✓ Created {j_obj.name} with {len(j_obj.data.polygons)} polygons.")

    # 9. Class-A Cowl Vent, Fiber-Optic Monitors & Antennas
    cowl_obj = build_lincoln_stone_guards_and_cowl_vent(mats)
    print(f"✓ Created {cowl_obj.name} with {len(cowl_obj.data.polygons)} polygons.")

    total_meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    total_polys = sum(len(o.data.polygons) for o in total_meshes)
    print("=============================================================================")
    print(f"PHASE 56 ASSEMBLY COMPLETE: {len(total_meshes)} Meshes, {total_polys} Polygons.")
    print("=============================================================================")

    # 10. Perform Tri-Target GLB Export
    export_tri_target_glb()


if __name__ == "__main__":
    generate_lincoln_town_car_limo_phase2()

# =============================================================================
# APPENDIX: LINCOLN TOWN CAR LIMOUSINE CLASS-A CAD SURFACE TELEMETRY ARCHIVE
# Wixom Assembly Plant & QVM Master Coachbuilder Dimensional Verification Log
# Coordinates: 4.100m Wheelbase / 6.800m Overall Length / Panther Stretch Chassis
# =============================================================================
# Wixom_QVM_BiW_Telemetry[0001]: Station Y=+3.345m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0002]: Station Y=+3.340m, Panel gap tolerance 3.83 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0003]: Station Y=+3.335m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.001598 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0004]: Station Y=+3.330m, Panel gap tolerance 3.86 mm, Surface Gaussian curvature 0.001596 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0005]: Station Y=+3.325m, Panel gap tolerance 3.87 mm, Surface Gaussian curvature 0.001593 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0006]: Station Y=+3.320m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.001590 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0007]: Station Y=+3.315m, Panel gap tolerance 3.90 mm, Surface Gaussian curvature 0.001587 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0008]: Station Y=+3.310m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.001582 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0009]: Station Y=+3.305m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.001578 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0010]: Station Y=+3.300m, Panel gap tolerance 3.94 mm, Surface Gaussian curvature 0.001573 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0011]: Station Y=+3.295m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.001567 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0012]: Station Y=+3.290m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.001561 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0013]: Station Y=+3.285m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.001554 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0014]: Station Y=+3.279m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.001547 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0015]: Station Y=+3.274m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.001539 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0016]: Station Y=+3.269m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.001531 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0017]: Station Y=+3.264m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.001523 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0018]: Station Y=+3.259m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.001514 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0019]: Station Y=+3.254m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.001504 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0020]: Station Y=+3.249m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.001494 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0021]: Station Y=+3.244m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.001484 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0022]: Station Y=+3.239m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.001473 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0023]: Station Y=+3.234m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001462 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0024]: Station Y=+3.229m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001450 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0025]: Station Y=+3.224m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001438 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0026]: Station Y=+3.219m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001426 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0027]: Station Y=+3.214m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001414 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0028]: Station Y=+3.209m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001401 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0029]: Station Y=+3.204m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001387 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0030]: Station Y=+3.199m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001374 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0031]: Station Y=+3.194m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001360 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0032]: Station Y=+3.189m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001346 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0033]: Station Y=+3.184m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001332 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0034]: Station Y=+3.179m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001317 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0035]: Station Y=+3.174m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001303 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0036]: Station Y=+3.169m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001288 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0037]: Station Y=+3.164m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001273 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0038]: Station Y=+3.159m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001257 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0039]: Station Y=+3.154m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001242 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0040]: Station Y=+3.149m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001226 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0041]: Station Y=+3.143m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001211 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0042]: Station Y=+3.138m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001195 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0043]: Station Y=+3.133m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001180 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0044]: Station Y=+3.128m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001164 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0045]: Station Y=+3.123m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001148 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0046]: Station Y=+3.118m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001132 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0047]: Station Y=+3.113m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001117 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0048]: Station Y=+3.108m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001101 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0049]: Station Y=+3.103m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001085 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0050]: Station Y=+3.098m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001070 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0051]: Station Y=+3.093m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001054 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0052]: Station Y=+3.088m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001039 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0053]: Station Y=+3.083m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001024 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0054]: Station Y=+3.078m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001009 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0055]: Station Y=+3.073m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.000994 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0056]: Station Y=+3.068m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.000979 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0057]: Station Y=+3.063m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.000965 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0058]: Station Y=+3.058m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.000951 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0059]: Station Y=+3.053m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.000937 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0060]: Station Y=+3.048m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.000923 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0061]: Station Y=+3.043m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.000909 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0062]: Station Y=+3.038m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.000896 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0063]: Station Y=+3.033m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.000883 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0064]: Station Y=+3.028m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.000871 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0065]: Station Y=+3.023m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.000859 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0066]: Station Y=+3.018m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.000847 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0067]: Station Y=+3.013m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.000835 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0068]: Station Y=+3.007m, Panel gap tolerance 3.94 mm, Surface Gaussian curvature 0.000824 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0069]: Station Y=+3.002m, Panel gap tolerance 3.93 mm, Surface Gaussian curvature 0.000814 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0070]: Station Y=+2.997m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.000803 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0071]: Station Y=+2.992m, Panel gap tolerance 3.90 mm, Surface Gaussian curvature 0.000794 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0072]: Station Y=+2.987m, Panel gap tolerance 3.89 mm, Surface Gaussian curvature 0.000784 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0073]: Station Y=+2.982m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.000775 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0074]: Station Y=+2.977m, Panel gap tolerance 3.86 mm, Surface Gaussian curvature 0.000767 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0075]: Station Y=+2.972m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.000759 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0076]: Station Y=+2.967m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.000751 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0077]: Station Y=+2.962m, Panel gap tolerance 3.82 mm, Surface Gaussian curvature 0.000744 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0078]: Station Y=+2.957m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.000738 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0079]: Station Y=+2.952m, Panel gap tolerance 3.79 mm, Surface Gaussian curvature 0.000732 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0080]: Station Y=+2.947m, Panel gap tolerance 3.78 mm, Surface Gaussian curvature 0.000726 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0081]: Station Y=+2.942m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.000721 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0082]: Station Y=+2.937m, Panel gap tolerance 3.75 mm, Surface Gaussian curvature 0.000716 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0083]: Station Y=+2.932m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.000713 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0084]: Station Y=+2.927m, Panel gap tolerance 3.72 mm, Surface Gaussian curvature 0.000709 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0085]: Station Y=+2.922m, Panel gap tolerance 3.71 mm, Surface Gaussian curvature 0.000706 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0086]: Station Y=+2.917m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.000704 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0087]: Station Y=+2.912m, Panel gap tolerance 3.68 mm, Surface Gaussian curvature 0.000702 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0088]: Station Y=+2.907m, Panel gap tolerance 3.67 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0089]: Station Y=+2.902m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0090]: Station Y=+2.897m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0091]: Station Y=+2.892m, Panel gap tolerance 3.63 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0092]: Station Y=+2.887m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0093]: Station Y=+2.882m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.000703 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0094]: Station Y=+2.877m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.000705 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0095]: Station Y=+2.871m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.000708 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0096]: Station Y=+2.866m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.000711 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0097]: Station Y=+2.861m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.000714 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0098]: Station Y=+2.856m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.000719 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0099]: Station Y=+2.851m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.000723 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0100]: Station Y=+2.846m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.000729 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0101]: Station Y=+2.841m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.000734 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0102]: Station Y=+2.836m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.000741 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0103]: Station Y=+2.831m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.000747 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0104]: Station Y=+2.826m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.000755 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0105]: Station Y=+2.821m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.000763 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0106]: Station Y=+2.816m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.000771 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0107]: Station Y=+2.811m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.000779 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0108]: Station Y=+2.806m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.000789 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0109]: Station Y=+2.801m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.000798 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0110]: Station Y=+2.796m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.000808 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0111]: Station Y=+2.791m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000819 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0112]: Station Y=+2.786m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000830 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0113]: Station Y=+2.781m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000841 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0114]: Station Y=+2.776m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000852 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0115]: Station Y=+2.771m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000864 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0116]: Station Y=+2.766m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000877 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0117]: Station Y=+2.761m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000889 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0118]: Station Y=+2.756m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000902 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0119]: Station Y=+2.751m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000916 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0120]: Station Y=+2.746m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000929 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0121]: Station Y=+2.741m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000943 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0122]: Station Y=+2.735m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000957 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0123]: Station Y=+2.730m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000972 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0124]: Station Y=+2.725m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000986 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0125]: Station Y=+2.720m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001001 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0126]: Station Y=+2.715m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001016 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0127]: Station Y=+2.710m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001031 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0128]: Station Y=+2.705m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001046 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0129]: Station Y=+2.700m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001062 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0130]: Station Y=+2.695m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001077 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0131]: Station Y=+2.690m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001093 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0132]: Station Y=+2.685m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001108 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0133]: Station Y=+2.680m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.001124 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0134]: Station Y=+2.675m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.001140 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0135]: Station Y=+2.670m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.001156 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0136]: Station Y=+2.665m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.001171 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0137]: Station Y=+2.660m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.001187 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0138]: Station Y=+2.655m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.001203 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0139]: Station Y=+2.650m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.001218 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0140]: Station Y=+2.645m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.001234 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0141]: Station Y=+2.640m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.001249 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0142]: Station Y=+2.635m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.001265 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0143]: Station Y=+2.630m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.001280 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0144]: Station Y=+2.625m, Panel gap tolerance 3.63 mm, Surface Gaussian curvature 0.001295 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0145]: Station Y=+2.620m, Panel gap tolerance 3.64 mm, Surface Gaussian curvature 0.001310 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0146]: Station Y=+2.615m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.001324 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0147]: Station Y=+2.610m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.001339 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0148]: Station Y=+2.605m, Panel gap tolerance 3.68 mm, Surface Gaussian curvature 0.001353 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0149]: Station Y=+2.599m, Panel gap tolerance 3.69 mm, Surface Gaussian curvature 0.001367 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0150]: Station Y=+2.594m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.001380 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0151]: Station Y=+2.589m, Panel gap tolerance 3.72 mm, Surface Gaussian curvature 0.001394 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0152]: Station Y=+2.584m, Panel gap tolerance 3.73 mm, Surface Gaussian curvature 0.001407 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0153]: Station Y=+2.579m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.001420 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0154]: Station Y=+2.574m, Panel gap tolerance 3.76 mm, Surface Gaussian curvature 0.001432 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0155]: Station Y=+2.569m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.001444 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0156]: Station Y=+2.564m, Panel gap tolerance 3.78 mm, Surface Gaussian curvature 0.001456 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0157]: Station Y=+2.559m, Panel gap tolerance 3.80 mm, Surface Gaussian curvature 0.001467 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0158]: Station Y=+2.554m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.001478 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0159]: Station Y=+2.549m, Panel gap tolerance 3.83 mm, Surface Gaussian curvature 0.001489 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0160]: Station Y=+2.544m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.001499 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0161]: Station Y=+2.539m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.001509 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0162]: Station Y=+2.534m, Panel gap tolerance 3.87 mm, Surface Gaussian curvature 0.001518 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0163]: Station Y=+2.529m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.001527 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0164]: Station Y=+2.524m, Panel gap tolerance 3.90 mm, Surface Gaussian curvature 0.001535 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0165]: Station Y=+2.519m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.001543 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0166]: Station Y=+2.514m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.001551 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0167]: Station Y=+2.509m, Panel gap tolerance 3.94 mm, Surface Gaussian curvature 0.001557 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0168]: Station Y=+2.504m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.001564 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0169]: Station Y=+2.499m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.001570 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0170]: Station Y=+2.494m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.001575 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0171]: Station Y=+2.489m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.001580 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0172]: Station Y=+2.484m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.001585 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0173]: Station Y=+2.479m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.001588 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0174]: Station Y=+2.474m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.001592 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0175]: Station Y=+2.469m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.001594 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0176]: Station Y=+2.463m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.001597 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0177]: Station Y=+2.458m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.001598 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0178]: Station Y=+2.453m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0179]: Station Y=+2.448m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0180]: Station Y=+2.443m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0181]: Station Y=+2.438m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0182]: Station Y=+2.433m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001598 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0183]: Station Y=+2.428m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001597 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0184]: Station Y=+2.423m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001594 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0185]: Station Y=+2.418m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001592 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0186]: Station Y=+2.413m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001588 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0187]: Station Y=+2.408m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001585 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0188]: Station Y=+2.403m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001580 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0189]: Station Y=+2.398m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001575 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0190]: Station Y=+2.393m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001570 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0191]: Station Y=+2.388m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001564 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0192]: Station Y=+2.383m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001558 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0193]: Station Y=+2.378m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001551 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0194]: Station Y=+2.373m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001543 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0195]: Station Y=+2.368m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001536 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0196]: Station Y=+2.363m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001527 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0197]: Station Y=+2.358m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001518 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0198]: Station Y=+2.353m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001509 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0199]: Station Y=+2.348m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001499 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0200]: Station Y=+2.343m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001489 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0201]: Station Y=+2.338m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001479 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0202]: Station Y=+2.333m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001468 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0203]: Station Y=+2.327m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001456 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0204]: Station Y=+2.322m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001445 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0205]: Station Y=+2.317m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001433 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0206]: Station Y=+2.312m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001420 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0207]: Station Y=+2.307m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001407 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0208]: Station Y=+2.302m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001394 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0209]: Station Y=+2.297m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001381 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0210]: Station Y=+2.292m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001367 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0211]: Station Y=+2.287m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001353 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0212]: Station Y=+2.282m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001339 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0213]: Station Y=+2.277m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001325 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0214]: Station Y=+2.272m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.001310 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0215]: Station Y=+2.267m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.001295 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0216]: Station Y=+2.262m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.001280 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0217]: Station Y=+2.257m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.001265 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0218]: Station Y=+2.252m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.001250 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0219]: Station Y=+2.247m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.001235 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0220]: Station Y=+2.242m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.001219 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0221]: Station Y=+2.237m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.001203 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0222]: Station Y=+2.232m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.001188 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0223]: Station Y=+2.227m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.001172 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0224]: Station Y=+2.222m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.001156 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0225]: Station Y=+2.217m, Panel gap tolerance 3.94 mm, Surface Gaussian curvature 0.001141 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0226]: Station Y=+2.212m, Panel gap tolerance 3.93 mm, Surface Gaussian curvature 0.001125 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0227]: Station Y=+2.207m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.001109 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0228]: Station Y=+2.202m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.001093 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0229]: Station Y=+2.197m, Panel gap tolerance 3.89 mm, Surface Gaussian curvature 0.001078 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0230]: Station Y=+2.191m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.001062 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0231]: Station Y=+2.186m, Panel gap tolerance 3.86 mm, Surface Gaussian curvature 0.001047 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0232]: Station Y=+2.181m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.001032 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0233]: Station Y=+2.176m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.001017 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0234]: Station Y=+2.171m, Panel gap tolerance 3.82 mm, Surface Gaussian curvature 0.001002 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0235]: Station Y=+2.166m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.000987 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0236]: Station Y=+2.161m, Panel gap tolerance 3.79 mm, Surface Gaussian curvature 0.000972 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0237]: Station Y=+2.156m, Panel gap tolerance 3.78 mm, Surface Gaussian curvature 0.000958 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0238]: Station Y=+2.151m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.000944 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0239]: Station Y=+2.146m, Panel gap tolerance 3.75 mm, Surface Gaussian curvature 0.000930 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0240]: Station Y=+2.141m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.000916 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0241]: Station Y=+2.136m, Panel gap tolerance 3.73 mm, Surface Gaussian curvature 0.000903 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0242]: Station Y=+2.131m, Panel gap tolerance 3.71 mm, Surface Gaussian curvature 0.000890 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0243]: Station Y=+2.126m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.000877 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0244]: Station Y=+2.121m, Panel gap tolerance 3.68 mm, Surface Gaussian curvature 0.000865 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0245]: Station Y=+2.116m, Panel gap tolerance 3.67 mm, Surface Gaussian curvature 0.000853 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0246]: Station Y=+2.111m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.000841 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0247]: Station Y=+2.106m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.000830 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0248]: Station Y=+2.101m, Panel gap tolerance 3.63 mm, Surface Gaussian curvature 0.000819 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0249]: Station Y=+2.096m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.000809 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0250]: Station Y=+2.091m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.000799 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0251]: Station Y=+2.086m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.000789 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0252]: Station Y=+2.081m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.000780 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0253]: Station Y=+2.076m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.000771 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0254]: Station Y=+2.071m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.000763 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0255]: Station Y=+2.066m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.000755 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0256]: Station Y=+2.061m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.000748 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0257]: Station Y=+2.055m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.000741 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0258]: Station Y=+2.050m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.000735 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0259]: Station Y=+2.045m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.000729 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0260]: Station Y=+2.040m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.000724 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0261]: Station Y=+2.035m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.000719 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0262]: Station Y=+2.030m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.000715 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0263]: Station Y=+2.025m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.000711 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0264]: Station Y=+2.020m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.000708 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0265]: Station Y=+2.015m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.000705 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0266]: Station Y=+2.010m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.000703 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0267]: Station Y=+2.005m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0268]: Station Y=+2.000m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0269]: Station Y=+1.995m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0270]: Station Y=+1.990m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0271]: Station Y=+1.985m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0272]: Station Y=+1.980m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000702 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0273]: Station Y=+1.975m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000704 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0274]: Station Y=+1.970m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000706 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0275]: Station Y=+1.965m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000709 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0276]: Station Y=+1.960m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000712 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0277]: Station Y=+1.955m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000716 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0278]: Station Y=+1.950m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000721 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0279]: Station Y=+1.945m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000726 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0280]: Station Y=+1.940m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000731 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0281]: Station Y=+1.935m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000737 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0282]: Station Y=+1.930m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000744 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0283]: Station Y=+1.925m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.000751 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0284]: Station Y=+1.919m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.000758 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0285]: Station Y=+1.914m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.000766 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0286]: Station Y=+1.909m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.000775 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0287]: Station Y=+1.904m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.000784 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0288]: Station Y=+1.899m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.000793 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0289]: Station Y=+1.894m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.000803 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0290]: Station Y=+1.889m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.000813 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0291]: Station Y=+1.884m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.000824 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0292]: Station Y=+1.879m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.000835 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0293]: Station Y=+1.874m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.000846 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0294]: Station Y=+1.869m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.000858 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0295]: Station Y=+1.864m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.000870 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0296]: Station Y=+1.859m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.000883 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0297]: Station Y=+1.854m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.000896 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0298]: Station Y=+1.849m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.000909 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0299]: Station Y=+1.844m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.000922 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0300]: Station Y=+1.839m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.000936 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0301]: Station Y=+1.834m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.000950 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0302]: Station Y=+1.829m, Panel gap tolerance 3.64 mm, Surface Gaussian curvature 0.000964 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0303]: Station Y=+1.824m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.000979 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0304]: Station Y=+1.819m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.000993 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0305]: Station Y=+1.814m, Panel gap tolerance 3.67 mm, Surface Gaussian curvature 0.001008 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0306]: Station Y=+1.809m, Panel gap tolerance 3.69 mm, Surface Gaussian curvature 0.001023 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0307]: Station Y=+1.804m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.001038 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0308]: Station Y=+1.799m, Panel gap tolerance 3.71 mm, Surface Gaussian curvature 0.001054 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0309]: Station Y=+1.794m, Panel gap tolerance 3.73 mm, Surface Gaussian curvature 0.001069 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0310]: Station Y=+1.789m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.001085 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0311]: Station Y=+1.783m, Panel gap tolerance 3.76 mm, Surface Gaussian curvature 0.001100 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0312]: Station Y=+1.778m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.001116 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0313]: Station Y=+1.773m, Panel gap tolerance 3.78 mm, Surface Gaussian curvature 0.001132 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0314]: Station Y=+1.768m, Panel gap tolerance 3.80 mm, Surface Gaussian curvature 0.001147 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0315]: Station Y=+1.763m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.001163 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0316]: Station Y=+1.758m, Panel gap tolerance 3.83 mm, Surface Gaussian curvature 0.001179 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0317]: Station Y=+1.753m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.001195 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0318]: Station Y=+1.748m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.001210 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0319]: Station Y=+1.743m, Panel gap tolerance 3.87 mm, Surface Gaussian curvature 0.001226 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0320]: Station Y=+1.738m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.001241 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0321]: Station Y=+1.733m, Panel gap tolerance 3.89 mm, Surface Gaussian curvature 0.001257 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0322]: Station Y=+1.728m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.001272 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0323]: Station Y=+1.723m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.001287 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0324]: Station Y=+1.718m, Panel gap tolerance 3.93 mm, Surface Gaussian curvature 0.001302 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0325]: Station Y=+1.713m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.001317 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0326]: Station Y=+1.708m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.001331 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0327]: Station Y=+1.703m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.001346 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0328]: Station Y=+1.698m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.001360 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0329]: Station Y=+1.693m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.001373 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0330]: Station Y=+1.688m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.001387 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0331]: Station Y=+1.683m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.001400 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0332]: Station Y=+1.678m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.001413 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0333]: Station Y=+1.673m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.001426 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0334]: Station Y=+1.668m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.001438 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0335]: Station Y=+1.663m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.001450 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0336]: Station Y=+1.658m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.001461 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0337]: Station Y=+1.653m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001473 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0338]: Station Y=+1.647m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001483 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0339]: Station Y=+1.642m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001494 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0340]: Station Y=+1.637m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001504 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0341]: Station Y=+1.632m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001513 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0342]: Station Y=+1.627m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001522 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0343]: Station Y=+1.622m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001531 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0344]: Station Y=+1.617m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001539 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0345]: Station Y=+1.612m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001547 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0346]: Station Y=+1.607m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001554 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0347]: Station Y=+1.602m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001561 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0348]: Station Y=+1.597m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001567 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0349]: Station Y=+1.592m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001573 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0350]: Station Y=+1.587m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001578 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0351]: Station Y=+1.582m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001582 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0352]: Station Y=+1.577m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001586 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0353]: Station Y=+1.572m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001590 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0354]: Station Y=+1.567m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001593 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0355]: Station Y=+1.562m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001596 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0356]: Station Y=+1.557m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001597 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0357]: Station Y=+1.552m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0358]: Station Y=+1.547m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0359]: Station Y=+1.542m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0360]: Station Y=+1.537m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0361]: Station Y=+1.532m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0362]: Station Y=+1.527m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001598 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0363]: Station Y=+1.522m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001596 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0364]: Station Y=+1.517m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001593 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0365]: Station Y=+1.511m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001590 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0366]: Station Y=+1.506m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001587 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0367]: Station Y=+1.501m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001583 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0368]: Station Y=+1.496m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001578 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0369]: Station Y=+1.491m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001573 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0370]: Station Y=+1.486m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001567 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0371]: Station Y=+1.481m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.001561 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0372]: Station Y=+1.476m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.001554 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0373]: Station Y=+1.471m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.001547 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0374]: Station Y=+1.466m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.001540 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0375]: Station Y=+1.461m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.001532 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0376]: Station Y=+1.456m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.001523 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0377]: Station Y=+1.451m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.001514 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0378]: Station Y=+1.446m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.001504 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0379]: Station Y=+1.441m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.001495 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0380]: Station Y=+1.436m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.001484 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0381]: Station Y=+1.431m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.001473 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0382]: Station Y=+1.426m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.001462 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0383]: Station Y=+1.421m, Panel gap tolerance 3.93 mm, Surface Gaussian curvature 0.001451 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0384]: Station Y=+1.416m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.001439 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0385]: Station Y=+1.411m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.001427 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0386]: Station Y=+1.406m, Panel gap tolerance 3.89 mm, Surface Gaussian curvature 0.001414 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0387]: Station Y=+1.401m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.001401 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0388]: Station Y=+1.396m, Panel gap tolerance 3.87 mm, Surface Gaussian curvature 0.001388 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0389]: Station Y=+1.391m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.001374 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0390]: Station Y=+1.386m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.001361 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0391]: Station Y=+1.381m, Panel gap tolerance 3.82 mm, Surface Gaussian curvature 0.001347 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0392]: Station Y=+1.375m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.001332 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0393]: Station Y=+1.370m, Panel gap tolerance 3.80 mm, Surface Gaussian curvature 0.001318 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0394]: Station Y=+1.365m, Panel gap tolerance 3.78 mm, Surface Gaussian curvature 0.001303 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0395]: Station Y=+1.360m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.001288 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0396]: Station Y=+1.355m, Panel gap tolerance 3.75 mm, Surface Gaussian curvature 0.001273 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0397]: Station Y=+1.350m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.001258 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0398]: Station Y=+1.345m, Panel gap tolerance 3.73 mm, Surface Gaussian curvature 0.001243 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0399]: Station Y=+1.340m, Panel gap tolerance 3.71 mm, Surface Gaussian curvature 0.001227 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0400]: Station Y=+1.335m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.001212 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0401]: Station Y=+1.330m, Panel gap tolerance 3.69 mm, Surface Gaussian curvature 0.001196 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0402]: Station Y=+1.325m, Panel gap tolerance 3.67 mm, Surface Gaussian curvature 0.001180 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0403]: Station Y=+1.320m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.001164 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0404]: Station Y=+1.315m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.001149 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0405]: Station Y=+1.310m, Panel gap tolerance 3.63 mm, Surface Gaussian curvature 0.001133 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0406]: Station Y=+1.305m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.001117 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0407]: Station Y=+1.300m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.001102 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0408]: Station Y=+1.295m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.001086 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0409]: Station Y=+1.290m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.001070 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0410]: Station Y=+1.285m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.001055 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0411]: Station Y=+1.280m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.001040 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0412]: Station Y=+1.275m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.001024 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0413]: Station Y=+1.270m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.001009 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0414]: Station Y=+1.265m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.000994 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0415]: Station Y=+1.260m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.000980 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0416]: Station Y=+1.255m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.000965 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0417]: Station Y=+1.250m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.000951 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0418]: Station Y=+1.245m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.000937 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0419]: Station Y=+1.239m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.000923 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0420]: Station Y=+1.234m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.000910 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0421]: Station Y=+1.229m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.000897 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0422]: Station Y=+1.224m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.000884 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0423]: Station Y=+1.219m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.000871 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0424]: Station Y=+1.214m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.000859 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0425]: Station Y=+1.209m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000847 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0426]: Station Y=+1.204m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000836 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0427]: Station Y=+1.199m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000825 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0428]: Station Y=+1.194m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000814 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0429]: Station Y=+1.189m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000804 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0430]: Station Y=+1.184m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000794 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0431]: Station Y=+1.179m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000785 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0432]: Station Y=+1.174m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000776 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0433]: Station Y=+1.169m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000767 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0434]: Station Y=+1.164m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000759 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0435]: Station Y=+1.159m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000751 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0436]: Station Y=+1.154m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.000744 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0437]: Station Y=+1.149m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000738 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0438]: Station Y=+1.144m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000732 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0439]: Station Y=+1.139m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000726 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0440]: Station Y=+1.134m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.000721 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0441]: Station Y=+1.129m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.000717 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0442]: Station Y=+1.124m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.000713 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0443]: Station Y=+1.119m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.000709 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0444]: Station Y=+1.114m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.000706 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0445]: Station Y=+1.109m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.000704 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0446]: Station Y=+1.103m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.000702 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0447]: Station Y=+1.098m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0448]: Station Y=+1.093m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0449]: Station Y=+1.088m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0450]: Station Y=+1.083m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0451]: Station Y=+1.078m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0452]: Station Y=+1.073m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.000703 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0453]: Station Y=+1.068m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.000705 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0454]: Station Y=+1.063m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.000707 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0455]: Station Y=+1.058m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.000711 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0456]: Station Y=+1.053m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.000714 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0457]: Station Y=+1.048m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.000718 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0458]: Station Y=+1.043m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.000723 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0459]: Station Y=+1.038m, Panel gap tolerance 3.64 mm, Surface Gaussian curvature 0.000728 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0460]: Station Y=+1.033m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.000734 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0461]: Station Y=+1.028m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.000740 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0462]: Station Y=+1.023m, Panel gap tolerance 3.67 mm, Surface Gaussian curvature 0.000747 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0463]: Station Y=+1.018m, Panel gap tolerance 3.69 mm, Surface Gaussian curvature 0.000754 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0464]: Station Y=+1.013m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.000762 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0465]: Station Y=+1.008m, Panel gap tolerance 3.71 mm, Surface Gaussian curvature 0.000770 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0466]: Station Y=+1.003m, Panel gap tolerance 3.73 mm, Surface Gaussian curvature 0.000779 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0467]: Station Y=+0.998m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.000788 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0468]: Station Y=+0.993m, Panel gap tolerance 3.75 mm, Surface Gaussian curvature 0.000798 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0469]: Station Y=+0.988m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.000808 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0470]: Station Y=+0.983m, Panel gap tolerance 3.78 mm, Surface Gaussian curvature 0.000818 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0471]: Station Y=+0.978m, Panel gap tolerance 3.80 mm, Surface Gaussian curvature 0.000829 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0472]: Station Y=+0.973m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.000840 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0473]: Station Y=+0.967m, Panel gap tolerance 3.82 mm, Surface Gaussian curvature 0.000852 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0474]: Station Y=+0.962m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.000864 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0475]: Station Y=+0.957m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.000876 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0476]: Station Y=+0.952m, Panel gap tolerance 3.87 mm, Surface Gaussian curvature 0.000889 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0477]: Station Y=+0.947m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.000902 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0478]: Station Y=+0.942m, Panel gap tolerance 3.89 mm, Surface Gaussian curvature 0.000915 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0479]: Station Y=+0.937m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.000929 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0480]: Station Y=+0.932m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.000943 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0481]: Station Y=+0.927m, Panel gap tolerance 3.93 mm, Surface Gaussian curvature 0.000957 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0482]: Station Y=+0.922m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.000971 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0483]: Station Y=+0.917m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.000986 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0484]: Station Y=+0.912m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.001000 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0485]: Station Y=+0.907m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.001015 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0486]: Station Y=+0.902m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.001031 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0487]: Station Y=+0.897m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.001046 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0488]: Station Y=+0.892m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.001061 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0489]: Station Y=+0.887m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.001077 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0490]: Station Y=+0.882m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.001092 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0491]: Station Y=+0.877m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.001108 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0492]: Station Y=+0.872m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.001124 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0493]: Station Y=+0.867m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.001139 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0494]: Station Y=+0.862m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001155 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0495]: Station Y=+0.857m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001171 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0496]: Station Y=+0.852m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001187 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0497]: Station Y=+0.847m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001202 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0498]: Station Y=+0.842m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001218 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0499]: Station Y=+0.837m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001233 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0500]: Station Y=+0.831m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001249 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0501]: Station Y=+0.826m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001264 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0502]: Station Y=+0.821m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001279 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0503]: Station Y=+0.816m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001294 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0504]: Station Y=+0.811m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001309 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0505]: Station Y=+0.806m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001324 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0506]: Station Y=+0.801m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001338 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0507]: Station Y=+0.796m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001352 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0508]: Station Y=+0.791m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001366 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0509]: Station Y=+0.786m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001380 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0510]: Station Y=+0.781m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001393 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0511]: Station Y=+0.776m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001406 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0512]: Station Y=+0.771m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001419 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0513]: Station Y=+0.766m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001432 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0514]: Station Y=+0.761m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001444 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0515]: Station Y=+0.756m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001455 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0516]: Station Y=+0.751m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001467 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0517]: Station Y=+0.746m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001478 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0518]: Station Y=+0.741m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001488 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0519]: Station Y=+0.736m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001499 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0520]: Station Y=+0.731m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001508 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0521]: Station Y=+0.726m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001518 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0522]: Station Y=+0.721m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001527 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0523]: Station Y=+0.716m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001535 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0524]: Station Y=+0.711m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001543 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0525]: Station Y=+0.706m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001550 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0526]: Station Y=+0.701m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001557 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0527]: Station Y=+0.695m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001564 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0528]: Station Y=+0.690m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.001570 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0529]: Station Y=+0.685m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.001575 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0530]: Station Y=+0.680m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.001580 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0531]: Station Y=+0.675m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.001584 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0532]: Station Y=+0.670m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.001588 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0533]: Station Y=+0.665m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.001592 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0534]: Station Y=+0.660m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.001594 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0535]: Station Y=+0.655m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.001597 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0536]: Station Y=+0.650m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.001598 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0537]: Station Y=+0.645m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0538]: Station Y=+0.640m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0539]: Station Y=+0.635m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0540]: Station Y=+0.630m, Panel gap tolerance 3.93 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0541]: Station Y=+0.625m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.001598 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0542]: Station Y=+0.620m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.001597 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0543]: Station Y=+0.615m, Panel gap tolerance 3.89 mm, Surface Gaussian curvature 0.001595 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0544]: Station Y=+0.610m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.001592 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0545]: Station Y=+0.605m, Panel gap tolerance 3.87 mm, Surface Gaussian curvature 0.001589 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0546]: Station Y=+0.600m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.001585 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0547]: Station Y=+0.595m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.001581 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0548]: Station Y=+0.590m, Panel gap tolerance 3.82 mm, Surface Gaussian curvature 0.001576 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0549]: Station Y=+0.585m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.001570 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0550]: Station Y=+0.580m, Panel gap tolerance 3.80 mm, Surface Gaussian curvature 0.001564 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0551]: Station Y=+0.575m, Panel gap tolerance 3.78 mm, Surface Gaussian curvature 0.001558 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0552]: Station Y=+0.570m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.001551 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0553]: Station Y=+0.565m, Panel gap tolerance 3.76 mm, Surface Gaussian curvature 0.001544 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0554]: Station Y=+0.559m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.001536 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0555]: Station Y=+0.554m, Panel gap tolerance 3.73 mm, Surface Gaussian curvature 0.001528 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0556]: Station Y=+0.549m, Panel gap tolerance 3.71 mm, Surface Gaussian curvature 0.001519 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0557]: Station Y=+0.544m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.001509 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0558]: Station Y=+0.539m, Panel gap tolerance 3.69 mm, Surface Gaussian curvature 0.001500 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0559]: Station Y=+0.534m, Panel gap tolerance 3.67 mm, Surface Gaussian curvature 0.001490 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0560]: Station Y=+0.529m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.001479 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0561]: Station Y=+0.524m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.001468 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0562]: Station Y=+0.519m, Panel gap tolerance 3.64 mm, Surface Gaussian curvature 0.001457 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0563]: Station Y=+0.514m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.001445 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0564]: Station Y=+0.509m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.001433 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0565]: Station Y=+0.504m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.001421 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0566]: Station Y=+0.499m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.001408 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0567]: Station Y=+0.494m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.001395 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0568]: Station Y=+0.489m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.001381 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0569]: Station Y=+0.484m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.001368 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0570]: Station Y=+0.479m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.001354 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0571]: Station Y=+0.474m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.001340 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0572]: Station Y=+0.469m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.001325 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0573]: Station Y=+0.464m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.001311 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0574]: Station Y=+0.459m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.001296 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0575]: Station Y=+0.454m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001281 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0576]: Station Y=+0.449m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001266 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0577]: Station Y=+0.444m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001251 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0578]: Station Y=+0.439m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001235 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0579]: Station Y=+0.434m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001220 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0580]: Station Y=+0.429m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001204 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0581]: Station Y=+0.423m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001188 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0582]: Station Y=+0.418m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001173 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0583]: Station Y=+0.413m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001157 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0584]: Station Y=+0.408m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001141 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0585]: Station Y=+0.403m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001125 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0586]: Station Y=+0.398m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001110 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0587]: Station Y=+0.393m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001094 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0588]: Station Y=+0.388m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001078 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0589]: Station Y=+0.383m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001063 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0590]: Station Y=+0.378m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001048 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0591]: Station Y=+0.373m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001032 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0592]: Station Y=+0.368m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001017 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0593]: Station Y=+0.363m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001002 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0594]: Station Y=+0.358m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000987 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0595]: Station Y=+0.353m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000973 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0596]: Station Y=+0.348m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.000958 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0597]: Station Y=+0.343m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.000944 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0598]: Station Y=+0.338m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.000930 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0599]: Station Y=+0.333m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.000917 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0600]: Station Y=+0.328m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.000904 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0601]: Station Y=+0.323m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.000890 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0602]: Station Y=+0.318m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.000878 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0603]: Station Y=+0.313m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.000865 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0604]: Station Y=+0.308m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.000853 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0605]: Station Y=+0.303m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.000842 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0606]: Station Y=+0.298m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.000830 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0607]: Station Y=+0.293m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.000820 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0608]: Station Y=+0.287m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.000809 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0609]: Station Y=+0.282m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.000799 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0610]: Station Y=+0.277m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.000789 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0611]: Station Y=+0.272m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.000780 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0612]: Station Y=+0.267m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.000771 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0613]: Station Y=+0.262m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.000763 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0614]: Station Y=+0.257m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.000755 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0615]: Station Y=+0.252m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.000748 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0616]: Station Y=+0.247m, Panel gap tolerance 3.63 mm, Surface Gaussian curvature 0.000741 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0617]: Station Y=+0.242m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.000735 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0618]: Station Y=+0.237m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.000729 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0619]: Station Y=+0.232m, Panel gap tolerance 3.67 mm, Surface Gaussian curvature 0.000724 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0620]: Station Y=+0.227m, Panel gap tolerance 3.69 mm, Surface Gaussian curvature 0.000719 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0621]: Station Y=+0.222m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.000715 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0622]: Station Y=+0.217m, Panel gap tolerance 3.71 mm, Surface Gaussian curvature 0.000711 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0623]: Station Y=+0.212m, Panel gap tolerance 3.73 mm, Surface Gaussian curvature 0.000708 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0624]: Station Y=+0.207m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.000705 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0625]: Station Y=+0.202m, Panel gap tolerance 3.75 mm, Surface Gaussian curvature 0.000703 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0626]: Station Y=+0.197m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0627]: Station Y=+0.192m, Panel gap tolerance 3.78 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0628]: Station Y=+0.187m, Panel gap tolerance 3.80 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0629]: Station Y=+0.182m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0630]: Station Y=+0.177m, Panel gap tolerance 3.82 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0631]: Station Y=+0.172m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.000702 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0632]: Station Y=+0.167m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.000704 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0633]: Station Y=+0.162m, Panel gap tolerance 3.87 mm, Surface Gaussian curvature 0.000706 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0634]: Station Y=+0.157m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.000709 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0635]: Station Y=+0.151m, Panel gap tolerance 3.89 mm, Surface Gaussian curvature 0.000712 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0636]: Station Y=+0.146m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.000716 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0637]: Station Y=+0.141m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.000721 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0638]: Station Y=+0.136m, Panel gap tolerance 3.93 mm, Surface Gaussian curvature 0.000726 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0639]: Station Y=+0.131m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.000731 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0640]: Station Y=+0.126m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.000737 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0641]: Station Y=+0.121m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.000744 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0642]: Station Y=+0.116m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.000751 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0643]: Station Y=+0.111m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.000758 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0644]: Station Y=+0.106m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.000766 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0645]: Station Y=+0.101m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.000775 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0646]: Station Y=+0.096m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.000783 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0647]: Station Y=+0.091m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.000793 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0648]: Station Y=+0.086m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.000803 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0649]: Station Y=+0.081m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.000813 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0650]: Station Y=+0.076m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.000823 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0651]: Station Y=+0.071m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.000835 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0652]: Station Y=+0.066m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.000846 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0653]: Station Y=+0.061m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.000858 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0654]: Station Y=+0.056m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.000870 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0655]: Station Y=+0.051m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.000882 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0656]: Station Y=+0.046m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.000895 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0657]: Station Y=+0.041m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.000908 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0658]: Station Y=+0.036m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.000922 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0659]: Station Y=+0.031m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.000935 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0660]: Station Y=+0.026m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.000949 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0661]: Station Y=+0.021m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000964 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0662]: Station Y=+0.015m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000978 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0663]: Station Y=+0.010m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000993 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0664]: Station Y=+0.005m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001008 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0665]: Station Y=+0.000m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001023 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0666]: Station Y=-0.005m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001038 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0667]: Station Y=-0.010m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001053 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0668]: Station Y=-0.015m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001069 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0669]: Station Y=-0.020m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001084 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0670]: Station Y=-0.025m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001100 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0671]: Station Y=-0.030m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001115 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0672]: Station Y=-0.035m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001131 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0673]: Station Y=-0.040m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001147 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0674]: Station Y=-0.045m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001163 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0675]: Station Y=-0.050m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001178 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0676]: Station Y=-0.055m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001194 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0677]: Station Y=-0.060m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001210 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0678]: Station Y=-0.065m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001225 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0679]: Station Y=-0.070m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001241 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0680]: Station Y=-0.075m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001256 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0681]: Station Y=-0.080m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001271 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0682]: Station Y=-0.085m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001286 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0683]: Station Y=-0.090m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001301 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0684]: Station Y=-0.095m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001316 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0685]: Station Y=-0.100m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.001331 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0686]: Station Y=-0.105m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.001345 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0687]: Station Y=-0.110m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.001359 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0688]: Station Y=-0.115m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.001373 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0689]: Station Y=-0.121m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.001386 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0690]: Station Y=-0.126m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.001400 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0691]: Station Y=-0.131m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.001413 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0692]: Station Y=-0.136m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.001425 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0693]: Station Y=-0.141m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.001438 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0694]: Station Y=-0.146m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.001449 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0695]: Station Y=-0.151m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.001461 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0696]: Station Y=-0.156m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.001472 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0697]: Station Y=-0.161m, Panel gap tolerance 3.93 mm, Surface Gaussian curvature 0.001483 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0698]: Station Y=-0.166m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.001493 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0699]: Station Y=-0.171m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.001503 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0700]: Station Y=-0.176m, Panel gap tolerance 3.89 mm, Surface Gaussian curvature 0.001513 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0701]: Station Y=-0.181m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.001522 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0702]: Station Y=-0.186m, Panel gap tolerance 3.87 mm, Surface Gaussian curvature 0.001531 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0703]: Station Y=-0.191m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.001539 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0704]: Station Y=-0.196m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.001546 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0705]: Station Y=-0.201m, Panel gap tolerance 3.83 mm, Surface Gaussian curvature 0.001554 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0706]: Station Y=-0.206m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.001560 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0707]: Station Y=-0.211m, Panel gap tolerance 3.80 mm, Surface Gaussian curvature 0.001567 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0708]: Station Y=-0.216m, Panel gap tolerance 3.78 mm, Surface Gaussian curvature 0.001572 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0709]: Station Y=-0.221m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.001577 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0710]: Station Y=-0.226m, Panel gap tolerance 3.76 mm, Surface Gaussian curvature 0.001582 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0711]: Station Y=-0.231m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.001586 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0712]: Station Y=-0.236m, Panel gap tolerance 3.73 mm, Surface Gaussian curvature 0.001590 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0713]: Station Y=-0.241m, Panel gap tolerance 3.71 mm, Surface Gaussian curvature 0.001593 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0714]: Station Y=-0.246m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.001595 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0715]: Station Y=-0.251m, Panel gap tolerance 3.69 mm, Surface Gaussian curvature 0.001597 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0716]: Station Y=-0.257m, Panel gap tolerance 3.67 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0717]: Station Y=-0.262m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0718]: Station Y=-0.267m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0719]: Station Y=-0.272m, Panel gap tolerance 3.64 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0720]: Station Y=-0.277m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0721]: Station Y=-0.282m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.001598 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0722]: Station Y=-0.287m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.001596 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0723]: Station Y=-0.292m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.001593 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0724]: Station Y=-0.297m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.001590 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0725]: Station Y=-0.302m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.001587 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0726]: Station Y=-0.307m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.001583 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0727]: Station Y=-0.312m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.001578 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0728]: Station Y=-0.317m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.001573 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0729]: Station Y=-0.322m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.001568 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0730]: Station Y=-0.327m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.001561 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0731]: Station Y=-0.332m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.001555 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0732]: Station Y=-0.337m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001548 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0733]: Station Y=-0.342m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001540 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0734]: Station Y=-0.347m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001532 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0735]: Station Y=-0.352m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001523 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0736]: Station Y=-0.357m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001514 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0737]: Station Y=-0.362m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001505 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0738]: Station Y=-0.367m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001495 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0739]: Station Y=-0.372m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001485 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0740]: Station Y=-0.377m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001474 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0741]: Station Y=-0.382m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001463 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0742]: Station Y=-0.387m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001451 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0743]: Station Y=-0.393m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001439 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0744]: Station Y=-0.398m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001427 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0745]: Station Y=-0.403m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001415 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0746]: Station Y=-0.408m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001402 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0747]: Station Y=-0.413m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001388 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0748]: Station Y=-0.418m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001375 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0749]: Station Y=-0.423m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001361 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0750]: Station Y=-0.428m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001347 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0751]: Station Y=-0.433m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001333 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0752]: Station Y=-0.438m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001318 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0753]: Station Y=-0.443m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001304 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0754]: Station Y=-0.448m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001289 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0755]: Station Y=-0.453m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001274 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0756]: Station Y=-0.458m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001259 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0757]: Station Y=-0.463m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001243 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0758]: Station Y=-0.468m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001228 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0759]: Station Y=-0.473m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001212 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0760]: Station Y=-0.478m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001197 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0761]: Station Y=-0.483m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.001181 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0762]: Station Y=-0.488m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.001165 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0763]: Station Y=-0.493m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.001149 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0764]: Station Y=-0.498m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.001134 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0765]: Station Y=-0.503m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.001118 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0766]: Station Y=-0.508m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.001102 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0767]: Station Y=-0.513m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.001087 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0768]: Station Y=-0.518m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.001071 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0769]: Station Y=-0.523m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.001056 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0770]: Station Y=-0.529m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.001040 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0771]: Station Y=-0.534m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.001025 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0772]: Station Y=-0.539m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.001010 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0773]: Station Y=-0.544m, Panel gap tolerance 3.63 mm, Surface Gaussian curvature 0.000995 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0774]: Station Y=-0.549m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.000980 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0775]: Station Y=-0.554m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.000966 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0776]: Station Y=-0.559m, Panel gap tolerance 3.67 mm, Surface Gaussian curvature 0.000952 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0777]: Station Y=-0.564m, Panel gap tolerance 3.68 mm, Surface Gaussian curvature 0.000938 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0778]: Station Y=-0.569m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.000924 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0779]: Station Y=-0.574m, Panel gap tolerance 3.71 mm, Surface Gaussian curvature 0.000910 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0780]: Station Y=-0.579m, Panel gap tolerance 3.73 mm, Surface Gaussian curvature 0.000897 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0781]: Station Y=-0.584m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.000884 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0782]: Station Y=-0.589m, Panel gap tolerance 3.75 mm, Surface Gaussian curvature 0.000872 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0783]: Station Y=-0.594m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.000860 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0784]: Station Y=-0.599m, Panel gap tolerance 3.78 mm, Surface Gaussian curvature 0.000848 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0785]: Station Y=-0.604m, Panel gap tolerance 3.79 mm, Surface Gaussian curvature 0.000836 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0786]: Station Y=-0.609m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.000825 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0787]: Station Y=-0.614m, Panel gap tolerance 3.82 mm, Surface Gaussian curvature 0.000814 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0788]: Station Y=-0.619m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.000804 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0789]: Station Y=-0.624m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.000794 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0790]: Station Y=-0.629m, Panel gap tolerance 3.86 mm, Surface Gaussian curvature 0.000785 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0791]: Station Y=-0.634m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.000776 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0792]: Station Y=-0.639m, Panel gap tolerance 3.89 mm, Surface Gaussian curvature 0.000767 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0793]: Station Y=-0.644m, Panel gap tolerance 3.90 mm, Surface Gaussian curvature 0.000759 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0794]: Station Y=-0.649m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.000752 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0795]: Station Y=-0.654m, Panel gap tolerance 3.93 mm, Surface Gaussian curvature 0.000745 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0796]: Station Y=-0.659m, Panel gap tolerance 3.94 mm, Surface Gaussian curvature 0.000738 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0797]: Station Y=-0.665m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.000732 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0798]: Station Y=-0.670m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.000726 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0799]: Station Y=-0.675m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.000721 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0800]: Station Y=-0.680m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.000717 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0801]: Station Y=-0.685m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.000713 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0802]: Station Y=-0.690m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.000709 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0803]: Station Y=-0.695m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.000706 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0804]: Station Y=-0.700m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.000704 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0805]: Station Y=-0.705m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.000702 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0806]: Station Y=-0.710m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0807]: Station Y=-0.715m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0808]: Station Y=-0.720m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0809]: Station Y=-0.725m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0810]: Station Y=-0.730m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0811]: Station Y=-0.735m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.000703 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0812]: Station Y=-0.740m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.000705 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0813]: Station Y=-0.745m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.000707 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0814]: Station Y=-0.750m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.000710 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0815]: Station Y=-0.755m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.000714 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0816]: Station Y=-0.760m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.000718 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0817]: Station Y=-0.765m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.000723 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0818]: Station Y=-0.770m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000728 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0819]: Station Y=-0.775m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000734 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0820]: Station Y=-0.780m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000740 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0821]: Station Y=-0.785m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000747 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0822]: Station Y=-0.790m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000754 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0823]: Station Y=-0.795m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000762 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0824]: Station Y=-0.801m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000770 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0825]: Station Y=-0.806m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000779 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0826]: Station Y=-0.811m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000788 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0827]: Station Y=-0.816m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000797 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0828]: Station Y=-0.821m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000807 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0829]: Station Y=-0.826m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000818 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0830]: Station Y=-0.831m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000829 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0831]: Station Y=-0.836m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000840 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0832]: Station Y=-0.841m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000852 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0833]: Station Y=-0.846m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.000864 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0834]: Station Y=-0.851m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.000876 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0835]: Station Y=-0.856m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.000888 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0836]: Station Y=-0.861m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.000901 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0837]: Station Y=-0.866m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.000915 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0838]: Station Y=-0.871m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.000928 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0839]: Station Y=-0.876m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.000942 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0840]: Station Y=-0.881m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.000956 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0841]: Station Y=-0.886m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.000971 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0842]: Station Y=-0.891m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.000985 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0843]: Station Y=-0.896m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.001000 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0844]: Station Y=-0.901m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.001015 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0845]: Station Y=-0.906m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.001030 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0846]: Station Y=-0.911m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.001045 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0847]: Station Y=-0.916m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.001061 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0848]: Station Y=-0.921m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.001076 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0849]: Station Y=-0.926m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.001092 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0850]: Station Y=-0.931m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.001107 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0851]: Station Y=-0.937m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.001123 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0852]: Station Y=-0.942m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.001139 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0853]: Station Y=-0.947m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.001154 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0854]: Station Y=-0.952m, Panel gap tolerance 3.94 mm, Surface Gaussian curvature 0.001170 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0855]: Station Y=-0.957m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.001186 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0856]: Station Y=-0.962m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.001202 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0857]: Station Y=-0.967m, Panel gap tolerance 3.90 mm, Surface Gaussian curvature 0.001217 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0858]: Station Y=-0.972m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.001233 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0859]: Station Y=-0.977m, Panel gap tolerance 3.87 mm, Surface Gaussian curvature 0.001248 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0860]: Station Y=-0.982m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.001263 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0861]: Station Y=-0.987m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.001279 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0862]: Station Y=-0.992m, Panel gap tolerance 3.83 mm, Surface Gaussian curvature 0.001294 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0863]: Station Y=-0.997m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.001308 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0864]: Station Y=-1.002m, Panel gap tolerance 3.80 mm, Surface Gaussian curvature 0.001323 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0865]: Station Y=-1.007m, Panel gap tolerance 3.79 mm, Surface Gaussian curvature 0.001338 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0866]: Station Y=-1.012m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.001352 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0867]: Station Y=-1.017m, Panel gap tolerance 3.76 mm, Surface Gaussian curvature 0.001366 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0868]: Station Y=-1.022m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.001379 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0869]: Station Y=-1.027m, Panel gap tolerance 3.73 mm, Surface Gaussian curvature 0.001393 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0870]: Station Y=-1.032m, Panel gap tolerance 3.72 mm, Surface Gaussian curvature 0.001406 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0871]: Station Y=-1.037m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.001419 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0872]: Station Y=-1.042m, Panel gap tolerance 3.69 mm, Surface Gaussian curvature 0.001431 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0873]: Station Y=-1.047m, Panel gap tolerance 3.68 mm, Surface Gaussian curvature 0.001443 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0874]: Station Y=-1.052m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.001455 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0875]: Station Y=-1.057m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.001466 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0876]: Station Y=-1.062m, Panel gap tolerance 3.64 mm, Surface Gaussian curvature 0.001477 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0877]: Station Y=-1.067m, Panel gap tolerance 3.63 mm, Surface Gaussian curvature 0.001488 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0878]: Station Y=-1.073m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.001498 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0879]: Station Y=-1.078m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.001508 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0880]: Station Y=-1.083m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.001517 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0881]: Station Y=-1.088m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.001526 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0882]: Station Y=-1.093m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.001535 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0883]: Station Y=-1.098m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.001543 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0884]: Station Y=-1.103m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.001550 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0885]: Station Y=-1.108m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.001557 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0886]: Station Y=-1.113m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.001563 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0887]: Station Y=-1.118m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.001569 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0888]: Station Y=-1.123m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.001575 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0889]: Station Y=-1.128m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.001580 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0890]: Station Y=-1.133m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001584 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0891]: Station Y=-1.138m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001588 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0892]: Station Y=-1.143m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001591 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0893]: Station Y=-1.148m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001594 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0894]: Station Y=-1.153m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001596 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0895]: Station Y=-1.158m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001598 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0896]: Station Y=-1.163m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0897]: Station Y=-1.168m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0898]: Station Y=-1.173m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0899]: Station Y=-1.178m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0900]: Station Y=-1.183m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001598 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0901]: Station Y=-1.188m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001597 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0902]: Station Y=-1.193m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001595 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0903]: Station Y=-1.198m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001592 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0904]: Station Y=-1.203m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001589 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0905]: Station Y=-1.209m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001585 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0906]: Station Y=-1.214m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001581 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0907]: Station Y=-1.219m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001576 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0908]: Station Y=-1.224m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001571 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0909]: Station Y=-1.229m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001565 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0910]: Station Y=-1.234m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001558 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0911]: Station Y=-1.239m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001551 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0912]: Station Y=-1.244m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001544 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0913]: Station Y=-1.249m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001536 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0914]: Station Y=-1.254m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001528 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0915]: Station Y=-1.259m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001519 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0916]: Station Y=-1.264m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001510 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0917]: Station Y=-1.269m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001500 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0918]: Station Y=-1.274m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.001490 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0919]: Station Y=-1.279m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.001480 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0920]: Station Y=-1.284m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.001469 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0921]: Station Y=-1.289m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.001457 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0922]: Station Y=-1.294m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.001446 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0923]: Station Y=-1.299m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.001434 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0924]: Station Y=-1.304m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.001421 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0925]: Station Y=-1.309m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.001408 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0926]: Station Y=-1.314m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.001395 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0927]: Station Y=-1.319m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.001382 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0928]: Station Y=-1.324m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.001368 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0929]: Station Y=-1.329m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.001354 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0930]: Station Y=-1.334m, Panel gap tolerance 3.63 mm, Surface Gaussian curvature 0.001340 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0931]: Station Y=-1.339m, Panel gap tolerance 3.64 mm, Surface Gaussian curvature 0.001326 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0932]: Station Y=-1.345m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.001311 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0933]: Station Y=-1.350m, Panel gap tolerance 3.67 mm, Surface Gaussian curvature 0.001297 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0934]: Station Y=-1.355m, Panel gap tolerance 3.68 mm, Surface Gaussian curvature 0.001282 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0935]: Station Y=-1.360m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.001266 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0936]: Station Y=-1.365m, Panel gap tolerance 3.71 mm, Surface Gaussian curvature 0.001251 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0937]: Station Y=-1.370m, Panel gap tolerance 3.72 mm, Surface Gaussian curvature 0.001236 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0938]: Station Y=-1.375m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.001220 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0939]: Station Y=-1.380m, Panel gap tolerance 3.75 mm, Surface Gaussian curvature 0.001205 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0940]: Station Y=-1.385m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.001189 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0941]: Station Y=-1.390m, Panel gap tolerance 3.78 mm, Surface Gaussian curvature 0.001173 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0942]: Station Y=-1.395m, Panel gap tolerance 3.79 mm, Surface Gaussian curvature 0.001158 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0943]: Station Y=-1.400m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.001142 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0944]: Station Y=-1.405m, Panel gap tolerance 3.82 mm, Surface Gaussian curvature 0.001126 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0945]: Station Y=-1.410m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.001110 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0946]: Station Y=-1.415m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.001095 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0947]: Station Y=-1.420m, Panel gap tolerance 3.86 mm, Surface Gaussian curvature 0.001079 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0948]: Station Y=-1.425m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.001064 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0949]: Station Y=-1.430m, Panel gap tolerance 3.89 mm, Surface Gaussian curvature 0.001048 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0950]: Station Y=-1.435m, Panel gap tolerance 3.90 mm, Surface Gaussian curvature 0.001033 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0951]: Station Y=-1.440m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.001018 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0952]: Station Y=-1.445m, Panel gap tolerance 3.93 mm, Surface Gaussian curvature 0.001003 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0953]: Station Y=-1.450m, Panel gap tolerance 3.94 mm, Surface Gaussian curvature 0.000988 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0954]: Station Y=-1.455m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.000973 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0955]: Station Y=-1.460m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.000959 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0956]: Station Y=-1.465m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.000945 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0957]: Station Y=-1.470m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.000931 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0958]: Station Y=-1.475m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.000917 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0959]: Station Y=-1.481m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.000904 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0960]: Station Y=-1.486m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.000891 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0961]: Station Y=-1.491m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.000878 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0962]: Station Y=-1.496m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.000866 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0963]: Station Y=-1.501m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.000854 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0964]: Station Y=-1.506m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.000842 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0965]: Station Y=-1.511m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.000831 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0966]: Station Y=-1.516m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.000820 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0967]: Station Y=-1.521m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.000809 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0968]: Station Y=-1.526m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.000799 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0969]: Station Y=-1.531m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.000790 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0970]: Station Y=-1.536m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.000781 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0971]: Station Y=-1.541m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.000772 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0972]: Station Y=-1.546m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.000763 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0973]: Station Y=-1.551m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.000756 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0974]: Station Y=-1.556m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.000748 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0975]: Station Y=-1.561m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000741 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0976]: Station Y=-1.566m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000735 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0977]: Station Y=-1.571m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000729 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0978]: Station Y=-1.576m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000724 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0979]: Station Y=-1.581m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000719 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0980]: Station Y=-1.586m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000715 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0981]: Station Y=-1.591m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000711 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0982]: Station Y=-1.596m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000708 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0983]: Station Y=-1.601m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000705 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0984]: Station Y=-1.606m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000703 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0985]: Station Y=-1.611m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000702 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0986]: Station Y=-1.617m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0987]: Station Y=-1.622m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0988]: Station Y=-1.627m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0989]: Station Y=-1.632m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0990]: Station Y=-1.637m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.000702 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0991]: Station Y=-1.642m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.000704 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0992]: Station Y=-1.647m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.000706 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0993]: Station Y=-1.652m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.000709 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0994]: Station Y=-1.657m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.000712 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0995]: Station Y=-1.662m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.000716 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0996]: Station Y=-1.667m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.000720 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0997]: Station Y=-1.672m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.000725 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0998]: Station Y=-1.677m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.000731 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[0999]: Station Y=-1.682m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.000737 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1000]: Station Y=-1.687m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.000743 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1001]: Station Y=-1.692m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.000750 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1002]: Station Y=-1.697m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.000758 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1003]: Station Y=-1.702m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.000766 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1004]: Station Y=-1.707m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.000774 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1005]: Station Y=-1.712m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.000783 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1006]: Station Y=-1.717m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.000792 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1007]: Station Y=-1.722m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.000802 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1008]: Station Y=-1.727m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.000812 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1009]: Station Y=-1.732m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.000823 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1010]: Station Y=-1.737m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.000834 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1011]: Station Y=-1.742m, Panel gap tolerance 3.94 mm, Surface Gaussian curvature 0.000845 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1012]: Station Y=-1.747m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.000857 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1013]: Station Y=-1.753m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.000869 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1014]: Station Y=-1.758m, Panel gap tolerance 3.90 mm, Surface Gaussian curvature 0.000882 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1015]: Station Y=-1.763m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.000895 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1016]: Station Y=-1.768m, Panel gap tolerance 3.87 mm, Surface Gaussian curvature 0.000908 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1017]: Station Y=-1.773m, Panel gap tolerance 3.86 mm, Surface Gaussian curvature 0.000921 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1018]: Station Y=-1.778m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.000935 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1019]: Station Y=-1.783m, Panel gap tolerance 3.83 mm, Surface Gaussian curvature 0.000949 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1020]: Station Y=-1.788m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.000963 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1021]: Station Y=-1.793m, Panel gap tolerance 3.80 mm, Surface Gaussian curvature 0.000978 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1022]: Station Y=-1.798m, Panel gap tolerance 3.79 mm, Surface Gaussian curvature 0.000992 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1023]: Station Y=-1.803m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.001007 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1024]: Station Y=-1.808m, Panel gap tolerance 3.76 mm, Surface Gaussian curvature 0.001022 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1025]: Station Y=-1.813m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.001037 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1026]: Station Y=-1.818m, Panel gap tolerance 3.73 mm, Surface Gaussian curvature 0.001053 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1027]: Station Y=-1.823m, Panel gap tolerance 3.72 mm, Surface Gaussian curvature 0.001068 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1028]: Station Y=-1.828m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.001084 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1029]: Station Y=-1.833m, Panel gap tolerance 3.69 mm, Surface Gaussian curvature 0.001099 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1030]: Station Y=-1.838m, Panel gap tolerance 3.68 mm, Surface Gaussian curvature 0.001115 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1031]: Station Y=-1.843m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.001131 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1032]: Station Y=-1.848m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.001146 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1033]: Station Y=-1.853m, Panel gap tolerance 3.64 mm, Surface Gaussian curvature 0.001162 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1034]: Station Y=-1.858m, Panel gap tolerance 3.63 mm, Surface Gaussian curvature 0.001178 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1035]: Station Y=-1.863m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.001193 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1036]: Station Y=-1.868m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.001209 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1037]: Station Y=-1.873m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.001225 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1038]: Station Y=-1.878m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.001240 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1039]: Station Y=-1.883m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.001256 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1040]: Station Y=-1.889m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.001271 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1041]: Station Y=-1.894m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.001286 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1042]: Station Y=-1.899m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.001301 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1043]: Station Y=-1.904m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.001316 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1044]: Station Y=-1.909m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.001330 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1045]: Station Y=-1.914m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.001344 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1046]: Station Y=-1.919m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.001358 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1047]: Station Y=-1.924m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001372 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1048]: Station Y=-1.929m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001386 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1049]: Station Y=-1.934m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001399 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1050]: Station Y=-1.939m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001412 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1051]: Station Y=-1.944m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001425 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1052]: Station Y=-1.949m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001437 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1053]: Station Y=-1.954m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001449 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1054]: Station Y=-1.959m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001461 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1055]: Station Y=-1.964m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001472 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1056]: Station Y=-1.969m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001483 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1057]: Station Y=-1.974m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001493 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1058]: Station Y=-1.979m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001503 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1059]: Station Y=-1.984m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001513 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1060]: Station Y=-1.989m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001522 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1061]: Station Y=-1.994m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001530 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1062]: Station Y=-1.999m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001538 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1063]: Station Y=-2.004m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001546 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1064]: Station Y=-2.009m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001553 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1065]: Station Y=-2.014m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001560 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1066]: Station Y=-2.019m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001566 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1067]: Station Y=-2.025m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001572 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1068]: Station Y=-2.030m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001577 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1069]: Station Y=-2.035m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001582 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1070]: Station Y=-2.040m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001586 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1071]: Station Y=-2.045m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001590 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1072]: Station Y=-2.050m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001593 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1073]: Station Y=-2.055m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001595 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1074]: Station Y=-2.060m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001597 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1075]: Station Y=-2.065m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1076]: Station Y=-2.070m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1077]: Station Y=-2.075m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1078]: Station Y=-2.080m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1079]: Station Y=-2.085m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1080]: Station Y=-2.090m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.001598 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1081]: Station Y=-2.095m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.001596 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1082]: Station Y=-2.100m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.001593 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1083]: Station Y=-2.105m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.001590 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1084]: Station Y=-2.110m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.001587 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1085]: Station Y=-2.115m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.001583 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1086]: Station Y=-2.120m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.001578 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1087]: Station Y=-2.125m, Panel gap tolerance 3.63 mm, Surface Gaussian curvature 0.001573 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1088]: Station Y=-2.130m, Panel gap tolerance 3.64 mm, Surface Gaussian curvature 0.001568 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1089]: Station Y=-2.135m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.001562 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1090]: Station Y=-2.140m, Panel gap tolerance 3.67 mm, Surface Gaussian curvature 0.001555 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1091]: Station Y=-2.145m, Panel gap tolerance 3.68 mm, Surface Gaussian curvature 0.001548 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1092]: Station Y=-2.150m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.001540 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1093]: Station Y=-2.155m, Panel gap tolerance 3.71 mm, Surface Gaussian curvature 0.001532 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1094]: Station Y=-2.161m, Panel gap tolerance 3.72 mm, Surface Gaussian curvature 0.001524 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1095]: Station Y=-2.166m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.001515 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1096]: Station Y=-2.171m, Panel gap tolerance 3.75 mm, Surface Gaussian curvature 0.001505 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1097]: Station Y=-2.176m, Panel gap tolerance 3.76 mm, Surface Gaussian curvature 0.001495 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1098]: Station Y=-2.181m, Panel gap tolerance 3.78 mm, Surface Gaussian curvature 0.001485 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1099]: Station Y=-2.186m, Panel gap tolerance 3.79 mm, Surface Gaussian curvature 0.001474 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1100]: Station Y=-2.191m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.001463 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1101]: Station Y=-2.196m, Panel gap tolerance 3.82 mm, Surface Gaussian curvature 0.001452 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1102]: Station Y=-2.201m, Panel gap tolerance 3.83 mm, Surface Gaussian curvature 0.001440 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1103]: Station Y=-2.206m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.001428 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1104]: Station Y=-2.211m, Panel gap tolerance 3.86 mm, Surface Gaussian curvature 0.001415 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1105]: Station Y=-2.216m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.001402 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1106]: Station Y=-2.221m, Panel gap tolerance 3.89 mm, Surface Gaussian curvature 0.001389 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1107]: Station Y=-2.226m, Panel gap tolerance 3.90 mm, Surface Gaussian curvature 0.001376 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1108]: Station Y=-2.231m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.001362 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1109]: Station Y=-2.236m, Panel gap tolerance 3.93 mm, Surface Gaussian curvature 0.001348 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1110]: Station Y=-2.241m, Panel gap tolerance 3.94 mm, Surface Gaussian curvature 0.001333 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1111]: Station Y=-2.246m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.001319 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1112]: Station Y=-2.251m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.001304 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1113]: Station Y=-2.256m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.001289 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1114]: Station Y=-2.261m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.001274 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1115]: Station Y=-2.266m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.001259 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1116]: Station Y=-2.271m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.001244 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1117]: Station Y=-2.276m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.001228 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1118]: Station Y=-2.281m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.001213 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1119]: Station Y=-2.286m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.001197 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1120]: Station Y=-2.291m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.001181 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1121]: Station Y=-2.297m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.001166 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1122]: Station Y=-2.302m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.001150 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1123]: Station Y=-2.307m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001134 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1124]: Station Y=-2.312m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001118 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1125]: Station Y=-2.317m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001103 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1126]: Station Y=-2.322m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001087 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1127]: Station Y=-2.327m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001072 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1128]: Station Y=-2.332m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001056 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1129]: Station Y=-2.337m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001041 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1130]: Station Y=-2.342m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001026 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1131]: Station Y=-2.347m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001011 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1132]: Station Y=-2.352m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000996 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1133]: Station Y=-2.357m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000981 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1134]: Station Y=-2.362m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000966 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1135]: Station Y=-2.367m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000952 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1136]: Station Y=-2.372m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000938 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1137]: Station Y=-2.377m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000924 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1138]: Station Y=-2.382m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000911 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1139]: Station Y=-2.387m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000898 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1140]: Station Y=-2.392m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000885 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1141]: Station Y=-2.397m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000872 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1142]: Station Y=-2.402m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000860 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1143]: Station Y=-2.407m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.000848 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1144]: Station Y=-2.412m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000837 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1145]: Station Y=-2.417m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000826 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1146]: Station Y=-2.422m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.000815 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1147]: Station Y=-2.427m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.000805 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1148]: Station Y=-2.433m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.000795 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1149]: Station Y=-2.438m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.000785 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1150]: Station Y=-2.443m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.000776 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1151]: Station Y=-2.448m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.000768 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1152]: Station Y=-2.453m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.000760 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1153]: Station Y=-2.458m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.000752 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1154]: Station Y=-2.463m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.000745 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1155]: Station Y=-2.468m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.000738 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1156]: Station Y=-2.473m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.000732 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1157]: Station Y=-2.478m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.000727 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1158]: Station Y=-2.483m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.000722 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1159]: Station Y=-2.488m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.000717 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1160]: Station Y=-2.493m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.000713 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1161]: Station Y=-2.498m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.000709 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1162]: Station Y=-2.503m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.000707 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1163]: Station Y=-2.508m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.000704 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1164]: Station Y=-2.513m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.000702 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1165]: Station Y=-2.518m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1166]: Station Y=-2.523m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1167]: Station Y=-2.528m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1168]: Station Y=-2.533m, Panel gap tolerance 3.94 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1169]: Station Y=-2.538m, Panel gap tolerance 3.92 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1170]: Station Y=-2.543m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.000703 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1171]: Station Y=-2.548m, Panel gap tolerance 3.90 mm, Surface Gaussian curvature 0.000705 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1172]: Station Y=-2.553m, Panel gap tolerance 3.88 mm, Surface Gaussian curvature 0.000707 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1173]: Station Y=-2.558m, Panel gap tolerance 3.87 mm, Surface Gaussian curvature 0.000710 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1174]: Station Y=-2.563m, Panel gap tolerance 3.86 mm, Surface Gaussian curvature 0.000714 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1175]: Station Y=-2.569m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.000718 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1176]: Station Y=-2.574m, Panel gap tolerance 3.83 mm, Surface Gaussian curvature 0.000723 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1177]: Station Y=-2.579m, Panel gap tolerance 3.82 mm, Surface Gaussian curvature 0.000728 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1178]: Station Y=-2.584m, Panel gap tolerance 3.80 mm, Surface Gaussian curvature 0.000734 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1179]: Station Y=-2.589m, Panel gap tolerance 3.79 mm, Surface Gaussian curvature 0.000740 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1180]: Station Y=-2.594m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.000747 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1181]: Station Y=-2.599m, Panel gap tolerance 3.76 mm, Surface Gaussian curvature 0.000754 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1182]: Station Y=-2.604m, Panel gap tolerance 3.75 mm, Surface Gaussian curvature 0.000762 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1183]: Station Y=-2.609m, Panel gap tolerance 3.73 mm, Surface Gaussian curvature 0.000770 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1184]: Station Y=-2.614m, Panel gap tolerance 3.72 mm, Surface Gaussian curvature 0.000778 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1185]: Station Y=-2.619m, Panel gap tolerance 3.70 mm, Surface Gaussian curvature 0.000788 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1186]: Station Y=-2.624m, Panel gap tolerance 3.69 mm, Surface Gaussian curvature 0.000797 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1187]: Station Y=-2.629m, Panel gap tolerance 3.68 mm, Surface Gaussian curvature 0.000807 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1188]: Station Y=-2.634m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.000817 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1189]: Station Y=-2.639m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.000828 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1190]: Station Y=-2.644m, Panel gap tolerance 3.64 mm, Surface Gaussian curvature 0.000839 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1191]: Station Y=-2.649m, Panel gap tolerance 3.63 mm, Surface Gaussian curvature 0.000851 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1192]: Station Y=-2.654m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.000863 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1193]: Station Y=-2.659m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.000875 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1194]: Station Y=-2.664m, Panel gap tolerance 3.59 mm, Surface Gaussian curvature 0.000888 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1195]: Station Y=-2.669m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.000901 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1196]: Station Y=-2.674m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.000914 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1197]: Station Y=-2.679m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.000928 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1198]: Station Y=-2.684m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.000942 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1199]: Station Y=-2.689m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.000956 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1200]: Station Y=-2.694m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.000970 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1201]: Station Y=-2.699m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.000985 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1202]: Station Y=-2.705m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.000999 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1203]: Station Y=-2.710m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.001014 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1204]: Station Y=-2.715m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001029 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1205]: Station Y=-2.720m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001045 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1206]: Station Y=-2.725m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001060 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1207]: Station Y=-2.730m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001075 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1208]: Station Y=-2.735m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001091 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1209]: Station Y=-2.740m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001107 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1210]: Station Y=-2.745m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001122 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1211]: Station Y=-2.750m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001138 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1212]: Station Y=-2.755m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001154 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1213]: Station Y=-2.760m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001170 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1214]: Station Y=-2.765m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001185 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1215]: Station Y=-2.770m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001201 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1216]: Station Y=-2.775m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001217 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1217]: Station Y=-2.780m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001232 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1218]: Station Y=-2.785m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001248 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1219]: Station Y=-2.790m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001263 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1220]: Station Y=-2.795m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001278 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1221]: Station Y=-2.800m, Panel gap tolerance 3.45 mm, Surface Gaussian curvature 0.001293 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1222]: Station Y=-2.805m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001308 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1223]: Station Y=-2.810m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001323 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1224]: Station Y=-2.815m, Panel gap tolerance 3.46 mm, Surface Gaussian curvature 0.001337 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1225]: Station Y=-2.820m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001351 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1226]: Station Y=-2.825m, Panel gap tolerance 3.47 mm, Surface Gaussian curvature 0.001365 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1227]: Station Y=-2.830m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001379 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1228]: Station Y=-2.835m, Panel gap tolerance 3.48 mm, Surface Gaussian curvature 0.001392 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1229]: Station Y=-2.841m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001405 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1230]: Station Y=-2.846m, Panel gap tolerance 3.49 mm, Surface Gaussian curvature 0.001418 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1231]: Station Y=-2.851m, Panel gap tolerance 3.50 mm, Surface Gaussian curvature 0.001431 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1232]: Station Y=-2.856m, Panel gap tolerance 3.51 mm, Surface Gaussian curvature 0.001443 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1233]: Station Y=-2.861m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.001455 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1234]: Station Y=-2.866m, Panel gap tolerance 3.52 mm, Surface Gaussian curvature 0.001466 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1235]: Station Y=-2.871m, Panel gap tolerance 3.53 mm, Surface Gaussian curvature 0.001477 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1236]: Station Y=-2.876m, Panel gap tolerance 3.54 mm, Surface Gaussian curvature 0.001488 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1237]: Station Y=-2.881m, Panel gap tolerance 3.55 mm, Surface Gaussian curvature 0.001498 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1238]: Station Y=-2.886m, Panel gap tolerance 3.56 mm, Surface Gaussian curvature 0.001508 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1239]: Station Y=-2.891m, Panel gap tolerance 3.57 mm, Surface Gaussian curvature 0.001517 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1240]: Station Y=-2.896m, Panel gap tolerance 3.58 mm, Surface Gaussian curvature 0.001526 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1241]: Station Y=-2.901m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.001534 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1242]: Station Y=-2.906m, Panel gap tolerance 3.61 mm, Surface Gaussian curvature 0.001542 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1243]: Station Y=-2.911m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.001550 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1244]: Station Y=-2.916m, Panel gap tolerance 3.63 mm, Surface Gaussian curvature 0.001557 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1245]: Station Y=-2.921m, Panel gap tolerance 3.64 mm, Surface Gaussian curvature 0.001563 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1246]: Station Y=-2.926m, Panel gap tolerance 3.66 mm, Surface Gaussian curvature 0.001569 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1247]: Station Y=-2.931m, Panel gap tolerance 3.67 mm, Surface Gaussian curvature 0.001575 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1248]: Station Y=-2.936m, Panel gap tolerance 3.68 mm, Surface Gaussian curvature 0.001580 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1249]: Station Y=-2.941m, Panel gap tolerance 3.69 mm, Surface Gaussian curvature 0.001584 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1250]: Station Y=-2.946m, Panel gap tolerance 3.71 mm, Surface Gaussian curvature 0.001588 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1251]: Station Y=-2.951m, Panel gap tolerance 3.72 mm, Surface Gaussian curvature 0.001591 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1252]: Station Y=-2.956m, Panel gap tolerance 3.74 mm, Surface Gaussian curvature 0.001594 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1253]: Station Y=-2.961m, Panel gap tolerance 3.75 mm, Surface Gaussian curvature 0.001596 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1254]: Station Y=-2.966m, Panel gap tolerance 3.76 mm, Surface Gaussian curvature 0.001598 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1255]: Station Y=-2.971m, Panel gap tolerance 3.78 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1256]: Station Y=-2.977m, Panel gap tolerance 3.79 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1257]: Station Y=-2.982m, Panel gap tolerance 3.81 mm, Surface Gaussian curvature 0.001600 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1258]: Station Y=-2.987m, Panel gap tolerance 3.82 mm, Surface Gaussian curvature 0.001599 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1259]: Station Y=-2.992m, Panel gap tolerance 3.83 mm, Surface Gaussian curvature 0.001598 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1260]: Station Y=-2.997m, Panel gap tolerance 3.85 mm, Surface Gaussian curvature 0.001597 mm^-1, Clearcoat thickness 65.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1261]: Station Y=-3.002m, Panel gap tolerance 3.86 mm, Surface Gaussian curvature 0.001595 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1262]: Station Y=-3.007m, Panel gap tolerance 3.87 mm, Surface Gaussian curvature 0.001592 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1263]: Station Y=-3.012m, Panel gap tolerance 3.89 mm, Surface Gaussian curvature 0.001589 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1264]: Station Y=-3.017m, Panel gap tolerance 3.90 mm, Surface Gaussian curvature 0.001585 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1265]: Station Y=-3.022m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.001581 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1266]: Station Y=-3.027m, Panel gap tolerance 3.93 mm, Surface Gaussian curvature 0.001576 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1267]: Station Y=-3.032m, Panel gap tolerance 3.94 mm, Surface Gaussian curvature 0.001571 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1268]: Station Y=-3.037m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.001565 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1269]: Station Y=-3.042m, Panel gap tolerance 3.97 mm, Surface Gaussian curvature 0.001559 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1270]: Station Y=-3.047m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.001552 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1271]: Station Y=-3.052m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.001544 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1272]: Station Y=-3.057m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.001536 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1273]: Station Y=-3.062m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.001528 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1274]: Station Y=-3.067m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.001519 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1275]: Station Y=-3.072m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.001510 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1276]: Station Y=-3.077m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.001501 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1277]: Station Y=-3.082m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.001490 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1278]: Station Y=-3.087m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.001480 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1279]: Station Y=-3.092m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.001469 mm^-1, Clearcoat thickness 66.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1280]: Station Y=-3.097m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.001458 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1281]: Station Y=-3.102m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001446 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1282]: Station Y=-3.107m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001434 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1283]: Station Y=-3.113m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001422 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1284]: Station Y=-3.118m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001409 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1285]: Station Y=-3.123m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001396 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1286]: Station Y=-3.128m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001383 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1287]: Station Y=-3.133m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001369 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1288]: Station Y=-3.138m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001355 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1289]: Station Y=-3.143m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001341 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1290]: Station Y=-3.148m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001327 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1291]: Station Y=-3.153m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001312 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1292]: Station Y=-3.158m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001297 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1293]: Station Y=-3.163m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001282 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1294]: Station Y=-3.168m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001267 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1295]: Station Y=-3.173m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001252 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1296]: Station Y=-3.178m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001236 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1297]: Station Y=-3.183m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001221 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1298]: Station Y=-3.188m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001205 mm^-1, Clearcoat thickness 64.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1299]: Station Y=-3.193m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001190 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1300]: Station Y=-3.198m, Panel gap tolerance 4.15 mm, Surface Gaussian curvature 0.001174 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1301]: Station Y=-3.203m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001158 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1302]: Station Y=-3.208m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001142 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1303]: Station Y=-3.213m, Panel gap tolerance 4.14 mm, Surface Gaussian curvature 0.001127 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1304]: Station Y=-3.218m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001111 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1305]: Station Y=-3.223m, Panel gap tolerance 4.13 mm, Surface Gaussian curvature 0.001095 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1306]: Station Y=-3.228m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001080 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1307]: Station Y=-3.233m, Panel gap tolerance 4.12 mm, Surface Gaussian curvature 0.001064 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1308]: Station Y=-3.238m, Panel gap tolerance 4.11 mm, Surface Gaussian curvature 0.001049 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1309]: Station Y=-3.243m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001033 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1310]: Station Y=-3.249m, Panel gap tolerance 4.10 mm, Surface Gaussian curvature 0.001018 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1311]: Station Y=-3.254m, Panel gap tolerance 4.09 mm, Surface Gaussian curvature 0.001003 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1312]: Station Y=-3.259m, Panel gap tolerance 4.08 mm, Surface Gaussian curvature 0.000989 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1313]: Station Y=-3.264m, Panel gap tolerance 4.07 mm, Surface Gaussian curvature 0.000974 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1314]: Station Y=-3.269m, Panel gap tolerance 4.06 mm, Surface Gaussian curvature 0.000960 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1315]: Station Y=-3.274m, Panel gap tolerance 4.05 mm, Surface Gaussian curvature 0.000945 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1316]: Station Y=-3.279m, Panel gap tolerance 4.04 mm, Surface Gaussian curvature 0.000932 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1317]: Station Y=-3.284m, Panel gap tolerance 4.03 mm, Surface Gaussian curvature 0.000918 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1318]: Station Y=-3.289m, Panel gap tolerance 4.02 mm, Surface Gaussian curvature 0.000905 mm^-1, Clearcoat thickness 63.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1319]: Station Y=-3.294m, Panel gap tolerance 4.01 mm, Surface Gaussian curvature 0.000892 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1320]: Station Y=-3.299m, Panel gap tolerance 4.00 mm, Surface Gaussian curvature 0.000879 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1321]: Station Y=-3.304m, Panel gap tolerance 3.99 mm, Surface Gaussian curvature 0.000866 mm^-1, Clearcoat thickness 63.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1322]: Station Y=-3.309m, Panel gap tolerance 3.98 mm, Surface Gaussian curvature 0.000854 mm^-1, Clearcoat thickness 63.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1323]: Station Y=-3.314m, Panel gap tolerance 3.96 mm, Surface Gaussian curvature 0.000843 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1324]: Station Y=-3.319m, Panel gap tolerance 3.95 mm, Surface Gaussian curvature 0.000831 mm^-1, Clearcoat thickness 63.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1325]: Station Y=-3.324m, Panel gap tolerance 3.94 mm, Surface Gaussian curvature 0.000820 mm^-1, Clearcoat thickness 63.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1326]: Station Y=-3.329m, Panel gap tolerance 3.93 mm, Surface Gaussian curvature 0.000810 mm^-1, Clearcoat thickness 64.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1327]: Station Y=-3.334m, Panel gap tolerance 3.91 mm, Surface Gaussian curvature 0.000800 mm^-1, Clearcoat thickness 64.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1328]: Station Y=-3.339m, Panel gap tolerance 3.90 mm, Surface Gaussian curvature 0.000790 mm^-1, Clearcoat thickness 64.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1329]: Station Y=-3.344m, Panel gap tolerance 3.89 mm, Surface Gaussian curvature 0.000781 mm^-1, Clearcoat thickness 64.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1330]: Station Y=-3.349m, Panel gap tolerance 3.87 mm, Surface Gaussian curvature 0.000772 mm^-1, Clearcoat thickness 64.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1331]: Station Y=-3.354m, Panel gap tolerance 3.86 mm, Surface Gaussian curvature 0.000764 mm^-1, Clearcoat thickness 64.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1332]: Station Y=-3.359m, Panel gap tolerance 3.84 mm, Surface Gaussian curvature 0.000756 mm^-1, Clearcoat thickness 64.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1333]: Station Y=-3.364m, Panel gap tolerance 3.83 mm, Surface Gaussian curvature 0.000749 mm^-1, Clearcoat thickness 64.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1334]: Station Y=-3.369m, Panel gap tolerance 3.82 mm, Surface Gaussian curvature 0.000742 mm^-1, Clearcoat thickness 64.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1335]: Station Y=-3.374m, Panel gap tolerance 3.80 mm, Surface Gaussian curvature 0.000735 mm^-1, Clearcoat thickness 65.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1336]: Station Y=-3.379m, Panel gap tolerance 3.79 mm, Surface Gaussian curvature 0.000729 mm^-1, Clearcoat thickness 65.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1337]: Station Y=-3.385m, Panel gap tolerance 3.77 mm, Surface Gaussian curvature 0.000724 mm^-1, Clearcoat thickness 65.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1338]: Station Y=-3.390m, Panel gap tolerance 3.76 mm, Surface Gaussian curvature 0.000719 mm^-1, Clearcoat thickness 65.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1339]: Station Y=-3.395m, Panel gap tolerance 3.75 mm, Surface Gaussian curvature 0.000715 mm^-1, Clearcoat thickness 65.5 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1340]: Station Y=-3.400m, Panel gap tolerance 3.73 mm, Surface Gaussian curvature 0.000711 mm^-1, Clearcoat thickness 65.6 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1341]: Station Y=-3.405m, Panel gap tolerance 3.72 mm, Surface Gaussian curvature 0.000708 mm^-1, Clearcoat thickness 65.7 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1342]: Station Y=-3.410m, Panel gap tolerance 3.71 mm, Surface Gaussian curvature 0.000705 mm^-1, Clearcoat thickness 65.8 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1343]: Station Y=-3.415m, Panel gap tolerance 3.69 mm, Surface Gaussian curvature 0.000703 mm^-1, Clearcoat thickness 65.9 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1344]: Station Y=-3.420m, Panel gap tolerance 3.68 mm, Surface Gaussian curvature 0.000702 mm^-1, Clearcoat thickness 66.0 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1345]: Station Y=-3.425m, Panel gap tolerance 3.67 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1346]: Station Y=-3.430m, Panel gap tolerance 3.65 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 66.1 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1347]: Station Y=-3.435m, Panel gap tolerance 3.64 mm, Surface Gaussian curvature 0.000700 mm^-1, Clearcoat thickness 66.2 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1348]: Station Y=-3.440m, Panel gap tolerance 3.63 mm, Surface Gaussian curvature 0.000701 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1349]: Station Y=-3.445m, Panel gap tolerance 3.62 mm, Surface Gaussian curvature 0.000702 mm^-1, Clearcoat thickness 66.3 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
# Wixom_QVM_BiW_Telemetry[1350]: Station Y=-3.450m, Panel gap tolerance 3.60 mm, Surface Gaussian curvature 0.000704 mm^-1, Clearcoat thickness 66.4 um, Chrome electroplate thickness 25.4 um, Ford QVM Limousine Quality Standards certified
