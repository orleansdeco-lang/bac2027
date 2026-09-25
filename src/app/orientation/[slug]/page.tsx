import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/ui/AppShell';
import { 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  Scale, 
  Clock, 
  CheckCircle2, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { OFFICIAL_PROGRAMS } from '@/lib/orientation/data/programs';

interface CategoryData {
  slug: string;
  titleAr: string;
  titleFr: string;
  fieldId: string;
  icon: string;
  metaTitle: string;
  metaDesc: string;
  programCodes: string[];
  introAr: string;
}

const CATEGORIES: Record<string, CategoryData> = {
  medecine: {
    slug: 'medecine',
    titleAr: 'تخصصات العلوم الطبية (طب، صيدلة، طب أسنان)',
    titleFr: 'Sciences Médicales',
    fieldId: 'MED',
    icon: '🎓',
    metaTitle: 'شروط ومعدلات قبول كليات الطب والصيدلة في الجزائر | SHATER',
    metaDesc: 'اكتشف الشروط الرسمية للالتحاق بدكتوراه الطب، الصيدلة، وطب الأسنان في الجزائر، صيغ حساب المعدل الموزون والعتبات التاريخية.',
    programCodes: ['011', '012', '013'],
    introAr: 'تخضع دراسة العلوم الطبية في الجزائر لمعدل موزون يحسب وفق: ((2 × معدل البكالوريا) + مادة علوم الطبيعة والحياة) / 3، مع اشتراط معدل عام وموزون لا يقل عن 15.00 للمشاركة في الترتيب التنافسي.',
  },
  informatique: {
    slug: 'informatique',
    titleAr: 'تخصصات الإعلام الآلي والذكاء الاصطناعي',
    titleFr: 'Informatique & Intelligence Artificielle',
    fieldId: 'INFO_AI',
    icon: '💻',
    metaTitle: 'شروط ومعدلات القبول في مدارس الإعلام الآلي ESI و ENSIA | SHATER',
    metaDesc: 'دليل القبول في المدرسة الوطنية العليا للإعلام الآلي ESI ومدرسة الذكاء الاصطناعي ENSIA، صيغ المعدل الموزون وأولويات الشعب.',
    programCodes: ['071', '072', '041'],
    introAr: 'الترتيب في المدارس الوطنية العليا للإعلام الآلي والذكاء الاصطناعي يعتمد على المعدل الموزون: ((2 × معدل البكالوريا) + الرياضيات) / 3، مع منح الأولوية الأولى لشعبة الرياضيات والأولوية الثانية لشعبتي تقني رياضي وعلوم تجريبية.',
  },
  architecture: {
    slug: 'architecture',
    titleAr: 'تخصصات الهندسة المعمارية والعمران (EPAU)',
    titleFr: 'Architecture et Urbanisme',
    fieldId: 'ARCHI',
    icon: '📐',
    metaTitle: 'شروط القبول في المدرسة العليا للهندسة المعمارية EPAU | SHATER',
    metaDesc: 'دليل شروط ومعدلات القبول بالمدرسة الوطنية العليا للهندسة المعمارية والعمران EPAU الحراش، صيغة المعدل الموزون الرباعي.',
    programCodes: ['083'],
    introAr: 'تعتمد المدرسة الوطنية العليا للهندسة المعمارية EPAU صيغة حساب رباعية: ((2 × معدل البكالوريا) + الرياضيات + الفيزياء) / 4، مناصفة بين شعبتي الرياضيات والتقني رياضي كأولوية أولى.',
  },
  ingenieur: {
    slug: 'ingenieur',
    titleAr: 'المدارس الوطنية العليا متعددة التقنيات (ENP)',
    titleFr: 'Grandes Écoles d\'Ingénieurs (ENP)',
    fieldId: 'TECH',
    icon: '⚙️',
    metaTitle: 'شروط القبول في المدارس الوطنية العليا للمهندسين ENP | SHATER',
    metaDesc: 'اكتشف شروط الأقسام التحضيرية في العلوم والتقنيات والمدرسة الوطنية متعددة التقنيات بالحراش وفروعها.',
    programCodes: ['081', '051'],
    introAr: 'تفتح المدارس الوطنية العليا التكنولوجية أبوابها لحاملي بكالوريا رياضيات وتقني رياضي بأولوية متساوية، وتعتمد المعدل الموزون في الرياضيات للترتيب التنافسي.',
  },
  economie: {
    slug: 'economie',
    titleAr: 'العلوم الاقتصادية، التسيير والمدارس العليا للتجارة',
    titleFr: 'Sciences Économiques et Commerciales',
    fieldId: 'ECON',
    icon: '📊',
    metaTitle: 'شروط القبول في المدرسة العليا للتجارة ESC وكليات الاقتصاد | SHATER',
    metaDesc: 'شروط القبول بالأقسام التحضيرية في العلوم التجارية والتسيير ESC القليعة وكليات العلوم الاقتصادية.',
    programCodes: ['031', '032'],
    introAr: 'تمنح تخصصات التسيير والتجارة الأولوية الأولى لحاملي بكالوريا تسيير واقتصاد، وتتيح الالتحاق بالمدارس الوطنية للتجارة وفق معدلات تنافسية متميزة.',
  },
};

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES[slug];
  if (!cat) return {};

  return {
    title: cat.metaTitle,
    description: cat.metaDesc,
    openGraph: {
      title: cat.metaTitle,
      description: cat.metaDesc,
      url: `https://shater-bac.dz/orientation/${cat.slug}`,
      siteName: 'SHATER | الشاطر',
      locale: 'ar_DZ',
      type: 'website',
    },
  };
}

export default async function OrientationCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = CATEGORIES[slug];

  if (!category) {
    notFound();
  }

  // Filter verified programs matching this category
  const matchingPrograms = OFFICIAL_PROGRAMS.filter(p =>
    category.programCodes.includes(p.programCode)
  );

  return (
    <AppShell activeNav="orientation" showSidebar={false} noPadding={true}>
      <div className="min-h-screen bg-[#FAF9F6] text-stone-900 pb-28" dir="rtl">
        {/* Header Breadcrumbs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
            <Link href="/" className="hover:text-stone-900 transition-colors">
              الرئيسية
            </Link>
            <span>/</span>
            <Link href="/orientation" className="hover:text-stone-900 transition-colors">
              واش نقدر نقرا؟
            </Link>
            <span>/</span>
            <span className="text-teal-700 font-bold">{category.titleAr}</span>
          </nav>

          {/* Hero Banner */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{category.icon}</span>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-md">
                دليل التوجيه الجامعي
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight mb-3">
              {category.titleAr}
            </h1>

            <p className="text-xs sm:text-sm text-stone-400 font-sans mb-4" dir="ltr">
              {category.titleFr}
            </p>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-3xl mb-6">
              {category.introAr}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/orientation"
                className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>احسب معدلك وافحص أهليتك لهذا التخصص</span>
              </Link>
            </div>
          </div>

          {/* Programs Catalog for this Category */}
          <div className="mb-12">
            <h2 className="text-xl font-black text-stone-900 mb-4 tracking-tight">
              التكوينات المعتمدة رسمياً في هذا الميدان ({matchingPrograms.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchingPrograms.map(prog => (
                <div
                  key={prog.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <span className="font-mono text-teal-700 font-bold">كود #{prog.programCode}</span>
                    <span className="bg-stone-100 px-2 py-0.5 rounded-md font-semibold text-stone-600">
                      {prog.degreeType}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-stone-900 mb-1">
                    {prog.nameAr}
                  </h3>
                  <p className="text-xs text-stone-400 font-sans mb-3" dir="ltr">
                    {prog.nameFr}
                  </p>

                  <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-700 mb-3 space-y-1.5 border border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">مدة التكوين:</span>
                      <strong className="text-stone-800">{prog.durationYears} سنوات</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">المؤسسات المتاحة:</span>
                      <strong className="text-stone-800">{prog.institutions?.length || 1} مؤسسة</strong>
                    </div>
                  </div>

                  <Link
                    href={`/orientation`}
                    className="block text-center py-2.5 rounded-xl bg-stone-100 hover:bg-teal-50 text-stone-800 hover:text-teal-900 font-bold text-xs transition-colors"
                  >
                    حساب الأهلية بالنقاط
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Back to All Categories */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 text-center">
            <h3 className="font-bold text-stone-900 text-sm mb-1">
              حاب تستكشف تخصصات أخرى؟
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              ارجع للمستكشف الرئيسي لحساب معدلك واستعراض كافة الشعب والميادين.
            </p>
            <Link
              href="/orientation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
            >
              <span>الرجوع لمستكشف واش نقدر نقرا</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
