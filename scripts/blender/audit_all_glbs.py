"""
Scan and report all GLBs in public/models.
"""
import os
import glob

models_dir = os.path.abspath("public/models")
all_glbs = []
for root, dirs, files in os.walk(models_dir):
    for f in files:
        if f.lower().endswith(".glb"):
            full_p = os.path.join(root, f)
            rel_p = os.path.relpath(full_p, models_dir)
            sz_kb = os.path.getsize(full_p) / 1024.0
            all_glbs.append((rel_p, sz_kb, full_p))

print(f"Total GLB files found: {len(all_glbs)}")
all_glbs.sort(key=lambda x: x[1])

print("\n--- 10 Smallest GLBs ---")
for r, sz, _ in all_glbs[:10]:
    print(f"  {sz:6.1f} KB : {r}")

print("\n--- 10 Largest GLBs ---")
for r, sz, _ in all_glbs[-10:]:
    print(f"  {sz:6.1f} KB : {r}")

# Group by folder
folders = {}
for r, sz, _ in all_glbs:
    d = os.path.dirname(r)
    folders[d] = folders.get(d, 0) + 1

print("\n--- GLB Count by Directory ---")
for d, c in sorted(folders.items()):
    print(f"  {d}: {c} files")
