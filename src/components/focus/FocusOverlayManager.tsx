"use client";

import React from "react";
import { FocusModeModal } from "./FocusModeModal";
import { SessionReflectionModal } from "./SessionReflectionModal";
export function FocusOverlayManager() {
  return (
    <>
      <FocusModeModal />
      <SessionReflectionModal />
    </>
  );
}
