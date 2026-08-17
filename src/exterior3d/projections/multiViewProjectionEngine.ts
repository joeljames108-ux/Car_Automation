// ============================================================================
// PHASE 09 — MULTI-VIEW PROJECTION ENGINE & TECHNICAL BLUEPRINT GENERATOR
// ============================================================================
// Mathematical 2D projection engine computing SVG vector paths, dimension
// callouts, datum centerlines, and hidden-line occlusion from 3D hardpoints.
// Supports Top (Plan), Left Side, Front, Rear, and 30° Axonometric Isometric views.
// ============================================================================

import { Point3D_MM, CanvasPoint2D, Master3DCoordinateSystem } from '../geometry/masterCoordinateSystem';
import { MASTER_HARDPOINT_TAXONOMY, HardpointDefinition } from '../geometry/hardpointTaxonomy';
import { ParametricHardpointSolver, VehicleDimensionalParams, SolvedHardpointInstance } from '../geometry/parametricHardpointSolver';

export type ProjectionViewType = 'TOP_PLAN' | 'SIDE_PROFILE' | 'FRONT_ELEVATION' | 'REAR_ELEVATION' | 'ISOMETRIC_AXONOMETRIC';

export interface BlueprintViewportConfig {
  viewType: ProjectionViewType;
  canvasWidthPx: number;
  canvasHeightPx: number;
  scalePxPerMm: number;
  centerOriginPx: CanvasPoint2D;
  showCenterlines: boolean;
  showDimensionCallouts: boolean;
  showHardpointNodes: boolean;
  showFastenerTorqueLabels: boolean;
}

export interface SVGPathElement {
  id: string;
  d: string;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  strokeDashArray?: string;
  opacity?: number;
}

export interface SVGTextElement {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fillColor: string;
  textAnchor: 'start' | 'middle' | 'end';
}

export interface RenderedBlueprintView {
  viewType: ProjectionViewType;
  viewBox: string;
  paths: SVGPathElement[];
  labels: SVGTextElement[];
  dimensionLines: SVGPathElement[];
  hardpointMarkers: { x: number; y: number; id: string; zone: string; torqueNm: number }[];
}

export class MultiViewProjectionEngine {
  /**
   * Generates a complete SVG Blueprint representation for a given projection view.
   */
  public static renderBlueprint(
    viewType: ProjectionViewType,
    params: VehicleDimensionalParams,
    config?: Partial<BlueprintViewportConfig>
  ): RenderedBlueprintView {
    const cfg: BlueprintViewportConfig = {
      viewType,
      canvasWidthPx: 900,
      canvasHeightPx: 550,
      scalePxPerMm: 0.16,
      centerOriginPx: { x: 450, y: 275 },
      showCenterlines: true,
      showDimensionCallouts: true,
      showHardpointNodes: true,
      showFastenerTorqueLabels: true,
      ...config,
    };

    const solvedHardpoints = ParametricHardpointSolver.solveAllHardpoints(params);
    const paths: SVGPathElement[] = [];
    const labels: SVGTextElement[] = [];
    const dimensionLines: SVGPathElement[] = [];
    const hardpointMarkers: RenderedBlueprintView['hardpointMarkers'] = [];

    // 1. Project Hardpoint Nodes to 2D
    for (const [id, inst] of solvedHardpoints.entries()) {
      const p2d = this.projectPoint(inst.worldPositionMm, cfg.viewType, cfg.scalePxPerMm, cfg.centerOriginPx);
      hardpointMarkers.push({
        x: Math.round(p2d.x * 10) / 10,
        y: Math.round(p2d.y * 10) / 10,
        id,
        zone: inst.definition.zone,
        torqueNm: inst.definition.nominalTorqueNm,
      });

      if (cfg.showFastenerTorqueLabels && inst.definition.nominalTorqueNm > 0) {
        labels.push({
          x: p2d.x + 8,
          y: p2d.y - 4,
          text: `${inst.definition.nominalTorqueNm}Nm`,
          fontSize: 9,
          fillColor: '#38bdf8',
          textAnchor: 'start',
        });
      }
    }

    // 2. Generate Structural Outline Wireframe
    const wireframePath = this.generateVehicleOutlinePath(params, cfg);
    paths.push(wireframePath);

    // 3. Generate Centerlines & Datum Lines
    if (cfg.showCenterlines) {
      const centerlines = this.generateCenterlines(params, cfg);
      paths.push(...centerlines);
    }

    // 4. Generate Dimension Callouts
    if (cfg.showDimensionCallouts) {
      const dims = this.generateDimensionLines(params, cfg);
      dimensionLines.push(...dims.lines);
      labels.push(...dims.labels);
    }

    return {
      viewType,
      viewBox: `0 0 ${cfg.canvasWidthPx} ${cfg.canvasHeightPx}`,
      paths,
      labels,
      dimensionLines,
      hardpointMarkers,
    };
  }

  /**
   * Projects a 3D millimeter point to 2D canvas coordinates based on the view type.
   */
  public static projectPoint(
    pt: Point3D_MM,
    viewType: ProjectionViewType,
    scale: number,
    center: CanvasPoint2D
  ): CanvasPoint2D {
    switch (viewType) {
      case 'TOP_PLAN':
        return Master3DCoordinateSystem.projectTopView(pt, scale, center);
      case 'SIDE_PROFILE':
        return Master3DCoordinateSystem.projectSideView(pt, scale, center);
      case 'FRONT_ELEVATION':
        return Master3DCoordinateSystem.projectFrontView(pt, scale, center);
      case 'REAR_ELEVATION':
        return {
          x: center.x - pt.x * scale, // Looking from rear, +X (right) is on the right
          y: center.y - pt.y * scale,
        };
      case 'ISOMETRIC_AXONOMETRIC':
      default:
        return Master3DCoordinateSystem.projectIsometricView(pt, {
          viewAngleDeg: 30,
          scalePxPerMm: scale,
          originCanvasX: center.x,
          originCanvasY: center.y,
        });
    }
  }

  /**
   * Generates structural silhouette SVG path based on dimensional parameters.
   */
  private static generateVehicleOutlinePath(
    params: VehicleDimensionalParams,
    cfg: BlueprintViewportConfig
  ): SVGPathElement {
    const s = cfg.scalePxPerMm;
    const c = cfg.centerOriginPx;

    if (cfg.viewType === 'SIDE_PROFILE') {
      const fWheelCenter = this.projectPoint({ x: 0, y: 330, z: 0 }, cfg.viewType, s, c);
      const rWheelCenter = this.projectPoint({ x: 0, y: 330, z: -params.wheelbaseMm }, cfg.viewType, s, c);
      const noseTip = this.projectPoint({ x: 0, y: 380, z: params.frontOverhangMm }, cfg.viewType, s, c);
      const cowlPoint = this.projectPoint({ x: 0, y: 880, z: -params.engineBayLengthMm * 0.7 }, cfg.viewType, s, c);
      const roofPeak = this.projectPoint({ x: 0, y: params.roofHeightMm, z: -params.wheelbaseMm * 0.45 }, cfg.viewType, s, c);
      const rearGlass = this.projectPoint({ x: 0, y: 920, z: -params.wheelbaseMm * 0.85 }, cfg.viewType, s, c);
      const tailTip = this.projectPoint({ x: 0, y: 720, z: -params.wheelbaseMm - params.rearOverhangMm }, cfg.viewType, s, c);
      const diffuserBottom = this.projectPoint({ x: 0, y: params.rideHeightMm, z: -params.wheelbaseMm - params.rearOverhangMm * 0.8 }, cfg.viewType, s, c);
      const splitterBottom = this.projectPoint({ x: 0, y: params.rideHeightMm, z: params.frontOverhangMm * 0.9 }, cfg.viewType, s, c);

      const d = `
        M ${noseTip.x} ${noseTip.y}
        Q ${noseTip.x - 30} ${cowlPoint.y + 20} ${cowlPoint.x} ${cowlPoint.y}
        L ${roofPeak.x} ${roofPeak.y}
        Q ${roofPeak.x - 60} ${roofPeak.y} ${rearGlass.x} ${rearGlass.y}
        L ${tailTip.x} ${tailTip.y}
        L ${diffuserBottom.x} ${diffuserBottom.y}
        L ${rWheelCenter.x + 55} ${rWheelCenter.y + 40}
        A 55 55 0 0 0 ${rWheelCenter.x - 55} ${rWheelCenter.y + 40}
        L ${fWheelCenter.x + 55} ${fWheelCenter.y + 40}
        A 55 55 0 0 0 ${fWheelCenter.x - 55} ${fWheelCenter.y + 40}
        L ${splitterBottom.x} ${splitterBottom.y}
        Z
      `.replace(/\s+/g, ' ').trim();

      return {
        id: 'SIDE_SILHOUETTE_OUTLINE',
        d,
        strokeColor: '#00f0ff',
        strokeWidth: 2.0,
        fillColor: 'rgba(0, 240, 255, 0.04)',
      };
    }

    if (cfg.viewType === 'TOP_PLAN') {
      const halfW = (params.cabinWidthMm / 2.0) * s;
      const noseZ = (params.frontOverhangMm) * s;
      const tailZ = (-params.wheelbaseMm - params.rearOverhangMm) * s;

      const d = `
        M ${c.x} ${c.y - noseZ}
        Q ${c.x + halfW} ${c.y - noseZ + 40} ${c.x + halfW} ${c.y}
        L ${c.x + halfW} ${c.y - tailZ - 60}
        Q ${c.x + halfW * 0.85} ${c.y - tailZ} ${c.x} ${c.y - tailZ}
        Q ${c.x - halfW * 0.85} ${c.y - tailZ} ${c.x - halfW} ${c.y - tailZ - 60}
        L ${c.x - halfW} ${c.y}
        Q ${c.x - halfW} ${c.y - noseZ + 40} ${c.x} ${c.y - noseZ}
        Z
      `.replace(/\s+/g, ' ').trim();

      return {
        id: 'TOP_PLAN_OUTLINE',
        d,
        strokeColor: '#00f0ff',
        strokeWidth: 2.0,
        fillColor: 'rgba(0, 240, 255, 0.04)',
      };
    }

    // Default Fallback Wireframe
    return {
      id: 'FALLBACK_FRAME',
      d: `M ${c.x - 150} ${c.y} L ${c.x + 150} ${c.y}`,
      strokeColor: '#38bdf8',
      strokeWidth: 1.5,
      fillColor: 'none',
    };
  }

  /**
   * Generates centerline and reference datum axes.
   */
  private static generateCenterlines(
    params: VehicleDimensionalParams,
    cfg: BlueprintViewportConfig
  ): SVGPathElement[] {
    const s = cfg.scalePxPerMm;
    const c = cfg.centerOriginPx;
    const lines: SVGPathElement[] = [];

    if (cfg.viewType === 'TOP_PLAN' || cfg.viewType === 'FRONT_ELEVATION' || cfg.viewType === 'REAR_ELEVATION') {
      // Longitudinal Centerline (CL)
      lines.push({
        id: 'DATUM_LONGITUDINAL_CENTERLINE',
        d: `M ${c.x} 20 L ${c.x} ${cfg.canvasHeightPx - 20}`,
        strokeColor: '#ef4444',
        strokeWidth: 1.0,
        strokeDashArray: '8, 4, 2, 4',
        fillColor: 'none',
        opacity: 0.75,
      });
    }

    if (cfg.viewType === 'SIDE_PROFILE') {
      // Ground Plane Datum (Y = 0)
      const groundY = c.y;
      lines.push({
        id: 'DATUM_GROUND_PLANE',
        d: `M 30 ${groundY} L ${cfg.canvasWidthPx - 30} ${groundY}`,
        strokeColor: '#ef4444',
        strokeWidth: 1.0,
        strokeDashArray: '10, 4',
        fillColor: 'none',
        opacity: 0.65,
      });

      // Front Axle Datum Line (Z = 0)
      const fAxleX = c.x;
      lines.push({
        id: 'DATUM_FRONT_AXLE_LINE',
        d: `M ${fAxleX} 50 L ${fAxleX} ${cfg.canvasHeightPx - 50}`,
        strokeColor: '#eab308',
        strokeWidth: 1.0,
        strokeDashArray: '6, 3',
        fillColor: 'none',
        opacity: 0.75,
      });

      // Rear Axle Datum Line (Z = -wheelbase)
      const rAxleX = c.x - params.wheelbaseMm * s;
      lines.push({
        id: 'DATUM_REAR_AXLE_LINE',
        d: `M ${rAxleX} 50 L ${rAxleX} ${cfg.canvasHeightPx - 50}`,
        strokeColor: '#eab308',
        strokeWidth: 1.0,
        strokeDashArray: '6, 3',
        fillColor: 'none',
        opacity: 0.75,
      });
    }

    return lines;
  }

  /**
   * Generates technical dimension callout leaders and text annotations.
   */
  private static generateDimensionLines(
    params: VehicleDimensionalParams,
    cfg: BlueprintViewportConfig
  ): { lines: SVGPathElement[]; labels: SVGTextElement[] } {
    const s = cfg.scalePxPerMm;
    const c = cfg.centerOriginPx;
    const lines: SVGPathElement[] = [];
    const labels: SVGTextElement[] = [];

    if (cfg.viewType === 'SIDE_PROFILE') {
      const fAxleX = c.x;
      const rAxleX = c.x - params.wheelbaseMm * s;
      const dimY = c.y + 55;

      // Wheelbase Dimension Leader Line
      lines.push({
        id: 'DIM_WHEELBASE_LINE',
        d: `M ${rAxleX} ${dimY} L ${fAxleX} ${dimY} M ${rAxleX} ${dimY - 8} L ${rAxleX} ${dimY + 8} M ${fAxleX} ${dimY - 8} L ${fAxleX} ${dimY + 8}`,
        strokeColor: '#a855f7',
        strokeWidth: 1.2,
        fillColor: 'none',
      });

      labels.push({
        x: (fAxleX + rAxleX) / 2.0,
        y: dimY - 6,
        text: `Wheelbase: ${params.wheelbaseMm} mm`,
        fontSize: 11,
        fillColor: '#d8b4fe',
        textAnchor: 'middle',
      });
    }

    return { lines, labels };
  }
}
