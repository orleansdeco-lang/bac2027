// ==============================================================================
// src/types/orientation.ts
// Official Algerian Higher Education Orientation Data Types (MESRS)
// Source of truth: circulaire.mesrs.dz (Ministère de l'Enseignement Supérieur)
// Strict Separation: Eligibility != Ranking Admission Score != Historical Cutoff
// ==============================================================================

export type BacStreamCode = 
  | 'sciences_exp'
  | 'math'
  | 'technique_math'
  | 'gestion_eco'
  | 'lettres_philo'
  | 'langues_etrangeres';

export type BacSubjectCode = 
  | 'general_average'
  | 'math'
  | 'physics'
  | 'natural_sciences'
  | 'arabic'
  | 'french'
  | 'english'
  | 'philosophy'
  | 'history_geo'
  | 'accounting';

export type RegistrationScope = 'national' | 'regional' | 'local' | 'wilaya_group' | 'commune_group';

export type InstitutionType = 
  | 'university'
  | 'central_university'
  | 'university_center'
  | 'school'
  | 'higher_school'
  | 'ens'
  | 'institute'
  | 'iap'
  | 'other';

export type TrainingType = 
  | 'licence'
  | 'integrated_master'
  | 'engineering'
  | 'higher_school'
  | 'teacher_training'
  | 'professional'
  | 'applied_sciences'
  | 'medicine'
  | 'pharmacy'
  | 'dentistry'
  | 'veterinary'
  | 'other';

export type RankingBasis = 
  | 'general_average'
  | 'weighted_average'
  | 'highest_of_general_or_weighted';

/**
 * Strict legal eligibility status — NEVER mixed with historical cutoffs
 */
export type EligibilityStatus = 
  | 'ELIGIBLE'          // Meets all official circular legal criteria (stream, average, subject mins, geo)
  | 'NOT_ELIGIBLE'      // Fails one or more legal requirements
  | 'CONDITIONAL'       // Meets legal requirements, but subject to mandatory interview, medical exam or age limit
  | 'UNKNOWN'           // Missing student subject grades necessary to evaluate subject thresholds or formula
  | 'INSUFFICIENT_DATA';// Official circular rules not yet fully verified or recorded for this option

/**
 * Historical cutoff guidance — strictly informational reference, never guarantees admission
 */
export type HistoricalComparison = 
  | 'ABOVE_HISTORICAL_REFERENCE'  // Student's score meets or exceeds last observed cutoff reference
  | 'NEAR_HISTORICAL_REFERENCE'   // Student's score is within narrow margin of last observed cutoff reference
  | 'BELOW_HISTORICAL_REFERENCE'  // Student's score is below last observed cutoff reference
  | 'CURRENT_CUTOFF_UNAVAILABLE'   // Current year (2026) competitive cutoff has not occurred yet
  | 'NO_HISTORICAL_DATA'          // No verified historical cutoff available for this stream/institution
  // Backward-compatibility aliases
  | 'ABOVE_HISTORICAL_CUTOFF'
  | 'NEAR_HISTORICAL_CUTOFF'
  | 'BELOW_HISTORICAL_CUTOFF';

export type DataTrustStatus = 
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'CONDITIONAL'
  | 'UNKNOWN'
  | 'LEGACY_UNVERIFIED';

export type PublicationStatus = 
  | 'DRAFT'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'PUBLISHED'
  | 'LEGACY';

export type SourceQualityTier = 
  | 'OFFICIAL_PRIMARY'       // Official Ministerial Circular No. 01, Executive Decrees, Ministerial Decrees
  | 'OFFICIAL_INSTITUTIONAL' // University/Higher School internal regulations, official school portals
  | 'OFFICIAL_HISTORICAL'    // MESRS / ESI annual automated processing cutoff statistical reports
  | 'SECONDARY'              // Press releases, media briefs, academic studies
  | 'UNVERIFIED';            // Unofficial forums, social media, unconfirmed leaks

export interface OrientationSource {
  id: string;
  title: string;
  url: string;
  publicationYear: string;
  academicYear: string;
  sourceType: 'OFFICIAL_CIRCULAR' | 'MINISTERIAL_DECREE' | 'ANNUAL_CUTOFF_REPORT' | 'INSTITUTION_REGULATION' | 'ADDENDUM';
  sourceTier?: SourceQualityTier;
  referenceSection?: string;
  pageNumber?: number | string;
  articleNumber?: string;
  exactCircularQuote?: string;
  verificationStatus: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'UNVERIFIED' | 'DEPRECATED';
  verifiedAt?: string;
  notes?: string;
}

export interface RuleEvidenceRecord {
  id: string;
  programId: string;
  programCode: string;
  programNameAr: string;
  ruleId: string;
  bacStreamId: BacStreamCode;
  sourceId: string;
  sourceTier: SourceQualityTier;
  documentTitle: string;
  academicYear: string;
  pageOrSection: string;
  exactCircularQuote: string;
  streamPriority: number;
  rankingBasis: RankingBasis;
  formulaExpression: string | null;
  minimumGeneralAverage: number | null;
  minimumWeightedAverage: number | null;
  subjectMinimums: Record<string, number | null>;
  geographicScope: RegistrationScope;
  geographicStatus?: 'OFFICIALLY_VERIFIED' | 'PENDING_OFFICIAL_ANNEX';
  additionalConditions: Array<{
    type: string;
    titleAr: string;
    descriptionAr: string;
  }>;
  firstReviewer: string;
  firstReviewedAt: string;
  firstReviewerRole: string;
  secondReviewer: string | null;
  secondReviewedAt: string | null;
  secondReviewerRole: string | null;
  verificationStatus: 'OFFICIALLY_VERIFIED' | 'PENDING_VERIFICATION' | 'BLOCKED_CONFLICT';
  publicationStatus: PublicationStatus;
  auditNotes?: string;
}

export interface ReviewAuditLog {
  id: string;
  recordType: 'PROGRAM' | 'ADMISSION_RULE' | 'CUTOFF' | 'GEOGRAPHIC_RULE' | 'SOURCE' | 'FORMULA';
  recordId: string;
  reviewer: string;
  reviewerRole: 'data_engineer' | 'technical_auditor' | 'pedagogical_auditor' | 'education_specialist';
  action: 'SUBMIT_FOR_VERIFICATION' | 'FIRST_VERIFY' | 'SECOND_REVIEW_APPROVE' | 'REJECT' | 'PUBLISH' | 'UNPUBLISH';
  previousStatus: string;
  newStatus: string;
  sourceId?: string;
  notes: string;
  timestamp: string;
}

export interface OrientationVersion {
  id: string;
  academicYear: string;
  versionName: string;
  sourceUrl: string;
  sourceDocument: string;
  sourceType: 'OFFICIAL_CIRCULAR' | 'MINISTERIAL_DECREE' | 'ADDENDUM' | 'HISTORICAL_REPORT';
  publishedAt?: string;
  verifiedAt?: string;
  isCurrent: boolean;
  notes?: string;
}

export interface BacStream {
  id: BacStreamCode;
  code: string;
  nameAr: string;
  nameFr: string;
  shortName: string;
  isActive: boolean;
  applicableSubjects: BacSubjectCode[];
}

export interface Wilaya {
  id: number;
  code: string;
  nameAr: string;
  nameFr: string;
  phoneCode?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface Commune {
  id: number;
  wilayaId: number;
  code: string;
  nameAr: string;
  nameFr: string;
  dairaAr?: string;
  postalCode?: string;
}

export interface Institution {
  id: string;
  code?: string;
  nameAr: string;
  nameFr: string;
  shortName?: string;
  institutionType: InstitutionType;
  wilayaId: number;
  address?: string;
  websiteUrl?: string;
  isActive: boolean;
  sourceId?: string;
}

export interface Field {
  id: string;
  code: string;
  nameAr: string;
  nameFr: string;
  icon?: string;
}

export interface WeightedFormulaTerm {
  subject: BacSubjectCode;
  coefficient: number;
}

export interface WeightedFormula {
  id?: string;
  expressionAr: string; // e.g. "((2 × معدل البكالوريا) + علوم الطبيعة والحياة) / 3"
  expressionFr: string; // e.g. "((2 × Bac) + Sciences) / 3"
  divisor: number;
  terms: WeightedFormulaTerm[];
  sourceId?: string;
  verificationStatus?: 'VERIFIED' | 'UNVERIFIED';
}

export interface AdmissionRule {
  id: string;
  programId: string;
  bacStreamId: BacStreamCode;
  priority: number; // 1 to 5
  rankingBasis: RankingBasis;
  minimumGeneralAverage: number | null;
  minimumWeightedAverage: number | null;
  minimumSubjectAverage: number | null;
  mathematicsMin: number | null;
  physicsMin: number | null;
  naturalSciencesMin: number | null;
  arabicMin: number | null;
  frenchMin: number | null;
  englishMin: number | null;
  requiredSubject: string | null;
  requiredSubjectMin: number | null;
  weightedFormula: WeightedFormula | null;
  geographicCondition: string | null;
  additionalConditions: Array<{
    type: 'medical_interview' | 'physical_aptitude' | 'age_limit' | 'other';
    titleAr: string;
    descriptionAr: string;
  }>;
  academicYear: string;
  sourceId?: string;
  dataConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  verificationStatus: DataTrustStatus;
}

export interface ProgramBacEligibility {
  id: string;
  programId: string;
  bacStreamId: BacStreamCode;
  priority: number;
  academicYear: string;
}

export interface ProgramCutoff {
  id: string;
  programId: string;
  institutionId?: string;
  bacStreamId?: BacStreamCode; // Stream dimension is REQUIRED for accurate orientation
  scope?: 'STREAM' | 'GENERAL';
  cutoffType?: 'WEIGHTED' | 'GENERAL';
  priority?: number;
  academicYear: string; // e.g. '2024-2025', '2023-2024'
  cutoffGeneralAverage: number | null;
  cutoffWeightedAverage: number | null;
  lastAdmittedRank: number | null;
  source: string;
  sourceUrl?: string;
  sourceId?: string;
  isOfficial: boolean;
  verificationStatus: DataTrustStatus;
  publicationStatus?: PublicationStatus;
}

export interface Program {
  id: string;
  programCode: string;
  fieldId: string;
  nameAr: string;
  nameFr: string;
  specialtyAr?: string;
  trainingType: TrainingType;
  degreeType: string;
  durationYears: number;
  academicYear: string;
  isActive: boolean;
  dataQualityStatus: 'verified' | 'partially_verified' | 'unverified' | 'deprecated';
  institutions?: InstitutionOffer[];
  eligibilityRules?: AdmissionRule[];
  cutoffs?: ProgramCutoff[];
  sourceId?: string;
  publicationStatus?: PublicationStatus;
  isLegacy?: boolean;
}

export interface InstitutionOffer {
  institution: Institution;
  registrationScope: RegistrationScope;
  eligibleWilayas?: number[]; // Wilaya IDs if regional/local
}

export interface StudentBacProfile {
  streamId: BacStreamCode;
  wilayaId: number;
  generalAverage: number;
  grades?: {
    mathematics?: number;
    physics?: number;
    naturalSciences?: number;
    arabic?: number;
    french?: number;
    english?: number;
    philosophy?: number;
    historyGeo?: number;
    accounting?: number;
  };
}

export interface ProgramEvaluationResult {
  program: Program;
  institutionOffer: InstitutionOffer;
  rule: AdmissionRule | null;
  eligibility: EligibilityStatus; // Separated canonical model
  eligibilityStatus: EligibilityStatus; // Backward-compatibility alias
  admissionScore: {
    scoreUsed: number;
    scoreType: 'WEIGHTED_AVERAGE' | 'GENERAL_AVERAGE';
    calculatedWeightedAverage: number | null;
    formulaExpression: string | null;
    formulaSource?: string | null;
  };
  historicalCutoff: {
    academicYear: string;
    streamScope: 'STREAM' | 'GENERAL';
    stream?: string;
    cutoffValue: number | null;
    cutoffType: 'WEIGHTED' | 'GENERAL';
    sourceTitle?: string;
  } | null;
  historicalComparison: HistoricalComparison;
  additionalConditions: string[];
  dataStatus: DataTrustStatus;
  sources: OrientationSource[];

  // Compatibility fields
  calculatedWeightedAverage: number | null;
  studentAverageUsed: number;
  priority: number | null;
  reasons: string[];
  blockers: string[];
  warnings: string[];
  historicalCutoffs: {
    year: string;
    stream?: string;
    generalCutoff: number | null;
    weightedCutoff: number | null;
    source?: string;
    isOfficial: boolean;
  }[];
  additionalRequirements: string[];
  officialDisclaimer: string;
  source?: OrientationSource | null;
}

export interface OrientationReport {
  studentProfile: StudentBacProfile;
  totalEvaluated: number;
  eligibleCount: number;
  conditionalCount: number;
  notEligibleCount: number;
  unknownCount: number;
  programs: ProgramEvaluationResult[];
  generatedAt: string;
  officialYear: string;
  circularReference: string;
  dataTrustStatus: DataTrustStatus;
}
