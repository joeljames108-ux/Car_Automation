import json, struct, os

def inspect_glb(path):
    print("="*60)
    print("INSPECTING:", path)
    if not os.path.exists(path):
        print("Not found")
        return
    with open(path, 'rb') as f:
        magic, ver, length = struct.unpack('<4sII', f.read(12))
        clen, ctype = struct.unpack('<II', f.read(8))
        gltf = json.loads(f.read(clen).decode('utf-8'))
    
    total = 0
    for n in gltf.get('nodes', []):
        if 'mesh' in n:
            m = gltf['meshes'][n['mesh']]
            tc = sum(gltf['accessors'][p['indices']]['count']//3 for p in m['primitives'] if 'indices' in p)
            total += tc
            print(f"  {n.get('name', 'unnamed')}: {tc:,} tris")
    print(f"TOTAL: {total:,} tris, File size: {os.path.getsize(path)/(1024*1024):.2f} MB")

inspect_glb('public/models/Car_Ford_Focus_RS_Mk3_Complete.glb')
inspect_glb('public/models/vehicles/hatchback/2020s/vehicle.glb')
