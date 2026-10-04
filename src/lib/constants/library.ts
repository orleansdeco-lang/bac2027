import { BookCategory, BookStream, BookSubject } from "@/types/book";

export interface StreamOption {
  id: BookStream | 'all';
  label: string;
  name_ar: string;
  code: string;
  icon?: string;
}

export const LIBRARY_STREAMS: StreamOption[] = [
  { id: 'all', label: 'جميع الشعب', name_ar: 'جميع الشعب', code: 'ALL' },
  { id: 'scientific', label: 'علوم تجريبية', name_ar: 'علوم تجريبية', code: 'SE' },
  { id: 'math_tech', label: 'تقني رياضي (الفروع الـ 4)', name_ar: 'تقني رياضي', code: 'TM' },
  { id: 'math', label: 'رياضيات', name_ar: 'رياضيات', code: 'M' },
  { id: 'management', label: 'تسيير واقتصاد', name_ar: 'تسيير واقتصاد', code: 'GE' },
  { id: 'literature', label: 'آداب وفلسفة', name_ar: 'آداب وفلسفة', code: 'LP' },
  { id: 'languages', label: 'لغات أجنبية', name_ar: 'لغات أجنبية', code: 'LE' },
];

export interface SubjectOption {
  id: BookSubject | 'all';
  label: string;
  icon: string;
  group: 'all' | 'exact' | 'tech' | 'management' | 'humanities' | 'languages';
  groupLabel: string;
  streams?: BookStream[];
}

export const LIBRARY_SUBJECTS: SubjectOption[] = [
  { id: 'all', label: 'كل المواد', icon: '📚', group: 'all', groupLabel: 'الكل' },
  
  // 1. العلوم الدقيقة
  { id: 'math', label: 'رياضيات', icon: '📐', group: 'exact', groupLabel: 'العلوم الدقيقة', streams: ['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'] },
  { id: 'physics', label: 'علوم فيزيائية', icon: '⚡', group: 'exact', groupLabel: 'العلوم الدقيقة', streams: ['scientific', 'math_tech', 'math'] },
  { id: 'science', label: 'علوم الطبيعة والحياة', icon: '🧬', group: 'exact', groupLabel: 'العلوم الدقيقة', streams: ['scientific', 'math'] },
  
  // 2. هندسات التقني رياضي (الفروع الأربعة)
  { id: 'civil_engineering', label: 'هندسة مدنية', icon: '🏗️', group: 'tech', groupLabel: 'هندسات تقني رياضي', streams: ['math_tech'] },
  { id: 'mechanical_engineering', label: 'هندسة ميكانيكية', icon: '⚙️', group: 'tech', groupLabel: 'هندسات تقني رياضي', streams: ['math_tech'] },
  { id: 'electrical_engineering', label: 'هندسة كهربائية', icon: '💡', group: 'tech', groupLabel: 'هندسات تقني رياضي', streams: ['math_tech'] },
  { id: 'process_engineering', label: 'هندسة الطرائق', icon: '🧪', group: 'tech', groupLabel: 'هندسات تقني رياضي', streams: ['math_tech'] },
  
  // 3. مواد شعبة تسيير واقتصاد
  { id: 'accounting', label: 'تسيير محاسبي ومالي', icon: '📊', group: 'management', groupLabel: 'تسيير واقتصاد', streams: ['management'] },
  { id: 'economics', label: 'اقتصاد ومناجمنت', icon: '📈', group: 'management', groupLabel: 'تسيير واقتصاد', streams: ['management'] },
  { id: 'law', label: 'قانون', icon: '⚖️', group: 'management', groupLabel: 'تسيير واقتصاد', streams: ['management'] },
  
  // 4. المواد الأدبية والإنسانية
  { id: 'arabic', label: 'لغة عربية وآدابها', icon: '📖', group: 'humanities', groupLabel: 'المواد الأدبية', streams: ['literature', 'languages', 'scientific', 'math_tech', 'math', 'management'] },
  { id: 'philosophy', label: 'فلسفة', icon: '💭', group: 'humanities', groupLabel: 'المواد الأدبية', streams: ['literature', 'languages', 'scientific', 'math_tech', 'math', 'management'] },
  { id: 'islamic', label: 'علوم إسلامية', icon: '🕌', group: 'humanities', groupLabel: 'المواد الأدبية', streams: ['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'] },
  { id: 'history_geo', label: 'تاريخ وجغرافيا', icon: '🌍', group: 'humanities', groupLabel: 'المواد الأدبية', streams: ['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'] },
  
  // 5. اللغات الأجنبية (الأساسية والثالثة)
  { id: 'french', label: 'لغة فرنسية', icon: '🇫🇷', group: 'languages', groupLabel: 'اللغات الأجنبية', streams: ['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'] },
  { id: 'english', label: 'لغة إنجليزية', icon: '🇬🇧', group: 'languages', groupLabel: 'اللغات الأجنبية', streams: ['scientific', 'math_tech', 'math', 'management', 'literature', 'languages'] },
  { id: 'spanish', label: 'لغة إسبانية', icon: '🇪🇸', group: 'languages', groupLabel: 'اللغات الأجنبية (لغة 3)', streams: ['languages'] },
  { id: 'german', label: 'لغة ألمانية', icon: '🇩🇪', group: 'languages', groupLabel: 'اللغات الأجنبية (لغة 3)', streams: ['languages'] },
  { id: 'italian', label: 'لغة إيطالية', icon: '🇮🇹', group: 'languages', groupLabel: 'اللغات الأجنبية (لغة 3)', streams: ['languages'] },
];

export interface CategoryOption {
  id: BookCategory | 'all';
  label: string;
  badgeLabel: string;
  icon: string;
  description: string;
  badgeClasses: string;
  accentBg: string;
}

export const LIBRARY_CATEGORIES: CategoryOption[] = [
  {
    id: 'all',
    label: 'جميع المراجع',
    badgeLabel: 'شامل',
    icon: '✨',
    description: 'كافة الكتب المدرسية والمراجع والسلاسل لشهادة البكالوريا',
    badgeClasses: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20',
    accentBg: 'bg-zinc-100 dark:bg-zinc-800',
  },
  {
    id: 'official',
    label: 'الكتب المدرسية الرسمية',
    badgeLabel: 'كتاب وزاري معتمد',
    icon: '🏛️',
    description: 'كتب وزارة التربية الوطنية والديوان الوطني للمطبوعات المدرسية المعتمدة رسمياً',
    badgeClasses: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    id: 'professor_series',
    label: 'سلاسل وكتب الأساتذة',
    badgeLabel: 'سلسلة أستاذ',
    icon: '👨‍🏫',
    description: 'المراجع الشاملة لكبار الأساتذة (تأشيرة النجاح، المغني، الهباج، بوالريش، سعيد كمال...)',
    badgeClasses: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    accentBg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    id: 'summary',
    label: 'الملخصات المركزة',
    badgeLabel: 'ملخص وقواعد',
    icon: '⚡',
    description: 'مطويات، قواعد وخرائط ذهنية للحفظ السريع والمراجعة النهائية المركزة',
    badgeClasses: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    accentBg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    id: 'exam_solutions',
    label: 'الحوليات والمواضيع المحلولة',
    badgeLabel: 'حوليات محلولة',
    icon: '🏆',
    description: 'سلاسل البكالوريات السابقة الصادرة عن ONEC والمواضيع المقترحة مع الحلول والسلالم النموذجية',
    badgeClasses: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    accentBg: 'bg-purple-50 dark:bg-purple-950/30',
  },
];

export const SORT_OPTIONS = [
  { id: 'popular', label: 'الأكثر تحميلاً 📈' },
  { id: 'latest', label: 'الأحدث إضافة ⏱️' },
  { id: 'oldest', label: 'الأقدم' },
];

export function getCategoryMeta(category: string): CategoryOption {
  const found = LIBRARY_CATEGORIES.find((c) => c.id === category);
  return found || LIBRARY_CATEGORIES[2]; // Default to professor_series
}

export function getSubjectMeta(subject: string): SubjectOption | undefined {
  return LIBRARY_SUBJECTS.find((s) => s.id === subject);
}

export function getStreamMeta(stream: string): StreamOption | undefined {
  return LIBRARY_STREAMS.find((s) => s.id === stream);
}
