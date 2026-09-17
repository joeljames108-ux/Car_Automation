import os
import json

ROOT = r"E:\Car_Automation\public\models\vehicles"
ARCHS = [
    "sedan", "hatchback", "coupe", "convertible", "roadster", "sports_car",
    "supercar", "hypercar", "grand_tourer", "muscle_car", "luxury_car",
    "limousine", "shooting_brake", "wagon", "crossover", "suv", "offroad_4x4",
    "pickup", "heavy_truck", "van", "mpv", "bus", "formula", "gt3"
]
ERAS = ["1970s", "1980s", "1990s", "2000s", "2010s", "2020s", "future"]

results = {}
for a in ARCHS:
    results[a] = {}
    for e in ERAS:
        p = os.path.join(ROOT, a, e, "vehicle.glb")
        if os.path.exists(p):
            sz = os.path.getsize(p)
            results[a][e] = f"{sz // 1024} KB"
        else:
            results[a][e] = "MISSING"

print(json.dumps(results, indent=2))
