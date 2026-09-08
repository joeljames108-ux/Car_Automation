"""
Procedural Texture Generator for Automotive Instrument Cluster & 24 Warning Lights
Generates high-resolution master gauge faceplates and individual telltale icons.
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont

def ensure_dir(d):
    os.makedirs(d, exist_ok=True)

OUT_DIR = os.path.abspath("public/models/interior/textures/cluster")
ensure_dir(OUT_DIR)

def draw_radial_ticks(draw, cx, cy, radius, start_angle, end_angle, num_major, num_minor, major_len=18, minor_len=10, color=(240, 240, 245), width=2):
    total_steps = (num_major - 1) * (num_minor + 1)
    for i in range(total_steps + 1):
        t = i / total_steps
        angle_deg = start_angle + t * (end_angle - start_angle)
        angle_rad = math.radians(angle_deg)
        is_major = (i % (num_minor + 1)) == 0
        tick_len = major_len if is_major else minor_len
        line_w = width if is_major else max(1, width - 1)

        x1 = cx + (radius - tick_len) * math.cos(angle_rad)
        y1 = cy + (radius - tick_len) * math.sin(angle_rad)
        x2 = cx + radius * math.cos(angle_rad)
        y2 = cy + radius * math.sin(angle_rad)

        draw.line([(x1, y1), (x2, y2)], fill=color, width=line_w)

def generate_master_gauge_faceplate():
    w, h = 2048, 1024
    img = Image.new("RGBA", (w, h), (10, 12, 16, 255))
    draw = ImageDraw.Draw(img)

    # Subtle metallic brushed radial texture background
    for r in range(0, 1000, 4):
        draw.ellipse([(w//2 - r, h//2 - r), (w//2 + r, h//2 + r)], outline=(14, 17, 22, 255), width=1)

    # =========================================================================
    # 1. CENTRAL SPEEDOMETER (0 - 160 MPH)
    # =========================================================================
    speed_cx, speed_cy = 1024, 512
    speed_r = 340

    # Outer metallic rim
    draw.ellipse([(speed_cx - speed_r, speed_cy - speed_r), (speed_cx + speed_r, speed_cy + speed_r)], outline=(60, 70, 85, 255), width=4)
    draw.ellipse([(speed_cx - speed_r + 8, speed_cy - speed_r + 8), (speed_cx + speed_r - 8, speed_cy + speed_r - 8)], outline=(25, 30, 40, 255), width=6)

    # Radial ticks from 140 deg to 400 deg (span 260 deg)
    draw_radial_ticks(draw, speed_cx, speed_cy, speed_r - 20, 140, 400, num_major=9, num_minor=3, major_len=24, minor_len=14, color=(245, 248, 255, 255), width=4)

    # Secondary inner km/h ticks
    draw_radial_ticks(draw, speed_cx, speed_cy, speed_r - 65, 140, 400, num_major=14, num_minor=1, major_len=12, minor_len=6, color=(80, 160, 220, 200), width=2)

    # Center Hub ring
    draw.ellipse([(speed_cx - 50, speed_cy - 50), (speed_cx + 50, speed_cy + 50)], fill=(18, 22, 28, 255), outline=(90, 105, 130, 255), width=3)

    # Labels
    draw.text((speed_cx - 24, speed_cy + 85), "MPH", fill=(220, 225, 235, 255))
    draw.text((speed_cx - 22, speed_cy + 120), "km/h", fill=(80, 160, 220, 200))

    # MPH Numbers: 0, 20, 40, 60, 80, 100, 120, 140, 160
    speeds = [0, 20, 40, 60, 80, 100, 120, 140, 160]
    for idx, s in enumerate(speeds):
        t = idx / (len(speeds) - 1)
        ang = math.radians(140 + t * 260)
        nx = speed_cx + (speed_r - 54) * math.cos(ang) - 12
        ny = speed_cy + (speed_r - 54) * math.sin(ang) - 10
        draw.text((nx, ny), str(s), fill=(240, 245, 255, 255))

    # =========================================================================
    # 2. LEFT TACHOMETER (0 - 8 RPM x1000)
    # =========================================================================
    tacho_cx, tacho_cy = 440, 512
    tacho_r = 310

    draw.ellipse([(tacho_cx - tacho_r, tacho_cy - tacho_r), (tacho_cx + tacho_r, tacho_cy + tacho_r)], outline=(60, 70, 85, 255), width=4)

    # Normal White Ticks (0 to 6.5k RPM, span from 140 to 335 deg)
    draw_radial_ticks(draw, tacho_cx, tacho_cy, tacho_r - 20, 140, 335, num_major=7, num_minor=3, major_len=22, minor_len=12, color=(245, 248, 255, 255), width=4)

    # Crimson Redline Ticks (6.5k to 8.0k RPM, span 335 to 380 deg)
    draw_radial_ticks(draw, tacho_cx, tacho_cy, tacho_r - 20, 335, 380, num_major=3, num_minor=3, major_len=26, minor_len=14, color=(240, 40, 40, 255), width=4)

    # Redline Arc Band
    draw.arc([(tacho_cx - tacho_r + 25, tacho_cy - tacho_r + 25), (tacho_cx + tacho_r - 25, tacho_cy + tacho_r - 25)], 335, 380, fill=(230, 35, 35, 230), width=6)

    draw.ellipse([(tacho_cx - 45, tacho_cy - 45), (tacho_cx + 45, tacho_cy + 45)], fill=(18, 22, 28, 255), outline=(90, 105, 130, 255), width=3)
    draw.text((tacho_cx - 40, tacho_cy + 75), "RPM x1000", fill=(220, 225, 235, 255))

    rpms = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    for idx, r_val in enumerate(rpms):
        t = idx / 8.0
        ang = math.radians(140 + t * 240)
        nx = tacho_cx + (tacho_r - 50) * math.cos(ang) - 8
        ny = tacho_cy + (tacho_r - 50) * math.sin(ang) - 10
        col = (240, 40, 40, 255) if r_val >= 7 else (240, 245, 255, 255)
        draw.text((nx, ny), str(r_val), fill=col)

    # =========================================================================
    # 3. RIGHT QUADRANT AUXILIARY GAUGES (Fuel, Temp, Volts, Oil)
    # =========================================================================
    # 3A. Fuel Level (Top Right)
    fuel_cx, fuel_cy = 1620, 360
    fuel_r = 135
    draw.ellipse([(fuel_cx - fuel_r, fuel_cy - fuel_r), (fuel_cx + fuel_r, fuel_cy + fuel_r)], outline=(50, 60, 75, 255), width=3)
    draw_radial_ticks(draw, fuel_cx, fuel_cy, fuel_r - 12, 160, 320, num_major=5, num_minor=1, major_len=14, minor_len=8, color=(240, 245, 255, 255), width=3)
    draw.text((fuel_cx - 48, fuel_cy + 5), "E", fill=(240, 60, 60, 255))
    draw.text((fuel_cx - 6, fuel_cy - 48), "1/2", fill=(220, 225, 235, 255))
    draw.text((fuel_cx + 38, fuel_cy + 5), "F", fill=(240, 245, 255, 255))
    draw.text((fuel_cx - 16, fuel_cy + 30), "FUEL", fill=(200, 210, 230, 220))

    # 3B. Coolant Temperature (Middle Right)
    temp_cx, temp_cy = 1620, 670
    temp_r = 135
    draw.ellipse([(temp_cx - temp_r, temp_cy - temp_r), (temp_cx + temp_r, temp_cy + temp_r)], outline=(50, 60, 75, 255), width=3)
    draw_radial_ticks(draw, temp_cx, temp_cy, temp_r - 12, 160, 320, num_major=5, num_minor=1, major_len=14, minor_len=8, color=(240, 245, 255, 255), width=3)
    draw.text((temp_cx - 48, temp_cy + 5), "C", fill=(80, 160, 240, 255))
    draw.text((temp_cx - 16, temp_cy - 48), "100", fill=(220, 225, 235, 255))
    draw.text((temp_cx + 38, temp_cy + 5), "H", fill=(240, 50, 50, 255))
    draw.text((temp_cx - 18, temp_cy + 30), "TEMP", fill=(200, 210, 230, 220))

    # 3C. Battery Voltage (Far Right Top)
    volt_cx, volt_cy = 1880, 360
    volt_r = 105
    draw.ellipse([(volt_cx - volt_r, volt_cy - volt_r), (volt_cx + volt_r, volt_cy + volt_r)], outline=(45, 55, 70, 255), width=2)
    draw_radial_ticks(draw, volt_cx, volt_cy, volt_r - 10, 170, 310, num_major=3, num_minor=1, major_len=12, minor_len=6, color=(240, 245, 255, 255), width=2)
    draw.text((volt_cx - 36, volt_cy + 4), "9", fill=(220, 225, 235, 255))
    draw.text((volt_cx - 10, volt_cy - 38), "14", fill=(100, 220, 140, 255))
    draw.text((volt_cx + 26, volt_cy + 4), "19", fill=(220, 225, 235, 255))
    draw.text((volt_cx - 12, volt_cy + 24), "VOLTS", fill=(200, 210, 230, 220))

    # 3D. Oil Pressure (Far Right Bottom)
    oil_cx, oil_cy = 1880, 670
    oil_r = 105
    draw.ellipse([(oil_cx - oil_r, oil_cy - oil_r), (oil_cx + oil_r, oil_cy + oil_r)], outline=(45, 55, 70, 255), width=2)
    draw_radial_ticks(draw, oil_cx, oil_cy, oil_r - 10, 170, 310, num_major=3, num_minor=1, major_len=12, minor_len=6, color=(240, 245, 255, 255), width=2)
    draw.text((oil_cx - 36, oil_cy + 4), "0", fill=(240, 60, 60, 255))
    draw.text((oil_cx - 10, oil_cy - 38), "40", fill=(220, 225, 235, 255))
    draw.text((oil_cx + 26, oil_cy + 4), "80", fill=(220, 225, 235, 255))
    draw.text((oil_cx - 14, oil_cy + 24), "OIL PSI", fill=(200, 210, 230, 220))

    path = os.path.join(OUT_DIR, "cluster_analog_dials_face.png")
    img.save(path, "PNG")
    print(f"Generated: {path}")

def generate_digital_mid_texture():
    w, h = 512, 256
    img = Image.new("RGBA", (w, h), (6, 10, 16, 255))
    draw = ImageDraw.Draw(img)

    # Top Status Bar
    draw.line([(0, 32), (w, 32)], fill=(25, 38, 55, 255), width=1)
    draw.text((20, 10), "READY • HYBRID EV", fill=(80, 220, 140, 255))
    draw.text((410, 10), "12:45 PM", fill=(200, 215, 235, 255))

    # Highway Lane Perspective Graphic
    cx = 256
    draw.line([(cx - 160, 210), (cx - 35, 90)], fill=(60, 180, 240, 255), width=4) # Left lane line
    draw.line([(cx + 160, 210), (cx + 35, 90)], fill=(60, 180, 240, 255), width=4) # Right lane line

    # Dashed center guidance
    for y in range(95, 210, 25):
        draw.line([(cx, y), (cx, y + 14)], fill=(120, 220, 255, 220), width=3)

    # Ego Car Wireframe
    draw.rectangle([(cx - 32, 160), (cx + 32, 205)], outline=(0, 240, 255, 255), width=3, fill=(10, 30, 50, 220))
    draw.rectangle([(cx - 24, 172), (cx + 24, 192)], outline=(0, 240, 255, 255), width=2)
    # Tail lights
    draw.rectangle([(cx - 30, 198), (cx - 20, 204)], fill=(255, 40, 40, 255))
    draw.rectangle([(cx + 20, 198), (cx + 30, 204)], fill=(255, 40, 40, 255))

    # Speed & Gear Readout
    draw.text((cx - 28, 52), "68", fill=(255, 255, 255, 255))
    draw.text((cx + 16, 62), "MPH", fill=(100, 170, 240, 255))
    draw.text((cx - 12, 102), "D 7", fill=(0, 255, 200, 255))

    # Bottom Odometer & Trip
    draw.line([(0, 222), (w, 222)], fill=(25, 38, 55, 255), width=1)
    draw.text((20, 230), "ODO: 24,850 MI", fill=(160, 180, 205, 255))
    draw.text((370, 230), "RANGE: 385 MI", fill=(80, 220, 140, 255))

    path = os.path.join(OUT_DIR, "cluster_digital_mid.png")
    img.save(path, "PNG")
    print(f"Generated: {path}")

def generate_telltale_icon(name, color_rgb, symbol_type, label=""):
    """
    Renders an authentic, crisp automotive telltale symbol.
    """
    size = 128
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    r, g, b = color_rgb
    glow_col = (r, g, b, 60)
    stroke_col = (r, g, b, 255)
    fill_col = (r, g, b, 240)

    # Subtle circular dark glass backing
    draw.ellipse([(6, 6), (size - 6, size - 6)], fill=(12, 15, 20, 220), outline=(r//4, g//4, b//4, 180), width=2)
    # Subtle outer glow halo
    draw.ellipse([(2, 2), (size - 2, size - 2)], outline=glow_col, width=3)

    cx, cy = size // 2, size // 2

    # Vectorized shapes based on standard ISO 2575 / SAE J517 automotive symbols
    if symbol_type == "turn_signals":
        # Left and Right green arrows
        draw.polygon([(cx - 10, cy - 20), (cx - 40, cy), (cx - 10, cy + 20), (cx - 10, cy + 10), (cx + 10, cy + 10), (cx + 10, cy + 20), (cx + 40, cy), (cx + 10, cy - 20), (cx + 10, cy - 10), (cx - 10, cy - 10)], fill=fill_col)
    elif symbol_type == "high_beam":
        # Bullet dome with horizontal rays
        draw.chord([(cx - 18, cy - 24), (cx + 28, cy + 24)], 270, 90, fill=fill_col)
        for y in [-16, -6, 4, 14]:
            draw.line([(cx - 38, cy + y), (cx - 16, cy + y)], fill=stroke_col, width=4)
    elif symbol_type == "fog_beams":
        # Angled beam lines with wavy line
        draw.chord([(cx - 16, cy - 22), (cx + 28, cy + 22)], 270, 90, fill=fill_col)
        for y, x_off in [(-12, -4), (-2, 0), (8, 4)]:
            draw.line([(cx - 38 + x_off, cy + y + 10), (cx - 14 + x_off, cy + y)], fill=stroke_col, width=3)
        draw.line([(cx - 30, cy - 24), (cx - 26, cy + 24)], fill=(180, 240, 180, 255), width=3)
    elif symbol_type == "cruise_control":
        # Speedometer with small pointer arrow
        draw.arc([(cx - 32, cy - 32), (cx + 32, cy + 32)], 150, 390, fill=stroke_col, width=4)
        draw.polygon([(cx - 4, cy - 4), (cx + 22, cy - 18), (cx + 4, cy + 4)], fill=fill_col)
        draw.ellipse([(cx - 6, cy - 6), (cx + 6, cy + 6)], fill=fill_col)
    elif symbol_type == "abs":
        # (ABS) with brake shoes
        draw.arc([(cx - 36, cy - 36), (cx + 36, cy + 36)], 120, 240, fill=stroke_col, width=4)
        draw.arc([(cx - 36, cy - 36), (cx + 36, cy + 36)], 300, 420, fill=stroke_col, width=4)
        draw.ellipse([(cx - 26, cy - 26), (cx + 26, cy + 26)], outline=stroke_col, width=3)
        draw.text((cx - 19, cy - 9), "ABS", fill=stroke_col)
    elif symbol_type == "warning_triangle":
        # Triangle with exclamation
        draw.polygon([(cx, cy - 32), (cx - 34, cy + 26), (cx + 34, cy + 26)], outline=stroke_col, width=4)
        draw.line([(cx, cy - 12), (cx, cy + 8)], fill=stroke_col, width=4)
        draw.ellipse([(cx - 3, cy + 14), (cx + 3, cy + 20)], fill=stroke_col)
    elif symbol_type == "slip_tcs":
        # Car rear with two wavy skid marks
        draw.rectangle([(cx - 20, cy - 24), (cx + 20, cy - 6)], outline=stroke_col, width=3, fill=fill_col)
        draw.line([(cx - 16, cy), (cx - 8, cy + 12)], fill=stroke_col, width=3)
        draw.line([(cx - 8, cy + 12), (cx - 18, cy + 26)], fill=stroke_col, width=3)
        draw.line([(cx + 8, cy), (cx + 18, cy + 12)], fill=stroke_col, width=3)
        draw.line([(cx + 18, cy + 12), (cx + 10, cy + 26)], fill=stroke_col, width=3)
    elif symbol_type == "defrost_front":
        # Curved windshield outline with squiggly arrows
        draw.arc([(cx - 34, cy - 34), (cx + 34, cy + 26)], 190, 350, fill=stroke_col, width=4)
        draw.line([(cx - 32, cy + 22), (cx + 32, cy + 22)], fill=stroke_col, width=3)
        draw.line([(cx - 30, cy + 22), (cx - 34, cy - 10)], fill=stroke_col, width=3)
        draw.line([(cx + 30, cy + 22), (cx + 34, cy - 10)], fill=stroke_col, width=3)
        for xo in [-14, 0, 14]:
            draw.line([(cx + xo, cy + 16), (cx + xo, cy - 6)], fill=stroke_col, width=2)
    elif symbol_type == "child_locks":
        # Child seated or key lock
        draw.ellipse([(cx - 8, cy - 24), (cx + 8, cy - 8)], fill=fill_col)
        draw.arc([(cx - 22, cy - 4), (cx + 22, cy + 32)], 180, 360, fill=stroke_col, width=4)
        draw.text((cx - 18, cy + 8), "LOCK", fill=stroke_col)
    elif symbol_type == "glow_plug":
        # Diesel coil loops
        for xo in [-18, 0, 18]:
            draw.arc([(cx + xo - 10, cy - 18), (cx + xo + 10, cy + 18)], 180, 360, fill=stroke_col, width=4)
    elif symbol_type == "awd":
        draw.rectangle([(cx - 34, cy - 18), (cx + 34, cy + 18)], outline=stroke_col, width=3)
        draw.text((cx - 24, cy - 9), "AWD", fill=stroke_col)
    elif symbol_type == "od_off":
        draw.text((cx - 22, cy - 16), "O/D", fill=stroke_col)
        draw.text((cx - 20, cy + 2), "OFF", fill=stroke_col)
    elif symbol_type == "check_engine":
        # Silhouette of engine block
        draw.rectangle([(cx - 24, cy - 12), (cx + 20, cy + 20)], fill=fill_col)
        draw.rectangle([(cx - 34, cy - 4), (cx - 24, cy + 14)], fill=fill_col) # Left snout
        draw.rectangle([(cx + 20, cy + 2), (cx + 28, cy + 18)], fill=fill_col)  # Right step
        draw.polygon([(cx - 12, cy - 24), (cx + 8, cy - 24), (cx + 4, cy - 12), (cx - 8, cy - 12)], fill=fill_col)
        draw.line([(cx - 18, cy - 20), (cx - 28, cy - 12)], fill=stroke_col, width=4)
    elif symbol_type == "tpms":
        # Horseshoe tire with exclamation point
        draw.arc([(cx - 30, cy - 30), (cx + 30, cy + 20)], 130, 410, fill=stroke_col, width=4)
        draw.line([(cx - 26, cy + 24), (cx + 26, cy + 24)], fill=stroke_col, width=4) # Tread bottom
        draw.line([(cx, cy - 14), (cx, cy + 4)], fill=stroke_col, width=4)
        draw.ellipse([(cx - 3, cy + 10), (cx + 3, cy + 16)], fill=stroke_col)
    elif symbol_type == "defrost_rear":
        # Rectangular window with heat waves
        draw.rectangle([(cx - 30, cy - 20), (cx + 30, cy + 20)], outline=stroke_col, width=3)
        for xo in [-14, 0, 14]:
            draw.line([(cx + xo, cy + 12), (cx + xo, cy - 12)], fill=stroke_col, width=2)
    elif symbol_type == "powertrain":
        # Gear / cogwheel with exclamation point
        draw.ellipse([(cx - 24, cy - 24), (cx + 24, cy + 24)], outline=stroke_col, width=4)
        for ang in range(0, 360, 45):
            rad = math.radians(ang)
            gx = cx + 28 * math.cos(rad)
            gy = cy + 28 * math.sin(rad)
            draw.line([(cx + 20 * math.cos(rad), cy + 20 * math.sin(rad)), (gx, gy)], fill=stroke_col, width=4)
        draw.line([(cx, cy - 12), (cx, cy + 4)], fill=stroke_col, width=4)
        draw.ellipse([(cx - 3, cy + 10), (cx + 3, cy + 16)], fill=stroke_col)
    elif symbol_type == "esp":
        draw.text((cx - 20, cy - 18), "ESP", fill=stroke_col)
        draw.text((cx - 18, cy + 2), "BAS", fill=stroke_col)
    elif symbol_type == "low_fuel":
        # Gas pump icon
        draw.rectangle([(cx - 18, cy - 20), (cx + 10, cy + 24)], fill=fill_col)
        draw.rectangle([(cx - 12, cy - 14), (cx + 4, cy - 2)], fill=(10, 15, 20, 255))
        # Hose & nozzle
        draw.line([(cx + 10, cy - 12), (cx + 24, cy - 4), (cx + 24, cy + 14), (cx + 16, cy + 18)], fill=stroke_col, width=3)
    elif symbol_type == "brake_alert":
        # ( ! ) or ( P ) brake warning
        draw.arc([(cx - 34, cy - 34), (cx + 34, cy + 34)], 120, 240, fill=stroke_col, width=4)
        draw.arc([(cx - 34, cy - 34), (cx + 34, cy + 34)], 300, 420, fill=stroke_col, width=4)
        draw.ellipse([(cx - 24, cy - 24), (cx + 24, cy + 24)], outline=stroke_col, width=3)
        draw.line([(cx, cy - 14), (cx, cy + 4)], fill=stroke_col, width=4)
        draw.ellipse([(cx - 3, cy + 10), (cx + 3, cy + 16)], fill=stroke_col)
    elif symbol_type == "airbag":
        # Passenger silhouette with inflated ball in front
        draw.ellipse([(cx - 16, cy - 24), (cx - 2, cy - 10)], fill=fill_col) # Head
        draw.polygon([(cx - 22, cy - 6), (cx - 2, cy - 6), (cx - 6, cy + 24), (cx - 24, cy + 24)], fill=fill_col) # Torso
        draw.ellipse([(cx + 4, cy - 16), (cx + 32, cy + 12)], fill=fill_col) # Airbag sphere
    elif symbol_type == "open_doors":
        # Car top view with open doors
        draw.rectangle([(cx - 14, cy - 26), (cx + 14, cy + 26)], outline=stroke_col, width=3, fill=(20, 25, 30, 255))
        draw.line([(cx - 14, cy - 10), (cx - 32, cy - 18)], fill=stroke_col, width=3)
        draw.line([(cx + 14, cy - 10), (cx + 32, cy - 18)], fill=stroke_col, width=3)
    elif symbol_type == "oil_pressure":
        # Oil can with dripping drop
        draw.polygon([(cx - 26, cy + 18), (cx + 20, cy + 18), (cx + 26, cy - 4), (cx - 20, cy - 4)], fill=fill_col)
        draw.line([(cx - 20, cy - 4), (cx - 34, cy - 14)], fill=stroke_col, width=4) # Spout
        draw.ellipse([(cx - 36, cy - 20), (cx - 30, cy - 14)], fill=fill_col) # Drop
        draw.line([(cx + 14, cy - 4), (cx + 28, cy - 4), (cx + 28, cy + 12)], fill=stroke_col, width=3) # Handle
    elif symbol_type == "seat_belt":
        # Seated driver with diagonal belt strap
        draw.ellipse([(cx - 8, cy - 26), (cx + 8, cy - 10)], fill=fill_col)
        draw.polygon([(cx - 14, cy - 6), (cx + 14, cy - 6), (cx + 10, cy + 24), (cx - 10, cy + 24)], fill=fill_col)
        draw.line([(cx - 24, cy - 10), (cx + 18, cy + 26)], fill=(255, 255, 255, 255), width=4)
    elif symbol_type == "temp_warning":
        # Thermometer submerged in coolant fluid
        draw.line([(cx, cy - 26), (cx, cy + 8)], fill=stroke_col, width=6)
        draw.ellipse([(cx - 12, cy + 4), (cx + 12, cy + 28)], fill=fill_col)
        draw.arc([(cx - 28, cy + 18), (cx + 28, cy + 32)], 0, 180, fill=stroke_col, width=3) # Waves
    elif symbol_type == "battery_warning":
        # Battery block with + and - terminals
        draw.rectangle([(cx - 26, cy - 14), (cx + 26, cy + 22)], outline=stroke_col, width=4, fill=fill_col)
        draw.rectangle([(cx - 20, cy - 22), (cx - 10, cy - 14)], fill=stroke_col) # - term
        draw.rectangle([(cx + 10, cy - 22), (cx + 20, cy - 14)], fill=stroke_col) # + term
        draw.line([(cx - 18, cy + 4), (cx - 10, cy + 4)], fill=(10, 15, 20, 255), width=3)
        draw.line([(cx + 10, cy + 4), (cx + 18, cy + 4)], fill=(10, 15, 20, 255), width=3)
        draw.line([(cx + 14, cy), (cx + 14, cy + 8)], fill=(10, 15, 20, 255), width=3)
    elif symbol_type == "hazard_warning":
        # Nested double triangles
        draw.polygon([(cx, cy - 30), (cx - 30, cy + 24), (cx + 30, cy + 24)], outline=stroke_col, width=4)
        draw.polygon([(cx, cy - 18), (cx - 18, cy + 14), (cx + 18, cy + 14)], fill=fill_col)

    path = os.path.join(OUT_DIR, f"{name}.png")
    img.save(path, "PNG")
    return path

def generate_all_warning_icons():
    # 1. GREEN / BLUE OPERATIONAL INDICATORS
    generate_telltale_icon("telltale_turn_signals", (40, 230, 80), "turn_signals")
    generate_telltale_icon("telltale_high_beam", (40, 140, 255), "high_beam")
    generate_telltale_icon("telltale_fog_beams", (50, 220, 100), "fog_beams")
    generate_telltale_icon("telltale_cruise_control", (40, 230, 120), "cruise_control")

    # 2. YELLOW / AMBER CAUTION & FAULT WARNINGS
    generate_telltale_icon("telltale_abs", (255, 185, 20), "abs")
    generate_telltale_icon("telltale_warning_triangle", (255, 185, 20), "warning_triangle")
    generate_telltale_icon("telltale_slip_tcs", (255, 185, 20), "slip_tcs")
    generate_telltale_icon("telltale_defrost_front", (255, 185, 20), "defrost_front")
    generate_telltale_icon("telltale_child_locks", (255, 185, 20), "child_locks")
    generate_telltale_icon("telltale_glow_plug", (255, 185, 20), "glow_plug")
    generate_telltale_icon("telltale_awd", (255, 185, 20), "awd")
    generate_telltale_icon("telltale_od_off", (255, 185, 20), "od_off")
    generate_telltale_icon("telltale_check_engine", (255, 185, 20), "check_engine")
    generate_telltale_icon("telltale_tpms", (255, 185, 20), "tpms")
    generate_telltale_icon("telltale_defrost_rear", (255, 185, 20), "defrost_rear")
    generate_telltale_icon("telltale_powertrain", (255, 185, 20), "powertrain")
    generate_telltale_icon("telltale_esp", (255, 185, 20), "esp")
    generate_telltale_icon("telltale_low_fuel", (255, 185, 20), "low_fuel")

    # 3. RED CRITICAL SAFETY & EMERGENCY ALERTS
    generate_telltale_icon("telltale_brake_alert", (255, 40, 40), "brake_alert")
    generate_telltale_icon("telltale_airbag", (255, 40, 40), "airbag")
    generate_telltale_icon("telltale_open_doors", (255, 40, 40), "open_doors")
    generate_telltale_icon("telltale_oil_pressure", (255, 40, 40), "oil_pressure")
    generate_telltale_icon("telltale_seat_belt", (255, 40, 40), "seat_belt")
    generate_telltale_icon("telltale_temp_warning", (255, 40, 40), "temp_warning")
    generate_telltale_icon("telltale_battery_warning", (255, 40, 40), "battery_warning")
    generate_telltale_icon("telltale_hazard_warning", (255, 40, 40), "hazard_warning")

if __name__ == "__main__":
    generate_master_gauge_faceplate()
    generate_digital_mid_texture()
    generate_all_warning_icons()
    print("All cluster textures & telltale icons successfully created!")
