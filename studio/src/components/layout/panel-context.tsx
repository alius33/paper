"use client";

import { createContext, useContext } from "react";

interface PanelControls {
  collapseSidebar: () => void;
  collapseRightPanel: () => void;
  toggleMobileSidebar: () => void;
  toggleMobileRightPanel: () => void;
  isMobile: boolean;
}

export const PanelContext = createContext<PanelControls>({
  collapseSidebar: () => {},
  collapseRightPanel: () => {},
  toggleMobileSidebar: () => {},
  toggleMobileRightPanel: () => {},
  isMobile: false,
});

export function usePanelControls() {
  return useContext(PanelContext);
}
