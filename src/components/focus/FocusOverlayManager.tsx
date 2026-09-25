"use client";

import React from "react";
import { FocusModeModal } from "./FocusModeModal";
import { SessionReflectionModal } from "./SessionReflectionModal";
import { AmbientAudioPlayer } from "@/components/study-os";

export function FocusOverlayManager() {
  return (
    <>
      <FocusModeModal />
      <SessionReflectionModal />
      <AmbientAudioPlayer />
    </>
  );
}
