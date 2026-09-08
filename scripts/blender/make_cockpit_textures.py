"""
Generates high-resolution photographic texture maps for automotive cockpit displays,
dials, steering emblem, trim veneers (walnut, carbon, perforated leather), and center console.
"""

import os
import math
import random
from PIL import Image, ImageDraw, ImageFont

def generate_textures(out_dir="public/models/interior/textures"):
    os.makedirs(out_dir, exist_ok=True)
    random.seed(42)

    # ========================================================================
    # 1. BOOKMATCHED AMERICAN WALNUT WOOD GRAIN TEXTURE (1024x256)
    # ========================================================================
    print("Generating walnut wood grain texture...")
    ww, wh = 1024, 256
    img_wood = Image.new("RGBA", (ww, wh), (46, 26, 14, 255))
    draw_w = ImageDraw.Draw(img_wood)

    # Generate multi-layered organic wood grain fibers and growth rings
    for y in range(wh):
        # Base amber/chocolate color gradient
        factor = math.sin(y * 0.04) * 0.2 + 0.5
        r_base = int(58 * factor + 42 * (1 - factor))
        g_base = int(32 * factor + 22 * (1 - factor))
        b_base = int(18 * factor + 12 * (1 - factor))
        draw_w.line([(0, y), (ww, y)], fill=(r_base, g_base, b_base, 255))

    # Organic growth ring waves
    for ring_idx in range(28):
        y_center = (ring_idx * 10) + math.sin(ring_idx * 1.3) * 6
        freq1 = 0.008 + (ring_idx % 5) * 0.003
        freq2 = 0.022 + (ring_idx % 3) * 0.007
        amp1 = 6.0 + (ring_idx % 4) * 3.0
        amp2 = 3.0

        pts = []
        for x in range(0, ww, 4):
            y_offset = math.sin(x * freq1) * amp1 + math.cos(x * freq2) * amp2
            pts.append((x, int(y_center + y_offset)))

        darkness = 0.65 if (ring_idx % 3 == 0) else 0.82
        w_col = (int(36 * darkness), int(20 * darkness), int(11 * darkness), 220)
        draw_w.line(pts, fill=w_col, width=2 if (ring_idx % 3 == 0) else 1)

    # Fine micro-pore scratches / varnish depth
    for _ in range(800):
        px = random.randint(0, ww - 40)
        py = random.randint(0, wh - 1)
        length = random.randint(8, 35)
        p_col = (25, 14, 8, 140) if random.random() > 0.3 else (75, 45, 25, 80)
        draw_w.line([(px, py), (px + length, py)], fill=p_col, width=1)

    path_wood = os.path.join(out_dir, "wood_walnut_grain.png")
    img_wood.save(path_wood)
    print(f"Saved: {path_wood}")

    # ========================================================================
    # 2. 3K 2x2 TWILL CARBON FIBER WEAVE TEXTURE (512x512)
    # ========================================================================
    print("Generating 2x2 twill carbon fiber texture...")
    cw_dim = 512
    img_carbon = Image.new("RGBA", (cw_dim, cw_dim), (22, 22, 26, 255))
    draw_c = ImageDraw.Draw(img_carbon)

    cell_sz = 16
    for gy in range(0, cw_dim, cell_sz):
        for gx in range(0, cw_dim, cell_sz):
            cell_type = ((gx // cell_sz) + (gy // cell_sz)) % 4
            # 2x2 twill diagonal pattern
            if cell_type in (0, 1):
                # Horizontal carbon fiber band with specular highlight
                base_c = 42 if cell_type == 0 else 32
                for ly in range(0, cell_sz, 2):
                    c_val = base_c + int(math.sin(ly / cell_sz * math.pi) * 16)
                    draw_c.line([(gx, gy + ly), (gx + cell_sz - 1, gy + ly)], fill=(c_val, c_val, c_val + 2, 255))
            else:
                # Vertical carbon fiber band with cross specular highlight
                base_c = 26 if cell_type == 2 else 18
                for lx in range(0, cell_sz, 2):
                    c_val = base_c + int(math.sin(lx / cell_sz * math.pi) * 14)
                    draw_c.line([(gx + lx, gy), (gx + lx, gy + cell_sz - 1)], fill=(c_val, c_val, c_val + 2, 255))

    path_carbon = os.path.join(out_dir, "carbon_twill_weave.png")
    img_carbon.save(path_carbon)
    print(f"Saved: {path_carbon}")

    # ========================================================================
    # 3. PERFORATED SPORT LEATHER TEXTURE (512x512)
    # ========================================================================
    print("Generating perforated sport leather texture...")
    pl_dim = 512
    img_perf = Image.new("RGBA", (pl_dim, pl_dim), (28, 29, 34, 255))
    draw_p = ImageDraw.Draw(img_perf)

    # Staggered hexagonal ventilation holes
    hole_pitch = 18
    hole_radius = 2.4
    row = 0
    for hy in range(8, pl_dim, hole_pitch):
        offset_x = (hole_pitch // 2) if (row % 2 == 1) else 0
        for hx in range(8 + offset_x, pl_dim, hole_pitch):
            # Hole shadow (dark core)
            draw_p.ellipse([hx - hole_radius, hy - hole_radius, hx + hole_radius, hy + hole_radius], fill=(8, 8, 10, 255))
            # Subtle edge highlight ring (embossed rim)
            draw_p.arc([hx - hole_radius - 1, hy - hole_radius - 1, hx + hole_radius + 1, hy + hole_radius + 1], start=45, end=225, fill=(50, 52, 60, 180), width=1)
        row += 1

    path_perf = os.path.join(out_dir, "leather_perforated_pattern.png")
    img_perf.save(path_perf)
    print(f"Saved: {path_perf}")

    # ========================================================================
    # 4. ACOUSTIC BURMESTER SPEAKER GRILLE TEXTURE (512x512)
    # ========================================================================
    print("Generating acoustic speaker grille texture...")
    gw, gh = 512, 512
    img_spk = Image.new("RGBA", (gw, gh), (210, 214, 222, 255))
    draw_spk = ImageDraw.Draw(img_spk)
    gcx, gcy = 256, 256

    # Outer brushed aluminum polished ring
    draw_spk.ellipse([10, 10, gw - 10, gh - 10], outline=(245, 248, 252, 255), width=8)
    draw_spk.ellipse([18, 18, gw - 18, gh - 18], outline=(160, 168, 180, 255), width=4)
    draw_spk.ellipse([24, 24, gw - 24, gh - 24], fill=(195, 200, 210, 255))

    # Concentric acoustic micro-hole spiral pattern
    for r_ring in range(35, 225, 14):
        num_holes = int(2.0 * math.pi * r_ring / 12.0)
        for h_i in range(num_holes):
            ang = (2.0 * math.pi * h_i) / num_holes + (r_ring * 0.15)
            hx = gcx + r_ring * math.cos(ang)
            hy = gcy + r_ring * math.sin(ang)
            hr = 2.2
            draw_spk.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], fill=(25, 28, 35, 255))

    # Center laser-etched apex acoustic logo
    draw_spk.ellipse([gcx - 28, gcy - 28, gcx + 28, gcy + 28], fill=(225, 230, 240, 255), outline=(140, 150, 165, 255), width=2)
    draw_spk.text((gcx - 22, gcy - 8), "APEX HI-FI", fill=(60, 68, 80, 255))

    path_spk = os.path.join(out_dir, "speaker_grille_acoustic.png")
    img_spk.save(path_spk)
    print(f"Saved: {path_spk}")

    # ========================================================================
    # 5. INFOTAINMENT NAVIGATION DISPLAY (1024x640)
    # ========================================================================
    print("Generating infotainment navigation display...")
    w, h = 1024, 640
    img_nav = Image.new("RGBA", (w, h), (10, 14, 24, 255))
    draw_nav = ImageDraw.Draw(img_nav)

    # Grid roads and secondary street network
    for y in range(70, h, 55):
        draw_nav.line([(0, y), (w, y)], fill=(18, 28, 44, 255), width=2)
    for x in range(0, w, 70):
        draw_nav.line([(x, 56), (x, h)], fill=(18, 28, 44, 255), width=2)

    # Major Arterials & Highways
    draw_nav.line([(40, h), (360, 240), (680, 240), (w, 120)], fill=(32, 45, 68, 255), width=22)
    draw_nav.line([(40, h), (360, 240), (680, 240), (w, 120)], fill=(45, 62, 92, 255), width=16)

    # Glowing Route Trajectory (Cyan Neon Core)
    pts = [(160, 560), (300, 390), (460, 390), (600, 240), (760, 240), (910, 130)]
    for glow_w, alpha in [(32, 40), (20, 80), (12, 160), (6, 255)]:
        draw_nav.line(pts, fill=(6, 182, 212, alpha), width=glow_w)
    draw_nav.line(pts, fill=(240, 249, 255, 255), width=3) # white core highlight

    # Current Position GPS Pulse Ring & Arrow
    ax, ay = 160, 560
    draw_nav.ellipse([ax - 22, ay - 22, ax + 22, ay + 22], fill=(6, 182, 212, 80), outline=(56, 189, 248, 255), width=3)
    draw_nav.polygon([(ax, ay - 15), (ax + 11, ay + 11), (ax, ay + 5), (ax - 11, ay + 11)], fill=(255, 255, 255, 255))

    # Top Status Bar
    draw_nav.rectangle([0, 0, w, 52], fill=(15, 23, 42, 255))
    draw_nav.line([(0, 52), (w, 52)], fill=(56, 189, 248, 140), width=2)
    draw_nav.text((28, 16), "APEX AUTOMATION OS  v5.2", fill=(148, 163, 184, 255))
    draw_nav.text((450, 16), "72°F  AUTO CLIMATE", fill=(203, 213, 225, 255))
    draw_nav.text((780, 16), "5G LTE", fill=(56, 189, 248, 255))
    draw_nav.text((880, 16), "12:45 PM", fill=(241, 245, 249, 255))

    # Turn-by-Turn Guidance Card
    draw_nav.rounded_rectangle([28, 75, 430, 195], radius=16, fill=(15, 23, 42, 245), outline=(56, 189, 248, 160), width=2)
    draw_nav.text((48, 100), "➔", fill=(56, 189, 248, 255))
    draw_nav.text((86, 95), "In 200m", fill=(56, 189, 248, 255))
    draw_nav.text((86, 122), "Turn Right onto Apex Grand Boulevard", fill=(241, 245, 249, 255))
    draw_nav.text((86, 150), "Destination: Apex Proving Grounds (4.2 mi)", fill=(148, 163, 184, 255))

    # Circular Speed Limit 65 Badge
    draw_nav.ellipse([355, 90, 415, 150], fill=(255, 255, 255, 255), outline=(220, 38, 38, 255), width=6)
    draw_nav.text((372, 108), "65", fill=(15, 23, 42, 255))

    # Media Player Widget (Bottom Left)
    draw_nav.rounded_rectangle([28, 485, 410, 615], radius=14, fill=(15, 23, 42, 245), outline=(99, 102, 241, 150), width=2)
    draw_nav.rounded_rectangle([44, 500, 140, 598], radius=8, fill=(79, 70, 229, 255))
    draw_nav.text((82, 536), "♫", fill=(255, 255, 255, 255))
    draw_nav.text((155, 512), "Cyberdrive Overdrive", fill=(255, 255, 255, 255))
    draw_nav.text((155, 540), "Apex Synthetics • Lossless 96kHz", fill=(148, 163, 184, 255))
    for i in range(16):
        bh = 12 + math.sin(i * 0.9) * 18 + 12
        draw_nav.rectangle([155 + i * 14, 590 - bh, 163 + i * 14, 590], fill=(129, 140, 248, 255))

    # Trip Telemetry Widget (Bottom Right)
    draw_nav.rounded_rectangle([720, 485, 995, 615], radius=14, fill=(15, 23, 42, 245), outline=(16, 185, 129, 150), width=2)
    draw_nav.text((740, 502), "TRIP TELEMETRY", fill=(16, 185, 129, 255))
    draw_nav.text((740, 530), "Range: 385 mi", fill=(241, 245, 249, 255))
    draw_nav.text((740, 554), "Efficiency: 3.4 mi/kWh", fill=(148, 163, 184, 255))
    draw_nav.text((740, 578), "ETA: 1:12 PM  (27 min)", fill=(203, 213, 225, 255))

    path_nav = os.path.join(out_dir, "infotainment_navigation_ui.png")
    img_nav.save(path_nav)
    print(f"Saved: {path_nav}")

    # ========================================================================
    # 6. INSTRUMENT CLUSTER CENTER MID DISPLAY (512x256)
    # ========================================================================
    print("Generating cluster center MID display...")
    cw, ch = 512, 256
    img_mid = Image.new("RGBA", (cw, ch), (6, 8, 14, 255))
    draw_m = ImageDraw.Draw(img_mid)

    # Subtle Horizon Grid Lines
    for gy in range(35, ch, 28):
        draw_m.line([(0, gy), (cw, gy)], fill=(14, 22, 36, 200), width=1)

    # ADAS Perspective Lane Guidelines
    draw_m.line([(180, ch), (230, 110)], fill=(56, 189, 248, 230), width=3)
    draw_m.line([(332, ch), (282, 110)], fill=(56, 189, 248, 230), width=3)
    # Ego Vehicle 3D Silhouette
    draw_m.rounded_rectangle([(236, 160), (276, 225)], radius=6, fill=(15, 23, 42, 255), outline=(56, 189, 248, 255), width=2)
    draw_m.rectangle([(242, 170), (270, 188)], fill=(56, 189, 248, 180)) # windshield

    # Drive Mode Badge
    draw_m.rounded_rectangle([(216, 12), (296, 36)], radius=6, fill=(239, 68, 68, 45), outline=(239, 68, 68, 220), width=2)
    draw_m.text((230, 16), "SPORT", fill=(239, 68, 68, 255))

    # Gear Readout
    draw_m.rounded_rectangle([(230, 42), (282, 72)], radius=4, fill=(245, 158, 11, 45), outline=(245, 158, 11, 220), width=2)
    draw_m.text((246, 46), "D4", fill=(245, 158, 11, 255))

    # Digital Speed Readout
    draw_m.text((236, 78), "88", fill=(255, 255, 255, 255))
    draw_m.text((242, 112), "MPH", fill=(148, 163, 184, 255))

    # Bottom Telemetry Bar
    draw_m.text((20, ch - 22), "ODO 14,285 MI", fill=(148, 163, 184, 255))
    draw_m.text((210, ch - 22), "AMBIENT 72°F", fill=(148, 163, 184, 255))
    draw_m.text((390, ch - 22), "RANGE 385 MI", fill=(16, 185, 129, 255))

    path_mid = os.path.join(out_dir, "cluster_center_mid.png")
    img_mid.save(path_mid)
    print(f"Saved: {path_mid}")

    # ========================================================================
    # 7. CIRCULAR SPEEDOMETER GAUGE FACE (512x512)
    # ========================================================================
    print("Generating speedometer gauge face...")
    sw, sh = 512, 512
    img_spd = Image.new("RGBA", (sw, sh), (8, 10, 16, 255))
    draw_s = ImageDraw.Draw(img_spd)
    scx, scy, sr = 256, 256, 230

    # Outer Bezel Gradient Rings
    draw_s.ellipse([scx - sr, scy - sr, scx + sr, scy + sr], outline=(35, 48, 68, 255), width=8)
    draw_s.ellipse([scx - sr + 14, scy - sr + 14, scx + sr - 14, scy + sr - 14], outline=(56, 189, 248, 120), width=3)
    draw_s.ellipse([scx - sr + 60, scy - sr + 60, scx + sr - 60, scy + sr - 60], outline=(15, 23, 42, 255), width=2)

    # Radial Ticks (140 to 400 degrees)
    for i in range(17): # 0 to 160 MPH in steps of 10
        spd_val = i * 10
        deg = 140 + (i / 16.0) * 260
        rad = math.radians(deg)
        x1 = scx + (sr - 28) * math.cos(rad)
        y1 = scy + (sr - 28) * math.sin(rad)
        x2 = scx + (sr - 6) * math.cos(rad)
        y2 = scy + (sr - 6) * math.sin(rad)
        is_major = (i % 2 == 0)
        draw_s.line([(x1, y1), (x2, y2)], fill=(241, 245, 249, 255) if is_major else (148, 163, 184, 200), width=4 if is_major else 2)
        if is_major:
            xt = scx + (sr - 54) * math.cos(rad) - 12
            yt = scy + (sr - 54) * math.sin(rad) - 8
            draw_s.text((xt, yt), str(spd_val), fill=(241, 245, 249, 255))

    draw_s.text((scx - 38, scy + 80), "SPEEDOMETER", fill=(148, 163, 184, 255))
    draw_s.text((scx - 18, scy + 105), "MPH", fill=(56, 189, 248, 255))

    path_spd = os.path.join(out_dir, "gauge_speedo_face.png")
    img_spd.save(path_spd)
    print(f"Saved: {path_spd}")

    # ========================================================================
    # 8. CIRCULAR TACHOMETER GAUGE FACE (512x512)
    # ========================================================================
    print("Generating tachometer gauge face...")
    img_tch = Image.new("RGBA", (sw, sh), (8, 10, 16, 255))
    draw_t = ImageDraw.Draw(img_tch)

    draw_t.ellipse([scx - sr, scy - sr, scx + sr, scy + sr], outline=(35, 48, 68, 255), width=8)
    draw_t.ellipse([scx - sr + 14, scy - sr + 14, scx + sr - 14, scy + sr - 14], outline=(239, 68, 68, 120), width=3)
    draw_t.ellipse([scx - sr + 60, scy - sr + 60, scx + sr - 60, scy + sr - 60], outline=(15, 23, 42, 255), width=2)

    for i in range(17): # 0 to 8 in steps of 0.5
        rpm_val = i * 0.5
        deg = 140 + (i / 16.0) * 260
        rad = math.radians(deg)
        x1 = scx + (sr - 28) * math.cos(rad)
        y1 = scy + (sr - 28) * math.sin(rad)
        x2 = scx + (sr - 6) * math.cos(rad)
        y2 = scy + (sr - 6) * math.sin(rad)
        is_major = (i % 2 == 0)
        is_redline = (rpm_val >= 6.5)
        col = (239, 68, 68, 255) if is_redline else (241, 245, 249, 255)
        draw_t.line([(x1, y1), (x2, y2)], fill=col, width=5 if is_major else 2)
        if is_major:
            xt = scx + (sr - 54) * math.cos(rad) - 8
            yt = scy + (sr - 54) * math.sin(rad) - 8
            draw_t.text((xt, yt), str(int(rpm_val)), fill=col)

    draw_t.text((scx - 34, scy + 80), "TACHOMETER", fill=(148, 163, 184, 255))
    draw_t.text((scx - 36, scy + 105), "x1000 RPM", fill=(239, 68, 68, 255))

    path_tch = os.path.join(out_dir, "gauge_tacho_face.png")
    img_tch.save(path_tch)
    print(f"Saved: {path_tch}")

    # ========================================================================
    # 9. STEERING WHEEL HERALDIC CREST BADGE (256x256)
    # ========================================================================
    print("Generating steering crest badge...")
    bw, bh = 256, 256
    img_badge = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    draw_b = ImageDraw.Draw(img_badge)

    shield_pts = [(128, 22), (208, 46), (194, 168), (128, 236), (62, 168), (48, 46)]
    draw_b.polygon(shield_pts, fill=(217, 119, 6, 255), outline=(251, 191, 36, 255))
    inner_pts = [(128, 36), (194, 56), (182, 158), (128, 220), (74, 158), (62, 56)]
    draw_b.polygon(inner_pts, fill=(180, 83, 9, 255), outline=(254, 240, 138, 255))

    draw_b.line([(128, 52), (128, 198)], fill=(254, 240, 138, 255), width=6)
    draw_b.line([(80, 112), (176, 112)], fill=(254, 240, 138, 255), width=6)
    draw_b.polygon([(128, 42), (150, 75), (106, 75)], fill=(254, 240, 138, 255))

    draw_b.ellipse([10, 10, 246, 246], outline=(241, 245, 249, 255), width=8)
    draw_b.ellipse([18, 18, 238, 238], outline=(148, 163, 184, 190), width=3)

    path_badge = os.path.join(out_dir, "steering_crest_badge.png")
    img_badge.save(path_badge)
    print(f"Saved: {path_badge}")

    # ========================================================================
    # 10. PRND GEAR SELECTOR INDICATOR PANEL (128x256)
    # ========================================================================
    print("Generating PRND shifter panel...")
    pw, ph = 128, 256
    img_prnd = Image.new("RGBA", (pw, ph), (10, 10, 14, 255))
    draw_p = ImageDraw.Draw(img_prnd)

    gears = [("P", 35, False), ("R", 75, False), ("N", 115, False), ("D", 155, True), ("S", 195, False)]
    for letter, y_pos, active in gears:
        if active:
            draw_p.rounded_rectangle([18, y_pos - 14, 110, y_pos + 18], radius=6, fill=(6, 182, 212, 70), outline=(6, 182, 212, 255), width=2)
            draw_p.text((55, y_pos - 6), letter, fill=(255, 255, 255, 255))
        else:
            draw_p.text((55, y_pos - 6), letter, fill=(110, 126, 148, 255))

    path_prnd = os.path.join(out_dir, "shifter_prnd_panel.png")
    img_prnd.save(path_prnd)
    print(f"Saved: {path_prnd}")

if __name__ == "__main__":
    generate_textures()
