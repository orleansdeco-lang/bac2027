/**
 * BAC Mastery — Server-Side Student Persistence & Directory Service
 * Ensures all registered students are permanently visible to operators in /ops
 */

import fs from "fs";
import path from "path";
import os from "os";
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

function getTmpStudentsPath(): string {
  return path.join(os.tmpdir(), "bac_students.json");
}

export function isRealStudentId(id?: string): boolean {
  if (!id) return false;
  const lower = id.toLowerCase();
  if (
    lower.startsWith("test-") ||
    lower.startsWith("test_") ||
    lower.startsWith("mock-") ||
    lower.startsWith("mock_") ||
    lower.startsWith("student_")
  ) {
    return false;
  }
  return true;
}

const memoryServerStudents = new Map<string, StudentOperationalSummary>();

export function loadServerStudentProfiles(): StudentOperationalSummary[] {
  if (typeof window !== "undefined") return Array.from(memoryServerStudents.values());

  // 1. Check bundled .runtime storage (authoritative)
  try {
    const filePath = getDurableStudentsPath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item?.id && isRealStudentId(item.id) && !memoryServerStudents.has(item.id)) {
            memoryServerStudents.set(item.id, item);
          }
        }
      }
    }
  } catch {}

  // Filter out any mock/test entries from memory
  for (const [id] of Array.from(memoryServerStudents.entries())) {
    if (!isRealStudentId(id)) {
      memoryServerStudents.delete(id);
    }
  }

  const all = Array.from(memoryServerStudents.values());
  (globalThis as any).__BAC_STUDENTS_REGISTRY__ = all;
  return all;
}

export function saveServerStudentProfile(student: Partial<StudentOperationalSummary> & { id: string }): StudentOperationalSummary {
  loadServerStudentProfiles();

  const existing = memoryServerStudents.get(student.id);

  // Protect PAID status if currently PAID or if subscription expires in the future
  const subExpiresAt = student.subscriptionExpiresAt || existing?.subscriptionExpiresAt;
  const isPaidActive = Boolean(
    (existing?.accessStatus === "PAID" || student.accessStatus === "PAID") &&
    subExpiresAt &&
    new Date(subExpiresAt).getTime() > Date.now()
  );

  let finalAccessStatus: "TRIAL" | "PAID" | "EXPIRED" | "REJECTED" = "TRIAL";
  if (isPaidActive || student.accessStatus === "PAID" || (existing?.accessStatus === "PAID" && student.accessStatus !== "EXPIRED" && student.accessStatus !== "REJECTED")) {
    finalAccessStatus = "PAID";
  } else if (student.accessStatus) {
    finalAccessStatus = student.accessStatus;
  } else if (existing?.accessStatus) {
    finalAccessStatus = existing.accessStatus;
  }

  const updated: StudentOperationalSummary = {
    id: student.id,
    fullName: student.fullName || existing?.fullName || "طالب مسجل",
    email: student.email || existing?.email,
    studentPhone: student.studentPhone || existing?.studentPhone,
    parentPhone: student.parentPhone || existing?.parentPhone,
    streamId: student.streamId || existing?.streamId || "sciences_exp",
    wilayaName: student.wilayaName || existing?.wilayaName,
    communeName: student.communeName || existing?.communeName,
    accessStatus: finalAccessStatus,
    plan:
      finalAccessStatus === "PAID" && (!student.plan || student.plan === "PILOT_TRIAL")
        ? existing?.plan || "season"
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
    subscriptionExpiresAt: subExpiresAt,
    rejectionReason: student.rejectionReason !== undefined ? student.rejectionReason : existing?.rejectionReason,
    createdAt: student.createdAt || existing?.createdAt || new Date().toISOString(),
    onboardingCompleted: student.onboardingCompleted !== undefined ? student.onboardingCompleted : existing?.onboardingCompleted ?? true,
    referral_code: student.referral_code || existing?.referral_code,
    referred_by_code: student.referred_by_code || existing?.referred_by_code,
    credit_balance_dzd: student.credit_balance_dzd !== undefined ? student.credit_balance_dzd : existing?.credit_balance_dzd ?? 0,
  };

  memoryServerStudents.set(student.id, updated);
  const all = Array.from(memoryServerStudents.values());
  (globalThis as any).__BAC_STUDENTS_REGISTRY__ = all;

  if (typeof window === "undefined") {
    // 1. Write to /tmp
    try {
      const tmpPath = getTmpStudentsPath();
      fs.writeFileSync(tmpPath, JSON.stringify(all, null, 2), "utf8");
    } catch {}

    // 2. Write to .runtime
    try {
      const filePath = getDurableStudentsPath();
      fs.writeFileSync(filePath, JSON.stringify(all, null, 2), "utf8");
    } catch {}
  }

  return updated;
}
