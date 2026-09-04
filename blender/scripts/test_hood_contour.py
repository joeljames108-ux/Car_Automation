import bpy
import bmesh
import math
from mathutils import Vector, Matrix

# Test creating an authentic contoured GT3 hood mesh with center spine and extractor recesses
bm = bmesh.new()

# Grid parameters for hood surface: 9 points across (X), 11 points along length (Y)
nx = 9
ny = 11

# Dimensions
wb = 2.70
rh = 0.10
hood_len = 1.25 # from Y=0.38 to 1.63
hood_w_rear = 1.16
hood_w_front = 0.98

verts_grid = []
for j in range(ny):
    v = j / (ny - 1) # 0 (rear cowl) to 1 (front nose)
    y = 0.38 + v * hood_len
    # Width tapers from rear to front
    w = (hood_w_rear * (1.0 - v) + hood_w_front * v) * 0.5
    # Height slopes down towards the front
    base_z = 0.60 - 0.16 * (v ** 1.3) # Rakes from 0.60m down to 0.44m
    
    row = []
    for i in range(nx):
        u = (i / (nx - 1)) * 2.0 - 1.0 # -1.0 (left) to +1.0 (right)
        x = u * w
        
        # Powerdome center spine and extractor channel contours
        abs_u = abs(u)
        z_offset = 0.0
        
        # Center aerodynamic spine (crease along X=0)
        spine = max(0.0, 1.0 - (abs_u / 0.22)) * 0.024
        
        # Recessed extractor vent trough on both sides between u=0.3 and u=0.75
        trough = 0.0
        if 0.25 < abs_u < 0.80 and 0.20 < v < 0.85:
            # Depth up to 28mm
            channel_u = math.sin((abs_u - 0.25) / 0.55 * math.pi)
            channel_v = math.sin((v - 0.20) / 0.65 * math.pi)
            trough = -0.028 * channel_u * channel_v
            
        # Outer crown curvature (slight roll off to fender seam)
        crown = -0.015 * (u ** 2)
        
        z = base_z + spine + trough + crown
        
        # In Bonnet_Hinge_Pivot local coordinates (Pivot is at Y=0.378, Z=0.60)
        local_pos = Vector((x, y - 0.378, z - 0.60))
        vert = bm.verts.new(local_pos)
        row.append(vert)
    verts_grid.append(row)

# Create quads
for j in range(ny - 1):
    for i in range(nx - 1):
        v1 = verts_grid[j][i]
        v2 = verts_grid[j][i+1]
        v3 = verts_grid[j+1][i+1]
        v4 = verts_grid[j+1][i]
        bm.faces.new((v1, v2, v3, v4))

bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

print(f"Generated GT3 Hood: {len(bm.verts)} vertices, {len(bm.faces)} quads")
bm.free()
