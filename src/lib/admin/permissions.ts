/**
 * SHATER Control Center — Granular Permission System
 * Authoritative RBAC & Permission Matrix
 * 
 * Strict Invariants:
 * 1. Permissions are evaluated server-side.
 * 2. Unregistered or unknown permissions are rejected by default.
 * 3. OWNER possesses all permissions without exception.
 * 4. OPERATOR possesses standard platform and operational management permissions.
 * 5. CONTENT_REVIEWER is strictly scoped to pedagogy, exercises, and curriculum.
 * 6. TEACHER_ADMIN is strictly scoped to learning analytics and question banks.
 */

import { UserRole } from "@/lib/operations/types";

export type AdminPermission =
  // Platform & System Governance
  | "platform.read"
  | "platform.manage"

  // Students Directory & Academic Dossiers
  | "students.read"
  | "students.manage"

  // Educational Content & Curriculum
  | "content.read"
  | "content.manage"

  // Question & Exercise Bank
  | "exercises.read"
  | "exercises.manage"

  // Learning Analytics & Mastery Data
  | "learning.read"
  | "learning.manage"

  // Official University Orientation 2026 Engine
  | "orientation.read"
  | "orientation.manage"

  // Virtual Study Rooms (Diwan & Majlis)
  | "study_rooms.read"
  | "study_rooms.manage"

  // Advertising, Announcements & Campaigns
  | "ads.read"
  | "ads.manage"

  // Traffic, Conversion & Platform Analytics
  | "analytics.read"

  // AI Assistant Capabilities
  | "ai.use"
  | "ai.execute"

  // Governance & Audit Logs
  | "audit.read"

  // Orders & COD Logistics Management
  | "orders.read"
  | "orders.manage";

export const ALL_ADMIN_PERMISSIONS: readonly AdminPermission[] = [
  "platform.read",
  "platform.manage",
  "students.read",
  "students.manage",
  "orders.read",
  "orders.manage",
  "content.read",
  "content.manage",
  "exercises.read",
  "exercises.manage",
  "learning.read",
  "learning.manage",
  "orientation.read",
  "orientation.manage",
  "study_rooms.read",
  "study_rooms.manage",
  "ads.read",
  "ads.manage",
  "analytics.read",
  "ai.use",
  "ai.execute",
  "audit.read",
] as const;

/**
 * Authoritative Permission Matrix by Canonical Role
 */
export const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<AdminPermission>> = {
  OWNER: new Set<AdminPermission>(ALL_ADMIN_PERMISSIONS),

  OPERATOR: new Set<AdminPermission>([
    "platform.read",
    "students.read",
    "students.manage",
    "orders.read",
    "orders.manage",
    "content.read",
    "content.manage",
    "exercises.read",
    "exercises.manage",
    "learning.read",
    "learning.manage",
    "orientation.read",
    "orientation.manage",
    "study_rooms.read",
    "study_rooms.manage",
    "ads.read",
    "ads.manage",
    "analytics.read",
    "ai.use",
    "ai.execute",
    "audit.read",
  ]),

  CONTENT_REVIEWER: new Set<AdminPermission>([
    "content.read",
    "content.manage",
    "exercises.read",
    "exercises.manage",
    "learning.read",
    "orientation.read",
    "ai.use",
  ]),

  TEACHER_ADMIN: new Set<AdminPermission>([
    "content.read",
    "exercises.read",
    "exercises.manage",
    "learning.read",
    "ai.use",
  ]),
};

/**
 * Checks whether a given role holds the specified permission
 */
export function hasPermission(role: UserRole | null | undefined, permission: AdminPermission): boolean {
  if (!role) return false;
  const roleSet = ROLE_PERMISSIONS[role];
  if (!roleSet) return false;
  return roleSet.has(permission);
}

/**
 * Checks whether a given role holds ALL specified permissions
 */
export function hasAllPermissions(role: UserRole | null | undefined, permissions: AdminPermission[]): boolean {
  if (!role || permissions.length === 0) return false;
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Checks whether a given role holds AT LEAST ONE of the specified permissions
 */
export function hasAnyPermission(role: UserRole | null | undefined, permissions: AdminPermission[]): boolean {
  if (!role || permissions.length === 0) return false;
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Returns the set of permissions associated with a user role
 */
export function getPermissionsForRole(role: UserRole | null | undefined): AdminPermission[] {
  if (!role) return [];
  const set = ROLE_PERMISSIONS[role];
  return set ? Array.from(set) : [];
}

/**
 * Human-readable Arabic label for permissions
 */
export const PERMISSION_LABELS_AR: Record<AdminPermission, string> = {
  "platform.read": "الاطلاع على النظام العام",
  "platform.manage": "إدارة إعدادات النظام الحساسة",
  "students.read": "تصفح بيانات وسجلات الطلاب",
  "students.manage": "تعديل اشتراكات وحسابات الطلاب",
  "content.read": "معاينة المنهاج والدروس",
  "content.manage": "تعديل واعتماد المحتوى التعليمي",
  "exercises.read": "استعراض بنك التمارين والمواضيع",
  "exercises.manage": "نشر وحذف التمارين والحلول النموذجية",
  "learning.read": "الاطلاع على تحليلات التعلم والتمكن",
  "learning.manage": "إدارة مسارات ومهارات التعلم",
  "orientation.read": "معاينة دليل التوجيه الجامعي",
  "orientation.manage": "تحديث قواعد التوجيه ومعدلات القبول",
  "study_rooms.read": "مراقبة غرف المجلس والمذاكرة",
  "study_rooms.manage": "إدارة وضبط طاولات وغرف المذاكرة",
  "ads.read": "الاطلاع على الحملات الإعلانية",
  "ads.manage": "إنشاء وتفعيل الإعلانات والبانرات",
  "analytics.read": "الاطلاع على حركة الزوار والمبيعات",
  "ai.use": "استخدام مساعد SHATER الإداري",
  "ai.execute": "اعتماد وتنفيذ مقترحات الذكاء الاصطناعي",
  "audit.read": "الاطلاع على سجل التدقيق والعمليات",
  "orders.read": "الاطلاع على طلبات التوصيل (COD)",
  "orders.manage": "معالجة وإدارة طلبات التوصيل وتفعيل الاشتراكات",
};
