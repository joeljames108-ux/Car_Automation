import re

with open('src/sim/vehicleArchitecture/vehicleArchitectureMatrix.ts', 'r', encoding='utf-8') as f:
    text = f.read()

targets = [
    'shooting_brake', 'crossover', 'suv', 'offroad_4x4',
    'pickup_truck', 'roadster', 'sports_car', 'muscle_car',
    'grand_tourer', 'luxury_car', 'limousine', 'van', 'mpv'
]

for target in targets:
    m = re.search(r'\n  ' + target + r':\s*\{([\s\S]*?)(?=\n  \w+:\s*\{|\n\};|\Z)', text)
    if m:
        block = m.group(1)
        eras = re.findall(r'\"(1970s|1980s|1990s|2000s|2010s|2020s|future)\":\s*\{[\s\S]*?referenceVehicle:\s*\"([^\"]+)\"[\s\S]*?glbPath:\s*\"([^\"]+)\"', block)
        print(f'=== {target.upper()} ===')
        for era, ref, glb in eras:
            print(f'  [{era}] {ref} -> {glb}')
