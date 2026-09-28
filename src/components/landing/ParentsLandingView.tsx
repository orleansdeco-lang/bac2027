"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AppShell } from "@/components/ui/AppShell";
import { useLandingUtm } from "@/lib/hooks/useLandingUtm";
import { LANDING_CONFIG } from "@/lib/constants/landing-config";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Smartphone,
  MessageCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  Brain,
  FileText,
  Clock,
  Send,
  HelpCircle,
} from "lucide-react";

const PARENT_FAQS = [
  {
    q: "هل أحتاج لإدخال بطاقتي البنكية لبدء التجربة المجانية لابني؟",
    a: "إطلاقاً. يبدأ ابنكم أو ابنتكم تجربة مجانية كاملة لمدة 7 أيام بمجرد إنشاء الحساب (0 دج)، دون الحاجة لإدخال أي بطاقة دفع أو أي التزام مالي.",
  },
  {
    q: "كيف أضمن أن ابني يدرس بجدية ولا يضيع وقته داخل المنصة؟",
    a: "المنصة بيئة أكاديمية مغلقة تماماً خالية من المشتتات والشبكات الاجتماعية. لا توجد محادثات خاصة (DMs)، والدراسة في مجالس العلم تعتمد على مؤقتات محددة وحل التمارين على الكراس الورقي بنماذج وسلالم التنقيط الوزارية.",
  },
  {
    q: "كيف تتم عملية الدفع عند الاستلام (COD) في ولايتي؟",
    a: "نوفر خدمة الدفع عند الاستلام لـ 58 ولاية. بعد انتهاء التجربة ورغبتكم في التفعيل، نرسل لكم ظرف المنصة الرسمي متضمناً كود التفعيل إلى باب منزلكم عبر الموزع الرسمي، وتدفعون المبلغ نقداً عند الاستلام.",
  },
  {
    q: "هل محتوى المنصة مطابق للبرنامج الوزاري الجزائري لشهادة البكالوريا؟",
    a: "نعم بنسبة 100%. المحتوى مصمم وفق المنهاج المعتمد لوزارة التربية الوطنية ومواضيع البكالوريا الرسمية، ونظام التوجيه مبني حرفياً على المنشور الوزاري رقم 01 لوزارة التعليم العالي والبحث العلمي دورة 2026/2027.",
  },
  {
    q: "هل يمكنني التواصل مع فريقكم للاستفسار قبل أو أثناء الاشتراك؟",
    a: "بكل تأكيد. خصصنا خدمة استشارات خاصة بأولياء الأمور عبر واتساب للرد على كافة أسئلتكم ومرافقتكم في كل ما يخص مسار ابنكم الدراسي.",
  },
];

export function ParentsLandingView() {
  const { buildAuthUrl } = useLandingUtm("lp_parents");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const trialDays = LANDING_CONFIG.trialDurationDays;

  // WhatsApp share to student
  const studentShareMessage = `السلام عليكم ولدي/بنتي، شوفي هاد المنصة الجزائرية للباك (الشاطر) فيها تنظيم هايل ومجالس تركيز وتجربة مجانية 7 أيام بدون دفع، سجّل وجرّبها من هنا: https://shater-bac.dz/students`;
  const whatsappStudentUrl = `https://wa.me/?text=${encodeURIComponent(studentShareMessage)}`;

  // Direct WhatsApp contact for parent
  const parentContactUrl = `https://wa.me/${LANDING_CONFIG.support.phone.replace("+", "")}?text=${encodeURIComponent(
    LANDING_CONFIG.support.parentMessage
  )}`;

  return (
    <AppShell showSidebar={false} showFooter={false} noPadding={true}>
      <div className="min-h-screen bg-[#070B14] text-white selection:bg-amber-400 selection:text-slate-950 font-sans" dir="rtl">
        
        {/* =================================================================== */}
        {/* SCREEN 1: DIGNIFIED HERO FOR ALGERIAN PARENTS                      */}
        {/* =================================================================== */}
        <section className="relative pt-12 sm:pt-20 pb-16 border-b border-white/[0.08] bg-gradient-to-b from-[#0B1222] via-[#070B14] to-[#0B1222] overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-[450px] h-[350px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 left-10 w-[400px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <Container size="md" className="relative z-10 text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>دليل أولياء أمور طلبة البكالوريا 2026/2027 🇩🇿</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.3]">
              إلى كل وليّ أمر يهمه مستقبل ابنه.. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-emerald-300">
                راحة بالكم ومرافقة تفوقهم مسؤوليتنا المشتركة.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
              نعلم كم يستنزف عام البكالوريا من أعصاب الأسرة وميزانيتها. منصة الشاطر صُممت لتمنح ابنكم الانضباط والتركيز الدراسي المدروس، وتحمي وقته من فوضى الإنترنت والمشتتات.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={parentContactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto font-black px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تحدث مع مستشار تعليمي للأولياء عبر واتساب</span>
                </Button>
              </a>

              <a href="#pedagogy" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-xs sm:text-sm bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-white"
                >
                  <span>كيف تعمل المنظومة بيداغوجياً؟</span>
                </Button>
              </a>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-center gap-3 pt-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{trialDays} أيام تجربة مجانية كاملة (0 دج)</span>
              </span>
              <span>•</span>
              <span>الدفع عند الاستلام لـ 58 ولاية</span>
              <span>•</span>
              <span>بيئة آمنة بدون إعلانات</span>
            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SCREEN 2: EMPATHY & REAL PARENTAL FEARS                            */}
        {/* =================================================================== */}
        <section className="py-12 sm:py-16 bg-[#070B14] border-b border-white/[0.08]">
          <Container size="lg" className="space-y-8">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>مخاوفكم المشروعة</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                ثلاثة مصادر قلق كبرى نضع حداً لها
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="p-5 rounded-3xl bg-[#0B1222] border border-rose-500/30 text-right space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg">
                  📱
                </div>
                <h3 className="text-sm font-black text-white">1. الهاتف وتضييع الوقت العشوائي</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  ابنكم يمسك الهاتف بحجة الدراسة، لكن تشتته الإشعارات والريلز. في الشاطر، يدخل إلى بيئة مغلقة مخصصة للمذاكرة الصامتة بدون أي محتوى ترفيهي.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#0B1222] border border-amber-500/30 text-right space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                  ⏳
                </div>
                <h3 className="text-sm font-black text-white">2. الخوف من ضياع سنة مصيرية</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  التخبط وتراكم المواد حتى الأشهر الأخيرة هو العدو الأكبر. توفر المنصة مساراً يومياً متدرجاً يضمن إتمام البرنامج وحل المواضيع الوزارية بالترتيب.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#0B1222] border border-blue-500/30 text-right space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                  💰
                </div>
                <h3 className="text-sm font-black text-white">3. تكاليف الدروس الخصوصية المرهقة</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  مئات الآلاف تُصرف شهرياً في دروس مكتظة لا تراعي الفروق الفردية. اشتراك الشاطر سنوي ثابت وشامل لجميع المواد الأساسية مع تشخيص دقيق للأخطاء.
                </p>
              </div>

            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SCREEN 3: PEDAGOGICAL PIPELINE (كيف تضمن المنصة استثمار الوقت)      */}
        {/* =================================================================== */}
        <section id="pedagogy" className="py-12 sm:py-16 bg-[#0B1222] border-b border-white/[0.08]">
          <Container size="lg" className="space-y-8">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <Brain className="w-3.5 h-3.5" />
                <span>المنهجية البيداغوجية</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                كيف تضمن المنصة تركيز ابنكم وجودة مراجعته؟
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-2xl bg-[#070B14] border border-white/10 text-right space-y-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h3 className="text-xs font-black text-white">تشخيص أولي للمهارات</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  اختبار لتحديد نقاط الضعف والمفاهيم التي لم يستوعبها الطالب في القسم لعلاجها فوراً.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#070B14] border border-white/10 text-right space-y-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <h3 className="text-xs font-black text-white">مخطط يومي لا يترك مجالاً للتسويف</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  جدول مهام واضح لكل يوم يحدد ماذا يراجع ومتى يحل، مما ينهي التردد والضياع.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#070B14] border border-white/10 text-right space-y-2">
                <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <h3 className="text-xs font-black text-white">مجالس المذاكرة الصامتة</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  طاولات دراسية مع طلاب شعبته توفر جو التنافس والجدية مع مؤقت بومودورو صارم.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#070B14] border border-white/10 text-right space-y-2">
                <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <h3 className="text-xs font-black text-white">معمل الأخطاء والتكرار المتباعد</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  حفظ آلي لكل سؤال أخطأ فيه الطالب وإعادة اختباره بتمارين توأم للتأكد من زوال الخطأ.
                </p>
              </div>

            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SCREEN 4: DIGITAL SAFETY GUARANTEE (ضمان البيئة الآمنة)             */}
        {/* =================================================================== */}
        <section className="py-12 sm:py-16 bg-[#070B14] border-b border-white/[0.08]">
          <Container size="md" className="space-y-6 text-center">
            
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Lock className="w-6 h-6" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              بيئة تعليمية نظيفة ومغلقة 100%
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right max-w-xl mx-auto text-xs">
              <div className="p-3.5 rounded-2xl bg-[#0B1222] border border-emerald-500/20 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 font-medium">بدون شبكات تواصل اجتماعي أو خلاصات إعلانية تشغل الانتباه.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0B1222] border border-emerald-500/20 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 font-medium">بدون محادثات خاصة عشوائية (No DMs) بين الطلاب.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0B1222] border border-emerald-500/20 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 font-medium">التركيز فقط على حل التمارين بالكتابة الحقيقية وسلالم التنقيط.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0B1222] border border-emerald-500/20 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 font-medium">محتوى مطابق تماماً للمنهاج الرسمي الجزائري المعتمد.</span>
              </div>
            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SCREEN 5: HONEST ROADMAP DISCLOSURE + PARENT FAQS                  */}
        {/* =================================================================== */}
        <section className="py-12 sm:py-16 bg-[#0B1222] border-b border-white/[0.08]">
          <Container size="md" className="space-y-8">
            
            {/* Honest Disclosure Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right space-y-1.5 text-xs text-amber-300">
              <div className="flex items-center gap-2 font-black">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>إفصاح وشفافية للأولياء بخصوص تقارير المتابعة الأسبوعية:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                نود إعلامكم بوضوح بأن ميزة <strong>«إرسال تقارير أسبوعية تفصيلية للأولياء عبر الرسائل»</strong> مدرجة حالياً في خريطة الطريق وقيد التطوير لضمان دقتها، ويمكنكم حالياً الاطلاع على إنجاز ابنكم مباشرة من خلال لوحة تحكم حسابه في المنصة.
              </p>
            </div>

            {/* FAQs Accordion */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white text-center pb-2">
                الأسئلة الأكثر شيوعاً بين الأولياء
              </h2>

              {PARENT_FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/[0.08] bg-[#070B14] overflow-hidden text-right"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 flex items-center justify-between gap-3 text-right hover:bg-white/[0.02] cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-black text-white">{faq.q}</span>
                      <span className="text-slate-400 shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-white/[0.04] text-xs text-slate-300 leading-relaxed font-medium">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </Container>
        </section>

        {/* =================================================================== */}
        {/* SCREEN 6: PARENT ACTIONS (WHATSAPP + SEND TO STUDENT)              */}
        {/* =================================================================== */}
        <section className="py-14 sm:py-20 bg-[#070B14] border-b border-white/[0.08]">
          <Container size="md" className="space-y-6 text-center">
            
            <div className="space-y-2 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <Truck className="w-3.5 h-3.5" />
                <span>الدفع عند الاستلام لـ 58 ولاية</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                ابدأوا الآن بمنح ابنكم أسبوعاً كاملاً مجاناً
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                دعوه يجرب المنظومة أولاً، وإذا أعجبته النتيجة نرسل لكم ظرف الاشتراك لباب منزلكم.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-2">
              
              {/* WhatsApp direct talk */}
              <a
                href={parentContactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  variant="primary"
                  size="md"
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تحدث معنا عبر واتساب</span>
                </Button>
              </a>

              {/* Send link to student */}
              <a
                href={whatsappStudentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  variant="outline"
                  size="md"
                  className="w-full py-4 rounded-2xl border-white/10 hover:bg-white/[0.05] text-amber-300 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>أرسل التجربة المجانية لابنك/ابنتك</span>
                </Button>
              </a>

            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-center gap-4 text-xs text-slate-400">
              <Link href="/privacy" className="hover:text-white underline">
                سياسة الخصوصية
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white underline">
                شروط الاستخدام
              </Link>
              <span>•</span>
              <Link href="/" className="hover:text-white">
                الصفحة الرئيسية
              </Link>
            </div>

          </Container>
        </section>

      </div>
    </AppShell>
  );
}
