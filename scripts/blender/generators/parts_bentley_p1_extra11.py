"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 11
Subsystems 26 and 27:
- Subsystem 26: Convertible Active Pyrotechnic Rollover Protection Hoops & Cassettes
- Subsystem 27: 4-Corner Ride Height Sensor Linkages & Active Leveling Modules
"""

PART_BENTLEY_EXTRA11 = '''
# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 26: ACTIVE PYROTECHNIC ROLLOVER PROTECTION HOOPS
# ----------------------------------------------------------------------------

def build_bentley_rollover_protection(parent_col, mats):
    """
    Constructs the life-saving active deployable rollover protection system:
    - High-strength extruded aluminum rollover cassette cartridges mounted behind rear headrests.
    - Telescopic high-tensile steel rollover hoops held primed by pyrotechnic actuators.
      Capable of deploying within 120 milliseconds in an impending rollover event.
    - Structural transverse cross-brace tying rollover cassettes directly into rear bulkhead.
    """
    objs = []
    bm_cass = bmesh.new()
    bm_hoops = bmesh.new()

    # Rear Rollover Cassettes (Left & Right, positioned directly behind rear headrests at Y = -0.960m, Z = 0.720m)
    for ro_sign in [-1.0, 1.0]:
        mat_cass = Matrix.Translation(Vector((ro_sign * 0.360, -0.960, 0.680)))
        # Rigid Aluminum Cassette Housing Box
        bmesh.ops.create_cube(bm_cass, size=1.0, matrix=mat_cass @ Matrix.Diagonal(Vector((0.260, 0.140, 0.320, 1.0))))

        # High-Strength U-Shaped Telescopic Roll Hoop (Concealed flush below tonneau deck line)
        mat_hoop_ctr = mat_cass @ Matrix.Translation(Vector((0, 0, 0.140)))
        # Top Horizontal Crossbar of U-Hoop
        bmesh.ops.create_cylinder(bm_hoops, radius=0.022, depth=0.180, segments=16, matrix=mat_hoop_ctr @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Vertical Legs of U-Hoop
        for leg_sign in [-1.0, 1.0]:
            mat_leg = mat_hoop_ctr @ Matrix.Translation(Vector((leg_sign * 0.090, 0, -0.100)))
            bmesh.ops.create_cylinder(bm_hoops, radius=0.020, depth=0.200, segments=14, matrix=mat_leg)

        # Pyrotechnic Pre-Tensioner Squib Actuator Cylinder at base of cassette
        mat_squib = mat_cass @ Matrix.Translation(Vector((0, 0, -0.130)))
        bmesh.ops.create_cylinder(bm_cass, radius=0.028, depth=0.065, segments=14, matrix=mat_squib)

    # Transverse Structural Bulkhead Tie-Beam Locking Both Rollover Cassettes (Y = -0.960m, Z = 0.640m)
    mat_rbar = Matrix.Translation(Vector((0.0, -0.960, 0.640)))
    bmesh.ops.create_cube(bm_cass, size=1.0, matrix=mat_rbar @ Matrix.Diagonal(Vector((1.150, 0.065, 0.050, 1.0))))

    obj_cass = link_obj("GEO_BENTLEY_Rollover_Cassette_Cartridges", bm_cass, parent_col, mats["trim_black"], bevel=0.0015)
    obj_hoops = link_obj("GEO_BENTLEY_Deployable_Rollover_Protection_Hoops", bm_hoops, parent_col, mats["chrome"], bevel=0.0012)

    objs.extend([obj_cass, obj_hoops])
    return objs


# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 27: 4-CORNER RIDE HEIGHT SENSORS & SUSPENSION LEVELING
# ----------------------------------------------------------------------------

def build_bentley_ride_height_sensors(parent_col, mats):
    """
    Constructs high-frequency articulating ride height sensor modules:
    - 4-corner rotary hall-effect height sensor bodies mounted on chassis subframe rails.
    - Articulated ball-jointed drop link tie-rods connecting sensors to lower wishbones.
    - Monitors chassis ride height 500 times per second for dynamic 3-chamber air leveling.
    - Central pneumatic solenoid air distribution valve block and pressure accumulator tank.
    """
    objs = []
    bm_sensors = bmesh.new()
    bm_pneumatic = bmesh.new()

    sensor_locs = [
        ("FL", -0.560,  1.380, 0.380,  1.0, True),
        ("FR",  0.560,  1.380, 0.380, -1.0, True),
        ("RL", -0.540, -1.360, 0.390,  1.0, False),
        ("RR",  0.540, -1.360, 0.390, -1.0, False),
    ]

    for name, sx, sy, sz, flip, is_front in sensor_locs:
        mat_s = Matrix.Translation(Vector((sx, sy, sz)))
        # Rotary Hall-Effect Electronic Sensor Body
        bmesh.ops.create_cube(bm_sensors, size=1.0, matrix=mat_s @ Matrix.Diagonal(Vector((0.045, 0.045, 0.035, 1.0))))
        # Articulating Sensor Arm
        mat_arm = mat_s @ Matrix.Translation(Vector((flip * 0.035, 0, 0)))
        bmesh.ops.create_cylinder(bm_sensors, radius=0.006, depth=0.075, segments=10, matrix=mat_arm @ Euler((0, 0, math.radians(45)), 'XYZ').to_matrix().to_4x4())
        # Drop Link Rod down to lower suspension wishbone
        mat_link = mat_s @ Matrix.Translation(Vector((flip * 0.055, 0, -0.065)))
        bmesh.ops.create_cylinder(bm_sensors, radius=0.004, depth=0.110, segments=10, matrix=mat_link)

    # Central Pneumatic Air Suspension Aluminum Pressure Accumulator Reservoir Bottle (Trunk floor flank, Y = -1.450m)
    mat_accum = Matrix.Translation(Vector((-0.460, -1.450, 0.360)))
    bmesh.ops.create_cylinder(bm_pneumatic, radius=0.075, depth=0.360, segments=20, matrix=mat_accum @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Multi-Port Pneumatic Solenoid Air Distribution Valve Block
    mat_sol = mat_accum @ Matrix.Translation(Vector((0.140, 0.0, 0.0)))
    bmesh.ops.create_cube(bm_pneumatic, size=1.0, matrix=mat_sol @ Matrix.Diagonal(Vector((0.090, 0.120, 0.075, 1.0))))

    obj_sensors = link_obj("GEO_BENTLEY_Suspension_Ride_Height_Sensors", bm_sensors, parent_col, mats["trim_black"], bevel=0.0008)
    obj_pneumatic = link_obj("GEO_BENTLEY_Pneumatic_Air_Accumulator_ValveBlock", bm_pneumatic, parent_col, mats["engine_alloy"], bevel=0.0015)

    objs.extend([obj_sensors, obj_pneumatic])
    return objs
'''
