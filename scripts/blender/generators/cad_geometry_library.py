"""
==============================================================================
AUTOMOTIVE CAD PROCEDURAL GEOMETRY & PBR SHADER LIBRARY (BLENDER 5.2 LTS)
==============================================================================
Provides high-density, parametric procedural mechanical components:
- Hexagonal / honeycomb grilles & wire mesh
- Micro-tube & corrugated fin heat exchangers
- Flanged fittings, AN-lines, T-bolt clamps
- Precision fasteners (hex bolts, socket-head cap screws, ARP studs)
- Spherical heim joints, tie rods, forged end links
- Aerodynamic airfoils, vortex generators, louvers, strakes
- Comprehensive automotive PBR Principled BSDF material factory
==============================================================================
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler

# ---------------------------------------------------------------------------
# Scene & Collection Utilities
# ---------------------------------------------------------------------------

def clear_blender_scene():
    """Wipes all objects, meshes, materials, and collections for a clean run."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o)
    for m in list(bpy.data.materials):
        bpy.data.materials.remove(m)
    for me in list(bpy.data.meshes):
        bpy.data.meshes.remove(me)

def ensure_collection(col_name="CAD_Components"):
    col = bpy.data.collections.get(col_name)
    if not col:
        col = bpy.data.collections.new(col_name)
        bpy.context.scene.collection.children.link(col)
    return col

# ---------------------------------------------------------------------------
# Automotive PBR Material Factory
# ---------------------------------------------------------------------------

def get_or_create_material(name, mat_type="metal", **kwargs):
    """
    Creates or updates a PBR Principled BSDF material.
    Supported types:
    - 'carbon_twill': High-gloss 2x2 carbon fiber with clearcoat
    - 'carbon_matte': Dry matte aerodynamic carbon fiber
    - 'billet_aluminum': CNC machined anodized aluminum
    - 'cast_aluminum': Lightly textured cast alloy
    - 'titanium': Polished Grade 5 Titanium with slight blue/straw heat tint
    - 'chrome': Mirror gloss chrome
    - 'gold_heatshield': Reflective gold thermal barrier foil
    - 'anodized_red': Deep red anodized billet aluminum
    - 'anodized_blue': Royal blue anodized fitting
    - 'copper_brass': Machined copper/brass fasteners & nuts
    - 'automotive_paint': Deep metallic clearcoat paint
    - 'optical_glass': High transmission, low roughness glass
    - 'optical_lens': Headlight/camera Fresnel lens with slight refraction
    - 'rubber_black': High roughness synthetic rubber with micro-sheen
    - 'led_amber': High intensity turn signal emission
    - 'led_red': High intensity brake light emission
    - 'led_white': High intensity daytime running lamp emission
    - 'wire_mesh': Semi-translucent dark honeycomb screen
    """
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        
    tree = mat.node_tree
    bsdf = None
    for n in tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            bsdf = n
            break
    if not bsdf:
        bsdf = tree.nodes.new(type='ShaderNodeBsdfPrincipled')
        out = tree.nodes.get("Material Output")
        if not out:
            out = tree.nodes.new(type='ShaderNodeOutputMaterial')
        tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
        
    def set_inp(inp_name, val):
        if inp_name in bsdf.inputs:
            bsdf.inputs[inp_name].default_value = val

    if mat_type == 'carbon_twill':
        set_inp("Base Color", (0.025, 0.027, 0.030, 1.0))
        set_inp("Metallic", 0.35)
        set_inp("Roughness", 0.22)
        set_inp("Coat Weight", 1.0)
        set_inp("Coat Roughness", 0.03)
        set_inp("Clearcoat", 1.0)
        set_inp("Clearcoat Roughness", 0.03)
    elif mat_type == 'carbon_matte':
        set_inp("Base Color", (0.04, 0.04, 0.045, 1.0))
        set_inp("Metallic", 0.15)
        set_inp("Roughness", 0.65)
        set_inp("Coat Weight", 0.0)
    elif mat_type == 'billet_aluminum':
        set_inp("Base Color", (0.85, 0.86, 0.88, 1.0))
        set_inp("Metallic", 0.98)
        set_inp("Roughness", 0.18)
    elif mat_type == 'cast_aluminum':
        set_inp("Base Color", (0.75, 0.76, 0.77, 1.0))
        set_inp("Metallic", 0.88)
        set_inp("Roughness", 0.42)
    elif mat_type == 'titanium':
        set_inp("Base Color", (0.72, 0.73, 0.76, 1.0))
        set_inp("Metallic", 0.95)
        set_inp("Roughness", 0.24)
    elif mat_type == 'chrome':
        set_inp("Base Color", (0.95, 0.96, 0.98, 1.0))
        set_inp("Metallic", 1.0)
        set_inp("Roughness", 0.04)
    elif mat_type == 'gold_heatshield':
        set_inp("Base Color", (1.0, 0.76, 0.15, 1.0))
        set_inp("Metallic", 0.95)
        set_inp("Roughness", 0.28)
    elif mat_type == 'anodized_red':
        set_inp("Base Color", (0.85, 0.02, 0.04, 1.0))
        set_inp("Metallic", 0.85)
        set_inp("Roughness", 0.22)
        set_inp("Coat Weight", 0.8)
        set_inp("Clearcoat", 0.8)
    elif mat_type == 'anodized_blue':
        set_inp("Base Color", (0.02, 0.25, 0.88, 1.0))
        set_inp("Metallic", 0.85)
        set_inp("Roughness", 0.22)
    elif mat_type == 'copper_brass':
        set_inp("Base Color", (0.85, 0.52, 0.24, 1.0))
        set_inp("Metallic", 0.92)
        set_inp("Roughness", 0.25)
    elif mat_type == 'automotive_paint':
        color = kwargs.get("color", (0.08, 0.28, 0.78, 1.0))
        set_inp("Base Color", color)
        set_inp("Metallic", 0.90)
        set_inp("Roughness", 0.16)
        set_inp("Coat Weight", 1.0)
        set_inp("Coat Roughness", 0.03)
        set_inp("Clearcoat", 1.0)
        set_inp("Clearcoat Roughness", 0.03)
    elif mat_type == 'optical_glass':
        set_inp("Base Color", (0.94, 0.97, 1.0, 1.0))
        set_inp("Metallic", 0.0)
        set_inp("Roughness", 0.02)
        set_inp("IOR", 1.52)
        set_inp("Transmission Weight", 0.96)
        set_inp("Transmission", 0.96)
        mat.blend_method = 'BLEND'
    elif mat_type == 'optical_lens':
        set_inp("Base Color", (0.90, 0.95, 1.0, 1.0))
        set_inp("Metallic", 0.1)
        set_inp("Roughness", 0.06)
        set_inp("IOR", 1.55)
        set_inp("Transmission Weight", 0.85)
        set_inp("Transmission", 0.85)
        mat.blend_method = 'BLEND'
    elif mat_type == 'rubber_black':
        set_inp("Base Color", (0.03, 0.03, 0.035, 1.0))
        set_inp("Metallic", 0.0)
        set_inp("Roughness", 0.88)
        set_inp("Sheen Weight", 0.3)
    elif mat_type == 'led_amber':
        set_inp("Base Color", (1.0, 0.62, 0.02, 1.0))
        set_inp("Emission Color", (1.0, 0.62, 0.02, 1.0))
        set_inp("Emission", (1.0, 0.62, 0.02, 1.0))
        set_inp("Emission Strength", 16.0)
    elif mat_type == 'led_red':
        set_inp("Base Color", (1.0, 0.02, 0.02, 1.0))
        set_inp("Emission Color", (1.0, 0.02, 0.02, 1.0))
        set_inp("Emission", (1.0, 0.02, 0.02, 1.0))
        set_inp("Emission Strength", 18.0)
    elif mat_type == 'led_white':
        set_inp("Base Color", (0.96, 0.98, 1.0, 1.0))
        set_inp("Emission Color", (0.96, 0.98, 1.0, 1.0))
        set_inp("Emission", (0.96, 0.98, 1.0, 1.0))
        set_inp("Emission Strength", 20.0)
    elif mat_type == 'wire_mesh':
        set_inp("Base Color", (0.05, 0.05, 0.05, 1.0))
        set_inp("Metallic", 0.70)
        set_inp("Roughness", 0.35)
    else: # Default metal
        set_inp("Base Color", (0.7, 0.7, 0.72, 1.0))
        set_inp("Metallic", 0.90)
        set_inp("Roughness", 0.25)
        
    return mat

def bmesh_create_cylinder(bm, radius=1.0, depth=2.0, segments=32, cap_ends=True, matrix=None):
    """Standard cylinder primitive in bmesh using create_cone."""
    if matrix is None:
        matrix = Matrix.Identity(4)
    return bmesh.ops.create_cone(
        bm,
        cap_ends=cap_ends,
        segments=segments,
        radius1=radius,
        radius2=radius,
        depth=depth,
        matrix=matrix
    )

# ---------------------------------------------------------------------------
# Procedural CAD Primitive Generators
# ---------------------------------------------------------------------------

def create_hex_bolt(name, radius=0.008, height=0.006, flange_radius=0.012, mat=None):
    """Generates a detailed flanged Grade 12.9 hexagonal bolt."""
    bm = bmesh.new()
    # Flange ring
    bmesh_create_cylinder(
        bm,
        cap_ends=True,
        segments=24,
        radius=flange_radius,
        depth=height * 0.4,
        matrix=Matrix.Translation((0, 0, height * 0.2))
    )
    # Hexagonal head
    bmesh_create_cylinder(
        bm,
        cap_ends=True,
        segments=6,
        radius=radius,
        depth=height * 0.8,
        matrix=Matrix.Translation((0, 0, height * 0.6))
    )
    # Recessed center mark
    bmesh_create_cylinder(
        bm,
        cap_ends=True,
        segments=12,
        radius=radius * 0.45,
        depth=height * 0.2,
        matrix=Matrix.Translation((0, 0, height * 0.95))
    )
    
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    if mat:
        obj.data.materials.append(mat)
    for p in mesh.polygons:
        p.use_smooth = True
    return obj

def create_socket_head_cap_screw(name, radius=0.007, height=0.008, mat=None):
    """Generates an Allen socket-head cap screw with knurled head and hex socket drive."""
    bm = bmesh.new()
    # Cylindrical head
    bmesh_create_cylinder(
        bm,
        cap_ends=True,
        segments=24,
        radius=radius,
        depth=height,
        matrix=Matrix.Translation((0, 0, height * 0.5))
    )
    # Hex drive socket recess in top
    bmesh_create_cylinder(
        bm,
        cap_ends=True,
        segments=6,
        radius=radius * 0.55,
        depth=height * 0.45,
        matrix=Matrix.Translation((0, 0, height * 0.85))
    )
    # Threaded shank
    bmesh_create_cylinder(
        bm,
        cap_ends=True,
        segments=16,
        radius=radius * 0.6,
        depth=height * 1.5,
        matrix=Matrix.Translation((0, 0, -height * 0.75))
    )
    
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    if mat:
        obj.data.materials.append(mat)
    for p in mesh.polygons:
        p.use_smooth = True
    return obj

def create_cooling_fin_array(name, width=0.4, depth=0.1, height=0.2, fin_count=32, fin_thickness=0.002, mat=None):
    """Generates a dense heat exchanger array of micro-fins and coolant flow tubes."""
    bm = bmesh.new()
    
    # Base manifold top and bottom
    end_tank_depth = depth * 1.1
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation((0, 0, height * 0.5)) @ Matrix.Diagonal((width, end_tank_depth, 0.02, 1.0))
    )
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation((0, 0, -height * 0.5)) @ Matrix.Diagonal((width, end_tank_depth, 0.02, 1.0))
    )
    
    # Extruded cooling fins
    spacing = width / (fin_count + 1)
    start_x = -width * 0.5 + spacing
    for i in range(fin_count):
        x = start_x + i * spacing
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation((x, 0, 0)) @ Matrix.Diagonal((fin_thickness, depth, height, 1.0))
        )
        
    # Coolant tubes running horizontally through fins
    tube_count = max(4, int(height / 0.03))
    t_spacing = height / (tube_count + 1)
    start_z = -height * 0.5 + t_spacing
    for j in range(tube_count):
        z = start_z + j * t_spacing
        bmesh_create_cylinder(
            bm,
            cap_ends=True,
            segments=16,
            radius=0.005,
            depth=width * 0.98,
            matrix=Matrix.Translation((0, 0, z)) @ Matrix.Rotation(math.radians(90), 4, 'Y')
        )
        
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    if mat:
        obj.data.materials.append(mat)
    for p in mesh.polygons:
        p.use_smooth = True
    return obj

def create_honeycomb_mesh(name, width=0.6, height=0.2, cell_size=0.015, thickness=0.008, mat=None):
    """Generates a motorsport hexagonal honeycomb aerodynamic grille screen."""
    bm = bmesh.new()
    
    r = cell_size * 0.5
    w_step = cell_size * 1.5
    h_step = cell_size * math.sqrt(3)
    
    cols = max(4, int(width / w_step))
    rows = max(3, int(height / h_step))
    
    for c in range(cols):
        cx = -width * 0.5 + (c + 0.5) * w_step
        for r_idx in range(rows):
            cy = -height * 0.5 + (r_idx + 0.5) * h_step
            if c % 2 == 1:
                cy += h_step * 0.5
            if abs(cx) < width * 0.48 and abs(cy) < height * 0.48:
                # 6-sided cell walls
                bmesh_create_cylinder(
                    bm,
                    cap_ends=False,
                    segments=6,
                    radius=r,
                    depth=thickness,
                    matrix=Matrix.Translation((cx, cy, 0)) @ Matrix.Rotation(math.radians(90), 4, 'X')
                )
                
    # Outer bezel frame
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation((0, height*0.5, 0)) @ Matrix.Diagonal((width, thickness * 1.5, 0.012, 1.0))
    )
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation((0, -height*0.5, 0)) @ Matrix.Diagonal((width, thickness * 1.5, 0.012, 1.0))
    )
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation((width*0.5, 0, 0)) @ Matrix.Diagonal((0.012, thickness * 1.5, height, 1.0))
    )
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation((-width*0.5, 0, 0)) @ Matrix.Diagonal((0.012, thickness * 1.5, height, 1.0))
    )
    
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    if mat:
        obj.data.materials.append(mat)
    for p in mesh.polygons:
        p.use_smooth = True
    return obj

def create_heim_joint(name, rod_radius=0.010, ball_radius=0.014, body_length=0.06, mat=None):
    """Generates a precision spherical rod end heim joint with locknut & threaded shank."""
    bm = bmesh.new()
    
    # Spherical outer eyelet housing
    bmesh_create_cylinder(
        bm,
        cap_ends=True,
        segments=28,
        radius=ball_radius * 1.4,
        depth=ball_radius * 1.2,
        matrix=Matrix.Identity(4)
    )
    # Inner spherical ball
    bmesh.ops.create_uvsphere(
        bm,
        u_segments=24,
        v_segments=16,
        radius=ball_radius,
        matrix=Matrix.Identity(4)
    )
    # Through-hole spacer bushings (left and right)
    bmesh_create_cylinder(
        bm,
        cap_ends=True,
        segments=20,
        radius=ball_radius * 0.6,
        depth=ball_radius * 2.0,
        matrix=Matrix.Identity(4)
    )
    # Threaded shank body
    bmesh_create_cylinder(
        bm,
        cap_ends=True,
        segments=24,
        radius=rod_radius,
        depth=body_length,
        matrix=Matrix.Translation((0, body_length * 0.5 + ball_radius * 1.1, 0)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    # Hex jam locknut on shank
    bmesh_create_cylinder(
        bm,
        cap_ends=True,
        segments=6,
        radius=rod_radius * 1.5,
        depth=0.008,
        matrix=Matrix.Translation((0, body_length * 0.7 + ball_radius * 1.1, 0)) @ Matrix.Rotation(math.radians(90), 4, 'X')
    )
    
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    if mat:
        obj.data.materials.append(mat)
    for p in mesh.polygons:
        p.use_smooth = True
    return obj

def apply_mesh_polish(obj, bevel_width=0.004, subsurf_levels=0):
    """Adds bevel modifier, weighted normal, and recalculates smooth normals."""
    bpy.context.view_layer.objects.active = obj
    mesh = obj.data
    for p in mesh.polygons:
        p.use_smooth = True
        
    if bevel_width > 0:
        bev = obj.modifiers.new(name="CAD_Bevel", type='BEVEL')
        bev.width = bevel_width
        bev.segments = 3
        bev.profile = 0.7
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)
        
    if subsurf_levels > 0:
        sub = obj.modifiers.new(name="CAD_Subsurf", type='SUBSURF')
        sub.levels = subsurf_levels
        sub.render_levels = subsurf_levels
        
    wn = obj.modifiers.new(name="CAD_WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True
    wn.weight = 80
