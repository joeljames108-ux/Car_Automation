"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 15
Subsystems 38 and 39:
- Subsystem 38: Brake Wear Sensor Wire Harnesses & Anti-Squeal Mass Dampers
- Subsystem 39: Radiator Air Deflector Spats & Brake Cooling NACA Guide Chutes
"""

PART_BENTLEY2_EXTRA15 = '''
# ----------------------------------------------------------------------------
# 38. SUBSYSTEM 38: BRAKE WEAR SENSORS & ANTI-SQUEAL MASS DAMPERS
# ----------------------------------------------------------------------------

def build_bentley_brake_wear_sensors_and_dampers(parent_col, mats):
    """
    Constructs high-performance carbon-silicon-carbide brake running micro-hardware:
    - Electronic brake pad friction wear sensor wires routed from caliper bodies to uprights.
    - Tuned circular mass vibration harmonic dampers mounted to caliper mounting ears
      eliminating high-frequency carbon ceramic brake squeal during city braking.
    - Flexible armored stainless steel braided brake fluid jumper hoses.
    """
    objs = []
    bm_sensors = bmesh.new()
    bm_dampers = bmesh.new()

    brakes = [
        ("FL", -0.795,  1.425, 0.365, True,  -1.0),
        ("FR",  0.795,  1.425, 0.365, True,   1.0),
        ("RL", -0.785, -1.426, 0.365, False, -1.0),
        ("RR",  0.785, -1.426, 0.365, False,  1.0),
    ]

    for name, bx, by, bz, is_front, x_sign in brakes:
        mat_whl = Matrix.Translation(Vector((bx, by, bz)))

        # 1. Tuned Anti-Squeal Brass Harmonic Mass Dampers (Dual per caliper ear)
        for damp_y in [-0.140, 0.140]:
            mat_damp = mat_whl @ Matrix.Translation(Vector((x_sign * 0.035, damp_y, 0.120)))
            bmesh.ops.create_cylinder(bm_dampers, radius=0.016, depth=0.025, segments=14, matrix=mat_damp)

        # 2. Armored Stainless Braided Fluid Jumper Line (Caliper to chassis hardline)
        mat_jumper = mat_whl @ Matrix.Translation(Vector((-x_sign * 0.040, 0.080, 0.080)))
        bmesh.ops.create_cylinder(bm_sensors, radius=0.005, depth=0.220, segments=12, matrix=mat_jumper @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Brake Pad Electric Wear Sensor Harness Cable
        mat_wear = mat_whl @ Matrix.Translation(Vector((0.0, -0.060, 0.070)))
        bmesh.ops.create_cylinder(bm_sensors, radius=0.003, depth=0.180, segments=10, matrix=mat_wear @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_sensors = link_obj("GEO_BENTLEY_Brake_Wear_Sensors_and_Lines", bm_sensors, parent_col, mats["trim_black"], bevel=0.0004)
    obj_dampers = link_obj("GEO_BENTLEY_Brake_Harmonic_Mass_Dampers", bm_dampers, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_sensors, obj_dampers])
    return objs


# ----------------------------------------------------------------------------
# 39. SUBSYSTEM 39: RADIATOR AIR DEFLECTOR SPATS & BRAKE NACA CHUTES
# ----------------------------------------------------------------------------

def build_bentley_air_deflector_spats(parent_col, mats):
    """
    Constructs lower aerodynamic airflow guide components:
    - Flexible polyurethane front tire air deflector spats diverting high-speed stagnation pressure.
    - Molded lower underbody NACA scoops channeling cooling air to front suspension lower ball joints.
    - Low-drag aerodynamic airflow guides around steering tie-rod linkages.
    """
    objs = []
    bm_spats = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        # 1. Front Tire Air Deflector Spat (Forward of front wheel arch, Y = +1.780m, Z = 0.175m)
        mat_spat = Matrix.Translation(Vector((sx_sign * 0.820, 1.780, 0.175)))
        bmesh.ops.create_cube(bm_spats, size=1.0, matrix=mat_spat @ Matrix.Diagonal(Vector((0.150, 0.020, 0.080, 1.0))))

        # 2. Lower Control Arm Underbody Air Deflector Chute (Y = +1.380m, Z = 0.185m)
        mat_chute = Matrix.Translation(Vector((sx_sign * 0.520, 1.380, 0.185))) @ Euler((0, sx_sign * math.radians(-16), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_spats, size=1.0, matrix=mat_chute @ Matrix.Diagonal(Vector((0.240, 0.075, 0.016, 1.0))))

    obj_spats = link_obj("GEO_BENTLEY_Aerodynamic_Air_Deflector_Spats", bm_spats, parent_col, mats["trim_black"], bevel=0.0008)
    objs.append(obj_spats)
    return objs
'''
