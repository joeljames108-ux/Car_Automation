# ==============================================================================
# BLENDER 5.2 AUTOMATED VEHICLE ASSET PIPELINE RUNNER
# ==============================================================================
param (
    [string]$Target = "all" # Options: all, car, engine, chassis
)

$blenderPath = "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
if (-not (Test-Path $blenderPath)) {
    Write-Error "Blender executable not found at: $blenderPath"
    exit 1
}

$scripts = @()

if ($Target -eq "all" -or $Target -eq "car") {
    $scripts += @{
        Name = "Modular GT3 Apex Competition Car"
        Script = Join-Path $PSScriptRoot "blender\generate_modular_gt3_car.py"
        Target = Join-Path $PSScriptRoot "..\public\models\exterior\modular_gt3_apex.glb"
    }
}

if ($Target -eq "all" -or $Target -eq "engine") {
    $scripts += @{
        Name = "V12 Twin-Turbo Firing Racing Engine"
        Script = Join-Path $PSScriptRoot "blender\generate_realistic_engine.py"
        Target = Join-Path $PSScriptRoot "..\public\models\engines\v12_racing_engine_complete.glb"
    }
}

if ($Target -eq "all" -or $Target -eq "chassis") {
    $scripts += @{
        Name = "Carbon Monocoque & Tubular GT3 Chassis"
        Script = Join-Path $PSScriptRoot "blender\generate_detailed_chassis.py"
        Target = Join-Path $PSScriptRoot "..\public\models\chassis\gt3_race_chassis_01.glb"
    }
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " EXECUTING BLENDER 5.2 AUTOMATED 3D ASSET PIPELINE (Target: $Target)" -ForegroundColor Cyan
Write-Host " Blender: $blenderPath" -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Cyan

foreach ($item in $scripts) {
    Write-Host "`n>>> Processing: $($item.Name)" -ForegroundColor Yellow
    Write-Host "    Script: $($item.Script)"
    Write-Host "    Target: $($item.Target)"
    
    if (-not (Test-Path $item.Script)) {
        Write-Error "Blender script not found: $($item.Script)"
        exit 1
    }

    & $blenderPath --background --python $item.Script

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Blender asset generation failed for $($item.Name) with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }

    if (Test-Path $item.Target) {
        $f = Get-Item $item.Target
        $kb = [math]::Round($f.Length / 1024, 2)
        Write-Host "    [SUCCESS] Generated: $($item.Target) ($kb KB)" -ForegroundColor Green
    } else {
        Write-Error "Expected target file was not created: $($item.Target)"
        exit 1
    }
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [ALL ASSETS GENERATED & VERIFIED SUCCESSFULLY]" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan
