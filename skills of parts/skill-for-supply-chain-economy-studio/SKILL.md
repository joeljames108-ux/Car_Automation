---
name: skill-for-supply-chain-economy-studio
description: Operational skill for calculating BOM costing, Tier-1 volume discounts, price elasticity of demand, and supply chain buffer sizing in the Supply Chain & Economy Studio.
---

# Skill: Automotive Supply Chain & Tycoon Economics

This skill provides the financial formulas, BOM aggregation rules, and procurement modeling guidelines for vehicle production economics.

---

## 1. Economic & Supply Chain Formulas

1. **Total Unit Manufacturing Cost ($COGS$)**:
   $$\text{COGS} = \sum_{\text{subsystems}} C_{\text{component}} + C_{\text{labor}} + \frac{\text{CapEx}_{\text{tooling}}}{N_{\text{volume}}}$$

2. **Supplier Volume Discount Curve**:
   $$C_{\text{unit}}(N) = C_{\text{base}} \cdot \left(1 - \delta_{\max} \cdot \left(1 - e^{-\frac{N}{N_0}}\right)\right)$$
   where $\delta_{\max} \approx 0.20 - 0.35$ (max discount) and $N_0 \approx 10,000$ units.

3. **MSRP Price Elasticity of Demand**:
   $$\epsilon = \frac{\% \Delta Q}{\% \Delta P}$$
   - Ultra-luxury hypercars: Inelastic ($\epsilon \approx -0.4$ to $-0.7$), brand prestige drives pricing power.
   - Mainstream family saloons: Highly elastic ($\epsilon \approx -1.8$ to $-2.5$), volume drops sharply if overpriced.

4. **Optimal Safety Stock (Buffer Inventory)**:
   $$SS = Z \cdot \sqrt{L \cdot \sigma_D^2 + D^2 \cdot \sigma_L^2}$$
   where $Z$ is the service level factor ($1.65$ for 95%), $L$ is lead time, and $\sigma$ represents variance.
