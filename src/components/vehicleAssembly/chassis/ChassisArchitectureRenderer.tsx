import React from "react";
import { ChassisType } from "../../../sim/types";
import { IsoChassisShaderDefs } from "./iso/IsoChassisShaderDefs";
import { IsoSteelUnibodyCasting3D } from "./iso3d/IsoSteelUnibodyCasting3D";
import { IsoCarbonMonocoqueTub3D } from "./iso3d/IsoCarbonMonocoqueTub3D";
import { IsoAluminumSpaceframe3D } from "./iso/IsoAluminumSpaceframe3D";
import { IsoTubularRollCage3D } from "./iso/IsoTubularRollCage3D";
import { IsoTitaniumTub3D } from "./iso/IsoTitaniumTub3D";

interface ChassisArchitectureRendererProps {
  chassisType?: ChassisType | string;
  isHovered?: boolean;
}

export const ChassisArchitectureRenderer: React.FC<ChassisArchitectureRendererProps> = ({
  chassisType = "monocoque",
  isHovered = false,
}) => {
  const render3DChassis = () => {
    switch (chassisType) {
      case "carbon_tub":
        return <IsoCarbonMonocoqueTub3D isHovered={isHovered} />;
      case "aluminum_spaceframe":
        return <IsoAluminumSpaceframe3D isHovered={isHovered} />;
      case "tube_frame":
        return <IsoTubularRollCage3D isHovered={isHovered} />;
      case "titanium":
        return <IsoTitaniumTub3D isHovered={isHovered} />;
      case "steel_unibody":
      case "steel_ladder":
      case "pressed_steel":
      case "monocoque":
      default:
        return <IsoSteelUnibodyCasting3D isHovered={isHovered} />;
    }
  };

  return (
    <g id="master-3d-isometric-chassis-architecture">
      <IsoChassisShaderDefs />
      {render3DChassis()}
    </g>
  );
};
