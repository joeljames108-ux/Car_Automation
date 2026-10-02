# Mandatory UI Theme Directive: Light Theme with Soft Light Colors

## Core Directive
The project strictly prefers **Light Theme** as the default and permanent UI visual language.
**NEVER use bleached, washed-out, or plain pure `#ffffff` everywhere.**
A sterile white hospital-ward aesthetic with low-contrast gray lines is strictly forbidden.

## Harmonious Light Color Palette
Whenever building or styling any page, studio, dashboard, or component, use curated, harmonious soft light colors:

1. **Base Canvases & Surface Panels**:
   - Soft warm alabaster, linen, and warm cream: `#f6f4ee`, `#f8f6f0`, `#f1eee5`, `#efece2`
   - Subtle radial ambient glows: Soft warm amber (`rgba(245, 210, 150, 0.20)`), soft eucalyptus green (`rgba(180, 215, 190, 0.20)`), soft azure (`rgba(190, 220, 245, 0.20)`)

2. **Subsystems & Major Focus Containers**:
   - Soft eucalyptus and sage greens: `#eef4ec`, `#e3ede0`, `#d8e6d4`
   - Soft pearl titanium: `#f4f3ef`, `#eae7de`

3. **Inner Metric Tiles & Sub-Boxes (Never identical to parent!)**:
   - Power / Performance: Soft ice/sky blue (`bg-[#e8f1f8]`, border `#bcd5e8`, text `#0f172a`, accent `#0284c7`)
   - Weight / Efficiency: Soft eucalyptus sage (`bg-[#e8f3ea]`, border `#bddcc1`, text `#0f172a`, accent `#16a34a`)
   - Aerodynamics: Soft lavender/periwinkle (`bg-[#eceef8]`, border `#c5cbe8`, text `#0f172a`, accent `#6366f1`)
   - Financials / Economy: Soft warm amber/champagne (`bg-[#fbf4e6]`, border `#ebd7b5`, text `#0f172a`, accent `#d97706`)

4. **Progress Bars**:
   - Never use pale, barely visible gray lines on white!
   - Use distinctly tinted tracks (`#dbe5d8`, `#d8e2eb`, `#ebdcc4`, `#e2dacf`)
   - Use vibrant saturated fills with clear percentage readouts:
     - Design: Rose/Coral `#f43f5e`
     - Engineering: Sky/Cyan `#0284c7`
     - Testing: Purple/Violet `#8b5cf6`
     - Production: Emerald `#10b981`

5. **Typography & Readability**:
   - High contrast is mandatory.
   - Headers & titles: Bold deep charcoal/slate `#0f172a`, `#1e293b`
   - Secondary text: `#334155`, `#475569`
   - Meta/captions: `#64748b` with bold font-mono styling
   - Never use `#94a3b8` or `#cbd5e1` for body text on light backgrounds!

6. **Interactive Docks & Nav**:
   - Warm frosted pearl glass: `bg-[#f4f3ee]/95`, border `#d2cec3`
   - Active & hover states: Soft tint washes with saturated accent borders
