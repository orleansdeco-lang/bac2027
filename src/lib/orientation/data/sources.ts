// ==============================================================================
// src/lib/orientation/data/sources.ts
// Official MESRS Orientation Sources Registry (Sourced Provenance)
// Ministry of Higher Education & Scientific Research (Algeria)
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
