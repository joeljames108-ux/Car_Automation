"""
Honda S2000 AP1 (2000s) Phase 18: Part Extra 3
Subsystems 39 to 44:
39. Brushed Aluminum "S2000" Door Sill Treadplates & Courtesy Switches
40. Underbody Hydraulic Line Chassis Conduit Bundle & Rubber Isolators
41. Trunk Compartment Tool Kit Roll, Scissor Jack & Lug Nut Wrench
42. A-Pillar Interior High-Frequency Audio Tweeters & Side Window Defroster Vents
43. Fuel Filler Door Spring Plunger Latch & Cable Release Mechanism
44. Engine Under-Tray Oil Filter Service Access Flaps & Dzus Pins
"""

PART_S2K2_EXTRA3 = '''
# ----------------------------------------------------------------------------
# 41. SUBSYSTEM 39: BRUSHED ALUMINUM "S2000" DOOR SILL TREADPLATES
# ----------------------------------------------------------------------------

def build_s2000_door_sill_treadplates(parent_col, mats):
    """
    Constructs the driver and passenger door entry sill step plates:
    - Brushed aluminum treadplate scuff shields mounted on door sill threshold (X = +/- 0.680m, Y = -0.150m, Z = 0.380m).
    - Embossed polished "S2000" center lettering.
    - Black rubber perimeter edge bead gasket.
    - Spring-loaded door courtesy light plunger pin switch in door jamb.
    """
    objs = []
    bm_tread = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        mat_sill = Matrix.Translation(Vector((sx_sign * 0.680, -0.150, 0.380))) @ Euler((0, 0, sx_sign * math.radians(-2)), 'XYZ').to_matrix().to_4x4()

        # 1. Brushed Aluminum Treadplate Shield (Length = 0.580m, Width = 0.065m)
        bmesh.ops.create_cube(bm_tread, size=1.0, matrix=mat_sill @ Matrix.Diagonal(Vector((0.065, 0.580, 0.005, 1.0))))

        # 2. Embossed "S2000" Raised Script Bar
        mat_txt = mat_sill @ Matrix.Translation(Vector((0, 0, 0.003)))
        bmesh.ops.create_cube(bm_tread, size=1.0, matrix=mat_txt @ Matrix.Diagonal(Vector((0.032, 0.160, 0.003, 1.0))))

        # 3. Door Courtesy Light Plunger Switch in B-Pillar Jamb (Y = -0.480m)
        mat_sw = Matrix.Translation(Vector((sx_sign * 0.710, -0.480, 0.450)))
        bmesh.ops.create_cylinder(bm_tread, radius=0.008, depth=0.020, segments=12, matrix=mat_sw @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_tread = link_obj("GEO_S2K_Door_Sill_Treadplates", bm_tread, parent_col, mats["chrome"], bevel=0.0004)
    objs.append(obj_tread)
    return objs

# ----------------------------------------------------------------------------
# 42. SUBSYSTEM 40: UNDERBODY HYDRAULIC LINE CHASSIS CONDUIT BUNDLE
# ----------------------------------------------------------------------------

def build_s2000_underbody_conduit_bundle(parent_col, mats):
    """
    Constructs the underbody steel brake and fuel hardline bundles:
    - 5 Parallel steel hardlines running inside chassis transmission tunnel floor (Y: -0.900m to +0.800m).
    - Polypropylene clip brackets securing lines to chassis ribs every 250mm.
    """
    objs = []
    bm_lines = bmesh.new()

    for li in range(5):
        x_l = -0.120 + li * 0.015
        mat_line = Matrix.Translation(Vector((x_l, -0.050, 0.190)))
        bmesh.ops.create_cylinder(bm_lines, radius=0.003, depth=1.700, segments=8, matrix=mat_line @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 6 Plastic Retaining Conduit Clamp Saddles
    for ci in range(6):
        y_c = -0.700 + ci * 0.280
        mat_c = Matrix.Translation(Vector((-0.090, y_c, 0.190)))
        bmesh.ops.create_cube(bm_lines, size=1.0, matrix=mat_c @ Matrix.Diagonal(Vector((0.095, 0.022, 0.014, 1.0))))

    obj_lines = link_obj("GEO_S2K_Underbody_Conduit_Bundle", bm_lines, parent_col, mats["trim"], bevel=0.0002)
    objs.append(obj_lines)
    return objs

# ----------------------------------------------------------------------------
# 43. SUBSYSTEM 41: TRUNK TOOL KIT, SCISSOR JACK & LUG WRENCH
# ----------------------------------------------------------------------------

def build_s2000_trunk_tool_kit_and_jack(parent_col, mats):
    """
    Constructs the emergency roadside tire-changing equipment in trunk well:
    - Steel pantograph scissor jack mounted in trunk tool well bracket (X = +0.280m, Y = -1.450m, Z = 0.360m).
    - L-shaped forged steel wheel lug nut wrench.
    - Canvas roll-up tool pouch with screwdriver and emergency towing eyelet bolt.
    """
    objs = []
    bm_tool = bmesh.new()

    mat_tool = Matrix.Translation(Vector((0.280, -1.450, 0.360)))

    # 1. Scissor Jack Diamond Frame
    bmesh.ops.create_cube(bm_tool, size=1.0, matrix=mat_tool @ Matrix.Diagonal(Vector((0.075, 0.320, 0.085, 1.0))))
    # Jack Lead Screw Acme Thread
    mat_screw = mat_tool @ Matrix.Translation(Vector((0, 0, 0.040)))
    bmesh.ops.create_cylinder(bm_tool, radius=0.007, depth=0.340, segments=12, matrix=mat_screw @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. L-Shaped Lug Wrench (X = +0.180m)
    mat_wr = Matrix.Translation(Vector((0.180, -1.450, 0.355)))
    bmesh.ops.create_cylinder(bm_tool, radius=0.008, depth=0.280, segments=10, matrix=mat_wr @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # 90-deg Lug Socket Arm
    mat_soc = mat_wr @ Matrix.Translation(Vector((0, 0.135, 0.035)))
    bmesh.ops.create_cylinder(bm_tool, radius=0.012, depth=0.075, segments=12, matrix=mat_soc)

    # 3. Canvas Tool Roll Bag (X = +0.360m)
    mat_bag = Matrix.Translation(Vector((0.360, -1.450, 0.360)))
    bmesh.ops.create_cylinder(bm_tool, radius=0.042, depth=0.220, segments=16, matrix=mat_bag @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_tool = link_obj("GEO_S2K_Trunk_Tool_Kit_and_Jack", bm_tool, parent_col, mats["trim"], bevel=0.0006)
    objs.append(obj_tool)
    return objs

# ----------------------------------------------------------------------------
# 44. SUBSYSTEM 42: A-PILLAR TWEETERS & DEFROSTER VENTS
# ----------------------------------------------------------------------------

def build_s2000_tweeter_speakers_and_defroster_vents(parent_col, mats):
    """
    Constructs the cockpit A-pillar interior trim components:
    - High-frequency silk dome tweeter speaker grilles inset in A-pillar base (X = +/- 0.650m, Y = +0.440m, Z = 0.815m).
    - Side window demister directional airflow nozzle vents.
    """
    objs = []
    bm_vents = bmesh.new()

    for vx_sign in [-1.0, 1.0]:
        mat_v = Matrix.Translation(Vector((vx_sign * 0.650, 0.440, 0.815))) @ Euler((math.radians(12), vx_sign * math.radians(-15), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Circular Tweeter Speaker Grille Mesh (Radius = 0.022m)
        bmesh.ops.create_cylinder(bm_vents, radius=0.022, depth=0.008, segments=18, matrix=mat_v @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Side Demister Vent Louver (Elongated oval slit blowing on side glass)
        mat_dem = mat_v @ Matrix.Translation(Vector((0, -0.045, 0.015)))
        bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_dem @ Matrix.Diagonal(Vector((0.018, 0.055, 0.014, 1.0))))

    obj_vents = link_obj("GEO_S2K_Tweeters_and_Demister_Vents", bm_vents, parent_col, mats["trim"], bevel=0.0004)
    objs.append(obj_vents)
    return objs

# ----------------------------------------------------------------------------
# 45. SUBSYSTEM 43: FUEL FILLER DOOR SPRING PLUNGER & RELEASE CABLE
# ----------------------------------------------------------------------------

def build_s2000_fuel_door_latch_mechanism(parent_col, mats):
    """
    Constructs the fuel filler door internal release hardware:
    - Spring-loaded ejection plunger inside fuel filler pocket (X = -0.745m, Y = -1.140m, Z = 0.740m).
    - Bowden release cable sheath connecting to interior floor release lever.
    - Chrome catch striker tang on the fuel lid.
    """
    objs = []
    bm_flatch = bmesh.new()

    mat_fl = Matrix.Translation(Vector((-0.745, -1.140, 0.740)))

    # 1. Ejection Plunger Pin & Coil Spring
    bmesh.ops.create_cylinder(bm_flatch, radius=0.005, depth=0.022, segments=10, matrix=mat_fl @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # Spring Coil
    mat_sp = mat_fl @ Matrix.Translation(Vector((0.008, 0, 0)))
    bmesh.ops.create_cylinder(bm_flatch, radius=0.008, depth=0.014, segments=12, matrix=mat_sp @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Bowden Sheath Conduit Routing into Cabin
    mat_sheath = Matrix.Translation(Vector((-0.680, -1.050, 0.680)))
    bmesh.ops.create_cylinder(bm_flatch, radius=0.0035, depth=0.220, segments=8, matrix=mat_sheath @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_flatch = link_obj("GEO_S2K_Fuel_Door_Release_Hardware", bm_flatch, parent_col, mats["trim"], bevel=0.0002)
    objs.append(obj_flatch)
    return objs

# ----------------------------------------------------------------------------
# 46. SUBSYSTEM 44: ENGINE UNDER-TRAY SERVICE FLAPS & DZUS FASTENERS
# ----------------------------------------------------------------------------

def build_s2000_undertray_service_flaps(parent_col, mats):
    """
    Constructs the quick-release engine undertray service inspection panels:
    - Stamped composite access hatch flap for oil filter removal (X = +0.120m, Y = +1.400m, Z = 0.150m).
    - 4 Quarter-turn slotted Dzus fastener heads with retaining circlips.
    """
    objs = []
    bm_flaps = bmesh.new()

    mat_hatch = Matrix.Translation(Vector((0.120, 1.400, 0.150)))
    # Access Flap Plate (220mm x 180mm)
    bmesh.ops.create_cube(bm_flaps, size=1.0, matrix=mat_hatch @ Matrix.Diagonal(Vector((0.180, 0.220, 0.006, 1.0))))

    # 4 Slotted Dzus Fasteners
    for fx in [-0.075, 0.075]:
        for fy in [-0.090, 0.090]:
            mat_dz = mat_hatch @ Matrix.Translation(Vector((fx, fy, -0.004)))
            bmesh.ops.create_cylinder(bm_flaps, radius=0.007, depth=0.006, segments=12, matrix=mat_dz)
            # Slot
            bmesh.ops.create_cube(bm_flaps, size=1.0, matrix=mat_dz @ Matrix.Translation(Vector((0, 0, -0.002))) @ Matrix.Diagonal(Vector((0.008, 0.0015, 0.003, 1.0))))

    obj_flaps = link_obj("GEO_S2K_Undertray_Inspection_Hatch", bm_flaps, parent_col, mats["trim"], bevel=0.0004)
    objs.append(obj_flaps)
    return objs
'''
