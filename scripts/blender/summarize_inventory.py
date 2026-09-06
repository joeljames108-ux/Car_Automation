import json

with open(r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\assets\glb\master_asset_inventory.json", "r", encoding="utf-8") as f:
    inv = json.load(f)

print(f"Total GLB Assets: {len(inv)}")

cats = {}
priorities = {}
for item in inv:
    c = item["category"]
    cats[c] = cats.get(c, 0) + 1
    p = item["priority"]
    priorities[p] = priorities.get(p, 0) + 1

print("\n--- By Category ---")
for c, cnt in sorted(cats.items(), key=lambda x: -x[1]):
    print(f"  {c}: {cnt} files")

print("\n--- By Priority ---")
for p, cnt in sorted(priorities.items(), key=lambda x: -x[1]):
    print(f"  {p}: {cnt} files")
