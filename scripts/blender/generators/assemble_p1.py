"""
Porsche 911 Carrera Cabriolet (Type 993) Phase 1 Generator Assembler
Combines all modular parts into generate_porsche_993_cabriolet_phase1.py
"""

import os
import sys

# Ensure local dir in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from parts_p1_a import PART_A
from parts_p1_b import PART_B
from parts_p1_c import PART_C
from parts_p1_d import PART_D
from parts_p1_e import PART_E
from parts_p1_f import PART_F
from parts_p1_g import PART_G

out_path = r"e:\Car_Automation\scripts\blender\generators\generate_porsche_993_cabriolet_phase1.py"

def assemble_file():
    with open(out_path, "r", encoding="utf-8") as f:
        existing = f.read()

    # Find end of header & core utilities (link_obj, etc)
    split_marker = "def create_oriented_box_between"
    idx = existing.find(split_marker)
    if idx != -1:
        # find end of create_oriented_box_between
        end_idx = existing.find("return bmesh.ops.create_cube(bm, size=1.0, matrix=mat)", idx)
        if end_idx != -1:
            end_line_idx = existing.find("\n", end_idx)
            header_core = existing[:end_line_idx + 1]
        else:
            header_core = existing
    else:
        header_core = existing

    full_code = header_core + "\n" + PART_A + "\n" + PART_B + "\n" + PART_C + "\n" + PART_D + "\n" + PART_E + "\n" + PART_F + "\n" + PART_G

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(full_code)

    lines = full_code.splitlines()
    print(f"Assembly complete! Total lines: {len(lines)}, Bytes: {len(full_code)}")

if __name__ == "__main__":
    assemble_file()
