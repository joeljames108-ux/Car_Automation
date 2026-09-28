import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

vdir = "public/models/vehicles"
eras = ["1970s", "1980s", "1990s", "2000s", "2010s", "2020s", "future"]
all_archs = sorted(os.listdir(vdir)) if os.path.exists(vdir) else []

print("=" * 90)
print("COMPREHENSIVE AUDIT OF ALL 24 VEHICLE ARCHITECTURES IN public/models/vehicles")
print("=" * 90)
print(f"{'Architecture':20s} | {'Status':8s} | Details (Sizes in KB)")
print("-" * 90)

summary = {}
for a in all_archs:
    ap = os.path.join(vdir, a)
    if not os.path.isdir(ap):
        continue
    details = []
    complete_count = 0
    for e in eras:
        fp = os.path.join(ap, e, "vehicle.glb")
        if os.path.exists(fp):
            sz = os.path.getsize(fp) / 1024
            # Inspect glTF header to detect genuine procedural models vs primitive stubs
            is_complete = False
            mesh_count = 0
            try:
                import struct, json
                with open(fp, 'rb') as f:
                    f.read(12)
                    chunk_len, _ = struct.unpack('<I4s', f.read(8))
                    j = json.loads(f.read(chunk_len).decode('utf-8'))
                    mesh_count = len(j.get('meshes', []))
                    node_count = len(j.get('nodes', []))
                    if mesh_count >= 25 or sz >= 55:
                        is_complete = True
            except Exception:
                is_complete = sz > 50

            if is_complete:
                complete_count += 1
                details.append(f"{e}:{sz:.0f}K")
            else:
                details.append(f"{e}:[STUB {sz:.0f}K]")
        else:
            details.append(f"{e}:[MISSING]")
    summary[a] = (complete_count, len(eras))
    status_icon = "COMPLETE" if complete_count == 7 else f"{complete_count}/7"
    print(f"{a:20s} | {status_icon:8s} | {', '.join(details)}")

completed_archs = [a for a, (c, t) in summary.items() if c == t]
partial_archs = [a for a, (c, t) in summary.items() if 0 < c < t]
stub_archs = [a for a, (c, t) in summary.items() if c == 0]

print("=" * 90)
print(f"1. FULLY COMPLETED ARCHITECTURES ({len(completed_archs)}/{len(all_archs)}):")
for a in completed_archs:
    print(f"   ✓ {a}")

print(f"\n2. PARTIALLY COMPLETED ARCHITECTURES ({len(partial_archs)}/{len(all_archs)}):")
for a in partial_archs:
    c, t = summary[a]
    print(f"   ⚠️ {a:20s}: {c}/{t} complete")

print(f"\n3. STUB/PLACEHOLDER ARCHITECTURES ({len(stub_archs)}/{len(all_archs)}):")
for a in stub_archs:
    print(f"   ❌ {a}")
print("=" * 90)
