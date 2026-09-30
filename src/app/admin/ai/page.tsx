"use client";

import React from "react";
import {
  Bot,
  ShieldCheck,
  Lock,
  AlertTriangle,
  Cpu,
  Layers,
  FileCode2,
  CheckCircle2,
} from "lucide-react";

export default function AdminAIPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span>مساعد SHATER الإداري — بروتوكول الأمان والرقابة</span>
          </h2>
          <p className="text-xs text-slate-400">
            البنية التحتية الآمنة لدمج الذكاء الاصطناعي مع فرض قواعد عدم النفاذ المباشر لقاعدة البيانات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>AI Model Disconnected (Safe Standby)</span>
          </span>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-amber-200">
            محددات الأمان الصارمة لمحرك الذكاء الاصطناعي (Strict Safety Invariants)
          </div>
          <p className="text-amber-300/80 leading-relaxed">
            وفقاً لـ SHATER_CONTROL_CENTER_AUDIT.md، لا يُسمح للذكاء الاصطناعي بالوصول المباشر أو تنفيذ استعلامات خام (Raw SQL Queries) على قاعدة بيانات المنصة. جميع العمليات المستقبلية ستخضع لمنظومة أدوات محكومة (Deterministic Tools) ومقيدة بالصلاحيات الدقيقة (`ai.use` و `ai.execute`) مع توثيق إلزامي في سجل العمليات.
          </p>
        </div>
      </div>

      {/* Architecture Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Principles */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 space-y-4">
          <div className="border-b border-[#1E293B] pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">مبادئ الحوكمة والتحكم</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#080D1A] border border-[#1E293B] space-y-1">
              <div className="flex items-center justify-between text-slate-200 font-semibold">
                <span>1. عزل قاعدة البيانات (No Raw DB Access)</span>
                <span className="text-emerald-400 font-mono text-[10px]">مفعل ✓</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                لا يملك الذكاء الاصطناعي أي اتصال بصلاحيات الخدمة الفائقة (service_role) لقراءة أو تعديل الجداول بدون وسيط.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080D1A] border border-[#1E293B] space-y-1">
              <div className="flex items-center justify-between text-slate-200 font-semibold">
                <span>2. الأدوات المعرفة سلفاً (Deterministic Tool Calling)</span>
                <span className="text-emerald-400 font-mono text-[10px]">مفعل ✓</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                أي إجراء يتم حصراً عبر دوال TypeScript محددة المدخلات والمخرجات ومتحقق من صحتها بواسطة Zod.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080D1A] border border-[#1E293B] space-y-1">
              <div className="flex items-center justify-between text-slate-200 font-semibold">
                <span>3. التدخل البشري والتوثيق (Human In The Loop)</span>
                <span className="text-emerald-400 font-mono text-[10px]">مفعل ✓</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                تسجيل كافة الاقتراحات والإجراءات في سجل العمليات غير القابل للتعديل مع بيان هوية المستخدم المأذون.
              </p>
            </div>
          </div>
        </div>

        {/* Readiness Checklist */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 space-y-4">
          <div className="border-b border-[#1E293B] pb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">جاهزية طبقة البنية التحتية</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#080D1A] border border-[#1E293B]">
              <span className="text-slate-300">صلاحية الاستخدام (`ai.use`)</span>
              <span className="font-mono text-emerald-400 text-[11px]">مجهزة في الـ RBAC</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#080D1A] border border-[#1E293B]">
              <span className="text-slate-300">صلاحية التنفيذ (`ai.execute`)</span>
              <span className="font-mono text-amber-400 text-[11px]">محصورة في OWNER فقط</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#080D1A] border border-[#1E293B]">
              <span className="text-slate-300">اتصال الموديل الخارجي (LLM Provider)</span>
              <span className="font-mono text-slate-500 text-[11px]">غير متصل (Standby)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#080D1A] border border-[#1E293B]">
              <span className="text-slate-300">سجل مراجعة قرارات الذكاء الاصطناعي</span>
              <span className="font-mono text-emerald-400 text-[11px]">جاهز في public.operations_audit_logs</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#131E36] border border-[#1E293B] text-[11px] text-slate-300 space-y-1">
            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
              <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>مرحلة التفعيل القادمة:</span>
            </div>
            <p className="text-slate-400">
              سيتم ربط المساعد بعد اعتماد منظومة الفلاتر التربوية ومراجعة كافة الأدوات من قبل مهندس الأمان.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Console UI (Disabled Standby State) */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 space-y-4 opacity-75">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-300">واجهة التفاعل الإدارية المقيدة</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-[#080D1A] border border-[#1E293B]">
            Sandbox Disabled
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#080D1A] border border-[#1E293B] text-center text-xs text-slate-500 space-y-2 py-8">
          <Lock className="w-6 h-6 mx-auto text-slate-600" />
          <div className="font-semibold text-slate-400">
            محرك الذكاء الاصطناعي مغلق في هذه المرحلة التأسيسية
          </div>
          <div className="text-[11px] text-slate-600 max-w-md mx-auto">
            وفقاً لتعليمات البناء (Section 6: DO NOT BUILD AI YET)، تم إنشاء هيكل الأمان والسياسات بدون تفعيل أو استدعاء أي نموذج خارجي.
          </div>
        </div>
      </div>
    </div>
  );
}
