"""
Porsche 911 (993) Carrera Cabriolet — Phase 16: Part I
Subsystem 32: Dashboard Glovebox Door, Lock Cylinder & 911 Script Badge
Subsystem 33: Dashboard Directional AC Vents & Climate Sliders
"""

PART_P2_I = '''
# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 32: DASHBOARD GLOVEBOX & 911 BADGING
# ----------------------------------------------------------------------------

def build_993_dashboard_glovebox_and_badging(parent_col, mats):
    """
    Constructs the passenger side dashboard glovebox and interior badging:
    - Passenger dashboard lower glovebox door panel (X = +0.380m, Y = +0.480m, Z = 0.680m).
    - Glovebox push-button release handle with integrated key tumbler lock.
    - Polished chrome scripted '911 Carrera' interior dashboard emblem.
    - Interior courtesy footwell illumination lamp.
    """
    objs = []
    bm_gbox = bmesh.new()
    bm_badge = bmesh.new()

    # Glovebox Door Axis: X = +0.380m, Y = +0.480m, Z = 0.680m
    mat_gb = Matrix.Translation(Vector((0.380, 0.480, 0.680))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Glovebox Door Panel (Width 0.440m, Height 0.160m)
    bmesh.ops.create_cube(bm_gbox, size=1.0, matrix=mat_gb @ Matrix.Diagonal(Vector((0.440, 0.024, 0.160, 1.0))))

    # 2. Push-Button Release Handle & Keylock Tumbler (Left edge of door)
    mat_handle = mat_gb @ Matrix.Translation(Vector((-0.160, -0.014, 0.040)))
    bmesh.ops.create_cylinder(bm_badge, radius=0.014, depth=0.008, segments=16, matrix=mat_handle @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    bmesh.ops.create_cube(bm_badge, size=1.0, matrix=mat_handle @ Matrix.Diagonal(Vector((0.003, 0.010, 0.002, 1.0))))

    # 3. Polished Chrome Scripted '911 Carrera' Interior Emblem (Above glovebox)
    mat_in_badge = mat_gb @ Matrix.Translation(Vector((0.050, -0.014, 0.055)))
    bmesh.ops.create_cube(bm_badge, size=1.0, matrix=mat_in_badge @ Matrix.Diagonal(Vector((0.140, 0.004, 0.018, 1.0))))

    # 4. Under-Dash Footwell Courtesy Courtesy Light
    mat_light = Matrix.Translation(Vector((0.380, 0.520, 0.550)))
    bmesh.ops.create_cube(bm_badge, size=1.0, matrix=mat_light @ Matrix.Diagonal(Vector((0.065, 0.035, 0.015, 1.0))))

    obj_gbox = link_obj("GEO_993_Dashboard_Glovebox_Door", bm_gbox, parent_col, mats["rubber"], bevel=0.001)
    obj_badge = link_obj("GEO_993_Interior_911_Carrera_Badge", bm_badge, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_gbox, obj_badge])
    return objs

# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 33: DASHBOARD AC VENTS & CLIMATE SLIDERS
# ----------------------------------------------------------------------------

def build_993_dashboard_ac_vents_and_climate_sliders(parent_col, mats):
    """
    Constructs the dashboard climate control outlets and sliders:
    - 4 rectangular directional dashboard AC vents with horizontal and vertical louvers:
      * Driver outboard vent (Far left).
      * Twin center dashboard vents (Above radio/HVAC control panel).
      * Passenger outboard vent (Far right).
    - Central climate control console panel with horizontal temperature and fan speed sliders.
    - Air conditioning snowflake push-button and recirculation switch.
    """
    objs = []
    bm_vents = bmesh.new()
    bm_sliders = bmesh.new()

    # Vent Locations across Dashboard (Z = 0.760m, Y = +0.440m to +0.460m)
    vent_coords = [
        (-0.640, 0.420, 0.770, 0.080, 0.055),  # Driver Outboard
        (-0.065, 0.460, 0.745, 0.090, 0.050),  # Center Left
        (0.065, 0.460, 0.745, 0.090, 0.050),   # Center Right
        (0.640, 0.420, 0.770, 0.080, 0.055),   # Passenger Outboard
    ]

    for vx, vy, vz, vw, vh in vent_coords:
        mat_vent = Matrix.Translation(Vector((vx, vy, vz))) @ Euler((math.radians(14), 0, 0), 'XYZ').to_matrix().to_4x4()
        # Outer Vent Bezel Frame
        bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_vent @ Matrix.Diagonal(Vector((vw + 0.012, 0.018, vh + 0.010, 1.0))))
        # Recessed Air Cavity
        mat_cavity = mat_vent @ Matrix.Translation(Vector((0, 0.008, 0)))
        bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_cavity @ Matrix.Diagonal(Vector((vw, 0.016, vh, 1.0))))

        # 3 Horizontal Directional Louvers per Vent
        for l_idx in [-0.014, 0.000, 0.014]:
            mat_louver = mat_cavity @ Matrix.Translation(Vector((0, -0.004, l_idx)))
            bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_louver @ Matrix.Diagonal(Vector((vw - 0.006, 0.008, 0.003, 1.0))))

    # Central Climate Control Slider Panel (Below center vents, Y = +0.460m, Z = 0.670m)
    mat_hvac = Matrix.Translation(Vector((0.0, 0.460, 0.670))) @ Euler((math.radians(14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_hvac @ Matrix.Diagonal(Vector((0.210, 0.020, 0.075, 1.0))))

    # 3 Horizontal Slider Knobs (Fan, Temp, Defrost)
    for s_idx, sz_off in enumerate([-0.018, 0.000, 0.018]):
        mat_slider = mat_hvac @ Matrix.Translation(Vector((0.000, -0.012, sz_off)))
        # Slider Track Groove
        bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_slider @ Matrix.Diagonal(Vector((0.150, 0.004, 0.004, 1.0))))
        # Slider Adjustment Knob
        mat_knob = mat_slider @ Matrix.Translation(Vector(((s_idx - 1) * 0.035, -0.004, 0)))
        bmesh.ops.create_cube(bm_sliders, size=1.0, matrix=mat_knob @ Matrix.Diagonal(Vector((0.012, 0.008, 0.014, 1.0))))

    obj_vents = link_obj("GEO_993_Dashboard_AC_Vents_and_HVAC", bm_vents, parent_col, mats["rubber"], bevel=0.0008)
    obj_sliders = link_obj("GEO_993_HVAC_Control_Sliders", bm_sliders, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_vents, obj_sliders])
    return objs

# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 34: COCKPIT DOOR PULL HANDLES & MAP POCKETS
# ----------------------------------------------------------------------------

def build_993_cockpit_door_pockets_and_pull_handles(parent_col, mats):
    """
    Constructs the interior door panel hardware:
    - Ergonomic molded door pull armrests with interior door release latch levers.
    - Full-length lower map storage pockets with flip-out lids.
    - Door card forward Hi-Fi mid-bass speaker grilles.
    """
    objs = []
    bm_pockets = bmesh.new()
    bm_handles = bmesh.new()

    for dx_sign in [-1.0, 1.0]:
        mat_door_in = Matrix.Translation(Vector((dx_sign * 0.760, 0.050, 0.540)))

        # 1. Lower Door Map Storage Pocket (Length 0.460m, Height 0.120m)
        mat_pocket = mat_door_in @ Matrix.Translation(Vector((dx_sign * -0.015, -0.050, -0.120)))
        bmesh.ops.create_cube(bm_pockets, size=1.0, matrix=mat_pocket @ Matrix.Diagonal(Vector((0.035, 0.460, 0.120, 1.0))))

        # 2. Ergonomic Door Pull Armrest Handle
        mat_armrest = mat_door_in @ Matrix.Translation(Vector((dx_sign * -0.025, 0.050, 0.080)))
        bmesh.ops.create_cube(bm_handles, size=1.0, matrix=mat_armrest @ Matrix.Diagonal(Vector((0.045, 0.280, 0.045, 1.0))))

        # 3. Interior Door Release Latch Lever (Chrome)
        mat_latch = mat_armrest @ Matrix.Translation(Vector((dx_sign * -0.015, 0.090, 0.020)))
        bmesh.ops.create_cube(bm_handles, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.015, 0.065, 0.024, 1.0))))

    obj_pockets = link_obj("GEO_993_Door_Interior_Map_Pockets", bm_pockets, parent_col, mats["rubber"], bevel=0.001)
    obj_handles = link_obj("GEO_993_Door_Interior_Pull_Handles", bm_handles, parent_col, mats["chrome"], bevel=0.0006)

    objs.extend([obj_pockets, obj_handles])
    return objs
'''

