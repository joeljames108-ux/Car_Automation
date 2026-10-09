import os, re, json, struct

with open('src/sim/vehicleArchitecture/vehicleArchitectureMatrix.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Match each architecture block
# Then match each era in it
arch_blocks = re.findall(r'(\w+):\s*\{([\s\S]*?)(?=\n  \w+:\s*\{|\n\};|\Z)', text)

def get_glb_stats(path):
    if not path:
        return None, 0, 0
    full_path = os.path.join('public', path.lstrip('/'))
    if not os.path.exists(full_path):
        return None, 0, 0
    size_mb = os.path.getsize(full_path) / (1024 * 1024)
    tris = 0
    try:
        with open(full_path, 'rb') as f:
            magic, ver, length = struct.unpack('<4sII', f.read(12))
            clen, ctype = struct.unpack('<II', f.read(8))
            gltf = json.loads(f.read(clen).decode('utf-8'))
            for n in gltf.get('nodes', []):
                if 'mesh' in n:
                    m = gltf['meshes'][n['mesh']]
                    for p in m['primitives']:
                        if 'indices' in p:
                            tris += gltf['accessors'][p['indices']]['count'] // 3
    except Exception as e:
        pass
    return full_path, size_mb, tris

total = 0
present = 0
for arch, block in arch_blocks:
    eras = re.findall(r'\"(1970s|1980s|1990s|2000s|2010s|2020s|future)\":\s*\{[\s\S]*?referenceVehicle:\s*\"([^\"]+)\"[\s\S]*?glbPath:\s*\"([^\"]+)\"', block)
    for era, ref, glb in eras:
        total += 1
        full_path, size_mb, tris = get_glb_stats(glb)
        if full_path:
            present += 1
            print(f"[{arch.upper():12}] [{era:6}] {ref:42} -> {glb} (OK: {size_mb:.2f} MB, {tris:,} tris)")
        else:
            print(f"[{arch.upper():12}] [{era:6}] {ref:42} -> {glb} (MISSING)")

print(f"\nTOTAL: {present} / {total} vehicles present in public/models/")
