import bpy
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SOURCE_FBX = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "source", "FINAL_MODEL", "FINAL_MODEL.fbx")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=SOURCE_FBX)

obj = bpy.data.objects.get("Interior")
if obj:
    print("INTERIOR MATERIALS IN FBX:")
    for slot_idx, slot in enumerate(obj.material_slots):
        print(f"  Slot {slot_idx}: {slot.name}")
