"use client";

import React, { useState, useEffect, useId } from "react";
import {
  JournalAccountRow,
  JournalEntryPayload,
  JournalEntrySolution,
  JournalValidationResult,
  JournalValidationError,
} from "@/types/interactive-exercise";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  HelpCircle,
  Sparkles,
  Info,
  Calendar,
} from "lucide-react";

// ============================================================================
// OFFICIAL ALGERIAN SCF ACCOUNTING CHART DICTIONARY (مدونة الحسابات الرسمية)
// ============================================================================

export const SCF_ACCOUNTS: Record<string, string> = {
  // الصنف 1: رؤوس الأموال
  "101": "رأس المال الصادر",
  "106": "الاحتياطات",
  "12": "نتيجة السنة المالية",
  "164": "اقتراضات لدى مؤسسات القرض",

  // الصنف 2: التثبيتات
  "204": "برمجيات المعلوماتية وما شابهها",
  "211": "الأراضي",
  "213": "البناءات",
  "215": "المنشآت التقنية والمعدات والأدوات الصناعية",
  "218": "تثبيتات عينية أخرى",
  "2182": "معدات النقل",
  "2183": "معدات المكتب وتجهيزات الإعلام الآلي",

  // الصنف 28: اهتلاكات التثبيتات
  "280": "اهتلاك التثبيتات المعنوية",
  "2804": "اهتلاك برمجيات المعلوماتية",
  "281": "اهتلاك التثبيتات العينية",
  "2813": "اهتلاك البناءات",
  "2815": "اهتلاك المنشآت التقنية والمعدات والأدوات الصناعية",
  "2818": "اهتلاك تثبيتات عينية أخرى",
  "28182": "اهتلاك معدات النقل",
  "28183": "اهتلاك معدات المكتب وتجهيزات الإعلام الآلي",

  // الصنف 29: خسائر القيمة عن التثبيتات
  "290": "خسائر القيمة عن التثبيتات المعنوية",
  "291": "خسائر القيمة عن التثبيتات العينية",
  "2915": "خسائر القيمة عن المنشآت التقنية",
  "2918": "خسائر القيمة عن تثبيتات عينية أخرى",

  // الصنف 3 و 4 و 5: المخزونات، الحسابات الدائنة والمدينة، والمالية
  "401": "موردو المخزونات والخدمات",
  "404": "موردو التثبيتات",
  "411": "الزبائن",
  "416": "الزبائن المشكوك فيهم",
  "462": "حسابات دائنة عن عمليات التنازل عن تثبيتات",
  "491": "خسائر القيمة عن حسابات الزبائن",
  "512": "بنوك الحسابات الجارية",
  "53": "الصندوق",

  // الصنف 6: الأعباء
  "681": "مخصصات الاهتلاكات والمؤونات وخسائر القيمة - أصول غير جارية",
  "682": "مخصصات الاهتلاكات والمؤونات وخسائر القيمة - أصول جارية",
  "685": "مخصصات الاهتلاكات والمؤونات - عناصر غير جارية",
  "686": "مخصصات الاهتلاكات والمؤونات وخسائر القيمة - عناصر مالية",
  "652": "نقص القيمة عن خروج أصول مثبتة غير مالية",

  // الصنف 7: النواتج
  "752": "فائض القيمة عن خروج أصول مثبتة غير مالية",
  "781": "استرجاعات الاستغلال عن خسائر القيمة والمؤونات - أصول غير جارية",
  "785": "استرجاعات عن مؤونات وخسائر القيمة",
  "786": "استرجاعات مالية عن خسائر القيمة والمؤونات",
};

/**
 * Normalizes account code (trims spaces, dots, slashes)
 */
export function normalizeAccountCode(code: string): string {
  return code.trim().replace(/[.\-\s/]/g, "");
}

/**
 * Resolves standard SCF account title in Arabic
 */
export function resolveAccountName(code: string): string {
  const norm = normalizeAccountCode(code);
  return SCF_ACCOUNTS[norm] || "";
}

// ============================================================================
// PURE VALIDATION ENGINE
// ============================================================================

export function validateJournalEntry(
  payload: JournalEntryPayload,
  solution?: JournalEntrySolution
): JournalValidationResult {
  const errors: JournalValidationError[] = [];

  const validDebits = payload.debitRows.filter(
    (r) => r.code.trim() !== "" || (typeof r.amount === "number" && r.amount > 0)
  );
  const validCredits = payload.creditRows.filter(
    (r) => r.code.trim() !== "" || (typeof r.amount === "number" && r.amount > 0)
  );

  const totalDebit = validDebits.reduce(
    (sum, r) => sum + (typeof r.amount === "number" ? r.amount : 0),
    0
  );
  const totalCredit = validCredits.reduce(
    (sum, r) => sum + (typeof r.amount === "number" ? r.amount : 0),
    0
  );
  const imbalanceAmount = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && imbalanceAmount < 0.01;

  // 1. Empty check
  if (validDebits.length === 0 && validCredits.length === 0) {
    return {
      isValid: false,
      isBalanced: false,
      totalDebit: 0,
      totalCredit: 0,
      imbalanceAmount: 0,
      errors: [
        {
          field: "empty",
          message_ar: "يرجى إدخال أرقام الحسابات والمبالغ في جدول اليومية.",
          message_fr: "Veuillez saisir les comptes et les montants.",
        },
      ],
      feedback_ar: "الجدول فارغ. ابدأ بإدخال الحساب المدين ثم الحساب الدائن.",
    };
  }

  // 2. Balance check (Double-entry core invariant)
  if (!isBalanced) {
    errors.push({
      field: "balance",
      message_ar: `القيد غير متوازن: مجموع المدين (${totalDebit.toLocaleString()} دج) لا يساوي مجموع الدائن (${totalCredit.toLocaleString()} دج).`,
      message_fr: `Écriture non équilibrée : Débit (${totalDebit}) ≠ Crédit (${totalCredit}).`,
      hint_ar: "مبدأ القيد المزدوج في المحاسبة يفرض دائماً: مجموع المبالغ المدينة = مجموع المبالغ الدائنة.",
    });
  }

  // If no reference solution is provided, stop at balance & validity
  if (!solution) {
    return {
      isValid: errors.length === 0,
      isBalanced,
      totalDebit,
      totalCredit,
      imbalanceAmount,
      errors,
      feedback_ar: isBalanced
        ? "القيد متوازن شكلياً ومطابق لقواعد القيد المزدوج."
        : "تحقق من توازن المبالغ بين المدين والدائن.",
    };
  }

  // 3. Check for reversed entry (الطرف المقلوب)
  const debitCodes = validDebits.map((d) => normalizeAccountCode(d.code));
  const creditCodes = validCredits.map((c) => normalizeAccountCode(c.code));
  const expectedDebitCodes = solution.expectedDebits.map((d) => normalizeAccountCode(d.code));
  const expectedCreditCodes = solution.expectedCredits.map((c) => normalizeAccountCode(c.code));

  const hasReversedDebits = debitCodes.some((code) => expectedCreditCodes.includes(code));
  const hasReversedCredits = creditCodes.some((code) => expectedDebitCodes.includes(code));

  if (hasReversedDebits && hasReversedCredits) {
    errors.push({
      field: "debit_code",
      message_ar: "القيد مسجل بالمقلوب: الحسابات المدينة وُضعت في الدائن، والحسابات الدائنة وُضعت في المدين!",
      message_fr: "Écriture inversée : les comptes de débit et de crédit ont été intervertis.",
      hint_ar: "حساب 681 حساب أعباء يسجل في الطرف المدين، بينما حسابات الاهتلاك (الصنف 28) تخفّض الأصل فتسجل في الطرف الدائن.",
    });
  }

  // 4. Check common misconception: Using asset account (الصنف 21) instead of amortization (الصنف 28)
  const usedAssetInsteadOfAmortization = creditCodes.some(
    (code) =>
      code.startsWith("21") &&
      expectedCreditCodes.some((exp) => exp.startsWith("28"))
  );
  if (usedAssetInsteadOfAmortization) {
    errors.push({
      field: "credit_code",
      message_ar: "انتبه: استعملت حساب الأصل (الصنف 21) بدلاً من حساب اهتلاك الأصل (الصنف 28).",
      message_fr: "Attention : vous avez utilisé le compte d'actif (21) au lieu du compte d'amortissement (28).",
      hint_ar: "في قيود التسوية لنهاية السنة لا نلمس حساب الأصل مباشرة، بل نسجل النقص في حساب الاهتلاك المتراكم (281x).",
    });
  }

  // 5. Verify Debit accounts and amounts
  for (const exp of solution.expectedDebits) {
    const normExp = normalizeAccountCode(exp.code);
    const altCodes = (exp.alternativeCodes || []).map(normalizeAccountCode);
    const allAllowed = [normExp, ...altCodes];

    const matchRow = validDebits.find((d) => allAllowed.includes(normalizeAccountCode(d.code)));
    if (!matchRow) {
      errors.push({
        field: "debit_code",
        message_ar: `ينقص في الطرف المدين الحساب رقم: ${exp.code} (${exp.name_ar || resolveAccountName(exp.code)}).`,
        message_fr: `Compte débit manquant : ${exp.code}.`,
        hint_ar: `حساب مخصصات نهاية السنة الخاص بالتثبيتات هو ح/${exp.code}.`,
      });
    } else {
      const amt = typeof matchRow.amount === "number" ? matchRow.amount : 0;
      const tol = exp.tolerance || 1;
      if (Math.abs(amt - exp.amount) > tol) {
        errors.push({
          field: "amount",
          message_ar: `المبلغ المسجل في الحساب المدين ${matchRow.code} (${amt.toLocaleString()} دج) غير صحيح. المبلغ المتوقع هو: ${exp.amount.toLocaleString()} دج.`,
          message_fr: `Montant incorrect pour le compte débit ${matchRow.code}.`,
          hint_ar: "تأكد من تطبيق صيغة القسط السنوي A = V0 * t * (m/12) مع مراعاة أشهر الاستعمال الفعلية.",
        });
      }
    }
  }

  // 6. Verify Credit accounts and amounts
  for (const exp of solution.expectedCredits) {
    const normExp = normalizeAccountCode(exp.code);
    const altCodes = (exp.alternativeCodes || []).map(normalizeAccountCode);
    const allAllowed = [normExp, ...altCodes];

    const matchRow = validCredits.find((c) => allAllowed.includes(normalizeAccountCode(c.code)));
    if (!matchRow) {
      errors.push({
        field: "credit_code",
        message_ar: `ينقص في الطرف الدائن الحساب رقم: ${exp.code} (${exp.name_ar || resolveAccountName(exp.code)}).`,
        message_fr: `Compte crédit manquant : ${exp.code}.`,
        hint_ar: `حساب الاهتلاك المناسب لهذا الأصل هو ح/${exp.code}.`,
      });
    } else {
      const amt = typeof matchRow.amount === "number" ? matchRow.amount : 0;
      const tol = exp.tolerance || 1;
      if (Math.abs(amt - exp.amount) > tol) {
        errors.push({
          field: "amount",
          message_ar: `المبلغ المسجل في الحساب الدائن ${matchRow.code} (${amt.toLocaleString()} دج) غير مطابق. المتوقع: ${exp.amount.toLocaleString()} دج.`,
          message_fr: `Montant incorrect pour le compte crédit ${matchRow.code}.`,
          hint_ar: "راجع حساب القسط بدقة وتأكد من المعطيات.",
        });
      }
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    isBalanced,
    totalDebit,
    totalCredit,
    imbalanceAmount,
    errors,
    feedback_ar: isValid
      ? "ممتاز! القيد المحاسبي صحيح ومتوازن تماماً، ومطابق للمعايير البيداغوجية للبكالوريا."
      : errors[0]?.message_ar,
    feedback_fr: isValid
      ? "Écriture comptable parfaitement exacte et équilibrée."
      : errors[0]?.message_fr,
  };
}

// ============================================================================
// COMPONENT INTERACTION PROPS
// ============================================================================

export interface InteractiveJournalProps {
  solution?: JournalEntrySolution;
  initialPayload?: Partial<JournalEntryPayload>;
  isReadOnly?: boolean;
  onValidate?: (result: JournalValidationResult, payload: JournalEntryPayload) => void;
  locale?: string;
}

export function InteractiveJournal({
  solution,
  initialPayload,
  isReadOnly = false,
  onValidate,
  locale = "ar",
}: InteractiveJournalProps) {
  const isAr = locale === "ar";
  const genId = useId();

  // Rows state
  const [date, setDate] = useState<string>(
    initialPayload?.date || solution?.expectedDate || "31/12/2023"
  );
  const [label, setLabel] = useState<string>(
    initialPayload?.label_ar || "تسجيل قسط الاهتلاك السنوي"
  );
  const [debitRows, setDebitRows] = useState<JournalAccountRow[]>(
    initialPayload?.debitRows || [
      { id: `d-1-${genId}`, code: "", name_ar: "", amount: "" },
    ]
  );
  const [creditRows, setCreditRows] = useState<JournalAccountRow[]>(
    initialPayload?.creditRows || [
      { id: `c-1-${genId}`, code: "", name_ar: "", amount: "" },
    ]
  );

  const [validation, setValidation] = useState<JournalValidationResult | null>(null);
  const [showExpectedSolution, setShowExpectedSolution] = useState(false);

  // Live balance calculation
  const totalDebit = debitRows.reduce(
    (sum, r) => sum + (typeof r.amount === "number" ? r.amount : 0),
    0
  );
  const totalCredit = creditRows.reduce(
    (sum, r) => sum + (typeof r.amount === "number" ? r.amount : 0),
    0
  );
  const imbalance = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && imbalance < 0.01;

  // Auto-name resolver on code change
  const handleDebitCodeChange = (id: string, code: string) => {
    setDebitRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const autoName = resolveAccountName(code);
        return {
          ...row,
          code,
          name_ar: autoName || row.name_ar,
        };
      })
    );
    setValidation(null);
  };

  const handleCreditCodeChange = (id: string, code: string) => {
    setCreditRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const autoName = resolveAccountName(code);
        return {
          ...row,
          code,
          name_ar: autoName || row.name_ar,
        };
      })
    );
    setValidation(null);
  };

  const handleDebitAmountChange = (id: string, val: string) => {
    const num = val === "" ? "" : parseFloat(val);
    setDebitRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, amount: isNaN(num as number) ? "" : num } : row))
    );
    setValidation(null);
  };

  const handleCreditAmountChange = (id: string, val: string) => {
    const num = val === "" ? "" : parseFloat(val);
    setCreditRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, amount: isNaN(num as number) ? "" : num } : row))
    );
    setValidation(null);
  };

  const addDebitRow = () => {
    setDebitRows((prev) => [
      ...prev,
      { id: `d-${Date.now()}`, code: "", name_ar: "", amount: "" },
    ]);
  };

  const removeDebitRow = (id: string) => {
    if (debitRows.length <= 1) return;
    setDebitRows((prev) => prev.filter((r) => r.id !== id));
  };

  const addCreditRow = () => {
    setCreditRows((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, code: "", name_ar: "", amount: "" },
    ]);
  };

  const removeCreditRow = (id: string) => {
    if (creditRows.length <= 1) return;
    setCreditRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleValidate = () => {
    const payload: JournalEntryPayload = {
      date,
      debitRows,
      creditRows,
      label_ar: label,
    };
    const res = validateJournalEntry(payload, solution);
    setValidation(res);
    if (onValidate) {
      onValidate(res, payload);
    }
  };

  return (
    <div dir="rtl" className="space-y-4">
      {/* Table Wrapper with classic Algerian Accounting Journal Header */}
      <div className="rounded-2xl border-2 border-theme bg-card shadow-card overflow-hidden">
        
        {/* Top Header: Date & Balance Status */}
        <div className="bg-surface-soft px-4 py-3 border-b border-theme flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-xs font-bold text-theme-muted">تاريخ القيد:</span>
            <input
              type="text"
              value={date}
              disabled={isReadOnly}
              onChange={(e) => setDate(e.target.value)}
              placeholder="31/12/202X"
              className="w-28 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-theme bg-card text-theme-text focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* Live Balance Status Badge */}
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-theme-muted" />
            {totalDebit === 0 && totalCredit === 0 ? (
              <Badge variant="outline" size="sm" className="text-[11px]">
                في انتظار إدخال المبالغ
              </Badge>
            ) : isBalanced ? (
              <Badge variant="success" size="sm" className="flex items-center gap-1 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>القيد متوازن: {totalDebit.toLocaleString()} دج</span>
              </Badge>
            ) : (
              <Badge variant="warning" size="sm" className="flex items-center gap-1 font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>غير متوازن • الفارق: {imbalance.toLocaleString()} دج</span>
              </Badge>
            )}
          </div>
        </div>

        {/* The Accounting Journal Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-surface border-b border-theme text-theme-muted font-bold">
                <th className="py-2.5 px-3 w-28 text-center border-l border-theme">
                  المدين (دج)
                </th>
                <th className="py-2.5 px-3 w-28 text-center border-l border-theme">
                  الدائن (دج)
                </th>
                <th className="py-2.5 px-3 w-24 text-center border-l border-theme">
                  رقم الحساب
                </th>
                <th className="py-2.5 px-3 text-start">
                  اسم الحساب / البيان
                </th>
                {!isReadOnly && <th className="py-2.5 px-2 w-10 text-center"></th>}
              </tr>
            </thead>
            <tbody>
              {/* ------------------------------------------------------------- */}
              {/* 1. DEBIT SECTION (الطرف المدين)                               */}
              {/* ------------------------------------------------------------- */}
              {debitRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-b border-theme/60 hover:bg-surface-soft/40 transition-colors"
                >
                  {/* Debit Amount */}
                  <td className="p-2 border-l border-theme">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                      disabled={isReadOnly}
                      value={row.amount}
                      onChange={(e) => handleDebitAmountChange(row.id, e.target.value)}
                      className="w-full px-2 py-1.5 text-center font-mono font-bold text-xs rounded-lg border border-theme bg-card text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </td>

                  {/* Empty Credit Cell for Debit Row */}
                  <td className="p-2 border-l border-theme bg-surface-soft/30 text-center text-theme-muted">
                    —
                  </td>

                  {/* Account Code */}
                  <td className="p-2 border-l border-theme">
                    <input
                      type="text"
                      placeholder="681"
                      disabled={isReadOnly}
                      value={row.code}
                      onChange={(e) => handleDebitCodeChange(row.id, e.target.value)}
                      className="w-full px-2 py-1.5 text-center font-mono font-bold text-xs rounded-lg border border-theme bg-card text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </td>

                  {/* Account Name */}
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase shrink-0">
                        (مدين)
                      </span>
                      <input
                        type="text"
                        placeholder="اسم الحساب المدين..."
                        disabled={isReadOnly}
                        value={row.name_ar}
                        onChange={(e) =>
                          setDebitRows((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, name_ar: e.target.value } : r))
                          )
                        }
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-transparent hover:border-theme bg-transparent text-theme-text focus:bg-card focus:border-theme focus:outline-none"
                      />
                    </div>
                  </td>

                  {/* Delete Action */}
                  {!isReadOnly && (
                    <td className="p-2 text-center">
                      {debitRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDebitRow(row.id)}
                          className="text-theme-muted hover:text-[var(--color-error)] p-1 rounded-md transition-colors"
                          title="حذف السطر المدين"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}

              {/* Add Debit Row Button */}
              {!isReadOnly && (
                <tr className="border-b border-theme/40 bg-surface-soft/20">
                  <td colSpan={5} className="py-1 px-3 text-start">
                    <button
                      type="button"
                      onClick={addDebitRow}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-primary)] hover:underline cursor-pointer py-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة حساب مدين آخر (لقيد مركب)</span>
                    </button>
                  </td>
                </tr>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 2. CREDIT SECTION (الطرف الدائن - مزاح لليسار اصطلاحاً)         */}
              {/* ------------------------------------------------------------- */}
              {creditRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-b border-theme/60 hover:bg-surface-soft/40 transition-colors"
                >
                  {/* Empty Debit Cell for Credit Row */}
                  <td className="p-2 border-l border-theme bg-surface-soft/30 text-center text-theme-muted">
                    —
                  </td>

                  {/* Credit Amount */}
                  <td className="p-2 border-l border-theme">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                      disabled={isReadOnly}
                      value={row.amount}
                      onChange={(e) => handleCreditAmountChange(row.id, e.target.value)}
                      className="w-full px-2 py-1.5 text-center font-mono font-bold text-xs rounded-lg border border-theme bg-card text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </td>

                  {/* Account Code */}
                  <td className="p-2 border-l border-theme">
                    <input
                      type="text"
                      placeholder="281x"
                      disabled={isReadOnly}
                      value={row.code}
                      onChange={(e) => handleCreditCodeChange(row.id, e.target.value)}
                      className="w-full px-2 py-1.5 text-center font-mono font-bold text-xs rounded-lg border border-theme bg-card text-[var(--color-accent)] focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </td>

                  {/* Account Name (Indented with icon) */}
                  <td className="p-2 pe-6">
                    <div className="flex items-center gap-2 pr-6">
                      <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase shrink-0">
                        إلى حـ/ (دائن)
                      </span>
                      <input
                        type="text"
                        placeholder="اسم الحساب الدائن..."
                        disabled={isReadOnly}
                        value={row.name_ar}
                        onChange={(e) =>
                          setCreditRows((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, name_ar: e.target.value } : r))
                          )
                        }
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-transparent hover:border-theme bg-transparent text-theme-text focus:bg-card focus:border-theme focus:outline-none"
                      />
                    </div>
                  </td>

                  {/* Delete Action */}
                  {!isReadOnly && (
                    <td className="p-2 text-center">
                      {creditRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCreditRow(row.id)}
                          className="text-theme-muted hover:text-[var(--color-error)] p-1 rounded-md transition-colors"
                          title="حذف السطر الدائن"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}

              {/* Add Credit Row Button */}
              {!isReadOnly && (
                <tr className="border-b border-theme/40 bg-surface-soft/20">
                  <td colSpan={5} className="py-1 px-3 text-start">
                    <button
                      type="button"
                      onClick={addCreditRow}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-accent)] hover:underline cursor-pointer py-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة حساب دائن آخر</span>
                    </button>
                  </td>
                </tr>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 3. FOOTER: EXPLANATION / JUSTIFICATION ROW                    */}
              {/* ------------------------------------------------------------- */}
              <tr className="bg-surface-soft/40 border-b border-theme">
                <td colSpan={2} className="p-2 border-l border-theme text-center text-xs font-mono font-bold text-theme-muted">
                  (البيان والتبرير)
                </td>
                <td colSpan={3} className="p-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-theme-muted shrink-0" />
                    <input
                      type="text"
                      placeholder="بيان القيد (مثلاً: إثبات قسط اهتلاك الآلة لسنة 202X)..."
                      disabled={isReadOnly}
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full px-2 py-1 text-xs italic text-theme-secondary bg-transparent border border-transparent hover:border-theme rounded-lg focus:bg-card focus:border-theme focus:outline-none"
                    />
                  </div>
                </td>
              </tr>

              {/* ------------------------------------------------------------- */}
              {/* 4. TOTALS ROW (المجاميع)                                       */}
              {/* ------------------------------------------------------------- */}
              <tr className="bg-surface font-bold text-xs">
                <td className="p-2.5 text-center font-mono border-l border-theme text-[var(--color-primary)]">
                  {totalDebit.toLocaleString()} دج
                </td>
                <td className="p-2.5 text-center font-mono border-l border-theme text-[var(--color-accent)]">
                  {totalCredit.toLocaleString()} دج
                </td>
                <td colSpan={3} className="p-2.5 text-start text-theme-muted">
                  المجموع العام للعملية
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action / Validation Buttons */}
      {!isReadOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleValidate}
              className="font-bold shadow-clay px-6"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تحقق من صحة القيد المحاسبي</span>
            </Button>

            {solution && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setShowExpectedSolution(!showExpectedSolution)}
                className="text-xs text-theme-muted hover:text-theme-text"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showExpectedSolution ? "إخفاء الشرح" : "تلميح بيداغوجي"}</span>
              </Button>
            )}
          </div>

          <div className="text-[11px] text-theme-muted">
            <span>النظام المحاسبي المالي الجزائري (SCF) • بكالوريا 2027</span>
          </div>
        </div>
      )}

      {/* Validation Feedback Banner */}
      {validation && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all animate-fade-in space-y-3 ${
            validation.isValid
              ? "bg-[var(--color-success-soft)] border-[var(--color-success)]/30 text-theme-text"
              : "bg-card border-[var(--color-error)]/40 text-theme-text shadow-sm"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                validation.isValid ? "bg-[var(--color-success)]" : "bg-[var(--color-error)]"
              }`}
            >
              {validation.isValid ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-1">
              <h4
                className={`text-sm font-bold ${
                  validation.isValid ? "text-[var(--color-success)]" : "text-[var(--color-error)]"
                }`}
              >
                {validation.isValid ? "القيد صحيح ومثبت!" : "تنبيه بيداغوجي حول القيد"}
              </h4>
              <p className="text-xs text-theme-secondary leading-relaxed">
                {validation.feedback_ar}
              </p>
            </div>
          </div>

          {/* Detailed Error List with Remedial Hints */}
          {!validation.isValid && validation.errors.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-theme/60">
              {validation.errors.map((err, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-surface-soft border border-theme text-xs space-y-1">
                  <div className="font-semibold text-theme-text flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-error)] shrink-0" />
                    <span>{err.message_ar}</span>
                  </div>
                  {err.hint_ar && (
                    <p className="text-[11px] text-[var(--color-primary)] pr-3 leading-relaxed">
                      💡 {err.hint_ar}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collapsible Pedagogical Solution Explainer */}
      {showExpectedSolution && solution && (
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-soft border border-theme space-y-3 animate-fade-in text-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)]">
            <Sparkles className="w-4 h-4" />
            <span>الشرح والنموذج البيداغوجي المعتمد</span>
          </div>

          <p className="text-xs text-theme-secondary leading-relaxed">
            {solution.pedagogicalExplanation_ar}
          </p>

          <div className="p-3 rounded-xl bg-card border border-theme font-mono text-[11px] space-y-1">
            <div className="font-bold text-theme-text">القيد النموذجي:</div>
            {solution.expectedDebits.map((d, i) => (
              <div key={i} className="text-[var(--color-primary)]">
                مدين: حـ/{d.code} ({d.name_ar || resolveAccountName(d.code)}) بمبلغ {d.amount.toLocaleString()} دج
              </div>
            ))}
            {solution.expectedCredits.map((c, i) => (
              <div key={i} className="text-[var(--color-accent)]">
                دائن: حـ/{c.code} ({c.name_ar || resolveAccountName(c.code)}) بمبلغ {c.amount.toLocaleString()} دج
              </div>
            ))}
            {solution.expectedLabel_ar && (
              <div className="text-theme-muted italic">
                البيان: {solution.expectedLabel_ar}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
