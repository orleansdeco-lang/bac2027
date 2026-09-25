// ==============================================================================
// src/lib/orientation/data/streams.ts
// Official BAC Streams & Subject Applicability Matrix (MESRS & ONEC Algeria)
// ==============================================================================
import { BacStream, BacStreamCode, BacSubjectCode } from '@/types/orientation';

export const OFFICIAL_BAC_STREAMS: BacStream[] = [
  {
    id: 'sciences_exp',
    code: 'SE',
    nameAr: 'علوم تجريبية',
    nameFr: 'Sciences Expérimentales',
    shortName: 'علوم',
    isActive: true,
    applicableSubjects: [
      'general_average',
      'math',
      'physics',
      'natural_sciences',
      'arabic',
      'french',
      'english',
      'philosophy',
      'history_geo',
    ],
  },
  {
    id: 'math',
    code: 'M',
    nameAr: 'رياضيات',
    nameFr: 'Mathématiques',
    shortName: 'رياضيات',
    isActive: true,
    applicableSubjects: [
      'general_average',
      'math',
      'physics',
      'natural_sciences',
      'arabic',
      'french',
      'english',
      'philosophy',
      'history_geo',
    ],
  },
  {
    id: 'technique_math',
    code: 'TM',
    nameAr: 'تقني رياضي',
    nameFr: 'Technique Mathématiques',
    shortName: 'تقني',
    isActive: true,
    // Note: natural_sciences is NOT studied or tested in 3AS Technique Math
    applicableSubjects: [
      'general_average',
      'math',
      'physics',
      'arabic',
      'french',
      'english',
      'philosophy',
      'history_geo',
    ],
  },
  {
    id: 'gestion_eco',
    code: 'GE',
    nameAr: 'تسيير واقتصاد',
    nameFr: 'Gestion et Économie',
    shortName: 'تسيير',
    isActive: true,
    applicableSubjects: [
      'general_average',
      'math',
      'accounting',
      'arabic',
      'french',
      'english',
      'philosophy',
      'history_geo',
    ],
  },
  {
    id: 'lettres_philo',
    code: 'LP',
    nameAr: 'آداب وفلسفة',
    nameFr: 'Lettres et Philosophie',
    shortName: 'فلسفة',
    isActive: true,
    applicableSubjects: [
      'general_average',
      'philosophy',
      'arabic',
      'history_geo',
      'french',
      'english',
      'math',
    ],
  },
  {
    id: 'langues_etrangeres',
    code: 'LE',
    nameAr: 'لغات أجنبية',
    nameFr: 'Langues Étrangères',
    shortName: 'لغات',
    isActive: true,
    applicableSubjects: [
      'general_average',
      'french',
      'english',
      'arabic',
      'philosophy',
      'history_geo',
      'math',
    ],
  },
];

const streamMap = new Map(OFFICIAL_BAC_STREAMS.map(s => [s.id, s]));

export function getStream(id: BacStreamCode): BacStream | null {
  return streamMap.get(id) || null;
}

/**
 * Checks whether a subject is applicable to a specific BAC stream
 */
export function isSubjectApplicableToStream(streamId: BacStreamCode, subject: BacSubjectCode): boolean {
  const stream = streamMap.get(streamId);
  if (!stream) return false;
  return stream.applicableSubjects.includes(subject);
}
