---
name: skill-for-transmission-drivetrain-studio
description: Operational skill for calculating gear ratios, final drives, DCT clutch handover dynamics, differential lockup percentages, and drivetrain torque limits in the 3D Transmission Studio.
---

# Skill: 3D Transmission & Drivetrain Engineering Standard

This skill provides the formulas, mechanical ratings, and 3D architectural standards for automotive transmissions and drivelines.

---

## 1. Transmission Mathematics & Physics

1. **Wheel Speed from Engine RPM**:
   $$v = \frac{2 \pi \cdot r_{\text{tire}} \cdot \text{RPM}}{60 \cdot r_{\text{gear}} \cdot r_{\text{final}}}$$
   where $r_{\text{tire}}$ is loaded rolling radius in meters.

2. **Wheel Torque from Engine Torque**:
   $$T_{\text{wheel}} = T_{\text{engine}} \cdot r_{\text{gear}} \cdot r_{\text{final}} \cdot \eta_{\text{drivetrain}}$$
   where mechanical efficiency $\eta \approx 0.90 - 0.94$ for RWD, $0.85 - 0.88$ for AWD.

3. **RPM Drop on Upshift**:
   $$\text{RPM}_{\text{new}} = \text{RPM}_{\text{shift}} \cdot \frac{r_{\text{next}}}{r_{\text{current}}}$$
   Target RPM drop should place the engine right at the onset of peak torque plateau ($4,500 - 6,000\,\text{RPM}$ on sports engines).

4. **Clutch Handover Torque Cross-fade (Dual-Clutch)**:
   $$T_{\text{out}}(t) = (1 - \alpha(t)) \cdot T_{\text{clutch1}} + \alpha(t) \cdot T_{\text{clutch2}}$$
   with transition time $t_{\text{shift}} \in [40\,\text{ms}, 90\,\text{ms}]$.

---

## 2. Transmission Typologies & Mechanical Bounds

| Typology | Typical Speeds | Shift Time | Torque Limit | Application |
| :--- | :--- | :--- | :--- | :--- |
| **Dual-Clutch (DCT)** | 7–8 Speed | $35 - 80\,\text{ms}$ | Up to $1,000\,\text{Nm}$ | Supercars, High-performance sports cars |
| **Sequential Dog-Ring** | 6 Speed | $25 - 45\,\text{ms}$ | Up to $850\,\text{Nm}$ | GT3, Cup racing, Time attack |
| **Manual Gated** | 6 Speed | $300 - 500\,\text{ms}$ | Up to $750\,\text{Nm}$ | Heritage sports cars, purist driver cars |
| **Planetary Automatic** | 8–10 Speed | $150 - 250\,\text{ms}$ | Up to $1,200\,\text{Nm}+$ | Heavy luxury saloons, flagship SUVs |
| **Single-Speed EV Reducer**| 1 Speed ($8:1 - 10:1$) | Instant | Up to $1,600\,\text{Nm}$ | High-power battery electric vehicles |
