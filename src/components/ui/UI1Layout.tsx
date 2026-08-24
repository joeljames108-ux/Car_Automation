import React from "react";
import { KineticThemeProvider } from "../ui1/KineticThemeEngine";
import { NeonHorizonShell } from "../ui1/layout/NeonHorizonShell";

export type WorkspaceCategory = "engineering" | "studios" | "simulation" | "world";

export function UI1Layout() {
  return (
    <KineticThemeProvider>
      <NeonHorizonShell />
    </KineticThemeProvider>
  );
}

export default UI1Layout;
