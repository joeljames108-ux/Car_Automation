"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 10
Subsystems 24 and 25:
- Subsystem 24: High-Performance Multi-Radiator Cooling Pack & Aux Coolers
- Subsystem 25: 48V High-Voltage Busbars, DC-DC Inverter & Harness Conduits
"""

PART_BENTLEY_EXTRA10 = '''
# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 24: MULTI-RADIATOR COOLING PACK & AUXILIARY HEAT EXCHANGERS
# ----------------------------------------------------------------------------

def build_bentley_radiator_cooling_pack(parent_col, mats):
    """
    Constructs the extensive thermal management radiator pack for the 6.0L W12:
    - Main high-capacity aluminum engine coolant radiator (Y = +2.120m, Z = 0.460m).
    - Front-mounted AC condenser core and transmission fluid heat exchanger.
    - Twin auxiliary low-temperature coolant radiators mounted in the outer bumper cavities
      directly behind the side intake matrix grilles (feeding intercoolers and 48V inverter).
    - Molded composite cooling fan shroud with dual high-output variable-speed electric fans.
    """
    objs = []
    bm_rad = bmesh.new()
    bm_fans = bmesh.new()

    # 1. Main High-Capacity W12 Coolant Radiator Core (Y = +2.120m, Z = 0.480m)
    mat_rad = Matrix.Translation(Vector((0.0, 2.120, 0.480)))
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_rad @ Matrix.Diagonal(Vector((0.740, 0.055, 0.380, 1.0))))

    # Molded End Tanks (Left & Right Aluminum End Tanks)
    for et_sign in [-1.0, 1.0]:
        mat_et = mat_rad @ Matrix.Translation(Vector((et_sign * 0.385, 0, 0)))
        bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_et @ Matrix.Diagonal(Vector((0.035, 0.065, 0.390, 1.0))))
        # Coolant Hose Inlet & Outlet Spigots
        mat_spig = mat_et @ Matrix.Translation(Vector((0, -0.040, et_sign * 0.120)))
        bmesh.ops.create_cylinder(bm_rad, radius=0.024, depth=0.060, segments=14, matrix=mat_spig @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. AC Condenser Core & Transmission Oil Cooler (Forward of main radiator at Y = +2.160m)
    mat_cond = Matrix.Translation(Vector((0.0, 2.165, 0.480)))
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_cond @ Matrix.Diagonal(Vector((0.700, 0.022, 0.340, 1.0))))

    # 3. Twin Outer Auxiliary Radiators (Left & Right Outer Bumper, Y = +2.050m, Z = 0.340m)
    for aux_sign in [-1.0, 1.0]:
        mat_aux = Matrix.Translation(Vector((aux_sign * 0.620, 2.050, 0.340))) @ Euler((0, aux_sign * math.radians(14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_aux @ Matrix.Diagonal(Vector((0.240, 0.045, 0.220, 1.0))))
        # Auxiliary Radiator Flared Duct Cowling
        mat_cowl = mat_aux @ Matrix.Translation(Vector((0, 0.035, 0)))
        bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_cowl @ Matrix.Diagonal(Vector((0.260, 0.025, 0.235, 1.0))))

    # 4. Rear Radiator Fan Shroud & Dual Variable-Speed Electric Cooling Fans (Behind radiator at Y = +2.070m)
    mat_shroud = Matrix.Translation(Vector((0.0, 2.070, 0.480)))
    bmesh.ops.create_cube(bm_fans, size=1.0, matrix=mat_shroud @ Matrix.Diagonal(Vector((0.720, 0.045, 0.370, 1.0))))

    # Dual High-Velocity Curved Aerofoil Fan Impellers (Left & Right)
    for fan_sign in [-1.0, 1.0]:
        mat_fan = mat_shroud @ Matrix.Translation(Vector((fan_sign * 0.185, -0.015, 0)))
        # Fan Outer Cylindrical Cowling Ring
        bmesh.ops.create_cylinder(bm_fans, cap_ends=False, radius=0.160, depth=0.035, segments=24, matrix=mat_fan @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Fan Electric Hub Motor
        bmesh.ops.create_cylinder(bm_fans, radius=0.052, depth=0.045, segments=16, matrix=mat_fan @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # 7 Swept Aerofoil Fan Blades
        for b_i in range(7):
            b_ang = b_i * (2.0 * math.pi / 7.0)
            mat_b = mat_fan @ Euler((0, 0, b_ang), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.095, 0, 0)))
            bmesh.ops.create_cube(bm_fans, size=1.0, matrix=mat_b @ Matrix.Diagonal(Vector((0.085, 0.008, 0.024, 1.0))))

    obj_rad = link_obj("GEO_BENTLEY_MultiRadiator_Cooling_Core", bm_rad, parent_col, mats["chrome"], bevel=0.001)
    obj_fans = link_obj("GEO_BENTLEY_Dual_Electric_Cooling_Fans", bm_fans, parent_col, mats["trim_black"], bevel=0.0015)

    objs.extend([obj_rad, obj_fans])
    return objs


# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 25: 48V HIGH-VOLTAGE BUSBARS, DC-DC CONVERTER & HARNESSES
# ----------------------------------------------------------------------------

def build_bentley_48v_electrical_architecture(parent_col, mats):
    """
    Constructs the 48-Volt electrical architecture and wiring distribution harnesses:
    - High-power 48V to 12V DC-DC bidirectional voltage converter module in engine compartment.
    - High-current orange shielded 48V power distribution busbars running down transmission tunnel.
    - Primary electrical wiring harness trunking conduits routed along structural sills.
    - Engine control unit (ECU) dual sealed aluminum enclosures mounted on passenger firewall.
    """
    objs = []
    bm_elec = bmesh.new()
    bm_harness = bmesh.new()

    # 1. 48V to 12V Bidirectional DC-DC Converter (Passenger side engine bay, Y = +1.180m, Z = 0.620m)
    mat_dcdc = Matrix.Translation(Vector((0.460, 1.180, 0.620)))
    # Finned Aluminum Heat Sink Enclosure
    bmesh.ops.create_cube(bm_elec, size=1.0, matrix=mat_dcdc @ Matrix.Diagonal(Vector((0.160, 0.220, 0.110, 1.0))))
    for fin_i in range(6):
        fz = -0.040 + fin_i * 0.016
        mat_fin = mat_dcdc @ Matrix.Translation(Vector((0, 0, fz)))
        bmesh.ops.create_cube(bm_elec, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.170, 0.210, 0.004, 1.0))))

    # 2. Dual W12 Bosch Master/Slave Engine ECUs (Firewall Passenger Side, Y = +0.890m, Z = 0.680m)
    for ecu_i in [0, 1]:
        mat_ecu = Matrix.Translation(Vector((0.360 + ecu_i * 0.120, 0.890, 0.680)))
        bmesh.ops.create_cube(bm_elec, size=1.0, matrix=mat_ecu @ Matrix.Diagonal(Vector((0.095, 0.035, 0.140, 1.0))))

    # 3. High-Voltage 48V Orange Insulated Busbar Cables (Running from trunk battery to front roll actuators)
    mat_bus = Matrix.Translation(Vector((-0.180, -0.400, 0.280)))
    bmesh.ops.create_cylinder(bm_harness, radius=0.014, depth=2.800, segments=12, matrix=mat_bus @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 4. Left & Right Main Chassis Body Wiring Conduits (Along inner rocker sills)
    for h_sign in [-1.0, 1.0]:
        mat_cond = Matrix.Translation(Vector((h_sign * 0.740, -0.200, 0.250)))
        bmesh.ops.create_cylinder(bm_elec, radius=0.018, depth=2.600, segments=12, matrix=mat_cond @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_elec = link_obj("GEO_BENTLEY_48V_Power_Electronics_and_ECUs", bm_elec, parent_col, mats["engine_alloy"], bevel=0.001)
    obj_harness = link_obj("GEO_BENTLEY_HighVoltage_48V_Busbars", bm_harness, parent_col, mats["red_caliper"], bevel=0.0008)

    objs.extend([obj_elec, obj_harness])
    return objs
'''
