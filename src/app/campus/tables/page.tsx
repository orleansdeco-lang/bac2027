"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Filter,
  Sparkles,
  Target,
  Brain,
  Zap,
  Clock,
  Share2,
  ChevronLeft,
  CheckCircle,
  Eye,
  Check,
} from "lucide-react";
import { MajlisTable, MajlisActivityMode } from "@/types/campus";
import { StreamId } from "@/types/education";
import { CampusService } from "@/lib/campus/campus-service";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { useAuth } from "@/lib/auth/context";
import { useLearningAccessGate } from "@/lib/hooks";
import { AppShell } from "@/components/ui/AppShell";
import { CampusAccessGate } from "@/components/campus/CampusAccessGate";
import { CreateTableModal } from "@/components/campus/CreateTableModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const STREAM_FILTERS = [
  { id: "ALL", label: "جميع الشعب" },
  { id: "sciences_exp", label: "علوم تجريبية" },
  { id: "math", label: "رياضيات" },
  { id: "technique_math", label: "تقني رياضي" },
  { id: "lettres_philo", label: "آداب وفلسفة" },
  { id: "gestion_eco", label: "تسيير واقتصاد" },
  { id: "langues", label: "لغات أجنبية" },
];

export default function CampusTablesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const gate = useLearningAccessGate({ redirectToAuth: false });

  const studentStream: StreamId =
    gate.profile?.streamId || (gate.profile as any)?.stream || "sciences_exp";
  const studentName =
    gate.profile?.firstName || (user?.user_metadata as any)?.first_name || "طالب بكالوريا";
  const studentId = user?.id || "guest-student";

  const [tables, setTables] = useState<MajlisTable[]>([]);
  const [selectedStreamFilter, setSelectedStreamFilter] = useState<string>("ALL");
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedTableId, setCopiedTableId] = useState<string | null>(null);

  // Load tables and sync from backend
  useEffect(() => {
    setTables(CampusService.getTables());
    CampusService.fetchRemoteTables().then((syncedTables) => {
      if (syncedTables && syncedTables.length > 0) {
        setTables(syncedTables);
      }
    });
  }, []);

  // Filtered tables
  const filteredTables = tables.filter((t) => {
    if (selectedStreamFilter !== "ALL" && t.stream !== selectedStreamFilter) return false;
    if (selectedModeFilter !== "ALL" && t.mode !== selectedModeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchLesson = t.lesson.toLowerCase().includes(q);
      const matchSubject = t.subjectId.toLowerCase().includes(q);
      if (!matchTitle && !matchLesson && !matchSubject) return false;
    }
    return true;
  });

  const handleCreateTable = (params: any) => {
    const newTable = CampusService.createTable({
      ...params,
      creatorId: studentId,
      creatorName: studentName,
    });
    setTables(CampusService.getTables());
    router.push(`/campus/table/${newTable.id}`);
  };

  const handleShareInvite = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      navigator.clipboard.writeText(`${origin}/campus/table/${tableId}`);
      setCopiedTableId(tableId);
      setTimeout(() => setCopiedTableId(null), 2500);
    }
  };

  return (
    <AppShell>
      <CampusAccessGate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6" dir="rtl">
          {/* Header Banner */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-surface-elevated border border-purple-500/30 overflow-hidden shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="primary" size="md" className="font-bold">
                    مجالس العلم التفاعلية 🏛️
                  </Badge>
                  <span className="text-xs text-theme-muted">
                    شعبتك: <strong className="text-theme-text">{ALGERIAN_BAC_STREAMS[studentStream]?.name_ar}</strong>
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-theme-text font-sans">
                  طاولات المذاكرة التفاعلية ثلاثية الأبعاد
                </h1>
                <p className="text-xs sm:text-sm text-theme-muted mt-1 max-w-2xl leading-relaxed">
                  احجز مقعدك على الطاولة الدائرية، حل التمارين مع زملائك في الوقت الفعلي، وتحدى نفسك بسلالم التنقيط الوزارية.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/campus">
                  <Button variant="outline" size="md" className="gap-2">
                    <span>بنك التجارب والملخصات 📚</span>
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إنشاء طاولة جديدة</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-theme">
            {/* Stream Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {STREAM_FILTERS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStreamFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedStreamFilter === st.id
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-surface-soft border border-theme text-theme-secondary hover:text-theme-text"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-theme-muted absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن درس، مادة، تمرين..."
                className="w-full pl-3 pr-9 py-1.5 rounded-xl bg-surface-soft border border-theme text-xs text-theme-text focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTables.map((t) => {
              const streamMeta = ALGERIAN_BAC_STREAMS[t.stream];
              const isMyStream = t.stream === studentStream;
              const occupiedSeats = t.seats.filter(Boolean).length;
              const isFull = occupiedSeats >= t.capacity;

              return (
                <Card
                  key={t.id}
                  className={`p-5 rounded-3xl border transition-all hover:shadow-xl flex flex-col justify-between group ${
                    isMyStream
                      ? "border-purple-500/30 hover:border-purple-500/60 bg-surface"
                      : "border-theme bg-surface-soft/40 hover:border-theme/80 opacity-90"
                  }`}
                >
                  {/* Top Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge
                        variant="primary"
                        size="sm"
                        className={`font-bold ${
                          isMyStream ? "bg-purple-500/15 text-purple-500 border-purple-500/30" : "bg-surface-soft text-theme-muted"
                        }`}
                      >
                        {streamMeta?.name_ar || t.stream}
                      </Badge>

                      <div className="flex items-center gap-1.5 text-xs text-theme-muted">
                        <Users className="w-3.5 h-3.5 text-purple-500" />
                        <span className="font-mono font-bold text-theme-text">
                          {occupiedSeats}/{t.capacity} مقاعد
                        </span>
                      </div>
                    </div>

                    {/* Mode Tag */}
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-2">
                      {t.mode === "PAPER_PRACTICE" && (
                        <span className="text-blue-500 flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          التمارين الكتابية (حل على الكراس)
                        </span>
                      )}
                      {t.mode === "DIGITAL_QUIZ" && (
                        <span className="text-purple-500 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" />
                          التحديات والألعاب التعليمية
                        </span>
                      )}
                      {t.mode === "GROUP_MEMORIZATION" && (
                        <span className="text-emerald-500 flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5" />
                          جلسة الحفظ والاسترجاع النشط
                        </span>
                      )}
                    </div>

                    {/* Table Title */}
                    <h3 className="text-sm sm:text-base font-black text-theme-text mb-2 line-clamp-2 leading-snug group-hover:text-purple-500 transition-colors">
                      {t.title}
                    </h3>

                    {/* Lesson / Subject */}
                    <div className="text-xs text-theme-muted mb-4 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-surface-soft border border-theme text-[11px] font-bold text-theme-secondary">
                        {t.subjectId}
                      </span>
                      <span className="truncate">{t.lesson}</span>
                    </div>

                    {/* Seated Avatars preview */}
                    <div className="flex items-center gap-1 mb-4">
                      {t.seats.map((seat, idx) => (
                        <div
                          key={idx}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs border ${
                            seat
                              ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                              : "bg-surface-soft border-dashed border-theme text-theme-muted"
                          }`}
                          title={seat ? seat.studentName : "مقعد شاغر"}
                        >
                          {seat ? seat.avatar : "+"}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-theme/60 flex items-center justify-between gap-2">
                    {isMyStream ? (
                      <Link href={`/campus/table/${t.id}`} className="flex-1">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full gap-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700"
                        >
                          <span>انضم للمجلس 🏛️</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/campus/table/${t.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5 text-xs font-bold text-theme-muted hover:text-theme-text"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة ومشاهدة 👁️</span>
                        </Button>
                      </Link>
                    )}

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={(e) => handleShareInvite(e, t.id)}
                      className="p-2 rounded-xl bg-surface-soft hover:bg-surface-elevated border border-theme text-theme-muted hover:text-theme-text transition-all"
                      title="مشاركة رابط الطاولة"
                    >
                      {copiedTableId === t.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredTables.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-surface border border-theme text-theme-muted">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-40 text-purple-500" />
              <h3 className="text-base font-bold text-theme-text mb-1">لا توجد طاولات تطابق البحث</h3>
              <p className="text-xs mb-4">كن أول من يفتح طاولة مذاكرة لزملائه في هذه الشعبة!</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء أول طاولة الآن</span>
              </Button>
            </div>
          )}
        </div>

        {/* Modal */}
        <CreateTableModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          userStream={studentStream}
          onCreate={handleCreateTable}
        />
      </CampusAccessGate>
    </AppShell>
  );
}
