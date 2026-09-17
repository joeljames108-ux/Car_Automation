"""
=============================================================================
Procedural Class-A CAD Generator: Mercedes-Benz 560SL R107 (1980s)
PHASE 2: Micro-Detailing, Exterior Jewelry, Lighting Optics & Badging
=============================================================================
Convertible Architecture · 1980s Era Grand Touring Roadster Icon (1986–1989 R107)
Manufactured in Sindelfingen, West Germany.
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Phase 2 Architectural Scope:
1. Complete PBR Material Suite for Micro-Jewelry:
   - Mercedes Astral Silver Metallic Clearcoat Paint (DB 735 Astralsilber)
   - Mirror-Polished High-Gloss Automotive Chrome (Grille, Star, Bumpers, Bezels)
   - Optical Fluted Headlamp Prismatic Glass (Bosch/Hella ECE & US DOT specification)
   - Patented Dirt-Shedding Ribbed Taillamp Ruby Red (Mercedes Patent DE1950893)
   - Mercedes Turn Indicator High-Intensity Amber (Front wrap and rear top tier)
   - Crystal Clear Reverse Lamp Prismatic Lens (Bottom inner chamber)
   - Satin Black Grille Backing Eggcrate & Underbody Trim
   - Heavy Neoprene Bumper Rub-Strip Impact Rubber (5-mph DOT impact compliance)
   - Gold & Blue Enamel Mercedes-Benz Laurel Wreath Roundel (Stuttgart-Untertürkheim)
   - High-Reflectivity Silver Mirror Backing (Driver teardrop & passenger electric)
2. Precision CAD Subsystems:
   - 3D Chrome Grille Assembly with 9 Horizontal Slats and 100mm Three-Pointed Star
   - Dual Composite Headlamp Clusters with Halogen Filament Bulbs & Parabolic Reflectors
   - Wraparound Ribbed Amber Corner Turn Signals & Lower Chin Halogen Fog Lamps
   - Patented 8-Rib Dirt-Shedding Taillamp Clusters with Partitioned Reflector Chambers
   - Heavy Chrome Wrap-Around Bumpers with Neoprene Strips & Overriders
   - Exterior Mirrors (Teardrop Driver, Electric Passenger) & Chrome Door Handles
   - Body Side Protective Mouldings with Chrome Beading & Rocker Sill Trim Strips
   - Die-Cast Chrome "560 SL" Rear Badging & Trunk Lock Rosette
   - Hirschmann Power Telescoping Radio Antenna with Angled Rubber Fender Grommet
   - Windshield Upper Header Frame, Sun Visors & Interior Rearview Mirror
   - Soft-Top Storage Tonneau Hatch Lid & Radiator Support Data Plates
   - Thermoplastic Inner Fender Liners & Mercedes Star Rear Rubber Mudflaps
   - Ribbed Trunk Floor Carpet, Full-Sized Bundt Spare Wheel & Tool Pouch
   - Exterior-Visible Cockpit Silhouettes: Steering Wheel, Bucket Seats, Console Shifter
   - Underhood M117 V8 Dual-Snorkel Air Cleaner Housing & Valve Covers
3. Precision CAD Helper Geometry Library:
   - Blender 5.x LTS compatibility polyfills
   - Vertex welding and smooth normal preservation
   - Angle-limited CAD beveling and WeightedNormal modifiers
   - Oriented cylindrical and box extruders
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

# Compatibility polyfills for bmesh.ops in Blender 5.x
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
# 1. SCENE CLEANUP & SETUP
# ---------------------------------------------------------------------------
def reset_scene_phase2():
    """Purge all existing objects, meshes, and orphan data blocks."""
    if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    block_types = [bpy.data.meshes, bpy.data.textures, bpy.data.curves]
    for block_type in block_types:
        for item in list(block_type):
            if item.users == 0:
                block_type.remove(item)

reset_scene_phase2()


# ---------------------------------------------------------------------------
# 2. PBR MATERIAL FACTORY & SHADER SUITE
# ---------------------------------------------------------------------------
def create_pbr_material_p2(name, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0,
                           roughness=0.5, clearcoat=0.0, transmission=0.0,
                           ior=1.45, emission_color=(0, 0, 0, 1.0), emission_strength=0.0):
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    
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


print("[SETUP] Constructing Mercedes-Benz 560SL R107 Phase 2 PBR Material Suite...")

# 1. Astral Silver Metallic Body Paint (#929497, Clearcoat 1.0)
mat_p2_paint = create_pbr_material_p2("P2_Mercedes_Astral_Silver",
                                      base_color=(0.68, 0.70, 0.72, 1.0),
                                      metallic=0.78,
                                      roughness=0.16,
                                      clearcoat=1.0,
                                      ior=1.52)

# 2. Mirror-Polished Automotive Chrome (Grille slats, Star, Bumper face, Mirrors)
mat_p2_chrome = create_pbr_material_p2("P2_Mercedes_Mirror_Chrome",
                                       base_color=(0.96, 0.96, 0.97, 1.0),
                                       metallic=0.99,
                                       roughness=0.02,
                                       clearcoat=1.0)

# 3. Fluted Optical Headlamp Glass
mat_p2_headlamp_glass = create_pbr_material_p2("P2_Headlamp_Fluted_Glass",
                                               base_color=(0.95, 0.97, 1.0, 1.0),
                                               metallic=0.02,
                                               roughness=0.03,
                                               transmission=0.92,
                                               ior=1.52)

# 4. Headlamp Silvered Parabolic Reflector Surface
mat_p2_reflector = create_pbr_material_p2("P2_Headlamp_Parabolic_Reflector",
                                          base_color=(0.92, 0.93, 0.95, 1.0),
                                          metallic=0.95,
                                          roughness=0.05)

# 5. Halogen Tungsten Filament Emissive Element
mat_p2_filament = create_pbr_material_p2("P2_Halogen_Bulb_Filament",
                                         base_color=(1.0, 0.95, 0.85, 1.0),
                                         emission_color=(1.0, 0.92, 0.75, 1.0),
                                         emission_strength=4.5)

# 6. Turn Signal Amber Fluted Lens
mat_p2_indicator_amber = create_pbr_material_p2("P2_Indicator_Amber_Fluted",
                                                base_color=(1.0, 0.52, 0.02, 1.0),
                                                metallic=0.04,
                                                roughness=0.06,
                                                transmission=0.86,
                                                ior=1.53)

# 7. Mercedes Ribbed Taillamp Ruby Red
mat_p2_taillamp_ruby = create_pbr_material_p2("P2_Taillamp_Ruby_Ribbed",
                                              base_color=(0.85, 0.03, 0.05, 1.0),
                                              metallic=0.04,
                                              roughness=0.06,
                                              transmission=0.88,
                                              ior=1.54)

# 8. Reversing Lamp Crystal Clear Fluted Lens
mat_p2_reverse_clear = create_pbr_material_p2("P2_Reversing_Clear_Fluted",
                                              base_color=(0.92, 0.95, 0.98, 1.0),
                                              metallic=0.02,
                                              roughness=0.05,
                                              transmission=0.90,
                                              ior=1.52)

# 9. Neoprene Black Bumper Impact Rubber
mat_p2_neoprene_rubber = create_pbr_material_p2("P2_Neoprene_Impact_Rubber",
                                                base_color=(0.04, 0.04, 0.042, 1.0),
                                                metallic=0.0,
                                                roughness=0.68)

# 10. Satin Black Grille Eggcrate & Underbody Trim
mat_p2_satin_black = create_pbr_material_p2("P2_Satin_Black_Trim",
                                            base_color=(0.045, 0.045, 0.048, 1.0),
                                            metallic=0.12,
                                            roughness=0.55)

# 11. Mercedes Laurel Wreath Blue & Gold Enamel
mat_p2_enamel_blue = create_pbr_material_p2("P2_Enamel_Badge_Blue",
                                            base_color=(0.02, 0.12, 0.45, 1.0),
                                            metallic=0.25,
                                            roughness=0.15,
                                            clearcoat=1.0)

mat_p2_enamel_gold = create_pbr_material_p2("P2_Enamel_Badge_Gold",
                                            base_color=(0.88, 0.72, 0.20, 1.0),
                                            metallic=0.85,
                                            roughness=0.22,
                                            clearcoat=0.8)

# 12. Rear License Plate White Reflective Enamel
mat_p2_license_plate = create_pbr_material_p2("P2_License_Plate_Reflective",
                                              base_color=(0.92, 0.92, 0.90, 1.0),
                                              metallic=0.10,
                                              roughness=0.30)

MATS_P2 = {
    "paint": mat_p2_paint,
    "chrome": mat_p2_chrome,
    "headlamp": mat_p2_headlamp_glass,
    "reflector": mat_p2_reflector,
    "filament": mat_p2_filament,
    "amber": mat_p2_indicator_amber,
    "ruby": mat_p2_taillamp_ruby,
    "reverse": mat_p2_reverse_clear,
    "rubber": mat_p2_neoprene_rubber,
    "black_trim": mat_p2_satin_black,
    "enamel_blue": mat_p2_enamel_blue,
    "enamel_gold": mat_p2_enamel_gold,
    "license": mat_p2_license_plate,
}


# ---------------------------------------------------------------------------
# 3. GEOMETRIC HELPER UTILITIES
# ---------------------------------------------------------------------------
def link_obj_p2(name, bm, parent_col, mat, bevel=0.0015):
    """Instantiates bmesh to Blender object, welds coincident vertices, applies smooth shading and bevel."""
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0003)
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
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


def create_cylinder_between_p2(bm, p1, p2, radius=0.010, segments=12):
    v = p2 - p1
    length = v.length
    if length < 1e-6:
        return None
    mid = (p1 + p2) * 0.5
    rot = Vector((0, 0, 1)).rotation_difference(v.normalized()).to_matrix().to_4x4()
    mat = Matrix.Translation(mid) @ rot
    return bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segments,
                                 radius1=radius, radius2=radius, depth=length, matrix=mat)


def create_curved_tube_p2(bm, points, radius=0.010, segments=8):
    for i in range(len(points) - 1):
        create_cylinder_between_p2(bm, points[i], points[i+1], radius=radius, segments=segments)
        if i < len(points) - 2:
            bmesh.ops.create_icosphere(bm, subdivisions=1, radius=radius,
                                       matrix=Matrix.Translation(points[i+1]))


def create_oriented_box_between_p2(bm, p1, p2, width=0.020, height=0.010):
    v = p2 - p1
    length = v.length
    if length < 1e-6:
        return None
    mid = (p1 + p2) * 0.5
    rot = Vector((0, 1, 0)).rotation_difference(v.normalized()).to_matrix().to_4x4()
    mat = Matrix.Translation(mid) @ rot @ Matrix.Scale(width, 4, Vector((1, 0, 0))) @ Matrix.Scale(length, 4, Vector((0, 1, 0))) @ Matrix.Scale(height, 4, Vector((0, 0, 1)))
    return bmesh.ops.create_cube(bm, size=1.0, matrix=mat)
"""
=============================================================================
Procedural Class-A CAD Generator: Mercedes-Benz 560SL R107 (1980s)
PHASE 2 (Part 2): 3D Chrome Grille, 100mm Mercedes Star & Hood Enamel Badge
=============================================================================
Authentic front identity jewelry:
- Trapezoidal mirror-polished chrome grille surround frame
- 9 horizontal chrome slats with radiused aerodynamic leading edges
- Vertical center chrome dividing spine bar
- High-density satin black eggcrate backing mesh
- Central 100mm 3D faceted chrome three-pointed Mercedes star & outer ring
- Blue enamel and gold laurel wreath Mercedes-Benz hood emblem roundel
=============================================================================
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler


def build_r107_chrome_grille_and_mercedes_star(parent_col, mats):
    """
    Constructs the 3D chrome grille assembly, 9 horizontal chrome slats,
    black eggcrate mesh, central 100mm star in ring, and hood laurel emblem.
    """
    bm_chrome  = bmesh.new()
    bm_mesh    = bmesh.new()
    bm_enamel  = bmesh.new()
    bm_gold    = bmesh.new()

    # Grille center location (Front nose plane)
    gy = 2.140
    gz = 0.535

    # -------------------------------------------------------------------------
    # 1. Trapezoidal Chrome Grille Surround Frame
    # -------------------------------------------------------------------------
    # Frame corner coordinates
    # Top width: 0.820m (X = +/- 0.410m), Top Z: 0.690m
    # Bottom width: 0.740m (X = +/- 0.370m), Bottom Z: 0.380m
    top_w = 0.410
    bot_w = 0.370
    z_top = 0.690
    z_bot = 0.380

    frame_corners = [
        Vector((-top_w, gy - 0.015, z_top)),
        Vector(( top_w, gy - 0.015, z_top)),
        Vector(( bot_w, gy + 0.010, z_bot)),
        Vector((-bot_w, gy + 0.010, z_bot)),
    ]

    # Upper horizontal chrome header bar
    create_cylinder_between_p2(bm_chrome, frame_corners[0], frame_corners[1], radius=0.016, segments=12)
    # Lower horizontal chrome sill rail
    create_cylinder_between_p2(bm_chrome, frame_corners[3], frame_corners[2], radius=0.014, segments=12)
    # Left angled chrome stile
    create_cylinder_between_p2(bm_chrome, frame_corners[3], frame_corners[0], radius=0.015, segments=12)
    # Right angled chrome stile
    create_cylinder_between_p2(bm_chrome, frame_corners[2], frame_corners[1], radius=0.015, segments=12)

    # Beveled chrome outer aesthetic lip trim
    create_oriented_box_between_p2(bm_chrome,
                                  frame_corners[0] + Vector((0, -0.008, 0.008)),
                                  frame_corners[1] + Vector((0, -0.008, 0.008)),
                                  width=0.022, height=0.010)

    # -------------------------------------------------------------------------
    # 2. 9 Horizontal Chrome Slats
    # -------------------------------------------------------------------------
    num_slats = 9
    for s_idx in range(num_slats):
        st = s_idx / (num_slats - 1)
        sz = z_bot + 0.025 + st * (z_top - z_bot - 0.050)
        sw = bot_w + st * (top_w - bot_w) - 0.015
        sy = gy + 0.010 - st * 0.025

        p_left  = Vector((-sw, sy, sz))
        p_right = Vector(( sw, sy, sz))

        # Chrome slat blade (radiused nose, tapered rear)
        create_cylinder_between_p2(bm_chrome, p_left, p_right, radius=0.006, segments=8)
        # Slat horizontal shelf depth
        create_oriented_box_between_p2(bm_chrome,
                                      p_left - Vector((0, 0.018, 0)),
                                      p_right - Vector((0, 0.018, 0)),
                                      width=0.004, height=0.008)

    # -------------------------------------------------------------------------
    # 3. Vertical Center Chrome Dividing Spine
    # -------------------------------------------------------------------------
    p_spine_top = Vector((0.0, gy - 0.015, z_top))
    p_spine_bot = Vector((0.0, gy + 0.010, z_bot))
    create_cylinder_between_p2(bm_chrome, p_spine_top, p_spine_bot, radius=0.012, segments=10)
    create_oriented_box_between_p2(bm_chrome,
                                  p_spine_top - Vector((0, 0.015, 0)),
                                  p_spine_bot - Vector((0, 0.015, 0)),
                                  width=0.018, height=0.014)

    # -------------------------------------------------------------------------
    # 4. Satin Black Eggcrate Backing Grille Mesh
    # -------------------------------------------------------------------------
    # Solid black rear air intake backing baffle
    bmesh.ops.create_cube(bm_mesh, size=1.0,
                          matrix=Matrix.Translation((0.0, gy - 0.040, gz)) @
                                 Matrix.Scale(0.760, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.010, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.300, 4, Vector((0, 0, 1))))

    # Vertical black eggcrate divider ribs (16 fine vertical fins behind slats)
    num_vert_fins = 16
    for vi in range(num_vert_fins):
        vt = (vi / (num_vert_fins - 1)) * 2.0 - 1.0  # -1.0 to +1.0
        vx = vt * 0.350
        if abs(vx) < 0.020:
            continue  # Skip center spine
        create_cylinder_between_p2(bm_mesh,
                                  Vector((vx, gy - 0.020, z_top - 0.015)),
                                  Vector((vx, gy - 0.010, z_bot + 0.015)),
                                  radius=0.003, segments=6)

    # -------------------------------------------------------------------------
    # 5. Central 100mm 3D Faceted Chrome Three-Pointed Mercedes Star
    # -------------------------------------------------------------------------
    # Star center is positioned on the central spine at Z = 0.535m
    star_center = Vector((0.0, gy - 0.002, gz))
    star_r = 0.065  # Outer radius of star circle (130mm overall diameter)

    # Chrome outer circular star ring
    bmesh.ops.create_torus(bm_chrome, major_radius=star_r, minor_radius=0.006,
                           major_segments=24, minor_segments=8,
                           matrix=Matrix.Translation(star_center) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))

    # Central star hub boss
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=16, radius=0.016, depth=0.014,
                              matrix=Matrix.Translation(star_center) @ Matrix.Rotation(math.radians(90.0), 4, 'Y'))

    # Three 3D Faceted Star Rays (Angles: 90° straight up, 210° lower left, 330° lower right)
    ray_angles = [math.radians(90.0), math.radians(210.0), math.radians(330.0)]
    star_depth = 0.015  # 3D relief forward projection

    for ang in ray_angles:
        # Tip of star ray touching inner ring
        tip_x = (star_r - 0.006) * math.cos(ang)
        tip_z = (star_r - 0.006) * math.sin(ang)
        p_tip = star_center + Vector((tip_x, 0.004, tip_z))

        # Base width perpendicular to ray
        perp_ang = ang + math.pi * 0.5
        bw = 0.014
        p_b1 = star_center + Vector((bw * math.cos(perp_ang), 0.000, bw * math.sin(perp_ang)))
        p_b2 = star_center - Vector((bw * math.cos(perp_ang), 0.000, bw * math.sin(perp_ang)))

        # Center raised spine peak of the faceted ray
        p_peak = star_center + Vector((0.45 * tip_x, 0.010, 0.45 * tip_z))

        # Build 4 faceted triangular faces per ray
        v_tip  = bm_chrome.verts.new(p_tip)
        v_b1   = bm_chrome.verts.new(p_b1)
        v_b2   = bm_chrome.verts.new(p_b2)
        v_peak = bm_chrome.verts.new(p_peak)
        v_hub  = bm_chrome.verts.new(star_center + Vector((0, 0.006, 0)))

        # 4 facets meeting at central crease line
        bm_chrome.faces.new((v_hub, v_b1, v_peak))
        bm_chrome.faces.new((v_hub, v_peak, v_b2))
        bm_chrome.faces.new((v_peak, v_b1, v_tip))
        bm_chrome.faces.new((v_peak, v_tip, v_b2))

    # -------------------------------------------------------------------------
    # 6. Mercedes-Benz Laurel Wreath Blue & Gold Hood Roundel Emblem
    # -------------------------------------------------------------------------
    # Positioned flat on the hood leading edge centered above the grille
    emblem_pos = Vector((0.0, 2.050, 0.730))
    emblem_rot = Matrix.Rotation(math.radians(-14.0), 4, 'X')

    # Chrome outer bezel rim
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=20, radius=0.024, depth=0.005,
                              matrix=Matrix.Translation(emblem_pos) @ emblem_rot)

    # Gold circular laurel wreath ring
    bmesh.ops.create_torus(bm_gold, major_radius=0.018, minor_radius=0.002,
                           major_segments=20, minor_segments=6,
                           matrix=Matrix.Translation(emblem_pos + Vector((0, 0, 0.002))) @ emblem_rot)

    # Dark blue enamel center disc
    bmesh.ops.create_cylinder(bm_enamel, cap_ends=True, segments=18, radius=0.016, depth=0.003,
                              matrix=Matrix.Translation(emblem_pos + Vector((0, 0, 0.003))) @ emblem_rot)

    # Tiny 3D silver star in center of roundel
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=10, radius=0.005, depth=0.004,
                              matrix=Matrix.Translation(emblem_pos + Vector((0, 0, 0.005))) @ emblem_rot)
    for bi in range(3):
        bang = bi * (2.0 * math.pi / 3.0) + math.pi * 0.5
        create_cylinder_between_p2(bm_chrome,
                                  emblem_pos + Vector((0, 0, 0.005)),
                                  emblem_pos + Vector((0.009 * math.cos(bang), 0, 0.009 * math.sin(bang) + 0.005)),
                                  radius=0.001, segments=4)

    obj_chm = link_obj_p2("GEO_R107_Chrome_Grille_Assembly", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_msh = link_obj_p2("GEO_R107_Grille_Backing_Mesh", bm_mesh, parent_col, mats["black_trim"], bevel=0.0005)
    obj_enm = link_obj_p2("GEO_R107_Hood_Enamel_Badge_Blue", bm_enamel, parent_col, mats["enamel_blue"], bevel=0.0005)
    obj_gld = link_obj_p2("GEO_R107_Hood_Laurel_Gold", bm_gold, parent_col, mats["enamel_gold"], bevel=0.0005)

    return [obj_chm, obj_msh, obj_enm, obj_gld]
"""
=============================================================================
Procedural Class-A CAD Generator: Mercedes-Benz 560SL R107 (1980s)
PHASE 2 (Part 3): Dual Headlamp Optics, Corner Indicators & Chin Fog Lamps
=============================================================================
Authentic front lighting engineering:
- Dual composite sealed-beam halogen headlamp clusters with silvered parabolic cups
- Glowing tungsten/halogen emissive filament capsules and chrome bezel rings
- Outer optical fluted prismatic glass lenses with vertical beam spread fluting
- Wraparound ribbed amber corner turn indicators (Mercedes patent dirt-shedding)
- Lower air dam rectangular halogen fog lamps with clear fluted lenses & stone guards
- Headlamp aiming adjustment screws and neoprene perimeter mounting gaskets
=============================================================================
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler


def build_r107_headlight_assemblies_and_corner_indicators(parent_col, mats):
    """
    Constructs high-fidelity headlamp clusters, dual parabolic reflector bowls,
    halogen bulbs, fluted optical lenses, corner indicators, and chin fog lamps.
    """
    bm_glass     = bmesh.new()
    bm_reflector = bmesh.new()
    bm_filament  = bmesh.new()
    bm_chrome    = bmesh.new()
    bm_amber     = bmesh.new()
    bm_housing   = bmesh.new()
    bm_rubber    = bmesh.new()

    # -------------------------------------------------------------------------
    # 1. Dual Composite Sealed-Beam Headlamp Assemblies (Left & Right)
    # -------------------------------------------------------------------------
    hl_z = 0.545
    hl_y = 2.080

    for side in [1.0, -1.0]:
        # Center of headlamp bucket
        hx_center = 0.580 * side

        # Outer Composite Headlamp Bucket Housing (Pressed steel backing tub)
        bmesh.ops.create_cube(bm_housing, size=1.0,
                              matrix=Matrix.Translation((hx_center, hl_y - 0.040, hl_z)) @
                                     Matrix.Scale(0.320, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.120, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.190, 4, Vector((0, 0, 1))))

        # Neoprene perimeter weather gasket
        bmesh.ops.create_cube(bm_rubber, size=1.0,
                              matrix=Matrix.Translation((hx_center, hl_y + 0.015, hl_z)) @
                                     Matrix.Scale(0.328, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.015, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.198, 4, Vector((0, 0, 1))))

        # Headlamp Dual Lamp Configurations:
        # Lamp 1: Low-Beam Outer Lamp (X = 0.650 * side)
        # Lamp 2: High-Beam Inner Lamp (X = 0.510 * side)
        lamps = [
            (hx_center + 0.070 * side, "Low_Beam",  0.072),
            (hx_center - 0.070 * side, "High_Beam", 0.070),
        ]

        for lx, lname, lradius in lamps:
            l_pos = Vector((lx, hl_y, hl_z))

            # Silvered Parabolic Reflector Bowl (concave parabolic reflector)
            bmesh.ops.create_cylinder(bm_reflector, cap_ends=True, segments=20,
                                      radius1=lradius, radius2=0.018, depth=0.045,
                                      matrix=Matrix.Translation(l_pos - Vector((0, 0.022, 0))) @
                                             Matrix.Rotation(math.radians(90.0), 4, 'X'))

            # Central Halogen H4 / 9004 Filament Capsule Bulb
            bmesh.ops.create_cylinder(bm_glass, cap_ends=True, segments=10, radius=0.007, depth=0.022,
                                      matrix=Matrix.Translation(l_pos - Vector((0, 0.012, 0))) @
                                             Matrix.Rotation(math.radians(90.0), 4, 'X'))
            # Emissive Tungsten Filament Core
            bmesh.ops.create_cylinder(bm_filament, cap_ends=True, segments=8, radius=0.003, depth=0.010,
                                      matrix=Matrix.Translation(l_pos - Vector((0, 0.012, 0))) @
                                             Matrix.Rotation(math.radians(90.0), 4, 'X'))

            # Chrome Inner Lamp Bezel Retaining Ring
            bmesh.ops.create_torus(bm_chrome, major_radius=lradius + 0.002, minor_radius=0.003,
                                   major_segments=24, minor_segments=6,
                                   matrix=Matrix.Translation(l_pos + Vector((0, 0.002, 0))) @
                                          Matrix.Rotation(math.radians(90.0), 4, 'X'))

            # Outer Fluted Optical Glass Lens (Rectangular/Curved with internal prismatic flutes)
            bmesh.ops.create_cube(bm_glass, size=1.0,
                                  matrix=Matrix.Translation(l_pos + Vector((0, 0.012, 0))) @
                                         Matrix.Scale(lradius * 2.05, 4, Vector((1, 0, 0))) @
                                         Matrix.Scale(0.006, 4, Vector((0, 1, 0))) @
                                         Matrix.Scale(lradius * 2.05, 4, Vector((0, 0, 1))))

            # Vertical Prismatic Fluting Ribs inside the glass lens
            for fi in range(7):
                fx = lx + (fi - 3) * (lradius * 0.28)
                create_cylinder_between_p2(bm_glass,
                                          Vector((fx, hl_y + 0.010, hl_z - lradius * 0.85)),
                                          Vector((fx, hl_y + 0.010, hl_z + lradius * 0.85)),
                                          radius=0.002, segments=6)

        # Chrome Surround Trim Frame enclosing both headlamp units
        bmesh.ops.create_cube(bm_chrome, size=1.0,
                              matrix=Matrix.Translation((hx_center, hl_y + 0.016, hl_z)) @
                                     Matrix.Scale(0.316, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.008, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.185, 4, Vector((0, 0, 1))))

        # Slotted Headlamp Aiming Screws (Upper outside corner and lower inside corner)
        for ax, az in [(hx_center + 0.140 * side, hl_z + 0.075), (hx_center - 0.130 * side, hl_z - 0.075)]:
            bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=10, radius=0.005, depth=0.012,
                                      matrix=Matrix.Translation((ax, hl_y + 0.018, az)) @
                                             Matrix.Rotation(math.radians(90.0), 4, 'X'))

    # -------------------------------------------------------------------------
    # 2. Wraparound Ribbed Amber Corner Turn Indicators (Left & Right)
    # -------------------------------------------------------------------------
    for side in [1.0, -1.0]:
        # Corner turn signal wraps around fender front corner
        cx = 0.810 * side
        cy = 1.990
        cz = hl_z

        # Amber outer lens body (curved around corner)
        bmesh.ops.create_cube(bm_amber, size=1.0,
                              matrix=Matrix.Translation((cx, cy, cz)) @
                                     Matrix.Rotation(math.radians(-18.0 * side), 4, 'Z') @
                                     Matrix.Scale(0.110, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.160, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.170, 4, Vector((0, 0, 1))))

        # Mercedes DE1950893 Dirt-Shedding Horizontal Ribs across amber lens face
        num_ribs = 6
        for ri in range(num_ribs):
            rz = cz - 0.065 + ri * 0.026
            bmesh.ops.create_cylinder(bm_amber, cap_ends=True, segments=12, radius=0.005, depth=0.150,
                                      matrix=Matrix.Translation((cx + 0.006 * side, cy, rz)) @
                                             Matrix.Rotation(math.radians(-18.0 * side), 4, 'Z') @
                                             Matrix.Rotation(math.radians(90.0), 4, 'Y'))

        # Internal silvered reflector cup & amber bulb
        bmesh.ops.create_cylinder(bm_reflector, cap_ends=True, segments=12, radius=0.028, depth=0.035,
                                  matrix=Matrix.Translation((cx - 0.020 * side, cy, cz)) @
                                         Matrix.Rotation(math.radians(90.0), 4, 'X'))
        bmesh.ops.create_icosphere(bm_amber, subdivisions=1, radius=0.014,
                                   matrix=Matrix.Translation((cx - 0.020 * side, cy, cz)))

        # Black rubber corner gasket surround
        bmesh.ops.create_cube(bm_rubber, size=1.0,
                              matrix=Matrix.Translation((cx, cy - 0.015, cz)) @
                                     Matrix.Rotation(math.radians(-18.0 * side), 4, 'Z') @
                                     Matrix.Scale(0.116, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.168, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.178, 4, Vector((0, 0, 1))))

    # -------------------------------------------------------------------------
    # 3. Integrated Lower Chin Air Dam Halogen Fog Lamps
    # -------------------------------------------------------------------------
    for side in [1.0, -1.0]:
        fx = 0.380 * side
        fy = 2.110
        fz = 0.285

        # Rectangular die-cast fog lamp housing
        bmesh.ops.create_cube(bm_housing, size=1.0,
                              matrix=Matrix.Translation((fx, fy - 0.025, fz)) @
                                     Matrix.Scale(0.140, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.060, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.065, 4, Vector((0, 0, 1))))

        # Chrome front bezel surround frame
        bmesh.ops.create_cube(bm_chrome, size=1.0,
                              matrix=Matrix.Translation((fx, fy + 0.005, fz)) @
                                     Matrix.Scale(0.146, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.010, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.070, 4, Vector((0, 0, 1))))

        # Clear optical fluted glass lens
        bmesh.ops.create_cube(bm_glass, size=1.0,
                              matrix=Matrix.Translation((fx, fy + 0.006, fz)) @
                                     Matrix.Scale(0.134, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.006, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.058, 4, Vector((0, 0, 1))))

        # Internal parabolic reflector and H3 halogen bulb
        bmesh.ops.create_cylinder(bm_reflector, cap_ends=True, segments=14, radius=0.024, depth=0.028,
                                  matrix=Matrix.Translation((fx, fy - 0.010, fz)) @
                                         Matrix.Rotation(math.radians(90.0), 4, 'X'))
        bmesh.ops.create_cylinder(bm_filament, cap_ends=True, segments=8, radius=0.003, depth=0.008,
                                  matrix=Matrix.Translation((fx, fy - 0.005, fz)) @
                                         Matrix.Rotation(math.radians(90.0), 4, 'X'))

        # Fine horizontal protective stone guard wire slats (3 slats across fog lens)
        for sgi in [-0.018, 0.0, 0.018]:
            create_cylinder_between_p2(bm_chrome,
                                      Vector((fx - 0.065, fy + 0.010, fz + sgi)),
                                      Vector((fx + 0.065, fy + 0.010, fz + sgi)),
                                      radius=0.0015, segments=6)

    obj_gls = link_obj_p2("GEO_R107_Headlamp_Glass_Lenses", bm_glass, parent_col, mats["headlamp"], bevel=0.0005)
    obj_ref = link_obj_p2("GEO_R107_Headlamp_Reflectors", bm_reflector, parent_col, mats["reflector"], bevel=0.0005)
    obj_fil = link_obj_p2("GEO_R107_Halogen_Filaments", bm_filament, parent_col, mats["filament"], bevel=0.0005)
    obj_chm = link_obj_p2("GEO_R107_Headlamp_Chrome_Bezels", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_amb = link_obj_p2("GEO_R107_Corner_Turn_Indicators", bm_amber, parent_col, mats["amber"], bevel=0.0005)
    obj_hsg = link_obj_p2("GEO_R107_Headlamp_Housings", bm_housing, parent_col, mats["black_trim"], bevel=0.001)
    obj_rub = link_obj_p2("GEO_R107_Headlamp_Rubber_Seals", bm_rubber, parent_col, mats["rubber"], bevel=0.0005)

    return [obj_gls, obj_ref, obj_fil, obj_chm, obj_amb, obj_hsg, obj_rub]
"""
=============================================================================
Procedural Class-A CAD Generator: Mercedes-Benz 560SL R107 (1980s)
PHASE 2 (Part 4): Patented DE1950893 Ribbed Dirt-Shedding Taillamp Clusters
=============================================================================
Authentic rear lighting engineering:
- Mercedes-Benz patented (DE1950893) dirt-deflecting horizontal aerofoil ribs
- 8 deep horizontal shedding ribs per lamp keeping lenses clean in heavy highway rain
- Tri-color segmented polycarbonate lenses:
  * Upper tier: High-intensity amber turn indicator
  * Middle tier: Deep ruby red tail and brake light
  * Lower inner tier: Crystal clear reversing back-up lens with prismatic flutes
  * Lower outer tier: Red reflex retro-reflector prism panel
- Internal chrome-partitioned parabolic reflector chambers with dual-filament bulbs
- Perimeter chrome accent trim bead and molded neoprene body weatherseals
=============================================================================
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler


def build_r107_dirt_shedding_ribbed_taillights(parent_col, mats):
    """
    Constructs the patented ribbed dirt-shedding rear taillight clusters,
    internal parabolic reflectors, multi-tier color lenses, and bulbs.
    """
    bm_ruby      = bmesh.new()
    bm_amber     = bmesh.new()
    bm_clear     = bmesh.new()
    bm_reflector = bmesh.new()
    bm_filament  = bmesh.new()
    bm_chrome    = bmesh.new()
    bm_rubber    = bmesh.new()
    bm_housing   = bmesh.new()

    tl_y = -2.185
    tl_z = 0.535

    # -------------------------------------------------------------------------
    # 1. Left and Right Taillamp Assembly Housings
    # -------------------------------------------------------------------------
    for side in [1.0, -1.0]:
        tx_cen = 0.640 * side
        tw = 0.320  # Overall width of taillamp cluster (320mm)
        th = 0.200  # Overall height of taillamp cluster (200mm)
        td = 0.080  # Depth of lamp bucket

        # Die-cast composite rear housing tub recessed into rear transom
        bmesh.ops.create_cube(bm_housing, size=1.0,
                              matrix=Matrix.Translation((tx_cen, tl_y + 0.035, tl_z)) @
                                     Matrix.Scale(tw, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(td, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(th, 4, Vector((0, 0, 1))))

        # Neoprene body perimeter seal gasket
        bmesh.ops.create_cube(bm_rubber, size=1.0,
                              matrix=Matrix.Translation((tx_cen, tl_y - 0.004, tl_z)) @
                                     Matrix.Scale(tw + 0.012, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(th + 0.012, 4, Vector((0, 0, 1))))

        # Perimeter chrome accent trim bead
        create_oriented_box_between_p2(bm_chrome,
                                      Vector((tx_cen - (tw*0.5 + 0.004)*side, tl_y - 0.008, tl_z - th*0.5)),
                                      Vector((tx_cen + (tw*0.5 + 0.004)*side, tl_y - 0.008, tl_z - th*0.5)),
                                      width=0.006, height=0.006)
        create_oriented_box_between_p2(bm_chrome,
                                      Vector((tx_cen - (tw*0.5 + 0.004)*side, tl_y - 0.008, tl_z + th*0.5)),
                                      Vector((tx_cen + (tw*0.5 + 0.004)*side, tl_y - 0.008, tl_z + th*0.5)),
                                      width=0.006, height=0.006)

        # ---------------------------------------------------------------------
        # 2. Internal Partitioned Chrome Reflector Chambers & Bulbs
        # ---------------------------------------------------------------------
        # 4 distinct light chambers:
        # Chamber 1: Turn Signal (Top, full width)
        # Chamber 2: Brake Light (Middle outer)
        # Chamber 3: Tail Light (Middle inner)
        # Chamber 4: Reversing Lamp (Bottom inner)
        chambers = [
            (tx_cen,                  tl_z + 0.055, 0.280, 0.060, "Amber_Turn"),
            (tx_cen + 0.065 * side,   tl_z - 0.005, 0.130, 0.060, "Ruby_Brake"),
            (tx_cen - 0.065 * side,   tl_z - 0.005, 0.130, 0.060, "Ruby_Tail"),
            (tx_cen - 0.065 * side,   tl_z - 0.060, 0.130, 0.050, "Clear_Reverse"),
        ]

        for cx, cz, cw, ch, cname in chambers:
            # Silvered parabolic reflector cavity
            bmesh.ops.create_cube(bm_reflector, size=1.0,
                                  matrix=Matrix.Translation((cx, tl_y + 0.020, cz)) @
                                         Matrix.Scale(cw, 4, Vector((1, 0, 0))) @
                                         Matrix.Scale(0.040, 4, Vector((0, 1, 0))) @
                                         Matrix.Scale(ch, 4, Vector((0, 0, 1))))

            # Dual-filament bayonet bulb socket & glass bulb globe
            bulb_pos = Vector((cx, tl_y + 0.015, cz))
            bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=8, radius=0.009, depth=0.018,
                                      matrix=Matrix.Translation(bulb_pos + Vector((0, 0.010, 0))) @
                                             Matrix.Rotation(math.radians(90.0), 4, 'X'))
            bmesh.ops.create_icosphere(bm_clear, subdivisions=1, radius=0.011,
                                       matrix=Matrix.Translation(bulb_pos))
            # Glowing filament wire
            bmesh.ops.create_cylinder(bm_filament, cap_ends=True, segments=6, radius=0.002, depth=0.008,
                                      matrix=Matrix.Translation(bulb_pos))

        # ---------------------------------------------------------------------
        # 3. Patented DE1950893 Dirt-Shedding Aerodynamic Horizontal Ribs
        # ---------------------------------------------------------------------
        # 8 Horizontal protruding ridges with 45° downward drip slope
        num_ribs = 8
        for ri in range(num_ribs):
            rt = ri / (num_ribs - 1)
            rz = (tl_z - th*0.5 + 0.015) + rt * (th - 0.030)

            # Determine color tier for this rib height:
            # Upper tier (ri >= 5): Amber Turn Indicator
            # Middle tier (ri == 3 or 4): Ruby Red Brake/Tail
            # Lower tier (ri <= 2): Split between Clear Reverse (inner) and Ruby Reflector (outer)
            if ri >= 5:
                # Full width amber rib
                bmesh.ops.create_cylinder(bm_amber, cap_ends=True, segments=12, radius=0.007, depth=tw - 0.010,
                                          matrix=Matrix.Translation((tx_cen, tl_y - 0.014, rz)) @
                                                 Matrix.Rotation(math.radians(90.0), 4, 'Y'))
                # Outer wedge deflector
                bmesh.ops.create_cube(bm_amber, size=1.0,
                                      matrix=Matrix.Translation((tx_cen, tl_y - 0.018, rz)) @
                                             Matrix.Rotation(math.radians(-15.0), 4, 'X') @
                                             Matrix.Scale(tw - 0.010, 4, Vector((1, 0, 0))) @
                                             Matrix.Scale(0.014, 4, Vector((0, 1, 0))) @
                                             Matrix.Scale(0.008, 4, Vector((0, 0, 1))))
            elif ri >= 3:
                # Full width ruby red rib
                bmesh.ops.create_cylinder(bm_ruby, cap_ends=True, segments=12, radius=0.007, depth=tw - 0.010,
                                          matrix=Matrix.Translation((tx_cen, tl_y - 0.014, rz)) @
                                                 Matrix.Rotation(math.radians(90.0), 4, 'Y'))
                bmesh.ops.create_cube(bm_ruby, size=1.0,
                                      matrix=Matrix.Translation((tx_cen, tl_y - 0.018, rz)) @
                                             Matrix.Rotation(math.radians(-15.0), 4, 'X') @
                                             Matrix.Scale(tw - 0.010, 4, Vector((1, 0, 0))) @
                                             Matrix.Scale(0.014, 4, Vector((0, 1, 0))) @
                                             Matrix.Scale(0.008, 4, Vector((0, 0, 1))))
            else:
                # Lower tier: Split inner half clear (reverse lamp), outer half ruby (reflex reflector)
                # Inner clear rib
                x_clear = tx_cen - 0.065 * side
                bmesh.ops.create_cylinder(bm_clear, cap_ends=True, segments=12, radius=0.007, depth=0.135,
                                          matrix=Matrix.Translation((x_clear, tl_y - 0.014, rz)) @
                                                 Matrix.Rotation(math.radians(90.0), 4, 'Y'))
                bmesh.ops.create_cube(bm_clear, size=1.0,
                                      matrix=Matrix.Translation((x_clear, tl_y - 0.018, rz)) @
                                             Matrix.Rotation(math.radians(-15.0), 4, 'X') @
                                             Matrix.Scale(0.135, 4, Vector((1, 0, 0))) @
                                             Matrix.Scale(0.014, 4, Vector((0, 1, 0))) @
                                             Matrix.Scale(0.008, 4, Vector((0, 0, 1))))

                # Outer ruby reflex reflector rib
                x_reflex = tx_cen + 0.065 * side
                bmesh.ops.create_cylinder(bm_ruby, cap_ends=True, segments=12, radius=0.007, depth=0.135,
                                          matrix=Matrix.Translation((x_reflex, tl_y - 0.014, rz)) @
                                                 Matrix.Rotation(math.radians(90.0), 4, 'Y'))
                bmesh.ops.create_cube(bm_ruby, size=1.0,
                                      matrix=Matrix.Translation((x_reflex, tl_y - 0.018, rz)) @
                                             Matrix.Rotation(math.radians(-15.0), 4, 'X') @
                                             Matrix.Scale(0.135, 4, Vector((1, 0, 0))) @
                                             Matrix.Scale(0.014, 4, Vector((0, 1, 0))) @
                                             Matrix.Scale(0.008, 4, Vector((0, 0, 1))))

        # ---------------------------------------------------------------------
        # 4. Smooth Inner Polycarbonate Substrate Backing Pane
        # ---------------------------------------------------------------------
        # Amber upper substrate
        bmesh.ops.create_cube(bm_amber, size=1.0,
                              matrix=Matrix.Translation((tx_cen, tl_y - 0.008, tl_z + 0.055)) @
                                     Matrix.Scale(tw - 0.012, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.004, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.065, 4, Vector((0, 0, 1))))

        # Ruby middle substrate
        bmesh.ops.create_cube(bm_ruby, size=1.0,
                              matrix=Matrix.Translation((tx_cen, tl_y - 0.008, tl_z - 0.005)) @
                                     Matrix.Scale(tw - 0.012, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.004, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.065, 4, Vector((0, 0, 1))))

        # Clear reverse substrate
        bmesh.ops.create_cube(bm_clear, size=1.0,
                              matrix=Matrix.Translation((tx_cen - 0.065 * side, tl_y - 0.008, tl_z - 0.060)) @
                                     Matrix.Scale(0.135, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.004, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.055, 4, Vector((0, 0, 1))))

        # Ruby reflex substrate
        bmesh.ops.create_cube(bm_ruby, size=1.0,
                              matrix=Matrix.Translation((tx_cen + 0.065 * side, tl_y - 0.008, tl_z - 0.060)) @
                                     Matrix.Scale(0.135, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.004, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.055, 4, Vector((0, 0, 1))))

    obj_rby = link_obj_p2("GEO_R107_Taillamp_Ruby_Lenses", bm_ruby, parent_col, mats["ruby"], bevel=0.0005)
    obj_amb = link_obj_p2("GEO_R107_Taillamp_Amber_Lenses", bm_amber, parent_col, mats["amber"], bevel=0.0005)
    obj_clr = link_obj_p2("GEO_R107_Taillamp_Clear_Lenses", bm_clear, parent_col, mats["reverse"], bevel=0.0005)
    obj_ref = link_obj_p2("GEO_R107_Taillamp_Reflectors", bm_reflector, parent_col, mats["reflector"], bevel=0.0005)
    obj_fil = link_obj_p2("GEO_R107_Taillamp_Filaments", bm_filament, parent_col, mats["filament"], bevel=0.0005)
    obj_chm = link_obj_p2("GEO_R107_Taillamp_Chrome_Beads", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_rub = link_obj_p2("GEO_R107_Taillamp_Rubber_Seals", bm_rubber, parent_col, mats["rubber"], bevel=0.0005)
    obj_hsg = link_obj_p2("GEO_R107_Taillamp_Housings", bm_housing, parent_col, mats["black_trim"], bevel=0.001)

    return [obj_rby, obj_amb, obj_clr, obj_ref, obj_fil, obj_chm, obj_rub, obj_hsg]
"""
=============================================================================
Procedural Class-A CAD Generator: Mercedes-Benz 560SL R107 (1980s)
PHASE 2 (Part 5): Heavy Chrome Bumpers, Overriders & Rear License Plate
=============================================================================
Authentic bumper & impact safety engineering:
- Heavy-gauge mirror-polished chrome front wrap-around bumper bar
- Full-width molded neoprene rubber impact protection strips
- Twin vertical front bumper overrider guards with rubber face cushions
- Heavy-gauge chrome rear wrap-around bumper with quarter panel returns
- Recessed license plate well with twin downward illumination lamps
- Stamped aluminum license plate with chrome frame and reflective backing
=============================================================================
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler


def build_r107_heavy_chrome_bumpers_and_overriders(parent_col, mats):
    """
    Constructs the heavy chrome wrap-around front and rear bumpers,
    neoprene impact rub-strips, vertical overriders, license plate lights,
    and rear reflective license plate assembly.
    """
    bm_chrome  = bmesh.new()
    bm_rubber  = bmesh.new()
    bm_license = bmesh.new()
    bm_glass   = bmesh.new()
    bm_trim    = bmesh.new()

    # -------------------------------------------------------------------------
    # 1. Front Wrap-Around Chrome Bumper Bar & Neoprene Impact Strip
    # -------------------------------------------------------------------------
    fb_z = 0.415
    fb_y = 2.185

    # Front bumper spine points (Center section forward, corners wrapping back)
    fb_pts_chrome = [
        Vector((-0.880, 1.940, fb_z)),  # Left corner wrap
        Vector((-0.860, 2.080, fb_z)),
        Vector((-0.720, 2.170, fb_z)),
        Vector(( 0.000, 2.195, fb_z)),  # Center nose apex
        Vector(( 0.720, 2.170, fb_z)),
        Vector(( 0.860, 2.080, fb_z)),
        Vector(( 0.880, 1.940, fb_z)),  # Right corner wrap
    ]

    # Main chrome bumper blade (extruded curved channel)
    create_curved_tube_p2(bm_chrome, fb_pts_chrome, radius=0.038, segments=12)

    # Upper horizontal chrome step shelf
    for i in range(len(fb_pts_chrome) - 1):
        p1 = fb_pts_chrome[i]
        p2 = fb_pts_chrome[i+1]
        create_oriented_box_between_p2(bm_chrome,
                                      p1 + Vector((0, -0.015, 0.024)),
                                      p2 + Vector((0, -0.015, 0.024)),
                                      width=0.045, height=0.012)

    # Full-Width Neoprene Rubber Impact Strip (seated in center groove of chrome bar)
    fb_pts_rubber = [
        Vector((-0.885, 1.940, fb_z)),
        Vector((-0.865, 2.082, fb_z)),
        Vector((-0.723, 2.174, fb_z)),
        Vector(( 0.000, 2.200, fb_z)),
        Vector(( 0.723, 2.174, fb_z)),
        Vector(( 0.865, 2.082, fb_z)),
        Vector(( 0.885, 1.940, fb_z)),
    ]
    create_curved_tube_p2(bm_rubber, fb_pts_rubber, radius=0.024, segments=10)

    # Longitudinal groove bead along the rubber impact strip
    for i in range(len(fb_pts_rubber) - 1):
        p1 = fb_pts_rubber[i]
        p2 = fb_pts_rubber[i+1]
        create_oriented_box_between_p2(bm_rubber,
                                      p1 + Vector((0, 0.008, 0)),
                                      p2 + Vector((0, 0.008, 0)),
                                      width=0.015, height=0.022)

    # Twin Vertical Front Bumper Overriders (US DOT 5-mph bumper guards)
    for over_x in [-0.380, 0.380]:
        ov_pos = Vector((over_x, 2.205, fb_z))

        # Chrome vertical upright bracket
        bmesh.ops.create_cube(bm_chrome, size=1.0,
                              matrix=Matrix.Translation(ov_pos - Vector((0, 0.010, 0))) @
                                     Matrix.Scale(0.065, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.160, 4, Vector((0, 0, 1))))

        # Molded thick rubber front face cushion
        bmesh.ops.create_cube(bm_rubber, size=1.0,
                              matrix=Matrix.Translation(ov_pos + Vector((0, 0.012, 0))) @
                                     Matrix.Scale(0.062, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.028, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.155, 4, Vector((0, 0, 1))))
        # Rounded rubber top cap
        bmesh.ops.create_cylinder(bm_rubber, cap_ends=True, segments=12, radius=0.030, depth=0.060,
                                  matrix=Matrix.Translation(ov_pos + Vector((0, 0.012, 0.075))) @
                                         Matrix.Rotation(math.radians(90.0), 4, 'Y'))

    # -------------------------------------------------------------------------
    # 2. Rear Wrap-Around Chrome Bumper Bar & Impact Strip
    # -------------------------------------------------------------------------
    rb_z = 0.405
    rb_y = -2.195

    rb_pts_chrome = [
        Vector((-0.870, -1.950, rb_z)),  # Left quarter wrap
        Vector((-0.850, -2.090, rb_z)),
        Vector((-0.710, -2.180, rb_z)),
        Vector(( 0.000, -2.205, rb_z)),  # Center rear apex
        Vector(( 0.710, -2.180, rb_z)),
        Vector(( 0.850, -2.090, rb_z)),
        Vector(( 0.870, -1.950, rb_z)),  # Right quarter wrap
    ]

    create_curved_tube_p2(bm_chrome, rb_pts_chrome, radius=0.038, segments=12)

    # Upper horizontal chrome step shelf
    for i in range(len(rb_pts_chrome) - 1):
        p1 = rb_pts_chrome[i]
        p2 = rb_pts_chrome[i+1]
        create_oriented_box_between_p2(bm_chrome,
                                      p1 + Vector((0, 0.015, 0.024)),
                                      p2 + Vector((0, 0.015, 0.024)),
                                      width=0.045, height=0.012)

    # Full-width Rear Neoprene Impact Strip
    rb_pts_rubber = [
        Vector((-0.875, -1.950, rb_z)),
        Vector((-0.855, -2.092, rb_z)),
        Vector((-0.713, -2.184, rb_z)),
        Vector(( 0.000, -2.210, rb_z)),
        Vector(( 0.713, -2.184, rb_z)),
        Vector(( 0.855, -2.092, rb_z)),
        Vector(( 0.875, -1.950, rb_z)),
    ]
    create_curved_tube_p2(bm_rubber, rb_pts_rubber, radius=0.024, segments=10)

    # -------------------------------------------------------------------------
    # 3. Rear License Plate Well, Downward Lamps & Reflective Plate
    # -------------------------------------------------------------------------
    lp_cen = Vector((0.0, -2.182, 0.405))

    # Recessed license plate mounting backplate (satin black steel pocket)
    bmesh.ops.create_cube(bm_trim, size=1.0,
                          matrix=Matrix.Translation(lp_cen) @
                                 Matrix.Scale(0.380, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.010, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.160, 4, Vector((0, 0, 1))))

    # Chrome license plate outer decorative surround frame
    bmesh.ops.create_cube(bm_chrome, size=1.0,
                          matrix=Matrix.Translation(lp_cen - Vector((0, 0.006, 0))) @
                                 Matrix.Scale(0.365, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.006, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.145, 4, Vector((0, 0, 1))))

    # Stamped Reflective License Plate Body (White enamel face)
    bmesh.ops.create_cube(bm_license, size=1.0,
                          matrix=Matrix.Translation(lp_cen - Vector((0, 0.008, 0))) @
                                 Matrix.Scale(0.350, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.003, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.130, 4, Vector((0, 0, 1))))

    # Embossed black registration lettering relief blocks ("560 SL")
    letter_xs = [-0.090, -0.045, 0.000, 0.055, 0.095]
    for lx in letter_xs:
        bmesh.ops.create_cube(bm_trim, size=1.0,
                              matrix=Matrix.Translation(Vector((lx, lp_cen.y - 0.010, lp_cen.z))) @
                                     Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.002, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.050, 4, Vector((0, 0, 1))))

    # Twin Downward License Plate Illumination Lamps (mounted in bumper upper overhang)
    for lamp_x in [-0.110, 0.110]:
        lamp_pos = Vector((lamp_x, -2.170, 0.470))
        # Chrome hooded lamp visor housing
        bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=12, radius=0.016, depth=0.038,
                                  matrix=Matrix.Translation(lamp_pos) @ Matrix.Rotation(math.radians(90.0), 4, 'Y'))
        # Clear optical lens pointing downward at plate
        bmesh.ops.create_cylinder(bm_glass, cap_ends=True, segments=10, radius=0.012, depth=0.004,
                                  matrix=Matrix.Translation(lamp_pos - Vector((0, 0, 0.014))))

    obj_chm = link_obj_p2("GEO_R107_Bumper_Chrome_Bars", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_rub = link_obj_p2("GEO_R107_Bumper_Neoprene_Strips", bm_rubber, parent_col, mats["rubber"], bevel=0.0005)
    obj_lic = link_obj_p2("GEO_R107_License_Plate", bm_license, parent_col, mats["license"], bevel=0.0005)
    obj_gls = link_obj_p2("GEO_R107_License_Lamp_Glass", bm_glass, parent_col, mats["headlamp"], bevel=0.0005)
    obj_trm = link_obj_p2("GEO_R107_License_Plate_Pocket", bm_trim, parent_col, mats["black_trim"], bevel=0.0005)

    return [obj_chm, obj_rub, obj_lic, obj_gls, obj_trm]
"""
=============================================================================
Procedural Class-A CAD Generator: Mercedes-Benz 560SL R107 (1980s)
PHASE 2 (Part 7): Windshield Header, Sun Visors, Tonneau Lid & Trunk Details
=============================================================================
Authentic exterior & greenhouse details:
- Windshield upper chrome header channel and tinted sun-band strip
- Folded black vinyl sun visors with swivel arms & chrome interior day/night mirror
- Soft-top tonneau storage hatch lid with chrome latch handles & perimeter seal
- Stamped German VIN data plate and warning decal plaques on radiator support
- Ribbed trunk floor liner with full-sized Bundt spare wheel & hold-down wingnut
- Rolled vinyl emergency toolkit pouch and Bilstein roadside jack in trunk
=============================================================================
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler


def build_r107_windshield_header_and_sun_visors(parent_col, mats):
    """
    Constructs the windshield chrome header moulding, tinted upper sun-band,
    folded interior sun visors, and chrome rearview mirror visible through glass.
    """
    bm_chrome = bmesh.new()
    bm_vinyl  = bmesh.new()
    bm_glass  = bmesh.new()
    bm_trim   = bmesh.new()

    header_y = 0.320
    header_z = 1.155

    # -------------------------------------------------------------------------
    # 1. Windshield Upper Header Chrome Frame & Drip Gutter
    # -------------------------------------------------------------------------
    create_oriented_box_between_p2(bm_chrome,
                                  Vector((-0.550, header_y, header_z)),
                                  Vector(( 0.550, header_y, header_z)),
                                  width=0.032, height=0.018)

    # Slender chrome A-pillar corner gussets
    for side in [1.0, -1.0]:
        create_cylinder_between_p2(bm_chrome,
                                  Vector((0.550 * side, header_y, header_z)),
                                  Vector((0.570 * side, header_y - 0.040, header_z - 0.030)),
                                  radius=0.010, segments=8)

    # Tinted Upper Sun-Band Glass Strip (Glacier green/blue tint across top of windshield)
    bmesh.ops.create_cube(bm_glass, size=1.0,
                          matrix=Matrix.Translation((0.0, header_y + 0.015, header_z - 0.040)) @
                                 Matrix.Scale(1.060, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.003, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.075, 4, Vector((0, 0, 1))))

    # -------------------------------------------------------------------------
    # 2. Folded Vinyl Sun Visors (Driver Left, Passenger Right)
    # -------------------------------------------------------------------------
    for side in [1.0, -1.0]:
        vx = 0.280 * side
        vy = header_y - 0.030
        vz = header_z - 0.025

        # Padded black vinyl visor blade (folded flat against headliner)
        bmesh.ops.create_cube(bm_vinyl, size=1.0,
                              matrix=Matrix.Translation((vx, vy, vz)) @
                                     Matrix.Scale(0.320, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.120, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.016, 4, Vector((0, 0, 1))))

        # Chrome swivel pivot rod arm
        create_cylinder_between_p2(bm_chrome,
                                  Vector((vx + 0.160 * side, vy + 0.050, vz + 0.006)),
                                  Vector((vx - 0.160 * side, vy + 0.050, vz + 0.006)),
                                  radius=0.004, segments=6)

        # Chrome mounting bracket base at header
        bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=8, radius=0.010, depth=0.008,
                                  matrix=Matrix.Translation((vx + 0.160 * side, vy + 0.050, vz + 0.012)))

        # Passenger vanity mirror chrome frame (passenger side only)
        if side < 0:
            bmesh.ops.create_cube(bm_chrome, size=1.0,
                                  matrix=Matrix.Translation((vx, vy, vz - 0.009)) @
                                         Matrix.Scale(0.140, 4, Vector((1, 0, 0))) @
                                         Matrix.Scale(0.065, 4, Vector((0, 1, 0))) @
                                         Matrix.Scale(0.002, 4, Vector((0, 0, 1))))
            bmesh.ops.create_cube(bm_glass, size=1.0,
                                  matrix=Matrix.Translation((vx, vy, vz - 0.010)) @
                                         Matrix.Scale(0.125, 4, Vector((1, 0, 0))) @
                                         Matrix.Scale(0.050, 4, Vector((0, 1, 0))) @
                                         Matrix.Scale(0.001, 4, Vector((0, 0, 1))))

    # -------------------------------------------------------------------------
    # 3. Interior Day/Night Rearview Mirror Assembly
    # -------------------------------------------------------------------------
    rm_pos = Vector((0.0, header_y - 0.040, header_z - 0.035))

    # Chrome mounting foot glued to inside windshield glass
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=10, radius=0.014, depth=0.006,
                              matrix=Matrix.Translation(rm_pos + Vector((0, 0.035, 0.015))) @
                                     Matrix.Rotation(math.radians(-35.0), 4, 'X'))

    # Chromed ball-joint swivel stalk
    create_cylinder_between_p2(bm_chrome,
                              rm_pos + Vector((0, 0.035, 0.015)),
                              rm_pos,
                              radius=0.005, segments=8)

    # Black textured mirror housing
    bmesh.ops.create_cube(bm_trim, size=1.0,
                          matrix=Matrix.Translation(rm_pos) @
                                 Matrix.Scale(0.220, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.024, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.065, 4, Vector((0, 0, 1))))

    # Reflective mirror glass pane
    bmesh.ops.create_cube(bm_glass, size=1.0,
                          matrix=Matrix.Translation(rm_pos - Vector((0, 0.011, 0))) @
                                 Matrix.Scale(0.210, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.002, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.058, 4, Vector((0, 0, 1))))

    # Day/night anti-glare manual flip toggle tab
    bmesh.ops.create_cube(bm_trim, size=1.0,
                          matrix=Matrix.Translation(rm_pos - Vector((0, 0, 0.036))) @
                                 Matrix.Scale(0.022, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.010, 4, Vector((0, 0, 1))))

    obj_chm = link_obj_p2("GEO_R107_Windshield_Header_Chrome", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_vin = link_obj_p2("GEO_R107_Sun_Visors_Vinyl", bm_vinyl, parent_col, mats["black_trim"], bevel=0.001)
    obj_gls = link_obj_p2("GEO_R107_Header_Mirror_Glass", bm_glass, parent_col, mats["headlamp"], bevel=0.0005)
    obj_trm = link_obj_p2("GEO_R107_Rearview_Mirror_Housing", bm_trim, parent_col, mats["black_trim"], bevel=0.0005)

    return [obj_chm, obj_vin, obj_gls, obj_trm]


def build_r107_tonneau_cover_and_engine_decals(parent_col, mats):
    """
    Constructs the soft-top storage tonneau hatch lid, chrome release levers,
    radiator support data plates, and warning decal plaques.
    """
    bm_paint  = bmesh.new()
    bm_chrome = bmesh.new()
    bm_rubber = bmesh.new()
    bm_decal  = bmesh.new()
    bm_gold   = bmesh.new()

    # -------------------------------------------------------------------------
    # 1. Soft-Top Storage Compartment Tonneau Lid
    # -------------------------------------------------------------------------
    # Horizontal hinged deck panel behind seats (Y from -0.650 to -0.850)
    tonneau_cen = Vector((0.0, -0.750, 0.792))

    # Main stamped body-color tonneau hatch cover
    bmesh.ops.create_cube(bm_paint, size=1.0,
                          matrix=Matrix.Translation(tonneau_cen) @
                                 Matrix.Scale(1.360, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.220, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.012, 4, Vector((0, 0, 1))))

    # Molded perimeter rubber weatherseal lip
    bmesh.ops.create_cube(bm_rubber, size=1.0,
                          matrix=Matrix.Translation(tonneau_cen - Vector((0, 0, 0.006))) @
                                 Matrix.Scale(1.380, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.235, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.008, 4, Vector((0, 0, 1))))

    # Chrome tonneau lid manual release latch lever (left B-pillar post)
    lever_pos = Vector((0.640, -0.680, 0.800))
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=10, radius=0.008, depth=0.035,
                              matrix=Matrix.Translation(lever_pos) @ Matrix.Rotation(math.radians(45.0), 4, 'Y'))
    bmesh.ops.create_icosphere(bm_chrome, subdivisions=1, radius=0.010,
                               matrix=Matrix.Translation(lever_pos + Vector((0.015, 0, 0.015))))

    # Chrome rear tonneau lid transverse edge bead
    create_oriented_box_between_p2(bm_chrome,
                                  Vector((-0.680, -0.855, 0.795)),
                                  Vector(( 0.680, -0.855, 0.795)),
                                  width=0.008, height=0.006)

    # -------------------------------------------------------------------------
    # 2. Engine Bay Radiator Support Data Plates & Decals
    # -------------------------------------------------------------------------
    rad_sup_y = 1.960
    rad_sup_z = 0.680

    # Radiator top structural tie-bar (satin black steel)
    create_oriented_box_between_p2(bm_decal,
                                  Vector((-0.420, rad_sup_y, rad_sup_z)),
                                  Vector(( 0.420, rad_sup_y, rad_sup_z)),
                                  width=0.045, height=0.018)

    # Yellow-zinc plated radiator mounting clamp brackets
    for side in [1.0, -1.0]:
        clamp_x = 0.320 * side
        bmesh.ops.create_cube(bm_gold, size=1.0,
                              matrix=Matrix.Translation((clamp_x, rad_sup_y, rad_sup_z + 0.012)) @
                                     Matrix.Scale(0.055, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.040, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.010, 4, Vector((0, 0, 1))))

    # Stamped German Manufacturing Data Plate (Aluminum rectangular plate)
    data_pos = Vector((-0.180, rad_sup_y, rad_sup_z + 0.010))
    bmesh.ops.create_cube(bm_decal, size=1.0,
                          matrix=Matrix.Translation(data_pos) @
                                 Matrix.Scale(0.110, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.055, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.002, 4, Vector((0, 0, 1))))

    # Stamped Vehicle Identification Number (VIN) plate
    vin_pos = Vector((0.180, rad_sup_y, rad_sup_z + 0.010))
    bmesh.ops.create_cube(bm_decal, size=1.0,
                          matrix=Matrix.Translation(vin_pos) @
                                 Matrix.Scale(0.140, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.035, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.002, 4, Vector((0, 0, 1))))

    # Yellow High-Voltage Ignition Warning Decal Plaque
    warn_pos = Vector((0.0, rad_sup_y, rad_sup_z + 0.010))
    bmesh.ops.create_cube(bm_gold, size=1.0,
                          matrix=Matrix.Translation(warn_pos) @
                                 Matrix.Scale(0.065, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.002, 4, Vector((0, 0, 1))))

    obj_pnt = link_obj_p2("GEO_R107_Tonneau_Hatch_Lid", bm_paint, parent_col, mats["paint"], bevel=0.001)
    obj_chm = link_obj_p2("GEO_R107_Tonneau_Chrome_Latches", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_rub = link_obj_p2("GEO_R107_Tonneau_Rubber_Seals", bm_rubber, parent_col, mats["rubber"], bevel=0.0005)
    obj_dcl = link_obj_p2("GEO_R107_Radiator_Data_Plates", bm_decal, parent_col, mats["license"], bevel=0.0005)
    obj_gld = link_obj_p2("GEO_R107_Radiator_Zinc_Brackets", bm_gold, parent_col, mats["enamel_gold"], bevel=0.0005)

    return [obj_pnt, obj_chm, obj_rub, obj_dcl, obj_gld]
"""
=============================================================================
Procedural Class-A CAD Generator: Mercedes-Benz 560SL R107 (1980s)
PHASE 2 (Part 8): Fender Liners, Mudflaps, Spare Wheel & Trunk Toolkit
=============================================================================
Authentic finishing details:
- Thermoplastic front and rear inner fender splash liners with water channels
- Period-correct Mercedes molded rubber rear mudflaps with white star logos
- Ribbed trunk floor carpet matting with perimeter edge binding
- Full-sized 15-inch Gullideckel spare wheel with chrome hold-down wingnut
- Rolled vinyl emergency toolkit pouch with brass buckles & Bilstein roadside jack
- Stainless steel rear exhaust heat deflector shield above chrome tips
=============================================================================
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler


def build_r107_wheel_arch_inner_liners_and_mudflaps(parent_col, mats):
    """
    Constructs the thermoplastic inner fender splash liners, water channels,
    and period-correct rear rubber mudflaps with chrome mounting brackets.
    """
    bm_liner  = bmesh.new()
    bm_rubber = bmesh.new()
    bm_chrome = bmesh.new()
    bm_star   = bmesh.new()

    fx = 1.230   # Front axle Y
    rx = -1.230  # Rear axle Y

    # -------------------------------------------------------------------------
    # 1. Front Thermoplastic Inner Fender Splash Liners (Left & Right)
    # -------------------------------------------------------------------------
    for side in [1.0, -1.0]:
        lx = 0.760 * side
        # Arch radius: 0.355m
        num_steps = 14
        arch_pts = []
        for ai in range(num_steps + 1):
            ang = (ai / num_steps) * math.pi
            ay = fx + 0.355 * math.cos(ang)
            az = 0.323 + 0.355 * math.sin(ang)
            arch_pts.append(Vector((lx, ay, az)))

        # Extrude cylindrical liner surface inward into wheel tub
        for ai in range(len(arch_pts) - 1):
            p1 = arch_pts[ai]
            p2 = arch_pts[ai+1]
            create_oriented_box_between_p2(bm_liner,
                                          p1 - Vector((0.070 * side, 0, 0)),
                                          p2 - Vector((0.070 * side, 0, 0)),
                                          width=0.140, height=0.005)

        # Forward splash deflector shield sealing headlamp rear bucket
        bmesh.ops.create_cube(bm_liner, size=1.0,
                              matrix=Matrix.Translation((lx - 0.040 * side, fx + 0.360, 0.450)) @
                                     Matrix.Scale(0.160, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.006, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.240, 4, Vector((0, 0, 1))))

    # -------------------------------------------------------------------------
    # 2. Rear Thermoplastic Splash Liners & Wheel Tubs
    # -------------------------------------------------------------------------
    for side in [1.0, -1.0]:
        lx = 0.750 * side
        num_steps = 14
        arch_pts = []
        for ai in range(num_steps + 1):
            ang = (ai / num_steps) * math.pi
            ay = rx + 0.355 * math.cos(ang)
            az = 0.323 + 0.355 * math.sin(ang)
            arch_pts.append(Vector((lx, ay, az)))

        for ai in range(len(arch_pts) - 1):
            p1 = arch_pts[ai]
            p2 = arch_pts[ai+1]
            create_oriented_box_between_p2(bm_liner,
                                          p1 - Vector((0.070 * side, 0, 0)),
                                          p2 - Vector((0.070 * side, 0, 0)),
                                          width=0.140, height=0.005)

    # -------------------------------------------------------------------------
    # 3. Period-Correct Mercedes-Benz Rear Rubber Mudflaps (Left & Right)
    # -------------------------------------------------------------------------
    for side in [1.0, -1.0]:
        mx = 0.740 * side
        my = rx - 0.370
        mz = 0.220

        # Molded heavy black rubber mudflap blade
        bmesh.ops.create_cube(bm_rubber, size=1.0,
                              matrix=Matrix.Translation((mx, my, mz)) @
                                     Matrix.Scale(0.220, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.008, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.190, 4, Vector((0, 0, 1))))

        # Chrome top mounting clamp bracket
        bmesh.ops.create_cube(bm_chrome, size=1.0,
                              matrix=Matrix.Translation((mx, my, mz + 0.095)) @
                                     Matrix.Scale(0.224, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.014, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.018, 4, Vector((0, 0, 1))))

        # Embossed white Mercedes three-pointed star logo on rear flap face
        star_pos = Vector((mx, my - 0.005, mz))
        bmesh.ops.create_cylinder(bm_star, cap_ends=True, segments=16, radius=0.024, depth=0.002,
                                  matrix=Matrix.Translation(star_pos) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))
        for bi in range(3):
            bang = bi * (2.0 * math.pi / 3.0) + math.pi * 0.5
            create_cylinder_between_p2(bm_star,
                                      star_pos,
                                      star_pos + Vector((0.020 * math.cos(bang), 0, 0.020 * math.sin(bang))),
                                      radius=0.0025, segments=6)

    obj_lin = link_obj_p2("GEO_R107_Inner_Fender_Liners", bm_liner, parent_col, mats["black_trim"], bevel=0.001)
    obj_rub = link_obj_p2("GEO_R107_Rear_Mudflaps", bm_rubber, parent_col, mats["rubber"], bevel=0.0005)
    obj_chm = link_obj_p2("GEO_R107_Mudflap_Chrome_Clamps", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_str = link_obj_p2("GEO_R107_Mudflap_Star_Emblems", bm_star, parent_col, mats["license"], bevel=0.0005)

    return [obj_lin, obj_rub, obj_chm, obj_str]


def build_r107_trunk_interior_lining_and_spare_wheel(parent_col, mats):
    """
    Constructs the trunk floor carpet matting, full-sized Bundt spare wheel,
    hold-down wingnut clamp, rolled toolkit pouch, Bilstein jack, and heat deflector.
    """
    bm_carpet = bmesh.new()
    bm_alloy  = bmesh.new()
    bm_rubber = bmesh.new()
    bm_chrome = bmesh.new()
    bm_tools  = bmesh.new()

    rx = -1.230  # Rear axle Y

    # -------------------------------------------------------------------------
    # 1. Trunk Floor Molded Carpet Matting & Edge Binding
    # -------------------------------------------------------------------------
    trunk_cen = Vector((0.0, -1.650, 0.380))

    # Main anthracite carpet floor liner
    bmesh.ops.create_cube(bm_carpet, size=1.0,
                          matrix=Matrix.Translation(trunk_cen) @
                                 Matrix.Scale(1.180, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.780, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.010, 4, Vector((0, 0, 1))))

    # Left and Right vertical trunk side wall carpet panels
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(bm_carpet, size=1.0,
                              matrix=Matrix.Translation((0.580 * side, -1.650, 0.520)) @
                                     Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.760, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.280, 4, Vector((0, 0, 1))))

    # -------------------------------------------------------------------------
    # 2. Full-Sized 15-inch Gullideckel Spare Wheel & Tire in Trunk Well
    # -------------------------------------------------------------------------
    # Spare wheel is mounted flat in the right-side tire tub
    sp_cen = Vector((0.180, rx - 0.380, 0.260))

    # Spare 205/65 R15 Radial Tire
    bmesh.ops.create_torus(bm_rubber, major_radius=0.230, minor_radius=0.088,
                           major_segments=24, minor_segments=14,
                           matrix=Matrix.Translation(sp_cen))

    # 15-inch Bundt Forged Alloy Wheel Rim
    bmesh.ops.create_cylinder(bm_alloy, cap_ends=True, segments=24, radius=0.200, depth=0.170,
                              matrix=Matrix.Translation(sp_cen))
    # Stepped outer rim lip
    bmesh.ops.create_cylinder(bm_alloy, cap_ends=True, segments=24, radius=0.208, depth=0.016,
                              matrix=Matrix.Translation(sp_cen + Vector((0, 0, 0.080))))

    # Central Threaded Spindle Rod & Chrome Hold-Down Wingnut
    create_cylinder_between_p2(bm_chrome, sp_cen - Vector((0, 0, 0.080)), sp_cen + Vector((0, 0, 0.120)),
                              radius=0.006, segments=10)

    # Three-Winged Chrome Hold-Down Wingnut Clamp
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=14, radius=0.024, depth=0.018,
                              matrix=Matrix.Translation(sp_cen + Vector((0, 0, 0.095))))
    for wi in range(3):
        wang = wi * (2.0 * math.pi / 3.0)
        w_dir = Vector((math.cos(wang), math.sin(wang), 0))
        create_oriented_box_between_p2(bm_chrome,
                                      sp_cen + Vector((0, 0, 0.095)),
                                      sp_cen + Vector((0, 0, 0.095)) + w_dir * 0.052,
                                      width=0.012, height=0.010)

    # -------------------------------------------------------------------------
    # 3. Mercedes-Benz Vinyl Roll-Up Emergency Tool Kit Pouch
    # -------------------------------------------------------------------------
    tool_cen = Vector((-0.420, -1.820, 0.395))

    # Cylindrical rolled vinyl pouch
    bmesh.ops.create_cylinder(bm_tools, cap_ends=True, segments=14, radius=0.038, depth=0.280,
                              matrix=Matrix.Translation(tool_cen) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))

    # Leather tie straps with brass buckles (2 straps wrapping pouch)
    for ty in [-0.080, 0.080]:
        bmesh.ops.create_torus(bm_rubber, major_radius=0.039, minor_radius=0.003,
                               major_segments=16, minor_segments=6,
                               matrix=Matrix.Translation(tool_cen + Vector((0, ty, 0))) @
                                      Matrix.Rotation(math.radians(90.0), 4, 'X'))
        bmesh.ops.create_cube(bm_chrome, size=1.0,
                              matrix=Matrix.Translation(tool_cen + Vector((0, ty, 0.038))) @
                                     Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.005, 4, Vector((0, 0, 1))))

    # -------------------------------------------------------------------------
    # 4. Bilstein Roadside Mechanical Jack (Stowed in Right Trunk Well)
    # -------------------------------------------------------------------------
    jack_cen = Vector((0.480, -1.550, 0.410))

    # Yellow/Blue painted main pillar column tube
    create_cylinder_between_p2(bm_alloy,
                              jack_cen - Vector((0, 0.220, 0)),
                              jack_cen + Vector((0, 0.220, 0)),
                              radius=0.016, segments=12)

    # Lifting peg arm (fits into rocker jacking tubes)
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=10, radius=0.011, depth=0.090,
                              matrix=Matrix.Translation(jack_cen + Vector((0.035, 0, 0))) @
                                     Matrix.Rotation(math.radians(90.0), 4, 'Y'))

    # Hand crank ratchet drive head
    bmesh.ops.create_cube(bm_alloy, size=1.0,
                          matrix=Matrix.Translation(jack_cen + Vector((0, 0.220, 0))) @
                                 Matrix.Scale(0.045, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.035, 4, Vector((0, 0, 1))))

    # -------------------------------------------------------------------------
    # 5. Stainless Steel Rear Exhaust Heat Deflector Shield
    # -------------------------------------------------------------------------
    # Shield mounted directly above the dual polished chrome exhaust tips
    tip_shield_cen = Vector((0.210, -2.060, 0.235))
    bmesh.ops.create_cube(bm_chrome, size=1.0,
                          matrix=Matrix.Translation(tip_shield_cen) @
                                 Matrix.Scale(0.180, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.140, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.003, 4, Vector((0, 0, 1))))

    obj_cpt = link_obj_p2("GEO_R107_Trunk_Carpet_Lining", bm_carpet, parent_col, mats["black_trim"], bevel=0.001)
    obj_aly = link_obj_p2("GEO_R107_Spare_Wheel_Bundt", bm_alloy, parent_col, mats["chrome"], bevel=0.001)
    obj_rub = link_obj_p2("GEO_R107_Spare_Tire_Rubber", bm_rubber, parent_col, mats["rubber"], bevel=0.0005)
    obj_chm = link_obj_p2("GEO_R107_Trunk_Hardware_Chrome", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_tls = link_obj_p2("GEO_R107_Emergency_Toolkit_Pouch", bm_tools, parent_col, mats["rubber"], bevel=0.001)

    return [obj_cpt, obj_aly, obj_rub, obj_chm, obj_tls]
"""
=============================================================================
Procedural Class-A CAD Generator: Mercedes-Benz 560SL R107 (1980s)
PHASE 2 (Part 9): Visible Cockpit Silhouettes & M117 V8 Air Cleaner Assembly
=============================================================================
Authentic exterior-visible silhouettes & powertrain jewelry:
- 4-spoke padded safety steering wheel with central horn pad & silver star
- Driver and passenger ribbed MB-Tex bucket seats with adjustable headrests
- Chrome seat reclining mechanism hinges and height adjustment posts
- Center console with burled walnut wood veneer inlay & chrome automatic shifter
- Dashboard instrument binnacle with 3 classic round VDO gauge bezels:
  * Left: Fuel level (85L tank), coolant temperature (100°C), oil pressure (3.0 bar), economy gauge
  * Center: 160 mph / 260 km/h electronic speedometer with 6-digit mechanical odometer
  * Right: 7,000 RPM tachometer with integrated quartz analog clock
- M117 V8 dual-snorkel circular black air cleaner housing with chrome wingnut
- Dual forward air intake ducts routing cold airflow from core support
- Ribbed cast aluminum valve covers (left/right banks) and Bosch distributor
- High-voltage spark plug cable loom routed along inner cylinder banks
=============================================================================
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler


def build_r107_cockpit_interior_silhouettes(parent_col, mats):
    """
    Constructs the exterior-visible cockpit silhouette elements:
    steering wheel, bucket seats, console shifter, and dashboard binnacle.
    """
    bm_seats   = bmesh.new()
    bm_dash    = bmesh.new()
    bm_chrome  = bmesh.new()
    bm_wood    = bmesh.new()
    bm_gauges  = bmesh.new()

    dash_y = 0.380
    dash_z = 0.790

    # -------------------------------------------------------------------------
    # 1. Driver-Oriented Dashboard Binnacle & 3 Round VDO Gauges
    # -------------------------------------------------------------------------
    # Main padded black dashboard transverse shelf
    bmesh.ops.create_cube(bm_dash, size=1.0,
                          matrix=Matrix.Translation((0.0, dash_y, dash_z)) @
                                 Matrix.Scale(1.240, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.280, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.140, 4, Vector((0, 0, 1))))

    # Driver side raised instrument binnacle hood (Left side, X > 0)
    bin_x = 0.360
    bmesh.ops.create_cube(bm_dash, size=1.0,
                          matrix=Matrix.Translation((bin_x, dash_y + 0.020, dash_z + 0.070)) @
                                 Matrix.Scale(0.440, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.180, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.080, 4, Vector((0, 0, 1))))

    # 3 Classic Circular VDO Instrument Gauges (Speedometer, Tachometer, Auxiliary)
    gauge_xs = [bin_x - 0.120, bin_x, bin_x + 0.120]
    for gx in gauge_xs:
        g_pos = Vector((gx, dash_y - 0.080, dash_z + 0.065))
        # Chrome gauge bezel retaining ring
        bmesh.ops.create_torus(bm_chrome, major_radius=0.046, minor_radius=0.004,
                               major_segments=20, minor_segments=6,
                               matrix=Matrix.Translation(g_pos) @ Matrix.Rotation(math.radians(75.0), 4, 'X'))
        # Matte black instrument dial face
        bmesh.ops.create_cylinder(bm_gauges, cap_ends=True, segments=16, radius=0.044, depth=0.004,
                                  matrix=Matrix.Translation(g_pos) @ Matrix.Rotation(math.radians(75.0), 4, 'X'))
        # Orange instrument needle pointer
        create_oriented_box_between_p2(bm_gauges, g_pos, g_pos + Vector((0, 0.005, 0.028)), width=0.003, height=0.002)

    # -------------------------------------------------------------------------
    # 2. 4-Spoke Mercedes Padded Safety Steering Wheel
    # -------------------------------------------------------------------------
    sw_pos = Vector((bin_x, dash_y - 0.260, dash_z + 0.060))
    sw_rot = Matrix.Rotation(math.radians(25.0), 4, 'X')

    # Steering column tube
    create_cylinder_between_p2(bm_dash,
                              Vector((bin_x, dash_y - 0.080, dash_z - 0.020)),
                              sw_pos,
                              radius=0.024, segments=12)

    # Outer padded steering wheel rim
    bmesh.ops.create_torus(bm_dash, major_radius=0.190, minor_radius=0.016,
                           major_segments=28, minor_segments=10,
                           matrix=Matrix.Translation(sw_pos) @ sw_rot)

    # Central rectangular padded safety horn pad
    bmesh.ops.create_cube(bm_dash, size=1.0,
                          matrix=Matrix.Translation(sw_pos) @ sw_rot @
                                 Matrix.Scale(0.120, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.090, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.040, 4, Vector((0, 0, 1))))

    # 3D Chrome Mercedes star emblem on horn pad center
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=14, radius=0.018, depth=0.004,
                              matrix=Matrix.Translation(sw_pos + Vector((0, -0.015, 0.010))) @ sw_rot)
    for bi in range(3):
        bang = bi * (2.0 * math.pi / 3.0) + math.pi * 0.5
        create_cylinder_between_p2(bm_chrome,
                                  sw_pos + Vector((0, -0.015, 0.010)),
                                  sw_pos + Vector((0.014 * math.cos(bang), -0.015, 0.014 * math.sin(bang) + 0.010)),
                                  radius=0.0018, segments=4)

    # 4 Radiating horizontal steering wheel spokes
    spoke_angles = [math.radians(35.0), math.radians(145.0), math.radians(215.0), math.radians(325.0)]
    for sang in spoke_angles:
        s_tip = sw_pos + Vector((0.180 * math.cos(sang), 0, 0.180 * math.sin(sang)))
        create_oriented_box_between_p2(bm_dash, sw_pos, s_tip, width=0.034, height=0.014)

    # -------------------------------------------------------------------------
    # 3. Driver & Passenger MB-Tex Ribbed Bucket Seats
    # -------------------------------------------------------------------------
    seat_xs = [0.340, -0.340]
    for sx in seat_xs:
        # Seat lower cushion
        sc_pos = Vector((sx, -0.080, 0.440))
        bmesh.ops.create_cube(bm_seats, size=1.0,
                              matrix=Matrix.Translation(sc_pos) @
                                     Matrix.Scale(0.460, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.480, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.140, 4, Vector((0, 0, 1))))

        # Lateral thigh support side bolsters
        for b_side in [1.0, -1.0]:
            bmesh.ops.create_cube(bm_seats, size=1.0,
                                  matrix=Matrix.Translation(sc_pos + Vector((0.210 * b_side, 0, 0.050))) @
                                         Matrix.Scale(0.075, 4, Vector((1, 0, 0))) @
                                         Matrix.Scale(0.460, 4, Vector((0, 1, 0))) @
                                         Matrix.Scale(0.100, 4, Vector((0, 0, 1))))

        # Seat backrest (angled recline)
        sb_pos = Vector((sx, -0.320, 0.680))
        sb_rot = Matrix.Rotation(math.radians(-16.0), 4, 'X')
        bmesh.ops.create_cube(bm_seats, size=1.0,
                              matrix=Matrix.Translation(sb_pos) @ sb_rot @
                                     Matrix.Scale(0.450, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.120, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.460, 4, Vector((0, 0, 1))))

        # Fluted vertical stitching pleats on backrest face (5 vertical flutes)
        for pi in range(5):
            px = sx + (pi - 2) * 0.065
            create_cylinder_between_p2(bm_seats,
                                      Vector((px, -0.270, 0.520)),
                                      Vector((px, -0.350, 0.840)),
                                      radius=0.008, segments=6)

        # Adjustable contoured headrest on twin chrome mounting posts
        hr_pos = Vector((sx, -0.420, 0.960))
        # Chrome height adjustment posts
        for px_off in [-0.080, 0.080]:
            create_cylinder_between_p2(bm_chrome,
                                      Vector((sx + px_off, -0.390, 0.880)),
                                      Vector((sx + px_off, -0.420, 0.940)),
                                      radius=0.006, segments=8)
        # Molded headrest cushion
        bmesh.ops.create_cube(bm_seats, size=1.0,
                              matrix=Matrix.Translation(hr_pos) @ sb_rot @
                                     Matrix.Scale(0.280, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.090, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.120, 4, Vector((0, 0, 1))))

        # Chrome recliner hinge hinge cover plate at base of backrest
        bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=12, radius=0.026, depth=0.016,
                                  matrix=Matrix.Translation(Vector((sx + 0.240, -0.280, 0.460))) @
                                         Matrix.Rotation(math.radians(90.0), 4, 'Y'))

    # -------------------------------------------------------------------------
    # 4. Center Console Tunnel, Burled Walnut Veneer & Chrome Shifter Gate
    # -------------------------------------------------------------------------
    con_pos = Vector((0.0, 0.000, 0.460))

    # Center console structural console body
    bmesh.ops.create_cube(bm_dash, size=1.0,
                          matrix=Matrix.Translation(con_pos) @
                                 Matrix.Scale(0.220, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.580, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.180, 4, Vector((0, 0, 1))))

    # Polished Zebrano / Burled Walnut Wood Veneer Trim Inlay Panel
    bmesh.ops.create_cube(bm_wood, size=1.0,
                          matrix=Matrix.Translation(con_pos + Vector((0, 0.040, 0.094))) @
                                 Matrix.Scale(0.180, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.380, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.004, 4, Vector((0, 0, 1))))

    # Chrome Slotted Automatic Transmission Shifter Gate (P-R-N-D-3-2)
    bmesh.ops.create_cube(bm_chrome, size=1.0,
                          matrix=Matrix.Translation(con_pos + Vector((0, 0.040, 0.098))) @
                                 Matrix.Scale(0.075, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.160, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.004, 4, Vector((0, 0, 1))))

    # Chrome gear selector lever stalk & ribbed black shift knob
    shift_stalk_bot = con_pos + Vector((0, 0.040, 0.100))
    shift_stalk_top = con_pos + Vector((0, 0.020, 0.230))
    create_cylinder_between_p2(bm_chrome, shift_stalk_bot, shift_stalk_top, radius=0.006, segments=8)
    bmesh.ops.create_icosphere(bm_dash, subdivisions=1, radius=0.016,
                               matrix=Matrix.Translation(shift_stalk_top))

    obj_st = link_obj_p2("GEO_R107_Seats_MBTex", bm_seats, parent_col, mats["black_trim"], bevel=0.001)
    obj_ds = link_obj_p2("GEO_R107_Dashboard_Binnacle", bm_dash, parent_col, mats["black_trim"], bevel=0.001)
    obj_ch = link_obj_p2("GEO_R107_Interior_Chrome_Accents", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)
    obj_wd = link_obj_p2("GEO_R107_Burled_Walnut_Veneer", bm_wood, parent_col, mats["enamel_gold"], bevel=0.0005)
    obj_gg = link_obj_p2("GEO_R107_VDO_Gauges_Dials", bm_gauges, parent_col, mats["license"], bevel=0.0005)

    return [obj_st, obj_ds, obj_ch, obj_wd, obj_gg]


def build_r107_underhood_m117_v8_air_cleaner(parent_col, mats):
    """
    Constructs the M117 V8 circular dual-snorkel air cleaner housing,
    cold air intake ducts, finned valve covers, and Bosch distributor.
    """
    bm_cleaner = bmesh.new()
    bm_alloy   = bmesh.new()
    bm_chrome  = bmesh.new()
    bm_rubber  = bmesh.new()

    eng_y = 1.340
    eng_z = 0.620

    # -------------------------------------------------------------------------
    # 1. Large Stamped Black Circular Air Cleaner Housing
    # -------------------------------------------------------------------------
    # Central round air filter assembly mounted atop Bosch KE-Jetronic intake
    ac_center = Vector((0.0, eng_y, eng_z))
    bmesh.ops.create_cylinder(bm_cleaner, cap_ends=True, segments=28, radius=0.220, depth=0.090,
                              matrix=Matrix.Translation(ac_center))

    # Stepped upper lid with concentric stamped stiffening rings
    bmesh.ops.create_cylinder(bm_cleaner, cap_ends=True, segments=28, radius=0.226, depth=0.015,
                              matrix=Matrix.Translation(ac_center + Vector((0, 0, 0.045))))
    bmesh.ops.create_torus(bm_cleaner, major_radius=0.150, minor_radius=0.004,
                           major_segments=24, minor_segments=6,
                           matrix=Matrix.Translation(ac_center + Vector((0, 0, 0.052))))

    # Central chrome threaded hold-down rod & chrome wingnut
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=10, radius=0.005, depth=0.035,
                              matrix=Matrix.Translation(ac_center + Vector((0, 0, 0.060))))
    # Chrome wingnut with twin curved wings
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=10, radius=0.012, depth=0.010,
                              matrix=Matrix.Translation(ac_center + Vector((0, 0, 0.065))))
    for side in [1.0, -1.0]:
        create_oriented_box_between_p2(bm_chrome,
                                      ac_center + Vector((0, 0, 0.065)),
                                      ac_center + Vector((0.028 * side, 0, 0.075)),
                                      width=0.006, height=0.006)

    # -------------------------------------------------------------------------
    # 2. Dual Forward-Facing Cold Air Intake Snorkel Tubes
    # -------------------------------------------------------------------------
    # Left and Right air intake snorkels extending forward toward the radiator core support
    for side in [1.0, -1.0]:
        snork_base = ac_center + Vector((0.140 * side, 0.160, -0.010))
        snork_mid  = ac_center + Vector((0.240 * side, 0.360, -0.020))
        snork_tip  = ac_center + Vector((0.260 * side, 0.550, -0.030))

        # Snorkel tube run
        create_curved_tube_p2(bm_cleaner, [snork_base, snork_mid, snork_tip], radius=0.034, segments=12)

        # Bellmouth air scoop opening at core support
        bmesh.ops.create_cone(bm_cleaner, cap_ends=True, segments=14,
                              radius1=0.046, radius2=0.034, depth=0.060,
                              matrix=Matrix.Translation(snork_tip + Vector((0, 0.030, 0))) @
                                     Matrix.Rotation(math.radians(-90.0), 4, 'X'))

        # Flexible accordion rubber expansion cuff
        bmesh.ops.create_torus(bm_rubber, major_radius=0.038, minor_radius=0.005,
                               major_segments=16, minor_segments=6,
                               matrix=Matrix.Translation(snork_mid) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))

    # -------------------------------------------------------------------------
    # 3. Cast Aluminum Finned Valve Covers (Left & Right Cylinder Banks)
    # -------------------------------------------------------------------------
    for side in [1.0, -1.0]:
        vx = 0.280 * side
        vy = eng_y
        vz = eng_z - 0.110

        # Valve cover rectangular body (canted outward at 45° V8 angle)
        bmesh.ops.create_cube(bm_alloy, size=1.0,
                              matrix=Matrix.Translation((vx, vy, vz)) @
                                     Matrix.Rotation(math.radians(-45.0 * side), 4, 'Y') @
                                     Matrix.Scale(0.140, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.480, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.080, 4, Vector((0, 0, 1))))

        # Longitudinal cast cooling fins along top of valve covers (4 fins per cover)
        for fi in [-0.030, -0.010, 0.010, 0.030]:
            bmesh.ops.create_cube(bm_alloy, size=1.0,
                                  matrix=Matrix.Translation((vx, vy, vz + 0.045)) @
                                         Matrix.Rotation(math.radians(-45.0 * side), 4, 'Y') @
                                         Matrix.Scale(0.006, 4, Vector((1, 0, 0))) @
                                         Matrix.Scale(0.460, 4, Vector((0, 1, 0))) @
                                         Matrix.Scale(0.012, 4, Vector((0, 0, 1))))

        # Oil filler cap on driver side valve cover
        if side > 0:
            oil_cap_pos = Vector((vx, vy + 0.160, vz + 0.060))
            bmesh.ops.create_cylinder(bm_cleaner, cap_ends=True, segments=12, radius=0.024, depth=0.020,
                                      matrix=Matrix.Translation(oil_cap_pos))

    # -------------------------------------------------------------------------
    # 4. Bosch Ignition Distributor & Spark Plug Wire Harness
    # -------------------------------------------------------------------------
    dist_pos = Vector((0.0, eng_y + 0.260, eng_z - 0.080))

    # Orange/Red phenolic resin distributor cap
    bmesh.ops.create_cylinder(bm_cleaner, cap_ends=True, segments=16, radius=0.038, depth=0.055,
                              matrix=Matrix.Translation(dist_pos))

    # 8 Spark plug cable tower nipples
    for ti in range(8):
        tang = ti * (2.0 * math.pi / 8.0)
        t_pos = dist_pos + Vector((0.028 * math.cos(tang), 0.028 * math.sin(tang), 0.032))
        bmesh.ops.create_cylinder(bm_rubber, cap_ends=True, segments=8, radius=0.005, depth=0.016,
                                  matrix=Matrix.Translation(t_pos))
        # High-voltage ignition cable leads radiating to cylinder heads
        bank_side = 1.0 if (ti < 4) else -1.0
        lead_end = Vector((0.260 * bank_side, eng_y + (ti % 4 - 1.5) * 0.110, eng_z - 0.100))
        create_cylinder_between_p2(bm_rubber, t_pos, lead_end, radius=0.0035, segments=6)

    obj_ac = link_obj_p2("GEO_R107_M117_Air_Cleaner", bm_cleaner, parent_col, mats["black_trim"], bevel=0.001)
    obj_al = link_obj_p2("GEO_R107_M117_Valve_Covers", bm_alloy, parent_col, mats["chrome"], bevel=0.001)
    obj_ch = link_obj_p2("GEO_R107_Engine_Bay_Chrome", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)
    obj_rb = link_obj_p2("GEO_R107_Ignition_Wires_Rubber", bm_rubber, parent_col, mats["rubber"], bevel=0.0005)

    return [obj_ac, obj_al, obj_ch, obj_rb]
"""
=============================================================================
Procedural Class-A CAD Generator: Mercedes-Benz 560SL R107 (1980s)
PHASE 2 (Part 6): Mirrors, Handles, Badging, Antenna & Master Assembler
=============================================================================
Authentic exterior jewelry & master execution pipeline:
- Driver chrome aerodynamic teardrop mirror & passenger electric mirror
- Chrome door handles with textured black thumb push-buttons & lock cylinders
- Full-length body side protective rub-strips with chrome center beading
- Rocker sill anodized aluminum trim strips with rubber top seals
- Rear trunk lid die-cast individual chrome "560 SL" typography badging
- Central chrome trunk lock push-button rosette and keyhole shutter
- Hirschmann power telescoping chrome radio antenna on rear quarter panel
- Cowl dual chrome windshield washer jet nozzles
- Complete master orchestration unifying Phase 1 and Phase 2 into showroom GLBs
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler


def build_r107_mirrors_handles_and_side_mouldings(parent_col, mats):
    """
    Constructs the driver aerodynamic mirror, passenger electric mirror,
    chrome door handles, full-length side rub-strips, and rocker sill trims.
    """
    bm_chrome = bmesh.new()
    bm_rubber = bmesh.new()
    bm_glass  = bmesh.new()
    bm_trim   = bmesh.new()

    # -------------------------------------------------------------------------
    # 1. Driver & Passenger Exterior Rear-View Mirrors
    # -------------------------------------------------------------------------
    # Driver Side (X > 0, LHD): Classic Aerodynamic Teardrop Chrome Mirror
    mx_d = 0.850
    my_d = 0.480
    mz_d = 0.815

    # Die-cast triangular base pedestal mounted to A-pillar base
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=12, radius=0.018, depth=0.045,
                              matrix=Matrix.Translation((mx_d - 0.015, my_d, mz_d)) @
                                     Matrix.Rotation(math.radians(70.0), 4, 'Y'))
    # Rubber aerodynamic base gasket
    bmesh.ops.create_cylinder(bm_rubber, cap_ends=True, segments=12, radius=0.021, depth=0.008,
                              matrix=Matrix.Translation((mx_d - 0.022, my_d, mz_d)) @
                                     Matrix.Rotation(math.radians(70.0), 4, 'Y'))

    # Aerodynamic teardrop mirror shell (rounded front, tapered rear)
    bmesh.ops.create_icosphere(bm_chrome, subdivisions=2, radius=0.048,
                               matrix=Matrix.Translation((mx_d + 0.035, my_d, mz_d)) @
                                      Matrix.Scale(0.85, 4, Vector((1, 0, 0))) @
                                      Matrix.Scale(1.30, 4, Vector((0, 1, 0))) @
                                      Matrix.Scale(0.95, 4, Vector((0, 0, 1))))

    # Flat rear-facing reflective mirror glass pane
    bmesh.ops.create_cylinder(bm_glass, cap_ends=True, segments=16, radius=0.042, depth=0.004,
                              matrix=Matrix.Translation((mx_d + 0.035, my_d - 0.045, mz_d)) @
                                     Matrix.Rotation(math.radians(90.0), 4, 'X'))
    # Chrome glass retaining bezel
    bmesh.ops.create_torus(bm_chrome, major_radius=0.043, minor_radius=0.003,
                           major_segments=20, minor_segments=6,
                           matrix=Matrix.Translation((mx_d + 0.035, my_d - 0.044, mz_d)) @
                                  Matrix.Rotation(math.radians(90.0), 4, 'X'))

    # Passenger Side (X < 0): Period-Correct Electric Rectangular Chrome Mirror
    mx_p = -0.850
    my_p = 0.480
    mz_p = 0.815

    # Mounting pedestal stalk
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=12, radius=0.018, depth=0.045,
                              matrix=Matrix.Translation((mx_p + 0.015, my_p, mz_p)) @
                                     Matrix.Rotation(math.radians(-70.0), 4, 'Y'))
    bmesh.ops.create_cylinder(bm_rubber, cap_ends=True, segments=12, radius=0.021, depth=0.008,
                              matrix=Matrix.Translation((mx_p + 0.022, my_p, mz_p)) @
                                     Matrix.Rotation(math.radians(-70.0), 4, 'Y'))

    # Rectangular chrome mirror housing
    bmesh.ops.create_cube(bm_chrome, size=1.0,
                          matrix=Matrix.Translation((mx_p - 0.035, my_p, mz_p)) @
                                 Matrix.Scale(0.045, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.145, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.095, 4, Vector((0, 0, 1))))

    # Reflective flat glass pane
    bmesh.ops.create_cube(bm_glass, size=1.0,
                          matrix=Matrix.Translation((mx_p - 0.035, my_p - 0.045, mz_p)) @
                                 Matrix.Scale(0.004, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.138, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.088, 4, Vector((0, 0, 1))))

    # -------------------------------------------------------------------------
    # 2. Chrome Door Handles & Keyhole Cylinders (Left & Right)
    # -------------------------------------------------------------------------
    for side in [1.0, -1.0]:
        hx = 0.898 * side
        hy = -0.050
        hz = 0.745

        # Recessed door handle body plate (chrome escutcheon)
        bmesh.ops.create_cube(bm_chrome, size=1.0,
                              matrix=Matrix.Translation((hx, hy, hz)) @
                                     Matrix.Scale(0.014, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.160, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.036, 4, Vector((0, 0, 1))))

        # Grip pull handle bar (cylindrical bar with filleted ends)
        create_cylinder_between_p2(bm_chrome,
                                  Vector((hx + 0.012 * side, hy - 0.055, hz)),
                                  Vector((hx + 0.012 * side, hy + 0.040, hz)),
                                  radius=0.009, segments=10)

        # Textured black thumb push-button actuator (rear end of handle)
        bmesh.ops.create_cylinder(bm_trim, cap_ends=True, segments=10, radius=0.009, depth=0.012,
                                  matrix=Matrix.Translation((hx + 0.012 * side, hy + 0.055, hz)) @
                                         Matrix.Rotation(math.radians(90.0), 4, 'Y'))

        # Driver door keylock cylinder rosette (driver side only)
        if side > 0:
            bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=10, radius=0.007, depth=0.014,
                                      matrix=Matrix.Translation((hx + 0.008 * side, hy - 0.065, hz)) @
                                             Matrix.Rotation(math.radians(90.0), 4, 'Y'))
            # Horizontal key slot
            bmesh.ops.create_cube(bm_trim, size=1.0,
                                  matrix=Matrix.Translation((hx + 0.015 * side, hy - 0.065, hz)) @
                                         Matrix.Scale(0.002, 4, Vector((1, 0, 0))) @
                                         Matrix.Scale(0.008, 4, Vector((0, 1, 0))) @
                                         Matrix.Scale(0.002, 4, Vector((0, 0, 1))))

        # Perimeter rubber gasket cushion under handle
        bmesh.ops.create_cube(bm_rubber, size=1.0,
                              matrix=Matrix.Translation((hx - 0.002 * side, hy, hz)) @
                                     Matrix.Scale(0.016, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.168, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.042, 4, Vector((0, 0, 1))))

    # -------------------------------------------------------------------------
    # 3. Full-Length Body Side Protective Rub-Strips with Chrome Beading
    # -------------------------------------------------------------------------
    # Runs continuously along the waistline below the shoulder crease
    for side in [1.0, -1.0]:
        sx = 0.892 * side
        # Section 1: Front Fender Rub-Strip (from front indicator Y=1.850 to door gap Y=0.750)
        p_f1 = Vector((sx * 0.92, 1.850, 0.655))
        p_f2 = Vector((sx,        0.750, 0.665))
        create_oriented_box_between_p2(bm_rubber, p_f1, p_f2, width=0.014, height=0.032)
        create_oriented_box_between_p2(bm_chrome,
                                      p_f1 + Vector((0.006 * side, 0, 0)),
                                      p_f2 + Vector((0.006 * side, 0, 0)),
                                      width=0.004, height=0.008)

        # Section 2: Door Rub-Strip (from Y=0.720 to Y=-0.580)
        p_d1 = Vector((sx,  0.720, 0.665))
        p_d2 = Vector((sx, -0.580, 0.665))
        create_oriented_box_between_p2(bm_rubber, p_d1, p_d2, width=0.014, height=0.032)
        create_oriented_box_between_p2(bm_chrome,
                                      p_d1 + Vector((0.006 * side, 0, 0)),
                                      p_d2 + Vector((0.006 * side, 0, 0)),
                                      width=0.004, height=0.008)

        # Section 3: Rear Quarter Rub-Strip (from Y=-0.610 to rear taillamp Y=-1.950)
        p_r1 = Vector((sx,        -0.610, 0.665))
        p_r2 = Vector((sx * 0.94, -1.950, 0.655))
        create_oriented_box_between_p2(bm_rubber, p_r1, p_r2, width=0.014, height=0.032)
        create_oriented_box_between_p2(bm_chrome,
                                      p_r1 + Vector((0.006 * side, 0, 0)),
                                      p_r2 + Vector((0.006 * side, 0, 0)),
                                      width=0.004, height=0.008)

    # -------------------------------------------------------------------------
    # 4. Rocker Sill Anodized Aluminum Fluted Trim Strips
    # -------------------------------------------------------------------------
    for side in [1.0, -1.0]:
        rx = 0.815 * side
        sill_p1 = Vector((rx,  0.820, 0.168))
        sill_p2 = Vector((rx, -0.820, 0.168))

        # Main extruded aluminum trim strip
        create_oriented_box_between_p2(bm_chrome, sill_p1, sill_p2, width=0.012, height=0.024)

        # Upper black rubber weatherseal bead
        create_oriented_box_between_p2(bm_rubber,
                                      sill_p1 + Vector((0, 0, 0.014)),
                                      sill_p2 + Vector((0, 0, 0.014)),
                                      width=0.006, height=0.006)

        # Longitudinal fine fluting ribs (3 flutes along sill)
        for fl_z in [-0.006, 0.0, 0.006]:
            create_cylinder_between_p2(bm_trim,
                                      sill_p1 + Vector((0.005 * side, 0, fl_z)),
                                      sill_p2 + Vector((0.005 * side, 0, fl_z)),
                                      radius=0.0015, segments=6)

    obj_chm = link_obj_p2("GEO_R107_Jewelry_Chrome", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_rub = link_obj_p2("GEO_R107_Side_Rub_Strips", bm_rubber, parent_col, mats["rubber"], bevel=0.0005)
    obj_gls = link_obj_p2("GEO_R107_Mirror_Glass_Panes", bm_glass, parent_col, mats["headlamp"], bevel=0.0005)
    obj_trm = link_obj_p2("GEO_R107_Handle_Button_Accents", bm_trim, parent_col, mats["black_trim"], bevel=0.0005)

    return [obj_chm, obj_rub, obj_gls, obj_trm]


def build_r107_emblems_antenna_and_finishing_jewelry(parent_col, mats):
    """
    Constructs the die-cast chrome "560 SL" script emblem, trunk lock rosette,
    Hirschmann power telescoping antenna, and cowl windshield washer nozzles.
    """
    bm_chrome = bmesh.new()
    bm_rubber = bmesh.new()
    bm_trim   = bmesh.new()

    # -------------------------------------------------------------------------
    # 1. Die-Cast Chrome "560 SL" Badging (Left Rear Trunk Lid Face)
    # -------------------------------------------------------------------------
    # Positioned on the vertical rear trunk transom face to the left of center
    badge_cen = Vector((0.360, -2.182, 0.720))

    # Letters modeled as authentic 3D chrome serif glyph blocks
    # "5", "6", "0", "S", "L"
    glyph_specs = [
        (0.260, 0.024, "5"),
        (0.295, 0.024, "6"),
        (0.330, 0.024, "0"),
        (0.380, 0.022, "S"),
        (0.410, 0.022, "L"),
    ]

    for gx, gw, gchar in glyph_specs:
        gpos = Vector((gx, badge_cen.y - 0.004, badge_cen.z))
        # 3D Raised die-cast letter relief
        bmesh.ops.create_cube(bm_chrome, size=1.0,
                              matrix=Matrix.Translation(gpos) @
                                     Matrix.Scale(gw, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.006, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.028, 4, Vector((0, 0, 1))))

    # -------------------------------------------------------------------------
    # 2. Center Trunk Lid Lock Push-Button Rosette
    # -------------------------------------------------------------------------
    # Centered on rear trunk panel above bumper
    lock_pos = Vector((0.0, -2.186, 0.680))
    # Chrome circular bezel ring
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=16, radius=0.016, depth=0.008,
                              matrix=Matrix.Translation(lock_pos) @ Matrix.Rotation(math.radians(90.0), 4, 'X'))
    # Center spring-loaded push button
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=12, radius=0.011, depth=0.010,
                              matrix=Matrix.Translation(lock_pos - Vector((0, 0.002, 0))) @
                                     Matrix.Rotation(math.radians(90.0), 4, 'X'))
    # Keyhole dust cover shutter slot
    bmesh.ops.create_cube(bm_trim, size=1.0,
                          matrix=Matrix.Translation(lock_pos - Vector((0, 0.007, 0))) @
                                 Matrix.Scale(0.008, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.002, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.003, 4, Vector((0, 0, 1))))

    # -------------------------------------------------------------------------
    # 3. Hirschmann Power Telescoping Radio Antenna (Left Rear Quarter Panel)
    # -------------------------------------------------------------------------
    ant_cen = Vector((-0.740, -1.450, 0.790))

    # Angled rubber base grommet fitting rear quarter curvature
    bmesh.ops.create_cylinder(bm_rubber, cap_ends=True, segments=14, radius=0.015, depth=0.018,
                              matrix=Matrix.Translation(ant_cen) @
                                     Matrix.Rotation(math.radians(12.0), 4, 'X') @
                                     Matrix.Rotation(math.radians(-8.0), 4, 'Y'))

    # Threaded chrome retaining bezel nut
    bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=14, radius=0.012, depth=0.012,
                              matrix=Matrix.Translation(ant_cen + Vector((0, 0, 0.010))) @
                                     Matrix.Rotation(math.radians(12.0), 4, 'X') @
                                     Matrix.Rotation(math.radians(-8.0), 4, 'Y'))

    # 4 Stepped Telescoping Chrome Mast Sections (Partially extended)
    mast_base = ant_cen + Vector((0, 0, 0.015))
    mast_stages = [
        (0.0045, 0.120),  # Stage 1 base section
        (0.0035, 0.140),  # Stage 2 middle section
        (0.0025, 0.160),  # Stage 3 upper section
        (0.0018, 0.180),  # Stage 4 tip section
    ]

    cur_p = mast_base
    ant_dir = Vector((-0.08, 0.12, 0.98)).normalized()
    for mr, mlen in mast_stages:
        next_p = cur_p + ant_dir * mlen
        create_cylinder_between_p2(bm_chrome, cur_p, next_p, radius=mr, segments=8)
        cur_p = next_p

    # Chrome teardrop mast tip bead
    bmesh.ops.create_icosphere(bm_chrome, subdivisions=1, radius=0.004,
                               matrix=Matrix.Translation(cur_p))

    # -------------------------------------------------------------------------
    # 4. Windshield Washer Spray Nozzles (Dual Chrome Jets on Cowl)
    # -------------------------------------------------------------------------
    for side in [1.0, -1.0]:
        jet_pos = Vector((0.320 * side, 0.860, 0.815))
        # Chrome aerodynamic nozzle jet body
        bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=8, radius=0.005, depth=0.010,
                                  matrix=Matrix.Translation(jet_pos))
        # Twin fluid spray orifice holes
        for off_x in [-0.002, 0.002]:
            bmesh.ops.create_cylinder(bm_trim, cap_ends=True, segments=6, radius=0.001, depth=0.004,
                                      matrix=Matrix.Translation(jet_pos + Vector((off_x, 0.004, 0.003))) @
                                             Matrix.Rotation(math.radians(45.0), 4, 'X'))

    # -------------------------------------------------------------------------
    # 5. Removable Hardtop Chrome Tonneau Deck Clamps & Rear Mounting Latches
    # -------------------------------------------------------------------------
    for side in [1.0, -1.0]:
        clamp_pos = Vector((0.680 * side, -0.740, 0.795))
        # Chrome circular deck plate rosette
        bmesh.ops.create_cylinder(bm_chrome, cap_ends=True, segments=12, radius=0.022, depth=0.006,
                                  matrix=Matrix.Translation(clamp_pos))
        # Recessed receiver socket hole for hardtop pin
        bmesh.ops.create_cylinder(bm_trim, cap_ends=True, segments=10, radius=0.014, depth=0.008,
                                  matrix=Matrix.Translation(clamp_pos + Vector((0, 0, 0.002))))

    obj_chm = link_obj_p2("GEO_R107_Badging_And_Antenna", bm_chrome, parent_col, mats["chrome"], bevel=0.001)
    obj_rub = link_obj_p2("GEO_R107_Antenna_Grommet_Rubber", bm_rubber, parent_col, mats["rubber"], bevel=0.0005)
    obj_trm = link_obj_p2("GEO_R107_Lock_Slot_Accents", bm_trim, parent_col, mats["black_trim"], bevel=0.0005)

    return [obj_chm, obj_rub, obj_trm]


# ---------------------------------------------------------------------------
# MASTER UNIFIED VEHICLE BUILDER & DUAL-MODE GLB EXPORT PIPELINE
# ---------------------------------------------------------------------------
def build_mercedes_560sl_master_complete():
    """
    Builds the complete showroom-ready Mercedes-Benz 560SL R107:
    - Executes Phase 1 authentic engineering foundation (monocoque, hardtop, wheels, underbody, suspension, exhaust, fuel, cooling)
    - Executes Phase 2 micro-detailing & exterior jewelry (3D grille, 100mm star, lighting optics, heavy bumpers, badging, antenna)
    - Verifies watertight Class-A CAD mesh integrity and zero see-through voids
    - Exports master unified GLB models to all 3 designated targets.
    """
    print("=" * 80)
    print("STARTING MASTER VEHICLE ASSEMBLY: MERCEDES-BENZ 560SL R107 (PHASE 1 & 2)")
    print("=" * 80)

    reset_scene_phase2()

    # Create root vehicle collection
    root_col = bpy.data.collections.new("Mercedes_Benz_560SL_1980s_Master")
    bpy.context.scene.collection.children.link(root_col)

    all_objects = []

    # -------------------------------------------------------------------------
    # PART A: PHASE 1 ARCHITECTURAL FOUNDATION & RUNNING GEAR
    # -------------------------------------------------------------------------
    print("[MASTER 1/12] Building Monocoque Body Shell & Hardtop...")
    import generate_mercedes_560sl_phase1 as p1
    mats_p1 = p1.MATS

    objs_body = p1.build_r107_monocoque_body_shell(root_col, mats_p1)
    all_objects.extend(objs_body)

    objs_hardtop = p1.build_r107_removable_hardtop(root_col, mats_p1)
    all_objects.extend(objs_hardtop)

    print("[MASTER 2/12] Building Underbody Chassis, Floorpan & Enclosed Wheel Tubs...")
    objs_underbody = p1.build_r107_underbody_chassis_and_wheel_tubs(root_col, mats_p1)
    all_objects.extend(objs_underbody)

    print("[MASTER 3/12] Building 15-inch Gullideckel / Bundt Alloy Wheels & Tires...")
    objs_wheels = p1.build_r107_bundt_wheels_and_tires(root_col, mats_p1)
    all_objects.extend(objs_wheels)

    print("[MASTER 4/12] Building Steering Linkage, Pitman Arm & Damper...")
    objs_steering = p1.build_r107_steering_linkage_and_damper(root_col, mats_p1)
    all_objects.extend(objs_steering)

    print("[MASTER 5/12] Building M117 V8 Finned Oil Pan & Subframe Bracing...")
    objs_oilpan = p1.build_r107_v8_oil_pan_and_crossmember_bracing(root_col, mats_p1)
    all_objects.extend(objs_oilpan)

    print("[MASTER 6/12] Building Rear Suspension Sway Bar, Axle Halfshafts & Anti-Squat...")
    objs_rear_susp = p1.build_r107_rear_suspension_swaybar_and_halfshafts(root_col, mats_p1)
    all_objects.extend(objs_rear_susp)

    print("[MASTER 7/12] Building Windshield Cowl Louvers, Jacking Tubes & Pinchwelds...")
    objs_cowl = p1.build_r107_windshield_cowl_and_wipers(root_col, mats_p1)
    all_objects.extend(objs_cowl)
    objs_jacks = p1.build_r107_chassis_pinchwelds_and_jacking_tubes(root_col, mats_p1)
    all_objects.extend(objs_jacks)

    print("[MASTER 8/12] Building Front Subframe Cradle, Bilstein Dampers & Wishbones...")
    objs_front_susp = p1.build_r107_front_subframe_and_bilstein_dampers(root_col, mats_p1)
    all_objects.extend(objs_front_susp)

    print("[MASTER 9/12] Building M117 V8 Full Exhaust System & Embossed Heat Shields...")
    objs_exhaust = p1.build_r107_m117_v8_exhaust_system_and_heat_shields(root_col, mats_p1)
    all_objects.extend(objs_exhaust)

    print("[MASTER 10/12] Building Rear Differential, Dual Fuel Pumps & 85L Fuel Cell...")
    objs_fuel = p1.build_r107_fuel_system_and_rear_axle_differential(root_col, mats_p1)
    all_objects.extend(objs_fuel)

    print("[MASTER 11/12] Building Radiator Cooling Pack, Pusher Fan & Underbody Aero...")
    objs_cool = p1.build_r107_cooling_pack_and_engine_bay_apertures(root_col, mats_p1)
    all_objects.extend(objs_cool)
    objs_aero = p1.build_r107_chassis_drainage_and_underbody_aerodynamics(root_col, mats_p1)
    all_objects.extend(objs_aero)

    # -------------------------------------------------------------------------
    # PART B: PHASE 2 MICRO-JEWELRY & EXTERIOR ILLUMINATION
    # -------------------------------------------------------------------------
    print("[MASTER 12/12] Building Phase 2 High-Gloss Chrome Grille, Lighting Optics & Jewelry...")
    objs_grille = build_r107_chrome_grille_and_mercedes_star(root_col, MATS_P2)
    all_objects.extend(objs_grille)

    objs_lights = build_r107_headlight_assemblies_and_corner_indicators(root_col, MATS_P2)
    all_objects.extend(objs_lights)

    objs_taillights = build_r107_dirt_shedding_ribbed_taillights(root_col, MATS_P2)
    all_objects.extend(objs_taillights)

    objs_bumpers = build_r107_heavy_chrome_bumpers_and_overriders(root_col, MATS_P2)
    all_objects.extend(objs_bumpers)

    objs_mirrors = build_r107_mirrors_handles_and_side_mouldings(root_col, MATS_P2)
    all_objects.extend(objs_mirrors)

    objs_jewelry = build_r107_emblems_antenna_and_finishing_jewelry(root_col, MATS_P2)
    all_objects.extend(objs_jewelry)

    print("[MASTER 13/18] Building Windshield Chrome Header, Sun Visors & Rearview Mirror...")
    objs_header = build_r107_windshield_header_and_sun_visors(root_col, MATS_P2)
    all_objects.extend(objs_header)

    print("[MASTER 14/18] Building Tonneau Hatch Lid & Radiator Support Data Plates...")
    objs_tonneau = build_r107_tonneau_cover_and_engine_decals(root_col, MATS_P2)
    all_objects.extend(objs_tonneau)

    print("[MASTER 15/18] Building Wheel Arch Liners & Mercedes Rubber Mudflaps...")
    objs_mudflaps = build_r107_wheel_arch_inner_liners_and_mudflaps(root_col, MATS_P2)
    all_objects.extend(objs_mudflaps)

    print("[MASTER 16/18] Building Trunk Carpet, Bundt Spare Wheel & Toolkit...")
    objs_trunk = build_r107_trunk_interior_lining_and_spare_wheel(root_col, MATS_P2)
    all_objects.extend(objs_trunk)

    print("[MASTER 17/18] Building Cockpit Interior Silhouettes & Steering Wheel...")
    objs_cockpit = build_r107_cockpit_interior_silhouettes(root_col, MATS_P2)
    all_objects.extend(objs_cockpit)

    print("[MASTER 18/18] Building Underhood M117 V8 Air Cleaner & Accessories...")
    objs_cleaner = build_r107_underhood_m117_v8_air_cleaner(root_col, MATS_P2)
    all_objects.extend(objs_cleaner)

    # Statistical Evaluation & Verification
    total_verts = sum(len(o.data.vertices) for o in all_objects if hasattr(o, "data") and hasattr(o.data, "vertices"))
    total_faces = sum(len(o.data.polygons) for o in all_objects if hasattr(o, "data") and hasattr(o.data, "polygons"))
    print(f"[SUMMARY] Mercedes-Benz 560SL R107 (Phases 1 & 2) Complete!")
    print(f"          Total Hierarchy Objects : {len(all_objects)}")
    print(f"          Total Micro-Mesh Vertices: {total_verts:,}")
    print(f"          Total CAD Polygons      : {total_faces:,}")

    # Dual-Mode Master GLB Export
    export_targets = [
        os.path.abspath(r"E:\Car_Automation\public\models\vehicles\convertible\1980s\vehicle.glb"),
        os.path.abspath(r"E:\Car_Automation\public\models\Car_Mercedes_Benz_560SL_1980s.glb"),
        os.path.abspath(r"E:\Car_Automation\exports\Car_Mercedes_Benz_560SL_1980s.glb"),
    ]

    for export_path in export_targets:
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        print(f"[EXPORT] Writing Showroom Master CAD GLB -> {export_path}")
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        file_size_mb = os.path.getsize(export_path) / (1024 * 1024)
        print(f"         Export complete! File size: {file_size_mb:.2f} MB")

    print("=" * 80)
    print("MERCEDES-BENZ 560SL R107 MASTER VEHICLE GENERATION COMPLETE!")
    print("=" * 80)


if __name__ == "__main__":
    build_mercedes_560sl_master_complete()
