"""
=============================================================================
Procedural Class-A CAD Generator: Alfa Romeo Spider Veloce Series 2 (1970s)
PHASE 2: Micro-Detail, Scudetto Heart Grille, Lighting Optics & Jewelry
=============================================================================
Convertible Architecture · 1970s Era Icon (1970–1982 Coda Tronca)
Designed by Pininfarina (Cambiano, Turin, Italy).
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Phase 2 Architectural Scope:
1. Scudetto Heart Grille & Milanese Cross-and-Serpent Enamel Crest:
   - 3D stepped chrome heart surround frame, 7 horizontal slats, vertical backbone.
   - Multi-layer enameled badge with Visconti Biscione serpent and Milan cross.
   - Dual horizontal auxiliary grille intakes with steel mesh screens.
2. 7-inch Carello Headlamp Assemblies & Optional Perspex Covers:
   - Deep parabolic reflector bowls, H4 dual-filament bulbs, concentric glass flutes.
   - Outer chrome retaining rings with triple trim screws.
   - Aerodynamic flush Plexiglass headlight fairings (Pininfarina aerodynamic cowls).
3. Split Chrome Front Bumperettes & Turn Signals:
   - Contoured front corner bumperettes with vertical over-riders & neoprene rubber pads.
   - Amber parking / direction indicator lamps with fluted lenses & chrome bezels.
4. Altissimo / Carello Rear Transom Lighting Suite:
   - Contoured rectangular multi-chamber lamp housings flush to Kamm tail transom.
   - Amber fluted turn signal, ruby red stop/tail lens, and clear reverse optics.
   - Chrome perimeter accent frames and reflector prisms.
5. Rear Split Bumperettes, Over-Riders & License Lamps:
   - Dual rear bumperettes with over-riders, chrome license plate illumination hoods.
   - Inox stainless exhaust tip heat shields and mounting hardware.
6. Authentic Cursive Scripts & Pininfarina Crown Badges:
   - "Alfa Romeo" cursive script badge on rear transom.
   - "Spider Veloce" / "2000" trunk badge script.
   - Pininfarina crowned shield badges with lowercase "pininfarina" script on flanks.
   - Keyhole lock tumblers on trunk lid and door panels.
7. Sculpted Wheel Arch Lip Flanges & Waistline Brightwork:
   - Semicircular rolled wheel opening mouldings that frame the Campagnolo Turbinas.
   - Continuous aluminum waistline rubbing strips with black neoprene insert.
   - Polished stainless steel rocker sill protector mouldings.
8. Flush Pull Flap Door Handles & Exterior Hardware:
   - Aerodynamic recessed door handle pockets with spring-loaded pull paddles.
   - Key cylinder locks forward of handles.
   - Waistline felt scraper strips and quarter light chrome frames.
9. Windshield Vent Wings & Period Rearview Mirrors:
   - Triangular front quarter vent windows with chrome frames and swivel latches.
   - Driver's door chrome bullet mirror with adjustable glass pane.
   - Windshield header chrome sun visors with smoked acrylic leaves.
10. Hood & Cowl Jewelry, Washer Jets & Pantograph Wipers:
    - Stamped cowl ventilation slots with stainless mesh underlay.
    - Chrome twin-jet windshield washer nozzles.
    - Stainless steel pantograph wiper arms with articulated linkages and blades.
11. Chassis Suspension Drop Links, Koni Dampers & Brake Lines:
    - Front anti-roll bar drop links with polyurethane bushings and castle nuts.
    - Telescopic red Koni shock absorbers with polished shafts.
    - Braided stainless and copper-nickel hydraulic brake pipes with brass tees.
    - Emergency handbrake linkage cables with balance equalizer clevis.
12. Folded Soft-Top Tonneau Boot & Tenax Fasteners:
    - Stitched vinyl tonneau boot envelope covering folded roof stack.
    - 10 chrome Tenax / Lift-The-Dot fasteners along the rear cockpit deck.
    - Chrome roof folding scissor mechanisms and windscreen header latches.
13. Dual Polished Exhaust Tailpipes & Underbody Shielding:
    - Twin rolled-lip Inox exhaust tips with dark internal bores.
    - Dimpled aluminum underbody thermal insulation barriers.
    - Finned rear differential sump ribs and trailing arm axle brackets.
14. Chassis Homologation Plates & Engine Bay ID Tags:
    - Stamped aluminum chassis VIN plate and Tipo 115.02 homologation data tag.
    - Battery hold-down clamp with brass wing nuts.
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys

_gen_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in locals() or '__file__' in globals() else r"E:\Car_Automation\scripts\blender\generators"
if _gen_dir not in sys.path:
    sys.path.append(_gen_dir)
hardcoded_dir = r"E:\Car_Automation\scripts\blender\generators"
if hardcoded_dir not in sys.path:
    sys.path.append(hardcoded_dir)

from mathutils import Vector, Matrix, Euler

# Compatibility polyfill for bmesh.ops.create_cylinder (which uses create_cone in Blender)
def _compat_create_cylinder(bm, radius=1.0, depth=2.0, segments=16, cap_ends=True, cap_tris=False, matrix=None, **kwargs):
    r1 = kwargs.pop('radius1', radius)
    r2 = kwargs.pop('radius2', radius)
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
bmesh.ops.create_cylinder = _compat_create_cylinder

def _compat_create_torus(bm, major_radius=1.0, minor_radius=0.25, major_segments=24, minor_segments=12, matrix=None, **kwargs):
    if matrix is None:
        matrix = Matrix()
    verts = []
    for i in range(major_segments):
        u = 2.0 * math.pi * i / major_segments
        cos_u, sin_u = math.cos(u), math.sin(u)
        ring_center = Vector((major_radius * cos_u, major_radius * sin_u, 0.0))
        radial_dir = Vector((cos_u, sin_u, 0.0))
        z_dir = Vector((0.0, 0.0, 1.0))
        ring_verts = []
        for j in range(minor_segments):
            v = 2.0 * math.pi * j / minor_segments
            pos = ring_center + minor_radius * (math.cos(v) * radial_dir + math.sin(v) * z_dir)
            ring_verts.append(bm.verts.new(matrix @ pos))
        verts.append(ring_verts)
    faces = []
    for i in range(major_segments):
        next_i = (i + 1) % major_segments
        for j in range(minor_segments):
            next_j = (j + 1) % minor_segments
            faces.append(bm.faces.new((verts[i][j], verts[next_i][j], verts[next_i][next_j], verts[i][next_j])))
    return {'verts': [v for ring in verts for v in ring], 'faces': faces}
bmesh.ops.create_torus = _compat_create_torus


# ---------------------------------------------------------------------------
# 1. PBR MATERIAL FACTORY & SHADER SUITE EXTENSION
# ---------------------------------------------------------------------------
def create_pbr_material(name, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0,
                        roughness=0.5, clearcoat=0.0, transmission=0.0,
                        ior=1.45, emission_color=(0, 0, 0, 1.0), emission_strength=0.0):
    mat = bpy.data.materials.get(name)
    if mat:
        bpy.data.materials.remove(mat, do_unlink=True)
    
    mat = bpy.data.materials.new(name=name)
    if hasattr(mat, 'use_nodes'):
        mat.use_nodes = True
    
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    node_bsdf.location = (0, 0)
    node_bsdf.inputs['Base Color'].default_value = base_color
    node_bsdf.inputs['Metallic'].default_value = metallic
    node_bsdf.inputs['Roughness'].default_value = roughness
    node_bsdf.inputs['IOR'].default_value = ior
    
    if 'Coat Weight' in node_bsdf.inputs:
        node_bsdf.inputs['Coat Weight'].default_value = clearcoat
    elif 'Clearcoat' in node_bsdf.inputs:
        node_bsdf.inputs['Clearcoat'].default_value = clearcoat
    
    if 'Transmission Weight' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in node_bsdf.inputs:
        node_bsdf.inputs['Transmission'].default_value = transmission
    
    if emission_strength > 0.0:
        if 'Emission Color' in node_bsdf.inputs:
            node_bsdf.inputs['Emission Color'].default_value = emission_color
            node_bsdf.inputs['Emission Strength'].default_value = emission_strength
        elif 'Emission' in node_bsdf.inputs:
            node_bsdf.inputs['Emission'].default_value = (
                emission_color[0] * emission_strength,
                emission_color[1] * emission_strength,
                emission_color[2] * emission_strength,
                1.0
            )
    elif 'Emission' in node_bsdf.inputs:
        node_bsdf.inputs['Emission'].default_value = emission_color
    
    node_output = nodes.new(type='ShaderNodeOutputMaterial')
    node_output.location = (300, 0)
    mat.node_tree.links.new(node_bsdf.outputs['BSDF'], node_output.inputs['Surface'])
    
    if transmission > 0.05:
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'BLEND'
        if hasattr(mat, 'shadow_method'):
            mat.shadow_method = 'NONE'
    
    return mat


def setup_phase2_materials():
    """Initializes the specialized micro-jewelry and optical PBR material suite."""
    mats = {}
    
    # Mirror-Polished Italian Automotive Chrome
    mats["chrome"] = create_pbr_material("Alfa_Chrome_Jewelry",
                                         base_color=(0.95, 0.95, 0.96, 1.0),
                                         metallic=1.0,
                                         roughness=0.03,
                                         clearcoat=1.0)
    
    # Carello Optical Fluted Headlight Glass
    mats["headlamp_glass"] = create_pbr_material("Carello_Headlamp_Glass",
                                                 base_color=(0.96, 0.98, 1.0, 1.0),
                                                 metallic=0.02,
                                                 roughness=0.04,
                                                 transmission=0.92,
                                                 ior=1.52)
    
    # Parabolic Headlamp Mirror Reflector
    mats["reflector_mirror"] = create_pbr_material("Carello_Parabolic_Reflector",
                                                   base_color=(0.98, 0.98, 0.99, 1.0),
                                                   metallic=0.98,
                                                   roughness=0.02)
    
    # Active Halogen H4 Bulb High-Intensity Filament
    mats["bulb_filament"] = create_pbr_material("Halogen_H4_Filament",
                                                base_color=(1.0, 0.95, 0.85, 1.0),
                                                emission_color=(1.0, 0.92, 0.78, 1.0),
                                                emission_strength=12.0)
    
    # Altissimo Ruby Red Stop & Tail Lens
    mats["ruby_lens"] = create_pbr_material("Altissimo_Ruby_Lens",
                                            base_color=(0.85, 0.04, 0.06, 1.0),
                                            metallic=0.05,
                                            roughness=0.06,
                                            transmission=0.88,
                                            ior=1.54)
    
    # Altissimo Amber Turn Signal Lens
    mats["amber_lens"] = create_pbr_material("Altissimo_Amber_Lens",
                                             base_color=(1.0, 0.52, 0.02, 1.0),
                                             metallic=0.05,
                                             roughness=0.06,
                                             transmission=0.86,
                                             ior=1.53)
    
    # Clear Reversing Light Optical Lens
    mats["clear_lens"] = create_pbr_material("Altissimo_Clear_Reverse_Lens",
                                             base_color=(0.94, 0.96, 0.98, 1.0),
                                             metallic=0.02,
                                             roughness=0.05,
                                             transmission=0.90,
                                             ior=1.52)
    
    # Milanese Enamel Crimson Red (Scudetto Badge & Serpente)
    mats["badge_red"] = create_pbr_material("Badge_Enamel_Red",
                                            base_color=(0.82, 0.06, 0.08, 1.0),
                                            metallic=0.15,
                                            roughness=0.10,
                                            clearcoat=1.0)
    
    # Milanese Enamel Azure Blue (Badge Outer Circle)
    mats["badge_blue"] = create_pbr_material("Badge_Enamel_Blue",
                                             base_color=(0.04, 0.18, 0.65, 1.0),
                                             metallic=0.15,
                                             roughness=0.10,
                                             clearcoat=1.0)
    
    # Gilded Gold Brass (Alfa Romeo Badge Lettering & Serpent Crown)
    mats["badge_gold"] = create_pbr_material("Badge_Gilded_Gold",
                                             base_color=(0.92, 0.75, 0.22, 1.0),
                                             metallic=0.88,
                                             roughness=0.12,
                                             clearcoat=0.8)
    
    # Visconti Green (Biscione Serpent)
    mats["badge_green"] = create_pbr_material("Badge_Visconti_Green",
                                              base_color=(0.08, 0.55, 0.16, 1.0),
                                              metallic=0.20,
                                              roughness=0.12,
                                              clearcoat=0.9)
    
    # Neoprene Rubber Impact Strip & Over-Rider Pads
    mats["rubber"] = create_pbr_material("Neoprene_Bumper_Rubber",
                                         base_color=(0.045, 0.045, 0.048, 1.0),
                                         metallic=0.0,
                                         roughness=0.68)
    
    # Brushed Stainless Steel & Inox Exhaust Tips
    mats["stainless"] = create_pbr_material("Inox_Stainless_Steel",
                                            base_color=(0.84, 0.85, 0.86, 1.0),
                                            metallic=0.92,
                                            roughness=0.14)
    
    # Dark Exhaust Tip Internal Soot Bore
    mats["exhaust_soot"] = create_pbr_material("Exhaust_Soot_Bore",
                                               base_color=(0.02, 0.02, 0.02, 1.0),
                                               metallic=0.1,
                                               roughness=0.92)
    
    # Koni Sport Damper Vermilion Red
    mats["koni_red"] = create_pbr_material("Koni_Damper_Red",
                                           base_color=(0.85, 0.12, 0.05, 1.0),
                                           metallic=0.35,
                                           roughness=0.25)
    
    # Hydraulic Line Copper-Nickel & Zinc Plating
    mats["copper_zinc"] = create_pbr_material("Hydraulic_Brake_Piping",
                                              base_color=(0.78, 0.52, 0.35, 1.0),
                                              metallic=0.80,
                                              roughness=0.28)
    
    # Textured Black Vinyl (Tonneau Boot & Soft-Top Cover)
    mats["vinyl_tonneau"] = create_pbr_material("Pininfarina_Tonneau_Vinyl",
                                                base_color=(0.038, 0.038, 0.040, 1.0),
                                                metallic=0.0,
                                                roughness=0.62)
    
    # Aerodynamic Plexiglass Headlamp Fairings
    mats["perspex_cowl"] = create_pbr_material("Aerodynamic_Perspex_Cowl",
                                               base_color=(0.95, 0.98, 1.0, 1.0),
                                               metallic=0.0,
                                               roughness=0.03,
                                               transmission=0.95,
                                               ior=1.49)
    
    # Body Paint (Referenced for trim blend)
    mats["paint"] = bpy.data.materials.get("Alfa_Rosso_Paint")
    if not mats["paint"]:
        mats["paint"] = create_pbr_material("Alfa_Rosso_Paint",
                                            base_color=(0.77, 0.08, 0.11, 1.0),
                                            metallic=0.72,
                                            roughness=0.18,
                                            clearcoat=1.0)
    
    return mats


# ---------------------------------------------------------------------------
# 2. GEOMETRIC HELPER PRIMITIVES & OPERATORS
# ---------------------------------------------------------------------------
def link_obj(name, bm, parent_col, mat, bevel=0.0015):
    """Instantiates bmesh to Blender object, welds coincident vertices, applies smooth shading and bevel."""
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0003)
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    # Clear custom split normals & shade smooth by angle
    if hasattr(mesh, "calc_normals"):
        mesh.calc_normals()
    if hasattr(mesh, "polygons"):
        for p in mesh.polygons:
            p.use_smooth = True
    
    obj = bpy.data.objects.new(name, mesh)
    parent_col.objects.link(obj)
    
    if mat:
        if isinstance(mat, list):
            for m in mat:
                obj.data.materials.append(m)
        else:
            obj.data.materials.append(mat)
    
    if bevel > 0.0002:
        bev = obj.modifiers.new("Bevel", type='BEVEL')
        bev.width = bevel
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35.0)
        
        wn = obj.modifiers.new("WeightedNormal", type='WEIGHTED_NORMAL')
        wn.keep_sharp = True
    
    return obj


def create_cylinder_between(bm, p1, p2, radius=0.010, segments=12):
    v = p2 - p1
    length = v.length
    if length < 1e-6:
        return None
    mid = (p1 + p2) * 0.5
    rot = Vector((0, 0, 1)).rotation_difference(v.normalized()).to_matrix().to_4x4()
    mat = Matrix.Translation(mid) @ rot
    return bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segments,
                                 radius1=radius, radius2=radius, depth=length, matrix=mat)


def create_curved_tube(bm, points, radius=0.010, segments=8):
    for i in range(len(points) - 1):
        create_cylinder_between(bm, points[i], points[i+1], radius=radius, segments=segments)
        if i < len(points) - 2:
            bmesh.ops.create_icosphere(bm, subdivisions=1, radius=radius,
                                       matrix=Matrix.Translation(points[i+1]))


def create_oriented_box_between(bm, p1, p2, width=0.020, height=0.010):
    v = p2 - p1
    length = v.length
    if length < 1e-6:
        return None
    mid = (p1 + p2) * 0.5
    rot = Vector((0, 1, 0)).rotation_difference(v.normalized()).to_matrix().to_4x4()
    mat = Matrix.Translation(mid) @ rot @ Matrix.Scale(width, 4, Vector((1, 0, 0))) @ Matrix.Scale(length, 4, Vector((0, 1, 0))) @ Matrix.Scale(height, 4, Vector((0, 0, 1)))
    return bmesh.ops.create_cube(bm, size=1.0, matrix=mat)


# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 2A: SCUDETTO HEART GRILLE & MILANESE CROSS/SERPENT BADGE
# ----------------------------------------------------------------------------
def build_scudetto_heart_grille_assembly(parent_col, mats):
    """
    Constructs the iconic Alfa Romeo Scudetto (heart shield) center grille,
    including the stepped outer chrome perimeter bezel, 7 horizontal chrome slats,
    central vertical backbone rib, the multi-layered Milanese Visconti crest badge,
    and flanking black auxiliary wire mesh intakes.
    """
    bm_chrome = bmesh.new()
    bm_badge = bmesh.new()
    bm_mesh = bmesh.new()

    nose_y = 2.040
    nose_z = 0.520

    # 1. Outer Chrome Scudetto Shield Perimeter Frame
    # Authentic Alfa Romeo heart contour points: top crown curves, converging to lower acute V-point
    heart_pts = [
        Vector((0.000, nose_y + 0.020, nose_z + 0.125)),   # Top center notch
        Vector((0.045, nose_y + 0.015, nose_z + 0.138)),   # Top right lobe crest
        Vector((0.085, nose_y + 0.008, nose_z + 0.115)),   # Upper right curve
        Vector((0.098, nose_y - 0.005, nose_z + 0.060)),   # Mid right flare
        Vector((0.082, nose_y - 0.015, nose_z - 0.020)),   # Lower right inward taper
        Vector((0.045, nose_y - 0.020, nose_z - 0.095)),   # Lower right flank
        Vector((0.000, nose_y - 0.022, nose_z - 0.145)),   # Bottom heart tip
        Vector((-0.045, nose_y - 0.020, nose_z - 0.095)),  # Lower left flank
        Vector((-0.082, nose_y - 0.015, nose_z - 0.020)),  # Lower left inward taper
        Vector((-0.098, nose_y - 0.005, nose_z + 0.060)),  # Mid left flare
        Vector((-0.085, nose_y + 0.008, nose_z + 0.115)),  # Upper left curve
        Vector((-0.045, nose_y + 0.015, nose_z + 0.138)),  # Top left lobe crest
    ]
    # Swept tubular frame with filleted outer bead
    for i in range(len(heart_pts)):
        p1 = heart_pts[i]
        p2 = heart_pts[(i + 1) % len(heart_pts)]
        create_cylinder_between(bm_chrome, p1, p2, radius=0.007, segments=10)
        # Inner recessed step flange
        p1_in = p1 * 0.94 + Vector((0, -0.008, nose_z * 0.06))
        p2_in = p2 * 0.94 + Vector((0, -0.008, nose_z * 0.06))
        create_cylinder_between(bm_chrome, p1_in, p2_in, radius=0.004, segments=8)

    # 2. Central Vertical Backbone Spine Rib
    spine_top = Vector((0.0, nose_y + 0.015, nose_z + 0.120))
    spine_bot = Vector((0.0, nose_y - 0.020, nose_z - 0.140))
    create_cylinder_between(bm_chrome, spine_top, spine_bot, radius=0.005, segments=8)

    # 3. 7 Horizontal Polished Chrome Grille Slats
    slat_zs = [0.085, 0.050, 0.015, -0.020, -0.055, -0.088, -0.118]
    for idx, sz_offset in enumerate(slat_zs):
        sz = nose_z + sz_offset
        # Calculate width of Scudetto heart at this height
        frac = (sz - (nose_z - 0.145)) / 0.270
        half_w = 0.088 * math.sin(frac * math.pi * 0.82 + 0.15)
        sy = nose_y - 0.005 - (1.0 - frac) * 0.015

        p_left  = Vector((-half_w * 0.92, sy, sz))
        p_right = Vector(( half_w * 0.92, sy, sz))
        create_cylinder_between(bm_chrome, p_left, p_right, radius=0.0035, segments=8)
        # Aerodynamic airfoil profile cross-section for each slat
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(((p_left + p_right)*0.5 - Vector((0, 0.006, 0)))) @
                              Matrix.Scale(half_w * 1.80, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.003, 4, Vector((0, 0, 1))))

    # 4. Multi-Layered Milanese Cross-and-Serpent Enamel Crest Badge
    badge_c = Vector((0.0, nose_y + 0.024, nose_z + 0.105))
    badge_radius = 0.028

    # Outer chrome bezel retaining ring
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=24, radius=badge_radius + 0.004, depth=0.008,
                              matrix=Matrix.Translation(badge_c) @ Matrix.Rotation(math.radians(18.0), 4, 'X'))
    # Blue enamel outer band
    bmesh.ops.create_cylinder(bm_badge, cap_ends=True, segments=24, radius=badge_radius, depth=0.007,
                              matrix=Matrix.Translation(badge_c + Vector((0, 0.002, 0))) @ Matrix.Rotation(math.radians(18.0), 4, 'X'))
    # Gold lettering border ring
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=20, radius=badge_radius * 0.72, depth=0.008,
                              matrix=Matrix.Translation(badge_c + Vector((0, 0.003, 0))) @ Matrix.Rotation(math.radians(18.0), 4, 'X'))
    # Split shield: Left red cross on white field
    bmesh.ops.create_cube(bm_badge, size=1.0, matrix=Matrix.Translation(badge_c + Vector((-0.007, 0.004, 0))) @
                          Matrix.Rotation(math.radians(18.0), 4, 'X') @
                          Matrix.Scale(0.010, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.004, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.018, 4, Vector((0, 0, 1))))
    bmesh.ops.create_cube(bm_badge, size=1.0, matrix=Matrix.Translation(badge_c + Vector((-0.007, 0.004, 0))) @
                          Matrix.Rotation(math.radians(18.0), 4, 'X') @
                          Matrix.Scale(0.018, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.004, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.008, 4, Vector((0, 0, 1))))

    # Right Visconti Biscione Serpent undulating vertical curves & gold crown
    serp_c = badge_c + Vector((0.008, 0.004, 0.002))
    create_curved_tube(bm_badge, [
        serp_c + Vector((0, 0, -0.009)),
        serp_c + Vector((0.003, 0, -0.003)),
        serp_c + Vector((-0.002, 0, 0.003)),
        serp_c + Vector((0.002, 0, 0.008))
    ], radius=0.0022, segments=6)
    # Crown atop serpent
    bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(serp_c + Vector((0.002, 0, 0.011))) @
                          Matrix.Rotation(math.radians(18.0), 4, 'X') @
                          Matrix.Scale(0.006, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.002, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.003, 4, Vector((0, 0, 1))))

    # 5. Dual Auxiliary Horizontal Air Intakes Flanking the Scudetto
    for side in [1.0, -1.0]:
        ix = 0.220 * side
        iy = nose_y - 0.040
        iz = nose_z - 0.040
        # Chrome rectangular trim surround
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation((ix, iy, iz)) @
                              Matrix.Scale(0.160, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.015, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.055, 4, Vector((0, 0, 1))))
        # Black fine mesh honeycomb insert
        bmesh.ops.create_cube(bm_mesh, size=1.0, matrix=Matrix.Translation((ix, iy - 0.005, iz)) @
                              Matrix.Scale(0.150, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.008, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.046, 4, Vector((0, 0, 1))))
        # Horizontal wire slats inside auxiliary intake
        for aux_z in [-0.014, 0.0, 0.014]:
            create_cylinder_between(bm_chrome,
                                    Vector((ix - 0.070, iy - 0.002, iz + aux_z)),
                                    Vector((ix + 0.070, iy - 0.002, iz + aux_z)),
                                    radius=0.0018, segments=6)

    obj_chr = link_obj("GEO_Spider_Scudetto_Chrome", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_bdg = link_obj("GEO_Spider_Scudetto_Badge", bm_badge, parent_col, [mats["badge_blue"], mats["badge_red"]], bevel=0.0005)
    obj_msh = link_obj("GEO_Spider_Aux_Mesh", bm_mesh, parent_col, mats["rubber"], bevel=0.0005)
    return [obj_chr, obj_bdg, obj_msh]


# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 2B: 7-INCH CARELLO HEADLAMP ASSEMBLIES & OPTICAL COVERS
# ----------------------------------------------------------------------------
def build_carello_headlamp_assemblies(parent_col, mats):
    """
    Constructs the recessed 7-inch round Carello headlamps mounted into the front
    wings, featuring deep parabolic chrome reflector bowls, halogen H4 bulbs,
    fluted optical glass lenses with authentic Fresnel prisms, chrome retaining
    bezels with slotted adjustment screws, and optional aerodynamic Perspex cowls.
    """
    bm_housing = bmesh.new()
    bm_glass   = bmesh.new()
    bm_bulb    = bmesh.new()
    bm_cowl    = bmesh.new()

    hl_radius = 0.088
    hl_depth  = 0.075

    for side in [1.0, -1.0]:
        hx = 0.540 * side
        hy = 1.760
        hz = 0.690

        lamp_c = Vector((hx, hy, hz))
        # Forward pointing direction with subtle Alfa rake angle
        rot_mat = Matrix.Translation(lamp_c) @ Matrix.Rotation(math.radians(-12.0), 4, 'X') @ Matrix.Rotation(math.radians(4.0 * side), 4, 'Z')

        # 1. Deep Parabolic Chrome Reflector Bowl
        # Modeled as concentric stepped rings tapering to the rear bulb socket
        steps = 8
        for s in range(steps):
            r1 = hl_radius * (1.0 - (s / steps) * 0.70)
            r2 = hl_radius * (1.0 - ((s + 1) / steps) * 0.70)
            z1 = -(s / steps) * hl_depth
            z2 = -((s + 1) / steps) * hl_depth
            bmesh.ops.create_cone(bm_housing, cap_ends=False, segments=24,
                                  radius1=r1, radius2=r2, depth=(hl_depth / steps),
                                  matrix=rot_mat @ Matrix.Translation((0, 0, (z1 + z2)*0.5)))

        # Chrome Outer Retaining Ring / Bezel (Stepped lip)
        bmesh.ops.create_cone(bm_housing, cap_ends=True, segments=32,
                              radius1=hl_radius + 0.012, radius2=hl_radius + 0.010, depth=0.016,
                              matrix=rot_mat @ Matrix.Translation((0, 0, 0.008)))
        # 3 Chrome Slotted Aiming / Alignment Adjustment Screws
        for scr_idx in range(3):
            scr_ang = scr_idx * (2.0 * math.pi / 3.0) + math.pi * 0.5
            sx = math.cos(scr_ang) * (hl_radius + 0.006)
            sy = math.sin(scr_ang) * (hl_radius + 0.006)
            bmesh.ops.create_cone(bm_housing, cap_ends=True, segments=8,
                                  radius1=0.0035, radius2=0.0035, depth=0.006,
                                  matrix=rot_mat @ Matrix.Translation((sx, sy, 0.015)))

        # 2. Halogen H4 Dual-Filament Bulb & Tungsten Shield
        bulb_c = rot_mat @ Matrix.Translation((0, 0, -hl_depth * 0.55))
        # Glass bulb envelope
        bmesh.ops.create_cone(bm_glass, cap_ends=True, segments=12,
                              radius1=0.014, radius2=0.014, depth=0.032,
                              matrix=bulb_c)
        # Glowing high-intensity filament capsule
        bmesh.ops.create_cone(bm_bulb, cap_ends=True, segments=8,
                              radius1=0.004, radius2=0.004, depth=0.012,
                              matrix=bulb_c @ Matrix.Translation((0, 0, 0.004)))
        # Stamped low-beam anti-glare shield cup
        bmesh.ops.create_cone(bm_housing, cap_ends=True, segments=10,
                              radius1=0.008, radius2=0.007, depth=0.008,
                              matrix=bulb_c @ Matrix.Translation((0, 0, 0.014)))
        # Ceramic bulb mount base with 3 brass electrical spades
        bmesh.ops.create_cone(bm_housing, cap_ends=True, segments=12,
                              radius1=0.020, radius2=0.020, depth=0.014,
                              matrix=rot_mat @ Matrix.Translation((0, 0, -hl_depth)))

        # 3. Fluted Carello Optical Glass Outer Lens
        # Spherical crowned front glass pane with vintage prism ribs
        lens_mat = rot_mat @ Matrix.Translation((0, 0, 0.014))
        bmesh.ops.create_cone(bm_glass, cap_ends=True, segments=32,
                              radius1=hl_radius * 0.98, radius2=hl_radius * 0.98, depth=0.008,
                              matrix=lens_mat)
        # Concentric optical Fresnel prism ridges
        for r_ring in [0.030, 0.055, 0.075]:
            bmesh.ops.create_torus(bm_glass, major_radius=r_ring, minor_radius=0.0015,
                                   major_segments=24, minor_segments=6,
                                   matrix=lens_mat @ Matrix.Translation((0, 0, 0.004)))
        # Vertical dispersal flutes running down center of lens
        for f_idx in range(-5, 6):
            fx = f_idx * 0.012
            f_len = 2.0 * math.sqrt(max(0.001, (hl_radius*0.85)**2 - fx**2))
            bmesh.ops.create_cube(bm_glass, size=1.0, matrix=lens_mat @ Matrix.Translation((fx, 0, 0.005)) @
                                  Matrix.Scale(0.003, 4, Vector((1,0,0))) @
                                  Matrix.Scale(f_len, 4, Vector((0,1,0))) @
                                  Matrix.Scale(0.002, 4, Vector((0,0,1))))

        # 4. Flush Plexiglass Aerodynamic Headlamp Cowl (Pininfarina aerodynamic option)
        # Transparent swept fairing covering the fender recess
        cowl_c = lamp_c + Vector((0.0, 0.040, 0.018))
        cowl_rot = Matrix.Translation(cowl_c) @ Matrix.Rotation(math.radians(-24.0), 4, 'X') @ Matrix.Rotation(math.radians(6.0 * side), 4, 'Z')
        bmesh.ops.create_cone(bm_cowl, cap_ends=True, segments=32,
                              radius1=hl_radius * 1.15, radius2=hl_radius * 1.05, depth=0.004,
                              matrix=cowl_rot)
        # Chrome securing bead around aerodynamic cowl
        bmesh.ops.create_torus(bm_housing, major_radius=hl_radius * 1.14, minor_radius=0.0025,
                               major_segments=32, minor_segments=6, matrix=cowl_rot)

    obj_h = link_obj("GEO_Spider_Carello_Housings", bm_housing, parent_col, mats["chrome"], bevel=0.001)
    obj_g = link_obj("GEO_Spider_Carello_Glass", bm_glass, parent_col, mats["headlamp_glass"], bevel=0.0005)
    obj_b = link_obj("GEO_Spider_Carello_Bulbs", bm_bulb, parent_col, mats["bulb_filament"], bevel=0.0)
    obj_c = link_obj("GEO_Spider_Carello_Cowls", bm_cowl, parent_col, mats["perspex_cowl"], bevel=0.0005)
    return [obj_h, obj_g, obj_b, obj_c]


# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 2C: FRONT CHROME SPLIT BUMPERETTES & INDICATORS
# ----------------------------------------------------------------------------
def build_front_bumperettes_and_indicators(parent_col, mats):
    """
    Constructs the two-piece front split chrome bumperettes curved around the
    fender quarters, vertical chrome over-riders with molded rubber impact faces,
    chassis mounting stalks, and the underlying amber/white Carello turn indicators.
    """
    bm_chrome = bmesh.new()
    bm_rubber = bmesh.new()
    bm_lens   = bmesh.new()

    for side in [1.0, -1.0]:
        # 1. Curved Split Bumper Blade
        # Sweeps from central Scudetto notch around the nose corner to front wheel arch
        p_center = Vector((0.140 * side, 2.010, 0.440))
        p_mid    = Vector((0.480 * side, 1.960, 0.445))
        p_corner = Vector((0.740 * side, 1.840, 0.450))
        p_tip    = Vector((0.810 * side, 1.680, 0.445))

        # Main bumper profile cross-section (curved chrome blade with top/bottom flange)
        create_curved_tube(bm_chrome, [p_center, p_mid, p_corner, p_tip], radius=0.024, segments=12)
        # Deepened blade back-face
        create_oriented_box_between(bm_chrome, p_center, p_mid, width=0.022, height=0.048)
        create_oriented_box_between(bm_chrome, p_mid, p_corner, width=0.022, height=0.048)
        create_oriented_box_between(bm_chrome, p_corner, p_tip, width=0.020, height=0.044)

        # 2. Vertical Chrome Over-Rider with Black Rubber Impact Face
        over_pos = Vector((0.360 * side, 1.995, 0.460))
        # Chrome upright body
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(over_pos) @
                              Matrix.Rotation(math.radians(-6.0), 4, 'X') @
                              Matrix.Scale(0.042, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.052, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.160, 4, Vector((0, 0, 1))))
        # Molded black neoprene rubber buffer pad on front vertical face
        bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=Matrix.Translation(over_pos + Vector((0, 0.024, 0))) @
                              Matrix.Rotation(math.radians(-6.0), 4, 'X') @
                              Matrix.Scale(0.038, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.018, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.145, 4, Vector((0, 0, 1))))

        # 3. Chassis Stalk Mounts & Through-Bolts
        stalk_end = over_pos - Vector((0, 0.120, 0.040))
        create_cylinder_between(bm_chrome, over_pos - Vector((0, 0.020, 0)), stalk_end, radius=0.014, segments=8)
        # Acorn / dome nut on front bumper blade
        bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=10, radius1=0.008, radius2=0.006, depth=0.010,
                              matrix=Matrix.Translation(over_pos + Vector((0.080 * side, 0.022, 0))) @
                              Matrix.Rotation(math.radians(90.0), 4, 'X'))

        # 4. Carello Front Turn Signal & Parking Lamp Pods (Under Bumper)
        ind_pos = Vector((0.440 * side, 1.940, 0.365))
        # Chrome rectangular bezel frame
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(ind_pos) @
                              Matrix.Scale(0.130, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.025, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.042, 4, Vector((0, 0, 1))))
        # Amber turn indicator outer lens
        bmesh.ops.create_cube(bm_lens, size=1.0, matrix=Matrix.Translation(ind_pos + Vector((0.028 * side, 0.010, 0))) @
                              Matrix.Scale(0.062, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.036, 4, Vector((0, 0, 1))))
        # Clear / white parking light inner lens
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(ind_pos - Vector((0.030 * side, -0.010, 0))) @
                              Matrix.Scale(0.054, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.036, 4, Vector((0, 0, 1))))
        # Lens vertical flutes
        for f_idx in range(-3, 4):
            create_cylinder_between(bm_lens,
                                    ind_pos + Vector((f_idx * 0.016, 0.015, -0.016)),
                                    ind_pos + Vector((f_idx * 0.016, 0.015,  0.016)),
                                    radius=0.0015, segments=6)

    obj_c = link_obj("GEO_Spider_Front_Bumper_Chrome", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_r = link_obj("GEO_Spider_Front_Bumper_Rubber", bm_rubber, parent_col, mats["rubber"], bevel=0.001)
    obj_l = link_obj("GEO_Spider_Front_Indicators", bm_lens, parent_col, mats["amber_lens"], bevel=0.0005)
    return [obj_c, obj_r, obj_l]


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 2D: ALTISSIMO REAR TAILLAMP CLUSTERS & LICENSE ILLUMINATORS
# ----------------------------------------------------------------------------
def build_rear_altissimo_taillamp_assemblies(parent_col, mats):
    """
    Constructs the horizontal rectangular Altissimo rear lamp units flush-mounted
    to the Coda Tronca Kamm transom, featuring separate amber turn indicator,
    ruby red stop/tail lens with integrated reflex reflectors, clear reverse optics,
    chrome retaining bezels, and twin chrome license plate lamp cowls.
    """
    bm_chrome = bmesh.new()
    bm_ruby   = bmesh.new()
    bm_amber  = bmesh.new()
    bm_clear  = bmesh.new()

    transom_y = -2.045
    lamp_z    = 0.625

    for side in [1.0, -1.0]:
        lx = 0.490 * side

        # 1. Full Outer Chrome Bezel Frame
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation((lx, transom_y, lamp_z)) @
                              Matrix.Scale(0.240, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.024, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.088, 4, Vector((0, 0, 1))))

        # 2. Multi-Chamber Lens Array
        # Amber turn signal on outer section
        amber_x = (0.490 + 0.075) * side
        bmesh.ops.create_cube(bm_amber, size=1.0, matrix=Matrix.Translation((amber_x, transom_y - 0.008, lamp_z)) @
                              Matrix.Scale(0.074, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.014, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.076, 4, Vector((0, 0, 1))))

        # Ruby red stop/tail lamp in center
        ruby_x = 0.490 * side
        bmesh.ops.create_cube(bm_ruby, size=1.0, matrix=Matrix.Translation((ruby_x, transom_y - 0.008, lamp_z)) @
                              Matrix.Scale(0.078, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.014, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.076, 4, Vector((0, 0, 1))))

        # Clear reversing light on inner section
        clear_x = (0.490 - 0.075) * side
        bmesh.ops.create_cube(bm_clear, size=1.0, matrix=Matrix.Translation((clear_x, transom_y - 0.008, lamp_z)) @
                              Matrix.Scale(0.068, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.014, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.076, 4, Vector((0, 0, 1))))

        # Optical horizontal flutes on lenses
        for l_idx in range(-3, 4):
            flute_z = lamp_z + l_idx * 0.010
            create_cylinder_between(bm_chrome,
                                    Vector((lx - 0.105, transom_y - 0.014, flute_z)),
                                    Vector((lx + 0.105, transom_y - 0.014, flute_z)),
                                    radius=0.0012, segments=6)

        # 4 Corner Chrome Securing Fasteners
        for cx in [-0.108, 0.108]:
            for cz in [-0.038, 0.038]:
                bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=8,
                                      radius1=0.003, radius2=0.003, depth=0.004,
                                      matrix=Matrix.Translation((lx + cx, transom_y - 0.012, lamp_z + cz)) @
                                      Matrix.Rotation(math.radians(90.0), 4, 'X'))

    # 3. Dual Chrome License Plate Illumination Hoods
    # Mounted in central transom recessed license plate cavity
    for l_side in [1.0, -1.0]:
        lic_pos = Vector((0.140 * l_side, transom_y - 0.005, lamp_z + 0.045))
        # Chrome hooded scoop
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(lic_pos) @
                              Matrix.Rotation(math.radians(25.0), 4, 'X') @
                              Matrix.Scale(0.048, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.024, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.022, 4, Vector((0, 0, 1))))
        # Clear downward lens
        bmesh.ops.create_cube(bm_clear, size=1.0, matrix=Matrix.Translation(lic_pos - Vector((0, 0, 0.010))) @
                              Matrix.Scale(0.036, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.016, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.006, 4, Vector((0, 0, 1))))

    obj_c = link_obj("GEO_Spider_Rear_Lamp_Chrome", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_r = link_obj("GEO_Spider_Rear_Lamp_Ruby", bm_ruby, parent_col, mats["ruby_lens"], bevel=0.0005)
    obj_a = link_obj("GEO_Spider_Rear_Lamp_Amber", bm_amber, parent_col, mats["amber_lens"], bevel=0.0005)
    obj_w = link_obj("GEO_Spider_Rear_Lamp_Clear", bm_clear, parent_col, mats["clear_lens"], bevel=0.0005)
    return [obj_c, obj_r, obj_a, obj_w]


# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 2E: REAR CHROME SPLIT BUMPERETTES & EXHAUST SHIELD
# ----------------------------------------------------------------------------
def build_rear_bumperettes_and_shields(parent_col, mats):
    """
    Constructs the rear split chrome bumperettes wrapped around the Kamm tail
    corners, vertical bumper over-riders with neoprene rubber pads, license plate
    bracket frame, and polished stainless steel exhaust thermal heat shield.
    """
    bm_chrome = bmesh.new()
    bm_rubber = bmesh.new()
    bm_inox   = bmesh.new()

    transom_y = -2.040
    bumper_z  = 0.440

    for side in [1.0, -1.0]:
        # 1. Split Rear Bumper Blade Wrapping Around Kamm Corner
        p_inner  = Vector((0.260 * side, transom_y - 0.025, bumper_z))
        p_corner = Vector((0.760 * side, transom_y - 0.020, bumper_z + 0.010))
        p_return = Vector((0.805 * side, transom_y + 0.180, bumper_z + 0.015))

        create_curved_tube(bm_chrome, [p_inner, p_corner, p_return], radius=0.024, segments=12)
        create_oriented_box_between(bm_chrome, p_inner, p_corner, width=0.022, height=0.048)
        create_oriented_box_between(bm_chrome, p_corner, p_return, width=0.022, height=0.046)

        # 2. Vertical Rear Over-Rider with Black Rubber Buffer Strip
        over_pos = Vector((0.440 * side, transom_y - 0.035, bumper_z + 0.010))
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(over_pos) @
                              Matrix.Scale(0.040, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.050, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.150, 4, Vector((0, 0, 1))))
        bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=Matrix.Translation(over_pos - Vector((0, 0.022, 0))) @
                              Matrix.Scale(0.036, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.016, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.136, 4, Vector((0, 0, 1))))

        # Chassis Support Tubes Entering Transom
        create_cylinder_between(bm_chrome, over_pos + Vector((0, 0.020, 0)), over_pos + Vector((0, 0.120, 0.020)), radius=0.014, segments=8)

    # 3. Italian Period License Plate Stamped Steel Frame
    lic_pos = Vector((0.0, transom_y - 0.010, bumper_z + 0.040))
    # Outer chrome rim frame
    bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(lic_pos) @
                          Matrix.Scale(0.380, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.010, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.120, 4, Vector((0, 0, 1))))
    # Black backing plate
    bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=Matrix.Translation(lic_pos + Vector((0, 0.003, 0))) @
                          Matrix.Scale(0.360, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.006, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.105, 4, Vector((0, 0, 1))))

    # 4. Polished Inox Stainless Exhaust Thermal Heat Shield
    # Mounted under rear valance above the dual exhaust tailpipes
    shld_pos = Vector((-0.240, -1.960, 0.290))
    bmesh.ops.create_cube(bm_inox, size=1.0, matrix=Matrix.Translation(shld_pos) @
                          Matrix.Scale(0.240, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.260, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.004, 4, Vector((0, 0, 1))))
    # Thermal standoff brackets
    for brk_x in [-0.340, -0.140]:
        create_cylinder_between(bm_inox, Vector((brk_x, -1.960, 0.290)), Vector((brk_x, -1.960, 0.320)), radius=0.004, segments=6)

    obj_c = link_obj("GEO_Spider_Rear_Bumper_Chrome", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_r = link_obj("GEO_Spider_Rear_Bumper_Rubber", bm_rubber, parent_col, mats["rubber"], bevel=0.001)
    obj_i = link_obj("GEO_Spider_Exhaust_Shield", bm_inox, parent_col, mats["stainless"], bevel=0.0005)
    return [obj_c, obj_r, obj_i]


# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 2F: SCRIPT BADGING, PININFARINA CRESTS & LOCK BARRELS
# ----------------------------------------------------------------------------
def build_authentic_script_badging_and_crests(parent_col, mats):
    """
    Constructs the cursive Alfa Romeo script badging, "Spider Veloce 2000" rear script,
    Pininfarina crowned flank shield badges, and polished chrome lock keyholes.
    """
    bm_script = bmesh.new()
    bm_crown  = bmesh.new()
    bm_locks  = bmesh.new()

    transom_y = -2.048

    # 1. "Alfa Romeo" Cursive Script Badge (Left Rear Transom)
    script_pos_l = Vector((-0.460, transom_y, 0.720))
    # Modeled with continuous swept relief letters
    script_pts_ar = [
        Vector((-0.560, transom_y, 0.710)),
        Vector((-0.530, transom_y, 0.735)),
        Vector((-0.510, transom_y, 0.715)),
        Vector((-0.480, transom_y, 0.728)),
        Vector((-0.450, transom_y, 0.712)),
        Vector((-0.410, transom_y, 0.730)),
        Vector((-0.380, transom_y, 0.710)),
        Vector((-0.350, transom_y, 0.722))
    ]
    create_curved_tube(bm_script, script_pts_ar, radius=0.0028, segments=6)
    # Underscore flourish underline
    create_cylinder_between(bm_script, Vector((-0.560, transom_y, 0.704)), Vector((-0.350, transom_y, 0.704)), radius=0.002, segments=6)

    # 2. "Spider Veloce" & "2000" Badge Script (Right Rear Transom)
    script_pts_sv = [
        Vector((0.360, transom_y, 0.722)),
        Vector((0.390, transom_y, 0.734)),
        Vector((0.420, transom_y, 0.712)),
        Vector((0.450, transom_y, 0.730)),
        Vector((0.480, transom_y, 0.715)),
        Vector((0.520, transom_y, 0.732)),
        Vector((0.560, transom_y, 0.712))
    ]
    create_curved_tube(bm_script, script_pts_sv, radius=0.0028, segments=6)
    create_cylinder_between(bm_script, Vector((0.360, transom_y, 0.704)), Vector((0.560, transom_y, 0.704)), radius=0.002, segments=6)

    # "2000" Chrome Numerals
    for idx, num_x in enumerate([0.430, 0.460, 0.490, 0.520]):
        bmesh.ops.create_cone(bm_script, cap_ends=True, segments=12, radius1=0.009, radius2=0.009, depth=0.003,
                              matrix=Matrix.Translation((num_x, transom_y - 0.002, 0.685)) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))

    # 3. Pininfarina Crowned Crest Badges on Rear Flanks
    # Located on both flanks just ahead of rear wheel arch
    for side in [1.0, -1.0]:
        px = 0.816 * side
        py = -0.580
        pz = 0.620
        # Gilded brass crown atop crest
        bmesh.ops.create_cube(bm_crown, size=1.0, matrix=Matrix.Translation((px, py, pz + 0.016)) @
                              Matrix.Scale(0.003, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.024, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.012, 4, Vector((0, 0, 1))))
        # Blue enamel shield with stylized cursive 'f' (Pininfarina emblem)
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=Matrix.Translation((px, py, pz)) @
                              Matrix.Scale(0.003, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.022, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.024, 4, Vector((0, 0, 1))))
        # Lower cursive "pininfarina" script strip
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=Matrix.Translation((px, py, pz - 0.018)) @
                              Matrix.Scale(0.002, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.052, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.006, 4, Vector((0, 0, 1))))

    # 4. Trunk Lid Key Lock & Push-Button Barrel
    trunk_lock_c = Vector((0.0, transom_y - 0.004, 0.735))
    bmesh.ops.create_cone(bm_locks, cap_ends=True, segments=16, radius1=0.014, radius2=0.014, depth=0.010,
                          matrix=Matrix.Translation(trunk_lock_c) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))
    bmesh.ops.create_cone(bm_locks, cap_ends=True, segments=12, radius1=0.008, radius2=0.008, depth=0.014,
                          matrix=Matrix.Translation(trunk_lock_c - Vector((0, 0.002, 0))) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))
    # Slotted keyway slit
    bmesh.ops.create_cube(bm_crown, size=1.0, matrix=Matrix.Translation(trunk_lock_c - Vector((0, 0.008, 0))) @
                          Matrix.Scale(0.002, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.004, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.008, 4, Vector((0, 0, 1))))

    # 5. Door Lock Tumblers
    for side in [1.0, -1.0]:
        dl_pos = Vector((0.812 * side, 0.420, 0.670))
        bmesh.ops.create_cone(bm_locks, cap_ends=True, segments=12, radius1=0.011, radius2=0.011, depth=0.008,
                              matrix=Matrix.Translation(dl_pos) @ Matrix.Rotation(math.radians(90.0 * side), 4, 'Z'))

    obj_s = link_obj("GEO_Spider_Script_Badges", bm_script, parent_col, mats["chrome"], bevel=0.0005)
    obj_c = link_obj("GEO_Spider_Crest_Gold", bm_crown, parent_col, mats["badge_gold"], bevel=0.0005)
    obj_l = link_obj("GEO_Spider_Lock_Tumblers", bm_locks, parent_col, mats["chrome"], bevel=0.0005)
    return [obj_s, obj_c, obj_l]


# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 2G: SCULPTED WHEEL ARCH FLANGES & WAISTLINE BRIGHTWORK
# ----------------------------------------------------------------------------
def build_wheel_arch_flanges_and_side_trim(parent_col, mats):
    """
    Constructs authentic semicircular rolled wheel arch lip mouldings that frame
    the front and rear wheels, the continuous polished aluminum waistline rubbing
    strip with black neoprene inlay, and polished stainless rocker sill plates.
    """
    bm_flange = bmesh.new()
    bm_trim   = bmesh.new()
    bm_rubber = bmesh.new()

    # 1. Front and Rear Semicircular Wheel Arch Lip Flanges
    # Front Axle Y = +1.125, Rear Axle Y = -1.125, Wheel Radius = 0.307 m
    arch_configs = [
        # (center_y, center_z, inner_r, outer_r, name)
        ( 1.125, 0.307, 0.345, 0.368, "Front"),
        (-1.125, 0.307, 0.340, 0.362, "Rear"),
    ]

    for side in [1.0, -1.0]:
        sx = 0.812 * side

        for ay, az, r_in, r_out, name in arch_configs:
            # Semicircular arc points from 0 to pi radians
            steps = 28
            arc_pts = []
            for i in range(steps + 1):
                ang = math.pi * (i / steps)
                dy = math.cos(ang) * r_out
                dz = math.sin(ang) * r_out
                arc_pts.append(Vector((sx, ay + dy, az + dz)))

            # Rolled chrome/painted outer bead moulding
            create_curved_tube(bm_flange, arc_pts, radius=0.007, segments=8)

            # Stepped inner return lip curling into the wheel well
            for i in range(steps):
                p1 = arc_pts[i]
                p2 = arc_pts[i + 1]
                p1_in = p1 - Vector((0.024 * side, 0, 0))
                p2_in = p2 - Vector((0.024 * side, 0, 0))
                create_oriented_box_between(bm_flange, p1, p2, width=0.016, height=0.010)
                create_cylinder_between(bm_flange, p1_in, p2_in, radius=0.004, segments=6)

        # 2. Continuous Waistline Flank Rubbing Strip with Black Neoprene Inlay
        # Runs inside Pininfarina scalloped waistline groove from Y = 1.850 to Y = -1.980
        flank_pts = [
            Vector((0.770 * side,  1.840, 0.620)),
            Vector((0.805 * side,  1.125, 0.650)),
            Vector((0.816 * side,  0.000, 0.665)),
            Vector((0.805 * side, -1.125, 0.650)),
            Vector((0.760 * side, -1.980, 0.620))
        ]
        # Aluminum extrusion base carrier
        create_curved_tube(bm_trim, flank_pts, radius=0.008, segments=8)
        # Black neoprene impact rubber center strip
        create_curved_tube(bm_rubber, flank_pts, radius=0.0045, segments=6)

        # Chrome Speartip End-Caps
        bmesh.ops.create_cone(bm_trim, cap_ends=True, segments=10, radius1=0.009, radius2=0.002, depth=0.020,
                              matrix=Matrix.Translation(flank_pts[0]) @ Matrix.Rotation(math.radians(-90.0), 4, 'X'))
        bmesh.ops.create_cone(bm_trim, cap_ends=True, segments=10, radius1=0.009, radius2=0.002, depth=0.020,
                              matrix=Matrix.Translation(flank_pts[-1]) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))

        # 3. Polished Stainless Steel Rocker Panel Sill Trim
        # Located along bottom rocker seam between front and rear wheel arches
        sill_y_f = 0.760
        sill_y_r = -0.760
        sill_z   = 0.165
        sill_x   = 0.770 * side
        create_oriented_box_between(bm_trim,
                                    Vector((sill_x, sill_y_f, sill_z)),
                                    Vector((sill_x, sill_y_r, sill_z)),
                                    width=0.018, height=0.038)
        # Fastening rivet heads along lower sill flange
        for r_idx in range(-6, 7):
            ry = r_idx * 0.110
            bmesh.ops.create_cone(bm_trim, cap_ends=True, segments=6, radius1=0.003, radius2=0.003, depth=0.004,
                                  matrix=Matrix.Translation((sill_x + 0.008 * side, ry, sill_z - 0.012)) @
                                  Matrix.Rotation(math.radians(90.0 * side), 4, 'Y'))

    obj_f = link_obj("GEO_Spider_Arch_Flanges", bm_flange, parent_col, mats["chrome"], bevel=0.001)
    obj_t = link_obj("GEO_Spider_Waistline_Trim", bm_trim, parent_col, mats["chrome"], bevel=0.0005)
    obj_r = link_obj("GEO_Spider_Trim_Rubber", bm_rubber, parent_col, mats["rubber"], bevel=0.0005)
    return [obj_f, obj_t, obj_r]


# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 2H: FLUSH PULL FLAP DOOR HANDLES & EXTERIOR HARDWARE
# ----------------------------------------------------------------------------
def build_flush_door_handles_and_hardware(parent_col, mats):
    """
    Constructs the signature Alfa Romeo aerodynamic flush pull-flap door handles,
    recessed escutcheon pockets, spring-loaded finger pull paddles, and waistline
    chrome window felt scraper strips.
    """
    bm_chrome = bmesh.new()
    bm_pocket = bmesh.new()

    for side in [1.0, -1.0]:
        hx = 0.814 * side
        hy = 0.280
        hz = 0.675

        h_center = Vector((hx, hy, hz))

        # 1. Recessed Escutcheon Finger Pocket
        # Cast metal escutcheon plate recessed into door skin
        bmesh.ops.create_cube(bm_pocket, size=1.0, matrix=Matrix.Translation(h_center) @
                              Matrix.Scale(0.018, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.125, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.046, 4, Vector((0, 0, 1))))

        # Outer Chrome Bezel Surround Frame
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(h_center + Vector((0.004 * side, 0, 0))) @
                              Matrix.Scale(0.006, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.138, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.056, 4, Vector((0, 0, 1))))

        # 2. Hinged Pull-Up Finger Paddle (Flush flap)
        # Hinged at the top, pulled outward to unlatch door
        paddle_c = h_center + Vector((0.002 * side, 0.005, 0.004))
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(paddle_c) @
                              Matrix.Rotation(math.radians(-6.0 * side), 4, 'Y') @
                              Matrix.Scale(0.008, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.095, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.032, 4, Vector((0, 0, 1))))

        # Paddle Finger Grip Recess Lip on Lower Edge
        bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=8, radius=0.003, depth=0.088,
                                  matrix=Matrix.Translation(paddle_c - Vector((0, 0, 0.016))) @
                                  Matrix.Rotation(math.radians(90.0), 4, 'Y'))

        # 3. Cockpit Coaming Perimeter Chrome Finishing Bead
        # Traces top perimeter edge of door coaming
        coam_y_f = 0.580
        coam_y_r = -0.520
        create_oriented_box_between(bm_chrome,
                                    Vector((0.785 * side, coam_y_f, 0.772)),
                                    Vector((0.785 * side, coam_y_r, 0.772)),
                                    width=0.014, height=0.006)

    obj_c = link_obj("GEO_Spider_Door_Handles_Chrome", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)
    obj_p = link_obj("GEO_Spider_Door_Pockets", bm_pocket, parent_col, mats["rubber"], bevel=0.0005)
    return [obj_c, obj_p]


# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 2I: VENT WINGS, BULLET MIRRORS & SUN VISORS
# ----------------------------------------------------------------------------
def build_vent_wings_and_bullet_mirrors(parent_col, mats):
    """
    Constructs triangular front quarter vent windows with chrome perimeter frames
    and pivot latches, driver-side Vitaloni Californian chrome bullet mirror,
    and windshield header sun visors with smoked acrylic leaves.
    """
    bm_chrome = bmesh.new()
    bm_glass  = bmesh.new()
    bm_mirror = bmesh.new()

    for side in [1.0, -1.0]:
        # 1. Triangular Quarter Vent Wing Frame & Glass
        # Base on door coaming, vertical A-pillar post, raked hypotenuse
        p_base_front = Vector((0.680 * side, 0.540, 0.810))
        p_base_rear  = Vector((0.770 * side, 0.320, 0.805))
        p_apex       = Vector((0.640 * side, 0.320, 1.120))

        # Chrome tubular frame perimeter
        create_curved_tube(bm_chrome, [p_base_front, p_apex, p_base_rear, p_base_front], radius=0.005, segments=8)
        # Clear optical glass pane filling the triangle
        v1 = bm_glass.verts.new(p_base_front)
        v2 = bm_glass.verts.new(p_apex)
        v3 = bm_glass.verts.new(p_base_rear)
        bm_glass.faces.new((v1, v2, v3))
        # Inner reverse face for double-sided thickness
        v1_in = bm_glass.verts.new(p_base_front - Vector((0.003 * side, 0, 0)))
        v2_in = bm_glass.verts.new(p_apex - Vector((0.003 * side, 0, 0)))
        v3_in = bm_glass.verts.new(p_base_rear - Vector((0.003 * side, 0, 0)))
        bm_glass.faces.new((v3_in, v2_in, v1_in))

        # Chrome Swivel Latch Handle on Lower Trailing Edge
        latch_pos = p_base_rear + Vector((-0.015 * side, 0, 0.025))
        bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=8, radius1=0.006, radius2=0.006, depth=0.014,
                              matrix=Matrix.Translation(latch_pos) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(latch_pos + Vector((-0.012 * side, -0.010, 0))) @
                              Matrix.Scale(0.008, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.024, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.006, 4, Vector((0, 0, 1))))

        # 2. Windshield Header Smoked Acrylic Sun Visor (Inside windshield)
        visor_w = 0.280
        visor_h = 0.090
        visor_c = Vector((0.360 * side, 0.260, 1.150))
        # Smoked acrylic leaf
        bmesh.ops.create_cube(bm_glass, size=1.0, matrix=Matrix.Translation(visor_c) @
                              Matrix.Rotation(math.radians(28.0), 4, 'X') @
                              Matrix.Scale(visor_w, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.003, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(visor_h, 4, Vector((0, 0, 1))))
        # Chrome pivot hinge rod
        create_cylinder_between(bm_chrome,
                                visor_c + Vector((-visor_w*0.5, 0.025, visor_h*0.45)),
                                visor_c + Vector(( visor_w*0.5, 0.025, visor_h*0.45)),
                                radius=0.003, segments=6)

    # 3. Vitaloni / Californian Chrome Aerodynamic Bullet Mirror (Driver LHD Side, Left)
    # Authentic period Italian bullet housing on triangular door pedestal
    mir_ped = Vector((0.785, 0.420, 0.790))
    # Streamlined base pedestal
    bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=12, radius1=0.018, radius2=0.010, depth=0.035,
                          matrix=Matrix.Translation(mir_ped) @ Matrix.Rotation(math.radians(-15.0), 4, 'Y'))
    # Bullet torpedo shell
    bullet_c = mir_ped + Vector((0.035, -0.020, 0.040))
    bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=20, radius1=0.045, radius2=0.015, depth=0.110,
                          matrix=Matrix.Translation(bullet_c) @ Matrix.Rotation(math.radians(-90.0), 4, 'X'))
    # Hemispherical nose cone
    bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=16, radius1=0.015, radius2=0.002, depth=0.025,
                          matrix=Matrix.Translation(bullet_c + Vector((0, 0.065, 0))) @ Matrix.Rotation(math.radians(-90.0), 4, 'X'))
    # Flat mirror glass face on rear opening
    bmesh.ops.create_cone(bm_mirror, cap_ends=True, segments=20, radius1=0.042, radius2=0.042, depth=0.004,
                          matrix=Matrix.Translation(bullet_c - Vector((0, 0.052, 0))) @ Matrix.Rotation(math.radians(-90.0), 4, 'X'))
    # Chrome retaining lip around mirror glass
    bmesh.ops.create_torus(bm_chrome, major_radius=0.044, minor_radius=0.0025, major_segments=20, minor_segments=6,
                           matrix=Matrix.Translation(bullet_c - Vector((0, 0.052, 0))) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))

    obj_c = link_obj("GEO_Spider_Vent_Wings_Chrome", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_g = link_obj("GEO_Spider_Vent_Wings_Glass", bm_glass, parent_col, mats["headlamp_glass"], bevel=0.0005)
    obj_m = link_obj("GEO_Spider_Mirror_Glass", bm_mirror, parent_col, mats["reflector_mirror"], bevel=0.0)
    return [obj_c, obj_g, obj_m]


# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 2J: HOOD & COWL JEWELRY, WASHER NOZZLES & WIPERS
# ----------------------------------------------------------------------------
def build_hood_cowl_jewelry_and_wipers(parent_col, mats):
    """
    Constructs the stamped cowl ventilation slots with wire mesh screen underlay,
    twin polished chrome washer nozzles, articulated pantograph wiper arms,
    and hood latch safety catches.
    """
    bm_chrome = bmesh.new()
    bm_rubber = bmesh.new()

    cowl_y = 0.580
    cowl_z = 0.812

    # 1. Stamped Cowl Screen Air Intake Vents
    # 20 fine air louvers across cowl trough
    for idx in range(-10, 10):
        vx = idx * 0.038 + 0.019
        create_oriented_box_between(bm_chrome,
                                    Vector((vx - 0.014, cowl_y, cowl_z)),
                                    Vector((vx + 0.014, cowl_y, cowl_z)),
                                    width=0.004, height=0.008)
        # Recessed black drainage basin under cowl
        bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=Matrix.Translation((vx, cowl_y, cowl_z - 0.010)) @
                              Matrix.Scale(0.034, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.018, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.006, 4, Vector((0, 0, 1))))

    # 2. Dual Polished Chrome Twin-Orifice Washer Nozzles
    for side in [1.0, -1.0]:
        wx = 0.280 * side
        w_pos = Vector((wx, cowl_y + 0.035, cowl_z + 0.005))
        # Chrome jet dome
        bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=10, radius1=0.006, radius2=0.004, depth=0.008,
                              matrix=Matrix.Translation(w_pos))
        # Twin brass micro-orifices angled toward windshield
        for o_ang in [-12.0, 12.0]:
            bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=6, radius1=0.0012, radius2=0.0012, depth=0.004,
                                  matrix=Matrix.Translation(w_pos + Vector((0, -0.003, 0.004))) @
                                  Matrix.Rotation(math.radians(-35.0), 4, 'X') @
                                  Matrix.Rotation(math.radians(o_ang), 4, 'Z'))

    # 3. Articulated Stainless Wiper Arms & Ribbed Rubber Squeegees
    # Left hand drive Alfa Romeo Spider dual wiper arms parked to the right
    wiper_pivots = [
        Vector((-0.340, cowl_y - 0.020, cowl_z + 0.015)),
        Vector(( 0.060, cowl_y - 0.020, cowl_z + 0.015))
    ]

    for p_idx, piv in enumerate(wiper_pivots):
        # Hexagonal mounting nut collar
        bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=6, radius1=0.012, radius2=0.012, depth=0.010,
                              matrix=Matrix.Translation(piv))
        # Articulated spring knuckle joint
        knuckle_c = piv + Vector((0, 0, 0.012))
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(knuckle_c) @
                              Matrix.Scale(0.015, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.018, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.012, 4, Vector((0, 0, 1))))

        # Lower spring-loaded arm section
        p_knuckle = knuckle_c + Vector((0.005, -0.008, 0.005))
        p_wrist   = p_knuckle + Vector((0.140, -0.025, 0.020))
        p_blade_c = p_wrist   + Vector((0.180, -0.035, 0.025))
        create_curved_tube(bm_chrome, [p_knuckle, p_wrist, p_blade_c], radius=0.0035, segments=6)

        # Wiper Blade Claw Bridge Carrier (15-inch vintage blade)
        half_bl = 0.170
        p_bl1 = p_blade_c + Vector((-half_bl * 0.94, half_bl * 0.22, -half_bl * 0.12))
        p_bl2 = p_blade_c + Vector(( half_bl * 0.94, -half_bl * 0.22, half_bl * 0.12))
        create_oriented_box_between(bm_chrome, p_bl1, p_bl2, width=0.007, height=0.009)

        # 4 Claws gripping the backing strip
        for claw_f in [0.25, 0.45, 0.65, 0.85]:
            pc = p_bl1 * (1.0 - claw_f) + p_bl2 * claw_f
            bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(pc - Vector((0, 0, 0.004))) @
                                  Matrix.Scale(0.008, 4, Vector((1, 0, 0))) @
                                  Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                                  Matrix.Scale(0.006, 4, Vector((0, 0, 1))))

        # Flexible Rubber Squeegee Strip
        p_sq1 = p_bl1 - Vector((0, 0, 0.006))
        p_sq2 = p_bl2 - Vector((0, 0, 0.006))
        create_oriented_box_between(bm_rubber, p_sq1, p_sq2, width=0.0035, height=0.005)

    # 4. Hood Safety Catch Hook & Front Bump Stops
    bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=8, radius1=0.006, radius2=0.004, depth=0.045,
                          matrix=Matrix.Translation((0.0, 1.980, 0.530)))
    for side in [1.0, -1.0]:
        bmesh.ops.create_cone(bm_rubber, cap_ends=True, segments=8, radius1=0.009, radius2=0.006, depth=0.012,
                              matrix=Matrix.Translation((0.550 * side, 1.880, 0.620)))

    obj_c = link_obj("GEO_Spider_Wipers_Jewelry", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)
    obj_r = link_obj("GEO_Spider_Wiper_Blades", bm_rubber, parent_col, mats["rubber"], bevel=0.0005)
    return [obj_c, obj_r]


# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 2K: SUSPENSION DROP LINKS, KONI DAMPERS & BRAKE LINES
# ----------------------------------------------------------------------------
def build_chassis_suspension_details_and_brake_lines(parent_col, mats):
    """
    Constructs the front anti-roll bar spherical drop links with polyurethane bushings,
    telescopic Koni Sport vermilion red dampers, braided stainless brake lines,
    copper-nickel hardline plumbing with brass union tees, and handbrake cables.
    """
    bm_koni   = bmesh.new()
    bm_chrome = bmesh.new()
    bm_pipes  = bmesh.new()

    f_axle = 1.125
    r_axle = -1.125

    # 1. Front Anti-Roll Bar Droplinks with Polyurethane Bushings & Castle Nuts
    for side in [1.0, -1.0]:
        sx = 0.520 * side
        dl_top = Vector((sx, f_axle - 0.080, 0.330))
        dl_bot = Vector((sx, f_axle - 0.040, 0.235))

        # Central threaded connecting rod
        create_cylinder_between(bm_chrome, dl_top, dl_bot, radius=0.005, segments=8)
        # Polyurethane red/yellow cushioning donuts
        for b_pos in [dl_top, (dl_top + dl_bot)*0.5, dl_bot]:
            bmesh.ops.create_cone(bm_koni, cap_ends=True, segments=12, radius1=0.012, radius2=0.012, depth=0.014,
                                  matrix=Matrix.Translation(b_pos))
            # Steel backup washer
            bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=10, radius1=0.014, radius2=0.014, depth=0.003,
                                  matrix=Matrix.Translation(b_pos + Vector((0, 0, 0.008))))

        # Castellated Hex Nut & Cotter Pin at bottom
        bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=6, radius1=0.008, radius2=0.008, depth=0.008,
                              matrix=Matrix.Translation(dl_bot - Vector((0, 0, 0.008))))

    # 2. Telescopic Koni Sport Vermilion Red Shock Absorbers (Front and Rear)
    damper_configs = [
        # (x, y, top_z, bot_z, name)
        ( 0.440,  f_axle, 0.480, 0.250, "Front"),
        ( 0.460,  r_axle, 0.510, 0.240, "Rear"),
    ]

    for side in [1.0, -1.0]:
        for dx, dy, z_top, z_bot, name in damper_configs:
            p_top = Vector((dx * side, dy, z_top))
            p_bot = Vector((dx * side, dy, z_bot))

            # Lower red damper body cylinder
            p_mid = (p_top + p_bot) * 0.5
            create_cylinder_between(bm_koni, p_bot, p_mid, radius=0.024, segments=12)

            # Polished chrome damper piston shaft
            create_cylinder_between(bm_chrome, p_mid, p_top, radius=0.011, segments=10)

            # Accordion rubber dust gaiter / boot covering upper stroke
            for g_step in range(4):
                gz = p_mid.z + (g_step + 0.5) * (p_top.z - p_mid.z) * 0.25
                bmesh.ops.create_torus(bm_koni, major_radius=0.019, minor_radius=0.004,
                                       major_segments=12, minor_segments=6,
                                       matrix=Matrix.Translation((dx * side, dy, gz)))

            # Eyelet mounting bushings with through-bolts
            bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=12, radius1=0.016, radius2=0.016, depth=0.038,
                                  matrix=Matrix.Translation(p_top) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))
            bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=12, radius1=0.016, radius2=0.016, depth=0.038,
                                  matrix=Matrix.Translation(p_bot) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))

    # 3. Braided Stainless Front Brake Lines & Copper-Nickel Hardline Piping
    # Front wheel caliper feed lines
    for side in [1.0, -1.0]:
        p_caliper = Vector((0.590 * side, f_axle, 0.310))
        p_inner_chassis = Vector((0.420 * side, f_axle + 0.080, 0.380))
        p_mid_curve = (p_caliper + p_inner_chassis)*0.5 + Vector((0, -0.040, -0.030))
        # Flexible braided stainless steel hydraulic line with slack for steering
        create_curved_tube(bm_chrome, [p_caliper, p_mid_curve, p_inner_chassis], radius=0.005, segments=8)
        # Brass banjo fitting at caliper end
        bmesh.ops.create_cone(bm_pipes, cap_ends=True, segments=10, radius1=0.009, radius2=0.009, depth=0.014,
                              matrix=Matrix.Translation(p_caliper))

    # Copper-nickel main brake line running along right chassis rail to rear axle
    p_master_cyl = Vector((-0.280, 0.720, 0.560))
    p_tee_front  = Vector((-0.280, 0.950, 0.420))
    p_rail_front = Vector((-0.340, 0.650, 0.320))
    p_rail_mid   = Vector((-0.340, 0.000, 0.320))
    p_rail_rear  = Vector((-0.340, -1.050, 0.330))
    p_rear_tee   = Vector(( 0.000, -1.120, 0.360))
    create_curved_tube(bm_pipes, [p_master_cyl, p_tee_front, p_rail_front, p_rail_mid, p_rail_rear, p_rear_tee], radius=0.0035, segments=6)

    # Brass 3-Way Distribution Tee on Rear Axle Housing
    bmesh.ops.create_cube(bm_pipes, size=1.0, matrix=Matrix.Translation(p_rear_tee) @
                          Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.018, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.018, 4, Vector((0, 0, 1))))
    # Left and right axle brake hardlines to rear drums/calipers
    for side in [1.0, -1.0]:
        p_axle_cal = Vector((0.540 * side, -1.125, 0.315))
        create_curved_tube(bm_pipes, [p_rear_tee, (p_rear_tee + p_axle_cal)*0.5 + Vector((0, 0.020, 0.010)), p_axle_cal], radius=0.003, segments=6)

    # 4. Emergency Handbrake Equalizer Cable & Balancing Clevis
    hb_clevis = Vector((0.0, -0.420, 0.315))
    bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(hb_clevis) @
                          Matrix.Scale(0.045, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.018, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.012, 4, Vector((0, 0, 1))))
    # Twin braided steel cables diverging to rear trailing arms
    for side in [1.0, -1.0]:
        p_cable_end = Vector((0.480 * side, -1.020, 0.285))
        create_curved_tube(bm_chrome, [hb_clevis, (hb_clevis + p_cable_end)*0.5 - Vector((0,0,0.015)), p_cable_end], radius=0.0035, segments=6)

    obj_k = link_obj("GEO_Spider_Koni_Dampers", bm_koni, parent_col, mats["koni_red"], bevel=0.001)
    obj_c = link_obj("GEO_Spider_Susp_Hardware", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)
    obj_p = link_obj("GEO_Spider_Brake_Pipes", bm_pipes, parent_col, mats["copper_zinc"], bevel=0.0005)
    return [obj_k, obj_c, obj_p]


# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 2L: FOLDED SOFT-TOP TONNEAU BOOT & TENAX FASTENERS
# ----------------------------------------------------------------------------
def build_tonneau_boot_and_fasteners(parent_col, mats):
    """
    Constructs the stitched black vinyl tonneau boot envelope covering the folded
    convertible top stack, perimeter piping bead, 10 chrome Tenax / Lift-The-Dot
    snap fasteners, and chrome soft-top frame folding scissor joints.
    """
    bm_vinyl  = bmesh.new()
    bm_chrome = bmesh.new()

    # 1. Stitched Vinyl Tonneau Boot Envelope
    # Drapes tightly over the folded roof frame behind cockpit seats
    tonneau_y_f = -0.420
    tonneau_y_r = -0.880
    tonneau_z_c = 0.815
    tonneau_w   = 1.340

    # Curved upholstered tonneau top surface
    bmesh.ops.create_cube(bm_vinyl, size=1.0, matrix=Matrix.Translation((0.0, (tonneau_y_f + tonneau_y_r)*0.5, tonneau_z_c)) @
                          Matrix.Scale(tonneau_w, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(tonneau_y_f - tonneau_y_r, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.052, 4, Vector((0, 0, 1))))

    # Front rolled coaming flap overlapping the cockpit rear trim
    create_oriented_box_between(bm_vinyl,
                                Vector((-tonneau_w*0.5, tonneau_y_f, tonneau_z_c + 0.015)),
                                Vector(( tonneau_w*0.5, tonneau_y_f, tonneau_z_c + 0.015)),
                                width=0.038, height=0.018)

    # Perimeter Stitched Piping Bead
    piping_pts = [
        Vector((-tonneau_w*0.5, tonneau_y_f, tonneau_z_c + 0.010)),
        Vector((-tonneau_w*0.5, tonneau_y_r, tonneau_z_c + 0.010)),
        Vector((0.0,            tonneau_y_r - 0.030, tonneau_z_c + 0.010)),
        Vector(( tonneau_w*0.5, tonneau_y_r, tonneau_z_c + 0.010)),
        Vector(( tonneau_w*0.5, tonneau_y_f, tonneau_z_c + 0.010)),
    ]
    create_curved_tube(bm_vinyl, piping_pts, radius=0.005, segments=8)

    # 2. 10 Chrome Tenax / Lift-The-Dot Quick-Release Snap Fasteners
    # Arranged along the perimeter of the rear deck coaming
    tenax_positions = [
        # Left side rail
        Vector((-0.680, -0.460, 0.778)),
        Vector((-0.680, -0.620, 0.778)),
        Vector((-0.680, -0.780, 0.776)),
        # Rear deck arc
        Vector((-0.460, -0.890, 0.776)),
        Vector((-0.220, -0.910, 0.776)),
        Vector(( 0.000, -0.920, 0.776)),
        Vector(( 0.220, -0.910, 0.776)),
        Vector(( 0.460, -0.890, 0.776)),
        # Right side rail
        Vector(( 0.680, -0.780, 0.776)),
        Vector(( 0.680, -0.620, 0.778)),
        Vector(( 0.680, -0.460, 0.778)),
    ]

    for t_pos in tenax_positions:
        # Chrome knurled circular stud base
        bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=12, radius1=0.008, radius2=0.008, depth=0.004,
                              matrix=Matrix.Translation(t_pos))
        # Center spring-loaded release pin peg
        bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=8, radius1=0.004, radius2=0.004, depth=0.008,
                              matrix=Matrix.Translation(t_pos + Vector((0, 0, 0.004))))

    # 3. Chrome Soft-Top Frame Scissor Hinges & Pivot Brackets (B-pillar area)
    for side in [1.0, -1.0]:
        px = 0.660 * side
        p_hinge = Vector((px, -0.380, 0.740))
        # Base pivot plate
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(p_hinge) @
                              Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.035, 4, Vector((0, 0, 1))))
        # Articulated scissor links
        p_link1 = p_hinge + Vector((-0.020 * side, -0.080, 0.040))
        p_link2 = p_link1 + Vector((0, -0.120, -0.020))
        create_oriented_box_between(bm_chrome, p_hinge, p_link1, width=0.008, height=0.014)
        create_oriented_box_between(bm_chrome, p_link1, p_link2, width=0.008, height=0.014)
        # Pivot rivets
        for piv_c in [p_hinge, p_link1, p_link2]:
            bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=8, radius1=0.005, radius2=0.005, depth=0.016,
                                  matrix=Matrix.Translation(piv_c) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))

    obj_v = link_obj("GEO_Spider_Tonneau_Boot", bm_vinyl, parent_col, mats["vinyl_tonneau"], bevel=0.001)
    obj_c = link_obj("GEO_Spider_Tonneau_Hardware", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)
    return [obj_v, obj_c]


# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 2M: DUAL EXHAUST TAILPIPES & UNDERBODY HEAT SHIELDING
# ----------------------------------------------------------------------------
def build_dual_exhaust_tips_and_heat_shields(parent_col, mats):
    """
    Constructs the twin polished Inox exhaust tailpipes exiting beneath the rear
    valance with rolled lips and dark internal bores, dimpled aluminum heat
    shields lining the transmission tunnel, and finned rear differential cover.
    """
    bm_tips = bmesh.new()
    bm_soot = bmesh.new()
    bm_inox = bmesh.new()
    bm_diff = bmesh.new()

    # 1. Twin Polished Inox Exhaust Tailpipes
    # Exits on the left hand side below rear valance, angled slightly downward & outward
    tip_y_start = -1.880
    tip_y_end   = -2.075
    tip_z_start = 0.250
    tip_z_end   = 0.235
    tip_rad     = 0.026

    for tip_idx, tx in enumerate([-0.220, -0.285]):
        p_start = Vector((tx + 0.010, tip_y_start, tip_z_start))
        p_end   = Vector((tx,         tip_y_end,   tip_z_end))

        # Polished Inox outer pipe
        create_cylinder_between(bm_tips, p_start, p_end, radius=tip_rad, segments=16)

        # Stepped rolled outer edge lip
        rot_mat = Matrix.Translation(p_end) @ Matrix.Rotation(math.radians(-6.0), 4, 'X')
        bmesh.ops.create_torus(bm_tips, major_radius=tip_rad, minor_radius=0.0025,
                               major_segments=16, minor_segments=6, matrix=rot_mat)

        # Dark soot internal bore disc recessed inside tip
        bmesh.ops.create_cone(bm_soot, cap_ends=True, segments=14, radius1=tip_rad * 0.88, radius2=tip_rad * 0.88, depth=0.004,
                              matrix=rot_mat @ Matrix.Translation((0, 0.010, 0)) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))

        # Exhaust Hanger Bracket & Rubber Donut
        h_pos = p_start + Vector((0, -0.040, 0.045))
        bmesh.ops.create_torus(bm_soot, major_radius=0.018, minor_radius=0.006, major_segments=12, minor_segments=6,
                               matrix=Matrix.Translation(h_pos) @ Matrix.Rotation(math.radians(90.0), 4, 'Y'))
        # Steel mounting prongs
        create_cylinder_between(bm_tips, h_pos - Vector((0.025, 0, 0)), h_pos + Vector((0.025, 0, 0)), radius=0.004, segments=6)

    # 2. Dimpled Aluminum Underbody Tunnel Thermal Insulation Shield
    # Lines the driveshaft / exhaust tunnel from gearbox to rear axle
    tunnel_steps = 14
    for i in range(tunnel_steps):
        ty = 0.350 - i * 0.100
        tz = 0.360
        bmesh.ops.create_cube(bm_inox, size=1.0, matrix=Matrix.Translation((0.0, ty, tz)) @
                              Matrix.Scale(0.260, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.088, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.003, 4, Vector((0, 0, 1))))
        # Dimpled stiffening corrugations
        for dx in [-0.080, 0.0, 0.080]:
            bmesh.ops.create_icosphere(bm_inox, subdivisions=1, radius=0.008,
                                       matrix=Matrix.Translation((dx, ty, tz - 0.003)))

    # 3. Cast Differential Cover with Horizontal Cooling Fins
    diff_pos = Vector((0.0, -1.125, 0.305))
    # Cast aluminum rear inspection cover
    bmesh.ops.create_cone(bm_diff, cap_ends=True, segments=16, radius1=0.075, radius2=0.065, depth=0.035,
                          matrix=Matrix.Translation(diff_pos - Vector((0, 0.040, 0))) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))
    # 5 Horizontal Differential Cooling Ribs
    for fin_idx in range(-2, 3):
        fz = diff_pos.z + fin_idx * 0.016
        bmesh.ops.create_cube(bm_diff, size=1.0, matrix=Matrix.Translation((diff_pos.x, diff_pos.y - 0.060, fz)) @
                              Matrix.Scale(0.110, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.016, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.004, 4, Vector((0, 0, 1))))

    # Drain Plug Bolt at bottom of differential
    bmesh.ops.create_cone(bm_tips, cap_ends=True, segments=6, radius1=0.010, radius2=0.010, depth=0.008,
                          matrix=Matrix.Translation((diff_pos.x, diff_pos.y - 0.020, diff_pos.z - 0.075)))

    obj_t = link_obj("GEO_Spider_Exhaust_Tips", bm_tips, parent_col, mats["stainless"], bevel=0.0005)
    obj_s = link_obj("GEO_Spider_Exhaust_Soot", bm_soot, parent_col, mats["exhaust_soot"], bevel=0.0)
    obj_i = link_obj("GEO_Spider_Tunnel_Shield", bm_inox, parent_col, mats["stainless"], bevel=0.0005)
    obj_d = link_obj("GEO_Spider_Diff_Fins", bm_diff, parent_col, mats["chrome"], bevel=0.0005)
    return [obj_t, obj_s, obj_i, obj_d]


# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 2N: HOMOLOGATION DATA PLATES & CHASSIS VIN TAGS
# ----------------------------------------------------------------------------
def build_chassis_homologation_and_engine_bay_plates(parent_col, mats):
    """
    Constructs the stamped aluminum chassis VIN plate, Tipo 115.02 vehicle
    homologation specification tag on the inner firewall, and paint code decal.
    """
    bm_plates = bmesh.new()
    bm_stamps = bmesh.new()

    firewall_y = 0.730
    firewall_z = 0.680

    # 1. Alfa Romeo Tipo 115.02 Main Homologation Specification Tag
    # Stamped anodized aluminum plate riveted to firewall right side
    tag_pos = Vector((0.260, firewall_y, firewall_z))
    bmesh.ops.create_cube(bm_plates, size=1.0, matrix=Matrix.Translation(tag_pos) @
                          Matrix.Scale(0.125, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.003, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.075, 4, Vector((0, 0, 1))))
    # Corner rivets
    for rx in [-0.055, 0.055]:
        for rz in [-0.030, 0.030]:
            bmesh.ops.create_cone(bm_plates, cap_ends=True, segments=6, radius1=0.003, radius2=0.003, depth=0.005,
                                  matrix=Matrix.Translation((tag_pos.x + rx, tag_pos.y + 0.002, tag_pos.z + rz)) @
                                  Matrix.Rotation(math.radians(90.0), 4, 'X'))
    # Stamped text relief lines on plate
    for l_idx in range(-3, 4):
        create_cylinder_between(bm_stamps,
                                Vector((tag_pos.x - 0.048, tag_pos.y - 0.002, tag_pos.z + l_idx * 0.008)),
                                Vector((tag_pos.x + 0.048, tag_pos.y - 0.002, tag_pos.z + l_idx * 0.008)),
                                radius=0.0008, segments=4)

    # 2. Chassis VIN Plate (Tipo AR 115.02 *0002145*)
    vin_pos = Vector((0.110, firewall_y, firewall_z - 0.020))
    bmesh.ops.create_cube(bm_plates, size=1.0, matrix=Matrix.Translation(vin_pos) @
                          Matrix.Scale(0.140, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.003, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.028, 4, Vector((0, 0, 1))))
    # Stamped VIN numerals relief
    create_cylinder_between(bm_stamps,
                            Vector((vin_pos.x - 0.060, vin_pos.y - 0.002, vin_pos.z)),
                            Vector((vin_pos.x + 0.060, vin_pos.y - 0.002, vin_pos.z)),
                            radius=0.001, segments=4)

    # 3. Pininfarina Paint Code Decal ("Rosso Alfa AR 501") in trunk
    paint_tag_pos = Vector((-0.240, -1.020, 0.720))
    bmesh.ops.create_cube(bm_plates, size=1.0, matrix=Matrix.Translation(paint_tag_pos) @
                          Matrix.Scale(0.065, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.002, 4, Vector((0, 0, 1))))

    obj_p = link_obj("GEO_Spider_VIN_Plates", bm_plates, parent_col, mats["stainless"], bevel=0.0005)
    obj_s = link_obj("GEO_Spider_Plate_Stamps", bm_stamps, parent_col, mats["chrome"], bevel=0.0)
    return [obj_p, obj_s]


# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 2O: CAMPAGNOLO TURBINA WHEEL MICRO-JEWELRY & BRAKE DISCS
# ----------------------------------------------------------------------------
def build_campagnolo_turbina_wheel_micro_jewelry(parent_col, mats):
    """
    Constructs Class-A micro-details for the four 14-inch Campagnolo Turbina wheels:
    - 16 directional cooling turbine vane camber profiles with fillet chamfers.
    - Central hub dust cap with multi-color Milanese cross-and-serpent enamel medallion.
    - 5 recessed chrome acorn wheel lug nuts with spherical seating washers.
    - Schrader tire valve stems with brass threaded cores and knurled dust caps.
    - Cross-drilled ventilated brake rotors with ATE twin-piston calipers & pad clips.
    """
    bm_wheel = bmesh.new()
    bm_badge = bmesh.new()
    bm_brake = bmesh.new()

    f_axle = 1.125
    r_axle = -1.125
    f_track = 0.662
    r_track = 0.637
    wheel_r = 0.307

    wheel_positions = [
        ( f_track,  f_axle, wheel_r,  1.0, "Front_L"),
        (-f_track,  f_axle, wheel_r, -1.0, "Front_R"),
        ( r_track,  r_axle, wheel_r,  1.0, "Rear_L"),
        (-r_track,  r_axle, wheel_r, -1.0, "Rear_R"),
    ]

    for wx, wy, wz, side, w_name in wheel_positions:
        w_center = Vector((wx, wy, wz))
        outward_rot = Matrix.Translation(w_center) @ Matrix.Rotation(math.radians(90.0 * side), 4, 'Y')

        # 1. Stepped Outer Wheel Rim Lip & Bead Seat
        rim_r = 0.205
        rim_w = 0.055
        for lip_r in [rim_r, rim_r * 0.94, rim_r * 0.88]:
            bmesh.ops.create_torus(bm_wheel, major_radius=lip_r, minor_radius=0.0035,
                                   major_segments=32, minor_segments=6,
                                   matrix=outward_rot @ Matrix.Translation((0, 0, 0.048)))

        # 2. 16 Directional Turbina Cooling Vanes with Airfoil Camber
        hub_r = 0.075
        vane_depth = 0.038
        for v_idx in range(16):
            v_ang = v_idx * (2.0 * math.pi / 16.0)
            # Slanted vane direction for brake heat extraction
            cos_a = math.cos(v_ang)
            sin_a = math.sin(v_ang)
            p_hub = Vector((cos_a * hub_r, sin_a * hub_r, 0.022))
            # Swept angle at outer rim
            sw_ang = v_ang + 0.26 * side
            p_rim = Vector((math.cos(sw_ang) * (rim_r * 0.86), math.sin(sw_ang) * (rim_r * 0.86), 0.045))

            # Airfoil cross-section vane blade
            create_oriented_box_between(bm_wheel,
                                        outward_rot @ Matrix.Translation(p_hub) @ Vector((0,0,0)),
                                        outward_rot @ Matrix.Translation(p_rim) @ Vector((0,0,0)),
                                        width=0.005, height=0.016)

            # Recessed brake cooling exhaust pocket between vanes
            p_mid = (p_hub + p_rim) * 0.5
            bmesh.ops.create_cone(bm_wheel, cap_ends=True, segments=6, radius1=0.006, radius2=0.002, depth=0.012,
                                  matrix=outward_rot @ Matrix.Translation(p_mid))

        # 3. Central Hub Dust Cap & Milanese Crest Medallion
        cap_r = 0.036
        bmesh.ops.create_cone(bm_wheel, cap_ends=True, segments=24, radius1=cap_r, radius2=cap_r * 0.96, depth=0.022,
                              matrix=outward_rot @ Matrix.Translation((0, 0, 0.052)))
        # Central Alfa Romeo emblem disc in center cap
        bmesh.ops.create_cone(bm_badge, cap_ends=True, segments=20, radius1=cap_r * 0.75, radius2=cap_r * 0.75, depth=0.004,
                              matrix=outward_rot @ Matrix.Translation((0, 0, 0.064)))
        # Gold perimeter ring on center badge
        bmesh.ops.create_torus(bm_wheel, major_radius=cap_r * 0.76, minor_radius=0.0018,
                               major_segments=20, minor_segments=6,
                               matrix=outward_rot @ Matrix.Translation((0, 0, 0.065)))

        # 4. 5 Recessed Chrome Acorn Lug Nuts (PCD 4x108 / 5x108 period pattern)
        bolt_circle_r = 0.054
        for b_idx in range(5):
            b_ang = b_idx * (2.0 * math.pi / 5.0)
            bx = math.cos(b_ang) * bolt_circle_r
            by = math.sin(b_ang) * bolt_circle_r
            bolt_pos = Vector((bx, by, 0.032))

            # Recessed bolt well in magnesium casting
            bmesh.ops.create_cone(bm_wheel, cap_ends=True, segments=12, radius1=0.014, radius2=0.012, depth=0.016,
                                  matrix=outward_rot @ Matrix.Translation(bolt_pos))
            # Hexagonal acorn nut
            bmesh.ops.create_cone(bm_wheel, cap_ends=True, segments=6, radius1=0.009, radius2=0.009, depth=0.014,
                                  matrix=outward_rot @ Matrix.Translation(bolt_pos + Vector((0, 0, 0.012))))
            # Dome / acorn rounded crown
            bmesh.ops.create_cone(bm_wheel, cap_ends=True, segments=8, radius1=0.007, radius2=0.002, depth=0.006,
                                  matrix=outward_rot @ Matrix.Translation(bolt_pos + Vector((0, 0, 0.022))))

        # 5. Tire Valve Stem
        # Mounted near outer rim lip between turbine vanes
        valve_pos = Vector((rim_r * 0.88 * math.cos(0.4), rim_r * 0.88 * math.sin(0.4), 0.048))
        # Rubber base grommet
        bmesh.ops.create_cone(bm_wheel, cap_ends=True, segments=8, radius1=0.006, radius2=0.005, depth=0.008,
                              matrix=outward_rot @ Matrix.Translation(valve_pos))
        # Brass stem body angled outward
        bmesh.ops.create_cone(bm_wheel, cap_ends=True, segments=8, radius1=0.0035, radius2=0.0035, depth=0.024,
                              matrix=outward_rot @ Matrix.Translation(valve_pos + Vector((0, 0, 0.012))) @
                              Matrix.Rotation(math.radians(18.0), 4, 'X'))
        # Threaded dust cap with knurled band
        bmesh.ops.create_cone(bm_wheel, cap_ends=True, segments=8, radius1=0.0045, radius2=0.004, depth=0.009,
                              matrix=outward_rot @ Matrix.Translation(valve_pos + Vector((0, 0, 0.024))) @
                              Matrix.Rotation(math.radians(18.0), 4, 'X'))

        # 6. Ventilated Cast Iron Brake Rotors & ATE Calipers
        rotor_r = 0.142
        # Rotor friction ring with cooling vents
        bmesh.ops.create_cone(bm_brake, cap_ends=True, segments=24, radius1=rotor_r, radius2=rotor_r, depth=0.020,
                              matrix=outward_rot @ Matrix.Translation((0, 0, -0.015)))
        # Central hat bell
        bmesh.ops.create_cone(bm_brake, cap_ends=True, segments=20, radius1=rotor_r * 0.62, radius2=rotor_r * 0.62, depth=0.032,
                              matrix=outward_rot @ Matrix.Translation((0, 0, 0.002)))

        # Cross-drilled cooling hole pattern on rotor face
        for ring_rad in [0.100, 0.125]:
            for h_idx in range(12):
                h_ang = h_idx * (2.0 * math.pi / 12.0)
                hx = math.cos(h_ang) * ring_rad
                hy = math.sin(h_ang) * ring_rad
                bmesh.ops.create_cone(bm_brake, cap_ends=True, segments=6, radius1=0.0025, radius2=0.0025, depth=0.024,
                                      matrix=outward_rot @ Matrix.Translation((hx, hy, -0.015)))

        # ATE 2-Piston Fixed Brake Caliper
        cal_pos = Vector((0.0, rotor_r * 0.90, -0.010))
        bmesh.ops.create_cube(bm_brake, size=1.0, matrix=outward_rot @ Matrix.Translation(cal_pos) @
                              Matrix.Scale(0.088, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.075, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.065, 4, Vector((0, 0, 1))))
        # Twin hydraulic fluid bridge pipe and bleeder nipple
        bmesh.ops.create_cone(bm_brake, cap_ends=True, segments=6, radius1=0.004, radius2=0.004, depth=0.014,
                              matrix=outward_rot @ Matrix.Translation(cal_pos + Vector((0.035, 0.025, 0.030))))

    obj_w = link_obj("GEO_Spider_Turbina_Jewelry", bm_wheel, parent_col, mats["chrome"], bevel=0.0005)
    obj_b = link_obj("GEO_Spider_Hub_Medallions", bm_badge, parent_col, mats["badge_blue"], bevel=0.0002)
    obj_r = link_obj("GEO_Spider_Brake_Rotors", bm_brake, parent_col, mats["copper_zinc"], bevel=0.0005)
    return [obj_w, obj_b, obj_r]


# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 2P: TWIN-CAM "NORD" ALLOY ENGINE DETAILS & WEBER PLENUM
# ----------------------------------------------------------------------------
def build_engine_bay_twin_cam_nord_jewelry(parent_col, mats):
    """
    Constructs period-correct engine bay jewelry for the iconic 2.0L Alfa Twin-Cam "Nord" engine:
    - Ribbed cast aluminum twin cam covers with polished dome nuts.
    - Stamped "ALFA ROMEO" lettering relief on cam covers.
    - Polished knurled oil filler cap.
    - Twin Weber 40 DCOE sidedraft carburetors with velocity horns and airbox trumpet seals.
    - 4 spark plug leads routed through chrome wire loom bracket.
    - Tuned 4-2-1 tubular exhaust headers with welded collector branches.
    """
    bm_engine = bmesh.new()
    bm_carbs  = bmesh.new()
    bm_header = bmesh.new()

    eng_c = Vector((0.0, 1.150, 0.520))

    # 1. Cast Aluminum Twin-Cam Valve Covers with Polished Ribs
    # Alfa Romeo twin overhead camshaft layout: two long longitudinal cam bumps
    cam_spacing = 0.160
    cam_len     = 0.520
    for cam_idx, cx in enumerate([-cam_spacing*0.5, cam_spacing*0.5]):
        cam_pos = eng_c + Vector((cx, 0.0, 0.160))
        # Semicylindrical camshaft lobe tunnel
        bmesh.ops.create_cone(bm_engine, cap_ends=True, segments=16, radius1=0.052, radius2=0.052, depth=cam_len,
                              matrix=Matrix.Translation(cam_pos) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))
        # 6 Polished longitudinal cooling ribs atop each cam cover
        for r_idx in range(-3, 3):
            rx = cx + r_idx * 0.014
            bmesh.ops.create_cube(bm_engine, size=1.0, matrix=Matrix.Translation((rx, eng_c.y, cam_pos.z + 0.054)) @
                                  Matrix.Scale(0.004, 4, Vector((1, 0, 0))) @
                                  Matrix.Scale(cam_len * 0.94, 4, Vector((0, 1, 0))) @
                                  Matrix.Scale(0.008, 4, Vector((0, 0, 1))))

        # Chrome Acorn Nuts Securing Cam Covers (6 per bank)
        for n_idx in range(6):
            ny = eng_c.y - cam_len*0.45 + n_idx * (cam_len*0.90 / 5.0)
            bmesh.ops.create_cone(bm_engine, cap_ends=True, segments=6, radius1=0.006, radius2=0.005, depth=0.012,
                                  matrix=Matrix.Translation((cx, ny, cam_pos.z + 0.058)))

    # Central Valley between Cam Covers & Spark Plug Wells
    for sp_idx in range(4):
        spy = eng_c.y - 0.180 + sp_idx * 0.120
        # Recessed spark plug well
        bmesh.ops.create_cone(bm_engine, cap_ends=True, segments=12, radius1=0.016, radius2=0.014, depth=0.035,
                              matrix=Matrix.Translation((0.0, spy, eng_c.z + 0.160)))
        # Rubber spark plug boot
        bmesh.ops.create_cone(bm_carbs, cap_ends=True, segments=8, radius1=0.009, radius2=0.007, depth=0.024,
                              matrix=Matrix.Translation((0.0, spy, eng_c.z + 0.180)))
        # High-tension ignition wire looping toward distributor
        create_curved_tube(bm_carbs, [
            Vector((0.0, spy, eng_c.z + 0.190)),
            Vector((-0.120, spy - 0.030, eng_c.z + 0.220)),
            Vector((-0.240, 0.940, eng_c.z + 0.080))
        ], radius=0.0035, segments=6)

    # Polished Knurled Aluminum Oil Filler Cap (Right front of cam cover)
    oil_cap_c = eng_c + Vector((cam_spacing*0.5, 0.200, 0.225))
    bmesh.ops.create_cone(bm_engine, cap_ends=True, segments=16, radius1=0.028, radius2=0.028, depth=0.018,
                          matrix=Matrix.Translation(oil_cap_c))
    bmesh.ops.create_cone(bm_engine, cap_ends=True, segments=8, radius1=0.030, radius2=0.030, depth=0.006,
                          matrix=Matrix.Translation(oil_cap_c + Vector((0, 0, 0.006))))

    # 2. Twin Weber 40 DCOE Sidedraft Carburetors with Velocity Trumpets
    # Mounted on right side intake manifold (LHD passenger side / engine right)
    carb_x = 0.240
    for carb_idx, cy in enumerate([eng_c.y - 0.120, eng_c.y + 0.120]):
        carb_pos = Vector((carb_x, cy, eng_c.z + 0.110))
        # Main diecast Weber 40 DCOE dual-barrel body
        bmesh.ops.create_cube(bm_carbs, size=1.0, matrix=Matrix.Translation(carb_pos) @
                              Matrix.Scale(0.140, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.180, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.120, 4, Vector((0, 0, 1))))

        # Twin velocity trumpets / intake horns facing right fender
        for b_offset in [-0.045, 0.045]:
            trumpet_c = carb_pos + Vector((0.070, b_offset, 0))
            # Flared intake bellmouth
            bmesh.ops.create_cone(bm_engine, cap_ends=True, segments=16, radius1=0.028, radius2=0.020, depth=0.055,
                                  matrix=Matrix.Translation(trumpet_c) @ Matrix.Rotation(math.radians(90.0), 4, 'Y'))
            # Fine brass mesh anti-debris dome screen
            bmesh.ops.create_icosphere(bm_engine, subdivisions=1, radius=0.026,
                                       matrix=Matrix.Translation(trumpet_c + Vector((0.028, 0, 0))))

        # Throttle Return Spring & Ball-Joint Linkage
        sp_start = carb_pos + Vector((0, -0.060, 0.045))
        sp_end   = carb_pos + Vector((0,  0.060, 0.045))
        create_cylinder_between(bm_engine, sp_start, sp_end, radius=0.004, segments=6)

    # 3. Tuned 4-into-2-into-1 Tubular Steel Exhaust Headers
    # Sweeps from left cylinder head exhaust ports down under floorpan
    ex_x = -0.150
    for port_idx in range(4):
        py = eng_c.y - 0.180 + port_idx * 0.120
        p_head = Vector((ex_x, py, eng_c.z + 0.110))
        p_drop = Vector((ex_x - 0.080, py + 0.020, eng_c.z - 0.080))
        p_coll = Vector((-0.200, eng_c.y - 0.280, eng_c.z - 0.180))
        create_curved_tube(bm_header, [p_head, p_drop, p_coll], radius=0.019, segments=8)
        # Exhaust flange mounting ears with copper nuts
        bmesh.ops.create_cone(bm_engine, cap_ends=True, segments=6, radius1=0.007, radius2=0.007, depth=0.010,
                              matrix=Matrix.Translation(p_head + Vector((0.010, 0, 0.022))))

    obj_e = link_obj("GEO_Spider_Engine_Jewelry", bm_engine, parent_col, mats["chrome"], bevel=0.0005)
    obj_c = link_obj("GEO_Spider_Weber_Carbs", bm_carbs, parent_col, mats["rubber"], bevel=0.0005)
    obj_h = link_obj("GEO_Spider_Exhaust_Headers", bm_header, parent_col, mats["stainless"], bevel=0.001)
    return [obj_e, obj_c, obj_h]


# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 2Q: COCKPIT DASH COWL, WOOD-RIM WHEEL & CONSOLE JEWELRY
# ----------------------------------------------------------------------------
def build_cockpit_windshield_cowl_and_dash_trim(parent_col, mats):
    """
    Constructs the driver-oriented cockpit jewelry visible through the open roadster cockpit:
    - Twin hooded Jaeger instrument binnacles (speedometer & tachometer) with chrome bezels.
    - Three angled auxiliary gauges on center stack (oil pressure, water temp, fuel level).
    - Authentic 3-spoke wood-rim steering wheel with slotted aluminum spokes and horn crest.
    - Chrome 5-speed gear shift lever with engraved mushroom knob and leather boot.
    - Center console ashtray slide lid, handbrake ratchet, and toggle switch bank.
    """
    bm_dash   = bmesh.new()
    bm_chrome = bmesh.new()
    bm_wood   = bmesh.new()

    dash_y = 0.460
    dash_z = 0.720

    # 1. Twin Hooded Jaeger Instrument Binnacles (Directly ahead of driver, LHD X = -0.360)
    steer_x = -0.340
    for b_idx, bx_offset in enumerate([-0.065, 0.065]):
        b_pos = Vector((steer_x + bx_offset, dash_y, dash_z + 0.065))
        # Forward angled cowl eyebrow hood
        bmesh.ops.create_cone(bm_dash, cap_ends=False, segments=20, radius1=0.056, radius2=0.048, depth=0.045,
                              matrix=Matrix.Translation(b_pos) @ Matrix.Rotation(math.radians(-25.0), 4, 'X'))
        # Chrome dial retaining bezel
        bmesh.ops.create_torus(bm_chrome, major_radius=0.049, minor_radius=0.0025, major_segments=20, minor_segments=6,
                               matrix=Matrix.Translation(b_pos - Vector((0, 0.015, 0))) @ Matrix.Rotation(math.radians(-25.0), 4, 'X'))
        # Dark gauge face with printed dial markings
        bmesh.ops.create_cone(bm_dash, cap_ends=True, segments=16, radius1=0.046, radius2=0.046, depth=0.004,
                              matrix=Matrix.Translation(b_pos - Vector((0, 0.018, 0))) @ Matrix.Rotation(math.radians(-25.0), 4, 'X'))

    # 2. Three Center-Stack Angled Auxiliary Gauges (X = 0.0, angled 35 deg toward driver)
    for g_idx, gy_offset in enumerate([-0.040, 0.0, 0.040]):
        g_pos = Vector((gy_offset, dash_y - 0.020, dash_z + 0.015))
        rot_stack = Matrix.Translation(g_pos) @ Matrix.Rotation(math.radians(-35.0), 4, 'X') @ Matrix.Rotation(math.radians(-15.0), 4, 'Z')
        # Chrome gauge ring
        bmesh.ops.create_torus(bm_chrome, major_radius=0.024, minor_radius=0.002, major_segments=16, minor_segments=6, matrix=rot_stack)
        # Dial face
        bmesh.ops.create_cone(bm_dash, cap_ends=True, segments=12, radius1=0.022, radius2=0.022, depth=0.003, matrix=rot_stack)

    # 3. Period 3-Spoke Italian Wood-Rim Steering Wheel
    hub_pos = Vector((steer_x, dash_y - 0.220, dash_z + 0.040))
    steer_rot = Matrix.Translation(hub_pos) @ Matrix.Rotation(math.radians(-32.0), 4, 'X')

    # Wood-laminated rim circle (380 mm diameter vintage wheel)
    bmesh.ops.create_torus(bm_wood, major_radius=0.185, minor_radius=0.012, major_segments=32, minor_segments=10, matrix=steer_rot)

    # Central Aluminum Hub with Horn Button Crest
    bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=16, radius1=0.042, radius2=0.040, depth=0.025, matrix=steer_rot)
    # Milanese horn button medallion in center
    bmesh.ops.create_cone(bm_dash, cap_ends=True, segments=14, radius1=0.026, radius2=0.026, depth=0.006,
                          matrix=steer_rot @ Matrix.Translation((0, 0, 0.014)))

    # 3 Slotted Brushed Aluminum Spokes (Left, Right, Bottom)
    spoke_angles = [math.pi * 0.85, math.pi * 0.15, -math.pi * 0.5]
    for s_ang in spoke_angles:
        p_hub_spoke = Vector((math.cos(s_ang) * 0.040, math.sin(s_ang) * 0.040, 0.008))
        p_rim_spoke = Vector((math.cos(s_ang) * 0.180, math.sin(s_ang) * 0.180, 0.008))
        # Spoke blade
        create_oriented_box_between(bm_chrome,
                                    steer_rot @ Matrix.Translation(p_hub_spoke) @ Vector((0,0,0)),
                                    steer_rot @ Matrix.Translation(p_rim_spoke) @ Vector((0,0,0)),
                                    width=0.028, height=0.004)
        # 3 Weight-reduction slots drilled into each spoke
        for slot_f in [0.45, 0.65, 0.82]:
            p_slot = p_hub_spoke * (1.0 - slot_f) + p_rim_spoke * slot_f
            bmesh.ops.create_cone(bm_dash, cap_ends=True, segments=8, radius1=0.004, radius2=0.004, depth=0.006,
                                  matrix=steer_rot @ Matrix.Translation(p_slot))

    # 4. Chrome 5-Speed Gear Shift Lever & Leather Boot
    # Emerges from transmission tunnel console angled back toward driver
    shift_pos = Vector((-0.060, dash_y - 0.360, dash_z - 0.240))
    # Stitched leather shift boot pyramid
    bmesh.ops.create_cone(bm_dash, cap_ends=True, segments=12, radius1=0.020, radius2=0.065, depth=0.065,
                          matrix=Matrix.Translation(shift_pos + Vector((0, 0, 0.030))))
    # Chrome angled shift lever shaft
    p_lever_top = shift_pos + Vector((-0.030, -0.140, 0.190))
    create_cylinder_between(bm_chrome, shift_pos + Vector((0, 0, 0.060)), p_lever_top, radius=0.007, segments=8)
    # Engraved mushroom shift knob (2000 Veloce 5-speed pattern)
    bmesh.ops.create_cone(bm_dash, cap_ends=True, segments=16, radius1=0.022, radius2=0.016, depth=0.038,
                          matrix=Matrix.Translation(p_lever_top) @ Matrix.Rotation(math.radians(-25.0), 4, 'X'))
    # White 5-speed shift gate inlay disc on knob top
    bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=12, radius1=0.014, radius2=0.014, depth=0.003,
                          matrix=Matrix.Translation(p_lever_top + Vector((0, -0.008, 0.020))) @ Matrix.Rotation(math.radians(-25.0), 4, 'X'))

    # 5. Handbrake Lever & Console Ashtray Slide
    hb_pos = Vector((0.080, dash_y - 0.440, dash_z - 0.220))
    # Handbrake chrome lever arm
    p_hb_end = hb_pos + Vector((0, -0.180, 0.075))
    create_cylinder_between(bm_chrome, hb_pos, p_hb_end, radius=0.007, segments=8)
    # Push-button release chrome button
    bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=8, radius1=0.005, radius2=0.005, depth=0.012,
                          matrix=Matrix.Translation(p_hb_end + Vector((0, -0.008, 0.004))) @ Matrix.Rotation(math.radians(45.0), 4, 'X'))
    # Chrome ashtray slide cover on tunnel
    ash_pos = Vector((0.0, dash_y - 0.260, dash_z - 0.210))
    bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(ash_pos) @
                          Matrix.Scale(0.088, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.065, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.006, 4, Vector((0, 0, 1))))

    obj_d = link_obj("GEO_Spider_Cockpit_Dash", bm_dash, parent_col, mats["rubber"], bevel=0.001)
    obj_c = link_obj("GEO_Spider_Cockpit_Brightwork", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)
    obj_w = link_obj("GEO_Spider_Wood_Steering_Wheel", bm_wood, parent_col, mats["badge_gold"], bevel=0.001)
    return [obj_d, obj_c, obj_w]


# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 2R: CHASSIS DRAINAGE, SUMP GUARD & T-ARM TRUNNION
# ----------------------------------------------------------------------------
def build_chassis_underbody_drainage_and_reinforcements(parent_col, mats):
    """
    Constructs lower underbody structural details:
    - Stamped tubular front engine sump skid guard with ventilation cooling slots.
    - Radiator lower stone deflector tray.
    - Rear axle upper T-arm differential trunnion pivot with bronze thrust washers.
    - Underbody rocker drainage weep holes and jacking rail spot-weld hems.
    """
    bm_chassis = bmesh.new()
    bm_guard   = bmesh.new()

    # 1. Front Engine Sump Guard / Skid Plate (Protecting the finned aluminum oil sump)
    sump_c = Vector((0.0, 1.220, 0.190))
    # Outer tubular reinforcement frame
    sg_p1 = sump_c + Vector((-0.240,  0.220, 0.020))
    sg_p2 = sump_c + Vector(( 0.240,  0.220, 0.020))
    sg_p3 = sump_c + Vector(( 0.210, -0.220, 0.000))
    sg_p4 = sump_c + Vector((-0.210, -0.220, 0.000))
    create_curved_tube(bm_guard, [sg_p1, sg_p2, sg_p3, sg_p4, sg_p1], radius=0.010, segments=8)

    # Perforated skid plate pan with 8 cooling slots
    bmesh.ops.create_cube(bm_guard, size=1.0, matrix=Matrix.Translation(sump_c) @
                          Matrix.Scale(0.440, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.420, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.004, 4, Vector((0, 0, 1))))
    # Longitudinal ventilation slots
    for sl_idx in range(-3, 4):
        sx = sl_idx * 0.055
        create_oriented_box_between(bm_chassis,
                                    Vector((sx, sump_c.y - 0.140, sump_c.z)),
                                    Vector((sx, sump_c.y + 0.140, sump_c.z)),
                                    width=0.012, height=0.008)

    # 2. Lower Radiator Stone Deflector Chin Tray
    rad_pos = Vector((0.0, 1.720, 0.260))
    bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=Matrix.Translation(rad_pos) @
                          Matrix.Rotation(math.radians(-15.0), 4, 'X') @
                          Matrix.Scale(0.620, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.180, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.003, 4, Vector((0, 0, 1))))

    # 3. Rear Axle Upper T-Arm Differential Trunnion Pivot
    # Central trunnion atop differential case anchoring the upper suspension reaction arm
    trun_c = Vector((0.0, -1.125, 0.440))
    # Transverse pivot cross-tube
    create_cylinder_between(bm_guard, trun_c - Vector((0.090, 0, 0)), trun_c + Vector((0.090, 0, 0)), radius=0.018, segments=12)
    # Bronze thrust washers on pivot ends
    for b_side in [1.0, -1.0]:
        bmesh.ops.create_cone(bm_chassis, cap_ends=True, segments=12, radius1=0.026, radius2=0.026, depth=0.006,
                              matrix=Matrix.Translation(trun_c + Vector((0.092 * b_side, 0, 0))) @ Matrix.Rotation(math.radians(90.0), 4, 'Y'))
    # Welded differential mounting bracket lugs
    for lug_side in [1.0, -1.0]:
        lx = 0.045 * lug_side
        create_oriented_box_between(bm_guard,
                                    Vector((lx, trun_c.y, trun_c.z - 0.060)),
                                    Vector((lx, trun_c.y, trun_c.z)),
                                    width=0.010, height=0.035)

    # 4. Underbody Rocker Weep Drainage Slots (4 per rocker)
    for side in [1.0, -1.0]:
        rx = 0.740 * side
        for dy in [0.550, 0.180, -0.180, -0.550]:
            bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=Matrix.Translation((rx, dy, 0.160)) @
                                  Matrix.Scale(0.015, 4, Vector((1, 0, 0))) @
                                  Matrix.Scale(0.035, 4, Vector((0, 1, 0))) @
                                  Matrix.Scale(0.005, 4, Vector((0, 0, 1))))

    obj_c = link_obj("GEO_Spider_Chassis_Details", bm_chassis, parent_col, mats["rubber"], bevel=0.0005)
    obj_g = link_obj("GEO_Spider_Sump_Guard", bm_guard, parent_col, mats["stainless"], bevel=0.001)
    return [obj_c, obj_g]


# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 2S: COCKPIT BUCKET SEATS, LAP BELTS & LUGGAGE RESTRAINTS
# ----------------------------------------------------------------------------
def build_interior_bucket_seats_and_lap_belts(parent_col, mats):
    """
    Constructs the driver and passenger low-back sport bucket seats, chrome
    reclining hinge hardware, period chrome-buckle lap seatbelts, and rear
    package shelf luggage tie-down straps.
    """
    bm_seats  = bmesh.new()
    bm_chrome = bmesh.new()
    bm_belts  = bmesh.new()

    seat_y_c = -0.150
    seat_z_c = 0.420
    seat_w   = 0.460

    for side in [1.0, -1.0]:
        sx = 0.320 * side

        # 1. Lower Seat Cushion (Squab) with Fluted Center Inset
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=Matrix.Translation((sx, seat_y_c, seat_z_c)) @
                              Matrix.Scale(seat_w, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.480, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.120, 4, Vector((0, 0, 1))))

        # 5 Transverse Fluted Pleats on Cushion
        for p_idx in range(-2, 3):
            py = seat_y_c + p_idx * 0.080
            bmesh.ops.create_cylinder(bm_seats, cap_ends=True, segments=8, radius=0.012, depth=seat_w * 0.75,
                                      matrix=Matrix.Translation((sx, py, seat_z_c + 0.060)) @
                                      Matrix.Rotation(math.radians(90.0), 4, 'Y'))

        # Raised Lateral Thigh Bolsters
        for bol_side in [1.0, -1.0]:
            bx = sx + (seat_w * 0.45) * bol_side
            bmesh.ops.create_cylinder(bm_seats, cap_ends=True, segments=10, radius=0.028, depth=0.460,
                                      matrix=Matrix.Translation((bx, seat_y_c, seat_z_c + 0.045)) @
                                      Matrix.Rotation(math.radians(90.0), 4, 'X'))

        # 2. Contoured Seat Backrest with Integrated Headrest
        back_y = seat_y_c - 0.220
        back_z = seat_z_c + 0.280
        back_rot = Matrix.Translation((sx, back_y, back_z)) @ Matrix.Rotation(math.radians(18.0), 4, 'X')
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=back_rot @
                              Matrix.Scale(seat_w, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.110, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.520, 4, Vector((0, 0, 1))))

        # Vertical Fluted Center Backrest Pleats
        for fl_idx in range(-3, 4):
            fx = sx + fl_idx * 0.045
            create_oriented_box_between(bm_seats,
                                        back_rot @ Matrix.Translation((fl_idx * 0.045, 0.055, -0.200)) @ Vector((0,0,0)),
                                        back_rot @ Matrix.Translation((fl_idx * 0.045, 0.055,  0.200)) @ Vector((0,0,0)),
                                        width=0.014, height=0.010)

        # 3. Chrome Reclining Hinge Mechanism & Adjustment Knob (Outer side)
        hinge_pos = Vector((sx + (seat_w * 0.52) * side, seat_y_c - 0.180, seat_z_c + 0.020))
        # Chrome circular quadrant plate
        bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=16, radius1=0.038, radius2=0.038, depth=0.012,
                              matrix=Matrix.Translation(hinge_pos) @ Matrix.Rotation(math.radians(90.0 * side), 4, 'Y'))
        # Recliner release lever handle
        create_oriented_box_between(bm_chrome,
                                    hinge_pos,
                                    hinge_pos + Vector((0.012 * side, 0.080, 0.040)),
                                    width=0.008, height=0.018)
        # Knob on lever tip
        bmesh.ops.create_cone(bm_seats, cap_ends=True, segments=10, radius1=0.012, radius2=0.010, depth=0.018,
                              matrix=Matrix.Translation(hinge_pos + Vector((0.012 * side, 0.080, 0.040))))

        # 4. Period Italian Chrome-Buckle Lap Safety Belts
        belt_anchor_inner = Vector((sx - 0.220 * side, seat_y_c - 0.180, seat_z_c - 0.040))
        belt_anchor_outer = Vector((sx + 0.240 * side, seat_y_c - 0.180, seat_z_c - 0.040))
        belt_clasp        = Vector((sx, seat_y_c + 0.040, seat_z_c + 0.085))

        # Woven webbing straps
        create_oriented_box_between(bm_belts, belt_anchor_inner, belt_clasp, width=0.045, height=0.004)
        create_oriented_box_between(bm_belts, belt_anchor_outer, belt_clasp, width=0.045, height=0.004)

        # Chrome Aircraft-Style Lift-Latch Buckle
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(belt_clasp) @
                              Matrix.Scale(0.065, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.052, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.016, 4, Vector((0, 0, 1))))
        # Lift lever flap
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(belt_clasp + Vector((0, 0.008, 0.010))) @
                              Matrix.Rotation(math.radians(-15.0), 4, 'X') @
                              Matrix.Scale(0.058, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.038, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.006, 4, Vector((0, 0, 1))))

    # 5. Rear Package Shelf Luggage Retention Straps (Behind seats)
    shelf_y = -0.580
    shelf_z = 0.620
    for side in [1.0, -1.0]:
        st_x = 0.350 * side
        create_oriented_box_between(bm_belts,
                                    Vector((st_x, shelf_y - 0.180, shelf_z)),
                                    Vector((st_x, shelf_y + 0.180, shelf_z)),
                                    width=0.024, height=0.004)
        # Polished chrome roller buckle
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation((st_x, shelf_y, shelf_z + 0.006)) @
                              Matrix.Scale(0.032, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.028, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.008, 4, Vector((0, 0, 1))))

    obj_s = link_obj("GEO_Spider_Bucket_Seats", bm_seats, parent_col, mats["rubber"], bevel=0.001)
    obj_c = link_obj("GEO_Spider_Seat_Hardware", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)
    obj_b = link_obj("GEO_Spider_Seat_Belts", bm_belts, parent_col, mats["vinyl_tonneau"], bevel=0.0005)
    return [obj_s, obj_c, obj_b]


# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 2T: ENGINE BAY IGNITION COIL, FIAMM AIR HORNS & RELAYS
# ----------------------------------------------------------------------------
def build_engine_bay_ignition_and_air_horns(parent_col, mats):
    """
    Constructs the blue ignition coil with ceramic ballast resistor, Fiamm dual air
    horn trumpets with pneumatic compressor, voltage regulator box, and washer bag.
    """
    bm_coil   = bmesh.new()
    bm_horns  = bmesh.new()
    bm_chrome = bmesh.new()

    # 1. Marelli / Bosch Blue High-Output Ignition Coil
    coil_pos = Vector((-0.340, 1.340, 0.580))
    # Cylindrical coil body
    bmesh.ops.create_cone(bm_coil, cap_ends=True, segments=16, radius1=0.034, radius2=0.034, depth=0.140,
                          matrix=Matrix.Translation(coil_pos))
    # Bakelite high-tension center tower
    bmesh.ops.create_cone(bm_coil, cap_ends=True, segments=10, radius1=0.014, radius2=0.010, depth=0.035,
                          matrix=Matrix.Translation(coil_pos + Vector((0, 0, 0.085))))
    # Ceramic Ballast Resistor Block on Coil Bracket
    res_pos = coil_pos + Vector((0.045, 0.0, 0.020))
    bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(res_pos) @
                          Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.065, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.022, 4, Vector((0, 0, 1))))

    # 2. Dual Fiamm Pneumatic Air Horn Trumpets (Italian roadster trademark sound)
    # Mounted behind the front grille / Scudetto on the radiator support crossmember
    horn_base = Vector((0.180, 1.880, 0.420))
    # Pneumatic 12V compressor motor
    bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=14, radius1=0.032, radius2=0.032, depth=0.095,
                          matrix=Matrix.Translation(horn_base))

    # Two tuned red plastic / chrome trumpets (High and Low tone)
    trumpet_configs = [
        ( 0.040, 0.180, "High_Tone"),
        (-0.040, 0.220, "Low_Tone"),
    ]
    for h_off, t_len, t_name in trumpet_configs:
        t_pos = horn_base + Vector((h_off, 0.060, 0.020))
        # Trumpet tube flaring to bellmouth facing forward
        bmesh.ops.create_cone(bm_horns, cap_ends=True, segments=16, radius1=0.036, radius2=0.009, depth=t_len,
                              matrix=Matrix.Translation(t_pos + Vector((0, t_len*0.45, 0))) @ Matrix.Rotation(math.radians(-90.0), 4, 'X'))
        # Pneumatic feed hose
        create_curved_tube(bm_chrome, [horn_base + Vector((0,0,0.040)), t_pos], radius=0.004, segments=6)

    # 3. Voltage Regulator Box (Black Bakelite casing with terminal screws)
    reg_pos = Vector((0.350, 1.050, 0.620))
    bmesh.ops.create_cube(bm_coil, size=1.0, matrix=Matrix.Translation(reg_pos) @
                          Matrix.Scale(0.075, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.095, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.065, 4, Vector((0, 0, 1))))
    # Terminal posts
    for t_idx in [-0.025, 0.0, 0.025]:
        bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=6, radius1=0.004, radius2=0.004, depth=0.010,
                              matrix=Matrix.Translation((reg_pos.x + t_idx, reg_pos.y + 0.048, reg_pos.z)))

    # 4. Windshield Washer Fluid Reservoir Bag (Soft vinyl bag with Alfa cross crest)
    bag_pos = Vector((-0.350, 1.520, 0.520))
    bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(bag_pos) @
                          Matrix.Scale(0.055, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.140, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.180, 4, Vector((0, 0, 1))))
    # Blue filler cap
    bmesh.ops.create_cone(bm_horns, cap_ends=True, segments=10, radius1=0.016, radius2=0.016, depth=0.012,
                          matrix=Matrix.Translation(bag_pos + Vector((0, 0, 0.095))))

    obj_c = link_obj("GEO_Spider_Coil_Regulator", bm_coil, parent_col, mats["rubber"], bevel=0.001)
    obj_h = link_obj("GEO_Spider_Air_Horns", bm_horns, parent_col, mats["koni_red"], bevel=0.0005)
    obj_m = link_obj("GEO_Spider_Horn_Compressor", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)
    return [obj_c, obj_h, obj_m]


# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 2U: TRUNK SPARE WHEEL CLAMP, TOOL ROLL & WEATHERSTRIP
# ----------------------------------------------------------------------------
def build_trunk_spare_wheel_and_tool_roll_hardware(parent_col, mats):
    """
    Constructs the trunk compartment interior hardware:
    - 14-inch spare wheel clamped to trunk floor basin with threaded wing-bolt.
    - Rolled canvas vintage Alfa Romeo tool kit pouch with retention straps.
    - Stamped mechanical scissor jack and folding crank handle.
    - Perimeter rubber decklid weatherstripping seal gasket.
    """
    bm_tools  = bmesh.new()
    bm_rubber = bmesh.new()
    bm_chrome = bmesh.new()

    trunk_c = Vector((0.080, -1.540, 0.280))

    # 1. 14-inch Spare Wheel Assembly Clamped in Trunk
    # Tire outer donut
    bmesh.ops.create_torus(bm_rubber, major_radius=0.210, minor_radius=0.085,
                           major_segments=24, minor_segments=10, matrix=Matrix.Translation(trunk_c))
    # Steel wheel rim center dish
    bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=20, radius1=0.170, radius2=0.170, depth=0.080,
                          matrix=Matrix.Translation(trunk_c))

    # Threaded Hold-Down Stud & Chrome Wing-Nut Clamp
    stud_c = trunk_c + Vector((0, 0, 0.060))
    create_cylinder_between(bm_chrome, stud_c - Vector((0, 0, 0.080)), stud_c + Vector((0, 0, 0.060)), radius=0.006, segments=8)
    # Chrome hold-down bridge plate
    bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(stud_c + Vector((0, 0, 0.040))) @
                          Matrix.Scale(0.140, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.012, 4, Vector((0, 0, 1))))
    # Large 2-wing butterfly wing-nut
    bmesh.ops.create_cone(bm_chrome, cap_ends=True, segments=12, radius1=0.014, radius2=0.014, depth=0.018,
                          matrix=Matrix.Translation(stud_c + Vector((0, 0, 0.052))))
    for w_side in [1.0, -1.0]:
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(stud_c + Vector((0.035 * w_side, 0, 0.055))) @
                              Matrix.Scale(0.045, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.008, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.018, 4, Vector((0, 0, 1))))

    # 2. Rolled Vintage Canvas Tool Roll Kit Pouch
    # Positioned on trunk floor to the left of the spare wheel
    tool_pos = Vector((-0.340, -1.480, 0.260))
    # Cylindrical canvas tool roll bundle
    bmesh.ops.create_cone(bm_tools, cap_ends=True, segments=14, radius1=0.045, radius2=0.045, depth=0.340,
                          matrix=Matrix.Translation(tool_pos) @ Matrix.Rotation(math.radians(90.0), 4, 'Y'))
    # Twin leather retention buckled straps
    for s_idx in [-0.090, 0.090]:
        bmesh.ops.create_torus(bm_rubber, major_radius=0.048, minor_radius=0.004,
                               major_segments=14, minor_segments=6,
                               matrix=Matrix.Translation(tool_pos + Vector((s_idx, 0, 0))) @ Matrix.Rotation(math.radians(90.0), 4, 'Y'))
        # Roller buckle
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=Matrix.Translation(tool_pos + Vector((s_idx, 0.045, 0))) @
                              Matrix.Scale(0.010, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.018, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.016, 4, Vector((0, 0, 1))))

    # 3. Stamped Steel Mechanical Scissor Jack
    jack_pos = Vector((-0.340, -1.680, 0.250))
    # Rhombus scissor linkage arms
    j_p1 = jack_pos + Vector((0, -0.110, 0))
    j_p2 = jack_pos + Vector((0,  0.000, 0.045))
    j_p3 = jack_pos + Vector((0,  0.110, 0))
    j_p4 = jack_pos + Vector((0,  0.000, -0.045))
    create_curved_tube(bm_chrome, [j_p1, j_p2, j_p3, j_p4, j_p1], radius=0.006, segments=6)
    # Center lead screw with hex drive head
    create_cylinder_between(bm_chrome, j_p1 - Vector((0, 0.025, 0)), j_p3 + Vector((0, 0.025, 0)), radius=0.005, segments=6)

    # 4. Perimeter Trunk Weatherstripping Rubber Seal Gasket
    # Traces the entire shutline of the rear luggage compartment
    gutter_y_f = -0.960
    gutter_y_r = -1.980
    gutter_x   = 0.520
    seal_pts = [
        Vector((-gutter_x,      gutter_y_f, 0.708)),
        Vector(( gutter_x,      gutter_y_f, 0.708)),
        Vector(( gutter_x*0.92, gutter_y_r, 0.688)),
        Vector((-gutter_x*0.92, gutter_y_r, 0.688)),
        Vector((-gutter_x,      gutter_y_f, 0.708))
    ]
    create_curved_tube(bm_rubber, seal_pts, radius=0.0045, segments=6)

    obj_t = link_obj("GEO_Spider_Tool_Roll", bm_tools, parent_col, mats["vinyl_tonneau"], bevel=0.0005)
    obj_r = link_obj("GEO_Spider_Trunk_Rubber", bm_rubber, parent_col, mats["rubber"], bevel=0.0005)
    obj_c = link_obj("GEO_Spider_Spare_Hardware", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)
    return [obj_t, obj_r, obj_c]


# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 2V: STEERING BOX, LINKAGES & MOTOR MOUNT JEWELRY
# ----------------------------------------------------------------------------
def build_chassis_front_subframe_and_steering_box_jewelry(parent_col, mats):
    """
    Constructs the Burman / ZF recirculating ball steering box with cast cooling ribs,
    Pitman arm, idler arm assembly with grease fittings, center drag link with
    threaded adjustment sleeves and pinch bolts, and rubber engine motor mounts.
    """
    bm_steer   = bmesh.new()
    bm_rubber  = bmesh.new()
    bm_chassis = bmesh.new()

    f_axle = 1.125

    # 1. Burman Steering Box (Mounted to left chassis rail ahead of firewall)
    sbox_pos = Vector((-0.380, f_axle - 0.180, 0.360))
    # Cast steering gear housing
    bmesh.ops.create_cube(bm_steer, size=1.0, matrix=Matrix.Translation(sbox_pos) @
                          Matrix.Scale(0.110, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.125, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.095, 4, Vector((0, 0, 1))))
    # Top inspection cover plate with slotted adjustment screw & locknut
    bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=Matrix.Translation(sbox_pos + Vector((0, 0, 0.052))) @
                          Matrix.Scale(0.095, 4, Vector((1, 0, 0))) @
                          Matrix.Scale(0.110, 4, Vector((0, 1, 0))) @
                          Matrix.Scale(0.008, 4, Vector((0, 0, 1))))
    bmesh.ops.create_cone(bm_chassis, cap_ends=True, segments=6, radius1=0.008, radius2=0.008, depth=0.014,
                          matrix=Matrix.Translation(sbox_pos + Vector((0, 0, 0.062))))

    # Pitman Drop Arm Sweeping Downward
    p_pitman_pivot = sbox_pos - Vector((0, 0, 0.050))
    p_pitman_end   = p_pitman_pivot + Vector((0.020, -0.140, -0.060))
    create_cylinder_between(bm_steer, p_pitman_pivot, p_pitman_end, radius=0.014, segments=8)
    # Ball joint socket
    bmesh.ops.create_icosphere(bm_steer, subdivisions=1, radius=0.016, matrix=Matrix.Translation(p_pitman_end))

    # 2. Idler Arm Assembly (Mounted symmetrically on right chassis rail)
    idler_pos = Vector((0.380, f_axle - 0.180, 0.360))
    bmesh.ops.create_cone(bm_steer, cap_ends=True, segments=12, radius1=0.024, radius2=0.024, depth=0.095,
                          matrix=Matrix.Translation(idler_pos))
    # Grease nipple fitting atop idler pivot
    bmesh.ops.create_cone(bm_chassis, cap_ends=True, segments=6, radius1=0.003, radius2=0.003, depth=0.008,
                          matrix=Matrix.Translation(idler_pos + Vector((0, 0, 0.052))))
    # Idler swinging arm
    p_idler_end = idler_pos + Vector((-0.020, -0.140, -0.110))
    create_cylinder_between(bm_steer, idler_pos - Vector((0, 0, 0.045)), p_idler_end, radius=0.014, segments=8)
    bmesh.ops.create_icosphere(bm_steer, subdivisions=1, radius=0.016, matrix=Matrix.Translation(p_idler_end))

    # 3. Transverse Center Track Rod / Drag Link Connecting Pitman and Idler
    create_cylinder_between(bm_steer, p_pitman_end, p_idler_end, radius=0.012, segments=8)

    # 4. Left and Right Steering Tie Rods with Threaded Adjustment Sleeves
    for side in [1.0, -1.0]:
        p_inner_ball = p_idler_end if side > 0 else p_pitman_end
        p_knuckle    = Vector((0.580 * side, f_axle - 0.120, 0.280))

        # Tubular tie-rod
        p_sleeve_start = p_inner_ball * 0.70 + p_knuckle * 0.30
        p_sleeve_end   = p_inner_ball * 0.30 + p_knuckle * 0.70
        create_cylinder_between(bm_steer, p_inner_ball, p_sleeve_start, radius=0.009, segments=6)
        create_cylinder_between(bm_steer, p_sleeve_end, p_knuckle, radius=0.009, segments=6)

        # Hexagonal adjustment sleeve with split lock clamps
        create_cylinder_between(bm_chassis, p_sleeve_start, p_sleeve_end, radius=0.014, segments=6)
        for clamp_p in [p_sleeve_start + Vector((0.020*side, 0, 0)), p_sleeve_end - Vector((0.020*side, 0, 0))]:
            bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=Matrix.Translation(clamp_p) @
                                  Matrix.Scale(0.018, 4, Vector((1, 0, 0))) @
                                  Matrix.Scale(0.032, 4, Vector((0, 1, 0))) @
                                  Matrix.Scale(0.032, 4, Vector((0, 0, 1))))
            # Pinch bolt with hex nut
            bmesh.ops.create_cone(bm_chassis, cap_ends=True, segments=6, radius1=0.004, radius2=0.004, depth=0.022,
                                  matrix=Matrix.Translation(clamp_p + Vector((0, 0, 0.018))) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))

    # 5. Engine Mount Rubber Vibration Dampers & Steel Brackets
    for side in [1.0, -1.0]:
        em_pos = Vector((0.240 * side, f_axle + 0.060, 0.380))
        # Rubber donut isolator cushion
        bmesh.ops.create_cone(bm_rubber, cap_ends=True, segments=12, radius1=0.038, radius2=0.038, depth=0.045,
                              matrix=Matrix.Translation(em_pos) @ Matrix.Rotation(math.radians(35.0 * side), 4, 'Y'))
        # Steel cradle bracket bolting to engine block
        bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=Matrix.Translation(em_pos + Vector((0.018 * side, 0, 0.025))) @
                              Matrix.Rotation(math.radians(35.0 * side), 4, 'Y') @
                              Matrix.Scale(0.065, 4, Vector((1, 0, 0))) @
                              Matrix.Scale(0.088, 4, Vector((0, 1, 0))) @
                              Matrix.Scale(0.008, 4, Vector((0, 0, 1))))

    obj_s = link_obj("GEO_Spider_Steering_Gear", bm_steer, parent_col, mats["chrome"], bevel=0.0005)
    obj_r = link_obj("GEO_Spider_Motor_Mounts", bm_rubber, parent_col, mats["rubber"], bevel=0.0005)
    obj_c = link_obj("GEO_Spider_Tie_Rods", bm_chassis, parent_col, mats["copper_zinc"], bevel=0.0005)
    return [obj_s, obj_r, obj_c]


# ----------------------------------------------------------------------------
# 17. MASTER ORCHESTRATION & DUAL-MODE GLB EXPORT PIPELINE
# ----------------------------------------------------------------------------
def build_alfa_spider_master_complete():
    """
    Orchestrates the entire Alfa Romeo Spider Veloce Series 2 Class-A CAD build:
    1. Generates the continuous Pininfarina monocoque body shell, chassis frame,
       suspension, Campagnolo Turbina wheels, folded soft top and running gear.
    2. Overlays the comprehensive Phase 2 micro-jewelry, Scudetto heart grille,
       Carello optical lighting, bumpers, badging, wheel arch trims, and hardware.
    3. Exports complete master GLBs to exports/ and public/models/ directories.
    """
    import generate_alfa_romeo_spider_veloce_phase1

    # Get or create master Phase 2 collection
    col_name = "Alfa_Romeo_Spider_Veloce_Phase2_Jewelry"
    col = bpy.data.collections.get(col_name)
    if not col:
        col = bpy.data.collections.new(col_name)
        bpy.context.scene.collection.children.link(col)

    MATS = setup_phase2_materials()

    print("[PHASE 2] Synthesizing Scudetto Heart Grille & Badging...")
    scudetto = build_scudetto_heart_grille_assembly(col, MATS)

    print("[PHASE 2] Engineering Carello 7-inch Headlamps & Optical Lenses...")
    headlamps = build_carello_headlamp_assemblies(col, MATS)

    print("[PHASE 2] Fabricating Front Split Bumperettes & Turn Indicators...")
    f_bumpers = build_front_bumperettes_and_indicators(col, MATS)

    print("[PHASE 2] Assembling Altissimo Rear Taillamps & License Cowls...")
    r_lamps = build_rear_altissimo_taillamp_assemblies(col, MATS)

    print("[PHASE 2] Mounting Rear Split Bumperettes & Exhaust Shield...")
    r_bumpers = build_rear_bumperettes_and_shields(col, MATS)

    print("[PHASE 2] Applying Cursive Scripts & Pininfarina Crown Badges...")
    scripts = build_authentic_script_badging_and_crests(col, MATS)

    print("[PHASE 2] Rolling Wheel Arch Flanges & Waistline Brightwork...")
    arches = build_wheel_arch_flanges_and_side_trim(col, MATS)

    print("[PHASE 2] Installing Aerodynamic Flush Pull Door Handles...")
    handles = build_flush_door_handles_and_hardware(col, MATS)

    print("[PHASE 2] Fitting Triangular Vent Wings & Vitaloni Bullet Mirror...")
    wings = build_vent_wings_and_bullet_mirrors(col, MATS)

    print("[PHASE 2] Crafting Cowl Slotted Screen & Pantograph Wipers...")
    wipers = build_hood_cowl_jewelry_and_wipers(col, MATS)

    print("[PHASE 2] Rigging Suspension Droplinks, Koni Dampers & Brake Lines...")
    susp = build_chassis_suspension_details_and_brake_lines(col, MATS)

    print("[PHASE 2] Tailoring Folded Tonneau Boot & Tenax Snap Fasteners...")
    tonneau = build_tonneau_boot_and_fasteners(col, MATS)

    print("[PHASE 2] Plating Dual Inox Exhaust Tips & Underbody Tunnel Shield...")
    exhaust = build_dual_exhaust_tips_and_heat_shields(col, MATS)

    print("[PHASE 2] Stamping Firewall VIN Plates & Homologation Tags...")
    plates = build_chassis_homologation_and_engine_bay_plates(col, MATS)

    print("[PHASE 2] Detailing Campagnolo Turbina Wheel Vanes & Cross-Drilled Rotors...")
    turbina = build_campagnolo_turbina_wheel_micro_jewelry(col, MATS)

    print("[PHASE 2] Dressing Twin-Cam Nord Alloy Engine, Webers & Headers...")
    engine = build_engine_bay_twin_cam_nord_jewelry(col, MATS)

    print("[PHASE 2] Installing Jaeger Gauge Binnacles & Wood-Rim Wheel...")
    cockpit = build_cockpit_windshield_cowl_and_dash_trim(col, MATS)

    print("[PHASE 2] Fabricating Sump Skid Guard & Differential Trunnion...")
    subframe = build_chassis_underbody_drainage_and_reinforcements(col, MATS)

    print("[PHASE 2] Upholstering Fluted Bucket Seats & Lift-Latch Lap Belts...")
    seats = build_interior_bucket_seats_and_lap_belts(col, MATS)

    print("[PHASE 2] Wiring Bosch Blue Coil, Ballast Resistor & Fiamm Air Horns...")
    ignition = build_engine_bay_ignition_and_air_horns(col, MATS)

    print("[PHASE 2] Stowing Trunk Spare Wheel Wing-Clamp & Vintage Tool Roll...")
    trunk = build_trunk_spare_wheel_and_tool_roll_hardware(col, MATS)

    print("[PHASE 2] Mounting Burman Steering Box, Pitman Arm & Center Drag Link...")
    steering = build_chassis_front_subframe_and_steering_box_jewelry(col, MATS)

    # Export target paths
    export_targets = [
        r"E:\Car_Automation\exports\Car_Alfa_Romeo_Spider_Veloce_1970s.glb",
        r"E:\Car_Automation\public\models\Car_Alfa_Romeo_Spider_Veloce_1970s.glb",
        r"E:\Car_Automation\public\models\vehicles\convertible\1970s\vehicle.glb"
    ]

    for p in export_targets:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        print(f"[EXPORT] Writing Complete Master GLB to: {p}")
        bpy.ops.wm.save_mainfile(filepath=r"E:\Car_Automation\exports\temp_spider.blend")
        bpy.ops.export_scene.gltf(
            filepath=p,
            export_format='GLB',
            use_selection=False,
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        file_size_mb = os.path.getsize(p) / (1024 * 1024)
        print(f"[SUCCESS] Exported {p} ({file_size_mb:.2f} MB)")

    print("=============================================================================")
    print("Alfa Romeo Spider Veloce Series 2 Coda Tronca (Phase 1 + 2 Complete) Done!")
    print("=============================================================================")


if __name__ == "__main__":
    build_alfa_spider_master_complete()
