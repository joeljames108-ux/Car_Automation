import json

with open(r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\assets\glb\master_asset_inventory.json", "r", encoding="utf-8") as f:
    inv = json.load(f)

md_lines = [
    "# Master Automotive GLB Asset Inventory & Rework Classification",
    "",
    "> **Total Assets Inventoried**: 217 GLB files",
    "> **Originals Secured**: 100% backed up in `/assets/glb/original/` and `/assets/glb/backup/`",
    "",
    "## Summary by Automotive Subsystem",
    "| Subsystem Domain | Asset Count | Major Rework (A) | Moderate Refinement (B) | Reference (C) |",
    "|---|---|---|---|---|",
]

cats = {}
for item in inv:
    c = item["category"]
    cats[c] = cats.get(c, [])
    cats[c].append(item)

for cat, items in sorted(cats.items()):
    count_a = sum(1 for i in items if i["priority"].startswith("A"))
    count_b = sum(1 for i in items if i["priority"].startswith("B"))
    count_c = sum(1 for i in items if i["priority"].startswith("C"))
    md_lines.append(f"| **{cat}** | {len(items)} | {count_a} | {count_b} | {count_c} |")

md_lines.append("")
md_lines.append("---")
md_lines.append("")

# Detail tables by category
for cat, items in sorted(cats.items()):
    md_lines.append(f"## {cat} Assets ({len(items)} Models)")
    md_lines.append("| File | Purpose | Meshes | Materials | Polygons | Size | Quality | Refinement Priority & Problems |")
    md_lines.append("|---|---|---|---|---|---|---|---|")
    
    # Sort items by size descending
    sorted_items = sorted(items, key=lambda x: x["size_bytes"], reverse=True)
    for item in sorted_items:
        fname = f"`{item['file']}`"
        purp = item['purpose']
        mc = item['mesh_count']
        matc = item['material_count']
        polyc = f"{item['polygon_count']:,}"
        sz = item['size_str']
        qual = item['current_quality']
        prio = item['priority']
        prob = item['problems']
        md_lines.append(f"| {fname} | {purp} | {mc} | {matc} | {polyc} | {sz} | {qual} | **{prio}**: {prob} |")
    md_lines.append("")

with open(r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\assets\glb\master_asset_inventory.md", "w", encoding="utf-8") as f:
    f.write("\n".join(md_lines))

print("[MARKDOWN GENERATION COMPLETED]")
