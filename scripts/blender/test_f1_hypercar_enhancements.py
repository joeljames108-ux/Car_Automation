import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix

print("[TEST] Testing enhanced CAD generator helpers...")

# Test streamlined strut
bm = bmesh.new()
pt_a = Vector((-0.4, 1.8, 0.4))
pt_b = Vector((-0.7, 1.8, 0.35))
vec = pt_b - pt_a
length = vec.length
direction = vec.normalized()

# Up vector
up = Vector((0, 0, 1))
right = direction.cross(up).normalized()
up_perp = right.cross(direction).normalized()

chord = 0.045
thick = 0.014
steps = 12
pts_a = []
pts_b = []
for i in range(steps):
    theta = 2 * math.pi * i / steps
    # Elliptic streamlined cross section
    dx = math.cos(theta) * (chord / 2)
    dz = math.sin(theta) * (thick / 2)
    offset = right * dx + up_perp * dz
    pts_a.append(bm.verts.new(pt_a + offset))
    pts_b.append(bm.verts.new(pt_b + offset))

bm.verts.ensure_lookup_table()
for i in range(steps):
    i_next = (i + 1) % steps
    bm.faces.new([pts_a[i], pts_b[i], pts_b[i_next], pts_a[i_next]])

bm.faces.new(list(reversed(pts_a)))
bm.faces.new(pts_b)

mesh = bpy.data.meshes.new("Test_Strut")
bm.to_mesh(mesh)
bm.free()

print(f"[TEST] Streamlined strut created successfully with {len(mesh.polygons)} polygons.")
