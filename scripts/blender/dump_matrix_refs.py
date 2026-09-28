import re

with open('src/sim/vehicleArchitecture/vehicleArchitectureMatrix.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Match era blocks
pattern = r'[\"|\']?(\w+)[\"|\']?:\s*\{\s*architectureId:\s*\"([^\"]+)\",\s*eraId:\s*\"([^\"]+)\",\s*referenceVehicle:\s*\"([^\"]+)\"'
matches = re.findall(pattern, content)

arch_map = {}
for era_key, arch_id, era_id, ref_name in matches:
    if arch_id not in arch_map:
        arch_map[arch_id] = {}
    arch_map[arch_id][era_id] = ref_name

for arch, eras in sorted(arch_map.items()):
    print(f"=== {arch.upper()} ===")
    for e in ["1970s", "1980s", "1990s", "2000s", "2010s", "2020s", "future"]:
        if e in eras:
            print(f"  {e:8s}: {eras[e]}")
        else:
            print(f"  {e:8s}: [MISSING]")
