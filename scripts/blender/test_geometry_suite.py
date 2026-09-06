import bpy
import bmesh
import math
from mathutils import Vector, Matrix

print("[TEST] Testing advanced geometry suite...")

def make_streamlined_strut(bm, pt_a, pt_b, chord, thickness, steps=12):
    vec = pt_b - pt_a
    direction = vec.normalized()
    up = Vector((0, 0, 1))
    if abs(direction.dot(up)) > 0.98:
        up = Vector((0, 1, 0))
    right = direction.cross(up).normalized()
    up_perp = right.cross(direction).normalized()

    pts_a = []
    pts_b = []
    for i in range(steps):
        theta = 2 * math.pi * i / steps
        dx = math.cos(theta) * (chord / 2)
        dz = math.sin(theta) * (thickness / 2)
        offset = right * dx + up_perp * dz
        pts_a.append(bm.verts.new(pt_a + offset))
        pts_b.append(bm.verts.new(pt_b + offset))

    bm.verts.ensure_lookup_table()
    for i in range(steps):
        i_next = (i + 1) % steps
        bm.faces.new([pts_a[i], pts_b[i], pts_b[i_next], pts_a[i_next]])
    bm.faces.new(list(reversed(pts_a)))
    bm.faces.new(pts_b)

bm = bmesh.new()
make_streamlined_strut(bm, Vector((0,0,0)), Vector((0.5, 0.2, 0.1)), 0.04, 0.015)
mesh = bpy.data.meshes.new("Test_Strut")
bm.to_mesh(mesh)
bm.free()

print(f"[TEST] Streamlined strut success: {len(mesh.polygons)} faces.")

# Test teardrop canopy mesh
bm = bmesh.new()
# Construct a multi-ring lofted teardrop canopy
rings = [
    # (y, z, width, height)
    (0.65, 0.70, 0.40, 0.08),  # Base of windshield at cowl
    (0.35, 0.86, 0.82, 0.24),  # A-pillar crest
    (0.00, 0.96, 0.90, 0.26),  # Roof peak / double bubble
    (-0.40, 0.88, 0.78, 0.22), # Rear glass start
    (-0.85, 0.72, 0.50, 0.12), # Engine deck taper tip
]
ring_verts = []
n_pts = 16
for y, z, w, h in rings:
    ring = []
    for i in range(n_pts):
        theta = 2 * math.pi * i / n_pts
        # Only upper dome from theta 0 to pi, flat bottom from pi to 2pi
        x = math.cos(theta) * (w / 2)
        dz = math.sin(theta) * (h / 2) if math.sin(theta) >= 0 else math.sin(theta) * (h * 0.15)
        ring.append(bm.verts.new(Vector((x, y, z + dz))))
    ring_verts.append(ring)

bm.verts.ensure_lookup_table()
for r in range(len(rings) - 1):
    r1 = ring_verts[r]
    r2 = ring_verts[r + 1]
    for i in range(n_pts):
        i_next = (i + 1) % n_pts
        bm.faces.new([r1[i], r2[i], r2[i_next], r1[i_next]])

# End caps
bm.faces.new(list(reversed(ring_verts[0])))
bm.faces.new(ring_verts[-1])

mesh_canopy = bpy.data.meshes.new("Test_Canopy")
bm.to_mesh(mesh_canopy)
bm.free()
print(f"[TEST] Teardrop canopy success: {len(mesh_canopy.polygons)} faces.")

# Test flying buttress
bm_fb = bmesh.new()
p0 = Vector((-0.42, -0.15, 0.92))
p1 = Vector((-0.55, -0.45, 0.85))
p2 = Vector((-0.72, -0.85, 0.65))
make_streamlined_strut(bm_fb, p0, p1, 0.08, 0.02)
make_streamlined_strut(bm_fb, p1, p2, 0.08, 0.02)
mesh_fb = bpy.data.meshes.new("Test_Buttress")
bm_fb.to_mesh(mesh_fb)
bm_fb.free()
print(f"[TEST] Flying buttress success: {len(mesh_fb.polygons)} faces.")

print("[TEST] ALL GEOMETRY SUITE TESTS PASSED!")
