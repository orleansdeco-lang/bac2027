/**
 * BAC Mastery - Adaptive Roadmap Module
 * Prompt 06: Bridge between storage and the pure decision engine.
 */

import { buildAdaptiveRoadmap } from "./engine";
import { AdaptiveRoadmapState, AdaptiveRoadmapInput } from "@/types/roadmap";
import { getStrategicProfile } from "@/lib/onboarding/profile";
import { loadDiagnosticResults } from "@/lib/diagnostic";
import {
  loadMissions,
  loadMasteryRecords,
  getAllErrorsList,
} from "@/lib/mission/storage";

/**
 * Loads current browser evidence from localStorage and runs the pure engine
 */
export function getComputedAdaptiveRoadmap(
  overrides?: Partial<AdaptiveRoadmapInput>
): AdaptiveRoadmapState {
  const profile = getStrategicProfile();
  const diagnosticResult = loadDiagnosticResults();
  const missions = loadMissions();
  const masteryEvidence = loadMasteryRecords();
  const errors = getAllErrorsList();

  const input: AdaptiveRoadmapInput = {
    onboardingProfile: overrides?.onboardingProfile !== undefined ? overrides.onboardingProfile : profile,
    diagnosticResult: overrides?.diagnosticResult !== undefined ? overrides.diagnosticResult : diagnosticResult,
    missions: overrides?.missions !== undefined ? overrides.missions : missions,
    masteryEvidence: overrides?.masteryEvidence !== undefined ? overrides.masteryEvidence : masteryEvidence,
    errors: overrides?.errors !== undefined ? overrides.errors : errors,
    energyState: overrides?.energyState,
  };

  return buildAdaptiveRoadmap(input);
}

export * from "./engine";
