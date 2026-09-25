// ==============================================================================
// src/lib/orientation/data/calculator-config.ts
// Official BAC Streams Subjects, Coefficients & Smart Calculator Helpers (Algeria)
// ==============================================================================

import { BacStreamCode } from '@/types/orientation';

export interface SubjectConfig {
  code: string;
  nameAr: string;
  nameFr: string;
  coeff: number;
  isKeySubject?: boolean;
}

export interface StreamConfig {
  code: BacStreamCode;
  nameAr: string;
  shortName: string;
  nameFr: string;
  icon: string;
  descriptionAr: string;
  subjects: SubjectConfig[];
  defaultGrades: Record<string, number>;
}

export const BAC_STREAMS_CONFIG: Record<BacStreamCode, StreamConfig> = {
  sciences_exp: {
    code: 'sciences_exp',
    nameAr: 'علوم تجريبية',
    shortName: 'علوم',
    nameFr: 'Sciences Expérimentales',
    icon: '🧬',
    descriptionAr: 'تركيز على علوم الطبيعة والحياة، الفيزياء، والرياضيات',
    subjects: [
      { code: 'natural_sciences', nameAr: 'علوم الطبيعة والحياة', nameFr: 'Sciences Naturelles', coeff: 6, isKeySubject: true },
      { code: 'physics', nameAr: 'العلوم الفيزيائية', nameFr: 'Physique', coeff: 5, isKeySubject: true },
      { code: 'mathematics', nameAr: 'الرياضيات', nameFr: 'Mathématiques', coeff: 5, isKeySubject: true },
      { code: 'arabic', nameAr: 'اللغة العربية وآدابها', nameFr: 'Arabe', coeff: 3 },
      { code: 'french', nameAr: 'اللغة الفرنسية', nameFr: 'Français', coeff: 2 },
      { code: 'english', nameAr: 'اللغة الإنجليزية', nameFr: 'Anglais', coeff: 2 },
      { code: 'philosophy', nameAr: 'الفلسفة', nameFr: 'Philosophie', coeff: 2 },
      { code: 'history_geo', nameAr: 'التاريخ والجغرافيا', nameFr: 'Histoire-Géo', coeff: 2 },
      { code: 'islamic_sciences', nameAr: 'العلوم الإسلامية', nameFr: 'Sciences Islamiques', coeff: 2 },
    ],
    defaultGrades: {
      natural_sciences: 15,
      physics: 14,
      mathematics: 14,
      arabic: 13,
      french: 13,
      english: 14,
      philosophy: 12,
      history_geo: 13,
      islamic_sciences: 15,
    },
  },
  math: {
    code: 'math',
    nameAr: 'رياضيات',
    shortName: 'رياضيات',
    nameFr: 'Mathématiques',
    icon: '📐',
    descriptionAr: 'تركيز عميق على الرياضيات والعلوم الفيزيائية للمدارس الكبرى',
    subjects: [
      { code: 'mathematics', nameAr: 'الرياضيات', nameFr: 'Mathématiques', coeff: 7, isKeySubject: true },
      { code: 'physics', nameAr: 'العلوم الفيزيائية', nameFr: 'Physique', coeff: 6, isKeySubject: true },
      { code: 'natural_sciences', nameAr: 'علوم الطبيعة والحياة', nameFr: 'Sciences Naturelles', coeff: 2 },
      { code: 'arabic', nameAr: 'اللغة العربية وآدابها', nameFr: 'Arabe', coeff: 3 },
      { code: 'french', nameAr: 'اللغة الفرنسية', nameFr: 'Français', coeff: 2 },
      { code: 'english', nameAr: 'اللغة الإنجليزية', nameFr: 'Anglais', coeff: 2 },
      { code: 'philosophy', nameAr: 'الفلسفة', nameFr: 'Philosophie', coeff: 2 },
      { code: 'history_geo', nameAr: 'التاريخ والجغرافيا', nameFr: 'Histoire-Géo', coeff: 2 },
      { code: 'islamic_sciences', nameAr: 'العلوم الإسلامية', nameFr: 'Sciences Islamiques', coeff: 2 },
    ],
    defaultGrades: {
      mathematics: 16,
      physics: 15,
      natural_sciences: 13,
      arabic: 13,
      french: 13,
      english: 14,
      philosophy: 12,
      history_geo: 13,
      islamic_sciences: 15,
    },
  },
  technique_math: {
    code: 'technique_math',
    nameAr: 'تقني رياضي',
    shortName: 'تقني',
    nameFr: 'Technique Mathématiques',
    icon: '⚙️',
    descriptionAr: 'الرياضيات، الفيزياء، ومادة التكنولوجيا الهندسية',
    subjects: [
      { code: 'technology', nameAr: 'التكنولوجيا (هندسة)', nameFr: 'Technologie', coeff: 6, isKeySubject: true },
      { code: 'mathematics', nameAr: 'الرياضيات', nameFr: 'Mathématiques', coeff: 6, isKeySubject: true },
      { code: 'physics', nameAr: 'العلوم الفيزيائية', nameFr: 'Physique', coeff: 6, isKeySubject: true },
      { code: 'arabic', nameAr: 'اللغة العربية وآدابها', nameFr: 'Arabe', coeff: 3 },
      { code: 'french', nameAr: 'اللغة الفرنسية', nameFr: 'Français', coeff: 2 },
      { code: 'english', nameAr: 'اللغة الإنجليزية', nameFr: 'Anglais', coeff: 2 },
      { code: 'philosophy', nameAr: 'الفلسفة', nameFr: 'Philosophie', coeff: 2 },
      { code: 'history_geo', nameAr: 'التاريخ والجغرافيا', nameFr: 'Histoire-Géo', coeff: 2 },
      { code: 'islamic_sciences', nameAr: 'العلوم الإسلامية', nameFr: 'Sciences Islamiques', coeff: 2 },
    ],
    defaultGrades: {
      technology: 15,
      mathematics: 15,
      physics: 14,
      arabic: 13,
      french: 13,
      english: 14,
      philosophy: 12,
      history_geo: 13,
      islamic_sciences: 15,
    },
  },
  gestion_eco: {
    code: 'gestion_eco',
    nameAr: 'تسيير واقتصاد',
    shortName: 'تسيير',
    nameFr: 'Gestion et Économie',
    icon: '📊',
    descriptionAr: 'المحاسبة، الرياضيات، الاقتصاد، والمناجمنت والعلوم التجارية',
    subjects: [
      { code: 'accounting', nameAr: 'التسيير المحاسبي والمالي', nameFr: 'Comptabilité', coeff: 6, isKeySubject: true },
      { code: 'mathematics', nameAr: 'الرياضيات', nameFr: 'Mathématiques', coeff: 5, isKeySubject: true },
      { code: 'economics', nameAr: 'الاقتصاد والمناجمنت', nameFr: 'Économie', coeff: 5, isKeySubject: true },
      { code: 'history_geo', nameAr: 'التاريخ والجغرافيا', nameFr: 'Histoire-Géo', coeff: 4 },
      { code: 'arabic', nameAr: 'اللغة العربية وآدابها', nameFr: 'Arabe', coeff: 3 },
      { code: 'law', nameAr: 'القانون', nameFr: 'Droit', coeff: 2 },
      { code: 'french', nameAr: 'اللغة الفرنسية', nameFr: 'Français', coeff: 2 },
      { code: 'english', nameAr: 'اللغة الإنجليزية', nameFr: 'Anglais', coeff: 2 },
      { code: 'philosophy', nameAr: 'الفلسفة', nameFr: 'Philosophie', coeff: 2 },
      { code: 'islamic_sciences', nameAr: 'العلوم الإسلامية', nameFr: 'Sciences Islamiques', coeff: 2 },
    ],
    defaultGrades: {
      accounting: 14,
      mathematics: 13,
      economics: 14,
      history_geo: 13,
      arabic: 13,
      law: 13,
      french: 12,
      english: 13,
      philosophy: 12,
      islamic_sciences: 14,
    },
  },
  lettres_philo: {
    code: 'lettres_philo',
    nameAr: 'آداب وفلسفة',
    shortName: 'فلسفة',
    nameFr: 'Lettres et Philosophie',
    icon: '📚',
    descriptionAr: 'الأدب العربي، الفلسفة، العلوم الإنسانية، والقانون',
    subjects: [
      { code: 'philosophy', nameAr: 'الفلسفة', nameFr: 'Philosophie', coeff: 6, isKeySubject: true },
      { code: 'arabic', nameAr: 'اللغة العربية وآدابها', nameFr: 'Arabe', coeff: 6, isKeySubject: true },
      { code: 'history_geo', nameAr: 'التاريخ والجغرافيا', nameFr: 'Histoire-Géo', coeff: 4 },
      { code: 'french', nameAr: 'اللغة الفرنسية', nameFr: 'Français', coeff: 3 },
      { code: 'english', nameAr: 'اللغة الإنجليزية', nameFr: 'Anglais', coeff: 3 },
      { code: 'mathematics', nameAr: 'الرياضيات', nameFr: 'Mathématiques', coeff: 2 },
      { code: 'islamic_sciences', nameAr: 'العلوم الإسلامية', nameFr: 'Sciences Islamiques', coeff: 2 },
    ],
    defaultGrades: {
      philosophy: 14,
      arabic: 14,
      history_geo: 13,
      french: 12,
      english: 13,
      mathematics: 11,
      islamic_sciences: 14,
    },
  },
  langues_etrangeres: {
    code: 'langues_etrangeres',
    nameAr: 'لغات أجنبية',
    shortName: 'لغات',
    nameFr: 'Langues Étrangères',
    icon: '🌍',
    descriptionAr: 'اللغات العالمية، الترجمة، الآداب، والعلاقات الدولية',
    subjects: [
      { code: 'french', nameAr: 'اللغة الفرنسية', nameFr: 'Français', coeff: 5, isKeySubject: true },
      { code: 'english', nameAr: 'اللغة الإنجليزية', nameFr: 'Anglais', coeff: 5, isKeySubject: true },
      { code: 'third_language', nameAr: 'اللغة الثالثة (إسبانية/ألمانية/إيطالية)', nameFr: '3ème Langue', coeff: 5, isKeySubject: true },
      { code: 'arabic', nameAr: 'اللغة العربية وآدابها', nameFr: 'Arabe', coeff: 5 },
      { code: 'history_geo', nameAr: 'التاريخ والجغرافيا', nameFr: 'Histoire-Géo', coeff: 2 },
      { code: 'philosophy', nameAr: 'الفلسفة', nameFr: 'Philosophie', coeff: 2 },
      { code: 'mathematics', nameAr: 'الرياضيات', nameFr: 'Mathématiques', coeff: 2 },
      { code: 'islamic_sciences', nameAr: 'العلوم الإسلامية', nameFr: 'Sciences Islamiques', coeff: 2 },
    ],
    defaultGrades: {
      french: 15,
      english: 15,
      third_language: 14,
      arabic: 13,
      history_geo: 13,
      philosophy: 12,
      mathematics: 11,
      islamic_sciences: 14,
    },
  },
};

/**
 * Calculates weighted general average from a map of subject grades for a given stream
 */
export function calculateStreamAverage(
  streamId: BacStreamCode,
  grades: Record<string, number | undefined>
): { average: number; totalCoeff: number; completedCount: number; totalSubjects: number } {
  const stream = BAC_STREAMS_CONFIG[streamId];
  if (!stream) {
    return { average: 10, totalCoeff: 1, completedCount: 0, totalSubjects: 0 };
  }

  let totalPoints = 0;
  let totalCoeff = 0;
  let completedCount = 0;

  for (const subj of stream.subjects) {
    const val = grades[subj.code];
    if (typeof val === 'number' && !isNaN(val) && val >= 0) {
      totalPoints += val * subj.coeff;
      totalCoeff += subj.coeff;
      completedCount++;
    }
  }

  if (totalCoeff === 0) {
    return { average: 10, totalCoeff: 0, completedCount: 0, totalSubjects: stream.subjects.length };
  }

  const rawAvg = totalPoints / totalCoeff;
  const average = Math.round(rawAvg * 100) / 100;

  return {
    average,
    totalCoeff,
    completedCount,
    totalSubjects: stream.subjects.length,
  };
}

/**
 * Returns dynamic encouraging phrase based on calculated average
 */
export function getEncouragingPhrase(average: number): { text: string; tone: string } {
  if (average >= 16) {
    return {
      text: 'ممتاز جداً 🌟 فرص واسعة في المدارس الوطنية العليا والعلوم الطبية.',
      tone: 'text-emerald-700 font-bold',
    };
  }
  if (average >= 14) {
    return {
      text: 'مليح بزاف 👌 الآن نشوفو التخصصات اللي تناسب معدلك وشعبتك.',
      tone: 'text-teal-700 font-bold',
    };
  }
  if (average >= 12) {
    return {
      text: 'معدل جيد 👍 عندك خيارات متنوعة في الجامعات والمدارس الوطنية.',
      tone: 'text-stone-700 font-medium',
    };
  }
  if (average >= 10) {
    return {
      text: 'مبروك الباك 🎓 خلينا نكتشفو التخصصات الجامعية المتاحة ليك.',
      tone: 'text-stone-700 font-medium',
    };
  }
  return {
    text: 'معدل استرشادي. واصل التحضير لتحقيق معدل أعلى وطموح أكبر!',
    tone: 'text-amber-800 font-medium',
  };
}
