"""
Bus Superstructure Spaceframe Skeleton & Roll-Cage Framework Builder (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
Volvo 9700 H 13m (2006) Tri-Axle High-Floor Superstructure Framework
Constructs authentic tubular/box-section steel ring-frame pillars, roof trusses,
waistrails, cantrails, floor cross-bearers, door portal frames, and diagonal bracing.
"""

import bpy
import bmesh
import math
from mathutils import Vector
import bus_common as c

def build_bus_framework(mat_registry):
    """
    Constructs the master structural spaceframe skeleton of the bus.
    All parts registered in collection '00_Bus_Body_Framework' with prefix 'FRAMEWORK_'.
    """
    created_objects = []
    col_name = "00_Bus_Body_Framework"
    
    # Material: Heavy-duty industrial structural steel
    mat_framework = getattr(mat_registry, "skeleton_steel", None)
    if not mat_framework:
        mat_framework = getattr(mat_registry, "chassis_steel", None)
    if not mat_framework:
        mat_framework = getattr(mat_registry, "trim_satin_black", None)
        
    mat_gusset = getattr(mat_registry, "battery_aluminum", mat_framework)
    
    half_w = c.OVERALL_WIDTH / 2.0 - 0.045 # ~1.230m lateral pillar centerline
    sill_z = c.GROUND_CLEARANCE + 0.100    # 0.420m lower skirt sill rail
    floor_z = c.FLOOR_Z                    # 1.250m passenger floor level
    waist_z = c.BELTLINE_Z                 # 1.580m window beltline / waistrail
    cantrail_z = 3.320                     # 3.320m roof cantrail / window header
    crown_z = c.ROOF_BODY_Z - 0.020        # 3.500m roof crown center apex
    
    # -------------------------------------------------------------------------
    # 1. LONGITUDINAL CONTINUOUS FRAMEWORK BEAMS (Left & Right)
    # -------------------------------------------------------------------------
    # Length of bus skeleton: Y = -6.40m to +5.80m (~12.20m)
    skel_len = 12.200
    skel_y_center = -0.300
    
    tube_size = 0.060 # 60mm x 60mm structural square tube
    
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        px = sign * half_w
        
        # Lower Sill / Skirt Longitudinal Rail (At bottom of luggage bays)
        sill_rail = c.create_box(
            f"FRAMEWORK_Longitudinal_SillRail_{side}",
            location=(px, skel_y_center, sill_z),
            size=(tube_size, skel_len, tube_size),
            col_name=col_name,
            mat=mat_framework,
            bevel=0.003
        )
        created_objects.append(sill_rail)
        
        # Floor Perimeter Member (Tying passenger floor cross-bearers)
        floor_rail = c.create_box(
            f"FRAMEWORK_Longitudinal_FloorRail_{side}",
            location=(px, skel_y_center, floor_z),
            size=(tube_size, skel_len, tube_size),
            col_name=col_name,
            mat=mat_framework,
            bevel=0.003
        )
        created_objects.append(floor_rail)
        
        # Waistrail / Beltline Structural Beam (Directly below passenger windows)
        waist_rail = c.create_box(
            f"FRAMEWORK_Longitudinal_WaistRail_{side}",
            location=(px, skel_y_center, waist_z),
            size=(tube_size, skel_len, tube_size),
            col_name=col_name,
            mat=mat_framework,
            bevel=0.003
        )
        created_objects.append(waist_rail)
        
        # Roof Cantrail Beam (Longitudinal roof shoulder beam above windows)
        cantrail = c.create_box(
            f"FRAMEWORK_Longitudinal_RoofCantrail_{side}",
            location=(px, skel_y_center, cantrail_z),
            size=(tube_size, skel_len, tube_size),
            col_name=col_name,
            mat=mat_framework,
            bevel=0.003
        )
        created_objects.append(cantrail)
        
    # Roof Center Spine Stringer (Longitudinal Crown Beam at X=0)
    roof_spine = c.create_box(
        "FRAMEWORK_Roof_Longitudinal_Spine",
        location=(0.0, skel_y_center, crown_z),
        size=(tube_size, skel_len, tube_size),
        col_name=col_name,
        mat=mat_framework,
        bevel=0.003
    )
    created_objects.append(roof_spine)
    
    # Roof Intermediate Longitudinal Stringers (Left & Right of center spine)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        inter_stringer = c.create_box(
            f"FRAMEWORK_Roof_Longitudinal_Stringer_{side}",
            location=(sign * 0.600, skel_y_center, (cantrail_z + crown_z) / 2.0 + 0.040),
            size=(tube_size * 0.8, skel_len, tube_size * 0.8),
            col_name=col_name,
            mat=mat_framework,
            bevel=0.002
        )
        created_objects.append(inter_stringer)

    # -------------------------------------------------------------------------
    # 2. VERTICAL RING-FRAME PILLARS & TRANSVERSE ROOF BOWS (11 STATIONS)
    # -------------------------------------------------------------------------
    # Key structural stations along length of 13m coach:
    stations = [
        ("01_Front_A_Pillar",       5.800,  True),   # Raked windshield corner
        ("02_Behind_Front_Door",    4.300,  False),  # Forward bulkhead / door frame
        ("03_Steer_Axle_Pillar",    3.300,  False),  # Over steer axle arch
        ("04_Luggage_Bay_1",        1.800,  False),  # Bay 1 divider
        ("05_Luggage_Bay_2",        0.300,  False),  # Mid-cabin divider
        ("06_Mid_Exit_Door_Pillar", -1.200, False),  # Mid door frame
        ("07_Drive_Axle_Pillar",   -1.800, False),  # Drive axle front arch
        ("08_Tandem_Saddle_Pillar", -2.825, False),  # Inter-axle saddle
        ("09_Tag_Axle_Pillar",     -4.100, False),  # Tag axle rear arch
        ("10_Machinery_Bulkhead",   -5.300, False),  # Powertrain firewall
        ("11_Rear_Corner_D_Pillar", -6.400, False),  # Rear corner clip
    ]
    
    for st_name, st_y, is_raked in stations:
        # Left & Right Vertical Ring Pillars
        for side, sign in [("L", 1.0), ("R", -1.0)]:
            px = sign * half_w
            
            if is_raked:
                # Slanted A-pillar framing windshield
                p_bot = Vector((px, st_y + 0.350, waist_z))
                p_top = Vector((px * 0.95, st_y - 0.200, cantrail_z))
                mid_p = (p_bot + p_top) / 2.0
                vec = p_top - p_bot
                length = vec.length
                rot_y = math.atan2(vec.x, vec.z)
                rot_x = -math.atan2(vec.y, vec.z)
                
                a_pillar = c.create_box(
                    f"FRAMEWORK_Pillar_{side}_{st_name}",
                    location=(mid_p.x, mid_p.y, mid_p.z),
                    size=(tube_size, tube_size * 1.2, length),
                    rotation=(rot_x, rot_y, 0),
                    col_name=col_name,
                    mat=mat_framework,
                    bevel=0.003
                )
                created_objects.append(a_pillar)
                
                # Lower cowl pillar down to sill
                lower_a = c.create_box(
                    f"FRAMEWORK_LowerA_Pillar_{side}",
                    location=(px, st_y + 0.350, (sill_z + waist_z) / 2.0),
                    size=(tube_size, tube_size, abs(waist_z - sill_z)),
                    col_name=col_name,
                    mat=mat_framework,
                    bevel=0.003
                )
                created_objects.append(lower_a)
            else:
                # Vertical side pillar running from sill rail to cantrail
                pillar_h = abs(cantrail_z - sill_z)
                pillar_z = (sill_z + cantrail_z) / 2.0
                pillar = c.create_box(
                    f"FRAMEWORK_Pillar_{side}_{st_name}",
                    location=(px, st_y, pillar_z),
                    size=(tube_size, tube_size, pillar_h),
                    col_name=col_name,
                    mat=mat_framework,
                    bevel=0.003
                )
                created_objects.append(pillar)
                
        # Transverse Roof Bow / Hoop (Curved arch spanning L cantrail to R cantrail)
        roof_bow_mesh = bpy.data.meshes.new(f"FRAMEWORK_RoofBow_{st_name}_Mesh")
        roof_bow_obj = bpy.data.objects.new(f"FRAMEWORK_RoofBow_{st_name}", roof_bow_mesh)
        c.link_to_collection(roof_bow_obj, col_name)
        
        bm_bow = bmesh.new()
        bow_segs = 12
        bow_verts = []
        for bi in range(bow_segs + 1):
            bfac = bi / bow_segs
            bx = -half_w + bfac * (2.0 * half_w)
            norm_x = (bfac - 0.5) * 2.0 # -1 to +1
            # Parabolic roof crown profile
            bz = cantrail_z + (1.0 - norm_x**2) * (crown_z - cantrail_z)
            by = st_y - (0.200 if is_raked else 0.0)
            
            # 4 vertices per cross section
            hw = tube_size / 2.0
            v1 = bm_bow.verts.new(Vector((bx - hw, by - hw, bz - hw)))
            v2 = bm_bow.verts.new(Vector((bx + hw, by - hw, bz - hw)))
            v3 = bm_bow.verts.new(Vector((bx + hw, by + hw, bz + hw)))
            v4 = bm_bow.verts.new(Vector((bx - hw, by + hw, bz + hw)))
            bow_verts.append((v1, v2, v3, v4))
            
        bm_bow.verts.ensure_lookup_table()
        for bi in range(bow_segs):
            r1 = bow_verts[bi]
            r2 = bow_verts[bi + 1]
            bm_bow.faces.new((r1[0], r1[1], r2[1], r2[0]))
            bm_bow.faces.new((r1[1], r1[2], r2[2], r2[1]))
            bm_bow.faces.new((r1[2], r1[3], r2[3], r2[2]))
            bm_bow.faces.new((r1[3], r1[0], r2[0], r2[3]))
            
        bm_bow.to_mesh(roof_bow_mesh)
        bm_bow.free()
        
        roof_bow_obj.data.materials.append(mat_framework)
        c.apply_finishing(roof_bow_obj, bevel=0.002)
        created_objects.append(roof_bow_obj)
        
        # Floor Transverse Cross-Bearer Beam (Tying L and R pillars at floor_z)
        floor_bearer = c.create_box(
            f"FRAMEWORK_FloorCrossBearer_{st_name}",
            location=(0.0, st_y, floor_z),
            size=(2.0 * half_w - 0.040, tube_size, tube_size),
            col_name=col_name,
            mat=mat_framework,
            bevel=0.003
        )
        created_objects.append(floor_bearer)

    # -------------------------------------------------------------------------
    # 3. LUGGAGE BAY DIAGONAL K-TRUSS BRACING (Below floor_z=1.25m)
    # -------------------------------------------------------------------------
    # Diagonal shear trusses provide torsion rigidity between pillars along lower flanks
    truss_bays = [
        ("Bay1", 3.300, 1.800),
        ("Bay2", 1.800, 0.300),
        ("Bay3", 0.300, -1.200),
        ("Bay_Rear", -4.100, -5.300),
    ]
    for b_name, y_start, y_end in truss_bays:
        mid_y = (y_start + y_end) / 2.0
        delta_y = abs(y_start - y_end)
        mid_z = (sill_z + floor_z) / 2.0
        diag_len = math.sqrt(delta_y**2 + (floor_z - sill_z)**2)
        diag_ang = math.atan2(floor_z - sill_z, delta_y)
        
        for side, sign in [("L", 1.0), ("R", -1.0)]:
            px = sign * half_w
            # Diagonal member
            diag_truss = c.create_box(
                f"FRAMEWORK_DiagTruss_{side}_{b_name}",
                location=(px, mid_y, mid_z),
                size=(tube_size * 0.7, diag_len - 0.100, tube_size * 0.7),
                rotation=(diag_ang, 0, 0),
                col_name=col_name,
                mat=mat_framework,
                bevel=0.002
            )
            created_objects.append(diag_truss)

    # -------------------------------------------------------------------------
    # 4. FRONT WINDSHIELD STRUCTURAL APERTURE FRAMEWORK
    # -------------------------------------------------------------------------
    # Lower cowl horizontal beam
    cowl_beam = c.create_box(
        "FRAMEWORK_Front_Cowl_Header_Beam",
        location=(0.0, 6.150, 1.180),
        size=(2.0 * half_w - 0.100, tube_size * 1.2, tube_size),
        col_name=col_name,
        mat=mat_framework,
        bevel=0.003
    )
    created_objects.append(cowl_beam)
    
    # Upper windshield header beam (holding top of panoramic windshield)
    ws_header = c.create_box(
        "FRAMEWORK_Front_Windshield_Header_Beam",
        location=(0.0, 5.620, 3.000),
        size=(2.0 * half_w - 0.100, tube_size * 1.2, tube_size),
        col_name=col_name,
        mat=mat_framework,
        bevel=0.003
    )
    created_objects.append(ws_header)
    
    # Destination Sign Box Structural Enclosure
    dest_frame = c.create_box(
        "FRAMEWORK_Destination_Sign_Cage",
        location=(0.0, 5.500, 3.260),
        size=(1.850, 0.280, 0.380),
        col_name=col_name,
        mat=mat_framework,
        bevel=0.003
    )
    created_objects.append(dest_frame)

    # -------------------------------------------------------------------------
    # 5. REAR ENGINE FIREWALL & BACKLIGHT FRAMEWORK
    # -------------------------------------------------------------------------
    # Rear Engine Bay Firewall Bulkhead Truss at Y = -5.300m
    firewall_beam = c.create_box(
        "FRAMEWORK_Rear_Firewall_Crossbeam",
        location=(0.0, -5.300, floor_z + 0.150),
        size=(2.0 * half_w - 0.080, tube_size * 1.4, tube_size * 1.4),
        col_name=col_name,
        mat=mat_framework,
        bevel=0.004
    )
    created_objects.append(firewall_beam)
    
    # Rear Backlight Lower Sill Beam at Y = -6.400m
    rear_win_sill = c.create_box(
        "FRAMEWORK_Rear_Window_Sill_Beam",
        location=(0.0, -6.400, 2.300),
        size=(2.0 * half_w - 0.200, tube_size, tube_size),
        col_name=col_name,
        mat=mat_framework,
        bevel=0.003
    )
    created_objects.append(rear_win_sill)
    
    # Rear Backlight Upper Header Beam at Y = -6.400m
    rear_win_header = c.create_box(
        "FRAMEWORK_Rear_Window_Header_Beam",
        location=(0.0, -6.400, 3.320),
        size=(2.0 * half_w - 0.200, tube_size, tube_size),
        col_name=col_name,
        mat=mat_framework,
        bevel=0.003
    )
    created_objects.append(rear_win_header)

    # -------------------------------------------------------------------------
    # 6. PASSENGER DOOR PORTAL STRUCTURAL REINFORCEMENTS
    # -------------------------------------------------------------------------
    # Front Entrance Door Portal Header (Right / Curbside X = -half_w)
    door_portal_header = c.create_box(
        "FRAMEWORK_DoorPortal_Header_FrontEntrance",
        location=(-half_w, 4.850, 2.580),
        size=(tube_size * 1.2, 1.100, tube_size),
        col_name=col_name,
        mat=mat_framework,
        bevel=0.003
    )
    created_objects.append(door_portal_header)

    print(f"[BUS_FRAMEWORK] Assembled authentic bus superstructure skeleton with {len(created_objects)} structural steel parts.")
    return created_objects
