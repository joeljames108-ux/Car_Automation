import sys
import os

scripts_dir = r"e:\Car_Automation\scripts\blender"
if scripts_dir not in sys.path:
    sys.path.append(scripts_dir)

import exterior_upgrade_pipeline as eup
import bpy

# 1. Clean scene and import existing 1970s supercar
glb_path = r"e:\Car_Automation\public\models\vehicles\supercar\1970s\vehicle.glb"
print(f"[ROUNDTRIP] Importing {glb_path}...")
eup.import_vehicle_glb(glb_path)

# 2. Get stats and vehicle bounds
center, dims, dist = eup.get_vehicle_bounds()
stats = eup.get_geometry_stats()
print(f"[ROUNDTRIP] Vehicle bounds: center={center}, dims={dims}, dist={dist:.2f}")
print(f"[ROUNDTRIP] Scene stats: {stats}")

# 3. Orient viewport to front 3/4
eup.set_viewport_view('front_three_quarter')
print("[ROUNDTRIP] Set viewport to front_three_quarter")

# 4. Export test roundtrip
test_out = r"e:\Car_Automation\scripts\output\test_pipeline_roundtrip.glb"
size_mb = eup.export_vehicle_glb(test_out, bake_modifiers=False)
print(f"[ROUNDTRIP] Successfully exported roundtrip GLB: {size_mb:.2f} MB")
