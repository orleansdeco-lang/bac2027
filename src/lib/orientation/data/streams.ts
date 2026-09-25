// ==============================================================================
// Official BAC Streams (MESRS & ONEC Algeria)
// ==============================================================================
import { BacStream } from '@/types/orientation';

export const OFFICIAL_BAC_STREAMS: BacStream[] = [
  {
    id: 'sciences_exp',
    code: 'SE',
    nameAr: 'علوم تجريبية',
    nameFr: 'Sciences Expérimentales',
    shortName: 'علوم',
    isActive: true,
  },
  {
    id: 'math',
    code: 'M',
    nameAr: 'رياضيات',
    nameFr: 'Mathématiques',
    shortName: 'رياضيات',
    isActive: true,
  },
  {
    id: 'technique_math',
    code: 'TM',
    nameAr: 'تقني رياضي',
    nameFr: 'Technique Mathématiques',
    shortName: 'تقني',
    isActive: true,
  },
  {
    id: 'gestion_eco',
    code: 'GE',
    nameAr: 'تسيير واقتصاد',
    nameFr: 'Gestion et Économie',
    shortName: 'تسيير',
    isActive: true,
  },
  {
    id: 'lettres_philo',
    code: 'LP',
    nameAr: 'آداب وفلسفة',
    nameFr: 'Lettres et Philosophie',
    shortName: 'فلسفة',
    isActive: true,
  },
  {
    id: 'langues_etrangeres',
    code: 'LE',
    nameAr: 'لغات أجنبية',
    nameFr: 'Langues Étrangères',
    shortName: 'لغات',
    isActive: true,
  },
];
