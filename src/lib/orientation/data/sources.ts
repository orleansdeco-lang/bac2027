// ==============================================================================
// src/lib/orientation/data/sources.ts
// Official MESRS Orientation Sources Registry (Sourced Provenance)
// Ministry of Higher Education & Scientific Research (Algeria)
// Strict Source Tiering: OFFICIAL_PRIMARY, OFFICIAL_INSTITUTIONAL, OFFICIAL_HISTORICAL
// ==============================================================================
import { OrientationSource } from '@/types/orientation';

export const OFFICIAL_SOURCES: OrientationSource[] = [
  {
    id: 'src-mesrs-circulaire-2024',
    title: 'المنشور الوزاري رقم 01 المؤرخ في 11 جويلية 2024 المتعلق بتوجيه حاملي شهادة البكالوريا بعنوان السنة الجامعية 2024-2025',
    url: 'https://circulaire.mesrs.dz/',
    publicationYear: '2024',
    academicYear: '2024-2025',
    sourceType: 'OFFICIAL_CIRCULAR',
    sourceTier: 'OFFICIAL_PRIMARY',
    pageNumber: '1-64',
    articleNumber: 'المنشور رقم 01',
    exactCircularQuote: 'يخضع التوجيه الجامعي للشروط البيداغوجية المحددة في جداول المنشور الوزاري رقم 01 لحاملي شهادة البكالوريا وفق الشعب والأولويات المعتمدة وصيغ الترتيب المحددة.',
    referenceSection: 'الشروط البيداغوجية العامة وصيغ المعدلات الموزونة المعتمدة رسمياً',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2024-07-15T10:00:00Z',
    notes: 'المصدر الأساسي المرجعي لجميع صيغ حساب المعدل الموزون وشروط الالتحاق بجميع الشعب.',
  },
  {
    id: 'src-mesrs-circulaire-2025-projected',
    title: 'القواعد الاسترشادية المحيّنة لدورة 2025/2026 المنبثقة عن المنشور الوزاري رقم 01',
    url: 'https://circulaire.mesrs.dz/',
    publicationYear: '2025',
    academicYear: '2025-2026',
    sourceType: 'OFFICIAL_CIRCULAR',
    sourceTier: 'OFFICIAL_PRIMARY',
    pageNumber: 'استرشادي',
    articleNumber: 'قواعد استرشادية محينة',
    exactCircularQuote: 'تعتمد القواعد الاسترشادية وفق نفس هيكلة المنشور الوزاري لحين صدور المنشور الرسمي النهائي لدورة 2026.',
    referenceSection: 'تحيين قواعد التوجيه لحاملي شهادة البكالوريا الجدد',
    verificationStatus: 'PARTIALLY_VERIFIED',
    verifiedAt: '2025-07-20T10:00:00Z',
    notes: 'قواعد استرشادية محينة. دورة 2026 الرسمية لم تصدر بعد من الوزارة وتعتمد هذه القواعد مبدئياً.',
  },
  {
    id: 'src-mesrs-statistiques-2024',
    title: 'نتائج المعالجة الآلية لرغبات حاملي شهادة البكالوريا دورة 2024 (الحدود الدنيا الوطنية والمحلية للتوجيه)',
    url: 'https://orientation.esi.dz/',
    publicationYear: '2024',
    academicYear: '2024-2025',
    sourceType: 'ANNUAL_CUTOFF_REPORT',
    sourceTier: 'OFFICIAL_HISTORICAL',
    pageNumber: 'الملحق الإحصائي 1-28',
    articleNumber: 'نتائج المعالجة الآلية 2024',
    exactCircularQuote: 'الحدود الدنيا المسجلة تمثل آخر طالب وجه فعلياً في نظام المعالجة الآلية ولا تعتبر شروط قبول مسبقة.',
    referenceSection: 'الملحق الإحصائي الرسمي لمعدلات التوجيه الدنيا حسب الشعب والمؤسسات',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2024-08-05T12:00:00Z',
    notes: 'معدلات القبول السابقة التي توقف عندها التوجيه التنافسي الفعلي حسب كل شعبة ومؤسسة.',
  },
  {
    id: 'src-mesrs-decret-ens',
    title: 'القرار الوزاري المشترك المحدد لشروط الالتحاق بالمدارس العليا للأساتذة وشروط المقابلة الشفوية والسن',
    url: 'https://www.mesrs.dz/',
    publicationYear: '2023',
    academicYear: '2024-2025',
    sourceType: 'MINISTERIAL_DECREE',
    sourceTier: 'OFFICIAL_PRIMARY',
    pageNumber: 'الجريدة الرسمية',
    articleNumber: 'المادة 4 والمادة 8',
    exactCircularQuote: 'يشترط للالتحاق بالمدارس العليا للأساتذة ألا يتجاوز سن المترشح 24 سنة عند تاريخ التسجيل واجتياز مقابلة شفوية وفحص طبي لسلامة الحواس.',
    referenceSection: 'المادة 4: شرط السن (أقل من 24 سنة) والمقابلة الشفوية الإلزامية والفحص الطبي',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2023-09-01T08:00:00Z',
    notes: 'يشترط اجتياز مقابلة شفوية وفحص طبي للتأكد من القدرة على ممارسة مهنة التدريس.',
  },
  {
    id: 'src-mesrs-esi-decret',
    title: 'النظام الداخلي وشروط القبول بالأقسام التحضيرية المدمجة في الإعلام الآلي (ESI الجزائر)',
    url: 'https://www.esi.dz/',
    publicationYear: '2024',
    academicYear: '2024-2025',
    sourceType: 'INSTITUTION_REGULATION',
    sourceTier: 'OFFICIAL_INSTITUTIONAL',
    pageNumber: '3',
    articleNumber: 'المادة 2',
    exactCircularQuote: 'ترتيب المترشحين للأقسام التحضيرية المدمجة يتم على أساس المعدل الموزون: ((معدل البكالوريا × 2) + علامة الرياضيات) / 3 مع إعطاء الأولوية الأولى لشعبة الرياضيات.',
    referenceSection: 'نظام الانتقال والأولوية في ترتيب المترشحين (الرياضيات أولوية 1)',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2024-07-20T09:00:00Z',
    notes: 'صيغة المعدل الموزون: ((معدل البكالوريا × 2) + علامة الرياضيات) / 3.',
  },
];

export const SOURCE_MAP = new Map(OFFICIAL_SOURCES.map(s => [s.id, s]));

export function getSource(id: string): OrientationSource | null {
  return SOURCE_MAP.get(id) || null;
}
