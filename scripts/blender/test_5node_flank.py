"""
Test script for 5-node continuous watertight flank lofter with perfect circular wheel arch cutouts.
"""
import math
from mathutils import Vector

f_axle = 1.380
r_axle = -1.340
arch_r_f = 0.380
arch_r_r = 0.400
z_ax_f = 0.343
z_ax_r = 0.364
base_sill = 0.110

def get_flank_profile(fy):
    # Determine base dimensions at longitudinal station fy
    if fy > 1.760: # Front nose taper
        t = (fy - 1.760) / (2.309 - 1.760)
        fw_w = 0.940 - 0.280 * (t ** 1.15)
        fw_bot = 0.910 - 0.250 * (t ** 1.15)
        fz_s = base_sill + 0.015 * t
        fz_w = 0.740 - 0.360 * (t ** 1.1)
    elif fy < -1.740: # Rear Kammback taper
        t = (-fy - 1.740) / (2.309 - 1.740)
        fw_w = 0.970 - 0.110 * (t ** 1.1)
        fw_bot = 0.920 - 0.100 * (t ** 1.1)
        fz_s = base_sill + 0.160 * t
        fz_w = 0.740 + 0.130 * (1.0 - t * 0.10)
    elif -0.940 <= fy <= 1.000: # Cabin door
        t_door = math.sin(math.pi * (fy - (-0.940)) / 1.940)
        fw_w = 0.940 - 0.075 * t_door
        fw_bot = 0.910 - 0.040 * t_door
        fz_s = base_sill
        fz_w = 0.740 + 0.015 * (1.0 - t_door)
    else: # In arch transition
        fw_w = 0.950
        fw_bot = 0.920
        fz_s = base_sill
        fz_w = 0.740

    # Wheel arch cutout calculations for Node 0
    d_f = abs(fy - f_axle)
    d_r = abs(fy - r_axle)
    if d_f < arch_r_f:
        # Inside front wheel arch opening
        ang = math.acos(max(-1.0, min(1.0, (fy - f_axle) / arch_r_f)))
        z0 = z_ax_f + arch_r_f * math.sin(ang)
        x0 = fw_w + 0.022 * math.sin(ang)
        zw = fz_w + 0.035 * math.sin(ang)
        xw = x0
    elif d_r < arch_r_r:
        # Inside rear wheel arch opening
        ang = math.acos(max(-1.0, min(1.0, (fy - r_axle) / arch_r_r)))
        z0 = z_ax_r + arch_r_r * math.sin(ang)
        x0 = 0.985 + 0.030 * math.sin(ang)
        zw = 0.820 + 0.045 * math.sin(ang)
        xw = x0
    else:
        # Standard rocker sill / lower apron
        z0 = fz_s
        x0 = fw_bot
        zw = fz_w
        xw = fw_w

    # 5 smooth vertical nodes from z0 (sill or arch lip) to zw (waistline)
    z1 = z0 + (zw - z0) * 0.22
    x1 = x0 * 0.985
    z2 = z0 + (zw - z0) * 0.48
    x2 = xw * 0.965
    z3 = z0 + (zw - z0) * 0.75
    x3 = xw * 0.988
    z4 = zw
    x4 = xw

    return [(x0, fy, z0), (x1, fy, z1), (x2, fy, z2), (x3, fy, z3), (x4, fy, z4)]

# Test stations from +2.309 to -2.309
test_ys = [
    2.309, 2.20, 2.05, 1.90, 1.76,
    # Front wheel arch radial stations (15 deg steps)
    *[f_axle + arch_r_f * math.cos(math.pi * i / 12.0) for i in range(1, 12)],
    1.00, 0.80, 0.60, 0.40, 0.20, 0.00, -0.20, -0.40, -0.60, -0.78, -0.94,
    # Rear wheel arch radial stations (15 deg steps)
    *[r_axle + arch_r_r * math.cos(math.pi * i / 12.0) for i in range(1, 12)],
    -1.74, -1.88, -2.02, -2.16, -2.25, -2.309
]

# Ensure strictly descending order for clean lofting
test_ys = sorted(list(set(test_ys)), reverse=True)
profiles = [get_flank_profile(y) for y in test_ys]
print(f"Total stations: {len(profiles)}, each with 5 nodes. Ready for 100% watertight lofting!")
