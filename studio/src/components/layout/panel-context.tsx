"use client";

import { createContext, useContext } from "react";

interface PanelControls {
  collapseSidebar: () => void;
  collapseRightPanel: () => void;
}

export const PanelContext = createContext<PanelControls>({
  collapseSidebar: () => {},
  collapseRightPanel: () => {},
});

export function usePanelControls() {
  return useContext(PanelContext);
}
