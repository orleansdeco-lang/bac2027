/**
 * BAC Mastery - Repository Layer Index
 * Central access point for data persistence (Supabase + LocalStorage fallback)
 */

export { StudentRepository } from "./student-repository";
export { DiagnosticRepository } from "./diagnostic-repository";
export { MissionRepository } from "./mission-repository";
export { PracticeRepository } from "./practice-repository";
export { ErrorRepository } from "./error-repository";
export { MasteryRepository } from "./mastery-repository";

import { StudentRepository } from "./student-repository";
import { DiagnosticRepository } from "./diagnostic-repository";
import { MissionRepository } from "./mission-repository";
import { ErrorRepository } from "./error-repository";
import { MasteryRepository } from "./mastery-repository";

/**
 * Perform a full non-destructive synchronization of local prototype data
 * into Supabase when a user signs in.
 */
export async function syncAllLocalStorageToCloud(userId: string): Promise<void> {
  try {
    await Promise.allSettled([
      StudentRepository.syncLocalToCloud(userId),
      DiagnosticRepository.syncLocalToCloud(userId),
      MissionRepository.syncLocalToCloud(userId),
      ErrorRepository.syncLocalToCloud(userId),
      MasteryRepository.syncLocalToCloud(userId),
    ]);
  } catch (err) {
    console.error("syncAllLocalStorageToCloud error:", err);
  }
}
