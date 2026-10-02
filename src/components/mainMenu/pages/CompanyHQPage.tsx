import React from "react";
import { CampusMapMasterView } from "../../campus/CampusMapMasterView";
import type { Stage } from "../../StageSwitcher";

interface CompanyHQPageProps {
  onSelectStage: (stage: Stage) => void;
}

export const CompanyHQPage: React.FC<CompanyHQPageProps> = ({ onSelectStage }) => {
  return <CampusMapMasterView onSelectStage={onSelectStage} />;
};
