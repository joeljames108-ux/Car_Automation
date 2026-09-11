"""
Hilux Common Utilities & Geometry Helpers (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler

COLLECTIONS = [
    "01_Chassis_Frame",
    "02_Cab_Body",
    "03_Cargo_Bed",
    "04_Front_Fascia_Lighting",
    "05_Rear_Fascia_Lighting",
    "06_Exterior_Hardware",
    "07_Greenhouse_Glazing",
    "08_Suspension_Brakes",
    "09_Wheels_Tires",
    "10_Powertrain_Interior",
]

# Coordinate Standards & Blueprint Reference Measurements (m)
WHEELBASE = 3.085
OVERALL_LENGTH = 5.325
OVERALL_WIDTH = 1.855
OVERALL_HEIGHT = 1.815
GROUND_CLEARANCE = 0.287
FRONT_TRACK = 1.540
REAR_TRACK = 1.550
FRONT_OVERHANG = 0.985
REAR_OVERHANG = 1.255

FRONT_AXLE_Y = 1.5425
REAR_AXLE_Y = -1.5425
FRONT_BUMPER_Y = FRONT_AXLE_Y + FRONT_OVERHANG   # +2.5275
REAR_BUMPER_Y = REAR_AXLE_Y - REAR_OVERHANG     # -2.7975

TIRE_RADIUS = 0.388
WHEEL_RADIUS = 0.229  # 18-inch (457.2mm diam / 2 = 228.6mm)
TIRE_WIDTH = 0.265    # 265mm
HUB_Z = TIRE_RADIUS   # 0.388m from ground (Z=0)

CAB_REAR_Y = -0.18
BED_FRONT_Y = -0.15
BED_REAR_Y = -1.72
HOOD_REAR_Y = 0.95
HOOD_FRONT_Y = 2.22

def safe_reset_scene():
    """Safely clear scene objects without closing Blender or dropping MCP socket."""
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for col in list(bpy.data.collections):
        if col.name not in ["Scene Collection"]:
            bpy.data.collections.remove(col)
            
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1.0
    
    # Create the 10 standard collections
    master_col = bpy.context.scene.collection
    for col_name in COLLECTIONS:
        if col_name not in bpy.data.collections:
            col = bpy.data.collections.new(col_name)
            master_col.children.link(col)
            
    print("[HILUX] Scene initialized with 10 standard collections.")

def get_collection(col_name):
    """Retrieve or create a collection."""
    if col_name in bpy.data.collections:
        return bpy.data.collections[col_name]
    col = bpy.data.collections.new(col_name)
    bpy.context.scene.collection.children.link(col)
    return col

def link_to_collection(obj, col_name):
    """Link an object to a specific collection and unlink from other collections."""
    target_col = get_collection(col_name)
    for col in list(obj.users_collection):
        col.unlink(obj)
    target_col.objects.link(obj)

def create_bmesh_object(name, col_name, bm, matrix=None):
    """Convert a BMesh into a Blender mesh object, apply matrix, and place in collection."""
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    if matrix is not None:
        obj.matrix_world = matrix
    link_to_collection(obj, col_name)
    
    for poly in mesh.polygons:
        poly.use_smooth = True
        
    return obj

def assign_material(obj, mat):
    """Assign or replace primary material on object."""
    if not obj or not mat:
        return
    if len(obj.data.materials) == 0:
        obj.data.materials.append(mat)
    else:
        obj.data.materials[0] = mat

def apply_bevel_and_weighted_normals(obj, width=0.003, segments=2, angle_deg=35.0):
    """Add non-destructive Bevel and Weighted Normal modifiers for Class-A CAD reflections."""
    if not obj or obj.type != 'MESH':
        return
    
    mod_bev = obj.modifiers.get("CAD_Bevel")
    if not mod_bev:
        mod_bev = obj.modifiers.new("CAD_Bevel", 'BEVEL')
        mod_bev.width = width
        mod_bev.segments = segments
        mod_bev.limit_method = 'ANGLE'
        mod_bev.angle_limit = math.radians(angle_deg)
        mod_bev.harden_normals = True
        
    mod_wn = obj.modifiers.get("CAD_WeightedNormal")
    if not mod_wn:
        mod_wn = obj.modifiers.new("CAD_WeightedNormal", 'WEIGHTED_NORMAL')
        mod_wn.keep_sharp = True

def weld_coincident_vertices(obj, distance=0.0005):
    """Remove doubles / weld coincident vertices in place."""
    if not obj or obj.type != 'MESH':
        return
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=distance)
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()

def set_smooth_by_angle(obj, angle_deg=35.0):
    """Set smooth shading with auto-smooth angle compatibility across Blender 4.x / 5.x."""
    if not obj or obj.type != 'MESH':
        return
    for poly in obj.data.polygons:
        poly.use_smooth = True
    if hasattr(obj.data, "auto_smooth_angle"):
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = math.radians(angle_deg)

def mat_trans(x, y, z):
    return Matrix.Translation(Vector((x, y, z)))

def mat_rot_x(angle_deg):
    return Euler((math.radians(angle_deg), 0, 0), 'XYZ').to_matrix().to_4x4()

def mat_rot_y(angle_deg):
    return Euler((0, math.radians(angle_deg), 0), 'XYZ').to_matrix().to_4x4()

def mat_rot_z(angle_deg):
    return Euler((0, 0, math.radians(angle_deg)), 'XYZ').to_matrix().to_4x4()

def mat_scale(sx, sy, sz):
    mat = Matrix.Identity(4)
    mat[0][0] = sx
    mat[1][1] = sy
    mat[2][2] = sz
    return mat

# --- Robust BMesh Primitive Helpers ---

def bmesh_create_cylinder(bm, radius, depth, segments=16, matrix=Matrix.Identity(4), cap_ends=True):
    """Create cylinder using bmesh.ops.create_cone."""
    return bmesh.ops.create_cone(
        bm,
        cap_ends=cap_ends,
        cap_tris=False,
        segments=segments,
        radius1=radius,
        radius2=radius,
        depth=depth,
        matrix=matrix
    )

def bmesh_create_cone(bm, radius1, radius2, depth, segments=16, matrix=Matrix.Identity(4), cap_ends=True):
    """Create truncated cone."""
    return bmesh.ops.create_cone(
        bm,
        cap_ends=cap_ends,
        cap_tris=False,
        segments=segments,
        radius1=radius1,
        radius2=radius2,
        depth=depth,
        matrix=matrix
    )

def bmesh_create_cube(bm, size=1.0, matrix=Matrix.Identity(4)):
    """Create cube with given size and matrix."""
    return bmesh.ops.create_cube(bm, size=size, matrix=matrix)

def bmesh_create_sphere(bm, radius=1.0, segments=16, ring_count=8, matrix=Matrix.Identity(4)):
    """Create UV sphere."""
    return bmesh.ops.create_uvsphere(bm, u_segments=segments, v_segments=ring_count, radius=radius, matrix=matrix)

def bmesh_create_torus(bm, major_radius=0.1, minor_radius=0.03, major_segments=16, minor_segments=8, matrix=Matrix.Identity(4)):
    """Generate a clean parametric torus in BMesh."""
    verts = []
    for i in range(major_segments):
        u = 2.0 * math.pi * i / major_segments
        cos_u = math.cos(u)
        sin_u = math.sin(u)
        ring_verts = []
        for j in range(minor_segments):
            v = 2.0 * math.pi * j / minor_segments
            cos_v = math.cos(v)
            sin_v = math.sin(v)
            x = (major_radius + minor_radius * cos_v) * cos_u
            y = (major_radius + minor_radius * cos_v) * sin_u
            z = minor_radius * sin_v
            ring_verts.append(bm.verts.new(matrix @ Vector((x, y, z))))
        verts.append(ring_verts)
        
    for i in range(major_segments):
        next_i = (i + 1) % major_segments
        for j in range(minor_segments):
            next_j = (j + 1) % minor_segments
            v1 = verts[i][j]
            v2 = verts[next_i][j]
            v3 = verts[next_i][next_j]
            v4 = verts[i][next_j]
            bm.faces.new((v1, v2, v3, v4))

def create_box(center, size):
    """Create a BMesh box centered at 'center' with dimensions 'size' (Vector)."""
    bm = bmesh.new()
    cx, cy, cz = center
    sx, sy, sz = size[0] / 2.0, size[1] / 2.0, size[2] / 2.0
    
    verts = [
        bm.verts.new((cx - sx, cy - sy, cz - sz)),
        bm.verts.new((cx + sx, cy - sy, cz - sz)),
        bm.verts.new((cx + sx, cy + sy, cz - sz)),
        bm.verts.new((cx - sx, cy + sy, cz - sz)),
        bm.verts.new((cx - sx, cy - sy, cz + sz)),
        bm.verts.new((cx + sx, cy - sy, cz + sz)),
        bm.verts.new((cx + sx, cy + sy, cz + sz)),
        bm.verts.new((cx - sx, cy + sy, cz + sz)),
    ]
    
    faces = [
        (0, 1, 2, 3), # Bottom
        (4, 7, 6, 5), # Top
        (0, 4, 5, 1), # Front
        (2, 6, 7, 3), # Rear
        (0, 3, 7, 4), # Left
        (1, 5, 6, 2), # Right
    ]
    for f in faces:
        bm.faces.new([verts[i] for i in f])
    
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm

def create_tube_between(p1, p2, radius, segments=12):
    """Create a BMesh cylindrical tube between two 3D vectors."""
    bm = bmesh.new()
    v1 = Vector(p1)
    v2 = Vector(p2)
    delta = v2 - v1
    length = delta.length
    if length < 1e-6:
        return bm
    
    up = Vector((0, 0, 1))
    direction = delta.normalized()
    rot_quat = up.rotation_difference(direction)
    center = (v1 + v2) / 2.0
    mat = Matrix.Translation(center) @ rot_quat.to_matrix().to_4x4()
    
    bmesh_create_cylinder(bm, radius=radius, depth=length, segments=segments, matrix=mat)
    return bm

def set_viewport_view(pitch_deg=70, roll_deg=0, yaw_deg=225, distance=6.0, location=(0.0, 0.0, 0.90)):
    """Programmatically orient the 3D viewport and enable MATERIAL shading mode."""
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    r3d = space.region_3d
                    r3d.view_perspective = 'PERSP'
                    r3d.view_distance = distance
                    r3d.view_location = Vector(location)
                    r3d.view_rotation = Euler((
                        math.radians(pitch_deg),
                        math.radians(roll_deg),
                        math.radians(yaw_deg)
                    )).to_quaternion()
                    space.overlay.show_overlays = False
                    space.shading.type = 'MATERIAL'
                    if hasattr(r3d, "update"):
                        r3d.update()
                    return

