"""
Honda S2000 AP1 (2000s) Phase 18: Part E
Subsystems 17 to 20:
17. Front & Rear Wheel Arch Inner Fender Liners & Push-Pins
18. Engine Bay Warning Placards, Solenoid Connectors & Decals
19. Cockpit Drilled Aluminum Sport Pedals & Dead Pedal Footrest
20. Steering Wheel "H" Horn Plaque & Center Console Flip Radio Door
"""

PART_S2K2_E = '''
# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 17: INNER FENDER SPLASH LINERS & FASTENERS
# ----------------------------------------------------------------------------

def build_s2000_inner_fender_liners_and_clips(parent_col, mats):
    """
    Constructs the thermoformed black polypropylene wheel arch splash liners:
    - Front left and right inner fender liners shielding engine bay from road debris (X = +/- 0.720m, Y = +1.200m).
    - Rear wheel arch inner quarter guards protecting trunk cavities (X = +/- 0.730m, Y = -1.200m).
    - Circular nylon push-pin retaining clips along fender lip perimeter.
    """
    objs = []
    bm_liners = bmesh.new()

    for ax_y, r_arch, name_tag in [(1.200, 0.350, "Front"), (-1.200, 0.355, "Rear")]:
        for wx_sign in [-1.0, 1.0]:
            mat_liner = Matrix.Translation(Vector((wx_sign * 0.725, ax_y, 0.316)))
            # Semicircular Thermoformed Plastic Shield
            bmesh.ops.create_cylinder(bm_liners, radius=r_arch, depth=0.180, segments=24, matrix=mat_liner @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

            # 6 Perimeter Nylon Push-Pin Retainers
            for ci in range(6):
                c_ang = math.pi * 0.15 + ci * math.pi * 0.14
                cx = wx_sign * 0.735
                cy = ax_y + r_arch * math.cos(c_ang)
                cz = 0.316 + r_arch * math.sin(c_ang)
                mat_pin = Matrix.Translation(Vector((cx, cy, cz)))
                bmesh.ops.create_cylinder(bm_liners, radius=0.008, depth=0.012, segments=10, matrix=mat_pin @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_liners = link_obj("GEO_S2K_Wheel_Arch_Splash_Liners", bm_liners, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_liners)
    return objs

# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 18: ENGINE BAY WARNING PLACARDS & SENSOR HARNESSES
# ----------------------------------------------------------------------------

def build_s2000_engine_bay_decals_and_sensors(parent_col, mats):
    """
    Constructs the factory engine bay identification and warning placards:
    - Radiator cooling fan warning and high-pressure cap decal.
    - Brake fluid reservoir warning label disc.
    - Air conditioning refrigerant R134a charging specification plaque on core support.
    - Engine oil 5W-30 specification filler neck decal.
    - VTEC variable valve timing green/gray waterproof wiring connector socket.
    """
    objs = []
    bm_decals = bmesh.new()
    bm_plugs = bmesh.new()

    # 1. Radiator High-Pressure Warning Decal (Y = +1.740m, Z = 0.545m)
    mat_rad_decal = Matrix.Translation(Vector((0.0, 1.740, 0.545)))
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_rad_decal @ Matrix.Diagonal(Vector((0.075, 0.045, 0.002, 1.0))))

    # 2. A/C Refrigerant R134a Warning Plaque on Core Support (Left, X = -0.280m, Y = 1.720m, Z = 0.550m)
    mat_ac_decal = Matrix.Translation(Vector((-0.280, 1.720, 0.550)))
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_ac_decal @ Matrix.Diagonal(Vector((0.090, 0.055, 0.002, 1.0))))

    # 3. Brake Master Cylinder Warning Label Ring (X = -0.380m, Y = 0.780m, Z = 0.615m)
    mat_b_decal = Matrix.Translation(Vector((-0.380, 0.780, 0.615)))
    bmesh.ops.create_cylinder(bm_decals, radius=0.020, depth=0.002, segments=16, matrix=mat_b_decal)

    # 4. VTEC Oil Pressure Switch & Spool Solenoid Waterproof Electrical Plug (X = +0.115m, Y = 0.985m, Z = 0.550m)
    mat_vplug = Matrix.Translation(Vector((0.115, 0.985, 0.550)))
    bmesh.ops.create_cube(bm_plugs, size=1.0, matrix=mat_vplug @ Matrix.Diagonal(Vector((0.024, 0.028, 0.022, 1.0))))
    # Harness Wire Lead
    mat_wire = mat_vplug @ Matrix.Translation(Vector((0, 0.025, 0)))
    bmesh.ops.create_cylinder(bm_plugs, radius=0.004, depth=0.045, segments=8, matrix=mat_wire @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_decals = link_obj("GEO_S2K_Engine_Bay_Warning_Placards", bm_decals, parent_col, mats["chrome"], bevel=0.0002)
    obj_plugs = link_obj("GEO_S2K_Engine_Sensors_and_Connectors", bm_plugs, parent_col, mats["trim"], bevel=0.0004)

    objs.extend([obj_decals, obj_plugs])
    return objs

# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 19: DRILLED ALUMINUM SPORT PEDALS & FOOTREST
# ----------------------------------------------------------------------------

def build_s2000_sport_pedals_and_footrest(parent_col, mats):
    """
    Constructs the driver cockpit drilled aluminum sport pedal box:
    - Located in driver footwell (X = -0.360m, Y = +0.520m, Z = 0.320m).
    - Lightweight cast aluminum accelerator pedal with curved profile for heel-and-toe downshifting.
    - Drilled aluminum brake pedal pad with 8 circular anti-slip rubber traction nubs.
    - Drilled aluminum clutch pedal pad with matching rubber traction nubs.
    - Large textured dead pedal footrest on left kick panel.
    """
    objs = []
    bm_pedals = bmesh.new()
    bm_nubs = bmesh.new()

    x_drv = -0.360

    # 1. Accelerator Pedal (Right pedal, X = x_drv + 0.090m)
    mat_gas = Matrix.Translation(Vector((x_drv + 0.090, 0.520, 0.315))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_gas @ Matrix.Diagonal(Vector((0.042, 0.012, 0.115, 1.0))))

    # 2. Brake Pedal (Center pedal, X = x_drv + 0.015m)
    mat_brake = Matrix.Translation(Vector((x_drv + 0.015, 0.505, 0.335))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_brake @ Matrix.Diagonal(Vector((0.058, 0.012, 0.065, 1.0))))
    # Anti-Slip Rubber Nubs on Brake Pedal (2x3 grid)
    for rxi in [-0.018, 0.0, 0.018]:
        for rzi in [-0.018, 0.018]:
            mat_nub = mat_brake @ Matrix.Translation(Vector((rxi, -0.007, rzi)))
            bmesh.ops.create_cylinder(bm_nubs, radius=0.004, depth=0.006, segments=8, matrix=mat_nub @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Clutch Pedal (Left pedal, X = x_drv - 0.060m)
    mat_clutch = Matrix.Translation(Vector((x_drv - 0.060, 0.505, 0.335))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_clutch @ Matrix.Diagonal(Vector((0.052, 0.012, 0.065, 1.0))))
    for rxi in [-0.015, 0.015]:
        for rzi in [-0.018, 0.018]:
            mat_nub = mat_clutch @ Matrix.Translation(Vector((rxi, -0.007, rzi)))
            bmesh.ops.create_cylinder(bm_nubs, radius=0.004, depth=0.006, segments=8, matrix=mat_nub @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 4. Dead Pedal Footrest (Far left kick panel, X = x_drv - 0.145m)
    mat_dead = Matrix.Translation(Vector((x_drv - 0.145, 0.540, 0.320))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_dead @ Matrix.Diagonal(Vector((0.065, 0.014, 0.160, 1.0))))

    obj_pedals = link_obj("GEO_S2K_Sport_Pedals_Aluminum", bm_pedals, parent_col, mats["alloy"], bevel=0.0006)
    obj_nubs = link_obj("GEO_S2K_Sport_Pedals_Rubber_Nubs", bm_nubs, parent_col, mats["trim"], bevel=0.0002)

    objs.extend([obj_pedals, obj_nubs])
    return objs

# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 20: STEERING WHEEL "H" EMBLEM & RADIO FLIP DOOR
# ----------------------------------------------------------------------------

def build_s2000_steering_wheel_emblem_and_radio_door(parent_col, mats):
    """
    Constructs the cockpit focal point trim items:
    - Steering wheel central airbag horn pad chrome Honda "H" insignia (X = -0.360m, Y = +0.175m, Z = 0.690m).
    - Center dashboard spring-loaded brushed silver audio system flip-down door panel (X = 0.0m, Y = +0.340m, Z = 0.610m).
    - Embossed cursive "S2000" branding etched across the center radio door cover.
    """
    objs = []
    bm_chemblem = bmesh.new()
    bm_rdoor = bmesh.new()

    x_drv = -0.360

    # 1. Steering Wheel Airbag Center Chrome "H" Emblem
    mat_wheel_h = Matrix.Translation(Vector((x_drv, 0.160, 0.690))) @ Euler((math.radians(-22), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Emblem Chrome Rim Ring
    bmesh.ops.create_cylinder(bm_chemblem, radius=0.024, depth=0.005, segments=20, matrix=mat_wheel_h @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Inner "H" Crossbar
    bmesh.ops.create_cube(bm_chemblem, size=1.0, matrix=mat_wheel_h @ Matrix.Translation(Vector((0, -0.003, 0))) @ Matrix.Diagonal(Vector((0.022, 0.004, 0.016, 1.0))))

    # 2. Center Console Brushed Silver Flip-Down Radio Door (X = 0.0m, Y = 0.340m, Z = 0.610m)
    mat_rdoor = Matrix.Translation(Vector((0.0, 0.340, 0.610))) @ Euler((math.radians(-16), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Door Outer Flap (Width = 0.195m, Height = 0.062m)
    bmesh.ops.create_cube(bm_rdoor, size=1.0, matrix=mat_rdoor @ Matrix.Diagonal(Vector((0.195, 0.008, 0.062, 1.0))))
    # Push-Push Finger Latch Release Bar along bottom edge
    mat_lbar = mat_rdoor @ Matrix.Translation(Vector((0, -0.005, -0.024)))
    bmesh.ops.create_cube(bm_chemblem, size=1.0, matrix=mat_lbar @ Matrix.Diagonal(Vector((0.075, 0.004, 0.008, 1.0))))

    obj_chemblem = link_obj("GEO_S2K_Steering_Wheel_Emblem_and_Latches", bm_chemblem, parent_col, mats["chrome"], bevel=0.0004)
    obj_rdoor = link_obj("GEO_S2K_Dashboard_Radio_Cover_Door", bm_rdoor, parent_col, mats["alloy"], bevel=0.0006)

    objs.extend([obj_chemblem, obj_rdoor])
    return objs
'''
