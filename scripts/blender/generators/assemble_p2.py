"""
Porsche 911 Carrera Cabriolet (Type 993) Phase 2 Generator Assembler
Combines all modular parts into generate_porsche_993_cabriolet_phase2.py
"""

import os
import sys

# Ensure local dir in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from parts_p2_a import PART_P2_A
from parts_p2_b import PART_P2_B
from parts_p2_c import PART_P2_C
from parts_p2_d import PART_P2_D
from parts_p2_f import PART_P2_F
from parts_p2_g import PART_P2_G
from parts_p2_h import PART_P2_H
from parts_p2_i import PART_P2_I
from parts_p2_e import PART_P2_E

out_path = r"e:\Car_Automation\scripts\blender\generators\generate_porsche_993_cabriolet_phase2.py"

def assemble_file():
    full_code = PART_P2_A + "\n" + PART_P2_B + "\n" + PART_P2_C + "\n" + PART_P2_D + "\n" + PART_P2_F + "\n" + PART_P2_G + "\n" + PART_P2_H + "\n" + PART_P2_I + "\n" + PART_P2_E

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(full_code)

    lines = full_code.splitlines()
    print(f"Assembly complete! Total lines: {len(lines)}, Bytes: {len(full_code)}")

if __name__ == "__main__":
    assemble_file()
