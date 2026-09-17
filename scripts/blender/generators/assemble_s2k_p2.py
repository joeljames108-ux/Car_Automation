"""
Assembles the modular parts of Honda S2000 AP1 Phase 18 into generate_honda_s2000_ap1_phase2.py
"""

import os
import sys

_cur_dir = os.path.dirname(os.path.abspath(__file__))
if _cur_dir not in sys.path:
    sys.path.append(_cur_dir)

from parts_s2k_p2_a import PART_S2K2_A
from parts_s2k_p2_b import PART_S2K2_B
from parts_s2k_p2_c import PART_S2K2_C
from parts_s2k_p2_d import PART_S2K2_D
from parts_s2k_p2_e import PART_S2K2_E
from parts_s2k_p2_extra1 import PART_S2K2_EXTRA1
from parts_s2k_p2_extra2 import PART_S2K2_EXTRA2
from parts_s2k_p2_extra3 import PART_S2K2_EXTRA3
from parts_s2k_p2_extra4 import PART_S2K2_EXTRA4
from parts_s2k_p2_extra5 import PART_S2K2_EXTRA5
from parts_s2k_p2_f import PART_S2K2_F

assembled_content = "\n".join([
    PART_S2K2_A.strip(),
    PART_S2K2_B.strip(),
    PART_S2K2_C.strip(),
    PART_S2K2_D.strip(),
    PART_S2K2_E.strip(),
    PART_S2K2_EXTRA1.strip(),
    PART_S2K2_EXTRA2.strip(),
    PART_S2K2_EXTRA3.strip(),
    PART_S2K2_EXTRA4.strip(),
    PART_S2K2_EXTRA5.strip(),
    PART_S2K2_F.strip(),
])

out_path = os.path.join(_cur_dir, "generate_honda_s2000_ap1_phase2.py")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(assembled_content + "\n")

line_count = len(assembled_content.splitlines())
print(f"[ASSEMBLED] Successfully generated {out_path}")
print(f"            Total Line Count: {line_count} lines")
