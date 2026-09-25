// ==============================================================================
// src/types/orientation.ts
// Official Algerian Higher Education Orientation Data Types (MESRS)
// Source of truth: circulaire.mesrs.dz
// ==============================================================================

export type BacStreamCode = 
  | 'sciences_exp'
  | 'math'
  | 'technique_math'
  | 'gestion_eco'
  | 'lettres_philo'
  | 'langues_etrangeres';

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

export type EligibilityStatus = 
  | 'ELIGIBLE'       // Meets all legal ministerial requirements
  | 'COMPETITIVE'    // Meets requirements + close to or exceeds historical cutoffs
  | 'STRETCH'        // Meets legal requirements, but historical cutoffs are significantly higher
  | 'NOT_ELIGIBLE'   // Fails one or more legal requirements (stream, average, subject grade, geo)
  | 'UNKNOWN';       // Missing required subject grades to calculate weighted average

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
}

export interface BacStream {
  id: BacStreamCode;
  code: string;
  nameAr: string;
  nameFr: string;
  shortName: string;
  isActive: boolean;
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
}

export interface Field {
  id: string;
  code: string;
  nameAr: string;
  nameFr: string;
  icon?: string;
}

export interface WeightedFormulaTerm {
  subject: 'math' | 'physics' | 'natural_sciences' | 'arabic' | 'french' | 'english' | 'philosophy' | 'history_geo' | 'accounting';
  coefficient: number;
}

export interface WeightedFormula {
  expressionAr: string; // e.g. "(2 × الرياضيات + الفيزياء) / 3"
  expressionFr: string; // e.g. "(2M + P) / 3"
  divisor: number;
  terms: WeightedFormulaTerm[];
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
  dataConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
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
  bacStreamId?: BacStreamCode;
  priority?: number;
  academicYear: string; // e.g. '2025-2026', '2024-2025'
  cutoffGeneralAverage: number | null;
  cutoffWeightedAverage: number | null;
  lastAdmittedRank: number | null;
  source: string;
  sourceUrl?: string;
  isOfficial: boolean;
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
  eligibilityStatus: EligibilityStatus;
  calculatedWeightedAverage: number | null;
  studentAverageUsed: number;
  priority: number | null;
  reasons: string[];
  blockers: string[];
  warnings: string[];
  historicalCutoffs: {
    year: string;
    generalCutoff: number | null;
    weightedCutoff: number | null;
  }[];
  additionalRequirements: string[];
  officialDisclaimer: string;
}

export interface OrientationReport {
  studentProfile: StudentBacProfile;
  totalEvaluated: number;
  eligibleCount: number;
  competitiveCount: number;
  stretchCount: number;
  notEligibleCount: number;
  programs: ProgramEvaluationResult[];
  generatedAt: string;
  officialYear: string;
  circularReference: string;
}
