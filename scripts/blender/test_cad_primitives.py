import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler

bpy.ops.wm.read_factory_settings(use_empty=True)

def make_knurled_cylinder(name, location, radius, depth, rot_euler, mat=None, ridges=24, ridge_depth_ratio=0.08):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    n_pts = ridges * 2
    half_d = depth / 2.0
    verts_bottom = []
    verts_top = []
    for i in range(n_pts):
        angle = (2.0 * math.pi * i) / n_pts
        r = radius if (i % 2 == 0) else radius * (1.0 - ridge_depth_ratio)
        x = r * math.cos(angle)
        y = r * math.sin(angle)
        verts_bottom.append(bm.verts.new((x, y, -half_d)))
        verts_top.append(bm.verts.new((x, y, half_d)))
    bm.verts.ensure_lookup_table()
    for i in range(n_pts):
        next_i = (i + 1) % n_pts
        bm.faces.new([verts_bottom[i], verts_bottom[next_i], verts_top[next_i], verts_top[i]])
    bm.faces.new(verts_bottom[::-1])
    bm.faces.new(verts_top)
    for f in bm.faces:
        f.smooth = True
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = rot_euler
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_spring_coil(name, location, radius, pitch, turns, wire_r, rot_euler, mat=None, segments_per_turn=16, wire_segments=8):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    total_steps = int(turns * segments_per_turn)
    rings = []
    half_len = (total_steps * (pitch / segments_per_turn)) / 2.0
    
    for s in range(total_steps + 1):
        theta = s * (2.0 * math.pi / segments_per_turn)
        cz = s * (pitch / segments_per_turn) - half_len
        cx = radius * math.cos(theta)
        cy = radius * math.sin(theta)
        center = Vector((cx, cy, cz))
        
        # Tangent vector along helix
        tx = -radius * math.sin(theta)
        ty = radius * math.cos(theta)
        tz = pitch / (2.0 * math.pi)
        tangent = Vector((tx, ty, tz)).normalized()
        
        # Radial vector from center axis
        radial = Vector((math.cos(theta), math.sin(theta), 0.0)).normalized()
        binormal = tangent.cross(radial).normalized()
        
        # Create ring verts
        ring_verts = []
        for w in range(wire_segments):
            phi = w * (2.0 * math.pi / wire_segments)
            offset = (radial * math.cos(phi) + binormal * math.sin(phi)) * wire_r
            vert = bm.verts.new(center + offset)
            ring_verts.append(vert)
        rings.append(ring_verts)
        
    bm.verts.ensure_lookup_table()
    for s in range(total_steps):
        r0 = rings[s]
        r1 = rings[s + 1]
        for w in range(wire_segments):
            w_next = (w + 1) % wire_segments
            bm.faces.new([r0[w], r1[w], r1[w_next], r0[w_next]])
            
    # Cap ends
    bm.faces.new(rings[0][::-1])
    bm.faces.new(rings[-1])
    
    for f in bm.faces:
        f.smooth = True
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = rot_euler
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_hex_bolt(name, location, radius, depth, rot_euler, mat=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=radius, depth=depth, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

def make_pill_cylinder(name, location, radius, length, rot_euler, mat=None, vertices=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=length, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if length > radius * 2.2:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = radius * 0.95
        bev.segments = 4
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(40)
        bpy.ops.object.modifier_apply(modifier="Bevel")
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    return obj

knurl = make_knurled_cylinder("Test_Knurl", (0, 0, 0), 0.03, 0.015, (0, 0, 0), None, ridges=24)
spring = make_spring_coil("Test_Spring", (0.1, 0, 0), 0.015, 0.008, 5, 0.002, (0, 0, 0), None)
bolt = make_hex_bolt("Test_Bolt", (0.2, 0, 0), 0.006, 0.004, (0, 0, 0), None)
pill = make_pill_cylinder("Test_Pill", (0.3, 0, 0), 0.008, 0.03, (0, 0, 0), None)

print(f"Created: {knurl.name} ({len(knurl.data.polygons)} polys)")
print(f"Created: {spring.name} ({len(spring.data.polygons)} polys)")
print(f"Created: {bolt.name} ({len(bolt.data.polygons)} polys)")
print(f"Created: {pill.name} ({len(pill.data.polygons)} polys)")
print("ALL PRIMITIVES PASSED SUCCESSFULLY!")
