"""
==============================================================================
BUGATTI DIVO — TRACK-FOCUSED HYPERCAR MASTER BUILDER (Blender 4.x / 5.x)
==============================================================================
8.0L Quad-Turbo W16 | 1500 HP | 2711mm WB | 11 Production Collections

Usage:
    blender --background --python "E:\\Car_Automation\\scripts\\blender\\build_complete_divo.py"

Or from Blender Python Console:
    exec(open(r"E:\\Car_Automation\\scripts\\blender\\build_complete_divo.py").read())
==============================================================================
"""

import sys
import os

# Ensure the divo package is on the path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DIVO_DIR = os.path.join(SCRIPT_DIR, "divo")
if DIVO_DIR not in sys.path:
    sys.path.insert(0, DIVO_DIR)
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import importlib

# Force-reload the divo package modules for hot-reload
for mod_name in [
    "divo_common", "divo_materials", "divo_body", "divo_chassis",
    "divo_aero_wing", "divo_lighting", "divo_glazing", "divo_wheels",
    "divo_interior", "divo_hardware", "divo_finalize", "divo_export",
    "divo_master_builder"
]:
    if mod_name in sys.modules:
        importlib.reload(sys.modules[mod_name])

import divo_master_builder

stats = divo_master_builder.build_complete_divo(export_glbs=True, export_individual=True)
print(f"\n[DIVO_BUILDER] Final stats: {stats}")
