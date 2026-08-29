// ============================================================================
// PROCEDURAL TEXTURE GENERATORS — CARBON FIBER, LEATHER, METAL, GROUND
// ============================================================================
// Canvas-based procedural texture creation for:
// - Carbon fiber 2x2 twill weave pattern
// - Leather grain with pores and creases
// - Brushed metal directional grain
// - Diamond plate / checker plate
// - Racing slick tire surface with rubber compound
// - Concrete workshop floor with oil stains
// - Aluminum anodized surface
// - Forged carbon random marbled pattern
// - Ambient occlusion contact shadow maps
// - Normal maps from height maps
// - Tire tread patterns (slick, intermediate, wet)
// - Brake disc cross-drilled holes pattern
// - Dashboard gauge face with numbers and markings
// ============================================================================

export interface ProceduralTextureOptions {
  width: number;
  height: number;
  repeat?: [number, number];
  anisotropy?: number;
}

export class ProceduralTextureGenerator {
  private static _canvas: HTMLCanvasElement | null = null;
  private static _ctx: CanvasRenderingContext2D | null = null;

  private static getCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    if (!this._canvas || this._canvas.width !== width || this._canvas.height !== height) {
      this._canvas = document.createElement("canvas");
      this._canvas.width = width;
      this._canvas.height = height;
      this._ctx = this._canvas.getContext("2d")!;
    }
    return { canvas: this._canvas, ctx: this._ctx! };
  }

  /**
   * Creates a carbon fiber 2x2 twill weave texture.
   */
  public static createCarbonFiberTwill(options: ProceduralTextureOptions = { width: 512, height: 512 }): HTMLCanvasElement {
    const { canvas, ctx } = this.getCanvas(options.width, options.height);
    const w = options.width;
    const h = options.height;
    const strandSize = 8;
    const rowCount = Math.ceil(h / strandSize);
    const colCount = Math.ceil(w / strandSize);

    // Base fill
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, w, h);

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        const x = col * strandSize;
        const y = row * strandSize;

        // 2x2 twill pattern: alternate direction every 2 strands
        const isOver = ((Math.floor(row / 2) + Math.floor(col / 2)) % 2) === 0;

        if (isOver) {
          // Warp strand goes over
          const brightness = 20 + Math.random() * 12;
          ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness + 5})`;
          ctx.fillRect(x, y, strandSize - 1, strandSize - 1);

          // Subtle directional highlight
          const grad = ctx.createLinearGradient(x, y, x + strandSize, y + strandSize);
          grad.addColorStop(0, `rgba(255,255,255,0.04)`);
          grad.addColorStop(0.5, `rgba(255,255,255,0.08)`);
          grad.addColorStop(1, `rgba(255,255,255,0.02)`);
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, strandSize - 1, strandSize - 1);
        } else {
          // Weft strand goes under
          const brightness = 12 + Math.random() * 8;
          ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness + 3})`;
          ctx.fillRect(x, y, strandSize - 1, strandSize - 1);
        }

        // Inter-strand resin gap (dark line)
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(x + strandSize - 1, y, 1, strandSize);
        ctx.fillRect(x, y + strandSize - 1, strandSize, 1);
      }
    }

    return canvas;
  }

  /**
   * Creates a forged carbon random marbled pattern.
   */
  public static createForgedCarbon(options: ProceduralTextureOptions = { width: 512, height: 512 }): HTMLCanvasElement {
    const { canvas, ctx } = this.getCanvas(options.width, options.height);
    const w = options.width;
    const h = options.height;

    // Base
    ctx.fillStyle = "#111115";
    ctx.fillRect(0, 0, w, h);

    // Random marbled patches
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const radius = 10 + Math.random() * 40;
      const angle = Math.random() * Math.PI;
      const length = 20 + Math.random() * 60;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const brightness = 15 + Math.random() * 25;
      const alpha = 0.3 + Math.random() * 0.4;
      ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness + 5}, ${alpha})`;

      // Draw elongated elliptical patch
      ctx.beginPath();
      ctx.ellipse(0, 0, length, radius, 0, 0, Math.PI * 2);
      ctx.fill();

      // Highlight edge
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 + Math.random() * 0.04})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    }

    // Resin pooling in gaps
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const radius = 3 + Math.random() * 8;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, "rgba(5, 5, 8, 0.6)");
      grad.addColorStop(1, "rgba(5, 5, 8, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    return canvas;
  }

  /**
   * Creates a leather grain texture with pores and creases.
   */
  public static createLeatherGrain(options: ProceduralTextureOptions = { width: 512, height: 512 }, colorHex: string = "#1a1510"): HTMLCanvasElement {
    const { canvas, ctx } = this.getCanvas(options.width, options.height);
    const w = options.width;
    const h = options.height;

    // Base color
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, w, h);

    // Leather grain noise
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const noise = (Math.random() - 0.5) * 15;
        data[idx] = Math.max(0, Math.min(255, data[idx] + noise));
        data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + noise));
        data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + noise));
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Larger leather crease lines
    for (let i = 0; i < 40; i++) {
      const x1 = Math.random() * w;
      const y1 = Math.random() * h;
      const x2 = x1 + (Math.random() - 0.5) * 60;
      const y2 = y1 + (Math.random() - 0.5) * 60;

      ctx.strokeStyle = `rgba(0, 0, 0, ${0.08 + Math.random() * 0.1})`;
      ctx.lineWidth = 0.5 + Math.random();
      ctx.beginPath();
      ctx.moveTo(x1, y1);

      // Curved crease with bezier
      const cpx = (x1 + x2) / 2 + (Math.random() - 0.5) * 20;
      const cpy = (y1 + y2) / 2 + (Math.random() - 0.5) * 20;
      ctx.quadraticCurveTo(cpx, cpy, x2, y2);
      ctx.stroke();
    }

    // Pore dots
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const radius = 0.5 + Math.random() * 1.5;
      ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + Math.random() * 0.15})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  }

  /**
   * Creates a brushed metal directional grain texture.
   */
  public static createBrushedMetal(options: ProceduralTextureOptions = { width: 512, height: 512 }, direction: "horizontal" | "vertical" | "radial" = "horizontal"): HTMLCanvasElement {
    const { canvas, ctx } = this.getCanvas(options.width, options.height);
    const w = options.width;
    const h = options.height;

    // Silver base
    ctx.fillStyle = "#b0b8c0";
    ctx.fillRect(0, 0, w, h);

    // Directional brush strokes
    const strokeCount = direction === "horizontal" ? h : w;
    for (let i = 0; i < strokeCount; i++) {
      const brightness = 160 + Math.random() * 40;
      const alpha = 0.15 + Math.random() * 0.25;
      ctx.strokeStyle = `rgba(${brightness}, ${brightness}, ${brightness + 5}, ${alpha})`;
      ctx.lineWidth = 0.5 + Math.random() * 1.5;

      ctx.beginPath();
      if (direction === "horizontal") {
        ctx.moveTo(0, i);
        ctx.lineTo(w, i + (Math.random() - 0.5) * 2);
      } else if (direction === "vertical") {
        ctx.moveTo(i, 0);
        ctx.lineTo(i + (Math.random() - 0.5) * 2, h);
      } else {
        // Radial from center
        const angle = (i / strokeCount) * Math.PI * 2;
        const cx = w / 2;
        const cy = h / 2;
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * w, cy + Math.sin(angle) * h);
      }
      ctx.stroke();
    }

    // Random fine scratches
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + Math.random() * 0.1})`;
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30);
      ctx.stroke();
    }

    return canvas;
  }

  /**
   * Creates a diamond plate / checker plate texture for workshop floors.
   */
  public static createDiamondPlate(options: ProceduralTextureOptions = { width: 512, height: 512 }): HTMLCanvasElement {
    const { canvas, ctx } = this.getCanvas(options.width, options.height);
    const w = options.width;
    const h = options.height;

    ctx.fillStyle = "#555558";
    ctx.fillRect(0, 0, w, h);

    const diamondSize = 20;
    const spacing = 24;

    for (let row = 0; row < h / spacing + 1; row++) {
      for (let col = 0; col < w / spacing + 1; col++) {
        const x = col * spacing + (row % 2 === 0 ? 0 : spacing / 2);
        const y = row * spacing;

        // Diamond raised bump
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);

        // Highlight edge (top-left)
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fillRect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize / 2);

        // Shadow edge (bottom-right)
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.fillRect(-diamondSize / 2, 0, diamondSize, diamondSize / 2);

        // Top face
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(-diamondSize / 2 + 1, -diamondSize / 2 + 1, diamondSize - 2, diamondSize - 2);

        ctx.restore();
      }
    }

    return canvas;
  }

  /**
   * Creates a racing slick tire surface texture.
   */
  public static createSlickTireSurface(options: ProceduralTextureOptions = { width: 512, height: 512 }): HTMLCanvasElement {
    const { canvas, ctx } = this.getCanvas(options.width, options.height);
    const w = options.width;
    const h = options.height;

    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(0, 0, w, h);

    // Rubber grain
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const grain = (Math.random() - 0.5) * 8;
        data[idx] = Math.max(0, Math.min(255, 10 + grain));
        data[idx + 1] = Math.max(0, Math.min(255, 10 + grain));
        data[idx + 2] = Math.max(0, Math.min(255, 12 + grain));
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Marbles / pickup rubber
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const radius = 1 + Math.random() * 3;
      const brightness = 15 + Math.random() * 15;
      ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Surface abrasion marks
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const angle = Math.random() * Math.PI;
      const len = 10 + Math.random() * 30;
      ctx.strokeStyle = `rgba(30, 30, 30, ${0.2 + Math.random() * 0.3})`;
      ctx.lineWidth = 0.5 + Math.random();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.stroke();
    }

    return canvas;
  }

  /**
   * Creates a concrete workshop floor with oil stains and tire marks.
   */
  public static createConcreteFloor(options: ProceduralTextureOptions = { width: 1024, height: 1024 }): HTMLCanvasElement {
    const { canvas, ctx } = this.getCanvas(options.width, options.height);
    const w = options.width;
    const h = options.height;

    // Base concrete
    ctx.fillStyle = "#555555";
    ctx.fillRect(0, 0, w, h);

    // Concrete grain
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const grain = (Math.random() - 0.5) * 15;
        data[idx] = Math.max(0, Math.min(255, 85 + grain));
        data[idx + 1] = Math.max(0, Math.min(255, 85 + grain));
        data[idx + 2] = Math.max(0, Math.min(255, 85 + grain));
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Expansion joints
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 2;
    for (let x = 0; x < w; x += 256) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 256) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Oil stains
    for (let i = 0; i < 5; i++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const rx = 20 + Math.random() * 60;
      const ry = 15 + Math.random() * 40;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
      grad.addColorStop(0, "rgba(20, 20, 15, 0.4)");
      grad.addColorStop(0.6, "rgba(25, 20, 10, 0.2)");
      grad.addColorStop(1, "rgba(30, 25, 15, 0)");
      ctx.fillStyle = grad;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(rx, ry), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Tire marks (dark streaks)
    for (let i = 0; i < 3; i++) {
      const startX = Math.random() * w;
      const startY = Math.random() * h;
      const angle = Math.random() * Math.PI;
      const length = 100 + Math.random() * 200;

      ctx.strokeStyle = `rgba(30, 30, 30, ${0.15 + Math.random() * 0.15})`;
      ctx.lineWidth = 4 + Math.random() * 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      let px = startX;
      let py = startY;
      const segments = 20;
      for (let s = 0; s < segments; s++) {
        px += (Math.cos(angle) * length) / segments + (Math.random() - 0.5) * 3;
        py += (Math.sin(angle) * length) / segments + (Math.random() - 0.5) * 3;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    return canvas;
  }

  /**
   * Creates a normal map from a height map canvas.
   */
  public static createNormalMap(heightMap: HTMLCanvasElement, strength: number = 2.0): HTMLCanvasElement {
    const w = heightMap.width;
    const h = heightMap.height;
    const { canvas, ctx } = this.getCanvas(w, h);

    const srcCtx = heightMap.getContext("2d")!;
    const srcData = srcCtx.getImageData(0, 0, w, h).data;
    const outData = ctx.createImageData(w, h);

    function getHeight(x: number, y: number): number {
      const nx = ((x % w) + w) % w;
      const ny = ((y % h) + h) % h;
      const idx = (ny * w + nx) * 4;
      return (srcData[idx] + srcData[idx + 1] + srcData[idx + 2]) / (3 * 255);
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const left = getHeight(x - 1, y);
        const right = getHeight(x + 1, y);
        const up = getHeight(x, y - 1);
        const down = getHeight(x, y + 1);

        const dx = (left - right) * strength;
        const dy = (up - down) * strength;

        // Normalize
        const len = Math.sqrt(dx * dx + dy * dy + 1);
        const nx = dx / len;
        const ny = dy / len;
        const nz = 1 / len;

        const idx = (y * w + x) * 4;
        outData.data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
        outData.data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        outData.data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        outData.data[idx + 3] = 255;
      }
    }

    ctx.putImageData(outData, 0, 0);
    return canvas;
  }

  /**
   * Creates a brake disc cross-drilled pattern texture.
   */
  public static createBrakeDiscPattern(options: ProceduralTextureOptions = { width: 512, height: 512 }): HTMLCanvasElement {
    const { canvas, ctx } = this.getCanvas(options.width, options.height);
    const w = options.width;
    const h = options.height;
    const cx = w / 2;
    const cy = h / 2;

    // Base disc surface
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(0, 0, w, h);

    // Cross-drilled holes in spiral pattern
    const holeCount = 120;
    const maxRadius = Math.min(w, h) * 0.45;
    const minRadius = maxRadius * 0.35;

    for (let i = 0; i < holeCount; i++) {
      const angle = (i / holeCount) * Math.PI * 2 + (i % 3) * 0.3;
      const radius = minRadius + (maxRadius - minRadius) * ((i % 7) / 6);
      const hx = cx + Math.cos(angle) * radius;
      const hy = cy + Math.sin(angle) * radius;
      const holeRadius = 2 + Math.random() * 2;

      // Hole
      ctx.fillStyle = "#111111";
      ctx.beginPath();
      ctx.arc(hx, hy, holeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Edge highlight
      ctx.strokeStyle = "rgba(80, 80, 80, 0.4)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(hx, hy, holeRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Ventilation slots (radial lines)
    const slotCount = 24;
    for (let i = 0; i < slotCount; i++) {
      const angle = (i / slotCount) * Math.PI * 2;
      ctx.strokeStyle = "rgba(20, 20, 20, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * minRadius, cy + Math.sin(angle) * minRadius);
      ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
      ctx.stroke();
    }

    // Heat discoloration (blue-brown tint toward center)
    const heatGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
    heatGrad.addColorStop(0, "rgba(60, 40, 20, 0.15)");
    heatGrad.addColorStop(0.3, "rgba(40, 40, 80, 0.1)");
    heatGrad.addColorStop(0.7, "rgba(20, 20, 20, 0.05)");
    heatGrad.addColorStop(1, "rgba(30, 30, 30, 0)");
    ctx.fillStyle = heatGrad;
    ctx.fillRect(0, 0, w, h);

    return canvas;
  }

  /**
   * Creates a tire tread pattern for intermediate or wet compounds.
   */
  public static createTireTread(
    options: ProceduralTextureOptions = { width: 512, height: 512 },
    type: "slick" | "intermediate" | "wet" = "intermediate"
  ): HTMLCanvasElement {
    const { canvas, ctx } = this.getCanvas(options.width, options.height);
    const w = options.width;
    const h = options.height;

    // Black rubber base
    ctx.fillStyle = "#0c0c0e";
    ctx.fillRect(0, 0, w, h);

    if (type === "slick") {
      // Smooth with subtle rubber grain
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const n = (Math.random() - 0.5) * 5;
          data[idx] = data[idx + 1] = data[idx + 2] = Math.max(0, Math.min(255, 12 + n));
        }
      }
      ctx.putImageData(imageData, 0, 0);
    } else if (type === "intermediate") {
      // Shallow grooves in V-pattern
      const grooveWidth = 2;
      const grooveDepth = 0.3;
      const vCount = 8;
      const spacing = w / vCount;

      for (let v = 0; v < vCount; v++) {
        const baseX = v * spacing + spacing / 2;
        ctx.strokeStyle = `rgba(0, 0, 0, ${grooveDepth})`;
        ctx.lineWidth = grooveWidth;

        ctx.beginPath();
        for (let y = 0; y < h; y += 4) {
          const offset = Math.sin(y * 0.03) * spacing * 0.3;
          ctx.lineTo(baseX + offset, y);
        }
        ctx.stroke();
      }

      // Cross grooves
      const crossCount = 12;
      for (let c = 0; c < crossCount; c++) {
        const y = (c / crossCount) * h;
        ctx.strokeStyle = `rgba(0, 0, 0, ${grooveDepth * 0.7})`;
        ctx.lineWidth = grooveWidth * 0.8;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y + (Math.random() - 0.5) * 10);
        ctx.stroke();
      }
    } else {
      // Deep wide grooves
      const vCount = 6;
      const spacing = w / vCount;

      for (let v = 0; v < vCount; v++) {
        const baseX = v * spacing + spacing / 2;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
        ctx.lineWidth = 6;

        ctx.beginPath();
        for (let y = 0; y < h; y += 4) {
          const offset = Math.sin(y * 0.025) * spacing * 0.35;
          ctx.lineTo(baseX + offset, y);
        }
        ctx.stroke();
      }

      // Wide circumferential grooves
      for (let c = 0; c < 8; c++) {
        const y = (c / 8) * h;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Drainage channels
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * w;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + (Math.random() - 0.5) * 30, h);
        ctx.stroke();
      }
    }

    return canvas;
  }

  /**
   * Creates a roughness map from a canvas texture.
   * Dark = smooth, Bright = rough.
   */
  public static createRoughnessMap(source: HTMLCanvasElement, baseRoughness: number = 0.5): HTMLCanvasElement {
    const w = source.width;
    const h = source.height;
    const { canvas, ctx } = this.getCanvas(w, h);

    const srcCtx = source.getContext("2d")!;
    const srcData = srcCtx.getImageData(0, 0, w, h).data;

    const outData = ctx.createImageData(w, h);
    const roughnessValue = Math.floor(baseRoughness * 255);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const luminance = (srcData[idx] + srcData[idx + 1] + srcData[idx + 2]) / 3;
        const roughness = Math.floor(roughnessValue + (luminance - 128) * 0.1 + (Math.random() - 0.5) * 10);
        const clamped = Math.max(0, Math.min(255, roughness));
        outData.data[idx] = clamped;
        outData.data[idx + 1] = clamped;
        outData.data[idx + 2] = clamped;
        outData.data[idx + 3] = 255;
      }
    }

    ctx.putImageData(outData, 0, 0);
    return canvas;
  }
}
