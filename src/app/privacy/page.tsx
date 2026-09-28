import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { AppShell } from "@/components/ui/AppShell";
import { ShieldCheck, AlertTriangle, ArrowRight, ArrowLeft, Lock, FileText, Mail } from "lucide-react";
import { LANDING_CONFIG } from "@/lib/constants/landing-config";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | منصة الشاطر للبكالوريا",
  description: "سياسة الخصوصية وحماية المعطيات الشخصية لطلاب وأولياء أمور منصة الشاطر للبكالوريا الجزائرية.",
};

export default function PrivacyPage() {
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
                هذه الوثيقة مسودة أولية تنظيمية تحدد المبادئ العامة لحماية خصوصية مستخدمي منصة الشاطر، وهي تخضع للمراجعة القانونية المستمرة وفق التشريعات الجزائرية السارية لا سيما القانون رقم 18-07 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي.
              </p>
            </div>
          </div>

          {/* Page Header */}
          <div className="space-y-3 pb-6 border-b border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>حماية البيانات الشخصية والخصوصية</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              سياسة الخصوصية لمنصة الشاطر (SHATER)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              آخر تحديث: سبتمبر 2026 • موجه لطلاب البكالوريا وأولياء أمورهم
            </p>
          </div>

          {/* Document Content */}
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-slate-300">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">1</span>
                <span>المقدمة والتزامنا</span>
              </h2>
              <p>
                نحن في منصة <strong>الشاطر (SHATER)</strong> نعتبر خصوصية التلميذ والأسرة الجزائرية خطاً أحمر. نلتزم بحماية كافة المعلومات التي يقدمها الطالب أو ولي الأمر عند التسجيل أو استخدام المنصة، واستخدامها حصرياً للأغراض التعليمية والتنظيمية المصرح بها.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">2</span>
                <span>البيانات التي نقوم بجمعها</span>
              </h2>
              <p>عند إنشاء حساب وتفعيل الخطة التعليمية، نجمع فقط البيانات الضرورية لتخصيص التجربة:</p>
              <ul className="list-disc list-inside space-y-1.5 pr-2 text-slate-300">
                <li><strong>بيانات التعريف الشخصية:</strong> الاسم الأول، اللقب، البريد الإلكتروني.</li>
                <li><strong>بيانات الدراسة والمسار:</strong> الشعبة، الولاية، الثانوية، صفة التلميذ (متمدرس أو حر).</li>
                <li><strong>بيانات التواصل:</strong> رقم هاتف التلميذ، ورقم هاتف الولي (يستخدم لتأكيد الطلب وتوصيل كود التفعيل عند اختيار الدفع عند الاستلام COD).</li>
                <li><strong>البيانات البيداغوجية:</strong> نتائج التمارين، الأخطاء المرصودة في معمل الأخطاء، وساعات الدراسة في مجالس ديوان العلم، لغرض بناء المخطط اليومي العلاجي.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">3</span>
                <span>كيف نستخدم هذه البيانات؟</span>
              </h2>
              <p>تُعالج البيانات للأهداف الآتية فقط:</p>
              <ul className="list-disc list-inside space-y-1.5 pr-2 text-slate-300">
                <li>تخصيص المحتوى والتمارين حسب شعبة التلميذ والمنهاج الوزاري الرسمي.</li>
                <li>تنسيق توصيل كود التفعيل وظرف الاشتراك إلى عنوان التلميذ أو الولي عبر شركات التوصيل الوطنية.</li>
                <li>تقديم الدعم الفني والإجابة عن استفسارات الطلاب والأولياء عبر واتساب والبريد الإلكتروني.</li>
                <li>تطوير خوارزمية التشخيص البيداغوجي لتقديم تمارين علاجية ذات فعالية علمية عالية.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">4</span>
                <span>عدم مشاركة البيانات مع أطراف ثالثة</span>
              </h2>
              <p>
                نؤكد بشكل قاطع: <strong>منصة الشاطر لا تبيع، ولا تؤجر، ولا تشارك أي بيانات شخصية أو أرقام هواتف مع أي جهة تجارية أو إعلانية</strong>. يتم مشاركة معلومات العنوان ورقم الهاتف فقط مع شركة التوصيل المعتمدة لإيصال طرد الاشتراك في حال طلب التوصيل المنزلي.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">5</span>
                <span>حقوق المستخدم وحذف الحساب</span>
              </h2>
              <p>
                يحق للتلميذ أو وليه القانوني في أي وقت:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pr-2 text-slate-300">
                <li>الاطلاع على كافة البيانات المخزنة في حسابه وتعديلها.</li>
                <li>طلب حذف الحساب وجميع السجلات البيداغوجية نهائياً من خوادم المنصة عبر مراسلة الدعم الفني.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">6</span>
                <span>التواصل والاستفسار</span>
              </h2>
              <p>
                لأي استفسار بخصوص سياسة الخصوصية أو معالجة المعطيات الشخصية، يمكنكم التواصل مع الإدارة:
              </p>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-xs">
                <div>البريد الإلكتروني: <span className="font-mono text-amber-400">{LANDING_CONFIG.support.email}</span></div>
                <div>خدمة العملاء (واتساب): <span dir="ltr" className="font-mono text-emerald-400">{LANDING_CONFIG.support.displayPhone}</span></div>
              </div>
            </section>

          </div>

          {/* Footer Navigation */}
          <div className="pt-8 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <Link href="/terms" className="text-amber-400 hover:underline font-bold">
              شروط الاستخدام ←
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
