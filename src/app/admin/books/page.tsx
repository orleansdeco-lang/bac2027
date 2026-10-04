"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/lib/admin/client";
import { Book, BookCategory, BookInput } from "@/types/book";
import {
  LIBRARY_STREAMS,
  LIBRARY_SUBJECTS,
  LIBRARY_CATEGORIES,
  getCategoryMeta,
  getSubjectMeta,
} from "@/lib/constants/library";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Search,
  Filter,
  Eye,
  RefreshCw,
  X,
  FileText,
  Upload,
  Layers,
  Sparkles,
} from "lucide-react";

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  // Modal form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Form values
  const [formData, setFormData] = useState<BookInput>({
    title: "",
    author: "",
    category: "professor_series",
    subject: "physics",
    streams: ["scientific", "math_tech", "math"],
    cover_url: "",
    file_url: "",
    file_size: "35 MB",
    pages_count: 200,
    year_edition: "2025",
    is_featured: false,
  });

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedSubject !== "all") params.set("subject", selectedSubject);

      const res = await adminFetch(`/api/admin/books?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.books)) {
        setBooks(data.books);
      } else {
        setError(data.error || "فشل تحميل بيانات الكتب");
      }
    } catch (err: any) {
      setError(err?.message || "خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSubject]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleOpenAdd = () => {
    setEditingBookId(null);
    setFormData({
      title: "",
      author: "",
      category: "professor_series",
      subject: "physics",
      streams: ["scientific", "math_tech", "math"],
      cover_url: "",
      file_url: "",
      file_size: "35 MB",
      pages_count: 200,
      year_edition: "2025",
      is_featured: false,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBookId(book.id);
    setFormData({
      title: book.title,
      author: book.author || "",
      category: book.category,
      subject: book.subject,
      streams: [...book.streams],
      cover_url: book.cover_url || "",
      file_url: book.file_url,
      file_size: book.file_size || "",
      pages_count: book.pages_count || undefined,
      year_edition: book.year_edition || "2025",
      is_featured: book.is_featured,
    });
    setIsFormOpen(true);
  };

  const handleToggleStream = (streamId: string) => {
    setFormData((prev) => {
      const exists = prev.streams.includes(streamId);
      if (exists) {
        return { ...prev, streams: prev.streams.filter((s) => s !== streamId) };
      } else {
        return { ...prev, streams: [...prev.streams, streamId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (editingBookId) {
        // Update existing book
        const res = await adminFetch(`/api/admin/books/${editingBookId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setSuccessMessage("تم تعديل المرجع بنجاح!");
          setIsFormOpen(false);
          loadBooks();
        } else {
          setError(data.error || "فشل تعديل المرجع");
        }
      } else {
        // Create new book
        const res = await adminFetch("/api/admin/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setSuccessMessage("تمت إضافة المرجع الجديد بنجاح إلى المكتبة الرقمية!");
          setIsFormOpen(false);
          loadBooks();
        } else {
          setError(data.error || "فشل إضافة المرجع");
        }
      }
    } catch (err: any) {
      setError(err?.message || "خطأ أثناء إرسال البيانات");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (book: Book) => {
    if (!confirm(`هل أنت متأكد من حذف المرجع: "${book.title}"؟`)) return;

    try {
      const res = await adminFetch(`/api/admin/books/${book.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage("تم حذف المرجع بنجاح");
        loadBooks();
      } else {
        setError(data.error || "فشل حذف المرجع");
      }
    } catch (err: any) {
      setError(err?.message || "خطأ في الاتصال");
    }
  };

  const handleToggleFeatured = async (book: Book) => {
    try {
      const res = await adminFetch(`/api/admin/books/${book.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: !book.is_featured }),
      });
      const data = await res.json();
      if (data.success) {
        setBooks((prev) =>
          prev.map((b) => (b.id === book.id ? { ...b, is_featured: !b.is_featured } : b))
        );
      }
    } catch {}
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              إدارة المكتبة الرقمية والمراجع الوطنية
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            إضافة وتعديل الكتب المدرسية، سلاسل كبار الأساتذة، والملخصات لشهادة البكالوريا
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadBooks}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D1526] border border-[#1E293B] text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مرجع جديد</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="mr-auto text-emerald-400 hover:text-emerald-300"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="mr-auto text-rose-400 hover:text-rose-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0D1526] p-4 rounded-2xl border border-[#1E293B]">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="بحث بالعنوان أو الأستاذ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
        >
          {LIBRARY_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Subject */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
        >
          {LIBRARY_SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Books Table */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-[#080D1A] text-slate-400 font-semibold border-b border-[#1E293B]">
              <tr>
                <th className="p-3.5">المرجع / الغلاف</th>
                <th className="p-3.5">الأستاذ / المصدر</th>
                <th className="p-3.5">التصنيف</th>
                <th className="p-3.5">المادة</th>
                <th className="p-3.5">الشعب</th>
                <th className="p-3.5">الحجم / الطبعة</th>
                <th className="p-3.5">التحميلات</th>
                <th className="p-3.5">مميز ⭐</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60">
              {loading && books.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    جاري تحميل الكتب...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    لا توجد مراجع تطابق البحث.
                  </td>
                </tr>
              ) : (
                books.map((book) => {
                  const cat = getCategoryMeta(book.category);
                  const sub = getSubjectMeta(book.subject);

                  return (
                    <tr key={book.id} className="hover:bg-slate-800/20 transition">
                      {/* Cover & Title */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {book.cover_url ? (
                            <img
                              src={book.cover_url}
                              alt={book.title}
                              className="w-9 h-12 object-cover rounded-md border border-[#1E293B] shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-12 rounded-md bg-[#080D1A] border border-[#1E293B] flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-xs">
                            <div className="font-bold text-slate-100 truncate" title={book.title}>
                              {book.title}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              ID: {book.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="p-3.5 font-medium text-slate-300 truncate max-w-[140px]">
                        {book.author || "وزارة التربية"}
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cat.badgeClasses}`}>
                          {cat.badgeLabel}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="p-3.5">
                        <span className="font-medium text-slate-300">
                          {sub?.icon} {sub?.label || book.subject}
                        </span>
                      </td>

                      {/* Streams */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {book.streams.slice(0, 2).map((s, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-[#080D1A] border border-[#1E293B] text-[10px] text-slate-400">
                              {LIBRARY_STREAMS.find((ls) => ls.id === s)?.code || s}
                            </span>
                          ))}
                          {book.streams.length > 2 && (
                            <span className="text-[10px] text-slate-500">
                              +{book.streams.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Size / Edition */}
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        <div>{book.file_size || "غير محدد"}</div>
                        <div className="text-[10px] text-slate-500">{book.year_edition}</div>
                      </td>

                      {/* Downloads */}
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        {book.downloads_count}
                      </td>

                      {/* Featured Toggle */}
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(book)}
                          className={`p-1.5 rounded-lg border transition ${
                            book.is_featured
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                              : "bg-[#080D1A] border-[#1E293B] text-slate-600 hover:text-slate-400"
                          }`}
                          title="تبديل الحالة المميزة"
                        >
                          <Star className={`w-4 h-4 ${book.is_featured ? "fill-current" : ""}`} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <a
                            href={book.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#080D1A] border border-[#1E293B] text-slate-400 hover:text-indigo-400 transition"
                            title="معاينة الملف"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(book)}
                            className="p-1.5 rounded-lg bg-[#080D1A] border border-[#1E293B] text-slate-400 hover:text-amber-400 transition cursor-pointer"
                            title="تعديل المرجع"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(book)}
                            className="p-1.5 rounded-lg bg-[#080D1A] border border-[#1E293B] text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="حذف المرجع"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Book Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 space-y-6 text-slate-100 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold">
                  {editingBookId ? "تعديل بيانات المرجع" : "إضافة مرجع جديد إلى المكتبة"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Title & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    عنوان المرجع أو السلسلة <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: تأشيرة النجاح في الفيزياء - الوحدة الأولى"
                    className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    المؤلف / الأستاذ / دار النشر
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="مثال: الأستاذ تومي / سلسلة الهباج"
                    className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row 2: Category & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    تصنيف المرجع <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as BookCategory })}
                    className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  >
                    {LIBRARY_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    المادة الدراسية <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  >
                    {LIBRARY_SUBJECTS.filter((s) => s.id !== "all").map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Streams Multi-Select Checkboxes */}
              <div className="space-y-2 p-3 bg-[#080D1A] border border-[#1E293B] rounded-2xl">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>الشعب المعنية بالمرجع <span className="text-rose-400">*</span></span>
                  <span className="text-[11px] text-slate-500">اختر شعبة أو أكثر</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LIBRARY_STREAMS.filter((s) => s.id !== "all").map((stream) => {
                    const isChecked = formData.streams.includes(stream.id);
                    return (
                      <label
                        key={stream.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                          isChecked
                            ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-semibold"
                            : "bg-[#0D1526] border-[#1E293B] text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStream(stream.id)}
                          className="accent-indigo-500"
                        />
                        <span>{stream.name_ar}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: File Size, Pages, Year Edition */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    الحجم التقريبي (مثال: 35 MB)
                  </label>
                  <input
                    type="text"
                    value={formData.file_size || ""}
                    onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                    placeholder="35 MB"
                    className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    عدد الصفحات (اختياري)
                  </label>
                  <input
                    type="number"
                    value={formData.pages_count || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, pages_count: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                    placeholder="215"
                    className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    سنة الطبعة
                  </label>
                  <input
                    type="text"
                    value={formData.year_edition || ""}
                    onChange={(e) => setFormData({ ...formData, year_edition: e.target.value })}
                    placeholder="2025"
                    className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row 5: Cover URL & File PDF URL */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    رابط ملف الـ PDF المباشر <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    placeholder="https://.../book.pdf"
                    className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>رابط صورة الغلاف (WebP / JPG / PNG)</span>
                    <span className="text-[11px] text-slate-500">اختياري، يفضل نسبة 3:4</span>
                  </label>
                  <input
                    type="url"
                    value={formData.cover_url || ""}
                    onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                    placeholder="https://.../cover.webp"
                    className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Cover Live Preview */}
                {formData.cover_url && (
                  <div className="p-3 bg-[#080D1A] border border-[#1E293B] rounded-2xl flex items-center gap-3">
                    <img
                      src={formData.cover_url}
                      alt="معاينة الغلاف"
                      className="w-12 h-16 object-cover rounded-lg border border-[#1E293B]"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="text-xs text-slate-400">
                      معاينة حية لصورة غلاف المرجع.
                    </div>
                  </div>
                )}
              </div>

              {/* Row 6: Featured Toggle */}
              <label className="flex items-center gap-2 p-3 bg-[#080D1A] border border-[#1E293B] rounded-xl text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="accent-amber-500"
                />
                <span className="font-semibold text-slate-200">
                  تثبيت كمرجع مميز وموصى به لدفعة 2026 ⭐
                </span>
              </label>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#080D1A] hover:bg-[#1E293B] text-slate-400 text-xs font-semibold transition"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition cursor-pointer flex items-center gap-2"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBookId ? "حفظ التعديلات" : "إضافة المرجع الآن"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
