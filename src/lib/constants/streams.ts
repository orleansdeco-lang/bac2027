import { Stream, ExtendedStream, StreamId, ExtendedStreamId, StreamSubjectRule, Subject, ExtendedSubject, SubjectId, ExtendedSubjectId, TechniqueMathSpecialty } from "../../types/education";

/**
 * Algerian BAC Streams and Subject Coefficients (Provisional — Pending Official Ministry Verification)
 * NOTE: Coefficients represent standard syllabus benchmarks pending formal validation against current ministerial circulars.
 * TODO: Formally verify all stream coefficients against the latest ministerial executive decrees (المنشور الوزاري الرسمي لمعاملات البكالوريا).
 */

export interface SpecialtyMeta {
  id: TechniqueMathSpecialty;
  name_ar: string;
  name_fr: string;
  subjectId: SubjectId;
}

export const TECHNIQUE_MATH_SPECIALTIES: Record<TechniqueMathSpecialty, SpecialtyMeta> = {
  civil_eng: {
    id: "civil_eng",
    name_ar: "هندسة مدنية",
    name_fr: "Génie Civil",
    subjectId: "civil_eng",
  },
  mechanical_eng: {
    id: "mechanical_eng",
    name_ar: "هندسة ميكانيكية",
    name_fr: "Génie Mécanique",
    subjectId: "mechanical_eng",
  },
  electrical_eng: {
    id: "electrical_eng",
    name_ar: "هندسة كهربائية",
    name_fr: "Génie Électrique",
    subjectId: "electrical_eng",
  },
  process_eng: {
    id: "process_eng",
    name_ar: "هندسة الطرائق",
    name_fr: "Génie des Procédés",
    subjectId: "process_eng",
  },
};

export const ALL_SUBJECTS: Record<SubjectId, Subject> = {
  natural_sciences: {
    id: "natural_sciences",
    code: "SNV",
    name_ar: "علوم الطبيعة والحياة",
    name_fr: "Sciences de la Nature et de la Vie",
    isScientific: true,
  },
  physics: {
    id: "physics",
    code: "PHY",
    name_ar: "العلوم الفيزيائية",
    name_fr: "Sciences Physiques",
    isScientific: true,
  },
  math: {
    id: "math",
    code: "MATH",
    name_ar: "الرياضيات",
    name_fr: "Mathématiques",
    isScientific: true,
  },
  arabic: {
    id: "arabic",
    code: "AR",
    name_ar: "اللغة العربية وآدابها",
    name_fr: "Langue Arabe",
    isScientific: false,
  },
  philosophy: {
    id: "philosophy",
    code: "PHIL",
    name_ar: "الفلسفة",
    name_fr: "Philosophie",
    isScientific: false,
  },
  french: {
    id: "french",
    code: "FR",
    name_ar: "اللغة الفرنسية",
    name_fr: "Français",
    isScientific: false,
  },
  english: {
    id: "english",
    code: "ENG",
    name_ar: "اللغة الإنجليزية",
    name_fr: "Anglais",
    isScientific: false,
  },
  islamic_studies: {
    id: "islamic_studies",
    code: "ISL",
    name_ar: "العلوم الإسلامية",
    name_fr: "Sciences Islamiques",
    isScientific: false,
  },
  history_geography: {
    id: "history_geography",
    code: "HG",
    name_ar: "التاريخ والجغرافيا",
    name_fr: "Histoire-Géographie",
    isScientific: false,
  },
  accounting_finance: {
    id: "accounting_finance",
    code: "ACC",
    name_ar: "التسيير المحاسبي والمالي",
    name_fr: "Gestion Comptable et Financière",
    isScientific: false,
  },
  economics_management: {
    id: "economics_management",
    code: "ECO",
    name_ar: "الاقتصاد والمناجمنت",
    name_fr: "Économie et Management",
    isScientific: false,
  },
  law: {
    id: "law",
    code: "LAW",
    name_ar: "القانون",
    name_fr: "Droit",
    isScientific: false,
  },
  civil_eng: {
    id: "civil_eng",
    code: "GC",
    name_ar: "الهندسة المدنية",
    name_fr: "Génie Civil",
    isScientific: true,
  },
  mechanical_eng: {
    id: "mechanical_eng",
    code: "GM",
    name_ar: "الهندسة الميكانيكية",
    name_fr: "Génie Mécanique",
    isScientific: true,
  },
  electrical_eng: {
    id: "electrical_eng",
    code: "GE",
    name_ar: "الهندسة الكهربائية",
    name_fr: "Génie Électrique",
    isScientific: true,
  },
  process_eng: {
    id: "process_eng",
    code: "GP",
    name_ar: "هندسة الطرائق",
    name_fr: "Génie des Procédés",
    isScientific: true,
  },
  third_language: {
    id: "third_language",
    code: "L3",
    name_ar: "اللغة الأجنبية الثالثة (إسبانية / ألمانية / إيطالية)",
    name_fr: "3ème Langue Vivante (Espagnol / Allemand / Italien)",
    isScientific: false,
  },
};

export const EXTENDED_ALL_SUBJECTS: Record<ExtendedSubjectId, ExtendedSubject> = {
  ...ALL_SUBJECTS,
  german: {
    id: "german",
    code: "ALL",
    name_ar: "اللغة الألمانية",
    name_fr: "Allemand",
    isScientific: false,
  },
  spanish: {
    id: "spanish",
    code: "ESP",
    name_ar: "اللغة الإسبانية",
    name_fr: "Espagnol",
    isScientific: false,
  },
  italian: {
    id: "italian",
    code: "ITA",
    name_ar: "اللغة الإيطالية",
    name_fr: "Italien",
    isScientific: false,
  },
  tamazight: {
    id: "tamazight",
    code: "AMAZ",
    name_ar: "اللغة الأمازيغية",
    name_fr: "Tamazight",
    isScientific: false,
  },
  art_specialty: {
    id: "art_specialty",
    code: "ARTSPEC",
    name_ar: "مادة التخصص الفني",
    name_fr: "Pratique Artistique Spécialisée",
    isScientific: false,
  },
  art_history: {
    id: "art_history",
    code: "ARTHIST",
    name_ar: "تاريخ الفن والجماليات",
    name_fr: "Histoire de l'Art",
    isScientific: false,
  },
};

export const ALGERIAN_BAC_STREAMS: Record<StreamId, Stream> = {
  sciences_exp: {
    id: "sciences_exp",
    examType: "BAC",
    code: "SE",
    name_ar: "علوم تجريبية",
    name_fr: "Sciences Expérimentales",
    description_ar: "تركيز مكثف على العلوم الطبيعية، الرياضيات، والعلوم الفيزيائية.",
    description_fr: "Forte dominante en sciences de la nature et de la vie, mathématiques et physique.",
    subjects: [
      { subjectId: "natural_sciences", coefficient: 6, isCoreSubject: true },
      { subjectId: "physics", coefficient: 5, isCoreSubject: true },
      { subjectId: "math", coefficient: 5, isCoreSubject: true },
      { subjectId: "arabic", coefficient: 3, isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, isCoreSubject: false },
      { subjectId: "french", coefficient: 2, isCoreSubject: false },
      { subjectId: "english", coefficient: 2, isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, isCoreSubject: false },
      { subjectId: "history_geography", coefficient: 2, isCoreSubject: false },
    ],
  },
  math: {
    id: "math",
    examType: "BAC",
    code: "M",
    name_ar: "رياضيات",
    name_fr: "Mathématiques",
    description_ar: "تركيز عالي على الرياضيات والفيزياء لبناء تفكير تجريدي واستدلالي معمق.",
    description_fr: "Spécialité d'excellence axée sur les mathématiques et la physique avancées.",
    subjects: [
      { subjectId: "math", coefficient: 7, isCoreSubject: true },
      { subjectId: "physics", coefficient: 6, isCoreSubject: true },
      { subjectId: "natural_sciences", coefficient: 2, isCoreSubject: false },
      { subjectId: "arabic", coefficient: 3, isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, isCoreSubject: false },
      { subjectId: "french", coefficient: 2, isCoreSubject: false },
      { subjectId: "english", coefficient: 2, isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, isCoreSubject: false },
      { subjectId: "history_geography", coefficient: 2, isCoreSubject: false },
    ],
  },
  technique_math: {
    id: "technique_math",
    examType: "BAC",
    code: "TM",
    name_ar: "تقني رياضي",
    name_fr: "Technique Mathématiques",
    description_ar: "هندسة تطبيقية متخصصة (ميكانيكية، مدنية، كهربائية، أو طرائق) مع الرياضيات والفيزياء.",
    description_fr: "Ingénierie appliquée (mécanique, civile, électrique ou procédés) avec maths et physique.",
    subjects: [
      { subjectId: "math", coefficient: 6, isCoreSubject: true },
      { subjectId: "physics", coefficient: 6, isCoreSubject: true },
      { subjectId: "arabic", coefficient: 3, isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, isCoreSubject: false },
      { subjectId: "french", coefficient: 2, isCoreSubject: false },
      { subjectId: "english", coefficient: 2, isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, isCoreSubject: false },
      { subjectId: "history_geography", coefficient: 2, isCoreSubject: false },
    ],
  },
  gestion_eco: {
    id: "gestion_eco",
    examType: "BAC",
    code: "GE",
    name_ar: "تسيير واقتصاد",
    name_fr: "Gestion & Économie",
    description_ar: "محاسبة، مالية، اقتصاد ومناجمنت، وقانون مع الرياضيات التطبيقية.",
    description_fr: "Comptabilité et gestion financière, économie, management et droit.",
    subjects: [
      { subjectId: "accounting_finance", coefficient: 6, isCoreSubject: true },
      { subjectId: "economics_management", coefficient: 5, isCoreSubject: true },
      { subjectId: "math", coefficient: 5, isCoreSubject: true },
      { subjectId: "history_geography", coefficient: 4, isCoreSubject: false },
      { subjectId: "arabic", coefficient: 3, isCoreSubject: false },
      { subjectId: "law", coefficient: 2, isCoreSubject: true },
      { subjectId: "philosophy", coefficient: 2, isCoreSubject: false },
      { subjectId: "french", coefficient: 2, isCoreSubject: false },
      { subjectId: "english", coefficient: 2, isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, isCoreSubject: false },
    ],
  },
  lettres_philo: {
    id: "lettres_philo",
    examType: "BAC",
    code: "LP",
    name_ar: "آداب وفلسفة",
    name_fr: "Lettres & Philosophie",
    description_ar: "تركيز مكثف على المقالة الفلسفية، اللغة العربية وآدابها، والتاريخ والجغرافيا.",
    description_fr: "Forte dominante en philosophie, littérature arabe et histoire-géographie.",
    subjects: [
      { subjectId: "philosophy", coefficient: 6, isCoreSubject: true },
      { subjectId: "arabic", coefficient: 6, isCoreSubject: true },
      { subjectId: "history_geography", coefficient: 4, isCoreSubject: true },
      { subjectId: "french", coefficient: 3, isCoreSubject: false },
      { subjectId: "english", coefficient: 3, isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, isCoreSubject: false },
      { subjectId: "math", coefficient: 2, isCoreSubject: false },
    ],
  },
  langues_etrangeres: {
    id: "langues_etrangeres",
    examType: "BAC",
    code: "LE",
    name_ar: "لغات أجنبية",
    name_fr: "Langues Étrangères",
    description_ar: "إتقان اللغات الأجنبية (الفرنسية، الإنجليزية، ولغة ثالثة: إسبانية، ألمانية أو إيطالية).",
    description_fr: "Maîtrise approfondie des langues vivantes : français, anglais et 3ème langue.",
    subjects: [
      { subjectId: "french", coefficient: 5, isCoreSubject: true },
      { subjectId: "english", coefficient: 5, isCoreSubject: true },
      { subjectId: "third_language", coefficient: 4, isCoreSubject: true },
      { subjectId: "arabic", coefficient: 5, isCoreSubject: true },
      { subjectId: "history_geography", coefficient: 2, isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, isCoreSubject: false },
      { subjectId: "math", coefficient: 2, isCoreSubject: false },
    ],
  },
};

export const EXTENDED_ALGERIAN_BAC_STREAMS: Record<ExtendedStreamId, ExtendedStream> = {
  ...ALGERIAN_BAC_STREAMS,
  arts: {
    id: "arts",
    examType: "BAC",
    code: "ART",
    name_ar: "فنون",
    name_fr: "Arts",
    description_ar: "شعبة الفنون الوطنية بالخيارات الأربعة: سينما، تشكيل، مسرح، وموسيقى.",
    description_fr: "Filière Arts avec 4 options : cinéma/audiovisuel, arts plastiques, théâtre et musique.",
    subjects: [
      { subjectId: "art_specialty", coefficient: 6, isCoreSubject: true },
      { subjectId: "art_history", coefficient: 4, isCoreSubject: true },
      { subjectId: "arabic", coefficient: 4, isCoreSubject: true },
      { subjectId: "philosophy", coefficient: 3, isCoreSubject: false },
      { subjectId: "french", coefficient: 3, isCoreSubject: false },
      { subjectId: "english", coefficient: 3, isCoreSubject: false },
      { subjectId: "history_geography", coefficient: 2, isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, isCoreSubject: false },
      { subjectId: "math", coefficient: 2, isCoreSubject: false },
    ],
  },
  sciences_nature_vie: {
    id: "sciences_nature_vie",
    examType: "BAC",
    code: "SNV_HIST",
    name_ar: "علوم الطبيعة والحياة (قديم)",
    name_fr: "Sciences de la Nature et de la Vie",
    description_ar: "الشعبة العلمية الطبيعية في نظام البكالوريا قبل إصلاح 2008.",
    description_fr: "Filière scientifique historique pré-réforme 2008.",
    subjects: [
      { subjectId: "natural_sciences", coefficient: 6, isCoreSubject: true },
      { subjectId: "physics", coefficient: 5, isCoreSubject: true },
      { subjectId: "math", coefficient: 5, isCoreSubject: true },
      { subjectId: "arabic", coefficient: 3, isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, isCoreSubject: false },
      { subjectId: "french", coefficient: 2, isCoreSubject: false },
      { subjectId: "english", coefficient: 2, isCoreSubject: false },
      { subjectId: "history_geography", coefficient: 2, isCoreSubject: false },
    ],
  },
  sciences_exactes: {
    id: "sciences_exactes",
    examType: "BAC",
    code: "SE_HIST",
    name_ar: "علوم دقيقة (قديم)",
    name_fr: "Sciences Exactes",
    description_ar: "شعبة العلوم الدقيقة في نظام البكالوريا قبل إصلاح 2008.",
    description_fr: "Filière sciences exactes historique pré-réforme 2008.",
    subjects: [
      { subjectId: "math", coefficient: 7, isCoreSubject: true },
      { subjectId: "physics", coefficient: 6, isCoreSubject: true },
      { subjectId: "natural_sciences", coefficient: 2, isCoreSubject: false },
      { subjectId: "arabic", coefficient: 3, isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, isCoreSubject: false },
      { subjectId: "french", coefficient: 2, isCoreSubject: false },
      { subjectId: "english", coefficient: 2, isCoreSubject: false },
    ],
  },
  technologie: {
    id: "technologie",
    examType: "BAC",
    code: "TECH_HIST",
    name_ar: "تكنولوجيا (قديم)",
    name_fr: "Technologie",
    description_ar: "شعبة التكنولوجيا في نظام البكالوريا قبل إصلاح 2008.",
    description_fr: "Filière technologie historique pré-réforme 2008.",
    subjects: [
      { subjectId: "mechanical_eng", coefficient: 7, isCoreSubject: true },
      { subjectId: "math", coefficient: 6, isCoreSubject: true },
      { subjectId: "physics", coefficient: 5, isCoreSubject: true },
      { subjectId: "arabic", coefficient: 3, isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, isCoreSubject: false },
      { subjectId: "french", coefficient: 2, isCoreSubject: false },
    ],
  },
  sciences_eco_gestion: {
    id: "sciences_eco_gestion",
    examType: "BAC",
    code: "ECO_HIST",
    name_ar: "علوم اقتصادية وتسيير (قديم)",
    name_fr: "Sciences Économiques & Gestion",
    description_ar: "شعبة العلوم الاقتصادية في نظام البكالوريا قبل إصلاح 2008.",
    description_fr: "Filière sciences économiques historique pré-réforme 2008.",
    subjects: [
      { subjectId: "accounting_finance", coefficient: 6, isCoreSubject: true },
      { subjectId: "economics_management", coefficient: 5, isCoreSubject: true },
      { subjectId: "math", coefficient: 5, isCoreSubject: true },
      { subjectId: "history_geography", coefficient: 3, isCoreSubject: false },
      { subjectId: "arabic", coefficient: 3, isCoreSubject: false },
      { subjectId: "law", coefficient: 2, isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, isCoreSubject: false },
      { subjectId: "french", coefficient: 2, isCoreSubject: false },
    ],
  },
  lettres_sciences_humaines: {
    id: "lettres_sciences_humaines",
    examType: "BAC",
    code: "LSH_HIST",
    name_ar: "آداب وعلوم إنسانية (قديم)",
    name_fr: "Lettres et Sciences Humaines",
    description_ar: "شعبة الآداب والعلوم الإنسانية في نظام البكالوريا قبل إصلاح 2008.",
    description_fr: "Filière lettres et sciences humaines historique pré-réforme 2008.",
    subjects: [
      { subjectId: "arabic", coefficient: 6, isCoreSubject: true },
      { subjectId: "philosophy", coefficient: 5, isCoreSubject: true },
      { subjectId: "history_geography", coefficient: 4, isCoreSubject: true },
      { subjectId: "french", coefficient: 3, isCoreSubject: false },
      { subjectId: "english", coefficient: 3, isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, isCoreSubject: false },
      { subjectId: "math", coefficient: 2, isCoreSubject: false },
    ],
  },
  lettres_langues_vivantes: {
    id: "lettres_langues_vivantes",
    examType: "BAC",
    code: "LLV_HIST",
    name_ar: "آداب ولغات حية (قديم)",
    name_fr: "Lettres et Langues Vivantes",
    description_ar: "شعبة الآداب واللغات الحية في نظام البكالوريا قبل إصلاح 2008.",
    description_fr: "Filière lettres et langues vivantes historique pré-réforme 2008.",
    subjects: [
      { subjectId: "french", coefficient: 5, isCoreSubject: true },
      { subjectId: "english", coefficient: 5, isCoreSubject: true },
      { subjectId: "third_language", coefficient: 4, isCoreSubject: true },
      { subjectId: "arabic", coefficient: 5, isCoreSubject: true },
      { subjectId: "history_geography", coefficient: 2, isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, isCoreSubject: false },
      { subjectId: "math", coefficient: 2, isCoreSubject: false },
    ],
  },
};

/**
 * Returns the resolved subject rules for a given stream and optional specialty.
 * Handles Technique Math branch resolution to ensure coefficient 7 is correctly attributed.
 */
export function getStreamSubjects(
  streamId: StreamId,
  specialty?: TechniqueMathSpecialty
): StreamSubjectRule[];
export function getStreamSubjects(
  streamId: ExtendedStreamId,
  specialty?: TechniqueMathSpecialty
): StreamSubjectRule<ExtendedSubjectId>[];
export function getStreamSubjects(
  streamId: ExtendedStreamId | StreamId,
  specialty?: TechniqueMathSpecialty
): StreamSubjectRule<any>[] {
  const stream = (EXTENDED_ALGERIAN_BAC_STREAMS as any)[streamId] || (ALGERIAN_BAC_STREAMS as any)[streamId];
  if (!stream) return [];

  if (streamId === "technique_math") {
    const baseSubjects = (stream.subjects as StreamSubjectRule<any>[]).filter(
      (rule) =>
        rule.subjectId !== "mechanical_eng" &&
        rule.subjectId !== "civil_eng" &&
        rule.subjectId !== "electrical_eng" &&
        rule.subjectId !== "process_eng"
    );

    if (specialty && TECHNIQUE_MATH_SPECIALTIES[specialty]) {
      const specialtySubjectId = TECHNIQUE_MATH_SPECIALTIES[specialty].subjectId;
      return [
        {
          subjectId: specialtySubjectId,
          coefficient: 7,
          isCoreSubject: true,
        },
        ...baseSubjects,
      ];
    }

    // STRICT SAFETY: Never default to mechanical_eng without an explicit specialty
    return baseSubjects;
  }

  return stream.subjects;
}

/**
 * Computes sum of coefficients for a stream's subjects
 */
export function getTotalStreamCoefficients(subjects: StreamSubjectRule[]): number {
  return subjects.reduce((sum, s) => sum + s.coefficient, 0);
}
