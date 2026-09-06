import bpy
import bmesh
import os
from mathutils import Vector

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SOURCE_FBX = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "source", "FINAL_MODEL", "FINAL_MODEL.fbx")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=SOURCE_FBX)

obj = bpy.data.objects.get("Interior")
if obj:
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    
    # In FBX coordinates before rotation/scale:
    # Let's find vertices with normal pointing roughly towards driver / cabin
    print(f"Total faces in Interior: {len(bm.faces)}")
    
    # Let's check bounding box of Interior
    bb = [Vector(c) for c in obj.bound_box]
    print(f"X: {min(c.x for c in bb):.3f} to {max(c.x for c in bb):.3f}")
    print(f"Y: {min(c.y for c in bb):.3f} to {max(c.y for c in bb):.3f}")
    print(f"Z: {min(c.z for c in bb):.3f} to {max(c.z for c in bb):.3f}")
    
    bm.free()
