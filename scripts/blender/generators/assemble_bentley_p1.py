"""
Assembles the modular parts of Bentley Continental GT Speed Convertible Phase 21 into generate_bentley_continental_gt_speed_phase1.py
"""

import os
import sys

_cur_dir = os.path.dirname(os.path.abspath(__file__))
if _cur_dir not in sys.path:
    sys.path.append(_cur_dir)

from parts_bentley_p1_a import PART_BENTLEY_A
from parts_bentley_p1_b import PART_BENTLEY_B
from parts_bentley_p1_c import PART_BENTLEY_C
from parts_bentley_p1_d import PART_BENTLEY_D
from parts_bentley_p1_e import PART_BENTLEY_E
from parts_bentley_p1_f import PART_BENTLEY_F
from parts_bentley_p1_g import PART_BENTLEY_G
from parts_bentley_p1_extra1 import PART_BENTLEY_EXTRA1
from parts_bentley_p1_extra2 import PART_BENTLEY_EXTRA2
from parts_bentley_p1_extra3 import PART_BENTLEY_EXTRA3
from parts_bentley_p1_extra4 import PART_BENTLEY_EXTRA4
from parts_bentley_p1_extra5 import PART_BENTLEY_EXTRA5
from parts_bentley_p1_extra6 import PART_BENTLEY_EXTRA6
from parts_bentley_p1_extra7 import PART_BENTLEY_EXTRA7
from parts_bentley_p1_extra8 import PART_BENTLEY_EXTRA8
from parts_bentley_p1_extra9 import PART_BENTLEY_EXTRA9
from parts_bentley_p1_extra10 import PART_BENTLEY_EXTRA10
from parts_bentley_p1_extra11 import PART_BENTLEY_EXTRA11
from parts_bentley_p1_extra12 import PART_BENTLEY_EXTRA12
from parts_bentley_p1_extra13 import PART_BENTLEY_EXTRA13
from parts_bentley_p1_extra14 import PART_BENTLEY_EXTRA14
from parts_bentley_p1_extra15 import PART_BENTLEY_EXTRA15
from parts_bentley_p1_extra16 import PART_BENTLEY_EXTRA16
from parts_bentley_p1_h import PART_BENTLEY_H

assembled_content = "\n".join([
    PART_BENTLEY_A.strip(),
    PART_BENTLEY_B.strip(),
    PART_BENTLEY_C.strip(),
    PART_BENTLEY_D.strip(),
    PART_BENTLEY_E.strip(),
    PART_BENTLEY_F.strip(),
    PART_BENTLEY_G.strip(),
    PART_BENTLEY_EXTRA1.strip(),
    PART_BENTLEY_EXTRA2.strip(),
    PART_BENTLEY_EXTRA3.strip(),
    PART_BENTLEY_EXTRA4.strip(),
    PART_BENTLEY_EXTRA5.strip(),
    PART_BENTLEY_EXTRA6.strip(),
    PART_BENTLEY_EXTRA7.strip(),
    PART_BENTLEY_EXTRA8.strip(),
    PART_BENTLEY_EXTRA9.strip(),
    PART_BENTLEY_EXTRA10.strip(),
    PART_BENTLEY_EXTRA11.strip(),
    PART_BENTLEY_EXTRA12.strip(),
    PART_BENTLEY_EXTRA13.strip(),
    PART_BENTLEY_EXTRA14.strip(),
    PART_BENTLEY_EXTRA15.strip(),
    PART_BENTLEY_EXTRA16.strip(),
    PART_BENTLEY_H.strip(),
])

out_path = os.path.join(_cur_dir, "generate_bentley_continental_gt_speed_phase1.py")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(assembled_content + "\n")

line_count = len(assembled_content.splitlines())
print(f"[ASSEMBLED] Successfully generated {out_path}")
print(f"            Total Line Count: {line_count} lines")
