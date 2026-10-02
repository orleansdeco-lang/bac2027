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

export type PaymentMethod = "baridimob" | "ccp" | "manual_transfer" | "cash" | "voucher" | "other" | "cod";

export type OrderType = "ONLINE" | "COD";

export type DeliveryStatus = "NOT_APPLICABLE" | "PENDING" | "DISPATCHED" | "DELIVERED" | "FAILED" | "CANCELLED";

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
  // SHATER Pass / COD fields
  orderType?: OrderType;
  shippingName?: string | null;
  shippingPhone?: string | null;
  parentPhone?: string | null;
  shippingWilaya?: string | null;
  shippingCommune?: string | null;
  shippingAddress?: string | null;
  deliveryStatus?: DeliveryStatus;
  trackingNumber?: string | null;
  voucherCode?: string | null;
}

export type AuditAction =
  | "PAYMENT_APPROVED"
  | "PAYMENT_REJECTED"
  | "COD_ORDER_CREATED"
  | "COD_DELIVERY_CONFIRMED"
  | "VOUCHER_REDEEMED"
  | "REFERRAL_CREDIT_AWARDED"
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
  | "ISSUE_DISMISSED"
  | "SYSTEM_PURGE_TEST_DATA";

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
  visitorId?: string;
  anonymousId: string;
  sessionId: string;
  userId?: string | null;
  eventName: string;
  occurredAt: string;
  route?: string;
  pagePath?: string;
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
  parentPhone?: string;
  streamId?: string;
  wilayaName?: string;
  communeName?: string;
  schoolName?: string;
  accessStatus: "TRIAL" | "PAID" | "EXPIRED" | "REJECTED";
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
  rejectionReason?: string;
  createdAt?: string;
  onboardingCompleted?: boolean;
  referral_code?: string;
  referred_by_code?: string;
  credit_balance_dzd?: number;
}

export interface SubscriptionPlan {
  id: "season" | "monthly" | string;
  name: string;
  price_dzd: number;
  duration_months: number;
  active: boolean;
  features?: string[];
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

// ------------------------------------------------------------------------------
// PHASE 3: COMMAND CENTER DASHBOARD & TELEMETRY FUNNEL TYPES
// ------------------------------------------------------------------------------

export interface DashboardKPIs {
  totalStudents: number;
  paidStudents: number;
  trialStudents: number;
  expiredStudents: number;
  paidRatio: number;

  pendingOrdersCount: number;
  pendingOrdersRevenue: number;
  stalePendingCount: number; // > 12 hours old

  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalRevenue: number;
  totalApprovedOrders: number;
  onlineRevenue: number;
  codRevenue: number;

  activeStudentsToday: number;
  lessonsViewedToday: number;
  exercisesCompletedToday: number;
  estimatedStudyHoursToday: number;
  liveVisitors?: number;
  todayVisitors?: number;
}

export interface ExpiringSoonAlert {
  studentId: string;
  studentName: string;
  studentPhone?: string;
  parentPhone?: string;
  wilayaName?: string;
  streamId?: string;
  plan: string;
  expiresAt: string;
  daysRemaining: number;
}

export interface StalePendingAlert {
  orderId: string;
  userId?: string;
  studentName: string;
  studentPhone?: string;
  amount: number;
  paymentMethod: string;
  submittedAt: string;
  hoursWaiting: number;
}

export interface DropoffAlert {
  studentId: string;
  studentName: string;
  studentPhone?: string;
  wilayaName?: string;
  streamId?: string;
  createdAt: string;
  stage: "ONBOARDING_INCOMPLETE" | "DIAGNOSTIC_NOT_STARTED" | "NO_FIRST_MISSION";
}

export interface ConversionFunnelStep {
  id: string;
  label: string;
  count: number;
  percentageOfTotal: number;
  percentageOfPrevious: number;
  dropoffCount: number;
}

export interface LearningIntelligenceMetrics {
  exerciseCompletionRate: number;
  correctAnswersCount: number;
  totalAttemptsCount: number;
  missionsMasteredCount: number;
  retestsPassedCount: number;
  topStreams: { streamId: string; nameAr: string; count: number; percentage: number }[];
  topWilayas: { wilayaName: string; count: number; percentage: number }[];
}

export interface CockpitBusinessSection {
  todaySales: number;
  monthSales: number;
  collectedCash: number;
  pendingCod: number;
  totalOrders: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    paid: number;
    returned: number;
  };
  subscriptions: {
    total: number;
    annualCount: number;
    monthlyCount: number;
    annualRevenue: number;
    monthlyRevenue: number;
  };
}

export interface CockpitAudienceSection {
  visitorsToday: number;
  newVisitorsToday: number;
  returningVisitorsToday: number;
  registeredStudents: number;
  activeStudentsToday: number; // Definition: authenticated students with >=1 product activity event today
  activeStudents7d: number;
  activeStudents30d: number;
  neverActiveStudents: number;
  trialStudents: number;
  paidStudents: number;
  expiredSubscriptions: number;
}

export interface CockpitAcquisitionSection {
  topSources: Array<{
    source: string;
    visitors: number;
    registrations: number;
    trials: number;
    paidStudents: number;
    revenue: number;
  }>;
  topCampaigns: Array<{
    campaign: string;
    source: string;
    visitors: number;
    registrations: number;
    paid: number;
    revenue: number;
  }>;
  attributionQuality: {
    status: "REAL" | "PARTIAL" | "UNAVAILABLE";
    attributedRegistrations: number;
    unattributedRegistrations: number;
    unattributedPercentage: number;
    warningMessage: string;
  };
}

export interface CockpitProductUsageSection {
  diwan: {
    opened: number;
    tablesCreated: number;
    tablesJoined: number;
    total: number;
  };
  planner: {
    opened: number;
  };
  exams: {
    opened: number;
    started: number;
    completed: number;
    total: number;
  };
  summaries: {
    opened: number;
  };
  calculator: {
    used: number;
  };
  other: {
    subjectOpened: number;
    orientationOpened: number;
    practiceCompleted: number;
    retestCompleted: number;
    total: number;
  };
  mostUsedSections: Array<{
    name: string;
    labelAr: string;
    count: number;
    percentage: number;
  }>;
  totalProductEvents: number;
}

export interface CockpitConversionSection {
  stages: Array<{
    key: string;
    label: string;
    count: number;
    conversionFromPrev: number;
    definition: string;
  }>;
  ratios: {
    visitorToRegistration: number;
    registrationToActivation: number;
    activationToTrial: number;
    trialToPaid: number;
    overallConversion: number;
  };
}

export interface CockpitCommerceSection {
  totalOrders: number;
  delivery: {
    carrier: string;
    inTransit: number;
    delivered: number;
    pendingShipment: number;
  };
  cod: {
    pendingCollectionDZD: number;
    collectedDZD: number;
    pendingCount: number;
    deliveredCount: number;
  };
  inventory: {
    availableStudyPacks: number;
    reservedCards: number;
    lowStockWarning: boolean;
    status: string;
  };
  payments: {
    codCount: number;
    codRevenue: number;
    baridimobCount: number;
    baridimobRevenue: number;
    onlineCount: number;
    onlineRevenue: number;
  };
}

export interface CockpitGeographySection {
  hasReliableGeography: boolean;
  wilayas: Array<{
    wilaya: string;
    ordersCount: number;
    studentsCount: number;
    percentage: number;
  }>;
  message?: string;
}

export interface CockpitDataIntegrity {
  status: "REAL" | "PARTIAL" | "UNAVAILABLE";
  lastUpdated: string;
  message: string;
}

export interface OperationsDashboardData {
  kpis: DashboardKPIs;
  alerts: {
    expiringSoon: ExpiringSoonAlert[];
    stalePending: StalePendingAlert[];
    dropoffs: DropoffAlert[];
  };
  funnel: ConversionFunnelStep[];
  learning: LearningIntelligenceMetrics;
  generatedAt: string;
  orders?: any[];
  ordersSummary?: any;
  analytics?: any;
  inventory?: any;

  // Authoritative 7 Integrated Cockpit Sections
  business?: CockpitBusinessSection;
  audience?: CockpitAudienceSection;
  acquisition?: CockpitAcquisitionSection;
  productUsage?: CockpitProductUsageSection;
  conversion?: CockpitConversionSection;
  commerce?: CockpitCommerceSection;
  geography?: CockpitGeographySection;
  dataIntegrity?: CockpitDataIntegrity;
}



