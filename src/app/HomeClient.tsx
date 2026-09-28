"use client";

import React, { Suspense } from "react";
import { LandingView } from "@/components/landing/LandingView";

export function HomeClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070B14]" />}>
      <LandingView />
    </Suspense>
  );
}

