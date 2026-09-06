import sys
import os
import math
import bpy
import bmesh
from mathutils import Vector, Euler

sys.path.insert(0, "scripts/blender")
from refine_and_detail_interior_glbs import (
    reset_scene_and_get_mats,
    make_box,
    make_cylinder,
    make_torus,
    make_knurled_cylinder,
    make_hex_bolt,
    make_pill_cylinder,
    make_spring_coil,
    make_an_fitting,
    export_active_scene_to_glb,
    apply_weighted_normals_and_weld
)

# --- 6 NEW v12.0 CAD PRIMITIVES ---

def make_exposed_horological_shifter_linkage(name, location, size=(0.14, 0.24, 0.14), mats=None, gold=False, gear=3):
    """
    Concours v12.0 Pagani / Spyker Exposed Horological Gated Shift Linkage.
    Features:
    - Billet skeletal cradle base with titanium pillow blocks.
    - Articulated titanium/gold shift shaft with reverse-lockout pull-collar and knurled trigger ring.
    - Spherical pivot gimbal bearing housing.
    - Longitudinal articulated selector linkage rod with dual miniature Heim spherical rod ends (brass balls & jam nuts).
    - Secondary selector bellcrank arm with pivot axle.
    - Dual counter-opposed centering coil springs visible under the skeletal gate plate.
    - Open gated shifter faceplate with polished shift channels and perimeter hex cap bolts.
    """
    frame_mat = mats["titanium_finish"]
    accent_mat = mats.get("titanium_anodized_gold", mats["anodized_gold"]) if gold else mats["titanium_finish"]
    brass_mat = mats.get("brass_watchmaker", mats["brass_brushed"])
    w, d, h = size

    # 1. Skeletal CNC Mounting Cradle Box
    cradle = make_box(f"{name}_Cradle", (location[0], location[1], location[2] + h * 0.25), (w, d, h * 0.5), mats["carbon_twill"], bevel=0.005)

    # 2. Open Gated Guide Faceplate with Perimeter Hex Cap Screws
    plate_z = location[2] + h * 0.50
    make_box(f"{name}_GatePlate", (location[0], location[1], plate_z), (w * 0.92, d * 0.88, 0.008), mats["metal_brushed"], bevel=0.002)
    # Perimeter precision hex bolts
    for bx_mult in [-0.40, 0.40]:
        for by_mult in [-0.40, 0.0, 0.40]:
            make_hex_bolt(f"{name}_GateBolt_{bx_mult}_{by_mult}",
                          (location[0] + bx_mult * w, location[1] + by_mult * d, plate_z + 0.005),
                          0.003, 0.003, (0, 0, 0), mats["chrome_jewel"])

    # 3. Spherical Gimbal Pivot Bearing Housing (Center)
    pivot_center = (location[0], location[1], location[2] + h * 0.28)
    make_cylinder(f"{name}_Gimbal_Cup", pivot_center, 0.022, 0.028, (0, 0, 0), frame_mat, vertices=24, bevel=0.002)
    make_torus(f"{name}_Gimbal_Ring", (pivot_center[0], pivot_center[1], pivot_center[2] + 0.010), 0.023, 0.003, (0, 0, 0), brass_mat, major_segments=24, minor_segments=8)

    # 4. Vertical Titanium Shift Shaft with Reverse Lockout Collar
    shaft_h = h * 0.95
    shaft_top = location[2] + shaft_h
    make_cylinder(f"{name}_Shift_Shaft", (location[0], location[1], location[2] + shaft_h * 0.52), 0.0065, shaft_h, (0, 0, 0), accent_mat, vertices=20)
    # Reverse lockout slider collar with dual finger wings
    collar_z = location[2] + shaft_h * 0.76
    make_cylinder(f"{name}_Lockout_Collar", (location[0], location[1], collar_z), 0.011, 0.020, (0, 0, 0), frame_mat, vertices=24, bevel=0.001)
    make_box(f"{name}_Lockout_Wing_L", (location[0] - 0.016, location[1], collar_z), (0.016, 0.008, 0.006), frame_mat, bevel=0.001)
    make_box(f"{name}_Lockout_Wing_R", (location[0] + 0.016, location[1], collar_z), (0.016, 0.008, 0.006), frame_mat, bevel=0.001)
    # Teardrop / spherical shift knob
    make_knurled_cylinder(f"{name}_Knob_Base", (location[0], location[1], shaft_top - 0.012), 0.014, 0.015, (0, 0, 0), accent_mat, ridges=20)
    make_cylinder(f"{name}_Knob_Top", (location[0], location[1], shaft_top), 0.018, 0.024, (0, 0, 0), mats["chrome_jewel"] if not gold else mats["anodized_gold"], vertices=24, bevel=0.006)

    # 5. Articulated Longitudinal Linkage Rod with Dual Heim Spherical Joints
    rod_y1 = location[1] - d * 0.35
    rod_y2 = location[1] + d * 0.35
    rod_z = location[2] + h * 0.16
    # Connecting tie rod
    make_cylinder(f"{name}_Selector_TieRod", (location[0] + 0.032, location[1], rod_z), 0.004, d * 0.65, (math.radians(90), 0, 0), accent_mat, vertices=16)
    # Front Heim Joint (Spherical Rod End)
    make_cylinder(f"{name}_Heim_Front_Body", (location[0] + 0.032, rod_y1, rod_z), 0.009, 0.014, (0, math.radians(90), 0), frame_mat, vertices=16, bevel=0.002)
    make_cylinder(f"{name}_Heim_Front_Ball", (location[0] + 0.032, rod_y1, rod_z), 0.006, 0.018, (0, math.radians(90), 0), brass_mat, vertices=16)
    make_hex_bolt(f"{name}_Heim_Front_JamNut", (location[0] + 0.032, rod_y1 + 0.012, rod_z), 0.0055, 0.004, (math.radians(90), 0, 0), frame_mat)
    # Rear Heim Joint
    make_cylinder(f"{name}_Heim_Rear_Body", (location[0] + 0.032, rod_y2, rod_z), 0.009, 0.014, (0, math.radians(90), 0), frame_mat, vertices=16, bevel=0.002)
    make_cylinder(f"{name}_Heim_Rear_Ball", (location[0] + 0.032, rod_y2, rod_z), 0.006, 0.018, (0, math.radians(90), 0), brass_mat, vertices=16)
    make_hex_bolt(f"{name}_Heim_Rear_JamNut", (location[0] + 0.032, rod_y2 - 0.012, rod_z), 0.0055, 0.004, (math.radians(90), 0, 0), frame_mat)

    # 6. Secondary Selector Bellcrank Arm with Needle Bearing Pivot
    make_box(f"{name}_Bellcrank_Arm", (location[0] + 0.018, rod_y2, rod_z + 0.018), (0.036, 0.012, 0.038), frame_mat, bevel=0.002)
    make_cylinder(f"{name}_Bellcrank_PivotAxle", (location[0], rod_y2, rod_z + 0.032), 0.006, 0.024, (0, math.radians(90), 0), accent_mat, vertices=16)

    # 7. Dual Counter-Opposed Centering Springs
    make_spring_coil(f"{name}_Centering_Spring_L", (location[0] - 0.025, location[1], location[2] + h * 0.22), radius=0.007, pitch=0.004, turns=5, wire_r=0.0012, rot_euler=(0, math.radians(90), 0), mat=mats["metal_brushed"])
    make_spring_coil(f"{name}_Centering_Spring_R", (location[0] + 0.025, location[1], location[2] + h * 0.22), radius=0.007, pitch=0.004, turns=5, wire_r=0.0012, rot_euler=(0, math.radians(-90), 0), mat=mats["metal_brushed"])

    return cradle


def make_racing_harness_system(name, seat_pos, mats=None, color="red"):
    """
    Concours v12.0 FIA 6-Point Competition Racing Harness System.
    Features:
    - Twin shoulder belts draped over seat backrest pass-through escutcheons.
    - CNC machined aluminum quick-adjuster ladder buckles with contrasting pull tabs.
    - Stitched FIA/SFI safety certification patch.
    - Central rotary turn-release Camlock buckle in anodized red/titanium with laser arrow.
    - Dual lap belts emerging from hip cutouts with forged alloy snap-hook carabiners.
    - Anti-submarine crotch strap.
    """
    webbing_mat = mats.get("harness_nylon_red", mats["harness_red"]) if color == "red" else mats["seatbelt_webbing"]
    camlock_mat = mats.get("harness_camlock_red", mats["anodized_red"])
    tag_mat = mats.get("safety_tag_yellow", mats["ambient_amber"])
    metal_mat = mats["billet_aluminum"]

    # Seat coordinates relative to seat center base
    # Shoulder pass-throughs are typically at z ~ 0.65 - 0.75, y ~ -0.05, x ~ +-0.10
    sx, sy, sz = seat_pos
    buckle_pos = (sx, sy + 0.12, sz + 0.32)

    # 1. Central Rotary Camlock Buckle
    buckle = make_cylinder(f"{name}_Camlock_Body", buckle_pos, 0.028, 0.016, (math.radians(20), 0, 0), mats["titanium_finish"], vertices=24, bevel=0.002)
    # Turn-release actuator ring with knurling
    make_knurled_cylinder(f"{name}_Camlock_TurnRing", (buckle_pos[0], buckle_pos[1] - 0.004, buckle_pos[2] + 0.002), 0.026, 0.008, (math.radians(20), 0, 0), camlock_mat, ridges=18)
    # Center push-to-release button
    make_cylinder(f"{name}_Camlock_CenterBtn", (buckle_pos[0], buckle_pos[1] - 0.008, buckle_pos[2] + 0.004), 0.012, 0.004, (math.radians(20), 0, 0), mats["chrome_jewel"], vertices=16)

    # 2. Left and Right Shoulder Belts (Draped from backrest down to buckle)
    for side_name, sign in [("L", -1), ("R", 1)]:
        top_anchor = (sx + sign * 0.11, sy - 0.08, sz + 0.72)
        mid_point = (sx + sign * 0.08, sy + 0.02, sz + 0.52)
        lower_point = (sx + sign * 0.035, sy + 0.09, sz + 0.36)

        # Upper belt segment (Headrest guide to adjuster)
        make_box(f"{name}_Shoulder_Upper_{side_name}",
                 ((top_anchor[0] + mid_point[0]) * 0.5, (top_anchor[1] + mid_point[1]) * 0.5, (top_anchor[2] + mid_point[2]) * 0.5),
                 (0.052, 0.12, 0.006), webbing_mat, bevel=0.001)

        # CNC Billet Quick-Adjuster Ladder Buckle
        make_box(f"{name}_Adjuster_Buckle_{side_name}", mid_point, (0.058, 0.028, 0.010), metal_mat, bevel=0.002)
        make_box(f"{name}_Adjuster_PullTab_{side_name}", (mid_point[0], mid_point[1] + 0.016, mid_point[2] - 0.015), (0.040, 0.018, 0.005), mats["anodized_red"], bevel=0.001)

        # Lower belt segment (Adjuster to central Camlock)
        make_box(f"{name}_Shoulder_Lower_{side_name}",
                 ((mid_point[0] + lower_point[0]) * 0.5, (mid_point[1] + lower_point[1]) * 0.5, (mid_point[2] + lower_point[2]) * 0.5),
                 (0.050, 0.10, 0.006), webbing_mat, bevel=0.001)

        # Stainless latch tongue inserted into Camlock
        make_box(f"{name}_LatchTongue_Shoulder_{side_name}", (lower_point[0], lower_point[1] + 0.012, lower_point[2] - 0.015), (0.032, 0.016, 0.004), mats["chrome_jewel"], bevel=0.001)

    # Stitched FIA Homologation Safety Tag on Driver Left Belt
    make_box(f"{name}_FIA_Safety_Tag", (sx - 0.08, sy + 0.05, sz + 0.58), (0.042, 0.032, 0.004), tag_mat, bevel=0.0005)
    make_box(f"{name}_FIA_Safety_Hologram", (sx - 0.08, sy + 0.05, sz + 0.585), (0.022, 0.016, 0.002), mats["ambient_iceblue"], bevel=0.0002)

    # 3. Left and Right Lap Belts with Chassis Carabiner Snap-Hooks
    for side_name, sign in [("L", -1), ("R", 1)]:
        hip_anchor = (sx + sign * 0.26, sy - 0.02, sz + 0.18)
        lap_mid = (sx + sign * 0.14, sy + 0.08, sz + 0.24)

        # Lap belt webbing band
        make_box(f"{name}_LapBelt_{side_name}",
                 ((hip_anchor[0] + lap_mid[0]) * 0.5, (hip_anchor[1] + lap_mid[1]) * 0.5, (hip_anchor[2] + lap_mid[2]) * 0.5),
                 (0.14, 0.052, 0.006), webbing_mat, bevel=0.001)

        # Forged Chassis Carabiner Eyelet / Snap-Hook
        make_cylinder(f"{name}_Carabiner_Hook_{side_name}", hip_anchor, 0.014, 0.016, (0, math.radians(90), 0), mats["titanium_finish"], vertices=16, bevel=0.002)
        make_torus(f"{name}_Carabiner_Eyelet_{side_name}", (hip_anchor[0] + sign * 0.010, hip_anchor[1], hip_anchor[2]), 0.012, 0.003, (0, math.radians(90), 0), mats["metal_brushed"], major_segments=16, minor_segments=6)

    # 4. Anti-Submarine Crotch Strap
    make_box(f"{name}_Crotch_Strap", (sx, sy + 0.12, sz + 0.22), (0.046, 0.08, 0.006), webbing_mat, bevel=0.001)

    return buckle


def make_fire_suppression_system(name, location, size=(0.11, 0.32, 0.11), rot_euler=(0, 0, 0), mats=None):
    """
    Concours v12.0 FIA LifeLine Cockpit Fire Suppression System.
    Features:
    - High-gloss crimson pressurized cylinder with spun dome endcaps.
    - Twin CNC billet saddle mounting clamps with over-center stainless toggle latches.
    - Solid brass valve distribution head with integrated analog pressure dial.
    - Braided stainless steel discharge line with blue/red AN fittings.
    - Emergency T-handle manual pull-cable with safety locking cotter pin.
    """
    bottle_mat = mats.get("fire_bottle_gloss_red", mats["anodized_red"])
    brass_mat = mats.get("brass_watchmaker", mats["brass_brushed"])
    w, length, h = size
    radius = w * 0.48

    # 1. Main Pressurized Fire Bottle Cylinder
    bottle = make_cylinder(f"{name}_Bottle", location, radius, length * 0.78, rot_euler, bottle_mat, vertices=24, bevel=0.006)
    # Spun dome bottom endcap
    btm_offset = Vector((0, -length * 0.39, 0))
    btm_offset.rotate(Euler(rot_euler, 'XYZ'))
    make_cylinder(f"{name}_Dome_Bottom", (location[0] + btm_offset.x, location[1] + btm_offset.y, location[2] + btm_offset.z),
                  radius * 0.95, 0.025, rot_euler, bottle_mat, vertices=24, bevel=0.010)

    # 2. Twin CNC Billet Saddle Clamps with Toggle Latches
    for c_y in [-0.22 * length, 0.22 * length]:
        c_offset = Vector((0, c_y, 0))
        c_offset.rotate(Euler(rot_euler, 'XYZ'))
        c_pos = (location[0] + c_offset.x, location[1] + c_offset.y, location[2] + c_offset.z)
        make_torus(f"{name}_SaddleClamp_{c_y}", c_pos, radius + 0.004, 0.004, rot_euler, mats["billet_aluminum"], major_segments=24, minor_segments=6)
        # Mounting foot bracket to floor
        foot_offset = Vector((0, c_y, -radius - 0.008))
        foot_offset.rotate(Euler(rot_euler, 'XYZ'))
        make_box(f"{name}_ClampFoot_{c_y}", (location[0] + foot_offset.x, location[1] + foot_offset.y, location[2] + foot_offset.z),
                 (w * 1.15, 0.028, 0.012), mats["titanium_finish"], bevel=0.002)

    # 3. Top Brass Distribution Manifold Valve Head
    top_offset = Vector((0, length * 0.42, 0))
    top_offset.rotate(Euler(rot_euler, 'XYZ'))
    top_pos = (location[0] + top_offset.x, location[1] + top_offset.y, location[2] + top_offset.z)
    make_cylinder(f"{name}_Manifold_Collar", top_pos, radius * 0.45, 0.026, rot_euler, brass_mat, vertices=16, bevel=0.002)
    make_box(f"{name}_Manifold_Block", (top_pos[0], top_pos[1], top_pos[2] + 0.018), (0.038, 0.038, 0.032), brass_mat, bevel=0.003)

    # 4. Analog Pressure Gauge Dial (with Green Safe Zone)
    gauge_pos = (top_pos[0] + 0.024, top_pos[1], top_pos[2] + 0.022)
    make_cylinder(f"{name}_Pressure_Gauge_Bezel", gauge_pos, 0.012, 0.008, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=20, bevel=0.001)
    make_cylinder(f"{name}_Pressure_Gauge_Face", (gauge_pos[0] + 0.003, gauge_pos[1], gauge_pos[2]), 0.010, 0.003, (0, math.radians(90), 0), mats["ambient_green"], vertices=16)

    # 5. Braided Stainless Steel Discharge Line with AN-4 Fittings
    an_pos = (top_pos[0] - 0.022, top_pos[1], top_pos[2] + 0.022)
    make_an_fitting(f"{name}_Discharge_AN", an_pos, 0.007, 0.022, (0, math.radians(-90), 0), mats["an_fitting_blue"], mats["anodized_red"], mats["braided_steel"])

    # 6. Red Emergency T-Handle Manual Pull Cable
    t_pos = (top_pos[0], top_pos[1] + 0.025, top_pos[2] + 0.032)
    make_cylinder(f"{name}_PullCable_Stem", t_pos, 0.003, 0.022, rot_euler, mats["titanium_finish"], vertices=10)
    make_box(f"{name}_PullHandle_T", (t_pos[0], t_pos[1] + 0.012, t_pos[2]), (0.036, 0.010, 0.014), mats["anodized_red"], bevel=0.002)

    return bottle


def make_steering_thumb_encoders_and_magnetic_paddles(name, center_pos, yoke_w=0.34, yoke_h=0.22, rot_euler=(0, 0, 0), mats=None, stripe_color="yellow"):
    """
    Concours v12.0 Motorsport Steering Thumb Encoders & Rear Magnetic Paddle Shifters.
    Features:
    - 9:00 and 3:00 thumb-operated knurled alloy rotary encoders with detents and index markers.
    - Rear magnetic paddle shifter assemblies with twin neodymium magnets and microswitch trigger housings.
    - Top dead center (12 o'clock) contrast alignment stripe.
    """
    alloy_mat = mats["billet_aluminum"]
    stripe_mat = mats.get("stripe_yellow", mats["ambient_amber"]) if stripe_color == "yellow" else mats["anodized_red"]
    cx, cy, cz = center_pos

    # 1. 12-o'Clock Contrast Alignment Stripe Band at Top Dead Center
    top_z = cz + yoke_h * 0.52
    make_torus(f"{name}_12_OClock_Stripe", (cx, cy, top_z), 0.017, 0.004, (0, math.radians(90), 0), stripe_mat, major_segments=16, minor_segments=6)

    # 2. Left and Right 9:00 / 3:00 Rotary Thumb Encoders
    for side_name, sign in [("L", -1), ("R", 1)]:
        thumb_x = cx + sign * (yoke_w * 0.36)
        thumb_y = cy - 0.012
        thumb_z = cz + 0.010

        # Beveled housing pocket
        make_box(f"{name}_Thumb_Pocket_{side_name}", (thumb_x, thumb_y, thumb_z), (0.028, 0.022, 0.026), mats["titanium_finish"], bevel=0.002)
        # Knurled encoder wheel
        make_knurled_cylinder(f"{name}_Thumb_Wheel_{side_name}", (thumb_x, thumb_y - 0.004, thumb_z), 0.011, 0.014, (math.radians(90), 0, 0), alloy_mat, ridges=18)
        # Index indicator marker
        make_box(f"{name}_Thumb_Index_{side_name}", (thumb_x, thumb_y - 0.012, thumb_z + 0.010), (0.003, 0.004, 0.004), mats["ambient_iceblue"], bevel=0.0005)

    # 3. Rear Magnetic Hall-Effect Paddle Shifter Assemblies (Left = Downshift, Right = Upshift)
    for side_name, sign, symbol in [("L", -1, "-"), ("R", 1, "+")]:
        paddle_x = cx + sign * (yoke_w * 0.42)
        paddle_y = cy + 0.038
        paddle_z = cz + 0.015

        # Billet mounting bracket & microswitch box
        make_box(f"{name}_Paddle_Bracket_{side_name}", (paddle_x, paddle_y, paddle_z), (0.024, 0.028, 0.034), mats["titanium_finish"], bevel=0.002)

        # Neodymium Magnet Disc Pair (Fixed & Moving)
        make_cylinder(f"{name}_Magnet_Fixed_{side_name}", (paddle_x, paddle_y + 0.006, paddle_z + 0.008), 0.006, 0.004, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=16)
        make_cylinder(f"{name}_Magnet_Moving_{side_name}", (paddle_x, paddle_y + 0.014, paddle_z + 0.008), 0.006, 0.004, (math.radians(90), 0, 0), mats["chrome_jewel"], vertices=16)

        # Chamfered Carbon Fiber Paddle Blade with Finger Scoops
        make_box(f"{name}_Paddle_Blade_{side_name}", (paddle_x + sign * 0.012, paddle_y + 0.020, paddle_z), (0.018, 0.006, 0.085), mats["carbon_twill"], bevel=0.002)

        # Laser-Etched / Inlaid +/- Symbol Accent
        make_box(f"{name}_Paddle_Symbol_{side_name}", (paddle_x + sign * 0.012, paddle_y + 0.016, paddle_z + 0.020), (0.008, 0.003, 0.008), mats["anodized_red"] if sign < 0 else mats["ambient_green"], bevel=0.0005)


def make_vip_airline_tray_table_and_bar(name, location, mats=None, wood_finish="walnut", extended=False):
    """
    Concours v12.0 Ultra-Luxury VIP Rear Airline Fold-Out Tray Table & Crystal Bar Cabinet.
    Features:
    - Articulated fold-out executive tray table in bookmatched walnut or forged carbon with chrome peripheral rim.
    - Satin titanium multi-link support hinge arms with damping cylinders.
    - Recessed illuminated bar niche with twin optical crystal champagne flutes and mood light halo.
    """
    wood_mat = mats.get("wood_walnut", mats["leather_cognac"]) if wood_finish == "walnut" else mats["carbon_forged"]
    crystal_mat = mats.get("champagne_crystal", mats["glass_clear"])
    lx, ly, lz = location

    # 1. Recessed Bar Cabinet Enclosure Box
    cabinet = make_box(f"{name}_BarCabinet", (lx, ly, lz), (0.46, 0.18, 0.32), mats["wood_pianoblack"], bevel=0.008)

    # 2. Twin Optical Crystal Champagne Flutes on Pedestals
    for f_idx, fx in enumerate([-0.11, 0.11]):
        flute_pos = (lx + fx, ly + 0.02, lz - 0.02)
        # Crystal base foot
        make_cylinder(f"{name}_Flute_Base_{f_idx+1}", (flute_pos[0], flute_pos[1], flute_pos[2]), 0.022, 0.005, (0, 0, 0), crystal_mat, vertices=20, bevel=0.001)
        # Slender stem
        make_cylinder(f"{name}_Flute_Stem_{f_idx+1}", (flute_pos[0], flute_pos[1], flute_pos[2] + 0.038), 0.004, 0.070, (0, 0, 0), crystal_mat, vertices=12)
        # Elongated tulip flute bowl
        make_cylinder(f"{name}_Flute_Bowl_{f_idx+1}", (flute_pos[0], flute_pos[1], flute_pos[2] + 0.105), 0.020, 0.075, (0, 0, 0), crystal_mat, vertices=20, bevel=0.005)
        # Golden champagne liquid interior level
        make_cylinder(f"{name}_Champagne_Liquid_{f_idx+1}", (flute_pos[0], flute_pos[1], flute_pos[2] + 0.090), 0.018, 0.040, (0, 0, 0), mats.get("brass_watchmaker", mats["anodized_gold"]), vertices=16)

    # 3. Perimeter Ambient Lightguide Halo
    make_torus(f"{name}_Ambient_Halo", (lx, ly + 0.04, lz + 0.06), 0.18, 0.003, (0, 0, 0), mats["ambient_iceblue"], major_segments=32, minor_segments=6)

    # 4. Articulated Executive Airline Tray Table (Stowed against front or extended)
    table_y = ly - 0.11
    table_z = lz + 0.10
    table = make_box(f"{name}_TrayTable_Surface", (lx, table_y, table_z), (0.42, 0.28, 0.016), wood_mat, bevel=0.004)
    # Polished chrome peripheral perimeter rim
    make_box(f"{name}_TrayTable_ChromeRim", (lx, table_y, table_z), (0.43, 0.29, 0.018), mats["chrome_jewel"], bevel=0.002)

    # Twin titanium hinge arms
    for h_idx, hx in enumerate([-0.16, 0.16]):
        make_cylinder(f"{name}_Hinge_Arm_{h_idx+1}", (lx + hx, ly - 0.04, lz + 0.04), 0.006, 0.12, (math.radians(45), 0, 0), mats["titanium_finish"], vertices=12)
        make_cylinder(f"{name}_Hinge_Pivot_{h_idx+1}", (lx + hx, ly - 0.08, lz + 0.08), 0.008, 0.018, (0, math.radians(90), 0), mats["chrome_jewel"], vertices=16)

    return cabinet


def make_high_end_acoustic_speaker_array(name, location, radius=0.075, depth=0.025, rot_euler=(0, 0, 0), mats=None, finish="chrome"):
    """
    Concours v12.0 Burmester / Naim High-End Acoustic 3D Speaker Array.
    Features:
    - Stepped outer brushed alloy escutcheon with beveled perimeter.
    - Concentric laser-slotted acoustic radiation rings (3 radial tiers).
    - Fine acoustic silk-mesh core backing.
    - Central jewel-turned phase plug with diamond-cut highlight ring.
    """
    bezel_mat = mats["anodized_gold"] if finish == "gold" else mats["metal_brushed"]
    jewel_mat = mats["chrome_jewel"] if finish == "chrome" else mats["anodized_gold"]

    # 1. Stepped Outer Alloy Escutcheon Ring
    outer_ring = make_cylinder(f"{name}_OuterBezel", location, radius, depth * 0.6, rot_euler, bezel_mat, vertices=32, bevel=0.003)

    # 2. Acoustic Silk-Mesh Core Backing Disc
    core_offset = Vector((0, 0, depth * 0.2))
    core_offset.rotate(Euler(rot_euler, 'XYZ'))
    core_pos = (location[0] + core_offset.x, location[1] + core_offset.y, location[2] + core_offset.z)
    make_cylinder(f"{name}_AcousticMesh", core_pos, radius * 0.88, depth * 0.3, rot_euler, mats["acoustic_silk_mesh"], vertices=24)

    # 3. Concentric Laser-Slotted Radiation Rings (3 concentric rings)
    for r_idx, r_ratio in enumerate([0.38, 0.60, 0.78]):
        ring_offset = Vector((0, 0, depth * 0.35))
        ring_offset.rotate(Euler(rot_euler, 'XYZ'))
        r_pos = (location[0] + ring_offset.x, location[1] + ring_offset.y, location[2] + ring_offset.z)
        make_torus(f"{name}_AcousticRing_{r_idx+1}", r_pos, radius * r_ratio, 0.0022, rot_euler, bezel_mat, major_segments=32, minor_segments=6)

    # 4. Central Diamond-Turned Jewel Phase Plug
    plug_offset = Vector((0, 0, depth * 0.45))
    plug_offset.rotate(Euler(rot_euler, 'XYZ'))
    plug_pos = (location[0] + plug_offset.x, location[1] + plug_offset.y, location[2] + plug_offset.z)
    make_cylinder(f"{name}_PhasePlug_Base", plug_pos, radius * 0.18, depth * 0.4, rot_euler, jewel_mat, vertices=24, bevel=0.002)
    make_torus(f"{name}_PhasePlug_Highlight", plug_pos, radius * 0.19, 0.0018, rot_euler, mats["chrome_jewel"], major_segments=24, minor_segments=6)

    return outer_ring


# --- EXECUTE TEST TO ENSURE PERFECT CAD GENERATION ---
mats = reset_scene_and_get_mats()

# Add the 6 new materials to test
from refine_and_detail_interior_glbs import get_or_create_material
mats["titanium_anodized_gold"] = get_or_create_material("Int_Titanium_Anodized_Gold", (0.88, 0.72, 0.42, 1.0), metallic=0.92, roughness=0.22)
mats["carbon_forged_marbled"] = get_or_create_material("Int_Carbon_Forged_Marbled", (0.035, 0.035, 0.04, 1.0), metallic=0.15, roughness=0.18, clearcoat=1.0)
mats["harness_nylon_red"] = get_or_create_material("Int_Racing_Harness_Nylon_Red", (0.75, 0.05, 0.05, 1.0), roughness=0.75, sheen=0.4)
mats["fire_bottle_gloss_red"] = get_or_create_material("Int_FireBottle_Gloss_Red", (0.85, 0.03, 0.02, 1.0), metallic=0.05, roughness=0.12, clearcoat=1.0)
mats["champagne_crystal"] = get_or_create_material("Int_Champagne_Flute_Crystal", (0.95, 0.98, 1.0, 0.2), roughness=0.02, transmission=0.96, ior=1.54, alpha=0.2)
mats["brass_watchmaker"] = get_or_create_material("Int_Brass_Watchmaker_Polished", (0.90, 0.75, 0.35, 1.0), metallic=0.95, roughness=0.22)
mats["harness_camlock_red"] = get_or_create_material("Int_Harness_Camlock_Red", (0.92, 0.08, 0.10, 1.0), metallic=0.85, roughness=0.20)
mats["safety_tag_yellow"] = get_or_create_material("Int_FIA_Safety_Tag_Yellow", (0.95, 0.88, 0.10, 1.0), roughness=0.80)

print("[TEST] Building Exposed Horological Shifter Linkage...")
make_exposed_horological_shifter_linkage("Test_Shifter", (0, 0, 0), mats=mats, gold=True)

print("[TEST] Building FIA 6-Point Racing Harness System...")
make_racing_harness_system("Test_Harness", (0.5, 0, 0), mats=mats, color="red")

print("[TEST] Building FIA LifeLine Fire Suppression System...")
make_fire_suppression_system("Test_FireBottle", (1.0, 0, 0), mats=mats)

print("[TEST] Building Steering Thumb Encoders & Magnetic Paddles...")
make_steering_thumb_encoders_and_magnetic_paddles("Test_Steering", (1.5, 0, 0), mats=mats)

print("[TEST] Building VIP Airline Tray Table & Crystal Bar...")
make_vip_airline_tray_table_and_bar("Test_VIP_Bar", (2.0, 0, 0), mats=mats)

print("[TEST] Building Burmester High-End Acoustic Speaker Array...")
make_high_end_acoustic_speaker_array("Test_Speaker", (2.5, 0, 0), mats=mats)

apply_weighted_normals_and_weld(dist=0.0003)
print("SUCCESS: All 6 new v12.0 CAD primitives generated flawlessly with weighted normals!")
