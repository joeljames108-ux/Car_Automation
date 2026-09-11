"""
Sedan Common Utilities & Geometry Helpers (Blender 4.x / 5.x)
High-Fidelity Executive Sport Sedan Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler

COLLECTIONS = [
    "01_Body_Shell",
    "02_Bumpers_Fascia",
    "03_Lighting_Optics",
    "04_Greenhouse_Glazing",
    "05_Exterior_Jewelry",
    "06_Chassis_Monocoque",
    "07_Powertrain_Drivetrain",
    "08_Suspension_Steering",
    "09_Wheels_Brakes",
    "10_Luxury_Interior",
    "11_Underbody_Aero"
]

# Coordinate Standards & Blueprint Reference Measurements (m)
# Strict ISO 8855: Y-Forward (+Y), Z-Up (+Z), X-Lateral (+X Driver LHD)
WHEELBASE = 2.920       # 2920 mm
OVERALL_LENGTH = 4.880  # 4880 mm
OVERALL_WIDTH = 1.890   # 1890 mm (excluding mirrors)
OVERALL_HEIGHT = 1.435  # 1435 mm (unladen roof crown)
GROUND_CLEARANCE = 0.135
FRONT_TRACK = 1.620     # 1620 mm
REAR_TRACK = 1.630      # 1630 mm

FRONT_AXLE_Y = 1.460
REAR_AXLE_Y = -1.460
FRONT_BUMPER_Y = 2.440
REAR_BUMPER_Y = -2.440

TIRE_RADIUS = 0.340     # 680 mm outer diameter (ground contact Z=0.000m)
WHEEL_RADIUS = 0.254    # 20-inch rim (508 mm diameter / 2 = 254 mm)
FRONT_TIRE_WIDTH = 0.255 # 255/35 R20
REAR_TIRE_WIDTH = 0.285  # 285/30 R20
HUB_Z = TIRE_RADIUS     # 0.340 m

HOOD_REAR_Y = 0.940
HOOD_FRONT_Y = 2.300
COWL_Z = 0.915
BELTLINE_Z = 0.920
ROOF_FRONT_Y = 0.260
ROOF_REAR_Y = -0.780
ROOF_CROWN_Z = 1.435
BACKLITE_BOTTOM_Y = -1.660
TRUNK_REAR_LIP_Y = -2.380
TRUNK_LIP_Z = 1.015

def safe_reset_scene():
    """Safely reset scene without breaking Blender MCP socket."""
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for col in list(bpy.data.collections):
        if col.name != "Scene Collection":
            bpy.data.collections.remove(col)
            
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1.0
    
    master_col = bpy.context.scene.collection
    for col_name in COLLECTIONS:
        if col_name not in bpy.data.collections:
            col = bpy.data.collections.new(col_name)
            master_col.children.link(col)
            
    print("[SEDAN_BUILDER] Scene initialized with 11 production collections.")

def get_collection(col_name):
    if col_name in bpy.data.collections:
        return bpy.data.collections[col_name]
    col = bpy.data.collections.new(col_name)
    bpy.context.scene.collection.children.link(col)
    return col

def link_to_collection(obj, col_name):
    target_col = get_collection(col_name)
    for col in list(obj.users_collection):
        col.unlink(obj)
    target_col.objects.link(obj)

def apply_finishing(obj, bevel=0.003, subsurf=0, weighted_normals=True):
    """Apply high-end smoothing, precision bevel, and weighted normals."""
    for p in obj.data.polygons:
        p.use_smooth = True
    if bevel > 0:
        b = obj.modifiers.new(name="Bevel", type='BEVEL')
        b.width = bevel
        b.segments = 2
        b.limit_method = 'ANGLE'
        b.angle_limit = math.radians(35)
    if subsurf > 0:
        s = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        s.levels = subsurf
        s.render_levels = subsurf
    if weighted_normals:
        w = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        w.keep_sharp = True
        w.weight = 50
    return obj

def link_and_finish(name, col_name, bm, mat=None, bevel=0.003, subsurf=0):
    """Link BMesh to single object in collection and apply shaders and modifiers."""
    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    link_to_collection(obj, col_name)
    if mat:
        if isinstance(mat, list):
            for m in mat:
                obj.data.materials.append(m)
        else:
            obj.data.materials.append(mat)
    apply_finishing(obj, bevel=bevel, subsurf=subsurf)
    return obj

def link_mirrored(name, col_name, bm_half, mat=None, bevel=0.003, subsurf=0):
    """Create mirrored left/right object from half BMesh."""
    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm_half.to_mesh(mesh)
    bm_half.free()
    obj = bpy.data.objects.new(name, mesh)
    link_to_collection(obj, col_name)
    
    m = obj.modifiers.new(name="Mirror", type='MIRROR')
    m.use_axis[0] = True
    m.use_clip = True
    m.merge_threshold = 0.002
    
    if mat:
        if isinstance(mat, list):
            for m in mat:
                obj.data.materials.append(m)
        else:
            obj.data.materials.append(mat)
    apply_finishing(obj, bevel=bevel, subsurf=subsurf)
    return obj

def link_sided(name_l, name_r, col_name, bm_half, mat=None, bevel=0.003, subsurf=0):
    """Create distinct Left and Right objects from a half BMesh."""
    mesh_l = bpy.data.meshes.new(f"Mesh_{name_l}")
    bm_half.to_mesh(mesh_l)
    obj_l = bpy.data.objects.new(name_l, mesh_l)
    link_to_collection(obj_l, col_name)
    if mat:
        if isinstance(mat, list):
            for m in mat: obj_l.data.materials.append(m)
        else:
            obj_l.data.materials.append(mat)
    apply_finishing(obj_l, bevel=bevel, subsurf=subsurf)

    bm_r = bm_half.copy()
    for v in bm_r.verts:
        v.co.x = -v.co.x
    bmesh.ops.reverse_faces(bm_r, faces=bm_r.faces)
    mesh_r = bpy.data.meshes.new(f"Mesh_{name_r}")
    bm_r.to_mesh(mesh_r)
    bm_r.free()
    obj_r = bpy.data.objects.new(name_r, mesh_r)
    link_to_collection(obj_r, col_name)
    if mat:
        if isinstance(mat, list):
            for m in mat: obj_r.data.materials.append(m)
        else:
            obj_r.data.materials.append(mat)
    apply_finishing(obj_r, bevel=bevel, subsurf=subsurf)

    return obj_l, obj_r

def make_quad_patch(bm, rows):
    """Generate clean quad loft patch from a 2D grid of Vector vertices."""
    verts_grid = []
    for r in rows:
        row_verts = [bm.verts.new(pt) for pt in r]
        verts_grid.append(row_verts)
    for i in range(len(rows) - 1):
        for j in range(len(rows[i]) - 1):
            v0 = verts_grid[i][j]
            v1 = verts_grid[i][j+1]
            v2 = verts_grid[i+1][j+1]
            v3 = verts_grid[i+1][j]
            bm.faces.new((v0, v1, v2, v3))

def make_tube(bm, p1, p2, radius=0.022, segments=16):
    """Create a high-resolution cylindrical pipe segment between two 3D points."""
    vec = p2 - p1
    length = vec.length
    if length < 1e-4: return
    center = (p1 + p2) * 0.5
    rot = Vector((0, 0, 1)).rotation_difference(vec).to_matrix().to_4x4()
    rc = bmesh.ops.create_cone(bm, cap_ends=True, radius1=radius, radius2=radius, depth=length, segments=segments)
    bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=rot, verts=rc['verts'])
    bmesh.ops.translate(bm, vec=center, verts=rc['verts'])
