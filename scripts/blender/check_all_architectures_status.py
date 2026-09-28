import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

vdir = "public/models/vehicles"
archs_in_screenshot = [
    "grand_tourer",
    "heavy_truck",
    "muscle_car",
    "offroad_4x4",
    "wagon",
    "shooting_brake",
    "pickup"
]

print("=" * 80)
print("AUDITING ARCHITECTURES HIGHLIGHTED IN USER SCREENSHOT")
print("=" * 80)

for arch in archs_in_screenshot:
    ap = os.path.join(vdir, arch)
    if not os.path.exists(ap):
        print(f"\n[{arch.upper()}] Directory NOT found: {ap}")
        continue
    
    files_found = []
    for root, dirs, files in os.walk(ap):
        for f in files:
            if f.endswith(".glb"):
                fp = os.path.join(root, f)
                sz = os.path.getsize(fp) / 1024
                rel = os.path.relpath(fp, ap)
                files_found.append((rel, sz))
    
    print(f"\n[{arch.upper()}] Found {len(files_found)} GLB files:")
    for rel, sz in sorted(files_found):
        status = "FULL CLASS-A" if sz > 100 else ("MEDIUM" if sz > 50 else "STUB/PLACEHOLDER")
        print(f"  - {rel}: {sz:.1f} KB -> [{status}]")

print("\n" + "=" * 80)
print("ALL DIRECTORIES UNDER public/models/vehicles:")
print("=" * 80)
if os.path.exists(vdir):
    for d in sorted(os.listdir(vdir)):
        dp = os.path.join(vdir, d)
        if os.path.isdir(dp):
            cnt = sum(1 for root, dirs, files in os.walk(dp) for f in files if f.endswith(".glb"))
            print(f"  {d:20s}: {cnt} GLB files")
