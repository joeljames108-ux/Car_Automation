"""
Assembles the modular parts of Honda S2000 AP1 Phase 17 into generate_honda_s2000_ap1_phase1.py
"""

import os
import sys

_cur_dir = os.path.dirname(os.path.abspath(__file__))
if _cur_dir not in sys.path:
    sys.path.append(_cur_dir)

from parts_s2k_p1_a import PART_S2K_A
from parts_s2k_p1_b import PART_S2K_B
from parts_s2k_p1_c import PART_S2K_C
from parts_s2k_p1_d import PART_S2K_D
from parts_s2k_p1_e import PART_S2K_E
from parts_s2k_p1_f import PART_S2K_F
from parts_s2k_p1_g import PART_S2K_G
from parts_s2k_p1_extra import PART_S2K_EXTRA
from parts_s2k_p1_h import PART_S2K_H

assembled_content = "\n".join([
    PART_S2K_A.strip(),
    PART_S2K_B.strip(),
    PART_S2K_C.strip(),
    PART_S2K_D.strip(),
    PART_S2K_E.strip(),
    PART_S2K_F.strip(),
    PART_S2K_G.strip(),
    PART_S2K_EXTRA.strip(),
    PART_S2K_H.strip(),
])

out_path = os.path.join(_cur_dir, "generate_honda_s2000_ap1_phase1.py")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(assembled_content + "\n")

line_count = len(assembled_content.splitlines())
print(f"[ASSEMBLED] Successfully generated {out_path}")
print(f"            Total Line Count: {line_count} lines")
