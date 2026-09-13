/**
 * BAC Mastery — Operations Core Types
 * Phase 2: Operations Foundation P0
 */

export type UserRole = "OWNER" | "OPERATOR" | "CONTENT_REVIEWER" | "TEACHER_ADMIN";

export interface UserRoleRecord {
  id: string;
  userId: string;
  role: UserRole;
  createdAt: string;
}

export type PaymentOrderStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type PaymentMethod = "baridimob" | "ccp" | "manual_transfer" | "cash" | "other";

export interface PaymentOrder {
  id: string;
  userId: string;
  plan: string;
  amount: number;
  currency: "DZD";
  paymentMethod: PaymentMethod;
  status: PaymentOrderStatus;
  receiptPath?: string | null;
  notes?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  // Extended student metadata for operational views
  studentEmail?: string;
  studentName?: string;
  studentPhone?: string;
  streamId?: string;
  wilayaName?: string;
}

export type AuditAction =
  | "PAYMENT_APPROVED"
  | "PAYMENT_REJECTED"
  | "TRIAL_EXTENDED"
  | "SUBSCRIPTION_ACTIVATED"
  | "SUBSCRIPTION_APPROVED"
  | "SUBSCRIPTION_PLAN_UPDATED"
  | "SUBSCRIPTION_OPENED"
  | "SUBSCRIPTION_CLOSED"
  | "SUBSCRIPTION_EXTENDED"
  | "SUBSCRIPTION_EXPIRED"
  | "ROLE_GRANTED"
  | "ROLE_REVOKED"
  | "STUDENT_FLAGGED"
  | "CONFIG_CHANGED"
  | "ISSUE_CREATED"
  | "ISSUE_STATUS_CHANGED"
  | "ISSUE_RESOLVED"
  | "ISSUE_DISMISSED";

export type AuditTargetType =
  | "payment_order"
  | "student_profile"
  | "user_role"
  | "subscription_plan"
  | "telemetry"
  | "system"
  | "issue";

export interface OperationsAuditLog {
  id: string;
  actorUserId?: string | null;
  actorRole: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  reason?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface IngestedTelemetryEvent {
  id?: string;
  eventId: string;
  anonymousId: string;
  sessionId: string;
  userId?: string | null;
  eventName: string;
  occurredAt: string;
  route?: string;
  stream?: string;
  subject?: string;
  skillId?: string;
  missionId?: string;
  contentId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface OperationsOverviewKPIs {
  today: {
    activeStudents: number;
    newRegistrations: number;
    missionsStarted: number;
    completedLearningEvents: number;
    pendingReceiptsCount: number;
  };
  needsAction: {
    pendingPayments: PaymentOrder[];
    atRiskTrialsCount: number;
    unresolvedHighRecurrenceErrorsCount: number;
  };
  learningActivity: {
    totalMissionsCompleted: number;
    totalPracticeAttempts: number;
    averagePracticeAccuracy: number;
    totalRetestsPassed: number;
    totalDemonstratedSkills: number;
  };
  trialAndAccess: {
    activeTrials: number;
    trialsExpiringWithin24h: number;
    expiredTrials: number;
    paidSubscribers: number;
    conversionRatePercent: number;
  };
  revenue: {
    totalRevenueDZD: number;
    approvedOrdersCount: number;
    pendingOrdersCount: number;
    rejectedOrdersCount: number;
  };
  systemHealth: {
    telemetryEventsLogged: number;
    clientErrorsCount: number;
    databaseStatus: "HEALTHY" | "DEGRADED";
    serverTime: string;
  };
  productStatus: {
    totalRegistered: number;
    studentsInTrial: number;
    activePaidStudents: number;
    expiredStudents: number;
    completedOnboarding: number;
    reachedFirstLearningActivity: number;
  };
  todayDetailed: {
    newRegistrationsToday: number;
    newTrialStartsToday: number;
    newPaymentOrdersToday: number;
    approvedPaymentsToday: number;
    rejectedPaymentsToday: number;
    activeLearningSessionsToday: number;
    errorsRecordedToday: number;
    retestsToday: number;
  };
  learningSignals: {
    completedAtLeastOneMission: number;
    completedPractice: number;
    triggeredErrorLab: number;
    completedRepair: number;
    completedRetest: number;
    demonstratingMasteryEvidence: number;
  };
  commercialOverview: {
    pendingPaymentOrders: number;
    approvedToday: number;
    rejectedToday: number;
    activeSubscriptions: number;
    subscriptionsExpiringSoon: number;
    expiredSubscriptions: number;
  };
  attentionItems: {
    id: string;
    type: string;
    severity: "P0" | "P1" | "P2" | "P3";
    title: string;
    description: string;
    targetHref: string;
    actionLabel: string;
  }[];
}

export interface StudentOperationalSummary {
  id: string;
  fullName: string;
  email?: string;
  studentPhone?: string;
  streamId?: string;
  wilayaName?: string;
  communeName?: string;
  accessStatus: "TRIAL" | "PAID" | "EXPIRED";
  plan: string;
  trialStartedAt?: string;
  trialExpiresAt?: string;
  remainingHours: number;
  targetScore: number;
  completedMissionsCount: number;
  demonstratedSkillsCount: number;
  activeErrorsCount: number;
  resolvedRetestsCount: number;
  lastActiveAt?: string;
  hasPendingPayment: boolean;
  subscriptionStartedAt?: string;
  subscriptionExpiresAt?: string;
  createdAt?: string;
  onboardingCompleted?: boolean;
}

export interface SubscriptionPlan {
  id: "season" | "monthly" | string;
  name: string;
  price_dzd: number;
  duration_months: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionAlert {
  id: string;
  type:
    | "PENDING_PAYMENT"
    | "RECEIPT_UPLOADED"
    | "EXPIRES_TODAY"
    | "EXPIRED"
    | "PLAN_CLOSED"
    | "SUBSCRIPTION_APPROVED";
  title: string;
  description: string;
  severity: "info" | "warning" | "danger" | "success";
  timestamp: string;
  targetId?: string;
}

export interface AuthoritativePlan {
  id: string;
  name_ar: string;
  name_fr: string;
  priceDZD: number;
  currency: "DZD";
  durationMonths: number;
  description_ar: string;
  description_fr: string;
}

export interface ReceiptValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFileName?: string;
}

export interface ReceiptUploadResult {
  success: boolean;
  receiptPath?: string;
  error?: string;
}

export interface ReceiptViewResult {
  success: boolean;
  url?: string;
  error?: string;
  status?: number;
}

export type PlanOperationalState = "ACTIVE" | "CLOSED" | "NOT_CONFIGURED";

export type IssueCategory =
  | "payment"
  | "access"
  | "subscription"
  | "trial"
  | "telemetry"
  | "learning"
  | "content"
  | "system"
  | "security";

export type IssueSeverity = "P0" | "P1" | "P2" | "P3";

export type IssueStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";

export interface OperationsIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  description: string;
  relatedStudentId?: string | null;
  relatedOrderId?: string | null;
  relatedEventId?: string | null;
  resolution?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ContentVerificationStatus =
  | "DRAFT"
  | "MAPPED"
  | "QUALITY_CHECKED"
  | "INTERNALLY_VERIFIED"
  | "PUBLISHED"
  | "NEEDS_REVIEW";

export type ContentProvenanceSource =
  | "OFFICIAL_CURRENT"
  | "OFFICIAL_HISTORICAL"
  | "AUTHENTIC_BAC"
  | "TEXTBOOK"
  | "BAC_MASTERY_ORIGINAL"
  | "EXTERNAL_REFERENCE"
  | "UNVERIFIED";

export interface ContentSkillSummary {
  id: string;
  name: string;
  streamId: string;
  subjectId: string;
  domainId: string;
  verificationStatus: ContentVerificationStatus;
  curriculumStatus: string;
  sourceType: ContentProvenanceSource;
  language: string;
  lastVerificationDate?: string;
  hasPracticeVariant: boolean;
  hasRetestVariant: boolean;
  missingResources?: string[];
}

