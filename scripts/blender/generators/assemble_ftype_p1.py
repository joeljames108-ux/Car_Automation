"""
Assembles the modular parts of Jaguar F-Type V8 R Convertible Phase 19 into generate_jaguar_ftype_v8r_phase1.py
"""

import os
import sys

_cur_dir = os.path.dirname(os.path.abspath(__file__))
if _cur_dir not in sys.path:
    sys.path.append(_cur_dir)

from parts_ftype_p1_a import PART_FTYPE_A
from parts_ftype_p1_b import PART_FTYPE_B
from parts_ftype_p1_c import PART_FTYPE_C
from parts_ftype_p1_d import PART_FTYPE_D
from parts_ftype_p1_e import PART_FTYPE_E
from parts_ftype_p1_f import PART_FTYPE_F
from parts_ftype_p1_g import PART_FTYPE_G
from parts_ftype_p1_extra1 import PART_FTYPE_EXTRA1
from parts_ftype_p1_extra2 import PART_FTYPE_EXTRA2
from parts_ftype_p1_extra3 import PART_FTYPE_EXTRA3
from parts_ftype_p1_extra4 import PART_FTYPE_EXTRA4
from parts_ftype_p1_extra5 import PART_FTYPE_EXTRA5
from parts_ftype_p1_extra6 import PART_FTYPE_EXTRA6
from parts_ftype_p1_extra7 import PART_FTYPE_EXTRA7
from parts_ftype_p1_extra8 import PART_FTYPE_EXTRA8
from parts_ftype_p1_extra9 import PART_FTYPE_EXTRA9
from parts_ftype_p1_h import PART_FTYPE_H

assembled_content = "\n".join([
    PART_FTYPE_A.strip(),
    PART_FTYPE_B.strip(),
    PART_FTYPE_C.strip(),
    PART_FTYPE_D.strip(),
    PART_FTYPE_E.strip(),
    PART_FTYPE_F.strip(),
    PART_FTYPE_G.strip(),
    PART_FTYPE_EXTRA1.strip(),
    PART_FTYPE_EXTRA2.strip(),
    PART_FTYPE_EXTRA3.strip(),
    PART_FTYPE_EXTRA4.strip(),
    PART_FTYPE_EXTRA5.strip(),
    PART_FTYPE_EXTRA6.strip(),
    PART_FTYPE_EXTRA7.strip(),
    PART_FTYPE_EXTRA8.strip(),
    PART_FTYPE_EXTRA9.strip(),
    PART_FTYPE_H.strip(),
])

out_path = os.path.join(_cur_dir, "generate_jaguar_ftype_v8r_phase1.py")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(assembled_content + "\n")

line_count = len(assembled_content.splitlines())
print(f"[ASSEMBLED] Successfully generated {out_path}")
print(f"            Total Line Count: {line_count} lines")
