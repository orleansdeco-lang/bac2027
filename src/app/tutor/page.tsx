"use client";

import React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { BacAITutor } from "@/components/tutor/BacAITutor";

export default function TutorPage() {
  return (
    <AppShell activeNav="tutor">
      <Container size="xl" className="py-4 sm:py-6">
        <BacAITutor />
      </Container>
    </AppShell>
  );
}
