import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'fs';

// Files to process
const files = [
  // Already identified from grep
  ...`AnimMasterComponentCatalog.tsx
NeonCircuitTelemetry.tsx
NeonComparisonDeltaTile.tsx
NeonDonutHorseshoe.tsx
NeonHorizonBadge.tsx
NeonHorizonButton.tsx
NeonHorizonDataCard.tsx
NeonHorizonGlassPanel.tsx
NeonHorizonModal.tsx
NeonHorizonProgressRing.tsx
NeonHorizonSelect.tsx
NeonHorizonSlider.tsx
NeonHorizonTabs.tsx
NeonHorizonToggle.tsx
NeonHorizonTooltip.tsx
NeonHorizonZoomableCard.tsx
NeonLapTimesPanel.tsx
NeonPerformanceKPIGrid.tsx
NeonStageLoadingSkeleton.tsx`.split('\n').map(f => `src/components/ui1/design/${f}`),
  ...`NeonHorizonContentViewport.tsx
NeonHorizonDock.tsx
NeonHorizonHeader.tsx
NeonHorizonOrbitalStageNavigator.tsx
NeonHorizonShell.tsx
NeonHorizonSidebar.tsx
NeonHorizonStatRail.tsx`.split('\n').map(f => `src/components/ui1/layout/${f}`),
  ...`CinematicBlueprintXRayOverlay.tsx
CinematicEngineeringHUD.tsx
CinematicGlobeBootSequence.tsx
MasterSpatialNavGlobe.tsx
SpatialConstellationMap.tsx`.split('\n').map(f => `src/components/ui1/spatial/${f}`),
  ...`NeonArcGauge.tsx
ApexAIFloatingButton.tsx
CFDVisualizationToggle.tsx
NeonHorizonHeroHUD.tsx
NeonRadialDial.tsx
SimulationProgressPanel.tsx
VehicleStatsPanel.tsx`.split('\n').map(f => `src/components/ui1/hud/${f}`),
  ...`HorizonTelemetryHUDConsole.tsx`.split('\n').map(f => `src/components/ui1/${f}`),
  ...`NeonHorizonAlertBanner.tsx
NeonHorizonCommandPalette.tsx
NeonHorizonContextMenu.tsx
NeonHorizonSaveDialog.tsx`.split('\n').map(f => `src/components/ui1/interactive/${f}`),
];

// Slate to amber conversions (Tailwind classes)
const slateToAmber = {
  'bg-slate-950': 'bg-amber-950',
  'bg-slate-900/80': 'bg-amber-950/80',
  'bg-slate-900/90': 'bg-amber-950/90',
  'bg-slate-900': 'bg-amber-900/40',
  'bg-slate-800': 'bg-amber-900/30',
  'bg-slate-800/50': 'bg-amber-900/25',
  'bg-slate-800/80': 'bg-amber-900/35',
  'text-slate-400': 'text-amber-300/60',
  'text-slate-300': 'text-amber-200/70',
  'text-slate-200': 'text-amber-100',
  'text-slate-500': 'text-amber-400/50',
  'border-slate-800': 'border-amber-800/25',
  'border-slate-800/50': 'border-amber-800/20',
  'border-slate-700': 'border-amber-800/30',
  'border-slate-700/50': 'border-amber-800/20',
  'hover:bg-slate-800': 'hover:bg-amber-900/30',
  'hover:bg-slate-700': 'hover:bg-amber-800/25',
  'hover:text-slate-300': 'hover:text-amber-200',
  'hover:text-slate-200': 'hover:text-amber-100',
  'hover:border-slate-700': 'hover:border-amber-800/30',
  'from-slate-900': 'from-amber-950',
  'from-slate-800': 'from-amber-900/40',
  'to-slate-900': 'to-amber-950',
  'to-slate-800': 'to-amber-900/40',
  'ring-slate-700': 'ring-amber-800/30',
  'shadow-slate-900/50': 'shadow-amber-900/30',
};

let totalChanges = 0;
let filesChanged = 0;

for (const file of files) {
  try {
    const fullPath = file.startsWith('src/') ? file : `src/${file}`;
    let content = readFileSync(fullPath, 'utf8');
    const original = content;
    
    for (const [from, to] of Object.entries(slateToAmber)) {
      while (content.includes(from)) {
        content = content.replace(from, to);
        totalChanges++;
      }
    }
    
    if (content !== original) {
      writeFileSync(fullPath, content, 'utf8');
      filesChanged++;
    }
  } catch (e) {
    // File doesn't exist, skip
  }
}

console.log(`Polished ${filesChanged} files with ${totalChanges} slate→amber replacements`);
