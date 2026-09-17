"""
Assembles the modular parts of Jaguar F-Type V8 R Convertible Phase 20 into generate_jaguar_ftype_v8r_phase2.py
"""

import os
import sys

_cur_dir = os.path.dirname(os.path.abspath(__file__))
if _cur_dir not in sys.path:
    sys.path.append(_cur_dir)

from parts_ftype_p2_a import PART_FTYPE2_A
from parts_ftype_p2_b import PART_FTYPE2_B
from parts_ftype_p2_c import PART_FTYPE2_C
from parts_ftype_p2_d import PART_FTYPE2_D
from parts_ftype_p2_extra1 import PART_FTYPE2_EXTRA1
from parts_ftype_p2_extra2 import PART_FTYPE2_EXTRA2
from parts_ftype_p2_extra3 import PART_FTYPE2_EXTRA3
from parts_ftype_p2_extra4 import PART_FTYPE2_EXTRA4
from parts_ftype_p2_extra5 import PART_FTYPE2_EXTRA5
from parts_ftype_p2_extra6 import PART_FTYPE2_EXTRA6
from parts_ftype_p2_extra7 import PART_FTYPE2_EXTRA7
from parts_ftype_p2_extra8 import PART_FTYPE2_EXTRA8
from parts_ftype_p2_f import PART_FTYPE2_F

assembled_content = "\n".join([
    PART_FTYPE2_A.strip(),
    PART_FTYPE2_B.strip(),
    PART_FTYPE2_C.strip(),
    PART_FTYPE2_D.strip(),
    PART_FTYPE2_EXTRA1.strip(),
    PART_FTYPE2_EXTRA2.strip(),
    PART_FTYPE2_EXTRA3.strip(),
    PART_FTYPE2_EXTRA4.strip(),
    PART_FTYPE2_EXTRA5.strip(),
    PART_FTYPE2_EXTRA6.strip(),
    PART_FTYPE2_EXTRA7.strip(),
    PART_FTYPE2_EXTRA8.strip(),
    PART_FTYPE2_F.strip(),
])

out_path = os.path.join(_cur_dir, "generate_jaguar_ftype_v8r_phase2.py")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(assembled_content + "\n")

line_count = len(assembled_content.splitlines())
print(f"[ASSEMBLED] Successfully generated {out_path}")
print(f"            Total Line Count: {line_count} lines")
