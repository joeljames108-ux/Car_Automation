---
name: skill-for-track-layout-circuit
description: Operational skill for designing, measuring, and modeling Grand Prix race track splines, elevation profiles, corner apexes, and DRS detection zones in the Track Layouts Studio.
---

# Skill: Race Circuit Geometry & Track Engineering

This skill provides the coordinate representations, spline mathematics, and FIA circuit classifications for motorsport tracks.

---

## 1. Circuit Spline Mathematics

1. **Curvilinear Distance Along Track ($s$)**:
   $$\vec{r}(s) = [x(s), y(s), z(s)]$$
   where $s \in [0, L_{\text{track}}]$ and $\vec{r}(0) = \vec{r}(L_{\text{track}})$ for closed loops.

2. **Corner Curvature ($\kappa$) & Radius of Curvature ($R$)**:
   $$\kappa(s) = \frac{|\vec{r}'(s) \times \vec{r}''(s)|}{|\vec{r}'(s)|^3}, \quad R(s) = \frac{1}{\kappa(s)}$$

3. **Theoretical Cornering Speed**:
   $$v_{\text{corner}} = \sqrt{\frac{\mu \cdot g \cdot R}{1 - \frac{\frac{1}{2}\rho C_l A \cdot \mu}{m}}}$$
   showing how aerodynamic downforce ($C_l$) enables higher apex speeds beyond mechanical tire grip ($\mu$).

---

## 2. Standard Circuit Database Taxonomy

| Circuit Key | Circuit Name | Length | Characteristic Corners | Key Feature |
| :--- | :--- | :--- | :--- | :--- |
| `monza` | Autodromo Nazionale Monza | $5,793\,\text{m}$ | Prima Variante, Lesmo 1 & 2, Ascari, Parabolica | "Temple of Speed", ultra-low drag, highest average speed ($>260\,\text{km/h}$) |
| `spa` | Circuit de Spa-Francorchamps | $7,004\,\text{m}$ | La Source, Eau Rouge / Raidillon, Pouhon, Blanchimont | Extreme elevation change ($102\,\text{m}$), mixed weather, high-speed g-loads |
| `silverstone` | Silverstone Circuit | $5,891\,\text{m}$ | Maggotts, Becketts, Chapel, Stowe, Copse | High downforce, extreme lateral tire degradation |
| `nurburgring` | Nürburgring Nordschleife | $20,832\,\text{m}$ | Flugplatz, Karussell, Pflanzgarten, Döttinger Höhe | 73 turns, variable asphalt, ultimate chassis benchmark |
| `lemans` | Circuit de la Sarthe | $13,626\,\text{m}$ | Dunlop Curve, Tertre Rouge, Mulsanne, Porsche Curves | $330\,\text{km/h}+$ high-speed straightaways, 24-Hour endurance torture test |
| `monaco` | Circuit de Monaco | $3,337\,\text{m}$ | Sainte Dévote, Casino, Hairpin, Tunnel, Swimming Pool | Narrow street circuit, maximum downforce, tightest turning radius ($R = 10\,\text{m}$) |
