"""
Assembles the modular parts of Bentley Continental GT Speed Convertible Phase 22 into generate_bentley_continental_gt_speed_phase2.py
"""

import os
import sys

_cur_dir = os.path.dirname(os.path.abspath(__file__))
if _cur_dir not in sys.path:
    sys.path.append(_cur_dir)

from parts_bentley_p2_a import PART_BENTLEY2_A
from parts_bentley_p2_b import PART_BENTLEY2_B
from parts_bentley_p2_c import PART_BENTLEY2_C
from parts_bentley_p2_d import PART_BENTLEY2_D
from parts_bentley_p2_extra1 import PART_BENTLEY2_EXTRA1
from parts_bentley_p2_extra2 import PART_BENTLEY2_EXTRA2
from parts_bentley_p2_extra3 import PART_BENTLEY2_EXTRA3
from parts_bentley_p2_extra4 import PART_BENTLEY2_EXTRA4
from parts_bentley_p2_extra5 import PART_BENTLEY2_EXTRA5
from parts_bentley_p2_extra6 import PART_BENTLEY2_EXTRA6
from parts_bentley_p2_extra7 import PART_BENTLEY2_EXTRA7
from parts_bentley_p2_extra8 import PART_BENTLEY2_EXTRA8
from parts_bentley_p2_extra9 import PART_BENTLEY2_EXTRA9
from parts_bentley_p2_extra10 import PART_BENTLEY2_EXTRA10
from parts_bentley_p2_extra11 import PART_BENTLEY2_EXTRA11
from parts_bentley_p2_extra12 import PART_BENTLEY2_EXTRA12
from parts_bentley_p2_extra13 import PART_BENTLEY2_EXTRA13
from parts_bentley_p2_extra14 import PART_BENTLEY2_EXTRA14
from parts_bentley_p2_extra15 import PART_BENTLEY2_EXTRA15
from parts_bentley_p2_extra16 import PART_BENTLEY2_EXTRA16
from parts_bentley_p2_extra17 import PART_BENTLEY2_EXTRA17
from parts_bentley_p2_f import PART_BENTLEY2_F

assembled_content = "\n".join([
    PART_BENTLEY2_A.strip(),
    PART_BENTLEY2_B.strip(),
    PART_BENTLEY2_C.strip(),
    PART_BENTLEY2_D.strip(),
    PART_BENTLEY2_EXTRA1.strip(),
    PART_BENTLEY2_EXTRA2.strip(),
    PART_BENTLEY2_EXTRA3.strip(),
    PART_BENTLEY2_EXTRA4.strip(),
    PART_BENTLEY2_EXTRA5.strip(),
    PART_BENTLEY2_EXTRA6.strip(),
    PART_BENTLEY2_EXTRA7.strip(),
    PART_BENTLEY2_EXTRA8.strip(),
    PART_BENTLEY2_EXTRA9.strip(),
    PART_BENTLEY2_EXTRA10.strip(),
    PART_BENTLEY2_EXTRA11.strip(),
    PART_BENTLEY2_EXTRA12.strip(),
    PART_BENTLEY2_EXTRA13.strip(),
    PART_BENTLEY2_EXTRA14.strip(),
    PART_BENTLEY2_EXTRA15.strip(),
    PART_BENTLEY2_EXTRA16.strip(),
    PART_BENTLEY2_EXTRA17.strip(),
    PART_BENTLEY2_F.strip(),
])

out_path = os.path.join(_cur_dir, "generate_bentley_continental_gt_speed_phase2.py")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(assembled_content + "\n")

line_count = len(assembled_content.splitlines())
print(f"[ASSEMBLED] Successfully generated {out_path}")
print(f"            Total Line Count: {line_count} lines")
