"use client";

import React from "react";
import Image from "next/image";
import { PhysicalKitDocumentData } from "@/lib/kit/types";
import {
  Package,
  Sparkles,
  ShieldCheck,
  QrCode,
  Globe,
  Phone,
  CheckCircle2,
  Calendar,
  MapPin,
  HelpCircle,
  Award,
  ArrowRight,
} from "lucide-react";

interface PhysicalKitDocumentProps {
  data: PhysicalKitDocumentData;
  className?: string;
}

/**
 * Print-Ready A4 Document Component for SHATER Physical Subscription Kit
 * Formatted specifically for A4 (210mm x 297mm) print rendering.
 */
export function PhysicalKitDocument({ data, className = "" }: PhysicalKitDocumentProps) {
  return (
    <div
      className={`a4-page bg-white text-slate-900 mx-auto shadow-2xl relative overflow-hidden flex flex-col justify-between font-sans ${className}`}
      style={{
        width: "210mm",
        minHeight: "296mm",
        padding: "16mm 18mm",
        boxSizing: "border-box",
      }}
      dir="rtl"
    >
      {/* Decorative Gold & Navy Borders (A4 Certificate & Welcome Aesthetic) */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-500 via-indigo-600 to-amber-500" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-900" />
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-500" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-500" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-500" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-500" />

      {/* Top Header: SHATER Brand & Official Kit Label */}
      <div className="space-y-4 border-b-2 border-slate-200 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-amber-400">
              ش
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-wider">
                  SHATER
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                  SHATER BAC
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                المنظومة الجزائرية الرقمية المتكاملة لتفوق البكالوريا
              </p>
            </div>
          </div>

          <div className="text-left font-mono text-xs text-slate-500 space-y-0.5" dir="ltr">
            <div className="font-bold text-slate-900 text-sm tracking-wider">
              {data.orderNumber}
            </div>
            <div>Date: {data.formattedDate}</div>
            <div className="text-[10px] text-emerald-700 font-sans font-bold">
              ✓ Physical Kit Official Slip
            </div>
          </div>
        </div>

        {/* Welcome Headline */}
        <div className="pt-2 text-center space-y-1">
          <h2 className="text-xl font-black text-indigo-950 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>مرحباً بك في SHATER</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h2>
          <p className="text-xs text-slate-600 font-medium max-w-lg mx-auto">
            نهنئك على انضمامك لنخبة المتفوقين في البكالوريا! مرفق مع هذا الطرد بطاقتك الذكية ودليل انطلاقك الدراسي.
          </p>
        </div>
      </div>

      {/* Main Order & Identity Credentials Card */}
      <div className="my-4 p-5 rounded-2xl border-2 border-slate-300 bg-slate-50/80 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* 1. Order Number */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-semibold block mb-0.5">
              رقم الطلب (Order Number):
            </span>
            <span className="text-base font-black font-mono text-slate-900">
              {data.orderNumber}
            </span>
          </div>

          {/* 2. SHATER ID (Public Identifier) */}
          <div className="p-3 bg-indigo-50/80 rounded-xl border-2 border-indigo-200 shadow-xs">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] text-indigo-900 font-bold block">
                معرف التلميذ (SHATER ID):
              </span>
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                معرف رسمي
              </span>
            </div>
            <span className="text-base font-black font-mono text-indigo-950 tracking-wider">
              {data.shaterId}
            </span>
          </div>

          {/* 3. Student Name */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-semibold block mb-0.5">
              اسم التلميذ:
            </span>
            <span className="text-sm font-bold text-slate-900">
              {data.studentName}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {data.wilaya} {data.commune ? `• ${data.commune}` : ""}
            </span>
          </div>

          {/* 4. Plan & Duration */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-semibold block mb-0.5">
              الخطة والمدة:
            </span>
            <span className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{data.planName} — {data.planDuration}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
              المبلغ: {data.formattedPrice} (الدفع عند الاستلام)
            </span>
          </div>
        </div>

        {/* Security Notice: No Passwords / Protection Guaranteed */}
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-[10px] text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>حماية الخصوصية:</strong> لا تتم طباعة أي كلمات سر أو رموز سرية في هذه الوثيقة حفاظاً على أمان حسابك.
          </span>
        </div>
      </div>

      {/* Step-by-Step Platform Access Instructions */}
      <div className="my-3 space-y-3">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>طريقة الدخول واستعمال المنصة (Instructions):</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Step 1 */}
          <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">ادخل إلى منصة SHATER:</strong>
              <span className="text-slate-600 text-[11px] leading-relaxed">
                افتح المتصفح على حاسوبك أو هاتفك وتوجه إلى الموقع: <strong className="font-mono text-indigo-700">{data.websiteUrl}</strong> أو امسح الرمز المرفق.
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">سجل الدخول:</strong>
              <span className="text-slate-600 text-[11px] leading-relaxed">
                اضغط على زر "تسجيل الدخول" وأدخل رقم هاتفك أو بريدك الإلكتروني المسجل في الطلب.
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">توجه إلى لوحة الطالب:</strong>
              <span className="text-slate-600 text-[11px] leading-relaxed">
                ستجد في لوحتك الشخصية بطاقتك الذكية، برنامج المراجعة الخاص بشعبتك، وتفاصيل اشتراكك.
              </span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
              4
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">ابدأ استعمال المنصة:</strong>
              <span className="text-slate-600 text-[11px] leading-relaxed">
                استفد من بنك المواضيع المحلولة، مجالس الديوان للمذاكرة الجماعية، وأدوات التوجيه الجامعي.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Codes & Support Block */}
      <div className="my-3 p-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50/50 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Platform QR Code */}
        <div className="flex items-center gap-4">
          {data.platformQrCode ? (
            <img
              src={data.platformQrCode}
              alt="Scan to open SHATER platform"
              className="w-24 h-24 rounded-xl border border-slate-300 p-1 bg-white shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-24 h-24 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
              <QrCode className="w-10 h-10" />
            </div>
          )}
          <div className="space-y-1 text-xs">
            <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
              <QrCode className="w-3.5 h-3.5 text-indigo-600" />
              <span>امسح الرمز لفتح المنصة فوراً</span>
            </span>
            <span className="font-mono text-[11px] text-indigo-700 block" dir="ltr">
              {data.websiteUrl}
            </span>
            <p className="text-[10px] text-slate-500 leading-tight">
              يعمل مباشرة بكاميرا أي هاتف ذكي للانتقال إلى صفحة الدخول.
            </p>
          </div>
        </div>

        {/* Right: WhatsApp Support */}
        <div className="flex items-center gap-4 sm:border-r sm:border-slate-300 sm:pr-6">
          {data.whatsappQrCode ? (
            <img
              src={data.whatsappQrCode}
              alt="Scan for WhatsApp Support"
              className="w-24 h-24 rounded-xl border border-slate-300 p-1 bg-white shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-24 h-24 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
              <Phone className="w-10 h-10" />
            </div>
          )}
          <div className="space-y-1 text-xs">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>دعم التلميذ عبر واتساب (WhatsApp):</span>
            </span>
            <span className="font-mono font-bold text-emerald-700 text-xs block" dir="ltr">
              {data.whatsappNumber}
            </span>
            <p className="text-[10px] text-slate-500 leading-tight">
              فريق شاطر يرافقك خطوة بخطوة للإجابة عن أي استفسار دراسي أو تقني.
            </p>
          </div>
        </div>
      </div>

      {/* Brief Student Advice / Unboxing Note */}
      <div className="my-2 p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[11px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>توجيه دراسي:</strong> اجعل مراجعتك منتظمة يومياً، واستعمل مؤقت التركيز في المنصة لتحقيق أعلى معدل في البكالوريا.
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
          ID: {data.shaterId}
        </div>
      </div>

      {/* Footer & Verification Note */}
      <div className="border-t border-slate-200 pt-3 flex flex-wrap items-center justify-between text-[10px] text-slate-500">
        <div>
          <span>منصة شاطر التعليمية © 2026-2027 — جميع الحقوق محفوظة لجمهورية الجزائر الديمقراطية الشعبية</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span>Kit Ref: {data.orderNumber}</span>
          <span>•</span>
          <span>Security Verified</span>
        </div>
      </div>
    </div>
  );
}
