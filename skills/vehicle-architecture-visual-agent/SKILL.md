---
name: vehicle-architecture-visual-agent
description: Autonomous agent for creating, maintaining, and continuously synchronizing the 'vehicle architecture architecture' directory containing 168 vehicle subfolders, multi-angle GLB renders, change-detection caching, and real-time auto-updating file watcher.
---

# Vehicle Architecture Visual Sync Agent

The **Vehicle Architecture Visual Sync Agent** is an autonomous subsystem that generates and continuously synchronizes the `vehicle architecture architecture` directory containing **168 individual vehicle folders** across the complete 24-architecture $\times$ 7-era vehicle matrix.

Each folder contains multi-angle studio renders of its corresponding 3D GLB model, updating automatically whenever any GLB is edited so that vehicle visual state can be inspected directly without opening Blender or launching heavy 3D GLB viewers.

---

## 1. Directory Structure Standard

The agent maintains the following directory layout in the workspace root:

```text
vehicle architecture architecture/
├── .sync_cache.json                          # Change detection & hash tracking cache
├── INDEX.md                                  # Master index table of all 168 vehicles
├── gallery.html                              # Standalone dark interactive web showroom
├── Honda Civic Sedan/                        # [Clean Reference Vehicle Name]
│   ├── front_three_quarter.png              # Dynamic Hero 3/4 Perspective
│   ├── rear_three_quarter.png               # Fastback roofline, diffuser & exhaust
│   ├── side_profile.png                     # Silhouette, wheelbase & stance
│   ├── front_fascia.png                     # Direct head-on radiator grille & headlights
│   ├── rear_fascia.png                      # Direct rear taillights & bumper
│   ├── top_down.png                         # Overhead plan view & greenhouse
│   ├── info.json                            # Standardized JSON metadata card
│   ├── README.md                            # Rich markdown overview with image cards
│   └── render_meta.json                     # Render stats (dimensions, polycount, time)
├── Porsche 911 Carrera Cabriolet (993)/
│   └── ... (6 images + info.json + README.md)
├── Datsun 240Z/
│   └── ...
├── Mercedes-Benz 560SL (R107)/
│   └── ...
└── ... (168 unique vehicle folders in total)
```

---

## 2. Dynamic Auto-Framing & Camera Geometry

Vehicles in the fleet range from compact roadsters ($L \approx 3.8\text{m}$) to 12-meter commercial transit buses ($L \approx 12.0\text{m}$, $H \approx 3.5\text{m}$). The headless snapshot renderer (`scripts/blender/render_vehicle_snapshots.py`) computes dynamic bounding-box auto-framing on imported meshes:

$$\text{Dimensions}: \quad W = \max(x) - \min(x), \quad L = \max(y) - \min(y), \quad H = \max(z) - \min(z)$$

### Trigonometric Viewpoint Coordinates:
1. **Front 3/4 Dynamic Hero**:
   - $W_{\text{proj}} = 0.707 \cdot (W + L)$
   - $d_{34} = \max(W_{\text{proj}} \cdot 1.75, H \cdot 2.6)$
   - Position: $(C_x + 0.707 \cdot d_{34}, \; C_y + 0.707 \cdot d_{34}, \; \min(z) + \max(H \cdot 0.75, 1.35\text{m}))$
   - Lens: $50\text{mm}$
2. **Rear 3/4 Fastback**:
   - Position: $(C_x + 0.707 \cdot d_{34}, \; C_y - 0.707 \cdot d_{34}, \; \min(z) + \max(H \cdot 0.75, 1.35\text{m}))$
   - Lens: $50\text{mm}$
3. **Side Profile**:
   - $d_{\text{side}} = \max(L \cdot 1.75, H \cdot 2.6)$
   - Position: $(C_x + d_{\text{side}}, \; C_y, \; \min(z) + 0.50 \cdot H)$
   - Lens: $52\text{mm}$
4. **Front Fascia**:
   - $d_{\text{front}} = \max(W \cdot 2.1, H \cdot 2.0)$
   - Position: $(C_x, \; \max(y) + d_{\text{front}}, \; \min(z) + 0.48 \cdot H)$
   - Lens: $50\text{mm}$
5. **Rear Fascia**:
   - $d_{\text{rear}} = \max(W \cdot 2.1, H \cdot 2.0)$
   - Position: $(C_x, \; \min(y) - d_{\text{rear}}, \; \min(z) + 0.48 \cdot H)$
   - Lens: $50\text{mm}$
6. **Top Down**:
   - $d_{\text{top}} = \max(L \cdot 1.8, W \cdot 2.8)$
   - Position: $(C_x, \; C_y, \; \min(z) + d_{\text{top}})$
   - Lens: $48\text{mm}$, with roll aligned so front ($+Y$) points upward.

---

## 3. CLI Commands & Workflow Integration

The agent is fully integrated via npm and python commands:

| Command | Action |
|:---|:---|
| `npm run vehicles:status` | Displays synchronization status (rendered, missing, outdated). |
| `npm run vehicles:scaffold` | Instantly scaffolds all 168 vehicle folders and metadata cards. |
| `npm run vehicles:watch` | Starts persistent background watcher. Auto-renders whenever a GLB is saved. |
| `npm run vehicles:sync` | Synchronizes any unrendered or modified vehicles in batch. |
| `npm run vehicles:gallery` | Refreshes and opens the dark interactive web showroom (`gallery.html`). |

---

## 4. Watcher Daemon Architecture

The watcher daemon runs a low-overhead, dependency-free polling loop (1.5s interval) checking `os.stat` across the 168 vehicle GLBs. 

When a change is detected:
1. **Debounce verification**: Confirms file size has stabilized (prevents reading mid-export GLBs).
2. **Single-Vehicle Dispatch**: Triggers `render_vehicle_snapshots.py --single <glb> --out <folder>`.
3. **In-Place Update**: Re-renders all 6 perspective snapshots in that vehicle's folder.
4. **Metadata & Cache Refresh**: Re-generates `info.json`, `README.md`, updates `.sync_cache.json`, and updates `gallery.html`.
5. **Terminal Notification**: Outputs completion message and duration.
