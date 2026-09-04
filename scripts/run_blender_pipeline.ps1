# ==============================================================================
# BLENDER 5.2 AUTOMATED VEHICLE ASSET PIPELINE RUNNER
# ==============================================================================

$blenderPath = "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
if (-not (Test-Path $blenderPath)) {
    Write-Error "Blender executable not found at: $blenderPath"
    exit 1
}

$scriptPath = Join-Path $PSScriptRoot "blender\generate_modular_gt3_car.py"
if (-not (Test-Path $scriptPath)) {
    Write-Error "Blender script not found at: $scriptPath"
    exit 1
}

$targetGlb = Join-Path $PSScriptRoot "..\public\models\exterior\modular_gt3_apex.glb"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " EXECUTING BLENDER 5.2 AUTOMATED 3D ASSET PIPELINE" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Blender: $blenderPath"
Write-Host "Script:  $scriptPath"
Write-Host "Target:  $targetGlb"
Write-Host ""

& $blenderPath --background --python $scriptPath

if ($LASTEXITCODE -ne 0) {
    Write-Error "Blender asset generation failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

if (Test-Path $targetGlb) {
    $item = Get-Item $targetGlb
    $kb = [math]::Round($item.Length / 1024, 2)
    Write-Host ""
    Write-Host "[SUCCESS] Generated Modular GT3 GLB: $targetGlb ($kb KB)" -ForegroundColor Green
} else {
    Write-Error "Output GLB file was not created: $targetGlb"
    exit 1
}
