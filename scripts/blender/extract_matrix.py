import re
import json

with open("src/sim/bodyArchitectureMatrix/matrix.ts", "r", encoding="utf-8") as f:
    text = f.read()

pattern = re.compile(r'architecture:\s*"([^"]+)",\s*era:\s*"([^"]+)",\s*referenceVehicle:\s*"([^"]+)"')
matches = pattern.findall(text)

res = {}
for arch, era, ref in matches:
    if arch not in res:
        res[arch] = {}
    res[arch][era] = ref

print(f"Total architectures found: {len(res)}")
with open("matrix_reference_inventory.json", "w", encoding="utf-8") as out:
    json.dump(res, out, indent=2)

for arch, eras in res.items():
    print(f"\n=== {arch.upper()} ({len(eras)} eras) ===")
    for era, ref in eras.items():
        print(f"  {era}: {ref}")
