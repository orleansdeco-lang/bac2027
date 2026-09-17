/**
 * BAC Mastery — Server-Side Student Persistence & Directory Service
 * Ensures all registered students are permanently visible to operators in /ops
 */

import fs from "fs";
import path from "path";
import { StudentOperationalSummary } from "./types";

function getDurableStudentsPath(): string {
  const dir = path.join(process.cwd(), ".runtime");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return path.join(dir, "students.json");
}

const memoryServerStudents = new Map<string, StudentOperationalSummary>();

export function loadServerStudentProfiles(): StudentOperationalSummary[] {
  if (typeof window !== "undefined") return Array.from(memoryServerStudents.values());

  try {
    const filePath = getDurableStudentsPath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item?.id && !memoryServerStudents.has(item.id)) {
            memoryServerStudents.set(item.id, item);
          }
        }
      }
    }
  } catch {}

  return Array.from(memoryServerStudents.values());
}

export function saveServerStudentProfile(student: Partial<StudentOperationalSummary> & { id: string }): StudentOperationalSummary {
  loadServerStudentProfiles();

  const existing = memoryServerStudents.get(student.id);
  const updated: StudentOperationalSummary = {
    id: student.id,
    fullName: student.fullName || existing?.fullName || "طالب مسجل",
    email: student.email || existing?.email,
    studentPhone: student.studentPhone || existing?.studentPhone,
    streamId: student.streamId || existing?.streamId || "sciences_exp",
    wilayaName: student.wilayaName || existing?.wilayaName,
    communeName: student.communeName || existing?.communeName,
    accessStatus:
      existing?.accessStatus === "PAID" && student.accessStatus !== "EXPIRED" && student.accessStatus !== "REJECTED"
        ? "PAID"
        : student.accessStatus || existing?.accessStatus || "TRIAL",
    plan:
      existing?.accessStatus === "PAID" && (!student.plan || student.plan === "PILOT_TRIAL")
        ? existing.plan || "season"
        : student.plan || existing?.plan || "season",
    trialStartedAt: student.trialStartedAt || existing?.trialStartedAt || new Date().toISOString(),
    trialExpiresAt: student.trialExpiresAt || existing?.trialExpiresAt,
    remainingHours: student.remainingHours !== undefined ? student.remainingHours : existing?.remainingHours ?? 72,
    targetScore: student.targetScore !== undefined ? student.targetScore : existing?.targetScore ?? 16.0,
    completedMissionsCount: student.completedMissionsCount || existing?.completedMissionsCount || 0,
    demonstratedSkillsCount: student.demonstratedSkillsCount || existing?.demonstratedSkillsCount || 0,
    activeErrorsCount: student.activeErrorsCount || existing?.activeErrorsCount || 0,
    resolvedRetestsCount: student.resolvedRetestsCount || existing?.resolvedRetestsCount || 0,
    lastActiveAt: new Date().toISOString(),
    hasPendingPayment: student.hasPendingPayment !== undefined ? student.hasPendingPayment : existing?.hasPendingPayment ?? false,
    subscriptionStartedAt: student.subscriptionStartedAt || existing?.subscriptionStartedAt,
    subscriptionExpiresAt: student.subscriptionExpiresAt || existing?.subscriptionExpiresAt,
    rejectionReason: student.rejectionReason !== undefined ? student.rejectionReason : existing?.rejectionReason,
    createdAt: student.createdAt || existing?.createdAt || new Date().toISOString(),
    onboardingCompleted: student.onboardingCompleted !== undefined ? student.onboardingCompleted : existing?.onboardingCompleted ?? true,
  };

  memoryServerStudents.set(student.id, updated);

  if (typeof window === "undefined") {
    try {
      const filePath = getDurableStudentsPath();
      fs.writeFileSync(filePath, JSON.stringify(Array.from(memoryServerStudents.values()), null, 2), "utf8");
    } catch {}
  }

  return updated;
}
