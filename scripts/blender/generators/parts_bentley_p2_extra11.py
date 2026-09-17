"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 11
Subsystems 29 and 30:
- Subsystem 29: Center Console "Organ Stop" Air Controls & Bullseye Registers
- Subsystem 30: Aerodynamic Shark-Fin GPS / Telematics Satellite Antenna Pod
"""

PART_BENTLEY2_EXTRA11 = '''
# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 29: "ORGAN STOP" AIR CONTROLS & BULLSEYE REGISTERS
# ----------------------------------------------------------------------------

def build_bentley_organ_stop_vents(parent_col, mats):
    """
    Constructs the iconic Bentley mechanical "Organ Stop" air ventilation controls:
    - Circular "Bullseye" polished chrome eyeball air vent registers on dashboard center and flanks.
    - Precision machined solid brass/chrome pull-out organ stop rods with knurled tips.
    - Rotating internal directional airflow vanes with knurled center adjusters.
    - Piano black backing bezel housings.
    """
    objs = []
    bm_eyeballs = bmesh.new()
    bm_stops = bmesh.new()
    bm_vanes = bmesh.new()

    vent_locations = [
        # Name, X_pos, Y_pos, Z_pos
        ("Center_L", -0.090, 0.410, 0.710),
        ("Center_R",  0.090, 0.410, 0.710),
        ("Outboard_L", -0.620, 0.440, 0.740),
        ("Outboard_R",  0.620, 0.440, 0.740),
    ]

    for name, vx, vy, vz in vent_locations:
        mat_v = Matrix.Translation(Vector((vx, vy, vz))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Circular Polished Chrome Bullseye Vent Bezel Ring (Radius = 0.038m)
        bmesh.ops.create_torus(bm_eyeballs, major_radius=0.038, minor_radius=0.004, major_segments=22, minor_segments=10, matrix=mat_v @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Recessed Directional Spherical Eyeball Core
        bmesh.ops.create_cylinder(bm_vanes, radius=0.034, depth=0.024, segments=20, matrix=mat_v @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Classic Mechanical Organ Stop Push-Pull Rod (Mounted directly beneath vent)
        mat_stop = mat_v @ Matrix.Translation(Vector((0.0, -0.015, -0.045)))
        # Chrome Slide Stem Shaft
        bmesh.ops.create_cylinder(bm_stops, radius=0.004, depth=0.045, segments=12, matrix=mat_stop @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Knurled Fluted Knob Tip
        mat_knob = mat_stop @ Matrix.Translation(Vector((0, -0.022, 0)))
        bmesh.ops.create_cylinder(bm_stops, radius=0.009, depth=0.014, segments=16, matrix=mat_knob @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_eyeballs = link_obj("GEO_BENTLEY_Bullseye_Air_Vent_Chrome_Rings", bm_eyeballs, parent_col, mats["chrome"], bevel=0.0004)
    obj_stops = link_obj("GEO_BENTLEY_Mechanical_Organ_Stop_Controls", bm_stops, parent_col, mats["knurled_metal"], bevel=0.0003)
    obj_vanes = link_obj("GEO_BENTLEY_Air_Vent_Internal_Eyeballs", bm_vanes, parent_col, mats["dark_tint"], bevel=0.0003)

    objs.extend([obj_eyeballs, obj_stops, obj_vanes])
    return objs


# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 30: SHARK-FIN GPS / LTE TELEMATICS ANTENNA POD
# ----------------------------------------------------------------------------

def build_bentley_shark_fin_antenna(parent_col, mats):
    """
    Constructs the low-drag telematics shark-fin antenna pod:
    - Aerodynamic composite fin situated along vehicle centerline ahead of boot lid (Y = -1.020m, Z = 0.895m).
    - Houses multi-band GNSS GPS receiver, dual LTE-Advanced MIMO cellular, and satellite radio antennas.
    - Finished in gloss piano black / body color with a soft EPDM perimeter base gasket.
    """
    objs = []
    bm_fin = bmesh.new()

    mat_fin = Matrix.Translation(Vector((0.0, -1.020, 0.895)))
    # Swept Aerodynamic Teardrop Fin Body
    bmesh.ops.create_cube(bm_fin, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.055, 0.160, 0.052, 1.0))))

    # Tapered Raked Spine
    mat_spine = mat_fin @ Matrix.Translation(Vector((0.0, 0.030, 0.015))) @ Euler((math.radians(-22), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_fin, size=1.0, matrix=mat_spine @ Matrix.Diagonal(Vector((0.035, 0.120, 0.035, 1.0))))

    # Base Rubber Sealing Flange Gasket
    mat_gask = mat_fin @ Matrix.Translation(Vector((0.0, 0.0, -0.024)))
    bmesh.ops.create_cube(bm_fin, size=1.0, matrix=mat_gask @ Matrix.Diagonal(Vector((0.062, 0.175, 0.006, 1.0))))

    obj_fin = link_obj("GEO_BENTLEY_SharkFin_Telematics_Antenna", bm_fin, parent_col, mats["piano_black"], bevel=0.0008)
    objs.append(obj_fin)
    return objs
'''
