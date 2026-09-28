---
name: skill-for-nvh-audio-lab
description: Operational skill for procedural automotive audio synthesis, engine harmonic order tracking, exhaust acoustic resonance, and cabin ANC modeling in the NVH Audio Lab.
---

# Skill: Automotive NVH & Procedural Audio Engineering

This skill provides the acoustic formulas, harmonic order tables, and Web Audio API architecture for vehicle sound generation.

---

## 1. Engine Firing Harmonics & Acoustic Formulas

1. **Fundamental Firing Frequency (4-Stroke)**:
   $$f_{\text{firing}} = \frac{\text{RPM}}{60} \times \frac{N_{\text{cylinders}}}{2}$$

| Engine Architecture | Cylinders | Firing Order / Crank | Dominant Engine Order ($E$) | Characteristic Timbre |
| :--- | :--- | :--- | :--- | :--- |
| **Inline-4** | 4 | $180^\circ$ interval | $2.0 \times \text{Rev}$ ($E_2$) | Crisp, buzzing, high-frequency growl |
| **Inline-6 / V6** | 6 | $120^\circ$ interval | $3.0 \times \text{Rev}$ ($E_3$) | Smooth, musical howling tone |
| **Cross-Plane V8** | 8 | $90^\circ$ interval | $4.0 \times \text{Rev}$ + $0.5E$ burble | Deep, syncopated muscle car rumble |
| **Flat-Plane V8** | 8 | $180^\circ$ interval | $4.0 \times \text{Rev}$ ($E_4$) | High-pitched screaming exotic note |
| **V10** | 10 | $72^\circ$ interval | $5.0 \times \text{Rev}$ ($E_5$) | Metallic, resonant, brassy howl |
| **V12** | 12 | $60^\circ$ interval | $6.0 \times \text{Rev}$ ($E_6$) | Ultra-refined, turbine-like symphony |

2. **Helmholtz Exhaust Resonance Frequency**:
   $$f_H = \frac{c}{2\pi} \sqrt{\frac{A}{V \cdot L_{\text{eff}}}}$$
   where $c \approx 343\,\text{m/s}$ (speed of sound), $A$ is neck cross-sectional area, $V$ is cavity volume, and $L_{\text{eff}} = L + 0.8d$ is effective neck length.

---

## 2. Web Audio API Procedural Architecture

- **Sub-Bass Oscillator**: Sine wave at $0.5 \times f_{\text{firing}}$ to generate physical chassis vibrations and low-end depth.
- **Main Harmonic Bank**: Dual sawtooth oscillators detuned by $+3$ to $-4$ cents at fundamental $f_{\text{firing}}$ and second harmonic $2 f_{\text{firing}}$.
- **Exhaust Tube Bandpass**: Dynamic BiquadFilterNode with frequency mapped to throttle position:
  $$f_{\text{cutoff}} = 250\,\text{Hz} + \text{Throttle} \times 1,200\,\text{Hz}$$
- **Intake Induction Noise**: White noise buffer passed through a high-Q peak filter peaking at $1,800\,\text{Hz}$ on wide-open throttle (WOT).
- **Turbo Wastegate Chirp**: Decaying exponential pulse triggering high-frequency bandpass ($3,200\,\text{Hz}$) on rapid throttle lift-off.
