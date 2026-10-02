"""
Utility to inspect any Campus GLB model in detail.
Usage:
  blender --background --python scripts/blender/campus/utils/inspect_campus_glb.py -- <path_to_glb>
"""
import sys
import os
import bpy

def inspect_glb(glb_path: str):
    if not os.path.exists(glb_path):
        print(f"[ERROR] File not found: {glb_path}")
        return

    # Clean scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for block in bpy.data.meshes: bpy.data.meshes.remove(block)
    for block in bpy.data.materials: bpy.data.materials.remove(block)

    # Import
    bpy.ops.import_scene.gltf(filepath=glb_path)

    file_size_bytes = os.path.getsize(glb_path)
    mesh_objects = [o for o in bpy.data.objects if o.type == 'MESH']
    
    total_verts = sum(len(o.data.vertices) for o in mesh_objects)
    total_faces = sum(len(o.data.polygons) for o in mesh_objects)
    total_tris = 0
    for o in mesh_objects:
        for p in o.data.polygons:
            if len(p.vertices) == 3:
                total_tris += 1
            elif len(p.vertices) == 4:
                total_tris += 2
            else:
                total_tris += len(p.vertices) - 2

    # Calculate bounding box
    min_x = min_y = min_z = float('inf')
    max_x = max_y = max_z = float('-inf')

    for o in mesh_objects:
        for v in o.bound_box:
            world_v = o.matrix_world @ bpy.path.mathutils.Vector(v) if hasattr(bpy.path, 'mathutils') else o.matrix_world @ __import__('mathutils').Vector(v)
            min_x = min(min_x, world_v.x)
            min_y = min(min_y, world_v.y)
            min_z = min(min_z, world_v.z)
            max_x = max(max_x, world_v.x)
            max_y = max(max_y, world_v.y)
            max_z = max(max_z, world_v.z)

    width = max_x - min_x if max_x > min_x else 0
    depth = max_y - min_y if max_y > min_y else 0
    height = max_z - min_z if max_z > min_z else 0

    materials = [m.name for m in bpy.data.materials]
    roots = [o.name for o in bpy.data.objects if o.parent is None and o.type != 'LIGHT' and o.type != 'CAMERA']

    print("\n" + "=" * 65)
    print(f" CAMPUS GLB ASSET AUDIT REPORT")
    print(f" File: {os.path.basename(glb_path)}")
    print("=" * 65)
    print(f" File Size:          {file_size_bytes:,} bytes ({file_size_bytes / 1024:.1f} KB)")
    print(f" Root Nodes:         {roots}")
    print(f" Mesh Object Count:  {len(mesh_objects)}")
    print(f" Total Vertices:     {total_verts:,}")
    print(f" Total Polygons:     {total_faces:,}")
    print(f" Total Triangles:    {total_tris:,}")
    print(f" Materials Count:    {len(materials)} -> {materials}")
    print(f" Bounding Box (m):   Width (X) = {width:.2f}m, Depth (Y) = {depth:.2f}m, Height (Z) = {height:.2f}m")
    print(f" Z Range (m):        Min Z = {min_z:.3f}m, Max Z = {max_z:.3f}m (Ground touch = {abs(min_z) < 0.05})")

    # Sample top 10 object names
    print(f"\n Sample Object Names (first 10):")
    for o in mesh_objects[:10]:
        poly_count = len(o.data.polygons)
        mats = [m.name for m in o.data.materials if m]
        print(f"  - {o.name:32} | {poly_count:4} polys | Mats: {mats}")

    # Check for generic names
    generic_names = [o.name for o in bpy.data.objects if o.name.lower().startswith(('cube', 'plane', 'cylinder', 'sphere', 'mesh'))]
    if generic_names:
        print(f"\n [WARNING] Generic Object Names Found ({len(generic_names)}): {generic_names[:5]}")
    else:
        print(f"\n [PASS] No generic object names detected (all deterministic).")

    print("=" * 65 + "\n")

if __name__ == "__main__":
    target_glb = "public/models/campus/hq_01_corporate_l1.glb"
    for arg in sys.argv:
        if arg.endswith(".glb"):
            target_glb = arg
            break
    inspect_glb(target_glb)
