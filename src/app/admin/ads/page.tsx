"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminFetch, useAdminSession } from "@/lib/admin/client";
import {
  Megaphone,
  Plus,
  Play,
  Pause,
  Eye,
  MousePointer,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  Target,
  BarChart3,
  FileCheck,
  Settings,
  MessageCircle,
  Video,
  Image as ImageIcon,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  RefreshCw,
  Sliders,
} from "lucide-react";
import {
  AdCampaign,
  Advertiser,
  CampaignStatus,
  AdPlacement,
  AdFormat,
} from "@/lib/ads/types";

export default function AdminAdsPage() {
  const { hasPermission } = useAdminSession();
  const canManage = hasPermission("ads.manage");

  // Active Navigation Section (10 Required Sections)
  const [activeSection, setActiveSection] = useState<
    | "overview"
    | "campaigns"
    | "advertisers"
    | "creatives"
    | "placements"
    | "targeting"
    | "schedule"
    | "analytics"
    | "reviews"
    | "settings"
  >("overview");

  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [placementFilter, setPlacementFilter] = useState<string>("all");

  // Create Campaign Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAdvertiserId, setNewAdvertiserId] = useState("");
  const [newPlacement, setNewPlacement] = useState<AdPlacement>("sidebar");
  const [newCtaType, setNewCtaType] = useState<"external_link" | "whatsapp">("whatsapp");
  const [newDestination, setNewDestination] = useState("+213550123456");
  const [newWilaya, setNewWilaya] = useState("31");
  const [newStream, setNewStream] = useState("sciences_exp");
  const [newGrade, setNewGrade] = useState("3AS");
  const [isEducationalClaim, setIsEducationalClaim] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Verification modal for Advertisers
  const [verifyingAdvId, setVerifyingAdvId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/ads");
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
        setAdvertisers(data.advertisers || []);
        setOverviewStats(data.overviewStats || null);
        if (data.advertisers?.length > 0 && !newAdvertiserId) {
          setNewAdvertiserId(data.advertisers[0].id);
        }
      } else {
        setError(data.error || "تعذر جلب بيانات المنظومة الإعلانية");
      }
    } catch (err: any) {
      setError(err?.message || "خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, [newAdvertiserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Campaign Status Transition Handler (Workflow)
  const handleStatusTransition = async (campaignId: string, nextStatus: CampaignStatus) => {
    if (!canManage) return;
    try {
      const res = await adminFetch("/api/admin/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: campaignId,
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "فشل تحديث حالة الحملة الإعلانية");
      }
    } catch (err: any) {
      alert("خطأ: " + err?.message);
    }
  };

  // Advertiser Human Verification Handler
  const handleVerifyAdvertiser = async (advertiserId: string) => {
    if (!canManage) return;
    try {
      const res = await adminFetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiserId,
          notes: "تم التحقق والاعتماد يدوياً من طرف المشرف الإداري.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("تم اعتماد المعلن بنجاح.");
        fetchData();
        setVerifyingAdvId(null);
      } else {
        alert(data.error || "تعذر اعتماد المعلن");
      }
    } catch (err: any) {
      alert("خطأ: " + err?.message);
    }
  };

  // Create Campaign (Draft only by default)
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          advertiserId: newAdvertiserId,
          placement: newPlacement,
          targeting: {
            wilayas: newWilaya ? [Number(newWilaya)] : [],
            streams: [newStream],
            grades: [newGrade],
            placements: [newPlacement],
          },
          creative: {
            advertiserId: newAdvertiserId,
            format: "native",
            titleAr: newTitle,
            bodyAr: `إعلان موجه لطلاب ${newGrade} شعبة ${newStream === "sciences_exp" ? "العلوم التجريبية" : newStream}.`,
            assetUrl: "https://shater.dz/images/ads/default.webp",
            ctaType: newCtaType,
            ctaDestination: newDestination,
            ctaLabelAr: newCtaType === "whatsapp" ? "تواصل عبر واتساب 💬" : "اكتشف الدورة",
            whatsappPrefillText: `مرحباً، أرغب في الاستفسار عن ${newTitle}`,
            isEducationalClaim,
          },
          initialStatus: "draft", // Strict invariant: Always draft initially
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewTitle("");
        fetchData();
      } else {
        alert(data.error || "فشل إنشاء الحملة");
      }
    } catch (err: any) {
      alert("خطأ: " + err?.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (placementFilter !== "all" && c.placement !== placementFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. TOP HEADER & SYSTEM BANNER */}
      <div className="bg-[#0B132B] border border-indigo-500/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Megaphone className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-white">
              منظومة شاطر الإعلانية والترويجية (SHATER Ads Control Center)
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Controlled Module
            </span>
          </div>
          <p className="text-xs text-slate-300">
            إدارة ومراقبة الحملات، استهداف الشعب والولايات، تتبع نقرات واتساب، والشارة الإلزامية «إعلان».
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء حملة جديدة</span>
            </button>
          )}
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#080D1A] border border-slate-800 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. TEN SECTIONS NAVIGATION BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {[
          { key: "overview", label: "نظرة عامة (Overview)", icon: BarChart3 },
          { key: "campaigns", label: `الحملات (${campaigns.length})`, icon: Megaphone },
          { key: "advertisers", label: `المعلنون (${advertisers.length})`, icon: Building },
          { key: "creatives", label: "التصاميم (Creatives)", icon: ImageIcon },
          { key: "placements", label: "المواضع (Placements)", icon: Layers },
          { key: "targeting", label: "الاستهداف (Targeting)", icon: Target },
          { key: "schedule", label: "الجدولة (Schedule)", icon: Calendar },
          { key: "analytics", label: "التحليلات (Analytics)", icon: MousePointer },
          { key: "reviews", label: "مراجعة الادعاءات", icon: FileCheck },
          { key: "settings", label: "السياسات والأمان", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 bg-[#080D1A] hover:bg-[#131E36] border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. SECTION 1: OVERVIEW */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#0D1526] border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 block">الحملات النشطة</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {overviewStats?.campaigns.active || 0}
              </span>
            </div>
            <div className="bg-[#0D1526] border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 block">المسودات قيد الإعداد</span>
              <span className="text-xl font-black text-slate-300 font-mono">
                {overviewStats?.campaigns.draft || 0}
              </span>
            </div>
            <div className="bg-[#0D1526] border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 block">إجمالي مرات الظهور</span>
              <span className="text-xl font-black text-indigo-400 font-mono">
                {overviewStats?.performance.totalImpressions.toLocaleString("ar-DZ") || 0}
              </span>
            </div>
            <div className="bg-[#0D1526] border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 block">النقرات الكلية</span>
              <span className="text-xl font-black text-cyan-400 font-mono">
                {overviewStats?.performance.totalClicks.toLocaleString("ar-DZ") || 0}
              </span>
            </div>
            <div className="bg-[#0D1526] border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 block">نقرات واتساب 💬</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {overviewStats?.performance.totalWhatsAppClicks.toLocaleString("ar-DZ") || 0}
              </span>
            </div>
            <div className="bg-[#0D1526] border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 block">متوسط نسبة النقر (CTR)</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                %{overviewStats?.performance.avgCtrPercentage || 0}
              </span>
            </div>
          </div>

          {/* QUICK WORKFLOW CALLOUT */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>
                <strong>دورة حياة الحملة المعتمدة:</strong> تبدأ الحملة كمسودة (<code className="text-indigo-300">draft</code>) ثم تنتقل للتدقيق (<code className="text-amber-300">pending_review</code>) ثم المصادقة (<code className="text-blue-300">approved</code>) وتُجدول أو تفعل مباشرة (<code className="text-emerald-300">active</code>).
              </span>
            </div>
            <button
              onClick={() => setActiveSection("campaigns")}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>استعراض جدول الحملات</span>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* 4. SECTION 2: CAMPAIGNS WORKFLOW */}
      {activeSection === "campaigns" && (
        <div className="space-y-4">
          {/* FILTERS */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0D1526] border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5"
              >
                <option value="all">كل الحالات</option>
                <option value="draft">مسودة (draft)</option>
                <option value="pending_review">بانتظار المراجعة (pending_review)</option>
                <option value="approved">معتمدة (approved)</option>
                <option value="active">نشطة (active)</option>
                <option value="paused">متوقفة مؤقتاً (paused)</option>
                <option value="ended">منتهية (ended)</option>
              </select>
              <select
                value={placementFilter}
                onChange={(e) => setPlacementFilter(e.target.value)}
                className="bg-[#0D1526] border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5"
              >
                <option value="all">كل المواضع</option>
                <option value="banner_top">بانر علوي (banner_top)</option>
                <option value="sidebar">شريط جانبي (sidebar)</option>
                <option value="feed_native">محتوى مدمج (feed_native)</option>
                <option value="between_exercises">بين التمارين (between_exercises)</option>
              </select>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              عرض {filteredCampaigns.length} من {campaigns.length} حملة
            </span>
          </div>

          {/* CAMPAIGNS TABLE */}
          <div className="bg-[#0D1526] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="p-3.5">عنوان الحملة</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5">الموضع</th>
                    <th className="p-3.5">الاستهداف</th>
                    <th className="p-3.5">الظهور</th>
                    <th className="p-3.5">النقرات</th>
                    <th className="p-3.5">واتساب</th>
                    <th className="p-3.5">CTR</th>
                    <th className="p-3.5 text-center">إجراءات المسار (Workflow)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredCampaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-white max-w-xs truncate">
                        <div className="space-y-0.5">
                          <div>{camp.title}</div>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {camp.id} • بواسطة: {camp.createdBy}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            camp.status === "active"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : camp.status === "draft"
                              ? "bg-slate-500/15 text-slate-400 border-slate-500/30"
                              : camp.status === "pending_review"
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : camp.status === "approved"
                              ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                              : camp.status === "paused"
                              ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                              : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {camp.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {camp.placement}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        <div className="text-[11px] space-y-0.5">
                          <span>
                            {camp.targeting.wilayas?.length ? `ولاية ${camp.targeting.wilayas.join(", ")}` : "وطني"}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {camp.targeting.streams?.join(", ") || "كل الشعب"}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-indigo-400">
                        {camp.analytics.impressionsCount.toLocaleString("ar-DZ")}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-cyan-400">
                        {camp.analytics.clicksCount.toLocaleString("ar-DZ")}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        {camp.analytics.whatsappClicksCount.toLocaleString("ar-DZ")}
                      </td>
                      <td className="p-3.5 font-mono text-amber-400">
                        %{camp.analytics.ctrPercentage}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {canManage && camp.status === "draft" && (
                            <button
                              onClick={() => handleStatusTransition(camp.id, "pending_review")}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold cursor-pointer"
                            >
                              إرسال للمراجعة
                            </button>
                          )}
                          {canManage && camp.status === "pending_review" && (
                            <button
                              onClick={() => handleStatusTransition(camp.id, "approved")}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold cursor-pointer"
                            >
                              مصادقة واعتماد
                            </button>
                          )}
                          {canManage && camp.status === "approved" && (
                            <button
                              onClick={() => handleStatusTransition(camp.id, "active")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold cursor-pointer"
                            >
                              تفعيل الحملة الآن
                            </button>
                          )}
                          {canManage && camp.status === "active" && (
                            <button
                              onClick={() => handleStatusTransition(camp.id, "paused")}
                              className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 cursor-pointer"
                              title="إيقاف مؤقت"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canManage && camp.status === "paused" && (
                            <button
                              onClick={() => handleStatusTransition(camp.id, "active")}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                              title="استئناف"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canManage && camp.status !== "ended" && (
                            <button
                              onClick={() => handleStatusTransition(camp.id, "ended")}
                              className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold cursor-pointer"
                            >
                              إنهاء
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCampaigns.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        لا توجد حملات إعلانية تطابق الفلتر المحدد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. SECTION 3: ADVERTISERS */}
      {activeSection === "advertisers" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>قيد الأمان البشري الصارم (Human Verification Only):</strong> يمنع منعاً باتاً على الذكاء الاصطناعي اعتماد المعلنين تلقائياً؛ يجب مصادقة المشرف البشري يدوياً بعد مراجعة الترخيص والسجل التجاري.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {advertisers.map((adv) => (
              <div
                key={adv.id}
                className="bg-[#0D1526] border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{adv.companyNameAr}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">{adv.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      adv.isVerified
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {adv.isVerified ? "معتمد وموثق ✓" : "بانتظار الاعتماد"}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-500">الولاية: </span>
                    <span>ولاية رقم {adv.wilayaCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">الهاتف: </span>
                    <span className="font-mono text-indigo-300" dir="ltr">{adv.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">البريد: </span>
                    <span className="font-mono">{adv.contactEmail}</span>
                  </div>
                </div>

                {adv.notes && (
                  <p className="text-[11px] text-slate-400 bg-black/30 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                    {adv.notes}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(adv.createdAt).toLocaleDateString("ar-DZ")}
                  </span>
                  {canManage && !adv.isVerified && (
                    <button
                      onClick={() => handleVerifyAdvertiser(adv.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      اعتماد المعلن يدوياً
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SECTION 4: CREATIVES */}
      {activeSection === "creatives" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.map((camp) => {
              const cr = camp.creative;
              return (
                <div
                  key={cr.id}
                  className="bg-[#0D1526] border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                        {cr.format === "video" ? (
                          <Video className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <ImageIcon className="w-3 h-3 text-indigo-400" />
                        )}
                        <span>{cr.format}</span>
                      </span>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-amber-400">
                        شارة «إعلان» ملزمة
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">{cr.titleAr}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{cr.bodyAr}</p>

                    {cr.isEducationalClaim && (
                      <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-300">
                        <span>يتضمن ادعاءات تعليمية تحتاج مصادقة (Claim Verification)</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">وجهة الإجراء (CTA):</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {cr.ctaType === "whatsapp" ? `واتساب (${cr.ctaDestination})` : "رابط خارجي"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs font-bold text-white flex items-center justify-center gap-1.5">
                      {cr.ctaType === "whatsapp" ? (
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ExternalLink className="w-4 h-4 text-indigo-400" />
                      )}
                      <span>{cr.ctaLabelAr}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. SECTION 5: PLACEMENTS */}
      {activeSection === "placements" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: "banner_top", title: "بانر علوي (banner_top)", desc: "يظهر أعلى الصفحة الرئيسية وبنك التمارين ودليل التوجيه.", activeCount: 2 },
            { id: "sidebar", title: "شريط جانبي (sidebar)", desc: "يظهر داخل القائمة الجانبية لديوان شاطر وبنك التمارين.", activeCount: 1 },
            { id: "feed_native", title: "محتوى مدمج (feed_native)", desc: "يظهر بطريقة أصلية غير مزعجة بين مناشير مجلس العلم.", activeCount: 1 },
            { id: "between_exercises", title: "بين التمارين (between_exercises)", desc: "يظهر كفاصل خفيف بين كل 5 تمارين محلولة.", activeCount: 1 },
            { id: "modal_interstitial", title: "نافذة منبثقة تفاعلية (modal_interstitial)", desc: "تظهر عند إنهاء دورة مراجعة أو جلسة مذاكرة كاملة.", activeCount: 0 },
            { id: "announcement_bar", title: "شريط الإعلانات العريض (announcement_bar)", desc: "شريط أفقي عريض للإعلانات والقرارات الرسمية.", activeCount: 1 },
          ].map((pl) => (
            <div key={pl.id} className="bg-[#0D1526] border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{pl.title}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  {pl.activeCount} نشط
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{pl.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* 8. SECTION 6: TARGETING */}
      {activeSection === "targeting" && (
        <div className="bg-[#0D1526] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white">محاكي ومحددات الاستهداف الأكاديمي والجغرافي</h3>
            <p className="text-xs text-slate-400">
              النظام يدعم مطابقة معايير الطالب اللحظية وفق 7 أبعاد دقيقة:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">1. الاستهداف الجغرافي (Wilaya & Commune)</span>
              <p className="text-slate-400">مطابقة ولاية إقامة الطالب وبلديته المعتمدة (مثل وهران 31، الجزائر 16).</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">2. الشعبة المعتمدة (Stream)</span>
              <p className="text-slate-400">علوم تجريبية، رياضيات، تقني رياضي، تسيير واقتصاد، آداب ولغات.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">3. المستوى والمادة (Grade & Subject)</span>
              <p className="text-slate-400">تخصيص الإعلان للمستوى (3AS بكالوريا) والمادة الحالية قيد التصفح.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">4. الصفحة وسياق الموضع (Page & Placement)</span>
              <p className="text-slate-400">عدم إظهار إعلانات مشتتة أثناء فترات الامتحانات التجريبية المغلقة.</p>
            </div>
          </div>
        </div>
      )}

      {/* 9. SECTION 7: SCHEDULE */}
      {activeSection === "schedule" && (
        <div className="bg-[#0D1526] border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">إعدادات الجدولة الزمنية وتكرار الظهور</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            يتحكم النظام بمواقيت ظهور الإعلانات بدقة متناهية لمنع الإزعاج والحفاظ على تركيز الطلاب أثناء المذاكرة:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">أيام الأسبوع (Days of Week)</span>
              <p className="text-slate-400">حصر الظهور في عطلات نهاية الأسبوع (الجمعة والسبت) أو الأيام المدرسية.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">نوافذ الساعات (Time Windows)</span>
              <p className="text-slate-400">تحديد ساعات النشاط المناسبة (مثلاً من 08:00 صباحاً إلى 22:00 ليلاً).</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">سقف التكرار (Frequency Capping)</span>
              <p className="text-slate-400">الحد الأقصى الافتراضي: 3 مرات ظهور فقط لنفس الطالب في اليوم الواحد.</p>
            </div>
          </div>
        </div>
      )}

      {/* 10. SECTION 8: ANALYTICS */}
      {activeSection === "analytics" && (
        <div className="space-y-4">
          <div className="bg-[#0D1526] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">تحليلات الأداء الإعلاني اللحظية (Ad Telemetry)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">الظهور (Impressions)</span>
                <span className="text-xl font-black text-indigo-400 font-mono">
                  {overviewStats?.performance.totalImpressions.toLocaleString("ar-DZ") || 0}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">النقرات (Clicks)</span>
                <span className="text-xl font-black text-cyan-400 font-mono">
                  {overviewStats?.performance.totalClicks.toLocaleString("ar-DZ") || 0}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">نقرات واتساب (WhatsApp)</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {overviewStats?.performance.totalWhatsAppClicks.toLocaleString("ar-DZ") || 0}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">معدل التحويل (CTR)</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  %{overviewStats?.performance.avgCtrPercentage || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. SECTION 9: REVIEWS (EDUCATIONAL CLAIMS QUEUE) */}
      {activeSection === "reviews" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300">
            <strong>طابور تدقيق الادعاءات التعليمية:</strong> أي حملة تحتوي على وعود بنتائج دراسية، نسب نجاح، أو دورات ترويجية معتمدة يجب أن تمر عبر هذا الفحص قبل التفعيل.
          </div>

          <div className="space-y-3">
            {campaigns
              .filter((c) => c.creative.isEducationalClaim)
              .map((camp) => (
                <div
                  key={camp.id}
                  className="bg-[#0D1526] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{camp.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {camp.creative.claimVerificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{camp.creative.bodyAr}</p>
                    {camp.creative.claimVerificationNotes && (
                      <span className="text-[11px] text-slate-400 block">
                        ملاحظة المفتش: {camp.creative.claimVerificationNotes}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      <span>ادعاء معتمد ومفحوص</span>
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 12. SECTION 10: SETTINGS & SAFETY */}
      {activeSection === "settings" && (
        <div className="bg-[#0D1526] border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white">سياسات الأمان الإعلاني والمعايير التربوية</h3>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="font-bold text-white block">إلزامية شارة «إعلان» (Mandatory Ad Label)</span>
                <span className="text-slate-400">تطبيق شارة إعلان واضحة على جميع التصاميم دون استثناء لحماية وعي الطلاب.</span>
              </div>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                مفعّل دائماً (إلزامي)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="font-bold text-white block">حظر اعتماد المعلنين آلياً عبر الذكاء الاصطناعي</span>
                <span className="text-slate-400">الوكيل الذكي يمكنه إعداد المسودات فقط ولا يمتلك صلاحية اعتماد المعلنين أو إطلاق الحملات.</span>
              </div>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                صارم ومحمي خادمياً
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 13. CREATE CAMPAIGN MODAL (Controlled Draft) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative text-right">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">إنشاء حملة إعلانية جديدة (مسودة)</h3>
              </div>
              <p className="text-xs text-slate-400">
                الحملة ستُنشأ في حالة المسودة (<code className="text-indigo-300">draft</code>) وتحتاج مراجعة المشرف قبل النشر.
              </p>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">عنوان الحملة:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: دورة المراجعة الشاملة لعلوم الطبيعة والحياة — وهران"
                  className="w-full bg-[#080D1A] border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المعلن المعتمد:</label>
                  <select
                    value={newAdvertiserId}
                    onChange={(e) => setNewAdvertiserId(e.target.value)}
                    className="w-full bg-[#080D1A] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {advertisers.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.companyNameAr} ({a.isVerified ? "معتمد" : "غير معتمد"})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الموضع الإعلاني:</label>
                  <select
                    value={newPlacement}
                    onChange={(e) => setNewPlacement(e.target.value as AdPlacement)}
                    className="w-full bg-[#080D1A] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="sidebar">شريط جانبي (sidebar)</option>
                    <option value="banner_top">بانر علوي (banner_top)</option>
                    <option value="feed_native">محتوى مدمج (feed_native)</option>
                    <option value="between_exercises">بين التمارين (between_exercises)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الولاية:</label>
                  <select
                    value={newWilaya}
                    onChange={(e) => setNewWilaya(e.target.value)}
                    className="w-full bg-[#080D1A] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="31">31 - وهران</option>
                    <option value="16">16 - الجزائر العاصمة</option>
                    <option value="25">25 - قسنطينة</option>
                    <option value="19">19 - سطيف</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الشعبة:</label>
                  <select
                    value={newStream}
                    onChange={(e) => setNewStream(e.target.value)}
                    className="w-full bg-[#080D1A] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="sciences_exp">علوم تجريبية</option>
                    <option value="math">رياضيات</option>
                    <option value="technique_math">تقني رياضي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المستوى:</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full bg-[#080D1A] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="3AS">3AS (بكالوريا)</option>
                    <option value="2AS">2AS ثانية ثانوي</option>
                    <option value="1AS">1AS أولى ثانوي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">نوع زر الإجراء (CTA):</label>
                  <select
                    value={newCtaType}
                    onChange={(e) => setNewCtaType(e.target.value as any)}
                    className="w-full bg-[#080D1A] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="whatsapp">مراسلة مباشرة عبر واتساب</option>
                    <option value="external_link">رابط موقع إلكتروني خارجي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {newCtaType === "whatsapp" ? "رقم واتساب (+213...):" : "الرابط المقصود:"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    dir="ltr"
                    className="w-full bg-[#080D1A] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting ? "جارِ الحفظ..." : "حفظ كمسودة (Save Draft)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
