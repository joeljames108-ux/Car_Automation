import os, sys
sys.path.append(r'e:\Car_Automation\scripts')
from validate_glb_production import validate_single_glb

eras = ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s', 'future']
names = [
    'Lamborghini Countach LP400',
    'Ferrari F40',
    'McLaren F1',
    'Porsche Carrera GT',
    'Porsche 918 Spyder',
    'Ferrari SF90 Stradale',
    'Porsche Mission X'
]

print('=' * 80)
print('BLOCK 1: SUPERCAR ARCHITECTURE QUALITY CONSISTENCY AUDIT (PHASES 2-8)')
print('=' * 80)
header = f"{'Era':<8} | {'Vehicle Name':<28} | {'Size (MB)':<10} | {'Triangles':<12} | {'Score':<8} | {'Grade'}"
print(header)
print('-' * 80)

all_passed = True
for era, name in zip(eras, names):
    path = f'e:/Car_Automation/public/models/vehicles/supercar/{era}/vehicle.glb'
    res = validate_single_glb(path, verbose=False)
    size_mb = res.get('size_kb', 0) / 1024
    tris = res.get('triangles', 0)
    score = res.get('score', 0)
    grade = res.get('grade', 'F')
    print(f"{era:<8} | {name:<28} | {size_mb:>8.2f} MB | {tris:>10,} | {score:>6.1f}% | Grade {grade}")
    if grade != 'A':
        all_passed = False

print('=' * 80)
print('All 7 Supercars Grade A Certified:', all_passed)
