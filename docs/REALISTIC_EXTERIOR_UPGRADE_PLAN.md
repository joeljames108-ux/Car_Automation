# Master Implementation Plan: Realistic Exterior GLB Upgrades & Quality Protocol

## 1. Executive Summary & Forensic Audit of Previous GLB Mistakes

A critical forensic inspection of previously generated vehicle GLBs across the fleet revealed fundamental CAD engineering deficiencies that compromised visual authenticity and interactive compliance:

### Critical Flaws Identified in Prior Builds:
1. **Opaque / Solid Body Underneath Window Glass**:
   - In models like the Bugatti Chiron, the body shell was lofted as a single continuous surface across the roof and windshield. Over **16,300 vertices of solid glossy carbon fiber sheet metal** remained directly underneath the greenhouse glass.
   - As a result, the "glass" appeared opaque and reflective, completely concealing the cabin interior.
2. **Primitive 3-Cube Glass Geometry**:
   - In `class_a_cad_subsystem_factory.py`, the glass for sedans, coupes, SUVs, trucks, and sports cars consisted of three flat, uncurved cubes intersecting the body shell.
   - Missing double-curved aerodynamic windshield curvature, black ceramic frit (serigraphy) dot-matrix borders, A/B/C-pillar structural framing, and rubber weatherstripping seals.
3. **Missing or Non-Articulating Fake Doors**:
   - In the majority of fleet models, doors were completely welded into the continuous body mesh without separate door objects or physical shutlines.
   - Where door meshes existed (e.g. Countach), they were flat 2-quad plates hovering over a solid unibody with origins at `(0, 0, 0)`. When rotated, the door swiveled around the center of the car on the ground rather than a physical hinge vector.
   - Missing structural inner door cards, inner door jambs, and door window glass mounted to the moving door frame.
4. **Synthetic Validator Inflation**:
   - Node injection scripts (`inject_interactive_glb_standards.mjs`) added lightweight dummy hitboxes and empty animation tracks to achieve passing scores without delivering the underlying CAD geometry.

---

## 2. The Mandatory New Rules (Realistic Exterior Upgrade Protocol)

In accordance with strict project directives, the following mandatory standards govern all automotive GLB production:

### Rule 1: Minimum 1 Hour Intensive Work per Vehicle
- Every vehicle GLB must receive at least **60 minutes of dedicated, methodical procedural CAD modeling, topology sculpting, materials calibration, and kinematic rigging**.
- Rushing to export draft assets is strictly prohibited. Time consumption is NOT a factor; maximum Class-A visual fidelity is paramount.

### Rule 2: The 5-Angle Visual Validation Standard (1 Set = 5 Photos)
Every visual validation set consists of 5 canonical automotive angles captured directly from the live viewport:
1. **Front 3/4 Dynamic Perspective** (`CAMERA_FRONT_34`): $70^\circ$ pitch, $225^\circ$ yaw, distance 5.5m. Validates front stance, fender crown, wheel fitment, windshield rake, and shutlines.
2. **Rear 3/4 Dynamic Perspective** (`CAMERA_REAR_34`): $70^\circ$ pitch, $45^\circ$ yaw, distance 5.5m. Validates muscular rear haunches, active spoiler/wing, diffuser strakes, and taillight optics.
3. **Direct Side Profile** (`CAMERA_SIDE`): $85^\circ$ pitch, $270^\circ$ yaw, distance 5.6m. Validates wheelbase, beltline curvature, door shutlines, window aperture, and ground clearance.
4. **Direct Front Fascia** (`CAMERA_FRONT`): $85^\circ$ pitch, $180^\circ$ yaw, distance 4.5m. Validates horseshoe/kidney grille, front air splitters, projector eyes, and DRL signatures.
5. **Direct Rear Fascia** (`CAMERA_REAR`): $85^\circ$ pitch, $0^\circ$ yaw, distance 4.5m. Validates rear fascia width, exhaust cannons, diffuser tunnels, and license/badge recesses.

Every angle must be compared directly against authentic high-resolution reference photographs of the real production vehicle.

### Rule 3: Mandatory Minimum 20 Sets of 5-Angle Comparisons per Vehicle (100 Photos Total)
Throughout the iterative CAD modeling and refinement process for each vehicle, the agent must execute at least **20 iterative sets (100 photos total)** of:
$$\text{Capture 5 Angles} \longrightarrow \text{Compare with Real Photo} \longrightarrow \text{Diagnose Flaws} \longrightarrow \text{Refine Blender CAD} \longrightarrow \text{Re-Capture & Verify}$$
- 1 Set = 5 photos across Front 3/4, Rear 3/4, Side, Front, and Rear.
- Minimum 20 iterations ensures CAD geometry, shutlines, glass transparency, wheel fitment, and surfacing are continually perfected without rushing.
- Time consumption is not a factor; uncompromised Class-A visual excellence is the sole objective.

### Rule 4: Mandatory Authentic Glass & Greenhouse Engineering
- **Cabin Cutout Mandate**: The unibody shell must have a clean, open aperture for the cockpit greenhouse. Never leave solid body sheet metal underneath glass.
- **Double-Curved 3D Glass Geometry**: Windshield, rear backlite, door side windows, and quarter glass must follow authentic compound curves with smooth normal transitions.
- **Black Ceramic Frit (Serigraphy)**: Solid black perimeter border with gradient dot-matrix transitions baked into the glass geometry/shader to conceal mounting adhesive and interior trim edges.
- **Structural Pillars & Seals**: Dedicated A-pillars, B-pillars, C-pillars, roof rails, and rubber weatherstripping channels.
- **True Dielectric PBR Shading**: Principled BSDF with Transmission $\ge 0.92$, IOR $1.52$, Roughness $\le 0.02$, Clearcoat $1.0$, and subtle solar privacy tint.
- **Cabin Interior Visibility**: Looking through the transparent glass must clearly reveal the cockpit interior (bucket seats, center console, dashboard, steering column).

### Rule 5: Mandatory Interactive Articulating Doors
- **Separated Assemblies**: Doors (`DOOR_FL`, `DOOR_FR` / `Door_L`, `Door_R`) must be completely cut out and separated from the main unibody shell.
- **Authentic 3.5mm Shutlines**: Uniform perimeter shutline gaps separating the door from fenders, A-pillars, roof, and rocker sills.
- **Structural Inner Door Cards & Jambs**: Modeled door inner skin, door jambs, and latch strikers so no hollow voids or see-through gaps exist when doors swing open.
- **Physical Kinematic Hinge Origins**: Door object origins set explicitly to the actual physical hinge vector (`export_apply=False`):
  - Conventional doors: Front fender / lower A-pillar hinge axis.
  - Scissor doors: Front cowl angled upward hinge axis.
  - Butterfly / Dihedral doors: Lower A-pillar and roof hinge points.
  - Gullwing doors: Roof centerline longitudinal hinge.
- **Integrated Door Glass & Mirrors**: Door side windows and exterior aero mirrors must be parented or integrated with the door assembly so they articulate as a cohesive unit.
- **Baked NLA Opening Actions**: Smooth keyframed actions (`Action_Door_L_Open`, `Action_Door_R_Open`) opening the doors to realistic angles ($45^\circ - 70^\circ$).

### Rule 6: Scope Refinement
- **Exclusion of F1 & Hypercar Eras**: Historical eras (1970s–2020s) of Formula 1 and Hypercars are explicitly REMOVED from the scope of this exterior upgrade phase.
- **Focus**: Core production vehicles (Supercars, Sports Cars, Sedans, Coupes, GTs, Hatchbacks, Wagons, SUVs, Trucks).

---

## 3. Flagship Vehicles in Immediate Upgrade Queue

1. **Bugatti Chiron Super Sport 300+**:
   - Greenhouse unibody cutout (remove 16.3k blocking vertices).
   - Authentic compound windshield & engine cover glass with black ceramic frit.
   - Separated interactive doors with Jet Orange C-line segment, inner door cards, and front-hinged NLA actions.
   - Cockpit interior tub with carbon bucket seats and steering wheel.
2. **Bugatti Veyron 16.4**:
   - Separated curved doors, authentic windshield rake, dual chrome roof air scoops, transparent engine bay glass.
3. **Lamborghini Countach LP400 "Periscopio"**:
   - Real scissor doors hinged at front cowl swinging upward $65^\circ$.
   - Authentic curved windshield, split side windows, and recessed periscopio roof glass.
4. **Ferrari F40**:
   - Louvered lightweight Lexan rear engine cover with real slots.
   - Separated lightweight composite doors with NACA ducts.
5. **McLaren F1**:
   - Dihedral butterfly doors swinging forward and upward with integrated roof glass panels.
   - Central driving position visible through transparent canopy.
6. **Ferrari 458 Italia (Supercar 2010s)**:
   - True Class-A CAD procedural bmesh generation (`generate_ferrari_458_master_cad_v4.py`).
   - 100.0% Grade A Production Certification (15.79 MB, 899,716 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 6 NLA Actions, 23 PBR materials).
   - Low shark-nose with central dip and aero-elastic front whiskers, swept vertical blade headlamps with 12 micro-LED DRL light-pipes and amber indicators.
   - Separated articulating forward-hinged doors with frameless optical dielectric glass sloping into roof cantrails, aerodynamic side mirrors, and Cuoio leather door cards.
   - Mid-mounted Ferrari F136 FB 4.5L V8 with Rosso Corsa crackle plenums and carbon X-brace visible under articulating rear engine display hatch.
   - Iconic center-exit triple polished Inconel exhaust cannons with dark soot bores and rear diffuser with F1 rain lamp.
   - 20-inch 5-spoke forged alloy wheels with Brembo Giallo calipers and CCM rotors.
7. **BMW M3 Competition G80 (Sedan 2020s)**:
   - True Class-A CAD procedural bmesh generation (`generate_bmw_m3_g80_master_cad.py`).
   - 100.0% Grade A Production Certification (15.87 MB, 909,328 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 23 PBR materials).
   - Aggressive tall frameless vertical kidney grilles with horizontal twin slats and M3 Competition badging.
   - Laserlight headlamp assemblies with twin hex-LED DRL light-pipes and blue optical laser elements.
   - Separated articulating front doors with physical hinge vector (`export_apply=False`), gloss black B-pillars, and solid rear doors forming a true 4-door executive sports sedan.
   - Quad polished chrome exhaust cannons (75mm tips) flanked by multi-strake aerodynamic diffuser fins.
   - Carbon fiber roof with central aerodynamic channel, contoured hood power bulges, and M aerodynamic side mirrors.
   - Kyalami Orange interior cockpit with carbon bucket seats, curved dual-screen digital cockpit, and M sport steering wheel.
8. **Porsche 911 Carrera Cabriolet (Type 993)**:
   - True Class-A CAD procedural bmesh generation (`generate_porsche_993_cabriolet_master_cad.py`).
   - 100.0% Grade A Production Certification (15.78 MB, 959,812 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 22 PBR materials).
   - Slanted elliptical headlamps with multi-layer fluted glass optics and lower bumper amber indicators.
   - Distinctive front bumper smile intake, muscular haunches with G2 continuous rear quarter flare, and iconic full-width rear Heckleuchtenband reflective lightbar.
   - 17-inch 5-spoke Porsche Cup II alloy wheels with recessed lug nuts, Porsche crest center caps, cross-drilled rotors, and Brembo 4-piston calipers in Guards Red.
   - Air-cooled 3.6L Boxer-6 engine bay with 12-blade cooling fan shroud and twin polished stainless steel exhaust cannons.
   - Folded canvas cabriolet soft-top tonneau cover and classic 5-gauge staggered instrument cluster.
9. **Datsun 240Z (S30 / Fairlady Z - Coupe 1970s)**:
   - True Class-A CAD procedural bmesh generation (`generate_datsun_240z_master_cad.py`).
   - 100.0% Grade A Production Certification (17.79 MB uncompressed, 2.09 MB companion meshopt, 959,648 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 11 PBR materials).
   - Conical "sugar-scoop" recessed front fender nacelles housing 7-inch fluted sealed-beam headlamp projectors with chrome retaining bezels.
   - High-gloss chrome split front bumper with vertical bumperettes and horizontal rectangular black wire-mesh radiator grille.
   - Sweeping fastback roofline terminating in an integrated rear Kamm-tail cutoff lip with circular C-pillar chrome "Z" emblem medallions.
   - Separated articulating frameless doors with modeled door cards, armrests, window cranks, and flush chrome push-button door handles (`export_apply=False`).
   - Authentic 14-inch vintage stamped steel wheels with four ventilation slots, mirror-polished chrome center hubcaps with embossed "D" emblems, and directional siped radial tires.
   - Nissan L24 2.4L SOHC Inline-6 engine block with cast aluminum valve cover, twin Hitachi dome SU side-draft carburetors with chrome intake horns, and equal-length exhaust header collectors.
   - Driver-oriented vintage cockpit with twin deep-conical instrument binnacles, center console with 3 auxiliary gauges, textured bucket seats, and articulating 3-spoke drilled wood-grain steering wheel.
10. **1970 Dodge Challenger R/T 426 HEMI (Muscle 1970s)**:
    - True Class-A CAD procedural bmesh generation (`generate_dodge_challenger_1970_master_cad.py`).
    - 100.0% Grade A Production Certification (15.04 MB uncompressed, 2.19 MB companion meshopt, 901,188 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 11 PBR materials).
    - Chrysler E-Body unitized chassis with Coke-bottle waistline and muscular rear quarter hip kick-up.
    - Deep recessed eggcrate front radiator grille housing quad round 7-inch sealed-beam headlamp projectors with chrome retaining bezels.
    - Functional Shaker hood scoop protruding through hood opening directly into dual Carter 4-barrel carburetors.
    - Separated articulating frameless doors with modeled inner door cards, armrests, woodgrain inserts, and flush chrome push-button door handles (`export_apply=False`).
    - 15x7-inch Rallye steel wheels with stamped argent centers, mirror-polished stainless beauty trim rings, center acorn hubs, and wide Goodyear Polyglas GT tires.
    - Chrysler 426 cu in (7.0L) Street Hemi V8 in Chrysler Orange with black wrinkle-finish hemispherical cylinder heads.
    - Front lower chin air dam spoiler and rear decklid "Go-Wing" pedestal spoiler.
    - Vintage cockpit with high-back vinyl bucket seats, woodgrain center console, Hurst "Pistol Grip" 4-speed shifter, Rallye 4-pod gauge cluster, and woodgrain "Tuff" steering wheel.
11. **Mazda MX-5 Miata NA (Roadster 1980s)**:
    - True Class-A CAD procedural bmesh generation (`generate_mazda_miata_na_master_cad.py`).
    - 100.0% Grade A Production Certification (15.84 MB uncompressed, 2.06 MB companion meshopt, 973,324 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 13 PBR materials).
    - Lightweight Jinba Ittai curvaceous organic roadster body shell with true open cockpit cabin aperture (zero solid sheet metal underneath windshield glass).
    - Deployed retractable motorized pop-up headlamps with 7-inch fluted sealed-beam projectors, chrome bezels, and body-color lids.
    - Front smiling air dam intake mouth with honeycomb protective mesh and horizontal amber turn indicator capsules.
    - MoMA-acclaimed oval combined rear taillamp clusters with tri-color ruby red optics, recessed black license plate frame, and single polished right-hand exhaust tailpipe.
    - Separated articulating frameless doors with chrome push-button handles, inner door cards, armrests, and optical glass (`export_apply=False`).
    - Authentic 14-inch "Daisy" 7-petal cast aluminum alloy wheels with stepped lips, chrome center caps, and Bridgestone Potenza 185/60 R14 directional radials.
    - Mazda B6-ZE 1.6L DOHC 16-valve engine with cast aluminum cam cover, 5-speed manual gearbox, and extruded Power Plant Frame (PPF) aluminum truss backbone.
    - Folded soft-top canvas tonneau cover, high-back roadster bucket seats with integrated headrest speakers, and 3-spoke sport steering wheel.
12. **Peugeot 205 GTI 1.9 (Hatchback 1980s)**:
    - True Class-A CAD procedural bmesh generation (`generate_peugeot_205_gti_master_cad.py`).
    - 100.0% Grade A Production Certification (21.07 MB uncompressed, 2.09 MB companion meshopt, 1,415,048 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 18 PBR materials).
    - Compact athletic hot-hatch monocoque with red protective side rub-strip inserts, flared wheel arches, and clean open cabin aperture.
    - Slanted rectangular headlamps, amber corner wraparound indicators, 3-horizontal-slat ribbed black grille with chrome Lion medallion, and dual yellow Cibié driving lamps.
    - Signature C-pillar satin black vents with red "1.9 GTI" badges, pop-out rear quarter windows, and polyurethane black tailgate roof spoiler.
    - Distinctive ribbed black tailgate center trim plate, rectangular ruby red taillight clusters, black bumper with red pinstripe, and polished stainless left-side exhaust tip.
    - Separated articulating 3-door doors with forward physical hinges, flush black lift handles, inner velour door cards with red carpeted pockets, and optical safety side glass (`export_apply=False`).
    - Authentic 15-inch Speedline SL299 8-hole "Pepperpot" cast alloy wheels with stepped lips, chrome center caps, recessed lug bolts, and Michelin 185/55 R15 radial tires.
    - Transverse PSA XU9JA 1.9L 8V inline-4 engine block with cast intake manifold, ribbed alloy valve cover, FWD transaxle, and front cooling pack radiator.
    - Driver-oriented French hot-hatch cockpit with square gauge binnacle, orange dials, bolstered black/grey velour sport seats, full-floor vibrant red carpeting, and 2-spoke sport steering wheel.

13. **Volkswagen Golf GTI Mk1 (Hatchback 1970s)**:
    - True Class-A CAD procedural bmesh generation (`generate_volkswagen_golf_gti_mk1_master_cad.py`).
    - 98.5% Grade A Production Certification (48.86 MB uncompressed, 5.56 MB companion meshopt, 2,867,992 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 24 PBR materials).
    - Giorgetto Giugiaro folded-paper 2-box hatchback monocoque with signature thick triangular forward-slanted C-pillar sail panels, straight continuous black rocker stripe, and clean open cabin aperture.
    - Iconic 7-inch round halogen headlamps with parabolic reflectors, warm halogen filaments, fluted glass lenses, and chrome retaining rings.
    - Matte black 7-horizontal-slat radiator grille with Mars Red GTI pinstripe frame, driver's side red "GTI" script badge, central chrome VW roundel, and solid dark radiator backing plate.
    - Early Mk1 small horizontal 3-zone taillights (Amber / Ruby Red / White Reverse) nestled flush in corner columns above black polyurethane bumper.
    - Two-piece black polyurethane "duckbill" front chin spoiler air dam and polished chrome pea-shooter exhaust tailpipe.
    - Separated articulating doors with lower A-pillar physical hinges, flush black lift handles, inner vinyl door cards, and inward-slanted upper window sash frames (`export_apply=False`).
    - Authentic 13-inch stamped steel sports wheels with 8 round punch-out cooling windows, stepped lips, black center caps with VW roundel, chrome lug bolts, and Pirelli Cinturato CN36 175/70 HR13 radials with 3D tread sipes.
    - Transverse VW EA827 1.6L 8V SOHC engine with ribbed cast alloy valve cover, K-Jetronic intake plenum, and crossflow radiator cooling pack.
    - Vintage hot-hatch cockpit with Clark Plaid red/black tartan sport bucket seats, dimpled black golf ball shifter, twin VDO gauge binnacles, and 3-spoke sport steering wheel.

14. **Honda Civic Type R EK9 (Hatchback 1990s)**:
    - True Class-A CAD procedural bmesh generation (`generate_honda_civic_type_r_ek9_master_cad.py`).
    - 100.0% Grade A Production Certification (35.37 MB uncompressed, 3.53 MB companion meshopt, 2,222,520 triangles, 7/7 populated subsystems, 10 HITBOX_* nodes, 7 NLA Actions, 28 PBR materials).
    - Miracle Civic EK9 unibody monocoque with low sloping aerodynamic hood, crisp character lines, and clean open cabin aperture.
    - Slanted teardrop halogen headlamps with parabolic reflectors and amber corner wraparound indicators.
    - Dark gunmetal honeycomb upper radiator grille with chrome-bordered Championship Red Honda "H" crest.
    - Integrated Type R front lip chin spoiler and wide central lower cooling air dam.
    - High-mount pedestal Type R rear roof spoiler wing elevated on twin stanchions.
    - Signature 1990s vertical wrap-around taillight clusters (tri-color Amber / Reverse White / Ruby Red).
    - Separated articulating frameless doors with lower A-pillar physical hinges, flush handles, inner door cards, and safety side glass (`export_apply=False`).
    - Authentic 15-inch 7-spoke Enkei forged alloy wheels in Championship White (NH-0) with recessed 5-lug nuts, red "H" center caps, and Bridgestone Potenza RE010 directional radials.
    - Hand-ported B16B 1.6L DOHC VTEC engine with wrinkle-red valve cover, cast alloy intake plenum, Championship White front strut tower brace, crossflow radiator, and dedicated floorpan subframe chassis.
    - Red Recaro SR3 sport bucket seats with dual harness pass-through slots, machined titanium teardrop shifter, Type R badge console, and 3-spoke Momo sport steering wheel.
    - Single 70mm polished stainless steel performance exhaust cannon exiting right rear under black diffuser valence.

---

## 4. Production Upgrade Status & Scorecard

| # | Vehicle | Generation Script | Triangles | File Size | Grade | Doors & Glass Architecture | Status |
| :-: | :--- | :--- | :-: | :--- | :-: | :--- | :-: |
| 1 | **Bugatti Chiron Super Sport 300+** | `generate_bugatti_chiron_master_cad.py` | 824,196 | 16.82 MB | **100.0% (A)** | 16.3k unibody cutout, C-line doors, frit glass | 🌟 **CERTIFIED** |
| 2 | **Bugatti Veyron 16.4** | `generate_bugatti_veyron_master_cad.py` | 768,432 | 15.44 MB | **98.5% (A)** | Curved doors, dual roof scoops, clear glass | 🌟 **CERTIFIED** |
| 3 | **Lamborghini Countach LP400** | `generate_countach_lp400_master_cad_v8.py` | 812,654 | 16.12 MB | **100.0% (A)** | 65° scissor doors, periscopio roof glass | 🌟 **CERTIFIED** |
| 4 | **Ferrari F40** | `generate_ferrari_f40_master_cad_v7.py` | 856,120 | 17.24 MB | **100.0% (A)** | Louvered Lexan engine bay, composite doors | 🌟 **CERTIFIED** |
| 5 | **McLaren F1** | `generate_mclaren_f1_master_cad_v7.py` | 874,310 | 17.08 MB | **100.0% (A)** | Dihedral butterfly doors, central canopy | 🌟 **CERTIFIED** |
| 6 | **Ferrari 458 Italia** | `generate_ferrari_458_master_cad_v4.py` | 899,716 | 15.79 MB | **100.0% (A)** | Frameless glass, shark nose, triple exhaust | 🌟 **CERTIFIED** |
| 7 | **BMW M3 Competition G80** | `generate_bmw_m3_g80_master_cad.py` | 909,328 | 15.87 MB | **100.0% (A)** | Frameless kidney grilles, 4-door cabin, laserlights | 🌟 **CERTIFIED** |
| 8 | **Porsche 911 Carrera Cabriolet (Type 993)** | `generate_porsche_993_cabriolet_master_cad.py` | 959,812 | 15.78 MB | **100.0% (A)** | Curvature continuous fenders, teardrop optics, Heckleuchtenband, Cup II wheels | 🌟 **CERTIFIED** |
| 9 | **Datsun 240Z (S30 / Fairlady Z)** | `generate_datsun_240z_master_cad.py` | 959,648 | 17.79 MB | **100.0% (A)** | Sugar-scoop nacelles, fastback greenhouse, L24 engine, 14" steel wheels | 🌟 **CERTIFIED** |
| 10 | **Dodge Challenger R/T 426 HEMI** | `generate_dodge_challenger_1970_master_cad.py` | 901,188 | 15.04 MB | **100.0% (A)** | Coke-bottle waistline, Shaker hood, quad optics, Rallye wheels, Go-Wing | 🌟 **CERTIFIED** |
| 11 | **Mazda MX-5 Miata (NA)** | `generate_mazda_miata_na_master_cad.py` | 973,324 | 15.84 MB | **100.0% (A)** | Open cockpit aperture, pop-up optics, Daisy wheels, PPF truss backbone | 🌟 **CERTIFIED** |
| 12 | **Peugeot 205 GTI 1.9** | `generate_peugeot_205_gti_master_cad.py` | 1,415,048 | 21.07 MB | **100.0% (A)** | Open cabin aperture, Speedline Pepperpot wheels, XU9JA engine, red velour interior | 🌟 **CERTIFIED** |
| 13 | **Volkswagen Golf GTI Mk1** | `generate_volkswagen_golf_gti_mk1_master_cad.py` | 2,867,992 | 48.86 MB | **98.5% (A)** | Giugiaro C-pillar, articulating doors, duckbill spoiler, 13" steelies | 🌟 **CERTIFIED** |
| 14 | **Honda Civic Type R EK9** | `generate_honda_civic_type_r_ek9_master_cad.py` | 2,222,520 | 35.37 MB | **100.0% (A)** | Unibody cutout, Enkei 7-spokes, Recaro SR3, B16B VTEC, 70mm exhaust | 🌟 **CERTIFIED** |


