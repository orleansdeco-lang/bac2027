"use client";

import React, { useState } from "react";
import { X, Sparkles, BookOpen, Lightbulb, AlertTriangle, Send } from "lucide-react";
import { StreamId, SubjectId } from "@/types/education";
import { CampusPostType } from "@/types/campus";
import { Button } from "@/components/ui/Button";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStream: StreamId;
  onCreate: (params: {
    type: CampusPostType;
    title: string;
    content: string;
    stream: StreamId | "ALL";
    subjectId: SubjectId | "ALL";
    lesson: string;
    tags: string[];
  }) => void;
}

const POST_TYPES: { id: CampusPostType; label: string; desc: string; icon: any }[] = [
  {
    id: "EXPERIENCE",
    label: "تجارب ونصائح 🌟",
    desc: "طريقة مذاكرة، تنظيم الوقت، التعامل مع الضغط",
    icon: Lightbulb,
  },
  {
    id: "SUMMARY",
    label: "ملخصات ودروس 📚",
    desc: "خرائط ذهنية، جداول مقارنة، مخططات شاملة",
    icon: BookOpen,
  },
  {
    id: "TRICKY_EXAM_PROBLEM",
    label: "أفكار تمارين وفخاخ ⚠️",
    desc: "فخاخ وزارية، أخطاء شائعة في سلم التنقيط",
    icon: AlertTriangle,
  },
];

export function CreatePostModal({
  isOpen,
  onClose,
  userStream,
  onCreate,
}: CreatePostModalProps) {
  const [type, setType] = useState<CampusPostType>("EXPERIENCE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [stream, setStream] = useState<StreamId | "ALL">(userStream || "sciences_exp");
  const [subjectId, setSubjectId] = useState<SubjectId | "ALL">("natural_sciences");
  const [lesson, setLesson] = useState("");
  const [tagInput, setTagInput] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagInput
      .split(/[,\s#]+/)
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    onCreate({
      type,
      title: title.trim(),
      content: content.trim(),
      stream,
      subjectId,
      lesson: lesson.trim() || "عام",
      tags: tags.length > 0 ? tags : ["بكالوريا"],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-xl bg-surface border border-theme rounded-3xl shadow-2xl p-6 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-theme">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-theme-text font-sans">
                شارك تجربة أو ملخصاً في بنك المعرفة 🏛️
              </h2>
              <p className="text-xs text-theme-muted">
                ساعد زملاءك في البكالوريا بخبرتك وفخاخ الدروس
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-theme-muted hover:text-theme-text hover:bg-surface-elevated transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Post Type */}
          <div>
            <label className="block text-xs font-bold text-theme-secondary mb-1.5">
              نوع المشاركة:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {POST_TYPES.map((pt) => {
                const Icon = pt.icon;
                const isSelected = type === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setType(pt.id)}
                    className={`p-2.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/10 text-purple-500 shadow-sm"
                        : "border-theme bg-surface-soft text-theme-muted hover:text-theme-text"
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-xs font-bold">{pt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-theme-secondary mb-1">
              عنوان المشاركة:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: فخ خطير في حساب ثابت التوازن في الكيمياء"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft border border-theme text-xs sm:text-sm text-theme-text focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Lesson & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-theme-secondary mb-1">
                الدرس أو الوحدة:
              </label>
              <input
                type="text"
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                placeholder="مثال: الظواهر الكهربائية"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-theme text-xs text-theme-text focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-theme-secondary mb-1">
                الوسوم (هاشتاغ):
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="مثال: فيزياء, فخاخ, بكالوريا"
                className="w-full px-3 py-2 rounded-xl bg-surface-soft border border-theme text-xs text-theme-text focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-theme-secondary mb-1">
              المحتوى والشرح التفصيلي:
            </label>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب خلاصة تجربتك، نصيحتك، أو تفكيك الفخ مع التنبيه للأخطاء الشائعة..."
              className="w-full p-3 rounded-2xl bg-surface-soft border border-theme text-xs sm:text-sm text-theme-text focus:outline-none focus:border-purple-500 leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-theme">
            <Button variant="ghost" size="md" type="button" onClick={onClose}>
              إلغاء
            </Button>
            <Button variant="primary" size="md" type="submit" className="gap-2">
              <Send className="w-4 h-4" />
              <span>نشر في بنك المعرفة</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
