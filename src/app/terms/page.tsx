import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { AppShell } from "@/components/ui/AppShell";
import { Scale, AlertTriangle, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { LANDING_CONFIG } from "@/lib/constants/landing-config";

export const metadata: Metadata = {
  title: "شروط الاستخدام | منصة الشاطر للبكالوريا",
  description: "شروط وأحكام استخدام منصة الشاطر التعليمية للتحضير لشهادة البكالوريا في الجزائر.",
};

export default function TermsPage() {
  return (
    <AppShell showSidebar={false} showFooter={false} noPadding={true}>
      <div className="min-h-screen bg-[#070B14] text-slate-200 py-12" dir="rtl">
        <Container size="md" className="space-y-8">
          
          {/* Back link */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة إلى الصفحة الرئيسية</span>
            </Link>
          </div>

          {/* Legal Draft Warning Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-1 text-xs sm:text-sm">
              <strong className="font-black block">إشعار تنظيمي — مسودة أولية:</strong>
              <p className="text-amber-200/90 leading-relaxed">
                هذه الوثيقة مسودة أولية تنظيمية تحدد شروط وأحكام استخدام منصة الشاطر، وهي تخضع للمراجعة القانونية الدورية والتدقيق لتتوافق التوافق التام مع القوانين والتشريعات المعمول بها في الجمهورية الجزائرية الديمقراطية الشعبية.
              </p>
            </div>
          </div>

          {/* Page Header */}
          <div className="space-y-3 pb-6 border-b border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Scale className="w-3.5 h-3.5" />
              <span>اتفاقية الاستخدام والخدمة</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              شروط وأحكام استخدام منصة الشاطر (SHATER)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              دورة البكالوريا 2026/2027 • اتفاقية ملزمة تنظم العلاقة بين المنصة والمستخدم
            </p>
          </div>

          {/* Document Content */}
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-slate-300">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">1</span>
                <span>طبيعة المنصة والخدمة التعليمية</span>
              </h2>
              <p>
                منصة <strong>الشاطر (SHATER BAC)</strong> هي منصة تعليمية رقمية مساعدة تهدف إلى مرافقة تلاميذ شهادة البكالوريا في الجزائر من خلال توفير أدوات بيداغوجية، تشخيص للمهارات، ومجالس دراسية للمذاكرة الجماعية الصامتة. المنصة أداة مساعدة مكملة وليست جهة مانحة للشهادات، كما أنها ليست بديلاً عن التعليم المدرسي النظامي تحت إشراف وزارة التربية الوطنية.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">2</span>
                <span>الحساب والتسجيل والاستخدام الشخصي</span>
              </h2>
              <p>
                يتعهد المستخدم عند إنشاء الحساب بتقديم معلومات صحيحة ودقيقة (الشعبة، الولاية، ورقم الهاتف الصحيح). الحساب التعليمي مخصص للاستخدام الشخصي للطالب المسجل فقط، ويحظر تماماً مشاركة بيانات تسجيل الدخول أو بيع الحساب لأطراف أخرى. يحق للمنصة تجميد أي حساب يُكتشف فيه تسجيل دخول متزامن مشبوه من مواقع متعددة.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">3</span>
                <span>قواعد السلوك في مجالس ديوان العلم</span>
              </h2>
              <p>
                تُعد مجالس العلم في ديوان الشاطر بيئة أكاديمية جادة ونظيفة مخصصة للمذاكرة الصامتة والتركيز. يلتزم الطالب باحترام زملائه وعدم نشر أي رسائل غير لائقة، أو ترويجية، أو سياسية، أو مخالفة للآداب العامة. أي مخالفة تؤدي إلى الحظر الفوري من مجلس العلم دون إنذار مسبق.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">4</span>
                <span>التجربة المجانية والاشتراكات والأسعار</span>
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pr-2 text-slate-300">
                <li>يحصل كل طالب جديد على <strong>7 أيام تجربة مجانية كاملة (0 دج)</strong> فور إتمام التسجيل دون الحاجة لإدخال أي بطاقة دفع.</li>
                <li>بعد انتهاء التجربة المجانية، يقرر التلميذ ووليه بحرية الاشتراك في إحدى الخطط المتاحة.</li>
                <li>الأسعار معلنة بالدينار الجزائري (DZD) وتشمل كامل المحتوى المحدد في الخطة دون أي مصاريف مفاجئة.</li>
                <li>في خيار الدفع عند الاستلام (COD)، يتم تسليم كود التفعيل عبر الموزع الرسمي لـ 58 ولاية مع دفع المبلغ نقداً.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">5</span>
                <span>الملكية الفكرية وحقوق المحتوى</span>
              </h2>
              <p>
                كافة التصاميم، الأكواد، التمارين المولدة، والشروحات المنهجية المكتوبة خاصة بمنصة الشاطر ومحمية بحقوق الملكية الفكرية. يُمنع منعاً باتاً استخراج أو نسخ أو إعادة بيع محتوى المنصة لأغراض تجارية. أما مواضيع البكالوريا الرسمية الصادرة عن الديوان الوطني للامتحانات والمسابقات (ONEC) ومناشير التوجيه الصادرة عن وزارة التعليم العالي (MESRS) فهي وثائق عمومية يتم الاستناد إليها واستعراضها لخدمة الطلاب.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">6</span>
                <span>القانون الساري والاختصاص القضائي</span>
              </h2>
              <p>
                تخضع هذه الشروط والأحكام وتُفسر وفقاً للقوانين والتشريعات السارية في الجمهورية الجزائرية الديمقراطية الشعبية، وتختص المحاكم الجزائرية بالنظر في أي نزاع قد ينشأ عن تفسير أو تنفيذ هذه الاتفاقية.
              </p>
            </section>

          </div>

          {/* Footer Navigation */}
          <div className="pt-8 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <Link href="/privacy" className="text-amber-400 hover:underline font-bold">
              سياسة الخصوصية ←
            </Link>
            <Link href="/" className="hover:text-white">
              الصفحة الرئيسية
            </Link>
          </div>

        </Container>
      </div>
    </AppShell>
  );
}
