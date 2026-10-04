"use client";

import React, { useEffect, useState, useMemo } from "react";
import { opsFetch } from "@/lib/operations/client-api";
import { RecentVisitorActivityItem, formatDwellDuration } from "@/lib/operations/visitors-analytics";
import {
  X,
  User,
  UserCheck,
  Compass,
  Clock,
  Calendar,
  Layers,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Share2,
  ExternalLink,
  Phone,
  Mail,
  GraduationCap,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  Activity,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  visitor: RecentVisitorActivityItem | null;
}

interface DossierData {
  identity: {
    displayName: string;
    isRegistered: boolean;
    userId?: string | null;
    visitorId?: string | null;
    sessionId?: string | null;
    profile?: {
      fullName?: string;
      firstName?: string;
      lastName?: string;
      studentPhone?: string;
      parentPhone?: string;
      email?: string;
      wilayaCode?: string;
      wilayaName?: string;
      communeName?: string;
      schoolName?: string;
      streamId?: string;
      plan?: string;
      accessStatus?: string;
      createdAt?: string;
      targetScore?: number;
    } | null;
    orders?: Array<{
      id: string;
      status: string;
      plan: string;
      amount_dzd: number;
      payment_method?: string;
      submitted_at?: string;
      reviewed_at?: string;
      created_at: string;
    }>;
    device: {
      type: string;
      browser?: string;
      os?: string;
    };
    attribution: {
      source?: string;
      channel?: string;
      campaign?: string;
      referrer?: string;
      landingPage?: string;
    };
    firstSeenAt?: string;
    lastSeenAt?: string;
    totalSessions: number;
    totalEvents: number;
    totalDurationSeconds: number;
    formattedTotalDuration: string;
  };
  timeline: Array<{
    id: string;
    eventName: string;
    page: string;
    occurredAt: string;
    enteredAt?: string;
    exitedAt?: string;
    durationSeconds?: number;
    formattedDuration?: string;
    metadata?: Record<string, any>;
  }>;
  pagesSummary: Array<{
    page: string;
    views: number;
    totalDurationSeconds: number;
    formattedDuration: string;
    lastVisitedAt: string;
  }>;
}

export function VisitorDossierModal({ isOpen, onClose, visitor }: Props) {
  const [data, setData] = useState<DossierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "profile" | "pages">("timeline");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen || !visitor) {
      setData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    async function loadDossier() {
      try {
        const params = new URLSearchParams();
        if (visitor?.userId) params.set("userId", visitor.userId);
        if (visitor?.visitorId) params.set("visitorId", visitor.visitorId);
        if (visitor?.sessionId) params.set("sessionId", visitor.sessionId);
        if (visitor?.id) params.set("id", visitor.id);

        const res = await opsFetch(`/api/ops/analytics/visitors/dossier?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`خطأ في الخادم: ${res.status}`);
        }
        const json = await res.json();
        if (isMounted) {
          if (json.success) {
            setData(json);
          } else {
            setError(json.error || "تعذر تحميل ملف الزائر");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "فشل الاتصال بالخادم");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDossier();

    return () => {
      isMounted = false;
    };
  }, [isOpen, visitor]);

  const filteredTimeline = useMemo(() => {
    if (!data?.timeline) return [];
    if (!searchQuery.trim()) return data.timeline;
    const q = searchQuery.toLowerCase().trim();
    return data.timeline.filter(
      (item) =>
        item.page.toLowerCase().includes(q) ||
        item.eventName.toLowerCase().includes(q) ||
        (item.metadata && JSON.stringify(item.metadata).toLowerCase().includes(q))
    );
  }, [data?.timeline, searchQuery]);

  if (!isOpen) return null;

  function formatDateTime(isoString?: string) {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return `${d.toLocaleDateString("fr-DZ")} الساعة ${d.toLocaleTimeString("fr-DZ", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}`;
    } catch {
      return isoString;
    }
  }

  function formatClock(isoString?: string) {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return null;
    }
  }

  const isReg = Boolean(data?.identity?.isRegistered || visitor?.isRegistered);
  const displayName = data?.identity?.displayName || visitor?.displayName || "طالب زائر";
  const profile = data?.identity?.profile || visitor?.studentProfile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-200"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isReg
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
              }`}
            >
              {isReg ? <GraduationCap className="w-6 h-6" /> : <Compass className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">{displayName}</h2>
                {isReg ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    <UserCheck className="w-3 h-3" />
                    <span>طالب مسجل</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    <Compass className="w-3 h-3" />
                    <span>زائر غير مسجل (ضيف)</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono flex-wrap">
                {profile?.wilayaCode && (
                  <span className="flex items-center gap-1 text-slate-300 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>ولاية {profile.wilayaCode} {profile.wilayaName ? `(${profile.wilayaName})` : ""}</span>
                  </span>
                )}
                {data?.identity?.visitorId && (
                  <span className="text-[11px] text-slate-500">
                    ID: {data.identity.visitorId.length > 20 ? `${data.identity.visitorId.slice(0, 16)}…` : data.identity.visitorId}
                  </span>
                )}
                {data?.identity?.device && (
                  <span className="text-[11px] text-slate-400">
                    {data.identity.device.type} ({data.identity.device.os} • {data.identity.device.browser})
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Highlights KPI Bar */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-950/30 border-b border-slate-800/80 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>إجمالي وقت البقاء</span>
              </div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">
                {data.identity.formattedTotalDuration || "—"}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3 text-indigo-400" />
                <span>عدد الصفحات المزارة</span>
              </div>
              <div className="text-sm font-bold text-indigo-300 mt-0.5">
                {data.pagesSummary.length} صفحة
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-400" />
                <span>عدد الجلسات</span>
              </div>
              <div className="text-sm font-bold text-emerald-300 mt-0.5">
                {data.identity.totalSessions} جلسة
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Share2 className="w-3 h-3 text-amber-400" />
                <span>مصدر الزيارة الأولى</span>
              </div>
              <div className="text-sm font-bold text-amber-300 mt-0.5 truncate">
                {data.identity.attribution?.channel || data.identity.attribution?.source || "مباشر"}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "timeline"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>سجل الاستخدامات والصفحات ({data?.timeline?.length || 0})</span>
          </button>

          {isReg && (
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>معلومات الحساب والتسجيل</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("pages")}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "pages"
                ? "border-purple-400 text-purple-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ملخص الصفحات المزارة ({data?.pagesSummary?.length || 0})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <div className="text-xs font-semibold">جاري جمع بيانات واستخدامات هذا الزائر...</div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : !data ? null : (
            <>
              {/* TAB 1: TIMELINE OF ALL PAGE VISITS & USAGES */}
              {activeTab === "timeline" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث في الصفحات أو الأحداث..."
                        className="w-full pr-8 pl-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {filteredTimeline.length} حدث مسجل
                    </span>
                  </div>

                  {filteredTimeline.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      لا توجد سجلات صفحات أو أحداث تطابق البحث
                    </div>
                  ) : (
                    <div className="space-y-2 font-sans">
                      {filteredTimeline.map((item, idx) => {
                        const entryClock = formatClock(item.enteredAt);
                        const exitClock = formatClock(item.exitedAt);
                        const durText = item.formattedDuration || (typeof item.durationSeconds === "number" ? formatDwellDuration(item.durationSeconds) : null);

                        return (
                          <div
                            key={item.id || idx}
                            className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-cyan-300 font-semibold truncate max-w-md block" dir="ltr">
                                  {item.page}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                                  {item.eventName}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono flex-wrap" dir="ltr">
                                {entryClock && (
                                  <span className="text-emerald-400 font-medium">
                                    دخول: {entryClock}
                                  </span>
                                )}
                                {exitClock && (
                                  <span className="text-slate-300">
                                    خروج: {exitClock}
                                  </span>
                                )}
                                <span className="text-slate-500 font-sans">
                                  {formatDateTime(item.occurredAt)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                              {durText && durText !== "—" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-800/50">
                                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>{durText}</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-500 font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                                  &lt; 1ث
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: REGISTERED STUDENT PROFILE DETAILS */}
              {activeTab === "profile" && profile && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <span>بيانات الطالب الأكاديمية والاتصال</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <div className="text-[10px] text-slate-500">الاسم واللقب</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {profile.fullName || `${profile.firstName || ""} ${profile.lastName || ""}` || (profile.email ? profile.email.split("@")[0] : "") || "—"}
                        </div>
                      </div>

                      {profile.email && (
                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <div className="text-[10px] text-slate-500">البريد الإلكتروني</div>
                          <div className="text-xs font-bold text-cyan-300 mt-1 font-mono truncate" dir="ltr">
                            {profile.email}
                          </div>
                        </div>
                      )}

                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <div className="text-[10px] text-slate-500">الولاية والبلدية</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {profile.wilayaCode ? `ولاية ${profile.wilayaCode}` : ""} {profile.wilayaName ? `(${profile.wilayaName})` : ""} {profile.communeName ? `- ${profile.communeName}` : ""}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <div className="text-[10px] text-slate-500">الشعبة الدراسية</div>
                        <div className="text-sm font-bold text-cyan-300 mt-0.5 font-mono">
                          {profile.streamId || "sciences_exp"}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <div className="text-[10px] text-slate-500">رقم هاتف الطالب</div>
                        <div className="text-sm font-bold text-white mt-0.5 font-mono" dir="ltr">
                          {profile.studentPhone || "—"}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <div className="text-[10px] text-slate-500">رقم هاتف الولي</div>
                        <div className="text-sm font-bold text-white mt-0.5 font-mono" dir="ltr">
                          {profile.parentPhone || "—"}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <div className="text-[10px] text-slate-500">حالة الاشتراك / الخطة</div>
                        <div className="text-sm font-bold text-emerald-400 mt-0.5 font-mono">
                          {profile.accessStatus || "TRIAL"} ({profile.plan || "season"})
                        </div>
                      </div>

                      {profile.schoolName && (
                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 sm:col-span-2">
                          <div className="text-[10px] text-slate-500">المؤسسة / الثانوية</div>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {profile.schoolName}
                          </div>
                        </div>
                      )}

                      {profile.targetScore && (
                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <div className="text-[10px] text-slate-500">المعدل المستهدف</div>
                          <div className="text-sm font-bold text-amber-300 mt-0.5 font-mono">
                            {profile.targetScore} / 20
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment orders if any */}
                  {data.identity.orders && data.identity.orders.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-indigo-400" />
                        <span>سجل طلبات الدفع والاشتراك ({data.identity.orders.length})</span>
                      </h4>

                      <div className="space-y-1.5">
                        {data.identity.orders.map((ord) => (
                          <div
                            key={ord.id}
                            className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs font-mono"
                          >
                            <div>
                              <span className="text-white font-bold">{ord.plan}</span>
                              <span className="text-slate-500 text-[11px] mr-2">
                                ({ord.amount_dzd} دج)
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ord.status === "APPROVED"
                                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                                    : ord.status === "PENDING"
                                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                                    : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                                }`}
                              >
                                {ord.status}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(ord.created_at).toLocaleDateString("fr-DZ")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PAGES SUMMARY RANKING */}
              {activeTab === "pages" && (
                <div className="space-y-2 font-mono">
                  {data.pagesSummary.map((pg, idx) => (
                    <div
                      key={pg.page || idx}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="truncate max-w-md">
                        <span className="text-cyan-300 font-semibold block truncate" dir="ltr">
                          {pg.page}
                        </span>
                        <span className="text-[10px] text-slate-500 font-sans">
                          آخر زيارة: {formatDateTime(pg.lastVisitedAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-slate-300 font-bold">{pg.views} زيارة</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-bold text-[11px]">
                          {pg.formattedDuration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
