"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  School,
  MapPin,
  Building,
  Check,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ChevronDown,
  Clock,
} from "lucide-react";
import { HighSchool } from "@/types/school";
import {
  ALGERIAN_WILAYAS,
  getCommunesByWilayaCode,
  Wilaya,
  Commune,
} from "@/domain/administrative/algeria-administrative";

export interface HighSchoolSelection {
  schoolId?: string;
  schoolName: string;
  wilayaCode: string;
  wilayaNameAr: string;
  communeNameAr: string;
  communeCode?: string;
  isCustom?: boolean;
}

interface HighSchoolSelectorProps {
  initialWilayaCode?: string;
  initialCommuneNameAr?: string;
  initialCommuneCode?: string;
  initialSchoolName?: string;
  initialSchoolId?: string;
  onChange: (selection: HighSchoolSelection | null) => void;
  /** Callback for parent components tracking wilaya/commune changes directly */
  onLocationChange?: (wilaya: { code: string; name_ar: string }, commune: { code: string; name_ar: string } | null) => void;
  className?: string;
}

export const HighSchoolSelector: React.FC<HighSchoolSelectorProps> = ({
  initialWilayaCode = "",
  initialCommuneNameAr = "",
  initialCommuneCode = "",
  initialSchoolName = "",
  initialSchoolId = "",
  onChange,
  onLocationChange,
  className = "",
}) => {
  // State: Wilaya and Commune
  const [wilayaCode, setWilayaCode] = useState<string>(initialWilayaCode);
  const [communeNameAr, setCommuneNameAr] = useState<string>(initialCommuneNameAr);
  const [communeCode, setCommuneCode] = useState<string>(initialCommuneCode);

  // Available communes for chosen wilaya (up to all communes in that wilaya)
  const availableCommunes: Commune[] = wilayaCode
    ? getCommunesByWilayaCode(wilayaCode)
    : [];

  const selectedWilaya: Wilaya | undefined = ALGERIAN_WILAYAS.find(
    (w) => w.code === wilayaCode
  );

  // State: High School list for chosen commune
  const [schools, setSchools] = useState<HighSchool[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState<boolean>(false);

  // Selected High School (by ID or custom submission)
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(initialSchoolId || "");
  const [customSchoolName, setCustomSchoolName] = useState<string>(
    initialSchoolName && !initialSchoolId ? initialSchoolName : ""
  );
  const [isCustomSelected, setIsCustomSelected] = useState<boolean>(
    Boolean(initialSchoolName && !initialSchoolId)
  );

  // Unlisted School ("ما لقيتش ثانويتي؟ أضفها") Submission Form State
  const [showSubmissionForm, setShowSubmissionForm] = useState<boolean>(
    Boolean(initialSchoolName && !initialSchoolId)
  );
  const [proposedSchoolName, setProposedSchoolName] = useState<string>(
    initialSchoolName && !initialSchoolId ? initialSchoolName : ""
  );
  const [isSubmittingSchool, setIsSubmittingSchool] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: "success" | "warning" | "info" | "error";
    message: string;
  } | null>(null);

  // Fetch schools when wilaya or commune changes
  useEffect(() => {
    if (!wilayaCode || !communeNameAr) {
      setSchools([]);
      return;
    }

    let isMounted = true;
    setIsLoadingSchools(true);

    const fetchSchools = async () => {
      try {
        const queryParams = new URLSearchParams({
          wilaya_code: wilayaCode,
          commune_name_ar: communeNameAr,
          limit: "50",
        });

        const res = await fetch(`/api/schools/search?${queryParams.toString()}`);
        const data = await res.json();

        if (isMounted) {
          if (data.success && Array.isArray(data.schools)) {
            setSchools(data.schools);
          } else {
            setSchools([]);
          }
        }
      } catch (err) {
        console.error("Failed to query schools for commune:", err);
        if (isMounted) setSchools([]);
      } finally {
        if (isMounted) setIsLoadingSchools(false);
      }
    };

    fetchSchools();

    return () => {
      isMounted = false;
    };
  }, [wilayaCode, communeNameAr]);

  // Handle Wilaya change (Resets Commune & High School)
  const handleWilayaSelect = (code: string) => {
    setWilayaCode(code);
    setCommuneNameAr("");
    setCommuneCode("");
    setSelectedSchoolId("");
    setCustomSchoolName("");
    setIsCustomSelected(false);
    setShowSubmissionForm(false);
    setSubmissionFeedback(null);

    const w = ALGERIAN_WILAYAS.find((item) => item.code === code);
    if (onLocationChange && w) {
      onLocationChange(w, null);
    }
    onChange(null);
  };

  // Handle Commune change (Resets High School)
  const handleCommuneSelect = (selectedCommuneName: string) => {
    setCommuneNameAr(selectedCommuneName);
    setSelectedSchoolId("");
    setCustomSchoolName("");
    setIsCustomSelected(false);
    setShowSubmissionForm(false);
    setSubmissionFeedback(null);

    const foundCommune = availableCommunes.find((c) => c.name_ar === selectedCommuneName);
    const code = foundCommune ? foundCommune.code : "";
    setCommuneCode(code);

    if (onLocationChange && selectedWilaya) {
      onLocationChange(
        selectedWilaya,
        foundCommune ? { code: foundCommune.code, name_ar: foundCommune.name_ar } : null
      );
    }
    onChange(null);
  };

  // Handle High School dropdown selection
  const handleSchoolDropdownChange = (value: string) => {
    setSubmissionFeedback(null);

    if (value === "__unlisted__") {
      // User picked "Add unlisted school" from dropdown
      setIsCustomSelected(true);
      setSelectedSchoolId("");
      setShowSubmissionForm(true);
      if (customSchoolName) {
        onChange({
          schoolName: customSchoolName,
          wilayaCode,
          wilayaNameAr: selectedWilaya?.name_ar || "",
          communeNameAr,
          communeCode,
          isCustom: true,
        });
      } else {
        onChange(null);
      }
      return;
    }

    if (!value) {
      // Empty selection
      setSelectedSchoolId("");
      setIsCustomSelected(false);
      setShowSubmissionForm(false);
      onChange(null);
      return;
    }

    // Official school selected
    const school = schools.find((s) => s.id === value);
    if (school) {
      setSelectedSchoolId(school.id);
      setIsCustomSelected(false);
      setShowSubmissionForm(false);
      setCustomSchoolName("");

      onChange({
        schoolId: school.id,
        schoolName: school.name,
        wilayaCode: school.wilaya_code,
        wilayaNameAr: school.wilaya_name_ar,
        communeNameAr: school.commune_name_ar,
        communeCode,
        isCustom: false,
      });
    }
  };

  // Handle submitting unlisted school proposal
  const handleSubmitUnlistedSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = proposedSchoolName.trim();
    if (!raw || raw.length < 3) {
      setSubmissionFeedback({
        type: "error",
        message: "يرجى كتابة اسم الثانوية كاملاً (3 أحرف على الأقل).",
      });
      return;
    }

    if (!wilayaCode || !communeNameAr) {
      setSubmissionFeedback({
        type: "error",
        message: "يرجى اختيار الولاية والبلدية أولاً.",
      });
      return;
    }

    setIsSubmittingSchool(true);
    setSubmissionFeedback(null);

    try {
      const res = await fetch("/api/schools/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposed_name: raw,
          wilaya_code: wilayaCode,
          wilaya_name_ar: selectedWilaya?.name_ar || "",
          commune_name_ar: communeNameAr,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmissionFeedback({
          type: "success",
          message: data.message || "تم إرسال طلب إضافة الثانوية بنجاح. سيتم التحقق منها قبل اعتمادها.",
        });

        setCustomSchoolName(raw);
        setIsCustomSelected(true);
        setSelectedSchoolId("");

        onChange({
          schoolName: raw,
          wilayaCode,
          wilayaNameAr: selectedWilaya?.name_ar || "",
          communeNameAr,
          communeCode,
          isCustom: true,
        });
      } else {
        const errMsg = data.error || "تعذر إرسال طلب إضافة الثانوية.";

        if (errMsg.includes("الثانوية موجودة بالفعل")) {
          setSubmissionFeedback({
            type: "warning",
            message: "الثانوية موجودة بالفعل، ابحث عنها في القائمة.",
          });
        } else if (errMsg.includes("قيد المراجعة")) {
          setSubmissionFeedback({
            type: "info",
            message: "هذه الثانوية قيد المراجعة حالياً.",
          });
          setCustomSchoolName(raw);
          setIsCustomSelected(true);
          setSelectedSchoolId("");

          onChange({
            schoolName: raw,
            wilayaCode,
            wilayaNameAr: selectedWilaya?.name_ar || "",
            communeNameAr,
            communeCode,
            isCustom: true,
          });
        } else {
          setSubmissionFeedback({
            type: "error",
            message: errMsg,
          });
        }
      }
    } catch (err: any) {
      setSubmissionFeedback({
        type: "error",
        message: err.message || "حدث خطأ غير متوقع أثناء إرسال الطلب.",
      });
    } finally {
      setIsSubmittingSchool(false);
    }
  };

  const selectedSchoolObj = schools.find((s) => s.id === selectedSchoolId);

  return (
    <div className={`space-y-4 text-right rtl:text-right ${className}`} dir="rtl">
      {/* ------------------------------------------------------------- */}
      {/* 1. WILAYA DROPDOWN (01 to 69)                                 */}
      {/* ------------------------------------------------------------- */}
      <div>
        <label className="block text-xs font-bold text-theme-muted mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-electric" />
            <span>1. الولاية *</span>
          </span>
          <span className="text-[10px] text-theme-muted font-normal">
            (69 ولاية جزائرية)
          </span>
        </label>
        <div className="relative">
          <select
            value={wilayaCode}
            onChange={(e) => handleWilayaSelect(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-canvas border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm font-medium text-theme-base appearance-none pr-10"
          >
            <option value="">— اختر الولاية —</option>
            {ALGERIAN_WILAYAS.map((w) => (
              <option key={w.code} value={w.code}>
                {w.code} — {w.name_ar} ({w.name_fr})
              </option>
            ))}
          </select>
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-theme-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. COMMUNE DROPDOWN (Dependent on chosen Wilaya)              */}
      {/* ------------------------------------------------------------- */}
      <div>
        <label className="block text-xs font-bold text-theme-muted mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            <span>2. البلدية *</span>
          </span>
          {availableCommunes.length > 0 && (
            <span className="text-[10px] text-cyan-400 font-normal">
              ({availableCommunes.length} بلدية متوفرة)
            </span>
          )}
        </label>
        <div className="relative">
          <select
            value={communeNameAr}
            onChange={(e) => handleCommuneSelect(e.target.value)}
            disabled={!wilayaCode || availableCommunes.length === 0}
            className="w-full px-4 py-3 rounded-xl bg-canvas border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm font-medium text-theme-base appearance-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {!wilayaCode
                ? "— اختر الولاية أولاً لتظهر بلدياتها —"
                : "— اختر بلدية الإقامة أو الدراسة —"}
            </option>
            {availableCommunes.map((c) => (
              <option key={c.code} value={c.name_ar}>
                {c.name_ar} {c.name_fr ? `(${c.name_fr})` : ""}
              </option>
            ))}
          </select>
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-theme-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. HIGH SCHOOL DROPDOWN (قائمة منسدلة للثانويات)               */}
      {/* ------------------------------------------------------------- */}
      <div>
        <label className="block text-xs font-bold text-theme-muted mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. الثانوية (قائمة منسدلة) *</span>
          </span>
          {selectedSchoolObj && (
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> معتمدة رسمياً
            </span>
          )}
          {isCustomSelected && customSchoolName && (
            <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> قيد التحقق
            </span>
          )}
        </label>

        <div className="relative">
          <select
            value={
              isCustomSelected
                ? "__unlisted__"
                : selectedSchoolId || ""
            }
            onChange={(e) => handleSchoolDropdownChange(e.target.value)}
            disabled={!wilayaCode || !communeNameAr || isLoadingSchools}
            className="w-full px-4 py-3 rounded-xl bg-canvas border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm font-medium text-theme-base appearance-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Default Placeholder */}
            <option value="">
              {!wilayaCode || !communeNameAr
                ? "— اختر الولاية والبلدية أولاً لتظهر الثانويات —"
                : isLoadingSchools
                ? "جاري تحميل ثانويات البلدية..."
                : schools.length === 0
                ? "— لا توجد ثانويات معتمدة مسجلة في هذه البلدية —"
                : "— اختر ثانويتك من القائمة المنسدلة —"}
            </option>

            {/* Verified Schools in Chosen Commune */}
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.name_fr ? `— ${s.name_fr}` : ""} (معتمدة)
              </option>
            ))}

            {/* Custom/Unlisted school proposal option */}
            {wilayaCode && communeNameAr && (
              <option value="__unlisted__">
                {customSchoolName
                  ? `➕ ${customSchoolName} (ثانوية مقترحة - قيد المراجعة)`
                  : "➕ ما لقيتش ثانويتي؟ أضفها (اقتراح ثانوية جديدة)..."}
              </option>
            )}
          </select>

          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-theme-muted">
            {isLoadingSchools ? (
              <Loader2 className="w-4 h-4 animate-spin text-electric" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Quick Toggle for Unlisted School if not already open */}
        {wilayaCode && communeNameAr && !showSubmissionForm && (
          <div className="mt-1.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setShowSubmissionForm(true);
                setIsCustomSelected(true);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-theme-muted hover:text-electric transition"
            >
              <Plus className="w-3 h-3" />
              <span>ما لقيتش ثانويتك في القائمة المنسدلة؟ اضغط هنا لإضافتها</span>
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. UNLISTED PROPOSAL FORM (Opens when requested)              */}
      {/* ------------------------------------------------------------- */}
      {showSubmissionForm && wilayaCode && communeNameAr && (
        <div className="p-4 rounded-xl bg-canvas/80 border border-theme-border/90 shadow-inner space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-theme-base flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-electric" />
              <span>إضافة ثانوية جديدة في بلدية {communeNameAr}</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setShowSubmissionForm(false);
                if (!customSchoolName) {
                  setIsCustomSelected(false);
                }
              }}
              className="text-[11px] text-theme-muted hover:text-white"
            >
              إغلاق
            </button>
          </div>

          <p className="text-[11px] text-theme-muted leading-relaxed">
            اكتب الاسم الرسمي للثانوية بدقة. سيتم حفظها في ملفك وإرسالها لفريق العمليات لاعتمادها رسمياً.
          </p>

          <form onSubmit={handleSubmitUnlistedSchool} className="space-y-3">
            <div>
              <input
                type="text"
                value={proposedSchoolName}
                onChange={(e) => {
                  setProposedSchoolName(e.target.value);
                  if (submissionFeedback) setSubmissionFeedback(null);
                }}
                placeholder="مثال: ثانوية العقيد لطفي أو Lycée Colonel Lotfi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm text-theme-base"
              />
            </div>

            {/* Feedback Alerts */}
            {submissionFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 animate-fadeIn ${
                  submissionFeedback.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : submissionFeedback.type === "warning"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : submissionFeedback.type === "info"
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                    : "bg-red-500/10 border-red-500/30 text-red-300"
                }`}
              >
                {submissionFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{submissionFeedback.message}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="submit"
                disabled={isSubmittingSchool || proposedSchoolName.trim().length < 3}
                className="px-4 py-2 rounded-xl bg-electric hover:bg-electric/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-electric/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingSchool ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التحقق والإرسال...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>إرسال للمراجعة واعتمادها في ملفي</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
