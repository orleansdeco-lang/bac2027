"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  School,
  MapPin,
  Search,
  Check,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ChevronDown,
  Building,
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
  isCustom?: boolean;
}

interface HighSchoolSelectorProps {
  initialWilayaCode?: string;
  initialCommuneNameAr?: string;
  initialSchoolName?: string;
  initialSchoolId?: string;
  onChange: (selection: HighSchoolSelection | null) => void;
  /** When true, only shows Step 3 (School search & add) assuming Wilaya & Commune are controlled externally */
  compactSchoolOnly?: boolean;
  controlledWilayaCode?: string;
  controlledCommuneNameAr?: string;
  className?: string;
}

export const HighSchoolSelector: React.FC<HighSchoolSelectorProps> = ({
  initialWilayaCode = "",
  initialCommuneNameAr = "",
  initialSchoolName = "",
  initialSchoolId = "",
  onChange,
  compactSchoolOnly = false,
  controlledWilayaCode,
  controlledCommuneNameAr,
  className = "",
}) => {
  // Wilaya and Commune selection state
  const [wilayaCode, setWilayaCode] = useState<string>(
    controlledWilayaCode ?? initialWilayaCode
  );
  const [communeNameAr, setCommuneNameAr] = useState<string>(
    controlledCommuneNameAr ?? initialCommuneNameAr
  );

  // Sync with controlled props if provided
  useEffect(() => {
    if (controlledWilayaCode !== undefined && controlledWilayaCode !== wilayaCode) {
      setWilayaCode(controlledWilayaCode);
      // Changing wilaya clears school selection
      setSelectedSchool(null);
      setSearchQuery("");
      setShowSubmissionForm(false);
      setSubmissionFeedback(null);
    }
  }, [controlledWilayaCode]);

  useEffect(() => {
    if (controlledCommuneNameAr !== undefined && controlledCommuneNameAr !== communeNameAr) {
      setCommuneNameAr(controlledCommuneNameAr);
      setSelectedSchool(null);
      setSearchQuery("");
      setShowSubmissionForm(false);
      setSubmissionFeedback(null);
    }
  }, [controlledCommuneNameAr]);

  // Available Communes
  const availableCommunes: Commune[] = wilayaCode
    ? getCommunesByWilayaCode(wilayaCode)
    : [];

  const selectedWilaya: Wilaya | undefined = ALGERIAN_WILAYAS.find(
    (w) => w.code === wilayaCode
  );

  // School Search & Options
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [schools, setSchools] = useState<HighSchool[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Selected High School State
  const [selectedSchool, setSelectedSchool] = useState<HighSchoolSelection | null>(
    initialSchoolName
      ? {
          schoolId: initialSchoolId || undefined,
          schoolName: initialSchoolName,
          wilayaCode: initialWilayaCode,
          wilayaNameAr: selectedWilaya?.name_ar || "",
          communeNameAr: initialCommuneNameAr,
          isCustom: !initialSchoolId,
        }
      : null
  );

  // Unlisted School ("ما لقيتش ثانويتي؟ أضفها") Form State
  const [showSubmissionForm, setShowSubmissionForm] = useState<boolean>(false);
  const [proposedSchoolName, setProposedSchoolName] = useState<string>("");
  const [isSubmittingSchool, setIsSubmittingSchool] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: "success" | "warning" | "info" | "error";
    message: string;
    existingSchool?: HighSchool;
  } | null>(null);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch schools when wilaya, commune, or search query changes (debounced 250ms)
  useEffect(() => {
    if (!wilayaCode || !communeNameAr) {
      setSchools([]);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(async () => {
      setIsLoadingSchools(true);
      try {
        const queryParams = new URLSearchParams({
          wilaya_code: wilayaCode,
          commune_name_ar: communeNameAr,
          limit: "25",
        });
        if (searchQuery.trim()) {
          queryParams.set("q", searchQuery.trim());
        }

        const res = await fetch(`/api/schools/search?${queryParams.toString()}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.schools)) {
          setSchools(data.schools);
        } else {
          setSchools([]);
        }
      } catch (err) {
        console.error("Failed to query schools:", err);
        setSchools([]);
      } finally {
        setIsLoadingSchools(false);
      }
    }, 250);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [wilayaCode, communeNameAr, searchQuery]);

  // Handle Wilaya change
  const handleWilayaSelect = (code: string) => {
    setWilayaCode(code);
    setCommuneNameAr("");
    setSelectedSchool(null);
    setSearchQuery("");
    setShowSubmissionForm(false);
    setSubmissionFeedback(null);
    onChange(null);
  };

  // Handle Commune change
  const handleCommuneSelect = (cNameAr: string) => {
    setCommuneNameAr(cNameAr);
    setSelectedSchool(null);
    setSearchQuery("");
    setShowSubmissionForm(false);
    setSubmissionFeedback(null);
    onChange(null);
  };

  // Handle selecting an official school from list
  const handleSelectOfficialSchool = (school: HighSchool) => {
    const selection: HighSchoolSelection = {
      schoolId: school.id,
      schoolName: school.name,
      wilayaCode: school.wilaya_code,
      wilayaNameAr: school.wilaya_name_ar,
      communeNameAr: school.commune_name_ar,
      isCustom: false,
    };
    setSelectedSchool(selection);
    setIsDropdownOpen(false);
    setShowSubmissionForm(false);
    setSubmissionFeedback(null);
    onChange(selection);
  };

  // Handle submitting an unlisted school
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
        // Success feedback
        setSubmissionFeedback({
          type: "success",
          message: data.message || "تم إرسال طلب إضافة الثانوية بنجاح. سيتم التحقق منها قبل اعتمادها.",
        });

        // Set as active selection (custom/pending)
        const customSelection: HighSchoolSelection = {
          schoolName: raw,
          wilayaCode,
          wilayaNameAr: selectedWilaya?.name_ar || "",
          communeNameAr,
          isCustom: true,
        };
        setSelectedSchool(customSelection);
        onChange(customSelection);
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
          // Also set selection so the student isn't blocked
          const pendingSelection: HighSchoolSelection = {
            schoolName: raw,
            wilayaCode,
            wilayaNameAr: selectedWilaya?.name_ar || "",
            communeNameAr,
            isCustom: true,
          };
          setSelectedSchool(pendingSelection);
          onChange(pendingSelection);
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

  return (
    <div className={`space-y-4 text-right rtl:text-right ${className}`} dir="rtl">
      {/* ------------------------------------------------------------- */}
      {/* STEPS 1 & 2: WILAYA & COMMUNE DROPDOWNS (If not compact mode) */}
      {/* ------------------------------------------------------------- */}
      {!compactSchoolOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Step 1: Wilaya */}
          <div>
            <label className="block text-xs font-bold text-theme-muted mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-electric" />
              <span>الخطوة 1 — الولاية *</span>
            </label>
            <div className="relative">
              <select
                value={wilayaCode}
                onChange={(e) => handleWilayaSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm font-medium text-theme-base appearance-none pr-9"
              >
                <option value="">— اختر الولاية (01 إلى 58) —</option>
                {ALGERIAN_WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} — {w.name_ar} ({w.name_fr})
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-theme-muted">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Step 2: Commune */}
          <div>
            <label className="block text-xs font-bold text-theme-muted mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              <span>الخطوة 2 — البلدية *</span>
            </label>
            <div className="relative">
              <select
                value={communeNameAr}
                onChange={(e) => handleCommuneSelect(e.target.value)}
                disabled={!wilayaCode || availableCommunes.length === 0}
                className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm font-medium text-theme-base appearance-none pr-9 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!wilayaCode
                    ? "— اختر الولاية أولاً —"
                    : "— اختر بلدية الثانوية —"}
                </option>
                {availableCommunes.map((c) => (
                  <option key={c.code} value={c.name_ar}>
                    {c.name_ar} ({c.name_fr})
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-theme-muted">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 3: HIGH SCHOOL SELECTION & SEARCH                        */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-1">
        <label className="block text-xs font-bold text-theme-muted mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-emerald-400" />
            <span>الخطوة 3 — الثانوية الرسمية المعتمدة *</span>
          </span>
          {selectedSchool && (
            <span className="text-[11px] text-emerald-400 font-normal flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> تم تحديد الثانوية
            </span>
          )}
        </label>

        {/* Selected School Preview Card (if already chosen) */}
        {selectedSchool ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <School className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-theme-base">
                    {selectedSchool.schoolName}
                  </h4>
                  {selectedSchool.isCustom ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      قيد التحقق
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> معتمدة
                    </span>
                  )}
                </div>
                <p className="text-xs text-theme-muted mt-0.5">
                  {selectedSchool.communeNameAr} — ولاية {selectedSchool.wilayaNameAr}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedSchool(null);
                setSearchQuery("");
                onChange(null);
                setIsDropdownOpen(true);
              }}
              className="text-xs font-semibold text-theme-muted hover:text-white px-3 py-1.5 rounded-lg border border-theme-border hover:bg-canvas transition"
            >
              تغيير
            </button>
          </div>
        ) : (
          /* Search Input & Dropdown */
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                disabled={!wilayaCode || !communeNameAr}
                placeholder={
                  !wilayaCode || !communeNameAr
                    ? "اختر الولاية والبلدية أولاً لتظهر ثانوياتك..."
                    : "ابحث عن ثانويتك بالعربية أو الفرنسية..."
                }
                className="w-full px-4 py-3 pl-10 rounded-xl bg-canvas border border-theme-border focus:border-electric focus:ring-1 focus:ring-electric outline-none transition text-sm font-medium text-theme-base placeholder:text-theme-muted/60 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none">
                {isLoadingSchools ? (
                  <Loader2 className="w-4 h-4 animate-spin text-electric" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </div>
            </div>

            {/* Dropdown Options */}
            {isDropdownOpen && wilayaCode && communeNameAr && (
              <div className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl bg-surface border border-theme-border shadow-2xl divide-y divide-theme-border/50 animate-fadeIn">
                {isLoadingSchools ? (
                  <div className="p-4 text-center text-xs text-theme-muted flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-electric" />
                    <span>جاري البحث في الدليل المدرسي...</span>
                  </div>
                ) : schools.length > 0 ? (
                  schools.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectOfficialSchool(s)}
                      className="w-full p-3 text-right rtl:text-right hover:bg-canvas/80 flex items-center justify-between gap-2 transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-canvas text-theme-muted group-hover:text-electric flex items-center justify-center shrink-0">
                          <School className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-theme-base group-hover:text-electric transition-colors">
                            {s.name}
                          </div>
                          {s.name_fr && (
                            <div className="text-[11px] text-theme-muted font-sans">
                              {s.name_fr}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> معتمدة
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-xs text-theme-muted mb-2">
                      {searchQuery
                        ? `لم نجد ثانوية مطابقة لـ "${searchQuery}" في بلدية ${communeNameAr}.`
                        : `لا توجد ثانويات معتمدة مسجلة حالياً في بلدية ${communeNameAr}.`}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setShowSubmissionForm(true);
                        setProposedSchoolName(searchQuery);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-electric hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>أضف ثانويتك للمراجعة والاعتماد</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STEP 4: "ما لقيتش ثانويتي؟ أضفها" (UNLISTED PROPOSAL FORM)   */}
      {/* ------------------------------------------------------------- */}
      {wilayaCode && communeNameAr && !selectedSchool && (
        <div className="pt-1">
          {!showSubmissionForm ? (
            <button
              type="button"
              onClick={() => {
                setShowSubmissionForm(true);
                setProposedSchoolName(searchQuery);
                setSubmissionFeedback(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-muted hover:text-electric transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ما لقيتش ثانويتي؟ أضفها</span>
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-canvas/70 border border-theme-border/80 shadow-inner space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-theme-base flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-electric" />
                  <span>إضافة ثانوية جديدة للمراجعة</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmissionForm(false);
                    setSubmissionFeedback(null);
                  }}
                  className="text-[11px] text-theme-muted hover:text-white"
                >
                  إلغاء
                </button>
              </div>

              <p className="text-[11px] text-theme-muted leading-relaxed">
                اكتب الاسم الرسمي للثانوية في بلدية{" "}
                <span className="font-bold text-theme-base">{communeNameAr}</span>. سيتم التحقق منها
                بواسطة فريق العمليات قبل اعتمادها رسمياً.
              </p>

              <form onSubmit={handleSubmitUnlistedSchool} className="space-y-3">
                <div className="relative">
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
                        <span>إرسال للمراجعة</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
