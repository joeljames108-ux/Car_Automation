"""
Bus Common Utilities & Geometric Specifications (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler

COLLECTIONS = [
    "00_Bus_Body_Framework",
    "01_Bus_Body_Shell",
    "02_Bus_Roof_Pods_HVAC",
    "03_Bus_Glazing_Windows",
    "04_Bus_Lighting_Optics",
    "05_Bus_Doors_Access",
    "06_Bus_Chassis_Frame",
    "07_Bus_Powertrain_eAxle",
    "08_Bus_Suspension_AirBags",
    "09_Bus_Wheels_Dually_Brakes",
    "10_Bus_Interior_Cockpit",
    "11_Bus_Hardware_Mirrors"
]

# Coordinate Standards & Blueprint Reference Measurements (m)
# Strict ISO 8855: Y-Forward (+Y), Z-Up (+Z), X-Lateral (+X Driver LHD)
# Volvo 9700 H 13m (2006) High-Floor Tri-Axle Luxury Touring Coach Blueprint
WHEELBASE = 6.200         # 6200 mm (Steer axle to Drive axle)
TAG_AXLE_SPACING = 1.350  # 1350 mm (Drive axle to Trailing Tag axle)
OVERALL_LENGTH = 13.000   # 13000 mm (13m Coach format)
OVERALL_WIDTH = 2.550     # 2550 mm (standard European coach width)
OVERALL_HEIGHT = 3.750    # 3750 mm (Volvo 9700 H high-floor unladen roof with HVAC)
GROUND_CLEARANCE = 0.320  # 320 mm (High-floor coach datum)
FRONT_TRACK = 2.100       # 2100 mm
REAR_TRACK = 1.880        # 1880 mm (between centers of dual tire sets)
TAG_TRACK = 2.100         # 2100 mm (single wheel trailing axle)

FRONT_AXLE_Y = 4.050      # Front steer axle
REAR_AXLE_Y = -2.150      # Rear drive axle (dually)
TAG_AXLE_Y = -3.500       # Rear trailing tag/steer axle (single)
FRONT_BUMPER_Y = 6.500    # Front clip (+6.500m)
REAR_BUMPER_Y = -6.500    # Rear clip (-6.500m)

TIRE_RADIUS = 0.520       # 1040 mm outer diameter 295/80 R22.5
WHEEL_RADIUS = 0.285      # 22.5-inch commercial rim
FRONT_TIRE_WIDTH = 0.295  # 295/80 R22.5
REAR_DUAL_TIRE_WIDTH = 0.295
DUAL_SPACING = 0.340      # Center-to-center dual wheel spacing
HUB_Z = TIRE_RADIUS       # 0.520 m

FLOOR_Z = 1.250           # High-decker passenger floor level (1250 mm above ground)
BAGGAGE_BAY_BTM_Z = 0.420 # Lower luggage hold floor datum
BAGGAGE_BAY_TOP_Z = 1.450 # Luggage compartment door top shutline
BELTLINE_Z = 1.580        # Lower passenger window line
ROOF_BODY_Z = 3.520       # Body roof crown line
ROOF_HVAC_Z = 3.750       # Top of aerodynamic roof HVAC pod
WINDSHIELD_TOP_Z = 3.420  # Top of raked panoramic front windshield
DESTINATION_SIGN_Z = 3.280# Integrated route display center height

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
            
    print("[BUS_BUILDER] Scene initialized with 11 production collections.")

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

def apply_finishing(obj, bevel=0.005, subsurf=0, weighted_normals=True):
    """Apply high-end smoothing, precision bevel, and weighted normals."""
    if not obj or obj.type != 'MESH':
        return
    for p in obj.data.polygons:
        p.use_smooth = True
    if bevel > 0:
        b = obj.modifiers.new(name="Bevel", type='BEVEL')
        b.width = bevel
        b.segments = 2
        b.limit_method = 'ANGLE'
        b.angle_limit = math.radians(35)
    if weighted_normals:
        wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        wn.keep_sharp = True
        if hasattr(obj.data, "use_auto_smooth"):
            try:
                obj.data.use_auto_smooth = True
            except Exception:
                pass

def create_box(name, location, size, rotation=(0,0,0), col_name=None, mat=None, bevel=0.004):
    """Helper to create a box mesh with specified center location, size (dx, dy, dz), and optional rotation."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    
    # Scale from unit cube to (dx, dy, dz)
    for v in bm.verts:
        v.co.x *= size[0]
        v.co.y *= size[1]
        v.co.z *= size[2]
        
    bm.to_mesh(mesh)
    bm.free()
    
    obj.location = location
    obj.rotation_euler = rotation
    if col_name:
        link_to_collection(obj, col_name)
    else:
        bpy.context.scene.collection.objects.link(obj)
        
    if mat:
        obj.data.materials.append(mat)
    apply_finishing(obj, bevel=bevel)
    return obj

def create_cylinder(name, location, radius, depth, rotation=(0,0,0), vertices=32, col_name=None, mat=None, bevel=0.003):
    """Helper to create a cylinder along Z, rotated into place."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=vertices, radius1=radius, radius2=radius, depth=depth)
    bm.to_mesh(mesh)
    bm.free()
    
    obj.location = location
    obj.rotation_euler = rotation
    if col_name:
        link_to_collection(obj, col_name)
    else:
        bpy.context.scene.collection.objects.link(obj)
        
    if mat:
        obj.data.materials.append(mat)
    apply_finishing(obj, bevel=bevel)
    return obj

def create_tube(name, location, inner_radius, outer_radius, depth, rotation=(0,0,0), vertices=36, col_name=None, mat=None, bevel=0.003):
    """Creates a hollow cylindrical tube along Z, rotated into place. Ideal for tires and wheel barrels."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    
    bm = bmesh.new()
    half_d = depth / 2.0
    
    # Generate outer and inner rings at +half_d and -half_d
    outer_top = []
    outer_btm = []
    inner_top = []
    inner_btm = []
    
    for i in range(vertices):
        angle = 2.0 * math.pi * i / vertices
        cos_a = math.cos(angle)
        sin_a = math.sin(angle)
        
        outer_top.append(bm.verts.new(Vector((outer_radius * cos_a, outer_radius * sin_a, half_d))))
        outer_btm.append(bm.verts.new(Vector((outer_radius * cos_a, outer_radius * sin_a, -half_d))))
        inner_top.append(bm.verts.new(Vector((inner_radius * cos_a, inner_radius * sin_a, half_d))))
        inner_btm.append(bm.verts.new(Vector((inner_radius * cos_a, inner_radius * sin_a, -half_d))))
        
    bm.verts.ensure_lookup_table()
    
    # Create quad faces
    for i in range(vertices):
        next_i = (i + 1) % vertices
        # Outer surface
        bm.faces.new((outer_top[i], outer_top[next_i], outer_btm[next_i], outer_btm[i]))
        # Inner surface
        bm.faces.new((inner_btm[i], inner_btm[next_i], inner_top[next_i], inner_top[i]))
        # Top rim cap
        bm.faces.new((outer_top[i], inner_top[i], inner_top[next_i], outer_top[next_i]))
        # Bottom rim cap
        bm.faces.new((outer_btm[next_i], inner_btm[next_i], inner_btm[i], outer_btm[i]))
        
    bm.to_mesh(mesh)
    bm.free()
    
    obj.location = location
    obj.rotation_euler = rotation
    if col_name:
        link_to_collection(obj, col_name)
    else:
        bpy.context.scene.collection.objects.link(obj)
        
    if mat:
        obj.data.materials.append(mat)
    apply_finishing(obj, bevel=bevel)
    return obj

def create_toroid(name, location, major_r, minor_r, rotation=(0,0,0), major_segs=36, minor_segs=16, col_name=None, mat=None, bevel=0.0):
    """Creates a toroidal mesh along Z, rotated into place. Ideal for tire crowns & curved hoses."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    
    bm = bmesh.new()
    bmesh.ops.create_torus(bm, major_radius=major_r, minor_radius=minor_r, major_segments=major_segs, minor_segments=minor_segs)
    bm.to_mesh(mesh)
    bm.free()
    
    obj.location = location
    obj.rotation_euler = rotation
    if col_name:
        link_to_collection(obj, col_name)
    else:
        bpy.context.scene.collection.objects.link(obj)
        
    if mat:
        obj.data.materials.append(mat)
    apply_finishing(obj, bevel=bevel)
    return obj

